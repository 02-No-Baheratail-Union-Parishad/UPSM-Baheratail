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
  ArrowLeft 
} from 'lucide-react';
import { CertificateRecord, UnionParishadConfig } from '../types';

interface CertificateViewProps {
  certificate: CertificateRecord;
  config: UnionParishadConfig;
  onBack?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ certificate, config, onBack }) => {
  const [showHeaderInPrint, setShowHeaderInPrint] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const c = certificate.citizen;
  const extraTables = certificate.extra?.tables || {};

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <span>{showHeaderInPrint ? 'ডিজিটাল হেডার দৃশ্যমান' : 'হেডার লুকানো (প্রি-প্রিন্টেড প্যাড)'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন</span>
          </button>

          {/* Doc Link */}
          <a
            href={`https://docs.google.com/document/d/${config.templateDocId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>গুগল ডক ফাইল</span>
          </a>
        </div>
      </div>

      {/* Certificate Print Paper Canvas */}
      <div 
        ref={printRef} 
        className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-300 max-w-4xl mx-auto relative overflow-hidden text-slate-900 print:shadow-none print:p-6 print:border-none print:m-0 print:w-full"
        style={{ minHeight: '1050px' }}
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

        {/* Outer Frame Border for Official Look */}
        <div className="border-4 border-double border-emerald-900 p-6 md:p-8 h-full flex flex-col justify-between relative z-10 min-h-[960px]">
          
          {/* Header Section */}
          <div>
            {showHeaderInPrint && (
              <header className="text-center space-y-2 pb-4 border-b-2 border-emerald-900">
                <p className="text-sm font-bold text-emerald-900 tracking-wide">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </p>

                {/* Header 3-Column Grid */}
                <div className="grid grid-cols-12 items-center gap-2 my-2">
                  {/* Left Column: Chairman Details */}
                  <div className="col-span-4 text-left space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{config.chairmanName}</p>
                    <p className="text-[11px] font-semibold text-emerald-800">{config.chairmanTitle}</p>
                    <p className="text-[10px] text-slate-600">{config.upName}</p>
                    <p className="text-[10px] text-slate-600">{config.upazila}, {config.district}</p>
                  </div>

                  {/* Center Column: UP Logo & Title */}
                  <div className="col-span-4 text-center flex flex-col items-center justify-center">
                    <img 
                      src={config.logoUrl} 
                      alt="UP Logo" 
                      className="w-16 h-16 object-contain mb-1"
                    />
                    <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 leading-tight">
                      {config.upName}
                    </h2>
                    <p className="text-[11px] font-semibold text-emerald-900">
                      {config.address}
                    </p>
                  </div>

                  {/* Right Column: Secretary Details */}
                  <div className="col-span-4 text-right space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">{config.secretaryName}</p>
                    <p className="text-[11px] font-semibold text-emerald-800">{config.secretaryTitle}</p>
                    <p className="text-[10px] text-slate-600">{config.upName}</p>
                    <p className="text-[10px] text-slate-600">{config.upazila}, {config.district}</p>
                  </div>
                </div>

                <div className="h-0.5 bg-emerald-900 w-full my-1"></div>
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
                <span className="text-emerald-900">{certificate.issueDate}</span>
              </div>
            </div>

            {/* Certificate Title Badge */}
            <div className="text-center my-6">
              <span className="inline-block bg-emerald-900 text-white font-extrabold text-lg md:text-xl px-8 py-2 rounded-md shadow-sm border border-emerald-950 tracking-wider">
                {certificate.typeLabel}
              </span>
            </div>

            {/* Main Bureaucratic Body Text */}
            <div className="my-6 text-justify leading-loose text-base font-medium text-slate-900 whitespace-pre-line px-2 indent-8">
              {certificate.bodyText}
            </div>

            {/* Extra Field Details (if applicable) */}
            {certificate.extra?.simpleFields && Object.keys(certificate.extra.simpleFields).length > 0 && (
              <div className="my-4 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-800">
                <p className="font-bold text-emerald-900 border-b border-slate-200 pb-1 mb-2">সংযুক্ত অতিরিক্ত তথ্য:</p>
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
                      উত্তরাধিকার / তালিকা বিবরণী:
                    </p>
                    <table className="w-full text-xs text-left border-collapse border border-slate-900">
                      <thead>
                        <tr className="bg-emerald-900 text-white font-bold">
                          <th className="border border-slate-900 p-2 text-center w-12">ক্রমিক</th>
                          <th className="border border-slate-900 p-2">সদস্যের নাম</th>
                          <th className="border border-slate-900 p-2">সম্পর্ক</th>
                          <th className="border border-slate-900 p-2 text-center">বয়স</th>
                          <th className="border border-slate-900 p-2">জাতীয় পরিচয়পত্র / জন্ম সনদ / মন্তব্য</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rows as string[][]).map((row, rIdx) => (
                          <tr key={rIdx} className="odd:bg-white even:bg-slate-50">
                            <td className="border border-slate-900 p-2 text-center font-bold">{row[0] || rIdx + 1}</td>
                            <td className="border border-slate-900 p-2 font-semibold text-slate-900">{row[1]}</td>
                            <td className="border border-slate-900 p-2">{row[2]}</td>
                            <td className="border border-slate-900 p-2 text-center">{row[3]}</td>
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
            <div className="mt-6 text-sm font-medium text-slate-900">
              আমি তাহার সর্বাঙ্গীন মঙ্গল ও উত্তরোত্তর সমৃদ্ধি কামনা করি।
            </div>
          </div>

          {/* Footer Signatures & QR Verification Anchor */}
          <div className="mt-16 pt-8 border-t border-slate-300">
            <div className="grid grid-cols-12 items-end justify-between gap-4">
              
              {/* Left: QR Code Verification */}
              <div className="col-span-4 flex flex-col items-start justify-end space-y-1">
                {certificate.qrCodeUrl ? (
                  <img 
                    src={certificate.qrCodeUrl} 
                    alt="QR Verification" 
                    className="w-24 h-24 border border-emerald-800 p-1 rounded bg-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 border border-emerald-800 bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 text-center">
                    কিউআর কোড
                  </div>
                )}
                <p className="text-[10px] font-bold text-emerald-950">
                  ডিজিটাল সত্যতা যাচাইকরণের জন্য স্ক্যান করুন
                </p>
                <p className="text-[9px] font-mono text-slate-500">
                  baheratailup.gov.bd/verify/{certificate.memoNo}
                </p>
              </div>

              {/* Center: Official Seal */}
              <div className="col-span-4 text-center flex flex-col items-center justify-end">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-center p-2 text-[10px] font-bold text-emerald-900 bg-emerald-50/50">
                  {config.sealText}
                </div>
                <p className="text-[10px] font-semibold text-slate-600 mt-1">ইউনিয়ন পরিষদ সিল</p>
              </div>

              {/* Right: Chairman Signature */}
              <div className="col-span-4 text-right space-y-1">
                <div className="h-12 flex items-end justify-end">
                  {/* Digital Signature representation */}
                  <span className="font-serif italic text-emerald-900 font-extrabold text-sm border-b border-emerald-900 px-4">
                    {config.chairmanName}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{config.chairmanName}</p>
                <p className="text-[11px] font-semibold text-emerald-900">{config.chairmanTitle}</p>
                <p className="text-[10px] text-slate-600">{config.upName}</p>
                <p className="text-[10px] text-slate-600">{config.upazila}, {config.district}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
