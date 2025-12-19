/**
 * Intention management for AgentX
 * Handles loading intentions and extracting requirements from prompts
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  IntentionDefinition,
  IntentionRequirement,
  ExtractedRequirement,
  RequirementGatheringResult,
} from '../types';
import { loadConfig } from '../config';

/**
 * Get the intentions directory path
 */
function getIntentionsDir(): string {
  const config = loadConfig();
  const knowledgeBase = config.knowledgeBase.replace(/^~/, os.homedir());
  return path.join(knowledgeBase, '.ai-config', 'intentions');
}

/**
 * Load all intention definitions
 */
export async function loadIntentions(): Promise<IntentionDefinition[]> {
  const intentionsDir = getIntentionsDir();

  if (!fs.existsSync(intentionsDir)) {
    return [];
  }

  const files = fs.readdirSync(intentionsDir).filter((f) => f.endsWith('.json'));
  const intentions: IntentionDefinition[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(intentionsDir, file), 'utf-8');
      const intention = JSON.parse(content) as IntentionDefinition;
      intentions.push(intention);
    } catch {
      continue;
    }
  }

  return intentions;
}

/**
 * Get a specific intention by ID
 */
export async function getIntention(id: string): Promise<IntentionDefinition | null> {
  const intentions = await loadIntentions();
  return intentions.find((i) => i.id === id) || null;
}

/**
 * Get intentions applicable to a specific alias
 */
export async function getIntentionsForAlias(aliasName: string): Promise<IntentionDefinition[]> {
  const intentions = await loadIntentions();
  return intentions.filter(
    (i) => !i.applicableAliases || i.applicableAliases.length === 0 || i.applicableAliases.includes(aliasName)
  );
}

/**
 * Extract requirement values from a prompt
 */
export function extractRequirements(
  prompt: string,
  intention: IntentionDefinition
): ExtractedRequirement[] {
  const extracted: ExtractedRequirement[] = [];
  const promptLower = prompt.toLowerCase();

  for (const req of intention.requirements) {
    const result = extractSingleRequirement(prompt, promptLower, req);
    extracted.push(result);
  }

  return extracted;
}

/**
 * Extract a single requirement from prompt
 */
function extractSingleRequirement(
  prompt: string,
  promptLower: string,
  req: IntentionRequirement
): ExtractedRequirement {
  // Check extraction hints
  if (req.extractionHints) {
    for (const hint of req.extractionHints) {
      if (promptLower.includes(hint.toLowerCase())) {
        // Try to extract value near the hint
        const value = extractValueNearHint(prompt, hint, req.type);
        if (value) {
          return {
            id: req.id,
            value,
            confidence: 'medium',
            source: 'prompt',
          };
        }
      }
    }
  }

  // Type-specific extraction
  if (req.type === 'enum' && req.options) {
    for (const option of req.options) {
      if (promptLower.includes(option.toLowerCase())) {
        return {
          id: req.id,
          value: option,
          confidence: 'high',
          source: 'prompt',
        };
      }
    }
  }

  // Check for common patterns
  const value = extractByPattern(prompt, req);
  if (value) {
    return {
      id: req.id,
      value,
      confidence: 'medium',
      source: 'prompt',
    };
  }

  // Use default if available
  if (req.default) {
    return {
      id: req.id,
      value: req.default,
      confidence: 'low',
      source: 'default',
    };
  }

  return {
    id: req.id,
    value: null,
    confidence: 'missing',
    source: 'prompt',
  };
}

/**
 * Extract value near a hint keyword
 */
