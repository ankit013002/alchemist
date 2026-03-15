/**
 * Generate Next.js App Command
 * Creates a new Next.js project with user-selected options
 *
 * Usage:
 *   alchemist generate next-app --name my-project
 *   alchemist generate next-app --name my-project --no-defaults
 *
 * oclif Command Class:
 * - Extends Command from @oclif/core
 * - Declares flags and arguments via static properties
 * - oclif automatically parses command line args into flags/args
 * - run() method contains the command logic
 */

import * as path from 'path';
import * as fs from 'fs';
import { Command, Flags } from '@oclif/core';
import { FileGenerator } from '@alchemist/cli-common';
import { promptForOptions } from '@alchemist/cli-common';
import { NextAppConfig } from '@alchemist/cli-common';

const DEFAULT_CONFIG: NextAppConfig = {
  useTypeScript: true,
  useAppRouter: true,
  useTailwind: true,
  useVitest: true,
  useEslint: true,
  usePrettier: true,
};

/**
 * oclif Command Class for "generate next-app"
 *
 * oclif automatically:
 * - Parses command line arguments
 * - Converts flags (--name, --no-defaults) into a flags object
 * - Handles help and error messages
 * - Provides this.log() for output
 */
export default class GenerateNextApp extends Command {
  static override description = 'Scaffold a new Next.js project with Alchemist';

  static override examples = [
    '<%= config.bin %> <%= command.id %> --name my-project',
    '<%= config.bin %> <%= command.id %> --name my-project --no-defaults',
  ];

  /**
   * oclif Flags Definition
   *
   * Flags are command-line options that start with --
   *
   * --name: Required string flag
   *   char: 'n' allows --name or -n
   *   description: Shown in help
   *   required: true - oclif will error if missing
   *
   * --no-defaults: Boolean flag
   *   allowNo: true - allows both --no-defaults and --no-no-defaults
   *   description: Shown in help
   *   default: false - by default use defaults
   */
  static override flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name of the project to create',
      required: true,
    }),
    'no-defaults': Flags.boolean({
      description: 'Prompt for custom configuration instead of using defaults',
      default: false,
    }),
  };

  /**
   * Main command execution
   *
   * oclif calls this method automatically
   * this.flags contains parsed --name and --no-defaults
   * this.log() outputs to console with proper formatting
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(GenerateNextApp);

    this.log('\n🧪 Alchemist - Next.js Generator\n');

    const projectName = flags.name;
    const useDefaults = !flags['no-defaults'];

    // Determine configuration
    let config: NextAppConfig;

    if (useDefaults) {
      this.log(`Using default setup for "${projectName}"...`);
      config = { ...DEFAULT_CONFIG };
    } else {
      this.log(`Configuring "${projectName}" with custom options...\n`);
      config = await promptForOptions();
    }

    // Generate project
    this.log('\nGenerating project files...\n');

    const projectPath = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      this.error(`Directory already exists: ${projectPath}`);
    }

    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });

    const generator = new FileGenerator(projectPath);

    // Generate all files
    try {
      // Root files
      await generator.writeFile('package.json', generatePackageJson(projectName, config));
      await generator.writeFile('README.md', generateReadme(projectName, config));
      await generator.writeFile('.gitignore', generateGitignore());
      await generator.writeFile('next.config.js', generateNextConfig());

      // TypeScript config
      if (config.useTypeScript) {
        await generator.writeFile('tsconfig.json', generateTsconfig());
      }

      // Tailwind CSS config
      if (config.useTailwind) {
        await generator.writeFile('tailwind.config.ts', generateTailwindConfig());
        await generator.writeFile('postcss.config.js', generatePostcssConfig());
        await generator.writeFile('app/globals.css', generateGlobalsCss());
      }

      // ESLint config
      if (config.useEslint) {
        await generator.writeFile('eslint.config.js', generateEslintConfig(config.useTypeScript));
      }

      // Prettier config
      if (config.usePrettier) {
        await generator.writeFile('.prettierrc.json', generatePrettierConfig());
        await generator.writeFile('.prettierignore', generatePrettierIgnore());
      }

      // Vitest config
      if (config.useVitest) {
        await generator.writeFile('vitest.config.ts', generateVitestConfig());
      }

      // App Router files
      if (config.useAppRouter) {
        const layout = generateAppLayout(config.useTailwind);
        const page = generateAppPage();
        await generator.writeFile('app/layout.tsx', layout);
        await generator.writeFile('app/page.tsx', page);
        await generator.writeFile('app/globals.css', generateGlobalsCss());
      }

      // Components directory
      await generator.writeFile('components/.gitkeep', '');

      // Utils directory
      await generator.writeFile('utils/cn.ts', generateCnUtil());

      // Lib directory
      await generator.writeFile('lib/.gitkeep', '');

      this.log('✅ Project generated successfully!\n');
      this.log(`📁 Location: ${projectPath}`);
      this.log('\n🚀 Next steps:');
      this.log(`  cd ${projectName}`);
      this.log('  npm install');
      this.log('  npm run dev\n');
    } catch (error) {
      // Clean up on error
      fs.rmSync(projectPath, { recursive: true });
      throw error;
    }
  }
}

/**
 * Generate package.json with dependencies based on config
 */
