# AgentX CLI Setup Guide

This guide explains how to use the automated setup script to install and configure AgentX CLI.

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/ecruz165/agentx-cli.git
cd agentx-cli

# Run the setup script
npm run setup
```

## What the Setup Script Does

The `setup.sh` script automates the entire installation and configuration process:

### 1. Prerequisites Check
- Verifies Node.js 16+ is installed
- Verifies npm is available
- Displays version information

### 2. Project Build
- Installs npm dependencies (if needed)
- Compiles TypeScript to JavaScript
- Creates the `dist/` directory

### 3. Global Installation
- Installs `agentx` command globally via `npm link`
- Checks for existing installations
- Prompts for reinstallation if already installed
- Verifies the command is available

### 4. Configuration Setup
Prompts for the following settings:

#### Provider
Choose your AI provider:
- `copilot` (default) - GitHub Copilot CLI
- `claude` - Anthropic Claude API
- `openai` - OpenAI API
- `mock` - Mock provider for testing

#### Knowledge Base Path
Specify where your enterprise documentation is stored:
- Default: `~/agentx-enterprise-docs`
- Can use `~` for home directory
- Directory will be created if it doesn't exist

The script creates a configuration file at `~/.agentx/config.json` with:
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
  }
}
```

### 5. PATH Configuration
- Checks if npm global bin directory is in your PATH
- Offers to add it automatically to your shell profile
- Supports bash, zsh, and fish shells
- Detects macOS vs Linux shell profiles

### 6. Summary
Displays:
- Installation status
- Configuration details
- Next steps and helpful commands

## Interactive Prompts

During setup, you'll be asked:

1. **Provider selection**: Enter your preferred AI provider (default: copilot)
2. **Knowledge base path**: Enter the path to your documentation (default: ~/agentx-enterprise-docs)
3. **Create knowledge base**: If the directory doesn't exist, create it? (Y/n)
4. **Add to PATH**: Add npm global bin to your shell profile? (Y/n)

## Example Session

```bash
$ npm run setup

╔════════════════════════════════════════════════════════════╗
║          AgentX CLI Setup                              ║
╚════════════════════════════════════════════════════════════╝

ℹ Checking prerequisites...
✓ Node.js v20.10.0 detected
✓ npm 10.2.3 detected

ℹ Building TypeScript project...
✓ Project built successfully

ℹ Installing agentx globally...
✓ agentx installed globally (1.0.0)

ℹ Configuring AgentX...

Available providers: copilot, claude, openai, mock
Enter AI provider [copilot]: claude

Enter knowledge base path [~/agentx-enterprise-docs]: ~/my-docs

✓ Configuration saved to ~/.agentx/config.json
Knowledge base directory doesn't exist. Create it? (Y/n): y
✓ Created knowledge base directory: ~/my-docs

ℹ Checking PATH configuration...
⚠ npm global bin (/usr/local/lib/node_modules/.bin) is not in PATH

Would you like to add it to your PATH? (Y/n): y
✓ Added npm global bin to ~/.zshrc
⚠ Please restart your terminal or run: source ~/.zshrc

╔════════════════════════════════════════════════════════════╗
║          Setup Complete!                               ║
╚════════════════════════════════════════════════════════════╝

✓ AgentX CLI is ready to use!

Configuration:
  Provider:       claude
  Knowledge Base: ~/my-docs
  Config File:    ~/.agentx/config.json

Next Steps:
  1. Verify installation:  agentx --version
  2. View configuration:   agentx config show
  3. List aliases:         agentx alias list
  4. Get help:             agentx --help
```

## Manual Configuration

If you prefer to configure manually after installation:

```bash
# Set provider
agentx config set provider claude

# Set knowledge base
agentx config set knowledgeBase ~/my-docs

# View current configuration
agentx config show
```

## Troubleshooting

### Command not found after installation
If `agentx` command is not found after installation:

1. Check if npm global bin is in PATH:
   ```bash
   echo $PATH | grep $(npm bin -g)
   ```

2. Add npm global bin to PATH manually:
   ```bash
   # For bash
   echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.bashrc
   source ~/.bashrc
   
   # For zsh
   echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Or use the full path:
   ```bash
   $(npm bin -g)/agentx --version
   ```

### Permission errors during npm link
If you get permission errors:

```bash
# Option 1: Use sudo (not recommended)
sudo npm link

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Build errors
If the build fails:

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Uninstallation

To uninstall AgentX CLI:

```bash
# Unlink global command
npm unlink -g agentx-cli

# Remove configuration (optional)
rm -rf ~/.agentx
```

## See Also

- [README.md](../README.md) - Main documentation
- [Configuration Guide](../README.md#configuration) - Detailed configuration options
- [Commands Reference](../README.md#commands) - All available commands

