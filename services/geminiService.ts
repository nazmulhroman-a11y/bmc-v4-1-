
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BMCData, AnalysisResult, BudgetPlan, CashFlowAnalysis, DepartmentPlan, LaunchData } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    executiveSummary: { type: Type.STRING },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"],
    },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    segmentAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          segment: { type: Type.STRING },
          feedback: { type: Type.STRING },
          score: { type: Type.NUMBER },
        },
        required: ["segment", "feedback", "score"],
      },
    },
    riskAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          probability: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          mitigation: { type: Type.STRING }
        },
        required: ["risk", "impact", "probability", "mitigation"]
      }
    },
    kpis: { type: Type.ARRAY, items: { type: Type.STRING } },
    marketingStrategy: {
      type: Type.OBJECT,
      properties: {
        tagline: { type: Type.STRING },
        topChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
        growthHack: { type: Type.STRING }
      },
      required: ["tagline", "topChannels", "growthHack"]
    },
    elevatorPitch: { type: Type.STRING },
    marketAnalysis: {
        type: Type.OBJECT,
        properties: {
            marketSize: {
                type: Type.OBJECT,
                properties: {
                    tam: { type: Type.STRING, description: "Total Addressable Market e.g. 500 Crore" },
                    sam: { type: Type.STRING, description: "Serviceable Available Market" },
                    som: { type: Type.STRING, description: "Serviceable Obtainable Market" },
                    unit: { type: Type.STRING, description: "e.g. BDT or Active Users" },
                    growthRate: { type: Type.STRING, description: "e.g. 12% YoY" }
                },
                required: ["tam", "sam", "som", "unit", "growthRate"]
            },
            competitors: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ["Direct", "Indirect"] },
                        strength: { type: Type.STRING },
                        weakness: { type: Type.STRING }
                    },
                    required: ["name", "type", "strength", "weakness"]
                }
            },
            competitiveAdvantage: { type: Type.STRING, description: "Why we win (USP)" }
        },
        required: ["marketSize", "competitors", "competitiveAdvantage"]
    },
    departmentalActionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING },
          roles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["role", "tasks"]
            }
          }
        },
        required: ["department", "roles"]
      }
    },
    financialProjections: {
      type: Type.ARRAY,
      description: "Projections for Year 1, Year 3, and Year 5",
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING, enum: ["Year 1", "Year 3", "Year 5"] },
          scenarios: {
            type: Type.OBJECT,
            properties: {
              best: {
                type: Type.OBJECT,
                properties: { revenue: { type: Type.NUMBER }, cost: { type: Type.NUMBER }, profit: { type: Type.NUMBER } },
                required: ["revenue", "cost", "profit"]
              },
              moderate: {
                type: Type.OBJECT,
                properties: { revenue: { type: Type.NUMBER }, cost: { type: Type.NUMBER }, profit: { type: Type.NUMBER } },
                required: ["revenue", "cost", "profit"]
              },
              worst: {
                type: Type.OBJECT,
                properties: { revenue: { type: Type.NUMBER }, cost: { type: Type.NUMBER }, profit: { type: Type.NUMBER } },
                required: ["revenue", "cost", "profit"]
              }
            },
            required: ["best", "moderate", "worst"]
          }
        },
        required: ["year", "scenarios"]
      }
    },
    roadmap: {
      type: Type.ARRAY,
      description: "A detailed strategic roadmap",
      items: {
        type: Type.OBJECT,
        properties: {
          timeframe: { type: Type.STRING, description: "e.g. Month 1, Month 2-3, Month 4-6" },
          department: { type: Type.STRING },
          task: { type: Type.STRING },
          deliverable: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          status: { type: Type.STRING, enum: ['Planned', 'In Progress', 'Delayed', 'Completed'] },
          resource: { type: Type.STRING, description: "Who is responsible? e.g. CTO, Marketing Team, Outsourced Agency" },
          startMonth: { type: Type.NUMBER, description: "Start month number (1-indexed). e.g. 1" },
          duration: { type: Type.NUMBER, description: "Duration in months. e.g. 1, 2, 3" }
        },
        required: ["timeframe", "department", "task", "deliverable", "priority", "status", "resource", "startMonth", "duration"]
      }
    }
  },
  required: ["overallScore", "executiveSummary", "swot", "suggestions", "segmentAnalysis", "riskAnalysis", "kpis", "marketingStrategy", "elevatorPitch", "marketAnalysis", "departmentalActionPlan", "financialProjections", "roadmap"],
};

const budgetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalBudget: { type: Type.NUMBER },
    capex: { type: Type.NUMBER, description: "Total One-time setup costs" },
    opex: { type: Type.NUMBER, description: "Monthly recurring operating costs" },
    currency: { type: Type.STRING, description: "BDT" },
    advice: { type: Type.ARRAY, items: { type: Type.STRING } },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          total: { type: Type.NUMBER },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                cost: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ['One-time', 'Recurring (Monthly)'] }
              }
            }
          }
        }
      }
    },
    costGuides: {
      type: Type.ARRAY,
      description: "Explain 4 major cost categories relevant to THIS specific business type in Bangla",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    }
  },
  required: ["totalBudget", "capex", "opex", "currency", "breakdown", "advice", "costGuides"]
};

const cashFlowSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    currentCashPosition: { type: Type.NUMBER, description: "Simulated starting capital/cash in hand" },
    burnRate: { type: Type.NUMBER, description: "Estimated monthly cash burn" },
    runwayMonths: { type: Type.NUMBER, description: "How many months until cash runs out" },
    cashCrunchWarning: { type: Type.STRING, description: "Warning message if cash < 0 in any month, else null or empty" },
    forecasts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING, description: "Month 1 (30 Days), Month 2 (60 Days), Month 3 (90 Days)" },
          projectedInflow: { type: Type.NUMBER },
          projectedOutflow: { type: Type.NUMBER },
          netCashFlow: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, enum: ['Safe', 'Warning', 'CRITICAL'] },
          analysis: { type: Type.STRING, description: "Brief analysis in Bangla" }
        },
        required: ["period", "projectedInflow", "projectedOutflow", "netCashFlow", "riskLevel", "analysis"]
      }
    },
    upcomingPayments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          billName: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          dueDate: { type: Type.STRING, description: "e.g. 5th of Month" },
          priority: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
          status: { type: Type.STRING, enum: ['Pending'] } // Always Pending for forecast
        },
        required: ["billName", "amount", "dueDate", "priority", "status"]
      }
    },
    marketRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            indicatorName: { type: Type.STRING, description: "e.g. Exchange Rate, Fuel Price, Market Volatility" },
            score: { type: Type.NUMBER, description: "0-100 score, high is bad" },
            trend: { type: Type.STRING, enum: ['Rising', 'Falling', 'Stable'] },
            details: { type: Type.STRING, description: "Why this matters to this specific industry" }
        },
        required: ["indicatorName", "score", "trend", "details"]
      }
    },
    stakeholderRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "A simulated partner name e.g. 'Supplier ABC' or 'Client Group X'" },
            type: { type: Type.STRING, enum: ['Vendor', 'Customer'] },
            riskScore: { type: Type.NUMBER, description: "0-100" },
            reliability: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            historyComment: { type: Type.STRING, description: "e.g. 'Usually delays delivery by 2 days'" }
        },
        required: ["name", "type", "riskScore", "reliability", "historyComment"]
      }
    },
    variableCostRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING, description: "API Cost, Server, Marketing, HR" },
            currentEstimate: { type: Type.NUMBER },
            volatility: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            potentialSpike: { type: Type.STRING, description: "e.g. +50% if users double" },
            mitigationTip: { type: Type.STRING }
        },
        required: ["category", "currentEstimate", "volatility", "potentialSpike", "mitigationTip"]
      }
    },
    mitigationActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            riskTitle: { type: Type.STRING },
            actionTitle: { type: Type.STRING, description: "Short button text e.g. 'Order Now', 'Call Vendor'" },
            description: { type: Type.STRING, description: "Detailed advice" },
            impact: { type: Type.STRING, description: "Positive outcome description" }
        },
        required: ["riskTitle", "actionTitle", "description", "impact"]
      }
    }
  },
  required: ["currentCashPosition", "burnRate", "runwayMonths", "forecasts", "upcomingPayments", "marketRisks", "stakeholderRisks", "variableCostRisks", "mitigationActions"]
};

