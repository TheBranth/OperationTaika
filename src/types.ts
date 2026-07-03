export type PlayerRole = 'operator' | 'pilot' | 'patron';

export type PlayMode = 'split-screen' | 'remote';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface DisruptionState {
  active: boolean;
  endTime: number;
}

export interface Disruptions {
  nebbiaArcana: DisruptionState;
  inversioneGravitazionale: DisruptionState;
  falsoAllarme: DisruptionState;
}

export interface Level1State {
  symbols: string[]; // 3 glyphs, e.g., ["Φ", "Ω", "Ψ"]
  p1Inputs: string[]; // 3 inputs, e.g., ["ZANNA", "", ""]
}

export interface Level2State {
  currentValue: number;
  targetValue: number;
  stepsRemaining: number;
  p1Op: string | null; // "*2" or "/2"
  p2Op: string | null; // "+15" or "-5"
  p1Ready: boolean;
  p2Ready: boolean;
}

export interface Level3State {
  anomalyCoord: string; // e.g. "C3"
  hits: number;
  lastChargeTick: number; // to sync gauge locally
}

export interface Level4State {
  targetElement: 'FUOCO' | 'TERRA' | 'OMBRA';
  activeAtmosphere: 'CALDO' | 'FREDDO' | 'VAPORE' | null;
  fedItem: 'Peperoncino Infernale' | 'Fango d\'Abisso' | 'Polvere di Stelle' | null;
  score: number;
  roundTimer: number; // remaining seconds
}

export interface Level5State {
  secretWord: string;
  sentPulses: ('breve' | 'lungo')[];
  p2Input: string;
}

export interface Level6State {
  avatarPos: { x: number; y: number }; // Grid coordinates 0-9
  maze: number[][]; // 10x10 maze grid (0 = path, 1 = wall)
  lasers: { axis: 'x' | 'y'; index: number; dir: number; pos: number }[]; // moving obstacle lines
}

export interface Level7State {
  stabilityValue: number; // -100 to +100
  greenTime: number; // continuous seconds in green zone (-15 to +15)
  driftVelocity: number; // current speed
}

export interface Level8State {
  sequence: string[]; // colored sequence, e.g., ["Rosso", "Verde", "Blu", "Giallo"]
  p2InputSequence: string[];
  round: number; // 1 to 3
  sequenceLength: number; // 4 to 6
}

export interface Level9State {
  activeDirective: string; // rule explanation
  ruleType: 'normal' | 'inverted'; // normal: magic=left tech=right; inverted: magic=right tech=left
  spawnedItems: { id: number; type: 'magico' | 'tecnologico'; name: string; y: number; x: number }[];
  score: number;
  missed: number;
}

export interface Level10State {
  phase: 1 | 2 | 3;
  bossHp: number;
  // Phase 1 structures
  p1Symbols: string[];
  p1Inputs: string[];
  // Phase 2 structures
  stabilityValue: number;
  p1CannonCharge: number; // 0 to 100
  p1IsCharging: boolean;
  // Phase 3 structures
  countdownActive: boolean;
  countdownStart: number;
  p1StrikeTime: number | null;
  p2StrikeTime: number | null;
}

export interface GameState {
  status: 'lobby' | 'playing' | 'victory' | 'gameover';
  currentLevel: number;
  playMode: PlayMode | null;
  hostPeerId: string | null;
  roles: {
    operator: string | null; // Peer ID
    pilot: string | null; // Peer ID
    patron: string | null; // Peer ID
  };
  disruptions: Disruptions;
  levelState: any;
  failures: number;
  lastUpdate: number;
  networkDelay: number; // Simulated lag (in ms)
}

export type GameAction =
  | { type: 'SET_ROLE'; role: PlayerRole | null; peerId: string | null }
  | { type: 'START_GAME'; mode: PlayMode }
  | { type: 'LEVEL_ACTION'; level: number; actionType: string; payload: any }
  | { type: 'TRIGGER_DISRUPTION'; spell: 'nebbia' | 'inversion' | 'alarm' }
  | { type: 'BYPASS_LEVEL'; level: number }
  | { type: 'FORCE_STATE'; status: 'lobby' | 'playing' | 'victory' | 'gameover' }
  | { type: 'HEARTBEAT'; state: GameState }
  | { type: 'DISCONNECT_PEER'; peerId: string }
  | { type: 'RESET_GAME' };
