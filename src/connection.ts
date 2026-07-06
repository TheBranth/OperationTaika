import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { GameState, GameAction, PlayerRole, PlayMode, ConnectionStatus } from './types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:openrelay.metered.ca:80' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

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
  private _localResolve: (() => void) | null = null;

  constructor() {
    // Initialize a broadcast channel for local multi-tab sync
    this.broadcastChannel = new BroadcastChannel('operation-taika-local-channel');
    this.broadcastChannel.onmessage = (event) => {
      const payload = event.data;
      if (!payload || !payload.roomCode || payload.roomCode !== this.roomCode) return;
      if (payload.senderPeerId === this.myPeerId) return;

      // Handle local loopback handshake
      if (payload.type === 'LOCAL_CONNECT') {
        if (this.role === 'operator') {
          console.log('[Host] Local BroadcastChannel connect request received:', payload.senderPeerId);
          this.connections.set(payload.senderPeerId, {
            open: true,
            isMock: true,
            close: () => {},
            send: () => {}
          } as any);

          // Reply with ACK
          this.broadcastChannel?.postMessage({
            type: 'LOCAL_CONNECT_ACK',
            roomCode: this.roomCode,
            senderPeerId: this.myPeerId,
            role: this.role
          });

          // Trigger host SET_ROLE state update
          if (this.onActionReceivedCb) {
            this.onActionReceivedCb({ type: 'SET_ROLE', role: payload.role, peerId: payload.senderPeerId });
          }
        }
      } else if (payload.type === 'LOCAL_CONNECT_ACK') {
        if (this.role !== 'operator' && this.status !== 'connected') {
          console.log('[Client] Local BroadcastChannel connect ACK received:', payload.senderPeerId);
          this.status = 'connected';
          this.updateStatus();
          this.connections.set(this.roomCode || '', {
            open: true,
            isMock: true,
            close: () => {},
            send: () => {}
          } as any);

          if (this._localResolve) {
            this._localResolve();
          }
        }
      } else {
        this.handleIncomingData(payload);
      }
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

    return new Promise((resolve) => {
      let resolved = false;
      const localFallbackId = 'LOCAL-' + Math.floor(1000 + Math.random() * 9000);

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.myPeerId = localFallbackId;
          this.roomCode = localFallbackId;
          this.status = 'connected';
          this.updateStatus();
          console.log(`[Host] PeerJS signaling timed out. Resolving with local fallback code: ${localFallbackId}`);
          resolve(localFallbackId);
        }
      }, 2500);

      const PeerConstructor = (window as any).Peer || Peer;
      try {
        this.peer = new PeerConstructor({
          config: {
            iceServers: ICE_SERVERS
          }
        });

        this.peer!.on('open', (id) => {
          clearTimeout(timeout);
          if (!resolved) {
            resolved = true;
            this.myPeerId = id;
            this.roomCode = id;
            this.status = 'connected';
            this.updateStatus();
            console.log(`[Host] Started lobby. Room Code: ${id}`);
            resolve(id);
          }
        });

        this.peer!.on('connection', (conn) => {
          console.log(`[Host] Incoming client connection: ${conn.peer}`);
          this.setupConnection(conn);
        });

        this.peer!.on('error', (err) => {
          console.error('[Host] PeerJS Error:', err);
          if (!resolved) {
            clearTimeout(timeout);
            resolved = true;
            this.myPeerId = localFallbackId;
            this.roomCode = localFallbackId;
            this.status = 'connected';
            this.updateStatus();
            resolve(localFallbackId);
          }
        });

        this.peer!.on('disconnected', () => {
          console.warn('[Host] Disconnected from signaling server.');
        });
      } catch (e) {
        console.error('[Host] PeerJS instantiation failed:', e);
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          this.myPeerId = localFallbackId;
          this.roomCode = localFallbackId;
          this.status = 'connected';
          this.updateStatus();
          resolve(localFallbackId);
        }
      }
    });
  }

  // --- CLIENT INITIALIZATION ---
  public initializeClient(roomCode: string, role: PlayerRole): Promise<void> {
    this.playMode = 'remote';
    this.role = role;
    this.roomCode = roomCode;
    this.status = 'connecting';
    this.updateStatus();

    this.myPeerId = this.myPeerId || 'local-client-' + Math.floor(Math.random() * 100000);

    return new Promise((resolve, reject) => {
      // Set local resolve hook for BroadcastChannel fallback
      this._localResolve = () => {
        clearTimeout(timeout);
        clearInterval(pingInterval);
        this.sendAction({ type: 'SET_ROLE', role: this.role, peerId: this.myPeerId });
        resolve();
      };

      // Broadcast local connection request
      this.broadcastChannel?.postMessage({
        type: 'LOCAL_CONNECT',
        roomCode,
        role,
        senderPeerId: this.myPeerId
      });

      // Periodically ping in case host is still initializing
      const pingInterval = setInterval(() => {
        if (this.status === 'connected') {
          clearInterval(pingInterval);
          return;
        }
        this.broadcastChannel?.postMessage({
          type: 'LOCAL_CONNECT',
          roomCode,
          role,
          senderPeerId: this.myPeerId
        });
      }, 500);

      const PeerConstructor = (window as any).Peer || Peer;
      try {
        this.peer = new PeerConstructor({
          config: {
            iceServers: ICE_SERVERS
          }
        });

        this.peer!.on('open', (id) => {
          this.myPeerId = id;
          console.log(`[Client] Connected to PeerJS. My ID: ${id}. Connecting to room: ${roomCode}`);
          
          const conn = this.peer!.connect(roomCode, {
            metadata: { role, peerId: id }
          });
          
          this.setupConnection(conn);
          
          conn.on('open', () => {
            clearInterval(pingInterval);
            clearTimeout(timeout);
            if (this.status !== 'connected') {
              this.status = 'connected';
              this.updateStatus();
              this.sendAction({ type: 'SET_ROLE', role: this.role, peerId: this.myPeerId });
              resolve();
            }
          });
        });
      } catch (e) {
        console.error('[Client] PeerJS instantiation failed:', e);
      }

      // Timeout if connection takes too long
      const timeout = setTimeout(() => {
        clearInterval(pingInterval);
        if (this.status !== 'connected') {
          this.status = 'disconnected';
          this.updateStatus();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
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

    this.connections.forEach(conn => conn.close());
    this.connections.clear();

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
        this.status = 'connected';
        this.updateStatus();
        console.log('[Host] Reconnected and listening for clients...');
      } else {
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
    const payload = { type: 'ACTION', data: action, timestamp: Date.now(), roomCode: this.roomCode, senderPeerId: this.myPeerId };

    this.delay(() => {
      this.broadcastChannel?.postMessage(payload);

      if (this.playMode === 'split-screen') {
        if (this.onActionReceivedCb) {
          this.onActionReceivedCb(action);
        }
        return;
      }

      if (this.role === 'operator') {
        if (this.onActionReceivedCb) {
          this.onActionReceivedCb(action);
        }
      } else {
        const hostConn = this.connections.get(this.roomCode || '');
        if (hostConn && hostConn.open && !(hostConn as any).isMock) {
          hostConn.send(payload);
        }
      }
    });
  }

  public broadcastState(state: GameState) {
    const payload = { type: 'STATE', data: state, timestamp: Date.now(), roomCode: this.roomCode, senderPeerId: this.myPeerId };

    this.delay(() => {
      this.broadcastChannel?.postMessage(payload);

      if (this.playMode === 'split-screen') {
        if (this.onStateUpdateCb) {
          this.onStateUpdateCb(state);
        }
        return;
      }

      if (this.role === 'operator') {
        this.connections.forEach((conn) => {
          if (conn.open && !(conn as any).isMock) {
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
      
      // Dispatch disconnect action to Host state loop
      if (this.role === 'operator' && this.onActionReceivedCb) {
        this.onActionReceivedCb({ type: 'DISCONNECT_PEER', peerId: conn.peer });
      }

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
