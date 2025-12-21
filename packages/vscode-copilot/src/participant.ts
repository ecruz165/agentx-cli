/**
 * VS Code Chat Participant for AgentX
 * Supports same commands as CLI where applicable
 */

import * as vscode from 'vscode';
import {
  loadConfig,
  loadAliases,
  getAlias,
  getAliasWithFiles,
  buildContext,
  calculateTotalSize,
  findConfigPath,
  getConfigKeys,
  aliasDirectoryExists,
  getAliasDirectoryPath,
  createExecutionSettings,
  getPersonas,
  getActivePersona,
  loadAliasesForActivePersona,
  loadIntentions,
  getIntention,
  getIntentionsForAlias,
  gatherRequirements,
  updateRequirements,
  formatMissingRequirements,
  IntentionDefinition,
  RequirementGatheringResult,
} from '@agentx/core';
import { executeWithVSCodeLMStreaming, isVSCodeLMAvailable } from './vscode-lm-provider';

/**
 * Represents extracted context from chat references
 */
interface ExtractedReferenceContext {
  files: Array<{ path: string; content: string }>;
  selections: Array<{ path: string; content: string; range: string }>;
  summary: string;
}

/**
 * Extract context from chat request references
 * Handles #file, #selection, and other reference types
 */
async function extractReferenceContext(
  references: readonly vscode.ChatPromptReference[]
): Promise<ExtractedReferenceContext> {
  const result: ExtractedReferenceContext = {
    files: [],
    selections: [],
    summary: '',
  };

  for (const ref of references) {
    try {
      // Handle file references (#file)
      if (ref.id === 'vscode.file' && ref.value instanceof vscode.Uri) {
        const uri = ref.value;
        const document = await vscode.workspace.openTextDocument(uri);
        const content = document.getText();
        const relativePath = vscode.workspace.asRelativePath(uri);
        result.files.push({ path: relativePath, content });
      }
      // Handle selection references (#selection)
      else if (ref.id === 'vscode.selection') {
        // Selection value is typically a Location or an object with uri and range
        const value = ref.value as { uri?: vscode.Uri; range?: vscode.Range } | vscode.Location;

        if (value && 'uri' in value && value.uri) {
          const uri = value.uri;
          const document = await vscode.workspace.openTextDocument(uri);
          const range = 'range' in value && value.range ? value.range : undefined;
          const content = range ? document.getText(range) : document.getText();
          const relativePath = vscode.workspace.asRelativePath(uri);
          const rangeStr = range
            ? `L${range.start.line + 1}-L${range.end.line + 1}`
            : 'full file';
          result.selections.push({ path: relativePath, content, range: rangeStr });
        }
      }
      // Handle other reference types (e.g., #codebase results)
      else if (typeof ref.value === 'string') {
        // String values can be appended to summary
        result.summary += ref.value + '\n';
      }
    } catch (error) {
      // Log but don't fail on individual reference errors
      console.warn(`Failed to extract reference ${ref.id}:`, error);
    }
  }

  return result;
}

/**
 * Format extracted reference context as additional context string
 */
function formatReferenceContext(refContext: ExtractedReferenceContext): string {
  const parts: string[] = [];

  if (refContext.files.length > 0) {
    parts.push('## User-Attached Files\n');
    for (const file of refContext.files) {
      parts.push(`### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`);
    }
  }

  if (refContext.selections.length > 0) {
    parts.push('## User-Selected Code\n');
    for (const sel of refContext.selections) {
      parts.push(`### ${sel.path} (${sel.range})\n\`\`\`\n${sel.content}\n\`\`\`\n`);
    }
  }

  if (refContext.summary.trim()) {
    parts.push('## Additional Context\n' + refContext.summary);
  }

  return parts.join('\n');
}

/**
 * Participant IDs that should be registered
 * These must match the IDs in package.json chatParticipants
 */
const PARTICIPANT_IDS = [
  'agentx.chat',
  'agentx.backend',
  'agentx.frontend',
  'agentx.fullstack',
  'agentx.architect',
  'agentx.devops',
  'agentx.qa',
  'agentx.product',
  'agentx.designer',
];

/**
 * Register the AgentX chat participants (main + persona-specific)
 */
export function registerChatParticipant(context: vscode.ExtensionContext) {
  if (!vscode.chat) {
    console.log('VS Code Chat API not available');
    return;
  }

  // Set icon path (shared by all participants)
  const iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');

  // Register all participants
  for (const participantId of PARTICIPANT_IDS) {
    try {
      const participant = vscode.chat.createChatParticipant(participantId, handleChatRequest);

      // Set icon if it exists (optional)
      try {
        participant.iconPath = iconPath;
      } catch {
        // Icon is optional, continue without it
      }

      // Add participant variable provider for alias suggestions (filtered by active persona)
      // Uses the official proposed API: chatParticipantAdditions
      participant.participantVariableProvider = {
        triggerCharacters: ['@', '/'],
        provider: createCompletionProvider(),
      };

      context.subscriptions.push(participant);
      console.log(`AgentX chat participant registered: ${participantId}`);
    } catch (error) {
      console.error(`Failed to register participant ${participantId}:`, error);
    }
  }

  console.log('AgentX chat participants registration complete');
}

