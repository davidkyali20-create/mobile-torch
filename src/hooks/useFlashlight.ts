import { useState, useEffect, useRef, useCallback } from 'react';

export interface FlashlightHookReturn {
  torchActive: boolean;
  isStrobeActive: boolean;
  torchSupported: boolean | null; // null = pending check
  permissionGranted: boolean;
  error: string | null;
  toggleTorch: (forceState?: boolean) => Promise<boolean>;
  setTorch: (enable: boolean) => Promise<boolean>;
  startStrobe: () => void;
  stopStrobe: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useFlashlight(): FlashlightHookReturn {
  const [torchActive, setTorchActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [torchSupported, setTorchSupported] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const strobeIntervalRef = useRef<number | null>(null);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (trackRef.current) {
      try {
        trackRef.current.stop();
      } catch {
        // Ignore
      }
      trackRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        // Ignore
      }
      streamRef.current = null;
    }
  }, []);

  // Request camera and inspect torch capabilities
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setTorchSupported(false);
      setError('MediaDevices API not supported on this browser.');
      return false;
    }

    try {
      // Prefer rear environment camera for torch
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      setPermissionGranted(true);

      // Check capabilities
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as Record<string, unknown>;
      const hasTorch = Boolean(capabilities && 'torch' in capabilities);
      setTorchSupported(hasTorch);

      if (!hasTorch) {
        setError('Camera connected, but hardware LED torch constraint is not supported by this camera/browser. Screen headlight mode will be used.');
      }

      return true;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Camera permission denied or camera unavailable';
      setError(errMessage);
      setPermissionGranted(false);
      setTorchSupported(false);
      return false;
    }
  }, []);

  // Set torch on or off
  const setTorch = useCallback(
    async (enable: boolean): Promise<boolean> => {
      setError(null);

      // If turning off and no track, just set state off
      if (!enable && !trackRef.current) {
        setTorchActive(false);
        return true;
      }

      try {
        // Ensure stream is active if enabling
        if (enable && (!streamRef.current || !trackRef.current || trackRef.current.readyState === 'ended')) {
          const granted = await requestPermission();
          if (!granted) {
            // Still toggle virtual headlight for user feedback
            setTorchActive(enable);
            return false;
          }
        }

        const track = trackRef.current;
        if (track && track.readyState === 'live') {
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as Record<string, unknown>;
          if (capabilities && 'torch' in capabilities) {
            // Apply advanced constraint for hardware LED torch
            await (track as any).applyConstraints({
              advanced: [{ torch: enable }],
            });
            setTorchActive(enable);
            setTorchSupported(true);

            // If we turned off torch, we can keep the track or stop it after a moment
            if (!enable) {
              stopStream();
            }
            return true;
          } else {
            // No hardware torch capability
            setTorchActive(enable);
            setTorchSupported(false);
            if (!enable) {
              stopStream();
            }
            return false;
          }
        } else {
          setTorchActive(enable);
          return false;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to toggle torch';
        setError(msg);
        setTorchActive(enable); // Maintain UI headlight state
        return false;
      }
    },
    [requestPermission, stopStream]
  );

  const toggleTorch = useCallback(
    async (forceState?: boolean): Promise<boolean> => {
      const targetState = forceState !== undefined ? forceState : !torchActive;
      return setTorch(targetState);
    },
    [torchActive, setTorch]
  );

  const stopStrobe = useCallback(() => {
    if (strobeIntervalRef.current) {
      window.clearInterval(strobeIntervalRef.current);
      strobeIntervalRef.current = null;
    }
    setIsStrobeActive(false);
    setTorch(false);
  }, [setTorch]);

  const startStrobe = useCallback(async () => {
    stopStrobe();
    setIsStrobeActive(true);
    let state = true;
    await setTorch(true);

    strobeIntervalRef.current = window.setInterval(async () => {
      state = !state;
      const track = trackRef.current;
      if (track && track.readyState === 'live') {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: state }],
          });
        } catch {
          // Ignore
        }
      }
      setTorchActive(state);
    }, 120);
  }, [setTorch, stopStrobe]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (strobeIntervalRef.current) {
        clearInterval(strobeIntervalRef.current);
      }
      stopStream();
    };
  }, [stopStream]);

  return {
    torchActive,
    isStrobeActive,
    torchSupported,
    permissionGranted,
    error,
    toggleTorch,
    setTorch,
    startStrobe,
    stopStrobe,
    requestPermission,
  };
}
