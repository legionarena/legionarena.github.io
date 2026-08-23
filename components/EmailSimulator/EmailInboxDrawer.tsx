'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { EmailMessage } from '@/lib/types';
import {
  Mail,
  X,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Inbox,
  Clock
} from 'lucide-react';

export default function EmailInboxDrawer() {
  const {
    emailsList,
    isEmailDrawerOpen,
    closeEmailDrawer,
    selectedEmailForViewing,
    openEmailDrawer,
    markEmailRead,
    verifyEmail,
    isMounted
  } = useAuth();

  const [selectedIdOverride, setSelectedIdOverride] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  if (!isMounted || !isEmailDrawerOpen) return null;

  const currentEmail =
    (selectedIdOverride ? emailsList.find((e) => e.id === selectedIdOverride) : null) ||
    selectedEmailForViewing ||
    (emailsList.length > 0 ? emailsList[0] : null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAutoVerify = async (code: string, userId: string) => {
    try {
      await verifyEmail(code, userId);
      setVerifySuccess('Email verified successfully!');
      setTimeout(() => setVerifySuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      alert(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Firestorm Email Simulator"
        className="w-full max-w-2xl h-full bg-[#0d0d0d] border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#ff3c00]/10 text-[#ff3c00]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white font-mono uppercase text-sm">
                Firestorm Email Simulator
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Inspect simulated transaction emails, MFA codes &amp; tokens
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEmailDrawer}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Success Toast */}
        {verifySuccess && (
          <div className="bg-emerald-950 border-b border-emerald-500/40 text-emerald-400 p-2 text-xs font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{verifySuccess}</span>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 overflow-hidden">
          {/* Inbox List Column */}
          <div className="md:col-span-2 border-r border-zinc-800/80 bg-[#0a0a0a] flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-[#ff3c00]" />
                <span>Inbox ({emailsList.length})</span>
              </span>
            </div>

            {emailsList.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-zinc-500">
                No simulated emails generated yet. Register or request verification to trigger emails.
              </div>
            ) : (
              <div className="divide-y divide-zinc-850">
                {emailsList.map((email) => {
                  const isSelected = currentEmail?.id === email.id;
                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => {
                        setSelectedIdOverride(email.id);
                        markEmailRead(email.id);
                      }}
                      className={`w-full text-left p-3 transition-colors ${
                        isSelected ? 'bg-[#181818] border-l-2 border-[#ff3c00]' : 'hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="truncate max-w-[120px] font-bold text-zinc-300">
                          {email.recipientName || email.to}
                        </span>
                        {!email.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#ff3c00]" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-zinc-100 truncate mt-0.5">
                        {email.subject}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Preview Column */}
          <div className="md:col-span-3 flex flex-col bg-[#0f0f0f] overflow-y-auto p-4">
            {currentEmail ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Meta Header */}
                <div className="p-3 rounded border border-zinc-800 bg-[#141414] space-y-1.5">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="text-zinc-500">To: </span>
                      <span className="text-zinc-200 font-bold">{currentEmail.recipientName}</span>{' '}
                      <span className="text-zinc-400">&lt;{currentEmail.to}&gt;</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(currentEmail.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-zinc-500">Subject: </span>
                    <span className="text-[#ff3c00] font-bold">{currentEmail.subject}</span>
                  </div>
                </div>

                {/* Quick Action Banner for Verification / Reset */}
                {currentEmail.verificationCode && (
                  <div className="p-3 rounded border border-amber-500/30 bg-amber-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>6-Digit Verification Code</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentEmail.verificationCode!)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px]"
                      >
                        {copiedCode === currentEmail.verificationCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-2xl font-black tracking-widest text-white font-mono">
                        {currentEmail.verificationCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoVerify(currentEmail.verificationCode!, currentEmail.userId)}
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Auto-Verify Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Body */}
                <div className="p-4 rounded border border-zinc-800 bg-[#121212] whitespace-pre-wrap leading-relaxed text-zinc-300 font-sans text-xs">
                  {currentEmail.content}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
                <Mail className="w-10 h-10 mb-2 opacity-30 text-[#ff3c00]" />
                <span>Select an email from the inbox list to read</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#0a0a0a] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Sandbox Mode Active</span>
          <button
            type="button"
            onClick={closeEmailDrawer}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
