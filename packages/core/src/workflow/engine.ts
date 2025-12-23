/**
 * Workflow Execution Engine for AgentX
 * Handles sequential step execution with context management
 */

import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowContext,
  WorkflowResult,
  StepResult,
  ExecutionState,
  WorkflowOverrides,
} from './types';
import { getWorkflow } from './loader';

/**
 * Interpolate template variables in a string
 * Supports {{variable}} and {{steps.stepId.outputName}} syntax
 */
export function interpolate(
  template: string,
  context: WorkflowContext
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getValueByPath(context, path.trim());
    if (value === undefined) {
      return match; // Keep original if not found
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
}

/**
 * Get a value from context by dot-notation path
 */
function getValueByPath(context: WorkflowContext, path: string): unknown {
  // Handle steps.stepId.outputName
  if (path.startsWith('steps.')) {
    const parts = path.split('.');
    const stepId = parts[1];
    const outputName = parts.slice(2).join('.');
    const stepResult = context.steps[stepId];
    if (stepResult?.outputs) {
      return stepResult.outputs[outputName];
    }
    return undefined;
  }

  // Handle direct input reference
  if (context.inputs[path] !== undefined) {
    return context.inputs[path];
  }

  // Handle nested paths in inputs
  const parts = path.split('.');
  let current: unknown = context.inputs;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Evaluate a condition expression
 * Supports simple comparisons like "{{includeTests}} == true"
 */
export function evaluateCondition(
  condition: string,
  context: WorkflowContext
): boolean {
  // Interpolate variables first
  const interpolated = interpolate(condition, context);

  // Handle common comparison patterns
  const eqMatch = interpolated.match(/^(.+?)\s*==\s*(.+)$/);
  if (eqMatch) {
    const left = parseValue(eqMatch[1].trim());
    const right = parseValue(eqMatch[2].trim());
    return left === right;
  }

  const neqMatch = interpolated.match(/^(.+?)\s*!=\s*(.+)$/);
  if (neqMatch) {
    const left = parseValue(neqMatch[1].trim());
    const right = parseValue(neqMatch[2].trim());
    return left !== right;
  }

  // Truthy check
  const value = parseValue(interpolated.trim());
  return Boolean(value);
}

/**
 * Parse a value string to appropriate type
 */
function parseValue(str: string): unknown {
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null' || str === 'undefined') return null;
  if (/^-?\d+(\.\d+)?$/.test(str)) return Number(str);
  // Remove quotes if present
  if ((str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}

/**
 * Generate a unique execution ID
 */
export function generateExecutionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `exec-${timestamp}-${random}`;
}

/**
 * Create initial workflow context
 */
export function createWorkflowContext(
  workflowId: string,
  inputs: Record<string, unknown>,
  intentionId?: string
): WorkflowContext {
  return {
    inputs,
    steps: {},
    currentStep: null,
    completedSteps: [],
    skippedSteps: [],
    workflowId,
    intentionId,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Apply workflow overrides
 */
export function applyOverrides(
  workflow: WorkflowDefinition,
  overrides?: WorkflowOverrides
): WorkflowDefinition {
  if (!overrides) {
    return workflow;
  }

  let steps = [...workflow.steps];

  // Remove skipped steps
  if (overrides.skipSteps && overrides.skipSteps.length > 0) {
    steps = steps.filter((step) => !overrides.skipSteps!.includes(step.id));
  }

  // Apply step overrides
  if (overrides.stepOverrides) {
    steps = steps.map((step) => {
      const override = overrides.stepOverrides?.[step.id];
      if (override) {
        return { ...step, ...override };
      }
      return step;
    });
  }

  return {
    ...workflow,
    steps,
  };
}

/**
 * Step executor interface - implemented by VS Code extension
 */
export interface StepExecutor {
  /**
   * Execute a single step and return its result
   */
  executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
    workflow: WorkflowDefinition
  ): Promise<StepResult>;

  /**
   * Called before workflow starts
   */
  onWorkflowStart?(
    workflow: WorkflowDefinition,
    context: WorkflowContext
  ): Promise<void>;

  /**
   * Called after each step completes
   */
  onStepComplete?(
    step: WorkflowStep,
    result: StepResult,
    context: WorkflowContext
  ): Promise<void>;

  /**
   * Called when workflow completes
   */
  onWorkflowComplete?(
    result: WorkflowResult,
    context: WorkflowContext
  ): Promise<void>;

  /**
   * Called when workflow fails
   */
  onWorkflowError?(
    error: Error,
    context: WorkflowContext
  ): Promise<void>;

  /**
   * Collect additional inputs for step PRD refinement
   */
  collectStepInputs?(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<Record<string, unknown>>;
}

/**
 * Workflow Execution Engine
 */
export class WorkflowEngine {
  private executor: StepExecutor;

  constructor(executor: StepExecutor) {
    this.executor = executor;
  }

  /**
   * Execute a workflow by ID
   */
  async executeWorkflowById(
    workflowId: string,
    inputs: Record<string, unknown>,
    overrides?: WorkflowOverrides,
    intentionId?: string
  ): Promise<WorkflowResult> {
    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return this.executeWorkflow(workflow, inputs, overrides, intentionId);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    inputs: Record<string, unknown>,
    overrides?: WorkflowOverrides,
    intentionId?: string
  ): Promise<WorkflowResult> {
    const executionId = generateExecutionId();
    const startTime = Date.now();

    // Apply overrides
    const effectiveWorkflow = applyOverrides(workflow, overrides);

    // Add additional context from overrides
    const effectiveInputs = {
      ...inputs,
      ...(overrides?.additionalContext || {}),
    };

    // Create context
    const context = createWorkflowContext(
      workflow.id,
      effectiveInputs,
      intentionId
    );

    const stepResults: StepResult[] = [];
    const createdFiles: string[] = [];
    const modifiedFiles: string[] = [];

    try {
      // Notify start
      if (this.executor.onWorkflowStart) {
        await this.executor.onWorkflowStart(effectiveWorkflow, context);
      }

      // Execute steps sequentially
      for (const step of effectiveWorkflow.steps) {
        context.currentStep = step.id;
        context.updatedAt = new Date().toISOString();

        // Check condition
        if (step.condition) {
          const shouldExecute = evaluateCondition(step.condition, context);
          if (!shouldExecute) {
            const skipResult: StepResult = {
              stepId: step.id,
              status: 'skipped',
              outputs: {},
              duration: 0,
            };
            stepResults.push(skipResult);
            context.skippedSteps.push(step.id);
            context.steps[step.id] = skipResult;
            continue;
          }
        }

        // Collect step PRD inputs if needed
        if (step.refinePrd && step.prdQuestions && this.executor.collectStepInputs) {
          const stepInputs = await this.executor.collectStepInputs(step, context);
          Object.assign(context.inputs, stepInputs);
        }

        // Execute step with retry logic
        let result: StepResult | null = null;
        let lastError: Error | null = null;
        const maxRetries = step.retryCount || 0;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            result = await this.executor.executeStep(step, context, effectiveWorkflow);
            break;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) {
              break;
            }
          }
        }

        if (!result) {
          result = {
            stepId: step.id,
            status: 'failed',
            outputs: {},
            duration: 0,
            error: lastError?.message || 'Step execution failed',
          };
        }

        stepResults.push(result);
        context.steps[step.id] = result;

        // Collect created/modified files
        if (result.createdFiles) {
          createdFiles.push(...result.createdFiles);
        }
        if (result.modifiedFiles) {
          modifiedFiles.push(...result.modifiedFiles);
        }

        // Notify step complete
        if (this.executor.onStepComplete) {
          await this.executor.onStepComplete(step, result, context);
        }

        // Handle failure
        if (result.status === 'failed' && !step.continueOnError) {
          throw new Error(`Step ${step.id} failed: ${result.error}`);
        }

        context.completedSteps.push(step.id);
      }

      // Build final outputs
      const outputs: Record<string, unknown> = {};
      for (const outputName of effectiveWorkflow.outputs) {
        // Check step outputs
        for (const stepResult of stepResults) {
          if (stepResult.outputs[outputName] !== undefined) {
            outputs[outputName] = stepResult.outputs[outputName];
          }
        }
      }

      const result: WorkflowResult = {
        success: true,
        workflowId: workflow.id,
        executionId,
        outputs,
        steps: stepResults,
        createdFiles,
        modifiedFiles,
        duration: Date.now() - startTime,
      };

      // Notify complete
      if (this.executor.onWorkflowComplete) {
        await this.executor.onWorkflowComplete(result, context);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Notify error
      if (this.executor.onWorkflowError) {
        await this.executor.onWorkflowError(err, context);
      }

      return {
        success: false,
        workflowId: workflow.id,
        executionId,
        outputs: {},
        steps: stepResults,
        createdFiles,
        modifiedFiles,
        duration: Date.now() - startTime,
        error: err.message,
      };
    }
  }

  /**
   * Resume a paused or failed workflow from a saved state
   */
  async resumeWorkflow(
    state: ExecutionState,
    executor?: StepExecutor
  ): Promise<WorkflowResult> {
    const workflow = await getWorkflow(state.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${state.workflowId}`);
    }

    // Find remaining steps
    const remainingSteps = workflow.steps.slice(state.currentStepIndex);
    const partialWorkflow: WorkflowDefinition = {
      ...workflow,
      steps: remainingSteps,
    };

    // Use provided executor or existing one
    const effectiveExecutor = executor || this.executor;

    // Continue from saved context
    const engine = new WorkflowEngine(effectiveExecutor);
    return engine.executeWorkflow(
      partialWorkflow,
      state.context.inputs,
      undefined,
      state.intentionId
    );
  }
}
