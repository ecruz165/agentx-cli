"use strict";
/**
 * Error handling and display utilities for AgentX CLI
 * Based on initial-spec.md error output specifications
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentXError = void 0;
exports.displayError = displayError;
exports.displayWarning = displayWarning;
exports.displayContextWarning = displayContextWarning;
const output_1 = require("./output");
const config_1 = require("../config");
const packageJson = require('../../package.json');
/**
 * Display formatted error output
 * Format: agentx v{version} | error
 */
function displayError(type, ...args) {
    const version = packageJson.version;
    console.log('');
    console.log(`agentx v${version} | ${output_1.colors.red('error')}`);
    console.log('');
    switch (type) {
        case 'alias-not-found': {
            const [aliasName, availableAliases] = args;
            console.log(`  Alias '${output_1.colors.cyan(aliasName)}' not found.`);
            console.log('');
            if (availableAliases && availableAliases.length > 0) {
                console.log('  Available aliases:');
                console.log(`    ${availableAliases.join(', ')}`);
                console.log('');
            }
            console.log(`  Run '${output_1.colors.cyan('agentx alias list')}' for details.`);
            break;
        }
        case 'provider-error': {
            const [provider, message] = args;
            console.log(`  Error: Failed to connect to ${output_1.colors.cyan(provider)} provider.`);
            if (message) {
                console.log(`  ${message}`);
            }
            console.log('');
            if (provider === 'copilot') {
                console.log('  Check that GitHub Copilot CLI is installed and authenticated:');
                console.log(`    ${output_1.colors.dim('gh auth login')}`);
                console.log(`    ${output_1.colors.dim('gh extension install github/gh-copilot')}`);
            }
            else if (provider === 'claude') {
                console.log('  Check that Claude API key is configured:');
                console.log(`    ${output_1.colors.dim('agentx config set claudeApiKey <your-key>')}`);
            }
            else if (provider === 'openai') {
                console.log('  Check that OpenAI API key is configured:');
                console.log(`    ${output_1.colors.dim('agentx config set openaiApiKey <your-key>')}`);
            }
            break;
        }
        case 'context-too-large': {
            const [currentSize] = args;
            const config = (0, config_1.loadConfig)();
            console.log(`  ${output_1.colors.yellow('Warning:')} Context size (${(0, output_1.formatSize)(currentSize)}) exceeds limit (${(0, output_1.formatSize)(config.maxContextSize)}).`);
            console.log('');
            console.log('  Options:');
            console.log(`    ${output_1.colors.dim('•')} Use ${output_1.colors.cyan('--max-context')} to increase limit`);
            console.log(`    ${output_1.colors.dim('•')} Use a more specific alias`);
            console.log(`    ${output_1.colors.dim('•')} Exclude large files with ${output_1.colors.cyan('--exclude')}`);
            console.log('');
            console.log(`  Proceeding with truncated context (${(0, output_1.formatSize)(config.maxContextSize)})...`);
            break;
        }
        case 'config-error': {
            const [message] = args;
            console.log(`  Configuration error: ${message}`);
            console.log('');
            console.log(`  Run '${output_1.colors.cyan('agentx config show')}' to view current configuration.`);
            break;
        }
        case 'file-not-found': {
            const [filePath] = args;
            console.log(`  File not found: ${output_1.colors.cyan(filePath)}`);
            console.log('');
            console.log('  Please verify the file path exists and is accessible.');
            break;
        }
        case 'invalid-argument': {
            const [argName, message] = args;
            console.log(`  Invalid argument: ${output_1.colors.cyan(argName)}`);
            if (message) {
                console.log(`  ${message}`);
            }
            console.log('');
            console.log(`  Run '${output_1.colors.cyan('agentx --help')}' for usage information.`);
            break;
        }
        case 'framework-not-found': {
            const [frameworkName, availableFrameworks] = args;
            console.log(`  Framework '${output_1.colors.cyan(frameworkName)}' not found.`);
            console.log('');
            if (availableFrameworks && availableFrameworks.length > 0) {
                console.log('  Available frameworks:');
                console.log(`    ${availableFrameworks.join(', ')}`);
            }
            break;
        }
        case 'template-not-found': {
            const [templateName, frameworkName, availableTemplates] = args;
            console.log(`  Template '${output_1.colors.cyan(templateName)}' not found in framework '${frameworkName}'.`);
            console.log('');
            if (availableTemplates && availableTemplates.length > 0) {
                console.log('  Available templates:');
                console.log(`    ${availableTemplates.join(', ')}`);
            }
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
function displayWarning(message, details) {
    console.log(`${output_1.colors.yellow('Warning:')} ${message}`);
    if (details && details.length > 0) {
        details.forEach((detail) => {
            console.log(`  ${output_1.colors.dim('•')} ${detail}`);
        });
    }
}
/**
 * Display context size warning (non-fatal)
 */
function displayContextWarning(currentSize, maxSize) {
    const version = packageJson.version;
    console.log(`agentx v${version} | ${output_1.colors.cyan((0, config_1.loadConfig)().provider)} | ${output_1.colors.yellow('warning')}`);
    console.log('');
    console.log(`  ${output_1.colors.yellow('Warning:')} Context size (${(0, output_1.formatSize)(currentSize)}) exceeds limit (${(0, output_1.formatSize)(maxSize)}).`);
    console.log('');
    console.log('  Options:');
    console.log(`    ${output_1.colors.dim('•')} Use ${output_1.colors.cyan('--max-context')} to increase limit`);
    console.log(`    ${output_1.colors.dim('•')} Use a more specific alias`);
    console.log(`    ${output_1.colors.dim('•')} Exclude large files with ${output_1.colors.cyan('--exclude')}`);
    console.log('');
    console.log(`  Proceeding with truncated context (${(0, output_1.formatSize)(maxSize)})...`);
    console.log('');
}
/**
 * Custom error class for AgentX errors
 */
class AgentXError extends Error {
    constructor(type, message, ...details) {
        super(message);
        this.name = 'AgentXError';
        this.type = type;
        this.details = details;
    }
    display() {
        displayError(this.type, ...this.details);
    }
}
exports.AgentXError = AgentXError;
//# sourceMappingURL=errors.js.map