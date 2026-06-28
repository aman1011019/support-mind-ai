/**
 * SupportInput — Ticket submission form wired to real API
 */
import React, { useState, useEffect, useRef } from 'react';
import { CustomerData } from '../services/api';
import { Sparkles, Info, Zap } from 'lucide-react';

interface SupportInputProps {
  selectedCustomer: CustomerData;
  onSubmit: (data: {
    customerName: string;
    orderId: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complaintText: string;
  }) => void;
  isProcessing: boolean;
}

const PRIORITY_CONFIG = {
  low: { bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300', active: 'bg-slate-100 dark:bg-slate-700 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-200 font-bold' },
  medium: { bg: 'bg-white dark:bg-[#0B0F19] border-[#E8EAED] dark:border-[#1E293B] text-[#64748B] dark:text-slate-400', active: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 font-bold' },
  high: { bg: 'bg-white dark:bg-[#0B0F19] border-[#E8EAED] dark:border-[#1E293B] text-[#64748B] dark:text-slate-400', active: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-bold' },
  urgent: { bg: 'bg-white dark:bg-[#0B0F19] border-[#E8EAED] dark:border-[#1E293B] text-[#64748B] dark:text-slate-400', active: 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 font-bold' },
};

export default function SupportInput({ selectedCustomer, onSubmit, isProcessing }: SupportInputProps) {
  const [customerName, setCustomerName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState('Billing');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [complaintText, setComplaintText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with selected customer
  useEffect(() => {
    setCustomerName(selectedCustomer.name);
    setOrderId(selectedCustomer.order_id || '');

    const oid = selectedCustomer.order_id || '';
    if (oid.startsWith('ORD') || oid.startsWith('ord')) {
      setCategory('Shipping');
      setPriority('high');
      setComplaintText(`My order ${oid} hasn't arrived yet and it's past the expected delivery date. Our team is waiting on this for an important meeting tomorrow. Please help urgently.`);
    } else if (oid.startsWith('API') || oid.startsWith('api')) {
      setCategory('API Access');
      setPriority('medium');
      setComplaintText(`The API keeps returning 401 Unauthorized errors on our active integration. Our system cannot process requests. Ticket ID: ${oid}.`);
    } else {
      setCategory('Subscription');
      setPriority('low');
      setComplaintText(`I recently changed my subscription plan but I've lost access to features that should still be available. Can you review my account?`);
    }
  }, [selectedCustomer]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [complaintText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !customerName.trim() || isProcessing) return;
    onSubmit({ customerName, orderId, category, priority, complaintText });
  };

  const charCount = complaintText.length;
  const isEmpty = !customerName.trim() || !complaintText.trim();

  return (
    <div id="support-input-card" className="bg-white dark:bg-[#111726] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] shadow-sm overflow-hidden transition-colors duration-200">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-[#E8EAED] dark:border-[#1E293B] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-slate-100">Submit Support Ticket</h3>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-0.5">
            Customer: <span className="font-bold text-[#6366F1]">{selectedCustomer.name}</span>
            {' '}· <span className="font-mono">{selectedCustomer.plan}</span>
            {selectedCustomer.history?.length > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400"> · {selectedCustomer.history.length} memory entries</span>
            )}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-[#6366F1]/20">
          {selectedCustomer.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Row: Customer Name + Order ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Customer Name</label>
            <input
              id="input-customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Order / Ticket ID</label>
            <input
              id="input-order-id"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-90812"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Row: Category + Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Category</label>
            <select
              id="input-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm font-medium outline-none focus:border-[#6366F1] cursor-pointer text-[#1A1A2E] dark:text-slate-200 transition-all"
            >
              <option value="Billing">💳 Billing &amp; Invoice</option>
              <option value="Shipping">📦 Shipping &amp; Logistics</option>
              <option value="Subscription">⚡ Subscription Tier</option>
              <option value="API Access">🔑 Developer API &amp; Webhooks</option>
              <option value="Technical Bug">🐛 Platform Error / Bug</option>
              <option value="General">📋 General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">SLA Priority</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'medium', 'high', 'urgent'] as const).map((lvl) => {
                const cfg = PRIORITY_CONFIG[lvl];
                const isActive = priority === lvl;
                return (
                  <button
                    id={`priority-btn-${lvl}`}
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 text-[9px] font-bold uppercase tracking-wide rounded-lg border transition-all cursor-pointer ${isActive ? cfg.active : cfg.bg + ' hover:border-[#6366F1]/20'}`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Complaint textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Customer Complaint</label>
            <button
              type="button"
              onClick={() => {
                setComplaintText('URGENT: My order still has not arrived and we have an executive presentation in 2 hours. Our entire team is blocked and we need this resolved immediately!');
                setPriority('urgent');
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#6366F1] dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Load Sample
            </button>
          </div>
          <textarea
            id="input-complaint-textarea"
            ref={textareaRef}
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            required
            maxLength={500}
            placeholder="Describe the customer's issue in detail..."
            className="w-full p-4 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-lg text-sm resize-none outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 leading-relaxed min-h-[120px] placeholder:text-[#94A3B8]"
          />
          <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-medium mt-1.5">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" /> Hindsight Memory will be checked automatically
            </span>
            <span className={charCount > 450 ? 'text-rose-500 font-bold' : ''}>{charCount}/500</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E8EAED] dark:border-[#1E293B]">
          <div className="text-xs">
            <span className={`font-bold capitalize ${
              priority === 'urgent' ? 'text-rose-500' :
              priority === 'high' ? 'text-amber-500' :
              priority === 'medium' ? 'text-indigo-500' : 'text-slate-500'
            }`}>{priority}</span>
            <span className="text-[#94A3B8] dark:text-slate-500 font-medium"> priority · {category}</span>
          </div>
          <button
            id="resolve-ai-btn"
            type="submit"
            disabled={isEmpty || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] hover:bg-[#5053E0] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-[#6366F1]/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>Resolve with AI <Zap className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
