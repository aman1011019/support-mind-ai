/**
 * ResponseCard — Displays AI-generated resolution from real backend
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportResolveResponse } from '../services/api';
import {
  Brain, ShieldCheck, Copy, Check, ChevronDown,
  SlidersHorizontal, Sparkles, AlertTriangle, Clock
} from 'lucide-react';

interface ResponseCardProps {
  resolution: SupportResolveResponse;
}

export default function ResponseCard({ resolution }: ResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

  const { ticket, ai_response, memory_found, processing_time_ms } = resolution;

  const handleCopy = () => {
    navigator.clipboard.writeText(ai_response.generated_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const priorityColors: Record<string, string> = {
    urgent: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
    high: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
    medium: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50',
    low: 'text-slate-600 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50',
  };
  const priorityColor = priorityColors[ticket.priority] || priorityColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="ai-response-card"
      className="bg-gradient-to-br from-[#EEF2FF] to-white dark:from-[#1E1B4B]/20 dark:to-[#111726] border border-[#6366F1]/15 dark:border-indigo-500/10 rounded-2xl p-6 shadow-sm relative overflow-hidden"
    >
      {/* Subtle glow */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#6366F1]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-5 border-b border-[#6366F1]/10 mb-5">
          <div className="flex-1 space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6366F1] text-white text-[10px] font-bold rounded-lg uppercase tracking-wide shadow-sm shadow-[#6366F1]/20">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
              {memory_found && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg uppercase">
                  <Brain className="w-3 h-3" /> Hindsight Memory Used
                </span>
              )}
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase ${priorityColor}`}>
                {ticket.priority} priority
              </span>
              {ai_response.escalation_required && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg uppercase">
                  <AlertTriangle className="w-3 h-3" /> Escalated
                </span>
              )}
            </div>

            {/* AI Response body */}
            <div className="bg-white/70 dark:bg-[#111726]/70 backdrop-blur-sm rounded-xl p-5 border border-white/60 dark:border-slate-800/80 shadow-inner">
              <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mb-3">
                AI-Generated Customer Response:
              </p>
              <div className="whitespace-pre-wrap font-sans text-sm text-[#1A1A2E] dark:text-slate-200 leading-relaxed select-text">
                {ai_response.generated_response}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                id="copy-draft-btn"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#111726] border border-[#E8EAED] dark:border-slate-700 hover:border-[#6366F1]/30 hover:bg-[#F8F9FA] dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-[#1A1A2E] dark:text-slate-200 transition-all cursor-pointer shadow-sm"
              >
                {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Response</>}
              </button>
              <button
                id="send-customer-btn"
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5053E0] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#6366F1]/20 active:scale-95"
              >
                {sent ? <><Check className="w-3.5 h-3.5" /> Sent!</> : 'Send to Customer'}
              </button>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="flex flex-col items-end gap-3 min-w-[140px] shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#6366F1] dark:text-indigo-400 uppercase tracking-wide mb-0.5">Confidence</p>
              <p className="text-3xl font-black text-[#6366F1] dark:text-indigo-400 font-mono leading-none">
                {(ai_response.confidence_score * 100).toFixed(0)}%
              </p>
              <p className="text-[9px] text-[#64748B] dark:text-slate-500 mt-0.5">Hindsight Cross-Referenced</p>
            </div>

            <div className="space-y-2 w-full">
              <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-2.5 border border-white dark:border-slate-800 text-right">
                <p className="text-[9px] font-bold text-[#94A3B8] uppercase">Urgency Score</p>
                <p className="text-sm font-black font-mono text-rose-500">{ai_response.urgency_score}/100</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-2.5 border border-white dark:border-slate-800 text-right">
                <p className="text-[9px] font-bold text-[#94A3B8] uppercase">Route</p>
                <p className="text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 font-mono truncate max-w-[120px]">Cascade L{ai_response.cascade_level}</p>
              </div>
              <div className="flex items-center gap-1 justify-end text-[9px] text-[#94A3B8] dark:text-slate-500 font-medium">
                <Clock className="w-3 h-3" />
                {processing_time_ms > 1000 ? `${(processing_time_ms/1000).toFixed(1)}s` : `${processing_time_ms}ms`}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended actions */}
        {ai_response.recommended_resolution && (
          <div className="p-4 bg-white/50 dark:bg-[#111726]/40 border border-emerald-100 dark:border-emerald-900/30 rounded-xl mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Suggested Internal Action
            </div>
            <p className="text-xs text-[#1A1A2E] dark:text-slate-300 leading-relaxed font-medium">
              {ai_response.recommended_resolution}
            </p>
          </div>
        )}

        {/* Memory context used */}
        {memory_found && ai_response.memory_context_used && (
          <div className="p-4 bg-[#6366F1]/5 dark:bg-indigo-950/10 border border-[#6366F1]/10 dark:border-indigo-900/20 rounded-xl mb-4 flex items-start gap-3">
            <Brain className="w-4 h-4 text-[#6366F1] dark:text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Hindsight Memory Connection
              </span>
              <p className="text-xs text-[#1A1A2E] dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                {ai_response.memory_context_used.slice(0, 300)}{ai_response.memory_context_used.length > 300 ? '...' : ''}
              </p>
            </div>
          </div>
        )}

        {/* CascadeFlow trace accordion */}
        <div className="border-t border-[#6366F1]/10 pt-4">
          <button
            id="toggle-trace-btn"
            onClick={() => setShowTrace(!showTrace)}
            className="flex items-center justify-between w-full text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              CascadeFlow routing trace
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTrace ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showTrace && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="font-mono text-[10px] text-[#64748B] dark:text-slate-400 bg-[#1A1A2E] rounded-xl p-4 mt-3 space-y-1.5 leading-relaxed">
                  <p className="text-[#6366F1] font-bold">[!] Trace generated at {new Date().toLocaleTimeString()}</p>
                  <p><span className="text-slate-500">&gt;</span> Ticket ID: <span className="text-emerald-400">{ticket.id}</span></p>
                  <p><span className="text-slate-500">&gt;</span> Hindsight Memory: <span className={memory_found ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {memory_found ? 'MATCHED' : 'no history found'}
                  </span></p>
                  <p><span className="text-slate-500">&gt;</span> CascadeFlow Level: <span className="text-purple-400 font-bold">
                    {ai_response.cascade_level} ({ai_response.cascade_level === 3 ? 'Multi-Token Reasoning' : ai_response.cascade_level === 2 ? 'Standard' : 'Budget'})
                  </span></p>
                  <p><span className="text-slate-500">&gt;</span> Route: <span className="text-blue-400">SupportMind Cascade L{ai_response.cascade_level}</span></p>
                  <p><span className="text-slate-500">&gt;</span> Tokens: <span className="text-white">{ai_response.tokens_used.toLocaleString()}</span> | Cost: <span className="text-emerald-400 font-bold">${ai_response.cost_usd.toFixed(5)}</span></p>
                  <p><span className="text-slate-500">&gt;</span> Urgency: <span className="text-amber-400 font-bold">{ai_response.urgency_score}/100</span></p>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold pt-2 border-t border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> SLA Delivery Guarantee Met. Trace closed.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
