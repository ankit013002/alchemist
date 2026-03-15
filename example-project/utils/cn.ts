/**
 * Merge class names - useful for conditional Tailwind classes
 * Example: cn('px-2', isActive && 'bg-blue-500')
 */
export function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}
