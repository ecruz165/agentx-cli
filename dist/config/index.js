"use strict";
/**
 * Configuration management for AgentX CLI
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConfigPath = findConfigPath;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.updateConfig = updateConfig;
exports.getConfigValue = getConfigValue;
exports.getDefaultConfig = getDefaultConfig;
exports.resetConfig = resetConfig;
exports.getConfigKeys = getConfigKeys;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
    provider: 'copilot',
    knowledgeBase: path_1.default.join(os_1.default.homedir(), 'agentx-enterprise-docs'),
    maxContextSize: 32768,
    contextFormat: 'hybrid',
    cacheEnabled: true,
    frameworks: {
        'spec-kit': { name: 'spec-kit', enabled: true },
        'open-spec': { name: 'open-spec', enabled: true },
        bmad: { name: 'bmad', enabled: true },
    },
};
/**
 * Configuration file paths in order of priority
 */
const CONFIG_PATHS = [
    '.ai-config/config.json',
    '.agentx.json',
    path_1.default.join(os_1.default.homedir(), '.agentx', 'config.json'),
];
/**
 * Find the first existing config file path
 */
function findConfigPath() {
    for (const configPath of CONFIG_PATHS) {
        const fullPath = path_1.default.isAbsolute(configPath)
            ? configPath
            : path_1.default.join(process.cwd(), configPath);
        if (fs_1.default.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
}
/**
 * Load configuration from file or return defaults
 */
function loadConfig() {
    const configPath = findConfigPath();
    if (configPath) {
        try {
            const content = fs_1.default.readFileSync(configPath, 'utf-8');
            const fileConfig = JSON.parse(content);
            return { ...DEFAULT_CONFIG, ...fileConfig };
        }
        catch (error) {
            // If parsing fails, return defaults
            return DEFAULT_CONFIG;
        }
    }
    return DEFAULT_CONFIG;
}
/**
 * Save configuration to file
 */
function saveConfig(config, configPath) {
    const targetPath = configPath || path_1.default.join(process.cwd(), CONFIG_PATHS[0]);
    const dir = path_1.default.dirname(targetPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    fs_1.default.writeFileSync(targetPath, JSON.stringify(config, null, 2));
}
/**
 * Update a specific configuration value
 */
function updateConfig(key, value) {
    const config = loadConfig();
    const configRecord = config;
    const oldValue = configRecord[key];
    // Handle type conversion based on existing value type
    let convertedValue = value;
    if (typeof oldValue === 'number' && typeof value === 'string') {
        convertedValue = parseInt(value, 10);
    }
    else if (typeof oldValue === 'boolean' && typeof value === 'string') {
        convertedValue = value === 'true';
    }
    configRecord[key] = convertedValue;
    saveConfig(config);
    return { oldValue, newValue: convertedValue };
}
/**
 * Get a specific configuration value
 */
function getConfigValue(key) {
    const config = loadConfig();
    return config[key];
}
/**
 * Get default configuration
 */
function getDefaultConfig() {
    return { ...DEFAULT_CONFIG };
}
/**
 * Reset configuration to defaults
 */
function resetConfig() {
    const configPath = findConfigPath() || path_1.default.join(process.cwd(), CONFIG_PATHS[0]);
    saveConfig(DEFAULT_CONFIG, configPath);
}
/**
 * List all configuration keys
 */
function getConfigKeys() {
    return Object.keys(DEFAULT_CONFIG);
}
//# sourceMappingURL=index.js.map