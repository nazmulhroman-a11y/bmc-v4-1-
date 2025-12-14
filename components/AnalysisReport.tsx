import React, { useRef, useState } from "react";
import { AnalysisResult, BMCData, BMC_LABELS } from "../types";

// Type declaration for html2pdf
declare global {
  interface Window {
    html2pdf: () => any;
  }
}
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowLeft,
  FileText,
  Printer,
  Download,
  Layers,
  TrendingUp,
  ShieldAlert,
  Megaphone,
  Quote,
  CheckSquare,
  Zap,
  Activity,
  Info,
  CalendarClock,
  Sparkles,
  Globe,
  Users,
  ShoppingBag,
  Sword,
} from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  data: BMCData;
  onReset: () => void;
  onViewActionPlan: () => void;
  onViewProjection: () => void;
  onViewRoadmap: () => void; // New prop
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  result,
  data,
  onReset,
  onViewActionPlan,
  onViewProjection,
  onViewRoadmap,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullDownloading, setIsFullDownloading] = useState(false);

  const scoreData = [
    { name: "Score", value: result.overallScore },
    { name: "Remaining", value: 100 - result.overallScore },
  ];

  // Dynamic color for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 60) return "#4f46e5"; // Indigo
    if (score >= 40) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const SCORE_COLOR = getScoreColor(result.overallScore);
  const COLORS = [SCORE_COLOR, "#f1f5f9"];

  const radarData = result.segmentAnalysis.map((item) => ({
    subject: item.segment,
    A: item.score,
    fullMark: 10,
  }));

  const handlePrint = () => {
    window.print();
  };

  // Helper function to generate HTML for Word download
  const getInputHTML = () => {
    const orderedKeys = Object.keys(BMC_LABELS) as (keyof BMCData)[];
    return `
      <div class="pdf-section" style="margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
        <h2 style="color: #1e293b; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">আপনার ইনপুট (BMC Data)</h2>
        ${orderedKeys
          .map((key) => {
            const val = data[key];
            if (!val) return "";
            return `
            <div style="margin-bottom: 15px; page-break-inside: avoid;">
              <h3 style="color: #4f46e5; margin: 0 0 5px 0; font-size: 14pt;">${BMC_LABELS[key].label}</h3>
              <p style="margin: 0; color: #333; background-color: #f8fafc; padding: 10px; border-radius: 5px; border: 1px solid #e2e8f0;">${val}</p>
            </div>
          `;
          })
          .join("")}
      </div>
     `;
  };

  const getReportHTML = () => {
    // Generate Market Analysis HTML if available
    let marketHtml = "";
    if (result.marketAnalysis) {
      marketHtml = `
          <div style="page-break-inside: avoid;">
             <h2>মার্কেট ইন্টেলিজেন্স (Market Intelligence)</h2>
             
             <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                <h3 style="color: #0ea5e9;">TAM / SAM / SOM</h3>
                <p><strong>TAM (Total Addressable Market):</strong> ${
                  result.marketAnalysis.marketSize.tam
                }</p>
                <p><strong>SAM (Serviceable Available Market):</strong> ${
                  result.marketAnalysis.marketSize.sam
                }</p>
                <p><strong>SOM (Serviceable Obtainable Market):</strong> ${
                  result.marketAnalysis.marketSize.som
                }</p>
                <p><em>Unit: ${
                  result.marketAnalysis.marketSize.unit
                }, Growth: ${
        result.marketAnalysis.marketSize.growthRate
      }</em></p>
             </div>

             <h3>প্রতিযোগী বিশ্লেষণ (Competitors)</h3>
             <table style="width: 100%; border-collapse: collapse;">
               <thead>
                 <tr>
                   <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                   <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
                   <th style="border: 1px solid #ddd; padding: 8px;">Strength</th>
                   <th style="border: 1px solid #ddd; padding: 8px;">Weakness</th>
                 </tr>
               </thead>
               <tbody>
                 ${result.marketAnalysis.competitors
                   .map(
                     (c) => `
                   <tr>
                     <td style="border: 1px solid #ddd; padding: 8px;">${c.name}</td>
                     <td style="border: 1px solid #ddd; padding: 8px;">${c.type}</td>
                     <td style="border: 1px solid #ddd; padding: 8px;">${c.strength}</td>
                     <td style="border: 1px solid #ddd; padding: 8px;">${c.weakness}</td>
                   </tr>
                 `
                   )
                   .join("")}
               </tbody>
             </table>
             <p style="margin-top: 10px;"><strong>আমাদের USP:</strong> ${
               result.marketAnalysis.competitiveAdvantage
             }</p>
          </div>
        `;
    }

    return `
      <div>
          <h2>ওভারভিউ (Overview)</h2>
          <p><strong>স্কোর:</strong> <span class="score" style="color: ${SCORE_COLOR}">${
      result.overallScore
    }/100</span></p>
          <p>${result.executiveSummary}</p>
        </div>
        
        <div style="margin-top: 30px; background-color: #f0fdf4; padding: 20px; border-radius: 10px; border: 1px solid #bbf7d0; page-break-inside: avoid;">
           <h3 style="color: #166534; margin-top:0;">ইনভেস্টর পিচ (Elevator Pitch)</h3>
           <p style="font-style: italic; font-size: 16pt;">"${
             result.elevatorPitch || "N/A"
           }"</p>
        </div>

        ${marketHtml}

        <div style="page-break-inside: avoid;">
          <h2>SWOT অ্যানালাইসিস</h2>
          
          <h3>শক্তিমত্তা (Strengths)</h3>
          <ul>${result.swot.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>

          <h3>দুর্বলতা (Weaknesses)</h3>
          <ul>${result.swot.weaknesses
            .map((s) => `<li>${s}</li>`)
            .join("")}</ul>

          <h3>সুযোগ (Opportunities)</h3>
          <ul>${result.swot.opportunities
            .map((s) => `<li>${s}</li>`)
            .join("")}</ul>

          <h3>ঝুঁকি (Threats)</h3>
          <ul>${result.swot.threats.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        
        <div style="page-break-inside: avoid;">
           <h2>ঝুঁকি বিশ্লেষণ ও সমাধান (Risk Matrix)</h2>
           <table>
            <thead>
              <tr>
                <th>ঝুঁকি (Risk)</th>
                <th>প্রভাব (Impact)</th>
                <th>সম্ভাবনা (Prob.)</th>
                <th>সমাধান (Mitigation)</th>
              </tr>
            </thead>
            <tbody>
              ${(result.riskAnalysis || [])
                .map(
                  (item) => `
                <tr>
                  <td>${item.risk}</td>
                  <td>${item.impact}</td>
                  <td>${item.probability}</td>
                  <td>${item.mitigation}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <div style="page-break-inside: avoid;">
           <h2>মার্কেটিং ও মেট্রিক্স (KPIs)</h2>
           <p><strong>ট্যাগলাইন:</strong> ${
             result.marketingStrategy?.tagline || "N/A"
           }</p>
           <p><strong>গ্রোথ হ্যাক:</strong> ${
             result.marketingStrategy?.growthHack || "N/A"
           }</p>
           <h3>সাফল্য পরিমাপক (KPIs):</h3>
           <ul>
             ${(result.kpis || []).map((k) => `<li>${k}</li>`).join("")}
           </ul>
        </div>

        <div style="page-break-inside: avoid;">
          <h2>পরামর্শ (Suggestions)</h2>
          <ul>
            ${result.suggestions.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>
        
        ${
          result.departmentalActionPlan
            ? `
        <div>
          <h2>অ্যাকশন প্ল্যান (Action Plan)</h2>
           ${result.departmentalActionPlan
             .map(
               (d) => `
              <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; page-break-inside: avoid;">
                <h3 style="color: #2563eb; margin-top: 0;">${d.department}</h3>
                ${d.roles
                  .map(
                    (r) => `
                  <div style="margin-bottom: 10px;">
                    <h4 style="margin: 5px 0; color: #475569;">${r.role}</h4>
                    <ul>
                      ${r.tasks.map((t) => `<li>${t.text}</li>`).join("")}
                    </ul>
                  </div>
                `
                  )
                  .join("")}
              </div>
           `
             )
             .join("")}
        </div>
        `
            : ""
        }
    `;
  };

  const downloadWord = (includeInput: boolean) => {
    const inputContent = includeInput ? getInputHTML() : "";
    const reportContent = getReportHTML();

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>BMC Analysis Report</title>
        <style>
          body { font-family: 'Hind Siliguri', sans-serif; font-size: 14pt; }
          h1 { color: #4f46e5; font-size: 24pt; margin-bottom: 20px; text-align: center; }
          h2 { color: #333; font-size: 18pt; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          h3 { font-size: 16pt; }
          h4 { font-size: 14pt; font-weight: bold; }
          p { margin-bottom: 15px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; color: #333; }
          .score { font-size: 28pt; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>বিজনেজ মডেল ক্যানভাস (BMC) রিপোর্ট</h1>
        ${inputContent}
        ${reportContent}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = includeInput ? "BMC_Full_Report.doc" : "BMC_Report.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (includeInput: boolean) => {
    if (!reportRef.current) return;

    if (includeInput) setIsFullDownloading(true);
    else setIsDownloading(true);

    // @ts-ignore
    if (typeof window.html2pdf === "undefined") {
      alert("PDF library not loaded yet. Please try printing instead.");
      setIsDownloading(false);
      setIsFullDownloading(false);
      return;
    }

    // Create a container specifically formatted for A4 PDF output
    const container = document.createElement("div");
    container.style.width = "800px"; // Fixed width for A4
    container.style.margin = "0 auto";
    container.style.backgroundColor = "white";
    container.style.fontFamily = "'Hind Siliguri', sans-serif";
    container.style.color = "#1e293b";

    // Inject specific CSS for PDF to handle breaks
    const style = document.createElement("style");
    style.innerHTML = `
      .pdf-card { 
        border: 1px solid #e2e8f0; 
        border-radius: 12px; 
        padding: 20px; 
        margin-bottom: 20px; 
        background-color: white;
        page-break-inside: avoid;
      }
      .pdf-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
      .pdf-subtitle { font-size: 18px; font-weight: bold; color: #475569; margin-top: 10px; margin-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px; }
      th { background-color: #f1f5f9; text-align: left; padding: 8px; font-weight: bold; border: 1px solid #cbd5e1; }
      td { padding: 8px; border: 1px solid #cbd5e1; vertical-align: top; }
      ul { padding-left: 20px; margin-top: 5px; }
      li { margin-bottom: 5px; font-size: 14px; }
      .score-box { text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    `;
    container.appendChild(style);

    const title = document.createElement("h1");
    title.innerText = "বিজনেস মডেল ক্যানভাস (BMC) রিপোর্ট";
    title.style.textAlign = "center";
    title.style.color = "#4f46e5";
    title.style.fontSize = "32px";
    title.style.marginBottom = "30px";
    container.appendChild(title);

    // Build PDF content manually to ensure clean layout
    let contentHTML = "";

    if (includeInput) {
      contentHTML += getInputHTML();
    }

    // Hero Section (Score)
    contentHTML += `
      <div class="pdf-card">
        <div class="score-box">
          <div style="font-size: 48px; font-weight: bold; color: ${SCORE_COLOR}">${result.overallScore}/100</div>
          <div style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold;">Overall Score</div>
        </div>
        <div class="pdf-title">এক্সিকিউটিভ সামারি</div>
        <p style="font-size: 14px; line-height: 1.6;">${result.executiveSummary}</p>
        <div style="margin-top: 15px; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
          <strong>Pitch:</strong> "<em>${result.elevatorPitch}</em>"
        </div>
      </div>
    `;

    // Market Analysis (PDF)
    if (result.marketAnalysis) {
      contentHTML += `
          <div class="pdf-card">
             <div class="pdf-title">মার্কেট ইন্টেলিজেন্স</div>
             
             <div style="margin-bottom: 15px; background: #f0f9ff; padding: 10px; border-radius: 8px; border: 1px solid #bae6fd;">
                <strong>TAM:</strong> ${
                  result.marketAnalysis.marketSize.tam
                }<br/>
                <strong>SAM:</strong> ${
                  result.marketAnalysis.marketSize.sam
                }<br/>
                <strong>SOM:</strong> ${result.marketAnalysis.marketSize.som}
             </div>

             <div class="pdf-subtitle">প্রতিযোগী বিশ্লেষণ</div>
             <table>
               <thead><tr><th>Name</th><th>Str.</th><th>Weak.</th></tr></thead>
               <tbody>
                 ${result.marketAnalysis.competitors
                   .map(
                     (c) =>
                       `<tr><td><b>${c.name}</b><br/><small>${c.type}</small></td><td>${c.strength}</td><td>${c.weakness}</td></tr>`
                   )
                   .join("")}
               </tbody>
             </table>
             <div style="margin-top: 10px;"><b>USP:</b> ${
               result.marketAnalysis.competitiveAdvantage
             }</div>
          </div>
        `;
    }

    // Segment Analysis (Table)
    contentHTML += `
      <div class="pdf-card">
        <div class="pdf-title">প্যারামিটার বিশ্লেষণ</div>
        <table>
          <thead><tr><th>Segment</th><th>Feedback</th><th>Score</th></tr></thead>
          <tbody>
            ${result.segmentAnalysis
              .map(
                (s) =>
                  `<tr><td><b>${s.segment}</b></td><td>${s.feedback}</td><td>${s.score}/10</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // SWOT
    contentHTML += `
      <div class="pdf-card">
        <div class="pdf-title">SWOT অ্যানালাইসিস</div>
        <table style="border: none;">
          <tr>
            <td style="width: 50%; border: none; padding-right: 10px;">
              <div style="background: #f0fdf4; padding: 10px; border-radius: 8px; height: 100%;">
                <div style="color: #166534; font-weight: bold;">শক্তিমত্তা (Strengths)</div>
                <ul>${result.swot.strengths
                  .map((s) => `<li>${s}</li>`)
                  .join("")}</ul>
              </div>
            </td>
            <td style="width: 50%; border: none; padding-left: 10px;">
              <div style="background: #fff7ed; padding: 10px; border-radius: 8px; height: 100%;">
                <div style="color: #9a3412; font-weight: bold;">দুর্বলতা (Weaknesses)</div>
                <ul>${result.swot.weaknesses
                  .map((s) => `<li>${s}</li>`)
                  .join("")}</ul>
              </div>
            </td>
          </tr>
          <tr><td style="height: 10px; border: none;"></td><td style="border: none;"></td></tr>
          <tr>
             <td style="width: 50%; border: none; padding-right: 10px;">
              <div style="background: #eff6ff; padding: 10px; border-radius: 8px; height: 100%;">
                <div style="color: #1e40af; font-weight: bold;">সুযোগ (Opportunities)</div>
                <ul>${result.swot.opportunities
                  .map((s) => `<li>${s}</li>`)
                  .join("")}</ul>
              </div>
            </td>
            <td style="width: 50%; border: none; padding-left: 10px;">
              <div style="background: #fef2f2; padding: 10px; border-radius: 8px; height: 100%;">
                <div style="color: #991b1b; font-weight: bold;">ঝুঁকি (Threats)</div>
                <ul>${result.swot.threats
                  .map((s) => `<li>${s}</li>`)
                  .join("")}</ul>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    // Risk
    if (result.riskAnalysis?.length) {
      contentHTML += `
        <div class="pdf-card">
          <div class="pdf-title">ঝুঁকি বিশ্লেষণ (Risk Matrix)</div>
          <table>
             <thead><tr><th>Risk</th><th>Impact</th><th>Prob.</th><th>Mitigation</th></tr></thead>
             <tbody>
               ${result.riskAnalysis
                 .map(
                   (r) =>
                     `<tr><td>${r.risk}</td><td>${r.impact}</td><td>${r.probability}</td><td>${r.mitigation}</td></tr>`
                 )
                 .join("")}
             </tbody>
          </table>
        </div>
      `;
    }

    // Marketing & KPI
    contentHTML += `
      <div class="pdf-card">
        <div class="pdf-title">মার্কেটিং ও মেট্রিক্স</div>
        <p><strong>Tagline:</strong> ${result.marketingStrategy?.tagline}</p>
        <p><strong>Growth Hack:</strong> ${
          result.marketingStrategy?.growthHack
        }</p>
        <div class="pdf-subtitle">KPIs</div>
        <ul>${(result.kpis || []).map((k) => `<li>${k}</li>`).join("")}</ul>
      </div>
    `;

    // Suggestions
    contentHTML += `
      <div class="pdf-card">
        <div class="pdf-title">পরামর্শ (Suggestions)</div>
        <ul>${result.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>
      </div>
    `;

    // Action Plan (if included in report section logic, usually separate but here we can add brief)
    if (result.departmentalActionPlan) {
      contentHTML += `
        <div class="pdf-card">
          <div class="pdf-title">ডিপার্টমেন্টাল অ্যাকশন প্ল্যান</div>
          ${result.departmentalActionPlan
            .map(
              (d) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold; color: #2563eb;">${
                d.department
              }</div>
              <ul style="margin-top: 5px;">
                 ${d.roles
                   .map(
                     (r) =>
                       `<li><b>${r.role}:</b> ${r.tasks
                         .map((t) => t.text)
                         .slice(0, 2)
                         .join(", ")}...</li>`
                   )
                   .join("")}
              </ul>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = contentHTML;
    container.appendChild(contentDiv);

    document.body.appendChild(container);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: includeInput
        ? "BMC_Full_Report.pdf"
        : "BMC_Analysis_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        windowWidth: 800,
      }, // Fixed window width helps
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // @ts-ignore
    window
      .html2pdf()
      .set(opt)
      .from(container)
      .save()
      .then(() => {
        setIsDownloading(false);
        setIsFullDownloading(false);
        document.body.removeChild(container);
      });
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8 animate-fade-in pb-24 font-sans text-slate-800">
      {/* Top Navigation / Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 no-print bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/20 z-30">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            রিপোর্ট ড্যাশবোর্ড
          </h2>
          <p className="text-slate-500 font-medium">আপনার ব্যবসার বিশ্লেষণ</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onViewActionPlan}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 transition-all font-bold hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-1">
              <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
              </span>
            </div>
            <CheckSquare className="w-5 h-5" />
            অ্যাকশন প্ল্যান
            <span className="bg-emerald-700 text-[10px] px-1.5 rounded-full text-white/90">
              Interactive
            </span>
          </button>

          <button
            onClick={onViewProjection}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 transition-all font-bold hover:-translate-y-0.5"
          >
            <TrendingUp className="w-5 h-5" />
            আর্থিক পূর্বাভাস
          </button>

          <button
            onClick={onViewRoadmap}
            className="group flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200/50 transition-all font-bold hover:-translate-y-0.5"
          >
            <CalendarClock className="w-5 h-5" />
            রোডম্যাপ
            <span className="bg-purple-700 text-[10px] px-1.5 rounded-full text-white/90 border border-purple-500/50">
              Budget & Risk
            </span>
          </button>

          {/* Group: Download Report Only */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => downloadWord(false)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download Word (Report)"
            >
              <FileText className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <button
              onClick={() => handleDownloadPDF(false)}
              disabled={isDownloading}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Download PDF (Report)"
            >
              {isDownloading ? (
                <span className="block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Group: Download Full */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-900 shadow-md">
            <span className="text-xs font-bold text-slate-200 px-2 uppercase tracking-wider hidden xl:inline">
              Input+Report
            </span>
            <button
              onClick={() => downloadWord(true)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Word (Full)"
            >
              <FileText className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white/20"></div>
            <button
              onClick={() => handleDownloadPDF(true)}
              disabled={isFullDownloading}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="PDF (Full)"
            >
              {isFullDownloading ? (
                <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Report Container - This is for SCREEN display only */}
      <div id="report-content" ref={reportRef} className="space-y-8">
        {/* Section 1: Hero Card (Score & Summary) */}
        <section className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="flex flex-col xl:flex-row">
            {/* Score Panel */}
            <div className="xl:w-1/3 bg-slate-50/50 p-8 xl:p-12 flex flex-col items-center justify-center border-b xl:border-b-0 xl:border-r border-slate-100">
              <div className="w-56 h-56 relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      innerRadius={80}
                      outerRadius={105}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                      paddingAngle={5}
                    >
                      {scoreData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-6xl font-black tracking-tighter"
                    style={{ color: SCORE_COLOR }}
                  >
                    {result.overallScore}
                  </span>
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Score
                  </span>
                </div>
              </div>

              <div
                className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                  result.overallScore >= 80
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : result.overallScore >= 60
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                    : "bg-orange-100 text-orange-700 border-orange-200"
                }`}
              >
                {result.overallScore >= 80
                  ? "চমৎকার পরিকল্পনা"
                  : result.overallScore >= 60
                  ? "ভালো পরিকল্পনা"
                  : "উন্নতি প্রয়োজন"}
              </div>
            </div>

            {/* Summary Panel */}
            <div className="flex-1 p-8 xl:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-500" />
                এক্সিকিউটিভ সামারি
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {result.executiveSummary}
              </p>

              {/* Elevator Pitch Sub-card */}
              {result.elevatorPitch && (
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 relative shadow-sm">
                  <Quote className="absolute top-4 left-4 text-indigo-200 w-10 h-10 -z-0 opacity-40" />
                  <h4 className="text-indigo-900 font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2 z-10 relative">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    এলিভেটর পিচ (Elevator Pitch)
                  </h4>
                  <p className="text-indigo-800 text-lg font-medium italic relative z-10 pl-2 border-l-4 border-indigo-300">
                    "{result.elevatorPitch}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 1.5: Market Intelligence (NEW) */}
        {result.marketAnalysis && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 break-inside-avoid">
            {/* TAM/SAM/SOM Visualization */}
            <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <Globe className="w-6 h-6 text-sky-500" />
                মার্কেট সাইজিং (Market Sizing)
              </h3>

              <div className="flex-1 flex flex-col justify-center items-center relative py-6">
                {/* Visualizing TAM/SAM/SOM as Concentric Circles (Styled Divs) */}

                {/* TAM */}
                <div className="relative w-72 h-72 rounded-full border-2 border-sky-100 bg-sky-50 flex items-center justify-center text-center shadow-sm z-10">
                  <div className="absolute top-4 text-xs font-bold text-sky-400 uppercase tracking-widest">
                    Total Market (TAM)
                  </div>

                  {/* SAM */}
                  <div className="relative w-52 h-52 rounded-full border-2 border-blue-200 bg-blue-100 flex items-center justify-center text-center shadow-md z-20">
                    <div className="absolute top-3 text-xs font-bold text-blue-500 uppercase tracking-widest">
                      Serviceable (SAM)
                    </div>

                    {/* SOM */}
                    <div className="relative w-32 h-32 rounded-full border-2 border-indigo-300 bg-indigo-600 flex flex-col items-center justify-center text-center shadow-lg z-30 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">
                        Target (SOM)
                      </span>
                      <span className="font-bold text-sm leading-tight px-2">
                        {result.marketAnalysis.marketSize.som}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend / Details */}
                <div className="w-full mt-8 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                    <div className="font-bold text-sky-600 mb-1">TAM</div>
                    <div className="text-slate-600">
                      {result.marketAnalysis.marketSize.tam}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="font-bold text-blue-600 mb-1">SAM</div>
                    <div className="text-slate-600">
                      {result.marketAnalysis.marketSize.sam}
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="font-bold text-indigo-600 mb-1">Growth</div>
                    <div className="text-slate-600">
                      {result.marketAnalysis.marketSize.growthRate}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Competitor Analysis */}
            <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <Sword className="w-6 h-6 text-red-500" />
                প্রতিযোগী বিশ্লেষণ (Competitors)
              </h3>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {result.marketAnalysis.competitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {comp.name}
                        </h4>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          {comp.type}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase block mb-1">
                          Strength
                        </span>
                        <p className="text-slate-600 leading-tight">
                          {comp.strength}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-500 uppercase block mb-1">
                          Weakness
                        </span>
                        <p className="text-slate-600 leading-tight">
                          {comp.weakness}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Our USP Highlight */}
                <div className="mt-6 p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                      Our Competitive Advantage (USP)
                    </span>
                  </div>
                  <p className="font-medium text-lg leading-relaxed">
                    "{result.marketAnalysis.competitiveAdvantage}"
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Section 2: Visual Analysis & Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 break-inside-avoid">
          {/* Radar Chart Card */}
          <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Target className="w-6 h-6 text-indigo-500" />
              প্যারামিটার বিশ্লেষণ
            </h3>
            <div className="h-[350px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={radarData}
                >
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke={SCORE_COLOR}
                    strokeWidth={3}
                    fill={SCORE_COLOR}
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Detailed Scores Card */}
          <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Info className="w-6 h-6 text-blue-500" />
              বিস্তারিত মূল্যায়ন
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {result.segmentAnalysis.map((seg, idx) => (
                <div
                  key={idx}
                  className="group p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700">
                      {seg.segment}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            seg.score >= 7
                              ? "bg-green-500"
                              : seg.score >= 4
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${seg.score * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {seg.score}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-700">
                    {seg.feedback}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Section 3: Marketing & KPIs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 break-inside-avoid">
          {/* Marketing Strategy */}
          <section className="xl:col-span-2 bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Megaphone className="w-6 h-6 text-pink-500" />
              মার্কেটিং স্ট্র্যাটেজি
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Tagline Box */}
              <div className="bg-pink-50 rounded-2xl p-6 flex flex-col justify-center border border-pink-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 relative z-10">
                  Tagline
                </span>
                <p className="text-2xl font-bold text-pink-700 relative z-10 leading-tight">
                  "{result.marketingStrategy?.tagline || "N/A"}"
                </p>
              </div>

              {/* Growth Hack Box */}
              <div className="bg-purple-50 rounded-2xl p-6 flex flex-col justify-center border border-purple-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 relative z-10">
                  Growth Hack
                </span>
                <p className="text-lg font-medium text-purple-800 relative z-10">
                  {result.marketingStrategy?.growthHack || "N/A"}
                </p>
              </div>

              {/* Channels */}
              <div className="md:col-span-2">
                <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                  সেরা চ্যানেলসমূহ
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(result.marketingStrategy?.topChannels || []).map(
                    (ch, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition-colors cursor-default border border-slate-200"
                      >
                        {ch}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              মেট্রিক্স (KPIs)
            </h3>
            <ul className="space-y-3">
              {(result.kpis || []).map((kpi, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 font-medium group-hover:text-blue-900 transition-colors">
                    {kpi}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Section 4: Risk Analysis Matrix */}
        {result.riskAnalysis && result.riskAnalysis.length > 0 && (
          <section className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              ঝুঁকি বিশ্লেষণ ও সমাধান (Risk Matrix)
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 pl-6 text-sm font-bold text-slate-500 uppercase tracking-wider">
                        ঝুঁকি (Risk)
                      </th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                        প্রভাব
                      </th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                        সম্ভাবনা
                      </th>
                      <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
                        সমাধান (Mitigation)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.riskAnalysis.map((item, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4 pl-6 font-semibold text-slate-700">
                          {item.risk}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              item.impact === "High"
                                ? "bg-red-50 text-red-600 border-red-100"
                                : item.impact === "Medium"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-green-50 text-green-600 border-green-100"
                            }`}
                          >
                            {item.impact}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              item.probability === "High"
                                ? "bg-red-50 text-red-600 border-red-100"
                                : item.probability === "Medium"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-green-50 text-green-600 border-green-100"
                            }`}
                          >
                            {item.probability}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {item.mitigation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: SWOT Analysis */}
        <section className="break-inside-avoid">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 pl-2">
            SWOT অ্যানালাইসিস
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SwotCard
              title="শক্তিমত্তা (Strengths)"
              items={result.swot.strengths}
              type="strength"
            />
            <SwotCard
              title="দুর্বলতা (Weaknesses)"
              items={result.swot.weaknesses}
              type="weakness"
            />
            <SwotCard
              title="সুযোগ (Opportunities)"
              items={result.swot.opportunities}
              type="opportunity"
            />
            <SwotCard
              title="ঝুঁকি (Threats)"
              items={result.swot.threats}
              type="threat"
            />
          </div>
        </section>

        {/* Section 6: Suggestions */}
        <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-200 break-inside-avoid">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3">
              <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                পরামর্শ
              </h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                আপনার ব্যবসাকে পরবর্তী ধাপে নিয়ে যেতে আমাদের এই বিষয়গুলোতে নজর
                দেওয়ার পরামর্শ দেওয়া হচ্ছে
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4">
              {result.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors"
                >
                  <span className="font-bold text-xl text-indigo-300 opacity-60">
                    #{index + 1}
                  </span>
                  <p className="text-lg text-white/90 font-light leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="text-center pt-8 text-slate-400 text-sm font-medium no-print">
          Generated by BMC Analyst • {new Date().toLocaleDateString("bn-BD")}
        </div>
      </div>

      <div className="flex justify-center pt-8 no-print pb-10">
        <button
          onClick={onReset}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-300 rounded-full text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 hover:shadow-lg transition-all text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          নতুন পরিকল্পনা শুরু করুন
        </button>
      </div>
    </div>
  );
};

const SwotCard: React.FC<{
  title: string;
  items: string[];
  type: "strength" | "weakness" | "opportunity" | "threat";
}> = ({ title, items, type }) => {
  const styles = {
    strength: {
      border: "border-green-100",
      headerBg: "bg-green-50",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      bullet: "bg-green-400",
    },
    weakness: {
      border: "border-orange-100",
      headerBg: "bg-orange-50",
      iconColor: "text-orange-600",
      titleColor: "text-orange-800",
      bullet: "bg-orange-400",
    },
    opportunity: {
      border: "border-blue-100",
      headerBg: "bg-blue-50",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      bullet: "bg-blue-400",
    },
    threat: {
      border: "border-red-100",
      headerBg: "bg-red-50",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      bullet: "bg-red-400",
    },
  };

  const style = styles[type];
  const Icon =
    type === "strength"
      ? CheckCircle
      : type === "weakness"
      ? AlertTriangle
      : type === "opportunity"
      ? Lightbulb
      : ShieldAlert;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${style.border} overflow-hidden hover:shadow-md transition-shadow`}
    >
      <div
        className={`${style.headerBg} p-4 border-b ${style.border} flex items-center gap-3`}
      >
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
        <h4 className={`text-lg font-bold ${style.titleColor}`}>{title}</h4>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-slate-700 flex gap-3 items-start leading-relaxed text-base"
            >
              <span
                className={`mt-2 w-1.5 h-1.5 rounded-full ${style.bullet} flex-shrink-0`}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
