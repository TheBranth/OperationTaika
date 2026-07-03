import React from 'react';
import type { PlayerRole, Level7State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level7State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level7: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const handlePush = (dir: number) => {
    playClick();
    onAction('PUSH', { dir });
  };

  const val = levelState.stabilityValue;
  const inGreen = val >= -15 && val <= 15;
  const progressPct = Math.min(100, Math.floor((levelState.greenTime / 20) * 100));

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <div style={{ color: '#ff3333', fontSize: '16px', fontWeight: 'bold', marginBottom: '25px', animation: 'blink-alert 1s infinite alternate' }}>
        🚨 CONTENIMENTO REATTORE COMPROMESSO! Bilancia i vettori!
      </div>

      {/* Stabilization Slider Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 30px', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '12px', border: '1px solid #444' }}>
        <div style={{ fontSize: '18px', color: inGreen ? '#00ffcc' : '#ff0055', fontWeight: 'bold', marginBottom: '15px' }}>
          Stato Gravitazionale: {val > 0 ? `+${val}` : val}
        </div>

        {/* The slider visual */}
        <div style={{ position: 'relative', height: '40px', background: '#222', borderRadius: '8px', border: '2px solid #555', overflow: 'hidden', marginBottom: '10px' }}>
          {/* Green zone in the middle */}
          <div
            style={{
              position: 'absolute',
              left: '42.5%', // 50% - 7.5%
              width: '15%',  // -15 to +15 is 30 units out of 200, which is 15%
              height: '100%',
              background: 'rgba(0, 255, 204, 0.25)',
              borderLeft: '2px dashed #00ffcc',
              borderRight: '2px dashed #00ffcc',
            }}
          />

          {/* Current pointer */}
          <div
            style={{
              position: 'absolute',
              left: `${((val + 100) / 200) * 100}%`,
              width: '10px',
              height: '100%',
              background: inGreen ? '#00ffcc' : '#ff0055',
              transform: 'translateX(-50%)',
              boxShadow: inGreen ? '0 0 15px #00ffcc' : '0 0 15px #ff0055',
              transition: 'left 0.1s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '11px' }}>
          <span>LIMITATORE SINISTRO (-100)</span>
          <span style={{ color: '#00ffcc' }}>ZONA STABILE (-15 a +15)</span>
          <span>LIMITATORE DESTRO (+100)</span>
        </div>
      </div>

      {/* Progress towards 20s */}
      <div style={{ maxWidth: '400px', margin: '0 auto 35px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px', color: '#ffb700' }}>
          <span>Sincronizzazione Vettori:</span>
          <span>{levelState.greenTime.toFixed(1)}s / 20.0s</span>
        </div>
        <div style={{ background: '#222', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ffb700' }}>
          <div
            style={{
              width: `${progressPct}%`,
              background: '#ffb700',
              height: '100%',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* BUTTON CONTROLS BY ROLE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        {isOperator && (
          <button
            id="l7-btn-left"
            onClick={() => handlePush(-1)}
            style={{
              background: '#880033',
              border: '2px solid #ff0055',
              color: '#fff',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 0, 85, 0.4)',
            }}
          >
            ◀ Spingi a Sinistra (-15)
          </button>
        )}

        {isPilot && (
          <button
            id="l7-btn-right"
            onClick={() => handlePush(1)}
            style={{
              background: '#004433',
              border: '2px solid #00ffcc',
              color: '#fff',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 204, 0.4)',
            }}
          >
            Spingi a Destra (+15) ▶
          </button>
        )}
      </div>

      {role === 'patron' && (
        <div style={{ color: '#888', marginTop: '20px' }}>
          <h3>DISTURBATORE FLUIDO GRAVITAZIONALE</h3>
          <p>La gravità oscilla. Mantieni viva l'instabilità!</p>
        </div>
      )}

      <style>{`
        @keyframes blink-alert {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Level7;
