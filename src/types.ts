export type HeadlightMode = 'OFF' | 'PARKING' | 'HEADLIGHTS' | 'HIGH_BEAMS';

export type DashboardTheme = 'neon-blue' | 'amber' | 'cyber-red' | 'ice-white';

export type SpeedUnit = 'km/h' | 'mph';

export type GearMode = 'P' | 'R' | 'N' | 'D' | 'S';

export interface DashboardState {
  isIgnitionOn: boolean;
  isStartingEngine: boolean;
  headlights: HeadlightMode;
  theme: DashboardTheme;
  unit: SpeedUnit;
  gear: GearMode;
  speed: number; // in current unit (km/h or mph)
  rpm: number; // 0 - 8000
  clusterBrightness: number; // 10 to 100%
  beamIntensity: number; // 10 to 100%
  luxIntensity: number; // Calculated beam / ambient lux
  showLightSpeedMode: boolean; // Toggle light speed & intensity calculations
  odometer: number;
  trip: number;
  fuelLevel: number; // 0 - 100%
  engineTemp: number; // in Celsius (e.g. 90)
  turnSignal: 'none' | 'left' | 'right' | 'hazard';
  fogLights: boolean;
  soundEnabled: boolean;
  isSimulatingThrottle: boolean;
  isGpsActive: boolean;
  gpsAccuracy: number | null;
  torchHardwareSupported: boolean | null;
  torchActive: boolean;
  cameraPermissionGranted: boolean;
  steeringAngle: number; // in degrees -45 to 45
}

export interface ThemeColors {
  name: string;
  id: DashboardTheme;
  primary: string; // Tailwind hex
  glow: string;
  glowRgba: string;
  needle: string;
  accent: string;
}
