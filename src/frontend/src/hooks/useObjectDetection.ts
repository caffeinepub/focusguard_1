import { useState, useEffect, useRef } from 'react';

interface ObjectDetectionState {
  phoneDetected: boolean;
  detectionConfidence: number;
}

export function useObjectDetection(isActive: boolean) {
  const [state, setState] = useState<ObjectDetectionState>({
    phoneDetected: false,
    detectionConfidence: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phoneDetectionHistoryRef = useRef<{ detected: boolean; position: number[] }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  // Analyze video frame for rectangular objects that might be phones
  const detectObjects = (video: HTMLVideoElement, canvas: HTMLCanvasElement): { phoneDetected: boolean; confidence: number; position: number[] } => {
    if (!video || video.readyState !== 4) {
      return { phoneDetected: false, confidence: 0, position: [] };
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { phoneDetected: false, confidence: 0, position: [] };

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Optimized edge detection for rectangular objects (potential phone)
      const regionSize = 40;
      let maxEdgeScore = 0;
      let bestPosition: number[] = [];
      
      // Larger step size for better performance
      for (let y = 0; y < canvas.height - regionSize; y += 25) {
        for (let x = 0; x < canvas.width - regionSize; x += 25) {
          let edgeScore = 0;
          
          // Optimized edge sampling with larger steps
          for (let i = 0; i < regionSize; i += 5) {
            const topIdx = (y * canvas.width + (x + i)) * 4;
            const bottomIdx = ((y + regionSize) * canvas.width + (x + i)) * 4;
            const leftIdx = ((y + i) * canvas.width + x) * 4;
            const rightIdx = ((y + i) * canvas.width + (x + regionSize)) * 4;
            
            // Calculate brightness differences (edge detection)
            if (topIdx < data.length && bottomIdx < data.length) {
              const topBright = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
              const bottomBright = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
              edgeScore += Math.abs(topBright - bottomBright);
            }
            
            if (leftIdx < data.length && rightIdx < data.length) {
              const leftBright = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
              const rightBright = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
              edgeScore += Math.abs(leftBright - rightBright);
            }
          }
          
          if (edgeScore > maxEdgeScore) {
            maxEdgeScore = edgeScore;
            bestPosition = [x, y];
          }
        }
      }
      
      // Higher threshold to reduce false positives
      const phoneDetected = maxEdgeScore > 3500;
      const confidence = Math.min(maxEdgeScore / 5000, 1);
      
      return { phoneDetected, confidence, position: bestPosition };
    } catch (error) {
      console.error('Object detection error:', error);
      return { phoneDetected: false, confidence: 0, position: [] };
    }
  };

  const startDetection = async () => {
    try {
      setIsInitialized(true);
      
      // Create canvas for frame analysis
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      // Start detection loop with adaptive frame rate
      detectionIntervalRef.current = setInterval(() => {
        if (!videoElementRef.current || !canvasRef.current) return;

        const currentTime = Date.now();
        const timeSinceLastDetection = currentTime - lastDetectionTimeRef.current;
        
        // Adaptive frame rate: check more frequently if phone was recently detected
        const shouldSkipFrame = timeSinceLastDetection > 5000 && Math.random() > 0.5;
        if (shouldSkipFrame) return;

        const { phoneDetected, confidence, position } = detectObjects(videoElementRef.current, canvasRef.current);

        if (phoneDetected) {
          lastDetectionTimeRef.current = currentTime;
        }

        // Spatial consistency check: phone should be detected in similar position
        phoneDetectionHistoryRef.current.push({ detected: phoneDetected, position });
        if (phoneDetectionHistoryRef.current.length > 4) {
          phoneDetectionHistoryRef.current.shift();
        }

        // Require phone detection in at least 3 consecutive frames for stability
        const recentDetections = phoneDetectionHistoryRef.current.filter(h => h.detected);
        const consistentDetection = recentDetections.length >= 3;

        // Check spatial consistency if we have multiple detections
        let spatiallyConsistent = true;
        if (recentDetections.length >= 2) {
          const positions = recentDetections.map(d => d.position);
          const maxDistance = 80; // pixels - tighter tolerance
          for (let i = 1; i < positions.length; i++) {
            if (positions[i].length > 0 && positions[i - 1].length > 0) {
              const dist = Math.hypot(
                positions[i][0] - positions[i - 1][0],
                positions[i][1] - positions[i - 1][1]
              );
              if (dist > maxDistance) {
                spatiallyConsistent = false;
                break;
              }
            }
          }
        }

        setState({
          phoneDetected: consistentDetection && spatiallyConsistent,
          detectionConfidence: confidence,
        });
      }, 1200); // Optimized to 1.2 seconds base rate
    } catch (error) {
      console.error('Failed to initialize object detection:', error);
    }
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsInitialized(false);
    setState({
      phoneDetected: false,
      detectionConfidence: 0,
    });
    phoneDetectionHistoryRef.current = [];
    lastDetectionTimeRef.current = 0;
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
