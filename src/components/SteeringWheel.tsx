import React from 'react';
import { DashboardTheme, HeadlightMode } from '../types';
import { THEMES } from '../utils/theme';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Compass, RotateCcw, Smartphone } from 'lucide-react';

interface SteeringWheelProps {
  steeringAngle: number;
  isGyroActive: boolean;
  gyroSupported: boolean;
  isDragging: boolean;
  headlights: HeadlightMode;
  theme: DashboardTheme;
  soundEnabled: boolean;
  onRequestGyro: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onResetSteering: () => void;
  onShiftGear?: (delta: number) => void;
}

export const SteeringWheel: React.FC<SteeringWheelProps> = ({
  steeringAngle,
  isGyroActive,
  gyroSupported,
  isDragging,
  headlights,
  theme,
  soundEnabled,
  onRequestGyro,
  onPointerDown,
  onResetSteering,
  onShiftGear,
}) => {
  const currentTheme = THEMES[theme];
  const isLightsOn = headlights === 'HEADLIGHTS' || headlights === 'HIGH_BEAMS';
  const isParking = headlights === 'PARKING';
  const hasGlow = isLightsOn || isParking;

  const handleHorn = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    soundFx.playHorn(350, soundEnabled);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 150]);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div
      id="steering-wheel-container"
      className="relative flex flex-col items-center select-none"
    >
      {/* Steering Control Indicators & Gyro Bar */}
      <div className="flex items-center space-x-2 mb-3 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800 text-xs font-mono">
        <button
          id="gyro-toggle-btn"
          onClick={onRequestGyro}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            isGyroActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
              : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700'
          }`}
          title="Toggle phone gyroscope sensor for motion tilt steering"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isGyroActive ? 'GYRO TILT: ON' : 'GYRO: OFF'}</span>
        </button>

        <span className="text-neutral-500">|</span>

        {/* Angle Readout */}
        <div className="flex items-center space-x-1 text-neutral-300 font-bold">
          <Compass className="w-3.5 h-3.5 text-neutral-400" />
          <span>{Math.round(steeringAngle)}°</span>
        </div>

        {Math.abs(steeringAngle) > 2 && (
          <button
            id="reset-steer-btn"
            onClick={onResetSteering}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 cursor-pointer"
            title="Center wheel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Steering Column & Ambient Glow Halo Behind Wheel */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Backlight Glow onto Cockpit / Steering Column */}
        <div
          className={`absolute w-72 sm:w-84 h-72 sm:h-84 rounded-full pointer-events-none transition-all duration-700 ${
            hasGlow ? 'opacity-75 scale-105' : 'opacity-0 scale-95'
          }`}
          style={{
            background: `radial-gradient(circle, rgba(${currentTheme.glowRgba}, 0.25) 0%, rgba(${currentTheme.glowRgba}, 0.08) 50%, transparent 75%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Paddle Shifters (Behind Wheel) */}
        <div className="absolute inset-x-[-12px] top-12 flex justify-between pointer-events-auto">
          {/* Left Paddle (- Downshift) */}
          <button
            id="paddle-downshift"
            onClick={() => {
              soundFx.playSwitchClick(soundEnabled);
              if (onShiftGear) onShiftGear(-1);
            }}
            className="w-8 h-20 rounded-l-2xl bg-gradient-to-r from-neutral-800 to-neutral-750 border-y border-l border-neutral-600 shadow-lg flex items-center justify-center text-neutral-400 hover:text-white hover:border-amber-400 active:scale-95 transition-all cursor-pointer font-mono font-black text-sm"
            title="Paddle Downshift (-)"
          >
            -
          </button>

          {/* Right Paddle (+ Upshift) */}
          <button
            id="paddle-upshift"
            onClick={() => {
              soundFx.playSwitchClick(soundEnabled);
              if (onShiftGear) onShiftGear(1);
            }}
            className="w-8 h-20 rounded-r-2xl bg-gradient-to-l from-neutral-800 to-neutral-750 border-y border-r border-neutral-600 shadow-lg flex items-center justify-center text-neutral-400 hover:text-white hover:border-amber-400 active:scale-95 transition-all cursor-pointer font-mono font-black text-sm"
            title="Paddle Upshift (+)"
          >
            +
          </button>
        </div>

        {/* Rotatable Steering Wheel Assembly */}
        <div
          id="steering-wheel-rotator"
          onPointerDown={onPointerDown}
          className={`relative w-64 h-64 sm:w-76 sm:h-76 rounded-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing transition-transform ${
            isDragging ? 'duration-0' : 'duration-150 ease-out'
          }`}
          style={{
            transform: `rotate(${steeringAngle}deg)`,
          }}
        >
          {/* Outer Wheel Rim (Perforated leather textured rim) */}
          <div
            className="absolute inset-0 rounded-full border-[18px] sm:border-[22px] border-[#1b1e24] shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_4px_8px_rgba(255,255,255,0.08),inset_0_-8px_16px_rgba(0,0,0,0.9)]"
            style={{
              borderColor: '#191b21',
            }}
          >
            {/* Top 12-o'clock centering racing stripe */}
            <div
              className={`absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-5 sm:h-6 rounded-sm transition-all duration-500 ${
                hasGlow
                  ? 'shadow-[0_0_10px_currentColor]'
                  : 'bg-neutral-600'
              }`}
              style={{
                backgroundColor: hasGlow ? currentTheme.primary : '#525252',
                color: currentTheme.primary,
              }}
            />
          </div>

          {/* Inner Rim Accent Ring */}
          <div
            className="absolute inset-6 rounded-full border-2 border-neutral-800/80 pointer-events-none"
            style={{
              borderColor: hasGlow
                ? `rgba(${currentTheme.glowRgba}, 0.25)`
                : '#262626',
            }}
          />

          {/* Spokes (Left, Right, and Bottom) */}
          {/* Left Spoke & Multi-function thumb buttons */}
          <div className="absolute left-3 w-20 sm:w-24 h-12 bg-gradient-to-r from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg flex items-center justify-around px-2 shadow-md">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                hasGlow ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-neutral-600'
              }`}
            />
            <div
              className="text-[9px] font-mono font-bold"
              style={{ color: hasGlow ? currentTheme.accent : '#737373' }}
            >
              VOL
            </div>
            <div className="w-4 h-4 rounded bg-neutral-950/80 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">
              ▲
            </div>
          </div>

          {/* Right Spoke & Multi-function thumb buttons */}
          <div className="absolute right-3 w-20 sm:w-24 h-12 bg-gradient-to-l from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg flex items-center justify-around px-2 shadow-md">
            <div className="w-4 h-4 rounded bg-neutral-950/80 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">
              OK
            </div>
            <div
              className="text-[9px] font-mono font-bold"
              style={{ color: hasGlow ? currentTheme.accent : '#737373' }}
            >
              SET
            </div>
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                hasGlow ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-neutral-600'
              }`}
            />
          </div>

          {/* Bottom 6-o'clock Spoke */}
          <div className="absolute bottom-3 w-10 sm:w-12 h-16 bg-gradient-to-t from-neutral-800 to-neutral-900 border border-neutral-700 rounded-b-md flex items-center justify-center shadow-md">
            <div
              className="w-1.5 h-6 rounded-full"
              style={{
                backgroundColor: hasGlow ? currentTheme.primary : '#404040',
                boxShadow: hasGlow ? `0 0 8px ${currentTheme.primary}` : 'none',
              }}
            />
          </div>

          {/* Center Horn Boss & Airbag Hub */}
          <button
            id="steering-horn-boss"
            onClick={handleHorn}
            className="relative z-20 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-gradient-to-br from-neutral-850 via-neutral-900 to-black border-2 border-neutral-700 shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center cursor-pointer hover:border-amber-400/80 active:scale-95 transition-all"
            title="Press center to sound horn"
          >
            {/* Center Emblem / Brand Badge */}
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 border border-neutral-600 flex items-center justify-center shadow-inner transition-all duration-500"
              style={{
                borderColor: hasGlow ? currentTheme.primary : '#525252',
                boxShadow: hasGlow
                  ? `0 0 14px rgba(${currentTheme.glowRgba}, 0.5)`
                  : 'none',
              }}
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke={hasGlow ? currentTheme.primary : '#d4d4d4'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>

            {/* Horn Symbol & Text */}
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-400">
                AIRBAG / HORN
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Interactive Drag Hint */}
      <div className="text-[10px] font-mono text-neutral-500 mt-2 flex items-center space-x-1">
        <span>Touch & drag wheel or tilt device</span>
      </div>
    </div>
  );
};
