'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Flame, Mail, Database, LogOut, ShieldCheck, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { 
    currentUser, 
    signOut, 
    unreadEmailCount, 
    openEmailDrawer, 
    setDbModalOpen, 
    usersList 
  } = useAuth();

  return (
    <header className="w-full border-b border-orange-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Animated Brand Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-orange-600 via-red-600 to-amber-500 p-0.5 shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
            {/* Ambient flame glow */}
            <span className="absolute -inset-1 rounded-xl bg-orange-500/20 blur-sm pointer-events-none -z-10" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase animate-fire-title select-none font-mono">
                FIRESTORM
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Identity Portal &bull; Automated Verification &bull; Multi-Factor Security
            </p>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center flex-wrap justify-center gap-2.5">
          {/* Simulated Email Inbox Drawer Trigger */}
          <button
            id="open-simulated-inbox-btn"
            type="button"
            onClick={() => openEmailDrawer()}
            className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 text-xs font-medium transition-all hover:bg-slate-850 hover:shadow-md cursor-pointer"
            title="Open Automated Email Simulator Inbox"
          >
            <Mail className="w-4 h-4 text-orange-400" />
            <span>Simulated Mailbox</span>
            {unreadEmailCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-full animate-bounce shadow-sm">
                {unreadEmailCount}
              </span>
            )}
          </button>

          {/* Database Inspector Trigger */}
          <button
            id="open-database-inspector-btn"
            type="button"
            onClick={() => setDbModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 text-xs font-medium transition-all hover:bg-slate-850 cursor-pointer"
            title="Inspect Stored Database Records"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Database ({usersList.length})</span>
          </button>

          {/* User Session status */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[10px] font-mono text-orange-400">
                  {currentUser.id}
                </span>
              </div>

              {currentUser.isVerified ? (
                <span title="Verified Account" className="p-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              ) : (
                <span title="Unverified Email" className="p-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              )}

              <button
                id="header-signout-btn"
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-medium transition-colors cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-xs text-slate-400 px-2 py-1 rounded bg-slate-900/50 border border-slate-800">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Guest Session</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Prototype & Security Disclaimer Banner */}
      <div className="w-full bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-red-950/40 border-t border-orange-500/10 px-4 py-1.5 text-center">
        <p className="text-[11px] text-orange-300/80 flex items-center justify-center gap-1.5 font-sans">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> This is a secure prototype portal with automated 12-digit UID generation, live email dispatch simulation, password reset, and configurable MFA.
          </span>
        </p>
      </div>
    </header>
  );
}
