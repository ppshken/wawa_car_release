const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeReturnDocuments } = require('./returnDocumentHelper');

test('normalizeReturnDocuments keeps only non-empty values', () => {
  assert.deepEqual(normalizeReturnDocuments(['data:image/png;base64,aaa', '', '   ', 'data:image/jpeg;base64,bbb']), ['data:image/png;base64,aaa', 'data:image/jpeg;base64,bbb']);
});

test('normalizeReturnDocuments wraps a single string input', () => {
  assert.deepEqual(normalizeReturnDocuments('data:image/webp;base64,abc'), ['data:image/webp;base64,abc']);
});

test('normalizeReturnDocuments returns empty array for empty input', () => {
  assert.deepEqual(normalizeReturnDocuments([]), []);
  assert.deepEqual(normalizeReturnDocuments(null), []);
  assert.deepEqual(normalizeReturnDocuments(undefined), []);
});