function extractValueNearHint(prompt: string, hint: string, type: string): string | null {
  const hintIndex = prompt.toLowerCase().indexOf(hint.toLowerCase());
  if (hintIndex === -1) return null;

  // Get text after hint
  const afterHint = prompt.substring(hintIndex + hint.length).trim();
  
  // Extract first meaningful word/phrase
  const match = afterHint.match(/^[:\s]*([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Extract value by common patterns
 */
function extractByPattern(prompt: string, req: IntentionRequirement): string | null {
  const patterns: Record<string, RegExp[]> = {
    resource: [
      /(?:for|create|build|add)\s+(?:a\s+)?(\w+)\s+(?:endpoint|api|service)/i,
      /(\w+)\s+(?:endpoint|api|service|management)/i,
    ],
    method: [
      /\b(GET|POST|PUT|PATCH|DELETE)\b/i,
    ],
    endpoint: [
      /(?:endpoint|path|url)[:\s]+([\/\w-{}]+)/i,
      /(\/api\/v\d+\/[\w-]+)/i,
    ],
  };

  const reqPatterns = patterns[req.id];
  if (!reqPatterns) return null;

  for (const pattern of reqPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Gather requirements - extract from prompt and identify missing
 */
export function gatherRequirements(
  prompt: string,
  intention: IntentionDefinition,
  alias?: string
): RequirementGatheringResult {
  const extracted = extractRequirements(prompt, intention);

  const missing = intention.requirements.filter((req) => {
    const ext = extracted.find((e) => e.id === req.id);
    return req.required && (!ext || ext.confidence === 'missing');
  });

  const complete = missing.length === 0;

  return {
    intention,
    extracted,
    missing,
    complete,
    refinedPrompt: complete ? buildRefinedPrompt(prompt, intention, extracted, alias) : undefined,
  };
}

/**
 * Build a refined prompt with extracted requirements
 */
function buildRefinedPrompt(
  originalPrompt: string,
  intention: IntentionDefinition,
  extracted: ExtractedRequirement[],
  alias?: string
): string {
  // Try to load template file first
  if (intention.promptTemplatePath) {
    const template = loadPromptTemplate(intention.promptTemplatePath);
    if (template) {
      return renderTemplate(template, originalPrompt, intention, extracted, alias);
    }
  }

  // Fall back to inline template
  if (intention.promptTemplate) {
    let refined = intention.promptTemplate;
    for (const ext of extracted) {
      const placeholder = `{${ext.id}}`;
      refined = refined.replace(placeholder, String(ext.value || ''));
    }
    return refined;
  }

  // Default: append extracted requirements as context
  const requirements = extracted
    .filter((e) => e.value !== null)
    .map((e) => `- ${e.id}: ${e.value}`)
    .join('\n');

  return `${originalPrompt}\n\n## Extracted Requirements:\n${requirements}`;
}

/**
 * Load a prompt template from file
 */
function loadPromptTemplate(templatePath: string): string | null {
  const config = loadConfig();
  const knowledgeBase = config.knowledgeBase.replace(/^~/, os.homedir());
  const fullPath = path.join(knowledgeBase, templatePath);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Render a Handlebars-style template with requirements
 */
function renderTemplate(
  template: string,
  originalPrompt: string,
  intention: IntentionDefinition,
  extracted: ExtractedRequirement[],
  alias?: string
): string {
  let rendered = template;

  // Build context object
  const context: Record<string, unknown> = {
    alias: alias || 'unknown',
    originalPrompt,
    'intention.name': intention.name,
    'intention.id': intention.id,
  };

  // Add extracted values
  for (const ext of extracted) {
    context[ext.id] = ext.value;
  }

  // Build requirements array for {{#each requirements}}
  const requirementsArray = extracted.map((ext) => {
    const req = intention.requirements.find((r) => r.id === ext.id);
    return {
      id: ext.id,
      name: req?.name || ext.id,
      value: formatValue(ext.value),
      source: ext.source,
    };
  });

  // Simple placeholder replacement {{variable}}
  rendered = rendered.replace(/\{\{([^#/}]+)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (context[trimmedKey] !== undefined) {
      return formatValue(context[trimmedKey]);
    }
    return `_Not specified_`;
  });

  // Handle {{#each requirements}} block
  const eachRequirementsRegex = /\{\{#each requirements\}\}([\s\S]*?)\{\{\/each\}\}/g;
  rendered = rendered.replace(eachRequirementsRegex, (_, block) => {
    return requirementsArray
      .map((req) => {
        let row = block;
        row = row.replace(/\{\{name\}\}/g, req.name);
        row = row.replace(/\{\{value\}\}/g, req.value);
        row = row.replace(/\{\{source\}\}/g, req.source);
        row = row.replace(/\{\{id\}\}/g, req.id);
        return row;
      })
      .join('');
  });

  // Handle {{#each fieldName}} for array fields
  const eachFieldRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  rendered = rendered.replace(eachFieldRegex, (_, fieldName, block) => {
    const value = context[fieldName];
    if (Array.isArray(value)) {
      return value.map((item) => block.replace(/\{\{this\}\}/g, String(item))).join('');
    }
    return '';
  });

  // Handle {{#if field}} blocks
  const ifRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  rendered = rendered.replace(ifRegex, (_, fieldName, block) => {
    const value = context[fieldName];
    if (value && value !== 'false' && value !== false) {
      // Process else blocks
      const [ifContent, elseContent] = block.split('{{else}}');
      return ifContent;
    } else {
      const [, elseContent] = block.split('{{else}}');
      return elseContent || '';
    }
  });

  // Handle {{#switch}} blocks (simplified - just show the value)
  const switchRegex = /\{\{#switch \w+\}\}[\s\S]*?\{\{\/switch\}\}/g;
  rendered = rendered.replace(switchRegex, '');

  return rendered;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '_Not specified_';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

/**
 * Update extracted requirements with user-provided values
 */
export function updateRequirements(
  result: RequirementGatheringResult,
  updates: Record<string, string | string[] | boolean>,
  alias?: string
): RequirementGatheringResult {
  const extracted = result.extracted.map((ext) => {
    if (updates[ext.id] !== undefined) {
      return {
        ...ext,
        value: updates[ext.id],
        confidence: 'high' as const,
        source: 'user' as const,
      };
    }
    return ext;
  });

  const missing = result.intention.requirements.filter((req) => {
    const ext = extracted.find((e) => e.id === req.id);
    return req.required && (!ext || ext.value === null);
  });

  const complete = missing.length === 0;

  return {
    intention: result.intention,
    extracted,
    missing,
    complete,
    refinedPrompt: complete ? buildRefinedPrompt('', result.intention, extracted, alias) : undefined,
  };
}

/**
 * Format missing requirements as questions for user
 */
export function formatMissingRequirements(missing: IntentionRequirement[]): string {
  if (missing.length === 0) return '';

  const questions = missing.map((req, i) => {
    let question = `${i + 1}. ${req.question}`;
    if (req.type === 'enum' && req.options) {
      question += ` (${req.options.join(' | ')})`;
    }
    if (!req.required) {
      question += ' [optional]';
    }
    return question;
  });

  return `Missing information:\n${questions.join('\n')}`;
}

/**
 * Check if intentions directory exists
 */
export function intentionsDirectoryExists(): boolean {
  return fs.existsSync(getIntentionsDir());
}

/**
 * Get intentions directory path
 */
export function getIntentionsDirectoryPath(): string {
  return getIntentionsDir();
}

/**
 * Render the refined prompt from a complete gathering result
 */
export function renderRefinedPrompt(
  result: RequirementGatheringResult,
  originalPrompt: string,
  alias?: string
): string {
  if (!result.complete) {
    throw new Error('Cannot render refined prompt - requirements incomplete');
  }
  return buildRefinedPrompt(originalPrompt, result.intention, result.extracted, alias);
}

/**
 * Load prompt template by intention ID
 */
export function loadIntentionTemplate(intentionId: string): string | null {
  const config = loadConfig();
  const knowledgeBase = config.knowledgeBase.replace(/^~/, os.homedir());
  const templatePath = path.join(knowledgeBase, '.ai-templates', 'intentions', `${intentionId}.prompt.md`);

  if (!fs.existsSync(templatePath)) {
    return null;
  }

  return fs.readFileSync(templatePath, 'utf-8');
}

