import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, TrendingUp, Clock, Coffee, AlertTriangle, Brain, Calendar, TrendingDown, Award, Timer } from 'lucide-react';
import { useStudyStats } from '../hooks/useStudyStats';
import { useStudyGoals } from '../hooks/useStudyGoals';
import StudyGraph from './StudyGraph';
import GoalSetting from './GoalSetting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const {
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
  } = useStudyStats();

  const { dailyGoal, progress, goalAchieved } = useStudyGoals();

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading your stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and achievements</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatTime(totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Across all sessions</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Focused Time</CardTitle>
            <Brain className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{formatTime(totalFocusedTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Pure concentration</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{focusScore}%</div>
            <Progress value={focusScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <img src="/assets/generated/icon-streak.dim_64x64.png" alt="Streak" className="h-10 w-10" />
              <div className="text-3xl font-bold">{streak}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Consecutive days</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(dailyHours)}</div>
            <Progress value={progress} className="mt-3" />
            {goalAchieved && (
              <p className="text-xs text-success mt-2 font-medium">🎉 Goal achieved!</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Break Time</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalBreakTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Rest & recovery</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Distractions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistractionCount}</div>
            {totalDistractionTime > 0 && (
              <p className="text-xs text-warning mt-2">{formatTime(totalDistractionTime)} away</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card className="border-accent/30 rounded-xl shadow-soft-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200 hover:shadow-soft"
                >
                  <div className="text-2xl flex-shrink-0">{insight.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Setting */}
      <GoalSetting />

      {/* Progress Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl shadow-soft-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Progress
              </span>
              {weeklyTrend !== 0 && (
                <span className={`text-sm flex items-center gap-1 ${weeklyTrend > 0 ? 'text-success' : 'text-warning'}`}>
                  {weeklyTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(weeklyTrend)}% vs last week
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value.toFixed(2)} hours`, 'Study Time']}
                />
                <Bar 
                  dataKey="hours" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {studyDaysThisWeek} of 7 days this week
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudyGraph data={weeklyStats} />
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="rounded-lg">
          <TabsTrigger value="history" className="rounded-lg">Recent Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card className="rounded-xl shadow-soft-lg">
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No sessions yet. Start studying to see your history!
                  </p>
                ) : (
                  sessions.slice(0, 10).map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200 hover:shadow-soft"
                    >
                      <div>
                        <p className="font-medium">
                          {session.isPomodoro ? '🍅 Pomodoro' : '⏱️ Custom'} Session
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Number(session.startTime) / 1000000).toLocaleDateString()} at{' '}
                          {new Date(Number(session.startTime) / 1000000).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">
                          {Math.floor(Number(session.focusedDuration) / 60000000000)}m focused
                        </p>
                        {Number(session.distractionCount) > 0 && (
                          <p className="text-xs text-warning">
                            {Number(session.distractionCount)} distractions
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
