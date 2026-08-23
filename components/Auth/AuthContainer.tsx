'use client';

import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';
import ForgotPasswordModal from './ForgotPasswordModal';
import { ShieldCheck, Mail, KeyRound, Smartphone, Sparkles, Flame, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Left Feature Showcase Banner (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Next-Generation Identity Layer</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Secure User Data & Automated Verification
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Firestorm delivers an automated authentication portal with unique 12-digit alphanumeric user ID generation, instant welcome verification email dispatch, password reset, and configurable MFA security.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Unique 12-Digit Alphanumeric UID</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every user is assigned a unique alphanumeric ID (e.g. <span className="font-mono text-orange-300">FST9-X2M4-R8K1</span>) stored in the database.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Automated Welcome Email & Verified Badge</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instant welcome verification email sent with a 6-digit confirmation code, unlocking the verified dashboard status badge.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Optional Multi-Factor Authentication (MFA)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toggle 2FA protection in your account settings with authenticator TOTP codes and emergency backup recovery keys.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Secure Password Reset</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Self-service password recovery flow with automated email reset authorization tokens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card (7 cols) */}
      <div className="lg:col-span-7">
        <div className="relative bg-slate-900/95 border border-orange-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-orange-950/30 overflow-hidden backdrop-blur-md">
          {/* Subtle top ember border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500" />

          {/* Form Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
            <button
              id="tab-signup-btn"
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              id="tab-signin-btn"
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          {activeTab === 'signup' ? (
            <SignUpForm onSwitchToSignIn={() => setActiveTab('signin')} />
          ) : (
            <SignInForm
              onSwitchToSignUp={() => setActiveTab('signup')}
              onForgotPassword={() => setIsForgotPasswordOpen(true)}
            />
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
