/**
 * HTML preview generator for markdown responses
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

/**
 * Generate HTML preview from markdown content
 */
export function generateHTMLPreview(
  markdown: string,
  metadata: ResponseMetadata,
  fileContents?: FileContent[]
): string {
  const htmlContent = marked.parse(markdown, { async: false }) as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentX Response - ${escapeHtml(metadata.alias)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 24px 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; min-height: 72px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; line-height: 1.2; display: flex; align-items: center; gap: 8px; }
    .metadata { margin-top: 8px; opacity: 0.9; font-size: 13px; line-height: 1.2; display: flex; gap: 20px; }
    .copy-button { position: absolute; top: 20px; right: 40px; background: white; color: #1e40af; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
    .copy-button:hover { background: #f3f4f6; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .copy-button.copied { background: #10b981; color: white; }
    .content { max-width: 1200px; margin: 0 auto; padding: 40px; }
    .response-container { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.7; }
    .content h1 { font-size: 32px; margin: 30px 0 20px; color: #2c3e50; }
    .content h2 { font-size: 26px; margin: 25px 0 15px; color: #34495e; }
    .content h3 { font-size: 22px; margin: 20px 0 12px; color: #34495e; }
    .content p { margin: 15px 0; line-height: 1.8; }
    .content pre { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 16px; overflow-x: auto; margin: 20px 0; position: relative; }
    .content code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.9em; }
    .content pre code { background: none; padding: 0; }
    .content ul, .content ol { margin: 15px 0; padding-left: 30px; }
    .content li { margin: 8px 0; }
    .tabs-wrapper { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    .tabs { max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; gap: 0; }
    .tab { padding: 16px 24px; background: transparent; border: none; color: #6b7280; font-size: 15px; font-weight: 500; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s ease; position: relative; top: 2px; }
    .tab:hover { color: #374151; background: #f3f4f6; }
    .tab.active { color: #1e40af; border-bottom-color: #1e40af; background: transparent; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .info-section { background: white; padding: 24px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .info-section h2 { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
    .content-text { color: #374151; line-height: 1.6; padding: 12px 16px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #1e40af; }
    .file-list { list-style: none; padding: 0; margin: 0; }
    .file-list li { padding: 12px 0; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
    .file-list li:last-child { border-bottom: none; }
    .file-link { color: #1e40af; text-decoration: none; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 14px; flex: 1; }
    .file-link:hover { text-decoration: underline; color: #2563eb; }
    .config-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px 30px; }
    .config-item { display: flex; flex-direction: column; gap: 4px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .config-label { font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .config-value { font-size: 16px; color: #1f2937; font-weight: 600; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; }
    .alias-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); border-radius: 6px; margin-bottom: 16px; }
    .alias-label { font-size: 12px; color: rgba(255, 255, 255, 0.8); font-weight: 500; text-transform: uppercase; }
    .alias-name { font-size: 14px; color: white; font-weight: 700; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; background: rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: 4px; }
    .file-count { font-size: 12px; color: rgba(255, 255, 255, 0.9); font-weight: 500; margin-left: 4px; }
    .footer { padding: 20px 40px; background: #f8f9fa; text-align: center; color: #666; font-size: 14px; }
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
      ${metadata.config ? `<div class="info-section">
        <h2>Configuration</h2>
        <div class="config-grid">
          <div class="config-item"><span class="config-label">Provider:</span><span class="config-value">${escapeHtml(metadata.provider)}</span></div>
          <div class="config-item"><span class="config-label">Model:</span><span class="config-value">${metadata.model ? escapeHtml(metadata.model) : 'Default'}</span></div>
          <div class="config-item"><span class="config-label">Knowledge Base:</span><span class="config-value">${escapeHtml(metadata.config.knowledgeBase)}</span></div>
          <div class="config-item"><span class="config-label">Context Size:</span><span class="config-value">${metadata.contextSize ? (metadata.contextSize / 1024).toFixed(1) + ' KB' : 'N/A'}</span></div>
        </div>
      </div>` : ''}

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
        ${metadata.contextFiles.length > 0 ? `<ul class="file-list">
          ${metadata.contextFiles.map((file) => `<li><span class="file-icon">📄</span><a href="#" class="file-link" onclick="openFileInNewTab('${escapeHtml(file)}'); return false;">${escapeHtml(file)}</a></li>`).join('')}
        </ul>` : '<p style="color: #6b7280; font-style: italic;">No context files</p>'}
      </div>
    </div>
  </div>

  <div id="response-tab" class="tab-content">
    <div class="content">
      <div class="response-container">${htmlContent}</div>
    </div>
  </div>

  <div class="footer">
    <small>Generated by AgentX CLI v${escapeHtml(metadata.version)} | ${new Date(metadata.timestamp).toLocaleString()}</small>
  </div>

  <script>
    const markdownContent = ${JSON.stringify(markdown)};
    const fileContents = ${JSON.stringify(fileContents || [])};

    async function copyToClipboard() {
      const button = document.querySelector('.copy-button');
      const icon = document.getElementById('copy-icon');
      const text = document.getElementById('copy-text');
      try {
        await navigator.clipboard.writeText(markdownContent);
        button.classList.add('copied');
        icon.textContent = '✓';
        text.textContent = 'Copied!';
        setTimeout(() => { button.classList.remove('copied'); icon.textContent = '📋'; text.textContent = 'Copy'; }, 2000);
      } catch (err) {
        icon.textContent = '✗';
        text.textContent = 'Failed';
        setTimeout(() => { icon.textContent = '📋'; text.textContent = 'Copy'; }, 2000);
      }
    }

    function switchTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.getElementById(tabName + '-tab').classList.add('active');
      event.target.classList.add('active');
    }

    function openFileInNewTab(filePath) {
      const fileData = fileContents.find(f => f.path === filePath);
      const targetName = 'agentx_file_' + filePath.replace(/[^a-zA-Z0-9]/g, '_');
      const newWindow = window.open('', targetName);
      if (!newWindow) { alert('Please allow pop-ups to view file contents'); return; }
      if (fileData && fileData.content) {
        newWindow.document.write('<html><head><title>' + filePath + '</title><style>body{font-family:monospace;padding:20px;background:#f9fafb;}pre{background:white;padding:20px;border-radius:8px;overflow-x:auto;}</style></head><body><h2>' + filePath + '</h2><pre>' + fileData.content.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre></body></html>');
      } else {
        newWindow.document.write('<html><head><title>' + filePath + '</title></head><body><h2>' + filePath + '</h2><p>File content not available</p></body></html>');
      }
      newWindow.document.close();
    }

    window.switchTab = switchTab;
    window.openFileInNewTab = openFileInNewTab;
  </script>
</body>
</html>`;
}

