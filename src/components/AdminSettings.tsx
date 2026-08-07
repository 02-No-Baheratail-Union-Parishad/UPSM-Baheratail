import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  User, 
  Users,
  Code, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Sliders, 
  Cloud, 
  Key, 
  Database, 
  Award, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  Edit3,
  HardDrive,
  RefreshCw,
  Download,
  RotateCcw,
  FileJson,
  Upload,
  AlertTriangle,
  FolderArchive,
  Wrench,
  Activity,
  Zap,
  Server,
  X,
  Radio,
  Trash2,
  Copy,
  ExternalLink,
  Send,
  Terminal
} from 'lucide-react';
import { 
  saveConfigToFirebase, 
  batchRestoreCertificatesToFirebase, 
  exportFirestoreCollectionsToStorage, 
  FirestoreCollectionExportResult 
} from '../firebase';
import { UnionParishadConfig, BackupSnapshot, ApiKeyRecord, WebhookConfig, WebhookLogRecord, CouncilMember } from '../types';
import { CERTIFICATE_TYPES } from '../data/certificateTypes';
import { DEFAULT_COUNCIL_MEMBERS, getSyncedCouncilMembers } from '../data/councilMembers';
import { AppsScriptModal } from './AppsScriptModal';
import { PendingApprovals } from './PendingApprovals';

