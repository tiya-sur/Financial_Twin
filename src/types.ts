export interface LifeGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetYear: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SimulationResult {
  year: number;
  netWorth: number;
  goalProgress: number;
  inflationAdjustedNetWorth: number;
}

export interface UserProfile {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingInvestments: number;
  ppfBalance?: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  lifeGoals: LifeGoal[];
  hra?: number;
  section80C?: number;
  nps?: number;
  homeLoanInterest?: number;
}

export interface FIREPlan {
  retirementAge: number;
  targetCorpus: number;
  monthlyDraw: number;
  estimatedRetirementDate: string;
  sipPlan: {
    category: string;
    amount: number;
    description: string;
  }[];
  glidepath: {
    year: number;
    equity: number;
    debt: number;
    cash: number;
  }[];
  insuranceGap: {
    type: string;
    current: number;
    required: number;
    recommendation: string;
  }[];
  monthlyActionPlan: {
    month: string;
    action: string;
    target: string;
  }[];
}

export interface TaxAnalysis {
  oldRegime: {
    taxableIncome: number;
    taxLiability: number;
    deductions: { name: string; amount: number }[];
  };
  newRegime: {
    taxableIncome: number;
    taxLiability: number;
  };
  optimalRegime: 'Old' | 'New';
  missedDeductions: string[];
  suggestions: {
    instrument: string;
    liquidity: 'High' | 'Medium' | 'Low';
    risk: 'High' | 'Medium' | 'Low';
    benefit: string;
  }[];
  calculationSteps: string[];
}

export interface PortfolioXRay {
  xirr: number;
  overlap: {
    stock: string;
    percentage: number;
    funds: string[];
  }[];
  expenseRatioDrag: {
    current: number;
    directEquivalent: number;
    annualLoss: number;
  };
  rebalancing: {
    action: 'Sell' | 'Buy' | 'Hold';
    fund: string;
    amount: number;
    reason: string;
    taxImplication: string;
  }[];
}

export interface AIAdvice {
  narrative: string;
  recommendations: string[];
  healthScore: number;
  dimensions: {
    emergency: number;
    insurance: number;
    diversification: number;
    debt: number;
    tax: number;
    retirement: number;
  };
  firePlan?: FIREPlan;
  taxAnalysis?: TaxAnalysis;
  portfolioXRay?: PortfolioXRay;
}
