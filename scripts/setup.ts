#!/usr/bin/env npx ts-node

/**
 * AgentX Monorepo Interactive Setup Script
 * 
 * This script allows users to interactively select which packages to set up:
 * - @agentx/core - Core library
 * - @agentx/cli - Command-line interface
 * - @agentx/vscode-copilot - VS Code extension
 */

import inquirer from 'inquirer';
import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

interface PackageInfo {
  name: string;
  value: string;
  description: string;
  path: string;
  checked: boolean;
}

const PACKAGES: PackageInfo[] = [
  {
    name: '@agentx/cli - Command-line interface',
    value: 'cli',
    description: 'CLI tool for executing AI prompts with context aliases',
    path: 'packages/cli',
    checked: true,
  },
  {
    name: '@agentx/vscode-copilot - VS Code extension',
    value: 'vscode-copilot',
    description: 'VS Code extension integrating AgentX with GitHub Copilot Chat',
    path: 'packages/vscode-copilot',
    checked: false,
  },
];

const PROVIDERS = ['copilot', 'claude', 'openai', 'mock'];

async function printHeader(): Promise<void> {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}          ${colors.green}${colors.bold}AgentX Monorepo Setup${colors.reset}                         ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

function checkPrerequisites(): boolean {
  log.info('Checking prerequisites...');

  // Check Node.js
  try {
    const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
      log.error(`Node.js 18+ required. Current: ${nodeVersion}`);
      return false;
    }
    log.success(`Node.js ${nodeVersion} detected`);
  } catch {
    log.error('Node.js is not installed');
    return false;
  }

  // Check pnpm
  try {
    const pnpmVersion = execSync('pnpm -v', { encoding: 'utf-8' }).trim();
    log.success(`pnpm ${pnpmVersion} detected`);
  } catch {
    log.error('pnpm is not installed. Install with: npm install -g pnpm');
    return false;
  }

  return true;
}

function runCommand(command: string, cwd?: string): boolean {
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: cwd || process.cwd(),
      encoding: 'utf-8'
    });
    return true;
  } catch {
    return false;
  }
}

async function selectPackages(): Promise<string[]> {
  const { packages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'packages',
      message: 'Select packages to set up:',
      choices: PACKAGES.map(pkg => ({
        name: pkg.name,
        value: pkg.value,
        checked: pkg.checked,
      })),
      validate: (answer: string[]) => {
        if (answer.length === 0) {
          return 'You must select at least one package.';
        }
        return true;
      },
    },
  ]);
  return packages;
}

async function selectSetupActions(selectedPackages: string[]): Promise<string[]> {
  const choices = [
    { name: 'Install dependencies (pnpm install)', value: 'install', checked: true },
    { name: 'Build packages', value: 'build', checked: true },
    { name: 'Link CLI globally', value: 'link', checked: true },
    { name: 'Configure AgentX (provider, knowledge base)', value: 'configure', checked: true },
  ];

  // Add VS Code extension install option if vscode-copilot is selected
  if (selectedPackages.includes('vscode-copilot')) {
    choices.push({
      name: 'Install VS Code extension',
      value: 'install-vscode',
      checked: true,
    });
  }

  const { actions } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'actions',
      message: 'Select setup actions:',
      choices,
    },
  ]);
  return actions;
}

async function configureAgentX(): Promise<void> {
  log.info('Configuring AgentX...');
  console.log('');

  const defaultKB = path.join(os.homedir(), 'agentx-enterprise-docs');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: PROVIDERS,
      default: 'copilot',
    },
    {
      type: 'input',
      name: 'knowledgeBase',
      message: 'Enter knowledge base path:',
      default: defaultKB,
    },
    {
      type: 'confirm',
      name: 'createKB',
      message: 'Create knowledge base directory if it doesn\'t exist?',
      default: true,
      when: (ans) => !fs.existsSync(ans.knowledgeBase.replace(/^~/, os.homedir())),
    },
  ]);

  const kbPath = answers.knowledgeBase.replace(/^~/, os.homedir());
  const configDir = path.join(os.homedir(), '.agentx');
  const configFile = path.join(configDir, 'config.json');

  // Create config directory
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Create config file
  const config = {
    provider: answers.provider,
    knowledgeBase: kbPath,
    maxContextSize: 32768,
    contextFormat: 'hybrid',
    cacheEnabled: true,
    frameworks: {
      'spec-kit': { name: 'spec-kit', enabled: true },
      'open-spec': { name: 'open-spec', enabled: true },
      bmad: { name: 'bmad', enabled: true },
    },
    outputFormat: 'markdown',
    outputLocation: './agentx-output',
  };

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  log.success(`Configuration saved to ${configFile}`);

  // Create knowledge base directory if requested
  if (answers.createKB && !fs.existsSync(kbPath)) {
    fs.mkdirSync(kbPath, { recursive: true });
    fs.mkdirSync(path.join(kbPath, '.ai-config', 'aliases'), { recursive: true });
    log.success(`Created knowledge base directory: ${kbPath}`);
  }
}

async function buildPackages(selectedPackages: string[]): Promise<boolean> {
  log.info('Building packages...');

  // Always build core first (it's a dependency for other packages)
  log.info('Building @agentx/core (dependency)...');
  if (!runCommand('pnpm --filter @agentx/core build')) {
    log.error('Failed to build core');
    return false;
  }
  log.success('Built core');

  // Build selected packages
  const buildOrder = ['cli', 'vscode-copilot'].filter(p => selectedPackages.includes(p));

  for (const pkg of buildOrder) {
    const pkgInfo = PACKAGES.find(p => p.value === pkg);
    if (!pkgInfo) continue;

    log.info(`Building ${pkgInfo.value}...`);
    if (!runCommand(`pnpm --filter @agentx/${pkg} build`)) {
      log.error(`Failed to build ${pkg}`);
      return false;
    }
    log.success(`Built ${pkg}`);
  }

  return true;
}

