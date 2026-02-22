import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import { useStudyGoals } from '../hooks/useStudyGoals';

export default function GoalSetting() {
  const { dailyGoal, setDailyGoal } = useStudyGoals();
  const [hours, setHours] = useState(Math.floor(dailyGoal / 60));
  const [minutes, setMinutes] = useState(dailyGoal % 60);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const totalMinutes = hours * 60 + minutes;
    setDailyGoal(totalMinutes);
    setIsEditing(false);
  };

  return (
    <Card className="rounded-xl shadow-soft-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Daily Study Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <p className="text-base">
              Current goal: <span className="font-bold">{Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m</span> per day
            </p>
            <Button onClick={() => setIsEditing(true)} className="rounded-lg">Edit</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="rounded-lg">Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
