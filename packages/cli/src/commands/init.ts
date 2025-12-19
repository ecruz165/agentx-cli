/**
 * Init command for AgentX CLI
 */

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { colors, drawBox } from '../utils/output';
import { displayError } from '../utils/errors';

const FRAMEWORKS = ['spec-kit', 'open-spec', 'bmad'] as const;
type Framework = (typeof FRAMEWORKS)[number];

const TEMPLATES: Record<Framework, string[]> = {
  'spec-kit': ['bff-service', 'rest-service'],
  'open-spec': ['openapi', 'asyncapi'],
  bmad: ['business-model'],
};

export function createInitCommand(version: string): Command {
  return new Command('init')
    .description('Initialize new project from framework template')
    .argument('<framework>', 'Framework to use (spec-kit, open-spec, bmad)')
    .requiredOption('-t, --template <template>', 'Template to use')
    .requiredOption('-n, --name <name>', 'Project name')
    .option('-o, --output <path>', 'Output directory (default: ./<name>)')
    .action(async (framework: string, options) => {
      const { template, name, output } = options;

      if (!FRAMEWORKS.includes(framework as Framework)) {
        displayError('framework-not-found', version, framework, [...FRAMEWORKS]);
        process.exit(1);
      }

      const frameworkTemplates = TEMPLATES[framework as Framework];
      if (!frameworkTemplates.includes(template)) {
        displayError('template-not-found', version, template, framework, frameworkTemplates);
        process.exit(1);
      }

      const outputPath = output || `./${name}`;
      const absoluteOutputPath = path.resolve(process.cwd(), outputPath);

      if (fs.existsSync(absoluteOutputPath)) {
        console.log(colors.red(`Error: Directory '${outputPath}' already exists.`));
        process.exit(1);
      }

      displayInitHeader(version, framework, template, name, outputPath);

      console.log('Creating project structure...');

      try {
        await createProjectStructure(absoluteOutputPath, framework as Framework, template, name);
        displaySuccess(name, outputPath);
      } catch (error) {
        console.log(colors.red(`Error creating project: ${error}`));
        process.exit(1);
      }
    });
}

function displayInitHeader(
  version: string,
  framework: string,
  template: string,
  name: string,
  output: string
): void {
  const width = 61;
  const lines = [`AgentX v${version} - Initialize Project`];
  const box = drawBox(lines, width);

  console.log(box[0]);
  console.log(box[1]);
  console.log(`├${'─'.repeat(width - 2)}┤`);
  console.log(`│  ${colors.cyan('Framework:'.padEnd(12))} ${framework.padEnd(width - 18)} │`);
  console.log(`│  ${colors.cyan('Template:'.padEnd(12))} ${template.padEnd(width - 18)} │`);
  console.log(`│  ${colors.cyan('Name:'.padEnd(12))} ${name.padEnd(width - 18)} │`);
  console.log(`│  ${colors.cyan('Output:'.padEnd(12))} ${output.padEnd(width - 18)} │`);
  console.log(`└${'─'.repeat(width - 2)}┘`);
  console.log('');
}

async function createProjectStructure(
  outputPath: string,
  framework: Framework,
  template: string,
  name: string
): Promise<void> {
  fs.mkdirSync(outputPath, { recursive: true });
  console.log(`${colors.green('✓')} Created ${outputPath}/`);

  const aiConfig = {
    name,
    framework,
    template,
    version: '1.0.0',
    provider: 'copilot',
    aliases: ['project'],
  };
  fs.writeFileSync(
    path.join(outputPath, '.ai-config.json'),
    JSON.stringify(aiConfig, null, 2)
  );
  console.log(`${colors.green('✓')} Created ${outputPath}/.ai-config.json`);

  switch (framework) {
    case 'spec-kit':
      await createSpecKitStructure(outputPath, template);
      break;
    case 'open-spec':
      await createOpenSpecStructure(outputPath, template, name);
      break;
    case 'bmad':
      await createBmadStructure(outputPath);
      break;
  }

  const readme = generateReadme(name, framework, template);
  fs.writeFileSync(path.join(outputPath, 'README.md'), readme);
  console.log(`${colors.green('✓')} Created ${outputPath}/README.md`);

  const projectYaml = generateProjectYaml(name, framework, template);
  fs.writeFileSync(path.join(outputPath, 'PROJECT.yaml'), projectYaml);
  console.log(`${colors.green('✓')} Created ${outputPath}/PROJECT.yaml`);
}

