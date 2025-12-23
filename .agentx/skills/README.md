# Skills

Skills are executable capabilities that workflow steps invoke. They wrap scripts, Make targets, or LLM prompts with a unified interface for inputs and outputs.

## Overview

Skills are not invoked directly by users. They are referenced by workflow steps:

```yaml
# .agentx/workflows/spring-crud-endpoint.yaml
steps:
  - id: generate-entity
    name: Generate Entity
    skills: [generate_entity]    # ← References skill
    prompt: |
      Create JPA entity {{entityName}}
```

When a workflow step executes, it calls the specified skills to perform actions.

## Directory Structure

```
.agentx/skills/
├── create_migration.yaml      # type: script
├── build_module.yaml          # type: make
├── generate_entity.yaml       # type: llm
├── run_tests.yaml             # type: make
└── README.md

# Scripts referenced by skills live outside .agentx/
project-root/
├── scripts/
│   ├── create-migration.sh
│   ├── scaffold-entity.py
│   └── run-tests.sh
└── Makefile
```

---

## Skill Types

### Type 1: Script

Executes shell scripts, Python scripts, or Node.js scripts.

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

### Type 2: Make

Executes Make targets with environment variables.

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

### Type 3: LLM

Delegates to the language model with a structured prompt.

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
  - Add audit fields: createdAt, updatedAt
  
  Return only Java code. No markdown. No explanation.

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

---

## Schema

### Common Fields

```yaml
# Required
id: string                    # Unique identifier
type: script | make | llm     # Skill type
name: string                  # Display name
description: string           # What this skill does

# Common optional
args: Arg[]                   # Input arguments (script/make)
inputs: Input[]               # Input variables (llm)
outputs: Output[]             # Output extraction
workdir: string               # Working directory (default: workspace root)
timeout: number               # Timeout in seconds (default: 60)
confirm: boolean              # Require user confirmation (default: false)
env: object                   # Additional environment variables
```

### Script-Specific

```yaml
run: string                   # Path to script (relative to workspace)
shell: bash | python | node | pwsh  # Shell to use (default: bash)

# Platform overrides
platform:
  windows:
    run: string
    shell: string
  unix:
    run: string
    shell: string
```

### Make-Specific

```yaml
target: string                # Make target name
makefile: string              # Path to Makefile (default: ./Makefile)
```

### LLM-Specific

```yaml
prompt: string                # Prompt template with {{variables}}
inputs: Input[]               # Required input variables
model: string                 # Model override (optional)
temperature: number           # 0.0-1.0 (default: 0.7)
maxTokens: number             # Max response tokens
```

---

## Arguments (Script & Make)

### Script Arguments

Pass values as CLI flags or positional arguments.

```yaml
args:
  # Flag argument: --name value
  - name: migrationName
    flag: --name
    required: true

  # Short flag: -v
  - name: verbose
    shortFlag: -v
    type: boolean

  # Positional argument
  - name: targetFile
    positional: 0

  # With default value
  - name: format
    flag: --format
    default: json
```

**Resulting command:**
```bash
./scripts/migrate.sh --name AddUsers -v --format json targetFile.sql
```

### Make Arguments

Pass values as environment variables.

```yaml
args:
  - name: module
    env: MODULE
    required: true

  - name: skipTests
    env: SKIP_TESTS
    type: boolean
    default: false
```

**Resulting invocation:**
```bash
MODULE=orders SKIP_TESTS=0 make -f Makefile build-module
```

### Argument Fields

| Field | Description |
|-------|-------------|
| `name` | Argument name (used for input mapping) |
| `required` | Whether argument is required (default: false) |
| `default` | Default value if not provided |
| `type` | `string`, `number`, `boolean`, `array` (default: string) |
| `flag` | CLI flag for script (e.g., `--name`) |
| `shortFlag` | Short CLI flag (e.g., `-n`) |
| `positional` | Positional index for script (0-based) |
| `env` | Environment variable name for make |
| `description` | Help text |

