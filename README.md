# AgentX

> AI-Enhanced Enterprise CLI Tool for context-aware development

AgentX is a TypeScript monorepo providing a CLI tool and VS Code extension that wraps AI assistants (GitHub Copilot, Claude, OpenAI) with enhanced functionality including:

- **Context-aware assistance** through alias-based file injection
- **Intentions framework** for structured prompts with requirement gathering
- **Workflows** for multi-step task orchestration
- **Skills** for reusable executable capabilities
- **Personas** for role-based context filtering and perspective scoping
- **Context history** for tracking and debugging AI interactions
- Enterprise knowledge integration

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Packages](#packages)
- [Commands](#commands)
  - [exec](#exec---execute-ai-prompt-with-context)
  - [init](#init---initialize-new-project)
  - [alias](#alias---manage-context-aliases)
  - [config](#config---manage-configuration)
- [Intentions Framework](#intentions-framework)
- [Workflows](#workflows)
- [Skills](#skills)
- [Personas](#personas)
- [Context History](#context-history)
- [VS Code Extension](#vs-code-extension)
- [Configuration](#configuration)
- [Aliases](#aliases)
- [Output Modes](#output-modes)
- [Providers](#providers)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Quick Start

```bash
# Install from source (pnpm monorepo)
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli
pnpm install
pnpm run build

# Link CLI globally
cd packages/cli && pnpm link --global

# View available commands
agentx --help

# View current configuration
agentx config show

# List available aliases
agentx alias list

# Execute a prompt with context
agentx exec be-endpoint "Design an API for event management"

# Execute with intention (structured prompt)
agentx exec be-endpoint --intention create-new "event management"

# Interactive mode - prompts for missing requirements
agentx exec be-endpoint -i create-new "event management"

# Initialize a new project
agentx init spec-kit --template bff-service --name my-bff
```

## Installation

### From Source (pnpm monorepo)

```bash
# Clone the repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm run build

# Link CLI globally
cd packages/cli && pnpm link --global

# Verify installation
agentx --version
agentx config show
```

### VS Code Extension

```bash
# Build and package the extension
cd packages/vscode-copilot
pnpm run package

# Install the .vsix file in VS Code
code --install-extension agentx-vscode-1.0.0.vsix
```

### Prerequisites

- Node.js 18+
- pnpm 8+
- For Copilot provider: GitHub CLI with Copilot extension
  ```bash
  gh auth login
  gh extension install github/gh-copilot
  ```

## Packages

This is a pnpm monorepo with the following packages:

| Package | Description |
|---------|-------------|
| `@agentx/core` | Shared types, config, context building, providers, intentions |
| `@agentx/cli` | Command-line interface |
| `@agentx/vscode-copilot` | VS Code extension with GitHub Copilot Chat integration |

## Commands

### `exec` - Execute AI Prompt with Context

The core command that executes prompts with AI providers, injecting context from aliases.

```bash
agentx exec <alias> "<prompt>" [options]
agentx exec <alias> --intention <intention> "<prompt>" [options]
agentx exec <alias> -i <intention> "<prompt>" [options]  # Interactive mode
```

**Arguments:**
- `<alias>` - Context alias to use (e.g., `be-endpoint`, `fe-component`)
- `<prompt>` - Prompt to send to AI

**Options:**
- `--intention <id>` - Use an intention for structured prompts
- `-i, --interactive <id>` - Interactive mode: prompts for missing requirements
- `--list-intentions` - List available intentions for the alias
- `-v, --verbose` - Show detailed settings with file list
- `-q, --quiet` - Show only AI response
- `-f, --files <files...>` - Additional files to include
- `--max-context <size>` - Override max context size (bytes)
- `--dry-run` - Show what would be executed without calling AI
- `--file <path>` - Save output to file
- `--output-format <format>` - Output format: `toon`, `json`, `markdown`, `raw` (default: `markdown`)
- `--no-format` - Disable markdown formatting in console output
- `--browser` - Open response in browser with copy-to-clipboard button

**Examples:**

```bash
# Standard execution
agentx exec be-endpoint "Design an API for event management"

# With intention (structured prompt with TOON template)
agentx exec be-endpoint --intention create-new "event management"

# Interactive mode - prompts for missing requirements
agentx exec be-endpoint -i create-new "event management"
# ? What HTTP method? POST
# ? What fields should the request contain? title, date, location
# ✅ Requirements gathered. Executing...

# List available intentions for an alias
agentx exec be-endpoint --list-intentions

# Verbose output with file list
agentx exec be-endpoint "Design an API" --verbose

# Quiet mode - only AI response
agentx exec be-endpoint "Explain this code" --quiet

# Include additional files
agentx exec be-endpoint "Explain this" --files ./src/schema.ts

# Dry run to see what would happen
agentx exec be-endpoint "Test prompt" --dry-run

# Save output to file
agentx exec be-endpoint "Design API" --file response.md

# Save as TOON (compact format for LLMs)
agentx exec be-endpoint "Design API" --file response.toon --output-format toon
```

**Output Formats:**

*Minimal (default):*
```
agentx v1.0.0 | copilot | bff | 12 files (24.5 KB)

[AI Response Here]
```

*Verbose (`--verbose`):*
```
┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0                                              │
├─────────────────────────────────────────────────────────────┤
│  Provider:    copilot                                       │
│  Alias:       bff                                           │
│  Context:     12 files (24.5 KB)                            │
│  Knowledge:   ~/agentx-enterprise-docs                      │
├─────────────────────────────────────────────────────────────┤
│  Context Files:                                             │
│    • reference/bff/architecture/overview.md (3.2 KB)        │
│    • reference/bff/architecture/api-design.md (4.1 KB)      │
│    • ... and 10 more files                                  │
└─────────────────────────────────────────────────────────────┘

Executing prompt...

[AI Response Here]
```

#### Browser Output

Open AI responses in your browser with a beautiful interface and **copy-to-clipboard** button:

```bash
# Open response in browser
agentx exec bff "Design an API" --browser
```

**Features:**
- ✅ **Tabbed interface** - "Agent Request" and "Response" tabs for organized viewing
- ✅ **Beautiful HTML rendering** with syntax highlighting
- ✅ **Copy-to-clipboard button** (top-right corner) - Copy entire markdown
- ✅ **Code block copy buttons** - Hover over any code block to copy just that snippet
- ✅ **User Prompt section** - View the original prompt in Agent Request tab
- ✅ **Context Files viewer** - Click any file to view full contents in new tab
- ✅ **File content display** - See actual file contents with syntax highlighting
- ✅ **File copy button** - Copy entire file contents with one click
- ✅ **OS-aware** - Works on macOS, Linux, and Windows
- ✅ **Keyboard shortcut** - Press `Ctrl/Cmd + Shift + C` to copy full markdown
- ✅ **Responsive design** - Works on mobile and desktop

**Combine with file output:**
```bash
# Save to file AND open in browser
agentx exec bff "Design API" --file api-design.md --browser
```

#### Markdown Rendering

By default, AgentX renders AI responses with **beautiful markdown formatting** in the terminal:
- ✅ **Syntax-highlighted code blocks**
- ✅ **Colored headers and emphasis**
- ✅ **Formatted lists and tables**
- ✅ **Styled blockquotes**

Since AI providers (Copilot, Claude, OpenAI) naturally output markdown, this makes responses much more readable.

**Disable formatting** (show raw markdown):
```bash
agentx exec bff "Explain this code" --no-format
```

**Use cases for `--no-format`:**
- Piping output to other tools
- Copying raw markdown
- Debugging markdown syntax

#### Output File Formats

When using `--file` to save responses, you can choose from multiple formats:

**Markdown (default)**
```markdown
# AgentX AI Response

**Generated:** 2024-01-15T10:30:00.000Z
**Provider:** copilot
**Alias:** bff
**Version:** 1.0.0

## Prompt
...

## Context Files
- `reference/bff/architecture.md`
...

## Response
[AI response content]
```

**JSON**
```json
{
  "metadata": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "provider": "copilot",
    "alias": "bff",
    "version": "1.0.0"
  },
  "request": {
    "prompt": "...",
    "contextFiles": ["..."]
  },
  "response": {
    "content": "..."
  }
}
```

**TOON (Token-Oriented Object Notation)**
```
metadata:
  timestamp: 2024-01-15T10:30:00.000Z
  provider: copilot
  alias: bff
  version: 1.0.0
request:
  prompt: ...
  contextFiles: [...]
response:
  content: ...
```

TOON is a compact, human-readable format designed specifically for LLMs, reducing token usage by ~30-60% compared to JSON.

**Raw**
Plain text output without any metadata or formatting.

---

### `init` - Initialize New Project

Bootstrap new projects using framework templates.

```bash
agentx init <framework> --template <template> --name <name> [options]
```

**Arguments:**
- `<framework>` - Framework to use: `spec-kit`, `open-spec`, `bmad`

**Options:**
- `-t, --template <template>` - Template to use (required)
- `-n, --name <name>` - Project name (required)
- `-o, --output <path>` - Output directory (default: `./<name>`)

**Available Frameworks & Templates:**

| Framework | Templates | Description |
|-----------|-----------|-------------|
| `spec-kit` | `bff-service`, `rest-service` | Specification-driven development |
| `open-spec` | `openapi`, `asyncapi` | OpenAPI and AsyncAPI templates |
| `bmad` | `business-model` | Business Model and Application Design |

**Examples:**

```bash
# Create a BFF service with spec-kit
agentx init spec-kit --template bff-service --name my-bff

# Create a REST API with OpenAPI
agentx init open-spec --template openapi --name my-api

# Create an event-driven service with AsyncAPI
agentx init open-spec --template asyncapi --name my-events

# Create a business model
agentx init bmad --template business-model --name my-model

# Specify custom output directory
agentx init spec-kit --template bff-service --name my-bff --output ./services/my-bff
```

**Output:**
```
┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0 - Initialize Project                         │
├─────────────────────────────────────────────────────────────┤
│  Framework:   spec-kit                                      │
│  Template:    bff-service                                   │
│  Name:        my-bff                                        │
│  Output:      ./my-bff                                      │
└─────────────────────────────────────────────────────────────┘

Creating project structure...
✓ Created ./my-bff/
✓ Created ./my-bff/.ai-config.json
✓ Created ./my-bff/specs/
✓ Created ./my-bff/README.md
✓ Created ./my-bff/PROJECT.yaml

Project initialized successfully!

Next steps:
  cd ./my-bff
  agentx exec project "Describe the requirements"
```

---

### `alias` - Manage Context Aliases

List and inspect available context aliases.

```bash
agentx alias <subcommand>
```

**Subcommands:**

#### `alias list`
List all available aliases.

```bash
agentx alias list
```

**Output:**
```
Available Aliases

NAME                 DESCRIPTION                              PATTERNS
────────────────────────────────────────────────────────────────────────
bff                  BFF development context                  3 patterns
bff-api              API-specific BFF                         2 patterns
rest-api             REST API development                     4 patterns
api-security         Security patterns                        2 patterns

Total: 4 aliases
```

#### `alias show <name>`
Show details of a specific alias.

```bash
agentx alias show <name> [options]
```

**Options:**
- `-r, --resolve` - Resolve and show matching files

**Example:**
```bash
agentx alias show bff --resolve
```

**Output:**
```
┌─────────────────────────────────────────────────────────────┐
│ Alias: bff                                                  │
├─────────────────────────────────────────────────────────────┤
│ Description:                                                │
│ BFF development context                                     │
├─────────────────────────────────────────────────────────────┤
│ Patterns:                                                   │
│   • reference/bff/**/*.md                                   │
│   • patterns/bff-patterns/**/*.md                           │
│   • frameworks/spec-kit/templates/bff-service/**/*          │
├─────────────────────────────────────────────────────────────┤
│ Resolved Files (12):                                        │
│ Total size: 24.5 KB                                         │
├─────────────────────────────────────────────────────────────┤
│   reference/bff/architecture/overview.md           3.2 KB   │
│   reference/bff/architecture/api-design.md         4.1 KB   │
│   reference/bff/patterns/data-aggregation.md       2.8 KB   │
│   ... and 9 more files                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### `config` - Manage Configuration

View and update AgentX configuration.

```bash
agentx config <subcommand>
```

**Subcommands:**

#### `config show`
Display current configuration.

```bash
agentx config show [options]
```

**Options:**
- `-k, --key <key>` - Show specific configuration key

**Example:**
```bash
agentx config show
```

**Output:**
```
AgentX Configuration
────────────────────

Config file: .ai-config/config.json

provider             copilot
knowledgeBase        ~/agentx-enterprise-docs
maxContextSize       32768
contextFormat        hybrid
cacheEnabled         true
frameworks           {"spec-kit": {...}, "open-spec": {...}, "bmad": {...}}
```

#### `config set <key> <value>`
Set a configuration value.

```bash
agentx config set <key> <value>
```

**Example:**
```bash
agentx config set provider claude
```

**Output:**
```
✓ Configuration updated

  provider:
    - copilot
    + claude
```

#### `config reset`
Reset configuration to defaults.

```bash
agentx config reset [options]
```

**Options:**
- `-y, --yes` - Skip confirmation

#### `config path`
Show configuration file path.

```bash
agentx config path
```

---

## Configuration

AgentX looks for configuration files in the following order:

1. `.agentx/config.json` (project-local)
2. `~/.agentx/config.json` (user home)

### Configuration Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `provider` | string | `copilot` | AI provider (`copilot`, `claude`, `openai`, `mock`) |
| `model` | string | `gpt-4` | Default model to use |
| `knowledgeBase` | string | `./default-knowledge-base` | Path to knowledge base |
| `maxContextSize` | number | `65536` | Maximum context size in bytes |
| `contextFormat` | string | `hybrid` | Context format (`hybrid`, `raw`, `structured`) |
| `cacheEnabled` | boolean | `true` | Enable context caching |
| `frameworks` | object | `{...}` | Framework configurations |
| `outputFormat` | string | `markdown` | Default output format (`toon`, `json`, `markdown`, `raw`) |
| `outputLocation` | string | `./agentx-output` | Default directory for saved outputs |
| `toonConversion` | object | `{...}` | TOON conversion settings per content type |

### Example Configuration

```json
{
  "provider": "mock",
  "model": "gpt-4",
  "knowledgeBase": "./default-knowledge-base",
  "maxContextSize": 65536,
  "contextFormat": "hybrid",
  "cacheEnabled": true,
  "frameworks": {
    "spec-kit": { "name": "spec-kit", "enabled": true },
    "open-spec": { "name": "open-spec", "enabled": true },
    "bmad": { "name": "bmad", "enabled": true }
  },
  "outputFormat": "markdown",
  "outputLocation": "./agentx-output",
  "toonConversion": {
    "patterns": true,
    "reference": true,
    "skills": false,
    "templates": false,
    "frameworks": true,
    "intentions": true
  }
}
```

### TOON Conversion Settings

The `toonConversion` object controls which content types are converted to TOON format for token efficiency:

| Key | Description |
|-----|-------------|
| `patterns` | Convert architecture patterns to TOON |
| `reference` | Convert reference docs to TOON |
| `skills` | Convert skill definitions to TOON |
| `templates` | Convert templates to TOON |
| `frameworks` | Convert framework docs to TOON |
| `intentions` | Convert intention configs to TOON |

---

## Intentions Framework

Intentions provide structured prompt generation with requirement gathering. They transform simple prompts into detailed, context-aware instructions using TOON (Task-Oriented Output Notation) templates.

### How It Works

1. **User provides a simple prompt**: `"event management"`
2. **Intention gathers requirements**: HTTP method, fields, validation rules
3. **TOON template renders**: Structured prompt with all context
4. **AI receives refined prompt**: Complete instructions with patterns and examples

### Intention Definition

Intentions are defined in `.agentx/intentions/`:

```json
{
  "id": "create-new",
  "name": "Create New Resource",
  "description": "Generate a new REST endpoint with full CRUD support",
  "applicableAliases": ["be-endpoint", "be-service", "be-api"],
  "requirements": [
    {
      "id": "httpMethod",
      "name": "HTTP Method",
      "type": "enum",
      "options": ["GET", "POST", "PUT", "PATCH", "DELETE"],
      "required": true,
      "question": "What HTTP method?"
    },
    {
      "id": "fields",
      "name": "Request Fields",
      "type": "string",
      "required": true,
      "question": "What fields should the request contain?"
    }
  ],
  "promptTemplatePath": ".agentx/templates/intentions/create-new.prompt.toon"
}
```

### TOON Templates

Templates in `.agentx/templates/intentions/` use TOON format for token efficiency:

```toon
task: Create REST Endpoint
context:
  alias: {{alias}}
  intention: {{intention}}
requirements:
  httpMethod: {{httpMethod}}
  fields: {{fields}}
  resourceName: {{resourceName}}
instructions:
  - Follow patterns in context
  - Use Spring Boot conventions
  - Include validation annotations
  - Add OpenAPI documentation
output:
  format: code
  files:
    - Controller
    - Service
    - DTO
    - Repository
```

### Usage

```bash
# List intentions for an alias
agentx exec be-endpoint --list-intentions

# Execute with intention
agentx exec be-endpoint --intention create-new "event management"

# Interactive mode - prompts for missing requirements
agentx exec be-endpoint -i create-new "event management"
```

---

## Workflows

Workflows define multi-step execution plans that orchestrate skills to accomplish complex tasks. They are referenced by intentions and execute after the user approves a PRD (Product Requirements Document).

### How Workflows Work

```
┌─────────────────────────────────────────────────────────────┐
│  INTENTION                                                  │
│  └── Questions → Answers → PRD → [Approve]                  │
│                                                             │
│  WORKFLOW EXECUTION                                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Context: { entityName: "Student", fields: [...] }   │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Step 1: Entity  │ skills: [generate_entity]              │
│  └────────┬────────┘                                        │
│           │ outputs: { entityPath, className }              │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Step 2: Service │ skills: [generate_service]             │
│  └────────┬────────┘                                        │
│           │ outputs: { servicePath }                        │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Step 3: Tests   │ condition: {{includeTests}}            │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ COMPLETE        │ All outputs collected                  │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Workflow Definition

Workflows are defined in `.agentx/workflows/` as YAML files:

```yaml
# .agentx/workflows/spring-crud-endpoint.yaml
id: spring-crud-endpoint
name: Spring CRUD Endpoint
description: Generates a complete CRUD endpoint with entity, repository, service, and controller

inputs:
  - name: entityName
    type: string
    required: true
    description: Name of the entity (PascalCase)
  - name: fields
    type: array
    required: true
    description: Entity fields as [{name, type}]
  - name: includeTests
    type: boolean
    default: true

steps:
  - id: generate-entity
    name: Generate JPA Entity
    skills: [generate_entity]
    prompt: |
      Create JPA entity {{entityName}} with fields: {{fields}}
    outputs:
      - name: entityPath
        type: string
      - name: className
        type: string

  - id: generate-service
    name: Generate Service
    skills: [generate_service]
    prompt: |
      Create service for {{steps.generate-entity.className}}
    outputs:
      - name: servicePath
        type: string

  - id: generate-tests
    name: Generate Tests
    condition: "{{includeTests}}"
    skills: [generate_tests]
    outputs:
      - name: testPaths
        type: array

outputs:
  - entityPath
  - servicePath
  - testPaths
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Sequential Steps** | Steps execute in order, with outputs available to subsequent steps |
| **Variable Interpolation** | Use `{{variable}}` and `{{steps.stepId.output}}` syntax |
| **Conditional Execution** | Skip steps with `condition: "{{includeTests}}"` |
| **Step PRD Refinement** | Use `refinePrd: true` to gather additional info per step |
| **Error Handling** | `continueOnError: true` and `retryCount: 3` options |
| **Hooks** | `beforeStep` and `afterStep` for pre/post actions |

### Built-in Variables

| Variable | Description |
|----------|-------------|
| `{{workspaceFolder}}` | Workspace root path |
| `{{date}}` | Current date (YYYY-MM-DD) |
| `{{timestamp}}` | Current timestamp |
| `{{workflow.id}}` | Current workflow ID |
| `{{step.id}}` | Current step ID |

### Helpers

```yaml
prompt: |
  Path: /api/{{lowercase entityName}}s
  Class: {{pascalCase serviceName}}Service
```

| Helper | Input | Output |
|--------|-------|--------|
| `lowercase` | `UserAccount` | `useraccount` |
| `uppercase` | `UserAccount` | `USERACCOUNT` |
| `pascalCase` | `user account` | `UserAccount` |
| `camelCase` | `user account` | `userAccount` |
| `kebabCase` | `UserAccount` | `user-account` |
| `snakeCase` | `UserAccount` | `user_account` |

For complete workflow documentation, see [.agentx/workflows/README.md](.agentx/workflows/README.md).

---

## Skills

Skills are reusable executable capabilities that workflow steps invoke. They wrap scripts, Make targets, or LLM prompts with a unified interface for inputs and outputs.

### Skill Types

| Type | Description | Use Case |
|------|-------------|----------|
| `script` | Shell/Python/Node.js scripts | File operations, migrations |
| `make` | Make targets | Build tasks, test execution |
| `llm` | Language model prompts | Code generation |

### Script Skill Example

```yaml
# .agentx/skills/create_migration.yaml
id: create_migration
type: script
name: Create Migration
description: Creates a new Flyway migration file

run: ./scripts/create-migration.sh
shell: bash

args:
  - name: migrationName
    flag: --name
    required: true
  - name: description
    flag: --desc

outputs:
  - name: filePath
    extract: pattern
    pattern: "Created: (.+\\.sql)"

timeout: 30
```

### LLM Skill Example

```yaml
# .agentx/skills/generate_entity.yaml
id: generate_entity
type: llm
name: Generate JPA Entity
description: Generates a JPA entity class

prompt: |
  Create a JPA entity class:

  Entity Name: {{entityName}}
  Package: {{package}}
  Fields: {{fields}}

  Requirements:
  - Use Lombok @Data, @Entity, @Table
  - Include @Id with @GeneratedValue

  Return only Java code.

inputs:
  - name: entityName
    required: true
  - name: package
    required: true
  - name: fields
    required: true

outputs:
  - name: code
    extract: full
  - name: className
    extract: pattern
    pattern: "public class (\\w+)"

temperature: 0.2
```

### Make Skill Example

```yaml
# .agentx/skills/build_module.yaml
id: build_module
type: make
name: Build Module
description: Builds a specific module

target: build-module
makefile: ./Makefile

args:
  - name: module
    env: MODULE
    required: true
  - name: profile
    env: PROFILE
    default: dev

outputs:
  - name: artifactPath
    extract: pattern
    pattern: "Built: (.+\\.jar)"

timeout: 120
```

### Output Extraction

| Mode | Description |
|------|-------------|
| `full` | Entire stdout/response |
| `stdout` | Standard output only |
| `stderr` | Standard error only |
| `pattern` | Regex pattern extraction |
| `json` | JSONPath extraction |
| `file` | Read from file |

For complete skills documentation, see [.agentx/skills/README.md](.agentx/skills/README.md).

---

## Personas

Personas enable role-based context filtering and perspective scoping. Different team members see only the aliases relevant to their role, and the AI responds with the appropriate tone and focus.

### Persona Definition

Personas are defined in `.agentx/personas/` as individual JSON files:

```json
// .agentx/personas/backend.json
{
  "id": "backend",
  "name": "Backend Developer",
  "description": "Spring Boot, Rust auth, database, APIs",
  "aliasPatterns": ["be-*", "api-*", "db-*", "auth-*"],
  "contextProviders": ["tools/providers/java-project-context.ts"],
  "defaultModel": "claude-sonnet",
  "perspective": "You are a senior backend developer focused on building robust, scalable APIs and services.",
  "tone": "technical, precise, security-conscious",
  "focusAreas": ["performance", "security", "error handling", "API design", "database optimization"],
  "avoidAreas": ["frontend concerns", "UI/UX details"]
}
```

### Available Personas

| Persona | ID | Focus Areas |
|---------|-----|-------------|
| **Backend Developer** | `backend` | APIs, databases, security, performance |
| **Frontend Developer** | `frontend` | React, UI components, accessibility, state management |
| **Fullstack Developer** | `fullstack` | End-to-end features, integration, full system understanding |
| **Architect** | `architect` | System design, scalability, trade-offs, ADRs |
| **Designer** | `designer` | UI/UX, design systems, accessibility, user experience |
| **DevOps Engineer** | `devops` | CI/CD, infrastructure, deployment, monitoring |
| **QA Engineer** | `qa` | Testing strategies, test automation, quality assurance |
| **Product Manager** | `product` | Requirements, user stories, feature prioritization |

### Persona Properties

| Property | Description |
|----------|-------------|
| `id` | Unique identifier for the persona |
| `name` | Display name |
| `description` | Brief description of the role |
| `aliasPatterns` | Glob patterns to filter visible aliases |
| `systemPrompt` | Full system prompt injected at context start |
| `perspective` | Brief perspective statement for the AI |
| `tone` | Tone modifiers (e.g., "technical", "casual", "educational") |
| `focusAreas` | Topics to emphasize in responses |
| `avoidAreas` | Topics to de-emphasize or avoid |
| `defaultModel` | Preferred AI model for this persona |
| `contextProviders` | Custom context provider scripts |

### Usage

```bash
# Set active persona
agentx config set activePersona backend

# List aliases (filtered by persona)
agentx alias list
# Shows only: be-endpoint, be-service, db-schema, auth-jwt

# Switch persona
agentx config set activePersona architect
agentx alias list
# Shows only: arch-overview, adr-001
```

### Context Output with Persona

When a persona with perspective settings is active, the context includes a prefix:

```
[SYSTEM]
You are a senior software architect. Focus on high-level design decisions...

[PERSPECTIVE: Architect]
Approach problems from a systems thinking perspective.
Tone: strategic, analytical, forward-thinking
Focus on: system design, scalability, maintainability
Avoid: implementation details, specific code syntax

--- File Contents Below ---
```

---

## Context History

AgentX automatically persists the composed context from every `/exec` command for better debuggability and reproducibility.

### How It Works

Every time you run an `exec` command, AgentX saves the full context to `.agentx/history/`:

```
.agentx/history/
└── 2024-01-15/
    ├── 103045-be-endpoint-create-new/
    │   ├── context.md        # Full composed context
    │   └── manifest.json     # Metadata (alias, intention, files)
    └── 143022-bff-refactor/
        ├── context.md
        └── manifest.json
```

### Manifest Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "alias": "be-endpoint",
  "intention": "create-new",
  "prompt": "event management",
  "files": [
    {"path": "reference/bff/architecture.md", "size": 3245},
    {"path": "patterns/rest-api.md", "size": 1820}
  ],
  "totalSize": 24500,
  "provider": "copilot"
}
```

### VS Code Extension Commands

| Command | Description |
|---------|-------------|
| `AgentX: Open Last Context` | Open the most recent context file |
| `AgentX: Browse History` | Browse all historical contexts |
| `AgentX: Clear History` | Clear context history |

### Benefits

- **Debugging**: See exactly what context was sent to the AI
- **Reproducibility**: Re-run prompts with identical context
- **Optimization**: Analyze context size and composition
- **Audit Trail**: Track what information was used in AI interactions

---

## VS Code Extension

The VS Code extension integrates AgentX with GitHub Copilot Chat and VS Code's Language Model API.

### Installation

```bash
cd packages/vscode-copilot
pnpm run package
code --install-extension agentx-vscode-1.0.0.vsix
```

### Persona Participants

The extension provides role-specific chat participants:

| Participant | Description |
|-------------|-------------|
| `@agentx` | Default participant |
| `@agentx-backend` | Backend development focus |
| `@agentx-frontend` | Frontend development focus |
| `@agentx-fullstack` | Full-stack development |
| `@agentx-architect` | Architecture and design |
| `@agentx-designer` | UI/UX design |
| `@agentx-devops` | DevOps and infrastructure |
| `@agentx-qa` | Quality assurance |
| `@agentx-product` | Product management |

### Chat Commands

```
@agentx /exec be-endpoint "Design an API for events"
@agentx /exec be-endpoint --intention create-new "event management"
@agentx /intentions list
@agentx /intentions create-new
@agentx /alias list
@agentx /alias show be-endpoint
@agentx /config show
@agentx /help
```

### VS Code Commands

| Command | Description |
|---------|-------------|
| `AgentX: Execute with Alias` | Run prompt with selected alias |
| `AgentX: Open Last Context` | View most recent context |
| `AgentX: Browse History` | Browse context history |
| `AgentX: Clear History` | Clear context history |
| `AgentX: Initialize Project` | Scaffold AgentX config |
| `AgentX: Reinitialize` | Add missing config files |

### Completions

The extension provides intelligent completions:
- `be-endpoint` - Execute with alias
- `be-endpoint:create-new` - Execute with alias + intention
- `intention:create-new` - Show intention details
- `persona:backend` - Switch persona

---

## Aliases

Aliases are predefined collections of file patterns that provide context to AI prompts. They are defined as JSON files in `.agentx/aliases/`.

### Alias Definition Format

```json
{
  "name": "bff",
  "description": "BFF development context",
  "patterns": [
    "reference/bff/**/*.md",
    "patterns/bff-patterns/**/*.md",
    "frameworks/spec-kit/templates/bff-service/**/*"
  ]
}
```

### Pre-configured Aliases

| Alias | Purpose | Example Usage |
|-------|---------|---------------|
| `bff` | BFF development context | `agentx exec bff "Design API schema"` |
| `bff-api` | API-specific BFF | `agentx exec bff-api "Add endpoint"` |
| `rest-api` | REST API development | `agentx exec rest-api "Design CRUD endpoints"` |
| `bff-aggregation` | API aggregation patterns | `agentx exec bff-aggregation "Combine services"` |
| `bff-caching` | Caching strategies | `agentx exec bff-caching "Implement Redis cache"` |
| `api-security` | Security patterns | `agentx exec api-security "Add OAuth2"` |
| `testing` | Testing strategies | `agentx exec testing "Write integration tests"` |

### Creating Custom Aliases

1. Create a JSON file in `.agentx/aliases/`:

```bash
mkdir -p .agentx/aliases
```

2. Add your alias definition:

```json
// .agentx/aliases/my-alias.json
{
  "name": "my-alias",
  "description": "My custom context",
  "patterns": [
    "docs/**/*.md",
    "src/**/*.ts"
  ]
}
```

3. Verify it's available:

```bash
agentx alias list
agentx alias show my-alias --resolve
```

---

## Output Modes

AgentX supports three output modes for the `exec` command:

| Mode | Flag | Description |
|------|------|-------------|
| Minimal | (default) | Single line: version, provider, alias, file count |
| Verbose | `--verbose`, `-v` | Full box with file list |
| Quiet | `--quiet`, `-q` | No settings, only AI response |

### Color Coding

When terminal supports colors:

- **Header/Borders**: Dim/Gray
- **Labels**: Cyan
- **Values**: White/Default
- **Success**: Green (✓)
- **Warnings**: Yellow
- **Errors**: Red

Use `--no-color` flag to disable colored output.

---

## Providers

AgentX supports multiple AI providers:

### GitHub Copilot (default)

Requires GitHub CLI with Copilot extension:

```bash
gh auth login
gh extension install github/gh-copilot
```

```bash
agentx config set provider copilot
```

### Claude (Anthropic)

Requires Anthropic API key:

```bash
agentx config set provider claude
agentx config set claudeApiKey <your-api-key>
```

### OpenAI

Requires OpenAI API key:

```bash
agentx config set provider openai
agentx config set openaiApiKey <your-api-key>
```

### Mock (Testing)

For testing without actual AI calls:

```bash
agentx config set provider mock
```

---

## Project Structure

```
agentx-cli/
├── packages/
│   ├── core/                    # @agentx/core - Shared functionality
│   │   └── src/
│   │       ├── types/           # TypeScript interfaces
│   │       ├── config/          # Configuration management
│   │       ├── alias/           # Alias loading and filtering
│   │       ├── context/         # Context file aggregation
│   │       ├── intention/       # Intentions framework
│   │       ├── providers/       # AI provider abstraction
│   │       ├── toon/            # TOON conversion utilities
│   │       ├── bootstrap/       # Project detection and scaffolding
│   │       ├── history/         # Context history management
│   │       ├── plan/            # LLM plan visualization
│   │       └── workflow/        # Workflow execution engine
│   ├── cli/                     # @agentx/cli - Command-line interface
│   │   └── src/
│   │       ├── commands/        # CLI commands (exec, init, alias, config)
│   │       └── utils/           # Output formatting, errors
│   └── vscode-copilot/          # VS Code extension
│       └── src/
│           ├── extension.ts     # Extension entry point
│           ├── participant.ts   # Copilot Chat participant
│           ├── commands.ts      # VS Code commands
│           └── vscode-lm-provider.ts  # VS Code LM API provider
├── default-knowledge-base/      # Bundled team-shared resources
│   └── .context/                # Default context resources
│       ├── aliases/             # Default alias definitions
│       ├── intentions/          # Default intention definitions
│       ├── personas/            # Default persona definitions
│       ├── workflows/           # Default workflow definitions
│       ├── skills/              # Default skill definitions
│       ├── templates/           # Default prompt templates
│       ├── scripts/             # Default scripts for skills
│       ├── libraries/           # Reference libraries (Spring Boot, etc.)
│       ├── frameworks/          # Framework templates
│       └── providers/           # Context provider scripts
├── .agentx/                     # Project-specific configuration
│   ├── config.json              # Main configuration
│   ├── history/                # Context history (auto-generated)
│   └── plans/                  # LLM plans (auto-generated)
├── pnpm-workspace.yaml          # Monorepo configuration
├── tsconfig.base.json           # Shared TypeScript config
└── README.md
```

### Directory Structure

AgentX uses a two-tier structure:

**Bundled Defaults** (`default-knowledge-base/.context/`):
Team-shared resources packaged with the CLI.

| Directory | Purpose |
|-----------|---------|
| `aliases/` | Default context alias definitions |
| `intentions/` | Default structured prompt intentions |
| `personas/` | Default role-based personas |
| `workflows/` | Default multi-step workflows |
| `skills/` | Default reusable skills |
| `templates/` | Default prompt templates |
| `scripts/` | Default scripts invoked by skills |
| `libraries/` | Reference libraries (migrations, docs) |
| `frameworks/` | Framework templates |
| `providers/` | Context provider scripts |

**Project-Specific** (`.agentx/` in each project):
Project-local configuration and state.

| Directory | Purpose |
|-----------|---------|
| `config.json` | Project configuration |
| `history/` | Auto-generated context history |
| `plans/` | Auto-generated LLM plan files |

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test

# Link CLI for global testing
cd packages/cli && pnpm link --global
```

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build all packages |
| `pnpm test` | Run tests for all packages |
| `pnpm run clean` | Clean build artifacts |

### Package-specific Development

```bash
# Work on core package
cd packages/core
pnpm run build

# Work on CLI
cd packages/cli
pnpm run build
pnpm link --global

# Work on VS Code extension
cd packages/vscode-copilot
pnpm run build
pnpm run package  # Creates .vsix file
```

### Testing Locally

```bash
# Build all packages
pnpm run build

# Test CLI commands
agentx --help
agentx config show
agentx alias list
agentx exec be-endpoint "test" --dry-run
agentx exec be-endpoint --list-intentions

# Test with example knowledge base
cd default-knowledge-base
agentx alias list
agentx exec be-endpoint --intention create-new "event management" --dry-run
```

---

## Error Handling

AgentX provides clear error messages with suggestions:

### Missing Alias
```
agentx v1.0.0 | error

  Alias 'unknown-alias' not found.

  Available aliases:
    bff, bff-api, rest-api, api-security

  Run 'agentx alias list' for details.
```

### Provider Error
```
agentx v1.0.0 | error

  Error: Failed to connect to copilot provider.

  Check that GitHub Copilot CLI is installed and authenticated:
    gh auth login
    gh extension install github/gh-copilot
```

### Context Too Large
```
agentx v1.0.0 | copilot | warning

  Warning: Context size (128.5 KB) exceeds limit (32 KB).

  Options:
    • Use --max-context to increase limit
    • Use a more specific alias
    • Exclude large files with --exclude

  Proceeding with truncated context (32 KB)...
```

---

## License

ISC

---

## Quick Reference

```bash
# Core Commands
agentx exec <alias> "<prompt>"                              # Execute with context
agentx exec <alias> --intention <id> "<prompt>"             # Execute with intention
agentx exec <alias> -i <id> "<prompt>"                      # Interactive mode
agentx exec <alias> --list-intentions                       # List intentions
agentx init <framework> -t <template> -n <name>             # Initialize project
agentx alias list                                           # List aliases
agentx alias show <alias>                                   # Show alias details
agentx config show                                          # View configuration
agentx config set <key> <value>                             # Update configuration

# Exec with Intentions & Workflows
agentx exec be-endpoint --intention create-new "event management"
agentx exec be-endpoint -i create-new "event management"    # Interactive
agentx exec be-service --intention refactor "improve error handling"

# Output Options
agentx exec bff "Design API" --browser                      # Open in browser
agentx exec bff "Design API" --file response.md             # Save to file
agentx exec bff "Design API" --output-format toon           # TOON format

# Persona Management
agentx config set activePersona backend
agentx config set activePersona frontend
agentx config set activePersona architect

# VS Code Extension - Chat Participants
@agentx /exec be-endpoint "Design an API"
@agentx-backend /exec be-service "Add authentication"
@agentx-architect /exec arch-review "Evaluate microservices approach"
@agentx-frontend /exec fe-component "Create login form"

# VS Code Extension - Commands
@agentx /intentions list
@agentx /alias list
@agentx /help
```

### Key Directories

```bash
# Project-specific (in your project)
.agentx/config.json   # Project configuration
.agentx/history/     # Context history (auto-generated)

# Bundled defaults (in CLI package)
default-knowledge-base/.context/aliases/      # Default alias definitions
default-knowledge-base/.context/intentions/   # Default structured intentions
default-knowledge-base/.context/personas/     # Default role-based personas
default-knowledge-base/.context/workflows/    # Default multi-step workflows
default-knowledge-base/.context/skills/       # Default reusable skills
default-knowledge-base/.context/libraries/    # Reference libraries
default-knowledge-base/.context/providers/    # Context provider scripts
```

---

**Maintained by**: Platform Team | **Version**: 1.0.0
