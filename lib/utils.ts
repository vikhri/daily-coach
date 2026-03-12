import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "d MMMM") {
  return format(typeof date === "string" ? new Date(date) : date, pattern, {
    locale: ru
  });
}

export function summarizeMeal(tags: string[], note?: string | null) {
  const parts = [...tags];
  if (note) {
    parts.push(note);
  }
  return parts.length ? parts.join(", ") : "Нет данных";
}

export function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
