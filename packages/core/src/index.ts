/**
 * @agentx/core - Core shared logic for AgentX
 *
 * This package provides the foundational functionality for AgentX:
 * - Configuration management
 * - Alias management
 * - Context file aggregation
 * - AI provider abstraction
 * - Type definitions
 */

// Types
export * from './types';

// Config
export {
  findConfigPath,
  loadConfig,
  saveConfig,
  updateConfig,
  getConfigValue,
  getDefaultConfig,
  resetConfig,
  getConfigKeys,
} from './config';

// Alias
export {
  loadAliases,
  resolveAlias,
  getAlias,
  getAliasWithFiles,
  calculateTotalSize,
  aliasDirectoryExists,
  getAliasDirectoryPath,
  getPersonas,
  getPersona,
  getActivePersona,
  filterAliasesByPersona,
  loadAliasesForActivePersona,
} from './alias';

// Context
export {
  buildContext,
  createExecutionSettings,
  readFileWithMetadata,
  getContextSummary,
} from './context';
export type { ContextResult, BuildContextOptions } from './context';

// Providers
export {
  executeWithProvider,
  checkProviderAvailability,
  getAvailableProviders,
} from './providers';
export type { ProviderType, ProviderResult } from './providers';

// Intentions
export {
  loadIntentions,
  getIntention,
  getIntentionsForAlias,
  extractRequirements,
  gatherRequirements,
  updateRequirements,
  formatMissingRequirements,
  intentionsDirectoryExists,
  getIntentionsDirectoryPath,
  renderRefinedPrompt,
  loadIntentionTemplate,
} from './intention';

// TOON conversion
export {
  shouldConvertToToon,
  convertMarkdownToToon,
  processContent,
  getToonFileHeader,
  wrapWithToonHeader,
  DEFAULT_TOON_CONFIG,
} from './toon';

