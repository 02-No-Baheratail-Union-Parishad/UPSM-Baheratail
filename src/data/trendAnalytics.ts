export interface DayTrendRecord {
  date: string;         // e.g. "০৭ জুলাই"
  rawDate: string;      // "2026-07-07"
  citizenship: number;  // Birth & Citizenship
  tradeLicense: number; // Trade License & Business
  warish: number;       // Inheritance & Family
  character: number;    // Character & Social
  financial: number;    // Financial & Income
  others: number;       // Other types
  total: number;
}

export interface CategorySummary {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  iconName: string;
}

export interface CertificateType30DayStat {
  typeKey: string;
  label: string;
  category: string;
  count: number;
  percentage: number;
}

export interface TrendAnalyticsResponse {
  dailyTrends: DayTrendRecord[];
  categorySummaries: CategorySummary[];
  topCertificateTypes: CertificateType30DayStat[];
  summaryStats: {
    total30Days: number;
    prev30DaysTotal: number;
    growthPercentage: number;
    peakDay: { date: string; count: number };
    avgDaily: number;
    topCategory: { label: string; count: number; percentage: number };
  };
}

// Convert English numbers to Bengali digits
export function toBengaliNumeral(num: number | string): string {
  const map: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().replace(/[0-9]/g, (w) => map[w] || w);
}

// Month names in Bengali
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Helper to format date into Bengali string e.g. "০৭ জুলাই"
export function formatBengaliDateShort(d: Date): string {
  const day = d.getDate();
  const month = BENGALI_MONTHS[d.getMonth()];
  return `${toBengaliNumeral(day)} ${month}`;
}

// Helper to generate realistic 30-day baseline data
export function generate30DayTrendData(): DayTrendRecord[] {
  const records: DayTrendRecord[] = [];
  const today = new Date();

  // Pattern multipliers to create a realistic workweek cycle (higher on Sun-Thu, lower on Fri-Sat)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dayOfWeek = d.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri/Sat in Bangladesh
    const multiplier = isWeekend ? 0.35 : 1.15 + (i % 5) * 0.1;

    // Base counts with pseudo-random variance based on day index
    const citizenship = Math.max(1, Math.round((4 + (i * 3) % 5) * multiplier));
    const tradeLicense = Math.max(1, Math.round((2 + (i * 2) % 4) * multiplier));
    const warish = Math.max(1, Math.round((3 + (i * 4) % 5) * multiplier));
    const character = Math.max(0, Math.round((2 + i % 3) * multiplier));
    const financial = Math.max(0, Math.round((1 + (i * 2) % 3) * multiplier));
    const others = Math.max(0, Math.round((1 + i % 2) * multiplier));

    const total = citizenship + tradeLicense + warish + character + financial + others;

    records.push({
      date: formatBengaliDateShort(d),
      rawDate: d.toISOString().split('T')[0],
      citizenship,
      tradeLicense,
      warish,
      character,
      financial,
      others,
      total
    });
  }

  return records;
}

// Category Color Definitions for Recharts
export const CATEGORY_COLORS: Record<string, { main: string; light: string; border: string }> = {
  citizenship: { main: '#059669', light: '#d1fae5', border: '#10b981' }, // Emerald
  tradeLicense: { main: '#d97706', light: '#fef3c7', border: '#f59e0b' }, // Amber
  warish: { main: '#0284c7', light: '#e0f2fe', border: '#38bdf8' },       // Sky Blue
  character: { main: '#7c3aed', light: '#f3e8ff', border: '#a855f7' },    // Purple
  financial: { main: '#4f46e5', light: '#e0e7ff', border: '#6366f1' },    // Indigo
  others: { main: '#e11d48', light: '#ffe4e6', border: '#f43f5e' }        // Rose
};
