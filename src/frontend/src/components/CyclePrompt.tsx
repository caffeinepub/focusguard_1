import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CyclePromptProps {
  onStartNext: () => void;
  onSkip: () => void;
}

export default function CyclePrompt({ onStartNext, onSkip }: CyclePromptProps) {
  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Break Complete!</DialogTitle>
          <DialogDescription>
            Great job! You've completed your break. Ready to start the next study cycle?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onSkip}>
            End Session
          </Button>
          <Button onClick={onStartNext}>
            Start Next Cycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
