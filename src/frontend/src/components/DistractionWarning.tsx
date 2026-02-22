import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DistractionWarningProps {
  type: 'phone' | 'sleeping' | 'face-not-detected' | 'not-seated';
  onDismiss: () => void;
}

export default function DistractionWarning({ type }: DistractionWarningProps) {
  const getWarningContent = () => {
    switch (type) {
      case 'phone':
        return {
          title: 'Put Your Phone Away',
          description: 'Phone detected — focus on your studies',
        };
      case 'sleeping':
        return {
          title: 'Stay Alert',
          description: 'Keep your head up and stay focused',
        };
      case 'face-not-detected':
        return {
          title: 'Return to Study',
          description: 'Face not detected — come back to your session',
        };
      case 'not-seated':
        return {
          title: 'Return to Your Seat',
          description: 'Please sit down and continue studying',
        };
      default:
        return {
          title: 'Back to Study',
          description: 'Stay focused on your studies',
        };
    }
  };

  const content = getWarningContent();

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-md rounded-2xl animate-scale-in">
        <AlertDialogHeader>
          <div className="mx-auto mb-4">
            <img
              src="/assets/generated/warning-distraction.dim_400x300.png"
              alt="Distraction"
              className="h-40 w-auto rounded-xl"
            />
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
