import React from 'react';
import type { PlayerRole, Level1State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level1State;
  onAction: (actionType: string, payload: any) => void;
}

const DICTIONARY: { [key: string]: string } = {
  'Φ': 'ZANNA',
  'Ω': 'TARTUFO',
  'Ψ': 'PROSCIUTTO',
  'λ': 'FANGOSITÀ',
  'Ξ': 'ALCHIMIA',
  'θ': 'CRUSCA',
  'Σ': 'FOCACCIA',
  'γ': 'CODA',
};

export const Level1: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const handleInputChange = (index: number, val: string) => {
    playClick();
    onAction('UPDATE_INPUT', { index, val: val.toUpperCase() });
  };

  const handleSubmit = () => {
    playClick();
    onAction('SUBMIT', {});
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* PLAYER 1 VIEWPORT */}
      {isOperator && (
        <div style={{ textAlign: 'center' }}>
          <div className="alert-header" style={{ color: '#ff3333', fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>
            ⚠️ ATTENZIONE: Sovraccarico Arcano! Inserisci la sequenza!
          </div>

          {/* Display Rotating Glyphs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '35px' }}>
            {levelState.symbols.map((symbol, idx) => (
              <div
                key={idx}
                className="rotating-glyph"
                style={{
                  fontSize: '72px',
                  color: '#b700ff',
                  textShadow: '0 0 20px #b700ff',
                  animation: `spin-glyph ${3 + idx}s infinite linear`,
                  display: 'inline-block',
                }}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Word inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00ffcc' }}>Parola #{idx + 1}:</span>
                <input
                  id={`l1-input-${idx}`}
                  type="text"
                  value={levelState.p1Inputs[idx] || ''}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  style={{
                    background: '#110522',
                    border: '2px solid #b700ff',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '18px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                  placeholder="DIGITA QUI..."
                />
              </div>
            ))}
          </div>

          <button
            id="l1-submit-btn"
            className="action-btn"
            onClick={handleSubmit}
            style={{
              background: '#b700ff',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '20px',
              padding: '12px 36px',
              cursor: 'pointer',
              boxShadow: '0 0 15px #b700ff',
              fontWeight: 'bold',
            }}
          >
            PRONTO!
          </button>
        </div>
      )}

      {/* PLAYER 2 VIEWPORT */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid #00ffcc', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)' }}>
          <h2 style={{ color: '#00ffcc', marginTop: 0, textAlign: 'center', borderBottom: '1px solid #00ffcc', paddingBottom: '10px' }}>
            📜 MANUALE SUINO
          </h2>
          <p style={{ color: '#88eeff', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
            Manuale di Decifrazione Suina. Associa i simboli arcani e detta le parole d'ordine al tuo partner!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px' }}>
            {Object.entries(DICTIONARY).map(([glyph, word]) => (
              <div key={glyph} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '20px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                <span style={{ color: '#ffb700', fontWeight: 'bold' }}>{glyph}</span>
                <span style={{ color: '#fff', fontSize: '16px' }}>{word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLAYER 3 VIEWPORT */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>DECODIFICA DI TAIKA IN CORSO...</h3>
          <p>Disurba i giocatori inviando anomalie temporali.</p>
        </div>
      )}

      <style>{`
        @keyframes spin-glyph {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Level1;
