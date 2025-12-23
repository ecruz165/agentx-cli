# Intentions

Intentions define goals with discovery questions that gather requirements before executing a workflow. They bridge user requests to structured execution.

## Overview

**VS Code Copilot Chat:**
```
@agentx-<persona> /exec:<alias>:<intention> <prompt>
```

**CLI:**
```
agentx -p <persona> exec <alias> -i <intention> "<prompt>"
```

**Example:**
```
@agentx-backend /exec:spring:add-api-endpoint Create a Student entity with name and email
```

## Directory Structure

```
.agentx/intentions/
├── add-api-endpoint.yaml
├── add-migration.yaml
├── add-component.yaml
└── README.md
```

---

## How Intentions Work

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER INVOKES                                            │
│     @agentx-backend /exec:spring:add-api-endpoint           │
│                                                             │
│  2. QUESTIONS                                               │
│     Intention asks questions to gather requirements         │
│     User answers are mapped to workflow inputs              │
│                                                             │
│  3. PRD GENERATION                                          │
│     Implementation PRD generated from answers               │
│     User approves / edits / cancels                         │
│                                                             │
│  4. WORKFLOW EXECUTION                                      │
│     Referenced workflow executes with gathered inputs       │
│     Steps run sequentially, outputs chain forward           │
│                                                             │
│  5. COMPLETION                                              │
│     Results presented, files created                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Schema

```yaml
# Required
id: string                    # Unique identifier
name: string                  # Display name
goal: string                  # What this intention accomplishes

# Questions (requirements gathering)
questions:
  - id: string                # Question identifier
    prompt: string            # Question text shown to user
    mapTo: string             # Workflow input to map answer to
    type: text | confirm | select | multiselect
    required: boolean         # Default: true
    default: any              # Default value
    options: string[]         # For select/multiselect
    transform: string         # Transform function name
    condition: string         # Show only if condition is true

# Workflow reference
workflow: string              # Workflow id to execute

# Optional customizations
workflowOverrides:
  skipSteps: string[]         # Steps to skip
  additionalContext:          # Extra inputs to inject
    key: value
```

---

## Examples

### Basic Intention

```yaml
# .agentx/intentions/add-api-endpoint.yaml
id: add-api-endpoint
name: Add API Endpoint
goal: Create a new REST API endpoint with full CRUD operations

questions:
  - id: entity-name
    prompt: What is the entity name?
    mapTo: entityName
    required: true

  - id: fields
    prompt: What fields should the entity have? (name:Type, name:Type)
    mapTo: fields
    transform: parseFieldList

  - id: include-tests
    prompt: Generate test suite?
    type: confirm
    mapTo: includeTests
    default: true

workflow: spring-crud-endpoint
```

**Interaction:**
```
@agentx-backend /exec:spring:add-api-endpoint

AgentX: What is the entity name?
User: Student

AgentX: What fields should the entity have?
User: name:String, email:String, enrolledAt:LocalDate

AgentX: Generate test suite? [Yes/No]
User: Yes

AgentX: Here's the implementation plan...
[PRD displayed]
[Approve] [Edit] [Cancel]
```

### Intention with Select Options

```yaml
# .agentx/intentions/add-migration.yaml
id: add-migration
name: Add Migration
goal: Create a new database migration

questions:
  - id: migration-type
    prompt: What type of migration?
    type: select
    options:
      - create-table
      - alter-table
      - add-index
      - add-constraint
      - data-migration
    mapTo: migrationType

  - id: table-name
    prompt: Table name?
    mapTo: tableName

  - id: description
    prompt: Brief description of the change
    mapTo: description

workflow: flyway-migration
```

### Intention with Conditional Questions

```yaml
# .agentx/intentions/add-component.yaml
id: add-component
name: Add Component
goal: Create a new React component

questions:
  - id: component-name
    prompt: Component name?
    mapTo: componentName

  - id: component-type
    prompt: What type of component?
    type: select
    options:
      - presentational
      - container
      - page
      - layout
    mapTo: componentType

  - id: state-management
    prompt: Which state management?
    type: select
    options:
      - local-state
      - redux
      - zustand
      - react-query
    mapTo: stateManagement
    condition: "{{componentType}} == 'container'"  # Only ask for containers

  - id: include-stories
    prompt: Generate Storybook stories?
    type: confirm
    mapTo: includeStories
    default: true

workflow: react-component
```

