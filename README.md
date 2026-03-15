# Alchemist CLI

A personal CLI platform for scaffolding and managing projects.

## Project Structure

```
alchemist/
├── packages/
│   ├── cli/                    # Main CLI application
│   └── cli-common/             # Shared utilities
├── package.json                # Root workspace config
└── README.md                   # This file
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install
```

### Building

```bash
# Build all packages
npm run build

# Watch mode (rebuilds on file changes)
npm run dev

# Clean build artifacts
npm run clean
```

## Running the CLI Locally

### Method 1: Direct Execution

```bash
# Build first
npm run build

# Run CLI commands
node packages/cli/bin/run.js generate next-app --name my-project
node packages/cli/bin/run.js generate next-app --name my-project --no-defaults
```

### Method 2: Using npm Script

```bash
npm run build
npm run cli -- generate next-app --name my-project
```

## Commands

### Generate Next.js App

Scaffold a new Next.js project with optional customization.

**Default setup** (recommended for quick start):

```bash
alchemist generate next-app --name my-project
```

This generates a Next.js 15+ app with:

- TypeScript (strict mode)
- Next.js App Router
- Tailwind CSS
- Vitest
- ESLint
- Prettier

**Interactive setup** (customize options):

```bash
alchemist generate next-app --name my-project --no-defaults
```

You'll be prompted to choose:

- TypeScript? (Y/n)
- Next.js App Router? (Y/n)
- Tailwind CSS? (Y/n)
- Vitest? (Y/n)
- ESLint? (Y/n)
- Prettier? (Y/n)

### Help

```bash
node packages/cli/bin/run.js --help
```

## Project Architecture

### `packages/cli`

Main CLI entry point using oclif-inspired architecture.

**Key files:**

- `src/index.ts` - CLI entry point and command router
- `src/commands/generate/next-app.ts` - Next.js generation command
- `bin/run.js` - Binary wrapper for npm installation

**Build output:** `lib/` (compiled JavaScript)

### `packages/cli-common`

Shared utilities used across all CLI commands.

**Key modules:**

- `FileGenerator` - Dynamic file creation with automatic directory handling
- `promptForOptions()` - Interactive configuration prompts
- `types.ts` - Shared TypeScript interfaces

**Build output:** `lib/` (compiled JavaScript)

## Development Workflow

### Adding a New Command

1. Create file: `packages/cli/src/commands/[command]/[subcommand].ts`
2. Export async function matching the pattern
3. Import and add router case in `packages/cli/src/index.ts`
4. Rebuild: `npm run build`

### Adding Shared Utilities

1. Create file in `packages/cli-common/src/`
2. Export from `packages/cli-common/src/index.ts`
3. Import in CLI commands: `import { MyUtil } from '@alchemist/cli-common/lib/my-file'`

### Testing Locally

After building, test your changes:

```bash
# Build
npm run build

# Test the command
node packages/cli/bin/run.js generate next-app --name test-app

# Verify generated project
cd test-app
npm install
npm run dev
```

## Generated Next.js App

The generated Next.js project includes:

- **app/** - Next.js App Router pages and layouts
- **components/** - Reusable React components
- **lib/** - Utility functions
- **utils/** - Helper functions (e.g., `cn()` for Tailwind classes)
- **public/** - Static assets
- **package.json** - Pre-configured with selected dependencies

## Troubleshooting

### "Cannot find module @alchemist/cli-common"

Make sure to build first:

```bash
npm run build
```

### CLI not running

Verify Node.js version:

```bash
node --version  # Should be 18.0.0 or higher
```

### Port 3000 already in use

The generated Next.js app uses port 3000. Run on a different port:

```bash
npm run dev -- -p 3001
```

## Next Steps (Phase 2)

Future commands planned:

- `alchemist modify` - Update existing projects
- `alchemist check-updates` - Check for dependency updates
- Authentication and project management

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## License

MIT

---

Built with ❤️ as a learning project
