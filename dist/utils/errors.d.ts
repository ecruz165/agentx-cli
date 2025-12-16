/**
 * Error handling and display utilities for AgentX CLI
 * Based on initial-spec.md error output specifications
 */
/**
 * Error types supported by the CLI
 */
export type ErrorType = 'alias-not-found' | 'provider-error' | 'context-too-large' | 'config-error' | 'file-not-found' | 'invalid-argument' | 'framework-not-found' | 'template-not-found';
/**
 * Display formatted error output
 * Format: agentx v{version} | error
 */
export declare function displayError(type: ErrorType, ...args: unknown[]): void;
/**
 * Display a warning message
 */
export declare function displayWarning(message: string, details?: string[]): void;
/**
 * Display context size warning (non-fatal)
 */
export declare function displayContextWarning(currentSize: number, maxSize: number): void;
/**
 * Custom error class for AgentX errors
 */
export declare class AgentXError extends Error {
    type: ErrorType;
    details: unknown[];
    constructor(type: ErrorType, message: string, ...details: unknown[]);
    display(): void;
}
//# sourceMappingURL=errors.d.ts.map