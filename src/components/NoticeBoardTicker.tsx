import React, { useState } from 'react';
import { 
  Bell, 
  Megaphone, 
  Calendar, 
  Pin, 
  FileText, 
  ChevronRight, 
  Plus, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Building2, 
  Award, 
  AlertCircle 
} from 'lucide-react';
import { UnionParishadConfig } from '../types';

interface NoticeBoardTickerProps {
  config: UnionParishadConfig;
}

interface NoticeItem {
  id: string;
  title: string;
  category: 'জরুরি নোটিশ' | 'ভিজিএফ ও সামাজিক ভাতা' | 'বাজেট ও কর' | 'জন্ম নিবন্ধন' | 'প্রশাসনিক';
  date: string;
  content: string;
  isPinned: boolean;
  publishedBy: string;
}

export const NoticeBoardTicker: React.FC<NoticeBoardTickerProps> = ({ config }) => {
  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'n1',
      title: '২০২৬-২০২৭ অর্থ বছরের উন্মুক্ত বাজেট ঘোষণা ও প্রাক-বাজেট আলোচনা সভা',
      category: 'বাজেট ও কর',
      date: '০৫ আগস্ট ২০২৬',
      content: `এতদ্বারা ${config.upName}-এর সর্বসাধারণের অবগতির জন্য জানানো যাইতেছে যে, আগামী ১০ আগস্ট ২০২৬ খ্রিঃ রোজ সোমবার সকাল ১০:০০ ঘটিকায় ইউনিয়ন পরিষদ মিলনায়তনে উন্মুক্ত বাজেট সভা অনুষ্ঠিত হইবে। উক্ত সভায় নাগরিক মতামত প্রদানের জন্য চেয়ারম্যান মহোদয় সকলকে উপস্থিত থাকিবার জন্য বিশেষ অনুরোধ জানিয়েছেন।`,
      isPinned: true,
      publishedBy: config.secretaryName
    },
    {
      id: 'n2',
      title: 'পবিত্র ঈদুল আজহা উপলক্ষ্যে চাল (ভিজিএফ) কার্ডের চাল বিতরণ সূচি',
      category: 'ভিজিএফ ও সামাজিক ভাতা',
      date: '০২ আগস্ট ২০২৬',
      content: 'ওয়ার্ড নং ০১ হইতে ০৯ পর্যন্ত সকল তালিকাভুক্ত দুস্থ ও অসহায় ভিজিএফ কার্ডধারীদের মাঝে আগামী ১২ আগস্ট হইতে ১৪ আগস্ট পর্যন্ত প্রতিদিন সকাল ৯:০০ টা হইতে বিকেল ৪:০০ টা পর্যন্ত ইউনিয়ন পরিষদ ভবনে ১০ কেজি করিয়া ভিজিএফ চাল বিতরণ করা হইবে। বিতরণকালে এনআইডি কার্ড সঙ্গে আনা বাধ্যতামূলক।',
      isPinned: true,
      publishedBy: 'উপজেলা সমাজসেবা অফিসার ও ইউপি চেয়ারম্যান'
    },
    {
      id: 'n3',
      title: 'নাগরিকত্ব ও ওয়ারিশান সনদের ফি এবং আবেদনের অনলাইন তথ্য নির্দেশিকা',
      category: 'প্রশাসনিক',
      date: '২৮ জুলাই ২০২৬',
      content: `${config.upName}-এর সকল নাগরিক এখন হইতে ঘরে বসিয়াই ডিজিটাল ভেরিফায়েড নাগরিকত্ব, ওয়ারিশান ও চারিত্রিক প্রত্যয়নপত্রের আবেদন ও কিউআর কোডযুক্ত আসল কপি সংগ্রহ করিতে পারিবেন। সরকারি নির্ধারিত ২০০/- টাকা ফি ডিজিটাল ফি পেমেন্ট গেটওয়ে বা ইউপি ক্যাশিয়ারের নিকট জমা দেওয়া যাইবে।`,
      isPinned: false,
      publishedBy: config.secretaryName
    },
    {
      id: 'n4',
      title: 'বয়স্ক, বিধবা ও প্রতিবন্ধী ভাতার নতুন কার্ডের ডিজিটাল রেজিস্ট্রেশন ক্যাম্পাইন',
      category: 'ভিজিএফ ও সামাজিক ভাতা',
      date: '১৫ জুলাই ২০২৬',
      content: 'ওয়ার্ড নং ০৪, ০৫ ও ০৬-এর অসচ্ছল বয়োবৃদ্ধ নাগরিক ও প্রতিবন্ধীদের ভাতা তালিকায় নাম অন্তর্ভুক্তির জন্য অনলাইন পোর্টাল উন্মুক্ত করা হইয়াছে। বহেড়াতৈল ডিজিটাল সেন্টারে প্রয়োজনীয় কাগজপত্রসহ উপস্থিত থাকিবার জন্য অনুরোধ করা হইল।',
      isPinned: false,
      publishedBy: 'ইউডিসি উদ্যোক্তা'
    }
  ]);

  const [activeNotice, setActiveNotice] = useState<NoticeItem | null>(notices[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<NoticeItem['category']>('জরুরি নোটিশ');
  const [newContent, setNewContent] = useState('');

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: NoticeItem = {
      id: `notice_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      content: newContent.trim(),
      isPinned: true,
      publishedBy: config.secretaryName || 'অ্যাডমিন'
    };

    setNotices([item, ...notices]);
    setActiveNotice(item);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handlePrintNotice = (notice: NoticeItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>জরুরি নোটিশ - ${notice.title}</title>
        <style>
          body { font-family: 'SolaimanLipi', 'Kalpurush', sans-serif; padding: 40px; color: #000; line-height: 1.8; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #065f46; }
          .header p { margin: 4px 0; font-size: 14px; }
          .notice-box { border: 2px solid #000; padding: 25px; margin-top: 20px; border-radius: 8px; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 15px; text-decoration: underline; text-align: center; }
          .meta { font-size: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
          .content { font-size: 15px; text-align: justify; margin-bottom: 40px; }
          .footer { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; text-align: center; }
          .sig-box { border-top: 1px solid #000; width: 200px; pt-2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${config.upName}</h1>
          <p>${config.address}</p>
          <p>ওয়েবসাইট: baheratailup.gov.bd | ইমেইল: baheratailunion@gmail.com</p>
        </div>

        <div class="notice-box">
          <div class="meta">
            <span>স্মারক নং: BUP/NOTICE/${new Date().getFullYear()}/092</span>
            <span>প্রকাশের তারিখ: ${notice.date}</span>
          </div>

          <div class="title">জরুরি সরকারি নোটিশ: ${notice.title}</div>

          <div class="content">
            ${notice.content.replace(/\n/g, '<br/>')}
          </div>

          <div class="footer">
            <div class="sig-box">
              <p>প্রস্তুতকারী</p>
              <p><b>${notice.publishedBy}</b></p>
              <p>ইউনিয়ন পরিষদ সচিব</p>
            </div>
            <div class="sig-box">
              <p>অনুমোদনকারী</p>
              <p><b>${config.chairmanName}</b></p>
              <p>চেয়ারম্যান, ${config.upName}</p>
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Top Ticker Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white p-4 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                অফিসিয়াল
              </span>
              <h3 className="font-extrabold text-base text-white">
                {config.upName} ডিজিটাল ডিজিটাল নোটিশ বোর্ড
              </h3>
            </div>
            <p className="text-xs text-emerald-200">
              ইউনিয়ন পরিষদের সর্বশেষ সরকারি ঘোষণা, সাধারণ নোটিশ ও নাগরিক বিজ্ঞপ্তি
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন নোটিশ প্রকাশ করুন</span>
        </button>
      </div>

      {/* Ticker Marquee Bar */}
      <div className="bg-amber-100/90 text-amber-950 border-b border-amber-300/80 px-4 py-2 flex items-center gap-3 text-xs font-bold">
        <span className="bg-amber-500 text-emerald-950 px-2 py-0.5 rounded font-black shrink-0 text-[10px] flex items-center gap-1">
          <Megaphone className="w-3 h-3" />
          <span>লাইভ ব্রেকিং:</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="animate-marquee inline-block font-sans text-xs">
            📢 {notices.map((n) => `[${n.category}] ${n.title} — ${n.date}`).join('  |  ')}
          </p>
        </div>
      </div>

      {/* Main Notice Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notice List sidebar */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Pin className="w-3.5 h-3.5 text-amber-500" />
            <span>প্রকাশিত নোটিশসমূহ ({notices.length})</span>
          </h4>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {notices.map((notice) => {
              const isSelected = activeNotice?.id === notice.id;
              return (
                <div
                  key={notice.id}
                  onClick={() => setActiveNotice(notice)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow ring-1 ring-emerald-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      {notice.category}
                    </span>
                    <span className="text-slate-500 font-mono">{notice.date}</span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                    {notice.title}
                  </h5>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Notice Detailed View */}
        {activeNotice ? (
          <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between shadow-inner">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-emerald-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                    {activeNotice.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>তারিখ: {activeNotice.date}</span>
                  </span>
                </div>

                <button
                  onClick={() => handlePrintNotice(activeNotice)}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট নোটিশ</span>
                </button>
              </div>

              <h3 className="text-base md:text-lg font-black text-slate-900 leading-snug">
                {activeNotice.title}
              </h3>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs md:text-sm text-slate-800 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                {activeNotice.content}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>প্রকাশক: <strong className="text-slate-900">{activeNotice.publishedBy}</strong></span>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                অফিসিয়াল অনুমোদিত নোটিশ
              </span>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
            বামপাশের তালিকা হইতে নোটিশ ক্লিক করুন
          </div>
        )}
      </div>

      {/* Add New Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>নতুন সরকারি নোটিশ পোস্ট করুন</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">নোটিশের শিরোনাম:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ২০২৬-২০২৭ সালের ইউপি কর আদায় ক্যাম্পাইন"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600 font-bold"
                >
                  <option value="জরুরি নোটিশ">জরুরি নোটিশ</option>
                  <option value="ভিজিএফ ও সামাজিক ভাতা">ভিজিএফ ও সামাজিক ভাতা</option>
                  <option value="বাজেট ও কর">বাজেট ও কর</option>
                  <option value="জন্ম নিবন্ধন">জন্ম নিবন্ধন</option>
                  <option value="প্রশাসনিক">প্রশাসনিক</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোটিশের বিষয়বস্তু:</label>
                <textarea
                  required
                  rows={5}
                  placeholder="নোটিশের সম্পূর্ণ বিবরণী বাংলায় টাইপ করুন..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-900 shadow"
                >
                  প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
