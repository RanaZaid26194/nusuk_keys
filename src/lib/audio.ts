// Tactile synthetic audio & haptic feedback for satisfying UI interactions
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playHapticSound(type: 'click' | 'success' | 'vote' = 'click') {
  if (typeof window === 'undefined') return;

  // 1. Subtle vibration for mobile touch devices
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'success') navigator.vibrate([15, 25, 20]);
      else if (type === 'vote') navigator.vibrate(20);
      else navigator.vibrate(10);
    }
  } catch {
    // Ignore vibration restrictions
  }

  // 2. Synthesized acoustic click/tone using Web Audio API
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Warm golden double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'vote') {
      // Satisfying mechanical thumb click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.07);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      // Crisp subtle keycap tap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}
