import { useRef, useCallback, useState, useEffect } from 'react';
import type { HandGesture } from '../types/game';

interface UseWebcamGestureProps {
  onGestureDetected?: (gesture: HandGesture) => void;
  confidenceThreshold?: number;
  detectionInterval?: number;
}

export const useWebcamGesture = ({
  onGestureDetected,
  confidenceThreshold = 0.7,
  detectionInterval = 1000
}: UseWebcamGestureProps = {}) => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastGesture, setLastGesture] = useState<HandGesture | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock gesture detection for now (will be replaced with actual MediaPipe integration)
  const detectGesture = useCallback(async (): Promise<HandGesture> => {
    if (!webcamRef.current || !webcamRef.current.getScreenshot) {
      return {
        gesture: 'none',
        confidence: 0,
        detected: false
      };
    }

    try {
      // Get screenshot from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        return {
          gesture: 'none',
          confidence: 0,
          detected: false
        };
      }

      // For now, return a mock gesture
      // TODO: Implement actual gesture recognition API call
      const mockGestures: ('rock' | 'paper' | 'scissors' | 'none')[] = ['rock', 'paper', 'scissors', 'none'];
      const randomGesture = mockGestures[Math.floor(Math.random() * mockGestures.length)];
      const confidence = randomGesture === 'none' ? 0 : Math.random() * 0.5 + 0.5;

      return {
        gesture: randomGesture,
        confidence,
        detected: randomGesture !== 'none'
      };
    } catch (err) {
      console.error('Gesture detection error:', err);
      return {
        gesture: 'none',
        confidence: 0,
        detected: false
      };
    }
  }, []);

  const startDetection = useCallback(() => {
    setIsDetecting(true);
    setError(null);
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isDetecting) return;

    const interval = setInterval(async () => {
      try {
        const gesture = await detectGesture();
        
        if (gesture.confidence >= confidenceThreshold && gesture.detected) {
          setLastGesture(gesture);
          if (onGestureDetected) {
            onGestureDetected(gesture);
          }
        }
      } catch (err) {
        console.error('Detection loop error:', err);
        setError('Failed to detect gesture');
      }
    }, detectionInterval);

    return () => clearInterval(interval);
  }, [isDetecting, detectGesture, onGestureDetected, confidenceThreshold, detectionInterval]);

  const captureGesture = useCallback(async (): Promise<HandGesture> => {
    try {
      const gesture = await detectGesture();
      setLastGesture(gesture);
      return gesture;
    } catch (err) {
      console.error('Capture gesture error:', err);
      const errorGesture: HandGesture = {
        gesture: 'none',
        confidence: 0,
        detected: false
      };
      setLastGesture(errorGesture);
      return errorGesture;
    }
  }, [detectGesture]);

  return {
    webcamRef,
    canvasRef,
    isDetecting,
    lastGesture,
    error,
    startDetection,
    stopDetection,
    captureGesture,
    detectGesture
  };
};