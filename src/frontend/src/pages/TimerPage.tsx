import { useState, useCallback } from 'react';
import StudyTimer from '../components/StudyTimer';
import CameraMonitor from '../components/CameraMonitor';
import DistractionWarning from '../components/DistractionWarning';
import SiteBlockWarning from '../components/SiteBlockWarning';
import MusicPlayer from '../components/MusicPlayer';
import MusicControlButton from '../components/MusicControlButton';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useObjectDetection } from '../hooks/useObjectDetection';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useSiteBlocker } from '../hooks/useSiteBlocker';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export default function TimerPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showCameraMonitor, setShowCameraMonitor] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  
  const faceDetection = useFaceDetection(isSessionActive);
  const objectDetection = useObjectDetection(isSessionActive);
  const poseDetection = usePoseDetection(isSessionActive);
  const { blockedSiteDetected, blockedSiteName, remainingTime } = useSiteBlocker(isSessionActive);
  const { isPlaying } = useAudioPlayer();

  const handleSessionStart = async () => {
    setIsSessionActive(true);
    setShowCameraMonitor(true);
    await faceDetection.startDetection();
    await objectDetection.startDetection();
    await poseDetection.startDetection();
  };

  const handleSessionStop = () => {
    setIsSessionActive(false);
    setShowCameraMonitor(false);
    faceDetection.stopDetection();
    objectDetection.stopDetection();
    poseDetection.stopDetection();
  };

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    faceDetection.setVideoElement(video);
    objectDetection.setVideoElement(video);
    poseDetection.setVideoElement(video);
  }, []);

  const getDistractionType = (): 'phone' | 'sleeping' | 'face-not-detected' | 'not-seated' | null => {
    if (objectDetection.phoneDetected) return 'phone';
    if (!poseDetection.isSeated) return 'not-seated';
    if (faceDetection.faceDetectionLost) return 'face-not-detected';
    if (faceDetection.headDown) return 'sleeping';
    return null;
  };

  const distractionType = getDistractionType();
  const showDistraction = isSessionActive && distractionType !== null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)] bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container py-8">
        <div className="flex justify-end items-start mb-6">
          <MusicControlButton 
            onClick={() => setIsMusicPlayerOpen(true)}
            isPlaying={isPlaying}
          />
        </div>

        <StudyTimer
          onSessionStart={handleSessionStart}
          onSessionStop={handleSessionStop}
          isSessionActive={isSessionActive}
          faceDetected={faceDetection.faceDetected}
          phoneDetected={objectDetection.phoneDetected}
          headDown={faceDetection.headDown}
          eyesOpen={faceDetection.eyesOpen}
          isSeated={poseDetection.isSeated}
          faceDetectionLost={faceDetection.faceDetectionLost}
        />
      </div>

      {showCameraMonitor && (
        <CameraMonitor
          isActive={isSessionActive}
          faceDetected={faceDetection.faceDetected}
          phoneDetected={objectDetection.phoneDetected}
          headDown={faceDetection.headDown}
          eyesOpen={faceDetection.eyesOpen}
          isSeated={poseDetection.isSeated}
          onVideoReady={handleVideoReady}
        />
      )}

      {showDistraction && distractionType && (
        <DistractionWarning
          type={distractionType}
          onDismiss={() => {}}
        />
      )}

      {blockedSiteDetected && (
        <SiteBlockWarning
          siteName={blockedSiteName}
          remainingTime={remainingTime}
          onDismiss={() => {}}
        />
      )}

      <MusicPlayer 
        isSessionActive={isSessionActive}
        isOpen={isMusicPlayerOpen}
        onOpenChange={setIsMusicPlayerOpen}
      />
    </div>
  );
}
