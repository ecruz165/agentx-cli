/**
 * VS Code Language Model Provider
 * Uses VS Code's native Language Model API to interact with Copilot
 */

import * as vscode from 'vscode';
import { estimateTokens, truncateContextForTokenLimit } from '@agentx/core';

/**
 * Result from executing with VS Code Language Model
 */
export interface VSCodeLMResult {
  success: boolean;
  response?: string;
  error?: string;
  truncated?: boolean;
}

/**
 * Default token limit for VS Code Copilot models
 */
const DEFAULT_TOKEN_LIMIT = 32000;

/**
 * Execute a prompt with context using VS Code's Language Model API
 * This uses the native Copilot integration in VS Code
 */
export async function executeWithVSCodeLM(
  prompt: string,
  context: string,
  token: vscode.CancellationToken
): Promise<VSCodeLMResult> {
  try {
    // Check if Language Model API is available
    if (!vscode.lm) {
      return {
        success: false,
        error: 'VS Code Language Model API not available. Please update VS Code to version 1.90 or later.',
      };
    }

    // Select a chat model - prefer GPT-4 family for code generation
    const models = await vscode.lm.selectChatModels({
      vendor: 'copilot',
      family: 'gpt-4',
    });

    if (models.length === 0) {
      // Fall back to any available Copilot model
      const fallbackModels = await vscode.lm.selectChatModels({
        vendor: 'copilot',
      });

      if (fallbackModels.length === 0) {
        return {
          success: false,
          error: 'No Copilot language models available. Please ensure GitHub Copilot is installed and authenticated.',
        };
      }

      models.push(...fallbackModels);
    }

    const model = models[0];

    // Get token limit from model or use default
    const maxTokens = model.maxInputTokens || DEFAULT_TOKEN_LIMIT;

    // Truncate context if needed to fit within token limit
    const { context: truncatedContext, truncated } = truncateContextForTokenLimit(
      context,
      prompt,
      maxTokens
    );

    // Build the messages for the chat
    const messages: vscode.LanguageModelChatMessage[] = [];

    // Add context as a system-like message
    if (truncatedContext) {
      messages.push(
        vscode.LanguageModelChatMessage.User(
          `Here is the relevant context from the knowledge base:\n\n${truncatedContext}\n\n---\n\nPlease use this context to help answer the following request.`
        )
      );
    }

    // Add the user's prompt
    messages.push(vscode.LanguageModelChatMessage.User(prompt));

    // Send the request
    const response = await model.sendRequest(messages, {}, token);

    // Collect the response stream
    let fullResponse = '';
    for await (const chunk of response.text) {
      fullResponse += chunk;
    }

    return {
      success: true,
      response: fullResponse,
      truncated,
    };
  } catch (error) {
    if (error instanceof vscode.CancellationError) {
      return {
        success: false,
        error: 'Request was cancelled.',
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Language Model error: ${errorMessage}`,
    };
  }
}

/**
 * Execute with streaming response to a chat stream
 */
export async function executeWithVSCodeLMStreaming(
  prompt: string,
  context: string,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<VSCodeLMResult> {
  try {
    if (!vscode.lm) {
      return {
        success: false,
        error: 'VS Code Language Model API not available. Please update VS Code to version 1.90 or later.',
      };
    }

    // Select a chat model
    const models = await vscode.lm.selectChatModels({
      vendor: 'copilot',
      family: 'gpt-4',
    });

    if (models.length === 0) {
      const fallbackModels = await vscode.lm.selectChatModels({
        vendor: 'copilot',
      });

      if (fallbackModels.length === 0) {
        return {
          success: false,
          error: 'No Copilot language models available. Please ensure GitHub Copilot is installed and authenticated.',
        };
      }

      models.push(...fallbackModels);
    }

    const model = models[0];

    // Get token limit from model or use default
    const maxTokens = model.maxInputTokens || DEFAULT_TOKEN_LIMIT;

    // Truncate context if needed to fit within token limit
    const { context: truncatedContext, truncated } = truncateContextForTokenLimit(
      context,
      prompt,
      maxTokens
    );

    // Show truncation warning if needed
    if (truncated) {
      stream.markdown(`⚠️ *Context was truncated to fit within token limit (~${maxTokens} tokens)*\n\n`);
    }

    // Build messages
    const messages: vscode.LanguageModelChatMessage[] = [];

    if (truncatedContext) {
      messages.push(
        vscode.LanguageModelChatMessage.User(
          `Here is the relevant context from the knowledge base:\n\n${truncatedContext}\n\n---\n\nPlease use this context to help answer the following request.`
        )
      );
    }

    messages.push(vscode.LanguageModelChatMessage.User(prompt));

    // Send request and stream response
    const response = await model.sendRequest(messages, {}, token);

    let fullResponse = '';
    for await (const chunk of response.text) {
      fullResponse += chunk;
      stream.markdown(chunk);
    }

    return {
      success: true,
      response: fullResponse,
      truncated,
    };
  } catch (error) {
    if (error instanceof vscode.CancellationError) {
      return {
        success: false,
        error: 'Request was cancelled.',
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Language Model error: ${errorMessage}`,
    };
  }
}

/**
 * Check if VS Code Language Model API is available
 */
export function isVSCodeLMAvailable(): boolean {
  return typeof vscode.lm !== 'undefined';
}

/**
 * Get available Copilot models
 */
export async function getAvailableCopilotModels(): Promise<string[]> {
  if (!vscode.lm) {
    return [];
  }

  try {
    const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
    return models.map((m) => `${m.vendor}/${m.family}/${m.id}`);
  } catch {
    return [];
  }
}

