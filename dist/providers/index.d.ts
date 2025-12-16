/**
 * AI Provider abstraction for AgentX CLI
 * Based on initial-spec.md provider requirements (copilot, claude, openai)
 */
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
export declare function executeWithProvider(prompt: string, context: string): Promise<ProviderResult>;
/**
 * Check if a provider is available
 */
export declare function checkProviderAvailability(provider: ProviderType): Promise<boolean>;
/**
 * Get list of available providers
 */
export declare function getAvailableProviders(): ProviderType[];
//# sourceMappingURL=index.d.ts.map