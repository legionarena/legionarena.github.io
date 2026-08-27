'use client';

import React, { useState } from 'react';
import {
  Flame,
  Mail,
  Volume2,
  VolumeX,
  Shield,
  Radio,
  Trophy,
  Terminal,
  LogIn,
  UserPlus,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Inbox,
  RefreshCw
} from 'lucide-react';
import { User, DispatchedEmail } from '@/lib/types';
import {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getEmailOutbox
} from '@/lib/db';

interface AuthLandingViewProps {
  onAuthSuccess: (user: User) => void;
  playTacticalSound: (type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
}

type AuthViewMode = 'LOGIN' | 'REGISTER' | 'VERIFY' | 'FORGOT_PASSWORD' | 'RESET_CONFIRM';

export default function AuthLandingView({
  onAuthSuccess,
  playTacticalSound,
  sfxEnabled,
  onToggleSfx
}: AuthLandingViewProps) {
  const [authMode, setAuthMode] = useState<AuthViewMode>('LOGIN');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);

  // Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [registerCallsign, setRegisterCallsign] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>('');

  const [verifyEmailAddress, setVerifyEmailAddress] = useState<string>('');
  const [verifyPinCode, setVerifyPinCode] = useState<string>('');

  const [forgotEmailAddress, setForgotEmailAddress] = useState<string>('');
  const [resetRecoveryCode, setResetRecoveryCode] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');

  const [outboxEmails, setOutboxEmails] = useState<DispatchedEmail[]>(() => {
    if (typeof window !== 'undefined') {
      return getEmailOutbox();
    }
    return [];
  });

  const refreshOutbox = () => {
    setOutboxEmails(getEmailOutbox());
  };

