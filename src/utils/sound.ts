export function playTimerEndSound(enabled: boolean): void {
  if (!enabled) {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const now = context.currentTime;

    [0, 0.18].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, now + offset);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + offset + 0.08);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.18);
    });

    window.setTimeout(() => {
      void context.close();
    }, 650);
  } catch {
    // Browser-Autoplay-Regeln können Audio blockieren. Der Timer bleibt trotzdem stabil.
  }
}
