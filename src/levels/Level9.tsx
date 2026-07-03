import React from 'react';
import type { PlayerRole, Level9State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level9State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level9: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const handleSort = (dir: 'left' | 'right') => {
    if (!isPilot) return;
    playClick();
    onAction('SORT', { direction: dir });
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto 20px', background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ff3333' }}>
        <div>Detriti Smistati: <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{levelState.score} / 20</span></div>
        <div>Mancati (Max 3): <span style={{ color: levelState.missed >= 2 ? '#ff3333' : '#ffb700', fontWeight: 'bold' }}>{levelState.missed} / 3</span></div>
      </div>

      {/* OPERATOR VIEW: Overseer of dynamic rules */}
      {isOperator && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div
            id="l9-directive-banner"
            className="directive-banner"
            style={{
              background: 'rgba(255, 0, 85, 0.18)',
              border: '3px solid #ff0055',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 0 25px rgba(255, 0, 85, 0.4)',
              animation: 'pulse-border 1.5s infinite alternate',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#ff3333', letterSpacing: '2px' }}>CAMBIO DIRETTIVA IN CORSO!</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: '12px', marginBottom: '15px' }}>Informa immediatamente il cernitore della nuova regola:</p>
            <div id="l9-active-directive" style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ffcc' }}>
              {levelState.activeDirective}
            </div>
          </div>
          <div style={{ color: '#ffb700', fontSize: '13px' }}>Le regole cambiano periodicamente! Mantieni alta la comunicazione!</div>
        </div>
      )}

      {/* PILOT VIEW: Debris Sorter */}
      {isPilot && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '15px' }}>
            Smista i detriti spaziali prima dell'impatto!
          </p>

          {/* Falling items area */}
          <div
            id="sorting-area"
            style={{
              height: '240px',
              background: '#0a0515',
              border: '2px solid #00ffcc',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            {levelState.spawnedItems.length === 0 ? (
              <div style={{ color: '#555', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                SPAZIO VUOTO
              </div>
            ) : (
              levelState.spawnedItems.map((item) => (
                <div
                  key={item.id}
                  id={`debris-item-${item.id}`}
                  style={{
                    position: 'absolute',
                    top: `${item.y}%`,
                    left: `${item.x}%`,
                    transform: 'translateX(-50%)',
                    background: item.type === 'magico' ? 'rgba(183, 0, 255, 0.25)' : 'rgba(0, 255, 204, 0.25)',
                    border: item.type === 'magico' ? '1px solid #b700ff' : '1px solid #00ffcc',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    transition: 'top 0.1s linear',
                    whiteSpace: 'nowrap',
                    boxShadow: item.type === 'magico' ? '0 0 10px rgba(183,0,255,0.4)' : '0 0 10px rgba(0,255,204,0.4)',
                  }}
                >
                  {item.type === 'magico' ? '🔮' : '⚙️'} {item.name}
                </div>
              ))
            )}

            {/* Left Bin and Right Bin indicators */}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#ffb700', fontSize: '11px' }}>◀ BIN SINISTRO</div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: '#ffb700', fontSize: '11px' }}>BIN DESTRO ▶</div>
          </div>

          {/* Sort Buttons */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              id="l9-sort-left"
              onClick={() => handleSort('left')}
              style={{
                flex: 1,
                padding: '15px',
                background: '#001a14',
                border: '2px solid #00ffcc',
                color: '#00ffcc',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ◀ SMISTA A SINISTRA
            </button>
            <button
              id="l9-sort-right"
              onClick={() => handleSort('right')}
              style={{
                flex: 1,
                padding: '15px',
                background: '#001a14',
                border: '2px solid #00ffcc',
                color: '#00ffcc',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              SMISTA A DESTRA ▶
            </button>
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ color: '#888' }}>
          <h3>DISTURBATORE DEI BINARI</h3>
          <p>Confondi il cernitore oscurando le direttive.</p>
        </div>
      )}

      <style>{`
        @keyframes pulse-border {
          0% { border-color: #ff0055; box-shadow: 0 0 10px rgba(255, 0, 85, 0.4); }
          100% { border-color: #ff0055; box-shadow: 0 0 25px rgba(255, 0, 85, 0.7); }
        }
      `}</style>
    </div>
  );
};

export default Level9;
