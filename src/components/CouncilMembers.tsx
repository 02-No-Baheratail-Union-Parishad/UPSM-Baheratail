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
  HelpCircle,
  Edit3,
  UserPlus,
  Trash2,
  Camera,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { UnionParishadConfig, CouncilMember } from '../types';
import { DEFAULT_COUNCIL_MEMBERS, getSyncedCouncilMembers } from '../data/councilMembers';
import { saveConfigToFirebase } from '../firebase';

interface CouncilMembersProps {
  config: UnionParishadConfig;
  onUpdateConfig?: (newConfig: UnionParishadConfig) => void;
}

export const CouncilMembers: React.FC<CouncilMembersProps> = ({ config, onUpdateConfig }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<CouncilMember | null>(null);
  const [isNewMemberMode, setIsNewMemberMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const members = useMemo(() => {
    return getSyncedCouncilMembers(config);
  }, [config]);

  // Open modal for editing existing member or creating new
  const handleOpenEditModal = (member?: CouncilMember) => {
    if (member) {
      setEditingMember({ ...member });
      setIsNewMemberMode(false);
    } else {
      setEditingMember({
        id: `m_custom_${Date.now()}`,
        category: 'general_member',
        name: '',
        designation: 'ইউপি সদস্য (সাধারণ ওয়ার্ড)',
        mobile: '০১৭০০-০০০০০০',
        wardNo: 'ওয়ার্ড নং ০১',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
      });
      setIsNewMemberMode(true);
    }
    setSaveSuccessMsg(null);
    setIsEditModalOpen(true);
  };

  // Save changes to state, server endpoint, and Firebase
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim()) {
      alert('অনুগ্রহ করে কর্মকর্তা/সদস্যের নাম লিখুন।');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const existingList = getSyncedCouncilMembers(config);
      let updatedList: CouncilMember[];

      if (isNewMemberMode) {
        updatedList = [...existingList, editingMember];
      } else {
        updatedList = existingList.map(m => m.id === editingMember.id ? editingMember : m);
      }

      const newConfig: UnionParishadConfig = {
        ...config,
        councilMembers: updatedList
      };

      // Auto-sync Chairman & Secretary if their profiles are modified
      if (editingMember.category === 'chairman' || editingMember.id === 'm_chairman') {
        newConfig.chairmanName = editingMember.name;
        newConfig.chairmanPhone = editingMember.mobile;
        newConfig.chairmanTitle = editingMember.designation;
      } else if (editingMember.id === 'm_secretary' || (editingMember.category === 'officer' && editingMember.designation.includes('সচিব'))) {
        newConfig.secretaryName = editingMember.name;
        newConfig.secretaryPhone = editingMember.mobile;
        newConfig.secretaryTitle = editingMember.designation;
      }

      // 1. Update React Global State
      if (onUpdateConfig) {
        onUpdateConfig(newConfig);
      }

      // 2. Persist to Express Backend memory & config file
      fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).catch(err => console.warn('Server config save error:', err));

      // 3. Persist to Firebase Firestore
      saveConfigToFirebase(newConfig).catch(err => console.warn('Firebase config save warning:', err));

      setSaveSuccessMsg('কর্মকর্তার তথ্য সফলভাবে সংরক্ষিত ও সিঙ্ক করা হইয়াছে!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccessMsg(null);
      }, 1200);

    } catch (err: any) {
      alert('সংরক্ষণ ত্রুটি: ' + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete specific member
  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই কর্মকর্তা/সদস্যের তথ্য তালিকা হতে মুছে ফেলতে চান?')) return;
    
    const existingList = getSyncedCouncilMembers(config);
    const updatedList = existingList.filter(m => m.id !== id);
    const newConfig: UnionParishadConfig = {
      ...config,
      councilMembers: updatedList
    };

    if (onUpdateConfig) onUpdateConfig(newConfig);

    fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    }).catch(err => console.warn('Server save error:', err));

    saveConfigToFirebase(newConfig).catch(err => console.warn('Firebase save error:', err));
    setIsEditModalOpen(false);
  };

  // Reset to Default 27 Members
  const handleResetToDefaults = async () => {
    if (!window.confirm('আপনি কি পূর্বনির্ধারিত ২৭ জন কর্মকর্তা ও প্রতিনিধির তথ্যে রিসেট করতে চান?')) return;
    const newConfig: UnionParishadConfig = {
      ...config,
      councilMembers: DEFAULT_COUNCIL_MEMBERS
    };
    if (onUpdateConfig) onUpdateConfig(newConfig);

    fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    }).catch(err => console.warn('Server save error:', err));

    saveConfigToFirebase(newConfig).catch(err => console.warn('Firebase save error:', err));
    alert('পূর্বনির্ধারিত তথ্যে সফলভাবে রিসেট করা হইয়াছে!');
  };

  // Image Upload Handler to convert file to Base64 Data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    
    if (file.size > 3 * 1024 * 1024) {
      alert('ফোটো সাইজ সর্বোচ্চ 3MB হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setEditingMember({
        ...editingMember,
        photoUrl: base64Url
      });
    };
    reader.readAsDataURL(file);
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenEditModal()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-amber-300 text-xs font-bold rounded-xl shadow-md border border-emerald-600 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ নতুন সদস্য যোগ</span>
            </button>

            <button
              onClick={() => handleResetToDefaults()}
              title="পূর্বনির্ধারিত তথ্যে রিসেট করুন"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-950/70 hover:bg-emerald-950 text-emerald-200 text-xs font-bold rounded-xl border border-emerald-700 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>রিসেট</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold rounded-xl shadow-lg transition active:scale-95 shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>তালিকা প্রিন্ট</span>
            </button>
          </div>
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

                    {/* Mobile Number & Click to Chat Badge */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 min-w-0">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{member.mobile}</span>
                      </div>
                      <a
                        href={`https://wa.me/88${member.mobile.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow-2xs transition shrink-0 active:scale-95"
                        title="হোয়াটসঅ্যাপে চ্যাট করুন (Click to Chat)"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-100" />
                        <span>Click to Chat</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <a
                  href={`tel:${member.mobile}`}
                  className="flex-1 py-1.5 px-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>কোল করুন</span>
                </a>

                <a
                  href={`https://wa.me/88${member.mobile.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition shadow-2xs shrink-0 active:scale-95"
                  title="হোয়াটসঅ্যাপ ডাইরেক্ট চ্যাট (Click to Chat)"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-xl flex items-center gap-1 transition border border-amber-300 shrink-0 cursor-pointer"
                  title="কর্মকর্তার ছবি, মোবাইল বা পদবি সম্পাদন করুন"
                >
                  <Edit3 className="w-3 h-3 text-amber-800" />
                  <span>এডিট</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Official Modal */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {isNewMemberMode ? 'নতুন সদস্য / কর্মকর্তা যুক্ত করুন' : `${editingMember.name || 'সদস্য'} - তথ্য সম্পাদন`}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    ছবি, মোবাইল নম্বর, পদবি ও এলাকা আপডেট করুন (ডাটাবেসে অটো সিঙ্ক হবে)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ক্যাটাগরি / পদশ্রেণী</label>
                  <select
                    value={editingMember.category}
                    onChange={(e) => setEditingMember({ ...editingMember, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="chairman">ইউপি চেয়ারম্যান</option>
                    <option value="reserved_female">সংরক্ষিত নারী সদস্য (১-৩, ৪-৬, ৭-৯)</option>
                    <option value="general_member">সাধারণ ওয়ার্ড সদস্য/মেম্বার (০১ - ০৯)</option>
                    <option value="officer">ইউপি সচিব / প্রশাসনিক কর্মকর্তা / হিসাব সহকারী</option>
                    <option value="udc">ইউডিসি উদ্যোক্তা (UDC Entrepreneur)</option>
                    <option value="dafadar">দফাদার (গ্রাম পুলিশ প্রধান)</option>
                    <option value="gram_police">গ্রাম পুলিশ / মহল্লাদার</option>
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="যেমন: মোঃ আব্দুল করিম"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">পদবি (Designation)</label>
                  <input
                    type="text"
                    required
                    value={editingMember.designation}
                    onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                    placeholder="যেমন: ইউপি সদস্য (সাধারণ ওয়ার্ড)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  {/* Quick Designation Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['ইউপি চেয়ারম্যান', 'সংরক্ষিত মহিলা ইউপি সদস্য', 'ইউপি সদস্য (সাধারণ ওয়ার্ড)', 'ইউপি সচিব / প্রশাসনিক কর্মকর্তা', 'হিসাব সহকারী', 'ইউডিসি উদ্যোক্তা', 'দফাদার (পুলিশ প্রধান)', 'গ্রাম পুলিশ / মহল্লাদার'].map(title => (
                      <button
                        type="button"
                        key={title}
                        onClick={() => setEditingMember({ ...editingMember, designation: title })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-[10px] font-semibold text-slate-600 rounded-md border border-slate-200 transition cursor-pointer"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    required
                    value={editingMember.mobile}
                    onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                    placeholder="যেমন: ০১৭০০-০০০০০০"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Ward No */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ওয়ার্ড নং / দায়িত্বপ্রাপ্ত এলাকা</label>
                  <input
                    type="text"
                    value={editingMember.wardNo || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, wardNo: e.target.value })}
                    placeholder="যেমন: ওয়ার্ড নং ০১ অথবা সমগ্র ইউনিয়ন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Photo URL & Upload Section */}
                <div className="space-y-2 md:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 block flex items-center justify-between">
                    <span>কর্মকর্তা/সদস্যের ছবি (Photo)</span>
                    <span className="text-[10px] text-slate-500 font-normal">URL অথবা ফাইল আপলোড করুন</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Photo Live Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={editingMember.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(editingMember.name || 'Member') + '&background=047857&color=fff';
                        }}
                      />
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <input
                        type="text"
                        value={editingMember.photoUrl || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, photoUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/... (Image Link)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-600"
                      />

                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ছবি আপলোড করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Preset Avatars */}
                        <span className="text-[10px] font-bold text-slate-400">প্রেসেট:</span>
                        <button
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' })}
                          className="text-[10px] font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
                        >
                          পুরুষ
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMember({ ...editingMember, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' })}
                          className="text-[10px] font-bold text-purple-700 underline hover:text-purple-900 cursor-pointer"
                        >
                          মহিলা
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Notice for Chairman / Secretary */}
              {(editingMember.category === 'chairman' || editingMember.id === 'm_chairman' || editingMember.id === 'm_secretary' || (editingMember.category === 'officer' && editingMember.designation.includes('সচিব'))) && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>স্বয়ংক্রিয় সিঙ্ক সতর্কবার্তা:</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    এখানে চেয়ারম্যান বা সচিব এর তথ্য পরিবর্তন করিলে তা সমগ্র সিস্টেমে ও সকল সনদপত্রের চেয়ারম্যান/সচিব তথ্যে স্বয়ংক্রিয়ভাবে সিঙ্ক ও আপডেট হইয়া যাইবে।
                  </p>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                {!isNewMemberMode ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(editingMember.id)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>মুছে ফেলুন</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>সংরক্ষণ ও আপডেট করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
