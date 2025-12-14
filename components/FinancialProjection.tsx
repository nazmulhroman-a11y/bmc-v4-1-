
import React, { useState } from 'react';
import { AnalysisResult, YearlyProjection, FinancialScenario } from '../types';
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, PieChart as PieIcon, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FinancialProjectionProps {
  result: AnalysisResult;
  onBack: () => void;
}

type ScenarioType = 'best' | 'moderate' | 'worst';

export const FinancialProjection: React.FC<FinancialProjectionProps> = ({ result, onBack }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('moderate');
  const [isDownloading, setIsDownloading] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
  };

  const projections = result.financialProjections || [];

  // Prepare data for charts based on active scenario
  const chartData = projections.map(p => ({
    name: p.year === 'Year 1' ? '১ম বছর' : p.year === 'Year 3' ? '৩য় বছর' : '৫ম বছর',
    revenue: p.scenarios[activeScenario].revenue,
    cost: p.scenarios[activeScenario].cost,
    profit: p.scenarios[activeScenario].profit,
  }));

  const handlePrint = () => {
    window.print();
  };

  const getProjectionHTML = () => {
     // HTML generation for download similar to other components
     const scenarioLabel = activeScenario === 'best' ? 'সর্বোত্তম (Best Case)' : activeScenario === 'moderate' ? 'মাঝারি (Moderate Case)' : 'সর্বনিম্ন (Worst Case)';
     
     return `
      <div style="font-family: 'Hind Siliguri', sans-serif; color: #1e293b; padding: 20px;">
        <h1 style="text-align: center; color: #4f46e5;">আর্থিক পূর্বাভাস (Financial Projection)</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 20px;">scenario: ${scenarioLabel}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left;">সময়কাল</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">রাজস্ব (Revenue)</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">খরচ (Cost)</th>
              <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">মুনাফা (Profit)</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.map(d => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">${d.name}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">${formatCurrency(d.revenue)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">${formatCurrency(d.cost)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold; color: ${d.profit > 0 ? '#16a34a' : '#dc2626'};">${formatCurrency(d.profit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
     `;
  };

  const downloadPDF = () => {
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
      alert("PDF library not loaded yet.");
      return;
    }
    setIsDownloading(true);
    const container = document.createElement('div');
    container.innerHTML = getProjectionHTML();
    container.style.width = '800px';
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: 'Financial_Projection.pdf',
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

  if (projections.length === 0) {
    return (
      <div className="w-full max-w-screen-xl mx-auto p-10 text-center">
         <h2 className="text-2xl font-bold text-slate-700">দুঃখিত, কোনো আর্থিক ডেটা পাওয়া যায়নি।</h2>
         <p className="text-slate-500 mb-6">অনুগ্রহ করে নতুন করে এনালাইসিস করুন।</p>
         <button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">ফিরে যান</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          রিপোর্টে ফিরে যান
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
             <TrendingUp className="w-8 h-8 text-indigo-600" />
             আর্থিক পূর্বাভাস (Financial Projection)
          </h2>
          <p className="text-slate-500 mt-2">AI দ্বারা অনুমিত আগামী ৫ বছরের সম্ভাব্য আয়-ব্যয়ের হিসাব</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={downloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border border-slate-200 shadow-sm"
          >
            {isDownloading ? <span className="animate-spin">...</span> : <Download className="w-5 h-5" />}
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold border border-slate-200"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scenario Toggles */}
      <div className="flex justify-center mb-8 no-print">
         <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            <button 
              onClick={() => setActiveScenario('worst')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeScenario === 'worst' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <div className={`w-2 h-2 rounded-full ${activeScenario === 'worst' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
               Worst Case
            </button>
            <button 
              onClick={() => setActiveScenario('moderate')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeScenario === 'moderate' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <div className={`w-2 h-2 rounded-full ${activeScenario === 'moderate' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
               Moderate Case
            </button>
            <button 
              onClick={() => setActiveScenario('best')}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeScenario === 'best' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               <div className={`w-2 h-2 rounded-full ${activeScenario === 'best' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
               Best Case
            </button>
         </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 break-inside-avoid">
         
         {/* Bar Chart: Revenue vs Cost */}
         <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-indigo-500" />
                 আয় বনাম ব্যয় (Revenue vs Cost)
               </h3>
               <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">BDT</span>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" name="রাজস্ব (Revenue)" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="cost" name="খরচ (Cost)" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Area Chart: Profit Growth */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 মুনাফার হার (Profit)
               </h3>
            </div>
            <div className="h-[250px] w-full flex-1">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="profit" name="মুনাফা (Profit)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
               </ResponsiveContainer>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
               <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">৫ম বছরে সম্ভাব্য মুনাফা</span>
               <div className="text-2xl font-bold text-emerald-700 mt-1">
                 {formatCurrency(chartData[2].profit)}
               </div>
            </div>
         </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">বিস্তারিত হিসাব ({activeScenario === 'best' ? 'Best Case' : activeScenario === 'moderate' ? 'Moderate Case' : 'Worst Case'})</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="p-5 font-bold text-slate-500 text-sm uppercase tracking-wider">সময়কাল</th>
                     <th className="p-5 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">রাজস্ব (Revenue)</th>
                     <th className="p-5 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">খরচ (Cost)</th>
                     <th className="p-5 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">নিট মুনাফা (Profit)</th>
                     <th className="p-5 font-bold text-slate-500 text-sm uppercase tracking-wider text-right">মার্জিন (%)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {chartData.map((row, i) => {
                     const margin = ((row.profit / row.revenue) * 100).toFixed(1);
                     return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="p-5 font-bold text-slate-700">{row.name}</td>
                           <td className="p-5 text-right font-medium text-slate-600">{formatCurrency(row.revenue)}</td>
                           <td className="p-5 text-right font-medium text-slate-600">{formatCurrency(row.cost)}</td>
                           <td className={`p-5 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(row.profit)}</td>
                           <td className="p-5 text-right text-slate-500">{margin}%</td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm">
         * এই পূর্বাভাসটি একটি কৃত্রিম বুদ্ধিমত্তা (AI) দ্বারা জেনারেট করা অনুমান। বাস্তব ব্যবসায়িক পরিস্থিতিতে সংখ্যাগুলি ভিন্ন হতে পারে।
      </div>
    </div>
  );
};
