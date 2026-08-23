'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Database, ShieldCheck, ShieldAlert, Key, X, Sparkles, UserCheck, RefreshCw, Layers } from 'lucide-react';
import { User } from '@/lib/types';

export default function DatabaseModal() {
  const { isDbModalOpen, setDbModalOpen, usersList, switchUser, currentUser, refreshData } = useAuth();
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');

  if (!isDbModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-orange-500/40 rounded-2xl shadow-2xl shadow-orange-950/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Secure Firestorm Database Records
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-500/30">
                  {usersList.length} Registered Users
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Persistent storage showing unique 12-digit alphanumeric user IDs, encrypted hashes, and verification flags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'table' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'json' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw JSON
              </button>
            </div>

            <button
              id="close-db-modal-btn"
              type="button"
              onClick={() => setDbModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/90 space-y-4">
          {activeTab === 'table' ? (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Unique 12-Digit UID</th>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Verified Status</th>
                      <th className="p-3">MFA Layer</th>
                      <th className="p-3">Password Hash</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {usersList.map((user) => {
                      const isCurrent = currentUser?.id === user.id;
                      return (
                        <tr key={user.id} className={isCurrent ? 'bg-orange-950/20' : 'hover:bg-slate-900/50'}>
                          <td className="p-3 font-mono font-bold text-orange-400 whitespace-nowrap">
                            {user.id}
                            {isCurrent && (
                              <span className="ml-1.5 text-[9px] font-sans px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-200 whitespace-nowrap">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="p-3 text-slate-300 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {user.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-medium text-[11px]">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 font-medium text-[11px]">
                                <ShieldAlert className="w-3 h-3" />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              user.mfaEnabled 
                                ? 'bg-orange-950/60 text-orange-300 border border-orange-500/30' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.mfaEnabled ? '2FA Active' : 'Off'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-[100px]" title={user.passwordHash}>
                            {user.passwordHash.substring(0, 12)}...
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => switchUser(user)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-300 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Switch To
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre className="font-mono text-xs text-orange-300 overflow-x-auto max-h-[400px]">
                {JSON.stringify(usersList, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Automatic ID guarantee: 12-alphanumeric collision-resistant identifier per user.
          </span>
          <button
            type="button"
            onClick={() => setDbModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
