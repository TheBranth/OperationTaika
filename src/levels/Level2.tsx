import React from 'react';
import type { PlayerRole, Level2State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level2State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level2: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const selectOp = (op: string) => {
    playClick();
    onAction('SELECT_OP', { op });
  };

  const toggleReady = () => {
    playClick();
    onAction('TOGGLE_READY', {});
  };

  // Determine current choices for local visual cues
  const p1Choice = levelState.p1Op;
  const p2Choice = levelState.p2Op;
  const p1IsReady = levelState.p1Ready;
  const p2IsReady = levelState.p2Ready;

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <div className="status-panel" style={{ background: 'rgba(0,0,0,0.4)', border: '2px dashed #00ffcc', padding: '20px', borderRadius: '10px', maxWidth: '500px', margin: '0 auto 30px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#00ffcc', letterSpacing: '1px' }}>
          Stabilità Attuale: {levelState.currentValue} / Target: 100
        </h2>
        <div style={{ background: '#222', height: '20px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #00ffcc' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, levelState.currentValue))}%`,
              background: levelState.currentValue === 100 ? '#00ff00' : 'linear-gradient(90deg, #ff0055, #00ffcc)',
              height: '100%',
              transition: 'width 0.4s ease-in-out',
            }}
          />
        </div>
        <div style={{ marginTop: '10px', color: '#ffb700', fontSize: '13px' }}>
          Tentativi Rimasti: {levelState.stepsRemaining} | Status: {p1IsReady && p2IsReady ? 'RISOLUZIONE IN CORSO...' : 'IN ATTESA DI ATTIVAZIONE'}
        </div>
      </div>

      <div style={{ color: '#ff3333', fontSize: '14px', marginBottom: '25px', fontWeight: 'bold' }}>
        ⚠️ ATTENZIONE: Sincronizzare gli impulsi prima dell'attivazione!
      </div>

      {/* RENDER VIEWS BY ROLE */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        {/* OPERATOR (P1) CONTROLS */}
        {isOperator && (
          <div className="control-card" style={{ background: 'rgba(255, 0, 85, 0.15)', border: '2px solid #ff0055', borderRadius: '8px', padding: '20px', width: '280px' }}>
            <h3 style={{ color: '#ff0055', marginTop: 0 }}>REGOLAZIONE FLUSSO (P1)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <button
                id="l2-op-mul"
                className={`choice-btn ${p1Choice === '*2' ? 'active' : ''}`}
                onClick={() => selectOp('*2')}
                style={{
                  background: p1Choice === '*2' ? '#ff0055' : '#1a0011',
                  color: '#fff',
                  border: '1px solid #ff0055',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Moltiplica Flusso (*2)
              </button>
              <button
                id="l2-op-div"
                className={`choice-btn ${p1Choice === '/2' ? 'active' : ''}`}
                onClick={() => selectOp('/2')}
                style={{
                  background: p1Choice === '/2' ? '#ff0055' : '#1a0011',
                  color: '#fff',
                  border: '1px solid #ff0055',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Dividi Essenza (/2)
              </button>
            </div>

            <button
              id="l2-ready-p1"
              onClick={toggleReady}
              disabled={!p1Choice}
              style={{
                width: '100%',
                background: p1IsReady ? '#00ffcc' : 'transparent',
                border: '2px solid #00ffcc',
                color: p1IsReady ? '#000' : '#00ffcc',
                padding: '12px',
                borderRadius: '6px',
                cursor: p1Choice ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                boxShadow: p1IsReady ? '0 0 10px #00ffcc' : 'none',
              }}
            >
              {p1IsReady ? 'PRONTO! ✓' : 'CONFERMA IMPULSO'}
            </button>
          </div>
        )}

        {/* PILOT (P2) CONTROLS */}
        {isPilot && (
          <div className="control-card" style={{ background: 'rgba(0, 255, 204, 0.15)', border: '2px solid #00ffcc', borderRadius: '8px', padding: '20px', width: '280px' }}>
            <h3 style={{ color: '#00ffcc', marginTop: 0 }}>REGOLAZIONE MATERIA (P2)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <button
                id="l2-op-add"
                className={`choice-btn ${p2Choice === '+15' ? 'active' : ''}`}
                onClick={() => selectOp('+15')}
                style={{
                  background: p2Choice === '+15' ? '#00ffcc' : '#001a14',
                  color: p2Choice === '+15' ? '#000' : '#fff',
                  border: '1px solid #00ffcc',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Inietta Frammento (+15)
              </button>
              <button
                id="l2-op-sub"
                className={`choice-btn ${p2Choice === '-5' ? 'active' : ''}`}
                onClick={() => selectOp('-5')}
                style={{
                  background: p2Choice === '-5' ? '#00ffcc' : '#001a14',
                  color: p2Choice === '-5' ? '#000' : '#fff',
                  border: '1px solid #00ffcc',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Rilascia Gas (-5)
              </button>
            </div>

            <button
              id="l2-ready-p2"
              onClick={toggleReady}
              disabled={!p2Choice}
              style={{
                width: '100%',
                background: p2IsReady ? '#ff0055' : 'transparent',
                border: '2px solid #ff0055',
                color: '#fff',
                padding: '12px',
                borderRadius: '6px',
                cursor: p2Choice ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                boxShadow: p2IsReady ? '0 0 10px #ff0055' : 'none',
              }}
            >
              {p2IsReady ? 'PRONTO! ✓' : 'CONFERMA IMPULSO'}
            </button>
          </div>
        )}

        {/* PATRON VIEW */}
        {role === 'patron' && (
          <div style={{ color: '#888' }}>
            <h3>DISPOSITIVO DI DISMISSIONE CARICA</h3>
            <p>Osserva i giocatori mentre calcolano l'armonia.</p>
          </div>
        )}
      </div>

      {/* Sibling status indicators */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px' }}>
        <div>Stato Operatore (P1): <span style={{ color: p1IsReady ? '#00ff00' : '#ff3300' }}>{p1IsReady ? 'CONFERMATO' : 'REGOLAZIONE...'}</span></div>
        <div>Stato Pilota (P2): <span style={{ color: p2IsReady ? '#00ff00' : '#ff3300' }}>{p2IsReady ? 'CONFERMATO' : 'REGOLAZIONE...'}</span></div>
      </div>
    </div>
  );
};

export default Level2;
