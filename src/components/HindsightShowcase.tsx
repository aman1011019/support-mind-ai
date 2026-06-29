import React from 'react';
import {
  ArrowRight,
  Brain,
  Database,
  ExternalLink,
  Github,
  Search,
  Server,
  Sparkles,
} from 'lucide-react';
import CascadeFlowMap from './CascadeFlowMap';

const MEMORY_STAGES = [
  {
    label: 'Retain',
    description: 'Capture customer complaints, resolutions, metadata, and time signals as durable memory.',
    icon: Database,
  },
  {
    label: 'Recall',
    description: 'Retrieve matching history with semantic, keyword, graph, and temporal search patterns.',
    icon: Search,
  },
  {
    label: 'Reflect',
    description: 'Turn related interactions into guidance that helps the agent respond with better judgment.',
    icon: Sparkles,
  },
] as const;

export default function HindsightShowcase() {
  return (
    <section id="hindsight" className="bg-[#F8F9FA] dark:bg-[#090D16] py-24 border-b border-[#E8EAED] dark:border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6366F1] tracking-wider uppercase bg-[#EEF2FF] dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1 rounded-full">
                <Github className="w-3.5 h-3.5" /> Vectorize Hindsight
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal leading-tight">
                SupportMind now maps directly to the open Hindsight memory model.
              </h2>
              <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                The website now presents Hindsight as the memory layer behind customer context: retain every relevant signal, recall the right history, then reflect before CascadeFlow chooses a response path.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/vectorize-io/hindsight"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#1A1A2E] hover:bg-[#111827] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#111827] font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
              >
                <Github className="w-4 h-4" /> View GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://hindsight.vectorize.io"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#F1F3F5] dark:bg-[#111726] dark:hover:bg-slate-800 text-[#1A1A2E] dark:text-slate-200 border border-[#E8EAED] dark:border-[#1E293B] font-bold px-4 py-2.5 rounded-lg text-xs transition-all shadow-sm"
              >
                Read Docs <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] overflow-hidden shadow-sm">
              <img
                src="/hindsight-github-banner.png"
                alt="Hindsight by Vectorize"
                className="w-full aspect-[16/7] object-cover bg-[#0B0F19]"
              />
              <div className="p-4 border-t border-[#E8EAED] dark:border-[#1E293B]">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  <Server className="w-3.5 h-3.5 text-[#6366F1]" />
                  API at localhost:8888 or cloud hosted memory
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MEMORY_STAGES.map(({ label, description, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#6366F1] dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100 mb-1">{label}</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">{description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-[#E8EAED] dark:border-[#1E293B] mb-5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#6366F1]" />
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">Hindsight + CascadeFlow</p>
                    <p className="text-[10px] font-medium text-[#64748B] dark:text-slate-400">
                      Customer memory becomes the input signal for cost-aware model routing.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-1 rounded-lg">
                  retain &gt; recall &gt; route
                </span>
              </div>
              <CascadeFlowMap savingsPercent={76} activeLevel={3} />
            </div>

            <div className="bg-[#1A1A2E] rounded-xl border border-slate-800 p-5 font-mono text-[11px] leading-relaxed shadow-xl overflow-hidden">
              <p className="text-emerald-400"># Hindsight client handoff</p>
              <p className="text-blue-300">npm install @vectorize-io/hindsight-client</p>
              <p className="text-slate-400 mt-3">const client = new HindsightClient(&#123; baseUrl: "http://localhost:8888" &#125;);</p>
              <p className="text-slate-400">await client.retain(customerId, supportSummary);</p>
              <p className="text-slate-400">const memory = await client.recall(customerId, currentComplaint);</p>
              <p className="text-purple-300 mt-3">&gt; CascadeFlow receives memory depth, priority, plan, and risk score.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
