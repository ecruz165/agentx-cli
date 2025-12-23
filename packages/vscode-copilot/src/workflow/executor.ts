/**
 * VS Code Workflow Step Executor
 * Implements the StepExecutor interface for VS Code Copilot Chat
 */

import * as vscode from 'vscode';
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowContext,
  WorkflowResult,
  StepResult,
  StepExecutor,
  interpolate,
  saveExecutionState,
  createExecutionState,
  updateExecutionStatus,
} from '@agentx/core';

/**
 * Options for the VS Code workflow executor
 */
export interface VSCodeExecutorOptions {
  stream: vscode.ChatResponseStream;
  token: vscode.CancellationToken;
  request: vscode.ChatRequest;
}

/**
 * VS Code implementation of StepExecutor
 */
export class VSCodeWorkflowExecutor implements StepExecutor {
  private stream: vscode.ChatResponseStream;
  private token: vscode.CancellationToken;
  private request: vscode.ChatRequest;
  private executionId: string | null = null;
  private stepIndex: number = 0;
  private totalSteps: number = 0;

  constructor(options: VSCodeExecutorOptions) {
    this.stream = options.stream;
    this.token = options.token;
    this.request = options.request;
  }

  /**
   * Called before workflow starts
   */
  async onWorkflowStart(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<void> {
    this.totalSteps = workflow.steps.length;
    this.stepIndex = 0;

    // Create execution state for persistence
    this.executionId = context.workflowId + '-' + Date.now().toString(36);
    const state = createExecutionState(
      this.executionId,
      workflow.id,
      context,
      context.intentionId
    );
    updateExecutionStatus(this.executionId, 'running');
    saveExecutionState(state);

    // Stream workflow start message
    this.stream.markdown(`## 🚀 Executing Workflow: ${workflow.name}\n\n`);
    this.stream.markdown(`${workflow.description}\n\n`);
    this.stream.markdown(`---\n\n`);
  }

  /**
   * Execute a single step
   */
  async executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
    workflow: WorkflowDefinition
  ): Promise<StepResult> {
    const startTime = Date.now();
    this.stepIndex++;

    // Check for cancellation
    if (this.token.isCancellationRequested) {
      return {
        stepId: step.id,
        status: 'skipped',
        outputs: {},
        duration: 0,
        error: 'Cancelled by user',
      };
    }

    // Show progress
    this.stream.progress(`Step ${this.stepIndex}/${this.totalSteps}: ${step.name}`);

    try {
      // Interpolate the prompt with context
      const prompt = interpolate(step.prompt, context);

      // Get available language models
      const models = await vscode.lm.selectChatModels({
        vendor: 'copilot',
        family: 'gpt-4o',
      });

      if (models.length === 0) {
        throw new Error('No language model available');
      }

      const model = models[0];

      // Build messages for the LLM
      const messages = [
        vscode.LanguageModelChatMessage.User(this.buildStepPrompt(step, prompt, context)),
      ];

      // Execute the LLM call
      const response = await model.sendRequest(messages, {}, this.token);

      // Collect the response
      let fullResponse = '';
      for await (const chunk of response.text) {
        fullResponse += chunk;
      }

      // Extract outputs from response
      const outputs = this.extractOutputs(fullResponse, step);

      // Stream success message
      this.stream.markdown(`\n✅ **Step ${this.stepIndex}**: ${step.name}\n\n`);

      // Show created files if any
      if (outputs.createdFiles) {
        const files = Array.isArray(outputs.createdFiles)
          ? outputs.createdFiles
          : [outputs.createdFiles];
        for (const file of files) {
          this.stream.markdown(`  📄 Created: \`${file}\`\n`);
        }
      }

      return {
        stepId: step.id,
        status: 'success',
        outputs,
        duration: Date.now() - startTime,
        createdFiles: outputs.createdFiles as string[] | undefined,
        modifiedFiles: outputs.modifiedFiles as string[] | undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Stream error message
      this.stream.markdown(`\n❌ **Step ${this.stepIndex}**: ${step.name} - Failed\n`);
      this.stream.markdown(`   Error: ${errorMessage}\n\n`);

      return {
        stepId: step.id,
        status: 'failed',
        outputs: {},
        duration: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Build a detailed prompt for a step
   */
  private buildStepPrompt(
    step: WorkflowStep,
    interpolatedPrompt: string,
    context: WorkflowContext
  ): string {
    let prompt = `# Task: ${step.name}\n\n`;

    if (step.description) {
      prompt += `## Description\n${step.description}\n\n`;
    }

    prompt += `## Instructions\n${interpolatedPrompt}\n\n`;

    if (step.skills.length > 0) {
      prompt += `## Available Skills\n`;
      for (const skill of step.skills) {
        prompt += `- ${skill}\n`;
      }
      prompt += '\n';
    }

    if (step.outputs.length > 0) {
      prompt += `## Expected Outputs\n`;
      prompt += `Please provide the following outputs in your response:\n`;
      for (const output of step.outputs) {
        prompt += `- **${output.name}** (${output.type})`;
        if (output.description) {
          prompt += `: ${output.description}`;
        }
        prompt += '\n';
      }
      prompt += '\n';
    }

    prompt += `## Response Format\n`;
    prompt += `Provide your response with clear sections for each output.\n`;
    prompt += `If creating files, show the file path and content.\n`;

    return prompt;
  }

  /**
   * Extract outputs from LLM response
   */
  private extractOutputs(
    response: string,
    step: WorkflowStep
  ): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    // Try to extract file paths from response
    const filePathMatches = response.matchAll(/(?:Created|File|Path):\s*`?([^\s`\n]+)`?/gi);
    const createdFiles: string[] = [];
    for (const match of filePathMatches) {
      createdFiles.push(match[1]);
    }
    if (createdFiles.length > 0) {
      outputs.createdFiles = createdFiles;
    }

    // For each expected output, try to find it in the response
    for (const output of step.outputs) {
      // Look for output name in response
      const regex = new RegExp(`${output.name}[:\\s]+([^\\n]+)`, 'i');
      const match = response.match(regex);
      if (match) {
        outputs[output.name] = match[1].trim();
      } else if (output.name.includes('FilePath') && createdFiles.length > 0) {
        // If looking for a file path, use the first created file
        outputs[output.name] = createdFiles[0];
      }
    }

    return outputs;
  }

  /**
   * Called after each step completes
   */
  async onStepComplete(
    step: WorkflowStep,
    result: StepResult,
    context: WorkflowContext
  ): Promise<void> {
    // Update execution state
    if (this.executionId) {
      updateExecutionStatus(this.executionId, 'running', {
        currentStepIndex: this.stepIndex,
        context,
      });
    }
  }

  /**
   * Called when workflow completes successfully
   */
  async onWorkflowComplete(
    result: WorkflowResult,
    context: WorkflowContext
  ): Promise<void> {
    // Update execution state
    if (this.executionId) {
      updateExecutionStatus(this.executionId, 'completed');
    }

    // Stream completion summary
    this.stream.markdown(`\n---\n\n`);
    this.stream.markdown(`## ✨ Workflow Complete!\n\n`);

    // Summary stats
    const successCount = result.steps.filter(s => s.status === 'success').length;
    const skippedCount = result.steps.filter(s => s.status === 'skipped').length;
    const failedCount = result.steps.filter(s => s.status === 'failed').length;

    this.stream.markdown(`**Steps:** ${successCount} succeeded`);
    if (skippedCount > 0) this.stream.markdown(`, ${skippedCount} skipped`);
    if (failedCount > 0) this.stream.markdown(`, ${failedCount} failed`);
    this.stream.markdown(`\n\n`);

    // List created files
    if (result.createdFiles.length > 0) {
      this.stream.markdown(`**Created Files:**\n`);
      for (const file of result.createdFiles) {
        this.stream.markdown(`- \`${file}\`\n`);
      }
      this.stream.markdown(`\n`);
    }

    // Duration
    const durationSec = (result.duration / 1000).toFixed(1);
    this.stream.markdown(`**Duration:** ${durationSec}s\n`);
  }

  /**
   * Called when workflow fails
   */
  async onWorkflowError(
    error: Error,
    context: WorkflowContext
  ): Promise<void> {
    // Update execution state
    if (this.executionId) {
      updateExecutionStatus(this.executionId, 'failed', {
        error: error.message,
      });
    }

    // Stream error message
    this.stream.markdown(`\n---\n\n`);
    this.stream.markdown(`## ❌ Workflow Failed\n\n`);
    this.stream.markdown(`**Error:** ${error.message}\n\n`);

    if (this.executionId) {
      this.stream.markdown(`You can resume this workflow with:\n`);
      this.stream.markdown(`\`/resume ${this.executionId}\`\n`);
    }
  }

  /**
   * Collect additional inputs for step PRD refinement
   */
  async collectStepInputs(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<Record<string, unknown>> {
    const inputs: Record<string, unknown> = {};

    if (!step.prdQuestions || step.prdQuestions.length === 0) {
      return inputs;
    }

    this.stream.markdown(`\n### 📋 Additional Information Needed for: ${step.name}\n\n`);

    for (const question of step.prdQuestions) {
      const interpolatedPrompt = interpolate(question.prompt, context);

      if (question.type === 'confirm') {
        // Use QuickPick for yes/no
        const result = await vscode.window.showQuickPick(['Yes', 'No'], {
          placeHolder: interpolatedPrompt,
          title: step.name,
        });
        inputs[question.id] = result === 'Yes';
        this.stream.markdown(`- **${interpolatedPrompt}** ${result}\n`);
      } else if (question.type === 'select' || question.type === 'multiselect') {
        // Get options
        let options: string[] = [];
        if (typeof question.options === 'string') {
          // Interpolate and parse options
          const interpolated = interpolate(question.options, context);
          try {
            options = JSON.parse(interpolated);
          } catch {
            options = interpolated.split(',').map(s => s.trim());
          }
        } else if (Array.isArray(question.options)) {
          options = question.options;
        }

        const result = await vscode.window.showQuickPick(options, {
          placeHolder: interpolatedPrompt,
          title: step.name,
          canPickMany: question.type === 'multiselect',
        });

        inputs[question.id] = result;
        this.stream.markdown(`- **${interpolatedPrompt}** ${Array.isArray(result) ? result.join(', ') : result}\n`);
      } else {
        // Text input
        const result = await vscode.window.showInputBox({
          prompt: interpolatedPrompt,
          title: step.name,
          value: question.default as string | undefined,
        });
        inputs[question.id] = result || question.default;
        this.stream.markdown(`- **${interpolatedPrompt}** ${result}\n`);
      }
    }

    this.stream.markdown(`\n`);
    return inputs;
  }
}