function generatePackageJson(projectName: string, config: NextAppConfig): string {
  const dependencies: Record<string, string> = {
    'next': '^15.0.0',
    'react': '^19.0.0',
    'react-dom': '^19.0.0',
  };

  const devDependencies: Record<string, string> = {
    'typescript': '^5.3.3',
    '@types/node': '^20.10.0',
    '@types/react': '^18.2.42',
    '@types/react-dom': '^18.2.17',
  };

  if (config.useTailwind) {
    devDependencies['tailwindcss'] = '^3.4.0';
    devDependencies['postcss'] = '^8.4.31';
    devDependencies['autoprefixer'] = '^10.4.16';
  }

  if (config.useEslint) {
    devDependencies['eslint'] = '^8.54.0';
    devDependencies['eslint-config-next'] = '^15.0.0';
  }

  if (config.usePrettier) {
    devDependencies['prettier'] = '^3.1.0';
  }

  if (config.useVitest) {
    devDependencies['vitest'] = '^1.1.0';
    devDependencies['@vitest/ui'] = '^1.1.0';
  }

  const scripts: Record<string, string> = {
    'dev': 'next dev',
    'build': 'next build',
    'start': 'next start',
  };

  if (config.usePrettier) {
    scripts['format'] = 'prettier --write .';
  }

  if (config.useEslint) {
    scripts['lint'] = 'eslint . --max-warnings 0';
  }

  if (config.useVitest) {
    scripts['test'] = 'vitest';
    scripts['test:ui'] = 'vitest --ui';
  }

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies,
    devDependencies,
  };

  return JSON.stringify(packageJson, null, 2);
}

/**
 * Generate README.md with setup instructions
 */
function generateReadme(projectName: string, config: NextAppConfig): string {
  return `# ${projectName}

A Next.js project generated with Alchemist CLI.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: ${config.useTypeScript ? 'TypeScript (strict mode)' : 'JavaScript'}
${config.useTailwind ? '- **Styling**: Tailwind CSS' : ''}
${config.useVitest ? '- **Testing**: Vitest' : ''}
${config.useEslint ? '- **Linting**: ESLint' : ''}
${config.usePrettier ? '- **Formatting**: Prettier' : ''}

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

${config.useEslint ? `## Linting

\`\`\`bash
npm run lint
\`\`\`` : ''}

${config.usePrettier ? `## Code Formatting

\`\`\`bash
npm run format
\`\`\`` : ''}

${config.useVitest ? `## Testing

\`\`\`bash
npm run test         # Run tests
npm run test:ui      # Interactive test UI
\`\`\`` : ''}

## Project Structure

\`\`\`
${projectName}/
├── app/              # Next.js App Router
├── components/       # Reusable React components
├── lib/              # Utility functions
├── utils/            # Helper functions
├── public/           # Static assets
└── package.json
\`\`\`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
${config.useTailwind ? '- [Tailwind CSS Documentation](https://tailwindcss.com/docs)' : ''}

---

Generated with [Alchemist CLI](https://github.com/your-org/alchemist)
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# Dependencies
node_modules/
/.pnp
.pnp.js
package-lock.json
yarn.lock

# Testing
/.vitest
/coverage

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
`;
}

/**
 * Generate next.config.js
 */
function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;
}

/**
 * Generate tsconfig.json
 */
function generateTsconfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: 'preserve',
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowJs: true,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    },
    null,
    2,
  );
}

/**
 * Generate tailwind.config.ts
 */
function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
`;
}

/**
 * Generate postcss.config.js
 */
function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

/**
 * Generate globals.css with Tailwind directives
 */
function generateGlobalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-white;
}
`;
}

/**
 * Generate app/layout.tsx
 */
function generateAppLayout(useTailwind: boolean): string {
  return `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to your Next.js app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
`;
}

/**
 * Generate app/page.tsx
 */
function generateAppPage(): string {
  return `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Alchemist
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your Next.js app is ready to go
        </p>
        <p className="text-sm text-gray-500">
          Edit <code className="bg-gray-100 px-2 py-1">app/page.tsx</code> to get started
        </p>
      </div>
    </main>
  );
}
`;
}

/**
 * Generate eslint.config.js
 */
function generateEslintConfig(useTypeScript: boolean): string {
  return `module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: ['next/core-web-vitals'],
  },
];
`;
}

/**
 * Generate .prettierrc.json
 */
function generatePrettierConfig(): string {
  return JSON.stringify(
    {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      arrowParens: 'avoid',
    },
    null,
    2,
  );
}

/**
 * Generate .prettierignore
 */
function generatePrettierIgnore(): string {
  return `node_modules
.next
out
build
dist
.git
.vscode
.idea
*.pem
`;
}

/**
 * Generate vitest.config.ts
 */
function generateVitestConfig(): string {
  return `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
`;
}

/**
 * Generate utils/cn.ts - className utility for Tailwind
 */
function generateCnUtil(): string {
  return `/**
 * Merge class names - useful for conditional Tailwind classes
 * Example: cn('px-2', isActive && 'bg-blue-500')
 */
export function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
`;
}
