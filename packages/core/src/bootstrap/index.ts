/**
 * Project bootstrapping utilities for AgentX
 * Provides detection, analysis, and scaffolding capabilities
 */

// Types
export * from './types';

// Project Detection
export {
  detectProjectRoot,
  findProjectRoot,
  hasMarker,
  getPrimaryLanguage,
  isMonorepo,
} from './project-detection';

// Project Analysis
export {
  analyzeProject,
  parsePackageJson,
  parsePomXml,
  parseBuildGradle,
  determineProjectType,
} from './project-analysis';

// Scaffolding
export {
  scaffoldProject,
  generateAliasFiles,
  generateIntentionFiles,
  generatePersonaFiles,
  generateDefaultConfig,
  createSourceDirectories,
  getAiConfigPath,
  hasAiConfig,
  DEFAULT_TEMPLATES,
} from './scaffold';
