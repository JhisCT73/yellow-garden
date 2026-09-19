export type QualityLevel = 'low' | 'medium' | 'high';
export type QualityMode = 'auto' | 'low' | 'high';

export function initialQuality(cores: number): QualityLevel {
  return cores <= 4 ? 'low' : cores <= 8 ? 'medium' : 'high';
}

export function qualityProfile(level: QualityLevel, deviceDpr: number) {
  const profiles = {
    low: { dpr: 1, particles: 120, grass: 250 },
    medium: { dpr: 1.5, particles: 240, grass: 450 },
    high: { dpr: 1.75, particles: 360, grass: 700 },
  };
  return {
    ...profiles[level],
    dpr: Math.min(Math.max(deviceDpr || 1, 0.5), profiles[level].dpr),
  };
}

/** Downshift only after sustained slow frames. Ignore tab pauses and isolated stalls. */
export function createPerformanceMonitor(initial: QualityLevel) {
  let level = initial;
  let seconds = 0,
    frames = 0,
    slowWindows = 0,
    warmup = 3;
  return {
    reset(next: QualityLevel) {
      level = next;
      seconds = frames = slowWindows = 0;
      warmup = 3;
    },
    sample(delta: number, active: boolean): QualityLevel | undefined {
      if (!active || !Number.isFinite(delta) || delta <= 0 || delta > 0.25) {
        seconds = frames = slowWindows = 0;
        return;
      }
      if (warmup > 0) {
        warmup -= delta;
        return;
      }
      seconds += delta;
      frames++;
      if (seconds < 2) return;
      const slow = seconds / frames > 0.04;
      seconds = frames = 0;
      slowWindows = slow ? slowWindows + 1 : 0;
      if (slowWindows < 2 || level === 'low') return;
      level = level === 'high' ? 'medium' : 'low';
      slowWindows = 0;
      warmup = 3;
      return level;
    },
  };
}