// Import proposed API types (from vscode.proposed.chatParticipantAdditions.d.ts)
// These types extend the vscode module with the chatParticipantAdditions proposed API

/**
 * Create a completion provider for alias suggestions
 * Uses the official proposed API: ChatParticipantCompletionItemProvider
 */
function createCompletionProvider(): vscode.ChatParticipantCompletionItemProvider {
  return {
    provideCompletionItems: async (
      query: string,
      token: vscode.CancellationToken
    ): Promise<vscode.ChatCompletionItem[]> => {
      const completions: vscode.ChatCompletionItem[] = [];

      // Load aliases filtered by active persona (if set)
      const aliases = await loadAliasesForActivePersona();
      const activePersona = getActivePersona();
      const intentions = await loadIntentions();

      // Add persona indicator if active
      const personaLabel = activePersona ? ` [${activePersona.name}]` : '';

      for (const alias of aliases) {
        // Suggest alias for /exec command (without intention)
        // Using the official ChatCompletionItem constructor: (id, label, values)
        const execItem = new vscode.ChatCompletionItem(
          `alias:${alias.name}`,
          alias.name,
          [{
            level: vscode.ChatVariableLevel.Medium,
            value: `${alias.name} "Your prompt here"`,
            description: `Execute with alias ${alias.name}`,
          }]
        );
        execItem.detail = alias.description;
        execItem.documentation = `Execute with ${alias.patterns.length} pattern(s)${personaLabel}`;
        execItem.insertText = `${alias.name} `;
        execItem.command = {
          command: 'agentx.exec',
          title: `Execute with ${alias.name}`,
          arguments: [alias.name],
        };
        completions.push(execItem);

        // Suggest alias + intention combinations
        const aliasIntentions = await getIntentionsForAlias(alias.name);
        for (const intention of aliasIntentions) {
          const intentItem = new vscode.ChatCompletionItem(
            `alias:${alias.name}:${intention.id}`,
            `${alias.name}:${intention.id}`,
            [{
              level: vscode.ChatVariableLevel.Medium,
              value: `${alias.name} --intention ${intention.id} "Your prompt here"`,
              description: `Execute ${alias.name} with ${intention.name} intention`,
            }]
          );
          intentItem.detail = `${alias.description} → ${intention.name}`;
          intentItem.documentation = intention.description;
          intentItem.insertText = `${alias.name} --intention ${intention.id} `;
          intentItem.command = {
            command: 'agentx.exec',
            title: `Execute ${alias.name} with ${intention.name}`,
            arguments: [alias.name, intention.id],
          };
          completions.push(intentItem);
        }
      }

      // Add standalone intention suggestions
      for (const intention of intentions) {
        const intentItem = new vscode.ChatCompletionItem(
          `intention:${intention.id}`,
          `intention:${intention.id}`,
          [{
            level: vscode.ChatVariableLevel.Medium,
            value: intention.id,
            description: intention.description,
          }]
        );
        intentItem.detail = intention.name;
        intentItem.documentation = intention.description;
        intentItem.insertText = intention.id;
        intentItem.command = {
          command: 'agentx.intentionShow',
          title: `Show intention: ${intention.name}`,
          arguments: [intention.id],
        };
        completions.push(intentItem);
      }

      // Add persona switching suggestions
      const personas = getPersonas();
      if (personas.length > 0) {
        for (const persona of personas) {
          const isActive = activePersona?.id === persona.id;
          const personaItem = new vscode.ChatCompletionItem(
            `persona:${persona.id}`,
            `persona:${persona.id}`,
            [{
              level: vscode.ChatVariableLevel.Short,
              value: persona.id,
              description: `Switch to ${persona.name} persona`,
            }]
          );
          personaItem.detail = `${isActive ? '✓ ' : ''}${persona.name}`;
          personaItem.documentation = persona.description;
          personaItem.insertText = persona.id;
          personaItem.command = {
            command: 'agentx.setPersona',
            title: `Set persona to ${persona.name}`,
            arguments: [persona.id],
          };
          completions.push(personaItem);
        }
      }

      return completions;
    },
  };
}

/**
 * Parse compound exec command format: exec:alias or exec:alias:intention
 * Returns { alias, intention? } or null if invalid format
 */
function parseCompoundExecCommand(command: string): { alias: string; intention?: string } | null {
  const parts = command.split(':');
  if (parts.length < 2 || parts[0] !== 'exec') {
    return null;
  }

  return {
    alias: parts[1],
    intention: parts[2], // undefined if not present
  };
}

