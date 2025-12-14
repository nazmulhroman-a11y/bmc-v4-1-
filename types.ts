
export interface BMCData {
  businessStage: string; // 'New' | 'Existing'
  primaryGoal: string;   // New Field: Specific objective (e.g. 'Validation', 'Pitch')
  industry: string;      // New Field: Industry sector
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valuePropositions: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  preview: string; // A short text preview (e.g. from Value Propositions)
  data: BMCData;
}

export interface RiskItem {
  risk: string;
  impact: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface MarketingStrategy {
  tagline: string;
  topChannels: string[];
  growthHack: string;
}

export interface ActionTask {
  id: string;
  text: string;
  isDone: boolean;
}

export interface RolePlan {
  role: string;
  tasks: ActionTask[];
}

export interface DepartmentPlan {
  department: string;
  roles: RolePlan[];
}

// Financial Projection Types
export interface FinancialMetrics {
  revenue: number;
  cost: number;
  profit: number;
}

export interface FinancialScenario {
  best: FinancialMetrics;
  moderate: FinancialMetrics;
  worst: FinancialMetrics;
}

export interface YearlyProjection {
  year: string; // "Year 1", "Year 3", "Year 5"
  scenarios: FinancialScenario;
}

// Roadmap / Timeline Types
export interface RoadmapItem {
  timeframe: string; // e.g., "Month 1 (Immediate)", "Month 2-3", "Month 4-6"
  department: string;
  task: string;
  deliverable: string; // What is the outcome?
  priority: 'High' | 'Medium' | 'Low'; 
  status: 'Planned' | 'In Progress' | 'Delayed' | 'Completed'; 
  resource: string; 
  startMonth?: number; // New Field for Gantt: 1, 2, 3...
  duration?: number;   // New Field for Gantt: 1, 2...
}

// Budget Plan Types
export interface BudgetItem {
  item: string;
  cost: number;
  type: 'One-time' | 'Recurring (Monthly)';
}

export interface BudgetCategory {
  category: string; // Marketing, Tech, Operations, Legal, etc.
  total: number;
  items: BudgetItem[];
}

export interface CostGuide {
  title: string;
  description: string;
}

export interface BudgetPlan {
  totalBudget: number;
  capex: number; // Capital Expenditure (One-time)
  opex: number;  // Operating Expenditure (Monthly run rate)
  currency: string;
  breakdown: BudgetCategory[];
  advice: string[]; // Financial tips
  costGuides: CostGuide[]; // New dynamic field
}

// --- NEW TYPES FOR LAUNCH DASHBOARD ---
export interface LaunchTask {
  id: string;
  task: string;
  source: string; // e.g., "Marketing Plan"
  isDone: boolean;
}

export interface LaunchPhase {
  phaseName: string; // "Day 1-3", "Day 4-7", "Day 8-14"
  tasks: LaunchTask[];
}

export interface SetupChecklistItem {
  id: string;
  item: string; // e.g., "Trade License"
  whyNeeded: string;
  riskIfIgnored: string;
  isDone: boolean;
}

export interface PanicSolution {
  category: 'Money' | 'Customer' | 'Fear';
  advice: string;
  actionStep: string;
}

export interface LaunchData {
  readinessScore: number; // 0-100
  criticalMissing: string[]; // List of critical missing items
  first14Days: LaunchPhase[];
  setupChecklist: SetupChecklistItem[];
  firstMonthExpenseEstimate: number; // For the Mini Finance Tracker
  firstCustomerTactics: {
     title: string;
     description: string;
     costType: 'Low-cost' | 'Free' | 'Paid';
  }[];
  panicSolutions: PanicSolution[];
}

// --- NEW TYPES FOR MARKET INTELLIGENCE ---
export interface MarketSize {
  tam: string; // Total Addressable Market e.g. "5000 Crore BDT"
  sam: string; // Serviceable Available Market
  som: string; // Serviceable Obtainable Market
  unit: string; // e.g. "Active Users" or "BDT Yearly"
  growthRate: string; // e.g. "12% YoY"
}

export interface Competitor {
  name: string;
  type: string; // e.g. "Direct", "Indirect"
  strength: string;
  weakness: string;
}

export interface MarketAnalysis {
  marketSize: MarketSize;
  competitors: Competitor[];
  competitiveAdvantage: string; // Why us?
}

// --- NEW TYPES FOR CASH FLOW MANAGER ---
export interface PaymentAlert {
  billName: string;
  amount: number;
  dueDate: string; // e.g., "Day 5 of Month" or specific date
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Paid';
}

export interface CashFlowForecast {
  period: string; // "Month 1 (30 Days)", "Month 2 (60 Days)", "Month 3 (90 Days)"
  projectedInflow: number;
  projectedOutflow: number;
  netCashFlow: number;
  riskLevel: 'Safe' | 'Warning' | 'CRITICAL'; // Crunch warning
  analysis: string; // AI commentary
}

// New: Market Risk Indicators
export interface MarketRiskIndicator {
  indicatorName: string; // e.g., "Exchange Rate Volatility", "Raw Material Price"
  score: number; // 0-100 (Higher is riskier)
  trend: 'Rising' | 'Falling' | 'Stable';
  details: string;
}

// New: Stakeholder Scoring
export interface StakeholderRisk {
  name: string; // e.g., "Main Supplier X", "Corporate Client Y"
  type: 'Vendor' | 'Customer';
  riskScore: number; // 0-100 (Higher is riskier)
  reliability: 'High' | 'Medium' | 'Low';
  historyComment: string;
}

// New: Variable Cost Risk (API, Server, Marketing, HR)
export interface VariableCostRisk {
  category: string; // 'API Cost', 'Server', 'Marketing', 'HR'
  currentEstimate: number;
  volatility: 'High' | 'Medium' | 'Low'; // How much can it fluctuate?
  potentialSpike: string; // e.g. "+50% if users double"
  mitigationTip: string;
}

// New: Mitigation Actions
export interface MitigationAction {
  riskTitle: string;
  actionTitle: string; // The button text, e.g., "Order Stock Now"
  description: string;
  impact: string; // What happens if action is taken
}

export interface CashFlowAnalysis {
  currentCashPosition: number; // Simulated starting cash
  burnRate: number; // Monthly burn
  runwayMonths: number;
  forecasts: CashFlowForecast[];
  upcomingPayments: PaymentAlert[];
  cashCrunchWarning?: string; // Specific warning message if crunch is detected
  
