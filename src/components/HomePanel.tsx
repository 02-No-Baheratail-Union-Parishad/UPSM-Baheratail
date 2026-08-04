import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Users, 
  Building2, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  UserCheck, 
  Activity, 
  Search 
} from 'lucide-react';
import { CERTIFICATE_TYPES, CERTIFICATE_CATEGORIES } from '../data/certificateTypes';
import { UnionParishadConfig } from '../types';

interface HomePanelProps {
  config: UnionParishadConfig;
  onNavigateTab: (tab: string, certTypeKey?: string) => void;
}

export const HomePanel: React.FC<HomePanelProps> = ({ config, onNavigateTab }) => {
  const [stats, setStats] = useState<{
    totalCertificates: number;
    todayCount: number;
    wardCounts: Record<string, number>;
  }>({
    totalCertificates: 2,
    todayCount: 1,
    wardCounts: { '০১': 1, '০৫': 1 }
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalCertificates !== undefined) {
          setStats({
            totalCertificates: data.totalCertificates,
            todayCount: data.todayCount || 0,
            wardCounts: data.wardCounts || {}
          });
        }
      })
      .catch((e) => console.error('Error fetching stats:', e));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 md:p-10 shadow-2xl border border-emerald-800/80 overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end">
          <img src={config.logoUrl} alt="Logo Bg" className="w-96 h-96 object-contain translate-x-12" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-700/80">
            <Sparkles className="w-4 h-4 fill-amber-300" />
            <span>ডিজিটাল বাংলাদেশ ২০৪১ - স্মার্ট ইউপি অটোমেশন সিস্টেম</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {config.upName}
          </h1>

          <p className="text-sm md:text-base text-emerald-200 leading-relaxed">
            গুগল ওয়ার্কস্পেস ও Gemini AI প্রযুক্তিতে পরিচালিত ৪০+ প্রকার প্রাতিষ্ঠানিক প্রত্যয়নপত্র অটোমেশন, ডিজিটাল কিউআর যাচাইকরণ এবং দাপ্তরিক রেজিস্টার ব্যবস্থাপনা।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('create')}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-emerald-950 fill-emerald-950" />
              <span>স্মার্ট সনদ জেনারেট করুন</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>

            <button
              onClick={() => onNavigateTab('verify')}
              className="px-5 py-3 bg-emerald-800/90 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl border border-emerald-700 backdrop-blur transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span>সনদ অনলাইন ভেরিফিকেশন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">মোট ইস্যুকৃত সনদ</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{stats.totalCertificates} টি</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">গুগল ড্রাইভে রক্ষিত</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">আজকের ডিজিটাল ইস্যু</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{stats.todayCount} টি</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">তাৎক্ষণিক এআই সেশন</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">মোট ওয়ার্ড সংখ্যা</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">০৯ টি</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">০১ হইতে ০৯ নং ওয়ার্ড</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">সমর্থিত সনদের ধরন</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">৪০+ টি</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">ওয়ারিশ, চারিত্রিক ইত্যাদি</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Categorized Certificate Services Hub */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>৪০+ প্রকার ডিজিটাল প্রত্যয়নপত্রের সেবাসমূহ</span>
            </h2>
            <p className="text-xs text-slate-500">
              যেকোনো সনদে ক্লিক করিয়া সরাসরি আবেদন বা অনলাইন কপি জেনারেট করুন।
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('create')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>সকল ধরন দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CERTIFICATE_CATEGORIES.filter((c) => c !== 'সব ধরন').map((cat) => {
            const categoryTypes = CERTIFICATE_TYPES.filter((t) => t.category === cat);
            return (
              <div key={cat} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs text-emerald-950 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>{cat}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {categoryTypes.length} টি
                    </span>
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {categoryTypes.slice(0, 4).map((t) => (
                      <li
                        key={t.key}
                        onClick={() => onNavigateTab('create', t.key)}
                        className="hover:text-emerald-800 hover:font-bold transition cursor-pointer flex items-center gap-1.5 py-0.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span>{t.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigateTab('create')}
                  className="w-full text-center py-1.5 bg-white hover:bg-emerald-800 hover:text-white border border-slate-300 text-emerald-900 font-bold text-[11px] rounded-lg transition cursor-pointer"
                >
                  এই ক্যাটাগরির সনদ তৈরি করুন
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chairman Info & Official Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chairman Badge */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-2xl shadow border border-emerald-800 flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-white p-1 shadow-lg">
            <img src={config.logoUrl} alt="Seal" className="w-full h-full object-contain" />
          </div>

          <div>
            <h3 className="font-bold text-base text-white">{config.chairmanName}</h3>
            <p className="text-xs text-amber-300 font-semibold">{config.chairmanTitle}</p>
            <p className="text-[11px] text-emerald-200 mt-1">{config.upName}</p>
            <p className="text-[10px] text-emerald-300">{config.address}</p>
          </div>

          <div className="pt-2 border-t border-emerald-800 w-full text-[11px] text-emerald-200 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>মোবাইল: ০১৮৩৪-৩৩৩৩৩০০</span>
            </p>
          </div>
        </div>

        {/* Notice & Feature Highlights */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-emerald-950 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>অফিসিয়াল বিজ্ঞপ্তি ও ডিজিটাল অটোমেশন গাইড</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>স্বয়ংক্রিয় এআই ভাষা অনুবাদ</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Gemini AI এর মাধ্যমে সকল প্রকার অগোছালো তথ্যকে ৪-৫ লাইনের প্রাতিষ্ঠানিক দাপ্তরিক সুন্দর বাংলায় রূপান্তর করা হয়।
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>কিউআর কোড ভেরিফিকেশন</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                প্রতিটি সনদে একটি অনন্য কিউআর কোড যুক্ত থাকে যা স্ক্যান করিলে মোবাইলে আসল কপি প্রদর্শিত হইবে।
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>দ্বিমুখী প্রিন্টিং অপশন</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                অফিসিয়াল প্রি-প্রিন্টেড প্যাডে প্রিন্ট করার জন্য এক ক্লিকে হেডার অন/অফ করার সুবিধা রহিয়াছে।
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>গুগল ড্রাইভ ও শিট সিঙ্ক</span>
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                ইস্যুকৃত সকল তথ্য গুগল শিটে অটো-লগ হয় এবং পিডিএফ ফাইল ড্রাইভে সংরক্ষিত থাকে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
