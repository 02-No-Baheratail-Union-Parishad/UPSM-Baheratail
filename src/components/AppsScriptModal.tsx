import React, { useState } from 'react';
import { Code, Copy, Check, X, FileCode, ExternalLink } from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const codeGsContent = `/**
 * Project: Union Parishad Digital Automation System
 * File: Code.gs
 * Target: 02নং বহেড়াতৈল ইউনিয়ন পরিষদ, সখিপুর, টাঙ্গাইল
 */

const CONFIG = {
  TEMPLATE_DOC_ID: '1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4', 
  TARGET_FOLDER_ID: '1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU',
  SHEET_ID: '1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q',
  GEMINI_MODEL: 'gemini-1.5-flash',
  
  UP_NAME: "০২নং বহেড়াতৈল ইউনিয়ন পরিষদ",
  LOCATION: "সখিপুর, টাঙ্গাইল",
  CHAIRMAN_NAME: "মোশারফ হোসেন (হিরো মিয়া)",
  CHAIRMAN_TITLE: "প্যানেল চেয়ারম্যান - ০১",
  SECRETARY_NAME: "মোঃ সাইদুজ্জামান",
  SECRETARY_TITLE: "ইউনিয়ন পরিষদ প্রশাসনিক কর্মকর্তা"
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
    const memoNo = generateMemoNumber();
    const issueDate = convertToBengaliNum(new Date().toLocaleDateString('bn-BD'));

    const replacements = {
      '{{body_text}}': aiDescription,
      '{{নাম}}': citizenData.name,
      '{{পিতার_নাম}}': citizenData.father || '',
      '{{মাতার_নাম}}': citizenData.mother || '',
      '{{গ্রাম}}': citizenData.village,
      '{{ওয়ার্ড_নং}}': convertToBengaliNum(citizenData.ward || '০৫'),
      '{{সনদ_নং}}': convertToBengaliNum(memoNo),
      '{{ইস্যুর_তারিখ}}': issueDate,
      '{{NID_Birth_No}}': convertToBengaliNum(citizenData.nid || citizenData.birthNo || ''),
      '{{চেয়ারম্যান_নাম}}': CONFIG.CHAIRMAN_NAME,
      '{{সচিব_নাম}}': CONFIG.SECRETARY_NAME
    };

    for (let key in replacements) {
      body.replaceText(key, replacements[key]);
    }

    doc.saveAndClose();
    const pdfBlob = newDocFile.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(pdfBlob);
    
    return { success: true, url: pdfFile.getUrl(), memo: memoNo };
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

  const handleCopy = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-lg">Google Apps Script কোড ও ইন্টিগ্রেশন গাইড</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-2">
              <span>🚀 গুগল অ্যাপস স্ক্রিপ্ট (Google Apps Script) এ কীভাবে কানেক্ট করবেন?</span>
            </h4>
            <ol className="list-decimal list-inside text-xs space-y-1 text-emerald-800">
              <li>একটি নতুন Google Sheet খুলে <b>Extensions &gt; Apps Script</b> নির্বাচন করুন।</li>
              <li>নিচের <b>Code.gs</b> এবং <b>Gemini.gs</b> কোডগুলো নিজ নিজ ফাইলে কপি করুন।</li>
              <li>Project Settings-এ গিয়ে Script Property হিসেবে <code className="bg-emerald-200 px-1 rounded font-mono">GEMINI_API_KEY</code> সেট করুন।</li>
              <li><b>Deploy &gt; New Deployment &gt; Web App</b> নির্বাচন করে প্রকাশ করুন।</li>
            </ol>
          </div>

          {/* Code.gs Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-700" /> Code.gs
              </span>
              <button
                onClick={() => handleCopy(codeGsContent, 'Code.gs')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border transition cursor-pointer"
              >
                {copiedFile === 'Code.gs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === 'Code.gs' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
              {codeGsContent}
            </pre>
          </div>

          {/* Gemini.gs Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-700" /> Gemini.gs
              </span>
              <button
                onClick={() => handleCopy(geminiGsContent, 'Gemini.gs')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border transition cursor-pointer"
              >
                {copiedFile === 'Gemini.gs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile === 'Gemini.gs' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
              {geminiGsContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>script.google.com এ যান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
