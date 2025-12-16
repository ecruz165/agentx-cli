"use strict";
/**
 * Settings display functions for AgentX CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.displaySettings = displaySettings;
exports.displayStatus = displayStatus;
exports.displayProgress = displayProgress;
const output_1 = require("./output");
/**
 * Display execution settings based on output mode
 */
function displaySettings(settings, mode) {
    if (mode === 'quiet')
        return;
    const { version, provider, alias, contextFiles, knowledgeBase, additionalFiles } = settings;
    const fileCount = contextFiles.count + (additionalFiles?.length || 0);
    const sizeStr = (0, output_1.formatSize)(contextFiles.totalSize);
    if (mode === 'minimal') {
        const addlStr = additionalFiles?.length
            ? ` + ${additionalFiles.length} file${additionalFiles.length > 1 ? 's' : ''}`
            : '';
        console.log(output_1.colors.dim(`agentx v${version}`) +
            ' | ' +
            output_1.colors.cyan(provider) +
            ' | ' +
            alias +
            addlStr +
            ' | ' +
            output_1.colors.dim(`${fileCount} files (${sizeStr})`));
        console.log('');
        return;
    }
    // Verbose mode - full box display
    const width = 61;
    const headerLines = [`AgentX v${version}`];
    const detailLines = [
        `${output_1.colors.cyan('Provider:'.padEnd(12))} ${provider}`,
        `${output_1.colors.cyan('Alias:'.padEnd(12))} ${alias}`,
        `${output_1.colors.cyan('Context:'.padEnd(12))} ${fileCount} files (${sizeStr})`,
        `${output_1.colors.cyan('Knowledge:'.padEnd(12))} ${knowledgeBase}`,
    ];
    // Build output
    const output = [];
    // Header box
    const headerBox = (0, output_1.drawBox)(headerLines, width);
    output.push(...headerBox.slice(0, -1)); // Remove bottom border
    // Separator
    output.push((0, output_1.drawSeparator)(width));
    // Details section
    detailLines.forEach((line) => {
        output.push(`│ ${line.padEnd(width - 4)} │`);
    });
    // Add file list section for verbose
    if (contextFiles.files.length > 0) {
        output.push((0, output_1.drawSeparator)(width));
        output.push(`│ ${output_1.colors.cyan('Context Files:').padEnd(width - 4)} │`);
        const maxShow = 5;
        const fileLines = contextFiles.files.slice(0, maxShow).map((f) => `  • ${f}`);
        if (contextFiles.files.length > maxShow) {
            fileLines.push(`  ${output_1.colors.dim(`... and ${contextFiles.files.length - maxShow} more files`)}`);
        }
        fileLines.forEach((line) => {
            output.push(`│ ${line.padEnd(width - 4)} │`);
        });
    }
    // Additional files section
    if (additionalFiles && additionalFiles.length > 0) {
        output.push((0, output_1.drawSeparator)(width));
        output.push(`│ ${output_1.colors.cyan('Additional Files:').padEnd(width - 4)} │`);
        additionalFiles.forEach((file) => {
            output.push(`│ ${`  • ${file}`.padEnd(width - 4)} │`);
        });
    }
    // Bottom border
    output.push(`└${'─'.repeat(width - 2)}┘`);
    // Print output
    output.forEach((line) => console.log(output_1.colors.dim(line)));
    console.log('');
    console.log('Executing prompt...');
    console.log('');
}
/**
 * Display a simple status message
 */
function displayStatus(message, type = 'info') {
    const icons = {
        info: 'ℹ',
        success: '✓',
        error: '✗',
        warning: '⚠',
    };
    const colorFns = {
        info: output_1.colors.cyan,
        success: output_1.colors.green,
        error: output_1.colors.red,
        warning: output_1.colors.yellow,
    };
    console.log(`${colorFns[type](icons[type])} ${message}`);
}
/**
 * Display a progress indicator
 */
function displayProgress(current, total, label = '') {
    const percentage = Math.round((current / total) * 100);
    const barWidth = 30;
    const filled = Math.round((current / total) * barWidth);
    const empty = barWidth - filled;
    const bar = output_1.colors.green('█'.repeat(filled)) + output_1.colors.dim('░'.repeat(empty));
    const labelStr = label ? ` ${label}` : '';
    process.stdout.write(`\r[${bar}] ${percentage}%${labelStr}`);
    if (current === total) {
        console.log('');
    }
}
//# sourceMappingURL=display.js.map