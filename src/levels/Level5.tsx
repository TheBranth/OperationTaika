import React, { useState, useEffect, useRef } from 'react';
import type { PlayerRole, Level5State } from '../types';
import { playClick, playOink } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level5State;
  onAction: (actionType: string, payload: any) => void;
}

const MORSE_KEY: { [key: string]: string } = {
  'A': '• —',
  'C': '— • — •',
  'G': '— — •',
  'I': '• •',
  'L': '• — • •',
  'M': '— —',
  'N': '— •',
  'O': '— — —',
  'P': '• — — •',
  'R': '• — •',
  'V': '• • • —',
  'Z': '— — • •',
};

export const Level5: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const [inputWord, setInputWord] = useState('');
  const [flashActive, setFlashActive] = useState(false);
  const prevPulsesLength = useRef(levelState.sentPulses.length);

  // Play audio and visual flash on Client (P2) when a new pulse is received
  useEffect(() => {
    const pulses = levelState.sentPulses;
    if (pulses.length > prevPulsesLength.current) {
      const newPulse = pulses[pulses.length - 1];
      const isLong = newPulse === 'lungo';
      
      // Play oink sound
      playOink(isLong);

      // Trigger visual flash
      setFlashActive(true);
      const timer = setTimeout(() => {
        setFlashActive(false);
      }, isLong ? 600 : 150);

      prevPulsesLength.current = pulses.length;
      return () => clearTimeout(timer);
    } else if (pulses.length === 0) {
      prevPulsesLength.current = 0;
    }
  }, [levelState.sentPulses]);

  const sendPulse = (type: 'breve' | 'lungo') => {
    playOink(type === 'lungo');
    onAction('SEND_PULSE', { type });
  };

  const clearPulses = () => {
    playClick();
    onAction('CLEAR_PULSES', {});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    onAction('SUBMIT_WORD', { word: inputWord.toUpperCase().trim() });
    setInputWord('');
  };

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      <h2 style={{ textAlign: 'center', color: '#00ffcc', margin: '0 0 25px 0' }}>🐖 CODICE MORSE-OINK</h2>

      {/* OPERATOR VIEW: Transmitter */}
      {isOperator && (
        <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <div className="panel" style={{ background: 'rgba(183, 0, 255, 0.1)', border: '2px solid #b700ff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffb700' }}>PAROLA SEGRETA DA TRASMETTERE:</h4>
            <div id="l5-secret-word" style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff', letterSpacing: '4px', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
              {levelState.secretWord}
            </div>
          </div>

          <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>
            Invia la parola d'accesso trasmettendo gli impulsi di Oink!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '25px' }}>
            <button
              id="l5-btn-breve"
              onClick={() => sendPulse('breve')}
              style={{
                flex: 1,
                padding: '20px',
                background: '#110522',
                border: '2px solid #b700ff',
                borderRadius: '8px',
                color: '#b700ff',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(183,0,255,0.2)',
              }}
            >
              • Oink Breve (0.2s)
            </button>
            <button
              id="l5-btn-lungo"
              onClick={() => sendPulse('lungo')}
              style={{
                flex: 1,
                padding: '20px',
                background: '#110522',
                border: '2px solid #b700ff',
                borderRadius: '8px',
                color: '#b700ff',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(183,0,255,0.2)',
              }}
            >
              — Oink Lungo (0.8s)
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px 15px', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Sequenza inviata: {levelState.sentPulses.map(p => p === 'breve' ? '•' : '—').join(' ')}
            </div>
            <button
              id="l5-clear-btn"
              onClick={clearPulses}
              style={{
                background: 'transparent',
                border: '1px solid #ff3333',
                color: '#ff3333',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Cancella
            </button>
          </div>
        </div>
      )}

      {/* PILOT VIEW: Receiver */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap-reverse' }}>
          {/* Form and Flashing bulb */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            {/* Visual Flash Indicator */}
            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid #00ffcc',
                borderRadius: '10px',
                padding: '25px',
                textAlign: 'center',
                marginBottom: '20px',
                boxShadow: flashActive ? '0 0 35px #00ffcc' : 'none',
                transition: 'all 0.1s ease',
              }}
            >
              <div style={{ fontSize: '13px', color: '#88eeff', marginBottom: '15px' }}>RICEVITORE IMPULSI</div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  margin: '0 auto',
                  background: flashActive ? '#00ffcc' : '#001a14',
                  boxShadow: flashActive ? '0 0 25px #00ffcc' : 'inset 0 0 10px rgba(0,255,204,0.1)',
                  border: '2px solid #00ffcc',
                  transition: 'background-color 0.05s ease',
                }}
              />
              <div style={{ fontSize: '13px', color: '#aaa', marginTop: '15px' }}>
                Codici ricevuti: {levelState.sentPulses.map(p => p === 'breve' ? '•' : '—').join(' ')}
              </div>
            </div>

            {/* Input Submission */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ color: '#00ffcc', fontSize: '13px' }}>
                Digita la parola decifrata dai richiami di Taika:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="l5-word-input"
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    background: '#110522',
                    border: '2px solid #00ffcc',
                    borderRadius: '4px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '16px',
                    textAlign: 'center',
                  }}
                  placeholder="PAROLA SEGRETA..."
                />
                <button
                  id="l5-submit-btn"
                  type="submit"
                  style={{
                    background: '#00ffcc',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  INVIA
                </button>
              </div>
            </form>
          </div>

          {/* Decoding key manual */}
          <div style={{ width: '250px', background: 'rgba(0,0,0,0.3)', border: '1px solid #555', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffb700', textAlign: 'center' }}>TABELLA DI DECODIFICA</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              {Object.entries(MORSE_KEY).map(([letter, code]) => (
                <div key={letter} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3px' }}>
                  <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{letter}</span>
                  <span style={{ color: '#fff' }}>{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PATRON VIEW */}
      {role === 'patron' && (
        <div style={{ color: '#888' }}>
          <h3>INTERCETTATORE DI TRASMISSIONI</h3>
          <p>Scatena falsi allarmi audio per confondere la decodifica.</p>
        </div>
      )}
    </div>
  );
};

export default Level5;
