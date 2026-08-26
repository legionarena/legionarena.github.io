export interface User {
  id: string; // 12-character alphanumeric UID e.g. FS-9842-1204
  callsign: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode: string;
  verificationExpiresAt: number;
  resetCode?: string;
  resetExpiresAt?: number;
  rank: string;
  rating: number;
  matchesWon: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface DispatchedEmail {
  id: string;
  to: string;
  subject: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET';
  code: string;
  body: string;
  sentAt: string;
  isRead: boolean;
}

export interface DbState {
  users: User[];
  currentUserId: string | null;
  emailOutbox: DispatchedEmail[];
}