// --- NEW SCHEMA FOR LAUNCH DASHBOARD ---
const launchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    readinessScore: { type: Type.NUMBER, description: "Score 0-100 based on preparedness" },
    criticalMissing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. Bank Account, Trade License" },
    first14Days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseName: { type: Type.STRING, enum: ['Day 1-3', 'Day 4-7', 'Day 8-14'] },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                source: { type: Type.STRING, description: "e.g. From Marketing Plan" }
              }
            }
          }
        }
      }
    },
    setupChecklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "e.g. Choose Name, Facebook Page" },
          whyNeeded: { type: Type.STRING },
          riskIfIgnored: { type: Type.STRING }
        }
      }
    },
    firstMonthExpenseEstimate: { type: Type.NUMBER, description: "Estimate bare minimum starting cost in BDT" },
    firstCustomerTactics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          costType: { type: Type.STRING, enum: ['Low-cost', 'Free', 'Paid'] }
        }
      }
    },
    panicSolutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ['Money', 'Customer', 'Fear'] },
          advice: { type: Type.STRING },
          actionStep: { type: Type.STRING }
        }
      }
    }
  },
  required: ["readinessScore", "criticalMissing", "first14Days", "setupChecklist", "firstMonthExpenseEstimate", "firstCustomerTactics", "panicSolutions"]
};

// --- Goal Mapping Helper ---
const getGoalDescription = (goal: string): string => {
  const map: Record<string, string> = {
    // New Business Goals
    Validation: "Goal: Validate the business idea. Focus on market feasibility, SWOT weaknesses, and initial financial risks.",
    FullPlan: "Goal: Create a comprehensive business plan. Focus on detail, structure, and long-term viability.",
    Pitch: "Goal: Prepare for Investors/Loans. Focus on ROI, Scalability, Exit Strategy, and convincing financial projections.",
    Launch: "Goal: MVP & Launch Strategy. Focus on low-cost entry, speed to market, and immediate next steps.",
    // Existing Business Goals
    ProblemSolving: "Goal: Solve specific operational problems. Focus on bottlenecks, efficiency, and threats.",
    Expansion: "Goal: Expansion/Diversification. Focus on new market entry, risks of scaling, and resource allocation.",
    Optimization: "Goal: Optimize & Scale. Focus on increasing profit margins, cutting costs, and improving KPIs.",
    Investment: "Goal: Attract Investment for Growth. Focus on valuation, historical growth (implied), and future projections."
  };
  return map[goal] || "Goal: General Analysis";
};

