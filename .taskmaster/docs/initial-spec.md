# AgentX CLI Output Specification

## Tech Requirement
- Typescript
- Commander.js

## Pre-Execution Settings Display

When executing `agentx exec`, the CLI displays current settings before running the prompt through the AI provider.

### Output Format

```
┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0                                              │
├─────────────────────────────────────────────────────────────┤
│  Provider:    copilot                                       │
│  Alias:       bff                                           │
│  Context:     12 files (24.5 KB)                            │
│  Knowledge:   ~/agentx-enterprise-docs                      │
└─────────────────────────────────────────────────────────────┘

Executing prompt...

[AI Response Here]
```

### Minimal Format (Default)

```
agentx v1.0.0 | copilot | bff | 12 files (24.5 KB)

[AI Response Here]
```

### Verbose Format (`--verbose` or `-v`)

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
│    • reference/bff/architecture/graphql-design.md (4.1 KB)  │
│    • reference/bff/patterns/data-aggregation.md (2.8 KB)    │
│    • patterns/bff-patterns/caching/response-caching.md      │
│    • ... and 8 more files                                   │
└─────────────────────────────────────────────────────────────┘

Executing prompt...

[AI Response Here]
```

### Quiet Format (`--quiet` or `-q`)

No settings output, just the AI response.

```
[AI Response Here]
```

## Examples

### Standard Execution

```bash
$ agentx exec bff "Design a GraphQL schema for user dashboard"

agentx v1.0.0 | copilot | bff | 12 files (24.5 KB)

Here's a GraphQL schema for a user dashboard...
```

### Verbose Execution

```bash
$ agentx exec bff "Design a GraphQL schema" --verbose

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
│    • reference/bff/architecture/graphql-design.md (4.1 KB)  │
│    • reference/bff/patterns/data-aggregation.md (2.8 KB)    │
│    • patterns/bff-patterns/caching/response-caching.md      │
│    • frameworks/open-spec/openapi/components/schemas/...    │
│    • ... and 7 more files                                   │
└─────────────────────────────────────────────────────────────┘

Executing prompt...

Here's a GraphQL schema for a user dashboard...
```

### With Custom Files

```bash
$ agentx exec bff "Explain this" --files ./src/schema.graphql

agentx v1.0.0 | copilot | bff + 1 file | 13 files (28.1 KB)

[AI Response Here]
```

### Init Command Output

```bash
$ agentx init spec-kit --template bff-service --name my-bff

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
  cd my-bff
  agentx exec project "Describe the requirements"
```

### Alias Command Output

```bash
$ agentx alias list

┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0 - Available Aliases                          │
├─────────────────────────────────────────────────────────────┤
│  Alias            │ Files │ Description                     │
├───────────────────┼───────┼─────────────────────────────────┤
│  bff              │    12 │ BFF development context         │
│  bff-graphql      │     8 │ GraphQL-specific BFF            │
│  bff-caching      │     5 │ Caching strategies              │
│  rest-api         │    15 │ REST API development            │
│  api-security     │     9 │ Security patterns               │
│  testing          │     7 │ Testing strategies              │
└─────────────────────────────────────────────────────────────┘
```

```bashlocally if u point 
$ agentx alias show bff

┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0 - Alias: bff                                 │
├─────────────────────────────────────────────────────────────┤
│  Description:  BFF development context                      │
│  Files:        12 files (24.5 KB)                           │
├─────────────────────────────────────────────────────────────┤
│  File Patterns:                                             │
│    • reference/bff/**/*.md                                  │
│    • patterns/bff-patterns/**/*.md                          │
│    • frameworks/spec-kit/templates/bff-service/**/*         │
├─────────────────────────────────────────────────────────────┤
│  Resolved Files:                                            │
│    • reference/bff/architecture/overview.md (3.2 KB)        │
│    • reference/bff/architecture/graphql-design.md (4.1 KB)  │
│    • reference/bff/patterns/data-aggregation.md (2.8 KB)    │
│    • ... and 9 more files                                   │
└─────────────────────────────────────────────────────────────┘
```

### Config Command Output

```bash
$ agentx config show

┌─────────────────────────────────────────────────────────────┐
│  AgentX v1.0.0 - Configuration                              │
├─────────────────────────────────────────────────────────────┤
│  Provider:        copilot                                   │
│  Knowledge Base:  ~/agentx-enterprise-docs                  │
│  Max Context:     32768 bytes                               │
│  Context Format:  hybrid                                    │
│  Cache Enabled:   true                                      │
├─────────────────────────────────────────────────────────────┤
│  Frameworks:                                                │
│    • spec-kit     enabled                                   │
│    • open-spec    enabled                                   │
│    • bmad         enabled                                   │
└─────────────────────────────────────────────────────────────┘
```

```bash
$ agentx config set provider claude

