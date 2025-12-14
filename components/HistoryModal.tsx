
import React from 'react';
import { HistoryItem, BMCData, BMC_LABELS } from '../types';
import { X, Clock, RotateCcw, Trash2, FileText, Download, FileType, Target, Briefcase, Factory } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (data: BMCData) => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onRestore, 
  onDelete 
}) => {
  if (!isOpen) return null;

  // Helper to get formatted content for downloads
  const getFormattedContentHTML = (item: HistoryItem) => {
    const orderedKeys = Object.keys(BMC_LABELS) as (keyof BMCData)[];
    
    return `
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5; text-align: center; margin-bottom: 10px;">বিজনেস মডেল ক্যানভাস (BMC)</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
          সংরক্ষিত তারিখ: ${new Date(item.timestamp).toLocaleString('bn-BD')}
        </p>

        <!-- Metadata Section -->
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #cbd5e1;">
           <p><strong>ব্যবসার ধরণ:</strong> ${item.data.businessStage === 'New' ? 'নতুন ব্যবসা' : item.data.businessStage === 'Existing' ? 'চলমান ব্যবসা' : 'N/A'}</p>
           <p><strong>উদ্দেশ্য:</strong> ${item.data.primaryGoal || 'N/A'}</p>
           <p><strong>ইন্ডাস্ট্রি:</strong> ${item.data.industry || 'N/A'}</p>
        </div>
        
        ${orderedKeys.filter(k => !['businessStage', 'primaryGoal', 'industry'].includes(k)).map(key => {
          const val = item.data[key];
          if (!val) return '';
          return `
            <div style="margin-bottom: 25px; page-break-inside: avoid; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background-color: #f8fafc;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
                ${BMC_LABELS[key].label}
              </h3>
              <p style="white-space: pre-wrap; margin: 0; color: #334155; line-height: 1.6;">${val}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const downloadWord = (item: HistoryItem) => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>BMC Data</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; }
        </style>
      </head>
      <body>
        ${getFormattedContentHTML(item)}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BMC_Draft_${new Date(item.timestamp).toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (item: HistoryItem) => {
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library loading... please try again in a moment.");
      return;
    }

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = getFormattedContentHTML(item);
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: `BMC_Draft_${new Date(item.timestamp).toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(container).save().then(() => {
      document.body.removeChild(container);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              পূর্বের ইতিহাস (History)
            </h2>
            <p className="text-slate-500 text-sm mt-1">আপনার সংরক্ষিত এবং এনালাইসিস করা প্ল্যানগুলো</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200 text-slate-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">কোন ইতিহাস পাওয়া যায়নি।</p>
              <p className="text-sm">নতুন এনালাইসিস করলে বা সেভ করলে এখানে দেখা যাবে।</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col lg:flex-row gap-5 lg:items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock size={12} />
                      {new Date(item.timestamp).toLocaleString('bn-BD').split(',')[0]}
                    </div>
                    {item.data.businessStage && (
                      <div className={`text-xs font-bold px-2 py-1 rounded-md ${item.data.businessStage === 'New' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.data.businessStage === 'New' ? 'New Business' : 'Existing Business'}
                      </div>
                    )}
                  </div>

                  <h4 className="font-semibold text-slate-800 text-lg truncate mb-1" title={item.preview}>
                    {item.preview || "নামবিহীন প্রজেক্ট"}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                    {item.data.primaryGoal && (
                       <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                         <Target size={12} className="text-purple-500" />
                         {item.data.primaryGoal}
                       </span>
                    )}
                    {item.data.industry && (
                       <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                         <Factory size={12} className="text-pink-500" />
                         {item.data.industry}
                       </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Download Buttons */}
                  <div className="flex gap-2 mr-2 border-r border-slate-200 pr-4">
                    <button
                      onClick={() => downloadWord(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                      title="Download Word"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => downloadPDF(item)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                      title="Download PDF"
                    >
                      <FileType size={18} />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => {
                      onRestore(item.data);
                      onClose();
                    }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors font-medium text-sm border border-indigo-100"
                  >
                    <RotateCcw size={16} />
                    লোড করুন
                  </button>
                  
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Draft"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl text-center text-xs text-slate-400">
          সর্বোচ্চ ২০টি সাম্প্রতিক ইতিহাস সংরক্ষিত থাকবে
        </div>
      </div>
    </div>
  );
};
