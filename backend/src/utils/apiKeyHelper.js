const { query } = require('../config/db');

// In-memory cache for API keys with 60-second TTL
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Get active API Key by key_name from database with fallback to process.env
 * @param {string} keyName - e.g. 'OPTIMOROUTE_API_KEY', 'GPS_API_TOKEN', 'GPS_API_URL'
 * @returns {Promise<string>} - API key value or empty string
 */
async function getApiKey(keyName) {
  if (!keyName) return '';

  const now = Date.now();
  const cached = cache.get(keyName);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.value;
  }

  try {
    const rows = await query(
      'SELECT key_value FROM api_keys WHERE key_name = ? AND is_active = 1 LIMIT 1',
      [keyName]
    );

    if (rows && rows.length > 0 && rows[0].key_value) {
      const val = rows[0].key_value.trim();
      cache.set(keyName, { value: val, timestamp: now });
      return val;
    }
  } catch (err) {
    // If api_keys table doesn't exist yet or query fails, log warning once and fallback
    console.warn(`[apiKeyHelper] Warning fetching '${keyName}' from DB:`, err.message);
  }

  // Fallback to process.env
  const envVal = process.env[keyName] || '';
  cache.set(keyName, { value: envVal, timestamp: now });
  return envVal;
}

/**
 * Clear the API key in-memory cache
 */
function clearApiKeyCache() {
  cache.clear();
}

module.exports = {
  getApiKey,
  clearApiKeyCache
};
