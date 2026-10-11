export class Sounds {
  constructor(enabled = true) { this.enabled = enabled; this.context = null; }
  play(kind) {
    if (!this.enabled) return;
    try {
      this.context ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
      const notes = { flip: [520], click: [390], match: [523,659,784], miss: [300,240], win: [523,659,784,1047,784,1047] }[kind] || [440];
      notes.forEach((frequency, i) => {
        const start = this.context.currentTime + i * .11;
        const oscillator = this.context.createOscillator(), gain = this.context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.055, start + .015); gain.gain.exponentialRampToValueAtTime(.001, start + .18);
        oscillator.connect(gain); gain.connect(this.context.destination); oscillator.start(start); oscillator.stop(start + .2);
      });
    } catch { /* Audio support is optional. */ }
  }
}
