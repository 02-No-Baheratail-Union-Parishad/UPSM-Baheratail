import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Building2, 
  Phone, 
  FileCheck2, 
  Calendar, 
  Plus, 
  Check, 
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  Camera,
  X,
  Copy,
  Hash,
  Home,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { WARDS, KNOWN_VILLAGES } from '../data/villages';
import { CitizenAccountRecord, UnionParishadConfig, NidScanResult } from '../types';
import { sanitizeObject } from '../utils/security';
import { validateNid, validateBirthNo, validatePhone } from '../utils/validation';
import { fetchCertificatesFromFirebase } from '../firebase';
import { sheetsSyncService } from '../services/sheetsSyncService';
import { NidScannerModal } from './NidScannerModal';

interface CitizenMasterRegisterProps {
  config: UnionParishadConfig;
  onApplyForCitizen: (citizen: CitizenAccountRecord) => void;
}

export const CitizenMasterRegister: React.FC<CitizenMasterRegisterProps> = ({
  config,
  onApplyForCitizen,
}) => {
  const [citizens, setCitizens] = useState<CitizenAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'nid' | 'holding' | 'name' | 'mobile'>('all');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedGender, setSelectedGender] = useState('সব');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNidScannerOpen, setIsNidScannerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Citizen Form State
  const [newCitizen, setNewCitizen] = useState<Partial<CitizenAccountRecord>>({
    name: '',
    nid: '',
    birthNo: '',
    holdingNo: '',
    father: '',
    mother: '',
    spouseName: '',
    gender: 'পুরুষ',
    mobile: '',
    village: 'বহেড়াতৈল',
    wardNo: '০১',
    postOffice: 'বহেড়াতৈল',
    postCode: '১৯৫০'
  });

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label + '_' + text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNidAutoFill = (result: NidScanResult) => {
    setNewCitizen((prev) => ({
      ...prev,
      nid: result.nidNo || prev.nid,
      name: result.name || prev.name,
      father: result.fatherName || prev.father,
      mother: result.motherName || prev.mother,
      village: result.addressText ? (result.addressText.includes('বহেড়াতৈল') ? 'বহেড়াতৈল' : prev.village) : prev.village
    }));
    setIsAddModalOpen(true);
  };

  const loadCitizens = async () => {
    setLoading(true);
    try {
      // Build master list from server certificates and Firebase
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      const serverCerts = data.logs || [];
      const fbCerts = await fetchCertificatesFromFirebase();

      const combinedCerts = [...serverCerts, ...fbCerts];

      // Map unique citizens by NID or BirthNo or Name
      const map = new Map<string, CitizenAccountRecord>();

      // Pre-seed default citizen master records with holding numbers for 02নং বহেড়াতৈল ইউনিয়ন
      const defaultCitizens: CitizenAccountRecord[] = [
        {
          id: 'cit_101',
          nid: '1985938201',
          holdingNo: 'এইচ-১০৪',
          name: 'মোঃ আতিকুর রহমান',
          father: 'হাজী আব্দুল গণি',
          mother: 'আয়েশা খাতুন',
          gender: 'পুরুষ',
          mobile: '01712345678',
          village: 'বহেড়াতৈল',
          wardNo: '০৫',
          postOffice: 'বহেড়াতৈল',
          postCode: '১৯৫০',
          totalCertificates: 3,
          lastCertificateType: 'নাগরিকত্ব সনদপত্র',
          lastCertificateDate: '১৫/০৭/২০২৬',
          registeredAt: '2026-01-10'
        },
        {
          id: 'cit_102',
          nid: '1990428192',
          holdingNo: 'এইচ-০৭২',
          name: 'মোছাঃ পারভীন আক্তার',
          father: 'মৃত সোলাইমান মিয়া',
          mother: 'মোছাঃ রহিমা বেগম',
          gender: 'মহিলা',
          mobile: '01819876543',
          village: 'ডাবাইল',
          wardNo: '০১',
          postOffice: 'নাগবাড়ী',
          postCode: '১৯৭২',
          totalCertificates: 2,
          lastCertificateType: 'ওয়ারিশান / উত্তরাধিকার সনদপত্র',
          lastCertificateDate: '২০/০৭/২০২৬',
          registeredAt: '2026-02-14'
        },
        {
          id: 'cit_103',
          nid: '1978291048',
          holdingNo: 'এইচ-১১৯',
          name: 'মোঃ খলিলুর রহমান',
          father: 'মৃত আকবর আলী',
          mother: 'খদেজা বেগম',
          gender: 'পুরুষ',
          mobile: '01911223344',
          village: 'গোহাইলবাড়ী',
          wardNo: '০৩',
          postOffice: 'বহেড়াতৈল',
          postCode: '১৯৫০',
          totalCertificates: 1,
          lastCertificateType: 'ভূমিহীন সনদপত্র',
          lastCertificateDate: '০৫/০৬/২০২৬',
          registeredAt: '2026-03-01'
        },
        {
          id: 'cit_104',
          birthNo: '20129381029381203',
          holdingNo: 'এইচ-০৮৫',
          name: 'সুমাইয়া তাসনিম',
          father: 'মোঃ রফিকুল ইসলাম',
          mother: 'মোছাঃ শারমিন সুলতানা',
          gender: 'মহিলা',
          mobile: '01755667788',
          village: 'যোগীরকোফা',
          wardNo: '০৪',
          postOffice: 'বেতুয়া',
          postCode: '১৯৫০',
          totalCertificates: 1,
          lastCertificateType: 'শিক্ষার্থী পরিচয় প্রত্যয়নপত্র',
          lastCertificateDate: '১২/০৭/২০২৬',
          registeredAt: '2026-04-20'
        }
      ];

      defaultCitizens.forEach(c => {
        const key = c.nid || c.birthNo || c.holdingNo || c.name;
        map.set(key, c);
      });

      combinedCerts.forEach(cert => {
        if (!cert.citizen) return;
        const c = cert.citizen;
        const holding = c.holdingNo || (cert.extra && cert.extra.simpleFields ? cert.extra.simpleFields['holdingNo'] : '') || '';
        const key = c.nid || c.birthNo || holding || c.name;

        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.totalCertificates += 1;
          existing.lastCertificateType = cert.typeLabel;
          existing.lastCertificateDate = cert.issueDate;
          if (!existing.holdingNo && holding) {
            existing.holdingNo = holding;
          }
        } else {
          map.set(key, {
            id: `cit_${Date.now()}_${Math.random()}`,
            nid: c.nid || '',
            birthNo: c.birthNo || '',
            holdingNo: holding,
            name: c.name,
            father: c.father || '',
            mother: c.mother || '',
            spouseName: c.spouseName || '',
            gender: c.gender || 'পুরুষ',
            mobile: c.mobile || '',
            village: c.village || 'বহেড়াতৈল',
            wardNo: c.wardNo || '০১',
            postOffice: c.postOffice || 'বহেড়াতৈল',
            postCode: c.postCode || '১৯৫০',
            totalCertificates: 1,
            lastCertificateType: cert.typeLabel,
            lastCertificateDate: cert.issueDate,
            registeredAt: cert.createdAt || new Date().toISOString()
          });
        }
      });

      setCitizens(Array.from(map.values()));
    } catch (e) {
      console.error('Error loading citizens:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitizens();
  }, []);

  // Memoized stats summary calculation (single pass, executes only when citizens array updates)
  const citizenStats = useMemo(() => {
    let male = 0;
    let female = 0;
    let beneficiaries = 0;
    for (let i = 0; i < citizens.length; i++) {
      const c = citizens[i];
      if (c.gender === 'পুরুষ') male++;
      else if (c.gender === 'মহিলা') female++;
      if (c.totalCertificates > 0) beneficiaries++;
    }
    return { male, female, beneficiaries };
  }, [citizens]);

  // Real-time filtering logic
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      if (selectedWard && c.wardNo !== selectedWard) return false;
      if (selectedVillage && c.village !== selectedVillage) return false;
      if (selectedGender !== 'সব' && c.gender !== selectedGender) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const matchNid = (c.nid && c.nid.toLowerCase().includes(q)) || (c.birthNo && c.birthNo.toLowerCase().includes(q));
      const matchHolding = Boolean(c.holdingNo && c.holdingNo.toLowerCase().includes(q));
      const matchName = c.name.toLowerCase().includes(q) || 
                        (c.father && c.father.toLowerCase().includes(q)) || 
                        (c.spouseName && c.spouseName.toLowerCase().includes(q));
      const matchMobile = Boolean(c.mobile && c.mobile.includes(q));
      const matchVillage = c.village.toLowerCase().includes(q);

      if (searchCategory === 'nid') return matchNid;
      if (searchCategory === 'holding') return matchHolding;
      if (searchCategory === 'name') return matchName;
      if (searchCategory === 'mobile') return matchMobile;

      return matchNid || matchHolding || matchName || matchMobile || matchVillage;
    });
  }, [citizens, searchQuery, searchCategory, selectedWard, selectedVillage, selectedGender]);

  const handleCreateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitizen.name || !newCitizen.mother || !newCitizen.village) {
      alert('অনুগ্রহ করে নাগরিকের নাম, মাতার নাম এবং গ্রাম তথ্য প্রদান করুন।');
      return;
    }

    if (newCitizen.nid) {
      const nidVal = validateNid(newCitizen.nid);
      if (!nidVal.isValid) {
        alert(nidVal.message);
        return;
      }
    }

    if (newCitizen.birthNo) {
      const birthVal = validateBirthNo(newCitizen.birthNo);
      if (!birthVal.isValid) {
        alert(birthVal.message);
        return;
      }
    }

    if (newCitizen.mobile) {
      const phoneVal = validatePhone(newCitizen.mobile);
      if (!phoneVal.isValid) {
        alert(phoneVal.message);
        return;
      }
    }

    const createdRecord: CitizenAccountRecord = sanitizeObject({
      id: `cit_custom_${Date.now()}`,
      nid: newCitizen.nid || '',
      birthNo: newCitizen.birthNo || '',
      holdingNo: newCitizen.holdingNo || '',
      name: newCitizen.name || '',
      father: newCitizen.father || '',
      mother: newCitizen.mother || '',
      spouseName: newCitizen.spouseName || '',
      gender: newCitizen.gender || 'পুরুষ',
      mobile: newCitizen.mobile || '',
      village: newCitizen.village || 'বহেড়াতৈল',
      wardNo: newCitizen.wardNo || '০১',
      postOffice: newCitizen.postOffice || 'বহেড়াতৈল',
      postCode: newCitizen.postCode || '১৯৫০',
      totalCertificates: 0,
      registeredAt: new Date().toISOString()
    });

    setCitizens([createdRecord, ...citizens]);
    
    // Enqueue to Google Sheets Real-time Background Sync Queue
    try {
      sheetsSyncService.enqueueCitizenSync(createdRecord, config);
    } catch (sErr) {
      console.warn('Google Sheets background citizen queue error:', sErr);
    }

    setIsAddModalOpen(false);
    alert('নাগরিক অ্যাকাউন্ট সফলভাবে মাস্টার রেজিস্টার ও গুগ্‌ল শিট সিঙ্ক কিউতে যোগ করা হয়েছে!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>নাগরিক একাউন্ট ও মাস্টার রেজিস্টার</span>
          </h2>
          <p className="text-xs text-slate-500">
            {config.upName} এর সকল ওয়ার্ডের স্থায়ী নাগরিকদের প্রোফাইল, তথ্য অনুসন্ধান ও রিয়েল-টাইম ফিল্টারিং পোর্টাল।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCitizens}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsNidScannerOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Gemini Vision AI (NID)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>+ নতুন নাগরিক তথ্য</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-sm border border-emerald-800">
          <p className="text-[11px] text-emerald-200 font-semibold">মোট নিবন্ধিত নাগরিক</p>
          <p className="text-xl font-black text-amber-300 mt-1">{citizens.length} জন</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold">পুরুষ নাগরিক</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {citizenStats.male} জন
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold">মহিলা নাগরিক</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {citizenStats.female} জন
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold">সনদ সুবিধাভোগী</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {citizenStats.beneficiaries} জন
          </p>
        </div>
      </div>

      {/* High-Performance Real-Time Search Bar Section */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">লাইভ রিয়েল-টাইম নাগরিক এনকোয়ারি (NID / হোল্ডিং / নাম)</h3>
              <p className="text-[11px] text-slate-500">টাইপ করার সাথে সাথে ইন্সট্যান্ট ফিল্টারিং ফলাফল পাওয়া যাবে।</p>
            </div>
          </div>

          {/* Search Result Counter & Active Scope Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{filteredCitizens.length} জন নাগরিক পাওয়া গেছে</span>
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-full border border-rose-300 flex items-center gap-1 transition cursor-pointer"
                title="অনুসন্ধান মুছে ফেলুন"
              >
                <X className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Search Input Box */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 flex items-center gap-1">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="NID নম্বর (যেমন: 1985938201), হোল্ডিং নম্বর (যেমন: এইচ-১০৪), বা নাগরিকের নাম টাইপ করুন..."
            className="w-full pl-11 pr-10 py-3.5 bg-emerald-50/30 border-2 border-emerald-600/60 focus:border-emerald-700 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-600/10 transition shadow-inner"
            autoFocus
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Scope Buttons & Quick Sample Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Category Scopes */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1">সার্চ ফিল্ড:</span>
            
            <button
              onClick={() => setSearchCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                searchCategory === 'all'
                  ? 'bg-emerald-800 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>সকল ফিল্ড</span>
            </button>

            <button
              onClick={() => setSearchCategory('nid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                searchCategory === 'nid'
                  ? 'bg-emerald-800 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3 h-3 text-amber-400" />
              <span>NID / জন্ম সনদ</span>
            </button>

            <button
              onClick={() => setSearchCategory('holding')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                searchCategory === 'holding'
                  ? 'bg-emerald-800 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Home className="w-3 h-3 text-cyan-400" />
              <span>হোল্ডিং নং</span>
            </button>

            <button
              onClick={() => setSearchCategory('name')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                searchCategory === 'name'
                  ? 'bg-emerald-800 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>নাগরিকের নাম</span>
            </button>

            <button
              onClick={() => setSearchCategory('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                searchCategory === 'mobile'
                  ? 'bg-emerald-800 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>মোবাইল</span>
            </button>
          </div>

          {/* Quick Presets for fast test searches */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold">দ্রুত উদাহরণ:</span>
            <button
              onClick={() => { setSearchQuery('1985938201'); setSearchCategory('nid'); }}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-mono font-bold cursor-pointer"
            >
              1985938201
            </button>
            <button
              onClick={() => { setSearchQuery('এইচ-১০৪'); setSearchCategory('holding'); }}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold cursor-pointer"
            >
              এইচ-১০৪
            </button>
            <button
              onClick={() => { setSearchQuery('আতিকুর'); setSearchCategory('name'); }}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-bold cursor-pointer"
            >
              আতিকুর
            </button>
          </div>
        </div>

        {/* Secondary Filters (Ward, Village, Gender) */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Ward Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">ওয়ার্ড ফিল্টার:</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">সকল ওয়ার্ড (০১ - ০৯)</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  ওয়ার্ড নং {w}
                </option>
              ))}
            </select>
          </div>

          {/* Village Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">গ্রাম ফিল্টার:</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">সকল গ্রাম</option>
              {KNOWN_VILLAGES.map((v) => (
                <option key={v} value={v}>
                  গ্রাম: {v}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">লিঙ্গ ফিল্টার:</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
            >
              <option value="সব">সকল লিঙ্গ</option>
              <option value="পুরুষ">পুরুষ</option>
              <option value="মহিলা">মহিলা</option>
              <option value="হিজরা">হিজরা</option>
            </select>
          </div>
        </div>
      </div>

      {/* Citizen Register Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-800">
            <thead className="bg-emerald-950 text-white font-bold">
              <tr>
                <th className="p-3 border-r border-emerald-900">নাগরিকের নাম</th>
                <th className="p-3 border-r border-emerald-900">NID / জন্ম সনদ</th>
                <th className="p-3 border-r border-emerald-900">হোল্ডিং নং</th>
                <th className="p-3 border-r border-emerald-900">পিতা / স্বামী ও মাতা</th>
                <th className="p-3 border-r border-emerald-900">গ্রাম ও ওয়ার্ড</th>
                <th className="p-3 border-r border-emerald-900">মোবাইল</th>
                <th className="p-3 border-r border-emerald-900 text-center">ইস্যুকৃত সনদ</th>
                <th className="p-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-semibold">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                    <span>নাগরিক একাউন্ট লোড হইতেছে...</span>
                  </td>
                </tr>
              ) : filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">খোঁজাকৃত তথ্যের কোনো নাগরিক পাওয়া যায় নাই!</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      সঠিক NID, হোল্ডিং নং বা নাম লিখে সার্চ করুন অথবা উপরোক্ত রিসেট বাটনে ক্লিক করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((cit) => (
                  <tr key={cit.id} className="hover:bg-emerald-50/60 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div className="text-sm font-extrabold text-emerald-950">{cit.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">{cit.gender}</span>
                        {cit.registeredAt && (
                          <span className="text-[10px] text-slate-400">নিবন্ধন: {cit.registeredAt.substring(0, 10)}</span>
                        )}
                      </div>
                    </td>

                    {/* NID / Birth Registration Column */}
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {cit.nid ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-xs font-bold">
                            {cit.nid}
                          </span>
                          <button
                            onClick={() => handleCopyText(cit.nid!, 'nid')}
                            className="p-1 hover:bg-slate-200 text-slate-500 rounded transition cursor-pointer"
                            title="NID কপি করুন"
                          >
                            {copiedId === 'nid_' + cit.nid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : cit.birthNo ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[11px]">
                            {cit.birthNo}
                          </span>
                          <button
                            onClick={() => handleCopyText(cit.birthNo!, 'birth')}
                            className="p-1 hover:bg-slate-200 text-slate-500 rounded transition cursor-pointer"
                            title="জন্ম নম্বর কপি করুন"
                          >
                            {copiedId === 'birth_' + cit.birthNo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    {/* Holding Number Column */}
                    <td className="p-3">
                      {cit.holdingNo ? (
                        <div className="flex items-center gap-1">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-extrabold text-xs flex items-center gap-1">
                            <Home className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>{cit.holdingNo}</span>
                          </span>
                          <button
                            onClick={() => handleCopyText(cit.holdingNo!, 'holding')}
                            className="p-1 hover:bg-slate-200 text-slate-500 rounded transition cursor-pointer"
                            title="হোল্ডিং নম্বর কপি করুন"
                          >
                            {copiedId === 'holding_' + cit.holdingNo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">নির্ধারিত নয়</span>
                      )}
                    </td>

                    {/* Parents Column */}
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold text-slate-900">
                        <span className="text-slate-400 text-[10px] font-normal mr-1">পিতা/স্বামী:</span>
                        {cit.father || cit.spouseName || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="text-slate-400 text-[10px] font-normal mr-1">মাতা:</span>
                        {cit.mother || 'N/A'}
                      </div>
                    </td>

                    {/* Village & Ward Column */}
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{cit.village}</div>
                      <div className="mt-0.5">
                        <span className="text-[10px] bg-emerald-800 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          ওয়ার্ড নং {cit.wardNo}
                        </span>
                      </div>
                    </td>

                    {/* Mobile Column */}
                    <td className="p-3 font-mono text-slate-800">
                      {cit.mobile ? (
                        <a
                          href={`tel:${cit.mobile}`}
                          className="hover:underline text-emerald-800 font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{cit.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Issued Certificates Count Column */}
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full border border-amber-300">
                        {cit.totalCertificates} টি
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onApplyForCitizen(cit)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-sm active:scale-95"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>সনদ আবেদন</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Citizen Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <span>নতুন নাগরিক নিবন্ধন করুন</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNidScannerOpen(true)}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  <span>AI দিয়ে NID অটোফিল</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCitizen} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">নাগরিকের নাম (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  value={newCitizen.name}
                  onChange={(e) => setNewCitizen({ ...newCitizen, name: e.target.value })}
                  placeholder="যেমন: মোঃ কামরুল ইসলাম"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NID নম্বর</label>
                  <input
                    type="text"
                    value={newCitizen.nid}
                    onChange={(e) => setNewCitizen({ ...newCitizen, nid: e.target.value })}
                    placeholder="১০/১৭ ডিজিট"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্ম সনদ নম্বর</label>
                  <input
                    type="text"
                    value={newCitizen.birthNo}
                    onChange={(e) => setNewCitizen({ ...newCitizen, birthNo: e.target.value })}
                    placeholder="১৭ ডিজিট"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">হোল্ডিং নম্বর</label>
                  <input
                    type="text"
                    value={newCitizen.holdingNo}
                    onChange={(e) => setNewCitizen({ ...newCitizen, holdingNo: e.target.value })}
                    placeholder="যেমন: এইচ-১০৪"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={newCitizen.father}
                    onChange={(e) => setNewCitizen({ ...newCitizen, father: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মাতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={newCitizen.mother}
                    onChange={(e) => setNewCitizen({ ...newCitizen, mother: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">লিঙ্গ</label>
                  <select
                    value={newCitizen.gender}
                    onChange={(e) => setNewCitizen({ ...newCitizen, gender: e.target.value as any })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-semibold"
                  >
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="মহিলা">মহিলা</option>
                    <option value="হিজরা">হিজরা</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ওয়ার্ড নং</label>
                  <select
                    value={newCitizen.wardNo}
                    onChange={(e) => setNewCitizen({ ...newCitizen, wardNo: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-bold"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        ওয়ার্ড {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">গ্রাম</label>
                  <input
                    type="text"
                    value={newCitizen.village}
                    onChange={(e) => setNewCitizen({ ...newCitizen, village: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newCitizen.mobile}
                  onChange={(e) => setNewCitizen({ ...newCitizen, mobile: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow cursor-pointer"
                >
                  নাগরিক একাউন্ট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gemini Vision AI NID Scanner Modal */}
      <NidScannerModal
        isOpen={isNidScannerOpen}
        onClose={() => setIsNidScannerOpen(false)}
        onAutoFill={handleNidAutoFill}
      />
    </div>
  );
};

