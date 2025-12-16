"use strict";
/**
 * Alias command for AgentX CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAliasCommand = createAliasCommand;
const commander_1 = require("commander");
const alias_1 = require("../alias");
const output_1 = require("../utils/output");
const display_1 = require("../utils/display");
/**
 * Create the alias command with subcommands
 */
function createAliasCommand() {
    const aliasCmd = new commander_1.Command('alias').description('Manage context aliases');
    // alias list
    aliasCmd
        .command('list')
        .description('List all available aliases')
        .action(async () => {
        if (!(0, alias_1.aliasDirectoryExists)()) {
            (0, display_1.displayStatus)(`Alias directory not found: ${(0, alias_1.getAliasDirectoryPath)()}`, 'warning');
            console.log(output_1.colors.dim('\nCreate alias JSON files in this directory to define aliases.'));
            return;
        }
        const aliases = await (0, alias_1.loadAliases)();
        if (aliases.length === 0) {
            (0, display_1.displayStatus)('No aliases found', 'info');
            console.log(output_1.colors.dim(`\nAdd alias JSON files to: ${(0, alias_1.getAliasDirectoryPath)()}`));
            return;
        }
        (0, output_1.printHeader)('Available Aliases');
        console.log();
        // Table header
        const nameWidth = 20;
        const descWidth = 40;
        const patternWidth = 15;
        console.log(output_1.colors.bold(`${'NAME'.padEnd(nameWidth)} ${'DESCRIPTION'.padEnd(descWidth)} ${'PATTERNS'.padEnd(patternWidth)}`));
        console.log(output_1.colors.dim('─'.repeat(nameWidth + descWidth + patternWidth + 2)));
        // Table rows
        for (const alias of aliases) {
            const name = alias.name.padEnd(nameWidth);
            const desc = alias.description.length > descWidth - 3
                ? alias.description.substring(0, descWidth - 3) + '...'
                : alias.description.padEnd(descWidth);
            const patterns = `${alias.patterns.length} pattern${alias.patterns.length !== 1 ? 's' : ''}`.padEnd(patternWidth);
            console.log(`${output_1.colors.cyan(name)} ${desc} ${output_1.colors.dim(patterns)}`);
        }
        console.log();
        console.log(output_1.colors.dim(`Total: ${aliases.length} alias${aliases.length !== 1 ? 'es' : ''}`));
    });
    // alias show
    aliasCmd
        .command('show')
        .description('Show details of a specific alias')
        .argument('<name>', 'Alias name to show')
        .option('-r, --resolve', 'Resolve and show matching files')
        .action(async (name, options) => {
        const alias = await (0, alias_1.getAliasWithFiles)(name);
        if (!alias) {
            (0, display_1.displayStatus)(`Alias not found: ${name}`, 'error');
            const aliases = await (0, alias_1.loadAliases)();
            if (aliases.length > 0) {
                console.log(`\nAvailable aliases: ${aliases.map((a) => a.name).join(', ')}`);
            }
            process.exit(1);
        }
        const width = 61;
        const output = [];
        // Header
        output.push(`┌${'─'.repeat(width - 2)}┐`);
        output.push(`│ ${output_1.colors.bold(`Alias: ${alias.name}`).padEnd(width + 7)} │`);
        output.push(`├${'─'.repeat(width - 2)}┤`);
        // Description
        output.push(`│ ${output_1.colors.cyan('Description:').padEnd(width + 7)} │`);
        output.push(`│ ${alias.description.padEnd(width - 4)} │`);
        output.push(`├${'─'.repeat(width - 2)}┤`);
        // Patterns
        output.push(`│ ${output_1.colors.cyan('Patterns:').padEnd(width + 7)} │`);
        for (const pattern of alias.patterns) {
            output.push(`│   ${output_1.colors.dim('•')} ${pattern.padEnd(width - 8)} │`);
        }
        // Resolved files (if requested or available)
        if (options.resolve || alias.resolvedFiles.length > 0) {
            const totalSize = (0, alias_1.calculateTotalSize)(alias.resolvedFiles);
            output.push(`├${'─'.repeat(width - 2)}┤`);
            output.push(`│ ${output_1.colors.cyan(`Resolved Files (${alias.resolvedFiles.length}):`.padEnd(width - 4 + 9))} │`);
            output.push(`│ ${output_1.colors.dim(`Total size: ${(0, output_1.formatSize)(totalSize)}`).padEnd(width + 3)} │`);
            output.push(`├${'─'.repeat(width - 2)}┤`);
            const maxFiles = 10;
            const filesToShow = alias.resolvedFiles.slice(0, maxFiles);
            for (const file of filesToShow) {
                const sizeStr = (0, output_1.formatSize)(file.size).padStart(10);
                const pathStr = file.path.length > width - 18
                    ? '...' + file.path.substring(file.path.length - (width - 21))
                    : file.path;
                output.push(`│   ${pathStr.padEnd(width - 17)} ${output_1.colors.dim(sizeStr)} │`);
            }
            if (alias.resolvedFiles.length > maxFiles) {
                output.push(`│   ${output_1.colors.dim(`... and ${alias.resolvedFiles.length - maxFiles} more files`).padEnd(width + 3)} │`);
            }
        }
        // Bottom border
        output.push(`└${'─'.repeat(width - 2)}┘`);
        // Print output
        output.forEach((line) => console.log(line));
    });
    return aliasCmd;
}
//# sourceMappingURL=alias.js.map