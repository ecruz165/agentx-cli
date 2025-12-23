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
  HistoryEntry,
  HistoryManifestSources,
  saveHistoryEntry,
  isFirstHistorySave,
  addHistoryToGitignore,
  isHistoryInGitignore,
  estimateHistoryTokens,
  getLastHistoryEntry,
  listHistoryEntries,
  clearHistory,
  // Bootstrap utilities
  detectProjectRoot,
  analyzeProject,
  hasAiConfig,
  getAiConfigPath,
  DEFAULT_TEMPLATES,
  scaffoldProject,
} from '@agentx/core';
import { executeWithVSCodeLMStreaming, isVSCodeLMAvailable, generatePlanWithVSCodeLM } from './vscode-lm-provider';
import {
  createPlanDocument,
  savePlanDocument,
  findActivePlan,
  updatePlanRequirements,
  setImplementationPlan,
  addToConversationHistory,
  generatePlanMarkdown,
  GatheredRequirement,
  MissingRequirement,
  PlanDocument,
} from '@agentx/core';
import {
  handleWorkflowCommand,
  continueInputCollection,
  getActiveInputSession,
} from './workflow';

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
 * Save context history after successful execution
 */
async function saveContextHistory(
  participant: string,
  contextGroup: string,
  intent: string | undefined,
  prompt: string,
  finalPrompt: string,
  contextContent: string,
  personaContext: string | undefined,
  workspaceContent: string | undefined,
  contextFiles: string[],
  workspaceFiles: string[],
  stream: vscode.ChatResponseStream
): Promise<string | null> {
  const config = loadConfig();

  // Check if history is enabled
  if (config.history?.enabled === false) {
    return null;
  }

  try {
    const timestamp = new Date().toISOString();
    const totalBytes = contextContent.length + (workspaceContent?.length || 0);

    // Build sources
    const sources: HistoryManifestSources = {
      static: contextFiles.filter(f => !f.endsWith('.sh') && !f.endsWith('.ts')),
      dynamic: contextFiles.filter(f => f.endsWith('.sh') || f.endsWith('.ts')),
      templates: [], // TODO: Extract template paths when available
      workspace: workspaceFiles,
    };

    // Create history entry
    const entry: HistoryEntry = {
      timestamp,
      participant,
      contextGroup,
      intent,
      prompt,
      personaContent: personaContext,
      conventionsContent: contextContent,
      workspaceContent,
      finalPrompt,
      sources,
      stats: {
        totalTokens: estimateHistoryTokens(totalBytes),
        totalBytes,
        fileCount: contextFiles.length + workspaceFiles.length,
      },
    };

    // Check if first save and handle gitignore
    if (isFirstHistorySave(config.history)) {
      if (!isHistoryInGitignore(config.history)) {
        // Auto-add to gitignore (in VS Code we don't prompt, just do it)
        addHistoryToGitignore(config.history);
      }
    }

    // Save the entry
    const result = await saveHistoryEntry(entry, config.history);

    // Show notification in chat
    const relativePath = result.contextPath.replace(process.cwd() + '/', '');
    stream.markdown(`\n\n---\n📄 Context saved → `);
    stream.button({
      command: 'vscode.open',
      arguments: [vscode.Uri.file(result.contextPath)],
      title: 'View',
    });
    stream.button({
      command: 'agentx.browseHistory',
      title: 'Browse History',
    });
    stream.markdown(`\n`);

    return result.contextPath;
  } catch (error) {
    // Don't fail the command if history saving fails
    console.warn('Failed to save context history:', error);
    return null;
  }
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

  if (command === 'init:analyze') {
    return handleInitAnalyzeCommand(stream);
  }

  if (command === 'init:scaffold') {
    return handleInitScaffoldCommand(stream, false);
  }

  if (command === 'init:scaffold-with-dirs') {
    return handleInitScaffoldCommand(stream, true);
  }

  if (command === 'help') {
    return handleHelpCommand(stream);
  }

  // Workflow commands
  if (command === 'workflow' || command === 'run-workflow') {
    return handleWorkflowCommand(command, prompt, request, stream, token);
  }

  if (command === 'list-workflows') {
    return handleWorkflowCommand('list-workflows', prompt, request, stream, token);
  }

  if (command === 'resume') {
    return handleWorkflowCommand('resume', prompt, request, stream, token);
  }

  if (command === 'status') {
    return handleWorkflowCommand('status', prompt, request, stream, token);
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
  if (prompt === '/init' || prompt === '/init ') {
    return handleInitCommand(stream);
  }
  if (prompt === '/init:analyze') {
    return handleInitAnalyzeCommand(stream);
  }
  if (prompt === '/init:scaffold') {
    return handleInitScaffoldCommand(stream, false);
  }
  if (prompt === '/init:scaffold-with-dirs') {
    return handleInitScaffoldCommand(stream, true);
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

  // Save context history
  const workspaceFiles = references && references.length > 0
    ? (await extractReferenceContext(references)).files.map(f => f.path)
    : [];

  await saveContextHistory(
    'agentx',
    aliasName,
    intentionId,
    prompt,
    finalPrompt,
    context.content,
    context.personaContext,
    userContext || undefined,
    context.files.map(f => f.path),
    workspaceFiles,
    stream
  );

  return { metadata: { command: 'exec', alias: aliasName, intention: intentionId, prompt } };
}

/**
 * Handle exec command with pre-parsed alias and intention (from compound command format)
 * Used for commands like /exec:be-api:create-new "prompt"
 *
 * When an intention is specified, this triggers PLAN MODE with incremental gathering:
 * 1. Creates or resumes a plan document
 * 2. Gathers requirements incrementally across chat turns
 * 3. When all requirements gathered, generates implementation plan
 * 4. User reviews and approves - PRD is saved to history
 */
async function handleExecCommandWithParsed(
  aliasName: string,
  intentionId: string | undefined,
  prompt: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  references?: readonly vscode.ChatPromptReference[],
  participantId?: string
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

  // Combine alias context with user-attached context
  const combinedContext = userContext
    ? `${context.content}\n\n${userContext}`
    : context.content;

  // Check if VS Code LM API is available
  if (!isVSCodeLMAvailable()) {
    stream.markdown(`❌ **Error:** VS Code Language Model API not available.\n\n`);
    stream.markdown(`Please update VS Code to version 1.90 or later and ensure GitHub Copilot is installed.\n`);
    return { metadata: { command: `exec:${aliasName}`, error: 'lm_not_available' } };
  }

  // ========================================
  // PLAN MODE: When intention is specified
  // ========================================
  if (intentionId) {
    const intention = await getIntention(intentionId);
    if (!intention) {
      const intentions = await getIntentionsForAlias(aliasName);
      stream.markdown(`❌ **Intention not found:** \`${intentionId}\`\n\n`);
      if (intentions.length > 0) {
        stream.markdown(`Available intentions: ${intentions.map(i => `\`${i.id}\``).join(', ')}`);
      }
      return { metadata: { command: `exec:${aliasName}:${intentionId}`, error: 'intention_not_found' } };
    }

    const participant = participantId || 'agentx';

    // Check for existing active plan for this combination
    let plan = findActivePlan(participant, aliasName, intentionId);

    // Gather requirements from the current prompt
    const gatherResult = gatherRequirements(prompt, intention, aliasName);

    // Convert to plan document format
    // ExtractedRequirement only has id, value, confidence, source - we need to look up the name from intention.requirements
    const gatheredReqs: GatheredRequirement[] = gatherResult.extracted.map((extracted) => {
      const reqDef = intention.requirements.find(r => r.id === extracted.id);
      const value = typeof extracted.value === 'string' ? extracted.value :
                    Array.isArray(extracted.value) ? extracted.value.join(', ') :
                    extracted.value === null ? '' : String(extracted.value);
      return {
        id: extracted.id,
        name: reqDef?.name || extracted.id,
        type: reqDef?.type || 'string',
        value,
        gatheredAt: new Date().toISOString(),
      };
    });

    const missingReqs: MissingRequirement[] = gatherResult.missing.map(m => ({
      id: m.id || m.name.toLowerCase().replace(/\s+/g, '-'),
      name: m.name,
      type: m.type || 'string',
      question: m.question,
      required: m.required !== false,
      options: m.options,
    }));

    if (plan) {
      // Update existing plan with new requirements
      plan = updatePlanRequirements(plan, gatheredReqs);
      plan = addToConversationHistory(plan, 'user', prompt);
      savePlanDocument(plan);

      stream.markdown(`## 📋 Plan: ${intention.name} (Continued)\n\n`);
      stream.markdown(`*Updating plan with new information...*\n\n`);
    } else {
      // Create new plan document
      plan = createPlanDocument(
        participant,
        aliasName,
        intention,
        prompt,
        gatheredReqs,
        missingReqs
      );
      plan = addToConversationHistory(plan, 'user', prompt);
      savePlanDocument(plan);

      stream.markdown(`## 🎯 Plan Mode: ${intention.name}\n\n`);
      stream.markdown(`*Creating new plan document...*\n\n`);
    }

    // Show plan status
    stream.markdown(`| Setting | Value |\n|---------|-------|\n`);
    stream.markdown(`| Plan ID | \`${plan.id}\` |\n`);
    stream.markdown(`| Alias | \`${aliasName}\` |\n`);
    stream.markdown(`| Intention | ${intention.name} |\n`);
    stream.markdown(`| Status | ${plan.status} |\n`);
    stream.markdown(`| Context | ${context.files.length} files (${(context.totalSize / 1024).toFixed(1)} KB) |\n`);
    stream.markdown(`\n`);

    // Show gathered requirements
    if (plan.gathered.length > 0) {
      stream.markdown(`### ✅ Requirements Gathered\n\n`);
      for (const req of plan.gathered) {
        stream.markdown(`- **${req.name}:** ${req.value}\n`);
      }
      stream.markdown(`\n`);
    }

    // Check if more requirements are needed
    const requiredMissing = plan.missing.filter(m => m.required);

    if (requiredMissing.length > 0) {
      // Still gathering requirements
      stream.markdown(`### ❓ Missing Requirements\n\n`);
      stream.markdown(`Please provide the following information:\n\n`);

      for (const req of requiredMissing) {
        stream.markdown(`**${req.name}:** ${req.question}`);
        if (req.options) {
          stream.markdown(` *(${req.options.join(' | ')})*`);
        }
        stream.markdown(`\n\n`);
      }

      stream.markdown(`---\n\n`);
      stream.markdown(`💡 *Continue the conversation by providing the missing information. Example:*\n\n`);
      stream.markdown(`\`\`\`\n@${participant} ${requiredMissing[0].question.replace('?', '')} ...\n\`\`\`\n`);

      // Add conversation to plan
      const assistantMsg = `Gathered ${plan.gathered.length} requirement(s). Still need: ${requiredMissing.map(r => r.name).join(', ')}`;
      plan = addToConversationHistory(plan, 'assistant', assistantMsg);
      savePlanDocument(plan);

      return {
        metadata: {
          command: `exec:${aliasName}:${intentionId}`,
          alias: aliasName,
          intention: intentionId,
          prompt,
          mode: 'plan',
          planId: plan.id,
          status: 'gathering',
        }
      };
    }

    // All requirements gathered - generate implementation plan
    stream.markdown(`---\n\n`);
    stream.markdown(`### 📝 Implementation Plan\n\n`);
    stream.markdown(`*Generating plan based on your conventions and requirements...*\n\n`);

    const requirementsDescription = plan.gathered
      .map(g => `- **${g.name}**: ${g.value}`)
      .join('\n');

    // Generate the plan using LLM
    const planResult = await generatePlanWithVSCodeLM(
      intention.name,
      intention.description,
      requirementsDescription,
      plan.originalPrompt,
      combinedContext,
      stream,
      token
    );

    if (!planResult.success) {
      stream.markdown(`\n\n❌ **Error generating plan:** ${planResult.error}\n`);
      return { metadata: { command: `exec:${aliasName}:${intentionId}`, error: 'plan_generation_failed' } };
    }

    // Update plan with implementation plan and context
    plan = setImplementationPlan(plan, planResult.plan || '', combinedContext);
    plan = addToConversationHistory(plan, 'assistant', `Generated implementation plan:\n\n${planResult.plan}`);
    savePlanDocument(plan);

    stream.markdown(`\n\n---\n\n`);
    stream.markdown(`### ✅ Plan Ready for Review\n\n`);
    stream.markdown(`All requirements gathered. Review the plan above.\n\n`);
    stream.markdown(`**When ready, click to execute and generate PRD:**\n\n`);

    // Add action buttons
    stream.button({
      command: 'agentx.executePlan',
      arguments: [plan.id],
      title: '🚀 Execute & Generate PRD',
    });
    stream.button({
      command: 'agentx.rejectPlan',
      arguments: [plan.id],
      title: '❌ Cancel Plan',
    });

    stream.markdown(`\n\n💡 *The plan expires in 30 minutes. PRD will be saved to \`.agentx/history/\` on execution.*`);

    return {
      metadata: {
        command: `exec:${aliasName}:${intentionId}`,
        alias: aliasName,
        intention: intentionId,
        prompt,
        mode: 'plan',
        planId: plan.id,
        status: 'ready',
      }
    };
  }

  // ========================================
  // DIRECT EXECUTION: No intention (no plan mode)
  // ========================================
  stream.markdown(`## Executing with AgentX\n\n`);
  stream.markdown(`| Setting | Value |\n|---------|-------|\n`);
  stream.markdown(`| Provider | VS Code Copilot (native) |\n`);
  stream.markdown(`| Alias | ${aliasName} |\n`);
  stream.markdown(`| Alias Context | ${context.files.length} files (${(context.totalSize / 1024).toFixed(1)} KB) |\n`);
  if (userContextFileCount > 0 || userContextSelectionCount > 0) {
    stream.markdown(`| User Context | ${userContextFileCount} files, ${userContextSelectionCount} selections |\n`);
  }
  stream.markdown(`\n`);

  if (context.truncated) {
    stream.markdown(`⚠️ **Warning:** Context was truncated to fit within size limit.\n\n`);
  }

  stream.markdown(`**Prompt:** ${prompt}\n\n`);
  stream.markdown(`---\n\n`);

  // Execute with VS Code's native Language Model API (streaming)
  stream.markdown(`### Response\n\n`);
  const execResult = await executeWithVSCodeLMStreaming(prompt, combinedContext, stream, token);

  if (!execResult.success) {
    stream.markdown(`\n\n❌ **Error:** ${execResult.error}\n`);
    return { metadata: { command: `exec:${aliasName}`, error: 'provider_error' } };
  }

  // Save context history
  const workspaceFiles = references && references.length > 0
    ? (await extractReferenceContext(references)).files.map(f => f.path)
    : [];

  await saveContextHistory(
    `agentx-${aliasName}`,
    aliasName,
    intentionId,
    prompt,
    prompt,
    context.content,
    context.personaContext,
    userContext || undefined,
    context.files.map(f => f.path),
    workspaceFiles,
    stream
  );

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
 * /init - Project initialization with bootstrapping utilities
 */
async function handleInitCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  // Get workspace folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    stream.markdown(`## Initialize Project\n\n`);
    stream.markdown(`**No workspace folder open**\n\n`);
    stream.markdown(`Please open a folder or workspace first, then run \`/init\` again.\n\n`);
    stream.markdown(`You can:\n`);
    stream.markdown(`1. Use **File > Open Folder** to open an existing project\n`);
    stream.markdown(`2. Or create a new folder and open it\n`);
    return { metadata: { command: 'init', error: 'no_workspace' } };
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  // Step 1: Detect project root
  stream.markdown(`## Initialize AgentX Configuration\n\n`);
  stream.markdown(`### Step 1: Project Detection\n\n`);

  const detection = detectProjectRoot(workspacePath);

  if (!detection.isProjectRoot) {
    stream.markdown(`**No project markers found** in \`${workspacePath}\`\n\n`);
    stream.markdown(`This doesn't appear to be a project root. Expected files like:\n`);
    stream.markdown(`- \`package.json\` (Node.js/TypeScript)\n`);
    stream.markdown(`- \`pom.xml\` or \`build.gradle\` (Java)\n`);
    stream.markdown(`- \`.git\` (Git repository)\n\n`);

    // Offer to initialize anyway
    stream.markdown(`Would you like to initialize anyway?\n\n`);
    stream.button({
      command: 'agentx.initAnyway',
      arguments: [workspacePath],
      title: 'Initialize Anyway (TypeScript defaults)',
    });

    return { metadata: { command: 'init', error: 'not_project_root' } };
  }

  stream.markdown(`**Project root detected**\n\n`);
  stream.markdown(`| Property | Value |\n|----------|-------|\n`);
  stream.markdown(`| Path | \`${workspacePath}\` |\n`);
  stream.markdown(
    `| Markers | ${detection.detectedMarkers.map((m) => `\`${m}\``).join(', ')} |\n`
  );
  stream.markdown(`| Primary | \`${detection.primaryMarker}\` |\n\n`);

  // Step 2: Check if .ai-config exists
  if (hasAiConfig(workspacePath)) {
    stream.markdown(`### Existing Configuration Found\n\n`);
    stream.markdown(`\`.ai-config/\` already exists at \`${getAiConfigPath(workspacePath)}\`\n\n`);
    stream.markdown(`Would you like to:\n\n`);

    stream.button({
      command: 'agentx.configShow',
      title: 'View Current Config',
    });
    stream.button({
      command: 'agentx.reinitialize',
      arguments: [workspacePath, 'typescript'],
      title: 'Add Missing Files',
    });
    stream.button({
      command: 'agentx.reinitializeOverwrite',
      arguments: [workspacePath, 'typescript'],
      title: 'Reinitialize (Overwrite)',
    });

    return { metadata: { command: 'init', status: 'exists' } };
  }

  // Step 3: Analyze project
  stream.markdown(`### Step 2: Project Analysis\n\n`);

  const analysis = await analyzeProject(workspacePath);

  stream.markdown(`| Property | Value |\n|----------|-------|\n`);
  stream.markdown(`| Type | **${analysis.projectType}** |\n`);
  if (analysis.projectName) {
    stream.markdown(`| Name | ${analysis.projectName} |\n`);
  }
  if (analysis.buildTool) {
    stream.markdown(`| Build Tool | ${analysis.buildTool} |\n`);
  }
  stream.markdown(`| Dependencies | ${analysis.dependencies.length} |\n\n`);

  // Show detected frameworks
  const allFrameworks = [
    ...analysis.frameworks.frontend,
    ...analysis.frameworks.backend,
    ...analysis.frameworks.testing,
    ...analysis.frameworks.build,
  ];

  if (allFrameworks.length > 0) {
    stream.markdown(`**Detected Frameworks:**\n`);
    for (const fw of allFrameworks.slice(0, 10)) {
      stream.markdown(`- ${fw.name}${fw.version ? ` (${fw.version})` : ''}\n`);
    }
    if (allFrameworks.length > 10) {
      stream.markdown(`- ... and ${allFrameworks.length - 10} more\n`);
    }
    stream.markdown(`\n`);
  }

  // Step 4: Preview scaffold
  stream.markdown(`### Step 3: Configuration Preview\n\n`);

  const templates =
    DEFAULT_TEMPLATES[analysis.projectType as keyof typeof DEFAULT_TEMPLATES] ||
    DEFAULT_TEMPLATES.typescript;

  stream.markdown(
    `Based on your **${analysis.projectType}** project, the following will be created:\n\n`
  );
  stream.markdown(`**Directory Structure:**\n`);
  stream.markdown(`\`\`\`\n`);
  stream.markdown(`.ai-config/\n`);
  stream.markdown(`├── config.json\n`);
  stream.markdown(`├── aliases/\n`);
  for (const alias of templates.aliases.slice(0, 5)) {
    stream.markdown(`│   └── ${alias.name}.json\n`);
  }
  if (templates.aliases.length > 5) {
    stream.markdown(`│   └── ... (${templates.aliases.length - 5} more)\n`);
  }
  stream.markdown(`└── intentions/\n`);
  stream.markdown(`\`\`\`\n\n`);

  stream.markdown(`**Aliases to be created:**\n`);
  for (const alias of templates.aliases) {
    stream.markdown(`- \`${alias.name}\` - ${alias.description}\n`);
  }
  stream.markdown(`\n`);

  // Confirm and scaffold
  stream.markdown(`### Ready to Initialize\n\n`);

  stream.button({
    command: 'agentx.executeScaffold',
    arguments: [workspacePath, analysis.projectType, false],
    title: 'Initialize Project',
  });
  stream.button({
    command: 'agentx.executeScaffold',
    arguments: [workspacePath, analysis.projectType, true],
    title: 'Initialize + Create Source Dirs',
  });

  return { metadata: { command: 'init', projectType: analysis.projectType } };
}

