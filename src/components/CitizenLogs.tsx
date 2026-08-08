import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  FileText, 
  Eye, 
  RefreshCw, 
  Calendar, 
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { fetchCertificatesFromFirebase } from '../firebase';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_TYPES } from '../data/certificateTypes';
import { WARDS } from '../data/villages';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { CertificateView } from './CertificateView';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';

interface CitizenLogsProps {
  config: UnionParishadConfig;
}

export const CitizenLogs: React.FC<CitizenLogsProps> = ({ config }) => {
  const [logs, setLogs] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব ধরন');
  const [selectedCertType, setSelectedCertType] = useState('সকল সনদের ধরন');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/logs?ward=${encodeURIComponent(selectedWard)}&category=${encodeURIComponent(selectedCategory)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      let serverLogs: CertificateRecord[] = data.logs || [];

      const fbLogs = await fetchCertificatesFromFirebase();
      
      // Merge unique records
      const logMap = new Map<string, CertificateRecord>();
      [...serverLogs, ...fbLogs].forEach(item => {
        if (item.memoNo && !logMap.has(item.memoNo)) {
          logMap.set(item.memoNo, item);
        }
      });

      let merged = Array.from(logMap.values());

      // Apply client-side filters if needed
      if (selectedWard) {
        merged = merged.filter(c => c.citizen && c.citizen.wardNo === selectedWard);
      }
      if (selectedCategory && selectedCategory !== 'সব ধরন') {
        merged = merged.filter(c => c.category === selectedCategory || c.typeLabel === selectedCategory);
      }
      if (selectedCertType && selectedCertType !== 'সকল সনদের ধরন') {
        merged = merged.filter(c => c.typeLabel === selectedCertType);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        merged = merged.filter(c => 
          c.memoNo.toLowerCase().includes(q) ||
          (c.typeLabel && c.typeLabel.toLowerCase().includes(q)) ||
          (c.citizen && c.citizen.name.toLowerCase().includes(q)) ||
          (c.citizen && c.citizen.nid && c.citizen.nid.includes(q)) ||
          (c.citizen && c.citizen.village && c.citizen.village.toLowerCase().includes(q))
        );
      }

      setLogs(merged);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedWard, selectedCategory, selectedCertType, searchQuery]);

  const handleExportCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (selectedCert) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedCert(null)}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
        >
          ← রেজিস্টার তালিকায় ফিরে যান
        </button>
        <CertificateView certificate={selectedCert} config={config} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>নাগরিক প্রত্যয়নপত্র রেজিস্টার ও ইতিহাস</span>
          </h2>
          <p className="text-xs text-slate-500">
            {config.upName} এর ইস্যুকৃত সকল সনদের বিবরণী, ওয়ার্ডভিত্তিক ট্র্যাকিং ও ইতিহাস।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer border border-emerald-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Google Sheets-এ সিঙ্ক</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="নাম, স্মারক নং বা NID দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Ward Filter */}
        <div>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          >
            <option value="">সকল ওয়ার্ড (০১ - ০৯)</option>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                ওয়ার্ড নং {w}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          >
            {CERTIFICATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Certificate Type Filter (40+ types) */}
        <div>
          <select
            value={selectedCertType}
            onChange={(e) => setSelectedCertType(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          >
            <option value="সকল সনদের ধরন">সকল সনদের ধরন (৪০+)</option>
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type.key} value={type.label}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-800">
            <thead className="bg-emerald-900 text-white font-bold">
              <tr>
                <th className="p-3 border-r border-emerald-800">তারিখ</th>
                <th className="p-3 border-r border-emerald-800">স্মারক নং</th>
                <th className="p-3 border-r border-emerald-800">সনদের ধরন</th>
                <th className="p-3 border-r border-emerald-800">নাগরিকের নাম</th>
                <th className="p-3 border-r border-emerald-800">পিতা / স্বামী</th>
                <th className="p-3 border-r border-emerald-800">গ্রাম ও ওয়ার্ড</th>
                <th className="p-3 border-r border-emerald-800">NID / জন্ম নম্বর</th>
                <th className="p-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 font-semibold">
                    ডাটা লোড হইতেছে...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    কোনো রেজিষ্ট্রেশন রেকর্ড পাওয়া যায় নাই।
                  </td>
                </tr>
              ) : (
                logs.map((record) => (
                  <tr key={record.id} className="hover:bg-emerald-50/50 transition">
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">{record.issueDate}</td>
                    <td className="p-3 font-mono font-bold text-emerald-900 whitespace-nowrap">{record.memoNo}</td>
                    <td className="p-3 font-bold text-slate-900">{record.typeLabel}</td>
                    <td className="p-3 font-semibold text-slate-900">{record.citizen.name}</td>
                    <td className="p-3 text-slate-700">{record.citizen.father || record.citizen.spouseName || 'N/A'}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{record.citizen.village}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded ml-1 font-bold">
                        ওয়ার্ড {record.citizen.wardNo}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{record.citizen.nid || record.citizen.birthNo || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedCert(record)}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded border border-emerald-300 transition flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিন্ট/দেখুন</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        logs={logs}
        config={config}
      />
    </div>
  );
};
