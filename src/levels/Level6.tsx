import React, { useEffect } from 'react';
import type { PlayerRole, Level6State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level6State;
  onAction: (actionType: string, payload: any) => void;
  disruptions?: any; // To check axis inversion
}

export const Level6: React.FC<LevelProps> = ({ role, levelState, onAction, disruptions }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  // Listen to keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Operator controls X-Axis (A/D or ArrowLeft/ArrowRight)
      if (isOperator) {
        if (e.key === 'a' || e.key === 'ArrowLeft') {
          playClick();
          onAction('MOVE', { axis: 'x', dir: -1 });
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
          playClick();
          onAction('MOVE', { axis: 'x', dir: 1 });
        }
      }

      // Pilot controls Y-Axis (W/S or ArrowUp/ArrowDown)
      if (isPilot) {
        let dir = 0;
        if (e.key === 'w' || e.key === 'ArrowUp') {
          dir = -1;
        } else if (e.key === 's' || e.key === 'ArrowDown') {
          dir = 1;
        }

        if (dir !== 0) {
          playClick();
          // Check for Patron's inversion spell
          const isInverted = disruptions?.inversioneGravitazionale?.active;
          const finalDir = isInverted ? -dir : dir;
          onAction('MOVE', { axis: 'y', dir: finalDir });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOperator, isPilot, disruptions, onAction]);

  const handleBtnMove = (axis: 'x' | 'y', dir: number) => {
    playClick();
    if (axis === 'y' && isPilot && disruptions?.inversioneGravitazionale?.active) {
      onAction('MOVE', { axis, dir: -dir });
    } else {
      onAction('MOVE', { axis, dir });
    }
  };

  const { avatarPos, maze, lasers } = levelState;

  return (
    <div className="level-container" style={{ padding: '15px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <h3 style={{ color: '#00ffcc', margin: '0 0 5px 0' }}>Griglia Laser Dinamica: Coordinazione Assiale Obbligatoria!</h3>
      <div style={{ color: '#ffb700', fontSize: '12px', marginBottom: '15px' }}>
        Controllo Asse X (G1) | Controllo Asse Y (G2)
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* THE 10x10 MAZE GRID DISPLAY */}
        <div
          id="laser-maze"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 35px)',
            gridTemplateRows: 'repeat(10, 35px)',
            gap: '2px',
            background: '#110522',
            padding: '10px',
            borderRadius: '10px',
            border: '3px solid #ff0055',
            boxShadow: '0 0 25px rgba(255, 0, 85, 0.3)',
            position: 'relative',
          }}
        >
          {maze.map((rowArr, y) =>
            rowArr.map((cell, x) => {
              const isAvatar = avatarPos.x === x && avatarPos.y === y;
              const isTarget = x === 9 && y === 9;
              
              // Check if a laser occupies this cell
              const hasLaser = lasers.some(laser => {
                if (laser.axis === 'x') {
                  return laser.index === y && Math.floor(laser.pos) === x;
                } else {
                  return laser.index === x && Math.floor(laser.pos) === y;
                }
              });

              let bg = '#1a0033';
              if (cell === 1) bg = '#3d0c5a'; // Wall
              if (isTarget) bg = '#00ffcc'; // Target
              if (hasLaser) bg = '#ff0000'; // Laser
              if (isAvatar) bg = '#ffb700'; // Avatar

              return (
                <div
                  key={`${y}-${x}`}
                  id={`maze-cell-${y}-${x}`}
                  style={{
                    background: bg,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    transition: 'background-color 0.05s',
                    boxShadow: isAvatar
                      ? '0 0 10px #ffb700'
                      : hasLaser
                      ? '0 0 8px #ff0000'
                      : 'none',
                  }}
                >
                  {isAvatar && '🐷'}
                  {isTarget && !isAvatar && '🏁'}
                </div>
              );
            })
          )}
        </div>

        {/* INPUT BUTTONS CONTROLS AS FALLBACK FOR TOUCH / MANUAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '220px' }}>
          {isOperator && (
            <div style={{ background: 'rgba(183, 0, 255, 0.15)', border: '2px solid #b700ff', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#b700ff', margin: '0 0 10px 0' }}>CONTROLLO ORIDIZZONTALE (P1)</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="l6-btn-left"
                  onClick={() => handleBtnMove('x', -1)}
                  style={{ flex: 1, padding: '10px', background: '#221133', color: '#fff', border: '1px solid #b700ff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ← SINISTRA
                </button>
                <button
                  id="l6-btn-right"
                  onClick={() => handleBtnMove('x', 1)}
                  style={{ flex: 1, padding: '10px', background: '#221133', color: '#fff', border: '1px solid #b700ff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  DESTRA →
                </button>
              </div>
            </div>
          )}

          {isPilot && (
            <div style={{ background: 'rgba(0, 255, 204, 0.15)', border: '2px solid #00ffcc', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00ffcc', margin: '0 0 10px 0' }}>CONTROLLO VERTICALE (P2)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  id="l6-btn-up"
                  onClick={() => handleBtnMove('y', -1)}
                  style={{ padding: '10px', background: '#001a14', color: '#fff', border: '1px solid #00ffcc', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ↑ SU
                </button>
                <button
                  id="l6-btn-down"
                  onClick={() => handleBtnMove('y', 1)}
                  style={{ padding: '10px', background: '#001a14', color: '#fff', border: '1px solid #00ffcc', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  GIÙ ↓
                </button>
              </div>
              {disruptions?.inversioneGravitazionale?.active && (
                <div style={{ color: '#ff6600', fontSize: '10px', marginTop: '8px', fontWeight: 'bold' }}>
                  ⚠️ COMANDI INVERTITI!
                </div>
              )}
            </div>
          )}

          {role === 'patron' && (
            <div style={{ color: '#888' }}>
              <h3>ATTIVATORE GRAVITAZIONALE</h3>
              <p>Inverti gli assi del Pilota per deviare la traiettoria.</p>
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#aaa', border: '1px solid #333', padding: '8px', borderRadius: '4px' }}>
            <strong>COME GIOCARE:</strong><br />
            P1 usa i tasti <strong>A / D</strong><br />
            P2 usa i tasti <strong>W / S</strong><br />
            Raggiungete la bandierina 🏁
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level6;
