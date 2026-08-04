import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function toBengaliNumeral(str: string | number | undefined | null): string {
  if (str === undefined || str === null || str === '') return '';
  const englishDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return str.toString().replace(/[0-9]/g, (w) => englishDigits[w] || w);
}

export function toEnglishNumeral(str: string | number | undefined | null): string {
  if (str === undefined || str === null || str === '') return '';
  const bengaliDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.toString().replace(/[০-৯]/g, (w) => bengaliDigits[w] || w);
}

export function generateMemoNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BUP-${year}-${random}`;
}

export function getFormattedBengaliDate(dateInput?: string | Date): string {
  const dateObj = dateInput ? new Date(dateInput) : new Date();
  const day = toBengaliNumeral(dateObj.getDate().toString().padStart(2, '0'));
  const month = toBengaliNumeral((dateObj.getMonth() + 1).toString().padStart(2, '0'));
  const year = toBengaliNumeral(dateObj.getFullYear());
  return `${day}/${month}/${year} খ্রি.`;
}
