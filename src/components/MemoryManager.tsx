/**
 * MemoryManager — Full CRUD for customer Hindsight Memory with real API
 */
import React, { useState } from 'react';
import { CustomerData, memoryApi, analyticsApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, UserPlus, Search, Brain,
  CheckCircle2, AlertCircle, Clock, Tag, Loader2
} from 'lucide-react';

interface MemoryManagerProps {
  customers: CustomerData[];
  setCustomers: React.Dispatch<React.SetStateAction<CustomerData[]>>;
  selectedCustomer: CustomerData | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<CustomerData | null>>;
  onRefresh: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
  high:   'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
  medium: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40',
  low:    'text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40',
};

const SENTIMENT_ICONS: Record<string, { icon: string; color: string }> = {
  positive:  { icon: '😊', color: 'text-emerald-500' },
  neutral:   { icon: '😐', color: 'text-slate-400' },
  negative:  { icon: '😟', color: 'text-amber-500' },
  frustrated:{ icon: '😤', color: 'text-rose-500' },
};

type CustomerPlan = 'Starter' | 'Growth' | 'Enterprise';

const createEmptyCustomerForm = () => ({
  name: '',
  email: '',
  phone: '',
  plan: 'Growth' as CustomerPlan,
  order_id: '',
  avatar_url: '',
});

