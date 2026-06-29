import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDarkMode } from '../utils/theme';
import ProductLogo from './ProductLogo';
import HindsightShowcase from './HindsightShowcase';
import { 
  Brain, 
  Cpu, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Play, 
  X, 
  CheckCircle2, 
  User, 
  MessageSquare,
  ArrowUpRight,
  Zap,
  TrendingDown,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useDarkMode();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [interactiveChatStep, setInteractiveChatStep] = useState(0);

  // Auto-typing animation for the landing page hero preview
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractiveChatStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Watch demo step transition
  useEffect(() => {
    if (!isDemoOpen) {
      setDemoStep(0);
      return;
    }
    const timer = setTimeout(() => {
      if (demoStep < 5) {
        setDemoStep(prev => prev + 1);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [isDemoOpen, demoStep]);

  const handleStartTrial = () => {
    navigate('/login');
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="landing-root" className="min-h-screen bg-[#F8F9FA] dark:bg-[#090D16] text-[#1A1A2E] dark:text-slate-100 font-sans selection:bg-[#EEF2FF] dark:selection:bg-indigo-950 selection:text-[#6366F1] dark:selection:text-indigo-400 transition-colors duration-200">
      {/* Sticky Top Navbar */}
      <nav id="navbar" className="sticky top-0 z-50 bg-white/80 dark:bg-[#090D16]/85 backdrop-blur-md border-b border-[#E8EAED] dark:border-[#1E293B] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ProductLogo />
          </div>
 
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => handleScrollTo('features')} className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-100 transition-colors cursor-pointer">Features</button>
            <button onClick={() => handleScrollTo('hindsight')} className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-100 transition-colors cursor-pointer">Hindsight</button>
            <button onClick={() => handleScrollTo('technology')} className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-100 transition-colors cursor-pointer">Technology</button>
            <button onClick={() => handleScrollTo('pricing')} className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-100 transition-colors cursor-pointer">Enterprise</button>
          </div>
 
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer active:scale-95 shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button 
              id="nav-login-btn"
              onClick={() => navigate('/login')} 
              className="hidden sm:inline-flex text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-100 px-4 py-2 rounded-lg transition-all"
            >
              Sign In
            </button>
            <button 
              id="nav-get-started-btn"
              onClick={handleStartTrial}
              className="group text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#5053E0] px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-[#6366F1]/15 active:scale-[0.98] flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF2FF] dark:bg-indigo-950/40 border border-[#EEF2FF] dark:border-indigo-900/50 rounded-full text-xs font-semibold text-[#6366F1] dark:text-indigo-400 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Introducing Hindsight Memory
          </div>
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal leading-[1.1] max-w-xl">
            Customer support that <span className="text-[#6366F1] dark:text-indigo-400">actually remembers</span> your users.
          </h1>
          <p className="text-base md:text-lg text-[#64748B] dark:text-slate-400 font-medium leading-relaxed max-w-xl">
            AI-powered customer support agents that remember previous complaints, analyze individual buyer context, and deliver highly personalized resolutions automatically.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button 
              id="hero-trial-btn"
              onClick={handleStartTrial}
              className="bg-[#6366F1] hover:bg-[#5053E0] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-[#6366F1]/10 active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <button 
              id="hero-demo-btn"
              onClick={() => setIsDemoOpen(true)}
              className="bg-white hover:bg-[#F1F3F5] dark:bg-slate-900 dark:hover:bg-slate-800/80 text-[#1A1A2E] dark:text-slate-200 border border-[#E8EAED] dark:border-slate-800 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#1A1A2E] dark:fill-slate-200" /> Watch Demo
            </button>
          </div>


          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#E8EAED] dark:border-slate-800 w-full max-w-md">
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E] dark:text-slate-100 font-mono">76%</p>
              <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 tracking-normal">Average Cost Cut</p>
            </div>
            <div className="w-px h-8 bg-[#E8EAED] dark:bg-slate-800"></div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E] dark:text-slate-100 font-mono">&lt; 5s</p>
              <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 tracking-normal">AI Agent Resolution</p>
            </div>
            <div className="w-px h-8 bg-[#E8EAED] dark:bg-slate-800"></div>
            <div>
              <p className="text-2xl font-bold text-[#1A1A2E] dark:text-slate-100 font-mono">100%</p>
              <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 tracking-normal">Memory Accuracy</p>
            </div>
          </div>

        </div>

        {/* Right Hero Preview: Interactive Chat Terminal */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#6366F1]/10 to-transparent rounded-2xl blur-lg opacity-70"></div>
          <div className="relative bg-white dark:bg-[#111726] rounded-2xl border border-[#E8EAED] dark:border-[#1E293B] shadow-xl dark:shadow-none overflow-hidden min-h-[420px] flex flex-col">
            {/* Terminal Header */}
            <div className="bg-[#F8F9FA] dark:bg-[#0B0F19] px-4 py-3 border-b border-[#E8EAED] dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F43F5E]"></span>
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
              </div>
              <div className="flex items-center gap-1 bg-[#EEF2FF] border border-[#EEF2FF] px-2 py-0.5 rounded-md text-[10px] font-bold text-[#6366F1] uppercase">
                <Brain className="w-3 h-3" /> Hindsight Memory Live
              </div>
            </div>

            {/* Simulated Live Action Terminal */}
            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                {/* Simulated Customer */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#EEF2FF] border border-[#E8EAED] flex items-center justify-center text-xs font-bold text-[#6366F1]">
                    SJ
                  </div>
                  <div className="bg-[#F1F3F5] dark:bg-slate-900 rounded-2xl p-3.5 max-w-[85%] text-xs font-medium text-[#1A1A2E] dark:text-slate-200 leading-relaxed">
                    "My shipment ORD-90812 is late. Can you track it?"
                  </div>
                </div>

                {/* Hindsight System Scan */}
                <div className="border-l-2 border-[#6366F1] pl-3 py-1 my-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                    <Zap className="w-3 h-3 animate-pulse text-[#6366F1]" /> Hindsight Engine Active
                  </div>
                  <p className="text-[11px] font-mono text-[#64748B] dark:text-slate-400 mt-1">
                    Analyzing Sarah Jenkins profile history... Found 3 previous entries. 
                    <br />
                    <span className="text-[#1A1A2E] dark:text-slate-200 font-medium">3 days ago: Card failed at checkout.</span> Delay caused packaging wait.
                  </p>
                </div>

                {/* AI Reply Card */}
                <AnimatePresence mode="wait">
                  {interactiveChatStep === 0 && (
                    <motion.div 
                      key="step-0"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        AI
                      </div>
                      <div className="bg-[#EEF2FF]/50 dark:bg-indigo-950/30 border border-[#EEF2FF] dark:border-indigo-900/40 rounded-2xl p-3.5 max-w-[85%] text-xs font-medium text-[#1A1A2E] dark:text-slate-200 leading-relaxed">
                        <span className="font-bold text-[#6366F1]">SupportMind Agent:</span>
                        <p className="mt-1">
                          "Hi Sarah. I noticed your payment verification failed initially on Monday, delaying dispatch. Since you are an Enterprise partner, I have escalated this directly to an express courier..."
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {interactiveChatStep === 1 && (
                    <motion.div 
                      key="step-1"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        AI
                      </div>
                      <div className="bg-[#EEF2FF]/50 dark:bg-indigo-950/30 border border-[#EEF2FF] dark:border-indigo-900/40 rounded-2xl p-3.5 max-w-[85%] text-xs font-medium text-[#1A1A2E] dark:text-slate-200 leading-relaxed">
                        <span className="font-bold text-[#6366F1]">Intelligence Routing:</span>
                        <p className="mt-1">
                          "We've detected you upgraded your subscription to 15 team seats last week. We are waiving your courier upgrade fee entirely to guarantee your presentation is a success!"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {interactiveChatStep === 2 && (
                    <motion.div 
                      key="step-2"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        OK
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3.5 max-w-[85%] text-xs font-medium text-[#1A1A2E] dark:text-slate-200 leading-relaxed">
                        <span className="font-bold text-[#10B981]">Status: Resolved with Hindsight Memory</span>
                        <p className="mt-0.5 text-[#64748B] dark:text-slate-400">
                          Customer satisfaction validated. Ticket resolved contextually in 4.2 seconds.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Console Stats */}
              <div className="pt-3 border-t border-[#E8EAED] dark:border-[#1E293B] grid grid-cols-2 gap-4">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#10B981]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Saves</p>
                    <p className="text-[11px] font-mono font-bold text-[#10B981]">-76% cost/query</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#6366F1]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Routing</p>
                    <p className="text-[11px] font-mono font-bold text-[#6366F1]">CascadeFlow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="bg-white dark:bg-[#0B0F19] py-24 border-t border-b border-[#E8EAED] dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-[#6366F1] tracking-wider uppercase bg-[#EEF2FF] px-3 py-1 rounded-full">Engineered for Quality</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal">The ultimate intelligent support system</h2>
            <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400 font-medium">Traditional AI support loops are isolated. SupportMind tracks, correlates, and adapts dynamically using context history.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-[#E8EAED] dark:border-[#1E293B] bg-[#F8F9FA] dark:bg-[#111726] hover:border-[#6366F1] transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E8EAED] flex items-center justify-center text-[#6366F1] mb-6 shadow-sm group-hover:bg-[#6366F1] group-hover:text-white transition-colors duration-300">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-slate-100 mb-2">Hindsight Memory</h3>
              <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                Tracks past credit issues, plan downgrades, and courier setups automatically. Uses comprehensive memory models to contextualize any incoming support query.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-[#E8EAED] dark:border-[#1E293B] bg-[#F8F9FA] dark:bg-[#111726] hover:border-[#6366F1] transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E8EAED] flex items-center justify-center text-[#6366F1] mb-6 shadow-sm group-hover:bg-[#6366F1] group-hover:text-white transition-colors duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-slate-100 mb-2">CascadeFlow Routing</h3>
              <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                Dynamically cascades issues from budget query processors to premium reasoning nodes based on user history and complexity, lowering support billing by 76%.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-[#E8EAED] dark:border-[#1E293B] bg-[#F8F9FA] dark:bg-[#111726] hover:border-[#6366F1] transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E8EAED] flex items-center justify-center text-[#6366F1] mb-6 shadow-sm group-hover:bg-[#6366F1] group-hover:text-white transition-colors duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] dark:text-slate-100 mb-2">Personalized Support</h3>
              <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                Autonomously composes tailored email and chat support replies citing past client interactions, removing repetitive friction and building true customer delight.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HindsightShowcase />

      {/* Technology Section */}
      <section id="technology" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col items-start gap-4">
            <span className="text-xs font-bold text-[#6366F1] tracking-wider uppercase bg-[#EEF2FF] px-2.5 py-1 rounded-md">Precision Infrastructure</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal">The developer's dream customer agent</h2>
            <p className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed">
              SupportMind processes customer support with multi-layer tracing. Every time an issue is sent, our platform checks real-time context and logs cost metrics transparently, giving your managers full control over cost, quality, and routing rules.
            </p>
            <div className="space-y-3 w-full mt-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">Instant local context assembly</p>
                  <p className="text-xs text-[#64748B] font-medium">Assembles complete context profiles in less than 200ms before routing.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">Transparent reasoning tracers</p>
                  <p className="text-xs text-[#64748B] font-medium">Shows exactly which past billing tickets or user complaints influenced the result.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1A1A2E]">Adaptive plan thresholds</p>
                  <p className="text-xs text-[#64748B] font-medium">Prioritizes resolution paths based on customer subscription value metrics.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#1A1A2E] text-[#94A3B8] p-6 rounded-2xl border border-gray-800 shadow-xl font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">hindsight-query-tracer</span>
              </div>
              <p className="text-green-400"># Initializing memory recall</p>
              <p className="text-blue-400">$ GET /api/v1/hindsight/context?customer_email=sarah.jenkins@acme.com</p>
              <p className="text-[#94A3B8] pl-4">{`{`}</p>
              <p className="text-[#94A3B8] pl-8">"customer_id": "cust_9021",</p>
              <p className="text-[#94A3B8] pl-8">"plan": <span className="text-purple-400">"Enterprise"</span>,</p>
              <p className="text-[#94A3B8] pl-8">"hindsight_memory_recall": true,</p>
              <p className="text-emerald-400 pl-8">"historical_tickets": [2 days ago (Billing Delay), 6 days ago (Shipping Upgrade)]</p>
              <p className="text-[#94A3B8] pl-4">{`}`}</p>
              <p className="text-green-400 mt-2"># Routing query complexity...</p>
              <p className="text-purple-400">$ CascadeFlow match level: 3 (Multi-Token Reasoning)</p>
              <p className="text-yellow-400">$ Estimated cost: $0.051 (Savings: 76% vs baseline models)</p>
              <p className="text-white mt-2 font-bold">&gt;_ Synthesizing response using previous interaction vector...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section id="pricing" className="bg-[#F1F3F5] dark:bg-[#0B0F19] py-24 border-t border-[#E8EAED] dark:border-[#1E293B]">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <span className="text-xs font-bold text-[#6366F1] uppercase tracking-widest">Enterprise SLA & Pricing</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal">Stop giving generic customer support.</h2>
          <p className="text-[#64748B] dark:text-slate-400 text-base md:text-lg max-w-2xl font-medium">
            Join the support revolution. Integrate with Slack, Intercom, Zendesk, or use our premium custom dashboard to empower your customer satisfaction.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <button 
              id="cta-trial-btn"
              onClick={handleStartTrial}
              className="bg-[#6366F1] hover:bg-[#5053E0] text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-md shadow-[#6366F1]/10 active:scale-[0.98] flex items-center gap-2"
            >
              Try SupportMind Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#090D16] border-t border-[#E8EAED] dark:border-[#1E293B] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ProductLogo markClassName="w-7 h-7" wordmarkClassName="text-sm" />
          </div>
          <p className="text-xs font-medium text-[#94A3B8]">
            Copyright {new Date().getFullYear()} SupportMind Inc. Built for exceptional customer experiences. All rights reserved.
          </p>
        </div>
      </footer>

      {/* INTERACTIVE VIDEO/DEMO MODAL (Highly functional, simulates the memory pipeline!) */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm"
              onClick={() => setIsDemoOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E8EAED] shadow-2xl overflow-hidden z-10"
            >
              <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E8EAED] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#6366F1]" />
                  <span className="font-bold text-sm text-[#1A1A2E]">Hindsight AI Memory Simulator</span>
                </div>
                <button 
                  onClick={() => setIsDemoOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#E8EAED] transition-colors"
                >
                  <X className="w-4.5 h-4.5 text-[#64748B]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-[#1A1A2E] mb-1">Watch Hindsight solve a complex late shipment query</h3>
                  <p className="text-xs text-[#64748B] font-medium">This interactive panel runs the actual 5-step analysis sequence used in our platform.</p>
                </div>

                {/* Simulated Steps Progress Bar */}
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-1 h-1.5 bg-[#E8EAED] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${demoStep >= 1 ? 'bg-[#6366F1]' : 'bg-[#E8EAED]'}`}></div>
                    <div className={`h-full transition-all duration-300 ${demoStep >= 2 ? 'bg-[#6366F1]' : 'bg-[#E8EAED]'}`}></div>
                    <div className={`h-full transition-all duration-300 ${demoStep >= 3 ? 'bg-[#6366F1]' : 'bg-[#E8EAED]'}`}></div>
                    <div className={`h-full transition-all duration-300 ${demoStep >= 4 ? 'bg-[#6366F1]' : 'bg-[#E8EAED]'}`}></div>
                    <div className={`h-full transition-all duration-300 ${demoStep >= 5 ? 'bg-[#6366F1]' : 'bg-[#E8EAED]'}`}></div>
                  </div>

                  {/* Steps list */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#64748B]">Current Pipeline Phase:</span>
                      <span className="text-[#6366F1] font-mono">
                        {demoStep === 0 && 'Awaiting Dispatch...'}
                        {demoStep === 1 && '1/5 Checking customer profile...'}
                        {demoStep === 2 && '2/5 Recalling historical context...'}
                        {demoStep === 3 && '3/5 CascadeFlow optimization...'}
                        {demoStep === 4 && '4/5 Generating response...'}
                        {demoStep === 5 && '5/5 Complete!'}
                      </span>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E8EAED] font-mono text-[11px] text-[#64748B] space-y-1.5">
                      <p className={demoStep >= 1 ? 'text-[#1A1A2E] font-medium' : 'opacity-40'}>
                        [done] Profile Loaded: Sarah Jenkins (Tier: Enterprise, Value: $12k/yr)
                      </p>
                      <p className={demoStep >= 2 ? 'text-[#1A1A2E] font-medium' : 'opacity-40'}>
                        [done] Hindsight match: Card delay found 3 days ago. Overnight shipping upgrade matched from June 21.
                      </p>
                      <p className={demoStep >= 3 ? 'text-[#1A1A2E] font-medium' : 'opacity-40'}>
                        [done] CascadeFlow optimization: Directed query from baseline models to Reasoning Core.
                      </p>
                      <p className={demoStep >= 4 ? 'text-[#1A1A2E] font-medium' : 'opacity-40'}>
                        [done] Response synthesized. Custom resolution drafted. Urgency index computed: 92/100.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Outcome Preview */}
                <AnimatePresence mode="wait">
                  {demoStep >= 5 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#10B981]" />
                        Perfect Resolution Synthesized with Hindsight Memory
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Rather than replying with a generic tracking link, the AI explained that her order was caught in a billing bottleneck from Monday's transaction. It issued a shipping refund and dispatched a direct messenger.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="h-16 flex items-center justify-center border border-dashed border-[#E8EAED] rounded-xl text-xs text-[#94A3B8] font-medium">
                      Simulating real-time AI memory trace...
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-6 py-4 bg-[#F8F9FA] border-t border-[#E8EAED] flex items-center justify-between">
                <button 
                  onClick={() => setDemoStep(1)}
                  className="text-xs font-bold text-[#6366F1] hover:underline"
                >
                  Restart Simulation
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsDemoOpen(false)}
                    className="text-xs font-bold text-[#64748B] hover:text-[#1A1A2E] px-3 py-2 rounded-lg"
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleStartTrial}
                    className="bg-[#6366F1] hover:bg-[#5053E0] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1"
                  >
                    Try it Live <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
