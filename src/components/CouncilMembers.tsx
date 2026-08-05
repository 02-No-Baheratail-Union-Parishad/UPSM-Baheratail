import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Shield, 
  Building2, 
  UserCheck, 
  Award, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  Sparkles,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  HelpCircle
} from 'lucide-react';
import { UnionParishadConfig, CouncilMember } from '../types';
import { getSyncedCouncilMembers } from '../data/councilMembers';

interface CouncilMembersProps {
  config: UnionParishadConfig;
  onUpdateConfig?: (newConfig: UnionParishadConfig) => void;
}

export const CouncilMembers: React.FC<CouncilMembersProps> = ({ config, onUpdateConfig }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const members = useMemo(() => {
    return getSyncedCouncilMembers(config);
  }, [config]);

  // Filter members by category & search query
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Category Filter
      let categoryMatch = true;
      if (activeCategory === 'public_rep') {
        categoryMatch = m.category === 'chairman' || m.category === 'reserved_female' || m.category === 'general_member';
      } else if (activeCategory === 'officers') {
        categoryMatch = m.category === 'officer' || m.category === 'udc';
      } else if (activeCategory === 'police') {
        categoryMatch = m.category === 'dafadar' || m.category === 'gram_police';
      }

      // Search Filter
      const query = searchQuery.trim().toLowerCase();
      if (!query) return categoryMatch;

      const nameMatch = m.name.toLowerCase().includes(query);
      const designationMatch = m.designation.toLowerCase().includes(query);
      const mobileMatch = m.mobile.toLowerCase().includes(query);
      const wardMatch = (m.wardNo || '').toLowerCase().includes(query);

      return categoryMatch && (nameMatch || designationMatch || mobileMatch || wardMatch);
    });
  }, [members, activeCategory, searchQuery]);

  // Counts for summary cards
  const counts = useMemo(() => {
    const chairman = members.filter(m => m.category === 'chairman').length;
    const reservedFemale = members.filter(m => m.category === 'reserved_female').length;
    const generalMembers = members.filter(m => m.category === 'general_member').length;
    const officers = members.filter(m => m.category === 'officer' || m.category === 'udc').length;
    const gramPolice = members.filter(m => m.category === 'dafadar' || m.category === 'gram_police').length;
    return {
      total: members.length,
      publicReps: chairman + reservedFemale + generalMembers,
      officers,
      gramPolice,
      chairman,
      reservedFemale,
      generalMembers
    };
  }, [members]);

  const getCategoryBadge = (category: CouncilMember['category']) => {
    switch (category) {
      case 'chairman':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Award className="w-3 h-3 text-amber-700" />ইউপি চেয়ারম্যান</span>;
      case 'reserved_female':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">সংরক্ষিত নারী সদস্য</span>;
      case 'general_member':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">সাধারণ ওয়ার্ড মেম্বার</span>;
      case 'officer':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">প্রশাসনিক কর্মকর্তা</span>;
      case 'udc':
        return <span className="bg-cyan-100 text-cyan-900 border border-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full">ইউডিসি উদ্যোক্তা</span>;
      case 'dafadar':
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-3 h-3 text-rose-700" />দফাদার (পুলিশ প্রধান)</span>;
      case 'gram_police':
        return <span className="bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">গ্রাম পুলিশ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-emerald-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <img src={config.logoUrl} alt="Logo Bg" className="w-96 h-96 object-contain" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-emerald-950/80 backdrop-blur px-3 py-1 rounded-full text-emerald-200 text-xs font-semibold w-fit border border-emerald-700">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{config.upName} — নাগরিক তথ্য পোর্টাল</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              পরিষদ সদস্য ও কর্মকর্তা পরিচিতি নির্দেশিকা
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              {config.upName}-এর জনপ্রতিনিধি, প্রশাসনিক কর্মকর্তা, ইউডিসি উদ্যোক্তা এবং গ্রাম পুলিশ বাহিনীর তালিকা ও সরাসরি যোগাযোগ নম্বর।
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold rounded-xl shadow-lg transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>তালিকা প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">সর্বমোট জনবল</p>
            <p className="text-lg font-black text-slate-900">{counts.total} জন</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">জনপ্রতিনিধি (মেম্বার ও চেয়ারম্যান)</p>
            <p className="text-lg font-black text-slate-900">{counts.publicReps} জন</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">সচিব, কর্মকর্তা ও UDC</p>
            <p className="text-lg font-black text-slate-900">{counts.officers} জন</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">গ্রাম পুলিশ বাহিনী (দফাদারসহ)</p>
            <p className="text-lg font-black text-slate-900">{counts.gramPolice} জন</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-emerald-800 text-amber-300 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সকল জনবল ({counts.total})
            </button>
            <button
              onClick={() => setActiveCategory('public_rep')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === 'public_rep'
                  ? 'bg-emerald-800 text-amber-300 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              জনপ্রতিনিধিগণ ({counts.publicReps})
            </button>
            <button
              onClick={() => setActiveCategory('officers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === 'officers'
                  ? 'bg-emerald-800 text-amber-300 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              কর্মকর্তা ও উদ্যোক্তা ({counts.officers})
            </button>
            <button
              onClick={() => setActiveCategory('police')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === 'police'
                  ? 'bg-emerald-800 text-amber-300 shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              গ্রাম পুলিশ বাহিনী ({counts.gramPolice})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, পদবি বা মোবাইল দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition font-medium"
            />
          </div>
        </div>
      </div>

      {/* Member Grid Display */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">কোনো তথ্য পাওয়া যায়নি!</p>
          <p className="text-xs text-slate-500">আপনার সার্চ কুয়েরি অথবা ফিল্টার সঠিক কি না পুনরায় চেষ্টা করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group ${
                member.category === 'chairman'
                  ? 'border-amber-300 bg-amber-50/20'
                  : member.category === 'officer' && member.isAutoSynced
                  ? 'border-blue-300 bg-blue-50/20'
                  : member.category === 'dafadar'
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Member Top Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {getCategoryBadge(member.category)}

                  {member.isAutoSynced && (
                    <span
                      title="অ্যাডমিন প্যানেল হতে স্বয়ংক্রিয়ভাবে সিঙ্ককৃত"
                      className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-emerald-700 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>অটো সিঙ্কড</span>
                    </span>
                  )}
                </div>

                {/* Photo & Name Section */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={member.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={member.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-xs group-hover:scale-105 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=047857&color=fff';
                      }}
                    />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold text-emerald-800 leading-tight">
                      {member.designation}
                    </p>
                    {member.wardNo && (
                      <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{member.wardNo}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${member.mobile}`}
                  className="flex-1 py-1.5 px-3 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>কোল করুন</span>
                </a>

                <a
                  href={`https://wa.me/88${member.mobile.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-xl flex items-center gap-1 transition"
                  title="হোয়াটসঅ্যাপ বা এসএমএস মেসেজ পাঠান"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>এসএমএস</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
