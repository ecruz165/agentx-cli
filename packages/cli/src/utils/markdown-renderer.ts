/**
 * Markdown rendering utilities for terminal output
 */

import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Configure marked to use terminal renderer with default options
marked.setOptions({
  renderer: new TerminalRenderer() as any, // Type assertion needed due to marked types
});

/**
 * Render markdown content for terminal display
 * @param content - Markdown content to render
 * @param enableFormatting - Whether to enable markdown formatting (default: true)
 * @returns Formatted content for terminal display
 */
export function renderMarkdown(content: string, enableFormatting: boolean = true): string {
  if (!enableFormatting) {
    return content;
  }

  try {
    // Parse and render markdown (marked.parse is synchronous)
    const rendered = marked.parse(content, { async: false }) as string;
    return rendered;
  } catch (error) {
    // If rendering fails, return original content
    console.error('Error rendering markdown:', error);
    return content;
  }
}

/**
 * Check if content appears to be markdown
 * @param content - Content to check
 * @returns True if content contains markdown syntax
 */
export function isMarkdown(content: string): boolean {
  // Check for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m, // Headers
    /```[\s\S]*?```/, // Code blocks
    /\*\*.*?\*\*/, // Bold
    /\*.*?\*/, // Italic
    /^\s*[-*+]\s/m, // Unordered lists
    /^\s*\d+\.\s/m, // Ordered lists
    /\[.*?\]\(.*?\)/, // Links
  ];

  return markdownPatterns.some((pattern) => pattern.test(content));
}

