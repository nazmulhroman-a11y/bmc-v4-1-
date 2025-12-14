import React, { useState, useEffect } from "react";
import {
  BMCData,
  AnalysisResult,
  AppState,
  HistoryItem,
  BudgetPlan,
  DepartmentPlan,
} from "./types";
import { BMCInput } from "./components/BMCInput";
import { AnalysisReport } from "./components/AnalysisReport";
import { HistoryModal } from "./components/HistoryModal";
import { ActionPlan } from "./components/ActionPlan";
import { FinancialProjection } from "./components/FinancialProjection";
import { Roadmap } from "./components/Roadmap";
import { BudgetPlanView } from "./components/BudgetPlan";
import { CashFlowManager } from "./components/CashFlowManager";
import { LaunchDashboard } from "./components/LaunchDashboard";
import { UserGuideModal } from "./components/UserGuideModal";
import {
  analyzeBMC,
  generateBudgetPlan,
  generateCashFlowAnalysis,
  generateLaunchData,
} from "./services/geminiService";
import {
  LayoutGrid,
  Loader2,
  History,
  ArrowLeft,
  FileText,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

const initialBMCData: BMCData = {
  businessStage: "",
  primaryGoal: "",
  industry: "",
  keyPartners: "",
  keyActivities: "",
  keyResources: "",
  valuePropositions: "",
  customerRelationships: "",
  channels: "",
  customerSegments: "",
  costStructure: "",
  revenueStreams: "",
};

function App() {
  const [data, setData] = useState<BMCData>(initialBMCData);
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Loading States
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [isGeneratingCashFlow, setIsGeneratingCashFlow] = useState(false);
  const [isGeneratingLaunch, setIsGeneratingLaunch] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("bmc_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (currentData: BMCData, manual: boolean = false) => {
    const { businessStage, primaryGoal, industry, ...rest } = currentData;
    const hasData = Object.values(rest).some((v) => v.trim().length > 0);
    if (!hasData) return;

    const preview =
      currentData.valuePropositions ||
      currentData.keyActivities ||
      currentData.customerSegments ||
      "Untitled Plan";

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      preview: preview.slice(0, 60) + (preview.length > 60 ? "..." : ""),
      data: { ...currentData },
    };

    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("bmc_history", JSON.stringify(updated));

    if (manual) {
      // alert("Draft Saved!");
    }
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("bmc_history", JSON.stringify(updated));
  };

  const handleRestoreHistory = (oldData: BMCData) => {
    const restoredData = { ...initialBMCData, ...oldData };
    setData(restoredData);
    setAppState(AppState.INPUT);
    setAnalysisResult(null);
  };

  const handleInputChange = (field: keyof BMCData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    saveToHistory(data);
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const result = await analyzeBMC(data);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError(
        "দুঃখিত, এনালাইসিস করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
      setAppState(AppState.INPUT);
    }
  };

  const handleGenerateBudget = async () => {
    if (!analysisResult) return;
    if (analysisResult.budgetPlan) {
      setAppState(AppState.BUDGET_PLAN);
      return;
    }

    setIsGeneratingBudget(true);
    try {
      const budget = await generateBudgetPlan(data, analysisResult);
      const updatedResult = { ...analysisResult, budgetPlan: budget };
      setAnalysisResult(updatedResult);
      setAppState(AppState.BUDGET_PLAN);
    } catch (err) {
      console.error(err);
      alert("বাজেট তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  // Called when user edits the budget manually
  const handleUpdateBudget = (updatedBudget: BudgetPlan) => {
    if (!analysisResult) return;

    setAnalysisResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        budgetPlan: updatedBudget,
        // CRITICAL: Reset cashFlowAnalysis so it is forced to regenerate based on NEW budget
        cashFlowAnalysis: undefined,
      };
    });
  };

  // Called when user edits the action plan (checks tasks, adds tasks)
  const handleUpdateActionPlan = (updatedPlan: DepartmentPlan[]) => {
    if (!analysisResult) return;
    setAnalysisResult((prev) => {
      if (!prev) return null;
      return { ...prev, departmentalActionPlan: updatedPlan };
    });
  };

  const handleGenerateCashFlow = async () => {
    if (!analysisResult || !analysisResult.budgetPlan) return;

    if (analysisResult.cashFlowAnalysis) {
      setAppState(AppState.CASH_FLOW_MANAGER);
      return;
    }

    setIsGeneratingCashFlow(true);
    try {
      // Always generate using the current (possibly edited) budget
      const cashFlowData = await generateCashFlowAnalysis(
        data,
        analysisResult.budgetPlan
      );
      const updatedResult = {
        ...analysisResult,
        cashFlowAnalysis: cashFlowData,
      };
      setAnalysisResult(updatedResult);
      setAppState(AppState.CASH_FLOW_MANAGER);
    } catch (err) {
      console.error(err);
      alert("রিস্ক এনালাইসিস করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsGeneratingCashFlow(false);
    }
  };

  const handleViewLaunchDashboard = async () => {
    if (!analysisResult) return;
    if (analysisResult.launchData) {
      setAppState(AppState.LAUNCH_DASHBOARD);
      return;
    }

    setIsGeneratingLaunch(true);
    try {
      const launchData = await generateLaunchData(data, analysisResult);
      const updatedResult = { ...analysisResult, launchData: launchData };
      setAnalysisResult(updatedResult);
      setAppState(AppState.LAUNCH_DASHBOARD);
    } catch (err) {
      console.error(err);
      alert(
        "লঞ্চ ড্যাশবোর্ড জেনারেট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।"
      );
    } finally {
      setIsGeneratingLaunch(false);
    }
  };

  const handleEditMode = () => {
    setAppState(AppState.INPUT);
  };

  const handleViewReport = () => {
    if (analysisResult) {
      setAppState(AppState.RESULT);
    }
  };

  const handleStartNew = () => {
    setAppState(AppState.INPUT);
    setAnalysisResult(null);
    setData(initialBMCData);
  };

  const handleViewActionPlan = () => {
    setAppState(AppState.ACTION_PLAN);
  };

  const handleViewProjection = () => {
    setAppState(AppState.FINANCIAL_PROJECTION);
  };

  const handleViewRoadmap = () => {
    setAppState(AppState.ROADMAP);
  };

  const handleBackToReport = () => {
    setAppState(AppState.RESULT);
  };

  const handleBackToActionPlan = () => {
    setAppState(AppState.ACTION_PLAN);
  };

  const handleBackToRoadmap = () => {
    setAppState(AppState.ROADMAP);
  };

  const handleBackToBudget = () => {
    setAppState(AppState.BUDGET_PLAN);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onDelete={deleteHistoryItem}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm transition-all sticky top-0 z-50">
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setAppState(AppState.INPUT)}
          >
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-all group-hover:scale-105">
              <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight flex flex-col md:block leading-tight">
              BMC <span className="text-indigo-600">Analyst</span>
              <span className="text-[10px] text-slate-400 md:hidden font-normal block">
                Your Business Consultant
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Guide Button - Always Visible */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium mr-1"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden lg:inline">কিভাবে ব্যবহার করবেন?</span>
            </button>

            {appState !== AppState.INPUT && appState !== AppState.ANALYZING && (
              <button
                onClick={handleEditMode}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-bold rounded-xl transition-all shadow-sm text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">এডিট মোড</span>
              </button>
            )}

            {appState === AppState.INPUT && analysisResult && (
              <button
                onClick={handleViewReport}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl transition-all shadow-md shadow-indigo-200 animate-fade-in text-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="">রিপোর্ট</span>
              </button>
            )}

            {(analysisResult || Object.values(data).some((v) => v)) && (
              <button
                onClick={handleStartNew}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="নতুন পরিকল্পনা শুরু করুন"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 text-sm"
              title="History"
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-bold hidden sm:inline">ইতিহাস</span>
              <span className="bg-slate-300 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {history.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {error && (
          <div className="max-w-4xl mx-auto mt-6 p-4 md:p-6 mx-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-lg animate-fade-in shadow-sm">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {appState === AppState.INPUT && (
          <BMCInput
            data={data}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onSaveDraft={() => saveToHistory(data, true)}
          />
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] animate-fade-in">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-white p-8 rounded-full shadow-2xl border border-indigo-100">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              আপনার পরিকল্পনা এনালাইসিস করা হচ্ছে...
            </h2>
            <p className="text-slate-500 max-w-xl text-lg md:text-xl leading-relaxed">
              বিজনেস মডেলের প্রতিটি দিক যাচাই করে আর্থিক পূর্বাভাস, রোডম্যাপ ও
              অ্যাকশন প্ল্যান তৈরি করা হচ্ছে...
            </p>
          </div>
        )}

        {appState === AppState.RESULT && analysisResult && (
          <AnalysisReport
            result={analysisResult}
            data={data}
            onReset={handleStartNew}
            onViewActionPlan={handleViewActionPlan}
            onViewProjection={handleViewProjection}
            onViewRoadmap={handleViewRoadmap}
          />
        )}

        {appState === AppState.ACTION_PLAN && analysisResult && (
          <ActionPlan
            result={analysisResult}
            onBack={handleBackToReport}
            onViewRoadmap={handleViewRoadmap}
            onUpdate={handleUpdateActionPlan}
            onLaunch={handleViewLaunchDashboard} // New Hook
            isLaunching={isGeneratingLaunch} // New Loading State
          />
        )}

        {/* NEW LAUNCH DASHBOARD RENDER */}
        {appState === AppState.LAUNCH_DASHBOARD &&
          analysisResult &&
          analysisResult.launchData && (
            <LaunchDashboard
              data={analysisResult.launchData}
              onBack={handleBackToActionPlan}
              onNext={handleViewRoadmap}
            />
          )}

        {appState === AppState.FINANCIAL_PROJECTION && analysisResult && (
          <FinancialProjection
            result={analysisResult}
            onBack={handleBackToReport}
          />
        )}

        {appState === AppState.ROADMAP && analysisResult && (
          <Roadmap
            result={analysisResult}
            onBack={handleBackToReport}
            onBackToActionPlan={handleBackToActionPlan}
            onGenerateBudget={handleGenerateBudget}
            isGeneratingBudget={isGeneratingBudget}
          />
        )}

        {appState === AppState.BUDGET_PLAN &&
          analysisResult &&
          analysisResult.budgetPlan && (
            <BudgetPlanView
              budget={analysisResult.budgetPlan}
              onBack={handleBackToRoadmap}
              onViewRiskManager={handleGenerateCashFlow}
              isGeneratingRisk={isGeneratingCashFlow}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

        {appState === AppState.CASH_FLOW_MANAGER &&
          analysisResult &&
          analysisResult.cashFlowAnalysis && (
            <CashFlowManager
              data={analysisResult.cashFlowAnalysis}
              onBack={handleBackToBudget}
            />
          )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 md:py-10 text-center text-slate-400 text-sm md:text-base">
        <p>
          © {new Date().getFullYear()} BMC Analyst. Powered by DataSync
          Solution.
        </p>
      </footer>
    </div>
  );
}

export default App;
