import React, { useEffect } from 'react';
import type { Disruptions, PlayerRole } from './types';
import { startSiren, stopSiren } from './audio';

interface DisruptionOverlayProps {
  role: PlayerRole | null;
  disruptions: Disruptions;
}

export const DisruptionOverlay: React.FC<DisruptionOverlayProps> = ({
  role,
  disruptions,
}) => {
  const isOperator = role === 'operator';
  const isPilot = role === 'pilot';

  const nebbiaActive = disruptions.nebbiaArcana.active && isOperator;
  const inversionActive = disruptions.inversioneGravitazionale.active && isPilot;
  const alarmActive = disruptions.falsoAllarme.active;

  // Manage programmatic siren sound when Falso Allarme is active
  useEffect(() => {
    if (alarmActive) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
  }, [alarmActive]);

  return (
    <>
      {/* 1. Nebbia Arcana: Thick dark shifting mist covering ~60% of Operator screen */}
      {nebbiaActive && (
        <div
          id="nebbia-arcana-overlay"
          className="nebbia-arcana-overlay"
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(15, 5, 25, 0.98) 0%, rgba(25, 10, 45, 0.9) 60%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
            zIndex: 999,
            filter: 'blur(30px)',
            animation: 'mist-drift 7s infinite ease-in-out',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              background: 'rgba(5, 5, 10, 0.95)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: 'mist-spin 11s infinite linear',
            }}
          />
        </div>
      )}

      {/* 2. Inversione Gravitazionale: Notification status for Pilot */}
      {inversionActive && (
        <div
          id="inversione-assi-overlay"
          className="inversione-assi-overlay"
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 100, 0, 0.25)',
            border: '2px solid #ff6600',
            borderRadius: '8px',
            color: '#ffaa00',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            zIndex: 998,
            boxShadow: '0 0 15px rgba(255, 102, 0, 0.6)',
            animation: 'pulse-glow 1s infinite alternate',
            pointerEvents: 'none',
          }}
        >
          ⚠️ INVERSIONE COMANDI ATTIVA (5s) ⚠️
        </div>
      )}

      {/* 3. Falso Allarme: Flashing fake alarm screen for both players */}
      {alarmActive && (
        <div
          id="falso-allarme-overlay"
          className="falso-allarme-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 0, 0, 0.18)',
            border: '8px solid #ff0000',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'red-flash 0.5s infinite alternate',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 0, 0, 0.9)',
              border: '3px solid #ff0000',
              padding: '30px 50px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.8)',
              color: '#ff3333',
              fontFamily: 'monospace',
              pointerEvents: 'auto', // Allow it to block inputs/interactions visually
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px', animation: 'pulse-scale 0.5s infinite alternate' }}>🚨</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#ff0000', letterSpacing: '3px' }}>SOVRACCARICO CRITICO</h2>
            <p style={{ margin: 0, fontSize: '18px', color: '#ffaaaa' }}>Riavvio imminente!</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mist-drift {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.9; }
          50% { transform: scale(1.15) translate(-20px, 20px); opacity: 0.8; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.9; }
        }
        @keyframes mist-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes red-flash {
          0% { background-color: rgba(255, 0, 0, 0.05); }
          100% { background-color: rgba(255, 0, 0, 0.25); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 5px rgba(255, 102, 0, 0.4); }
          100% { box-shadow: 0 0 20px rgba(255, 102, 0, 0.9); }
        }
        @keyframes pulse-scale {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
};

export default DisruptionOverlay;
