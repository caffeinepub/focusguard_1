import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, Square } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import MotivationalQuote from './MotivationalQuote';
import CyclePrompt from './CyclePrompt';

interface StudyTimerProps {
  onSessionStart: () => void;
  onSessionStop: () => void;
  isSessionActive: boolean;
  faceDetected: boolean;
  phoneDetected: boolean;
  headDown: boolean;
  eyesOpen?: boolean;
  lookingAtScreen?: boolean;
  isSeated?: boolean;
  faceDetectionLost?: boolean;
  isMusicPlaying?: boolean;
}

export default function StudyTimer({
  onSessionStart,
  onSessionStop,
  isSessionActive,
  faceDetected,
  phoneDetected,
  headDown,
  isSeated = true,
  faceDetectionLost = false,
}: StudyTimerProps) {
  const [mode, setMode] = useState<'pomodoro' | 'custom'>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(true);
  const [showCyclePrompt, setShowCyclePrompt] = useState(false);

  const {
    timeRemaining,
    focusedTime,
    isRunning,
    isPaused,
    isBreak,
    cyclesCompleted,
    dailyStreak,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useTimer(mode, customMinutes);

  // Auto-pause when distractions detected
  useEffect(() => {
    if (isSessionActive && isRunning && !isPaused) {
      if (phoneDetected || !isSeated) {
        pauseTimer('detection');
      } else if (faceDetectionLost) {
        pauseTimer('detection');
      } else if (headDown) {
        pauseTimer('detection');
      }
    } else if (isSessionActive && isPaused) {
      if (faceDetected && !phoneDetected && !headDown && isSeated && !faceDetectionLost) {
        resumeTimer();
      }
    }
  }, [faceDetected, phoneDetected, headDown, isSeated, faceDetectionLost, isSessionActive, isRunning, isPaused]);

  // Handle cycle completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      if (isBreak) {
        if (autoCycleEnabled) {
          setShowCyclePrompt(true);
        } else {
          stopTimer();
          onSessionStop();
        }
      }
    }
  }, [timeRemaining, isRunning, isBreak, autoCycleEnabled]);

  const handleStart = () => {
    startTimer();
    onSessionStart();
  };

  const handleStop = () => {
    stopTimer();
    onSessionStop();
  };

  const handleCycleStart = () => {
    setShowCyclePrompt(false);
    startTimer();
  };

  const handleCycleSkip = () => {
    setShowCyclePrompt(false);
    stopTimer();
    onSessionStop();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <Card className="rounded-2xl shadow-soft-xl border-primary/20">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">Focus Timer</CardTitle>
          {dailyStreak > 0 && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <img src="/assets/generated/icon-streak.dim_64x64.png" alt="Streak" className="h-5 w-5" />
              {dailyStreak} day streak
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSessionActive && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as 'pomodoro' | 'custom')}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pomodoro">Pomodoro (25/5)</SelectItem>
                    <SelectItem value="custom">Custom Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === 'custom' && (
                <div className="space-y-3">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 25)}
                    className="rounded-lg"
                  />
                </div>
              )}

              {mode === 'pomodoro' && (
                <div className="flex items-center justify-between space-x-2 pt-8">
                  <Label htmlFor="auto-cycle" className="text-sm">Auto-cycle</Label>
                  <Switch
                    id="auto-cycle"
                    checked={autoCycleEnabled}
                    onCheckedChange={setAutoCycleEnabled}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-7xl sm:text-8xl font-mono font-bold tracking-tight">
                {formatTime(timeRemaining)}
              </div>
              {isBreak && (
                <p className="text-lg text-muted-foreground">Break Time</p>
              )}
              {isPaused && isSessionActive && (
                <p className="text-sm text-warning">Paused - Return to study</p>
              )}
            </div>

            <div className="flex gap-3">
              {!isSessionActive ? (
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="gap-2 px-8 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  Start Session
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => (isPaused ? resumeTimer() : pauseTimer('manual'))}
                    className="gap-2 px-6 rounded-xl"
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStop}
                    className="gap-2 px-6 rounded-xl"
                  >
                    <Square className="h-5 w-5" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>

          {isSessionActive && (
            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Focused Time</p>
                <p className="text-xl font-semibold">{formatDuration(focusedTime)}</p>
              </div>
              {mode === 'pomodoro' && (
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Cycles Completed</p>
                  <p className="text-xl font-semibold">{cyclesCompleted}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!isSessionActive && <MotivationalQuote />}

      {showCyclePrompt && (
        <CyclePrompt
          onStartNext={handleCycleStart}
          onSkip={handleCycleSkip}
        />
      )}
    </div>
  );
}
