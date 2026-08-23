'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { EmailMessage } from '@/lib/types';
import { Mail, ShieldCheck, KeyRound, AlertTriangle, X, CheckCircle2, ArrowRight, Trash2, Clock, Sparkles } from 'lucide-react';

export default function EmailInboxDrawer() {
  const { 
    emailsList, 
    isEmailDrawerOpen, 
    closeEmailDrawer, 
    selectedEmailForViewing, 
    verifyEmail, 
    markEmailRead, 
    currentUser 
  } = useAuth();

  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string>('');

  if (!isEmailDrawerOpen) return null;

  // Selected email to preview
  const currentEmail = 
    emailsList.find(e => e.id === activeEmailId) || 
    selectedEmailForViewing || 
    (emailsList.length > 0 ? emailsList[0] : null);

  const handleSelectEmail = (email: EmailMessage) => {
    setActiveEmailId(email.id);
    markEmailRead(email.id);
  };

  const handleDirect1ClickVerify = async (email: EmailMessage) => {
    if (!email.verificationCode && !email.token) return;
    const code = email.verificationCode || email.token || '';
    try {
      await verifyEmail(code, email.userId);
      setVerificationFeedback(`Successfully verified ${email.to}! Badge updated.`);
      setTimeout(() => setVerificationFeedback(''), 3500);
    } catch (err: unknown) {
      setVerificationFeedback(err instanceof Error ? err.message : 'Verification failed.');
      setTimeout(() => setVerificationFeedback(''), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn flex justify-end">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-orange-500/40 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Automated Mailbox Simulator
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-500/30">
                  @firestorm-mail
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Inspect simulated welcome verification and security alerts dispatched by Firestorm.
              </p>
            </div>
          </div>

          <button
            id="close-email-drawer-btn"
            type="button"
            onClick={closeEmailDrawer}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification feedback banner */}
        {verificationFeedback && (
          <div className="p-3 bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{verificationFeedback}</span>
          </div>
        )}

        {/* Drawer Content: Split List & Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email List (Left Column) */}
          <div className="w-full md:w-5/12 border-r border-slate-800 bg-slate-950/60 overflow-y-auto">
            {emailsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
                <p>No automated emails dispatched yet.</p>
                <p className="text-[11px]">Create an account or request password reset to generate emails.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-850">
                {emailsList.map((email) => {
                  const isSelected = currentEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => handleSelectEmail(email)}
                      className={`w-full text-left p-3 transition-colors cursor-pointer block ${
                        isSelected
                          ? 'bg-orange-950/40 border-l-2 border-orange-500'
                          : 'hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-300 truncate max-w-[130px]">
                          {email.to}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 truncate mb-0.5">
                        {email.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {email.content.replace(/\n/g, ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Body Viewer (Right Column) */}
          <div className="w-full md:w-7/12 flex-1 p-5 overflow-y-auto bg-slate-900 flex flex-col justify-between">
            {currentEmail ? (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">To:</span>
                    <strong className="text-slate-200">{currentEmail.recipientName} &lt;{currentEmail.to}&gt;</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">From:</span>
                    <span className="text-orange-400 font-medium">Firestorm Automated Identity Service</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subject:</span>
                    <strong className="text-slate-100">{currentEmail.subject}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>Target User ID: {currentEmail.userId}</span>
                    <span>{new Date(currentEmail.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Email Body Template Card */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-orange-500/30 text-xs space-y-4 shadow-inner">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="font-bold tracking-wider text-slate-200 uppercase font-mono">
                      FIRESTORM IDENTITY DISPATCH
                    </span>
                  </div>

                  <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentEmail.content}
                  </div>

                  {/* 6-Digit Code Highlight */}
                  {currentEmail.verificationCode && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/50 via-slate-900 to-red-950/50 border border-orange-500/40 text-center space-y-2">
                      <div className="text-[11px] text-orange-300 font-semibold uppercase tracking-wider">
                        Your Official 6-Digit Code:
                      </div>
                      <div className="text-2xl font-black font-mono tracking-widest text-orange-400 py-1 bg-slate-950 rounded-lg border border-orange-500/30 inline-block px-6 shadow-md">
                        {currentEmail.verificationCode}
                      </div>
                    </div>
                  )}

                  {/* Direct 1-Click Verification CTA if welcome/verification email */}
                  {currentEmail.type === 'welcome_verification' && (
                    <div className="pt-2">
                      <button
                        id="email-one-click-verify-btn"
                        type="button"
                        onClick={() => handleDirect1ClickVerify(currentEmail)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify My Account (1-Click)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-[10px] text-slate-500 text-center mt-1.5">
                        Clicking this button simulates clicking the verification link inside the email.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-500">
                Select an email from the left sidebar to preview message contents.
              </div>
            )}

            <div className="pt-4 mt-auto border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                Firestorm Automated Email Dispatch Engine &bull; Zero External Spam
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
