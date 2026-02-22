import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Minimize2, Maximize2, User, UserX, Smartphone, Armchair } from 'lucide-react';
import { useCamera } from '../camera/useCamera';

interface CameraMonitorProps {
  isActive: boolean;
  faceDetected: boolean;
  phoneDetected: boolean;
  headDown: boolean;
  eyesOpen?: boolean;
  lookingAtScreen?: boolean;
  isSeated?: boolean;
  onVideoReady: (video: HTMLVideoElement) => void;
}

export default function CameraMonitor({
  isActive,
  faceDetected,
  phoneDetected,
  isSeated = true,
  onVideoReady,
}: CameraMonitorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const videoReadyRef = useRef(false);

  const {
    isActive: cameraActive,
    isSupported,
    error,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'user',
    width: 640,
    height: 480,
  });

  useEffect(() => {
    if (isActive && !cameraActive) {
      startCamera();
    } else if (!isActive && cameraActive) {
      stopCamera();
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current && cameraActive && !videoReadyRef.current) {
      const video = videoRef.current;
      const handleCanPlay = () => {
        if (!videoReadyRef.current) {
          videoReadyRef.current = true;
          onVideoReady(video);
        }
      };
      video.addEventListener('canplay', handleCanPlay);
      if (video.readyState >= 2) {
        handleCanPlay();
      }
      return () => video.removeEventListener('canplay', handleCanPlay);
    }
  }, [cameraActive, onVideoReady]);

  if (!isSupported) {
    return null;
  }

  if (error) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
        <Card className="w-80 border-destructive/50 rounded-xl shadow-soft-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isMinimized ? 'animate-scale-in' : 'animate-slide-up'}`}>
      <Card className={`border-primary/30 rounded-xl shadow-soft-xl backdrop-blur-sm bg-card/95 ${isMinimized ? 'w-auto' : 'w-80'}`}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 rounded-lg"
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </Button>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={faceDetected ? "default" : "secondary"} className="gap-1.5 rounded-lg">
                {faceDetected ? <User className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                {faceDetected ? 'Present' : 'Not detected'}
              </Badge>
              
              {phoneDetected && (
                <Badge variant="destructive" className="gap-1.5 rounded-lg">
                  <Smartphone className="h-3 w-3" />
                  Phone
                </Badge>
              )}
              
              {!isSeated && (
                <Badge variant="destructive" className="gap-1.5 rounded-lg">
                  <Armchair className="h-3 w-3" />
                  Not seated
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
