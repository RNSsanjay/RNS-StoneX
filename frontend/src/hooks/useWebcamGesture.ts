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

  // Proper gesture detection using backend API
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

      // Send image to backend for gesture recognition
      const response = await fetch('http://localhost:8000/api/gesture/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc
        })
      });

      if (!response.ok) {
        console.error('Gesture recognition API error:', response.status);
        return {
          gesture: 'none',
          confidence: 0,
          detected: false
        };
      }

      const result = await response.json();

      return {
        gesture: result.gesture as 'rock' | 'paper' | 'scissors' | 'none',
        confidence: result.confidence || 0,
        detected: result.detected || false,
        landmarks: result.landmarks || []
      };

    } catch (error) {
      console.error('Gesture detection error:', error);
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