export function seededRandom(seed: string) {
  let state = 2166136261;
  for (const character of seed)
    state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function gardenLayout(seed: string, count: number) {
  const random = seededRandom(seed);
  return Array.from(
    { length: Math.max(1, Math.min(24, Math.floor(count))) },
    (_, i) => {
      const angle = i * 2.399963;
      const radius = i === 0 ? 0 : 0.8 + Math.sqrt(i) * 0.48;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius * 0.6 - 0.4,
        height: i === 0 ? 3.25 : 1.6 + random() * 1.3,
        size: i === 0 ? 1 : 0.55 + random() * 0.26,
        lean: (random() - 0.5) * 0.24,
        delay: i === 0 ? 0 : 0.12 + random() * 0.38,
      };
    },
  );
}
