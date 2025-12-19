/**
 * Error handling and display utilities for AgentX CLI
 */

import { loadConfig } from '@agentx/core';
import { colors, formatSize } from './output';

/**
 * Error types supported by the CLI
 */
export type ErrorType =
  | 'alias-not-found'
  | 'provider-error'
  | 'context-too-large'
  | 'config-error'
  | 'file-not-found'
  | 'invalid-argument'
  | 'framework-not-found'
  | 'template-not-found'
  | 'invalid-format'
  | 'file-write-error'
  | 'preview-error';

/**
 * Display formatted error output
 */
export function displayError(type: ErrorType, version: string, ...args: unknown[]): void {
  console.log('');
  console.log(`agentx v${version} | ${colors.red('error')}`);
  console.log('');

  switch (type) {
    case 'alias-not-found': {
      const [aliasName, availableAliases] = args as [string, string[]];
      console.log(`  Alias '${colors.cyan(aliasName as string)}' not found.`);
      console.log('');
      if (availableAliases && availableAliases.length > 0) {
        console.log('  Available aliases:');
        console.log(`    ${availableAliases.join(', ')}`);
        console.log('');
      }
      console.log(`  Run '${colors.cyan('agentx alias list')}' for details.`);
      break;
    }

    case 'provider-error': {
      const [provider, message] = args as [string, string?];
      console.log(`  Error: Failed to connect to ${colors.cyan(provider)} provider.`);
      if (message) {
        console.log(`  ${message}`);
      }
      console.log('');
      if (provider === 'copilot') {
        console.log('  Check that GitHub Copilot CLI is installed and authenticated:');
        console.log(`    ${colors.dim('gh auth login')}`);
        console.log(`    ${colors.dim('gh extension install github/gh-copilot')}`);
      } else if (provider === 'claude') {
        console.log('  Check that Claude API key is configured:');
        console.log(`    ${colors.dim('agentx config set claudeApiKey <your-key>')}`);
      } else if (provider === 'openai') {
        console.log('  Check that OpenAI API key is configured:');
        console.log(`    ${colors.dim('agentx config set openaiApiKey <your-key>')}`);
      }
      break;
    }

    case 'context-too-large': {
      const [currentSize] = args as [number];
      const config = loadConfig();
      console.log(
        `  ${colors.yellow('Warning:')} Context size (${formatSize(currentSize)}) exceeds limit (${formatSize(config.maxContextSize)}).`
      );
      console.log('');
      console.log('  Options:');
      console.log(`    ${colors.dim('•')} Use ${colors.cyan('--max-context')} to increase limit`);
      console.log(`    ${colors.dim('•')} Use a more specific alias`);
      console.log(`    ${colors.dim('•')} Exclude large files with ${colors.cyan('--exclude')}`);
      console.log('');
      console.log(
        `  Proceeding with truncated context (${formatSize(config.maxContextSize)})...`
      );
      break;
    }

    case 'config-error': {
      const [message] = args as [string];
      console.log(`  Configuration error: ${message}`);
      console.log('');
      console.log(`  Run '${colors.cyan('agentx config show')}' to view current configuration.`);
      break;
    }

    case 'file-not-found': {
      const [filePath] = args as [string];
      console.log(`  File not found: ${colors.cyan(filePath)}`);
      console.log('');
      console.log('  Please verify the file path exists and is accessible.');
      break;
    }

    case 'invalid-argument': {
      const [argName, message] = args as [string, string?];
      console.log(`  Invalid argument: ${colors.cyan(argName)}`);
      if (message) {
        console.log(`  ${message}`);
      }
      console.log('');
      console.log(`  Run '${colors.cyan('agentx --help')}' for usage information.`);
      break;
    }

    case 'framework-not-found': {
      const [frameworkName, availableFrameworks] = args as [string, string[]];
      console.log(`  Framework '${colors.cyan(frameworkName)}' not found.`);
      console.log('');
      if (availableFrameworks && availableFrameworks.length > 0) {
        console.log('  Available frameworks:');
        console.log(`    ${availableFrameworks.join(', ')}`);
      }
      break;
    }

    case 'template-not-found': {
      const [templateName, frameworkName, availableTemplates] = args as [
        string,
        string,
        string[]
      ];
      console.log(
        `  Template '${colors.cyan(templateName)}' not found in framework '${frameworkName}'.`
      );
      console.log('');
      if (availableTemplates && availableTemplates.length > 0) {
        console.log('  Available templates:');
        console.log(`    ${availableTemplates.join(', ')}`);
      }
      break;
    }

    case 'invalid-format': {
      const [format, message] = args as [string, string?];
      console.log(`  Invalid output format: ${colors.cyan(format)}`);
      if (message) {
        console.log(`  ${message}`);
      }
      console.log('');
      console.log(`  Run '${colors.cyan('agentx exec --help')}' for valid formats.`);
      break;
    }

    case 'file-write-error': {
      const [filePath, message] = args as [string, string?];
      console.log(`  Failed to write file: ${colors.cyan(filePath)}`);
      if (message) {
        console.log(`  ${message}`);
      }
      console.log('');
      console.log('  Please verify you have write permissions for this location.');
      break;
    }

    case 'preview-error': {
      const [target, message] = args as [string, string?];
      console.log(`  Failed to open preview in ${colors.cyan(target)}`);
      if (message) {
        console.log(`  ${message}`);
      }
      console.log('');
      console.log('  The response will still be displayed in the console.');
      break;
    }

    default:
      console.log(`  An unexpected error occurred.`);
  }

  console.log('');
}

/**
 * Display a warning message
 */
export function displayWarning(message: string, details?: string[]): void {
  console.log(`${colors.yellow('Warning:')} ${message}`);

  if (details && details.length > 0) {
    details.forEach((detail) => {
      console.log(`  ${colors.dim('•')} ${detail}`);
    });
  }
}

/**
 * Display context size warning (non-fatal)
 */
export function displayContextWarning(currentSize: number, maxSize: number, version: string): void {
  const config = loadConfig();

  console.log(
    `agentx v${version} | ${colors.cyan(config.provider)} | ${colors.yellow('warning')}`
  );
  console.log('');
  console.log(
    `  ${colors.yellow('Warning:')} Context size (${formatSize(currentSize)}) exceeds limit (${formatSize(maxSize)}).`
  );
  console.log('');
  console.log('  Options:');
  console.log(`    ${colors.dim('•')} Use ${colors.cyan('--max-context')} to increase limit`);
  console.log(`    ${colors.dim('•')} Use a more specific alias`);
  console.log(`    ${colors.dim('•')} Exclude large files with ${colors.cyan('--exclude')}`);
  console.log('');
  console.log(`  Proceeding with truncated context (${formatSize(maxSize)})...`);
  console.log('');
}

/**
 * Custom error class for AgentX errors
 */
export class AgentXError extends Error {
  public type: ErrorType;
  public details: unknown[];

  constructor(type: ErrorType, message: string, ...details: unknown[]) {
    super(message);
    this.name = 'AgentXError';
    this.type = type;
    this.details = details;
  }

  display(version: string): void {
    displayError(this.type, version, ...this.details);
  }
}

