import React, { useState, useEffect } from 'react';
import type { PlayerRole, Level3State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level3State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level3: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [charge, setCharge] = useState(0);

  // Animate the charge gauge locally (0 to 100 every 2 seconds)
  useEffect(() => {
    let animId: number;
    const updateGauge = () => {
      const now = Date.now();
      const pct = Math.floor(((now % 2000) / 2000) * 100);
      setCharge(pct);
      animId = requestAnimationFrame(updateGauge);
    };
    animId = requestAnimationFrame(updateGauge);
    return () => cancelAnimationFrame(animId);
  }, []);

  const cols = ['1', '2', '3', '4', '5'];
  const rows = ['A', 'B', 'C', 'D', 'E'];

  const handleCoordinateClick = (coord: string) => {
    if (!isPilot) return;
    playClick();
    // Send fire action with current charge value
    onAction('FIRE', { coord, charge });
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#00ffcc', margin: '0 0 10px 0' }}>SISTEMA DI PUNTAMENTO</h3>
        <div style={{ color: '#ffb700' }}>Bersagli Abbattuti: {levelState.hits} / 3</div>
      </div>

      {/* OPERATOR (P1) VIEW: 5x5 Grid with moving Anomaly */}
      {isOperator && (
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ color: '#ff3333', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
            ⚠️ Anomalia localizzata: {levelState.anomalyCoord}! Ordina il fuoco immediato!
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              background: '#000',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #b700ff',
              boxShadow: '0 0 20px rgba(183, 0, 255, 0.3)',
            }}
          >
            {/* Header row */}
            <div style={{ color: '#b700ff' }}></div>
            {cols.map((c) => (
              <div key={c} style={{ color: '#b700ff', fontWeight: 'bold', fontSize: '18px' }}>{c}</div>
            ))}

            {/* Grid rows */}
            {rows.map((row) => (
              <React.Fragment key={row}>
                <div style={{ color: '#b700ff', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{row}</div>
                {cols.map((col) => {
                  const coord = `${row}${col}`;
                  const isTarget = levelState.anomalyCoord === coord;
                  return (
                    <div
                      key={coord}
                      style={{
                        aspectRatio: '1',
                        border: '1px solid #221133',
                        background: isTarget ? '#ff0055' : '#110522',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isTarget ? '0 0 15px #ff0055' : 'none',
                        animation: isTarget ? 'pulse-target 1s infinite alternate' : 'none',
                      }}
                    >
                      {isTarget && (
                        <span style={{ fontSize: '20px', animation: 'spin-target 4s infinite linear', display: 'inline-block' }}>🌀</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* PILOT (P2) VIEW: Fire grid and charge meter */}
      {isPilot && (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          {/* Charge Gauge */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', border: '1px solid #00ffcc', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', color: '#00ffcc', marginBottom: '10px', fontWeight: 'bold' }}>
              Carica Cannone: {charge}%
            </div>
            <div style={{ background: '#222', height: '25px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #00ffcc', position: 'relative' }}>
              <div
                style={{
                  width: `${charge}%`,
                  background: charge >= 90 ? '#00ff00' : 'linear-gradient(90deg, #ff0055, #ffb700)',
                  height: '100%',
                }}
              />
              {/* Green target zone line */}
              <div
                style={{
                  position: 'absolute',
                  right: '10%',
                  top: 0,
                  width: '10%',
                  height: '100%',
                  background: 'rgba(0, 255, 0, 0.3)',
                  borderLeft: '1px dashed #00ff00',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div style={{ color: charge >= 90 ? '#00ff00' : '#888', fontSize: '11px', marginTop: '6px', fontWeight: charge >= 90 ? 'bold' : 'normal' }}>
              {charge >= 90 ? '⚠️ MASSIMO PICCO ATTIVO! FUOCO RAPIDO!' : 'CARICAMENTO IN CORSO...'}
            </div>
          </div>

          <p style={{ color: '#ffaa00', fontSize: '12px', marginBottom: '15px' }}>
            Seleziona la coordinata corretta al momento del massimo picco! (carica ≥ 90%)
          </p>

          {/* Coordinate input buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              background: '#000',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #00ffcc',
            }}
          >
            {/* Header row */}
            <div style={{ color: '#00ffcc' }}></div>
            {cols.map((c) => (
              <div key={c} style={{ color: '#00ffcc', fontWeight: 'bold' }}>{c}</div>
            ))}

            {/* Grid buttons */}
            {rows.map((row) => (
              <React.Fragment key={row}>
                <div style={{ color: '#00ffcc', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{row}</div>
                {cols.map((col) => {
                  const coord = `${row}${col}`;
                  return (
                    <button
                      key={coord}
                      id={`l3-fire-${coord}`}
                      onClick={() => handleCoordinateClick(coord)}
                      style={{
                        aspectRatio: '1',
                        border: '1px solid #00ffcc',
                        background: '#001a14',
                        color: '#00ffcc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        transition: 'all 0.1s ease',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.background = '#00ffcc')}
                      onMouseUp={(e) => (e.currentTarget.style.background = '#001a14')}
                    >
                      {coord}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>DEVIATORE DI COORDINATE</h3>
          <p>Tenta di oscurare lo schermo dell'Operatore al momento critico.</p>
        </div>
      )}

      <style>{`
        @keyframes pulse-target {
          0% { box-shadow: 0 0 5px #ff0055; }
          100% { box-shadow: 0 0 25px #ff0055; }
        }
        @keyframes spin-target {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Level3;