/**
 * Handle chat requests - mirrors CLI commands
 */
async function handleChatRequest(
  request: vscode.ChatRequest,
  _context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  const prompt = request.prompt.trim();
  const command = request.command; // VS Code passes slash commands here
  const references = request.references; // User-attached context (#file, #selection, etc.)

  // Handle compound exec commands: exec:alias or exec:alias:intention
  if (command?.startsWith('exec:')) {
    const parsed = parseCompoundExecCommand(command);
    if (parsed) {
      return handleExecCommandWithParsed(parsed.alias, parsed.intention, prompt, stream, token, references);
    }
  }

  // Handle simple exec command (legacy format)
  if (command === 'exec') {
    return handleExecCommand(prompt, stream, token, references);
  }

  if (command === 'intentions') {
    // List intentions or show specific intention
    if (prompt === '' || prompt === 'list') {
      return handleIntentionsListCommand(stream);
    }
    return handleIntentionShowCommand(prompt, stream);
  }

  if (command === 'alias') {
    // Parse subcommand from prompt: "list", "show <name>", or empty
    if (prompt === '' || prompt === 'list') {
      return handleAliasListCommand(stream);
    }
    if (prompt.startsWith('show ')) {
      return handleAliasShowCommand(prompt.substring(5).trim(), stream);
    }
    // Default to list
    return handleAliasListCommand(stream);
  }

  if (command === 'config') {
    // Parse subcommand from prompt: "show", "show -k <key>", "path", or empty
    if (prompt === '' || prompt === 'show') {
      return handleConfigShowCommand(stream);
    }
    if (prompt.startsWith('show -k ')) {
      return handleConfigKeyCommand(prompt.substring(8).trim(), stream);
    }
    if (prompt === 'path') {
      return handleConfigPathCommand(stream);
    }
    // Default to show
    return handleConfigShowCommand(stream);
  }

  if (command === 'init') {
    return handleInitCommand(stream);
  }

  if (command === 'help') {
    return handleHelpCommand(stream);
  }

  // Fallback: check for inline /commands in prompt (for backwards compatibility)
  if (prompt.startsWith('/exec ')) {
    return handleExecCommand(prompt.substring(6).trim(), stream, token, references);
  }
  if (prompt === '/alias list' || prompt === '/alias') {
    return handleAliasListCommand(stream);
  }
  if (prompt.startsWith('/alias show ')) {
    return handleAliasShowCommand(prompt.substring(12).trim(), stream);
  }
  if (prompt === '/config show' || prompt === '/config') {
    return handleConfigShowCommand(stream);
  }
  if (prompt.startsWith('/config show -k ')) {
    return handleConfigKeyCommand(prompt.substring(16).trim(), stream);
  }
  if (prompt === '/config path') {
    return handleConfigPathCommand(stream);
  }
  if (prompt === '/init' || prompt.startsWith('/init ')) {
    return handleInitCommand(stream);
  }
  if (prompt === '/help') {
    return handleHelpCommand(stream);
  }

  // No command and empty prompt - show help
  if (prompt === '') {
    return handleHelpCommand(stream);
  }

  // Default: treat as exec with prompt selection
  return handleDefaultExec(prompt, stream, token, references);
}

/**
 * /exec <alias> [--intention <intention>] "<prompt>" - Execute AI prompt with context alias
 */
