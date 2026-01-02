/**
 * Date Formatting Utilities
 * 
 * Provides consistent date formatting across the application.
 * All dates are stored as ISO 8601 strings (YYYY-MM-DD) in the database.
 */

import { format, parseISO } from "date-fns";

/**
 * Format ISO date string to human-readable format
 * 
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Formatted date (e.g., "January 15, 2024")
 * @example
 * formatDate("2024-01-15") // "January 15, 2024"
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Format ISO date string to short format
 * 
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Short formatted date (e.g., "Jan 15")
 * @example
 * formatDateShort("2024-01-15") // "Jan 15"
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d");
  } catch {
    return dateString;
  }
}

/**
 * Get today's date as ISO 8601 string
 * 
 * @returns Today's date in YYYY-MM-DD format
 * @example
 * getTodayISO() // "2024-01-15"
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

