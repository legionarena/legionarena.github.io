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
  Play,
  Mail,
  Inbox,
  Sparkles,
  Info,
  ExternalLink,
  Cpu,
  Gamepad2,
  Music,
  Zap,
  User as UserIcon,
  CheckCircle2,
  Boxes,
  RotateCcw
} from 'lucide-react';
import { User, DispatchedEmail } from '@/lib/types';
import {
  getCurrentUser,
  logoutUser,
  saveGameHighScore,
  saveUserPlaylist,
  getEmailOutbox,
  saveRpgGameData,
  getRpgGameData
} from '@/lib/db';
import AuthLandingView from '@/components/AuthLandingView';
import HighScoresView from '@/components/HighScoresView';
import IntelPostsView from '@/components/IntelPostsView';

interface StationInfo {
  id: string;
  name: string;
  url: string;
  icon: typeof Radio;
  tag: string;
  category: string;
  themeColor: string;
  accentBg: string;
  borderAccent: string;
  badgeClass: string;
  description: string;
  status: string;
}

const STATIONS: StationInfo[] = [
  {
    id: 'rpg-game',
    name: 'Realm of Champions 3D',
    url: '/rpg-game.html',
    icon: Sparkles,
    tag: '3D RPG',
    category: 'Action RPG Arena (256x256)',
    themeColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    borderAccent: 'border-amber-500/30',
    badgeClass: 'bg-amber-900/60 text-amber-200 border-amber-500/40',
    description: '3D third-person RPG. Choose Melee or Caster, equip 8-slot gear, spend essence on permanent stats, and slay 256 enemies to summon the Boss.',
    status: 'ONLINE'
  },
  {
    id: 'block-drop',
    name: 'Block Drop Matrix',
    url: '/block-drop.html',
    icon: Boxes,
    tag: 'PUZZLE',
    category: 'Scalable 5-Block Matrix',
    themeColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-900/60 text-cyan-200 border-cyan-500/40',
    description: 'Dynamic scalable arena with 5-block pentominoes, level acceleration, compact controls, and shape-specific colors.',
    status: 'ONLINE'
  },
  {
    id: 'code-pressed',
    name: 'Reaction Challenge',
    url: '/code-pressed.html',
    icon: Swords,
    tag: 'ARCADE',
    category: 'Reaction Dodger',
    themeColor: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    borderAccent: 'border-orange-500/30',
    badgeClass: 'bg-orange-900/60 text-orange-200 border-orange-500/40',
    description: 'Fast-paced arcade dodge challenge. Avoid hazards, build score multipliers, and post records.',
    status: 'ACTIVE'
  },
  {
    id: 'slots-up',
    name: 'Supply Grid',
    url: '/slots-up.html',
    icon: Dices,
    tag: 'MATCH-3',
    category: '7x7 Emoji Match',
    themeColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    borderAccent: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40',
    description: '7x7 emoji match puzzle and jackpot roller with instant leaderboard sync.',
    status: 'READY'
  },
  {
    id: 'music-search',
    name: 'Music Player',
    url: '/music-search.html',
    icon: Music,
    tag: 'AUDIO',
    category: 'Media & Playlists',
    themeColor: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    borderAccent: 'border-blue-500/30',
    badgeClass: 'bg-blue-900/60 text-blue-200 border-blue-500/40',
    description: 'Search YouTube media, build custom gaming playlists, and stream background tracks.',
    status: 'ONLINE'
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
  const [activeStationId, setActiveStationId] = useState<string>('block-drop');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isGeminiInfoOpen, setIsGeminiInfoOpen] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [ping, setPing] = useState<number>(24);
  const [isOutboxOpen, setIsOutboxOpen] = useState<boolean>(false);
  const [gameVersionKey, setGameVersionKey] = useState<number>(() => Date.now());
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
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'menu') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'launch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'alert') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.setValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }, [sfxEnabled]);

  // Sync Ping simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(18 + Math.random() * 10));
    }, 5000);
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
          // High score notifications disabled for rpg-game and slots-up as requested
          if (gameId !== 'rpg-game' && gameId !== 'slots-up') {
            setHighScoreNotification({
              id: Date.now().toString(),
              gameId,
              gameName: gameId === 'block-drop' ? 'Block Drop Matrix' : gameId === 'code-pressed' ? 'Reaction Challenge' : 'Supply Grid',
              score,
              details,
              isNewPersonalBest: res?.isNewPersonalBest
            });
          }
        }
      } else if (event.data.type === 'FIRESTORM_SAVE_RPG_DATA') {
        const { saveData } = event.data;
        if (saveData && saveData.userId) {
          saveRpgGameData(saveData);
        }
      } else if (event.data.type === 'FIRESTORM_REQUEST_INIT') {
        const activeUser = currentUser || getCurrentUser();
        const existingData = activeUser ? getRpgGameData(activeUser.id) : null;
        try {
          (event.source as WindowProxy)?.postMessage({
            type: 'FIRESTORM_INIT_RESPONSE',
            user: activeUser ? {
              id: activeUser.id,
              callsign: activeUser.callsign,
              rating: activeUser.rating
            } : null,
            rpgData: existingData
          }, '*');
        } catch {}
      } else if (event.data.type === 'FIRESTORM_SAVE_PLAYLIST') {
        const { name, tracks } = event.data;
        const activeUser = currentUser || getCurrentUser();
        if (Array.isArray(tracks)) {
          saveUserPlaylist(name || 'My Gaming Playlist', tracks, activeUser);
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
    }, 6000);
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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Loading Firestorm...</span>
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
  // VIEW B: AUTHENTICATED GAMING HUB
  // -------------------------------------------------------------
  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];

  return (
    <div className="flex-1 flex flex-col h-full min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white font-sans relative overflow-x-hidden modern-grid-pattern">
      {/* Soft Ambient Background Highlights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-0 right-1/4 w-[450px] h-[280px] bg-orange-600/10 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Made with Google Gemini AI Studio Disclaimer (VERY TOP) */}
      <div
        id="top-gemini-banner"
        className="relative z-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-700/50 px-4 py-2 text-xs font-sans text-slate-100 flex flex-wrap items-center justify-between gap-2 shadow-md"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/30 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="font-semibold text-white">
              Made with Google Gemini AI Studio
            </span>
            <span className="hidden sm:inline-block text-blue-200">
              &bull; Full-Stack React &amp; TypeScript Platform
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="top-specs-modal-btn"
              type="button"
              onClick={() => {
                setIsGeminiInfoOpen(true);
                playTacticalSound('click');
              }}
              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>System Specs</span>
            </button>
            <a
              id="top-ai-studio-link"
              href="https://ai.studio/build"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Header */}
      <header className="relative z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Left Hamburger Trigger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              id="firestorm-hamburger-btn"
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                playTacticalSound('menu');
              }}
              aria-expanded={isMenuOpen}
              aria-label="Open Navigation Menu"
              className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer ${
                isMenuOpen
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4 text-blue-400" />
              )}
              <span>{isMenuOpen ? 'Close Menu' : 'All Games'}</span>
            </button>

            {/* Firestorm Tournaments Main Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('stations')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white leading-none">
                    Firestorm
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Live Season
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase leading-tight">
                  Tournaments
                </span>
              </div>
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="header-nav-tab-stations"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('stations');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stations'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Games</span>
            </button>

            <button
              id="header-nav-tab-high-scores"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('high-scores');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'high-scores'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>High Scores</span>
            </button>

            <button
              id="header-nav-tab-intel-posts"
              onClick={() => {
                playTacticalSound('switch');
                setActiveTab('intel-posts');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'intel-posts'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Community Posts</span>
            </button>
          </div>

          {/* Player Profile & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Player Profile Card */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.callsign.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none hidden sm:flex">
                <span className="font-bold text-white text-sm">{currentUser.callsign}</span>
                <span className="text-xs text-blue-400">{currentUser.id}</span>
              </div>
            </div>

            {/* Live Server Ping */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{ping}ms</span>
            </div>

            {/* Sound Toggle */}
            <button
              id="sound-toggle-btn"
              type="button"
              onClick={() => {
                setSfxEnabled(!sfxEnabled);
                if (!sfxEnabled) playTacticalSound('click');
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title={sfxEnabled ? 'Sound On' : 'Sound Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Log Out Button */}
            <button
              id="firestorm-logout-btn"
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-500/50 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Over Navigation Drawer (OPENS ON THE LEFT) */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-0 z-50 flex justify-start bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl h-full overflow-hidden relative animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Game Directory
                  </h2>
                  <p className="text-xs text-slate-400">
                    Play games, leaderboards &amp; community
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Menu (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Player Info Strip */}
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Player: {currentUser.callsign} ({currentUser.id})</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Verified
              </span>
            </div>

            {/* Navigation Drawer Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              
              {/* Quick Navigation Cards */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Main Views
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="drawer-nav-high-scores"
                    onClick={() => {
                      playTacticalSound('switch');
                      setActiveTab('high-scores');
                      setIsMenuOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeTab === 'high-scores'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-200 font-bold'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <Trophy className="w-5 h-5 text-orange-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold">High Scores</div>
                      <div className="text-xs text-slate-400">Leaderboards</div>
                    </div>
                  </button>

                  <button
                    id="drawer-nav-intel-posts"
                    onClick={() => {
                      playTacticalSound('switch');
                      setActiveTab('intel-posts');
                      setIsMenuOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      activeTab === 'intel-posts'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 font-bold'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold">Community</div>
                      <div className="text-xs text-slate-400">Posts &amp; Tips</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* List of Game Stations */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Available Games</span>
                  <span className="text-xs text-blue-400 font-semibold">4 Games</span>
                </div>

                {STATIONS.map((station) => {
                  const Icon = station.icon;
                  const isSelected = activeTab === 'stations' && station.id === activeStationId;

                  return (
                    <div
                      key={station.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 shadow-md'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30">
                          {station.tag}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {station.status}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl border ${station.accentBg} ${station.borderAccent} ${station.themeColor} shrink-0 mt-0.5`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-white">
                            {station.name}
                          </h3>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {station.description}
                          </p>
                        </div>
                      </div>

                      <button
                        id={`deploy-${station.id}-btn`}
                        type="button"
                        onClick={() => {
                          setActiveTab('stations');
                          setActiveStationId(station.id);
                          setIsMenuOpen(false);
                          playTacticalSound('switch');
                        }}
                        className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-750 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isSelected ? 'Currently Playing' : 'Play Now'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Email Outbox quick link */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <button
                  id="drawer-open-outbox-btn"
                  onClick={() => {
                    setOutboxEmails(getEmailOutbox());
                    setIsOutboxOpen(true);
                    playTacticalSound('click');
                  }}
                  className="w-full p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center justify-between text-xs text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">Email Verification Outbox</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 font-bold border border-blue-500/30">
                    {outboxEmails.length}
                  </span>
                </button>

                {/* Gemini AI Studio Card */}
                <div className="p-4 rounded-xl border border-blue-700/40 bg-gradient-to-br from-blue-950/40 to-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Built with Gemini AI Studio</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold">
                      Google DeepMind
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated full-stack tournament application created with Gemini AI Studio Build, Next.js 15, TypeScript, and durable storage.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGeminiInfoOpen(true);
                        setIsMenuOpen(false);
                        playTacticalSound('click');
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>System Specs</span>
                    </button>
                    <a
                      href="https://ai.studio/build"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Build</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Firestorm Tournament Hub</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  playTacticalSound('menu');
                }}
                className="text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </div>

          {/* Clickable Backdrop on the RIGHT to dismiss drawer */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              setIsMenuOpen(false);
              playTacticalSound('menu');
            }}
          />
        </div>
      )}

      {/* Email Outbox Modal Dialog */}
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
                    Dispatched verification and recovery codes
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

      {/* Main Views Container */}
      {activeTab === 'stations' && (
        <>
          {/* Sub-Navbar: Game Quick Switcher */}
          <nav className="relative z-20 border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-2.5 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
                  Games:
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
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{station.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeStation.status}</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Game Viewport */}
          <main className="flex-1 flex flex-col p-3 sm:p-6 max-w-7xl w-full mx-auto relative z-10">
            <div className="flex-1 flex flex-col rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl relative min-h-[500px] h-[calc(100vh-210px)]">
              {/* Game Viewport Header Bar */}
              <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-850 border-b border-slate-800 text-sm text-slate-300 shrink-0 gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-white text-base">{activeStation.name}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-400 text-xs hidden sm:inline">{activeStation.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden lg:inline mr-2">{activeStation.description}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGameVersionKey(Date.now());
                      playTacticalSound('click');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Reload game frame to get newest version"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Reload Station</span>
                  </button>
                  <a
                    href={activeStation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                    title="Open game in full tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                </div>
              </div>

              {/* Interactive Game Frame Viewport */}
              <div className="flex-1 relative w-full h-full bg-slate-950">
                <iframe
                  key={`${activeStation.id}-${gameVersionKey}`}
                  src={`${activeStation.url}?v=${gameVersionKey}`}
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

      {/* COMMUNITY POSTS VIEW */}
      {activeTab === 'intel-posts' && (
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto relative z-10">
          <IntelPostsView
            currentUser={currentUser}
            playTacticalSound={playTacticalSound}
          />
        </main>
      )}

      {/* Bottom Footer & Gemini Attribution */}
      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-3 shrink-0 relative z-20 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white font-bold">Firestorm Tournaments</span>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() => {
              setIsGeminiInfoOpen(true);
              playTacticalSound('click');
            }}
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Created with Google Gemini AI Studio (ai.studio/build)</span>
          </button>
          <span className="text-slate-600">|</span>
          <span>Player: {currentUser.callsign}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span>Google DeepMind Gemini</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-semibold">Live System</span>
        </div>
      </footer>

      {/* High Score Recorded Toast Notification */}
      <AnimatePresence>
        {highScoreNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-12 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white font-sans"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                    High Score
                  </span>
                  {highScoreNotification.isNewPersonalBest && (
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-300 bg-orange-950 px-2 py-0.5 rounded border border-orange-500/40">
                      Personal Best! 🔥
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  Your high score has been saved to the leaderboard!
                </p>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-sm">
                    {highScoreNotification.score.toLocaleString()} Points
                  </span>
                  <span>&bull;</span>
                  <span className="truncate text-slate-300">{highScoreNotification.gameName}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('high-scores');
                      setHighScoreNotification(null);
                      playTacticalSound('switch');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    View Scores
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighScoreNotification(null)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHighScoreNotification(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Gemini AI Studio Information Modal Dialog */}
      {isGeminiInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Google Gemini AI Studio System Architecture"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 font-sans"
        >
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => {
              setIsGeminiInfoOpen(false);
              playTacticalSound('click');
            }}
          />
          <div className="relative z-10 w-full max-w-2xl bg-slate-900 border-2 border-blue-500/60 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">
                      Google Gemini AI Studio
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-cyan-300 text-xs font-bold">
                      Platform Spec
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Architecture and system capabilities generated via Google AI Studio Build
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGeminiInfoOpen(false);
                  playTacticalSound('click');
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              {/* Studio Overview */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-700/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Platform &amp; Model</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">
                  This entire application was prompted, designed, and built within <strong>Google AI Studio Build</strong> (
                  <a href="https://ai.studio/build" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    https://ai.studio/build
                  </a>
                  ), utilizing <strong>Google DeepMind Gemini reasoning models</strong>.
                </p>
              </div>

              {/* Core Features Specification */}
              <div className="space-y-2">
                <div className="font-bold text-slate-400 uppercase tracking-wider text-xs">
                  Implemented Features
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="text-blue-400 font-bold text-sm mb-1">🎮 Autoscaling Games</div>
                    <div className="text-slate-300 leading-relaxed">
                      Embedded arcade dodger, 7x7 emoji puzzle matrix, and music search console scaling seamlessly to all viewports.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="text-orange-400 font-bold text-sm mb-1">🏆 Verified Leaderboards</div>
                    <div className="text-slate-300 leading-relaxed">
                      Enforces strictly 1 high score record per player per game, updating personal best records automatically.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="text-emerald-400 font-bold text-sm mb-1">💬 Community Posts</div>
                    <div className="text-slate-300 leading-relaxed">
                      Full-featured community discussions with image attachment encoding, 1-post-per-thread limit, and live reactions.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                    <div className="text-purple-400 font-bold text-sm mb-1">🛡️ Player Accounts</div>
                    <div className="text-slate-300 leading-relaxed">
                      Player ID generation, secure password hashing, simulated email verification outbox, and password recovery.
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Stack Specs */}
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 text-xs">
                <div className="text-slate-400 uppercase tracking-wider font-bold">
                  Technology Stack
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div>Framework: <span className="text-blue-300 font-semibold">Next.js 15+ App Router</span></div>
                  <div>Language: <span className="text-blue-300 font-semibold">TypeScript</span></div>
                  <div>Styling: <span className="text-blue-300 font-semibold">Tailwind CSS</span></div>
                  <div>Theme: <span className="text-blue-300 font-semibold">Blue, Orange &amp; Slate</span></div>
                  <div>Audio: <span className="text-blue-300 font-semibold">Web Audio API</span></div>
                  <div>Storage: <span className="text-blue-300 font-semibold">Durable Local Storage</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href="https://ai.studio/build"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <span>AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsGeminiInfoOpen(false);
                  playTacticalSound('click');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Spec
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
