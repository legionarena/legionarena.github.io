const fs = require('fs');
const path = require('path');

const targetHtmlPath = path.join(__dirname, '..', 'public', 'emoji-tactics.html');
let content = fs.readFileSync(targetHtmlPath, 'utf8');

// Let's create the comprehensive 96-unit character dataset script
const scriptReplacement = `
  <script type="module">
    import * as THREE from 'three';

    // =========================================================================
    // 96 UNIQUE EMOJI CHARACTERS DATABASE (TIERS 1 TO 5)
    // =========================================================================
    const RAW_UNITS_DATA = [
      // --- TIER 1 (Cost: 1 Gold) [24 Units] ---
      { id: 'boar_berserk', emoji: '🐗💥', name: 'Berserk Boar', tier: 1, cost: 1, archetype: 'beast_tusks', baseHp: 38, baseAtk: 6, spd: 1.0, rng: 1, def: 8, hex: '#b45309', elem: 'fire', res: 'water', abName: 'Wild Stampede', abPower: 16, abType: 'rush', elName: 'Flame Charge', elPower: 12 },
      { id: 'fairy_flora', emoji: '🧚‍♀️🌸', name: 'Flora Fairy', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 30, baseAtk: 5, spd: 0.9, rng: 3, def: 4, hex: '#ec4899', elem: 'nature', res: 'lightning', abName: 'Nature Mend', abPower: 18, abType: 'heal', elName: 'Spore Bloom', elPower: 10 },
      { id: 'viper_venom', emoji: '🐍🧪', name: 'Venom Viper', tier: 1, cost: 1, archetype: 'serpent', baseHp: 32, baseAtk: 6, spd: 1.1, rng: 2, def: 6, hex: '#10b981', elem: 'nature', res: 'shadow', abName: 'Toxic Fang', abPower: 15, abType: 'poison', elName: 'Acid Surge', elPower: 11 },
      { id: 'owl_sage', emoji: '🦉📖', name: 'Sage Owl', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 31, baseAtk: 5, spd: 1.0, rng: 3, def: 5, hex: '#64748b', elem: 'holy', res: 'shadow', abName: 'Mystic Ray', abPower: 16, abType: 'beam', elName: 'Star Shard', elPower: 12 },
      { id: 'rhino_titan', emoji: '🛡️🦏', name: 'Titan Rhino', tier: 1, cost: 1, archetype: 'beast_horn', baseHp: 44, baseAtk: 5, spd: 1.2, rng: 1, def: 18, hex: '#475569', elem: 'lightning', res: 'fire', abName: 'Iron Guard', abPower: 18, abType: 'shield', elName: 'Static Pulse', elPower: 10 },
      { id: 'goblin_scout', emoji: '👺🗡️', name: 'Forest Goblin', tier: 1, cost: 1, archetype: 'humanoid_warrior', baseHp: 33, baseAtk: 7, spd: 0.85, rng: 1, def: 5, hex: '#16a34a', elem: 'nature', res: 'fire', abName: 'Quick Stab', abPower: 17, abType: 'rush', elName: 'Bramble Jab', elPower: 11 },
      { id: 'sprite_sun', emoji: '☀️✨', name: 'Sun Sprite', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 30, baseAtk: 5, spd: 0.95, rng: 3, def: 5, hex: '#eab308', elem: 'holy', res: 'nature', abName: 'Solar Glow', abPower: 16, abType: 'heal', elName: 'Sunburst Spark', elPower: 12 },
      { id: 'imp_flame', emoji: '👿🔥', name: 'Flame Imp', tier: 1, cost: 1, archetype: 'humanoid_mage', baseHp: 31, baseAtk: 6, spd: 0.95, rng: 2, def: 4, hex: '#ef4444', elem: 'fire', res: 'holy', abName: 'Fireball', abPower: 18, abType: 'fireball', elName: 'Cinder Arc', elPower: 13 },
      { id: 'bat_shadow', emoji: '🦇🌑', name: 'Shadow Bat', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 32, baseAtk: 7, spd: 0.8, rng: 1, def: 4, hex: '#7c3aed', elem: 'shadow', res: 'holy', abName: 'Vampiric Bite', abPower: 16, abType: 'drain', elName: 'Void Echo', elPower: 12 },
      { id: 'crab_iron', emoji: '🦀🛡️', name: 'Iron Crab', tier: 1, cost: 1, archetype: 'golem_titan', baseHp: 42, baseAtk: 5, spd: 1.15, rng: 1, def: 16, hex: '#0ea5e9', elem: 'water', res: 'lightning', abName: 'Tidal Shell', abPower: 18, abType: 'shield', elName: 'Frost Pinch', elPower: 10 },
      { id: 'frog_toxic', emoji: '🐸⚡', name: 'Shock Frog', tier: 1, cost: 1, archetype: 'beast_tusks', baseHp: 34, baseAtk: 6, spd: 1.0, rng: 2, def: 6, hex: '#84cc16', elem: 'lightning', res: 'water', abName: 'Zap Tongue', abPower: 17, abType: 'zap', elName: 'Volt Spit', elPower: 11 },
      { id: 'skeleton_guard', emoji: '💀⚔️', name: 'Bone Militia', tier: 1, cost: 1, archetype: 'humanoid_warrior', baseHp: 35, baseAtk: 6, spd: 1.05, rng: 1, def: 10, hex: '#94a3b8', elem: 'shadow', res: 'nature', abName: 'Shield Bash', abPower: 15, abType: 'rush', elName: 'Grim Strike', elPower: 11 },
      { id: 'rat_plague', emoji: '🐀☣️', name: 'Plague Rat', tier: 1, cost: 1, archetype: 'beast_tusks', baseHp: 32, baseAtk: 6, spd: 0.85, rng: 1, def: 4, hex: '#65a30d', elem: 'shadow', res: 'fire', abName: 'Fever Bite', abPower: 16, abType: 'poison', elName: 'Miasma Siphon', elPower: 11 },
      { id: 'penguin_frost', emoji: '🐧❄️', name: 'Frost Penguin', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 34, baseAtk: 5, spd: 1.0, rng: 2, def: 8, hex: '#38bdf8', elem: 'water', res: 'nature', abName: 'Icicle Toss', abPower: 16, abType: 'ice', elName: 'Glacial Slide', elPower: 12 },
      { id: 'bee_scout', emoji: '🐝🍯', name: 'Stinger Bee', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 29, baseAtk: 7, spd: 0.8, rng: 1, def: 3, hex: '#f59e0b', elem: 'nature', res: 'shadow', abName: 'Needle Sting', abPower: 18, abType: 'rush', elName: 'Pollen Gust', elPower: 11 },
      { id: 'jelly_hydro', emoji: '🪼💧', name: 'Hydro Jelly', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 36, baseAtk: 5, spd: 1.1, rng: 2, def: 10, hex: '#0284c7', elem: 'water', res: 'fire', abName: 'Aqua Bubble', abPower: 17, abType: 'shield', elName: 'Splash Surge', elPower: 10 },
      { id: 'hedgehog_quill', emoji: '🦔📌', name: 'Quill Hedgehog', tier: 1, cost: 1, archetype: 'beast_horn', baseHp: 37, baseAtk: 5, spd: 1.05, rng: 1, def: 12, hex: '#78350f', elem: 'nature', res: 'lightning', abName: 'Thorn Barrage', abPower: 16, abType: 'aoe', elName: 'Brier Poke', elPower: 11 },
      { id: 'novice_monk', emoji: '🧘‍♂️✨', name: 'Sun Monk', tier: 1, cost: 1, archetype: 'humanoid_warrior', baseHp: 36, baseAtk: 6, spd: 0.95, rng: 1, def: 8, hex: '#fde047', elem: 'holy', res: 'water', abName: 'Chi Burst', abPower: 17, abType: 'beam', elName: 'Solar Kick', elPower: 12 },
      { id: 'gnome_alchemist', emoji: '🧙‍♂️🧪', name: 'Spark Gnome', tier: 1, cost: 1, archetype: 'humanoid_mage', baseHp: 31, baseAtk: 6, spd: 1.0, rng: 3, def: 5, hex: '#fb923c', elem: 'lightning', res: 'holy', abName: 'Flask Detonation', abPower: 18, abType: 'aoe', elName: 'Static Fume', elPower: 12 },
      { id: 'beetle_horn', emoji: '🪲🛡️', name: 'Stag Beetle', tier: 1, cost: 1, archetype: 'beast_horn', baseHp: 40, baseAtk: 5, spd: 1.1, rng: 1, def: 15, hex: '#065f46', elem: 'nature', res: 'water', abName: 'Mandible Clamp', abPower: 16, abType: 'rush', elName: 'Carapace Guard', elPower: 10 },
      { id: 'spark_wisp', emoji: '✨⚡', name: 'Spark Wisp', tier: 1, cost: 1, archetype: 'winged_mystic', baseHp: 28, baseAtk: 7, spd: 0.8, rng: 3, def: 3, hex: '#facc15', elem: 'lightning', res: 'shadow', abName: 'Chain Spark', abPower: 19, abType: 'zap', elName: 'Plasma Dart', elPower: 13 },
      { id: 'mud_golem_mini', emoji: '🧱💧', name: 'Clay Sprite', tier: 1, cost: 1, archetype: 'golem_titan', baseHp: 41, baseAtk: 5, spd: 1.2, rng: 1, def: 14, hex: '#a16207', elem: 'water', res: 'holy', abName: 'Mud Harden', abPower: 18, abType: 'shield', elName: 'Bog Quake', elPower: 10 },
      { id: 'shadow_shade', emoji: '👤🌑', name: 'Lesser Shade', tier: 1, cost: 1, archetype: 'humanoid_warrior', baseHp: 32, baseAtk: 7, spd: 0.9, rng: 1, def: 5, hex: '#4c1d95', elem: 'shadow', res: 'lightning', abName: 'Shadow Cleave', abPower: 17, abType: 'rush', elName: 'Dusk Siphon', elPower: 12 },
      { id: 'squire_light', emoji: '🛡️☀️', name: 'Dawn Squire', tier: 1, cost: 1, archetype: 'humanoid_warrior', baseHp: 38, baseAtk: 6, spd: 1.0, rng: 1, def: 12, hex: '#fef08a', elem: 'holy', res: 'fire', abName: 'Radiant Strike', abPower: 16, abType: 'beam', elName: 'Sun Shield', elPower: 11 },

      // --- TIER 2 (Cost: 2 Gold) [24 Units] ---
      { id: 'wolf_frost', emoji: '🐺❄️', name: 'Frost Wolf', tier: 2, cost: 2, archetype: 'beast_tusks', baseHp: 48, baseAtk: 9, spd: 0.9, rng: 1, def: 10, hex: '#38bdf8', elem: 'water', res: 'fire', abName: 'Glacial Howl', abPower: 24, abType: 'aoe', elName: 'Permafrost Fang', elPower: 18 },
      { id: 'archer_wind', emoji: '🏹🍃', name: 'Wind Archer', tier: 2, cost: 2, archetype: 'humanoid_warrior', baseHp: 44, baseAtk: 10, spd: 0.85, rng: 4, def: 6, hex: '#22c55e', elem: 'nature', res: 'water', abName: 'Gale Arrow', abPower: 26, abType: 'beam', elName: 'Zephyr Shot', elPower: 19 },
      { id: 'pyro_cultist', emoji: '🧙‍♂️🔥', name: 'Pyro Acolyte', tier: 2, cost: 2, archetype: 'humanoid_mage', baseHp: 45, baseAtk: 10, spd: 0.9, rng: 3, def: 7, hex: '#f97316', elem: 'fire', res: 'lightning', abName: 'Flame Vortex', abPower: 28, abType: 'fireball', elName: 'Blaze Cascade', elPower: 20 },
      { id: 'golem_stone', emoji: '🗿🛡️', name: 'Granite Golem', tier: 2, cost: 2, archetype: 'golem_titan', baseHp: 58, baseAtk: 8, spd: 1.25, rng: 1, def: 22, hex: '#64748b', elem: 'nature', res: 'shadow', abName: 'Earth Slam', abPower: 25, abType: 'aoe', elName: 'Stone Carapace', elPower: 16 },
      { id: 'falcon_storm', emoji: '🦅⚡', name: 'Storm Falcon', tier: 2, cost: 2, archetype: 'winged_mystic', baseHp: 46, baseAtk: 11, spd: 0.8, rng: 2, def: 6, hex: '#facc15', elem: 'lightning', res: 'nature', abName: 'Thunder Dive', abPower: 27, abType: 'zap', elName: 'Static Bolt', elPower: 20 },
      { id: 'assassin_shadow', emoji: '🥷🌑', name: 'Nightstalker', tier: 2, cost: 2, archetype: 'humanoid_warrior', baseHp: 46, baseAtk: 12, spd: 0.75, rng: 1, def: 7, hex: '#581c87', elem: 'shadow', res: 'water', abName: 'Shadow Assassination', abPower: 30, abType: 'rush', elName: 'Void Ambush', elPower: 22 },
      { id: 'paladin_light', emoji: '⚔️✨', name: 'Solar Crusader', tier: 2, cost: 2, archetype: 'humanoid_warrior', baseHp: 54, baseAtk: 9, spd: 1.05, rng: 1, def: 16, hex: '#eab308', elem: 'holy', res: 'fire', abName: 'Holy Smite', abPower: 26, abType: 'beam', elName: 'Aura of Dawn', elPower: 18 },
      { id: 'siren_tide', emoji: '🧜‍♀️🌊', name: 'Ocean Siren', tier: 2, cost: 2, archetype: 'winged_mystic', baseHp: 47, baseAtk: 9, spd: 0.95, rng: 3, def: 8, hex: '#0284c7', elem: 'water', res: 'shadow', abName: 'Tidal Wave', abPower: 25, abType: 'aoe', elName: 'Aqua Melody', elPower: 19 },
      { id: 'drake_hatchling', emoji: '🦎🔥', name: 'Fire Drake', tier: 2, cost: 2, archetype: 'winged_dragon', baseHp: 50, baseAtk: 10, spd: 0.9, rng: 2, def: 12, hex: '#dc2626', elem: 'fire', res: 'holy', abName: 'Dragon Breath', abPower: 27, abType: 'fireball', elName: 'Magma Spit', elPower: 20 },
      { id: 'shaman_voodoo', emoji: '👺🌿', name: 'Witch Doctor', tier: 2, cost: 2, archetype: 'humanoid_mage', baseHp: 46, baseAtk: 9, spd: 1.0, rng: 3, def: 8, hex: '#15803d', elem: 'nature', res: 'holy', abName: 'Ancestral Totem', abPower: 24, abType: 'heal', elName: 'Spirit Hex', elPower: 18 },
      { id: 'bull_iron', emoji: '🐂⚔️', name: 'Iron Minotaur', tier: 2, cost: 2, archetype: 'beast_horn', baseHp: 56, baseAtk: 10, spd: 1.15, rng: 1, def: 15, hex: '#7c2d12', elem: 'lightning', res: 'water', abName: 'Horn Charge', abPower: 28, abType: 'rush', elName: 'Overcharge Horn', elPower: 19 },
      { id: 'reaper_mini', emoji: '👻🗡️', name: 'Dusk Reaper', tier: 2, cost: 2, archetype: 'humanoid_warrior', baseHp: 47, baseAtk: 11, spd: 0.85, rng: 1, def: 8, hex: '#6b21a8', elem: 'shadow', res: 'fire', abName: 'Soul Harvest', abPower: 29, abType: 'drain', elName: 'Nether Reaping', elPower: 21 },
      { id: 'turtle_shell', emoji: '🐢🌊', name: 'Ancient Turtle', tier: 2, cost: 2, archetype: 'golem_titan', baseHp: 59, baseAtk: 8, spd: 1.3, rng: 1, def: 24, hex: '#0f766e', elem: 'water', res: 'holy', abName: 'Fortress Shell', abPower: 26, abType: 'shield', elName: 'Hydro Geyser', elPower: 17 },
      { id: 'spark_monk', emoji: '⚡🥋', name: 'Tempest Monk', tier: 2, cost: 2, archetype: 'humanoid_warrior', baseHp: 50, baseAtk: 10, spd: 0.85, rng: 1, def: 11, hex: '#eab308', elem: 'lightning', res: 'shadow', abName: 'Lightning Palm', abPower: 27, abType: 'zap', elName: 'Static Fists', elPower: 19 },
      { id: 'druid_bear', emoji: '🐻🌲', name: 'Grizzly Druid', tier: 2, cost: 2, archetype: 'beast_tusks', baseHp: 55, baseAtk: 10, spd: 1.1, rng: 1, def: 14, hex: '#3f6212', elem: 'nature', res: 'fire', abName: 'Primal Swipe', abPower: 27, abType: 'rush', elName: 'Briar Roar', elPower: 18 },
      { id: 'alchemist_fire', emoji: '🧪🔥', name: 'Alchemist Gunner', tier: 2, cost: 2, archetype: 'humanoid_mage', baseHp: 45, baseAtk: 11, spd: 0.9, rng: 3, def: 7, hex: '#ea580c', elem: 'fire', res: 'water', abName: 'Infernal Concoction', abPower: 28, abType: 'aoe', elName: 'Pyro Vial', elPower: 20 },
      { id: 'angel_cherub', emoji: '👼🪽', name: 'Cherub Seraph', tier: 2, cost: 2, archetype: 'winged_mystic', baseHp: 46, baseAtk: 9, spd: 0.9, rng: 3, def: 8, hex: '#fef08a', elem: 'holy', res: 'lightning', abName: 'Divine Shield', abPower: 26, abType: 'shield', elName: 'Glory Rays', elPower: 18 },
      { id: 'gargoyle_stone', emoji: '🦇🗿', name: 'Gargoyle Sentry', tier: 2, cost: 2, archetype: 'golem_titan', baseHp: 53, baseAtk: 9, spd: 1.0, rng: 1, def: 18, hex: '#334155', elem: 'shadow', res: 'nature', abName: 'Petrify Strike', abPower: 26, abType: 'rush', elName: 'Slate Armor', elPower: 17 },
      { id: 'cobra_desert', emoji: '🐍🏜️', name: 'Sun Cobra', tier: 2, cost: 2, archetype: 'serpent', baseHp: 48, baseAtk: 10, spd: 0.95, rng: 2, def: 9, hex: '#d97706', elem: 'holy', res: 'shadow', abName: 'Blinding Spit', abPower: 26, abType: 'beam', elName: 'Solar Venom', elPower: 19 },
      { id: 'hydra_spawn', emoji: '🐉💧', name: 'Hydra Spawn', tier: 2, cost: 2, archetype: 'serpent', baseHp: 52, baseAtk: 10, spd: 0.95, rng: 2, def: 11, hex: '#0284c7', elem: 'water', res: 'lightning', abName: 'Triple Bite', abPower: 28, abType: 'rush', elName: 'Tidal Regeneration', elPower: 18 },
      { id: 'cyclops_brute', emoji: '👁️🔨', name: 'Cyclops Guard', tier: 2, cost: 2, archetype: 'golem_titan', baseHp: 57, baseAtk: 10, spd: 1.2, rng: 1, def: 15, hex: '#92400e', elem: 'lightning', res: 'holy', abName: 'Thunder Smash', abPower: 28, abType: 'aoe', elName: 'Eye Beam', elPower: 19 },
      { id: 'treant_sapling', emoji: '🪵🌿', name: 'Treant Warden', tier: 2, cost: 2, archetype: 'golem_titan', baseHp: 58, baseAtk: 8, spd: 1.25, rng: 1, def: 20, hex: '#14532d', elem: 'nature', res: 'shadow', abName: 'Root Entangle', abPower: 25, abType: 'aoe', elName: 'Sap Barrier', elPower: 17 },
      { id: 'witch_cauldron', emoji: '🧙‍♀️🔮', name: 'Mystic Sorceress', tier: 2, cost: 2, archetype: 'humanoid_mage', baseHp: 44, baseAtk: 11, spd: 0.85, rng: 3, def: 6, hex: '#7e22ce', elem: 'shadow', res: 'water', abName: 'Arcane Hex', abPower: 29, abType: 'fireball', elName: 'Nether Blast', elPower: 21 },
      { id: 'griffin_cub', emoji: '🦅🦁', name: 'Griffin Scout', tier: 2, cost: 2, archetype: 'winged_mystic', baseHp: 51, baseAtk: 10, spd: 0.85, rng: 2, def: 12, hex: '#b45309', elem: 'holy', res: 'nature', abName: 'Sky Talon', abPower: 27, abType: 'rush', elName: 'Sunfeather Gale', elPower: 19 },

      // --- TIER 3 (Cost: 3 Gold) [20 Units] ---
      { id: 'knight_valkyrie', emoji: '⚔️🪽', name: 'Dawn Valkyrie', tier: 3, cost: 3, archetype: 'winged_mystic', baseHp: 64, baseAtk: 13, spd: 0.85, rng: 1, def: 16, hex: '#fbbf24', elem: 'holy', res: 'shadow', abName: 'Heavenly Spear', abPower: 34, abType: 'beam', elName: 'Dawn Cleave', elPower: 25 },
      { id: 'sorcerer_void', emoji: '🔮🌌', name: 'Void Arcanist', tier: 3, cost: 3, archetype: 'humanoid_mage', baseHp: 60, baseAtk: 14, spd: 0.8, rng: 3, def: 10, hex: '#7c3aed', elem: 'shadow', res: 'holy', abName: 'Cosmic Singularity', abPower: 36, abType: 'aoe', elName: 'Void Flare', elPower: 26 },
      { id: 'behemoth_magma', emoji: '🌋💥', name: 'Magma Behemoth', tier: 3, cost: 3, archetype: 'golem_titan', baseHp: 72, baseAtk: 12, spd: 1.15, rng: 1, def: 20, hex: '#b91c1c', elem: 'fire', res: 'water', abName: 'Volcanic Eruption', abPower: 35, abType: 'aoe', elName: 'Molten Armor', elPower: 24 },
      { id: 'wyvern_storm', emoji: '🐉⚡', name: 'Thunder Wyvern', tier: 3, cost: 3, archetype: 'winged_dragon', baseHp: 65, baseAtk: 14, spd: 0.85, rng: 2, def: 14, hex: '#eab308', elem: 'lightning', res: 'nature', abName: 'Lightning Storm', abPower: 36, abType: 'zap', elName: 'Volt Tempest', elPower: 26 },
      { id: 'dryad_elder', emoji: '🌳✨', name: 'Elder Dryad', tier: 3, cost: 3, archetype: 'winged_mystic', baseHp: 62, baseAtk: 12, spd: 0.9, rng: 3, def: 12, hex: '#16a34a', elem: 'nature', res: 'lightning', abName: 'Bloom Reverence', abPower: 34, abType: 'heal', elName: 'Gaia Pulse', elPower: 24 },
      { id: 'duelist_blades', emoji: '⚔️🌪️', name: 'Tempest Duelist', tier: 3, cost: 3, archetype: 'humanoid_warrior', baseHp: 63, baseAtk: 15, spd: 0.75, rng: 1, def: 12, hex: '#0284c7', elem: 'water', res: 'lightning', abName: 'Flurry of Blades', abPower: 37, abType: 'rush', elName: 'Tsunami Slashes', elPower: 27 },
      { id: 'colossus_iron', emoji: '🛡️🗿', name: 'Iron Sentinel', tier: 3, cost: 3, archetype: 'golem_titan', baseHp: 74, baseAtk: 11, spd: 1.2, rng: 1, def: 24, hex: '#475569', elem: 'holy', res: 'fire', abName: 'Unbreakable Bastion', abPower: 35, abType: 'shield', elName: 'Radiant Plating', elPower: 23 },
      { id: 'necro_lich', emoji: '💀🔮', name: 'Shadow Lich', tier: 3, cost: 3, archetype: 'humanoid_mage', baseHp: 61, baseAtk: 14, spd: 0.85, rng: 3, def: 11, hex: '#9333ea', elem: 'shadow', res: 'holy', abName: 'Death Decay', abPower: 36, abType: 'drain', elName: 'Soul Chill', elPower: 26 },
      { id: 'tiger_thunder', emoji: '🐅⚡', name: 'Saberfang Spark', tier: 3, cost: 3, archetype: 'beast_tusks', baseHp: 66, baseAtk: 14, spd: 0.8, rng: 1, def: 13, hex: '#d97706', elem: 'lightning', res: 'water', abName: 'Thunderous Pounce', abPower: 36, abType: 'rush', elName: 'Plasma Claws', elPower: 26 },
      { id: 'leviathan_abyss', emoji: '🐋🌊', name: 'Abyssal Whale', tier: 3, cost: 3, archetype: 'serpent', baseHp: 70, baseAtk: 12, spd: 1.1, rng: 2, def: 18, hex: '#0369a1', elem: 'water', res: 'lightning', abName: 'Tsunami Cataclysm', abPower: 35, abType: 'aoe', elName: 'Permafrost Crest', elPower: 25 },
      { id: 'phoenix_ember', emoji: '🦅🔥', name: 'Ember Phoenix', tier: 3, cost: 3, archetype: 'winged_mystic', baseHp: 63, baseAtk: 14, spd: 0.85, rng: 3, def: 12, hex: '#dc2626', elem: 'fire', res: 'water', abName: 'Flaming Rebirth', abPower: 36, abType: 'fireball', elName: 'Inferno Feathers', elPower: 26 },
      { id: 'assassin_venom', emoji: '🥷🧪', name: 'Toxic Shadow', tier: 3, cost: 3, archetype: 'humanoid_warrior', baseHp: 62, baseAtk: 15, spd: 0.75, rng: 1, def: 10, hex: '#047857', elem: 'nature', res: 'holy', abName: 'Venomous Strike', abPower: 37, abType: 'poison', elName: 'Viper Ambush', elPower: 27 },
      { id: 'archmage_frost', emoji: '🧙‍♂️❄️', name: 'Glacial Sage', tier: 3, cost: 3, archetype: 'humanoid_mage', baseHp: 61, baseAtk: 14, spd: 0.85, rng: 3, def: 11, hex: '#0284c7', elem: 'water', res: 'fire', abName: 'Blizzard Gale', abPower: 36, abType: 'ice', elName: 'Frostbite Lance', elPower: 26 },
      { id: 'champion_sun', emoji: '👑☀️', name: 'Solar General', tier: 3, cost: 3, archetype: 'humanoid_warrior', baseHp: 67, baseAtk: 13, spd: 0.9, rng: 1, def: 17, hex: '#f59e0b', elem: 'holy', res: 'shadow', abName: 'Dawn Aegis', abPower: 35, abType: 'shield', elName: 'Sunburst Cleave', elPower: 25 },
      { id: 'drake_onyx', emoji: '🐲🌑', name: 'Onyx Drake', tier: 3, cost: 3, archetype: 'winged_dragon', baseHp: 68, baseAtk: 14, spd: 0.85, rng: 2, def: 15, hex: '#312e81', elem: 'shadow', res: 'lightning', abName: 'Nether Breath', abPower: 36, abType: 'fireball', elName: 'Abyssal Flare', elPower: 26 },
      { id: 'gorilla_primal', emoji: '🦍🌴', name: 'Primal Kong', tier: 3, cost: 3, archetype: 'beast_tusks', baseHp: 71, baseAtk: 13, spd: 1.05, rng: 1, def: 16, hex: '#166534', elem: 'nature', res: 'fire', abName: 'Jungle Quake', abPower: 35, abType: 'aoe', elName: 'Wild Pound', elPower: 25 },
      { id: 'seraph_blade', emoji: '🗡️✨', name: 'Seraph Duelist', tier: 3, cost: 3, archetype: 'humanoid_warrior', baseHp: 64, baseAtk: 15, spd: 0.8, rng: 1, def: 13, hex: '#fef08a', elem: 'holy', res: 'water', abName: 'Divine Slashes', abPower: 37, abType: 'beam', elName: 'Radiant Edge', elPower: 27 },
      { id: 'spark_elemental', emoji: '⚡🌀', name: 'Volt Overlord', tier: 3, cost: 3, archetype: 'golem_titan', baseHp: 66, baseAtk: 14, spd: 0.85, rng: 2, def: 14, hex: '#facc15', elem: 'lightning', res: 'shadow', abName: 'Plasma Storm', abPower: 36, abType: 'zap', elName: 'Chain Overcharge', elPower: 26 },
      { id: 'kraken_mini', emoji: '🦑🌊', name: 'Abyssal Kraken', tier: 3, cost: 3, archetype: 'serpent', baseHp: 69, baseAtk: 13, spd: 0.95, rng: 2, def: 15, hex: '#0e7490', elem: 'water', res: 'nature', abName: 'Tentacle Crush', abPower: 35, abType: 'rush', elName: 'Ink Blind', elPower: 25 },
      { id: 'pyro_warlord', emoji: '⚔️🔥', name: 'Inferno Knight', tier: 3, cost: 3, archetype: 'humanoid_warrior', baseHp: 68, baseAtk: 14, spd: 0.9, rng: 1, def: 16, hex: '#b91c1c', elem: 'fire', res: 'holy', abName: 'Flame Cleave', abPower: 36, abType: 'aoe', elName: 'Scorching Aura', elPower: 26 },

      // --- TIER 4 (Cost: 4 Gold) [16 Units] ---
      { id: 'dragon_drake', emoji: '🐉🔥', name: 'Ancient Pyrodrake', tier: 4, cost: 4, archetype: 'winged_dragon', baseHp: 82, baseAtk: 17, spd: 0.85, rng: 2, def: 18, hex: '#dc2626', elem: 'fire', res: 'water', abName: 'Inferno Cataclysm', abPower: 44, abType: 'fireball', elName: 'Hellfire Burst', elPower: 32 },
      { id: 'titan_storm', emoji: '⚡🗿', name: 'Storm Colossus', tier: 4, cost: 4, archetype: 'golem_titan', baseHp: 86, baseAtk: 16, spd: 1.0, rng: 2, def: 22, hex: '#f59e0b', elem: 'lightning', res: 'nature', abName: 'Supercell Smash', abPower: 43, abType: 'zap', elName: 'Thunderclap Surge', elPower: 31 },
      { id: 'archangel_dawn', emoji: '👼☀️', name: 'Dawn Archangel', tier: 4, cost: 4, archetype: 'winged_mystic', baseHp: 78, baseAtk: 18, spd: 0.8, rng: 3, def: 16, hex: '#fef08a', elem: 'holy', res: 'shadow', abName: 'Judgment of Light', abPower: 45, abType: 'beam', elName: 'Solar Flare Smite', elPower: 33 },
      { id: 'emperor_shadow', emoji: '👑🌑', name: 'Shadow Monarch', tier: 4, cost: 4, archetype: 'humanoid_warrior', baseHp: 80, baseAtk: 18, spd: 0.75, rng: 1, def: 17, hex: '#581c87', elem: 'shadow', res: 'holy', abName: 'Domain of Darkness', abPower: 46, abType: 'drain', elName: 'Void Guillotine', elPower: 34 },
      { id: 'hydra_elder', emoji: '🐲🧪', name: 'Apex Hydra', tier: 4, cost: 4, archetype: 'serpent', baseHp: 84, baseAtk: 17, spd: 0.9, rng: 2, def: 19, hex: '#15803d', elem: 'nature', res: 'lightning', abName: 'Venomous Barrage', abPower: 44, abType: 'aoe', elName: 'Noxious Geyser', elPower: 32 },
      { id: 'leviathan_frost', emoji: '🌊❄️', name: 'Glacial Leviathan', tier: 4, cost: 4, archetype: 'serpent', baseHp: 85, baseAtk: 16, spd: 0.95, rng: 2, def: 20, hex: '#0284c7', elem: 'water', res: 'fire', abName: 'Permafrost Surge', abPower: 43, abType: 'ice', elName: 'Arctic Wave', elPower: 31 },
      { id: 'phoenix_celestial', emoji: '🔥🪽', name: 'Solar Phoenix', tier: 4, cost: 4, archetype: 'winged_mystic', baseHp: 79, baseAtk: 18, spd: 0.8, rng: 3, def: 15, hex: '#ea580c', elem: 'fire', res: 'holy', abName: 'Supernova Burst', abPower: 45, abType: 'aoe', elName: 'Flame Cascade', elPower: 33 },
      { id: 'behemoth_gaia', emoji: '🦏🌲', name: 'Gaia Behemoth', tier: 4, cost: 4, archetype: 'beast_horn', baseHp: 88, baseAtk: 16, spd: 1.1, rng: 1, def: 23, hex: '#365314', elem: 'nature', res: 'shadow', abName: 'Tectonic Quake', abPower: 43, abType: 'aoe', elName: 'Bramble Armor', elPower: 30 },
      { id: 'dreadlord_abyss', emoji: '👹🌑', name: 'Abyssal Dreadlord', tier: 4, cost: 4, archetype: 'humanoid_mage', baseHp: 81, baseAtk: 18, spd: 0.8, rng: 3, def: 16, hex: '#4c1d95', elem: 'shadow', res: 'water', abName: 'Hellfire Void', abPower: 45, abType: 'aoe', elName: 'Dark Matter Spike', elPower: 33 },
      { id: 'templar_radiant', emoji: '🛡️✨', name: 'Radiant Templar', tier: 4, cost: 4, archetype: 'humanoid_warrior', baseHp: 85, baseAtk: 17, spd: 0.85, rng: 1, def: 21, hex: '#fbbf24', elem: 'holy', res: 'fire', abName: 'Aegis of the Sun', abPower: 44, abType: 'shield', elName: 'Daybreak Smite', elPower: 32 },
      { id: 'tempest_djinn', emoji: '🌪️⚡', name: 'Tempest Djinn', tier: 4, cost: 4, archetype: 'winged_mystic', baseHp: 80, baseAtk: 18, spd: 0.8, rng: 3, def: 16, hex: '#facc15', elem: 'lightning', res: 'shadow', abName: 'Thunder Vortex', abPower: 45, abType: 'zap', elName: 'Static Overcharge', elPower: 33 },
      { id: 'wyrm_tsunami', emoji: '🐉🌊', name: 'Tsunami Wyrm', tier: 4, cost: 4, archetype: 'winged_dragon', baseHp: 83, baseAtk: 17, spd: 0.85, rng: 2, def: 18, hex: '#0369a1', elem: 'water', res: 'lightning', abName: 'Maelstrom Devastation', abPower: 44, abType: 'aoe', elName: 'Riptide Blast', elPower: 32 },
      { id: 'berserker_inferno', emoji: '⚔️🌋', name: 'Magma Berserker', tier: 4, cost: 4, archetype: 'humanoid_warrior', baseHp: 82, baseAtk: 19, spd: 0.75, rng: 1, def: 17, hex: '#991b1b', elem: 'fire', res: 'water', abName: 'Raging Inferno', abPower: 46, abType: 'rush', elName: 'Lava Cleave', elPower: 34 },
      { id: 'lich_king', emoji: '👑❄️', name: 'Frost Lich King', tier: 4, cost: 4, archetype: 'humanoid_mage', baseHp: 80, baseAtk: 18, spd: 0.8, rng: 3, def: 17, hex: '#38bdf8', elem: 'water', res: 'holy', abName: 'Frozen Oblivion', abPower: 45, abType: 'ice', elName: 'Glacial Nova', elPower: 33 },
      { id: 'chimera_storm', emoji: '🦁⚡', name: 'Storm Chimera', tier: 4, cost: 4, archetype: 'beast_tusks', baseHp: 84, baseAtk: 18, spd: 0.8, rng: 1, def: 18, hex: '#ca8a04', elem: 'lightning', res: 'fire', abName: 'Triple Spark Bite', abPower: 45, abType: 'rush', elName: 'Plasma Roar', elPower: 33 },
      { id: 'avatar_woodland', emoji: '🧝‍♀️🌿', name: 'Avatar of Gaia', tier: 4, cost: 4, archetype: 'winged_mystic', baseHp: 81, baseAtk: 17, spd: 0.85, rng: 3, def: 16, hex: '#15803d', elem: 'nature', res: 'water', abName: 'Wrath of Nature', abPower: 44, abType: 'heal', elName: 'Verdant Hurricane', elPower: 32 },

      // --- TIER 5 (Cost: 5 Gold) [12 Units] ---
      { id: 'dragon_cosmic', emoji: '🌌🐉', name: 'Cosmic God-Dragon', tier: 5, cost: 5, archetype: 'winged_dragon', baseHp: 105, baseAtk: 23, spd: 0.75, rng: 3, def: 24, hex: '#a855f7', elem: 'shadow', res: 'holy', abName: 'Singularity Collapse', abPower: 55, abType: 'aoe', elName: 'Abyssal Supernova', elPower: 40 },
      { id: 'titan_omega', emoji: '🗿⚡', name: 'Omega Colossus', tier: 5, cost: 5, archetype: 'golem_titan', baseHp: 112, baseAtk: 21, spd: 0.95, rng: 2, def: 26, hex: '#f59e0b', elem: 'lightning', res: 'water', abName: 'Cataclysmic Quake', abPower: 52, abType: 'aoe', elName: 'Plasma Overdrive', elPower: 38 },
      { id: 'deity_sol', emoji: '☀️👑', name: 'Solar Omnipotent', tier: 5, cost: 5, archetype: 'winged_mystic', baseHp: 100, baseAtk: 24, spd: 0.75, rng: 3, def: 23, hex: '#fef08a', elem: 'holy', res: 'shadow', abName: 'Genesis Ray', abPower: 56, abType: 'beam', elName: 'Dawn of Eternity', elPower: 42 },
      { id: 'leviathan_world', emoji: '🌊🐲', name: 'World Serpent', tier: 5, cost: 5, archetype: 'serpent', baseHp: 108, baseAtk: 22, spd: 0.85, rng: 2, def: 25, hex: '#0284c7', elem: 'water', res: 'lightning', abName: 'Deluge of Ages', abPower: 54, abType: 'aoe', elName: 'Maelstrom Devour', elPower: 39 },
      { id: 'phoenix_primordial', emoji: '🔥👑', name: 'Primordial Phoenix', tier: 5, cost: 5, archetype: 'winged_mystic', baseHp: 98, baseAtk: 24, spd: 0.75, rng: 3, def: 22, hex: '#dc2626', elem: 'fire', res: 'nature', abName: 'Eternal Flame Rebirth', abPower: 56, abType: 'fireball', elName: 'Solar Incineration', elPower: 41 },
      { id: 'reaper_death', emoji: '💀🌑', name: 'Grim Sovereign', tier: 5, cost: 5, archetype: 'humanoid_warrior', baseHp: 102, baseAtk: 24, spd: 0.7, rng: 1, def: 23, hex: '#3b0764', elem: 'shadow', res: 'fire', abName: 'Soul Annihilation', abPower: 56, abType: 'drain', elName: 'Void Scythe Storm', elPower: 42 },
      { id: 'goddess_nature', emoji: '🌸✨', name: 'Gaia Primarch', tier: 5, cost: 5, archetype: 'winged_mystic', baseHp: 102, baseAtk: 22, spd: 0.8, rng: 3, def: 23, hex: '#16a34a', elem: 'nature', res: 'holy', abName: 'Eden Restoration', abPower: 53, abType: 'heal', elName: 'World Tree Wrath', elPower: 39 },
      { id: 'warlord_infernal', emoji: '🌋⚔️', name: 'Infernal Warmaster', tier: 5, cost: 5, archetype: 'humanoid_warrior', baseHp: 106, baseAtk: 24, spd: 0.75, rng: 1, def: 24, hex: '#7f1d1d', elem: 'fire', res: 'water', abName: 'Hellfire Cataclysm', abPower: 55, abType: 'rush', elName: 'Volcanic Decimation', elPower: 41 },
      { id: 'empress_glacial_t5', emoji: '👑❄️', name: 'Permafrost Empress', tier: 5, cost: 5, archetype: 'humanoid_mage', baseHp: 99, baseAtk: 24, spd: 0.75, rng: 4, def: 22, hex: '#38bdf8', elem: 'water', res: 'nature', abName: 'Absolute Zero', abPower: 56, abType: 'ice', elName: 'Glacial Singularity', elPower: 42 },
      { id: 'chimera_apex_t5', emoji: '🦁🐍', name: 'Apex Chimera', tier: 5, cost: 5, archetype: 'beast_tusks', baseHp: 107, baseAtk: 23, spd: 0.8, rng: 1, def: 25, hex: '#d97706', elem: 'lightning', res: 'shadow', abName: 'Triple Apex Bite', abPower: 54, abType: 'rush', elName: 'Thunderfang Frenzy', elPower: 40 },
      { id: 'titan_chrono_t5', emoji: '⏳⚡', name: 'Chrono Overlord', tier: 5, cost: 5, archetype: 'golem_titan', baseHp: 110, baseAtk: 22, spd: 0.85, rng: 2, def: 26, hex: '#eab308', elem: 'lightning', res: 'fire', abName: 'Temporal Shatter', abPower: 54, abType: 'aoe', elName: 'Time Stop Overload', elPower: 40 },
      { id: 'seraph_supreme', emoji: '☀️🪽', name: 'Supreme Seraph', tier: 5, cost: 5, archetype: 'winged_mystic', baseHp: 104, baseAtk: 24, spd: 0.75, rng: 3, def: 24, hex: '#fde047', elem: 'holy', res: 'water', abName: 'Dawn Ascension', abPower: 56, abType: 'beam', elName: 'Archangel Radiance', elPower: 42 }
    ];

    // Build the structured 96-character database
    const CHARACTERS_DATABASE = RAW_UNITS_DATA.map(u => ({
      id: u.id,
      emoji: u.emoji,
      name: u.name,
      tier: u.tier,
      cost: u.cost,
      archetype: u.archetype,
      baseHp: u.baseHp,
      baseAtk: u.baseAtk,
      attackSpeed: u.spd,
      range: u.rng,
      defense: u.def,
      colorHex: u.hex,
      element: u.elem,
      resistance: u.res,
      ability: {
        name: u.abName,
        desc: \`Channels \${u.elem.toUpperCase()} power dealing \${u.abPower} damage/effect.\`,
        power: u.abPower,
        type: u.abType,
        element: u.elem
      },
      elementalAbility: {
        name: \`⚡ \${u.elName}\`,
        desc: \`Channels \${u.elem.toUpperCase()} elemental power (\${u.elPower} dmg), building combo stacks toward 200% Overload.\`,
        power: u.elPower,
        element: u.elem
      }
    }));
`;

// Replace database in content
const scriptStartIdx = content.indexOf('<script type="module">');
const gameStateIdx = content.indexOf('// GAME STATE & GRID STRUCTURE');

if (scriptStartIdx !== -1 && gameStateIdx !== -1) {
  content = content.substring(0, scriptStartIdx) + scriptReplacement.trim() + '\n\n    // ' + content.substring(gameStateIdx);
  fs.writeFileSync(targetHtmlPath, content, 'utf8');
  console.log('Successfully replaced database with 96 units!');
} else {
  console.error('Could not find markers for replacement', { scriptStartIdx, gameStateIdx });
}
