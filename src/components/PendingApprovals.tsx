import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  CheckCheck,
  RefreshCw,
  Eye,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Building2,
  Phone,
  Calendar,
  X,
  CreditCard,
  Database
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { CERTIFICATE_TYPES, CERTIFICATE_CATEGORIES } from '../data/certificateTypes';
import { saveCertificateToFirebase } from '../firebase';

interface PendingApprovalsProps {
  config: UnionParishadConfig;
  onCertificateStatusUpdated?: () => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ config, onCertificateStatusUpdated }) => {
  const [pendingList, setPendingList] = useState<CertificateRecord[]>([]);
  const [approvedTodayCount, setApprovedTodayCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('সব ওয়ার্ড');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব ক্যাটাগরি');
  const [selectedCertType, setSelectedCertType] = useState<string>('সব সনদের ধরন');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Rejection reason modal state
  const [rejectingCert, setRejectingCert] = useState<CertificateRecord | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<string>('তথ্য অসম্পূর্ণ বা এনআইডি যাচাই ব্যর্থ');

  // Fetch Pending List & Stats from Server
  const fetchPendingList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.pending)) {
          setPendingList(data.pending);
        }
        if (data.stats) {
          setApprovedTodayCount(data.stats.approvedToday || 0);
          setRejectedCount(data.stats.totalRejected || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching pending list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingList();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // One-Click Single Approve
  const handleApprove = async (cert: CertificateRecord) => {
    setProcessingId(cert.id);
    try {
      const res = await fetch('/api/admin/approve-cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cert.id,
          approvedBy: config.chairmanName || 'ইউপি চেয়ারম্যান'
        })
      });
      const data = await res.json();

      if (data.success) {
        // Sync to Firebase if record updated
        if (data.certificate) {
          saveCertificateToFirebase(data.certificate).catch(err =>
            console.warn('Firebase sync warning:', err)
          );
        }

        // Remove from local pending list & increment approved today count
        setPendingList(prev => prev.filter(c => c.id !== cert.id));
        setApprovedTodayCount(prev => prev + 1);
        showToast(data.message || 'সনদ সফলভাবে চেয়ারম্যান কর্তৃক অনুমোদিত হইয়াছে!', 'success');
        if (onCertificateStatusUpdated) onCertificateStatusUpdated();
      } else {
        showToast(data.message || 'অনুমোদনে ত্রুটি ঘটিয়াছে।', 'error');
      }
    } catch (e) {
      console.error('Approval request failed:', e);
      showToast('অনুমোদনে সার্ভার সংযোগ ত্রুটি ঘটিয়াছে।', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // One-Click Cancel / Reject
  const handleConfirmCancel = async () => {
    if (!rejectingCert) return;
    const cert = rejectingCert;
    setProcessingId(cert.id);

    try {
      const res = await fetch('/api/admin/cancel-cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cert.id,
          cancelledBy: config.chairmanName || 'ইউপি চেয়ারম্যান',
          reason: rejectReasonInput
        })
      });
      const data = await res.json();

      if (data.success) {
        if (data.certificate) {
          saveCertificateToFirebase(data.certificate).catch(err =>
            console.warn('Firebase sync warning:', err)
          );
        }

        setPendingList(prev => prev.filter(c => c.id !== cert.id));
        setRejectedCount(prev => prev + 1);
        showToast(data.message || 'আবেদন বাতিল করা হইয়াছে।', 'error');
        setRejectingCert(null);
        if (onCertificateStatusUpdated) onCertificateStatusUpdated();
      } else {
        showToast(data.message || 'বাতিলকরণে ত্রুটি ঘটিয়াছে।', 'error');
      }
    } catch (e) {
      console.error('Cancel request failed:', e);
      showToast('সার্ভার সংযোগ ত্রুটি ঘটিয়াছে।', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // One-Click Batch Approve All
  const handleBatchApprove = async () => {
    if (pendingList.length === 0) return;
    if (!window.confirm(`আপনি কি নিশ্চিত যে সকল (${pendingList.length} টি) পেন্ডিং আবেদন একসাথে অনুমোদন করতে চান?`)) {
      return;
    }

    const approveCount = pendingList.length;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: config.chairmanName || 'ইউপি চেয়ারম্যান'
        })
      });
      const data = await res.json();

      if (data.success) {
        setPendingList([]);
        setApprovedTodayCount(prev => prev + approveCount);
        showToast(data.message || 'সকল পেন্ডিং আবেদন সফলভাবে অনুমোদন হইয়াছে!', 'success');
        if (onCertificateStatusUpdated) onCertificateStatusUpdated();
      }
    } catch (e) {
      showToast('ব্যাচ অনুমোদনে সংযোগ ত্রুটি।', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Derive dynamic unique categories and certificate types from CERTIFICATE_TYPES & pendingList
  const categoriesList = Array.from(
    new Set([
      'সব ক্যাটাগরি',
      ...CERTIFICATE_CATEGORIES.filter(c => c !== 'সব ধরন'),
      ...pendingList.map(item => item.category).filter(Boolean)
    ])
  );

  const certTypesList = Array.from(
    new Set([
      'সব সনদের ধরন',
      ...CERTIFICATE_TYPES.map(t => t.label),
      ...pendingList.map(item => item.typeLabel).filter(Boolean)
    ])
  );

  // Filter pending items
  const filteredList = pendingList.filter(item => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.citizen.name.toLowerCase().includes(q) ||
      item.memoNo.toLowerCase().includes(q) ||
      (item.citizen.nid && item.citizen.nid.includes(q)) ||
      (item.citizen.mobile && item.citizen.mobile.includes(q)) ||
      item.citizen.village.toLowerCase().includes(q) ||
      item.typeLabel.toLowerCase().includes(q);

    const matchesWard = selectedWard === 'সব ওয়ার্ড' || item.citizen.wardNo === selectedWard;
    const matchesCategory = selectedCategory === 'সব ক্যাটাগরি' || item.category === selectedCategory;
    const matchesCertType = selectedCertType === 'সব সনদের ধরন' || item.typeLabel === selectedCertType;

    return matchesSearch && matchesWard && matchesCategory && matchesCertType;
  });

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedWard !== 'সব ওয়ার্ড' ||
    selectedCategory !== 'সব ক্যাটাগরি' ||
    selectedCertType !== 'সব সনদের ধরন';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedWard('সব ওয়ার্ড');
    setSelectedCategory('সব ক্যাটাগরি');
    setSelectedCertType('সব সনদের ধরন');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-amber-300 border-amber-400/40'
              : 'bg-rose-950 text-rose-200 border-rose-500/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Chairman Portal Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur border border-emerald-600/50 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>চেয়ারম্যান অনুমোদন পোর্টাল (Chairman Approval Desk)</span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{config.chairmanName} ({config.chairmanTitle})</span>
            </h2>

            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
              ইউডিসি উদ্যোক্তা ও সচিব কর্তৃক প্রেরিত প্রত্যয়নপত্রসমূহের আবেদন পরীক্ষা করুন এবং এক ক্লিকে অনুমোদন বা বাতিল নিশ্চিত করুন। সকল আপডেট গুগল শিটে রিয়েলটাইমে সংরক্ষিত হয়।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-emerald-900/80 border border-emerald-700/80 p-3.5 rounded-xl text-center min-w-[120px]">
              <span className="text-[10px] text-emerald-300 block font-semibold">পেন্ডিং আবেদন</span>
              <span className="text-2xl font-black text-amber-300">{pendingList.length} টি</span>
            </div>

            <div className="bg-emerald-900/80 border border-emerald-700/80 p-3.5 rounded-xl text-center min-w-[140px]">
              <span className="text-[10px] text-emerald-300 block font-semibold flex items-center justify-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>গুগল শিট সিঙ্ক</span>
              </span>
              <span className="text-xs font-bold text-emerald-200 flex items-center justify-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>রিয়েলটাইম সক্রিয়</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden flex items-center justify-between group hover:shadow-md transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-bold text-amber-700 block flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>মোট পেন্ডিং আবেদন</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-amber-950">{pendingList.length}</span>
              <span className="text-xs font-semibold text-amber-600">টি অপেক্ষমাণ</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">চেয়ারম্যান অনুমোদনের অপেক্ষায়</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 group-hover:scale-110 transition">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
        </div>

        {/* Today's Approvals Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 relative overflow-hidden flex items-center justify-between group hover:shadow-md transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>আজকের অনুমোদিত সনদ</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-950">{approvedTodayCount}</span>
              <span className="text-xs font-semibold text-emerald-600">টি ইস্যুকৃত</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">আজকে চেয়ারম্যান কর্তৃক অনুমোদিত</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 group-hover:scale-110 transition">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600" />
        </div>

        {/* Rejected Applications Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-200 relative overflow-hidden flex items-center justify-between group hover:shadow-md transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-bold text-rose-700 block flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>বাতিল বা প্রত্যাখ্যাত</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-rose-950">{rejectedCount}</span>
              <span className="text-xs font-semibold text-rose-600">টি বাতিল</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">তথ্য অসঙ্গতির কারণে ফেরত</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700 group-hover:scale-110 transition">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
        </div>

        {/* Total Processed Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200 relative overflow-hidden flex items-center justify-between group hover:shadow-md transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-bold text-indigo-700 block flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-indigo-600" />
              <span>মোট নিষ্পত্তিকৃত আবেদন</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black text-indigo-950">
                {approvedTodayCount + rejectedCount}
              </span>
              <span className="text-xs font-semibold text-indigo-600">টি সম্পন্ন</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">অনুমোদন ও নিষ্পত্তির মোট কাজ</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700 group-hover:scale-110 transition">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600" />
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Enhanced Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="আবেদনকারীর নাম, স্মারক নং, এনআইডি, মোবাইল বা সনদের নাম দিয়ে সার্চ করুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-slate-900 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
                title="সার্চ ক্লিয়ার করুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span>ক্যাটাগরি:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[150px]"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>সনদের ধরন:</span>
              <select
                value={selectedCertType}
                onChange={e => setSelectedCertType(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[160px]"
              >
                {certTypesList.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
              <span>ওয়ার্ড:</span>
              <select
                value={selectedWard}
                onChange={e => setSelectedWard(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="সব ওয়ার্ড">সব ওয়ার্ড</option>
                <option value="০১">০১ নং ওয়ার্ড</option>
                <option value="০২">০২ নং ওয়ার্ড</option>
                <option value="০৩">০৩ নং ওয়ার্ড</option>
                <option value="০৪">০৪ নং ওয়ার্ড</option>
                <option value="০৫">০৫ নং ওয়ার্ড</option>
                <option value="০৬">০৬ নং ওয়ার্ড</option>
                <option value="০৭">০৭ নং ওয়ার্ড</option>
                <option value="০৮">০৮ নং ওয়ার্ড</option>
                <option value="০৯">০৯ নং ওয়ার্ড</option>
              </select>
            </div>

            <button
              onClick={fetchPendingList}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="পুনরায় রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            {pendingList.length > 0 && (
              <button
                onClick={handleBatchApprove}
                disabled={loading}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-amber-300" />
                <span>একসাথে সব অনুমোদন ({pendingList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Filter Pills & Filter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">দ্রুত ফিল্টার:</span>
            {['সব ক্যাটাগরি', 'নাগরিকত্ব ও পরিচয়', 'আর্থিক ও সম্পত্তি', 'চারিত্রিক সনদপত্র'].map(pill => {
              const isSelected =
                pill === 'চারিত্রিক সনদপত্র'
                  ? selectedCertType === 'চারিত্রিক সনদপত্র'
                  : selectedCategory === pill;
              return (
                <button
                  key={pill}
                  onClick={() => {
                    if (pill === 'চারিত্রিক সনদপত্র') {
                      setSelectedCertType('চারিত্রিক সনদপত্র');
                    } else {
                      setSelectedCategory(pill);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-900 text-amber-300 border-emerald-800 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* Active Filter Info & Reset Button */}
          {isFilterActive && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                ফিল্টারকৃত ফলাফল: {filteredList.length} টি
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>ফিল্টার রিসেট</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pending List Grid / Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-bold">পেন্ডিং আবেদনসমূহ লোড হচ্ছে...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">কোনো পেন্ডিং আবেদন খালি পাওয়া যায় নাই!</h3>
          <p className="text-xs text-slate-500">
            বর্তমানে অনুমোদনের অপেক্ষায় থাকা কোনো প্রত্যয়নপত্র জমা নেই। নতুন আবেদন আসলে এখানে দেখাবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(item => {
            const isProcessing = processingId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Status Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>চেয়ারম্যান অনুমোদন অপেক্ষমান</span>
                  </span>

                  <span className="text-[11px] font-extrabold text-slate-500 font-mono">
                    {item.memoNo}
                  </span>
                </div>

                {/* Citizen Summary Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>{item.citizen.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        পিতা: {item.citizen.father || item.citizen.spouseName || 'N/A'}
                      </p>
                    </div>

                    <span className="bg-emerald-900 text-white font-black text-[10px] px-2 py-0.5 rounded">
                      ওয়ার্ড {item.citizen.wardNo}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{item.typeLabel}</span>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      গ্রাম: {item.citizen.village}, ডাকঘর: {item.citizen.postOffice}
                    </p>
                    {item.citizen.nid && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        NID: {item.citizen.nid}
                      </p>
                    )}
                  </div>

                  {/* Payment & Fee Indicator */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>সরকারি ফি: <strong>৳{item.feeAmount || 50}</strong></span>
                    </span>

                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {item.paymentStatus === 'paid' ? 'ফি পরিশোধিত' : 'পরিশোধিত'}
                    </span>
                  </div>
                </div>

                {/* Body Snippet */}
                <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-amber-50/50 p-2 rounded border border-amber-200/60">
                  "{item.bodyText}"
                </p>

                {/* Real-time One-Click Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={isProcessing}
                    className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>অনুমোদন দিন</span>
                  </button>

                  <button
                    onClick={() => setRejectingCert(item)}
                    disabled={isProcessing}
                    className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    title="আবেদনটি বাতিল করুন"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>বাতিল</span>
                  </button>

                  <button
                    onClick={() => setPreviewCert(item)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer"
                    title="বিস্তারিত দেখুন"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL CERTIFICATE PREVIEW MODAL */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs px-2.5 py-1 rounded-lg">
                  স্মারক: {previewCert.memoNo}
                </span>
                <h3 className="font-bold text-base text-slate-900">{previewCert.typeLabel}</h3>
              </div>

              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Citizen Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">আবেদনকারীর নাম:</span>
                <span className="font-bold text-slate-900">{previewCert.citizen.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">পিতা/স্বামী:</span>
                <span className="font-bold text-slate-900">{previewCert.citizen.father || previewCert.citizen.spouseName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">মাতার নাম:</span>
                <span className="font-bold text-slate-900">{previewCert.citizen.mother}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">গ্রাম ও ওয়ার্ড:</span>
                <span className="font-bold text-slate-900">{previewCert.citizen.village}, ওয়ার্ড- {previewCert.citizen.wardNo}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">জাতীয় পরিচয়পত্র/জন্ম সনদ:</span>
                <span className="font-bold text-slate-900 font-mono">{previewCert.citizen.nid || previewCert.citizen.birthNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">মোবাইল নম্বর:</span>
                <span className="font-bold text-slate-900 font-mono">{previewCert.citizen.mobile || 'N/A'}</span>
              </div>
            </div>

            {/* Official Generated Text Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gemini AI দাপ্তরিক বক্তব্য (Body Text Preview):</span>
              </label>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-slate-800 leading-relaxed font-serif">
                {previewCert.bodyText}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  handleApprove(previewCert);
                  setPreviewCert(null);
                }}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>চেয়ারম্যান অনুমোদন প্রদান করুন</span>
              </button>

              <button
                onClick={() => {
                  setRejectingCert(previewCert);
                  setPreviewCert(null);
                }}
                className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                আবেদন বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-900 border-b pb-3">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm">আবেদন বাতিলের কারণ উল্লেখ করুন</h3>
            </div>

            <p className="text-xs text-slate-600">
              আবেদনকারী: <strong>{rejectingCert.citizen.name}</strong> ({rejectingCert.typeLabel})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                বাতিলের কারণ (কারণ উল্লেখের মাধ্যমে আবেদন বাতিল হবে):
              </label>
              <textarea
                value={rejectReasonInput}
                onChange={e => setRejectReasonInput(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                বাতিল নিশ্চিত করুন
              </button>
              <button
                onClick={() => setRejectingCert(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                ফিরিয়া যান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
