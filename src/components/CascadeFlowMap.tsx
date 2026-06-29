import React from 'react';
import { Brain, CheckCircle2, Cpu, Layers, Zap } from 'lucide-react';

interface CascadeFlowMapProps {
  savingsPercent?: number;
  queryCount?: number;
  activeLevel?: 1 | 2 | 3;
  compact?: boolean;
  className?: string;
}

const TIERS = [
  {
    level: 1,
    title: 'Fast support',
    trigger: 'Simple order, FAQ, or account update',
    model: 'Low-latency model',
    icon: Zap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/50',
  },
  {
    level: 2,
    title: 'Context support',
    trigger: 'Memory match or billing/shipping risk',
    model: 'Balanced reasoning',
    icon: Brain,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-900/50',
  },
  {
    level: 3,
    title: 'Critical support',
    trigger: 'Urgent priority, repeat issue, enterprise SLA',
    model: 'Deep reasoning',
    icon: Cpu,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-100 dark:border-rose-900/50',
  },
] as const;

export default function CascadeFlowMap({
  savingsPercent = 76,
  queryCount,
  activeLevel = 2,
  compact = false,
  className = '',
}: CascadeFlowMapProps) {
  const normalizedSavings = Math.max(0, Math.min(99, savingsPercent));

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-[#6366F1] dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-100 leading-tight">CascadeFlow routing</p>
            <p className="text-[10px] font-medium text-[#64748B] dark:text-slate-400 truncate">
              Hindsight context selects the right reasoning path.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black font-mono text-emerald-500 leading-none">{normalizedSavings.toFixed(0)}%</p>
          <p className="text-[9px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase">Savings</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-7 bottom-7 w-px bg-[#E8EAED] dark:bg-slate-800" aria-hidden="true" />
        <div className="space-y-2.5">
          {TIERS.map(({ level, title, trigger, model, icon: Icon, color, bg, border }) => {
            const isActive = activeLevel === level;
            return (
              <div
                key={level}
                className={`relative flex gap-3 rounded-lg border p-3 transition-all ${
                  isActive
                    ? `${bg} ${border} shadow-sm`
                    : 'bg-white dark:bg-[#111726] border-[#E8EAED] dark:border-[#1E293B]'
                }`}
              >
                <div className={`relative z-10 w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                  isActive
                    ? `bg-white dark:bg-[#0B0F19] ${border}`
                    : 'bg-[#F8F9FA] dark:bg-slate-900 border-[#E8EAED] dark:border-slate-800'
                }`}>
                  {isActive ? <CheckCircle2 className={`w-4 h-4 ${color}`} /> : <Icon className={`w-4 h-4 ${color}`} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-100">L{level} {title}</p>
                    <span className={`text-[9px] font-bold uppercase ${color}`}>{model}</span>
                  </div>
                  <p className={`text-[10px] font-medium text-[#64748B] dark:text-slate-400 ${compact ? 'truncate' : ''}`}>
                    {trigger}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Retain', 'store signal'],
            ['Recall', 'find context'],
            ['Route', 'choose tier'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] px-3 py-2">
              <p className="text-[10px] font-bold text-[#6366F1] dark:text-indigo-400 uppercase">{label}</p>
              <p className="text-[9px] font-medium text-[#94A3B8] dark:text-slate-500">{value}</p>
            </div>
          ))}
        </div>
      )}

      {typeof queryCount === 'number' && (
        <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 font-medium">
          {queryCount} routed {queryCount === 1 ? 'query' : 'queries'} through the current cascade policy.
        </p>
      )}
    </div>
  );
}
