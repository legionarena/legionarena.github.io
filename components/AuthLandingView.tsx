'use client';

import React, { useState } from 'react';
import {
  Flame,
  Mail,
  Volume2,
  VolumeX,
  Shield,
  Trophy,
  LogIn,
  UserPlus,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Inbox,
  Sparkles,
  Gamepad2,
  Music,
  Zap,
  Users
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
      setAuthError('Please enter your username or email and password.');
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
      setAuthSuccess(`Welcome back, ${res.user.callsign}!`);
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
      setAuthSuccess('Email verified successfully! Welcome to PlayStorm.');
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

  // 5. Handle Forgot Password Request
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#070b14] text-slate-100 font-sans relative overflow-x-hidden modern-grid-pattern selection:bg-orange-600 selection:text-white">
      {/* Fiery Ambient Background Highlights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[650px] h-[400px] bg-orange-600/15 rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/3 right-1/4 w-[550px] h-[350px] bg-red-600/15 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-amber-600/10 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Top Disclaimer Banner */}
      <div
        id="landing-gemini-disclaimer"
        className="relative z-40 bg-gradient-to-r from-red-950 via-orange-950 to-slate-950 border-b border-orange-700/40 px-4 py-2 text-xs text-orange-200 flex items-center justify-between shadow-sm"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="font-semibold text-white">
              Firestorm Tournaments &bull; Made with Google Gemini AI Studio
            </span>
          </div>
          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-400 hover:text-white font-bold hover:underline"
          >
            Explore Build
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-30 border-b border-orange-900/40 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 shrink-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-md shadow-orange-950/50">
              <Flame className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white leading-none font-serif">
                FIRESTORM
              </span>
              <span className="text-xs font-extrabold text-orange-400 tracking-widest uppercase leading-tight">
                TOURNAMENTS &bull; SEASON 4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-outbox-btn"
              type="button"
              onClick={() => {
                refreshOutbox();
                setIsOutboxOpen(true);
                playTacticalSound('click');
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-orange-900/50 text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              title="View verification and recovery emails"
            >
              <Mail className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Verification Outbox</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-xs font-bold text-orange-300">
                {outboxEmails.length}
              </span>
            </button>

            <button
              id="landing-sfx-btn"
              type="button"
              onClick={onToggleSfx}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={sfxEnabled ? 'Sound On' : 'Sound Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 to-orange-950/80 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-widest shadow-inner">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>Championship Arena &bull; Season 4 Grand Prix</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-serif">
                Enter The Crucible: <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-red-400 bg-clip-text text-transparent">
                  Firestorm Tournaments
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Compete in competitive arcade qualifiers, conquer the open 3D dungeon of <strong className="text-amber-300">Realm of Champions 3D</strong>, claim legendary loot, and ascend the verified global championship leaderboards.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-900/40 space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Realm of Champions 3D</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Open 512x512 landscape, 8-slot gear, Northeast Fortress &amp; Dread Titan boss raids.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-900/40 space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>Championship Brackets</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Verified high scores, seasonal leaderboard rankings, and competitive tournament records.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-orange-900/40 space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Arcade Qualifiers</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">Play Block Drop Matrix, Reaction Challenge &amp; stream synthwave tournament tracks.</p>
              </div>
            </div>

            {/* Demo Accounts Quick Buttons */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-400">⚡ Quick Demo Login Accounts</span>
                <span className="text-[10px] text-slate-400 font-medium">Click to auto-fill credentials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Demo Account 1 */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-blue-900/40 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-xs truncate">#1 GhostRider</span>
                    <span className="text-[10px] text-slate-400 truncate">player@firestorm.gg</span>
                  </div>
                  <button
                    id="demo-fill-btn-1"
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('player@firestorm.gg');
                      setLoginPassword('password123');
                      setAuthMode('LOGIN');
                      playTacticalSound('click');
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Demo #1 Fill
                  </button>
                </div>

                {/* Demo Account 2 */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-900/40 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-xs truncate">#2 ApexViper</span>
                    <span className="text-[10px] text-slate-400 truncate">viper@firestorm.gg</span>
                  </div>
                  <button
                    id="demo-fill-btn-2"
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('viper@firestorm.gg');
                      setLoginPassword('password123');
                      setAuthMode('LOGIN');
                      playTacticalSound('click');
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Demo #2 Fill
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Top Tabs */}
              <div className="flex border-b border-orange-950/60 bg-slate-950">
                <button
                  id="tab-login-btn"
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setAuthError(null);
                    setAuthSuccess(null);
                    playTacticalSound('switch');
                  }}
                  className={`flex-1 py-3.5 px-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'LOGIN' || authMode === 'FORGOT_PASSWORD' || authMode === 'RESET_CONFIRM'
                      ? 'bg-slate-900 text-orange-400 border-b-2 border-orange-500 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Enter Arena (Log In)</span>
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
                  className={`flex-1 py-3.5 px-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'REGISTER' || authMode === 'VERIFY'
                      ? 'bg-slate-900 text-orange-400 border-b-2 border-orange-500 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enlist (Sign Up)</span>
                </button>
              </div>

              {/* Feedback messages */}
              {authError && (
                <div className="m-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="m-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* 1. Login Form */}
              {authMode === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Gladiator Callsign / Email
                    </label>
                    <input
                      id="login-id-input"
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="GhostRider or player@firestorm.gg"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-orange-900/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase text-slate-300">
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
                        className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-orange-900/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <button
                    id="submit-login-btn"
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:via-orange-500 hover:to-amber-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-orange-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Enter Tournament</span>
                  </button>
                </form>
              )}

              {/* 2. Register Form */}
              {authMode === 'REGISTER' && (
                <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Player Username
                    </label>
                    <input
                      id="register-callsign-input"
                      type="text"
                      required
                      value={registerCallsign}
                      onChange={(e) => setRegisterCallsign(e.target.value)}
                      placeholder="e.g. PixelWarrior"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="player@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                        Password
                      </label>
                      <input
                        id="register-password-input"
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="6+ characters"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        id="register-confirm-password-input"
                        type="password"
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    id="submit-register-btn"
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>
                </form>
              )}

              {/* 3. Verification Form */}
              {authMode === 'VERIFY' && (
                <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200 leading-relaxed">
                    A 6-digit verification code has been dispatched to <strong>{verifyEmailAddress}</strong>. Enter it below to activate your account.
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="verify-email-input"
                      type="email"
                      required
                      value={verifyEmailAddress}
                      onChange={(e) => setVerifyEmailAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      id="verify-code-input"
                      type="text"
                      required
                      maxLength={6}
                      value={verifyPinCode}
                      onChange={(e) => setVerifyPinCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      id="submit-verify-btn"
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                    >
                      Verify Email
                    </button>
                    <button
                      id="resend-code-btn"
                      type="button"
                      onClick={handleResendCode}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Forgot Password Request */}
              {authMode === 'FORGOT_PASSWORD' && (
                <form onSubmit={handleForgotRequest} className="p-6 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter your registered email address to receive a 6-digit password recovery code.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="forgot-email-input"
                      type="email"
                      required
                      value={forgotEmailAddress}
                      onChange={(e) => setForgotEmailAddress(e.target.value)}
                      placeholder="player@firestorm.gg"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      id="submit-forgot-btn"
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                    >
                      Send Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('LOGIN')}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Back Login
                    </button>
                  </div>
                </form>
              )}

              {/* 5. Reset Password Confirm */}
              {authMode === 'RESET_CONFIRM' && (
                <form onSubmit={handleResetConfirm} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      Recovery Code
                    </label>
                    <input
                      id="reset-code-input"
                      type="text"
                      required
                      maxLength={6}
                      value={resetRecoveryCode}
                      onChange={(e) => setResetRecoveryCode(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <input
                      id="reset-new-password-input"
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    id="submit-reset-confirm-btn"
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Outbox Modal (When open on unauthenticated view) */}
      {isOutboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Email Verification Outbox"
          className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="flex-1 cursor-pointer" onClick={() => setIsOutboxOpen(false)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl relative">
            <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Inbox className="w-5 h-5 text-blue-400" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Verification Outbox
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dispatched verification &amp; reset codes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {outboxEmails.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No dispatched emails found.
                </div>
              ) : (
                outboxEmails.map((em) => (
                  <div
                    key={em.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-850 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-300 font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40">
                        {em.type}
                      </span>
                      <span className="text-slate-400">{new Date(em.sentAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{em.subject}</div>
                    <div className="text-xs text-slate-300">To: {em.to}</div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-750 text-xs text-blue-300">
                      Code: <strong className="text-base text-white font-mono tracking-widest">{em.code}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Local Outbox Log</span>
              <button
                type="button"
                onClick={() => setIsOutboxOpen(false)}
                className="text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
