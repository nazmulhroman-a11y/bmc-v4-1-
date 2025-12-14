
import React, { useState, useEffect } from 'react';
import { LaunchData, LaunchPhase, SetupChecklistItem } from '../types';
import { 
  Rocket, Calendar, CheckSquare, AlertTriangle, ShieldCheck, 
  Users, Banknote, HelpCircle, ChevronRight, ArrowLeft,
  CheckCircle2, Clock, PlayCircle, Lock, Link
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface LaunchDashboardProps {
  data: LaunchData;
  onBack: () => void;
  onNext: () => void; // Go to Roadmap
}

export const LaunchDashboard: React.FC<LaunchDashboardProps> = ({ data, onBack, onNext }) => {
  // Local state for interactivity
  const [checklist, setChecklist] = useState<SetupChecklistItem[]>(data.setupChecklist);
  const [phases, setPhases] = useState<LaunchPhase[]>(data.first14Days);
  
  // Finance Tracker State
  const [startingCapital, setStartingCapital] = useState<number>(0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(data.firstMonthExpenseEstimate);
  const [runway, setRunway] = useState<number>(0);

  // Panic Modal
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [activePanicCategory, setActivePanicCategory] = useState<'Money' | 'Customer' | 'Fear' | null>(null);

  useEffect(() => {
     if (monthlyExpense > 0 && startingCapital > 0) {
        setRunway(parseFloat((startingCapital / monthlyExpense).toFixed(1)));
     } else {
        setRunway(0);
     }
  }, [startingCapital, monthlyExpense]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, isDone: !item.isDone } : item
    ));
  };

  const togglePhaseTask = (phaseIdx: number, taskId: string) => {
    const newPhases = [...phases];
    const task = newPhases[phaseIdx].tasks.find(t => t.id === taskId);
    if (task) {
      task.isDone = !task.isDone;
      setPhases(newPhases);
    }
  };

  const calculateProgress = () => {
    const totalSetup = checklist.length;
    const doneSetup = checklist.filter(i => i.isDone).length;
    
    let totalTasks = 0;
    let doneTasks = 0;
    phases.forEach(p => {
       totalTasks += p.tasks.length;
       doneTasks += p.tasks.filter(t => t.isDone).length;
    });

    const total = totalSetup + totalTasks;
    const done = doneSetup + doneTasks;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in font-sans">
      
      {/* Panic Modal Overlay */}
      {showPanicModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-center">
                 <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    প্যানিক বাটন (Panic Button)
                 </h3>
                 <button onClick={() => { setShowPanicModal(false); setActivePanicCategory(null); }} className="p-2 hover:bg-red-100 rounded-full text-red-500">
                    ✕
                 </button>
              </div>
              
              <div className="p-6">
                 {!activePanicCategory ? (
                    <div className="space-y-4">
                       <p className="text-slate-600 mb-4 font-medium">কোথায় আটকে গেছেন? ভয়ের কিছু নেই, সমাধান আছে।</p>
                       <div className="grid grid-cols-1 gap-3">
                          <button onClick={() => setActivePanicCategory('Money')} className="p-4 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl text-left transition-all group">
                             <div className="font-bold text-slate-800 group-hover:text-indigo-700">টাকা নিয়ে সমস্যা (Money Issue)</div>
                             <div className="text-xs text-slate-500">ফান্ড নেই বা খরচ বেশি হচ্ছে</div>
                          </button>
                          <button onClick={() => setActivePanicCategory('Customer')} className="p-4 bg-white border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 rounded-xl text-left transition-all group">
                             <div className="font-bold text-slate-800 group-hover:text-purple-700">কাস্টমার পাচ্ছি না (No Customers)</div>
                             <div className="text-xs text-slate-500">সেলস হচ্ছে না বা রেসপন্স নেই</div>
                          </button>
                          <button onClick={() => setActivePanicCategory('Fear')} className="p-4 bg-white border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 rounded-xl text-left transition-all group">
                             <div className="font-bold text-slate-800 group-hover:text-orange-700">ভয় বা কনফিউশন (Fear/Confusion)</div>
                             <div className="text-xs text-slate-500">বুঝতে পারছি না কী করবো</div>
                          </button>
                       </div>
                    </div>
                 ) : (
                    <div className="animate-in slide-in-from-right duration-300">
                       {data.panicSolutions.filter(s => s.category === activePanicCategory).map((sol, i) => (
                          <div key={i}>
                             <h4 className="text-lg font-bold text-slate-800 mb-3">{activePanicCategory === 'Money' ? 'টাকা ম্যানেজমেন্ট টিপস' : activePanicCategory === 'Customer' ? 'কাস্টমার পাওয়ার উপায়' : 'মানসিক শক্তি'}</h4>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-slate-700 leading-relaxed">
                                {sol.advice}
                             </div>
                             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3 items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                   <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">তাৎক্ষণিক পদক্ষেপ</div>
                                   <div className="font-bold text-emerald-800">{sol.actionStep}</div>
                                </div>
                             </div>
                             <button 
                               onClick={() => setActivePanicCategory(null)}
                               className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                             >
                               অন্য সমস্যা বেছে নিন
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10">
         <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
         >
            <ArrowLeft className="w-5 h-5" />
            অ্যাকশন প্ল্যানে ফেরত
         </button>

         <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-indigo-100 text-indigo-600 rounded-full mb-2">
               <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">ব্যবসা শুরু করুন</h2>
            <p className="text-slate-500 font-medium">প্ল্যানিং শেষ। এবার বাস্তবে নামার সময়।</p>
         </div>

         <div className="flex items-center gap-3">
             <button
               onClick={() => setShowPanicModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl transition-all font-bold animate-pulse-slow"
             >
                <AlertTriangle className="w-5 h-5" />
                আমি আটকে গেছি!
             </button>
             <button
               onClick={onNext}
               className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold"
             >
                পরবর্তী ধাপ: রোডম্যাপ
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COLUMN: Readiness & 14 Days */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Startup Readiness Meter */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
               
               <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                     {/* Circular Progress */}
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                        <circle 
                           cx="80" cy="80" r="70" 
                           stroke={data.readinessScore > 70 ? '#10b981' : data.readinessScore > 40 ? '#f59e0b' : '#ef4444'} 
                           strokeWidth="12" 
                           fill="transparent" 
                           strokeDasharray={440} 
                           strokeDashoffset={440 - (440 * data.readinessScore) / 100}
                           strokeLinecap="round"
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{data.readinessScore}%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Readiness</span>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                     <h3 className="text-xl font-bold text-slate-800 mb-2">আপনার ব্যবসার প্রস্তুতি স্কোর</h3>
                     <p className="text-slate-500 mb-4 text-sm">
                        AI Analysis এর উপর ভিত্তি করে তৈরি। এটি আপনার SWOT Weakness গুলো বিবেচনা করে।
                     </p>
                     
                     {data.criticalMissing.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                           <div className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Critical Missing Items
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {data.criticalMissing.map((item, i) => (
                                 <span key={i} className="px-2 py-1 bg-white border border-red-100 text-red-700 text-xs font-bold rounded">
                                    ❌ {item}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Section 2: First 14 Days Action Board */}
            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                     <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold">প্রথম ১৪ দিনের অ্যাকশন বোর্ড</h3>
                     <p className="text-slate-400 text-sm">Action Plan থেকে বাছাই করা সবথেকে গুরুত্বপূর্ণ কাজ</p>
                  </div>
               </div>

               <div className="space-y-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-700"></div>

                  {phases.map((phase, pIdx) => (
                     <div key={pIdx} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center z-10 font-bold text-xs text-indigo-400">
                           {pIdx === 0 ? '1-3' : pIdx === 1 ? '4-7' : '8+'}
                        </div>
                        
                        <h4 className="text-lg font-bold text-slate-200 mb-3">{phase.phaseName}</h4>
                        <div className="space-y-3">
                           {phase.tasks.map((task, tIdx) => (
                              <div 
                                 key={task.id} 
                                 onClick={() => togglePhaseTask(pIdx, task.id)}
                                 className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group ${
                                    task.isDone 
                                       ? 'bg-emerald-900/20 border-emerald-900/50 opacity-70' 
                                       : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50'
                                 }`}
                              >
                                 <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    task.isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-indigo-400'
                                 }`}>
                                    {task.isDone && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                 </div>
                                 <div className="flex-1">
                                    <p className={`text-sm font-medium transition-colors ${task.isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                       {task.task}
                                    </p>
                                    <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                       <Link className="w-3 h-3" />
                                       {task.source}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* RIGHT COLUMN: Interactive Tools */}
         <div className="space-y-8">
            
            {/* Section 3: Setup Wizard */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  বিজনেস সেটআপ উইজার্ড
               </h3>
               
               <div className="space-y-4">
                  {checklist.map((item, i) => (
                     <div key={item.id} className={`p-4 rounded-xl border transition-all ${item.isDone ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-start gap-3">
                           <button 
                              onClick={() => toggleChecklistItem(item.id)}
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                 item.isDone ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'
                              }`}
                           >
                              {item.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                           </button>
                           <div>
                              <div className={`font-bold ${item.isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                 {item.item}
                              </div>
                              <div className="mt-2 text-xs text-slate-500 space-y-1">
                                 <p><span className="font-bold text-indigo-600">কেন দরকার:</span> {item.whyNeeded}</p>
                                 <p className="text-red-500"><span className="font-bold">ঝুঁকি:</span> {item.riskIfIgnored}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Section 4: Mini Finance Tracker */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  প্রথম মানি ট্র্যাকার
               </h3>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">শুরুর মূলধন (Starting Capital)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                        <input 
                           type="number" 
                           value={startingCapital}
                           onChange={(e) => setStartingCapital(Number(e.target.value))}
                           className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-slate-800"
                           placeholder="0"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">প্রথম মাসের খরচ (আনুমানিক)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                        <input 
                           type="number" 
                           value={monthlyExpense}
                           onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                           className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-slate-800"
                           placeholder="0"
                        />
                     </div>
                     <p className="text-[10px] text-indigo-600 font-medium mt-1 ml-1">* Based on Cost Structure Input</p>
                  </div>
               </div>

               <div className={`p-4 rounded-xl text-center ${runway < 2 && runway > 0 ? 'bg-red-100 text-red-800' : 'bg-white text-slate-800'}`}>
                  {runway > 0 ? (
                     <>
                        <div className="text-xs font-bold opacity-70 uppercase mb-1">আপনার রানওয়ে</div>
                        <div className="text-2xl font-black">{runway} মাস</div>
                        <p className="text-xs mt-1">এই টাকায় আপনি {runway} মাস চলতে পারবেন</p>
                     </>
                  ) : (
                     <p className="text-sm font-medium opacity-60">মূলধন এবং খরচ ইনপুট দিন</p>
                  )}
               </div>
            </div>

            {/* Section 5: First Customer Tactics */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  প্রথম কাস্টমার ফোকাস
               </h3>
               <div className="space-y-3">
                  {data.firstCustomerTactics.map((tactic, i) => (
                     <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-default group">
                        <div className="flex justify-between items-start mb-1">
                           <h4 className="font-bold text-slate-700 text-sm group-hover:text-blue-700">{tactic.title}</h4>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              tactic.costType === 'Free' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                              {tactic.costType}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{tactic.description}</p>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

    </div>
  );
};
