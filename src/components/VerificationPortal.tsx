import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Building2, 
  User, 
  MapPin, 
  Award, 
  FileCheck 
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { CertificateView } from './CertificateView';

interface VerificationPortalProps {
  config: UnionParishadConfig;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ config }) => {
  const [memoInput, setMemoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    found: boolean;
    certificate?: CertificateRecord;
    message?: string;
  } | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memoInput.trim()) return;

    setLoading(true);
    setVerificationData(null);

    try {
      const res = await fetch(`/api/certificate/verify/${encodeURIComponent(memoInput.trim())}`);
      const data = await res.json();
      setVerificationData(data);
    } catch (err) {
      setVerificationData({
        found: false,
        message: 'যাচাইকরণ সার্ভারে সংযোগে ত্রুটি ঘটিয়াছে।'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Verification Input Header Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-emerald-800 text-center space-y-4">
        <div className="inline-flex p-3 bg-emerald-800/80 rounded-full border border-emerald-700 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-amber-300" />
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            ডিজিটাল প্রত্যয়নপত্র ভেরিফিকেশন ও অনলাইন সত্যতা যাচাই
          </h2>
          <p className="text-xs md:text-sm text-emerald-200 mt-1 max-w-xl mx-auto">
            {config.upName} কর্তৃক ইস্যুকৃত সকল সনদের কিউআর কোড বা স্মারক নম্বর টাইপ করিয়া আসল কপির সত্যতা অনলাইন ডাটাবেস হইতে পরীক্ষা করুন।
          </p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="স্মারক নম্বর লিখুন (যেমন: BUP-2026-1082)"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              className="w-full px-4 py-3 bg-emerald-900/90 border-2 border-emerald-700 text-white placeholder-emerald-300 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span>সত্যতা যাচাই করুন</span>
          </button>
        </form>
      </div>

      {/* Verification Result Section */}
      {verificationData && (
        <div className="animate-fade-in space-y-6">
          {verificationData.found && verificationData.certificate ? (
            <div className="space-y-6">
              {/* Authenticated Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="inline-block bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-0.5">
                      অফিশিয়ালি সত্যায়িত ও বৈধ
                    </span>
                    <h3 className="text-lg font-extrabold text-emerald-950">
                      উক্ত স্মারক নম্বরটি {config.upName} এর অফিসিয়াল ডাটাবেসে সংরক্ষিত রহিয়াছে।
                    </h3>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">ইস্যুর তারিখ: {verificationData.certificate.issueDate}</p>
                  <p className="text-slate-500">অনুমোদনকারী: {verificationData.certificate.issuedBy}</p>
                </div>
              </div>

              {/* Citizen Details Quick Summary Box */}
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-slate-500">নাগরিকের নাম:</p>
                    <p className="font-bold text-slate-900 text-sm">{verificationData.certificate.citizen.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-slate-500">সনদের ধরন:</p>
                    <p className="font-bold text-slate-900 text-sm">{verificationData.certificate.typeLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-slate-500">ঠিকানা ও ওয়ার্ড:</p>
                    <p className="font-bold text-slate-900 text-sm">
                      গ্রাম: {verificationData.certificate.citizen.village}, ওয়ার্ড নং {verificationData.certificate.citizen.wardNo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Certificate Document Display */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300">
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>ডিজিটাল প্রত্যয়নপত্রের পূর্ণাঙ্গ কপি:</span>
                </h4>
                <CertificateView certificate={verificationData.certificate} config={config} />
              </div>
            </div>
          ) : (
            /* Not Found Banner */
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">
                  ⚠️ কোনো রেকর্ডের মিল পাওয়া যায় নাই!
                </h3>
                <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
                  {verificationData.message || 'আপনার প্রদানকৃত স্মারক বা সনদ নম্বরটি সঠিক নয় অথবা অনলাইন ডাটাবেসে নিবন্ধিত হয় নাই। অনুগ্রহ করে সঠিক নম্বর প্রদান করুন।'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
