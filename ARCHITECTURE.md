# Alchemist Architecture & Implementation Guide

A comprehensive guide to understanding how Alchemist works and how to extend it.

---

## 1. Project Vision & Goals

### What is Alchemist?
- A personal CLI tool that scaffolds (generates) new React/Next.js projects
- Similar to tools like Create React App or Next.js CLI, but customized
- Inspired by JPMC's Octagon (an internal enterprise tool)

### Why build it?
- Learning project to understand CLI architecture, monorepos, and code generation
- You control the defaults and what gets scaffolded
- Can be extended with custom templates, frameworks, and commands in the future

### Phases
- **Phase 1** (✅ done): `generate next-app` - scaffold a basic Next.js project
- **Phase 2** (planned): `modify` command to update existing projects, `check-updates` for version management
- **Phase 3** (future): Support custom React frameworks beyond Next.js

---

## 2. The Monorepo Structure (npm workspaces)

Think of the monorepo like a **command center with specialized departments**:

```
alchemist/ (root - the command center)
├── packages/
│   ├── cli/              (reception desk - routes commands)
│   ├── shared/           (shared tools & utilities - available to all)
│   ├── cmd-generate-next-app/  (Next.js generator department)
│   ├── cmd-modify/       (Phase 2 - placeholder)
│   └── cmd-check-updates/ (Phase 2 - placeholder)
```

### Why This Structure?

**Before (monolithic):** All commands were embedded in the CLI package
```
packages/cli/src/commands/generate/next-app.ts  ❌ Hard to scale
```

**Now (modular):** Each command is its own package
```
packages/cmd-generate-next-app/src/commands/generate/next-app.ts  ✅ Easy to scale
```

**Benefits:**
- Each command can be versioned independently
- Easy to add Phase 2 commands without touching the CLI
- Commands can have their own dependencies
- Each team could own their own command package

---

## 3. How the System Works - High Level Flow

When you run: `node packages/cli/bin/run.js generate:next-app --name my-app`

```
┌─────────────────────────────────────────────────────────┐
│ 1. User types: generate:next-app --name my-app         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. bin/run.js executes (@oclif/core takes over)       │
│    - Parses the command: "generate:next-app"           │
│    - Parses the flag: "--name my-app"                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. oclif discovers the command via plugins             │
│    - Looks in packages/cmd-generate-next-app/lib       │
│    - Finds: lib/commands/generate/next-app.js         │
│    - Loads the GenerateNextApp class                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. GenerateNextApp.run() executes                      │
│    - Gets the project name from flags                  │
│    - Decides: use defaults or prompt user?            │
│    - Creates NextAppConfig object                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Generates files via templates                       │
│    - Imports template functions:                       │
│      • generatePackageJson(name, config)              │
│      • generateReadme(name, config)                    │
│      • generateTsconfig()                              │
│      • ... (15+ more templates)                        │
│    - Each template = a function that returns a string  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. FileGenerator writes files to disk                  │
│    - Creates directories as needed                     │
│    - Writes package.json, README, configs, etc.       │
│    - Prints progress: ✓ package.json, ✓ README.md... │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Success! User sees:                                 │
│    ✅ Project generated successfully!                   │
│    📁 Location: /path/to/my-app                        │
│    🚀 Next steps: cd my-app && npm install            │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Deep Dive: Each Package's Job

### `packages/cli` - The Entry Point

**What it does:** Routes commands to the right handler

**Key files:**
```
packages/cli/
├── package.json          # Lists cmd-* packages as plugins
├── bin/run.js            # Executable entry point
└── src/index.ts          # Calls oclif.run()
```

**The package.json magic:**
```json
{
  "bin": {
    "alchemist": "bin/run.js"  // Makes it executable
  },
  "oclif": {
    "commands": "./lib/commands",  // oclif looks here for commands
    "plugins": [                    // But first, load plugins
      "@oclif/plugin-help",
      "@oclif/plugin-version",
      "@alchemist/cmd-generate-next-app"  // ← This is how cmd packages register
    ]
  }
}
```

**What happens when oclif starts:**
1. oclif scans the `plugins` array
2. For each plugin, it looks in `node_modules/@alchemist/cmd-generate-next-app/lib/commands`
3. Finds all command files (like `generate/next-app.js`)
4. Makes them available as `generate:next-app`

---

### `packages/shared` - The Utility Library

**What it does:** Provides reusable functions all commands can use

**Key exports:**
```typescript
// FileGenerator - writes files to disk
class FileGenerator {
  writeFile(path, content) { ... }
}

