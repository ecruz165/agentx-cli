#!/usr/bin/env node

import { Command } from 'commander';
import { createConfigCommand } from './commands/config';
import { createAliasCommand } from './commands/alias';
import { createExecCommand } from './commands/exec';
import { createInitCommand } from './commands/init';

const packageJson = require('../package.json');

const program = new Command();

program
  .name('agentx')
  .version(packageJson.version)
  .description('AI-Enhanced Enterprise CLI Tool for context-aware development');

// Global options
program.option('--no-color', 'Disable colored output');

// Register commands
program.addCommand(createExecCommand());
program.addCommand(createInitCommand());
program.addCommand(createConfigCommand());
program.addCommand(createAliasCommand());

// Parse and execute
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
