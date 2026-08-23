export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: number;
  ip: string;
  device: string;
  status: 'success' | 'warning' | 'info';
}

export interface User {
  id: string; // 12-digit alphanumeric unique identifier (e.g. "FST8-K9M2-P4X7" or "9X2KM8B1R4T7")
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode: string; // 6-digit code
  verificationToken: string;
  verificationSentAt: number;
  verifiedAt?: number;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  createdAt: number;
  lastLoginAt: number;
  recentActivity: ActivityLog[];
}

export interface EmailMessage {
  id: string;
  userId: string;
  to: string;
  recipientName: string;
  subject: string;
  type: 'welcome_verification' | 'password_reset' | 'mfa_alert' | 'security_update';
  verificationCode?: string;
  token?: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  pendingMfa?: {
    userId: string;
    email: string;
    rememberMe?: boolean;
  } | null;
}