async function handleExecCommand(
  args: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  references?: readonly vscode.ChatPromptReference[]
): Promise<vscode.ChatResult> {
  // Parse: alias [--intention intention] "prompt" or alias prompt
  // Support both: alias "prompt" and alias --intention create-new "prompt"
  const intentionMatch = args.match(/^(\S+)\s+--intention\s+(\S+)\s+(?:"([^"]+)"|(.+))$/);
  const simpleMatch = args.match(/^(\S+)\s+(?:"([^"]+)"|(.+))$/);

  let aliasName: string;
  let intentionId: string | undefined;
  let prompt: string;

  if (intentionMatch) {
    aliasName = intentionMatch[1];
    intentionId = intentionMatch[2];
    prompt = intentionMatch[3] || intentionMatch[4];
  } else if (simpleMatch) {
    aliasName = simpleMatch[1];
    prompt = simpleMatch[2] || simpleMatch[3];
  } else {
    stream.markdown(`❌ **Invalid syntax**\n\nUsage:\n- \`/exec <alias> "<prompt>"\`\n- \`/exec <alias> --intention <intention> "<prompt>"\`\n\nExample: \`/exec bff --intention create-new "event management"\``);
    return { metadata: { command: 'exec', error: 'invalid_syntax' } };
  }

  const alias = await getAlias(aliasName);
  if (!alias) {
    const aliases = await loadAliases();
    stream.markdown(`❌ **Alias not found:** \`${aliasName}\`\n\n`);
    if (aliases.length > 0) {
      stream.markdown(`Available aliases: ${aliases.map(a => `\`${a.name}\``).join(', ')}`);
    }
    return { metadata: { command: 'exec', error: 'alias_not_found' } };
  }

  // Handle intention if specified
  let finalPrompt = prompt;
  let intention: IntentionDefinition | null = null;

  if (intentionId) {
    intention = await getIntention(intentionId);
    if (!intention) {
      const intentions = await getIntentionsForAlias(aliasName);
      stream.markdown(`❌ **Intention not found:** \`${intentionId}\`\n\n`);
      if (intentions.length > 0) {
        stream.markdown(`Available intentions: ${intentions.map(i => `\`${i.id}\``).join(', ')}`);
      }
      return { metadata: { command: 'exec', error: 'intention_not_found' } };
    }

    // Gather requirements
    const result = gatherRequirements(prompt, intention, aliasName);

    if (!result.complete) {
      // Show missing requirements and prompt user
      stream.markdown(`## 📋 Intention: ${intention.name}\n\n`);
      stream.markdown(`${formatMissingRequirements(result.missing)}\n\n`);
      stream.markdown(`**Please provide the missing information in your prompt.**\n\n`);
      stream.markdown(`Example: \`/exec ${aliasName} --intention ${intentionId} "POST /api/v1/events with title, date, location fields"\`\n`);

      // Show buttons for each missing requirement
      for (const req of result.missing) {
        stream.markdown(`\n**${req.name}:** ${req.question}`);
        if (req.type === 'enum' && req.options) {
          stream.markdown(` (${req.options.join(' | ')})`);
        }
      }

      return { metadata: { command: 'exec', error: 'missing_requirements', intention: intentionId } };
    }

    finalPrompt = result.refinedPrompt || prompt;
    stream.markdown(`## ✅ Requirements Gathered\n\n`);
  }

  // Build context from alias
  const config = loadConfig();
  const context = await buildContext(alias);

  // Extract and append user-attached context from references (#file, #selection, etc.)
  let userContext = '';
  let userContextFileCount = 0;
  let userContextSelectionCount = 0;
  if (references && references.length > 0) {
    const refContext = await extractReferenceContext(references);
    userContext = formatReferenceContext(refContext);
    userContextFileCount = refContext.files.length;
    userContextSelectionCount = refContext.selections.length;
  }

  stream.markdown(`## Executing with AgentX\n\n`);
  stream.markdown(`| Setting | Value |\n|---------|-------|\n`);
  stream.markdown(`| Provider | VS Code Copilot (native) |\n`);
  stream.markdown(`| Alias | ${aliasName} |\n`);
  if (intention) {
    stream.markdown(`| Intention | ${intention.name} |\n`);
  }
  stream.markdown(`| Alias Context | ${context.files.length} files (${(context.totalSize / 1024).toFixed(1)} KB) |\n`);
  if (userContextFileCount > 0 || userContextSelectionCount > 0) {
    stream.markdown(`| User Context | ${userContextFileCount} files, ${userContextSelectionCount} selections |\n`);
  }
  stream.markdown(`\n`);

  if (context.truncated) {
    stream.markdown(`⚠️ **Warning:** Context was truncated to fit within size limit.\n\n`);
  }

  stream.markdown(`**Prompt:** ${prompt}\n\n`);
  if (intention && finalPrompt !== prompt) {
    stream.markdown(`**Refined Prompt (TOON):**\n\`\`\`\n${finalPrompt.substring(0, 500)}${finalPrompt.length > 500 ? '...' : ''}\n\`\`\`\n\n`);
  }
  stream.markdown(`---\n\n`);

  // Check if VS Code LM API is available
  if (!isVSCodeLMAvailable()) {
    stream.markdown(`❌ **Error:** VS Code Language Model API not available.\n\n`);
    stream.markdown(`Please update VS Code to version 1.90 or later and ensure GitHub Copilot is installed.\n`);
    return { metadata: { command: 'exec', error: 'lm_not_available' } };
  }

  // Combine alias context with user-attached context
  const combinedContext = userContext
    ? `${context.content}\n\n${userContext}`
    : context.content;

  // Execute with VS Code's native Language Model API (streaming)
  stream.markdown(`### Response\n\n`);
  const execResult = await executeWithVSCodeLMStreaming(finalPrompt, combinedContext, stream, token);

  if (!execResult.success) {
    stream.markdown(`\n\n❌ **Error:** ${execResult.error}\n`);
    return { metadata: { command: 'exec', error: 'provider_error' } };
  }

  return { metadata: { command: 'exec', alias: aliasName, intention: intentionId, prompt } };
}

/**
 * Handle exec command with pre-parsed alias and intention (from compound command format)
 * Used for commands like /exec:be-api:create-new "prompt"
 */
