"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecCommand = createExecCommand;
const commander_1 = require("commander");
const alias_1 = require("../alias");
const context_1 = require("../context");
const display_1 = require("../utils/display");
const errors_1 = require("../utils/errors");
const providers_1 = require("../providers");
const config_1 = require("../config");
/**
 * Create the exec command
 */
function createExecCommand() {
    return new commander_1.Command('exec')
        .description('Execute AI prompt with context alias')
        .argument('<alias>', 'Context alias to use')
        .argument('<prompt>', 'Prompt to send to AI')
        .option('-v, --verbose', 'Show detailed settings with file list')
        .option('-q, --quiet', 'Show only AI response')
        .option('-f, --files <files...>', 'Additional files to include')
        .option('--max-context <size>', 'Override max context size (bytes)', parseInt)
        .option('--dry-run', 'Show what would be executed without calling AI')
        .action(async (aliasName, prompt, options) => {
        // Determine output mode
        let mode = 'minimal';
        if (options.verbose)
            mode = 'verbose';
        if (options.quiet)
            mode = 'quiet';
        // Load alias
        const alias = await (0, alias_1.getAlias)(aliasName);
        if (!alias) {
            const allAliases = await (0, alias_1.loadAliases)();
            (0, errors_1.displayError)('alias-not-found', aliasName, allAliases.map((a) => a.name));
            process.exit(1);
        }
        // Build context
        const config = (0, config_1.loadConfig)();
        const maxContextSize = options.maxContext || config.maxContextSize;
        const context = await (0, context_1.buildContext)(alias, options.files, {
            maxSize: maxContextSize,
        });
        // Create execution settings
        const settings = (0, context_1.createExecutionSettings)(alias, context, options.files);
        // Display settings (unless quiet mode)
        (0, display_1.displaySettings)(settings, mode);
        // Check for context size warning
        if (context.truncated && mode !== 'quiet') {
            (0, errors_1.displayContextWarning)(context.files.reduce((sum, f) => sum + f.size, 0), maxContextSize);
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
        const result = await (0, providers_1.executeWithProvider)(prompt, context.content);
        if (result.success) {
            console.log(result.response);
        }
        else {
            (0, errors_1.displayError)('provider-error', config.provider, result.error);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=exec.js.map