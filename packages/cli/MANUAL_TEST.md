# AgentX CLI Manual Test Script

This document provides a comprehensive manual test script for all AgentX CLI features.
Tests use the `example-knowledge-base` directory included in the repository.

## Prerequisites

```bash
# Build the project
pnpm run build

# Set up environment to use example-knowledge-base
export AGENTX_CONFIG_PATH="$(pwd)/example-knowledge-base/.ai-config/config.json"

# Or run from example-knowledge-base directory
cd example-knowledge-base
```

---

## 1. Help & Version

### 1.1 Display Help
```bash
agentx --help
```
**Expected:** Shows main help with available commands (exec, init, alias, config)

### 1.2 Display Version
```bash
agentx --version
```
**Expected:** Shows version number (e.g., `1.0.0`)

### 1.3 Command-Specific Help
```bash
agentx exec --help
agentx alias --help
agentx config --help
agentx init --help
```
**Expected:** Each shows command-specific options and usage

---

## 2. Configuration Commands

### 2.1 Show Full Configuration
```bash
agentx config show
```
**Expected:** Displays all config values including provider, model, knowledgeBase, personas, etc.

### 2.2 Show Specific Config Key
```bash
agentx config show -k provider
agentx config show -k maxContextSize
agentx config show -k personas
```
**Expected:** Shows only the requested value

### 2.3 Set Configuration Value
```bash
agentx config set maxContextSize 65536
agentx config show -k maxContextSize
```
**Expected:** Shows old value → new value, then confirms change

### 2.4 Set Active Persona
```bash
agentx config set activePersona backend
agentx config show -k activePersona
```
**Expected:** Sets persona to "backend"

### 2.5 Clear Active Persona
```bash
agentx config set activePersona null
```
**Expected:** Clears the active persona

### 2.6 Reset Configuration
```bash
agentx config reset
agentx config show
```
**Expected:** Resets to default values

---

## 3. Alias Commands

### 3.1 List All Aliases
```bash
agentx alias list
```
**Expected:** Shows table with NAME, DESCRIPTION, PATTERNS columns
- Should show: be-endpoint, be-service, be-api, fe-component, etc.

### 3.2 List Aliases with Active Persona
```bash
agentx config set activePersona backend
agentx alias list
```
**Expected:** Shows only backend aliases (be-*, db-*, auth-*)

```bash
agentx config set activePersona frontend
agentx alias list
```
**Expected:** Shows only frontend aliases (fe-*, ui-*)

### 3.3 Show Alias Details
```bash
agentx alias show be-endpoint
```
**Expected:** Shows alias name, description, and patterns

### 3.4 Show Alias with Resolved Files
```bash
agentx alias show be-endpoint --resolve
```
**Expected:** Shows alias details plus list of resolved files with sizes

### 3.5 Show Non-Existent Alias
```bash
agentx alias show nonexistent
```
**Expected:** Error message with suggestions for similar aliases

---

## 4. Exec Command - Basic Usage

### 4.1 Dry Run (No AI Call)
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run
```
**Expected:** Shows context that would be sent without calling AI

### 4.2 Verbose Mode
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --verbose
```
**Expected:** Shows detailed settings including file list

### 4.3 Quiet Mode
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --quiet
```
**Expected:** Minimal output

### 4.4 Additional Files
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run -f README.md package.json
```
**Expected:** Shows additional files included in context

### 4.5 Max Context Override
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --max-context 8192
```
**Expected:** Shows truncated context if files exceed 8KB

---

## 5. Exec Command - Intentions

### 5.1 List Available Intentions
```bash
agentx exec be-endpoint "test" --list-intentions
```
**Expected:** Shows available intentions: create-new, add-field, integrate, refactor

### 5.2 Execute with Intention
```bash
agentx exec be-endpoint "Create order management" --intention create-new --dry-run
```
**Expected:** Shows structured prompt with intention requirements

### 5.3 Execute with Short Intention Flag
```bash
agentx exec be-endpoint "Add status field" -i add-field --dry-run
```
**Expected:** Shows structured prompt for add-field intention

---

## 6. Exec Command - Output Options

### 6.1 Save to File (Markdown)
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --file output.md
```
**Expected:** Creates output.md with markdown content

