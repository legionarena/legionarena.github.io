'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Mail, 
  Key, 
  Smartphone, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Lock, 
  Calendar,
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';
import EmailVerificationModal from '../Auth/EmailVerificationModal';
import MfaSetupModal from '../MFA/MfaSetupModal';
import ForgotPasswordModal from '../Auth/ForgotPasswordModal';

export default function UserDashboard() {
  const { currentUser, toggleMfa, resendVerification, openEmailDrawer } = useAuth();
  
  const [copiedId, setCopiedId] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  if (!currentUser) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleMfaToggle = () => {
    if (currentUser.mfaEnabled) {
      toggleMfa(false);
      setActionFeedback('Multi-Factor Authentication has been disabled.');
      setTimeout(() => setActionFeedback(''), 3000);
    } else {
      setIsMfaModalOpen(true);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification(currentUser.id);
      setIsResending(false);
      setActionFeedback('A new automated welcome verification code has been dispatched!');
      setTimeout(() => setActionFeedback(''), 3000);
    } catch {
      setIsResending(false);
    }
  };

  // Calculate Security Score
  let securityScore = 40;
  if (currentUser.isVerified) securityScore += 35;
  if (currentUser.mfaEnabled) securityScore += 25;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Feedback Toast Notice */}
      {actionFeedback && (
        <div className="p-3 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-200 text-xs flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback('')}
            className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Profile & Status Header */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-orange-500/30 p-6 sm:p-8 shadow-xl shadow-orange-950/20 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* User Bio & 12-digit ID */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/25 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold font-mono text-orange-400">
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              {/* Online pulse indicator */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-950 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>

                {/* VERIFIED STATUS BADGE */}
                {currentUser.isVerified ? (
                  <div
                    id="dashboard-verified-badge"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-md shadow-emerald-950/40"
                    title={`Email verified on ${new Date(currentUser.verifiedAt || currentUser.createdAt).toLocaleDateString()}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>VERIFIED ACCOUNT</span>
                  </div>
                ) : (
                  <div
                    id="dashboard-unverified-badge"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-300 text-xs font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>PENDING VERIFICATION</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.email}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Joined {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* 12-Digit Unique User ID Component */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-orange-500/40 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Unique 12-Digit UID:
                  </span>
                  <span className="font-mono font-bold text-orange-400 text-sm tracking-wider">
                    {currentUser.id}
                  </span>
                  <button
                    id="copy-user-id-btn"
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    title="Copy Unique User ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {copiedId && (
                  <span className="text-[11px] text-emerald-400 font-medium animate-fadeIn">
                    Copied to clipboard!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Security Score Meter */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 lg:w-72">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Security Health Score
              </span>
              <span className={`font-mono font-bold text-sm ${
                securityScore === 100 ? 'text-emerald-400' : securityScore >= 70 ? 'text-amber-400' : 'text-orange-400'
              }`}>
                {securityScore}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden mb-2.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  securityScore === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : securityScore >= 70
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Email Verification</span>
                <span className={currentUser.isVerified ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {currentUser.isVerified ? '+35% (Passed)' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Multi-Factor 2FA</span>
                <span className={currentUser.mfaEnabled ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {currentUser.mfaEnabled ? '+25% (Active)' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {!currentUser.isVerified && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                Action Required: Automated Welcome Email Pending Confirmation
              </h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Please enter the 6-digit confirmation code sent to <strong>{currentUser.email}</strong> to activate your verified badge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="open-verify-modal-btn"
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="py-1.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Verify Account Now
            </button>
            <button
              type="button"
              disabled={isResending}
              onClick={handleResend}
              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Account Security Settings & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings & Security Controls (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* MFA / 2FA Configuration Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Multi-Factor Authentication (MFA)
                    <span className="text-[10px] font-normal uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Optional Layer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Require a 6-digit one-time code or emergency backup code when signing in to your account.
                  </p>
                </div>
              </div>

              {/* MFA Toggle Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  {currentUser.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  id="mfa-toggle-switch-btn"
                  type="button"
                  onClick={handleMfaToggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    currentUser.mfaEnabled ? 'bg-orange-500' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={currentUser.mfaEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      currentUser.mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* MFA Details */}
            {currentUser.mfaEnabled ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>MFA Authenticator Protection Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMfaModalOpen(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    View Backup Codes ({currentUser.backupCodes?.length || 0})
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every login attempt requires time-based authenticator validation (e.g. Google Authenticator / 1Password) or single-use backup recovery codes.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  MFA is currently deactivated. Enable to protect against unauthorized password compromises.
                </span>
                <button
                  id="enable-mfa-btn"
                  type="button"
                  onClick={() => setIsMfaModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Enable 2FA Now
                </button>
              </div>
            )}
          </div>

          {/* Account Credentials & Password Management */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Password & Security Credentials
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage your authentication secrets and password reset tokens.
                  </p>
                </div>
              </div>

              <button
                id="dashboard-reset-password-btn"
                type="button"
                onClick={() => setIsPasswordResetOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>Reset Password</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-500 text-[11px] mb-0.5">Automated Welcome Email</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Dispatched on Signup</span>
                  <button
                    type="button"
                    onClick={() => openEmailDrawer()}
                    className="text-orange-400 hover:text-orange-300 underline text-[11px] cursor-pointer"
                  >
                    View Mailbox
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-500 text-[11px] mb-0.5">Verification Status</div>
                <div className="flex items-center justify-between">
                  <span className={currentUser.isVerified ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {currentUser.isVerified ? 'Email Verified' : 'Unverified (Code Sent)'}
                  </span>
                  {!currentUser.isVerified && (
                    <button
                      type="button"
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="text-amber-400 hover:text-amber-300 underline text-[11px] cursor-pointer"
                    >
                      Enter Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Security Activity Logs (1 Col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Audit Trail & Activity
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">LIVE</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {currentUser.recentActivity && currentUser.recentActivity.length > 0 ? (
              currentUser.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {act.details}
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900 font-mono">
                    <span>{act.ip}</span>
                    <span className="truncate max-w-[120px]">{act.device}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent activity logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        targetUserId={currentUser.id}
        targetEmail={currentUser.email}
      />

      <MfaSetupModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
        initialEmail={currentUser.email}
      />
    </div>
  );
}
