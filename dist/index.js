#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_1 = require("./commands/config");
const alias_1 = require("./commands/alias");
const exec_1 = require("./commands/exec");
const init_1 = require("./commands/init");
const packageJson = require('../package.json');
const program = new commander_1.Command();
program
    .name('agentx')
    .version(packageJson.version)
    .description('AI-Enhanced Enterprise CLI Tool for context-aware development');
// Global options
program.option('--no-color', 'Disable colored output');
// Register commands
program.addCommand((0, exec_1.createExecCommand)());
program.addCommand((0, init_1.createInitCommand)());
program.addCommand((0, config_1.createConfigCommand)());
program.addCommand((0, alias_1.createAliasCommand)());
// Parse and execute
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map