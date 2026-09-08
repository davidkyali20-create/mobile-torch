import React from 'react';
import { HeadlightMode } from '../types';
import { soundFx } from '../utils/audio';
import { Zap, Sun, Moon, Sparkles, Lightbulb } from 'lucide-react';

interface HeadlightStalkProps {
  mode: HeadlightMode;
  onModeChange: (newMode: HeadlightMode) => void;
  torchActive: boolean;
  soundEnabled: boolean;
  onPullFlash?: () => void;
}

export const HeadlightStalk: React.FC<HeadlightStalkProps> = ({
  mode,
  onModeChange,
  torchActive,
  soundEnabled,
  onPullFlash,
}) => {
  const modes: { id: HeadlightMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'OFF',
      label: 'OFF',
      icon: <Moon className="w-4 h-4" />,
      desc: 'Lights Off / Torch Off',
    },
    {
      id: 'PARKING',
      label: 'PARK',
      icon: <Sun className="w-4 h-4" />,
      desc: 'Marker & Dims',
    },
    {
      id: 'HEADLIGHTS',
      label: 'LOW',
      icon: <Lightbulb className="w-4 h-4" />,
      desc: 'Torch LED Active',
    },
    {
      id: 'HIGH_BEAMS',
      label: 'HIGH',
      icon: <Zap className="w-4 h-4" />,
      desc: 'Max Torch & High Beam',
    },
  ];

  const handleSelect = (targetMode: HeadlightMode) => {
    soundFx.playSwitchClick(soundEnabled);
    if (targetMode === 'HEADLIGHTS' || targetMode === 'HIGH_BEAMS') {
      soundFx.playRelayClick(soundEnabled);
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore
      }
    }
    onModeChange(targetMode);
  };

  return (
    <div
      id="headlight-switch-module"
      className="relative flex flex-col items-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] select-none w-full max-w-sm"
    >
      {/* Module Title Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              torchActive
                ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-ping'
                : 'bg-neutral-600'
            }`}
          />
          <span className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
            Headlight Switch & Torch
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-all ${
            torchActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {torchActive ? 'LED ACTIVE' : 'LED IDLE'}
        </span>
      </div>

      {/* Realistic 4-Position Stalk Rotary Bar */}
      <div className="w-full grid grid-cols-4 gap-1.5 p-1.5 bg-neutral-950 rounded-xl border border-neutral-800/80 mb-3">
        {modes.map((m) => {
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              id={`switch-mode-${m.id.toLowerCase()}`}
              onClick={() => handleSelect(m.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg transition-all duration-200 cursor-pointer ${
                isSelected
                  ? m.id === 'HIGH_BEAMS'
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_0_14px_rgba(37,99,235,0.7)] font-bold'
                    : m.id === 'HEADLIGHTS'
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-neutral-950 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-bold'
                    : m.id === 'PARKING'
                    ? 'bg-gradient-to-b from-amber-700 to-amber-800 text-amber-100 shadow-[0_0_8px_rgba(217,119,6,0.5)]'
                    : 'bg-neutral-800 text-white shadow-inner font-bold'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/60'
              }`}
            >
              <div className="mb-1">{m.icon}</div>
              <span className="text-[11px] font-mono tracking-tight">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flashlight Stalk Pull Lever (Tactile Automotive Lever) */}
      <div className="w-full flex items-center justify-between space-x-2 pt-1">
        <button
          id="high-beam-flash-stalk"
          onMouseDown={() => {
            soundFx.playRelayClick(soundEnabled);
            if (onPullFlash) onPullFlash();
            else handleSelect(mode === 'HIGH_BEAMS' ? 'OFF' : 'HIGH_BEAMS');
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 active:scale-95 border border-neutral-600 text-neutral-200 text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>PULL TO FLASH</span>
        </button>

        {/* Rapid Torch Toggle */}
        <button
          id="direct-torch-toggle"
          onClick={() => {
            const next = mode === 'HEADLIGHTS' || mode === 'HIGH_BEAMS' ? 'OFF' : 'HEADLIGHTS';
            handleSelect(next);
          }}
          className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            torchActive
              ? 'bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{torchActive ? 'TORCH ON' : 'TORCH OFF'}</span>
        </button>
      </div>

      {/* Footnote instruction */}
      <div className="text-[10px] text-neutral-500 font-mono text-center mt-2.5">
        Physical camera LED connects to Low/High beam positions
      </div>
    </div>
  );
};