export default function MemoryManager({
  customers, setCustomers, selectedCustomer, setSelectedCustomer, onRefresh
}: MemoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [customerForm, setCustomerForm] = useState(createEmptyCustomerForm);

  // New memory form
  const [histCategory, setHistCategory] = useState('Billing');
  const [histIssue, setHistIssue] = useState('');
  const [histResolution, setHistResolution] = useState('');
  const [histPriority, setHistPriority] = useState<'low'|'medium'|'high'|'urgent'>('medium');
  const [histSentiment, setHistSentiment] = useState('neutral');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCustomerForm = () => {
    setSaveError('');
    setSaveSuccess('');
    setIsAddingCustomer(true);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = customerForm.name.trim();
    const email = customerForm.email.trim().toLowerCase();
    if (!name || !email) return;

    setSavingCustomer(true);
    setSaveError('');
    try {
      const created = await analyticsApi.createCustomer({
        name,
        email,
        phone: customerForm.phone.trim() || undefined,
        plan: customerForm.plan,
        order_id: customerForm.order_id.trim() || undefined,
        avatar_url: customerForm.avatar_url.trim() || undefined,
      });
      setCustomers(prev => [...prev.filter(c => c.id !== created.id), created]);
      setSelectedCustomer(created);
      setSearchQuery('');
      setCustomerForm(createEmptyCustomerForm());
      setIsAddingCustomer(false);
      setSaveSuccess('Customer added successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to add customer');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !histIssue || !histResolution) return;
    setSaving(true);
    setSaveError('');
    try {
      await memoryApi.add({
        customer_id: selectedCustomer.id,
        previous_complaint: histIssue,
        previous_resolution: histResolution,
        issue_category: histCategory,
        priority: histPriority,
        sentiment: histSentiment,
      });
      setSaveSuccess('Memory entry added successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
      setIsAddingMemory(false);
      setHistIssue('');
      setHistResolution('');
      await onRefresh();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to add memory entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    setDeleting(memoryId);
    try {
      await memoryApi.delete(memoryId);
      await onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const addCustomerForm = (
    <AnimatePresence>
      {isAddingCustomer && (
        <motion.form
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          onSubmit={handleAddCustomer}
          className="mb-6 bg-white dark:bg-[#111726] border border-[#6366F1]/20 rounded-xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#6366F1]" />
            <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">Add Customer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input
                required
                value={customerForm.name}
                onChange={e => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer name"
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                required
                type="email"
                value={customerForm.email}
                onChange={e => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Phone</label>
              <input
                value={customerForm.phone}
                onChange={e => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555 0100"
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Plan</label>
              <select
                value={customerForm.plan}
                onChange={e => setCustomerForm(prev => ({ ...prev, plan: e.target.value as CustomerPlan }))}
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200"
              >
                {['Starter', 'Growth', 'Enterprise'].map(plan => <option key={plan}>{plan}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Reference ID</label>
              <input
                value={customerForm.order_id}
                onChange={e => setCustomerForm(prev => ({ ...prev, order_id: e.target.value }))}
                placeholder="ORD-10293"
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Avatar URL</label>
              <input
                type="url"
                value={customerForm.avatar_url}
                onChange={e => setCustomerForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingCustomer(false)}
              className="px-4 py-2 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-200 rounded-lg border border-[#E8EAED] dark:border-slate-700 bg-white dark:bg-[#0B0F19] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCustomer}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5053E0] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {savingCustomer ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Save Customer</>}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-full flex bg-[#F8F9FA] dark:bg-[#090D16] overflow-hidden">

      {/* Left: Customer list */}
      <div className="w-[260px] shrink-0 bg-white dark:bg-[#0B0F19] border-r border-[#E8EAED] dark:border-[#1E293B] flex flex-col">
        <div className="p-4 border-b border-[#E8EAED] dark:border-[#1E293B]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">Customer Profiles</h2>
            <button
              type="button"
              onClick={openCustomerForm}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400 hover:bg-[#E0E7FF] dark:hover:bg-indigo-900/50 text-[10px] font-bold transition-colors"
              title="Add customer"
            >
              <UserPlus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#F8F9FA] dark:bg-[#111726] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-xs font-medium outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredCustomers.map(cust => {
            const isSelected = cust.id === selectedCustomer?.id;
            return (
              <button
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EEF2FF] dark:bg-indigo-950/20 border-[#6366F1]/20 dark:border-indigo-500/20'
                    : 'bg-transparent border-transparent hover:bg-[#F8F9FA] dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {cust.avatar_url ? (
                    <img src={cust.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E8EAED] dark:border-slate-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {cust.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-100 truncate">{cust.name}</p>
                    <p className="text-[9px] text-[#94A3B8] dark:text-slate-500 truncate font-mono">{cust.plan}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 bg-[#EEF2FF] dark:bg-indigo-950/40 px-1.5 py-0.5 rounded shrink-0">
                    {cust.history?.length || 0}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Memory details */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCustomer ? (
          <div className="flex flex-col items-center justify-center min-h-full gap-3 text-center p-6">
            {isAddingCustomer ? (
              <div className="w-full max-w-2xl text-left">
                {addCustomerForm}
              </div>
            ) : (
              <>
                <Brain className="w-12 h-12 text-[#E8EAED] dark:text-slate-700" />
                <p className="text-sm font-medium text-[#94A3B8] dark:text-slate-500">Select a customer to view their Hindsight Memory</p>
                <button
                  type="button"
                  onClick={openCustomerForm}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5053E0] text-white rounded-lg text-xs font-bold shadow-md shadow-[#6366F1]/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Customer
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 max-w-4xl mx-auto">
            {addCustomerForm}

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedCustomer.avatar_url ? (
                  <img src={selectedCustomer.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#6366F1]/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg">
                    {selectedCustomer.name[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A2E] dark:text-slate-100">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">{selectedCustomer.email}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-900/50">
                      {selectedCustomer.plan}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAddingMemory(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5053E0] text-white rounded-lg text-xs font-bold shadow-md shadow-[#6366F1]/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Memory
              </button>
            </div>

            {/* Success/Error banners */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {saveSuccess}
                </motion.div>
              )}
              {saveError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4" /> {saveError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Memory Form */}
            <AnimatePresence>
              {isAddingMemory && (
                <motion.form
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  onSubmit={handleAddMemory}
                  className="mb-6 bg-white dark:bg-[#111726] border border-[#6366F1]/20 rounded-xl p-5 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-4 h-4 text-[#6366F1]" />
                    <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">Add Hindsight Memory Entry</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
                      <select value={histCategory} onChange={e => setHistCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200">
                        {['Billing','Shipping','Subscription','API Access','Technical Bug','General'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Priority</label>
                        <select value={histPriority} onChange={e => setHistPriority(e.target.value as any)}
                          className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200">
                          {['low','medium','high','urgent'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Sentiment</label>
                        <select value={histSentiment} onChange={e => setHistSentiment(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200">
                          {['positive','neutral','negative','frustrated'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Issue / Complaint</label>
                      <textarea required value={histIssue} onChange={e => setHistIssue(e.target.value)} rows={2}
                        placeholder="Describe what the customer complained about..."
                        className="w-full p-3 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm resize-none outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Resolution Applied</label>
                      <textarea required value={histResolution} onChange={e => setHistResolution(e.target.value)} rows={2}
                        placeholder="How was it resolved?"
                        className="w-full p-3 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm resize-none outline-none focus:border-[#6366F1] text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddingMemory(false)}
                      className="px-4 py-2 text-xs font-bold text-[#64748B] dark:text-slate-400 hover:text-[#1A1A2E] dark:hover:text-slate-200 rounded-lg border border-[#E8EAED] dark:border-slate-700 bg-white dark:bg-[#0B0F19] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5053E0] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                      {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Save Memory</>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Memory entries */}
            {!selectedCustomer.history || selectedCustomer.history.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#111726] rounded-2xl border border-dashed border-[#E8EAED] dark:border-[#1E293B]">
                <Brain className="w-12 h-12 text-[#E8EAED] dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-200 mb-1">No memory entries yet</h3>
                <p className="text-xs text-[#94A3B8] dark:text-slate-500 font-medium mb-4">
                  Memory entries are created automatically when tickets are resolved, or you can add them manually.
                </p>
                <button onClick={() => setIsAddingMemory(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white text-xs font-bold rounded-lg mx-auto">
                  <Plus className="w-3.5 h-3.5" /> Add First Memory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-[#6366F1]" />
                  <span className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">
                    {selectedCustomer.history.length} Hindsight Memory {selectedCustomer.history.length === 1 ? 'Entry' : 'Entries'}
                  </span>
                </div>
                {selectedCustomer.history.map((entry, i) => {
                  const sentiment = SENTIMENT_ICONS[entry.sentiment] || SENTIMENT_ICONS.neutral;
                  const priorityColor = PRIORITY_COLORS[entry.priority] || PRIORITY_COLORS.medium;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-[#111726] border border-[#E8EAED] dark:border-[#1E293B] rounded-xl p-5 group hover:border-[#6366F1]/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2.5">
                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${priorityColor}`}>
                              {entry.priority}
                            </span>
                            {entry.issue_category && (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-[#64748B] dark:text-slate-400 bg-[#F1F3F5] dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                <Tag className="w-2.5 h-2.5" /> {entry.issue_category}
                              </span>
                            )}
                            <span className="text-[10px] font-bold" title={entry.sentiment}>
                              {sentiment.icon}
                            </span>
                            {entry.repeat_issue_flag && (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-md uppercase">
                                ⟳ Repeat Issue
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[9px] text-[#94A3B8] dark:text-slate-500 font-medium ml-auto">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDate(entry.last_interaction_date)}
                            </span>
                          </div>

                          {/* Issue */}
                          <div>
                            <p className="text-[10px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase tracking-wide mb-1">Issue</p>
                            <p className="text-sm text-[#1A1A2E] dark:text-slate-200 font-medium leading-relaxed">{entry.previous_complaint}</p>
                          </div>

                          {/* Resolution */}
                          <div className="pl-3 border-l-2 border-emerald-200 dark:border-emerald-800/50">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Resolution</p>
                            <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">{entry.previous_resolution}</p>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteMemory(entry.id)}
                          disabled={deleting === entry.id}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                          title="Delete memory entry"
                        >
                          {deleting === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