agentx v1.0.0 | config updated

  provider: copilot → claude
```

## Color Coding (Terminal Support)

When terminal supports colors:

- **Header/Borders**: Dim/Gray
- **Labels**: Cyan
- **Values**: White/Default
- **Success**: Green (✓)
- **Warnings**: Yellow
- **Errors**: Red

### Example with Colors (represented)

```
agentx v1.0.0 | copilot | bff | 12 files (24.5 KB)
   [dim]       [cyan]   [white]    [dim]
```

## Error Output

### Missing Alias

```bash
$ agentx exec unknown-alias "Do something"

agentx v1.0.0 | error

  Alias 'unknown-alias' not found.

  Available aliases:
    bff, bff-graphql, bff-caching, rest-api, api-security, testing

  Run 'agentx alias list' for details.
```

### Provider Error

```bash
$ agentx exec bff "Do something"

agentx v1.0.0 | copilot | bff | 12 files (24.5 KB)

  Error: Failed to connect to copilot provider.
  
  Check that GitHub Copilot CLI is installed and authenticated:
    gh auth login
    gh extension install github/gh-copilot
```

### Context Too Large

```bash
$ agentx exec large-alias "Do something"

agentx v1.0.0 | copilot | large-alias | 45 files (128.5 KB)

  Warning: Context size (128.5 KB) exceeds limit (32 KB).
  
  Options:
    • Use --max-context to increase limit
    • Use a more specific alias
    • Exclude large files with --exclude

  Proceeding with truncated context (32 KB)...
```

## Implementation Notes

### Settings Object

```typescript
interface ExecutionSettings {
  version: string;
  provider: string;
  alias: string;
  contextFiles: {
    count: number;
    totalSize: number;
    files: string[];
  };
  knowledgeBase: string;
  additionalFiles?: string[];
}
```

### Output Modes

```typescript
type OutputMode = 'minimal' | 'verbose' | 'quiet';

function displaySettings(settings: ExecutionSettings, mode: OutputMode): void {
  if (mode === 'quiet') return;
  
  if (mode === 'minimal') {
    console.log(`agentx v${settings.version} | ${settings.provider} | ${settings.alias} | ${settings.contextFiles.count} files (${formatSize(settings.contextFiles.totalSize)})`);
    console.log('');
    return;
  }
  
  // Verbose: draw full box
  drawSettingsBox(settings);
}
```


# AgentX Enterprise Documentation & AI Knowledge Base

> 🤖 **AI-Enhanced Enterprise Knowledge Base** - A comprehensive documentation repository designed to power AI-assisted development with `agentx` and other AI tools, focusing on BFF (Backend-for-Frontend) and REST API development.

## 🎯 Purpose

This repository serves as the single source of truth for:
- **Enterprise development standards** and best practices
- **BFF and REST API** architecture patterns and implementation guides
- **AI-enhanced development workflows** with context-aware assistance
- **Project documentation** and service registry
- **Reusable templates** for rapid project bootstrapping

## 🚀 Quick Start

### For Developers

```bash
# Clone the repository
git clone https://github.com/company/agentx-enterprise-docs
cd agentx-enterprise-docs

# Install agentx CLI globally
npm install -g agentx

# Initialize agentx with this knowledge base
agentx init --knowledge-base .

# Start using AI-enhanced development
agentx exec bff "Design a GraphQL schema for user dashboard"
```

### For New Projects

```bash
# Bootstrap a new BFF service
agentx init spec-kit --template bff-service --name my-bff

# Bootstrap a new REST API
agentx init open-spec --template rest-api --name my-api

