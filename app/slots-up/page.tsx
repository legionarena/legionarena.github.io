'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Dices, ArrowLeft, ExternalLink, Code2, CheckCircle2 } from 'lucide-react';

export default function SlotsUpPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-[#ff3c00] selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Module Header */}
        <div className="p-6 sm:p-8 rounded border border-zinc-800 bg-[#0e0e0e] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ff3c00]/10 border border-[#ff3c00]/30 text-[#ff3c00] text-xs font-mono font-bold uppercase tracking-widest">
                <Dices className="w-3.5 h-3.5" />
                <span>Single-File HTML Application</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">
                7x7 Emoji Slots
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl">
                Standalone 7x7 Tic-Tac-Toe slot machine with first-item anchor rules, progressive bonus pot, and procedural Web Audio SFX.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/slots-up.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#ff3c00] hover:bg-white text-black font-bold uppercase tracking-tight text-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Raw Standalone HTML</span>
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#141414] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-tight text-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Hub</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800 text-xs font-mono">
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-zinc-500 uppercase">Target HTML File</div>
              <div className="text-orange-400 font-bold mt-1">public/slots-up.html</div>
            </div>
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-zinc-500 uppercase">App Route</div>
              <div className="text-emerald-400 font-bold mt-1">/slots-up</div>
            </div>
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-zinc-500 uppercase">Deployment Ready</div>
              <div className="text-blue-400 font-bold mt-1">Static Export & Pages</div>
            </div>
          </div>
        </div>

        {/* Live Container / Preview Window */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#ff3c00]" />
              <span>Live Standalone App Interface: <code className="text-zinc-200">/public/slots-up.html</code></span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Standalone HTML Game
            </span>
          </div>

          <div className="w-full h-[850px] rounded border border-zinc-800 overflow-hidden bg-[#0f172a] shadow-2xl relative">
            <iframe
              src="/slots-up.html"
              title="Slots Up Standalone Application"
              className="w-full h-full border-0"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
