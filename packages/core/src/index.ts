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
  setBasePath,
  getBasePath,
  clearBasePath,
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
  estimateTokens,
  truncateContextForTokenLimit,
  getTokenLimit,
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

// History/Context Persistence
export {
  DEFAULT_HISTORY_CONFIG,
  getHistoryPath,
  getEntryPath,
  generateContextMarkdown,
  generateManifest,
  saveHistoryEntry,
  listHistoryEntries,
  getLastHistoryEntry,
  cleanupHistory,
  clearHistory,
  estimateTokens as estimateHistoryTokens,
  isHistoryInGitignore,
  addHistoryToGitignore,
  isFirstHistorySave,
} from './history';

// Plan Document Management
export {
  // Types
  type PlanStatus,
  type GatheredRequirement,
  type MissingRequirement,
  type PlanDocument,
  type PrdDocument,
  // Functions
  getPlansPath,
  generatePlanId,
  getPlanPath,
  createPlanDocument,
  savePlanDocument,
  loadPlanDocument,
  isPlanExpired,
  updatePlanRequirements,
  addToConversationHistory,
  setImplementationPlan,
  approvePlan,
  rejectPlan,
  deletePlanDocument,
  listActivePlans,
  cleanupPlans,
  generatePlanMarkdown,
  generatePrdDocument,
  generatePrdMarkdown,
  savePrdToHistory,
  findActivePlan,
} from './plan';

// Bootstrap/Project Detection
export {
  // Types
  type ProjectMarker,
  type ProjectRootResult,
  type ProjectType,
  type DetectedFramework,
  type DependencyInfo,
  type ProjectAnalysisResult,
  type AliasTemplateInput,
  type IntentionTemplateInput,
  type ScaffoldOptions,
  type ScaffoldResult,
  type ProjectTemplates,
  // Project Detection
  detectProjectRoot,
  findProjectRoot,
  hasMarker,
  getPrimaryLanguage,
  isMonorepo,
  // Project Analysis
  analyzeProject,
  parsePackageJson,
  parsePomXml,
  parseBuildGradle,
  determineProjectType,
  // Scaffolding
  scaffoldProject,
  generateAliasFiles,
  generateIntentionFiles,
  generateDefaultConfig,
  createSourceDirectories,
  getAiConfigPath,
  hasAiConfig,
  DEFAULT_TEMPLATES,
} from './bootstrap';

