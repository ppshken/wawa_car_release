const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { clearApiKeyCache } = require('../utils/apiKeyHelper');

/**
 * Auto-migration: Ensure table api_keys exists and seed default keys
 */
async function initApiKeysTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        key_service VARCHAR(100) NOT NULL,
        key_value TEXT NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default keys if table is empty
    const countRows = await query('SELECT COUNT(*) AS total FROM api_keys');
    if (countRows && countRows[0].total === 0) {
      const defaultKeys = [
        [
          'OPTIMOROUTE_API_KEY',
          'OptimoRoute',
          process.env.OPTIMOROUTE_API_KEY || '430a4eb0ac4140d1a1498ddfbd7197fcPP64S5MVDFM',
          'API Key สำหรับเชื่อมต่อกับ OptimoRoute API ในการจัดวางเส้นทางเดินรถและนำเข้าข้อมูล',
          1
        ],
        [
          'GPS_API_TOKEN',
          'GPS IAM',
          process.env.GPS_API_TOKEN || '13dade62-5bd6-4082-b0ce-36757dec0d47',
          'Bearer Token สำหรับเรียกใช้ GPS IAM API ติดตามพิกัดตำแหน่งรถจัดส่งสินค้า',
          1
        ],
        [
          'GPS_API_URL',
          'GPS IAM',
          process.env.GPS_API_URL || 'https://api.gpsiam.app/devices',
          'Endpoint URL หลักสำหรับเรียกดูอุปกรณ์ GPS รถยนต์ทั้งหมดในระบบ',
          1
        ]
      ];

      for (const k of defaultKeys) {
        await query(
          `INSERT IGNORE INTO api_keys (key_name, key_service, key_value, description, is_active) VALUES (?, ?, ?, ?, ?)`,
          k
        );
      }
      console.log('✅ Default API Keys seeded into database table api_keys successfully.');
    }
  } catch (err) {
    console.error('Error initializing api_keys table:', err.message);
  }
}

// Execute table check on module import
initApiKeysTable();

// GET /api/api-keys - Get all API keys
router.get('/api-keys', authenticateToken, async (req, res) => {
  try {
    const keys = await query(
      'SELECT id, key_name, key_service, key_value, description, is_active, created_at, updated_at FROM api_keys ORDER BY id ASC'
    );
    res.json({ success: true, keys: keys || [] });
  } catch (err) {
    console.error('GET /api-keys error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/api-keys/:id - Get single API key by ID
router.get('/api-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM api_keys WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล API Key ที่ระบุ' });
    }
    res.json({ success: true, apiKey: rows[0] });
  } catch (err) {
    console.error('GET /api-keys/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/api-keys - Create a new API Key
router.post('/api-keys', authenticateToken, async (req, res) => {
  try {
    const { key_name, key_service, key_value, description, is_active } = req.body;
    if (!key_name || !key_service || !key_value) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (key_name, key_service, key_value)'
      });
    }

    const cleanName = key_name.trim().toUpperCase();
    const result = await query(
      `INSERT INTO api_keys (key_name, key_service, key_value, description, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, key_service.trim(), key_value.trim(), description || null, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    clearApiKeyCache();
    res.json({
      success: true,
      message: 'เพิ่ม API Key ใหม่สำเร็จ!',
      id: result.insertId
    });
  } catch (err) {
    console.error('POST /api-keys error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'ชื่อ API Key นี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/api-keys/:id - Update existing API Key
router.put('/api-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { key_name, key_service, key_value, description, is_active } = req.body;

    if (!key_name || !key_service || !key_value) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (key_name, key_service, key_value)'
      });
    }

    const cleanName = key_name.trim().toUpperCase();
    await query(
      `UPDATE api_keys 
       SET key_name = ?, key_service = ?, key_value = ?, description = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [cleanName, key_service.trim(), key_value.trim(), description || null, is_active !== undefined ? (is_active ? 1 : 0) : 1, id]
    );

    clearApiKeyCache();
    res.json({ success: true, message: 'อัปเดตข้อมูล API Key เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('PUT /api-keys/:id error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'ชื่อ API Key นี้ซ้ำกับรายการอื่นในระบบ' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/api-keys/:id - Delete an API Key
router.delete('/api-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM api_keys WHERE id = ?', [id]);
    clearApiKeyCache();
    res.json({ success: true, message: 'ลบรายการ API Key เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('DELETE /api-keys/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
