/**
 * Exec command for AgentX CLI
 * Based on initial-spec.md exec command specification
 *
 * Usage:
 *   agentx exec <alias> "<prompt>"
 *   agentx exec bff "Design a GraphQL schema for user dashboard"
 *   agentx exec bff "Design a GraphQL schema" --verbose
 *   agentx exec bff "Explain this" --files ./src/schema.graphql
 */

import { Command } from 'commander';
import { OutputMode, ResponseOutputFormat } from '../types';
import { getAlias, loadAliases } from '../alias';
import { buildContext, createExecutionSettings } from '../context';
import { displaySettings, displayStatus } from '../utils/display';
import { displayError, displayContextWarning } from '../utils/errors';
import { executeWithProvider } from '../providers';
import { loadConfig } from '../config';
import {
  formatResponse,
  saveResponseToFile,
  getFileExtension,
  ResponseMetadata,
} from '../utils/output-formatter';
import { renderMarkdown } from '../utils/markdown-renderer';
import { generateHTMLPreview, FileContent } from '../utils/html-preview';
import { createAndOpenPreview, getOSName } from '../utils/browser-launcher';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Create the exec command
 */
export function createExecCommand(): Command {
  return new Command('exec')
    .description('Execute AI prompt with context alias')
    .argument('<alias>', 'Context alias to use')
    .argument('<prompt>', 'Prompt to send to AI')
    .option('-v, --verbose', 'Show detailed settings with file list')
    .option('-q, --quiet', 'Show only AI response')
    .option('-f, --files <files...>', 'Additional files to include')
    .option('--max-context <size>', 'Override max context size (bytes)', parseInt)
    .option('--dry-run', 'Show what would be executed without calling AI')
    .option('--file <path>', 'Save output to file')
    .option(
      '--output-format <format>',
      'Output format when saving to file (toon, json, markdown, raw)',
      'markdown'
    )
    .option('--no-format', 'Disable markdown formatting in console output (show raw markdown)')
    .option('--preview', 'Open response in browser with copy-to-clipboard button')
    .action(async (aliasName: string, prompt: string, options) => {
      // Determine output mode
      let mode: OutputMode = 'minimal';
      if (options.verbose) mode = 'verbose';
      if (options.quiet) mode = 'quiet';

      // Load alias
      const alias = await getAlias(aliasName);

      if (!alias) {
        const allAliases = await loadAliases();
        displayError(
          'alias-not-found',
          aliasName,
          allAliases.map((a) => a.name)
        );
        process.exit(1);
      }

      // Build context
      const config = loadConfig();
      const maxContextSize = options.maxContext || config.maxContextSize;

      const context = await buildContext(alias, options.files, {
        maxSize: maxContextSize,
      });

      // Create execution settings
      const settings = createExecutionSettings(alias, context, options.files);

      // Display settings (unless quiet mode)
      displaySettings(settings, mode);

      // Check for context size warning
      if (context.truncated && mode !== 'quiet') {
        displayContextWarning(
          context.files.reduce((sum, f) => sum + f.size, 0),
          maxContextSize
        );
      }

      // Dry run - just show what would happen
      if (options.dryRun) {
        console.log('[Dry Run] Would execute prompt with AI provider.');
        console.log(`[Dry Run] Provider: ${config.provider}`);
        console.log(`[Dry Run] Context: ${context.files.length} files`);
        console.log(`[Dry Run] Prompt: "${prompt}"`);
        return;
      }

      // Execute with provider
      const result = await executeWithProvider(prompt, context.content);

      if (!result.success) {
        displayError('provider-error', config.provider, result.error);
        process.exit(1);
      }

      const response = result.response || '';

      // Prepare metadata (used by both file output and preview)
      const metadata: ResponseMetadata = {
        timestamp: new Date().toISOString(),
        provider: config.provider,
        model: config.model,
        alias: aliasName,
        prompt: prompt,
        contextFiles: context.files.map((f) => f.path),
        version: settings.version,
        contextSize: context.totalSize,
        config: {
          knowledgeBase: config.knowledgeBase,
          maxContextSize: maxContextSize,
          contextFormat: config.contextFormat,
          cacheEnabled: config.cacheEnabled,
        },
      };

      // Handle browser preview if --preview flag is provided
      if (options.preview) {
        try {
          // Read file contents for embedding in preview
          const fileContents: FileContent[] = [];
          const basePath = config.knowledgeBase.replace(/^~/, os.homedir());

          for (const filePath of metadata.contextFiles) {
            try {
              const fullPath = path.join(basePath, filePath);
              const content = fs.readFileSync(fullPath, 'utf-8');
              const stat = fs.statSync(fullPath);

              fileContents.push({
                path: filePath,
                content: content,
                size: stat.size,
              });
            } catch (error) {
              // Skip files that can't be read
              console.warn(`Warning: Could not read file ${filePath}`);
            }
          }

          const htmlContent = generateHTMLPreview(response, metadata, fileContents);
          const previewPath = await createAndOpenPreview(htmlContent);
          displayStatus(`Preview opened in browser (${getOSName()})`, 'success');
          displayStatus(`Temporary file: ${previewPath}`, 'info');
        } catch (error) {
          displayError(
            'preview-error',
            'browser',
            error instanceof Error ? error.message : 'Unknown error'
          );
          // Don't exit - still show console output
        }
      }

      // Handle file output if --file flag is provided
      if (options.file) {
        const outputFormat = (options.outputFormat || config.outputFormat || 'markdown') as ResponseOutputFormat;

        // Validate output format
        const validFormats: ResponseOutputFormat[] = ['toon', 'json', 'markdown', 'raw'];
        if (!validFormats.includes(outputFormat)) {
          displayError(
            'invalid-format',
            outputFormat,
            `Valid formats: ${validFormats.join(', ')}`
          );
          process.exit(1);
        }

        // Format response
        const formattedContent = formatResponse(response, outputFormat, metadata);

        // Determine output path
        let outputPath = options.file;

        // If only a filename is provided (no directory), use default output location
        if (!path.isAbsolute(outputPath) && !outputPath.includes(path.sep)) {
          const defaultLocation = config.outputLocation || './agentx-output';
          outputPath = path.join(defaultLocation, outputPath);
        }

        // Add extension if not provided
        const ext = path.extname(outputPath);
        if (!ext) {
          outputPath += getFileExtension(outputFormat);
        }

        // Save to file
        try {
          saveResponseToFile(formattedContent, outputPath);
          displayStatus(`Response saved to ${outputPath}`, 'success');
        } catch (error) {
          displayError(
            'file-write-error',
            outputPath,
            error instanceof Error ? error.message : 'Unknown error'
          );
          process.exit(1);
        }

        // Also display to console unless quiet mode
        if (mode !== 'quiet') {
          console.log('\n--- Response ---\n');
          // Render markdown for better readability (unless --no-format is used)
          const formattedResponse = renderMarkdown(response, options.format !== false);
          console.log(formattedResponse);
        }
      }

      // Normal console output (if not using --file or if file output was done)
      // Skip if quiet mode or if only preview was requested
      if (!options.file && mode !== 'quiet') {
        // Render markdown for better readability (unless --no-format is used)
        const formattedResponse = renderMarkdown(response, options.format !== false);
        console.log(formattedResponse);
      }
    });
}
