import { FourierCoefficient } from '../math/dft';

class AudioGraphSonifier {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Starts synthesizing sound corresponding to the Fourier harmonic frequencies
   */
  start(coefficients: FourierCoefficient[], baseFreq: number = 130.81) { // C3 note base
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Master volume with smooth attack
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.0001, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.15);
    this.gainNode.connect(this.ctx.destination);

    // Filter to give a smooth, cosmic ambient timbre
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.0, now);
    filter.connect(this.gainNode);

    // Pick top 8 most prominent non-zero frequencies
    const active = coefficients
      .filter((c) => Math.abs(c.freq) > 0)
      .slice(0, 8);

    const maxAmp = active[0]?.amp || 1;

    active.forEach((c) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Map frequency index to harmonic musical overtone
      const harmonicRatio = Math.min(16, Math.max(0.5, Math.abs(c.freq)));
      osc.type = Math.abs(c.freq) % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * (1 + (harmonicRatio % 7) * 0.5), now);

      // Relative volume proportional to Fourier amplitude
      const vol = (c.amp / maxAmp) * 0.25;
      oscGain.gain.setValueAtTime(vol, now);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      this.oscillators.push(osc);
    });
  }

  /**
   * Modulates sound pitch and filter based on current drawing pen position & velocity
   */
  updateTelemetry(penSpeed: number, radialDistance: number) {
    if (!this.ctx || !this.isPlaying || !this.gainNode) return;
    // Modulate pitch subtly
    const targetFreq = 1200 + Math.min(2000, radialDistance * 4);
    // Smooth modulation
  }

  /**
   * Stops audio synthesis
   */
  stop() {
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Ignore if already stopped
          }
        });
        this.oscillators = [];
        this.isPlaying = false;
      }, 100);
    } else {
      this.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore
        }
      });
      this.oscillators = [];
      this.isPlaying = false;
    }
  }

  get active(): boolean {
    return this.isPlaying;
  }
}

export const sonifier = new AudioGraphSonifier();
