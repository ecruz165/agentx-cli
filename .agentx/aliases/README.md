# Aliases

Aliases are context bundles that group related documentation and available intentions for a specific domain. They work alongside personas to provide focused, domain-specific AI assistance.

## Overview

**VS Code Copilot Chat:**
```
@agentx-<persona> /exec:<alias>:<intention> <prompt>
```

**CLI:**
```
agentx -p <persona> exec <alias> -i <intention> <prompt>
```

**Examples:**
```
# VS Code
@agentx-backend /exec:spring:add-api-endpoint Create a Student entity with name and email

# CLI
agentx -p backend exec spring -i add-api-endpoint "Create a Student entity with name and email"
```

## Directory Structure

```
.agentx/aliases/
├── spring.yaml
├── react.yaml
├── devops.yaml
└── README.md
```

---

## Schema

```yaml
# Required
id: string                    # Unique identifier (used in exec:<alias>:intention)
name: string                  # Display name
description: string           # What this alias provides context for

# Context
contextFiles:                 # Markdown files to include as context
  - string

# Available intentions
intentions:                   # Intentions available under this alias
  - string
```

---

## Examples

### Basic Alias

```yaml
# .agentx/aliases/spring.yaml
id: spring
name: Spring Boot
description: Spring Boot backend development context

contextFiles:
  - docs/spring-conventions.md
  - docs/database-schema.md

intentions:
  - add-api-endpoint
  - add-migration
  - add-service
```

**Usage:**
```
@agentx-backend /exec:spring:add-api-endpoint Create a Student entity
```

### Frontend Alias

```yaml
# .agentx/aliases/react.yaml
id: react
name: React Frontend
description: React component and feature development context

contextFiles:
  - docs/component-guidelines.md
  - docs/styling-conventions.md
  - docs/state-management.md

intentions:
  - add-component
  - add-feature-module
  - add-hook
```

**Usage:**
```
@agentx-frontend /exec:react:add-component Create a DataTable with sorting
```

### DevOps Alias

```yaml
# .agentx/aliases/devops.yaml
id: devops
name: DevOps
description: Infrastructure and deployment context

contextFiles:
  - docs/infrastructure.md
  - docs/deployment-runbook.md
  - kubernetes/README.md

intentions:
  - add-helm-chart
  - add-github-action
  - add-terraform-module
```

**Usage:**
```
@agentx-devops /exec:devops:add-helm-chart Create chart for the orders service
```

### Multi-Stack Alias

```yaml
# .agentx/aliases/fullstack.yaml
id: fullstack
name: Full Stack
description: End-to-end feature development context

contextFiles:
  - docs/api-contracts.md
  - docs/frontend-backend-integration.md

intentions:
  - add-api-endpoint
  - add-react-feature
  - add-e2e-test
```

**Usage:**
```
@agentx-fullstack /exec:fullstack:add-api-endpoint Create user registration flow
```

---

## Usage

### Command Structure

**VS Code Copilot Chat:**
```
@agentx-<persona> /exec:<alias>:<intention> <user-prompt>
```

**CLI:**
```
agentx -p <persona> exec <alias> -i <intention> "<user-prompt>"
```

### Full Examples

```bash
# VS Code: Backend persona + Spring context + add-api-endpoint intention
@agentx-backend /exec:spring:add-api-endpoint Create a Student entity with name, email, enrolledAt

# CLI equivalent
agentx -p backend exec spring -i add-api-endpoint "Create a Student entity with name, email, enrolledAt"
```

```bash
# VS Code: Frontend persona + React context + add-component intention
@agentx-frontend /exec:react:add-component Create a sortable DataTable component

# CLI equivalent
agentx -p frontend exec react -i add-component "Create a sortable DataTable component"
```

### Without Intention (Context Only)

```bash
# VS Code: Just activate persona + alias context for conversation
@agentx-backend /exec:spring How should I structure my service layer?

# CLI
agentx -p backend exec spring "How should I structure my service layer?"
```

### List Available Intentions

