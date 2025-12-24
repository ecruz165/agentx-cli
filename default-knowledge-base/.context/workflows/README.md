# Workflows

Workflows define multi-step execution plans that orchestrate skills to accomplish complex tasks. They are referenced by intentions and execute after the user approves the PRD.

## Overview

Workflows are not invoked directly. They are referenced by intentions:

```yaml
# .agentx/intentions/add-api-endpoint.yaml
id: add-api-endpoint
workflow: spring-crud-endpoint    # ← References workflow
```

When a user triggers an intention, the workflow executes:

```
@agentx-backend /exec:spring:add-api-endpoint Create a Student entity
```

## Directory Structure

```
.agentx/workflows/
├── spring-crud-endpoint.yaml
├── spring-auth-flow.yaml
├── react-component.yaml
├── flyway-migration.yaml
└── README.md
```

---

## How Workflows Work

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
│  │ Step 1          │ skills: [generate_entity]              │
│  │ Generate Entity │────────────────────────────────────┐   │
│  └────────┬────────┘                                    │   │
│           │ outputs: { entityPath, className }          │   │
│           ▼                                             │   │
│  ┌─────────────────┐                                    │   │
│  │ Step 2          │ skills: [create_migration]         │   │
│  │ Create Migration│ refinePrd: true ← asks questions   │   │
│  └────────┬────────┘                                    │   │
│           │ outputs: { migrationPath }                  │   │
│           ▼                                             │   │
│  ┌─────────────────┐                                    │   │
│  │ Step 3          │ skills: [generate_repository]      │   │
│  │ Gen Repository  │ uses: {{steps.step1.className}}    │   │
│  └────────┬────────┘                                    │   │
│           │                                             │   │
│          ...                                            │   │
│           │                                             │   │
│           ▼                                             │   │
│  ┌─────────────────┐                                    │   │
│  │ COMPLETE        │ All outputs collected              │   │
│  │ Output Template │ Files presented to user            │   │
│  └─────────────────┘                                    │   │
└─────────────────────────────────────────────────────────────┘
```

---

## Schema

```yaml
# Required
id: string                    # Unique identifier
name: string                  # Display name
description: string           # What this workflow accomplishes

# Inputs (from intention answers)
inputs:
  - name: string              # Variable name
    type: string | number | boolean | array
    required: boolean
    default: any
    description: string

# Steps (sequential execution)
steps:
  - id: string                # Step identifier
    name: string              # Display name
    description: string       # What this step does
    
    # Execution
    skills: string[]          # Skills to invoke
    prompt: string            # Prompt template for LLM skills
    
    # Data flow
    inputs: string[]          # Variables this step needs
    outputs: Output[]         # Variables this step produces
    
    # PRD refinement
    refinePrd: boolean        # Generate step-level PRD
    prdTemplate: string       # Custom step PRD template
    prdQuestions: Question[]  # Additional questions
    
    # Control flow
    condition: string         # Skip if evaluates to false
    continueOnError: boolean  # Continue workflow on failure
    retryCount: number        # Retry attempts on failure
    
    # Hooks
    beforeStep: string        # Skill to run before
    afterStep: string         # Skill to run after

