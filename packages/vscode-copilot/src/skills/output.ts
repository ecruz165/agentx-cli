/**
 * Output Extractor
 * Extracts structured outputs from skill execution results
 */

import * as fs from 'fs';
import { RawExecutionResult, SkillOutput } from './types';

/**
 * Output extractor for processing skill results
 */
export class OutputExtractor {
  /**
   * Extract all outputs from raw result
   */
  extract(
    raw: RawExecutionResult,
    outputs?: SkillOutput[]
  ): Record<string, unknown> {
    if (!outputs?.length) {
      return { result: raw.stdout?.trim() || raw.response };
    }

    const result: Record<string, unknown> = {};

    for (const output of outputs) {
      result[output.name] = this.extractOne(raw, output);
    }

    return result;
  }

  /**
   * Extract a single output
   */
  extractOne(raw: RawExecutionResult, output: SkillOutput): unknown {
    switch (output.extract) {
      case 'stdout':
        return raw.stdout?.trim();

      case 'stderr':
        return raw.stderr?.trim();

      case 'full':
        return raw.response || raw.stdout;

      case 'exitCode':
        return raw.exitCode;

      case 'pattern':
        return this.extractPattern(raw.stdout || raw.response || '', output);

      case 'json':
        return this.extractJson(raw.stdout || raw.response || '', output);

      case 'file':
        return this.extractFile(output);

      default:
        return null;
    }
  }

  /**
   * Extract using regex pattern
   */
  private extractPattern(text: string, output: SkillOutput): unknown {
    if (!output.pattern) return null;

    const regex = new RegExp(output.pattern, output.flags);

    if (output.multiple) {
      const matches: string[] = [];
      let match;

      if (output.flags?.includes('g')) {
        // Global flag - find all matches
        while ((match = regex.exec(text)) !== null) {
          matches.push(match[output.group ?? 1] || match[0]);
        }
      } else {
        // Non-global - just get first match
        match = regex.exec(text);
        if (match) {
          matches.push(match[output.group ?? 1] || match[0]);
        }
      }

      return matches;
    }

    const match = regex.exec(text);
    if (!match) return null;
    return match[output.group ?? 1] || match[0];
  }

  /**
   * Extract JSON from text
   */
  private extractJson(text: string, output: SkillOutput): unknown {
    try {
      // Try to find JSON in the text
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      if (output.jsonPath) {
        return this.evaluateJsonPath(parsed, output.jsonPath);
      }

      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Simple JSONPath implementation
   */
  private evaluateJsonPath(obj: unknown, path: string): unknown {
    // Remove leading $. if present
    const parts = path.replace(/^\$\.?/, '').split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return null;

      // Handle array index notation [0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = (current as Record<string, unknown>)[key];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return null;
        }
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    }

    return current;
  }

  /**
   * Extract from file
   */
  private extractFile(output: SkillOutput): string | null {
    if (!output.path) return null;

    try {
      return fs.readFileSync(output.path, output.encoding || 'utf-8');
    } catch {
      return null;
    }
  }
}
