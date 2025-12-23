# Scripts

Scripts are executable files invoked by skills of type `script`. They perform actions like file generation, builds, migrations, and system operations.

## Overview

Scripts are referenced by skill definitions:

```yaml
# .agentx/skills/create_migration.yaml
id: create_migration
type: script
run: .agentx/scripts/create-migration.sh    # ← References script
shell: bash
```

When a workflow step invokes the skill, the script executes with the provided arguments.

## Directory Structure

```
.agentx/scripts/
├── create-migration.sh
├── create-migration.ps1      # Windows variant
├── scaffold-entity.py
├── run-tests.sh
├── format-code.sh
├── generate-docs.js
└── README.md
```

---

## How Scripts Work

```
┌─────────────────────────────────────────────────────────────┐
│  WORKFLOW STEP                                              │
│  └── skills: [create_migration]                             │
│                                                             │
│  SKILL DEFINITION                                           │
│  └── type: script                                           │
│      run: .agentx/scripts/create-migration.sh               │
│      args: [migrationName, description]                     │
│                                                             │
│  EXECUTION                                                  │
│  └── .agentx/scripts/create-migration.sh \                  │
│        --name AddUsersTable \                               │
│        --desc "Create users table"                          │
│                                                             │
│  OUTPUT                                                     │
│  └── stdout captured, patterns extracted                    │
│      → outputs: { filePath, version }                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Script Requirements

### Executable Permission (Unix)

```bash
chmod +x .agentx/scripts/create-migration.sh
```

### Shebang Line

```bash
#!/bin/bash
# or
#!/usr/bin/env python3
# or
#!/usr/bin/env node
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid arguments |

```bash
#!/bin/bash
if [ -z "$1" ]; then
  echo "Error: Missing required argument" >&2
  exit 2
fi

# ... do work ...

exit 0
```

### Output for Extraction

Skills extract outputs from stdout. Use consistent, parseable formats:

```bash
# Good - parseable patterns
echo "Created: src/db/V001__AddUsers.sql"
echo "Version: V001"

# Bad - unparseable
echo "Done!"
```

---

## Examples

### Bash: Create Migration

```bash
#!/bin/bash
# .agentx/scripts/create-migration.sh
#
# Creates a new Flyway migration file with auto-versioning.
#
# Usage: create-migration.sh --name <name> [--desc <description>]

set -euo pipefail

# Defaults
NAME=""
DESC=""
MIGRATIONS_DIR="${MIGRATIONS_DIR:-src/main/resources/db/migration}"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name)
      NAME="$2"
      shift 2
      ;;
    --desc)
      DESC="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

# Validate
if [ -z "$NAME" ]; then
  echo "Error: --name is required" >&2
  exit 2
fi

# Calculate next version
LAST_VERSION=$(ls -1 "$MIGRATIONS_DIR"/V*.sql 2>/dev/null | \
  sed 's/.*V\([0-9]*\).*/\1/' | \
  sort -n | \
  tail -1)
NEXT_VERSION=$((${LAST_VERSION:-0} + 1))
VERSION=$(printf "V%03d" $NEXT_VERSION)

# Create file
FILENAME="${VERSION}__${NAME}.sql"
FILEPATH="${MIGRATIONS_DIR}/${FILENAME}"

mkdir -p "$MIGRATIONS_DIR"

cat > "$FILEPATH" << EOF
-- ${DESC:-Migration: $NAME}
-- Generated: $(date -Iseconds)

-- Add your SQL here

EOF

# Output for skill extraction
echo "Version: ${VERSION}"
echo "Created: ${FILEPATH}"
```

**Corresponding skill:**

```yaml
# .agentx/skills/create_migration.yaml
id: create_migration
type: script
name: Create Migration
run: .agentx/scripts/create-migration.sh
shell: bash

args:
  - name: migrationName
    flag: --name
    required: true
  - name: description
    flag: --desc

env:
  MIGRATIONS_DIR: src/main/resources/db/migration

outputs:
  - name: version
    extract: pattern
    pattern: "Version: (V\\d+)"
  - name: filePath
    extract: pattern
    pattern: "Created: (.+)"
```

### Bash: Run Tests

