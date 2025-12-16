/**
 * Configuration management for AgentX CLI
 */
import { AgentXConfig } from '../types';
/**
 * Find the first existing config file path
 */
export declare function findConfigPath(): string | null;
/**
 * Load configuration from file or return defaults
 */
export declare function loadConfig(): AgentXConfig;
/**
 * Save configuration to file
 */
export declare function saveConfig(config: AgentXConfig, configPath?: string): void;
/**
 * Update a specific configuration value
 */
export declare function updateConfig(key: string, value: string | number | boolean): {
    oldValue: unknown;
    newValue: unknown;
};
/**
 * Get a specific configuration value
 */
export declare function getConfigValue(key: string): unknown;
/**
 * Get default configuration
 */
export declare function getDefaultConfig(): AgentXConfig;
/**
 * Reset configuration to defaults
 */
export declare function resetConfig(): void;
/**
 * List all configuration keys
 */
export declare function getConfigKeys(): string[];
//# sourceMappingURL=index.d.ts.map