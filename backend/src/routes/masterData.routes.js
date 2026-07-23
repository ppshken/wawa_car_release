const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const xlsx = require('xlsx');

// =========================================================
// 1. STORES (ตาราง: store)
// =========================================================

// GET /api/master/stores (Supports server-side pagination & search: ?page=1&limit=10&search=xyz)
router.get('/stores', authenticateToken, async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    let whereClause = '';
    const params = [];

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      whereClause = ' WHERE (store_id LIKE ? OR store_name LIKE ? OR store_address LIKE ? OR telephone_number LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * limitNum;

      const countSql = `SELECT COUNT(*) AS total FROM store${whereClause}`;
      const countRes = await query(countSql, params);
      const total = countRes[0]?.total || 0;

      const dataSql = `SELECT * FROM store${whereClause} ORDER BY store_id DESC LIMIT ${limitNum} OFFSET ${offset}`;
      const stores = await query(dataSql, params);

      return res.json({
        success: true,
        stores,
        total,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      });
    }

    // Default: Return all stores if no page specified
    const stores = await query(`SELECT * FROM store${whereClause} ORDER BY store_id DESC`, params);
    res.json({ success: true, stores, total: stores.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/stores
router.post('/stores', authenticateToken, async (req, res) => {
  try {
    const { store_id, store_no, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location } = req.body;
    const targetStoreId = store_id || store_no;
    if (!targetStoreId || !store_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสร้านค้า (store_id) และชื่อร้านค้า' });
    }
    await query(
      `INSERT INTO store (store_id, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [targetStoreId, store_name, store_address || null, telephone_number || null, fax_number || null, email || null, url || null, customer_delivery_time || null, store_location || null]
    );
    res.json({ success: true, message: 'เพิ่มข้อมูลร้านค้าสำเร็จ', store_id: targetStoreId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/stores/:id
router.put('/stores/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { store_id, store_no, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location } = req.body;
    const targetStoreId = store_id || store_no || id;
    if (!targetStoreId || !store_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสร้านค้า (store_id) และชื่อร้านค้า' });
    }
    await query(
      `UPDATE store SET store_id = ?, store_name = ?, store_address = ?, telephone_number = ?, fax_number = ?, email = ?, url = ?, customer_delivery_time = ?, store_location = ? WHERE store_id = ?`,
      [targetStoreId, store_name, store_address || null, telephone_number || null, fax_number || null, email || null, url || null, customer_delivery_time || null, store_location || null, id]
    );
    res.json({ success: true, message: 'อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/stores/:id
router.delete('/stores/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM store WHERE store_id = ?', [id]);
    res.json({ success: true, message: 'ลบร้านค้าเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/stores/import (Excel/CSV upload)
router.post('/stores/import', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ Excel หรือ CSV' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลในไฟล์ Excel' });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let rowIndex = 0;

    for (const row of sheetData) {
      rowIndex++;
      let rawStoreId = row['รหัสร้านค้า'] || row['store_id'] || row['store_no'] || row['Store ID'] || row['ID'] || row['StoreNo'] || row['StoreID'];
      const store_name = row['ชื่อร้านค้า'] || row['store_name'] || row['Store Name'] || row['StoreName'];

      if (!store_name) continue;

      if (!rawStoreId || String(rawStoreId).trim() === '') {
        rawStoreId = `ST-${Date.now().toString().slice(-4)}${rowIndex}`;
      }

      const store_id = String(rawStoreId).trim();
      const store_address = row['ที่อยู่'] || row['store_address'] || row['Address'] || '';
      const telephone_number = row['เบอร์โทรศัพท์'] || row['telephone_number'] || row['Phone'] || row['Tel'] || '';
      const fax_number = row['แฟกซ์'] || row['fax_number'] || row['Fax'] || '';
      const email = row['อีเมล'] || row['email'] || row['Email'] || '';
      const url = row['เว็บไซต์'] || row['url'] || row['URL'] || row['Website'] || '';
      const store_location = row['พิกัด'] || row['lat_long'] || row['store_location'] || row['Location'] || row['GPS'] || '';

      const sql = `
        INSERT INTO store (store_id, store_name, store_address, telephone_number, fax_number, email, url, store_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          store_name = VALUES(store_name),
          store_address = VALUES(store_address),
          telephone_number = VALUES(telephone_number),
          fax_number = VALUES(fax_number),
          email = VALUES(email),
          url = VALUES(url),
          store_location = VALUES(store_location)
      `;

      const result = await query(sql, [
        store_id,
        store_name,
        store_address || null,
        telephone_number ? String(telephone_number) : null,
        fax_number ? String(fax_number) : null,
        email ? String(email) : null,
        url ? String(url) : null,
        store_location ? String(store_location) : null
      ]);

      if (result.affectedRows === 1) {
        insertedCount++;
      } else if (result.affectedRows === 2) {
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `นำเข้าข้อมูลร้านค้าเรียบร้อยแล้ว (เพิ่มใหม่ ${insertedCount} รายการ, อัปเดต ${updatedCount} รายการ)`,
      insertedCount: insertedCount + updatedCount,
      insertedCountOnly: insertedCount,
      updatedCountOnly: updatedCount
    });
  } catch (err) {
    console.error('Store import error:', err);
    res.status(500).json({ success: false, message: err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel' });
  }
});

// GET /api/master/stores/export (Export Excel)
router.get('/stores/export', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = '';
    const params = [];

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      whereClause = ' WHERE (store_id LIKE ? OR store_name LIKE ? OR store_address LIKE ? OR telephone_number LIKE ?)';
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const stores = await query(`SELECT * FROM store${whereClause} ORDER BY store_id ASC`, params);

    const exportData = stores.map((s, index) => ({
      'ลำดับ': index + 1,
      'รหัสร้านค้า (store_id)': s.store_id || '',
      'ชื่อร้านค้า': s.store_name || '',
      'ที่อยู่': s.store_address || '',
      'เบอร์โทรศัพท์': s.telephone_number || '',
      'แฟกซ์': s.fax_number || '',
      'อีเมล': s.email || '',
      'เว็บไซต์': s.url || '',
      'พิกัด GPS': s.store_location || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 8 },  // ลำดับ
      { wch: 18 }, // รหัสร้านค้า
      { wch: 30 }, // ชื่อร้านค้า
      { wch: 40 }, // ที่อยู่
      { wch: 18 }, // เบอร์โทรศัพท์
      { wch: 18 }, // แฟกซ์
      { wch: 25 }, // อีเมล
      { wch: 25 }, // เว็บไซต์
      { wch: 22 }  // พิกัด GPS
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Stores');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `stores_export_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Store export error:', err);
    res.status(500).json({ success: false, message: err.message || 'เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel' });
  }
});


// =========================================================
// 2. KEY STORAGE / KEY HOLDERS (ตาราง: key_holder)
// =========================================================

// GET /api/master/keys
router.get('/keys', authenticateToken, async (req, res) => {
  try {
    const keys = await query('SELECT key_holder_id, key_holder_name FROM key_holder ORDER BY key_holder_id DESC');
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/keys
router.post('/keys', authenticateToken, async (req, res) => {
  try {
    const { key_holder_name, name } = req.body;
    const keyName = key_holder_name || name;
    if (!keyName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อจุด/ผู้ฝากกุญแจ' });
    }
    const result = await query('INSERT INTO key_holder (key_holder_name) VALUES (?)', [keyName]);
    res.json({ success: true, message: 'เพิ่มจุดฝากกุญแจสำเร็จ', key_holder_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/keys/:id
router.put('/keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { key_holder_name, name } = req.body;
    const keyName = key_holder_name || name;
    if (!keyName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อจุด/ผู้ฝากกุญแจ' });
    }
    await query('UPDATE key_holder SET key_holder_name = ? WHERE key_holder_id = ?', [keyName, id]);
    res.json({ success: true, message: 'อัปเดตข้อมูลจุดฝากกุญแจเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/keys/:id
router.delete('/keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM key_holder WHERE key_holder_id = ?', [id]);
    res.json({ success: true, message: 'ลบจุดฝากกุญแจเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 3. PDA DEVICES (ตาราง: pda_device)
// =========================================================

// GET /api/master/pda
router.get('/pda', authenticateToken, async (req, res) => {
  try {
    const pdas = await query('SELECT * FROM pda_device ORDER BY pda_id DESC');
    res.json({ success: true, pdas });
  } catch (err) {
    try {
      await query(`CREATE TABLE IF NOT EXISTS pda_device (
        pda_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        device_code VARCHAR(50) NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        serial_number VARCHAR(100),
        assigned_user VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      const pdas = await query('SELECT * FROM pda_device ORDER BY pda_id DESC');
      res.json({ success: true, pdas });
    } catch (e) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// POST /api/master/pda
router.post('/pda', authenticateToken, async (req, res) => {
  try {
    const { device_code, device_name, serial_number, assigned_user, status } = req.body;
    if (!device_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเครื่อง PDA' });
    }
    const code = device_code || `PDA-${Date.now().toString().slice(-4)}`;
    const result = await query(
      'INSERT INTO pda_device (device_code, device_name, serial_number, assigned_user, status) VALUES (?, ?, ?, ?, ?)',
      [code, device_name, serial_number || null, assigned_user || null, status || 'active']
    );
    res.json({ success: true, message: 'เพิ่มเครื่อง PDA สำเร็จ', pda_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/pda/:id
router.put('/pda/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { device_code, device_name, serial_number, assigned_user, status } = req.body;
    if (!device_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเครื่อง PDA' });
    }
    await query(
      'UPDATE pda_device SET device_code = ?, device_name = ?, serial_number = ?, assigned_user = ?, status = ? WHERE pda_id = ?',
      [device_code || null, device_name, serial_number || null, assigned_user || null, status || 'active', id]
    );
    res.json({ success: true, message: 'อัปเดตเครื่อง PDA เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/pda/:id
router.delete('/pda/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM pda_device WHERE pda_id = ?', [id]);
    res.json({ success: true, message: 'ลบเครื่อง PDA เรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 4. PAYMENT METHODS (ตาราง: payment)
// =========================================================

// GET /api/master/payments
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await query('SELECT payment_id, payment_name FROM payment ORDER BY payment_id DESC');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/payments
router.post('/payments', authenticateToken, async (req, res) => {
  try {
    const { payment_name, name } = req.body;
    const pName = payment_name || name;
    if (!pName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการชำระเงิน' });
    }
    const result = await query('INSERT INTO payment (payment_name) VALUES (?)', [pName]);
    res.json({ success: true, message: 'เพิ่มประเภทการชำระเงินสำเร็จ', payment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/payments/:id
router.put('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_name, name } = req.body;
    const pName = payment_name || name;
    if (!pName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการชำระเงิน' });
    }
    await query('UPDATE payment SET payment_name = ? WHERE payment_id = ?', [pName, id]);
    res.json({ success: true, message: 'อัปเดตประเภทการชำระเงินเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/payments/:id
router.delete('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM payment WHERE payment_id = ?', [id]);
    res.json({ success: true, message: 'ลบประเภทการชำระเงินเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 5. CARS / VEHICLES (ตาราง: car)
// =========================================================

// GET /api/master/vehicles
router.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    let vehicles = [];
    try {
      vehicles = await query('SELECT car_id AS vehicle_id, car_id, car_code, license_plate, brand, model, sub_model, year, created_at FROM car ORDER BY created_at DESC');
    } catch (e1) {
      try {
        vehicles = await query('SELECT car_id AS vehicle_id, car_id, NULL AS car_code, license_plate, brand, model, sub_model, year, created_at FROM car ORDER BY created_at DESC');
      } catch (e2) {
        try {
          vehicles = await query('SELECT car_id AS vehicle_id, car_id, NULL AS car_code, license_plate, brand, model, sub_model, year FROM car ORDER BY car_id DESC');
        } catch (e3) {
          vehicles = await query('SELECT * FROM car');
        }
      }
    }
    res.json({ success: true, vehicles });
  } catch (err) {
    console.error('Fetch vehicles error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/vehicles
router.post('/vehicles', authenticateToken, async (req, res) => {
  try {
    const { car_id, car_code, license_plate, brand, model, sub_model, year } = req.body;
    if (!license_plate) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกทะเบียนรถ' });
    }

    const crypto = require('crypto');
    const finalCarId = (car_id && String(car_id).trim())
      ? String(car_id).trim()
      : crypto.randomUUID().toUpperCase();

    try {
      await query(
        'INSERT INTO car (car_id, car_code, license_plate, brand, model, sub_model, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [finalCarId, car_code || null, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null]
      );
    } catch (dbErr) {
      try {
        await query(
          'INSERT INTO car (car_id, license_plate, brand, model, sub_model, year) VALUES (?, ?, ?, ?, ?, ?)',
          [finalCarId, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null]
        );
      } catch (e2) {
        await query(
          'INSERT INTO car (license_plate, brand, model, sub_model, year) VALUES (?, ?, ?, ?, ?)',
          [license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null]
        );
      }
    }

    res.json({ success: true, message: 'เพิ่มข้อมูลรถสำเร็จ', vehicle_id: finalCarId, car_id: finalCarId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/vehicles/:id
router.put('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { car_code, license_plate, brand, model, sub_model, year } = req.body;
    if (!license_plate) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกทะเบียนรถ' });
    }

    try {
      await query(
        'UPDATE car SET car_code = ?, license_plate = ?, brand = ?, model = ?, sub_model = ?, year = ? WHERE car_id = ?',
        [car_code || null, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, id]
      );
    } catch (dbErr) {
      await query(
        'UPDATE car SET license_plate = ?, brand = ?, model = ?, sub_model = ?, year = ? WHERE car_id = ?',
        [license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, id]
      );
    }

    res.json({ success: true, message: 'อัปเดตข้อมูลรถเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/vehicles/:id
router.delete('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM car WHERE car_id = ?', [id]);
    res.json({ success: true, message: 'ลบข้อมูลรถเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 5.1 GROUP STORES (ตาราง: group_store)
// =========================================================

// GET /api/master/groups
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    let groups;
    try {
      groups = await query('SELECT group_store_id, group_store_name, group_color, car_id, date, created_at FROM group_store ORDER BY group_store_id DESC');
    } catch (e1) {
      groups = await query('SELECT group_store_id, group_store_name, group_color, car_id, created_at FROM group_store ORDER BY group_store_id DESC');
    }
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/groups
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { group_store_name, group_color, car_id, car, date, group_date } = req.body;
    if (!group_store_name || String(group_store_name).trim() === '') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อกลุ่มสายจัดส่ง (group_store_name)' });
    }

    const color = group_color || '#3b82f6';
    const vehicleId = car_id || car || '';
    const targetDate = date || group_date || new Date().toISOString().slice(0, 10);

    let result;
    try {
      result = await query(
        'INSERT INTO group_store (group_store_name, group_color, car_id, date) VALUES (?, ?, ?, ?)',
        [String(group_store_name).trim(), color, vehicleId, targetDate]
      );
    } catch (e1) {
      console.error('Insert group_store error e1:', e1.message);
      try {
        result = await query(
          'INSERT INTO group_store (group_store_name, group_color, car_id) VALUES (?, ?, ?)',
          [String(group_store_name).trim(), color, vehicleId]
        );
      } catch (e2) {
        console.error('Insert group_store error e2:', e2.message);
        result = await query(
          'INSERT INTO group_store (group_store_name, group_color) VALUES (?, ?)',
          [String(group_store_name).trim(), color]
        );
      }
    }

    res.json({
      success: true,
      message: 'สร้างกลุ่มสายจัดส่งเรียบร้อยแล้ว',
      group_store_id: result.insertId,
      group_store_name: String(group_store_name).trim(),
      group_color: color,
      car_id: vehicleId,
      date: targetDate
    });
  } catch (err) {
    console.error('POST /groups error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/groups/:id
router.put('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { group_store_name, group_color, car_id, car, date, group_date } = req.body;
    if (!group_store_name || String(group_store_name).trim() === '') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อกลุ่มสายจัดส่ง' });
    }

    const color = group_color || '#3b82f6';
    const vehicleId = car_id || car || '';
    const targetDate = date || group_date || null;

    try {
      await query(
        'UPDATE group_store SET group_store_name = ?, group_color = ?, car_id = ?, date = ? WHERE group_store_id = ?',
        [String(group_store_name).trim(), color, vehicleId, targetDate, id]
      );
    } catch (e1) {
      try {
        await query(
          'UPDATE group_store SET group_store_name = ?, group_color = ?, car_id = ? WHERE group_store_id = ?',
          [String(group_store_name).trim(), color, vehicleId, id]
        );
      } catch (e2) {
        await query(
          'UPDATE group_store SET group_store_name = ?, group_color = ? WHERE group_store_id = ?',
          [String(group_store_name).trim(), color, id]
        );
      }
    }

    res.json({ success: true, message: 'แก้ไขกลุ่มสายจัดส่งเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/groups/:id
router.delete('/groups/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM group_store WHERE group_store_id = ?', [id]);
    res.json({ success: true, message: 'ลบกลุ่มสายจัดส่งเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 6. PARKING (ตาราง: parking)
// =========================================================

// GET /api/master/parking
router.get('/parking', authenticateToken, async (req, res) => {
  try {
    const parking = await query('SELECT parking_id, parking_name FROM parking ORDER BY parking_id DESC');
    res.json({ success: true, parking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/parking
router.post('/parking', authenticateToken, async (req, res) => {
  try {
    const { parking_name, name } = req.body;
    const pName = parking_name || name;
    if (!pName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อลาน/จุดจอดรถ' });
    }
    const result = await query('INSERT INTO parking (parking_name) VALUES (?)', [pName]);
    res.json({ success: true, message: 'เพิ่มข้อมูลลานจอดสำเร็จ', parking_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/parking/:id
router.put('/parking/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { parking_name, name } = req.body;
    const pName = parking_name || name;
    if (!pName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อลาน/จุดจอดรถ' });
    }
    await query('UPDATE parking SET parking_name = ? WHERE parking_id = ?', [pName, id]);
    res.json({ success: true, message: 'อัปเดตข้อมูลลานจอดเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/parking/:id
router.delete('/parking/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM parking WHERE parking_id = ?', [id]);
    res.json({ success: true, message: 'ลบข้อมูลลานจอดเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 7. ACCOUNTING STATUS (ตาราง: accounting_status)
// =========================================================

const ensureAccountingStatusTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS accounting_status (
      status_id INT AUTO_INCREMENT PRIMARY KEY,
      status_code VARCHAR(50) NULL,
      status_name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const countRes = await query('SELECT COUNT(*) AS total FROM accounting_status');
  if (countRes[0].total === 0) {
    await query(`
      INSERT INTO accounting_status (status_code, status_name, description, status) VALUES
      ('ACC_PENDING', 'รอตรวจสอบ', 'เอกสารรอเจ้าหน้าที่บัญชีตรวจสอบความถูกต้อง', 'active'),
      ('ACC_APPROVED', 'อนุมัติแล้ว', 'ผ่านการตรวจสอบความถูกต้องเรียบร้อยแล้ว', 'active'),
      ('ACC_REJECTED', 'ไม่อนุมัติ / มีข้อโต้แย้ง', 'พบข้อผิดพลาดหรือยอดเงินไม่ตรง ต้องแก้ไข', 'active'),
      ('ACC_BILLED', 'ตั้งบิลแล้ว', 'เปิดใบแจ้งหนี้ / ออกบิลเรียบร้อยแล้ว', 'active'),
      ('ACC_PAID', 'ชำระเงินแล้ว', 'ได้รับชำระเงินเรียบร้อยแล้ว', 'active')
    `);
  }
};

// GET /api/master/accounting-status
router.get('/accounting-status', authenticateToken, async (req, res) => {
  try {
    await ensureAccountingStatusTable();
    const statuses = await query('SELECT * FROM accounting_status ORDER BY status_id ASC');
    res.json({ success: true, statuses, accounting_statuses: statuses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/accounting-status
router.post('/accounting-status', authenticateToken, async (req, res) => {
  try {
    await ensureAccountingStatusTable();
    const { status_code, status_name, description, status } = req.body;
    if (!status_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อสถานะทางบัญชี' });
    }
    const code = status_code || `ACC-${Date.now().toString().slice(-4)}`;
    const result = await query(
      'INSERT INTO accounting_status (status_code, status_name, description, status) VALUES (?, ?, ?, ?)',
      [code, status_name, description || null, status || 'active']
    );
    res.json({ success: true, message: 'เพิ่มสถานะทางบัญชีสำเร็จ', status_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/accounting-status/:id
router.put('/accounting-status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_code, status_name, description, status } = req.body;
    if (!status_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อสถานะทางบัญชี' });
    }
    await query(
      'UPDATE accounting_status SET status_code = ?, status_name = ?, description = ?, status = ? WHERE status_id = ?',
      [status_code || null, status_name, description || null, status || 'active', id]
    );
    res.json({ success: true, message: 'อัปเดตสถานะทางบัญชีเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/accounting-status/:id
router.delete('/accounting-status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM accounting_status WHERE status_id = ?', [id]);
    res.json({ success: true, message: 'ลบสถานะทางบัญชีเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
