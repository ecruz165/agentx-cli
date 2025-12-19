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

  switch (provider) {
    case 'copilot':
      return executeCopilot(prompt, context);
    case 'claude':
      return executeClaude(prompt, context);
    case 'openai':
      return executeOpenAI(prompt, context);
    case 'mock':
      return executeMock(prompt, context);
    default:
      return {
        success: false,
        error: `Unknown provider: ${provider}`,
      };
  }
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
  const contextInfo = context
    ? `\n\nContext provided: ${context.length} characters`
    : '\n\nNo context provided';

  return {
    success: true,
    response: `[Mock AI Response]\n\nReceived prompt: "${prompt}"${contextInfo}`,
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

