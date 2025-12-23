/**
 * VS Code commands for AgentX
 * Mirrors CLI commands where applicable
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
  aliasDirectoryExists,
  getAliasDirectoryPath,
  listHistoryEntries,
  getLastHistoryEntry,
  clearHistory,
  scaffoldProject,
  getAiConfigPath,
  ProjectType,
  getIntention,
  IntentionDefinition,
  // Plan document management
  loadPlanDocument,
  savePlanDocument,
  approvePlan,
  rejectPlan,
  deletePlanDocument,
  generatePrdDocument,
  savePrdToHistory,
  isPlanExpired,
  PlanDocument,
} from '@agentx/core';
import * as path from 'path';
import { executeWithVSCodeLM, isVSCodeLMAvailable, executeWithVSCodeLMStreaming } from './vscode-lm-provider';

/**
 * Register all AgentX commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
  // agentx exec <alias> <prompt> - Execute AI prompt with context alias
  const execCommand = vscode.commands.registerCommand('agentx.exec', async () => {
    const aliases = await loadAliases();

    if (aliases.length === 0) {
      vscode.window.showWarningMessage(
        'No aliases found. Please configure aliases in your knowledge base.'
      );
      return;
    }

    // Select alias (like CLI argument)
    const aliasItems = aliases.map((a) => ({
      label: a.name,
      description: a.description,
      detail: `${a.patterns.length} pattern(s)`,
    }));

    const selectedAlias = await vscode.window.showQuickPick(aliasItems, {
      placeHolder: 'Select an alias',
      title: 'AgentX: Select Context Alias',
    });

    if (!selectedAlias) {
      return;
    }

    // Get prompt (like CLI argument)
    const prompt = await vscode.window.showInputBox({
      prompt: 'Enter your prompt',
      placeHolder: 'What would you like to do?',
      title: 'AgentX: Enter Prompt',
    });

    if (!prompt) {
      return;
    }

    // Execute
    const alias = await getAlias(selectedAlias.label);
    if (!alias) {
      vscode.window.showErrorMessage(`Alias not found: ${selectedAlias.label}`);
      return;
    }

    const builtContext = await buildContext(alias);

    // Check if VS Code LM API is available
    if (!isVSCodeLMAvailable()) {
      vscode.window.showErrorMessage(
        'VS Code Language Model API not available. Please update VS Code to version 1.90 or later.'
      );
      return;
    }

    // Show progress with cancellation support
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `AgentX: Executing with ${alias.name}`,
        cancellable: true,
      },
      async (progress, token) => {
        progress.report({ message: 'Building context...' });

        const contextInfo = `${builtContext.files.length} files (${(builtContext.totalSize / 1024).toFixed(1)} KB)`;

        if (builtContext.truncated) {
          vscode.window.showWarningMessage(
            `Context was truncated to fit within size limit.`
          );
        }

        progress.report({ message: 'Sending to VS Code Copilot...' });

        const result = await executeWithVSCodeLM(prompt, builtContext.content, token);

        if (!result.success) {
          vscode.window.showErrorMessage(`Error: ${result.error}`);
          return;
        }

        // Show result in new document
        const doc = await vscode.workspace.openTextDocument({
          content: `# AgentX Response\n\n**Alias:** ${alias.name}\n**Context:** ${contextInfo}\n**Provider:** VS Code Copilot (native)\n\n---\n\n## Prompt\n\n${prompt}\n\n---\n\n## Response\n\n${result.response}`,
          language: 'markdown',
        });

        await vscode.window.showTextDocument(doc);
      }
    );
  });

  // agentx alias list - List all available aliases
  const aliasListCommand = vscode.commands.registerCommand(
    'agentx.aliasList',
    async () => {
      if (!aliasDirectoryExists()) {
        vscode.window.showWarningMessage(
          `Alias directory not found: ${getAliasDirectoryPath()}`
        );
        return;
      }

      const aliases = await loadAliases();

      if (aliases.length === 0) {
        vscode.window.showInformationMessage('No aliases found.');
        return;
      }

      const aliasItems = aliases.map((a) => ({
        label: a.name,
        description: a.description,
        detail: `${a.patterns.length} pattern(s)`,
      }));

      const selected = await vscode.window.showQuickPick(aliasItems, {
        placeHolder: `${aliases.length} alias(es) available - Select to view details`,
        title: 'AgentX: Available Aliases',
      });

      if (selected) {
        vscode.commands.executeCommand('agentx.aliasShow', selected.label);
      }
    }
  );

  // agentx alias show <name> - Show details of a specific alias
  const aliasShowCommand = vscode.commands.registerCommand(
    'agentx.aliasShow',
    async (aliasName?: string) => {
      let name = aliasName;

      if (!name) {
        const aliases = await loadAliases();
        const aliasItems = aliases.map((a) => ({
          label: a.name,
          description: a.description,
        }));

        const selected = await vscode.window.showQuickPick(aliasItems, {
          placeHolder: 'Select an alias to view details',
        });

        if (!selected) {
          return;
        }
        name = selected.label;
      }

      const alias = await getAliasWithFiles(name);

      if (!alias) {
        vscode.window.showErrorMessage(`Alias not found: ${name}`);
        return;
      }

      const totalSize = calculateTotalSize(alias.resolvedFiles);
      const fileList = alias.resolvedFiles
        .slice(0, 20)
        .map((f) => `- ${f.path} (${(f.size / 1024).toFixed(1)} KB)`)
        .join('\n');
      const moreFiles =
        alias.resolvedFiles.length > 20
          ? `\n... and ${alias.resolvedFiles.length - 20} more files`
          : '';

      const content = `# Alias: ${alias.name}

**Description:** ${alias.description}

## Patterns

${alias.patterns.map((p) => `- \`${p}\``).join('\n')}

## Resolved Files (${alias.resolvedFiles.length})

**Total size:** ${(totalSize / 1024).toFixed(1)} KB

${fileList}${moreFiles}`;

      const doc = await vscode.workspace.openTextDocument({
        content,
        language: 'markdown',
      });

      await vscode.window.showTextDocument(doc);
    }
  );

  // agentx config show - Display current configuration
  const configShowCommand = vscode.commands.registerCommand(
    'agentx.configShow',
    async () => {
      const config = loadConfig();
      const configPath = findConfigPath();

      const header = configPath
        ? `# AgentX Configuration\n\n**Config file:** \`${configPath}\`\n\n`
        : `# AgentX Configuration\n\n*Using default configuration (no config file found)*\n\n`;

      const configYaml = Object.entries(config)
        .map(([key, value]) => {
          const displayValue =
            typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value);
          return `${key}: ${displayValue}`;
        })
        .join('\n');

      const doc = await vscode.workspace.openTextDocument({
        content: `${header}\`\`\`yaml\n${configYaml}\n\`\`\``,
        language: 'markdown',
      });

      await vscode.window.showTextDocument(doc);
    }
  );

  // agentx config path - Show configuration file path
  const configPathCommand = vscode.commands.registerCommand(
    'agentx.configPath',
    async () => {
      const configPath = findConfigPath();

      if (configPath) {
        const action = await vscode.window.showInformationMessage(
          `Config file: ${configPath}`,
          'Open File'
        );

        if (action === 'Open File') {
          const doc = await vscode.workspace.openTextDocument(
            vscode.Uri.file(configPath)
          );
          await vscode.window.showTextDocument(doc);
        }
      } else {
        vscode.window.showInformationMessage(
          'No configuration file found. Default location: .ai-config/config.json'
        );
      }
    }
  );

  // agentx.execWithAlias - Execute with specific alias and prompt (for chat buttons)
  const execWithAliasCommand = vscode.commands.registerCommand(
    'agentx.execWithAlias',
    async (aliasName: string, prompt: string) => {
      const alias = await getAlias(aliasName);
      if (!alias) {
        vscode.window.showErrorMessage(`Alias not found: ${aliasName}`);
        return;
      }

      // Check if VS Code LM API is available
      if (!isVSCodeLMAvailable()) {
        vscode.window.showErrorMessage(
          'VS Code Language Model API not available. Please update VS Code to version 1.90 or later.'
        );
        return;
      }

      const builtContext = await buildContext(alias);

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `AgentX: Executing with ${alias.name}`,
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ message: 'Building context...' });

          const contextInfo = `${builtContext.files.length} files (${(builtContext.totalSize / 1024).toFixed(1)} KB)`;

          if (builtContext.truncated) {
            vscode.window.showWarningMessage(
              `Context was truncated to fit within size limit.`
            );
          }

          progress.report({ message: 'Sending to VS Code Copilot...' });

          const result = await executeWithVSCodeLM(prompt, builtContext.content, token);

          if (!result.success) {
            vscode.window.showErrorMessage(`Error: ${result.error}`);
            return;
          }

          // Show result in new document
          const doc = await vscode.workspace.openTextDocument({
            content: `# AgentX Response\n\n**Alias:** ${alias.name}\n**Context:** ${contextInfo}\n**Provider:** VS Code Copilot (native)\n\n---\n\n## Prompt\n\n${prompt}\n\n---\n\n## Response\n\n${result.response}`,
            language: 'markdown',
          });

          await vscode.window.showTextDocument(doc);
        }
      );
    }
  );

  // Legacy commands for backward compatibility
  const selectAliasCommand = vscode.commands.registerCommand(
    'agentx.selectAlias',
    () => vscode.commands.executeCommand('agentx.aliasList')
  );

  const showConfigCommand = vscode.commands.registerCommand(
    'agentx.showConfig',
    () => vscode.commands.executeCommand('agentx.configShow')
  );

  // agentx.openLastContext - Open the most recent context file
  const openLastContextCommand = vscode.commands.registerCommand(
    'agentx.openLastContext',
    async () => {
      const config = loadConfig();
      const lastEntry = await getLastHistoryEntry(config.history);

      if (!lastEntry) {
        vscode.window.showInformationMessage('No context history found.');
        return;
      }

      const contextPath = `${lastEntry}/context.md`;
      try {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(contextPath));
        await vscode.window.showTextDocument(doc);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to open context file: ${contextPath}`);
      }
    }
  );

  // agentx.browseHistory - Browse context history
  const browseHistoryCommand = vscode.commands.registerCommand(
    'agentx.browseHistory',
    async () => {
      const config = loadConfig();
      const entries = await listHistoryEntries(config.history);

      if (entries.length === 0) {
        vscode.window.showInformationMessage('No context history found.');
        return;
      }

      // Format entries for quick pick
      const items = entries.map((entry) => {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        let dateLabel: string;
        if (entry.date === today) {
          dateLabel = 'Today';
        } else if (entry.date === yesterday) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = entry.date;
        }

        const timeFormatted = `${entry.time.slice(0, 2)}:${entry.time.slice(2)}`;
        const intentLabel = entry.intent ? ` / ${entry.intent}` : '';

        return {
          label: `${dateLabel} ${timeFormatted} — ${entry.contextGroup}${intentLabel}`,
          description: entry.path,
          path: entry.path,
        };
      });

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a context to view',
        title: 'AgentX: Context History',
      });

      if (selected) {
        const contextPath = `${selected.path}/context.md`;
        try {
          const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(contextPath));
          await vscode.window.showTextDocument(doc);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to open context file: ${contextPath}`);
        }
      }
    }
  );

  // agentx.clearHistory - Clear all context history
  const clearHistoryCommand = vscode.commands.registerCommand(
    'agentx.clearHistory',
    async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear all context history?',
        { modal: true },
        'Clear History'
      );

      if (confirm === 'Clear History') {
        const config = loadConfig();
        await clearHistory(config.history);
        vscode.window.showInformationMessage('Context history cleared.');
      }
    }
  );

  // agentx.executeScaffold - Execute scaffolding for a project
  const executeScaffoldCommand = vscode.commands.registerCommand(
    'agentx.executeScaffold',
    async (workspacePath: string, projectType: string, createSourceDirs: boolean) => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AgentX: Initializing project...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Creating .ai-config structure...' });

          const result = await scaffoldProject({
            projectType: projectType as ProjectType,
            basePath: workspacePath,
            createSourceDirs,
            overwrite: false,
          });

          if (result.success) {
            vscode.window.showInformationMessage(
              `AgentX initialized! Created ${result.createdFiles.length} files in .ai-config/`
            );

            // Open the config.json file
            const configPath = path.join(workspacePath, '.ai-config', 'config.json');
            try {
              const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(configPath));
              await vscode.window.showTextDocument(doc);
            } catch {
              // Config file may not exist yet
            }
          } else {
            vscode.window.showErrorMessage(
              `Initialization failed: ${result.errors.join(', ')}`
            );
          }
        }
      );
    }
  );

  // agentx.initAnyway - Initialize even without project markers
  const initAnywayCommand = vscode.commands.registerCommand(
    'agentx.initAnyway',
    async (workspacePath: string) => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AgentX: Initializing project...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Creating .ai-config structure...' });

          const result = await scaffoldProject({
            projectType: 'typescript', // Default to TypeScript
            basePath: workspacePath,
            createSourceDirs: false,
            overwrite: false,
          });

          if (result.success) {
            vscode.window.showInformationMessage(
              `AgentX initialized with default TypeScript configuration.`
            );

            // Open the config.json file
            const configPath = path.join(workspacePath, '.ai-config', 'config.json');
            try {
              const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(configPath));
              await vscode.window.showTextDocument(doc);
            } catch {
              // Config file may not exist yet
            }
          } else {
            vscode.window.showErrorMessage(
              `Initialization failed: ${result.errors.join(', ')}`
            );
          }
        }
      );
    }
  );

  // agentx.reinitialize - Reinitialize preserving existing files
  const reinitializeCommand = vscode.commands.registerCommand(
    'agentx.reinitialize',
    async (workspacePath: string, projectType: string) => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AgentX: Reinitializing project...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Updating .ai-config structure...' });

          const result = await scaffoldProject({
            projectType: (projectType || 'typescript') as ProjectType,
            basePath: workspacePath,
            createSourceDirs: false,
            overwrite: false, // Preserve existing files
          });

          if (result.success) {
            const message =
              result.createdFiles.length > 0
                ? `Added ${result.createdFiles.length} new files. ${result.skippedPaths.length} existing files preserved.`
                : `All files already exist. ${result.skippedPaths.length} files preserved.`;

            vscode.window.showInformationMessage(message);
          } else {
            vscode.window.showErrorMessage(
              `Reinitialization failed: ${result.errors.join(', ')}`
            );
          }
        }
      );
    }
  );

  // agentx.reinitializeOverwrite - Reinitialize and overwrite existing files
  const reinitializeOverwriteCommand = vscode.commands.registerCommand(
    'agentx.reinitializeOverwrite',
    async (workspacePath: string, projectType: string) => {
      const confirm = await vscode.window.showWarningMessage(
        'This will overwrite existing .ai-config files. Continue?',
        { modal: true },
        'Overwrite'
      );

      if (confirm !== 'Overwrite') {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AgentX: Reinitializing project...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Overwriting .ai-config structure...' });

          const result = await scaffoldProject({
            projectType: (projectType || 'typescript') as ProjectType,
            basePath: workspacePath,
            createSourceDirs: false,
            overwrite: true,
          });

          if (result.success) {
            vscode.window.showInformationMessage(
              `AgentX reinitialized! Updated ${result.createdFiles.length} files.`
            );

            // Open the config.json file
            const configPath = path.join(workspacePath, '.ai-config', 'config.json');
            try {
              const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(configPath));
              await vscode.window.showTextDocument(doc);
            } catch {
              // Config file may not exist yet
            }
          } else {
            vscode.window.showErrorMessage(
              `Reinitialization failed: ${result.errors.join(', ')}`
            );
          }
        }
      );
    }
  );

  // agentx.executePlan - Execute and approve a plan, saving PRD to history
  const executePlanCommand = vscode.commands.registerCommand(
    'agentx.executePlan',
    async (planId: string) => {
      // Load plan document from disk
      const plan = loadPlanDocument(planId);

      if (!plan) {
        vscode.window.showErrorMessage(
          'Plan not found. Please regenerate the plan.'
        );
        return;
      }

      if (isPlanExpired(plan)) {
        deletePlanDocument(planId);
        vscode.window.showErrorMessage(
          'Plan has expired. Please regenerate the plan.'
        );
        return;
      }

      if (plan.status !== 'ready') {
        vscode.window.showWarningMessage(
          `Plan is not ready (status: ${plan.status}). Please provide all required information first.`
        );
        return;
      }

      // Check if VS Code LM API is available
      if (!isVSCodeLMAvailable()) {
        vscode.window.showErrorMessage(
          'VS Code Language Model API not available. Please update VS Code to version 1.90 or later.'
        );
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `AgentX: Executing plan for ${plan.alias}:${plan.intention.id}`,
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ message: 'Approving plan and generating PRD...' });

          // Approve the plan
          const approvedPlan = approvePlan(plan);
          savePlanDocument(approvedPlan);

          // Generate PRD document
          const prd = generatePrdDocument(approvedPlan);

          // Save PRD to history
          progress.report({ message: 'Saving PRD to history...' });
          const { prdPath } = savePrdToHistory(prd, approvedPlan.contextContent);

          // Create output channel for streaming implementation
          const outputChannel = vscode.window.createOutputChannel('AgentX Plan Execution', 'markdown');
          outputChannel.show(true);

          outputChannel.appendLine(`# AgentX Plan Execution\n`);
          outputChannel.appendLine(`**Alias:** ${plan.alias}`);
          outputChannel.appendLine(`**Intention:** ${plan.intention.name}`);
          outputChannel.appendLine(`**Prompt:** ${plan.originalPrompt}\n`);
          outputChannel.appendLine(`**PRD Saved:** ${prdPath}\n`);
          outputChannel.appendLine(`---\n`);
          outputChannel.appendLine(`## Requirements\n`);
          for (const req of plan.gathered) {
            outputChannel.appendLine(`- **${req.name}:** ${req.value}`);
          }
          outputChannel.appendLine(`\n---\n`);
          outputChannel.appendLine(`## Plan\n`);
          outputChannel.appendLine(plan.implementationPlan || '');
          outputChannel.appendLine(`\n---\n`);

          // Show context being sent to provider
          outputChannel.appendLine(`## Context Provided to LLM\n`);
          const contextContent = plan.contextContent || '';
          if (contextContent) {
            const contextLines = contextContent.split('\n').length;
            const contextSize = (contextContent.length / 1024).toFixed(1);
            outputChannel.appendLine(`**Size:** ${contextSize} KB (${contextLines} lines)\n`);
            outputChannel.appendLine(`<details>\n<summary>Click to expand full context</summary>\n`);
            outputChannel.appendLine(`\n\`\`\`markdown\n${contextContent}\n\`\`\`\n`);
            outputChannel.appendLine(`</details>\n`);
          } else {
            outputChannel.appendLine(`⚠️ **Warning:** No context content found in plan document!\n`);
            outputChannel.appendLine(`The LLM will execute without your knowledge base context.\n`);
          }
          outputChannel.appendLine(`\n---\n`);
          outputChannel.appendLine(`## Implementation\n`);

          progress.report({ message: 'Executing implementation...' });

          // Build refined prompt from gathered requirements
          const requirementsSummary = plan.gathered
            .map(r => `- ${r.name}: ${r.value}`)
            .join('\n');

          const implementationPrompt = `Based on the following approved plan, implement the solution:

## Intention: ${plan.intention.name}
${plan.intention.description}

## Requirements
${requirementsSummary}

## Original Request
${plan.originalPrompt}

## Implementation Plan
${plan.implementationPlan}

Please implement the solution according to the plan above. Follow all conventions from the context provided.`;

          const result = await executeWithVSCodeLM(
            implementationPrompt,
            plan.contextContent || '',
            token
          );

          if (!result.success) {
            outputChannel.appendLine(`\n❌ **Error:** ${result.error}`);
            vscode.window.showErrorMessage(`Error: ${result.error}`);
            return;
          }

          outputChannel.appendLine(result.response || '');

          // Clean up plan document after successful execution
          deletePlanDocument(planId);

          vscode.window.showInformationMessage(
            `Plan executed successfully! PRD saved to: ${prdPath}`
          );
        }
      );
    }
  );

  // agentx.rejectPlan - Reject a plan and clean up
  const rejectPlanCommand = vscode.commands.registerCommand(
    'agentx.rejectPlan',
    async (planId: string) => {
      const plan = loadPlanDocument(planId);

      if (plan) {
        // Mark as rejected and save
        const rejectedPlan = rejectPlan(plan);
        savePlanDocument(rejectedPlan);

        // Delete the plan file
        deletePlanDocument(planId);

        vscode.window.showInformationMessage(
          'Plan cancelled. You can modify your prompt and try again.'
        );
      }
    }
  );

  context.subscriptions.push(
    execCommand,
    aliasListCommand,
    aliasShowCommand,
    configShowCommand,
    configPathCommand,
    execWithAliasCommand,
    selectAliasCommand,
    showConfigCommand,
    openLastContextCommand,
    browseHistoryCommand,
    clearHistoryCommand,
    executeScaffoldCommand,
    initAnywayCommand,
    reinitializeCommand,
    reinitializeOverwriteCommand,
    executePlanCommand,
    rejectPlanCommand
  );
}

