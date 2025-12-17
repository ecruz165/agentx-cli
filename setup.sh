#!/usr/bin/env bash

#############################################
# AgentX CLI Setup Script
# 
# This script will:
# 1. Build the TypeScript project
# 2. Install agentx globally via npm
# 3. Prompt for configuration settings
# 4. Create global configuration file
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}          ${GREEN}AgentX CLI Setup${NC}                              ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) detected"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_success "npm $(npm -v) detected"
}

# Build the project
build_project() {
    print_info "Building TypeScript project..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    # Build
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not created"
        exit 1
    fi
    
    print_success "Project built successfully"
}

# Install globally
install_global() {
    print_info "Installing agentx globally..."
    
    # Check if already installed
    if command -v agentx &> /dev/null; then
        print_warning "agentx is already installed globally"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping installation"
            return
        fi
    fi
    
    # Install/link globally
    npm link
    
    # Verify installation
    if command -v agentx &> /dev/null; then
        print_success "agentx installed globally ($(agentx --version))"
    else
        print_error "Installation failed - agentx command not found"
        exit 1
    fi
}

# Prompt for configuration
configure_agentx() {
    print_info "Configuring AgentX..."
    echo ""
    
    # Default values
    DEFAULT_PROVIDER="copilot"
    DEFAULT_KB="$HOME/agentx-enterprise-docs"
    
    # Prompt for provider
    echo -e "${BLUE}Available providers:${NC} copilot, claude, openai, mock"
    read -p "Enter AI provider [$DEFAULT_PROVIDER]: " PROVIDER
    PROVIDER=${PROVIDER:-$DEFAULT_PROVIDER}
    
    # Prompt for knowledge base
    echo ""
    read -p "Enter knowledge base path [$DEFAULT_KB]: " KB_PATH
    KB_PATH=${KB_PATH:-$DEFAULT_KB}
    
    # Expand tilde
    KB_PATH="${KB_PATH/#\~/$HOME}"
    
    # Create config directory
    CONFIG_DIR="$HOME/.agentx"
    mkdir -p "$CONFIG_DIR"
    
    # Create configuration file
    CONFIG_FILE="$CONFIG_DIR/config.json"

    cat > "$CONFIG_FILE" << EOF
{
  "provider": "$PROVIDER",
  "knowledgeBase": "$KB_PATH",
  "maxContextSize": 32768,
  "contextFormat": "hybrid",
  "cacheEnabled": true,
  "frameworks": {
    "spec-kit": { "name": "spec-kit", "enabled": true },
    "open-spec": { "name": "open-spec", "enabled": true },
    "bmad": { "name": "bmad", "enabled": true }
  },
  "outputFormat": "markdown",
  "outputLocation": "./agentx-output"
}
EOF

    print_success "Configuration saved to $CONFIG_FILE"

    # Create knowledge base directory if it doesn't exist
    if [ ! -d "$KB_PATH" ]; then
        read -p "Knowledge base directory doesn't exist. Create it? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            mkdir -p "$KB_PATH"
            mkdir -p "$KB_PATH/.ai-config/aliases"
            print_success "Created knowledge base directory: $KB_PATH"
        fi
    fi
}

# Check and offer to add npm global bin to PATH
check_path() {
    print_info "Checking PATH configuration..."

    NPM_BIN=$(npm bin -g)

    # Check if npm global bin is in PATH
    if [[ ":$PATH:" == *":$NPM_BIN:"* ]]; then
        print_success "npm global bin is already in PATH"
        return
    fi

    print_warning "npm global bin ($NPM_BIN) is not in PATH"
    echo ""
    read -p "Would you like to add it to your PATH? (Y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Skipping PATH configuration"
        print_warning "You may need to manually add $NPM_BIN to your PATH"
        return
    fi

    # Detect shell
    SHELL_NAME=$(basename "$SHELL")

    case "$SHELL_NAME" in
        bash)
            PROFILE_FILE="$HOME/.bashrc"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                PROFILE_FILE="$HOME/.bash_profile"
            fi
            ;;
        zsh)
            PROFILE_FILE="$HOME/.zshrc"
            ;;
        fish)
            PROFILE_FILE="$HOME/.config/fish/config.fish"
            ;;
        *)
            print_warning "Unknown shell: $SHELL_NAME"
            print_info "Please manually add the following to your shell profile:"
            echo "  export PATH=\"$NPM_BIN:\$PATH\""
            return
            ;;
    esac

    # Add to profile
    if [ "$SHELL_NAME" = "fish" ]; then
        echo "" >> "$PROFILE_FILE"
        echo "# Added by AgentX setup" >> "$PROFILE_FILE"
        echo "set -gx PATH $NPM_BIN \$PATH" >> "$PROFILE_FILE"
    else
        echo "" >> "$PROFILE_FILE"
        echo "# Added by AgentX setup" >> "$PROFILE_FILE"
        echo "export PATH=\"$NPM_BIN:\$PATH\"" >> "$PROFILE_FILE"
    fi

    print_success "Added npm global bin to $PROFILE_FILE"
    print_warning "Please restart your terminal or run: source $PROFILE_FILE"
}

# Display summary
display_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}          ${GREEN}Setup Complete!${NC}                               ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_success "AgentX CLI is ready to use!"
    echo ""
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "  Provider:       $PROVIDER"
    echo -e "  Knowledge Base: $KB_PATH"
    echo -e "  Config File:    $HOME/.agentx/config.json"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. Verify installation:  ${GREEN}agentx --version${NC}"
    echo -e "  2. View configuration:   ${GREEN}agentx config show${NC}"
    echo -e "  3. List aliases:         ${GREEN}agentx alias list${NC}"
    echo -e "  4. Get help:             ${GREEN}agentx --help${NC}"
    echo ""
}

# Main execution
main() {
    print_header
    check_prerequisites
    echo ""
    build_project
    echo ""
    install_global
    echo ""
    configure_agentx
    echo ""
    check_path
    display_summary
}

# Run main function
main

