/**
 * AgentX VS Code Extension
 * Main activation entry point
 */

import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerChatParticipant } from './participant';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('AgentX extension is now active');

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

