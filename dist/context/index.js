"use strict";
/**
 * Context file aggregation system for AgentX CLI
 * Based on initial-spec.md context requirements
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = buildContext;
exports.createExecutionSettings = createExecutionSettings;
exports.readFileWithMetadata = readFileWithMetadata;
exports.getContextSummary = getContextSummary;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const alias_1 = require("../alias");
const config_1 = require("../config");
const packageJson = require('../../package.json');
/**
 * Build context from an alias and optional additional files
 */
async function buildContext(alias, additionalFiles, options) {
    const config = (0, config_1.loadConfig)();
    const basePath = config.knowledgeBase.replace(/^~/, os_1.default.homedir());
    const maxSize = options?.maxSize || config.maxContextSize;
    // Resolve alias files
    const aliasFiles = await (0, alias_1.resolveAlias)(alias);
    // Add additional files
    const allFiles = [...aliasFiles];
    if (additionalFiles) {
        for (const file of additionalFiles) {
            try {
                const fullPath = path_1.default.isAbsolute(file) ? file : path_1.default.join(process.cwd(), file);
                const stat = fs_1.default.statSync(fullPath);
                allFiles.push({
                    path: file,
                    size: stat.size,
                });
            }
            catch {
                // Skip files that can't be read
                continue;
            }
        }
    }
    // Calculate total size
    let totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    let truncated = false;
    let filesToInclude = allFiles;
    // Check against max context size and truncate if needed
    if (totalSize > maxSize) {
        truncated = true;
        filesToInclude = truncateFiles(allFiles, maxSize);
        totalSize = filesToInclude.reduce((sum, f) => sum + f.size, 0);
    }
    // Build content string
    const content = buildContentString(filesToInclude, basePath, additionalFiles);
    return {
        files: filesToInclude,
        totalSize,
        truncated,
        content,
    };
}
/**
 * Truncate files to fit within max size
 * Prioritizes smaller files to maximize file count
 */
function truncateFiles(files, maxSize) {
    // Sort by size (smallest first) to include more files
    const sorted = [...files].sort((a, b) => a.size - b.size);
    const included = [];
    let currentSize = 0;
    for (const file of sorted) {
        if (currentSize + file.size <= maxSize) {
            included.push(file);
            currentSize += file.size;
        }
    }
    return included;
}
/**
 * Build the content string from files
 */
function buildContentString(files, basePath, additionalFiles) {
    const additionalSet = new Set(additionalFiles || []);
    const parts = files.map((f) => {
        let fullPath;
        // Check if this is an additional file (absolute or relative to cwd)
        if (additionalSet.has(f.path)) {
            fullPath = path_1.default.isAbsolute(f.path) ? f.path : path_1.default.join(process.cwd(), f.path);
        }
        else {
            // Alias file - relative to knowledge base
            fullPath = path_1.default.isAbsolute(f.path) ? f.path : path_1.default.join(basePath, f.path);
        }
        try {
            const content = fs_1.default.readFileSync(fullPath, 'utf-8');
            return `--- ${f.path} ---\n${content}`;
        }
        catch {
            return `--- ${f.path} ---\n[Error reading file]`;
        }
    });
    return parts.join('\n\n');
}
/**
 * Create execution settings from alias and context
 */
function createExecutionSettings(alias, context, additionalFiles) {
    const config = (0, config_1.loadConfig)();
    return {
        version: packageJson.version,
        provider: config.provider,
        alias: alias.name,
        contextFiles: {
            count: context.files.length,
            totalSize: context.totalSize,
            files: context.files.map((f) => f.path),
        },
        knowledgeBase: config.knowledgeBase,
        additionalFiles,
    };
}
/**
 * Read a single file and return its content with metadata
 */
function readFileWithMetadata(filePath) {
    try {
        const fullPath = path_1.default.isAbsolute(filePath)
            ? filePath
            : path_1.default.join(process.cwd(), filePath);
        const content = fs_1.default.readFileSync(fullPath, 'utf-8');
        const stat = fs_1.default.statSync(fullPath);
        return {
            content,
            size: stat.size,
        };
    }
    catch {
        return null;
    }
}
/**
 * Get context summary for display
 */
function getContextSummary(context) {
    const { files, totalSize, truncated } = context;
    const sizeKB = (totalSize / 1024).toFixed(1);
    let summary = `${files.length} files (${sizeKB} KB)`;
    if (truncated) {
        summary += ' [truncated]';
    }
    return summary;
}
//# sourceMappingURL=index.js.map