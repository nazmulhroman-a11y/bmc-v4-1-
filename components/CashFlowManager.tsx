
import React, { useState, useEffect } from 'react';
import { CashFlowAnalysis } from '../types';
import { 
  ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, AlertOctagon, 
  CheckCircle2, Download, Printer, ShieldCheck, Banknote, Calendar, 
  BarChart4, Activity, Users, Zap, Info, ChevronRight, Server, Cpu, Megaphone, SlidersHorizontal, RefreshCcw 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface CashFlowManagerProps {
  data: CashFlowAnalysis;
  onBack: () => void;
}

export const CashFlowManager: React.FC<CashFlowManagerProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'risk'>('financial');
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Simulation State ---
  const [cashPosition, setCashPosition] = useState(data.currentCashPosition);
  const [burnRate, setBurnRate] = useState(data.burnRate);
  const [runway, setRunway] = useState(data.runwayMonths);
  
  // Calculate runway whenever cash or burn changes
  useEffect(() => {
    if (burnRate > 0) {
      const newRunway = parseFloat((cashPosition / burnRate).toFixed(1));
      setRunway(newRunway);
    } else {
      setRunway(99); // Infinite runway if 0 spend
    }
  }, [cashPosition, burnRate]);

  const handleResetSimulation = () => {
    setCashPosition(data.currentCashPosition);
    setBurnRate(data.burnRate);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
  };

  // Dynamic Chart Data based on Simulation
  const chartData = data.forecasts.map(f => {
    // Calculate the ratio of change if user modified burn rate
    // Avoid division by zero
    const originalBurn = data.burnRate > 0 ? data.burnRate : 1; 
    const burnRatio = burnRate / originalBurn;
    
    const simulatedOutflow = f.projectedOutflow * burnRatio;
    const simulatedNet = f.projectedInflow - simulatedOutflow;

    return {
      name: f.period.split(' ')[0] + ' ' + f.period.split(' ')[1], // "Month 1"
      Inflow: f.projectedInflow,
      Outflow: simulatedOutflow, 
      Net: simulatedNet
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = () => {
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library not loaded.");
      return;
    }
    setIsDownloading(true);
    const element = document.getElementById('risk-dashboard-content');
    
    const opt = {
      margin: 10,
      filename: 'Risk_Management_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  // Helper for Variable Cost Icons
  const getCostIcon = (cat: string) => {
    if (cat.includes('API') || cat.includes('Tech')) return <Cpu className="w-5 h-5 text-indigo-500" />;
    if (cat.includes('Server') || cat.includes('Hosting')) return <Server className="w-5 h-5 text-blue-500" />;
    if (cat.includes('Market') || cat.includes('Ads')) return <Megaphone className="w-5 h-5 text-pink-500" />;
    return <Users className="w-5 h-5 text-emerald-500" />;
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in font-sans">
      
      {/* Header with Navigation */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-8 no-print">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
        >
            <ArrowLeft className="w-5 h-5" />
            বাজেটে ফিরে যান
        </button>

        <div className="text-center">
           <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
             <ShieldCheck className="w-8 h-8 text-cyan-600" />
             Money & Risk Management
           </h2>
           <p className="text-slate-500 mt-1">ইন্টেলিজেন্ট ক্যাশ ফ্লো এবং ডাইনামিক রিস্ক ইঞ্জিন</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={downloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border border-slate-200 shadow-sm"
          >
            {isDownloading ? <span className="animate-spin">...</span> : <Download className="w-5 h-5" />}
            <span className="hidden sm:inline">Report</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold border border-slate-200"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Warning Banner (Always Visible) */}
      {data.cashCrunchWarning && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-pulse-slow shadow-sm">
           <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0">
              <AlertOctagon className="w-8 h-8" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-red-700 mb-1">ক্যাশ ফ্লো ক্রাঞ্চ সতর্কতা (Cash Crunch Alert)</h3>
              <p className="text-red-600 leading-relaxed text-lg">{data.cashCrunchWarning}</p>
           </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-8 no-print">
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'financial' 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BarChart4 className="w-4 h-4" />
            ফিন্যান্সিয়াল হেলথ
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'risk' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            রিস্ক ইন্টেলিজেন্স (New)
          </button>
        </div>
      </div>

      <div id="risk-dashboard-content">
        
        {/* TAB 1: FINANCIAL HEALTH */}
        {activeTab === 'financial' && (
          <div className="animate-fade-in space-y-8">
            
            {/* Simulation Control Panel */}
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white shadow-xl break-inside-avoid no-print">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                       <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                       রিয়েল-টাইম সিমুলেটর
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">আপনার বাস্তব ডেটা ইনপুট করুন, চার্ট এবং রানওয়ে অটোমেটিক আপডেট হবে।</p>
                 </div>
                 <button 
                   onClick={handleResetSimulation}
                   className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
                 >
                   <RefreshCcw className="w-3 h-3" />
                   রিসেট করুন
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cash Input */}
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 focus-within:border-cyan-500 transition-colors">
                     <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">হাতে থাকা নগদ অর্থ (Cash in Hand)</label>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                           <Banknote className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-slate-500">৳</span>
                        <input 
                           type="number" 
                           value={cashPosition}
                           onChange={(e) => setCashPosition(Number(e.target.value))}
                           className="bg-transparent text-2xl font-black text-white w-full focus:outline-none placeholder-slate-600"
                           placeholder="0"
                        />
                     </div>
                  </div>

                  {/* Burn Rate Input */}
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 focus-within:border-cyan-500 transition-colors">
                     <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">মাসিক খরচ (Burn Rate)</label>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                           <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-slate-500">৳</span>
                        <input 
                           type="number" 
                           value={burnRate}
                           onChange={(e) => setBurnRate(Number(e.target.value))}
                           className="bg-transparent text-2xl font-black text-white w-full focus:outline-none placeholder-slate-600"
                           placeholder="0"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* KPI Cards (Connected to State) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 break-inside-avoid">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">বর্তমান ক্যাশ পজিশন</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{formatCurrency(cashPosition)}</h3>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                        <Banknote className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">হাতে থাকা সম্ভাব্য মূলধন</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">মাসিক বার্ন রেট</p>
                        <h3 className="text-3xl font-black text-orange-600 mt-1">{formatCurrency(burnRate)}</h3>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">প্রতি মাসে আনুমানিক খরচ</p>
              </div>

              <div className={`p-6 rounded-2xl border shadow-lg text-white transition-colors duration-500 ${runway < 3 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-white/80 font-bold text-xs uppercase tracking-wider">রানওয়ে (Runway)</p>
                        <h3 className="text-4xl font-black mt-1">{runway} <span className="text-xl font-medium">মাস</span></h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">
                    {runway < 3 ? 'সতর্কতা! তহবিল দ্রুত শেষ হচ্ছে।' : 'নিরাপদ অবস্থানে আছেন।'}
                  </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 break-inside-avoid">
              {/* Forecast Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    লাইভ ক্যাশ ফ্লো ফোরকাস্টিং (৯০ দিন)
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip 
                              formatter={(val: number) => formatCurrency(val)}
                              cursor={{fill: '#f1f5f9'}}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Legend />
                          <Bar dataKey="Inflow" name="আয় (Inflow)" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Outflow" name="ব্যয় (Outflow)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Priorities List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    অটোমেটেড পেমেন্ট প্রায়োরিটি
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px] space-y-3">
                    {data.upcomingPayments.map((pay, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-10 rounded-full ${
                                pay.priority === 'Critical' ? 'bg-red-500' : 
                                pay.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                              <div>
                                <p className="font-bold text-slate-700">{pay.billName}</p>
                                <p className="text-xs text-slate-500">Due: {pay.dueDate}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-slate-800">{formatCurrency(pay.amount)}</p>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                pay.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                                pay.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {pay.priority}
                              </span>
                          </div>
                        </div>
                    ))}
                  </div>
              </div>
            </div>

            {/* Analysis Text */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 break-inside-avoid">
               {data.forecasts.map((f, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-700">{f.period}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                           f.riskLevel === 'Safe' ? 'bg-emerald-100 text-emerald-700' : 
                           f.riskLevel === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>{f.riskLevel}</span>
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">{f.analysis}</p>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB 2: RISK INTELLIGENCE */}
        {activeTab === 'risk' && (
          <div className="animate-fade-in space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 break-inside-avoid">
               {/* Market Risk Indicators */}
               <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                     <Activity className="w-6 h-6 text-cyan-600" />
                     রিয়েল-টাইম মার্কেট রিস্ক
                  </h3>
                  <div className="space-y-6">
                     {data.marketRisks?.map((risk, idx) => (
                        <div key={idx} className="relative">
                           <div className="flex justify-between items-end mb-2">
                              <div>
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{risk.indicatorName}</span>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xl font-black ${
                                       risk.score > 70 ? 'text-red-600' : risk.score > 40 ? 'text-orange-500' : 'text-emerald-500'
                                    }`}>{risk.score}/100</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                       risk.trend === 'Rising' ? 'bg-red-100 text-red-700' : 
                                       risk.trend === 'Falling' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}>{risk.trend}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    risk.score > 70 ? 'bg-red-500' : risk.score > 40 ? 'bg-orange-500' : 'bg-emerald-500'
                                 }`} 
                                 style={{ width: `${risk.score}%` }}
                              ></div>
                           </div>
                           <p className="mt-2 text-xs text-slate-500 leading-relaxed">{risk.details}</p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Variable Cost Monitor (New Feature) */}
               <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                     <TrendingDown className="w-6 h-6 text-indigo-600" />
                     ভেরিযেবল কস্ট মনিটর (Variable Cost Monitor)
                  </h3>
                  <div className="space-y-4">
                     {data.variableCostRisks?.map((cost, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                                    {getCostIcon(cost.category)}
                                 </div>
                                 <span className="font-bold text-slate-700">{cost.category}</span>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                 cost.volatility === 'High' ? 'bg-red-100 text-red-700' : 
                                 cost.volatility === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>{cost.volatility} Volatility</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">বর্তমান: {formatCurrency(cost.currentEstimate)}</span>
                              <span className="font-bold text-red-500 text-xs">ঝুঁকি: {cost.potentialSpike}</span>
                           </div>
                           <div className="mt-2 text-xs text-slate-500 italic border-t border-slate-200 pt-2">
                              💡 {cost.mitigationTip}
                           </div>
                        </div>
                     ))}
                     {(!data.variableCostRisks || data.variableCostRisks.length === 0) && (
                        <div className="text-center text-slate-400 py-6">
                           কোনো ভেরিয়েবল কস্ট রিস্ক পাওয়া যায়নি।
                        </div>
                     )}
                  </div>
               </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 break-inside-avoid">
               
               {/* Stakeholder Scoring */}
               <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    কাস্টমার ও ভেন্ডর রিস্ক স্কোরিং
                  </h3>
                  <div className="space-y-4">
                     {data.stakeholderRisks?.map((stakeholder, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                              stakeholder.riskScore > 60 ? 'bg-red-500' : stakeholder.riskScore > 30 ? 'bg-orange-400' : 'bg-emerald-500'
                           }`}>
                              {stakeholder.riskScore}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="font-bold text-slate-700">{stakeholder.name}</h4>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{stakeholder.type}</span>
                                 </div>
                                 <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    stakeholder.reliability === 'High' ? 'bg-emerald-100 text-emerald-700' : 
                                    stakeholder.reliability === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                 }`}>{stakeholder.reliability} Reliability</span>
                              </div>
                              <p className="text-sm text-slate-500 mt-2 border-t border-slate-100 pt-2 italic">"{stakeholder.historyComment}"</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Mitigation Actions */}
               <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-yellow-400">
                    <Zap className="w-5 h-5" />
                    রিস্ক মিটিগেশন টিপস
                  </h3>
                  <div className="space-y-4">
                     {data.mitigationActions?.map((action, i) => (
                        <div key={i} className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm group">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{action.riskTitle}</span>
                              <button className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                 {action.actionTitle}
                                 <ChevronRight className="w-3 h-3" />
                              </button>
                           </div>
                           <p className="font-medium text-white/90 mb-2">{action.description}</p>
                           <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>{action.impact}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
