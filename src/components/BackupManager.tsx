import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  Cloud, 
  CheckCircle2, 
  Loader2, 
  Download, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  FileJson, 
  RotateCcw, 
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { sanitizeInput } from '../utils/security';
import { 
  exportFirestoreCollectionsToStorage, 
  fetchFirestoreBackupsFromFirebase, 
  restoreFullBackupToFirestore,
  FirestoreCollectionExportResult, 
  FirestoreBackupRecord 
} from '../firebase';

interface BackupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onExportSuccess?: (result: FirestoreCollectionExportResult) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  isOpen,
  onClose,
  onExportSuccess
}) => {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    'certificates', 
    'configs', 
    'apiKeys', 
    'webhooks', 
    'backups'
  ]);
  const [exportNotes, setExportNotes] = useState<string>('ডেভেলপার রোল: ফায়ারস্টোর ব্যাকআপ এক্সপোর্ট');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    stage: string;
    percent: number;
    currentCol?: string;
  } | null>(null);
  const [exportResult, setExportResult] = useState<FirestoreCollectionExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // History & Restore State
  const [backupsHistory, setBackupsHistory] = useState<FirestoreBackupRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const availableCollections = [
    { key: 'certificates', label: 'certificates (সনদপত্রসমূহের রেকর্ড)' },
    { key: 'configs', label: 'configs (ইউপি সিস্টেম কনফিগ)' },
    { key: 'apiKeys', label: 'apiKeys (এপিআই কী ট্র্যাকিং)' },
    { key: 'webhooks', label: 'webhooks (ওয়েবহুক কনফিগ ও লগ)' },
    { key: 'backups', label: 'backups (ব্যাকআপ হিস্টোরি স্ন্যাপশট)' },
    { key: 'citizens', label: 'citizens (নাগরিক তথ্য ডাটাবেস)' },
    { key: 'council_members', label: 'council_members (পরিষদ সদস্য)' },
    { key: 'notices', label: 'notices (নোটিশ বোর্ড)' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const records = await fetchFirestoreBackupsFromFirebase();
      setBackupsHistory(records);
    } catch (err) {
      console.warn('Error loading backup history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleCollection = (key: string) => {
    setSelectedCollections(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedCollections.length === availableCollections.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(availableCollections.map(c => c.key));
    }
  };

  const handleExecuteExport = async () => {
    if (selectedCollections.length === 0) {
      alert('কমপক্ষে একটি ফায়ারস্টোর কালেকশন নির্বাচন করুন!');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportResult(null);
    setExportProgress({ stage: 'ব্যাকআপ প্রক্রিয়া শুরু হচ্ছে...', percent: 5 });

    try {
      const sanitizedNotes = sanitizeInput(exportNotes, 500);
      const result = await exportFirestoreCollectionsToStorage(
        selectedCollections,
        sanitizedNotes,
        (progress) => {
          setExportProgress(progress);
        }
      );

      setExportResult(result);
      if (onExportSuccess) {
        onExportSuccess(result);
      }
      loadHistory();
    } catch (err: any) {
      console.error('Firestore Export Execution Error:', err);
      setExportError(err.message || 'ফায়ারস্টোর এক্সপোর্ট প্রসেস সম্পন্ন করা সম্ভব হয় নাই।');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadResultJson = () => {
    if (!exportResult) return;
    const jsonStr = JSON.stringify(exportResult.jsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackupFile = (bkp: FirestoreBackupRecord) => {
    if (bkp.downloadUrl) {
      window.open(bkp.downloadUrl, '_blank');
    } else if (bkp.backupData) {
      const jsonStr = JSON.stringify(bkp.backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = bkp.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('এই ফাইলের ডাউনলোড ইউআরএল পাওয়া যায় নাই।');
    }
  };

  const handleRestoreBackupRecord = async (bkp: FirestoreBackupRecord) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${bkp.filename}' ব্যাকআপ ডাটাবেসে রিস্টোর করতে চান?`)) {
      return;
    }

    setRestoringId(bkp.id);
    setRestoreStatusMsg(null);

    try {
      let payload = bkp.backupData;
      if (!payload && bkp.downloadUrl) {
        const res = await fetch(bkp.downloadUrl);
        payload = await res.json();
      }

      if (!payload) {
        throw new Error('ব্যাকআপ ফাইলের কনটেন্ট লোড করা সম্ভব হয় নাই।');
      }

      const res = await restoreFullBackupToFirestore(payload);
      setRestoreStatusMsg({
        text: `ডাটাবেস সফলভাবে রিস্টোর হয়েছে! মোট ${res.totalRestored} টি রেকর্ড আপডেট করা হয়েছে।`,
        type: 'success'
      });
    } catch (err: any) {
      setRestoreStatusMsg({
        text: 'রিস্টোর ত্রুটি: ' + (err.message || String(err)),
        type: 'error'
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-indigo-500/30">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl shrink-0">
              <Database className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                <span>🔥 ফায়ারস্টোর ডাটাবেস এক্সপোর্ট ও ক্লাউড ব্যাকআপ ম্যানেজার</span>
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold rounded border border-indigo-400/40">
                  Firebase Cloud Storage
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                নির্দিষ্ট কালেকশন সিলেক্ট করে JSON ব্যাকআপ তৈরি করুন এবং সরাসরি Firebase Cloud Storage-এ আপলোড ট্র্যাকিং করুন।
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Collection Selector & Export Trigger Form */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-indigo-200">
                ব্যাকআপের জন্য নির্দিষ্ট ফায়ারস্টোর কালেকশন নির্বাচন করুন:
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
              >
                {selectedCollections.length === availableCollections.length ? 'সব আনসিলেক্ট করুন' : 'সব সিলেক্ট করুন'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {availableCollections.map(col => {
                const isSelected = selectedCollections.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => handleToggleCollection(col.key)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="truncate">{col.key}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0 ml-1" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-500 rounded-full shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-1">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ব্যাকআপ নোট / বিবরণী:
                </label>
                <input
                  type="text"
                  value={exportNotes}
                  onChange={(e) => setExportNotes(e.target.value)}
                  placeholder="যেমন: ডেভেলপার ডাটাবেস এক্সপোর্ট..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={isExporting || selectedCollections.length === 0}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
              >
                {isExporting ? (
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

          {/* REAL-TIME PROGRESS BAR & STAGE NOTIFICATION */}
          {isExporting && exportProgress && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-amber-400/50 space-y-3 animate-fade-in shadow-2xl">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-amber-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>এক্সপোর্ট প্রোগ্রেস:</span>
                  <span className="text-white font-mono bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                    {exportProgress.stage}
                  </span>
                </span>
                <span className="text-amber-400 font-mono text-base font-black">
                  {exportProgress.percent}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden border border-slate-700 p-0.5 relative">
                <div
                  className="bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-md relative"
                  style={{ width: `${Math.max(5, exportProgress.percent)}%` }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>
                  {exportProgress.currentCol ? `বর্তমান কালেকশন: ${exportProgress.currentCol}` : 'প্রসেসিং...'}
                </span>
                <span>
                  {exportProgress.percent < 70 ? 'মেমরি হতে ফেচিং...' : exportProgress.percent < 90 ? 'Cloud Storage-এ আপলোডিং...' : 'লগ হিস্ট্রি রাইটিং...'}
                </span>
              </div>
            </div>
          )}

          {/* Export Error */}
          {exportError && (
            <div className="bg-rose-950/90 text-rose-200 p-4 rounded-xl border border-rose-500/50 flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* EXPORT COMPLETED RESULT DISPLAY */}
          {exportResult && (
            <div className="bg-emerald-950/90 p-5 rounded-2xl border border-emerald-500/60 space-y-3 animate-fade-in shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-xs text-white">
                    ফায়ারস্টোর এক্সপোর্ট সম্পন্ন! মোট {exportResult.totalDocuments} টি ডকুমেন্ট ({exportResult.sizeKb} KB)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-amber-300">
                  {exportResult.filename}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                {Object.entries(exportResult.collections).map(([col, count]) => (
                  <span key={col} className="px-2.5 py-1 bg-emerald-900/90 text-emerald-200 border border-emerald-600/50 rounded-lg font-mono">
                    {col}: <strong>{count}</strong> docs
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadResultJson}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON ব্যাকআপ ডাউনলোড করুন</span>
                </button>

                {exportResult.downloadUrl ? (
                  <a
                    href={exportResult.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Cloud className="w-4 h-4 text-amber-300" />
                    <span>Firebase Cloud Storage ফাইল ভিউ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-300 font-mono">
                    * Storage Path: {exportResult.storagePath || 'backups/firestore_exports/' + exportResult.filename}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Restore status message */}
          {restoreStatusMsg && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              restoreStatusMsg.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
                : 'bg-rose-950 text-rose-200 border-rose-500/50'
            }`}>
              {restoreStatusMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{restoreStatusMsg.text}</span>
            </div>
          )}

          {/* BACKUP HISTORY LIST */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-300" />
                  <span>সংরক্ষিত ফায়ারস্টোর ক্লাউড ব্যাকআপ হিস্টোরি</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Firebase Cloud Storage-এ সংরক্ষিত সকল এক্সপোর্ট ফাইল ডাউনলোড বা সরাসরি ডাটাবেসে রিস্টোর করুন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 w-40 sm:w-52"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadHistory}
                  disabled={isLoadingHistory}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>রিফ্রেশ</span>
                </button>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="p-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>ক্লাউড ব্যাকআপ হিস্টোরি লোড হচ্ছে...</span>
              </div>
            ) : backupsHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
                কোনো ক্লাউড ব্যাকআপ রেকর্ড পাওয়া যায় নাই।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-300 font-bold border-b border-slate-700">
                      <th className="p-3">তারিখ ও সময়</th>
                      <th className="p-3">ফাইল নাম ও নোটস</th>
                      <th className="p-3 text-center">রেকর্ড সংখ্যা</th>
                      <th className="p-3 text-center">সাইজ</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium text-slate-200">
                    {backupsHistory
                      .filter(b => {
                        if (!searchTerm.trim()) return true;
                        const q = searchTerm.toLowerCase();
                        return (
                          (b.filename && b.filename.toLowerCase().includes(q)) ||
                          (b.notes && b.notes.toLowerCase().includes(q)) ||
                          (b.storagePath && b.storagePath.toLowerCase().includes(q))
                        );
                      })
                      .map((bkp) => (
                        <tr key={bkp.id} className="hover:bg-slate-700/40 transition">
                          <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                            {new Date(bkp.timestamp).toLocaleString('bn-BD')}
                          </td>

                          <td className="p-3 max-w-xs">
                            <div className="font-mono font-bold text-amber-300 flex items-center gap-1.5 truncate">
                              <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="truncate" title={bkp.filename}>{bkp.filename}</span>
                            </div>
                            {bkp.notes && (
                              <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5" title={bkp.notes}>
                                {bkp.notes}
                              </p>
                            )}
                          </td>

                          <td className="p-3 text-center font-bold text-white whitespace-nowrap">
                            {bkp.recordsCount || 0} টি
                          </td>

                          <td className="p-3 text-center font-mono text-slate-300 whitespace-nowrap">
                            {bkp.sizeKb >= 1024 ? `${(bkp.sizeKb / 1024).toFixed(2)} MB` : `${bkp.sizeKb || 12} KB`}
                          </td>

                          <td className="p-3 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadBackupFile(bkp)}
                              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-600"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-300" />
                              <span>ডাউনলোড</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRestoreBackupRecord(bkp)}
                              disabled={restoringId === bkp.id}
                              className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-amber-300 disabled:opacity-50"
                            >
                              {restoringId === bkp.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                              )}
                              <span>রিস্টোর</span>
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

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Firebase Firestore & Cloud Storage Native Backup Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
