/**
 * Skill Executor
 * Unified interface for executing skills of all types
 */

import * as vscode from 'vscode';
import { SkillLoader } from './loader';
import { ScriptRunner } from './script';
import { MakeRunner } from './make';
import { LlmRunner } from './llm';
import { OutputExtractor } from './output';
import {
  Skill,
  SkillResult,
  RawExecutionResult,
  ValidationResult,
  ExecutionPreview,
  ExecutionOptions,
  SkillErrorCode,
} from './types';

/**
 * Unified skill executor
 */
export class SkillExecutor {
  private loader: SkillLoader;
  private scriptRunner: ScriptRunner;
  private makeRunner: MakeRunner;
  private llmRunner: LlmRunner;
  private outputExtractor: OutputExtractor;

  constructor(workspaceRoot: string) {
    this.loader = new SkillLoader(workspaceRoot);
    this.scriptRunner = new ScriptRunner(workspaceRoot);
    this.makeRunner = new MakeRunner(workspaceRoot);
    this.llmRunner = new LlmRunner();
    this.outputExtractor = new OutputExtractor();
  }

  /**
   * Execute a skill by ID
   */
  async execute(
    skillId: string,
    inputs: Record<string, unknown>,
    options?: ExecutionOptions
  ): Promise<SkillResult> {
    const startTime = Date.now();

    // Check workspace trust
    if (!vscode.workspace.isTrusted) {
      return this.errorResult(skillId, 'WORKSPACE_NOT_TRUSTED', 'Workspace is not trusted');
    }

    // Load skill
    let skill: Skill;
    try {
      skill = await this.loader.load(skillId);
    } catch (error) {
      return this.errorResult(skillId, 'NOT_FOUND', (error as Error).message);
    }

    // Validate inputs
    const validation = this.validate(skill, inputs);
    if (!validation.valid) {
      return this.errorResult(skillId, 'VALIDATION_ERROR', validation.errors.join(', '));
    }

    // Apply platform overrides
    const resolvedSkill = this.resolvePlatform(skill);

    // User confirmation if required
    if (resolvedSkill.confirm && !options?.skipConfirm) {
      const preview = this.preview(resolvedSkill, inputs);
      const confirmed = await this.confirmExecution(preview);
      if (!confirmed) {
        return this.errorResult(skillId, 'USER_CANCELLED', 'User cancelled execution');
      }
    }

    // Execute based on type
    let rawResult: RawExecutionResult;

    try {
      switch (resolvedSkill.type) {
        case 'script':
          rawResult = await this.scriptRunner.run(resolvedSkill, inputs);
          break;
        case 'make':
          rawResult = await this.makeRunner.run(resolvedSkill, inputs);
          break;
        case 'llm':
          rawResult = await this.llmRunner.run(resolvedSkill, inputs);
          break;
        default:
          return this.errorResult(skillId, 'SCHEMA_ERROR', `Unknown skill type: ${resolvedSkill.type}`);
      }
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes('timed out')) {
        return this.errorResult(skillId, 'TIMEOUT', message);
      }
      return this.errorResult(skillId, 'EXECUTION_ERROR', message);
    }

    // Extract outputs
    const outputs = this.outputExtractor.extract(rawResult, resolvedSkill.outputs);

    // Determine success
    const success = resolvedSkill.type === 'llm' || rawResult.exitCode === 0;

    return {
      success,
      outputs,
      raw: rawResult,
      duration: Date.now() - startTime,
      skillId,
      executedAt: new Date(),
      error: success ? undefined : {
        code: 'EXECUTION_ERROR',
        message: `Skill exited with code ${rawResult.exitCode}`,
        details: rawResult.stderr,
      },
    };
  }

  /**
   * Validate skill inputs
   */
  validate(skill: Skill, inputs: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const args = skill.args || skill.inputs || [];

    for (const arg of args) {
      // Check required
      if (arg.required && !(arg.name in inputs)) {
        errors.push(`Missing required input: ${arg.name}`);
        continue;
      }

      // Check type
      if (arg.name in inputs && arg.type) {
        const value = inputs[arg.name];
        if (!this.checkType(value, arg.type)) {
          errors.push(`Invalid type for ${arg.name}: expected ${arg.type}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Preview execution without running
   */
  preview(skill: Skill, inputs: Record<string, unknown>): ExecutionPreview {
    switch (skill.type) {
      case 'script':
        return {
          type: 'script',
          command: this.scriptRunner.buildCommand(skill, inputs),
          workdir: skill.workdir,
          env: { ...skill.env },
        };
      case 'make':
        return {
          type: 'make',
          command: this.makeRunner.buildCommand(skill),
          workdir: skill.workdir,
          env: this.makeRunner.buildEnv(skill, inputs),
        };
      case 'llm':
        return {
          type: 'llm',
          prompt: this.llmRunner.interpolate(skill.prompt || '', inputs),
          model: skill.model || 'default',
        };
    }
  }

  /**
   * Get skill by ID
   */
  async getSkill(skillId: string): Promise<Skill | null> {
    return this.loader.get(skillId);
  }

  /**
   * Load all available skills
   */
  async loadAllSkills(): Promise<Skill[]> {
    return this.loader.loadAll();
  }

  /**
   * Set cancellation token for LLM operations
   */
  setCancellationToken(token: vscode.CancellationToken): void {
    this.llmRunner.setCancellationToken(token);
  }

  /**
   * Invalidate skill cache
   */
  invalidateCache(skillId?: string): void {
    this.loader.invalidateCache(skillId);
  }

  /**
   * Start watching for skill file changes
   */
  startWatching(): void {
    this.loader.startWatching();
  }

  /**
   * Stop watching for changes
   */
  stopWatching(): void {
    this.loader.stopWatching();
  }

  /**
   * Check if value matches expected type
   */
  private checkType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Resolve platform-specific overrides
   */
  private resolvePlatform(skill: Skill): Skill {
    if (!skill.platform) return skill;

    const isWindows = process.platform === 'win32';
    const override = isWindows ? skill.platform.windows : skill.platform.unix;

    if (!override) return skill;

    return { ...skill, ...override };
  }

  /**
   * Show confirmation dialog
   */
  private async confirmExecution(preview: ExecutionPreview): Promise<boolean> {
    const detail =
      preview.type === 'llm'
        ? `Prompt:\n${preview.prompt?.substring(0, 500)}${(preview.prompt?.length || 0) > 500 ? '...' : ''}`
        : `Command: ${preview.command}\nDirectory: ${preview.workdir || 'workspace root'}`;

    const result = await vscode.window.showWarningMessage(
      `Execute ${preview.type} skill?`,
      { modal: true, detail },
      'Execute',
      'Cancel'
    );

    return result === 'Execute';
  }

  /**
   * Create error result
   */
  private errorResult(skillId: string, code: SkillErrorCode, message: string): SkillResult {
    return {
      success: false,
      outputs: {},
      raw: {},
      duration: 0,
      skillId,
      executedAt: new Date(),
      error: { code, message },
    };
  }
}