```bash
#!/bin/bash
# .agentx/scripts/run-tests.sh
#
# Runs tests for a specific module with optional coverage.
#
# Usage: run-tests.sh --module <module> [--coverage] [--filter <pattern>]

set -euo pipefail

MODULE=""
COVERAGE=false
FILTER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --module)
      MODULE="$2"
      shift 2
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --filter)
      FILTER="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [ -z "$MODULE" ]; then
  echo "Error: --module is required" >&2
  exit 2
fi

# Build Maven command
MVN_ARGS="-pl $MODULE test"

if [ "$COVERAGE" = true ]; then
  MVN_ARGS="$MVN_ARGS -Pcoverage"
fi

if [ -n "$FILTER" ]; then
  MVN_ARGS="$MVN_ARGS -Dtest=$FILTER"
fi

# Run tests
mvn $MVN_ARGS 2>&1 | tee /tmp/test-output.txt

# Parse results
TESTS_RUN=$(grep -oP 'Tests run: \K\d+' /tmp/test-output.txt | tail -1)
FAILURES=$(grep -oP 'Failures: \K\d+' /tmp/test-output.txt | tail -1)
SKIPPED=$(grep -oP 'Skipped: \K\d+' /tmp/test-output.txt | tail -1)

# Output for extraction
echo "Tests run: ${TESTS_RUN:-0}"
echo "Failures: ${FAILURES:-0}"
echo "Skipped: ${SKIPPED:-0}"

# Exit with failure if tests failed
if [ "${FAILURES:-0}" -gt 0 ]; then
  exit 1
fi
```

### Bash: Format Code

```bash
#!/bin/bash
# .agentx/scripts/format-code.sh
#
# Formats code files using appropriate formatters.
#
# Usage: format-code.sh <file>...

set -euo pipefail

FORMATTED=0
FAILED=0

for FILE in "$@"; do
  EXT="${FILE##*.}"
  
  case "$EXT" in
    java)
      google-java-format -i "$FILE" && ((FORMATTED++)) || ((FAILED++))
      ;;
    ts|tsx|js|jsx)
      prettier --write "$FILE" && ((FORMATTED++)) || ((FAILED++))
      ;;
    py)
      black "$FILE" && ((FORMATTED++)) || ((FAILED++))
      ;;
    *)
      echo "Unknown format: $FILE" >&2
      ;;
  esac
done

echo "Formatted: $FORMATTED"
echo "Failed: $FAILED"

[ "$FAILED" -eq 0 ] || exit 1
```

### Python: Scaffold Entity

```python
#!/usr/bin/env python3
"""
.agentx/scripts/scaffold-entity.py

Generates entity-related files from a template.

Usage: scaffold-entity.py --name <EntityName> --fields <field:type,...>
"""

import argparse
import os
import sys
from pathlib import Path
from datetime import datetime

def parse_fields(fields_str: str) -> list[dict]:
    """Parse 'name:Type,name:Type' into list of dicts."""
    fields = []
    for field in fields_str.split(','):
        name, type_ = field.strip().split(':')
        fields.append({'name': name.strip(), 'type': type_.strip()})
    return fields

def to_snake_case(name: str) -> str:
    """Convert PascalCase to snake_case."""
    import re
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

def generate_entity(name: str, fields: list[dict], package: str) -> str:
    """Generate JPA entity class."""
    field_lines = []
    for f in fields:
        field_lines.append(f"    private {f['type']} {f['name']};")
    
    return f'''package {package}.domain;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "{to_snake_case(name)}s")
public class {name} {{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

{chr(10).join(field_lines)}

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}}
'''

def main():
    parser = argparse.ArgumentParser(description='Scaffold entity files')
    parser.add_argument('--name', required=True, help='Entity name (PascalCase)')
    parser.add_argument('--fields', required=True, help='Fields as name:Type,name:Type')
    parser.add_argument('--package', default='com.example', help='Base package')
    parser.add_argument('--output-dir', default='src/main/java', help='Output directory')
    
    args = parser.parse_args()
    
    fields = parse_fields(args.fields)
    package_path = args.package.replace('.', '/')
    output_path = Path(args.output_dir) / package_path / 'domain'
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Generate entity
    entity_content = generate_entity(args.name, fields, args.package)
    entity_file = output_path / f"{args.name}.java"
    entity_file.write_text(entity_content)
    
    # Output for extraction
    print(f"Entity: {args.name}")
    print(f"Created: {entity_file}")
    print(f"Package: {args.package}.domain")

if __name__ == '__main__':
    main()
```

### Node.js: Generate Docs

