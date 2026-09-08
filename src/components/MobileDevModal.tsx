import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Smartphone, ShieldCheck, Layers } from 'lucide-react';

interface MobileDevModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDevModal: React.FC<MobileDevModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'react-native' | 'flutter' | 'permissions'>('react-native');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const reactNativeCode = `// App.tsx - Complete Cross-Platform React Native (Expo) Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as Location from 'expo-location';
import { Gyroscope } from 'expo-sensors';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type HeadlightMode = 'OFF' | 'PARKING' | 'HEADLIGHTS' | 'HIGH_BEAMS';

export default function App() {
  const [headlightMode, setHeadlightMode] = useState<HeadlightMode>('OFF');
  const [torchActive, setTorchActive] = useState(false);
  const [speed, setSpeed] = useState(0); // km/h
  const [rpm, setRpm] = useState(800);
  const [hasCameraPerm, setHasCameraPerm] = useState<boolean | null>(null);
  const [hasLocationPerm, setHasLocationPerm] = useState<boolean | null>(null);
  
  // Steering wheel rotation
  const steerAnim = useRef(new Animated.Value(0)).current;
  const [steeringAngle, setSteeringAngle] = useState(0);

  // 1. Hardware Permissions & Device Setup
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPerm(cameraStatus.status === 'granted');

      const locStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPerm(locStatus.status === 'granted');

      if (locStatus.status === 'granted') {
        // High accuracy GPS location watcher
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (pos) => {
            const speedMps = pos.coords.speed;
            if (speedMps !== null && speedMps >= 0) {
              const kmh = Math.round(speedMps * 3.6);
              setSpeed(kmh);
              setRpm(800 + ((kmh % 40) / 40) * 2600);
            }
          }
        );
      }
    })();

    // 2. Gyroscope sensor for tilt steering
    Gyroscope.setUpdateInterval(50);
    const sub = Gyroscope.addListener(({ y }) => {
      // y axis rotation maps to wheel tilt
      const targetDeg = Math.max(-45, Math.min(45, y * 35));
      Animated.spring(steerAnim, {
        toValue: targetDeg,
        useNativeDriver: true,
      }).start();
      setSteeringAngle(targetDeg);
    });

    return () => sub.remove();
  }, []);

  // 3. Physical Torch Flashlight Control
  const toggleHeadlights = (mode: HeadlightMode) => {
    setHeadlightMode(mode);
    const shouldTorchBeOn = mode === 'HEADLIGHTS' || mode === 'HIGH_BEAMS';
    setTorchActive(shouldTorchBeOn);
  };

  const isLit = headlightMode !== 'OFF';
  const glowColor = headlightMode === 'HIGH_BEAMS' ? '#00e5ff' : '#ff9900';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hidden background CameraView maintaining torch lock */}
      {hasCameraPerm && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchActive}
        />
      )}

      {/* Dark Cockpit Overlay */}
      <View style={styles.cockpitOverlay}>
        {/* Top Windshield & Headlight Beam Projection */}
        <View style={styles.windshield}>
          {torchActive && <View style={styles.headlightBeam} />}
          <Text style={styles.hudText}>{speed} KM/H</Text>
        </View>

        {/* Illuminated Instrument Cluster */}
        <View style={[styles.clusterContainer, isLit && { borderColor: glowColor }]}>
          {/* Tachometer */}
          <View style={styles.gaugeBox}>
            <Text style={[styles.gaugeVal, isLit && { color: glowColor }]}>
              {Math.round(rpm)}
            </Text>
            <Text style={styles.gaugeLabel}>RPM</Text>
          </View>

          {/* Digital Speedometer */}
          <View style={styles.centerSpeedBox}>
            <Text style={[styles.speedText, isLit && { color: glowColor }]}>{speed}</Text>
            <Text style={styles.speedUnit}>KM/H</Text>
          </View>

          {/* Torch & Lights Status */}
          <View style={styles.gaugeBox}>
            <Text style={[styles.statusTag, torchActive && styles.activeTag]}>
              {torchActive ? 'TORCH ON' : 'TORCH OFF'}
            </Text>
          </View>
        </View>

        {/* Headlights Switch / Stalk */}
        <View style={styles.stalkContainer}>
          <Text style={styles.stalkLabel}>HEADLIGHT / TORCH STALK</Text>
          <View style={styles.stalkRow}>
            {(['OFF', 'PARKING', 'HEADLIGHTS', 'HIGH_BEAMS'] as HeadlightMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => toggleHeadlights(m)}
                style={[styles.stalkBtn, headlightMode === m && styles.stalkBtnActive]}
              >
                <Text style={styles.stalkBtnText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interactive Steering Wheel */}
        <Animated.View
          style={[
            styles.steeringWheel,
            { transform: [{ rotate: steerAnim.interpolate({
                inputRange: [-45, 45],
                outputRange: ['-45deg', '45deg']
              }) }] },
            isLit && { shadowColor: glowColor, shadowOpacity: 0.6 }
          ]}
        >
          <View style={styles.wheelSpoke} />
          <View style={styles.hornBoss}>
            <Text style={styles.hornText}>HORN</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b10' },
  cockpitOverlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  windshield: { width: '100%', height: 120, backgroundColor: '#05070d', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  headlightBeam: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.15)' },
  hudText: { color: '#34d399', fontSize: 24, fontWeight: 'bold' },
  clusterContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20, backgroundColor: '#11141d', borderRadius: 24, borderWidth: 1, borderColor: '#262626' },
  gaugeBox: { alignItems: 'center' },
  gaugeVal: { fontSize: 20, fontWeight: 'bold', color: '#737373' },
  gaugeLabel: { fontSize: 10, color: '#a3a3a3' },
  centerSpeedBox: { alignItems: 'center' },
  speedText: { fontSize: 48, fontWeight: '900', color: '#737373' },
  speedUnit: { fontSize: 12, color: '#a3a3a3' },
  statusTag: { fontSize: 10, fontWeight: 'bold', color: '#737373', padding: 4, borderRadius: 4, backgroundColor: '#1f2937' },
  activeTag: { color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.2)' },
  stalkContainer: { width: '100%', alignItems: 'center', marginVertical: 12 },
  stalkLabel: { color: '#9ca3af', fontSize: 10, marginBottom: 8, letterSpacing: 1 },
  stalkRow: { flexDirection: 'row', backgroundColor: '#000', borderRadius: 12, padding: 4 },
  stalkBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  stalkBtnActive: { backgroundColor: '#f59e0b' },
  stalkBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  steeringWheel: { width: 160, height: 160, borderRadius: 80, borderWidth: 14, borderColor: '#1f242e', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  wheelSpoke: { position: 'absolute', width: '80%', height: 12, backgroundColor: '#2d3748' },
  hornBoss: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4b5563' },
  hornText: { color: '#9ca3af', fontSize: 9, fontWeight: 'bold' },
});`;

  const flutterCode = `// main.dart - Complete Cross-Platform Flutter Implementation
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:torch_light/torch_light.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';

void main() => runApp(const CarFlashlightDashboardApp());

class CarFlashlightDashboardApp extends StatelessWidget {
  const CarFlashlightDashboardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Car Dashboard Flashlight',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF07090E),
      ),
      home: const DashboardCockpitScreen(),
    );
  }
}

enum HeadlightMode { off, parking, headlights, highBeams }

class DashboardCockpitScreen extends StatefulWidget {
  const DashboardCockpitScreen({super.key});

  @override
  State<DashboardCockpitScreen> createState() => _DashboardCockpitScreenState();
}

class _DashboardCockpitScreenState extends State<DashboardCockpitScreen> {
  HeadlightMode _mode = HeadlightMode.off;
  bool _isTorchOn = false;
  double _speedKmh = 0.0;
  double _rpm = 800.0;
  double _steeringAngle = 0.0; // In degrees

  StreamSubscription<Position>? _positionSub;
  StreamSubscription<AccelerometerEvent>? _sensorSub;

  @override
  void initState() {
    super.initState();
    _initPermissionsAndSensors();
  }

  Future<void> _initPermissionsAndSensors() async {
    // 1. Geolocator permissions
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
      _positionSub = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.bestForNavigation,
          distanceFilter: 1,
        ),
      ).listen((Position pos) {
        if (pos.speed >= 0) {
          setState(() {
            _speedKmh = (pos.speed * 3.6);
            _rpm = 800 + ((_speedKmh % 40) / 40) * 2400;
          });
        }
      });
    }

    // 2. Gyroscope / Accelerometer for tilt steering
    _sensorSub = accelerometerEvents.listen((AccelerometerEvent event) {
      // Tilt X corresponds to landscape phone steering
      setState(() {
        _steeringAngle = (-event.x * 6.0).clamp(-45.0, 45.0);
      });
    });
  }

  // 3. Physical Hardware Torch Control
  Future<void> _setHeadlights(HeadlightMode mode) async {
    setState(() => _mode = mode);
    final shouldBeOn = (mode == HeadlightMode.headlights || mode == HeadlightMode.highBeams);

    try {
      if (shouldBeOn && !_isTorchOn) {
        await TorchLight.enableTorch();
        setState(() => _isTorchOn = true);
      } else if (!shouldBeOn && _isTorchOn) {
        await TorchLight.disableTorch();
        setState(() => _isTorchOn = false);
      }
    } catch (e) {
      debugPrint("Torch error: $e");
    }
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _sensorSub?.cancel();
    TorchLight.disableTorch().catchError((_) {});
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLit = _mode != HeadlightMode.off;
    final glowColor = _mode == HeadlightMode.highBeams ? const Color(0xFF00E5FF) : const Color(0xFFFF9900);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 1. Windshield & Night View
              Container(
                height: 140,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0E17),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white10),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_isTorchOn)
                      Container(
                        decoration: BoxDecoration(
                          gradient: RadialGradient(
                            colors: [Colors.white.withOpacity(0.35), Colors.transparent],
                            radius: 0.8,
                          ),
                        ),
                      ),
                    Text(
                      "\${_speedKmh.round()} KM/H",
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF34D399),
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
              ),

              // 2. Instrument Cluster with Dynamic Backlighting
              AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF10131A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: isLit ? glowColor.withOpacity(0.6) : const Color(0xFF262626),
                    width: isLit ? 2 : 1,
                  ),
                  boxShadow: isLit
                      ? [BoxShadow(color: glowColor.withOpacity(0.35), blurRadius: 20, spreadRadius: 2)]
                      : [],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    // Tacho
                    Column(
                      children: [
                        Text(
                          "\${(_rpm / 1000).toStringAsFixed(1)}",
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: isLit ? glowColor : Colors.grey[600],
                          ),
                        ),
                        const Text("x1000 RPM", style: TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    ),
                    // Speed
                    Column(
                      children: [
                        Text(
                          "\${_speedKmh.round()}",
                          style: TextStyle(
                            fontSize: 52,
                            fontWeight: FontWeight.w900,
                            color: isLit ? glowColor : Colors.grey[500],
                          ),
                        ),
                        const Text("KM/H", style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ),

              // 3. Rotary Headlight Stalk Switch
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: HeadlightMode.values.map((m) {
                    final selected = _mode == m;
                    return ElevatedButton(
                      onPressed: () => _setHeadlights(m),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: selected ? const Color(0xFFFF9900) : const Color(0xFF1E2430),
                        foregroundColor: selected ? Colors.black : Colors.white70,
                      ),
                      child: Text(m.name.toUpperCase()),
                    );
                  }).toList(),
                ),
              ),

              // 4. Interactive Tiltable Steering Wheel
              Transform.rotate(
                angle: _steeringAngle * (3.14159 / 180.0),
                child: Container(
                  width: 170,
                  height: 170,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF262C38), width: 18),
                    boxShadow: isLit
                        ? [BoxShadow(color: glowColor.withOpacity(0.2), blurRadius: 16)]
                        : [],
                  ),
                  child: Center(
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF161A22),
                      ),
                      child: const Center(
                        child: Text("HORN", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;

  const permissionsDocs = `# Mobile Device Permissions Setup Guide