/**
 * /init:analyze - Analyze project without scaffolding
 */
async function handleInitAnalyzeCommand(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    stream.markdown(`## Project Analysis\n\n`);
    stream.markdown(`**No workspace folder open**\n\n`);
    stream.markdown(`Please open a folder or workspace first.\n`);
    return { metadata: { command: 'init:analyze', error: 'no_workspace' } };
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  stream.markdown(`## Project Analysis\n\n`);

  // Step 1: Detect project root
  stream.markdown(`### Project Detection\n\n`);
  const detection = detectProjectRoot(workspacePath);

  if (!detection.isProjectRoot) {
    stream.markdown(`**No project markers found** in \`${workspacePath}\`\n\n`);
    stream.markdown(`This doesn't appear to be a project root.\n`);
    return { metadata: { command: 'init:analyze', error: 'not_project_root' } };
  }

  stream.markdown(`| Property | Value |\n|----------|-------|\n`);
  stream.markdown(`| Path | \`${workspacePath}\` |\n`);
  stream.markdown(
    `| Markers | ${detection.detectedMarkers.map((m) => `\`${m}\``).join(', ')} |\n`
  );
  stream.markdown(`| Primary | \`${detection.primaryMarker}\` |\n\n`);

  // Step 2: Analyze project
  stream.markdown(`### Dependencies & Frameworks\n\n`);
  const analysis = await analyzeProject(workspacePath);

  stream.markdown(`| Property | Value |\n|----------|-------|\n`);
  stream.markdown(`| Type | **${analysis.projectType}** |\n`);
  if (analysis.projectName) {
    stream.markdown(`| Name | ${analysis.projectName} |\n`);
  }
  if (analysis.projectVersion) {
    stream.markdown(`| Version | ${analysis.projectVersion} |\n`);
  }
  if (analysis.buildTool) {
    stream.markdown(`| Build Tool | ${analysis.buildTool} |\n`);
  }
  stream.markdown(`| Dependencies | ${analysis.dependencies.length} |\n\n`);

  // Show detected frameworks by category
  const { frontend, backend, testing, build } = analysis.frameworks;

  if (frontend.length > 0) {
    stream.markdown(`**Frontend:** ${frontend.map((f) => f.name).join(', ')}\n\n`);
  }
  if (backend.length > 0) {
    stream.markdown(`**Backend:** ${backend.map((f) => f.name).join(', ')}\n\n`);
  }
  if (testing.length > 0) {
    stream.markdown(`**Testing:** ${testing.map((f) => f.name).join(', ')}\n\n`);
  }
  if (build.length > 0) {
    stream.markdown(`**Build:** ${build.map((f) => f.name).join(', ')}\n\n`);
  }

  // Check if already initialized
  if (hasAiConfig(workspacePath)) {
    stream.markdown(`### AgentX Status\n\n`);
    stream.markdown(`\`.ai-config/\` exists at \`${getAiConfigPath(workspacePath)}\`\n`);
  } else {
    stream.markdown(`### Next Steps\n\n`);
    stream.markdown(`Run \`/init:scaffold\` to create \`.ai-config/\` for this project.\n`);
  }

  return { metadata: { command: 'init:analyze', projectType: analysis.projectType } };
}