---

## Inputs (LLM)

Define variables used in prompt templates.

```yaml
inputs:
  - name: entityName
    required: true
    description: Name of the entity class

  - name: fields
    required: true
    type: array
    description: List of field definitions

  - name: includeAudit
    type: boolean
    default: true
```

### Variable Interpolation

Use `{{variableName}}` in prompts:

```yaml
prompt: |
  Create entity {{entityName}} with fields: {{fields}}
  Include audit: {{includeAudit}}
```

**Arrays are joined:**
```yaml
# Input: fields = ["name", "email", "age"]
# In prompt: {{fields}} → "name, email, age"
```

---

## Outputs

Extract structured data from skill results.

### Extraction Modes

```yaml
outputs:
  # Full output
  - name: result
    extract: full              # Entire stdout/response

  # Standard streams
  - name: output
    extract: stdout
  - name: errors
    extract: stderr

  # Exit code
  - name: exitCode
    extract: exitCode

  # Pattern extraction (regex)
  - name: version
    extract: pattern
    pattern: "Version: (\\d+\\.\\d+\\.\\d+)"

  # Multiple matches
  - name: files
    extract: pattern
    pattern: "Created: (.+)"
    flags: gm
    multiple: true

  # JSON extraction
  - name: config
    extract: json
    jsonPath: "$.database.host"

  # File content
  - name: content
    extract: file
    path: "./output/result.txt"
```

### Output Fields

| Field | Description |
|-------|-------------|
| `name` | Output variable name |
| `extract` | Extraction mode |
| `pattern` | Regex pattern (for `pattern` mode) |
| `flags` | Regex flags: `g` (global), `m` (multiline), `i` (case-insensitive) |
| `group` | Capture group index (default: 1) |
| `multiple` | Return all matches as array (default: false) |
| `jsonPath` | JSONPath expression (for `json` mode) |
| `path` | File path (for `file` mode) |

### Pattern Examples

```yaml
# Extract version number
- name: version
  extract: pattern
  pattern: "v(\\d+\\.\\d+\\.\\d+)"
  # Input: "Released v1.2.3" → "1.2.3"

# Extract multiple file paths
- name: files
  extract: pattern
  pattern: "^- (.+)$"
  flags: gm
  multiple: true
  # Input: "- file1.txt\n- file2.txt" → ["file1.txt", "file2.txt"]

# Extract specific capture group
- name: tableName
  extract: pattern
  pattern: "CREATE TABLE (\\w+)\\.(\\w+)"
  group: 2  # Second capture group (table name, not schema)
```

---

## Complete Examples

### Script: Create Migration

```yaml
# .agentx/skills/create_migration.yaml
id: create_migration
type: script
name: Create Migration
description: Creates a new Flyway migration file with versioned naming

run: ./scripts/create-migration.sh
shell: bash

args:
  - name: migrationName
    flag: --name
    required: true
    description: Migration name (e.g., AddUsersTable)

  - name: description
    flag: --desc
    description: Brief description of the change

  - name: type
    flag: --type
    default: sql
    description: Migration type (sql or java)

env:
  MIGRATIONS_DIR: src/main/resources/db/migration

outputs:
  - name: filePath
    extract: pattern
    pattern: "Created: (.+\\.sql)"

  - name: version
    extract: pattern
    pattern: "Version: (V\\d+)"

workdir: ${workspaceFolder}
timeout: 30

platform:
  windows:
    run: ./scripts/create-migration.ps1
    shell: pwsh
```