```javascript
#!/usr/bin/env node
/**
 * .agentx/scripts/generate-docs.js
 *
 * Generates API documentation from source files.
 *
 * Usage: generate-docs.js --input <dir> --output <dir>
 */

const fs = require('fs');
const path = require('path');

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    result[key] = args[i + 1];
  }
  return result;
}

function findFiles(dir, ext) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractJsDoc(content) {
  const pattern = /\/\*\*\s*\n([^*]|\*(?!\/))*\*\//g;
  return content.match(pattern) || [];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  
  if (!args.input || !args.output) {
    console.error('Usage: generate-docs.js --input <dir> --output <dir>');
    process.exit(2);
  }
  
  const inputDir = args.input;
  const outputDir = args.output;
  
  // Find source files
  const files = findFiles(inputDir, '.js');
  let docsGenerated = 0;
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Process each file
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const docs = extractJsDoc(content);
    
    if (docs.length > 0) {
      const relativePath = path.relative(inputDir, file);
      const docFile = path.join(outputDir, relativePath.replace('.js', '.md'));
      
      fs.mkdirSync(path.dirname(docFile), { recursive: true });
      fs.writeFileSync(docFile, `# ${relativePath}\n\n${docs.join('\n\n')}`);
      docsGenerated++;
    }
  }
  
  // Output for extraction
  console.log(`Files processed: ${files.length}`);
  console.log(`Docs generated: ${docsGenerated}`);
  console.log(`Output: ${outputDir}`);
}

main();
```

### PowerShell: Create Migration (Windows)

```powershell
#!/usr/bin/env pwsh
# .agentx/scripts/create-migration.ps1
#
# Creates a new Flyway migration file (Windows version).
#
# Usage: create-migration.ps1 -Name <name> [-Description <desc>]

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [string]$Description = "",
    
    [string]$MigrationsDir = "src/main/resources/db/migration"
)

$ErrorActionPreference = "Stop"

# Calculate next version
$existingMigrations = Get-ChildItem -Path $MigrationsDir -Filter "V*.sql" -ErrorAction SilentlyContinue
$lastVersion = 0

if ($existingMigrations) {
    $lastVersion = $existingMigrations | 
        ForEach-Object { [int]($_.Name -replace 'V(\d+).*', '$1') } |
        Measure-Object -Maximum |
        Select-Object -ExpandProperty Maximum
}

$nextVersion = $lastVersion + 1
$version = "V{0:D3}" -f $nextVersion

# Create file
$filename = "${version}__${Name}.sql"
$filepath = Join-Path $MigrationsDir $filename

New-Item -ItemType Directory -Path $MigrationsDir -Force | Out-Null

$content = @"
-- $Description
-- Generated: $(Get-Date -Format "o")

-- Add your SQL here

"@

Set-Content -Path $filepath -Value $content

# Output for extraction
Write-Output "Version: $version"
Write-Output "Created: $filepath"
```

---

## Argument Handling

### Flag Arguments

```bash
# Skill definition
args:
  - name: migrationName
    flag: --name

# Script receives
./script.sh --name AddUsers
```

### Short Flags

```bash
# Skill definition
args:
  - name: verbose
    shortFlag: -v
    type: boolean

# Script receives
./script.sh -v
```

### Positional Arguments

```bash
# Skill definition
args:
  - name: targetFile
    positional: 0
  - name: outputFile
    positional: 1

# Script receives
./script.sh input.txt output.txt
```

### Parsing in Bash

```bash
#!/bin/bash

# Named arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name) NAME="$2"; shift 2 ;;
    --desc) DESC="$2"; shift 2 ;;
    -v|--verbose) VERBOSE=true; shift ;;
    *) POSITIONAL+=("$1"); shift ;;
  esac
done

# Access positional
INPUT="${POSITIONAL[0]}"
OUTPUT="${POSITIONAL[1]}"
```

### Parsing in Python

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--name', required=True)
parser.add_argument('--desc', default='')
parser.add_argument('-v', '--verbose', action='store_true')
parser.add_argument('files', nargs='*')

args = parser.parse_args()
```

### Parsing in Node.js

```javascript
const args = process.argv.slice(2);
const options = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    options[key] = args[++i];
  } else if (args[i].startsWith('-')) {
    options[args[i].slice(1)] = true;
  } else {
    positional.push(args[i]);
  }
}
```

---

## Environment Variables

Skills can pass environment variables to scripts.

### Skill Definition

```yaml
env:
  MIGRATIONS_DIR: src/main/resources/db/migration
  LOG_LEVEL: debug

args:
  - name: module
    env: TARGET_MODULE    # Arg passed as env var
```

### Access in Script

```bash
#!/bin/bash
echo "Migrations dir: $MIGRATIONS_DIR"
echo "Log level: $LOG_LEVEL"
echo "Module: $TARGET_MODULE"
```

---

## Output Patterns

Design stdout for reliable extraction.

### Key-Value Pattern

```bash
echo "Version: V001"
echo "Created: /path/to/file.sql"
echo "Duration: 1.5s"
```

```yaml
outputs:
  - name: version
    extract: pattern
    pattern: "Version: (.+)"
```

### JSON Output

```bash
echo '{"version": "V001", "path": "/path/to/file.sql"}'
```

