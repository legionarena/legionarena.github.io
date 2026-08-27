import { User, DispatchedEmail, DbState, GameHighScore, UserPlaylist, IntelThread, IntelPost } from './types';

const DB_STORAGE_KEY = 'firestorm_tournaments_db_v2';

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

// Pre-defined Fortnite & Call of Duty tactical threads
export const THEMED_THREADS: IntelThread[] = [
  {
    id: 'verdansk-intel-drop',
    title: 'Verdansk Air Drop & Sector Recon',
    callsignTag: 'WARZONE // SECTOR 01',
    category: 'WARZONE_OPS',
    description: 'Classified drop coordinates, sector sweep intel, and high-ground vantage points across Warzone.',
    briefing: 'Post weapon tuning, buy-station strategies, and UAV positioning guides.',
    badge: 'WARZONE AIR RECON',
    themeColor: 'text-amber-400',
    accentBorder: 'border-amber-500/50'
  },
  {
    id: 'tilted-towers-ops',
    title: 'Tilted Towers & Zero-Build Flank Ops',
    callsignTag: 'FORTNITE BR // GRID T-4',
    category: 'FORTNITE_BR',
    description: 'Hot-drop survival doctrines, mythic vault breaches, and storm-circle rotations in Fortnite Battle Royale.',
    briefing: 'Share tactical positioning, shockwave mobility routes, and loadout pairings.',
    badge: 'ROYALE COMBAT',
    themeColor: 'text-orange-500',
    accentBorder: 'border-orange-500/50'
  },
  {
    id: 'gulag-meta-loadouts',
    title: 'Gulag 1v1 Protocol & Weapon Meta',
    callsignTag: 'TACTICAL // LOADOUTS',
    category: 'META_LOADOUT',
    description: 'Optimal attachment tuning, recoil stabilization setups, and 1v1 clutch psychology.',
    briefing: 'Share your tested class setups, laser alignments, and slide-cancel corner breaks.',
    badge: 'GULAG SURVIVOR',
    themeColor: 'text-red-400',
    accentBorder: 'border-red-500/50'
  },
  {
    id: 'loot-lake-supply-run',
    title: 'Loot Lake & Supply Vault Drops',
    callsignTag: 'FORTNITE // CACHE RUN',
    category: 'FORTNITE_BR',
    description: 'Caches, mythic chests, and supply drop timing matrices.',
    briefing: 'Debrief drop coordinates, vault keys, and tactical supply crate distribution.',
    badge: 'VAULT INFILTRATION',
    themeColor: 'text-cyan-400',
    accentBorder: 'border-cyan-500/50'
  },
  {
    id: 'victory-royale-debrief',
    title: 'Victory Royale & Warzone Champion Debriefs',
    callsignTag: 'COMMAND // POST-ACTION',
    category: 'TACTICAL_RECON',
    description: 'Squad victory screenshots, final circle clutches, and tactical post-match reports.',
    briefing: 'Upload your highest elimination cards, final zone holds, and championship match debriefs.',
    badge: 'CHAMPIONS CIRCLE',
    themeColor: 'text-emerald-400',
    accentBorder: 'border-emerald-500/50'
  }
];

