import React, { useState, useEffect } from 'react';
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
  Camera
} from 'lucide-react';
import { WARDS, KNOWN_VILLAGES } from '../data/villages';
import { CitizenAccountRecord, UnionParishadConfig, NidScanResult } from '../types';
import { fetchCertificatesFromFirebase } from '../firebase';
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
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedGender, setSelectedGender] = useState('সব');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNidScannerOpen, setIsNidScannerOpen] = useState(false);

  // New Citizen Form State
  const [newCitizen, setNewCitizen] = useState<Partial<CitizenAccountRecord>>({
    name: '',
    nid: '',
    birthNo: '',
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

      // Pre-seed some default citizen master records for 02নং বহেড়াতৈল ইউনিয়ন
      const defaultCitizens: CitizenAccountRecord[] = [
        {
          id: 'cit_101',
          nid: '1985938201',
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
        const key = c.nid || c.birthNo || c.name;
        map.set(key, c);
      });

      combinedCerts.forEach(cert => {
        if (!cert.citizen) return;
        const c = cert.citizen;
        const key = c.nid || c.birthNo || c.name;

        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.totalCertificates += 1;
          existing.lastCertificateType = cert.typeLabel;
          existing.lastCertificateDate = cert.issueDate;
        } else {
          map.set(key, {
            id: `cit_${Date.now()}_${Math.random()}`,
            nid: c.nid || '',
            birthNo: c.birthNo || '',
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

  // Filter logic
  const filteredCitizens = citizens.filter((c) => {
    if (selectedWard && c.wardNo !== selectedWard) return false;
    if (selectedVillage && c.village !== selectedVillage) return false;
    if (selectedGender !== 'সব' && c.gender !== selectedGender) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchNid = c.nid && c.nid.includes(q);
      const matchBirth = c.birthNo && c.birthNo.includes(q);
      const matchFather = c.father && c.father.toLowerCase().includes(q);
      const matchVillage = c.village.toLowerCase().includes(q);
      const matchMobile = c.mobile && c.mobile.includes(q);

      return matchName || matchNid || matchBirth || matchFather || matchVillage || matchMobile;
    }

    return true;
  });

  const handleCreateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitizen.name || !newCitizen.mother || !newCitizen.village) {
      alert('অনুগ্রহ করে নাগরিকের নাম, মাতার নাম এবং গ্রাম তথ্য প্রদান করুন।');
      return;
    }

    const createdRecord: CitizenAccountRecord = {
      id: `cit_custom_${Date.now()}`,
      nid: newCitizen.nid || '',
      birthNo: newCitizen.birthNo || '',
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
    };

    setCitizens([createdRecord, ...citizens]);
    setIsAddModalOpen(false);
    alert('নাগরিক অ্যাকাউন্ট সফলভাবে মাস্টার রেজিস্টারে যোগ করা হয়েছে!');
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
            {config.upName} এর সকল ওয়ার্ডের স্থায়ী নাগরিকদের প্রোফাইল, তথ্য অনুসন্ধান ও ফিল্টারিং পোর্টাল।
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
            {citizens.filter(c => c.gender === 'পুরুষ').length} জন
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold">মহিলা নাগরিক</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {citizens.filter(c => c.gender === 'মহিলা').length} জন
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold">সনদ সুবিধাভোগী</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {citizens.filter(c => c.totalCertificates > 0).length} জন
          </p>
        </div>
      </div>

      {/* Advanced Search & Filtering Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search Query */}
        <div className="relative md:col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="নাম, NID, পিতা, গ্রাম বা মোবাইল..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Ward Filter */}
        <div>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
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
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none"
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
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none"
          >
            <option value="সব">সকল লিঙ্গ</option>
            <option value="পুরুষ">পুরুষ</option>
            <option value="মহিলা">মহিলা</option>
            <option value="হিজরা">হিজরা</option>
          </select>
        </div>
      </div>

      {/* Citizen Register Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-800">
            <thead className="bg-emerald-950 text-white font-bold">
              <tr>
                <th className="p-3 border-r border-emerald-900">নাগরিকের নাম</th>
                <th className="p-3 border-r border-emerald-900">পিতা / স্বামী</th>
                <th className="p-3 border-r border-emerald-900">মাতার নাম</th>
                <th className="p-3 border-r border-emerald-900">NID / জন্ম সনদ</th>
                <th className="p-3 border-r border-emerald-900">গ্রাম ও ওয়ার্ড</th>
                <th className="p-3 border-r border-emerald-900">মোবাইল</th>
                <th className="p-3 border-r border-emerald-900 text-center">ইস্যুকৃত সনদ</th>
                <th className="p-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 font-semibold">
                    নাগরিক একাউন্ট লোড হইতেছে...
                  </td>
                </tr>
              ) : filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    ফিল্টারিং শর্তানুযায়ী কোনো নাগরিকের তথ্য পাওয়া যায় নাই।
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((cit) => (
                  <tr key={cit.id} className="hover:bg-emerald-50/50 transition">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{cit.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{cit.gender}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {cit.father || cit.spouseName || 'N/A'}
                    </td>
                    <td className="p-3 text-slate-700">{cit.mother}</td>
                    <td className="p-3 font-mono font-bold text-emerald-900">
                      {cit.nid || cit.birthNo || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{cit.village}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded ml-1 font-bold">
                        ওয়ার্ড {cit.wardNo}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{cit.mobile || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                        {cit.totalCertificates} টি
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onApplyForCitizen(cit)}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition flex items-center gap-1 mx-auto cursor-pointer shadow-sm"
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
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg px-1"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র (NID)</label>
                  <input
                    type="text"
                    value={newCitizen.nid}
                    onChange={(e) => setNewCitizen({ ...newCitizen, nid: e.target.value })}
                    placeholder="১০ বা ১৭ ডিজিট"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্ম সনদ নম্বর</label>
                  <input
                    type="text"
                    value={newCitizen.birthNo}
                    onChange={(e) => setNewCitizen({ ...newCitizen, birthNo: e.target.value })}
                    placeholder="১৭ ডিজিট"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
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
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
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
