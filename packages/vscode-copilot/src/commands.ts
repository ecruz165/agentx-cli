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
  executeWithProvider,
  aliasDirectoryExists,
  getAliasDirectoryPath,
} from '@agentx/core';

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

    const config = loadConfig();
    const builtContext = await buildContext(alias);

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `AgentX: Executing with ${alias.name}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Building context...' });

        const contextInfo = `${builtContext.files.length} files (${(builtContext.totalSize / 1024).toFixed(1)} KB)`;

        if (builtContext.truncated) {
          vscode.window.showWarningMessage(
            `Context was truncated to fit within size limit.`
          );
        }

        progress.report({ message: `Sending to ${config.provider}...` });

        const result = await executeWithProvider(prompt, builtContext.content);

        if (!result.success) {
          vscode.window.showErrorMessage(`Provider error: ${result.error}`);
          return;
        }

        // Show result in new document
        const doc = await vscode.workspace.openTextDocument({
          content: `# AgentX Response\n\n**Alias:** ${alias.name}\n**Context:** ${contextInfo}\n**Provider:** ${config.provider}\n\n---\n\n## Prompt\n\n${prompt}\n\n---\n\n## Response\n\n${result.response}`,
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

      const config = loadConfig();
      const builtContext = await buildContext(alias);

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `AgentX: Executing with ${alias.name}`,
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Building context...' });

          const contextInfo = `${builtContext.files.length} files (${(builtContext.totalSize / 1024).toFixed(1)} KB)`;

          if (builtContext.truncated) {
            vscode.window.showWarningMessage(
              `Context was truncated to fit within size limit.`
            );
          }

          progress.report({ message: `Sending to ${config.provider}...` });

          const result = await executeWithProvider(prompt, builtContext.content);

          if (!result.success) {
            vscode.window.showErrorMessage(`Provider error: ${result.error}`);
            return;
          }

          // Show result in new document
          const doc = await vscode.workspace.openTextDocument({
            content: `# AgentX Response\n\n**Alias:** ${alias.name}\n**Context:** ${contextInfo}\n**Provider:** ${config.provider}\n\n---\n\n## Prompt\n\n${prompt}\n\n---\n\n## Response\n\n${result.response}`,
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

  context.subscriptions.push(
    execCommand,
    aliasListCommand,
    aliasShowCommand,
    configShowCommand,
    configPathCommand,
    execWithAliasCommand,
    selectAliasCommand,
    showConfigCommand
  );
}

