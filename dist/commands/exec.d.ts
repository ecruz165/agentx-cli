/**
 * Exec command for AgentX CLI
 * Based on initial-spec.md exec command specification
 *
 * Usage:
 *   agentx exec <alias> "<prompt>"
 *   agentx exec bff "Design a GraphQL schema for user dashboard"
 *   agentx exec bff "Design a GraphQL schema" --verbose
 *   agentx exec bff "Explain this" --files ./src/schema.graphql
 */
import { Command } from 'commander';
/**
 * Create the exec command
 */
export declare function createExecCommand(): Command;
//# sourceMappingURL=exec.d.ts.map