'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import {
  Menu,
  X,
  Radio,
  Swords,
  Dices,
  AppWindow,
  Maximize2,
  Minimize2,
  RotateCw,
  Volume2,
  VolumeX,
  Crosshair,
  Shield,
  Flame,
  Activity,
  Terminal,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  KeyRound,
  Inbox,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Radar,
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
  getCurrentUser,
  logoutUser,
  getEmailOutbox
} from '@/lib/db';

interface ArenaStation {
  id: string;
  code: string;
  name: string;
  callsign: string;
  sector: string;
  url: string;
  icon: React.ElementType;
  briefing: string;
  tag: string;
  status: string;
  themeColor: string;
  borderAccent: string;
  accentBg: string;
  badgeClass: string;
}

const STATIONS: ArenaStation[] = [
  {
    id: 'music-search',
    code: 'ALPHA-01',
    name: 'Audio Comms & Media Recon',
    callsign: 'BROADCAST COMMAND',
    sector: 'SECTOR A // COMMS RELAY',
    url: '/music-search.html',
    icon: Radio,
    briefing: 'Global video intel radar and streaming player with synchronized tactical playlist queue.',
    tag: 'COMMS RADAR',
    status: 'FREQUENCY LOCKED',
    themeColor: 'text-amber-400',
    borderAccent: 'border-amber-500/50',
    accentBg: 'bg-amber-500/10',
    badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-400'
  },
  {
    id: 'code-pressed',
    code: 'BRAVO-02',
    name: 'Cold Pressed Combat Arena',
    callsign: 'BLITZ ASSAULT',
    sector: 'SECTOR B // TRAINING GROUNDS',
    url: '/code-pressed.html',
    icon: Swords,
    briefing: 'High-octane reflex combat arena. Dodge explosive hazards, slice incoming targets, and claim victory.',
    tag: 'COMBAT SIM',
    status: 'ZONE SECURE',
    themeColor: 'text-orange-500',
    borderAccent: 'border-orange-500/50',
    accentBg: 'bg-orange-500/10',
    badgeClass: 'bg-orange-950/80 border-orange-500/50 text-orange-400'
  },
  {
    id: 'slots-up',
    code: 'CHARLIE-03',
    name: '7x7 Supply Drop Matrix',
    callsign: 'RE-ROLL RECON',
    sector: 'SECTOR C // VAULT SUPPLY',
    url: '/slots-up.html',
    icon: Dices,
    briefing: '7x7 tactical supply drop reels. Match weapon anchors, activate jackpot multipliers, and unlock loot caches.',
    tag: 'SUPPLY VAULT',
    status: 'SUPPLY READY',
    themeColor: 'text-cyan-400',
    borderAccent: 'border-cyan-500/50',
    accentBg: 'bg-cyan-500/10',
    badgeClass: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
  }
];

type AuthViewMode = 'LOGIN' | 'REGISTER' | 'VERIFY' | 'FORGOT_PASSWORD' | 'RESET_CONFIRM';

function subscribeToNoop() {
  return () => {};
}

