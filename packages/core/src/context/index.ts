/**
 * Context file aggregation system for AgentX
 */

import fs from 'fs';
import path from 'path';
import { ExecutionSettings, AliasDefinition, ResolvedFile, ToonConversionConfig, PersonaDefinition } from '../types';
import { resolveAlias, getActivePersona } from '../alias';
import { loadConfig, resolveKnowledgeBasePath } from '../config';
import { processContent, DEFAULT_TOON_CONFIG } from '../toon';

/**
 * Result of building context from files
 */
export interface ContextResult {
  files: ResolvedFile[];
  totalSize: number;
  truncated: boolean;
  content: string;
  /** Persona context prefix if active persona has perspective/systemPrompt */
  personaContext?: string;
}

/**
 * Options for building context
 */
export interface BuildContextOptions {
  maxSize?: number;
  excludePatterns?: string[];
  /** Override TOON conversion settings */
  toonConversion?: ToonConversionConfig;
  /** Disable TOON conversion entirely */
  disableToonConversion?: boolean;
}

/**
 * Build context from an alias and optional additional files
 */
export async function buildContext(
  alias: AliasDefinition,
  additionalFiles?: string[],
  options?: BuildContextOptions
): Promise<ContextResult> {
  const config = loadConfig();
  const basePath = resolveKnowledgeBasePath(config.knowledgeBase);
  const maxSize = options?.maxSize || config.maxContextSize;

  // Determine TOON conversion settings
  const toonConfig = options?.disableToonConversion
    ? undefined
    : options?.toonConversion || config.toonConversion || DEFAULT_TOON_CONFIG;

  // Resolve alias files
  const aliasFiles = await resolveAlias(alias);

  // Add additional files
  const allFiles: ResolvedFile[] = [...aliasFiles];

  if (additionalFiles) {
    for (const file of additionalFiles) {
      try {
        const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
        const stat = fs.statSync(fullPath);
        allFiles.push({
          path: file,
          size: stat.size,
        });
      } catch {
        // Skip files that can't be read
        continue;
      }
    }
  }

  // Calculate total size
  let totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
  let truncated = false;
  let filesToInclude = allFiles;

  // Check against max context size and truncate if needed
  if (totalSize > maxSize) {
    truncated = true;
    filesToInclude = truncateFiles(allFiles, maxSize);
    totalSize = filesToInclude.reduce((sum, f) => sum + f.size, 0);
  }

  // Build content string with optional TOON conversion
  const fileContent = buildContentString(filesToInclude, basePath, additionalFiles, toonConfig);

  // Build persona context prefix if active persona has perspective settings
  const activePersona = getActivePersona();
  const personaContext = buildPersonaContext(activePersona);

  // Combine persona context with file content
  const content = personaContext ? `${personaContext}\n\n${fileContent}` : fileContent;

  return {
    files: filesToInclude,
    totalSize: totalSize + (personaContext?.length || 0),
    truncated,
    content,
    personaContext,
  };
}

/**
 * Build persona context prefix from active persona settings
 */
function buildPersonaContext(persona: PersonaDefinition | null): string | undefined {
  if (!persona) {
    return undefined;
  }

  // Check if persona has any perspective settings
  const hasSettings = persona.systemPrompt || persona.perspective || persona.tone ||
                      persona.focusAreas?.length || persona.avoidAreas?.length;

  if (!hasSettings) {
    return undefined;
  }

  const parts: string[] = [];

  // Add system prompt if present
  if (persona.systemPrompt) {
    parts.push(`[SYSTEM]\n${persona.systemPrompt}`);
  }

  // Add perspective section
  if (persona.perspective || persona.tone || persona.focusAreas?.length || persona.avoidAreas?.length) {
    parts.push(`[PERSPECTIVE: ${persona.name}]`);

    if (persona.perspective) {
      parts.push(persona.perspective);
    }

    if (persona.tone) {
      parts.push(`Tone: ${persona.tone}`);
    }

    if (persona.focusAreas?.length) {
      parts.push(`Focus on: ${persona.focusAreas.join(', ')}`);
    }

    if (persona.avoidAreas?.length) {
      parts.push(`Avoid: ${persona.avoidAreas.join(', ')}`);
    }
  }

  return parts.length > 0 ? parts.join('\n') : undefined;
}

/**
 * Truncate files to fit within max size
 * Prioritizes smaller files to maximize file count
 */
function truncateFiles(files: ResolvedFile[], maxSize: number): ResolvedFile[] {
  // Sort by size (smallest first) to include more files
  const sorted = [...files].sort((a, b) => a.size - b.size);

  const included: ResolvedFile[] = [];
  let currentSize = 0;

  for (const file of sorted) {
    if (currentSize + file.size <= maxSize) {
      included.push(file);
      currentSize += file.size;
    }
  }

  return included;
}

/**
 * Build the content string from files
 */
function buildContentString(
  files: ResolvedFile[],
  basePath: string,
  additionalFiles?: string[],
  toonConfig?: ToonConversionConfig
): string {
  const additionalSet = new Set(additionalFiles || []);

  const parts = files.map((f) => {
    let fullPath: string;

    // Check if this is an additional file (absolute or relative to cwd)
    if (additionalSet.has(f.path)) {
      fullPath = path.isAbsolute(f.path) ? f.path : path.join(process.cwd(), f.path);
    } else {
      // Alias file - relative to knowledge base
      fullPath = path.isAbsolute(f.path) ? f.path : path.join(basePath, f.path);
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Apply TOON conversion if configured
      if (toonConfig) {
        const result = processContent(content, f.path, toonConfig);
        content = result.content;
        // Optionally mark converted files
        if (result.converted) {
          return `--- ${f.path} [TOON] ---\n${content}`;
        }
      }

      return `--- ${f.path} ---\n${content}`;
    } catch {
      return `--- ${f.path} ---\n[Error reading file]`;
    }
  });

  return parts.join('\n\n');
}

/**
 * Create execution settings from alias and context
 */
export function createExecutionSettings(
  alias: AliasDefinition,
  context: ContextResult,
  version: string,
  additionalFiles?: string[]
): ExecutionSettings {
  const config = loadConfig();

  return {
    version,
    provider: config.provider,
    alias: alias.name,
    contextFiles: {
      count: context.files.length,
      totalSize: context.totalSize,
      files: context.files.map((f) => f.path),
    },
    knowledgeBase: config.knowledgeBase,
    additionalFiles,
  };
}

/**
 * Read a single file and return its content with metadata
 */
export function readFileWithMetadata(
  filePath: string
): { content: string; size: number } | null {
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const stat = fs.statSync(fullPath);

    return {
      content,
      size: stat.size,
    };
  } catch {
    return null;
  }
}

/**
 * Get context summary for display
 */
export function getContextSummary(context: ContextResult): string {
  const { files, totalSize, truncated } = context;
  const sizeKB = (totalSize / 1024).toFixed(1);

  let summary = `${files.length} files (${sizeKB} KB)`;

  if (truncated) {
    summary += ' [truncated]';
  }

  return summary;
}

