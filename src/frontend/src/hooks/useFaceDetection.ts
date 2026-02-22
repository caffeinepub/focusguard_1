import { useState, useRef, useCallback } from 'react';

interface FaceDetectionState {
  faceDetected: boolean;
  headDown: boolean;
  eyesOpen: boolean;
  faceDetectionLost: boolean;
}

export function useFaceDetection(isActive: boolean) {
  const [state, setState] = useState<FaceDetectionState>({
    faceDetected: false,
    headDown: false,
    eyesOpen: true,
    faceDetectionLost: false,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const faceHistoryRef = useRef<boolean[]>([]);
  const headDownHistoryRef = useRef<boolean[]>([]);
  const faceNotDetectedStartRef = useRef<number | null>(null);

  const HISTORY_SIZE = 10;
  const FACE_LOST_THRESHOLD = 5000; // 5 seconds
  const DETECTION_INTERVAL = 600; // 600ms between checks

  const setVideoElement = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple face detection based on skin tone and brightness
    let skinPixels = 0;
    let totalBrightness = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    for (let y = Math.max(0, centerY - radius); y < Math.min(canvas.height, centerY + radius); y++) {
      for (let x = Math.max(0, centerX - radius); x < Math.min(canvas.width, centerX + radius); x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        totalBrightness += (r + g + b) / 3;

        // Skin tone detection
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
          skinPixels++;
        }
      }
    }

    const totalPixels = Math.PI * radius * radius;
    const skinRatio = skinPixels / totalPixels;
    const avgBrightness = totalBrightness / totalPixels;

    const faceDetected = skinRatio > 0.15 && avgBrightness > 40;

    // Update face history
    faceHistoryRef.current.push(faceDetected);
    if (faceHistoryRef.current.length > HISTORY_SIZE) {
      faceHistoryRef.current.shift();
    }

    // Smooth face detection
    const faceCount = faceHistoryRef.current.filter(f => f).length;
    const smoothedFaceDetected = faceCount >= HISTORY_SIZE * 0.6;

    // Track face loss duration
    if (!smoothedFaceDetected) {
      if (faceNotDetectedStartRef.current === null) {
        faceNotDetectedStartRef.current = Date.now();
      }
      const lostDuration = Date.now() - faceNotDetectedStartRef.current;
      const faceDetectionLost = lostDuration >= FACE_LOST_THRESHOLD;

      setState(prev => ({
        ...prev,
        faceDetected: false,
        faceDetectionLost,
      }));
    } else {
      faceNotDetectedStartRef.current = null;
      setState(prev => ({
        ...prev,
        faceDetected: true,
        faceDetectionLost: false,
      }));
    }

    // Head down detection (simplified - based on brightness in lower portion)
    let lowerBrightness = 0;
    let lowerPixels = 0;
    for (let y = Math.floor(canvas.height * 0.6); y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        lowerBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        lowerPixels++;
      }
    }
    const avgLowerBrightness = lowerBrightness / lowerPixels;
    const headDown = smoothedFaceDetected && avgLowerBrightness < avgBrightness * 0.7;

    headDownHistoryRef.current.push(headDown);
    if (headDownHistoryRef.current.length > HISTORY_SIZE) {
      headDownHistoryRef.current.shift();
    }

    const headDownCount = headDownHistoryRef.current.filter(h => h).length;
    const smoothedHeadDown = headDownCount >= HISTORY_SIZE * 0.7;

    setState(prev => ({
      ...prev,
      headDown: smoothedHeadDown,
    }));
  }, []);

  const startDetection = useCallback(async () => {
    if (detectionIntervalRef.current) return;

    detectionIntervalRef.current = window.setInterval(() => {
      detectFace();
    }, DETECTION_INTERVAL);
  }, [detectFace]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    faceHistoryRef.current = [];
    headDownHistoryRef.current = [];
    faceNotDetectedStartRef.current = null;
    setState({
      faceDetected: false,
      headDown: false,
      eyesOpen: true,
      faceDetectionLost: false,
    });
  }, []);

  return {
    ...state,
    setVideoElement,
    startDetection,
    stopDetection,
  };
}
