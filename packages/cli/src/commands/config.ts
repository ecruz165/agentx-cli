/**
 * Config command for AgentX CLI
 */

import { Command } from 'commander';
import {
  loadConfig,
  updateConfig,
  getConfigKeys,
  resetConfig,
  findConfigPath,
} from '@agentx/core';
import { colors, printHeader, printKeyValue } from '../utils/output';
import { displayStatus } from '../utils/display';

/**
 * Create the config command with subcommands
 */
export function createConfigCommand(): Command {
  const configCmd = new Command('config').description(
    'Manage AgentX configuration'
  );

  // config show
  configCmd
    .command('show')
    .description('Display current configuration')
    .option('-k, --key <key>', 'Show specific configuration key')
    .action((options) => {
      const config = loadConfig();
      const configPath = findConfigPath();

      if (options.key) {
        const value = (config as unknown as Record<string, unknown>)[options.key];
        if (value === undefined) {
          displayStatus(`Unknown configuration key: ${options.key}`, 'error');
          console.log(`\nAvailable keys: ${getConfigKeys().join(', ')}`);
          process.exit(1);
        }
        console.log(formatValue(value));
        return;
      }

      printHeader('AgentX Configuration');
      console.log();

      if (configPath) {
        console.log(colors.dim(`Config file: ${configPath}`));
      } else {
        console.log(colors.dim('Using default configuration (no config file found)'));
      }
      console.log();

      for (const [key, value] of Object.entries(config)) {
        printKeyValue(key, formatValue(value));
      }
    });

  // config set
  configCmd
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key to set')
    .argument('<value>', 'Value to set')
    .action((key, value) => {
      const validKeys = getConfigKeys();

      if (!validKeys.includes(key)) {
        displayStatus(`Unknown configuration key: ${key}`, 'error');
        console.log(`\nAvailable keys: ${validKeys.join(', ')}`);
        process.exit(1);
      }

      const { oldValue, newValue } = updateConfig(key, value);

      displayStatus(`Configuration updated`, 'success');
      console.log();
      console.log(`  ${colors.cyan(key)}:`);
      console.log(`    ${colors.red('- ' + formatValue(oldValue))}`);
      console.log(`    ${colors.green('+ ' + formatValue(newValue))}`);
    });

  // config reset
  configCmd
    .command('reset')
    .description('Reset configuration to defaults')
    .option('-y, --yes', 'Skip confirmation')
    .action((options) => {
      if (!options.yes) {
        console.log(colors.yellow('This will reset all configuration to defaults.'));
        console.log('Use --yes to confirm.');
        return;
      }

      resetConfig();
      displayStatus('Configuration reset to defaults', 'success');
    });

  // config path
  configCmd
    .command('path')
    .description('Show configuration file path')
    .action(() => {
      const configPath = findConfigPath();
      if (configPath) {
        console.log(configPath);
      } else {
        console.log(colors.dim('No configuration file found'));
        console.log(colors.dim('Default location: .ai-config/config.json'));
      }
    });

  return configCmd;
}

/**
 * Format a configuration value for display
 */
function formatValue(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

