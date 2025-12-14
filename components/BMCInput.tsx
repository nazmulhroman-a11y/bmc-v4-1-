import React, { useRef, useEffect } from "react";
import { BMCData, BMC_LABELS } from "../types";
import {
  Handshake,
  Activity,
  Box,
  Gift,
  Heart,
  Truck,
  Users,
  CreditCard,
  DollarSign,
  Save,
  X,
  Briefcase,
  ChevronDown,
  Target,
  Factory,
  ArrowRight,
} from "lucide-react";

interface BMCInputProps {
  data: BMCData;
  onChange: (field: keyof BMCData, value: string) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Handshake: <Handshake className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Box: <Box className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
};

// --- Options Data ---
const GOAL_OPTIONS = {
  New: [
    { value: "Validation", label: "আইডিয়া ভ্যালিডেশন (Idea Validation)" },
    { value: "FullPlan", label: "ফুল বিজনেস প্ল্যান (Comprehensive Planning)" },
    { value: "Pitch", label: "ইনভেস্টর/লোনের জন্য প্রস্তুতি (Investor Pitch)" },
    { value: "Launch", label: "লঞ্চ স্ট্র্যাটেজি (MVP/Launch Strategy)" },
  ],
  Existing: [
    {
      value: "ProblemSolving",
      label: "সমস্যা সমাধান (Solve Specific Problem)",
    },
    {
      value: "Expansion",
      label: "নতুন দিক নির্দেশনা (Expansion/Diversification)",
    },
    { value: "Optimization", label: "দক্ষতা ও লাভ বৃদ্ধি (Optimize & Scale)" },
    { value: "Investment", label: "বিনিয়োগ আকর্ষণ (Attract Investment)" },
  ],
};

const INDUSTRY_OPTIONS = [
  { value: "Retail", label: "খুচরা ও ই-কমার্স (Retail & E-commerce)" },
  { value: "Food", label: "খাদ্য ও রেস্তোরাঁ (Food & Restaurant)" },
  { value: "Service", label: "সেবা ও পরামর্শ (Service & Consulting)" },
  { value: "Education", label: "শিক্ষা ও প্রশিক্ষণ (Education & Training)" },
  { value: "Tech", label: "প্রযুক্তি ও সফটওয়্যার (Tech & Software)" },
  { value: "RealEstate", label: "নির্মাণ ও রিয়েল এস্টেট (Construction)" },
  { value: "RMG", label: "তৈরি পোশাক ও টেক্সটাইল (RMG & Textile)" },
  { value: "Agri", label: "কৃষি ও প্রক্রিয়াজাত খাদ্য (Agri & Agro)" },
  { value: "Healthcare", label: "স্বাস্থ্য সেবা (Healthcare)" },
  { value: "Other", label: "অন্যান্য (Other)" },
];

