import { describe, it, expect } from 'vitest';
import { createCatalog } from '../src/lib/catalog.js';
import type { Monster } from '../src/lib/types.js';

const M = (id: number, name: string, inAnswerPool = false): Monster => ({
  id,
  name,
  element: 'Fire',
  naturalStars: 4,
  role: 'Attack',
  family: 'Vampire',
  source: 'Unknown Scroll',
  secondAwakening: false,
  gender: 'Male',
  buffs: [],
  debuffs: [],
  imageUrl: null,
  inAnswerPool,
});

const data = [
  M(1, 'Lushen', true),
  M(2, 'Loren', true),
  M(3, 'Katarina'),
  M(4, 'Verdehile'),
];

describe('createCatalog', () => {
  const cat = createCatalog(data);

  it('returns all monsters and the answer-pool subset', () => {
    expect(cat.getAllMonsters()).toHaveLength(4);
    expect(cat.getAnswerPool().map((m) => m.name).sort()).toEqual(['Loren', 'Lushen']);
  });

  it('looks up by id', () => {
    expect(cat.getById(3)?.name).toBe('Katarina');
    expect(cat.getById(999)).toBeUndefined();
  });

  it('ranks startsWith above contains', () => {
    const results = cat.findByName('lo');
    expect(results[0]?.name).toBe('Loren'); // starts with "lo"
  });

  it('matches by family (pre-awaken name)', () => {
    // all test monsters are the Vampire family, Fire element
    expect(cat.findByName('vampire')).toHaveLength(4);
    expect(cat.findByName('fire vampire').length).toBeGreaterThan(0);
    expect(cat.findByName('vampire fire').length).toBeGreaterThan(0);
  });

  it('ranks a unique-name match above a family match', () => {
    const results = cat.findByName('lo'); // "Loren" starts with lo; family Vampire does not
    expect(results[0]?.name).toBe('Loren');
  });

  it('is typo tolerant (edit distance 1)', () => {
    const results = cat.findByName('lushon'); // 1 substitution from "lushen"
    expect(results.some((m) => m.name === 'Lushen')).toBe(true);
  });

  it('returns empty for no match', () => {
    expect(cat.findByName('zzzzzz')).toEqual([]);
    expect(cat.findByName('')).toEqual([]);
  });
});
