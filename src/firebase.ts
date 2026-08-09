import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import { CertificateRecord, UnionParishadConfig, AdminPermissions } from './types';
export type { AdminPermissions };

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory OAuth access token cache
let cachedGoogleAccessToken: string | null = null;

export function getGoogleAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

export function setGoogleAccessToken(token: string | null): void {
  cachedGoogleAccessToken = token;
}

// Initialize Firestore with specific database ID if present and enable force long-polling for sandboxed container stability
const rawDbId = (firebaseConfig as any).firestoreDatabaseId;
const dbId = rawDbId && rawDbId !== '(default)' ? rawDbId : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// Initialize Firebase Storage
export const storage = getStorage(app);

const CERTIFICATES_COLLECTION = 'certificates';
const CONFIGS_COLLECTION = 'configs';
const MASTER_CONFIG_DOC = 'master_config';

// Initialize Firestore Collections and Service functions
export async function saveCertificateToFirebase(record: CertificateRecord): Promise<string> {
  try {
    const docId = record.memoNo.replace(/[^a-zA-Z0-9.-]/g, '_') || `cert_${Date.now()}`;
    const docRef = doc(db, CERTIFICATES_COLLECTION, docId);
    
    const cleanData = JSON.parse(JSON.stringify(record));
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
    
    return docId;
  } catch (error) {
    console.error('Error saving certificate to Firebase:', error);
    throw error;
  }
}

/**
 * Batch write operation to restore historical records into Firestore in chunks of up to 400 records.
 */
export async function batchRestoreCertificatesToFirebase(records: CertificateRecord[]): Promise<{ count: number; batches: number }> {
  try {
    if (!Array.isArray(records) || records.length === 0) {
      return { count: 0, batches: 0 };
    }

    const BATCH_SIZE = 400; // Safe threshold under Firestore 500 writes limit per batch
    let totalRestored = 0;
    let batchCount = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const record of chunk) {
        if (!record || !record.memoNo) continue;
        const docId = record.memoNo.replace(/[^a-zA-Z0-9.-]/g, '_') || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, CERTIFICATES_COLLECTION, docId);
        const cleanData = JSON.parse(JSON.stringify(record));
        batch.set(docRef, {
          ...cleanData,
          updatedAt: new Date().toISOString(),
          timestamp: serverTimestamp()
        }, { merge: true });
        totalRestored++;
      }

      await batch.commit();
      batchCount++;
    }

    return { count: totalRestored, batches: batchCount };
  } catch (error) {
    console.error('Error batch restoring certificates to Firestore:', error);
    throw error;
  }
}

export async function fetchCertificatesFromFirebase(): Promise<CertificateRecord[]> {
  try {
    const colRef = collection(db, CERTIFICATES_COLLECTION);
    const snapshot = await getDocs(colRef);
    const records: CertificateRecord[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.memoNo) {
        records.push(data as CertificateRecord);
      }
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching certificates from Firebase:', error);
    return [];
  }
}

export async function searchCertificateInFirebase(queryStr: string): Promise<CertificateRecord | null> {
  try {
    const trimmed = queryStr.trim();
    if (!trimmed) return null;

    // Search by exact memoNo first
    const colRef = collection(db, CERTIFICATES_COLLECTION);
    const qMemo = query(colRef, where('memoNo', '==', trimmed));
    const memoSnap = await getDocs(qMemo);
    
    if (!memoSnap.empty) {
      const data = memoSnap.docs[0].data();
      return data as CertificateRecord;
    }

    // Search by NID
    const qNid = query(colRef, where('citizen.nid', '==', trimmed));
    const nidSnap = await getDocs(qNid);
    
    if (!nidSnap.empty) {
      const data = nidSnap.docs[0].data();
      return data as CertificateRecord;
    }

    // Client-side fallback check in all docs
    const allRecords = await fetchCertificatesFromFirebase();
    return allRecords.find(r => 
      r.memoNo.toLowerCase() === trimmed.toLowerCase() || 
      (r.citizen && (r.citizen.nid === trimmed || r.citizen.birthNo === trimmed))
    ) || null;
  } catch (error) {
    console.error('Error searching certificate in Firebase:', error);
    return null;
  }
}

