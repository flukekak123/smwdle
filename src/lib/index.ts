// Public surface of the U1 core-data-engine (consumed by U2).
export * from './types.js';
export * from './rng.js';
export * from './search.js';
export * from './catalog.js';
export * from './dailySelector.js';
export * from './guessEvaluator.js';
export * from './shareEncoder.js';
export * from './statsEngine.js';
export * from './gameStateCodec.js';

import monstersData from '../data/monsters.json';
import type { Monster } from './types.js';
import { createCatalog } from './catalog.js';

/** Default catalog built from the committed dataset. */
export const catalog = createCatalog(monstersData as Monster[]);