async function handleExecCommandWithParsed(
  aliasName: string,
  intentionId: string | undefined,
  prompt: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  references?: readonly vscode.ChatPromptReference[]
): Promise<vscode.ChatResult> {
  // Validate prompt
  if (!prompt || prompt.trim() === '') {
    stream.markdown(`❌ **Missing prompt**\n\nUsage: \`/exec:${aliasName}${intentionId ? ':' + intentionId : ''} "Your prompt here"\``);
    return { metadata: { command: `exec:${aliasName}`, error: 'missing_prompt' } };
  }

  const alias = await getAlias(aliasName);
  if (!alias) {
    const aliases = await loadAliases();
    stream.markdown(`❌ **Alias not found:** \`${aliasName}\`\n\n`);
    if (aliases.length > 0) {
      stream.markdown(`Available aliases: ${aliases.map(a => `\`${a.name}\``).join(', ')}`);
    }
    return { metadata: { command: `exec:${aliasName}`, error: 'alias_not_found' } };
  }

  // Handle intention if specified
  let finalPrompt = prompt;
  let intention: IntentionDefinition | null = null;

  if (intentionId) {
    intention = await getIntention(intentionId);
    if (!intention) {
      const intentions = await getIntentionsForAlias(aliasName);
      stream.markdown(`❌ **Intention not found:** \`${intentionId}\`\n\n`);
      if (intentions.length > 0) {
        stream.markdown(`Available intentions: ${intentions.map(i => `\`${i.id}\``).join(', ')}`);
      }
      return { metadata: { command: `exec:${aliasName}:${intentionId}`, error: 'intention_not_found' } };
    }

    // Gather requirements
    const result = gatherRequirements(prompt, intention, aliasName);

    if (!result.complete) {
      // Show missing requirements and prompt user
      stream.markdown(`## 📋 Intention: ${intention.name}\n\n`);
      stream.markdown(`${formatMissingRequirements(result.missing)}\n\n`);
      stream.markdown(`**Please provide the missing information in your prompt.**\n\n`);
      stream.markdown(`Example: \`/exec:${aliasName}:${intentionId} "POST /api/v1/events with title, date, location fields"\`\n`);

      // Show buttons for each missing requirement
      for (const req of result.missing) {
        stream.markdown(`\n**${req.name}:** ${req.question}`);
        if (req.type === 'enum' && req.options) {
          stream.markdown(` (${req.options.join(' | ')})`);
        }
      }

      return { metadata: { command: `exec:${aliasName}:${intentionId}`, error: 'missing_requirements' } };
    }

    finalPrompt = result.refinedPrompt || prompt;
    stream.markdown(`## ✅ Requirements Gathered\n\n`);
  }

  // Build context from alias
  const config = loadConfig();
  const context = await buildContext(alias);

  // Extract and append user-attached context from references (#file, #selection, etc.)
  let userContext = '';
  let userContextFileCount = 0;
  let userContextSelectionCount = 0;
  if (references && references.length > 0) {
    const refContext = await extractReferenceContext(references);
    userContext = formatReferenceContext(refContext);
    userContextFileCount = refContext.files.length;
    userContextSelectionCount = refContext.selections.length;
  }

  stream.markdown(`## Executing with AgentX\n\n`);
  stream.markdown(`| Setting | Value |\n|---------|-------|\n`);
  stream.markdown(`| Provider | VS Code Copilot (native) |\n`);
  stream.markdown(`| Alias | ${aliasName} |\n`);
  if (intention) {
    stream.markdown(`| Intention | ${intention.name} |\n`);
  }
  stream.markdown(`| Alias Context | ${context.files.length} files (${(context.totalSize / 1024).toFixed(1)} KB) |\n`);
  if (userContextFileCount > 0 || userContextSelectionCount > 0) {
    stream.markdown(`| User Context | ${userContextFileCount} files, ${userContextSelectionCount} selections |\n`);
  }
  stream.markdown(`\n`);

  if (context.truncated) {
    stream.markdown(`⚠️ **Warning:** Context was truncated to fit within size limit.\n\n`);
  }

  stream.markdown(`**Prompt:** ${prompt}\n\n`);
  if (intention && finalPrompt !== prompt) {
    stream.markdown(`**Refined Prompt (TOON):**\n\`\`\`\n${finalPrompt.substring(0, 500)}${finalPrompt.length > 500 ? '...' : ''}\n\`\`\`\n\n`);
  }
  stream.markdown(`---\n\n`);

  // Check if VS Code LM API is available
  if (!isVSCodeLMAvailable()) {
    stream.markdown(`❌ **Error:** VS Code Language Model API not available.\n\n`);
    stream.markdown(`Please update VS Code to version 1.90 or later and ensure GitHub Copilot is installed.\n`);
    return { metadata: { command: `exec:${aliasName}`, error: 'lm_not_available' } };
  }

  // Combine alias context with user-attached context
  const combinedContext = userContext
    ? `${context.content}\n\n${userContext}`
    : context.content;

  // Execute with VS Code's native Language Model API (streaming)
  stream.markdown(`### Response\n\n`);
  const execResult = await executeWithVSCodeLMStreaming(finalPrompt, combinedContext, stream, token);

  if (!execResult.success) {
    stream.markdown(`\n\n❌ **Error:** ${execResult.error}\n`);
    return { metadata: { command: `exec:${aliasName}`, error: 'provider_error' } };
  }

  return { metadata: { command: `exec:${aliasName}`, alias: aliasName, intention: intentionId, prompt } };
}

