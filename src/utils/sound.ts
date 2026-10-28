// Gentle Web Audio API synthesized tactile card sounds & looping nature-inspired ambient atmosphere

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isAmbientPlaying = false;
  private ambientMasterGain: GainNode | null = null;
  private ambientSourceNodes: AudioNode[] = [];
  private ambientChimeInterval: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playShuffle(enabled: boolean) {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + i * 28, now + i * 0.045);
      osc.frequency.exponentialRampToValueAtTime(90, now + i * 0.045 + 0.04);

      gain.gain.setValueAtTime(0.04, now + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.045);
    }
  }

  public playDeal(enabled: boolean) {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playFlip(enabled: boolean) {
    if (!enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [392.0, 523.25]; // G4 to C5 gentle fifth
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.045, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.05 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.24);
    });
  }

  /**
   * Starts or stops the subtle, looping nature-inspired background atmosphere
   * (soft forest wind + gentle stream murmur + occasional distant harmonic droplets)
   */
  public setAmbientAtmosphere(shouldPlay: boolean) {
    if (shouldPlay) {
      if (this.isAmbientPlaying) {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        return;
      }
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  private startAmbientLoop() {
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopAmbientLoopImmediate();
    this.isAmbientPlaying = true;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 1.8); // Smooth 1.8s fade-in
    masterGain.connect(ctx.destination);
    this.ambientMasterGain = masterGain;

    // 1. Create a 6-second looping pink/brown noise buffer for organic breeze & stream murmur
    const bufferSize = ctx.sampleRate * 6;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.018;
      b6 = white * 0.115926;
    }

    const breezeSource = ctx.createBufferSource();
    breezeSource.buffer = noiseBuffer;
    breezeSource.loop = true;

    // Bandpass filter swept slowly by an LFO to mimic forest canopy wind swells
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(340, now);
    windFilter.Q.setValueAtTime(1.8, now);

    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.11, now); // ~9 second natural breath cycle
    windLfoGain.gain.setValueAtTime(140, now);

    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.45, now);

    breezeSource.connect(windFilter);
    windFilter.connect(breezeGain);
    breezeGain.connect(masterGain);

    // 2. Warm, low-volume earth harmonic pad (C3 & G3 pure sine waves)
    const rootOsc = ctx.createOscillator();
    const fifthOsc = ctx.createOscillator();
    const padGain = ctx.createGain();

    rootOsc.type = 'sine';
    rootOsc.frequency.setValueAtTime(130.81, now); // C3
    fifthOsc.type = 'sine';
    fifthOsc.frequency.setValueAtTime(196.0, now); // G3
    padGain.gain.setValueAtTime(0.035, now);

    rootOsc.connect(padGain);
    fifthOsc.connect(padGain);
    padGain.connect(masterGain);

    breezeSource.start(now);
    windLfo.start(now);
    rootOsc.start(now);
    fifthOsc.start(now);

    this.ambientSourceNodes.push(breezeSource, windLfo, rootOsc, fifthOsc);

    // 3. Subtle periodic pentatonic water-drop / sanctuary chime notes
    const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
    this.ambientChimeInterval = window.setInterval(() => {
      if (!this.isAmbientPlaying || !this.ctx || !this.ambientMasterGain) return;
      if (this.ctx.state === 'suspended') return;

      const t = this.ctx.currentTime;
      const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);

      chimeGain.gain.setValueAtTime(0.0001, t);
      chimeGain.gain.linearRampToValueAtTime(0.032, t + 0.08);
      chimeGain.gain.exponentialRampToValueAtTime(0.0005, t + 2.4);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ambientMasterGain);

      chimeOsc.start(t);
      chimeOsc.stop(t + 2.5);
    }, 4200);
  }

  private stopAmbientLoop() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;

    if (this.ambientChimeInterval !== null) {
      clearInterval(this.ambientChimeInterval);
      this.ambientChimeInterval = null;
    }

    if (this.ctx && this.ambientMasterGain) {
      const now = this.ctx.currentTime;
      const gainToFade = this.ambientMasterGain;
      const nodesToStop = [...this.ambientSourceNodes];
      this.ambientMasterGain = null;
      this.ambientSourceNodes = [];

      try {
        gainToFade.gain.cancelScheduledValues(now);
        gainToFade.gain.setValueAtTime(Math.max(gainToFade.gain.value, 0.0001), now);
        gainToFade.gain.linearRampToValueAtTime(0.0001, now + 0.45);
      } catch {
        // Ignore if context closed
      }

      setTimeout(() => {
        nodesToStop.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // Already stopped
          }
        });
        try {
          gainToFade.disconnect();
        } catch {
          // Ignore
        }
      }, 500);
    } else {
      this.stopAmbientLoopImmediate();
    }
  }

  private stopAmbientLoopImmediate() {
    if (this.ambientChimeInterval !== null) {
      clearInterval(this.ambientChimeInterval);
      this.ambientChimeInterval = null;
    }
    this.ambientSourceNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore
      }
    });
    this.ambientSourceNodes = [];
    if (this.ambientMasterGain) {
      try {
        this.ambientMasterGain.disconnect();
      } catch {
        // Ignore
      }
      this.ambientMasterGain = null;
    }
    this.isAmbientPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
