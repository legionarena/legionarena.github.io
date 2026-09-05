import { User, DispatchedEmail, DbState, GameHighScore, UserPlaylist, RpgSaveData } from './types';

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

// Pre-defined Community Discussion Threads
export const THEMED_THREADS: IntelThread[] = [
  {
    id: 'general-gaming-lounge',
    title: 'General Gaming',
    callsignTag: '#GAMING-01',
    category: 'WARZONE_OPS',
    description: 'Community chat, game recommendations, gear setups, and friendly matchmaking.',
    briefing: 'Share gaming setups, favorite moments, and connect with players.',
    badge: 'General Chat',
    themeColor: 'text-blue-500',
    accentBorder: 'border-blue-500/40'
  },
  {
    id: 'rpg-realm-tactics',
    title: 'Realm of Champions 3D',
    callsignTag: '#RPG-04',
    category: 'TACTICAL_RECON',
    description: 'Melee vs Caster builds, 8-slot gear theorycrafting, essence stat upgrades, and 256-kill boss raids.',
    briefing: 'Share ability rotations, resistance gearing, weapon speed damage multipliers, and level 50 progression guides.',
    badge: '3D Action RPG',
    themeColor: 'text-amber-500',
    accentBorder: 'border-amber-500/40'
  },
  {
    id: 'block-drop-tactics',
    title: 'Block Drop Matrix',
    callsignTag: '#MATRIX-02',
    category: 'TACTICAL_RECON',
    description: 'Scalable 5-block pentomino matrix strategies, combos, and line clear records.',
    briefing: 'Post rotation tactics, hold slot strategies, and level 15+ gameplay tips.',
    badge: 'Block Drop',
    themeColor: 'text-cyan-500',
    accentBorder: 'border-cyan-500/40'
  },
  {
    id: 'reaction-arcade-tips',
    title: 'Reaction Challenge',
    callsignTag: '#ARCADE-03',
    category: 'TACTICAL_RECON',
    description: 'Tips and high-score strategies for the Cold Pressed reaction dodger game.',
    briefing: 'Post dodge techniques, jar positioning tips, and multiplier guides.',
    badge: 'Arcade Tips',
    themeColor: 'text-orange-500',
    accentBorder: 'border-orange-500/40'
  },
  {
    id: 'supply-matrix-combos',
    title: 'Supply Grid',
    callsignTag: '#GRID-04',
    category: 'FORTNITE_BR',
    description: '7x7 emoji match combinations, multiplier triggers, and jackpot celebrations.',
    briefing: 'Share slot line records, bonus pot screenshots, and credit milestones.',
    badge: 'Supply Drops',
    themeColor: 'text-emerald-500',
    accentBorder: 'border-emerald-500/40'
  },
  {
    id: 'texas-holdem-tactics',
    title: "Texas Hold'em 3D",
    callsignTag: '#POKER-06',
    category: 'TACTICAL_RECON',
    description: 'Progressive jackpot pool theory, AI strategy counters, diminishing card pool management, and Straight Flush triggers.',
    briefing: 'Discuss pot odds calculations, lump sum reshuffle timing, and high-stakes heads up vs full table tactics.',
    badge: 'Texas Hold\'em',
    themeColor: 'text-amber-400',
    accentBorder: 'border-amber-400/40'
  },
  {
    id: 'music-playlists-vibes',
    title: 'Music & Playlists',
    callsignTag: '#AUDIO-05',
    category: 'META_LOADOUT',
    description: 'Share your favorite gaming beats, lofi study tunes, and tournament tracks.',
    briefing: 'Post playlist links, artist recommendations, and music player discoveries.',
    badge: 'Music Lounge',
    themeColor: 'text-indigo-500',
    accentBorder: 'border-indigo-500/40'
  },
  {
    id: 'champion-highlights-hall',
    title: 'Highlights Hall',
    callsignTag: '#CHAMPS-06',
    category: 'TACTICAL_RECON',
    description: 'Victory moments, leaderboard milestones, and player achievements.',
    briefing: 'Upload high score screenshots, clutch clips, and celebration posts.',
    badge: 'Hall of Fame',
    themeColor: 'text-amber-500',
    accentBorder: 'border-amber-500/40'
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
        slotsUp: 2850,
        blockDrop: 14800
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
        slotsUp: 1980,
        blockDrop: 9200
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
        slotsUp: 3400,
        blockDrop: 21500
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
      subject: 'Firestorm Tournaments: Welcome Player GhostRider',
      type: 'VERIFICATION',
      code: '772910',
      body: 'Welcome to Firestorm Tournaments! Your player ID is FS-9842-1204. Your verification code is 772910.',
      sentAt: new Date(Date.now() - 604800000).toISOString(),
      isRead: true
    }
  ],
  highScores: [
    {
      id: 'hs-rpg-01',
      gameId: 'rpg-game',
      gameName: 'Realm of Champions 3D',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 48500,
      details: 'Level 28 Melee Paladin • 312 Enemies Slain • Boss Defeated',
      createdAt: new Date(Date.now() - 28000000).toISOString()
    },
    {
      id: 'hs-rpg-02',
      gameId: 'rpg-game',
      gameName: 'Realm of Champions 3D',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 36200,
      details: 'Level 22 Caster Mage • 256 Area Clear • Meteor Spec',
      createdAt: new Date(Date.now() - 65000000).toISOString()
    },
    {
      id: 'hs-rpg-03',
      gameId: 'rpg-game',
      gameName: 'Realm of Champions 3D',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 24900,
      details: 'Level 16 Caster Sorcerer • 184 Kills • Epic Gear',
      createdAt: new Date(Date.now() - 98000000).toISOString()
    },
    {
      id: 'hs-bd-01',
      gameId: 'block-drop',
      gameName: 'Block Drop Matrix',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 21500,
      details: '38 lines cleared • Level 8 • 4x Quad Clears',
      createdAt: new Date(Date.now() - 36000000).toISOString()
    },
    {
      id: 'hs-bd-02',
      gameId: 'block-drop',
      gameName: 'Block Drop Matrix',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 14800,
      details: '26 lines cleared • Level 6 • Fast Drop Multiplier',
      createdAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: 'hs-bd-03',
      gameId: 'block-drop',
      gameName: 'Block Drop Matrix',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 9200,
      details: '18 lines cleared • Level 4 • Combo Streak',
      createdAt: new Date(Date.now() - 108000000).toISOString()
    },
    {
      id: 'hs-cp-01',
      gameId: 'code-pressed',
      gameName: 'Reaction Challenge',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 165,
      details: 'Level 7 • 165 Targets Caught • Flawless Movement',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'hs-cp-02',
      gameId: 'code-pressed',
      gameName: 'Reaction Challenge',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 142,
      details: 'Level 6 • 142 Targets Caught • Streak Bonus',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'hs-cp-03',
      gameId: 'code-pressed',
      gameName: 'Reaction Challenge',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 118,
      details: 'Level 5 • 118 Targets Caught',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'hs-sl-01',
      gameId: 'slots-up',
      gameName: 'Supply Grid',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 3400,
      details: '3,400 Credits • 6-Crown Jackpot Hit',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'hs-sl-02',
      gameId: 'slots-up',
      gameName: 'Supply Grid',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 2850,
      details: '2,850 Credits • 5-Diamond Alignment',
      createdAt: new Date(Date.now() - 129600000).toISOString()
    },
    {
      id: 'hs-sl-03',
      gameId: 'slots-up',
      gameName: 'Supply Grid',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userUid: 'FS-4412-8801',
      score: 1980,
      details: '1,980 Credits • Triple Line Combos',
      createdAt: new Date(Date.now() - 216000000).toISOString()
    },
    {
      id: 'hs-th-01',
      gameId: 'texas-holdem',
      gameName: "Texas Hold'em 3D",
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userUid: 'FS-3199-5520',
      score: 18500,
      details: 'Chips: $18,500 • Progressive Won: 1x (Straight Flush) • 42 Hands',
      createdAt: new Date(Date.now() - 28000000).toISOString()
    },
    {
      id: 'hs-th-02',
      gameId: 'texas-holdem',
      gameName: "Texas Hold'em 3D",
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userUid: 'FS-9842-1204',
      score: 12400,
      details: 'Chips: $12,400 • GTO Strategy Defense • 28 Hands',
      createdAt: new Date(Date.now() - 62000000).toISOString()
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
      threadId: 'general-gaming-lounge',
      userId: 'FS-9842-1204',
      userCallsign: 'GhostRider',
      userRank: 'Pro Player',
      userUid: 'FS-9842-1204',
      content: 'Welcome everyone to the PlayStorm community hub! Feel free to share your setups, game records, and connect with other players for casual and tournament matches.',
      imageBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="100%" height="100%" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%233b82f6" stroke-width="2"/><text x="300" y="140" fill="%2360a5fa" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">PLAYSTORM GAMING HUB</text><text x="300" y="180" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">COMMUNITY LOUNGE &bull; TOURNAMENTS</text><circle cx="300" cy="240" r="25" fill="%233b82f6"/><polygon points="295,230 310,240 295,250" fill="%23ffffff"/></svg>',
      imageName: 'welcome_hub.svg',
      reactions: {
        fire: 8,
        target: 5,
        shield: 3,
        usersReacted: { fire: ['FS-4412-8801', 'FS-3199-5520'] }
      },
      createdAt: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: 'post-init-02',
      threadId: 'reaction-arcade-tips',
      userId: 'FS-3199-5520',
      userCallsign: 'ShadowRecon',
      userRank: 'Arcade Ace',
      userUid: 'FS-3199-5520',
      content: 'Reaction Challenge Tip: Keep your paddle centered around the lower-middle zone during wave transitions. Focus on tracking the red hazard pulses early to maintain your combo streak!',
      imageBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="100%" height="100%" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23f97316" stroke-width="2"/><text x="300" y="130" fill="%23fb923c" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">REACTION ARCADE</text><text x="300" y="170" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">DODGE PROTOCOL &bull; HIGH SCORE SETUP</text><circle cx="300" cy="240" r="28" fill="%23ea580c"/></svg>',
      imageName: 'reaction_tips.svg',
      reactions: {
        fire: 11,
        target: 6,
        shield: 4,
        usersReacted: { fire: ['FS-9842-1204'] }
      },
      createdAt: new Date(Date.now() - 54000000).toISOString()
    },
    {
      id: 'post-init-03',
      threadId: 'supply-matrix-combos',
      userId: 'FS-4412-8801',
      userCallsign: 'ApexViper',
      userRank: 'Champion',
      userUid: 'FS-4412-8801',
      content: 'Hit a 5-crown combo on the Supply Grid today! If you build up the multiplier meter before max bet, the bonus payout activates with double points.',
      reactions: {
        fire: 9,
        target: 7,
        shield: 2,
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
    } else {
      // Deduplicate to ensure strictly 1 high score per user per game (keep peak record)
      const uniqueScores = new Map<string, GameHighScore>();
      for (const entry of parsed.highScores) {
        const key = `${entry.userId || entry.userUid}_${entry.gameId}`;
        const existing = uniqueScores.get(key);
        if (!existing || entry.score > existing.score) {
          uniqueScores.set(key, entry);
        }
      }
      parsed.highScores = Array.from(uniqueScores.values());
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
  gameId: 'code-pressed' | 'slots-up' | 'block-drop' | 'rpg-game' | 'emoji-tactics',
  score: number,
  details: string,
  userOverride?: User | null
): { success: boolean; isNewPersonalBest: boolean; highScore: GameHighScore } {
  const state = loadDatabase();
  const currentUser = userOverride || (state.currentUserId ? state.users.find(u => u.id === state.currentUserId) : null);

  const userId = currentUser ? currentUser.id : 'FS-GUEST-0000';
  const userCallsign = currentUser ? currentUser.callsign : 'TacticalOperative';
  const userUid = currentUser ? currentUser.id : 'FS-GUEST';

  let gameName = 'Block Drop Matrix';
  if (gameId === 'code-pressed') gameName = 'Reaction Challenge';
  if (gameId === 'slots-up') gameName = 'Supply Grid';
  if (gameId === 'rpg-game') gameName = 'Realm of Champions 3D';
  if (gameId === 'emoji-tactics') gameName = 'Emoji Tactics 3D';

  let isNewPersonalBest = false;
  let savedEntry: GameHighScore;

  // RULE: ONLY POST 1 HIGH SCORE PER USER
  // Check if this operative already has a posted score entry for this battle station
  const existingScoreIndex = state.highScores.findIndex(
    s => (s.userId === userId || (s.userUid && s.userUid === userUid)) && s.gameId === gameId
  );

  if (existingScoreIndex !== -1) {
    const existing = state.highScores[existingScoreIndex];
    if (score >= existing.score) {
      isNewPersonalBest = true;
      savedEntry = {
        ...existing,
        score,
        details,
        userCallsign,
        userUid,
        createdAt: new Date().toISOString()
      };
      state.highScores[existingScoreIndex] = savedEntry;
    } else {
      // Keep their higher personal best posted
      savedEntry = existing;
      isNewPersonalBest = false;
    }
  } else {
    // First high score posted for this operative
    isNewPersonalBest = true;
    savedEntry = {
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
    state.highScores.push(savedEntry);
  }

  // Update user's personal best & rating
  if (currentUser) {
    const userIndex = state.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      const user = state.users[userIndex];
      if (!user.highScores) user.highScores = {};

      let currentBest = 0;
      if (gameId === 'code-pressed') currentBest = user.highScores.codePressed || 0;
      else if (gameId === 'slots-up') currentBest = user.highScores.slotsUp || 0;
      else if (gameId === 'block-drop') currentBest = user.highScores.blockDrop || 0;
      else if (gameId === 'rpg-game') currentBest = user.highScores.rpgGame || 0;
      else if (gameId === 'emoji-tactics') currentBest = user.highScores.emojiTactics || 0;

      if (score > currentBest) {
        if (gameId === 'code-pressed') user.highScores.codePressed = score;
        else if (gameId === 'slots-up') user.highScores.slotsUp = score;
        else if (gameId === 'block-drop') user.highScores.blockDrop = score;
        else if (gameId === 'rpg-game') user.highScores.rpgGame = score;
        else if (gameId === 'emoji-tactics') user.highScores.emojiTactics = score;

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
  return { success: true, isNewPersonalBest, highScore: savedEntry };
}

export function getHighScores(gameId?: 'code-pressed' | 'slots-up' | 'block-drop' | 'rpg-game' | 'emoji-tactics'): GameHighScore[] {
  const state = loadDatabase();
  let scores = state.highScores || [];
  if (gameId) {
    scores = scores.filter(s => s.gameId === gameId);
  }
  // Guarantee strictly 1 high score per user in the returned list
  const userBestMap = new Map<string, GameHighScore>();
  for (const s of scores) {
    const key = gameId ? `${s.userId || s.userUid}` : `${s.userId || s.userUid}_${s.gameId}`;
    const existing = userBestMap.get(key);
    if (!existing || s.score > existing.score) {
      userBestMap.set(key, s);
    }
  }
  return Array.from(userBestMap.values()).sort((a, b) => b.score - a.score);
}

export function getUserPersonalBests(userId: string): { codePressed: number; slotsUp: number; blockDrop: number; rpgGame: number; emojiTactics: number } {
  const state = loadDatabase();
  const user = state.users.find(u => u.id === userId);
  return {
    codePressed: user?.highScores?.codePressed || 0,
    slotsUp: user?.highScores?.slotsUp || 0,
    blockDrop: user?.highScores?.blockDrop || 0,
    rpgGame: user?.highScores?.rpgGame || 0,
    emojiTactics: user?.highScores?.emojiTactics || 0
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

// ==========================================
// 6. 3D RPG GAME DATA PERSISTENCE
// ==========================================

export function saveRpgGameData(saveData: RpgSaveData): boolean {
  try {
    const state = loadDatabase();
    if (!state.rpgSaves) {
      state.rpgSaves = {};
    }
    state.rpgSaves[saveData.userId] = {
      ...saveData,
      updatedAt: new Date().toISOString()
    };
    saveDatabase(state);
    return true;
  } catch (err) {
    console.error('Failed to save RPG game data:', err);
    return false;
  }
}

export function getRpgGameData(userId: string): RpgSaveData | null {
  try {
    const state = loadDatabase();
    if (!state.rpgSaves || !state.rpgSaves[userId]) {
      return null;
    }
    return state.rpgSaves[userId];
  } catch (err) {
    console.error('Failed to load RPG game data:', err);
    return null;
  }
}

