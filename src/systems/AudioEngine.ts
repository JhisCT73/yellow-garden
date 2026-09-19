/** Local synthesized ambience. No recordings, requests or third-party assets. */
export class AudioEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private voices: OscillatorNode[] = [];
  private windSource?: AudioBufferSourceNode;
  private windGain?: GainNode;
  async enable() {
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
      for (const frequency of [130.81, 196, 261.63]) {
        const oscillator = this.context.createOscillator();
        oscillator.frequency.value = frequency;
        const gain = this.context.createGain();
        gain.gain.value = 0.035;
        oscillator.connect(gain).connect(this.master);
        oscillator.start();
        this.voices.push(oscillator);
      }
    }
    await this.context.resume();
    this.master!.gain.setTargetAtTime(0.35, this.context.currentTime, 0.6);
  }
  mute() {
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.15);
  }
  chime(index = 0) {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.frequency.value = [523.25, 587.33, 659.25, 783.99, 880][
      index % 5
    ];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
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
    this.voices.forEach((voice) => voice.stop());
    this.windSource?.stop();
    void this.context?.close();
  }
}
