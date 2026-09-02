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
    rpgGame?: number;
    emojiTactics?: number;
    texasHoldem?: number;
  };
  holdemChips?: number;
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
  gameId: 'code-pressed' | 'slots-up' | 'block-drop' | 'rpg-game' | 'emoji-tactics' | 'texas-holdem';
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

export interface RpgGearItem {
  id: string;
  name: string;
  slot: 'head' | 'shoulders' | 'chest' | 'belt' | 'pants' | 'boots' | 'leftHand' | 'rightHand';
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weaponSpeed?: number; // 2.0 to 6.0 seconds
  damageMultiplier?: number; // 0.2 to 0.6
  armor?: number;
  magicResist?: number;
  strength?: number;
  intelligence?: number;
  vitality?: number;
  dexterity?: number;
  elementalType?: 'melee' | 'fire' | 'frost' | 'lightning' | 'arcane' | 'holy' | 'shadow';
  grantedAbility?: {
    id: string;
    name: string;
    type: 'melee' | 'fire' | 'frost' | 'lightning' | 'arcane' | 'holy' | 'shadow';
    damageBase: number;
    cooldown: number; // 2.0 to 6.0 seconds
    manaCost: number;
    range: number;
    description: string;
  };
}

export interface RpgSaveData {
  userId: string;
  userCallsign: string;
  classType: 'melee' | 'caster';
  characterName: string;
  level: number; // 1 to 50
  experience: number;
  experienceNext: number;
  essence: number;
  statPointsSpent: number;
  statUpgrades: {
    strength: number;
    dexterity: number;
    intelligence: number;
    vitality: number;
    armor: number;
    magicResist: number;
    critRate: number;
  };
  purchasedAbilityIds: string[];
  equippedGear: {
    head: RpgGearItem | null;
    shoulders: RpgGearItem | null;
    chest: RpgGearItem | null;
    belt: RpgGearItem | null;
    pants: RpgGearItem | null;
    boots: RpgGearItem | null;
    leftHand: RpgGearItem | null;
    rightHand: RpgGearItem | null;
  };
  inventory: RpgGearItem[];
  currentArea: number;
  areaLevelMin: number;
  areaLevelMax: number;
  enemiesDefeatedInArea: number;
  totalKills: number;
  bossesDefeated: number;
  highScore: number;
  updatedAt: string;
}

export interface DbState {
  users: User[];
  currentUserId: string | null;
  emailOutbox: DispatchedEmail[];
  highScores: GameHighScore[];
  playlists: UserPlaylist[];
  posts: IntelPost[];
  rpgSaves?: Record<string, RpgSaveData>;
}

