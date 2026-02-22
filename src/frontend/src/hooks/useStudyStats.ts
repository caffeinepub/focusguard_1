import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StudySession } from '../backend';

interface WeeklyStatItem {
  day: string;
  hours: number;
}

interface DailyStatItem {
  day: string;
  hours: number;
  date: Date;
}

interface PerformanceInsight {
  type: 'productivity' | 'consistency' | 'focus' | 'recommendation';
  title: string;
  message: string;
  icon: string;
}

export function useStudyStats() {
  const { actor, isFetching } = useActor();

  const { data: sessions = [], isLoading } = useQuery<StudySession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });

  // Calculate daily hours
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(Number(s.startTime) / 1000000);
    return sessionDate >= today;
  });
  const dailyHours = todaySessions.reduce((acc, s) => {
    return acc + Number(s.focusedDuration) / 3600000000000;
  }, 0);

  // Calculate total study time across all sessions
  const totalStudyTime = sessions.reduce((acc, s) => {
    return acc + Number(s.focusedDuration) / 3600000000000;
  }, 0);

  // Calculate total focused time
  const totalFocusedTime = sessions.reduce((acc, s) => {
    return acc + Number(s.focusedDuration) / 3600000000000;
  }, 0);

  // Calculate total break time (paused duration)
  const totalBreakTime = sessions.reduce((acc, s) => {
    return acc + Number(s.pausedDuration) / 3600000000000;
  }, 0);

  // Calculate total distraction time
  const totalDistractionTime = sessions.reduce((acc, s) => {
    return acc + Number(s.distractionTime || 0n) / 3600000000000;
  }, 0);

  // Calculate total distraction count
  const totalDistractionCount = sessions.reduce((acc, s) => {
    return acc + Number(s.distractionCount);
  }, 0);

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyStats: WeeklyStatItem[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(Number(s.startTime) / 1000000);
      return sessionDate >= day && sessionDate < nextDay;
    });
    
    const hours = daySessions.reduce((acc, s) => {
      return acc + Number(s.focusedDuration) / 3600000000000;
    }, 0);
    
    weeklyStats.push({
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat(hours.toFixed(1)),
    });
  }

  // Calculate daily stats for the current week (last 7 days)
  const dailyStats: DailyStatItem[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(Number(s.startTime) / 1000000);
      return sessionDate >= day && sessionDate < nextDay;
    });
    
    const hours = daySessions.reduce((acc, s) => {
      return acc + Number(s.focusedDuration) / 3600000000000;
    }, 0);
    
    dailyStats.push({
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat(hours.toFixed(2)),
      date: day,
    });
  }

  // Calculate focus score
  const totalFocused = sessions.reduce((acc, s) => acc + Number(s.focusedDuration), 0);
  const totalPaused = sessions.reduce((acc, s) => acc + Number(s.pausedDuration), 0);
  const totalTime = totalFocused + totalPaused;
  const focusScore = totalTime > 0 ? Math.round((totalFocused / totalTime) * 100) : 0;

  // Calculate streak
  let streak = 0;
  const sortedDates = [...new Set(
    sessions.map((s) => {
      const d = new Date(Number(s.startTime) / 1000000);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  )].sort((a, b) => b - a);

  if (sortedDates.length > 0) {
    const todayTime = today.getTime();
    if (sortedDates[0] === todayTime) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const expectedDate = todayTime - i * 86400000;
        if (sortedDates[i] === expectedDate) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate consistency (days studied in current week)
  const studyDaysThisWeek = dailyStats.filter(d => d.hours > 0).length;

  // Analyze most productive study hours
  const hourlyProductivity: { [hour: number]: number } = {};
  sessions.forEach((s) => {
    const sessionDate = new Date(Number(s.startTime) / 1000000);
    const hour = sessionDate.getHours();
    const focusedHours = Number(s.focusedDuration) / 3600000000000;
    hourlyProductivity[hour] = (hourlyProductivity[hour] || 0) + focusedHours;
  });

  const mostProductiveHour = Object.entries(hourlyProductivity)
    .sort(([, a], [, b]) => b - a)[0];

  // Generate performance insights
  const insights: PerformanceInsight[] = [];

  // Productivity insight
  if (mostProductiveHour && sessions.length >= 5) {
    const hour = parseInt(mostProductiveHour[0]);
    const timeLabel = hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
    insights.push({
      type: 'productivity',
      title: 'Peak Performance Time',
      message: `You're most productive around ${timeLabel}. Schedule important tasks during this window.`,
      icon: '🎯',
    });
  }

  // Consistency insight
  if (studyDaysThisWeek >= 5) {
    insights.push({
      type: 'consistency',
      title: 'Excellent Consistency',
      message: `You've studied ${studyDaysThisWeek} days this week! Keep up the amazing routine.`,
      icon: '🔥',
    });
  } else if (studyDaysThisWeek >= 3) {
    insights.push({
      type: 'consistency',
      title: 'Good Progress',
      message: `${studyDaysThisWeek} study days this week. Try to reach 5 days for optimal results.`,
      icon: '📈',
    });
  }

  // Focus quality insight
  if (focusScore >= 80) {
    insights.push({
      type: 'focus',
      title: 'Outstanding Focus',
      message: `${focusScore}% focus score shows excellent concentration. You're in the zone!`,
      icon: '🧠',
    });
  } else if (focusScore >= 60) {
    insights.push({
      type: 'focus',
      title: 'Good Focus',
      message: `${focusScore}% focus score. Consider reducing distractions to reach 80%+.`,
      icon: '💡',
    });
  }

  // Distraction insight
  if (totalDistractionTime > 0) {
    const distractionPercentage = Math.round((totalDistractionTime / (totalStudyTime + totalDistractionTime)) * 100);
    if (distractionPercentage > 20) {
      insights.push({
        type: 'recommendation',
        title: 'Reduce Distractions',
        message: `${distractionPercentage}% of your time is spent distracted. Try using website blockers or turning off notifications.`,
        icon: '⚠️',
      });
    }
  }

  // Recommendation based on study patterns
  if (sessions.length >= 10) {
    const avgSessionDuration = totalStudyTime / sessions.length;
    if (avgSessionDuration < 0.5) {
      insights.push({
        type: 'recommendation',
        title: 'Extend Study Sessions',
        message: 'Your sessions average under 30 minutes. Try 45-60 minute focused blocks for deeper work.',
        icon: '⏱️',
      });
    }
  }

  // Calculate weekly trend
  const lastWeekStats = weeklyStats.slice(0, 7);
  const thisWeekTotal = lastWeekStats.reduce((acc, stat) => acc + stat.hours, 0);
  
  // Get previous week for comparison
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const previousWeekSessions = sessions.filter((s) => {
    const sessionDate = new Date(Number(s.startTime) / 1000000);
    return sessionDate >= twoWeeksAgo && sessionDate < weekAgo;
  });
  const previousWeekTotal = previousWeekSessions.reduce((acc, s) => {
    return acc + Number(s.focusedDuration) / 3600000000000;
  }, 0);

  const weeklyTrend = previousWeekTotal > 0 
    ? Math.round(((thisWeekTotal - previousWeekTotal) / previousWeekTotal) * 100)
    : 0;

  return {
    dailyHours,
    weeklyStats,
    dailyStats,
    focusScore,
    streak,
    sessions,
    isLoading,
    totalStudyTime,
    totalFocusedTime,
    totalBreakTime,
    totalDistractionTime,
    totalDistractionCount,
    studyDaysThisWeek,
    insights,
    weeklyTrend,
  };
}
