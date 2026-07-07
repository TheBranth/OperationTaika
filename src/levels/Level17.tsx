import React from 'react';
import type { PlayerRole, Level17State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level17State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level17: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const handleRefill = (itemType: 'buns' | 'meat' | 'potatoes' | 'lettuce') => {
    playClick();
    onAction('REFILL_STOCK', { itemType });
  };

  const handleDeliver = () => {
    playClick();
    onAction('DELIVER_ORDER', {});
  };

  const handleStartGrill = () => {
    playClick();
    onAction('START_GRILL', {});
  };

  const handleAddIngredient = (ingredient: string) => {
    playClick();
    onAction('ADD_INGREDIENT', { ingredient });
  };

  const handleClearPlate = () => {
    playClick();
    onAction('CLEAR_PLATE', {});
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* HEADER DASHBOARD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>ORDINI COMPLETATI:</span>
          <div style={{ fontSize: '24px', color: '#00ffcc', fontWeight: 'bold' }}>
            {levelState.score} / 5
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#aaa', fontSize: '12px' }}>TEMPO RIMASTO:</span>
          <div style={{ fontSize: '24px', color: levelState.timeLeft < 30 ? '#ff3333' : '#ffb700', fontWeight: 'bold' }}>
            {levelState.timeLeft}s
          </div>
        </div>
      </div>

      {/* OPERATOR / SERVER VIEW */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Orders List */}
          <div className="glass-card" style={{ background: 'rgba(20, 10, 40, 0.6)', border: '2px solid #ff00ff', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
            <h2 style={{ color: '#ff00ff', marginTop: 0, borderBottom: '1px solid #ff00ff', paddingBottom: '8px', textAlign: 'center' }}>
              🛎️ TICKET ORDINI CLIENTI
            </h2>

            {levelState.orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>Attesa di nuovi clienti...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {levelState.orders.map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 18px', borderRadius: '8px', borderLeft: '4px solid #ff00ff' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                        {order.itemName.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffb700', marginTop: '4px' }}>
                        {order.details.join(' | ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: order.timer < 15 ? '#ff3333' : '#00ffcc', fontWeight: 'bold' }}>
                        Pazienza: {order.timer}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery & Supply Panel */}
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '14px' }}>GESTIONE DINING ROOM & LOGISTICA:</h3>
            
            <button
              id="btn-deliver-order"
              className="btn-primary glow-magenta"
              onClick={handleDeliver}
              style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}
            >
              🛎️ CONSEGNA PIATTO CORRENTE
            </button>

            <span style={{ display: 'block', marginBottom: '10px', fontSize: '12px', color: '#88eeff' }}>INVIA FORNITURE AL CUOCO:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button id="btn-refill-buns" onClick={() => handleRefill('buns')} style={{ padding: '10px', background: '#112222', border: '1px solid #88eeff', borderRadius: '6px', color: '#88eeff', cursor: 'pointer' }}>
                Rifornisci Pane
              </button>
              <button id="btn-refill-meat" onClick={() => handleRefill('meat')} style={{ padding: '10px', background: '#112222', border: '1px solid #88eeff', borderRadius: '6px', color: '#88eeff', cursor: 'pointer' }}>
                Rifornisci Carne
              </button>
              <button id="btn-refill-potatoes" onClick={() => handleRefill('potatoes')} style={{ padding: '10px', background: '#112222', border: '1px solid #88eeff', borderRadius: '6px', color: '#88eeff', cursor: 'pointer' }}>
                Rifornisci Patate
              </button>
              <button id="btn-refill-lettuce" onClick={() => handleRefill('lettuce')} style={{ padding: '10px', background: '#112222', border: '1px solid #88eeff', borderRadius: '6px', color: '#88eeff', cursor: 'pointer' }}>
                Rifornisci Lattuga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILOT / COOK VIEW */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ background: 'rgba(10, 30, 40, 0.6)', border: '2px solid #00ffcc', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(0,255,204,0.2)' }}>
            <h2 style={{ color: '#00ffcc', marginTop: 0, borderBottom: '1px solid #00ffcc', paddingBottom: '8px', textAlign: 'center' }}>
              🍳 CUCINA & PREPARAZIONE
            </h2>

            {/* Inventories Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#aaa' }}>PAINE (BREAD)</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{levelState.buns}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#aaa' }}>CARNE (MEAT)</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{levelState.meat}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#aaa' }}>PATATE (POTATO)</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{levelState.potatoes}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#aaa' }}>LATTUGA (LETTUCE)</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{levelState.lettuce}</div>
              </div>
            </div>

            {/* Grill Station */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '10px' }}>STAZIONE PIASTRA / FRIGGITRICE:</span>
              
              {levelState.grillActive ? (
                <div>
                  <div style={{ fontSize: '16px', color: '#ffb700', fontWeight: 'bold', marginBottom: '8px' }}>
                    🔥 IN COTTURA: {levelState.grillProgress}%
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${levelState.grillProgress}%`, height: '100%', background: '#ffb700' }} />
                  </div>
                </div>
              ) : (
                <button
                  id="btn-start-grill"
                  onClick={handleStartGrill}
                  style={{ padding: '10px 25px', background: '#ffb700', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🔥 AVVIA PIASTRA & FRIGGITRICE
                </button>
              )}
            </div>

            {/* Assembly controls */}
            <div style={{ marginBottom: '25px' }}>
              <span style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#88eeff' }}>AGGIUNGI INGREDIENTE SUL PIATTO:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button id="btn-add-pane" onClick={() => handleAddIngredient('Pane')} style={{ padding: '12px', background: '#112222', border: '1px solid #00ffcc', borderRadius: '6px', color: '#00ffcc', fontWeight: 'bold', cursor: 'pointer' }}>
                  Aggiungi Pane
                </button>
                <button id="btn-add-carne" onClick={() => handleAddIngredient('Carne Cooked')} style={{ padding: '12px', background: '#112222', border: '1px solid #00ffcc', borderRadius: '6px', color: '#00ffcc', fontWeight: 'bold', cursor: 'pointer' }}>
                  Aggiungi Carne Cotta
                </button>
                <button id="btn-add-patatine" onClick={() => handleAddIngredient('Patatine Cooked')} style={{ padding: '12px', background: '#112222', border: '1px solid #00ffcc', borderRadius: '6px', color: '#00ffcc', fontWeight: 'bold', cursor: 'pointer' }}>
                  Aggiungi Patate Fritte
                </button>
                <button id="btn-add-lattuga" onClick={() => handleAddIngredient('Lattuga')} style={{ padding: '12px', background: '#112222', border: '1px solid #00ffcc', borderRadius: '6px', color: '#00ffcc', fontWeight: 'bold', cursor: 'pointer' }}>
                  Aggiungi Lattuga
                </button>
              </div>
            </div>

            {/* Current plate display */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px dashed #00ffcc', marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>COMPOSIZIONE PIATTO CORRENTE:</span>
              {levelState.currentPlate.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>Il piatto è vuoto. Aggiungi ingredienti!</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {levelState.currentPlate.map((ing, idx) => (
                    <div key={idx} style={{ background: '#00ffcc', color: '#000', padding: '5px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {ing.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              id="btn-clear-plate"
              onClick={handleClearPlate}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff3333', color: '#ff3333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🗑️ SVUOTA PIATTO
            </button>
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00', marginTop: '40px' }}>
          <h3>DISTURBO KITCHEN ATTIVO</h3>
          <p>Disattiva la piastra o confondi l'inventario delle forniture del cuoco.</p>
        </div>
      )}
    </div>
  );
};

export default Level17;
