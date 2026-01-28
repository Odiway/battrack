import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  // Use fixed locale and timezone to prevent hydration mismatch
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  // Use fixed locale and timezone to prevent hydration mismatch
  return d.toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
  })
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 100
  return Math.round((completed / total) * 100)
}
