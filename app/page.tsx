'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import EmailInboxDrawer from '@/components/EmailSimulator/EmailInboxDrawer';
import DatabaseModal from '@/components/DatabaseViewer/DatabaseModal';
import { useAuth } from '@/lib/AuthContext';
import { 
  Crown, 
  Users, 
  UserPlus, 
  Music, 
  Code, 
  Dices, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  Mail, 
  ExternalLink,
  Lock,
  Flame,
  CheckCircle2,
  FileCode2
} from 'lucide-react';

export default function HomePage() {
  const { usersList, currentUser, isMounted, openEmailDrawer, setDbModalOpen } = useAuth();

  const primaryModules = [
    {
      title: 'Gamemaster Page',
      badge: 'Admin Access',
      badgeColor: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
      description: 'Administrative command center. Inspect all generated 12-digit UIDs, override verification and MFA statuses, impersonate user sessions, and stream live system audit logs.',
      href: '/gamemaster',
      icon: Crown,
      cta: 'Launch Gamemaster Admin',
      features: ['Full DB Record Registry', '12-Digit UID Management', 'Live Security Audit Trail', 'Instant Impersonation']
    },
    {
      title: 'Member Portal',
      badge: 'Sign In & Profile',
      badgeColor: 'bg-blue-950/80 border-blue-500/40 text-blue-400',
      description: 'Secure member interface. Sign in with existing credentials, perform multi-factor authentication, inspect your 12-digit UID, and manage verification badges.',
      href: '/member',
      icon: Users,
      cta: 'Access Member Page',
      features: ['Credential Authentication', 'TOTP MFA Verification', 'Security Health Score', 'Profile & Password Management']
    },
    {
      title: 'Sign Up',
      badge: 'New Registration',
      badgeColor: 'bg-[#ff3c00]/10 border-[#ff3c00]/30 text-[#ff3c00]',
      description: 'Provision new identities. Generates an automated 12-digit alphanumeric user ID and dispatches a simulated welcome verification email with 6-digit confirmation code.',
      href: '/signup',
      icon: UserPlus,
      cta: 'Create New Account',
      features: ['12-Digit Alphanumeric UID', 'Real-Time Strength Meter', 'Automated Welcome Email', 'Instant Sandbox Dispatch']
    }
  ];

  const standaloneModules = [
    {
      title: 'Music & Video Search',
      tag: 'YouTube Search & Playlist',
      description: 'Search YouTube videos, build and manage custom playlists, and stream with the integrated YouTube player engine.',
      href: '/music-search',
      rawHtml: '/music-search.html',
      icon: Music,
      accent: 'border-orange-500/40 hover:border-orange-500'
    },
    {
      title: 'Cold Pressed',
      tag: '2D Fruit Catcher Game',
      description: 'Standalone zero-asset 2D arcade fruit catcher game with fluid canvas rendering, progressive difficulty, and Web Audio SFX.',
      href: '/code-pressed',
      rawHtml: '/code-pressed.html',
      icon: Code,
      accent: 'border-amber-500/40 hover:border-amber-500'
    },
    {
      title: '7x7 Emoji Slots',
      tag: 'Slots & Bonus Pot',
      description: 'Dynamic 7x7 emoji slot machine featuring first-symbol anchor line evaluation, progressive jackpot bonus pot, and procedural audio.',
      href: '/slots-up',
      rawHtml: '/slots-up.html',
      icon: Dices,
      accent: 'border-red-500/40 hover:border-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-[#ff3c00] selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Main Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3c00]/10 border border-[#ff3c00]/30 text-[#ff3c00] text-xs font-mono font-bold uppercase tracking-widest">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Firestorm Identity & Portal Hub v2.4</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white font-mono leading-none">
            Architected For <span className="text-[#ff3c00]">Security</span> & Control
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Modular identity platform featuring administrative Gamemaster oversight, Member profile management with MFA, automated 12-digit UID generation, and integrated single-file HTML modules.
          </p>

          {/* Quick Hub Status */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openEmailDrawer()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#ff3c00]" />
              <span>Simulated Mailbox</span>
            </button>

            <button
              type="button"
              onClick={() => setDbModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141414] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Database Records ({isMounted ? usersList.length : 0})</span>
            </button>

            {currentUser && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Logged In: {currentUser.firstName}</span>
              </span>
            )}
          </div>
        </section>

        {/* Section 1: Primary Authentication & Administration Modules */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Primary System Workspaces</div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white font-mono">
                Authentication & Administration
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">3 Dedicated Pages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="flex flex-col justify-between p-6 rounded border border-zinc-800 bg-[#0e0e0e] hover:border-[#ff3c00]/60 transition-all shadow-xl group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded bg-[#141414] border border-zinc-700 flex items-center justify-center text-[#ff3c00] group-hover:bg-[#ff3c00] group-hover:text-black transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${module.badgeColor}`}>
                        {module.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white font-mono group-hover:text-[#ff3c00] transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                      {module.features.map((feat) => (
                        <div key={feat} className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-[#ff3c00] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <Link
                      href={module.href}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#ff3c00] hover:bg-white text-black font-bold uppercase tracking-tight text-xs transition-colors cursor-pointer"
                    >
                      <span>{module.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Standalone Single-File Applications Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Custom Standalone Endpoints</div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white font-mono">
                Single-File HTML Modules
              </h2>
            </div>
            <span className="text-xs font-mono text-[#ff3c00]">Ready for Custom Code</span>
          </div>

          <p className="text-xs text-zinc-400 max-w-2xl">
            These standalone single-file HTML pages are created and hosted in the application structure. You can drop in your custom HTML, CSS, and JS code into each dedicated file.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {standaloneModules.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.title}
                  className={`flex flex-col justify-between p-6 rounded border bg-[#0e0e0e] ${app.accent} transition-all shadow-xl group`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded bg-[#141414] border border-zinc-700 flex items-center justify-center text-[#ff3c00] group-hover:bg-[#ff3c00] group-hover:text-black transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-900 border border-zinc-700 text-zinc-400">
                        {app.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white font-mono group-hover:text-[#ff3c00] transition-colors">
                        {app.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-zinc-850 text-[11px] font-mono text-zinc-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Route:</span>
                        <code className="text-orange-400">{app.href}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>HTML File:</span>
                        <code className="text-zinc-300">public{app.rawHtml}</code>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 flex flex-col sm:flex-row items-center gap-2">
                    <Link
                      href={app.href}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#ff3c00] hover:bg-white text-black font-bold uppercase tracking-tight text-xs transition-colors"
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>View In Frame</span>
                    </Link>
                    <a
                      href={app.rawHtml}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1a1a1a] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-tight text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Raw HTML</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Global Interactive Modals */}
      <EmailInboxDrawer />
      <DatabaseModal />
    </div>
  );
}