# Final outputs
outputs: string[]             # Output names to include in summary
```

---

## Examples

### Complete CRUD Workflow

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
    
  - name: basePackage
    type: string
    default: com.example
    description: Base Java package
    
  - name: includeTests
    type: boolean
    default: true
    description: Generate test classes

steps:
  - id: generate-entity
    name: Generate JPA Entity
    description: Creates the JPA entity class with annotations
    skills: [generate_entity]
    prompt: |
      Create a JPA @Entity class:
      
      Entity: {{entityName}}
      Package: {{basePackage}}.domain
      Fields: {{fields}}
      
      Include:
      - Lombok annotations (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor)
      - JPA annotations (@Entity, @Table, @Id, @GeneratedValue)
      - Audit fields (createdAt, updatedAt)
    inputs: [entityName, fields, basePackage]
    outputs:
      - name: entityPath
        type: string
      - name: entityClassName
        type: string

  - id: generate-migration
    name: Generate Flyway Migration
    description: Creates database migration for the entity
    refinePrd: true
    prdQuestions:
      - id: include-indexes
        prompt: Which fields need database indexes?
        type: multiselect
        options: "{{fields}}"
        mapTo: indexedFields
      - id: include-constraints
        prompt: Add any unique constraints?
        type: text
        mapTo: uniqueConstraints
    skills: [create_migration]
    prompt: |
      Create Flyway migration for {{entityName}}:
      
      Fields: {{fields}}
      Indexes: {{indexedFields}}
      Unique: {{uniqueConstraints}}
    inputs: [entityName, fields, indexedFields, uniqueConstraints]
    outputs:
      - name: migrationPath
        type: string

  - id: generate-repository
    name: Generate Repository
    description: Creates Spring Data JPA repository interface
    skills: [generate_repository]
    prompt: |
      Create Spring Data JPA repository:
      
      Entity: {{entityName}}
      Package: {{basePackage}}.repository
      Entity Class: {{steps.generate-entity.entityClassName}}
    inputs: [entityName, basePackage]
    outputs:
      - name: repositoryPath
        type: string
      - name: repositoryClassName
        type: string

  - id: generate-service
    name: Generate Service
    description: Creates service class with business logic
    skills: [generate_service]
    prompt: |
      Create Spring @Service class:
      
      Entity: {{entityName}}
      Package: {{basePackage}}.service
      Repository: {{steps.generate-repository.repositoryClassName}}
      
      Include CRUD operations: create, findById, findAll, update, delete
    inputs: [entityName, basePackage]
    outputs:
      - name: servicePath
        type: string
      - name: serviceClassName
        type: string

  - id: generate-controller
    name: Generate REST Controller
    description: Creates REST controller with CRUD endpoints
    skills: [generate_controller]
    prompt: |
      Create Spring @RestController:
      
      Entity: {{entityName}}
      Package: {{basePackage}}.controller
      Service: {{steps.generate-service.serviceClassName}}
      Base Path: /api/{{lowercase entityName}}s
      
      Endpoints: GET (list, byId), POST, PUT, DELETE
    inputs: [entityName, basePackage]
    outputs:
      - name: controllerPath
        type: string

  - id: generate-tests
    name: Generate Tests
    description: Creates unit and integration tests
    condition: "{{includeTests}}"
    skills: [generate_tests]
    prompt: |
      Create tests for {{entityName}}:
      
      - Unit tests for service
      - Integration tests for controller
      - Use JUnit 5 and Mockito
    inputs: [entityName, basePackage]
    outputs:
      - name: testPaths
        type: array

outputs:
  - entityPath
  - migrationPath
  - repositoryPath
  - servicePath
  - controllerPath
  - testPaths
```

### Simple Migration Workflow

```yaml
# .agentx/workflows/flyway-migration.yaml
id: flyway-migration
name: Flyway Migration
description: Creates a new Flyway database migration

inputs:
  - name: migrationType
    type: string
    required: true
  - name: tableName
    type: string
    required: true
  - name: description
    type: string

steps:
  - id: create-migration
    name: Create Migration File
    skills: [create_migration]
    prompt: |
      Create Flyway migration:
      
      Type: {{migrationType}}
      Table: {{tableName}}
      Description: {{description}}
    inputs: [migrationType, tableName, description]
    outputs:
      - name: migrationPath
        type: string
      - name: version
        type: string

outputs:
  - migrationPath
  - version
```

### React Component Workflow

