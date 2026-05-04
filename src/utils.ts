import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface HistoryItem {
  id: number;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  timestamp: string;
  is_favorite: number;
}
