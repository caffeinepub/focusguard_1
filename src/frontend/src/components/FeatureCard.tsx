import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  iconImage?: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, iconImage, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <Card 
      className="group border-border/50 bg-card hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in rounded-xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
          {iconImage ? (
            <img src={iconImage} alt={title} className="h-10 w-10" />
          ) : (
            icon
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
