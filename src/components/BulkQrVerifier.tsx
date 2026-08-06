import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileSpreadsheet, 
  FileImage, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Download, 
  RefreshCw, 
  Search, 
  Eye, 
  Award, 
  Sparkles,
  Layers,
  Check,
  Building2,
  FileCheck,
  HelpCircle,
  Printer
} from 'lucide-react';
import jsQR from 'jsqr';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { formatBanglaDate, convertToBengaliDigits } from '../lib/utils';
import { searchCertificateInFirebase } from '../firebase';
import { CertificateView } from './CertificateView';

export interface AuditItemResult {
  id: string;
  rawInput: string;
  sourceType: 'image' | 'csv' | 'text' | 'demo';
  sourceName?: string;
  memoNo: string;
  found: boolean;
  status: 'issued' | 'approved' | 'pending_approval' | 'cancelled' | 'invalid' | 'unknown';
  riskScore: number; // 0 to 100 authenticity score
  statusMessage: string;
  certificate?: CertificateRecord;
  verifiedAt: string;
}

interface BulkQrVerifierProps {
  config: UnionParishadConfig;
}

export const BulkQrVerifier: React.FC<BulkQrVerifierProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'csv' | 'demo'>('image');
  const [inspectorRole, setInspectorRole] = useState<string>('ইউপি প্রশাসনিক কর্মকর্তা (সচিব)');
  
  // Input states
  const [csvText, setCsvText] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [auditResults, setAuditResults] = useState<AuditItemResult[] | null>(null);
  
  // Filter & Modal states
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'invalid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectCert, setInspectCert] = useState<CertificateRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract QR payload or Memo No from Image File via canvas & jsQR
  const processImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file.name);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            
            if (code && code.data) {
              resolve(code.data);
            } else {
              // Fallback: extract memo pattern from file name if QR not clear
              const match = file.name.match(/BUP-\d{4}-\d{4,6}/i) || file.name.match(/BUP-[A-Z0-9-]+/i);
              resolve(match ? match[0] : file.name);
            }
          } catch (err) {
            const match = file.name.match(/BUP-\d{4}-\d{4,6}/i) || file.name.match(/BUP-[A-Z0-9-]+/i);
            resolve(match ? match[0] : file.name);
          }
        };
        img.onerror = () => resolve(file.name);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Image File selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map((f: File) => URL.createObjectURL(f));
      setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle Drag & Drop Images
  const handleDropImages = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const rawFiles: File[] = Array.from(e.dataTransfer.files);
      const filesArray = rawFiles.filter((f: File) => f.type.startsWith('image/'));
      setImageFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((f: File) => URL.createObjectURL(f));
      setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove single image from batch
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const clearImages = () => {
    setImageFiles([]);
    setImagePreviewUrls([]);
  };

  // Run Bulk Verification Process
  const startBulkAudit = async (itemsToVerify?: { raw: string; source: 'image' | 'csv' | 'text' | 'demo'; name?: string }[]) => {
    setIsProcessing(true);
    setProcessProgress(10);
    
    let itemsList: { raw: string; source: 'image' | 'csv' | 'text' | 'demo'; name?: string }[] = [];

    if (itemsToVerify) {
      itemsList = itemsToVerify;
    } else if (activeTab === 'image') {
      if (imageFiles.length === 0) {
        alert('অনুগ্রহ করে অন্তত ১ টি কিউআর বা সনদের ছবি আপলোড করুন।');
        setIsProcessing(false);
        return;
      }
      // Scan each image QR
      for (let i = 0; i < imageFiles.length; i++) {
        const qrPayload = await processImageFile(imageFiles[i]);
        itemsList.push({
          raw: qrPayload,
          source: 'image',
          name: imageFiles[i].name
        });
        setProcessProgress(Math.round(((i + 1) / imageFiles.length) * 40));
      }
    } else if (activeTab === 'csv') {
      if (!csvText.trim()) {
        alert('অনুগ্রহ করে সিএসভি কন্টেন্ট বা স্মারক নম্বরের তালিকা পেস্ট করুন।');
        setIsProcessing(false);
        return;
      }
      const lines = csvText
        .split(/[\n,;\t]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.toLowerCase().includes('memo') && !l.toLowerCase().includes('তারিখ'));
      
      itemsList = lines.map((line) => ({
        raw: line,
        source: 'csv'
      }));
    }

    setProcessProgress(50);

    // Call API Batch Endpoint
    try {
      const rawStrings = itemsList.map((i) => i.raw);
      const res = await fetch('/api/certificate/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rawStrings })
      });

      const data = await res.json();
      setProcessProgress(80);

      if (data.success && Array.isArray(data.results)) {
        // Enhance with client side Firebase double check if any marked invalid
        const finalResults: AuditItemResult[] = [];
        for (let idx = 0; idx < data.results.length; idx++) {
          const resItem = data.results[idx];
          const orig: { source: 'image' | 'csv' | 'text' | 'demo'; raw: string; name?: string } = itemsList[idx] || { source: 'text', raw: resItem.rawInput, name: undefined };
          
          let finalFound = resItem.found;
          let finalCert = resItem.certificate;
          let finalStatus = resItem.status;
          let finalScore = resItem.riskScore;
          let finalMsg = resItem.statusMessage;

          // If not found in memory backend, attempt Firebase lookup
          if (!finalFound) {
            try {
              const fbCert = await searchCertificateInFirebase(resItem.memoNo || resItem.rawInput);
              if (fbCert) {
                finalFound = true;
                finalCert = fbCert;
                finalStatus = fbCert.status || 'issued';
                finalScore = (finalStatus === 'issued' || finalStatus === 'approved') ? 100 : 60;
                finalMsg = 'ফায়ারবেস ক্লাউড ডাটাবেসে নিবন্ধিত পাওয়া গিয়াছে';
              }
            } catch (err) {
              // keep as not found
            }
          }

          finalResults.push({
            id: `audit_${Date.now()}_${idx}`,
            rawInput: orig.raw,
            sourceType: orig.source,
            sourceName: orig.name,
            memoNo: resItem.memoNo || orig.raw,
            found: finalFound,
            status: finalStatus,
            riskScore: finalScore,
            statusMessage: finalMsg,
            certificate: finalCert,
            verifiedAt: new Date().toISOString()
          });
        }

        setAuditResults(finalResults);
      } else {
        alert('অডিট প্রক্রিয়াকরণে সমস্যা: ' + (data.error || 'অজানা ত্রুটি'));
      }
    } catch (err: any) {
      alert('ভেরিফিকেশন সার্ভার ত্রুটি: ' + err.message);
    } finally {
      setProcessProgress(100);
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  // One-click Demo Batch Loader
  const loadDemoBatch = () => {
    setActiveTab('demo');
    const demoItems: { raw: string; source: 'demo'; name?: string }[] = [
      { raw: 'BUP-2026-1082', source: 'demo', name: 'মোঃ আতিকুর রহমান (নাগরিকত্ব)' },
      { raw: 'BUP-2026-1095', source: 'demo', name: 'মোছাঃ পারভীন আক্তার (ওয়ারিশ)' },
      { raw: 'BUP-2026-1102', source: 'demo', name: 'মোঃ জলিল শেখ (পেন্ডিং আবেদন)' },
      { raw: 'BUP-2026-1108', source: 'demo', name: 'মোঃ জহিরুল ইসলাম (আয়ের সনদ)' },
      { raw: 'BUP-2026-9999-FAKE', source: 'demo', name: 'অবৈধ জাল সনদপত্র (Test)' },
      { raw: 'BUP-2025-0041-FAKE', source: 'demo', name: 'ভুয়া স্মারক কিউআর (Test)' }
    ];
    startBulkAudit(demoItems);
  };

  // Export Audit Findings as CSV
  const exportAuditCsv = () => {
    if (!auditResults || auditResults.length === 0) return;
    let csv = `ক্রমিক,উৎস,স্মারক নম্বর,নাগরিকের নাম,সনদের ধরন,ভেরিফিকেশন স্ট্যাটাস,সত্যতা স্কোর (%),নিরীক্ষার বার্তা,তারিখ\n`;
    
    auditResults.forEach((item, idx) => {
      const name = item.certificate?.citizen.name || 'N/A';
      const type = item.certificate?.typeLabel || 'N/A';
      const statusText = item.found 
        ? (item.status === 'issued' || item.status === 'approved' ? 'সত্যায়িত ও বৈধ' : 'পেন্ডিং') 
        : 'নকল/অবৈধ';
      
      csv += `"${idx + 1}","${item.sourceName || item.sourceType}","${item.memoNo}","${name}","${type}","${statusText}","${item.riskScore}%","${item.statusMessage}","${item.verifiedAt}"\n`;
    });

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UP_Bulk_QR_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter audit results
  const filteredResults = (auditResults || []).filter((item) => {
    // Status filter
    if (statusFilter === 'valid' && (!item.found || (item.status !== 'issued' && item.status !== 'approved'))) return false;
    if (statusFilter === 'invalid' && item.found && item.status !== 'cancelled') return false;
    if (statusFilter === 'pending' && item.status !== 'pending_approval') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const memo = item.memoNo.toLowerCase();
      const name = (item.certificate?.citizen.name || '').toLowerCase();
      const village = (item.certificate?.citizen.village || '').toLowerCase();
      return memo.includes(q) || name.includes(q) || village.includes(q);
    }
    return true;
  });

  // Calculate summary stats
  const totalCount = auditResults?.length || 0;
  const validCount = auditResults?.filter((r) => r.found && (r.status === 'issued' || r.status === 'approved')).length || 0;
  const pendingCount = auditResults?.filter((r) => r.found && r.status === 'pending_approval').length || 0;
  const invalidCount = auditResults?.filter((r) => !r.found || r.status === 'cancelled').length || 0;
  const authenticityRate = totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-emerald-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  প্রশাসনিক ড্যাশবোর্ড
                </span>
                <span className="bg-emerald-800 text-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  ব্যাচ কিউআর অডিট
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                বাল্ক কিউআর কোড সত্যতা যাচাই ও দ্রুত অডিট টুল
              </h2>
              <p className="text-xs md:text-sm text-emerald-200 mt-1">
                {config.upName} — একসাথে একাধিক কিউআর ছবি বা সিএসভি স্মারক তালিকা আপলোড করে তাৎক্ষণিক সত্যতা নিরীক্ষা করুন।
              </p>
            </div>
          </div>

          <button
            onClick={loadDemoBatch}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-xl border border-emerald-600 transition shadow flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>১-ক্লিক ডেমো অডিট চালান</span>
          </button>
        </div>
      </div>

      {/* Main Mode Input Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'image'
                ? 'bg-emerald-800 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>১. কিউআর ছবি ও স্ক্যান গ্যালোরি</span>
            {imageFiles.length > 0 && (
              <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                {imageFiles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'csv'
                ? 'bg-emerald-800 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>২. সিএসভি / টেক্সট ফাইল ও তালিকা</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">নিরীক্ষক পদবী:</span>
            <select
              value={inspectorRole}
              onChange={(e) => setInspectorRole(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
            >
              <option value="ইউপি প্রশাসনিক কর্মকর্তা (সচিব)">ইউপি সচিব</option>
              <option value="ইউপি চেয়ারম্যান কার্যালয়">ইউপি চেয়ারম্যান</option>
              <option value="উপজেলা অডিট অফিসার">উপজেলা অডিট অফিসার</option>
              <option value="এনএসআই/আইন প্রয়োগকারী সংস্থা">আইন প্রয়োগকারী কর্মকর্তা</option>
              <option value="ইউডি উদ্যোক্তা">ইউডি উদ্যোক্তা</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Image Files Drag & Drop */}
        {activeTab === 'image' && (
          <div className="p-6 space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropImages}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition space-y-3 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-110 transition shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  ডিজিটাল প্রত্যয়নপত্রের কিউআর ছবিসমূহ এখানে ড্র্যাগ করুন অথবা ক্লিক করিয়া সিলেক্ট করুন
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  একাধিক PNG, JPG, JPEG, WEBP ফাইল নির্বাচন করা যাইবে (স্বয়ংক্রিয় Canvas QR Decode সমর্থিত)।
                </p>
              </div>
            </div>

            {/* Selected Image Thumbnails Grid */}
            {imagePreviewUrls.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    নির্বাচিত ছবিসমূহ ({imagePreviewUrls.length} টি):
                  </span>
                  <button
                    onClick={clearImages}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    সব মুছে ফেলুন
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {imagePreviewUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                      <img src={url} alt={`QR Upload ${i}`} className="w-full h-24 object-cover opacity-90 group-hover:opacity-100" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                        title="ফাইল বাদ দিন"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[10px] text-emerald-300 p-1 truncate text-center font-mono">
                        {imageFiles[i]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => startBulkAudit()}
                disabled={isProcessing || imageFiles.length === 0}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                <span>ব্যাচ স্ক্যান ও সত্যতা পরীক্ষা শুরু করুন ({imageFiles.length} টি)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: CSV / Text List Entry */}
        {activeTab === 'csv' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                স্মারক নম্বর বা কিউআর ইউআরএল এর তালিকা পেস্ট করুন (প্রতি লাইনে বা কমা দিয়ে পৃথকীকৃত):
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`BUP-2026-1082\nBUP-2026-1095\nBUP-2026-1102\nBUP-2026-1108\nhttps://baheratailup.gov.bd/verify/BUP-2026-9999`}
                className="w-full p-4 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>* স্মারক নম্বর যেমন BUP-2026-1082 স্বয়ংক্রিয় ফিল্টার করা হইবে।</span>
              <button
                onClick={() => setCsvText("BUP-2026-1082, BUP-2026-1095, BUP-2026-1102, BUP-2026-1108, BUP-2026-9999")}
                className="text-emerald-700 font-bold hover:underline"
              >
                + নমুনা স্মারক তালিকা বসান
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => startBulkAudit()}
                disabled={isProcessing || !csvText.trim()}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                <span>স্মারক তালিকা যাচাই করুন</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar Indicator */}
      {isProcessing && (
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
              <span>ডাটাবেসে প্রত্যয়নপত্রসমূহের ডিজিটাল সত্যতা যাচাই প্রক্রিয়া চলিতেছে...</span>
            </span>
            <span className="text-emerald-700 font-mono text-sm">{processProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-emerald-600 to-amber-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${processProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Audit Findings Results Dashboard */}
      {auditResults && !isProcessing && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-xs font-bold text-slate-500">মোট নিরীক্ষিত সনদ</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount} টি</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ব্যাচ স্ক্যান সমাপ্য</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-200">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>সত্যায়িত ও আসল</span>
              </p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{validCount} টি</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">সরকারি রেকর্ডের সহিত মিল আছে</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-200">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>অনুমোদন অপেক্ষায়</span>
              </p>
              <p className="text-2xl font-black text-amber-900 mt-1">{pendingCount} টি</p>
              <p className="text-[11px] text-amber-700 mt-0.5">চেয়ারম্যান সাক্ষর বাকি</p>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl shadow-sm border border-red-200">
              <p className="text-xs font-bold text-red-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>ভুয়া / অনিবন্ধিত</span>
              </p>
              <p className="text-2xl font-black text-red-900 mt-1">{invalidCount} টি</p>
              <p className="text-[11px] text-red-700 mt-0.5">ঝুঁকিপূর্ণ / নকল সনদ</p>
            </div>
          </div>

          {/* Authenticity Index Bar & Export Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-slate-900 text-sm">
                  অডিট স্ক্যান সত্যতা সূচক (Authenticity Score):
                </h4>
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-full ${
                  authenticityRate >= 80 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                }`}>
                  {authenticityRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                নিরীক্ষক: <span className="font-semibold text-slate-700">{inspectorRole}</span> | তারিখ: {new Date().toLocaleDateString('bn-BD')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportAuditCsv}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>অডিট রিপোর্ট সিএসভি ডাউনলোড</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* Audit Results Table Section */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সবগুলো ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('valid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'valid' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  সত্যায়িত ({validCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'pending' ? 'bg-amber-500 text-white shadow' : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  পেন্ডিং ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('invalid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'invalid' ? 'bg-red-600 text-white shadow' : 'text-red-700 hover:bg-red-100'
                  }`}
                >
                  অবৈধ/ভুয়া ({invalidCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="স্মারক বা নাম খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3 text-center">#</th>
                    <th className="p-3">স্মারক নম্বর</th>
                    <th className="p-3">নাগরিক ও গ্রাম</th>
                    <th className="p-3">সনদের ধরন</th>
                    <th className="p-3">স্ট্যাটাস ও ভ্যালিডিটি</th>
                    <th className="p-3 text-center">স্কোর</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                        কোনো ফলাফল পাওয়া যায় নাই।
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          <div>{item.memoNo}</div>
                          {item.sourceName && (
                            <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                              {item.sourceName}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {item.certificate ? (
                            <div>
                              <p className="font-bold text-slate-900">{item.certificate.citizen.name}</p>
                              <p className="text-[11px] text-slate-500">
                                গ্রাম: {item.certificate.citizen.village}, ওয়ার্ড {item.certificate.citizen.wardNo}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">অজ্ঞাত/অবৈধ</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700 font-medium">
                          {item.certificate?.typeLabel || item.rawInput}
                        </td>
                        <td className="p-3">
                          {item.found ? (
                            item.status === 'issued' || item.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>সত্যায়িত ও আসল</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>অনুমোদন অপেক্ষায়</span>
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-300">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              <span>নকল / ভুয়া</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            item.riskScore === 100 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.riskScore > 0 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800 font-black'
                          }`}>
                            {item.riskScore}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {item.certificate ? (
                            <button
                              onClick={() => setInspectCert(item.certificate || null)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300 transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>কপি দেখুন</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-red-500 font-bold">ফ্ল্যাগড রেকর্ড</span>
                          )}
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

      {/* Certificate Detailed Inspector Modal */}
      {inspectCert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  অডিট ইন্সপেক্টর: সনদপত্র যাচাইকরণ বিস্তারিত
                </h3>
              </div>
              <button
                onClick={() => setInspectCert(null)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <CertificateView certificate={inspectCert} config={config} />

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectCert(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
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
