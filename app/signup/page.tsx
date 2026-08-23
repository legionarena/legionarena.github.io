'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import EmailInboxDrawer from '@/components/EmailSimulator/EmailInboxDrawer';
import DatabaseModal from '@/components/DatabaseViewer/DatabaseModal';
import { useAuth } from '@/lib/AuthContext';
import {
  UserPlus,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, openEmailDrawer, isMounted, currentUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any | null>(null);

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await signUp(firstName, lastName, email, password);
      setRegisteredUser(user);
      openEmailDrawer();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 flex flex-col selection:bg-[#ff3c00] selection:text-black">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        {!registeredUser ? (
          <div className="p-6 sm:p-8 rounded-lg border border-zinc-800 bg-[#0f0f0f] shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#ff3c00]/10 text-[#ff3c00] flex items-center justify-center mx-auto mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black font-mono uppercase text-white tracking-tight">
                Create Account
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                Get an automatic 12-digit UID &amp; access the sandbox modules
              </p>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-zinc-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-400">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded bg-[#141414] border border-zinc-800 text-sm text-white focus:outline-none focus:border-[#ff3c00] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded bg-[#ff3c00] hover:bg-[#ff5500] text-black font-black text-xs uppercase tracking-wider font-mono transition-colors shadow-lg shadow-[#ff3c00]/20 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Registering...' : 'Register & Generate 12-Digit UID'}
              </button>

              <div className="text-center pt-2 text-xs font-mono text-zinc-500">
                <span>Already registered? </span>
                <Link href="/member" className="text-[#ff3c00] hover:underline font-bold">
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* Registration Success Screen */
          <div className="p-6 sm:p-8 rounded-lg border border-emerald-500/40 bg-[#0d1612] shadow-2xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black font-mono uppercase text-white">
                Registration Successful!
              </h2>
              <p className="text-xs text-zinc-300 font-mono">
                Your unique 12-digit identity has been assigned.
              </p>
            </div>

            <div className="p-4 rounded bg-black/60 border border-emerald-500/30 space-y-2 font-mono text-left">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Assigned 12-Digit UID:</span>
                <span className="text-[#ff3c00] font-black text-base">{registeredUser.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Member Name:</span>
                <span className="text-white font-bold">{registeredUser.firstName} {registeredUser.lastName}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Email:</span>
                <span className="text-zinc-200">{registeredUser.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Verification Code:</span>
                <span className="text-amber-400 font-black tracking-widest">{registeredUser.verificationCode}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => openEmailDrawer()}
                className="flex-1 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition-colors"
              >
                Inspect Welcome Email &rarr;
              </button>
              <Link
                href="/member"
                className="flex-1 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
              >
                <span>Go To Member Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <EmailInboxDrawer />
      <DatabaseModal />
    </div>
  );
}
