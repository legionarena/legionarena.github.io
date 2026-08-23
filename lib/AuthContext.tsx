'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, EmailMessage } from './types';
import { FirestormDatabase } from './db';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  emailsList: EmailMessage[];
  unreadEmailCount: number;
  isLoading: boolean;
  pendingMfaUserId: string | null;
  isEmailDrawerOpen: boolean;
  isDbModalOpen: boolean;
  selectedEmailForViewing: EmailMessage | null;
  
  // Actions
  signUp: (firstName: string, lastName: string, email: string, passwordPlain: string) => Promise<User>;
  signIn: (email: string, passwordPlain: string) => Promise<{ requiresMfa?: boolean; userId?: string }>;
  submitMfaCode: (code: string) => Promise<User>;
  cancelMfaLogin: () => void;
  signOut: () => void;
  verifyEmail: (codeOrToken: string, userId?: string) => Promise<void>;
  resendVerification: (userId?: string) => Promise<EmailMessage>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; resetEmail?: EmailMessage }>;
  executePasswordReset: (email: string, codeOrToken: string, newPassword: string) => Promise<void>;
  toggleMfa: (enable: boolean) => { user: User; backupCodes?: string[] };
  refreshData: () => void;
  openEmailDrawer: (email?: EmailMessage) => void;
  closeEmailDrawer: () => void;
  setDbModalOpen: (open: boolean) => void;
  markEmailRead: (emailId: string) => void;
  switchUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_SESSION_KEY = 'firestorm_active_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersList, setUsersList] = useState<User[]>(() => {
    if (typeof window === 'undefined') return [];
    return FirestormDatabase.getAllUsers();
  });
  const [emailsList, setEmailsList] = useState<EmailMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    return FirestormDatabase.getStoredEmails();
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const activeId = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (!activeId) return null;
    const allUsers = FirestormDatabase.getAllUsers();
    return allUsers.find(u => u.id === activeId) || null;
  });
  const [pendingMfaUserId, setPendingMfaUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [selectedEmailForViewing, setSelectedEmailForViewing] = useState<EmailMessage | null>(null);

  const refreshData = useCallback(() => {
    const allUsers = FirestormDatabase.getAllUsers();
    const allEmails = FirestormDatabase.getStoredEmails();
    setUsersList([...allUsers]);
    setEmailsList([...allEmails]);

    const activeId = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (activeId) {
      const found = allUsers.find(u => u.id === activeId);
      if (found) {
        setCurrentUser(found);
      }
    }
  }, []);

  const unreadEmailCount = emailsList.filter(e => !e.isRead).length;

  const triggerConfetti = () => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((module) => {
          const confettiFunc = module.default || module;
          if (typeof confettiFunc === 'function') {
            confettiFunc({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff4500', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
            });
          }
        })
        .catch(() => {
          // ignore if unavailable
        });
    }
  };

  const signUp = async (firstName: string, lastName: string, email: string, passwordPlain: string): Promise<User> => {
    const { user, welcomeEmail } = await FirestormDatabase.registerUser(firstName, lastName, email, passwordPlain);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, user.id);
    setCurrentUser(user);
    refreshData();
    // Auto open email notification highlight
    setSelectedEmailForViewing(welcomeEmail);
    return user;
  };

  const signIn = async (email: string, passwordPlain: string) => {
    const res = await FirestormDatabase.authenticate(email, passwordPlain);
    if (res.requiresMfa && res.userId) {
      setPendingMfaUserId(res.userId);
      return { requiresMfa: true, userId: res.userId };
    }
    if (res.user) {
      localStorage.setItem(CURRENT_USER_SESSION_KEY, res.user.id);
      setCurrentUser(res.user);
      setPendingMfaUserId(null);
      refreshData();
    }
    return {};
  };

  const submitMfaCode = async (code: string): Promise<User> => {
    if (!pendingMfaUserId) throw new Error('No pending MFA session.');
    const user = FirestormDatabase.verifyMfaLogin(pendingMfaUserId, code);
    localStorage.setItem(CURRENT_USER_SESSION_KEY, user.id);
    setCurrentUser(user);
    setPendingMfaUserId(null);
    refreshData();
    return user;
  };

  const cancelMfaLogin = () => {
    setPendingMfaUserId(null);
  };

  const signOut = () => {
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    setCurrentUser(null);
    setPendingMfaUserId(null);
    refreshData();
  };

  const verifyEmail = async (codeOrToken: string, targetUserId?: string): Promise<void> => {
    const uid = targetUserId || currentUser?.id;
    if (!uid) throw new Error('No active user to verify.');
    const updated = FirestormDatabase.verifyUser(uid, codeOrToken);
    setCurrentUser(updated);
    refreshData();
    triggerConfetti();
  };

  const resendVerification = async (targetUserId?: string): Promise<EmailMessage> => {
    const uid = targetUserId || currentUser?.id;
    if (!uid) throw new Error('No active user to resend verification.');
    const email = FirestormDatabase.resendVerificationEmail(uid);
    refreshData();
    setSelectedEmailForViewing(email);
    return email;
  };

  const requestPasswordReset = async (email: string) => {
    const res = FirestormDatabase.requestPasswordReset(email);
    refreshData();
    if (res.resetEmail) {
      setSelectedEmailForViewing(res.resetEmail);
    }
    return res;
  };

  const executePasswordReset = async (email: string, codeOrToken: string, newPassword: string) => {
    const user = await FirestormDatabase.executePasswordReset(email, codeOrToken, newPassword);
    refreshData();
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const toggleMfa = (enable: boolean) => {
    if (!currentUser) throw new Error('No logged in user.');
    const res = FirestormDatabase.toggleMfa(currentUser.id, enable);
    setCurrentUser(res.user);
    refreshData();
    return res;
  };

  const openEmailDrawer = (email?: EmailMessage) => {
    if (email) setSelectedEmailForViewing(email);
    setIsEmailDrawerOpen(true);
  };

  const closeEmailDrawer = () => {
    setIsEmailDrawerOpen(false);
  };

  const markEmailRead = (emailId: string) => {
    FirestormDatabase.markEmailAsRead(emailId);
    refreshData();
  };

  const switchUser = (user: User) => {
    localStorage.setItem(CURRENT_USER_SESSION_KEY, user.id);
    setCurrentUser(user);
    refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        emailsList,
        unreadEmailCount,
        isLoading,
        pendingMfaUserId,
        isEmailDrawerOpen,
        isDbModalOpen,
        selectedEmailForViewing,
        signUp,
        signIn,
        submitMfaCode,
        cancelMfaLogin,
        signOut,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        executePasswordReset,
        toggleMfa,
        refreshData,
        openEmailDrawer,
        closeEmailDrawer,
        setDbModalOpen: setIsDbModalOpen,
        markEmailRead,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
