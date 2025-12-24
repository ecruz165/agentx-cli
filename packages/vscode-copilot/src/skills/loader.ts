/**
 * Skill Loader
 * Loads and caches skill definitions from YAML files
 * Skills are stored in <knowledgeBase>/.context/skills/
 */

import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as path from 'path';
import { loadConfig, resolveKnowledgeBasePath } from '@agentx/core';
import { Skill } from './types';

/**
 * Get the skills directory path from knowledge base
 */
function getSkillsDir(): string {
  const config = loadConfig();
  const kbPath = resolveKnowledgeBasePath(config.knowledgeBase);
  return path.join(kbPath, '.context', 'skills');
}

/**
 * Skill loader with caching and validation
 */
export class SkillLoader {
  private cache: Map<string, Skill> = new Map();
  private skillsDir: string;
  private watcher?: vscode.FileSystemWatcher;

  constructor(_workspaceRoot?: string) {
    // Get skills directory from knowledge base config
    this.skillsDir = getSkillsDir();
  }

  /**
   * Load a skill by ID
   */
  async load(skillId: string): Promise<Skill> {
    // Check cache
    if (this.cache.has(skillId)) {
      return this.cache.get(skillId)!;
    }

    // Try YAML first, then JSON
    let content: string | null = null;
    let filePath = path.join(this.skillsDir, `${skillId}.yaml`);

    try {
      const uri = vscode.Uri.file(filePath);
      const data = await vscode.workspace.fs.readFile(uri);
      content = Buffer.from(data).toString('utf-8');
    } catch {
      // Try JSON
      filePath = path.join(this.skillsDir, `${skillId}.json`);
      try {
        const uri = vscode.Uri.file(filePath);
        const data = await vscode.workspace.fs.readFile(uri);
        content = Buffer.from(data).toString('utf-8');
      } catch {
        throw new Error(`Skill not found: ${skillId}`);
      }
    }

    // Parse content
    let skill: Skill;
    if (filePath.endsWith('.yaml')) {
      skill = yaml.parse(content) as Skill;
    } else {
      skill = JSON.parse(content) as Skill;
    }

    // Validate schema
    this.validateSchema(skill);

    // Cache and return
    this.cache.set(skillId, skill);
    return skill;
  }

  /**
   * Load all skills from the skills directory
   */
  async loadAll(): Promise<Skill[]> {
    const uri = vscode.Uri.file(this.skillsDir);

    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      const skills: Skill[] = [];

      for (const [name, type] of entries) {
        if (type === vscode.FileType.File && (name.endsWith('.yaml') || name.endsWith('.json'))) {
          const skillId = name.replace(/\.(yaml|json)$/, '');
          try {
            skills.push(await this.load(skillId));
          } catch (error) {
            console.warn(`Failed to load skill ${skillId}:`, error);
          }
        }
      }

      return skills;
    } catch {
      // Directory doesn't exist
      return [];
    }
  }

  /**
   * Check if a skill exists
   */
  async exists(skillId: string): Promise<boolean> {
    const yamlPath = path.join(this.skillsDir, `${skillId}.yaml`);
    const jsonPath = path.join(this.skillsDir, `${skillId}.json`);

    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(yamlPath));
      return true;
    } catch {
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(jsonPath));
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get skill by ID (returns null if not found)
   */
  async get(skillId: string): Promise<Skill | null> {
    try {
      return await this.load(skillId);
    } catch {
      return null;
    }
  }

  /**
   * Invalidate cache
   */
  invalidateCache(skillId?: string): void {
    if (skillId) {
      this.cache.delete(skillId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Start watching for skill file changes
   */
  startWatching(): void {
    if (this.watcher) {
      return;
    }

    const pattern = new vscode.RelativePattern(this.skillsDir, '*.{yaml,json}');
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.watcher.onDidChange((uri) => {
      const skillId = path.basename(uri.fsPath).replace(/\.(yaml|json)$/, '');
      this.invalidateCache(skillId);
    });

    this.watcher.onDidDelete((uri) => {
      const skillId = path.basename(uri.fsPath).replace(/\.(yaml|json)$/, '');
      this.invalidateCache(skillId);
    });

    this.watcher.onDidCreate(() => {
      // New skill added, cache will be populated on demand
    });
  }

  /**
   * Stop watching for changes
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }
  }

  /**
   * Validate skill schema
   */
  private validateSchema(skill: Skill): void {
    if (!skill.id) {
      throw new Error('Skill missing required field: id');
    }
    if (!skill.name) {
      throw new Error('Skill missing required field: name');
    }
    if (!skill.type) {
      throw new Error('Skill missing required field: type');
    }

    switch (skill.type) {
      case 'script':
        if (!skill.run) {
          throw new Error('Script skill missing required field: run');
        }
        break;
      case 'make':
        if (!skill.target) {
          throw new Error('Make skill missing required field: target');
        }
        break;
      case 'llm':
        if (!skill.prompt) {
          throw new Error('LLM skill missing required field: prompt');
        }
        break;
      default:
        throw new Error(`Unknown skill type: ${skill.type}`);
    }
  }

  /**
   * Get the skills directory path
   */
  getSkillsDir(): string {
    return this.skillsDir;
  }
}
