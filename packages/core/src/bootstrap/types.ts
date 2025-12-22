/**
 * Type definitions for project bootstrapping utilities
 */

import { IntentionRequirement } from '../types';

/**
 * Project marker file types for detection
 */
export type ProjectMarker =
  | 'package.json'
  | 'pom.xml'
  | 'build.gradle'
  | 'build.gradle.kts'
  | 'tsconfig.json'
  | 'tsconfig.base.json'
  | '.git'
  | 'Cargo.toml'
  | 'go.mod'
  | 'requirements.txt'
  | 'pyproject.toml';

/**
 * Result of project root detection
 */
export interface ProjectRootResult {
  /** Whether the path is a project root */
  isProjectRoot: boolean;
  /** Path that was checked */
  path: string;
  /** Detected marker files */
  detectedMarkers: ProjectMarker[];
  /** Primary marker (highest priority detected) */
  primaryMarker?: ProjectMarker;
}

/**
 * Supported project types
 */
export type ProjectType = 'typescript' | 'java' | 'hybrid' | 'unknown';

/**
 * Detected framework/library
 */
export interface DetectedFramework {
  name: string;
  version?: string;
  type: 'runtime' | 'devDependency' | 'build' | 'test';
}

/**
 * Parsed dependency information
 */
export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency';
}

/**
 * Result of project analysis
 */
export interface ProjectAnalysisResult {
  /** Detected project type */
  projectType: ProjectType;
  /** Project name from manifest */
  projectName?: string;
  /** Project version from manifest */
  projectVersion?: string;
  /** All detected dependencies */
  dependencies: DependencyInfo[];
  /** Detected frameworks/libraries by category */
  frameworks: {
    frontend: DetectedFramework[];
    backend: DetectedFramework[];
    testing: DetectedFramework[];
    build: DetectedFramework[];
  };
  /** Build tool used */
  buildTool?: 'npm' | 'yarn' | 'pnpm' | 'maven' | 'gradle';
  /** Source paths detected */
  sourcePaths: {
    main?: string;
    test?: string;
  };
  /** Raw manifest data */
  manifests: {
    packageJson?: Record<string, unknown>;
    pomXml?: Record<string, unknown>;
    buildGradle?: Record<string, unknown>;
  };
}

/**
 * Input for alias template generation
 */
export interface AliasTemplateInput {
  name: string;
  description: string;
  patterns: string[];
}

/**
 * Input for intention template generation
 */
export interface IntentionTemplateInput {
  id: string;
  name: string;
  description: string;
  requirements: IntentionRequirement[];
}

/**
 * Options for scaffolding
 */
export interface ScaffoldOptions {
  /** Project type to scaffold for */
  projectType: ProjectType;
  /** Base path for scaffolding */
  basePath: string;
  /** Whether to create source directories if missing */
  createSourceDirs?: boolean;
  /** Custom alias definitions to include */
  customAliases?: AliasTemplateInput[];
  /** Custom intentions to include */
  customIntentions?: IntentionTemplateInput[];
  /** Overwrite existing files */
  overwrite?: boolean;
}

/**
 * Result of scaffolding operation
 */
export interface ScaffoldResult {
  /** Whether scaffolding was successful */
  success: boolean;
  /** Paths of created directories */
  createdDirectories: string[];
  /** Paths of created files */
  createdFiles: string[];
  /** Paths that were skipped (already exist) */
  skippedPaths: string[];
  /** Any errors encountered */
  errors: string[];
}

/**
 * Template definitions for different project types
 */
export interface ProjectTemplates {
  typescript: {
    aliases: AliasTemplateInput[];
    intentions: IntentionTemplateInput[];
    sourceDirs: string[];
  };
  java: {
    aliases: AliasTemplateInput[];
    intentions: IntentionTemplateInput[];
    sourceDirs: string[];
  };
  hybrid: {
    aliases: AliasTemplateInput[];
    intentions: IntentionTemplateInput[];
    sourceDirs: string[];
  };
  unknown: {
    aliases: AliasTemplateInput[];
    intentions: IntentionTemplateInput[];
    sourceDirs: string[];
  };
}
