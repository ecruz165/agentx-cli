"use strict";
/**
 * Init command for AgentX CLI
 * Based on initial-spec.md init command specification
 *
 * Usage:
 *   agentx init spec-kit --template bff-service --name my-bff
 *   agentx init open-spec --template openapi --name my-api
 *   agentx init bmad --template business-model --name my-model
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitCommand = createInitCommand;
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const output_1 = require("../utils/output");
const errors_1 = require("../utils/errors");
const packageJson = require('../../package.json');
/**
 * Supported frameworks
 */
const FRAMEWORKS = ['spec-kit', 'open-spec', 'bmad'];
/**
 * Templates for each framework
 */
const TEMPLATES = {
    'spec-kit': ['bff-service', 'rest-service'],
    'open-spec': ['openapi', 'asyncapi'],
    bmad: ['business-model'],
};
/**
 * Create the init command
 */
function createInitCommand() {
    return new commander_1.Command('init')
        .description('Initialize new project from framework template')
        .argument('<framework>', 'Framework to use (spec-kit, open-spec, bmad)')
        .requiredOption('-t, --template <template>', 'Template to use')
        .requiredOption('-n, --name <name>', 'Project name')
        .option('-o, --output <path>', 'Output directory (default: ./<name>)')
        .action(async (framework, options) => {
        const { template, name, output } = options;
        // Validate framework
        if (!FRAMEWORKS.includes(framework)) {
            (0, errors_1.displayError)('framework-not-found', framework, [...FRAMEWORKS]);
            process.exit(1);
        }
        // Validate template
        const frameworkTemplates = TEMPLATES[framework];
        if (!frameworkTemplates.includes(template)) {
            (0, errors_1.displayError)('template-not-found', template, framework, frameworkTemplates);
            process.exit(1);
        }
        // Determine output path
        const outputPath = output || `./${name}`;
        const absoluteOutputPath = path_1.default.resolve(process.cwd(), outputPath);
        // Check if directory already exists
        if (fs_1.default.existsSync(absoluteOutputPath)) {
            console.log(output_1.colors.red(`Error: Directory '${outputPath}' already exists.`));
            process.exit(1);
        }
        // Display init header
        displayInitHeader(framework, template, name, outputPath);
        // Create project structure
        console.log('Creating project structure...');
        try {
            await createProjectStructure(absoluteOutputPath, framework, template, name);
            displaySuccess(name, outputPath);
        }
        catch (error) {
            console.log(output_1.colors.red(`Error creating project: ${error}`));
            process.exit(1);
        }
    });
}
/**
 * Display init header box (per spec)
 */
function displayInitHeader(framework, template, name, output) {
    const version = packageJson.version;
    const width = 61;
    const lines = [
        `AgentX v${version} - Initialize Project`,
    ];
    const box = (0, output_1.drawBox)(lines, width);
    // Print header
    console.log(box[0]);
    console.log(box[1]);
    console.log(`├${'─'.repeat(width - 2)}┤`);
    // Print details
    console.log(`│  ${output_1.colors.cyan('Framework:'.padEnd(12))} ${framework.padEnd(width - 18)} │`);
    console.log(`│  ${output_1.colors.cyan('Template:'.padEnd(12))} ${template.padEnd(width - 18)} │`);
    console.log(`│  ${output_1.colors.cyan('Name:'.padEnd(12))} ${name.padEnd(width - 18)} │`);
    console.log(`│  ${output_1.colors.cyan('Output:'.padEnd(12))} ${output.padEnd(width - 18)} │`);
    console.log(`└${'─'.repeat(width - 2)}┘`);
    console.log('');
}
/**
 * Create project structure based on framework and template
 */