export default function FirestormMainPage() {
  const isHydrated = useSyncExternalStore(
    subscribeToNoop,
    () => true,
    () => false
  );

  // Session & Auth State with lazy initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentUser();
    }
    return null;
  });

  // Arena Controls
  const [activeStationId, setActiveStationId] = useState<string>('music-search');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [ping, setPing] = useState<number>(18);

  // Auth Form State
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

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Tactical Web Audio Sound Generator
  const playTacticalSound = useCallback((type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => {
    if (!sfxEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createGain ? ctx.createOscillator() : null;
      const gain = ctx.createGain ? ctx.createGain() : null;
      if (!osc || !gain) return;

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'menu') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'switch') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.07);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'launch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  }, [sfxEnabled]);

  const refreshOutbox = () => {
    setOutboxEmails(getEmailOutbox());
  };

  // Launch station in dedicated standalone popup window
  const launchInNewWindow = useCallback((url: string, title: string) => {
    playTacticalSound('launch');
    const width = 1280;
    const height = 820;
    const left = typeof window !== 'undefined' ? Math.max(0, (window.screen.width - width) / 2) : 100;
    const top = typeof window !== 'undefined' ? Math.max(0, (window.screen.height - height) / 2) : 100;
    const windowFeatures = `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
    
    window.open(url, `Firestorm_${title.replace(/[^a-zA-Z0-9]/g, '_')}`, windowFeatures);
  }, [playTacticalSound]);

  // Simulated ping fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(14 + Math.random() * 9));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Escape to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        playTacticalSound('menu');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, playTacticalSound]);

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
      setCurrentUser(res.user);
      setAuthSuccess(`Clearance granted. Welcome Commander ${res.user.callsign}!`);
      playTacticalSound('success');
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
      setCurrentUser(res.user);
      setAuthSuccess('Account successfully verified! Entering Firestorm Tournament Arena...');
      playTacticalSound('success');
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

  // 7. Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthMode('LOGIN');
    setAuthSuccess('Operative logged out. Terminal secured.');
    playTacticalSound('click');
  };

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#060709] text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <Radar className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-xs uppercase tracking-widest">INITIALIZING FIRESTORM DATABASE...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW A: MAIN LANDING PAGE (UNVERIFIED / LOGGED OUT)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#060709] text-zinc-100 font-sans relative overflow-x-hidden tactical-grid selection:bg-[#ff4400] selection:text-black">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[700px] h-[400px] bg-gradient-to-b from-orange-600/15 via-red-700/5 to-transparent blur-3xl opacity-80" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-t from-red-600/10 via-amber-600/5 to-transparent blur-3xl opacity-60" />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-30 border-b border-zinc-800/80 bg-[#090b10]/95 backdrop-blur-md px-4 sm:px-8 py-3 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black shadow-[0_0_18px_rgba(255,85,0,0.4)] chamfer-edge-sm">
                <Flame className="w-5 h-5 text-black fill-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter uppercase leading-none animate-fire-title">
                  FIRESTORM
                </span>
                <span className="text-[10px] sm:text-xs font-black font-mono tracking-[0.25em] text-orange-400 uppercase leading-tight">
                  TOURNAMENTS
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Simulated Outbox Quick Access */}
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

              {/* Sound Toggle */}
              <button
                id="landing-sfx-btn"
                type="button"
                onClick={() => {
                  setSfxEnabled(!sfxEnabled);
                  if (!sfxEnabled) playTacticalSound('click');
                }}
                className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title={sfxEnabled ? 'SFX Active' : 'SFX Muted'}
              >
                {sfxEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Landing Hero & Auth Grid */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Briefing */}
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
                  Fortnite and Call of Duty inspired tactical tournament arena. Register with automated email verification, access direct-launch battle stations, and compete across live combat matrixes.
                </p>
              </div>

              {/* Tournament Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-orange-400 font-mono font-bold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>SECURE ID</span>
                  </div>
                  <p className="text-xs text-zinc-400">12-character military tactical UID registration &amp; verification.</p>
                </div>

                <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                    <Radio className="w-4 h-4" />
                    <span>AUDIO RECON</span>
                  </div>
                  <p className="text-xs text-zinc-400">Live YouTube media search, battle queue, and streaming recon.</p>
                </div>

                <div className="p-3.5 rounded bg-[#0d111a] border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                    <AppWindow className="w-4 h-4" />
                    <span>WINDOW POP</span>
                  </div>
                  <p className="text-xs text-zinc-400">Instant standalone window deployment for tournament gameplay.</p>
                </div>
              </div>

              {/* Quick Demo Operative Badge */}
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
                  className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
            </div>

            {/* Right Authentication Terminal */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-zinc-800 bg-[#0c0f17]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative backdrop-blur-md">
                
                {/* Tactical Corner HUD accents */}
                <div className="absolute top-2 left-2 pointer-events-none w-3 h-3 border-t-2 border-l-2 border-orange-500" />
                <div className="absolute top-2 right-2 pointer-events-none w-3 h-3 border-t-2 border-r-2 border-orange-500" />

                {/* Auth Console Top Mode Switcher */}
                <div className="p-3 bg-[#111622] border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      id="auth-tab-login"
                      type="button"
                      onClick={() => {
                        setAuthMode('LOGIN');
                        setAuthError(null);
                        setAuthSuccess(null);
                        playTacticalSound('click');
                      }}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        authMode === 'LOGIN'
                          ? 'bg-[#ff4400] text-black shadow-[0_0_12px_rgba(255,68,0,0.5)]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      LOG IN
                    </button>
                    <button
                      id="auth-tab-register"
                      type="button"
                      onClick={() => {
                        setAuthMode('REGISTER');
                        setAuthError(null);
                        setAuthSuccess(null);
                        playTacticalSound('click');
                      }}
                      className={`px-3 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        authMode === 'REGISTER'
                          ? 'bg-[#ff4400] text-black shadow-[0_0_12px_rgba(255,68,0,0.5)]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      CREATE ACCOUNT
                    </button>
                    <button
                      id="auth-tab-verify"
                      type="button"
                      onClick={() => {
                        setAuthMode('VERIFY');
                        setAuthError(null);
                        setAuthSuccess(null);
                        playTacticalSound('click');
                      }}
                      className={`px-2.5 py-1.5 rounded font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        authMode === 'VERIFY'
                          ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      VERIFY
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                    AUTH TERMINAL
                  </span>
                </div>

                {/* Feedback Alerts */}
                {authError && (
                  <div className="mx-5 mt-4 p-3 rounded bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}
                {authSuccess && (
                  <div className="mx-5 mt-4 p-3 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* ================= MODE 1: LOGIN ================= */}
                {authMode === 'LOGIN' && (
                  <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                        Callsign or Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="login-identifier-input"
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. GhostRider or operative@firestorm.gg"
                          className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                        />
                        <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono uppercase font-bold text-zinc-400">
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
                      <div className="relative">
                        <input
                          id="login-password-input"
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                        />
                        <Lock className="w-4 h-4 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      id="submit-login-btn"
                      type="submit"
                      className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40 mt-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>LOG IN &amp; ENTER ARENA</span>
                    </button>
                  </form>
                )}

                {/* ================= MODE 2: REGISTER ================= */}
                {authMode === 'REGISTER' && (
                  <form onSubmit={handleRegisterSubmit} className="p-5 sm:p-6 space-y-3.5">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1">
                        Operative Callsign (Username)
                      </label>
                      <input
                        id="register-callsign-input"
                        type="text"
                        required
                        value={registerCallsign}
                        onChange={(e) => setRegisterCallsign(e.target.value)}
                        placeholder="e.g. ShadowStriker"
                        className="w-full px-3.5 py-2 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1">
                        Email Address
                      </label>
                      <input
                        id="register-email-input"
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="operative@domain.com"
                        className="w-full px-3.5 py-2 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1">
                          Password
                        </label>
                        <input
                          id="register-password-input"
                          type="password"
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full px-3.5 py-2 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1">
                          Confirm Password
                        </label>
                        <input
                          id="register-confirm-password-input"
                          type="password"
                          required
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full px-3.5 py-2 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Generates 12-digit tactical UID + automated 6-digit email code.</span>
                    </div>

                    <button
                      id="submit-register-btn"
                      type="submit"
                      className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-orange-400/40"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>CREATE OPERATIVE ACCOUNT</span>
                    </button>
                  </form>
                )}

                {/* ================= MODE 3: EMAIL VERIFICATION ================= */}
                {authMode === 'VERIFY' && (
                  <form onSubmit={handleVerifySubmit} className="p-5 sm:p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase font-bold text-zinc-400 mb-1.5">
                        Registered Email Address
                      </label>
                      <input
                        id="verify-email-input"
                        type="email"
                        required
                        value={verifyEmailAddress}
                        onChange={(e) => setVerifyEmailAddress(e.target.value)}
                        placeholder="operative@domain.com"
                        className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-mono uppercase font-bold text-zinc-400">
                          6-Digit Verification Code
                        </label>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-[11px] font-mono text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend Code</span>
                        </button>
                      </div>
                      <input
                        id="verify-pin-input"
                        type="text"
                        maxLength={6}
                        required
                        value={verifyPinCode}
                        onChange={(e) => setVerifyPinCode(e.target.value)}
                        placeholder="e.g. 849201"
                        className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-lg tracking-[0.25em] text-center font-bold text-orange-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                      />
                    </div>

                    <button
                      id="submit-verify-btn"
                      type="submit"
                      className="w-full py-3 rounded bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-black font-mono font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>VERIFY &amp; ENTER TOURNAMENT</span>
                    </button>
                  </form>
                )}

                {/* ================= MODE 4: FORGOT PASSWORD (EMAIL ONLY) ================= */}
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
                        className="w-full px-3.5 py-2.5 rounded bg-[#131824] border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono transition-colors"
                      />
                    </div>

                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      Enter your account email to receive a 6-digit recovery code. (Strictly email recovery &mdash; no MFA required).
                    </p>

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
                        className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs uppercase font-bold"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}

                {/* ================= MODE 5: RESET CONFIRM ================= */}
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
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
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
                          className="px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase"
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
                  className="text-orange-400 hover:underline font-bold"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Landing Page Footer */}
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

  // ==========================================
  // VIEW B: AUTHENTICATED TOURNAMENT ARENA (ONCE VERIFIED)
  // ==========================================
  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  return (
    <div className="flex-1 flex flex-col h-full min-h-screen bg-[#060709] text-zinc-100 selection:bg-[#ff4400] selection:text-black font-sans relative overflow-x-hidden tactical-grid">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-b from-orange-600/10 via-red-700/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-cyan-600/10 via-blue-700/5 to-transparent blur-3xl opacity-50" />
      </div>

      {/* Top Tactical HUD Navigation Bar */}
      <header className="relative z-30 border-b border-zinc-800/80 bg-[#090b10]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 shrink-0 shadow-2xl">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Tactical Hamburger Menu Trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="firestorm-hamburger-btn"
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                playTacticalSound('menu');
              }}
              aria-expanded={isMenuOpen}
              aria-label="Open Tactical Area Menu"
              className={`relative group px-3 py-2 rounded border flex items-center gap-2.5 transition-all cursor-pointer ${
                isMenuOpen
                  ? 'bg-[#ff4400] text-black border-[#ff5500] shadow-[0_0_18px_rgba(255,68,0,0.5)]'
                  : 'bg-[#10141d] hover:bg-[#181f2c] text-zinc-100 border-zinc-700/80 hover:border-orange-500/80'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-200 rotate-90 group-hover:rotate-0" />
              ) : (
                <Menu className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-transform duration-200 group-hover:scale-110" />
              )}
              <div className="flex flex-col items-start text-left">
                <span className="font-mono text-[11px] font-black tracking-wider uppercase leading-none">
                  {isMenuOpen ? 'CLOSE MENU' : 'TACTICAL MENU'}
                </span>
                <span className={`font-mono text-[9px] uppercase tracking-widest leading-tight ${isMenuOpen ? 'text-black/80 font-bold' : 'text-orange-400'}`}>
                  {STATIONS.length} AREAS
                </span>
              </div>
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-zinc-800" />

            {/* Firestorm Tournaments Main Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black shadow-[0_0_16px_rgba(255,85,0,0.4)] chamfer-edge-sm">
                <Flame className="w-5 h-5 text-black fill-black" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter uppercase leading-none animate-fire-title">
                    FIRESTORM
                  </span>
                  <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950/80 border border-red-500/40 text-red-400 uppercase tracking-widest">
                    SEASON 4 LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs font-black font-mono tracking-[0.25em] text-orange-400 uppercase leading-tight">
                    TOURNAMENTS
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">|</span>
                  <span className="text-[10px] text-zinc-400 font-mono hidden lg:inline tracking-wider uppercase">
                    Fortnite &amp; Warzone Championship Arena
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD Telemetry & Verified Operative Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Operative Profile Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#10141d]/90 border border-zinc-800 text-xs font-mono">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600 text-black font-black flex items-center justify-center text-xs">
                {currentUser.callsign.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none hidden sm:flex">
                <span className="font-bold text-zinc-200">{currentUser.callsign}</span>
                <span className="text-[10px] text-orange-400">{currentUser.id}</span>
              </div>
            </div>

            {/* Live Server Ping */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#10141d]/80 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>PING: <strong className="text-zinc-200">{ping}ms</strong></span>
            </div>

            {/* Sound Toggle */}
            <button
              id="arena-sfx-btn"
              type="button"
              onClick={() => {
                setSfxEnabled(!sfxEnabled);
                if (!sfxEnabled) playTacticalSound('click');
              }}
              className="p-2 rounded bg-[#121620] hover:bg-[#1a2130] text-orange-400 border border-zinc-700/80 transition-colors"
              title={sfxEnabled ? 'SFX Active' : 'SFX Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>

            {/* Launch In New Window Primary Action */}
            <button
              id="firestorm-launch-window-btn"
              type="button"
              onClick={() => launchInNewWindow(activeStation.url, activeStation.name)}
              className="px-3 sm:px-4 py-2 rounded bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_18px_rgba(255,85,0,0.35)] hover:shadow-[0_0_24px_rgba(255,85,0,0.6)] flex items-center gap-2 cursor-pointer border border-orange-400/40"
              title="Open current battle station in a dedicated standalone window"
            >
              <AppWindow className="w-4 h-4 text-orange-200" />
              <span className="hidden sm:inline">OPEN IN NEW WINDOW</span>
              <span className="sm:hidden">NEW WINDOW</span>
            </button>

            {/* Log Out Button */}
            <button
              id="firestorm-logout-btn"
              type="button"
              onClick={handleLogout}
              className="p-2 rounded bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/50 transition-colors cursor-pointer"
              title="Log Out of Firestorm Arena"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Tactical Hamburger Menu Drawer */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Firestorm Tactical Areas"
          className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          {/* Backdrop click to dismiss */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              setIsMenuOpen(false);
              playTacticalSound('menu');
            }}
          />

          {/* Drawer Container */}
          <div className="w-full max-w-lg bg-[#0a0d14] border-l border-zinc-800 text-zinc-100 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] h-full overflow-hidden relative">
            <div className="absolute inset-0 tactical-grid pointer-events-none opacity-40" />

            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#0e121b] flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#ff4400]/20 border border-[#ff4400]/40 flex items-center justify-center text-orange-400">
                  <Radar className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black font-mono tracking-wider uppercase text-white">
                      TACTICAL AREAS
                    </h2>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-orange-950 border border-orange-500/50 text-orange-400">
                      INDEX // 03
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Select arena station to deploy in view or launch in new window
                  </p>
                </div>
              </div>

              <button
                id="close-drawer-btn"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  playTacticalSound('menu');
                }}
                className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                title="Close Menu (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operative Clearance Info */}
            <div className="px-4 py-3 bg-[#121622] border-b border-zinc-800 text-xs font-mono flex items-center justify-between text-zinc-400 relative z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-200 font-bold">OPERATIVE: {currentUser.callsign} ({currentUser.id})</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">VERIFIED</span>
            </div>

            {/* List of Tactical Areas */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 relative z-10">
              {STATIONS.map((station) => {
                const Icon = station.icon;
                const isSelected = station.id === activeStationId;

                return (
                  <div
                    key={station.id}
                    className={`rounded-lg border p-4 transition-all ${
                      isSelected
                        ? 'bg-[#131926] border-orange-500 shadow-[0_0_20px_rgba(255,85,0,0.2)]'
                        : 'bg-[#0c0f17] hover:bg-[#10141f] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-orange-400 px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-500/40">
                          {station.code}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">
                          {station.sector}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${station.badgeClass}`}>
                        {station.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mb-2">
                      <div className={`p-2.5 rounded border ${station.accentBg} ${station.borderAccent} ${station.themeColor} shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-mono font-bold text-sm sm:text-base text-white tracking-tight">
                          {station.name}
                        </h3>
                        <p className="text-xs text-zinc-400 font-sans mt-1 leading-relaxed">
                          {station.briefing}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center gap-2">
                      <button
                        id={`deploy-${station.id}-btn`}
                        type="button"
                        onClick={() => {
                          setActiveStationId(station.id);
                          setIsMenuOpen(false);
                          playTacticalSound('switch');
                        }}
                        className={`flex-1 py-2 px-3 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'CURRENTLY ACTIVE' : 'DEPLOY IN VIEW'}</span>
                      </button>

                      <button
                        id={`open-window-${station.id}-btn`}
                        type="button"
                        onClick={() => launchInNewWindow(station.url, station.name)}
                        className="py-2 px-3.5 rounded bg-zinc-900 hover:bg-orange-600 hover:text-white border border-zinc-700 hover:border-orange-500 font-mono text-xs text-zinc-300 font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Launch this tactical area in a separate standalone window"
                      >
                        <AppWindow className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                        <span>NEW WINDOW</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-800 bg-[#0c0f17] relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                <span>FIRESTORM TOURNAMENT ENGINE</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  playTacticalSound('menu');
                }}
                className="text-orange-400 hover:underline font-bold"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Sub-Navbar: Area Quick Switcher & Controls */}
      <nav className="relative z-20 border-b border-zinc-800/80 bg-[#0d1017]/90 px-3 sm:px-6 py-2 shrink-0">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
            <span className="text-[10px] font-mono uppercase font-black text-zinc-500 mr-1 hidden sm:inline">
              STATIONS:
            </span>
            {STATIONS.map((station) => {
              const Icon = station.icon;
              const isActive = station.id === activeStationId;
              return (
                <button
                  key={station.id}
                  id={`nav-tab-${station.id}`}
                  type="button"
                  onClick={() => {
                    setActiveStationId(station.id);
                    playTacticalSound('switch');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600/30 to-red-600/20 text-orange-300 border border-orange-500/70 font-black shadow-[0_0_14px_rgba(255,85,0,0.25)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-zinc-500'}`} />
                  <span className="tracking-wide">{station.name}</span>
                  <span className={`text-[9px] px-1 py-0.1 rounded border font-bold ${station.badgeClass}`}>
                    {station.code}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              id="station-window-popout-btn"
              type="button"
              onClick={() => launchInNewWindow(activeStation.url, activeStation.name)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 hover:text-orange-300 transition-colors"
              title="Open current area in a separate standalone window"
            >
              <AppWindow className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Launch New Window</span>
            </button>

            <button
              id="station-reload-btn"
              type="button"
              onClick={() => {
                setReloadKey((prev) => prev + 1);
                playTacticalSound('click');
              }}
              className="p-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Reload Battle Station"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              id="station-fullscreen-btn"
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-orange-400" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Battle Station Viewport */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 max-w-[1700px] w-full mx-auto relative z-10">
        <div
          className={`flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#080a0f] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-all relative ${
            isFullscreen ? 'fixed inset-2 z-50 rounded-none' : 'min-h-[720px] h-[calc(100vh-145px)]'
          }`}
        >
          {/* Tactical HUD Header Bar Above Frame */}
          <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-[#0e121b] border-b border-zinc-800 text-xs font-mono text-zinc-400 shrink-0 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-orange-400">
                <Crosshair className="w-4 h-4 animate-pulse" />
                <span className="font-bold uppercase tracking-wider">{activeStation.callsign}</span>
              </div>
              <span className="text-zinc-700">|</span>
              <span className="text-zinc-200 font-bold">{activeStation.name}</span>
              <span className="text-zinc-500 hidden md:inline">&mdash; {activeStation.sector}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-bold">{activeStation.status}</span>
              </div>

              <button
                type="button"
                onClick={() => launchInNewWindow(activeStation.url, activeStation.name)}
                className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1 font-bold transition-colors cursor-pointer bg-orange-950/40 hover:bg-orange-950 px-2 py-0.5 rounded border border-orange-500/30"
              >
                <span>OPEN IN NEW WINDOW</span>
                <AppWindow className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Battle Station Frame Viewport */}
          <div className="flex-1 relative w-full h-full bg-black">
            <div className="absolute top-2 left-2 z-20 pointer-events-none w-4 h-4 border-t-2 border-l-2 border-orange-500/60" />
            <div className="absolute top-2 right-2 z-20 pointer-events-none w-4 h-4 border-t-2 border-r-2 border-orange-500/60" />
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none w-4 h-4 border-b-2 border-l-2 border-orange-500/60" />
            <div className="absolute bottom-2 right-2 z-20 pointer-events-none w-4 h-4 border-b-2 border-r-2 border-orange-500/60" />

            <iframe
              key={`${activeStation.id}-${reloadKey}`}
              src={activeStation.url}
              title={activeStation.name}
              className="w-full h-full border-0 relative z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
              allowFullScreen
            />
          </div>
        </div>
      </main>

      {/* Bottom Tournament Ticker */}
      <footer className="border-t border-zinc-850 bg-[#08090d] px-4 py-1.5 shrink-0 relative z-20 text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-zinc-400 font-bold">FIRESTORM TOURNAMENTS</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">
            OPERATIVE {currentUser.callsign} &bull; CLEARANCE LEVEL 1 &bull; GITHUB PAGES STATIC DEPLOY READY
          </span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 text-[10px]">
          <span>FORTNITE &amp; WARZONE HUD</span>
          <span className="text-zinc-700">|</span>
          <span className="text-orange-400 font-bold">v4.5 PRO</span>
        </div>
      </footer>
    </div>
  );
}