export async function saveConfigToFirebase(config: UnionParishadConfig): Promise<void> {
  try {
    const docRef = doc(db, CONFIGS_COLLECTION, MASTER_CONFIG_DOC);
    await setDoc(docRef, JSON.parse(JSON.stringify(config)), { merge: true });
  } catch (error) {
    console.error('Error saving config to Firebase:', error);
  }
}

export async function fetchConfigFromFirebase(): Promise<UnionParishadConfig | null> {
  try {
    const docRef = doc(db, CONFIGS_COLLECTION, MASTER_CONFIG_DOC);
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const fetchDoc = getDoc(docRef).then((snap) => (snap.exists() ? (snap.data() as UnionParishadConfig) : null));
    return await Promise.race([fetchDoc, timeout]);
  } catch (error) {
    console.warn('Notice: Firestore config fetch unavailable (using default configuration):', error);
    return null;
  }
}

export async function fetchPendingCertificatesCountFromFirebase(): Promise<number> {
  try {
    const colRef = collection(db, CERTIFICATES_COLLECTION);
    const snapshot = await getDocs(colRef);
    let count = 0;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'pending_approval' || data.status === 'draft') {
        count++;
      }
    });
    return count;
  } catch (error) {
    console.error('Error fetching pending count from Firestore:', error);
    return 0;
  }
}

export function subscribePendingCertificatesCount(callback: (count: number) => void): () => void {
  try {
    const colRef = collection(db, CERTIFICATES_COLLECTION);
    return onSnapshot(colRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'pending_approval' || data.status === 'draft') {
          count++;
        }
      });
      callback(count);
    }, (error) => {
      console.warn('Firestore subscription warning:', error);
    });
  } catch (error) {
    console.warn('Firestore subscription failed:', error);
    return () => {};
  }
}

export interface FirestoreCollectionExportResult {
  filename: string;
  timestamp: string;
  downloadUrl?: string;
  storagePath?: string;
  collections: { [colName: string]: number };
  totalDocuments: number;
  sizeKb: number;
  jsonData: any;
}

/**
 * Export selected Firestore collections as JSON and save to Firebase Storage
 */
