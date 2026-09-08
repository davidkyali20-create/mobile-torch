import React from 'react';
import { Power, ShieldCheck, Key, Zap } from 'lucide-react';

interface IgnitionButtonProps {
  isIgnitionOn: boolean;
  isStartingEngine: boolean;
  onPressStart: () => void;
  variant?: 'screen' | 'compact';
}

export const IgnitionButton: React.FC<IgnitionButtonProps> = ({
  isIgnitionOn,
  isStartingEngine,
  onPressStart,
  variant = 'screen',
}) => {
  if (variant === 'compact') {
    return (
      <button
        id="engine-start-stop-compact"
        onClick={onPressStart}
        disabled={isStartingEngine}
        className={`relative group p-2.5 sm:px-4 sm:py-2 rounded-2xl flex items-center space-x-2 border transition-all duration-300 cursor-pointer select-none active:scale-95 ${
          isStartingEngine
            ? 'bg-amber-600/40 border-amber-500 text-amber-300 animate-pulse'
            : isIgnitionOn
            ? 'bg-gradient-to-r from-red-950 via-neutral-900 to-neutral-950 border-red-800/80 text-red-400 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
            : 'bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-950 border-neutral-700 text-neutral-300 hover:border-amber-500 shadow-md'
        }`}
        title={isIgnitionOn ? 'Push to Stop Engine' : 'Push to Start Engine'}
      >
        <div
          className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
            isStartingEngine
              ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
              : isIgnitionOn
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              : 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
          }`}
        />
        <div className="flex flex-col text-left font-mono">
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
            {isStartingEngine ? 'CRANKING...' : isIgnitionOn ? 'ENGINE RUNNING' : 'START / STOP'}
          </span>
          <span className="text-xs font-black text-white">
            {isIgnitionOn ? 'STOP ENGINE' : 'START ENGINE'}
          </span>
        </div>
      </button>
    );
  }

  // Full-screen / Hero Ignition Gate Screen before accessing dashboard
  return (
    <div
      id="ignition-gate-screen"
      className="fixed inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden"
    >
      {/* Background Subtle Cockpit Silhouette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(5,7,12,0.95)_70%)] pointer-events-none" />

      {/* Security Immobilizer / Key Fob Status Badge */}
      <div className="relative z-10 flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-400 mb-8 shadow-inner">
        <Key className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-neutral-300 font-bold">SMART KEY DETECTED</span>
        <span className="text-neutral-600">|</span>
        <span className="text-emerald-400 flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 inline mr-1" /> IMMOBILIZER READY
        </span>
      </div>

      {/* Large Engine Start / Stop Push Button Assembly */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pulsing Breathing Light Ring around Button */}
        <div
          className={`absolute -inset-6 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
            isStartingEngine
              ? 'bg-amber-500/50 scale-110 animate-pulse'
              : 'bg-red-500/25 scale-100 animate-pulse'
          }`}
        />

        {/* Outer Knurled Billet Aluminum Bezel Ring */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2.5 bg-gradient-to-tr from-neutral-800 via-neutral-600 to-neutral-700 border-4 border-neutral-600 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_4px_6px_rgba(255,255,255,0.2)] flex items-center justify-center">
          {/* Inner Textured Recessed Channel */}
          <div className="w-full h-full rounded-full p-2 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner">
            {/* The Actual Depressible Push Button */}
            <button
              id="ignition-start-button"
              onClick={onPressStart}
              disabled={isStartingEngine}
              className={`relative w-full h-full rounded-full flex flex-col items-center justify-center border-2 transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.8)] ${
                isStartingEngine
                  ? 'bg-gradient-to-b from-amber-700 via-amber-800 to-neutral-950 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.8)]'
                  : 'bg-gradient-to-b from-[#22080a] via-[#150406] to-[#0a0203] border-red-700/80 hover:border-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.6)]'
              }`}
            >
              {/* Power Icon */}
              <div
                className={`mb-2 p-2.5 rounded-full transition-all ${
                  isStartingEngine
                    ? 'text-amber-200 bg-amber-500/30'
                    : 'text-red-400 bg-red-950/80'
                }`}
              >
                <Power className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              {/* Text: ENGINE START STOP */}
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                ENGINE
              </span>
              <span
                className={`text-xl sm:text-2xl font-mono font-black tracking-wider transition-colors ${
                  isStartingEngine ? 'text-amber-200' : 'text-red-300'
                }`}
              >
                {isStartingEngine ? 'CRANKING' : 'START'}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase mt-0.5">
                STOP
              </span>

              {/* Status LED inside button */}
              <div className="absolute bottom-4 flex items-center space-x-1">
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isStartingEngine
                      ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#fbbf24]'
                      : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-sm font-mono text-neutral-300 font-bold tracking-wide">
            {isStartingEngine
              ? 'STARTING ENGINE... HOLD TIGHT'
              : 'PRESS BUTTON TO START CAR & ACCESS DASHBOARD'}
          </p>
          <p className="text-xs font-mono text-neutral-500">
            Real automotive starter crank, engine roar & gauge needle sweep
          </p>
        </div>
      </div>
    </div>
  );
};
