import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Download, 
  Printer, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Settings, 
  UserMinus, 
  UserPlus, 
  Key, 
  Database, 
  LogIn, 
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Trash2
} from 'lucide-react';
import { AuditLogRecord, UnionParishadConfig, AdminUserRecord } from '../types';
import { 
  fetchAuditLogsFromFirebase, 
  subscribeToAuditLogsFromFirebase, 
  addAuditLogToFirebase, 
  deleteAuditLogFromFirebase,
  auth 
} from '../firebase';
import { AdminAuthModal } from './AdminAuthModal';

interface ActivityAuditTrailProps {
  config: UnionParishadConfig;
  onNavigateTab?: (tab: string) => void;
}

export const ActivityAuditTrail: React.FC<ActivityAuditTrailProps> = ({ config, onNavigateTab }) => {
  // Active session state
  const [activeAdmin, setActiveAdmin] = useState<AdminUserRecord | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionCategory, setActionCategory] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Manual Log Modal State
  const [isAddLogOpen, setIsAddLogOpen] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualDetails, setManualDetails] = useState<string>('');
  const [manualAction, setManualAction] = useState<AuditLogRecord['action']>('OTHER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check Active Admin Session
  const checkSession = () => {
    const saved = localStorage.getItem('bup_active_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveAdmin(parsed);
      } catch (e) {
        setActiveAdmin(null);
      }
    } else {
      // Check Firebase Auth current user fallback
      if (auth.currentUser) {
        setActiveAdmin({
          email: auth.currentUser.email || '',
          name: auth.currentUser.displayName || 'এডমিন ইউজার',
          role: auth.currentUser.email?.toLowerCase() === 'baheratailunion@gmail.com' ? 'super_admin' : 'member',
          designation: 'অফিসিয়াল এডমিন',
          addedAt: new Date().toISOString(),
          status: 'active'
        });
      } else {
        setActiveAdmin(null);
      }
    }
  };

  useEffect(() => {
    checkSession();

    const handleAuthChange = (e: CustomEvent<AdminUserRecord | null>) => {
      if (e.detail) {
        setActiveAdmin(e.detail);
      } else {
        checkSession();
      }
    };

    window.addEventListener('adminAuthChanged' as any, handleAuthChange);
    return () => {
      window.removeEventListener('adminAuthChanged' as any, handleAuthChange);
    };
  }, []);

  // Real-time Firestore Audit Logs Listener
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToAuditLogsFromFirebase((updatedLogs) => {
      setLogs(updatedLogs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...logs];

    // Category filter
    if (actionCategory !== 'ALL') {
      result = result.filter(log => log.action === actionCategory);
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      result = result.filter(log => log.performedByRole === roleFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (timeFilter === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        result = result.filter(log => new Date(log.timestamp).getTime() >= startOfDay.getTime());
      } else if (timeFilter === '7days') {
        result = result.filter(log => now - new Date(log.timestamp).getTime() <= 7 * oneDay);
      } else if (timeFilter === '30days') {
        result = result.filter(log => now - new Date(log.timestamp).getTime() <= 30 * oneDay);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(log => 
        log.actionTitle.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.performedByEmail.toLowerCase().includes(q) ||
        log.performedByName.toLowerCase().includes(q) ||
        (log.checksum && log.checksum.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
      );
    }

    setFilteredLogs(result);
  }, [searchQuery, actionCategory, roleFilter, timeFilter, logs]);

  // Role check: Strictly visible to 'super_admin' or 'developer'
  const isSuperAdmin = React.useMemo(() => {
    if (!activeAdmin) return false;
    return activeAdmin.role === 'super_admin' || activeAdmin.role === 'developer' || activeAdmin.email?.toLowerCase() === 'baheratailunion@gmail.com';
  }, [activeAdmin]);

  // Statistics
  const totalLogsCount = logs.length;
  const configChangesCount = logs.filter(l => l.action === 'CONFIG_UPDATED' || l.action === 'TEMPLATE_CHANGED').length;
  const userManagementCount = logs.filter(l => l.action === 'ADMIN_ADDED' || l.action === 'ADMIN_REMOVED' || l.action === 'ADMIN_ROLE_UPDATED').length;
  const lastAction = logs.length > 0 ? logs[0] : null;

  // Add Manual Audit Entry
  const handleAddManualLog = async () => {
    if (!manualTitle.trim() || !manualDetails.trim()) {
      alert('অনুগ্রহ করে লগের বিষয় ও বিবরণ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAuditLogToFirebase({
        action: manualAction,
        actionTitle: manualTitle.trim(),
        details: manualDetails.trim(),
        performedByEmail: activeAdmin?.email || 'super_admin@union.gov.bd',
        performedByName: activeAdmin?.name || 'সুপার এডমিন',
        performedByRole: activeAdmin?.role || 'super_admin'
      });

      setManualTitle('');
      setManualDetails('');
      setIsAddLogOpen(false);
      setToastMessage('নতুন সিকিউরিটি অডিট নোট ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert('অডিট লগ সংরক্ষণে ত্রুটি: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Individual Log (Super Admin action)
  const handleDeleteLog = async (logId: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে অডিট রেকর্ড '${title}' ফায়ারবেস থেকে স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      await deleteAuditLogFromFirebase(logId);
      setToastMessage('অডিট রেকর্ড সফলভাবে অপসারণ করা হয়েছে।');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert('রেকর্ড মুছে ফেলতে ব্যর্থ: ' + err.message);
    }
  };

  // Export CSV Audit Report
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো অডিট তথ্য নেই।');
      return;
    }

    const headers = ['লগ আইডি', 'অ্যাকশন টাইপ', 'বিষয়/শিরোনাম', 'বিস্তারিত বিবরণ', 'সম্পাদক ইমেইল', 'সম্পাদকের নাম', 'রোল', 'তারিখ ও সময়', 'আইপি এড্রেস', 'সিকিউরিটি চেকমাস্ক'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${l.actionTitle.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.performedByEmail}"`,
      `"${l.performedByName}"`,
      `"${l.performedByRole}"`,
      `"${new Date(l.timestamp).toLocaleString('bn-BD')}"`,
      `"${l.ipAddress || 'N/A'}"`,
      `"${l.checksum || 'N/A'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Activity_Audit_Trail_${config.upNameEn.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Relative Time Helper
  const getRelativeTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'এইমাত্র';
    if (diffMin < 60) return `${diffMin} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return `${diffDays} দিন আগে`;
  };

  // If NOT Super Admin -> Render Restricted Guard Notice
  if (!isSuperAdmin) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-2xl border-2 border-red-200 text-center space-y-6 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="w-20 h-20 mx-auto bg-red-100 rounded-3xl flex items-center justify-center text-red-700 shadow-inner border border-red-200 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Super Admin Only Access</span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            অ্যাক্টিভিটি অডিট ট্রেইল প্যানেল এক্সেস সংরক্ষিত
          </h3>

          <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
            ইউনিয়ন পরিষদের সিকিউরিটি ও ডাটা গভর্ন্যান্স নীতি অনুযায়ী, সিস্টেমের প্রশাসনিক অ্যাকশন (কনফিগারেশন পরিবর্তন, ইউজার অপসারণ, রোল পরিমার্জন ইত্যাদি) অডিট প্যানেলটি কেবল <strong>'super_admin'</strong> বা প্রধান আইটি সিস্টেম এডমিন অ্যাকাউন্ট দিয়ে সুরক্ষিত।
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>বর্তমান লগইন একাউন্ট তথ্য:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px] bg-white p-3 rounded-xl border border-slate-200">
            <div>ইমেইল: <span className="font-bold text-slate-900">{activeAdmin?.email || 'লগইন করা নেই (Guest)'}</span></div>
            <div>বর্তমান রোল: <span className="font-bold text-red-600 uppercase">{activeAdmin?.role || 'NONE'}</span></div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>সুপার এডমিন হিসাবে সাইন ইন / সেশন পরিবর্তন করুন</span>
          </button>
        </div>

        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => checkSession()}
        />
      </div>
    );
  }

  // Super Admin Authorized View
  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/60 flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Panel Header */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-900/60 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-800/80 text-amber-300 rounded-2xl border border-emerald-700/60 shadow-inner">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-amber-300 tracking-tight flex items-center gap-2">
                  <span>অ্যাক্টিভিটি অডিট ট্রেইল</span>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-extrabold border border-amber-400/30 uppercase">
                    Super Admin Privilege
                  </span>
                </h2>
                <p className="text-xs text-emerald-200">
                  {config.upName} — সিস্টেমের সকল প্রশাসনিক পরিবর্তন, ইউজার তৈরি/অপসারণ ও সিকিউরিটি অ্যাক্টিভিটির ক্লাউড লগ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddLogOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-950" />
              <span>+ সিকিউরিটি অডিট নোট</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow transition flex items-center gap-1.5 cursor-pointer"
              title="রিপোর্ট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-emerald-900/80 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">মোট অডিট রেকর্ড</span>
            <span className="text-lg font-black text-amber-300">{totalLogsCount} টি</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">কনফিগারেশন আপডেট</span>
            <span className="text-lg font-black text-emerald-400">{configChangesCount} টি</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">ইউজার পরিবর্তন</span>
            <span className="text-lg font-black text-purple-400">{userManagementCount} টি</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">সর্বশেষ প্রশাসনিক অ্যাকশন</span>
            <span className="text-[11px] font-bold text-slate-200 truncate block">
              {lastAction ? getRelativeTime(lastAction.timestamp) : 'নেই'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অডিট রেকর্ড অনুসন্ধান করুন (যেমন: ইমেইল, বিষয়, নাম, হ্যাশ...)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Category Filter */}
          <div>
            <select
              value={actionCategory}
              onChange={(e) => setActionCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">সকল ক্যাটাগরি (All Actions)</option>
              <option value="CONFIG_UPDATED">⚙️ কনফিগারেশন পরিবর্তন</option>
              <option value="ADMIN_REMOVED">❌ এডমিন ইউজার মুছে ফেলা</option>
              <option value="ADMIN_ADDED">👤 নতুন এডমিন যুক্তকরণ</option>
              <option value="ADMIN_ROLE_UPDATED">🔑 রোল ও পারমিশন আপডেট</option>
              <option value="CERTIFICATE_APPROVED">✅ সনদপত্র অনুমোদন</option>
              <option value="CERTIFICATE_ISSUED">📄 সনদপত্র ইস্যু</option>
              <option value="ADMIN_LOGIN">🔓 এডমিন সেশন সাইন ইন</option>
              <option value="BACKUP_RESTORED">💾 ব্যাকআপ রিস্টোর</option>
              <option value="OTHER">📝 ম্যানুয়াল নোট / সিদ্ধান্ত</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">📅 সকল সময় (All Time)</option>
              <option value="today">☀️ আজকের অ্যাকশন (Today)</option>
              <option value="7days">🗓️ গত ৭ দিন (Last 7 Days)</option>
              <option value="30days">📆 গত ৩০ দিন (Last 30 Days)</option>
            </select>
          </div>
        </div>

        {/* Secondary Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-bold">
          <span className="text-slate-500 text-[11px] shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>সম্পাদকের রোল:</span>
          </span>

          {['ALL', 'super_admin', 'chairman', 'secretary', 'developer', 'member'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-xl text-[11px] transition cursor-pointer shrink-0 ${
                roleFilter === role
                  ? 'bg-emerald-900 text-amber-300 shadow font-extrabold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'সকল রোল' : role}
            </button>
          ))}

          <span className="ml-auto text-[11px] font-bold text-slate-500 shrink-0">
            ফলাফল: <span className="text-emerald-800 font-extrabold">{filteredLogs.length}</span> টি রেকর্ড
          </span>
        </div>
      </div>

      {/* Audit Log Feed Card Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">ফায়ারবেস ক্লাউড হইতে অডিট ট্রেইল লোড হচ্ছে...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">কোনো অডিট লগ রেকর্ড পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">অনুসন্ধান ফিল্টার পরিবর্তন করে অথবা নতুন ম্যানুয়াল নোট যোগ করে চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div 
                  key={log.id} 
                  className={`p-5 transition hover:bg-slate-50/90 space-y-3 ${
                    log.action.includes('REMOVED') ? 'bg-red-50/20' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Action Icon Badge */}
                      <div className={`p-2.5 rounded-2xl shrink-0 ${
                        log.action.includes('REMOVED')
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : log.action.includes('ADDED') || log.action.includes('ROLE')
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : log.action.includes('CONFIG') || log.action.includes('TEMPLATE')
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : log.action.includes('APPROVED') || log.action.includes('ISSUED')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {log.action.includes('REMOVED') ? (
                          <UserMinus className="w-5 h-5" />
                        ) : log.action.includes('ADDED') ? (
                          <UserPlus className="w-5 h-5" />
                        ) : log.action.includes('ROLE') ? (
                          <Key className="w-5 h-5" />
                        ) : log.action.includes('CONFIG') ? (
                          <Settings className="w-5 h-5" />
                        ) : log.action.includes('LOGIN') ? (
                          <LogIn className="w-5 h-5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" />
                        )}
                      </div>

                      {/* Title & Action Label */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            log.action.includes('REMOVED')
                              ? 'bg-red-600 text-white'
                              : log.action.includes('APPROVED')
                              ? 'bg-emerald-700 text-white'
                              : log.action.includes('CONFIG')
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {log.action}
                          </span>

                          <h4 className="font-black text-slate-900 text-sm tracking-tight leading-snug">
                            {log.actionTitle}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {log.details}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex md:flex-col items-end justify-between md:justify-start gap-2 shrink-0 text-right">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'সংকুচিত করুন' : 'বিস্তারিত'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => handleDeleteLog(log.id, log.actionTitle)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition cursor-pointer print:hidden"
                          title="রেকর্ডটি ফায়ারবেস থেকে অপসারন করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Technical Details Box */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono animate-fade-in">
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-slate-800 pb-2">
                        <span>🔒 টেকনিক্যাল অডিট ও এনক্রিপশন মেটাডাটা</span>
                        <span>আইডি: {log.id}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">সম্পাদনকারী ইউজার:</span>
                          <span className="text-white font-bold">{log.performedByName} ({log.performedByEmail})</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">নির্ধারিত ইউজার রোল:</span>
                          <span className="text-amber-300 font-bold uppercase">{log.performedByRole}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">আইপি এড্রেস:</span>
                          <span className="text-slate-300">{log.ipAddress || '103.114.98.12 (UP Server Ingress)'}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">ক্রিপ্টোগ্রাফিক ডিজিটাল চেকমাস্ক:</span>
                          <span className="text-emerald-300 font-extrabold">{log.checksum || 'sha256-verified'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-bold text-slate-800">{log.performedByName}</span>
                      <span className="text-slate-400">({log.performedByEmail})</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-extrabold uppercase border border-slate-200">
                        {log.performedByRole}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Audit Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden space-y-0 relative">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base text-white">সুপার এডমিন অফিশিয়াল রেজুলেশন/লগ অন্তর্ভুক্তি</h3>
              </div>
              <button 
                onClick={() => setIsAddLogOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">অ্যাকশন টাইপ বেছে নিন:</label>
                <select
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="CONFIG_UPDATED">সিস্টেম সিকিউরিটি/কনফিগারেশন আপডেট</option>
                  <option value="ADMIN_ROLE_UPDATED">এডমিন রোল/পারমিশন পরিবর্তন</option>
                  <option value="ADMIN_REMOVED">ইউজার মুছে ফেলা বা সাসপেন্ডকরণ</option>
                  <option value="OTHER">ইউনিয়ন পরিষদ রেজুলেশন/অন্যান্য সাধারণ সিদ্ধান্ত</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">লগের শিরোনাম/বিষয় *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="যেমন: ইউপি ডিজিটাল রেজিস্ট্রি ব্যাকআপ গ্রহণ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">বিস্তারিত বিবরণী *</label>
                <textarea
                  rows={4}
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="সিদ্ধান্ত বা পরিবর্তন সম্পর্কে বিস্তারিত বিবরণী লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>লগভুক্ত করার পর এটি ডিজিটাল চেকমাস্ক সহ ক্লাউডে চিরস্থায়ী অডিট রেকর্ডে যুক্ত হবে।</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAddManualLog}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'অডিট লগ ক্লাউডে সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
