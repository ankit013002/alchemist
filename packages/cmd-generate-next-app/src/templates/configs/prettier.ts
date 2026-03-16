/**
 * Generate .prettierrc.json
 */
export function generatePrettierConfig(): string {
  return JSON.stringify(
    {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: "es5",
      printWidth: 100,
      arrowParens: "avoid",
    },
    null,
    2,
  );
}

/**
 * Generate .prettierignore
 */
export function generatePrettierIgnore(): string {
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
