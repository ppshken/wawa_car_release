function normalizeProductControllerImages(images) {
  if (!images) return [];

  const source = Array.isArray(images) ? images : [images];

  return source
    .map((image) => (typeof image === 'string' ? image.trim() : ''))
    .filter(Boolean);
}

module.exports = {
  normalizeProductControllerImages,
};
