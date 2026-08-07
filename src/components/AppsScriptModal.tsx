import React, { useState } from 'react';
import { Code, Copy, Check, X, FileCode, ExternalLink, FileText, Table, BookOpen, Layers } from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'placeholders' | 'code' | 'guide'>('placeholders');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const placeholders = [
    { tag: '{{name}}', alias: '{{নাম}}', desc: 'আবেদনকারীর পূর্ণ নাম', example: 'মোঃ আব্দুর রহিম' },
    { tag: '{{memoNo}}', alias: '{{সনদ_নং}}', desc: 'ইউনিক মেমো / ট্র্যাকিং নম্বর', example: 'BUP-2026-4891' },
    { tag: '{{qrCodeUrl}}', alias: '{{QR_CODE}}', desc: 'অনলাইন সনাক্তকরণ QR কোড লিঙ্ক / ইমেজ', example: 'https://ais-dev-.../verify?memo=BUP-2026-4891' },
    { tag: '{{body_text}}', alias: '{{দাপ্তরিক_বিবরণী}}', desc: 'Gemini AI দ্বারা জেনারেটেড ৪-৬ লাইনের বাংলা দাপ্তরিক বিবরণী', example: 'এই মর্মে প্রত্যয়ন করা যাইতেছে যে...' },
    { tag: '{{fatherName}}', alias: '{{পিতার_নাম}}', desc: 'পিতা বা স্বামীর নাম', example: 'মোঃ আব্দুল করিম' },
    { tag: '{{motherName}}', alias: '{{মাতার_নাম}}', desc: 'মাতার নাম', example: 'মোছাঃ ফাতেমা বেগম' },
    { tag: '{{village}}', alias: '{{গ্রাম}}', desc: 'স্থায়ী বাসস্থান / গ্রাম', example: 'বহেড়াতৈল' },
    { tag: '{{wardNo}}', alias: '{{ওয়ার্ড_নং}}', desc: 'ইউনিয়ন পরিষদের ওয়ার্ড নম্বর', example: '০৫' },
    { tag: '{{nidNo}}', alias: '{{NID_Birth_No}}', desc: 'জাতীয় পরিচয়পত্র বা জন্ম নিবন্ধন নম্বর', example: '19929315784000123' },
    { tag: '{{issueDate}}', alias: '{{ইস্যুর_তারিখ}}', desc: 'সনদ ডাউনলোড বা ইস্যুর বাংলা তারিখ', example: '০৭ আগস্ট, ২০২৬' },
    { tag: '{{certType}}', alias: '{{প্রত্যয়নপত্রের_ধরন}}', desc: 'প্রত্যয়নপত্রের শিরোনাম বা ধরন', example: 'নাগরিকত্ব সনদপত্র' },
    { tag: '{{chairmanName}}', alias: '{{চেয়ারম্যান_নাম}}', desc: 'ইউপি চেয়ারম্যান / প্যানেল চেয়ারম্যানের নাম', example: 'মোশারফ হোসেন (হিরো মিয়া)' },
    { tag: '{{secretaryName}}', alias: '{{সচিব_নাম}}', desc: 'ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তার নাম', example: 'মোঃ সাইদুজ্জামান' }
  ];

  const codeGsContent = `/**
 * Project: Union Parishad Digital Automation System
 * File: Code.gs
 * Target: 02নং বহেড়াতৈল ইউনিয়ন পরিষদ, সখিপুর, টাঙ্গাইল
 */

const CONFIG = {
  TEMPLATE_DOC_ID: 'YOUR_GOOGLE_DOC_TEMPLATE_ID', 
  TARGET_FOLDER_ID: 'YOUR_TARGET_DRIVE_FOLDER_ID',
  GEMINI_MODEL: 'gemini-1.5-flash',
  
  UP_NAME: "০২নং বহেড়াতৈল ইউনিয়ন পরিষদ",
  LOCATION: "সখিপুর, টাঙ্গাইল",
  CHAIRMAN_NAME: "মোশারফ হোসেন (হিরো মিয়া)",
  SECRETARY_NAME: "মোঃ সাইদুজ্জামান"
};

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
      .setTitle(CONFIG.UP_NAME + ' - ডিজিটাল প্রত্যয়ন সেবা')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateCertificate(citizenData) {
  try {
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
    const folder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    
    const fileName = \`\${citizenData.type}_\${citizenData.name}_\${new Date().getTime()}\`;
    const newDocFile = templateFile.makeCopy(fileName, folder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    const aiDescription = callGeminiAI(citizenData);
    const memoNo = citizenData.memoNo || generateMemoNumber();
    const issueDate = convertToBengaliNum(new Date().toLocaleDateString('bn-BD'));

    // Google Doc Placeholder Mapping Table
    const replacements = {
      '{{name}}': citizenData.name,
      '{{নাম}}': citizenData.name,
      '{{memoNo}}': memoNo,
      '{{সনদ_নং}}': memoNo,
      '{{qrCodeUrl}}': citizenData.qrCodeUrl || '',
      '{{QR_CODE}}': citizenData.qrCodeUrl || '',
      '{{body_text}}': aiDescription,
      '{{fatherName}}': citizenData.father || '',
      '{{পিতার_নাম}}': citizenData.father || '',
      '{{motherName}}': citizenData.mother || '',
      '{{মাতার_নাম}}': citizenData.mother || '',
      '{{village}}': citizenData.village || '',
      '{{গ্রাম}}': citizenData.village || '',
      '{{wardNo}}': convertToBengaliNum(citizenData.ward || '০৫'),
      '{{ওয়ার্ড_নং}}': convertToBengaliNum(citizenData.ward || '০৫'),
      '{{nidNo}}': convertToBengaliNum(citizenData.nid || citizenData.birthNo || ''),
      '{{NID_Birth_No}}': convertToBengaliNum(citizenData.nid || citizenData.birthNo || ''),
      '{{issueDate}}': issueDate,
      '{{ইস্যুর_তারিখ}}': issueDate,
      '{{certType}}': citizenData.type || 'নাগরিকত্ব সনদপত্র',
      '{{চেয়ারম্যান_নাম}}': CONFIG.CHAIRMAN_NAME,
      '{{সচিব_নাম}}': CONFIG.SECRETARY_NAME
    };

    for (let key in replacements) {
      body.replaceText(key, replacements[key]);
    }

    doc.saveAndClose();
    const pdfBlob = newDocFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob);
    
    return { success: true, url: pdfFile.getUrl(), memo: memoNo, pdfUrl: pdfFile.getDownloadUrl() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function convertToBengaliNum(num) {
  if (!num) return '';
  const map = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
  return num.toString().replace(/[0-9]/g, w => map[w]);
}

function generateMemoNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return \`BUP-\${year}-\${random}\`;
}`;

  const geminiGsContent = `/**
 * File: Gemini.gs
 */
function callGeminiAI(data) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  
  if (!apiKey) return "ত্রুটি: Gemini API Key কনফিগার করা নেই।";

  const apiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKey}\`;

  const prompt = \`
    তুমি একজন দক্ষ সরকারি দাপ্তরিক লেখক। নিচের তথ্যগুলো ব্যবহার করে একটি "\${data.type}" এর জন্য ৪-৫ লাইনের একটি অত্যন্ত মার্জিত এবং আনুষ্ঠানিক বিবরণী বাংলা ভাষায় লেখো।
    বিবরণীটি এমনভাবে শুরু করো যেন তা প্রত্যয়নপত্রের মূল অংশ হিসেবে সরাসরি ব্যবহার করা যায়।
    
    নাগরিকের তথ্য:
    নাম: \${data.name}
    পিতা/স্বামী: \${data.father}
    মাতা: \${data.mother}
    গ্রাম: \${data.village}, ডাকঘর: বহেড়াতৈল, ওয়ার্ড: \${data.ward || '০৫'}
    উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।
    
    শর্তাবলী:
    ১. বাক্য শুরু করো এভাবে: "এই মর্মে প্রত্যয়ন করা যাইতেছে যে..."
    ২. কোনো ভূমিকা বা উপসংহার লিখবে না।
    ৩. দাপ্তরিক গাম্ভীর্য বজায় রাখো।
    ৪. সকল সংখ্যা বাংলা হরফে (০, ১, ২...) লেখো।
  \`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(payload), muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const result = JSON.parse(response.getContentText());
    if (result.candidates && result.candidates[0].content) {
      return result.candidates[0].content.parts[0].text.trim();
    }
    return "এআই বিবরণী তৈরিতে ব্যর্থ হয়েছে।";
  } catch (e) {
    return "এআই সংযোগ ত্রুটি: " + e.toString();
  }
}`;

  const handleCopyTag = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const handleCopyCode = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>গুগল ডক টেমপ্লেট প্লেসহোল্ডার ও Apps Script কানেক্টর</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded">
                  Guided Guide
                </span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Google Doc-এ টেমপ্লেট ডিজাইন, প্লেসহোল্ডার ম্যাপিং ও স্বয়ংক্রিয় সনদ প্রিন্টিং সেটআপ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-emerald-200 hover:text-white p-2 rounded-full hover:bg-emerald-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
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
            <span>১. Google Doc প্লেসহোল্ডার ম্যাপিং</span>
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
            <span>২. Apps Script কোড ফাইলসমূহ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-950 border-slate-200 shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>৩. ধাপভিত্তিক সেটআপ নির্দেশিকা</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 bg-slate-50/50">
          
          {/* TAB 1: PLACEHOLDER MAPPING TABLE */}
          {activeTab === 'placeholders' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Google Doc টেমপ্লেটে এই প্লেসহোল্ডারগুলো ব্যবহার করুন:</span>
                </h4>
                <p className="text-xs text-emerald-800">
                  আপনার অফিসিয়াল Google Doc প্রত্যয়নপত্র ফরম্যাটে ডাবল কার্লি ব্র্যাকেটে <code className="bg-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-950">{"{{name}}"}</code> বা বাংলা নাম বসিয়ে দিন। সিস্টেমে ক্লিক করার সাথে সাথে এই প্লেসহোল্ডারগুলো আসল ডাটা দিয়ে প্রতিস্থাপিত হয়ে যাবে।
                </p>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-200">
                      <th className="p-3">প্লেসহোল্ডার ট্যাগ</th>
                      <th className="p-3">বাংলা অল্টারনেটিভ ট্যাগ</th>
                      <th className="p-3">বিবরণ</th>
                      <th className="p-3">উদাহরণ ডাটা</th>
                      <th className="p-3 text-center">কপি করুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {placeholders.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-black text-indigo-900">
                          <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-md">
                            {p.tag}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-900">
                          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                            {p.alias}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{p.desc}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">{p.example}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleCopyTag(p.tag)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-slate-300"
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

          {/* TAB 2: APPS SCRIPT CODE FILES */}
          {activeTab === 'code' && (
            <div className="space-y-5">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  <span>Google Apps Script-এ ২টি কোড ফাইল তৈরি করুন</span>
                </p>
                <p className="text-slate-300">
                  নিচের কোডগুলো আপনার গুগল শিটের <strong>Extensions &gt; Apps Script</strong> এডিটর-এ তৈরি করুন।
                </p>
              </div>

              {/* Code.gs Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <FileCode className="w-4 h-4 text-emerald-700" /> Code.gs (প্রধান সার্ভিস ফাইল)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(codeGsContent, 'Code.gs')}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition cursor-pointer"
                  >
                    {copiedFile === 'Code.gs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'Code.gs' ? 'কপি হয়েছে' : 'কপি Code.gs'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                  {codeGsContent}
                </pre>
              </div>

              {/* Gemini.gs Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <FileCode className="w-4 h-4 text-emerald-700" /> Gemini.gs (AI জেনারেশন স্ক্রিপ্ট)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(geminiGsContent, 'Gemini.gs')}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition cursor-pointer"
                  >
                    {copiedFile === 'Gemini.gs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile === 'Gemini.gs' ? 'কপি হয়েছে' : 'কপি Gemini.gs'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-amber-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                  {geminiGsContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: STEP BY STEP SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ১: Google Doc টেমপ্লেট প্রস্তুতকরণ</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>Google Drive-এ একটি নতুন Google Doc খুলুন এবং আপনার ইউনিয়নের লোগো, শিরোনাম ও প্যাড ডিজাইন করুন।</li>
                  <li>যেসব স্থানে গতিশীল ডাটা বসবে সেখানে <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{name}}"}</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{memoNo}}"}</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{"{{qrCodeUrl}}"}</code> বসান।</li>
                  <li>Doc-এর URL থেকে ID অংশটি কপি করে রাখুন (যেমন: docs.google.com/document/d/<b>TEMPLATE_DOC_ID</b>/edit)।</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ২: Google Apps Script এডিটর খোলা</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>একটি Google Sheet খুলে মেনুবার হতে <b>Extensions &gt; Apps Script</b> চাপুন।</li>
                  <li>বামপাশের <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-900">+</code> আইকনে চাপ দিয়ে <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">Code.gs</code> এবং <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">Gemini.gs</code> নামে ২টি ফাইল তৈরি করুন।</li>
                  <li>ট্যাব ২ থেকে প্রাপ্ত কোডগুলো হুবহু ফাইলদ্বয়ে কপি-পেস্ট করুন এবং <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">TEMPLATE_DOC_ID</code> পরিবর্তন করুন।</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Layers className="w-5 h-5 text-emerald-700" />
                  <span>ধাপ ৩: Gemini API Key ও Web App প্রকাশকরণ</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>Apps Script এডিটরের ⚙️ <b>Project Settings &gt; Script Properties</b> অপশনে যান।</li>
                  <li>নতুন Property যোগ করুন: Name = <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">GEMINI_API_KEY</code>, Value = আপনার Gemini API Key।</li>
                  <li>উপরে <b>Deploy &gt; New Deployment</b> চাপুন &rarr; Select type: <b>Web App</b> &rarr; Execute as: <b>Me</b> &rarr; Who has access: <b>Anyone</b> দিয়ে প্রকাশ করুন।</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
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

