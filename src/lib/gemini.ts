import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIAdvice } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getFinancialAdvice(profile: UserProfile): Promise<AIAdvice> {
  const ai = getAI();
  
  // Create a timeout promise
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("AI Synthesis timed out. Please try again.")), 45000)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this financial profile and provide a comprehensive simulation and advice.
        Profile: ${JSON.stringify(profile)}
        
        Tasks:
        1. Calculate a Money Health Score (0-100) across 6 dimensions.
        2. Provide a narrative "Financial Story" of their future.
        3. Give 3-5 specific, actionable recommendations.
        4. FIRE Plan: Target corpus, monthly draw, estimated date, SIP plan, glidepath, insurance gaps, and a 12-month action plan.
        5. Tax Optimization: Old vs New regime comparison, step-by-step logic, missed deductions, suggestions.
        6. Portfolio X-Ray: Identify overlap, expense ratio drag, and rebalancing recommendations.
        
        Respond in JSON format. Be concise but specific.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthScore: { type: Type.NUMBER },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                emergency: { type: Type.NUMBER },
                insurance: { type: Type.NUMBER },
                diversification: { type: Type.NUMBER },
                debt: { type: Type.NUMBER },
                tax: { type: Type.NUMBER },
                retirement: { type: Type.NUMBER }
              }
            },
            firePlan: {
              type: Type.OBJECT,
              properties: {
                retirementAge: { type: Type.NUMBER },
                targetCorpus: { type: Type.NUMBER },
                monthlyDraw: { type: Type.NUMBER },
                estimatedRetirementDate: { type: Type.STRING },
                sipPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      description: { type: Type.STRING }
                    }
                  }
                },
                glidepath: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.NUMBER },
                      equity: { type: Type.NUMBER },
                      debt: { type: Type.NUMBER },
                      cash: { type: Type.NUMBER }
                    }
                  }
                },
                insuranceGap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      current: { type: Type.NUMBER },
                      required: { type: Type.NUMBER },
                      recommendation: { type: Type.STRING }
                    }
                  }
                },
                monthlyActionPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING },
                      action: { type: Type.STRING },
                      target: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            taxAnalysis: {
              type: Type.OBJECT,
              properties: {
                oldRegime: {
                  type: Type.OBJECT,
                  properties: {
                    taxableIncome: { type: Type.NUMBER },
                    taxLiability: { type: Type.NUMBER },
                    deductions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          amount: { type: Type.NUMBER }
                        }
                      }
                    }
                  }
                },
                newRegime: {
                  type: Type.OBJECT,
                  properties: {
                    taxableIncome: { type: Type.NUMBER },
                    taxLiability: { type: Type.NUMBER }
                  }
                },
                optimalRegime: { type: Type.STRING },
                missedDeductions: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      instrument: { type: Type.STRING },
                      liquidity: { type: Type.STRING },
                      risk: { type: Type.STRING },
                      benefit: { type: Type.STRING }
                    }
                  }
                },
                calculationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            portfolioXRay: {
              type: Type.OBJECT,
              properties: {
                xirr: { type: Type.NUMBER },
                overlap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stock: { type: Type.STRING },
                      percentage: { type: Type.NUMBER },
                      funds: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                },
                expenseRatioDrag: {
                  type: Type.OBJECT,
                  properties: {
                    current: { type: Type.NUMBER },
                    directEquivalent: { type: Type.NUMBER },
                    annualLoss: { type: Type.NUMBER }
                  }
                },
                rebalancing: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      action: { type: Type.STRING },
                      fund: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      reason: { type: Type.STRING },
                      taxImplication: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          required: ["narrative", "recommendations", "healthScore"]
        }
      }
    });

    const response = await Promise.race([apiCall, timeout]) as any;
    const data = JSON.parse(response.text || "{}");

    // Ensure dimensions exist to prevent UI crashes
    if (!data.dimensions) {
      data.dimensions = {
        emergency: 50,
        insurance: 50,
        diversification: 50,
        debt: 50,
        tax: 50,
        retirement: 50
      };
    }

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function simulateDecision(profile: UserProfile, decision: string): Promise<{ narrative: string, impact: string }> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Current Profile: ${JSON.stringify(profile)}
      Proposed Decision: "${decision}"
      
      Simulate the long-term impact (5-10 years) of this decision.
      Consider inflation, opportunity cost, and risk.
      
      Respond in JSON format with "narrative" (the story) and "impact" (summary of financial change).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING },
          impact: { type: Type.STRING }
        },
        required: ["narrative", "impact"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
