/**
 * Procedural WebAudio soundscape. Zero dependencies, no audio files: every cue is synthesized.
 * Muted by default. Audio.On creates the AudioContext inside the click that ran the command, which
 * satisfies browser autoplay rules. Every call is a no-op while muted or when WebAudio is missing.
 */
export type Cue = "whoosh" | "bell" | "chime";

let enabled = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext;
  if (typeof Ctor !== "function") return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  // One second of white noise, reused by every whoosh and spark. A fixed LCG keeps it identical per load.
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  let seed = 0x2f6e2b1;
  for (let i = 0; i < data.length; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    data[i] = (seed / 0xffffffff) * 2 - 1;
  }
  return ctx;
}

export function setAudioEnabled(on: boolean): void {
  enabled = on;
  const audio = on ? context() : ctx;
  if (!audio) return;
  if (on) void audio.resume();
  else void audio.suspend();
}

export function isAudioEnabled(): boolean {
  return enabled;
}

/** Envelope: silence, a short attack to `peak`, then an exponential fall to near silence. */
function envelope(audio: AudioContext, at: number, peak: number, attack: number, decay: number): GainNode {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return gain;
}

/** Soft parchment-and-ash whoosh: band-passed noise whose center sweeps up, then settles. */
function whoosh(audio: AudioContext, out: AudioNode, at: number): void {
  if (!noise) return;
  const src = audio.createBufferSource();
  src.buffer = noise;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(380, at);
  band.frequency.exponentialRampToValueAtTime(1500, at + 0.22);
  band.frequency.exponentialRampToValueAtTime(700, at + 0.45);
  const gain = envelope(audio, at, 0.09, 0.12, 0.36);
  src.connect(band).connect(gain).connect(out);
  src.start(at);
  src.stop(at + 0.55);
}

/** Deep resonant bell: inharmonic partials over a low fundamental, with a long decay. */
function bell(audio: AudioContext, out: AudioNode, at: number): void {
  const fundamental = 98;
  const partials: ReadonlyArray<readonly [ratio: number, level: number, decay: number]> = [
    [0.5, 0.09, 3.2],
    [1, 0.12, 2.6],
    [2.01, 0.06, 1.9],
    [2.76, 0.04, 1.4],
    [4.07, 0.025, 0.9],
  ];
  for (const [ratio, level, decay] of partials) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamental * ratio, at);
    const gain = envelope(audio, at, level, 0.008, decay);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

/** Crisp spark chime: two bright sines a fifth apart over a tiny high-passed noise tick. */
function chime(audio: AudioContext, out: AudioNode, at: number): void {
  for (const [freq, delay] of [
    [1760, 0],
    [2637, 0.045],
  ] as const) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, at + delay);
    const gain = envelope(audio, at + delay, 0.045, 0.004, 0.42);
    osc.connect(gain).connect(out);
    osc.start(at + delay);
    osc.stop(at + delay + 0.5);
  }
  if (!noise) return;
  const tick = audio.createBufferSource();
  tick.buffer = noise;
  const high = audio.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 5000;
  const gain = envelope(audio, at, 0.05, 0.002, 0.05);
  tick.connect(high).connect(gain).connect(out);
  tick.start(at);
  tick.stop(at + 0.08);
}

export function playCue(cue: Cue): void {
  if (!enabled || !ctx || !master || ctx.state !== "running") return;
  const at = ctx.currentTime + 0.01;
  if (cue === "whoosh") whoosh(ctx, master, at);
  else if (cue === "bell") bell(ctx, master, at);
  else chime(ctx, master, at);
}
