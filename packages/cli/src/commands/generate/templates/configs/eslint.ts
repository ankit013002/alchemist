/**
 * Generate eslint.config.js
 */
export function generateEslintConfig(useTypeScript: boolean): string {
  return `module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: ['next/core-web-vitals'],
  },
];
`;
}
