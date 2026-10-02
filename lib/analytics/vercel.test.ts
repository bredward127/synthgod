import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { scrubUrl } from './vercel.ts';

describe('scrubUrl', () => {
  test('keeps plain UTM tags', () => {
    assert.equal(
      scrubUrl('https://shopsquishyworld.com/quiz?utm_source=meta&utm_campaign=spring'),
      'https://shopsquishyworld.com/quiz?utm_source=meta&utm_campaign=spring',
    );
  });

  test('drops every other parameter and the hash', () => {
    assert.equal(
      scrubUrl('https://shopsquishyworld.com/find-help?q=48067&gclid=abc&email=a%40b.com#x'),
      'https://shopsquishyworld.com/find-help',
    );
  });

  test('drops UTM values that are not plain tokens', () => {
    assert.equal(scrubUrl('https://shopsquishyworld.com/?utm_term=my%20kid%20has%20adhd'), 'https://shopsquishyworld.com/');
  });

  test('returns unparseable input unchanged', () => {
    assert.equal(scrubUrl('/relative'), '/relative');
  });
});
