const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const users = await query(
      `SELECT u.*, l.level_user_name, l.setting_car_release, a.access_name 
       FROM user u 
       LEFT JOIN level_user l ON u.level_user_id = l.level_user_id
       LEFT JOIN access a ON l.access_id = a.access_id
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];
    const userStatus = (user.user_status || '').toString().toLowerCase();
    if (userStatus === 'inactive' || userStatus === '0' || userStatus === 'disabled') {
      return res.status(403).json({ success: false, message: 'บัญชีถูกปิดการใช้งาน' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const tokenPayload = {
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      level_user_id: user.level_user_id,
      level_user_name: user.level_user_name,
      setting_car_release: user.setting_car_release
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'wawa_car_release_secret_key_2026_jwt',
      { expiresIn: '24h' }
    );

    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      `SELECT u.user_id, u.username, u.name, u.phone_number_1, u.level_user_id,
              u.user_image, u.location_now,
              IF(u.user_status = 'inactive' OR u.user_status = '0', 'inactive', 'active') AS user_status,
              l.level_user_name, l.setting_car_release, l.menu_permissions, a.access_id, a.access_name
       FROM user u
       LEFT JOIN level_user l ON u.level_user_id = l.level_user_id
       LEFT JOIN access a ON l.access_id = a.access_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    if (user.user_status === 'inactive') {
      return res.status(403).json({ success: false, message: 'บัญชีถูกปิดการใช้งาน' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


const { upload, saveBase64Image } = require('../middleware/upload');

// Ensure user_image column exists
async function ensureUserImageColumns() {
  try {
    const cols = await query("SHOW COLUMNS FROM user LIKE 'user_image'");
    if (cols.length === 0) {
      await query("ALTER TABLE user ADD COLUMN user_image VARCHAR(255) NULL AFTER level_user_id");
    }
  } catch (err) {
    console.error("Error checking user_image column:", err.message);
  }
}
ensureUserImageColumns();

// GET /api/users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      `SELECT u.user_id,
              u.username,
              u.name,
              u.phone_number_1,
              u.level_user_id,
              u.user_image,
              u.location_now,
              IF(u.user_status = 'inactive' OR u.user_status = '0', 'inactive', 'active') AS user_status,
              l.level_user_name,
              l.setting_car_release,
              a.access_id,
              a.access_name
       FROM user u
       LEFT JOIN level_user l ON u.level_user_id = l.level_user_id
       LEFT JOIN access a ON l.access_id = a.access_id
       ORDER BY u.user_id DESC`
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users (Create User)
router.post('/users', authenticateToken, upload.single('user_image'), async (req, res) => {
  try {
    const { username, password, name, phone_number_1, level_user_id, user_status } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูล Username, Password และชื่อพนักงานให้ครบถ้วน' });
    }

    const existing = await query('SELECT user_id FROM user WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username นี้ถูกใช้งานแล้ว' });
    }

    let user_image = null;
    if (req.file) {
      const sub = req.file.subDir || 'user';
      user_image = `/uploads/${sub}/${req.file.filename}`;
    } else if (req.body.user_image) {
      user_image = saveBase64Image(req.body.user_image, 'user');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO user (username, password, name, phone_number_1, level_user_id, user_status, user_image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, name, phone_number_1 || '', level_user_id || 3, user_status || 'active', user_image]
    );

    res.json({ success: true, message: 'เพิ่มพนักงานใหม่เรียบร้อยแล้ว', user_id: result.insertId, user_image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id (Update User)
router.put('/users/:id', authenticateToken, upload.single('user_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number_1, level_user_id, password, user_status } = req.body;

    let user_image = undefined;
    if (req.file) {
      const sub = req.file.subDir || 'user';
      user_image = `/uploads/${sub}/${req.file.filename}`;
    } else if (req.body.user_image !== undefined) {
      user_image = saveBase64Image(req.body.user_image, 'user');
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (user_image !== undefined) {
        await query(
          `UPDATE user SET name = ?, phone_number_1 = ?, level_user_id = ?, password = ?, user_status = ?, user_image = ? WHERE user_id = ?`,
          [name, phone_number_1 || '', level_user_id, hashedPassword, user_status || 'active', user_image, id]
        );
      } else {
        await query(
          `UPDATE user SET name = ?, phone_number_1 = ?, level_user_id = ?, password = ?, user_status = ? WHERE user_id = ?`,
          [name, phone_number_1 || '', level_user_id, hashedPassword, user_status || 'active', id]
        );
      }
    } else {
      if (user_image !== undefined) {
        await query(
          `UPDATE user SET name = ?, phone_number_1 = ?, level_user_id = ?, user_status = ?, user_image = ? WHERE user_id = ?`,
          [name, phone_number_1 || '', level_user_id, user_status || 'active', user_image, id]
        );
      } else {
        await query(
          `UPDATE user SET name = ?, phone_number_1 = ?, level_user_id = ?, user_status = ? WHERE user_id = ?`,
          [name, phone_number_1 || '', level_user_id, user_status || 'active', id]
        );
      }
    }

    res.json({ success: true, message: 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว', user_image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/status (Toggle User Active/Inactive Status)
router.put('/users/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_status } = req.body;
    await query('UPDATE user SET user_status = ? WHERE user_id = ?', [user_status || 'active', id]);
    res.json({ success: true, message: `อัปเดตสถานะผู้ใช้งานเป็น "${user_status === 'inactive' ? 'ปิดการใช้งาน' : 'ใช้งานอยู่'}" เรียบร้อยแล้ว` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id (Delete User)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await query('SELECT user_id, username, level_user_id FROM user WHERE user_id = ?', [id]);
    if (targetUser.length > 0) {
      const u = targetUser[0];
      if (u.level_user_id === 1 || u.username === 'admin' || u.username === 'user1.admin') {
        return res.status(400).json({ success: false, message: 'ไม่สามารถลบบัญชีผู้ใช้งานระดับ Admin ได้' });
      }
    }
    await query('DELETE FROM user WHERE user_id = ?', [id]);
    res.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET /api/level-users (Get Level Users / Roles)
router.get('/level-users', authenticateToken, async (req, res) => {
  try {
    const levelUsers = await query(
      `SELECT l.*, a.access_name 
       FROM level_user l 
       LEFT JOIN access a ON l.access_id = a.access_id 
       ORDER BY l.level_user_id ASC`
    );
    res.json({ success: true, levelUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/level-users/:id (Update Role Permissions)
router.put('/level-users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { level_user_name, setting_car_release, access_id, menu_permissions } = req.body;
    const menuPermStr = typeof menu_permissions === 'object' ? JSON.stringify(menu_permissions) : menu_permissions;
    
    await query(
      `UPDATE level_user SET level_user_name = ?, setting_car_release = ?, access_id = ?, menu_permissions = ? WHERE level_user_id = ?`,
      [level_user_name, setting_car_release ? 1 : 0, access_id || 3, menuPermStr || null, id]
    );
    res.json({ success: true, message: 'อัปเดตสิทธิ์การเข้าถึงเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET /api/access-levels
router.get('/access-levels', authenticateToken, async (req, res) => {
  try {
    const accesses = await query('SELECT * FROM access ORDER BY access_id ASC');
    res.json({ success: true, accesses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

