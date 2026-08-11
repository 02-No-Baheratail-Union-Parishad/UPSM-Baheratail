import React, { useState, useEffect } from 'react';
import { 
  useAuth, 
  UserRole 
} from '../hooks/useAuth';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  FileText, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Scan, 
  Eye, 
  Users, 
  Building2, 
  CreditCard, 
  Database, 
  Sparkles, 
  Key, 
  ChevronRight, 
  ArrowRight,
  FileSpreadsheet,
  QrCode,
  User,
  Zap
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';

export interface DashboardItem {
  id: string;
  trackingId: string;
  certificateType: string;
  applicantName: string;
  fatherName?: string;
  motherName?: string;
  village: string;
  wardNo: string;
  applicantNid?: string;
  mobileNo?: string;
  issueDate: string;
  status: 'pending_approval' | 'approved' | 'issued' | 'revoked' | 'cancelled' | 'draft';
  generatedText?: string;
}

interface DashboardProps {
  config: UnionParishadConfig;
  onNavigateTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ config, onNavigateTab }) => {
  const { session, role, switchRole } = useAuth();

  // Selected Dashboard Role View (defaults to logged-in user's role)
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(role);

  useEffect(() => {
    setActiveRoleView(role);
  }, [role]);

  // Toast Notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- MOCK / LIVE DATA STATES ---
  // UDC Queue State
  const [udcQueue, setUdcQueue] = useState<DashboardItem[]>(sampleUdcQueueList);
  const [udcSearch, setUdcSearch] = useState<string>('');
  const [udcStatusFilter, setUdcStatusFilter] = useState<string>('all');

  // Citizen My Documents State
  const [myDocuments, setMyDocuments] = useState<DashboardItem[]>(sampleCitizenDocs);
  const [citizenSearch, setCitizenSearch] = useState<string>('');
  const [trackingIdInput, setTrackingIdInput] = useState<string>('');
  const [searchedDoc, setSearchedDoc] = useState<DashboardItem | null>(null);

  // Secretary / Chairman Pending Approval State
  const [pendingApprovals, setPendingApprovals] = useState<DashboardItem[]>(samplePendingList);
  const [approvalSearch, setApprovalSearch] = useState<string>('');
  const [approvedTodayCount, setApprovedTodayCount] = useState<number>(18);
  const [pendingCount, setPendingCount] = useState<number>(12);

  // Selected Record Preview Modal
  const [previewCert, setPreviewCert] = useState<DashboardItem | null>(null);

  // Load Initial Live Data
  useEffect(() => {
    // Fetch Pending List from Server if available
    fetch('/api/admin/pending')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.pending) && data.pending.length > 0) {
          const mapped: DashboardItem[] = data.pending.map((p: CertificateRecord) => ({
            id: p.id || p.memoNo,
            trackingId: p.memoNo || `TRK-2026-${p.id}`,
            certificateType: p.typeLabel || p.category || 'নাগরিকত্ব সনদপত্র',
            applicantName: p.citizen?.name || 'নাগরিক আবেদনকারী',
            fatherName: p.citizen?.father || '',
            motherName: p.citizen?.mother || '',
            village: p.citizen?.village || 'বাহেরা তৈল',
            wardNo: p.citizen?.wardNo || '০১',
            applicantNid: p.citizen?.nid || p.citizen?.birthNo || '',
            mobileNo: p.citizen?.mobile || '',
            issueDate: p.issueDate || '2026-08-11',
            status: p.status || 'pending_approval',
            generatedText: p.bodyText || ''
          }));
          setPendingApprovals(mapped);
          setPendingCount(mapped.length);
        }
      })
      .catch(() => {
        setPendingApprovals(samplePendingList);
      });
  }, []);

  // Filter Helper for UDC Queue
  const filteredUdcQueue = udcQueue.filter(item => {
    const matchesSearch = 
      item.applicantName.toLowerCase().includes(udcSearch.toLowerCase()) ||
      item.trackingId.toLowerCase().includes(udcSearch.toLowerCase()) ||
      (item.applicantNid && item.applicantNid.includes(udcSearch));
    const matchesStatus = udcStatusFilter === 'all' || item.status === udcStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Helper for Citizen Documents
  const filteredCitizenDocs = myDocuments.filter(doc => {
    return (
      doc.applicantName.toLowerCase().includes(citizenSearch.toLowerCase()) ||
      doc.certificateType.toLowerCase().includes(citizenSearch.toLowerCase()) ||
      doc.trackingId.toLowerCase().includes(citizenSearch.toLowerCase())
    );
  });

  // Filter Helper for Pending Approvals
  const filteredPending = pendingApprovals.filter(item => {
    return (
      item.applicantName.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      item.trackingId.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      item.certificateType.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      item.wardNo.includes(approvalSearch)
    );
  });

  // Tracking Search Trigger
  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdInput.trim()) return;
    const found = myDocuments.find(d => d.trackingId.toLowerCase() === trackingIdInput.trim().toLowerCase());
    if (found) {
      setSearchedDoc(found);
      setToastMessage(`ট্র্যাকিং আইডি ${found.trackingId} পাওয়া গিয়াছে!`);
    } else {
      setSearchedDoc(null);
      setToastMessage(`নথি আইডি '${trackingIdInput}' পাওয়া যায়নি। দয়া করে সঠিক আইডি প্রবেশ করান।`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick Action Handler
  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  // Status Action Handler for Pending Approvals
  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'pending_approval' | 'rejected') => {
    setPendingApprovals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus === 'approved' ? 'approved' : 'pending_approval' } : p));
    if (newStatus === 'approved') {
      setApprovedTodayCount(c => c + 1);
      setPendingCount(c => Math.max(0, c - 1));
      setToastMessage(`আবেদন আইডি ${id} সফলভাবে অনুমোদন করা হইয়াছে!`);
    } else if (newStatus === 'rejected') {
      setToastMessage(`আবেদন আইডি ${id} বাতিল করা হইয়াছে!`);
    } else {
      setToastMessage(`আবেদন আইডি ${id} ভেরিফিকেশনে প্রেরণ করা হইয়াছে!`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Session Card */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>{config.upName} - স্মার্ট ইউপি অটোমেশন সিস্টেম</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>স্মার্ট রোল-ভিত্তিক ড্যাশবোর্ড</span>
                <span className="px-3 py-1 bg-amber-400 text-emerald-950 rounded-full text-xs font-black uppercase tracking-wider">
                  Role-Based Session
                </span>
              </h2>
              <p className="text-xs md:text-sm text-emerald-200/90 font-medium max-w-2xl">
                সেশন প্রফাইল ও ভূমিকা (UDC, Citizen, Secretary, Chairman) অনুযায়ী অটোমেটিক কাস্টম উইজেট প্রদর্শন পোর্টাল
              </p>
            </div>

            {/* User Session Badge */}
            <div className="bg-slate-900/90 backdrop-blur p-4 rounded-2xl border border-slate-700/80 space-y-1 shrink-0 min-w-[220px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  সক্রিয় ইউজারের সেশন
                </span>
              </div>
              <p className="font-extrabold text-sm text-white truncate">{session.name}</p>
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
                <span className="font-bold text-amber-300 capitalize">{session.designation || activeRoleView}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  {session.email ? 'অথেনটিকেটেড' : 'গেস্ট'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Role Switcher Bar */}
          <div className="pt-4 border-t border-emerald-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-200/90 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>রোল স্বুইচ টেস্ট ফিল্টার (useAuth Session Demo):</span>
            </span>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'udc', label: '💻 UDC Operator (Application Queue)', role: 'udc' },
                { id: 'citizen', label: '👤 Citizen (My Documents)', role: 'citizen' },
                { id: 'secretary', label: '📋 Secretary / Chairman (Pending Approvals)', role: 'secretary' },
                { id: 'chairman', label: '✒️ Chairman (Final Sign)', role: 'chairman' },
                { id: 'developer', label: '🛠️ Developer (Full System)', role: 'developer' }
              ].map(r => {
                const isActive = activeRoleView === r.id || (activeRoleView === 'member' && r.id === 'udc');
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRoleView(r.id as UserRole);
                      switchRole(r.id as UserRole);
                      setToastMessage(`রোল পরিবর্তন করা হয়েছে: ${r.label}`);
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 shadow-lg scale-105 ring-2 ring-amber-300'
                        : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. UDC OPERATORS VIEW: APPLICATION QUEUE WIDGET */}
      {/* ========================================================================= */}
      {(activeRoleView === 'udc' || activeRoleView === 'member') && (
        <div className="space-y-6 animate-fade-in">
          {/* UDC KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">মোট আবেদন জমা (Queue)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{udcQueue.length} টি</h3>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">আজকের এন্ট্রি: ৪ টি</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">সচিব ভেরিফিকেশন পেন্ডিং</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {udcQueue.filter(q => q.status === 'pending_approval').length} টি
                </h3>
                <p className="text-[11px] text-amber-700 font-bold mt-1">প্রসেসিং লাইনে আছে</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">আদায়কৃত ইউডিজি ফি</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">৳ ৫,৪০০</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">বিকাশ/নগদ/ক্যাশ জমা</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center shadow-inner">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">৭ দিনের এডিটেবল ড্রাফট</p>
                <h3 className="text-2xl font-black text-purple-700 mt-1">
                  {udcQueue.filter(q => q.status === 'draft').length} টি
                </h3>
                <p className="text-[11px] text-purple-700 font-bold mt-1">সংশোধন উইন্ডো সচল</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* UDC Quick Actions Bar */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-emerald-800">
            <div className="space-y-1">
              <h4 className="font-black text-lg text-amber-300 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>ইউডিজি উদ্যোক্তা কুইক সার্ভিস অ্যাকশন</span>
              </h4>
              <p className="text-xs text-emerald-200">
                ডিজিটাল সেন্টারে আগত নাগরিকদের জন্য ইনস্ট্যান্ট ই-আবেদন জমা, NID কার্ড স্ক্যান ও ড্রাফট তৈরি করুন
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleNavigate('create')}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ নতুন আবেদন জমা</span>
              </button>

              <button
                onClick={() => handleNavigate('create')}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border border-emerald-600 active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>NID Smart OCR স্ক্যান</span>
              </button>

              <button
                onClick={() => handleNavigate('citizens')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 border border-slate-700 active:scale-95"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>নাগরিক বায়োডাটা রেজিস্ট্রি</span>
              </button>
            </div>
          </div>

          {/* UDC Application Queue Table Widget */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Application Queue (আবেদন কিউ ও প্রসেসিং উইজেট)</h3>
                  <p className="text-xs text-slate-500">UDC Operator দ্বারা জমা ও প্রক্রিয়াধীন আবেদনের তালিকা</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={udcSearch}
                    onChange={(e) => setUdcSearch(e.target.value)}
                    placeholder="নাম / NID / ট্র্যাকিং আইডি..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={udcStatusFilter}
                  onChange={(e) => setUdcStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">সব স্ট্যাটাস</option>
                  <option value="pending_approval">পেন্ডিং ভেরিফিকেশন</option>
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="draft">ড্রাফট (Draft)</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-800 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="p-3.5">ট্র্যাকিং আইডি</th>
                    <th className="p-3.5">আবেদনকারীর নাম ও NID</th>
                    <th className="p-3.5">সনদের ধরন</th>
                    <th className="p-3.5">ওয়ার্ড নং</th>
                    <th className="p-3.5">আবেদন তারিখ</th>
                    <th className="p-3.5">ফি স্ট্যাটাস</th>
                    <th className="p-3.5">প্রসেসিং স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUdcQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        কোনো আবেদন কিউতে পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredUdcQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono font-bold text-emerald-800">{item.trackingId}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{item.applicantName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">NID: {item.applicantNid || 'N/A'}</div>
                        </td>
                        <td className="p-3.5">{item.certificateType}</td>
                        <td className="p-3.5 font-bold text-slate-800">ওয়ার্ড {item.wardNo}</td>
                        <td className="p-3.5 text-slate-500">{item.issueDate}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            ৳ ৫০ (পরিশোধিত)
                          </span>
                        </td>
                        <td className="p-3.5">
                          {item.status === 'approved' ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px] flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              অনুমোদিত
                            </span>
                          ) : item.status === 'draft' ? (
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-extrabold text-[10px] flex items-center gap-1 w-fit">
                              <Database className="w-3 h-3 text-purple-600" />
                              ড্রাফট রেকর্ড
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-extrabold text-[10px] flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" />
                              সচিব ভেরিফিকেশন
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setPreviewCert(item)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl font-bold text-[11px] transition border border-slate-200 flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ডিটেইলস</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CITIZEN VIEW: MY DOCUMENTS HISTORY WIDGET */}
      {/* ========================================================================= */}
      {activeRoleView === 'citizen' && (
        <div className="space-y-6 animate-fade-in">
          {/* Citizen Overview Header */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-xl">স্বাগতম, {session.name}</h3>
                <p className="text-xs text-slate-500">আপনার অনলাইন নাগরিক প্রোফাইল, ইস্যুকৃত সনদপত্র ও লাইভ আবেদনের অবস্থা</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleNavigate('create')}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ নতুন সনদের আবেদন</span>
              </button>

              <button
                onClick={() => handleNavigate('verify')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
              >
                <Scan className="w-4 h-4" />
                <span>সনদপত্র কিউআর (QR) যাচাই</span>
              </button>
            </div>
          </div>

          {/* Instant Tracking Search Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-lg border border-indigo-900">
            <div className="space-y-1">
              <h4 className="font-black text-base text-amber-300 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>ইনস্ট্যান্ট আবেদন ট্র্যাকিং আইডি অনুসন্ধান (Tracking Lookup)</span>
              </h4>
              <p className="text-xs text-slate-300">
                আপনার আবেদনের সময় প্রদত্ত ট্র্যাকিং নাম্বার প্রবেশ করিয়ে বর্তমান অবস্থা জেনে নিন
              </p>
            </div>

            <form onSubmit={handleTrackingSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <input
                type="text"
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                placeholder="যেমন: TRK-2026-BUP-88421"
                className="flex-1 px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl transition cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <span>খুঁজুন</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>

            {searchedDoc && (
              <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-700 text-xs text-emerald-200 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>আবেদন আইডি: {searchedDoc.trackingId}</span>
                  <span className="px-2.5 py-0.5 bg-emerald-800 text-white rounded text-[10px] uppercase">
                    {searchedDoc.status === 'approved' ? 'অনুমোদিত' : 'প্রক্রিয়াধীন'}
                  </span>
                </div>
                <p>আবেদনকারী: <strong className="text-white">{searchedDoc.applicantName}</strong> | সনদের ধরন: <strong className="text-white">{searchedDoc.certificateType}</strong></p>
              </div>
            )}
          </div>

          {/* Citizen 'My Documents' History Widget Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-2xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">My Documents History (আমার নথি ও সনদ ইতিহাস)</h3>
                  <p className="text-xs text-slate-500">আপনার ইস্যুকৃত সনদপত্র ও ডাউনলোড লিংক</p>
                </div>
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={citizenSearch}
                  onChange={(e) => setCitizenSearch(e.target.value)}
                  placeholder="সনদের নাম বা আইডি সার্চ..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Documents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCitizenDocs.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-500 font-medium">
                  কোনো নথি পাওয়া যায়নি।
                </div>
              ) : (
                filteredCitizenDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded-md">
                          {doc.trackingId}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded">
                          {doc.status === 'approved' ? 'ডিজিটাল ইস্যুকৃত' : 'পেন্ডিং'}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 text-sm">
                        {doc.certificateType}
                      </h4>

                      <p className="text-xs text-slate-600 font-medium">
                        প্রাপক: <span className="font-extrabold text-slate-900">{doc.applicantName}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ইস্যুর তারিখ: {doc.issueDate}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewCert(doc)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ভিউ সনদ</span>
                      </button>

                      <button
                        onClick={() => handleNavigate('verify')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>QR ভেরিফাই</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHAIRMAN / SECRETARY VIEW: PENDING APPROVAL STATS WIDGET */}
      {/* ========================================================================= */}
      {(activeRoleView === 'secretary' || activeRoleView === 'chairman' || activeRoleView === 'super_admin' || activeRoleView === 'developer') && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">অনুমোদনের অপেক্ষায় (Pending)</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount} টি</h3>
                <p className="text-[11px] text-amber-700 font-bold mt-1">চেয়ারম্যান/সচিব সিগনেচার</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">আজকের অনুমোদিত সনদ</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">{approvedTodayCount} টি</h3>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">ডিজিটাল সিল যুক্ত</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">ডিজিটাল সিল ও সিগনেচার</p>
                <h3 className="text-xl font-black text-blue-700 mt-1">সক্রিয় (Active)</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">অটো-স্ট্যাম্প ইমপ্রিন্ট</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center shadow-inner">
                <Key className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500">সন্দেহজনক NID ফ্ল্যাগ</p>
                <h3 className="text-2xl font-black text-slate-700 mt-1">০ টি</h3>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">ডুপ্লিকেট চেক পাস</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending Approval Widget Main Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Pending Approval Stats (চেয়ারম্যান/সচিব অনুমোদন হাব)</h3>
                  <p className="text-xs text-slate-500">অনুমোদনের অপেক্ষায় থাকা আবেদনপত্র যাচাই ও স্বাক্ষর করুন</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    placeholder="আবেদনকারী বা ওয়ার্ড খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleNavigate('pending')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>সম্পূর্ণ তালিকা</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Approval Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-800 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="p-3.5">ট্র্যাকিং আইডি</th>
                    <th className="p-3.5">আবেদনকারীর তথ্য</th>
                    <th className="p-3.5">সনদের ধরন</th>
                    <th className="p-3.5">ওয়ার্ড নং</th>
                    <th className="p-3.5">আবেদনের তারিখ</th>
                    <th className="p-3.5">সুপারিশকারী</th>
                    <th className="p-3.5 text-right">অনুমোদন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPending.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                        বর্তমানে কোনো আবেদন অনুমোদনের অপেক্ষায় নেই।
                      </td>
                    </tr>
                  ) : (
                    filteredPending.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono font-bold text-emerald-800">{item.trackingId}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{item.applicantName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">পিতা: {item.fatherName || 'N/A'}</div>
                        </td>
                        <td className="p-3.5">{item.certificateType}</td>
                        <td className="p-3.5 font-bold text-slate-800">ওয়ার্ড {item.wardNo}</td>
                        <td className="p-3.5 text-slate-500">{item.issueDate}</td>
                        <td className="p-3.5 text-slate-600">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold text-[10px]">
                            ইউডিজি উদ্যোক্তা
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] transition shadow flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>অনুমোদন ও স্বাক্ষর</span>
                            </button>

                            <button
                              onClick={() => setPreviewCert(item)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] transition border border-slate-200 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-800" />
                <span>আবেদনপত্র বিস্তারিত বিবরণী</span>
              </h3>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-400 font-bold">ট্র্যাকিং আইডি:</span> <strong className="font-mono text-emerald-800">{previewCert.trackingId}</strong></div>
                <div><span className="text-slate-400 font-bold">সনদের ধরন:</span> <strong className="text-slate-900">{previewCert.certificateType}</strong></div>
                <div><span className="text-slate-400 font-bold">আবেদনকারী:</span> <strong className="text-slate-900">{previewCert.applicantName}</strong></div>
                <div><span className="text-slate-400 font-bold">পিতা/স্বামী:</span> <strong className="text-slate-900">{previewCert.fatherName || 'N/A'}</strong></div>
                <div><span className="text-slate-400 font-bold">গ্রাম/মহল্লা:</span> <strong className="text-slate-900">{previewCert.village}</strong></div>
                <div><span className="text-slate-400 font-bold">ওয়ার্ড নং:</span> <strong className="text-slate-900">{previewCert.wardNo}</strong></div>
                <div><span className="text-slate-400 font-bold">NID / জন্ম সনদ:</span> <strong className="text-slate-900">{previewCert.applicantNid || 'N/A'}</strong></div>
                <div><span className="text-slate-400 font-bold">মোবাইল:</span> <strong className="text-slate-900">{previewCert.mobileNo || 'N/A'}</strong></div>
              </div>

              {previewCert.generatedText && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 font-bold block mb-1">বিবরণী পাঠ (AI Body Text):</span>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 italic leading-relaxed text-slate-800">
                    "{previewCert.generatedText}"
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SAMPLE DATA FOR UDC QUEUE, CITIZEN DOCS & PENDING APPROVALS
// =========================================================================
const sampleUdcQueueList: DashboardItem[] = [
  {
    id: 'UDC-101',
    trackingId: 'TRK-2026-BUP-10021',
    certificateType: 'নাগরিকত্ব সনদপত্র',
    applicantName: 'মোঃ রফিকুল ইসলাম',
    fatherName: 'মোঃ আব্দুল জব্বার',
    motherName: 'মাজেদা খাতুন',
    village: 'বাহেরা তৈল',
    wardNo: '০১',
    applicantNid: '19882691234560012',
    mobileNo: '01711223344',
    issueDate: '09/08/2026',
    status: 'pending_approval',
    generatedText: 'এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোঃ রফিকুল ইসলাম, পিতা: মোঃ আব্দুল জব্বার, সাং- বাহেরা তৈল, ১ নং ওয়ার্ডের একজন স্থায়ী বাসিন্দা।'
  },
  {
    id: 'UDC-102',
    trackingId: 'TRK-2026-BUP-10022',
    certificateType: 'চারিত্রিক সনদপত্র',
    applicantName: 'মোছাঃ নাসরিন আক্তার',
    fatherName: 'মোঃ লাল মিয়া',
    motherName: 'রহিমা বেগম',
    village: 'ঘোনাপাড়া',
    wardNo: '০৩',
    applicantNid: '19952691234560099',
    mobileNo: '01822334455',
    issueDate: '09/08/2026',
    status: 'draft',
    generatedText: 'উক্ত আবেদনকারী আমাদের সুপরিচিত। তাহার স্বভাব ও চরিত্র উত্তম এবং সে কোনো রাষ্ট্রবিরোধী কর্মকাণ্ডে জড়িত নহে।'
  },
  {
    id: 'UDC-103',
    trackingId: 'TRK-2026-BUP-10023',
    certificateType: 'ওয়ারিশান সনদপত্র',
    applicantName: 'মোঃ শফিকুল আলম',
    fatherName: 'মৃত কেরামত আলী',
    motherName: 'আমেনা বেগম',
    village: 'সোনাপুর',
    wardNo: '০৫',
    applicantNid: '19752691234560088',
    mobileNo: '01933445566',
    issueDate: '08/08/2026',
    status: 'approved',
    generatedText: 'মৃত কেরামত আলীর মৃত্যুর পর নিম্নে বর্ণিত ওয়ারিশগণ জীবিত রহিয়াছেন।'
  }
];

const sampleCitizenDocs: DashboardItem[] = [
  {
    id: 'CIT-201',
    trackingId: 'TRK-2026-BUP-88421',
    certificateType: 'নাগরিকত্ব সনদপত্র',
    applicantName: 'ইনবক্স ৬০০৯০০',
    fatherName: 'মোঃ ফজলুল হক',
    village: 'বাহেরা তৈল',
    wardNo: '০২',
    issueDate: '05/08/2026',
    status: 'approved',
    generatedText: 'ডিজিটাল কিউআর কোডসহ প্রত্যয়ন করা হইল।'
  },
  {
    id: 'CIT-202',
    trackingId: 'TRK-2026-BUP-88422',
    certificateType: 'বাৎসরিক আয় সনদপত্র',
    applicantName: 'ইনবক্স ৬০০৯০০',
    fatherName: 'মোঃ ফজলুল হক',
    village: 'বাহেরা তৈল',
    wardNo: '০২',
    issueDate: '01/08/2026',
    status: 'approved',
    generatedText: 'বাৎসরিক মোট আয় ১,৫০,০০০/- টাকা।'
  }
];

const samplePendingList: DashboardItem[] = [
  {
    id: 'PND-301',
    trackingId: 'TRK-2026-BUP-99001',
    certificateType: 'নাগরিকত্ব সনদপত্র',
    applicantName: 'আব্দুল মালেক',
    fatherName: 'মৃত ইসমাইল হোসেন',
    village: 'বাহেরা তৈল',
    wardNo: '০১',
    applicantNid: '19802691234561111',
    issueDate: '09/08/2026',
    status: 'pending_approval',
    generatedText: '১ নং ওয়ার্ডের স্থায়ী বাসিন্দা হিসেবে নাগরিকত্ব সনদের আবেদন।'
  },
  {
    id: 'PND-302',
    trackingId: 'TRK-2026-BUP-99002',
    certificateType: 'ভূমিহীন সনদপত্র',
    applicantName: 'মোছাঃ ফাতেমা খাতুন',
    fatherName: 'মোঃ জালাল উদ্দিন',
    village: 'কাশিমপুর',
    wardNo: '০৪',
    applicantNid: '19922691234562222',
    issueDate: '09/08/2026',
    status: 'pending_approval',
    generatedText: 'উক্ত আবেদনকারীর নিজস্ব কোনো জমিজমা নাই।'
  }
];
