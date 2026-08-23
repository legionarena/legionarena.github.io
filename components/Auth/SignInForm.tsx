'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export default function SignInForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}: SignInFormProps) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn(email, password);
      setIsLoading(false);
      if (res.requiresMfa) {
        // MFA challenge is automatically active in context
        return;
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.vanguard@firestorm.io');
    setPassword('Firestorm@123');
    setErrorMessage('');
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5 text-orange-400" />
          Sign In to Firestorm
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your verified identity profile and security dashboard.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-shake">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Demo Fill Helper */}
      <div className="mb-4 p-2.5 rounded-lg bg-slate-900/90 border border-orange-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Test Account (MFA Enabled):</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          Fill Demo User
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="signin-email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.vanguard@firestorm.io"
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-300" htmlFor="signin-password">
              Password
            </label>
            <button
              id="forgot-password-btn"
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] text-orange-400 hover:text-orange-300 font-medium hover:underline transition-colors cursor-pointer flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>Forgot Password?</span>
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="signin-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          Do not have an account yet?{' '}
          <button
            id="switch-to-signup-btn"
            type="button"
            onClick={onSwitchToSignUp}
            className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
