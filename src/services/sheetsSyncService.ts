import { CertificateRecord, CitizenAccountRecord, UnionParishadConfig } from '../types';
import { getGoogleAccessToken } from '../firebase';
import { formatCertificateToSheetRow } from '../lib/googleSheets';

export interface SyncQueueItem {
  id: string;
  type: 'certificate' | 'citizen';
  action: 'append' | 'update';
  payload: CertificateRecord | CitizenAccountRecord;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export interface SyncServiceStatus {
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: string;
  lastError?: string;
}

const STORAGE_KEY_QUEUE = 'bup_sheets_sync_queue';
const STORAGE_KEY_CONFIG = 'bup_sheets_sync_config';
const STORAGE_KEY_LAST_SYNC = 'bup_sheets_last_sync_time';

export const CITIZEN_SHEET_HEADERS = [
  'রেজিস্ট্রেশন তারিখ',
  'সিটিজেন আইডি',
  'NID / জন্ম নিবন্ধন নং',
  'হোল্ডিং নম্বর',
  'আবেদনকারীর নাম',
  'পিতা',
  'মাতা',
  'স্বামী',
  'লিঙ্গ',
  'গ্রাম',
  'ওয়ার্ড নং',
  'ডাকঘর',
  'পোস্ট কোড',
  'মোবাইল নম্বর',
  'মোট সনদ সংখ্যা',
  'সর্বশেষ সনদ ধরন',
  'সর্বশেষ সনদ তারিখ',
  'সিঙ্ক সময়'
];

export function formatCitizenToSheetRow(citizen: CitizenAccountRecord): string[] {
  const syncTime = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
  return [
    citizen.registeredAt || '',
    citizen.id || '',
    citizen.nid || citizen.birthNo || '',
    citizen.holdingNo || '',
    citizen.name || '',
    citizen.father || '',
    citizen.mother || '',
    citizen.spouseName || '',
    citizen.gender || '',
    citizen.village || '',
    citizen.wardNo ? `ওয়ার্ড ${citizen.wardNo}` : '',
    citizen.postOffice || '',
    citizen.postCode || '',
    citizen.mobile || '',
    String(citizen.totalCertificates || 0),
    citizen.lastCertificateType || '',
    citizen.lastCertificateDate || '',
    syncTime
  ];
}

class GoogleSheetsSyncService {
  private queue: SyncQueueItem[] = [];
  private isSyncing: boolean = false;
  private listeners: Array<(status: SyncServiceStatus) => void> = [];
  private lastSyncTime: string | undefined = localStorage.getItem(STORAGE_KEY_LAST_SYNC) || undefined;
  private lastError: string | undefined = undefined;
  private syncIntervalTimer: any = null;

  constructor() {
    this.loadQueueFromStorage();
    this.initNetworkListeners();
    this.startBackgroundSyncTimer();
  }

