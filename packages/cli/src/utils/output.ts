/**
 * Terminal output formatting utilities for AgentX CLI
 */

import { OutputMode } from '@agentx/core';

/**
 * Check if terminal supports color output
 */
export function supportsColor(): boolean {
  return (
    process.stdout.isTTY === true &&
    process.env.TERM !== 'dumb' &&
    !process.env.NO_COLOR
  );
}

/**
 * Color helper functions for terminal output
 */
export const colors = {
  dim: (text: string): string =>
    supportsColor() ? `\x1b[2m${text}\x1b[0m` : text,
  bold: (text: string): string =>
    supportsColor() ? `\x1b[1m${text}\x1b[0m` : text,
  cyan: (text: string): string =>
    supportsColor() ? `\x1b[36m${text}\x1b[0m` : text,
  green: (text: string): string =>
    supportsColor() ? `\x1b[32m${text}\x1b[0m` : text,
  yellow: (text: string): string =>
    supportsColor() ? `\x1b[33m${text}\x1b[0m` : text,
  red: (text: string): string =>
    supportsColor() ? `\x1b[31m${text}\x1b[0m` : text,
  blue: (text: string): string =>
    supportsColor() ? `\x1b[34m${text}\x1b[0m` : text,
  magenta: (text: string): string =>
    supportsColor() ? `\x1b[35m${text}\x1b[0m` : text,
};

/**
 * Format bytes to human-readable size
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Box drawing characters
 */
const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  leftT: '├',
  rightT: '┤',
};

/**
 * Draw a bordered box around content
 */
export function drawBox(lines: string[], width: number = 61): string[] {
  const output: string[] = [];
  const innerWidth = width - 4;
  const pad = (s: string): string => s.padEnd(innerWidth);

  output.push(`${BOX.topLeft}${BOX.horizontal.repeat(width - 2)}${BOX.topRight}`);
  lines.forEach((line) => {
    output.push(`${BOX.vertical} ${pad(line)} ${BOX.vertical}`);
  });
  output.push(
    `${BOX.bottomLeft}${BOX.horizontal.repeat(width - 2)}${BOX.bottomRight}`
  );

  return output;
}

/**
 * Draw a horizontal separator line for use within a box
 */
export function drawSeparator(width: number = 61): string {
  return `${BOX.leftT}${BOX.horizontal.repeat(width - 2)}${BOX.rightT}`;
}

/**
 * Print output based on output mode
 */
export function printOutput(
  message: string,
  mode: OutputMode,
  level: 'info' | 'verbose' | 'error' | 'success' = 'info'
): void {
  if (mode === 'quiet' && level !== 'error') {
    return;
  }

  if (mode === 'minimal' && level === 'verbose') {
    return;
  }

  switch (level) {
    case 'error':
      console.error(colors.red(message));
      break;
    case 'success':
      console.log(colors.green(message));
      break;
    case 'verbose':
      console.log(colors.dim(message));
      break;
    default:
      console.log(message);
  }
}

/**
 * Print a key-value pair formatted for display
 */
export function printKeyValue(key: string, value: string, keyWidth: number = 20): void {
  console.log(`${colors.cyan(key.padEnd(keyWidth))} ${value}`);
}

/**
 * Print a section header
 */
export function printHeader(title: string): void {
  console.log();
  console.log(colors.bold(colors.cyan(title)));
  console.log(colors.dim('─'.repeat(title.length)));
}

/**
 * Print a boxed message
 */
export function printBoxed(lines: string[], width: number = 61): void {
  drawBox(lines, width).forEach((line) => console.log(line));
}

