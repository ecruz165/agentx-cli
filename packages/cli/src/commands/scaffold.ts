/**
 * Scaffold command for AgentX CLI
 * Adds .agentx/ directory structure to an existing project
 */

import { Command } from 'commander';
import { scaffoldProject, ProjectType, hasAiConfig } from '@agentx/core';
import { colors, drawBox } from '../utils/output';

const PROJECT_TYPES: ProjectType[] = ['typescript', 'java', 'hybrid', 'unknown'];

export function createScaffoldCommand(version: string): Command {
  return new Command('scaffold')
    .description('Add .agentx/ configuration to an existing project')
    .option('-t, --type <type>', 'Project type (typescript, java, hybrid)', 'typescript')
    .option('-p, --path <path>', 'Project path (default: current directory)', '.')
    .option('-f, --force', 'Overwrite existing files', false)
    .action(async (options) => {
      const { type, path: projectPath, force } = options;

      if (!PROJECT_TYPES.includes(type as ProjectType)) {
        console.log(colors.red(`Invalid project type: ${type}`));
        console.log(`Valid types: ${PROJECT_TYPES.join(', ')}`);
        process.exit(1);
      }

      displayScaffoldHeader(version, type, projectPath);

      // Check if already initialized
      if (hasAiConfig(projectPath) && !force) {
        console.log(colors.yellow('⚠️  .agentx/ already exists in this project'));
        console.log('   Use --force to overwrite existing files');
        process.exit(0);
      }

      try {
        const result = await scaffoldProject({
          basePath: projectPath,
          projectType: type as ProjectType,
          overwrite: force,
        });

        if (result.success) {
          displaySuccess(result);
        } else {
          console.log(colors.red('Failed to scaffold project:'));
          result.errors.forEach((err) => console.log(`  - ${err}`));
          process.exit(1);
        }
      } catch (error) {
        console.log(colors.red(`Error: ${error}`));
        process.exit(1);
      }
    });
}

function displayScaffoldHeader(version: string, type: string, projectPath: string): void {
  const width = 61;
  const lines = [`AgentX v${version} - Scaffold Project`];
  const box = drawBox(lines, width);

  console.log(box[0]);
  console.log(box[1]);
  console.log(`├${'─'.repeat(width - 2)}┤`);
  console.log(`│  ${colors.cyan('Type:'.padEnd(12))} ${type.padEnd(width - 18)} │`);
  console.log(`│  ${colors.cyan('Path:'.padEnd(12))} ${projectPath.padEnd(width - 18)} │`);
  console.log(`└${'─'.repeat(width - 2)}┘`);
  console.log('');
}

function displaySuccess(result: { createdDirectories: string[]; createdFiles: string[]; skippedPaths: string[] }): void {
  console.log(colors.green('✓ Project scaffolded successfully!'));
  console.log('');

  if (result.createdDirectories.length > 0) {
    console.log(colors.cyan('Created directories:'));
    result.createdDirectories.forEach((dir) => {
      console.log(`  ${colors.green('+')} ${dir}`);
    });
    console.log('');
  }

  if (result.createdFiles.length > 0) {
    console.log(colors.cyan('Created files:'));
    result.createdFiles.forEach((file) => {
      console.log(`  ${colors.green('+')} ${file}`);
    });
    console.log('');
  }

  if (result.skippedPaths.length > 0) {
    console.log(colors.yellow('Skipped (already exist):'));
    result.skippedPaths.forEach((path) => {
      console.log(`  ${colors.yellow('-')} ${path}`);
    });
    console.log('');
  }

  console.log('Next steps:');
  console.log(`  1. Edit ${colors.cyan('.agentx/aliases/')} to customize context aliases`);
  console.log(`  2. Add patterns/reference files to your knowledge base`);
  console.log(`  3. Run ${colors.cyan('agentx exec <alias> "your prompt"')}`);
  console.log('');
  console.log(`Or use VS Code extension: ${colors.cyan('@agentx /<alias> your prompt')}`);
}
