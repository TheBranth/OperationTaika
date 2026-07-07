import React, { useState } from 'react';
import type { PlayerRole, Level16State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level16State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level16: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [shakingLocal, setShakingLocal] = useState(false);
  const [localShakeStart, setLocalShakeStart] = useState<number | null>(null);

  const handlePour = (color: 'pink' | 'blue') => {
    playClick();
    onAction('POUR', { color });
  };

  const handleGarnish = (garnish: 'ciliegia' | 'lime' | 'menta') => {
    playClick();
    onAction('ADD_GARNISH', { garnish });
  };

  const handleShakeStart = () => {
    setShakingLocal(true);
    const now = Date.now();
    setLocalShakeStart(now);
    onAction('START_SHAKE', { time: now });
  };

  const handleShakeEnd = () => {
    if (!shakingLocal || !localShakeStart) return;
    setShakingLocal(false);
    const duration = (Date.now() - localShakeStart) / 1000;
    setLocalShakeStart(null);
    onAction('STOP_SHAKE', { duration });
  };

  const handleServe = () => {
    playClick();
    onAction('SERVE_DRINK', {});
  };

  const handleResetMix = () => {
    playClick();
    onAction('RESET_MIX', {});
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* HEADER DASHBOARD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>INCASSI TOTALI:</span>
          <div style={{ fontSize: '24px', color: '#ffb700', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,183,0,0.3)' }}>
            ${levelState.score} / $150
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#aaa', fontSize: '12px' }}>TEMPO RIMASTO:</span>
          <div style={{ fontSize: '24px', color: levelState.timeLeft < 30 ? '#ff3333' : '#00ffcc', fontWeight: 'bold' }}>
            {levelState.timeLeft}s
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {levelState.feedbackMessage && (
        <div className="glow-magenta" style={{ background: 'rgba(255,0,255,0.1)', border: '1px solid #ff00ff', borderRadius: '8px', padding: '10px', textAlign: 'center', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', color: '#ff00ff' }}>
          {levelState.feedbackMessage}
        </div>
      )}

      {/* OPERATOR / SERVER VIEW */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ background: 'rgba(20, 10, 40, 0.6)', border: '2px solid #b700ff', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(183,0,255,0.2)' }}>
            <h2 style={{ color: '#b700ff', marginTop: 0, borderBottom: '1px solid #b700ff', paddingBottom: '8px', textAlign: 'center' }}>
              📋 ORDI-RICETTA ATTIVO
            </h2>
            
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>
                {levelState.activeRecipe.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px' }}>
                  🧪 Sciroppo Rosa: <span style={{ color: '#ff00ff', fontWeight: 'bold' }}>{levelState.activeRecipe.pink} unità</span>
                </div>
                <div style={{ fontSize: '16px' }}>
                  🧪 Sciroppo Blu: <span style={{ color: '#00ccff', fontWeight: 'bold' }}>{levelState.activeRecipe.blue} unità</span>
                </div>
                <div style={{ fontSize: '16px' }}>
                  🍒 Guarnizione: <span style={{ color: '#ffb700', fontWeight: 'bold' }}>{levelState.activeRecipe.garnish.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '16px' }}>
                  🌀 Shakerare per: <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{levelState.activeRecipe.shakeTime} secondi</span>
                </div>
              </div>
            </div>

            <p style={{ color: '#aaa', fontSize: '12px', textAlign: 'center', lineHeight: '1.4' }}>
              Comunica gli ingredienti e il tempo di shakerata esatto al tuo partner. Controlla il tempo di shakerata e grida di fermarsi!
            </p>
          </div>

          {/* STATUS GAUGE FOR COCKTAIL PROGRESS */}
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#aaa' }}>STATO DELLO SHAKER CORRENTE:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>Rosa: {levelState.currentPink} unità</div>
              <div>Blu: {levelState.currentBlue} unità</div>
              <div>Guarnizione: {levelState.currentGarnish || 'Nessuna'}</div>
              <div>Shakerato: {levelState.shakeStartTime ? 'IN CORSO...' : `${levelState.shakeDuration.toFixed(1)} secondi`}</div>
            </div>
          </div>
        </div>
      )}

      {/* PILOT / MIXOLOGIST VIEW */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ background: 'rgba(10, 30, 40, 0.6)', border: '2px solid #00ffcc', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(0,255,204,0.2)' }}>
            <h2 style={{ color: '#00ffcc', marginTop: 0, borderBottom: '1px solid #00ffcc', paddingBottom: '8px', textAlign: 'center' }}>
              🧪 MIXER ARC-ALCHEMICO
            </h2>

            {/* Pour controls */}
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
              <button
                id="btn-pour-pink"
                onClick={() => handlePour('pink')}
                style={{ flex: 1, padding: '15px', background: 'linear-gradient(135deg, #ff00ff, #aa00aa)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255,0,255,0.3)' }}
              >
                Versa Rosa (+10)
              </button>
              <button
                id="btn-pour-blue"
                onClick={() => handlePour('blue')}
                style={{ flex: 1, padding: '15px', background: 'linear-gradient(135deg, #00ccff, #0066aa)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,204,255,0.3)' }}
              >
                Versa Blu (+10)
              </button>
            </div>

            {/* Garnish selection */}
            <div style={{ marginBottom: '25px' }}>
              <span style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#88eeff' }}>SELEZIONA GUARNIZIONE:</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['ciliegia', 'lime', 'menta'] as const).map((g) => (
                  <button
                    key={g}
                    id={`btn-garnish-${g}`}
                    onClick={() => handleGarnish(g)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: levelState.currentGarnish === g ? '#00ffcc' : '#112222',
                      border: '1px solid #00ffcc',
                      borderRadius: '6px',
                      color: levelState.currentGarnish === g ? '#000' : '#00ffcc',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Shake button */}
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
              <span style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#88eeff' }}>SHAKERATORE (NESSUN TIMER VISIBILE! CONTA MANUALMENTE):</span>
              <button
                id="btn-shake-hold"
                onMouseDown={handleShakeStart}
                onMouseUp={handleShakeEnd}
                onMouseLeave={handleShakeEnd}
                onTouchStart={handleShakeStart}
                onTouchEnd={handleShakeEnd}
                style={{
                  width: '100%',
                  padding: '25px',
                  background: shakingLocal ? 'linear-gradient(135deg, #ffb700, #ff6600)' : 'linear-gradient(135deg, #333, #222)',
                  border: '2px solid #ffb700',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: shakingLocal ? '0 0 20px #ffb700' : 'none',
                  transition: 'all 0.1s ease',
                  userSelect: 'none',
                }}
              >
                {shakingLocal ? '🌀 SHAKING IN CORSO... (RILASCIA PER FERMARE)' : '🌀 TIENI PREMUTO PER SHAKERARE'}
              </button>
            </div>

            {/* Action panel */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                id="btn-serve-mix"
                className="btn-primary glow-magenta"
                onClick={handleServe}
                style={{ flex: 2, padding: '15px', fontSize: '18px', fontWeight: 'bold' }}
              >
                🛎️ SERVI DRINK
              </button>
              <button
                id="btn-reset-mix"
                onClick={handleResetMix}
                style={{ flex: 1, padding: '15px', background: 'transparent', border: '1px solid #ff3333', color: '#ff3333', borderRadius: '8px', cursor: 'pointer' }}
              >
                Svuota Shaker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00', marginTop: '40px' }}>
          <h3>DISTURBO MIXOLOGIA ATTIVO</h3>
          <p>Scatena anomalie per confondere i dosaggi e i tempi dei baristi.</p>
        </div>
      )}
    </div>
  );
};

export default Level16;