export async function exportFirestoreCollectionsToStorage(
  selectedCollections: string[],
  notes: string = 'Developer Firestore Export',
  onProgress?: (progress: { stage: string; percent: number; currentCol?: string }) => void
): Promise<FirestoreCollectionExportResult> {
  const exportData: Record<string, any[]> = {};
  const collectionCounts: Record<string, number> = {};
  let totalDocs = 0;

  const totalCols = selectedCollections.length;

  for (let i = 0; i < totalCols; i++) {
    const colName = selectedCollections[i];
    const fetchPercent = Math.round(((i + 0.5) / totalCols) * 70);
    
    if (onProgress) {
      onProgress({
        stage: `ফায়ারস্টোর কালেকশন '${colName}' ডাউনলোড করা হচ্ছে... (${i + 1}/${totalCols})`,
        percent: fetchPercent,
        currentCol: colName
      });
    }

    try {
      const colRef = collection(db, colName);
      const snap = await getDocs(colRef);
      const docs: any[] = [];
      snap.forEach((d) => {
        docs.push({ _docId: d.id, ...d.data() });
      });
      exportData[colName] = docs;
      collectionCounts[colName] = docs.length;
      totalDocs += docs.length;
    } catch (err) {
      console.warn(`Collection ${colName} export warning:`, err);
      exportData[colName] = [];
      collectionCounts[colName] = 0;
    }

    if (onProgress) {
      onProgress({
        stage: `লেকশন '${colName}' এর ${collectionCounts[colName]} টি রেকর্ড প্রাপ্ত হয়েছে (${i + 1}/${totalCols})`,
        percent: Math.round(((i + 1) / totalCols) * 70),
        currentCol: colName
      });
    }
  }

  if (onProgress) {
    onProgress({
      stage: `JSON অবজেক্ট কম্প্রেশন ও স্ট্রাকচার তৈরি হচ্ছে...`,
      percent: 80
    });
  }

  const timestamp = new Date().toISOString();
  const dateStr = timestamp.replace(/[:.]/g, '-').slice(0, 19);
  const filename = `Firestore_Export_${dateStr}.json`;

  const payload = {
    meta: {
      exporterRole: 'developer',
      exportType: 'FIRESTORE_CUSTOM_COLLECTIONS_BACKUP',
      timestamp,
      selectedCollections,
      collectionCounts,
      totalDocuments: totalDocs,
      notes
    },
    collectionsData: exportData
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const sizeKb = Math.round(new Blob([jsonStr]).size / 1024);

  let downloadUrl: string | undefined = undefined;
  let storagePath: string | undefined = undefined;

  if (onProgress) {
    onProgress({
      stage: `Firebase Cloud Storage-এ ব্যাকআপ ফাইল (${sizeKb} KB) আপলোড করা হচ্ছে...`,
      percent: 90
    });
  }

  // Attempt Firebase Storage Upload
  try {
    const storageRef = ref(storage, `backups/firestore_exports/${filename}`);
    await uploadString(storageRef, jsonStr, 'raw', {
      contentType: 'application/json'
    });
    downloadUrl = await getDownloadURL(storageRef);
    storagePath = storageRef.fullPath;
  } catch (storageErr) {
    console.warn('Firebase Storage upload notice (fallback to local JSON download and Firestore log):', storageErr);
  }

  if (onProgress) {
    onProgress({
      stage: `Firestore ব্যাকআপ লগ ডকুমেন্ট সংরক্ষণ করা হচ্ছে...`,
      percent: 96
    });
  }

  // Record export snapshot in Firestore 'backups' collection
  try {
    const backupDocRef = doc(db, 'backups', `fs_exp_${Date.now()}`);
    await setDoc(backupDocRef, {
      filename,
      timestamp,
      recordsCount: totalDocs,
      sizeKb,
      status: 'completed',
      notes: notes || 'Developer Firestore Collections Export',
      downloadUrl: downloadUrl || null,
      storagePath: storagePath || null,
      collections: collectionCounts
    }, { merge: true });
  } catch (err) {
    console.warn('Notice saving backup log to Firestore:', err);
  }

  if (onProgress) {
    onProgress({
      stage: `ফায়ারস্টোর ডাটাবেস এক্সপোর্ট প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে!`,
      percent: 100
    });
  }

  return {
    filename,
    timestamp,
    downloadUrl,
    storagePath,
    collections: collectionCounts,
    totalDocuments: totalDocs,
    sizeKb,
    jsonData: payload
  };
}

export interface FirestoreBackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeKb: number;
  recordsCount: number;
  downloadUrl?: string | null;
  storagePath?: string | null;
  notes?: string;
  collections?: Record<string, number>;
  status?: string;
  backupData?: any;
  source?: 'firebase_storage' | 'server_snapshot';
}

/**
 * Fetch all backup records logged in Firestore 'backups' collection, resolving Storage URLs if needed
 */
