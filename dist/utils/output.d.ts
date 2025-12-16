/**
 * Terminal output formatting utilities for AgentX CLI
 */
import { OutputMode } from '../types';
/**
 * Check if terminal supports color output
 */
export declare function supportsColor(): boolean;
/**
 * Color helper functions for terminal output
 */
export declare const colors: {
    dim: (text: string) => string;
    bold: (text: string) => string;
    cyan: (text: string) => string;
    green: (text: string) => string;
    yellow: (text: string) => string;
    red: (text: string) => string;
    blue: (text: string) => string;
    magenta: (text: string) => string;
};
/**
 * Format bytes to human-readable size
 */
export declare function formatSize(bytes: number): string;
/**
 * Draw a bordered box around content
 */
export declare function drawBox(lines: string[], width?: number): string[];
/**
 * Draw a horizontal separator line for use within a box
 */
export declare function drawSeparator(width?: number): string;
/**
 * Print output based on output mode
 */
export declare function printOutput(message: string, mode: OutputMode, level?: 'info' | 'verbose' | 'error' | 'success'): void;
/**
 * Print a key-value pair formatted for display
 */
export declare function printKeyValue(key: string, value: string, keyWidth?: number): void;
/**
 * Print a section header
 */
export declare function printHeader(title: string): void;
/**
 * Print a boxed message
 */
export declare function printBoxed(lines: string[], width?: number): void;
//# sourceMappingURL=output.d.ts.map