export const analyzeBMC = async (data: BMCData): Promise<AnalysisResult> => {
  const businessContext = data.businessStage === 'New' 
    ? "NOTE: This is a NEW BUSINESS IDEA (Startup)."
    : data.businessStage === 'Existing'
    ? "NOTE: This is an EXISTING BUSINESS."
    : "NOTE: Business stage not specified, treat as general business case.";

  const goalContext = getGoalDescription(data.primaryGoal);
  const industryContext = data.industry ? `Industry Sector: ${data.industry}` : "Industry: General";

  const promptText = `
    **ROLE & PERSONA:**
    তুমি একজন অভিজ্ঞ বিজনেস কনসালটেন্ট এবং স্ট্র্যাটেজিস্ট, যার নাম "BMC AI Analyst"। তোমার কাজ ব্যবহারকারীর দেওয়া ব্যবসায়িক তথ্য বিশ্লেষণ করে একটি সম্পূর্ণ, প্র্যাকটিক্যাল এবং অ্যাকশনেবল বিজনেস রিপোর্ট তৈরি করা।

    **CONTEXT:**
    ${businessContext}
    ${goalContext}
    ${industryContext}

    **RULES (কঠোরভাবে মেনে চলো):**
    1. **Business Model Canvas (BMC)** ফ্রেমওয়ার্কের ওপর ভিত্তি করে বিশ্লেষণ করবে।
    2. প্রতিটি আউটপুট **গঠনমূলক, উৎসাহদায়ক এবং বাস্তবসম্মত** হবে।
    3. অনুমান বা অপ্রাসঙ্গিক তথ্য দেবে না। যা জানা নেই, তা স্বীকার করবে অথবা ইন্ডাস্ট্রির স্ট্যান্ডার্ড বেঞ্চমার্ক ব্যবহার করে অনুমান করবে (উল্লেখ করে)।
    4. নির্দিষ্ট, পরিমাপযোগ্য এবং সময়ভিত্তিক সুপারিশ দেবে।
    5. তোমার বিশ্লেষণে কোনো কঠিন পরিভাষা ব্যবহার করলে তা সহজ বাংলায় বুঝিয়ে বলবে।
    6. আউটপুট সম্পূর্ণ **বাংলা ভাষায়** (Bengali) হতে হবে।

    **INPUT DATA:**
    - Key Partners: ${data.keyPartners}
    - Key Activities: ${data.keyActivities}
    - Key Resources: ${data.keyResources}
    - Value Propositions: ${data.valuePropositions}
    - Customer Relationships: ${data.customerRelationships}
    - Channels: ${data.channels}
    - Customer Segments: ${data.customerSegments}
    - Cost Structure: ${data.costStructure}
    - Revenue Streams: ${data.revenueStreams}

    **OUTPUT STRUCTURE Requirements (Map to JSON):**
    
    1. **Executive Summary:** A powerful, investor-ready overview of the business potential.
    2. **Overall Score:** Rate out of 100 based on clarity, viability, and scalability.
    3. **SWOT Analysis:** Strengths, Weaknesses, Opportunities, Threats.
    4. **Market Intelligence:**
       - **Market Size (TAM/SAM/SOM):** Provide realistic ESTIMATES for Total Addressable Market (TAM), Serviceable Available Market (SAM), and Serviceable Obtainable Market (SOM). Use numbers relevant to Bangladesh market or Global if applicable.
       - **Competitor Analysis:** Identify 2-3 hypothetical or real competitors (Generic names like "Traditional Shops" are okay if no specific brand). List their strengths and weaknesses.
       - **USP:** Define the Competitive Advantage.
    5. **Financial Projections (Hypothetical):** Based on 'Cost Structure' and 'Revenue Streams'.
    6. **Action Plan (Department-wise):** Assign actionable tasks.
    7. **Roadmap (Timeline):** Create a detailed 6-month roadmap grouped by Month 1, Month 2-3, Month 4-6. For each task, assign a Priority (High/Medium/Low), a Status (Planned/In Progress), a specific Resource, a 'startMonth' (integer 1-6), and 'duration' (integer 1-6).
    8. **Risk Matrix:** Identify risks.
    9. **Marketing Kit:** Tagline, Growth Hack, KPIs.

    **RESPONSE FORMAT:**
    Return ONLY valid JSON matching the schema provided. Do not use Markdown formatting.
  `;

  try {
    // Attempt 1: Strict JSON Schema
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: 'user', parts: [{ text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      
      // Post-processing: Convert string[] tasks to ActionTask[] objects for interactivity
      if (parsed.departmentalActionPlan) {
        parsed.departmentalActionPlan.forEach((dept: any) => {
           dept.roles.forEach((role: any) => {
              if (Array.isArray(role.tasks)) {
                 role.tasks = role.tasks.map((t: string) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: t,
                    isDone: false
                 }));
              }
           });
        });
      }

      return parsed as AnalysisResult;
    }
    throw new Error("No response text from AI");

  } catch (error) {
    console.warn("Schema generation failed, falling back to text generation...", error);
    
    // Attempt 2: Fallback to plain text JSON generation
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { role: 'user', parts: [{ text: promptText + "\n\nRETURN ONLY VALID JSON. Do not include markdown formatting like ```json" }] },
        });

        const text = response.text || "";
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1] : text;
        const parsed = JSON.parse(jsonString);

        // Fallback Post-processing
        if (parsed.departmentalActionPlan) {
          parsed.departmentalActionPlan.forEach((dept: any) => {
             dept.roles.forEach((role: any) => {
                if (Array.isArray(role.tasks)) {
                   role.tasks = role.tasks.map((t: string) => ({
                      id: Math.random().toString(36).substr(2, 9),
                      text: t,
                      isDone: false
                   }));
                }
             });
          });
        }
        
        return parsed as AnalysisResult;
    } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        throw fallbackError;
    }
  }
};

