
import React, { useState } from 'react';
import { X, LayoutGrid, Sparkles, TrendingUp, ShieldCheck, FileText, CheckSquare, CalendarClock, ChevronRight, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<number>(0);

  const steps = [
    {
      title: "ধাপ ১: তথ্য প্রদান (Input)",
      icon: <LayoutGrid className="w-6 h-6 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">আপনার ব্যবসার খুঁটিনাটি তথ্য দিয়ে শুরু করুন।</p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-indigo-600">১.</span>
              <span><strong>ব্যবসার ধরণ ও উদ্দেশ্য:</strong> ড্রপডাউন থেকে সিলেক্ট করুন আপনি কি 'নতুন ব্যবসা' শুরু করছেন নাকি 'চলমান ব্যবসা' স্কেল করতে চান।</span>
            </li>
            <li className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-indigo-600">২.</span>
              <span><strong>BMC পয়েন্ট:</strong> ৯টি বক্সে বিস্তারিত তথ্য দিন। যত বিস্তারিত লিখবেন, AI তত ভালো রিপোর্ট দেবে।</span>
            </li>
            <li className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-bold text-indigo-600">৩.</span>
              <span><strong>এনালাইসিস করুন:</strong> সব তথ্য দেওয়া হলে নিচে "এনালাইসিস করুন" বাটনে ক্লিক করুন।</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "ধাপ ২: রিপোর্ট ও ইনসাইট",
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">AI কয়েক সেকেন্ডের মধ্যে একটি প্রফেশনাল রিপোর্ট তৈরি করবে।</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
             <div className="p-3 border border-indigo-100 rounded-lg bg-indigo-50">
                <strong className="text-indigo-700 block mb-1">Market Intelligence</strong>
                আপনার ব্যবসার মার্কেট সাইজ (TAM/SAM/SOM) এবং প্রতিযোগীদের তথ্য দেখুন।
             </div>
             <div className="p-3 border border-green-100 rounded-lg bg-green-50">
                <strong className="text-green-700 block mb-1">SWOT Analysis</strong>
                ব্যবসার শক্তি, দুর্বলতা, সুযোগ এবং ঝুঁকিগুলো জানুন।
             </div>
             <div className="p-3 border border-orange-100 rounded-lg bg-orange-50">
                <strong className="text-orange-700 block mb-1">Financial Projection</strong>
                আগামী ৫ বছরের সম্ভাব্য আয়-ব্যয়ের গ্রাফ ও চার্ট দেখুন।
             </div>
             <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                <strong className="text-blue-700 block mb-1">Score & Tips</strong>
                AI আপনার আইডিয়াকে ১০০-তে স্কোর দেবে এবং উন্নতির পরামর্শ দেবে।
             </div>
          </div>
        </div>
      )
    },
    {
      title: "ধাপ ৩: একজিকিউশন প্ল্যান",
      icon: <CheckSquare className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">রিপোর্ট দেখার পর এবার কাজ শুরু করার পালা।</p>
          <ul className="space-y-3 text-sm text-slate-700">
             <li className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <strong>অ্যাকশন প্ল্যান:</strong> ডিপার্টমেন্ট অনুযায়ী চেকলিস্ট পাবেন। আপনি চাইলে টাস্ক এডিট বা নতুন টাস্ক যোগ করতে পারেন।
             </li>
             <li className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-purple-500" />
                <strong>রোডম্যাপ:</strong> আগামী ৬ মাসের টাইমলাইন দেখুন।
             </li>
             <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <strong>বাজেট প্ল্যান:</strong> 'বাজেট প্ল্যান তৈরি করুন' বাটনে ক্লিক করে খরচের বিস্তারিত হিসাব ও গাইডলাইন পান।
             </li>
             <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <strong>রিস্ক ম্যানেজার:</strong> বাজেটের পর 'Money & Risk' এ ক্লিক করে ক্যাশ ফ্লো সিমুলেশন দেখুন।
             </li>
          </ul>
        </div>
      )
    },
    {
      title: "ধাপ ৪: এক্সপোর্ট ও শেয়ার",
      icon: <FileText className="w-6 h-6 text-red-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">আপনার সম্পূর্ণ প্ল্যানটি ইনভেস্টর বা পার্টনারদের সাথে শেয়ার করুন।</p>
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
             <h4 className="font-bold text-slate-800 mb-2">📥 ডাউনলোডের অপশন:</h4>
             <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li><strong>Word (Full):</strong> ইনপুট সহ পুরো রিপোর্ট এডিট করার জন্য।</li>
                <li><strong>PDF (Report):</strong> সরাসরি প্রেজেন্টেশন বা প্রিন্ট করার জন্য।</li>
                <li>প্রতিটি সেকশন (বাজেট, রোডম্যাপ) আলাদাভাবেও ডাউনলোড করা যায়।</li>
             </ul>
          </div>
        </div>
      )
    },
    {
      title: "টিপস ও ট্রিকস",
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
               <Lightbulb className="w-4 h-4" />
               ভালো ফলাফলের জন্য টিপস:
            </h4>
            <ul className="space-y-3 text-sm text-slate-700">
               <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>বিস্তারিত লিখুন:</strong> ইনপুট বক্সে এক শব্দের বদলে পূর্ণ বাক্য লিখুন। যেমন: 'Partners' এর জায়গায় শুধু নাম না লিখে তাদের ভূমিকাও লিখুন (e.g., 'Supplier X for raw materials')।</span>
               </li>
               <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>রিসেট করুন:</strong> নতুন কোনো ব্যবসার প্ল্যান করার আগে অবশ্যই 'নতুন পরিকল্পনা শুরু করুন' বাটন ব্যবহার করুন যাতে পুরনো ডাটা মুছে যায়।</span>
               </li>
               <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>বাজেট আপডেট:</strong> আপনি যদি রোডম্যাপে ম্যানুয়ালি পরিবর্তন আনেন, তবে বাজেট প্ল্যানটি পুনরায় জেনারেট করে নিলে সেটি আরও সঠিক হবে।</span>
               </li>
               <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>সেভ করুন:</strong> ব্রাউজার রিফ্রেশ দিলে ডাটা চলে যেতে পারে, তাই কাজ করার সময় মাঝে মাঝে 'সেভ ড্রাফট' বাটন চাপুন।</span>
               </li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold">ব্যবহারবিধি (User Guide)</h2>
               <p className="text-indigo-100 text-sm">BMC AI Analyst ব্যবহার করার সহজ নিয়মাবলী</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
           
           {/* Sidebar Tabs */}
           <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 overflow-y-auto">
              <div className="flex flex-col p-4 gap-2">
                 {steps.map((step, idx) => (
                    <button
                       key={idx}
                       onClick={() => setActiveTab(idx)}
                       className={`p-4 rounded-xl text-left flex items-center gap-3 transition-all duration-300 ${
                          activeTab === idx 
                            ? 'bg-white shadow-md border border-indigo-100 text-indigo-700' 
                            : 'hover:bg-slate-100 text-slate-600'
                       }`}
                    >
                       <div className={`shrink-0 ${activeTab === idx ? 'opacity-100' : 'opacity-60'}`}>{step.icon}</div>
                       <span className={`font-bold text-sm ${activeTab === idx ? 'opacity-100' : 'opacity-80'}`}>{step.title}</span>
                       {activeTab === idx && <ChevronRight className="w-4 h-4 ml-auto text-indigo-500" />}
                    </button>
                 ))}
              </div>
           </div>

           {/* Active Content */}
           <div className="w-full md:w-2/3 p-6 md:p-10 overflow-y-auto bg-white">
              <div className="animate-fade-in key={activeTab}">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl font-black text-slate-100 select-none">0{activeTab + 1}</span>
                    <h3 className="text-2xl font-bold text-slate-800">{steps[activeTab].title}</h3>
                 </div>
                 
                 <div className="prose prose-slate max-w-none">
                    {steps[activeTab].content}
                 </div>

                 {/* Navigation Footer */}
                 <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
                    <button 
                       disabled={activeTab === 0}
                       onClick={() => setActiveTab(prev => prev - 1)}
                       className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-500"
                    >
                       &larr; আগের ধাপ
                    </button>
                    
                    {activeTab < steps.length - 1 ? (
                       <button 
                          onClick={() => setActiveTab(prev => prev + 1)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                       >
                          পরের ধাপ &rarr;
                       </button>
                    ) : (
                       <button 
                          onClick={onClose}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                       >
                          বুঝেছি, বন্ধ করুন
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
