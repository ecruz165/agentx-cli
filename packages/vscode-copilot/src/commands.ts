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
} from '@agentx/core';
import { executeWithVSCodeLM, isVSCodeLMAvailable } from './vscode-lm-provider';

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
    clearHistoryCommand
  );
}

