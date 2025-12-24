/**
 * Project scaffolding utilities
 * Creates .agentx structure based on project type
 */

import fs from 'fs';
import path from 'path';
import {
  ScaffoldOptions,
  ScaffoldResult,
  ProjectType,
  ProjectTemplates,
  AliasTemplateInput,
  IntentionTemplateInput,
  PersonaTemplateInput,
} from './types';
import { AgentXConfig, ContextFormat } from '../types';

/**
 * Default templates for different project types
 */
export const DEFAULT_TEMPLATES: ProjectTemplates = {
  typescript: {
    aliases: [
      {
        name: 'fe-component',
        description: 'React/frontend component development',
        patterns: [
          'patterns/component-*.md',
          'reference/react.md',
          '.ai-skill/coding-standards.md',
          '.ai-templates/react-component.md',
        ],
      },
      {
        name: 'fe-state',
        description: 'Frontend state management',
        patterns: [
          'patterns/state-*.md',
          'reference/state-management.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'fe-test',
        description: 'Frontend testing - unit, integration, E2E',
        patterns: [
          'patterns/testing-*.md',
          '.ai-templates/test-*.md',
          '.ai-skill/testing-standards.md',
        ],
      },
      {
        name: 'be-api',
        description: 'Backend API development - Express, Fastify, NestJS',
        patterns: [
          'patterns/api-design.md',
          'patterns/error-handling.md',
          '.ai-templates/api-*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-service',
        description: 'Backend service layer - business logic',
        patterns: [
          'patterns/service-*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-test',
        description: 'Backend testing - unit, integration',
        patterns: [
          'patterns/testing-*.md',
          '.ai-templates/jest-*.md',
          '.ai-skill/testing-standards.md',
        ],
      },
    ],
    intentions: [],
    sourceDirs: ['src', 'src/components', 'src/hooks', 'src/services', 'tests'],
  },
  java: {
    aliases: [
      {
        name: 'be-api',
        description: 'Backend REST API development - controllers, DTOs, validation',
        patterns: [
          'patterns/api-design.md',
          'patterns/error-handling.md',
          '.ai-templates/spring-controller.md',
          '.ai-templates/dto-template.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-service',
        description: 'Backend service layer - business logic',
        patterns: [
          'patterns/service-*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-repository',
        description: 'Data access layer - JPA repositories, queries',
        patterns: [
          'patterns/repository-*.md',
          '.ai-templates/jpa-*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-test',
        description: 'Backend testing - JUnit, Mockito, integration tests',
        patterns: [
          'patterns/testing-*.md',
          '.ai-templates/junit-*.md',
          '.ai-skill/testing-standards.md',
        ],
      },
      {
        name: 'db-schema',
        description: 'Database schema and migrations',
        patterns: [
          'patterns/database-*.md',
          '.ai-templates/jpa-*.md',
          'reference/database.md',
        ],
      },
      {
        name: 'auth-jwt',
        description: 'JWT authentication and authorization',
        patterns: [
          'patterns/auth-*.md',
          '.ai-templates/security-*.md',
          'reference/security.md',
        ],
      },
    ],
    intentions: [],
    sourceDirs: [
      'src/main/java',
      'src/main/resources',
      'src/test/java',
      'src/test/resources',
    ],
  },
  hybrid: {
    aliases: [
      // Frontend aliases
      {
        name: 'fe-component',
        description: 'React/frontend component development',
        patterns: [
          'patterns/component-*.md',
          'reference/react.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'fe-test',
        description: 'Frontend testing',
        patterns: [
          'patterns/testing-frontend.md',
          '.ai-templates/jest-*.md',
        ],
      },
      // Backend aliases
      {
        name: 'be-api',
        description: 'Backend REST API development',
        patterns: [
          'patterns/api-design.md',
          '.ai-templates/spring-controller.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-service',
        description: 'Backend service layer',
        patterns: [
          'patterns/service-*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
      {
        name: 'be-test',
        description: 'Backend testing',
        patterns: [
          'patterns/testing-backend.md',
          '.ai-templates/junit-*.md',
        ],
      },
    ],
    intentions: [],
    sourceDirs: [],
  },
  unknown: {
    // Default to TypeScript-like aliases for unknown project types
    aliases: [
      {
        name: 'general',
        description: 'General development context',
        patterns: [
          'patterns/*.md',
          '.ai-skill/coding-standards.md',
        ],
      },
    ],
    intentions: [],
    sourceDirs: ['src'],
  },
};

/**
 * Default configuration for new projects
 * Shared resources (aliases, personas, skills, etc.) come from bundled defaults
 */
function getDefaultConfig(_projectType: ProjectType, _projectName?: string): AgentXConfig {
  return {
    provider: 'copilot',
    model: 'claude-opus-4.5',
    knowledgeBase: '.',
    maxContextSize: 65536,
    contextFormat: 'hybrid' as ContextFormat,
    cacheEnabled: true,
    outputFormat: 'markdown',
    toonConversion: {
      patterns: true,
      reference: true,
      skills: false,
      templates: false,
      frameworks: true,
      intentions: true,
    },
  };
}

/**
 * Get default personas based on project type
 */
function getDefaultPersonas(projectType: ProjectType): PersonaTemplateInput[] {
  const backendPersona: PersonaTemplateInput = {
    id: 'backend',
    name: 'Backend Developer',
    description: projectType === 'java' ? 'Spring Boot, APIs, database' : 'Node.js APIs, services',
    aliasPatterns: ['be-*', 'api-*', 'db-*', 'auth-*'],
    perspective: 'You are a senior backend developer focused on building robust, scalable APIs and services.',
    tone: 'technical, precise, security-conscious',
    focusAreas: ['performance', 'security', 'error handling', 'API design'],
    avoidAreas: ['frontend concerns', 'UI/UX details'],
  };

  const frontendPersona: PersonaTemplateInput = {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'React, components, state management',
    aliasPatterns: ['fe-*', 'ui-*'],
    perspective: 'You are a senior frontend developer focused on building responsive, accessible user interfaces.',
    tone: 'user-focused, accessibility-aware, performance-conscious',
    focusAreas: ['user experience', 'accessibility', 'responsive design', 'component reusability'],
    avoidAreas: ['backend implementation details', 'database schemas'],
  };

  const fullstackPersona: PersonaTemplateInput = {
    id: 'fullstack',
    name: 'Full Stack Developer',
    description: 'All platform development',
    aliasPatterns: ['*'],
    perspective: 'You are a full stack developer with expertise across the entire application stack.',
    tone: 'balanced, pragmatic, integration-focused',
    focusAreas: ['end-to-end features', 'integration', 'system design'],
    avoidAreas: [],
  };

  const qaPersona: PersonaTemplateInput = {
    id: 'qa',
    name: 'QA Engineer',
    description: 'Testing, quality assurance',
    aliasPatterns: ['test-*', 'qa-*', 'be-test', 'fe-test'],
    perspective: 'You are a senior QA engineer focused on ensuring software quality.',
    tone: 'detail-oriented, systematic, quality-focused',
    focusAreas: ['test coverage', 'edge cases', 'regression testing'],
    avoidAreas: ['implementation details'],
  };

  const architectPersona: PersonaTemplateInput = {
    id: 'architect',
    name: 'Solution Architect',
    description: 'System design, architecture patterns, technical decisions',
    aliasPatterns: ['arch-*', 'design-*', '*'],
    perspective: 'You are a senior solution architect focused on designing scalable, maintainable systems.',
    tone: 'strategic, trade-off aware, forward-thinking',
    focusAreas: ['system design', 'scalability', 'maintainability', 'architecture patterns'],
    avoidAreas: ['low-level implementation details'],
  };

  const devopsPersona: PersonaTemplateInput = {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'CI/CD, infrastructure, deployment, monitoring',
    aliasPatterns: ['devops-*', 'infra-*', 'deploy-*', 'ci-*'],
    perspective: 'You are a senior DevOps engineer focused on reliable, automated infrastructure and deployments.',
    tone: 'automation-focused, reliability-conscious, process-oriented',
    focusAreas: ['automation', 'reliability', 'monitoring', 'security', 'performance'],
    avoidAreas: ['application business logic'],
  };

  if (projectType === 'java') {
    return [backendPersona, qaPersona, architectPersona, devopsPersona, fullstackPersona];
  } else if (projectType === 'typescript') {
    return [frontendPersona, backendPersona, qaPersona, architectPersona, devopsPersona, fullstackPersona];
  } else {
    return [frontendPersona, backendPersona, qaPersona, architectPersona, devopsPersona, fullstackPersona];
  }
}

/**
 * Get the .agentx directory path for a project
 */
export function getAiConfigPath(projectPath: string): string {
  return path.join(path.resolve(projectPath), '.agentx');
}

/**
 * Check if .agentx already exists
 */
export function hasAiConfig(projectPath: string): boolean {
  return fs.existsSync(getAiConfigPath(projectPath));
}

/**
 * Generate alias JSON files from templates
 */
export function generateAliasFiles(
  aliases: AliasTemplateInput[],
  aliasDir: string,
  overwrite: boolean = false
): { created: string[]; skipped: string[] } {
  const result = { created: [] as string[], skipped: [] as string[] };

  // Ensure directory exists
  if (!fs.existsSync(aliasDir)) {
    fs.mkdirSync(aliasDir, { recursive: true });
  }

  for (const alias of aliases) {
    const filePath = path.join(aliasDir, `${alias.name}.json`);

    if (fs.existsSync(filePath) && !overwrite) {
      result.skipped.push(filePath);
      continue;
    }

    const content = JSON.stringify(
      {
        name: alias.name,
        description: alias.description,
        patterns: alias.patterns,
      },
      null,
      2
    );

    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    result.created.push(filePath);
  }

  return result;
}

/**
 * Generate intention JSON files from templates
 */
export function generateIntentionFiles(
  intentions: IntentionTemplateInput[],
  intentionDir: string,
  overwrite: boolean = false
): { created: string[]; skipped: string[] } {
  const result = { created: [] as string[], skipped: [] as string[] };

  // Ensure directory exists
  if (!fs.existsSync(intentionDir)) {
    fs.mkdirSync(intentionDir, { recursive: true });
  }

  for (const intention of intentions) {
    const filePath = path.join(intentionDir, `${intention.id}.json`);

    if (fs.existsSync(filePath) && !overwrite) {
      result.skipped.push(filePath);
      continue;
    }

    const content = JSON.stringify(intention, null, 2);
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    result.created.push(filePath);
  }

  return result;
}

/**
 * Generate persona JSON files from templates
 */
export function generatePersonaFiles(
  personas: PersonaTemplateInput[],
  personaDir: string,
  overwrite: boolean = false
): { created: string[]; skipped: string[] } {
  const result = { created: [] as string[], skipped: [] as string[] };

  // Ensure directory exists
  if (!fs.existsSync(personaDir)) {
    fs.mkdirSync(personaDir, { recursive: true });
  }

  for (const persona of personas) {
    const filePath = path.join(personaDir, `${persona.id}.json`);

    if (fs.existsSync(filePath) && !overwrite) {
      result.skipped.push(filePath);
      continue;
    }

    const content = JSON.stringify(persona, null, 2);
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    result.created.push(filePath);
  }

  return result;
}

/**
 * Generate default config.json for a project
 */
export function generateDefaultConfig(
  projectType: ProjectType,
  projectName?: string,
  configPath?: string,
  overwrite: boolean = false
): boolean {
  const targetPath = configPath || path.join(process.cwd(), '.agentx', 'config.json');

  if (fs.existsSync(targetPath) && !overwrite) {
    return false;
  }

  // Ensure directory exists
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const config = getDefaultConfig(projectType, projectName);
  const content = JSON.stringify(config, null, 2);
  fs.writeFileSync(targetPath, content + '\n', 'utf-8');

  return true;
}

/**
 * Create source directory structure if missing
 */
export function createSourceDirectories(
  basePath: string,
  projectType: ProjectType
): string[] {
  const templates = DEFAULT_TEMPLATES[projectType] || DEFAULT_TEMPLATES.typescript;
  const created: string[] = [];

  for (const dir of templates.sourceDirs) {
    const fullPath = path.join(basePath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      created.push(fullPath);
    }
  }

  return created;
}

/**
 * Create knowledge base directory structure
 */
function createKnowledgeBaseStructure(basePath: string): string[] {
  const created: string[] = [];

  const directories = [
    'patterns',
    'reference',
    '.ai-skill',
    '.ai-templates',
  ];

  for (const dir of directories) {
    const fullPath = path.join(basePath, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      created.push(fullPath);
    }
  }

  // Create placeholder files
  const placeholders: Record<string, string> = {
    'patterns/.gitkeep': '',
    'reference/.gitkeep': '',
    '.ai-skill/coding-standards.md': `# Coding Standards

## General Guidelines

- Follow consistent naming conventions
- Write self-documenting code
- Keep functions small and focused
- Handle errors appropriately

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No security vulnerabilities
`,
    '.ai-templates/.gitkeep': '',
  };

  for (const [relativePath, content] of Object.entries(placeholders)) {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      created.push(fullPath);
    }
  }

  return created;
}

/**
 * Scaffold the .agentx structure for a project
 * Only creates project-specific config - shared resources come from bundled defaults
 */
export async function scaffoldProject(
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const result: ScaffoldResult = {
    success: false,
    createdDirectories: [],
    createdFiles: [],
    skippedPaths: [],
    errors: [],
  };

  try {
    const basePath = path.resolve(options.basePath);
    const aiConfigPath = getAiConfigPath(basePath);

    // Create .agentx directory
    if (!fs.existsSync(aiConfigPath)) {
      fs.mkdirSync(aiConfigPath, { recursive: true });
      result.createdDirectories.push(aiConfigPath);
    }

    // Generate config.json with project-specific settings
    const configPath = path.join(aiConfigPath, 'config.json');
    const configCreated = generateDefaultConfig(
      options.projectType,
      undefined,
      configPath,
      options.overwrite
    );
    if (configCreated) {
      result.createdFiles.push(configPath);
    } else if (fs.existsSync(configPath)) {
      result.skippedPaths.push(configPath);
    }

    // Optionally create source directories
    if (options.createSourceDirs) {
      const srcDirs = createSourceDirectories(basePath, options.projectType);
      result.createdDirectories.push(...srcDirs);
    }

    result.success = true;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}
