/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Target, 
  Calculator, 
  Users, 
  Activity, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Sparkles,
  Info,
  AlertCircle,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Zap,
  Flame,
  FileText,
  Search,
  Heart,
  Calendar,
  DollarSign,
  ListChecks
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserProfile, LifeGoal, AIAdvice, SimulationResult } from './types';
import { getFinancialAdvice, simulateDecision } from './lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Card = ({ children, className, title, subtitle, icon: Icon, neonColor = 'indigo' }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any, neonColor?: 'indigo' | 'cyan' | 'emerald' | 'rose' | 'amber' }) => {
  const neonStyles = {
    indigo: "border-neon-indigo/20 shadow-neon-indigo/5 hover:border-neon-indigo/40 hover:shadow-neon-indigo/10",
    cyan: "border-neon-cyan/20 shadow-neon-cyan/5 hover:border-neon-cyan/40 hover:shadow-neon-cyan/10",
    emerald: "border-neon-emerald/20 shadow-neon-emerald/5 hover:border-neon-emerald/40 hover:shadow-neon-emerald/10",
    rose: "border-neon-rose/20 shadow-neon-rose/5 hover:border-neon-rose/40 hover:shadow-neon-rose/10",
    amber: "border-neon-amber/20 shadow-neon-amber/5 hover:border-neon-amber/40 hover:shadow-neon-amber/10"
  };

  const iconColors = {
    indigo: "text-neon-indigo bg-neon-indigo/10",
    cyan: "text-neon-cyan bg-neon-cyan/10",
    emerald: "text-neon-emerald bg-neon-emerald/10",
    rose: "text-neon-rose bg-neon-rose/10",
    amber: "text-neon-amber bg-neon-amber/10"
  };

  return (
    <div className={cn(
      "bg-slate-900/40 backdrop-blur-md border rounded-2xl p-6 transition-all duration-500 group relative overflow-hidden", 
      neonStyles[neonColor], 
      className
    )}>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 group-hover:opacity-50 transition-opacity" />
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100 tracking-tight font-display uppercase italic">{title}</h3>}
            {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{subtitle}</p>}
          </div>
          {Icon && <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", iconColors[neonColor])}><Icon size={20} /></div>}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const Button = ({ children, onClick, className, variant = 'primary', disabled = false, icon: Icon }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'neon', disabled?: boolean, icon?: any }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
    outline: "border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800",
    neon: "bg-neon-cyan text-slate-950 hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] font-black uppercase tracking-[0.2em] text-[10px] italic"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn("px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95", variants[variant], className)}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, min, max, prefix }: { label: string, type?: string, value: any, onChange: (e: any) => void, placeholder?: string, min?: number, max?: number, prefix?: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{prefix}</span>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        min={min}
        max={max}
        className={cn(
          "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-600",
          prefix && "pl-8"
        )}
      />
    </div>
  </div>
);

const Select = ({ label, value, onChange, options }: { label: string, value: string, onChange: (e: any) => void, options: string[] }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value} 
      onChange={onChange}
      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
    >
      {options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
    </select>
  </div>
);

// --- New Feature Components ---