```yaml
# .agentx/workflows/react-component.yaml
id: react-component
name: React Component
description: Creates a React component with styles and tests

inputs:
  - name: componentName
    type: string
    required: true
  - name: componentType
    type: string
    default: presentational
  - name: includeStories
    type: boolean
    default: true

steps:
  - id: generate-component
    name: Generate Component
    skills: [generate_react_component]
    prompt: |
      Create React {{componentType}} component:
      
      Name: {{componentName}}
      Type: {{componentType}}
      
      Use TypeScript and functional components with hooks.
    inputs: [componentName, componentType]
    outputs:
      - name: componentPath
        type: string

  - id: generate-styles
    name: Generate Styles
    skills: [generate_styles]
    prompt: |
      Create CSS module for {{componentName}}:
      
      Use CSS modules with TypeScript types.
    inputs: [componentName]
    outputs:
      - name: stylesPath
        type: string

  - id: generate-tests
    name: Generate Tests
    skills: [generate_react_tests]
    prompt: |
      Create tests for {{componentName}}:
      
      Use React Testing Library and Jest.
    inputs: [componentName]
    outputs:
      - name: testPath
        type: string

  - id: generate-stories
    name: Generate Storybook Stories
    condition: "{{includeStories}}"
    skills: [generate_stories]
    prompt: |
      Create Storybook stories for {{componentName}}:
      
      Include default and variant stories.
    inputs: [componentName]
    outputs:
      - name: storiesPath
        type: string

outputs:
  - componentPath
  - stylesPath
  - testPath
  - storiesPath
```

---

## Inputs

Workflow inputs are populated from intention answers.

### Input Definition

```yaml
inputs:
  - name: entityName           # Variable name
    type: string               # Type: string, number, boolean, array
    required: true             # Must be provided
    description: Entity name   # Documentation
    
  - name: operations
    type: array
    default: [create, read, update, delete]
    description: CRUD operations to generate
```

### Type Mapping

| Type | Example Value |
|------|---------------|
| `string` | `"UserAccount"` |
| `number` | `8080` |
| `boolean` | `true` |
| `array` | `["create", "read"]` |

### From Intention Questions

```yaml
# Intention question
questions:
  - id: entity-name
    prompt: Entity name?
    mapTo: entityName         # ← Maps to workflow input

# Workflow input
inputs:
  - name: entityName          # ← Receives mapped value
    required: true
```

---

## Steps

Steps execute sequentially, each invoking skills and producing outputs.

### Step Definition

```yaml
steps:
  - id: generate-entity       # Unique identifier
    name: Generate Entity     # Display name
    description: Creates JPA entity class
    
    skills: [generate_entity] # Skills to invoke
    prompt: |                 # Prompt for LLM skills
      Create entity {{entityName}}
    
    inputs: [entityName, fields]  # Required context
    outputs:                  # Produced outputs
      - name: entityPath
        type: string
```

### Step Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Unique step identifier |
| `name` | ✓ | Display name |
| `description` | | Step description |
| `skills` | ✓ | Skills to invoke |
| `prompt` | | Prompt template for LLM skills |
| `inputs` | | Context variables needed |
| `outputs` | | Variables produced |
| `refinePrd` | | Generate step PRD (default: false) |
| `prdTemplate` | | Custom PRD template path |
| `prdQuestions` | | Questions for refinement |
| `condition` | | Skip condition expression |
| `continueOnError` | | Continue on failure (default: false) |
| `retryCount` | | Retry attempts (default: 0) |
| `beforeStep` | | Skill to run before |
| `afterStep` | | Skill to run after |

---

## Outputs

### Step Outputs

Each step can produce outputs for use by later steps.

```yaml
steps:
  - id: generate-entity
    outputs:
      - name: entityPath
        type: string
      - name: className
        type: string
```

### Accessing Previous Outputs

Use `{{steps.<stepId>.<outputName>}}` syntax:

```yaml
steps:
  - id: step1
    outputs:
      - name: className

  - id: step2
    prompt: |
      Use the class: {{steps.step1.className}}
```

### Output Extraction

Outputs are extracted from skill results:

```yaml
outputs:
  - name: filePath
    type: string
    extract: pattern              # Extraction method
    pattern: "Created: (.+)"      # Regex pattern
```

### Workflow Outputs

Final outputs listed in `outputs` are included in the completion summary:

```yaml
outputs:
  - entityPath
  - servicePath
  - controllerPath
```

---

## Step PRD Refinement

Complex steps can gather additional information before execution.

