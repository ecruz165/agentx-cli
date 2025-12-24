/**
 * Core type definitions for AgentX
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
 * TOON conversion settings for different content types
 */
export interface ToonConversionConfig {
  /** Convert .ai-patterns/ content to TOON (default: true) */
  patterns?: boolean;
  /** Convert .ai-reference/ content to TOON (default: true) */
  reference?: boolean;
  /** Convert .ai-skill/ content to TOON (default: false - keep prose) */
  skills?: boolean;
  /** Convert .ai-templates/ content to TOON (default: false - preserve code) */
  templates?: boolean;
  /** Convert .ai-frameworks/ content to TOON (default: true) */
  frameworks?: boolean;
  /** Convert intention prompts to TOON (default: true) */
  intentions?: boolean;
}

/**
 * Main AgentX configuration
 */
export interface AgentXConfig {
  provider: string;
  model?: string;
  knowledgeBase: string;
  maxContextSize: number;
  contextFormat: ContextFormat;
  cacheEnabled: boolean;
  frameworks: Record<string, FrameworkConfig>;
  outputFormat?: ResponseOutputFormat;
  outputLocation?: string;
  personas?: PersonaDefinition[];
  activePersona?: string;
  /** TOON conversion settings for token optimization */
  toonConversion?: ToonConversionConfig;
  /** History/context persistence settings */
  history?: HistoryConfig;
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

/**
 * Persona definition for role-based alias filtering and context perspective
 */
export interface PersonaDefinition {
  id: string;
  name: string;
  description: string;
  aliasPatterns: string[];
  contextProviders?: string[];
  defaultModel?: string;
  /** System prompt that sets the AI's perspective and tone for this persona */
  systemPrompt?: string;
  /** Brief perspective statement injected at the start of context */
  perspective?: string;
  /** Tone modifiers: professional, casual, technical, educational, etc. */
  tone?: string;
  /** Focus areas to emphasize in responses */
  focusAreas?: string[];
  /** Areas to de-emphasize or avoid */
  avoidAreas?: string[];
}

/**
 * Requirement field type for intentions
 */
export type RequirementType = 'string' | 'text' | 'enum' | 'array' | 'boolean';

/**
 * Single requirement definition for an intention
 */
export interface IntentionRequirement {
  id: string;
  name: string;
  description: string;
  type: RequirementType;
  required: boolean;
  question: string;
  options?: string[]; // For enum type
  default?: string;
  extractionHints?: string[]; // Keywords to help extract from prompt
}

/**
 * Intention definition - defines user intent and required information
 */
export interface IntentionDefinition {
  id: string;
  name: string;
  description: string;
  requirements: IntentionRequirement[];
  promptTemplate?: string; // Inline template (simple cases)
  promptTemplatePath?: string; // Path to .md template in .ai-templates/intentions/
  applicableAliases?: string[]; // Limit to specific aliases, or all if empty
}

/**
 * Extracted requirement value from user prompt
 */
export interface ExtractedRequirement {
  id: string;
  value: string | string[] | boolean | null;
  confidence: 'high' | 'medium' | 'low' | 'missing';
  source: 'prompt' | 'user' | 'default';
}

/**
 * Result of requirement extraction/gathering
 */
export interface RequirementGatheringResult {
  intention: IntentionDefinition;
  extracted: ExtractedRequirement[];
  missing: IntentionRequirement[];
  complete: boolean;
  refinedPrompt?: string;
}

/**
 * History configuration for context persistence
 */
export interface HistoryConfig {
  /** Enable/disable context history saving (default: true) */
  enabled: boolean;
  /** Number of days to retain history (default: 7) */
  retainDays: number;
  /** Maximum number of history entries to keep (default: 100) */
  maxEntries: number;
  /** Location for history files (default: .agentx/history) */
  location: string;
  /** Include workspace files in context.md (default: true) */
  includeWorkspaceFiles: boolean;
  /** Compress contexts older than N days (default: 1) */
  compressAfterDays: number;
}

/**
 * Source files categorized by type for manifest
 */
export interface HistoryManifestSources {
  /** Static context files (personas, conventions, intents) */
  static: string[];
  /** Dynamic context files (scripts that generate context) */
  dynamic: string[];
  /** Output templates used */
  templates: string[];
  /** Workspace files from #file references */
  workspace: string[];
}

/**
 * Statistics about the context
 */
export interface HistoryManifestStats {
  /** Estimated total tokens */
  totalTokens: number;
  /** Total bytes of context */
  totalBytes: number;
  /** Number of files included */
  fileCount: number;
}

/**
 * Manifest file structure for context history
 */
export interface HistoryManifest {
  /** Manifest version */
  version: string;
  /** ISO timestamp of execution */
  timestamp: string;
  /** Participant ID (e.g., agentx-backend) */
  participant: string;
  /** Context group/alias name */
  contextGroup: string;
  /** Intent ID if used */
  intent?: string;
  /** User's original prompt */
  prompt: string;
  /** Categorized source files */
  sources: HistoryManifestSources;
  /** Context statistics */
  stats: HistoryManifestStats;
}

/**
 * Data needed to save context history
 */
export interface HistoryEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Participant ID */
  participant: string;
  /** Alias/context group name */
  contextGroup: string;
  /** Intent ID if used */
  intent?: string;
  /** User's prompt */
  prompt: string;
  /** Persona content if any */
  personaContent?: string;
  /** Conventions/base context content */
  conventionsContent?: string;
  /** Dynamic context content (from scripts) */
  dynamicContent?: string;
  /** Intent template content */
  intentContent?: string;
  /** Output templates content */
  templatesContent?: string;
  /** Workspace files content */
  workspaceContent?: string;
  /** Final composed prompt sent to LLM */
  finalPrompt: string;
  /** Source file paths by category */
  sources: HistoryManifestSources;
  /** Context statistics */
  stats: HistoryManifestStats;
}