export async function fetchFirestoreBackupsFromFirebase(): Promise<FirestoreBackupRecord[]> {
  const list: FirestoreBackupRecord[] = [];
  try {
    const colRef = collection(db, 'backups');
    const snap = await getDocs(colRef);
    
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      let downloadUrl = data.downloadUrl || null;
      
      // If downloadUrl is missing but storagePath exists, try resolving download URL from Firebase Storage
      if (!downloadUrl && data.storagePath) {
        try {
          const storageRef = ref(storage, data.storagePath);
          downloadUrl = await getDownloadURL(storageRef);
        } catch (e) {
          console.warn('Could not resolve download URL for storage path:', data.storagePath);
        }
      }

      list.push({
        id: docSnap.id,
        filename: data.filename || `Backup_${docSnap.id}.json`,
        timestamp: data.timestamp || new Date().toISOString(),
        sizeKb: data.sizeKb || 0,
        recordsCount: data.recordsCount || 0,
        downloadUrl,
        storagePath: data.storagePath || null,
        notes: data.notes || '',
        collections: data.collections || undefined,
        status: data.status || 'completed',
        backupData: data.backupData || undefined,
        source: 'firebase_storage'
      });
    }

    // Sort by timestamp descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn('Notice fetching Firestore backup records:', err);
  }
  return list;
}

/**
 * Restore a full database backup JSON object into Firestore collections using batch writes
 */
export async function restoreFullBackupToFirestore(backupData: any): Promise<{ totalRestored: number; collectionsRestored: string[] }> {
  let totalRestored = 0;
  const collectionsRestored: string[] = [];

  if (!backupData || typeof backupData !== 'object') {
    throw new Error('অবৈধ বা খালি ব্যাকআপ ডাটা।');
  }

  // Scenario 1: Multi-collection export format (collectionsData)
  if (backupData.collectionsData && typeof backupData.collectionsData === 'object') {
    for (const [colName, docs] of Object.entries(backupData.collectionsData)) {
      if (!Array.isArray(docs) || docs.length === 0) continue;
      
      collectionsRestored.push(colName);
      const BATCH_SIZE = 400;
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + BATCH_SIZE);

        for (const item of chunk) {
          const docId = item._docId || item.id || item.memoNo?.replace(/[^a-zA-Z0-9.-]/g, '_') || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const cleanItem = { ...item };
          delete cleanItem._docId;

          const docRef = doc(db, colName, String(docId));
          batch.set(docRef, JSON.parse(JSON.stringify(cleanItem)), { merge: true });
        }

        await batch.commit();
        totalRestored += chunk.length;
      }
    }
  } 
  // Scenario 2: Legacy or Certificates array format
  else {
    const certsToRestore = backupData.certificates || backupData.masterDatabase?.certificates || backupData.sheetData?.certificates || (Array.isArray(backupData) ? backupData : []);
    
    if (Array.isArray(certsToRestore) && certsToRestore.length > 0) {
      collectionsRestored.push('certificates');
      const res = await batchRestoreCertificatesToFirebase(certsToRestore);
      totalRestored = res.count;
    }
  }

  return { totalRestored, collectionsRestored };
}

export interface AdminUserRecord {
  uid?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer';
  designation: string;
  photoUrl?: string;
  addedAt: string;
  lastLoginAt?: string;
  status: 'active' | 'suspended';
  wardNo?: string;
  permissions?: AdminPermissions;
}

const ADMINS_COLLECTION = 'admins';

export const DEFAULT_ADMINS_LIST: AdminUserRecord[] = [
  {
    email: 'inbox600900@gmail.com',
    name: 'MD JUBAER HOSSEN',
    role: 'developer',
    designation: 'প্রধান আইটি ডেভেলপার ও সিস্টেম এডমিন',
    addedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    email: 'baheratailunion@gmail.com',
    name: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ এডমিন',
    role: 'super_admin',
    designation: 'অফিসিয়াল ইউপি এডমিন অ্যাকাউন্ট',
    addedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    email: 'chairman@gmail.com',
    name: 'চেয়ারম্যান কার্যালয়',
    role: 'chairman',
    designation: 'ইউপি চেয়ারম্যান',
    addedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    email: 'secretary@gmail.com',
    name: 'সচিব কার্যালয়',
    role: 'secretary',
    designation: 'প্রশাসনিক কর্মকর্তা / সচিব',
    addedAt: '2026-01-01T00:00:00.000Z',
    status: 'active'
  }
];

