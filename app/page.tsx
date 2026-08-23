'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';
import AuthContainer from '@/components/Auth/AuthContainer';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import EmailInboxDrawer from '@/components/EmailSimulator/EmailInboxDrawer';
import DatabaseModal from '@/components/DatabaseViewer/DatabaseModal';
import MfaChallengeModal from '@/components/Auth/MfaChallengeModal';
import { Flame, ShieldCheck, Sparkles, Mail, Lock, Database } from 'lucide-react';

function MainAppContent() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 p-2 flex items-center justify-center animate-pulse mb-3">
          <Flame className="w-7 h-7 text-orange-500 animate-spin" />
        </div>
        <p className="text-xs font-mono text-orange-400">Initializing Firestorm Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-orange-600/15 via-red-600/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-600/10 blur-[120px]" />
      </div>

      {/* Main App Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {currentUser ? (
          <UserDashboard />
        ) : (
          <AuthContainer />
        )}
      </main>

      {/* Persistent Modals & Simulated Drawer */}
      <EmailInboxDrawer />
      <DatabaseModal />
      <MfaChallengeModal />

      {/* Standard AI-Generated Disclaimer & System Footer */}
      <footer className="w-full border-t border-slate-850 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-mono text-slate-300">FIRESTORM SECURITY ARCHITECTURE</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Standard Disclaimer for AI-Generated Web Applications: This interface is generated for demonstration and prototyping of user identity management, unique 12-digit alphanumeric user ID generation, automated welcome email verification, password reset, and optional multi-factor authentication.
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            &copy; {new Date().getFullYear()} Firestorm Identity Systems &bull; All user data securely encrypted & verified locally in sandbox storage.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
