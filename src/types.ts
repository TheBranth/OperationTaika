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

export interface Level11State {
  targetWeight: number;
  p2Tartufo: number;
  p2Radice: number;
  p2Erba: number;
}

export interface Level12State {
  targetAngle: number;
  currentAngle: number;
  holdSeconds: number;
  lastHoldTick: number;
}

export interface Level13State {
  targetFreq: number;
  targetAmp: number;
  currentFreq: number;
  currentAmp: number;
}

export interface Level14State {
  stars: { x: number; y: number }[];
  targetSequence: number[];
  p2SelectedSequence: number[];
}

export interface Level15State {
  tubeAlpha: number;
  tubeBeta: number;
  tubeGamma: number;
  integrity: number;
}

export interface Level16Recipe {
  name: string;
  pink: number;
  blue: number;
  garnish: 'ciliegia' | 'lime' | 'menta';
  shakeTime: number;
}

export interface Level16State {
  activeRecipe: Level16Recipe;
  currentPink: number;
  currentBlue: number;
  currentGarnish: 'ciliegia' | 'lime' | 'menta' | null;
  shakeStartTime: number | null;
  shakeDuration: number;
  score: number; // Target $150
  timeLeft: number; // Target 180s
  feedbackMessage: string;
}

export interface Level17Order {
  id: number;
  itemName: 'Hamburger' | 'Insalata' | 'Patatine';
  details: string[];
  timer: number;
}

export interface Level17State {
  orders: Level17Order[];
  buns: number;
  meat: number;
  potatoes: number;
  lettuce: number;
  currentPlate: string[];
  grillActive: boolean;
  grillProgress: number;
  score: number; // Target 5 orders
  timeLeft: number;
}

export interface Level18Request {
  id: number;
  productName: string;
  slot: string;
  timer: number;
}

export interface Level18State {
  inventoryStock: { [key: string]: number };
  activeRequests: Level18Request[];
  returnsQueue: { productName: string; correctSlot: string }[];
  score: number; // Target 6 fulfilled
  timeLeft: number;
}

export interface GameState {
  status: 'lobby' | 'playing' | 'victory' | 'gameover';
  currentLevel: number;
  playlist: number[];
  playlistIndex: number;
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