/**
 * /init:scaffold and /init:scaffold-with-dirs - Scaffold .ai-config
 */
async function handleInitScaffoldCommand(
  stream: vscode.ChatResponseStream,
  createSourceDirs: boolean
): Promise<vscode.ChatResult> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    stream.markdown(`## Scaffold Project\n\n`);
    stream.markdown(`**No workspace folder open**\n\n`);
    stream.markdown(`Please open a folder or workspace first.\n`);
    return { metadata: { command: 'init:scaffold', error: 'no_workspace' } };
  }

  const workspacePath = workspaceFolders[0].uri.fsPath;

  stream.markdown(`## Scaffold AgentX Configuration\n\n`);

  // Detect project type
  const detection = detectProjectRoot(workspacePath);
  const analysis = await analyzeProject(workspacePath);

  stream.markdown(`Detected project type: **${analysis.projectType}**\n\n`);

  // Check if already exists
  if (hasAiConfig(workspacePath)) {
    stream.markdown(`**.ai-config/** already exists.\n\n`);
    stream.markdown(`Use the buttons below to update:\n\n`);

    stream.button({
      command: 'agentx.reinitialize',
      arguments: [workspacePath, analysis.projectType],
      title: 'Add Missing Files',
    });
    stream.button({
      command: 'agentx.reinitializeOverwrite',
      arguments: [workspacePath, analysis.projectType],
      title: 'Overwrite All',
    });

    return { metadata: { command: 'init:scaffold', status: 'exists' } };
  }

  // Preview what will be created
  const templates =
    DEFAULT_TEMPLATES[analysis.projectType as keyof typeof DEFAULT_TEMPLATES] ||
    DEFAULT_TEMPLATES.typescript;

  stream.markdown(`### Files to Create\n\n`);
  stream.markdown(`\`\`\`\n`);
  stream.markdown(`.ai-config/\n`);
  stream.markdown(`├── config.json\n`);
  stream.markdown(`├── aliases/\n`);
  for (const alias of templates.aliases) {
    stream.markdown(`│   └── ${alias.name}.json\n`);
  }
  stream.markdown(`└── intentions/\n`);
  stream.markdown(`\`\`\`\n\n`);

  if (createSourceDirs && templates.sourceDirs.length > 0) {
    stream.markdown(`### Source Directories\n\n`);
    for (const dir of templates.sourceDirs) {
      stream.markdown(`- \`${dir}/\`\n`);
    }
    stream.markdown(`\n`);
  }

  // Execute scaffold
  stream.markdown(`### Initializing...\n\n`);

  const result = await scaffoldProject({
    projectType: analysis.projectType,
    basePath: workspacePath,
    createSourceDirs,
    overwrite: false,
  });

  if (result.success) {
    stream.markdown(`**Success!** Created ${result.createdFiles.length} files.\n\n`);

    if (result.createdFiles.length > 0) {
      stream.markdown(`**Created:**\n`);
      for (const file of result.createdFiles.slice(0, 10)) {
        const relativePath = file.replace(workspacePath, '').replace(/^\//, '');
        stream.markdown(`- \`${relativePath}\`\n`);
      }
      if (result.createdFiles.length > 10) {
        stream.markdown(`- ... and ${result.createdFiles.length - 10} more\n`);
      }
      stream.markdown(`\n`);
    }

    stream.markdown(`Run \`/alias list\` to see available aliases.\n`);
  } else {
    stream.markdown(`**Error:** ${result.errors.join(', ')}\n`);
  }

  return {
    metadata: {
      command: createSourceDirs ? 'init:scaffold-with-dirs' : 'init:scaffold',
      projectType: analysis.projectType,
      success: result.success,
    },
  };
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

  stream.markdown(`### Workflows\n`);
  stream.markdown(`- \`/workflow <id> [inputs]\` - Run a workflow by ID\n`);
  stream.markdown(`- \`/list-workflows\` - List all available workflows\n`);
  stream.markdown(`- \`/resume [execution-id]\` - Resume a paused/failed workflow\n`);
  stream.markdown(`- \`/status\` - Show recent workflow executions\n\n`);
  stream.markdown(`**Examples:**\n`);
  stream.markdown(`- \`/workflow spring-crud-endpoint entityName:Product fields:name,price\`\n\n`);

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

