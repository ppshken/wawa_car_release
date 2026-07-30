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

// Helper function to sync role_permission table to level_user.menu_permissions JSON column
async function syncRolePermissionsToMenuPermissions(levelUserId) {
  try {
    const rows = await query(
      `SELECT p.permission_key 
       FROM role_permission rp 
       JOIN permission p ON rp.permission_id = p.permission_id 
       WHERE rp.level_user_id = ?`,
      [levelUserId]
    );

    const menuPermObj = {};
    rows.forEach(r => {
      if (r.permission_key) {
        menuPermObj[r.permission_key] = true;
      }
    });

    await query(
      `UPDATE level_user SET menu_permissions = ? WHERE level_user_id = ?`,
      [JSON.stringify(menuPermObj), levelUserId]
    );
    return menuPermObj;
  } catch (err) {
    console.error('Error syncing role permissions:', err);
  }
}

// Auto-seed default system menu permissions
(async () => {
  try {
    const defaultPermissions = [
      { key: 'dashboard', name: 'หน้าแดชบอร์ด', group: 'เมนูหลัก', action: 'view', desc: 'การเข้าถึงหน้าแดชบอร์ดสรุปผล' },
      { key: 'releases', name: 'รายการใบปล่อยรถ', group: 'เมนูหลัก', action: 'view', desc: 'การเข้าถึงหน้ารายการใบปล่อยรถ' },
      { key: 'route', name: 'จัดรถ & เส้นทาง', group: 'เมนูหลัก', action: 'view', desc: 'การเข้าถึงหน้าแผนที่จัดรถและเส้นทาง' },
      { key: 'import_optimo', name: 'นำเข้า OptimoRoute', group: 'เมนูหลัก', action: 'view', desc: 'การเข้าถึงหน้านำเข้าข้อมูลเส้นทาง' },
      { key: 'reports', name: 'รายงานระบบ & Audit Log', group: 'เมนูหลัก', action: 'view', desc: 'การเข้าถึงหน้ารายงานระบบและประวัติกิจกรรม' },
      { key: 'users', name: 'จัดการผู้ใช้งาน', group: 'จัดการผู้ใช้งาน', action: 'view', desc: 'การเข้าถึงหน้าบริหารจัดการผู้ใช้งาน' },
      { key: 'user_levels', name: 'จัดการระดับผู้ใช้งาน', group: 'จัดการผู้ใช้งาน', action: 'view', desc: 'การเข้าถึงหน้าบริหารจัดการบทบาท/ระดับผู้ใช้' },
      { key: 'permissions', name: 'จัดการสิทธิ์ระบบ (Matrix)', group: 'จัดการผู้ใช้งาน', action: 'view', desc: 'การเข้าถึงหน้ากำหนดสิทธิ์ระบบรายเมนู' },
      { key: 'user_access', name: 'จัดการกลุ่มการเข้าถึง', group: 'จัดการผู้ใช้งาน', action: 'view', desc: 'การเข้าถึงหน้าจัดการกลุ่มสิทธิ์ Access' },
      { key: 'stores', name: 'ข้อมูลร้านค้า', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าข้อมูลร้านค้า' },
      { key: 'keys', name: 'ข้อมูลที่ฝากกุญแจ', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าข้อมูลที่ฝากกุญแจ' },
      { key: 'pda', name: 'ข้อมูลเครื่อง PDA', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าข้อมูลเครื่อง PDA' },
      { key: 'payments', name: 'ข้อมูลช่องทางชำระเงิน', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าประเภทการชำระเงิน' },
      { key: 'vehicles', name: 'ข้อมูลรถ', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าข้อมูลรถ' },
      { key: 'parking', name: 'ข้อมูลที่จอดรถ', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าข้อมูลที่จอดรถ' },
      { key: 'accounting_status', name: 'สถานะทางบัญชี', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าสถานะตรวจสอบทางบัญชี' },
      { key: 'position_product', name: 'ตำแหน่งวางสินค้า', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าตำแหน่งวางสินค้า' },
      { key: 'release_types', name: 'ประเภทการปล่อยรถ', group: 'ข้อมูลมาสเตอร์', action: 'view', desc: 'การเข้าถึงหน้าจัดการประเภทการปล่อยรถ' }
    ];

    for (const p of defaultPermissions) {
      const exist = await query('SELECT permission_id FROM permission WHERE permission_key = ?', [p.key]);
      if (exist.length === 0) {
        await query(
          'INSERT INTO permission (permission_key, permission_name, menu_group, action_type, description) VALUES (?, ?, ?, ?, ?)',
          [p.key, p.name, p.group, p.action, p.desc]
        );
      }
    }

    // Grant Admin (level 1) all default permissions if missing
    const allP = await query('SELECT permission_id FROM permission');
    for (const item of allP) {
      try {
        await query('INSERT IGNORE INTO role_permission (level_user_id, permission_id) VALUES (1, ?)', [item.permission_id]);
      } catch (e) {}
    }
    await syncRolePermissionsToMenuPermissions(1);

    // Grant Admin staff (level 2) default permissions
    const lvl2Keys = ['dashboard', 'releases', 'route', 'import_optimo', 'reports', 'stores', 'keys', 'pda', 'payments', 'vehicles', 'parking', 'accounting_status', 'position_product', 'release_types'];
    const lvl2Placeholders = lvl2Keys.map(() => '?').join(',');
    const lvl2Ps = await query(`SELECT permission_id FROM permission WHERE permission_key IN (${lvl2Placeholders})`, lvl2Keys);
    for (const item of lvl2Ps) {
      try {
        await query('INSERT IGNORE INTO role_permission (level_user_id, permission_id) VALUES (2, ?)', [item.permission_id]);
      } catch (e) {}
    }
    await syncRolePermissionsToMenuPermissions(2);

    // Grant Driver (level 3) default permissions
    const lvl3Keys = ['dashboard', 'releases', 'route'];
    const lvl3Placeholders = lvl3Keys.map(() => '?').join(',');
    const lvl3Ps = await query(`SELECT permission_id FROM permission WHERE permission_key IN (${lvl3Placeholders})`, lvl3Keys);
    for (const item of lvl3Ps) {
      try {
        await query('INSERT IGNORE INTO role_permission (level_user_id, permission_id) VALUES (3, ?)', [item.permission_id]);
      } catch (e) {}
    }
    await syncRolePermissionsToMenuPermissions(3);

    console.log('[PermissionSeed] Auto-seed completed for all levels');
  } catch (err) {
    console.error('Error auto-seeding permissions:', err);
  }
})();

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

    await syncRolePermissionsToMenuPermissions(levelUserId);

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

    let action = '';
    if (existing.length > 0) {
      // ลบออก (ปิดสิทธิ์)
      await query('DELETE FROM role_permission WHERE level_user_id = ? AND permission_id = ?', [level_user_id, permission_id]);
      action = 'removed';
    } else {
      // เพิ่ม (เปิดสิทธิ์)
      await query('INSERT INTO role_permission (level_user_id, permission_id) VALUES (?, ?)', [level_user_id, permission_id]);
      action = 'added';
    }

    const updatedMenuPerms = await syncRolePermissionsToMenuPermissions(level_user_id);

    res.json({
      success: true,
      action,
      message: action === 'added' ? 'เปิดสิทธิ์เรียบร้อยแล้ว' : 'ปิดสิทธิ์เรียบร้อยแล้ว',
      menu_permissions: updatedMenuPerms
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

