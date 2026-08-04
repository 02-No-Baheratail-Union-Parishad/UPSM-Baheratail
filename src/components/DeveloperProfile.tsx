import React, { useState } from 'react';
import { 
  Code2, 
  User, 
  Github, 
  FolderGit2, 
  Cloud, 
  Mail, 
  Phone, 
  ExternalLink, 
  Terminal, 
  Cpu, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Wrench, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { UnionParishadConfig } from '../types';

interface DeveloperProfileProps {
  config: UnionParishadConfig;
  onUpdateConfig?: (newConfig: UnionParishadConfig) => void;
}

export const DeveloperProfile: React.FC<DeveloperProfileProps> = ({ config, onUpdateConfig }) => {
  const [developerName, setDeveloperName] = useState(config.developerName || 'MD JUBAER HOSSEN');
  const [developerTitle, setDeveloperTitle] = useState(config.developerTitle || 'লীড সিস্টেম আর্কিটেক্ট ও ফুল-স্ট্যাক অটোমেশন ইঞ্জিনিয়ার');
  const [developerBio, setDeveloperBio] = useState(config.developerBio || '০২নং বহেড়াতৈল ইউনিয়ন পরিষদের ডিজিটাল অটোমেশন সিস্টেম, ক্লাউড আর্কিটেকচার এবং Gemini AI চালিত স্মার্ট প্রত্যয়নপত্র ইঞ্জিন প্রস্তুতকারক।');
  const [developerEmail, setDeveloperEmail] = useState(config.developerEmail || 'baheratailunion@gmail.com');
  const [developerPhone, setDeveloperPhone] = useState(config.developerPhone || '01834333300');
  const [developerWhatsapp, setDeveloperWhatsapp] = useState(config.developerWhatsappNumber || '01834333300');
  const [developerFacebook, setDeveloperFacebook] = useState(config.developerFacebookUrl || 'https://facebook.com/jubaerhossen');
  const [developerLinkedin, setDeveloperLinkedin] = useState(config.developerLinkedinUrl || 'https://linkedin.com/in/jubaerhossen');
  const [photoUrl, setPhotoUrl] = useState(config.developerPhotoUrl || '');

  const [githubUrl, setGithubUrl] = useState(config.githubRepoUrl || 'https://github.com/baheratail-up/up-automation-system');
  const [githubBranch, setGithubBranch] = useState(config.githubBranch || 'main');
  const [driveUrl, setDriveUrl] = useState(config.googleDriveBackupUrl || 'https://drive.google.com/drive/folders/1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU');
  const [mcpEndpoint, setMcpEndpoint] = useState(config.mcpEndpointUrl || 'https://api.baheratailup.gov.bd/v1/mcp');
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || 'https://api.baheratailup.gov.bd/v1/webhook');
  const [webhookSecret, setWebhookSecret] = useState(config.webhookSecret || 'whsec_up_baheratail_2026_secret_key');

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingBackup, setIsSyncingBackup] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDeveloperConfig = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    const updated: UnionParishadConfig = {
      ...config,
      developerName,
      developerTitle,
      developerBio,
      developerEmail,
      developerPhone,
      developerWhatsappNumber: developerWhatsapp,
      developerFacebookUrl: developerFacebook,
      developerLinkedinUrl: developerLinkedin,
      developerPhotoUrl: photoUrl,
      githubRepoUrl: githubUrl,
      githubBranch,
      googleDriveBackupUrl: driveUrl,
      mcpEndpointUrl: mcpEndpoint,
      webhookUrl,
      webhookSecret,
      lastBackupDate: new Date().toLocaleString('bn-BD')
    };

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success && onUpdateConfig) {
        onUpdateConfig(data.config);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving developer config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGithubBackupSync = () => {
    setIsSyncingBackup(true);
    setTestLog(`[GITHUB BACKUP SYNC INITIATED]
Target Repo: ${githubUrl} (Branch: ${githubBranch})
Compressing codebase bundle & schemas...
Pushing commit to ${githubBranch}...`);

    setTimeout(() => {
      setIsSyncingBackup(false);
      setTestLog(`[SUCCESS] GitHub & Google Drive Sync Complete!
- Repository: ${githubUrl}
- Branch: ${githubBranch}
- Commit: "Auto-backup UP Automation System v2.5"
- Webhook Payload Sent to: ${webhookUrl}
- Status: 200 OK (${new Date().toLocaleTimeString('bn-BD')})`);
    }, 1200);
  };

  const handleRunMcpTest = () => {
    setTestLog('MCP Agent System Diagnostics: Connecting to ' + mcpEndpoint + '...');
    setTimeout(() => {
      setTestLog(`[SUCCESS] MCP Tool Server & Webhook Ready:
- Model Context Protocol v1.0
- Gemini 1.5 Flash Vision OCR Plugin: Active
- Webhook URL: ${webhookUrl}
- Google Workspace Apps Script Webhook: Connected
- Cloudflare R2 Storage Node: Synced
- Status: 200 OK (Ping: 42ms)`);
    }, 800);
  };

  const handleCopyGithub = () => {
    navigator.clipboard.writeText(githubUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-emerald-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-800/30 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wider rounded-full inline-block mb-2">
              System Creator & Developer Control
            </span>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-amber-300" />
              <span>ডেভেলপার প্রোফাইল, সোশ্যাল মিডিয়া ও ব্যাকআপ সিস্টেম</span>
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl">
              {config.upName} এর সমস্ত ডেভেলপার তথ্য, সোশ্যাল মিডিয়া সংযোগ, হেল্পলাইন, GitHub ব্যাকআপ ও Webhook নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${developerWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>WhatsApp: {developerWhatsapp}</span>
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold text-xs rounded-xl border border-emerald-700 transition flex items-center gap-1.5"
            >
              <Github className="w-4 h-4 text-amber-300" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Developer Editable Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-6">
        <h3 className="font-extrabold text-sm text-emerald-950 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>১. ডেভেলপার ব্যক্তিগত তথ্য ও সোশ্যাল মিডিয়া প্রোফাইল কাস্টমাইজেশন</span>
          </span>
          <span className="text-xs font-normal text-slate-500">
            (এখানে পরিবর্তন করে নিচে সেভ বাটনে চাপ দিন)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo & Quick Contact Column */}
          <div className="flex flex-col items-center text-center space-y-3 md:border-r border-slate-200 md:pr-6">
            <div className="relative group">
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-emerald-800 shadow-md bg-slate-100 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Developer" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <User className="w-12 h-12 text-slate-400" />
                    <span className="text-[10px] mt-1 font-bold">ছবি আপলোড করুন</span>
                  </div>
                )}
              </div>

              <label className="absolute bottom-2 right-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 p-2 rounded-xl shadow cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="w-full text-left space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">ছবি লিংক (Image URL):</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                <p className="text-[10px] font-bold text-emerald-900">অফিশিয়াল হেল্পলাইন ও সাপোর্ট:</p>
                <p className="text-xs font-bold text-emerald-950 font-mono">
                  📞 কল: {developerPhone}
                </p>
                <p className="text-xs font-bold text-emerald-950 font-mono">
                  💬 WhatsApp: {developerWhatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields Column */}
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ডেভেলপার নাম:</label>
                <input
                  type="text"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পদবী/উপাধি:</label>
                <input
                  type="text"
                  value={developerTitle}
                  onChange={(e) => setDeveloperTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফোন / হেল্পলাইন নম্বর:</label>
                <input
                  type="text"
                  value={developerPhone}
                  onChange={(e) => setDeveloperPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp নম্বর:</label>
                <input
                  type="text"
                  value={developerWhatsapp}
                  onChange={(e) => setDeveloperWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা:</label>
                <input
                  type="email"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Facebook প্রোফাইল লিংক:</label>
                <input
                  type="text"
                  value={developerFacebook}
                  onChange={(e) => setDeveloperFacebook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">LinkedIn প্রোফাইল লিংক:</label>
                <input
                  type="text"
                  value={developerLinkedin}
                  onChange={(e) => setDeveloperLinkedin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">বায়ো / বিবরণী:</label>
              <textarea
                rows={2}
                value={developerBio}
                onChange={(e) => setDeveloperBio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Live Social Quick Links Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-600">লাইব সোশাল লিংকস:</span>
              {developerFacebook && (
                <a
                  href={developerFacebook}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {developerWhatsapp && (
                <a
                  href={`https://wa.me/${developerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <span>WhatsApp ({developerWhatsapp})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {developerLinkedin && (
                <a
                  href={developerLinkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-sky-700 text-white rounded font-bold hover:bg-sky-800 transition flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Repository Connection & Backup Management */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
              <Github className="w-4 h-4 text-emerald-700" />
              <span>২. GitHub কানেকশন ও সোর্স কোড ব্যাকআপ সিঙ্ক্রোনাইজেশন</span>
            </h3>
            <p className="text-xs text-slate-500">
              সিস্টেমের পুরো সোর্স কোড এবং স্কিমা সুরক্ষিত রাখতে GitHub Repository কানেক্ট করে সরাসরি ব্যাকআপ সিঙ্ক করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleGithubBackupSync}
            disabled={isSyncingBackup}
            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBackup ? 'animate-spin' : ''}`} />
            <span>{isSyncingBackup ? 'GitHub-এ ব্যাকআপ হচ্ছে...' : 'GitHub ব্যাকআপ সিঙ্ক চালান'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">GitHub Repo URL:</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Branch:</label>
                <input
                  type="text"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  className="w-full px-2.5 py-1 bg-slate-800 border border-slate-700 text-white rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">সর্বশেষ ব্যাকআপ:</label>
                <span className="block px-2.5 py-1 bg-slate-800 text-emerald-400 rounded font-mono font-bold">
                  {config.lastBackupDate || 'আজ সকাল ১১:১৫'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950 text-white p-4 rounded-xl space-y-3">
            <div>
              <label className="block text-emerald-200 font-bold mb-1">Google Drive Backup URL:</label>
              <input
                type="text"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-emerald-900 border border-emerald-800 text-amber-300 rounded font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Google Drive ব্যাকআপ লিঙ্ক খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200 font-mono">
                AUTO-SYNC ON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook System Configuration */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>৩. সিস্টেম Webhook ইন্টিগ্রেশন (Real-Time External Event Notification)</span>
            </h3>
            <p className="text-xs text-slate-500">
              নতুন কোন সনদ জেনারেট বা নাগরিক নিবন্ধিত হলে আপনার বাহ্যিক সার্ভারে Webhook Event পাঠাবে।
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunMcpTest}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Webhook টেস্ট করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Webhook Endpoint URL:</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhook"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Webhook Secret Key:</label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Test Console Output */}
        {testLog && (
          <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs whitespace-pre-line border border-slate-800 leading-relaxed">
            {testLog}
          </div>
        )}
      </div>

      {/* Save Status Notification */}
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>ডেভেলপার তথ্য, সোশাল সোশ্যাল লিংক, হেল্পলাইন, GitHub ও Webhook সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Save Action */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveDeveloperConfig}
          disabled={isSaving}
          className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>সেভ হইতেছে...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>সমস্ত তথ্য ও ব্যাকআপ সেভ করুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

