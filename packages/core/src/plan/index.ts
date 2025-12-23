/**
 * Plan Document Management for AgentX
 *
 * Creates and manages plan documents when intentions are specified.
 * Supports incremental population of requirements across chat turns.
 * Generates final PRD when approved.
 */

import fs from 'fs';
import path from 'path';
import { getBasePath } from '../config';
import { IntentionDefinition, IntentionRequirement } from '../types';

/**
 * Status of a plan document
 */
export type PlanStatus = 'gathering' | 'ready' | 'approved' | 'rejected' | 'expired';

/**
 * Gathered requirement with value
 */
export interface GatheredRequirement {
  id: string;
  name: string;
  type: string;
  value: string;
  gatheredAt: string;
}

/**
 * Missing requirement that still needs to be gathered
 */
export interface MissingRequirement {
  id: string;
  name: string;
  type: string;
  question: string;
  required: boolean;
  options?: string[];
}

/**
 * Plan document structure
 */
export interface PlanDocument {
  /** Unique plan ID */
  id: string;
  /** Plan status */
  status: PlanStatus;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Expiration timestamp (30 minutes from creation) */
  expiresAt: string;
  /** Participant that created the plan */
  participant: string;
  /** Alias used */
  alias: string;
  /** Intention definition */
  intention: IntentionDefinition;
  /** Original user prompt */
  originalPrompt: string;
  /** Gathered requirements */
  gathered: GatheredRequirement[];
  /** Missing requirements */
  missing: MissingRequirement[];
  /** Generated implementation plan (once all requirements gathered) */
  implementationPlan?: string;
  /** Context content used for plan generation */
  contextContent?: string;
  /** Conversation history for this plan */
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

/**
 * Final PRD structure (generated on approval)
 */
export interface PrdDocument {
  /** Plan ID this PRD was generated from */
  planId: string;
  /** Timestamp of PRD generation */
  generatedAt: string;
  /** Participant */
  participant: string;
  /** Alias */
  alias: string;
  /** Intention */
  intention: {
    id: string;
    name: string;
    description: string;
  };
  /** Original prompt */
  originalPrompt: string;
  /** All gathered requirements */
  requirements: GatheredRequirement[];
  /** Implementation plan */
  implementationPlan: string;
  /** Summary of what will be built */
  summary: string;
  /** Files to be created/modified */
  affectedFiles: string[];
  /** Testing strategy */
  testingStrategy: string;
}

/**
 * Default plan expiration time (30 minutes)
 */
const PLAN_EXPIRATION_MS = 30 * 60 * 1000;

/**
 * Get the plans directory path (temporary storage for active plans)
 */
export function getPlansPath(): string {
  return path.join(getBasePath(), '.agentx', '.plans');
}

/**
 * Generate a unique plan ID
 */
export function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the path to a specific plan document
 */
export function getPlanPath(planId: string): string {
  return path.join(getPlansPath(), `${planId}.json`);
}

/**
 * Create a new plan document
 */
export function createPlanDocument(
  participant: string,
  alias: string,
  intention: IntentionDefinition,
  originalPrompt: string,
  gathered: GatheredRequirement[],
  missing: MissingRequirement[]
): PlanDocument {
  const now = new Date();
  const planId = generatePlanId();

  const plan: PlanDocument = {
    id: planId,
    status: missing.length > 0 ? 'gathering' : 'ready',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PLAN_EXPIRATION_MS).toISOString(),
    participant,
    alias,
    intention,
    originalPrompt,
    gathered,
    missing,
    conversationHistory: [],
  };

  return plan;
}

/**
 * Save a plan document to disk
 */
export function savePlanDocument(plan: PlanDocument): string {
  const plansPath = getPlansPath();

  // Create directory if it doesn't exist
  if (!fs.existsSync(plansPath)) {
    fs.mkdirSync(plansPath, { recursive: true });
  }

  const planPath = getPlanPath(plan.id);
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf-8');

  return planPath;
}

/**
 * Load a plan document from disk
 */
