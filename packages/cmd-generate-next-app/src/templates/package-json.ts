import { NextAppConfig } from "@alchemist/shared";

/**
 * Generate package.json with dependencies based on config
 */
export function generatePackageJson(
  projectName: string,
  config: NextAppConfig,
): string {
  const dependencies: Record<string, string> = {
    next: "^15.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  };

  const devDependencies: Record<string, string> = {
    typescript: "^5.3.3",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
  };

  if (config.useTailwind) {
    devDependencies["tailwindcss"] = "^3.4.0";
    devDependencies["postcss"] = "^8.4.31";
    devDependencies["autoprefixer"] = "^10.4.16";
  }

  if (config.useEslint) {
    devDependencies["eslint"] = "^8.54.0";
    devDependencies["eslint-config-next"] = "^15.0.0";
  }

  if (config.usePrettier) {
    devDependencies["prettier"] = "^3.1.0";
  }

  if (config.useVitest) {
    devDependencies["vitest"] = "^1.1.0";
    devDependencies["@vitest/ui"] = "^1.1.0";
  }

  const scripts: Record<string, string> = {
    dev: "next dev",
    build: "next build",
    start: "next start",
  };

  if (config.usePrettier) {
    scripts["format"] = "prettier --write .";
  }

  if (config.useEslint) {
    scripts["lint"] = "eslint . --max-warnings 0";
  }

  if (config.useVitest) {
    scripts["test"] = "vitest";
    scripts["test:ui"] = "vitest --ui";
  }

  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    scripts,
    dependencies,
    devDependencies,
  };

  return JSON.stringify(packageJson, null, 2);
}
