import React from 'react';
import type { PlayerRole, Level13State } from '../types';
import { playClick } from '../audio';

interface LevelProps {
  role: PlayerRole | null;
  levelState: Level13State;
  onAction: (actionType: string, payload: any) => void;
}

export const Level13: React.FC<LevelProps> = ({ role, levelState, onAction }) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const { targetFreq, targetAmp, currentFreq, currentAmp } = levelState;

  // Generate SVG path for a sine wave
  const generateSinePath = (freq: number, amp: number) => {
    const width = 400;
    const height = 120;
    const points: string[] = [];
    const step = 2;
    for (let x = 0; x <= width; x += step) {
      // Scale frequency to fit, amplitude to fit
      const y = height / 2 + Math.sin((x / width) * Math.PI * 2 * (freq / 12)) * (amp * 10);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const handleAdjust = (param: 'freq' | 'amp', amount: number) => {
    playClick();
    if (param === 'freq') {
      const nextFreq = Math.min(100, Math.max(10, currentFreq + amount * 5));
      onAction('TUNE', { freq: nextFreq, amp: currentAmp });
    } else {
      const nextAmp = Math.min(5.0, Math.max(1.0, parseFloat((currentAmp + amount * 0.5).toFixed(1))));
      onAction('TUNE', { freq: currentFreq, amp: nextAmp });
    }
  };

  const handleSubmit = () => {
    playClick();
    onAction('SUBMIT', {});
  };

  const isMatched = Math.abs(currentFreq - targetFreq) <= 3 && Math.abs(currentAmp - targetAmp) <= 0.2;

  return (
    <div className="level-container" style={{ padding: '20px', color: '#fff', fontFamily: 'monospace' }}>
      {/* P1: Operator View (Oscilloscope Target Wave) */}
      {isOperator && (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--neon-magenta)' }}>📟 ANALIZZATORE DI SPETTRO</h2>

          <div style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid #555', borderRadius: '8px', padding: '15px', position: 'relative', overflow: 'hidden', marginBottom: '25px' }}>
            {/* Grid overlay for cathode-ray tube oscilloscope look */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
              }}
            />
            
            <svg width="100%" height="120" style={{ display: 'block' }}>
              <path
                id="l13-target-wave-path"
                d={generateSinePath(targetFreq, targetAmp)}
                fill="none"
                stroke="#ffb700"
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 5px #ffb700)' }}
              />
            </svg>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '10px' }}>TARGET ONDE: ONDA QUADRA SINUSOIDALE</div>
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <div>FREQ TARGET: <span style={{ color: '#ffb700', fontWeight: 'bold' }}>{targetFreq} Hz</span></div>
            <div>AMP TARGET: <span style={{ color: '#ffb700', fontWeight: 'bold' }}>{targetAmp} V</span></div>
          </div>
        </div>
      )}

      {/* P2: Pilot View (Interactive Modulator Controls) */}
      {isPilot && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(20, 10, 40, 0.6)', border: '2px solid var(--neon-cyan)', borderRadius: '12px', padding: '25px', boxShadow: '0 0 25px rgba(0, 255, 204, 0.2)' }}>
          <h2 style={{ color: 'var(--neon-cyan)', marginTop: 0, textAlign: 'center', borderBottom: '1px solid var(--neon-cyan)', paddingBottom: '10px' }}>
            🎛️ MODULATORE DI FREQUENZE
          </h2>

          <div style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid #00ffcc', borderRadius: '8px', padding: '15px', position: 'relative', overflow: 'hidden', marginBottom: '25px' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(0,255,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
              }}
            />
            
            <svg width="100%" height="120" style={{ display: 'block' }}>
              <path
                id="l13-current-wave-path"
                d={generateSinePath(currentFreq, currentAmp)}
                fill="none"
                stroke={isMatched ? '#00ffcc' : '#ff0055'}
                strokeWidth="3"
                style={{ filter: `drop-shadow(0 0 5px ${isMatched ? '#00ffcc' : '#ff0055'})` }}
              />
            </svg>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '10px' }}>SPETTRO DI RICEZIONE ATTUALE</div>
          </div>

          {/* Dial knobs */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            {/* Frequency Control */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>FREQUENZA (Hz)</div>
              <div id="l13-val-freq" style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>{currentFreq}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  id="l13-dec-freq"
                  onClick={() => handleAdjust('freq', -1)}
                  style={{ width: '36px', height: '36px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <button
                  id="l13-inc-freq"
                  onClick={() => handleAdjust('freq', 1)}
                  style={{ width: '36px', height: '36px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Amplitude Control */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>AMPIEZZA (V)</div>
              <div id="l13-val-amp" style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>{currentAmp}</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  id="l13-dec-amp"
                  onClick={() => handleAdjust('amp', -1)}
                  style={{ width: '36px', height: '36px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  -
                </button>
                <button
                  id="l13-inc-amp"
                  onClick={() => handleAdjust('amp', 1)}
                  style={{ width: '36px', height: '36px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            id="l13-submit"
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: isMatched ? 'var(--neon-cyan)' : '#333',
              border: 'none',
              borderRadius: '6px',
              color: isMatched ? '#000' : '#888',
              fontSize: '18px',
              padding: '12px',
              cursor: isMatched ? 'pointer' : 'not-allowed',
              boxShadow: isMatched ? '0 0 15px var(--neon-cyan)' : 'none',
              fontWeight: 'bold',
            }}
            disabled={!isMatched}
          >
            SINTONIZZA CANALE
          </button>
        </div>
      )}

      {/* Patron View */}
      {role === 'patron' && (
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <h3>FLUSSO DI FREQUENZE DEBOLE...</h3>
          <p>Supervisiona il sintonizzatore della radio.</p>
        </div>
      )}
    </div>
  );
};

export default Level13;
