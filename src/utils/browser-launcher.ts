/**
 * OS-aware browser launcher utility
 * Opens HTML files in the default browser across different operating systems
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Detect the current operating system
 */
export function detectOS(): 'darwin' | 'linux' | 'win32' | 'unknown' {
  const platform = os.platform();
  
  if (platform === 'darwin') return 'darwin';
  if (platform === 'linux') return 'linux';
  if (platform === 'win32') return 'win32';
  
  return 'unknown';
}

/**
 * Open a file in the default browser
 * @param filePath - Absolute path to the HTML file
 * @returns Promise that resolves when browser is launched
 */
export async function openInBrowser(filePath: string): Promise<void> {
  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const platform = detectOS();

  try {
    switch (platform) {
      case 'darwin':
        await openInBrowserMacOS(filePath);
        break;
      case 'linux':
        await openInBrowserLinux(filePath);
        break;
      case 'win32':
        await openInBrowserWindows(filePath);
        break;
      default:
        throw new Error(`Unsupported operating system: ${platform}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to open browser: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Open browser on macOS
 */
async function openInBrowserMacOS(filePath: string): Promise<void> {
  // Use 'open' command on macOS
  return new Promise((resolve, reject) => {
    const child = spawn('open', [filePath], {
      detached: true,
      stdio: 'ignore',
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to launch browser on macOS: ${error.message}`));
    });

    child.on('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

/**
 * Open browser on Linux
 */
async function openInBrowserLinux(filePath: string): Promise<void> {
  // Try xdg-open first (most common), then fallback to other options
  const commands = ['xdg-open', 'gnome-open', 'kde-open', 'sensible-browser'];

  for (const command of commands) {
    try {
      // Check if command exists
      await execAsync(`which ${command}`);

      // Command exists, use it
      return new Promise((resolve, reject) => {
        const child = spawn(command, [filePath], {
          detached: true,
          stdio: 'ignore',
        });

        child.on('error', (error) => {
          reject(new Error(`Failed to launch browser with ${command}: ${error.message}`));
        });

        child.on('spawn', () => {
          child.unref();
          resolve();
        });
      });
    } catch {
      // Command doesn't exist, try next one
      continue;
    }
  }

  throw new Error(
    'No suitable browser launcher found on Linux. Please install xdg-utils or set a default browser.'
  );
}

/**
 * Open browser on Windows
 */
async function openInBrowserWindows(filePath: string): Promise<void> {
  // Use 'start' command on Windows
  // Need to escape the path properly for Windows
  const escapedPath = filePath.replace(/&/g, '^&');

  return new Promise((resolve, reject) => {
    // Use 'cmd /c start' to open the file
    const child = spawn('cmd', ['/c', 'start', '""', escapedPath], {
      detached: true,
      stdio: 'ignore',
      shell: true,
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to launch browser on Windows: ${error.message}`));
    });

    child.on('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

/**
 * Create a temporary HTML file and open it in browser
 * @param htmlContent - HTML content to display
 * @param filename - Optional filename (default: agentx-preview-{timestamp}.html)
 * @returns Path to the created temporary file
 */
export async function createAndOpenPreview(
  htmlContent: string,
  filename?: string
): Promise<string> {
  const tmpDir = os.tmpdir();
  const timestamp = Date.now();
  const fileName = filename || `agentx-preview-${timestamp}.html`;
  const filePath = path.join(tmpDir, fileName);

  // Write HTML content to temporary file
  fs.writeFileSync(filePath, htmlContent, 'utf-8');

  // Open in browser
  await openInBrowser(filePath);

  return filePath;
}

/**
 * Get the name of the current operating system for display
 */
export function getOSName(): string {
  const platform = detectOS();
  
  switch (platform) {
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    case 'win32':
      return 'Windows';
    default:
      return 'Unknown OS';
  }
}

