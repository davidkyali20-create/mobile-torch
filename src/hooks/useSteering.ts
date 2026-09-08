import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface SteeringReturn {
  steeringAngle: number; // in degrees
  isGyroActive: boolean;
  isDragging: boolean;
  gyroSupported: boolean;
  requestGyroPermission: () => Promise<boolean>;
  onWheelPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  resetSteering: () => void;
  setManualAngle: (angle: number) => void;
}

export function useSteering(): SteeringReturn {
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [isGyroActive, setIsGyroActive] = useState(false);
  const [gyroSupported, setGyroSupported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialTouchAngleRef = useRef<number>(0);
  const initialSteerAngleRef = useRef<number>(0);
  const springAnimRef = useRef<number | null>(null);

  // Check if DeviceOrientation is available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setGyroSupported(true);
    }
  }, []);

  // Gyroscope orientation listener
  useEffect(() => {
    if (!isGyroActive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Don't override if user is actively dragging the wheel
      if (isDragging) return;

      // gamma is left-to-right tilt in degrees (-90 to 90)
      if (e.gamma !== null && !isNaN(e.gamma)) {
        // Clamp and smooth
        const clampedTilt = Math.max(-50, Math.min(50, e.gamma));
        setSteeringAngle(Math.round(clampedTilt * 1.6));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isGyroActive, isDragging]);

  // Request gyro permission for iOS 13+ devices
  const requestGyroPermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setIsGyroActive(true);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Orientation permission error', err);
        return false;
      }
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsGyroActive((prev) => !prev);
      return true;
    }
    return false;
  }, []);

  // Spring back to center smoothly
  const springToCenter = useCallback(() => {
    if (springAnimRef.current) cancelAnimationFrame(springAnimRef.current);

    const step = () => {
      setSteeringAngle((prev) => {
        if (Math.abs(prev) < 0.5) {
          return 0;
        }
        const next = prev * 0.82;
        springAnimRef.current = requestAnimationFrame(step);
        return next;
      });
    };
    springAnimRef.current = requestAnimationFrame(step);
  }, []);

  // Pointer drag handling around steering wheel center
  const onWheelPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Cancel any spring animation
      if (springAnimRef.current) {
        cancelAnimationFrame(springAnimRef.current);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      dragCenterRef.current = { x: centerX, y: centerY };

      const pointerAngle =
        (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;

      initialTouchAngleRef.current = pointerAngle;
      initialSteerAngleRef.current = steeringAngle;
      setIsDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const currentAngle =
          (Math.atan2(
            moveEvent.clientY - dragCenterRef.current.y,
            moveEvent.clientX - dragCenterRef.current.x
          ) *
            180) /
          Math.PI;

        let delta = currentAngle - initialTouchAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        const newAngle = Math.max(-120, Math.min(120, initialSteerAngleRef.current + delta));
        setSteeringAngle(Math.round(newAngle));
      };

      const onPointerUp = () => {
        setIsDragging(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        // Spring back to 0 if gyro is not holding it
        if (!isGyroActive) {
          springToCenter();
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [steeringAngle, isGyroActive, springToCenter]
  );

  const resetSteering = useCallback(() => {
    springToCenter();
  }, [springToCenter]);

  return {
    steeringAngle,
    isGyroActive,
    isDragging,
    gyroSupported,
    requestGyroPermission,
    onWheelPointerDown,
    resetSteering,
    setManualAngle: setSteeringAngle,
  };
}
