import React, { useState, useEffect, useCallback } from 'react';
import { HeadlightMode, DashboardTheme, SpeedUnit, GearMode } from './types';
import { useFlashlight } from './hooks/useFlashlight';
import { useGpsSpeed } from './hooks/useGpsSpeed';
import { useSteering } from './hooks/useSteering';
import { WindshieldView } from './components/WindshieldView';
import { InstrumentCluster } from './components/InstrumentCluster';
import { HeadlightStalk } from './components/HeadlightStalk';
import { SteeringWheel } from './components/SteeringWheel';
import { CockpitControls } from './components/CockpitControls';
import { MobileDevModal } from './components/MobileDevModal';
import { IgnitionButton } from './components/IgnitionButton';
import { soundFx } from './utils/audio';
import { Camera, Volume2, VolumeX, Sparkles, SunMedium } from 'lucide-react';

export default function App() {
  // Engine Ignition & Startup Gate States
  const [isIgnitionOn, setIsIgnitionOn] = useState(false);
  const [isStartingEngine, setIsStartingEngine] = useState(false);
  const [isNeedleSweeping, setIsNeedleSweeping] = useState(false);

  // Dashboard primary states
  const [headlights, setHeadlights] = useState<HeadlightMode>('OFF');
  const [theme, setTheme] = useState<DashboardTheme>('neon-blue');
  const [unit, setUnit] = useState<SpeedUnit>('km/h');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turnSignal, setTurnSignal] = useState<'none' | 'left' | 'right' | 'hazard'>('none');
  const [isMobileDevOpen, setIsMobileDevOpen] = useState(false);

  // Lighting & Calculation States
  const [clusterBrightness, setClusterBrightness] = useState<number>(85); // 10% to 100%
  const [beamIntensity, setBeamIntensity] = useState<number>(80); // 10% to 100%
  const [showLightSpeedMode, setShowLightSpeedMode] = useState<boolean>(false);

  // Flashlight / Hardware Torch Controller
  const {
    torchActive,
    torchSupported,
    permissionGranted,
    error: torchError,
    setTorch,
    requestPermission: requestCameraPermission,
  } = useFlashlight();

  // GPS Speedometer & Throttle Simulation Controller
  const {
    currentSpeed,
    rpm,
    gear,
    isGpsActive,
    gpsAccuracy,
    isSimulating,
    throttlePercent,
    odometer,
    trip,
    setGear,
    setIsSimulating,
    setThrottlePercent,
    applyBrake,
  } = useGpsSpeed(unit);

  // Steering Wheel Gyroscope & Drag Controller
  const {
    steeringAngle,
    isGyroActive,
    gyroSupported,
    isDragging,
    requestGyroPermission,
    onWheelPointerDown,
    resetSteering,
  } = useSteering();

  // Realistic Car Engine Start Sequence
  const handleStartEngine = async () => {
    if (isStartingEngine) return;
    setIsStartingEngine(true);

    // Trigger modern sports car gauge needle sweep
    setIsNeedleSweeping(true);
    setTimeout(() => {
      setIsNeedleSweeping(false);
    }, 1200);

    // Synthesize authentic starter motor crank & throttle roar
    await soundFx.playEngineIgnition(soundEnabled);

    setIsIgnitionOn(true);
    setIsStartingEngine(false);
  };

  // Engine Stop Handler
  const handleStopEngine = () => {
    soundFx.playEngineShutdown(soundEnabled);
    setIsIgnitionOn(false);
    setHeadlights('OFF');
    setTorch(false);
  };

  const handleToggleIgnition = () => {
    if (isIgnitionOn) {
      handleStopEngine();
    } else {
      handleStartEngine();
    }
  };

  // Sync physical flashlight whenever headlights mode changes
  const handleHeadlightsChange = useCallback(
    async (newMode: HeadlightMode) => {
      setHeadlights(newMode);
      const shouldTorchBeOn = newMode === 'HEADLIGHTS' || newMode === 'HIGH_BEAMS';
      await setTorch(shouldTorchBeOn);
    },
    [setTorch]
  );

  // High beam momentary flash
  const handlePullFlash = useCallback(async () => {
    setHeadlights('HIGH_BEAMS');
    await setTorch(true);
    setTimeout(async () => {
      setHeadlights('OFF');
      await setTorch(false);
    }, 450);
  }, [setTorch]);

  // Turn signal audio loop
  useEffect(() => {
    if (turnSignal === 'none') return;
    let isTick = true;
    const interval = setInterval(() => {
      soundFx.playTurnSignalTick(isTick, soundEnabled);
      isTick = !isTick;
    }, 400);

    return () => clearInterval(interval);
  }, [turnSignal, soundEnabled]);

  // Paddle shift handler
  const handleShiftGear = useCallback(
    (delta: number) => {
      const gears: GearMode[] = ['P', 'R', 'N', 'D', 'S'];
      const currentIndex = gears.indexOf(gear);
      const nextIndex = Math.max(0, Math.min(gears.length - 1, currentIndex + delta));
      setGear(gears[nextIndex]);
    },
    [gear, setGear]
  );

  return (
    <div
      id="car-cockpit-root"
      className="min-h-screen bg-[#050608] text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 overflow-x-hidden selection:bg-amber-500 selection:text-black font-sans relative"
    >
      {/* 1. Ignition Gate Screen (Before anyone accesses the dashboard) */}
      {!isIgnitionOn && (
        <IgnitionButton
          isIgnitionOn={isIgnitionOn}
          isStartingEngine={isStartingEngine}
          onPressStart={handleStartEngine}
          variant="screen"
        />
      )}

      {/* Top Notification / Hardware Permission Banner */}
      {!permissionGranted && torchSupported === null && (
        <div className="w-full max-w-4xl mb-2 py-2 px-3 sm:px-4 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 text-neutral-300">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Enable Camera permission to sync the virtual headlight stalk with your phone's physical LED torch
            </span>
          </div>
          <button
            onClick={() => requestCameraPermission()}
            className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shrink-0 cursor-pointer transition-all"
          >
            Authorize Torch
          </button>
        </div>
      )}

      {/* Main Cockpit Display Frame */}
      <div className="w-full max-w-5xl flex flex-col space-y-4">
        {/* 1. Windshield Highway Scenery View */}
        <WindshieldView
          headlights={headlights}
          speed={currentSpeed}
          unit={unit}
          steeringAngle={steeringAngle}
          showHud={true}
          beamIntensity={beamIntensity}
        />

        {/* 2. Illuminated Instrument Cluster (Speedometer & Tachometer with Light Speed & Intensity) */}
        <InstrumentCluster
          headlights={headlights}
          theme={theme}
          speed={currentSpeed}
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
          onToggleLightSpeedMode={() => setShowLightSpeedMode((prev) => !prev)}
        />

        {/* 3. Driver Controls: Headlight Stalk (Left) & Steering Wheel (Center) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center justify-center pt-2">
          {/* Headlight Switch Stalk (Left side, next to steering column) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <HeadlightStalk
              mode={headlights}
              onModeChange={handleHeadlightsChange}
              torchActive={torchActive}
              soundEnabled={soundEnabled}
              onPullFlash={handlePullFlash}
            />
          </div>

          {/* Interactive Steering Wheel (Center) */}
          <div className="md:col-span-7 flex justify-center md:justify-start">
            <SteeringWheel
              steeringAngle={steeringAngle}
              isGyroActive={isGyroActive}
              gyroSupported={gyroSupported}
              isDragging={isDragging}
              headlights={headlights}
              theme={theme}
              soundEnabled={soundEnabled}
              onRequestGyro={requestGyroPermission}
              onPointerDown={onWheelPointerDown}
              onResetSteering={resetSteering}
              onShiftGear={handleShiftGear}
            />
          </div>
        </div>

        {/* 4. Cockpit Controls Deck (Lighting Adjustment Dimmers, Transmission, Throttle Simulator) */}
        <CockpitControls
          theme={theme}
          onThemeChange={setTheme}
          unit={unit}
          onUnitChange={setUnit}
          gear={gear}
          onGearChange={setGear}
          isSimulating={isSimulating}
          onSimulatingToggle={setIsSimulating}
          throttlePercent={throttlePercent}
          onThrottleChange={setThrottlePercent}
          onBrake={applyBrake}
          turnSignal={turnSignal}
          onTurnSignalChange={setTurnSignal}
          soundEnabled={soundEnabled}
          onSoundToggle={() => setSoundEnabled((prev) => !prev)}
          onOpenMobileDevModal={() => setIsMobileDevOpen(true)}
          torchActive={torchActive}
          onRequestCameraPermission={requestCameraPermission}
          permissionGranted={permissionGranted}
          headlights={headlights}
          clusterBrightness={clusterBrightness}
          onClusterBrightnessChange={setClusterBrightness}
          beamIntensity={beamIntensity}
          onBeamIntensityChange={setBeamIntensity}
          showLightSpeedMode={showLightSpeedMode}
          onToggleLightSpeedMode={() => setShowLightSpeedMode((prev) => !prev)}
          isIgnitionOn={isIgnitionOn}
          isStartingEngine={isStartingEngine}
          onToggleIgnition={handleToggleIgnition}
        />
      </div>

      {/* Modal: Flutter & React Native Production Code for Mobile Developers */}
      <MobileDevModal
        isOpen={isMobileDevOpen}
        onClose={() => setIsMobileDevOpen(false)}
      />
    </div>
  );
}
