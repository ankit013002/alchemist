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

import * as path from "path";
import * as fs from "fs";
import { Command, Flags } from "@oclif/core";
import { FileGenerator } from "@alchemist/cli-common";
import { promptForOptions } from "@alchemist/cli-common";
import { NextAppConfig } from "@alchemist/cli-common";
import * as templates from "./templates";

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
  static override description = "Scaffold a new Next.js project with Alchemist";

  static override examples = [
    "<%= config.bin %> <%= command.id %> --name my-project",
    "<%= config.bin %> <%= command.id %> --name my-project --no-defaults",
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
      char: "n",
      description: "Name of the project to create",
      required: true,
    }),
    "no-defaults": Flags.boolean({
      description: "Prompt for custom configuration instead of using defaults",
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

    this.log("\n🧪 Alchemist - Next.js Generator\n");

    const projectName = flags.name;
    const useDefaults = !flags["no-defaults"];

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
    this.log("\nGenerating project files...\n");

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
      await generator.writeFile(
        "package.json",
        templates.generatePackageJson(projectName, config),
      );
      await generator.writeFile(
        "README.md",
        templates.generateReadme(projectName, config),
      );
      await generator.writeFile(".gitignore", templates.generateGitignore());
      await generator.writeFile(
        "next.config.js",
        templates.generateNextConfig(),
      );

      // TypeScript config
      if (config.useTypeScript) {
        await generator.writeFile(
          "tsconfig.json",
          templates.generateTsconfig(),
        );
      }

      // Tailwind CSS config
      if (config.useTailwind) {
        await generator.writeFile(
          "tailwind.config.ts",
          templates.generateTailwindConfig(),
        );
        await generator.writeFile(
          "postcss.config.js",
          templates.generatePostcssConfig(),
        );
        await generator.writeFile(
          "app/globals.css",
          templates.generateGlobalsCss(),
        );
      }

      // ESLint config
      if (config.useEslint) {
        await generator.writeFile(
          "eslint.config.js",
          templates.generateEslintConfig(config.useTypeScript),
        );
      }

      // Prettier config
      if (config.usePrettier) {
        await generator.writeFile(
          ".prettierrc.json",
          templates.generatePrettierConfig(),
        );
        await generator.writeFile(
          ".prettierignore",
          templates.generatePrettierIgnore(),
        );
      }

      // Vitest config
      if (config.useVitest) {
        await generator.writeFile(
          "vitest.config.ts",
          templates.generateVitestConfig(),
        );
      }

      // App Router files
      if (config.useAppRouter) {
        const layout = templates.generateAppLayout(config.useTailwind);
        const page = templates.generateAppPage();
        await generator.writeFile("app/layout.tsx", layout);
        await generator.writeFile("app/page.tsx", page);
        await generator.writeFile(
          "app/globals.css",
          templates.generateGlobalsCss(),
        );
      }

      // Components directory
      await generator.writeFile("components/.gitkeep", "");

      // Utils directory
      await generator.writeFile("utils/cn.ts", templates.generateCnUtil());

      // Lib directory
      await generator.writeFile("lib/.gitkeep", "");

      this.log("✅ Project generated successfully!\n");
      this.log(`📁 Location: ${projectPath}`);
      this.log("\n🚀 Next steps:");
      this.log(`  cd ${projectName}`);
      this.log("  npm install");
      this.log("  npm run dev\n");
    } catch (error) {
      // Clean up on error
      fs.rmSync(projectPath, { recursive: true });
      throw error;
    }
  }
}
