/**
 * SupportMind — Main Dashboard
 * Real API data: customers, analytics, AI resolution
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, supportApi, CustomerData, SupportResolveResponse, DashboardAnalytics } from '../services/api';
import { useDarkMode } from '../utils/theme';
import Sidebar from './Sidebar';
import SupportInput from './SupportInput';
import ResponseCard from './ResponseCard';
import MemoryManager from './MemoryManager';
import {
  Brain, Check, Menu, X, Bot, Inbox, Info, Sun, Moon,
  TrendingUp, Clock, Smile, AlertTriangle, Users, Zap
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, label: 'Identifying customer profile', desc: 'Fetching customer data from database...' },
  { id: 2, label: 'Retrieving Hindsight Memory', desc: 'Scanning historical interaction vectors...' },
  { id: 3, label: 'CascadeFlow model routing', desc: 'Determining optimal AI model tier...' },
  { id: 4, label: 'Generating AI response', desc: 'Synthesizing personalized reply through the response engine...' },
  { id: 5, label: 'Storing to memory database', desc: 'Persisting interaction for future context...' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useDarkMode();

  const [activeTab, setActiveTab] = useState<'agent' | 'memory'>('agent');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI resolution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [activeResolution, setActiveResolution] = useState<SupportResolveResponse | null>(null);
  const [resolveError, setResolveError] = useState('');

  // ── Load customers from API ──────────────────────────────────────────────
  const loadCustomers = useCallback(async () => {
    try {
      const data = await analyticsApi.getCustomers();
      setCustomers(data);
      if (data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data[0]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  // ── Load analytics from API ──────────────────────────────────────────────
  const loadAnalytics = useCallback(async () => {
    try {
      const data = await analyticsApi.getDashboard();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
    loadAnalytics();
  }, [loadCustomers, loadAnalytics]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCustomerSelect = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setActiveResolution(null);
    setResolveError('');
    setIsSidebarOpen(false);
  };

  // ── AI Resolution — full pipeline with real API ──────────────────────────
  const handleSupportResolve = async (data: {
    customerName: string;
    orderId: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complaintText: string;
  }) => {
    if (!selectedCustomer) return;
    setIsProcessing(true);
    setPipelineStep(1);
    setActiveResolution(null);
    setResolveError('');

    // Animate pipeline steps (visual feedback during API call)
    const stepTimer = setInterval(() => {
      setPipelineStep(prev => prev < 4 ? prev + 1 : prev);
    }, 900);

    try {
      const result = await supportApi.resolve({
        customer_id: selectedCustomer.id,
        customer_name: data.customerName,
        order_id: data.orderId,
        issue_text: data.complaintText,
        issue_category: data.category,
        priority: data.priority,
      });

      clearInterval(stepTimer);
      setPipelineStep(5);

      // Brief pause to show "complete" state
      await new Promise(r => setTimeout(r, 600));

      setActiveResolution(result);
      setIsProcessing(false);
      setPipelineStep(0);

      // Refresh analytics and customers
      loadAnalytics();
      loadCustomers();

    } catch (err: any) {
      clearInterval(stepTimer);
      setIsProcessing(false);
      setPipelineStep(0);
      setResolveError(err.message || 'Failed to resolve ticket. Please try again.');
    }
  };

  const handleDemoComplaint = () => {
    if (!selectedCustomer) return;
    handleSupportResolve({
      customerName: selectedCustomer.name,
      orderId: selectedCustomer.order_id || 'ORD-90812',
      category: 'Shipping',
      priority: 'high',
      complaintText: `My order ${selectedCustomer.order_id || 'ORD-90812'} hasn't arrived yet and it was expected 2 days ago. We have an important presentation tomorrow and need this resolved urgently.`,
    });
  };

  // ── Analytics display values ─────────────────────────────────────────────
  const stats = analytics ? [
    {
      label: 'Resolved Today',
      value: analytics.resolved_today,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    {
      label: 'Pending Cases',
      value: analytics.pending_cases,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/50',
    },
    {
      label: 'CSAT Score',
      value: `${analytics.csat_score}%`,
      icon: Smile,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      border: 'border-indigo-100 dark:border-indigo-900/50',
    },
    {
      label: 'Escalated',
      value: analytics.escalated_tickets,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
  ] : [];

  return (
    <div id="dashboard-root" className="h-screen flex bg-[#F8F9FA] dark:bg-[#090D16] overflow-hidden font-sans text-[#1A1A2E] dark:text-slate-100 transition-colors duration-200">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleCustomerSelect}
          onLogout={handleLogout}
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          customers={customers}
          loadingCustomers={loadingCustomers}
          analytics={analytics}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-[#1A1A2E]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-[280px] bg-white dark:bg-[#0B0F19] h-full shadow-2xl flex flex-col z-10"
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-lg bg-[#F8F9FA] dark:bg-slate-900 border border-[#E8EAED] dark:border-slate-800 z-10"
              >
                <X className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
              </button>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={handleCustomerSelect}
                  onLogout={handleLogout}
                  user={user}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  customers={customers}
                  loadingCustomers={loadingCustomers}
                  analytics={analytics}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main workspace */}
      <main className={`flex-1 h-full flex flex-col ${activeTab === 'memory' ? 'overflow-hidden' : 'overflow-y-auto'}`}>

        {/* Top header */}
        <header className="h-16 px-5 bg-white dark:bg-[#0B0F19] border-b border-[#E8EAED] dark:border-[#1E293B] flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 border border-[#E8EAED] dark:border-[#1E293B] rounded-xl hover:bg-[#F8F9FA] dark:hover:bg-slate-800 lg:hidden transition-colors"
            >
              <Menu className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-[#6366F1] tracking-widest uppercase block">Intelligent Support Node</span>
              <h2 className="text-sm font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal flex items-center gap-2">
                {activeTab === 'memory' ? 'Memory Configuration' : 'AI Resolution Agent'}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 bg-[#F1F3F5] dark:bg-slate-900/60 px-3 py-1.5 rounded-full border border-[#E8EAED] dark:border-slate-800 text-[10px] font-mono font-bold text-[#64748B] dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Node
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#111726] text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] hover:border-[#6366F1]/30 transition-all cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content */}
        {activeTab === 'memory' ? (
          <div className="flex-1 overflow-hidden">
            <MemoryManager
              customers={customers}
              setCustomers={setCustomers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              onRefresh={loadCustomers}
            />
          </div>
        ) : (
          <div className="p-5 md:p-8 max-w-6xl mx-auto w-full space-y-6 flex-1 pb-16">

            {/* Stats cards */}
            {analytics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${bg} ${border} border rounded-xl p-4 flex items-center gap-3`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-white dark:bg-[#0B0F19] flex items-center justify-center shadow-sm ${border} border`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-black font-mono ${color}`}>{value}</p>
                      <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Welcome heading */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">AI Support Resolution</span>
              <h1 className="text-xl font-bold tracking-normal text-[#1A1A2E] dark:text-slate-100">
                New Resolution Request
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Select a customer profile to load their Hindsight Memory context, then submit a complaint for AI resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Support Input — takes 2 cols */}
              <div className="lg:col-span-2">
                {selectedCustomer ? (
                  <SupportInput
                    selectedCustomer={selectedCustomer}
                    onSubmit={handleSupportResolve}
                    isProcessing={isProcessing}
                  />
                ) : loadingCustomers ? (
                  <div className="bg-white dark:bg-[#111726] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] p-8 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium">Loading customer profiles...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#111726] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] p-8 text-center">
                    <Users className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#64748B] dark:text-slate-400">No customers found in database.<br />Add customers via the Memory tab.</p>
                  </div>
                )}
              </div>

              {/* Right sidebar cards */}
              <div className="space-y-4">
                {/* CascadeFlow card */}
                <div className="bg-white dark:bg-[#111726] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-[#6366F1]" />
                    <h3 className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">CascadeFlow™</h3>
                  </div>
                  {loadingAnalytics ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-4 bg-[#F1F3F5] dark:bg-slate-800 rounded animate-pulse" />)}
                    </div>
                  ) : analytics ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-[#64748B] dark:text-slate-400">Routing Efficiency</span>
                          <span className="font-bold text-[#10B981]">+{analytics.cascade_savings_percent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-[#F8F9FA] dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${analytics.cascade_savings_percent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-[#10B981] to-[#059669] h-full rounded-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F8F9FA] dark:bg-slate-950/50 rounded-lg p-3">
                          <p className="text-[9px] font-bold text-[#94A3B8] uppercase mb-1">Standard</p>
                          <p className="text-sm font-black font-mono text-slate-600 dark:text-slate-300">${analytics.cost_without_routing.toFixed(3)}</p>
                        </div>
                        <div className="bg-[#EEF2FF] dark:bg-indigo-950/30 rounded-lg p-3">
                          <p className="text-[9px] font-bold text-[#6366F1] uppercase mb-1">CascadeFlow</p>
                          <p className="text-sm font-black font-mono text-[#6366F1]">${analytics.cost_with_cascade.toFixed(3)}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 font-medium">{analytics.query_count} queries processed</p>
                    </div>
                  ) : null}
                </div>

                {/* Memory stats card */}
                <div className="bg-white dark:bg-[#111726] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-[#6366F1]" />
                    <h3 className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Agent Performance</h3>
                  </div>
                  {loadingAnalytics ? (
                    <div className="space-y-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-4 bg-[#F1F3F5] dark:bg-slate-800 rounded animate-pulse" />)}
                    </div>
                  ) : analytics ? (
                    <div className="space-y-2.5">
                      {[
                        { label: 'Total Customers', value: analytics.total_customers, color: 'text-slate-800 dark:text-slate-200' },
                        { label: 'Memory Entries', value: analytics.memory_entries, color: 'text-[#6366F1] dark:text-indigo-400' },
                        { label: 'Avg Response', value: `${(analytics.avg_response_time_ms / 1000).toFixed(1)}s`, color: 'text-slate-800 dark:text-slate-200' },
                        { label: 'CSAT Score', value: `${analytics.csat_score.toFixed(1)}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-xs text-[#64748B] dark:text-slate-400 font-semibold">{label}</span>
                          <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Pipeline Monitor */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  className="bg-[#1A1A2E] text-white rounded-2xl border border-slate-800 p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Brain className="w-5 h-5 text-[#6366F1] animate-pulse" />
                      <span className="text-sm font-bold tracking-normal">Hindsight Recall Pipeline Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {pipelineStep}/5 Complete
                    </span>
                  </div>
                  <div className="space-y-3">
                    {PIPELINE_STEPS.map((step) => {
                      const done = pipelineStep > step.id;
                      const active = pipelineStep === step.id;
                      return (
                        <div key={step.id} className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                          active ? 'bg-white/5 border-[#6366F1]/60' :
                          done ? 'bg-transparent border-transparent' :
                          'bg-transparent border-transparent opacity-40'
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {done ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : active ? (
                              <div className="w-5 h-5 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">{step.id}</div>
                            )}
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : done ? 'text-slate-300' : 'text-slate-500'}`}>{step.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error display */}
            <AnimatePresence>
              {resolveError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-sm text-rose-700 dark:text-rose-400 font-medium flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {resolveError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Outcome */}
            <section className="space-y-4">
              <AnimatePresence mode="wait">
                {activeResolution ? (
                  <motion.div
                    key={activeResolution.ticket.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ResponseCard resolution={activeResolution} />
                  </motion.div>
                ) : !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#E8EAED] dark:border-[#1E293B] rounded-2xl bg-white dark:bg-[#111726] text-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/40 flex items-center justify-center">
                      <Inbox className="w-6 h-6 text-[#6366F1] dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-200">Ready to resolve issues intelligently</h3>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                        Select a customer profile and submit a complaint. The AI will pull their Hindsight Memory and generate a personalized response.
                      </p>
                    </div>
                    {selectedCustomer && (
                      <button
                        id="try-demo-btn"
                        onClick={handleDemoComplaint}
                        className="bg-white dark:bg-slate-900 text-[#1A1A2E] dark:text-slate-200 border border-[#E8EAED] dark:border-slate-800 hover:bg-[#F1F3F5] dark:hover:bg-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Bot className="w-4 h-4 text-[#6366F1]" /> Try Demo Complaint
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#94A3B8] dark:text-slate-500 font-bold pt-4">
              <Info className="w-3.5 h-3.5" /> Secure sandbox session. Compliant with HIPAA, SOC2 Type II, and PCI DSS.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
