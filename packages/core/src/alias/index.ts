/**
 * Alias management system for AgentX
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { AliasDefinition, ResolvedFile, PersonaDefinition } from '../types';
import { loadConfig, resolveKnowledgeBasePath } from '../config';

/**
 * Get the alias directory path
 */
function getAliasDir(): string {
  const config = loadConfig();
  const knowledgeBase = resolveKnowledgeBasePath(config.knowledgeBase);
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
  const basePath = resolveKnowledgeBasePath(config.knowledgeBase);

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
 * Get the personas directory path
 */
function getPersonasDir(): string {
  const config = loadConfig();
  const knowledgeBase = resolveKnowledgeBasePath(config.knowledgeBase);
  return path.join(knowledgeBase, '.ai-config', 'personas');
}

/**
 * Check if personas directory exists
 */
export function personasDirectoryExists(): boolean {
  return fs.existsSync(getPersonasDir());
}

/**
 * Get the personas directory path (public)
 */
export function getPersonasDirectoryPath(): string {
  return getPersonasDir();
}

/**
 * Load all personas from the personas directory
 */
export function getPersonas(): PersonaDefinition[] {
  const personasDir = getPersonasDir();

  if (!fs.existsSync(personasDir)) {
    return [];
  }

  const personaFiles = fs.readdirSync(personasDir).filter((f) => f.endsWith('.json'));
  const personas: PersonaDefinition[] = [];

  for (const file of personaFiles) {
    try {
      const content = fs.readFileSync(path.join(personasDir, file), 'utf-8');
      const persona = JSON.parse(content) as PersonaDefinition;
      personas.push(persona);
    } catch (error) {
      // Skip invalid persona files
      continue;
    }
  }

  return personas;
}

/**
 * Get a specific persona by ID
 */
export function getPersona(id: string): PersonaDefinition | null {
  const personas = getPersonas();
  return personas.find((p) => p.id === id) || null;
}

/**
 * Get the active persona (runtime - no longer stored in config)
 * Returns null as activePersona is now a runtime concept
 */
export function getActivePersona(): PersonaDefinition | null {
  // Active persona is now a runtime concept, not stored in config
  // The VS Code extension manages this at runtime based on which participant is used
  return null;
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

