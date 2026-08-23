'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Lock, Key, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function MfaChallengeModal() {
  const { pendingMfaUserId, submitMfaCode, cancelMfaLogin, usersList } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!pendingMfaUserId) return null;

  const targetUser = usersList.find(u => u.id === pendingMfaUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!code.trim()) {
      setErrorMessage('Please enter your 6-digit MFA code or emergency backup code.');
      return;
    }

    setIsLoading(true);
    try {
      await submitMfaCode(code);
      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Invalid MFA code.');
    }
  };

  const handleUseSimulatedCode = () => {
    setCode('123456');
    setErrorMessage('');
  };

  const handleUseBackupCode = () => {
    if (targetUser?.backupCodes && targetUser.backupCodes.length > 0) {
      setCode(targetUser.backupCodes[0]);
    } else {
      setCode('FST-9021');
    }
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-orange-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-orange-950/50">
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-orange-400 animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-100">
            Multi-Factor Authentication
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Two-Step Verification is active for <strong className="text-slate-200">{targetUser?.email || 'this account'}</strong>.
          </p>
          <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[11px] font-mono text-orange-300">
            User ID: {targetUser?.id}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center" htmlFor="mfa-auth-code">
              Enter 6-Digit Authenticator Code or Backup Code
            </label>
            <div className="relative">
              <input
                id="mfa-auth-code"
                type="text"
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. 123456 or FST-9021"
                className="w-full py-3 px-4 text-center font-mono text-lg tracking-widest bg-slate-950 border border-orange-500/40 rounded-xl text-orange-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Quick Simulation Aids for Testing */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Testing & Verification Shortcuts:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseSimulatedCode}
                className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer text-center"
              >
                Insert TOTP (123456)
              </button>
              <button
                type="button"
                onClick={handleUseBackupCode}
                className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer text-center"
              >
                Use Backup Code
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              id="submit-mfa-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Identity & Access Portal</span>
                </>
              )}
            </button>

            <button
              id="cancel-mfa-btn"
              type="button"
              onClick={cancelMfaLogin}
              className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
