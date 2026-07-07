import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { evaluate, isCorrect } from '../src/lib/guessEvaluator.js';
import { ATTRIBUTE_ORDER } from '../src/lib/types.js';
import type { Monster } from '../src/lib/types.js';
import { monstersArb } from './generators.js';

const base: Monster = {
  id: 1,
  name: 'Test',
  element: 'Fire',
  naturalStars: 3,
  role: 'Attack',
  family: 'Vampire',
  source: 'Unknown Scroll',
  secondAwakening: false,
  gender: 'Male',
  leaderSkill: 'Arena',
  buffs: ['Heal', 'Immunity'],
  debuffs: ['Stun'],
  stats: { hp: 9000, atk: 800, def: 500, spd: 100 },
  twinIds: [],
  imageUrl: null,
  inAnswerPool: true,
};

describe('evaluate', () => {
  it('always emits all attributes in ATTRIBUTE_ORDER', () => {
    fc.assert(
      fc.property(monstersArb(2, 10), (pool) => {
        const [g, a] = [pool[0]!, pool[pool.length - 1]!];
        const res = evaluate(g, a);
        expect(res.attributes.map((x) => x.key)).toEqual(ATTRIBUTE_ORDER);
      }),
    );
  });

  it('evaluating a monster against itself => all match & correct', () => {
    fc.assert(
      fc.property(monstersArb(1, 10), (pool) => {
        const m = pool[0]!;
        const res = evaluate(m, m);
        expect(res.correct).toBe(true);
        expect(res.attributes.every((a) => a.status === 'match')).toBe(true);
      }),
    );
  });

  it('star direction: higher iff answer.stars > guess.stars (symmetric)', () => {
    const higher = evaluate({ ...base, naturalStars: 2 }, { ...base, id: 2, naturalStars: 5 });
    const lower = evaluate({ ...base, naturalStars: 5 }, { ...base, id: 2, naturalStars: 2 });
    const equal = evaluate({ ...base, naturalStars: 4 }, { ...base, id: 2, naturalStars: 4 });
    const star = (r: ReturnType<typeof evaluate>) =>
      r.attributes.find((a) => a.key === 'naturalStars')!.status;
    expect(star(higher)).toBe('higher');
    expect(star(lower)).toBe('lower');
    expect(star(equal)).toBe('match');
  });

  it('correct is driven by id equality', () => {
    expect(isCorrect(base, { ...base })).toBe(true);
    expect(isCorrect(base, { ...base, id: 999 })).toBe(false);
  });

  it('collab reskin twins count as the same monster', () => {
    // e.g. Ryu ↔ Douglas: the answer lists the twin id
    const ryu = { ...base, id: 24012, twinIds: [24512] };
    const douglas = { ...base, id: 24512, name: 'Douglas', twinIds: [24012] };
    expect(isCorrect(douglas, ryu)).toBe(true); // guess Douglas, answer Ryu
    expect(isCorrect(ryu, douglas)).toBe(true); // and the reverse
    expect(isCorrect({ ...base, id: 5 }, ryu)).toBe(false); // unrelated monster
  });

  it('buffs/debuffs compare as sets: equal → match, overlap → partial, disjoint → no-match', () => {
    const buffStatus = (guessBuffs: string[], answerBuffs: string[]) =>
      evaluate({ ...base, buffs: guessBuffs }, { ...base, id: 2, buffs: answerBuffs }).attributes.find(
        (a) => a.key === 'buffs',
      )!.status;

    expect(buffStatus(['Heal', 'Immunity'], ['Immunity', 'Heal'])).toBe('match'); // order-insensitive
    expect(buffStatus(['Heal', 'Immunity'], ['Heal', 'Increase ATK'])).toBe('partial');
    expect(buffStatus(['Heal'], ['Increase ATK'])).toBe('no-match');
    expect(buffStatus([], [])).toBe('match'); // both none
    expect(buffStatus([], ['Heal'])).toBe('no-match');
  });
});
