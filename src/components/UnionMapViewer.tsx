import React, { useState } from 'react';
import { 
  MapPin, 
  Building2, 
  Navigation, 
  Globe, 
  Layers, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  PhoneCall, 
  Search, 
  Compass,
  Map as MapIcon,
  Crosshair,
  ShieldAlert
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { WARDS } from '../data/villages';

interface UnionMapViewerProps {
  config: UnionParishadConfig;
}

interface FacilityMarker {
  id: string;
  name: string;
  category: 'complex' | 'digital_center' | 'clinic' | 'school' | 'market';
  wardNo: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  description: string;
}

export const UnionMapViewer: React.FC<UnionMapViewerProps> = ({ config }) => {
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFacility, setActiveFacility] = useState<FacilityMarker | null>(null);

  // Baheratail Union Parishad center coordinates (Sakhipur, Tangail)
  const mapCenter = { lat: 24.3125, lng: 90.1782 };

  // Key UP Facilities across Ward 1-9
  const facilities: FacilityMarker[] = [
    {
      id: 'f1',
      name: `${config.upName} পরিষদ কমপ্লেক্স ভবন`,
      category: 'complex',
      wardNo: '১',
      lat: 24.3125,
      lng: 90.1782,
      address: 'বহেড়াতৈল বাজার সংলগ্ন, ওয়ার্ড নং ০১',
      phone: '০১৮৩৪-৩৩৩৩০০',
      description: 'প্রধান প্রশাসনিক কেন্দ্র, চেয়ারম্যান ও সচিব কার্যালয়, সকল অনলাইন সনদ প্রদান কেন্দ্র।'
    },
    {
      id: 'f2',
      name: 'বহেড়াতৈল ডিজিটাল সেন্টার (UDC)',
      category: 'digital_center',
      wardNo: '১',
      lat: 24.3130,
      lng: 90.1788,
      address: 'ইউপি ভবন ১ম তলা',
      phone: '০১৭০০-০০০০০০',
      description: 'কম্পিউটার টাইপিং, অনলাইন আবেদন, ছবি স্ক্যান ও ই-সেবা সেবা কেন্দ্র।'
    },
    {
      id: 'f3',
      name: 'বহেড়াতৈল ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র',
      category: 'clinic',
      wardNo: '২',
      lat: 24.3180,
      lng: 90.1810,
      address: 'ঘাটেশ্বরী রোড, ওয়ার্ড নং ০২',
      phone: '০১৮১২-১২২২৩৩',
      description: 'বিনামূল্যে প্রাথমিক চিকিৎসা, গর্ভবতী স্বাস্থ্য সেবা ও টিকা দান কেন্দ্র।'
    },
    {
      id: 'f4',
      name: 'বহেড়াতৈল গণউচ্চ বিদ্যালয় ও সাইক্লোন শেল্টার',
      category: 'school',
      wardNo: '৩',
      lat: 24.3090,
      lng: 90.1710,
      address: 'চকবহেড়াতৈল, ওয়ার্ড নং ০৩',
      phone: '০১৯১১-২২৩৩৪৪',
      description: 'মাধ্যমিক শিক্ষা প্রতিষ্ঠান ও জরুরি দুর্যোগকালীন আশ্রয়কেন্দ্র।'
    },
    {
      id: 'f5',
      name: 'গড়গোবিন্দপুর কমিউনিটি ক্লিনিক',
      category: 'clinic',
      wardNo: '৪',
      lat: 24.3220,
      lng: 90.1850,
      address: 'গড়গোবিন্দপুর মধ্যপাড়া, ওয়ার্ড নং ০৪',
      phone: '০১৭৫৫-৪৪৩৩২২',
      description: 'মা ও শিশু স্বাস্থ্য সেবা কেন্দ্র ও ৩০ প্রকার ফ্রি ঔষুধ বিতরণ।'
    },
    {
      id: 'f6',
      name: 'সাড়াসিয়া পশুর হাট ও সাপ্তাহিক বাজার',
      category: 'market',
      wardNo: '৬',
      lat: 24.3010,
      lng: 90.1650,
      address: 'সাড়াসিয়া স্ট্যান্ড, ওয়ার্ড নং ০৬',
      phone: '০১৮১৯-১১২২৩৩',
      description: 'ইউনিয়ন পরিষদের রাজস্ব সংগ্রাহক প্রধান হাট ও গ্রামীণ বাণিজ্যিক কেন্দ্র।'
    },
    {
      id: 'f7',
      name: 'ডাবাইল কমিউনিটি ডিজিটাল সেবা পয়েন্ট',
      category: 'digital_center',
      wardNo: '৭',
      lat: 24.2950,
      lng: 90.1910,
      address: 'ডাবাইল বাজার, ওয়ার্ড নং ০৭',
      phone: '০১৭১১-৯৯৮৮৭৭',
      description: 'ওয়ার্ডভিত্তিক গ্রামীণ অনলাইন আবেদন সহজীকরণ বুথ।'
    },
    {
      id: 'f8',
      name: 'কালমেঘা প্রাথমিক বিদ্যালয় ও ভোটার সেন্টার',
      category: 'school',
      wardNo: '৯',
      lat: 24.3310,
      lng: 90.1980,
      address: 'কালমেঘা চকপাড়া, ওয়ার্ড নং ০৯',
      phone: '০১৮১৬-৫5৪৪৩৩',
      description: 'সরকারি প্রাথমিক বিদ্যালয় ও জাতীয় নির্বাচন কেন্দ্র।'
    }
  ];

  // Filter facilities
  const filteredFacilities = facilities.filter((f) => {
    if (selectedWard !== 'all' && f.wardNo !== selectedWard) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'complex':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ইউপি কমপ্লেক্স</span>;
      case 'digital_center':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">ডিজিটাল সেন্টার</span>;
      case 'clinic':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">স্বাস্থ্য কেন্দ্র</span>;
      case 'school':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">শিক্ষা প্রতিষ্ঠান</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">হাট-বাজার</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center shadow-lg shrink-0">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  জিআইএস মানচিত্র
                </span>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  ওয়ার্ড ১ - ৯
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                {config.upName} জিআইএস ইন্টারেক্টিভ ম্যাপ ও অবকাঠামো নির্দেশিকা
              </h2>
              <p className="text-xs md:text-sm text-emerald-200 mt-1">
                সখিপুর, টাঙ্গাইল — ওয়ার্ডভিত্তিক ডিজিটাল সেন্টার, কমিউনিটি ক্লিনিক, প্রাথমিক ও মাধ্যমিক বিদ্যালয় এবং প্রশাসনিক সীমানা।
              </p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>গুগল ম্যাপে লাইভ খুলুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Ward Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-500 shrink-0">ওয়ার্ড নির্বাচন:</span>
          <button
            onClick={() => setSelectedWard('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedWard === 'all'
                ? 'bg-emerald-800 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব ওয়ার্ড (১-৯)
          </button>
          {WARDS.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedWard === w
                  ? 'bg-emerald-800 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ওয়ার্ড {w}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">শ্রেণী:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-600 text-slate-800"
          >
            <option value="all">সব অবকাঠামো</option>
            <option value="complex">ইউপি প্রশাসনিক ভবন</option>
            <option value="digital_center">ডিজিটাল সেন্টার</option>
            <option value="clinic">স্বাস্থ্য কেন্দ্র ও ক্লিনিক</option>
            <option value="school">শিক্ষা প্রতিষ্ঠান</option>
            <option value="market">হাট-বাজার</option>
          </select>
        </div>
      </div>

      {/* Grid: Google Maps Embed Canvas + Interactive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View Box (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-amber-300" />
              <h3 className="font-extrabold text-sm text-white">
                স্যাটেলাইট ও রাস্তার মানচিত্র (Sakhipur, Tangail)
              </h3>
            </div>
            <span className="text-[11px] bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
              Lat: {mapCenter.lat}, Lng: {mapCenter.lng}
            </span>
          </div>

          <div className="relative w-full h-[400px] md:h-[480px] bg-slate-900">
            {/* Google Maps iFrame */}
            <iframe
              title="Union Parishad Google Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=bn&z=14&output=embed`}
            />

            {/* Floating Quick Action Overlay */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200 max-w-xs space-y-1 text-xs">
              <p className="font-extrabold text-emerald-950 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{config.upName}</span>
              </p>
              <p className="text-slate-600 text-[11px]">
                ডাকঘর: বহেড়াতৈল (১৯৫০), উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।
              </p>
            </div>
          </div>
        </div>

        {/* Facilities Directory List (1 Col) */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>গুরুত্বপূর্ণ প্রতিষ্ঠানসমূহ ({filteredFacilities.length})</span>
            </h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
            {filteredFacilities.map((facility) => {
              const isSelected = activeFacility?.id === facility.id;
              return (
                <div
                  key={facility.id}
                  onClick={() => setActiveFacility(facility)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {facility.name}
                    </h4>
                    {getCategoryBadge(facility.category)}
                  </div>

                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{facility.address}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>ওয়ার্ড নং {facility.wardNo}</span>
                    <span className="font-mono font-bold text-emerald-800 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-700" />
                      {facility.phone}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Detail Modal Box */}
          {activeFacility && (
            <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 text-xs shadow-lg animate-fade-in border border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">বিস্তারিত তথ্য:</span>
                <button
                  onClick={() => setActiveFacility(null)}
                  className="text-emerald-300 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="font-extrabold text-sm text-white">{activeFacility.name}</p>
              <p className="text-emerald-200 text-[11px] leading-relaxed">{activeFacility.description}</p>
              <div className="pt-2 flex justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeFacility.lat},${activeFacility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-lg text-[11px] inline-flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>দিকনির্দেশনা (Directions)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
