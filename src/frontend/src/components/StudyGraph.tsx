import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudyGraphProps {
  data: Array<{ day: string; hours: number }>;
}

export default function StudyGraph({ data }: StudyGraphProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
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
            padding: '8px 12px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Study Time']}
        />
        <Bar 
          dataKey="hours" 
          fill="hsl(var(--primary))" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
