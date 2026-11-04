let ctx = null;

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}

function tone(freq, start, dur, type = 'sine', gain = 0.25) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const t = ctx.currentTime + start;
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// scan detect hone par chhota beep
export function playBeep() {
  unlockAudio();
  tone(1000, 0, 0.09, 'square', 0.12);
}

// approved: ting-ting
export function playApproved() {
  unlockAudio();
  tone(880, 0.05, 0.25);
  tone(1318.5, 0.2, 0.5);
}

// rejected: low buzz
export function playRejected() {
  unlockAudio();
  tone(200, 0.05, 0.25, 'sawtooth', 0.16);
  tone(140, 0.28, 0.4, 'sawtooth', 0.16);
}