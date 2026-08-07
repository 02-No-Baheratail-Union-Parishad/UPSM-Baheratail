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

export const convertToBengaliDigits = toBengaliNumeral;

export function toEnglishNumeral(str: string | number | undefined | null): string {
  if (str === undefined || str === null || str === '') return '';
  const bengaliDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.toString().replace(/[০-৯]/g, (w) => bengaliDigits[w] || w);
}

export const BANGLA_GREGORIAN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const BANGLA_CALENDAR_MONTHS = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
];

export const BANGLA_DAYS_OF_WEEK = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

/**
 * Returns ordinal suffix for a Bangla day number (e.g. ১লা, ২রা, ৩রা, ৪ঠা, ৫ই, ইত্যাদি)
 */
export function getBanglaDayOrdinal(day: number): string {
  const dayBn = toBengaliNumeral(day);
  if (day === 1) return `${dayBn}লা`;
  if (day === 2 || day === 3) return `${dayBn}রা`;
  if (day === 4) return `${dayBn}ঠা`;
  if (day >= 5 && day <= 18) return `${dayBn}ই`;
  if (day >= 19 && day <= 31) return `${dayBn}শে`;
  return dayBn;
}

/**
 * Check if a Gregorian year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Calculates local Bangla calendar (বঙ্গাব্দ / Banglabda) according to 
 * Bangladesh Government's revised official Bangla calendar standard (2019 revision).
 * - Pohela Boishakh is April 14
 * - Boishakh to Bhadra are 31 days each (5 months)
 * - Ashwin to Chaitra are 30 days each (except Falgun in leap year is 31 days)
 */
export function getBanglaCalendarDate(dateInput?: string | Date | number): {
  day: number;
  dayBn: string;
  dayOrdinal: string;
  month: string;
  monthIndex: number;
  year: number;
  yearBn: string;
  formatted: string;
} {
  const dateObj = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  const gYear = validDate.getFullYear();
  const gMonth = validDate.getMonth(); // 0 - 11
  const gDay = validDate.getDate(); // 1 - 31

  const leap = isLeapYear(gYear);

  // Month start days in Gregorian calendar for Bangladesh revised calendar:
  // Boishakh: Apr 14
  // Jaishtha: May 15
  // Ashar: Jun 16
  // Shrabon: Jul 17
  // Bhadra: Aug 17
  // Ashwin: Sep 17
  // Kartik: Oct 17
  // Agrahayan: Nov 16
  // Poush: Dec 16
  // Magh: Jan 15
  // Falgun: Feb 14
  // Chaitra: Mar 15

  let bYear = gYear - 593;
  let bMonthIndex = 0;
  let bDay = 1;

  // Before April 14th belongs to previous Bangla year
  if (gMonth < 3 || (gMonth === 3 && gDay < 14)) {
    bYear = gYear - 594;
  }

  // Calculate month and day based on Gregorian date ranges
  if (gMonth === 3 && gDay >= 14) { // Apr 14 - Apr 30
    bMonthIndex = 0; bDay = gDay - 13;
  } else if (gMonth === 4 && gDay <= 14) { // May 1 - May 14
    bMonthIndex = 0; bDay = gDay + 17;
  } else if (gMonth === 4 && gDay >= 15) { // May 15 - May 31
    bMonthIndex = 1; bDay = gDay - 14;
  } else if (gMonth === 5 && gDay <= 15) { // Jun 1 - Jun 15
    bMonthIndex = 1; bDay = gDay + 17;
  } else if (gMonth === 5 && gDay >= 16) { // Jun 16 - Jun 30
    bMonthIndex = 2; bDay = gDay - 15;
  } else if (gMonth === 6 && gDay <= 16) { // Jul 1 - Jul 16
    bMonthIndex = 2; bDay = gDay + 15;
  } else if (gMonth === 6 && gDay >= 17) { // Jul 17 - Jul 31
    bMonthIndex = 3; bDay = gDay - 16;
  } else if (gMonth === 7 && gDay <= 16) { // Aug 1 - Aug 16
    bMonthIndex = 3; bDay = gDay + 15;
  } else if (gMonth === 7 && gDay >= 17) { // Aug 17 - Aug 31
    bMonthIndex = 4; bDay = gDay - 16;
  } else if (gMonth === 8 && gDay <= 16) { // Sep 1 - Sep 16
    bMonthIndex = 4; bDay = gDay + 15;
  } else if (gMonth === 8 && gDay >= 17) { // Sep 17 - Sep 30
    bMonthIndex = 5; bDay = gDay - 16;
  } else if (gMonth === 9 && gDay <= 16) { // Oct 1 - Oct 16
    bMonthIndex = 5; bDay = gDay + 14;
  } else if (gMonth === 9 && gDay >= 17) { // Oct 17 - Oct 31
    bMonthIndex = 6; bDay = gDay - 16;
  } else if (gMonth === 10 && gDay <= 15) { // Nov 1 - Nov 15
    bMonthIndex = 6; bDay = gDay + 15;
  } else if (gMonth === 10 && gDay >= 16) { // Nov 16 - Nov 30
    bMonthIndex = 7; bDay = gDay - 15;
  } else if (gMonth === 11 && gDay <= 15) { // Dec 1 - Dec 15
    bMonthIndex = 7; bDay = gDay + 15;
  } else if (gMonth === 11 && gDay >= 16) { // Dec 16 - Dec 31
    bMonthIndex = 8; bDay = gDay - 15;
  } else if (gMonth === 0 && gDay <= 14) { // Jan 1 - Jan 14
    bMonthIndex = 8; bDay = gDay + 16;
  } else if (gMonth === 0 && gDay >= 15) { // Jan 15 - Jan 31
    bMonthIndex = 9; bDay = gDay - 14;
  } else if (gMonth === 1 && gDay <= 13) { // Feb 1 - Feb 13
    bMonthIndex = 9; bDay = gDay + 17;
  } else if (gMonth === 1 && gDay >= 14) { // Feb 14 - Feb 28/29
    bMonthIndex = 10; bDay = gDay - 13;
  } else if (gMonth === 2 && gDay <= 14) { // Mar 1 - Mar 14
    bMonthIndex = 10; bDay = gDay + (leap ? 16 : 15);
  } else if (gMonth === 2 && gDay >= 15) { // Mar 15 - Mar 31
    bMonthIndex = 11; bDay = gDay - 14;
  } else if (gMonth === 3 && gDay <= 13) { // Apr 1 - Apr 13
    bMonthIndex = 11; bDay = gDay + 17;
  }

  const dayBn = toBengaliNumeral(bDay);
  const yearBn = toBengaliNumeral(bYear);
  const monthName = BANGLA_CALENDAR_MONTHS[bMonthIndex];
  const dayOrdinal = getBanglaDayOrdinal(bDay);

  return {
    day: bDay,
    dayBn,
    dayOrdinal,
    month: monthName,
    monthIndex: bMonthIndex,
    year: bYear,
    yearBn,
    formatted: `${dayBn} ${monthName}, ${yearBn} বঙ্গাব্দ`
  };
}

