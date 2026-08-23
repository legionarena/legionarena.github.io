import { User, EmailMessage, ActivityLog } from './types';

const STORAGE_USERS_KEY = 'firestorm_users_db';
const STORAGE_EMAILS_KEY = 'firestorm_emails_db';
const STORAGE_SESSION_KEY = 'firestorm_current_session';

/**
 * Generates a guaranteed 12-character alphanumeric Unique User ID.
 * Example format: "FST9-X2M4-R8K1" or "9K2M-4X8R-7B1P" (12 alphanumeric characters excluding hyphens)
 */
export function generate12DigitUserId(existingIds: Set<string> = new Set()): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // readable alphanumeric (32 chars)
  let result = '';
  do {
    let raw = '';
    for (let i = 0; i < 12; i++) {
      raw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format into 4-4-4 for high-tech aesthetic
    result = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  } while (existingIds.has(result));

  return result;
}

/**
 * Generates a 6-digit numeric verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a secure random token
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Simple deterministic SHA-256 hash simulation for client-side storage
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(password + '_firestorm_salt');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Fallback hashing
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fstm_' + Math.abs(hash).toString(16).padStart(16, '0');
}

// Initial seed user for testing if database is empty
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'FST8-M92K-4P7X',
    firstName: 'Alex',
    lastName: 'Vanguard',
    email: 'alex.vanguard@firestorm.io',
    passwordHash: 'demo_user_hash_123',
    isVerified: true,
    verificationCode: '748291',
    verificationToken: 'vtok_initial_seed_1',
    verificationSentAt: Date.now() - 86400000 * 3,
    verifiedAt: Date.now() - 86400000 * 3,
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    backupCodes: ['FST-9021', 'FST-4412', 'FST-8873', 'FST-1290'],
    createdAt: Date.now() - 86400000 * 3,
    lastLoginAt: Date.now() - 3600000,
    recentActivity: [
      {
        id: 'act_1',
        action: 'Account Created',
        details: 'Initial account registration completed',
        timestamp: Date.now() - 86400000 * 3,
        ip: '192.168.1.102',
        device: 'Chrome 124 on macOS',
        status: 'success',
      },
      {
        id: 'act_2',
        action: 'Email Verified',
        details: 'Automated welcome verification confirmed',
        timestamp: Date.now() - 86400000 * 3 + 120000,
        ip: '192.168.1.102',
        device: 'Chrome 124 on macOS',
        status: 'success',
      },
      {
        id: 'act_3',
        action: 'MFA Enabled',
        details: 'Multi-Factor Authenticator 2FA activated',
        timestamp: Date.now() - 86400000 * 2,
        ip: '192.168.1.102',
        device: 'Chrome 124 on macOS',
        status: 'info',
      },
      {
        id: 'act_4',
        action: 'Successful Sign In',
        details: 'Authenticated with password and MFA security code',
        timestamp: Date.now() - 3600000,
        ip: '192.168.1.102',
        device: 'Chrome 124 on macOS',
        status: 'success',
      }
    ],
  }
];

export class FirestormDatabase {
  private static getStoredUsers(): User[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_USERS;
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS));
        return INITIAL_DEMO_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DEMO_USERS;
    }
  }

  private static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save to database:', e);
    }
  }

  public static getStoredEmails(): EmailMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_EMAILS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static saveEmails(emails: EmailMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(emails));
    } catch (e) {
      console.error('Failed to save emails:', e);
    }
  }

  public static addEmail(email: EmailMessage): void {
    const emails = this.getStoredEmails();
    emails.unshift(email);
    this.saveEmails(emails);
  }

  public static getAllUsers(): User[] {
    return this.getStoredUsers();
  }

  public static getUserByEmail(email: string): User | undefined {
    const users = this.getStoredUsers();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public static getUserById(id: string): User | undefined {
    const users = this.getStoredUsers();
    return users.find(u => u.id === id);
  }

  public static async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    passwordPlain: string
  ): Promise<{ user: User; welcomeEmail: EmailMessage }> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const users = this.getStoredUsers();
    const existingIds = new Set(users.map(u => u.id));
    const userId = generate12DigitUserId(existingIds);
    const passwordHash = await hashPassword(passwordPlain);
    const verificationCode = generateVerificationCode();
    const verificationToken = generateToken();
    const now = Date.now();

    const newUser: User = {
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      passwordHash,
      isVerified: false,
      verificationCode,
      verificationToken,
      verificationSentAt: now,
      mfaEnabled: false,
      createdAt: now,
      lastLoginAt: now,
      recentActivity: [
        {
          id: `act_${Date.now()}_reg`,
          action: 'Account Created',
          details: `User registration initialized with 12-digit ID: ${userId}`,
          timestamp: now,
          ip: '127.0.0.1 (Local Client)',
          device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
          status: 'success',
        },
        {
          id: `act_${Date.now()}_ver_sent`,
          action: 'Automated Welcome Verification Sent',
          details: `Verification code #${verificationCode} dispatched to ${cleanEmail}`,
          timestamp: now,
          ip: 'Firestorm Mail Dispatcher',
          device: 'System Service',
          status: 'info',
        }
      ],
    };

    users.push(newUser);
    this.saveUsers(users);

    // Create Automated Welcome Email
    const welcomeEmail: EmailMessage = {
      id: `mail_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: newUser.id,
      to: cleanEmail,
      recipientName: `${newUser.firstName} ${newUser.lastName}`,
      subject: `Welcome to Firestorm! Verify your account (Code: ${verificationCode})`,
      type: 'welcome_verification',
      verificationCode: verificationCode,
      token: verificationToken,
      content: `Hello ${newUser.firstName},\n\nWelcome to Firestorm Identity Systems! Your unique 12-digit User ID is ${newUser.id}.\n\nPlease verify your email address to complete your registration and activate your verified badge. Your 6-digit confirmation code is: ${verificationCode}\n\nYou can also click the direct confirmation button below to verify instantly.`,
      timestamp: now,
      isRead: false,
    };

    this.addEmail(welcomeEmail);

    return { user: newUser, welcomeEmail };
  }

  public static verifyUser(userId: string, codeOrToken: string): User {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const user = users[userIndex];
    const cleanCode = codeOrToken.trim();

    if (user.verificationCode !== cleanCode && user.verificationToken !== cleanCode) {
      throw new Error('Invalid verification code or link. Please check your email and try again.');
    }

    const now = Date.now();
    user.isVerified = true;
    user.verifiedAt = now;
    user.recentActivity.unshift({
      id: `act_${Date.now()}_verified`,
      action: 'Email Verified',
      details: 'Account successfully verified via automated email code',
      timestamp: now,
      ip: '127.0.0.1 (Local Client)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
      status: 'success',
    });

    users[userIndex] = user;
    this.saveUsers(users);

    // Add security update notification email
    this.addEmail({
      id: `mail_${Date.now()}_sec`,
      userId: user.id,
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      subject: 'Security Alert: Account Email Verified',
      type: 'security_update',
      content: `Hi ${user.firstName},\n\nYour Firestorm account (${user.id}) has been successfully verified! You now hold a Verified Status badge on your dashboard.`,
      timestamp: now,
      isRead: false,
    });

    return user;
  }

  public static resendVerificationEmail(userId: string): EmailMessage {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const user = users[userIndex];
    const newCode = generateVerificationCode();
    const newToken = generateToken();
    const now = Date.now();

    user.verificationCode = newCode;
    user.verificationToken = newToken;
    user.verificationSentAt = now;

    user.recentActivity.unshift({
      id: `act_${Date.now()}_resend`,
      action: 'Verification Email Resent',
      details: `New verification code #${newCode} dispatched to ${user.email}`,
      timestamp: now,
      ip: 'Firestorm Mail Dispatcher',
      device: 'System Service',
      status: 'info',
    });

    users[userIndex] = user;
    this.saveUsers(users);

    const email: EmailMessage = {
      id: `mail_${Date.now()}_resend`,
      userId: user.id,
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      subject: `Firestorm Verification Code: ${newCode}`,
      type: 'welcome_verification',
      verificationCode: newCode,
      token: newToken,
      content: `Hello ${user.firstName},\n\nHere is your new verification code: ${newCode}.\nYour 12-digit User ID is ${user.id}. Please use this code to verify your account.`,
      timestamp: now,
      isRead: false,
    };

    this.addEmail(email);
    return email;
  }

  public static requestPasswordReset(email: string): { success: boolean; resetEmail?: EmailMessage } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(cleanEmail);
    if (!user) {
      // Return success simulation to prevent user enumeration
      return { success: true };
    }

    const resetToken = generateToken();
    const resetCode = generateVerificationCode();
    const now = Date.now();

    const resetEmail: EmailMessage = {
      id: `mail_${Date.now()}_pw_reset`,
      userId: user.id,
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      subject: `Firestorm Password Reset Request (Code: ${resetCode})`,
      type: 'password_reset',
      verificationCode: resetCode,
      token: resetToken,
      content: `Hello ${user.firstName},\n\nA password reset was requested for your Firestorm account (ID: ${user.id}).\n\nYour password reset verification code is: ${resetCode}.\n\nIf you did not request this, please ignore this email.`,
      timestamp: now,
      isRead: false,
    };

    this.addEmail(resetEmail);

    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].recentActivity.unshift({
        id: `act_${Date.now()}_pw_req`,
        action: 'Password Reset Requested',
        details: `Reset authorization code dispatched to ${user.email}`,
        timestamp: now,
        ip: 'Firestorm Auth Gate',
        device: 'System Service',
        status: 'warning',
      });
      this.saveUsers(users);
    }

    return { success: true, resetEmail };
  }

  public static async executePasswordReset(email: string, codeOrToken: string, newPasswordPlain: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('User not found.');
    }

    // Verify recent reset email exists
    const emails = this.getStoredEmails();
    const resetMail = emails.find(
      e => e.userId === user.id && e.type === 'password_reset' && (e.verificationCode === codeOrToken.trim() || e.token === codeOrToken.trim())
    );

    if (!resetMail) {
      throw new Error('Invalid or expired password reset code. Please request a new one.');
    }

    const newHash = await hashPassword(newPasswordPlain);
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    const now = Date.now();

    users[userIndex].passwordHash = newHash;
    users[userIndex].recentActivity.unshift({
      id: `act_${Date.now()}_pw_changed`,
      action: 'Password Changed',
      details: 'Password was successfully updated via password reset workflow',
      timestamp: now,
      ip: '127.0.0.1 (Local Client)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
      status: 'success',
    });

    this.saveUsers(users);

    // Send confirmation email
    this.addEmail({
      id: `mail_${Date.now()}_pw_success`,
      userId: user.id,
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      subject: 'Security Alert: Your Firestorm Password Has Been Reset',
      type: 'security_update',
      content: `Hello ${user.firstName},\n\nYour Firestorm account password was successfully changed. If you did not perform this action, please lock your account immediately.`,
      timestamp: now,
      isRead: false,
    });

    return users[userIndex];
  }

  public static toggleMfa(userId: string, enable: boolean): { user: User; backupCodes?: string[] } {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const user = users[userIndex];
    const now = Date.now();
    let backupCodes: string[] | undefined = undefined;

    if (enable) {
      user.mfaEnabled = true;
      user.mfaSecret = user.mfaSecret || 'FST' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'MFA';
      backupCodes = [
        'FST-' + Math.floor(1000 + Math.random() * 9000),
        'FST-' + Math.floor(1000 + Math.random() * 9000),
        'FST-' + Math.floor(1000 + Math.random() * 9000),
        'FST-' + Math.floor(1000 + Math.random() * 9000),
      ];
      user.backupCodes = backupCodes;

      user.recentActivity.unshift({
        id: `act_${Date.now()}_mfa_on`,
        action: 'MFA Layer Activated',
        details: 'Multi-factor authentication enabled in account settings',
        timestamp: now,
        ip: '127.0.0.1 (Local Client)',
        device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
        status: 'success',
      });
    } else {
      user.mfaEnabled = false;
      user.recentActivity.unshift({
        id: `act_${Date.now()}_mfa_off`,
        action: 'MFA Layer Disabled',
        details: 'Multi-factor authentication turned off in account settings',
        timestamp: now,
        ip: '127.0.0.1 (Local Client)',
        device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
        status: 'warning',
      });
    }

    users[userIndex] = user;
    this.saveUsers(users);

    this.addEmail({
      id: `mail_${Date.now()}_mfa_alert`,
      userId: user.id,
      to: user.email,
      recipientName: `${user.firstName} ${user.lastName}`,
      subject: `Security Alert: Multi-Factor Authentication ${enable ? 'Enabled' : 'Disabled'}`,
      type: 'mfa_alert',
      content: `Hello ${user.firstName},\n\nMulti-Factor Authentication (MFA) was ${enable ? 'ENABLED' : 'DISABLED'} for your Firestorm account (ID: ${user.id}).`,
      timestamp: now,
      isRead: false,
    });

    return { user, backupCodes };
  }

  public static async authenticate(email: string, passwordPlain: string): Promise<{ user?: User; requiresMfa?: boolean; userId?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Demo password bypass or hash comparison
    const incomingHash = await hashPassword(passwordPlain);
    const isDemoMatch = user.passwordHash === 'demo_user_hash_123' && passwordPlain === 'Firestorm@123';
    const isDirectMatch = user.passwordHash === incomingHash;

    if (!isDemoMatch && !isDirectMatch) {
      throw new Error('Invalid email or password.');
    }

    if (user.mfaEnabled) {
      return { requiresMfa: true, userId: user.id };
    }

    // Update last login
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    const now = Date.now();
    users[userIndex].lastLoginAt = now;
    users[userIndex].recentActivity.unshift({
      id: `act_${Date.now()}_login`,
      action: 'Successful Sign In',
      details: 'User authenticated with password',
      timestamp: now,
      ip: '127.0.0.1 (Local Client)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
      status: 'success',
    });
    this.saveUsers(users);

    return { user: users[userIndex] };
  }

  public static verifyMfaLogin(userId: string, code: string): User {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    const user = users[userIndex];
    const cleanCode = code.trim().toUpperCase();

    // Accept 6-digit code or matching backup code or standard simulator code (e.g. 123456 or recent secret)
    const isBackupMatch = user.backupCodes?.includes(cleanCode);
    const isTotpMatch = cleanCode.length === 6 && /^\d+$/.test(cleanCode);

    if (!isBackupMatch && !isTotpMatch && cleanCode !== '123456') {
      throw new Error('Invalid MFA authentication code or backup code. Try 123456 or your backup code.');
    }

    // If backup code was used, remove it
    if (isBackupMatch && user.backupCodes) {
      user.backupCodes = user.backupCodes.filter(c => c !== cleanCode);
    }

    const now = Date.now();
    user.lastLoginAt = now;
    user.recentActivity.unshift({
      id: `act_${Date.now()}_mfa_login`,
      action: 'MFA Verified Sign In',
      details: `Authenticated with ${isBackupMatch ? 'Emergency Backup Code' : 'MFA Authenticator Code'}`,
      timestamp: now,
      ip: '127.0.0.1 (Local Client)',
      device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : 'Browser',
      status: 'success',
    });

    users[userIndex] = user;
    this.saveUsers(users);

    return user;
  }

  public static markEmailAsRead(emailId: string): void {
    const emails = this.getStoredEmails();
    const emailIndex = emails.findIndex(e => e.id === emailId);
    if (emailIndex !== -1) {
      emails[emailIndex].isRead = true;
      this.saveEmails(emails);
    }
  }

  public static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_USERS_KEY);
    localStorage.removeItem(STORAGE_EMAILS_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}
