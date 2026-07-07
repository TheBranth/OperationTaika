import React, { useState } from 'react';
import type { PlayerRole, Level18State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level18State;
  onAction: (actionType: string, payload: any) => void;
}

const PRODUCT_DATABASE: { [key: string]: string } = {
  'A1': 'Sciarpa Rossa', 'A2': 'Sciarpa Blu', 'A3': 'Sciarpa Verdi', 'A4': 'Cappello Rosso',
  'B1': 'Cappello Blu', 'B2': 'Cappello Verdi', 'B3': 'Guanti Rossi', 'B4': 'Guanti Blu',
  'C1': 'Guanti Verdi', 'C2': 'Giacca Rossa', 'C3': 'Giacca Blu', 'C4': 'Giacca Verde',
  'D1': 'Stivali Rossi', 'D2': 'Stivali Blu', 'D3': 'Stivali Verdi', 'D4': 'Ombrello Giallo'
};

export const Level18: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [rowInput, setRowInput] = useState<string | null>(null);
  const [colInput, setColInput] = useState<string | null>(null);

  const handleSatisfyRequest = (requestId: number) => {
    playClick();
    onAction('SATISFY_REQUEST', { requestId });
  };

  const handleKeypadPress = (type: 'row' | 'col', value: string) => {
    playClick();
    if (type === 'row') {
      setRowInput(value);
    } else {
      setColInput(value);
    }
  };

  const handleFetch = () => {
    if (!rowInput || !colInput) return;
    playClick();
    onAction('FETCH_ITEM', { slot: `${rowInput}${colInput}` });
    setRowInput(null);
    setColInput(null);
  };

  const handleReturn = () => {
    if (!rowInput || !colInput) return;
    playClick();
    onAction('PROCESS_RETURN', { slot: `${rowInput}${colInput}` });
    setRowInput(null);
    setColInput(null);
  };

  const handleClearPad = () => {
    playClick();
    setRowInput(null);
    setColInput(null);
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* HEADER DASHBOARD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <span style={{ color: '#aaa', fontSize: '12px' }}>ORDINI EVASI:</span>
          <div style={{ fontSize: '24px', color: '#00ffcc', fontWeight: 'bold' }}>
            {levelState.score} / 6
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#aaa', fontSize: '12px' }}>TEMPO RIMASTO:</span>
          <div style={{ fontSize: '24px', color: levelState.timeLeft < 30 ? '#ff3333' : '#ffb700', fontWeight: 'bold' }}>
            {levelState.timeLeft}s
          </div>
        </div>
      </div>

      {/* OPERATOR / FRONT DESK VIEW */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Shopping Requests */}
          <div className="glass-card" style={{ background: 'rgba(20, 10, 40, 0.6)', border: '2px solid #ff00ff', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(255,0,255,0.2)' }}>
            <h2 style={{ color: '#ff00ff', marginTop: 0, borderBottom: '1px solid #ff00ff', paddingBottom: '8px', textAlign: 'center' }}>
              🛍️ RICHIESTE DI ACQUISTO (NEGOZIO)
            </h2>

            {levelState.activeRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>Nessun cliente in negozio...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                {levelState.activeRequests.map((req) => {
                  const stockAvailable = levelState.inventoryStock[req.slot] || 0;
                  return (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px 18px', borderRadius: '8px', borderLeft: '4px solid #ff00ff' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                          {req.productName} (Scaffale: {req.slot})
                        </div>
                        <div style={{ fontSize: '12px', color: stockAvailable > 0 ? '#00ffcc' : '#ff3333', marginTop: '4px' }}>
                          Scorte in Cassa: {stockAvailable} {stockAvailable > 0 ? '(DISPONIBILE)' : '(ESAURITO! Chiedi al magazziniere)'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: req.timer < 15 ? '#ff3333' : '#ffb700' }}>
                          Pazienza: {req.timer}s
                        </span>
                        <button
                          id={`btn-satisfy-${req.id}`}
                          onClick={() => handleSatisfyRequest(req.id)}
                          disabled={stockAvailable <= 0}
                          style={{
                            padding: '6px 12px',
                            background: stockAvailable > 0 ? '#ff00ff' : '#444',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: stockAvailable > 0 ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Consegna
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Returns queue */}
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '14px' }}>CODA DEGLI ARTICOLI RESI:</h3>
            
            {levelState.returnsQueue.length === 0 ? (
              <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>Nessun reso in coda.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {levelState.returnsQueue.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,51,51,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,51,51,0.3)' }}>
                    <span style={{ color: '#fff' }}>{item.productName}</span>
                    <span style={{ color: '#ff3333', fontWeight: 'bold' }}>COLLOCA IN: {item.correctSlot}</span>
                  </div>
                ))}
                <p style={{ fontSize: '11px', color: '#aaa', marginTop: '10px', textAlign: 'center' }}>
                  Detta le coordinate del reso al magazziniere per catalogarlo nello slot corretto!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PILOT / WAREHOUSE VIEW */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ background: 'rgba(10, 30, 40, 0.6)', border: '2px solid #00ffcc', borderRadius: '12px', padding: '20px', boxShadow: '0 0 20px rgba(0,255,204,0.2)' }}>
            <h2 style={{ color: '#00ffcc', marginTop: 0, borderBottom: '1px solid #00ffcc', paddingBottom: '8px', textAlign: 'center' }}>
              📦 TASTIERINO DI STOCCAGGIO
            </h2>

            {/* Shelf Stock levels */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>GIACENZE SCAFFALATURE DI MAGAZZINO:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                {Object.entries(PRODUCT_DATABASE).map(([slot, name]) => {
                  const count = levelState.inventoryStock[slot] || 0;
                  return (
                    <div key={slot} style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffcc' }}>{slot}</div>
                      <div style={{ fontSize: '10px', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: count > 0 ? '#ffb700' : '#ff3333', fontWeight: 'bold', marginTop: '3px' }}>
                        Qta: {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input display */}
            <div style={{ background: '#000', padding: '15px', borderRadius: '8px', border: '1px solid #00ffcc', textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#aaa', marginBottom: '5px' }}>COORDINATA SELEZIONATA:</span>
              <div style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold', letterSpacing: '4px' }}>
                {rowInput || '_'}{colInput || '_'}
              </div>
            </div>

            {/* Keypad */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {/* Rows */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#aaa', textAlign: 'center' }}>RIGA:</span>
                {['A', 'B', 'C', 'D'].map((row) => (
                  <button
                    key={row}
                    id={`btn-row-${row}`}
                    onClick={() => handleKeypadPress('row', row)}
                    style={{
                      padding: '12px',
                      background: rowInput === row ? '#00ffcc' : '#112222',
                      border: '1px solid #00ffcc',
                      borderRadius: '6px',
                      color: rowInput === row ? '#000' : '#00ffcc',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {row}
                  </button>
                ))}
              </div>

              {/* Columns */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#aaa', textAlign: 'center' }}>COLONNA:</span>
                {['1', '2', '3', '4'].map((col) => (
                  <button
                    key={col}
                    id={`btn-col-${col}`}
                    onClick={() => handleKeypadPress('col', col)}
                    style={{
                      padding: '12px',
                      background: colInput === col ? '#00ffcc' : '#112222',
                      border: '1px solid #00ffcc',
                      borderRadius: '6px',
                      color: colInput === col ? '#000' : '#00ffcc',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                id="btn-fetch-item"
                className="btn-primary"
                onClick={handleFetch}
                style={{ flex: 1, padding: '15px', fontWeight: 'bold' }}
              >
                🚚 INVIA ALLA CASSA
              </button>
              <button
                id="btn-return-item"
                className="btn-primary glow-magenta"
                onClick={handleReturn}
                style={{ flex: 1, padding: '15px', fontWeight: 'bold' }}
              >
                📦 REGISTRA RESO
              </button>
            </div>
            <button
              id="btn-clear-keypad"
              onClick={handleClearPad}
              style={{ width: '100%', padding: '10px', marginTop: '15px', background: 'transparent', border: '1px solid #ff3333', color: '#ff3333', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cancella Input
            </button>
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00', marginTop: '40px' }}>
          <h3>DISTURBO LOGISTICO ATTIVO</h3>
          <p>Manda in tilt il nastro trasportatore o mescola temporaneamente le etichette degli scaffali.</p>
        </div>
      )}
    </div>
  );
};

export default Level18;