### 1. Android Configuration (AndroidManifest.xml)
Path: android/app/src/main/AndroidManifest.xml

\`\`\`xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Camera & Physical LED Torch / Flashlight Permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />

    <!-- Real-time GPS Speedometer Permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="true" />

    <!-- Gyroscope / Device Motion for Steering Tilt -->
    <uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />
</manifest>
\`\`\`

---

### 2. iOS Configuration (Info.plist)
Path: ios/Runner/Info.plist (Flutter) or ios/<App>/Info.plist (React Native)

\`\`\`xml
<dict>
    <!-- Camera Torch LED Description -->
    <key>NSCameraUsageDescription</key>
    <string>Camera and LED flashlight access is required to control the car dashboard headlights.</string>

    <!-- GPS Speedometer Description -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Your location is required to calculate real-time driving speed in km/h for the speedometer.</string>
    <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
    <string>GPS access is required for real-time dashboard speedometer tracking.</string>

    <!-- Motion Sensors -->
    <key>NSMotionUsageDescription</key>
    <string>Motion sensors are used to tilt the virtual steering wheel dynamically.</string>
</dict>
\`\`\`

---

### 3. CLI Setup Commands

**React Native (Expo):**
\`\`\`bash
npx create-expo-app CarDashboardFlashlight --template blank-typescript
cd CarDashboardFlashlight
npx expo install expo-camera expo-location expo-sensors react-native-svg
npx expo run:android # or npx expo run:ios
\`\`\`

**Flutter:**
\`\`\`bash
flutter create car_dashboard_flashlight
cd car_dashboard_flashlight
flutter pub add torch_light geolocator sensors_plus
flutter run
\`\`\`
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-mono font-bold text-white">
              Senior Mobile Dev Specs & Production Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-5 py-2.5 bg-neutral-950/80 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('react-native')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'react-native'
                ? 'bg-blue-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            React Native (Expo)
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'flutter'
                ? 'bg-sky-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Flutter (Dart)
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'permissions'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Permissions & Setup Guide
          </button>
        </div>

        {/* Code / Content Area */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-neutral-300">
          {activeTab === 'react-native' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Complete Single-Page App.tsx (React Native + Expo)</span>
                <button
                  onClick={() => copyToClipboard(reactNativeCode, 'rn')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                >
                  {copiedSection === 'rn' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY CODE</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto text-[11px] leading-relaxed text-blue-200/90 font-mono">
                {reactNativeCode}
              </pre>
            </div>
          )}

          {activeTab === 'flutter' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Complete Single-File main.dart (Flutter)</span>
                <button
                  onClick={() => copyToClipboard(flutterCode, 'fl')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                >
                  {copiedSection === 'fl' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY CODE</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto text-[11px] leading-relaxed text-sky-200/90 font-mono">
                {flutterCode}
              </pre>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Device Permissions (Android & iOS Manifests)</span>
                <button
                  onClick={() => copyToClipboard(permissionsDocs, 'perm')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                >
                  {copiedSection === 'perm' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY GUIDE</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto text-[11px] leading-relaxed text-emerald-200/90 font-mono whitespace-pre-wrap">
                {permissionsDocs}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Both native solutions support physical torch toggle and GPS speedometer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
