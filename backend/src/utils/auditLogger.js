const { query } = require('../config/db');

// Auto-create audit_log table if not exists
(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NULL,
        username VARCHAR(100) NULL,
        user_name VARCHAR(255) NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NULL,
        details TEXT NULL,
        ip_address VARCHAR(50) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating audit_log table:', err);
  }
})();

/**
 * Log an audit entry
 * @param {Object} req Express request object (contains user and IP)
 * @param {Object} data Log details { action, targetType, targetId, details }
 */
async function logAudit(req, { action, targetType, targetId, details }) {
  try {
    const userId = req.user?.user_id || req.user?.id || null;
    const username = req.user?.username || null;
    const userName = req.user?.name || req.user?.user_name || null;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

    await query(
      `INSERT INTO audit_log (user_id, username, user_name, action, target_type, target_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, username, userName, action, targetType, String(targetId || ''), detailsStr, String(ipAddress)]
    );
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

function sanitizeAuditBody(body) {
  if (!body || typeof body !== 'object') return body;
  const sanitized = {};
  for (const [key, value] of Object.entries(body)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('key_value')) {
      sanitized[key] = '***';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function getAuditTargetType(originalUrl) {
  const path = originalUrl.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  const apiIndex = segments.indexOf('api');
  if (apiIndex === -1) return '';
  const afterApi = segments.slice(apiIndex + 1);
  if (afterApi.length === 0) return 'API';
  const first = afterApi[0];
  if (['manage', 'master', 'optimoroute'].includes(first) && afterApi[1]) {
    return `${first}_${afterApi[1]}`.toUpperCase();
  }
  return first.toUpperCase();
}

function getAuditTargetId(req) {
  const candidates = [
    req.params?.id,
    req.params?.listId,
    req.params?.userId,
    req.params?.carReleaseId,
    req.params?.groupStoreId,
    req.body?.id,
    req.body?.user_id,
    req.body?.username,
    req.body?.store_id,
    req.body?.group_store_id,
    req.body?.level_user_id,
    req.body?.permission_id,
    req.query?.id
  ];
  const target = candidates.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
  return target !== undefined ? String(target) : '';
}

function getAuditAction(req) {
  const path = req.originalUrl.split('?')[0];
  if (req.method === 'POST' && path.includes('/auth/login')) {
    return 'LOGIN';
  }
  if (req.method === 'POST') {
    return 'CREATE';
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    return 'UPDATE';
  }
  if (req.method === 'DELETE') {
    return 'DELETE';
  }
  return req.method;
}

function auditRequestLogger(req, res, next) {
  const methodsToAudit = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!methodsToAudit.includes(req.method)) {
    return next();
  }

  const startTime = Date.now();
  res.on('finish', async () => {
    try {
      const action = getAuditAction(req);
      const targetType = getAuditTargetType(req.originalUrl || req.url || '');
      const targetId = getAuditTargetId(req);
      const details = {
        path: req.originalUrl || req.url,
        method: req.method,
        status: res.statusCode,
        duration_ms: Date.now() - startTime,
        params: req.params || {},
        query: req.query || {},
        body: sanitizeAuditBody(req.body)
      };

      await logAudit(req, { action, targetType, targetId, details });
    } catch (err) {
      console.error('Error writing request audit log:', err);
    }
  });

  next();
}

module.exports = {
  logAudit,
  auditRequestLogger
};
