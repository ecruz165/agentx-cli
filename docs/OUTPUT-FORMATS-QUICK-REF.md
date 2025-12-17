# Output Formats Quick Reference

## Command Syntax

```bash
agentx exec <alias> "<prompt>" --file <path> [--output-format <format>]
```

## Formats

| Format | Extension | Use Case | Metadata |
|--------|-----------|----------|----------|
| `markdown` | `.md` | Documentation, human-readable | ✅ Yes |
| `json` | `.json` | APIs, automation, processing | ✅ Yes |
| `toon` | `.toon` | LLM workflows, token optimization | ✅ Yes |
| `raw` | `.txt` | Plain text, piping | ❌ No |

## Quick Examples

```bash
# Markdown (default)
agentx exec bff "Design schema" --file design.md

# JSON
agentx exec bff "Design schema" --file design.json --output-format json

# TOON (Token-Oriented Object Notation - optimized for LLMs)
agentx exec bff "Design schema" --file design.toon --output-format toon

# Raw
agentx exec bff "Design schema" --file design.txt --output-format raw

# Use default location (just filename)
agentx exec bff "Design schema" --file design
```

## Configuration

```bash
# Set defaults
agentx config set outputFormat json
agentx config set outputLocation ~/ai-responses

# View current config
agentx config show
```

## Metadata Fields

All formats (except raw) include:
- `timestamp` - When generated
- `provider` - AI provider used
- `alias` - Context alias
- `version` - CLI version
- `prompt` - Original prompt
- `contextFiles` - Files used
- `content` - AI response

## Path Handling

| Input | Result |
|-------|--------|
| `/abs/path/file.md` | Absolute path |
| `./rel/path/file.md` | Relative to current dir |
| `filename` | Uses `outputLocation` config |
| `file` (no ext) | Auto-adds extension |

## Common Patterns

### Save Multiple Formats
```bash
PROMPT="Design API"
agentx exec api "$PROMPT" --file design.md
agentx exec api "$PROMPT" --file design.json --output-format json
```

### Timestamped Files
```bash
TS=$(date +%Y%m%d-%H%M%S)
agentx exec bff "Design" --file "design-$TS.md"
```

### Organized Structure
```bash
agentx exec bff "Schema" --file schemas/user.md
agentx exec api "Endpoints" --file apis/user.md
agentx exec test "Tests" --file tests/user.md
```

### Quiet Mode + File
```bash
agentx exec bff "Generate code" --file code.md --quiet
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid-format` | Unknown format | Use: toon, json, markdown, raw |
| `file-write-error` | Permission denied | Check write permissions |

## See Also

- [Full Guide](./OUTPUT-FORMATS.md) - Comprehensive documentation
- [README](../README.md) - Main documentation
- [Setup Guide](SETUP.md) - Installation instructions