/**
 * /alias list - List all available aliases (mirrors: agentx alias list)
 */
async function handleAliasListCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  if (!aliasDirectoryExists()) {
    stream.markdown(`⚠️ **Alias directory not found**\n\n`);
    stream.markdown(`Path: \`${getAliasDirectoryPath()}\`\n\n`);
    stream.markdown(`Create alias JSON files in this directory to define aliases.`);
    return { metadata: { command: 'alias list', error: 'no_directory' } };
  }

  // Load aliases filtered by active persona
  const aliases = await loadAliasesForActivePersona();
  const activePersona = getActivePersona();
  const allAliases = await loadAliases();

  if (aliases.length === 0) {
    stream.markdown(`ℹ️ **No aliases found**\n\n`);
    if (activePersona && allAliases.length > 0) {
      stream.markdown(`Active persona **${activePersona.name}** has no matching aliases.\n\n`);
      stream.markdown(`Total aliases available: ${allAliases.length}\n\n`);
      stream.markdown(`Clear persona filter with \`agentx config set activePersona ""\``);
    } else {
      stream.markdown(`Add alias JSON files to: \`${getAliasDirectoryPath()}\``);
    }
    return { metadata: { command: 'alias list', count: 0 } };
  }

  // Show active persona if set
  if (activePersona) {
    stream.markdown(`## Available Aliases (${activePersona.name})\n\n`);
    stream.markdown(`*Filtered by persona: ${activePersona.description}*\n\n`);
  } else {
    stream.markdown(`## Available Aliases\n\n`);
  }

  // Show aliases with clickable buttons
  for (const alias of aliases) {
    stream.markdown(`### ${alias.name}\n`);
    stream.markdown(`${alias.description}\n`);
    stream.markdown(`- **Patterns:** ${alias.patterns.length}\n\n`);

    // Add button to show alias details
    stream.button({
      command: 'agentx.aliasShow',
      arguments: [alias.name],
      title: `📋 Show Details: ${alias.name}`,
    });
    stream.markdown(`\n\n`);
  }

  stream.markdown(`---\n**Total:** ${aliases.length} alias${aliases.length !== 1 ? 'es' : ''}`);

  return { metadata: { command: 'alias list', count: aliases.length } };
}

/**
 * /alias show <name> - Show details of a specific alias (mirrors: agentx alias show <name>)
 */
async function handleAliasShowCommand(
  name: string,
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const alias = await getAliasWithFiles(name);

  if (!alias) {
    stream.markdown(`❌ **Alias not found:** \`${name}\`\n\n`);
    const aliases = await loadAliases();
    if (aliases.length > 0) {
      stream.markdown(`Available aliases: ${aliases.map(a => `\`${a.name}\``).join(', ')}`);
    }
    return { metadata: { command: 'alias show', error: 'not_found' } };
  }

  const totalSize = calculateTotalSize(alias.resolvedFiles);

  stream.markdown(`## Alias: ${alias.name}\n\n`);
  stream.markdown(`**Description:** ${alias.description}\n\n`);

  stream.markdown(`### Patterns\n`);
  alias.patterns.forEach(p => stream.markdown(`- \`${p}\`\n`));

  stream.markdown(`\n### Resolved Files (${alias.resolvedFiles.length})\n\n`);
  stream.markdown(`**Total size:** ${(totalSize / 1024).toFixed(1)} KB\n\n`);

  if (alias.resolvedFiles.length > 0) {
    const maxShow = 10;
    const filesToShow = alias.resolvedFiles.slice(0, maxShow);

    stream.markdown(`| File | Size |\n|------|------|\n`);
    filesToShow.forEach(f => {
      stream.markdown(`| \`${f.path}\` | ${(f.size / 1024).toFixed(1)} KB |\n`);
    });

    if (alias.resolvedFiles.length > maxShow) {
      stream.markdown(`\n*...and ${alias.resolvedFiles.length - maxShow} more files*`);
    }
  }

  return { metadata: { command: 'alias show', alias: name } };
}

/**
 * /config show - Display current configuration (mirrors: agentx config show)
 */
async function handleConfigShowCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const config = loadConfig();
  const configPath = findConfigPath();

  stream.markdown(`## AgentX Configuration\n\n`);

  if (configPath) {
    stream.markdown(`📁 Config file: \`${configPath}\`\n\n`);
  } else {
    stream.markdown(`ℹ️ Using default configuration (no config file found)\n\n`);
  }

  stream.markdown(`| Setting | Value |\n|---------|-------|\n`);

  Object.entries(config).forEach(([key, value]) => {
    const displayValue = typeof value === 'object'
      ? `\`${JSON.stringify(value)}\``
      : `\`${String(value)}\``;
    stream.markdown(`| ${key} | ${displayValue} |\n`);
  });

  stream.markdown(`\nUse \`/config show -k <key>\` to show a specific value.`);

  return { metadata: { command: 'config show' } };
}

