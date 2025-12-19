import { format, parseISO } from "date-fns";

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d");
  } catch {
    return dateString;
  }
}

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

