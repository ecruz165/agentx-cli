/**
 * Workflow Chat Handler
 * Manages workflow execution through VS Code Copilot Chat
 */

import * as vscode from 'vscode';
import {
  WorkflowEngine,
  WorkflowDefinition,
  WorkflowContext,
  WorkflowResult,
  getWorkflow,
  loadWorkflows,
  loadExecutionState,
  listExecutionStates,
  getIntention,
  interpolate,
} from '@agentx/core';
import { VSCodeWorkflowExecutor } from './executor';

/**
 * Input collection state for multi-turn conversations
 */
interface InputCollectionState {
  workflowId: string;
  intentionId?: string;
  inputs: Record<string, unknown>;
  pendingInputs: string[];
  currentInputIndex: number;
}

// Store for active input collection sessions
const inputCollectionSessions = new Map<string, InputCollectionState>();

/**
 * Handle workflow-related chat commands
 */
export async function handleWorkflowCommand(
  command: string,
  args: string,
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  switch (command) {
    case 'workflow':
    case 'run-workflow':
      return handleRunWorkflow(args, request, stream, token);

    case 'list-workflows':
      return handleListWorkflows(stream);

    case 'resume':
      return handleResumeWorkflow(args, request, stream, token);

    case 'status':
      return handleWorkflowStatus(stream);

    default:
      // Check if command is a workflow ID
      const workflow = await getWorkflow(command);
      if (workflow) {
        return handleRunWorkflow(command + ' ' + args, request, stream, token);
      }

      stream.markdown(`Unknown workflow command: ${command}\n`);
      return { metadata: { command: 'workflow-error' } };
  }
}

/**
 * Handle running a workflow
 */
async function handleRunWorkflow(
  args: string,
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  // Parse workflow ID and inline inputs
  const parts = args.trim().split(/\s+/);
  const workflowId = parts[0];

  if (!workflowId) {
    stream.markdown(`Please specify a workflow ID.\n\n`);
    stream.markdown(`Available workflows:\n`);
    const workflows = await loadWorkflows();
    for (const w of workflows) {
      stream.markdown(`- \`${w.id}\`: ${w.description}\n`);
    }
    return { metadata: { command: 'workflow-help' } };
  }

  // Load the workflow
  const workflow = await getWorkflow(workflowId);
  if (!workflow) {
    stream.markdown(`Workflow not found: \`${workflowId}\`\n`);
    return { metadata: { command: 'workflow-not-found' } };
  }

  // Parse inline inputs (format: key:value key2:value2)
  const inputs: Record<string, unknown> = {};
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const colonIndex = part.indexOf(':');
    if (colonIndex > 0) {
      const key = part.substring(0, colonIndex);
      const value = part.substring(colonIndex + 1);
      inputs[key] = value;
    }
  }

  // Check which required inputs are missing
  const missingInputs = workflow.inputs
    .filter(input => input.required && inputs[input.name] === undefined)
    .map(input => input.name);

  if (missingInputs.length > 0) {
    // Start input collection session
    return startInputCollection(workflow, inputs, missingInputs, stream);
  }

  // All inputs available - execute workflow
  return executeWorkflow(workflow, inputs, request, stream, token);
}

/**
 * Start collecting missing inputs through conversation
 */
function startInputCollection(
  workflow: WorkflowDefinition,
  inputs: Record<string, unknown>,
  missingInputs: string[],
  stream: vscode.ChatResponseStream
): vscode.ChatResult {
  const sessionId = `wf-${workflow.id}-${Date.now()}`;

  // Store session state
  inputCollectionSessions.set(sessionId, {
    workflowId: workflow.id,
    inputs,
    pendingInputs: missingInputs,
    currentInputIndex: 0,
  });

  // Ask for first missing input
  const firstInput = workflow.inputs.find(i => i.name === missingInputs[0]);
  stream.markdown(`## 📋 ${workflow.name}\n\n`);
  stream.markdown(`${workflow.description}\n\n`);
  stream.markdown(`I need some information to proceed:\n\n`);

  if (firstInput) {
    stream.markdown(`**${firstInput.name}**`);
    if (firstInput.description) {
      stream.markdown(`: ${firstInput.description}`);
    }
    stream.markdown(`\n`);

    if (firstInput.default !== undefined) {
      stream.markdown(`_(Default: ${firstInput.default})_\n`);
    }
  }

  return {
    metadata: {
      command: 'workflow-input-collection',
      sessionId,
    },
  };
}

