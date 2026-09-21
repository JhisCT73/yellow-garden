import type { GardenCare } from './GardenCare';
/** Local soundtrack with quiet synthesized interaction effects. */
export class AudioEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: HTMLAudioElement;
  private playbackRequest = 0;
  private windSource?: AudioBufferSourceNode;
  private windGain?: GainNode;
  private care: GardenCare = 'light';
  setCare(care: GardenCare) {
    this.care = care;
  }
  async enable() {
    const request = ++this.playbackRequest;
    if (!this.music) {
      this.music = document.createElement('audio');
      this.music.src = `${import.meta.env.BASE_URL}audio/dandelions.mp3`;
      this.music.loop = true;
      this.music.preload = 'none';
      this.music.volume = 0.55;
      this.music.hidden = true;
      this.music.dataset.soundtrack = 'dandelions';
      document.body.append(this.music);
    }
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
      const buffer = this.context.createBuffer(
        1,
        this.context.sampleRate * 2,
        this.context.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.windSource = this.context.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      this.windGain = this.context.createGain();
      this.windGain.gain.value = 0;
      this.windSource
        .connect(filter)
        .connect(this.windGain)
        .connect(this.master);
      this.windSource.start();
    }
    try {
      await Promise.all([this.context.resume(), this.music.play()]);
      if (request !== this.playbackRequest) return false;
      this.master!.gain.setTargetAtTime(0.12, this.context.currentTime, 0.6);
      return true;
    } catch (error) {
      if (request !== this.playbackRequest) return false;
      this.mute();
      throw error;
    }
  }
  mute() {
    ++this.playbackRequest;
    this.music?.pause();
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.15);
  }
  chime(index = 0) {
    this.note(index, 1, 0.15);
    if (this.care === 'music') this.note(index, 1.5, 0.055);
  }
  private note(index: number, ratio: number, volume: number) {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.frequency.value =
      ratio * [523.25, 587.33, 659.25, 783.99, 880][index % 5];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    oscillator.connect(gain).connect(this.master);
    oscillator.start();
    oscillator.stop(now + 1.6);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  setWind(strength: number) {
    if (this.context && this.windGain)
      this.windGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, strength)) * 0.28,
        this.context.currentTime,
        0.2,
      );
  }
  dispose() {
    this.mute();
    this.music?.removeAttribute('src');
    this.music?.load();
    this.music?.remove();
    this.windSource?.stop();
    void this.context?.close();
  }
}
