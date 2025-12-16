"use strict";
/**
 * AI Provider abstraction for AgentX CLI
 * Based on initial-spec.md provider requirements (copilot, claude, openai)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithProvider = executeWithProvider;
exports.checkProviderAvailability = checkProviderAvailability;
exports.getAvailableProviders = getAvailableProviders;
const child_process_1 = require("child_process");
const config_1 = require("../config");
/**
 * Execute prompt with the configured provider
 */
async function executeWithProvider(prompt, context) {
    const config = (0, config_1.loadConfig)();
    const provider = config.provider;
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
async function executeCopilot(prompt, context) {
    const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;
    return new Promise((resolve) => {
        const ghProcess = (0, child_process_1.spawn)('gh', ['copilot', 'suggest', '-t', 'shell', fullPrompt], {
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
            }
            else {
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
async function executeClaude(prompt, context) {
    // This is a placeholder implementation
    // Full implementation would use the Anthropic SDK
    const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;
    return {
        success: false,
        error: 'Claude provider not yet implemented. Please configure API key and install @anthropic-ai/sdk',
    };
}
/**
 * Execute with OpenAI API (placeholder - requires API key)
 */
async function executeOpenAI(prompt, context) {
    // This is a placeholder implementation
    // Full implementation would use the OpenAI SDK
    const fullPrompt = context ? `${context}\n\n---\n\n${prompt}` : prompt;
    return {
        success: false,
        error: 'OpenAI provider not yet implemented. Please configure API key and install openai',
    };
}
/**
 * Mock provider for testing
 */
async function executeMock(prompt, context) {
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
async function checkProviderAvailability(provider) {
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
async function checkCopilotAvailable() {
    return new Promise((resolve) => {
        const ghProcess = (0, child_process_1.spawn)('gh', ['copilot', '--version'], {
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
async function checkClaudeAvailable() {
    // Check for API key in config or environment
    const config = (0, config_1.loadConfig)();
    const configRecord = config;
    return !!(configRecord.claudeApiKey || process.env.ANTHROPIC_API_KEY);
}
/**
 * Check if OpenAI API is configured
 */
async function checkOpenAIAvailable() {
    // Check for API key in config or environment
    const config = (0, config_1.loadConfig)();
    const configRecord = config;
    return !!(configRecord.openaiApiKey || process.env.OPENAI_API_KEY);
}
/**
 * Get list of available providers
 */
function getAvailableProviders() {
    return ['copilot', 'claude', 'openai', 'mock'];
}
//# sourceMappingURL=index.js.map