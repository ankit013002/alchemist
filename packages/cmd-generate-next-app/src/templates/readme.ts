import { NextAppConfig } from "@alchemist/shared";

/**
 * Generate README.md with setup instructions
 */
export function generateReadme(
  projectName: string,
  config: NextAppConfig,
): string {
  return `# ${projectName}

A Next.js project generated with Alchemist CLI.

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: ${config.useTypeScript ? "TypeScript (strict mode)" : "JavaScript"}
${config.useTailwind ? "- **Styling**: Tailwind CSS" : ""}
${config.useVitest ? "- **Testing**: Vitest" : ""}
${config.useEslint ? "- **Linting**: ESLint" : ""}
${config.usePrettier ? "- **Formatting**: Prettier" : ""}

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

${
  config.useEslint
    ? `## Linting

\`\`\`bash
npm run lint
\`\`\`

`
    : ""
}${
  config.usePrettier
    ? `## Code Formatting

\`\`\`bash
npm run format
\`\`\`

`
    : ""
}${
  config.useVitest
    ? `## Testing

\`\`\`bash
npm run test      # Run tests
npm run test:ui   # Run tests with UI
\`\`\`

`
    : ""
}## Project Structure

- \`app/\` - App Router pages and layouts
- \`components/\` - Reusable React components
- \`lib/\` - Utility functions and helpers
- \`utils/\` - Standalone utility functions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
${config.useTailwind ? "- [Tailwind CSS Documentation](https://tailwindcss.com/docs)" : ""}
${config.useVitest ? "- [Vitest Documentation](https://vitest.dev)" : ""}
`;
}
