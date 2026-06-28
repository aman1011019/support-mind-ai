/**
 * Sidebar — Customer profiles + navigation with real API data
 */
import React from 'react';
import { CustomerData, DashboardAnalytics } from '../services/api';
import { useDarkMode } from '../utils/theme';
import ProductLogo from './ProductLogo';
import {
  Brain, LogOut, ChevronRight, Database, Zap, Sun, Moon, User
} from 'lucide-react';

interface SidebarProps {
  selectedCustomer: CustomerData | null;
  onSelectCustomer: (c: CustomerData) => void;
  onLogout: () => void;
  user: any;
  activeTab: 'agent' | 'memory';
  onSelectTab: (t: 'agent' | 'memory') => void;
  customers: CustomerData[];
  loadingCustomers?: boolean;
  analytics?: DashboardAnalytics | null;
}

const PLAN_BADGE: Record<string, string> = {
  Enterprise: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
  Growth:     'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
  Starter:    'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50',
};

export default function Sidebar({
  selectedCustomer, onSelectCustomer, onLogout, user,
  activeTab, onSelectTab, customers, loadingCustomers, analytics
}: SidebarProps) {
  const { isDark, toggle: toggleTheme } = useDarkMode();

  return (
    <aside id="dashboard-sidebar" className="w-[260px] bg-white dark:bg-[#0B0F19] border-r border-[#E8EAED] dark:border-[#1E293B] h-full flex flex-col overflow-y-auto shrink-0 transition-colors duration-200">

      {/* Brand */}
      <div className="p-5 flex items-center gap-2.5 border-b border-[#E8EAED] dark:border-[#1E293B]">
        <ProductLogo markClassName="w-8 h-8" wordmarkClassName="text-base" />
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Navigation */}
        <nav className="p-3 space-y-0.5">
          <button
            onClick={() => onSelectTab('agent')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer text-left ${
              activeTab === 'agent'
                ? 'bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F8F9FA] dark:hover:bg-slate-800/50 hover:text-[#1A1A2E] dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Active Agent</span>
            {analytics && analytics.pending_cases > 0 && (
              <span className="ml-auto text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {analytics.pending_cases}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('memory')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer text-left ${
              activeTab === 'memory'
                ? 'bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F8F9FA] dark:hover:bg-slate-800/50 hover:text-[#1A1A2E] dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>Customer Memory</span>
            {analytics && (
              <span className="ml-auto text-[9px] font-mono text-[#94A3B8] dark:text-slate-500">{analytics.memory_entries}</span>
            )}
          </button>
        </nav>

        {/* Customer Profiles */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase tracking-wider">Customer Profiles</span>
            <span className="text-[9px] font-bold text-[#6366F1] dark:text-indigo-400 bg-[#EEF2FF] dark:bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
              {customers.length} loaded
            </span>
          </div>

          {loadingCustomers ? (
            <div className="space-y-2 px-1">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#F1F3F5] dark:bg-slate-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-[#F1F3F5] dark:bg-slate-800 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-[#F1F3F5] dark:bg-slate-800 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-6 px-2">
              <User className="w-8 h-8 text-[#E8EAED] dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-[#94A3B8] dark:text-slate-500 font-medium">No customers yet.<br />Switch to Memory tab to add.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {customers.map((cust) => {
                const isSelected = cust.id === selectedCustomer?.id;
                const initials = cust.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                return (
                  <button
                    id={`cust-select-${cust.id}`}
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-[#EEF2FF]/60 dark:bg-indigo-950/20 border-[#6366F1]/15 dark:border-indigo-500/20'
                        : 'bg-transparent border-transparent hover:bg-[#F8F9FA] dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {cust.avatar_url ? (
                        <img
                          src={cust.avatar_url}
                          alt={cust.name}
                          className={`w-7 h-7 rounded-full border object-cover ${isSelected ? 'border-[#6366F1]/40 ring-2 ring-[#EEF2FF] dark:ring-indigo-950' : 'border-[#E8EAED] dark:border-slate-700'}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-[#6366F1] text-white' : 'bg-[#EEF2FF] dark:bg-indigo-950/40 text-[#6366F1] dark:text-indigo-400'
                        }`}>{initials}</div>
                      )}
                      {isSelected && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-[#0B0F19]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-[#1A1A2E] dark:text-slate-100' : 'text-[#64748B] dark:text-slate-400 group-hover:text-[#1A1A2E] dark:group-hover:text-slate-200'}`}>
                        {cust.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[8px] font-bold px-1.5 py-px rounded border ${PLAN_BADGE[cust.plan] || PLAN_BADGE.Starter}`}>
                          {cust.plan}
                        </span>
                        <span className="text-[8px] text-[#94A3B8] dark:text-slate-500 font-mono">
                          {cust.history?.length || 0} memories
                        </span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-3 h-3 text-[#6366F1] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected customer memory preview */}
        {selectedCustomer && selectedCustomer.history && selectedCustomer.history.length > 0 && (
          <div className="mx-3 mb-3 p-3.5 bg-[#F8F9FA] dark:bg-slate-900/40 border border-[#E8EAED] dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Brain className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#6366F1] dark:text-indigo-400">Hindsight Memory</span>
            </div>
            <div className="space-y-2">
              {selectedCustomer.history.slice(0, 2).map((entry) => (
                <div key={entry.id} className="text-[10px] text-[#64748B] dark:text-slate-400 leading-relaxed border-l-2 border-[#6366F1]/30 pl-2">
                  <span className="font-bold text-[#1A1A2E] dark:text-slate-300">{entry.issue_category}</span>
                  {' '}· {entry.previous_complaint?.slice(0, 50)}...
                </div>
              ))}
              {selectedCustomer.history.length > 2 && (
                <p className="text-[9px] text-[#94A3B8] dark:text-slate-500 font-medium">+{selectedCustomer.history.length - 2} more entries</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Tech info + User */}
      <div className="mt-auto border-t border-[#E8EAED] dark:border-[#1E293B]">
        {/* Infra badge */}
        <div className="px-5 py-3 bg-gradient-to-r from-[#F8F9FA] to-white dark:from-[#0B0F19] dark:to-[#0B0F19]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[9px] uppercase font-bold text-[#64748B] dark:text-slate-500 tracking-wider">CascadeFlow™ Active</span>
          </div>
        </div>

        {/* User profile */}
        <div className="px-4 py-3 flex items-center justify-between gap-2 border-t border-[#E8EAED] dark:border-[#1E293B]">
          <div className="flex items-center gap-2 min-w-0">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-[#6366F1]/20 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0,2) : 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1A1A2E] dark:text-slate-200 truncate leading-tight">{user?.name || 'Agent'}</p>
              <p className="text-[9px] font-mono text-[#94A3B8] dark:text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] hover:bg-[#EEF2FF] dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-1.5 rounded-md text-[#64748B] dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
