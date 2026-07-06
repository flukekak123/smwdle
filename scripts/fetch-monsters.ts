/**
 * Build-time data fetcher for Smwdle.
 *
 * Fetches the full Summoners War monster roster from the SWARFARM community
 * bestiary API (all pages), derives each monster's unique name + family from the
 * structured bestiary slug, marks a curated answer pool, and writes
 * `src/data/monsters.json`.
 *
 * Runs OFFLINE at build time only — the browser never calls SWARFARM at runtime.
 *
 * Data source: SWARFARM (https://swarfarm.com). Summoners War is a trademark of
 * Com2uS. This is a non-commercial fan project.
 *
 * Usage:  npm run fetch:monsters
 * On failure the existing committed src/data/monsters.json is left unchanged.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Element, Gender, LeaderArea, Monster, NaturalStars, Role } from '../src/lib/types.js';

function leaderArea(ls?: { area?: string } | null): LeaderArea {
  const a = (ls?.area ?? '').toLowerCase();
  if (!a) return 'None';
  if (a.includes('arena')) return 'Arena';
  if (a.includes('guild')) return 'Guild War';
  if (a.includes('dungeon')) return 'Dungeon';
  return 'All'; // General, Element, or anything else = applies everywhere
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../src/data/monsters.json');
const SKILLS_PATH = resolve(__dirname, '../public/skills.json');

const START_URL =
  'https://swarfarm.com/api/v2/monsters/?format=json&page_size=100&is_awakened=true&obtainable=true';

// SWARFARM hosts monster portraits at this static path + image_filename.
const IMAGE_BASE = 'https://swarfarm.com/static/herders/images/monsters/';

// Only monsters with natural stars >= this are included at all (guessable roster).
// Excludes 1★/2★ fodder.
const GUESS_MIN_STARS = 3;

// Monsters with natural stars >= this threshold form the daily answer pool
// (well-known, recognizable units). Everything included remains guessable.
const ANSWER_POOL_MIN_STARS = 4;

interface Raw {
  com2us_id: number;
  name: string;
  element: string;
  archetype: string;
  natural_stars: number;
  bestiary_slug: string;
  image_filename?: string;
  skills?: number[];
  leader_skill?: { area?: string } | null;
  transforms_to?: unknown;
  source?: Array<{ name?: string }>;
  max_lvl_hp?: number;
  max_lvl_attack?: number;
  max_lvl_defense?: number;
  base_hp?: number;
  base_attack?: number;
  base_defense?: number;
  speed?: number;
}

const ELEMENT_MAP: Record<string, Element> = {
  fire: 'Fire',
  water: 'Water',
  wind: 'Wind',
  light: 'Light',
  dark: 'Dark',
};

const ROLE_MAP: Record<string, Role> = {
  attack: 'Attack',
  defense: 'Defense',
  hp: 'HP',
  support: 'Support',
};

function titleCase(kebab: string): string {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function kebab(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeSource(sources?: Array<{ name?: string }>): string {
  const names = (sources ?? []).map((s) => (s.name ?? '').toLowerCase());
  if (names.some((n) => n.includes('light') && n.includes('dark'))) return 'Light & Dark Scroll';
  if (names.some((n) => n.includes('legendary'))) return 'Legendary Scroll';
  if (names.some((n) => n.includes('mystical'))) return 'Mystical Scroll';
  if (names.some((n) => n.includes('unknown'))) return 'Unknown Scroll';
  if (names.some((n) => n.includes('fusion'))) return 'Fusion';
  if (names.some((n) => n.includes('craft'))) return 'Crafting';
  if (names.some((n) => n.includes('transcend'))) return 'Transcendence Scroll';
  if (names.some((n) => n.includes('program') || n.includes('event') || n.includes('social'))) {
    return 'Special Program';
  }
  return 'Other';
}

interface RawSkill {
  id: number;
  name?: string;
  description?: string;
  slot?: number;
  effects?: Array<{ effect?: { name?: string; is_buff?: boolean } }>;
}

interface SkillInfo {
  buffs: string[];
  debuffs: string[];
  name: string;
  description: string;
  slot: number;
}

/** Fetch skill data in id__in batches; returns skillId -> {buffs, debuffs, name, description, slot}. */
async function fetchSkillEffects(skillIds: number[]): Promise<Map<number, SkillInfo>> {
  const map = new Map<number, SkillInfo>();
  const BATCH = 100;
  for (let i = 0; i < skillIds.length; i += BATCH) {
    const batch = skillIds.slice(i, i + BATCH);
    const url = `https://swarfarm.com/api/v2/skills/?format=json&page_size=${BATCH}&id__in=${batch.join(',')}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SWARFARM skills request failed: ${res.status}`);
    const data: { results: RawSkill[] } = await res.json();
    for (const s of data.results) {
      const buffs = new Set<string>();
      const debuffs = new Set<string>();
      for (const e of s.effects ?? []) {
        const name = e.effect?.name?.trim();
        if (!name) continue;
        (e.effect?.is_buff ? buffs : debuffs).add(name);
      }
      map.set(s.id, {
        buffs: [...buffs].sort(),
        debuffs: [...debuffs].sort(),
        name: (s.name ?? '').trim(),
        description: (s.description ?? '').trim(),
        slot: s.slot ?? 0,
      });
    }
    process.stdout.write(`\r  fetched skills ${Math.min(i + BATCH, skillIds.length)}/${skillIds.length}…`);
  }
  process.stdout.write('\n');
  return map;
}

