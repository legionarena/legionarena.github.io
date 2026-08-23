'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import EmailInboxDrawer from '@/components/EmailSimulator/EmailInboxDrawer';
import DatabaseModal from '@/components/DatabaseViewer/DatabaseModal';
import { useAuth } from '@/lib/AuthContext';
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Key,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Flame,
  KeyRound
} from 'lucide-react';

export default function MemberPage() {
  const {
    currentUser,
    signIn,
    signOut,
    submitMfaCode,
    cancelMfaLogin,
    pendingMfaUserId,
    verifyEmail,
    resendVerification,
    toggleMfa,
    openEmailDrawer,
    isMounted
  } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isMounted) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (res.requiresMfa) {
        setLoginError(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setLoginError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await submitMfaCode(mfaCode);
      setMfaCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'MFA Verification failed';
      setLoginError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyStatus(null);
    try {
      await verifyEmail(verifyCode);
      setVerifyStatus('Email successfully verified!');
      setVerifyCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setVerifyStatus(msg);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      setVerifyStatus('New verification email sent! Check simulator inbox.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Resend failed';
      setVerifyStatus(msg);
    }
  };

  const handleCopyUid = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.id);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 flex flex-col selection:bg-[#ff3c00] selection:text-black">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff3c00] uppercase tracking-wider">
              <UserIcon className="w-4 h-4" />
              <span>Identity &amp; Access Management</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-mono">
              Member Portal
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Authenticate, verify 12-digit UID identities, and configure MFA credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="px-3.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors"
            >
              Sign Up New User &rarr;
            </Link>
          </div>
        </div>

        {/* Not Logged In / Login View */}
        {!currentUser ? (
          <div className="max-w-md mx-auto p-6 rounded-lg border border-zinc-800 bg-[#0f0f0f] shadow-2xl space-y-6">
            {!pendingMfaUserId ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#ff3c00]/10 text-[#ff3c00] flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold font-mono uppercase text-white">Member Sign In</h2>
                  <p className="text-xs text-zinc-400 font-mono">Access your verified credentials</p>
                </div>

                {loginError && (
                  <div className="p-3 rounded bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-mono">
                    {loginError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-400">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded bg-[#ff3c00] hover:bg-[#ff5500] text-black font-black text-xs uppercase tracking-wider font-mono transition-colors shadow-lg shadow-[#ff3c00]/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In To Account'}
                </button>

                <div className="text-center pt-2 text-xs font-mono text-zinc-500">
                  <span>Don&apos;t have an account? </span>
                  <Link href="/signup" className="text-[#ff3c00] hover:underline font-bold">
                    Register here
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-blue-950/60 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/40">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold font-mono uppercase text-white">MFA Authentication</h2>
                  <p className="text-xs text-zinc-400 font-mono">Enter 6-digit authenticator or backup code</p>
                </div>

                {loginError && (
                  <div className="p-3 rounded bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-mono">
                    {loginError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-400">6-Digit Code / Backup Token</label>
                  <input
                    type="text"
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456 or FST-XXXX"
                    className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-center tracking-widest text-lg font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelMfaLogin}
                    className="flex-1 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Logged In Member Profile */
          <div className="space-y-6">
            {/* Top Identity Card */}
            <div className="p-6 rounded-lg border border-zinc-800 bg-[#0e0e0e] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white font-mono">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    currentUser.isVerified ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentUser.isVerified ? 'Verified Profile' : 'Unverified'}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  <span>Email: </span><span className="text-zinc-200">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-500">12-Digit UID:</span>
                  <span className="text-[#ff3c00] font-bold tracking-wider">{currentUser.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                    title="Copy UID"
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 py-2 rounded bg-zinc-900 hover:bg-red-950 hover:text-red-400 border border-zinc-800 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Email Verification Section if unverified */}
            {!currentUser.isVerified && (
              <div className="p-6 rounded-lg border border-amber-500/30 bg-amber-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Email Verification Required</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEmailDrawer()}
                    className="text-xs font-mono text-[#ff3c00] hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Email Inbox Simulator</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300 font-mono">
                  Enter the 6-digit confirmation code sent to <code className="text-amber-300">{currentUser.email}</code>, or inspect it in the simulated outbox.
                </p>

                {verifyStatus && (
                  <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200">
                    {verifyStatus}
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-[#141414] border border-zinc-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-black text-xs font-mono uppercase"
                  >
                    Confirm Code
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300"
                  >
                    Resend
                  </button>
                </form>
              </div>
            )}

            {/* Security & Multi-Factor Authentication */}
            <div className="p-6 rounded-lg border border-zinc-800 bg-[#0e0e0e] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                  <Key className="w-5 h-5 text-blue-400" />
                  <span>Two-Factor Authentication (MFA)</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMfa(!currentUser.mfaEnabled)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-colors ${
                    currentUser.mfaEnabled
                      ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {currentUser.mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              <p className="text-xs text-zinc-400 font-mono">
                Status: <span className="font-bold text-zinc-200">{currentUser.mfaEnabled ? 'ACTIVE (Requires 6-digit code upon sign-in)' : 'DISABLED'}</span>
              </p>

              {currentUser.backupCodes && currentUser.backupCodes.length > 0 && (
                <div className="p-3 rounded bg-[#141414] border border-zinc-800 space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase font-bold">Emergency Backup Codes:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-blue-400">
                    {currentUser.backupCodes.map((code, idx) => (
                      <code key={idx} className="p-1 rounded bg-black/40 border border-zinc-800 text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Simulator Drawers & Modals */}
      <EmailInboxDrawer />
      <DatabaseModal />
    </div>
  );
}