// promptForOptions - interactive prompts
async function promptForOptions(): Promise<NextAppConfig> { ... }

// Types - shared interfaces
interface NextAppConfig {
  useTypeScript: boolean
  useAppRouter: boolean
  useTailwind: boolean
  useVitest: boolean
  useEslint: boolean
  usePrettier: boolean
}
```

**Why it exists:**
- Phase 2 commands (modify, check-updates) will also need these utilities
- Single source of truth for config types
- DRY principle - don't duplicate FileGenerator, prompts, etc.

---

### `packages/cmd-generate-next-app` - The Command Implementation

**What it does:** Implements the `generate next-app` command

**Structure:**
```
packages/cmd-generate-next-app/
├── src/
│   ├── commands/generate/
│   │   └── next-app.ts           # The command class
│   └── templates/                # Template functions
│       ├── package-json.ts       # Returns JSON string
│       ├── readme.ts             # Returns markdown string
│       ├── gitignore.ts          # Returns gitignore content
│       ├── configs/              # Config files
│       │   ├── tsconfig.ts
│       │   ├── tailwind.ts
│       │   ├── eslint.ts
│       │   ├── prettier.ts
│       │   ├── postcss.ts
│       │   └── vitest.ts
│       ├── app/                  # Next.js app files
│       │   ├── layout.ts         # app/layout.tsx
│       │   ├── page.ts           # app/page.tsx
│       │   └── globals-css.ts    # app/globals.css
│       └── utils/                # Utility files
│           └── cn-util.ts        # className utility
└── .oclifignore                  # Tells oclif to ignore templates
```

**The command class anatomy:**

```typescript
export default class GenerateNextApp extends Command {
  // Description shown in help
  static override description = "Scaffold a new Next.js project with Alchemist"

  // Define command-line flags/options
  static override flags = {
    name: Flags.string({
      char: "n",                  // Allows -n shorthand
      description: "...",
      required: true,             // Must be provided
    }),
    "no-defaults": Flags.boolean({
      description: "Prompt for custom configuration",
      default: false,
    }),
  }

