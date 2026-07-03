import React, { useState, useEffect } from 'react';
import type { PlayerRole, Level10State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level10State;
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

export const Level10: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [phase1Inputs, setPhase1Inputs] = useState<string[]>(['', '', '']);
  const [countdownText, setCountdownText] = useState('1.50');

  // Phase 3 Countdown display ticker
  useEffect(() => {
    if (levelState.phase === 3 && levelState.countdownActive) {
      let animId: number;
      const updateCountdown = () => {
        const elapsed = Date.now() - levelState.countdownStart;
        const remaining = Math.max(0, 1500 - elapsed);
        setCountdownText((remaining / 1000).toFixed(2));
        animId = requestAnimationFrame(updateCountdown);
      };
      animId = requestAnimationFrame(updateCountdown);
      return () => cancelAnimationFrame(animId);
    }
  }, [levelState.phase, levelState.countdownActive, levelState.countdownStart]);

  // Phase 1 updates
  const handleP1InputChange = (index: number, val: string) => {
    playClick();
    const newInputs = [...phase1Inputs];
    newInputs[index] = val.toUpperCase();
    setPhase1Inputs(newInputs);
    onAction('P1_INPUT_CHANGE', { index, val: val.toUpperCase() });
  };

  const handleP1Submit = () => {
    playClick();
    onAction('P1_SUBMIT', {});
  };

  // Phase 2 updates
  const handleChargeStart = () => {
    onAction('SET_CHARGING', { isCharging: true });
  };

  const handleChargeEnd = () => {
    onAction('SET_CHARGING', { isCharging: false });
  };

  const handlePushReactor = (dir: number) => {
    playClick();
    onAction('PUSH_REACTOR', { dir });
  };

  // Phase 3 updates
  const handleFinalStrike = () => {
    playClick();
    onAction('STRIKE', { player: role });
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      {/* BOSS HP ACCENT HEADER */}
      <div style={{ maxWidth: '600px', margin: '0 auto 25px', background: 'rgba(0, 0, 0, 0.7)', border: '3px solid #ff0055', borderRadius: '12px', padding: '15px 25px', boxShadow: '0 0 25px rgba(255, 0, 85, 0.5)' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#ff3333', letterSpacing: '3px', textShadow: '0 0 10px rgba(255,51,51,0.5)' }}>
          ANOMALIA DI SISTEMA: GLITCH ARCANO
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
          <span>INTEGRITÀ BOSS:</span>
          <span style={{ color: '#ff3333', fontWeight: 'bold' }}>Integrità Glitch: {levelState.bossHp}%</span>
        </div>
        <div style={{ background: '#222', height: '22px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ff0055' }}>
          <div
            id="boss-hp-bar"
            style={{
              width: `${levelState.bossHp}%`,
              background: 'linear-gradient(90deg, #660022, #ff0055)',
              height: '100%',
              transition: 'width 0.3s ease-out',
              boxShadow: '0 0 10px #ff0055',
            }}
          />
        </div>
        <div style={{ color: '#ffb700', fontSize: '11px', marginTop: '8px' }}>
          FASE ATTUALE: {levelState.phase} / 3 — {levelState.phase === 1 && 'HACKING SCUDO'} {levelState.phase === 2 && 'SOVRACCARICO CANNONE'} {levelState.phase === 3 && 'COLPO FINALE'}
        </div>
      </div>

      {/* PHASE 1: THE HACK */}
      {levelState.phase === 1 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {isOperator && (
            <div>
              <div style={{ color: '#ff3333', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
                ⚠️ ATTENZIONE: Decifra lo scudo protettivo! Inserisci la sequenza!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '25px' }}>
                {levelState.p1Symbols.map((sym, idx) => (
                  <span key={idx} style={{ fontSize: '48px', color: '#b700ff', textShadow: '0 0 15px #b700ff', animation: 'spin-glyph 4s infinite linear', display: 'inline-block' }}>
                    {sym}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <input
                    key={idx}
                    id={`l10-p1-input-${idx}`}
                    type="text"
                    value={phase1Inputs[idx]}
                    onChange={(e) => handleP1InputChange(idx, e.target.value)}
                    placeholder={`PAROLA #${idx + 1}...`}
                    style={{ background: '#110522', border: '2px solid #b700ff', color: '#fff', padding: '8px', textAlign: 'center', textTransform: 'uppercase' }}
                  />
                ))}
              </div>
              <button
                id="l10-p1-submit"
                onClick={handleP1Submit}
                style={{ background: '#b700ff', border: 'none', color: '#fff', padding: '10px 30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px #b700ff' }}
              >
                DISATTIVA SCUDO
              </button>
            </div>
          )}

          {isPilot && (
            <div style={{ background: 'rgba(20, 10, 40, 0.6)', border: '2px solid #00ffcc', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00ffcc', marginTop: 0 }}>📜 MANUALE SCUDI</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                {Object.entries(DICTIONARY).map(([glyph, word]) => (
                  <div key={glyph} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                    <span style={{ color: '#ffb700', fontWeight: 'bold' }}>{glyph}</span>
                    <span>{word}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: THE CHARGE */}
      {levelState.phase === 2 && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          {/* Operator holds Charge */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            {isOperator ? (
              <div style={{ background: 'rgba(183,0,255,0.15)', border: '2px solid #b700ff', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#b700ff', margin: '0 0 15px 0' }}>REGOLATORE DI ENERGIA (P1)</h4>
                <button
                  id="l10-charge-btn"
                  onMouseDown={handleChargeStart}
                  onMouseUp={handleChargeEnd}
                  onTouchStart={handleChargeStart}
                  onTouchEnd={handleChargeEnd}
                  style={{
                    width: '100%',
                    height: '80px',
                    background: levelState.p1IsCharging ? '#00ffcc' : '#220033',
                    border: '3px solid #b700ff',
                    color: levelState.p1IsCharging ? '#000' : '#fff',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: levelState.p1IsCharging ? '0 0 20px #00ffcc' : 'none',
                    userSelect: 'none',
                  }}
                >
                  {levelState.p1IsCharging ? '⚡ RICARICA ATTIVA ⚡' : 'TIENI PREMUTO PER CARICARE'}
                </button>
                <div style={{ color: '#aaa', fontSize: '11px', marginTop: '10px' }}>
                  Nota: la ricarica funziona solo quando il reattore è bilanciato!
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#ffb700' }}>STATO CARICA CANNONE</h4>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ffcc' }}>{levelState.p1CannonCharge}%</div>
              </div>
            )}
          </div>

          {/* Pilot maintains Balance */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ background: 'rgba(0,255,204,0.15)', border: '2px solid #00ffcc', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#00ffcc', margin: '0 0 15px 0' }}>STABILITÀ REATTORE (P2)</h4>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: Math.abs(levelState.stabilityValue) <= 10 ? '#00ff00' : '#ff0055', marginBottom: '10px' }}>
                Vettore: {levelState.stabilityValue > 0 ? `+${levelState.stabilityValue}` : levelState.stabilityValue} (Stabile: -10 a +10)
              </div>
              <div style={{ position: 'relative', height: '25px', background: '#111', border: '1px solid #555', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                {/* Target Zone */}
                <div style={{ position: 'absolute', left: '45%', width: '10%', height: '100%', background: 'rgba(0,255,0,0.3)', borderLeft: '1px dashed #00ff00', borderRight: '1px dashed #00ff00' }} />
                {/* Indicator pointer */}
                <div style={{ position: 'absolute', left: `${((levelState.stabilityValue + 100) / 200) * 100}%`, width: '6px', height: '100%', background: '#ffb700', transform: 'translateX(-50%)' }} />
              </div>

              {isPilot ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    id="l10-reactor-left"
                    onClick={() => handlePushReactor(-1)}
                    style={{ flex: 1, padding: '10px', background: '#001a14', color: '#fff', border: '1px solid #00ffcc', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ◀ SPINGI SX
                  </button>
                  <button
                    id="l10-reactor-right"
                    onClick={() => handlePushReactor(1)}
                    style={{ flex: 1, padding: '10px', background: '#001a14', color: '#fff', border: '1px solid #00ffcc', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    SPINGI DX ▶
                  </button>
                </div>
              ) : (
                <div style={{ color: '#aaa', fontSize: '11px' }}>Il Pilota sta stabilizzando il reattore...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: THE FINAL STRIKE */}
      {levelState.phase === 3 && (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,0,0,0.15)', border: '3px solid #ff0000', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 0 25px rgba(255,0,0,0.5)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff3333' }}>
              {countdownText}s
            </div>
          </div>

          <h3 style={{ color: '#ffb700', margin: '0 0 10px 0' }}>ATTACCO COMBINATO SINCRONIZZATO</h3>
          <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '25px' }}>
            Premete entrambi il grilletto finale entro un intervallo di 100ms!
          </p>

          {(isOperator || isPilot) && (
            <button
              id="l10-strike-btn"
              onClick={handleFinalStrike}
              style={{
                width: '100%',
                padding: '25px',
                background: '#ff0000',
                color: '#fff',
                border: '3px solid #fff',
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 0 30px #ff0000',
                letterSpacing: '2px',
                animation: 'pulse-scale 0.5s infinite alternate',
              }}
            >
              🎯 ATTACCO FINALE!
            </button>
          )}

          <div style={{ marginTop: '20px', fontSize: '11px', display: 'flex', justifyContent: 'space-around', color: '#888' }}>
            <div>P1 Colpo: <span style={{ color: levelState.p1StrikeTime ? '#00ff00' : '#ff3333' }}>{levelState.p1StrikeTime ? 'EFFETTUATO ✓' : 'IN ATTESA'}</span></div>
            <div>P2 Colpo: <span style={{ color: levelState.p2StrikeTime ? '#00ff00' : '#ff3333' }}>{levelState.p2StrikeTime ? 'EFFETTUATO ✓' : 'IN ATTESA'}</span></div>
          </div>
        </div>
      )}

      {role === 'patron' && (
        <div style={{ color: '#888', marginTop: '20px' }}>
          <h3>ATTIVATORE DEL CAOS FINALE</h3>
          <p>Scatena la Nebbia o l'Allarme per impedire il colpo finale sincronizzato.</p>
        </div>
      )}
    </div>
  );
};

export default Level10;
