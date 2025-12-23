/**
 * Skills Type Definitions
 * Defines the schema for executable skills that workflow steps invoke
 */

/**
 * Skill execution types
 */
export type SkillType = 'script' | 'make' | 'llm';

/**
 * Shell types for script execution
 */
export type ShellType = 'bash' | 'python' | 'node' | 'pwsh';

/**
 * Argument/input types
 */
export type ArgType = 'string' | 'number' | 'boolean' | 'array';

/**
 * Output extraction methods
 */
export type ExtractType = 'stdout' | 'stderr' | 'full' | 'exitCode' | 'pattern' | 'json' | 'file';

/**
 * Skill argument definition
 * Used for script and make skills
 */
export interface SkillArg {
  name: string;
  required?: boolean;
  default?: unknown;
  type?: ArgType;
  description?: string;

  // Script: how to pass the arg
  flag?: string;         // --name value
  shortFlag?: string;    // -n value
  positional?: number;   // Positional index (0-based)

  // Make: environment variable
  env?: string;
}

/**
 * Skill input definition
 * Used for LLM skills (alias for args)
 */
export interface SkillInput {
  name: string;
  required?: boolean;
  default?: unknown;
  type?: ArgType;
  description?: string;
}

/**
 * Skill output definition
 */
export interface SkillOutput {
  name: string;
  extract: ExtractType;

  // For pattern extraction
  pattern?: string;      // Regex
  flags?: string;        // Regex flags (g, m, i, etc.)
  group?: number;        // Capture group, default: 1
  multiple?: boolean;    // Return all matches as array

  // For JSON extraction
  jsonPath?: string;     // JSONPath expression

  // For file extraction
  path?: string;         // File path to read
  encoding?: string;     // File encoding, default: utf-8
}

/**
 * Platform-specific skill overrides
 */
export interface PlatformOverrides {
  windows?: Partial<Skill>;
  unix?: Partial<Skill>;
}

/**
 * Skill definition
 */
export interface Skill {
  // Identity
  id: string;
  name: string;
  description: string;
  type: SkillType;

  // Script-specific
  run?: string;
  shell?: ShellType;

  // Make-specific
  target?: string;
  makefile?: string;

  // LLM-specific
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;

  // Common
  args?: SkillArg[];
  inputs?: SkillInput[];     // LLM-specific alias for args
  outputs?: SkillOutput[];
  env?: Record<string, string>;
  workdir?: string;
  timeout?: number;          // Seconds, default: 60
  confirm?: boolean;         // Require user confirmation

  // Platform handling
  platform?: PlatformOverrides;
}

/**
 * Raw execution result from runners
 */
export interface RawExecutionResult {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  response?: string;  // LLM response
}

/**
 * Skill execution result
 */
export interface SkillResult {
  success: boolean;
  outputs: Record<string, unknown>;

  // Raw execution data
  raw: RawExecutionResult;

  // Metadata
  duration: number;           // Milliseconds
  skillId: string;
  executedAt: Date;

  // Error info
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Input validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Execution preview for confirmation dialog
 */
export interface ExecutionPreview {
  type: SkillType;
  command?: string;
  prompt?: string;
  workdir?: string;
  env?: Record<string, string>;
  model?: string;
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  skipConfirm?: boolean;
  timeout?: number;
  onProgress?: (message: string) => void;
}

/**
 * Error codes for skill execution
 */
export type SkillErrorCode =
  | 'VALIDATION_ERROR'
  | 'USER_CANCELLED'
  | 'EXECUTION_ERROR'
  | 'TIMEOUT'
  | 'LLM_ERROR'
  | 'EXTRACTION_ERROR'
  | 'NOT_FOUND'
  | 'SCHEMA_ERROR'
  | 'WORKSPACE_NOT_TRUSTED';
