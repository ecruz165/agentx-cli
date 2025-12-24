/**
 * Context History Persistence for AgentX
 * 
 * Saves composed context on every /exec command for debuggability and reproducibility.
 * Creates context.md and manifest.json files in .agentx/history/{date}/{timestamp}-{alias}-{intent}/
 */

import fs from 'fs';
import path from 'path';
import { HistoryConfig, HistoryEntry, HistoryManifest } from '../types';
import { getBasePath } from '../config';

/**
 * Default history configuration
 */
export const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
  enabled: true,
  retainDays: 7,
  maxEntries: 100,
  location: '.agentx/history',
  includeWorkspaceFiles: true,
  compressAfterDays: 1,
};

/**
 * Get the history directory path
 */
export function getHistoryPath(config?: Partial<HistoryConfig>): string {
  const location = config?.location || DEFAULT_HISTORY_CONFIG.location;
  return path.join(getBasePath(), location);
}

/**
 * Generate a safe directory name from timestamp, alias, and intent
 */
function generateEntryDirName(timestamp: string, contextGroup: string, intent?: string): string {
  const date = new Date(timestamp);
  const time = date.toTimeString().slice(0, 5).replace(':', '');
  const safeName = contextGroup.replace(/[^a-zA-Z0-9-_]/g, '-');
  const safeIntent = intent ? `-${intent.replace(/[^a-zA-Z0-9-_]/g, '-')}` : '';
  return `${time}-${safeName}${safeIntent}`;
}

/**
 * Get the date folder name (YYYY-MM-DD)
 */
function getDateFolder(timestamp: string): string {
  return timestamp.slice(0, 10);
}

/**
 * Get the full path for a history entry
 */
export function getEntryPath(timestamp: string, contextGroup: string, intent?: string, config?: Partial<HistoryConfig>): string {
  const historyPath = getHistoryPath(config);
  const dateFolder = getDateFolder(timestamp);
  const entryDir = generateEntryDirName(timestamp, contextGroup, intent);
  return path.join(historyPath, dateFolder, entryDir);
}

/**
 * Generate context.md content from history entry
 */
export function generateContextMarkdown(entry: HistoryEntry): string {
  const parts: string[] = [];

  // Header
  parts.push('# AgentX Context\n');

  // Metadata section
  parts.push('## Metadata');
  parts.push(`- **Timestamp:** ${entry.timestamp}`);
  parts.push(`- **Participant:** ${entry.participant}`);
  parts.push(`- **Context Group:** ${entry.contextGroup}`);
  if (entry.intent) {
    parts.push(`- **Intent:** ${entry.intent}`);
  }
  parts.push(`- **User Prompt:** ${entry.prompt}`);
  parts.push('');
  parts.push('---\n');

  // Persona section
  if (entry.personaContent) {
    parts.push('## Persona');
    parts.push(entry.personaContent);
    parts.push('');
    parts.push('---\n');
  }

  // Conventions section
  if (entry.conventionsContent) {
    parts.push('## Conventions');
    parts.push(entry.conventionsContent);
    parts.push('');
    parts.push('---\n');
  }

  // Dynamic context section
  if (entry.dynamicContent) {
    parts.push('## Dynamic Context');
    parts.push(entry.dynamicContent);
    parts.push('');
    parts.push('---\n');
  }

  // Intent section
  if (entry.intentContent) {
    parts.push('## Intent');
    parts.push(entry.intentContent);
    parts.push('');
    parts.push('---\n');
  }

  // Output templates section
  if (entry.templatesContent) {
    parts.push('## Output Templates');
    parts.push(entry.templatesContent);
    parts.push('');
    parts.push('---\n');
  }

  // Workspace files section
  if (entry.workspaceContent) {
    parts.push('## Workspace Files');
    parts.push(entry.workspaceContent);
    parts.push('');
    parts.push('---\n');
  }

  // Final prompt section
  parts.push('## Final Prompt');
  parts.push(entry.finalPrompt);
  parts.push('');

  return parts.join('\n');
}

/**
 * Generate manifest.json content from history entry
 */
export function generateManifest(entry: HistoryEntry): HistoryManifest {
  return {
    version: '1.0',
    timestamp: entry.timestamp,
    participant: entry.participant,
    contextGroup: entry.contextGroup,
    intent: entry.intent,
    prompt: entry.prompt,
    sources: entry.sources,
    stats: entry.stats,
  };
}

/**
 * Save a history entry to disk
 * Returns the path to the saved context.md file
 */
