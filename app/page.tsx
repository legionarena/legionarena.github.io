'use client';

import React, { useState } from 'react';
import {
  Music,
  Gamepad2,
  Dices,
  ExternalLink,
  RotateCw,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  category: string;
  file: string;
  icon: React.ElementType;
  description: string;
  badge: string;
  badgeColor: string;
}

const APPS: AppItem[] = [
  {
    id: 'music-search',
    name: 'Music & Video Search',
    category: 'Media Player',
    file: '/music-search.html',
    icon: Music,
    description: 'YouTube search API discovery engine with responsive player and persistent playlist manager.',
    badge: 'YouTube Player',
    badgeColor: 'bg-red-950/60 border-red-500/30 text-red-400'
  },
  {
    id: 'code-pressed',
    name: 'Cold Pressed',
    category: 'Arcade Game',
    file: '/code-pressed.html',
    icon: Gamepad2,
    description: '2D fruit catching combat game with HTML5 Canvas physics, hazard system, and Web Audio SFX.',
    badge: 'Canvas 2D Game',
    badgeColor: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'slots-up',
    name: '7x7 Emoji Slots',
    category: 'Casino Mini-Game',
    file: '/slots-up.html',
    icon: Dices,
    description: '7x7 Tic-Tac-Toe emoji slot machine with anchor-symbol match rules, progressive bonus pot, and sound.',
    badge: '7x7 Reel Slots',
    badgeColor: 'bg-amber-950/60 border-amber-500/30 text-amber-400'
  }
];

export default function HomePage() {
  const [activeAppId, setActiveAppId] = useState<string>('music-search');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeApp = APPS.find((a) => a.id === activeAppId) || APPS[0];

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 min-h-screen">
      {/* Top Header Bar */}
      <header className="border-b border-zinc-800/80 bg-[#0f0f12] px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-white tracking-wide font-mono uppercase">
                  Standalone Web Apps
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {APPS.length} Apps
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Single-file HTML web applications ready to run and view in Chrome
              </p>
            </div>
          </div>

          {/* Direct External Links */}
          <div className="flex items-center gap-2">
            <a
              id="open-active-app-btn"
              href={activeApp.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-200 transition-colors shadow-sm"
              title="Open currently selected app directly in a full new Chrome tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Open in New Tab</span>
            </a>
            <button
              id="reload-frame-btn"
              type="button"
              onClick={handleReload}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Reload frame"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              id="toggle-fullscreen-btn"
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* App Selector Navigation Tabs */}
      <nav className="border-b border-zinc-800 bg-[#121216] px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {APPS.map((app) => {
            const Icon = app.icon;
            const isActive = app.id === activeAppId;
            return (
              <button
                key={app.id}
                id={`tab-${app.id}`}
                type="button"
                onClick={() => setActiveAppId(app.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-mono text-xs transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-orange-500/50 shadow-sm shadow-orange-500/10 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                <span>{app.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${app.badgeColor}`}>
                  {app.badge}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main App Frame Viewport */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 max-w-7xl w-full mx-auto">
        <div
          className={`flex-1 flex flex-col rounded-lg border border-zinc-800 bg-[#0d0d10] overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-2 z-50 rounded-none' : 'min-h-[700px] h-[calc(100vh-140px)]'
          }`}
        >
          {/* Subheader info bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-200 font-semibold">{activeApp.name}</span>
              <span className="text-zinc-500 hidden sm:inline">&mdash; {activeApp.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {activeApp.file}
              </code>
              <a
                href={activeApp.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1"
              >
                <span>Direct File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* The Live Sandboxed HTML Frame */}
          <div className="flex-1 relative w-full h-full bg-black">
            <iframe
              key={`${activeApp.id}-${reloadKey}`}
              src={activeApp.file}
              title={activeApp.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
              allowFullScreen
            />
          </div>
        </div>
      </main>
    </div>
  );
}
