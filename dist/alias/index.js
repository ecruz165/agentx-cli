"use strict";
/**
 * Alias management system for AgentX CLI
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAliases = loadAliases;
exports.resolveAlias = resolveAlias;
exports.getAlias = getAlias;
exports.getAliasWithFiles = getAliasWithFiles;
exports.calculateTotalSize = calculateTotalSize;
exports.aliasDirectoryExists = aliasDirectoryExists;
exports.getAliasDirectoryPath = getAliasDirectoryPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const glob_1 = require("glob");
const config_1 = require("../config");
/**
 * Get the alias directory path
 */
function getAliasDir() {
    const config = (0, config_1.loadConfig)();
    const knowledgeBase = config.knowledgeBase.replace(/^~/, os_1.default.homedir());
    return path_1.default.join(knowledgeBase, '.ai-config', 'aliases');
}
/**
 * Load all alias definitions from the alias directory
 */
async function loadAliases() {
    const aliasDir = getAliasDir();
    if (!fs_1.default.existsSync(aliasDir)) {
        return [];
    }
    const aliasFiles = fs_1.default.readdirSync(aliasDir).filter((f) => f.endsWith('.json'));
    const aliases = [];
    for (const file of aliasFiles) {
        try {
            const content = fs_1.default.readFileSync(path_1.default.join(aliasDir, file), 'utf-8');
            const alias = JSON.parse(content);
            aliases.push(alias);
        }
        catch (error) {
            // Skip invalid alias files
            continue;
        }
    }
    return aliases;
}
/**
 * Resolve an alias to its matching files
 */
async function resolveAlias(alias) {
    const config = (0, config_1.loadConfig)();
    const basePath = config.knowledgeBase.replace(/^~/, os_1.default.homedir());
    const files = [];
    for (const pattern of alias.patterns) {
        try {
            const matches = await (0, glob_1.glob)(pattern, {
                cwd: basePath,
                nodir: true,
            });
            for (const match of matches) {
                const fullPath = path_1.default.join(basePath, match);
                try {
                    const stat = fs_1.default.statSync(fullPath);
                    files.push({
                        path: match,
                        size: stat.size,
                    });
                }
                catch {
                    // Skip files that can't be stat'd
                    continue;
                }
            }
        }
        catch {
            // Skip invalid patterns
            continue;
        }
    }
    return files;
}
/**
 * Get a specific alias by name
 */
async function getAlias(name) {
    const aliases = await loadAliases();
    return aliases.find((a) => a.name === name) || null;
}
/**
 * Get an alias with its resolved files
 */
async function getAliasWithFiles(name) {
    const alias = await getAlias(name);
    if (!alias) {
        return null;
    }
    const resolvedFiles = await resolveAlias(alias);
    return {
        ...alias,
        resolvedFiles,
    };
}
/**
 * Calculate total size of resolved files
 */
function calculateTotalSize(files) {
    return files.reduce((total, file) => total + file.size, 0);
}
/**
 * Check if alias directory exists
 */
function aliasDirectoryExists() {
    return fs_1.default.existsSync(getAliasDir());
}
/**
 * Get the alias directory path (for display)
 */
function getAliasDirectoryPath() {
    return getAliasDir();
}
//# sourceMappingURL=index.js.map