async function fetchAll(): Promise<Raw[]> {
  const all: Raw[] = [];
  let url: string | null = START_URL;
  let page = 0;
  while (url) {
    const res: Response = await fetch(url);
    if (!res.ok) throw new Error(`SWARFARM request failed: ${res.status}`);
    const data: { results: Raw[]; next: string | null } = await res.json();
    all.push(...data.results);
    url = data.next;
    page += 1;
    process.stdout.write(`\r  fetched page ${page} (${all.length} records)…`);
  }
  process.stdout.write('\n');
  return all;
}

/**
 * SWARFARM returns two records per awakened monster sharing one slug:
 *   `{com2us_id}-{element}-{family-kebab}-{unique-name-kebab}`
 * One record's `name` is the family (e.g. "Archangel"), the other's is the
 * unique name (e.g. "Velajuel"). We group by com2us_id and pick the unique-name
 * record (its kebab name is the slug suffix); family = the remaining slug middle.
 */
interface SkillDetail {
  slot: number;
  name: string;
  description: string;
}

function transform(
  raw: Raw[],
  skillMap: Map<number, SkillInfo>,
): { monsters: Monster[]; skills: Record<number, SkillDetail[]> } {
  const skillsOut: Record<number, SkillDetail[]> = {};
  // Group by bestiary_slug: SWARFARM emits two records per awakened monster
  // (family name + unique name) that share one slug but differ in com2us_id.
  const groups = new Map<string, Raw[]>();
  for (const r of raw) {
    if (!r.bestiary_slug) continue;
    const list = groups.get(r.bestiary_slug) ?? [];
    list.push(r);
    groups.set(r.bestiary_slug, list);
  }

  const out: Monster[] = [];
  for (const [, records] of groups) {
    const first = records[0]!;
    const element = ELEMENT_MAP[(first.element ?? '').toLowerCase()];
    const role = ROLE_MAP[(first.archetype ?? '').toLowerCase()];
    if (!element || !role) continue;

    // slug: comid-element-family...-uniquename
    const parts = first.bestiary_slug.split('-');
    const afterElement = parts.slice(2); // [family..., uniquename]
    const uniqueSlug = afterElement[afterElement.length - 1] ?? '';
    const familySlug = afterElement.slice(0, -1).join('-');

    // Prefer the record whose name matches the unique slug suffix; else longest name.
    const unique =
      records.find((r) => kebab(r.name) === uniqueSlug) ??
      records.slice().sort((a, b) => b.name.length - a.name.length)[0]!;

    const stars = Math.min(5, Math.max(1, first.natural_stars || 1)) as NaturalStars;
    if (stars < GUESS_MIN_STARS) continue; // exclude 1★/2★ from the guessable roster
    const has2A = Array.isArray(first.transforms_to)
      ? first.transforms_to.length > 0
      : Boolean(first.transforms_to);

    const imageFile = unique.image_filename ?? first.image_filename;
    const imageUrl = imageFile ? IMAGE_BASE + imageFile : null;

    // Aggregate buff/debuff effects across the awakened form's skills.
    const buffSet = new Set<string>();
    const debuffSet = new Set<string>();
    for (const skillId of unique.skills ?? []) {
      const eff = skillMap.get(skillId);
      if (!eff) continue;
      for (const b of eff.buffs) buffSet.add(b);
      for (const d of eff.debuffs) debuffSet.add(d);
    }

    out.push({
      id: unique.com2us_id,
      name: unique.name,
      element,
      naturalStars: stars,
      role,
      family: familySlug ? titleCase(familySlug) : 'Unknown',
      source: normalizeSource(first.source),
      secondAwakening: has2A,
      gender: 'Unknown' as Gender,
      leaderSkill: leaderArea(unique.leader_skill),
      buffs: [...buffSet].sort(),
      debuffs: [...debuffSet].sort(),
      stats: {
        hp: unique.max_lvl_hp ?? unique.base_hp ?? 0,
        atk: unique.max_lvl_attack ?? unique.base_attack ?? 0,
        def: unique.max_lvl_defense ?? unique.base_defense ?? 0,
        spd: unique.speed ?? 0,
      },
      imageUrl,
      inAnswerPool: stars >= ANSWER_POOL_MIN_STARS,
    });

    // Skill text (only for answer-pool monsters — the Skill mode only reveals the secret's skills).
    if (stars >= ANSWER_POOL_MIN_STARS) {
      const details: SkillDetail[] = (unique.skills ?? [])
        .map((sid) => skillMap.get(sid))
        .filter((s): s is SkillInfo => Boolean(s && s.description))
        .map((s) => ({ slot: s.slot, name: s.name, description: s.description }));
      if (details.length > 0) skillsOut[unique.com2us_id] = details;
    }
  }

  out.sort((a, b) => a.id - b.id);
  return { monsters: out, skills: skillsOut };
}

