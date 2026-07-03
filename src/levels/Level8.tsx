import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerRole, Level8State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level8State;
  onAction: (actionType: string, payload: any) => void;
}

const COLORS = ['Rosso', 'Blu', 'Verde', 'Giallo'];
const COLOR_MAP: { [key: string]: string } = {
  'Rosso': '#ff3333',
  'Blu': '#3388ff',
  'Verde': '#33ff33',
  'Giallo': '#ffff33',
};

export const Level8: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [flashIndex, setFlashIndex] = useState<number>(-1);
  const [isFlashing, setIsFlashing] = useState(false);

  const triggerSequenceFlash = useCallback(() => {
    if (isFlashing) return;
    setIsFlashing(true);
    let index = 0;
    setFlashIndex(0);

    const interval = setInterval(() => {
      index++;
      if (index >= levelState.sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setFlashIndex(-1);
          setIsFlashing(false);
        }, 600);
      } else {
        setFlashIndex(index);
      }
    }, 1000);
  }, [isFlashing, levelState.sequence]);

  // Trigger sequence flashing on Operator's screen when sequence or round changes
  useEffect(() => {
    if (isOperator) {
      triggerSequenceFlash();
    }
  }, [levelState.round, isOperator, triggerSequenceFlash]);

  const handleColorClick = (color: string) => {
    if (!isPilot) return;
    playClick();
    onAction('INPUT_COLOR', { color });
  };

  const activeFlashColor = flashIndex !== -1 ? levelState.sequence[flashIndex] : null;

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#00ffcc', margin: 0 }}>🧠 LA MATRICE DEI RICORDI</h3>
        <div style={{ color: '#ffb700', fontSize: '13px', marginTop: '5px' }}>
          Round {levelState.round} / 3 | Lunghezza Sequenza: {levelState.sequence.length}
        </div>
      </div>

      {/* OPERATOR VIEW: Sequence Viewer */}
      {isOperator && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ color: '#ff0055', fontWeight: 'bold', fontSize: '14px', marginBottom: '15px' }}>
            📜 Memorizza i bagliori e guida il tuo compagno!
          </div>

          {/* Replay Button */}
          <button
            id="l8-replay-btn"
            onClick={triggerSequenceFlash}
            disabled={isFlashing}
            style={{
              background: '#b700ff',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '8px 16px',
              cursor: isFlashing ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              fontWeight: 'bold',
            }}
          >
            {isFlashing ? 'RIPRODUZIONE IN CORSO...' : '🔄 RIPRODUCI SEQUENZA'}
          </button>

          {/* Flash display pad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '280px', margin: '0 auto' }}>
            {COLORS.map((color) => {
              const isLit = activeFlashColor === color;
              return (
                <div
                  key={color}
                  id={`l8-flash-${color}`}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: `3px solid ${COLOR_MAP[color]}`,
                    background: isLit ? COLOR_MAP[color] : 'rgba(0,0,0,0.4)',
                    boxShadow: isLit ? `0 0 25px ${COLOR_MAP[color]}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: isLit ? '#000' : '#888',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {color.toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PILOT VIEW: Interactive Input Buttons */}
      {isPilot && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '14px', marginBottom: '15px' }}>
            ⚡ Attendi la sequenza vocale ed esegui!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '280px', margin: '0 auto', marginBottom: '20px' }}>
            {COLORS.map((color) => (
              <button
                key={color}
                id={`l8-btn-${color}`}
                onClick={() => handleColorClick(color)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  border: `3px solid ${COLOR_MAP[color]}`,
                  background: 'rgba(0,0,0,0.4)',
                  color: COLOR_MAP[color],
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  transition: 'all 0.1s',
                  boxShadow: `inset 0 0 10px rgba(0,0,0,0.5)`,
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.background = COLOR_MAP[color];
                  e.currentTarget.style.color = '#000';
                  e.currentTarget.style.boxShadow = `0 0 20px ${COLOR_MAP[color]}`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.color = COLOR_MAP[color];
                  e.currentTarget.style.boxShadow = `inset 0 0 10px rgba(0,0,0,0.5)`;
                }}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: '#aaa', background: '#000', padding: '10px', borderRadius: '4px' }}>
            Inserimenti confermati: {levelState.p2InputSequence.length} / {levelState.sequence.length}
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ color: '#888' }}>
          <h3>DEVIATORE DI MEMORIA</h3>
          <p>Disorienta l'Operatore provocando finti allarmi.</p>
        </div>
      )}
    </div>
  );
};

export default Level8;
