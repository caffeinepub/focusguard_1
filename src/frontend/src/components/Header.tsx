import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Home, Timer, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/timer' })}
            className="gap-2"
          >
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/dashboard' })}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
