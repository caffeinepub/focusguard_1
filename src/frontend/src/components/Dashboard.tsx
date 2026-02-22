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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatTime(totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Across all sessions</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Focused Time</CardTitle>
            <Brain className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{formatTime(totalFocusedTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Pure concentration</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{focusScore}%</div>
            <Progress value={focusScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '150ms' }}>
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 bg-card">
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

        <Card className="rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Break Time</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalBreakTime)}</div>
            <p className="text-xs text-muted-foreground mt-2">Rest & recovery</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Distractions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistractionCount}</div>
            <p className="text-xs text-muted-foreground mt-2">{formatTime(totalDistractionTime)} lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl shadow-soft-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudyGraph data={weeklyStats} />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-soft-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoalSetting />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Tabs */}
      <Card className="rounded-xl shadow-soft-lg bg-card">
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-lg">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="trends" className="rounded-lg">Trends</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-lg">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Total Sessions</span>
                  </div>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Study Days This Week</span>
                  </div>
                  <p className="text-2xl font-bold">{studyDaysThisWeek}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {weeklyTrend >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Trend</p>
                      <p className="text-lg font-semibold">
                        {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'oklch(var(--card))',
                          border: '1px solid oklch(var(--border))',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar dataKey="hours" fill="oklch(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-6">
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.message}</p>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Complete more study sessions to unlock personalized insights
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
