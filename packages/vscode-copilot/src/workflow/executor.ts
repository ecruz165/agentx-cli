/**
 * VS Code Workflow Step Executor
 * Implements the StepExecutor interface for VS Code Copilot Chat
 * Supports both skill-based and LLM prompt-based steps
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
import { SkillExecutor, SkillResult } from '../skills';

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
  private skillExecutor: SkillExecutor;

  constructor(options: VSCodeExecutorOptions) {
    this.stream = options.stream;
    this.token = options.token;
    this.request = options.request;

    // Initialize skill executor with workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const workspaceRoot = workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    this.skillExecutor = new SkillExecutor(workspaceRoot);
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
   * Supports both skill-based and LLM prompt-based steps
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
      // Check if step has skills defined
      if (step.skills && step.skills.length > 0) {
        return await this.executeSkillStep(step, context, startTime);
      }

      // Fall back to LLM prompt-based execution
      return await this.executeLlmStep(step, context, startTime);
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
   * Execute a skill-based step
   */
  private async executeSkillStep(
    step: WorkflowStep,
    context: WorkflowContext,
    startTime: number
  ): Promise<StepResult> {
    const outputs: Record<string, unknown> = {};
    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];

    this.stream.markdown(`\n🔧 **Step ${this.stepIndex}**: ${step.name} (skills: ${step.skills.join(', ')})\n\n`);

    // Build skill inputs from step's skillInputs with interpolation
    const skillInputs: Record<string, unknown> = {};
    const stepWithInputs = step as WorkflowStep & { skillInputs?: Record<string, string> };
    if (stepWithInputs.skillInputs) {
      for (const [key, value] of Object.entries(stepWithInputs.skillInputs)) {
        if (typeof value === 'string') {
          skillInputs[key] = interpolate(value, context);
        } else {
          skillInputs[key] = value;
        }
      }
    }

    // Also include workflow inputs
    Object.assign(skillInputs, context.inputs);

    // Execute each skill in sequence
    for (const skillId of step.skills) {
      this.stream.markdown(`  ⚙️ Running skill: \`${skillId}\`\n`);

      const skillResult = await this.skillExecutor.execute(skillId, skillInputs);

      if (!skillResult.success) {
        const errorMsg = skillResult.error?.message || 'Skill execution failed';
        this.stream.markdown(`  ❌ Skill failed: ${errorMsg}\n`);

        return {
          stepId: step.id,
          status: 'failed',
          outputs,
          duration: Date.now() - startTime,
          error: `Skill ${skillId} failed: ${errorMsg}`,
        };
      }

      // Merge skill outputs
      Object.assign(outputs, skillResult.outputs);

      // Track files
      if (skillResult.outputs.createdFiles) {
        const files = Array.isArray(skillResult.outputs.createdFiles)
          ? skillResult.outputs.createdFiles as string[]
          : [skillResult.outputs.createdFiles as string];
        createdFiles.push(...files);
      }
      if (skillResult.outputs.modifiedFiles) {
        const files = Array.isArray(skillResult.outputs.modifiedFiles)
          ? skillResult.outputs.modifiedFiles as string[]
          : [skillResult.outputs.modifiedFiles as string];
        modifiedFiles.push(...files);
      }

      this.stream.markdown(`  ✅ Skill completed\n`);
    }

    // Map skill outputs to step outputs based on 'from' mapping
    for (const outputDef of step.outputs) {
      const outputDefWithFrom = outputDef as typeof outputDef & { from?: string };
      if (outputDefWithFrom.from) {
        // Handle 'skill.outputName' format
        const fromPath = outputDefWithFrom.from.replace(/^skill\./, '');
        if (outputs[fromPath] !== undefined) {
          outputs[outputDef.name] = outputs[fromPath];
        }
      }
    }

    this.stream.markdown(`\n✅ **Step ${this.stepIndex}**: ${step.name} - Complete\n\n`);

    // Add created/modified files as references for context in follow-up questions
    this.streamFileReferences(createdFiles, modifiedFiles);

    return {
      stepId: step.id,
      status: 'success',
      outputs,
      duration: Date.now() - startTime,
      createdFiles: createdFiles.length > 0 ? createdFiles : undefined,
      modifiedFiles: modifiedFiles.length > 0 ? modifiedFiles : undefined,
    };
  }

  /**
   * Stream file references to add them to chat context
   * This allows users to reference these files with #file in follow-up questions
   */
  private streamFileReferences(createdFiles: string[], modifiedFiles: string[]): void {
    const allFiles = [...createdFiles, ...modifiedFiles];
    if (allFiles.length === 0) return;

    this.stream.markdown(`📎 **Files available for reference:**\n`);
    for (const file of allFiles) {
      try {
        const uri = vscode.Uri.file(file);
        // Use stream.reference to add file to chat context
        this.stream.reference(uri);
        this.stream.markdown(` \`${file}\`\n`);
      } catch {
        // Fall back to just showing the path
        this.stream.markdown(` \`${file}\`\n`);
      }
    }
    this.stream.markdown(`\n`);
  }

  /**
   * Execute an LLM prompt-based step
   */
  private async executeLlmStep(
    step: WorkflowStep,
    context: WorkflowContext,
    startTime: number
  ): Promise<StepResult> {
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
