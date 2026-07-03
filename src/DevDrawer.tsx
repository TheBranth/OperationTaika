import React, { useState, useEffect } from 'react';
import { connectionManager } from './connection';
import type { GameState } from './types';

interface DevDrawerProps {
  gameState: GameState;
  onBypassLevel: (lvl: number) => void;
  onForceState: (status: 'victory' | 'gameover' | 'lobby') => void;
}

export const DevDrawer: React.FC<DevDrawerProps> = ({
  gameState,
  onBypassLevel,
  onForceState,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lag, setLag] = useState(0);

  // Toggle drawer using backslash key on Italian layout keyboards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\') {
        setIsVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Poll for Gamepad events to listen for L3 + R3 (1.5 seconds)
  useEffect(() => {
    let animFrameId: number;
    let holdTime = 0;
    let wasTriggered = false;
    let lastTime = 0;

    const checkGamepad = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let bothPressed = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp) {
          const l3 = gp.buttons[10]; // Left stick click
          const r3 = gp.buttons[11]; // Right stick click
          if (l3?.pressed && r3?.pressed) {
            bothPressed = true;
            break;
          }
        }
      }

      if (bothPressed) {
        if (!wasTriggered) {
          holdTime += dt;
          if (holdTime >= 1500) {
            setIsVisible((prev) => !prev);
            wasTriggered = true;
          }
        }
      } else {
        holdTime = 0;
        wasTriggered = false;
      }

      animFrameId = requestAnimationFrame(checkGamepad);
    };

    animFrameId = requestAnimationFrame(checkGamepad);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleLagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLag(val);
    connectionManager.setSimulatedLag(val);
  };

  const triggerDisconnect = () => {
    connectionManager.terminateConnection();
  };

  if (!isVisible) {
    return (
      <button
        id="dev-drawer-indicator"
        className="dev-drawer-indicator"
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(255, 0, 0, 0.2)',
          border: '1px solid rgba(255, 0, 0, 0.5)',
          color: '#ff4444',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          cursor: 'pointer',
          zIndex: 9999,
          fontFamily: 'monospace',
        }}
      >
        [DEV] PRESS \ or L3+R3 TO OPEN DRAWER
      </button>
    );
  }

  return (
    <div
      id="dev-drawer"
      className="dev-drawer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'rgba(15, 10, 25, 0.95)',
        borderTop: '3px solid #ff0055',
        color: '#00ffcc',
        padding: '15px 20px',
        boxSizing: 'border-box',
        fontFamily: 'monospace',
        zIndex: 9998,
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#ff0055', letterSpacing: '2px' }}>🛠️ OPERATION TAIKA DEV DRAWER</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            cursor: 'pointer',
            padding: '2px 8px',
          }}
        >
          HIDE [X]
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        {/* Level Selector */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ffb700' }}>LEVEL BYPASS:</label>
          <select
            id="dev-level-bypass"
            value={gameState.currentLevel}
            onChange={(e) => onBypassLevel(parseInt(e.target.value, 10))}
            style={{
              background: '#221133',
              color: '#00ffcc',
              border: '1px solid #00ffcc',
              padding: '5px',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            {Array.from({ length: 10 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Level {idx + 1}
              </option>
            ))}
          </select>
        </div>

        {/* State Overrides */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ffb700' }}>STATE FORCE:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id="dev-force-win"
              onClick={() => onForceState('victory')}
              style={{
                background: '#006622',
                color: '#fff',
                border: '1px solid #00ff00',
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              FORCE WIN
            </button>
            <button
              id="dev-force-lose"
              onClick={() => onForceState('gameover')}
              style={{
                background: '#660011',
                color: '#fff',
                border: '1px solid #ff0000',
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              FORCE LOSE
            </button>
            <button
              id="dev-force-lobby"
              onClick={() => onForceState('lobby')}
              style={{
                background: '#331144',
                color: '#fff',
                border: '1px solid #b700ff',
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              RESET LOBBY
            </button>
          </div>
        </div>

        {/* Network Delay Slider */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ffb700' }}>
            SIMULATED JITTER/LAG: <span style={{ color: '#00ffcc' }}>{lag}ms</span>
          </label>
          <input
            id="dev-lag-slider"
            type="range"
            min="0"
            max="1000"
            step="50"
            value={lag}
            onChange={handleLagChange}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Network Disconnector */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ffb700' }}>CONNECTION TEST:</label>
          <button
            id="dev-disconnect-btn"
            onClick={triggerDisconnect}
            style={{
              background: '#884400',
              color: '#fff',
              border: '1px solid #ffaa00',
              padding: '5px 12px',
              cursor: 'pointer',
            }}
          >
            DROP P2P CONNECTION
          </button>
        </div>
      </div>

      {/* Network Status Info */}
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(0, 255, 204, 0.2)', paddingTop: '10px', fontSize: '11px', display: 'flex', gap: '20px', color: '#888' }}>
        <div>ROLE: <span style={{ color: '#fff' }}>{connectionManager.role?.toUpperCase() || 'NONE'}</span></div>
        <div>PLAY MODE: <span style={{ color: '#fff' }}>{connectionManager.playMode?.toUpperCase() || 'NONE'}</span></div>
        <div>STATUS: <span style={{ color: connectionManager.status === 'connected' ? '#00ff00' : '#ff3300' }}>{connectionManager.status.toUpperCase()}</span></div>
        <div>MY PEER ID: <span style={{ color: '#fff' }}>{connectionManager.myPeerId || 'N/A'}</span></div>
        <div>ROOM CODE: <span style={{ color: '#fff' }}>{connectionManager.roomCode || 'N/A'}</span></div>
        <div>ACTIVE P1: <span style={{ color: '#fff' }}>{gameState.roles.operator || 'NONE'}</span> | P2: <span style={{ color: '#fff' }}>{gameState.roles.pilot || 'NONE'}</span> | P3: <span style={{ color: '#fff' }}>{gameState.roles.patron || 'NONE'}</span></div>
      </div>
    </div>
  );
};

export default DevDrawer;