```yaml
outputs:
  - name: version
    extract: json
    jsonPath: "$.version"
```

### Multi-Line Lists

```bash
echo "Created files:"
echo "- src/Entity.java"
echo "- src/Repository.java"
echo "- src/Service.java"
```

```yaml
outputs:
  - name: files
    extract: pattern
    pattern: "^- (.+)$"
    flags: gm
    multiple: true
```

---

## Error Handling

### Exit Codes

```bash
#!/bin/bash
set -euo pipefail    # Exit on error, undefined var, pipe failure

# Validation
if [ -z "$NAME" ]; then
  echo "Error: NAME is required" >&2
  exit 2
fi

# Operation that might fail
if ! some_command; then
  echo "Error: Command failed" >&2
  exit 1
fi

exit 0
```

### Stderr for Errors

```bash
# Errors go to stderr (not captured as output)
echo "Error: Something went wrong" >&2

# Success messages go to stdout (captured)
echo "Created: /path/to/file"
```

### Cleanup on Exit

```bash
#!/bin/bash

TEMP_DIR=""

cleanup() {
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}

trap cleanup EXIT

TEMP_DIR=$(mktemp -d)
# ... use temp dir ...
```

---

## Cross-Platform Scripts

### Platform Detection

```bash
#!/bin/bash

case "$(uname -s)" in
  Linux*)   PLATFORM="linux" ;;
  Darwin*)  PLATFORM="mac" ;;
  MINGW*|CYGWIN*|MSYS*) PLATFORM="windows" ;;
  *)        PLATFORM="unknown" ;;
esac

echo "Running on: $PLATFORM"
```

### Separate Scripts

Provide platform-specific variants:

```
.agentx/scripts/
├── create-migration.sh       # Unix (bash)
├── create-migration.ps1      # Windows (PowerShell)
```

```yaml
# .agentx/skills/create_migration.yaml
run: .agentx/scripts/create-migration.sh
shell: bash

platform:
  windows:
    run: .agentx/scripts/create-migration.ps1
    shell: pwsh
```

### Portable Alternatives

Use cross-platform tools:

```yaml
# Python works everywhere
run: .agentx/scripts/create-migration.py
shell: python

# Node.js works everywhere
run: .agentx/scripts/create-migration.js
shell: node
```

---

## Best Practices

### Use Strict Mode

```bash
#!/bin/bash
set -euo pipefail    # Bash strict mode
```

```python
#!/usr/bin/env python3
import sys
sys.exit(main())     # Explicit exit
```

### Validate Inputs

```bash
if [ -z "$REQUIRED_ARG" ]; then
  echo "Error: --required-arg is required" >&2
  exit 2
fi
```

### Predictable Output

```bash
# ✓ Good - consistent format
echo "Created: ${FILEPATH}"
echo "Version: ${VERSION}"

# ✗ Bad - inconsistent
echo "Done! File is at ${FILEPATH} (version ${VERSION})"
```

### Idempotent Operations

```bash
# ✓ Good - safe to run multiple times
mkdir -p "$OUTPUT_DIR"

# ✗ Bad - fails if exists
mkdir "$OUTPUT_DIR"
```

### Document Usage

```bash
#!/bin/bash
# .agentx/scripts/my-script.sh
#
# Brief description of what this script does.
#
# Usage: my-script.sh --name <name> [--optional <value>]
#
# Arguments:
#   --name      Required. The name to use.
#   --optional  Optional. Some optional value.
#
# Environment:
#   OUTPUT_DIR  Directory for output files.
#
# Exit codes:
#   0  Success
#   1  General error
#   2  Invalid arguments
```

---

## Troubleshooting

### Permission Denied

```
Error: Permission denied: .agentx/scripts/script.sh
```

```bash
chmod +x .agentx/scripts/script.sh
```

### Command Not Found

```
Error: python3: command not found
```

1. Check interpreter is installed
2. Verify PATH includes interpreter
3. Use full path in shebang

### Pattern Not Matching

```
Warning: Pattern did not match
```

1. Run script manually, check actual output
2. Test regex against output
3. Check for ANSI escape codes in output

### Script Hangs

1. Add timeout to skill definition
2. Check for interactive prompts (use `-y` flags)
3. Ensure stdin is not expected

---

## Validation Checklist

| Aspect | Check |
|--------|-------|
| **Shebang** | First line is valid interpreter |
| **Permissions** | Executable bit set (Unix) |
| **Exit codes** | Returns 0 on success, non-zero on error |
| **Output** | Stdout has parseable patterns |
| **Errors** | Errors go to stderr |
| **Arguments** | Validates required arguments |
| **Dependencies** | Documents required tools |
| **Portability** | Works on target platforms |