export const BMCInput: React.FC<BMCInputProps> = ({
  data,
  onChange,
  onSubmit,
  onSaveDraft,
}) => {
  // Check if at least some core fields are filled
  const isFormValid = Object.keys(data)
    .filter((k) => !["businessStage", "primaryGoal", "industry"].includes(k))
    .some((k) => (data[k as keyof BMCData] as string).trim().length > 0);

  // Clear goal if stage changes
  const handleStageChange = (val: string) => {
    onChange("businessStage", val);
    onChange("primaryGoal", ""); // Reset goal
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-8 pb-32">
      {/* <div className="text-center mb-8 mt-2">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">বিজনেস মডেল ক্যানভাস</h2>
        <p className="text-lg text-slate-500 max-w-3xl mx-auto font-normal">আপনার ব্যবসার খুঁটিনাটি নিচের বক্সগুলোতে লিখুন। সঠিক তথ্য দিলে এনালাইসিস আরও নিখুঁত হবে।</p>
      </div> */}

      {/* --- Multi-Level Dropdown Section --- */}
      <div className="max-w-4xl mx-auto mb-12 bg-white rounded-[20px] shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          এনালাইসিসের উদ্দেশ্য সেট করুন
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level 1: Business Type */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-slate-500 mb-2">
              ১. ব্যবসার ধরণ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-indigo-500" />
              </div>
              <select
                value={data.businessStage || ""}
                onChange={(e) => handleStageChange(e.target.value)}
                className="block w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium hover:bg-white"
              >
                <option value="" disabled>
                  নির্বাচন করুন...
                </option>
                <option value="New">🚀 নতুন ব্যবসা শুরু করতে চাই</option>
                <option value="Existing">🏢 আমার চলমান ব্যবসা</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Level 2: Primary Goal (Dependent) */}
          <div
            className={`relative group transition-opacity duration-300 ${
              !data.businessStage
                ? "opacity-50 pointer-events-none grayscale"
                : "opacity-100"
            }`}
          >
            <label className="block text-sm font-semibold text-slate-500 mb-2">
              ২. মূল উদ্দেশ্য
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <select
                value={data.primaryGoal || ""}
                onChange={(e) => onChange("primaryGoal", e.target.value)}
                className="block w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium hover:bg-white"
              >
                <option value="" disabled>
                  নির্বাচন করুন...
                </option>
                {data.businessStage === "New" &&
                  GOAL_OPTIONS.New.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                {data.businessStage === "Existing" &&
                  GOAL_OPTIONS.Existing.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Level 3: Industry (Optional) */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-slate-500 mb-2">
              ৩. ইন্ডাস্ট্রি / খাত (ঐচ্ছিক)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Factory className="h-4 w-4 text-pink-500" />
              </div>
              <select
                value={data.industry || ""}
                onChange={(e) => onChange("industry", e.target.value)}
                className="block w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-500 transition-all font-medium hover:bg-white"
              >
                <option value="">নির্বাচন করুন...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Message */}
        {data.businessStage && data.primaryGoal && (
          <div className="mt-6 flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in">
            <div className="p-1.5 bg-indigo-100 rounded-full text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <p className="text-sm text-indigo-800 font-medium">
              AI আপনার{" "}
              <span className="font-bold">
                "{data.businessStage === "New" ? "নতুন ব্যবসা" : "চলমান ব্যবসা"}
                "
              </span>
              -র জন্য
              <span className="font-bold mx-1">
                "
                {data.businessStage === "New"
                  ? GOAL_OPTIONS.New.find(
                      (g) => g.value === data.primaryGoal
                    )?.label.split("(")[0]
                  : GOAL_OPTIONS.Existing.find(
                      (g) => g.value === data.primaryGoal
                    )?.label.split("(")[0]}
                "
              </span>
              এর উপর ভিত্তি করে রিপোর্ট তৈরি করবে।
            </p>
          </div>
        )}
      </div>

      {/* --- BMC Inputs Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 xl:gap-6 auto-rows-fr">
        {/* Row 1 Top */}
        <div className="md:col-span-1 lg:row-span-2 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 group">
          <InputCard field="keyPartners" data={data} onChange={onChange} />
        </div>
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 group">
          <InputCard field="keyActivities" data={data} onChange={onChange} />
        </div>
        <div className="md:col-span-1 lg:row-span-2 flex flex-col bg-white rounded-2xl shadow-md border border-indigo-100 p-5 transition-all hover:shadow-lg hover:border-indigo-300 bg-gradient-to-b from-indigo-50/50 to-white group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
          <InputCard
            field="valuePropositions"
            data={data}
            onChange={onChange}
            highlight
          />
        </div>
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 group">
          <InputCard
            field="customerRelationships"
            data={data}
            onChange={onChange}
          />
        </div>
        <div className="md:col-span-1 lg:row-span-2 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 group">
          <InputCard field="customerSegments" data={data} onChange={onChange} />
        </div>

        {/* Row 1 Bottom */}
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 md:col-start-2 group">
          <InputCard field="keyResources" data={data} onChange={onChange} />
        </div>
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 md:col-start-4 group">
          <InputCard field="channels" data={data} onChange={onChange} />
        </div>

        {/* Row 2 Bottom */}
        <div className="md:col-span-1 lg:col-span-2.5 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 lg:col-span-2 group">
          <InputCard field="costStructure" data={data} onChange={onChange} />
        </div>
        <div className="md:col-span-1 lg:col-span-2.5 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-lg hover:border-indigo-200 lg:col-start-3 lg:col-span-3 group">
          <InputCard field="revenueStreams" data={data} onChange={onChange} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onSaveDraft}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-xl font-bold text-base shadow-sm border transition-all duration-300 flex items-center gap-2
              ${
                isFormValid
                  ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"
                  : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
              }`}
          >
            <Save className="w-4 h-4" />
            সেভ ড্রাফট
          </button>

          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-300 flex items-center gap-2
              ${
                isFormValid
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            {isFormValid ? (
              <>
                <SparklesIcon />
                এনালাইসিস করুন
              </>
            ) : (
              "তথ্য পূরণ করুন"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.39 9.39L22 12L14.39 14.39L12 22L9.61 14.39L2 12L9.61 9.39L12 2Z"
      fill="currentColor"
    />
  </svg>
);

const InputCard: React.FC<{
  field: keyof BMCData;
  data: BMCData;
  onChange: (field: keyof BMCData, value: string) => void;
  highlight?: boolean;
}> = ({ field, data, onChange, highlight }) => {
  const meta = BMC_LABELS[field];
  const value = (data[field] as string) || "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset to calculate scrollHeight correctly
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(scrollHeight, 120)}px`; // Adjust min-height
    }
  }, [value]);

  const handleClear = () => {
    onChange(field, "");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 transition-colors duration-300 ${
            highlight
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
          }`}
        >
          {iconMap[meta.icon]}
        </div>
        <div>
          <h3
            className={`font-bold text-lg leading-tight mb-0.5 ${
              highlight ? "text-indigo-900" : "text-slate-700"
            }`}
          >
            {meta.label}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="relative flex-1 group/input">
        <textarea
          ref={textareaRef}
          className={`w-full p-4 pr-9 pb-8 rounded-xl border bg-slate-50/50 focus:bg-white transition-all resize-none text-base leading-relaxed min-h-[120px] overflow-hidden block outline-none
            ${
              highlight
                ? "border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 shadow-sm"
                : "border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/30 hover:border-indigo-200"
            }`}
          placeholder="এখানে লিখুন..."
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />

        {/* Clear Button */}
        <div
          className={`absolute top-2 right-2 transition-all duration-200 ${
            value ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="মুছে ফেলুন"
            aria-label="Clear input"
          >
            <X size={16} />
          </button>
        </div>

        {/* Character Count */}
        <div className="absolute bottom-2 right-3 text-[10px] font-bold text-slate-300 pointer-events-none select-none bg-white/80 backdrop-blur-[2px] px-1.5 py-0.5 rounded border border-slate-100">
          {value.length}
        </div>
      </div>
    </div>
  );
};