  /**
   * Save queue to localStorage for offline persistence
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[SheetsSyncService] localStorage write error:', e);
    }
    this.notifyListeners();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[SheetsSyncService] localStorage read error:', e);
      this.queue = [];
    }
  }

  /**
   * Initialize online / offline network status listeners
   */
  private initNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SheetsSyncService] Network connection restored. Processing offline queue...');
        this.notifyListeners();
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        console.warn('[SheetsSyncService] Network is offline. Operations will be queued.');
        this.notifyListeners();
      });
    }
  }

  /**
   * Periodic background sync runner (e.g. every 30 seconds if queue is non-empty)
   */
  private startBackgroundSyncTimer(): void {
    if (this.syncIntervalTimer) clearInterval(this.syncIntervalTimer);
    this.syncIntervalTimer = setInterval(() => {
      if (this.queue.length > 0 && navigator.onLine && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  /**
   * Save standard active configuration for background sync calls
   */
  public saveActiveConfig(config: Partial<UnionParishadConfig>): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('[SheetsSyncService] Config save error:', e);
    }
  }

  /**
   * Get cached configuration
   */
  public getActiveConfig(): Partial<UnionParishadConfig> | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Enqueue Certificate Log for real-time synchronization
   */
  public enqueueCertificateSync(log: CertificateRecord, config?: Partial<UnionParishadConfig>): void {
    if (config) this.saveActiveConfig(config);

    const newItem: SyncQueueItem = {
      id: `cert_${log.id}_${Date.now()}`,
      type: 'certificate',
      action: 'append',
      payload: log,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    // Prevent exact duplicates in queue
    const existingIndex = this.queue.findIndex(
      item => item.type === 'certificate' && (item.payload as CertificateRecord).id === log.id
    );

    if (existingIndex >= 0) {
      this.queue[existingIndex] = newItem;
    } else {
      this.queue.push(newItem);
    }

    this.saveQueueToStorage();

    // If online, trigger real-time sync immediately
    if (navigator.onLine && !this.isSyncing) {
      this.processSyncQueue(config);
    }
  }

  /**
   * Enqueue Citizen Record for real-time synchronization
   */
  public enqueueCitizenSync(citizen: CitizenAccountRecord, config?: Partial<UnionParishadConfig>): void {
    if (config) this.saveActiveConfig(config);

    const newItem: SyncQueueItem = {
      id: `citizen_${citizen.id}_${Date.now()}`,
      type: 'citizen',
      action: 'append',
      payload: citizen,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    const existingIndex = this.queue.findIndex(
      item => item.type === 'citizen' && (item.payload as CitizenAccountRecord).id === citizen.id
    );

    if (existingIndex >= 0) {
      this.queue[existingIndex] = newItem;
    } else {
      this.queue.push(newItem);
    }

    this.saveQueueToStorage();

    if (navigator.onLine && !this.isSyncing) {
      this.processSyncQueue(config);
    }
  }

  /**
   * Process the queued synchronization items
   */
  public async processSyncQueue(overrideConfig?: Partial<UnionParishadConfig>): Promise<void> {
    if (this.queue.length === 0) return;
    if (!navigator.onLine) {
      console.log('[SheetsSyncService] Offline: Skipping queue processing');
      return;
    }
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.lastError = undefined;
    this.notifyListeners();

    const config = overrideConfig || this.getActiveConfig() || {};
    const webAppUrl = config.appsScriptUrl;
    const sheetId = config.sheetId;
    const accessToken = getGoogleAccessToken();

    const remainingQueue: SyncQueueItem[] = [];

    for (const item of [...this.queue]) {
      try {
        let success = false;

        // Strategy 1: Try Google Apps Script WebApp proxy if configured
        if (webAppUrl && webAppUrl.startsWith('http')) {
          success = await this.syncViaAppsScript(webAppUrl, sheetId, item);
        }

        // Strategy 2: If Apps Script skipped or failed, try Direct Google Sheets API if accessToken exists
        if (!success && accessToken && sheetId) {
          success = await this.syncViaGoogleSheetsApi(accessToken, sheetId, item);
        }

        // Strategy 3: Try backend endpoint proxy /api/admin/apps-script-sync
        if (!success) {
          success = await this.syncViaBackendProxy(webAppUrl, sheetId, item);
        }

        if (success) {
          console.log(`[SheetsSyncService] Successfully synced ${item.id} to Google Sheets`);
          this.lastSyncTime = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
          localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSyncTime);
        } else {
          item.retryCount += 1;
          item.lastError = 'গুগল শিট বা অ্যাপস স্ক্রিপ্ট এনভায়রনমেন্ট সংযোগ সিঙ্ক করতে পারেনি';
          if (item.retryCount < 5) {
            remainingQueue.push(item);
          } else {
            console.warn(`[SheetsSyncService] Max retries reached for item ${item.id}. Dropping or keeping in queue.`);
            remainingQueue.push(item);
          }
        }
      } catch (err: any) {
        console.error(`[SheetsSyncService] Sync failed for ${item.id}:`, err);
        item.retryCount += 1;
        item.lastError = err.message || 'নেটওয়ার্ক বা API ত্রুটি';
        remainingQueue.push(item);
        this.lastError = err.message;
      }
    }

    this.queue = remainingQueue;
    this.isSyncing = false;
    this.saveQueueToStorage();
  }

  /**
   * Sync item via Apps Script WebApp
   */
  private async syncViaAppsScript(webAppUrl: string, sheetId?: string, item?: SyncQueueItem): Promise<boolean> {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Cors friendly
        body: JSON.stringify({
          action: 'appendRecord',
          sheetId,
          recordType: item?.type,
          record: item?.payload
        })
      });

      if (!response.ok) return false;
      const resData = await response.json().catch(() => ({}));
      return resData.status === 'success' || resData.success === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Sync item via Direct Google Sheets API
   */
  private async syncViaGoogleSheetsApi(accessToken: string, spreadsheetId: string, item: SyncQueueItem): Promise<boolean> {
    try {
      const sheetName = item.type === 'citizen' ? 'Citizen_Master' : 'Citizen_Logs';
      const row = item.type === 'citizen'
        ? formatCitizenToSheetRow(item.payload as CitizenAccountRecord)
        : formatCertificateToSheetRow(item.payload as CertificateRecord);

      const range = `${sheetName}!A1`;
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
    } catch (e) {
      return false;
    }
  }

  /**
   * Sync item via Backend Express Server proxy `/api/admin/apps-script-sync`
   */
  private async syncViaBackendProxy(webAppUrl?: string, sheetId?: string, item?: SyncQueueItem): Promise<boolean> {
    if (!webAppUrl) return false;
    try {
      const res = await fetch('/api/admin/apps-script-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl,
          sheetId,
          logs: item?.type === 'certificate' ? [item.payload] : [],
          citizens: item?.type === 'citizen' ? [item.payload] : []
        })
      });
      const data = await res.json().catch(() => ({}));
      return res.ok && data.success === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get count of pending queued items
   */
  public getPendingQueueCount(): number {
    return this.queue.length;
  }

  /**
   * Get exact queue items
   */
  public getPendingQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  /**
   * Clear sync queue
   */
  public clearSyncQueue(): void {
    this.queue = [];
    this.saveQueueToStorage();
  }

  /**
   * Get current sync service status
   */
  public getStatus(): SyncServiceStatus {
    return {
      pendingCount: this.queue.length,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError
    };
  }

  /**
   * Subscribe to status changes
   */
  public subscribeToSyncStatus(callback: (status: SyncServiceStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.getStatus());

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(cb => {
      try {
        cb(status);
      } catch (e) {
        console.error('[SheetsSyncService] Listener callback error:', e);
      }
    });
  }
}

export const sheetsSyncService = new GoogleSheetsSyncService();
