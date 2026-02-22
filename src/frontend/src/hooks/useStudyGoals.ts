import { useState, useEffect } from 'react';

const STORAGE_KEY = 'focusguard_daily_goal';

export function useStudyGoals() {
  const [dailyGoal, setDailyGoalState] = useState(120); // Default 2 hours in minutes

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDailyGoalState(parseInt(stored));
    }
  }, []);

  const setDailyGoal = (minutes: number) => {
    setDailyGoalState(minutes);
    localStorage.setItem(STORAGE_KEY, minutes.toString());
  };

  // This would be calculated from actual study data
  const progress = 0;
  const goalAchieved = progress >= 100;

  return {
    dailyGoal,
    setDailyGoal,
    progress,
    goalAchieved,
  };
}
