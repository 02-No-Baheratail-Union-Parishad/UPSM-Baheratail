import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Download, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Share2, 
  ArrowLeft,
  Sliders,
  Maximize2,
  QrCode,
  ShieldCheck,
  CreditCard,
  Check,
  Send,
  Copy,
  MessageSquare,
  Phone,
  X
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';
import { formatBanglaDate, convertEnglishDateToBanglaFormatted, generateSecurityChecksum, toBengaliNumeral } from '../lib/utils';

interface CertificateViewProps {
  certificate: CertificateRecord;
  config: UnionParishadConfig;
  onBack?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ certificate, config, onBack }) => {
  const [showHeaderInPrint, setShowHeaderInPrint] = useState(config.enableHeaderInPrint !== false);
  const [fontSize, setFontSize] = useState<number>(config.bodyFontSize || 16);
  const [headerStyle, setHeaderStyle] = useState<'tri-column' | 'classic' | 'centered'>(config.templateHeaderStyle || 'tri-column');
  const [borderStyle, setBorderStyle] = useState<'double-green-red' | 'double-green' | 'single-green' | 'none'>(config.borderStyle || 'double-green-red');
  const [blankSealSize, setBlankSealSize] = useState<number>(config.blankSealSize ?? 96);
  const [dateFormatStyle, setDateFormatStyle] = useState<'numeric' | 'full' | 'long' | 'banglaSan' | 'both'>('full');
  const [showDigitalSig, setShowDigitalSig] = useState<boolean>(config.enableDigitalSignature !== false);
  const [showSecretarySig, setShowSecretarySig] = useState<boolean>(config.showSecretarySignature !== false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editableBodyText, setEditableBodyText] = useState(certificate.bodyText);

  // A4 Print Optimization & Compact Mode State
  const [isCompactMode, setIsCompactMode] = useState<boolean>(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printScale, setPrintScale] = useState<number>(100);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);

  // WhatsApp Messaging State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(certificate.citizen?.mobile || '');
  const [customNote, setCustomNote] = useState('আপনার কাঙ্ক্ষিত সনদপত্রটি ইউনিয়ন পরিষদ থেকে সফলভাবে অনুমোদন করা হয়েছে।');
  const [copiedText, setCopiedText] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  const triggerActualPrint = () => {
    if (pageOrientation === 'landscape') {
      document.body.classList.add('print-landscape-mode');
      document.body.classList.remove('print-portrait-mode');
    } else {
      document.body.classList.add('print-portrait-mode');
      document.body.classList.remove('print-landscape-mode');
    }
    window.print();
  };

  const c = certificate.citizen;
  const extraTables = certificate.extra?.tables || {};

  // Build real verification URL for QR code
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://baheratailup.gov.bd';
  const realVerifyUrl = `${origin}/verify/${certificate.memoNo}`;
  const qrImageUrl = certificate.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(realVerifyUrl)}`;

  // Convert Bangla digits to English
  const convertBanglaToEnglishDigits = (str: string) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[০-৯]/g, (w) => banglaDigits.indexOf(w).toString());
  };

  // Format phone number for WhatsApp Web API (BD format: 8801XXXXXXXXX)
  const formatBdPhoneNumber = (rawPhone: string) => {
    const cleanDigits = convertBanglaToEnglishDigits(rawPhone).replace(/\D/g, '');
    if (!cleanDigits) return '';
    if (cleanDigits.startsWith('880')) return cleanDigits;
    if (cleanDigits.startsWith('0')) return `880${cleanDigits.substring(1)}`;
    if (cleanDigits.length === 10 && cleanDigits.startsWith('1')) return `880${cleanDigits}`;
    return cleanDigits;
  };

  const formattedPhone = formatBdPhoneNumber(whatsappPhone);

  // Build formatted WhatsApp Message text
  const buildWhatsAppMessage = () => {
    const citizenName = c?.name || 'নাগরিক';
    const certType = certificate.typeLabel || certificate.category || 'প্রত্যয়নপত্র';
    const upName = config.upName || '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ';
    const location = `${config.upazila || 'সখিপুর'}, ${config.district || 'টাঙ্গাইল'}`;

    let msg = `সম্মানিত ${citizenName},\n`;
    msg += `${upName} কর্তৃক আপনার "${certType}" সফলভাবে প্রস্তুত ও ডিজিটাল সার্ভারে সংরক্ষিত হয়েছে।\n\n`;
    msg += `📋 সনদের বিবরণ:\n`;
    msg += `• স্মারক নং: ${certificate.memoNo}\n`;
    msg += `• ইস্যুর তারিখ: ${certificate.issueDate}\n`;
    msg += `• আবেদনকারী: ${citizenName}\n`;
    if (c?.father) msg += `• পিতা/স্বামী: ${c.father}\n`;
    if (c?.village) msg += `• গ্রাম/ওয়ার্ড: ${c.village}${c.wardNo ? ` (ওয়ার্ড নং ${c.wardNo})` : ''}\n`;
    msg += `\n🔗 অনলাইন যাচাই ও পিডিএফ ডাউনলোড লিঙ্ক:\n${realVerifyUrl}\n`;
    
    if (customNote.trim()) {
      msg += `\n💬 বার্তার বিশেষ টিপ্পনী:\n${customNote.trim()}\n`;
    }

    msg += `\nধন্যবাদান্তে,\n${upName}\n${location}`;
    return msg;
  };

  const handleSendWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const phone = formattedPhone;
    const waUrl = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    const message = buildWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action & Customizer Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ফিরে যান</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>স্মারক নং: {certificate.memoNo}</span>
          </div>

          {certificate.feeAmount && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              <span>ফি: ৳{certificate.feeAmount} ({certificate.paymentMethod || 'ক্যাশ'})</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Direct Send Button */}
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            title="নাগরিকের হোয়াটসঅ্যাপে সনদের ডাউনলোড লিংক ও সারসংক্ষেপ পাঠান"
          >
            <Send className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>হোয়াটসঅ্যাপে পাঠান</span>
          </button>

          {/* Compact Mode Toggle for 1-Page Guarantee */}
          <button
            onClick={() => setIsCompactMode(!isCompactMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isCompactMode
                ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="A4 ১ পাতায় সম্পূর্ণ সনদ ফিট নিশ্চিত করার জন্য কমপ্যাক্ট মোড"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-950" />
            <span>{isCompactMode ? '📄 ১ পাতায় ফিট (Compact ON)' : '📄 সাধারণ সাইজ'}</span>
          </button>

          {/* Edit AI Text Toggle */}
          <button
            onClick={() => setIsEditingText(!isEditingText)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isEditingText
                ? 'bg-amber-400 text-slate-950 border-amber-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="AI এর ভুল সংশোধন বা সনদের বিবরণী সরাসরি এডিট করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEditingText ? 'এডিটর বন্ধ করুন' : 'সনদের টেক্সট এডিট / সংশোধন'}</span>
          </button>

          {/* Live Customizer Toggle */}
          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>লাইভ টেমপ্লেট কাস্টমাইজার</span>
          </button>

          {/* Header Toggle */}
          <button
            onClick={() => setShowHeaderInPrint(!showHeaderInPrint)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              showHeaderInPrint
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title="সরকারি প্যাডে প্রিন্ট করার জন্য হেডার অন/অফ করুন"
          >
            {showHeaderInPrint ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showHeaderInPrint ? 'ডিজিটাল হেডার অন' : 'হেডার লুকানো (প্যাড)'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট করুন</span>
          </button>

          {/* Google Doc Link */}
          <a
            href={`https://docs.google.com/document/d/${config.templateDocId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Doc টেমপ্লেট</span>
          </a>
        </div>
      </div>

      {/* Live Customizer Panel */}
      {showCustomizer && (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>সনদের টেমপ্লেট, A4 সাইজ ও লেআউট কাস্টমাইজার</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsCompactMode(true);
                  setFontSize(15);
                  setBlankSealSize(72);
                  setPrintScale(95);
                }}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded transition cursor-pointer"
              >
                ⚡ ১-পাতা অটো-ফিট সেট করুন
              </button>
              <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-mono">
                REAL-TIME PREVIEW
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Header Style */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">হেডার লেআউট:</label>
              <select
                value={headerStyle}
                onChange={(e) => setHeaderStyle(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded focus:border-amber-400 font-semibold"
              >
                <option value="tri-column">১. ত্রিমুখী ৩-কলাম হেডার (ছবি অনুযায়ী)</option>
                <option value="centered">২. সেন্টার্ড লোগো ও টাইটেল</option>
                <option value="classic">৩. ক্লাসিকাল সরকারি প্যাড</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">ফন্ট সাইজ (পিটি): {fontSize}px</label>
              <input
                type="range"
                min={12}
                max={20}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Page Orientation Selector */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">সনদের ওরিয়েন্টেশন (Page Orientation):</label>
              <select
                value={pageOrientation}
                onChange={(e) => setPageOrientation(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded focus:border-amber-400 font-bold"
              >
                <option value="portrait">📱 পোর্ট্রেট - Portrait (খাড়া A4 - সেরা)</option>
                <option value="landscape">🖥️ ল্যান্ডস্কেপ - Landscape (আড়াআড়ি ওয়াইড)</option>
              </select>
            </div>
            {/* Date Format Style */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">তারিখ ফরম্যাট (Bangla Date):</label>
              <select
                value={dateFormatStyle}
                onChange={(e) => setDateFormatStyle(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded focus:border-amber-400 font-semibold"
              >
                <option value="full">১. পূর্ণাঙ্গ বাংলা (০৫ আগস্ট, ২০২৬ খ্রি.)</option>
                <option value="numeric">২. নিউমেরিক সংখ্যা (০৫/০৮/২০২৬ খ্রি.)</option>
                <option value="long">৩. বিস্তারিত অর্ডিনাল (৫ই আগস্ট, ২০২৬ খ্রিস্টাব্দ)</option>
                <option value="banglaSan">৪. স্থানীয় বাংলা সন (২০ শ্রাবণ, ১৪৩৩ বঙ্গাব্দ)</option>
                <option value="both">৫. যৌথ উভয় তারিখ (ইংরেজি + বঙ্গাব্দ)</option>
              </select>
            </div>

            {/* Print Scale Selection */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">প্রিন্ট স্কেল (%) (A4 ফিটিং):</label>
              <select
                value={printScale}
                onChange={(e) => setPrintScale(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded focus:border-amber-400 font-bold"
              >
                <option value={100}>১০০% (স্বাভাবিক সাইজ)</option>
                <option value={95}>৯৫% (A4 ১ পাতায় উপযুক্ত)</option>
                <option value={90}>৯০% (কমপ্যাক্ট ফিট)</option>
                <option value={85}>৮৫% (দীর্ঘ আবেদনের জন্য)</option>
                <option value={80}>৮০% (অতিরিক্ত বড় টেবিলের জন্য)</option>
              </select>
            </div>

            {/* Signature & Compact Mode Display Toggles */}
            <div className="pt-2 border-t border-slate-800 col-span-full flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="text-amber-300 font-bold cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isCompactMode}
                  onChange={(e) => setIsCompactMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
                <span>📄 A4 ১-পাতা কমপ্যাক্ট মোড (Compact Mode Active)</span>
              </label>

              <label className="text-slate-300 font-semibold cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDigitalSig}
                  onChange={(e) => setShowDigitalSig(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
                <span>ই-স্বাক্ষর (Digital Signature) দেখান</span>
              </label>

              <label className="text-slate-300 font-semibold cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSecretarySig}
                  onChange={(e) => setShowSecretarySig(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
                <span>সচিবের স্বাক্ষর দেখান</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Print Paper Canvas */}
      <div 
        ref={printRef} 
        id="certificate-print-area"
        className={`print-paper bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-300 mx-auto relative overflow-hidden text-slate-900 print:shadow-none print:p-2 print:border-none print:m-0 print:w-full print:max-w-none print:rounded-none ${
          pageOrientation === 'landscape' ? 'is-landscape max-w-5xl' : 'is-portrait max-w-4xl'
        } ${
          isCompactMode ? 'is-compact-mode' : ''
        }`}
        style={{ 
          minHeight: pageOrientation === 'landscape' ? (isCompactMode ? '600px' : '720px') : (isCompactMode ? '820px' : '960px'),
          transform: printScale !== 100 ? `scale(${printScale / 100})` : undefined,
          transformOrigin: 'top center'
        }}
      >
        {/* Background Watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: config.watermarkOpacity || 0.08 }}
        >
          <img 
            src={config.logoUrl} 
            alt="Watermark Seal" 
            className="w-80 h-80 md:w-96 md:h-96 object-contain"
          />
        </div>

        {/* Outer Frame Border matching chosen borderStyle */}
        <div 
          className={`cert-inner-frame p-5 md:p-7 h-full flex flex-col justify-between relative z-10 ${
            pageOrientation === 'landscape' ? 'min-h-[540px]' : 'min-h-[800px]'
          } print:min-h-full print:h-full flex-1 ${
            borderStyle === 'double-green-red'
              ? 'border-4 border-emerald-950 outline-2 outline-red-700 outline-offset-2'
              : borderStyle === 'double-green'
              ? 'border-4 border-double border-emerald-900'
              : borderStyle === 'single-green'
              ? 'border-2 border-emerald-800'
              : ''
          }`}
        >
          
          {/* Header Section */}
          <div>
            {showHeaderInPrint && (
              <header className="cert-header pb-2 border-b-2 border-emerald-900">
                {/* Header Style 1: Tri-Column (User Requested Layout) */}
                {headerStyle === 'tri-column' && (
                  <div className="flex justify-between items-start w-full gap-2 my-1">
                    {/* Left Column (Width: ~32%): Chairman Information (5 Lines, pushed slightly down) */}
                    <div className="w-[32%] min-w-0 text-left space-y-0.5 break-words pt-2.5">
                      <p className="text-xs md:text-sm font-extrabold text-slate-950 leading-snug">{config.chairmanName}</p>
                      <p className="text-[11px] md:text-xs font-bold text-emerald-900 leading-snug">{config.chairmanTitle}</p>
                      <p className="text-[10px] md:text-[11px] text-slate-800 font-semibold leading-snug">
                        {config.upName ? config.upName.replace(/পরিষদ/g, '').trim() : '০২নং বহেড়াতৈল ইউনিয়ন'}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-slate-600 font-medium leading-snug">{config.upazila}, {config.district}।</p>
                      <p className="text-[10px] md:text-[11px] text-slate-700 font-medium leading-snug">মোবাইল: {config.chairmanPhone}</p>
                    </div>

                    {/* Middle Column (Width: ~36%, text-align: center): Govt Title, UP Heading, Logo, Location */}
                    <div className="w-[36%] min-w-0 text-center flex flex-col items-center justify-center break-words px-1">
                      <p className="text-center text-xs md:text-sm font-extrabold text-emerald-950 tracking-wide mb-0.5 leading-snug whitespace-nowrap">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                      </p>
                      <h2 className="text-base md:text-xl font-black text-emerald-950 leading-tight whitespace-nowrap">
                        {config.upName}
                      </h2>
                      <img 
                        src={config.logoUrl} 
                        alt="Government / UP Logo" 
                        className="cert-logo w-12 h-12 md:w-14 md:h-14 object-contain my-1 mx-auto"
                      />
                      <p className="text-[11px] md:text-xs font-bold text-emerald-900 leading-tight whitespace-nowrap">
                        {config.upazila}, {config.district}।
                      </p>
                    </div>

                    {/* Right Column (Width: ~32%): Chairman Details (5 Lines, pushed slightly down) */}
                    <div className="w-[32%] min-w-0 text-right space-y-0.5 break-words pt-2.5">
                      <p className="text-xs md:text-sm font-extrabold text-slate-950 leading-snug">{config.chairmanName}</p>
                      <p className="text-[11px] md:text-xs font-bold text-emerald-900 leading-snug">{config.chairmanTitle}</p>
                      <p className="text-[10px] md:text-[11px] text-slate-800 font-semibold leading-snug">
                        {config.upName ? config.upName.replace(/পরিষদ/g, '').trim() : '০২নং বহেড়াতৈল ইউনিয়ন'}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-slate-600 font-medium leading-snug">{config.upazila}, {config.district}।</p>
                      <p className="text-[10px] md:text-[11px] text-slate-700 font-medium leading-snug">মোবাইল: {config.chairmanPhone}</p>
                    </div>
                  </div>
                )}

                {/* Header Style 2: Centered */}
                {headerStyle === 'centered' && (
                  <div className="text-center flex flex-col items-center justify-center my-2">
                    <p className="text-xs md:text-sm font-extrabold text-emerald-950 tracking-wide mb-0.5">
                      গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                    </p>
                    <h2 className="text-xl md:text-2xl font-black text-emerald-950 leading-tight">
                      {config.upName}
                    </h2>
                    <img src={config.logoUrl} alt="Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain my-1" />
                    <p className="text-xs font-bold text-emerald-900">{config.address}</p>
                  </div>
                )}

                {/* Header Style 3: Classic */}
                {headerStyle === 'classic' && (
                  <div className="flex items-center justify-between my-2">
                    <div className="text-left text-xs space-y-0.5">
                      <p className="font-extrabold text-slate-950">{config.chairmanName}</p>
                      <p className="text-emerald-800 font-bold">{config.chairmanTitle}</p>
                      <p className="text-slate-700 font-semibold">{config.upName}</p>
                      <p className="text-slate-600">{config.upazila}, {config.district}</p>
                    </div>
                    <div className="text-center flex flex-col items-center">
                      <p className="text-xs font-extrabold text-emerald-950">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                      <h2 className="text-lg md:text-xl font-black text-emerald-950">{config.upName}</h2>
                      <img src={config.logoUrl} alt="Logo" className="w-12 h-12 object-contain my-1" />
                      <p className="text-[11px] font-bold text-emerald-900">{config.address}</p>
                    </div>
                    <div className="text-right text-xs space-y-0.5">
                      <p className="font-extrabold text-slate-950">{config.chairmanName}</p>
                      <p className="text-emerald-800 font-bold">{config.chairmanTitle}</p>
                      <p className="text-slate-700 font-semibold">{config.upName}</p>
                      <p className="text-slate-600">{config.upazila}, {config.district}</p>
                    </div>
                  </div>
                )}

                <div className="h-0.5 bg-emerald-900 w-full my-1" />
              </header>
            )}

            {/* Metadata Bar: Memo No & Date */}
            <div className="flex justify-between items-center my-4 font-bold text-xs text-slate-900 border-b border-slate-300 pb-2">
              <div>
                <span>স্মারক নং: </span>
                <span className="text-emerald-900 font-mono text-sm">{certificate.memoNo}</span>
              </div>
              <div>
                <span>তারিখ: </span>
                <span className="text-emerald-900 font-bold">
                  {formatBanglaDate(certificate.issueDateEn || certificate.issueDate, dateFormatStyle)}
                </span>
              </div>
            </div>

            {/* Certificate Title Badge */}
            <div className="cert-title-badge text-center my-5 print:my-2">
              <span className="inline-block bg-emerald-950 text-white font-extrabold text-lg md:text-xl px-8 py-1.5 rounded-md shadow-sm border border-emerald-900 tracking-wider">
                {certificate.typeLabel}
              </span>
            </div>

            {/* Main Bureaucratic Body Text with Dynamic Font Size & AI Correction Mode */}
            {isEditingText ? (
              <div className="my-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-2 print:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>এআই জেনারেটেড সনদের বিবরণী সরাসরি এডিট / সংশোধন করুন:</span>
                  </span>
                  <button
                    onClick={() => setIsEditingText(false)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition cursor-pointer"
                  >
                    সেভ ও সম্পন্ন
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={editableBodyText}
                  onChange={(e) => setEditableBodyText(e.target.value)}
                  className="w-full p-3 bg-white border border-amber-300 rounded-lg text-sm text-slate-900 leading-relaxed focus:border-amber-600 focus:outline-none"
                  style={{ fontSize: `${fontSize}px` }}
                />
              </div>
            ) : (
              <div 
                className="cert-body-text my-5 print:my-2 text-justify leading-relaxed font-medium text-slate-900 whitespace-pre-line px-2 indent-8"
                style={{ fontSize: `${fontSize}px` }}
              >
                {editableBodyText}
              </div>
            )}

            {/* Dynamic Tables (Warish / Family List / Additional Statement) */}
            {Object.keys(extraTables).length > 0 && (
              <div className="my-4 space-y-3">
                {Object.entries(extraTables).map(([tableKey, rows]) => (
                  <div key={tableKey} className="space-y-1.5">
                    <p className="font-bold text-xs text-black border-b-2 border-black pb-1">
                      অতিরিক্ত সংযুক্ত বিবরণী (উত্তরাধিকার / পরিবার সদস্য তালিকা):
                    </p>
                    <table className="w-full text-xs text-left border-collapse border border-black bg-white text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>
                      <thead>
                        <tr className="bg-white text-black font-bold" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                          <th className="border border-black p-2 text-center w-12 text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>ক্রমিক নং</th>
                          <th className="border border-black p-2 text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>নাম</th>
                          <th className="border border-black p-2 text-center text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>জাতীয় পরিচয় পত্র নং</th>
                          <th className="border border-black p-2 text-center text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>জন্ম তারিখ</th>
                          <th className="border border-black p-2 text-center text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>সম্পর্ক</th>
                          <th className="border border-black p-2 text-center text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>মন্তব্য</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white text-black" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                        {(rows as string[][]).map((row, rIdx) => {
                          let sl = row[0] || toBengaliNumeral(rIdx + 1);
                          let name = row[1] || '';
                          let nid = '';
                          let dob = '';
                          let relation = '';
                          let comment = '';

                          const c2 = (row[2] || '').trim();
                          const c3 = (row[3] || '').trim();
                          const c4 = (row[4] || '').trim();
                          const c5 = (row[5] || '').trim();

                          const isRelationWord = (val: string): boolean => {
                            if (!val) return false;
                            const s = val.trim();
                            const rels = ['স্ত্রী', 'স্বামী', 'পুত্র', 'মেয়ে', 'মেয়ে', 'কন্যা', 'সন্তান', 'পিতা', 'মাতা', 'ভাই', 'বোন', 'নাতি', 'নাতনী', 'নাতনি', 'ভাতিজা', 'ভাগ্নে', 'ছেলে', 'নিজ', 'স্বয়ং', 'আবেদনকারী', 'মৃত', 'ওয়ারিশ', 'ওয়ারিশ'];
                            return rels.some(r => s.includes(r));
                          };

                          const isDateOrAge = (val: string): boolean => {
                            if (!val) return false;
                            const s = val.trim();
                            if (/[\/\.-]/.test(s) && /\d/.test(s)) return true;
                            if (s.includes('বছর') || s.includes('মাস') || s.includes('দিন') || s.includes('বয়স') || s.includes('বয়স')) return true;
                            return false;
                          };

                          const isNidNum = (val: string): boolean => {
                            if (!val) return false;
                            const digits = val.replace(/[^0-9০-৯]/g, '');
                            return digits.length >= 7;
                          };

                          // Check if row is in OLD format: [sl, name, DOB/Age, Relation, NID, Comment]
                          const isOldFormat = isRelationWord(c3) || (isDateOrAge(c2) && !isDateOrAge(c3)) || (isNidNum(c4) && !isNidNum(c2));

                          if (isOldFormat) {
                            dob = c2;
                            relation = c3;
                            nid = c4;
                            comment = c5;
                          } else {
                            // NEW format: [sl, name, NID, DOB, Relation, Comment]
                            nid = c2;
                            dob = c3;
                            relation = c4;
                            comment = c5;
                          }

                          // Fail-safe relocation pass: ensure no column holds incorrect data types
                          if (isRelationWord(nid) && !relation) {
                            relation = nid;
                            nid = '';
                          }
                          if (isRelationWord(dob) && !relation) {
                            relation = dob;
                            dob = '';
                          }
                          if (isDateOrAge(nid) && !dob) {
                            dob = nid;
                            nid = '';
                          }
                          if (isNidNum(relation) && !nid) {
                            nid = relation;
                            relation = '';
                          }
                          if (isNidNum(dob) && !nid) {
                            nid = dob;
                            dob = '';
                          }

                          return (
                            <tr key={rIdx} className="bg-white text-black" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                              <td className="border border-black p-2 text-center font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{toBengaliNumeral(sl)}</td>
                              <td className="border border-black p-2 font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{name}</td>
                              <td className="border border-black p-2 text-center font-mono font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{toBengaliNumeral(nid)}</td>
                              <td className="border border-black p-2 text-center font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{toBengaliNumeral(dob)}</td>
                              <td className="border border-black p-2 text-center font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{relation}</td>
                              <td className="border border-black p-2 text-center font-bold text-black" style={{ color: '#000000', backgroundColor: '#ffffff', borderColor: '#000000' }}>{comment}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Closing Wishing Statement */}
            <div className="mt-4 text-xs md:text-sm font-semibold text-slate-900">
              আমি তাহার সর্বাঙ্গীন মঙ্গল ও উত্তরোত্তর সাফল্য কামনা করি।
            </div>
          </div>

          {/* Footer Signatures, QR Verification & Blank Round Seal */}
          <div className="cert-footer mt-10 print:mt-4 pt-4 border-t border-slate-300">
            <div className="grid grid-cols-12 items-end justify-between gap-2">
              
              {/* Left Column: Secretary Signature Block & QR Code */}
              <div className="col-span-4 flex flex-col items-start justify-end space-y-2">
                {showSecretarySig && (
                  <div className="space-y-0.5 text-left w-full">
                    <div className="cert-signature-space min-h-[40px] flex items-end justify-start">
                      {showDigitalSig && config.secretarySignatureUrl ? (
                        <img 
                          src={config.secretarySignatureUrl} 
                          alt="Secretary Digital Signature" 
                          className="max-h-12 max-w-[140px] object-contain filter contrast-125 mb-1"
                        />
                      ) : (
                        <span className="font-serif italic text-slate-800 font-bold text-xs border-b border-slate-700 px-3 mb-1">
                          {config.secretaryName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-950">{config.secretaryName}</p>
                    <p className="text-[11px] font-semibold text-emerald-900">{config.secretaryTitle}</p>
                    <p className="text-[10px] text-slate-600 font-medium">{config.upName}</p>
                  </div>
                )}

                {/* QR Code linked directly to Certificate Verification */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={realVerifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="অনলাইন সত্যতা যাচাই করতে ক্লিক বা স্ক্যান করুন"
                    className="block group shrink-0"
                  >
                    <img 
                      src={qrImageUrl} 
                      alt="QR Verification Link" 
                      className="qr-code-img w-16 h-16 md:w-18 md:h-18 border-2 border-emerald-900 p-1 rounded-lg bg-white shadow-sm group-hover:scale-105 transition"
                    />
                  </a>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-950 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-700 inline shrink-0" />
                      <span>ডিজিটাল সিকিউরিটি হ্যাশ</span>
                    </p>
                    <p className="text-[9px] font-mono text-slate-800 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-300 inline-block my-0.5">
                      {generateSecurityChecksum(certificate.memoNo, certificate.citizen?.nid || certificate.citizen?.birthNo, certificate.issueDateEn || certificate.issueDate)}
                    </p>
                    <p className="text-[8px] text-slate-500 font-semibold">জালিয়াতি প্রতিরোধী ক্রিপ্টোগ্রাফিক সিগনেচার</p>
                  </div>
                </div>
              </div>

              {/* Center Column: Blank Round Seal Area for Manual Rubber Stamp */}
              <div className="col-span-4 text-center flex flex-col items-center justify-end">
                {blankSealSize > 0 && (
                  <div 
                    className="rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-center p-1 bg-slate-50/50 print:bg-transparent"
                    style={{ width: `${blankSealSize}px`, height: `${blankSealSize}px` }}
                  >
                    <span className="text-[9px] font-bold text-slate-400 leading-tight select-none">
                      গোল সিল মোহরের স্থান
                    </span>
                  </div>
                )}
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  (অফিশিয়াল ম্যানুয়াল সিল)
                </p>
              </div>

              {/* Right Column: Chairman Digital Signature Block */}
              <div className="col-span-4 text-right space-y-0.5">
                <div className="cert-signature-space min-h-[44px] flex items-end justify-end">
                  {showDigitalSig && config.chairmanSignatureUrl ? (
                    <img 
                      src={config.chairmanSignatureUrl} 
                      alt="Chairman Digital Signature" 
                      className="max-h-14 max-w-[150px] object-contain filter contrast-125 mb-1"
                    />
                  ) : (
                    <span className="font-serif italic text-emerald-950 font-extrabold text-sm border-b-2 border-emerald-950 px-4 mb-1">
                      {config.chairmanName}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-950">{config.chairmanName}</p>
                <p className="text-[11px] font-semibold text-emerald-900">{config.chairmanTitle}</p>
                <p className="text-[10px] text-slate-700 font-medium">{config.upName}</p>
                <p className="text-[10px] text-slate-600">{config.upazila}, {config.district}</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* WhatsApp Sharing Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden space-y-0 relative">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-amber-300 font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">হোয়াটসঅ্যাপে সনদ প্রেরণ (WhatsApp Web API)</h3>
                  <p className="text-[11px] text-emerald-100">নাগরিককে সরাসরি পিডিএফ লিংক ও বিস্তারিত মেসেজ পাঠান</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Phone Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>নাগরিকের মোবাইল / হোয়াটসঅ্যাপ নম্বর:</span>
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="যেমন: 01712345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
                {formattedPhone ? (
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>আন্তর্জাতিক কোড সহ প্রস্তুত: +{formattedPhone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-amber-700 font-medium">
                    ⚠️ মোবাইল নম্বর না দিলে সাধারণ মেসেজ টেক্সট কপি বা হোয়াটসঅ্যাপ অ্যাপ খুলবে।
                  </p>
                )}
              </div>

              {/* Note Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>বিশেষ বার্তা (ঐচ্ছিক):</span>
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="অতিরিক্ত কোনো নির্দেশ বা নোট লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1">
                <span className="block text-[11px] font-bold text-slate-600">মেসেজের লাইভ প্রাক-প্রদর্শন (Preview):</span>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all shadow-inner">
                  {buildWhatsAppMessage()}
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleCopyMessage}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>মেসেজ কপি করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>WhatsApp Web এ পাঠান</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive A4 Print Preview Modal */}
      {isPrintPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-900/60 text-emerald-300 rounded-xl border border-emerald-700/50">
                  <Printer className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      A4 প্রিন্ট প্রিভিউ & লেআউট ভেরিফিকেশন (Print Preview)
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                      isCompactMode 
                        ? 'bg-amber-400 text-slate-950 shadow-sm' 
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}>
                      {isCompactMode ? '📄 ১-পাতা অটো-ফিট অন' : '📄 সাধারণ মোড'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    প্রিন্টারে পেপার পাঠাবার আগে A4 ১-পাতার সীমানা ও কমপ্যাক্ট মোড লেআউট স্বচক্ষে যাচাই করুন।
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Real-time Control Bar */}
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Compact Mode Switch */}
                <button
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  className={`px-3 py-1.5 rounded-lg border font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isCompactMode
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                  }`}
                  title="A4 ১ পাতায় সব লেখা ফিট করানোর জন্য কমপ্যাক্ট মোড অন/অফ করুন"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isCompactMode ? '⚡ কমপ্যাক্ট মোড: অন (১-পাতা অটো-ফিট)' : '⚪ কমপ্যাক্ট মোড: অফ'}</span>
                </button>

                {/* Page Orientation Selector Buttons */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => setPageOrientation('portrait')}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      pageOrientation === 'portrait'
                        ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="খাড়া A4 পোর্ট্রেট লেআউট"
                  >
                    <span>📱 পোর্ট্রেট (Portrait)</span>
                  </button>
                  <button
                    onClick={() => setPageOrientation('landscape')}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                      pageOrientation === 'landscape'
                        ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="আড়াআড়ি A4 ল্যান্ডস্কেপ লেআউট"
                  >
                    <span>🖥️ ল্যান্ডস্কেপ (Landscape)</span>
                  </button>
                </div>

                {/* Print Scale Selector */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <span className="text-slate-400 font-semibold">প্রিন্ট স্কেল:</span>
                  <select
                    value={printScale}
                    onChange={(e) => setPrintScale(Number(e.target.value))}
                    className="bg-slate-900 text-amber-300 font-bold border border-slate-600 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value={100}>১০০% (সাধারণ)</option>
                    <option value={95}>৯৫% (A4 এর জন্য উপযুক্ত)</option>
                    <option value={90}>৯০% (কমপ্যাক্ট)</option>
                    <option value={85}>৮৫% (দীর্ঘ আবেদনের জন্য)</option>
                    <option value={80}>৮০% (অতিরিক্ত বড় টেবিল)</option>
                  </select>
                </div>

                {/* Font Size Selector */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <span className="text-slate-400 font-semibold">ফন্ট:</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="bg-slate-900 text-white font-bold border border-slate-600 rounded px-1.5 py-0.5 text-xs cursor-pointer"
                  >
                    <option value={13}>১৩px (ক্ষুদ্র)</option>
                    <option value={14}>১৪px (ছোট)</option>
                    <option value={15}>১৫px (কমপ্যাক্ট)</option>
                    <option value={16}>১৬px (স্ট্যান্ডার্ড)</option>
                    <option value={18}>১৮px (বড়)</option>
                  </select>
                </div>

                {/* Header Mode Toggle */}
                <button
                  onClick={() => setShowHeaderInPrint(!showHeaderInPrint)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    showHeaderInPrint
                      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                      : 'bg-amber-900/50 text-amber-300 border-amber-700'
                  }`}
                >
                  {showHeaderInPrint ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showHeaderInPrint ? 'ডিজিটাল হেডার' : 'প্যাড (হেডার লুকানো)'}</span>
                </button>
              </div>

              {/* Reset to 1-Page Recommended */}
              <button
                onClick={() => {
                  setIsCompactMode(true);
                  setFontSize(15);
                  setPrintScale(95);
                }}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition cursor-pointer shadow"
              >
                ⚡ ১-পাতা ফিট অটো-সেট
              </button>
            </div>

            {/* A4 Interactive Mock-Up Viewport */}
            <div className="p-4 sm:p-6 bg-slate-950/80 overflow-y-auto flex flex-col items-center justify-start min-h-[420px] max-h-[62vh] border-b border-slate-800 relative shadow-inner">
              <div className="mb-2 flex items-center justify-between w-full max-w-4xl text-[11px] text-slate-400 px-2">
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {pageOrientation === 'landscape' 
                      ? 'A4 Landscape Canvas (297mm × 210mm) — Wide 1 Page Sheet' 
                      : 'A4 Portrait Canvas (210mm × 297mm) — 1 Page Bound'}
                  </span>
                </span>
                <span className="text-amber-300 font-semibold">
                  {isCompactMode ? '✅ কমপ্যাক্ট মোড সক্রিয় - ১ পাতায় প্রিন্ট গ্যারান্টি' : '⚠️ সাধারণ মোড - বিবরণী দীর্ঘ হলে ২য় পাতায় যেতে পারে'}
                </span>
              </div>

              {/* Scaled A4 Mockup Sheet Canvas */}
              <div className={`w-full bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-800 shadow-2xl relative transition-all duration-300 ${
                pageOrientation === 'landscape' ? 'max-w-4xl' : 'max-w-3xl'
              }`}>
                {/* Visual A4 Page Marker */}
                <div className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[10px] font-mono rounded font-bold">
                  A4 {pageOrientation.toUpperCase()} PAGE 1
                </div>

                <div 
                  className={`bg-white text-slate-900 rounded-lg p-4 md:p-6 shadow-xl border border-slate-300 transition-all duration-200 ${
                    pageOrientation === 'landscape' ? 'is-landscape' : 'is-portrait'
                  } ${
                    isCompactMode ? 'is-compact-mode' : ''
                  }`}
                  style={{
                    transform: printScale !== 100 ? `scale(${printScale / 100})` : undefined,
                    transformOrigin: 'top center',
                    minHeight: pageOrientation === 'landscape' 
                      ? (isCompactMode ? '540px' : '640px') 
                      : (isCompactMode ? '720px' : '880px')
                  }}
                >
                  {/* Miniature Live Preview of Certificate Layout */}
                  <div className={`p-4 border-2 border-emerald-900 rounded ${borderStyle === 'double-green-red' ? 'outline-2 outline-red-700 outline-offset-2' : ''}`}>
                    {showHeaderInPrint && (
                      <div className="text-center pb-2 border-b border-emerald-900 mb-3">
                        <p className="text-xs font-bold text-emerald-950">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                        <h4 className="text-sm font-black text-emerald-950">{config.upName}</h4>
                        <p className="text-[10px] text-slate-600">{config.address}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 mb-3">
                      <span>স্মারক নং: {certificate.memoNo}</span>
                      <span>তারিখ: {certificate.issueDate}</span>
                    </div>

                    <div className="text-center my-3">
                      <span className="inline-block bg-emerald-950 text-white font-bold text-xs px-4 py-1 rounded">
                        {certificate.typeLabel}
                      </span>
                    </div>

                    <div 
                      className="text-justify text-xs font-medium text-slate-900 leading-relaxed my-3 px-1 indent-4"
                      style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                    >
                      {editableBodyText.length > 350 
                        ? editableBodyText.substring(0, 350) + '...' 
                        : editableBodyText}
                    </div>

                    {Object.keys(extraTables).length > 0 && (
                      <div className="my-2 p-1.5 bg-slate-50 border border-slate-300 rounded text-[10px]">
                        <p className="font-bold text-emerald-950 border-b pb-0.5 mb-1">সংযুক্ত তথ্য / ওয়ারিশ বিবরণী টেবিল (সক্রিয়)</p>
                        <div className="text-slate-600 italic">মোট সদস্য / সারি: {(Object.values(extraTables)[0] as Array<any>)?.length || 0} টি</div>
                      </div>
                    )}

                    <div className="mt-8 pt-3 border-t border-slate-300 flex justify-between items-end text-[10px]">
                      <div className="space-y-1">
                        <img src={qrImageUrl} alt="QR" className="w-10 h-10 border border-emerald-900 p-0.5 bg-white rounded" />
                        <p className="text-[9px] text-slate-500">অনলাইন যাচাইকৃত</p>
                      </div>

                      <div className="text-center space-y-0.5">
                        <p className="font-bold text-slate-950">{config.chairmanName}</p>
                        <p className="text-[9px] text-emerald-900">{config.chairmanTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">💡 টিপস:</span>
                <span>প্রিন্ট আউট ১ পাতায় নিশ্চিত করতে "কমপ্যাক্ট মোড অন" সিলেক্ট রেখে প্রিন্টারে পাঠান।</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="w-1/2 sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  ফিরে যান
                </button>

                <button
                  onClick={() => {
                    setIsPrintPreviewOpen(false);
                    setTimeout(() => {
                      triggerActualPrint();
                    }, 100);
                  }}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>প্রিন্টারে পাঠান (Confirm Print)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
