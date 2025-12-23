/**
 * Make Runner
 * Executes Make targets, passing inputs as environment variables
 */

import { spawn, ChildProcess } from 'child_process';
import { Skill, RawExecutionResult } from './types';

/**
 * Make runner for executing Makefile targets
 */
export class MakeRunner {
  constructor(private workspaceRoot: string) {}

  /**
   * Execute a make skill
   */
  async run(skill: Skill, inputs: Record<string, unknown>): Promise<RawExecutionResult> {
    const env = this.buildEnv(skill, inputs);
    const makefile = skill.makefile || 'Makefile';
    const workdir = this.resolveWorkdir(skill.workdir);
    const target = skill.target || '';

    return new Promise((resolve, reject) => {
      const proc: ChildProcess = spawn('make', ['-f', makefile, target], {
        cwd: workdir,
        env: { ...process.env, ...skill.env, ...env },
        timeout: (skill.timeout || 60) * 1000,
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      // Set up timeout
      const timeoutMs = (skill.timeout || 60) * 1000;
      const timeout = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGTERM');
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
        }, 5000);
      }, timeoutMs);

      if (proc.stdout) {
        proc.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (proc.stderr) {
        proc.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      proc.on('close', (exitCode) => {
        clearTimeout(timeout);
        if (timedOut) {
          reject(new Error(`Make execution timed out after ${skill.timeout || 60} seconds`));
        } else {
          resolve({ stdout, stderr, exitCode: exitCode || 0 });
        }
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        if (error.message.includes('ENOENT')) {
          reject(new Error('Make is not installed or not in PATH'));
        } else {
          reject(new Error(`Make execution failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Build environment variables from inputs
   */
  buildEnv(skill: Skill, inputs: Record<string, unknown>): Record<string, string> {
    const env: Record<string, string> = {};

    for (const arg of skill.args || []) {
      if (!arg.env) continue;

      const value = inputs[arg.name] ?? arg.default;
      if (value === undefined || value === null) continue;

      if (arg.type === 'boolean') {
        env[arg.env] = value ? '1' : '0';
      } else if (arg.type === 'array') {
        env[arg.env] = Array.isArray(value) ? value.join(',') : String(value);
      } else {
        env[arg.env] = String(value);
      }
    }

    return env;
  }

  /**
   * Build the make command for preview
   */
  buildCommand(skill: Skill): string {
    const makefile = skill.makefile || 'Makefile';
    return `make -f ${makefile} ${skill.target || ''}`;
  }

  /**
   * Resolve working directory
   */
  private resolveWorkdir(workdir?: string): string {
    if (!workdir) return this.workspaceRoot;
    return workdir.replace('${workspaceFolder}', this.workspaceRoot);
  }
}
