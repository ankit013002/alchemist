/**
 * Generate globals.css with Tailwind directives
 */
export function generateGlobalsCss(): string {
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