/**
 * /config show -k <key> - Show specific configuration key
 */
async function handleConfigKeyCommand(
  key: string,
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const config = loadConfig();
  const value = (config as unknown as Record<string, unknown>)[key];

  if (value === undefined) {
    stream.markdown(`❌ **Unknown configuration key:** \`${key}\`\n\n`);
    stream.markdown(`Available keys: ${getConfigKeys().map(k => `\`${k}\``).join(', ')}`);
    return { metadata: { command: 'config show -k', error: 'unknown_key' } };
  }

  const displayValue = typeof value === 'object'
    ? JSON.stringify(value, null, 2)
    : String(value);

  stream.markdown(`**${key}:** \`${displayValue}\``);

  return { metadata: { command: 'config show -k', key } };
}

/**
 * /config path - Show configuration file path (mirrors: agentx config path)
 */
async function handleConfigPathCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const configPath = findConfigPath();

  if (configPath) {
    stream.markdown(`📁 **Config file:** \`${configPath}\``);
  } else {
    stream.markdown(`ℹ️ No configuration file found\n\n`);
    stream.markdown(`Default location: \`.ai-config/config.json\``);
  }

  return { metadata: { command: 'config path' } };
}

/**
 * /intentions list - List all available intentions
 */
async function handleIntentionsListCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const intentions = await loadIntentions();

  if (intentions.length === 0) {
    stream.markdown(`ℹ️ **No intentions configured**\n\n`);
    stream.markdown(`Add intention JSON files to: \`.ai-config/intentions/\``);
    return { metadata: { command: 'intentions list', count: 0 } };
  }

  stream.markdown(`## Available Intentions\n\n`);
  stream.markdown(`| Intention | Description |\n|-----------|-------------|\n`);

  for (const intention of intentions) {
    stream.markdown(`| \`${intention.id}\` | ${intention.description} |\n`);
  }

  stream.markdown(`\n### Usage\n`);
  stream.markdown(`\`/exec <alias> --intention <intention> "<prompt>"\`\n\n`);
  stream.markdown(`**Example:**\n`);
  stream.markdown(`\`/exec be-endpoint --intention create-new "event management"\``);

  return { metadata: { command: 'intentions list', count: intentions.length } };
}

/**
 * /intentions <id> - Show details of a specific intention
 */
async function handleIntentionShowCommand(
  intentionId: string,
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const intention = await getIntention(intentionId);

  if (!intention) {
    const intentions = await loadIntentions();
    stream.markdown(`❌ **Intention not found:** \`${intentionId}\`\n\n`);
    if (intentions.length > 0) {
      stream.markdown(`Available intentions: ${intentions.map(i => `\`${i.id}\``).join(', ')}`);
    }
    return { metadata: { command: 'intentions show', error: 'not_found' } };
  }

  stream.markdown(`## Intention: ${intention.name}\n\n`);
  stream.markdown(`**ID:** \`${intention.id}\`\n\n`);
  stream.markdown(`**Description:** ${intention.description}\n\n`);

  stream.markdown(`### Requirements\n\n`);
  stream.markdown(`| Field | Type | Required | Question |\n|-------|------|----------|----------|\n`);

  for (const req of intention.requirements) {
    const reqType = req.type === 'enum' ? `enum (${req.options?.join(', ')})` : req.type;
    stream.markdown(`| \`${req.id}\` | ${reqType} | ${req.required ? '✓' : ''} | ${req.question} |\n`);
  }

  if (intention.applicableAliases && intention.applicableAliases.length > 0) {
    stream.markdown(`\n### Applicable Aliases\n`);
    stream.markdown(`${intention.applicableAliases.map(a => `\`${a}\``).join(', ')}\n`);
  }

  stream.markdown(`\n### Usage\n`);
  stream.markdown(`\`/exec <alias> --intention ${intention.id} "<prompt>"\``);

  return { metadata: { command: 'intentions show', intention: intentionId } };
}

/**
 * /init - Show init guidance (limited in VS Code context)
 */
async function handleInitCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  stream.markdown(`## Initialize Project\n\n`);
  stream.markdown(`The \`init\` command creates new projects from framework templates.\n\n`);
  stream.markdown(`**Available Frameworks:**\n`);
  stream.markdown(`- \`spec-kit\` - Templates: bff-service, rest-service\n`);
  stream.markdown(`- \`open-spec\` - Templates: openapi, asyncapi\n`);
  stream.markdown(`- \`bmad\` - Templates: business-model\n\n`);
  stream.markdown(`**Usage (in terminal):**\n`);
  stream.markdown(`\`\`\`bash\nagentx init <framework> -t <template> -n <name>\n\`\`\`\n\n`);
  stream.markdown(`**Example:**\n`);
  stream.markdown(`\`\`\`bash\nagentx init spec-kit -t bff-service -n my-bff\n\`\`\`\n\n`);
  stream.markdown(`💡 Run this command in the VS Code integrated terminal.`);

  return { metadata: { command: 'init' } };
}

