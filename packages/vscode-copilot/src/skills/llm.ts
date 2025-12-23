/**
 * LLM Runner
 * Delegates execution to the LLM with a structured prompt
 */

import * as vscode from 'vscode';
import { Skill, RawExecutionResult } from './types';

/**
 * LLM runner for executing skills via language model
 */
export class LlmRunner {
  private token?: vscode.CancellationToken;

  /**
   * Set cancellation token for current execution
   */
  setCancellationToken(token: vscode.CancellationToken): void {
    this.token = token;
  }

  /**
   * Execute an LLM skill
   */
  async run(skill: Skill, inputs: Record<string, unknown>): Promise<RawExecutionResult> {
    const prompt = this.interpolate(skill.prompt || '', inputs);

    // Get language model
    const modelFamily = this.getModelFamily(skill.model);
    const models = await vscode.lm.selectChatModels({
      vendor: 'copilot',
      family: modelFamily,
    });

    if (!models.length) {
      // Try without family filter
      const allModels = await vscode.lm.selectChatModels({ vendor: 'copilot' });
      if (!allModels.length) {
        throw new Error('No language model available');
      }
      models.push(allModels[0]);
    }

    const model = models[0];
    const messages = [vscode.LanguageModelChatMessage.User(prompt)];

    // Build request options
    const options: vscode.LanguageModelChatRequestOptions = {};

    // Send request
    const response = await model.sendRequest(
      messages,
      options,
      this.token || new vscode.CancellationTokenSource().token
    );

    // Collect response
    let responseText = '';
    for await (const chunk of response.text) {
      responseText += chunk;
    }

    return {
      stdout: responseText,
      response: responseText,
      exitCode: 0,
    };
  }

  /**
   * Interpolate template variables in prompt
   */
  interpolate(template: string, inputs: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = inputs[key];
      if (value === undefined) return match;

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value);
    });
  }

  /**
   * Get model family from model name
   */
  private getModelFamily(model?: string): string {
    if (!model || model === 'default') {
      return 'gpt-4o';
    }

    // Map common model names to families
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'claude-sonnet': 'claude-3.5-sonnet',
      'claude-opus': 'claude-3-opus',
    };

    return modelMap[model] || model;
  }
}