### Enable Refinement

```yaml
steps:
  - id: generate-migration
    name: Generate Migration
    refinePrd: true               # Enable step PRD
```

### Add Questions

```yaml
steps:
  - id: generate-migration
    refinePrd: true
    prdQuestions:
      - id: indexes
        prompt: Which fields need indexes?
        type: multiselect
        options: "{{fields}}"     # Dynamic options
        mapTo: indexedFields
        
      - id: constraints
        prompt: Unique constraints? (comma-separated)
        type: text
        mapTo: uniqueConstraints
```

### Question Fields

| Field | Description |
|-------|-------------|
| `id` | Question identifier |
| `prompt` | Question text |
| `type` | `text`, `confirm`, `select`, `multiselect` |
| `options` | Choices (can use `{{variable}}`) |
| `mapTo` | Context variable to store answer |
| `default` | Default value |
| `required` | Whether required (default: true) |

### Custom Template

```yaml
steps:
  - id: generate-migration
    refinePrd: true
    prdTemplate: templates/migration-step.md
```

---

## Conditional Execution

Skip steps based on conditions.

### Basic Condition

```yaml
steps:
  - id: generate-tests
    condition: "{{includeTests}}"
    # Skipped if includeTests is falsy
```

### Condition Syntax

```yaml
# Boolean check
condition: "{{includeTests}}"

# Equality
condition: "{{environment}} == 'production'"

# Inequality
condition: "{{mode}} != 'skip'"

# Contains (for arrays)
condition: "{{features}} contains 'auth'"

# And / Or
condition: "{{includeTests}} && {{environment}} == 'dev'"
condition: "{{skipMigration}} || {{dryRun}}"

# Negation
condition: "!{{skipValidation}}"
```

### Skip vs Continue

```yaml
# Skip: step doesn't run, workflow continues
condition: "{{runTests}}"

# Error handling: step fails, workflow continues
continueOnError: true
```

---

## Error Handling

### Continue on Error

```yaml
steps:
  - id: optional-step
    continueOnError: true    # Workflow continues if this fails
```

### Retry

```yaml
steps:
  - id: flaky-operation
    retryCount: 3            # Retry up to 3 times on failure
```

### Error in Context

Failed steps add error info to context:

```yaml
# Access in later steps
{{#if steps.optional-step.error}}
  Previous step failed: {{steps.optional-step.error}}
{{/if}}
```

---

## Hooks

Run skills before or after a step.

### Before Hook

```yaml
steps:
  - id: generate-code
    beforeStep: backup_files    # Run backup skill first
```

### After Hook

```yaml
steps:
  - id: generate-code
    afterStep: format_code      # Run formatter after
```

### Common Use Cases

| Hook | Use Case |
|------|----------|
| `beforeStep` | Backup files, validate state, acquire locks |
| `afterStep` | Format code, run linter, notify |

---

## Variable Interpolation

### Basic Variables

```yaml
prompt: |
  Entity: {{entityName}}
  Package: {{basePackage}}
```

### Previous Step Outputs

```yaml
prompt: |
  Repository: {{steps.generate-repository.repositoryClassName}}
```

### Built-in Variables

| Variable | Description |
|----------|-------------|
| `{{workspaceFolder}}` | Workspace root path |
| `{{date}}` | Current date (YYYY-MM-DD) |
| `{{timestamp}}` | Current timestamp |
| `{{workflow.id}}` | Current workflow ID |
| `{{workflow.name}}` | Current workflow name |
| `{{step.id}}` | Current step ID |
| `{{step.index}}` | Current step index (0-based) |

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

---

## Workflow Overrides

Intentions can customize workflow execution.

### In Intention

```yaml
# .agentx/intentions/add-simple-endpoint.yaml
workflow: spring-crud-endpoint

workflowOverrides:
  skipSteps:
    - generate-tests
  additionalContext:
    includeTests: false
    operations: [read, list]
```

### Skip Steps

```yaml
workflowOverrides:
  skipSteps:
    - generate-tests
    - generate-migration
```

