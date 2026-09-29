/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_SETTINGS, formatNumber, monthStats, parseNumber, resolveLanguage, weekdayIndex } from './logic.ts';

// September 2026 starts on a Tuesday: 18 Mon-Thu days (8.5 h) and 4 Fridays (4.5 h).
test('full month without home office', () => {
  const s = monthStats(DEFAULT_SETTINGS, {}, 2026, 9);
  assert.equal(s.total, 171);
  assert.equal(s.home, 0);
  assert.equal(s.remaining, 51.3);
});

test('full, partial and absent days', () => {
  const s = monthStats(
    DEFAULT_SETTINGS,
    {
      '2026-09-01': { kind: 'home', hours: 8.5 },
      '2026-09-02': { kind: 'home', hours: 3 },
      '2026-09-04': { kind: 'home', hours: 4.5 },
      '2026-09-07': { kind: 'absent' },
    },
    2026,
    9,
  );
  assert.equal(s.total, 162.5);
  assert.equal(s.home, 16);
  assert.ok(Math.abs(s.percent - 9.846) < 0.001);
  assert.equal(s.overLimit, false);
});

test('partial hours are capped at the day target', () => {
  const s = monthStats(DEFAULT_SETTINGS, { '2026-09-04': { kind: 'home', hours: 8 } }, 2026, 9);
  assert.equal(s.home, 4.5);
});

test('custom limit and weekend entries without target hours', () => {
  const settings = { ...DEFAULT_SETTINGS, limitPercent: 5 };
  const s = monthStats(
    settings,
    { '2026-09-01': { kind: 'home', hours: 8.5 }, '2026-09-05': { kind: 'home', hours: 8 } },
    2026,
    9,
  );
  assert.equal(s.home, 8.5);
  assert.equal(s.overLimit, false);
  const t = monthStats(settings, { '2026-09-01': { kind: 'home', hours: 8.5 }, '2026-09-02': { kind: 'home', hours: 1 } }, 2026, 9);
  assert.equal(t.overLimit, true);
  assert.ok(t.remaining < 0);
});

test('helpers', () => {
  assert.equal(weekdayIndex(2026, 9, 7), 0);
  assert.equal(weekdayIndex(2026, 9, 6), 6);
  assert.equal(parseNumber('4,5'), 4.5);
  assert.equal(parseNumber(''), null);
  assert.equal(parseNumber('abc'), null);
  assert.equal(formatNumber(51.3), '51,3');
  assert.equal(formatNumber(1 / 3), '0,33');
  assert.equal(formatNumber(51.3, 'en'), '51.3');
});

test('language resolution', () => {
  assert.equal(resolveLanguage('auto', 'de-CH'), 'de');
  assert.equal(resolveLanguage('auto', 'en-US'), 'en');
  assert.equal(resolveLanguage('auto', 'fr-FR'), 'en');
  assert.equal(resolveLanguage('de', 'en-US'), 'de');
  assert.equal(resolveLanguage('en', 'de-AT'), 'en');
});
