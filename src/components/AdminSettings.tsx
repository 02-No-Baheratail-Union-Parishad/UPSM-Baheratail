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
  FileCode, 
  Sliders 
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>অ্যাডমিন মাস্টার কন্ট্রোল ও সেটআপ প্যানেল</span>
          </h2>
          <p className="text-xs text-slate-500">
            ইউনিয়ন পরিষদের নাম, চেয়ারম্যান/সচিবের নাম, লোগো, অ্যাপস স্ক্রিপ্ট আইডি এবং এআই প্রম্পট পরিবর্তন করুন।
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Union Parishad Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>১. ইউনিয়ন পরিষদ ও ভৌগোলিক তথ্য</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ইউনিয়ন পরিষদের নাম (বাংলায়)
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
                উপজেলা ও জেলা
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.upazila}
                  onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                  placeholder="উপজেলা"
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="জেলা"
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পূর্ণাঙ্গ ঠিকানা ও ডাকঘর বিবরণী
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Chairman & Secretary Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>২. চেয়ারম্যান ও প্রশাসনিক কর্মকর্তা (সচিব) তথ্য</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chairman */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
              <p className="font-bold text-xs text-emerald-950">চেয়ারম্যান / প্যানেল চেয়ারম্যান</p>
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
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Secretary */}
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
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding, Logo & AI Prompts */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-emerald-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>৩. লোগো, জলছাপ ও এআই প্রম্পট কনফিগারেশন</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                লোগো / সিল ইমেজ URL
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gemini AI সিস্টেম প্রম্পট প্রেফিক্স
              </label>
              <textarea
                rows={2}
                value={formData.defaultPromptPrefix}
                onChange={(e) => setFormData({ ...formData, defaultPromptPrefix: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Docs টেমপ্লেট ফাইল আইডি
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
                  Google Drive সেভ ফোল্ডার আইডি
                </label>
                <input
                  type="text"
                  value={formData.targetFolderId}
                  onChange={(e) => setFormData({ ...formData, targetFolderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification & Actions */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>অ্যাডমিন কনফিগারেশন সফলভাবে আপডেট করা হইয়াছে!</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>সেভ হইতেছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>কনফিগারেশন সেভ করুন</span>
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
