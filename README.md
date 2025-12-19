# AgentX CLI

> AI-Enhanced Enterprise CLI Tool for context-aware development

AgentX is a TypeScript monorepo providing a CLI tool and VS Code extension that wraps AI assistants (GitHub Copilot, Claude, OpenAI) with enhanced functionality including context-aware assistance through alias-based file injection, **intentions framework** for structured prompts, **personas** for role-based context filtering, and enterprise knowledge integration.

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
- [Personas](#personas)
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
- `--preview` - Open response in browser with copy-to-clipboard button

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

#### Browser Preview

Open AI responses in your browser with a beautiful interface and **copy-to-clipboard** button:

```bash
# Open response in browser
agentx exec bff "Design an API" --preview
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
agentx exec bff "Design API" --file api-design.md --preview
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

1. `.ai-config/config.json` (project-local)
2. `.agentx.json` (project root)
3. `~/.agentx/config.json` (user home)

### Configuration Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `provider` | string | `copilot` | AI provider (`copilot`, `claude`, `openai`) |
| `knowledgeBase` | string | `~/agentx-enterprise-docs` | Path to knowledge base |
| `maxContextSize` | number | `32768` | Maximum context size in bytes |
| `contextFormat` | string | `hybrid` | Context format (`hybrid`, `raw`, `structured`) |
| `cacheEnabled` | boolean | `true` | Enable context caching |
| `frameworks` | object | `{...}` | Framework configurations |
| `outputFormat` | string | `markdown` | Default output format (`toon`, `json`, `markdown`, `raw`) |
| `outputLocation` | string | `./agentx-output` | Default directory for saved outputs |

### Example Configuration

```json
{
  "provider": "copilot",
  "knowledgeBase": "~/agentx-enterprise-docs",
  "maxContextSize": 32768,
  "contextFormat": "hybrid",
  "cacheEnabled": true,
  "frameworks": {
    "spec-kit": { "name": "spec-kit", "enabled": true },
    "open-spec": { "name": "open-spec", "enabled": true },
    "bmad": { "name": "bmad", "enabled": true }
  },
  "outputFormat": "markdown",
  "outputLocation": "./agentx-output"
}
```

---

## Intentions Framework

Intentions provide structured prompt generation with requirement gathering. They transform simple prompts into detailed, context-aware instructions using TOON (Task-Oriented Output Notation) templates.

### How It Works

1. **User provides a simple prompt**: `"event management"`
2. **Intention gathers requirements**: HTTP method, fields, validation rules
3. **TOON template renders**: Structured prompt with all context
4. **AI receives refined prompt**: Complete instructions with patterns and examples

### Intention Definition

Intentions are defined in `.ai-config/intentions/`:

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
  "promptTemplatePath": ".ai-templates/intentions/create-new.prompt.toon"
}
```

### TOON Templates

Templates in `.ai-templates/intentions/` use TOON format for token efficiency:

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

## Personas

Personas enable role-based context filtering. Different team members see only the aliases relevant to their role.

### Persona Definition

Personas are defined in `.ai-config/config.json`:

```json
{
  "personas": [
    {
      "id": "backend",
      "name": "Backend Developer",
      "description": "Java/Spring Boot backend development",
      "aliasFilter": ["be-*", "db-*", "auth-*"]
    },
    {
      "id": "frontend",
      "name": "Frontend Developer",
      "description": "React/TypeScript frontend development",
      "aliasFilter": ["fe-*", "ui-*"]
    },
    {
      "id": "fullstack",
      "name": "Full Stack Developer",
      "description": "Full stack development",
      "aliasFilter": ["*"]
    }
  ],
  "activePersona": "backend"
}
```

### Usage

```bash
# Set active persona
agentx config set activePersona backend

# List aliases (filtered by persona)
agentx alias list
# Shows only: be-endpoint, be-service, db-schema, auth-jwt

# Switch persona
agentx config set activePersona frontend
agentx alias list
# Shows only: fe-component, fe-state, ui-design
```

---

## VS Code Extension

The VS Code extension integrates AgentX with GitHub Copilot Chat.

### Installation

```bash
cd packages/vscode-copilot
pnpm run package
code --install-extension agentx-vscode-1.0.0.vsix
```

### Commands

In VS Code Chat, use `@agentx` followed by:

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

### Completions

The extension provides intelligent completions:
- `be-endpoint` - Execute with alias
- `be-endpoint:create-new` - Execute with alias + intention
- `intention:create-new` - Show intention details
- `persona:backend` - Switch persona

---

## Aliases

Aliases are predefined collections of file patterns that provide context to AI prompts. They are defined as JSON files in the knowledge base directory under `.ai-config/aliases/`.

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

1. Create a JSON file in `<knowledgeBase>/.ai-config/aliases/`:

```bash
mkdir -p ~/agentx-enterprise-docs/.ai-config/aliases
```

2. Add your alias definition:

```json
// ~/agentx-enterprise-docs/.ai-config/aliases/my-alias.json
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
│   │       └── toon/            # TOON conversion utilities
│   ├── cli/                     # @agentx/cli - Command-line interface
│   │   └── src/
│   │       ├── commands/        # CLI commands (exec, init, alias, config)
│   │       └── utils/           # Output formatting, errors
│   └── vscode-copilot/          # VS Code extension
│       └── src/
│           ├── extension.ts     # Extension entry point
│           ├── participant.ts   # Copilot Chat participant
│           └── commands.ts      # VS Code commands
├── example-knowledge-base/      # Example knowledge base
│   ├── .ai-config/
│   │   ├── config.json          # Configuration with personas
│   │   ├── aliases/             # Alias definitions
│   │   └── intentions/          # Intention definitions
│   ├── .ai-templates/
│   │   └── intentions/          # TOON prompt templates
│   ├── .ai-skill/               # AI behavior instructions
│   ├── patterns/                # Architecture patterns
│   └── reference/               # Technical reference docs
├── pnpm-workspace.yaml          # Monorepo configuration
├── tsconfig.base.json           # Shared TypeScript config
└── README.md
```

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
cd example-knowledge-base
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

# Exec with Intentions
agentx exec be-endpoint --intention create-new "event management"
agentx exec be-endpoint -i create-new "event management"    # Interactive
agentx exec be-service --intention refactor "improve error handling"

# Persona Management
agentx config set activePersona backend
agentx config set activePersona frontend
agentx config set activePersona fullstack

# VS Code Extension
@agentx /exec be-endpoint "Design an API"
@agentx /exec be-endpoint --intention create-new "events"
@agentx /intentions list
@agentx /alias list
@agentx /help
```

---

**Maintained by**: Platform Team | **Version**: 1.0.0
