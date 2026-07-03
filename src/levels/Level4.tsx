import React from 'react';
import type { PlayerRole, Level4State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level4State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level4: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const selectAtmosphere = (atmo: string) => {
    playClick();
    onAction('SET_ATMOSPHERE', { atmosphere: atmo });
  };

  const feedItem = (item: string) => {
    playClick();
    onAction('FEED', { item });
  };

  const getElementColor = (elem: string) => {
    if (elem === 'FUOCO') return '#ff3300';
    if (elem === 'TERRA') return '#00ff66';
    if (elem === 'OMBRA') return '#b700ff';
    return '#fff';
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto 20px', background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ffb700' }}>
        <div>Alimenti Corretti: <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{levelState.score} / 4</span></div>
        <div>Tempo Rimasto: <span style={{ color: levelState.roundTimer <= 15 ? '#ff3333' : '#ffb700', fontWeight: 'bold' }}>{levelState.roundTimer}s</span></div>
      </div>

      {/* Taika Bubble Demand */}
      <div className="taika-bubble" style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', border: '2px solid #555', maxWidth: '400px', margin: '0 auto 30px', position: 'relative' }}>
        <div style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase' }}>Il porcellino spaziale brama...</div>
        <div id="taika-demand" style={{ fontSize: '32px', color: getElementColor(levelState.targetElement), fontWeight: 'bold', textShadow: `0 0 15px ${getElementColor(levelState.targetElement)}`, margin: '10px 0' }}>
          Taika brama: {levelState.targetElement}!
        </div>
        <div style={{ fontSize: '48px', animation: 'bounce 1.5s infinite alternate' }}>🐷</div>
      </div>

      {/* OPERATOR VIEW: Atmosphere Controls */}
      {isOperator && (
        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
          <h3 style={{ color: '#ffb700' }}>Atmosfera Attiva: {levelState.activeAtmosphere || 'NESSUNA'}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
            {['CALDO', 'FREDDO', 'VAPORE'].map((atmo) => (
              <button
                key={atmo}
                id={`l4-atmo-${atmo}`}
                onClick={() => selectAtmosphere(atmo)}
                style={{
                  flex: 1,
                  padding: '15px 10px',
                  background: levelState.activeAtmosphere === atmo ? '#ffb700' : '#221100',
                  color: levelState.activeAtmosphere === atmo ? '#000' : '#ffb700',
                  border: '2px solid #ffb700',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  boxShadow: levelState.activeAtmosphere === atmo ? '0 0 15px #ffb700' : 'none',
                }}
              >
                {atmo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PILOT VIEW: Food items */}
      {isPilot && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ color: '#00ffcc' }}>DISPENSER ALIMENTI (P2)</h3>
          <p style={{ color: '#888', fontSize: '11px', marginBottom: '15px' }}>
            Abbina il cibo all'atmosfera arcana creata dal tuo partner prima di nutrire Taika!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Peperoncino Infernale', desc: 'Compatibile con il Fuoco / Caldo' },
              { name: 'Fango d\'Abisso', desc: 'Compatibile con la Terra / Freddo' },
              { name: 'Polvere di Stelle', desc: 'Compatibile con l\'Ombra / Vapore' },
            ].map((item) => (
              <button
                key={item.name}
                id={`l4-feed-${item.name.replace(/'/g, '').replace(/ /g, '-')}`}
                onClick={() => feedItem(item.name as any)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#001a14',
                  border: '2px solid #00ffcc',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 255, 204, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#001a14')}
              >
                <div>
                  <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{item.name}</span>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: '20px' }}>🍲</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ color: '#888' }}>
          <h3>DISTURBATORE METEOROLOGICO</h3>
          <p>Ostacola il bilanciamento alimentare.</p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Level4;
