/**
 * Generate app/page.tsx
 */
export function generateAppPage(): string {
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
