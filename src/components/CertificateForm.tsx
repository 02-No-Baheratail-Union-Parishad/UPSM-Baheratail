import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Camera, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Filter, 
  ChevronRight, 
  UserCheck, 
  RotateCcw 
} from 'lucide-react';
import { 
  CERTIFICATE_TYPES, 
  CERTIFICATE_CATEGORIES 
} from '../data/certificateTypes';
import { 
  KNOWN_VILLAGES, 
  KNOWN_POST_OFFICES, 
  WARDS 
} from '../data/villages';
import { 
  CertificateRecord, 
  CertificateTypeConfig, 
  NidScanResult, 
  UnionParishadConfig 
} from '../types';
import { NidScannerModal } from './NidScannerModal';
import { WarishTableBuilder } from './WarishTableBuilder';

import { saveCertificateToFirebase } from '../firebase';

interface CertificateFormProps {
  config: UnionParishadConfig;
  onCertificateGenerated: (cert: CertificateRecord) => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ config, onCertificateGenerated }) => {
  // Category & Type Selection State
  const [selectedCategory, setSelectedCategory] = useState('সব ধরন');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>('citizenship');

  // Search Existing Citizen State
  const [searchNidInput, setSearchNidInput] = useState('');
  const [searchingCitizen, setSearchingCitizen] = useState(false);
  const [citizenSearchResult, setCitizenSearchResult] = useState<string | null>(null);

  // Form Basic Data State
  const [nid, setNid] = useState('');
  const [birthNo, setBirthNo] = useState('');
  const [name, setName] = useState('');
  const [father, setFather] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [mother, setMother] = useState('');
  const [gender, setGender] = useState<'পুরুষ' | 'মহিলা' | 'হিজরা'>('পুরুষ');
  const [mobile, setMobile] = useState('');
  const [wardNo, setWardNo] = useState('০৫');
  const [villageSelect, setVillageSelect] = useState('বহেড়াতৈল');
  const [villageOther, setVillageOther] = useState('');
  const [postOfficeSelect, setPostOfficeSelect] = useState('বহেড়াতৈল');
  const [postOfficeOther, setPostOfficeOther] = useState('');
  const [postCodeOther, setPostCodeOther] = useState('১৯৫০');

  // Dynamic Fields & Tables State
  const [simpleFields, setSimpleFields] = useState<Record<string, string>>({});
  const [tablesData, setTablesData] = useState<Record<string, string[][]>>({});
  const [customNote, setCustomNote] = useState('');
  const [highThinking, setHighThinking] = useState(false);

  // UI Modals & Loading
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered types list
  const filteredTypes = CERTIFICATE_TYPES.filter((type) => {
    const matchesCategory = selectedCategory === 'সব ধরন' || type.category === selectedCategory;
    const matchesSearch =
      type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTypeObj = CERTIFICATE_TYPES.find((t) => t.key === selectedTypeKey) || CERTIFICATE_TYPES[0];

  // Helper for final village & post office
  const getFinalVillage = () => (villageSelect === 'OTHER' ? villageOther.trim() : villageSelect);
  const getFinalPostOffice = () => (postOfficeSelect === 'OTHER' ? postOfficeOther.trim() : postOfficeSelect);

  // Handle NID Search Auto-fill
  const handleSearchCitizen = async () => {
    if (!searchNidInput.trim()) return;
    setSearchingCitizen(true);
    setCitizenSearchResult(null);

    try {
      const res = await fetch(`/api/citizen/search?nid=${encodeURIComponent(searchNidInput.trim())}`);
      const data = await res.json();

      if (data.found && data.citizen) {
        const c = data.citizen;
        setName(c.name || '');
        setFather(c.father || '');
        setMother(c.mother || '');
        setSpouseName(c.spouseName || '');
        setGender(c.gender || 'পুরুষ');
        setMobile(c.mobile || '');
        setNid(c.nid || searchNidInput);
        if (c.wardNo) setWardNo(c.wardNo);
        if (c.village && KNOWN_VILLAGES.includes(c.village)) setVillageSelect(c.village);
        else if (c.village) {
          setVillageSelect('OTHER');
          setVillageOther(c.village);
        }
        setCitizenSearchResult(`✅ পূর্বের ডাটা পাওয়া গিয়াছে: ${c.name} (${c.village})`);
      } else {
        setCitizenSearchResult('⚠️ উক্ত নম্বরে কোনো পূর্বের তথ্য পাওয়া যায় নাই। নতুন তথ্য পূরণ করুন।');
      }
    } catch (e) {
      setCitizenSearchResult('⚠️ সার্চকালে সংযোগ ত্রুটি ঘটিয়াছে।');
    } finally {
      setSearchingCitizen(false);
    }
  };

  // Handle Auto Fill from NID Vision OCR
  const handleNidAutoFill = (result: NidScanResult) => {
    if (result.nidNo) setNid(result.nidNo);
    if (result.name) setName(result.name);
    if (result.fatherName) setFather(result.fatherName);
    if (result.motherName) setMother(result.motherName);
    if (result.spouseName) setSpouseName(result.spouseName);
    if (result.village && KNOWN_VILLAGES.includes(result.village)) {
      setVillageSelect(result.village);
    }
    if (result.wardNo) setWardNo(result.wardNo);
  };

  // MFS Payment State
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash' | 'Upay'>('Cash');
  const [trxId, setTrxId] = useState('');

  // Dynamic Fee Calculation
  const calculateFee = () => {
    if (config.typeFeeOverrides && config.typeFeeOverrides[selectedTypeKey]) {
      return config.typeFeeOverrides[selectedTypeKey];
    }
    const cat = selectedTypeObj.category;
    if (config.categoryFees && config.categoryFees[cat]) {
      return config.categoryFees[cat];
    }
    return config.certificateFeeDefault || 50;
  };

  const currentFee = calculateFee();

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে নাগরিকের নাম প্রদান করুন।');
      return;
    }
    if (!mother.trim()) {
      setErrorMessage('মাতার নাম প্রদান করা আবশ্যক।');
      return;
    }
    if (!father.trim() && !spouseName.trim()) {
      setErrorMessage('পিতার নাম অথবা স্বামী/স্ত্রীর নাম—অন্তত একটি প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        typeKey: selectedTypeKey,
        nid,
        birthNo,
        name,
        father,
        spouseName,
        mother,
        gender,
        mobile,
        village: getFinalVillage(),
        postOffice: getFinalPostOffice(),
        postCode: postOfficeSelect === 'OTHER' ? postCodeOther : '১৯৫০',
        wardNo,
        extra: {
          simpleFields,
          tables: tablesData
        },
        customNote,
        highThinking,
        feeAmount: currentFee,
        paymentMethod,
        trxId: trxId.trim(),
        paymentStatus: 'paid'
      };

      const res = await fetch('/api/certificate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (resData.status === 'success' && resData.certificate) {
        // Asynchronously sync to Firebase Firestore for cloud persistence
        saveCertificateToFirebase(resData.certificate).catch(err => 
          console.warn('Firebase sync warning (certificate still saved locally):', err)
        );
        onCertificateGenerated(resData.certificate);
      } else {
        setErrorMessage(resData.message || 'সনদ তৈরিতে ত্রুটি ঘটিয়াছে।');
      }
    } catch (err: any) {
      setErrorMessage('সার্ভার সংযোগে ত্রুটি ঘটিয়াছে: ' + (err?.message || 'চেষ্টা করুন'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Certificate Type Chooser */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <span>১. প্রত্যয়নপত্রের ধরন নির্বাচন করুন (৪০+ ধরন)</span>
            </h2>
            <p className="text-xs text-slate-500">
              ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের সকল প্রকার অফিশিয়াল সনদের তালিকা।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="সনদের নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CERTIFICATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificate Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
          {filteredTypes.map((type) => {
            const isSelected = selectedTypeKey === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => {
                  setSelectedTypeKey(type.key);
                  setSimpleFields({});
                  setTablesData({});
                }}
                className={`p-3 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-md font-bold'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-snug">{type.label}</p>
                  <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {type.category}
                  </span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Quick Search & NID Scan Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NID / Birth Reg Search */}
        <div className="bg-emerald-950 text-white p-4 rounded-xl shadow-sm border border-emerald-800 flex flex-col justify-between space-y-2">
          <div>
            <h3 className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>পূর্বের ডাটা খুঁজুন (NID / জন্ম সনদ)</span>
            </h3>
            <p className="text-[11px] text-emerald-300">
              নাগরিকের আগের রেকর্ড থাকলে স্বয়ংক্রিয়ভাবে ফর্মের তথ্য পূরণ হইবে।
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="NID বা জন্ম নিবন্ধন নম্বর..."
              value={searchNidInput}
              onChange={(e) => setSearchNidInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-emerald-900 border border-emerald-700 text-white placeholder-emerald-400 rounded-lg text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleSearchCitizen}
              disabled={searchingCitizen}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              {searchingCitizen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>খুঁজুন</span>
            </button>
          </div>
          {citizenSearchResult && (
            <p className="text-[11px] font-semibold text-amber-200 bg-emerald-900/80 p-1.5 rounded border border-emerald-700">
              {citizenSearchResult}
            </p>
          )}
        </div>

        {/* Gemini Vision AI NID Scanner Button */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-xl shadow-sm border border-emerald-700 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold">NID স্ক্যান ও ফটো অটো-ফিল</h3>
            </div>
            <p className="text-[11px] text-emerald-100 max-w-xs">
              Gemini Vision AI দিয়ে NID কার্ডের ছবি তুলিয়া নাম, ঠিকানা ও তথ্য এক ক্লিকে বসান।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-white text-emerald-900 hover:bg-amber-300 hover:text-emerald-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>ছবি স্ক্যান করুন</span>
          </button>
        </div>
      </div>

      {/* Step 3: Main Citizen Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-bold">
                ২
              </span>
              <span>আবেদনকারীর তথ্যাবলী পূরণ করুন ({selectedTypeObj.label})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              সকল তথ্য দাপ্তরিক নিবন্ধনের জন্য গুগল শিটে সংরক্ষিত হইবে।
            </p>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
            ওয়ার্ড নং: {wardNo}
          </span>
        </div>

        {/* Basic Personal Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আবেদনকারীর নাম (বাংলায়) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: মোঃ আতিকুর রহমান"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পিতার নাম (বাংলায়)
            </label>
            <input
              type="text"
              value={father}
              onChange={(e) => setFather(e.target.value)}
              placeholder="যেমন: হাজী আব্দুল গণি"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              স্বামী/স্ত্রীর নাম (প্রযোজ্য ক্ষেত্রে)
            </label>
            <input
              type="text"
              value={spouseName}
              onChange={(e) => setSpouseName(e.target.value)}
              placeholder="যেমন: মোছাঃ সালমা আক্তার"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মাতার নাম (বাংলায়) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={mother}
              onChange={(e) => setMother(e.target.value)}
              placeholder="যেমন: আয়েশা খাতুন"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              জাতীয় পরিচয়পত্র (NID) / জন্ম সনদ নম্বর
            </label>
            <input
              type="text"
              value={nid || birthNo}
              onChange={(e) => setNid(e.target.value)}
              placeholder="১০, ১৩ বা ১৭ ডিজিট"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              লিঙ্গ <span className="text-red-600">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
            >
              <option value="পুরুষ">১. পুরুষ</option>
              <option value="মহিলা">২. মহিলা</option>
              <option value="হিজরা">৩. হিজরা</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মোবাইল নম্বর (এসএমএস নিশ্চিতকরণের জন্য)
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="যেমন: 01712345678"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ওয়ার্ড নম্বর <span className="text-red-600">*</span>
            </label>
            <select
              value={wardNo}
              onChange={(e) => setWardNo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-bold text-emerald-900"
            >
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  ওয়ার্ড নং {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              গ্রাম <span className="text-red-600">*</span>
            </label>
            <select
              value={villageSelect}
              onChange={(e) => setVillageSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {KNOWN_VILLAGES.map((v, i) => (
                <option key={v} value={v}>
                  {i + 1}. {v}
                </option>
              ))}
              <option value="OTHER">১৬. অন্যান্য (নিজে লিখুন)</option>
            </select>
            {villageSelect === 'OTHER' && (
              <input
                type="text"
                value={villageOther}
                onChange={(e) => setVillageOther(e.target.value)}
                placeholder="গ্রামের নাম লিখুন"
                className="w-full px-3 py-2 mt-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ডাকঘর <span className="text-red-600">*</span>
            </label>
            <select
              value={postOfficeSelect}
              onChange={(e) => setPostOfficeSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
            >
              {KNOWN_POST_OFFICES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} - {p.code}
                </option>
              ))}
              <option value="OTHER">অন্যান্য (নিজে লিখুন)</option>
            </select>
            {postOfficeSelect === 'OTHER' && (
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={postOfficeOther}
                  onChange={(e) => setPostOfficeOther(e.target.value)}
                  placeholder="ডাকঘরের নাম"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                />
                <input
                  type="text"
                  value={postCodeOther}
                  onChange={(e) => setPostCodeOther(e.target.value)}
                  placeholder="পোস্ট কোড"
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Fields for Selected Certificate Type */}
        {selectedTypeObj.simpleFields && selectedTypeObj.simpleFields.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-emerald-900 border-b border-slate-200 pb-1">
              {selectedTypeObj.label} সংক্রান্ত বিশেষ তথ্যসূচি:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedTypeObj.simpleFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label} {field.required && <span className="text-red-600">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={simpleFields[field.label] || ''}
                    onChange={(e) =>
                      setSimpleFields({ ...simpleFields, [field.label]: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Table Builder for Warish / Family List */}
        {selectedTypeObj.tables && selectedTypeObj.tables.length > 0 && (
          <div>
            {selectedTypeObj.tables.map((tbl) => (
              <WarishTableBuilder
                key={tbl.key}
                tableConfig={tbl}
                rowsData={tablesData[tbl.key] || []}
                onChangeRows={(newRows) => setTablesData({ ...tablesData, [tbl.key]: newRows })}
              />
            ))}
          </div>
        )}

        {/* Custom AI Note & Model Selection Toggle */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>এআই প্রম্পট বা অতিরিক্ত বিবরণী নোট (ঐচ্ছিক):</span>
            </label>

            {/* High Thinking Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
              <input
                type="checkbox"
                checked={highThinking}
                onChange={(e) => setHighThinking(e.target.checked)}
                className="rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-emerald-900">
                High Thinking (Gemini Pro) যুক্ত করুন
              </span>
            </label>
          </div>

          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="যেমন: আবেদনকারীর জমি অধিগ্রহণ বা চাকরির সুবিধার্থে বিশেষ ছাড়ের বিষয়টি উল্লেখ করা হউক।"
            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs focus:border-emerald-700 focus:outline-none"
          />
        </div>

        {/* Bangladeshi MFS Mobile Banking Payment Gateway Section */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                <span>৩. সরকারি সেবা ফি ও মোবাইল ব্যাংকিং (MFS) পেমেন্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                নির্বাচিত সনদের ক্যাটাগরি: <span className="text-emerald-300 font-bold">{selectedTypeObj.category}</span>
              </p>
            </div>

            <div className="bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-700 text-right">
              <span className="text-[10px] text-emerald-300 block font-semibold">নির্ধারিত সরকারি ফি</span>
              <span className="text-xl font-black text-amber-400">৳{currentFee}.০০</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                পেমেন্ট মাধ্যম নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bKash', label: 'বিকাশ', num: config.paymentBkashNumber || '01799-112233', bg: 'bg-pink-600' },
                  { id: 'Nagad', label: 'নগদ', num: config.paymentNagadNumber || '01812-445566', bg: 'bg-orange-600' },
                  { id: 'Rocket', label: 'রকেট', num: config.paymentRocketNumber || '01911-223344', bg: 'bg-purple-600' },
                  { id: 'Cash', label: 'ক্যাশ', num: 'কাউন্টার আদায়', bg: 'bg-emerald-700' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === m.id
                        ? 'border-amber-400 bg-slate-800 text-white ring-2 ring-amber-400/50'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${m.bg}`} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MFS Instructions & TrxID Entry */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between space-y-2">
              {paymentMethod !== 'Cash' ? (
                <>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <span>{paymentMethod} মার্চেন্ট/পার্সোনাল নম্বর:</span>
                      <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-white font-extrabold">
                        {paymentMethod === 'bKash' ? config.paymentBkashNumber : paymentMethod === 'Nagad' ? config.paymentNagadNumber : config.paymentRocketNumber}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-300 leading-tight">
                      {config.paymentInstructions || 'উক্ত নম্বরে সনদের ফি Send Money / Merchant Payment করে TrxID লিখুন।'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      ট্রানজেকশন আইডি (TrxID) প্রদান করুন:
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="যেমন: B8X9A10K2Z"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="text-xs space-y-1 my-auto">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <span>✅ ক্যাশ কাউন্টার পেমেন্ট নির্বাচিত</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    আবেদনকারীর নিকট হইতে ইউনিয়নের ক্যাশ কাউন্টারে ৳{currentFee} ফি সরাসরি নগদ গ্রহণ করা হইয়াছে।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setName('');
              setFather('');
              setMother('');
              setSpouseName('');
              setNid('');
              setSimpleFields({});
              setTablesData({});
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ফর্ম রিসেট করুন</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                <span>Gemini AI দাপ্তরিক সনদ জেনারেট করিতেছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>✅ প্রত্যয়নপত্র জেনারেট করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* NID Scanner Modal */}
      <NidScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAutoFill={handleNidAutoFill}
      />
    </div>
  );
};
