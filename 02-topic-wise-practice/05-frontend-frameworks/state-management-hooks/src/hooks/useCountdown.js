import { useState, useEffect, useRef } from 'react';

// Custom hook: counts down from "seconds" while "running" is true and calls onExpire at zero.
// The timer starts again whenever resetKey changes (here: the question number).
export default function useCountdown(seconds, onExpire, running, resetKey) {
  const [timer, setTimer] = useState({ key: resetKey, left: seconds });
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire; // always call the latest callback

  // If the key changed, this render already uses a fresh timer
  const left = timer.key === resetKey ? timer.left : seconds;

  useEffect(() => {
    if (!running) return;
    if (left === 0) {
      expireRef.current();
      return;
    }
    const id = setTimeout(() => setTimer({ key: resetKey, left: left - 1 }), 1000);
    return () => clearTimeout(id); // cleanup stops the old timer
  }, [left, running, resetKey]);

  return left;
}
