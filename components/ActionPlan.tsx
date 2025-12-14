
import React, { useState } from 'react';
import { AnalysisResult, DepartmentPlan } from '../types';
import { ArrowLeft, Megaphone, TrendingUp, Settings, DollarSign, Users, Briefcase, CheckSquare, Printer, User, FileText, Download, CalendarClock, ChevronRight, Edit3, Trash2, Plus, X, Save, Rocket } from 'lucide-react';

interface ActionPlanProps {
  result: AnalysisResult;
  onBack: () => void;
  onViewRoadmap: () => void;
  onUpdate?: (updatedPlan: DepartmentPlan[]) => void;
  onLaunch?: () => void; // New Prop
  isLaunching?: boolean; // New Prop
}

export const ActionPlan: React.FC<ActionPlanProps> = ({ result, onBack, onViewRoadmap, onUpdate, onLaunch, isLaunching }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize state with normalization for backward compatibility
  const [localPlan, setLocalPlan] = useState<DepartmentPlan[]>(() => {
    const plan = JSON.parse(JSON.stringify(result.departmentalActionPlan || []));
    
    // Check if tasks are strings (legacy format) and convert to objects
    plan.forEach((dept: any) => {
        dept.roles.forEach((role: any) => {
            if (role.tasks && role.tasks.length > 0 && typeof role.tasks[0] === 'string') {
                role.tasks = role.tasks.map((t: string) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: t,
                    isDone: false
                }));
            }
        });
    });
    return plan;
  });

  // Helper to map department names to icons
  const getIconForDept = (deptName: string) => {
    const name = deptName.toLowerCase();
    if (name.includes('market') || name.includes('মার্কেটিং') || name.includes('প্রচার')) return <Megaphone className="w-6 h-6" />;
    if (name.includes('sales') || name.includes('সেলস') || name.includes('বিক্রয়')) return <TrendingUp className="w-6 h-6" />;
    if (name.includes('oper') || name.includes('অপারেশন') || name.includes('ব্যবস্থাপনা')) return <Settings className="w-6 h-6" />;
    if (name.includes('finan') || name.includes('হিসাব') || name.includes('অর্থ')) return <DollarSign className="w-6 h-6" />;
    if (name.includes('hr') || name.includes('মানব') || name.includes('team')) return <Users className="w-6 h-6" />;
    return <Briefcase className="w-6 h-6" />;
  };

  const getColorForDept = (index: number) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-100',
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-purple-50 text-purple-700 border-purple-100',
      'bg-orange-50 text-orange-700 border-orange-100',
      'bg-pink-50 text-pink-700 border-pink-100',
    ];
    return colors[index % colors.length];
  };

  // --- Handlers ---
  const handleToggleTask = (deptIndex: number, roleIndex: number, taskIndex: number) => {
    if (isEditing) return; // Disable toggle in edit mode
    
    const newPlan = [...localPlan];
    const task = newPlan[deptIndex].roles[roleIndex].tasks[taskIndex];
    task.isDone = !task.isDone;
    setLocalPlan(newPlan);
    if (onUpdate) onUpdate(newPlan);
  };

  const handleTaskTextChange = (deptIndex: number, roleIndex: number, taskIndex: number, text: string) => {
    const newPlan = [...localPlan];
    newPlan[deptIndex].roles[roleIndex].tasks[taskIndex].text = text;
    setLocalPlan(newPlan);
  };

  const handleAddTask = (deptIndex: number, roleIndex: number) => {
    const newPlan = [...localPlan];
    newPlan[deptIndex].roles[roleIndex].tasks.push({
      id: Math.random().toString(36).substr(2, 9),
      text: 'নতুন কাজ লিখুন...',
      isDone: false
    });
    setLocalPlan(newPlan);
  };

  const handleDeleteTask = (deptIndex: number, roleIndex: number, taskIndex: number) => {
    const newPlan = [...localPlan];
    newPlan[deptIndex].roles[roleIndex].tasks.splice(taskIndex, 1);
    setLocalPlan(newPlan);
  };

  const handleSaveEdit = () => {
    if (onUpdate) onUpdate(localPlan);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Revert logic needs to respect original structure but normalized
    // For simplicity, we just reload from props but re-normalize
    const plan = JSON.parse(JSON.stringify(result.departmentalActionPlan || []));
    plan.forEach((dept: any) => {
        dept.roles.forEach((role: any) => {
            if (role.tasks && role.tasks.length > 0 && typeof role.tasks[0] === 'string') {
                role.tasks = role.tasks.map((t: string) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: t,
                    isDone: false
                }));
            }
        });
    });
    setLocalPlan(plan);
    setIsEditing(false);
  };

  const calculateProgress = (dept: DepartmentPlan) => {
    let total = 0;
    let done = 0;
    dept.roles.forEach(role => {
      role.tasks.forEach(t => {
        total++;
        if (t.isDone) done++;
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const getActionPlanHTML = () => {
    return `
      <div style="font-family: 'Hind Siliguri', sans-serif; color: #1e293b;">
        <h1 style="text-align: center; color: #4f46e5; margin-bottom: 10px;">ডিপার্টমেন্টাল অ্যাকশন প্ল্যান</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 30px;">পদ ও দায়িত্ব অনুযায়ী আপনার প্রতিষ্ঠানের করণীয় তালিকা</p>
        
        ${localPlan.map(dept => `
          <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #f8fafc; padding: 15px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; color: #334155; font-size: 18pt;">${dept.department}</h2>
            </div>
            <div style="padding: 20px;">
              ${dept.roles.map(role => `
                <div style="margin-bottom: 20px;">
                  <h3 style="color: #4f46e5; margin-bottom: 10px; font-size: 14pt;">${role.role}</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${role.tasks.map(task => `
                      <li style="margin-bottom: 8px; color: ${task.isDone ? '#10b981' : '#475569'}; line-height: 1.5;">
                         ${task.isDone ? '[DONE] ' : ''} ${task.text}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const downloadWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Action Plan</title>
      </head>
      <body>
        ${getActionPlanHTML()}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Action_Plan.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library not loaded yet. Please try printing instead.");
      return;
    }

    setIsDownloading(true);
    const container = document.createElement('div');
    container.innerHTML = getActionPlanHTML();
    container.style.padding = '20px';
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: 'Action_Plan.pdf',
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

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10 no-print">
        <div className="flex items-center gap-3">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
            >
                <ArrowLeft className="w-5 h-5" />
                রিপোর্টে ফিরে যান
            </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
             <CheckSquare className="w-8 h-8 text-indigo-600" />
             ডিপার্টমেন্টাল অ্যাকশন প্ল্যান
          </h2>
          <p className="text-slate-500 mt-2">পদ ও দায়িত্ব অনুযায়ী আপনার প্রতিষ্ঠানের করণীয় তালিকা</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
           
           {/* EDIT TOGGLE */}
           {!isEditing ? (
             <button 
               onClick={() => setIsEditing(true)}
               className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-all font-bold"
             >
               <Edit3 className="w-4 h-4" />
               এডিট টাস্ক
             </button>
           ) : (
             <div className="flex gap-2">
                <button 
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all font-bold"
                >
                  <X className="w-4 h-4" />
                  বাতিল
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all font-bold"
                >
                  <Save className="w-4 h-4" />
                  সেভ করুন
                </button>
             </div>
           )}

           {/* LAUNCH BUTTON (Primary CTA) */}
           {!isEditing && onLaunch && (
             <button 
               onClick={onLaunch}
               disabled={isLaunching}
               className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-200/50 transition-all font-bold hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
             >
               {isLaunching ? (
                 <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               ) : (
                 <Rocket className="w-5 h-5" />
               )}
               <span className="hidden sm:inline">ব্যবসা শুরু করুন</span>
               {!isLaunching && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
             </button>
           )}

           <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
             <button onClick={downloadWord} className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg" title="Download Word"><FileText className="w-5 h-5" /></button>
             <button onClick={downloadPDF} disabled={isDownloading} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Download PDF">
               {isDownloading ? <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span> : <Download className="w-5 h-5" />}
             </button>
             <button onClick={handlePrint} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Print"><Printer className="w-5 h-5" /></button>
           </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
           <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Edit3 className="w-5 h-5" /></div>
           <div>
             <h4 className="font-bold text-indigo-900">এডিট মোড চালু আছে</h4>
             <p className="text-sm text-indigo-700">আপনি টাস্ক পরিবর্তন, যোগ বা ডিলিট করতে পারেন। পরিবর্তন শেষে "সেভ করুন" বাটনে ক্লিক করুন।</p>
           </div>
        </div>
      )}

      {/* Content */}
      {localPlan.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xl text-slate-400">এই রিপোর্টের জন্য অ্যাকশন প্ল্যান জেনারেট করা হয়নি। দয়া করে নতুন করে এনালাইসিস করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {localPlan.map((dept, deptIdx) => {
            const style = getColorForDept(deptIdx);
            const roleText = style.split(' ')[1];
            const progress = calculateProgress(dept);
            
            return (
              <div key={deptIdx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid relative">
                
                {/* Progress Bar (Only View Mode) */}
                {!isEditing && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                     <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                )}

                {/* Department Header */}
                <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${style}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/60 rounded-xl backdrop-blur-sm">
                      {getIconForDept(dept.department)}
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold">{dept.department}</h3>
                       {!isEditing && <p className="text-xs font-bold opacity-70 mt-1">{progress}% কাজ সম্পন্ন</p>}
                    </div>
                  </div>
                </div>

                {/* Roles Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dept.roles.map((rolePlan, roleIdx) => (
                    <div key={roleIdx} className={`rounded-2xl p-5 border ${deptIdx % 2 === 0 ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm'} flex flex-col`}>
                      <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${roleText}`}>
                        <User size={18} className="opacity-70" />
                        {rolePlan.role}
                      </h4>
                      <div className="space-y-3 flex-1">
                        {rolePlan.tasks.map((task, taskIdx) => (
                          <div 
                             key={task.id} 
                             className={`flex items-start gap-3 group/item transition-all duration-300 ${isEditing ? '' : 'cursor-pointer'}`}
                             onClick={() => handleToggleTask(deptIdx, roleIdx, taskIdx)}
                          >
                            
                            {isEditing ? (
                               // Edit Mode: Input + Delete
                               <div className="flex-1 flex gap-2 items-start">
                                  <input 
                                     type="text" 
                                     value={task.text}
                                     onChange={(e) => handleTaskTextChange(deptIdx, roleIdx, taskIdx, e.target.value)}
                                     className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                  />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(deptIdx, roleIdx, taskIdx); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            ) : (
                               // View Mode: Checkbox + Text
                               <>
                                <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 
                                  ${task.isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover/item:border-indigo-400 bg-white'}`}>
                                  {task.isDone && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className={`text-base leading-relaxed transition-all duration-300 ${task.isDone ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-700 group-hover/item:text-slate-900'}`}>
                                   {task.text}
                                </span>
                               </>
                            )}
                          </div>
                        ))}
                      </div>

                      {isEditing && (
                         <button 
                           onClick={() => handleAddTask(deptIdx, roleIdx)}
                           className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors border border-dashed border-indigo-200 hover:border-indigo-300 w-full justify-center"
                         >
                            <Plus className="w-4 h-4" />
                            নতুন কাজ যোগ করুন
                         </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center text-blue-800 break-inside-avoid">
        <p className="font-medium">💡 টিপস: এই চেকলিস্টটি ইন্টারঅ্যাক্টিভ। কাজ শেষ হলে টিক চিহ্ন দিন এবং প্রগ্রেস ট্র্যাক করুন।</p>
      </div>

    </div>
  );
};
