import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeedUnit, GearMode } from '../types';

export interface GpsSpeedReturn {
  speedKmh: number;
  speedMph: number;
  currentSpeed: number; // in active unit
  rpm: number;
  gear: GearMode;
  isGpsActive: boolean;
  gpsAccuracy: number | null;
  gpsError: string | null;
  isSimulating: boolean;
  throttlePercent: number; // 0 to 100
  odometer: number;
  trip: number;
  setUnit: (unit: SpeedUnit) => void;
  setGear: (gear: GearMode) => void;
  setIsSimulating: (sim: boolean) => void;
  setThrottlePercent: (pct: number) => void;
  applyBrake: (pct: number) => void;
}

export function useGpsSpeed(activeUnit: SpeedUnit): GpsSpeedReturn {
  const [speedKmh, setSpeedKmh] = useState(0);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [throttlePercent, setThrottlePercent] = useState(0);
  const [gear, setGear] = useState<GearMode>('D');
  const [rpm, setRpm] = useState(800); // Idle RPM
  const [odometer, setOdometer] = useState(14820.4);
  const [trip, setTrip] = useState(12.6);

  const watchIdRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Convert speed
  const speedMph = speedKmh * 0.621371;
  const currentSpeed = activeUnit === 'km/h' ? speedKmh : speedMph;

  // Real GPS tracking
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    const successHandler = (pos: GeolocationPosition) => {
      setIsGpsActive(true);
      setGpsAccuracy(pos.coords.accuracy);
      setGpsError(null);

      // Only override speed if not manually testing/simulating throttle
      if (!isSimulating) {
        const rawSpeedMs = pos.coords.speed; // meters per second
        if (rawSpeedMs !== null && !isNaN(rawSpeedMs) && rawSpeedMs >= 0) {
          const calculatedKmh = Math.round(rawSpeedMs * 3.6 * 10) / 10;
          setSpeedKmh(calculatedKmh);

          // Approximate RPM based on speed in Drive
          if (calculatedKmh < 1) {
            setRpm(800);
          } else {
            const calculatedRpm = 1000 + ((calculatedKmh % 40) / 40) * 2200;
            setRpm(Math.min(6500, Math.round(calculatedRpm)));
          }
        }
      }
    };

    const errorHandler = (err: GeolocationPositionError) => {
      setIsGpsActive(false);
      setGpsError(err.message);
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        successHandler,
        errorHandler,
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000,
        }
      );
    } catch (err: any) {
      setGpsError(err?.message || 'Failed to initialize GPS');
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSimulating]);

  // Physics simulation loop for pedal throttle & RPM shifting
  useEffect(() => {
    const updatePhysics = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (isSimulating) {
        setSpeedKmh((prevSpeed) => {
          let targetSpeed = 0;
          let accel = 0;

          if (gear === 'D' || gear === 'S') {
            const maxSpeed = gear === 'S' ? 240 : 190;
            targetSpeed = (throttlePercent / 100) * maxSpeed;
            if (throttlePercent > 0) {
              accel = (gear === 'S' ? 38 : 26) * (throttlePercent / 100);
            } else {
              accel = -14; // Natural road friction / engine brake
            }
          } else if (gear === 'R') {
            targetSpeed = (throttlePercent / 100) * 35;
            accel = throttlePercent > 0 ? 12 : -15;
          } else {
            // Park or Neutral: car rolls to stop
            accel = -18;
          }

          let newSpeed = prevSpeed;
          if (newSpeed < targetSpeed) {
            newSpeed = Math.min(targetSpeed, prevSpeed + accel * dt);
          } else if (newSpeed > targetSpeed) {
            newSpeed = Math.max(0, prevSpeed + accel * dt);
          }

          // Calculate RPM
          if (gear === 'P' || gear === 'N') {
            // Revving in neutral
            const neutralRpm = 800 + (throttlePercent / 100) * 5800;
            setRpm(Math.round(neutralRpm));
          } else {
            if (newSpeed < 0.5) {
              setRpm(800 + (throttlePercent / 100) * 400);
            } else {
              // Gear stages: 0-30, 30-60, 60-90, 90-130, 130-180, 180+
              const gearRpm = 1200 + ((newSpeed % 35) / 35) * 3800 + (throttlePercent / 100) * 800;
              setRpm(Math.min(7500, Math.max(800, Math.round(gearRpm))));
            }
          }

          // Accumulate odometer
          if (newSpeed > 0) {
            const distanceTraveledKm = (newSpeed / 3600) * dt;
            setOdometer((prev) => prev + distanceTraveledKm);
            setTrip((prev) => prev + distanceTraveledKm);
          }

          return Math.max(0, Math.round(newSpeed * 10) / 10);
        });
      }

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSimulating, throttlePercent, gear]);

  const applyBrake = useCallback((pct: number) => {
    setThrottlePercent(0);
    setSpeedKmh((prev) => Math.max(0, prev - (pct / 100) * 40));
  }, []);

  return {
    speedKmh,
    speedMph,
    currentSpeed,
    rpm,
    gear,
    isGpsActive,
    gpsAccuracy,
    gpsError,
    isSimulating,
    throttlePercent,
    odometer,
    trip,
    setUnit: () => {},
    setGear,
    setIsSimulating,
    setThrottlePercent,
    applyBrake,
  };
}