  // 1. Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!loginIdentifier || !loginPassword) {
      setAuthError('Please enter your operative callsign or email and password.');
      playTacticalSound('alert');
      return;
    }

    const res = loginUser(loginIdentifier, loginPassword);
    if (!res.success) {
      setAuthError(res.message);
      playTacticalSound('alert');
      return;
    }

    if (res.requiresVerification && res.user) {
      setVerifyEmailAddress(res.user.email);
      setAuthMode('VERIFY');
      setAuthError('Email verification required. Please enter your 6-digit code.');
      refreshOutbox();
      playTacticalSound('alert');
      return;
    }

    if (res.user) {
      setAuthSuccess(`Clearance granted. Welcome Commander ${res.user.callsign}!`);
      playTacticalSound('success');
      onAuthSuccess(res.user);
    }
  };

  // 2. Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!registerCallsign || !registerEmail || !registerPassword) {
      setAuthError('All registration fields are required.');
      playTacticalSound('alert');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Passwords do not match.');
      playTacticalSound('alert');
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      playTacticalSound('alert');
      return;
    }

    const res = registerUser(registerEmail, registerCallsign, registerPassword);
    if (!res.success) {
      setAuthError(res.message);
      playTacticalSound('alert');
      return;
    }

    refreshOutbox();
    setVerifyEmailAddress(registerEmail.trim().toLowerCase());
    setVerifyPinCode(res.verificationCode || '');
    setAuthMode('VERIFY');
    setAuthSuccess(res.message);
    playTacticalSound('success');
  };

  // 3. Handle Verify Email Submit
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!verifyEmailAddress || !verifyPinCode) {
      setAuthError('Email and 6-digit verification code are required.');
      playTacticalSound('alert');
      return;
    }

    const res = verifyEmail(verifyEmailAddress, verifyPinCode);
    if (!res.success) {
      setAuthError(res.message);
      playTacticalSound('alert');
      return;
    }

    if (res.user) {
      setAuthSuccess('Email verified! Clearance granted.');
      playTacticalSound('success');
      onAuthSuccess(res.user);
    }
  };

  // 4. Handle Resend Code
  const handleResendCode = () => {
    if (!verifyEmailAddress) {
      setAuthError('Enter your email address to resend verification code.');
      return;
    }
    const res = resendVerificationCode(verifyEmailAddress);
    refreshOutbox();
    if (res.success) {
      setAuthSuccess(res.message);
      if (res.code) setVerifyPinCode(res.code);
      playTacticalSound('success');
    } else {
      setAuthError(res.message);
      playTacticalSound('alert');
    }
  };

  // 5. Handle Forgot Password Request (Email Only)
  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!forgotEmailAddress) {
      setAuthError('Please enter your registered email address.');
      playTacticalSound('alert');
      return;
    }

    const res = requestPasswordReset(forgotEmailAddress);
    refreshOutbox();
    if (!res.success) {
      setAuthError(res.message);
      playTacticalSound('alert');
      return;
    }

    setResetRecoveryCode(res.resetCode || '');
    setAuthMode('RESET_CONFIRM');
    setAuthSuccess(res.message);
    playTacticalSound('success');
  };

  // 6. Handle Reset Confirm
  const handleResetConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!forgotEmailAddress || !resetRecoveryCode || !resetNewPassword) {
      setAuthError('All password recovery fields are required.');
      playTacticalSound('alert');
      return;
    }

    const res = resetPassword(forgotEmailAddress, resetRecoveryCode, resetNewPassword);
    if (!res.success) {
      setAuthError(res.message);
      playTacticalSound('alert');
      return;
    }

    setAuthSuccess(res.message);
    setAuthMode('LOGIN');
    setLoginIdentifier(forgotEmailAddress);
    setLoginPassword('');
    playTacticalSound('success');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#060709] text-zinc-100 font-sans relative overflow-x-hidden tactical-grid selection:bg-[#ff4400] selection:text-black">
      {/* Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[700px] h-[400px] bg-gradient-to-b from-orange-600/15 via-red-700/5 to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-t from-red-600/10 via-amber-600/5 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Top Header */}
      <header className="relative z-30 border-b border-zinc-800/80 bg-[#090b10]/95 backdrop-blur-md px-4 sm:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black shadow-[0_0_18px_rgba(255,85,0,0.4)]">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter uppercase leading-none">
                FIRESTORM
              </span>
              <span className="text-[10px] sm:text-xs font-black font-mono tracking-[0.25em] text-orange-400 uppercase leading-tight">
                TOURNAMENTS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="landing-outbox-btn"
              type="button"
              onClick={() => {
                refreshOutbox();
                setIsOutboxOpen(true);
                playTacticalSound('click');
              }}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 hover:text-orange-400 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              title="View simulated email verification codes & recovery inbox"
            >
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Tactical Comms Inbox</span>
              <span className="px-1.5 py-0.2 rounded bg-orange-950 border border-orange-500/40 text-[10px] font-bold text-orange-400">
                {outboxEmails.length}
              </span>
            </button>

            <button
              id="landing-sfx-btn"
              type="button"
              onClick={onToggleSfx}
              className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={sfxEnabled ? 'SFX Active' : 'SFX Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Briefing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-950/60 border border-orange-500/40 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>SEASON 4 CHAMPIONSHIP REGISTRATION LIVE</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight uppercase text-white leading-none">
                FIRESTORM
              </h1>
              <div className="text-2xl sm:text-4xl font-black font-mono text-orange-400 tracking-[0.2em] uppercase">
                TOURNAMENTS
              </div>
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed pt-2">
                Fortnite and Call of Duty inspired tournament arena. Register with automated email verification, save game high scores, curate tactical playlists, and share intel in public threads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-orange-400 font-mono font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>SECURE ID</span>
                </div>
                <p className="text-xs text-zinc-400">12-char UID registration &amp; email verification.</p>
              </div>

              <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <Radio className="w-4 h-4" />
                  <span>INTEL FEEDS</span>
                </div>
                <p className="text-xs text-zinc-400">1 post per thread with Base64 tactical image attachments.</p>
              </div>

              <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                  <Trophy className="w-4 h-4" />
                  <span>LEADERBOARDS</span>
                </div>
                <p className="text-xs text-zinc-400">Save high scores and compete for championship ranks.</p>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span>DEMO OPERATIVE: <strong className="text-zinc-200">player@firestorm.gg</strong> / <strong className="text-zinc-200">password123</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('player@firestorm.gg');
                  setLoginPassword('password123');
                  setAuthMode('LOGIN');
                  playTacticalSound('click');
                }}
                className="px-2.5 py-1 rounded bg-orange-600/30 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 text-[11px] font-bold uppercase transition-colors cursor-pointer"
              >
                Auto-Fill Demo
              </button>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b0e15] border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
              <div className="flex border-b border-zinc-800 bg-[#0d111a]">
                <button
                  id="tab-login-btn"
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setAuthError(null);
                    setAuthSuccess(null);
                    playTacticalSound('switch');
                  }}
                  className={`flex-1 py-3 px-4 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'LOGIN' || authMode === 'FORGOT_PASSWORD' || authMode === 'RESET_CONFIRM'
                      ? 'bg-[#121622] text-orange-400 border-b-2 border-orange-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>OPERATIVE LOGIN</span>
                </button>
                <button
                  id="tab-register-btn"
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setAuthError(null);
                    setAuthSuccess(null);
                    playTacticalSound('switch');
                  }}
                  className={`flex-1 py-3 px-4 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'REGISTER' || authMode === 'VERIFY'
                      ? 'bg-[#121622] text-orange-400 border-b-2 border-orange-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>NEW REGISTRATION</span>
                </button>
              </div>

              {/* Feedback messages */}
              {authError && (
                <div className="m-4 p-3 rounded bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="m-4 p-3 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Login Form */}
              {authMode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      Callsign or Email Address
                    </label>
                    <input
                      id="login-id-input"
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="GhostRider or player@firestorm.gg"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-zinc-400">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('FORGOT_PASSWORD');
                          setAuthError(null);
                          setAuthSuccess(null);
                          playTacticalSound('click');
                        }}
                        className="text-[11px] font-mono text-orange-400 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="login-password-input"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                    />
                  </div>

                  <button
                    id="submit-login-btn"
                    type="submit"
                    className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>AUTHENTICATE &amp; ENTER ARENA</span>
                  </button>
                </form>
              )}

              {/* Register Form */}
              {authMode === 'REGISTER' && (
                <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      Operative Callsign
                    </label>
                    <input
                      id="register-callsign-input"
                      type="text"
                      required
                      value={registerCallsign}
                      onChange={(e) => setRegisterCallsign(e.target.value)}
                      placeholder="e.g. ShadowViper"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      Email Address (For Verification)
                    </label>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="operative@domain.com"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                        Password
                      </label>
                      <input
                        id="register-password-input"
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        id="register-confirm-password-input"
                        type="password"
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full px-3 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>CREATE OPERATIVE ID &amp; DISPATCH CODE</span>
                  </button>
                </form>
              )}

              {/* Verify Form */}
              {authMode === 'VERIFY' && (
                <form onSubmit={handleVerifySubmit} className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      Target Email
                    </label>
                    <input
                      id="verify-email-input"
                      type="email"
                      required
                      value={verifyEmailAddress}
                      onChange={(e) => setVerifyEmailAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase font-bold text-zinc-400">
                        6-Digit Verification PIN
                      </label>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-[11px] font-mono text-orange-400 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    </div>
                    <input
                      id="verify-pin-input"
                      type="text"
                      maxLength={6}
                      required
                      value={verifyPinCode}
                      onChange={(e) => setVerifyPinCode(e.target.value)}
                      placeholder="e.g. 772910"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-base tracking-[0.2em] text-center font-bold text-orange-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <button
                    id="submit-verify-btn"
                    type="submit"
                    className="w-full py-3 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM CLEARANCE &amp; ENTER</span>
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {authMode === 'FORGOT_PASSWORD' && (
                <form onSubmit={handleForgotRequest} className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      Registered Email Address
                    </label>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={forgotEmailAddress}
                      onChange={(e) => setForgotEmailAddress(e.target.value)}
                      placeholder="operative@domain.com"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      id="submit-forgot-btn"
                      type="submit"
                      className="flex-1 py-2.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>DISPATCH RECOVERY CODE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('LOGIN');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Confirm Form */}
              {authMode === 'RESET_CONFIRM' && (
                <form onSubmit={handleResetConfirm} className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      6-Digit Recovery Code
                    </label>
                    <input
                      id="reset-code-input"
                      type="text"
                      maxLength={6}
                      required
                      value={resetRecoveryCode}
                      onChange={(e) => setResetRecoveryCode(e.target.value)}
                      placeholder="e.g. 748291"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-base tracking-[0.2em] text-center font-bold text-orange-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                      New Password
                    </label>
                    <input
                      id="reset-new-password-input"
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <button
                    id="submit-reset-confirm-btn"
                    type="submit"
                    className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>SAVE NEW PASSWORD &amp; LOG IN</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tactical Comms Outbox Drawer */}
      {isOutboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tactical Comms Outbox"
          className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="flex-1 cursor-pointer" onClick={() => setIsOutboxOpen(false)} />
          <div className="w-full max-w-md bg-[#0a0d14] border-l border-zinc-800 text-zinc-100 flex flex-col h-full shadow-2xl relative">
            <div className="p-4 border-b border-zinc-800 bg-[#0e121b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Inbox className="w-5 h-5 text-orange-400" />
                <div>
                  <h2 className="text-sm font-mono font-bold uppercase text-white">
                    TACTICAL COMMS OUTBOX
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Simulated email dispatcher for verification &amp; password recovery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {outboxEmails.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                  No dispatched comms found. Register an account or request password recovery to see emails here.
                </div>
              ) : (
                outboxEmails.map((em) => (
                  <div
                    key={em.id}
                    className="p-3.5 rounded-lg border border-zinc-800 bg-[#0d1017] space-y-2 hover:border-orange-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-orange-400 font-bold px-1.5 py-0.2 rounded bg-orange-950 border border-orange-500/40">
                        {em.type}
                      </span>
                      <span className="text-zinc-500">
                        {new Date(em.sentAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-200">
                      {em.subject}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      TO: <strong className="text-zinc-300">{em.to}</strong>
                    </div>
                    <div className="p-2 rounded bg-black/60 border border-zinc-800 font-mono text-xs text-orange-300 flex items-center justify-between">
                      <span>CODE: <strong className="text-base text-white tracking-widest">{em.code}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyEmailAddress(em.to);
                          setVerifyPinCode(em.code);
                          setForgotEmailAddress(em.to);
                          setResetRecoveryCode(em.code);
                          setIsOutboxOpen(false);
                          playTacticalSound('click');
                        }}
                        className="px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-sans whitespace-pre-line leading-relaxed">
                      {em.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-[#0c0f17] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>100% GITHUB PAGES COMPATIBLE</span>
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="text-orange-400 hover:underline font-bold cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-[#08090d] px-4 py-2 shrink-0 relative z-20 text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-zinc-400 font-bold">FIRESTORM TOURNAMENTS</span>
          <span className="text-zinc-700">|</span>
          <span>STANDALONE CLIENT DATABASE &amp; EMAIL RECOVERY READY</span>
        </div>
        <div className="text-zinc-500 text-[10px]">
          <span>FORTNITE &amp; WARZONE TOURNAMENT HUB</span>
        </div>
      </footer>
    </div>
  );
}
