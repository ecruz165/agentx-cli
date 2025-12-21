/**
 * AgentX VS Code Extension
 * Main activation entry point
 */

import * as vscode from 'vscode';
import { setBasePath, clearBasePath } from '@agentx/core';
import { registerCommands } from './commands';
import { registerChatParticipant } from './participant';

/**
 * Set the base path for the core library based on the current workspace
 */
function updateBasePath(): void {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const workspacePath = workspaceFolders[0].uri.fsPath;
    setBasePath(workspacePath);
    console.log(`AgentX: Base path set to ${workspacePath}`);
  } else {
    clearBasePath();
    console.log('AgentX: No workspace folder, using default base path');
  }
}

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('AgentX extension is now active');

  // Set base path for core library based on workspace
  updateBasePath();

  // Listen for workspace folder changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      updateBasePath();
    })
  );

  // Register commands
  registerCommands(context);

  // Register chat participant
  registerChatParticipant(context);

  // Show activation message
  vscode.window.showInformationMessage('AgentX extension activated');
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('AgentX extension deactivated');
}