async function createSpecKitStructure(outputPath: string, template: string): Promise<void> {
  fs.mkdirSync(path.join(outputPath, 'specs'), { recursive: true });
  console.log(`${colors.green('✓')} Created ${outputPath}/specs/`);

  if (template === 'bff-service') {
    fs.mkdirSync(path.join(outputPath, 'src', 'schema'), { recursive: true });
    console.log(`${colors.green('✓')} Created ${outputPath}/src/schema/`);
  } else if (template === 'rest-service') {
    fs.mkdirSync(path.join(outputPath, 'src', 'routes'), { recursive: true });
    console.log(`${colors.green('✓')} Created ${outputPath}/src/routes/`);
  }
}

async function createOpenSpecStructure(outputPath: string, template: string, name: string): Promise<void> {
  if (template === 'openapi') {
    fs.mkdirSync(path.join(outputPath, 'openapi'), { recursive: true });
    const spec = { openapi: '3.0.3', info: { title: name, version: '1.0.0' }, paths: {} };
    fs.writeFileSync(path.join(outputPath, 'openapi', 'spec.yaml'), JSON.stringify(spec, null, 2));
    console.log(`${colors.green('✓')} Created ${outputPath}/openapi/spec.yaml`);
  } else if (template === 'asyncapi') {
    fs.mkdirSync(path.join(outputPath, 'asyncapi'), { recursive: true });
    const spec = { asyncapi: '2.6.0', info: { title: name, version: '1.0.0' }, channels: {} };
    fs.writeFileSync(path.join(outputPath, 'asyncapi', 'spec.yaml'), JSON.stringify(spec, null, 2));
    console.log(`${colors.green('✓')} Created ${outputPath}/asyncapi/spec.yaml`);
  }
}

async function createBmadStructure(outputPath: string): Promise<void> {
  fs.mkdirSync(path.join(outputPath, 'models'), { recursive: true });
  fs.mkdirSync(path.join(outputPath, 'docs'), { recursive: true });
  console.log(`${colors.green('✓')} Created ${outputPath}/models/`);
  console.log(`${colors.green('✓')} Created ${outputPath}/docs/`);
}

function generateReadme(name: string, framework: string, template: string): string {
  return `# ${name}

> Generated with AgentX using ${framework}/${template} template

## Overview

This project was initialized using the AgentX CLI.

## Getting Started

\`\`\`bash
cd ${name}
agentx exec project "Describe the requirements"
\`\`\`

## AI Assistance

Use AgentX to get AI-powered assistance:

\`\`\`bash
# Get help with development
agentx exec project "..."

# Use specific patterns
agentx exec ${template === 'bff-service' ? 'bff' : 'rest-api'} "..."
\`\`\`

## Structure

- \`.ai-config.json\` - AI configuration
- \`PROJECT.yaml\` - Project metadata
- \`README.md\` - This file

## License

MIT
`;
}

function generateProjectYaml(name: string, framework: string, template: string): string {
  return `name: ${name}
version: 1.0.0
framework: ${framework}
template: ${template}
created: ${new Date().toISOString()}

# AI Configuration
ai:
  provider: copilot
  aliases:
    - project

# Dependencies
dependencies: []

# Tags
tags:
  - ${framework}
  - ${template}
`;
}

function displaySuccess(name: string, outputPath: string): void {
  console.log('');
  console.log(colors.green('Project initialized successfully!'));
  console.log('');
  console.log('Next steps:');
  console.log(`  ${colors.cyan('cd')} ${outputPath}`);
  console.log(`  ${colors.cyan('agentx exec project')} "Describe the requirements"`);
}

