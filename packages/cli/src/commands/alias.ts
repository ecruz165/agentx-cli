/**
 * Alias command for AgentX CLI
 */

import { Command } from 'commander';
import {
  loadAliases,
  getAliasWithFiles,
  calculateTotalSize,
  aliasDirectoryExists,
  getAliasDirectoryPath,
} from '@agentx/core';
import { colors, formatSize, drawBox, printHeader } from '../utils/output';
import { displayStatus } from '../utils/display';

/**
 * Create the alias command with subcommands
 */
export function createAliasCommand(): Command {
  const aliasCmd = new Command('alias').description('Manage context aliases');

  // alias list
  aliasCmd
    .command('list')
    .description('List all available aliases')
    .action(async () => {
      if (!aliasDirectoryExists()) {
        displayStatus(
          `Alias directory not found: ${getAliasDirectoryPath()}`,
          'warning'
        );
        console.log(colors.dim('\nCreate alias JSON files in this directory to define aliases.'));
        return;
      }

      const aliases = await loadAliases();

      if (aliases.length === 0) {
        displayStatus('No aliases found', 'info');
        console.log(colors.dim(`\nAdd alias JSON files to: ${getAliasDirectoryPath()}`));
        return;
      }

      printHeader('Available Aliases');
      console.log();

      const nameWidth = 20;
      const descWidth = 40;
      const patternWidth = 15;

      console.log(
        colors.bold(
          `${'NAME'.padEnd(nameWidth)} ${'DESCRIPTION'.padEnd(descWidth)} ${'PATTERNS'.padEnd(patternWidth)}`
        )
      );
      console.log(colors.dim('─'.repeat(nameWidth + descWidth + patternWidth + 2)));

      for (const alias of aliases) {
        const name = alias.name.padEnd(nameWidth);
        const desc = alias.description.length > descWidth - 3
          ? alias.description.substring(0, descWidth - 3) + '...'
          : alias.description.padEnd(descWidth);
        const patterns = `${alias.patterns.length} pattern${alias.patterns.length !== 1 ? 's' : ''}`.padEnd(patternWidth);

        console.log(`${colors.cyan(name)} ${desc} ${colors.dim(patterns)}`);
      }

      console.log();
      console.log(colors.dim(`Total: ${aliases.length} alias${aliases.length !== 1 ? 'es' : ''}`));
    });

  // alias show
  aliasCmd
    .command('show')
    .description('Show details of a specific alias')
    .argument('<name>', 'Alias name to show')
    .option('-r, --resolve', 'Resolve and show matching files')
    .action(async (name, options) => {
      const alias = await getAliasWithFiles(name);

      if (!alias) {
        displayStatus(`Alias not found: ${name}`, 'error');

        const aliases = await loadAliases();
        if (aliases.length > 0) {
          console.log(`\nAvailable aliases: ${aliases.map((a) => a.name).join(', ')}`);
        }
        process.exit(1);
      }

      const width = 61;
      const output: string[] = [];

      output.push(`┌${'─'.repeat(width - 2)}┐`);
      output.push(`│ ${colors.bold(`Alias: ${alias.name}`).padEnd(width + 7)} │`);
      output.push(`├${'─'.repeat(width - 2)}┤`);

      output.push(`│ ${colors.cyan('Description:').padEnd(width + 7)} │`);
      output.push(`│ ${alias.description.padEnd(width - 4)} │`);
      output.push(`├${'─'.repeat(width - 2)}┤`);

      output.push(`│ ${colors.cyan('Patterns:').padEnd(width + 7)} │`);
      for (const pattern of alias.patterns) {
        output.push(`│   ${colors.dim('•')} ${pattern.padEnd(width - 8)} │`);
      }

      if (options.resolve || alias.resolvedFiles.length > 0) {
        const totalSize = calculateTotalSize(alias.resolvedFiles);

        output.push(`├${'─'.repeat(width - 2)}┤`);
        output.push(
          `│ ${colors.cyan(`Resolved Files (${alias.resolvedFiles.length}):`.padEnd(width - 4 + 9))} │`
        );
        output.push(
          `│ ${colors.dim(`Total size: ${formatSize(totalSize)}`).padEnd(width + 3)} │`
        );
        output.push(`├${'─'.repeat(width - 2)}┤`);

        const maxFiles = 10;
        const filesToShow = alias.resolvedFiles.slice(0, maxFiles);

        for (const file of filesToShow) {
          const sizeStr = formatSize(file.size).padStart(10);
          const pathStr = file.path.length > width - 18
            ? '...' + file.path.substring(file.path.length - (width - 21))
            : file.path;
          output.push(`│   ${pathStr.padEnd(width - 17)} ${colors.dim(sizeStr)} │`);
        }

        if (alias.resolvedFiles.length > maxFiles) {
          output.push(
            `│   ${colors.dim(`... and ${alias.resolvedFiles.length - maxFiles} more files`).padEnd(width + 3)} │`
          );
        }
      }

      output.push(`└${'─'.repeat(width - 2)}┘`);

      output.forEach((line) => console.log(line));
    });

  return aliasCmd;
}

