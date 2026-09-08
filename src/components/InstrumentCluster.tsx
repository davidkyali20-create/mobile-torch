import React from 'react';
import { HeadlightMode, DashboardTheme, SpeedUnit, GearMode } from '../types';
import { THEMES } from '../utils/theme';
import {
  Zap,
  Radio,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Fuel,
  Thermometer,
  Disc,
} from 'lucide-react';

interface InstrumentClusterProps {
  headlights: HeadlightMode;
  theme: DashboardTheme;
  speed: number;
  maxSpeed?: number;
  unit: SpeedUnit;
  rpm: number;
  gear: GearMode;
  odometer: number;
  trip: number;
  turnSignal: 'none' | 'left' | 'right' | 'hazard';
  isGpsActive: boolean;
  gpsAccuracy: number | null;
  torchActive: boolean;
  torchSupported: boolean | null;
}

export const InstrumentCluster: React.FC<InstrumentClusterProps> = ({
  headlights,
  theme,
  speed,
  maxSpeed = 240,
  unit,
  rpm,
  gear,
  odometer,
  trip,
  turnSignal,
  isGpsActive,
  gpsAccuracy,
  torchActive,
  torchSupported,
}) => {
  const currentTheme = THEMES[theme];
  const isLightsOn = headlights === 'HEADLIGHTS' || headlights === 'HIGH_BEAMS';
  const isHighBeam = headlights === 'HIGH_BEAMS';
  const isParking = headlights === 'PARKING';
  const hasGlow = isLightsOn || isParking;

  // Tachometer angle: 0 to 8000 RPM mapped to -135deg to +135deg (total 270 deg)
  const rpmRatio = Math.min(8000, Math.max(0, rpm)) / 8000;
  const rpmAngle = -135 + rpmRatio * 270;

  // Speedometer angle: 0 to maxSpeed mapped to -135deg to +135deg
  const speedRatio = Math.min(maxSpeed, Math.max(0, speed)) / maxSpeed;
  const speedAngle = -135 + speedRatio * 270;

  // Turn signal state
  const isLeftBlinking = turnSignal === 'left' || turnSignal === 'hazard';
  const isRightBlinking = turnSignal === 'right' || turnSignal === 'hazard';

  // Dynamic styles for the cluster backlighting
  const glowShadowStyle = hasGlow
    ? {
        filter: `drop-shadow(0 0 16px rgba(${currentTheme.glowRgba}, ${isHighBeam ? 0.85 : 0.65})) drop-shadow(0 0 4px rgba(${currentTheme.glowRgba}, 0.9))`,
      }
    : {
        filter: 'none',
      };

  const dialBorderStyle = hasGlow
    ? {
        borderColor: `rgba(${currentTheme.glowRgba}, 0.5)`,
        boxShadow: `inset 0 0 25px rgba(${currentTheme.glowRgba}, ${isHighBeam ? 0.35 : 0.2}), 0 0 20px rgba(${currentTheme.glowRgba}, 0.25)`,
      }
    : {
        borderColor: '#262626',
        boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
      };

  return (
    <div
      id="instrument-cluster-binnacle"
      className="relative w-full max-w-4xl mx-auto rounded-3xl p-3 sm:p-5 border border-neutral-800 bg-gradient-to-b from-[#12141a] via-[#090b10] to-[#040508] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500 select-none"
    >
      {/* Cluster Brow / Bezel Highlight */}
      <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-neutral-600/40 to-transparent rounded-full" />

      {/* Top Warning Lights Ribbon */}
      <div
        id="warning-lights-ribbon"
        className="w-full flex items-center justify-between px-4 sm:px-8 py-1.5 mb-2 bg-neutral-950/80 rounded-xl border border-neutral-800/80 text-xs font-mono"
      >
        {/* Left Turn Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isLeftBlinking
                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse'
                : 'text-neutral-700'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 6l-6 6 6 6V6z" />
            </svg>
          </div>

          {/* Seatbelt / Check Engine / Battery Status Icons */}
          <div className="hidden sm:flex items-center space-x-3 text-neutral-600 text-[11px]">
            <span className="text-amber-500/80">READY</span>
            <span className="text-neutral-500">ABS</span>
          </div>
        </div>

        {/* Center Lights & Torch Status Banner */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Low Beam Headlight Icon */}
          <div
            title="Low Beams"
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border transition-all ${
              isLightsOn
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                : 'border-transparent text-neutral-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold">Low</span>
          </div>

          {/* High Beam Icon */}
          <div
            title="High Beams / Torch"
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border transition-all ${
              isHighBeam
                ? 'bg-blue-500/25 border-blue-400 text-blue-300 shadow-[0_0_14px_rgba(96,165,250,0.9)] animate-pulse'
                : 'border-transparent text-neutral-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold">Hi</span>
          </div>

          {/* Physical Phone Torch Hardware Badge */}
          <div
            title={
              torchSupported === false
                ? 'Physical LED torch unsupported on this device/camera'
                : 'Physical phone LED torch synced with switch'
            }
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-mono transition-all ${
              torchActive
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                : torchSupported === false
                ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                torchActive ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'
              }`}
            />
            <span>
              {torchActive ? 'TORCH ON' : torchSupported === false ? 'SCREEN BEAM' : 'TORCH READY'}
            </span>
          </div>
        </div>

        {/* Right Turn Indicator */}
        <div className="flex items-center space-x-2">
          {/* GPS Status */}
          <div
            className={`hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono ${
              isGpsActive ? 'text-emerald-400' : 'text-neutral-600'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>{isGpsActive ? (gpsAccuracy ? `GPS ±${Math.round(gpsAccuracy)}m` : 'GPS FIX') : 'GPS OFF'}</span>
          </div>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isRightBlinking
                ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse'
                : 'text-neutral-700'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6l6 6-6 6V6z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Gauges Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-center">
        {/* LEFT GAUGE: TACHOMETER (RPM x 1000) */}
        <div
          id="tachometer-gauge"
          className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto w-full rounded-full p-2.5 transition-all duration-500"
          style={dialBorderStyle}
        >
          {/* Gauge Inner Face */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#161821] via-[#0d0f15] to-[#06070a] border border-neutral-800 flex items-center justify-center overflow-hidden">
            {/* Ambient Backlight Glow Ring */}
            <div
              className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
                hasGlow ? (isHighBeam ? 'opacity-90' : 'opacity-70') : 'opacity-0'
              }`}
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(${currentTheme.glowRgba}, 0.18) 0%, rgba(${currentTheme.glowRgba}, 0.05) 60%, transparent 85%)`,
              }}
            />

            {/* SVG Scale & Tick Marks */}
            <svg
              className="absolute inset-0 w-full h-full p-3 pointer-events-none"
              viewBox="0 0 200 200"
            >
              {/* Scale Arc Background */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke={hasGlow ? `rgba(${currentTheme.glowRgba}, 0.2)` : '#262626'}
                strokeWidth="2"
                strokeDasharray="368 490"
                strokeDashoffset="122"
                transform="rotate(135 100 100)"
              />

              {/* Redline zone (6.5k - 8k RPM) */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#ff2233"
                strokeWidth={hasGlow ? '4' : '2'}
                strokeDasharray="69 490"
                strokeDashoffset="-299"
                transform="rotate(135 100 100)"
                opacity={hasGlow ? 0.9 : 0.4}
                style={{
                  filter: hasGlow ? 'drop-shadow(0 0 4px #ff2233)' : 'none',
                }}
              />

              {/* Major & Minor Hash Marks for 0 - 8 (representing 0 - 8000 RPM) */}
              {[...Array(33)].map((_, i) => {
                const angle = -135 + (i / 32) * 270;
                const isMajor = i % 4 === 0;
                const isRedline = i >= 26;
                const tickColor = isRedline
                  ? '#ff3344'
                  : hasGlow
                  ? currentTheme.primary
                  : '#525252';

                return (
                  <line
                    key={i}
                    x1="100"
                    y1={isMajor ? '20' : '25'}
                    x2="100"
                    y2="30"
                    stroke={tickColor}
                    strokeWidth={isMajor ? (hasGlow ? '2.5' : '2') : '1'}
                    opacity={hasGlow ? 1 : 0.4}
                    transform={`rotate(${angle} 100 100)`}
                    style={
                      hasGlow && isMajor
                        ? {
                            filter: `drop-shadow(0 0 2px ${tickColor})`,
                          }
                        : undefined
                    }
                  />
                );
              })}

              {/* Number labels (0 through 8) */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const angle = ((-135 + (num / 8) * 270) * Math.PI) / 180;
                const r = 58;
                const x = 100 + r * Math.sin(angle);
                const y = 100 - r * Math.cos(angle);
                const isRed = num >= 7;

                return (
                  <text
                    key={num}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono font-bold text-[11px]"
                    fill={isRed ? '#ff4455' : hasGlow ? currentTheme.primary : '#737373'}
                    style={
                      hasGlow
                        ? {
                            filter: `drop-shadow(0 0 4px ${
                              isRed ? '#ff4455' : currentTheme.primary
                            })`,
                          }
                        : undefined
                    }
                  >
                    {num}
                  </text>
                );
              })}
            </svg>

            {/* Dial Labels & Digital Gear */}
            <div className="absolute top-1/3 flex flex-col items-center">
              <span
                className="text-[10px] font-mono tracking-widest uppercase transition-colors"
                style={{ color: hasGlow ? currentTheme.accent : '#525252' }}
              >
                1/min x1000
              </span>
              <span className="text-[9px] font-mono text-neutral-600">TACHO</span>
            </div>

            {/* Physical Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${rpmAngle}deg)`,
                transition: 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)',
              }}
            >
              {/* Needle Blade */}
              <div
                className="w-1.5 h-24 -translate-y-10 rounded-t-full transition-all"
                style={{
                  background: hasGlow
                    ? `linear-gradient(to top, #ffffff, ${currentTheme.needle})`
                    : '#7f1d1d',
                  boxShadow: hasGlow
                    ? `0 0 12px ${currentTheme.needle}, 0 0 4px #ffffff`
                    : 'none',
                }}
              />
            </div>

            {/* Center Cap Hub */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-800 to-neutral-700 border-2 border-neutral-600 shadow-md flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                <span className="text-[11px] font-black text-white font-mono">{gear}</span>
              </div>
            </div>

            {/* Bottom Engine Temp Indicator */}
            <div className="absolute bottom-6 flex items-center space-x-1.5 text-[10px] font-mono text-neutral-500">
              <Thermometer className="w-3 h-3 text-sky-400" />
              <span>90°C</span>
            </div>
          </div>
        </div>

        {/* CENTER CONSOLE: DIGITAL SPEEDOMETER & TRIP COMPUTER */}
        <div
          id="digital-center-console"
          className="relative w-full max-w-[340px] mx-auto py-4 px-3 sm:px-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 flex flex-col items-center justify-between shadow-inner"
          style={dialBorderStyle}
        >
          {/* Top Gear selector bar */}
          <div className="w-full flex items-center justify-around py-1 px-3 bg-neutral-900/80 rounded-lg border border-neutral-800/80 mb-2">
            {(['P', 'R', 'N', 'D', 'S'] as GearMode[]).map((g) => (
              <span
                key={g}
                className={`font-mono text-xs font-black px-2 py-0.5 rounded transition-all ${
                  gear === g
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'text-neutral-600'
                }`}
              >
                {g}
              </span>
            ))}
          </div>

          {/* Large Digital Speed Readout */}
          <div className="my-1 flex flex-col items-center">
            <div
              className="text-5xl sm:text-6xl font-black font-mono tracking-tighter transition-all"
              style={{
                color: hasGlow ? currentTheme.primary : '#a3a3a3',
                textShadow: hasGlow
                  ? `0 0 20px rgba(${currentTheme.glowRgba}, ${isHighBeam ? 0.9 : 0.7}), 0 0 6px rgba(${currentTheme.glowRgba}, 1)`
                  : 'none',
              }}
            >
              {Math.round(speed)}
            </div>
            <div
              className="text-xs font-mono font-bold tracking-widest uppercase transition-colors"
              style={{ color: hasGlow ? currentTheme.accent : '#525252' }}
            >
              {unit}
            </div>
          </div>

          {/* Digital Status Message */}
          <div className="w-full py-1.5 px-3 my-2 rounded bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500">HEADLIGHTS:</span>
            <span
              className={`font-bold uppercase ${
                headlights === 'HIGH_BEAMS'
                  ? 'text-blue-400'
                  : headlights === 'HEADLIGHTS'
                  ? 'text-emerald-400'
                  : headlights === 'PARKING'
                  ? 'text-amber-400'
                  : 'text-neutral-500'
              }`}
            >
              {headlights.replace('_', ' ')}
            </span>
          </div>

          {/* Fuel & Temperature Gauge Bars */}
          <div className="w-full space-y-1.5 my-1">
            {/* Fuel Level */}
            <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400">
              <Fuel className="w-3.5 h-3.5 text-amber-500" />
              <div className="flex-1 h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                  style={{ width: '78%' }}
                />
              </div>
              <span>78%</span>
            </div>
          </div>

          {/* Odometer & Trip Reading (LCD aesthetic) */}
          <div className="w-full mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div>
              <span className="text-neutral-600 mr-1">ODO:</span>
              <span className="text-neutral-300 font-bold">{odometer.toFixed(1)} km</span>
            </div>
            <div>
              <span className="text-neutral-600 mr-1">TRIP:</span>
              <span className="text-neutral-300 font-bold">{trip.toFixed(1)} km</span>
            </div>
          </div>
        </div>

        {/* RIGHT GAUGE: SPEEDOMETER (0 - 240 km/h or 0 - 160 mph) */}
        <div
          id="speedometer-gauge"
          className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto w-full rounded-full p-2.5 transition-all duration-500"
          style={dialBorderStyle}
        >
          {/* Gauge Inner Face */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#161821] via-[#0d0f15] to-[#06070a] border border-neutral-800 flex items-center justify-center overflow-hidden">
            {/* Ambient Backlight Glow Ring */}
            <div
              className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
                hasGlow ? (isHighBeam ? 'opacity-90' : 'opacity-70') : 'opacity-0'
              }`}
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(${currentTheme.glowRgba}, 0.18) 0%, rgba(${currentTheme.glowRgba}, 0.05) 60%, transparent 85%)`,
              }}
            />

            {/* SVG Scale & Tick Marks */}
            <svg
              className="absolute inset-0 w-full h-full p-3 pointer-events-none"
              viewBox="0 0 200 200"
            >
              {/* Scale Arc Background */}
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke={hasGlow ? `rgba(${currentTheme.glowRgba}, 0.2)` : '#262626'}
                strokeWidth="2"
                strokeDasharray="368 490"
                strokeDashoffset="122"
                transform="rotate(135 100 100)"
              />

              {/* Major & Minor Hash Marks for Speedometer */}
              {[...Array(49)].map((_, i) => {
                const angle = -135 + (i / 48) * 270;
                const isMajor = i % 4 === 0;
                const tickColor = hasGlow ? currentTheme.primary : '#525252';

                return (
                  <line
                    key={i}
                    x1="100"
                    y1={isMajor ? '20' : '25'}
                    x2="100"
                    y2="30"
                    stroke={tickColor}
                    strokeWidth={isMajor ? (hasGlow ? '2.5' : '2') : '1'}
                    opacity={hasGlow ? 1 : 0.4}
                    transform={`rotate(${angle} 100 100)`}
                    style={
                      hasGlow && isMajor
                        ? {
                            filter: `drop-shadow(0 0 2px ${tickColor})`,
                          }
                        : undefined
                    }
                  />
                );
              })}

              {/* Speed Numbers (0, 20, 40 ... 240 or 0, 20 ... 160) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240].map((val) => {
                const ratio = val / 240;
                const angle = ((-135 + ratio * 270) * Math.PI) / 180;
                const r = 58;
                const x = 100 + r * Math.sin(angle);
                const y = 100 - r * Math.cos(angle);

                return (
                  <text
                    key={val}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono font-bold text-[10px]"
                    fill={hasGlow ? currentTheme.primary : '#737373'}
                    style={
                      hasGlow
                        ? {
                            filter: `drop-shadow(0 0 3px ${currentTheme.primary})`,
                          }
                        : undefined
                    }
                  >
                    {val}
                  </text>
                );
              })}
            </svg>

            {/* Dial Labels */}
            <div className="absolute top-1/3 flex flex-col items-center">
              <span
                className="text-[10px] font-mono tracking-widest uppercase transition-colors"
                style={{ color: hasGlow ? currentTheme.accent : '#525252' }}
              >
                SPEED
              </span>
              <span className="text-[9px] font-mono text-neutral-600">{unit}</span>
            </div>

            {/* Physical Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${speedAngle}deg)`,
                transition: 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)',
              }}
            >
              {/* Needle Blade */}
              <div
                className="w-1.5 h-24 -translate-y-10 rounded-t-full transition-all"
                style={{
                  background: hasGlow
                    ? `linear-gradient(to top, #ffffff, ${currentTheme.needle})`
                    : '#7f1d1d',
                  boxShadow: hasGlow
                    ? `0 0 12px ${currentTheme.needle}, 0 0 4px #ffffff`
                    : 'none',
                }}
              />
            </div>

            {/* Center Cap Hub */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-800 to-neutral-700 border-2 border-neutral-600 shadow-md flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                <Disc className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>

            {/* Bottom Fuel Range Indicator */}
            <div className="absolute bottom-6 flex items-center space-x-1.5 text-[10px] font-mono text-neutral-500">
              <Fuel className="w-3 h-3 text-amber-400" />
              <span>540 km RANGE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
