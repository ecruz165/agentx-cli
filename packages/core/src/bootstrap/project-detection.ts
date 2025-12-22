/**
 * Project root detection utilities
 * Detects if a directory is a project root by looking for marker files
 */

import fs from 'fs';
import path from 'path';
import { ProjectRootResult, ProjectMarker } from './types';

/**
 * Priority order for project markers (highest priority first)
 * Higher priority markers indicate more specific project types
 */
const MARKER_PRIORITY: ProjectMarker[] = [
  'pom.xml', // Java/Maven projects
  'build.gradle', // Java/Gradle projects
  'build.gradle.kts', // Java/Gradle Kotlin DSL
  'package.json', // Node.js projects
  'tsconfig.json', // TypeScript projects
  'tsconfig.base.json', // TypeScript monorepos
  'Cargo.toml', // Rust projects
  'go.mod', // Go projects
  'pyproject.toml', // Python projects (modern)
  'requirements.txt', // Python projects
  '.git', // Git repository root
];

/**
 * Check if a specific marker file exists in a directory
 *
 * @param dirPath - Directory to check
 * @param marker - Marker to look for
 * @returns boolean indicating if marker exists
 */
export function hasMarker(dirPath: string, marker: ProjectMarker): boolean {
  try {
    const markerPath = path.join(dirPath, marker);
    return fs.existsSync(markerPath);
  } catch {
    return false;
  }
}

/**
 * Detect if a directory is a project root by looking for marker files
 *
 * @param dirPath - Directory path to check
 * @returns Detection result with markers found
 */
export function detectProjectRoot(dirPath: string): ProjectRootResult {
  const absolutePath = path.resolve(dirPath);
  const detectedMarkers: ProjectMarker[] = [];
  let primaryMarker: ProjectMarker | undefined;

  // Check each marker in priority order
  for (const marker of MARKER_PRIORITY) {
    if (hasMarker(absolutePath, marker)) {
      detectedMarkers.push(marker);
      // First detected marker (highest priority) becomes primary
      if (!primaryMarker) {
        primaryMarker = marker;
      }
    }
  }

  return {
    isProjectRoot: detectedMarkers.length > 0,
    path: absolutePath,
    detectedMarkers,
    primaryMarker,
  };
}

/**
 * Find the project root by walking up from a given path
 *
 * @param startPath - Starting path to search from
 * @param maxDepth - Maximum number of parent directories to check (default: 10)
 * @returns Project root result, or null if not found within maxDepth
 */
export function findProjectRoot(
  startPath: string,
  maxDepth: number = 10
): ProjectRootResult | null {
  let currentPath = path.resolve(startPath);
  let depth = 0;

  while (depth < maxDepth) {
    const result = detectProjectRoot(currentPath);

    if (result.isProjectRoot) {
      return result;
    }

    // Move to parent directory
    const parentPath = path.dirname(currentPath);

    // Check if we've reached the root
    if (parentPath === currentPath) {
      break;
    }

    currentPath = parentPath;
    depth++;
  }

  return null;
}

/**
 * Get the primary language/platform based on detected markers
 *
 * @param markers - Array of detected markers
 * @returns Primary language identifier
 */
export function getPrimaryLanguage(
  markers: ProjectMarker[]
): 'java' | 'typescript' | 'javascript' | 'rust' | 'go' | 'python' | 'unknown' {
  // Check markers in order of specificity
  if (markers.includes('pom.xml') || markers.includes('build.gradle') || markers.includes('build.gradle.kts')) {
    return 'java';
  }
  if (markers.includes('tsconfig.json') || markers.includes('tsconfig.base.json')) {
    return 'typescript';
  }
  if (markers.includes('package.json')) {
    return 'javascript';
  }
  if (markers.includes('Cargo.toml')) {
    return 'rust';
  }
  if (markers.includes('go.mod')) {
    return 'go';
  }
  if (markers.includes('pyproject.toml') || markers.includes('requirements.txt')) {
    return 'python';
  }
  return 'unknown';
}

/**
 * Check if directory appears to be a monorepo
 *
 * @param dirPath - Directory to check
 * @returns boolean indicating if it looks like a monorepo
 */
export function isMonorepo(dirPath: string): boolean {
  const absolutePath = path.resolve(dirPath);

  // Check for common monorepo indicators
  const monorepoIndicators = [
    'lerna.json',
    'pnpm-workspace.yaml',
    'rush.json',
    'nx.json',
  ];

  for (const indicator of monorepoIndicators) {
    if (fs.existsSync(path.join(absolutePath, indicator))) {
      return true;
    }
  }

  // Check package.json for workspaces
  const packageJsonPath = path.join(absolutePath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.workspaces) {
        return true;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for packages/ or apps/ directories
  const commonMonorepoDirs = ['packages', 'apps', 'libs', 'modules'];
  for (const dir of commonMonorepoDirs) {
    const dirToCheck = path.join(absolutePath, dir);
    if (fs.existsSync(dirToCheck) && fs.statSync(dirToCheck).isDirectory()) {
      return true;
    }
  }

  return false;
}
