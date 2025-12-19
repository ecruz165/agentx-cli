# AgentX CLI

> AI-Enhanced Enterprise CLI Tool for context-aware development

AgentX is a TypeScript CLI tool that wraps AI assistants (like GitHub Copilot CLI, Claude, OpenAI) with enhanced functionality including context-aware assistance through alias-based file injection, framework bootstrapping, and enterprise knowledge integration.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Commands](#commands)
  - [exec](#exec---execute-ai-prompt-with-context)
  - [init](#init---initialize-new-project)
  - [alias](#alias---manage-context-aliases)
  - [config](#config---manage-configuration)
- [Configuration](#configuration)
- [Aliases](#aliases)
- [Output Modes](#output-modes)
- [Providers](#providers)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

## Quick Start

```bash
# Install globally
npm install -g agentx-cli

# Or install from source
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli
npm install
npm run build
npm link

# View available commands
agentx --help

# View current configuration
agentx config show

# List available aliases
agentx alias list

# Execute a prompt with context (requires aliases configured)
agentx exec bff "Design an API schema for user dashboard"

# Initialize a new project
agentx init spec-kit --template bff-service --name my-bff
```

## Installation

### From npm (when published)

```bash
npm install -g agentx-cli
```

### From Source (Recommended - with Setup Script)

```bash
# Clone the repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Run the setup script (interactive)
npm run setup
# or
./setup.sh

# The setup script will:
# - Install dependencies
# - Build the project
# - Install agentx globally
# - Prompt for provider and knowledgeBase configuration
# - Optionally add npm global bin to PATH
# - Create global config file at ~/.agentx/config.json

# Verify installation
agentx --version
agentx config show
```

### From Source (Manual)

```bash
# Clone the repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally for development
npm link

# Verify installation
agentx --version
```

### Prerequisites

- Node.js 18+
- npm 9+
- For Copilot provider: GitHub CLI with Copilot extension
  ```bash
  gh auth login
  gh extension install github/gh-copilot
  ```

## Commands

### `exec` - Execute AI Prompt with Context

The core command that executes prompts with AI providers, injecting context from aliases.

```bash
agentx exec <alias> "<prompt>" [options]
```

**Arguments:**
- `<alias>` - Context alias to use (e.g., `bff`, `rest-api`)
- `<prompt>` - Prompt to send to AI

**Options:**
- `-v, --verbose` - Show detailed settings with file list
- `-q, --quiet` - Show only AI response
- `-f, --files <files...>` - Additional files to include
- `--max-context <size>` - Override max context size (bytes)
- `--dry-run` - Show what would be executed without calling AI
- `--file <path>` - Save output to file
- `--output-format <format>` - Output format when saving to file: `toon`, `json`, `markdown`, `raw` (default: `markdown`)
- `--no-format` - Disable markdown formatting in console output (show raw markdown)
- `--preview` - Open response in browser with copy-to-clipboard button (OS-aware: macOS, Linux, Windows)

**Examples:**

```bash
# Standard execution (minimal output)
agentx exec bff "Design an API schema for user dashboard"

# Verbose output with file list
agentx exec bff "Design an API schema" --verbose

# Quiet mode - only AI response
agentx exec bff "Explain this code" --quiet

# Include additional files
agentx exec bff "Explain this" --files ./src/schema.ts ./src/types.ts

# Dry run to see what would happen
agentx exec bff "Test prompt" --dry-run

# Save output to file (markdown format by default)
agentx exec bff "Design API" --file response.md

# Save as JSON with metadata
agentx exec bff "Design API" --file response.json --output-format json

# Save as TOON (Token-Oriented Object Notation - compact format for LLMs)
agentx exec bff "Design API" --file response.toon --output-format toon

# Save as raw text (no metadata)
agentx exec bff "Design API" --file response.txt --output-format raw

# Use just filename (saves to configured outputLocation)
agentx exec bff "Design API" --file my-response
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
├── src/
│   ├── index.ts           # CLI entry point
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── config/
│   │   └── index.ts       # Configuration management
│   ├── alias/
│   │   └── index.ts       # Alias management
│   ├── context/
│   │   └── index.ts       # Context file aggregation
│   ├── providers/
│   │   └── index.ts       # AI provider abstraction
│   ├── commands/
│   │   ├── exec.ts        # exec command
│   │   ├── init.ts        # init command
│   │   ├── alias.ts       # alias command
│   │   └── config.ts      # config command
│   └── utils/
│       ├── output.ts      # Terminal output utilities
│       ├── display.ts     # Settings display
│       └── errors.ts      # Error handling
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Link for global testing
npm link
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run with ts-node (development) |
| `npm start` | Run compiled version |
| `npm test` | Run tests |

### Testing Locally

```bash
# Build the project
npm run build

# Test commands
node dist/index.js --help
node dist/index.js config show
node dist/index.js alias list
node dist/index.js exec bff "test" --dry-run
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
agentx exec <alias> "<prompt>"                    # Execute with context
agentx init <framework> -t <template> -n <name>   # Initialize project
agentx alias list                                 # List all aliases
agentx alias show <alias>                         # Show alias details
agentx config show                                # View configuration
agentx config set <key> <value>                   # Update configuration

# Common Exec Examples
agentx exec bff "Design an API schema"
agentx exec rest-api "Create CRUD endpoints"
agentx exec api-security "Add OAuth2 authentication"
agentx exec testing "Write integration tests"

# Init Examples
agentx init spec-kit --template bff-service --name my-bff
agentx init open-spec --template openapi --name my-api
agentx init bmad --template business-model --name my-model

# Configuration
agentx config set provider copilot
agentx config set provider claude
agentx config set maxContextSize 65536
```

---

**Maintained by**: Platform Team | **Version**: 1.0.0
