
import React, { useState } from 'react';
import { AnalysisResult, RoadmapItem } from '../types';
import { ArrowLeft, CalendarClock, Briefcase, CheckCircle2, Download, Printer, FileText, Coins, ChevronRight, User, AlertCircle, Clock, BarChartHorizontal, List, GripHorizontal } from 'lucide-react';

interface RoadmapProps {
  result: AnalysisResult;
  onBack: () => void;
  onBackToActionPlan: () => void;
  onGenerateBudget: () => void; // New Prop
  isGeneratingBudget?: boolean; // New Prop
}

export const Roadmap: React.FC<RoadmapProps> = ({ result, onBack, onBackToActionPlan, onGenerateBudget, isGeneratingBudget }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');
  const roadmapData = result.roadmap || [];

  const handlePrint = () => {
    window.print();
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getGanttBarColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 hover:bg-red-600';
      case 'Medium': return 'bg-amber-500 hover:bg-amber-600';
      case 'Low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-indigo-500 hover:bg-indigo-600';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Delayed': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status?: string) => {
     if (!status) return 'Planned';
     return status;
  };

  const getRoadmapHTML = () => {
    return `
      <div style="font-family: 'Hind Siliguri', sans-serif; color: #1e293b; padding: 20px;">
        <h1 style="text-align: center; color: #7c3aed; margin-bottom: 5px; font-size: 24pt;">বিজনেস রোডম্যাপ (Roadmap)</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 30px; font-size: 14pt;">আগামী ৬ মাসের বাস্তবায়ন পরিকল্পনা</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12pt;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #1f2937;">সময়কাল</th>
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #1f2937;">কাজ (Task)</th>
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #1f2937;">বিভাগ & রিসোর্স</th>
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #1f2937;">Priority & Status</th>
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; color: #1f2937;">ফলাফল</th>
            </tr>
          </thead>
          <tbody>
            ${roadmapData.map(item => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 12px; font-weight: bold; color: #4c1d95;">${item.timeframe}</td>
                <td style="border: 1px solid #cbd5e1; padding: 12px;">${item.task}</td>
                <td style="border: 1px solid #cbd5e1; padding: 12px;">
                   <strong>${item.department}</strong><br/>
                   <small style="color: #666;">${item.resource || 'Team'}</small>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 12px;">
                   <span style="font-weight: bold;">${item.priority || 'Medium'}</span><br/>
                   <small>${item.status || 'Planned'}</small>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 12px; color: #047857; font-weight: bold;">${item.deliverable}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const downloadWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Business Roadmap</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; }
        </style>
      </head>
      <body>
        ${getRoadmapHTML()}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Business_Roadmap.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library not loaded yet.");
      return;
    }
    setIsDownloading(true);
    const container = document.createElement('div');
    container.innerHTML = getRoadmapHTML();
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: 'Business_Roadmap.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(container).save().then(() => {
      setIsDownloading(false);
      document.body.removeChild(container);
    });
  };

  // Group items by timeframe for Timeline View
  const grouped = roadmapData.reduce((acc, item) => {
    if (!acc[item.timeframe]) acc[item.timeframe] = [];
    acc[item.timeframe].push(item);
    return acc;
  }, {} as Record<string, RoadmapItem[]>);

  // Stats for the header
  const highPriorityCount = roadmapData.filter(i => i.priority === 'High').length;
  const totalTasks = roadmapData.length;

  if (roadmapData.length === 0) {
    return (
      <div className="w-full max-w-screen-xl mx-auto p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
         <div className="bg-slate-100 p-6 rounded-full mb-6">
            <CalendarClock className="w-16 h-16 text-slate-400" />
         </div>
         <h2 className="text-2xl font-bold text-slate-700">দুঃখিত, কোনো রোডম্যাপ ডেটা পাওয়া যায়নি।</h2>
         <p className="text-slate-500 mb-6 mt-2 max-w-md">অনুগ্রহ করে আপনার বিজনেস মডেলের ইনপুট চেক করুন এবং নতুন করে এনালাইসিস করুন।</p>
         <button onClick={onBack} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
           ফিরে যান
         </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in font-sans">
      
      {/* Improved Header Section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lg border border-slate-100 mb-10 relative overflow-hidden no-print">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -ml-12 -mb-12 opacity-60"></div>
         
         <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 self-start xl:self-center">
                 <button 
                    onClick={onBackToActionPlan}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-bold shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline">অ্যাকশন প্ল্যানে ফেরত</span>
                </button>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-3 shadow-inner">
                 <CalendarClock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2">
                 স্ট্র্যাটেজিক রোডম্যাপ
              </h2>
              <div className="flex gap-2 justify-center mt-2">
                 <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">Total Tasks: {totalTasks}</span>
                 <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Critical: {highPriorityCount}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
               
               {/* GENERATE BUDGET BUTTON */}
               <button 
                  onClick={onGenerateBudget}
                  disabled={isGeneratingBudget}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 transition-all font-bold hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
               >
                 {isGeneratingBudget ? (
                   <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                 ) : (
                   <Coins className="w-5 h-5" />
                 )}
                 <span className="">বাজেট প্ল্যান তৈরি করুন 💰</span>
                 {!isGeneratingBudget && <ChevronRight className="w-4 h-4" />}
               </button>

               <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={downloadWord} className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg" title="Word">
                    <FileText className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <button onClick={downloadPDF} disabled={isDownloading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="PDF">
                     {isDownloading ? <span className="block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span> : <Download className="w-5 h-5" />}
                  </button>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <button onClick={handlePrint} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Print">
                    <Printer className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-8 no-print">
         <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button
               onClick={() => setViewMode('timeline')}
               className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'timeline'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
               }`}
            >
               <List className="w-4 h-4" />
               Timeline List
            </button>
            <button
               onClick={() => setViewMode('gantt')}
               className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                  viewMode === 'gantt'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
               }`}
            >
               <BarChartHorizontal className="w-4 h-4" />
               Gantt Chart (Beta)
            </button>
         </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline List Visualization */
        <div className="relative ml-2 md:ml-4 py-4">
          <div className="absolute left-[19px] md:left-[27px] top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30"></div>

          {(Object.entries(grouped) as [string, RoadmapItem[]][]).map(([timeframe, items], idx) => (
              <div key={idx} className="relative pl-12 md:pl-20 mb-16 last:mb-0 break-inside-avoid">
                  <div className="absolute left-[8px] md:left-[16px] top-0 w-6 h-6 rounded-full bg-white border-4 border-indigo-500 shadow-md z-10"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                     <h3 className="text-xl md:text-2xl font-bold text-slate-800 bg-white px-5 py-2 rounded-xl shadow-sm border border-slate-100 inline-block">
                        {timeframe}
                     </h3>
                     <div className="h-px flex-1 bg-slate-200 border-t border-dashed border-slate-300"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                      {items.map((item, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
                               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.priority === 'High' ? 'bg-red-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                               
                               <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                  <div>
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(item.priority)}`}>
                                              {item.priority || 'Medium'} Priority
                                          </span>
                                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                              {getStatusIcon(item.status)}
                                              {getStatusLabel(item.status)}
                                          </span>
                                      </div>
                                      <h4 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors">{item.task}</h4>
                                  </div>

                                  <div className="flex flex-wrap gap-2 md:justify-end">
                                       <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 border border-slate-100">
                                          <Briefcase className="w-3.5 h-3.5" />
                                          {item.department}
                                      </span>
                                      <span className="px-3 py-1.5 bg-purple-50 rounded-lg text-xs font-bold text-purple-700 flex items-center gap-2 border border-purple-100">
                                          <User className="w-3.5 h-3.5" />
                                          {item.resource || 'Team'}
                                      </span>
                                  </div>
                               </div>

                               <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Expected Outcome</span>
                                     <span className="text-sm font-semibold text-slate-700">{item.deliverable}</span>
                                  </div>
                               </div>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
        </div>
      ) : (
        /* Gantt Chart Visualization */
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
             <GripHorizontal className="w-5 h-5 text-slate-400" />
             <h3 className="font-bold text-slate-700">Project Timeline (6 Months)</h3>
           </div>
           
           <div className="overflow-x-auto">
             <div className="min-w-[800px] p-6">
                {/* Gantt Header */}
                <div className="grid grid-cols-[250px_repeat(6,1fr)] gap-0 border-b border-slate-200 pb-2 mb-4">
                   <div className="font-bold text-xs text-slate-400 uppercase tracking-wider pl-2">Task Details</div>
                   {[1, 2, 3, 4, 5, 6].map(m => (
                      <div key={m} className="text-center font-bold text-slate-600 bg-slate-50 mx-1 rounded py-1 text-sm border border-slate-100">
                         Month {m}
                      </div>
                   ))}
                </div>

                {/* Gantt Rows */}
                <div className="space-y-3">
                   {roadmapData.map((item, idx) => {
                      // Fallback for missing startMonth/duration logic
                      // If startMonth missing, try to infer from timeframe string or default to 1
                      let start = item.startMonth || 1;
                      let dur = item.duration || 1;
                      
                      // Sanity check
                      if (start < 1) start = 1;
                      if (start > 6) start = 6;
                      if (dur < 1) dur = 1;
                      if (start + dur > 7) dur = 7 - start;

                      return (
                        <div key={idx} className="grid grid-cols-[250px_repeat(6,1fr)] gap-0 items-center group">
                           {/* Task Info Column */}
                           <div className="pr-4 border-r border-slate-100 py-2">
                              <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 truncate" title={item.task}>{item.task}</h4>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                 <User className="w-3 h-3" /> {item.resource}
                              </span>
                           </div>

                           {/* Bar Column Area */}
                           {/* We use grid column start/span to position the bar */}
                           <div className="col-span-6 grid grid-cols-6 gap-2 h-full items-center pl-2 relative">
                              {/* Background Grid Lines */}
                              <div className="absolute inset-0 grid grid-cols-6 gap-2 pointer-events-none">
                                 {[1,2,3,4,5,6].map(i => <div key={i} className="border-r border-slate-50 last:border-0 h-full"></div>)}
                              </div>

                              {/* The Bar */}
                              <div 
                                className={`h-10 rounded-lg shadow-sm border border-white/20 relative group/bar flex items-center px-3 overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] cursor-default ${getGanttBarColor(item.priority)}`}
                                style={{ 
                                   gridColumnStart: start, 
                                   gridColumnEnd: `span ${dur}` 
                                }}
                              >
                                 <span className="text-white text-xs font-bold truncate drop-shadow-sm relative z-10">{item.status || 'Planned'}</span>
                                 
                                 {/* Hover Tooltip */}
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                    <div className="font-bold mb-1">{item.department}</div>
                                    <div>{item.deliverable}</div>
                                    <div className="mt-1 text-slate-400 text-[10px]">Duration: {dur} Month(s)</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
