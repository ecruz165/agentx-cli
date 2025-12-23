#!/bin/bash
# AgentX VS Code Extension - Quick Test Setup
# This script builds, packages, installs, and opens VS Code for testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() { echo -e "${BLUE}==>${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXAMPLE_KB="$REPO_ROOT/default-knowledge-base"
VSIX_FILE="$SCRIPT_DIR/agentx-vscode-1.0.0.vsix"

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AgentX VS Code Extension - Quick Test Setup           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v code &> /dev/null; then
    print_error "VS Code CLI 'code' not found. Please install VS Code and add to PATH."
    echo "  On Mac: Open VS Code → Cmd+Shift+P → 'Shell Command: Install code command'"
    exit 1
fi
print_success "VS Code CLI found"

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm not found. Please install: npm install -g pnpm"
    exit 1
fi
print_success "pnpm found"

# Build the project
print_step "Building project..."
cd "$REPO_ROOT"
pnpm run build > /dev/null 2>&1
print_success "Build complete"

# Package the extension
print_step "Packaging extension..."
cd "$SCRIPT_DIR"
pnpm run package > /dev/null 2>&1
print_success "Extension packaged: $VSIX_FILE"

# Install the extension
print_step "Installing extension..."
code --install-extension "$VSIX_FILE" --force > /dev/null 2>&1
print_success "Extension installed"

# Check if Copilot extensions are installed
print_step "Checking GitHub Copilot extensions..."
COPILOT_INSTALLED=$(code --list-extensions 2>/dev/null | grep -c "github.copilot" || true)
if [ "$COPILOT_INSTALLED" -lt 2 ]; then
    print_warning "GitHub Copilot extensions may not be fully installed"
    echo "  Required: github.copilot and github.copilot-chat"
    echo "  Install from VS Code Extensions marketplace"
fi

# Open VS Code with example knowledge base
print_step "Opening VS Code with default-knowledge-base..."
code "$EXAMPLE_KB"
print_success "VS Code opened"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete!                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Wait for VS Code to fully load"
echo "  2. Look for 'AgentX extension activated' notification"
echo "  3. Open Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)"
echo "  4. Try: @agentx /help"
echo ""
echo "Quick test commands:"
echo "  @agentx /alias list"
echo "  @agentx /config show"
echo "  @agentx /exec be-endpoint \"Create a customer endpoint\""
echo ""
echo "See MANUAL_TEST.md for full test script."
echo ""

