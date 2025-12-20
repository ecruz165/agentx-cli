#!/usr/bin/env npx ts-node
/**
 * Build-time command generator for AgentX VS Code extension
 * 
 * Reads personas, aliases, and intentions from the knowledge base config
 * and generates chatParticipant commands in package.json
 * 
 * This enables VS Code's auto-suggest for commands like:
 *   @agentx-backend /exec:be-api:create-new "Create customer endpoint"
 * 
 * Usage: npx ts-node scripts/generate-commands.ts [--knowledge-base <path>]
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

interface PersonaDefinition {
  id: string;
  name: string;
  description: string;
  aliasPatterns: string[];
}

interface AliasDefinition {
  name: string;
  description: string;
  patterns: string[];
}

interface IntentionDefinition {
  id: string;
  name: string;
  description: string;
  applicableAliases?: string[];
}

interface ChatCommand {
  name: string;
  description: string;
}

interface ChatParticipant {
  id: string;
  name: string;
  fullName?: string;
  description: string;
  isSticky?: boolean;
  commands: ChatCommand[];
}

interface AgentXConfig {
  knowledgeBase: string;
  personas?: PersonaDefinition[];
}

// Parse command line arguments
function parseArgs(): { knowledgeBase?: string } {
  const args = process.argv.slice(2);
  const result: { knowledgeBase?: string } = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--knowledge-base' && args[i + 1]) {
      result.knowledgeBase = args[i + 1];
      i++;
    }
  }
  
  return result;
}

// Load config from knowledge base
function loadConfig(knowledgeBasePath: string): AgentXConfig | null {
  const configPath = path.join(knowledgeBasePath, '.ai-config', 'config.json');
  if (!fs.existsSync(configPath)) {
    console.warn(`Config not found at: ${configPath}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to parse config: ${error}`);
    return null;
  }
}

// Load all aliases from knowledge base
function loadAliases(knowledgeBasePath: string): AliasDefinition[] {
  const aliasDir = path.join(knowledgeBasePath, '.ai-config', 'aliases');
  if (!fs.existsSync(aliasDir)) {
    return [];
  }
  
  const files = fs.readdirSync(aliasDir).filter(f => f.endsWith('.json'));
  const aliases: AliasDefinition[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(aliasDir, file), 'utf-8');
      aliases.push(JSON.parse(content));
    } catch {
      continue;
    }
  }
  
  return aliases;
}

// Load all intentions from knowledge base
function loadIntentions(knowledgeBasePath: string): IntentionDefinition[] {
  const intentionsDir = path.join(knowledgeBasePath, '.ai-config', 'intentions');
  if (!fs.existsSync(intentionsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(intentionsDir).filter(f => f.endsWith('.json'));
  const intentions: IntentionDefinition[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(intentionsDir, file), 'utf-8');
      intentions.push(JSON.parse(content));
    } catch {
      continue;
    }
  }
  
  return intentions;
}

// Check if alias matches persona patterns
function aliasMatchesPersona(aliasName: string, persona: PersonaDefinition): boolean {
  return persona.aliasPatterns.some(pattern => {
    if (pattern === '*') return true;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    return regex.test(aliasName);
  });
}

// Get intentions applicable to an alias
function getIntentionsForAlias(aliasName: string, intentions: IntentionDefinition[]): IntentionDefinition[] {
  return intentions.filter(i => 
    !i.applicableAliases || 
    i.applicableAliases.length === 0 || 
    i.applicableAliases.includes(aliasName)
  );
}

// Generate base commands (always present)
function generateBaseCommands(): ChatCommand[] {
  return [
    { name: 'alias', description: 'Manage context aliases (list, show)' },
    { name: 'config', description: 'View configuration (show, path)' },
    { name: 'intentions', description: 'List or show intentions' },
    { name: 'init', description: 'Project initialization guidance' },
    { name: 'help', description: 'Show available commands' },
  ];
}

