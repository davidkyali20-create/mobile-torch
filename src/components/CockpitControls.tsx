import React from 'react';
import { DashboardTheme, SpeedUnit, GearMode, HeadlightMode } from '../types';
import { THEMES } from '../utils/theme';
import { soundFx } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Gauge,
  Palette,
  AlertTriangle,
  Code2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CockpitControlsProps {
  theme: DashboardTheme;
  onThemeChange: (t: DashboardTheme) => void;
  unit: SpeedUnit;
  onUnitChange: (u: SpeedUnit) => void;
  gear: GearMode;
  onGearChange: (g: GearMode) => void;
  isSimulating: boolean;
  onSimulatingToggle: (sim: boolean) => void;
  throttlePercent: number;
  onThrottleChange: (pct: number) => void;
  onBrake: () => void;
  turnSignal: 'none' | 'left' | 'right' | 'hazard';
  onTurnSignalChange: (sig: 'none' | 'left' | 'right' | 'hazard') => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onOpenMobileDevModal: () => void;
  torchActive: boolean;
  onRequestCameraPermission: () => void;
  permissionGranted: boolean;
  headlights: HeadlightMode;
}

export const CockpitControls: React.FC<CockpitControlsProps> = ({
  theme,
  onThemeChange,
  unit,
  onUnitChange,
  gear,
  onGearChange,
  isSimulating,
  onSimulatingToggle,
  throttlePercent,
  onThrottleChange,
  onBrake,
  turnSignal,
  onTurnSignalChange,
  soundEnabled,
  onSoundToggle,
  onOpenMobileDevModal,
  torchActive,
  onRequestCameraPermission,
  permissionGranted,
  headlights,
}) => {
  const currentTheme = THEMES[theme];

  return (
    <div
      id="cockpit-controls-deck"
      className="w-full max-w-4xl mx-auto mt-4 p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl flex flex-col space-y-4 select-none"
    >
      {/* Top Bar: Quick Toggles (Theme, Sound, Native Specs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        {/* Left: Color Theme Selection */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs font-mono text-neutral-400">
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CLUSTER GLOW:</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {(Object.keys(THEMES) as DashboardTheme[]).map((tKey) => {
              const t = THEMES[tKey];
              const isSelected = theme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => {
                    soundFx.playSwitchClick(soundEnabled);
                    onThemeChange(tKey);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-white scale-105 shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.primary }}
                  title={t.name}
                />
              );
            })}
          </div>
        </div>

        {/* Center: Unit & Sound Toggles */}
        <div className="flex items-center space-x-2">
          {/* Unit Toggle */}
          <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => {
                soundFx.playSwitchClick(soundEnabled);
                onUnitChange('km/h');
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
                unit === 'km/h' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500'
              }`}
            >
              KM/H
            </button>
            <button
              onClick={() => {
                soundFx.playSwitchClick(soundEnabled);
                onUnitChange('mph');
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
                unit === 'mph' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500'
              }`}
            >
              MPH
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onSoundToggle}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-neutral-800 border-neutral-700 text-amber-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-600'
            }`}
            title={soundEnabled ? 'Mute audio' : 'Enable dashboard sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Native Code & Mobile Dev Specs Button */}
        <button
          id="open-mobile-dev-guide"
          onClick={onOpenMobileDevModal}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950/50 cursor-pointer active:scale-95 transition-all"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>FLUTTER / REACT NATIVE CODE</span>
        </button>
      </div>

      {/* Middle Bar: Throttle / GPS Mode & Driving Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Gear Selector */}
        <div className="flex flex-col space-y-1.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            TRANSMISSION GEAR
          </span>
          <div className="grid grid-cols-5 gap-1">
            {(['P', 'R', 'N', 'D', 'S'] as GearMode[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  soundFx.playSwitchClick(soundEnabled);
                  onGearChange(g);
                }}
                className={`py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer ${
                  gear === g
                    ? 'bg-amber-500 text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Speedometer Input Mode: Real GPS vs Simulator Throttle */}
        <div className="flex flex-col space-y-1.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              SPEED INPUT SOURCE
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                isSimulating
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {isSimulating ? 'THROTTLE TEST' : 'REAL PHONE GPS'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                soundFx.playSwitchClick(soundEnabled);
                onSimulatingToggle(false);
              }}
              className={`py-1.5 px-2 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                !isSimulating
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Real Phone GPS
            </button>
            <button
              onClick={() => {
                soundFx.playSwitchClick(soundEnabled);
                onSimulatingToggle(true);
              }}
              className={`py-1.5 px-2 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-sky-600 text-white font-bold shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              Pedal Throttle
            </button>
          </div>
        </div>

        {/* Interactive Pedals (Accelerator & Brake for Testing) */}
        <div className="flex items-center space-x-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
          {/* Brake Pedal */}
          <button
            id="brake-pedal-btn"
            onClick={onBrake}
            className="flex-1 py-3 px-2 rounded-xl bg-gradient-to-t from-red-950 to-neutral-900 hover:from-red-900 hover:to-neutral-800 active:scale-95 border border-red-900/60 text-red-300 text-xs font-mono font-bold flex flex-col items-center justify-center space-y-1 shadow cursor-pointer transition-all"
          >
            <div className="w-8 h-1 bg-red-500/60 rounded" />
            <span>BRAKE</span>
          </button>

          {/* Gas / Throttle Pedal */}
          <button
            id="gas-pedal-btn"
            onMouseDown={() => {
              if (!isSimulating) onSimulatingToggle(true);
              onThrottleChange(75);
            }}
            onMouseUp={() => onThrottleChange(0)}
            onMouseLeave={() => onThrottleChange(0)}
            onTouchStart={() => {
              if (!isSimulating) onSimulatingToggle(true);
              onThrottleChange(75);
            }}
            onTouchEnd={() => onThrottleChange(0)}
            className={`flex-1 py-3 px-2 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center space-y-1 shadow cursor-pointer transition-all select-none ${
              throttlePercent > 0
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)] scale-95'
                : 'bg-gradient-to-t from-neutral-800 to-neutral-900 hover:from-neutral-750 hover:to-neutral-850 border-neutral-700 text-neutral-200'
            }`}
          >
            <div className="w-8 h-1 bg-emerald-400/80 rounded" />
            <span>GAS (HOLD)</span>
          </button>
        </div>
      </div>

      {/* Turn Signals & Hazard Warning Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
        <div className="flex items-center space-x-2">
          {/* Left Turn */}
          <button
            onClick={() => {
              soundFx.playTurnSignalTick(true, soundEnabled);
              onTurnSignalChange(turnSignal === 'left' ? 'none' : 'left');
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition-all ${
              turnSignal === 'left'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            <span>◄ LEFT SIGNAL</span>
          </button>

          {/* Right Turn */}
          <button
            onClick={() => {
              soundFx.playTurnSignalTick(true, soundEnabled);
              onTurnSignalChange(turnSignal === 'right' ? 'none' : 'right');
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition-all ${
              turnSignal === 'right'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400'
            }`}
          >
            <span>RIGHT SIGNAL ►</span>
          </button>
        </div>

        {/* Hazard Button (Red Triangle) */}
        <button
          onClick={() => {
            soundFx.playSwitchClick(soundEnabled);
            onTurnSignalChange(turnSignal === 'hazard' ? 'none' : 'hazard');
          }}
          className={`px-4 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
            turnSignal === 'hazard'
              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_14px_rgba(239,68,68,0.8)] animate-pulse'
              : 'bg-neutral-950 border-red-950 text-red-500 hover:border-red-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>HAZARDS</span>
        </button>
      </div>
    </div>
  );
};
