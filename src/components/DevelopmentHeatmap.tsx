import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from 'recharts';
import * as d3 from 'd3';
import {
  TrendingUp,
  GraduationCap,
  HeartPulse,
  Building2,
  Cpu,
  Sprout,
  Award,
  Filter,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  Search,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
  PlusCircle,
  Sliders
} from 'lucide-react';
import { UnionParishadConfig } from '../types';

interface DevelopmentHeatmapProps {
  config: UnionParishadConfig;
}

// Initial Ward Development Data
export interface WardDevelopmentData {
  wardNo: string;
  wardName: string;
  villageName: string;
  education: number;      // 0-100
  healthcare: number;     // 0-100
  infrastructure: number; // 0-100
  digitalServices: number;// 0-100
  agriEconomy: number;    // 0-100
  population: number;
  projectsCompleted: number;
  ongoingProjects: number;
  topAchievement: string;
}

const INITIAL_WARD_DATA: WardDevelopmentData[] = [
  {
    wardNo: '০১',
    wardName: '০১ নং ওয়ার্ড',
    villageName: 'বহেড়াতৈল উত্তর',
    education: 88,
    healthcare: 76,
    infrastructure: 82,
    digitalServices: 95,
    agriEconomy: 78,
    population: 4250,
    projectsCompleted: 14,
    ongoingProjects: 3,
    topAchievement: 'বহেড়াতৈল হাই স্কুলে শেখ রাসেল ডিজিটাল ল্যাব স্থাপন',
  },
  {
    wardNo: '০২',
    wardName: '০২ নং ওয়ার্ড',
    villageName: 'বহেড়াতৈল দক্ষিণ',
    education: 84,
    healthcare: 82,
    infrastructure: 79,
    digitalServices: 92,
    agriEconomy: 85,
    population: 3980,
    projectsCompleted: 12,
    ongoingProjects: 2,
    topAchievement: 'কমিউনিটি ক্লিনিক আধুনিকায়ন ও সোলার সিস্টেম চালু',
  },
  {
    wardNo: '০৩',
    wardName: '০৩ নং ওয়ার্ড',
    villageName: 'ইন্দারজানী',
    education: 92,
    healthcare: 88,
    infrastructure: 91,
    digitalServices: 98,
    agriEconomy: 89,
    population: 5120,
    projectsCompleted: 18,
    ongoingProjects: 4,
    topAchievement: '১০০% ডোর-টু-ডোর ডিজিটাল হোল্ডিং ট্যাক্স ও সনদ কভারেজ',
  },
  {
    wardNo: '০৪',
    wardName: '০৪ নং ওয়ার্ড',
    villageName: 'গোহালিয়া বাড়ি',
    education: 79,
    healthcare: 71,
    infrastructure: 86,
    digitalServices: 89,
    agriEconomy: 94,
    population: 4600,
    projectsCompleted: 11,
    ongoingProjects: 5,
    topAchievement: 'কৃষকদের জন্য ২ কিমি পাকা ড্রেনেজ ও সেচ নালা নির্মাণ',
  },
  {
    wardNo: '০৫',
    wardName: '০৫ নং ওয়ার্ড',
    villageName: 'গায়েনপাড়া',
    education: 86,
    healthcare: 80,
    infrastructure: 74,
    digitalServices: 91,
    agriEconomy: 82,
    population: 3850,
    projectsCompleted: 10,
    ongoingProjects: 2,
    topAchievement: 'গায়েনপাড়া প্রাথমিক বিদ্যালয়ে আইসিটি ভবন নির্মাণ',
  },
  {
    wardNo: '০৬',
    wardName: '০৬ নং ওয়ার্ড',
    villageName: 'কড়ইচালা',
    education: 81,
    healthcare: 75,
    infrastructure: 88,
    digitalServices: 87,
    agriEconomy: 91,
    population: 4300,
    projectsCompleted: 13,
    ongoingProjects: 3,
    topAchievement: 'কড়ইচালা বাজার প্রধান সড়কে সোলার স্ট্রিট লাইট স্থাপন',
  },
  {
    wardNo: '০৭',
    wardName: '০৭ নং ওয়ার্ড',
    villageName: 'ঘোনার চালা',
    education: 78,
    healthcare: 85,
    infrastructure: 72,
    digitalServices: 88,
    agriEconomy: 87,
    population: 3600,
    projectsCompleted: 9,
    ongoingProjects: 4,
    topAchievement: 'মা ও শিশু চিকিৎসা কেন্দ্রে ২৪/৭ সার্বক্ষণিক অ্যাম্বুলেন্স সেবা',
  },
  {
    wardNo: '০৮',
    wardName: '০৮ নং ওয়ার্ড',
    villageName: 'কালিয়া চক',
    education: 83,
    healthcare: 73,
    infrastructure: 78,
    digitalServices: 90,
    agriEconomy: 88,
    population: 3900,
    projectsCompleted: 11,
    ongoingProjects: 2,
    topAchievement: 'গভীর নলকূপ ও আর্সেনিকমুক্ত নিরাপদ পানি সরাবরাহ',
  },
  {
    wardNo: '০৯',
    wardName: '০৯ নং ওয়ার্ড',
    villageName: 'সোনাটিয়া',
    education: 85,
    healthcare: 79,
    infrastructure: 80,
    digitalServices: 93,
    agriEconomy: 83,
    population: 4100,
    projectsCompleted: 12,
    ongoingProjects: 3,
    topAchievement: 'স্মার্ট কৃষি ক্লাস্টার ও বিষমুক্ত সবজি উৎপাদন জোন',
  },
];

