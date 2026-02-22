import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Home, Timer, BarChart3 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center hover:opacity-80 transition-opacity duration-200"
        >
          <img 
            src="/assets/generated/focusguard-logo.dim_200x60.png" 
            alt="FocusGuard" 
            className="h-10 w-auto"
          />
        </button>
        
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="gap-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/timer' })}
            className="gap-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/dashboard' })}
            className="gap-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="ml-2 pl-2 border-l border-border/40">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