  // Main logic - called when command runs
  async run(): Promise<void> {
    const { flags } = await this.parse(GenerateNextApp)

    const projectName = flags.name
    const useDefaults = !flags["no-defaults"]

    // 1. Decide config (defaults or prompt)
    let config: NextAppConfig
    if (useDefaults) {
      config = { ...DEFAULT_CONFIG }  // TypeScript: true, Tailwind: true, etc.
    } else {
      config = await promptForOptions()  // Ask user questions
    }

    // 2. Create project directory
    const projectPath = path.resolve(process.cwd(), projectName)
    fs.mkdirSync(projectPath, { recursive: true })

    // 3. Generate files based on config
    const generator = new FileGenerator(projectPath)
    await generator.writeFile("package.json", generatePackageJson(projectName, config))
    await generator.writeFile("README.md", generateReadme(projectName, config))
    // ... more files

    // 4. Success message
    this.log("✅ Project generated successfully!")
  }
}
```

---

## 5. How Templates Work

Templates are **functions that return strings**. No need for physical files!

**Example: package-json template**
```typescript
export function generatePackageJson(
  projectName: string,
  config: NextAppConfig,
): string {
  // Build dependencies object based on config
  const dependencies = {
    next: "^15.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  }

  const devDependencies = {}

  if (config.useTailwind) {
    devDependencies["tailwindcss"] = "^3.4.0"
    devDependencies["postcss"] = "^8.4.31"
  }

  if (config.useEslint) {
    devDependencies["eslint"] = "^8.54.0"
  }

  // ... more conditional dependencies

  // Return the final package.json as a JSON string
  const pkg = {
    name: projectName,
    version: "0.1.0",
    scripts: { dev: "next dev", build: "next build", ... },
    dependencies,
    devDependencies,
  }

  return JSON.stringify(pkg, null, 2)
}
```

**Why this approach?**
- No separate template files to manage
- Config drives what gets generated (DRY)
- Easy to test - just call the function
- Full programming power (if statements, loops, etc.)

---

## 6. Data Flow: Config Object

The `NextAppConfig` object is the **heart** of the system - it drives everything:

```typescript
interface NextAppConfig {
  useTypeScript: boolean      // Should we include tsconfig.json?
  useAppRouter: boolean       // Should we use app/ (not pages/)?
  useTailwind: boolean        // Should we include Tailwind CSS?
  useVitest: boolean          // Should we include Vitest?
  useEslint: boolean          // Should we include ESLint?
  usePrettier: boolean        // Should we include Prettier?
}
```

**Two ways to create it:**

1. **Default Config (fast):**
```typescript
const config = {
  useTypeScript: true,
  useAppRouter: true,
  useTailwind: true,
  useVitest: true,
  useEslint: true,
  usePrettier: true,
}
```

2. **Prompt User (interactive):**
```typescript
const config = await promptForOptions()
// User sees:
// Use TypeScript? (Yes) / No
// Use Next.js App Router? (Yes) / No
// Include Tailwind CSS? (Yes) / No
// ... etc
```

**Then every template uses it:**
```typescript
// Only generate Tailwind config if user wants it
if (config.useTailwind) {
  await generator.writeFile(
    "tailwind.config.ts",
    generateTailwindConfig()  // Returns the config string
  )
}

// Conditionally add Tailwind dependencies
if (config.useTailwind) {
  devDependencies["tailwindcss"] = "^3.4.0"
  // ...
}
```

This is powerful because:
- One config object controls the entire generated project
- Adding a new tool? Just update the config interface and add conditionals
- Removing a tool? Delete the config field and related conditionals

---

## 7. How to Add Phase 2 Commands

Let's say you want to add a `modify` command that updates existing projects.

### Step 1: Create the package structure
```bash
mkdir -p packages/cmd-modify/src/commands/modify
```

### Step 2: Create command class
```typescript
// packages/cmd-modify/src/commands/modify/index.ts
import { Command, Flags } from "@oclif/core"
import { FileGenerator } from "@alchemist/shared"

export default class Modify extends Command {
  static override description = "Modify an existing Alchemist project"

  static override flags = {
    path: Flags.string({
      char: "p",
      description: "Path to project to modify",
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Modify)

    // Your modification logic here
    this.log(`Modifying project at: ${flags.path}`)
  }
}
```

### Step 3: Update cli package to discover it
```json
// packages/cli/package.json
{
  "oclif": {
    "plugins": [
      "@oclif/plugin-help",
      "@oclif/plugin-version",
      "@alchemist/cmd-generate-next-app",
      "@alchemist/cmd-modify"  // Add this
    ]
  }
}
```

### Step 4: Use shared utilities
```typescript
import { FileGenerator } from "@alchemist/shared"

const generator = new FileGenerator(projectPath)
await generator.writeFile("some-file.ts", "content")
```

That's it! oclif automatically discovers it and makes it available as `modify:index`

---

## 8. The Build Process

**What happens when you run `npm run build`:**

```
npm run build (at root)
  └─> npm run build --workspaces
      ├─> packages/cli: tsc (TypeScript → JavaScript)
      ├─> packages/shared: tsc
      ├─> packages/cmd-generate-next-app: tsc + rm -rf lib/templates
      ├─> packages/cmd-modify: tsc
      └─> packages/cmd-check-updates: tsc
```

**Why remove templates from lib?**
- Templates are TypeScript functions that get compiled to JavaScript
- But oclif scans lib/commands looking for command classes
- If we leave templates in lib, oclif tries to treat them as commands (error!)
- Solution: `.oclifignore` file tells oclif to skip template directories

---

## 9. Key Design Decisions & Why

| Decision | Why |
|----------|-----|
| **Templates as functions, not files** | Single source of truth, easier to customize, DRY |
| **Config object drives generation** | Enables conditional files, easy to add/remove features |
| **Separate cmd-* packages** | Scales to Phase 2, independent versioning |
| **oclif plugins system** | Automatic command discovery, clean routing |
| **@alchemist/shared** | All commands share utilities, no duplication |
| **TypeScript strict mode** | Catch bugs early, better developer experience |

---

## 10. What You Need to Know to Extend

### To add Phase 2 `modify` command:
1. Create `packages/cmd-modify/` with same structure as `cmd-generate-next-app`
2. Create a command class extending oclif `Command`
3. Import utilities from `@alchemist/shared` (FileGenerator, types, etc.)
4. Add to `cli/package.json` plugins list
5. Build and test

### To add a new tool option (like Docker, GitHub Actions, etc.):
1. Add field to `NextAppConfig` interface in `shared/src/types.ts`
2. Add conditional prompt in `shared/src/prompt-utils.ts`
3. Create template function in `cmd-generate-next-app/src/templates/`
4. Add conditional file generation in the command class
5. Add conditional dependencies in package-json template

**Architecture is designed for this** - minimal changes needed!

---

## 11. Running It Locally

### First time setup
```bash
npm install
npm run build
```

### Generate a test project
```bash
node packages/cli/bin/run.js generate:next-app --name test-app
```

### Verify it works
```bash
cd test-app
npm install
npm run dev  # Open http://localhost:3000
```

### Make changes to code
```bash
npm run build           # Recompile all packages
# Run the command again to see changes
```

---

## 12. File Locations Reference

Quick reference for where things live:

```
Shared Types & Utils:
  packages/shared/src/types.ts              ← Add new config fields here
  packages/shared/src/prompt-utils.ts       ← Add new prompts here
  packages/shared/src/file-generator.ts     ← File writing utility

Command Implementation:
  packages/cmd-generate-next-app/src/commands/generate/next-app.ts    ← Main logic
  packages/cmd-generate-next-app/src/templates/                        ← All template functions

CLI Entry Point:
  packages/cli/package.json                 ← Register plugins here
  packages/cli/bin/run.js                   ← Executable entry
  packages/cli/src/index.ts                 ← oclif runner

Project Documentation:
  CLAUDE.md                                 ← Project guidelines & quick start
  ARCHITECTURE.md                           ← This file - deep dive
```

---

## 13. Common Tasks

### Add a new template file

1. Create `packages/cmd-generate-next-app/src/templates/my-template.ts`
2. Export a function: `export function generateMyTemplate(): string { return "..." }`
3. Import in command: `import { generateMyTemplate } from "../../templates/my-template"`
4. Use in command: `await generator.writeFile("path/to/file", generateMyTemplate())`

### Add a new tool option (e.g., Docker support)

1. Add to `NextAppConfig` in `packages/shared/src/types.ts`:
   ```typescript
   interface NextAppConfig {
     // ... existing fields
     useDocker: boolean
   }
   ```

2. Add prompt in `packages/shared/src/prompt-utils.ts`:
   ```typescript
   {
     type: 'toggle',
     name: 'useDocker',
     message: 'Include Docker configuration?',
     initial: false,
   }
   ```

3. Create template in `packages/cmd-generate-next-app/src/templates/`:
   ```typescript
   export function generateDockerfile(): string {
     return `FROM node:18-alpine\n...`
   }
   ```

4. Update command to use it:
   ```typescript
   if (config.useDocker) {
     await generator.writeFile("Dockerfile", generateDockerfile())
   }
   ```

5. Update package.json template to add Docker dependencies if needed

### Add a new Phase 2 command

1. Copy `packages/cmd-modify/` structure to `packages/cmd-new-command/`
2. Create `src/commands/new-command/index.ts` with your command class
3. Import from `@alchemist/shared` as needed
4. Add to `packages/cli/package.json` plugins array: `"@alchemist/cmd-new-command"`
5. Build and test: `npm run build && node packages/cli/bin/run.js new-command:index --help`

---

## 14. Testing Your Changes

```bash
# Build everything
npm run build

# Generate a test project
node packages/cli/bin/run.js generate:next-app -n my-test-app

# Verify structure
ls my-test-app/
cat my-test-app/package.json

# Clean up
rm -rf my-test-app
```

---

## 15. Debugging Tips

### Command not found?
```bash
# Check that plugin is registered in cli/package.json
# Run: npm run build
# Check that package.json has updated syntax
```

### File not generated?
```bash
# Check the conditional in next-app.ts
# if (config.useX) { await generator.writeFile(...) }
# Make sure config has useX = true
```

### Import errors?
```bash
# Make sure imports are from @alchemist/shared, not relative
# import { FileGenerator } from "@alchemist/shared"  ✅
# import { FileGenerator } from "../../../shared/src"  ❌
```

### Build fails?
```bash
# Try: npm run clean && npm install && npm run build
# TypeScript errors will show what's wrong
```

---

You now have a complete understanding of the Alchemist architecture! Ready to build Phase 2? 🚀
