'use client';

import { deserialize, serialize } from '../lib/gameStateCodec';
import type { PersistedState } from '../lib/types';
import { safeStorage } from './storage';

const STATE_KEY = 'smwdle:v1';

export function loadState(): PersistedState {
  return deserialize(safeStorage.get(STATE_KEY));
}

export function saveState(state: PersistedState): void {
  safeStorage.set(STATE_KEY, serialize(state));
}

/** Read-modify-write helper so concurrent writers (game/stats/locale) don't clobber. */
export function patchState(patch: Partial<PersistedState>): PersistedState {
  const next = { ...loadState(), ...patch };
  saveState(next);
  return next;
}