export const generateBudgetPlan = async (data: BMCData, existingResult: AnalysisResult): Promise<BudgetPlan> => {
  const promptText = `
    **ROLE:** You are an expert CFO (Chief Financial Officer).
    **TASK:** Create a detailed **Startup/Business Budget Plan** (in BDT) based on the provided BMC, Action Plan, and Roadmap.

    **CONTEXT:**
    - Business Stage: ${data.businessStage}
    - Industry: ${data.industry}
    - Action Plan: ${JSON.stringify(existingResult.departmentalActionPlan)}
    - Roadmap: ${JSON.stringify(existingResult.roadmap)}
    - Cost Structure Input: ${data.costStructure}

    **REQUIREMENTS:**
    1. **Estimate Costs:** Provide realistic estimates in BDT (Bangladeshi Taka).
    2. **Categorize:** Group costs into Marketing, Technology, Operations, Legal/Admin, HR, etc.
    3. **CAPEX vs OPEX:** Clearly distinguish between One-time setup costs (CAPEX) and Monthly recurring costs (OPEX).
    4. **Advice:** Provide 3-5 strategic financial tips for this specific business.
    5. **Cost Guides:** Generate 4 specific cost guides that explain the major cost drivers for THIS business type (e.g. for a Restaurant: Ingredients, Staff, Rent, Marketing. For a Software Co: Server, Dev Salary, API, Tools).
    6. **Language:** Output must be in **Bengali**.

    **OUTPUT FORMAT:**
    Return ONLY valid JSON matching the BudgetPlan schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: 'user', parts: [{ text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: budgetSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as BudgetPlan;
    }
    throw new Error("No budget response text");
  } catch (error) {
    console.error("Budget generation failed", error);
    throw error;
  }
};

export const generateCashFlowAnalysis = async (data: BMCData, budget: BudgetPlan): Promise<CashFlowAnalysis> => {
  const promptText = `
    **ROLE:** You are an Expert Risk Manager & Financial Analyst.
    **TASK:** Create a **Simulated Cash Flow & Dynamic Risk Analysis** for the next 3 months (30, 60, 90 days).
    
    **INPUT CONTEXT:**
    - Business Type: ${data.businessStage}
    - Industry: ${data.industry} (Use this to infer market risks e.g. If 'Import' then 'Exchange Rate' risk is high)
    - Estimated Monthly OPEX: ${budget.opex} BDT
    - Estimated CAPEX: ${budget.capex} BDT
    - Revenue Streams: ${data.revenueStreams}
    
    **REQUIREMENTS:**
    1. **Simulate Cash Flow:** Create a realistic scenario for Month 1, 2, and 3. Startups usually have high outflow and low inflow initially.
    2. **Cash Crunch:** Identify if/when the business might run out of money based on the burn rate.
    3. **Payment Alerts:** Identify 5-7 likely critical payments.
    4. **Market Risk Indicators:** Generate 3-4 real-time simulated market risk indicators relevant to the ${data.industry} industry. (e.g. Dollar Rate, Fuel Price, Supply Chain Volatility). Assign a risk score (0-100).
    5. **Stakeholder Scoring:** Simulate 2 Vendors and 1 Customer Group. Assign them reliability scores and history comments.
    6. **Variable Cost Analysis:** Analyze the volatility of these specific operational costs: API/Tech Costs, Server/Hosting, Marketing/Ads, HR/Salaries. Estimate potential spikes (e.g. "Ads might cost +20% more").
    7. **Mitigation Actions:** For the identified risks, provide specific, actionable tips with a button title (e.g. "Stock Up Now").
    8. **Language:** All text descriptions/names must be in **Bengali**.

    **OUTPUT:**
    Return strictly JSON matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: 'user', parts: [{ text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: cashFlowSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CashFlowAnalysis;
    }
    throw new Error("No cash flow response");
  } catch (error) {
    console.error("Cash flow generation failed", error);
    throw error;
  }
}

