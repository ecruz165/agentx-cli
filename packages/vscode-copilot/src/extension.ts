/**
 * AgentX VS Code Extension
 * Main activation entry point
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { setBasePath, clearBasePath, setDefaultKnowledgeBasePath } from '@agentx/core';
import { registerCommands } from './commands';
import { registerChatParticipant } from './participant';

/**
 * Get the bundled knowledge base path
 * For development, this points to default-knowledge-base in the repo
 * For production, this would be bundled with the extension
 */
function getBundledKnowledgeBasePath(context: vscode.ExtensionContext): string {
  // In development, use the default-knowledge-base from the repo
  // The extension is at packages/vscode-copilot, knowledge base is at default-knowledge-base
  const devPath = path.resolve(context.extensionPath, '..', '..', 'default-knowledge-base');

  // Check if we're in development mode
  if (require('fs').existsSync(devPath)) {
    return devPath;
  }

  // In production, use bundled knowledge base or home directory
  const bundledPath = path.join(context.extensionPath, 'knowledge-base');
  if (require('fs').existsSync(bundledPath)) {
    return bundledPath;
  }

  // Fall back to home directory
  return path.join(require('os').homedir(), 'agentx-enterprise-docs');
}

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

  // Set the default knowledge base path (used when no project config exists)
  const bundledKbPath = getBundledKnowledgeBasePath(context);
  setDefaultKnowledgeBasePath(bundledKbPath);
  console.log(`AgentX: Default knowledge base set to ${bundledKbPath}`);

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

