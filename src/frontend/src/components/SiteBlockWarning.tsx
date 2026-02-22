import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface SiteBlockWarningProps {
  siteName: string;
  remainingTime: number;
  onDismiss: () => void;
}

export default function SiteBlockWarning({ siteName, remainingTime, onDismiss }: SiteBlockWarningProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-2xl">
            Stay Focused!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-center">
            <p className="text-lg">
              Access to <span className="font-semibold text-foreground">{siteName}</span> is blocked during your study session.
            </p>
            <p className="text-base">
              Come back after your session ends.
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-xl font-mono">{formatTime(remainingTime)}</span>
              <span>remaining</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>
            Back to Timer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
