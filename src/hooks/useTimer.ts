import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  autoStart?: boolean;
  onExpire?: () => void;
  warningThresholds?: number[]; // Seconds for warnings
  onWarning?: (remainingSeconds: number) => void;
}

export function useTimer(initialSeconds: number, options: UseTimerOptions = {}) {
  const {
    autoStart = false,
    onExpire,
    warningThresholds = [900, 600, 300, 60], // 15min, 10min, 5min, 1min
    onWarning,
  } = options;

  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningsGivenRef = useRef<Set<number>>(new Set());

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((seconds?: number) => {
    setRemainingSeconds(seconds ?? initialSeconds);
    setIsRunning(false);
    warningsGivenRef.current.clear();
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const newValue = prev - 1;

          // Check for warnings
          if (onWarning) {
            warningThresholds.forEach((threshold) => {
              if (newValue === threshold && !warningsGivenRef.current.has(threshold)) {
                warningsGivenRef.current.add(threshold);
                onWarning(newValue);
              }
            });
          }

          if (newValue <= 0) {
            setIsRunning(false);
            if (onExpire) {
              setTimeout(() => onExpire(), 100);
            }
            return 0;
          }

          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, onExpire, onWarning, warningThresholds]);

  return {
    remainingSeconds,
    isRunning,
    start,
    pause,
    reset,
  };
}
