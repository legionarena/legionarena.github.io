'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Flame,
  Radio,
  Swords,
  Dices,
  Volume2,
  VolumeX,
  LogOut,
  Shield,
  Activity,
  Trophy,
  MessageSquare,
  Crosshair,
  Mail,
  Inbox,
  Radar
} from 'lucide-react';
import { User, DispatchedEmail } from '@/lib/types';
import {
  getCurrentUser,
  logoutUser,
  saveGameHighScore,
  saveUserPlaylist,
  getEmailOutbox
} from '@/lib/db';
import AuthLandingView from '@/components/AuthLandingView';
import HighScoresView from '@/components/HighScoresView';
import IntelPostsView from '@/components/IntelPostsView';

interface StationInfo {
  id: string;
  name: string;
  url: string;
  icon: typeof Radio;
  code: string;
  sector: string;
  themeColor: string;
  accentBg: string;
  borderAccent: string;
  badgeClass: string;
  briefing: string;
  status: string;
  callsign: string;
}

const STATIONS: StationInfo[] = [
  {
    id: 'music-search',
    name: 'Music & Audio Recon Station',
    url: '/music-search.html',
    icon: Radio,
    code: 'ALPHA-01',
    sector: 'TACTICAL AUDIO & COMMS',
    themeColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    borderAccent: 'border-amber-500/30',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/40',
    briefing: 'High-speed YouTube media search, battle playlist manager, and combat audio streaming console.',
    status: 'ONLINE // READY',
    callsign: 'AUDIO-OPS'
  },
  {
    id: 'code-pressed',
    name: 'Cold Pressed Combat Arena',
    url: '/code-pressed.html',
    icon: Swords,
    code: 'BRAVO-02',
    sector: 'REACTION & HAZARD SIM',
    themeColor: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    borderAccent: 'border-orange-500/30',
    badgeClass: 'bg-orange-950 text-orange-300 border-orange-500/40',
    briefing: 'High-intensity survival reaction training. Dodge incoming sector hazards, unlock combo multipliers, and record high scores.',
    status: 'SIMULATOR ARMED',
    callsign: 'WARZONE-SIM'
  },
  {
    id: 'slots-up',
    name: '7x7 Supply Drop Matrix',
    url: '/slots-up.html',
    icon: Dices,
    code: 'CHARLIE-03',
    sector: 'SUPPLY RECON & JACKPOT',
    themeColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    briefing: 'Multi-line 7x7 grid supply crate generator with progressive jackpot meters and instant high score sync.',
    status: 'REELS CHARGED',
    callsign: 'FORTNITE-DROP'
  }
];

type ActiveTab = 'stations' | 'high-scores' | 'intel-posts';

