"use strict";
/**
 * Terminal output formatting utilities for AgentX CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
exports.supportsColor = supportsColor;
exports.formatSize = formatSize;
exports.drawBox = drawBox;
exports.drawSeparator = drawSeparator;
exports.printOutput = printOutput;
exports.printKeyValue = printKeyValue;
exports.printHeader = printHeader;
exports.printBoxed = printBoxed;
/**
 * Check if terminal supports color output
 */
function supportsColor() {
    return (process.stdout.isTTY === true &&
        process.env.TERM !== 'dumb' &&
        !process.env.NO_COLOR);
}
/**
 * Color helper functions for terminal output
 */
exports.colors = {
    dim: (text) => supportsColor() ? `\x1b[2m${text}\x1b[0m` : text,
    bold: (text) => supportsColor() ? `\x1b[1m${text}\x1b[0m` : text,
    cyan: (text) => supportsColor() ? `\x1b[36m${text}\x1b[0m` : text,
    green: (text) => supportsColor() ? `\x1b[32m${text}\x1b[0m` : text,
    yellow: (text) => supportsColor() ? `\x1b[33m${text}\x1b[0m` : text,
    red: (text) => supportsColor() ? `\x1b[31m${text}\x1b[0m` : text,
    blue: (text) => supportsColor() ? `\x1b[34m${text}\x1b[0m` : text,
    magenta: (text) => supportsColor() ? `\x1b[35m${text}\x1b[0m` : text,
};
/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
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
function drawBox(lines, width = 61) {
    const output = [];
    const innerWidth = width - 4;
    const pad = (s) => s.padEnd(innerWidth);
    output.push(`${BOX.topLeft}${BOX.horizontal.repeat(width - 2)}${BOX.topRight}`);
    lines.forEach((line) => {
        output.push(`${BOX.vertical} ${pad(line)} ${BOX.vertical}`);
    });
    output.push(`${BOX.bottomLeft}${BOX.horizontal.repeat(width - 2)}${BOX.bottomRight}`);
    return output;
}
/**
 * Draw a horizontal separator line for use within a box
 */
function drawSeparator(width = 61) {
    return `${BOX.leftT}${BOX.horizontal.repeat(width - 2)}${BOX.rightT}`;
}
/**
 * Print output based on output mode
 */
function printOutput(message, mode, level = 'info') {
    if (mode === 'quiet' && level !== 'error') {
        return;
    }
    if (mode === 'minimal' && level === 'verbose') {
        return;
    }
    switch (level) {
        case 'error':
            console.error(exports.colors.red(message));
            break;
        case 'success':
            console.log(exports.colors.green(message));
            break;
        case 'verbose':
            console.log(exports.colors.dim(message));
            break;
        default:
            console.log(message);
    }
}
/**
 * Print a key-value pair formatted for display
 */
function printKeyValue(key, value, keyWidth = 20) {
    console.log(`${exports.colors.cyan(key.padEnd(keyWidth))} ${value}`);
}
/**
 * Print a section header
 */
function printHeader(title) {
    console.log();
    console.log(exports.colors.bold(exports.colors.cyan(title)));
    console.log(exports.colors.dim('─'.repeat(title.length)));
}
/**
 * Print a boxed message
 */
function printBoxed(lines, width = 61) {
    drawBox(lines, width).forEach((line) => console.log(line));
}
//# sourceMappingURL=output.js.map