/**
 * Continue input collection from previous turn
 */
export async function continueInputCollection(
  sessionId: string,
  userInput: string,
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult | null> {
  const session = inputCollectionSessions.get(sessionId);
  if (!session) {
    return null;
  }

  const workflow = await getWorkflow(session.workflowId);
  if (!workflow) {
    inputCollectionSessions.delete(sessionId);
    return null;
  }

  // Store the current input
  const currentInputName = session.pendingInputs[session.currentInputIndex];
  const inputDef = workflow.inputs.find(i => i.name === currentInputName);

  // Parse the input value based on type
  let value: unknown = userInput.trim();
  if (inputDef) {
    if (inputDef.type === 'boolean') {
      value = ['true', 'yes', 'y', '1'].includes(userInput.toLowerCase());
    } else if (inputDef.type === 'number') {
      value = Number(userInput);
    } else if (inputDef.type === 'array') {
      value = userInput.split(',').map(s => s.trim());
    }
  }

  session.inputs[currentInputName] = value;
  session.currentInputIndex++;

  // Check if more inputs needed
  if (session.currentInputIndex < session.pendingInputs.length) {
    const nextInputName = session.pendingInputs[session.currentInputIndex];
    const nextInput = workflow.inputs.find(i => i.name === nextInputName);

    stream.markdown(`Got it! **${currentInputName}** = \`${value}\`\n\n`);
    stream.markdown(`Next:\n\n`);

    if (nextInput) {
      stream.markdown(`**${nextInput.name}**`);
      if (nextInput.description) {
        stream.markdown(`: ${nextInput.description}`);
      }
      stream.markdown(`\n`);

      if (nextInput.default !== undefined) {
        stream.markdown(`_(Default: ${nextInput.default})_\n`);
      }
    }

    return {
      metadata: {
        command: 'workflow-input-collection',
        sessionId,
      },
    };
  }

  // All inputs collected - execute workflow
  inputCollectionSessions.delete(sessionId);
  stream.markdown(`Got it! **${currentInputName}** = \`${value}\`\n\n`);
  stream.markdown(`All inputs collected. Starting workflow...\n\n`);

  return executeWorkflow(workflow, session.inputs, request, stream, token);
}

/**
 * Execute a workflow with all inputs
 */
async function executeWorkflow(
  workflow: WorkflowDefinition,
  inputs: Record<string, unknown>,
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  // Apply defaults for missing optional inputs
  for (const input of workflow.inputs) {
    if (inputs[input.name] === undefined && input.default !== undefined) {
      inputs[input.name] = input.default;
    }
  }

  // Create executor
  const executor = new VSCodeWorkflowExecutor({
    stream,
    token,
    request,
  });

  // Create and run engine
  const engine = new WorkflowEngine(executor);

  try {
    const result = await engine.executeWorkflow(workflow, inputs);

    return {
      metadata: {
        command: 'workflow-complete',
        workflowId: workflow.id,
        success: result.success,
        executionId: result.executionId,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stream.markdown(`\n**Error:** ${errorMessage}\n`);

    return {
      metadata: {
        command: 'workflow-error',
        workflowId: workflow.id,
        error: errorMessage,
      },
    };
  }
}

/**
 * List available workflows
 */
async function handleListWorkflows(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const workflows = await loadWorkflows();

  if (workflows.length === 0) {
    stream.markdown(`No workflows found.\n\n`);
    stream.markdown(`Create workflows in \`<knowledgeBase>/.context/workflows/\` as YAML files.\n`);
    return { metadata: { command: 'list-workflows' } };
  }

  stream.markdown(`## 📚 Available Workflows\n\n`);

  for (const workflow of workflows) {
    stream.markdown(`### ${workflow.name}\n`);
    stream.markdown(`**ID:** \`${workflow.id}\`\n\n`);
    stream.markdown(`${workflow.description}\n\n`);

    if (workflow.inputs.length > 0) {
      stream.markdown(`**Inputs:**\n`);
      for (const input of workflow.inputs) {
        const required = input.required ? '(required)' : '(optional)';
        stream.markdown(`- \`${input.name}\` ${required}`);
        if (input.description) {
          stream.markdown(`: ${input.description}`);
        }
        stream.markdown(`\n`);
      }
      stream.markdown(`\n`);
    }

    stream.markdown(`**Steps:** ${workflow.steps.length}\n\n`);
    stream.markdown(`---\n\n`);
  }

  return { metadata: { command: 'list-workflows' } };
}

/**
 * Resume a paused or failed workflow
 */
async function handleResumeWorkflow(
  executionId: string,
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  if (!executionId) {
    // List resumable executions
    const states = listExecutionStates({
      status: 'failed',
      limit: 5,
    });

    if (states.length === 0) {
      stream.markdown(`No failed workflows to resume.\n`);
      return { metadata: { command: 'resume-none' } };
    }

    stream.markdown(`## Resumable Workflows\n\n`);
    for (const state of states) {
      stream.markdown(`- \`${state.id}\`: ${state.workflowId} (${state.status})\n`);
    }
    stream.markdown(`\nUse \`/resume <execution-id>\` to resume.\n`);

    return { metadata: { command: 'resume-list' } };
  }

  // Load execution state
  const state = loadExecutionState(executionId.trim());
  if (!state) {
    stream.markdown(`Execution not found: \`${executionId}\`\n`);
    return { metadata: { command: 'resume-not-found' } };
  }

  // Load workflow
  const workflow = await getWorkflow(state.workflowId);
  if (!workflow) {
    stream.markdown(`Workflow not found: \`${state.workflowId}\`\n`);
    return { metadata: { command: 'resume-workflow-not-found' } };
  }

  stream.markdown(`## Resuming Workflow: ${workflow.name}\n\n`);
  stream.markdown(`Continuing from step ${state.currentStepIndex + 1}...\n\n`);

  // Create executor and engine
  const executor = new VSCodeWorkflowExecutor({
    stream,
    token,
    request,
  });

  const engine = new WorkflowEngine(executor);

  try {
    const result = await engine.resumeWorkflow(state);

    return {
      metadata: {
        command: 'workflow-resumed',
        workflowId: workflow.id,
        success: result.success,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    stream.markdown(`\n**Error:** ${errorMessage}\n`);

    return {
      metadata: {
        command: 'resume-error',
        error: errorMessage,
      },
    };
  }
}

/**
 * Show current workflow status
 */
async function handleWorkflowStatus(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  const states = listExecutionStates({ limit: 10 });

  if (states.length === 0) {
    stream.markdown(`No workflow executions found.\n`);
    return { metadata: { command: 'status-empty' } };
  }

  stream.markdown(`## 📊 Recent Workflow Executions\n\n`);

  for (const state of states) {
    const statusEmoji =
      state.status === 'completed' ? '✅' :
      state.status === 'failed' ? '❌' :
      state.status === 'running' ? '🔄' :
      state.status === 'paused' ? '⏸️' : '⏳';

    stream.markdown(`${statusEmoji} **${state.workflowId}**\n`);
    stream.markdown(`   ID: \`${state.id}\`\n`);
    stream.markdown(`   Status: ${state.status}\n`);
    stream.markdown(`   Started: ${new Date(state.startedAt).toLocaleString()}\n`);

    if (state.error) {
      stream.markdown(`   Error: ${state.error}\n`);
    }

    stream.markdown(`\n`);
  }

  return { metadata: { command: 'status' } };
}

/**
 * Check if there's an active input collection session
 */
export function getActiveInputSession(
  previousResult?: vscode.ChatResult
): string | null {
  if (previousResult?.metadata?.command === 'workflow-input-collection') {
    return previousResult.metadata.sessionId as string;
  }
  return null;
}
