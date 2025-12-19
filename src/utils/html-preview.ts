/**
 * HTML preview generator for markdown responses
 * Creates a beautiful HTML page with copy-to-clipboard functionality
 */

import { marked } from 'marked';
import { ResponseMetadata } from './output-formatter';

/**
 * File content data for embedding in HTML
 */
export interface FileContent {
  path: string;
  content: string;
  size: number;
}

/**
 * Generate HTML preview from markdown content
 * @param markdown - Markdown content to render
 * @param metadata - Response metadata
 * @param fileContents - Optional array of file contents to embed
 * @returns Complete HTML document as string
 */
export function generateHTMLPreview(
  markdown: string,
  metadata: ResponseMetadata,
  fileContents?: FileContent[]
): string {
  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown, { async: false }) as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentX Response - ${metadata.alias}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f9fafb;
    }

    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: white;
      padding: 24px 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
      min-height: 72px;
    }

    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .metadata {
      margin-top: 8px;
      opacity: 0.9;
      font-size: 13px;
      line-height: 1.2;
      display: flex;
      gap: 20px;
    }

    .metadata-item {
      display: flex;
      gap: 8px;
    }

    .metadata-label {
      font-weight: 500;
    }

    .copy-button {
      position: absolute;
      top: 20px;
      right: 40px;
      background: white;
      color: #1e40af;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .copy-button:hover {
      background: #f3f4f6;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .copy-button:active {
      transform: translateY(0);
    }

    .copy-button.copied {
      background: #10b981;
      color: white;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
    }

    .response-container {
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      line-height: 1.7;
    }

    .content h1 { font-size: 32px; margin: 30px 0 20px; color: #2c3e50; }
    .content h2 { font-size: 26px; margin: 25px 0 15px; color: #34495e; }
    .content h3 { font-size: 22px; margin: 20px 0 12px; color: #34495e; }
    .content h4 { font-size: 18px; margin: 18px 0 10px; color: #34495e; }

    .content p {
      margin: 15px 0;
      line-height: 1.8;
    }

    .content pre {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 20px 0;
      position: relative;
    }

    .content pre:hover .code-copy-button {
      opacity: 1;
    }

    .code-copy-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: white;
      border: 1px solid #d1d5db;
      color: #6b7280;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      opacity: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .code-copy-button:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
      color: #374151;
    }

    .code-copy-button:active {
      transform: scale(0.95);
    }

    .code-copy-button.copied {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    .content code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.9em;
    }

    .content pre code {
      background: none;
      padding: 0;
    }

    .content ul, .content ol {
      margin: 15px 0;
      padding-left: 30px;
    }

    .content li {
      margin: 8px 0;
    }

    .content blockquote {
      border-left: 4px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
      color: #666;
      font-style: italic;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .content th, .content td {
      border: 1px solid #e9ecef;
      padding: 12px;
      text-align: left;
    }

    .content th {
      background: #f8f9fa;
      font-weight: 600;
    }

    .content a {
      color: #667eea;
      text-decoration: none;
    }

    .content a:hover {
      text-decoration: underline;
    }

    .tabs-wrapper {
      background: #f9fafb;
      border-bottom: 2px solid #e5e7eb;
    }

    .tabs {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      gap: 0;
    }

    .tab {
      padding: 16px 24px;
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      position: relative;
      top: 2px;
    }

    .tab:hover {
      color: #374151;
      background: #f3f4f6;
    }

    .tab.active {
      color: #1e40af;
      border-bottom-color: #1e40af;
      background: transparent;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .tab-content > .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
    }

    .info-section {
      background: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .info-section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }

    .info-section .content-text {
      color: #374151;
      line-height: 1.6;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #1e40af;
    }

    .file-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .file-list li {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .file-list li:last-child {
      border-bottom: none;
    }

    .file-list li:hover {
      padding-left: 8px;
    }

    .file-link {
      color: #1e40af;
      text-decoration: none;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 14px;
      flex: 1;
    }

    .file-link:hover {
      text-decoration: underline;
      color: #2563eb;
    }

    .file-icon {
      font-size: 16px;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px 30px;
    }

    .config-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .config-item:nth-last-child(-n+2) {
      border-bottom: none;
      padding-bottom: 0;
    }

    .config-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .config-value {
      font-size: 16px;
      color: #1f2937;
      font-weight: 600;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    }

    .alias-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      border-radius: 6px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(30, 64, 175, 0.2);
    }

    .alias-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .alias-name {
      font-size: 14px;
      color: white;
      font-weight: 700;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      background: rgba(255, 255, 255, 0.15);
      padding: 4px 10px;
      border-radius: 4px;
    }

    .file-count {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-left: 4px;
    }

    .footer {
      padding: 20px 40px;
      background: #f8f9fa;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 20px;
      }

      .content, .tab-content > .content {
        padding: 20px;
      }

      .tabs {
        padding: 0 20px;
        overflow-x: auto;
      }

      .tab {
        padding: 12px 16px;
        font-size: 14px;
        white-space: nowrap;
      }

      .copy-button {
        position: static;
        margin-top: 20px;
        width: 100%;
        justify-content: center;
      }

      .metadata {
        grid-template-columns: 1fr;
      }

      .config-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="header">
      <button class="copy-button" onclick="copyToClipboard()">
        <span id="copy-icon">📋</span>
        <span id="copy-text">Copy</span>
      </button>
      <h1>AgentX</h1>
      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">Alias:</span>
          <span>${escapeHtml(metadata.alias)}</span>
        </div>
      </div>
    </div>

    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab active" onclick="switchTab('request')">Agent Request</button>
        <button class="tab" onclick="switchTab('response')">Response</button>
      </div>
    </div>

    <div id="request-tab" class="tab-content active">
      <div class="content">
        ${
          metadata.config
            ? `<div class="info-section">
          <h2>Configuration</h2>
          <div class="config-grid">
            <div class="config-item">
              <span class="config-label">Provider:</span>
              <span class="config-value">${escapeHtml(metadata.provider)}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Model:</span>
              <span class="config-value">${metadata.model ? escapeHtml(metadata.model) : 'Default'}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Knowledge Base:</span>
              <span class="config-value">${escapeHtml(metadata.config.knowledgeBase)}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Context Size:</span>
              <span class="config-value">${metadata.contextSize ? (metadata.contextSize / 1024).toFixed(1) + ' KB' : 'N/A'}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Est. Token Count:</span>
              <span class="config-value">${metadata.contextSize ? '~' + Math.ceil(metadata.contextSize / 4).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Max Context Size:</span>
              <span class="config-value">${(metadata.config.maxContextSize / 1024).toFixed(0)} KB</span>
            </div>
            <div class="config-item">
              <span class="config-label">Context Format:</span>
              <span class="config-value">${escapeHtml(metadata.config.contextFormat)}</span>
            </div>
            <div class="config-item">
              <span class="config-label">Cache Enabled:</span>
              <span class="config-value">${metadata.config.cacheEnabled ? '✓ Yes' : '✗ No'}</span>
            </div>
          </div>
        </div>`
            : ''
        }

        <div class="info-section">
          <h2>User Prompt</h2>
          <div class="content-text">${escapeHtml(metadata.prompt)}</div>
        </div>

        <div class="info-section">
          <h2>Context Files</h2>
          <div class="alias-badge">
            <span class="alias-label">Alias:</span>
            <span class="alias-name">${escapeHtml(metadata.alias)}</span>
            <span class="file-count">${metadata.contextFiles.length} ${metadata.contextFiles.length === 1 ? 'file' : 'files'}</span>
          </div>
          ${
            metadata.contextFiles.length > 0
              ? `<ul class="file-list">
            ${metadata.contextFiles
              .map(
                (file) => `
              <li>
                <span class="file-icon">📄</span>
                <a href="#" class="file-link" onclick="openFileInNewTab('${escapeHtml(file)}'); return false;">
                  ${escapeHtml(file)}
                </a>
              </li>
            `
              )
              .join('')}
          </ul>`
              : '<p style="color: #6b7280; font-style: italic;">No context files</p>'
          }
        </div>
      </div>
    </div>

    <div id="response-tab" class="tab-content">
      <div class="content">
        <div class="response-container">
          ${htmlContent}
        </div>
      </div>
    </div>

  <div class="footer">
    <small>Generated by AgentX CLI v${escapeHtml(metadata.version)} | ${new Date(metadata.timestamp).toLocaleString()}</small>
  </div>

  <script>
    // Store the original markdown content
    const markdownContent = ${JSON.stringify(markdown)};

    // Store file contents
    const fileContents = ${JSON.stringify(fileContents || [])};

    // Copy full markdown to clipboard
    async function copyToClipboard() {
      const button = document.querySelector('.copy-button');
      const icon = document.getElementById('copy-icon');
      const text = document.getElementById('copy-text');

      try {
        await navigator.clipboard.writeText(markdownContent);

        // Update button to show success
        button.classList.add('copied');
        icon.textContent = '✓';
        text.textContent = 'Copied!';

        // Reset after 2 seconds
        setTimeout(() => {
          button.classList.remove('copied');
          icon.textContent = '📋';
          text.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        icon.textContent = '✗';
        text.textContent = 'Failed';

        setTimeout(() => {
          icon.textContent = '📋';
          text.textContent = 'Copy';
        }, 2000);
      }
    }

    // Copy code block to clipboard
    async function copyCodeBlock(button, code) {
      const originalHTML = button.innerHTML;

      try {
        await navigator.clipboard.writeText(code);

        // Update button to show success
        button.classList.add('copied');
        button.innerHTML = '<span>✓</span><span>Copied!</span>';

        // Reset after 2 seconds
        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = originalHTML;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        button.innerHTML = '<span>✗</span><span>Failed</span>';

        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    }

    // Add copy buttons to all code blocks
    document.addEventListener('DOMContentLoaded', () => {
      const codeBlocks = document.querySelectorAll('.content pre code');

      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        const code = codeBlock.textContent;

        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.innerHTML = '<span>📋</span><span>Copy</span>';
        copyButton.onclick = () => copyCodeBlock(copyButton, code);

        // Add button to pre element
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
      });
    });

    // Add keyboard shortcut (Ctrl/Cmd + Shift + C)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        copyToClipboard();
      }
    });

    // Tab switching
    function switchTab(tabName) {
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab content
      document.getElementById(tabName + '-tab').classList.add('active');

      // Add active class to clicked tab
      event.target.classList.add('active');
    }

    // Open file in new tab
    function openFileInNewTab(filePath) {
      // Find the file content
      const fileData = fileContents.find(f => f.path === filePath);

      // Create a unique target name based on file path
      // Replace special characters with underscores to make it a valid window name
      const targetName = 'agentx_file_' + filePath.replace(/[^a-zA-Z0-9]/g, '_');

      // Create a new window with file content viewer (or reuse existing one)
      const newWindow = window.open('', targetName);

      if (!newWindow) {
        alert('Please allow pop-ups to view file contents');
        return;
      }

      // Escape HTML in file content
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      // Determine file type for syntax highlighting hint
      const ext = filePath.split('.').pop().toLowerCase();
      const languageMap = {
        'ts': 'typescript',
        'js': 'javascript',
        'tsx': 'typescript',
        'jsx': 'javascript',
        'py': 'python',
        'md': 'markdown',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sh': 'bash',
        'bash': 'bash',
      };
      const language = languageMap[ext] || ext;
      const isMarkdown = ext === 'md';

      if (fileData && fileData.content) {
        // File content is available - build HTML using DOM methods
        const escapedContent = escapeHtml(fileData.content);
        const sizeKB = (fileData.size / 1024).toFixed(2);
        const lines = fileData.content.split('\\\\n').length;

        newWindow.document.write('<!DOCTYPE html><html><head><title>' + filePath + '</title>');
        if (isMarkdown) {
          newWindow.document.write('<' + 'script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"><' + '/script>');
        }
        newWindow.document.write('<' + 'style>');
        newWindow.document.write('* { margin: 0; padding: 0; box-sizing: border-box; }');
        newWindow.document.write('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f9fafb; }');
        newWindow.document.write('.header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 24px 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; min-height: 72px; }');
        newWindow.document.write('.header h1 { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.2; display: flex; align-items: center; gap: 8px; }');
        newWindow.document.write('.header-meta { margin-top: 8px; opacity: 0.9; font-size: 13px; line-height: 1.2; display: flex; gap: 20px; }');
        newWindow.document.write('.copy-button { position: absolute; top: 20px; right: 40px; background: white; color: #1e40af; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }');
        newWindow.document.write('.copy-button:hover { background: #f3f4f6; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }');
        newWindow.document.write('.copy-button.copied { background: #10b981; color: white; }');
        newWindow.document.write('.content { max-width: 1200px; margin: 0 auto; padding: 40px; }');
        newWindow.document.write('.file-info { background: white; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 30px; align-items: center; }');
        newWindow.document.write('.file-info-item { display: flex; flex-direction: column; gap: 4px; }');
        newWindow.document.write('.file-info-label { font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }');
        newWindow.document.write('.file-info-value { font-size: 16px; color: #1f2937; font-weight: 600; }');
        newWindow.document.write('.code-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }');
        newWindow.document.write('.code-header { background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; font-weight: 500; }');
        newWindow.document.write('pre { margin: 0; padding: 24px; overflow-x: auto; background: #ffffff; }');
        newWindow.document.write('code { font-family: "Monaco", "Menlo", "Consolas", "Courier New", monospace; font-size: 14px; line-height: 1.6; color: #1f2937; }');
        newWindow.document.write('.markdown-content { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.7; }');
        newWindow.document.write('.markdown-content h1 { font-size: 32px; font-weight: 700; margin: 24px 0 16px 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }');
        newWindow.document.write('.markdown-content h2 { font-size: 24px; font-weight: 600; margin: 20px 0 12px 0; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }');
        newWindow.document.write('.markdown-content h3 { font-size: 20px; font-weight: 600; margin: 16px 0 10px 0; color: #4b5563; }');
        newWindow.document.write('.markdown-content p { margin: 12px 0; color: #374151; }');
        newWindow.document.write('.markdown-content ul, .markdown-content ol { margin: 12px 0; padding-left: 24px; color: #374151; }');
        newWindow.document.write('.markdown-content li { margin: 6px 0; }');
        newWindow.document.write('.markdown-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 13px; color: #e11d48; }');
        newWindow.document.write('.markdown-content pre { background: #1f2937; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 16px 0; }');
        newWindow.document.write('.markdown-content pre code { background: transparent; padding: 0; color: #f9fafb; font-size: 13px; }');
        newWindow.document.write('.markdown-content a { color: #1e40af; text-decoration: none; font-weight: 500; }');
        newWindow.document.write('.markdown-content a:hover { text-decoration: underline; }');
        newWindow.document.write('.markdown-content blockquote { border-left: 4px solid #1e40af; padding-left: 16px; margin: 16px 0; color: #6b7280; font-style: italic; }');
        newWindow.document.write('.markdown-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }');
        newWindow.document.write('.markdown-content th, .markdown-content td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }');
        newWindow.document.write('.markdown-content th { background: #f9fafb; font-weight: 600; }');
        newWindow.document.write('<' + '/style><' + '/head><' + 'body>');
        newWindow.document.write('<' + 'div class="header">');
        newWindow.document.write('<' + 'button class="copy-button" onclick="copyContent()"><' + 'span id="copy-icon">📋<' + '/span><' + 'span id="copy-text">Copy<' + '/span><' + '/button>');
        newWindow.document.write('<' + 'h1><' + 'span>📄<' + '/span><' + 'span>' + filePath + '<' + '/span><' + '/h1>');
        newWindow.document.write('<' + 'div class="header-meta"><' + 'span>Context File<' + '/span><' + 'span>•<' + '/span><' + 'span>' + language + '<' + '/span><' + '/div>');
        newWindow.document.write('<' + '/div>');
        newWindow.document.write('<' + 'div class="content">');
        newWindow.document.write('<' + 'div class="file-info">');
        newWindow.document.write('<' + 'div class="file-info-item"><' + 'div class="file-info-label">Size<' + '/div><' + 'div class="file-info-value">' + sizeKB + ' KB<' + '/div><' + '/div>');
        newWindow.document.write('<' + 'div class="file-info-item"><' + 'div class="file-info-label">Lines<' + '/div><' + 'div class="file-info-value">' + lines + '<' + '/div><' + '/div>');
        newWindow.document.write('<' + 'div class="file-info-item"><' + 'div class="file-info-label">Type<' + '/div><' + 'div class="file-info-value">' + language + '<' + '/div><' + '/div>');
        newWindow.document.write('<' + '/div>');

        if (isMarkdown) {
          // Render markdown with marked library
          newWindow.document.write('<' + 'div id="markdown-container" class="markdown-content"><' + '/div>');
          newWindow.document.write('<' + '/div>');
        } else {
          // Render as code
          newWindow.document.write('<' + 'div class="code-container">');
          newWindow.document.write('<' + 'div class="code-header">File Contents<' + '/div>');
          newWindow.document.write('<' + 'pre><' + 'code>' + escapedContent + '<' + '/code><' + '/pre>');
          newWindow.document.write('<' + '/div><' + '/div>');
        }
        newWindow.document.write('<' + 'script>');
        newWindow.document.write('const fileContent = ' + JSON.stringify(fileData.content) + ';');
        newWindow.document.write('const isMarkdown = ' + isMarkdown + ';');

        if (isMarkdown) {
          newWindow.document.write('if (typeof marked !== "undefined") {');
          newWindow.document.write('  const container = document.getElementById("markdown-container");');
          newWindow.document.write('  container.innerHTML = marked.parse(fileContent);');
          newWindow.document.write('}');
        }

        newWindow.document.write('async function copyContent() {');
        newWindow.document.write('  const button = document.querySelector(".copy-button");');
        newWindow.document.write('  const icon = document.getElementById("copy-icon");');
        newWindow.document.write('  const text = document.getElementById("copy-text");');
        newWindow.document.write('  try {');
        newWindow.document.write('    await navigator.clipboard.writeText(fileContent);');
        newWindow.document.write('    button.classList.add("copied");');
        newWindow.document.write('    icon.textContent = "✓";');
        newWindow.document.write('    text.textContent = "Copied!";');
        newWindow.document.write('    setTimeout(() => {');
        newWindow.document.write('      button.classList.remove("copied");');
        newWindow.document.write('      icon.textContent = "📋";');
        newWindow.document.write('      text.textContent = "Copy";');
        newWindow.document.write('    }, 2000);');
        newWindow.document.write('  } catch (err) {');
        newWindow.document.write('    console.error("Failed to copy:", err);');
        newWindow.document.write('    icon.textContent = "✗";');
        newWindow.document.write('    text.textContent = "Failed";');
        newWindow.document.write('    setTimeout(() => {');
        newWindow.document.write('      icon.textContent = "📋";');
        newWindow.document.write('      text.textContent = "Copy";');
        newWindow.document.write('    }, 2000);');
        newWindow.document.write('  }');
        newWindow.document.write('}');
        newWindow.document.write('<' + '/script><' + '/body><' + '/html>');
      } else {
        // File content not available
        newWindow.document.write('<!DOCTYPE html><' + 'html><' + 'head><' + 'title>' + filePath + '<' + '/title>');
        newWindow.document.write('<' + 'style>');
        newWindow.document.write('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; background: #f9fafb; }');
        newWindow.document.write('.header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 24px 32px; border-radius: 8px 8px 0 0; margin: -40px -40px 0 -40px; margin-bottom: 0; }');
        newWindow.document.write('.header h1 { margin: 0; font-size: 20px; font-weight: 600; }');
        newWindow.document.write('.header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }');
        newWindow.document.write('.content { background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }');
        newWindow.document.write('.warning { color: #d97706; padding: 20px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #d97706; }');
        newWindow.document.write('pre { background: #f8f9fa; padding: 16px; border-radius: 6px; overflow-x: auto; border: 1px solid #e5e7eb; margin-top: 12px; }');
        newWindow.document.write('code { font-family: "Monaco", "Menlo", "Consolas", monospace; font-size: 14px; line-height: 1.6; }');
        newWindow.document.write('<' + '/style><' + '/head><' + 'body>');
        newWindow.document.write('<' + 'div class="header"><' + 'h1>📄 ' + filePath + '<' + '/h1><' + 'p>Context File<' + '/p><' + '/div>');
        newWindow.document.write('<' + 'div class="content">');
        newWindow.document.write('<' + 'div class="warning">');
        newWindow.document.write('<' + 'strong>⚠️ File content not available<' + '/strong><' + 'br><' + 'br>');
        newWindow.document.write('The file content was not embedded in the preview. This can happen if the file was too large or couldn\\'t be read.');
        newWindow.document.write('<' + 'br><' + 'br><' + 'strong>File Path:<' + '/strong> <' + 'code>' + filePath + '<' + '/code>');
        newWindow.document.write('<' + 'br><' + 'br>To view this file, open it in your editor or use:');
        newWindow.document.write('<' + 'pre><' + 'code>cat "' + filePath + '"<' + '/code><' + '/pre>');
        newWindow.document.write('<' + '/div><' + '/div><' + '/body><' + '/html>');
      }

      newWindow.document.close();
    }

    // Make functions globally available
    window.switchTab = switchTab;
    window.openFileInNewTab = openFileInNewTab;
  </script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}


