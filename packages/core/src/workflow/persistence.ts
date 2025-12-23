/**
 * Workflow execution state persistence
 * Stores and retrieves workflow execution state for resume capability
 */

import fs from 'fs';
import path from 'path';
import { getBasePath } from '../config';
import { ExecutionState, WorkflowContext } from './types';

/**
 * Get the executions directory path
 */
function getExecutionsDir(): string {
  return path.join(getBasePath(), '.agentx', 'executions');
}

/**
 * Ensure executions directory exists
 */
function ensureExecutionsDir(): string {
  const dir = getExecutionsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Save execution state to disk
 */
export function saveExecutionState(state: ExecutionState): string {
  const dir = ensureExecutionsDir();
  const filePath = path.join(dir, `${state.id}.json`);

  const content = JSON.stringify(state, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

/**
 * Load execution state by ID
 */
export function loadExecutionState(executionId: string): ExecutionState | null {
  const filePath = path.join(getExecutionsDir(), `${executionId}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as ExecutionState;
  } catch {
    return null;
  }
}

/**
 * List all execution states
 */
export function listExecutionStates(
  filter?: {
    status?: ExecutionState['status'];
    workflowId?: string;
    limit?: number;
  }
): ExecutionState[] {
  const dir = getExecutionsDir();

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const states: ExecutionState[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const state = JSON.parse(content) as ExecutionState;

      // Apply filters
      if (filter?.status && state.status !== filter.status) {
        continue;
      }
      if (filter?.workflowId && state.workflowId !== filter.workflowId) {
        continue;
      }

      states.push(state);
    } catch {
      continue;
    }
  }

  // Sort by updatedAt descending
  states.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Apply limit
  if (filter?.limit) {
    return states.slice(0, filter.limit);
  }

  return states;
}

/**
 * Delete an execution state
 */
export function deleteExecutionState(executionId: string): boolean {
  const filePath = path.join(getExecutionsDir(), `${executionId}.json`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}

/**
 * Clean up old execution states
 */
export function cleanupExecutionStates(
  options: {
    maxAge?: number; // Max age in days
    keepCount?: number; // Min number to keep
    deleteCompleted?: boolean; // Delete completed executions
  } = {}
): number {
  const {
    maxAge = 7,
    keepCount = 10,
    deleteCompleted = true,
  } = options;

  const states = listExecutionStates();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);

  let deleted = 0;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];

    // Always keep the most recent ones
    if (i < keepCount) {
      continue;
    }

    const updatedAt = new Date(state.updatedAt);

    // Delete if too old
    if (updatedAt < cutoffDate) {
      if (deleteCompleted || state.status !== 'completed') {
        if (deleteExecutionState(state.id)) {
          deleted++;
        }
      }
    }
  }

  return deleted;
}

/**
 * Create a new execution state
 */
export function createExecutionState(
  executionId: string,
  workflowId: string,
  context: WorkflowContext,
  intentionId?: string
): ExecutionState {
  const now = new Date().toISOString();

  return {
    id: executionId,
    workflowId,
    intentionId,
    status: 'pending',
    currentStepIndex: 0,
    context,
    startedAt: now,
    updatedAt: now,
  };
}

/**
 * Update execution state status
 */
export function updateExecutionStatus(
  executionId: string,
  status: ExecutionState['status'],
  updates?: Partial<ExecutionState>
): ExecutionState | null {
  const state = loadExecutionState(executionId);

  if (!state) {
    return null;
  }

  const updated: ExecutionState = {
    ...state,
    ...updates,
    status,
    updatedAt: new Date().toISOString(),
  };

  saveExecutionState(updated);
  return updated;
}
