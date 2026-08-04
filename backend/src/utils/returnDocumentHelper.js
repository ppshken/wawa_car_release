function normalizeReturnDocuments(documents) {
  if (!documents) return [];

  const source = Array.isArray(documents) ? documents : [documents];

  return source
    .map((document) => (typeof document === 'string' ? document.trim() : ''))
    .filter(Boolean);
}

module.exports = {
  normalizeReturnDocuments,
};
