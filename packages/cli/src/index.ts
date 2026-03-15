#!/usr/bin/env node

/**
 * Alchemist CLI Entry Point
 * Uses oclif to manage commands and routing
 */

import { run } from '@oclif/core';

/**
 * Main CLI entry point
 * oclif handles:
 * - Command discovery (finds all files in lib/commands)
 * - Argument parsing (--name, --no-defaults, etc.)
 * - Help generation (automatic from command descriptions)
 * - Error handling and formatting
 */
export async function main() {
  await run();
}

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export default main;
