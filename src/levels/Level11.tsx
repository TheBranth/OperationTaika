import React from 'react';
import type { PlayerRole, Level11State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level11State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level11: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const currentWeight =
    levelState.p2Tartufo * 12 +
    levelState.p2Radice * 19 +
    levelState.p2Erba * 7;

  const target = levelState.targetWeight;

  let statusText = 'SOTTO-PESO';
  let statusColor = '#ffc837'; // gold/yellow
  if (currentWeight === target) {
    statusText = 'IN EQUILIBRIO';
    statusColor = '#00ffcc'; // neon green-cyan
  } else if (currentWeight > target) {
    statusText = 'SOVRAPPESO';
    statusColor = '#ff0055'; // neon red-magenta
  }

  const handleAdjust = (ingredient: 'tartufo' | 'radice' | 'erba', amount: number) => {
    playClick();
    onAction('ADJUST_INGREDIENT', { ingredient, amount });
  };

  const handleSubmit = () => {
    playClick();
    onAction('SUBMIT', {});
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* P1: Operator View (Target Weight & Recipe Book) */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-magenta)' }}>⚖️ EQUILIBRIUM ARCANI</h2>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--neon-magenta)', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', color: '#aaa' }}>PESO TARGET NECESSARIO:</span>
            <div id="l11-target-weight" style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffb700', textShadow: '0 0 10px #ffb700', margin: '10px 0' }}>
              {target} Arc-Grammi
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', textAlign: 'left', borderLeft: '3px solid var(--neon-cyan)' }}>
            <h4 style={{ color: 'var(--neon-cyan)', margin: '0 0 10px 0' }}>⚖️ EFFETTO MASSA INGREDIENTI:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div>🍄 Tartufo Stellare = <strong style={{ color: '#fff' }}>12</strong> Arc-Grammi</div>
              <div>🌱 Radice Fatata = <strong style={{ color: '#fff' }}>19</strong> Arc-Grammi</div>
              <div>🌿 Erba Luminescente = <strong style={{ color: '#fff' }}>7</strong> Arc-Grammi</div>
            </div>
          </div>
        </div>
      )}

      {/* P2: Pilot View (Sliders Dials & Weight State) */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0, textAlign: 'center', borderBottom: '1px solid var(--neon-cyan)', paddingBottom: '10px' }}>
            🍳 ALIMENTATORE FANTA-PORCI
          </h2>

          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>STATO BILANCIA:</span>
            <div id="l11-status-indicator" style={{ fontSize: '32px', fontWeight: 'bold', color: statusColor, textShadow: `0 0 10px ${statusColor}`, margin: '5px 0' }}>
              {statusText}
            </div>
          </div>

          {/* Dials controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' }}>
            {/* Tartufo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '14px' }}>🍄 Tartufo Stellare</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  id="l11-dec-tartufo"
                  onClick={() => handleAdjust('tartufo', -1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span id="l11-val-tartufo" style={{ width: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                  {levelState.p2Tartufo}
                </span>
                <button
                  id="l11-inc-tartufo"
                  onClick={() => handleAdjust('tartufo', 1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Radice */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '14px' }}>🌱 Radice Fatata</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  id="l11-dec-radice"
                  onClick={() => handleAdjust('radice', -1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span id="l11-val-radice" style={{ width: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                  {levelState.p2Radice}
                </span>
                <button
                  id="l11-inc-radice"
                  onClick={() => handleAdjust('radice', 1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Erba */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '8px' }}>
              <span style={{ color: '#aaa', fontSize: '14px' }}>🌿 Erba Luminescente</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  id="l11-dec-erba"
                  onClick={() => handleAdjust('erba', -1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span id="l11-val-erba" style={{ width: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                  {levelState.p2Erba}
                </span>
                <button
                  id="l11-inc-erba"
                  onClick={() => handleAdjust('erba', 1)}
                  style={{ width: '32px', height: '32px', background: '#333', border: '1px solid #666', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            id="l11-submit"
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: currentWeight === target ? 'var(--neon-cyan)' : '#333',
              border: 'none',
              borderRadius: '6px',
              color: currentWeight === target ? '#000' : '#888',
              fontSize: '18px',
              padding: '12px',
              cursor: currentWeight === target ? 'pointer' : 'not-allowed',
              boxShadow: currentWeight === target ? '0 0 15px var(--neon-cyan)' : 'none',
              fontWeight: 'bold',
            }}
            disabled={currentWeight !== target}
          >
            CONFERMA MISCELA
          </button>
        </div>
      )}

      {/* Patron View */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>PREPARAZIONE INFUSI IN CORSO...</h3>
          <p>Aiuta a sintonizzare il bilanciamento.</p>
        </div>
      )}
    </div>
  );
};

export default Level11;