async function createProjectStructure(outputPath, framework, template, name) {
    // Create main directory
    fs_1.default.mkdirSync(outputPath, { recursive: true });
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/`);
    // Create .ai-config.json
    const aiConfig = {
        name,
        framework,
        template,
        version: '1.0.0',
        provider: 'copilot',
        aliases: ['project'],
    };
    fs_1.default.writeFileSync(path_1.default.join(outputPath, '.ai-config.json'), JSON.stringify(aiConfig, null, 2));
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/.ai-config.json`);
    // Create framework-specific structure
    switch (framework) {
        case 'spec-kit':
            await createSpecKitStructure(outputPath, template, name);
            break;
        case 'open-spec':
            await createOpenSpecStructure(outputPath, template, name);
            break;
        case 'bmad':
            await createBmadStructure(outputPath, template, name);
            break;
    }
    // Create README.md
    const readme = generateReadme(name, framework, template);
    fs_1.default.writeFileSync(path_1.default.join(outputPath, 'README.md'), readme);
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/README.md`);
    // Create PROJECT.yaml
    const projectYaml = generateProjectYaml(name, framework, template);
    fs_1.default.writeFileSync(path_1.default.join(outputPath, 'PROJECT.yaml'), projectYaml);
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/PROJECT.yaml`);
}
/**
 * Create spec-kit specific structure
 */
async function createSpecKitStructure(outputPath, template, name) {
    // Create specs directory
    fs_1.default.mkdirSync(path_1.default.join(outputPath, 'specs'), { recursive: true });
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/specs/`);
    if (template === 'bff-service') {
        // Create BFF-specific files
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'src'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/src/`);
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'src', 'schema'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/src/schema/`);
    }
    else if (template === 'rest-service') {
        // Create REST-specific files
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'src'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/src/`);
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'src', 'routes'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/src/routes/`);
    }
}
/**
 * Create open-spec specific structure
 */
async function createOpenSpecStructure(outputPath, template, name) {
    if (template === 'openapi') {
        // Create OpenAPI structure
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'openapi'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/openapi/`);
        // Create basic OpenAPI spec
        const openApiSpec = {
            openapi: '3.0.3',
            info: {
                title: name,
                version: '1.0.0',
                description: `API specification for ${name}`,
            },
            paths: {},
        };
        fs_1.default.writeFileSync(path_1.default.join(outputPath, 'openapi', 'spec.yaml'), JSON.stringify(openApiSpec, null, 2));
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/openapi/spec.yaml`);
    }
    else if (template === 'asyncapi') {
        // Create AsyncAPI structure
        fs_1.default.mkdirSync(path_1.default.join(outputPath, 'asyncapi'), { recursive: true });
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/asyncapi/`);
        // Create basic AsyncAPI spec
        const asyncApiSpec = {
            asyncapi: '2.6.0',
            info: {
                title: name,
                version: '1.0.0',
                description: `Event specification for ${name}`,
            },
            channels: {},
        };
        fs_1.default.writeFileSync(path_1.default.join(outputPath, 'asyncapi', 'spec.yaml'), JSON.stringify(asyncApiSpec, null, 2));
        console.log(`${output_1.colors.green('✓')} Created ${outputPath}/asyncapi/spec.yaml`);
    }
}
/**
 * Create bmad specific structure
 */
async function createBmadStructure(outputPath, template, name) {
    // Create business model structure
    fs_1.default.mkdirSync(path_1.default.join(outputPath, 'models'), { recursive: true });
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/models/`);
    fs_1.default.mkdirSync(path_1.default.join(outputPath, 'docs'), { recursive: true });
    console.log(`${output_1.colors.green('✓')} Created ${outputPath}/docs/`);
}
/**
 * Generate README content
 */
function generateReadme(name, framework, template) {
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
/**
 * Generate PROJECT.yaml content
 */
function generateProjectYaml(name, framework, template) {
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
/**
 * Display success message with next steps
 */
function displaySuccess(name, outputPath) {
    console.log('');
    console.log(output_1.colors.green('Project initialized successfully!'));
    console.log('');
    console.log('Next steps:');
    console.log(`  ${output_1.colors.cyan('cd')} ${outputPath}`);
    console.log(`  ${output_1.colors.cyan('agentx exec project')} "Describe the requirements"`);
}
//# sourceMappingURL=init.js.map