### 6.2 Save to File (JSON)
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --file output.json --output-format json
```
**Expected:** Creates output.json with JSON structure

### 6.3 Save to File (TOON)
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --file output.toon --output-format toon
```
**Expected:** Creates output.toon with TOON-optimized format

### 6.4 Save to File (Raw)
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --file output.txt --output-format raw
```
**Expected:** Creates output.txt with raw text

### 6.5 Disable Markdown Formatting
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --no-format
```
**Expected:** Output without terminal markdown rendering

### 6.6 Browser Output
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --browser
```
**Expected:** Opens response in default browser with copy button

### 6.7 Combined File and Browser
```bash
agentx exec be-endpoint "Create an order endpoint" --dry-run --file output.md --browser
```
**Expected:** Saves to file AND opens in browser

---

## 7. Init Command

### 7.1 Initialize spec-kit Project
```bash
agentx init spec-kit -t bff-service -n test-bff -o /tmp/test-bff
ls -la /tmp/test-bff
```
**Expected:** Creates project with .ai-config.json, README.md, PROJECT.yaml, specs/

### 7.2 Initialize open-spec Project
```bash
agentx init open-spec -t openapi -n test-api -o /tmp/test-api
ls -la /tmp/test-api
```
**Expected:** Creates project with openapi/spec.yaml

### 7.3 Initialize bmad Project
```bash
agentx init bmad -t business-model -n test-model -o /tmp/test-model
ls -la /tmp/test-model
```
**Expected:** Creates project with models/ and docs/ directories

### 7.4 Invalid Framework
```bash
agentx init invalid-framework -t test -n test
```
**Expected:** Error with list of valid frameworks

### 7.5 Invalid Template
```bash
agentx init spec-kit -t invalid-template -n test
```
**Expected:** Error with list of valid templates for spec-kit

---

## 8. Persona Features

### 8.1 Persona with Perspective
```bash
agentx config set activePersona architect
agentx exec be-endpoint "Design system architecture" --dry-run
```
**Expected:** Context includes persona perspective prefix:
```
[SYSTEM]
You are a senior software architect...

[PERSPECTIVE: Architect]
Approach problems from a systems thinking perspective.
Tone: strategic, analytical, forward-thinking
Focus on: system design, trade-offs, scalability...
```

### 8.2 Switch Personas
```bash
agentx config set activePersona backend
agentx exec be-endpoint "Create endpoint" --dry-run
```
**Expected:** Different perspective for backend developer

---

## 9. Error Handling

### 9.1 Alias Not Found
```bash
agentx exec nonexistent-alias "test"
```
**Expected:** Error with suggestions for similar aliases

### 9.2 Missing Required Argument
```bash
agentx exec be-endpoint
```
**Expected:** Error about missing prompt argument

### 9.3 Invalid Config Key
```bash
agentx config set invalidKey value
```
**Expected:** Error with list of valid keys

---

## 10. Cleanup

```bash
# Remove test files
rm -f output.md output.json output.toon output.txt
rm -rf /tmp/test-bff /tmp/test-api /tmp/test-model

# Reset config
agentx config set activePersona null
agentx config set maxContextSize 32768
```

---

## Test Summary Checklist

| Category | Test | Pass |
|----------|------|------|
| Help | --help | ☐ |
| Help | --version | ☐ |
| Config | show | ☐ |
| Config | show -k | ☐ |
| Config | set | ☐ |
| Config | reset | ☐ |
| Alias | list | ☐ |
| Alias | list (persona filtered) | ☐ |
| Alias | show | ☐ |
| Alias | show --resolve | ☐ |
| Exec | --dry-run | ☐ |
| Exec | --verbose | ☐ |
| Exec | --quiet | ☐ |
| Exec | -f (additional files) | ☐ |
| Exec | --max-context | ☐ |
| Exec | --list-intentions | ☐ |
| Exec | --intention | ☐ |
| Exec | --file | ☐ |
| Exec | --output-format | ☐ |
| Exec | --no-format | ☐ |
| Exec | --browser | ☐ |
| Init | spec-kit | ☐ |
| Init | open-spec | ☐ |
| Init | bmad | ☐ |
| Persona | perspective injection | ☐ |
| Errors | alias not found | ☐ |
| Errors | invalid config key | ☐ |

