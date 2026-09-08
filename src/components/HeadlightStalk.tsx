import React, { useState, useRef, useEffect } from 'react';
import { HeadlightMode } from '../types';
import { soundFx } from '../utils/audio';
import { Zap, Sun, Moon, Lightbulb, AlertTriangle, ChevronUp, ChevronDown, RotateCw } from 'lucide-react';

interface HeadlightStalkProps {
  mode: HeadlightMode;
  onModeChange: (newMode: HeadlightMode) => void;
  torchActive: boolean;
  isStrobeActive?: boolean;
  soundEnabled: boolean;
  beamIntensity: number;
  onBeamIntensityChange: (intensity: number) => void;
  clusterBrightness: number;
  onClusterBrightnessChange: (brightness: number) => void;
  onPullFlash?: () => void;
  onTriggerStrobe?: () => void;
}

export const HeadlightStalk: React.FC<HeadlightStalkProps> = ({
  mode,
  onModeChange,
  torchActive,
  isStrobeActive = false,
  soundEnabled,
  beamIntensity,
  onBeamIntensityChange,
  clusterBrightness,
  onClusterBrightnessChange,
  onPullFlash,
  onTriggerStrobe,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const stalkPositions: { id: HeadlightMode; label: string; icon: string; desc: string }[] = [
    { id: 'OFF', label: 'OFF', icon: '○', desc: 'Lights Off' },
    { id: 'PARKING', label: 'PARK', icon: '☼', desc: 'Parking / Dim' },
    { id: 'HEADLIGHTS', label: 'AUTO/ON', icon: '💡', desc: 'Headlights & Torch' },
    { id: 'HIGH_BEAMS', label: 'HIGH', icon: '⚡', desc: 'High Beam Torch' },
  ];

  const currentIndex = stalkPositions.findIndex((p) => p.id === mode);
  const activeIndex = currentIndex >= 0 ? currentIndex : (mode === 'STROBE' ? 3 : 0);

  const handleStepMode = (delta: number) => {
    soundFx.playSwitchClick(soundEnabled);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    const nextIdx = Math.max(0, Math.min(stalkPositions.length - 1, activeIndex + delta));
    const targetMode = stalkPositions[nextIdx].id;
    if (targetMode === 'HEADLIGHTS' || targetMode === 'HIGH_BEAMS') {
      soundFx.playRelayClick(soundEnabled);
    }
    onModeChange(targetMode);
  };

  const handleSelectMode = (newMode: HeadlightMode) => {
    soundFx.playSwitchClick(soundEnabled);
    if (newMode === 'HEADLIGHTS' || newMode === 'HIGH_BEAMS') {
      soundFx.playRelayClick(soundEnabled);
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    onModeChange(newMode);
  };

  // Momentary Pull-to-Flash
  const handlePullDown = () => {
    setIsPulling(true);
    soundFx.playRelayClick(soundEnabled);
    if (onPullFlash) onPullFlash();
    setTimeout(() => setIsPulling(false), 450);
  };

  // Long press on the stalk tip activates Strobe / Hazard emergency mode
  const startLongPress = () => {
    setLongPressProgress(0);
    const start = Date.now();
    const duration = 600;

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setLongPressProgress(progress);
    }, 30);

    longPressTimerRef.current = window.setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setLongPressProgress(0);
      soundFx.playRelayClick(soundEnabled);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([80, 50, 80]);
        } catch {}
      }
      if (onTriggerStrobe) {
        onTriggerStrobe();
      } else {
        onModeChange(mode === 'STROBE' ? 'HEADLIGHTS' : 'STROBE');
      }
    }, duration);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setLongPressProgress(0);
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div
      id="steering-column-headlight-stalk"
      className="relative flex items-center select-none z-30 pointer-events-auto"
    >
      {/* 1. Rubber Ribbed Column Boot / Socket Mount */}
      <div className="relative w-7 sm:w-9 h-14 sm:h-16 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-r-lg border-y border-r border-neutral-700 shadow-2xl flex flex-col justify-around py-1 px-0.5">
        <div className="w-full h-1 bg-neutral-950 rounded-full" />
        <div className="w-full h-1 bg-neutral-950 rounded-full" />
        <div className="w-full h-1 bg-neutral-950 rounded-full" />
        <div className="w-full h-1 bg-neutral-950 rounded-full" />
      </div>

      {/* 2. Main Stalk Lever Assembly */}
      <div
        className={`relative flex items-center transition-transform ${
          isPulling ? 'translate-y-1.5 -rotate-2 scale-98' : 'rotate-0'
        }`}
      >
        {/* Metal/Polymer Shaft */}
        <div className="w-12 sm:w-16 h-8 sm:h-9 bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 border-y border-neutral-600 shadow-md flex items-center justify-between px-1.5">
          {/* Shaft Directional Icon Graphics */}
          <div className="flex flex-col text-[8px] font-mono text-neutral-400 font-bold leading-tight">
            <span>PE</span>
            <span className="text-amber-400">💡</span>
          </div>

          {/* Rotary Lighting Dimmer Ring (Adjusts Beam & Cluster Lighting) */}
          <div
            className="w-5 sm:w-6 h-10 sm:h-11 -my-1 rounded-sm bg-gradient-to-b from-neutral-600 via-neutral-900 to-neutral-700 border-x border-neutral-500 shadow-inner flex flex-col justify-between py-0.5 cursor-ns-resize group"
            title="Knurled Lighting Ring: Drag or Click to adjust illumination"
            onClick={(e) => {
              e.stopPropagation();
              const nextVal = clusterBrightness >= 90 ? 30 : clusterBrightness + 25;
              onClusterBrightnessChange(nextVal);
              onBeamIntensityChange(nextVal);
              soundFx.playSwitchClick(soundEnabled);
            }}
          >
            <div className="w-full h-0.5 bg-neutral-400/50" />
            <div className="w-full h-0.5 bg-amber-400/70" />
            <div className="w-full h-0.5 bg-neutral-400/50" />
          </div>
        </div>

        {/* 3. Outer Rotary Headlight Switch Knob (Collar at Stalk Tip) */}
        <div className="relative flex items-center">
          {/* The Rotary Cylinder Knob */}
          <div
            id="stalk-rotary-knob"
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            className={`relative w-20 sm:w-24 h-12 sm:h-13 rounded-r-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 shadow-[0_8px_20px_rgba(0,0,0,0.8)] ${
              mode === 'STROBE'
                ? 'bg-gradient-to-r from-red-950 to-amber-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse'
                : torchActive
                ? 'bg-gradient-to-r from-neutral-850 via-neutral-800 to-neutral-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 border-neutral-600 hover:border-neutral-400'
            }`}
          >
            {/* Long Press Progress Bar (For Strobe Activation) */}
            {longPressProgress > 0 && (
              <div
                className="absolute inset-0 rounded-r-2xl bg-amber-500/30 transition-all pointer-events-none"
                style={{ width: `${longPressProgress}%` }}
              />
            )}

            {/* Current Position Marker Notch */}
            <div className="w-full flex items-center justify-between px-2 text-[9px] font-mono font-black">
              <span
                className={`transition-colors ${
                  torchActive ? 'text-amber-300' : 'text-neutral-400'
                }`}
              >
                {mode === 'STROBE' ? 'STROBE' : stalkPositions[activeIndex]?.label}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  mode === 'STROBE'
                    ? 'bg-red-400 animate-ping'
                    : torchActive
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-neutral-600'
                }`}
              />
            </div>

            {/* Position Detent Icons */}
            <div className="flex items-center space-x-1.5 mt-0.5 text-[10px]">
              {stalkPositions.map((p, idx) => (
                <span
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMode(p.id);
                  }}
                  className={`px-1 py-0.5 rounded transition-all cursor-pointer ${
                    mode === p.id
                      ? 'bg-amber-500/40 text-amber-200 font-bold scale-110 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={p.desc}
                >
                  {p.icon}
                </span>
              ))}
            </div>

            {/* Hint Prompt */}
            <span className="text-[7.5px] font-mono text-neutral-400 uppercase tracking-tighter mt-0.5">
              CLICK / HOLD: STROBE
            </span>
          </div>

          {/* Rotary Up/Down Click Stepper Buttons */}
          <div className="flex flex-col ml-1 space-y-1">
            <button
              id="stalk-turn-next"
              onClick={() => handleStepMode(1)}
              disabled={activeIndex >= stalkPositions.length - 1}
              className="p-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer active:scale-90"
              title="Rotate Stalk Forward"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              id="stalk-turn-prev"
              onClick={() => handleStepMode(-1)}
              disabled={activeIndex <= 0}
              className="p-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer active:scale-90"
              title="Rotate Stalk Back"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Pull-to-Flash Quick Trigger */}
      <button
        id="stalk-pull-flash-btn"
        onClick={handlePullDown}
        className="ml-2 px-2 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-amber-300 font-mono text-[9px] font-bold flex flex-col items-center justify-center space-y-0.5 shadow-md active:scale-95 cursor-pointer transition-all"
        title="Pull stalk towards you: High Beam Flash"
      >
        <Zap className="w-3 h-3 text-amber-400" />
        <span className="hidden sm:inline">PULL FLASH</span>
        <span className="sm:hidden">FLASH</span>
      </button>
    </div>
  );
};
