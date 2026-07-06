import React, { useState, useEffect, useRef } from 'react';
import { connectionManager } from './connection';
import type { GameState, GameAction, PlayerRole, Level1State, Level2State, Level3State, Level4State, Level5State, Level6State, Level7State, Level8State, Level9State, Level10State, Level11State, Level12State, Level13State, Level14State, Level15State } from './types';
import { DevDrawer } from './DevDrawer';
import { DisruptionOverlay } from './DisruptionOverlay';
import { playClick, playSuccess, playFail } from './audio';

// Import Level components
import { Level1 } from './levels/Level1';
import { Level2 } from './levels/Level2';
import { Level3 } from './levels/Level3';
import { Level4 } from './levels/Level4';
import { Level5 } from './levels/Level5';
import { Level6 } from './levels/Level6';
import { Level7 } from './levels/Level7';
import { Level8 } from './levels/Level8';
import { Level9 } from './levels/Level9';
import { Level10 } from './levels/Level10';
import { Level11 } from './levels/Level11';
import { Level12 } from './levels/Level12';
import { Level13 } from './levels/Level13';
import { Level14 } from './levels/Level14';
import { Level15 } from './levels/Level15';

import './App.css';

// Initial states generator
const getInitialLevelState = (level: number): any => {
  switch (level) {
    case 1:
      const l1Glyphs = ['Φ', 'Ω', 'Ψ', 'λ', 'Ξ', 'θ', 'Σ', 'γ'];
      // Shuffle and pick 3
      const shuffledL1 = [...l1Glyphs].sort(() => Math.random() - 0.5);
      return {
        symbols: shuffledL1.slice(0, 3),
        p1Inputs: ['', '', ''],
      } as Level1State;

    case 2:
      return {
        currentValue: 56,
        targetValue: 100,
        stepsRemaining: 5,
        p1Op: null,
        p2Op: null,
        p1Ready: false,
        p2Ready: false,
      } as Level2State;

    case 3:
      const coords = ['A1', 'A3', 'B2', 'B5', 'C3', 'C4', 'D1', 'D5', 'E2', 'E4'];
      return {
        anomalyCoord: coords[Math.floor(Math.random() * coords.length)],
        hits: 0,
        lastChargeTick: Date.now(),
      } as Level3State;

    case 4:
      const elements: ('FUOCO' | 'TERRA' | 'OMBRA')[] = ['FUOCO', 'TERRA', 'OMBRA'];
      return {
        targetElement: elements[Math.floor(Math.random() * elements.length)],
        activeAtmosphere: null,
        fedItem: null,
        score: 0,
        roundTimer: 60,
      } as Level4State;

    case 5:
      const words = ['MAGIA', 'ZANNA', 'VOLO', 'PORCO'];
      return {
        secretWord: words[Math.floor(Math.random() * words.length)],
        sentPulses: [],
        p2Input: '',
      } as Level5State;

    case 6:
      const initialMaze = [
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 0, 1, 1, 1, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      ];
      return {
        avatarPos: { x: 0, y: 0 },
        maze: initialMaze,
        lasers: [
          { axis: 'x', index: 4, dir: 1, pos: 0 }, // Row 4 sweeping X
          { axis: 'y', index: 5, dir: 1, pos: 0 }, // Col 5 sweeping Y
        ],
      } as Level6State;

    case 7:
      return {
        stabilityValue: 0,
        greenTime: 0,
        driftVelocity: 1.0,
      } as Level7State;

    case 8:
      const colPool = ['Rosso', 'Blu', 'Verde', 'Giallo'];
      const r1Seq = Array.from({ length: 4 }).map(() => colPool[Math.floor(Math.random() * colPool.length)]);
      return {
        sequence: r1Seq,
        p2InputSequence: [],
        round: 1,
        sequenceLength: 4,
      } as Level8State;

    case 9:
      return {
        activeDirective: 'Magico a Sinistra, Tecnologico a Destra',
        ruleType: 'normal',
        spawnedItems: [],
        score: 0,
        missed: 0,
      } as Level9State;

    case 10:
      const l10GlyphsPool = ['Φ', 'Ω', 'Ψ', 'λ', 'Ξ', 'θ', 'Σ', 'γ'];
      const shuffledL10 = [...l10GlyphsPool].sort(() => Math.random() - 0.5);
      return {
        phase: 1,
        bossHp: 100,
        p1Symbols: shuffledL10.slice(0, 3),
        p1Inputs: ['', '', ''],
        stabilityValue: 0,
        p1CannonCharge: 0,
        p1IsCharging: false,
        countdownActive: false,
        countdownStart: 0,
        p1StrikeTime: null,
        p2StrikeTime: null,
      } as Level10State;

    case 11:
      const a = Math.floor(Math.random() * 4) + 1;
      const b = Math.floor(Math.random() * 4) + 1;
      const c = Math.floor(Math.random() * 4) + 1;
      return {
        targetWeight: a * 12 + b * 19 + c * 7,
        p2Tartufo: 0,
        p2Radice: 0,
        p2Erba: 0,
      } as Level11State;

    case 12:
      const angles = [45, 90, 120, 180, 225, 270, 315];
      return {
        targetAngle: angles[Math.floor(Math.random() * angles.length)],
        currentAngle: 0,
        holdSeconds: 0,
        lastHoldTick: Date.now(),
      } as Level12State;

    case 13:
      const freqs = [20, 35, 50, 65, 80, 95];
      const amps = [1.5, 2.5, 3.5, 4.5];
      return {
        targetFreq: freqs[Math.floor(Math.random() * freqs.length)],
        targetAmp: amps[Math.floor(Math.random() * amps.length)],
        currentFreq: 10,
        currentAmp: 1.0,
      } as Level13State;

    case 14:
      const starPool = [
        { x: 20, y: 30 },
        { x: 50, y: 15 },
        { x: 80, y: 30 },
        { x: 80, y: 70 },
        { x: 50, y: 85 },
        { x: 20, y: 70 },
      ];
      const targetSeq: number[] = [];
      while (targetSeq.length < 4) {
        const rIdx = Math.floor(Math.random() * starPool.length);
        if (!targetSeq.includes(rIdx)) {
          targetSeq.push(rIdx);
        }
      }
      return {
        stars: starPool,
        targetSequence: targetSeq,
        p2SelectedSequence: [],
      } as Level14State;

    case 15:
      return {
        tubeAlpha: 50,
        tubeBeta: 50,
        tubeGamma: 50,
        integrity: 100,
      } as Level15State;

    default:
      return {};
  }
};

interface LevelMetadata {
  id: number;
  componentName: string;
}

const ALL_STANDARD_LEVELS: LevelMetadata[] = [
  { id: 1, componentName: 'Level1' },
  { id: 2, componentName: 'Level2' },
  { id: 3, componentName: 'Level3' },
  { id: 4, componentName: 'Level4' },
  { id: 5, componentName: 'Level5' },
  { id: 6, componentName: 'Level6' },
  { id: 7, componentName: 'Level7' },
  { id: 8, componentName: 'Level8' },
  { id: 9, componentName: 'Level9' },
  { id: 11, componentName: 'Level11' },
  { id: 12, componentName: 'Level12' },
  { id: 13, componentName: 'Level13' },
  { id: 14, componentName: 'Level14' },
  { id: 15, componentName: 'Level15' }
];