```bash
# VS Code
@agentx-backend /list:spring

# CLI
agentx -p backend list spring
```

---

## Context Inheritance

When you invoke `@agentx-<persona> /exec:<alias>:<intention>`, context is layered:

```
┌─────────────────────────────────────────────────────────────┐
│  Final Context                                              │
├─────────────────────────────────────────────────────────────┤
│  1. Persona systemPrompt + contextFiles                     │
│  2. Alias contextFiles                                      │
│  3. Intention-specific context (if running intention)       │
│  4. User-provided prompt                                    │
└─────────────────────────────────────────────────────────────┘
```

**Example:** `@agentx-backend /exec:spring:add-api-endpoint Create Student entity`

```yaml
# Resolved context includes:
# 1. backend persona  → systemPrompt + docs/architecture.md
# 2. spring alias     → docs/spring-conventions.md, docs/database-schema.md
# 3. intention        → workflow-specific context
# 4. user prompt      → "Create Student entity"
```

---

## Context Files

### Relative Paths

Paths are relative to workspace root:

```yaml
contextFiles:
  - docs/architecture.md           # ./docs/architecture.md
  - src/main/resources/schema.sql  # ./src/main/resources/schema.sql
```

### Directory References

Reference a directory to include all markdown files:

```yaml
contextFiles:
  - docs/adr/                      # All .md files in ./docs/adr/
```

### Glob Patterns

```yaml
contextFiles:
  - docs/**/*.md                   # All .md files recursively
  - src/**/README.md               # All README.md files in src
```

---

## Relationship to Personas

Personas and aliases are separate but complementary:

| Concept | Purpose | Selected Via |
|---------|---------|--------------|
| **Persona** | AI behavior + expertise | `@agentx-<persona>` or `-p <persona>` |
| **Alias** | Domain context + intentions | `/exec:<alias>` or `exec <alias>` |

A persona defines *how* the AI thinks. An alias defines *what* domain context to use.

**Same alias, different personas:**
```bash
# Backend expert analyzing Spring code
@agentx-backend /exec:spring:add-api-endpoint Create User entity

# Architect reviewing Spring code
@agentx-architect /exec:spring:add-api-endpoint Create User entity with audit trail
```

**Same persona, different aliases:**
```bash
# Backend expert with Spring context
@agentx-backend /exec:spring:add-api-endpoint Create User entity

# Backend expert with GraphQL context
@agentx-backend /exec:graphql:add-resolver Create User resolver
```

### Decoupled by Design

```yaml
# .agentx/personas/backend.yaml — defines expertise
id: backend
systemPrompt: |
  You are a senior backend developer...
contextFiles:
  - docs/architecture.md

# .agentx/aliases/spring.yaml — defines domain context
id: spring
contextFiles:
  - docs/spring-conventions.md
intentions:
  - add-api-endpoint

# .agentx/aliases/graphql.yaml — different domain, same persona can use
id: graphql
contextFiles:
  - docs/graphql-schema.md
intentions:
  - add-resolver
```

---

## Intentions Scoping

Aliases scope which intentions are available:

```yaml
# .agentx/aliases/spring.yaml
intentions:
  - add-api-endpoint    # Available: /exec:spring:add-api-endpoint
  - add-migration       # Available: /exec:spring:add-migration
  - add-service         # Available: /exec:spring:add-service
  # add-component NOT available under spring alias
```

If an intention is not listed, it won't appear in suggestions for that alias.

### Unrestricted Alias

Omit `intentions` to allow all:

```yaml
# .agentx/aliases/general.yaml
id: general
name: General Development
contextFiles:
  - docs/coding-standards.md
# No intentions list = all intentions available
```

---

## Best Practices

### Naming

Use short, memorable ids:

```yaml
id: spring    # ✓ Good - easy to type
id: spring-boot-backend-development  # ✗ Too long
```

### Context Files

Keep context focused and relevant:

