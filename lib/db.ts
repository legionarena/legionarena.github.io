import { User, DispatchedEmail, DbState } from './types';

const DB_STORAGE_KEY = 'firestorm_tournaments_db_v1';

// Generates a 12-character military tactical UID (e.g., FS-7K9A-3M2W)
export function generateTacticalUid(): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FS-${p1}-${p2}`;
}

// Generates a 6-digit pin code for verification & password recovery
export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple fast hashing for client-side storage
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${password.length}`;
}

// Initial state with a pre-configured verified demo player
const INITIAL_STATE: DbState = {
  users: [
    {
      id: 'FS-9842-1204',
      callsign: 'GhostRider',
      email: 'player@firestorm.gg',
      passwordHash: hashPassword('password123'),
      isVerified: true,
      verificationCode: '772910',
      verificationExpiresAt: Date.now() + 86400000,
      rank: 'Elite Commander',
      rating: 2450,
      matchesWon: 48,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  ],
  currentUserId: null,
  emailOutbox: [
    {
      id: 'em-init-01',
      to: 'player@firestorm.gg',
      subject: '🔥 Firestorm Tournaments: Welcome Commander GhostRider',
      type: 'VERIFICATION',
      code: '772910',
      body: 'Welcome to Firestorm Tournaments! Your tactical clearance UID is FS-9842-1204. Your verification code is 772910.',
      sentAt: new Date(Date.now() - 604800000).toISOString(),
      isRead: true
    }
  ]
};

// Safely loads database from localStorage
export function loadDatabase(): DbState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const data = localStorage.getItem(DB_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(data) as DbState;
    if (!parsed.users || !Array.isArray(parsed.users)) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

// Saves database to localStorage
export function saveDatabase(state: DbState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// 1. New User Registration
export function registerUser(email: string, callsign: string, password: string): { success: boolean; message: string; user?: User; verificationCode?: string } {
  const state = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCallsign = callsign.trim();

  if (!cleanEmail || !cleanCallsign || !password) {
    return { success: false, message: 'All registration credentials are required.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  const existingEmail = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, message: 'An account with this email address already exists.' };
  }

  const existingCallsign = state.users.find((u) => u.callsign.toLowerCase() === cleanCallsign.toLowerCase());
  if (existingCallsign) {
    return { success: false, message: 'This Callsign is already registered by another operative.' };
  }

  const verificationCode = generate6DigitCode();
  const uid = generateTacticalUid();

  const newUser: User = {
    id: uid,
    callsign: cleanCallsign,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    isVerified: false,
    verificationCode,
    verificationExpiresAt: Date.now() + 3600000, // 1 hour expiration
    rank: 'Recruit',
    rating: 1000,
    matchesWon: 0,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  const dispatchedEmail: DispatchedEmail = {
    id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    to: cleanEmail,
    subject: '🔥 Firestorm Tournaments: Verify Your Operative Account',
    type: 'VERIFICATION',
    code: verificationCode,
    body: `Welcome Operative ${cleanCallsign}! Your tactical UID is ${uid}.\n\nYour 6-digit email verification code is: ${verificationCode}\n\nEnter this code on the landing page to unlock the tournament arena.`,
    sentAt: new Date().toISOString(),
    isRead: false
  };

  state.users.push(newUser);
  state.emailOutbox.unshift(dispatchedEmail);
  saveDatabase(state);

  return {
    success: true,
    message: `Account created for ${cleanCallsign}. A 6-digit verification code has been dispatched to ${cleanEmail}.`,
    user: newUser,
    verificationCode
  };
}

// 2. Email Verification
export function verifyEmail(email: string, code: string): { success: boolean; message: string; user?: User } {
  const state = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  const userIndex = state.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (userIndex === -1) {
    return { success: false, message: 'User account not found.' };
  }

  const user = state.users[userIndex];

  if (user.isVerified) {
    state.currentUserId = user.id;
    saveDatabase(state);
    return { success: true, message: 'Account is already verified. Entering tournament arena...', user };
  }

  if (user.verificationCode !== cleanCode) {
    return { success: false, message: 'Invalid 6-digit verification code. Please check your email.' };
  }

  if (Date.now() > user.verificationExpiresAt) {
    return { success: false, message: 'Verification code has expired. Please request a new code.' };
  }

  user.isVerified = true;
  user.lastLoginAt = new Date().toISOString();
  state.currentUserId = user.id;
  state.users[userIndex] = user;
  saveDatabase(state);

  return { success: true, message: 'Email successfully verified! Clearance granted.', user };
}

// 3. Resend Verification Code
export function resendVerificationCode(email: string): { success: boolean; message: string; code?: string } {
  const state = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();

  const user = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'No registered user found with that email.' };
  }

  if (user.isVerified) {
    return { success: false, message: 'This account is already verified.' };
  }

  const newCode = generate6DigitCode();
  user.verificationCode = newCode;
  user.verificationExpiresAt = Date.now() + 3600000;

  const dispatchedEmail: DispatchedEmail = {
    id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    to: cleanEmail,
    subject: '🔥 Firestorm Tournaments: New Verification Code',
    type: 'VERIFICATION',
    code: newCode,
    body: `Operative ${user.callsign}, here is your replacement 6-digit verification code: ${newCode}`,
    sentAt: new Date().toISOString(),
    isRead: false
  };

  state.emailOutbox.unshift(dispatchedEmail);
  saveDatabase(state);

  return {
    success: true,
    message: `A fresh 6-digit verification code was sent to ${cleanEmail}.`,
    code: newCode
  };
}

// 4. User Login
export function loginUser(identifier: string, password: string): { success: boolean; message: string; user?: User; requiresVerification?: boolean } {
  const state = loadDatabase();
  const cleanId = identifier.trim().toLowerCase();

  const user = state.users.find(
    (u) => u.email.toLowerCase() === cleanId || u.callsign.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, message: 'Invalid credentials. Operative not found.' };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { success: false, message: 'Incorrect password.' };
  }

  if (!user.isVerified) {
    return {
      success: true,
      message: 'Account requires email verification before accessing the tournament arena.',
      user,
      requiresVerification: true
    };
  }

  user.lastLoginAt = new Date().toISOString();
  state.currentUserId = user.id;
  saveDatabase(state);

  return { success: true, message: `Welcome back, ${user.callsign}! Clearance confirmed.`, user };
}

// 5. Email-Only Password Recovery (Request Reset Code)
export function requestPasswordReset(email: string): { success: boolean; message: string; resetCode?: string } {
  const state = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();

  const user = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'No registered operative found with that email address.' };
  }

  const resetCode = generate6DigitCode();
  user.resetCode = resetCode;
  user.resetExpiresAt = Date.now() + 1800000; // 30 minutes

  const dispatchedEmail: DispatchedEmail = {
    id: `em-reset-${Date.now()}`,
    to: cleanEmail,
    subject: '🔥 Firestorm Tournaments: Password Recovery Code',
    type: 'PASSWORD_RESET',
    code: resetCode,
    body: `Operative ${user.callsign},\n\nWe received a request to recover your password. Your 6-digit password recovery code is: ${resetCode}\n\nThis code expires in 30 minutes.`,
    sentAt: new Date().toISOString(),
    isRead: false
  };

  state.emailOutbox.unshift(dispatchedEmail);
  saveDatabase(state);

  return {
    success: true,
    message: `Password recovery code dispatched to ${cleanEmail}. Check your email.`,
    resetCode
  };
}

// 6. Complete Password Reset
export function resetPassword(email: string, code: string, newPassword: string): { success: boolean; message: string } {
  const state = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' };
  }

  const user = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'Account not found.' };
  }

  if (!user.resetCode || user.resetCode !== cleanCode) {
    return { success: false, message: 'Invalid 6-digit recovery code.' };
  }

  if (user.resetExpiresAt && Date.now() > user.resetExpiresAt) {
    return { success: false, message: 'Recovery code has expired. Please request a new one.' };
  }

  user.passwordHash = hashPassword(newPassword);
  user.resetCode = undefined;
  user.resetExpiresAt = undefined;
  saveDatabase(state);

  return { success: true, message: 'Password updated successfully! You can now log in.' };
}

// 7. Session Management
export function getCurrentUser(): User | null {
  const state = loadDatabase();
  if (!state.currentUserId) return null;
  const user = state.users.find((u) => u.id === state.currentUserId);
  return user && user.isVerified ? user : null;
}

export function logoutUser(): void {
  const state = loadDatabase();
  state.currentUserId = null;
  saveDatabase(state);
}

export function getEmailOutbox(): DispatchedEmail[] {
  const state = loadDatabase();
  return state.emailOutbox || [];
}
