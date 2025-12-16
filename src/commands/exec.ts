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
import { OutputMode } from '../types';
import { getAlias, loadAliases } from '../alias';
import { buildContext, createExecutionSettings } from '../context';
import { displaySettings } from '../utils/display';
import { displayError, displayContextWarning } from '../utils/errors';
import { executeWithProvider } from '../providers';
import { loadConfig } from '../config';

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

      if (result.success) {
        console.log(result.response);
      } else {
        displayError('provider-error', config.provider, result.error);
        process.exit(1);
      }
    });
}
