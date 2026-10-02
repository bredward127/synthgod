import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildLink, subtag } from './links.ts';

describe('buildLink', () => {
  test('amazon product page with tag and sub-tag', () => {
    const url = new URL(buildLink({ kind: 'amazon', asin: 'B0ABCDEF12' }, { amazonTag: 'site-20', sub: ['hero', 'Meta'] }));
    assert.equal(url.pathname, '/dp/B0ABCDEF12');
    assert.equal(url.searchParams.get('tag'), 'site-20');
    assert.equal(url.searchParams.get('ascsubtag'), 'site_hero_meta');
  });

  test('amazon search fallback for a missing or malformed ASIN', () => {
    const url = new URL(buildLink({ kind: 'amazon', asin: 'nope', query: 'fidget cube' }));
    assert.equal(url.pathname, '/s');
    assert.equal(url.searchParams.get('k'), 'fidget cube');
  });

  test('malformed amazon tag is dropped, not sent', () => {
    const url = new URL(buildLink({ kind: 'amazon', query: 'x' }, { amazonTag: 'bad tag&x=1' }));
    assert.equal(url.searchParams.has('tag'), false);
  });

  test('generic URL keeps its params and adds network params', () => {
    const url = new URL(
      buildLink({ kind: 'url', url: 'https://shop.example.com/p/1?color=red' }, { sub: ['grid'], subParam: 'subid', params: { ref: 'me', empty: '' } }),
    );
    assert.equal(url.searchParams.get('color'), 'red');
    assert.equal(url.searchParams.get('subid'), 'site_grid');
    assert.equal(url.searchParams.get('ref'), 'me');
    assert.equal(url.searchParams.has('empty'), false);
  });

  test('sub-tags are plain tokens and capped', () => {
    assert.equal(subtag(['a@b.com', undefined, '']), 'site_abcom');
    assert.ok(subtag(['x'.repeat(40), 'y'.repeat(40), 'z'.repeat(40)]).length <= 64);
  });
});
