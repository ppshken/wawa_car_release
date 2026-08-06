const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Helper to initialize table
let isTableInitialized = false;
async function initAvoidZoneTable() {
  if (isTableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS avoid_zone (
        zone_id INT AUTO_INCREMENT PRIMARY KEY,
        zone_name VARCHAR(255) NOT NULL,
        zone_type VARCHAR(50) DEFAULT 'unpaved',
        coordinates JSON NOT NULL,
        is_active TINYINT DEFAULT 1,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    isTableInitialized = true;
  } catch (err) {
    console.warn('Init avoid_zone table warning:', err.message);
  }
}

// GET /api/master/avoid-zones - ดึงรายการพื้นที่ห้ามผ่านทั้งหมด
router.get('/avoid-zones', authenticateToken, async (req, res) => {
  try {
    await initAvoidZoneTable();
    const rows = await query(`SELECT * FROM avoid_zone ORDER BY zone_id DESC`);
    const zones = (rows || []).map((row) => ({
      ...row,
      coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
      is_active: row.is_active === 1 || row.is_active === true
    }));
    res.json({ success: true, zones });
  } catch (err) {
    console.error('GET /avoid-zones error:', err);
    res.status(500).json({ success: false, message: err.message, zones: [] });
  }
});

// POST /api/master/avoid-zones - เพิ่มพื้นที่ห้ามผ่านใหม่
router.post('/avoid-zones', authenticateToken, async (req, res) => {
  try {
    await initAvoidZoneTable();
    const { zone_name, zone_type, coordinates, description, is_active } = req.body;

    if (!zone_name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อพื้นที่และระบุพิกัด Polygon อย่างน้อย 3 จุด'
      });
    }

    const typeVal = zone_type || 'unpaved';
    const activeVal = is_active === false || is_active === 0 ? 0 : 1;
    const coordsJson = JSON.stringify(coordinates);
    const descVal = description ? String(description).trim() : null;

    const result = await query(
      `INSERT INTO avoid_zone (zone_name, zone_type, coordinates, is_active, description)
       VALUES (?, ?, ?, ?, ?)`,
      [zone_name.trim(), typeVal, coordsJson, activeVal, descVal]
    );

    res.json({
      success: true,
      message: 'บันทึกพื้นที่ห้ามผ่านเรียบร้อยแล้ว',
      zone_id: result.insertId
    });
  } catch (err) {
    console.error('POST /avoid-zones error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/avoid-zones/:id - แก้ไขข้อมูล/เปิด-ปิดใช้งานพื้นที่ห้ามผ่าน
router.put('/avoid-zones/:id', authenticateToken, async (req, res) => {
  try {
    await initAvoidZoneTable();
    const { id } = req.params;
    const { zone_name, zone_type, coordinates, description, is_active } = req.body;

    let updateFields = [];
    let params = [];

    if (zone_name !== undefined) {
      updateFields.push('zone_name = ?');
      params.push(String(zone_name).trim());
    }
    if (zone_type !== undefined) {
      updateFields.push('zone_type = ?');
      params.push(String(zone_type));
    }
    if (coordinates !== undefined && Array.isArray(coordinates)) {
      updateFields.push('coordinates = ?');
      params.push(JSON.stringify(coordinates));
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(is_active === 1 || is_active === true ? 1 : 0);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      params.push(description ? String(description).trim() : null);
    }

    if (updateFields.length === 0) {
      return res.json({ success: true, message: 'ไม่มีข้อมูลที่ต้องอัปเดต' });
    }

    params.push(id);
    await query(`UPDATE avoid_zone SET ${updateFields.join(', ')} WHERE zone_id = ?`, params);

    res.json({ success: true, message: 'อัปเดตพื้นที่ห้ามผ่านเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('PUT /avoid-zones/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/avoid-zones/:id - ลบพื้นที่ห้ามผ่าน
router.delete('/avoid-zones/:id', authenticateToken, async (req, res) => {
  try {
    await initAvoidZoneTable();
    const { id } = req.params;
    await query(`DELETE FROM avoid_zone WHERE zone_id = ?`, [id]);
    res.json({ success: true, message: 'ลบพื้นที่ห้ามผ่านเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('DELETE /avoid-zones/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
