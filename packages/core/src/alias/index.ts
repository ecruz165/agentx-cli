/**
 * Alias management system for AgentX
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { glob } from 'glob';
import { AliasDefinition, ResolvedFile, PersonaDefinition } from '../types';
import { loadConfig } from '../config';

/**
 * Get the alias directory path
 */
function getAliasDir(): string {
  const config = loadConfig();
  const knowledgeBase = config.knowledgeBase.replace(/^~/, os.homedir());
  return path.join(knowledgeBase, '.ai-config', 'aliases');
}

/**
 * Load all alias definitions from the alias directory
 */
export async function loadAliases(): Promise<AliasDefinition[]> {
  const aliasDir = getAliasDir();

  if (!fs.existsSync(aliasDir)) {
    return [];
  }

  const aliasFiles = fs.readdirSync(aliasDir).filter((f) => f.endsWith('.json'));

  const aliases: AliasDefinition[] = [];

  for (const file of aliasFiles) {
    try {
      const content = fs.readFileSync(path.join(aliasDir, file), 'utf-8');
      const alias = JSON.parse(content) as AliasDefinition;
      aliases.push(alias);
    } catch (error) {
      // Skip invalid alias files
      continue;
    }
  }

  return aliases;
}

/**
 * Resolve an alias to its matching files
 */
export async function resolveAlias(alias: AliasDefinition): Promise<ResolvedFile[]> {
  const config = loadConfig();
  const basePath = config.knowledgeBase.replace(/^~/, os.homedir());

  const files: ResolvedFile[] = [];

  for (const pattern of alias.patterns) {
    try {
      const matches = await glob(pattern, {
        cwd: basePath,
        nodir: true,
      });

      for (const match of matches) {
        const fullPath = path.join(basePath, match);
        try {
          const stat = fs.statSync(fullPath);
          files.push({
            path: match,
            size: stat.size,
          });
        } catch {
          // Skip files that can't be stat'd
          continue;
        }
      }
    } catch {
      // Skip invalid patterns
      continue;
    }
  }

  return files;
}

/**
 * Get a specific alias by name
 */
export async function getAlias(name: string): Promise<AliasDefinition | null> {
  const aliases = await loadAliases();
  return aliases.find((a) => a.name === name) || null;
}

/**
 * Get an alias with its resolved files
 */
export async function getAliasWithFiles(
  name: string
): Promise<(AliasDefinition & { resolvedFiles: ResolvedFile[] }) | null> {
  const alias = await getAlias(name);

  if (!alias) {
    return null;
  }

  const resolvedFiles = await resolveAlias(alias);

  return {
    ...alias,
    resolvedFiles,
  };
}

/**
 * Calculate total size of resolved files
 */
export function calculateTotalSize(files: ResolvedFile[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Check if alias directory exists
 */
export function aliasDirectoryExists(): boolean {
  return fs.existsSync(getAliasDir());
}

/**
 * Get the alias directory path (for display)
 */
export function getAliasDirectoryPath(): string {
  return getAliasDir();
}

/**
 * Get all personas from config
 */
export function getPersonas(): PersonaDefinition[] {
  const config = loadConfig();
  return config.personas || [];
}

/**
 * Get a specific persona by ID
 */
export function getPersona(id: string): PersonaDefinition | null {
  const personas = getPersonas();
  return personas.find((p) => p.id === id) || null;
}

/**
 * Get the active persona from config
 */
export function getActivePersona(): PersonaDefinition | null {
  const config = loadConfig();
  if (!config.activePersona) {
    return null;
  }
  return getPersona(config.activePersona);
}

/**
 * Check if an alias name matches a pattern (supports wildcards)
 */
function matchesPattern(aliasName: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }

  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*') // Convert * to .*
    .replace(/\?/g, '.'); // Convert ? to .

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(aliasName);
}

/**
 * Filter aliases by persona patterns
 */
export function filterAliasesByPersona(
  aliases: AliasDefinition[],
  persona: PersonaDefinition | null
): AliasDefinition[] {
  // If no persona, return all aliases
  if (!persona) {
    return aliases;
  }

  return aliases.filter((alias) =>
    persona.aliasPatterns.some((pattern) => matchesPattern(alias.name, pattern))
  );
}

/**
 * Load aliases filtered by active persona
 */
export async function loadAliasesForActivePersona(): Promise<AliasDefinition[]> {
  const aliases = await loadAliases();
  const activePersona = getActivePersona();
  return filterAliasesByPersona(aliases, activePersona);
}

