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
  highScores?: {
    codePressed?: number;
    slotsUp?: number;
    blockDrop?: number;
  };
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

export interface GameHighScore {
  id: string;
  gameId: 'code-pressed' | 'slots-up' | 'block-drop';
  gameName: string;
  userId: string;
  userCallsign: string;
  userUid: string;
  score: number;
  details: string;
  createdAt: string;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  thumb: string;
  addedAt: string;
}

export interface UserPlaylist {
  id: string;
  userId: string;
  userCallsign: string;
  name: string;
  tracks: PlaylistTrack[];
  updatedAt: string;
}

export interface IntelThread {
  id: string;
  title: string;
  callsignTag: string;
  category: 'WARZONE_OPS' | 'FORTNITE_BR' | 'META_LOADOUT' | 'TACTICAL_RECON';
  description: string;
  briefing: string;
  badge: string;
  themeColor: string;
  accentBorder: string;
  postCount?: number;
}

export interface IntelPost {
  id: string;
  threadId: string;
  userId: string;
  userCallsign: string;
  userRank: string;
  userUid: string;
  content: string;
  imageBase64?: string; // base64 encoded image string (data:image/...)
  imageName?: string;
  reactions: {
    fire: number;
    target: number;
    shield: number;
    usersReacted: Record<string, string[]>; // reactionType -> array of userIds
  };
  createdAt: string;
  updatedAt?: string;
}

export interface DbState {
  users: User[];
  currentUserId: string | null;
  emailOutbox: DispatchedEmail[];
  highScores: GameHighScore[];
  playlists: UserPlaylist[];
  posts: IntelPost[];
}

