import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Naira currency
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @param compact - Whether to use compact notation for mobile displays
 * @returns Formatted currency string with Naira symbol
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {},
  compact: boolean = false
) {
  // Check if we should use compact notation (for mobile displays)
  if (compact && amount >= 10000) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      compactDisplay: 'short',
      ...options
    }).format(amount)
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(amount)
}
