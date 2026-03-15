/**
 * @alchemist/cli-common - Shared utilities for Alchemist CLI
 * Exports file generation, prompt utilities, and type definitions
 */

export { FileGenerator } from './file-generator';
export { promptForOptions, confirmAction, promptText, promptSelect } from './prompt-utils';
export type { NextAppConfig, GenerationResult } from './types';
