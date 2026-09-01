const fs = require('fs');
const path = require('path');

const targetHtmlPath = path.join(__dirname, '..', 'public', 'emoji-tactics.html');
let content = fs.readFileSync(targetHtmlPath, 'utf8');

const logicStartMarker = '// // GAME STATE & GRID STRUCTURE';
const logicEndMarker = '</script>';

const newLogicContent = `// =========================================================================
    // GAME STATE & GRID STRUCTURE (8x8 Main Grid + 2 Benches of 8 slots)
    // =========================================================================
    const GRID_COLS = 8;
    const GRID_TOTAL_ROWS = 9; // Rows 0 to 8
    const TILE_SIZE = 3.2;
    const GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
    const GRID_OFFSET_Z = -(GRID_TOTAL_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;

    const gameState = {
      round: 1,
      phase: 'draft', // 'draft', 'prep', 'combat', 'round_end'
      prepTimeLeft: 25,
      playerHp: 10,
      enemyHp: 10,
      playerGold: 4,
      enemyGold: 4,
      wins: 0,
      losses: 0,
      totalDamageDealt: 0,
      inspectedUnit: null,
      selectedUnit: null,
      mainUnitPool: [], // Diminishing 96-unit pool
      draftPool: [], // Player's 4 draft cards
      enemyDraftPool: [], // Rival AI's 4 draft cards
      playerUnits: [],
      enemyUnits: [],
      projectiles: [],
      visualEffects: [],
      isShopMinimized: false,
      isSynergyOpen: false,
      activeAnnouncements: []
    };

    // Camera Orbit State
    const cameraOrbit = {
      radius: 38,
      theta: Math.PI / 2,
      phi: Math.PI / 3.2,
      target: new THREE.Vector3(0, 1.5, 0),
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0
    };

    // Audio synthesizer
    let audioCtx = null;
    function playAudio(type) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'buy') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(660, now + 0.08);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now); osc.stop(now + 0.18);
        } else if (type === 'upgrade') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now); osc.stop(now + 0.45);
        } else if (type === 'attack') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'ability') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'crit') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(1160, now + 0.15);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'victory') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.15);
          osc.frequency.setValueAtTime(659.25, now + 0.3);
          osc.frequency.setValueAtTime(880, now + 0.45);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.start(now); osc.stop(now + 0.7);
        } else if (type === 'defeat') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now); osc.stop(now + 0.4);
        }
      } catch (e) {}
    }

    // =========================================================================
    // DECAYING ABILITY & COMBO ANNOUNCEMENTS (LAST 3 ANNOUNCEMENTS)
    // =========================================================================
    function pushAbilityAnnouncement(icon, title, desc, styleClass = '') {
      const container = document.getElementById('announcements-decay-list');
      if (!container) return;

      const item = {
        id: 'ann_' + Math.random().toString(36).substr(2, 9),
        icon,
        title,
        desc,
        styleClass,
        timestamp: Date.now()
      };

      gameState.activeAnnouncements.push(item);
      // Keep only last 3 announcements
      if (gameState.activeAnnouncements.length > 3) {
        gameState.activeAnnouncements.shift();
      }

      renderAnnouncementsList();

      // Schedule decay
      setTimeout(() => {
        const idx = gameState.activeAnnouncements.findIndex(a => a.id === item.id);
        if (idx !== -1) {
          gameState.activeAnnouncements.splice(idx, 1);
          renderAnnouncementsList();
        }
      }, 3500);
    }

    function renderAnnouncementsList() {
      const container = document.getElementById('announcements-decay-list');
      if (!container) return;
      container.innerHTML = '';

      gameState.activeAnnouncements.forEach(ann => {
        const el = document.createElement('div');
        el.className = \`announcement-item \${ann.styleClass}\`;
        el.innerHTML = \`
          <span style="font-size: 14px; flex-shrink: 0;">\${ann.icon}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 800; color: #fbbf24; font-size: 11px;">\${ann.title}</div>
            <div style="font-size: 10px; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${ann.desc}</div>
          </div>
        \`;
        container.appendChild(el);
      });
    }

    // =========================================================================
    // THREE.JS 3D SCENE & BOARD GENERATION
    // =========================================================================
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 200);
    updateCameraOrbit();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2.5, 45);
    blueLight.position.set(-15, 8, 15);
    scene.add(blueLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2.5, 45);
    goldLight.position.set(15, 8, -15);
    scene.add(goldLight);

    // Arena Floor
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050b14,
      roughness: 0.85,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // InstancedMesh Tactical Grid Tiles
    const TOTAL_TILES = GRID_TOTAL_ROWS * GRID_COLS;
    const tileGeometry = new THREE.BoxGeometry(TILE_SIZE * 0.92, 0.35, TILE_SIZE * 0.92);
    const tileMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.3,
      vertexColors: true
    });

    const instancedBoardMesh = new THREE.InstancedMesh(tileGeometry, tileMaterial, TOTAL_TILES);
    instancedBoardMesh.receiveShadow = true;
    instancedBoardMesh.castShadow = true;
    scene.add(instancedBoardMesh);

    const dummy = new THREE.Object3D();
    const tileColors = new Float32Array(TOTAL_TILES * 3);
    const tileMetadata = [];

    for (let r = 0; r < GRID_TOTAL_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const idx = r * GRID_COLS + c;
        const wx = GRID_OFFSET_X + c * TILE_SIZE;
        const wz = GRID_OFFSET_Z + r * TILE_SIZE;

        dummy.position.set(wx, 0.175, wz);
        dummy.updateMatrix();
        instancedBoardMesh.setMatrixAt(idx, dummy.matrix);

        let color = new THREE.Color();
        let tileType = 'neutral';

        if (r === 0) {
          tileType = 'enemy_bench';
          color.setHex((c % 2 === 0) ? 0x450a0a : 0x7f1d1d);
        } else if (r >= 1 && r <= 3) {
          tileType = 'enemy_lane';
          color.setHex(((r + c) % 2 === 0) ? 0x27272a : 0x3f3f46);
        } else if (r === 4) {
          tileType = 'draft_lane';
          color.setHex((c % 2 === 0) ? 0x1e1b4b : 0x312e81);
        } else if (r >= 5 && r <= 7) {
          tileType = 'player_lane';
          color.setHex(((r + c) % 2 === 0) ? 0x0f172a : 0x1e293b);
        } else if (r === 8) {
          tileType = 'player_bench';
          color.setHex((c % 2 === 0) ? 0x064e3b : 0x065f46);
        }

        color.toArray(tileColors, idx * 3);
        tileMetadata.push({ row: r, col: c, type: tileType, worldX: wx, worldZ: wz });
      }
    }
    instancedBoardMesh.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(tileColors, 3));
    instancedBoardMesh.instanceMatrix.needsUpdate = true;

    // =========================================================================
    // PROCEDURAL 3D CHARACTER MODEL BUILDER
    // =========================================================================
    function buildLowPolyCharacterModel(characterDef, starLevel, isEnemy) {
      const group = new THREE.Group();
      const baseColor = new THREE.Color(characterDef.colorHex);
      const starScale = 1.0 + (starLevel - 1) * 0.18;

      const modelContainer = new THREE.Group();
      modelContainer.scale.setScalar(starScale);
      group.add(modelContainer);

      const bodyMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.35
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.2,
        metalness: 0.85
      });
      const glowMat = new THREE.MeshBasicMaterial({
        color: characterDef.element === 'fire' ? 0xef4444 :
               characterDef.element === 'water' ? 0x0ea5e9 :
               characterDef.element === 'lightning' ? 0xeab308 :
               characterDef.element === 'nature' ? 0x22c55e :
               characterDef.element === 'shadow' ? 0x9333ea : 0xfde047
      });

      const archetype = characterDef.archetype || 'humanoid_warrior';

      if (archetype === 'humanoid_warrior') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.3, 7), bodyMat);
        body.position.y = 0.9;
        modelContainer.add(body);

        const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 0), bodyMat);
        head.position.y = 1.85;
        modelContainer.add(head);

        const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 5), goldMat);
        helmet.position.y = 2.25;
        modelContainer.add(helmet);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.6), goldMat);
        shield.position.set(-0.65, 1.0, 0.2);
        modelContainer.add(shield);

        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.2), glowMat);
        sword.position.set(0.65, 1.1, 0.3);
        sword.rotation.x = 0.3;
        modelContainer.add(sword);
      } else if (archetype === 'humanoid_mage') {
        const robe = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 6), bodyMat);
        robe.position.y = 0.85;
        modelContainer.add(robe);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), bodyMat);
        head.position.y = 1.75;
        modelContainer.add(head);

        const hat = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.85, 5), goldMat);
        hat.position.y = 2.25;
        modelContainer.add(hat);

        for (let i = 0; i < 3; i++) {
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glowMat);
          orb.name = \`spellOrb_\${i}\`;
          orb.position.set(Math.cos(i * 2.1) * 0.75, 1.4, Math.sin(i * 2.1) * 0.75);
          modelContainer.add(orb);
        }
      } else if (archetype === 'winged_dragon' || archetype === 'serpent') {
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.0, 4, 8), bodyMat);
        torso.rotation.x = Math.PI / 3;
        torso.position.y = 1.0;
        modelContainer.add(torso);

        const head = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 5), goldMat);
        head.rotation.x = -Math.PI / 4;
        head.position.set(0, 1.7, 0.6);
        modelContainer.add(head);

        const wingShape = new THREE.BoxGeometry(1.2, 0.05, 0.6);
        const wMeshL = new THREE.Mesh(wingShape, bodyMat);
        wMeshL.position.set(-0.8, 1.4, -0.2);
        wMeshL.rotation.z = 0.35;
        modelContainer.add(wMeshL);
        const wMeshR = new THREE.Mesh(wingShape, bodyMat);
        wMeshR.position.set(0.8, 1.4, -0.2);
        wMeshR.rotation.z = -0.35;
        modelContainer.add(wMeshR);
      } else if (archetype === 'golem_titan') {
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.9), bodyMat);
        torso.position.y = 1.1;
        modelContainer.add(torso);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), goldMat);
        head.position.y = 1.85;
        modelContainer.add(head);

        const shoulderL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), glowMat);
        shoulderL.position.set(-0.85, 1.4, 0);
        modelContainer.add(shoulderL);
        const shoulderR = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), glowMat);
        shoulderR.position.set(0.85, 1.4, 0);
        modelContainer.add(shoulderR);
      } else {
        const beastBody = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 6), bodyMat);
        beastBody.position.y = 0.9;
        modelContainer.add(beastBody);

        const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4), goldMat);
        horn1.position.set(-0.35, 1.65, 0.3);
        horn1.rotation.x = 0.3;
        modelContainer.add(horn1);

        const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4), goldMat);
        horn2.position.set(0.35, 1.65, 0.3);
        horn2.rotation.x = 0.3;
        modelContainer.add(horn2);
      }

      // 3D Canvas Emoji & Star Banner
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 192;
      bannerCanvas.height = 72;
      const bCtx = bannerCanvas.getContext('2d');

      bCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      bCtx.beginPath();
      bCtx.roundRect(4, 4, 184, 64, 12);
      bCtx.fill();
      bCtx.strokeStyle = isEnemy ? '#ef4444' : '#38bdf8';
      bCtx.lineWidth = 4;
      bCtx.stroke();

      bCtx.font = '34px system-ui';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(characterDef.emoji, 96, 32);

      bCtx.font = 'bold 18px system-ui';
      bCtx.fillStyle = '#fbbf24';
      bCtx.fillText('★'.repeat(starLevel), 96, 56);

      const bannerTex = new THREE.CanvasTexture(bannerCanvas);
      const bannerSpriteMat = new THREE.SpriteMaterial({ map: bannerTex, transparent: true });
      const bannerSprite = new THREE.Sprite(bannerSpriteMat);
      bannerSprite.scale.set(2.2, 0.9, 1);
      bannerSprite.position.y = 2.7 + starLevel * 0.12;
      group.add(bannerSprite);

      // HP & Mana Bar Sprite
      const hpCanvas = document.createElement('canvas');
      hpCanvas.width = 128;
      hpCanvas.height = 28;
      const hpTexture = new THREE.CanvasTexture(hpCanvas);
      const hpSpriteMat = new THREE.SpriteMaterial({ map: hpTexture, transparent: true });
      const hpSprite = new THREE.Sprite(hpSpriteMat);
      hpSprite.scale.set(1.9, 0.42, 1);
      hpSprite.position.y = 3.3 + starLevel * 0.12;
      group.add(hpSprite);

      return {
        group,
        modelContainer,
        bannerSprite,
        hpSprite,
        hpCanvas,
        hpTexture
      };
    }

    // =========================================================================
    // 3D UNIT CREATION & RIGGING (UPGRADE SCALING: 120%, 145%, 175%, 210%)
    // =========================================================================
    let unitIdCounter = 1;
    const STAR_SCALING_FACTORS = [1.0, 1.20, 1.45, 1.75, 2.10];

    function create3DUnit(characterDef, starLevel = 1, isEnemy = false, row = 8, col = 0) {
      const starMultiplier = STAR_SCALING_FACTORS[starLevel - 1] || 1.0;
      const starBonusHp = Math.round(characterDef.baseHp * starMultiplier);
      const starBonusAtk = Math.round(characterDef.baseAtk * starMultiplier);
      const starBonusAbility = Math.round(characterDef.ability.power * starMultiplier);
      const starBonusElemAbility = Math.round(characterDef.elementalAbility.power * starMultiplier);

      const {
        group,
        modelContainer,
        bannerSprite,
        hpSprite,
        hpCanvas,
        hpTexture
      } = buildLowPolyCharacterModel(characterDef, starLevel, isEnemy);

      const targetPos = getTileWorldPosition(row, col);
      group.position.copy(targetPos);
      scene.add(group);

      const unitObj = {
        id: \`unit_\${unitIdCounter++}\`,
        charId: characterDef.id,
        name: characterDef.name,
        emoji: characterDef.emoji,
        tier: characterDef.tier,
        cost: characterDef.cost,
        archetype: characterDef.archetype,
        starLevel: starLevel,
        isEnemy: isEnemy,
        row: row,
        col: col,
        maxHp: starBonusHp,
        currentHp: starBonusHp,
        attackDamage: starBonusAtk,
        attackSpeed: characterDef.attackSpeed,
        attackRange: characterDef.range,
        defense: characterDef.defense,
        element: characterDef.element,
        resistance: characterDef.resistance,
        ability: {
          name: characterDef.ability.name,
          desc: characterDef.ability.desc,
          power: starBonusAbility,
          type: characterDef.ability.type,
          element: characterDef.element
        },
        elementalAbility: {
          name: characterDef.elementalAbility.name,
          desc: characterDef.elementalAbility.desc,
          power: starBonusElemAbility,
          element: characterDef.element
        },
        // Combo state tracking
        consecutiveElement: null,
        consecutiveHits: 0,
        lastDamageTaken: 0,
        mana: 0,
        maxMana: 100,
        mesh: group,
        modelContainer: modelContainer,
        hpSprite: hpSprite,
        hpCanvas: hpCanvas,
        hpTexture: hpTexture,
        bannerSprite: bannerSprite,
        lastAttackTime: 0,
        isDead: false,
        targetUnit: null,
        animState: {
          attackLunge: 0,
          spellCastGlow: 0,
          idleOffset: Math.random() * 10
        }
      };

      updateUnitHpBar(unitObj);
      return unitObj;
    }

    function getTileWorldPosition(row, col) {
      const wx = GRID_OFFSET_X + col * TILE_SIZE;
      const wz = GRID_OFFSET_Z + row * TILE_SIZE;
      return new THREE.Vector3(wx, 0.25, wz);
    }

    function updateUnitHpBar(unit) {
      if (!unit || !unit.hpCanvas) return;
      const ctx = unit.hpCanvas.getContext('2d');
      ctx.clearRect(0, 0, 128, 28);

      // Dark background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 2, 128, 16);

      // HP Fill
      const hpPct = Math.max(0, Math.min(1, unit.currentHp / unit.maxHp));
      ctx.fillStyle = unit.isEnemy ? '#ef4444' : '#10b981';
      ctx.fillRect(2, 4, Math.floor(124 * hpPct), 12);

      // Mana Fill Bar (Cyan)
      const manaPct = Math.max(0, Math.min(1, unit.mana / unit.maxMana));
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 19, 128, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(2, 20, Math.floor(124 * manaPct), 4);

      // Border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 2, 128, 16);

      unit.hpTexture.needsUpdate = true;
    }

    // Helper: count active fielded units (Rows 5-7 for player, Rows 1-3 for enemy)
    function countFieldedUnits(isEnemy) {
      const units = isEnemy ? gameState.enemyUnits : gameState.playerUnits;
      return units.filter(u => !u.isDead && (isEnemy ? (u.row >= 1 && u.row <= 3) : (u.row >= 5 && u.row <= 7))).length;
    }

    // =========================================================================
    // MATCH-3 UPGRADE LOGIC (UP TO 5 STARS)
    // =========================================================================
    function checkAndApplyMatch3Upgrades(isEnemy = false) {
      const unitList = isEnemy ? gameState.enemyUnits : gameState.playerUnits;

      const groups = {};
      unitList.forEach(u => {
        if (u.isDead) return;
        const key = \`\${u.charId}_star\${u.starLevel}\`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(u);
      });

      let upgradedAny = false;

      for (const key in groups) {
        const matchingUnits = groups[key];
        if (matchingUnits.length >= 3 && matchingUnits[0].starLevel < 5) {
          const u1 = matchingUnits[0];
          const u2 = matchingUnits[1];
          const u3 = matchingUnits[2];

          const newStarLevel = u1.starLevel + 1;
          const charDef = CHARACTERS_DATABASE.find(c => c.id === u1.charId);

          // Remove the 3 sacrifice units
          [u1, u2, u3].forEach(u => {
            scene.remove(u.mesh);
            const idx = unitList.indexOf(u);
            if (idx !== -1) unitList.splice(idx, 1);
          });

          // Create new upgraded unit on board at u1's spot
          const upgradedUnit = create3DUnit(charDef, newStarLevel, isEnemy, u1.row, u1.col);
          unitList.push(upgradedUnit);

          upgradedAny = true;
          playAudio('upgrade');

          spawnFusionParticles(upgradedUnit.mesh.position);

          const upgradePct = STAR_SCALING_FACTORS[newStarLevel - 1] * 100;
          pushAbilityAnnouncement('⭐', \`MATCH-3 FUSION ★\${newStarLevel}!\`, \`\${charDef.name} evolved with \${upgradePct}% stats!\`, 'upgrade');

          if (!isEnemy) {
            showToast(\`⭐ MATCH 3! \${charDef.name} UPGRADED TO ★\${newStarLevel}! ⭐\`);
          }
          break;
        }
      }

      if (upgradedAny) {
        checkAndApplyMatch3Upgrades(isEnemy);
      }
    }

    // =========================================================================
    // VISUAL EFFECTS & 3D DAMAGE NUMBERS
    // =========================================================================
    function spawnDamageText(worldPos, text, color = '#f87171') {
      const dmgContainer = document.getElementById('damage-container');
      const el = document.createElement('div');
      el.className = 'dmg-number';
      el.innerText = text;
      el.style.color = color;
      dmgContainer.appendChild(el);

      const screenPos = worldToScreen(worldPos);
      el.style.left = \`\${screenPos.x}px\`;
      el.style.top = \`\${screenPos.y}px\`;

      setTimeout(() => {
        el.style.transform = 'translate(-50%, -120%) scale(1.3)';
        el.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 650);
    }

    function worldToScreen(worldPos) {
      const vec = worldPos.clone();
      vec.project(camera);
      const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;
      return { x, y };
    }

    function spawnFusionParticles(centerPos) {
      for (let i = 0; i < 24; i++) {
        const geo = new THREE.SphereGeometry(0.15, 6, 6);
        const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(centerPos);
        scene.add(p);

        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 6 + 2,
          (Math.random() - 0.5) * 6
        );

        gameState.visualEffects.push({
          mesh: p,
          velocity: velocity,
          lifetime: 0.8,
          age: 0
        });
      }
    }

    function spawnSpellParticleWave(originPos, targetPos, colorHex) {
      const pCount = 16;
      for (let i = 0; i < pCount; i++) {
        const geo = new THREE.OctahedronGeometry(0.2, 0);
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(originPos);
        scene.add(p);

        const dir = new THREE.Vector3().subVectors(targetPos, originPos).normalize();
        dir.x += (Math.random() - 0.5) * 0.5;
        dir.y += Math.random() * 0.6;
        dir.z += (Math.random() - 0.5) * 0.5;

        gameState.visualEffects.push({
          mesh: p,
          velocity: dir.multiplyScalar(10 + Math.random() * 6),
          lifetime: 0.6,
          age: 0
        });
      }
    }

    // =========================================================================
    // 96-UNIT DIMINISHING MAIN POOL & SEPARATE DRAFT POOLS
    // =========================================================================
    function initOrReplenishMainPool() {
      if (!gameState.mainUnitPool || gameState.mainUnitPool.length < 8) {
        const deck = [...CHARACTERS_DATABASE];
        // Fisher-Yates shuffle
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        gameState.mainUnitPool = deck;
      }
      updateMainPoolHUD();
    }

    function updateMainPoolHUD() {
      const countEl = document.getElementById('main-pool-count');
      if (countEl) {
        countEl.innerText = \`\${gameState.mainUnitPool.length}/96\`;
      }
    }

    function generateDraftPool() {
      initOrReplenishMainPool();

      // Separate Player Draft Pool (4 units pulled and diminished from 96-unit pool)
      const pPool = [];
      for (let i = 0; i < 4; i++) {
        if (gameState.mainUnitPool.length === 0) initOrReplenishMainPool();
        const drawn = gameState.mainUnitPool.pop();
        if (drawn) pPool.push(drawn);
      }
      gameState.draftPool = pPool;

      // Separate Rival AI Draft Pool (4 units pulled and diminished from 96-unit pool)
      const ePool = [];
      for (let i = 0; i < 4; i++) {
        if (gameState.mainUnitPool.length === 0) initOrReplenishMainPool();
        const drawn = gameState.mainUnitPool.pop();
        if (drawn) ePool.push(drawn);
      }
      gameState.enemyDraftPool = ePool;

      updateMainPoolHUD();
      renderShopUI();
      updateSynergyAnalyzer();
    }

    function renderShopUI() {
      const container = document.getElementById('side-draft-list');
      const countLabel = document.getElementById('draft-count-label');
      if (!container) return;
      container.innerHTML = '';

      if (countLabel) countLabel.innerText = gameState.draftPool.length;

      gameState.draftPool.forEach((charDef, idx) => {
        const card = document.createElement('div');
        const canAfford = gameState.playerGold >= charDef.cost;
        card.className = \`side-draft-card tier-\${charDef.tier} \${canAfford ? '' : 'disabled'}\`;

        card.innerHTML = \`
          <div class="side-card-top">
            <div class="side-card-identity">
              <div class="side-card-emoji">\${charDef.emoji}</div>
              <div style="min-width: 0;">
                <div class="side-card-name">\${charDef.name}</div>
                <div class="side-card-badges">
                  <span class="element-badge \${charDef.element}">\${charDef.element}</span>
                  <span class="resist-badge">Resist: \${charDef.resistance}</span>
                </div>
              </div>
            </div>
            <button class="side-card-cost-btn" onclick="event.stopPropagation(); buyCharacterFromShop(\${idx})">
              <span>🪙</span><span>\${charDef.cost}</span>
            </button>
          </div>
          <div class="side-card-stats">
            <span>❤️\${charDef.baseHp} ⚔️\${charDef.baseAtk}</span>
            <span style="color: #94a3b8; font-size: 8.5px;">Tier \${charDef.tier}</span>
          </div>
        \`;

        card.onclick = () => buyCharacterFromShop(idx);
        container.appendChild(card);
      });
    }

    function buyCharacterFromShop(cardIndex) {
      if (gameState.phase === 'combat') return;
      const charDef = gameState.draftPool[cardIndex];
      if (!charDef) return;

      if (gameState.playerGold < charDef.cost) {
        showToast('Not enough Gold! 🪙');
        return;
      }

      // Check for free slot on player bench (row 8, cols 0..7)
      const occupiedBenchCols = gameState.playerUnits
        .filter(u => u.row === 8 && !u.isDead)
        .map(u => u.col);

      let targetCol = -1;
      for (let c = 0; c < GRID_COLS; c++) {
        if (!occupiedBenchCols.includes(c)) {
          targetCol = c;
          break;
        }
      }

      if (targetCol === -1) {
        showToast('Bench Full! Deploy units onto Attack Lanes (Rows 5-7).');
        return;
      }

      gameState.playerGold -= charDef.cost;
      playAudio('buy');

      // Create new unit onto bench
      const unit = create3DUnit(charDef, 1, false, 8, targetCol);
      gameState.playerUnits.push(unit);

      // Remove card from draft pool
      gameState.draftPool.splice(cardIndex, 1);
      updateHUD();
      renderShopUI();

      // Check Match-3 auto combine
      checkAndApplyMatch3Upgrades(false);
      updateSynergyAnalyzer();
    }

    function rerollShop() {
      if (gameState.playerGold < 2) {
        showToast('Reroll costs 2 Gold!');
        return;
      }
      gameState.playerGold -= 2;
      playAudio('click');
      generateDraftPool();
      updateHUD();
    }

    window.toggleSideDraft = function() {
      const panel = document.getElementById('side-draft-panel');
      const btn = document.getElementById('toggle-draft-btn');
      if (!panel) return;
      panel.classList.toggle('collapsed');
      if (btn) {
        btn.innerText = panel.classList.contains('collapsed') ? '+' : '−';
      }
    };

    // =========================================================================
    // PLAYER SYNERGY & COMBOS ANALYZER PANEL
    // =========================================================================
    window.toggleSynergyPanel = function(force) {
      const panel = document.getElementById('synergy-analyzer-panel');
      if (!panel) return;
      if (typeof force === 'boolean') {
        gameState.isSynergyOpen = force;
      } else {
        gameState.isSynergyOpen = !gameState.isSynergyOpen;
      }
      panel.style.display = gameState.isSynergyOpen ? 'flex' : 'none';
      if (gameState.isSynergyOpen) updateSynergyAnalyzer();
    };

    function updateSynergyAnalyzer() {
      const upgradesContainer = document.getElementById('combo-upgrades-list');
      const synergiesContainer = document.getElementById('combo-synergies-list');
      const adviceEl = document.getElementById('combo-advice-text');
      const badgeEl = document.getElementById('combo-alert-badge');

      if (!upgradesContainer || !synergiesContainer || !adviceEl) return;

      upgradesContainer.innerHTML = '';
      synergiesContainer.innerHTML = '';

      let alertCount = 0;

      // 1. Analyze Star Evolution Opportunities
      const playerUnitCounts = {};
      gameState.playerUnits.forEach(u => {
        if (u.isDead) return;
        const key = \`\${u.charId}_star\${u.starLevel}\`;
        if (!playerUnitCounts[key]) {
          playerUnitCounts[key] = { charId: u.charId, name: u.name, emoji: u.emoji, starLevel: u.starLevel, count: 0 };
        }
        playerUnitCounts[key].count++;
      });

      const shopCharIds = gameState.draftPool.map(c => c.id);
      const upgradeItems = [];

      for (const key in playerUnitCounts) {
        const item = playerUnitCounts[key];
        const inShop = shopCharIds.includes(item.charId);

        if (item.count >= 2 && inShop && item.starLevel < 5) {
          alertCount++;
          upgradeItems.push({
            priority: 1,
            html: \`
              <div class="combo-card upgrade-ready">
                <div class="combo-title" style="color: #fbbf24; justify-content: space-between;">
                  <span>⚡ IMMEDIATE EVOLUTION!</span>
                  <span>★\${item.starLevel} ➔ ★\${item.starLevel + 1}</span>
                </div>
                <div class="combo-desc">
                  Buy <strong>\${item.emoji} \${item.name}</strong> from draft to trigger Match-3 Fusion!
                </div>
              </div>
            \`
          });
        } else if (item.count === 2 && item.starLevel < 5) {
          upgradeItems.push({
            priority: 2,
            html: \`
              <div class="combo-card">
                <div class="combo-title" style="color: #38bdf8;">⭐ 2/3 Collected: \${item.emoji} \${item.name} (★\${item.starLevel})</div>
                <div class="combo-desc">Need 1 more copy to fuse into ★\${item.starLevel + 1}.</div>
              </div>
            \`
          });
        } else if (item.count === 1 && inShop && item.starLevel < 5) {
          upgradeItems.push({
            priority: 3,
            html: \`
              <div class="combo-card">
                <div class="combo-title" style="color: #c084fc;">🛒 1/3 Owned: \${item.emoji} \${item.name} in Shop</div>
                <div class="combo-desc">Purchasing brings you to 2/3 copies.</div>
              </div>
            \`
          });
        }
      }

      if (upgradeItems.length === 0) {
        upgradesContainer.innerHTML = \`
          <div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">
            No immediate Match-3 combinations. Buy matching units from the draft pool to trigger star fusions!
          </div>
        \`;
      } else {
        upgradeItems.sort((a, b) => a.priority - b.priority);
        upgradeItems.forEach(item => {
          upgradesContainer.innerHTML += item.html;
        });
      }

      // 2. Analyze Archetype Synergies
      const archetypeDefinitions = {
        'humanoid_warrior': { name: 'Vanguard', emoji: '⚔️', bonus: '+15% ATK' },
        'humanoid_mage': { name: 'Arcane', emoji: '🔮', bonus: '+25 Ability Power' },
        'winged_dragon': { name: 'Draconic', emoji: '🐲', bonus: '+20% Crit' },
        'winged_mystic': { name: 'Mythic', emoji: '✨', bonus: '+15% Speed' },
        'golem_titan': { name: 'Titan', emoji: '🗿', bonus: '+20% Max HP' },
        'beast_horn': { name: 'Horned', emoji: '🦏', bonus: '+10 Armor' },
        'beast_tusks': { name: 'Fangs', emoji: '🐗', bonus: '+15 True DMG' },
        'serpent': { name: 'Serpent', emoji: '🐍', bonus: '+20 Poison' }
      };

      const archetypeCounts = {};
      gameState.playerUnits.forEach(u => {
        if (u.isDead) return;
        const charDef = CHARACTERS_DATABASE.find(c => c.id === u.charId);
        if (charDef && charDef.archetype) {
          archetypeCounts[charDef.archetype] = (archetypeCounts[charDef.archetype] || 0) + 1;
        }
      });

      let hasSynergy = false;
      for (const arch in archetypeCounts) {
        const count = archetypeCounts[arch];
        const def = archetypeDefinitions[arch] || { name: arch, emoji: '🛡️', bonus: 'Synergy Active' };
        const isActive = count >= 2;
        if (isActive) hasSynergy = true;

        const chip = document.createElement('div');
        chip.className = \`synergy-chip \${isActive ? 'active' : ''}\`;
        chip.innerHTML = \`
          <span>\${def.emoji} \${def.name}:</span>
          <strong>\${count} Units</strong>
          <span class="synergy-count">\${isActive ? 'Active' : 'Need 2'}</span>
        \`;
        synergiesContainer.appendChild(chip);
      }

      if (!hasSynergy) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.fontSize = '11px';
        emptyMsg.style.color = '#64748b';
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.innerText = 'Deploy 2 or more units of the same archetype to activate synergy stat bonuses!';
        synergiesContainer.appendChild(emptyMsg);
      }

      // 3. Dynamic Strategic Advice
      const fieldedCount = countFieldedUnits(false);
      if (alertCount > 0) {
        adviceEl.innerText = \`🔥 Priority: You have \${alertCount} unit(s) in the shop ready for an instant Match-3 Star Evolution!\`;
        adviceEl.style.borderColor = '#fbbf24';
        adviceEl.style.color = '#fde68a';
      } else if (fieldedCount === 0) {
        adviceEl.innerText = \`⚠️ Tactical Warning: Your bench units cannot fight! Move units onto Attack Lanes (Rows 5-7). Max 8 fielded units.\`;
        adviceEl.style.borderColor = '#f87171';
        adviceEl.style.color = '#fca5a5';
      } else {
        adviceEl.innerText = \`💡 Recommended: Fielded \${fieldedCount}/8 units. Hit enemies with 3x non-resistant elements for a 200% Overload critical hit!\`;
        adviceEl.style.borderColor = '#38bdf8';
        adviceEl.style.color = '#bae6fd';
      }

      if (badgeEl) {
        if (alertCount > 0) {
          badgeEl.innerText = alertCount;
          badgeEl.style.display = 'inline-block';
        } else {
          badgeEl.style.display = 'none';
        }
      }
    }

    // =========================================================================
    // AI STRATEGY ENGINE & DIFFICULTY SCALING (NON-VISIBLE STRATEGY LIST)
    // =========================================================================
    function getAiAdvancedStrategyChance() {
      const cappedWins = Math.min(gameState.wins, 256);
      return (cappedWins / 512) * 100;
    }

    function enemyAiDraftAndDeploy() {
      const advancedChance = getAiAdvancedStrategyChance();
      const isAdvanced = (Math.random() * 100) < advancedChance;

      // Internal non-visible strategic target and score evaluation list
      const aiInternalStrategyList = [];

      const aiUnitCounts = {};
      gameState.enemyUnits.forEach(u => {
        if (u.isDead) return;
        const key = \`\${u.charId}_star\${u.starLevel}\`;
        aiUnitCounts[key] = (aiUnitCounts[key] || 0) + 1;
      });

      // Score each candidate unit in the AI's separate draft pool
      gameState.enemyDraftPool.forEach((charDef, index) => {
        let score = charDef.cost * 15;

        // Check Match-3 potential
        const currentCount = aiUnitCounts[\`\${charDef.id}_star1\`] || 0;
        if (currentCount === 2) score += 140;
        else if (currentCount === 1) score += 70;

        // Check Frontline vs Backline balance
        const frontlineCount = gameState.enemyUnits.filter(u => !u.isDead && ['golem_titan', 'beast_horn', 'humanoid_warrior'].includes(u.archetype)).length;
        if (frontlineCount < 2 && ['golem_titan', 'beast_horn'].includes(charDef.archetype)) {
          score += 50;
        } else if (['humanoid_mage', 'winged_dragon'].includes(charDef.archetype)) {
          score += 40;
        }

        aiInternalStrategyList.push({
          charDef,
          draftIndex: index,
          strategicScore: score
        });
      });

      if (isAdvanced) {
        aiInternalStrategyList.sort((a, b) => b.strategicScore - a.strategicScore);
      }

      // Execute AI Purchasing up to max 8 fielded units
      for (let i = 0; i < aiInternalStrategyList.length; i++) {
        if (countFieldedUnits(true) >= 8) break;

        const candidate = aiInternalStrategyList[i];
        const charDef = candidate.charDef;

        if (gameState.enemyGold >= charDef.cost) {
          const occupied = gameState.enemyUnits.filter(u => !u.isDead).map(u => \`\${u.row},\${u.col}\`);
          let targetRow = 2;
          let targetCol = -1;

          if (isAdvanced) {
            const isFrontliner = ['golem_titan', 'beast_horn', 'beast_tusks', 'humanoid_warrior'].includes(charDef.archetype);
            const preferredRows = isFrontliner ? [3, 2, 1] : [1, 2, 3];

            for (const r of preferredRows) {
              for (let c = 0; c < GRID_COLS; c++) {
                if (!occupied.includes(\`\${r},\${c}\`)) {
                  targetRow = r;
                  targetCol = c;
                  break;
                }
              }
              if (targetCol !== -1) break;
            }
          } else {
            for (let r = 1; r <= 3; r++) {
              for (let c = 0; c < GRID_COLS; c++) {
                if (!occupied.includes(\`\${r},\${c}\`)) {
                  targetRow = r;
                  targetCol = c;
                  break;
                }
              }
              if (targetCol !== -1) break;
            }
          }

          if (targetCol !== -1) {
            const u = create3DUnit(charDef, 1, true, targetRow, targetCol);
            gameState.enemyUnits.push(u);
            gameState.enemyGold -= charDef.cost;
          }
        }
      }

      // Check Match-3 upgrades for Enemy AI
      checkAndApplyMatch3Upgrades(true);
    }

    // =========================================================================
    // COMBAT SIMULATION & ELEMENTAL COMBO SYSTEM (MAX 8 FIELDED UNITS)
    // =========================================================================
    function startCombatPhase() {
      if (gameState.phase === 'combat') return;

      // Active combat units must be on Attack Lanes (Player: 5-7, Enemy: 1-3)
      const activePlayerUnits = gameState.playerUnits.filter(u => !u.isDead && u.row >= 5 && u.row <= 7);
      if (activePlayerUnits.length === 0) {
        const benchUnits = gameState.playerUnits.filter(u => !u.isDead && u.row === 8).slice(0, 8);
        if (benchUnits.length > 0) {
          benchUnits.forEach((u, idx) => {
            u.row = 7;
            u.col = idx;
            u.mesh.position.copy(getTileWorldPosition(7, idx));
          });
          showToast('⚠️ Bench is reserves only! Deployed units to Attack Lanes (Row 7).');
        } else {
          showToast('⚠️ No units deployed! Buy characters to battle.');
          return;
        }
      }

      // Ensure enemy bench units on row 0 are moved to attack rows 1-3 (max 8)
      const enemyBenchUnits = gameState.enemyUnits.filter(u => !u.isDead && u.row === 0).slice(0, 8);
      enemyBenchUnits.forEach((u, idx) => {
        u.row = 1;
        u.col = idx % GRID_COLS;
        u.mesh.position.copy(getTileWorldPosition(1, u.col));
      });

      gameState.phase = 'combat';
      updateHUD();
      showToast('⚔️ BATTLE COMMENCED! ⚔️');

      toggleSideDraft();
      toggleSynergyPanel(false);
    }

    function updateCombatSimulation(dt, time) {
      if (gameState.phase !== 'combat') return;

      const livingPlayer = gameState.playerUnits.filter(u => !u.isDead && u.row >= 5 && u.row <= 7);
      const livingEnemy = gameState.enemyUnits.filter(u => !u.isDead && u.row >= 1 && u.row <= 3);

      if (livingEnemy.length === 0 || livingPlayer.length === 0) {
        resolveCombatOutcome(livingEnemy.length === 0 && livingPlayer.length > 0);
        return;
      }

      livingPlayer.forEach(unit => {
        simulateUnitCombat(unit, livingEnemy, dt, time);
      });

      livingEnemy.forEach(unit => {
        simulateUnitCombat(unit, livingPlayer, dt, time);
      });
    }

    function simulateUnitCombat(unit, opponentList, dt, time) {
      if (unit.isDead) return;

      let nearestFoe = null;
      let minDistance = Infinity;

      opponentList.forEach(foe => {
        if (foe.isDead) return;
        const dist = unit.mesh.position.distanceTo(foe.mesh.position);
        if (dist < minDistance) {
          minDistance = dist;
          nearestFoe = foe;
        }
      });

      if (!nearestFoe) return;
      unit.targetUnit = nearestFoe;

      const attackRangeWorld = unit.attackRange * TILE_SIZE;

      if (minDistance > attackRangeWorld) {
        const moveDir = new THREE.Vector3()
          .subVectors(nearestFoe.mesh.position, unit.mesh.position)
          .normalize();

        const moveSpeed = 3.5;
        unit.mesh.position.addScaledVector(moveDir, moveSpeed * dt);
        unit.mesh.position.y = 0.25;

        unit.modelContainer.lookAt(nearestFoe.mesh.position.x, unit.modelContainer.position.y, nearestFoe.mesh.position.z);
      } else {
        if (time - unit.lastAttackTime >= unit.attackSpeed) {
          unit.lastAttackTime = time;

          if (unit.mana >= unit.maxMana) {
            castUnitPowerAbility(unit, opponentList);
          } else {
            performUnitAutoAttack(unit, nearestFoe);
          }
        }
      }
    }

    // Apply damage and handle 3-in-a-row Elemental Combo System
    function applyElementalHit(target, attacker, rawDamage, element, isAbility = false) {
      if (target.isDead) return 0;

      let finalDamage = rawDamage;

      // Resistance check
      if (target.resistance === element) {
        finalDamage = Math.max(1, Math.round(finalDamage * 0.6));
        target.consecutiveHits = 0;
        target.consecutiveElement = null;
        spawnDamageText(target.mesh.position, \`🛡️ RESIST! -\${finalDamage}\`, '#94a3b8');
      } else {
        // Elemental Combo tracking
        if (target.consecutiveElement === element) {
          target.consecutiveHits++;
        } else {
          target.consecutiveElement = element;
          target.consecutiveHits = 1;
        }

        // Check if 3 consecutive non-resistant elemental hits occurred
        if (target.consecutiveHits >= 3) {
          const critBonus = Math.round((target.lastDamageTaken || finalDamage) * 2.0);
          finalDamage += critBonus;
          playAudio('crit');
          spawnDamageText(target.mesh.position, \`💥 200% CRIT! -\${finalDamage}\`, '#f59e0b');
          spawnFusionParticles(target.mesh.position);
          pushAbilityAnnouncement('💥', '200% ELEMENTAL OVERLOAD!', \`\${target.name} suffered 200% \${element.toUpperCase()} Overload (\${finalDamage} DMG)!\`, 'combo-crit');
          target.consecutiveHits = 0;
          target.consecutiveElement = null;
        } else {
          const elemColor = element === 'fire' ? '#f87171' :
                           element === 'water' ? '#38bdf8' :
                           element === 'lightning' ? '#facc15' :
                           element === 'nature' ? '#4ade80' :
                           element === 'shadow' ? '#c084fc' : '#fef08a';
          spawnDamageText(target.mesh.position, \`-\${finalDamage}\`, elemColor);
        }
      }

      target.lastDamageTaken = finalDamage;
      target.currentHp = Math.max(0, target.currentHp - finalDamage);

      // Charge Mana
      attacker.mana = Math.min(attacker.maxMana, attacker.mana + (isAbility ? 0 : 35));
      target.mana = Math.min(target.maxMana, target.mana + 20);

      updateUnitHpBar(attacker);
      updateUnitHpBar(target);

      if (target.currentHp <= 0) {
        target.isDead = true;
        scene.remove(target.mesh);
      }

      return finalDamage;
    }

    function performUnitAutoAttack(unit, target) {
      playAudio('attack');
      unit.animState.attackLunge = 1.0;

      const defFactor = 1 - (target.defense / 100);
      const baseDmg = Math.max(1, Math.round(unit.attackDamage * defFactor));

      applyElementalHit(target, unit, baseDmg, unit.element, false);
      spawnSpellParticleWave(unit.mesh.position, target.mesh.position, unit.isEnemy ? 0xef4444 : 0x38bdf8);
    }

    function castUnitPowerAbility(unit, opponentList) {
      unit.mana = 0;
      unit.animState.spellCastGlow = 1.0;
      playAudio('ability');

      const ability = unit.ability;
      pushAbilityAnnouncement('✨', \`\${unit.name} CAST \${ability.name}\`, \`Channels \${unit.element.toUpperCase()} ability power!\`);

      if (ability.type === 'heal') {
        const allyList = unit.isEnemy ? gameState.enemyUnits : gameState.playerUnits;
        const lowestAlly = allyList
          .filter(a => !a.isDead)
          .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];

        if (lowestAlly) {
          lowestAlly.currentHp = Math.min(lowestAlly.maxHp, lowestAlly.currentHp + ability.power);
          updateUnitHpBar(lowestAlly);
          spawnDamageText(lowestAlly.mesh.position, \`+\${ability.power} HP\`, '#10b981');
          spawnSpellParticleWave(unit.mesh.position, lowestAlly.mesh.position, 0x10b981);
        }
      } else {
        const targets = opponentList.filter(o => !o.isDead).slice(0, 3);
        targets.forEach(t => {
          applyElementalHit(t, unit, ability.power, unit.element, true);
          spawnSpellParticleWave(unit.mesh.position, t.mesh.position, 0xf59e0b);
        });
      }

      updateUnitHpBar(unit);
    }

    function resolveCombatOutcome(playerWon) {
      gameState.phase = 'round_end';

      if (playerWon) {
        gameState.wins++;
        gameState.enemyHp = Math.max(0, gameState.enemyHp - 1);
        gameState.playerGold += 6;
        gameState.enemyGold += 2;
        playAudio('victory');
        showToast('🎉 VICTORY! +6 GOLD ACCUMULATED 🎉');
      } else {
        gameState.losses++;
        gameState.playerHp = Math.max(0, gameState.playerHp - 1);
        gameState.playerGold += 2;
        gameState.enemyGold += 6;
        playAudio('defeat');
        showToast('💀 DEFEAT! +2 GOLD EARNED 💀');
      }

      saveWinsToDatabase();
      updateHUD();

      if (gameState.playerHp <= 0 || gameState.enemyHp <= 0) {
        setTimeout(showGameOverModal, 1500);
        return;
      }

      setTimeout(() => {
        prepareNextRound();
      }, 2500);
    }

    function prepareNextRound() {
      gameState.round++;
      gameState.phase = 'draft';
      gameState.prepTimeLeft = 25;

      // Reset surviving units
      gameState.playerUnits.forEach(u => {
        u.isDead = false;
        u.currentHp = u.maxHp;
        u.mana = 0;
        u.consecutiveHits = 0;
        u.consecutiveElement = null;
        if (!scene.children.includes(u.mesh)) scene.add(u.mesh);
        u.mesh.position.copy(getTileWorldPosition(u.row, u.col));
        updateUnitHpBar(u);
      });

      gameState.enemyUnits.forEach(u => {
        u.isDead = false;
        u.currentHp = u.maxHp;
        u.mana = 0;
        u.consecutiveHits = 0;
        u.consecutiveElement = null;
        if (!scene.children.includes(u.mesh)) scene.add(u.mesh);
        u.mesh.position.copy(getTileWorldPosition(u.row, u.col));
        updateUnitHpBar(u);
      });

      generateDraftPool();
      enemyAiDraftAndDeploy();
      updateHUD();
    }

    // =========================================================================
    // DATABASE HIGH SCORE SYNC
    // =========================================================================
    function saveWinsToDatabase() {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'FIRESTORM_SAVE_SCORE',
            gameId: 'emoji-tactics',
            score: gameState.wins,
            details: \`\${gameState.wins} Victories (Round \${gameState.round})\`
          }, '*');
        }
      } catch (e) {
        console.warn('Parent save error:', e);
      }
    }

    // =========================================================================
    // 3D CAMERA ORBIT CONTROLS (SIMPLIFIED TO CENTER VIEW & ROTATE 45°)
    // =========================================================================
    function updateCameraOrbit() {
      cameraOrbit.phi = Math.max(0.15, Math.min(Math.PI / 2.05, cameraOrbit.phi));
      cameraOrbit.radius = Math.max(16, Math.min(75, cameraOrbit.radius));

      const x = cameraOrbit.radius * Math.sin(cameraOrbit.phi) * Math.cos(cameraOrbit.theta);
      const y = cameraOrbit.radius * Math.cos(cameraOrbit.phi);
      const z = cameraOrbit.radius * Math.sin(cameraOrbit.phi) * Math.sin(cameraOrbit.theta);

      camera.position.set(x, y, z);
      camera.lookAt(cameraOrbit.target);
    }

    window.rotateCamera = function(dTheta) {
      cameraOrbit.theta += dTheta;
      updateCameraOrbit();
    };

    window.resetCameraView = function() {
      cameraOrbit.radius = 38;
      cameraOrbit.theta = Math.PI / 2;
      cameraOrbit.phi = Math.PI / 3.2;
      updateCameraOrbit();
    };

    // Pointer listeners
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('mousedown', (e) => {
      cameraOrbit.isDragging = true;
      cameraOrbit.prevMouseX = e.clientX;
      cameraOrbit.prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (cameraOrbit.isDragging) {
        const dx = e.clientX - cameraOrbit.prevMouseX;
        const dy = e.clientY - cameraOrbit.prevMouseY;

        cameraOrbit.theta -= dx * 0.006;
        cameraOrbit.phi -= dy * 0.006;
        updateCameraOrbit();

        cameraOrbit.prevMouseX = e.clientX;
        cameraOrbit.prevMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      cameraOrbit.isDragging = false;
    });

    container.addEventListener('wheel', (e) => {
      cameraOrbit.radius += e.deltaY * 0.025;
      updateCameraOrbit();
    }, { passive: true });

    // =========================================================================
    // RAYCASTER UNIT INSPECTION & CLICK POSITIONING
    // =========================================================================
    container.addEventListener('click', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const allUnits = [...gameState.playerUnits, ...gameState.enemyUnits].filter(u => !u.isDead);
      const unitMeshes = allUnits.map(u => u.mesh);

      const intersects = raycaster.intersectObjects(unitMeshes, true);
      if (intersects.length > 0) {
        let clickedObj = intersects[0].object;
        while (clickedObj.parent && !unitMeshes.includes(clickedObj)) {
          clickedObj = clickedObj.parent;
        }

        const foundUnit = allUnits.find(u => u.mesh === clickedObj);
        if (foundUnit) {
          openUnitInspector(foundUnit);
          return;
        }
      }

      const boardIntersects = raycaster.intersectObject(instancedBoardMesh);
      if (boardIntersects.length > 0) {
        const instanceId = boardIntersects[0].instanceId;
        const tileMeta = tileMetadata[instanceId];
        if (tileMeta && gameState.selectedUnit) {
          moveSelectedUnitToTile(tileMeta.row, tileMeta.col);
        }
      }
    });

    function updateInspectorPositionControls(unit) {
      const deployBox = document.getElementById('inspector-deploy-controls');
      const laneSection = document.getElementById('inspector-lane-section');
      const currentPosLabel = document.getElementById('inspector-current-pos');
      if (!deployBox || !laneSection) return;

      if (!unit || unit.isEnemy) {
        deployBox.style.display = 'none';
        laneSection.style.display = 'none';
        return;
      }

      deployBox.style.display = 'flex';
      laneSection.style.display = 'flex';

      const benchBtn = document.getElementById('deploy-bench-btn');
      const r1Btn = document.getElementById('deploy-field-r1');
      const r2Btn = document.getElementById('deploy-field-r2');
      const r3Btn = document.getElementById('deploy-field-r3');

      if (benchBtn) benchBtn.classList.toggle('active', unit.row === 8);
      if (r1Btn) r1Btn.classList.toggle('active', unit.row === 5);
      if (r2Btn) r2Btn.classList.toggle('active', unit.row === 6);
      if (r3Btn) r3Btn.classList.toggle('active', unit.row === 7);

      const laneBtns = laneSection.querySelectorAll('.lane-btn');
      laneBtns.forEach(btn => {
        const laneVal = parseInt(btn.getAttribute('data-lane'), 10);
        btn.classList.toggle('active', laneVal === (unit.col + 1));
      });

      if (currentPosLabel) {
        let rowName = 'Bench';
        if (unit.row === 5) rowName = 'Field Row 1 (Back)';
        else if (unit.row === 6) rowName = 'Field Row 2 (Mid)';
        else if (unit.row === 7) rowName = 'Field Row 3 (Front)';
        currentPosLabel.innerText = \`\${rowName}, Lane \${unit.col + 1}\`;
      }
    }

    function openUnitInspector(unit) {
      gameState.inspectedUnit = unit;
      const card = document.getElementById('unit-info-card');
      if (!card) return;

      document.getElementById('inspector-avatar').innerText = unit.emoji;
      document.getElementById('inspector-name').innerText = unit.name;
      document.getElementById('inspector-stars').innerText = \`\${'★'.repeat(unit.starLevel)}\${'☆'.repeat(5 - unit.starLevel)} (Tier \${unit.tier})\`;
      document.getElementById('inspector-hp').innerText = \`\${unit.currentHp}/\${unit.maxHp}\`;
      document.getElementById('inspector-atk').innerText = \`\${unit.attackDamage}\`;
      document.getElementById('inspector-spd').innerText = \`\${unit.attackSpeed}s\`;
      document.getElementById('inspector-rng').innerText = \`\${unit.attackRange} Tiles\`;
      document.getElementById('inspector-def').innerText = \`\${unit.defense}%\`;
      document.getElementById('inspector-pwr').innerText = \`★\${unit.starLevel} (\${STAR_SCALING_FACTORS[unit.starLevel - 1] * 100}%)\`;

      // Badges
      const elemBadge = document.getElementById('inspector-element-badge');
      const resistBadge = document.getElementById('inspector-resist-badge');
      if (elemBadge) {
        elemBadge.className = \`element-badge \${unit.element}\`;
        elemBadge.innerText = unit.element.toUpperCase();
      }
      if (resistBadge) {
        resistBadge.innerText = \`🛡️ Resist: \${unit.resistance.toUpperCase()}\`;
      }

      document.getElementById('inspector-ability-name').innerText = unit.ability.name;
      document.getElementById('inspector-ability-desc').innerText = unit.ability.desc;

      // 3rd Elemental Ability
      const elemAbName = document.getElementById('inspector-elem-ability-name');
      const elemAbDesc = document.getElementById('inspector-elem-ability-desc');
      if (elemAbName && unit.elementalAbility) elemAbName.innerText = unit.elementalAbility.name;
      if (elemAbDesc && unit.elementalAbility) elemAbDesc.innerText = unit.elementalAbility.desc;

      const sellBtn = document.getElementById('inspector-sell-btn');
      const sellGoldSpan = document.getElementById('inspector-sell-gold');
      if (sellBtn && sellGoldSpan) {
        if (!unit.isEnemy && gameState.phase !== 'combat') {
          sellBtn.style.display = 'block';
          sellGoldSpan.innerText = unit.cost * unit.starLevel;
        } else {
          sellBtn.style.display = 'none';
        }
      }

      updateInspectorPositionControls(unit);
      card.style.display = 'block';
      playAudio('click');
    }

    window.closeUnitInspector = function() {
      const card = document.getElementById('unit-info-card');
      if (card) card.style.display = 'none';
      gameState.inspectedUnit = null;
    };

    window.moveInspectedUnitToZone = function(zone) {
      const unit = gameState.inspectedUnit;
      if (!unit || unit.isEnemy) return;
      if (gameState.phase === 'combat') {
        showToast('Cannot reposition units during combat!');
        return;
      }

      let targetRow = 8;
      let zoneName = 'Bench';
      if (zone === 'bench') {
        targetRow = 8;
        zoneName = 'Reserve Bench';
      } else if (zone === 'row1') {
        targetRow = 5;
        zoneName = 'Field Row 1 (Backline)';
      } else if (zone === 'row2') {
        targetRow = 6;
        zoneName = 'Field Row 2 (Midline)';
      } else if (zone === 'row3') {
        targetRow = 7;
        zoneName = 'Field Row 3 (Frontline)';
      }

      if (unit.row === targetRow) return;

      // Enforce max 8 fielded units constraint
      if (unit.row === 8 && targetRow !== 8) {
        if (countFieldedUnits(false) >= 8) {
          showToast('⚠️ Max 8 units fielded! Free a field slot or keep on bench.');
          return;
        }
      }

      const occupied = gameState.playerUnits.find(u => u !== unit && u.row === targetRow && u.col === unit.col && !u.isDead);
      if (occupied) {
        occupied.row = unit.row;
        occupied.mesh.position.copy(getTileWorldPosition(occupied.row, occupied.col));
      }

      unit.row = targetRow;
      unit.mesh.position.copy(getTileWorldPosition(unit.row, unit.col));

      playAudio('click');
      showToast(\`Moved \${unit.name} to \${zoneName}!\`);
      updateInspectorPositionControls(unit);
      updateSynergyAnalyzer();
      updateHUD();
    };

    window.moveInspectedUnitToLane = function(laneNum) {
      const unit = gameState.inspectedUnit;
      if (!unit || unit.isEnemy) return;
      if (gameState.phase === 'combat') {
        showToast('Cannot reposition units during combat!');
        return;
      }

      const targetCol = Math.max(0, Math.min(7, laneNum - 1));
      if (unit.col === targetCol) return;

      const occupied = gameState.playerUnits.find(u => u !== unit && u.row === unit.row && u.col === targetCol && !u.isDead);
      if (occupied) {
        occupied.col = unit.col;
        occupied.mesh.position.copy(getTileWorldPosition(occupied.row, occupied.col));
      }

      unit.col = targetCol;
      unit.mesh.position.copy(getTileWorldPosition(unit.row, unit.col));

      playAudio('click');
      showToast(\`Moved \${unit.name} to Lane \${laneNum}!\`);
      updateInspectorPositionControls(unit);
      updateSynergyAnalyzer();
      updateHUD();
    };

    window.sellInspectedUnit = function() {
      const unit = gameState.inspectedUnit;
      if (!unit || unit.isEnemy || gameState.phase === 'combat') return;

      const sellValue = unit.cost * unit.starLevel;
      gameState.playerGold += sellValue;
      scene.remove(unit.mesh);

      const idx = gameState.playerUnits.indexOf(unit);
      if (idx !== -1) gameState.playerUnits.splice(idx, 1);

      playAudio('buy');
      showToast(\`Sold \${unit.name} for +\${sellValue} Gold!\`);
      closeUnitInspector();
      updateHUD();
    };

    function moveSelectedUnitToTile(targetRow, targetCol) {
      const unit = gameState.selectedUnit;
      if (!unit || unit.isEnemy || gameState.phase === 'combat') return;

      if (targetRow < 5) {
        showToast('Place units on Attack Lanes (Rows 5-7) or Bench (Row 8).');
        return;
      }

      // Check max 8 fielded units
      if (unit.row === 8 && targetRow >= 5 && targetRow <= 7) {
        if (countFieldedUnits(false) >= 8) {
          showToast('⚠️ Max 8 units fielded! Free a field slot or keep on bench.');
          return;
        }
      }

      const occupied = gameState.playerUnits.find(u => u !== unit && u.row === targetRow && u.col === targetCol && !u.isDead);
      if (occupied) {
        occupied.row = unit.row;
        occupied.col = unit.col;
        occupied.mesh.position.copy(getTileWorldPosition(occupied.row, occupied.col));
      }

      unit.row = targetRow;
      unit.col = targetCol;
      unit.mesh.position.copy(getTileWorldPosition(targetRow, targetCol));
      gameState.selectedUnit = null;
      playAudio('click');
      if (gameState.inspectedUnit === unit) {
        updateInspectorPositionControls(unit);
      }
      updateSynergyAnalyzer();
      updateHUD();
    }

    window.rerollShop = rerollShop;
    window.triggerCombatPhase = startCombatPhase;

    function updateHUD() {
      const pBar = document.getElementById('player-hp-bar');
      const pText = document.getElementById('player-hp-text');
      const pGold = document.getElementById('player-gold-text');
      const pWins = document.getElementById('player-wins-text');

      if (pBar) pBar.style.width = \`\${Math.max(0, (gameState.playerHp / 10) * 100)}%\`;
      if (pText) pText.innerText = \`\${gameState.playerHp}/10\`;
      if (pGold) pGold.innerText = \`\${gameState.playerGold} Gold\`;
      if (pWins) pWins.innerText = \`\${gameState.wins} Wins\`;

      const eBar = document.getElementById('enemy-hp-bar');
      const eText = document.getElementById('enemy-hp-text');
      const eGold = document.getElementById('enemy-gold-text');

      if (eBar) eBar.style.width = \`\${Math.max(0, (gameState.enemyHp / 10) * 100)}%\`;
      if (eText) eText.innerText = \`\${gameState.enemyHp}/10\`;
      if (eGold) eGold.innerText = \`\${gameState.enemyGold}\`;

      // Match Score (Wins and Losses)
      const matchScoreEl = document.getElementById('match-score-text');
      if (matchScoreEl) {
        matchScoreEl.innerText = \`\${gameState.wins}W - \${gameState.losses}L\`;
      }

      // Main Unit Pool Count (96)
      const poolCountEl = document.getElementById('main-pool-count');
      if (poolCountEl && gameState.mainUnitPool) {
        poolCountEl.innerText = \`\${gameState.mainUnitPool.length}/96\`;
      }

      // Fielded count badge (Max 8)
      const fieldedBadge = document.getElementById('player-fielded-count');
      if (fieldedBadge) {
        const count = countFieldedUnits(false);
        fieldedBadge.innerText = \`\${count}/8\`;
        fieldedBadge.style.color = count >= 8 ? '#f59e0b' : '#10b981';
      }

      // AI Tactical IQ percentage
      const aiIqEl = document.getElementById('ai-iq-text');
      if (aiIqEl) {
        aiIqEl.innerText = \`\${getAiAdvancedStrategyChance().toFixed(1)}%\`;
      }

      // Round & Phase
      const rText = document.getElementById('round-text');
      const phaseBadge = document.getElementById('phase-badge');
      if (rText) rText.innerText = \`ROUND \${gameState.round}\`;
      if (phaseBadge) {
        if (gameState.phase === 'combat') {
          phaseBadge.className = 'phase-badge phase-combat';
          phaseBadge.innerText = '⚔️ COMBAT IN PROGRESS';
        } else {
          phaseBadge.className = 'phase-badge phase-draft';
          phaseBadge.innerText = 'DRAFT & PREP';
        }
      }

      updateSynergyAnalyzer();
    }

    function showToast(msg) {
      const toast = document.getElementById('upgrade-toast');
      if (!toast) return;
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    window.toggleHelpModal = function() {
      const modal = document.getElementById('help-modal');
      if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
      }
    };

    function showGameOverModal() {
      const modal = document.getElementById('game-over-modal');
      const title = document.getElementById('game-over-title');
      const desc = document.getElementById('game-over-desc');
      const stats = document.getElementById('game-over-stats');
      if (!modal) return;

      const isWin = gameState.playerHp > 0;
      title.innerText = isWin ? '🏆 VICTORY CHAMPION! 🏆' : '💀 MATCH DEFEAT 💀';
      title.style.color = isWin ? '#fbbf24' : '#ef4444';
      desc.innerText = isWin
        ? \`You triumphed over the Rival AI Commander with \${gameState.wins} total victories!\`
        : \`The Rival AI broke your defenses on Round \${gameState.round}. Train your squad and strike again!\`;

      stats.innerHTML = \`
        <div>🏆 <strong>Total Victories:</strong> \${gameState.wins} Wins</div>
        <div>💀 <strong>Defeats:</strong> \${gameState.losses}</div>
        <div>🪙 <strong>Final Gold Accumulated:</strong> \${gameState.playerGold}</div>
        <div>⭐ <strong>Highest Star Units:</strong> ★\${Math.max(...gameState.playerUnits.map(u => u.starLevel), 1)}</div>
      \`;

      modal.style.display = 'flex';
    }

    window.resetGame = function() {
      window.location.reload();
    };

    // =========================================================================
    // GAME LOOP & ANIMATION
    // =========================================================================
    let lastTimestamp = performance.now();

    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;
      const time = now / 1000;

      updateCombatSimulation(dt, time);

      const allUnits = [...gameState.playerUnits, ...gameState.enemyUnits];
      allUnits.forEach(u => {
        if (u.isDead || !u.modelContainer) return;

        const idleSin = Math.sin(time * 3 + u.animState.idleOffset) * 0.08;
        u.modelContainer.position.y = idleSin;

        for (let i = 0; i < 3; i++) {
          const orb = u.modelContainer.getObjectByName(\`spellOrb_\${i}\`);
          if (orb) {
            const angle = time * 2.5 + (i / 3) * Math.PI * 2;
            orb.position.x = Math.cos(angle) * 0.75;
            orb.position.z = Math.sin(angle) * 0.75;
          }
        }

        if (u.animState.attackLunge > 0) {
          u.animState.attackLunge = Math.max(0, u.animState.attackLunge - dt * 4);
          u.modelContainer.position.z = Math.sin(u.animState.attackLunge * Math.PI) * 0.4 * (u.isEnemy ? -1 : 1);
        }
      });

      for (let i = gameState.visualEffects.length - 1; i >= 0; i--) {
        const p = gameState.visualEffects[i];
        p.age += dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.scale.setScalar(Math.max(0.01, 1 - p.age / p.lifetime));

        if (p.age >= p.lifetime) {
          scene.remove(p.mesh);
          gameState.visualEffects.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    function initGame() {
      // Create starting unit on player bench (Row 8, Col 3)
      const starterChar = CHARACTERS_DATABASE[0]; // Berserk Boar
      const starterUnit = create3DUnit(starterChar, 1, false, 8, 3);
      gameState.playerUnits.push(starterUnit);

      // Create starting enemy unit on enemy bench (Row 0, Col 4)
      const enemyStarter = CHARACTERS_DATABASE[1]; // Flora Fairy
      const enemyUnit = create3DUnit(enemyStarter, 1, true, 0, 4);
      gameState.enemyUnits.push(enemyUnit);

      generateDraftPool();
      updateHUD();
      requestAnimationFrame(animate);

      saveWinsToDatabase();
    }

    initGame();
  </script>
</body>
</html>
`;

const logicStartIdx = content.indexOf(logicStartMarker);
const logicEndIdx = content.lastIndexOf(logicEndMarker);

if (logicStartIdx !== -1 && logicEndIdx !== -1) {
  content = content.substring(0, logicStartIdx) + newLogicContent;
  fs.writeFileSync(targetHtmlPath, content, 'utf8');
  console.log('Successfully updated game logic and features!');
} else {
  console.error('Markers not found', { logicStartIdx, logicEndIdx });
}