```yaml
# ✓ Good - specific, relevant docs
contextFiles:
  - docs/spring-conventions.md
  - docs/database-schema.md

# ✗ Bad - too broad, slow to load
contextFiles:
  - docs/           # Everything, mostly irrelevant
```

### Intention Lists

Include only relevant intentions:

```yaml
# ✓ Good - Spring-specific intentions
intentions:
  - add-api-endpoint
  - add-migration
  - add-service

# ✗ Bad - mixing unrelated concerns
intentions:
  - add-api-endpoint
  - add-react-component  # Wrong domain
  - add-docker-compose   # Different concern
```

### Organization

One alias per domain/bounded context:

```
.agentx/aliases/
├── spring.yaml       # Spring Boot context
├── react.yaml        # React frontend context
├── graphql.yaml      # GraphQL API context
├── devops.yaml       # Infrastructure context
├── orders.yaml       # Orders service context
└── payments.yaml     # Payments service context
```

### Combine with Personas

Design aliases to work with multiple personas:

```bash
# Same Spring context, different expertise
@agentx-backend /exec:spring:add-api-endpoint    # Implementation focus
@agentx-architect /exec:spring:add-api-endpoint  # Design focus
@agentx-security /exec:spring:add-api-endpoint   # Security focus
```

---

## Validation

Required fields:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Unique identifier |
| `name` | ✓ | Display name |
| `description` | ✓ | Purpose description |
| `contextFiles` | | Context files (optional but recommended) |
| `intentions` | | Available intentions (optional) |

### Validation Errors

```
Error: Alias 'spring' references unknown intention 'add-endpoint'
→ Check intention id in .agentx/intentions/

Error: Context file not found: docs/missing.md
→ Verify file path is correct and file exists

Error: Duplicate alias id 'spring'
→ Each alias must have a unique id
```

---

## Examples by Use Case

### Microservice Development

```yaml
# .agentx/aliases/orders-service.yaml
id: orders-service
name: Orders Service
description: Orders microservice development context

contextFiles:
  - services/orders/README.md
  - services/orders/docs/api-spec.md
  - docs/event-driven-architecture.md

intentions:
  - add-api-endpoint
  - add-event-handler
  - add-saga-step
```

**Usage:**
```
@agentx-backend /exec:orders-service:add-event-handler Handle OrderPlaced event
```

### Library Development

```yaml
# .agentx/aliases/sdk.yaml
id: sdk
name: SDK Development
description: Public SDK and client library development context

contextFiles:
  - sdk/README.md
  - docs/api-design-guidelines.md
  - docs/versioning-policy.md

intentions:
  - add-sdk-method
  - add-example
  - update-docs
```

**Usage:**
```
@agentx-backend /exec:sdk:add-sdk-method Add getUser method with caching
```

### Testing Focus

```yaml
# .agentx/aliases/testing.yaml
id: testing
name: Testing
description: Test writing and quality assurance context

contextFiles:
  - docs/testing-strategy.md
  - docs/test-conventions.md

intentions:
  - add-unit-test
  - add-integration-test
  - add-e2e-test
  - add-test-fixture
```

**Usage:**
```
@agentx-qa /exec:testing:add-integration-test Test the checkout flow
```

---

## Troubleshooting

### Alias not found

```
@agentx-backend /exec:myalias:intention → "Unknown alias: myalias"
```

1. Check file exists: `.agentx/aliases/myalias.yaml`
2. Verify `id` field matches what you're using
3. Check YAML syntax is valid

### Context not loading

```
Context file not found: docs/guide.md
```

1. Verify path is relative to workspace root
2. Check file exists at specified path
3. Ensure no typos in path

### Intention not available

```
@agentx-backend /exec:spring:add-component → "Intention not available for alias"
```

1. Check intention is listed in alias `intentions` array
2. Verify intention exists in `.agentx/intentions/`
3. Intention id must match exactly

### YAML syntax error

```
Error parsing alias: spring.yaml
```

1. Validate YAML syntax (check indentation)
2. Ensure strings with special characters are quoted
3. Use a YAML linter
