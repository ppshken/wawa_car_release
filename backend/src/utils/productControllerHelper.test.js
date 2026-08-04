const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeProductControllerImages } = require('./productControllerHelper');

test('normalizeProductControllerImages keeps only non-empty image values', () => {
  assert.deepEqual(
    normalizeProductControllerImages(['data:image/png;base64,aaa', '', '   ', 'data:image/jpeg;base64,bbb']),
    ['data:image/png;base64,aaa', 'data:image/jpeg;base64,bbb']
  );
});

test('normalizeProductControllerImages wraps a single string input', () => {
  assert.deepEqual(normalizeProductControllerImages('data:image/webp;base64,abc'), ['data:image/webp;base64,abc']);
});

test('normalizeProductControllerImages returns an empty array for empty input', () => {
  assert.deepEqual(normalizeProductControllerImages([]), []);
  assert.deepEqual(normalizeProductControllerImages(null), []);
  assert.deepEqual(normalizeProductControllerImages(undefined), []);
});
