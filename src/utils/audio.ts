// Web Audio synthesizer for tactile automotive sounds

class DashboardAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Realistic metallic switch snap
  playSwitchClick(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // AudioContext may be restricted before user gesture
    }
  }

  // Automotive relay click (low electromagnetic click)
  playRelayClick(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext not ready
    }
  }

  // Turn signal tick or tock
  playTurnSignalTick(isTick: boolean, enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const freq = isTick ? 1400 : 1050;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore
    }
  }

  // Dual-tone European car horn (420Hz + 500Hz)
  playHorn(durationMs: number = 300, enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = durationMs / 1000;

      [420, 500].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // Ignore
    }
  }

  // Realistic Car Ignition Sequence: Starter Motor Crank -> Combustion Roar -> Idle Rumble
  playEngineIgnition(enabled: boolean = true): Promise<void> {
    if (!enabled) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        const ctx = this.getContext();
        if (!ctx) {
          resolve();
          return;
        }

        const now = ctx.currentTime;

        // Stage 1: Starter Motor Cranking Pulses (0s to 0.9s)
        const crankTimes = [0, 0.22, 0.45, 0.68];
        crankTimes.forEach((t) => {
          const crankOsc = ctx.createOscillator();
          const crankGain = ctx.createGain();

          crankOsc.type = 'sawtooth';
          crankOsc.frequency.setValueAtTime(120, now + t);
          crankOsc.frequency.exponentialRampToValueAtTime(70, now + t + 0.16);

          crankGain.gain.setValueAtTime(0.22, now + t);
          crankGain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.17);

          crankOsc.connect(crankGain);
          crankGain.connect(ctx.destination);

          crankOsc.start(now + t);
          crankOsc.stop(now + t + 0.18);
        });

        // Stage 2: Combustion Ignition Catch & Throttle Roar (0.9s to 2.2s)
        const igniteTime = now + 0.9;
        const roarOsc = ctx.createOscillator();
        const roarGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, igniteTime);
        // Rev up filter and frequency to simulate 3500 RPM burst
        filter.frequency.exponentialRampToValueAtTime(1400, igniteTime + 0.35);
        filter.frequency.exponentialRampToValueAtTime(320, igniteTime + 1.2);

        roarOsc.type = 'sawtooth';
        roarOsc.frequency.setValueAtTime(90, igniteTime);
        roarOsc.frequency.exponentialRampToValueAtTime(240, igniteTime + 0.35);
        roarOsc.frequency.exponentialRampToValueAtTime(55, igniteTime + 1.3);

        roarGain.gain.setValueAtTime(0.01, igniteTime);
        roarGain.gain.exponentialRampToValueAtTime(0.35, igniteTime + 0.15);
        roarGain.gain.exponentialRampToValueAtTime(0.12, igniteTime + 0.8);
        roarGain.gain.exponentialRampToValueAtTime(0.001, igniteTime + 1.4);

        roarOsc.connect(filter);
        filter.connect(roarGain);
        roarGain.connect(ctx.destination);

        roarOsc.start(igniteTime);
        roarOsc.stop(igniteTime + 1.45);

        // Stage 3: Sub-bass exhaust rumble
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(45, igniteTime);
        subOsc.frequency.exponentialRampToValueAtTime(85, igniteTime + 0.35);
        subOsc.frequency.exponentialRampToValueAtTime(38, igniteTime + 1.3);

        subGain.gain.setValueAtTime(0.01, igniteTime);
        subGain.gain.exponentialRampToValueAtTime(0.3, igniteTime + 0.2);
        subGain.gain.exponentialRampToValueAtTime(0.001, igniteTime + 1.4);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        subOsc.start(igniteTime);
        subOsc.stop(igniteTime + 1.45);

        setTimeout(() => {
          resolve();
        }, 2200);
      } catch {
        resolve();
      }
    });
  }

  // Realistic Engine Shutdown Sound (wind down and exhaust flutter)
  playEngineShutdown(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(15, now + 0.8);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new DashboardAudio();
