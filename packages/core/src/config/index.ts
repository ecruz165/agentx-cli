/**
 * Configuration management for AgentX
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { AgentXConfig, FrameworkConfig } from '../types';

/**
 * Base path for resolving relative config paths
 * Defaults to process.cwd() but can be overridden for VS Code extensions
 */
let basePath: string | null = null;

/**
 * Set the base path for resolving relative config paths
 * This is useful for VS Code extensions where process.cwd() is not the workspace folder
 */
export function setBasePath(newBasePath: string): void {
  basePath = newBasePath;
}

/**
 * Get the current base path (defaults to process.cwd())
 */
export function getBasePath(): string {
  return basePath || process.cwd();
}

/**
 * Clear the base path (revert to using process.cwd())
 */
export function clearBasePath(): void {
  basePath = null;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: AgentXConfig = {
  provider: 'copilot',
  model: 'gpt-4',
  knowledgeBase: path.join(os.homedir(), 'agentx-enterprise-docs'),
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
  toonConversion: {
    patterns: true,
    reference: true,
    skills: false,
    templates: false,
    frameworks: true,
    intentions: true,
  },
  personas: [],
  activePersona: undefined,
};

/**
 * Configuration file paths in order of priority
 */
const CONFIG_PATHS = [
  '.ai-config/config.json',
  '.agentx.json',
  path.join(os.homedir(), '.agentx', 'config.json'),
];

/**
 * Find the first existing config file path
 */
export function findConfigPath(): string | null {
  for (const configPath of CONFIG_PATHS) {
    const fullPath = path.isAbsolute(configPath)
      ? configPath
      : path.join(getBasePath(), configPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Load configuration from file or return defaults
 */
export function loadConfig(): AgentXConfig {
  const configPath = findConfigPath();

  if (configPath) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const fileConfig = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...fileConfig };
    } catch (error) {
      // If parsing fails, return defaults
      return DEFAULT_CONFIG;
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Save configuration to file
 */
export function saveConfig(config: AgentXConfig, configPath?: string): void {
  const targetPath = configPath || path.join(getBasePath(), CONFIG_PATHS[0]);
  const dir = path.dirname(targetPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
}

/**
 * Update a specific configuration value
 */
export function updateConfig(
  key: string,
  value: string | number | boolean
): { oldValue: unknown; newValue: unknown } {
  const config = loadConfig();
  const configRecord = config as unknown as Record<string, unknown>;
  const oldValue = configRecord[key];

  // Handle type conversion based on existing value type
  let convertedValue: unknown = value;
  if (typeof oldValue === 'number' && typeof value === 'string') {
    convertedValue = parseInt(value, 10);
  } else if (typeof oldValue === 'boolean' && typeof value === 'string') {
    convertedValue = value === 'true';
  }

  configRecord[key] = convertedValue;
  saveConfig(config);

  return { oldValue, newValue: convertedValue };
}

/**
 * Get a specific configuration value
 */
export function getConfigValue(key: string): unknown {
  const config = loadConfig();
  return (config as unknown as Record<string, unknown>)[key];
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): AgentXConfig {
  return { ...DEFAULT_CONFIG };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  const configPath = findConfigPath() || path.join(getBasePath(), CONFIG_PATHS[0]);
  saveConfig(DEFAULT_CONFIG, configPath);
}

/**
 * List all configuration keys
 */
export function getConfigKeys(): string[] {
  return Object.keys(DEFAULT_CONFIG);
}

