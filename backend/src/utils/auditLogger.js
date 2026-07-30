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

module.exports = {
  logAudit
};