### Intention with Multiselect

```yaml
# .agentx/intentions/add-service.yaml
id: add-service
name: Add Service
goal: Create a new Spring service with selected operations

questions:
  - id: service-name
    prompt: Service name?
    mapTo: serviceName

  - id: operations
    prompt: Which operations to include?
    type: multiselect
    options:
      - create
      - read
      - update
      - delete
      - list
      - search
    default: [create, read, update, delete]
    mapTo: operations

  - id: transactional
    prompt: Make operations transactional?
    type: confirm
    mapTo: transactional
    default: true

workflow: spring-service
```

### Intention with Workflow Overrides

```yaml
# .agentx/intentions/add-simple-endpoint.yaml
id: add-simple-endpoint
name: Add Simple Endpoint
goal: Create a basic read-only endpoint (no full CRUD)

questions:
  - id: entity-name
    prompt: Entity name?
    mapTo: entityName

  - id: fields
    prompt: Fields? (name:Type, name:Type)
    mapTo: fields
    transform: parseFieldList

workflow: spring-crud-endpoint

workflowOverrides:
  skipSteps:
    - generate-tests        # Skip test generation
  additionalContext:
    operations: [read, list]  # Read-only
    includeTests: false
```

---

## Question Types

### text (default)

Free-form text input.

```yaml
- id: name
  prompt: What is the entity name?
  type: text  # Optional, text is default
  mapTo: entityName
```

### confirm

Yes/No boolean question.

```yaml
- id: include-tests
  prompt: Generate tests?
  type: confirm
  mapTo: includeTests
  default: true
```

**Renders as:** `Generate tests? [Yes] [No]`

### select

Single choice from options.

```yaml
- id: db-type
  prompt: Database type?
  type: select
  options:
    - postgresql
    - mysql
    - mongodb
  mapTo: databaseType
  default: postgresql
```

**Renders as:**
```
Database type?
  ○ postgresql (default)
  ○ mysql
  ○ mongodb
```

### multiselect

Multiple choices from options.

```yaml
- id: features
  prompt: Which features to include?
  type: multiselect
  options:
    - authentication
    - authorization
    - audit-logging
    - caching
  default: [authentication, authorization]
  mapTo: features
```

**Renders as:**
```
Which features to include?
  ☑ authentication
  ☑ authorization
  ☐ audit-logging
  ☐ caching
```

---

## Question Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Unique identifier within intention |
| `prompt` | ✓ | Question text shown to user |
| `mapTo` | ✓ | Workflow input variable name |
| `type` | | `text`, `confirm`, `select`, `multiselect` (default: `text`) |
| `required` | | Whether answer is required (default: `true`) |
| `default` | | Default value if user skips |
| `options` | | Choices for `select`/`multiselect` |
| `transform` | | Transform function to apply to answer |
| `condition` | | Expression to conditionally show question |
| `validation` | | Validation pattern or function |
| `hint` | | Help text shown below prompt |

---

## Transforms

Transforms convert user input into structured data.

### Built-in Transforms

```yaml
- id: fields
  prompt: Fields? (name:Type, name:Type)
  mapTo: fields
  transform: parseFieldList
  # Input: "name:String, email:String"
  # Output: [{name: "name", type: "String"}, {name: "email", type: "String"}]
```

| Transform | Input | Output |
|-----------|-------|--------|
| `parseFieldList` | `name:Type, name:Type` | `[{name, type}, ...]` |
| `parseCommaSeparated` | `a, b, c` | `["a", "b", "c"]` |
| `toUpperCase` | `hello` | `HELLO` |
| `toLowerCase` | `HELLO` | `hello` |
| `toPascalCase` | `user account` | `UserAccount` |
| `toCamelCase` | `user account` | `userAccount` |
| `toKebabCase` | `UserAccount` | `user-account` |
| `toSnakeCase` | `UserAccount` | `user_account` |

