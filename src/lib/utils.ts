import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugFromPath(path: string): string {
  const match = path.match(/works\/([^/]+)\//);
  return match ? match[1] : '';
}
