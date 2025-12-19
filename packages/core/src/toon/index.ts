/**
 * TOON (Token-Oriented Object Notation) conversion utilities
 * Converts markdown content to TOON format for token optimization
 */

import { ToonConversionConfig } from '../types';

/**
 * Default TOON conversion settings
 */
export const DEFAULT_TOON_CONFIG: ToonConversionConfig = {
  patterns: true,
  reference: true,
  skills: false,
  templates: false,
  frameworks: true,
  intentions: true,
};

/**
 * Determine if a file should be converted to TOON based on its path
 */
export function shouldConvertToToon(
  filePath: string,
  config: ToonConversionConfig = DEFAULT_TOON_CONFIG
): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

  // Check each content type
  if (normalizedPath.includes('.ai-patterns/') || normalizedPath.includes('/patterns/')) {
    return config.patterns ?? true;
  }
  if (normalizedPath.includes('.ai-reference/') || normalizedPath.includes('/reference/')) {
    return config.reference ?? true;
  }
  if (normalizedPath.includes('.ai-skill/') || normalizedPath.includes('/skills/')) {
    return config.skills ?? false;
  }
  if (normalizedPath.includes('.ai-templates/') || normalizedPath.includes('/templates/')) {
    // Exception: intention templates are already TOON
    if (normalizedPath.includes('/intentions/')) {
      return false; // Already TOON format
    }
    return config.templates ?? false;
  }
  if (normalizedPath.includes('.ai-frameworks/') || normalizedPath.includes('/frameworks/')) {
    return config.frameworks ?? true;
  }

  // Default: don't convert unknown paths
  return false;
}

/**
 * Convert markdown content to TOON format
 */
export function convertMarkdownToToon(content: string, filePath?: string): string {
  const lines = content.split('\n');
  const toonLines: string[] = [];
  
  let currentSection = '';
  let listDepth = 0;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  for (const line of lines) {
    // Handle code blocks - preserve as-is
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3);
        codeBlockContent = [];
      } else {
        // End code block - output as TOON code section
        if (codeBlockContent.length > 0) {
          toonLines.push(`  code:`);
          toonLines.push(`    lang: ${codeBlockLang || 'text'}`);
          toonLines.push(`    content: |`);
          for (const codeLine of codeBlockContent) {
            toonLines.push(`      ${codeLine}`);
          }
        }
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Convert headers to sections
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      currentSection = toToonKey(h1Match[1]);
      toonLines.push(`${currentSection}:`);
      listDepth = 0;
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const subsection = toToonKey(h2Match[1]);
      toonLines.push(`  ${subsection}:`);
      listDepth = 1;
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      const subsection = toToonKey(h3Match[1]);
      toonLines.push(`    ${subsection}:`);
      listDepth = 2;
      continue;
    }

    // Convert bullet lists
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (bulletMatch) {
      const indent = '  '.repeat(listDepth + 1);
      toonLines.push(`${indent}- ${bulletMatch[2].trim()}`);
      continue;
    }

    // Convert key: value patterns (already TOON-like)
    const kvMatch = line.match(/^\*\*([^*]+)\*\*[:\s]+(.+)$/);
    if (kvMatch) {
      const indent = '  '.repeat(listDepth + 1);
      const key = toToonKey(kvMatch[1]);
      toonLines.push(`${indent}${key}: ${kvMatch[2].trim()}`);
      continue;
    }

    // Convert table rows to key-value (simplified)
    const tableMatch = line.match(/^\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
    if (tableMatch && !line.includes('---')) {
      const key = toToonKey(tableMatch[1].trim());
      const value = tableMatch[2].trim();
      if (key && value && key !== 'property' && key !== 'field') {
        const indent = '  '.repeat(listDepth + 1);
        toonLines.push(`${indent}${key}: ${value}`);
      }
      continue;
    }

    // Regular text - add as description
    const indent = '  '.repeat(listDepth + 1);
    toonLines.push(`${indent}${line.trim()}`);
  }

  return toonLines.join('\n');
}

/**
 * Convert a string to a valid TOON key (camelCase, no spaces)
 */
function toToonKey(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Process content - convert to TOON if applicable
 */
export function processContent(
  content: string,
  filePath: string,
  config: ToonConversionConfig = DEFAULT_TOON_CONFIG
): { content: string; converted: boolean } {
  // Skip if already TOON format
  if (filePath.endsWith('.toon')) {
    return { content, converted: false };
  }

  // Skip non-markdown files
  if (!filePath.endsWith('.md')) {
    return { content, converted: false };
  }

  // Check if should convert
  if (!shouldConvertToToon(filePath, config)) {
    return { content, converted: false };
  }

  // Convert to TOON
  const toonContent = convertMarkdownToToon(content, filePath);
  return { content: toonContent, converted: true };
}

/**
 * Get file metadata header in TOON format
 */
export function getToonFileHeader(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath;
  return `file:\n  path: ${filePath}\n  name: ${fileName}\n`;
}

/**
 * Wrap content with TOON file header
 */
export function wrapWithToonHeader(content: string, filePath: string): string {
  return `${getToonFileHeader(filePath)}content:\n${content.split('\n').map(l => `  ${l}`).join('\n')}`;
}

