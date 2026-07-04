// Deterministic, seedable RNG helpers. Pure — no Math.random, no Date.now.

/** mulberry32 PRNG: fast, tiny, deterministic. Returns a function yielding [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pure Fisher–Yates shuffle driven by a seed. Same input + seed => same output. */
export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const a = arr.slice();
  const rand = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** Non-negative modulo. Throws if base <= 0. */
export function safeModulo(n: number, base: number): number {
  if (!Number.isFinite(base) || base <= 0) {
    throw new Error('safeModulo: base must be a positive number');
  }
  return ((Math.trunc(n) % base) + base) % base;
}
