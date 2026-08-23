'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Flame, 
  Mail, 
  Database, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  User as UserIcon,
  Crown,
  Users,
  UserPlus,
  Compass,
  Music,
  Code,
  Dices,
  ChevronDown
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { 
    currentUser, 
    signOut, 
    unreadEmailCount, 
    openEmailDrawer, 
    setDbModalOpen, 
    usersList,
    isMounted
  } = useAuth();

  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Hub', href: '/', icon: Compass },
    { label: 'Gamemaster', href: '/gamemaster', icon: Crown, badge: 'Admin' },
    { label: 'Member Portal', href: '/member', icon: Users },
    { label: 'Sign Up', href: '/signup', icon: UserPlus },
  ];

  const appLinks = [
    { label: 'Music Search', href: '/music-search', icon: Music, desc: 'Single-file music search module' },
    { label: 'Code Pressed', href: '/code-pressed', icon: Code, desc: 'Single-file coding workspace module' },
    { label: 'Slots Up', href: '/slots-up', icon: Dices, desc: 'Single-file slots & game module' },
  ];

  return (
    <header className="w-full border-b border-zinc-800 bg-[#080808]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Main Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center w-10 h-10 rounded bg-[#ff3c00] text-black font-black p-0.5 shadow-lg shadow-[#ff3c00]/20">
              <Flame className="w-6 h-6 fill-current text-black" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#ff3c00] font-mono leading-none group-hover:text-white transition-colors">
                  FIRESTORM
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                  v2.4.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Security &bull; Gamemaster &bull; Standalone Apps
              </p>
            </div>
          </Link>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="flex items-center flex-wrap gap-1.5 bg-[#111] p-1 border border-zinc-800 rounded">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#ff3c00] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black text-[#ff3c00]' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Standalone Modules Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer ${
                pathname.startsWith('/music') || pathname.startsWith('/code') || pathname.startsWith('/slots')
                  ? 'bg-orange-950 text-orange-400 border border-orange-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-orange-500" />
              <span>Apps</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isAppsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAppsMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-[#111] border border-zinc-700 shadow-2xl p-1.5 rounded z-50 animate-fadeIn"
                onMouseLeave={() => setIsAppsMenuOpen(false)}
              >
                <div className="text-[9px] uppercase font-bold text-zinc-500 px-2 py-1 font-mono tracking-wider border-b border-zinc-800 mb-1">
                  Single-File HTML Modules
                </div>
                {appLinks.map((app) => {
                  const Icon = app.icon;
                  const isAppActive = pathname === app.href;
                  return (
                    <Link
                      key={app.href}
                      href={app.href}
                      onClick={() => setIsAppsMenuOpen(false)}
                      className={`flex items-start gap-2.5 px-2.5 py-2 rounded text-xs transition-colors cursor-pointer ${
                        isAppActive ? 'bg-[#ff3c00]/20 text-[#ff3c00]' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 text-[#ff3c00] shrink-0" />
                      <div>
                        <div className="font-bold">{app.label}</div>
                        <div className="text-[10px] text-zinc-500">{app.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center flex-wrap justify-center gap-2">
          {/* Simulated Email Inbox Drawer Trigger */}
          <button
            id="open-simulated-inbox-btn"
            type="button"
            onClick={() => openEmailDrawer()}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#111] border border-zinc-800 hover:border-[#ff3c00]/60 text-zinc-200 text-xs font-bold uppercase tracking-tight transition-colors hover:bg-zinc-850 cursor-pointer"
            title="Open Automated Email Simulator Inbox"
          >
            <Mail className="w-3.5 h-3.5 text-[#ff3c00]" />
            <span>Mailbox</span>
            {unreadEmailCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-bold text-black bg-[#ff3c00] rounded-full animate-pulse">
                {unreadEmailCount}
              </span>
            )}
          </button>

          {/* Database Inspector Trigger */}
          <button
            id="open-database-inspector-btn"
            type="button"
            onClick={() => setDbModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#111] border border-zinc-800 hover:border-[#ff3c00]/60 text-zinc-200 text-xs font-bold uppercase tracking-tight transition-colors hover:bg-zinc-850 cursor-pointer"
            title="Inspect Stored Database Records"
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>DB ({isMounted ? usersList.length : 0})</span>
          </button>

          {/* User Session status */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <Link 
                href="/member"
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-bold"
                title="View Member Dashboard"
              >
                <div className="w-6 h-6 rounded bg-[#ff3c00] text-black font-mono font-black flex items-center justify-center text-[10px]">
                  {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                </div>
                <span className="hidden sm:inline font-mono">{currentUser.id.substring(0, 8)}...</span>
              </Link>

              {currentUser.isVerified ? (
                <span title="Verified Account" className="p-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span title="Unverified Email" className="p-0.5 rounded bg-amber-950 border border-amber-500 text-amber-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </span>
              )}

              <button
                id="header-signout-btn"
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition-colors cursor-pointer"
                title="Sign out of current account"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline text-[10px] uppercase">Exit</span>
              </button>
            </div>
          ) : (
            <Link
              href="/member"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-[#111] border border-zinc-800"
            >
              <UserIcon className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] uppercase font-bold">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* AI Prototype & Security Disclaimer Banner */}
      <div className="w-full bg-[#111]/80 border-t border-zinc-850 px-4 py-1 text-center">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-1.5 font-mono">
          <Sparkles className="w-2.5 h-2.5 text-[#ff3c00] shrink-0" />
          <span>
            Automated 12-Digit UID &bull; Live Email Dispatch &bull; Gamemaster Admin &bull; Standalone HTML Modules
          </span>
        </p>
      </div>
    </header>
  );
}
