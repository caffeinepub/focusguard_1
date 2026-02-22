import { useState, useEffect, useRef } from 'react';

interface PoseDetectionState {
  isSeated: boolean;
  poseConfidence: number;
}

export function usePoseDetection(isActive: boolean) {
  const [state, setState] = useState<PoseDetectionState>({
    isSeated: true,
    poseConfidence: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seatedHistoryRef = useRef<boolean[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baselineRef = useRef<{ topMiddleRatio: number; samples: number }>({ topMiddleRatio: 0, samples: 0 });

  // Analyze video frame for vertical distribution to detect seated vs standing
  const analyzePosture = (video: HTMLVideoElement, canvas: HTMLCanvasElement): { isSeated: boolean; confidence: number } => {
    if (!video || video.readyState !== 4) {
      return { isSeated: true, confidence: 0 };
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { isSeated: true, confidence: 0 };

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze vertical distribution of brightness with optimized sampling
      const topThird = Math.floor(canvas.height / 3);
      const middleThird = Math.floor(canvas.height * 2 / 3);
      
      let topBrightness = 0;
      let middleBrightness = 0;
      let bottomBrightness = 0;
      let topPixels = 0;
      let middlePixels = 0;
      let bottomPixels = 0;
      
      // Optimized sampling with larger steps for better performance
      for (let y = 0; y < canvas.height; y += 10) {
        for (let x = 0; x < canvas.width; x += 10) {
          const i = (y * canvas.width + x) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (y < topThird) {
            topBrightness += brightness;
            topPixels++;
          } else if (y < middleThird) {
            middleBrightness += brightness;
            middlePixels++;
          } else {
            bottomBrightness += brightness;
            bottomPixels++;
          }
        }
      }
      
      const avgTop = topBrightness / topPixels;
      const avgMiddle = middleBrightness / middlePixels;
      const avgBottom = bottomBrightness / bottomPixels;
      
      // Enhanced posture detection with adaptive baseline
      // Seated: more content in top/middle (face, shoulders), less in bottom
      // Standing/away: more uniform distribution or more in bottom
      const topMiddleRatio = (avgTop + avgMiddle) / (avgBottom + 1);
      
      // Build adaptive baseline during first 20 samples
      if (baselineRef.current.samples < 20) {
        baselineRef.current.topMiddleRatio = 
          (baselineRef.current.topMiddleRatio * baselineRef.current.samples + topMiddleRatio) / 
          (baselineRef.current.samples + 1);
        baselineRef.current.samples++;
      }
      
      // Use adaptive threshold based on user's baseline posture
      const adaptiveThreshold = baselineRef.current.samples >= 20 
        ? baselineRef.current.topMiddleRatio * 0.75 // 25% tolerance below baseline
        : 1.15; // Default threshold
      
      // More tolerant threshold to accommodate different study postures
      // (leaning forward to write, sitting back to read, etc.)
      const isSeated = topMiddleRatio > adaptiveThreshold;
      const confidence = Math.min(Math.abs(topMiddleRatio - 1) / 2, 1);
      
      return { isSeated, confidence };
    } catch (error) {
      console.error('Posture analysis error:', error);
      return { isSeated: true, confidence: 0 };
    }
  };

  const startDetection = async () => {
    try {
      setIsInitialized(true);
      
      // Create canvas for frame analysis
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      // Reset baseline for new session
      baselineRef.current = { topMiddleRatio: 0, samples: 0 };

      // Start detection loop with optimized interval
      detectionIntervalRef.current = setInterval(() => {
        if (!videoElementRef.current || !canvasRef.current) return;

        const { isSeated, confidence } = analyzePosture(videoElementRef.current, canvasRef.current);

        // Enhanced temporal smoothing with larger window to reduce false positives
        // This prevents alerts during normal posture shifts (adjusting position, reaching for notes)
        seatedHistoryRef.current.push(isSeated);
        if (seatedHistoryRef.current.length > 15) {
          seatedHistoryRef.current.shift();
        }
        
        // Require consistent detection over longer period (70% threshold)
        // This is more tolerant of brief posture changes during studying
        const seatedCount = seatedHistoryRef.current.filter(s => s).length;
        const smoothedSeated = seatedCount >= 10; // 10 out of 15 frames

        setState({
          isSeated: smoothedSeated,
          poseConfidence: confidence,
        });
      }, 1200); // Optimized to 1.2 seconds for better performance
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
    }
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsInitialized(false);
    setState({
      isSeated: true,
      poseConfidence: 0,
    });
    seatedHistoryRef.current = [];
    baselineRef.current = { topMiddleRatio: 0, samples: 0 };
  };

  const setVideoElement = (video: HTMLVideoElement | null) => {
    videoElementRef.current = video;
  };

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  return {
    ...state,
    isInitialized,
    startDetection,
    stopDetection,
    setVideoElement,
  };
}
