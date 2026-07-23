const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// =========================================================
// ACCESS (กลุ่มสิทธิ์ระบบ) — CRUD
// =========================================================

// GET /api/manage/access — ดึงรายการ Access ทั้งหมด
router.get('/access', authenticateToken, async (req, res) => {
  try {
    const accesses = await query('SELECT * FROM access ORDER BY access_id ASC');
    res.json({ success: true, accesses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/manage/access — สร้าง Access ใหม่
router.post('/access', authenticateToken, async (req, res) => {
  try {
    const { access_name, description } = req.body;
    if (!access_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อกลุ่มสิทธิ์' });
    }
    const result = await query(
      'INSERT INTO access (access_name, description) VALUES (?, ?)',
      [access_name, description || null]
    );
    res.json({ success: true, message: 'สร้างกลุ่มสิทธิ์ใหม่เรียบร้อยแล้ว', access_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/manage/access/:id — แก้ไข Access
router.put('/access/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { access_name, description } = req.body;
    if (!access_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อกลุ่มสิทธิ์' });
    }
    await query(
      'UPDATE access SET access_name = ?, description = ? WHERE access_id = ?',
      [access_name, description || null, id]
    );
    res.json({ success: true, message: 'อัปเดตกลุ่มสิทธิ์เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/manage/access/:id — ลบ Access
router.delete('/access/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // ตรวจสอบว่ามี level_user ผูกอยู่ไหม
    const linked = await query('SELECT COUNT(*) as cnt FROM level_user WHERE access_id = ?', [id]);
    if (linked[0].cnt > 0) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบได้ เนื่องจากมีระดับผู้ใช้งานที่ใช้กลุ่มสิทธิ์นี้อยู่' });
    }
    await query('DELETE FROM access WHERE access_id = ?', [id]);
    res.json({ success: true, message: 'ลบกลุ่มสิทธิ์เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// LEVEL USERS (ระดับผู้ใช้งาน / Roles) — CRUD
// =========================================================

// POST /api/manage/level-users — สร้าง Level User ใหม่
router.post('/level-users', authenticateToken, async (req, res) => {
  try {
    const { level_user_name, access_id, setting_car_release, menu_permissions } = req.body;
    if (!level_user_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อระดับผู้ใช้งาน' });
    }
    const menuPermStr = typeof menu_permissions === 'object' ? JSON.stringify(menu_permissions) : menu_permissions;
    const result = await query(
      'INSERT INTO level_user (level_user_name, access_id, setting_car_release, menu_permissions) VALUES (?, ?, ?, ?)',
      [level_user_name, access_id || null, setting_car_release ? 1 : 0, menuPermStr || null]
    );
    res.json({ success: true, message: 'สร้างระดับผู้ใช้งานใหม่เรียบร้อยแล้ว', level_user_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/manage/level-users/:id — ลบ Level User
router.delete('/level-users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === 1) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบระดับผู้ใช้งาน Admin ได้' });
    }
    // ตรวจสอบว่ามี user ผูกอยู่ไหม
    const linked = await query('SELECT COUNT(*) as cnt FROM user WHERE level_user_id = ?', [id]);
    if (linked[0].cnt > 0) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถลบได้ เนื่องจากมีผู้ใช้งานที่ใช้ระดับนี้อยู่' });
    }
    // ลบ role_permission ที่ผูกไว้ด้วย
    await query('DELETE FROM role_permission WHERE level_user_id = ?', [id]);
    await query('DELETE FROM level_user WHERE level_user_id = ?', [id]);
    res.json({ success: true, message: 'ลบระดับผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// PERMISSIONS (สิทธิ์) — CRUD
// =========================================================

// GET /api/manage/permissions — ดึงรายการ Permission ทั้งหมด
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const permissions = await query('SELECT * FROM permission ORDER BY menu_group ASC, action_type ASC, permission_id ASC');
    res.json({ success: true, permissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/manage/permissions — สร้าง Permission ใหม่
router.post('/permissions', authenticateToken, async (req, res) => {
  try {
    const { permission_key, permission_name, menu_group, action_type, description } = req.body;
    if (!permission_key || !permission_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก Permission Key และชื่อสิทธิ์' });
    }

    // ตรวจสอบ key ซ้ำ
    const existing = await query('SELECT permission_id FROM permission WHERE permission_key = ?', [permission_key]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Permission Key นี้มีอยู่ในระบบแล้ว' });
    }

    const result = await query(
      'INSERT INTO permission (permission_key, permission_name, menu_group, action_type, description) VALUES (?, ?, ?, ?, ?)',
      [permission_key, permission_name, menu_group || null, action_type || null, description || null]
    );
    res.json({ success: true, message: 'สร้างสิทธิ์ใหม่เรียบร้อยแล้ว', permission_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/manage/permissions/:id — แก้ไข Permission
router.put('/permissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_key, permission_name, menu_group, action_type, description } = req.body;
    if (!permission_key || !permission_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอก Permission Key และชื่อสิทธิ์' });
    }

    // ตรวจสอบ key ซ้ำ (ยกเว้นตัวเอง)
    const existing = await query('SELECT permission_id FROM permission WHERE permission_key = ? AND permission_id != ?', [permission_key, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Permission Key นี้มีอยู่ในระบบแล้ว' });
    }

    await query(
      'UPDATE permission SET permission_key = ?, permission_name = ?, menu_group = ?, action_type = ?, description = ? WHERE permission_id = ?',
      [permission_key, permission_name, menu_group || null, action_type || null, description || null, id]
    );
    res.json({ success: true, message: 'อัปเดตสิทธิ์เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/manage/permissions/:id — ลบ Permission
router.delete('/permissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // ลบ role_permission ที่ผูกไว้ด้วย
    await query('DELETE FROM role_permission WHERE permission_id = ?', [id]);
    await query('DELETE FROM permission WHERE permission_id = ?', [id]);
    res.json({ success: true, message: 'ลบสิทธิ์เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// ROLE PERMISSIONS (ผูก Permission กับ Role) — CRUD
// =========================================================

// GET /api/manage/role-permissions/:levelUserId — ดึง Permissions ของ Role
router.get('/role-permissions/:levelUserId', authenticateToken, async (req, res) => {
  try {
    const { levelUserId } = req.params;
    const rolePerms = await query(
      `SELECT rp.role_permission_id, rp.level_user_id, rp.permission_id, p.permission_key, p.permission_name, p.menu_group, p.action_type
       FROM role_permission rp
       JOIN permission p ON rp.permission_id = p.permission_id
       WHERE rp.level_user_id = ?
       ORDER BY p.menu_group ASC, p.action_type ASC`,
      [levelUserId]
    );
    res.json({ success: true, rolePermissions: rolePerms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/manage/role-permissions — ดึง Role Permissions ทั้งหมด
router.get('/role-permissions', authenticateToken, async (req, res) => {
  try {
    const rolePerms = await query(
      `SELECT rp.role_permission_id, rp.level_user_id, rp.permission_id, p.permission_key, p.permission_name, p.menu_group, p.action_type
       FROM role_permission rp
       JOIN permission p ON rp.permission_id = p.permission_id
       ORDER BY rp.level_user_id ASC, p.menu_group ASC, p.action_type ASC`
    );
    res.json({ success: true, rolePermissions: rolePerms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/manage/role-permissions/:levelUserId — อัปเดต Permissions ของ Role (bulk replace)
router.put('/role-permissions/:levelUserId', authenticateToken, async (req, res) => {
  try {
    const { levelUserId } = req.params;
    const { permission_ids } = req.body; // array of permission_id

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({ success: false, message: 'กรุณาส่ง permission_ids เป็น array' });
    }

    // ลบ permissions เดิมทั้งหมดของ role นี้
    await query('DELETE FROM role_permission WHERE level_user_id = ?', [levelUserId]);

    // เพิ่ม permissions ใหม่
    if (permission_ids.length > 0) {
      const values = permission_ids.map(pid => `(${parseInt(levelUserId)}, ${parseInt(pid)})`).join(', ');
      await query(`INSERT INTO role_permission (level_user_id, permission_id) VALUES ${values}`);
    }

    res.json({ success: true, message: 'อัปเดตสิทธิ์ของระดับผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/manage/role-permissions/toggle — สลับเปิด/ปิดสิทธิ์เดี่ยว
router.post('/role-permissions/toggle', authenticateToken, async (req, res) => {
  try {
    const { level_user_id, permission_id } = req.body;
    if (!level_user_id || !permission_id) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ level_user_id และ permission_id' });
    }

    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    const existing = await query(
      'SELECT role_permission_id FROM role_permission WHERE level_user_id = ? AND permission_id = ?',
      [level_user_id, permission_id]
    );

    if (existing.length > 0) {
      // ลบออก (ปิดสิทธิ์)
      await query('DELETE FROM role_permission WHERE level_user_id = ? AND permission_id = ?', [level_user_id, permission_id]);
      res.json({ success: true, action: 'removed', message: 'ปิดสิทธิ์เรียบร้อยแล้ว' });
    } else {
      // เพิ่ม (เปิดสิทธิ์)
      await query('INSERT INTO role_permission (level_user_id, permission_id) VALUES (?, ?)', [level_user_id, permission_id]);
      res.json({ success: true, action: 'added', message: 'เปิดสิทธิ์เรียบร้อยแล้ว' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