# Use AI assistance with enterprise context
agentx exec bff-patterns "Implement caching for user data"
```

## 📁 Repository Structure

```
agentx-enterprise-docs/
├── .ai-config/          # AI tool configurations
├── .ai-skills/          # Reusable AI skills
├── .ai-templates/       # Project templates
├── .ai-tools/           # Supporting tools
├── .ai-context/         # Context definitions
├── frameworks/          # Framework docs (spec-kit, open-spec, bmad)
├── reference/           # Reference documentation
│   ├── bff/            # BFF patterns and architecture
│   ├── rest-api/       # REST API design standards
│   ├── frontend/       # Frontend integration guides
│   └── backend/        # Backend service patterns
├── patterns/           # Reusable design patterns
├── how-to/             # Step-by-step guides
├── projects/           # Actual project documentation
└── service-registry/   # Service catalog and dependencies
```

### Hidden Directories (AI Configuration)
- **`.ai-config/`** - Configuration for agentx, Copilot, and other AI tools
- **`.ai-skills/`** - AI skills for specialized tasks (GraphQL design, API aggregation, etc.)
- **`.ai-templates/`** - Project templates with AI configurations
- **`.ai-tools/`** - Validators, generators, and helper scripts
- **`.ai-context/`** - Reusable context definitions for AI assistance

### Visible Directories (Documentation)
- **`reference/`** - Comprehensive guides for BFF, REST APIs, and more
- **`patterns/`** - Proven design patterns for common scenarios
- **`how-to/`** - Practical step-by-step tutorials
- **`frameworks/`** - Documentation for spec-kit, open-spec, and bmad
- **`projects/`** - Documentation for actual running services
- **`service-registry/`** - Service catalog and dependency mapping

## 🤖 AgentX Integration

### What is AgentX?

AgentX is a TypeScript CLI tool that wraps AI assistants (like GitHub Copilot CLI) with enhanced functionality:
- **Context-aware assistance** through alias-based file injection
- **Framework bootstrapping** for spec-kit, open-spec, and bmad
- **Enterprise knowledge integration** from this repository

### Core Commands

| Command | Purpose | Description |
|---------|---------|-------------|
| `exec` | Execute AI prompt with context | Runs AI assistant with alias-injected context files |
| `init` | Initialize framework/project | Bootstrap new projects using frameworks (spec-kit, open-spec, bmad) |
| `alias` | Manage context aliases | List, view, or inspect alias configurations |
| `config` | Update configuration | Set provider, options, and other settings |

### Pre-configured Aliases

| Alias | Purpose | Example Usage |
|-------|---------|---------------|
| `bff` | BFF development context | `agentx exec bff "Design GraphQL schema"` |
| `bff-graphql` | GraphQL-specific BFF | `agentx exec bff-graphql "Add subscription"` |
| `rest-api` | REST API development | `agentx exec rest-api "Design CRUD endpoints"` |
| `bff-aggregation` | API aggregation patterns | `agentx exec bff-aggregation "Combine services"` |
| `bff-caching` | Caching strategies | `agentx exec bff-caching "Implement Redis cache"` |
| `api-security` | Security patterns | `agentx exec api-security "Add OAuth2"` |
| `testing` | Testing strategies | `agentx exec testing "Write integration tests"` |

### Managing Aliases

```bash
# List all available aliases
agentx alias list

# View specific alias details
agentx alias show bff

# Aliases are defined in .ai-config/aliases/*.json
# To add new aliases, edit the JSON files directly
```

### Configuration Management

```bash
# Set the AI provider (copilot, claude, openai)
agentx config set provider copilot

# Set context size limit
agentx config set maxContextSize 32768

# View current configuration
agentx config show
```

## 📚 Documentation Categories

### Reference Documentation
Comprehensive guides and standards:
- **BFF Architecture** - GraphQL design, aggregation patterns, caching
- **REST API Design** - Principles, patterns, security, versioning
- **Frontend Integration** - BFF client patterns, state management
- **Backend Services** - Microservices, databases, messaging

### Design Patterns
Reusable solutions for common problems:
- **BFF Patterns** - Aggregation, caching, resilience, optimization
- **API Patterns** - REST, GraphQL, gRPC patterns
- **Integration Patterns** - Saga, event sourcing, CQRS

### How-To Guides
Step-by-step tutorials:
- Creating new BFF services
- Designing REST APIs
- Implementing caching
- Adding authentication
- Deploying services

### Framework Support
- **[spec-kit](frameworks/spec-kit/)** - Specification-driven development
- **[open-spec](frameworks/open-spec/)** - OpenAPI and AsyncAPI templates
- **[bmad](frameworks/bmad/)** - Business Model and Application Design

## 🏗️ Project Templates

### BFF Templates
- `node-graphql` - Node.js + Apollo GraphQL BFF
- `python-fastapi` - Python FastAPI BFF
- `go` - Go-based BFF

### REST API Templates
- `node-express` - Node.js + Express REST API
- `python-fastapi` - Python FastAPI REST
- `java-spring` - Java Spring Boot API

### Usage
```bash
# Initialize from template
agentx init spec-kit --template bff-service --name my-bff
agentx init open-spec --template rest-api --name my-api
```

## 📋 Project Documentation

Each project in `projects/` contains:
- **README.md** - Overview with links to applicable patterns
- **PROJECT.yaml** - Machine-readable metadata
- **.ai-config.json** - Project-specific AI configuration
- **ARCHITECTURE.md** - Project-specific decisions
- **ENDPOINTS.md** - API contracts and schemas

Projects reference shared documentation rather than duplicating it.

## 🔧 Development Workflow

### 1. Starting a New Project

```bash
# Bootstrap a new BFF service with spec-kit
agentx init spec-kit --template bff-service --name dashboard-bff

# Bootstrap a REST API with OpenAPI
agentx init open-spec --template rest-api --name user-api

