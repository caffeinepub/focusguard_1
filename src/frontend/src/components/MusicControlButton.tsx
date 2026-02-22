import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MusicControlButtonProps {
  onClick: () => void;
  isPlaying: boolean;
}

export default function MusicControlButton({ onClick, isPlaying }: MusicControlButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="default"
      className={`gap-2 transition-all ${
        isPlaying 
          ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' 
          : 'hover:border-primary/50'
      }`}
    >
      <Music className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      Focus Music
    </Button>
  );
}
