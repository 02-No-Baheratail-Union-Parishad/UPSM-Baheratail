import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  User, 
  Code, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Sliders, 
  Cloud, 
  Key, 
  Database, 
  Award, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  Edit3 
} from 'lucide-react';
import { saveConfigToFirebase } from '../firebase';
import { UnionParishadConfig } from '../types';
import { CERTIFICATE_TYPES } from '../data/certificateTypes';
import { AppsScriptModal } from './AppsScriptModal';

interface AdminSettingsProps {
  config: UnionParishadConfig;
  onUpdateConfig: (newConfig: UnionParishadConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ config, onUpdateConfig }) => {
  const [formData, setFormData] = useState<UnionParishadConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAppsScriptOpen, setIsAppsScriptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'print' | 'workspace' | 'r2' | 'ai' | 'types'>('general');
  
  // Certificate Types Editing State
  const [certSearch, setCertSearch] = useState('');
  const [selectedCertKey, setSelectedCertKey] = useState<string>('citizenship');
  const [editingCertPrompt, setEditingCertPrompt] = useState<string>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      // Sync config to Firebase Firestore as well
      saveConfigToFirebase(formData).catch(err =>
        console.warn('Firebase config sync warning:', err)
      );

      if (data.success && data.config) {
        onUpdateConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCertType = CERTIFICATE_TYPES.find(t => t.key === selectedCertKey) || CERTIFICATE_TYPES[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Title */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>অ্যাডমিন মাস্টার কন্ট্রোল ও সিস্টেম কনফিগারেশন</span>
          </h2>
          <p className="text-xs text-slate-500">
            ইউনিয়ন পরিষদের নাম, চেয়ারম্যান/সচিব, লোগো, অ্যাপস স্ক্রিপ্ট, Cloudflare R2 এবং AI প্রম্পট সংশোধন করুন।
          </p>
        </div>

        <button
          onClick={() => setIsAppsScriptOpen(true)}
          className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Code className="w-4 h-4 text-amber-300" />
          <span>Apps Script কোড দেখুন</span>
        </button>
      </div>

      {/* Admin Tab Chooser */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>১. ইউপি ও অফিসার তথ্য</span>
        </button>

        <button
          onClick={() => setActiveTab('print')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'print'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-300" />
          <span>২. সিল, লোগো ও ফি</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'workspace'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Database className="w-4 h-4 text-amber-300" />
          <span>৩. গুগল ওয়ার্কস্পেস ও ড্রাইভার</span>
        </button>

        <button
          onClick={() => setActiveTab('r2')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'r2'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Cloud className="w-4 h-4 text-amber-300" />
          <span>৪. Cloudflare R2 / S3</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>৫. Gemini AI ও প্রম্পট</span>
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'types'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-300/80'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>৬. ৪০+ সনদ ক্যাটাগরি</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>ইউনিয়ন পরিষদ, এলাকা ও প্রশাসনিক কর্মকর্তা সমূহের তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউনিয়ন পরিষদের নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={formData.upName}
                  onChange={(e) => setFormData({ ...formData, upName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইউনিয়ন পরিষদের নাম (ইংরেজি)
                </label>
                <input
                  type="text"
                  value={formData.upNameEn}
                  onChange={(e) => setFormData({ ...formData, upNameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপজেলা ও জেলা
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.upazila}
                    onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                    placeholder="উপজেলা"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="জেলা"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যোগাযোগের নম্বর ও ইমেইল
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="মোবাইল নম্বর"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                  <input
                    type="text"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ইমেইল এড্রেস"
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্ণাঙ্গ অফিশিয়াল ঠিকানা ও পোস্ট অফিস বিবরণী
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-semibold"
                />
              </div>
            </div>

// Chairman & Secretary Details
            <div className="pt-2 border-t border-slate-200">
              <p className="font-bold text-xs text-slate-800 mb-3">চেয়ারম্যান ও প্রশাসনিক কর্মকর্তার স্বাক্ষর ও মোবাইল তথ্য:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <p className="font-bold text-xs text-emerald-950">চেয়ারম্যান / প্যানেল চেয়ারম্যান</p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নাম</label>
                    <input
                      type="text"
                      value={formData.chairmanName}
                      onChange={(e) => setFormData({ ...formData, chairmanName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পদবী</label>
                    <input
                      type="text"
                      value={formData.chairmanTitle}
                      onChange={(e) => setFormData({ ...formData, chairmanTitle: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">চেয়ারম্যানের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.chairmanPhone || ''}
                      onChange={(e) => setFormData({ ...formData, chairmanPhone: e.target.value })}
                      placeholder="যেমন: ০১৭৯৯-১১২২ ৩৩"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-mono font-bold text-emerald-900"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <p className="font-bold text-xs text-emerald-950">ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তা (সচিব)</p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">নাম</label>
                    <input
                      type="text"
                      value={formData.secretaryName}
                      onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">পদবী</label>
                    <input
                      type="text"
                      value={formData.secretaryTitle}
                      onChange={(e) => setFormData({ ...formData, secretaryTitle: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">সচিবের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.secretaryPhone || ''}
                      onChange={(e) => setFormData({ ...formData, secretaryPhone: e.target.value })}
                      placeholder="যেমন: ০১৮১২-৪৪৫৫ ৬৬"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-mono font-bold text-emerald-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Print & Branding & Payment Fees */}
        {activeTab === 'print' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>লোগো, অফিশিয়াল সিল, জলছাপ, মোবাইল ব্যাংকিং (MFS) ও টেমপ্লেট কাস্টমাইজার</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload Section */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  ইউনিয়ন পরিষদের লোগো / অফিশিয়াল সিল আপলোড ও লিংক (পূর্বে আপলোডকৃত লোগো সহ)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white border-2 border-emerald-800 p-2 shadow-sm flex items-center justify-center shrink-0">
                    <img
                      src={formData.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg'}
                      alt="Logo Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="লোগোর অনলাইন ইমেজের URL লিংক প্রদান করুন"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:border-emerald-600 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-lg cursor-pointer transition shadow-sm flex items-center gap-1">
                        <span>📁 নতুন লোগো ফাইল আপলোড করুন</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, logoUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg' })}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
                      >
                        সরকারি অফিশিয়াল সিল
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Layout Customizer Options */}
              <div className="md:col-span-2 bg-emerald-950 text-white p-4 rounded-xl space-y-3">
                <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>সনদের টেমপ্লেট ও লেআউট কাস্টমাইজার সেটিংস (ইচ্ছেমতো লেআউট নির্ধারণ)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">হেডার লেআউট স্টাইল:</label>
                    <select
                      value={formData.templateHeaderStyle || 'tri-column'}
                      onChange={(e) => setFormData({ ...formData, templateHeaderStyle: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    >
                      <option value="tri-column">১. ৩-কলাম হেডার (ছবি অনুযায়ী)</option>
                      <option value="centered">২. সেন্টার্ড লোগো ও টাইটেল</option>
                      <option value="classic">৩. ক্লাসিকাল সরকারি প্যাড</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">ফ্রেম বর্ডার স্টাইল:</label>
                    <select
                      value={formData.borderStyle || 'double-green-red'}
                      onChange={(e) => setFormData({ ...formData, borderStyle: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    >
                      <option value="double-green-red">ডবল বর্ডার (সবুজ ও লাল)</option>
                      <option value="double-green">ডবল সবুজ বর্ডার</option>
                      <option value="single-green">একক সবুজ বর্ডার</option>
                      <option value="none">নো বর্ডার (প্লেন কাগজ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">গোল সিল ফাঁকা স্থান (px):</label>
                    <input
                      type="number"
                      value={formData.blankSealSize ?? 96}
                      onChange={(e) => setFormData({ ...formData, blankSealSize: parseInt(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-200 font-bold mb-1">বডি ফন্ট সাইজ (px):</label>
                    <input
                      type="number"
                      value={formData.bodyFontSize || 16}
                      onChange={(e) => setFormData({ ...formData, bodyFontSize: parseInt(e.target.value) || 16 })}
                      className="w-full px-2.5 py-1.5 bg-emerald-900 border border-emerald-700 text-white rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bangladeshi MFS Numbers Settings */}
              <div className="md:col-span-2 bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>মোবাইল ব্যাংকিং (MFS) নম্বর ও নির্দেশনা সেটিংস</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-pink-400 mb-1">বিকাশ (bKash) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentBkashNumber || '01799-112233'}
                      onChange={(e) => setFormData({ ...formData, paymentBkashNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-400 mb-1">নগদ (Nagad) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentNagadNumber || '01812-445566'}
                      onChange={(e) => setFormData({ ...formData, paymentNagadNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-400 mb-1">রকেট (Rocket) মার্চেন্ট/পার্সোনাল:</label>
                    <input
                      type="text"
                      value={formData.paymentRocketNumber || '01911-223344'}
                      onChange={(e) => setFormData({ ...formData, paymentRocketNumber: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পেমেন্ট নির্দেশনা:</label>
                  <input
                    type="text"
                    value={formData.paymentInstructions || 'উক্ত নম্বরে সনদের ফি Send Money / Merchant Payment করে TrxID লিখুন।'}
                    onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              {/* Category-wise Fee Configuration */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="font-bold text-xs text-emerald-950">
                    সনদের ফি ব্যবস্থাপনা (ক্যাটাগরি ভিত্তিক চার্জ বসান):
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-600">ডিফল্ট ফি:</span>
                    <input
                      type="number"
                      value={formData.certificateFeeDefault || 50}
                      onChange={(e) => setFormData({ ...formData, certificateFeeDefault: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-emerald-900"
                    />
                    <span>টাকা</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'নাগরিকত্ব ও পরিচয়', defaultFee: 50 },
                    { key: 'উত্তরাধিকার ও ওয়ারিশান', defaultFee: 100 },
                    { key: 'চারিত্রিক ও প্রত্যয়ন', defaultFee: 50 },
                    { key: 'সম্পত্তি ও ভূমি সংক্রান্ত', defaultFee: 100 },
                    { key: 'বিবিধ ও অন্যান্য', defaultFee: 50 }
                  ].map((cat) => (
                    <div key={cat.key} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{cat.key}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-500">৳</span>
                        <input
                          type="number"
                          value={formData.categoryFees?.[cat.key] ?? cat.defaultFee}
                          onChange={(e) => {
                            const newFees = { ...(formData.categoryFees || {}), [cat.key]: parseInt(e.target.value) || 0 };
                            setFormData({ ...formData, categoryFees: newFees });
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-extrabold text-emerald-900 text-right focus:bg-white focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গোলাকার সিলের টেক্সট (Seal Text)
                </label>
                <input
                  type="text"
                  value={formData.sealText}
                  onChange={(e) => setFormData({ ...formData, sealText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none font-bold text-emerald-900"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableHeaderInPrint}
                    onChange={(e) => setFormData({ ...formData, enableHeaderInPrint: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    প্রিন্ট কপিতে সরকারি ডিজিটাল হেডার ডিফল্টভাবে দৃশ্যমান রাখুন
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Google Workspace Integration */}
        {activeTab === 'workspace' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>গুগল ডক্স টেমপ্লেট, ড্রাইভার ও শিট আইডি কনফিগারেশন</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Docs টেমপ্লেট আইডি (TEMPLATE_DOC_ID)
                </label>
                <input
                  type="text"
                  value={formData.templateDocId}
                  onChange={(e) => setFormData({ ...formData, templateDocId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Drive সেভ ফোল্ডার আইডি (TARGET_FOLDER_ID)
                </label>
                <input
                  type="text"
                  value={formData.targetFolderId}
                  onChange={(e) => setFormData({ ...formData, targetFolderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Sheets ডাটাবেস আইডি (SHEET_ID)
                </label>
                <input
                  type="text"
                  value={formData.sheetId}
                  onChange={(e) => setFormData({ ...formData, sheetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script WebApp URL (exec)
                </label>
                <input
                  type="text"
                  value={formData.appsScriptUrl || ''}
                  onChange={(e) => setFormData({ ...formData, appsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Cloudflare R2 / S3 Storage */}
        {activeTab === 'r2' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-700" />
                <span>Cloudflare R2 / S3 অবজেক্ট স্টোরেজ শংসাপত্র</span>
              </h3>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>সক্রিয় সংযোগ</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={formData.r2AccountId || '8145fd7882d729f182b85e7c18c1a5f0'}
                  onChange={(e) => setFormData({ ...formData, r2AccountId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Access Key ID
                </label>
                <input
                  type="text"
                  value={formData.r2AccessKeyId || '26d4ea0bfd548258646061ba6d80d57d'}
                  onChange={(e) => setFormData({ ...formData, r2AccessKeyId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Secret Access Key
                </label>
                <input
                  type="password"
                  value={formData.r2SecretAccessKey || 'b4c85f0e7c2937703376d89fb7d2a880cb2aa00631fcb8c32c8aa3d6612db94f'}
                  onChange={(e) => setFormData({ ...formData, r2SecretAccessKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  S3 API Endpoint URL
                </label>
                <input
                  type="text"
                  value={formData.r2Endpoint || 'https://8145fd7882d729f182b85e7c18c1a5f0.r2.cloudflarestorage.com'}
                  onChange={(e) => setFormData({ ...formData, r2Endpoint: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  R2 Storage Bucket Name
                </label>
                <input
                  type="text"
                  value={formData.r2BucketName || 'certificates-storage'}
                  onChange={(e) => setFormData({ ...formData, r2BucketName: e.target.value })}
                  placeholder="certificates-storage"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI & Gemini System Prompts */}
        {activeTab === 'ai' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Gemini AI সিস্টেম প্রম্পট ও কাস্টম এপিআই কি</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gemini AI সিস্টেম প্রম্পট প্রেফিক্স (Zero-Fluff Rules)
                </label>
                <textarea
                  rows={4}
                  value={formData.defaultPromptPrefix}
                  onChange={(e) => setFormData({ ...formData, defaultPromptPrefix: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কাস্টম Gemini API Key (যদি নিজে পরিবর্তন করিতে চান)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="AQ.Ab8RN6Ki-YLREscKL..."
                    value={formData.geminiApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  ফাঁকা রাখিলে সিস্টেমের ডিফল্ট এপিআই কী ব্যবহৃত হইবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Certificate Types Customizer */}
        {activeTab === 'types' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>৪০+ প্রাতিষ্ঠানিক প্রত্যয়নপত্রের ধরন ও প্রম্পট টিউনিং</span>
                </h3>
                <p className="text-xs text-slate-500">
                  যেকোনো সনদের এআই প্রম্পট নির্দেশনা বা তথ্য ক্ষেত্রগুলো পর্যবেক্ষণ করুন।
                </p>
              </div>

              <input
                type="text"
                placeholder="সনদ খুঁজুন..."
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type List Selector */}
              <div className="max-h-80 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl bg-slate-50">
                {CERTIFICATE_TYPES.filter(t => t.label.includes(certSearch) || t.category.includes(certSearch)).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setSelectedCertKey(t.key);
                      setEditingCertPrompt(t.promptInstruction || '');
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                      selectedCertKey === t.key
                        ? 'bg-emerald-800 text-white shadow'
                        : 'bg-white text-slate-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{t.label}</span>
                    {selectedCertKey === t.key && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </button>
                ))}
              </div>

              {/* Type Details & Prompt Editor */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950">{selectedCertType.label}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {selectedCertType.category}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gemini AI প্রম্পট গাইডলাইন (বাংলায়)
                  </label>
                  <textarea
                    rows={4}
                    value={editingCertPrompt || selectedCertType.promptInstruction || ''}
                    onChange={(e) => setEditingCertPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {selectedCertType.simpleFields && selectedCertType.simpleFields.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      সংযুক্ত ডায়নামিক ফিল্ডসমূহ:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCertType.simpleFields.map(f => (
                        <span key={f.key} className="px-2 py-1 bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded">
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Status Notification */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>কনফিগারেশন পরিবর্তন সফলভাবে সংরক্ষিত ও আপডেট করা হইয়াছে!</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>সেভ হইতেছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>মাস্টার কনফিগারেশন সেভ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Apps Script Code Modal */}
      <AppsScriptModal isOpen={isAppsScriptOpen} onClose={() => setIsAppsScriptOpen(false)} />
    </div>
  );
};
