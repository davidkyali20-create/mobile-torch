import React, { useState, useEffect, useCallback } from 'react';
import { HeadlightMode, DashboardTheme, SpeedUnit, GearMode } from '../types';
import { THEMES } from '../utils/theme';
import { soundFx } from '../utils/audio';
import { WindshieldView } from './WindshieldView';
import { InstrumentCluster } from './InstrumentCluster';
import { HeadlightStalk } from './HeadlightStalk';
import { SteeringWheel } from './SteeringWheel';
import { IgnitionButton } from './IgnitionButton';
import {
  Smartphone,
  RotateCcw,
  Compass,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface CockpitPOVProps {
  headlights: HeadlightMode;
  onHeadlightsChange: (mode: HeadlightMode) => void;
  onPullFlash: () => void;
  onTriggerStrobe: () => void;
  torchActive: boolean;
  isStrobeActive: boolean;
  speed: number;
  rpm: number;
  gear: GearMode;
  unit: SpeedUnit;
  theme: DashboardTheme;
  clusterBrightness: number;
  onClusterBrightnessChange: (b: number) => void;
  beamIntensity: number;
  onBeamIntensityChange: (i: number) => void;
  odometer: number;
  trip: number;
  turnSignal: 'none' | 'left' | 'right' | 'hazard';
  isGpsActive: boolean;
  gpsAccuracy: number | null;
  torchSupported: boolean | null;
  steeringAngle: number;
  isGyroActive: boolean;
  gyroSupported: boolean;
  isDragging: boolean;
  onRequestGyro: () => void;
  onWheelPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onResetSteering: () => void;
  onShiftGear: (delta: number) => void;
  soundEnabled: boolean;
  showLightSpeedMode: boolean;
  onToggleLightSpeedMode: () => void;
  isNeedleSweeping: boolean;
  isIgnitionOn: boolean;
  isStartingEngine: boolean;
  onToggleIgnition: () => void;
  throttlePercent?: number;
  onThrottleChange?: (pct: number) => void;
  onBrake?: () => void;
  isSimulating?: boolean;
  onSimulatingToggle?: (s: boolean) => void;
  onGearChange?: (g: GearMode) => void;
  onSteerManual?: (angle: number) => void;
}

export const CockpitPOV: React.FC<CockpitPOVProps> = ({
  headlights,
  onHeadlightsChange,
  onPullFlash,
  onTriggerStrobe,
  torchActive,
  isStrobeActive,
  speed,
  rpm,
  gear,
  unit,
  theme,
  clusterBrightness,
  onClusterBrightnessChange,
  beamIntensity,
  onBeamIntensityChange,
  odometer,
  trip,
  turnSignal,
  isGpsActive,
  gpsAccuracy,
  torchSupported,
  steeringAngle,
  isGyroActive,
  gyroSupported,
  isDragging,
  onRequestGyro,
  onWheelPointerDown,
  onResetSteering,
  onShiftGear,
  soundEnabled,
  showLightSpeedMode,
  onToggleLightSpeedMode,
  isNeedleSweeping,
  isIgnitionOn,
  isStartingEngine,
  onToggleIgnition,
  throttlePercent = 0,
  onThrottleChange,
  onBrake,
  isSimulating = true,
  onSimulatingToggle,
  onGearChange,
  onSteerManual,
}) => {
  const currentTheme = THEMES[theme];
  const isLightsOn =
    headlights === 'HEADLIGHTS' ||
    headlights === 'HIGH_BEAMS' ||
    headlights === 'STROBE';
  const isParking = headlights === 'PARKING';
  const hasGlow = isLightsOn || isParking;
  const dimmerRatio = clusterBrightness / 100;

  // Camera perspective view mode:
  // 'driver' -> Authentic in-car driver's perspective (wheel in foreground overlapping the gauges behind it)
  // 'gauges' -> Leaned-in view (wheel lowered so all gauge faces are completely unobstructed)
  const [viewMode, setViewMode] = useState<'driver' | 'gauges'>('driver');

  // Keyboard driving controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (onSimulatingToggle && !isSimulating) onSimulatingToggle(true);
        if (onThrottleChange) onThrottleChange(80);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        e.preventDefault();
        if (onBrake) onBrake();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (onSteerManual) {
          onSteerManual(Math.max(-80, steeringAngle - 15));
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (onSteerManual) {
          onSteerManual(Math.min(80, steeringAngle + 15));
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onPullFlash();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        soundFx.playHorn(350, soundEnabled);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const cycle: HeadlightMode[] = ['OFF', 'PARKING', 'HEADLIGHTS', 'HIGH_BEAMS', 'STROBE'];
        const nextIdx = (cycle.indexOf(headlights) + 1) % cycle.length;
        onHeadlightsChange(cycle[nextIdx]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (onThrottleChange) onThrottleChange(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    isSimulating,
    onSimulatingToggle,
    onThrottleChange,
    onBrake,
    onSteerManual,
    steeringAngle,
    onPullFlash,
    soundEnabled,
    headlights,
    onHeadlightsChange,
  ]);

  return (
    <div
      id="first-person-cockpit-pov"
      className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-neutral-800 bg-[#06080d] shadow-[0_30px_90px_rgba(0,0,0,0.98)] flex flex-col select-none"
    >
      {/* 1. TOP VIEWPORT: WINDSHIELD & NIGHT HIGHWAY (Driver's Forward Sightline) */}
      <div className="relative w-full z-10">
        <WindshieldView
          headlights={headlights}
          speed={speed}
          unit={unit}
          steeringAngle={steeringAngle}
          showHud={true}
          beamIntensity={beamIntensity}
        />

        {/* View Mode & HUD Controls Overlay at top right of windshield */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center space-x-1.5 sm:space-x-2">
          {/* Camera View Toggle */}
          <button
            id="camera-view-toggle-btn"
            onClick={() => {
              soundFx.playSwitchClick(soundEnabled);
              setViewMode((prev) => (prev === 'driver' ? 'gauges' : 'driver'));
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-950/85 backdrop-blur border border-neutral-700/80 text-neutral-300 hover:text-white font-mono text-[11px] font-bold shadow-md cursor-pointer transition-all hover:bg-neutral-900"
            title="Toggle between authentic driver seat POV and closer gauge focus"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {viewMode === 'driver' ? 'IN-CAR POV (ACTIVE)' : 'GAUGE FOCUS (ACTIVE)'}
            </span>
            <span className="sm:hidden">
              {viewMode === 'driver' ? 'POV' : 'FOCUS'}
            </span>
          </button>
        </div>

        {/* Dashboard Upper Cowl & Windshield Air Defroster Vents */}
        <div className="w-full h-3 sm:h-4 bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-neutral-800 flex justify-center items-center px-6">
          <div className="w-1/3 h-1 bg-neutral-800/80 rounded-full" />
        </div>
      </div>

      {/* 2. DASHBOARD MAIN ARCHITECTURE & DEEP INSTRUMENT BINNACLE */}
      {/* The gauges sit inside this recessed well, and the steering wheel sits in the foreground */}
      <div
        id="dashboard-cowl-binnacle"
        className="relative w-full bg-gradient-to-b from-[#10131a] via-[#080a0f] to-[#030406] px-2 sm:px-4 pt-2.5 sm:pt-4 pb-4 overflow-visible"
      >
        {/* Ambient Cockpit LED Strip (Contour along the dashboard seam) */}
        <div
          className={`absolute top-0 inset-x-0 h-1 transition-all duration-700 pointer-events-none ${
            hasGlow ? 'opacity-90' : 'opacity-10'
          }`}
          style={{
            background: `linear-gradient(90deg, transparent 5%, rgba(${currentTheme.glowRgba}, ${0.8 * dimmerRatio}) 50%, transparent 95%)`,
            boxShadow: hasGlow
              ? `0 0 16px rgba(${currentTheme.glowRgba}, ${0.9 * dimmerRatio})`
              : 'none',
          }}
        />

        {/* RECESSED GAUGES LAYER (Sitting firmly mounted in the background inside the dashboard cowl) */}
        <div
          id="recessed-gauges-well"
          className="relative w-full z-10 transition-all duration-300"
        >
          <InstrumentCluster
            headlights={headlights}
            theme={theme}
            speed={speed}
            maxSpeed={unit === 'km/h' ? 240 : 160}
            unit={unit}
            rpm={rpm}
            gear={gear}
            odometer={odometer}
            trip={trip}
            turnSignal={turnSignal}
            isGpsActive={isGpsActive}
            gpsAccuracy={gpsAccuracy}
            torchActive={torchActive}
            torchSupported={torchSupported}
            clusterBrightness={clusterBrightness}
            beamIntensity={beamIntensity}
            isNeedleSweeping={isNeedleSweeping}
            showLightSpeedMode={showLightSpeedMode}
            onToggleLightSpeedMode={onToggleLightSpeedMode}
          />
        </div>

        {/* 3. STEERING COLUMN & DRIVER FOREGROUND ASSEMBLY */}
        {/*
          In authentic driver's perspective:
          - The steering wheel is mounted directly in front of the instrument cluster
          - The top rim arches across the cluster
          - The open upper window frames the center digital speedometer and telemetry
          - The left & right quadrants reveal the tachometer and speedometer dials behind
          - On the left of the column, the Headlight Stalk sticks out clearly past the wheel rim
          - On the right of the column, the Engine Start/Stop button is docked
        */}
        <div
          id="steering-column-assembly"
          className={`relative w-full flex items-center justify-center transition-all duration-300 z-30 ${
            viewMode === 'driver'
              ? '-mt-36 sm:-mt-48 md:-mt-56'
              : '-mt-6 sm:-mt-8'
          }`}
        >
          {/* Mechanical Steering Column Body (Underneath wheel hub) */}
          <div className="absolute w-44 sm:w-56 h-36 sm:h-44 rounded-t-3xl bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 border-t-2 border-neutral-700 shadow-[0_-20px_40px_rgba(0,0,0,0.95)] flex items-start justify-between px-3 pt-2 pointer-events-none">
            {/* Column stitching texture */}
            <div className="w-full flex justify-between px-2 pt-1">
              <div className="w-0.5 h-full border-r border-dashed border-neutral-600/40" />
              <div className="w-0.5 h-full border-l border-dashed border-neutral-600/40" />
            </div>
          </div>

          {/* LEFT COLUMN STALK: Interactive Headlight & Flash Stalk */}
          {/* Protrudes from behind the wheel rim on the left at the 9:30 o'clock position */}
          <div
            id="column-stalk-dock"
            className="absolute left-1 sm:left-4 md:left-10 top-2 sm:top-6 z-40 flex flex-col items-start pointer-events-auto"
          >
            <HeadlightStalk
              mode={headlights}
              onModeChange={onHeadlightsChange}
              torchActive={torchActive}
              isStrobeActive={isStrobeActive}
              soundEnabled={soundEnabled}
              beamIntensity={beamIntensity}
              onBeamIntensityChange={onBeamIntensityChange}
              clusterBrightness={clusterBrightness}
              onClusterBrightnessChange={onClusterBrightnessChange}
              onPullFlash={onPullFlash}
              onTriggerStrobe={onTriggerStrobe}
            />

            {/* Tactical Stalk Torch Status Badge */}
            <div className="mt-1 flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-neutral-950/90 border border-neutral-800 text-[10px] font-mono text-neutral-400 shadow">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  torchActive ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'
                }`}
              />
              <span className="font-bold text-neutral-300">
                {headlights === 'STROBE'
                  ? 'STROBE ACTIVE'
                  : torchActive
                  ? 'TORCH ON'
                  : 'TORCH OFF'}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN FLANK: Engine Start / Stop Button & Ignition Dock */}
          {/* Protrudes from behind the wheel rim on the right at the 2:30 o'clock position */}
          <div
            id="column-ignition-dock"
            className="absolute right-2 sm:right-6 md:right-12 top-2 sm:top-6 z-40 flex flex-col items-end pointer-events-auto"
          >
            <IgnitionButton
              isIgnitionOn={isIgnitionOn}
              isStartingEngine={isStartingEngine}
              onPressStart={onToggleIgnition}
              variant="compact"
            />
          </div>

          {/* 4. FOREGROUND STEERING WHEEL */}
          {/* Positioned in front of the gauges; turning the wheel spins the wheel while gauges remain static behind it */}
          <div
            id="foreground-steering-wheel"
            className="relative z-30 flex flex-col items-center pointer-events-auto"
          >
            <SteeringWheel
              steeringAngle={steeringAngle}
              isGyroActive={isGyroActive}
              gyroSupported={gyroSupported}
              isDragging={isDragging}
              headlights={headlights}
              theme={theme}
              soundEnabled={soundEnabled}
              onRequestGyro={onRequestGyro}
              onPointerDown={onWheelPointerDown}
              onResetSteering={onResetSteering}
              onShiftGear={onShiftGear}
              showTopControlBar={false}
            />
          </div>
        </div>

        {/* 4. DRIVER LOWER DECK: PEDALS, TRANSMISSION & QUICK CONTROLS */}
        {/* Sits naturally below the steering wheel in the driver's lower sightline */}
        <div
          id="driver-lower-console-deck"
          className="relative z-40 mt-3 pt-3 border-t border-neutral-800/80 bg-neutral-950/80 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 font-mono text-xs"
        >
          {/* Left: Steering Gyro Sensor & Center Wheel */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              id="deck-gyro-toggle"
              onClick={onRequestGyro}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                isGyroActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
              title="Toggle phone tilt gyroscope steering"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isGyroActive ? 'GYRO TILT: ON' : 'PHONE GYRO'}</span>
            </button>

            <div className="flex items-center space-x-1 text-neutral-300 px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800 font-bold">
              <Compass className="w-3.5 h-3.5 text-neutral-500" />
              <span>{Math.round(steeringAngle)}°</span>
            </div>

            {Math.abs(steeringAngle) > 2 && (
              <button
                onClick={onResetSteering}
                className="px-2 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg border border-neutral-800 cursor-pointer flex items-center space-x-1"
                title="Center steering wheel"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">CENTER</span>
              </button>
            )}
          </div>

          {/* Center: Transmission Gear Buttons (P R N D S) */}
          {onGearChange && (
            <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              {(['P', 'R', 'N', 'D', 'S'] as GearMode[]).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    soundFx.playSwitchClick(soundEnabled);
                    onGearChange(g);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                    gear === g
                      ? 'bg-amber-500 text-neutral-950 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Right: Driver Pedals (Brake & Accelerator / Gas) */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Brake Pedal */}
            <button
              id="pov-brake-pedal"
              onClick={onBrake}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl bg-gradient-to-t from-red-950 to-neutral-900 hover:from-red-900 hover:to-neutral-800 active:scale-95 border border-red-900/60 text-red-300 font-black cursor-pointer shadow transition-all flex items-center justify-center space-x-1.5"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span>BRAKE</span>
            </button>

            {/* Gas / Throttle Pedal */}
            <button
              id="pov-gas-pedal"
              onMouseDown={() => {
                if (onSimulatingToggle && !isSimulating) onSimulatingToggle(true);
                if (onThrottleChange) onThrottleChange(75);
              }}
              onMouseUp={() => {
                if (onThrottleChange) onThrottleChange(0);
              }}
              onMouseLeave={() => {
                if (onThrottleChange) onThrottleChange(0);
              }}
              onTouchStart={() => {
                if (onSimulatingToggle && !isSimulating) onSimulatingToggle(true);
                if (onThrottleChange) onThrottleChange(75);
              }}
              onTouchEnd={() => {
                if (onThrottleChange) onThrottleChange(0);
              }}
              className={`flex-1 sm:flex-none py-2 px-4 rounded-xl border font-black cursor-pointer shadow transition-all select-none flex items-center justify-center space-x-1.5 ${
                throttlePercent > 0
                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)] scale-95'
                  : 'bg-gradient-to-t from-neutral-800 to-neutral-900 hover:from-neutral-750 hover:to-neutral-850 border-neutral-700 text-neutral-200'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  throttlePercent > 0 ? 'bg-white' : 'bg-emerald-500'
                }`}
              />
              <span>GAS (HOLD)</span>
            </button>
          </div>
        </div>

        {/* Keyboard Driving Shortcuts Hint */}
        <div className="w-full mt-2 text-center text-[10px] font-mono text-neutral-500">
          <span className="text-neutral-400 font-bold">DRIVE:</span> [W / Up] Gas • [S / Down / Space] Brake • [A / D / Drag] Steer • [F] High Beam Flash • [H] Horn • [L] Lights
        </div>
      </div>
    </div>
  );
};
