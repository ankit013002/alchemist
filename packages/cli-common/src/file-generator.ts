/**
 * FileGenerator - Dynamic file generation utility
 * Writes files to disk with automatic directory creation
 */

import * as fs from 'fs';
import * as path from 'path';

export class FileGenerator {
  private baseDir: string;

  /**
   * Create a new FileGenerator instance
   * @param baseDir - Base directory for all generated files
   */
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /**
   * Write a file to disk, creating directories as needed
   *
   * @param filePath - Relative path to file (e.g., 'app/page.tsx')
   * @param content - File content as string
   * @throws Error if file already exists or write fails
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    const dir = path.dirname(fullPath);

    // Create directory structure
    fs.mkdirSync(dir, { recursive: true });

    // Write file
    fs.writeFileSync(fullPath, content, 'utf-8');

    console.log(`  ✓ ${filePath}`);
  }

  /**
   * Copy a file from source to destination
   * Useful if template files exist
   *
   * @param source - Source file path
   * @param dest - Destination relative path
   */
  async copyFile(source: string, dest: string): Promise<void> {
    const fullDest = path.join(this.baseDir, dest);
    const dir = path.dirname(fullDest);

    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(source, fullDest);

    console.log(`  ✓ ${dest}`);
  }

  /**
   * Get the base directory path
   */
  getBasePath(): string {
    return this.baseDir;
  }
}
