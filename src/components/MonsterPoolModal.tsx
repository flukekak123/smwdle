'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Element, Role } from '../lib/types';
import { catalog } from '../lib/index';
import { normalize } from '../lib/search';
import { Modal } from './Modal';

const ELEMENTS: Element[] = ['Fire', 'Water', 'Wind', 'Light', 'Dark'];
const ROLES: Role[] = ['Attack', 'Defense', 'HP', 'Support'];

const ELEMENT_DOT: Record<Element, string> = {
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Wind: 'bg-yellow-500',
  Light: 'bg-amber-200',
  Dark: 'bg-purple-600',
};

export function MonsterPoolModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations();
  const pool = useMemo(() => catalog.getAnswerPool(), []);
  const [q, setQ] = useState('');
  const [element, setElement] = useState<Element | 'All'>('All');
  const [role, setRole] = useState<Role | 'All'>('All');
  const [stars, setStars] = useState<4 | 5 | 'All'>('All');

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return pool.filter((m) => {
      if (element !== 'All' && m.element !== element) return false;
      if (role !== 'All' && m.role !== role) return false;
      if (stars !== 'All' && m.naturalStars !== stars) return false;
      if (nq && !(normalize(m.name).includes(nq) || normalize(m.family).includes(nq))) return false;
      return true;
    });
  }, [q, element, role, stars, pool]);

  const chip = (active: boolean, onClick: () => void, label: React.ReactNode, key: string) => (
    <button
      key={key}
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t('common.pool')} (${filtered.length}/${pool.length})`}
      size="max-w-2xl"
      testId="pool-modal"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('input.placeholder')}
        aria-label={t('input.placeholder')}
        className="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />

      {/* Element filter */}
      <div className="mb-2 flex flex-wrap gap-1">
        {chip(element === 'All', () => setElement('All'), t('common.all'), 'el-all')}
        {ELEMENTS.map((el) =>
          chip(
            element === el,
            () => setElement(el),
            <>
              <span className={`h-2 w-2 rounded-full ${ELEMENT_DOT[el]}`} aria-hidden="true" />
              {el}
            </>,
            `el-${el}`,
          ),
        )}
      </div>

      {/* Role filter */}
      <div className="mb-2 flex flex-wrap gap-1">
        {chip(role === 'All', () => setRole('All'), t('common.all'), 'role-all')}
        {ROLES.map((r) => chip(role === r, () => setRole(r), r, `role-${r}`))}
      </div>

      {/* Stars filter (answer pool is 4★+) */}
      <div className="mb-3 flex flex-wrap gap-1">
        {chip(stars === 'All', () => setStars('All'), t('common.all'), 'star-all')}
        {([4, 5] as const).map((s) => chip(stars === s, () => setStars(s), `${s}★`, `star-${s}`))}
      </div>

      <div className="max-h-[52vh] overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              data-testid={`pool-monster-${m.id}`}
              className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 p-2 text-center dark:border-slate-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.imageUrl ?? '/placeholder-monster.svg'}
                alt={m.name}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-monster.svg';
                }}
                className="h-12 w-12 object-contain"
              />
              <span className="w-full truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                {m.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {m.element} · {m.role} · {m.naturalStars}★
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-6 text-center text-sm text-slate-400">
              {t('input.notFound')}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
