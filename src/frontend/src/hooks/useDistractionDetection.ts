import { useEffect, useState, useRef } from 'react';

interface DistractionDetectionResult {
  isDistracted: boolean;
  distractionStartTime: number | null;
}

export function useDistractionDetection(isActive: boolean): DistractionDetectionResult {
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionStartTime, setDistractionStartTime] = useState<number | null>(null);
  const wasDistractedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setIsDistracted(false);
      setDistractionStartTime(null);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from the app
        if (!wasDistractedRef.current) {
          setIsDistracted(true);
          setDistractionStartTime(Date.now());
          wasDistractedRef.current = true;
        }
      } else {
        // User returned to the app
        if (wasDistractedRef.current) {
          setIsDistracted(false);
          setDistractionStartTime(null);
          wasDistractedRef.current = false;
        }
      }
    };

    const handleBlur = () => {
      // Window lost focus
      if (!wasDistractedRef.current) {
        setIsDistracted(true);
        setDistractionStartTime(Date.now());
        wasDistractedRef.current = true;
      }
    };

    const handleFocus = () => {
      // Window gained focus
      if (wasDistractedRef.current) {
        setIsDistracted(false);
        setDistractionStartTime(null);
        wasDistractedRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isActive]);

  return {
    isDistracted,
    distractionStartTime,
  };
}
