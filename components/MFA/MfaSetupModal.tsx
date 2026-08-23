'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, QrCode, Key, Copy, Check, AlertTriangle, X, Lock } from 'lucide-react';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MfaSetupModal({ isOpen, onClose }: MfaSetupModalProps) {
  const { currentUser, toggleMfa } = useAuth();
  const [step, setStep] = useState<'qr' | 'backup'>('qr');
  const [testCode, setTestCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !currentUser) return null;

  const secretKey = currentUser.mfaSecret || 'FSTMK9X2M4R8B1W7';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleVerifyAndEnable = () => {
    setErrorMessage('');
    if (!testCode.trim()) {
      setErrorMessage('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    if (testCode.trim().length !== 6 && testCode.trim() !== '123456') {
      setErrorMessage('Invalid 6-digit verification code. Try 123456 for simulator.');
      return;
    }

    const res = toggleMfa(true);
    if (res.backupCodes) {
      setBackupCodes(res.backupCodes);
      setStep('backup');
    } else {
      onClose();
    }
  };

  const handleComplete = () => {
    setStep('qr');
    setTestCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-orange-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-orange-950/50">
        <button
          type="button"
          onClick={handleComplete}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {step === 'qr' ? 'Set Up Multi-Factor Authentication (MFA)' : 'Emergency Recovery Backup Codes'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'qr'
              ? 'Enhance your Firestorm account security by pairing an authenticator app.'
              : 'Save these single-use recovery codes in a secure location.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'qr' ? (
          <div className="space-y-4">
            {/* Simulated Authenticator QR / Secret Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-32 bg-white rounded-lg p-2 flex flex-col items-center justify-center shrink-0 shadow-md">
                {/* SVG Visual QR Pattern */}
                <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-0.5 p-1 bg-white">
                  <div className="col-span-2 row-span-2 bg-black border-2 border-white" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="col-span-2 row-span-2 bg-black border-2 border-white" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="col-span-2 row-span-2 bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="col-span-2 row-span-2 bg-black border-2 border-white" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                  <div className="bg-black" />
                </div>
                <span className="text-[9px] font-mono text-slate-800 mt-1 font-bold">FSTM-AUTH</span>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div className="text-xs font-semibold text-slate-200">
                  Step 1: Scan QR or Enter Key
                </div>
                <p className="text-[11px] text-slate-400">
                  Open Google Authenticator, Authy, or 1Password and scan the QR code.
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-orange-300 select-all truncate">
                    {secretKey}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Copy Secret Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Test Code Verification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="mfa-test-code-input">
                  Step 2: Enter 6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setTestCode('123456')}
                  className="text-[10px] text-orange-400 hover:text-orange-300 underline cursor-pointer"
                >
                  Quick Fill (123456)
                </button>
              </div>
              <input
                id="mfa-test-code-input"
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full py-2.5 px-3 font-mono text-center text-sm tracking-widest bg-slate-950 border border-orange-500/40 rounded-lg text-orange-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            <button
              id="activate-mfa-btn"
              type="button"
              onClick={handleVerifyAndEnable}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              Verify Code & Activate MFA Protection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                If you lose access to your authenticator device, each of these backup codes can be used once to log in.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="grid grid-cols-2 gap-2 text-center font-mono text-sm text-orange-300">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 font-bold tracking-wider">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedBackup ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBackup ? 'Copied Codes!' : 'Copy All Codes'}</span>
              </button>

              <button
                id="finish-mfa-setup-btn"
                type="button"
                onClick={handleComplete}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done & Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