interface HighScoreNotification {
  id: string;
  gameId: string;
  gameName: string;
  score: number;
  details?: string;
  isNewPersonalBest?: boolean;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return getCurrentUser();
    }
    return null;
  });
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('stations');
  const [activeStationId, setActiveStationId] = useState<string>('music-search');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [ping, setPing] = useState<number>(24);
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);
  const [highScoreNotification, setHighScoreNotification] = useState<HighScoreNotification | null>(null);
  const [outboxEmails, setOutboxEmails] = useState<DispatchedEmail[]>(() => {
    if (typeof window !== 'undefined') {
      return getEmailOutbox();
    }
    return [];
  });

  // Sound Engine
  const playTacticalSound = useCallback((type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => {
    if (!sfxEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'menu') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'launch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'alert') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }, [sfxEnabled]);

  // Sync Ping simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(20 + Math.random() * 12));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // PostMessage Event Listener for standalone game score & playlist saves
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      
      if (event.data.type === 'FIRESTORM_SAVE_SCORE') {
        const { gameId, score, details } = event.data;
        const activeUser = currentUser || getCurrentUser();
        if (typeof score === 'number') {
          const res = saveGameHighScore(gameId, score, details || '', activeUser);
          playTacticalSound('success');
          setHighScoreNotification({
            id: Date.now().toString(),
            gameId,
            gameName: gameId === 'code-pressed' ? 'Cold Pressed Combat Arena' : '7x7 Supply Drop Matrix',
            score,
            details,
            isNewPersonalBest: res?.isNewPersonalBest
          });
        }
      } else if (event.data.type === 'FIRESTORM_SAVE_PLAYLIST') {
        const { name, tracks } = event.data;
        const activeUser = currentUser || getCurrentUser();
        if (Array.isArray(tracks)) {
          saveUserPlaylist(name || 'Operative Combat Playlist', tracks, activeUser);
          playTacticalSound('success');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser, playTacticalSound]);

  // Auto-dismiss High Score Notification
  useEffect(() => {
    if (!highScoreNotification) return;
    const timer = setTimeout(() => {
      setHighScoreNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [highScoreNotification]);

  // Keyboard Shortcuts (Esc to close drawer)
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

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    playTacticalSound('click');
  };

  const handleLaunchGameFromScores = (stationId: string) => {
    setActiveTab('stations');
    setActiveStationId(stationId);
    playTacticalSound('switch');
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

  // -------------------------------------------------------------
  // VIEW A: MAIN LANDING & AUTH PAGE (UNAUTHENTICATED / UNVERIFIED)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <AuthLandingView
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('stations');
        }}
        playTacticalSound={playTacticalSound}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW B: AUTHENTICATED & VERIFIED TOURNAMENT ARENA
  // -------------------------------------------------------------
  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  return (
    <div className="flex-1 flex flex-col h-full min-h-screen bg-[#060709] text-zinc-100 selection:bg-[#ff4400] selection:text-black font-sans relative overflow-x-hidden tactical-grid">
      {/* Ambience */}
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
                  ALL SECTORS
                </span>
              </div>
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-zinc-800" />

            {/* Firestorm Tournaments Main Title */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('stations')}>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black shadow-[0_0_16px_rgba(255,85,0,0.4)]">
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
                </div>
              </div>
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#0e121a] p-1 rounded-xl border border-zinc-800">
            <button
              id="header-nav-tab-stations"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('stations');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stations'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>ARENA STATIONS</span>
            </button>

            <button
              id="header-nav-tab-high-scores"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('high-scores');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'high-scores'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>HIGH SCORES</span>
            </button>

            <button
              id="header-nav-tab-intel-posts"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('intel-posts');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'intel-posts'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>INTEL COMMS</span>
            </button>
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
              className="p-2 rounded bg-[#121620] hover:bg-[#1a2130] text-orange-400 border border-zinc-700/80 transition-colors cursor-pointer"
              title={sfxEnabled ? 'SFX Active' : 'SFX Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
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
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              setIsMenuOpen(false);
              playTacticalSound('menu');
            }}
          />

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
                      FIRESTORM DIRECTORY
                    </h2>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-orange-950 border border-orange-500/50 text-orange-400">
                      INDEX // 05
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Battle stations, leaderboards, and tactical comms
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
                className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
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

            {/* Navigation Drawer Sections */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 relative z-10">
              
              {/* Quick Navigation Sections */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PRIMARY SECTORS
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="drawer-nav-high-scores"
                    onClick={() => {
                      playTacticalSound('switch');
                      setActiveTab('high-scores');
                      setIsMenuOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'high-scores'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold font-mono">HIGH SCORES</div>
                      <div className="text-[10px] text-zinc-500">Hall of Champions</div>
                    </div>
                  </button>

                  <button
                    id="drawer-nav-intel-posts"
                    onClick={() => {
                      playTacticalSound('switch');
                      setActiveTab('intel-posts');
                      setIsMenuOpen(false);
                    }}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'intel-posts'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold font-mono">INTEL COMMS</div>
                      <div className="text-[10px] text-zinc-500">Public CoD/FN Feeds</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* List of Battle Stations */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>ARENA BATTLE STATIONS</span>
                  <span className="text-[10px] text-orange-400 font-mono">3 SITES</span>
                </div>

                {STATIONS.map((station) => {
                  const Icon = station.icon;
                  const isSelected = activeTab === 'stations' && station.id === activeStationId;

                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-3.5 transition-all ${
                        isSelected
                          ? 'bg-[#131926] border-orange-500 shadow-[0_0_20px_rgba(255,85,0,0.2)]'
                          : 'bg-[#0c0f17] hover:bg-[#10141f] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
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
                        <div className={`p-2 rounded border ${station.accentBg} ${station.borderAccent} ${station.themeColor} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-mono font-bold text-sm text-white tracking-tight">
                            {station.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-sans mt-0.5 line-clamp-2">
                            {station.briefing}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-zinc-800/80">
                        <button
                          id={`deploy-${station.id}-btn`}
                          type="button"
                          onClick={() => {
                            setActiveTab('stations');
                            setActiveStationId(station.id);
                            setIsMenuOpen(false);
                            playTacticalSound('switch');
                          }}
                          className={`w-full py-2 px-3 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                          }`}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'CURRENTLY ACTIVE' : 'DEPLOY BATTLE STATION'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tactical Comms Outbox button */}
              <div className="pt-2 border-t border-zinc-800">
                <button
                  id="drawer-open-outbox-btn"
                  onClick={() => {
                    setOutboxEmails(getEmailOutbox());
                    setIsOutboxOpen(true);
                    playTacticalSound('click');
                  }}
                  className="w-full p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs font-mono text-zinc-300 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <span>Tactical Comms Verification Outbox</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-950 text-orange-400 font-bold">
                    {outboxEmails.length}
                  </span>
                </button>
              </div>
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
                className="text-orange-400 hover:underline font-bold cursor-pointer"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Comms Outbox Drawer (When Opened) */}
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
                    Simulated email dispatcher for verification &amp; recovery
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
                  No dispatched transmissions.
                </div>
              ) : (
                outboxEmails.map((em) => (
                  <div
                    key={em.id}
                    className="p-3.5 rounded-lg border border-zinc-800 bg-[#0d1017] space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-orange-400 font-bold px-1.5 py-0.2 rounded bg-orange-950 border border-orange-500/40">
                        {em.type}
                      </span>
                      <span className="text-zinc-500">{new Date(em.sentAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-200">{em.subject}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">TO: {em.to}</div>
                    <div className="p-2 rounded bg-black/60 border border-zinc-800 font-mono text-xs text-orange-300">
                      CODE: <strong className="text-base text-white tracking-widest">{em.code}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-[#0c0f17] flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>LOCAL DISPATCH LOGS</span>
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

      {/* Main Views Container */}
      {activeTab === 'stations' && (
        <>
          {/* Tactical Sub-Navbar: Station Quick Switcher & Controls */}
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

              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10141e] border border-zinc-800 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-bold tracking-wider uppercase">{activeStation.status}</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Battle Station Viewport */}
          <main className="flex-1 flex flex-col p-2 sm:p-4 max-w-[1700px] w-full mx-auto relative z-10">
            <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-[#080a0f] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-all relative min-h-[720px] h-[calc(100vh-145px)]">
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

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-bold">{activeStation.status}</span>
                </div>
              </div>

              {/* Interactive Battle Station Frame Viewport */}
              <div className="flex-1 relative w-full h-full bg-black">
                <div className="absolute top-2 left-2 z-20 pointer-events-none w-4 h-4 border-t-2 border-l-2 border-orange-500/60" />
                <div className="absolute top-2 right-2 z-20 pointer-events-none w-4 h-4 border-t-2 border-r-2 border-orange-500/60" />
                <div className="absolute bottom-2 left-2 z-20 pointer-events-none w-4 h-4 border-b-2 border-l-2 border-orange-500/60" />
                <div className="absolute bottom-2 right-2 z-20 pointer-events-none w-4 h-4 border-b-2 border-r-2 border-orange-500/60" />

                <iframe
                  key={activeStation.id}
                  src={activeStation.url}
                  title={activeStation.name}
                  className="w-full h-full border-0 relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
                  allowFullScreen
                />
              </div>
            </div>
          </main>
        </>
      )}

      {/* HIGH SCORES VIEW */}
      {activeTab === 'high-scores' && (
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto relative z-10">
          <HighScoresView
            currentUser={currentUser}
            onLaunchGame={handleLaunchGameFromScores}
            playTacticalSound={playTacticalSound}
          />
        </main>
      )}

      {/* INTEL & PUBLIC POSTS VIEW */}
      {activeTab === 'intel-posts' && (
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto relative z-10">
          <IntelPostsView
            currentUser={currentUser}
            playTacticalSound={playTacticalSound}
          />
        </main>
      )}

      {/* Bottom Tournament Ticker */}
      <footer className="border-t border-zinc-850 bg-[#08090d] px-4 py-1.5 shrink-0 relative z-20 text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-zinc-400 font-bold">FIRESTORM TOURNAMENTS</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">
            OPERATIVE {currentUser.callsign} &bull; CLEARANCE LEVEL 1 &bull; GITHUB PAGES PERSISTENCE
          </span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 text-[10px]">
          <span>FORTNITE &amp; WARZONE HUD</span>
          <span className="text-zinc-700">|</span>
          <span className="text-orange-400 font-bold">v4.5 PRO</span>
        </div>
      </footer>

      {/* High Score Recorded HUD Notification Toast */}
      <AnimatePresence>
        {highScoreNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-12 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-zinc-950/95 border-2 border-emerald-500/80 rounded-xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-md text-white font-mono"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    High Score Recorded
                  </span>
                  {highScoreNotification.isNewPersonalBest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/50">
                      New Personal Best! 🔥
                    </span>
                  )}
                </div>
                <p className="text-sm font-sans font-bold text-zinc-100 mt-1">
                  Your current high score has been posted to the High Scores page!
                </p>
                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                  <span className="text-emerald-300 font-bold font-mono text-sm">
                    {highScoreNotification.score.toLocaleString()} PTS
                  </span>
                  <span>&bull;</span>
                  <span className="truncate text-zinc-300">{highScoreNotification.gameName}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('high-scores');
                      setHighScoreNotification(null);
                      playTacticalSound('switch');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>View High Scores Leaderboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighScoreNotification(null)}
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHighScoreNotification(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