export function loadPlanDocument(planId: string): PlanDocument | null {
  const planPath = getPlanPath(planId);

  if (!fs.existsSync(planPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(planPath, 'utf-8');
    return JSON.parse(content) as PlanDocument;
  } catch {
    return null;
  }
}

/**
 * Check if a plan is expired
 */
export function isPlanExpired(plan: PlanDocument): boolean {
  return new Date(plan.expiresAt) < new Date();
}

/**
 * Update a plan with new gathered requirements
 */
export function updatePlanRequirements(
  plan: PlanDocument,
  newGathered: GatheredRequirement[]
): PlanDocument {
  const now = new Date().toISOString();

  // Add new gathered requirements
  const updatedGathered = [...plan.gathered];
  for (const req of newGathered) {
    const existingIndex = updatedGathered.findIndex(g => g.id === req.id);
    if (existingIndex >= 0) {
      updatedGathered[existingIndex] = req;
    } else {
      updatedGathered.push(req);
    }
  }

  // Remove from missing
  const gatheredIds = new Set(updatedGathered.map(g => g.id));
  const updatedMissing = plan.missing.filter(m => !gatheredIds.has(m.id));

  return {
    ...plan,
    gathered: updatedGathered,
    missing: updatedMissing,
    status: updatedMissing.filter(m => m.required).length === 0 ? 'ready' : 'gathering',
    updatedAt: now,
  };
}

/**
 * Add to conversation history
 */
export function addToConversationHistory(
  plan: PlanDocument,
  role: 'user' | 'assistant',
  content: string
): PlanDocument {
  return {
    ...plan,
    conversationHistory: [
      ...plan.conversationHistory,
      {
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Set the implementation plan
 */
export function setImplementationPlan(
  plan: PlanDocument,
  implementationPlan: string,
  contextContent?: string
): PlanDocument {
  return {
    ...plan,
    implementationPlan,
    contextContent,
    status: 'ready',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Approve a plan
 */
export function approvePlan(plan: PlanDocument): PlanDocument {
  return {
    ...plan,
    status: 'approved',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Reject a plan
 */
export function rejectPlan(plan: PlanDocument): PlanDocument {
  return {
    ...plan,
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a plan document from disk
 */
export function deletePlanDocument(planId: string): boolean {
  const planPath = getPlanPath(planId);

  if (fs.existsSync(planPath)) {
    try {
      fs.unlinkSync(planPath);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * List all active (non-expired) plans
 */
export function listActivePlans(): PlanDocument[] {
  const plansPath = getPlansPath();

  if (!fs.existsSync(plansPath)) {
    return [];
  }

  const files = fs.readdirSync(plansPath).filter(f => f.endsWith('.json'));
  const plans: PlanDocument[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(plansPath, file), 'utf-8');
      const plan = JSON.parse(content) as PlanDocument;
      if (!isPlanExpired(plan) && plan.status !== 'rejected') {
        plans.push(plan);
      }
    } catch {
      // Skip invalid files
    }
  }

  return plans.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Cleanup expired and rejected plans
 */
export function cleanupPlans(): number {
  const plansPath = getPlansPath();

  if (!fs.existsSync(plansPath)) {
    return 0;
  }

  const files = fs.readdirSync(plansPath).filter(f => f.endsWith('.json'));
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(plansPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const plan = JSON.parse(content) as PlanDocument;

      if (isPlanExpired(plan) || plan.status === 'rejected') {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    } catch {
      // Delete invalid files
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch {
        // Ignore
      }
    }
  }

  return deletedCount;
}

/**
 * Generate plan markdown for display
 */
export function generatePlanMarkdown(plan: PlanDocument): string {
  const parts: string[] = [];

  parts.push(`# Plan: ${plan.intention.name}\n`);
  parts.push(`**Status:** ${plan.status}`);
  parts.push(`**Created:** ${new Date(plan.createdAt).toLocaleString()}`);
  parts.push(`**Alias:** ${plan.alias}`);
  parts.push(`**Original Request:** ${plan.originalPrompt}\n`);

  if (plan.gathered.length > 0) {
    parts.push(`## Gathered Requirements\n`);
    for (const req of plan.gathered) {
      parts.push(`- **${req.name}:** ${req.value}`);
    }
    parts.push('');
  }

  if (plan.missing.length > 0) {
    parts.push(`## Missing Requirements\n`);
    for (const req of plan.missing) {
      const requiredLabel = req.required ? ' (required)' : ' (optional)';
      parts.push(`- **${req.name}**${requiredLabel}: ${req.question}`);
      if (req.options) {
        parts.push(`  - Options: ${req.options.join(', ')}`);
      }
    }
    parts.push('');
  }

  if (plan.implementationPlan) {
    parts.push(`## Implementation Plan\n`);
    parts.push(plan.implementationPlan);
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Generate PRD document from approved plan
 */
export function generatePrdDocument(plan: PlanDocument): PrdDocument {
  // Parse implementation plan to extract structured info
  const planContent = plan.implementationPlan || '';

  // Extract affected files (look for file paths in the plan)
  const fileMatches = planContent.match(/`[^`]+\.(ts|tsx|js|jsx|java|xml|json|yaml|yml|md)`/g) || [];
  const affectedFiles = [...new Set(fileMatches.map(m => m.replace(/`/g, '')))];

  // Extract testing strategy (look for testing section)
  const testingMatch = planContent.match(/##\s*Test(?:ing)?\s*(?:Strategy)?[\s\S]*?(?=##|$)/i);
  const testingStrategy = testingMatch ? testingMatch[0].trim() : 'See implementation plan for testing details.';

  // Generate summary from first section
  const summaryMatch = planContent.match(/##\s*Summary[\s\S]*?(?=##|$)/i);
  const summary = summaryMatch
    ? summaryMatch[0].replace(/##\s*Summary\s*/i, '').trim()
    : `Implementation of ${plan.intention.name} for: ${plan.originalPrompt}`;

  return {
    planId: plan.id,
    generatedAt: new Date().toISOString(),
    participant: plan.participant,
    alias: plan.alias,
    intention: {
      id: plan.intention.id,
      name: plan.intention.name,
      description: plan.intention.description,
    },
    originalPrompt: plan.originalPrompt,
    requirements: plan.gathered,
    implementationPlan: plan.implementationPlan || '',
    summary,
    affectedFiles,
    testingStrategy,
  };
}

/**
 * Generate PRD markdown for saving to history
 */
export function generatePrdMarkdown(prd: PrdDocument): string {
  const parts: string[] = [];

  parts.push(`# Product Requirements Document\n`);
  parts.push(`**Generated:** ${new Date(prd.generatedAt).toLocaleString()}`);
  parts.push(`**Plan ID:** ${prd.planId}`);
  parts.push(`**Participant:** ${prd.participant}`);
  parts.push(`**Alias:** ${prd.alias}\n`);

  parts.push(`## Intention\n`);
  parts.push(`**${prd.intention.name}**`);
  parts.push(`${prd.intention.description}\n`);

  parts.push(`## Original Request\n`);
  parts.push(`${prd.originalPrompt}\n`);

  parts.push(`## Summary\n`);
  parts.push(`${prd.summary}\n`);

  parts.push(`## Requirements\n`);
  for (const req of prd.requirements) {
    parts.push(`- **${req.name}:** ${req.value}`);
  }
  parts.push('');

  if (prd.affectedFiles.length > 0) {
    parts.push(`## Affected Files\n`);
    for (const file of prd.affectedFiles) {
      parts.push(`- \`${file}\``);
    }
    parts.push('');
  }

  parts.push(`## Implementation Plan\n`);
  parts.push(prd.implementationPlan);
  parts.push('');

  parts.push(`## Testing Strategy\n`);
  parts.push(prd.testingStrategy);
  parts.push('');

  return parts.join('\n');
}

/**
 * Save PRD to history folder
 */
export function savePrdToHistory(
  prd: PrdDocument,
  contextContent?: string
): { prdPath: string; contextPath: string } {
  const historyPath = path.join(getBasePath(), '.agentx', '.history');
  const dateFolder = prd.generatedAt.slice(0, 10);
  const time = new Date(prd.generatedAt).toTimeString().slice(0, 5).replace(':', '');
  const safeName = prd.alias.replace(/[^a-zA-Z0-9-_]/g, '-');
  const safeIntent = prd.intention.id.replace(/[^a-zA-Z0-9-_]/g, '-');
  const entryDir = `${time}-${safeName}-${safeIntent}-prd`;

  const entryPath = path.join(historyPath, dateFolder, entryDir);

  // Create directory
  fs.mkdirSync(entryPath, { recursive: true });

  // Save PRD markdown
  const prdContent = generatePrdMarkdown(prd);
  const prdPath = path.join(entryPath, 'prd.md');
  fs.writeFileSync(prdPath, prdContent, 'utf-8');

  // Save PRD JSON
  const prdJsonPath = path.join(entryPath, 'prd.json');
  fs.writeFileSync(prdJsonPath, JSON.stringify(prd, null, 2), 'utf-8');

  // Save context if provided
  let contextPath = '';
  if (contextContent) {
    contextPath = path.join(entryPath, 'context.md');
    fs.writeFileSync(contextPath, contextContent, 'utf-8');
  }

  return { prdPath, contextPath };
}

/**
 * Find active plan for participant/alias/intention combination
 */
export function findActivePlan(
  participant: string,
  alias: string,
  intentionId: string
): PlanDocument | null {
  const plans = listActivePlans();

  return plans.find(p =>
    p.participant === participant &&
    p.alias === alias &&
    p.intention.id === intentionId &&
    !isPlanExpired(p) &&
    (p.status === 'gathering' || p.status === 'ready')
  ) || null;
}