async function main(): Promise<void> {
  console.log('Fetching monster data from SWARFARM…');
  const raw = await fetchAll();
  const skillIds = [
    ...new Set(
      raw.filter((r) => r.natural_stars >= GUESS_MIN_STARS).flatMap((r) => r.skills ?? []),
    ),
  ];
  console.log(`Fetching effects for ${skillIds.length} skills…`);
  const skillMap = await fetchSkillEffects(skillIds);
  const { monsters, skills } = transform(raw, skillMap);
  if (monsters.length === 0) throw new Error('No monsters produced; aborting (keeping existing file).');
  const pool = monsters.filter((m) => m.inAnswerPool);
  if (pool.length === 0) throw new Error('Answer pool empty; check ANSWER_POOL_MIN_STARS.');

  writeFileSync(OUT_PATH, JSON.stringify(monsters, null, 2) + '\n', 'utf8');
  writeFileSync(SKILLS_PATH, JSON.stringify(skills) + '\n', 'utf8');
  const byStar: Record<number, number> = {};
  for (const m of monsters) byStar[m.naturalStars] = (byStar[m.naturalStars] ?? 0) + 1;
  console.log(`Wrote ${monsters.length} monsters → ${OUT_PATH}`);
  console.log(`  answer pool (>=${ANSWER_POOL_MIN_STARS}★): ${pool.length}`);
  console.log(`  by stars: ${JSON.stringify(byStar)}`);
  console.log(`  skills for ${Object.keys(skills).length} monsters → ${SKILLS_PATH}`);
}

main().catch((err) => {
  console.error('\nfetch-monsters failed:', err.message);
  console.error('Existing src/data/monsters.json left unchanged.');
  process.exitCode = 1;
});