export async function saveHistoryEntry(
  entry: HistoryEntry,
  config?: Partial<HistoryConfig>
): Promise<{ contextPath: string; manifestPath: string; entryPath: string }> {
  const historyConfig = { ...DEFAULT_HISTORY_CONFIG, ...config };

  if (!historyConfig.enabled) {
    throw new Error('History saving is disabled');
  }

  const entryPath = getEntryPath(entry.timestamp, entry.contextGroup, entry.intent, historyConfig);

  // Create directory structure
  fs.mkdirSync(entryPath, { recursive: true });

  // Generate and save context.md
  const contextContent = generateContextMarkdown(entry);
  const contextPath = path.join(entryPath, 'context.md');
  fs.writeFileSync(contextPath, contextContent, 'utf-8');

  // Generate and save manifest.json
  const manifest = generateManifest(entry);
  const manifestPath = path.join(entryPath, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  return { contextPath, manifestPath, entryPath };
}

/**
 * List all history entries, sorted by timestamp (newest first)
 */
export async function listHistoryEntries(
  config?: Partial<HistoryConfig>
): Promise<Array<{ date: string; time: string; contextGroup: string; intent?: string; path: string }>> {
  const historyPath = getHistoryPath(config);
  const entries: Array<{ date: string; time: string; contextGroup: string; intent?: string; path: string }> = [];

  if (!fs.existsSync(historyPath)) {
    return entries;
  }

  // Read date folders
  const dateFolders = fs.readdirSync(historyPath)
    .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
    .sort()
    .reverse();

  for (const dateFolder of dateFolders) {
    const datePath = path.join(historyPath, dateFolder);
    const stat = fs.statSync(datePath);

    if (!stat.isDirectory()) continue;

    // Read entry folders within date
    const entryFolders = fs.readdirSync(datePath)
      .filter(f => fs.statSync(path.join(datePath, f)).isDirectory())
      .sort()
      .reverse();

    for (const entryFolder of entryFolders) {
      const entryPath = path.join(datePath, entryFolder);
      const manifestPath = path.join(entryPath, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest: HistoryManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          entries.push({
            date: dateFolder,
            time: entryFolder.slice(0, 4),
            contextGroup: manifest.contextGroup,
            intent: manifest.intent,
            path: entryPath,
          });
        } catch {
          // Skip invalid manifests
        }
      }
    }
  }

  return entries;
}

/**
 * Get the most recent history entry path
 */
export async function getLastHistoryEntry(
  config?: Partial<HistoryConfig>
): Promise<string | null> {
  const entries = await listHistoryEntries(config);
  return entries.length > 0 ? entries[0].path : null;
}

/**
 * Clean up old history entries based on retention policy
 */
export async function cleanupHistory(config?: Partial<HistoryConfig>): Promise<number> {
  const historyConfig = { ...DEFAULT_HISTORY_CONFIG, ...config };
  const historyPath = getHistoryPath(historyConfig);
  let deletedCount = 0;

  if (!fs.existsSync(historyPath)) {
    return 0;
  }

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - historyConfig.retainDays * 24 * 60 * 60 * 1000);
  const cutoffDateStr = cutoffDate.toISOString().slice(0, 10);

  // Get all entries
  const entries = await listHistoryEntries(historyConfig);

  // Delete entries older than retention period
  for (const entry of entries) {
    if (entry.date < cutoffDateStr) {
      try {
        fs.rmSync(entry.path, { recursive: true, force: true });
        deletedCount++;
      } catch {
        // Ignore deletion errors
      }
    }
  }

  // Enforce max entries limit
  const remainingEntries = await listHistoryEntries(historyConfig);
  if (remainingEntries.length > historyConfig.maxEntries) {
    const toDelete = remainingEntries.slice(historyConfig.maxEntries);
    for (const entry of toDelete) {
      try {
        fs.rmSync(entry.path, { recursive: true, force: true });
        deletedCount++;
      } catch {
        // Ignore deletion errors
      }
    }
  }

  // Clean up empty date folders
  const dateFolders = fs.readdirSync(historyPath)
    .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f));

  for (const dateFolder of dateFolders) {
    const datePath = path.join(historyPath, dateFolder);
    try {
      const contents = fs.readdirSync(datePath);
      if (contents.length === 0) {
        fs.rmdirSync(datePath);
      }
    } catch {
      // Ignore errors
    }
  }

  return deletedCount;
}

/**
 * Clear all history entries
 */
export async function clearHistory(config?: Partial<HistoryConfig>): Promise<void> {
  const historyPath = getHistoryPath(config);

  if (fs.existsSync(historyPath)) {
    fs.rmSync(historyPath, { recursive: true, force: true });
  }
}

/**
 * Estimate token count from byte size (rough approximation: 4 chars per token)
 */
export function estimateTokens(bytes: number): number {
  return Math.ceil(bytes / 4);
}

/**
 * Check if .gitignore contains the history path
 */
export function isHistoryInGitignore(config?: Partial<HistoryConfig>): boolean {
  const gitignorePath = path.join(getBasePath(), '.gitignore');
  const historyLocation = config?.location || DEFAULT_HISTORY_CONFIG.location;

  if (!fs.existsSync(gitignorePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    // Check for exact match or pattern that would match
    const patterns = [
      historyLocation,
      `${historyLocation}/`,
      `.agentx/history`,
      `.agentx/history/`,
      `.agentx/`,
      `.agentx`,
    ];

    return patterns.some(pattern =>
      content.split('\n').some(line => line.trim() === pattern)
    );
  } catch {
    return false;
  }
}

/**
 * Add history path to .gitignore
 * Returns true if added, false if already present or failed
 */
export function addHistoryToGitignore(config?: Partial<HistoryConfig>): boolean {
  const gitignorePath = path.join(getBasePath(), '.gitignore');
  const historyLocation = config?.location || DEFAULT_HISTORY_CONFIG.location;

  if (isHistoryInGitignore(config)) {
    return false; // Already present
  }

  try {
    const entry = `\n# AgentX context history\n${historyLocation}/\n`;

    if (fs.existsSync(gitignorePath)) {
      // Append to existing .gitignore
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      const newContent = content.endsWith('\n') ? content + entry : content + '\n' + entry;
      fs.writeFileSync(gitignorePath, newContent, 'utf-8');
    } else {
      // Create new .gitignore
      fs.writeFileSync(gitignorePath, entry.trim() + '\n', 'utf-8');
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if this is the first time saving history (no history directory exists)
 */
export function isFirstHistorySave(config?: Partial<HistoryConfig>): boolean {
  const historyPath = getHistoryPath(config);
  return !fs.existsSync(historyPath);
}

