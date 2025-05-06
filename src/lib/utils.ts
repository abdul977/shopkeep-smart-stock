import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Naira currency
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string with Naira symbol
 */
export function formatCurrency(amount: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(amount)
}