# Get AI assistance with design
agentx exec bff "Design a BFF for mobile and web clients"

# Generate initial schemas using the bff-graphql alias
agentx exec bff-graphql "Create GraphQL schema from these requirements"
```

### 2. Working on Existing Projects

```bash
# Navigate to project
cd projects/web-frontend/customer-portal

# Use project-specific context
agentx exec project "Explain the caching strategy"

# Get help with specific patterns
agentx exec project-with-patterns "Optimize the data aggregation"

# Use BFF patterns for implementation
agentx exec bff-patterns "Implement circuit breaker for backend calls"
```

### 3. Following Standards

```bash
# Check API design against enterprise patterns
agentx exec rest-api "Review this API design for REST best practices"

# Get security recommendations
agentx exec api-security "Audit this authentication flow"

# Use testing context for test generation
agentx exec testing "Generate integration tests for this BFF"
```

### 4. Configuration Management

```bash
# Switch AI providers
agentx config set provider claude

# Adjust context size for large projects
agentx config set maxContextSize 65536

# View current settings
agentx config show
```

## 🛠️ Tools and Utilities

The `.ai-tools/` directory contains supporting utilities:

### Generators
- BFF from REST APIs generator
- GraphQL schema from REST converter
- Client SDK generator

### Scripts
- `setup-project.sh` - Initialize new projects
- `ai-context-builder.sh` - Build custom contexts for complex scenarios

### Plugins
- Enhanced context builders for agentx
- Framework-specific helpers
- API documentation generators

## 👥 Contributing

### Adding Documentation
1. Follow the existing structure
2. Reference shared patterns (don't duplicate)
3. Update relevant aliases in `.ai-config/aliases/`
4. Test with agentx

### Adding Projects
1. Create minimal project documentation in `projects/`
2. Reference applicable patterns and guides
3. Update service registry
4. Add project-specific AI configuration

### Adding Skills
1. Create skill in `.ai-skills/`
2. Follow the skill template format
3. Test with multiple AI tools
4. Document usage examples

## 📊 Service Registry

The `service-registry/` contains:
- **services.yaml** - All services and their metadata
- **dependencies.yaml** - Service dependency graph
- **endpoints.yaml** - Consolidated endpoint registry

Query the registry:
```bash
agentx exec service-catalog "Which services depend on user-service?"
agentx exec service-catalog "List all GraphQL endpoints"
```

## 🔗 Links and Resources

### Internal Resources
- [How to use AgentX](how-to/ai-tools/agentx.md)
- [BFF Architecture Guide](reference/bff/architecture/overview.md)
- [REST API Standards](reference/rest-api/design/principles.md)
- [Project Templates](.ai-templates/)

### External Resources
- [AgentX Repository](https://github.com/company/agentx)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [OpenAPI Specification](https://www.openapis.org/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## 🚦 Getting Help

### For AgentX Issues
```bash
# View current configuration
agentx config show

# List available aliases
agentx alias list

# Show specific alias details
agentx alias show <alias>

# Get help
agentx --help
```

### For Documentation
- **Slack**: #agentx-help
- **Wiki**: [Internal Wiki](https://wiki.company.com/agentx)
- **Team**: platform-team@company.com

## 📝 License

This repository is proprietary and confidential. See [LICENSE](LICENSE) for details.

---

## Quick Reference Card

```bash
# Core Commands
agentx exec <alias> "<prompt>"   # Execute with context
agentx init <framework> --template <template> --name <n>
agentx alias list                # List all aliases  
agentx alias show <alias>        # Show alias details
agentx config set <key> <value>  # Update configuration
agentx config show               # View configuration

# Most Common Exec Commands
agentx exec bff "..."           # BFF development help
agentx exec rest-api "..."      # REST API help
agentx exec api-security "..."  # Security guidance
agentx exec testing "..."       # Testing help
agentx exec bff-caching "..."   # Caching strategies
agentx exec bff-graphql "..."   # GraphQL specific

# Framework Initialization
agentx init spec-kit --template bff-service --name my-bff
agentx init spec-kit --template rest-service --name my-api
agentx init open-spec --template openapi --name my-api
agentx init open-spec --template asyncapi --name my-events
agentx init bmad --template business-model --name my-model

# Configuration Examples
agentx config set provider copilot     # Use GitHub Copilot
agentx config set provider claude      # Use Claude
agentx config set maxContextSize 65536 # Increase context size
```

---

**Maintained by**: Platform Team | **Last Updated**: 2024 | **Version**: 1.0.0


## Summary

| Flag | Output |
|------|--------|
| (default) | Single line: version, provider, alias, file count |
| `--verbose`, `-v` | Full box with file list |
| `--quiet`, `-q` | No settings, only AI response |