  // New Fields
  marketRisks: MarketRiskIndicator[];
  stakeholderRisks: StakeholderRisk[];
  variableCostRisks: VariableCostRisk[]; // New Field
  mitigationActions: MitigationAction[];
}

export interface AnalysisResult {
  overallScore: number;
  executiveSummary: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  suggestions: string[];
  segmentAnalysis: {
    segment: string;
    feedback: string;
    score: number;
  }[];
  // New Features
  riskAnalysis: RiskItem[];
  kpis: string[]; // Key Metrics to track
  marketingStrategy: MarketingStrategy;
  elevatorPitch: string;
  marketAnalysis?: MarketAnalysis; // New Field for Market Intel
  departmentalActionPlan: DepartmentPlan[];
  financialProjections: YearlyProjection[];
  roadmap: RoadmapItem[];
  budgetPlan?: BudgetPlan; // Optional, generated on demand
  cashFlowAnalysis?: CashFlowAnalysis; // New Optional, generated on demand
  launchData?: LaunchData; // New Field for Launch Dashboard
}

export enum AppState {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ACTION_PLAN = 'ACTION_PLAN',
  LAUNCH_DASHBOARD = 'LAUNCH_DASHBOARD', // New State
  FINANCIAL_PROJECTION = 'FINANCIAL_PROJECTION',
  ROADMAP = 'ROADMAP',
  BUDGET_PLAN = 'BUDGET_PLAN',
  CASH_FLOW_MANAGER = 'CASH_FLOW_MANAGER', 
}

export const BMC_LABELS: Record<keyof BMCData, { label: string; description: string; icon: string }> = {
  businessStage: { label: "ব্যবসার ধরণ", description: "আপনার ব্যবসার বর্তমান অবস্থা", icon: "Briefcase" },
  primaryGoal: { label: "মূল উদ্দেশ্য", description: "কেন এনালাইসিস করছেন?", icon: "Target" },
  industry: { label: "ইন্ডাস্ট্রি", description: "আপনার ব্যবসার খাত", icon: "Factory" },
  keyPartners: { label: "মূল অংশীদার (Key Partners)", description: "আপনার সরবরাহকারী বা পার্টনার কারা?", icon: "Handshake" },
  keyActivities: { label: "মূল কার্যক্রম (Key Activities)", description: "ব্যবসা চালাতে কী কী কাজ করতে হবে?", icon: "Activity" },
  keyResources: { label: "মূল সম্পদ (Key Resources)", description: "ব্যবসাটির জন্য কী কী রিসোর্স প্রয়োজন?", icon: "Box" },
  valuePropositions: { label: "মূল্য প্রস্তাবনা (Value Propositions)", description: "গ্রাহক কেন আপনার পণ্য কিনবে?", icon: "Gift" },
  customerRelationships: { label: "গ্রাহক সম্পর্ক (Customer Relationships)", description: "গ্রাহকদের সাথে সম্পর্ক কেমন হবে?", icon: "Heart" },
  channels: { label: "চ্যানেল (Channels)", description: "পণ্য বা সেবা কীভাবে গ্রাহকের কাছে পৌঁছাবে?", icon: "Truck" },
  customerSegments: { label: "গ্রাহক বিভাগ (Customer Segments)", description: "আপনার লক্ষ্য গ্রাহক কারা?", icon: "Users" },
  costStructure: { label: "ব্যয় কাঠামো (Cost Structure)", description: "প্রধান খরচগুলো কী কী?", icon: "CreditCard" },
  revenueStreams: { label: "আয়ের উৎস (Revenue Streams)", description: "টাকা কীভাবে আসবে?", icon: "DollarSign" },
};
