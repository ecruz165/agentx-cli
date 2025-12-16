"use strict";
/**
 * Config command for AgentX CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfigCommand = createConfigCommand;
const commander_1 = require("commander");
const config_1 = require("../config");
const output_1 = require("../utils/output");
const display_1 = require("../utils/display");
/**
 * Create the config command with subcommands
 */
function createConfigCommand() {
    const configCmd = new commander_1.Command('config').description('Manage AgentX configuration');
    // config show
    configCmd
        .command('show')
        .description('Display current configuration')
        .option('-k, --key <key>', 'Show specific configuration key')
        .action((options) => {
        const config = (0, config_1.loadConfig)();
        const configPath = (0, config_1.findConfigPath)();
        if (options.key) {
            const value = config[options.key];
            if (value === undefined) {
                (0, display_1.displayStatus)(`Unknown configuration key: ${options.key}`, 'error');
                console.log(`\nAvailable keys: ${(0, config_1.getConfigKeys)().join(', ')}`);
                process.exit(1);
            }
            console.log(formatValue(value));
            return;
        }
        (0, output_1.printHeader)('AgentX Configuration');
        console.log();
        if (configPath) {
            console.log(output_1.colors.dim(`Config file: ${configPath}`));
        }
        else {
            console.log(output_1.colors.dim('Using default configuration (no config file found)'));
        }
        console.log();
        for (const [key, value] of Object.entries(config)) {
            (0, output_1.printKeyValue)(key, formatValue(value));
        }
    });
    // config set
    configCmd
        .command('set')
        .description('Set a configuration value')
        .argument('<key>', 'Configuration key to set')
        .argument('<value>', 'Value to set')
        .action((key, value) => {
        const validKeys = (0, config_1.getConfigKeys)();
        if (!validKeys.includes(key)) {
            (0, display_1.displayStatus)(`Unknown configuration key: ${key}`, 'error');
            console.log(`\nAvailable keys: ${validKeys.join(', ')}`);
            process.exit(1);
        }
        const { oldValue, newValue } = (0, config_1.updateConfig)(key, value);
        (0, display_1.displayStatus)(`Configuration updated`, 'success');
        console.log();
        console.log(`  ${output_1.colors.cyan(key)}:`);
        console.log(`    ${output_1.colors.red('- ' + formatValue(oldValue))}`);
        console.log(`    ${output_1.colors.green('+ ' + formatValue(newValue))}`);
    });
    // config reset
    configCmd
        .command('reset')
        .description('Reset configuration to defaults')
        .option('-y, --yes', 'Skip confirmation')
        .action((options) => {
        if (!options.yes) {
            console.log(output_1.colors.yellow('This will reset all configuration to defaults.'));
            console.log('Use --yes to confirm.');
            return;
        }
        (0, config_1.resetConfig)();
        (0, display_1.displayStatus)('Configuration reset to defaults', 'success');
    });
    // config path
    configCmd
        .command('path')
        .description('Show configuration file path')
        .action(() => {
        const configPath = (0, config_1.findConfigPath)();
        if (configPath) {
            console.log(configPath);
        }
        else {
            console.log(output_1.colors.dim('No configuration file found'));
            console.log(output_1.colors.dim('Default location: .ai-config/config.json'));
        }
    });
    return configCmd;
}
/**
 * Format a configuration value for display
 */
function formatValue(value) {
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}
//# sourceMappingURL=config.js.map