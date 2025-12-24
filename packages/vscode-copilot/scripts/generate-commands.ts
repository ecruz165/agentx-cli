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

// Load config from .agentx folder at project root
function loadConfig(projectRoot: string): AgentXConfig | null {
  const configPath = path.join(projectRoot, '.agentx', 'config.json');
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

// Load all aliases from <knowledgeBase>/.context/aliases
function loadAliases(knowledgeBasePath: string): AliasDefinition[] {
  const aliasDir = path.join(knowledgeBasePath, '.context', 'aliases');
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

// Load all intentions from <knowledgeBase>/.context/intentions
function loadIntentions(knowledgeBasePath: string): IntentionDefinition[] {
  const intentionsDir = path.join(knowledgeBasePath, '.context', 'intentions');
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

// Load all personas from <knowledgeBase>/.context/personas
function loadPersonas(knowledgeBasePath: string): PersonaDefinition[] {
  const personasDir = path.join(knowledgeBasePath, '.context', 'personas');
  if (!fs.existsSync(personasDir)) {
    return [];
  }

  const files = fs.readdirSync(personasDir).filter(f => f.endsWith('.json'));
  const personas: PersonaDefinition[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(personasDir, file), 'utf-8');
      personas.push(JSON.parse(content));
    } catch {
      continue;
    }
  }

  return personas;
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
    { name: 'init', description: 'Initialize AgentX - detect project and scaffold .agentx' },
    { name: 'init:analyze', description: 'Analyze project type and dependencies without scaffolding' },
    { name: 'init:scaffold', description: 'Scaffold .agentx with detected project settings' },
    { name: 'init:scaffold-with-dirs', description: 'Scaffold .agentx and create source directories' },
    { name: 'help', description: 'Show available commands' },
  ];
}

// Generate exec commands for aliases and intentions
function generateExecCommands(
  aliases: AliasDefinition[],
  intentions: IntentionDefinition[],
  persona?: PersonaDefinition
): ChatCommand[] {
  const commands: ChatCommand[] = [];

  // Filter aliases by persona if provided
  const filteredAliases = persona
    ? aliases.filter(a => aliasMatchesPersona(a.name, persona))
    : aliases;

  for (const alias of filteredAliases) {
    // Add base exec command for alias: exec:alias-name
    commands.push({
      name: `exec:${alias.name}`,
      description: `Execute with ${alias.name}: ${alias.description}`,
    });

    // Add exec commands with intentions: exec:alias-name:intention-id
    const aliasIntentions = getIntentionsForAlias(alias.name, intentions);
    for (const intention of aliasIntentions) {
      commands.push({
        name: `exec:${alias.name}:${intention.id}`,
        description: `${intention.name} with ${alias.name}`,
      });
    }
  }

  return commands;
}

// Generate chat participants for each persona
function generateParticipants(
  aliases: AliasDefinition[],
  intentions: IntentionDefinition[],
  personas: PersonaDefinition[]
): ChatParticipant[] {
  const participants: ChatParticipant[] = [];

  // Always generate base participant
  const baseCommands = [
    ...generateBaseCommands(),
    ...generateExecCommands(aliases, intentions),
  ];

  participants.push({
    id: 'agentx.chat',
    name: 'agentx',
    fullName: 'AgentX',
    description: 'AI-Enhanced Enterprise Development Assistant',
    isSticky: true,
    commands: baseCommands,
  });

  // Generate persona-specific participants
  for (const persona of personas) {
    const personaCommands = [
      ...generateBaseCommands(),
      ...generateExecCommands(aliases, intentions, persona),
    ];

    participants.push({
      id: `agentx.${persona.id}`,
      name: `agentx-${persona.id}`,
      fullName: `AgentX ${persona.name}`,
      description: persona.description,
      isSticky: true,
      commands: personaCommands,
    });
  }

  return participants;
}

// Update package.json with generated participants
function updatePackageJson(participants: ChatParticipant[]): void {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`package.json not found at: ${packageJsonPath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Update chatParticipants
  packageJson.contributes = packageJson.contributes || {};
  packageJson.contributes.chatParticipants = participants;

  // Update activationEvents to include all participants
  const activationEvents = participants.map(p => `onChatParticipant:${p.id}`);
  packageJson.activationEvents = activationEvents;

  // Write back
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(`✅ Updated package.json with ${participants.length} chat participant(s)`);
  for (const p of participants) {
    console.log(`   - @${p.name}: ${p.commands.length} commands`);
  }
}

// Main execution
function main(): void {
  // Project root is the repo root (where .agentx folder lives)
  const projectRoot = path.resolve(__dirname, '..', '..', '..');

  console.log(`📂 Project root: ${projectRoot}`);

  // Load configuration from .agentx/config.json
  const config = loadConfig(projectRoot);
  if (!config) {
    console.log('⚠️  No config found, generating minimal commands');
    updatePackageJson([{
      id: 'agentx.chat',
      name: 'agentx',
      fullName: 'AgentX',
      description: 'AI-Enhanced Enterprise Development Assistant',
      isSticky: true,
      commands: generateBaseCommands(),
    }]);
    return;
  }

  // Resolve knowledge base path from config
  let knowledgeBasePath = config.knowledgeBase || './default-knowledge-base';
  if (knowledgeBasePath.startsWith('~')) {
    knowledgeBasePath = path.join(os.homedir(), knowledgeBasePath.slice(1));
  }
  if (!path.isAbsolute(knowledgeBasePath)) {
    knowledgeBasePath = path.resolve(projectRoot, knowledgeBasePath);
  }

  console.log(`📁 Context is at: ${knowledgeBasePath}/.context`);

  // Load aliases, intentions, and personas from <knowledgeBase>/.context/
  const aliases = loadAliases(knowledgeBasePath);
  const intentions = loadIntentions(knowledgeBasePath);
  const personas = loadPersonas(knowledgeBasePath);

  console.log(`📋 Found ${aliases.length} aliases, ${intentions.length} intentions`);
  console.log(`👤 Found ${personas.length} personas`);

  // Generate participants
  const participants = generateParticipants(aliases, intentions, personas);

  // Update package.json
  updatePackageJson(participants);
}

main();
