import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  Sparkles, 
  CreditCard, 
  Building2, 
  Award, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Grid,
  User,
  ExternalLink,
  Layers,
  PhoneCall
} from 'lucide-react';
import QRCode from 'qrcode';
import { CouncilMember, UnionParishadConfig } from '../types';

interface MemberIdCardModalProps {
  member: CouncilMember | null;
  allMembers: CouncilMember[];
  config: UnionParishadConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberIdCardModal: React.FC<MemberIdCardModalProps> = ({
  member: initialMember,
  allMembers,
  config,
  isOpen,
  onClose
}) => {
  const [selectedMember, setSelectedMember] = useState<CouncilMember | null>(initialMember);
  const [cardTheme, setCardTheme] = useState<'emerald' | 'gold' | 'modern' | 'visiting'>('emerald');
  const [showBackSide, setShowBackSide] = useState<boolean>(true);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync state if initialMember changes
  useEffect(() => {
    if (initialMember) {
      setSelectedMember(initialMember);
      setBatchMode(false);
    } else if (allMembers.length > 0 && !selectedMember) {
      setSelectedMember(allMembers[0]);
    }
  }, [initialMember, allMembers]);

  // Generate QR code URLs for selected or all members
  useEffect(() => {
    if (!isOpen) return;

    const generateQr = async () => {
      const targetMembers = batchMode ? allMembers : (selectedMember ? [selectedMember] : []);
      const newUrls: Record<string, string> = {};

      for (const m of targetMembers) {
        if (!m) continue;
        const profileUrl = `${window.location.origin}/#member-${m.id}?name=${encodeURIComponent(m.name)}&role=${encodeURIComponent(m.designation)}&mobile=${encodeURIComponent(m.mobile)}&ward=${encodeURIComponent(m.wardNo || '')}`;
        
        try {
          const url = await QRCode.toDataURL(profileUrl, {
            width: 250,
            margin: 1,
            color: {
              dark: cardTheme === 'gold' ? '#0f172a' : '#064e3b',
              light: '#ffffff'
            }
          });
          newUrls[m.id] = url;
        } catch (err) {
          console.warn('QR Code generation error:', err);
        }
      }
      setQrCodeUrls(prev => ({ ...prev, ...newUrls }));
    };

    generateQr();
  }, [isOpen, selectedMember, batchMode, allMembers, cardTheme]);

  if (!isOpen) return null;

  const activeMember = selectedMember || allMembers[0];

  const handlePrint = () => {
    window.print();
  };

  const currentMemberIndex = allMembers.findIndex(m => m.id === activeMember?.id);

  const handlePrevMember = () => {
    if (currentMemberIndex > 0) {
      setSelectedMember(allMembers[currentMemberIndex - 1]);
    } else {
      setSelectedMember(allMembers[allMembers.length - 1]);
    }
  };

  const handleNextMember = () => {
    if (currentMemberIndex < allMembers.length - 1) {
      setSelectedMember(allMembers[currentMemberIndex + 1]);
    } else {
      setSelectedMember(allMembers[0]);
    }
  };

  const handleCopyProfileLink = () => {
    if (!activeMember) return;
    const link = `${window.location.origin}/#member-${activeMember.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Helper to format Badge ID
  const getBadgeId = (m: CouncilMember) => {
    const rawId = m.id.replace(/[^0-9]/g, '').slice(-3) || '001';
    return `UP-ID-${rawId.padStart(3, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-auto">
        
        {/* Top Header - Screen Only */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 md:p-5 flex items-center justify-between border-b border-emerald-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base md:text-lg text-white">
                  স্মার্ট ডিজিটাল আইডি ও ভিজিটিং কার্ড জেনারেটর
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40">
                  QR ভেরিফাইড
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {config.upName} — কর্মকর্তা ও জনপ্রতিনিধিদের প্রাতিষ্ঠানিক পরিচিতিপত্র
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800 hover:bg-emerald-700 text-emerald-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls - Screen Only */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 md:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          
          {/* Member Navigator */}
          {!batchMode && activeMember && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={handlePrevMember}
                className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                title="পূর্ববর্তী কর্মকর্তা"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                  {activeMember.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium truncate max-w-[150px]">
                  {activeMember.designation}
                </p>
              </div>

              <button
                onClick={handleNextMember}
                className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                title="পরবর্তী কর্মকর্তা"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 px-2">ডিজাইন:</span>
            <button
              onClick={() => setCardTheme('emerald')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                cardTheme === 'emerald'
                  ? 'bg-emerald-800 text-amber-300 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              গভর্নমেন্ট গ্রীন
            </button>
            <button
              onClick={() => setCardTheme('gold')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                cardTheme === 'gold'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              রয়্যাল গোল্ড
            </button>
            <button
              onClick={() => setCardTheme('modern')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                cardTheme === 'modern'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              স্মার্ট মিনিমাল
            </button>
            <button
              onClick={() => setCardTheme('visiting')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                cardTheme === 'visiting'
                  ? 'bg-slate-800 text-amber-300 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ভিজিটিং কার্ড
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                batchMode 
                  ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-purple-600" />
              <span>{batchMode ? 'একক কার্ড ভিউ' : `সকলের কার্ড (${allMembers.length})`}</span>
            </button>

            {!batchMode && (
              <button
                onClick={() => setShowBackSide(!showBackSide)}
                className="px-3 py-1.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showBackSide ? 'পিছনের পাশ আড়াল' : 'উভয় পাশ প্রদর্শন'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{batchMode ? 'সকল কার্ড প্রিন্ট' : 'কার্ড প্রিন্ট'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Canvas */}
        <div className="p-4 md:p-8 bg-slate-100 flex-1 overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
          
          {/* SINGLE MEMBER CARD PREVIEW MODE */}
          {!batchMode && activeMember && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Card Container View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center print:grid-cols-2 print:gap-4 print:space-y-0">
                
                {/* ID CARD FRONT SIDE */}
                <div 
                  className={`w-full max-w-[340px] mx-auto h-[480px] rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col justify-between relative transition duration-300 transform hover:scale-[1.01] print:shadow-none print:break-inside-avoid ${
                    cardTheme === 'emerald'
                      ? 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-950 text-white border-amber-400'
                      : cardTheme === 'gold'
                      ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-amber-400'
                      : cardTheme === 'modern'
                      ? 'bg-white text-slate-900 border-teal-600 shadow-md'
                      : 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white border-emerald-600 h-[280px]' // Business Visiting Card style
                  }`}
                >
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Top Govt Crest & UP Header */}
                  <div className={`p-4 text-center border-b relative z-10 ${
                    cardTheme === 'modern' ? 'bg-teal-900 text-white border-teal-700' : 'bg-black/30 border-white/10'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <img 
                        src={config.logoUrl} 
                        alt="Govt Logo" 
                        className="w-8 h-8 object-contain drop-shadow" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg';
                        }}
                      />
                      <div className="text-left">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300 leading-none">
                          গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                        </p>
                        <h3 className="text-sm font-black text-white leading-tight">
                          {config.upName}
                        </h3>
                      </div>
                    </div>
                    <div className="inline-block px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black tracking-wide shadow-2xs">
                      অফিসিয়াল পরিচিতিপত্র (OFFICIAL ID CARD)
                    </div>
                  </div>

                  {/* Body - Photo & Credentials */}
                  <div className="p-4 text-center space-y-3 relative z-10 flex-1 flex flex-col items-center justify-center">
                    
                    {/* Photo with Badge Frame */}
                    <div className="relative">
                      <img
                        src={activeMember.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'}
                        alt={activeMember.name}
                        className={`w-24 h-24 rounded-2xl object-cover border-4 shadow-lg ${
                          cardTheme === 'modern' ? 'border-teal-600' : 'border-amber-400'
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activeMember.name) + '&background=047857&color=fff';
                        }}
                      />
                      <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-md whitespace-nowrap flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-300" />
                        <span>ভেরিফাইড কর্মকর্তা</span>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="pt-2 space-y-1">
                      <h2 className={`font-black text-base md:text-lg leading-tight ${
                        cardTheme === 'modern' ? 'text-teal-950' : 'text-amber-300'
                      }`}>
                        {activeMember.name}
                      </h2>
                      
                      <p className={`text-xs font-bold ${
                        cardTheme === 'modern' ? 'text-slate-700' : 'text-emerald-100'
                      }`}>
                        {activeMember.designation}
                      </p>

                      {activeMember.wardNo && (
                        <p className={`text-[11px] font-semibold flex items-center justify-center gap-1 ${
                          cardTheme === 'modern' ? 'text-slate-600' : 'text-amber-200'
                        }`}>
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{activeMember.wardNo}</span>
                        </p>
                      )}
                    </div>

                    {/* Official Mobile */}
                    <div className={`w-full py-1.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 ${
                      cardTheme === 'modern'
                        ? 'bg-slate-100 border-slate-300 text-slate-800'
                        : 'bg-white/10 border-white/20 text-white'
                    }`}>
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeMember.mobile}</span>
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className={`p-2.5 text-center text-[10px] font-bold border-t relative z-10 flex items-center justify-between px-4 ${
                    cardTheme === 'modern'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-slate-950/80 text-emerald-200 border-white/10'
                  }`}>
                    <span>আইডি: <strong className="text-amber-300 font-mono">{getBadgeId(activeMember)}</strong></span>
                    <span>মেয়াদ: ২০২৬-২০২৭</span>
                  </div>
                </div>

                {/* ID CARD BACK SIDE */}
                {showBackSide && (
                  <div 
                    className={`w-full max-w-[340px] mx-auto h-[480px] rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col justify-between relative transition duration-300 transform hover:scale-[1.01] print:shadow-none print:break-inside-avoid ${
                      cardTheme === 'emerald'
                        ? 'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white border-amber-400'
                        : cardTheme === 'gold'
                        ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white border-amber-400'
                        : cardTheme === 'modern'
                        ? 'bg-white text-slate-900 border-teal-600 shadow-md'
                        : 'bg-gradient-to-r from-slate-900 to-emerald-950 text-white border-emerald-600 h-[280px]'
                    }`}
                  >
                    {/* Header */}
                    <div className={`p-3 text-center border-b relative z-10 ${
                      cardTheme === 'modern' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-black/30 border-white/10'
                    }`}>
                      <p className="text-[10px] font-extrabold text-amber-300">
                        {config.upName} — যাচাইকরণ তথ্য
                      </p>
                      <p className="text-[9px] text-slate-300">
                        স্থায়ী কার্যালয়: {config.address || 'সখিপুর, টাঙ্গাইল'}
                      </p>
                    </div>

                    {/* QR Code & Verification Instructions */}
                    <div className="p-4 text-center space-y-3 relative z-10 flex-1 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-slate-300">
                        ডিজিটাল প্রোফাইল ও সনদপত্র যাচাইয়ের জন্য কিউআর কোড স্ক্যান করুন:
                      </p>

                      {/* Generated QR Code Image */}
                      <div className="p-2 bg-white rounded-2xl shadow-md border-2 border-amber-400 inline-block">
                        {qrCodeUrls[activeMember.id] ? (
                          <img
                            src={qrCodeUrls[activeMember.id]}
                            alt="Member QR Code"
                            className="w-32 h-32 object-contain"
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-400">
                            কিউআর লোড হচ্ছে...
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-center">
                        <p className="text-[10px] font-semibold text-emerald-200">
                          জরুরি সেবা হটলাইন: ৩৩৩ | জাতীয় জরুরি: ৯৯৯
                        </p>
                        <p className="text-[9px] text-slate-400 italic">
                          কার্ডটি হারিয়ে গেলে বা পাওয়া গেলে ইউনিয়ন পরিষদ কার্যালয়ে জমা দিন।
                        </p>
                      </div>
                    </div>

                    {/* Official Signatures & Seal */}
                    <div className={`p-3 text-center border-t relative z-10 grid grid-cols-2 gap-2 text-[9px] font-bold ${
                      cardTheme === 'modern' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-slate-300'
                    }`}>
                      <div className="border-r border-slate-700/50 pr-2">
                        <div className="h-6 flex items-center justify-center">
                          <span className="font-serif italic text-amber-300 text-[11px] opacity-80">
                            {config.secretaryName}
                          </span>
                        </div>
                        <p className="pt-1 border-t border-slate-500/40 text-[9px] text-slate-300">
                          স্বাক্ষর (ইউপি সচিব)
                        </p>
                      </div>

                      <div className="pl-2">
                        <div className="h-6 flex items-center justify-center">
                          <span className="font-serif italic text-amber-300 text-[11px] opacity-80">
                            {config.chairmanName}
                          </span>
                        </div>
                        <p className="pt-1 border-t border-slate-500/40 text-[9px] text-slate-300">
                          স্বাক্ষর (ইউপি চেয়ারম্যান)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Share & Copy Link Footer Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ডিজিটাল ভেরিফিকেশন প্রোফাইল লিংক:</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyProfileLink}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-slate-600" />}
                    <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'প্রোফাইল লিংক কপি'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>প্রিন্ট করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BATCH ALL MEMBERS PRINT GRID MODE */}
          {batchMode && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs print:hidden">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {config.upName} — সকল কর্মকর্তা আইডি কার্ড গ্রিড ({allMembers.length} জন)
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Standard A4 পেপারে ৩x৩ গ্রিডে আইডি কার্ড প্রিন্ট করার উপযুক্ত ফরম্যাট।
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-800 text-amber-300 font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>সকল কার্ড একসাথে প্রিন্ট</span>
                </button>
              </div>

              {/* Grid Layout of All Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-3 print:m-0">
                {allMembers.map((m) => (
                  <div 
                    key={m.id}
                    className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl border-2 border-amber-400 p-4 shadow-md flex flex-col justify-between h-[360px] relative overflow-hidden print:h-[300px] print:shadow-none print:break-inside-avoid"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <img 
                        src={config.logoUrl} 
                        alt="Logo" 
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg';
                        }}
                      />
                      <div>
                        <p className="text-[8px] font-bold text-amber-300 tracking-wider">
                          {config.upName}
                        </p>
                        <p className="text-[10px] font-black leading-none">
                          অফিসিয়াল পরিচিতিপত্র
                        </p>
                      </div>
                    </div>

                    {/* Member Info & Photo */}
                    <div className="flex items-center gap-3 my-2">
                      <img
                        src={m.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                        alt={m.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name) + '&background=047857&color=fff';
                        }}
                      />
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-black text-xs text-amber-300 truncate">
                          {m.name}
                        </h4>
                        <p className="text-[10px] text-emerald-100 font-bold truncate">
                          {m.designation}
                        </p>
                        {m.wardNo && (
                          <p className="text-[9px] text-slate-300 font-medium truncate">
                            {m.wardNo}
                          </p>
                        )}
                        <p className="text-[10px] font-mono font-bold text-white pt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{m.mobile}</span>
                        </p>
                      </div>
                    </div>

                    {/* QR Code & Signature */}
                    <div className="bg-black/40 p-2 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                      <div className="text-[9px] text-slate-300 space-y-0.5">
                        <p>আইডি: <strong className="text-amber-300">{getBadgeId(m)}</strong></p>
                        <p className="text-[8px] text-emerald-300">ভেরিফাইড কর্মকর্তা</p>
                      </div>

                      {qrCodeUrls[m.id] && (
                        <img
                          src={qrCodeUrls[m.id]}
                          alt="QR"
                          className="w-14 h-14 bg-white p-0.5 rounded-lg border border-amber-400 shrink-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
