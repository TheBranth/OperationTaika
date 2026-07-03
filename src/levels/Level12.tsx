import React from 'react';
import type { PlayerRole, Level12State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level12State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level12: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const target = levelState.targetAngle;
  const current = levelState.currentAngle;

  const diff = Math.min(Math.abs(current - target), 360 - Math.abs(current - target));
  const isAligned = diff <= 2;

  const handleRotate = (dir: number) => {
    playClick();
    let nextAngle = (current + dir * 15) % 360;
    if (nextAngle < 0) nextAngle += 360;
    onAction('ROTATE', { angle: nextAngle });
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* P1: Operator View (Target Angle & Alignment Timer) */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-magenta)' }}>⚙️ ANGOLO DI SBLOCCO</h2>
          
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--neon-magenta)', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', color: '#aaa' }}>ORIENTAMENTO DI CHIUSURA:</span>
            <div id="l12-target-angle" style={{ fontSize: '48px', fontWeight: 'bold', color: '#00ffcc', textShadow: '0 0 10px #00ffcc', margin: '10px 0' }}>
              {target}°
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>DISPOSITIVO DI AGGANCIO:</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '18px' }}>
              <div>ANGOLO ATTUALE: <span style={{ color: isAligned ? '#00ffcc' : '#ff0055', fontWeight: 'bold' }}>{current}°</span></div>
            </div>
          </div>

          {/* Alignment progress */}
          <div style={{ background: '#222', height: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #444', position: 'relative' }}>
            <div
              id="l12-alignment-progress"
              style={{
                width: `${Math.min(100, (levelState.holdSeconds / 3) * 100)}%`,
                height: '100%',
                background: isAligned ? 'linear-gradient(90deg, #00ffcc, #00bb88)' : '#666',
                transition: 'width 0.1s linear',
              }}
            />
            <span style={{ position: 'absolute', top: '2px', left: '0', right: '0', fontSize: '12px', fontWeight: 'bold', color: isAligned ? '#000' : '#fff' }}>
              {isAligned ? `ALLINEAMENTO IN CORSO: ${(3 - levelState.holdSeconds).toFixed(1)}s` : 'POSIZIONARE IL ROTORE'}
            </span>
          </div>
        </div>
      )}

      {/* P2: Pilot View (Interactive Rusted Wheel Controls) */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0, borderBottom: '1px solid var(--neon-cyan)', paddingBottom: '10px' }}>
            ⚙️ ROTORE ARRUGGINITO
          </h2>

          {/* Rusted Wheel Circle Visualization */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '25px 0' }}>
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '8px dashed #8b5a2b',
                background: 'radial-gradient(circle, #3a2211, #1a0f08)',
                position: 'relative',
                transform: `rotate(${current}deg)`,
                transition: 'transform 0.15s ease-out',
                boxShadow: '0 0 20px rgba(139, 90, 43, 0.3)',
              }}
            >
              {/* Rotor arrow pointer */}
              <div
                style={{
                  position: 'absolute',
                  top: '5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '6px',
                  height: '40px',
                  background: 'var(--neon-cyan)',
                  borderRadius: '3px',
                  boxShadow: '0 0 10px var(--neon-cyan)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#555',
                  border: '3px solid #777',
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '18px', color: '#ffb700', marginBottom: '20px', fontWeight: 'bold' }}>
            LETTURA FRENO MOTORIZZATO: {current}°
          </div>

          {/* Adjustment Buttons */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              id="l12-spin-left"
              className="action-btn glow-cyan"
              onClick={() => handleRotate(-1)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'rgba(0, 255, 204, 0.15)',
                border: '2px solid var(--neon-cyan)',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '6px',
              }}
            >
              ⬅️ RUOTA CCW (-15°)
            </button>
            <button
              id="l12-spin-right"
              className="action-btn glow-cyan"
              onClick={() => handleRotate(1)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'rgba(0, 255, 204, 0.15)',
                border: '2px solid var(--neon-cyan)',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '6px',
              }}
            >
              RUOTA CW (+15°) ➡️
            </button>
          </div>
        </div>
      )}

      {/* Patron View */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>VALVOLA GRIPPATA IN PRESSIONE...</h3>
          <p>Supervisiona il funzionamento del rotore.</p>
        </div>
      )}
    </div>
  );
};

export default Level12;
