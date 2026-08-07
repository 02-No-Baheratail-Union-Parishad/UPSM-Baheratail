import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  X, 
  Code, 
  BookOpen, 
  Table, 
  ExternalLink, 
  Layers, 
  FileCode, 
  Sparkles,
  Printer,
  CheckCircle2
} from 'lucide-react';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'placeholders' | 'code' | 'steps' | 'dynamic_tables'>('placeholders');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedDynamicCategory, setSelectedDynamicCategory] = useState<string>('birth_correction');

  if (!isOpen) return null;

  const dynamicTemplatesData = {
    templates: {
      birth_correction: {
        title: "জন্ম সনদ সংশোধন",
        columns: ["সংশোধনীয় বিষয়", "ভুল তথ্য", "সঠিক তথ্য"]
      },
      name_correction: {
        title: "নাম বানান সংশোধন",
        columns: ["ক্রমিক নং", "বিবরণ", "ভুল তথ্য", "সঠিক তথ্য"]
      },
      general_affidavit: {
        title: "সাধারণ হলফনামা",
        columns: ["বিবরণ", "তথ্যের ধরণ", "মন্তব্য"]
      },
      warisan_certificate: {
        title: "ওয়ারিশান সনদ",
        columns: ["নাম", "সম্পর্ক", "বয়স", "জাতীয় পরিচয়পত্র নং"]
      }
    }
  };

  const dynamicRenderFunctionJs = `// এডমিন প্যানেলের সিলেক্ট বক্সের জন্য ফাংশন
function renderDynamicTable(category) {
    const data = ${JSON.stringify(dynamicTemplatesData, null, 2)};
    const template = data.templates[category];
    if (!template) return;
    
    let tableHTML = \`<h5 class="font-bold text-emerald-950 mb-2 text-sm">\${template.title}</h5>\`;
    tableHTML += \`<table class="table table-bordered w-full text-xs text-left border border-slate-300"><thead class="bg-emerald-800 text-white font-bold"><tr>\`;
    
    // কলাম হেডার তৈরি
    template.columns.forEach(col => {
        tableHTML += \`<th class="p-2 border border-emerald-700">\${col}</th>\`;
    });
    
    tableHTML += \`</tr></thead><tbody><tr>\`;
    
    // ইনপুট ফিল্ড তৈরি
    template.columns.forEach(() => {
        tableHTML += \`<td class="p-1.5 border border-slate-300"><input type="text" class="form-control w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs" placeholder="তথ্য লিখুন"></td>\`;
    });
    
    tableHTML += \`</tr></tbody></table>\`;
    
    document.getElementById('dynamicTableContainer').innerHTML = tableHTML;
}`;

  const placeholders = [
    { tag: '{{name}}', alias: '{{নাম}}', desc: 'আবেদনকারীর পূর্ণ নাম (Bangla / English)', example: 'মোঃ আব্দুর রহিম', required: true },
    { tag: '{{memoNo}}', alias: '{{সনদ_নং}}', desc: 'ইউনিক স্মারক / সনদ নম্বর', example: 'BUP-2026-0891', required: true },
    { tag: '{{qrCodeUrl}}', alias: '{{QR_CODE}}', desc: 'অনলাইন সনাক্তকরণ QR কোড ইউআরএল / ইমেজ', example: 'https://ais-dev-.../verify?memo=BUP-2026-0891', required: true },
    { tag: '{{body_text}}', alias: '{{দাপ্তরিক_বিবরণী}}', desc: 'Gemini AI দ্বারা জেনারেটেড ৪-৬ লাইনের আনুষ্ঠানিক দাপ্তরিক বিবরণী', example: 'এই মর্মে প্রত্যয়ন করা যাইতেছে যে...', required: true },
    { tag: '{{fatherName}}', alias: '{{পিতার_নাম}}', desc: 'পিতা বা স্বামীর নাম', example: 'মোঃ আব্দুল করিম', required: false },
    { tag: '{{motherName}}', alias: '{{মাতার_নাম}}', desc: 'মাতার নাম', example: 'মোছাঃ ফাতেমা বেগম', required: false },
    { tag: '{{village}}', alias: '{{গ্রাম}}', desc: 'স্থায়ী বাসস্থান / গ্রাম', example: 'বহেড়াতৈল', required: false },
    { tag: '{{wardNo}}', alias: '{{ওয়ার্ড_নং}}', desc: 'ইউনিয়ন পরিষদের ওয়ার্ড নম্বর', example: '০৫', required: false },
    { tag: '{{nidNo}}', alias: '{{NID_Birth_No}}', desc: 'জাতীয় পরিচয়পত্র বা জন্ম নিবন্ধন নম্বর', example: '19929315784000123', required: false },
    { tag: '{{issueDate}}', alias: '{{ইস্যুর_তারিখ}}', desc: 'সনদ ডাউনলোড বা ইস্যুর বাংলা তারিখ', example: '০৭ আগস্ট, ২০২৬', required: false },
    { tag: '{{certType}}', alias: '{{প্রত্যয়নপত্রের_ধরন}}', desc: 'প্রত্যয়নপত্রের শিরোনাম বা ধরন (৪০+ ক্যাটাগরি)', example: 'নাগরিকত্ব সনদপত্র', required: false },
    { tag: '{{chairmanName}}', alias: '{{চেয়ারম্যান_নাম}}', desc: 'ইউপি চেয়ারম্যান / প্যানেল চেয়ারম্যানের নাম', example: 'মোশারফ হোসেন (হিরো মিয়া)', required: false },
    { tag: '{{secretaryName}}', alias: '{{সচিব_নাম}}', desc: 'ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তার নাম', example: 'মোঃ সাইদুইজ্জামান', required: false }
  ];

  const codeGsContent = `/**
 * Project: Union Parishad Digital Automation System
 * File: Code.gs
 * Purpose: Automated Google Doc Template Population & PDF Generation
 */

const CONFIG = {
  TEMPLATE_DOC_ID: 'YOUR_GOOGLE_DOC_TEMPLATE_ID', // Replace with your Google Doc Template ID
  TARGET_FOLDER_ID: 'YOUR_TARGET_DRIVE_FOLDER_ID', // Replace with your Drive Folder ID
  GEMINI_MODEL: 'gemini-1.5-flash',
  
  UP_NAME: "০২নং বহেড়াতৈল ইউনিয়ন পরিষদ",
  LOCATION: "সখিপুর, টাঙ্গাইল",
  CHAIRMAN_NAME: "মোশারফ হোসেন (হিরো মিয়া)",
  SECRETARY_NAME: "মোঃ সাইদুজ্জামান"
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = generateCertificateDoc(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function generateCertificateDoc(citizenData) {
  try {
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
    const folder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    
    const memoNo = citizenData.memoNo || ("BUP-" + Date.now());
    const newDocFile = templateFile.makeCopy("Certificate_" + memoNo, folder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    const replacements = {
      '{{name}}': citizenData.name || '',
      '{{নাম}}': citizenData.name || '',
      '{{memoNo}}': memoNo,
      '{{সনদ_নং}}': memoNo,
      '{{qrCodeUrl}}': citizenData.qrCodeUrl || '',
      '{{QR_CODE}}': citizenData.qrCodeUrl || '',
      '{{body_text}}': citizenData.bodyText || '',
      '{{fatherName}}': citizenData.father || '',
      '{{পিতার_নাম}}': citizenData.father || '',
      '{{motherName}}': citizenData.mother || '',
      '{{মাতার_নাম}}': citizenData.mother || '',
      '{{village}}': citizenData.village || '',
      '{{গ্রাম}}': citizenData.village || '',
      '{{wardNo}}': citizenData.ward || '',
      '{{ওয়ার্ড_নং}}': citizenData.ward || '',
      '{{nidNo}}': citizenData.nid || citizenData.birthNo || '',
      '{{NID_Birth_No}}': citizenData.nid || citizenData.birthNo || '',
      '{{issueDate}}': citizenData.issueDate || new Date().toLocaleDateString('bn-BD'),
      '{{certType}}': citizenData.type || 'নাগরিকত্ব সনদপত্র',
      '{{chairmanName}}': CONFIG.CHAIRMAN_NAME,
      '{{secretaryName}}': CONFIG.SECRETARY_NAME
    };

    for (let key in replacements) {
      body.replaceText(key, replacements[key]);
    }

    doc.saveAndClose();
    const pdfBlob = newDocFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob);
    
    return { 
      success: true, 
      pdfUrl: pdfFile.getUrl(), 
      downloadUrl: pdfFile.getDownloadUrl(),
      memo: memoNo 
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}`;

  const handleCopyTag = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                <span>Google Doc টেমপ্লেট ও অ্যাপস স্ক্রিপ্ট ম্যানেজমেন্ট</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded">
                  TemplateManager
                </span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                গুগল ডক টেমপ্লেট প্লেসহোল্ডার ডিকশনারি ও অটোমেটেড পিডিএফ প্রিন্টিং ইন্টিগ্রেশন ধাপসমূহ
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-emerald-200 hover:text-white p-2 rounded-full hover:bg-emerald-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100 px-4 pt-3 pb-0 border-b border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('placeholders')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'placeholders'
                ? 'bg-white text-emerald-950 border-slate-200 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-700" />
            <span>১. প্লেসহোল্ডার ম্যাপিং টেবিল</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'code'
                ? 'bg-white text-emerald-950 border-slate-200 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Code className="w-4 h-4 text-emerald-700" />
            <span>২. Apps Script Code.gs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'steps'
                ? 'bg-white text-emerald-950 border-slate-200 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>৩. ইনস্টলেশন ও অটোমেশন ধাপসমূহ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dynamic_tables')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'dynamic_tables'
                ? 'bg-white text-emerald-950 border-slate-200 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>৪. ডায়নামিক সনদ টেবিল টেমপ্লেট</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 bg-slate-50/50">

          {/* TAB 1: MAPPING TABLE */}
          {activeTab === 'placeholders' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Google Doc টেমপ্লেটে এই ডায়নামিক প্লেসহোল্ডার ভ্যারিয়েবলগুলো ব্যবহার করুন:</span>
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  আপনার অফিসিয়াল প্যাডের Google Doc ফাইলে কার্লি ব্র্যাকেটে যেমন <code className="bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-950">{"{{name}}"}</code>, <code className="bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-950">{"{{memoNo}}"}</code>, <code className="bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-950">{"{{qrCodeUrl}}"}</code> বসিয়ে দিন। সিস্টেম থেকে ক্লিক করার সাথে সাথে সরাসরি আসল ডাটা ডকে বসে কপি তৈরি হয়ে যাবে।
                </p>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                      <th className="p-3">প্লেসহোল্ডার ট্যাগ</th>
                      <th className="p-3">বাংলা অল্টারনেটিভ</th>
                      <th className="p-3">বিবরণ</th>
                      <th className="p-3">উদাহরণ ডাটা</th>
                      <th className="p-3 text-center">কপি করুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {placeholders.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-black text-indigo-900">
                          <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-md inline-block">
                            {p.tag}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-900">
                          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md inline-block">
                            {p.alias}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{p.desc}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{p.example}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopyTag(p.tag)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-300 active:scale-95"
                          >
                            {copiedTag === p.tag ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-extrabold">কপি হয়েছে!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>কপি</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CODE GS */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-4 rounded-xl text-xs">
                <span className="font-bold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Google Apps Script - Code.gs স্ক্রিপ্ট</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeGsContent, 'Code.gs')}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 transition cursor-pointer"
                >
                  {copiedCode === 'Code.gs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'Code.gs' ? 'কপি হয়েছে' : 'Code.gs কপি করুন'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800 shadow-inner">
                {codeGsContent}
              </pre>
            </div>
          )}

          {/* TAB 3: STEP BY STEP STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ১: Google Doc টেমপ্লেট প্রস্তুত করুন</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-1">
                  <li>একটি Google Doc ফাইলে ইউনিয়নের প্যাড, হেডার ও সিল ডিজাইন করুন।</li>
                  <li>লেখাগুলিতে ডায়নামিক ডাটা বসাতে <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{name}}"}</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{memoNo}}"}</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{qrCodeUrl}}"}</code> বসান।</li>
                  <li>ডকের URL হতে <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-950 font-bold">docs.google.com/document/d/[ID_HERE]/edit</code> অংশটি সংরক্ষণ করুন।</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ২: Google Apps Script এ ওয়েব অ্যাপ তৈরি</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-1">
                  <li>Google Sheet হতে <b>Extensions &gt; Apps Script</b> নির্বাচন করুন।</li>
                  <li>Code.gs ফাইলে ওপরের স্ক্রিপ্টটি পেস্ট করুন এবং <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-900">TEMPLATE_DOC_ID</code> বসিয়ে দিন।</li>
                  <li><b>Deploy &gt; New Deployment</b> থেকে Web App নির্বাচন করে Access: <b>Anyone</b> দিয়ে সেভ করুন।</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ৩: স্বয়ংক্রিয় পিডিএফ জেনারেশন ও প্রিন্টিং</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  ওয়েব অ্যাপের প্রস্তুতকৃত ইউআরএলটি ইউনিয়নের অ্যাডমিন সেটিংস প্যানেলে কনফিগার করলেই প্রতিটি সনদ তৈরির সময় স্বয়ংক্রিয়ভাবে Google Doc কপি হয়ে PDF লিঙ্ক তৈরি হবে।
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DYNAMIC CERTIFICATE TABLES */}
          {activeTab === 'dynamic_tables' && (
            <div className="space-y-6">
              {/* Category Selector & Live HTML Preview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>লাইভ ডায়নামিক টেবিল রেন্ডারার প্রেভিউ (renderDynamicTable)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      সিলেক্ট বক্স থেকে যেকোনো ক্যাটাগরি বেছে নিয়ে টেবিলের লাইভ কলাম স্ট্রাকচার পরীক্ষা করুন:
                    </p>
                  </div>

                  <div className="w-full sm:w-auto">
                    <select
                      value={selectedDynamicCategory}
                      onChange={(e) => setSelectedDynamicCategory(e.target.value)}
                      className="w-full sm:w-64 px-3 py-2 bg-emerald-900 text-white font-extrabold text-xs rounded-xl border border-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                      <option value="birth_correction">১. birth_correction (জন্ম সনদ সংশোধন)</option>
                      <option value="name_correction">২. name_correction (নাম বানান সংশোধন)</option>
                      <option value="general_affidavit">৩. general_affidavit (সাধারণ হলফনামা)</option>
                      <option value="warisan_certificate">৪. warisan_certificate (ওয়ারিশান সনদ)</option>
                    </select>
                  </div>
                </div>

                {/* Rendered Live Table Output Container */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      #dynamicTableContainer
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Live HTML Output
                    </span>
                  </div>

                  {(() => {
                    const template = (dynamicTemplatesData.templates as any)[selectedDynamicCategory];
                    if (!template) return null;
                    return (
                      <div className="space-y-2">
                        <h5 className="font-bold text-emerald-950 text-sm">{template.title}</h5>
                        <div className="overflow-x-auto rounded-lg border border-slate-300">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-emerald-800 text-white font-bold">
                              <tr>
                                {template.columns.map((col: string, idx: number) => (
                                  <th key={idx} className="p-2.5 border-r border-emerald-700 last:border-r-0 whitespace-nowrap">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              <tr>
                                {template.columns.map((col: string, idx: number) => (
                                  <td key={idx} className="p-2 border-r border-slate-200 last:border-r-0">
                                    <input
                                      type="text"
                                      placeholder={`${col} লিখুন...`}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:border-emerald-600 focus:outline-none"
                                    />
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* JSON Data & Code Blocks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. JSON Configuration Structure */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      <span>১. JSON Configuration Structure</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(JSON.stringify(dynamicTemplatesData, null, 2), 'JSON')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold rounded border border-slate-700 transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedCode === 'JSON' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'JSON' ? 'কপি হয়েছে' : 'JSON কপি'}</span>
                    </button>
                  </div>
                  <pre className="text-emerald-300 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {JSON.stringify(dynamicTemplatesData, null, 2)}
                  </pre>
                </div>

                {/* 2. Admin Panel Render Function */}
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <Code className="w-4 h-4" />
                      <span>২. renderDynamicTable(category) Function</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(dynamicRenderFunctionJs, 'JS')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold rounded border border-slate-700 transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedCode === 'JS' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'JS' ? 'কপি হয়েছে' : 'JS কপি'}</span>
                    </button>
                  </div>
                  <pre className="text-amber-200 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                    {dynamicRenderFunctionJs}
                  </pre>
                </div>
              </div>

              {/* Documentation Guide & Future Scope */}
              <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 space-y-3">
                <h4 className="font-black text-sm text-amber-300 border-b border-emerald-800 pb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Certificate Dynamic System Implementation & Future Scope Guide</span>
                </h4>
                <div className="text-xs text-emerald-100 space-y-2 leading-relaxed">
                  <p>
                    <strong>১. JSON Structure:</strong> <code className="text-amber-200">templates</code> অবজেক্টের ভেতর যেকোনো নতুন ক্যাটাগরি আইডি (যেমন: <code className="text-amber-200">birth_correction</code>, <code className="text-amber-200">name_correction</code>, <code className="text-amber-200">general_affidavit</code>, <code className="text-amber-200">warisan_certificate</code>) যোগ করা মাত্রই সিস্টেমে সরাসরি কার্যকর হবে।
                  </p>
                  <p>
                    <strong>২. Column Control:</strong> <code className="text-amber-200">columns</code> অ্যারেতে নতুন কলামের নাম লিখলেই সেটি অটোমেটিক এডমিন প্যানেল এবং সনদ জেনারেশন ফর্মে ইনপুট ফিল্ড হিসেবে ডাইনামিক্যালি তৈরি হয়ে যাবে।
                  </p>
                  <p>
                    <strong>৩. Rendering:</strong> <code className="text-amber-200">renderDynamicTable(category)</code> ফাংশনটি কল করলেই সিলেক্টেড ক্যাটাগরি অনুযায়ী UI তাৎক্ষণিকভাবে আপডেট হয়ে যাবে।
                  </p>
                  <div className="pt-2 border-t border-emerald-800/80 text-[11px] text-emerald-300 flex items-center gap-4 flex-wrap">
                    <span className="font-extrabold text-amber-300">Future Scope Support:</span>
                    <span>• কলামে ডাইনামিক ড্রপডাউন যুক্ত করা</span>
                    <span>• টেবিলের সারি (Row) ডিলিট বা নতুন যোগ করার বাটন রাখা</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 transition"
          >
            <span>script.google.com এ যান (Google Apps Script)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
