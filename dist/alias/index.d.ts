/**
 * Alias management system for AgentX CLI
 */
import { AliasDefinition, ResolvedFile } from '../types';
/**
 * Load all alias definitions from the alias directory
 */
export declare function loadAliases(): Promise<AliasDefinition[]>;
/**
 * Resolve an alias to its matching files
 */
export declare function resolveAlias(alias: AliasDefinition): Promise<ResolvedFile[]>;
/**
 * Get a specific alias by name
 */
export declare function getAlias(name: string): Promise<AliasDefinition | null>;
/**
 * Get an alias with its resolved files
 */
export declare function getAliasWithFiles(name: string): Promise<(AliasDefinition & {
    resolvedFiles: ResolvedFile[];
}) | null>;
/**
 * Calculate total size of resolved files
 */
export declare function calculateTotalSize(files: ResolvedFile[]): number;
/**
 * Check if alias directory exists
 */
export declare function aliasDirectoryExists(): boolean;
/**
 * Get the alias directory path (for display)
 */
export declare function getAliasDirectoryPath(): string;
//# sourceMappingURL=index.d.ts.map