### Inject Context

```yaml
workflowOverrides:
  additionalContext:
    basePackage: com.mycompany.orders
    includeAudit: true
```

### Replace Steps

```yaml
workflowOverrides:
  replaceSteps:
    generate-entity: generate-entity-with-audit
```

---

## Execution State

### State Persistence

Workflow state is saved to `.agentx/executions/`:

```json
{
  "id": "exec_abc123",
  "workflowId": "spring-crud-endpoint",
  "status": "running",
  "currentStep": 2,
  "context": {
    "entityName": "Student",
    "steps": {
      "generate-entity": {
        "status": "completed",
        "outputs": { "entityPath": "..." }
      }
    }
  },
  "startedAt": "2024-01-15T10:30:00Z"
}
```

### Resume Failed Workflow

```bash
# VS Code
@agentx-backend /resume exec_abc123

# CLI
agentx resume exec_abc123
```

### Execution Statuses

| Status | Description |
|--------|-------------|
| `pending` | Not started |
| `running` | Currently executing |
| `paused` | Waiting for user input |
| `completed` | Successfully finished |
| `failed` | Error occurred |
| `cancelled` | User cancelled |

---

## Best Practices

### Step Granularity

```yaml
# ✓ Good - atomic steps
steps:
  - id: generate-entity
  - id: generate-repository
  - id: generate-service

# ✗ Bad - monolithic step
steps:
  - id: generate-everything
```

### Clear Dependencies

```yaml
# ✓ Good - explicit input/output
steps:
  - id: step1
    outputs: [className]
    
  - id: step2
    inputs: [className]    # Clear dependency
    prompt: Use {{steps.step1.className}}
```

### Meaningful IDs

```yaml
# ✓ Good - descriptive
id: generate-jpa-entity
id: create-flyway-migration

# ✗ Bad - vague
id: step1
id: do-thing
```

### Handle Failures

```yaml
# Optional steps that shouldn't break workflow
- id: generate-docs
  continueOnError: true

# Flaky operations that might need retry
- id: fetch-schema
  retryCount: 3
```

### Use Conditions Wisely

```yaml
# ✓ Good - optional features
condition: "{{includeTests}}"
condition: "{{environment}} == 'production'"

# ✗ Bad - always true/false
condition: "true"
condition: "1 == 1"
```

---

## Troubleshooting

### Workflow not found

```
Error: Unknown workflow 'my-workflow'
```

1. Check file exists: `.agentx/workflows/my-workflow.yaml`
2. Verify `id` matches
3. Check YAML syntax

### Step skill not found

```
Error: Step 'generate-entity' references unknown skill 'gen_entity'
```

1. Verify skill exists: `.agentx/skills/gen_entity.yaml`
2. Check skill `id` matches

### Input not provided

```
Error: Workflow input 'entityName' not provided
```

1. Check intention question `mapTo` matches workflow input `name`
2. Verify question is `required: true` or has `default`

### Output not available

```
Error: Cannot access steps.step1.className - step not completed
```

1. Verify step `id` is correct
2. Check step actually produces that output
3. Ensure step completed successfully

### Condition syntax error

```
Error: Invalid condition syntax
```

1. Check `{{variable}}` references valid context
2. Verify operators: `==`, `!=`, `&&`, `||`
3. Ensure strings are quoted

### Step timeout

```
Error: Step 'build' timed out
```

1. Increase skill timeout
2. Check for infinite loops
3. Optimize long-running operations

---

## Validation Checklist

| Field | Required | Validation |
|-------|----------|------------|
| `id` | ✓ | Unique, kebab-case |
| `name` | ✓ | Non-empty |
| `description` | ✓ | Non-empty |
| `inputs[].name` | | Unique within workflow |
| `steps` | ✓ | At least one step |
| `steps[].id` | ✓ | Unique within workflow |
| `steps[].name` | ✓ | Non-empty |
| `steps[].skills` | ✓ | At least one skill |
| `steps[].outputs[].name` | | Unique within step |
| `outputs` | | Reference valid step outputs |
