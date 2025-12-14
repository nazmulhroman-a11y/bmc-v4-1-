
import React, { useState, useEffect } from 'react';
import { BudgetPlan, BudgetItem } from '../types';
import { ArrowLeft, Coins, PieChart as PieIcon, TrendingDown, Briefcase, Download, Printer, Lightbulb, Wallet, FileText, ShieldCheck, ChevronRight, Edit3, Save, X, Plus, Trash2, Info, Cpu, Server, Megaphone, Users, Box, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BudgetPlanProps {
  budget: BudgetPlan;
  onBack: () => void;
  onViewRiskManager?: () => void;
  isGeneratingRisk?: boolean;
  onUpdateBudget?: (updatedBudget: BudgetPlan) => void;
}

export const BudgetPlanView: React.FC<BudgetPlanProps> = ({ budget, onBack, onViewRiskManager, isGeneratingRisk, onUpdateBudget }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localBudget, setLocalBudget] = useState<BudgetPlan>(budget);

  // Sync with prop changes if not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalBudget(budget);
    }
  }, [budget, isEditing]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#8b5cf6'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
  };

  // Recalculate totals based on items
  const recalculateTotals = (currentBudget: BudgetPlan): BudgetPlan => {
    let newCapex = 0;
    let newOpex = 0;
    let newTotal = 0;

    const newBreakdown = currentBudget.breakdown.map(cat => {
      const catTotal = cat.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
      
      cat.items.forEach(item => {
        const cost = Number(item.cost) || 0;
        if (item.type === 'One-time') {
          newCapex += cost;
        } else {
          newOpex += cost;
        }
      });
      
      return { ...cat, total: catTotal };
    });

    newTotal = newCapex + newOpex;

    return {
      ...currentBudget,
      totalBudget: newTotal,
      capex: newCapex,
      opex: newOpex,
      breakdown: newBreakdown
    };
  };

  const handleSave = () => {
    const updated = recalculateTotals(localBudget);
    setLocalBudget(updated);
    setIsEditing(false);
    if (onUpdateBudget) {
      onUpdateBudget(updated);
    }
  };

  const handleCancel = () => {
    setLocalBudget(budget);
    setIsEditing(false);
  };

  const handleItemChange = (catIndex: number, itemIndex: number, field: keyof BudgetItem, value: string | number) => {
    const newBreakdown = [...localBudget.breakdown];
    const newItem = { ...newBreakdown[catIndex].items[itemIndex], [field]: value };
    newBreakdown[catIndex].items[itemIndex] = newItem;
    
    // Live update items (totals will be finalized on save, but we update state to show typing)
    setLocalBudget({ ...localBudget, breakdown: newBreakdown });
  };

  const handleAddItem = (catIndex: number) => {
    const newBreakdown = [...localBudget.breakdown];
    newBreakdown[catIndex].items.push({
      item: 'New Item',
      cost: 0,
      type: 'One-time'
    });
    setLocalBudget({ ...localBudget, breakdown: newBreakdown });
  };

  const handleRemoveItem = (catIndex: number, itemIndex: number) => {
    const newBreakdown = [...localBudget.breakdown];
    newBreakdown[catIndex].items.splice(itemIndex, 1);
    setLocalBudget({ ...localBudget, breakdown: newBreakdown });
  };

  // Chart Data comes from localBudget (so it updates live or on save)
  const chartData = localBudget.breakdown.map(cat => ({
    name: cat.category,
    value: cat.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
  }));

  const handlePrint = () => {
    window.print();
  };

  // Helper for Cost Guide Icons
  const getGuideIcon = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes('tech') || t.includes('api') || t.includes('soft') || t.includes('dev')) return <Cpu className="w-5 h-5 text-indigo-600" />;
    if (t.includes('server') || t.includes('cloud') || t.includes('host') || t.includes('equip')) return <Server className="w-5 h-5 text-blue-600" />;
    if (t.includes('market') || t.includes('ad') || t.includes('promo') || t.includes('brand')) return <Megaphone className="w-5 h-5 text-pink-600" />;
    if (t.includes('hr') || t.includes('team') || t.includes('sala') || t.includes('staff')) return <Users className="w-5 h-5 text-emerald-600" />;
    if (t.includes('rent') || t.includes('office') || t.includes('space') || t.includes('shop')) return <Briefcase className="w-5 h-5 text-orange-600" />;
    if (t.includes('raw') || t.includes('mat') || t.includes('invent') || t.includes('stock')) return <Box className="w-5 h-5 text-purple-600" />;
    
    // Fallbacks
    if (index === 0) return <Briefcase className="w-5 h-5 text-indigo-600" />;
    if (index === 1) return <ShoppingBag className="w-5 h-5 text-blue-600" />;
    if (index === 2) return <Megaphone className="w-5 h-5 text-pink-600" />;
    return <Wallet className="w-5 h-5 text-emerald-600" />;
  };

  const getBudgetHTML = () => {
    return `
      <div style="font-family: 'Hind Siliguri', sans-serif; color: #1e293b; padding: 20px;">
        <h1 style="text-align: center; color: #059669; font-size: 24pt;">বাজেট প্ল্যান (Budget Plan)</h1>
        <p style="text-align: center; color: #64748b; margin-bottom: 30px;">সম্ভাব্য খরচ এবং বাজেট অ্যালোকেশন</p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px;">
           <div style="flex: 1; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; text-align: center;">
              <h3 style="margin: 0; color: #166534;">মোট বাজেট</h3>
              <p style="font-size: 18pt; font-weight: bold; color: #166534; margin: 5px 0;">${formatCurrency(localBudget.totalBudget)}</p>
           </div>
           <div style="flex: 1; background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; text-align: center;">
              <h3 style="margin: 0; color: #1e40af;">CAPEX (এককালীন)</h3>
              <p style="font-size: 18pt; font-weight: bold; color: #1e40af; margin: 5px 0;">${formatCurrency(localBudget.capex)}</p>
           </div>
           <div style="flex: 1; background: #fff7ed; padding: 15px; border-radius: 8px; border: 1px solid #fed7aa; text-align: center;">
              <h3 style="margin: 0; color: #9a3412;">OPEX (মাসিক)</h3>
              <p style="font-size: 18pt; font-weight: bold; color: #9a3412; margin: 5px 0;">${formatCurrency(localBudget.opex)}</p>
           </div>
        </div>

        ${localBudget.breakdown.map(cat => {
          const catTotal = cat.items.reduce((s, i) => s + (Number(i.cost)||0), 0);
          return `
          <div style="margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
               <strong style="color: #334155;">${cat.category}</strong>
               <strong style="color: #4f46e5;">${formatCurrency(catTotal)}</strong>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
               ${cat.items.map(item => `
                 <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px;">${item.item} <span style="font-size: 0.8em; color: #94a3b8;">(${item.type === 'One-time' ? 'এককালীন' : 'মাসিক'})</span></td>
                    <td style="padding: 10px; text-align: right;">${formatCurrency(item.cost)}</td>
                 </tr>
               `).join('')}
            </table>
          </div>
        `}).join('')}
        
        <div style="margin-top: 30px;">
           <h3>পরামর্শ</h3>
           <ul>${localBudget.advice.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  };

  const downloadWord = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Budget Plan</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; }
        </style>
      </head>
      <body>
        ${getBudgetHTML()}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Budget_Plan.doc';
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
    container.innerHTML = getBudgetHTML();
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: 'Budget_Plan.pdf',
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
    <div className="w-full max-w-screen-xl mx-auto p-4 md:p-8 pb-32 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-10 no-print">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
        >
            <ArrowLeft className="w-5 h-5" />
            রোডম্যাপে ফিরে যান
        </button>

        <div className="text-center">
           <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
             <Coins className="w-8 h-8 text-emerald-600" />
             বাজেট প্ল্যান (Budget Plan)
           </h2>
           <p className="text-slate-500 mt-2">আপনার অ্যাকশন প্ল্যান ও রোডম্যাপ অনুযায়ী সম্ভাব্য খরচের হিসাব</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
           
           {/* Edit Toggle */}
           {!isEditing ? (
             <button 
               onClick={() => setIsEditing(true)}
               className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 border border-indigo-200 transition-all font-bold"
             >
               <Edit3 className="w-4 h-4" />
               কাস্টমাইজ করুন
             </button>
           ) : (
             <div className="flex gap-2">
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all font-bold"
                >
                  <X className="w-4 h-4" />
                  বাতিল
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all font-bold"
                >
                  <Save className="w-4 h-4" />
                  সেভ করুন
                </button>
             </div>
           )}

           {/* RISK MANAGEMENT BUTTON */}
           {onViewRiskManager && !isEditing && (
             <button 
                onClick={onViewRiskManager}
                disabled={isGeneratingRisk}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-200/50 transition-all font-bold hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
             >
                {isGeneratingRisk ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Money & Risk Management</span>
                {!isGeneratingRisk && <ChevronRight className="w-4 h-4" />}
             </button>
           )}

           <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={downloadWord}
                className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg"
                title="Download Word"
              >
                <FileText className="w-5 h-5" />
              </button>
              
              <button 
                onClick={downloadPDF}
                disabled={isDownloading}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Download PDF"
              >
                {isDownloading ? <span className="block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span> : <Download className="w-5 h-5" />}
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Printer className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {isEditing && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
           <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Edit3 className="w-5 h-5" /></div>
           <div>
             <h4 className="font-bold text-indigo-900">এডিট মোড চালু আছে</h4>
             <p className="text-sm text-indigo-700">আপনি খরচের নাম ও পরিমাণ পরিবর্তন করতে পারবেন। পরিবর্তন শেষে "সেভ করুন" বাটনে ক্লিক করুন।</p>
           </div>
        </div>
      )}

      {/* Overview Cards (Uses localBudget to show live updates during edit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 break-inside-avoid">
         <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-3 mb-2 opacity-90">
               <Wallet className="w-5 h-5" />
               <span className="font-bold text-sm uppercase tracking-wide">মোট বাজেট (Estimated)</span>
            </div>
            {/* Live calculation if editing, else static */}
            <div className="text-3xl font-black">
               {isEditing 
                  ? formatCurrency(localBudget.breakdown.reduce((acc, cat) => acc + cat.items.reduce((s, i) => s + (Number(i.cost) || 0), 0), 0))
                  : formatCurrency(localBudget.totalBudget)
               }
            </div>
            <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">আনুমানিক প্রয়োজন</div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-indigo-600">
               <Briefcase className="w-5 h-5" />
               <span className="font-bold text-sm uppercase tracking-wide">CAPEX (এককালীন)</span>
            </div>
             <div className="text-3xl font-bold text-slate-800">
               {isEditing 
                  ? formatCurrency(localBudget.breakdown.reduce((acc, cat) => acc + cat.items.filter(i => i.type === 'One-time').reduce((s, i) => s + (Number(i.cost) || 0), 0), 0))
                  : formatCurrency(localBudget.capex)
               }
            </div>
            <p className="text-slate-400 text-xs mt-2">সেটআপ, লাইসেন্স, ইকুইপমেন্ট</p>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-orange-600">
               <TrendingDown className="w-5 h-5" />
               <span className="font-bold text-sm uppercase tracking-wide">OPEX (মাসিক)</span>
            </div>
             <div className="text-3xl font-bold text-slate-800">
               {isEditing 
                  ? formatCurrency(localBudget.breakdown.reduce((acc, cat) => acc + cat.items.filter(i => i.type !== 'One-time').reduce((s, i) => s + (Number(i.cost) || 0), 0), 0))
                  : formatCurrency(localBudget.opex)
               }
            </div>
            <p className="text-slate-400 text-xs mt-2">বেতন, মার্কেটিং, ভাড়া, বিল</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 break-inside-avoid">
         {/* Allocation Chart */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <PieIcon className="w-5 h-5 text-indigo-500" />
               খরচের খাতসমূহ
            </h3>
            <div className="w-full h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip formatter={(val: number) => formatCurrency(val)} />
                     <Legend />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Detailed Breakdown with Editing */}
         <div className="lg:col-span-2 space-y-6">
            {localBudget.breakdown.map((cat, idx) => (
               <div key={idx} className={`bg-white rounded-2xl border transition-all ${isEditing ? 'border-indigo-200 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                  <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
                     <h4 className="font-bold text-slate-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        {cat.category}
                     </h4>
                     <span className="font-bold text-slate-800">
                        {isEditing 
                           ? formatCurrency(cat.items.reduce((s, i) => s + (Number(i.cost)||0), 0))
                           : formatCurrency(cat.total)
                        }
                     </span>
                  </div>
                  <div className="p-4">
                     <table className="w-full text-sm">
                        <tbody>
                           {cat.items.map((item, i) => (
                              <tr key={i} className="border-b border-slate-50 last:border-0 group">
                                 <td className="py-3 px-2">
                                    {isEditing ? (
                                       <input 
                                          type="text" 
                                          value={item.item} 
                                          onChange={(e) => handleItemChange(idx, i, 'item', e.target.value)}
                                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                       />
                                    ) : (
                                       <span className="text-slate-600 font-medium">{item.item}</span>
                                    )}
                                 </td>
                                 <td className="py-3 px-2 text-right">
                                    {isEditing ? (
                                       <select 
                                          value={item.type} 
                                          onChange={(e) => handleItemChange(idx, i, 'type', e.target.value)}
                                          className="p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                                       >
                                          <option value="One-time">এককালীন</option>
                                          <option value="Recurring (Monthly)">মাসিক</option>
                                       </select>
                                    ) : (
                                       <span className={`text-xs px-2 py-0.5 rounded mr-2 ${item.type === 'One-time' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                          {item.type === 'One-time' ? 'এককালীন' : 'মাসিক'}
                                       </span>
                                    )}
                                 </td>
                                 <td className="py-3 px-2 text-right w-40">
                                    {isEditing ? (
                                       <div className="relative">
                                          <span className="absolute left-3 top-2 text-slate-400">৳</span>
                                          <input 
                                             type="number" 
                                             value={item.cost} 
                                             onChange={(e) => handleItemChange(idx, i, 'cost', Number(e.target.value))}
                                             className="w-full pl-6 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-right font-mono"
                                          />
                                       </div>
                                    ) : (
                                       <span className="font-bold text-slate-700">{formatCurrency(item.cost)}</span>
                                    )}
                                 </td>
                                 {isEditing && (
                                    <td className="py-3 px-2 text-center w-10">
                                       <button 
                                          onClick={() => handleRemoveItem(idx, i)}
                                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    </td>
                                 )}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     
                     {isEditing && (
                        <div className="mt-3">
                           <button 
                              onClick={() => handleAddItem(idx)}
                              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                           >
                              <Plus className="w-4 h-4" />
                              নতুন খরচ যোগ করুন
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Advice Section */}
      <div className="bg-indigo-900 rounded-[2rem] p-8 text-white break-inside-avoid shadow-xl">
         <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            আর্থিক পরামর্শ (Financial Advice)
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localBudget.advice.map((tip, i) => (
               <div key={i} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex gap-4">
                  <span className="text-indigo-300 font-bold text-lg">#{i+1}</span>
                  <p className="text-indigo-50 leading-relaxed">{tip}</p>
               </div>
            ))}
         </div>
      </div>

      {/* Cost Guide Section (Dynamic) */}
      {localBudget.costGuides && localBudget.costGuides.length > 0 && (
         <div className="mt-8 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
               <Info className="w-6 h-6 text-cyan-600" />
               খরচের খাত পরিচিতি (Cost Categories Guide)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {localBudget.costGuides.map((guide, idx) => {
                  // Determine styles based on index for variety
                  const styleClass = idx % 4 === 0 ? 'hover:border-indigo-200 bg-indigo-50 text-indigo-600' :
                                     idx % 4 === 1 ? 'hover:border-blue-200 bg-blue-50 text-blue-600' :
                                     idx % 4 === 2 ? 'hover:border-pink-200 bg-pink-50 text-pink-600' :
                                     'hover:border-emerald-200 bg-emerald-50 text-emerald-600';
                  
                  return (
                     <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${styleClass.split(' ').slice(1).join(' ')}`}>
                           {getGuideIcon(guide.title, idx)}
                        </div>
                        <h4 className="font-bold text-slate-700 mb-2">{guide.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{guide.description}</p>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

    </div>
  );
};
