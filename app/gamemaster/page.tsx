'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import EmailInboxDrawer from '@/components/EmailSimulator/EmailInboxDrawer';
import DatabaseModal from '@/components/DatabaseViewer/DatabaseModal';
import { useAuth } from '@/lib/AuthContext';
import { FirestormDatabase } from '@/lib/db';
import { 
  Crown, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Mail, 
  Database, 
  Key, 
  Copy, 
  Check, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  Download,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

export default function GamemasterPage() {
  const { 
    usersList, 
    currentUser, 
    switchUser,
    signOut,
    refreshData, 
    openEmailDrawer, 
    setDbModalOpen,
    isMounted
  } = useAuth();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'verified' | 'unverified' | 'mfa'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const logs = isMounted ? FirestormDatabase.getAuditLogs() : [];

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleToggleVerify = (userId: string, currentStatus: boolean) => {
    const allUsers = FirestormDatabase.getAllUsers();
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    FirestormDatabase.updateUser(userId, { isVerified: !currentStatus });
    FirestormDatabase.logActivity(
      userId,
      'STATUS_CHANGED',
      `Gamemaster changed verification status to ${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'}`
    );
    refreshData();
    showNotification(`User ${targetUser.email} verification updated!`);
  };

  const handleToggleMfa = (userId: string, currentMfa: boolean) => {
    const allUsers = FirestormDatabase.getAllUsers();
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    FirestormDatabase.updateUser(userId, { mfaEnabled: !currentMfa });
    FirestormDatabase.logActivity(
      userId,
      'SECURITY_ALERT',
      `Gamemaster ${!currentMfa ? 'enabled' : 'disabled'} MFA override`
    );
    refreshData();
    showNotification(`User ${targetUser.email} MFA status updated!`);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to permanently delete this user from the sandbox database?')) {
      const allUsers = FirestormDatabase.getAllUsers();
      const updated = allUsers.filter(u => u.id !== userId);
      FirestormDatabase.saveUsers(updated);
      
      if (currentUser?.id === userId) {
        signOut();
      }
      refreshData();
      showNotification('User deleted from database.');
    }
  };

  const handleSwitchUser = (user: typeof usersList[0]) => {
    switchUser(user);
    showNotification(`Switched active session to: ${user.firstName} ${user.lastName}`);
  };

  const handleCreateRandomUser = async () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const demoEmail = `agent.${randomNum}@firestorm.net`;
    const demoUid = FirestormDatabase.generate12DigitUid();
    const demoVerificationCode = FirestormDatabase.generate6DigitCode();

    const newUser = {
      id: demoUid,
      firstName: 'Agent',
      lastName: `Alpha-${randomNum}`,
      email: demoEmail,
      passwordHash: FirestormDatabase.hashPassword(`Firestorm@${randomNum}`),
      isVerified: Math.random() > 0.5,
      verificationCode: demoVerificationCode,
      createdAt: new Date().toISOString(),
      mfaEnabled: Math.random() > 0.5,
      backupCodes: ['ABCD-1234', 'EFGH-5678', 'JKLM-9012'],
      securityScore: 85
    };

    const all = FirestormDatabase.getAllUsers();
    all.push(newUser);
    FirestormDatabase.saveUsers(all);

    // Send welcome email simulator
    FirestormDatabase.dispatchVerificationEmail(demoEmail, newUser.firstName, demoVerificationCode, demoUid);
    FirestormDatabase.logActivity(newUser.id, 'SIGN_UP', 'Gamemaster manual user provisioning');

    refreshData();
    showNotification(`Provisioned agent ${demoEmail} with UID: ${demoUid}`);
  };

  const handleExportJson = () => {
    const data = {
      users: FirestormDatabase.getAllUsers(),
      emails: FirestormDatabase.getStoredEmails(),
      logs: FirestormDatabase.getAuditLogs(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firestorm-gamemaster-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported full database JSON snapshot.');
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'verified') return u.isVerified;
    if (roleFilter === 'unverified') return !u.isVerified;
    if (roleFilter === 'mfa') return u.mfaEnabled;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-[#ff3c00] selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Toast Notification */}
        {actionSuccessMsg && (
          <div className="p-3 bg-[#ff3c00] text-black font-bold text-xs uppercase tracking-tight rounded flex items-center justify-between shadow-xl animate-fadeIn">
            <span>{actionSuccessMsg}</span>
            <button onClick={() => setActionSuccessMsg(null)} className="font-mono text-xs px-2 py-0.5 bg-black text-[#ff3c00] rounded">
              OK
            </button>
          </div>
        )}

        {/* Gamemaster Page Hero */}
        <section className="p-6 sm:p-8 rounded border border-zinc-800 bg-[#0e0e0e] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ff3c00]/10 border border-[#ff3c00]/30 text-[#ff3c00] text-xs font-mono font-bold uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5" />
                <span>Gamemaster Control Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-mono">
                System Administration & Database
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Full administrative oversight: inspect generated 12-digit UIDs, override verification/MFA states, inspect raw credentials, and review live audit trails.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCreateRandomUser}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#ff3c00] hover:bg-white text-black font-bold uppercase tracking-tight text-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Provision Demo Agent</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#1a1a1a] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-tight text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export DB</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800">
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Registered Users</div>
              <div className="text-2xl font-black font-mono text-[#ff3c00]">{isMounted ? usersList.length : 0}</div>
            </div>
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Verified Accounts</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {isMounted ? usersList.filter(u => u.isVerified).length : 0}
              </div>
            </div>
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">MFA Protected</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                {isMounted ? usersList.filter(u => u.mfaEnabled).length : 0}
              </div>
            </div>
            <div className="p-3 rounded bg-[#141414] border border-zinc-850">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Audit Trail Events</div>
              <div className="text-2xl font-black font-mono text-amber-400">{logs.length}</div>
            </div>
          </div>
        </section>

        {/* User Directory Management Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ff3c00]" />
              <h2 className="text-xl font-bold uppercase tracking-tight text-white font-mono">
                User Record Registry
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search UID, name, email..."
                  className="pl-8 pr-3 py-1.5 rounded bg-[#111] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff3c00]"
                />
              </div>

              {/* Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded bg-[#111] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-[#ff3c00]"
              >
                <option value="all">All Users ({usersList.length})</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="mfa">MFA Active Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-zinc-800 bg-[#0e0e0e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3">12-Digit UID</th>
                  <th className="p-3">User & Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">MFA</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                      No matching user records found in the database.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isCurrent = currentUser?.id === user.id;
                    return (
                      <tr key={user.id} className={`hover:bg-[#151515] transition-colors ${isCurrent ? 'bg-[#ff3c00]/5' : ''}`}>
                        {/* 12-Digit UID */}
                        <td className="p-3 font-mono font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#ff3c00]">{user.id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(user.id)}
                              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded"
                              title="Copy 12-Digit UID"
                            >
                              {copiedId === user.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Name & Email */}
                        <td className="p-3">
                          <div className="font-bold text-zinc-200">{user.firstName} {user.lastName}</div>
                          <div className="text-zinc-500 font-mono text-[11px]">{user.email}</div>
                        </td>

                        {/* Verified Status */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(user.id, user.isVerified)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase transition-colors ${
                              user.isVerified
                                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900'
                                : 'bg-amber-950/80 border border-amber-500/40 text-amber-400 hover:bg-amber-900'
                            }`}
                            title="Click to toggle verification status"
                          >
                            {user.isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            <span>{user.isVerified ? 'Verified' : 'Unverified'}</span>
                          </button>
                        </td>

                        {/* MFA */}
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleMfa(user.id, user.mfaEnabled)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase transition-colors ${
                              user.mfaEnabled
                                ? 'bg-blue-950/80 border border-blue-500/40 text-blue-400 hover:bg-blue-900'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                            }`}
                            title="Click to toggle MFA override"
                          >
                            <Key className="w-3 h-3" />
                            <span>{user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                          </button>
                        </td>

                        {/* Registered Date */}
                        <td className="p-3 text-zinc-500 font-mono text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleSwitchUser(user)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                              isCurrent
                                ? 'bg-emerald-500 text-black'
                                : 'bg-zinc-800 hover:bg-[#ff3c00] text-zinc-200 hover:text-black'
                            }`}
                            title="Switch active user profile"
                          >
                            {isCurrent ? 'Active' : 'Impersonate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 rounded bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-400 hover:text-white transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live System Audit Trail */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold uppercase tracking-tight text-white font-mono">
                Live Audit Trail & Security Logs
              </h2>
            </div>
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Log Stream</span>
            </button>
          </div>

          <div className="p-4 rounded border border-zinc-800 bg-[#0e0e0e] max-h-72 overflow-y-auto space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-zinc-500 text-center py-6">No audit records generated yet.</div>
            ) : (
              logs.slice(0, 30).map((log) => (
                <div key={log.id} className="p-2 rounded bg-[#141414] border border-zinc-850 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        log.action.includes('SIGN_UP') ? 'bg-[#ff3c00]/20 text-[#ff3c00]' :
                        log.action.includes('SIGN_IN') ? 'bg-emerald-950 text-emerald-400' :
                        log.action.includes('MFA') ? 'bg-blue-950 text-blue-400' :
                        log.action.includes('PASSWORD') ? 'bg-amber-950 text-amber-400' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-zinc-300">{log.details}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      User UID: {log.userId} &bull; IP: {log.ipAddress || '127.0.0.1'}
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Hub Navigation Cards */}
        <section className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/member"
            className="p-4 rounded border border-zinc-800 bg-[#0e0e0e] hover:border-[#ff3c00]/60 transition-colors group"
          >
            <div className="text-xs font-mono text-zinc-500 uppercase">Go To Member Page</div>
            <div className="text-base font-bold text-white group-hover:text-[#ff3c00] transition-colors flex items-center justify-between mt-1">
              <span>Member Sign In & Profile</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ff3c00]" />
            </div>
          </Link>

          <Link
            href="/signup"
            className="p-4 rounded border border-zinc-800 bg-[#0e0e0e] hover:border-[#ff3c00]/60 transition-colors group"
          >
            <div className="text-xs font-mono text-zinc-500 uppercase">Go To Registration</div>
            <div className="text-base font-bold text-white group-hover:text-[#ff3c00] transition-colors flex items-center justify-between mt-1">
              <span>Sign Up New User</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ff3c00]" />
            </div>
          </Link>

          <Link
            href="/"
            className="p-4 rounded border border-zinc-800 bg-[#0e0e0e] hover:border-[#ff3c00]/60 transition-colors group"
          >
            <div className="text-xs font-mono text-zinc-500 uppercase">Return To Main Hub</div>
            <div className="text-base font-bold text-white group-hover:text-[#ff3c00] transition-colors flex items-center justify-between mt-1">
              <span>Firestorm Overview Hub</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ff3c00]" />
            </div>
          </Link>
        </section>
      </main>

      {/* Global Simulator Drawers & Inspector Modals */}
      <EmailInboxDrawer />
      <DatabaseModal />
    </div>
  );
}