### Custom Transforms

Define in `.agentx/transforms/`:

```javascript
// .agentx/transforms/parseFieldList.js
module.exports = function(input) {
  return input.split(',').map(field => {
    const [name, type] = field.trim().split(':');
    return { name: name.trim(), type: type.trim() };
  });
};
```

---

## Conditional Questions

Show questions based on previous answers.

```yaml
questions:
  - id: auth-type
    prompt: Authentication type?
    type: select
    options:
      - none
      - jwt
      - oauth2
    mapTo: authType

  - id: oauth-provider
    prompt: OAuth2 provider?
    type: select
    options:
      - google
      - github
      - okta
    mapTo: oauthProvider
    condition: "{{authType}} == 'oauth2'"  # Only shown if oauth2 selected

  - id: jwt-secret-location
    prompt: JWT secret location?
    type: select
    options:
      - environment
      - vault
      - aws-secrets
    mapTo: jwtSecretLocation
    condition: "{{authType}} == 'jwt'"  # Only shown if jwt selected
```

### Condition Syntax

```yaml
# Equality
condition: "{{fieldId}} == 'value'"

# Inequality
condition: "{{fieldId}} != 'value'"

# Boolean
condition: "{{fieldId}}"           # True if truthy
condition: "!{{fieldId}}"          # True if falsy

# Contains (for multiselect)
condition: "{{features}} contains 'caching'"

# And / Or
condition: "{{typeA}} == 'x' && {{typeB}} == 'y'"
condition: "{{typeA}} == 'x' || {{typeA}} == 'y'"
```

---

## Workflow Overrides

Customize workflow execution per intention.

### Skip Steps

```yaml
workflowOverrides:
  skipSteps:
    - generate-tests
    - generate-migration
```

### Inject Additional Context

```yaml
workflowOverrides:
  additionalContext:
    basePackage: com.mycompany.orders
    includeAudit: true
    operations: [create, read]
```

### Replace Step

```yaml
workflowOverrides:
  replaceSteps:
    generate-entity: generate-entity-with-audit  # Use different step
```

---

## Validation

### Pattern Validation

```yaml
- id: entity-name
  prompt: Entity name?
  mapTo: entityName
  validation:
    pattern: "^[A-Z][a-zA-Z]+$"
    message: "Must be PascalCase (e.g., UserAccount)"
```

### Built-in Validators

```yaml
- id: port
  prompt: Port number?
  mapTo: port
  validation: port        # 1-65535

- id: email
  prompt: Admin email?
  mapTo: adminEmail
  validation: email       # Valid email format

- id: package
  prompt: Package name?
  mapTo: basePackage
  validation: javaPackage # Valid Java package (e.g., com.example.app)
```

---

## User Prompt Integration

The user prompt from the command is available as `{{userPrompt}}`:

```yaml
# .agentx/intentions/quick-task.yaml
id: quick-task
name: Quick Task
goal: Execute a quick development task

questions:
  - id: confirm-task
    prompt: |
      Execute this task?
      
      "{{userPrompt}}"
    type: confirm
    mapTo: confirmed

workflow: quick-task
```

**Usage:**
```
@agentx-backend /exec:spring:quick-task Add logging to UserService
```

**Shows:**
```
Execute this task?

"Add logging to UserService"

[Yes] [No]
```

---

## PRD Generation

After questions, a PRD is generated using `templates/prd.md`:

```markdown
<!-- .agentx/templates/prd.md -->
# Implementation PRD: {{intentionName}}

## Goal
{{goal}}

## User Request
{{userPrompt}}

## Gathered Requirements

{{#each answers}}
### {{question}}
{{answer}}
{{/each}}

## Execution Plan

{{#each workflow.steps}}
{{index}}. **{{name}}**
   {{description}}
{{/each}}

## Expected Outputs
{{#each workflow.outputs}}
- {{name}}
{{/each}}
```

---

## Best Practices

### Questions

