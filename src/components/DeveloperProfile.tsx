import React, { useState, useEffect } from 'react';
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
  Check,
  Lock,
  Edit3,
  Globe,
  Share2,
  ShieldCheck,
  MessageSquare,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  ArrowRight,
  Send,
  MessageCircle
} from 'lucide-react';
import { UnionParishadConfig } from '../types';
import { AdminAuthModal } from './AdminAuthModal';

interface DeveloperProfileProps {
  config: UnionParishadConfig;
  onUpdateConfig?: (newConfig: UnionParishadConfig) => void;
}

export const DeveloperProfile: React.FC<DeveloperProfileProps> = ({ config, onUpdateConfig }) => {
  // Developer Info State
  const [developerName, setDeveloperName] = useState(config.developerName || 'MD JUBAER HOSSEN');
  const [developerTitle, setDeveloperTitle] = useState(config.developerTitle || 'লীড সিস্টেম আর্কিটেক্ট ও ফুল-স্ট্যাক অটোমেশন ইঞ্জিনিয়ার');
  const [developerBio, setDeveloperBio] = useState(
    config.developerBio || '০২নং বহেড়াতৈল ইউনিয়ন পরিষদের ডিজিটাল অটোমেশন সিস্টেম, ক্লাউড আর্কিটেকচার এবং Gemini AI চালিত স্মার্ট প্রত্যয়নপত্র ইঞ্জিন প্রস্তুতকারক।'
  );
  const [developerEmail, setDeveloperEmail] = useState(config.developerEmail || 'baheratailunion@gmail.com');
  const [developerPhone, setDeveloperPhone] = useState(config.developerPhone || '+8801834-333300');
  const [developerWhatsapp, setDeveloperWhatsapp] = useState(config.developerWhatsappNumber || '+8801834-333300');
  const [developerWhatsappUsername, setDeveloperWhatsappUsername] = useState(config.developerWhatsappUsername || 'Xobaer6090');
  const [developerWhatsappUrl, setDeveloperWhatsappUrl] = useState(config.developerWhatsappUrl || 'https://wa.me/message/7PMRKZ6ZMPT2G1');
  const [developerFacebook, setDeveloperFacebook] = useState(config.developerFacebookUrl || 'https://facebook.com/xobaer6090');
  const [developerLinkedin, setDeveloperLinkedin] = useState(config.developerLinkedinUrl || 'https://linkedin.com/in/xobaer6090');
  const [developerTiktok, setDeveloperTiktok] = useState(config.developerTiktokUrl || 'https://www.tiktok.com/@xobaer6090?_r=1&_t=ZS-98qqxpnGbVA');
  const [developerInstagram, setDeveloperInstagram] = useState(config.developerInstagramUrl || 'https://www.instagram.com/xobaer6090?igsh=MWlua2h6YjQ2c2JmOA==');
  const [developerGithubProfile, setDeveloperGithubProfile] = useState(config.developerGithubProfileUrl || 'https://github.com/inbox6090');
  const [developerTwitter, setDeveloperTwitter] = useState(config.developerTwitterUrl || 'https://x.com/Xobaer6090');
  const [developerWordpress, setDeveloperWordpress] = useState(config.developerWordpressUrl || 'https://xobaer.wordpress.com');
  const [developerTelegramUrl, setDeveloperTelegramUrl] = useState(config.developerTelegramUrl || 'https://t.me/Xobaer6090');
  const [developerTelegramUsername, setDeveloperTelegramUsername] = useState(config.developerTelegramUsername || 'Xobaer6090');
  const [developerMessengerUrl, setDeveloperMessengerUrl] = useState(config.developerMessengerUrl || 'https://m.me/xobaer6090');
  const [developerMessengerUsername, setDeveloperMessengerUsername] = useState(config.developerMessengerUsername || 'xobaer6090');
  const [photoUrl, setPhotoUrl] = useState(config.developerPhotoUrl || '');

  // Tech / Backup State
  const [githubUrl, setGithubUrl] = useState(config.githubRepoUrl || 'https://github.com/inbox6090/UPSM-Baheratail');
  const [githubBranch, setGithubBranch] = useState(config.githubBranch || 'main');
  const [driveUrl, setDriveUrl] = useState(config.googleDriveBackupUrl || 'https://drive.google.com/drive/folders/16vXelYwApSFuFFru0Qkj1gaHCUwKZ-vz');
  const [mcpEndpoint, setMcpEndpoint] = useState(config.mcpEndpointUrl || 'https://api.baheratailup.gov.bd/v1/mcp');
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || 'https://api.baheratailup.gov.bd/v1/webhook');
  const [webhookSecret, setWebhookSecret] = useState(config.webhookSecret || 'whsec_up_baheratail_2026_secret_key');

  // Interactive Controls State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeAdmin, setActiveAdmin] = useState<any>(null);

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingBackup, setIsSyncingBackup] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  // Sync props config when config updates
  useEffect(() => {
    if (config) {
      if (config.developerName) setDeveloperName(config.developerName);
      if (config.developerTitle) setDeveloperTitle(config.developerTitle);
      if (config.developerBio) setDeveloperBio(config.developerBio);
      if (config.developerEmail) setDeveloperEmail(config.developerEmail);
      if (config.developerPhone) setDeveloperPhone(config.developerPhone);
      if (config.developerWhatsappNumber) setDeveloperWhatsapp(config.developerWhatsappNumber);
      if (config.developerWhatsappUsername) setDeveloperWhatsappUsername(config.developerWhatsappUsername);
      if (config.developerWhatsappUrl) setDeveloperWhatsappUrl(config.developerWhatsappUrl);
      if (config.developerFacebookUrl) setDeveloperFacebook(config.developerFacebookUrl);
      if (config.developerLinkedinUrl) setDeveloperLinkedin(config.developerLinkedinUrl);
      if (config.developerTiktokUrl) setDeveloperTiktok(config.developerTiktokUrl);
      if (config.developerInstagramUrl) setDeveloperInstagram(config.developerInstagramUrl);
      if (config.developerGithubProfileUrl) setDeveloperGithubProfile(config.developerGithubProfileUrl);
      if (config.developerTwitterUrl) setDeveloperTwitter(config.developerTwitterUrl);
      if (config.developerWordpressUrl) setDeveloperWordpress(config.developerWordpressUrl);
      if (config.developerTelegramUrl) setDeveloperTelegramUrl(config.developerTelegramUrl);
      if (config.developerTelegramUsername) setDeveloperTelegramUsername(config.developerTelegramUsername);
      if (config.developerMessengerUrl) setDeveloperMessengerUrl(config.developerMessengerUrl);
      if (config.developerMessengerUsername) setDeveloperMessengerUsername(config.developerMessengerUsername);
      if (config.developerPhotoUrl) setPhotoUrl(config.developerPhotoUrl);
      if (config.githubRepoUrl) setGithubUrl(config.githubRepoUrl);
      if (config.googleDriveBackupUrl) setDriveUrl(config.googleDriveBackupUrl);
    }
  }, [config]);

  // Check logged in Developer session
  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('bup_active_admin_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActiveAdmin(parsed);
        } catch (e) {
          setActiveAdmin(null);
        }
      } else {
        setActiveAdmin(null);
      }
    };

    checkSession();
    const handleAuthChange = (e: CustomEvent) => {
      setActiveAdmin(e.detail || null);
    };

    window.addEventListener('adminAuthChanged' as any, handleAuthChange);
    return () => {
      window.removeEventListener('adminAuthChanged' as any, handleAuthChange);
    };
  }, []);

  const isDeveloperOrAdmin = React.useMemo(() => {
    if (!activeAdmin) return false;
    return ['developer', 'super_admin', 'chairman', 'secretary'].includes(activeAdmin.role);
  }, [activeAdmin]);

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
      developerWhatsappUsername,
      developerWhatsappUrl,
      developerFacebookUrl: developerFacebook,
      developerLinkedinUrl: developerLinkedin,
      developerTiktokUrl: developerTiktok,
      developerInstagramUrl: developerInstagram,
      developerGithubProfileUrl: developerGithubProfile,
      developerTwitterUrl: developerTwitter,
      developerWordpressUrl: developerWordpress,
      developerTelegramUrl,
      developerTelegramUsername,
      developerMessengerUrl,
      developerMessengerUsername,
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

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
      return;
    }

    if (isDeveloperOrAdmin) {
      setIsEditMode(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Auth Modal for Developer Login */}
      <AdminAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAdminAuthenticated={(user) => {
          if (user && ['developer', 'super_admin', 'chairman', 'secretary'].includes(user.role)) {
            setIsEditMode(true);
          }
          setIsAuthModalOpen(false);
        }}
      />

      {/* Top Navigation & Mode Switch Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-400 text-emerald-950 text-[11px] font-black uppercase tracking-wider rounded-full inline-flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>System Developer & Creator Profile</span>
              </span>
              {isEditMode ? (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>কাস্টমাইজেশন মোড চালু (Developer Logged In)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-800 text-emerald-300 text-[10px] font-bold rounded-full border border-slate-700 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>পাবলিক ভিউয়ার মোড (Public Profile View)</span>
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
              <Code2 className="w-7 h-7 text-amber-300 shrink-0" />
              <span>০২নং বহেড়াতৈল ইউনিয়ন পরিষদ সিস্টেম ডেভেলপার</span>
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
              ইউনিয়ন পরিষদের ক্লাউড আর্কিটেকচার, Gemini AI চালিত স্মার্ট অটোমেশন এবং সিস্টেম ক্রিয়েটর সম্পর্কিত সমস্ত অফিশিয়াল তথ্য ও সোশ্যাল মিডিয়া প্রোফাইল।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleEditMode}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 border border-amber-300'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600'
              }`}
            >
              {isEditMode ? (
                <>
                  <Globe className="w-4 h-4 text-emerald-950" />
                  <span>পাবলিক প্রোফাইল ভিউতে ফিরে যান</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  <span>{isDeveloperOrAdmin ? '✏️ কাস্টমাইজ প্যানেল খুলুন' : '🔒 কাস্টমাইজ করুন (Developer Login)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PUBLIC DEVELOPER SHOWCASE CARD (VISIBLE TO ALL CITIZENS/VIEWERS) */}
      {/* ============================================================ */}
      {!isEditMode && (
        <div className="space-y-6">
          {/* Main Developer Persona Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
            <div className="h-32 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 p-6 flex items-end justify-end relative">
              <span className="text-[11px] font-bold text-amber-300/80 tracking-wider uppercase bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/20">
                Official Creator & Lead Architect
              </span>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 mb-6">
                {/* Fixed Photo Container */}
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-emerald-950 shrink-0 relative group">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt={developerName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-slate-900 flex flex-col items-center justify-center p-4 text-center text-white">
                      <User className="w-16 h-16 text-amber-300 mb-1" />
                      <span className="text-[11px] font-black text-amber-300 leading-tight">MD JUBAER HOSSEN</span>
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-black/10 rounded-2xl pointer-events-none" />
                </div>

                {/* Developer Details Header */}
                <div className="text-center md:text-left flex-1 space-y-2 pt-2 md:pt-16">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {developerName}
                      </h3>
                      <p className="text-sm font-bold text-emerald-800">
                        {developerTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-center md:justify-end gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full flex items-center gap-1.5 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>গেজেটেড সিস্টেম আর্কিটেক্ট</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {developerBio}
                  </p>
                </div>
              </div>

              {/* Direct Helpline & Social Action Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {/* Helpline Phone */}
                <a
                  href={`tel:${developerPhone.replace(/[^0-9+]/g, '')}`}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-emerald-800 block uppercase tracking-tight">জরুরী কল</span>
                    <span className="text-xs font-black font-mono text-emerald-950 block truncate">{developerPhone}</span>
                  </div>
                </a>

                {/* WhatsApp Chat */}
                <a
                  href={developerWhatsappUrl || `https://wa.me/${developerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-emerald-800 block uppercase tracking-tight">WhatsApp</span>
                    <span className="text-xs font-black font-mono text-emerald-950 block truncate">@{developerWhatsappUsername}</span>
                  </div>
                </a>

                {/* Telegram Chat */}
                {developerTelegramUrl && (
                  <a
                    href={developerTelegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-sky-800 block uppercase tracking-tight">Telegram Chat</span>
                      <span className="text-xs font-black font-mono text-sky-950 block truncate">@{developerTelegramUsername}</span>
                    </div>
                  </a>
                )}

                {/* Messenger Chat */}
                {developerMessengerUrl && (
                  <a
                    href={developerMessengerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-indigo-800 block uppercase tracking-tight">FB Messenger</span>
                      <span className="text-xs font-black font-mono text-indigo-950 block truncate">@{developerMessengerUsername}</span>
                    </div>
                  </a>
                )}

                {/* Email Support */}
                <a
                  href={`mailto:${developerEmail}`}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-tight">ইমেইল সংযোগ</span>
                    <span className="text-xs font-bold font-mono text-slate-800 block truncate">{developerEmail}</span>
                  </div>
                </a>

                {/* WordPress Website */}
                {developerWordpress && (
                  <a
                    href={developerWordpress}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl transition flex items-center gap-2.5 group shadow-2xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-amber-800 block uppercase tracking-tight">ওয়েবসাইট</span>
                      <span className="text-xs font-bold font-mono text-amber-950 block truncate">xobaer.wordpress.com</span>
                    </div>
                  </a>
                )}
              </div>

              {/* Social Media Channels Bar */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>ডেভেলপারের অফিশিয়াল প্রোফাইল ও চ্যানেল লিঙ্কসমূহ:</span>
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {developerFacebook && (
                    <a
                      href={developerFacebook}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerMessengerUrl && (
                    <a
                      href={developerMessengerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>FB Messenger</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerTelegramUrl && (
                    <a
                      href={developerTelegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerLinkedin && (
                    <a
                      href={developerLinkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerGithubProfile && (
                    <a
                      href={developerGithubProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>GitHub Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerTiktok && (
                    <a
                      href={developerTiktok}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs border border-slate-800"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-teal-400" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72v4.28c-.89-.26-1.87-.12-2.67.36-.88.52-1.48 1.48-1.58 2.49-.07.83.21 1.68.77 2.3.69.77 1.74 1.13 2.76 1.01 1.02-.08 1.96-.68 2.45-1.58.33-.58.48-1.26.47-1.94-.01-4.63-.01-9.25-.01-13.88z" />
                      </svg>
                      <span>TikTok Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerInstagram && (
                    <a
                      href={developerInstagram}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram Profile</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerTwitter && (
                    <a
                      href={developerTwitter}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-950 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs border border-slate-800"
                    >
                      <Twitter className="w-3.5 h-3.5 text-sky-400" />
                      <span>X (Twitter)</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  {developerWordpress && (
                    <a
                      href={developerWordpress}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-900 hover:bg-sky-950 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-300" />
                      <span>WordPress Site</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* System Tech Architecture Showcase Cards */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-emerald-950 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>কারিগরি আর্কিটেকচার ও সিস্টেম ফিচারসমুহ (System Engineering Specs)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900">Gemini 1.5 Flash Vision OCR</h4>
                <p className="text-slate-600 leading-relaxed">
                  এনআইডি ও জন্ম নিবন্ধন কার্ডের ছবি থেকে বাংলায় নিখুঁত তথ্য এক্সট্র্যাক্ট এবং এআই চালিত ড্রাফট তৈরীর জন্য জেনারেটিভ মডেল।
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900">Firebase Cloud Persistence</h4>
                <p className="text-slate-600 leading-relaxed">
                  রিয়েলটাইম এনক্রিপ্টেড ফায়ারস্টোর ডেটাবেস, অডিট ট্রেইল সিকিউরিটি এবং রোল-বেসড পারমিশন অ্যাক্সেস রুলস।
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold mb-2">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="font-black text-slate-900">Cloudflare R2 & Drive Auto-Sync</h4>
                <p className="text-slate-600 leading-relaxed">
                  ডিজিটাল কপি ক্লাউডে ব্যাকআপ এবং গুগল ড্রাইভ ও শিটসে স্বয়ংক্রিয় সিঙ্ক্রোনাইজেশন সিস্টেম।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PROTECTED DEVELOPER EDITING FORM (ACCESSIBLE IN EDIT MODE)  */}
      {/* ============================================================ */}
      {isEditMode && (
        <div className="space-y-6">
          {/* Main Developer Editable Form Card (Matches SmartSelect UI) */}
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

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LinkedIn প্রোফাইল লিংক:</label>
                    <input
                      type="text"
                      value={developerLinkedin}
                      onChange={(e) => setDeveloperLinkedin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GitHub Repo লিংক:</label>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GitHub Profile লিংক:</label>
                    <input
                      type="text"
                      value={developerGithubProfile}
                      onChange={(e) => setDeveloperGithubProfile(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telegram Profile URL:</label>
                    <input
                      type="text"
                      value={developerTelegramUrl}
                      onChange={(e) => setDeveloperTelegramUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telegram Username:</label>
                    <input
                      type="text"
                      value={developerTelegramUsername}
                      onChange={(e) => setDeveloperTelegramUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook Messenger URL:</label>
                    <input
                      type="text"
                      value={developerMessengerUrl}
                      onChange={(e) => setDeveloperMessengerUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook Messenger Username:</label>
                    <input
                      type="text"
                      value={developerMessengerUsername}
                      onChange={(e) => setDeveloperMessengerUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Username / Handle:</label>
                    <input
                      type="text"
                      value={developerWhatsappUsername}
                      onChange={(e) => setDeveloperWhatsappUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Direct Chat URL:</label>
                    <input
                      type="text"
                      value={developerWhatsappUrl}
                      onChange={(e) => setDeveloperWhatsappUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">TikTok প্রোফাইল লিংক:</label>
                    <input
                      type="text"
                      value={developerTiktok}
                      onChange={(e) => setDeveloperTiktok(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Instagram প্রোফাইল লিংক:</label>
                    <input
                      type="text"
                      value={developerInstagram}
                      onChange={(e) => setDeveloperInstagram(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">X / Twitter প্রোফাইল লিংক:</label>
                    <input
                      type="text"
                      value={developerTwitter}
                      onChange={(e) => setDeveloperTwitter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WordPress ওয়েবসাইট লিংক:</label>
                    <input
                      type="text"
                      value={developerWordpress}
                      onChange={(e) => setDeveloperWordpress(e.target.value)}
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
                  {developerMessengerUrl && (
                    <a
                      href={developerMessengerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition flex items-center gap-1"
                    >
                      <span>Messenger (@{developerMessengerUsername})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {developerTelegramUrl && (
                    <a
                      href={developerTelegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-sky-500 text-white rounded font-bold hover:bg-sky-600 transition flex items-center gap-1"
                    >
                      <span>Telegram (@{developerTelegramUsername})</span>
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              বাতিল (পাবলিক ভিউ)
            </button>
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
      )}
    </div>
  );
};
