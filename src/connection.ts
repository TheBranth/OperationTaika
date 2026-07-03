import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { GameState, GameAction, PlayerRole, PlayMode, ConnectionStatus } from './types';

class ConnectionManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  public playMode: PlayMode | null = null;
  public status: ConnectionStatus = 'disconnected';
  public myPeerId: string | null = null;
  public roomCode: string | null = null;
  public role: PlayerRole | null = null;

  private onStateUpdateCb: ((state: GameState) => void) | null = null;
  private onActionReceivedCb: ((action: GameAction) => void) | null = null;

  private simulatedLag: number = 0; // ms

  constructor() {
    // Initialize a broadcast channel for local multi-tab sync
    this.broadcastChannel = new BroadcastChannel('operation-taika-local-channel');
    this.broadcastChannel.onmessage = (event) => {
      this.handleIncomingData(event.data);
    };
  }

  public setCallbacks(
    onStateUpdate: (state: GameState) => void,
    onActionReceived: (action: GameAction) => void
  ) {
    this.onStateUpdateCb = onStateUpdate;
    this.onActionReceivedCb = onActionReceived;
  }

  public setSimulatedLag(lagMs: number) {
    this.simulatedLag = lagMs;
    console.log(`[Network] Simulated lag set to ${lagMs}ms`);
  }

  public getSimulatedLag(): number {
    return this.simulatedLag;
  }

  // Delay helper
  private delay(fn: () => void) {
    if (this.simulatedLag > 0) {
      setTimeout(fn, this.simulatedLag);
    } else {
      fn();
    }
  }

  // --- HOST INITIALIZATION ---
  public async initializeHost(): Promise<string> {
    this.playMode = 'remote';
    this.role = 'operator'; // Host is P1 (Operator)
    this.status = 'connecting';
    this.updateStatus();

    return new Promise((resolve, reject) => {
      const PeerConstructor = (window as any).Peer || Peer;
      // Connect to the public PeerJS server
      this.peer = new PeerConstructor({
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      this.peer!.on('open', (id) => {
        this.myPeerId = id;
        this.roomCode = id;
        this.status = 'connected';
        this.updateStatus();
        console.log(`[Host] Started lobby. Room Code: ${id}`);
        resolve(id);
      });

      this.peer!.on('connection', (conn) => {
        console.log(`[Host] Incoming client connection: ${conn.peer}`);
        this.setupConnection(conn);
      });

      this.peer!.on('error', (err) => {
        console.error('[Host] PeerJS Error:', err);
        this.status = 'disconnected';
        this.updateStatus();
        reject(err);
      });

      this.peer!.on('disconnected', () => {
        console.warn('[Host] Disconnected from signaling server. Attempting reconnect...');
        this.peer?.reconnect();
      });
    });
  }

  // --- CLIENT INITIALIZATION ---
  public initializeClient(roomCode: string, role: PlayerRole): Promise<void> {
    this.playMode = 'remote';
    this.role = role;
    this.roomCode = roomCode;
    this.status = 'connecting';
    this.updateStatus();

    return new Promise((resolve, reject) => {
      const PeerConstructor = (window as any).Peer || Peer;
      this.peer = new PeerConstructor({
        host: '0.peerjs.com',
        secure: true,
        port: 443,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      });

      this.peer!.on('open', (id) => {
        this.myPeerId = id;
        console.log(`[Client] Connected to PeerJS. My ID: ${id}. Connecting to room: ${roomCode}`);
        
        const conn = this.peer!.connect(roomCode, {
          metadata: { role, peerId: id }
        });
        
        this.setupConnection(conn);
        
        // Timeout if connection takes too long
        const timeout = setTimeout(() => {
          if (this.status !== 'connected') {
            this.status = 'disconnected';
            this.updateStatus();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        conn.on('open', () => {
          clearTimeout(timeout);
          this.status = 'connected';
          this.updateStatus();
          // Notify Host of our role selection
          this.sendAction({ type: 'SET_ROLE', role: this.role, peerId: this.myPeerId });
          resolve();
        });
      });

      this.peer!.on('error', (err) => {
        console.error('[Client] PeerJS Error:', err);
        this.status = 'disconnected';
        this.updateStatus();
        reject(err);
      });
    });
  }

  // --- LOCAL MULTI-TAB / SPLIT-SCREEN SETUP ---
  public initializeLocal(role: PlayerRole) {
    this.playMode = 'split-screen';
    this.role = role;
    this.status = 'connected';
    this.myPeerId = 'local-' + role;
    this.roomCode = 'local-lobby';
    this.updateStatus();
    console.log(`[Local] Initialized role: ${role}`);
  }

  // --- CONNECT/DISCONNECT SIMULATORS ---
  public terminateConnection() {
    console.warn('[Network] Simulating sudden connection drop...');
    this.status = 'reconnecting';
    this.updateStatus();

    // Close connections without destroying peer
    this.connections.forEach(conn => conn.close());
    this.connections.clear();

    // Simulate reconnection after 4 seconds
    setTimeout(() => {
      if (this.status === 'reconnecting') {
        console.log('[Network] Reconnecting sync started...');
        this.reestablishConnection();
      }
    }, 4000);
  }

  private reestablishConnection() {
    if (this.playMode === 'remote' && this.peer && this.roomCode) {
      if (this.role === 'operator') {
        // Host just waits for clients to reconnect
        this.status = 'connected';
        this.updateStatus();
        console.log('[Host] Reconnected and listening for clients...');
      } else {
        // Clients re-connect to Host
        console.log(`[Client] Re-connecting to Host: ${this.roomCode}`);
        const conn = this.peer.connect(this.roomCode, {
          metadata: { role: this.role, peerId: this.myPeerId }
        });
        this.setupConnection(conn);
        conn.on('open', () => {
          this.status = 'connected';
          this.updateStatus();
          this.sendAction({ type: 'SET_ROLE', role: this.role, peerId: this.myPeerId });
          console.log('[Client] Reconnection sync complete!');
        });
      }
    } else if (this.playMode === 'split-screen') {
      this.status = 'connected';
      this.updateStatus();
    }
  }

  // --- DATA SENDING & BROADCASTING ---
  public sendAction(action: GameAction) {
    const payload = { type: 'ACTION', data: action, timestamp: Date.now() };

    this.delay(() => {
      // 1. Local Broadcast Sync
      if (this.playMode === 'split-screen') {
        this.broadcastChannel?.postMessage(payload);
        // Also trigger locally if we are the Host role or acting on it
        if (this.role === 'operator' && this.onActionReceivedCb) {
          this.onActionReceivedCb(action);
        } else if (this.onActionReceivedCb) {
          this.onActionReceivedCb(action);
        }
        return;
      }

      // 2. Remote PeerJS Sync
      if (this.role === 'operator') {
        // Host processes action directly
        if (this.onActionReceivedCb) {
          this.onActionReceivedCb(action);
        }
      } else {
        // Client sends action to Host
        const hostConn = this.connections.get(this.roomCode || '');
        if (hostConn && hostConn.open) {
          hostConn.send(payload);
        } else {
          console.warn('[Client] Host connection is closed, holding action.');
        }
      }
    });
  }

  public broadcastState(state: GameState) {
    const payload = { type: 'STATE', data: state, timestamp: Date.now() };

    this.delay(() => {
      // 1. Local Broadcast Sync
      if (this.playMode === 'split-screen') {
        this.broadcastChannel?.postMessage(payload);
        if (this.onStateUpdateCb) {
          this.onStateUpdateCb(state);
        }
        return;
      }

      // 2. Remote PeerJS Sync (Only Host broadcasts state)
      if (this.role === 'operator') {
        this.connections.forEach((conn) => {
          if (conn.open) {
            conn.send(payload);
          }
        });
        if (this.onStateUpdateCb) {
          this.onStateUpdateCb(state);
        }
      }
    });
  }

  // --- INTERNAL SETUP & DATA PARSING ---
  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log(`[Network] Peer connection opened: ${conn.peer}`);
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(data);
    });

    conn.on('close', () => {
      console.log(`[Network] Peer connection closed: ${conn.peer}`);
      this.connections.delete(conn.peer);
      // Trigger reconnect state if we lose host
      if (this.role !== 'operator' && conn.peer === this.roomCode) {
        this.status = 'reconnecting';
        this.updateStatus();
        this.reestablishConnection();
      }
    });

    conn.on('error', (err) => {
      console.error(`[Network] Connection error on ${conn.peer}:`, err);
    });
  }

  private handleIncomingData(payload: any) {
    if (!payload || !payload.type) return;

    if (payload.type === 'ACTION') {
      const action = payload.data as GameAction;
      if (this.onActionReceivedCb) {
        this.onActionReceivedCb(action);
      }
    } else if (payload.type === 'STATE') {
      const state = payload.data as GameState;
      if (this.onStateUpdateCb) {
        this.onStateUpdateCb(state);
      }
    }
  }

  private updateStatus() {
    // Custom state changes event if needed
  }

  public disconnectAll() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.status = 'disconnected';
    console.log('[Network] Cleanly disconnected all WebRTC services.');
  }
}

export const connectionManager = new ConnectionManager();
export default connectionManager;