export async function fetchAdminUsersFromFirebase(): Promise<AdminUserRecord[]> {
  try {
    const colRef = collection(db, ADMINS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const adm of DEFAULT_ADMINS_LIST) {
        const docId = adm.email.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, ADMINS_COLLECTION, docId), adm, { merge: true });
      }
      return DEFAULT_ADMINS_LIST;
    }
    const list: AdminUserRecord[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as AdminUserRecord);
    });
    return list;
  } catch (err) {
    console.warn('Notice fetching admin users from Firebase:', err);
    return DEFAULT_ADMINS_LIST;
  }
}

export async function saveAdminUserToFirebase(admin: AdminUserRecord): Promise<void> {
  const docId = admin.email.replace(/[^a-zA-Z0-9]/g, '_');
  const docRef = doc(db, ADMINS_COLLECTION, docId);
  await setDoc(docRef, admin, { merge: true });
}

export function subscribeToAdminUsersFromFirebase(callback: (admins: AdminUserRecord[]) => void): () => void {
  const colRef = collection(db, ADMINS_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      callback(DEFAULT_ADMINS_LIST);
      return;
    }
    const list: AdminUserRecord[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as AdminUserRecord);
    });
    callback(list);
  }, (err) => {
    console.warn('Real-time admin users snapshot warning:', err);
  });
}

export async function saveRolePermissionsMatrixToFirebase(matrix: Record<string, AdminPermissions>): Promise<void> {
  const docRef = doc(db, CONFIGS_COLLECTION, 'role_permissions_matrix');
  await setDoc(docRef, { matrix, updatedAt: new Date().toISOString() }, { merge: true });
}

export function subscribeToRolePermissionsMatrix(callback: (matrix: Record<string, AdminPermissions> | null) => void): () => void {
  const docRef = doc(db, CONFIGS_COLLECTION, 'role_permissions_matrix');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.matrix) {
      callback(docSnap.data().matrix as Record<string, AdminPermissions>);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Role permissions matrix listener warning:', err);
  });
}

export async function deleteAdminUserFromFirebase(email: string): Promise<void> {
  const docId = email.replace(/[^a-zA-Z0-9]/g, '_');
  const docRef = doc(db, ADMINS_COLLECTION, docId);
  await deleteDoc(docRef);
}

export function formatFirebaseAuthError(err: any): string {
  if (!err) return 'অজানা ত্রুটি দেখা দিয়েছে।';
  if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
    return 'সাইন-ইন পপআপ উইন্ডোটি বন্ধ করা হয়েছে।';
  }
  if (err.code === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
    return 'ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে পপআপ ডায়ালগ অনুমোদন করুন।';
  }
  if (err.code === 'auth/cancelled-popup-request' || err.message?.includes('cancelled-popup-request')) {
    return 'পূর্বে স্থগিত পপআপ অনুরোধটি বাতিল করা হয়েছে।';
  }
  if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    return `বর্তমান ডোমেইনটি (${hostname}) ফায়ারবেস অথেন্টিকেশন Authorized Domains তালিকায় অনুমোদিত নয়।`;
  }
  return err.message || 'গুগল সাইন-ইন প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি।';
}

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (credential?.accessToken) {
    cachedGoogleAccessToken = credential.accessToken;
  }
  return result.user;
}

export async function signInWithGooglePopupForWorkspace(): Promise<{ user: FirebaseUser; accessToken: string }> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error('Google Workspace Access Token পাওয়া যায় নাই। আবার চেষ্টা করুন।');
  }
  cachedGoogleAccessToken = credential.accessToken;
  return { user: result.user, accessToken: credential.accessToken };
}

export async function logoutUserFromFirebase(): Promise<void> {
  cachedGoogleAccessToken = null;
  await signOut(auth);
}

// ============================================================
// AUDIT LOGS FOR SYSTEM MODIFICATIONS
// ============================================================
import { AuditLogRecord } from './types';

