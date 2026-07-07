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
  // Per monster: awakened name + aliases (family, "family element", "element family")
  // so searching either the unique name (Taor) or the pre-awaken form (Chimera Water) works.
  const indexed = all.map((m) => {
    const norm = normalize(m.name);
    const fam = normalize(m.family);
    const el = normalize(m.element);
    const alt = m.altName ? normalize(m.altName) : '';
    const aliases = [fam, `${fam} ${el}`, `${el} ${fam}`, alt].filter((a) => a.length > 0);
    return { m, norm, aliases };
  });
  for (const m of all) byId.set(m.id, m);

  // Answer pool in a stable order (by id) so the seeded shuffle is reproducible.
  const answerPool = all
    .filter((m) => m.inAnswerPool)
    .sort((a, b) => a.id - b.id);

  function findByName(query: string, limit = 8): Monster[] {
    const q = normalize(query);
    if (q.length === 0) return [];

    // Rank: 0 name-startsWith, 1 name-includes, 2 alias-startsWith, 3 alias-includes.
    const scored: { m: Monster; rank: number }[] = [];
    for (const { m, norm, aliases } of indexed) {
      let rank = Infinity;
      if (norm.startsWith(q)) rank = 0;
      else if (norm.includes(q)) rank = 1;
      else if (aliases.some((a) => a.startsWith(q))) rank = 2;
      else if (aliases.some((a) => a.includes(q))) rank = 3;
      if (rank < Infinity) scored.push({ m, rank });
    }
    scored.sort((a, b) => a.rank - b.rank || a.m.name.length - b.m.name.length);
    let results = scored.map((x) => x.m);

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
