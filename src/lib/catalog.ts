import type { Monster } from './types.js';
import { normalize, levenshtein } from './search.js';

export interface MonsterCatalog {
  getAllMonsters(): Monster[];
  getAnswerPool(): Monster[];
  getById(id: number): Monster | undefined;
  findByName(query: string, limit?: number): Monster[];
}

/**
 * Build a catalog over a monster list. Pure/injectable for testing.
 * Precomputes an id map and a normalized-name index for fast lookup/search.
 */
export function createCatalog(monsters: readonly Monster[]): MonsterCatalog {
  const all = monsters.slice();
  const byId = new Map<number, Monster>();
  const indexed = all.map((m) => ({ m, norm: normalize(m.name) }));
  for (const m of all) byId.set(m.id, m);

  // Answer pool in a stable order (by id) so the seeded shuffle is reproducible.
  const answerPool = all
    .filter((m) => m.inAnswerPool)
    .sort((a, b) => a.id - b.id);

  function findByName(query: string, limit = 8): Monster[] {
    const q = normalize(query);
    if (q.length === 0) return [];

    const starts: Monster[] = [];
    const contains: Monster[] = [];
    for (const { m, norm } of indexed) {
      if (norm.startsWith(q)) starts.push(m);
      else if (norm.includes(q)) contains.push(m);
    }
    const byNameLen = (a: Monster, b: Monster) => a.name.length - b.name.length;
    starts.sort(byNameLen);
    contains.sort(byNameLen);
    let results = [...starts, ...contains];

    // Typo-tolerant fallback: only when no substring hits and the query is short.
    if (results.length === 0 && q.length >= 3 && q.length <= 12) {
      const maxDist = q.length <= 5 ? 1 : 2;
      results = indexed
        .map(({ m, norm }) => ({ m, d: levenshtein(q, norm, maxDist) }))
        .filter((x) => x.d <= maxDist)
        .sort((a, b) => a.d - b.d || a.m.name.length - b.m.name.length)
        .map((x) => x.m);
    }

    return results.slice(0, limit);
  }

  return {
    getAllMonsters: () => all.slice(),
    getAnswerPool: () => answerPool.slice(),
    getById: (id) => byId.get(id),
    findByName,
  };
}