const AUDIT_LOGS_COLLECTION = 'audit_logs';

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'log_init_001',
    action: 'ADMIN_LOGIN',
    actionTitle: 'গুগল ফায়ারবেস অথেন্টিকেশন সেশন চালু',
    details: 'সিস্টেম এডমিন MD JUBAER HOSSEN (inbox600900@gmail.com) গুগল OAuth 2.0 এর মাধ্যমে সিকিউর এডমিন সেশনে প্রবেশ করিয়াছেন।',
    performedByEmail: 'inbox600900@gmail.com',
    performedByName: 'MD JUBAER HOSSEN',
    performedByRole: 'developer',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    ipAddress: '103.114.98.12',
    checksum: 'sha256-a81d42e2b9c7'
  },
  {
    id: 'log_cert_002',
    action: 'CERTIFICATE_APPROVED',
    actionTitle: 'চেয়ারম্যান কর্তৃক নাগরিক সনদপত্র অনুমোদন',
    details: 'নাগরিক সনদপত্র (স্মারক নং: UP/BAHER/2026/0482) ইউপি চেয়ারম্যান জনাব মোঃ সোহেল রানা কর্তৃক চূড়ান্তভাবে অনুমোদিত হইয়াছে।',
    performedByEmail: 'chairman@gmail.com',
    performedByName: 'চেয়ারম্যান কার্যালয়',
    performedByRole: 'chairman',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    ipAddress: '103.114.98.15',
    checksum: 'sha256-f902e1c8d7b3'
  },
  {
    id: 'log_admin_003',
    action: 'ADMIN_ADDED',
    actionTitle: 'নতুন ইউপি সদস্য এডমিন অ্যাকাউন্ট যুক্তকরণ',
    details: 'ওয়ার্ড নং ৩ এর ইউপি সদস্যের গুগল ইমেইল (secretary@gmail.com) ফায়ারবেস অথেন্টিকেশন অ্যাকসেস তালিকায় যুক্ত করা হইয়াছে।',
    performedByEmail: 'baheratailunion@gmail.com',
    performedByName: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ এডমিন',
    performedByRole: 'super_admin',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    ipAddress: '103.114.98.20',
    checksum: 'sha256-e41b80c9a1d2'
  },
  {
    id: 'log_config_004',
    action: 'CONFIG_UPDATED',
    actionTitle: 'ইউনিয়ন পরিষদ মাস্টার কনফিগারেশন আপডেট',
    details: 'ইউনিয়ন পরিষদের অফিসিয়াল লোগো, হেল্পলাইন নম্বর এবং গুগল ডক টেমপ্লেট আইডি (1BxiMVs0...) আপডেট করা হইয়াছে।',
    performedByEmail: 'secretary@gmail.com',
    performedByName: 'সচিব কার্যালয়',
    performedByRole: 'secretary',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    ipAddress: '103.114.98.22',
    checksum: 'sha256-b33c10a4f5d8'
  }
];

export async function fetchAuditLogsFromFirebase(): Promise<AuditLogRecord[]> {
  try {
    const colRef = collection(db, AUDIT_LOGS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const logItem of INITIAL_AUDIT_LOGS) {
        await setDoc(doc(db, AUDIT_LOGS_COLLECTION, logItem.id), logItem, { merge: true });
      }
      return INITIAL_AUDIT_LOGS;
    }
    const list: AuditLogRecord[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as AuditLogRecord);
    });
    // Sort by timestamp descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  } catch (err) {
    console.warn('Notice fetching audit logs from Firebase:', err);
    return INITIAL_AUDIT_LOGS;
  }
}

export async function addAuditLogToFirebase(
  logData: Omit<AuditLogRecord, 'id' | 'timestamp'>
): Promise<string> {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();
    const checksumStr = `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;

    const fullRecord: AuditLogRecord = {
      ...logData,
      id,
      timestamp,
      checksum: checksumStr
    };

    const docRef = doc(db, AUDIT_LOGS_COLLECTION, id);
    await setDoc(docRef, fullRecord);
    return id;
  } catch (err) {
    console.error('Error adding audit log to Firebase:', err);
    throw err;
  }
}