// --- NEW FUNCTION: GENERATE LAUNCH DATA ---
export const generateLaunchData = async (data: BMCData, analysis: AnalysisResult): Promise<LaunchData> => {
  const promptText = `
    **ROLE:** You are a Startup Launch Expert and Virtual Consultant.
    **TASK:** Create a **"Launch Dashboard" Data Set** based on the Perfect Alignment Table below.

    **ALIGNMENT DATA SOURCES (Perfect Alignment):**
    1. INPUT (Business Type): ${data.businessStage}
    2. ANALYSIS (SWOT Weaknesses): ${JSON.stringify(analysis.swot.weaknesses)} -> Use this to calculate Readiness Score & Critical Missing.
    3. ACTION PLAN: ${JSON.stringify(analysis.departmentalActionPlan).substring(0, 1500)} -> Use this to generate 14-day tasks.
    4. RISK (Threats): ${JSON.stringify(analysis.swot.threats)} -> Use this for Panic Solutions.
    5. BUDGET (Cost Structure): ${data.costStructure} -> Use this for First Month Expense.

    **REQUIREMENTS (Bangla):**
    1. **Readiness Score:** Estimate a score (0-100). Lower the score if there are critical weaknesses like 'No funding' or 'No team'.
    2. **Critical Missing:** List 3-4 concrete items usually missing for this stage (e.g., Trade License, Bank Account).
    3. **First 14 Days:** 
       - Break down into phases.
       - **CRITICAL:** Every task MUST have a 'source' field that matches a Department Name from the Action Plan (e.g. "Marketing", "Tech"). Use "Action Plan -> [Dept Name]" format.
    4. **Setup Checklist:** Guided steps for legal/admin setup with "Why needed" and "Risk if ignored".
    5. **Mini Finance:** Estimate the "First Month Cost" (just a bare minimum start number in BDT).
    6. **First Customer:** 3 specific tactics to get the *first* sale immediately (Low cost/Free).
    7. **Panic Solutions:** Provide context-aware solutions for 3 scenarios: 'Money' (Running out), 'Customer' (No sales), 'Fear' (Overwhelmed).

    **OUTPUT:** JSON only matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: 'user', parts: [{ text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: launchSchema,
      },
    });

    if (response.text) {
        const parsed = JSON.parse(response.text);
        
        // Post-processing: Add IDs to tasks
        if (parsed.first14Days) {
            parsed.first14Days.forEach((phase: any) => {
                if (phase.tasks) {
                    phase.tasks = phase.tasks.map((t: any) => ({
                        ...t,
                        id: Math.random().toString(36).substr(2, 9),
                        isDone: false
                    }));
                }
            });
        }
        if (parsed.setupChecklist) {
            parsed.setupChecklist = parsed.setupChecklist.map((item: any) => ({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
                isDone: false
            }));
        }

        return parsed as LaunchData;
    }
    throw new Error("No launch data response");
  } catch (error) {
    console.error("Launch data generation failed", error);
    throw error;
  }
};
