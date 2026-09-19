/** Local synthesized ambience. No recordings, requests or third-party assets. */
export class AudioEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private voices: OscillatorNode[] = [];
  async enable() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
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
  dispose() {
    this.voices.forEach((voice) => voice.stop());
    void this.context?.close();
  }
}
