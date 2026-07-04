import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { serialize, deserialize, defaults } from '../src/lib/gameStateCodec.js';
import { persistedStateArb } from './generators.js';

describe('gameStateCodec', () => {
  it('round-trips: deserialize(serialize(state)) === state (PBT-02)', () => {
    fc.assert(
      fc.property(persistedStateArb, (state) => {
        expect(deserialize(serialize(state))).toEqual(state);
      }),
    );
  });

  it('never throws and returns valid defaults on arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const result = deserialize(raw);
        expect(result.version).toBe(1);
        expect(typeof result.stats.played).toBe('number');
        expect(['en', 'th']).toContain(result.locale);
      }),
    );
  });

  it('returns defaults for structurally invalid JSON', () => {
    expect(deserialize('{"version":1}')).toEqual(defaults());
    expect(deserialize('null')).toEqual(defaults());
    expect(deserialize('[]')).toEqual(defaults());
    expect(deserialize('')).toEqual(defaults());
    expect(deserialize(undefined)).toEqual(defaults());
  });

  it('rejects unknown state versions', () => {
    const future = JSON.stringify({ ...defaults(), version: 99 });
    expect(deserialize(future)).toEqual(defaults());
  });
});
