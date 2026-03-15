/**
 * Shared type definitions for Alchemist CLI
 */

/**
 * Configuration for Next.js app generation
 * Represents user choices for what to include in the generated project
 */
export interface NextAppConfig {
  /** Include TypeScript (strict mode) */
  useTypeScript: boolean;

  /** Use Next.js App Router (vs Pages Router) */
  useAppRouter: boolean;

  /** Include Tailwind CSS */
  useTailwind: boolean;

  /** Include Vitest for unit testing */
  useVitest: boolean;

  /** Include ESLint for linting */
  useEslint: boolean;

  /** Include Prettier for code formatting */
  usePrettier: boolean;
}

/**
 * Result of file generation operation
 */
export interface GenerationResult {
  projectPath: string;
  filesGenerated: number;
  config: NextAppConfig;
}
