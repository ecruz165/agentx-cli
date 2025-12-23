# AgentX VS Code Extension Manual Test Script

This document provides a comprehensive manual test script for the AgentX VS Code extension.
Tests require a workspace with a `.ai-config` folder (use `default-knowledge-base`).

## Quick Setup (Recommended)

Run the automated setup script from the repository root:

```bash
./packages/vscode-copilot/test-setup.sh
```

This script will:
1. Build the project
2. Package the extension
3. Install the extension in VS Code
4. Open VS Code with the `default-knowledge-base` workspace

---

## Manual Setup

### 1. Build and Package the Extension

```bash
# From repository root
pnpm run build

# Package the extension
cd packages/vscode-copilot
pnpm run package
```

### 2. Install the Extension

```bash
# Install via CLI (from repo root)
code --install-extension packages/vscode-copilot/agentx-vscode-1.0.0.vsix

# Or for VS Code Insiders
code-insiders --install-extension packages/vscode-copilot/agentx-vscode-1.0.0.vsix
```

**Alternative (UI method):**
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Install from VSIX"
4. Select `packages/vscode-copilot/agentx-vscode-1.0.0.vsix`

### 3. Open Test Workspace

```bash
# Open the example knowledge base in VS Code (from repo root)
code default-knowledge-base
```

**Note:** The `default-knowledge-base` folder already has a `.ai-config` folder with:
- `config.json` - Configuration with `knowledgeBase: "."` (uses current directory)
- `aliases/` - Sample alias definitions
- `intentions/` - Sample intention definitions
- `personas.json` - Sample persona definitions

### 4. Verify Prerequisites

- [ ] GitHub Copilot extension installed
- [ ] GitHub Copilot Chat extension installed
- [ ] Signed into GitHub Copilot
- [ ] VS Code version 1.90 or later

---

## 1. Extension Activation

### 1.1 Verify Activation
**Action:** Open a workspace with `.ai-config` folder
**Expected:** 
- "AgentX extension activated" notification appears
- Console shows "AgentX extension is now active"

### 1.2 Check Extension in Extensions Panel
**Action:** Open Extensions panel (`Ctrl+Shift+X`)
**Expected:** "AgentX for VS Code" appears in installed extensions

---

## 2. Command Palette Commands

### 2.1 List Available Commands
**Action:** Press `Ctrl+Shift+P`, type "AgentX"
**Expected:** Shows commands:
- AgentX: Execute Prompt
- AgentX: List Aliases
- AgentX: Show Alias Details
- AgentX: Show Configuration
- AgentX: Show Config Path

### 2.2 AgentX: List Aliases
**Action:** Run `AgentX: List Aliases` from command palette
**Expected:** 
- Quick pick shows all aliases (be-endpoint, be-service, be-api, etc.)
- Each shows name, description, and pattern count

### 2.3 AgentX: Show Alias Details
**Action:** Run `AgentX: Show Alias Details`, select `be-endpoint`
**Expected:** 
- Opens markdown document with:
  - Alias name and description
  - Patterns list
  - Resolved files with sizes
  - Total size

### 2.4 AgentX: Show Configuration
**Action:** Run `AgentX: Show Configuration`
**Expected:** 
- Opens markdown document with:
  - Config file path
  - All configuration values (provider, model, maxContextSize, etc.)

### 2.5 AgentX: Show Config Path
**Action:** Run `AgentX: Show Config Path`
**Expected:** 
- Shows notification with config file path
- "Open File" button opens the config file

### 2.6 AgentX: Execute Prompt
**Action:** Run `AgentX: Execute Prompt`
**Expected:** 
1. Quick pick shows alias selection
2. After selecting alias, input box for prompt appears
3. Progress notification shows "Building context..."
4. Progress shows "Sending to VS Code Copilot..."
5. Opens markdown document with response

---

## 3. Chat Participant (@agentx)

### 3.1 Open Copilot Chat
**Action:** Press `Ctrl+Shift+I` or click Copilot Chat icon
**Expected:** Chat panel opens

### 3.2 Help Command
**Action:** Type `@agentx /help`
**Expected:** Shows all available commands:
- /exec, /intentions, /alias, /config, /init, /help

### 3.3 Alias List Command
**Action:** Type `@agentx /alias list`
**Expected:** 
- Shows "Available Aliases" header
- Lists all aliases with descriptions
- Shows "📋 Show Details" buttons for each

### 3.4 Alias Show Command
**Action:** Type `@agentx /alias show be-endpoint`
**Expected:** 
- Shows alias name, description
- Shows patterns
- Shows resolved files table with sizes

### 3.5 Config Show Command
**Action:** Type `@agentx /config show`
**Expected:** 
- Shows "AgentX Configuration" header
- Shows config file path
- Shows table with all settings

### 3.6 Config Key Command
**Action:** Type `@agentx /config show -k provider`
**Expected:** Shows only the provider value

### 3.7 Config Path Command
**Action:** Type `@agentx /config path`
**Expected:** Shows config file path

### 3.8 Intentions List Command
**Action:** Type `@agentx /intentions list`
**Expected:** 
- Shows "Available Intentions" header
- Lists intentions with descriptions
- Shows usage example

### 3.9 Intention Show Command
**Action:** Type `@agentx /intentions create-new`
**Expected:** 
- Shows intention name, ID, description
- Shows requirements table
- Shows applicable aliases
- Shows usage example