async function linkCLI(): Promise<boolean> {
  log.info('Linking CLI globally...');

  const cliPath = path.join(process.cwd(), 'packages', 'cli');

  // Check if CLI package exists
  if (!fs.existsSync(cliPath)) {
    log.error('CLI package not found');
    return false;
  }

  // Link globally using pnpm
  if (!runCommand('pnpm link --global', cliPath)) {
    log.error('Failed to link CLI globally');
    return false;
  }

  // Verify installation
  try {
    const version = execSync('agentx --version', { encoding: 'utf-8' }).trim();
    log.success(`CLI linked globally (${version})`);
    return true;
  } catch {
    log.warning('CLI linked but command not found in PATH');
    log.info('You may need to add pnpm global bin to your PATH');
    return true;
  }
}

async function installVSCodeExtension(): Promise<boolean> {
  log.info('Installing VS Code extension...');

  const vscodePath = path.join(process.cwd(), 'packages', 'vscode-copilot');

  // Check if VS Code extension package exists
  if (!fs.existsSync(vscodePath)) {
    log.error('VS Code extension package not found');
    return false;
  }

  // Check if VS Code CLI is available
  try {
    execSync('code --version', { encoding: 'utf-8' });
  } catch {
    log.error('VS Code CLI (code) not found. Please install VS Code and ensure "code" command is in PATH.');
    log.info('On macOS: Open VS Code, press Cmd+Shift+P, type "Shell Command: Install \'code\' command in PATH"');
    return false;
  }

  // Check if vsce is available, install if not
  try {
    execSync('npx vsce --version', { encoding: 'utf-8', cwd: vscodePath });
  } catch {
    log.info('Installing vsce (VS Code Extension Manager)...');
    if (!runCommand('pnpm add -D @vscode/vsce', vscodePath)) {
      log.error('Failed to install vsce');
      return false;
    }
  }

  // Package the extension
  log.info('Packaging extension...');
  if (!runCommand('npx vsce package --no-dependencies', vscodePath)) {
    log.error('Failed to package VS Code extension');
    return false;
  }

  // Find the generated .vsix file
  const files = fs.readdirSync(vscodePath);
  const vsixFile = files.find(f => f.endsWith('.vsix'));

  if (!vsixFile) {
    log.error('Could not find packaged .vsix file');
    return false;
  }

  const vsixPath = path.join(vscodePath, vsixFile);
  log.success(`Extension packaged: ${vsixFile}`);

  // Install the extension
  log.info('Installing extension in VS Code...');
  if (!runCommand(`code --install-extension "${vsixPath}" --force`)) {
    log.error('Failed to install VS Code extension');
    return false;
  }

  log.success('VS Code extension installed successfully!');
  log.info('Restart VS Code to activate the extension');
  return true;
}

function displaySummary(selectedPackages: string[], actions: string[], vsCodeInstalled: boolean): void {
  console.log('');
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}          ${colors.green}${colors.bold}Setup Complete!${colors.reset}                               ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  log.success('Selected packages:');
  selectedPackages.forEach(pkg => {
    const pkgInfo = PACKAGES.find(p => p.value === pkg);
    console.log(`  • @agentx/${pkg} - ${pkgInfo?.description || ''}`);
  });

  console.log('');
  console.log(`${colors.blue}Next Steps:${colors.reset}`);

  if (selectedPackages.includes('cli')) {
    console.log(`  1. Verify CLI:           ${colors.green}agentx --version${colors.reset}`);
    console.log(`  2. View configuration:   ${colors.green}agentx config show${colors.reset}`);
    console.log(`  3. List aliases:         ${colors.green}agentx alias list${colors.reset}`);
  }

  if (selectedPackages.includes('vscode-copilot')) {
    if (vsCodeInstalled) {
      console.log(`  • VS Code extension installed - restart VS Code to activate`);
    } else {
      console.log(`  • Package VS Code ext:   ${colors.green}cd packages/vscode-copilot && pnpm package${colors.reset}`);
      console.log(`  • Install in VS Code:    ${colors.green}code --install-extension agentx-copilot-*.vsix${colors.reset}`);
    }
  }

  console.log('');
}

async function main(): Promise<void> {
  await printHeader();

  // Check prerequisites
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  console.log('');

  // Select packages
  const selectedPackages = await selectPackages();
  console.log('');

  // Select actions
  const actions = await selectSetupActions(selectedPackages);
  console.log('');

  // Track VS Code extension installation status
  let vsCodeInstalled = false;

  // Execute actions
  if (actions.includes('install')) {
    log.info('Installing dependencies...');
    if (!runCommand('pnpm install')) {
      log.error('Failed to install dependencies');
      process.exit(1);
    }
    log.success('Dependencies installed');
    console.log('');
  }

  if (actions.includes('build')) {
    if (!await buildPackages(selectedPackages)) {
      process.exit(1);
    }
    console.log('');
  }

  if (actions.includes('link') && selectedPackages.includes('cli')) {
    await linkCLI();
    console.log('');
  }

  if (actions.includes('configure')) {
    await configureAgentX();
    console.log('');
  }

  if (actions.includes('install-vscode') && selectedPackages.includes('vscode-copilot')) {
    vsCodeInstalled = await installVSCodeExtension();
    console.log('');
  }

  // Display summary
  displaySummary(selectedPackages, actions, vsCodeInstalled);
}

// Run main
main().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});

