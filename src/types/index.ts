/**
 * Core type definitions for AgentX CLI
 */

/**
 * Output verbosity mode for CLI commands
 */
export type OutputMode = 'minimal' | 'verbose' | 'quiet';

/**
 * Context format for AI processing
 */
export type ContextFormat = 'hybrid' | 'raw' | 'structured';

/**
 * Output format for saving AI responses to files
 */
export type ResponseOutputFormat = 'toon' | 'json' | 'markdown' | 'raw';

/**
 * Resolved file information with metadata
 */
export interface ResolvedFile {
  path: string;
  size: number;
}

/**
 * Alias definition for grouping related files/patterns
 */
export interface AliasDefinition {
  name: string;
  description: string;
  patterns: string[];
  resolvedFiles?: ResolvedFile[];
}

/**
 * Context files information for execution
 */
export interface ContextFiles {
  count: number;
  totalSize: number;
  files: string[];
}

/**
 * Execution settings for a command run
 */
export interface ExecutionSettings {
  version: string;
  provider: string;
  alias: string;
  contextFiles: ContextFiles;
  knowledgeBase: string;
  additionalFiles?: string[];
}

/**
 * Framework configuration
 */
export interface FrameworkConfig {
  name: string;
  version?: string;
  enabled: boolean;
}

/**
 * Main AgentX configuration
 */
export interface AgentXConfig {
  provider: string;
  knowledgeBase: string;
  maxContextSize: number;
  contextFormat: ContextFormat;
  cacheEnabled: boolean;
  frameworks: Record<string, FrameworkConfig>;
  outputFormat?: ResponseOutputFormat;
  outputLocation?: string;
}

/**
 * Command execution context
 */
export interface CommandContext {
  config: AgentXConfig;
  settings: ExecutionSettings;
  outputMode: OutputMode;
}

/**
 * CLI command result
 */
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: Error;
}

/**
 * Provider configuration for AI services
 */
export interface ProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
}