// Union Comparative Data (Current UP vs Neighboring UPs in Sakhipur)
const UNION_COMPARISON_DATA = [
  {
    indexName: 'শিক্ষা সূচক',
    key: 'education',
    baheratail: 84.2,
    kakadajan: 76.5,
    hoteya: 79.1,
    borochapa: 72.8,
  },
  {
    indexName: 'স্বাস্থ্যসেবা সূচক',
    key: 'healthcare',
    baheratail: 78.7,
    kakadajan: 72.0,
    hoteya: 75.4,
    borochapa: 69.5,
  },
  {
    indexName: 'অবকাঠামো সূচক',
    key: 'infrastructure',
    baheratail: 81.1,
    kakadajan: 74.8,
    hoteya: 77.2,
    borochapa: 71.0,
  },
  {
    indexName: 'ডিজিটাল সেবা সূচক',
    key: 'digitalServices',
    baheratail: 91.8,
    kakadajan: 78.3,
    hoteya: 82.5,
    borochapa: 74.0,
  },
  {
    indexName: 'কৃষি ও অর্থনীতি',
    key: 'agriEconomy',
    baheratail: 85.2,
    kakadajan: 81.0,
    hoteya: 83.4,
    borochapa: 78.6,
  },
];

// Radar Chart Comparative Metrics across Unions
const RADAR_UNION_DATA = [
  { subject: 'শিক্ষা (Education)', Baheratail: 84, Kakadajan: 76, Hoteya: 79, fullMark: 100 },
  { subject: 'স্বাস্থ্য (Health)', Baheratail: 79, Kakadajan: 72, Hoteya: 75, fullMark: 100 },
  { subject: 'অবকাঠামো (Infra)', Baheratail: 81, Kakadajan: 75, Hoteya: 77, fullMark: 100 },
  { subject: 'ডিজিটাল সেবা (Digital)', Baheratail: 92, Kakadajan: 78, Hoteya: 83, fullMark: 100 },
  { subject: 'কৃষি অর্থনীতি (Agri)', Baheratail: 85, Kakadajan: 81, Hoteya: 83, fullMark: 100 },
];

// Historical Growth Trajectory (2022 - 2026)
const HISTORICAL_GROWTH_DATA = [
  { year: '২০২২', education: 68, healthcare: 62, infrastructure: 65, digitalServices: 55 },
  { year: '২০২৩', education: 73, healthcare: 68, infrastructure: 70, digitalServices: 68 },
  { year: '২০২৪', education: 78, healthcare: 72, infrastructure: 75, digitalServices: 80 },
  { year: '২০২৫', education: 82, healthcare: 76, infrastructure: 78, digitalServices: 88 },
  { year: '২০২৬ (বর্তমান)', education: 84, healthcare: 79, infrastructure: 81, digitalServices: 92 },
];