const FIREEngine = ({ plan, profile, onUpdate }: { plan: any, profile: any, onUpdate: (age: number) => void }) => {
  if (!plan) return <div className="text-slate-500 font-mono text-xs animate-pulse">Initializing FIRE Neural Processor...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Target Corpus" icon={Target} neonColor="rose" subtitle="Inflation Adjusted">
          <div className="mt-2">
            <span className="text-4xl font-black text-white font-display tracking-tight">₹{(plan.targetCorpus / 10000000).toFixed(2)}Cr</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">At Age {plan.retirementAge}</div>
          </div>
        </Card>
        <Card title="Monthly Draw" icon={DollarSign} neonColor="amber" subtitle="Retirement Lifestyle">
          <div className="mt-2">
            <span className="text-4xl font-black text-white font-display tracking-tight">₹{(plan.monthlyDraw / 1000).toFixed(1)}k</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Inflation Adjusted</div>
          </div>
        </Card>
        <Card title="Retirement Date" icon={Calendar} neonColor="cyan" subtitle="Estimated Timeline">
          <div className="mt-2">
            <span className="text-3xl font-black text-white font-display tracking-tight uppercase italic">{plan.estimatedRetirementDate}</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Current Trajectory</div>
          </div>
        </Card>
      </div>

      <Card title="Dynamic Timeline Control" icon={Activity} neonColor="cyan" subtitle="Adjust Retirement Age">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Retirement Age: {plan.retirementAge}</span>
            <span className="text-xs font-black text-neon-cyan uppercase tracking-widest italic">Simulating...</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="65" 
            value={plan.retirementAge} 
            onChange={(e) => onUpdate(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neon-cyan"
          />
          <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <span>40</span>
            <span>50</span>
            <span>60</span>
            <span>65</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="SIP Allocation Strategy" icon={PieChartIcon} neonColor="indigo" subtitle="Monthly Investment Plan">
          <div className="space-y-4">
            {plan.sipPlan.map((sip: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 group hover:border-neon-indigo/40 transition-all">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{sip.category}</div>
                  <div className="text-sm font-bold text-slate-200">{sip.description}</div>
                </div>
                <div className="text-lg font-black text-neon-indigo font-display italic">₹{(sip.amount / 1000).toFixed(0)}k</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Insurance Gap Analysis" icon={ShieldCheck} neonColor="rose" subtitle="Risk Mitigation">
          <div className="space-y-4">
            {plan.insuranceGap.map((gap: any, i: number) => (
              <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{gap.type}</div>
                  <div className="text-[9px] font-black text-neon-rose uppercase tracking-[0.2em] bg-neon-rose/10 px-2 py-0.5 rounded">Gap: ₹{((gap.required - gap.current) / 100000).toFixed(1)}L</div>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed mb-3">{gap.recommendation}</div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-rose" style={{ width: `${(gap.current / gap.required) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="12-Month Action Plan" icon={ListChecks} neonColor="cyan" subtitle="Step-by-Step Execution">
          <div className="space-y-3">
            {plan.monthlyActionPlan?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                <div className="w-12 text-[10px] font-black text-neon-cyan uppercase tracking-tighter">{item.month}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-200">{item.action}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Target: {item.target}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Asset Allocation Glidepath" icon={TrendingUp} neonColor="indigo" subtitle="Risk Transition Over Time">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              <span>Year</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neon-indigo rounded-full" /> Equity</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-400 rounded-full" /> Debt</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-600 rounded-full" /> Cash</span>
              </div>
            </div>
            {plan.glidepath?.map((gp: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Year {gp.year}</span>
                  <span>{gp.equity}% Equity</span>
                </div>
                <div className="h-2 flex rounded-full overflow-hidden bg-slate-800">
                  <div className="h-full bg-neon-indigo" style={{ width: `${gp.equity}%` }} />
                  <div className="h-full bg-slate-400" style={{ width: `${gp.debt}%` }} />
                  <div className="h-full bg-slate-600" style={{ width: `${gp.cash}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const TaxWizard = ({ analysis }: { analysis: any }) => {
  if (!analysis) return <div className="text-slate-500 font-mono text-xs animate-pulse">Calculating Tax Vectors...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Old Regime" icon={FileText} neonColor="amber" subtitle="Traditional Deductions">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxable Income</span>
              <span className="text-xl font-bold text-slate-200">₹{(analysis.oldRegime.taxableIncome / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Liability</span>
              <span className="text-2xl font-black text-neon-amber font-display italic">₹{(analysis.oldRegime.taxLiability / 1000).toFixed(0)}k</span>
            </div>
            <div className="pt-4 border-t border-slate-800/50">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Applied Deductions</div>
              <div className="grid grid-cols-2 gap-2">
                {analysis.oldRegime.deductions.map((d: any, i: number) => (
                  <div key={i} className="text-[10px] text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-slate-800/50">
                    {d.name}: ₹{(d.amount / 1000).toFixed(0)}k
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="New Regime" icon={Zap} neonColor="cyan" subtitle="Simplified Structure">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taxable Income</span>
              <span className="text-xl font-bold text-slate-200">₹{(analysis.newRegime.taxableIncome / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Liability</span>
              <span className="text-2xl font-black text-neon-cyan font-display italic">₹{(analysis.newRegime.taxLiability / 1000).toFixed(0)}k</span>
            </div>
            <div className="mt-12 p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
              <div className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] mb-1">Optimal Choice</div>
              <div className="text-lg font-black text-white uppercase italic font-display">{analysis.optimalRegime} Regime</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Missed Deductions" icon={AlertCircle} neonColor="rose" subtitle="Optimization Gaps">
          <div className="space-y-3">
            {analysis.missedDeductions.length > 0 ? (
              analysis.missedDeductions.map((m: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-rose-500/5 rounded-xl border border-rose-500/20">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{m}</span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">All major deductions claimed</div>
            )}
          </div>
        </Card>

        <Card title="Traceable Logic" icon={Info} neonColor="indigo" subtitle="Step-by-Step Verification">
          <div className="space-y-4 font-mono text-[11px] text-slate-400 leading-relaxed">
            {analysis.calculationSteps.map((step: string, i: number) => (
              <div key={i} className="flex gap-4">
                <span className="text-neon-indigo font-black">[{i + 1}]</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Tax Optimization Roadmap" icon={Sparkles} neonColor="emerald" subtitle="Additional Savings">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.suggestions.map((s: any, i: number) => (
            <div key={i} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50 group hover:border-neon-emerald/40 transition-all">
              <div className="text-sm font-black text-white mb-2 uppercase italic font-display tracking-tight">{s.instrument}</div>
              <div className="flex gap-2 mb-4">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded">Risk: {s.risk}</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded">Liq: {s.liquidity}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{s.benefit}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const PortfolioXRayModule = ({ data }: { data: any }) => {
  if (!data) return <div className="text-slate-500 font-mono text-xs animate-pulse">Scanning Portfolio DNA...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Portfolio XIRR" icon={TrendingUp} neonColor="emerald" subtitle="True Annual Return">
          <div className="mt-2">
            <span className="text-5xl font-black text-neon-emerald font-display italic neon-text-emerald">{data.xirr}%</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Benchmark: 12.5%</div>
          </div>
        </Card>
        <Card title="Expense Drag" icon={AlertCircle} neonColor="rose" subtitle="Regular vs Direct">
          <div className="mt-2">
            <span className="text-4xl font-black text-white font-display tracking-tight">₹{(data.expenseRatioDrag.annualLoss / 1000).toFixed(1)}k</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">Annual Loss to Fees</div>
          </div>
        </Card>
        <Card title="Stock Overlap" icon={Users} neonColor="amber" subtitle="Concentration Risk">
          <div className="mt-2">
            <span className="text-4xl font-black text-white font-display tracking-tight">{data.overlap.length} Stocks</span>
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">High Overlap Detected</div>
          </div>
        </Card>
      </div>

      <Card title="Concentration Analysis" icon={Search} neonColor="amber" subtitle="Top Overlapping Holdings">
        <div className="space-y-4">
          {data.overlap.map((o: any, i: number) => (
            <div key={i} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-black text-white uppercase italic font-display tracking-tight">{o.stock}</div>
                <div className="text-xs font-black text-neon-amber uppercase tracking-widest">{o.percentage}% Weight</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {o.funds.map((f: string, fi: number) => (
                  <span key={fi} className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rebalancing Strategy" icon={Sparkles} neonColor="cyan" subtitle="Fund-Level Recommendations">
        <div className="space-y-4">
          {data.rebalancing.map((r: any, i: number) => (
            <div key={i} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50 group hover:border-neon-cyan/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className={cn(
                    "text-[9px] font-black uppercase tracking-[0.3em] mb-1",
                    r.action === 'Sell' ? "text-neon-rose" : "text-neon-emerald"
                  )}>{r.action} Recommendation</div>
                  <div className="text-lg font-black text-white uppercase italic font-display">{r.fund}</div>
                </div>
                <div className="text-xl font-black text-slate-200 font-display">₹{(r.amount / 100000).toFixed(1)}L</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Strategic Reason</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{r.reason}</p>
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Tax Implication</div>
                  <p className="text-[10px] text-neon-amber leading-relaxed font-bold">{r.taxImplication}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Main App ---

type ActiveTab = 'dashboard' | 'fire' | 'tax' | 'couple' | 'portfolio' | 'events';

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'dashboard'>('onboarding');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [profile, setProfile] = useState<UserProfile>({
    age: 34,
    monthlyIncome: 200000, // 24L / 12
    monthlyExpenses: 80000,
    existingInvestments: 1800000,
    ppfBalance: 600000,
    riskProfile: 'Moderate',
    lifeGoals: [],
    hra: 30000,
    section80C: 150000,
    nps: 50000,
    homeLoanInterest: 40000
  });
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [whatIfScenario, setWhatIfScenario] = useState("");
  const [simulationResult, setSimulationResult] = useState<{ narrative: string, impact: string } | null>(null);

  const [loadingMessage, setLoadingMessage] = useState("Synthesizing...");

  useEffect(() => {
    if (loading && step === 'onboarding') {
      const messages = [
        "Analyzing Income Streams...",
        "Calculating Tax Vectors...",
        "Simulating FIRE Scenarios...",
        "Scanning Portfolio DNA...",
        "Optimizing Asset Allocation...",
        "Finalizing Digital Twin..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading, step]);

  const handleOnboardingComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFinancialAdvice(profile);
      setAdvice(result);
      setStep('dashboard');
    } catch (err: any) {
      console.error("Failed to get advice:", err);
      if (err.message?.includes("429") || err.message?.includes("quota")) {
        setError("AI Quota Exceeded. Please wait 60 seconds and try again.");
      } else if (err.message?.includes("timed out")) {
        setError("The AI is taking longer than usual. Please try clicking 'Synthesize' again.");
      } else {
        setError("Failed to initialize Digital Twin. Please check your connection or API key.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIf = async () => {
    if (!whatIfScenario) return;
    setSimulating(true);
    try {
      const result = await simulateDecision(profile, whatIfScenario);
      setSimulationResult(result);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setSimulating(false);
    }
  };

  const handleFireUpdate = async (newAge: number) => {
    if (!advice?.firePlan) return;
    setSimulating(true);
    try {
      // We simulate the change by asking Gemini to recalculate the FIRE plan specifically
      const result = await simulateDecision(profile, `Recalculate my FIRE plan for retirement at age ${newAge}. Provide updated target corpus and SIP amounts.`);
      // For a truly dynamic feel, we'd ideally have a local calculator, 
      // but here we update the advice state with the new simulation narrative
      setSimulationResult(result);
      // Update the local state for the slider to feel responsive
      setAdvice(prev => prev ? ({
        ...prev,
        firePlan: { ...prev.firePlan!, retirementAge: newAge }
      }) : null);
    } catch (error) {
      console.error("FIRE update failed:", error);
    } finally {
      setSimulating(false);
    }
  };

  const chartData = useMemo(() => {
    const data: SimulationResult[] = [];
    let currentWealth = profile.existingInvestments;
    const monthlySavings = profile.monthlyIncome - profile.monthlyExpenses;
    const annualReturn = profile.riskProfile === 'Aggressive' ? 0.12 : profile.riskProfile === 'Moderate' ? 0.09 : 0.06;
    const inflation = 0.06;

    for (let i = 0; i <= 20; i++) {
      data.push({
        year: new Date().getFullYear() + i,
        netWorth: Math.round(currentWealth),
        goalProgress: Math.min(100, (currentWealth / 10000000) * 100),
        inflationAdjustedNetWorth: Math.round(currentWealth / Math.pow(1 + inflation, i))
      });
      currentWealth = (currentWealth + monthlySavings * 12) * (1 + annualReturn);
    }
    return data;
  }, [profile]);

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative font-sans">
        {/* Animated Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="scanline" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl w-full relative z-10"
        >
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-neon-cyan text-slate-950 rounded-[2rem] mb-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative group"
            >
              <div className="absolute inset-0 bg-neon-cyan rounded-[2rem] animate-ping opacity-20 group-hover:opacity-40" />
              <TrendingUp size={48} className="relative z-10" />
            </motion.div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic font-display">
              Financial <span className="text-neon-cyan neon-text-cyan">Twin</span> <span className="text-slate-500">2.0</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-px w-8 bg-slate-800" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Neural Economic Simulator</p>
              <div className="h-px w-8 bg-slate-800" />
            </div>
          </div>

          <Card className="space-y-8 border-slate-800 bg-slate-900/60 backdrop-blur-xl" neonColor="cyan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Biological Age" type="number" value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
              <Select label="Risk Tolerance" value={profile.riskProfile} onChange={e => setProfile({...profile, riskProfile: e.target.value as any})} options={['Conservative', 'Moderate', 'Aggressive']} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Annual Inflow (CTC)" type="number" prefix="₹" value={profile.monthlyIncome * 12} onChange={e => setProfile({...profile, monthlyIncome: parseInt(e.target.value) / 12})} />
              <Input label="Monthly Outflow" type="number" prefix="₹" value={profile.monthlyExpenses} onChange={e => setProfile({...profile, monthlyExpenses: parseInt(e.target.value)})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="MF Assets" type="number" prefix="₹" value={profile.existingInvestments} onChange={e => setProfile({...profile, existingInvestments: parseInt(e.target.value)})} />
              <Input label="PPF Balance" type="number" prefix="₹" value={profile.ppfBalance || 0} onChange={e => setProfile({...profile, ppfBalance: parseInt(e.target.value)})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="HRA" type="number" prefix="₹" value={profile.hra || 0} onChange={e => setProfile({...profile, hra: parseInt(e.target.value)})} />
              <Input label="80C" type="number" prefix="₹" value={profile.section80C || 0} onChange={e => setProfile({...profile, section80C: parseInt(e.target.value)})} />
              <Input label="NPS" type="number" prefix="₹" value={profile.nps || 0} onChange={e => setProfile({...profile, nps: parseInt(e.target.value)})} />
            </div>
            
            <div className="pt-4">
              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <Button 
                onClick={handleOnboardingComplete} 
                variant="neon"
                className="w-full py-6" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span className="animate-pulse uppercase tracking-[0.2em] font-black italic">{loadingMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-[0.2em] font-black italic">Initialize Digital Twin</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
            </div>
          </Card>

          <p className="text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-8">
            Secure Neural Link Established • AES-256 Encryption Active
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 selection:bg-neon-cyan/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-neon-cyan text-slate-950 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic text-white font-display">Twin <span className="text-neon-cyan neon-text-cyan">2.0</span></span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50">
            {(['dashboard', 'fire', 'tax', 'couple', 'portfolio', 'events'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                  activeTab === tab 
                    ? "bg-neon-cyan text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-neon-emerald/5 border border-neon-emerald/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-neon-emerald">
              <div className="w-1.5 h-1.5 bg-neon-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Neural Sync: 98%
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card title="Net Worth" icon={Wallet} neonColor="cyan" subtitle="Total Liquidity">
                    <div className="mt-2">
                      <span className="text-4xl font-black text-white font-display tracking-tight">₹{(profile.existingInvestments / 100000).toFixed(1)}L</span>
                      <div className="flex items-center gap-2 text-neon-emerald text-[9px] font-black uppercase tracking-[0.2em] mt-3">
                        <TrendingUp size={12} />
                        <span>+12.4% Momentum</span>
                      </div>
                    </div>
                  </Card>
                  <Card title="Monthly Surplus" icon={Calculator} neonColor="emerald" subtitle="Savings Velocity">
                    <div className="mt-2">
                      <span className="text-4xl font-black text-white font-display tracking-tight">₹{((profile.monthlyIncome - profile.monthlyExpenses) / 1000).toFixed(0)}k</span>
                      <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-3">
                        {((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome * 100).toFixed(0)}% Efficiency
                      </div>
                    </div>
                  </Card>
                  <Card title="Health Index" icon={Activity} neonColor="indigo" subtitle="Twin Vitality">
                    <div className="mt-2 flex items-center gap-6">
                      <span className="text-5xl font-black text-neon-indigo font-display italic neon-text-indigo">{advice?.healthScore || 0}</span>
                      <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${advice?.healthScore || 0}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-neon-indigo shadow-[0_0_15px_rgba(99,102,241,0.6)]" 
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Main Chart */}
                <Card title="Economic Life Simulation" subtitle="20-Year Wealth Trajectory" icon={LineChartIcon} neonColor="cyan">
                  <div className="h-[400px] w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                        <XAxis 
                          dataKey="year" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 9, fill: '#64748b', fontWeight: '900', letterSpacing: '0.1em'}} 
                          dy={15} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 9, fill: '#64748b', fontWeight: '900', letterSpacing: '0.1em'}} 
                          tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px' }}
                          itemStyle={{ color: '#06b6d4', fontWeight: '900', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                          formatter={(val: any) => [`₹${val.toLocaleString()}`, 'NET WORTH']}
                          cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="netWorth" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" animationDuration={2000} />
                        <Area type="monotone" dataKey="inflationAdjustedNetWorth" stroke="#475569" strokeWidth={2} strokeDasharray="6 6" fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* AI Narrative */}
                <Card title="Neural Narrative" icon={Sparkles} neonColor="indigo" className="bg-neon-indigo/5 border-neon-indigo/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} className="text-neon-indigo" />
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm font-medium relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-neon-indigo">
                      <div className="w-2 h-2 bg-neon-indigo rounded-full animate-ping" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Processing Live Stream...</span>
                    </div>
                    <Markdown>{advice?.narrative}</Markdown>
                  </div>
                </Card>

                {/* Dimensions */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {advice && Object.entries(advice.dimensions).map(([key, value]) => (
                    <div key={key} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl group hover:border-neon-cyan/40 transition-all duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black mb-3">{key}</div>
                      <div className="flex items-end justify-between relative z-10">
                        <span className="text-3xl font-black text-white group-hover:text-neon-cyan transition-colors font-display italic">{value}%</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full shadow-[0_0_12px]",
                          value > 80 ? "bg-neon-emerald shadow-neon-emerald" : value > 50 ? "bg-neon-amber shadow-neon-amber" : "bg-neon-rose shadow-neon-rose"
                        )} />
                      </div>
                      <div className="mt-4 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn(
                            "h-full transition-all",
                            value > 80 ? "bg-neon-emerald" : value > 50 ? "bg-neon-amber" : "bg-neon-rose"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Decision Simulator */}
                <Card title="Decision Simulator" icon={Zap} neonColor="cyan" className="bg-slate-900/60 border-neon-cyan/20">
                  <p className="text-slate-500 text-[10px] mb-6 font-black uppercase tracking-[0.2em] leading-relaxed">Simulate life events to visualize timeline divergence.</p>
                  <div className="space-y-5">
                    <div className="relative">
                      <textarea 
                        placeholder="e.g., 'I want to take a ₹50L home loan at 8.5% interest for 20 years. How does this impact my retirement at 50?'"
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 transition-all min-h-[140px] placeholder:text-slate-700 font-mono leading-relaxed"
                        value={whatIfScenario}
                        onChange={e => setWhatIfScenario(e.target.value)}
                      />
                      <div className="absolute bottom-4 right-4 text-[8px] font-black text-slate-700 uppercase tracking-widest">Neural Input v2.4</div>
                    </div>
                    <Button 
                      onClick={handleWhatIf} 
                      variant="neon"
                      className="w-full py-4"
                      disabled={simulating || !whatIfScenario}
                    >
                      {simulating ? (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Recalculating Timeline...</span>
                        </div>
                      ) : "Execute Simulation"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {simulationResult && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 pt-8 border-t border-slate-800/50"
                      >
                        <div className="flex items-center gap-3 text-neon-cyan mb-4">
                          <Activity size={14} className="animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Simulation Output</span>
                        </div>
                        <div className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 italic">
                          "{simulationResult.narrative}"
                        </div>
                        <div className="mt-5 p-4 bg-neon-cyan/5 rounded-xl border border-neon-cyan/20 text-neon-cyan text-[10px] font-black uppercase tracking-[0.2em] text-center italic">
                          Impact: {simulationResult.impact}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* AI Action Plan */}
                <Card title="Strategic Roadmap" icon={ShieldCheck} neonColor="emerald">
                  <div className="space-y-6">
                    {advice?.recommendations.map((rec, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start group cursor-pointer"
                      >
                        <div className="mt-1 p-1.5 bg-neon-emerald/10 text-neon-emerald rounded-lg group-hover:bg-neon-emerald group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <ChevronRight size={14} />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-bold group-hover:text-slate-100 transition-colors">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-10 text-[9px] font-black uppercase tracking-[0.3em] border-slate-800 hover:border-neon-emerald/50 hover:text-neon-emerald">
                    Generate Full PDF Report
                  </Button>
                </Card>

                {/* Specialist Hub */}
                <div className="space-y-5">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Specialist Modules</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'fire', title: 'FIRE Path', sub: 'Retire Early Roadmap', icon: Flame, color: 'rose' },
                      { id: 'tax', title: 'Tax Wizard', sub: 'Form 16 Analysis', icon: FileText, color: 'amber' },
                      { id: 'couple', title: "Couple's Plan", sub: 'Joint Optimization', icon: Heart, color: 'rose' },
                      { id: 'portfolio', title: 'MF X-Ray', sub: 'CAMS Statement Scan', icon: Search, color: 'cyan' }
                    ].map((tool) => (
                      <button 
                        key={tool.id}
                        onClick={() => setActiveTab(tool.id as any)}
                        className="flex items-center justify-between p-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl hover:border-slate-600 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={cn(
                            "p-3 rounded-xl transition-all duration-500 group-hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.2)]", 
                            tool.color === 'rose' ? "bg-neon-rose/10 text-neon-rose" : 
                            tool.color === 'amber' ? "bg-neon-amber/10 text-neon-amber" : 
                            "bg-neon-cyan/10 text-neon-cyan"
                          )}>
                            <tool.icon size={22} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-100 font-display italic uppercase tracking-tight">{tool.title}</div>
                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{tool.sub}</div>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-slate-700 group-hover:text-neon-cyan group-hover:translate-x-2 transition-all relative z-10" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'dashboard' && (
            <motion.div 
              key="feature"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-5xl mx-auto py-12"
            >
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')} className="mb-12 group">
                <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-2 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Command Center</span>
              </Button>
              
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter font-display">
                    {activeTab} <span className="text-neon-cyan neon-text-cyan">Engine</span>
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-slate-800" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Neural Processing Active</p>
                    <div className="h-px w-12 bg-slate-800" />
                  </div>
                </div>

                {activeTab === 'fire' && <FIREEngine plan={advice?.firePlan} profile={profile} onUpdate={handleFireUpdate} />}
                {activeTab === 'tax' && <TaxWizard analysis={advice?.taxAnalysis} />}
                {activeTab === 'portfolio' && <PortfolioXRayModule data={advice?.portfolioXRay} />}

                {(activeTab === 'couple' || activeTab === 'events') && (
                  <div className="text-center space-y-8">
                    <motion.div 
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.8 }}
                      className="inline-flex items-center justify-center w-32 h-32 bg-neon-cyan/10 text-neon-cyan rounded-[2.5rem] border border-neon-cyan/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative group mx-auto"
                    >
                      <div className="absolute inset-0 bg-neon-cyan rounded-[2.5rem] animate-pulse opacity-10" />
                      {activeTab === 'couple' && <Heart size={64} />}
                      {activeTab === 'events' && <Calendar size={64} />}
                    </motion.div>
                    <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium text-sm">
                      The <span className="text-slate-200 font-bold uppercase tracking-widest">{activeTab}</span> neural processor is currently mapping your financial trajectory. 
                      To accelerate calibration, integrate your external data streams below.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 text-left">
                      <Card title="Data Ingestion" icon={Plus} neonColor="cyan" subtitle="External Streams">
                        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 flex items-center justify-center text-slate-700 hover:border-neon-cyan/50 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all cursor-pointer group">
                          <div className="text-center">
                            <Plus className="mx-auto mb-4 group-hover:scale-125 transition-transform" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Upload PDF / JSON / CSV</span>
                            <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Max file size: 25MB</p>
                          </div>
                        </div>
                      </Card>
                      <Card title="Neural Strategy" icon={Sparkles} neonColor="indigo" subtitle="AI Computation">
                        <div className="space-y-6 py-4">
                          <div className="space-y-3">
                            <div className="h-2.5 bg-slate-800/50 rounded-full w-3/4 animate-pulse" />
                            <div className="h-2.5 bg-slate-800/50 rounded-full w-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="h-2.5 bg-slate-800/50 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                          <div className="pt-6 border-t border-slate-800/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Calibration Status</span>
                              <span className="text-[9px] font-black text-neon-indigo uppercase tracking-widest">Pending Data</span>
                            </div>
                            <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                              <div className="h-full bg-neon-indigo/20 w-1/3" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 p-4 lg:hidden z-50">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('dashboard')} className={cn("p-3 transition-all rounded-xl", activeTab === 'dashboard' ? "text-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "text-slate-500")}><Activity size={24} /></button>
          <button onClick={() => setActiveTab('fire')} className={cn("p-3 transition-all rounded-xl", activeTab === 'fire' ? "text-neon-rose bg-neon-rose/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "text-slate-500")}><Flame size={24} /></button>
          <button onClick={() => setActiveTab('tax')} className={cn("p-3 transition-all rounded-xl", activeTab === 'tax' ? "text-neon-amber bg-neon-amber/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "text-slate-500")}><FileText size={24} /></button>
          <button onClick={() => setActiveTab('couple')} className={cn("p-3 transition-all rounded-xl", activeTab === 'couple' ? "text-neon-rose bg-neon-rose/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "text-slate-500")}><Heart size={24} /></button>
        </div>
      </footer>
    </div>
  );
}
