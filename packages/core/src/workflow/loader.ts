/**
 * Workflow loader for AgentX
 * Loads workflow definitions from YAML files in <knowledgeBase>/.context/workflows/
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { loadConfig, resolveKnowledgeBasePath } from '../config';
import {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInput,
  WorkflowOutput,
} from './types';

/**
 * Get the workflows directory path
 * Workflows are stored in <knowledgeBase>/.context/workflows/
 */
function getWorkflowsDir(): string {
  const config = loadConfig();
  const kbPath = resolveKnowledgeBasePath(config.knowledgeBase);
  return path.join(kbPath, '.context', 'workflows');
}

/**
 * Check if workflows directory exists
 */
export function workflowsDirectoryExists(): boolean {
  return fs.existsSync(getWorkflowsDir());
}

/**
 * Get workflows directory path (public)
 */
export function getWorkflowsDirectoryPath(): string {
  return getWorkflowsDir();
}

/**
 * Load all workflow definitions from the workflows directory
 */
export async function loadWorkflows(): Promise<WorkflowDefinition[]> {
  const workflowsDir = getWorkflowsDir();

  if (!fs.existsSync(workflowsDir)) {
    return [];
  }

  const files = fs.readdirSync(workflowsDir).filter(
    (f) => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json')
  );

  const workflows: WorkflowDefinition[] = [];

  for (const file of files) {
    try {
      const workflow = await loadWorkflowFile(path.join(workflowsDir, file));
      if (workflow) {
        workflows.push(workflow);
      }
    } catch (error) {
      console.warn(`Failed to load workflow ${file}:`, error);
      continue;
    }
  }

  return workflows;
}

/**
 * Load a single workflow file
 */
export async function loadWorkflowFile(
  filePath: string
): Promise<WorkflowDefinition | null> {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let parsed: unknown;

  if (filePath.endsWith('.json')) {
    parsed = JSON.parse(content);
  } else {
    parsed = yaml.load(content);
  }

  return validateWorkflow(parsed);
}

/**
 * Load a workflow by ID
 */
export async function getWorkflow(id: string): Promise<WorkflowDefinition | null> {
  const workflowsDir = getWorkflowsDir();

  if (!fs.existsSync(workflowsDir)) {
    return null;
  }

  // Try different file extensions
  const extensions = ['.yaml', '.yml', '.json'];

  for (const ext of extensions) {
    const filePath = path.join(workflowsDir, `${id}${ext}`);
    if (fs.existsSync(filePath)) {
      return loadWorkflowFile(filePath);
    }
  }

  // If not found by exact name, search all workflows
  const workflows = await loadWorkflows();
  return workflows.find((w) => w.id === id) || null;
}

/**
 * Validate and normalize a workflow definition
 */
function validateWorkflow(data: unknown): WorkflowDefinition | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const workflow = data as Record<string, unknown>;

  // Required fields
  if (!workflow.id || typeof workflow.id !== 'string') {
    throw new Error('Workflow must have an id');
  }

  if (!workflow.name || typeof workflow.name !== 'string') {
    throw new Error('Workflow must have a name');
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    throw new Error('Workflow must have at least one step');
  }

  // Normalize inputs
  const inputs: WorkflowInput[] = [];
  if (Array.isArray(workflow.inputs)) {
    for (const input of workflow.inputs) {
      inputs.push(normalizeInput(input));
    }
  }

  // Normalize steps
  const steps: WorkflowStep[] = [];
  for (const step of workflow.steps) {
    steps.push(normalizeStep(step));
  }

  // Normalize outputs
  const outputs: string[] = [];
  if (Array.isArray(workflow.outputs)) {
    for (const output of workflow.outputs) {
      if (typeof output === 'string') {
        outputs.push(output);
      } else if (typeof output === 'object' && output !== null) {
        outputs.push((output as { name: string }).name);
      }
    }
  }

  return {
    id: workflow.id,
    name: workflow.name,
    description: (workflow.description as string) || '',
    inputs,
    outputs,
    steps,
    version: workflow.version as string | undefined,
    author: workflow.author as string | undefined,
    tags: workflow.tags as string[] | undefined,
  };
}

/**
 * Normalize a workflow input
 */
function normalizeInput(input: unknown): WorkflowInput {
  if (typeof input === 'string') {
    return {
      name: input,
      type: 'string',
      required: true,
    };
  }

  const inputObj = input as Record<string, unknown>;

  return {
    name: inputObj.name as string,
    type: (inputObj.type as WorkflowInput['type']) || 'string',
    required: inputObj.required !== false,
    default: inputObj.default,
    description: inputObj.description as string | undefined,
  };
}

/**
 * Normalize a workflow step
 */
function normalizeStep(step: unknown): WorkflowStep {
  const stepObj = step as Record<string, unknown>;

  if (!stepObj.id || typeof stepObj.id !== 'string') {
    throw new Error('Step must have an id');
  }

  if (!stepObj.name || typeof stepObj.name !== 'string') {
    throw new Error('Step must have a name');
  }

  // Normalize outputs
  const outputs: WorkflowOutput[] = [];
  if (Array.isArray(stepObj.outputs)) {
    for (const output of stepObj.outputs) {
      if (typeof output === 'string') {
        outputs.push({ name: output, type: 'string' });
      } else if (typeof output === 'object' && output !== null) {
        const outputObj = output as Record<string, unknown>;
        outputs.push({
          name: outputObj.name as string,
          type: (outputObj.type as WorkflowOutput['type']) || 'string',
          extract: outputObj.extract as string | undefined,
          description: outputObj.description as string | undefined,
        });
      }
    }
  }

  // Normalize skills
  let skills: string[] = [];
  if (Array.isArray(stepObj.skills)) {
    skills = stepObj.skills.filter((s): s is string => typeof s === 'string');
  } else if (typeof stepObj.skills === 'string') {
    skills = [stepObj.skills];
  }

  // Normalize inputs
  let inputs: string[] = [];
  if (Array.isArray(stepObj.inputs)) {
    inputs = stepObj.inputs.filter((i): i is string => typeof i === 'string');
  }

  return {
    id: stepObj.id,
    name: stepObj.name,
    description: stepObj.description as string | undefined,
    skills,
    prompt: (stepObj.prompt as string) || '',
    inputs,
    outputs,
    refinePrd: stepObj.refinePrd === true,
    prdTemplate: stepObj.prdTemplate as string | undefined,
    prdQuestions: stepObj.prdQuestions as WorkflowStep['prdQuestions'],
    condition: stepObj.condition as string | undefined,
    continueOnError: stepObj.continueOnError === true,
    retryCount: stepObj.retryCount as number | undefined,
    beforeStep: stepObj.beforeStep as string | undefined,
    afterStep: stepObj.afterStep as string | undefined,
  };
}

/**
 * Create a new workflow file
 */
export async function saveWorkflow(
  workflow: WorkflowDefinition,
  format: 'yaml' | 'json' = 'yaml'
): Promise<string> {
  const workflowsDir = getWorkflowsDir();

  // Ensure directory exists
  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  const ext = format === 'yaml' ? '.yaml' : '.json';
  const filePath = path.join(workflowsDir, `${workflow.id}${ext}`);

  let content: string;
  if (format === 'yaml') {
    content = yaml.dump(workflow, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
  } else {
    content = JSON.stringify(workflow, null, 2);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}
