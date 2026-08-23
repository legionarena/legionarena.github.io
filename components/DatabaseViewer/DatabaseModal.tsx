'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FirestormDatabase } from '@/lib/db';
import {
  Database,
  X,
  Copy,
  Check,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Key,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function DatabaseModal() {
  const { isDbModalOpen, setDbModalOpen, refreshData, isMounted, usersList } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'emails' | 'logs' | 'raw'>('users');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [search, setSearch] = useState('');

  if (!isMounted || !isDbModalOpen) return null;

  const emails = FirestormDatabase.getStoredEmails();
  const logs = FirestormDatabase.getAuditLogs();

  const handleCopyRaw = () => {
    const fullDb = {
      users: usersList,
      emails,
      logs
    };
    navigator.clipboard.writeText(JSON.stringify(fullDb, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleDownload = () => {
    const fullDb = {
      users: usersList,
      emails,
      logs,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firestorm-db-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm('Warning: This will reset the client-side sandbox database to default initial state. Proceed?')) {
      localStorage.clear();
      refreshData();
      setDbModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Firestorm Database Inspector"
        className="w-full max-w-5xl max-h-[90vh] bg-[#0c0c0c] border border-zinc-800 text-zinc-100 rounded-lg shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#ff3c00]/10 text-[#ff3c00]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white font-mono uppercase text-sm">
                Sandbox Database Inspector
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Inspect local storage persistence schemas, 12-digit UIDs &amp; audit trails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200"
              title="Download JSON DB export"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handleCopyRaw}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'Copied' : 'Copy All'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDbModalOpen(false)}
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800 bg-[#0e0e0e] text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'users' ? 'border-[#ff3c00] text-[#ff3c00] bg-[#141414]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Users Registry ({usersList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'emails' ? 'border-[#ff3c00] text-[#ff3c00] bg-[#141414]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Outbox Messages ({emails.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'logs' ? 'border-[#ff3c00] text-[#ff3c00] bg-[#141414]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Audit Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2.5 border-b-2 font-bold transition-colors ${
              activeTab === 'raw' ? 'border-[#ff3c00] text-[#ff3c00] bg-[#141414]' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Raw JSON Document
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter users by UID, email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#141414] border border-zinc-800 text-xs text-white focus:outline-none focus:border-[#ff3c00]"
                />
              </div>

              <div className="divide-y divide-zinc-800 border border-zinc-800 rounded bg-[#101010] overflow-hidden">
                {usersList
                  .filter(u => u.id.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.firstName.toLowerCase().includes(search.toLowerCase()))
                  .map((user) => (
                    <div key={user.id} className="p-3 hover:bg-[#161616] transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#ff3c00]">{user.id}</span>
                          <span className="text-zinc-200 font-sans font-semibold">{user.firstName} {user.lastName}</span>
                          <span className="text-zinc-500 text-[11px]">({user.email})</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-3">
                          <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                          <span>Verification Code: <code className="text-amber-400">{user.verificationCode}</code></span>
                          <span>MFA: {user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.isVerified ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}>
                          {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="divide-y divide-zinc-800 border border-zinc-800 rounded bg-[#101010] overflow-hidden">
              {emails.map((msg) => (
                <div key={msg.id} className="p-3 hover:bg-[#161616] transition-colors space-y-1">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="text-zinc-200 font-bold">{msg.subject}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-zinc-500 text-[11px]">
                    To: {msg.recipientName} &lt;{msg.to}&gt; | Code: <span className="text-amber-400">{msg.verificationCode || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-3 bg-[#101010] border border-zinc-800 rounded space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="text-[11px] flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-850">
                  <div>
                    <span className="text-[#ff3c00] font-bold">[{log.action}]</span> {log.details}
                  </div>
                  <span className="text-zinc-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <pre className="p-3 rounded bg-[#070707] border border-zinc-850 text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
              {JSON.stringify({ users: usersList, emails, logs }, null, 2)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-[#121212] flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Sandbox Database</span>
          </button>
          <button
            type="button"
            onClick={() => setDbModalOpen(false)}
            className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
