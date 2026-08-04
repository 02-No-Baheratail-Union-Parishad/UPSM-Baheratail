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
  serverTimestamp 
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
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UnionParishadConfig;
    }
    return null;
  } catch (error) {
    console.error('Error fetching config from Firebase:', error);
    return null;
  }
}