**Referenced script:**
```bash
#!/bin/bash
# scripts/create-migration.sh

NAME=""
DESC=""
TYPE="sql"

while [[ $# -gt 0 ]]; do
  case $1 in
    --name) NAME="$2"; shift 2 ;;
    --desc) DESC="$2"; shift 2 ;;
    --type) TYPE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

VERSION=$(ls -1 $MIGRATIONS_DIR/V*.sql 2>/dev/null | wc -l)
VERSION=$((VERSION + 1))
FILENAME="V${VERSION}__${NAME}.${TYPE}"
FILEPATH="${MIGRATIONS_DIR}/${FILENAME}"

echo "-- ${DESC}" > "$FILEPATH"
echo "" >> "$FILEPATH"

echo "Version: V${VERSION}"
echo "Created: ${FILEPATH}"
```

### Make: Build Module

```yaml
# .agentx/skills/build_module.yaml
id: build_module
type: make
name: Build Module
description: Builds a specific module with Maven

target: build-module
makefile: ./Makefile

args:
  - name: module
    env: MODULE
    required: true
    description: Module name to build

  - name: profile
    env: PROFILE
    default: dev
    description: Maven profile

  - name: skipTests
    env: SKIP_TESTS
    type: boolean
    default: false

outputs:
  - name: artifactPath
    extract: pattern
    pattern: "Building: (.+\\.jar)"

  - name: buildTime
    extract: pattern
    pattern: "Total time: ([\\d.]+s)"

timeout: 300
```

**Referenced Makefile:**
```makefile
# Makefile

.PHONY: build-module

build-module:
	@echo "Building module: $(MODULE)"
	@cd $(MODULE) && mvn clean package -P$(PROFILE) $(if $(filter 1,$(SKIP_TESTS)),-DskipTests)
	@echo "Building: $(MODULE)/target/$(MODULE).jar"
	@echo "Total time: $$(cat $(MODULE)/target/build-time.txt)"
```

### Make: Run Tests

```yaml
# .agentx/skills/run_tests.yaml
id: run_tests
type: make
name: Run Tests
description: Runs tests for a module

target: test-module

args:
  - name: module
    env: MODULE
    required: true

  - name: coverage
    env: COVERAGE
    type: boolean
    default: false

  - name: filter
    env: TEST_FILTER
    description: Test name filter pattern

outputs:
  - name: passed
    extract: pattern
    pattern: "Tests run: (\\d+)"

  - name: failed
    extract: pattern
    pattern: "Failures: (\\d+)"

  - name: skipped
    extract: pattern
    pattern: "Skipped: (\\d+)"

  - name: coveragePercent
    extract: pattern
    pattern: "Coverage: ([\\d.]+%)"

timeout: 600
```

### LLM: Generate Service

```yaml
# .agentx/skills/generate_service.yaml
id: generate_service
type: llm
name: Generate Service
description: Generates a Spring @Service class with CRUD operations

prompt: |
  Create a Spring @Service class with the following specifications:
  
  Service Name: {{serviceName}}
  Package: {{package}}
  Entity: {{entityName}}
  Repository: {{repositoryClass}}
  
  Operations to include:
  {{#each operations}}
  - {{this}}
  {{/each}}
  
  Requirements:
  - Use Lombok @RequiredArgsConstructor
  - Inject repository via constructor
  - Use @Transactional for write operations
  - Return Optional<T> for single-entity queries
  - Return List<T> for collection queries
  - Include proper logging with @Slf4j
  - Add JavaDoc comments
  
  Return only valid Java code. No markdown fences. No explanation.

inputs:
  - name: serviceName
    required: true
  - name: package
    required: true
  - name: entityName
    required: true
  - name: repositoryClass
    required: true
  - name: operations
    type: array
    default: [create, findById, findAll, update, delete]

outputs:
  - name: code
    extract: full

  - name: className
    extract: pattern
    pattern: "public class (\\w+Service)"

  - name: methods
    extract: pattern
    pattern: "public \\w+<?[\\w<>,\\s]*>? (\\w+)\\("
    flags: gm
    multiple: true

temperature: 0.2
maxTokens: 2000
```

### LLM: Generate Tests

