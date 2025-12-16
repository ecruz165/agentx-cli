/**
 * Settings display functions for AgentX CLI
 */
import { ExecutionSettings, OutputMode } from '../types';
/**
 * Display execution settings based on output mode
 */
export declare function displaySettings(settings: ExecutionSettings, mode: OutputMode): void;
/**
 * Display a simple status message
 */
export declare function displayStatus(message: string, type?: 'info' | 'success' | 'error' | 'warning'): void;
/**
 * Display a progress indicator
 */
export declare function displayProgress(current: number, total: number, label?: string): void;
//# sourceMappingURL=display.d.ts.map