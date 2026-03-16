/**
 * Generate app/layout.tsx
 */
export function generateAppLayout(useTailwind: boolean): string {
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
