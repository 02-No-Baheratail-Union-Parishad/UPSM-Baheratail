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
import { formatBanglaDate, convertEnglishDateToBanglaFormatted, generateSecurityChecksum } from '../lib/utils';

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

  // WhatsApp Messaging State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(certificate.citizen?.mobile || '');
  const [customNote, setCustomNote] = useState('আপনার কাঙ্ক্ষিত সনদপত্রটি ইউনিয়ন পরিষদ থেকে সফলভাবে অনুমোদন করা হয়েছে।');
  const [copiedText, setCopiedText] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
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
              <span>সনদের টেমপ্লেট ও লেআউট লাইভ কাস্টমাইজার</span>
            </h3>
            <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-mono">
              REAL-TIME PREVIEW
            </span>
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
                min={13}
                max={20}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Border Style */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">ফ্রেম বর্ডার ডিজাইন:</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 text-white rounded focus:border-amber-400 font-semibold"
              >
                <option value="double-green-red">১. ডবল বর্ডার (সবুজ ও লাল স্ট্রাইপ)</option>
                <option value="double-green">২. ডবল সবুজ বর্ডার</option>
                <option value="single-green">৩. একক চিকন সবুজ বর্ডার</option>
                <option value="none">৪. নো বর্ডার (প্লেন কাগজ)</option>
              </select>
            </div>

            {/* Blank Seal Diameter */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                গোল সিল ফাঁকা ডায়ামিটার: {blankSealSize === 0 ? 'হাইড' : `${blankSealSize}px`}
              </label>
              <input
                type="range"
                min={0}
                max={140}
                step={8}
                value={blankSealSize}
                onChange={(e) => setBlankSealSize(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
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

            {/* Signature Display Toggles */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
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
        className="print-paper bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-300 max-w-4xl mx-auto relative overflow-hidden text-slate-900 print:shadow-none print:p-4 print:border-none print:m-0 print:w-full print:max-w-none print:rounded-none"
        style={{ minHeight: '1020px' }}
      >
        {/* Background Watermark */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: config.watermarkOpacity || 0.08 }}
        >
          <img 
            src={config.logoUrl} 
            alt="Watermark Seal" 
            className="w-96 h-96 object-contain"
          />
        </div>

        {/* Outer Frame Border matching chosen borderStyle */}
        <div 
          className={`p-6 md:p-8 h-full flex flex-col justify-between relative z-10 min-h-[960px] ${
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
              <header className="pb-4 border-b-2 border-emerald-900">
                <p className="text-center text-base md:text-lg font-extrabold text-emerald-950 tracking-wide mb-2">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </p>

                {/* Header Style 1: Tri-Column (Matching User Reference Image) */}
                {headerStyle === 'tri-column' && (
                  <div className="grid grid-cols-12 items-center gap-2 my-2">
                    {/* Left Column: Chairman Details */}
                    <div className="col-span-4 text-left space-y-0.5">
                      <p className="text-sm font-extrabold text-slate-950">{config.chairmanName}</p>
                      <p className="text-xs font-bold text-emerald-900">{config.chairmanTitle}</p>
                      <p className="text-[11px] text-slate-700 font-semibold">{config.upName}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{config.upazila}, {config.district}</p>
                    </div>

                    {/* Center Column: UP Logo & Title */}
                    <div className="col-span-4 text-center flex flex-col items-center justify-center">
                      <img 
                        src={config.logoUrl} 
                        alt="UP Logo" 
                        className="w-16 h-16 object-contain mb-1"
                      />
                      <h2 className="text-xl md:text-2xl font-black text-emerald-950 leading-tight">
                        {config.upName}
                      </h2>
                      <p className="text-xs font-bold text-emerald-900 mt-0.5">
                        {config.address}
                      </p>
                    </div>

                    {/* Right Column: Secretary Details */}
                    <div className="col-span-4 text-right space-y-0.5">
                      <p className="text-sm font-extrabold text-slate-950">{config.secretaryName}</p>
                      <p className="text-xs font-bold text-emerald-900">{config.secretaryTitle}</p>
                      <p className="text-[11px] text-slate-700 font-semibold">{config.upName}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{config.upazila}, {config.district}</p>
                    </div>
                  </div>
                )}

                {/* Header Style 2: Centered */}
                {headerStyle === 'centered' && (
                  <div className="text-center flex flex-col items-center justify-center my-3">
                    <img src={config.logoUrl} alt="Logo" className="w-16 h-16 object-contain mb-2" />
                    <h2 className="text-2xl font-black text-emerald-950">{config.upName}</h2>
                    <p className="text-xs font-semibold text-slate-700">{config.address}</p>
                  </div>
                )}

                {/* Header Style 3: Classic */}
                {headerStyle === 'classic' && (
                  <div className="flex items-center justify-between my-2">
                    <img src={config.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-emerald-950">{config.upName}</h2>
                      <p className="text-xs text-slate-600">{config.address}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">{config.chairmanName}</p>
                      <p className="text-emerald-800">{config.chairmanTitle}</p>
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
            <div className="text-center my-6">
              <span className="inline-block bg-emerald-950 text-white font-extrabold text-lg md:text-xl px-8 py-2 rounded-md shadow-sm border border-emerald-900 tracking-wider">
                {certificate.typeLabel}
              </span>
            </div>

            {/* Main Bureaucratic Body Text with Dynamic Font Size & AI Correction Mode */}
            {isEditingText ? (
              <div className="my-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-2 print:hidden">
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
                className="my-6 text-justify leading-relaxed font-medium text-slate-900 whitespace-pre-line px-2 indent-8"
                style={{ fontSize: `${fontSize}px` }}
              >
                {editableBodyText}
              </div>
            )}

            {/* Extra Field Details (if applicable) */}
            {certificate.extra?.simpleFields && Object.keys(certificate.extra.simpleFields).length > 0 && (
              <div className="my-4 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-800">
                <p className="font-bold text-emerald-900 border-b border-slate-200 pb-1 mb-2">সংযুক্ত অতিরিক্ত বিবরণী:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(certificate.extra.simpleFields).map(([k, v]) => (
                    <div key={k} className="flex gap-1">
                      <span className="font-semibold text-slate-600">{k}:</span>
                      <span className="font-medium text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Tables (Warish / Family List) */}
            {Object.keys(extraTables).length > 0 && (
              <div className="my-6 space-y-4">
                {Object.entries(extraTables).map(([tableKey, rows]) => (
                  <div key={tableKey} className="space-y-2">
                    <p className="font-bold text-sm text-emerald-950 border-b-2 border-emerald-900 pb-1">
                      উত্তরাধিকার / পরিবারের তালিকা বিবরণী:
                    </p>
                    <table className="w-full text-xs text-left border-collapse border border-slate-900">
                      <thead>
                        <tr className="bg-emerald-900 text-white font-bold">
                          <th className="border border-slate-900 p-2 text-center w-12">ক্রমিক</th>
                          <th className="border border-slate-900 p-2">সদস্যের নাম</th>
                          <th className="border border-slate-900 p-2 text-center">জন্ম তারিখ / বয়স</th>
                          <th className="border border-slate-900 p-2">সম্পর্ক</th>
                          <th className="border border-slate-900 p-2">জাতীয় পরিচয়পত্র / মন্তব্য</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rows as string[][]).map((row, rIdx) => (
                          <tr key={rIdx} className="odd:bg-white even:bg-slate-50">
                            <td className="border border-slate-900 p-2 text-center font-bold">{row[0] || rIdx + 1}</td>
                            <td className="border border-slate-900 p-2 font-semibold text-slate-900">{row[1]}</td>
                            <td className="border border-slate-900 p-2 text-center">{row[2]}</td>
                            <td className="border border-slate-900 p-2 font-semibold">{row[3]}</td>
                            <td className="border border-slate-900 p-2">{row[4]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Closing Wishing Statement */}
            <div className="mt-6 text-sm font-semibold text-slate-900">
              আমি তাহার সর্বাঙ্গীন মঙ্গল ও উত্তরোত্তর সাফল্য কামনা করি।
            </div>
          </div>

          {/* Footer Signatures, QR Verification & Blank Round Seal */}
          <div className="mt-16 pt-8 border-t border-slate-300">
            <div className="grid grid-cols-12 items-end justify-between gap-4">
              
              {/* Left Column: Secretary Signature Block & QR Code */}
              <div className="col-span-4 flex flex-col items-start justify-end space-y-3">
                {showSecretarySig && (
                  <div className="space-y-0.5 text-left w-full">
                    <div className="min-h-[48px] flex items-end justify-start">
                      {showDigitalSig && config.secretarySignatureUrl ? (
                        <img 
                          src={config.secretarySignatureUrl} 
                          alt="Secretary Digital Signature" 
                          className="max-h-14 max-w-[150px] object-contain filter contrast-125 mb-1"
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
                      className="w-20 h-20 border-2 border-emerald-900 p-1 rounded-lg bg-white shadow-sm group-hover:scale-105 transition"
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
                <p className="text-[10px] font-semibold text-slate-500 mt-1">
                  (অফিশিয়াল ম্যানুয়াল সিল)
                </p>
              </div>

              {/* Right Column: Chairman Digital Signature Block */}
              <div className="col-span-4 text-right space-y-1">
                <div className="min-h-[56px] flex items-end justify-end">
                  {showDigitalSig && config.chairmanSignatureUrl ? (
                    <img 
                      src={config.chairmanSignatureUrl} 
                      alt="Chairman Digital Signature" 
                      className="max-h-16 max-w-[170px] object-contain filter contrast-125 mb-1"
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
    </div>
  );
};
