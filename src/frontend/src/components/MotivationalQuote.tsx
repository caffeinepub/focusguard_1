import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const quotes = [
  "The secret of getting ahead is getting started.",
  "Focus on being productive instead of busy.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
];

export default function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent rounded-xl shadow-soft">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Quote className="h-6 w-6 flex-shrink-0 text-accent" />
          <p className="text-base italic text-muted-foreground leading-relaxed">{currentQuote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
