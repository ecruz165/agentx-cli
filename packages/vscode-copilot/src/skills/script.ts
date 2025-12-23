/**
 * Script Runner
 * Executes shell scripts, Python scripts, or Node.js scripts
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { Skill, RawExecutionResult, ShellType } from './types';

/**
 * Script runner for executing shell/python/node scripts
 */
export class ScriptRunner {
  constructor(private workspaceRoot: string) {}

  /**
   * Execute a script skill
   */
  async run(skill: Skill, inputs: Record<string, unknown>): Promise<RawExecutionResult> {
    const command = this.buildCommand(skill, inputs);
    const workdir = this.resolveWorkdir(skill.workdir);
    const env = { ...process.env, ...skill.env };

    // Validate script path is within workspace
    if (skill.run && !this.validateScriptPath(skill.run)) {
      throw new Error(`Script path must be within workspace: ${skill.run}`);
    }

    return new Promise((resolve, reject) => {
      const shell = this.getShell(skill.shell);
      const args = this.getShellArgs(skill.shell, command);

      const proc: ChildProcess = spawn(shell, args, {
        cwd: workdir,
        env,
        timeout: (skill.timeout || 60) * 1000,
        shell: false,
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
          reject(new Error(`Script execution timed out after ${skill.timeout || 60} seconds`));
        } else {
          resolve({ stdout, stderr, exitCode: exitCode || 0 });
        }
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Script execution failed: ${error.message}`));
      });
    });
  }

  /**
   * Build the command string with arguments
   */
  buildCommand(skill: Skill, inputs: Record<string, unknown>): string {
    const parts: string[] = [skill.run || ''];

    // Sort args: positional first, then flags
    const args = [...(skill.args || [])].sort((a, b) => {
      if (a.positional !== undefined && b.positional !== undefined) {
        return a.positional - b.positional;
      }
      if (a.positional !== undefined) return -1;
      if (b.positional !== undefined) return 1;
      return 0;
    });

    const positionalArgs: string[] = [];

    for (const arg of args) {
      const value = inputs[arg.name] ?? arg.default;
      if (value === undefined || value === null) continue;

      if (arg.positional !== undefined) {
        positionalArgs[arg.positional] = this.escapeArg(String(value));
      } else if (arg.flag) {
        if (arg.type === 'boolean') {
          if (value) parts.push(arg.flag);
        } else if (arg.type === 'array' && Array.isArray(value)) {
          parts.push(arg.flag, this.escapeArg(value.join(',')));
        } else {
          parts.push(arg.flag, this.escapeArg(String(value)));
        }
      } else if (arg.shortFlag) {
        if (arg.type === 'boolean') {
          if (value) parts.push(arg.shortFlag);
        } else {
          parts.push(arg.shortFlag, this.escapeArg(String(value)));
        }
      }
    }

    // Insert positional args
    parts.push(...positionalArgs.filter(Boolean));

    return parts.join(' ');
  }

  /**
   * Get the shell executable
   */
  private getShell(shell?: ShellType): string {
    const isWindows = process.platform === 'win32';

    switch (shell) {
      case 'bash':
        return isWindows ? 'bash' : '/bin/bash'; // WSL or Git Bash on Windows
      case 'python':
        return isWindows ? 'python' : 'python3';
      case 'node':
        return 'node';
      case 'pwsh':
        return 'pwsh';
      default:
        return isWindows ? 'cmd.exe' : '/bin/bash';
    }
  }

  /**
   * Get shell arguments for the command
   */
  private getShellArgs(shell: ShellType | undefined, command: string): string[] {
    switch (shell) {
      case 'python':
      case 'node':
        return [command]; // Direct script execution
      case 'pwsh':
        return ['-Command', command];
      default:
        return process.platform === 'win32' ? ['/c', command] : ['-c', command];
    }
  }

  /**
   * Escape argument for shell
   */
  private escapeArg(arg: string): string {
    if (!/[\s"'\\]/.test(arg)) return arg;
    return `"${arg.replace(/["\\]/g, '\\$&')}"`;
  }

  /**
   * Resolve working directory
   */
  private resolveWorkdir(workdir?: string): string {
    if (!workdir) return this.workspaceRoot;
    return workdir.replace('${workspaceFolder}', this.workspaceRoot);
  }

  /**
   * Validate script path is within workspace
   */
  private validateScriptPath(scriptPath: string): boolean {
    // Allow absolute paths that are within workspace
    if (path.isAbsolute(scriptPath)) {
      return scriptPath.startsWith(this.workspaceRoot);
    }
    // Relative paths are resolved relative to workspace, so they're always valid
    // But check for path traversal
    const resolved = path.resolve(this.workspaceRoot, scriptPath);
    return resolved.startsWith(this.workspaceRoot);
  }
}
