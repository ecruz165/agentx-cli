/**
 * Workflow type definitions for AgentX
 * Based on the Workflow Support for Complex Intentions PRD
 */

/**
 * Input definition for workflow or step
 */
export interface WorkflowInput {
  name: string;
  type: 'string' | 'array' | 'object' | 'boolean' | 'number';
  required?: boolean;
  default?: unknown;
  description?: string;
}

/**
 * Output definition for workflow or step
 */
export interface WorkflowOutput {
  name: string;
  type: 'string' | 'array' | 'object' | 'boolean';
  extract?: string; // JSONPath or regex to extract from result
  description?: string;
}

/**
 * Question for PRD refinement within a step
 */
export interface StepQuestion {
  id: string;
  prompt: string;
  type: 'text' | 'confirm' | 'select' | 'multiselect';
  options?: string | string[]; // Can be template string like "{{fields}}"
  default?: unknown;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;

  // Execution
  skills: string[];
  prompt: string; // Template with {{variable}} interpolation

  // Data flow
  inputs: string[]; // Variables this step needs
  outputs: WorkflowOutput[]; // Variables this step produces

  // PRD refinement
  refinePrd?: boolean; // Generate step-level PRD before execution
  prdTemplate?: string; // Custom template path (default: templates/step-prd.md)
  prdQuestions?: StepQuestion[]; // Additional questions for step refinement

  // Control flow
  condition?: string; // Expression to evaluate (skip if false)
  continueOnError?: boolean;
  retryCount?: number;

  // Hooks
  beforeStep?: string; // Skill to run before
  afterStep?: string; // Skill to run after
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;

  // Data flow
  inputs: WorkflowInput[];
  outputs: string[]; // Names of outputs to return

  // Execution
  steps: WorkflowStep[];

  // Optional metadata
  version?: string;
  author?: string;
  tags?: string[];
}

/**
 * Workflow override in intention
 */
export interface WorkflowOverrides {
  skipSteps?: string[];
  additionalContext?: Record<string, unknown>;
  stepOverrides?: Record<string, Partial<WorkflowStep>>;
}

/**
 * Extended intention definition with workflow support
 */
export interface IntentionWithWorkflow {
  id: string;
  name: string;
  goal?: string;
  description?: string;

  // Questions mapped to workflow inputs
  questions?: IntentionQuestion[];

  // Workflow reference
  workflow?: string; // Workflow ID
  workflowOverrides?: WorkflowOverrides;

  // Legacy support - direct prompt template
  promptTemplatePath?: string;
  requirements?: unknown[];
}

/**
 * Intention question that maps to workflow input
 */
export interface IntentionQuestion {
  id: string;
  prompt: string;
  type?: 'text' | 'confirm' | 'select' | 'multiselect';
  options?: string[];
  default?: unknown;
  mapTo: string; // Workflow input name
  transform?: string; // Transform function name (e.g., 'parseFieldList')
}

/**
 * Result from a single step execution
 */
export interface StepResult {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  outputs: Record<string, unknown>;
  duration: number;
  error?: string;
  createdFiles?: string[];
  modifiedFiles?: string[];
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  // Original inputs from intention questions
  inputs: Record<string, unknown>;

  // Accumulated step outputs
  steps: Record<string, StepResult>;

  // Current execution state
  currentStep: string | null;
  completedSteps: string[];
  skippedSteps: string[];

  // Metadata
  workflowId: string;
  intentionId?: string;
  startedAt: string;
  updatedAt: string;
}

/**
 * Workflow execution state (persisted)
 */
export interface ExecutionState {
  id: string;
  workflowId: string;
  intentionId?: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepIndex: number;
  context: WorkflowContext;
  startedAt: string;
  updatedAt: string;
  error?: string;
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  executionId: string;
  outputs: Record<string, unknown>;
  steps: StepResult[];
  createdFiles: string[];
  modifiedFiles: string[];
  duration: number;
  error?: string;
}