const BOSS_LEVEL_ID = 10;

function generatePlaylist(): number[] {
  if ((window as any).isPuppeteerTest) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 10]; // Deterministic test sequence
  }
  const shuffled = [...ALL_STANDARD_LEVELS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedIds = shuffled.slice(0, 8).map(lvl => lvl.id);
  selectedIds.push(BOSS_LEVEL_ID);
  return selectedIds;
}

const advancePlaylist = (state: GameState) => {
  if (state.playlist && state.playlist.length > 0 && state.playlistIndex < state.playlist.length - 1) {
    state.playlistIndex += 1;
    const nextLvl = state.playlist[state.playlistIndex];
    state.currentLevel = nextLvl;
    state.levelState = getInitialLevelState(nextLvl);
  } else {
    state.status = 'victory';
  }
};

const defaultState: GameState = {
  status: 'lobby',
  currentLevel: 1,
  playlist: [],
  playlistIndex: 0,
  playMode: null,
  hostPeerId: null,
  roles: {
    operator: null,
    pilot: null,
    patron: null,
  },
  disruptions: {
    nebbiaArcana: { active: false, endTime: 0 },
    inversioneGravitazionale: { active: false, endTime: 0 },
    falsoAllarme: { active: false, endTime: 0 },
  },
  levelState: getInitialLevelState(1),
  failures: 0,
  lastUpdate: Date.now(),
  networkDelay: 0,
};

const L1_TRANSLATIONS: { [key: string]: string } = {
  'Φ': 'ZANNA',
  'Ω': 'TARTUFO',
  'Ψ': 'PROSCIUTTO',
  'λ': 'FANGOSITÀ',
  'Ξ': 'ALCHIMIA',
  'θ': 'CRUSCA',
  'Σ': 'FOCACCIA',
  'γ': 'CODA',
};

