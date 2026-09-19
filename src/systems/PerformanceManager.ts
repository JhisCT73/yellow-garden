export function qualityForDevice(cores = navigator.hardwareConcurrency || 4) {
  const low = cores <= 4;
  return {
    dpr: Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75),
    particles: low ? 180 : 360,
    grass: low ? 400 : 700,
  };
}
