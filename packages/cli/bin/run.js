#!/usr/bin/env node

/**
 * Alchemist CLI Binary Wrapper
 * Entry point for: alchemist <command>
 */

require('../lib/index.js').default().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
