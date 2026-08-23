'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Mail, Sparkles, AlertCircle, X, ArrowRight, RefreshCw } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetEmail?: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  targetUserId,
  targetEmail,
}: EmailVerificationModalProps) {
  const { currentUser, verifyEmail, resendVerification, openEmailDrawer } = useAuth();

  const activeUser = currentUser;
  const uid = targetUserId || activeUser?.id;
  const userEmail = targetEmail || activeUser?.email;

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!code.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(code, uid);
      setIsLoading(false);
      setSuccessNotice('Account successfully verified! Verified badge activated.');
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Verification failed.');
    }
  };

  const handleResend = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setIsResending(true);
    try {
      const sent = await resendVerification(uid);
      setIsResending(false);
      setSuccessNotice(`New verification code #${sent.verificationCode} dispatched to ${userEmail}!`);
    } catch (err: unknown) {
      setIsResending(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend email.');
    }
  };

  const handleAutoFillCode = () => {
    if (activeUser?.verificationCode) {
      setCode(activeUser.verificationCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-orange-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-orange-950/50">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Mail className="w-7 h-7 text-orange-400 animate-bounce" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-100">
            Welcome Email Verification
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            An automated welcome message with your verification code was dispatched to{' '}
            <strong className="text-slate-200 break-all">{userEmail}</strong>.
          </p>

          {uid && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-orange-500/30 text-xs font-mono text-orange-300">
              <span>Your Unique 12-Digit UID:</span>
              <strong className="text-orange-400">{uid}</strong>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="verify-email-code">
                Enter 6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={() => openEmailDrawer()}
                className="text-[11px] text-orange-400 hover:text-orange-300 underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>View in Simulated Mailbox</span>
              </button>
            </div>
            <input
              id="verify-email-code"
              type="text"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 748291"
              className="w-full py-3 px-4 font-mono text-center text-lg tracking-widest bg-slate-950 border border-orange-500/40 rounded-xl text-orange-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-inner"
            />
          </div>

          {activeUser?.verificationCode && (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Current active code: <strong className="text-orange-400 font-mono">{activeUser.verificationCode}</strong></span>
              <button
                type="button"
                onClick={handleAutoFillCode}
                className="px-2 py-0.5 rounded bg-orange-950/50 hover:bg-orange-900/60 border border-orange-500/30 text-orange-300 font-medium cursor-pointer transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <button
            id="confirm-email-verify-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm Verification & Activate Badge</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Did not receive email?</span>
          <button
            id="resend-verification-email-btn"
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium hover:underline transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend Welcome Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
