import React from 'react';
import type { PlayerRole, Level15State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level15State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level15: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const { tubeAlpha, tubeBeta, tubeGamma, integrity } = levelState;

  const handleBleed = (valve: 'alpha' | 'beta' | 'gamma') => {
    playClick();
    onAction('BLEED_VALVE', { valve });
  };

  const handlePurge = () => {
    playClick();
    onAction('PURGE', {});
  };

  const canPurge = tubeAlpha < 20 && tubeBeta < 20 && tubeGamma < 20;

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* P1: Operator View (Valve Release Panels) */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-magenta)' }}>🚨 VALVOLE DI SPURGO PRESSIONE</h2>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
            {/* Valve Alpha */}
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(0,0,0,0.4)', border: '1px solid #555', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#aaa' }}>VALVOLA ALPHA</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: tubeAlpha >= 80 ? '#ff0055' : '#ffb700', margin: '10px 0' }}>
                {tubeAlpha.toFixed(0)}%
              </div>
              <button
                id="l15-valve-alpha"
                onClick={() => handleBleed('alpha')}
                style={{
                  width: '100%',
                  background: 'var(--neon-magenta)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(255, 0, 85, 0.4)',
                }}
              >
                APRI ALPHA
              </button>
            </div>

            {/* Valve Beta */}
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(0,0,0,0.4)', border: '1px solid #555', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#aaa' }}>VALVOLA BETA</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: tubeBeta >= 80 ? '#ff0055' : '#ffb700', margin: '10px 0' }}>
                {tubeBeta.toFixed(0)}%
              </div>
              <button
                id="l15-valve-beta"
                onClick={() => handleBleed('beta')}
                style={{
                  width: '100%',
                  background: 'var(--neon-magenta)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(255, 0, 85, 0.4)',
                }}
              >
                APRI BETA
              </button>
            </div>

            {/* Valve Gamma */}
            <div style={{ flex: 1, minWidth: '150px', background: 'rgba(0,0,0,0.4)', border: '1px solid #555', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#aaa' }}>VALVOLA GAMMA</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: tubeGamma >= 80 ? '#ff0055' : '#ffb700', margin: '10px 0' }}>
                {tubeGamma.toFixed(0)}%
              </div>
              <button
                id="l15-valve-gamma"
                onClick={() => handleBleed('gamma')}
                style={{
                  width: '100%',
                  background: 'var(--neon-magenta)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(255, 0, 85, 0.4)',
                }}
              >
                APRI GAMMA
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#aaa', textAlign: 'left' }}>
            💡 <strong>EFFETTO VALVOLA:</strong> Rilascia 30% di pressione del proprio condotto, ma incrementa del 15% gli altri due. Portali tutti sotto il 20% contemporaneamente per consentire lo spurgo finale!
          </div>
        </div>
      )}

      {/* P2: Pilot View (Integrity Monitor & Final Purge Button) */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0, textAlign: 'center', borderBottom: '1px solid var(--neon-cyan)', paddingBottom: '10px' }}>
            🛡️ INTEGRITÀ STRUTTURALE VANO TAIKA
          </h2>

          {/* Structural Integrity Bar */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span>INTEGRITÀ STRUTTURA:</span>
              <span style={{ color: integrity <= 30 ? '#ff0055' : '#ffb700', fontWeight: 'bold' }}>{integrity}%</span>
            </div>
            <div style={{ background: '#222', height: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #444' }}>
              <div
                style={{
                  width: `${integrity}%`,
                  height: '100%',
                  background: integrity <= 30 ? 'linear-gradient(90deg, #ff0055, #bb0033)' : 'linear-gradient(90deg, #00ffcc, #00bb88)',
                  transition: 'width 0.2s ease-out',
                }}
              />
            </div>
          </div>

          {/* Readout stats of tubes */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>PRESSIONE CONDOTTI DI SCARICO:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>ALPHA: <span style={{ color: tubeAlpha < 20 ? '#00ffcc' : '#ffb700', fontWeight: 'bold' }}>{tubeAlpha.toFixed(0)}%</span></div>
              <div>BETA:  <span style={{ color: tubeBeta < 20 ? '#00ffcc' : '#ffb700', fontWeight: 'bold' }}>{tubeBeta.toFixed(0)}%</span></div>
              <div>GAMMA: <span style={{ color: tubeGamma < 20 ? '#00ffcc' : '#ffb700', fontWeight: 'bold' }}>{tubeGamma.toFixed(0)}%</span></div>
            </div>
          </div>

          <button
            id="l15-purge"
            onClick={handlePurge}
            style={{
              width: '100%',
              background: canPurge ? '#ffb700' : '#444',
              border: 'none',
              borderRadius: '8px',
              color: canPurge ? '#000' : '#888',
              fontSize: '20px',
              padding: '16px',
              cursor: canPurge ? 'pointer' : 'not-allowed',
              boxShadow: canPurge ? '0 0 20px #ffb700' : 'none',
              fontWeight: 'bold',
            }}
            disabled={!canPurge}
          >
            ☣️ SPURGO FINALE ☣️
          </button>
        </div>
      )}

      {/* Patron View */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>EROSIONE TESSUTO STRUTTURALE...</h3>
          <p>Supervisiona lo spurgo del fango.</p>
        </div>
      )}
    </div>
  );
};

export default Level15;
