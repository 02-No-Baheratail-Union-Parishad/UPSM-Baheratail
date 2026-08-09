import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  LogIn, 
  Copy, 
  Check, 
  Database,
  ArrowRight,
  ShieldCheck,
  Table,
  Zap,
  Download,
  Code
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { signInWithGooglePopupForWorkspace, getGoogleAccessToken, formatFirebaseAuthError } from '../firebase';
import { syncLogsToGoogleSpreadsheet, createGoogleSpreadsheet, formatCertificateToSheetRow } from '../lib/googleSheets';
import { sheetsSyncService, SyncServiceStatus } from '../services/sheetsSyncService';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: CertificateRecord[];
  config: UnionParishadConfig;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  logs,
  config
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getGoogleAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultSheetUrl, setResultSheetUrl] = useState<string | null>(null);
  const [resultSheetId, setResultSheetId] = useState<string | null>(config.sheetId || '');
  const [customSheetId, setCustomSheetId] = useState<string>(config.sheetId || '');
  const [webAppUrl, setWebAppUrl] = useState<string>(config.appsScriptUrl || '');
  const [syncMode, setSyncMode] = useState<'appsscript' | 'oauth' | 'csv'>('appsscript');
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState<boolean>(false);
  const [queueStatus, setQueueStatus] = useState<SyncServiceStatus>(sheetsSyncService.getStatus());

  useEffect(() => {
    const unsubscribe = sheetsSyncService.subscribeToSyncStatus((status) => {
      setQueueStatus(status);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = getGoogleAccessToken();
    if (token) {
      setAccessToken(token);
    }
    if (config.sheetId) {
      setCustomSheetId(config.sheetId);
      setResultSheetId(config.sheetId);
    }
    if (config.appsScriptUrl) {
      setWebAppUrl(config.appsScriptUrl);
    }
  }, [isOpen, config.sheetId, config.appsScriptUrl]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { user, accessToken: token } = await signInWithGooglePopupForWorkspace();
      setAccessToken(token);
      setUserEmail(user.email);
      setStatusMessage(`Google একাউন্ট (${user.email || 'অ্যাডমিন'}) দিয়ে সফলভাবে কানেক্টেড!`);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setErrorMessage('সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। স্প্রেডশিট সিঙ্কের জন্য গুগল সাইন-ইন সম্পন্ন করুন।');
      } else {
        console.error('Google Sign In Error:', err);
        setErrorMessage(formatFirebaseAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const executeAppsScriptSync = async () => {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      setErrorMessage('অনুগ্রহ করে সঠিক Google Apps Script WebApp URL প্রদান করুন (যেমন: https://script.google.com/macros/s/.../exec)');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('গুগল অ্যাপস স্ক্রিপ্ট (WebApp)-এর সাথে সংযোগ স্থাপন ও সিঙ্ক করা হচ্ছে...');

    try {
      const res = await fetch('/api/admin/apps-script-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: webAppUrl.trim(),
          sheetId: customSheetId || config.sheetId,
          logs
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(data.message || `সফলভাবে ${logs.length} টি নাগরিক আবেদন গুগল অ্যাপস স্ক্রিপ্টে সিঙ্ক হয়েছে!`);
        if (data.spreadsheetUrl) {
          setResultSheetUrl(data.spreadsheetUrl);
        }
      } else {
        throw new Error(data.message || 'Apps Script WebApp সিঙ্ক সম্পন্ন করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      console.error('Apps Script Sync Error:', err);
      setErrorMessage(err.message || 'Google Apps Script সিঙ্ক ত্রুটি। WebApp-এর পারমিশন "Anyone" করা আছে কিনা চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    let csvContent = "তারিখ,স্মারক নম্বর,ক্যাটাগরি,সনদের ধরন,আবেদনকারীর নাম,পিতা/স্বামী,মাতা,গ্রাম,ওয়ার্ড নং,NID/জন্ম নম্বর,মোবাইল,ফি,স্ট্যাটাস,সিঙ্ক সময়\n";
    logs.forEach(log => {
      const row = formatCertificateToSheetRow(log);
      csvContent += row.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Union_Citizen_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage('✓ ১৪ টি ফিল্ডসহ সম্পূর্ণ নাগরিক আবেদন রেজিস্টার CSV ফাইল ডাউনলোড হয়েছে!');
  };

  const executeSyncToSpreadsheet = async (sheetIdToUse?: string, createNew: boolean = false) => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      let activeToken = accessToken || getGoogleAccessToken();
      if (!activeToken) {
        // Attempt sign in if not authenticated yet
        try {
          const { accessToken: token, user } = await signInWithGooglePopupForWorkspace();
          activeToken = token;
          setAccessToken(token);
          setUserEmail(user.email);
        } catch (authErr: any) {
          if (authErr?.code === 'auth/popup-closed-by-user' || authErr?.message?.includes('popup-closed-by-user')) {
            setErrorMessage('সাইন-ইন পপআপ বন্ধ করার কারণে সিঙ্ক শুরু করা হয়নি।');
            return;
          }
          throw authErr;
        }
      }

      let targetId = sheetIdToUse || customSheetId;
      let sheetUrl = '';

      // If createNew is selected or no sheetId specified
      if (createNew || !targetId) {
        setStatusMessage('Google Drive-এ নতুন স্প্রেডশিট তৈরি করা হচ্ছে...');
        const newSheet = await createGoogleSpreadsheet(
          activeToken,
          `${config.upName || '০২নং বহেড়াতৈল ইউপি'} - নাগরিক আবেদন রেজিস্টার (২০২৬)`
        );
        targetId = newSheet.spreadsheetId;
        sheetUrl = newSheet.spreadsheetUrl;
        setCustomSheetId(targetId);
        setResultSheetId(targetId);
      }

      setStatusMessage(`Google Sheets API-এর মাধ্যমে ${logs.length} টি আবেদন রেকর্ড আপডেট করা হচ্ছে...`);

      // Try server-side proxy endpoint first, fallback to client-side Google API
      try {
        const res = await fetch('/api/admin/sheets-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({
            accessToken: activeToken,
            spreadsheetId: targetId,
            createNew: false,
            logs
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setResultSheetUrl(data.spreadsheetUrl);
          setResultSheetId(data.spreadsheetId);
          setStatusMessage(data.message || `সফলভাবে ${logs.length} টি রেকর্ড Google Sheet-এ সিঙ্ক হয়েছে!`);
          return;
        }
      } catch (proxyErr) {
        console.warn('Server proxy error, falling back to direct client API:', proxyErr);
      }

      // Direct client-side Google Sheets API call
      const syncResult = await syncLogsToGoogleSpreadsheet(activeToken, targetId, logs);
      setResultSheetUrl(syncResult.spreadsheetUrl);
      setResultSheetId(syncResult.spreadsheetId);
      setStatusMessage(syncResult.message);
    } catch (err: any) {
      console.error('Google Sheets Sync Failed:', err);
      setErrorMessage(err.message || 'Google Sheets-এ ডাটা এক্সপোর্ট করতে ত্রুটি দেখা দিয়েছে।');
    } finally {
      setLoading(false);
      setShowConfirmOverwrite(false);
    }
  };

  const handleStartSync = (createNew: boolean) => {
    if (!createNew && customSheetId) {
      // Prompt user confirmation for overwriting existing sheet data
      setShowConfirmOverwrite(true);
    } else {
      executeSyncToSpreadsheet(undefined, createNew);
    }
  };

  const handleCopyUrl = () => {
    if (resultSheetUrl) {
      navigator.clipboard.writeText(resultSheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Google Sheets & Apps Script কেন্দ্রিক ডাটা সিঙ্ক ম্যানেজার</span>
              </h3>
              <p className="text-xs text-emerald-200">
                গুগল অ্যাপস স্ক্রিপ্ট (WebApp), গুগল ড্রাইভে স্প্রেডশিট বা ফাইল এক্সপোর্টের মাধ্যমে সরাসরি সিঙ্ক করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Real-time Background Sync Queue Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h4 className="text-xs font-bold text-emerald-300">রিয়েল-টাইম অফলাইন সিঙ্ক কিউ (Background Sync Queue)</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                queueStatus.isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {queueStatus.isOnline ? '🌐 নেটওয়ার্ক সংযুক্ত (Online)' : '📡 অফলাইন (Offline)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">অফলাইন পেন্ডিং কিউ</span>
                <span className="text-base font-black text-amber-400">{queueStatus.pendingCount} টি আইটেম</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">সর্বশেষ সফল সিঙ্ক</span>
                <span className="text-[11px] font-bold text-emerald-300 block truncate">{queueStatus.lastSyncTime || 'এখনো হয়নি'}</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-semibold">স্ট্যাটাস</span>
                <span className="text-[11px] font-bold text-slate-200 block truncate">
                  {queueStatus.isSyncing ? '⏳ সিঙ্ক হচ্ছে...' : queueStatus.pendingCount > 0 ? '⚠️ ব্যাকগ্রাউন্ডে অপেক্ষমান' : '✓ সমলয় সম্পূর্ণ'}
                </span>
              </div>
            </div>

            {queueStatus.pendingCount > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <p className="text-[10px] text-slate-300">
                  ইন্টারনেট সচল হওয়া মাত্রই এই আইটেমগুলো স্বয়ংক্রিয়ভাবে গুগ্‌ল শিটে যুক্ত হবে।
                </p>
                <button
                  onClick={() => sheetsSyncService.processSyncQueue(config)}
                  disabled={queueStatus.isSyncing}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${queueStatus.isSyncing ? 'animate-spin' : ''}`} />
                  <span>এখনই সিঙ্ক করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Method Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setSyncMode('appsscript')}
              className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                syncMode === 'appsscript'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Apps Script WebApp</span>
            </button>

            <button
              onClick={() => setSyncMode('oauth')}
              className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                syncMode === 'oauth'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Google OAuth (API)</span>
            </button>

            <button
              onClick={() => setSyncMode('csv')}
              className={`py-2 px-3 text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                syncMode === 'csv'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>CSV / Excel এক্সপোর্ট</span>
            </button>
          </div>

          {/* Sync Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">সিঙ্কযোগ্য রেকর্ডস</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{logs.length} টি</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">স্প্রেডশিট ডেটাবেস</span>
              <span className="text-xs font-bold text-blue-950 block mt-1">Google Sheets (v4 / GAS)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider">অটো হেডার কলাম</span>
              <span className="text-xs font-bold text-amber-950 block mt-1">১৪ টি ফিল্ড (বাংলা)</span>
            </div>
          </div>

          {/* TAB 1: Apps Script WebApp Sync (Instant, No popup needed) */}
          {syncMode === 'appsscript' && (
            <div className="space-y-4 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950">
                    পদ্ধতি ১: Google Apps Script WebApp সিঙ্ক (কোনো সাইন-ইন পপআপ লাগে না)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    আপনার Google Doc/Sheet-এর সাথে যুক্ত Apps Script WebApp URL ব্যবহার করে ১-ক্লিকে সিঙ্ক করুন
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Google Apps Script WebApp URL (exec):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="যেমন: https://script.google.com/macros/s/AKfycb.../exec"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Apps Script-এ Deploy &gt; New deployment &gt; Web app (Who has access: Anyone) হিসেবে পোস্টকৃত লিঙ্ক বসান।
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={executeAppsScriptSync}
                  disabled={loading || !webAppUrl}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>গুগল অ্যাপস স্ক্রিপ্ট (WebApp) সিঙ্ক চালনা করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Google OAuth Direct API Sync */}
          {syncMode === 'oauth' && (
            <div className="space-y-4">
              {/* User Auth Status Banner */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold border border-emerald-300 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {accessToken ? (
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Google Auth কানেক্টেড {userEmail ? `(${userEmail})` : ''}
                        </span>
                      ) : (
                        <span className="text-amber-700">
                          Google OAuth একাউন্ট যুক্ত করা প্রয়োজন
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {accessToken 
                        ? 'Google Sheets & Drive.file পারমিশন সক্রিয় রয়েছে।' 
                        : 'প্রশাসনিক রিপোর্টিংয়ের জন্য আপনার Google একাউন্টের সাহায্যে সরাসরি স্প্রেডশিট সিঙ্ক করুন।'}
                    </p>
                  </div>
                </div>

                {!accessToken && (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>

              {/* Custom Sheet ID Input Section */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  বিদ্যমান Google Spreadsheet ID (ঐচ্ছিক):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="যেমন: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={customSheetId}
                    onChange={(e) => setCustomSheetId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  ফাঁকা রাখলে আপনার Google Drive-এ স্বয়ংক্রিয়ভাবে একটি নতুন Google Sheet তৈরি করে ডাটা জমা করা হবে।
                </p>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleStartSync(true)}
                  disabled={loading}
                  className="px-4 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                  )}
                  <span>১-ক্লিক নতুন Google Sheet তৈরি ও সিঙ্ক</span>
                </button>

                <button
                  onClick={() => handleStartSync(false)}
                  disabled={loading || !customSheetId}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  ) : (
                    <Table className="w-4 h-4 text-emerald-300" />
                  )}
                  <span>বিদ্যমান Google Sheet-এ সিঙ্ক করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Direct CSV/Excel Export & Open in Drive */}
          {syncMode === 'csv' && (
            <div className="space-y-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950">
                    পদ্ধতি ৩: সরাসরি CSV / Excel ফাইল এক্সপোর্ট ও Google Sheets-এ খোলা
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    সকল নাগরিক আবেদনের তথ্য Excel / CSV ফরম্যাটে ইন্সট্যান্ট ডাউনলোড করে Google Drive বা Excel এ সরাসরি ব্যবহার করুন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadCsv}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>সম্পূর্ণ নাগরিক রেজিস্টার CSV ডাউনলোড (১৪ ফিল্ড)</span>
                </button>

                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Google Sheets এ নতুন স্প্রেডশিট খুলুন ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* Status & Error Messages */}
          {statusMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs rounded-xl flex items-center gap-2 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">{errorMessage}</span>
                  {(errorMessage.includes('unauthorized-domain') || errorMessage.includes('Authorized Domains')) && (
                    <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] font-normal text-rose-900 space-y-2">
                      <p className="font-bold text-rose-900">
                        কীভাবে সমাধান করবেন (Firebase Auth Authorized Domain):
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-700">
                        <li>Google Firebase Console (upms-baheratail) ওপেন করুন</li>
                        <li>Authentication &gt; Settings &gt; Authorized domains পেজে যান</li>
                        <li>'Add domain' বাটনে ক্লিক করে বর্তমান অ্যাপ ডোমেইনটি পেস্ট করুন:</li>
                      </ol>

                      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-rose-300 font-mono text-[11px] text-slate-800">
                        <span className="truncate flex-1 font-bold">{typeof window !== 'undefined' ? window.location.hostname : ''}</span>
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(window.location.hostname);
                              setStatusMessage('✓ ডোমেইন কপি করা হয়েছে! Firebase Console-এ পেস্ট করে যোগ করুন।');
                              setTimeout(() => setStatusMessage(null), 4000);
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-sans text-[10px] font-bold rounded-lg transition cursor-pointer shrink-0"
                        >
                          ডোমেইন কপি
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Overwrite Confirmation Dialog */}
          {showConfirmOverwrite && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    বিদ্যমান Google Sheet আপডেটের নিশ্চিতকরণ
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    আপনি <code className="font-mono font-bold bg-amber-200 px-1 py-0.5 rounded">{customSheetId}</code> আইডিবিশিষ্ট Google Sheet-এর <code className="font-mono">Citizen_Logs</code> শিটটিতে {logs.length} টি আবেদন রেকর্ড আপডেট করতে যাচ্ছেন। আপনি কি নিশ্চিত?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmOverwrite(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={() => executeSyncToSpreadsheet(customSheetId, false)}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  হ্যাঁ, নিশ্চিত সিঙ্ক করুন
                </button>
              </div>
            </div>
          )}

          {/* Success Link Output Card */}
          {resultSheetUrl && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500/50 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Google Spreadsheet / Apps Script সফলভাবে সিঙ্ক হয়েছে!</span>
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'ইউআরএল কপি'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-emerald-950 truncate">
                {resultSheetUrl}
              </div>

              <div className="flex justify-end">
                <a
                  href={resultSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>Google Sheet-এ স্প্রেডশিট খুলুন ↗</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {config.upName} • Google Workspace & Apps Script Integration Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};

