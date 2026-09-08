import React from 'react';
import { HeadlightMode } from '../types';

interface WindshieldViewProps {
  headlights: HeadlightMode;
  speed: number;
  unit: string;
  steeringAngle: number;
  showHud?: boolean;
  beamIntensity?: number; // 10 to 100%
}

export const WindshieldView: React.FC<WindshieldViewProps> = ({
  headlights,
  speed,
  unit,
  steeringAngle,
  showHud = true,
  beamIntensity = 80,
}) => {
  const isLightsOn =
    headlights === 'HEADLIGHTS' ||
    headlights === 'HIGH_BEAMS' ||
    headlights === 'STROBE';
  const isHighBeam = headlights === 'HIGH_BEAMS' || headlights === 'STROBE';
  const isParking = headlights === 'PARKING';
  const intensityFactor = beamIntensity / 100;

  // Road curve based on steering tilt
  const roadOffset = Math.max(-60, Math.min(60, steeringAngle * 0.8));

  return (
    <div
      id="windshield-viewport"
      className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden rounded-b-2xl border-b-4 border-neutral-900 bg-neutral-950 select-none shadow-2xl transition-colors duration-700"
    >
      {/* Night Sky & Stars */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#080d1a] to-[#0d1527]">
        {/* Distant stars */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Distant Horizon Mountains */}
      <svg
        className="absolute bottom-16 sm:bottom-20 w-full h-16 opacity-30 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
      >
        <path
          d="M0,120 L0,60 Q180,10 350,55 T720,40 T1050,75 L1200,50 L1200,120 Z"
          fill="#0f172a"
        />
        <path
          d="M0,120 L0,80 Q250,30 500,70 T950,50 L1200,85 L1200,120 Z"
          fill="#090d16"
        />
      </svg>

      {/* Asphalt Highway with perspective */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 flex justify-center items-end overflow-hidden">
        {/* Road Surface Polygon */}
        <div
          className="relative w-full h-full"
          style={{
            transform: `perspective(300px) rotateX(55deg) translateX(${roadOffset}px)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Dark asphalt */}
          <div className="absolute inset-0 bg-[#0a0d14] border-x-[12px] border-neutral-800 shadow-inner" />

          {/* Road center line dashes */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 flex flex-col justify-between py-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-full h-4 sm:h-6 rounded-sm transition-colors duration-500 ${
                  isHighBeam
                    ? 'bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]'
                    : isLightsOn
                    ? 'bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-neutral-700/40'
                }`}
              />
            ))}
          </div>

          {/* Road side lines */}
          <div
            className={`absolute inset-y-0 left-4 w-1 transition-colors duration-500 ${
              isLightsOn ? 'bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-neutral-800/60'
            }`}
          />
          <div
            className={`absolute inset-y-0 right-4 w-1 transition-colors duration-500 ${
              isLightsOn ? 'bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-neutral-800/60'
            }`}
          />
        </div>
      </div>

      {/* Headlight Beams Projected Forward */}
      {/* Low Beams Cone */}
      <div
        className={`absolute bottom-0 inset-x-0 h-40 pointer-events-none transition-all duration-300 ${
          isLightsOn
            ? isHighBeam
              ? 'opacity-95'
              : 'opacity-80'
            : isParking
            ? 'opacity-25'
            : 'opacity-0'
        }`}
        style={{
          opacity: isLightsOn ? (isHighBeam ? 0.95 : 0.8) * intensityFactor : isParking ? 0.25 * intensityFactor : 0,
          background: isHighBeam
            ? 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(255,255,255,0.45) 0%, rgba(190,227,255,0.3) 40%, rgba(0,140,255,0.1) 70%, transparent 100%)'
            : isLightsOn
            ? 'radial-gradient(ellipse 60% 65% at 50% 100%, rgba(255,252,235,0.35) 0%, rgba(240,240,200,0.18) 45%, transparent 85%)'
            : 'radial-gradient(ellipse 40% 40% at 50% 100%, rgba(255,180,50,0.2) 0%, transparent 70%)',
          filter: isHighBeam ? 'blur(1px)' : 'none',
        }}
      />

      {/* High Beam Long Throw Tunnel */}
      {isHighBeam && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 sm:w-2/3 h-48 pointer-events-none transition-opacity duration-300 animate-pulse"
          style={{
            opacity: 0.9 * intensityFactor,
            background:
              'linear-gradient(to top, rgba(240, 249, 255, 0.4) 0%, rgba(186, 230, 253, 0.15) 60%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* Windshield Reflection & Tint Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-black/60 pointer-events-none" />

      {/* Rearview Mirror Silhouette at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="w-1.5 h-3 bg-neutral-800" />
        <div className="w-28 sm:w-36 h-8 bg-neutral-900/90 border border-neutral-700/60 rounded-lg shadow-lg flex items-center justify-center">
          <div className="w-24 sm:w-32 h-5 bg-neutral-950/80 rounded border border-neutral-800 flex items-center justify-between px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            <span className="text-[9px] font-mono text-neutral-400">NIGHT</span>
          </div>
        </div>
      </div>

      {/* Windshield HUD Projection (Subtle futuristic car HUD) */}
      {showHud && (
        <div
          className={`absolute top-6 left-12 sm:left-20 transition-opacity duration-500 pointer-events-none ${
            isLightsOn ? 'opacity-80' : 'opacity-40'
          }`}
        >
          <div className="text-emerald-400/90 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
            <div className="text-xs uppercase flex items-center space-x-1">
              <span>SPEED HUD</span>
              {isHighBeam && <span className="text-blue-400 font-bold ml-2">HI-BEAM</span>}
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              {Math.round(speed)}{' '}
              <span className="text-xs font-normal text-emerald-300/70">{unit}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hood of the car at bottom edge */}
      <div className="absolute -bottom-1 inset-x-0 h-6 bg-gradient-to-t from-neutral-900 to-neutral-950/80 border-t border-neutral-800/80 rounded-t-xl" />
    </div>
  );
};
