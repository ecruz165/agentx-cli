/**
 * AI Provider abstraction for AgentX
 */

import { spawn } from 'child_process';
import { loadConfig } from '../config';

/**
 * Provider types supported
 */
export type ProviderType = 'copilot' | 'claude' | 'openai' | 'mock';

/**
 * Provider execution result
 */
export interface ProviderResult {
  success: boolean;
  response?: string;
  error?: string;
  truncated?: boolean;
}

/**
 * Token limits for different providers/models
 */
const TOKEN_LIMITS: Record<string, number> = {
  'copilot': 8000,      // gh copilot CLI has limited context
  'gpt-4': 8192,
  'gpt-4-turbo': 128000,
  'gpt-4o': 128000,
  'claude-sonnet': 200000,
  'claude-opus': 200000,
  'default': 8000,
};

/**
 * Estimate token count from text (rough: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate context to fit within token limit
 * Reserves space for prompt and response
 */
export function truncateContextForTokenLimit(
  context: string,
  prompt: string,
  maxTokens: number,
  reserveForResponse: number = 2000
): { context: string; truncated: boolean } {
  const promptTokens = estimateTokens(prompt);
  const availableForContext = maxTokens - promptTokens - reserveForResponse;

  if (availableForContext <= 0) {
    return { context: '', truncated: true };
  }

  const contextTokens = estimateTokens(context);

  if (contextTokens <= availableForContext) {
    return { context, truncated: false };
  }

  // Truncate context to fit
  const maxContextChars = availableForContext * 4;
  const truncatedContext = context.substring(0, maxContextChars);

  // Try to truncate at a reasonable boundary (newline)
  const lastNewline = truncatedContext.lastIndexOf('\n');
  const finalContext = lastNewline > maxContextChars * 0.8
    ? truncatedContext.substring(0, lastNewline)
    : truncatedContext;

  return {
    context: finalContext + '\n\n[... context truncated to fit token limit ...]',
    truncated: true,
  };
}

/**
 * Get token limit for a provider/model
 */
export function getTokenLimit(provider: string, model?: string): number {
  if (model && TOKEN_LIMITS[model]) {
    return TOKEN_LIMITS[model];
  }
  return TOKEN_LIMITS[provider] || TOKEN_LIMITS['default'];
}

/**
 * Execute prompt with the configured provider
 */
export async function executeWithProvider(
  prompt: string,
  context: string
): Promise<ProviderResult> {
  const config = loadConfig();
  const provider = config.provider as ProviderType;
  const model = config.model;

  // Get token limit and truncate context if needed
  const tokenLimit = getTokenLimit(provider, model);
  const { context: truncatedContext, truncated } = truncateContextForTokenLimit(
    context,
    prompt,
    tokenLimit
  );

  let result: ProviderResult;

  switch (provider) {
    case 'copilot':
      result = await executeCopilot(prompt, truncatedContext);
      break;
    case 'claude':
      result = await executeClaude(prompt, truncatedContext);
      break;
    case 'openai':
      result = await executeOpenAI(prompt, truncatedContext);
      break;
    case 'mock':
      result = await executeMock(prompt, truncatedContext);
      break;
    default:
      return {
        success: false,
        error: `Unknown provider: ${provider}`,
      };
  }

  // Add truncation info to result
  if (truncated) {
    result.truncated = true;
  }

  return result;
}

/**
 * Execute with GitHub Copilot CLI
 */
async function executeCopilot(
  prompt: string,
  context: string
): Promise<ProviderResult> {
  const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;

  return new Promise((resolve) => {
    const ghProcess = spawn('gh', ['copilot', 'suggest', '-t', 'shell', fullPrompt], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    ghProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ghProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ghProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to execute GitHub Copilot: ${error.message}`,
      });
    });

    ghProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          response: stdout.trim(),
        });
      } else {
        resolve({
          success: false,
          error: stderr || `Copilot exited with code ${code}`,
        });
      }
    });
  });
}

/**
 * Execute with Claude API (placeholder - requires API key)
 */
async function executeClaude(
  prompt: string,
  context: string
): Promise<ProviderResult> {
  const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;

  return {
    success: false,
    error:
      'Claude provider not yet implemented. Please configure API key and install @anthropic-ai/sdk',
  };
}

/**
 * Execute with OpenAI API (placeholder - requires API key)
 */
async function executeOpenAI(
  prompt: string,
  context: string
): Promise<ProviderResult> {
  const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;

  return {
    success: false,
    error: 'OpenAI provider not yet implemented. Please configure API key and install openai',
  };
}

/**
 * Mock provider for testing
 */
async function executeMock(
  prompt: string,
  context: string
): Promise<ProviderResult> {
  const contextTokens = estimateTokens(context);
  const promptTokens = estimateTokens(prompt);
  const contextInfo = context
    ? `\n\nContext provided: ${context.length} characters (~${contextTokens} tokens)`
    : '\n\nNo context provided';

  return {
    success: true,
    response: `[Mock AI Response]\n\nReceived prompt: "${prompt}" (~${promptTokens} tokens)${contextInfo}`,
  };
}

/**
 * Check if a provider is available
 */
export async function checkProviderAvailability(
  provider: ProviderType
): Promise<boolean> {
  switch (provider) {
    case 'copilot':
      return checkCopilotAvailable();
    case 'claude':
      return checkClaudeAvailable();
    case 'openai':
      return checkOpenAIAvailable();
    case 'mock':
      return true;
    default:
      return false;
  }
}

/**
 * Check if GitHub Copilot CLI is available
 */
async function checkCopilotAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ghProcess = spawn('gh', ['copilot', '--version'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    ghProcess.on('error', () => {
      resolve(false);
    });

    ghProcess.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

/**
 * Check if Claude API is configured
 */
async function checkClaudeAvailable(): Promise<boolean> {
  const config = loadConfig();
  const configRecord = config as unknown as Record<string, unknown>;
  return !!(configRecord.claudeApiKey || process.env.ANTHROPIC_API_KEY);
}

/**
 * Check if OpenAI API is configured
 */
async function checkOpenAIAvailable(): Promise<boolean> {
  const config = loadConfig();
  const configRecord = config as unknown as Record<string, unknown>;
  return !!(configRecord.openaiApiKey || process.env.OPENAI_API_KEY);
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): ProviderType[] {
  return ['copilot', 'claude', 'openai', 'mock'];
}

