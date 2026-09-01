// AudioManager - Handles sound effects using Web Audio API
export class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = new Map();
    this.enabled = true;
    this.masterGain = null;
    this.initAudioContext();
    this.generateSounds();
  }

  initAudioContext() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  generateSounds() {
    if (!this.enabled) return;

    // Shoot sound
    this.sounds.set('shoot', this.createTone(440, 0.1, 'square', 0.5));

    // Hit sound
    this.sounds.set('hit', this.createTone(880, 0.05, 'sine', 0.3));

    // Explosion sound
    this.sounds.set('explosion', this.createNoise(0.3, 0.4));

    // Player hit sound
    this.sounds.set('playerHit', this.createTone(220, 0.2, 'sawtooth', 0.4));

    // Powerup sound
    this.sounds.set('powerup', this.createTone(660, 0.2, 'sine', 0.3));

    // Wave clear sound
    this.sounds.set('waveClear', this.createChord([523.25, 659.25, 783.99], 0.5));
  }

  createTone(frequency, duration, type = 'sine', volume = 1) {
    return () => {
      if (!this.enabled || !this.context) return;

      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    };
  }

  createNoise(duration, volume = 1) {
    return () => {
      if (!this.enabled || !this.context) return;

      const bufferSize = this.context.sampleRate * duration;
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }

      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

      source.start();
      source.stop(this.context.currentTime + duration);
    };
  }

  createChord(frequencies, duration) {
    return () => {
      if (!this.enabled || !this.context) return;

      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.context.createOscillator();
          const gain = this.context.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(this.masterGain);
          gain.gain.value = 0.15;
          gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
          osc.start();
          osc.stop(this.context.currentTime + duration);
        }, i * 50);
      });
    };
  }

  play(name) {
    const sound = this.sounds.get(name);
    if (sound && this.enabled) {
      // Resume context if suspended (browser autoplay policy)
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
      sound();
    }
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}