/**
 * /help - Show all available commands
 */
async function handleHelpCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  stream.markdown(`## AgentX Commands\n\n`);
  stream.markdown(`### Execute (Compound Format - Recommended)\n`);
  stream.markdown(`- \`/exec:<alias> "<prompt>"\` - Execute with alias (auto-suggested)\n`);
  stream.markdown(`- \`/exec:<alias>:<intention> "<prompt>"\` - Execute with alias + intention\n\n`);
  stream.markdown(`**Examples:**\n`);
  stream.markdown(`- \`/exec:be-api "Create customer endpoint"\`\n`);
  stream.markdown(`- \`/exec:be-endpoint:create-new "event management"\`\n\n`);

  stream.markdown(`### Execute (Legacy Format)\n`);
  stream.markdown(`- \`/exec <alias> "<prompt>"\` - Execute AI prompt with context alias\n`);
  stream.markdown(`- \`/exec <alias> --intention <intention> "<prompt>"\` - Execute with intention\n\n`);

  stream.markdown(`### Intentions\n`);
  stream.markdown(`- \`/intentions list\` - List all available intentions\n`);
  stream.markdown(`- \`/intentions <id>\` - Show details of a specific intention\n\n`);

  stream.markdown(`### Alias Management\n`);
  stream.markdown(`- \`/alias list\` - List all available aliases\n`);
  stream.markdown(`- \`/alias show <name>\` - Show details of a specific alias\n\n`);

  stream.markdown(`### Configuration\n`);
  stream.markdown(`- \`/config show\` - Display current configuration\n`);
  stream.markdown(`- \`/config show -k <key>\` - Show specific configuration key\n`);
  stream.markdown(`- \`/config path\` - Show configuration file path\n\n`);

  stream.markdown(`### Project\n`);
  stream.markdown(`- \`/init\` - Show project initialization guidance\n\n`);

  stream.markdown(`### Help\n`);
  stream.markdown(`- \`/help\` - Show this help message\n\n`);

  stream.markdown(`---\n\n`);
  stream.markdown(`💡 **Tip:** Use the compound format (\`/exec:<alias>:<intention>\`) for auto-suggest support!`);

  return { metadata: { command: 'help' } };
}

/**
 * Default handler - prompts user to select alias and execute
 */
async function handleDefaultExec(
  prompt: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  references?: readonly vscode.ChatPromptReference[]
): Promise<vscode.ChatResult> {
  // Load aliases filtered by active persona
  const aliases = await loadAliasesForActivePersona();
  const activePersona = getActivePersona();

  if (aliases.length === 0) {
    stream.markdown(`❌ **No aliases configured**\n\n`);
    if (activePersona) {
      stream.markdown(`Active persona **${activePersona.name}** has no matching aliases.\n\n`);
    }
    stream.markdown(`Please configure aliases first. Use \`/help\` for more information.`);
    return { metadata: { command: 'default', error: 'no_aliases' } };
  }

  stream.markdown(`🤔 **Select an alias to execute your prompt:**\n\n`);
  stream.markdown(`> ${prompt}\n\n`);

  // Show active persona if set
  if (activePersona) {
    stream.markdown(`*Persona: ${activePersona.name}*\n\n`);
  }

  // Show user-attached context if any
  if (references && references.length > 0) {
    const refContext = await extractReferenceContext(references);
    if (refContext.files.length > 0 || refContext.selections.length > 0) {
      stream.markdown(`📎 **Attached context:** ${refContext.files.length} files, ${refContext.selections.length} selections\n\n`);
    }
  }

  stream.markdown(`**Available aliases:**\n\n`);

  // Show aliases as clickable buttons
  for (const alias of aliases) {
    stream.button({
      command: 'agentx.execWithAlias',
      arguments: [alias.name, prompt],
      title: `🚀 ${alias.name} - ${alias.description}`,
    });
    stream.markdown(`\n`);
  }

  stream.markdown(`\n💡 Or use \`@agentx /exec <alias> "<prompt>"\``);

  return { metadata: { command: 'default', prompt } };
}

