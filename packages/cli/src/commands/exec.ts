/**
 * Exec command for AgentX CLI
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import os from 'os';
import readline from 'readline';
import {
  OutputMode,
  ResponseOutputFormat,
  getAlias,
  loadAliases,
  buildContext,
  createExecutionSettings,
  executeWithProvider,
  loadConfig,
  getIntention,
  getIntentionsForAlias,
  gatherRequirements,
  updateRequirements,
  formatMissingRequirements,
  IntentionDefinition,
  RequirementGatheringResult,
} from '@agentx/core';
import { displaySettings, displayStatus } from '../utils/display';
import { displayError, displayContextWarning } from '../utils/errors';
import {
  formatResponse,
  saveResponseToFile,
  getFileExtension,
  ResponseMetadata,
} from '../utils/output-formatter';
import { renderMarkdown } from '../utils/markdown-renderer';
import { generateHTMLPreview, FileContent } from '../utils/html-preview';
import { createAndOpenPreview, getOSName } from '../utils/browser-launcher';

/**
 * Create the exec command
 */
export function createExecCommand(version: string): Command {
  return new Command('exec')
    .description('Execute AI prompt with context alias')
    .argument('<alias>', 'Context alias to use')
    .argument('<prompt>', 'Prompt to send to AI')
    .option('-i, --intention <intention>', 'Intention to use (e.g., create-new, add-field, integrate, refactor)')
    .option('--list-intentions', 'List available intentions for the alias')
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
    .option('--no-format', 'Disable markdown formatting in console output')
    .option('--browser', 'Open response in browser with copy-to-clipboard button')
    .action(async (aliasName: string, prompt: string, options) => {
      let mode: OutputMode = 'minimal';
      if (options.verbose) mode = 'verbose';
      if (options.quiet) mode = 'quiet';

      const alias = await getAlias(aliasName);

      if (!alias) {
        const allAliases = await loadAliases();
        displayError(
          'alias-not-found',
          version,
          aliasName,
          allAliases.map((a) => a.name)
        );
        process.exit(1);
      }

      // Handle --list-intentions
      if (options.listIntentions) {
        const intentions = await getIntentionsForAlias(aliasName);
        if (intentions.length === 0) {
          console.log('No intentions available for this alias.');
        } else {
          console.log(`\nAvailable intentions for "${aliasName}":\n`);
          for (const intent of intentions) {
            console.log(`  ${intent.id.padEnd(15)} - ${intent.description}`);
          }
          console.log('\nUsage: agentx exec <alias> --intention <intention> "<prompt>"');
        }
        return;
      }

      // Handle intention-based execution
      let finalPrompt = prompt;
      if (options.intention) {
        const intention = await getIntention(options.intention);
        if (!intention) {
          const intentions = await getIntentionsForAlias(aliasName);
          console.error(`\nError: Intention "${options.intention}" not found.`);
          if (intentions.length > 0) {
            console.error('\nAvailable intentions:');
            for (const intent of intentions) {
              console.error(`  ${intent.id}`);
            }
          }
          process.exit(1);
        }

        // Gather requirements from prompt
        const result = gatherRequirements(prompt, intention, aliasName);

        if (!result.complete) {
          // Interactive mode - ask for missing requirements
          console.log(`\n📋 Intention: ${intention.name}\n`);
          console.log(formatMissingRequirements(result.missing));
          console.log('');

          const updates = await promptForMissingRequirements(result);
          const updatedResult = updateRequirements(result, updates, aliasName);

          if (!updatedResult.complete) {
            console.error('\nError: Could not gather all required information.');
            process.exit(1);
          }

          finalPrompt = updatedResult.refinedPrompt || prompt;
        } else {
          finalPrompt = result.refinedPrompt || prompt;
        }

        if (mode !== 'quiet') {
          console.log('\n✅ Requirements gathered. Executing with refined prompt...\n');
        }
      }

      const config = loadConfig();
      const maxContextSize = options.maxContext || config.maxContextSize;

      const context = await buildContext(alias, options.files, {
        maxSize: maxContextSize,
      });

      const settings = createExecutionSettings(alias, context, version, options.files);

      displaySettings(settings, mode);

      if (context.truncated && mode !== 'quiet') {
        displayContextWarning(
          context.files.reduce((sum, f) => sum + f.size, 0),
          maxContextSize,
          version
        );
      }

      if (options.dryRun) {
        console.log('[Dry Run] Would execute prompt with AI provider.');
        if (options.intention) {
          console.log(`[Dry Run] Intention: ${options.intention}`);
          console.log(`[Dry Run] Refined Prompt:\n${finalPrompt}`);
        }
        console.log(`[Dry Run] Provider: ${config.provider}`);
        console.log(`[Dry Run] Context: ${context.files.length} files`);
        console.log(`[Dry Run] Prompt: "${finalPrompt}"`);
        return;
      }

      const execResult = await executeWithProvider(finalPrompt, context.content);

      if (!execResult.success) {
        displayError('provider-error', version, config.provider, execResult.error);
        process.exit(1);
      }

      const response = execResult.response || '';

      const metadata: ResponseMetadata = {
        timestamp: new Date().toISOString(),
        provider: config.provider,
        model: config.model,
        alias: aliasName,
        prompt: finalPrompt,
        intention: options.intention,
        contextFiles: context.files.map((f) => f.path),
        version: version,
        contextSize: context.totalSize,
        config: {
          knowledgeBase: config.knowledgeBase,
          maxContextSize: maxContextSize,
          contextFormat: config.contextFormat,
          cacheEnabled: config.cacheEnabled,
        },
      };

      if (options.browser) {
        try {
          const fileContents: FileContent[] = [];
          const basePath = config.knowledgeBase.replace(/^~/, os.homedir());

          for (const filePath of metadata.contextFiles) {
            try {
              const fullPath = path.join(basePath, filePath);
              const content = fs.readFileSync(fullPath, 'utf-8');
              const stat = fs.statSync(fullPath);
              fileContents.push({ path: filePath, content, size: stat.size });
            } catch {
              console.warn(`Warning: Could not read file ${filePath}`);
            }
          }

          const htmlContent = generateHTMLPreview(response, metadata, fileContents);
          const browserPath = await createAndOpenPreview(htmlContent);
          displayStatus(`Opened in browser (${getOSName()})`, 'success');
          displayStatus(`Temporary file: ${browserPath}`, 'info');
        } catch (error) {
          displayError(
            'browser-error',
            version,
            'browser',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      if (options.file) {
        const outputFormat = (options.outputFormat || config.outputFormat || 'markdown') as ResponseOutputFormat;
        const validFormats: ResponseOutputFormat[] = ['toon', 'json', 'markdown', 'raw'];
        
        if (!validFormats.includes(outputFormat)) {
          displayError('invalid-format', version, outputFormat, `Valid formats: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        const formattedContent = formatResponse(response, outputFormat, metadata);
        let outputPath = options.file;

        if (!path.isAbsolute(outputPath) && !outputPath.includes(path.sep)) {
          const defaultLocation = config.outputLocation || './agentx-output';
          outputPath = path.join(defaultLocation, outputPath);
        }

        const ext = path.extname(outputPath);
        if (!ext) {
          outputPath += getFileExtension(outputFormat);
        }

        try {
          saveResponseToFile(formattedContent, outputPath);
          displayStatus(`Response saved to ${outputPath}`, 'success');
        } catch (error) {
          displayError('file-write-error', version, outputPath, error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }

        // Also display to console unless quiet mode
        if (mode !== 'quiet') {
          console.log('\n--- Response ---\n');
          const formattedResponse = renderMarkdown(response, options.format !== false);
          console.log(formattedResponse);
        }
      }

      // Normal console output (if not using --file)
      // Skip if quiet mode or if only browser output was requested
      if (!options.file && mode !== 'quiet') {
        const formattedResponse = renderMarkdown(response, options.format !== false);
        console.log(formattedResponse);
      }
    });
}

/**
 * Prompt user for missing requirements interactively
 */
async function promptForMissingRequirements(
  result: RequirementGatheringResult
): Promise<Record<string, string | string[] | boolean>> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  };

  const updates: Record<string, string | string[] | boolean> = {};

  for (const req of result.missing) {
    let promptText = `? ${req.question}`;
    if (req.type === 'enum' && req.options) {
      promptText += ` (${req.options.join('/')})`;
    }
    if (req.default) {
      promptText += ` [${req.default}]`;
    }
    promptText += ': ';

    const answer = await question(promptText);

    if (answer.trim()) {
      if (req.type === 'array') {
        // Split by comma for array types
        updates[req.id] = answer.split(',').map((s) => s.trim());
      } else if (req.type === 'boolean') {
        updates[req.id] = ['true', 'yes', 'y', '1'].includes(answer.toLowerCase());
      } else {
        updates[req.id] = answer.trim();
      }
    } else if (req.default) {
      updates[req.id] = req.default;
    }
  }

  rl.close();
  return updates;
}

