/**
 * Prompt Utilities - Interactive CLI prompts
 * Uses 'prompts' library for user input
 */

import prompts from 'prompts';
import { NextAppConfig } from './types';

/**
 * Interactive prompt to configure Next.js generation options
 * Returns configuration based on user selections
 */
export async function promptForOptions(): Promise<NextAppConfig> {
  const answers = await prompts([
    {
      type: 'toggle',
      name: 'useTypeScript',
      message: 'Use TypeScript?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'useAppRouter',
      message: 'Use Next.js App Router?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'useTailwind',
      message: 'Include Tailwind CSS?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'useVitest',
      message: 'Include Vitest for testing?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'useEslint',
      message: 'Include ESLint?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'usePrettier',
      message: 'Include Prettier?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
  ]);

  return answers as NextAppConfig;
}

/**
 * Simple prompt for confirming action
 * Returns true if user confirms, false otherwise
 */
export async function confirmAction(message: string): Promise<boolean> {
  const { confirmed } = await prompts({
    type: 'toggle',
    name: 'confirmed',
    message,
    initial: true,
    active: 'yes',
    inactive: 'no',
  });

  return confirmed;
}

/**
 * Prompt for text input with validation
 */
export async function promptText(
  message: string,
  initial?: string,
  validate?: (value: string) => boolean | string,
): Promise<string> {
  const { value } = await prompts({
    type: 'text',
    name: 'value',
    message,
    initial,
    validate,
  });

  return value;
}

/**
 * Prompt for selecting from choices
 */
export async function promptSelect(message: string, choices: string[]): Promise<string> {
  const { value } = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices: choices.map(c => ({ title: c, value: c })),
  });

  return value;
}
