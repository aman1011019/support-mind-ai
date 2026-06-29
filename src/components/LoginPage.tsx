/**
 * SupportMind — Login Page
 * Real Google OAuth via Google Identity Services
 * Clean split-panel design with Intercom-level polish
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDarkMode } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
import { authApi, tokenStorage } from '../services/api';
import ProductLogo from './ProductLogo';
import {
  Brain, ShieldCheck, Sparkles, Sun, Moon, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const DEFAULT_GOOGLE_CLIENT_ID = '845724740843-58r6kahi10fmd3ckir7lp9qpc85brivc.apps.googleusercontent.com';
const rawGoogleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID).trim();
const GOOGLE_CLIENT_ID = rawGoogleClientId.includes('your_') ? DEFAULT_GOOGLE_CLIENT_ID : rawGoogleClientId;

export default function LoginPage() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useDarkMode();
  const { loginWithGoogle, loginWithEmail, signupWithEmail, isLoading, error, isAuthenticated } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // Load Google Identity Services script and initialize when a client ID is configured.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      const buttonWidth = Math.min(
        400,
        Math.max(240, Math.floor(googleBtnRef.current.getBoundingClientRect().width || 336))
      );

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        width: buttonWidth,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    };

    // If script already loaded
    if (window.google) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [isDark]);

  const handleGoogleCallback = async (response: { credential: string }) => {
    setLoginError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleUnavailable = () => {
    setLoginError('Google sign-in is visible, but it needs VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID configured before it can authenticate users.');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsFormSubmitting(true);

    if (isSignup) {
      if (!name.trim()) {
        setLoginError('Please enter your name.');
        setIsFormSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setLoginError('Password must be at least 6 characters.');
        setIsFormSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setLoginError('Passwords do not match.');
        setIsFormSubmitting(false);
        return;
      }
      try {
        await signupWithEmail(name, email, password);
        navigate('/dashboard');
      } catch (err: any) {
        setLoginError(err.message || 'Registration failed. Please check inputs.');
      } finally {
        setIsFormSubmitting(false);
      }
    } else {
      try {
        await loginWithEmail(email, password);
        navigate('/dashboard');
      } catch (err: any) {
        setLoginError(err.message || 'Invalid email or password.');
      } finally {
        setIsFormSubmitting(false);
      }
    }
  };

  // Dev-mode bypass when no Google credentials configured
  const handleDevLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      const data = await authApi.devLogin();
      tokenStorage.set(data.access_token);
      window.location.reload();
    } catch (err: any) {
      setLoginError(err.message || 'Configure GOOGLE_CLIENT_ID in .env to enable Google sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div id="login-root" className="min-h-screen bg-white dark:bg-[#090D16] flex relative overflow-hidden font-sans transition-colors duration-200">

      {/* ── LEFT PANEL: Brand & Memory Showcase ── */}
      <div id="branding-panel" className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#0F1629] via-[#1A1A2E] to-[#0F1629] text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#10B981]/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#6366F1]/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10 cursor-pointer" onClick={() => navigate('/')}>
          <ProductLogo variant="dark" markClassName="w-10 h-10" />
        </div>

        {/* Center content */}
        <div className="z-10 flex flex-col gap-8 my-auto">
          {/* Live Memory Panel */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Hindsight Memory Active</span>
              </div>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">LIVE</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Sarah Jenkins', plan: 'Enterprise', note: 'Payment delay recalled → Escalated to direct courier. VIP keynote protected.' },
                { name: 'David Chen', plan: 'Growth', note: 'API staging/prod mismatch identified → Token regenerated autonomously.' },
                { name: 'Elena Rostova', plan: 'Starter', note: 'Plan downgrade context retained → Retention offer auto-applied.' },
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="p-3.5 bg-white/4 border border-white/8 rounded-xl hover:bg-white/8 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-100">{item.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                      item.plan === 'Enterprise' ? 'bg-[#6366F1]/20 text-indigo-300 border border-indigo-500/30' :
                      item.plan === 'Growth' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>{item.plan}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.note}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 text-[11px] font-semibold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Context fully preserved across all sessions & devices
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Cost Savings', value: '76%', icon: Zap, color: 'text-emerald-400' },
              { label: 'Resolution', value: '< 5s', icon: Brain, color: 'text-indigo-400' },
              { label: 'CSAT Score', value: '98.4%', icon: CheckCircle2, color: 'text-amber-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
                <p className={`text-lg font-black font-mono ${color}`}>{value}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-normal text-white mb-2">Support powered by memory.</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Join enterprise teams using Hindsight Memory and CascadeFlow to deliver flawless, personalized support.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs font-medium text-slate-600">
          Secure TLS • SOC2 Type II • HIPAA Compliant
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth ── */}
      <div id="auth-panel" className="w-full lg:w-[48%] flex items-center justify-center p-6 bg-[#F8F9FA] dark:bg-[#090D16] relative transition-colors duration-200">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl border border-[#E8EAED] dark:border-slate-800 bg-white dark:bg-[#111726] text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] hover:border-[#6366F1]/30 transition-all cursor-pointer shadow-sm"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex lg:hidden items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <ProductLogo markClassName="w-8 h-8" wordmarkClassName="text-lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[400px] flex flex-col gap-8"
        >
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <ProductLogo
              showWordmark={false}
              markClassName="w-16 h-16 rounded-2xl shadow-lg shadow-[#6366F1]/20"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-slate-100 tracking-normal">
                {isSignup ? 'Create your Account' : 'Sign in to SupportMind'}
              </h1>
              <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium mt-1">
                AI-powered support with Hindsight Memory
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-[#E8EAED] dark:border-[#1E293B] p-8 shadow-lg dark:shadow-none">
            
            {/* Tabs for switching between Sign In and Sign Up */}
            <div className="flex border-b border-[#E8EAED] dark:border-[#1E293B] mb-6">
              <button
                type="button"
                onClick={() => { setIsSignup(false); setLoginError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  !isSignup
                    ? 'border-[#6366F1] text-[#6366F1] dark:text-indigo-400'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignup(true); setLoginError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  isSignup
                    ? 'border-[#6366F1] text-[#6366F1] dark:text-indigo-400'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {(loginError || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-sm text-rose-700 dark:text-rose-400 font-medium"
                >
                  {loginError || error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isSignup && (
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isFormSubmitting || isGoogleLoading || isLoading}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-xl text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isFormSubmitting || isGoogleLoading || isLoading}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-xl text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isFormSubmitting || isGoogleLoading || isLoading}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-xl text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
                />
              </div>
              {isSignup && (
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isFormSubmitting || isGoogleLoading || isLoading}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] rounded-xl text-sm font-medium outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#94A3B8]"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isFormSubmitting || isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#6366F1] hover:bg-[#5053E0] disabled:bg-[#94A3B8] text-white rounded-xl text-sm font-bold shadow-md shadow-[#6366F1]/15 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isFormSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSignup ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#E8EAED] dark:bg-[#1E293B]" />
              <span className="text-[10px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#E8EAED] dark:bg-[#1E293B]" />
            </div>

            {/* Google Sign-In Button */}
            <div className="flex flex-col gap-3">
              {GOOGLE_CLIENT_ID ? (
                <>
                  {isGoogleLoading ? (
                    <div className="w-full h-[44px] flex items-center justify-center bg-white dark:bg-[#1E293B] border border-[#E8EAED] dark:border-slate-700 rounded-xl">
                      <div className="w-5 h-5 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2.5 text-sm font-medium text-[#64748B] dark:text-slate-400">Signing in...</span>
                    </div>
                  ) : (
                    <div className="w-full min-h-[52px] rounded-xl border border-[#E8EAED] dark:border-[#1E293B] bg-white dark:bg-[#0B0F19] shadow-sm flex items-center justify-center overflow-hidden px-2">
                      <div
                        ref={googleBtnRef}
                        id="google-signin-btn"
                        className="w-full min-h-[44px] flex items-center justify-center"
                      />
                    </div>
                  )}
                </>
              ) : (
                <button
                  id="google-signin-unconfigured-btn"
                  type="button"
                  onClick={handleGoogleUnavailable}
                  disabled={isGoogleLoading || isFormSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#0B0F19] border border-[#E8EAED] dark:border-[#1E293B] hover:border-[#6366F1]/40 hover:bg-[#F8F9FA] dark:hover:bg-slate-900 rounded-xl text-sm font-bold text-[#1A1A2E] dark:text-slate-200 transition-all cursor-pointer shadow-sm"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-[#E8EAED] text-[#4285F4] flex items-center justify-center text-xs font-black">
                    G
                  </span>
                  Continue with Google
                </button>
              )}

              {!GOOGLE_CLIENT_ID && (
                <button
                  id="dev-login-btn"
                  type="button"
                  onClick={handleDevLogin}
                  disabled={isGoogleLoading || isFormSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#1E293B] border-2 border-dashed border-[#6366F1]/40 hover:border-[#6366F1] hover:bg-[#EEF2FF]/30 dark:hover:bg-indigo-950/20 rounded-xl text-sm font-bold text-[#6366F1] dark:text-indigo-400 transition-all cursor-pointer group"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Continue with Demo Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-[#94A3B8] dark:text-slate-500 font-medium mt-5 leading-relaxed">
              {GOOGLE_CLIENT_ID
                ? 'By signing in, you agree to our Terms of Service and Privacy Policy. Your data is encrypted end-to-end.'
                : 'Configure VITE_GOOGLE_CLIENT_ID for live Google OAuth. Demo mode stays available locally.'
              }
            </p>
          </div>

          {/* Bottom trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['SOC2 Type II', 'HIPAA', 'PCI DSS', 'GDPR'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] dark:text-slate-500 uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3" /> {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
