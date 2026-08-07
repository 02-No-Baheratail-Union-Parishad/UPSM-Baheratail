import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
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
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CertificateRecord, UnionParishadConfig } from './types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if present
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

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