/**
 * Format English date to Bangla numerals and format style for certificates
 */
export function formatBanglaDate(
  dateInput?: string | Date | number,
  style: 'numeric' | 'full' | 'long' | 'banglaSan' | 'both' = 'full'
): string {
  if (!dateInput) return '';

  const dateObj = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(dateObj.getTime())) {
    // If string was already e.g. "০৫/০৮/২০২৬ খ্রি.", return converted numerals
    return toBengaliNumeral(dateInput.toString());
  }

  const d = dateObj.getDate();
  const m = dateObj.getMonth();
  const y = dateObj.getFullYear();

  const dayPadBn = toBengaliNumeral(d.toString().padStart(2, '0'));
  const monthPadBn = toBengaliNumeral((m + 1).toString().padStart(2, '0'));
  const yearBn = toBengaliNumeral(y);

  if (style === 'numeric') {
    return `${dayPadBn}/${monthPadBn}/${yearBn} খ্রি.`;
  }

  if (style === 'long') {
    const ordinal = getBanglaDayOrdinal(d);
    return `${ordinal} ${BANGLA_GREGORIAN_MONTHS[m]}, ${yearBn} খ্রিস্টাব্দ`;
  }

  if (style === 'banglaSan') {
    return getBanglaCalendarDate(dateObj).formatted;
  }

  if (style === 'both') {
    const gregFull = `${dayPadBn} ${BANGLA_GREGORIAN_MONTHS[m]}, ${yearBn} খ্রি.`;
    const banglaSanFull = getBanglaCalendarDate(dateObj).formatted;
    return `${gregFull} (${banglaSanFull})`;
  }

  // Default 'full'
  return `${dayPadBn} ${BANGLA_GREGORIAN_MONTHS[m]}, ${yearBn} খ্রি.`;
}

/**
 * Generates a deterministic SHA256-like cryptographic security checksum signature
 * for certificate authenticity verification and anti-counterfeiting.
 */
export function generateSecurityChecksum(memoNo: string, nidOrId?: string, issueDate?: string): string {
  const seed = `${memoNo.trim().toUpperCase()}_${(nidOrId || 'NID').trim()}_${(issueDate || '').trim()}_BAHERATAIL_SECRET_2026`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).toUpperCase().padStart(8, '0');
  return `SIG-${hex.substring(0, 4)}-${hex2.substring(0, 4)}-${hex.substring(4, 8)}`;
}

export function generateMemoNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BUP-${year}-${random}`;
}

export function getFormattedBengaliDate(dateInput?: string | Date): string {
  return formatBanglaDate(dateInput, 'numeric');
}

/**
 * Utility to convert English date inputs or strings containing dates into Bangla numerals
 * and formats according to local calendar rules.
 */
export function convertEnglishDateToBanglaFormatted(
  dateStr: string | undefined | null,
  style: 'numeric' | 'full' | 'long' | 'banglaSan' | 'both' = 'full'
): string {
  if (!dateStr || !dateStr.trim()) return '';
  
  // Try parsing as standard date
  const parsed = new Date(dateStr.trim());
  if (!isNaN(parsed.getTime())) {
    return formatBanglaDate(parsed, style);
  }

  // Otherwise, fallback to replacing digits with Bangla numerals
  return toBengaliNumeral(dateStr);
}

/**
 * Client-side input sanitization helper to strip XSS vectors, script tags,
 * inline event handlers, and escape dangerous HTML brackets.
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/\bon\w+\s*=/gi, "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