export const DevelopmentHeatmap: React.FC<DevelopmentHeatmapProps> = ({ config }) => {
  const [wardData, setWardData] = useState<WardDevelopmentData[]>(INITIAL_WARD_DATA);
  const [selectedWard, setSelectedWard] = useState<WardDevelopmentData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simulatedBudget, setSimulatedBudget] = useState<{ ward: string; category: string; amount: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Color scale powered by D3
  // Low (<75): Amber/Rose, Mid (75-85): Emerald light, High (>85): Rich Emerald Green
  const getColorForScore = (score: number) => {
    const colorInterpolator = d3.interpolateRgbBasis(['#ffe4e6', '#fef08a', '#a7f3d0', '#059669', '#064e3b']);
    return colorInterpolator(score / 100);
  };

  const getTextColorForScore = (score: number) => {
    return score >= 80 ? 'text-emerald-950 font-bold' : score >= 70 ? 'text-amber-950 font-bold' : 'text-rose-950 font-bold';
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  // Calculate Average Overall Scores for Each Ward
  const getWardOverallScore = (w: WardDevelopmentData) => {
    return Math.round((w.education + w.healthcare + w.infrastructure + w.digitalServices + w.agriEconomy) / 5);
  };

  // Overall UP Averages
  const avgEducation = Math.round(wardData.reduce((acc, curr) => acc + curr.education, 0) / wardData.length);
  const avgHealthcare = Math.round(wardData.reduce((acc, curr) => acc + curr.healthcare, 0) / wardData.length);
  const avgInfrastructure = Math.round(wardData.reduce((acc, curr) => acc + curr.infrastructure, 0) / wardData.length);
  const avgDigital = Math.round(wardData.reduce((acc, curr) => acc + curr.digitalServices, 0) / wardData.length);
  const avgAgri = Math.round(wardData.reduce((acc, curr) => acc + curr.agriEconomy, 0) / wardData.length);
  const overallUpScore = Math.round((avgEducation + avgHealthcare + avgInfrastructure + avgDigital + avgAgri) / 5);

  // Filtered Wards for display
  const filteredWards = wardData.filter((w) => {
    const matchesSearch =
      w.wardName.includes(searchQuery) ||
      w.villageName.includes(searchQuery) ||
      w.topAchievement.includes(searchQuery);
    return matchesSearch;
  });

  // Handle Simulation Boost
  const handleApplySimulation = () => {
    if (!simulatedBudget) return;
    setWardData((prev) =>
      prev.map((w) => {
        if (w.wardNo === simulatedBudget.ward) {
          const key = simulatedBudget.category as keyof WardDevelopmentData;
          if (typeof w[key] === 'number') {
            const boost = Math.min(100, (w[key] as number) + Math.round(simulatedBudget.amount / 100000));
            return { ...w, [key]: boost };
          }
        }
        return w;
      })
    );
    setToastMessage(`ওয়ার্ড ${simulatedBudget.ward}-এ ৳${(simulatedBudget.amount / 1000).toLocaleString('bn-BD')} হাজার টাকা বিনিয়োগ যুক্ত হওয়ায় সূচক বৃদ্ধি পেয়েছে!`);
    setSimulatedBudget(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-amber-300 px-5 py-3 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-bounce text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur border border-emerald-600/50 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>স্থানীয় সরকার সুশাসন ও সামাজিক উন্নয়ন সূচক</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {config.upName} উন্নয়ন হিটম্যাপ ও এনালাইটিক্স
            </h1>
            
            <p className="text-xs md:text-sm text-emerald-200/90 leading-relaxed">
              শিক্ষা, স্বাস্থ্যসেবা, গ্রামীন অবকাঠামো, কৃষি এবং ডিজিটাল সেবার ওয়ার্ডভিত্তিক বাস্তব অগ্রগতি মূল্যায়ন ও তুলনামূলক চিত্র।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-emerald-950/70 backdrop-blur p-4 rounded-xl border border-emerald-800/80">
            <div className="text-center px-3 border-r border-emerald-800">
              <span className="text-[10px] text-emerald-300 block font-medium">ইউনিয়ন সার্বিক উন্নয়ন স্কোর</span>
              <span className="text-2xl font-black text-amber-300">{overallUpScore}%</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-300 block font-medium">মোট জনসংখ্যা সেবিত</span>
              <span className="text-xl font-bold text-white">৩৭,৭০০+</span>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-emerald-800/80">
          <div className="bg-emerald-900/50 backdrop-blur p-3.5 rounded-xl border border-emerald-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-300" />
                <span>শিক্ষা সূচক</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">{avgEducation}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${avgEducation}%` }} />
            </div>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur p-3.5 rounded-xl border border-emerald-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-300" />
                <span>স্বাস্থ্যসেবা সূচক</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">{avgHealthcare}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${avgHealthcare}%` }} />
            </div>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur p-3.5 rounded-xl border border-emerald-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-300" />
                <span>অবকাঠামো সূচক</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">{avgInfrastructure}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${avgInfrastructure}%` }} />
            </div>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur p-3.5 rounded-xl border border-emerald-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-300" />
                <span>ডিজিটাল সেবা সূচক</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">{avgDigital}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${avgDigital}%` }} />
            </div>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur p-3.5 rounded-xl border border-emerald-700/50 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-300" />
                <span>কৃষি ও অর্থনীতি</span>
              </span>
              <span className="text-xs font-extrabold text-amber-300">{avgAgri}%</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${avgAgri}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP MATRIX SECTION */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-emerald-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>ওয়ার্ড ভিত্তিক উন্নয়ন হিটম্যাপ ম্যাট্রিক্স (Interactive Development Heatmap)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রতিটি ওয়ার্ডের শিক্ষা, স্বাস্থ্য, অবকাঠামো ও ডিজিটাল সেবার পয়েন্ট ভিত্তিক ইন্টারেক্টিভ হিটম্যাপ। যেকোনো ঘরে ক্লিক করে বিস্তারিত দেখুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ওয়ার্ড বা গ্রামের নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800"
              />
            </div>

            <button
              onClick={() => {
                setWardData(INITIAL_WARD_DATA);
                setSearchQuery('');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>

        {/* Heatmap Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-[11px]">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>কালার স্কেল নির্দেশিকা:</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-[#ffe4e6] border border-rose-300 inline-block"></span>
              <span className="text-slate-600">উন্নয়ন প্রয়োজন (&lt;৭৫%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-[#fef08a] border border-amber-300 inline-block"></span>
              <span className="text-slate-600">সন্তোষজনক (৭৫%-৮৪%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-[#059669] border border-emerald-600 inline-block"></span>
              <span className="text-slate-600">উৎকৃষ্ট (৮৫%+)</span>
            </div>
          </div>
        </div>

        {/* D3-Powered Heatmap Table Matrix */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="p-3 font-bold border-r border-slate-800 min-w-[120px]">ওয়ার্ড নং</th>
                <th className="p-3 font-bold border-r border-slate-800 min-w-[150px]">প্রধান গ্রামসমূহ</th>
                <th className="p-3 font-bold border-r border-slate-800 text-center min-w-[110px]">
                  🎓 শিক্ষা সূচক
                </th>
                <th className="p-3 font-bold border-r border-slate-800 text-center min-w-[110px]">
                  🏥 স্বাস্থ্যসেবা
                </th>
                <th className="p-3 font-bold border-r border-slate-800 text-center min-w-[110px]">
                  🛣️ অবকাঠামো
                </th>
                <th className="p-3 font-bold border-r border-slate-800 text-center min-w-[110px]">
                  💻 ডিজিটাল সেবা
                </th>
                <th className="p-3 font-bold border-r border-slate-800 text-center min-w-[110px]">
                  🌾 কৃষি অর্থনীতি
                </th>
                <th className="p-3 font-bold text-center bg-emerald-950 text-amber-300 min-w-[120px]">
                  ⚡ সার্বিক স্কোর
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWards.map((ward) => {
                const overall = getWardOverallScore(ward);
                return (
                  <tr
                    key={ward.wardNo}
                    onClick={() => setSelectedWard(ward)}
                    className="border-b border-slate-200 hover:bg-slate-100/80 cursor-pointer transition"
                  >
                    <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-900 text-white font-black px-2 py-0.5 rounded text-[11px]">
                          {ward.wardNo}
                        </span>
                        <span>{ward.wardName}</span>
                      </div>
                    </td>

                    <td className="p-3 text-slate-700 font-medium border-r border-slate-200">
                      {ward.villageName}
                    </td>

                    {/* Education Cell */}
                    <td
                      style={{ backgroundColor: getColorForScore(ward.education) }}
                      className={`p-3 text-center border-r border-slate-200/60 font-extrabold ${getTextColorForScore(ward.education)} transition hover:scale-105`}
                    >
                      {ward.education}%
                    </td>

                    {/* Healthcare Cell */}
                    <td
                      style={{ backgroundColor: getColorForScore(ward.healthcare) }}
                      className={`p-3 text-center border-r border-slate-200/60 font-extrabold ${getTextColorForScore(ward.healthcare)} transition hover:scale-105`}
                    >
                      {ward.healthcare}%
                    </td>

                    {/* Infrastructure Cell */}
                    <td
                      style={{ backgroundColor: getColorForScore(ward.infrastructure) }}
                      className={`p-3 text-center border-r border-slate-200/60 font-extrabold ${getTextColorForScore(ward.infrastructure)} transition hover:scale-105`}
                    >
                      {ward.infrastructure}%
                    </td>

                    {/* Digital Services Cell */}
                    <td
                      style={{ backgroundColor: getColorForScore(ward.digitalServices) }}
                      className={`p-3 text-center border-r border-slate-200/60 font-extrabold ${getTextColorForScore(ward.digitalServices)} transition hover:scale-105`}
                    >
                      {ward.digitalServices}%
                    </td>

                    {/* Agri Economy Cell */}
                    <td
                      style={{ backgroundColor: getColorForScore(ward.agriEconomy) }}
                      className={`p-3 text-center border-r border-slate-200/60 font-extrabold ${getTextColorForScore(ward.agriEconomy)} transition hover:scale-105`}
                    >
                      {ward.agriEconomy}%
                    </td>

                    {/* Overall Score */}
                    <td className="p-3 text-center bg-emerald-950 text-amber-300 font-black text-sm">
                      {overall}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARATIVE GOVERNANCE DASHBOARD (UNION COMPARISON) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Union Comparison Grouped Bar Chart */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-emerald-700" />
                <span>ইউনিয়ন ভিত্তিক তুলনামূলক উন্নয়ন পর্যালোচনা (Union Comparison)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                বহেড়াতৈল ইউনিয়ন বনাম সখিপুরের অন্যান্য পাশ্ববর্তী ইউনিয়ন সমূহের পারফরম্যান্স।
              </p>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
              সখিপুর উপজেলা
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={UNION_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="indexName" tick={{ fontSize: 10, fill: '#334155' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="baheratail" name="০২নং বহেড়াতৈল" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kakadajan" name="০১নং কাকড়াজান" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hoteya" name="০৩নং হতেয়া" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="borochapa" name="০৪নং বোরচাপা" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Spider Chart Comparison */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <RadarChart className="w-4 h-4 text-emerald-700" />
                <span>উন্নয়ন সুশাসন রাডার ম্যাপ (Multi-Dimensional Governance Radar)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                ৫টি মূল সূচকে ইউনিয়ন সমূহের ক্ষমতার ভারসাম্য ও সার্বিক অগ্রগতি।
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
              ৫ মাত্রা
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_UNION_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#1e293b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="০২নং বহেড়াতৈল" dataKey="Baheratail" stroke="#047857" fill="#047857" fillOpacity={0.5} />
                <Radar name="০১নং কাকড়াজান" dataKey="Kakadajan" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                <Radar name="০৩নং হতেয়া" dataKey="Hoteya" stroke="#d97706" fill="#d97706" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* HISTORICAL GROWTH & WARD RANKING SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>উন্নয়ন সূচকের ঐতিহাসিক অগ্রগতি (২০২২ - ২০২৬)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                বিগত ৫ বছরে বহেড়াতৈল ইউনিয়ন পরিষদের ধারাবাহিক সমৃদ্ধি ও উন্নয়ন রেকর্ড।
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded">
              বার্ষিক অগ্রগতি
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEdu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDigi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip contentStyle={{ backgroundColor: '#064e3b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Area type="monotone" dataKey="digitalServices" name="ডিজিটাল সেবা সূচক" stroke="#0284c7" fillOpacity={1} fill="url(#colorDigi)" />
                <Area type="monotone" dataKey="education" name="শিক্ষা সূচক" stroke="#047857" fillOpacity={1} fill="url(#colorEdu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Leaderboard / Ranking (1 Col) */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-emerald-950 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>ওয়ার্ড র্যাঙ্কিং লিডারবোর্ড</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full">
                শীর্ষ ৩ ওয়ার্ড
              </span>
            </h3>

            <div className="mt-3 space-y-3">
              {[...wardData]
                .sort((a, b) => getWardOverallScore(b) - getWardOverallScore(a))
                .slice(0, 5)
                .map((w, idx) => {
                  const score = getWardOverallScore(w);
                  return (
                    <div
                      key={w.wardNo}
                      onClick={() => setSelectedWard(w)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                            idx === 0
                              ? 'bg-amber-500 shadow-md ring-2 ring-amber-300'
                              : idx === 1
                              ? 'bg-slate-400'
                              : idx === 2
                              ? 'bg-amber-700'
                              : 'bg-emerald-900'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{w.wardName}</p>
                          <p className="text-[10px] text-slate-500">{w.villageName}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-800">{score}%</span>
                        <span className="block text-[9px] text-slate-400">সার্বিক স্কোর</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                const bestWard = [...wardData].sort((a, b) => getWardOverallScore(b) - getWardOverallScore(a))[0];
                setSelectedWard(bestWard);
              }}
              className="w-full py-2 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>সেরা ওয়ার্ডের পূর্ণাঙ্গ তথ্য দেখুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* WARD DETAIL MODAL */}
      {selectedWard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-emerald-900 text-white font-black text-sm px-3 py-1 rounded-lg">
                  ওয়ার্ড {selectedWard.wardNo}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedWard.wardName}</h3>
                  <p className="text-xs text-slate-500">গ্রাম: {selectedWard.villageName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedWard(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ward Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 font-bold block">🎓 শিক্ষা সূচক</span>
                <span className="text-xl font-black text-emerald-950">{selectedWard.education}%</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] text-blue-800 font-bold block">🏥 স্বাস্থ্যসেবা</span>
                <span className="text-xl font-black text-blue-950">{selectedWard.healthcare}%</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] text-amber-800 font-bold block">🛣️ অবকাঠামো</span>
                <span className="text-xl font-black text-amber-950">{selectedWard.infrastructure}%</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                <span className="text-[10px] text-purple-800 font-bold block">💻 ডিজিটাল সেবা</span>
                <span className="text-xl font-black text-purple-950">{selectedWard.digitalServices}%</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 font-bold block">🌾 কৃষি অর্থনীতি</span>
                <span className="text-xl font-black text-emerald-950">{selectedWard.agriEconomy}%</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
                <span className="text-[10px] text-amber-300 font-bold block">⚡ সার্বিক স্কোর</span>
                <span className="text-xl font-black text-amber-300">{getWardOverallScore(selectedWard)}%</span>
              </div>
            </div>

            {/* Key Achievements & Projects */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>প্রধান উন্নয়ন সাফল্য ও বিশেষ উদ্যোগ</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200">
                "{selectedWard.topAchievement}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">সম্পন্ন উন্নয়ন প্রকল্প:</span>
                  <span className="font-bold text-emerald-800">{selectedWard.projectsCompleted} টি</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">চলমান প্রকল্প:</span>
                  <span className="font-bold text-amber-800">{selectedWard.ongoingProjects} টি</span>
                </div>
              </div>
            </div>

            {/* Quick Investment Simulation Action */}
            <div className="bg-emerald-950 text-white p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-300" />
                <span>ওয়ার্ড উন্নয়ন বাজেট ও সিমুলেশন</span>
              </h4>
              <p className="text-[11px] text-emerald-200">
                এই ওয়ার্ডে উন্নয়ন বরাদ্দ যুক্ত করে সূচকে প্রভাব টেস্ট করুন।
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSimulatedBudget({ ward: selectedWard.wardNo, category: 'healthcare', amount: 300000 });
                    setSelectedWard(null);
                  }}
                  className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition"
                >
                  + ৳৩ লক্ষ (স্বাস্থ্য)
                </button>
                <button
                  onClick={() => {
                    setSimulatedBudget({ ward: selectedWard.wardNo, category: 'infrastructure', amount: 500000 });
                    setSelectedWard(null);
                  }}
                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition"
                >
                  + ৳৫ লক্ষ (অবকাঠামো)
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedWard(null)}
              className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* SIMULATION CONFIRMATION MODAL */}
      {simulatedBudget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 border-b pb-3">
              <Sliders className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm">বাজেট ও সুশাসন বরাদ্দ নিশ্চিতকরণ</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি <strong>ওয়ার্ড নং {simulatedBudget.ward}</strong>-এ <strong>৳{(simulatedBudget.amount / 1000).toLocaleString('bn-BD')} হাজার টাকা</strong> নতুন উন্নয়ন বরাদ্দ সিমুলেট করতে যাচ্ছেন।
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleApplySimulation}
                className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                বরাদ্দ যুক্ত ও আপডেট করুন
              </button>
              <button
                onClick={() => setSimulatedBudget(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
