import { CertificateRecord } from '../types';

export interface SheetsSyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowsSynced: number;
  message: string;
}

export const SHEETS_LOG_HEADERS = [
  'তারিখ',
  'স্মারক নম্বর',
  'সনদের শ্রেণি/ক্যাটাগরি',
  'সনদের ধরন',
  'আবেদনকারীর নাম',
  'পিতা / স্বামী',
  'মাতা',
  'গ্রাম',
  'ওয়ার্ড নং',
  'NID / জন্ম নিবন্ধন নং',
  'মোবাইল নম্বর',
  'ফি (টাকা)',
  'স্ট্যাটাস',
  'সিঙ্ক সময়'
];

/**
 * Format a CertificateRecord into a spreadsheet row array
 */
export function formatCertificateToSheetRow(log: CertificateRecord): string[] {
  const syncTime = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
  return [
    log.issueDate || '',
    log.memoNo || '',
    log.category || 'নাগরিকত্ব ও পরিচয়',
    log.typeLabel || '',
    log.citizen?.name || '',
    log.citizen?.father || log.citizen?.spouseName || '',
    log.citizen?.mother || '',
    log.citizen?.village || '',
    log.citizen?.wardNo ? `ওয়ার্ড ${log.citizen.wardNo}` : '',
    log.citizen?.nid || log.citizen?.birthNo || '',
    log.citizen?.mobile || '',
    (log as any).fee || log.feeAmount ? `${(log as any).fee || log.feeAmount} ৳` : '৫০ ৳',
    log.status === 'revoked' ? 'বাতিলকৃত' : log.status === 'pending_approval' ? 'অপেক্ষমান' : 'ইস্যুকৃত',
    syncTime
  ];
}

/**
 * Create a new Google Spreadsheet for Union Parishad Citizen Logs
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string = '০২নং বহেড়াতৈল ইউপি - নাগরিক আবেদন রেজিস্টার (২০২৬)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: 'Citizen_Logs',
            gridProperties: {
              frozenRowCount: 1,
              columnCount: 15
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Spreadsheet তৈরি করতে ব্যর্থ হয়েছে (${response.status})`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
}

/**
 * Sync / Write full array of citizen certificate logs into Google Spreadsheet
 */
export async function syncLogsToGoogleSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  logs: CertificateRecord[]
): Promise<SheetsSyncResult> {
  const range = 'Citizen_Logs!A1';
  const dataRows = logs.map(formatCertificateToSheetRow);
  const values = [SHEETS_LOG_HEADERS, ...dataRows];

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const response = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'Citizen_Logs!A1',
      majorDimension: 'ROWS',
      values
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Google Sheets সিঙ্ক ব্যর্থ হয়েছে (${response.status})`);
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    rowsSynced: logs.length,
    message: `সফলভাবে ${logs.length} টি নাগরিক আবেদন ও সনদপত্র রেকর্ড Google Sheet-এ সিঙ্ক করা হয়েছে!`
  };
}

/**
 * Append a single log entry to the Google Spreadsheet
 */
export async function appendLogToGoogleSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  log: CertificateRecord
): Promise<boolean> {
  const range = 'Citizen_Logs!A1';
  const row = formatCertificateToSheetRow(log);

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [row]
    })
  });

  return response.ok;
}
