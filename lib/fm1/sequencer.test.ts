import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arpPattern, stepSeconds } from './sequencer.ts';
import { ALGORITHMS, PRESETS } from './patches.ts';

test('arp up/down/updown/order', () => {
  assert.deepEqual(arpPattern([64, 60, 67], 'up', 1), [60, 64, 67]);
  assert.deepEqual(arpPattern([64, 60, 67], 'down', 1), [67, 64, 60]);
  assert.deepEqual(arpPattern([60, 64, 67], 'updown', 1), [60, 64, 67, 64]);
  assert.deepEqual(arpPattern([64, 60], 'order', 1), [64, 60]);
  assert.deepEqual(arpPattern([60, 64], 'up', 2), [60, 64, 72, 76]);
  assert.deepEqual(arpPattern([], 'up', 2), []);
});

test('step timing', () => {
  assert.equal(stepSeconds(120, 4), 0.125);
});

test('algorithms are acyclic, modulate lower ops into carriers, and reach the output', () => {
  for (const a of ALGORITHMS) {
    assert.ok(a.carriers.length > 0, a.name);
    for (const [m, t] of a.mods) {
      assert.ok(m >= 1 && m <= 6 && t >= 1 && t <= 6 && m !== t, a.name);
      assert.ok(!a.carriers.includes(m), `${a.name}: carrier ${m} also modulates`);
    }
    // every op is either a carrier or (transitively) feeds one
    const feeds = (op: number, seen = new Set<number>()): boolean =>
      a.carriers.includes(op) || a.mods.some(([m, t]) => m === op && !seen.has(t) && feeds(t, new Set([...seen, op])));
    for (let op = 1; op <= 6; op++) if (a.mods.some(([m]) => m === op) || a.carriers.includes(op)) assert.ok(feeds(op), `${a.name}: op ${op}`);
  }
});

test('demo bank: 26 patches, valid ranges', () => {
  assert.equal(PRESETS.length, 26);
  for (const p of PRESETS) {
    assert.ok(p.algorithm >= 1 && p.algorithm <= ALGORITHMS.length, p.name);
    assert.equal(p.ops.length, 6, p.name);
    assert.ok(p.name.length <= 12, `${p.name} fits the screen`);
    for (const o of p.ops) {
      assert.ok(o.level >= 0 && o.level <= 99 && o.ratio > 0 && o.a > 0 && o.d > 0 && o.r > 0 && o.s >= 0 && o.s <= 1, p.name);
    }
  }
});
