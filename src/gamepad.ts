import { useEffect, useRef } from 'react';

export function useGamepadDebug(onToggleDrawer: () => void) {
  const onToggleRef = useRef(onToggleDrawer);
  onToggleRef.current = onToggleDrawer;

  const holdTimeRef = useRef<number>(0);
  const wasTriggeredRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let animFrameId: number;

    const pollGamepad = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let buttonsPressed = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp) {
          // Standard Gamepad mapping:
          // Button 10 is Left Stick Click (L3)
          // Button 11 is Right Stick Click (R3)
          const l3 = gp.buttons[10];
          const r3 = gp.buttons[11];

          if (l3 && r3 && l3.pressed && r3.pressed) {
            buttonsPressed = true;
            break;
          }
        }
      }

      if (buttonsPressed) {
        if (!wasTriggeredRef.current) {
          holdTimeRef.current += deltaTime;
          if (holdTimeRef.current >= 1500) { // 1.5 seconds hold
            onToggleRef.current();
            wasTriggeredRef.current = true; // Lock until release
          }
        }
      } else {
        holdTimeRef.current = 0;
        wasTriggeredRef.current = false; // Unlock when released
      }

      animFrameId = requestAnimationFrame(pollGamepad);
    };

    animFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);
}
export default useGamepadDebug;
