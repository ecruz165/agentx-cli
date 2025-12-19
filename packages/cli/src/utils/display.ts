/**
 * Settings display functions for AgentX CLI
 */

import { ExecutionSettings, OutputMode } from '@agentx/core';
import { colors, formatSize, drawBox, drawSeparator } from './output';

/**
 * Display execution settings based on output mode
 */
export function displaySettings(
  settings: ExecutionSettings,
  mode: OutputMode
): void {
  if (mode === 'quiet') return;

  const { version, provider, alias, contextFiles, knowledgeBase, additionalFiles } =
    settings;
  const fileCount = contextFiles.count + (additionalFiles?.length || 0);
  const sizeStr = formatSize(contextFiles.totalSize);

  if (mode === 'minimal') {
    const addlStr = additionalFiles?.length
      ? ` + ${additionalFiles.length} file${additionalFiles.length > 1 ? 's' : ''}`
      : '';
    console.log(
      colors.dim(`agentx v${version}`) +
        ' | ' +
        colors.cyan(provider) +
        ' | ' +
        alias +
        addlStr +
        ' | ' +
        colors.dim(`${fileCount} files (${sizeStr})`)
    );
    console.log('');
    return;
  }

  // Verbose mode - full box display
  const width = 61;
  const headerLines = [`AgentX v${version}`];

  const detailLines = [
    `${colors.cyan('Provider:'.padEnd(12))} ${provider}`,
    `${colors.cyan('Alias:'.padEnd(12))} ${alias}`,
    `${colors.cyan('Context:'.padEnd(12))} ${fileCount} files (${sizeStr})`,
    `${colors.cyan('Knowledge:'.padEnd(12))} ${knowledgeBase}`,
  ];

  // Build output
  const output: string[] = [];

  // Header box
  const headerBox = drawBox(headerLines, width);
  output.push(...headerBox.slice(0, -1)); // Remove bottom border

  // Separator
  output.push(drawSeparator(width));

  // Details section
  detailLines.forEach((line) => {
    output.push(`│ ${line.padEnd(width - 4)} │`);
  });

  // Add file list section for verbose
  if (contextFiles.files.length > 0) {
    output.push(drawSeparator(width));
    output.push(`│ ${colors.cyan('Context Files:').padEnd(width - 4)} │`);

    const maxShow = 5;
    const fileLines = contextFiles.files.slice(0, maxShow).map((f) => `  • ${f}`);

    if (contextFiles.files.length > maxShow) {
      fileLines.push(
        `  ${colors.dim(`... and ${contextFiles.files.length - maxShow} more files`)}`
      );
    }

    fileLines.forEach((line) => {
      output.push(`│ ${line.padEnd(width - 4)} │`);
    });
  }

  // Additional files section
  if (additionalFiles && additionalFiles.length > 0) {
    output.push(drawSeparator(width));
    output.push(`│ ${colors.cyan('Additional Files:').padEnd(width - 4)} │`);

    additionalFiles.forEach((file) => {
      output.push(`│ ${`  • ${file}`.padEnd(width - 4)} │`);
    });
  }

  // Bottom border
  output.push(`└${'─'.repeat(width - 2)}┘`);

  // Print output
  output.forEach((line) => console.log(colors.dim(line)));
  console.log('');
  console.log('Executing prompt...');
  console.log('');
}

/**
 * Display a simple status message
 */
export function displayStatus(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  const icons = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
  };

  const colorFns = {
    info: colors.cyan,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
  };

  console.log(`${colorFns[type](icons[type])} ${message}`);
}

/**
 * Display a progress indicator
 */
export function displayProgress(current: number, total: number, label: string = ''): void {
  const percentage = Math.round((current / total) * 100);
  const barWidth = 30;
  const filled = Math.round((current / total) * barWidth);
  const empty = barWidth - filled;

  const bar = colors.green('█'.repeat(filled)) + colors.dim('░'.repeat(empty));
  const labelStr = label ? ` ${label}` : '';

  process.stdout.write(`\r[${bar}] ${percentage}%${labelStr}`);

  if (current === total) {
    console.log('');
  }
}