// Initial state with verified demo player, high scores, playlist, and community posts
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
      highScores: {
        codePressed: 142,
        slotsUp: 2850
      },
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      lastLoginAt: new Date().toISOString()
    },
    {
      id: 'FS-4412-8801',
      callsign: 'ApexViper',
      email: 'viper@firestorm.gg',
      passwordHash: hashPassword('password123'),
      isVerified: true,
      verificationCode: '654321',
      verificationExpiresAt: Date.now() + 86400000,
      rank: 'Master Sergeant',
      rating: 2210,
      matchesWon: 34,
      highScores: {
        codePressed: 118,
        slotsUp: 1980
      },
      createdAt: new Date(Date.now() - 500000000).toISOString(),
      lastLoginAt: new Date().toISOString()
    },
    {
      id: 'FS-3199-5520',
      callsign: 'ShadowRecon',
      email: 'shadow@firestorm.gg',
      passwordHash: hashPassword('password123'),
      isVerified: true,
      verificationCode: '112233',
      verificationExpiresAt: Date.now() + 86400000,
      rank: 'Tactical Captain',
      rating: 2380,
      matchesWon: 41,
      highScores: {
        codePressed: 165,
        slotsUp: 3400
      },
      createdAt: new Date(Date.now() - 400000000).toISOString(),
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
  ],
  highScores: [
    {
      id: 'hs-cp-01',
      gameId: 'code-pressed',
      gameName: 'Cold Pressed Combat Arena',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 165,
      details: 'Level 7 • 165 Targets Pressed • Flawless Jar Movement',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'hs-cp-02',
      gameId: 'code-pressed',
      gameName: 'Cold Pressed Combat Arena',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 142,
      details: 'Level 6 • 142 Targets Pressed • Rapid Dodge Protocol',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'hs-cp-03',
      gameId: 'code-pressed',
      gameName: 'Cold Pressed Combat Arena',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 118,
      details: 'Level 5 • 118 Targets Pressed',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'hs-sl-01',
      gameId: 'slots-up',
      gameName: '7x7 Supply Drop Matrix',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 3400,
      details: '3,400 Credits • 6-Crown Anchor Jackpot Hit',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'hs-sl-02',
      gameId: 'slots-up',
      gameName: '7x7 Supply Drop Matrix',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 2850,
      details: '2,850 Credits • 5-Diamond Alignment & Bonus Pot',
      createdAt: new Date(Date.now() - 129600000).toISOString()
    },
    {
      id: 'hs-sl-03',
      gameId: 'slots-up',
      gameName: '7x7 Supply Drop Matrix',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 1980,
      details: '1,980 Credits • Triple Line Combos',
      createdAt: new Date(Date.now() - 216000000).toISOString()
    }
  ],
  playlists: [
    {
      id: 'pl-init-01',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      name: 'Warzone High-Octane Recon Beats',
      tracks: [
        {
          id: '5qap5aO4i9A',
          title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
          thumb: 'https://i.ytimg.com/vi/5qap5aO4i9A/default.jpg',
          addedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'jfKfPfyJRdk',
          title: 'Synthwave Radio - Chill synth / electro / cyberpunk beats',
          thumb: 'https://i.ytimg.com/vi/jfKfPfyJRdk/default.jpg',
          addedAt: new Date(Date.now() - 43200000).toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    }
  ],
  posts: [
    {
      id: 'post-init-01',
      threadId: 'verdansk-intel-drop',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userRank: 'Elite Commander',
      userUid: 'FS-9842-1204',
      content: '⚡ Verdansk High-Ground Protocol: When pushing Airport Tower or Stadium roof, always coordinate suppression smoke with a portable radar sweep before ascending zip-lines. Keep high-mobility SMG as secondary.',
      imageBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="100%" height="100%" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23f59e0b" stroke-width="2"/><text x="300" y="140" fill="%23fbbf24" font-family="monospace" font-size="22" font-weight="bold" text-anchor="middle">VERDANSK RADAR SCAN</text><text x="300" y="180" fill="%2394a3b8" font-family="monospace" font-size="14" text-anchor="middle">SECTOR 04 // AIRPORT TOWER LZ</text><circle cx="300" cy="240" r="30" fill="none" stroke="%23ef4444" stroke-width="3"/><circle cx="300" cy="240" r="10" fill="%23ef4444"/></svg>',
      imageName: 'verdansk_radar_scan.svg',
      reactions: {
        fire: 7,
        target: 4,
        shield: 2,
        usersReacted: { fire: ['FS-4412-8801', 'FS-3199-5520'] }
      },
      createdAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: 'post-init-02',
      threadId: 'tilted-towers-ops',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userRank: 'Tactical Captain',
      userUid: 'FS-3199-5520',
      content: '🎯 Tilted Towers Zero-Build Flank: Land on the Clock Tower terrace, grab the guaranteed floor loot shotgun, then zip across to Big Red rooftop. You hold 360-degree vision over central courtyards without building exposure.',
      imageBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="100%" height="100%" fill="%230b0f19"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%23131b2e" stroke="%23ff5500" stroke-width="2"/><text x="300" y="130" fill="%23ff6600" font-family="monospace" font-size="22" font-weight="bold" text-anchor="middle">TILTED TOWERS VANTAGE</text><text x="300" y="170" fill="%2338bdf8" font-family="monospace" font-size="14" text-anchor="middle">CLOCK TOWER &bull; ZERO-BUILD HIGH GROUND</text><path d="M 220 250 L 300 200 L 380 250 Z" fill="%23f97316"/></svg>',
      imageName: 'tilted_clock_tower_intel.svg',
      reactions: {
        fire: 9,
        target: 5,
        shield: 3,
        usersReacted: { fire: ['FS-9842-1204'] }
      },
      createdAt: new Date(Date.now() - 54000000).toISOString()
    },
    {
      id: 'post-init-03',
      threadId: 'gulag-meta-loadouts',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userRank: 'Master Sergeant',
      userUid: 'FS-4412-8801',
      content: '🔥 Gulag Clutch Tip: Center your crosshair at head-height around the center flag partition right at the 3-second spawn mark. Pre-cook stun grenade off the back wall for guaranteed 80ms advantage.',
      reactions: {
        fire: 5,
        target: 8,
        shield: 1,
        usersReacted: {}
      },
      createdAt: new Date(Date.now() - 28000000).toISOString()
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

    // Ensure all new fields exist
    if (!parsed.highScores || !Array.isArray(parsed.highScores)) {
      parsed.highScores = INITIAL_STATE.highScores;
    }
    if (!parsed.playlists || !Array.isArray(parsed.playlists)) {
      parsed.playlists = INITIAL_STATE.playlists;
    }
    if (!parsed.posts || !Array.isArray(parsed.posts)) {
      parsed.posts = INITIAL_STATE.posts;
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
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('firestorm_db_updated', { detail: state }));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

// ==========================================
// 1. HIGH SCORES SYSTEM
// ==========================================

export function saveGameHighScore(
  gameId: 'code-pressed' | 'slots-up',
  score: number,
  details: string,
  userOverride?: User | null
): { success: boolean; isNewPersonalBest: boolean; highScore: GameHighScore } {
  const state = loadDatabase();
  const currentUser = userOverride || (state.currentUserId ? state.users.find(u => u.id === state.currentUserId) : null);

  const userId = currentUser ? currentUser.id : 'FS-GUEST-0000';
  const userCallsign = currentUser ? currentUser.callsign : 'TacticalOperative';
  const userUid = currentUser ? currentUser.id : 'FS-GUEST';

  const gameName = gameId === 'code-pressed' ? 'Cold Pressed Combat Arena' : '7x7 Supply Drop Matrix';

  const newScoreEntry: GameHighScore = {
    id: `hs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gameId,
    gameName,
    userId,
    userCallsign,
    userUid,
    score,
    details,
    createdAt: new Date().toISOString()
  };

  state.highScores.push(newScoreEntry);

  let isNewPersonalBest = false;

  // Update user's personal best & rating
  if (currentUser) {
    const userIndex = state.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      const user = state.users[userIndex];
      if (!user.highScores) user.highScores = {};

      const currentBest = gameId === 'code-pressed' ? (user.highScores.codePressed || 0) : (user.highScores.slotsUp || 0);

      if (score > currentBest) {
        isNewPersonalBest = true;
        if (gameId === 'code-pressed') user.highScores.codePressed = score;
        if (gameId === 'slots-up') user.highScores.slotsUp = score;

        // Give rating boost for breaking personal records
        user.rating = (user.rating || 1000) + Math.min(150, Math.floor(score / 5));
        if (user.rating > 2800) user.rank = 'Grand Commander';
        else if (user.rating > 2400) user.rank = 'Elite Commander';
        else if (user.rating > 2000) user.rank = 'Tactical Captain';
        else if (user.rating > 1600) user.rank = 'Master Sergeant';
        else user.rank = 'Operative';

        state.users[userIndex] = user;
      }
    }
  }

  saveDatabase(state);
  return { success: true, isNewPersonalBest, highScore: newScoreEntry };
}

export function getHighScores(gameId?: 'code-pressed' | 'slots-up'): GameHighScore[] {
  const state = loadDatabase();
  let scores = state.highScores || [];
  if (gameId) {
    scores = scores.filter(s => s.gameId === gameId);
  }
  return scores.sort((a, b) => b.score - a.score);
}

export function getUserPersonalBests(userId: string): { codePressed: number; slotsUp: number } {
  const state = loadDatabase();
  const user = state.users.find(u => u.id === userId);
  return {
    codePressed: user?.highScores?.codePressed || 0,
    slotsUp: user?.highScores?.slotsUp || 0
  };
}

// ==========================================
// 2. PLAYLIST SYSTEM (MUSIC SEARCH)
// ==========================================

export function saveUserPlaylist(
  name: string,
  tracks: Array<{ id: string; title: string; thumb: string; addedAt: string }>,
  userOverride?: User | null
): UserPlaylist {
  const state = loadDatabase();
  const currentUser = userOverride || (state.currentUserId ? state.users.find(u => u.id === state.currentUserId) : null);

  const userId = currentUser ? currentUser.id : 'FS-GUEST-0000';
  const userCallsign = currentUser ? currentUser.callsign : 'GhostRider';

  const existingIndex = state.playlists.findIndex(p => p.userId === userId && p.name === name);
  let updatedPlaylist: UserPlaylist;

  if (existingIndex !== -1) {
    updatedPlaylist = {
      ...state.playlists[existingIndex],
      tracks,
      updatedAt: new Date().toISOString()
    };
    state.playlists[existingIndex] = updatedPlaylist;
  } else {
    updatedPlaylist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userCallsign,
      name,
      tracks,
      updatedAt: new Date().toISOString()
    };
    state.playlists.push(updatedPlaylist);
  }

  // Also sync to yt_playlist for direct compatibility
  if (typeof window !== 'undefined') {
    localStorage.setItem('yt_playlist', JSON.stringify(tracks));
  }

  saveDatabase(state);
  return updatedPlaylist;
}

export function getUserPlaylists(userId: string): UserPlaylist[] {
  const state = loadDatabase();
  return (state.playlists || []).filter(p => p.userId === userId);
}

// ==========================================
// 3. PUBLIC POSTS & THEMED INTEL THREADS
// ==========================================

export function getIntelThreads(): IntelThread[] {
  const state = loadDatabase();
  return THEMED_THREADS.map(thread => {
    const threadPosts = (state.posts || []).filter(p => p.threadId === thread.id);
    return {
      ...thread,
      postCount: threadPosts.length
    };
  });
}

export function getPostsForThread(threadId: string): IntelPost[] {
  const state = loadDatabase();
  return (state.posts || [])
    .filter(p => p.threadId === threadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllPosts(): IntelPost[] {
  const state = loadDatabase();
  return (state.posts || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserPostInThread(threadId: string, userId: string): IntelPost | null {
  const state = loadDatabase();
  return (state.posts || []).find(p => p.threadId === threadId && p.userId === userId) || null;
}

// User can post ONE message per thread (or update their existing post) with ONE base64 image
export function createOrUpdateIntelPost(
  threadId: string,
  content: string,
  imageBase64?: string,
  imageName?: string,
  userOverride?: User | null
): { success: boolean; message: string; post?: IntelPost; isUpdate?: boolean } {
  const state = loadDatabase();
  const currentUser = userOverride || (state.currentUserId ? state.users.find(u => u.id === state.currentUserId) : null);

  if (!currentUser) {
    return { success: false, message: 'Only authenticated & verified operatives can dispatch intel posts.' };
  }

  const cleanContent = content.trim();
  if (!cleanContent) {
    return { success: false, message: 'Intel briefing message cannot be blank.' };
  }

  const existingPostIndex = state.posts.findIndex(p => p.threadId === threadId && p.userId === currentUser.id);

  if (existingPostIndex !== -1) {
    // Update existing post in this thread
    const updatedPost: IntelPost = {
      ...state.posts[existingPostIndex],
      content: cleanContent,
      imageBase64: imageBase64 || state.posts[existingPostIndex].imageBase64,
      imageName: imageName || state.posts[existingPostIndex].imageName,
      userRank: currentUser.rank || 'Operative',
      userCallsign: currentUser.callsign,
      updatedAt: new Date().toISOString()
    };

    state.posts[existingPostIndex] = updatedPost;
    saveDatabase(state);
    return {
      success: true,
      message: `Your transmission in this thread has been updated. (Rule: 1 message per thread).`,
      post: updatedPost,
      isUpdate: true
    };
  }

  // Create single new post in this thread
  const newPost: IntelPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    threadId,
    userId: currentUser.id,
    userCallsign: currentUser.callsign,
    userRank: currentUser.rank || 'Operative',
    userUid: currentUser.id,
    content: cleanContent,
    imageBase64: imageBase64 || undefined,
    imageName: imageName || undefined,
    reactions: {
      fire: 0,
      target: 0,
      shield: 0,
      usersReacted: {}
    },
    createdAt: new Date().toISOString()
  };

  state.posts.unshift(newPost);
  saveDatabase(state);

  return {
    success: true,
    message: `Transmission dispatched to tactical thread! (Single-post limit secured).`,
    post: newPost,
    isUpdate: false
  };
}

export function deleteIntelPost(postId: string, userId: string): { success: boolean; message: string } {
  const state = loadDatabase();
  const postIndex = state.posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return { success: false, message: 'Transmission not found.' };
  }

  if (state.posts[postIndex].userId !== userId) {
    return { success: false, message: 'Clearance denied. You can only delete your own transmission.' };
  }

  state.posts.splice(postIndex, 1);
  saveDatabase(state);
  return { success: true, message: 'Transmission purged from tactical feed.' };
}

export function togglePostReaction(
  postId: string,
  reactionType: 'fire' | 'target' | 'shield',
  userId: string
): { success: boolean; post?: IntelPost } {
  const state = loadDatabase();
  const post = state.posts.find(p => p.id === postId);

  if (!post) {
    return { success: false };
  }

  if (!post.reactions.usersReacted) {
    post.reactions.usersReacted = {};
  }
  if (!post.reactions.usersReacted[reactionType]) {
    post.reactions.usersReacted[reactionType] = [];
  }

  const userList = post.reactions.usersReacted[reactionType];
  const userIndex = userList.indexOf(userId);

  if (userIndex !== -1) {
    // Remove reaction
    userList.splice(userIndex, 1);
    post.reactions[reactionType] = Math.max(0, post.reactions[reactionType] - 1);
  } else {
    // Add reaction
    userList.push(userId);
    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
  }

  saveDatabase(state);
  return { success: true, post };
}

// ==========================================
// 4. AUTHENTICATION & CORE USER FLOWS
// ==========================================

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
    highScores: {
      codePressed: 0,
      slotsUp: 0
    },
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

