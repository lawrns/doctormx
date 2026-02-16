/**
 * Tailwind CSS utility for conditional class merging
 * 
 * Combines clsx for conditional classes with tailwind-merge for proper
 * Tailwind class deduplication.
 * 
 * @example
 * ```tsx
 * <div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)}>
 * ```
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
