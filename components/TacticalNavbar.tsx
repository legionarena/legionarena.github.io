'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Flame, 
  ShieldAlert, 
  User as UserIcon, 
  Gamepad2, 
  ExternalLink, 
  Trophy, 
  Radio, 
  Music, 
  Swords, 
  Dices,
  ChevronRight,
  Sparkles,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { getRegisteredGames, INITIAL_GAMES, GameEntry } from '@/lib/games';

function subscribeToGames(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function TacticalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const games: GameEntry[] = React.useSyncExternalStore(
    subscribeToGames,
    getRegisteredGames,
    () => INITIAL_GAMES
  );
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const pathname = usePathname();

  // Close menu on route change or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getGameIcon = (id: string) => {
    if (id.includes('music')) return <Music className="w-4 h-4 text-cyan-400" />;
    if (id.includes('code') || id.includes('press') || id.includes('fruit')) return <Swords className="w-4 h-4 text-amber-400" />;
    if (id.includes('slot')) return <Dices className="w-4 h-4 text-emerald-400" />;
    return <Gamepad2 className="w-4 h-4 text-orange-400" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#090d14]/90 backdrop-blur-md border-b border-orange-500/20 shadow-lg shadow-black/60">
        {/* Top Ticker / Season Status Line */}
        <div className="bg-gradient-to-r from-orange-950/60 via-zinc-900 to-black px-4 py-1 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 tracking-wider">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              LIVE TOURNAMENTS
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-300">SEASON 04: WARZONE IGNITION</span>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              SERVERS: OPTIMAL (14MS)
            </span>
            <span className="hidden md:inline text-zinc-500">REGION: US-EAST</span>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Header */}
          <Link href="/" className="group flex items-center gap-3 text-left focus:outline-none">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-600 via-red-600 to-amber-500 p-0.5 tactical-cut flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f17] tactical-cut flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500 group-hover:text-amber-400 transition-colors animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase font-mono text-white group-hover:text-orange-400 transition-colors drop-shadow-[0_2px_12px_rgba(255,69,0,0.5)]">
                  FIRESTORM
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-orange-500/20 text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded font-mono">
                  PRO
                </span>
              </div>
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-orange-400/90 uppercase flex items-center gap-1.5">
                <span>TOURNAMENTS</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-400">BATTLE ARENA</span>
              </div>
            </div>
          </Link>

          {/* Center Quick Nav Pills (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#121924]/80 p-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Lobby
            </Link>

            <Link
              href="/gamemaster"
              className={`px-3 py-1.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 ${
                pathname === '/gamemaster'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Gamemaster
            </Link>

            <Link
              href="/user"
              className={`px-3 py-1.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 ${
                pathname === '/user'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-sky-400" />
              Player Dossier
            </Link>
          </nav>

          {/* Right Actions & Hamburger Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Game Direct Links Dropdown / Pill */}
            <div className="hidden sm:flex items-center gap-1.5">
              <a
                href="/music-search.html"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-[#121a24] hover:bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 rounded text-xs font-mono font-bold uppercase flex items-center gap-1 transition-all"
                title="Launch Music & Video Search HTML"
              >
                <Music className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Music Search</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href="/code-pressed.html"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-[#121a24] hover:bg-amber-950/60 text-amber-400 border border-amber-500/30 hover:border-amber-400 rounded text-xs font-mono font-bold uppercase flex items-center gap-1 transition-all"
                title="Launch Cold Pressed 2D Arcade HTML"
              >
                <Swords className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Cold Pressed</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href="/slots-up.html"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 bg-[#121a24] hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 rounded text-xs font-mono font-bold uppercase flex items-center gap-1 transition-all"
                title="Launch 7x7 Emoji Slots HTML"
              >
                <Dices className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">7x7 Slots</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>

            {/* Tactical Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Tactical Navigation Menu"
              className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider rounded border border-orange-400/40 shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 flex items-center gap-2 transition-all active:scale-95"
            >
              {isOpen ? (
                <>
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="hidden xs:inline">CLOSE</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="font-bold">MENU</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Out Hamburger Navigation Drawer & Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
          />

          {/* Drawer Container */}
          <aside className="relative w-full max-w-md bg-[#0d121a] border-l-2 border-orange-500/40 h-full overflow-y-auto shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div>
              <div className="p-5 bg-[#090d14] border-b border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-600/20 border border-orange-500/50 rounded flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black italic tracking-tight font-mono text-white">
                      FIRESTORM
                    </h2>
                    <p className="text-[11px] font-mono text-orange-400 tracking-wider">
                      COMMAND NAVIGATION
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded border border-zinc-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Operative Quick Badge */}
              <div className="p-4 m-4 bg-[#131b26] border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span className="text-orange-400 font-bold flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    OPERATIVE STATUS
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                    ACTIVE SQUAD
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black font-mono text-sm border-2 border-white/20">
                    FS
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-mono">OPERATOR_FIRESTORM</div>
                    <div className="text-xs text-zinc-400 font-mono">Rank: Commander • Level 84</div>
                  </div>
                </div>
              </div>

              {/* Primary Pages Section */}
              <div className="px-4 py-2">
                <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-400" />
                  Command Center
                </div>

                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg font-mono text-sm font-bold transition-all border ${
                      pathname === '/'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                        : 'bg-[#111722] text-zinc-300 border-zinc-800/80 hover:bg-[#182130] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-4 h-4 text-orange-400" />
                      <span>Tournaments Lobby (Home)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </Link>

                  <Link
                    href="/gamemaster"
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg font-mono text-sm font-bold transition-all border ${
                      pathname === '/gamemaster'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                        : 'bg-[#111722] text-zinc-300 border-zinc-800/80 hover:bg-[#182130] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span>Gamemaster Admin Page</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono">
                      ADMIN
                    </span>
                  </Link>

                  <Link
                    href="/user"
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg font-mono text-sm font-bold transition-all border ${
                      pathname === '/user'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-[#111722] text-zinc-300 border-zinc-800/80 hover:bg-[#182130] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4 text-sky-400" />
                      <span>User & Player Dossier</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded font-mono">
                      PROFILE
                    </span>
                  </Link>
                </div>
              </div>

              {/* Mini Games Section */}
              <div className="px-4 py-3">
                <div className="text-[11px] font-mono font-bold text-orange-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Mini Games Section
                  </span>
                  <span className="text-zinc-500 text-[10px]">DIRECT HTML LINKS</span>
                </div>

                <div className="space-y-2">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="p-3 bg-[#111722] hover:bg-[#17202e] border border-zinc-800 hover:border-orange-500/40 rounded-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-zinc-900 border border-zinc-700 rounded">
                            {getGameIcon(game.id)}
                          </div>
                          <div>
                            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                              <span>{game.title}</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                                #{game.number}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {game.subtitle}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${game.statusColor}`}>
                          {game.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {game.category}
                        </span>

                        <a
                          href={game.htmlPath}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded text-[11px] font-mono font-bold uppercase flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span>Launch Game</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer & Quick Settings */}
            <div className="p-4 bg-[#090d14] border-t border-zinc-800 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400 mb-3">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Audio Synthesizer:
                </span>
                <button
                  onClick={() => setSfxEnabled(!sfxEnabled)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 text-zinc-200 flex items-center gap-1"
                >
                  {sfxEnabled ? (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-400" /> ON
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3 h-3 text-red-400" /> MUTED
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 text-center font-mono">
                FIRESTORM BATTLE ARENA &bull; VERSION 4.2.0-STABLE
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
