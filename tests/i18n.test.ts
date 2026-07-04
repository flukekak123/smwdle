import { describe, it, expect } from 'vitest';
import en from '../src/i18n/en.json';
import th from '../src/i18n/th.json';

/** Flatten a nested message object into dotted key paths. */
function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n locale completeness (US-16)', () => {
  it('English and Thai catalogs have exactly the same keys', () => {
    const enKeys = flatten(en).sort();
    const thKeys = flatten(th).sort();
    expect(thKeys).toEqual(enKeys);
  });

  it('has no empty string values', () => {
    for (const [locale, messages] of Object.entries({ en, th })) {
      const empties = flatten(messages).filter((key) => {
        const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], messages);
        return typeof value === 'string' && value.trim().length === 0;
      });
      expect(empties, `empty keys in ${locale}`).toEqual([]);
    }
  });
});
