import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'focusguard-app';

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>© {currentYear} FocusGuard. Built with</span>
          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse-subtle" />
          <span>using</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors duration-200"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