```yaml
# .agentx/skills/generate_tests.yaml
id: generate_tests
type: llm
name: Generate Tests
description: Generates unit tests for a class

prompt: |
  Generate comprehensive unit tests for the following class:
  
  ```java
  {{sourceCode}}
  ```
  
  Test Framework: {{testFramework}}
  Mock Framework: {{mockFramework}}
  
  Requirements:
  - Test all public methods
  - Include happy path and error cases
  - Use descriptive test names (@DisplayName)
  - Follow Arrange-Act-Assert pattern
  - Mock external dependencies
  - Test edge cases (null, empty, boundary values)
  
  Return only valid Java test code. No markdown. No explanation.

inputs:
  - name: sourceCode
    required: true
  - name: testFramework
    default: junit5
  - name: mockFramework
    default: mockito

outputs:
  - name: code
    extract: full

  - name: testCount
    extract: pattern
    pattern: "@Test"
    flags: g
    multiple: true
    # Count by array length

temperature: 0.3
maxTokens: 4000
```

---

## Platform Support

Handle cross-platform differences with `platform` overrides.

```yaml
id: setup_environment
type: script
name: Setup Environment

# Default (Unix)
run: ./scripts/setup.sh
shell: bash

# Platform-specific overrides
platform:
  windows:
    run: ./scripts/setup.ps1
    shell: pwsh
  unix:
    run: ./scripts/setup.sh
    shell: bash
```

### Shell Options

| Shell | Platform | Use Case |
|-------|----------|----------|
| `bash` | Unix, WSL, Git Bash | Default for Unix scripts |
| `pwsh` | Windows, Unix | PowerShell Core (cross-platform) |
| `python` | Any | Python scripts |
| `node` | Any | Node.js scripts |

---

## Security

### Workspace Trust

Skills only execute in trusted workspaces. Untrusted workspaces show:

```
⚠️ Skills require a trusted workspace.
```

### Confirmation

Set `confirm: true` for dangerous operations:

```yaml
id: drop_database
type: script
name: Drop Database
confirm: true  # User must confirm before execution

run: ./scripts/drop-db.sh
```

**Shows:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Execute script skill?                                    │
│─────────────────────────────────────────────────────────────│
│ Command: ./scripts/drop-db.sh --database users              │
│ Directory: /home/user/project                               │
│─────────────────────────────────────────────────────────────│
│                              [Cancel]  [Execute]            │
└─────────────────────────────────────────────────────────────┘
```

### Timeout

Always set appropriate timeouts:

```yaml
timeout: 30    # Quick operations
timeout: 120   # Build tasks
timeout: 600   # Test suites
```

### Path Validation

Scripts must be within workspace root. This fails:

```yaml
run: /etc/passwd        # ✗ Absolute path outside workspace
run: ../other-project/  # ✗ Path escapes workspace
```

---

## Environment Variables

### Static Environment

```yaml
env:
  NODE_ENV: production
  LOG_LEVEL: debug
  API_URL: https://api.example.com
```

### Dynamic from Args

```yaml
args:
  - name: environment
    env: DEPLOY_ENV
```

### Workspace Variables

```yaml
workdir: ${workspaceFolder}
run: ./scripts/build.sh

env:
  PROJECT_ROOT: ${workspaceFolder}
  BUILD_DIR: ${workspaceFolder}/build
```

---

## Using Skills in Workflows

Skills are referenced in workflow steps:

```yaml
# .agentx/workflows/spring-crud-endpoint.yaml
steps:
  - id: generate-entity
    name: Generate Entity
    skills: [generate_entity]          # Single skill
    prompt: |
      Create JPA entity {{entityName}}
    outputs:
      - name: entityCode

  - id: create-migration
    name: Create Migration  
    skills: [create_migration]         # Different skill
    # Skill args come from workflow context
    outputs:
      - name: migrationPath

  - id: build-and-test
    name: Build and Test
    skills: [build_module, run_tests]  # Multiple skills
    outputs:
      - name: buildResult
      - name: testResult