- **Ask only what's needed** — minimize friction
- **Provide sensible defaults** — let users press Enter
- **Use select for constrained choices** — prevent typos
- **Use confirm for booleans** — clearer than yes/no text
- **Order questions logically** — general → specific

### Naming

```yaml
id: add-api-endpoint       # ✓ verb-noun, kebab-case
id: api-endpoint           # ✗ missing verb
id: addAPIEndpoint         # ✗ not kebab-case
```

### Goal Descriptions

```yaml
goal: Create a new REST API endpoint with full CRUD operations  # ✓ Clear
goal: Make endpoint  # ✗ Vague
```

### Workflow Mapping

Ensure `mapTo` values match workflow inputs:

```yaml
# intention
questions:
  - id: entity-name
    mapTo: entityName      # Must match workflow input

# workflow
inputs:
  - name: entityName       # ← Must match
    required: true
```

---

## Examples by Domain

### Backend - Spring

```yaml
id: add-repository
name: Add Repository
goal: Create a Spring Data JPA repository

questions:
  - id: entity
    prompt: Entity class name?
    mapTo: entityName
  - id: custom-queries
    prompt: Custom query methods? (comma-separated)
    mapTo: customQueries
    transform: parseCommaSeparated
    required: false

workflow: spring-repository
```

### Frontend - React

```yaml
id: add-hook
name: Add Hook
goal: Create a custom React hook

questions:
  - id: hook-name
    prompt: Hook name? (without 'use' prefix)
    mapTo: hookName
    transform: toCamelCase
  - id: dependencies
    prompt: External dependencies?
    type: multiselect
    options:
      - react-query
      - axios
      - lodash
    mapTo: dependencies

workflow: react-hook
```

### DevOps - Kubernetes

```yaml
id: add-deployment
name: Add Deployment
goal: Create Kubernetes deployment manifests

questions:
  - id: service-name
    prompt: Service name?
    mapTo: serviceName
  - id: replicas
    prompt: Number of replicas?
    type: select
    options: ["1", "2", "3", "5"]
    default: "2"
    mapTo: replicas
  - id: resources
    prompt: Resource tier?
    type: select
    options:
      - small   # 256Mi / 0.25 CPU
      - medium  # 512Mi / 0.5 CPU
      - large   # 1Gi / 1 CPU
    mapTo: resourceTier

workflow: k8s-deployment
```

---

## Troubleshooting

### Intention not found

```
Error: Unknown intention 'add-endpoint'
```

1. Check file exists: `.agentx/intentions/add-endpoint.yaml`
2. Verify `id` matches what you're using
3. Check intention is listed in alias `intentions` array

### Workflow not found

```
Error: Intention 'add-api-endpoint' references unknown workflow 'spring-crud'
```

1. Verify workflow exists: `.agentx/workflows/spring-crud.yaml`
2. Check `workflow` field matches workflow `id`

### mapTo mismatch

```
Error: Workflow input 'entityName' not provided
```

1. Check question `mapTo` matches workflow `inputs[].name`
2. Ensure question is `required: true` or has `default`

### Transform error

```
Error: Unknown transform 'parseFields'
```

1. Check transform name matches built-in or custom transform
2. For custom: verify `.agentx/transforms/parseFields.js` exists

### Condition syntax error

```
Error: Invalid condition syntax
```

1. Verify `{{variable}}` references valid question id
2. Check operator is valid (`==`, `!=`, `contains`, `&&`, `||`)
3. Ensure string values are quoted

---

## Validation Checklist

| Field | Required | Validation |
|-------|----------|------------|
| `id` | ✓ | Unique, kebab-case |
| `name` | ✓ | Non-empty |
| `goal` | ✓ | Non-empty |
| `questions` | | Array of valid questions |
| `questions[].id` | ✓ | Unique within intention |
| `questions[].prompt` | ✓ | Non-empty |
| `questions[].mapTo` | ✓ | Valid identifier |
| `questions[].type` | | One of: text, confirm, select, multiselect |
| `questions[].options` | | Required if type is select/multiselect |
| `workflow` | ✓ | References existing workflow |
| `workflowOverrides` | | Valid structure |