const DEBRIS_ITEMS = [
  { name: 'Tomo Magico', type: 'magico' },
  { name: 'Piuma di Fenice', type: 'magico' },
  { name: 'Essenza Arcana', type: 'magico' },
  { name: 'Elisir di Stella', type: 'magico' },
  { name: 'Chip Quantico', type: 'tecnologico' },
  { name: 'Reattore a Fusione', type: 'tecnologico' },
  { name: 'Scarto di Cablaggio', type: 'tecnologico' },
  { name: 'Circuito Rotto', type: 'tecnologico' },
];

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [localRole, setLocalRole] = useState<PlayerRole | null>(null);
  const [lobbyInputCode, setLobbyInputCode] = useState('');
  const [selectedLobbyRole, setSelectedLobbyRole] = useState<PlayerRole>('operator');
  const [roomCode, setRoomCode] = useState<string | null>(null);


  // Multi-tab tracking
  const [isLobbyCreator, setIsLobbyCreator] = useState(false);

  // Screen shake animation trigger
  const [isShaking, setIsShaking] = useState(false);

  // References for game loops
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const localRoleRef = useRef<PlayerRole | null>(localRole);
  localRoleRef.current = localRole;

  // React to screen shaking on mistakes
  const triggerScreenShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  // Expose gameState and connectionManager on window for headless automated testing
  useEffect(() => {
    (window as any).gameState = gameState;
    (window as any).connectionManager = connectionManager;
  }, [gameState]);

  // Sync callbacks inside connection manager
  useEffect(() => {
    connectionManager.setCallbacks(
      (syncedState) => {
        setGameState(syncedState);
      },
      (action) => {
        if (localRoleRef.current === 'operator' || connectionManager.playMode === 'split-screen') {
          // Authoritative Host handles action and updates state
          handleActionReceived(action);
        }
      }
    );

    return () => {
      connectionManager.disconnectAll();
    };
  }, []);

  // --- HOST STATE ENGINE & PHYSICS TICK LOOP ---
  useEffect(() => {
    let tickInterval: any = null;

    // Tick loop only runs on Host (Operator / P1)
    if (localRole === 'operator') {
      let l9NextSpawnTimer = 0;
      let l9DirectiveTimer = 0;
      let l3AnomalyTimer = 0;

      tickInterval = setInterval(() => {
        const state = { ...gameStateRef.current };
        if (state.status !== 'playing') return;

        let changed = false;

        // A. Handle spell disruption timers expiration
        const now = Date.now();
        const spells = ['nebbiaArcana', 'inversioneGravitazionale', 'falsoAllarme'] as const;
        spells.forEach((spell) => {
          if (state.disruptions[spell].active && now >= state.disruptions[spell].endTime) {
            state.disruptions[spell] = { active: false, endTime: 0 };
            changed = true;
          }
        });

        // B. Per-level physics / timed loops
        if (state.currentLevel === 3) {
          // Move anomaly randomly every 4 seconds
          l3AnomalyTimer += 100;
          if (l3AnomalyTimer >= 4000) {
            l3AnomalyTimer = 0;
            const coords = ['A1', 'A3', 'B2', 'B5', 'C3', 'C4', 'D1', 'D5', 'E2', 'E4'];
            state.levelState = {
              ...state.levelState,
              anomalyCoord: coords[Math.floor(Math.random() * coords.length)],
            } as Level3State;
            changed = true;
          }
        }

        if (state.currentLevel === 4) {
          // Decrement element round timer
          const lvlState = state.levelState as Level4State;
          if (lvlState.roundTimer > 0) {
            const nextTimer = Math.max(0, parseFloat((lvlState.roundTimer - 0.1).toFixed(1)));
            state.levelState = {
              ...lvlState,
              roundTimer: nextTimer,
            };
            changed = true;

            // Timer ran out!
            if (nextTimer <= 0) {
              playFail();
              triggerScreenShake();
              const elements: ('FUOCO' | 'TERRA' | 'OMBRA')[] = ['FUOCO', 'TERRA', 'OMBRA'];
              state.levelState = {
                targetElement: elements[Math.floor(Math.random() * elements.length)],
                activeAtmosphere: null,
                fedItem: null,
                score: 0,
                roundTimer: 60,
              } as Level4State;
            }
          }
        }

        if (state.currentLevel === 6) {
          // Move lasers along axes and check collision
          const lvlState = state.levelState as Level6State;
          const updatedLasers = lvlState.lasers.map((l) => {
            let nextPos = l.pos + l.dir * 0.4;
            let nextDir = l.dir;
            if (nextPos >= 9.2) {
              nextPos = 9.2;
              nextDir = -1;
            } else if (nextPos <= 0) {
              nextPos = 0;
              nextDir = 1;
            }
            return { ...l, pos: nextPos, dir: nextDir };
          });

          // Check collisions
          const { x, y } = lvlState.avatarPos;
          let hitLaser = false;
          updatedLasers.forEach((laser) => {
            if (laser.axis === 'x') {
              if (laser.index === y && Math.abs(x - laser.pos) < 0.6) {
                hitLaser = true;
              }
            } else {
              if (laser.index === x && Math.abs(y - laser.pos) < 0.6) {
                hitLaser = true;
              }
            }
          });

          if (hitLaser) {
            playFail();
            triggerScreenShake();
            state.levelState = {
              ...lvlState,
              avatarPos: { x: 0, y: 0 },
              lasers: updatedLasers,
            };
          } else {
            state.levelState = {
              ...lvlState,
              lasers: updatedLasers,
            };
          }
          changed = true;
        }

        if (state.currentLevel === 7) {
          // Gravity Well physics: apply random drift, tick stable green time
          const lvlState = state.levelState as Level7State;
          let driftDir = Math.random() < 0.5 ? -1 : 1;
          // 4% chance to keep previous direction to create sweeping drifts
          const randomDrift = driftDir * lvlState.driftVelocity;
          let nextVal = Math.min(100, Math.max(-100, lvlState.stabilityValue + randomDrift));
          let nextVel = lvlState.driftVelocity + 0.003; // accelerate drift

          let nextGreen = lvlState.greenTime;
          const isStable = nextVal >= -15 && nextVal <= 15;

          if (isStable) {
            nextGreen += 0.1;
          } else {
            nextGreen = 0;
          }

          // Advance level if held stable for 20s
          if (nextGreen >= 20.0) {
            playSuccess();
            advancePlaylist(state);
          } else if (nextVal === -100 || nextVal === 100) {
            // Crash! Reset
            playFail();
            triggerScreenShake();
            state.levelState = {
              stabilityValue: 0,
              greenTime: 0,
              driftVelocity: 1.0,
            } as Level7State;
          } else {
            state.levelState = {
              stabilityValue: Math.round(nextVal),
              greenTime: parseFloat(nextGreen.toFixed(1)),
              driftVelocity: nextVel,
            };
          }
          changed = true;
        }

        if (state.currentLevel === 9) {
          // Sort items ticks (falling down)
          const lvlState = state.levelState as Level9State;
          l9NextSpawnTimer += 100;
          l9DirectiveTimer += 100;

          // Spawn new item if under capacity or spawn timer complete
          let items = [...lvlState.spawnedItems];
          if (items.length < 2 || l9NextSpawnTimer >= 3000) {
            l9NextSpawnTimer = 0;
            const randItem = DEBRIS_ITEMS[Math.floor(Math.random() * DEBRIS_ITEMS.length)];
            items.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              type: randItem.type as any,
              name: randItem.name,
              y: 0,
              x: 20 + Math.random() * 60, // random x axis layout
            });
          }

          // Move down
          let itemMissed = false;
          items = items.map((item) => {
            const nextY = item.y + 3; // fall speed
            if (nextY >= 100) {
              itemMissed = true;
            }
            return { ...item, y: nextY };
          });

          let nextMissed = lvlState.missed;
          let nextScore = lvlState.score;

          if (itemMissed) {
            playFail();
            triggerScreenShake();
            nextMissed += 1;
            items = items.filter((item) => item.y < 100);
            if (nextMissed > 3) {
              // Reset level
              nextMissed = 0;
              nextScore = 0;
              items = [];
            }
          }

          // Dynamic rule change every 6 seconds
          let directive = lvlState.activeDirective;
          let rule = lvlState.ruleType;
          if (l9DirectiveTimer >= 6000) {
            l9DirectiveTimer = 0;
            rule = rule === 'normal' ? 'inverted' : 'normal';
            directive = rule === 'normal'
              ? 'Magico a Sinistra, Tecnologico a Destra'
              : 'Inverti Tutto! (Tecnologico a Sinistra, Magico a Destra)';
          }

          state.levelState = {
            activeDirective: directive,
            ruleType: rule,
            spawnedItems: items,
            score: nextScore,
            missed: nextMissed,
          };
          changed = true;
        }

        if (state.currentLevel === 10) {
          const lvlState = state.levelState as Level10State;

          // Phase 2: Gravity Well drift + Charging Cannon logic
          if (lvlState.phase === 2) {
            let driftDir = Math.random() < 0.5 ? -1 : 1;
            let nextVal = Math.min(100, Math.max(-100, lvlState.stabilityValue + driftDir * 1.5));

            let nextCharge = lvlState.p1CannonCharge;
            const isStable = nextVal >= -10 && nextVal <= 10;

            if (isStable && lvlState.p1IsCharging) {
              nextCharge += 1.5; // Charge speed
            } else {
              nextCharge = Math.max(0, nextCharge - 0.5); // Decay charge
            }

            if (nextCharge >= 100) {
              playSuccess();
              state.levelState = {
                ...lvlState,
                phase: 3,
                bossHp: 33,
                p1CannonCharge: 100,
                countdownActive: true,
                countdownStart: Date.now(),
              } as Level10State;
            } else if (nextVal === -100 || nextVal === 100) {
              // Reactor Exploded! Reset Phase 2
              playFail();
              triggerScreenShake();
              state.levelState = {
                ...lvlState,
                stabilityValue: 0,
                p1CannonCharge: 0,
                p1IsCharging: false,
              } as Level10State;
            } else {
              state.levelState = {
                ...lvlState,
                stabilityValue: Math.round(nextVal),
                p1CannonCharge: Math.min(100, parseFloat(nextCharge.toFixed(1))),
              };
            }
            changed = true;
          }

          // Phase 3: Synchronized Strike Countdown timer check
          if (lvlState.phase === 3 && lvlState.countdownActive) {
            const elapsed = Date.now() - lvlState.countdownStart;
            if (elapsed >= 1500) {
              // Countdown ran out! Reset strike attempts
              playFail();
              triggerScreenShake();
              state.levelState = {
                ...lvlState,
                p1StrikeTime: null,
                p2StrikeTime: null,
                countdownStart: Date.now(),
              };
              changed = true;
            }
          }
        }

        if (state.currentLevel === 12) {
          const lvlState = state.levelState as Level12State;
          const diff = Math.min(Math.abs(lvlState.currentAngle - lvlState.targetAngle), 360 - Math.abs(lvlState.currentAngle - lvlState.targetAngle));
          const isAligned = diff <= 2;
          let nextHold = lvlState.holdSeconds;
          
          if (isAligned) {
            nextHold += 0.1;
          } else {
            nextHold = 0;
          }

          if (nextHold >= 3.0) {
            playSuccess();
            advancePlaylist(state);
            changed = true;
          } else if (nextHold !== lvlState.holdSeconds) {
            state.levelState = { ...lvlState, holdSeconds: nextHold };
            changed = true;
          }
        }

        if (state.currentLevel === 15) {
          const lvlState = state.levelState as Level15State;
          let ta = Math.min(100, lvlState.tubeAlpha + 1.0);
          let tb = Math.min(100, lvlState.tubeBeta + 1.0);
          let tg = Math.min(100, lvlState.tubeGamma + 1.0);
          
          let nextIntegrity = lvlState.integrity;
          if (ta >= 100 || tb >= 100 || tg >= 100) {
            nextIntegrity = Math.max(0, nextIntegrity - 2.0);
          }

          if (nextIntegrity <= 0) {
            playFail();
            triggerScreenShake();
            state.failures += 1;
            state.levelState = getInitialLevelState(15);
            changed = true;
          } else {
            state.levelState = {
              ...lvlState,
              tubeAlpha: ta,
              tubeBeta: tb,
              tubeGamma: tg,
              integrity: nextIntegrity,
            };
            changed = true;
          }
        }

        if (changed) {
          state.lastUpdate = Date.now();
          setGameState(state);
          connectionManager.broadcastState(state);
        }
      }, 100);
    }

    return () => {
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [localRole]);

  // --- HOST ACTION PARSING ---
  const handleActionReceived = (action: GameAction) => {
    const state = { ...gameStateRef.current };
    let changed = false;

    switch (action.type) {
      case 'SET_ROLE':
        if (action.role) {
          state.roles[action.role] = action.peerId;
          changed = true;
        }
        break;

      case 'START_GAME': {
        const pl = generatePlaylist();
        state.status = 'playing';
        state.playlist = pl;
        state.playlistIndex = 0;
        state.currentLevel = pl[0];
        state.levelState = getInitialLevelState(pl[0]);
        changed = true;
        break;
      }

      case 'BYPASS_LEVEL': {
        state.status = 'playing';
        state.currentLevel = action.level;
        state.levelState = getInitialLevelState(action.level);
        const idx = state.playlist.indexOf(action.level);
        if (idx !== -1) {
          state.playlistIndex = idx;
        } else {
          state.playlist = [...state.playlist];
          state.playlist.push(action.level);
          state.playlistIndex = state.playlist.length - 1;
        }
        changed = true;
        break;
      }

      case 'FORCE_STATE':
        state.status = action.status;
        if (action.status === 'playing') {
          state.currentLevel = 1;
          state.levelState = getInitialLevelState(1);
        } else if (action.status === 'lobby') {
          // Reset
          state.roles = { operator: null, pilot: null, patron: null };
          state.disruptions = {
            nebbiaArcana: { active: false, endTime: 0 },
            inversioneGravitazionale: { active: false, endTime: 0 },
            falsoAllarme: { active: false, endTime: 0 },
          };
        }
        changed = true;
        break;

      case 'TRIGGER_DISRUPTION':
        const now = Date.now();
        if (action.spell === 'nebbia') {
          state.disruptions.nebbiaArcana = { active: true, endTime: now + 7000 };
        } else if (action.spell === 'inversion') {
          state.disruptions.inversioneGravitazionale = { active: true, endTime: now + 5000 };
        } else if (action.spell === 'alarm') {
          state.disruptions.falsoAllarme = { active: true, endTime: now + 5000 };
        }
        changed = true;
        break;

      case 'RESET_GAME':
        state.status = 'lobby';
        state.currentLevel = 1;
        state.roles = { operator: null, pilot: null, patron: null };
        state.levelState = getInitialLevelState(1);
        changed = true;
        break;

      case 'DISCONNECT_PEER':
        // Clean slot
        if (state.roles.pilot === action.peerId) state.roles.pilot = null;
        if (state.roles.patron === action.peerId) state.roles.patron = null;
        changed = true;
        break;

      case 'LEVEL_ACTION':
        if (action.level !== state.currentLevel) return;

        // Level-specific logic handling
        // -----------------------------
        if (state.currentLevel === 1) {
          const lState = state.levelState as Level1State;
          if (action.actionType === 'UPDATE_INPUT') {
            const inputs = [...lState.p1Inputs];
            inputs[action.payload.index] = action.payload.val;
            state.levelState = { ...lState, p1Inputs: inputs };
            changed = true;
          } else if (action.actionType === 'SUBMIT') {
            const targetWords = lState.symbols.map(s => L1_TRANSLATIONS[s]);
            const isCorrect = lState.p1Inputs.every((val, idx) => val === targetWords[idx]);
            if (isCorrect) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, p1Inputs: ['', '', ''] };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 2) {
          const lState = state.levelState as Level2State;
          if (action.actionType === 'SELECT_OP') {
            if (action.payload.op.startsWith('*') || action.payload.op.startsWith('/')) {
              state.levelState = { ...lState, p1Op: action.payload.op };
            } else {
              state.levelState = { ...lState, p2Op: action.payload.op };
            }
            changed = true;
          } else if (action.actionType === 'TOGGLE_READY') {
            const roleKey = (action.payload.role || localRoleRef.current) === 'operator' ? 'p1Ready' : 'p2Ready';
            const nextLState = { ...lState, [roleKey]: !lState[roleKey] };

            if (nextLState.p1Ready && nextLState.p2Ready && nextLState.p1Op && nextLState.p2Op) {
              let val = nextLState.currentValue;
              if (nextLState.p1Op === '*2') val *= 2;
              else if (nextLState.p1Op === '/2') val = Math.floor(val / 2);

              if (nextLState.p2Op === '+15') val += 15;
              else if (nextLState.p2Op === '-5') val -= 5;

              const nextSteps = nextLState.stepsRemaining - 1;

              if (val === nextLState.targetValue) {
                playSuccess();
                advancePlaylist(state);
              } else if (nextSteps <= 0) {
                playFail();
                triggerScreenShake();
                state.failures += 1;
                state.levelState = getInitialLevelState(2);
              } else {
                playClick();
                state.levelState = {
                  ...nextLState,
                  currentValue: val,
                  stepsRemaining: nextSteps,
                  p1Op: null,
                  p2Op: null,
                  p1Ready: false,
                  p2Ready: false,
                };
              }
            } else {
              state.levelState = nextLState;
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 3) {
          const lState = state.levelState as Level3State;
          if (action.actionType === 'FIRE') {
            const { coord, charge } = action.payload;
            if (coord === lState.anomalyCoord && charge >= 90) {
              playSuccess();
              const nextHits = lState.hits + 1;
              if (nextHits >= 3) {
                advancePlaylist(state);
              } else {
                const coords = ['A1', 'A3', 'B2', 'B5', 'C3', 'C4', 'D1', 'D5', 'E2', 'E4'];
                state.levelState = {
                  ...lState,
                  hits: nextHits,
                  anomalyCoord: coords[Math.floor(Math.random() * coords.length)],
                };
              }
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 4) {
          const lState = state.levelState as Level4State;
          if (action.actionType === 'SET_ATMOSPHERE') {
            state.levelState = { ...lState, activeAtmosphere: action.payload.atmosphere };
            changed = true;
          } else if (action.actionType === 'FEED') {
            const atmo = lState.activeAtmosphere;
            const item = action.payload.item;
            const target = lState.targetElement;

            let matches = false;
            if (target === 'FUOCO' && atmo === 'CALDO' && item === 'Peperoncino Infernale') matches = true;
            if (target === 'TERRA' && atmo === 'FREDDO' && item === "Fango d'Abisso") matches = true;
            if (target === 'OMBRA' && atmo === 'VAPORE' && item === 'Polvere di Stelle') matches = true;

            if (matches) {
              playSuccess();
              const nextScore = lState.score + 1;
              if (nextScore >= 4) {
                advancePlaylist(state);
              } else {
                const elements: ('FUOCO' | 'TERRA' | 'OMBRA')[] = ['FUOCO', 'TERRA', 'OMBRA'];
                state.levelState = {
                  ...lState,
                  score: nextScore,
                  targetElement: elements[Math.floor(Math.random() * elements.length)],
                  activeAtmosphere: null,
                  fedItem: null,
                };
              }
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = {
                ...lState,
                activeAtmosphere: null,
                fedItem: null,
              };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 5) {
          const lState = state.levelState as Level5State;
          if (action.actionType === 'SEND_PULSE') {
            const nextPulses = [...lState.sentPulses, action.payload.type];
            state.levelState = { ...lState, sentPulses: nextPulses };
            changed = true;
          } else if (action.actionType === 'CLEAR_PULSES') {
            state.levelState = { ...lState, sentPulses: [] };
            changed = true;
          } else if (action.actionType === 'SUBMIT_WORD') {
            if (action.payload.word === lState.secretWord) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, sentPulses: [] };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 6) {
          const lState = state.levelState as Level6State;
          if (action.actionType === 'MOVE') {
            const { axis, dir } = action.payload;
            const { x, y } = lState.avatarPos;
            
            if (axis === 'x') {
              const nextX = x + dir;
              if (nextX >= 0 && nextX <= 9 && lState.maze[y][nextX] === 0) {
                state.levelState = {
                  ...lState,
                  avatarPos: { x: nextX, y },
                };
                changed = true;
              }
            } else if (axis === 'y') {
              const nextY = y + dir;
              if (nextY >= 0 && nextY <= 9 && lState.maze[nextY][x] === 0) {
                state.levelState = {
                  ...lState,
                  avatarPos: { x, y: nextY },
                };
                changed = true;
              }
            }

            // Check Win Condition at 9,9
            const checkState = state.levelState as Level6State;
            if (checkState.avatarPos.x === 9 && checkState.avatarPos.y === 9) {
              playSuccess();
              advancePlaylist(state);
            }
          }
        }

        else if (state.currentLevel === 7) {
          const lState = state.levelState as Level7State;
          if (action.actionType === 'PUSH') {
            const pushVal = action.payload.dir * 15;
            state.levelState = {
              ...lState,
              stabilityValue: Math.min(100, Math.max(-100, lState.stabilityValue + pushVal)),
            };
            changed = true;
          }
        }

        else if (state.currentLevel === 8) {
          const lState = state.levelState as Level8State;
          if (action.actionType === 'INPUT_COLOR') {
            const newSeq = [...lState.p2InputSequence, action.payload.color];
            const isMatch = newSeq.every((color, idx) => color === lState.sequence[idx]);

            if (isMatch) {
              if (newSeq.length === lState.sequence.length) {
                playSuccess();
                const nextRound = lState.round + 1;
                if (nextRound > 3) {
                  advancePlaylist(state);
                } else {
                  const colPool = ['Rosso', 'Blu', 'Verde', 'Giallo'];
                  const nextSeqLen = 3 + nextRound;
                  const nextSeq = Array.from({ length: nextSeqLen }).map(() => colPool[Math.floor(Math.random() * colPool.length)]);
                  state.levelState = {
                    sequence: nextSeq,
                    p2InputSequence: [],
                    round: nextRound,
                    sequenceLength: nextSeqLen,
                  } as Level8State;
                }
              } else {
                state.levelState = { ...lState, p2InputSequence: newSeq };
              }
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, p2InputSequence: [] };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 9) {
          const lState = state.levelState as Level9State;
          if (action.actionType === 'SORT') {
            if (lState.spawnedItems.length === 0) return;
            
            // Find item closest to bottom (max y)
            const targetItem = lState.spawnedItems.reduce((max, item) => item.y > max.y ? item : max, lState.spawnedItems[0]);
            
            // Check sorting rule compliance
            const dir = action.payload.direction;
            let correct = false;

            if (dir === 'left') {
              if (lState.ruleType === 'normal' && targetItem.type === 'magico') correct = true;
              if (lState.ruleType === 'inverted' && targetItem.type === 'tecnologico') correct = true;
            } else {
              if (lState.ruleType === 'normal' && targetItem.type === 'tecnologico') correct = true;
              if (lState.ruleType === 'inverted' && targetItem.type === 'magico') correct = true;
            }

            let nextScore = lState.score;
            let nextMissed = lState.missed;
            let nextItems = lState.spawnedItems.filter(item => item.id !== targetItem.id);

            if (correct) {
              playSuccess();
              nextScore += 1;
            } else {
              playFail();
              triggerScreenShake();
              nextMissed += 1;
            }

            if (nextScore >= 20) {
              playSuccess();
              advancePlaylist(state);
            } else if (nextMissed > 3) {
              // Level Failed
              playFail();
              triggerScreenShake();
              nextScore = 0;
              nextMissed = 0;
              nextItems = [];
            }

            state.levelState = {
              ...lState,
              score: nextScore,
              missed: nextMissed,
              spawnedItems: nextItems,
            };
            changed = true;
          }
        }

        else if (state.currentLevel === 10) {
          const lState = state.levelState as Level10State;
          
          // Phase 1 Code cracking
          if (lState.phase === 1) {
            if (action.actionType === 'P1_INPUT_CHANGE') {
              const inputs = [...lState.p1Inputs];
              inputs[action.payload.index] = action.payload.val;
              state.levelState = { ...lState, p1Inputs: inputs };
              changed = true;
            } else if (action.actionType === 'P1_SUBMIT') {
              const target = lState.p1Symbols.map(s => L1_TRANSLATIONS[s]);
              const matches = lState.p1Inputs.every((v, i) => v === target[i]);
              if (matches) {
                playSuccess();
                state.levelState = {
                  ...lState,
                  phase: 2,
                  bossHp: 66,
                  stabilityValue: 0,
                  p1CannonCharge: 0,
                  p1IsCharging: false,
                } as Level10State;
              } else {
                playFail();
                triggerScreenShake();
                state.failures += 1;
                state.levelState = { ...lState, p1Inputs: ['', '', ''] };
              }
              changed = true;
            }
          }

          // Phase 2 Cannon Charge
          else if (lState.phase === 2) {
            if (action.actionType === 'SET_CHARGING') {
              state.levelState = { ...lState, p1IsCharging: action.payload.isCharging };
              changed = true;
            } else if (action.actionType === 'PUSH_REACTOR') {
              const push = action.payload.dir * 15;
              state.levelState = {
                ...lState,
                stabilityValue: Math.min(100, Math.max(-100, lState.stabilityValue + push)),
              };
              changed = true;
            }
          }

          // Phase 3 Final Synchronized Strike
          else if (lState.phase === 3) {
            if (action.actionType === 'STRIKE') {
              const pl = action.payload.player;
              let nextP1 = lState.p1StrikeTime;
              let nextP2 = lState.p2StrikeTime;

              if (pl === 'operator') nextP1 = Date.now();
              if (pl === 'pilot') nextP2 = Date.now();

              // Evaluate if both pressed
              if (nextP1 && nextP2) {
                const diff = Math.abs(nextP1 - nextP2);
                if (diff <= 100) {
                  playSuccess();
                  state.status = 'victory';
                  state.levelState = {
                    ...lState,
                    bossHp: 0,
                    p1StrikeTime: nextP1,
                    p2StrikeTime: nextP2,
                    countdownActive: false,
                  };
                } else {
                  // Failed synchronization
                  playFail();
                  triggerScreenShake();
                  state.failures += 1;
                  state.levelState = {
                    ...lState,
                    p1StrikeTime: null,
                    p2StrikeTime: null,
                    countdownStart: Date.now(), // Reset 1.5s countdown timer
                  };
                }
              } else {
                state.levelState = {
                  ...lState,
                  p1StrikeTime: nextP1,
                  p2StrikeTime: nextP2,
                };
              }
              changed = true;
            }
          }
        }

        else if (state.currentLevel === 11) {
          const lState = state.levelState as Level11State;
          if (action.actionType === 'ADJUST_INGREDIENT') {
            const { ingredient, amount } = action.payload;
            if (ingredient === 'tartufo') {
              state.levelState = { ...lState, p2Tartufo: Math.min(10, Math.max(0, lState.p2Tartufo + amount)) };
            } else if (ingredient === 'radice') {
              state.levelState = { ...lState, p2Radice: Math.min(10, Math.max(0, lState.p2Radice + amount)) };
            } else if (ingredient === 'erba') {
              state.levelState = { ...lState, p2Erba: Math.min(10, Math.max(0, lState.p2Erba + amount)) };
            }
            changed = true;
          } else if (action.actionType === 'SUBMIT') {
            const total = lState.p2Tartufo * 12 + lState.p2Radice * 19 + lState.p2Erba * 7;
            if (total === lState.targetWeight) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, p2Tartufo: 0, p2Radice: 0, p2Erba: 0 };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 12) {
          const lState = state.levelState as Level12State;
          if (action.actionType === 'ROTATE') {
            state.levelState = { ...lState, currentAngle: action.payload.angle, holdSeconds: 0 };
            changed = true;
          }
        }

        else if (state.currentLevel === 13) {
          const lState = state.levelState as Level13State;
          if (action.actionType === 'TUNE') {
            state.levelState = { ...lState, currentFreq: action.payload.freq, currentAmp: action.payload.amp };
            changed = true;
          } else if (action.actionType === 'SUBMIT') {
            const isMatch = Math.abs(lState.currentFreq - lState.targetFreq) <= 3 && Math.abs(lState.currentAmp - lState.targetAmp) <= 0.2;
            if (isMatch) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 14) {
          const lState = state.levelState as Level14State;
          if (action.actionType === 'CONNECT_STAR') {
            const nextSeq = [...lState.p2SelectedSequence, action.payload.index];
            state.levelState = { ...lState, p2SelectedSequence: nextSeq };
            changed = true;
          } else if (action.actionType === 'RESET_STARS') {
            state.levelState = { ...lState, p2SelectedSequence: [] };
            changed = true;
          } else if (action.actionType === 'SUBMIT') {
            const isCorrect = lState.targetSequence.length === lState.p2SelectedSequence.length &&
              lState.targetSequence.every((val, idx) => val === lState.p2SelectedSequence[idx]);
            if (isCorrect) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, p2SelectedSequence: [] };
            }
            changed = true;
          }
        }

        else if (state.currentLevel === 15) {
          const lState = state.levelState as Level15State;
          if (action.actionType === 'BLEED_VALVE') {
            const v = action.payload.valve;
            let { tubeAlpha: ta, tubeBeta: tb, tubeGamma: tg } = lState;
            if (v === 'alpha') {
              ta = Math.max(0, ta - 30);
              tb = Math.min(100, tb + 15);
              tg = Math.min(100, tg + 15);
            } else if (v === 'beta') {
              ta = Math.min(100, ta + 15);
              tb = Math.max(0, tb - 30);
              tg = Math.min(100, tg + 15);
            } else if (v === 'gamma') {
              ta = Math.min(100, ta + 15);
              tb = Math.min(100, tb + 15);
              tg = Math.max(0, tg - 30);
            }
            state.levelState = { ...lState, tubeAlpha: ta, tubeBeta: tb, tubeGamma: tg };
            changed = true;
          } else if (action.actionType === 'PURGE') {
            const canPurge = lState.tubeAlpha < 20 && lState.tubeBeta < 20 && lState.tubeGamma < 20;
            if (canPurge) {
              playSuccess();
              advancePlaylist(state);
            } else {
              playFail();
              triggerScreenShake();
              state.failures += 1;
              state.levelState = { ...lState, integrity: Math.max(0, lState.integrity - 25) };
            }
            changed = true;
          }
        }

        break;
    }

    if (changed) {
      state.lastUpdate = Date.now();
      setGameState(state);
      connectionManager.broadcastState(state);
    }
  };

  // --- ACTIONS FORWARDERS ---
  const sendLobbyAction = (action: GameAction) => {
    if (localRole === 'operator' || connectionManager.playMode === 'split-screen') {
      handleActionReceived(action);
    } else {
      connectionManager.sendAction(action);
    }
  };

  const handleLevelAction = (actionType: string, payload: any) => {
    const finalPayload = { ...payload, role: localRole, peerId: connectionManager.myPeerId };
    sendLobbyAction({
      type: 'LEVEL_ACTION',
      level: gameState.currentLevel,
      actionType,
      payload: finalPayload,
    });
  };

  const triggerPatronSpell = (spell: 'nebbia' | 'inversion' | 'alarm') => {
    playClick();
    sendLobbyAction({ type: 'TRIGGER_DISRUPTION', spell });
  };

  const handleBypassLevel = (level: number) => {
    sendLobbyAction({ type: 'BYPASS_LEVEL', level });
  };

  const handleForceState = (status: 'victory' | 'gameover' | 'lobby' | 'playing') => {
    sendLobbyAction({ type: 'FORCE_STATE', status });
  };

  // --- LOBBY PROCEDURES ---
  const handleCreateLobby = async () => {
    console.log('[App UI] handleCreateLobby clicked!');
    playClick();
    setIsLobbyCreator(true);
    setLocalRole('operator');
    const code = await connectionManager.initializeHost();
    setRoomCode(code);
  };

  const handleJoinLobby = async () => {
    playClick();
    if (!lobbyInputCode) return;
    try {
      await connectionManager.initializeClient(lobbyInputCode, selectedLobbyRole);
      setLocalRole(selectedLobbyRole);
      setRoomCode(lobbyInputCode);
    } catch (err) {
      console.error('[Lobby] Join failed:', err);
      alert('Impossibile connettersi alla stanza. Verifica il Room Code o riprova più tardi.');
    }
  };

  const handleStartGame = () => {
    playClick();
    sendLobbyAction({ type: 'START_GAME', mode: 'remote' });
  };

  const handleStartLocalCoop = () => {
    playClick();
    connectionManager.initializeLocal('operator');
    setLocalRole('operator');
    setIsLobbyCreator(true);

    const initLobbyState = { ...defaultState };
    initLobbyState.playMode = 'split-screen';
    initLobbyState.status = 'playing';
    initLobbyState.levelState = getInitialLevelState(1);
    setGameState(initLobbyState);
  };

  const handleResetToLobby = () => {
    playClick();
    connectionManager.disconnectAll();
    setLocalRole(null);
    setIsLobbyCreator(false);
    setRoomCode(null);
    setGameState(defaultState);
  };

  // Renders the specific level view based on active level index
  const renderActiveLevel = (roleToRender: PlayerRole | null) => {
    const lvl = gameState.currentLevel;
    const props = {
      role: roleToRender,
      levelState: gameState.levelState,
      onAction: handleLevelAction,
      disruptions: gameState.disruptions,
    };

    switch (lvl) {
      case 1: return <Level1 {...props} />;
      case 2: return <Level2 {...props} />;
      case 3: return <Level3 {...props} />;
      case 4: return <Level4 {...props} />;
      case 5: return <Level5 {...props} />;
      case 6: return <Level6 {...props} />;
      case 7: return <Level7 {...props} />;
      case 8: return <Level8 {...props} />;
      case 9: return <Level9 {...props} />;
      case 10: return <Level10 {...props} />;
      case 11: return <Level11 {...props} />;
      case 12: return <Level12 {...props} />;
      case 13: return <Level13 {...props} />;
      case 14: return <Level14 {...props} />;
      case 15: return <Level15 {...props} />;
      default: return <div>Livello sconosciuto</div>;
    }
  };

  const isPlaying = gameState.status === 'playing';
  const isSplitScreen = gameState.playMode === 'split-screen';

  return (
    <div className={`app-container ${isShaking ? 'screen-shake' : ''}`}>
      <div className="crt-overlay" />

      {/* --- 1. LOBBY / ROLE CHOOOSER --- */}
      {gameState.status === 'lobby' && (
        <div className="lobby-container glass-card" style={{ marginTop: '10vh' }}>
          <h1 className="lobby-title">🚀 OPERATION TAIKA</h1>
          
          <div style={{ display: 'flex', gap: '30px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'none', flex: 1, minWidth: '280px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
              <h3 style={{ color: 'var(--neon-cyan)', marginTop: 0 }}>LOCAL TEST SETUP</h3>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
                Simula i comandi di tutti i giocatori in una visuale split-screen locale. Ottimo per testare le meccaniche velocemente su un unico schermo.
              </p>
              <button
                id="btn-local-coop"
                className="btn-primary glow-magenta"
                onClick={handleStartLocalCoop}
                style={{ width: '100%', marginTop: '15px' }}
              >
                PROVA IN LOCAL SPLIT-SCREEN
              </button>
            </div>

            {/* Remote WebRTC Mode */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ color: '#ffb700', marginTop: 0 }}>REMOTE LOBBY SETUP</h3>
              
              {/* Creator controls */}
              {!localRole && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button
                    id="btn-create-lobby"
                    className="btn-secondary"
                    onClick={handleCreateLobby}
                  >
                    CREA NUOVA LOBBY (HOST)
                  </button>

                  <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#aaa' }}>RUOLO DEL CLIENT:</label>
                    <select
                      id="lobby-role-select"
                      value={selectedLobbyRole}
                      onChange={(e) => setSelectedLobbyRole(e.target.value as PlayerRole)}
                      style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', border: '1px solid #555', marginBottom: '10px' }}
                    >
                      <option value="pilot">Pilot (Giocatore 2)</option>
                      <option value="patron">Patron (Giocatore 3 / Disruptor)</option>
                    </select>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="lobby-code-input"
                        type="text"
                        value={lobbyInputCode}
                        onChange={(e) => setLobbyInputCode(e.target.value)}
                        placeholder="INSERISCI ROOM CODE..."
                        style={{ flex: 1, padding: '8px', background: '#111', border: '1px solid #555', color: '#fff' }}
                      />
                      <button
                        id="btn-join-lobby"
                        onClick={handleJoinLobby}
                        style={{ padding: '8px 16px', background: '#ffb700', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        JOIN
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Host connection status */}
              {localRole && (
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#00ffcc' }}>ROOM CODE:</h4>
                  <div
                    id="room-code-display"
                    style={{ fontSize: '24px', letterSpacing: '2px', color: '#fff', background: '#000', padding: '10px', borderRadius: '4px', border: '1px dashed #00ffcc', margin: '10px 0' }}
                  >
                    {roomCode || 'GENERIC LOBBY CODE...'}
                  </div>
                  {isLobbyCreator ? (
                    <>
                      <p style={{ fontSize: '12px', color: '#aaa' }}>
                        Fornisci questo codice al partner. Una volta connesso, potrai dare il via al gioco!
                      </p>
                      <div style={{ margin: '20px 0', border: '1px solid #222', padding: '10px', borderRadius: '4px', textAlign: 'left', fontSize: '12px' }}>
                        <div>P1 Operator (Host): <span style={{ color: '#00ff00' }}>CONNECTED</span></div>
                        <div>P2 Pilot: <span style={{ color: gameState.roles.pilot ? '#00ff00' : '#ff3300' }}>{gameState.roles.pilot ? 'CONNESSO' : 'IN ATTESA...'}</span></div>
                        <div>P3 Patron: <span style={{ color: gameState.roles.patron ? '#00ff00' : '#ff3300' }}>{gameState.roles.patron ? 'CONNESSO' : 'NON DISPONIBILE'}</span></div>
                      </div>
                      <button
                        id="btn-start-game"
                        className="btn-primary glow-magenta"
                        onClick={handleStartGame}
                        style={{ width: '100%' }}
                      >
                        AVVIA PARTITA!
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '14px', color: '#00ffcc', fontWeight: 'bold', margin: '20px 0' }}>
                        CONNESSO! In attesa che l'Host avvii la partita...
                      </p>
                      <div style={{ margin: '20px 0', border: '1px solid #222', padding: '10px', borderRadius: '4px', textAlign: 'left', fontSize: '12px' }}>
                        <div>P1 Operator (Host): <span style={{ color: '#00ff00' }}>CONNECTED</span></div>
                        <div>P2 Pilot: <span style={{ color: gameState.roles.pilot ? '#00ff00' : '#ff3300' }}>{gameState.roles.pilot ? 'CONNESSO' : 'IN ATTESA...'}</span></div>
                        <div>P3 Patron: <span style={{ color: gameState.roles.patron ? '#00ff00' : '#ff3300' }}>{gameState.roles.patron ? 'CONNESSO' : 'NON DISPONIBILE'}</span></div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 2. ACTIVE GAME --- */}
      {isPlaying && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Top general status bar */}
          <div style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontFamily: 'monospace' }}>
            <div style={{ color: '#00ffcc', fontWeight: 'bold' }}>LIVELLO CORRENTE: {gameState.currentLevel} / 10</div>
            <div style={{ color: '#ff3333' }}>ANOMALIE DI COMUNICAZIONE (FAILURES): {gameState.failures}</div>
            <button
              onClick={handleResetToLobby}
              style={{ background: 'transparent', border: '1px solid #ff3333', color: '#ff3333', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ESCI ALLA LOBBY
            </button>
          </div>

          {/* SPLIT SCREEN VIEW */}
          {isSplitScreen ? (
            <div className="game-split-screen">
              {/* Operator Panel (P1) */}
              <div className="viewport-panel" id="viewport-operator">
                <div className="viewport-header operator-header">PLAYER 1 - OPERATOR</div>
                <div className="viewport-content">
                  <DisruptionOverlay role="operator" disruptions={gameState.disruptions} />
                  {renderActiveLevel('operator')}
                </div>
              </div>

              {/* Pilot Panel (P2) */}
              <div className="viewport-panel" id="viewport-pilot">
                <div className="viewport-header pilot-header">PLAYER 2 - PILOT</div>
                <div className="viewport-content">
                  <DisruptionOverlay role="pilot" disruptions={gameState.disruptions} />
                  {renderActiveLevel('pilot')}
                </div>
              </div>

              {/* Patron Panel (P3) */}
              <div className="viewport-panel" id="viewport-patron" style={{ flex: '0 0 250px' }}>
                <div className="viewport-header patron-header">PLAYER 3 - PATRON</div>
                <div className="viewport-content" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <DisruptionOverlay role="patron" disruptions={gameState.disruptions} />
                  <h4 style={{ margin: '0 0 5px 0', color: '#ffb700', textAlign: 'center' }}>DISRUPT DASHBOARD</h4>
                  <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: 0 }}>Utilizza i pulsanti per disturbare i due giocatori in tempo reale!</p>
                  
                  <button
                    id="btn-spell-nebbia"
                    className="btn-secondary"
                    onClick={() => triggerPatronSpell('nebbia')}
                    style={{ borderColor: '#b700ff', color: '#b700ff' }}
                  >
                    🌫️ NEBBIA ARCANA (7s)
                  </button>
                  <button
                    id="btn-spell-inversione"
                    className="btn-secondary"
                    onClick={() => triggerPatronSpell('inversion')}
                    style={{ borderColor: '#ff6600', color: '#ff6600' }}
                  >
                    🔄 INVERTI COMANDI (5s)
                  </button>
                  <button
                    id="btn-spell-alarm"
                    className="btn-secondary"
                    onClick={() => triggerPatronSpell('alarm')}
                    style={{ borderColor: '#ff3333', color: '#ff3333' }}
                  >
                    🚨 FALSO ALLARME (5s)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // SINGLE ROLE NETWORKED VIEW
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div className={`viewport-header ${localRole}-header`}>
                RUOLO: {localRole?.toUpperCase()}
              </div>
              <div className="viewport-content" style={{ flex: 1 }}>
                <DisruptionOverlay role={localRole} disruptions={gameState.disruptions} />
                
                {/* Render active level view */}
                {renderActiveLevel(localRole)}

                {/* Render spell dashboard if role is Patron */}
                {localRole === 'patron' && (
                  <div className="glass-card" style={{ maxWidth: '400px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ color: '#ffb700', marginTop: 0, textAlign: 'center' }}>ATTACCHI TATTICI</h3>
                    <button
                      id="btn-spell-nebbia"
                      className="btn-primary"
                      onClick={() => triggerPatronSpell('nebbia')}
                      style={{ background: '#b700ff' }}
                    >
                      Nebbia Arcana (Cooldown: 40s)
                    </button>
                    <button
                      id="btn-spell-inversione"
                      className="btn-primary"
                      onClick={() => triggerPatronSpell('inversion')}
                      style={{ background: '#ff6600' }}
                    >
                      Inversione Gravitazionale (Cooldown: 60s)
                    </button>
                    <button
                      id="btn-spell-alarm"
                      className="btn-primary"
                      onClick={() => triggerPatronSpell('alarm')}
                      style={{ background: '#ff3333' }}
                    >
                      Falso Allarme (Cooldown: 30s)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- 3. VICTORY SCREEN --- */}
      {gameState.status === 'victory' && (
        <div className="lobby-container glass-card" style={{ marginTop: '15vh', textAlign: 'center', borderColor: '#00ffcc', boxShadow: '0 0 40px rgba(0,255,204,0.4)', animation: 'pulse-light 1.5s infinite alternate' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>👑</div>
          <h1 id="victory-header" style={{ color: '#00ffcc', fontSize: '32px', letterSpacing: '2px', textShadow: '0 0 15px rgba(0,255,204,0.5)' }}>
            OPERAZIONE TAIKA COMPLETATA!
          </h1>
          <p style={{ fontSize: '18px', color: '#fff', marginBottom: '35px' }}>
            Il porco è finalmente libero! Ottima coordinazione spaziale!
          </p>
          <div style={{ display: 'inline-block', border: '1px solid #ffb700', background: 'rgba(0,0,0,0.3)', padding: '10px 25px', borderRadius: '4px', fontSize: '13px', color: '#ffb700', marginBottom: '30px' }}>
            Anomalie totali riscontrate: {gameState.failures}
          </div>
          <br />
          <button id="btn-victory-reset" className="btn-primary" onClick={handleResetToLobby}>
            RITORNA ALLA LOBBY
          </button>
        </div>
      )}

      {/* --- 4. GAME OVER SCREEN --- */}
      {gameState.status === 'gameover' && (
        <div className="lobby-container glass-card" style={{ marginTop: '15vh', textAlign: 'center', borderColor: '#ff0055', boxShadow: '0 0 40px rgba(255,0,85,0.4)' }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>💥</div>
          <h1 style={{ color: '#ff0055', fontSize: '32px', letterSpacing: '2px' }}>MISSIONE FALLITA!</h1>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '35px' }}>
            L'integrità del sistema è collassata sotto i sovraccarichi energetici.
          </p>
          <button id="btn-gameover-reset" className="btn-primary" onClick={handleForceState.bind(null, 'playing')}>
            RIPROVA DALL'INIZIO
          </button>
          <button className="btn-secondary" onClick={handleResetToLobby} style={{ marginLeft: '15px' }}>
            RITORNA ALLA LOBBY
          </button>
        </div>
      )}

      {/* --- 5. DEV DRAWERS (Active in Development) --- */}
      <DevDrawer
        gameState={gameState}
        onBypassLevel={handleBypassLevel}
        onForceState={handleForceState}
      />
    </div>
  );
};

export default App;