interface AdminSettingsProps {
  config: UnionParishadConfig;
  onUpdateConfig: (newConfig: UnionParishadConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ config, onUpdateConfig }) => {
  const [formData, setFormData] = useState<UnionParishadConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAppsScriptOpen, setIsAppsScriptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'general' | 'print' | 'workspace' | 'r2' | 'ai' | 'types' | 'backup' | 'maintenance' | 'api_webhook'>('pending');
  
  // API Key & Webhook Integration State
  const [apiKeysList, setApiKeysList] = useState<ApiKeyRecord[]>([]);
  const [webhooksList, setWebhooksList] = useState<WebhookConfig[]>([]);
  const [webhookLogsList, setWebhookLogsList] = useState<WebhookLogRecord[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerm, setNewKeyPerm] = useState<'read' | 'write' | 'admin'>('read');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<('certificate.created' | 'certificate.approved' | 'certificate.cancelled' | 'citizen.registered')[]>([
    'certificate.created',
    'certificate.approved',
    'certificate.cancelled'
  ]);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<string | null>(null);
  const [selectedCodeTab, setSelectedCodeTab] = useState<'curl' | 'fetch' | 'gas' | 'python'>('curl');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Backup & Restore Utility State
  const [backupsList, setBackupsList] = useState<BackupSnapshot[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupNotes, setBackupNotes] = useState('');
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [archiveFolderInput, setArchiveFolderInput] = useState(formData.archiveFolderId || formData.targetFolderId || '');

  // Project Clone & Deployment Wizard State
  const [isExportingClone, setIsExportingClone] = useState(false);
  const [showCloneWizard, setShowCloneWizard] = useState(false);
  const [clonePackageData, setClonePackageData] = useState<any>(null);
  const [cloneMode, setCloneMode] = useState<'NEW_UNION_CLONE' | 'EXACT_RESTORE'>('NEW_UNION_CLONE');
  const [cloneUnionName, setCloneUnionName] = useState('');
  const [cloneUpazila, setCloneUpazila] = useState('');
  const [cloneDistrict, setCloneDistrict] = useState('');
  const [cloneChairman, setCloneChairman] = useState('');
  const [cloneSheetId, setCloneSheetId] = useState('');
  const [cloneFolderId, setCloneFolderId] = useState('');
  const [isImportingClone, setIsImportingClone] = useState(false);

  // Firestore Batch Write Import & Restore State
  const [firestoreImportFile, setFirestoreImportFile] = useState<File | null>(null);
  const [firestoreImportCerts, setFirestoreImportCerts] = useState<any[]>([]);
  const [isBatchRestoringFirestore, setIsBatchRestoringFirestore] = useState(false);
  const [firestoreBatchResult, setFirestoreBatchResult] = useState<{ count: number; batches: number } | null>(null);

  // Developer Firestore Collection Export State
  const [developerSelectedCollections, setDeveloperSelectedCollections] = useState<string[]>([
    'certificates',
    'configs',
    'apiKeys',
    'webhooks',
    'backups'
  ]);
  const [developerExportNotes, setDeveloperExportNotes] = useState('ডেভেলপার রোল: ফায়ারস্টোর কালেকশন ব্যাকআপ এক্সপোর্ট');
  const [isExportingFirestoreDev, setIsExportingFirestoreDev] = useState(false);
  const [firestoreDevExportResult, setFirestoreDevExportResult] = useState<FirestoreCollectionExportResult | null>(null);

  const handleToggleDevCollection = (colName: string) => {
    setDeveloperSelectedCollections(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handleExecuteDeveloperFirestoreExport = async () => {
    if (developerSelectedCollections.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি ফায়ারস্টোর কালেকশন নির্বাচন করুন।');
      return;
    }
    setIsExportingFirestoreDev(true);
    setFirestoreDevExportResult(null);

    try {
      const result = await exportFirestoreCollectionsToStorage(
        developerSelectedCollections,
        developerExportNotes
      );
      setFirestoreDevExportResult(result);
      fetchBackupsList();
    } catch (err: any) {
      alert('ফায়ারস্টোর এক্সপোর্ট এক্সিকিউশনে ত্রুটি: ' + (err.message || String(err)));
    } finally {
      setIsExportingFirestoreDev(false);
    }
  };

  const handleDownloadDevExportJson = () => {
    if (!firestoreDevExportResult) return;
    const jsonString = JSON.stringify(firestoreDevExportResult.jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = firestoreDevExportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // System Maintenance State
  const [maintHealth, setMaintHealth] = useState<any>(null);
  const [isTriggeringMaintSnapshot, setIsTriggeringMaintSnapshot] = useState(false);
  const [designatedBackupFolder, setDesignatedBackupFolder] = useState(formData.archiveFolderId || formData.targetFolderId || '');
  const [maintNotes, setMaintNotes] = useState('');
  const [maintMessage, setMaintMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch Maintenance Status
  const fetchMaintenanceStatus = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/status');
      const data = await res.json();
      if (data.success && data.systemHealth) {
        setMaintHealth(data.systemHealth);
        if (data.systemHealth.designatedBackupFolderId) {
          setDesignatedBackupFolder(data.systemHealth.designatedBackupFolderId);
        }
      }
    } catch (err) {
      console.warn('Error fetching maintenance status:', err);
    }
  };

  const fetchApiAndWebhookData = async () => {
    try {
      const [resKeys, resHooks] = await Promise.all([
        fetch('/api/admin/api-keys'),
        fetch('/api/admin/webhooks')
      ]);
      const dataKeys = await resKeys.json();
      const dataHooks = await resHooks.json();

      if (dataKeys.success) setApiKeysList(dataKeys.apiKeys || []);
      if (dataHooks.success) {
        setWebhooksList(dataHooks.webhooks || []);
        setWebhookLogsList(dataHooks.logs || []);
      }
    } catch (err) {
      console.warn('Error fetching API/Webhook data:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchMaintenanceStatus();
      fetchBackupsList();
    } else if (activeTab === 'api_webhook') {
      fetchApiAndWebhookData();
    }
  }, [activeTab]);

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('অনুগ্রহ করে API Key-এর একটি নাম বা সার্ভিস বর্ণনা প্রদান করুন (যেমন: ব্যাংক যাচাইকরণ সার্ভিস)।');
      return;
    }
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, permissions: newKeyPerm })
      });
      const data = await res.json();
      if (data.success) {
        setNewKeyName('');
        fetchApiAndWebhookData();
        alert('নতুন API Access Key সফলভাবে জেনারেট করা হইয়াছে!');
      } else {
        alert('API Key জেনারেট ব্যর্থ: ' + data.message);
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই API Key-টি বাতিল (Revoke) করতে চান? এটি ব্যবহারকারী অন্যান্য সার্ভিস বিচ্ছিন্ন হইবে।')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchApiAndWebhookData();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim() || !newWebhookUrl.startsWith('http')) {
      alert('অনুগ্রহ করে একটি বৈধ Webhook URL প্রদান করুন (http:// বা https://)।');
      return;
    }
    setIsSavingWebhook(true);
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWebhookName || 'নতুন ওয়েবহুক এন্ডপয়েন্ট',
          url: newWebhookUrl,
          secret: newWebhookSecret,
          events: newWebhookEvents,
          enabled: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewWebhookName('');
        setNewWebhookUrl('');
        setNewWebhookSecret('');
        fetchApiAndWebhookData();
        alert('নতুন Webhook এন্ডপয়েন্ট সফলভাবে কনফিগার করা হইয়াছে!');
      } else {
        alert('Webhook কনফিগারেশন ব্যর্থ: ' + data.message);
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই Webhook এন্ডপয়েন্টটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchApiAndWebhookData();
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleTestWebhookPing = async (webhookId?: string, urlOverride?: string, secretOverride?: string) => {
    setIsTestingWebhook(true);
    setWebhookTestFeedback(null);
    try {
      const res = await fetch('/api/admin/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId, url: urlOverride || newWebhookUrl, secret: secretOverride || newWebhookSecret })
      });
      const data = await res.json();
      setWebhookTestFeedback(data.message || (data.success ? 'টেস্ট পিং সফল!' : 'টেস্ট পিং ব্যর্থ'));
      fetchApiAndWebhookData();
    } catch (err: any) {
      setWebhookTestFeedback('টেস্ট পিং পাঠাতে ব্যর্থ: ' + err.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleTriggerManualSheetSnapshot = async () => {
    setIsTriggeringMaintSnapshot(true);
    setMaintMessage(null);
    try {
      const res = await fetch('/api/admin/maintenance/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupFolderId: designatedBackupFolder || formData.targetFolderId,
          notes: maintNotes || 'সিস্টেম মেইনটেন্যান্স: ম্যানুয়াল প্রাইমারি শিট স্ন্যাপশট'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMaintMessage({
          text: data.message || 'প্রাইমারি গুগল শিট ডাটাবেসের ম্যানুয়াল স্ন্যাপশট সফলভাবে সম্পন্ন হইয়াছে!',
          type: 'success'
        });
        setMaintNotes('');
        fetchMaintenanceStatus();
        fetchBackupsList();
        if (data.snapshot) {
          setFormData(prev => ({
            ...prev,
            lastBackupDate: data.snapshot.timestamp,
            archiveFolderId: designatedBackupFolder
          }));
        }
      } else {
        setMaintMessage({
          text: data.message || 'ম্যানুয়াল স্ন্যাপশট গ্রহণ করা সম্ভব হয় নাই।',
          type: 'error'
        });
      }
    } catch (err: any) {
      setMaintMessage({ text: 'স্ন্যাপশট ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsTriggeringMaintSnapshot(false);
    }
  };

  const handleClearSystemCache = async () => {
    try {
      const res = await fetch('/api/admin/maintenance/clear-cache', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMaintMessage({ text: data.message, type: 'success' });
        fetchMaintenanceStatus();
      }
    } catch (err: any) {
      setMaintMessage({ text: 'ক্যাশ ক্লিয়ার ত্রুটি: ' + err.message, type: 'error' });
    }
  };

  // Fetch Backups
  const fetchBackupsList = async () => {
    try {
      const res = await fetch('/api/admin/backups');
      const data = await res.json();
      if (data.success && Array.isArray(data.backups)) {
        setBackupsList(data.backups);
      }
    } catch (err) {
      console.warn('Error fetching backups list:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackupsList();
    }
  }, [activeTab]);

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archiveFolderId: archiveFolderInput || formData.targetFolderId,
          notes: backupNotes || 'গুগল ড্রাইভ ও প্রাইমারি ডাটাবেস স্ন্যাপশট'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBackupMessage({ text: data.message || 'ব্যাকআপ স্ন্যাপশট সফলভাবে সংরক্ষিত হইয়াছে!', type: 'success' });
        setBackupNotes('');
        fetchBackupsList();
        if (data.lastBackupDate) {
          setFormData(prev => ({ ...prev, lastBackupDate: data.lastBackupDate, archiveFolderId: archiveFolderInput }));
        }
      } else {
        setBackupMessage({ text: data.message || 'ব্যাকআপ সম্পন্ন করা সম্ভব হয় নাই।', type: 'error' });
      }
    } catch (err: any) {
      setBackupMessage({ text: 'ব্যাকআপ ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (backupId?: string, customJson?: any) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ব্যাকআপ স্ন্যাপশট ডাটাবেসে রিস্টোর করতে চান? বর্তমান ডাটাবেস আপডেট হইবে।')) {
      return;
    }
    setIsRestoring(true);
    setBackupMessage(null);
    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId, backupData: customJson })
      });
      const data = await res.json();
      if (data.success) {
        setBackupMessage({ text: data.message || 'ডাটাবেস সফলভাবে রিস্টোর করা হইয়াছে!', type: 'success' });
      } else {
        setBackupMessage({ text: data.message || 'রিস্টোর করা সম্ভব হয় নাই।', type: 'error' });
      }
    } catch (err: any) {
      setBackupMessage({ text: 'রিস্টোর ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportProjectClonePackage = () => {
    setIsExportingClone(true);
    try {
      window.open('/api/admin/project-clone/export', '_blank');
      setBackupMessage({
        text: 'সম্পূর্ণ প্রজেক্ট ক্লোন প্যাকেজ ফাইল (UP_Full_Project_Backup.json) সফলভাবে ডাউনলোড হইতেছে!',
        type: 'success'
      });
    } catch (err: any) {
      setBackupMessage({ text: 'প্রজেক্ট প্যাকেজ এক্সপোর্ট ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsExportingClone(false);
    }
  };

  const handleClonePackageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json === 'object') {
          setClonePackageData(json);
          const cfg = json.unionConfig || json.config || {};
          setCloneUnionName(cfg.upName || formData.upName || '');
          setCloneUpazila(cfg.upazila || formData.upazila || '');
          setCloneDistrict(cfg.district || formData.district || '');
          setCloneChairman(cfg.chairmanName || formData.chairmanName || '');
          setCloneSheetId(cfg.sheetId || formData.sheetId || '');
          setCloneFolderId(cfg.targetFolderId || formData.targetFolderId || '');
          setShowCloneWizard(true);
        } else {
          alert('অবৈধ প্রজেক্ট প্যাকেজ ফাইল।');
        }
      } catch (err) {
        alert('ফাইল পড়া ব্যর্থ হইয়াছে বা এটি একটি অবৈধ JSON ফাইল।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteCloneImport = async () => {
    if (!clonePackageData) return;
    setIsImportingClone(true);
    setBackupMessage(null);

    try {
      const res = await fetch('/api/admin/project-clone/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageData: clonePackageData,
          cloneMode,
          newUnionName: cloneUnionName,
          newUpazila: cloneUpazila,
          newDistrict: cloneDistrict,
          newChairman: cloneChairman,
          newSheetId: cloneSheetId,
          newFolderId: cloneFolderId
        })
      });

      const data = await res.json();
      if (data.success) {
        // Perform Firestore batch write restore if historical records exist in package
        const certsToBatchRestore = clonePackageData.masterDatabase?.certificates || clonePackageData.certificates || clonePackageData.sheetData?.certificates || (Array.isArray(clonePackageData) ? clonePackageData : []);
        let fsMsg = '';
        if (Array.isArray(certsToBatchRestore) && certsToBatchRestore.length > 0) {
          try {
            const fsRes = await batchRestoreCertificatesToFirebase(certsToBatchRestore);
            fsMsg = ` (Firestore-এ ${fsRes.count} টি রেকর্ড ${fsRes.batches} টি ব্যাচে রিস্টোর হইয়াছে)`;
          } catch (fsErr) {
            console.warn('Firestore batch restore during clone warning:', fsErr);
          }
        }

        setBackupMessage({
          text: (data.message || 'প্রজেক্ট রিস্টোর / নতুন ইউনিয়ন প্রজেক্ট ক্লোনিং সফলভাবে সম্পন্ন হইয়াছে!') + fsMsg,
          type: 'success'
        });
        if (data.upConfig) {
          onUpdateConfig(data.upConfig);
          setFormData(data.upConfig);
        }
        setShowCloneWizard(false);
      } else {
        setBackupMessage({ text: data.message || 'ক্লোনিং ব্যর্থ হইয়াছে।', type: 'error' });
      }
    } catch (err: any) {
      setBackupMessage({ text: 'ক্লোনিং প্রসেস ত্রুটি: ' + err.message, type: 'error' });
    } finally {
      setIsImportingClone(false);
    }
  };

  const handleFirestoreJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        let certs: any[] = [];
        if (Array.isArray(json)) {
          certs = json;
        } else if (json && typeof json === 'object') {
          certs = json.masterDatabase?.certificates || json.certificates || json.sheetData?.certificates || json.records || [];
        }

        setFirestoreImportFile(file);
        setFirestoreImportCerts(certs);
        setFirestoreBatchResult(null);
      } catch (err) {
        alert('অবৈধ JSON ফাইল। অনুগ্রহ করে সঠিক ব্যাকআপ JSON সিলেক্ট করুন।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteFirestoreBatchRestore = async () => {
    if (firestoreImportCerts.length === 0) {
      alert('ফাইলে কোনো সনদের বা নাগরিক ডাটার রেকর্ড পাওয়া যায়নি।');
      return;
    }

    setIsBatchRestoringFirestore(true);
    setBackupMessage(null);

    try {
      const result = await batchRestoreCertificatesToFirebase(firestoreImportCerts);
      setFirestoreBatchResult(result);
      setBackupMessage({
        text: `🔥 Firestore ডাটাবেসে ব্যাচ রাইট (Batch Write) এর মাধ্যমে সফলভাবে ${result.count} টি ঐতিহাসিক রেকর্ড (${result.batches} টি ব্যাচ অপারেশন) রিস্টোর করা হইয়াছে!`,
        type: 'success'
      });

      // Also sync to Express backend database memory
      fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates: firestoreImportCerts })
      }).catch(err => console.warn('Server restore sync warning:', err));

    } catch (err: any) {
      console.error('Firestore batch restore error:', err);
      setBackupMessage({
        text: 'Firestore ব্যাচ রাইট রিস্টোর ব্যর্থ হইয়াছে: ' + (err.message || String(err)),
        type: 'error'
      });
    } finally {
      setIsBatchRestoringFirestore(false);
    }
  };
  
  // Certificate Types Editing State
  const [certSearch, setCertSearch] = useState('');
  const [selectedCertKey, setSelectedCertKey] = useState<string>('citizenship');
  const [editingCertPrompt, setEditingCertPrompt] = useState<string>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      // Sync config to Firebase Firestore as well
      saveConfigToFirebase(formData).catch(err =>
        console.warn('Firebase config sync warning:', err)
      );

      if (data.success && data.config) {
        onUpdateConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCertType = CERTIFICATE_TYPES.find(t => t.key === selectedCertKey) || CERTIFICATE_TYPES[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Title */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>অ্যাডমিন মাস্টার কন্ট্রোল ও সিস্টেম কনফিগারেশন</span>
          </h2>
          <p className="text-xs text-slate-500">
            ইউনিয়ন পরিষদের নাম, চেয়ারম্যান/সচিব, লোগো, অ্যাপস স্ক্রিপ্ট, Cloudflare R2 এবং AI প্রম্পট সংশোধন করুন।
          </p>
        </div>

        <button
          onClick={() => setIsAppsScriptOpen(true)}
          className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Code className="w-4 h-4 text-amber-300" />
          <span>Apps Script কোড দেখুন</span>
        </button>
      </div>

      {/* Admin Tab Chooser */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-800 hover:bg-slate-300/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>১. চেয়ারম্যান অনুমোদন পেন্ডিং (Pending Approvals)</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>২. ইউপি ও অফিসার তথ্য</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'print'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-300" />
          <span>২. সিল, লোগো ও ফি</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'workspace'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Database className="w-4 h-4 text-amber-300" />
          <span>৩. গুগল ওয়ার্কস্পেস ও ড্রাইভার</span>
        </button>

        <button
          onClick={() => setActiveTab('r2')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'r2'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Cloud className="w-4 h-4 text-amber-300" />
          <span>৪. Cloudflare R2 / S3</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>৫. Gemini AI ও প্রম্পট</span>
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'types'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>৬. ৪০+ সনদ ক্যাটাগরি</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-amber-300" />
          <span>৭. ব্যাকআপ ও রিস্টোর (Archive Drive)</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-300" />
          <span>৮. সিস্টেম মেইনটেন্যান্স (System Maintenance)</span>
        </button>

        <button
          onClick={() => setActiveTab('api_webhook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'api_webhook'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>৯. API ও ওয়েবহুক (API & Webhooks)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('council_members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'council_members'
              ? 'bg-emerald-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>১০. পরিষদ সদস্য ও কর্মকর্তা ব্যবস্থাপনা (২৭ জন)</span>
        </button>
      </div>

      {/* TAB 0: Pending Approvals for Chairman */}
      {activeTab === 'pending' && (
        <PendingApprovals config={formData} />
      )}

      {/* TAB 8: System Maintenance Section */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700/80 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-extrabold">
                  <Wrench className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>সিস্টেম মেইনটেন্যান্স ও গুগল ড্রাইভ ডাটাবেস স্ন্যাপশট সেন্টার</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  সিস্টেম মেইনটেন্যান্স ও গুগল শিট ম্যানুয়াল স্ন্যাপশট
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  ইউনিয়ন পরিষদের প্রাইমারি গুগল শিট ডাটাবেসের সচলতা পর্যবেক্ষণ করুন এবং সরাসরি নির্ধারিত 'Backup' গুগল ড্রাইভ ফোল্ডারে ম্যানুয়াল স্ন্যাপশট ট্রিগার করুন।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shrink-0 text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-4 text-slate-200">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> প্রাইমারি শিট স্ট্যাটাস:</span>
                  <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {maintHealth?.primarySheetStatus === 'connected' ? 'সংযুক্ত (Online)' : 'কনফিগারেশন প্রয়োজন'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-200">
                  <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-amber-400" /> অ্যাপস স্ক্রিপ্ট ওয়েবহুক:</span>
                  <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {maintHealth?.appsScriptStatus === 'active' ? 'সক্রিয় (Linked)' : 'সংযুক্ত নয়'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Notification Banner */}
          {maintMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
              maintMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {maintMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{maintMessage.text}</span>
              </div>
              <button
                onClick={() => setMaintMessage(null)}
                className="text-xs font-bold underline cursor-pointer hover:opacity-80"
              >
                বন্ধ করুন
              </button>
            </div>
          )}

          {/* System Health Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">প্রাইমারি শিট আইডি</span>
                <span className="font-mono text-xs font-black text-slate-900 truncate block max-w-[140px]">
                  {maintHealth?.primarySheetId || formData.sheetId || 'SHEET_PRIMARY_DB_ID'}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">নির্ধারিত 'Backup' ফোল্ডার</span>
                <span className="font-mono text-xs font-black text-slate-900 truncate block max-w-[140px]">
                  {designatedBackupFolder || formData.archiveFolderId || 'DESIGNATED_BACKUP_FOLDER'}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">মোট ডাটাবেস রেকর্ড</span>
                <span className="text-base font-black text-slate-900 block">
                  {maintHealth?.totalRecords ?? 0} টি সংরক্ষিত
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">সর্বশেষ স্ন্যাপশট সময়</span>
                <span className="text-[11px] font-mono font-bold text-slate-900 block">
                  {maintHealth?.lastSnapshotDate
                    ? new Date(maintHealth.lastSnapshotDate).toLocaleTimeString('bn-BD')
                    : 'এখনো নেওয়া হয় নাই'}
                </span>
              </div>
            </div>
          </div>

          {/* Trigger Manual Snapshot to Designated Backup Folder Box */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-700" />
                <span>প্রাইমারি গুগল শিট ম্যানুয়াল স্ন্যাপশট ট্রিগার (Manual Snapshot Trigger)</span>
              </h4>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>'Backup' গুগল ড্রাইভ ফোল্ডারে সিঙ্ক</span>
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নির্ধারিত 'Backup' গুগল ড্রাইভ ফোল্ডার আইডি (Designated Backup Drive Folder ID)
                  </label>
                  <div className="relative">
                    <FolderArchive className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={designatedBackupFolder}
                      onChange={(e) => setDesignatedBackupFolder(e.target.value)}
                      placeholder="যেমন: 1A2B3C4D5E6F_DESIGNATED_BACKUP_FOLDER"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    এই ড্রাইভ ফোল্ডারে প্রাইমারি গুগল শিট ডাটাবেসের সম্পূর্ণ কপি ও স্ন্যাপশট সংরক্ষিত হইবে।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্ন্যাপশটের বিবরণ / নোট (Snapshot Memo)
                  </label>
                  <input
                    type="text"
                    value={maintNotes}
                    onChange={(e) => setMaintNotes(e.target.value)}
                    placeholder="যেমন: সফটওয়্যার আপডেট ও সিস্টেম মেইনটেন্যান্স পূর্ববর্তী ম্যানুয়াল স্ন্যাপশট"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-100">
                <button
                  onClick={handleTriggerManualSheetSnapshot}
                  disabled={isTriggeringMaintSnapshot}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-800 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isTriggeringMaintSnapshot ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>প্রাইমারি শিট স্ন্যাপশট ট্রিগার করা হইতেছে...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>প্রাইমারি গুগল শিট ডাটাবেস ম্যানুয়াল স্ন্যাপশট ট্রিগার করুন</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearSystemCache}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-700" />
                  <span>সিস্টেম ক্যাশ ক্লিয়ার করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Snapshots Audit Table */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-700" />
                <span>মেইনটেন্যান্স ও ম্যানুয়াল স্ন্যাপশট ইতিহাস (Snapshot Log)</span>
              </h4>
              <button
                onClick={() => {
                  fetchMaintenanceStatus();
                  fetchBackupsList();
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>লগ রিফ্রেশ</span>
              </button>
            </div>

            {backupsList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-300">
                কোনো মেইনটেন্যান্স স্ন্যাপশট লগ পাওয়া যায় নাই।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">স্ন্যাপশট ফাইল</th>
                      <th className="p-3">নির্ধারিত 'Backup' ফোল্ডার</th>
                      <th className="p-3 text-center">রেকর্ড সংখ্যা</th>
                      <th className="p-3">নোট / বিবরণ</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {backupsList.map((snap) => (
                      <tr key={snap.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {new Date(snap.timestamp).toLocaleString('bn-BD')}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-900 flex items-center gap-1.5 whitespace-nowrap">
                          <FileJson className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{snap.filename}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {snap.archiveFolderId ? `${snap.archiveFolderId.slice(0, 16)}...` : 'N/A'}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">
                          {snap.recordsCount} টি
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">
                          {snap.notes || 'ম্যানুয়াল স্ন্যাপশট'}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>সংরক্ষিত</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: Backup & Restore Utility */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-700/50 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-extrabold">
                  <FolderArchive className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>সম্পূর্ণ প্রজেক্ট ক্লোন, ব্যাকআপ ও মাল্টি-ইউনিয়ন সেটআপ সিস্টেম</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  সম্পূর্ণ প্রজেক্ট ব্যাকআপ প্যাকেজ ও ক্লোনিং উইজার্ড
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                  এই পুরো ডিজিটাল ইউনিয়ন পরিষদ সিস্টেমটি (৪০+ সনদের ফরম্যাট, AI প্রম্পট, গুগল অ্যাপস স্ক্রিপ্ট কোড, মাস্টার ডাটাবেস ও কনফিগারেশন) এক ক্লিকে সম্পূর্ণ ব্যাকআপ ফাইল (.json) হিসেবে ডাউনলোড করুন এবং পরবর্তীতে বা অন্য যেকোনো ইউনিয়ন পরিষদের জন্য ব্যবহার/ক্লোন করুন।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shrink-0 text-xs space-y-1">
                <div className="flex items-center justify-between gap-3 text-slate-200">
                  <span>সর্বশেষ ব্যাকআপ:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {formData.lastBackupDate
                      ? new Date(formData.lastBackupDate).toLocaleString('bn-BD')
                      : 'এখনো ব্যাকআপ নেওয়া হয় নাই'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-200">
                  <span>প্রাইমারি শিট আইডি:</span>
                  <span className="font-mono text-[11px] text-emerald-200">
                    {formData.sheetId ? `${formData.sheetId.slice(0, 10)}...` : 'কনফিগার করা নাই'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Message Notification */}
          {backupMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
              backupMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {backupMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{backupMessage.text}</span>
              </div>
              <button
                onClick={() => setBackupMessage(null)}
                className="text-xs font-bold underline cursor-pointer hover:opacity-80"
              >
                বন্ধ করুন
              </button>
            </div>
          )}

          {/* DEVELOPER ROLE: FIRESTORE DATABASE EXPORT CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-500/40 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl shrink-0">
                  <Code className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white flex items-center gap-2">
                    <span>🔥 ডেভেলপার রোল: Firestore ডাটাবেস এক্সপোর্ট (Cloud Storage & JSON)</span>
                    <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] rounded-md font-extrabold border border-indigo-400/40">
                      Developer Exclusive
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    নির্দিষ্ট Firestore কালেকশন সিলেক্ট করে JSON ব্যাকআপ তৈরি করুন এবং সরাসরি Firebase Cloud Storage-এ সংরক্ষণ করুন।
                  </p>
                </div>
              </div>
            </div>

            {/* Collection Selector & Export Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-2">
                  ব্যাকআপের জন্য নির্দিষ্ট ফায়ারস্টোর কালেকশন সমূহ সিলেক্ট করুন:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {[
                    { key: 'certificates', label: 'certificates' },
                    { key: 'configs', label: 'configs' },
                    { key: 'apiKeys', label: 'apiKeys' },
                    { key: 'webhooks', label: 'webhooks' },
                    { key: 'backups', label: 'backups' }
                  ].map(col => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => handleToggleDevCollection(col.key)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        developerSelectedCollections.includes(col.key)
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{col.key}</span>
                      {developerSelectedCollections.includes(col.key) && (
                        <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    ব্যাকআপ নোট / বিবরণী:
                  </label>
                  <input
                    type="text"
                    value={developerExportNotes}
                    onChange={(e) => setDeveloperExportNotes(e.target.value)}
                    placeholder="যেমন: ডেভেলপার ডাটাবেস এক্সপোর্ট..."
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExecuteDeveloperFirestoreExport}
                  disabled={isExportingFirestoreDev || developerSelectedCollections.length === 0}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                >
                  {isExportingFirestoreDev ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>ফায়ারস্টোর এক্সপোর্ট হইতেছে...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4 text-slate-950" />
                      <span>🔥 Firestore এক্সপোর্ট ট্রিগার করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Result Display */}
            {firestoreDevExportResult && (
              <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-extrabold text-xs text-white">
                      ফায়ারস্টোর এক্সপোর্ট সম্পন্ন! মোট {firestoreDevExportResult.totalDocuments} টি ডকুমেন্ট ({firestoreDevExportResult.sizeKb} KB)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-300">
                    {firestoreDevExportResult.filename}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  {Object.entries(firestoreDevExportResult.collections).map(([col, count]) => (
                    <span key={col} className="px-2.5 py-1 bg-emerald-900/90 text-emerald-200 border border-emerald-600/50 rounded-lg font-mono">
                      {col}: <strong>{count}</strong> docs
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadDevExportJson}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>JSON ব্যাকআপ ডাউনলোড করুন</span>
                  </button>

                  {firestoreDevExportResult.downloadUrl ? (
                    <a
                      href={firestoreDevExportResult.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Cloud className="w-4 h-4 text-amber-300" />
                      <span>Firebase Cloud Storage ফাইল ভিউ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-300 font-mono">
                      * Storage Path: {firestoreDevExportResult.storagePath || 'backups/firestore_exports/' + firestoreDevExportResult.filename}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FIRESTORE BATCH WRITE IMPORT & RESTORE CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-500/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-xl">
                  <Database className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white flex items-center gap-2">
                    <span>🔥 Firestore ডাটাবেস 'Import & Restore' (Batch Write System)</span>
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] rounded-md font-bold border border-amber-400/40">
                      Batched 400-Writes / Commit
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    ঐতিহাসিক ব্যাকআপ JSON ফাইল আপলোড করিয়া সরাসরি Firestore ডাটাবেসে ব্যাচ রাইট (Batch Write) অপস পরিচালনা করুন
                  </p>
                </div>
              </div>

              <label className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0">
                <Upload className="w-4 h-4 text-slate-950" />
                <span>JSON ফাইল সিলেক্ট করুন</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFirestoreJsonFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* File Details & Restore Execution Block */}
            {firestoreImportFile ? (
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-300">নির্বাচিত ফাইল: </span>
                    <span className="font-bold text-amber-300 font-mono">{firestoreImportFile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-300">শনাক্তকৃত ঐতিহাসিক রেকর্ড: </span>
                    <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-md font-mono font-black text-sm border border-emerald-400/40">
                      {firestoreImportCerts.length} টি রেকর্ড
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    * এই অপারেশনে Firestore SDK-এর `writeBatch` ব্যবহার করে প্রতি ব্যাচে সর্বোচ্চ 400 টি রেকর্ড রাইট করা হইবে।
                  </p>

                  <button
                    type="button"
                    onClick={handleExecuteFirestoreBatchRestore}
                    disabled={isBatchRestoringFirestore || firestoreImportCerts.length === 0}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isBatchRestoringFirestore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Firestore-এ ব্যাচ রাইট হইতেছে...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-slate-950" />
                        <span>Firestore-এ {firestoreImportCerts.length} টি রেকর্ড ব্যাচ রিস্টোর করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/20 text-xs text-slate-300">
                <p>ফাইল নির্বাচন করা হয়নি। ফায়ারস্টোরে ঐতিহাসিক রেকর্ড রিস্টোর করতে একটি ব্যাকআপ `.json` ফাইল সিলেক্ট করুন।</p>
              </div>
            )}

            {firestoreBatchResult && (
              <div className="p-3 bg-emerald-900/80 border border-emerald-500/60 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>
                  সফল ব্যাচ রাইট ফলাফল: মোট {firestoreBatchResult.count} টি রেকর্ড, {firestoreBatchResult.batches} টি Commit ব্যাচে সম্পন্ন হইয়াছে!
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>

          {/* PROJECT CLONE EXPORTER & IMPORT WIZARD CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box A: Download Full Project Clone Package */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-700/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-700/50 pb-3">
                  <Download className="w-6 h-6 text-amber-300 shrink-0" />
                  <div>
                    <h4 className="font-black text-sm text-white">১. সম্পূর্ণ প্রজেক্ট প্যাকেজ এক্সপোর্ট (Full Project Backup)</h4>
                    <p className="text-[11px] text-emerald-200">সকল ফাইল, ৪০+ সনদের ফরম্যাট, AI রুলস ও ডাটাবেস এক ফাইলে এক্সপোর্ট</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  এই প্যাকেজে সম্পূর্ণ প্রজেক্টের উৎস কোড গাইড, অ্যাপস স্ক্রিপ্ট টেমপ্লেট (`Code.gs`, `Gemini.gs`, `Index.html`), ৪০+ সনদের ক্যাটাগরি ও কনফিগারেশন, মাস্টার সিটিজেন ডাটাবেস এবং সকল সিস্টেম সেটিংস সংযুক্ত থাকিবে।
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportProjectClonePackage}
                  disabled={isExportingClone}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <FileJson className="w-4 h-4 text-slate-950" />
                  <span>ডাউনলোড সম্পূর্ণ প্রজেক্ট ক্লোন প্যাকেজ (.json)</span>
                </button>
              </div>
            </div>

            {/* Box B: Import / Clone Wizard for New UP */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-slate-700 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                  <RotateCcw className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-black text-sm text-white">২. প্রজেক্ট রিস্টোর ও অন্য ইউনিয়নের জন্য ক্লোনিং উইজার্ড</h4>
                    <p className="text-[11px] text-slate-300">ব্যাকআপ ফাইল দিয়ে রিস্টোর করুন অথবা নতুন ইউপি হিসেবে সেটআপ দিন</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  আপনার কাছে থাকা ব্যাকআপ `.json` ফাইলটি আপলোড করুন। ফাইলটি আপলোড করার পর আপনি চাইলে হুবহু ডাটা রিস্টোর করতে পারিবেন, অথবা নতুন ইউনিয়নের নাম বসিয়ে প্রজেক্টটিকে অন্য ইউপির জন্য ক্লোন করিতে পারিবেন।
                </p>
              </div>

              <div className="pt-2">
                <label className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>প্রজেক্ট ব্যাকআপ JSON আপলোড ও উইজার্ড রান করুন</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleClonePackageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Backup Controls & Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Snapshot Box */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-5">
              <h4 className="font-extrabold text-sm text-emerald-950 border-b border-slate-200 pb-3 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-700" />
                <span>৩. গুগল ড্রাইভ ফোল্ডারে নিয়মিত স্ন্যাপশট প্রস্তুতকরণ (Drive Snapshot)</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সেকেন্ডারি 'Archive' গুগল ড্রাইভ ফোল্ডার আইডি (Archive Folder ID)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <FolderArchive className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={archiveFolderInput}
                        onChange={(e) => setArchiveFolderInput(e.target.value)}
                        placeholder="যেমন: 1A2B3C4D5E6F_ARCHIVE_FOLDER_ID"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    এই ড্রাইভ ফোল্ডারে মাস্টার গুগল শিটের কপি ও ব্যাকআপ ফাইলসমূহ স্ন্যাপশট হিসেবে জমা হইবে।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্ন্যাপশট নোট বা ব্যাকআপের বিবরণ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={backupNotes}
                    onChange={(e) => setBackupNotes(e.target.value)}
                    placeholder="যেমন: আগস্ট ২০২৬ মাসের সাপ্তাহিক নিয়মিত ড্রাইভ ব্যাকআপ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTriggerBackup}
                    disabled={isBackingUp}
                    className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>ড্রাইভ ব্যাকআপ প্রক্রিয়াধীন...</span>
                      </>
                    ) : (
                      <>
                        <FolderArchive className="w-4 h-4 text-amber-300" />
                        <span>ড্রাইভ 'Archive' ফোল্ডারে স্ন্যাপশট তৈরি করুন</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/api/admin/export"
                    download="union_master_db.csv"
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>CSV ডাটাবেস ডাউনলোড</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick CSV / JSON Info Box */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-emerald-700" />
                  <span>ব্যাকআপ ফাইল কীভাবে রূপান্তর ও পুনঃব্যবহার করবেন?</span>
                </h4>
                <ul className="text-xs text-slate-700 space-y-2 mt-3 list-disc pl-4 font-medium">
                  <li><strong>১. সম্পূর্ণ প্রজেক্ট ব্যাকআপ:</strong> যেকোনো সময় ফাইলটি ডাউনলোড করে সংরক্ষণ করুন। এতে ৪০+ সনদ ও গুগল অ্যাপস স্ক্রিপ্ট কোড সংরক্ষিত থাকে।</li>
                  <li><strong>২. নতুন ইউনিয়নে স্থাপন:</strong> যেকোনো জায়গায় ফাইলটি আপলোড করে "নতুন ইউনিয়ন পরিষদের জন্য ক্লোনিং" অপশনে ক্লিক করে নতুন নাম দিলে সাথে সাথে সিস্টেম নতুন ইউপি রূপ লাভ করবে।</li>
                  <li><strong>৩. গুগল ড্রাইভ ডাটাবেস:</strong> আপনার গুগল শিট বা ড্রাইভে ব্যাকআপ রাখতে প্রতি সপ্তাহে ১বার স্ন্যাপশট বাটন চাপুন।</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-emerald-700" />
                <span>সংরক্ষিত স্ন্যাপশট ব্যাকআপ হিস্টোরি ও ড্রাইভ আর্কাইভ লগ</span>
              </h4>
              <button
                onClick={fetchBackupsList}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>রিফ্রেশ</span>
              </button>
            </div>

            {backupsList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-300">
                কোনো সংরক্ষিত ব্যাকআপ স্ন্যাপশট পাওয়া যায় নাই। নতুন স্ন্যাপশট তৈরি করতে উপরের বাটনে ক্লিক করুন।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">ফাইল নাম</th>
                      <th className="p-3">ড্রাইভ আর্কাইভ ফোল্ডার</th>
                      <th className="p-3 text-center">রেকর্ড সংখ্যা</th>
                      <th className="p-3 text-center">সাইজ</th>
                      <th className="p-3 text-center">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {backupsList.map((bkp) => (
                      <tr key={bkp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {new Date(bkp.timestamp).toLocaleString('bn-BD')}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-900 flex items-center gap-1.5 whitespace-nowrap">
                          <FileJson className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{bkp.filename}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {bkp.archiveFolderId ? `${bkp.archiveFolderId.slice(0, 16)}...` : 'N/A'}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900">
                          {bkp.recordsCount} টি
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600">
                          {bkp.sizeKb || 12} KB
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>সম্পন্ন</span>
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleRestoreBackup(bkp.id)}
                            disabled={isRestoring}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-700" />
                            <span>রিস্টোর</span>
                          </button>

                          <button
                            onClick={() => {
                              const jsonStr = JSON.stringify(bkp.backupData || { certificates: [] }, null, 2);
                              const blob = new Blob([jsonStr], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = bkp.filename;
                              a.click();
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3 text-emerald-700" />
                            <span>ডাউনলোড</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== 'pending' && activeTab !== 'backup' && (
        <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>ইউনিয়ন পরিষদ, এলাকা ও প্রশাসনিক কর্মকর্তা সমূহের তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউনিয়ন পরিষদের নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={formData.upName}
                  onChange={(e) => setFormData({ ...formData, upName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউনিয়ন পরিষদের নাম (ইংরেজি)
                </label>
                <input
                  type="text"
                  value={formData.upNameEn}
                  onChange={(e) => setFormData({ ...formData, upNameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপজেলা ও জেলা
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.upazila}
                    onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                    placeholder="উপজেলা"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="জেলা"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যোগাযোগের নম্বর ও ইমেইল
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="মোবাইল নম্বর"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ইমেইল এড্রেস"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্ণাঙ্গ অফিশিয়াল ঠিকানা ও পোস্ট অফিস বিবরণী
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Chairman & Secretary Details */}
            <div className="pt-2 border-t border-slate-200">
              <p className="font-bold text-xs text-slate-800 mb-3">চেয়ারম্যান ও প্রশাসনিক কর্মকর্তার স্বাক্ষর ও মোবাইল তথ্য:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <p className="font-bold text-xs text-emerald-950">চেয়ারম্যান / প্যানেল চেয়ারম্যান</p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নাম</label>
                    <input
                      type="text"
                      value={formData.chairmanName}
                      onChange={(e) => setFormData({ ...formData, chairmanName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পদবী</label>
                    <input
                      type="text"
                      value={formData.chairmanTitle}
                      onChange={(e) => setFormData({ ...formData, chairmanTitle: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">চেয়ারম্যানের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.chairmanPhone || ''}
                      onChange={(e) => setFormData({ ...formData, chairmanPhone: e.target.value })}
                      placeholder="যেমন: ০১৭৯৯-১১২২ ৩৩"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-mono font-bold text-emerald-900"
                    />
                  </div>

                  {/* Chairman Digital Signature Upload */}
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>চেয়ারম্যানের ডিজিটাল স্বাক্ষর (Digital Signature)</span>
                      </label>
                      {formData.chairmanSignatureUrl && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>সংযুক্ত</span>
                        </span>
                      )}
                    </div>

                    {formData.chairmanSignatureUrl ? (
                      <div className="relative group bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm">
                        <div className="h-12 max-w-[180px] flex items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] rounded p-1">
                          <img
                            src={formData.chairmanSignatureUrl}
                            alt="Chairman Signature"
                            className="max-h-full max-w-full object-contain filter contrast-125"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, chairmanSignatureUrl: '' })}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold transition flex items-center gap-1 border border-red-200 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>রিমুভ</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-white border-2 border-dashed border-emerald-300 rounded-lg text-center space-y-1">
                        <p className="text-[10px] text-slate-500 font-medium">স্বচ্ছ ব্যাকগ্রাউন্ডের (PNG/JPG) ই-স্বাক্ষর ফাইল আপলোড করুন</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>স্বাক্ষর ফাইল আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, chairmanSignatureUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={formData.chairmanSignatureUrl || ''}
                      onChange={(e) => setFormData({ ...formData, chairmanSignatureUrl: e.target.value })}
                      placeholder="অথবা ইমেজের URL লিংক দিন"
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <p className="font-bold text-xs text-emerald-950">ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তা (সচিব)</p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নাম</label>
                    <input
                      type="text"
                      value={formData.secretaryName}
                      onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পদবী</label>
                    <input
                      type="text"
                      value={formData.secretaryTitle}
                      onChange={(e) => setFormData({ ...formData, secretaryTitle: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">সচিবের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.secretaryPhone || ''}
                      onChange={(e) => setFormData({ ...formData, secretaryPhone: e.target.value })}
                      placeholder="যেমন: ০১৮১২-৪৪৫৫ ৬৬"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-mono font-bold text-emerald-900"
                    />
                  </div>

                  {/* Secretary Digital Signature Upload */}
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>সচিবের ডিজিটাল স্বাক্ষর (Digital Signature)</span>
                      </label>
                      {formData.secretarySignatureUrl && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>সংযুক্ত</span>
                        </span>
                      )}
                    </div>

                    {formData.secretarySignatureUrl ? (
                      <div className="relative group bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between gap-3 shadow-sm">
                        <div className="h-12 max-w-[180px] flex items-center justify-center overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] rounded p-1">
                          <img
                            src={formData.secretarySignatureUrl}
                            alt="Secretary Signature"
                            className="max-h-full max-w-full object-contain filter contrast-125"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, secretarySignatureUrl: '' })}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-bold transition flex items-center gap-1 border border-red-200 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>রিমুভ</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-white border-2 border-dashed border-emerald-300 rounded-lg text-center space-y-1">
                        <p className="text-[10px] text-slate-500 font-medium">স্বচ্ছ ব্যাকগ্রাউন্ডের (PNG/JPG) ই-স্বাক্ষর ফাইল আপলোড করুন</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>স্বাক্ষর ফাইল আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, secretarySignatureUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={formData.secretarySignatureUrl || ''}
                      onChange={(e) => setFormData({ ...formData, secretarySignatureUrl: e.target.value })}
                      placeholder="অথবা ইমেজের URL লিংক দিন"
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Signature Master Switches */}
              <div className="mt-4 p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
                <p className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>সনদে ডিজিটাল স্বাক্ষর প্রদর্শন নিয়ন্ত্রণ:</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-emerald-200 hover:border-emerald-400 transition shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.enableDigitalSignature !== false}
                      onChange={(e) => setFormData({ ...formData, enableDigitalSignature: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">ইস্যুকৃত সনদে ডিজিটাল স্বাক্ষর প্রদর্শন সক্রিয় রাখুন</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-emerald-200 hover:border-emerald-400 transition shadow-xs">
                    <input
                      type="checkbox"
                      checked={formData.showSecretarySignature !== false}
                      onChange={(e) => setFormData({ ...formData, showSecretarySignature: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">সনদের বাম পার্শ্বে সচিবের স্বাক্ষর ব্লক প্রদর্শন করুন</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Print & Branding & Payment Fees */}
        {activeTab === 'print' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>লোগো, অফিশিয়াল সিল, জলছাপ, মোবাইল ব্যাংকিং (MFS) ও টেমপ্লেট কাস্টমাইজার</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload Section */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ইউনিয়ন পরিষদের লোগো / অফিশিয়াল সিল আপলোড ও লিংক (পূর্বে আপলোডকৃত লোগো সহ)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white border-2 border-emerald-800 p-2 shadow-sm flex items-center justify-center shrink-0">
                    <img
                      src={formData.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg'}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="লোগোর অনলাইন ইমেজের URL লিংক প্রদান করুন"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:border-emerald-600 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm flex items-center gap-1">
                        <span>📁 নতুন লোগো ফাইল আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, logoUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg' })}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
                      >
                        সরকারি অফিশিয়াল সিল
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Layout Customizer Options */}
              <div className="md:col-span-2 bg-emerald-950 text-white p-4 rounded-xl space-y-3">
                <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>সনদের টেমপ্লেট ও লেআউট কাস্টমাইজার সেটিংস (ইচ্ছেমতো লেআউট নির্ধারণ)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">হেডার লেআউট স্টাইল:</label>
                    <select
                      value={formData.templateHeaderStyle || 'tri-column'}
                      onChange={(e) => setFormData({ ...formData, templateHeaderStyle: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    >
                      <option value="tri-column">১. ৩-কলাম হেডার (ছবি অনুযায়ী)</option>
                      <option value="centered">২. সেন্টার্ড লোগো ও টাইটেল</option>
                      <option value="classic">৩. ক্লাসিকাল সরকারি প্যাড</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">ফ্রেম বর্ডার স্টাইল:</label>
                    <select
                      value={formData.borderStyle || 'double-green-red'}
                      onChange={(e) => setFormData({ ...formData, borderStyle: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    >
                      <option value="double-green-red">ডবল বর্ডার (সবুজ ও লাল)</option>
                      <option value="double-green">ডবল সবুজ বর্ডার</option>
                      <option value="single-green">একক সবুজ বর্ডার</option>
                      <option value="none">নো বর্ডার (প্লেন কাগজ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">গোল সিল ফাঁকা স্থান (px):</label>
                    <input
                      type="number"
                      value={formData.blankSealSize ?? 96}
                      onChange={(e) => setFormData({ ...formData, blankSealSize: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">বডি ফন্ট সাইজ (px):</label>
                    <input
                      type="number"
                      value={formData.bodyFontSize || 16}
                      onChange={(e) => setFormData({ ...formData, bodyFontSize: parseInt(e.target.value) || 16 })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bangladeshi MFS Numbers Settings */}
              <div className="md:col-span-2 bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>মোবাইল ব্যাংকিং (MFS) নম্বর ও নির্দেশনা সেটিংস</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-pink-400 mb-1">বিকাশ (bKash) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentBkashNumber || '01799-112233'}
                      onChange={(e) => setFormData({ ...formData, paymentBkashNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-400 mb-1">নগদ (Nagad) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentNagadNumber || '01812-445566'}
                      onChange={(e) => setFormData({ ...formData, paymentNagadNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-400 mb-1">রকেট (Rocket) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentRocketNumber || '01911-223344'}
                      onChange={(e) => setFormData({ ...formData, paymentRocketNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পেমেন্ট নির্দেশনা:</label>
                  <input
                    type="text"
                    value={formData.paymentInstructions || 'উক্ত নম্বরে সনদের ফি Send Money / Merchant Payment করে TrxID লিখুন।'}
                    onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Category-wise Fee Configuration */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="font-bold text-xs text-emerald-950">
                    সনদের ফি ব্যবস্থাপনা (ক্যাটাগরি ভিত্তিক চার্জ বসান):
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-600">ডিফল্ট ফি:</span>
                    <input
                      type="number"
                      value={formData.certificateFeeDefault || 50}
                      onChange={(e) => setFormData({ ...formData, certificateFeeDefault: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-emerald-900"
                    />
                    <span>টাকা</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'নাগরিকত্ব ও পরিচয়', defaultFee: 50 },
                    { key: 'উত্তরাধিকার ও ওয়ারিশান', defaultFee: 100 },
                    { key: 'চারিত্রিক ও প্রত্যয়ন', defaultFee: 50 },
                    { key: 'সম্পত্তি ও ভূমি সংক্রান্ত', defaultFee: 100 },
                    { key: 'বিবিধ ও অন্যান্য', defaultFee: 50 }
                  ].map((cat) => (
                    <div key={cat.key} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{cat.key}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-500">৳</span>
                        <input
                          type="number"
                          value={formData.categoryFees?.[cat.key] ?? cat.defaultFee}
                          onChange={(e) => {
                            const newFees = { ...(formData.categoryFees || {}), [cat.key]: parseInt(e.target.value) || 0 };
                            setFormData({ ...formData, categoryFees: newFees });
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-extrabold text-emerald-900 text-right focus:bg-white focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গোলাকার সিলের টেক্সট (Seal Text)
                </label>
                <input
                  type="text"
                  value={formData.sealText}
                  onChange={(e) => setFormData({ ...formData, sealText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-bold text-emerald-900"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableHeaderInPrint}
                    onChange={(e) => setFormData({ ...formData, enableHeaderInPrint: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    প্রিন্ট কপিতে সরকারি ডিজিটাল হেডার ডিফল্টভাবে দৃশ্যমান রাখুন
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Google Workspace Integration */}
        {activeTab === 'workspace' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>গুগল ডক্স টেমপ্লেট, ড্রাইভার ও শিট আইডি কনফিগারেশন</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Docs টেমপ্লেট আইডি (TEMPLATE_DOC_ID)
                </label>
                <input
                  type="text"
                  value={formData.templateDocId}
                  onChange={(e) => setFormData({ ...formData, templateDocId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Drive সেভ ফোল্ডার আইডি (TARGET_FOLDER_ID)
                </label>
                <input
                  type="text"
                  value={formData.targetFolderId}
                  onChange={(e) => setFormData({ ...formData, targetFolderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Sheets ডাটাবেস আইডি (SHEET_ID)
                </label>
                <input
                  type="text"
                  value={formData.sheetId}
                  onChange={(e) => setFormData({ ...formData, sheetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script WebApp URL (exec)
                </label>
                <input
                  type="text"
                  value={formData.appsScriptUrl || ''}
                  onChange={(e) => setFormData({ ...formData, appsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Cloudflare R2 / S3 Storage */}
        {activeTab === 'r2' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-700" />
                <span>Cloudflare R2 / S3 অবজেক্ট স্টোরেজ শংসাপত্র</span>
              </h3>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>সক্রিয় সংযোগ</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={formData.r2AccountId || '8145fd7882d729f182b85e7c18c1a5f0'}
                  onChange={(e) => setFormData({ ...formData, r2AccountId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Access Key ID
                </label>
                <input
                  type="text"
                  value={formData.r2AccessKeyId || '26d4ea0bfd548258646061ba6d80d57d'}
                  onChange={(e) => setFormData({ ...formData, r2AccessKeyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Secret Access Key
                </label>
                <input
                  type="password"
                  value={formData.r2SecretAccessKey || 'b4c85f0e7c2937703376d89fb7d2a880cb2aa00631fcb8c32c8aa3d6612db94f'}
                  onChange={(e) => setFormData({ ...formData, r2SecretAccessKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  S3 API Endpoint URL
                </label>
                <input
                  type="text"
                  value={formData.r2Endpoint || 'https://8145fd7882d729f182b85e7c18c1a5f0.r2.cloudflarestorage.com'}
                  onChange={(e) => setFormData({ ...formData, r2Endpoint: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Storage Bucket Name
                </label>
                <input
                  type="text"
                  value={formData.r2BucketName || 'certificates-storage'}
                  onChange={(e) => setFormData({ ...formData, r2BucketName: e.target.value })}
                  placeholder="certificates-storage"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI & Gemini System Prompts */}
        {activeTab === 'ai' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Gemini AI সিস্টেম প্রম্পট ও কাস্টম এপিআই কি</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gemini AI সিস্টেম প্রম্পট প্রেফিক্স (Zero-Fluff Rules)
                </label>
                <textarea
                  rows={4}
                  value={formData.defaultPromptPrefix}
                  onChange={(e) => setFormData({ ...formData, defaultPromptPrefix: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাস্টম Gemini API Key (যদি নিজে পরিবর্তন করিতে চান)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="AQ.Ab8RN6Ki-YLREscKL..."
                    value={formData.geminiApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  ফাঁকা রাখিলে সিস্টেমের ডিফল্ট এপিআই কী ব্যবহৃত হইবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Certificate Types Customizer */}
        {activeTab === 'types' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>৪০+ প্রাতিষ্ঠানিক প্রত্যয়নপত্রের ধরন ও প্রম্পট টিউনিং</span>
                </h3>
                <p className="text-xs text-slate-500">
                  যেকোনো সনদের এআই প্রম্পট নির্দেশনা বা তথ্য ক্ষেত্রগুলো পর্যবেক্ষণ করুন।
                </p>
              </div>

              <input
                type="text"
                placeholder="সনদ খুঁজুন..."
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type List Selector */}
              <div className="max-h-80 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl bg-slate-50">
                {CERTIFICATE_TYPES.filter(t => t.label.includes(certSearch) || t.category.includes(certSearch)).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setSelectedCertKey(t.key);
                      setEditingCertPrompt(t.promptInstruction || '');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                      selectedCertKey === t.key
                        ? 'bg-emerald-800 text-white shadow'
                        : 'bg-white text-slate-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{t.label}</span>
                    {selectedCertKey === t.key && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </button>
                ))}
              </div>

              {/* Type Details & Prompt Editor */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950">{selectedCertType.label}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {selectedCertType.category}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gemini AI প্রম্পট গাইডলাইন (বাংলায়)
                  </label>
                  <textarea
                    rows={4}
                    value={editingCertPrompt || selectedCertType.promptInstruction || ''}
                    onChange={(e) => setEditingCertPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {selectedCertType.simpleFields && selectedCertType.simpleFields.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      সংযুক্ত ডায়নামিক ফিল্ডসমূহ:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCertType.simpleFields.map(f => (
                        <span key={f.key} className="px-2 py-1 bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded">
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Status Notification */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>কনফিগারেশন পরিবর্তন সফলভাবে সংরক্ষিত ও আপডেট করা হইয়াছে!</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>সেভ হইতেছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>মাস্টার কনফিগারেশন সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>
      )}

      {/* TAB 9: API & Webhook Integration Section */}
      {activeTab === 'api_webhook' && (
        <div className="space-y-6">
          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700/80 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-extrabold">
                  <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>REST API & Webhook Realtime Dispatch System (v2.5.0)</span>
                </div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <span>API ও ওয়েবহুক (API & Webhook) তথ্য আদান-প্রদান ব্যবস্থাপনা</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  অন্যান্য প্রতিষ্ঠান, ব্যাঙ্ক, এনআইডি সার্ভিস, গুগল ড্রাইভ, অথবা মোবাইল অ্যাপ্লিকেশনের সাথে তথ্য শেয়ার করতে সিক্রেট API Key জেনারেট করুন এবং নতুন সনদ তৈরি/অনুমোদনের সাথে সাথে রিয়েল-টাইমে ওয়েবহুক নোটিফিকেশন পাঠান।
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shrink-0 text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-4 text-slate-200">
                  <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-300" /> সক্রিয় API Keys:</span>
                  <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {apiKeysList.filter(k => k.status === 'active').length} টি সক্রিয়
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-slate-200">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-300" /> ওয়েবহুক এন্ডপয়েন্ট:</span>
                  <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {webhooksList.length} টি সংযুক্ত
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: API Key Management */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                  <Key className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">১. এপিআই অ্যাক্সেস কী (API Access Keys)</h4>
                  <p className="text-xs text-slate-500">তৃতীয় পক্ষকে তথ্য শেয়ার করার জন্য নিরাপদ টোকেন জেনারেট করুন</p>
                </div>
              </div>
            </div>

            {/* Form to generate new Key */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6 space-y-1">
                <label className="text-xs font-extrabold text-slate-700">API Key-এর নাম / ক্লায়েন্ট বর্ণনা:</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="যেমন: সোনালী ব্যাংক যাচাইকরণ পোর্টাল / UDC Mobile App"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-extrabold text-slate-700">অনুমতি (Permissions):</label>
                <select
                  value={newKeyPerm}
                  onChange={(e: any) => setNewKeyPerm(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="read">Read Only (শুধু তথ্য পড়া/যাচাই)</option>
                  <option value="write">Read-Write (তথ্য ও আবেদন জমা)</option>
                  <option value="admin">Full Admin (সম্পূর্ণ অ্যাক্সেস)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleGenerateApiKey}
                  disabled={isGeneratingKey}
                  className="w-full px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingKey ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>নতুন API Key তৈরি করুন</span>
                </button>
              </div>
            </div>

            {/* Table of generated API Keys */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">কী-এর নাম / সার্ভিস</th>
                    <th className="p-3">API Access Key</th>
                    <th className="p-3">অনুমতি</th>
                    <th className="p-3">তৈরির তারিখ</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apiKeysList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4 text-slate-400">
                        কোনো API Key পাওয়া যায় নাই। নতুন API Key তৈরি করুন।
                      </td>
                    </tr>
                  ) : (
                    apiKeysList.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">{key.name}</td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">
                          <div className="flex items-center gap-2">
                            <span>{key.key}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(key.key);
                                setCopiedKeyId(key.id);
                                setTimeout(() => setCopiedKeyId(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition cursor-pointer"
                              title="কপি করুন"
                            >
                              {copiedKeyId === key.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold uppercase border ${
                            key.permissions === 'admin' 
                              ? 'bg-purple-100 text-purple-800 border-purple-200' 
                              : key.permissions === 'write' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {key.permissions}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(key.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold ${
                            key.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {key.status === 'active' ? 'সক্রিয় (Active)' : 'বাতিল (Revoked)'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {key.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeApiKey(key.id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Webhook Dispatcher System */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                  <Radio className="w-5 h-5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">২. ওয়েবহুক নোটিফিকেশন সিস্টেম (Webhook Dispatcher)</h4>
                  <p className="text-xs text-slate-500">সনদ তৈরি, অনুমোদন বা বাতিলের সাথে সাথে বাহ্যিক সার্ভার/গুগল শিটে রিয়েল-টাইম HTTP POST বার্তা পাঠান</p>
                </div>
              </div>
            </div>

            {/* Form to add Webhook Endpoint */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Webhook নাম:</label>
                  <input
                    type="text"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    placeholder="যেমন: Google Sheet Apps Script Webhook"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-5 space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Target Webhook Endpoint URL:</label>
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs font-extrabold text-slate-700">Secret Signature Key (Optional):</label>
                  <input
                    type="password"
                    value={newWebhookSecret}
                    onChange={(e) => setNewWebhookSecret(e.target.value)}
                    placeholder="X-UP-Webhook-Secret"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Event Subscriptions Checkboxes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="text-slate-500">ট্রিগার ইভেন্টসমূহ:</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWebhookEvents.includes('certificate.created')}
                      onChange={(e) => {
                        if (e.target.checked) setNewWebhookEvents([...newWebhookEvents, 'certificate.created']);
                        else setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== 'certificate.created'));
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>আবেদন জমা (certificate.created)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWebhookEvents.includes('certificate.approved')}
                      onChange={(e) => {
                        if (e.target.checked) setNewWebhookEvents([...newWebhookEvents, 'certificate.approved']);
                        else setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== 'certificate.approved'));
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>চেয়ারম্যান অনুমোদন (certificate.approved)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWebhookEvents.includes('certificate.cancelled')}
                      onChange={(e) => {
                        if (e.target.checked) setNewWebhookEvents([...newWebhookEvents, 'certificate.cancelled']);
                        else setNewWebhookEvents(newWebhookEvents.filter(ev => ev !== 'certificate.cancelled'));
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>আবেদন বাতিল (certificate.cancelled)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestWebhookPing()}
                    disabled={isTestingWebhook || !newWebhookUrl}
                    className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isTestingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>টেস্ট পিং পাঠান (Test Ping)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddWebhook}
                    disabled={isSavingWebhook || !newWebhookUrl}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" /> : <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                    <span>Webhook সেভ করুন</span>
                  </button>
                </div>
              </div>

              {webhookTestFeedback && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>{webhookTestFeedback}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              )}
            </div>

            {/* Active Webhooks List & Delivery History Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box A: Registered Webhooks */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs text-slate-700 flex items-center justify-between">
                  <span>নিবন্ধিত Webhook এন্ডপয়েন্টসমূহ:</span>
                  <span className="text-slate-400 font-normal">({webhooksList.length} টি)</span>
                </h5>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {webhooksList.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-center rounded-xl text-xs text-slate-400 border border-slate-200">
                      কোনো Webhook এন্ডপয়েন্ট নিবন্ধিত নাই। উপরে URL দিয়ে নতুন Webhook যুক্ত করুন।
                    </div>
                  ) : (
                    webhooksList.map((wh) => (
                      <div key={wh.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900">{wh.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                              {wh.enabled ? 'Active' : 'Disabled'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteWebhook(wh.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-1.5 rounded border border-slate-200">
                          {wh.url}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>ইভেন্টসমূহ: {wh.events.join(', ')}</span>
                          <button
                            type="button"
                            onClick={() => handleTestWebhookPing(wh.id, wh.url, wh.secret)}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> পিং দিন
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box B: Realtime Webhook Delivery Logs */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs text-slate-700 flex items-center justify-between">
                  <span>ডেলিভারি হিস্ট্রি লগ (Delivery History):</span>
                  <button onClick={fetchApiAndWebhookData} className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-bold">
                    <RefreshCw className="w-3 h-3" /> রিফ্রেশ
                  </button>
                </h5>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {webhookLogsList.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-center rounded-xl text-xs text-slate-400 border border-slate-200">
                      কোনো ওয়েবহুক ডেলিভারি লগ পাওয়া যায় নাই।
                    </div>
                  ) : (
                    webhookLogsList.map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            HTTP {log.httpStatus || 'ERR'} {log.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-slate-300 truncate">{log.payloadSummary}</p>
                        <p className="text-[10px] text-slate-400 truncate">{log.url}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive API Documentation & Code Playground */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">৩. ইন্টারঅ্যাক্টিভ API ডকুমেন্টেশন ও কোড স্নিপেট (API Code Integration)</h4>
                  <p className="text-xs text-slate-300">যেকোনো ভাষায় সহজে ইন্টিগ্রেশনের জন্য রেডিমেড কোড উদাহরণ কাস্টমাইজ করে সরাসরি ব্যবহার করুন</p>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                {(['curl', 'fetch', 'gas', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedCodeTab(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCodeTab === lang
                        ? 'bg-emerald-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'curl' && 'cURL'}
                    {lang === 'fetch' && 'JS Fetch'}
                    {lang === 'gas' && 'Apps Script'}
                    {lang === 'python' && 'Python'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Display Canvas */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3 relative overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                <span>
                  {selectedCodeTab === 'curl' && 'cURL Terminal Request Sample'}
                  {selectedCodeTab === 'fetch' && 'JavaScript / Node.js Fetch Code'}
                  {selectedCodeTab === 'gas' && 'Google Apps Script Integration (Gemini.gs / Code.gs)'}
                  {selectedCodeTab === 'python' && 'Python Requests Integration'}
                </span>
                <span className="text-amber-400 font-bold">API Endpoint: /api/v1/certificates</span>
              </div>

              <pre className="text-emerald-300 whitespace-pre leading-relaxed font-mono">
                {selectedCodeTab === 'curl' && `
# 1. Query Certificate List by NID / Ward
curl -X GET "${window.location.origin}/api/v1/certificates?wardNo=05" \\
  -H "x-api-key: ${apiKeysList[0]?.key || 'up_live_7a8f9021b453e18c90'}"

# 2. Public Certificate Instant Verification
curl -X GET "${window.location.origin}/api/v1/certificates/verify/BUP-2026-1082"

# 3. External Application Submission
curl -X POST "${window.location.origin}/api/v1/certificates/apply" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeysList[0]?.key || 'up_live_7a8f9021b453e18c90'}" \\
  -d '{
    "typeKey": "citizenship",
    "name": "মোঃ জহিরুল ইসলাম",
    "father": "হাজী আজগর আলী",
    "mother": "আয়েশা খাতুন",
    "gender": "পুরুষ",
    "village": "বহেড়াতৈল",
    "wardNo": "০৫",
    "nid": "1994203918"
  }'
                `.trim()}

                {selectedCodeTab === 'fetch' && `
// JavaScript Fetch Example for External App Integration
const API_KEY = "${apiKeysList[0]?.key || 'up_live_7a8f9021b453e18c90'}";
const BASE_URL = "${window.location.origin}";

async function verifyCertificate(memoNo) {
  const response = await fetch(\`\${BASE_URL}/api/v1/certificates/verify/\${memoNo}\`);
  const data = await response.json();
  console.log("Certificate Valid:", data.isValid, data);
  return data;
}

async function submitApplication(citizenData) {
  const response = await fetch(\`\${BASE_URL}/api/v1/certificates/apply\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify(citizenData)
  });
  return await response.json();
}
                `.trim()}

                {selectedCodeTab === 'gas' && `
// Google Apps Script (Code.gs) Integration Function
function fetchUPCertificates() {
  const apiKey = "${apiKeysList[0]?.key || 'up_live_7a8f9021b453e18c90'}";
  const url = "${window.location.origin}/api/v1/certificates";
  
  const options = {
    method: "get",
    headers: { "x-api-key": apiKey },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  Logger.log("Total Records: " + json.totalCount);
  return json.data;
}
                `.trim()}

                {selectedCodeTab === 'python' && `
import requests

API_KEY = "${apiKeysList[0]?.key || 'up_live_7a8f9021b453e18c90'}"
BASE_URL = "${window.location.origin}"

# Fetch Certificate List
headers = {"x-api-key": API_KEY}
res = requests.get(f"{BASE_URL}/api/v1/certificates?status=issued", headers=headers)
print("Response JSON:", res.json())
                `.trim()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Apps Script Code Modal */}
      <AppsScriptModal isOpen={isAppsScriptOpen} onClose={() => setIsAppsScriptOpen(false)} />

      {/* Full Project Clone & Deployment Wizard Modal */}
      {showCloneWizard && clonePackageData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">প্রজেক্ট রিস্টোর ও মাল্টি-ইউনিয়ন ক্লোনিং উইজার্ড</h3>
                  <p className="text-xs text-emerald-200">ব্যাকআপ ফাইল থেকে নতুন ইউনিয়ন পরিষদ হিসেবে প্রজেক্টটি সক্রিয় করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloneWizard(false)}
                className="p-1.5 hover:bg-emerald-900 text-slate-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-800">
              {/* Option Mode Selector */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900">আপনি কোন মোডে ফাইলটি ইমপোর্ট বা রান করিতে চান?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCloneMode('NEW_UNION_CLONE')}
                    className={`p-3 rounded-xl border text-left font-bold transition flex items-center justify-between cursor-pointer ${
                      cloneMode === 'NEW_UNION_CLONE'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">১. নতুন ইউনিয়ন পরিষদ ক্লোনিং</p>
                      <p className="text-[10px] opacity-80 font-normal">নতুন ইউপির নাম দিয়ে নতুন সিস্টেমে রূপান্তর</p>
                    </div>
                    {cloneMode === 'NEW_UNION_CLONE' && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCloneMode('EXACT_RESTORE')}
                    className={`p-3 rounded-xl border text-left font-bold transition flex items-center justify-between cursor-pointer ${
                      cloneMode === 'EXACT_RESTORE'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">২. হুবহু ডাটাবেস ও সিস্টেম রিস্টোর</p>
                      <p className="text-[10px] opacity-80 font-normal">পুরাতন ইউপির ডাটাবেস সম্পূর্ণ উদ্ধার</p>
                    </div>
                    {cloneMode === 'EXACT_RESTORE' && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Form Fields for NEW_UNION_CLONE Mode */}
              {cloneMode === 'NEW_UNION_CLONE' ? (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                  <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>নতুন ইউনিয়ন পরিষদের তথ্যসমূহ প্রদান করুন:</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">নতুন ইউনিয়নের নাম:</label>
                      <input
                        type="text"
                        value={cloneUnionName}
                        onChange={(e) => setCloneUnionName(e.target.value)}
                        placeholder="যেমন: ০১নং বাঘুটিয়া ইউনিয়ন পরিষদ"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-emerald-950 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">উপজেলা:</label>
                      <input
                        type="text"
                        value={cloneUpazila}
                        onChange={(e) => setCloneUpazila(e.target.value)}
                        placeholder="যেমন: সখিপুর"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">জেলা:</label>
                      <input
                        type="text"
                        value={cloneDistrict}
                        onChange={(e) => setCloneDistrict(e.target.value)}
                        placeholder="যেমন: টাঙ্গাইল"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">চেয়ারম্যানের নাম:</label>
                      <input
                        type="text"
                        value={cloneChairman}
                        onChange={(e) => setCloneChairman(e.target.value)}
                        placeholder="যেমন: মোঃ কামরুল ইসলাম"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">নতুন গুগল শিট আইডি (ঐচ্ছিক):</label>
                      <input
                        type="text"
                        value={cloneSheetId}
                        onChange={(e) => setCloneSheetId(e.target.value)}
                        placeholder="Google Sheet ID"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">নতুন ড্রাইভ ফোল্ডার আইডি (ঐচ্ছিক):</label>
                      <input
                        type="text"
                        value={cloneFolderId}
                        onChange={(e) => setCloneFolderId(e.target.value)}
                        placeholder="Google Drive Folder ID"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>হুবহু রিস্টোর সতর্কবার্তা:</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    এই মোডে ব্যাকআপ ফাইলে থাকা পূর্বের সকল নাগরিক তথ্য, সনদ এবং কনফিগারেশন পুনরায় ডাটাবেসে রিস্টোর হইবে।
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCloneWizard(false)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition cursor-pointer"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                onClick={handleExecuteCloneImport}
                disabled={isImportingClone}
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isImportingClone ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>ক্লোনিং সক্রিয় হইতেছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>ক্লোন রান ও প্রজেক্ট সেটআপ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
