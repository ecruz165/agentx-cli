/**
 * Context file aggregation system for AgentX CLI
 * Based on initial-spec.md context requirements
 */
import { ExecutionSettings, AliasDefinition, ResolvedFile } from '../types';
/**
 * Result of building context from files
 */
export interface ContextResult {
    files: ResolvedFile[];
    totalSize: number;
    truncated: boolean;
    content: string;
}
/**
 * Options for building context
 */
export interface BuildContextOptions {
    maxSize?: number;
    excludePatterns?: string[];
}
/**
 * Build context from an alias and optional additional files
 */
export declare function buildContext(alias: AliasDefinition, additionalFiles?: string[], options?: BuildContextOptions): Promise<ContextResult>;
/**
 * Create execution settings from alias and context
 */
export declare function createExecutionSettings(alias: AliasDefinition, context: ContextResult, additionalFiles?: string[]): ExecutionSettings;
/**
 * Read a single file and return its content with metadata
 */
export declare function readFileWithMetadata(filePath: string): {
    content: string;
    size: number;
} | null;
/**
 * Get context summary for display
 */
export declare function getContextSummary(context: ContextResult): string;
//# sourceMappingURL=index.d.ts.map