```

### Input Mapping

Workflow context variables map to skill args/inputs:

```yaml
# Workflow step
- id: create-migration
  skills: [create_migration]
  # These context variables map to skill args:
  # migrationName → skill.args[name=migrationName]
  # description   → skill.args[name=description]
```

### Output Chaining

Skill outputs become available in workflow context:

```yaml
steps:
  - id: generate-entity
    skills: [generate_entity]
    outputs:
      - name: entityCode
      - name: className

  - id: generate-service
    skills: [generate_service]
    prompt: |
      Create service for {{steps.generate-entity.className}}
```

---

## Best Practices

### Naming

```yaml
id: create_migration       # ✓ snake_case, verb_noun
id: createMigration        # ✗ camelCase
id: migration              # ✗ Missing verb
```

### Single Responsibility

```yaml
# ✓ Good - focused skill
id: create_migration
description: Creates a new migration file

# ✗ Bad - does too much
id: setup_everything
description: Creates migration, builds, tests, and deploys
```

### Always Define Outputs

```yaml
# ✓ Good - enables chaining
outputs:
  - name: filePath
    extract: pattern
    pattern: "Created: (.+)"

# ✗ Bad - no outputs, can't chain
outputs: []
```

### Reasonable Timeouts

```yaml
# ✓ Good - appropriate for task
timeout: 30    # Script that creates a file
timeout: 300   # Build task
timeout: 600   # Full test suite

# ✗ Bad - too long, masks hangs
timeout: 3600  # 1 hour for a simple script
```

### Descriptive Prompts (LLM)

```yaml
# ✓ Good - clear requirements
prompt: |
  Create a Spring @Service class.
  
  Requirements:
  - Use constructor injection
  - Add @Transactional on write methods
  - Return Optional for single entities
  
  Return only Java code.

# ✗ Bad - vague
prompt: |
  Make a service class.
```

---

## Troubleshooting

### Skill not found

```
Error: Unknown skill 'my_skill'
```

1. Check file exists: `.agentx/skills/my_skill.yaml`
2. Verify `id` matches: `id: my_skill`
3. Check YAML syntax

### Script not found

```
Error: Script not found: ./scripts/missing.sh
```

1. Verify script path in `run` field
2. Check script exists at that path
3. Ensure path is relative to workspace root

### Permission denied

```
Error: Permission denied: ./scripts/build.sh
```

1. Make script executable: `chmod +x ./scripts/build.sh`
2. Check file permissions

### Make target not found

```
Error: No rule to make target 'build-module'
```

1. Verify target exists in Makefile
2. Check `makefile` path if not using default
3. Ensure target name matches exactly

### Timeout exceeded

```
Error: Skill execution timed out after 60s
```

1. Increase `timeout` value
2. Optimize script/command
3. Check for infinite loops or hangs

### Pattern extraction failed

```
Warning: Pattern did not match, output is null
```

1. Test regex pattern against actual output
2. Check capture groups
3. Verify flags (g, m, i) are correct
4. Use a regex tester to debug

### LLM output unexpected

```
Error: Failed to extract className from response
```

1. Review prompt for clarity
2. Add explicit output format instructions
3. Lower temperature for consistency
4. Check pattern matches expected format

---

## Validation Checklist

| Field | Required | Validation |
|-------|----------|------------|
| `id` | ✓ | Unique, snake_case |
| `type` | ✓ | `script`, `make`, or `llm` |
| `name` | ✓ | Non-empty |
| `description` | ✓ | Non-empty |
| `run` | Script only | Valid path within workspace |
| `shell` | | Valid shell type |
| `target` | Make only | Non-empty |
| `prompt` | LLM only | Non-empty |
| `args[].name` | | Unique within skill |
| `outputs[].name` | | Unique within skill |
| `outputs[].extract` | | Valid extraction mode |
| `timeout` | | Positive integer |
| `temperature` | LLM only | 0.0 - 1.0 |
