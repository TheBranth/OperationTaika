import React from 'react';
import type { PlayerRole, Level14State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level14State;
  onAction: (actionType: string, payload: any) => void;
}

const STAR_LABELS = ['ALPHA', 'VEGA', 'SIRIUS', 'RIGEL', 'ANTARES', 'POLARIS'];

export const Level14: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const { stars, targetSequence, p2SelectedSequence } = levelState;

  const handleSelectStar = (idx: number) => {
    playClick();
    if (p2SelectedSequence.includes(idx)) return; // No duplicates
    onAction('CONNECT_STAR', { index: idx });
  };

  const handleReset = () => {
    playClick();
    onAction('RESET_STARS', {});
  };

  const handleSubmit = () => {
    playClick();
    onAction('SUBMIT', {});
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* P1: Operator View (Target Constellation Sequence) */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-magenta)' }}>🌌 SCHEMA DELLA COSTELLAZIONE</h2>

          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--neon-magenta)', marginBottom: '20px' }}>
            <span style={{ fontSize: '15px', color: '#aaa' }}>SEQUENZA DI CONNESSIONE RICHIESTA:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
              {targetSequence.map((starIdx, idx) => (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      background: 'rgba(255, 183, 0, 0.1)',
                      border: '1.5px solid #ffb700',
                      borderRadius: '4px',
                      padding: '8px 15px',
                      color: '#ffb700',
                      fontWeight: 'bold',
                      fontSize: '16px',
                    }}
                  >
                    ⭐ {STAR_LABELS[starIdx]}
                  </div>
                  {idx < targetSequence.length - 1 && <span style={{ color: '#fff', fontSize: '20px' }}>➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ color: '#888', fontSize: '13px' }}>
            Dichiara la sequenza stellare esatta al pilota per collegare i nodi energetici.
          </div>
        </div>
      )}

      {/* P2: Pilot View (Interactive Star Plotting Grid) */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0, textAlign: 'center', borderBottom: '1px solid var(--neon-cyan)', paddingBottom: '10px' }}>
            🌌 TRACCIATORE DI STELLE
          </h2>

          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '15px', textAlign: 'center' }}>
            Seleziona le stelle nell'ordine corretto per allineare la costellazione.
          </div>

          {/* Interactive Celestial Canvas/Grid Area */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              background: 'radial-gradient(circle, #08031a, #020108)',
              border: '2px solid rgba(0, 255, 204, 0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            {/* Draw connecting SVG lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {p2SelectedSequence.map((starIdx, idx) => {
                if (idx === 0) return null;
                const prevStar = stars[p2SelectedSequence[idx - 1]];
                const currStar = stars[starIdx];
                return (
                  <line
                    key={idx}
                    x1={`${prevStar.x}%`}
                    y1={`${prevStar.y}%`}
                    x2={`${currStar.x}%`}
                    y2={`${currStar.y}%`}
                    stroke="var(--neon-cyan)"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>

            {/* Stars buttons */}
            {stars.map((star, idx) => {
              const orderIdx = p2SelectedSequence.indexOf(idx);
              const isSelected = orderIdx !== -1;
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    id={`l14-star-${idx}`}
                    onClick={() => handleSelectStar(idx)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--neon-cyan)' : 'transparent',
                      border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)',
                      color: isSelected ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: isSelected ? '0 0 15px var(--neon-cyan)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ⭐
                    {isSelected && (
                      <span style={{ fontSize: '9px', display: 'block', marginTop: '-2px' }}>
                        #{orderIdx + 1}
                      </span>
                    )}
                  </button>
                  <span
                    style={{
                      fontSize: '10px',
                      color: isSelected ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.7)',
                      marginTop: '4px',
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0,0,0,0.8)',
                    }}
                  >
                    {STAR_LABELS[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dials controls */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              id="l14-reset"
              onClick={handleReset}
              style={{
                flex: 1,
                background: '#333',
                border: 'none',
                color: '#fff',
                padding: '12px',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: 'bold',
              }}
            >
              RIPRISTINA
            </button>
            <button
              id="l14-submit"
              onClick={handleSubmit}
              style={{
                flex: 2,
                background: p2SelectedSequence.length >= 4 ? 'var(--neon-cyan)' : '#222',
                border: 'none',
                color: p2SelectedSequence.length >= 4 ? '#000' : '#888',
                padding: '12px',
                cursor: p2SelectedSequence.length >= 4 ? 'pointer' : 'not-allowed',
                borderRadius: '6px',
                fontWeight: 'bold',
                boxShadow: p2SelectedSequence.length >= 4 ? '0 0 10px var(--neon-cyan)' : 'none',
              }}
              disabled={p2SelectedSequence.length < 4}
            >
              CONFERMA COSTELLAZIONE
            </button>
          </div>
        </div>
      )}

      {/* Patron View */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>ALLINEAMENTO NODI COSTELLAZIONE...</h3>
          <p>Disegna le linee nel cielo stellato.</p>
        </div>
      )}
    </div>
  );
};

export default Level14;
