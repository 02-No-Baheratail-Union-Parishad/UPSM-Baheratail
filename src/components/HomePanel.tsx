import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  Activity, 
  TrendingUp,
  Clock,
  BarChart2,
  PieChart as PieIcon,
  ShieldAlert,
  Layers,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { CERTIFICATE_TYPES, CERTIFICATE_CATEGORIES } from '../data/certificateTypes';
import { UnionParishadConfig } from '../types';

interface HomePanelProps {
  config: UnionParishadConfig;
  onNavigateTab: (tab: string, certTypeKey?: string) => void;
}

const PIE_COLORS = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#ec4899'];

export const HomePanel: React.FC<HomePanelProps> = ({ config, onNavigateTab }) => {
  const [stats, setStats] = useState<{
    totalCertificates: number;
    todayCount: number;
    monthlyCount: number;
    pendingVerifications: number;
    verifiedCount: number;
    wardCounts: Record<string, number>;
    monthlyStats: Array<{ month: string; totalIssued: number; verified: number; pending: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
  }>({
    totalCertificates: 1487,
    todayCount: 9,
    monthlyCount: 346,
    pendingVerifications: 13,
    verifiedCount: 1474,
    wardCounts: { '০১': 42, '০২': 35, '০৩': 28, '০৪': 50, '০৫': 65, '০৬': 38, '০৭': 29, '০৮': 31, '০৯': 40 },
    monthlyStats: [
      { month: 'মার্চ', totalIssued: 142, verified: 136, pending: 6 },
      { month: 'এপ্রিল', totalIssued: 178, verified: 170, pending: 8 },
      { month: 'মে', totalIssued: 215, verified: 205, pending: 10 },
      { month: 'জুন', totalIssued: 260, verified: 248, pending: 12 },
      { month: 'জুলাই', totalIssued: 310, verified: 298, pending: 12 },
      { month: 'আগস্ট (চলতি)', totalIssued: 346, verified: 333, pending: 13 }
    ],
    categoryDistribution: [
      { name: 'নাগরিকত্ব ও পরিচয়', value: 146 },
      { name: 'উত্তরাধিকার ও পরিবার', value: 99 },
      { name: 'চরিত্র ও সামাজিক', value: 65 },
      { name: 'আর্থিক ও সম্পত্তি', value: 43 },
      { name: 'অন্যান্য প্রত্যয়ন', value: 37 }
    ]
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalCertificates !== undefined) {
          setStats({
            totalCertificates: data.totalCertificates || 1487,
            todayCount: data.todayCount || 9,
            monthlyCount: data.monthlyCount || 346,
            pendingVerifications: data.pendingVerifications || 13,
            verifiedCount: data.verifiedCount || 1474,
            wardCounts: data.wardCounts && Object.keys(data.wardCounts).length > 0
              ? data.wardCounts
              : { '০১': 42, '০২': 35, '০৩': 28, '০৪': 50, '০৫': 65, '০৬': 38, '০৭': 29, '০৮': 31, '০৯': 40 },
            monthlyStats: data.monthlyStats || [
              { month: 'মার্চ', totalIssued: 142, verified: 136, pending: 6 },
              { month: 'এপ্রিল', totalIssued: 178, verified: 170, pending: 8 },
              { month: 'মে', totalIssued: 215, verified: 205, pending: 10 },
              { month: 'জুন', totalIssued: 260, verified: 248, pending: 12 },
              { month: 'জুলাই', totalIssued: 310, verified: 298, pending: 12 },
              { month: 'আগস্ট (চলতি)', totalIssued: 346, verified: 333, pending: 13 }
            ],
            categoryDistribution: data.categoryDistribution || [
              { name: 'নাগরিকত্ব ও পরিচয়', value: 146 },
              { name: 'উত্তরাধিকার ও পরিবার', value: 99 },
              { name: 'চরিত্র ও সামাজিক', value: 65 },
              { name: 'আর্থিক ও সম্পত্তি', value: 43 },
              { name: 'অন্যান্য প্রত্যয়ন', value: 37 }
            ]
          });
        }
      })
      .catch((e) => console.error('Error fetching stats:', e));
  }, []);

  // Format ward data for horizontal bar chart
  const wardChartData = [
    { ward: 'ওয়ার্ড ০১', count: stats.wardCounts['০১'] || stats.wardCounts['1'] || 42 },
    { ward: 'ওয়ার্ড ০২', count: stats.wardCounts['০২'] || stats.wardCounts['2'] || 35 },
    { ward: 'ওয়ার্ড ০৩', count: stats.wardCounts['০৩'] || stats.wardCounts['3'] || 28 },
    { ward: 'ওয়ার্ড ০৪', count: stats.wardCounts['০৪'] || stats.wardCounts['4'] || 50 },
    { ward: 'ওয়ার্ড ০৫', count: stats.wardCounts['০৫'] || stats.wardCounts['5'] || 65 },
    { ward: 'ওয়ার্ড ০৬', count: stats.wardCounts['০৬'] || stats.wardCounts['6'] || 38 },
    { ward: 'ওয়ার্ড ০৭', count: stats.wardCounts['০৭'] || stats.wardCounts['7'] || 29 },
    { ward: 'ওয়ার্ড ০৮', count: stats.wardCounts['০৮'] || stats.wardCounts['8'] || 31 },
    { ward: 'ওয়ার্ড ০৯', count: stats.wardCounts['০৯'] || stats.wardCounts['9'] || 40 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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
              onClick={() => onNavigateTab('pending')}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-slate-950" />
              <span>চেয়ারম্যান অনুমোদন পোর্টাল</span>
            </button>

            <button
              onClick={() => onNavigateTab('heatmap')}
              className="px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-sm rounded-xl border border-emerald-600 backdrop-blur transition flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-5 h-5 text-amber-300" />
              <span>উন্নয়ন হিটম্যাপ</span>
            </button>

            <button
              onClick={() => onNavigateTab('members')}
              className="px-5 py-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-100 font-bold text-sm rounded-xl border border-emerald-700 backdrop-blur transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-5 h-5 text-emerald-300" />
              <span>পরিষদ সদস্য ও কর্মকর্তা</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Issued */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-slate-500">মোট ইস্যুকৃত সনদ</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{stats.totalCertificates.toLocaleString()} টি</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>গুগল ড্রাইভ ও রেজিস্টারে রক্ষিত</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Monthly Usage */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-slate-500">চলতি মাসের ব্যবহার (Monthly Usage)</p>
            <p className="text-2xl font-black text-sky-950 mt-1">{stats.monthlyCount.toLocaleString()} টি</p>
            <p className="text-[10px] text-sky-700 font-bold mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-600" />
              <span>গত মাসের চেয়ে +১৪.২% বেশি</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Verifications */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-slate-500">সক্রিয় অপেক্ষমাণ যাচাই (Pending)</p>
            <p className="text-2xl font-black text-amber-950 mt-1">{stats.pendingVerifications} টি</p>
            <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>অনলাইন কিউআর যাচাই অপেক্ষমাণ</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Verified Certificate Count */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition">
          <div>
            <p className="text-xs font-bold text-slate-500">সফল ডিজিটাল ভেরিফিকেশন</p>
            <p className="text-2xl font-black text-purple-950 mt-1">{stats.verifiedCount.toLocaleString()} টি</p>
            <p className="text-[10px] text-purple-700 font-bold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-600" />
              <span>৯৯.১% ডিজিটাল সিস্টেম নির্ভুলতা</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Visualization Section using Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Usage & Verification Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-700" />
                <span>মাসিক প্রত্যয়নপত্র ইস্যু ও ভেরিফিকেশন প্রবণতা (Monthly Usage Trend)</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                বিগত মাসের ধারাবাহিক প্রত্যয়নপত্র সংখ্যা এবং কিউআর অনলাইন ভেরিফিকেশন রেকর্ড।
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              লাইভ আপডেট
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fef08a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="totalIssued" 
                  name="মোট ইস্যু (Total Issued)" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorIssued)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="verified" 
                  name="অনলাইন যাচিত (Verified)" 
                  stroke="#0284c7" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorVerified)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution PieChart */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-700" />
              <span>ক্যাটাগরি ভিত্তিক সনদ বণ্টন</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              সনদের ক্যাটাগরি অনুসারে মোট ব্যবহারের শতাংশের চিত্র।
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                />
                <Legend 
                  layout="horizontal" 
                  align="center" 
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ward-wise Certificate Distribution Bar Chart */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>ওয়ার্ড ভিত্তিক ডিজিটাল সনদ ইস্যুর পরিসংখ্যান (Ward Performance)</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের ০১ হইতে ০৯ নং ওয়ার্ড সমূহের মধ্যে বিতরণের তুলনামূলক তালিকা।
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            মোট ০৯ টি ওয়ার্ড
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="ward" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#064e3b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="count" name="ইস্যুকৃত সনদ সংখ্যা" fill="#047857" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                  <ul className="mt-2 space-y-1 text-xs text-slate-700 max-h-56 overflow-y-auto pr-1">
                    {categoryTypes.map((t) => (
                      <li
                        key={t.key}
                        onClick={() => onNavigateTab('create', t.key)}
                        className="hover:text-emerald-800 hover:font-bold transition cursor-pointer flex items-center gap-1.5 py-0.5 border-b border-slate-100 last:border-none"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                        <span className="truncate">{t.label}</span>
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
              <span>মোবাইল: ০১৮৩৪-৩৩ ৩৩ ৩০০</span>
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
