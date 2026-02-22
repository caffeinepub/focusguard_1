import { useState, useEffect, useRef } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useDistractionDetection } from './useDistractionDetection';

export function useTimer(mode: 'pomodoro' | 'custom', customMinutes: number) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [distractionTime, setDistractionTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [pauseReason, setPauseReason] = useState<'manual' | 'detection' | 'distraction' | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const distractionStartRef = useRef<number>(0);

  const { isDistracted, distractionStartTime } = useDistractionDetection(isRunning);

  // Handle automatic pause/resume based on distraction detection
  useEffect(() => {
    if (!isRunning) return;

    if (isDistracted && !isPaused) {
      // Auto-pause due to distraction
      setIsPaused(true);
      setPauseReason('distraction');
      distractionStartRef.current = Date.now();
    } else if (!isDistracted && isPaused && pauseReason === 'distraction') {
      // Auto-resume when returning from distraction
      if (distractionStartRef.current) {
        const distractionDuration = Math.floor((Date.now() - distractionStartRef.current) / 1000);
        setDistractionTime((prev) => prev + distractionDuration);
      }
      setIsPaused(false);
      setPauseReason(null);
    }
  }, [isDistracted, isRunning, isPaused, pauseReason]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          if (!isBreak && mode === 'pomodoro') {
            // Start break
            setIsBreak(true);
            setCyclesCompleted((c) => c + 1);
            return 5 * 60; // 5 minute break
          } else {
            // End session
            setIsRunning(false);
            setIsBreak(false);
            return 0;
          }
        }
        return prev - 1;
      });

      if (!isPaused) {
        setFocusedTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, isBreak, mode]);

  const startTimer = () => {
    const duration = mode === 'pomodoro' ? 25 : customMinutes;
    setTimeRemaining(duration * 60);
    setFocusedTime(0);
    setPausedTime(0);
    setDistractionTime(0);
    setDistractionCount(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsBreak(false);
    setPauseReason(null);
    sessionStartRef.current = Date.now();
    startTimeRef.current = Date.now();
  };

  const pauseTimer = (reason: 'manual' | 'detection' = 'manual') => {
    setIsPaused(true);
    setPauseReason(reason);
    pauseStartRef.current = Date.now();
  };

  const resumeTimer = () => {
    if (pauseStartRef.current && pauseReason !== 'distraction') {
      const pauseDuration = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      setPausedTime((prev) => prev + pauseDuration);
    }
    setIsPaused(false);
    setPauseReason(null);
  };

  const incrementDistraction = () => {
    setDistractionCount((prev) => prev + 1);
  };

  const stopTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setPauseReason(null);
    
    // Record session to backend
    if (actor && identity && sessionStartRef.current) {
      try {
        const principal = identity.getPrincipal();
        const startTime = BigInt(sessionStartRef.current * 1000000);
        const endTime = BigInt(Date.now() * 1000000);
        const focusedDuration = BigInt(focusedTime * 1000000000);
        const pausedDuration = BigInt(pausedTime * 1000000000);
        const distractionTimeBigInt = BigInt(distractionTime * 1000000000);
        const distractions = BigInt(distractionCount);
        const distractionCountBigInt = BigInt(distractionCount);
        const isPomodoro = mode === 'pomodoro';
        const pomodoroCyclesCompleted = BigInt(cyclesCompleted);

        await actor.recordSession(
          principal,
          startTime,
          endTime,
          focusedDuration,
          pausedDuration,
          distractions,
          distractionCountBigInt,
          distractionTimeBigInt,
          isPomodoro,
          pomodoroCyclesCompleted
        );
      } catch (error) {
        console.error('Failed to record session:', error);
      }
    }
  };

  return {
    timeRemaining,
    focusedTime,
    pausedTime,
    distractionTime,
    isRunning,
    isPaused,
    isBreak,
    cyclesCompleted,
    dailyStreak,
    distractionCount,
    pauseReason,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    incrementDistraction,
  };
}