### 3.10 Init Command
**Action:** Type `@agentx /init`
**Expected:** 
- Shows available frameworks (spec-kit, open-spec, bmad)
- Shows usage example for terminal

---

## 4. Exec Command (AI Execution)

### 4.1 Basic Exec
**Action:** Type `@agentx /exec be-endpoint "Create a customer endpoint"`
**Expected:** 
- Shows execution settings table (Provider, Alias, Context)
- Shows prompt
- Shows "Response" section with AI-generated content
- Response streams in real-time

### 4.2 Exec with Intention
**Action:** Type `@agentx /exec be-endpoint --intention create-new "event management"`
**Expected:** 
- Shows "Requirements Gathered" confirmation
- Shows intention name in settings
- Shows refined prompt (TOON format)
- Executes with structured context

### 4.3 Exec with Missing Requirements
**Action:** Type `@agentx /exec be-endpoint --intention create-new "something"`
**Expected:** 
- Shows "Intention: Create New" header
- Lists missing requirements
- Shows example of complete prompt

### 4.4 Invalid Alias
**Action:** Type `@agentx /exec nonexistent "test"`
**Expected:** 
- Shows "Alias not found" error
- Lists available aliases

### 4.5 Invalid Intention
**Action:** Type `@agentx /exec be-endpoint --intention nonexistent "test"`
**Expected:** 
- Shows "Intention not found" error
- Lists available intentions

### 4.6 Context Truncation Warning
**Action:** Execute with large context that exceeds token limit
**Expected:** 
- Shows "⚠️ Context was truncated to fit within token limit" warning
- Execution continues with truncated context

---

## 5. Completions and Suggestions

### 5.1 Alias Completions
**Action:** Type `@agentx /exec ` and wait for suggestions
**Expected:** 
- Shows alias suggestions (be-endpoint, be-service, etc.)
- Each shows description and pattern count

### 5.2 Alias + Intention Completions
**Action:** Type `@agentx /exec ` and look for combined suggestions
**Expected:** 
- Shows `alias:intention` combinations
- Example: `be-endpoint:create-new`

### 5.3 Persona Completions
**Action:** Type `@agentx /config ` and look for persona suggestions
**Expected:** 
- Shows `persona:backend`, `persona:frontend`, etc.
- Active persona marked with ✓

---

## 6. Token Limit Handling

### 6.1 Verify Token Estimation
**Action:** Execute with mock provider (if available) or check logs
**Expected:** 
- Context shows estimated token count
- Truncation occurs if exceeds limit

### 6.2 Large Context Handling
**Action:** Use alias with many files (be-endpoint has 7 files)
**Expected:** 
- Context builds successfully
- Shows file count and total size
- Truncates if needed with warning

---

## 7. Error Handling

### 7.1 No Copilot Available
**Action:** Disable GitHub Copilot extension, try `/exec`
**Expected:** 
- Shows "No Copilot language models available" error
- Suggests installing/authenticating Copilot

### 7.2 VS Code LM API Not Available
**Action:** Use VS Code < 1.90 (if possible to test)
**Expected:** 
- Shows "VS Code Language Model API not available" error
- Suggests updating VS Code

### 7.3 Cancelled Request
**Action:** Start `/exec`, then cancel (click X or press Escape)
**Expected:** 
- Shows "Request was cancelled" message
- No partial response shown

### 7.4 No Aliases Directory
**Action:** Open workspace without `.ai-config/aliases`
**Expected:** 
- Shows "Alias directory not found" warning
- Shows expected path

---

## 8. Persona Filtering

### 8.1 Set Active Persona (via CLI)
```bash
cd default-knowledge-base
agentx config set activePersona backend
```

### 8.2 Verify Filtered Aliases
**Action:** Type `@agentx /alias list`
**Expected:** 
- Shows "Available Aliases (Backend Developer)" header
- Only shows backend aliases (be-*, db-*, auth-*)
- Shows persona filter note

### 8.3 Clear Persona
```bash
agentx config set activePersona null
```

---

## 9. Cleanup

```bash
# Uninstall extension (optional)
# In VS Code: Extensions panel → AgentX → Uninstall

# Reset config
cd default-knowledge-base
agentx config set activePersona null
```

---

## Test Summary Checklist

| Category | Test | Pass |
|----------|------|------|
| Activation | Extension activates | ☐ |
| Commands | List Aliases | ☐ |
| Commands | Show Alias Details | ☐ |
| Commands | Show Configuration | ☐ |
| Commands | Show Config Path | ☐ |
| Commands | Execute Prompt | ☐ |
| Chat | /help | ☐ |
| Chat | /alias list | ☐ |
| Chat | /alias show | ☐ |
| Chat | /config show | ☐ |
| Chat | /config show -k | ☐ |
| Chat | /config path | ☐ |
| Chat | /intentions list | ☐ |
| Chat | /intentions <id> | ☐ |
| Chat | /init | ☐ |
| Exec | Basic exec | ☐ |
| Exec | Exec with intention | ☐ |
| Exec | Missing requirements | ☐ |
| Exec | Invalid alias | ☐ |
| Exec | Invalid intention | ☐ |
| Exec | Context truncation | ☐ |
| Completions | Alias suggestions | ☐ |
| Completions | Intention suggestions | ☐ |
| Tokens | Token estimation | ☐ |
| Tokens | Large context | ☐ |
| Errors | No Copilot | ☐ |
| Errors | Cancelled request | ☐ |
| Errors | No aliases directory | ☐ |
| Persona | Filtered aliases | ☐ |

