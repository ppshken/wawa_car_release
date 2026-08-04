const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { upload, saveBase64Image } = require('../middleware/upload');
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
    const { store_id, store_no, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location, open_time, close_time } = req.body;
    const targetStoreId = store_id || store_no;
    if (!targetStoreId || !store_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสร้านค้า (store_id) และชื่อร้านค้า' });
    }
    await query(
      `INSERT INTO store (store_id, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location, open_time, close_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetStoreId,
        store_name,
        store_address || null,
        telephone_number || null,
        fax_number || null,
        email || null,
        url || null,
        customer_delivery_time || null,
        store_location || null,
        open_time || '08:00',
        close_time || '17:00'
      ]
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
    const { store_id, store_no, store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location, open_time, close_time } = req.body;
    const targetStoreId = store_id || store_no || id;
    if (!targetStoreId || !store_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสร้านค้า (store_id) และชื่อร้านค้า' });
    }
    await query(
      `UPDATE store 
       SET store_id = ?, store_name = ?, store_address = ?, telephone_number = ?, fax_number = ?, email = ?, url = ?, customer_delivery_time = ?, store_location = ?, open_time = ?, close_time = ? 
       WHERE store_id = ?`,
      [
        targetStoreId,
        store_name,
        store_address || null,
        telephone_number || null,
        fax_number || null,
        email || null,
        url || null,
        customer_delivery_time || null,
        store_location || null,
        open_time || '08:00',
        close_time || '17:00',
        id
      ]
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
      const open_time = row['เวลาเปิด'] || row['เวลาเปิดทำการ'] || row['open_time'] || row['Open Time'] || row['OpenTime'] || '08:00';
      const close_time = row['เวลาปิด'] || row['เวลาปิดทำการ'] || row['close_time'] || row['Close Time'] || row['CloseTime'] || '17:00';

      const sql = `
        INSERT INTO store (store_id, store_name, store_address, telephone_number, fax_number, email, url, store_location, open_time, close_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          store_name = VALUES(store_name),
          store_address = VALUES(store_address),
          telephone_number = VALUES(telephone_number),
          fax_number = VALUES(fax_number),
          email = VALUES(email),
          url = VALUES(url),
          store_location = VALUES(store_location),
          open_time = VALUES(open_time),
          close_time = VALUES(close_time)
      `;

      const result = await query(sql, [
        store_id,
        store_name,
        store_address || null,
        telephone_number ? String(telephone_number) : null,
        fax_number ? String(fax_number) : null,
        email ? String(email) : null,
        url ? String(url) : null,
        store_location ? String(store_location) : null,
        open_time || '08:00',
        close_time || '17:00'
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
      'เวลาเปิดทำการ': s.open_time || '08:00',
      'เวลาปิดทำการ': s.close_time || '17:00',
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
    const keys = await query('SELECT key_holder_id, key_holder_name, created_at FROM key_holder ORDER BY key_holder_id DESC');
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
    const pdas = await query('SELECT * FROM pda_device ORDER BY pda_id ASC');
    res.json({ success: true, pdas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const payments = await query('SELECT payment_id, payment_name, created_at FROM payment ORDER BY payment_id DESC');
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
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10);
    
    // ดึงรถที่ถูกจัดสายแล้วในวันที่ระบุ
    const assignedRows = await query(
      `SELECT car_id FROM group_store WHERE (DATE_FORMAT(date, '%Y-%m-%d') = ? OR (date IS NULL AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?)) AND car_id IS NOT NULL AND car_id != ''`,
      [targetDate, targetDate]
    );
    const assignedCarIds = new Set((assignedRows || []).map((r) => String(r.car_id)));

    let vehicles = [];
    try {
      vehicles = await query('SELECT * FROM car ORDER BY car_id DESC');
    } catch (e1) {
      try {
        vehicles = await query('SELECT car_id AS vehicle_id, car_id, license_plate, brand, model, sub_model, year, quantity, gps FROM car WHERE active = "active" ORDER BY car_id DESC');
      } catch (e2) {
        vehicles = await query('SELECT * FROM car WHERE active = "active" ORDER BY car_id DESC');
      }
    }

    const formattedVehicles = (vehicles || []).map((v) => {
      const isAssigned = (v.car_id && assignedCarIds.has(String(v.car_id))) ||
                         (v.vehicle_id && assignedCarIds.has(String(v.vehicle_id))) ||
                         (v.license_plate && assignedCarIds.has(String(v.license_plate)));
      return {
        ...v,
        vehicle_id: v.vehicle_id || v.car_id,
        car_id: v.car_id || v.vehicle_id,
        quantity: parseInt(v.quantity || v.max_load || v.car_load || 100, 10),
        is_assigned_today: isAssigned
      };
    });

    res.json({ success: true, vehicles: formattedVehicles, assignedCarIds: Array.from(assignedCarIds) });
  } catch (err) {
    console.error('Fetch vehicles error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/vehicles
router.post('/vehicles', authenticateToken, async (req, res) => {
  try {
    const { car_id, car_code, license_plate, brand, model, sub_model, year, quantity, car_image, active, gps } = req.body;
    if (!license_plate) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกทะเบียนรถ' });
    }
    if (!car_image || String(car_image).trim() === '') {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดรูปรถ (จำเป็นต้องใส่รูปรถ)' });
    }

    const crypto = require('crypto');
    const finalCarId = (car_id && String(car_id).trim())
      ? String(car_id).trim()
      : crypto.randomUUID().toUpperCase();

    const qtyNum = quantity !== undefined ? parseInt(quantity, 10) : 100;
    const finalCarImage = (car_image && car_image.startsWith('data:image'))
      ? await saveBase64Image(car_image, 'vehicles')
      : car_image;

    try {
      await query(
        'INSERT INTO car (car_id, car_code, license_plate, brand, model, sub_model, year, quantity, car_image, active, gps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [finalCarId, car_code || null, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, qtyNum, finalCarImage || null, active || "active", gps || null]
      );
    } catch (dbErr) {
      try {
        await query(
          'INSERT INTO car (car_id, license_plate, brand, model, sub_model, year, quantity, car_image, active, gps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [finalCarId, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, qtyNum, finalCarImage || null, active || "active", gps || null]
        );
      } catch (e2) {
        await query(
          'INSERT INTO car (license_plate, brand, model, sub_model, year, quantity, car_image, active, gps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, qtyNum, finalCarImage || null, active || "active", gps || null]
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
    const { car_code, license_plate, brand, model, sub_model, year, quantity, car_image, active, gps } = req.body;
    if (!license_plate) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกทะเบียนรถ' });
    }
    if (!car_image || String(car_image).trim() === '') {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดรูปรถ (จำเป็นต้องใส่รูปรถ)' });
    }

    const qtyNum = quantity !== undefined ? parseInt(quantity, 10) : 100;
    const finalCarImage = (car_image && car_image.startsWith('data:image'))
      ? await saveBase64Image(car_image, 'vehicles')
      : car_image;

    try {
      await query(
        'UPDATE car SET car_code = ?, license_plate = ?, brand = ?, model = ?, sub_model = ?, year = ?, quantity = ?, car_image = ?, active = ?, gps = ? WHERE car_id = ?',
        [car_code || null, license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, qtyNum, finalCarImage || null, active || "active", gps || null, id]
      );
    } catch (dbErr) {
      await query(
        'UPDATE car SET license_plate = ?, brand = ?, model = ?, sub_model = ?, year = ?, quantity = ?, car_image = ?, active = ?, gps = ? WHERE car_id = ?',
        [license_plate, brand || null, model || null, sub_model || null, year ? parseInt(year, 10) : null, qtyNum, finalCarImage || null, active || "active", gps || null, id]
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

// GET /api/master/groups or /api/master/group-stores
router.get(['/groups', '/group-stores'], authenticateToken, async (req, res) => {
  try {
    let groups;
    try {
      groups = await query(`
        SELECT 
          gs.group_store_id, 
          gs.group_store_name, 
          gs.group_color, 
          gs.car_id, 
          gs.date, 
          gs.created_at,
          IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr WHERE cr.group_store_id = gs.group_store_id) > 0, 1, 0) AS status,
          IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr WHERE cr.group_store_id = gs.group_store_id) > 0, true, false) AS is_released
        FROM group_store gs 
        ORDER BY gs.group_store_id DESC
      `);
    } catch (e1) {
      groups = await query(`
        SELECT 
          gs.group_store_id, 
          gs.group_store_name, 
          gs.group_color, 
          gs.car_id, 
          gs.created_at,
          IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr WHERE cr.group_store_id = gs.group_store_id) > 0, 1, 0) AS status,
          IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr WHERE cr.group_store_id = gs.group_store_id) > 0, true, false) AS is_released
        FROM group_store gs 
        ORDER BY gs.group_store_id DESC
      `);
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
    const vehicleId = (car_id || car) ? String(car_id || car).trim() : null;
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
    const vehicleId = (car_id || car) ? String(car_id || car).trim() : null;
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

// GET /api/master/group-stores/:id/stores (ดึงรายการร้านค้าในสายจัดส่งตาม group_store_id)
router.get(['/groups/:id/stores', '/group-stores/:id/stores'], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await query(
      `SELECT ls.*, s.store_name, s.store_address, s.telephone_number, s.open_time, s.close_time
       FROM list_store ls
       LEFT JOIN store s ON ls.store_id = s.store_id
       WHERE ls.group_store_id = ?
       ORDER BY ls.row_order ASC, ls.list_id ASC`,
      [id]
    );
    res.json({ success: true, items, stores: items });
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
    const parking = await query('SELECT parking_id, parking_name, created_at FROM parking ORDER BY parking_id DESC');
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


// =========================================================
// 8. POSITION PRODUCT (ตาราง: position_product & list_store columns)
// =========================================================

const ensurePositionProductTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS position_product (
        position_product_id INT AUTO_INCREMENT PRIMARY KEY,
        position_product_name VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const countRes = await query('SELECT COUNT(*) AS total FROM position_product');
    if (countRes[0].total === 0) {
      await query(`
        INSERT INTO position_product (position_product_name) VALUES
        ('E'),
        ('A'),
        ('R'),
        ('B'),
        ('C')
      `);
    }

    const cols1 = await query("SHOW COLUMNS FROM list_store LIKE 'position_product_id'");
    if (cols1.length === 0) {
      await query("ALTER TABLE list_store ADD COLUMN position_product_id INT NULL AFTER store_name_result");
    }
    const cols2 = await query("SHOW COLUMNS FROM list_store LIKE 'position_production_order'");
    if (cols2.length === 0) {
      await query("ALTER TABLE list_store ADD COLUMN position_production_order INT NULL AFTER position_product_id");
    }
  } catch (err) {
    console.warn("ensurePositionProductTables warning:", err.message);
  }
};
ensurePositionProductTables();

// GET /api/master/position-product & /position-products
router.get('/position-product', authenticateToken, async (req, res) => {
  try {
    await ensurePositionProductTables();
    const positions = await query('SELECT * FROM position_product ORDER BY position_product_id ASC');
    res.json({ success: true, positions, items: positions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/position-products', authenticateToken, async (req, res) => {
  try {
    await ensurePositionProductTables();
    const positions = await query('SELECT * FROM position_product ORDER BY position_product_id ASC');
    res.json({ success: true, positions, items: positions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/position-product
router.post('/position-product', authenticateToken, async (req, res) => {
  try {
    await ensurePositionProductTables();
    const { position_product_name } = req.body;
    if (!position_product_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อตำแหน่งวางสินค้า' });
    }
    const result = await query(
      'INSERT INTO position_product (position_product_name) VALUES (?)',
      [position_product_name]
    );
    res.json({ success: true, message: 'เพิ่มตำแหน่งวางสินค้าสำเร็จ', position_product_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/position-product/:id
router.put('/position-product/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { position_product_name } = req.body;
    if (!position_product_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อตำแหน่งวางสินค้า' });
    }
    await query(
      'UPDATE position_product SET position_product_name = ? WHERE position_product_id = ?',
      [position_product_name, id]
    );
    res.json({ success: true, message: 'อัปเดตตำแหน่งวางสินค้าเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/position-product/:id
router.delete('/position-product/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM position_product WHERE position_product_id = ?', [id]);
    res.json({ success: true, message: 'ลบตำแหน่งวางสินค้าเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================
// 9. CAR RELEASE TYPES (ตาราง: car_release_type)
// =========================================================

// GET /api/master/car-release-types
router.get('/car-release-types', authenticateToken, async (req, res) => {
  try {
    const releaseTypes = await query('SELECT * FROM car_release_type ORDER BY car_release_type_id ASC');
    res.json({ success: true, releaseTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/car-release-types
router.post('/car-release-types', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    if (!type || !type.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการปล่อยรถ' });
    }
    const result = await query(
      'INSERT INTO car_release_type (type) VALUES (?)',
      [type.trim()]
    );
    res.json({ success: true, message: 'เพิ่มประเภทการปล่อยรถสำเร็จ', car_release_type_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/car-release-types/:id
router.put('/car-release-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    if (!type || !type.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการปล่อยรถ' });
    }
    await query(
      'UPDATE car_release_type SET type = ? WHERE car_release_type_id = ?',
      [type.trim(), id]
    );
    res.json({ success: true, message: 'อัปเดตประเภทการปล่อยรถเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/car-release-types/:id
router.delete('/car-release-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const used = await query('SELECT COUNT(*) as cnt FROM car_release WHERE car_release_type_id = ?', [id]);
    if (used[0]?.cnt > 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถลบได้ เนื่องจากมีใบปล่อยรถ ${used[0].cnt} ใบที่ใช้ประเภทนี้อยู่`
      });
    }
    await query('DELETE FROM car_release_type WHERE car_release_type_id = ?', [id]);
    res.json({ success: true, message: 'ลบประเภทการปล่อยรถเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================================================
// 10. LOADING TYPES (ตาราง: loading_type)
// =========================================================

async function initLoadingTypeTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS loading_type (
        loading_type_id INT AUTO_INCREMENT PRIMARY KEY,
        type_code VARCHAR(50) NOT NULL UNIQUE,
        type_name VARCHAR(100) NOT NULL,
        unit_name VARCHAR(50) DEFAULT 'ชิ้น',
        description VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS list_store_load (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT NOT NULL,
        loading_type_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default loading types if empty
    const countRows = await query('SELECT COUNT(*) AS total FROM loading_type');
    if (countRows && countRows[0].total === 0) {
      const defaults = [
        ['CRATE', 'ลัง', 'ลัง', 'ลังสินค้ามาตรฐานสำหรับจัดส่ง', 1],
        ['BASKET', 'กระบะ', 'ใบ', 'กระบะพลาสติกสำหรับสินค้าสด/แช่เย็น', 1],
        ['PALLET', 'พาเลท', 'พาเลท', 'แท่นวางสินค้าขนาดใหญ่/สินค้าหนัก', 1],
        ['BOX', 'กล่อง', 'กล่อง', 'กล่องพัสดุกระดาษลูกฟูกทั่วไป', 1]
      ];
      for (const item of defaults) {
        await query(
          'INSERT IGNORE INTO loading_type (type_code, type_name, unit_name, description, is_active) VALUES (?, ?, ?, ?, ?)',
          item
        );
      }
      console.log('✅ Default loading_types seeded into database table loading_type.');
    }
  } catch (err) {
    console.error('Error initializing loading_type tables:', err.message);
  }
}
initLoadingTypeTables();

// GET /api/master/loading-types
router.get('/loading-types', authenticateToken, async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let sql = 'SELECT * FROM loading_type';
    const params = [];
    if (activeOnly === 'true' || activeOnly === '1') {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY loading_type_id ASC';

    const loadingTypes = await query(sql, params);
    res.json({ success: true, loadingTypes: loadingTypes || [] });
  } catch (err) {
    console.error('GET /loading-types error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/loading-types
router.post('/loading-types', authenticateToken, async (req, res) => {
  try {
    const { type_code, type_name, unit_name, description, is_active } = req.body;
    if (!type_name || !type_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการโหลด' });
    }

    const code = (type_code && type_code.trim())
      ? type_code.trim().toUpperCase()
      : `LOAD-${Date.now().toString().slice(-4)}`;

    const result = await query(
      `INSERT INTO loading_type (type_code, type_name, unit_name, description, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        code,
        type_name.trim(),
        (unit_name && unit_name.trim()) || 'ชิ้น',
        (description && description.trim()) || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      ]
    );

    res.json({
      success: true,
      message: 'เพิ่มประเภทการโหลดสินค้าสำเร็จ!',
      loading_type_id: result.insertId
    });
  } catch (err) {
    console.error('POST /loading-types error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสประเภทการโหลดนี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/loading-types/:id
router.put('/loading-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type_code, type_name, unit_name, description, is_active } = req.body;

    if (!type_name || !type_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อประเภทการโหลด' });
    }

    await query(
      `UPDATE loading_type 
       SET type_code = ?, type_name = ?, unit_name = ?, description = ?, is_active = ?, updated_at = NOW()
       WHERE loading_type_id = ?`,
      [
        type_code ? type_code.trim().toUpperCase() : null,
        type_name.trim(),
        unit_name ? unit_name.trim() : 'ชิ้น',
        description ? description.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    res.json({ success: true, message: 'อัปเดตข้อมูลประเภทการโหลดเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('PUT /loading-types/:id error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสประเภทการโหลดนี้ซ้ำกับรายการอื่น' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/loading-types/:id
router.delete('/loading-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM loading_type WHERE loading_type_id = ?', [id]);
    res.json({ success: true, message: 'ลบประเภทการโหลดสินค้าเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('DELETE /loading-types/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================
// 11. GPS DISTANCE (ตาราง: gps_distance)
// =========================================================

async function initGpsDistanceTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS gps_distance (
        gps_distance_id INT AUTO_INCREMENT PRIMARY KEY,
        distance_code VARCHAR(50) NOT NULL UNIQUE,
        distance_name VARCHAR(100) NOT NULL,
        distance_meters INT NOT NULL DEFAULT 300,
        unit_name VARCHAR(20) DEFAULT 'เมตร',
        description VARCHAR(255) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default GPS distances if empty
    const countRows = await query('SELECT COUNT(*) AS total FROM gps_distance');
    if (countRows && countRows[0].total === 0) {
      const defaults = [
        ['CHECKOUT_MAX', 'ระยะห่างเช็คเอาท์นอกสถานที่ (Off-site Checkout)', 300, 'เมตร', 'ระยะทางสูงสุดระหว่างตำแหน่งเช็คเอาท์กับพิกัดร้านค้า หากเกินถือว่านอกสถานที่', 1],
        ['CHECKIN_RADIUS', 'รัศมีเช็คอินร้านค้า (Store Check-in Radius)', 100, 'เมตร', 'ระยะห่างที่ยอมรับได้สำหรับแจ้งเตือนเข้าถึงบริเวณร้านค้า', 1],
        ['ALERT_RADIUS', 'รัศมีแจ้งเตือนใกล้ถึงจุดหมาย (Destination Alert)', 500, 'เมตร', 'รัศมีตรวจจับตำแหน่ง GPS ก่อนเข้าถึงจุดส่งสินค้า', 1]
      ];
      for (const item of defaults) {
        await query(
          'INSERT IGNORE INTO gps_distance (distance_code, distance_name, distance_meters, unit_name, description, is_active) VALUES (?, ?, ?, ?, ?, ?)',
          item
        );
      }
      console.log('✅ Default gps_distance seeded into database table gps_distance.');
    }
  } catch (err) {
    console.error('Error initializing gps_distance table:', err.message);
  }
}
initGpsDistanceTables();

// GET /api/master/gps-distance or /api/master/gps-distances
router.get(['/gps-distance', '/gps-distances'], authenticateToken, async (req, res) => {
  try {
    const { activeOnly, search } = req.query;
    let sql = 'SELECT * FROM gps_distance';
    const params = [];
    const conditions = [];

    if (activeOnly === 'true' || activeOnly === '1') {
      conditions.push('is_active = 1');
    }
    if (search && search.trim() !== '') {
      const pattern = `%${search.trim()}%`;
      conditions.push('(distance_code LIKE ? OR distance_name LIKE ? OR description LIKE ?)');
      params.push(pattern, pattern, pattern);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY gps_distance_id ASC';

    const distances = await query(sql, params);
    res.json({ success: true, distances: distances || [] });
  } catch (err) {
    console.error('GET /gps-distance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/gps-distance
router.post(['/gps-distance', '/gps-distances'], authenticateToken, async (req, res) => {
  try {
    const { distance_code, distance_name, distance_meters, unit_name, description, is_active } = req.body;
    if (!distance_name || !distance_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเกณฑ์ระยะห่าง GPS' });
    }

    const code = (distance_code && distance_code.trim())
      ? distance_code.trim().toUpperCase()
      : `GPS-DIST-${Date.now().toString().slice(-4)}`;

    const meters = Number(distance_meters) >= 0 ? Number(distance_meters) : 300;

    const result = await query(
      `INSERT INTO gps_distance (distance_code, distance_name, distance_meters, unit_name, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        code,
        distance_name.trim(),
        meters,
        (unit_name && unit_name.trim()) || 'เมตร',
        (description && description.trim()) || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      ]
    );

    res.json({
      success: true,
      message: 'เพิ่มข้อมูลระยะห่าง GPS สำเร็จ!',
      gps_distance_id: result.insertId
    });
  } catch (err) {
    console.error('POST /gps-distance error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสเกณฑ์ระยะห่างนี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/gps-distance/:id
router.put(['/gps-distance/:id', '/gps-distances/:id'], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { distance_code, distance_name, distance_meters, unit_name, description, is_active } = req.body;

    if (!distance_name || !distance_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเกณฑ์ระยะห่าง GPS' });
    }

    const meters = Number(distance_meters) >= 0 ? Number(distance_meters) : 300;

    await query(
      `UPDATE gps_distance 
       SET distance_code = ?, distance_name = ?, distance_meters = ?, unit_name = ?, description = ?, is_active = ?, updated_at = NOW()
       WHERE gps_distance_id = ?`,
      [
        distance_code ? distance_code.trim().toUpperCase() : null,
        distance_name.trim(),
        meters,
        unit_name ? unit_name.trim() : 'เมตร',
        description ? description.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    res.json({ success: true, message: 'อัปเดตข้อมูลระยะห่าง GPS เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('PUT /gps-distance/:id error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสเกณฑ์ระยะห่างนี้ซ้ำกับรายการอื่น' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/gps-distance/:id
router.delete(['/gps-distance/:id', '/gps-distances/:id'], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM gps_distance WHERE gps_distance_id = ?', [id]);
    res.json({ success: true, message: 'ลบข้อมูลระยะห่าง GPS เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('DELETE /gps-distance/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Migration & Seed for menu_car_release
async function initMenuCarReleaseTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS menu_car_release (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_name VARCHAR(255) NOT NULL,
        action_key VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(100) DEFAULT 'FileText',
        access JSON,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const countRows = await query('SELECT COUNT(*) AS total FROM menu_car_release');
    if (countRows && countRows[0].total === 0) {
      const defaultAccess = JSON.stringify({ "1": true, "2": true, "3": true, "4": true });
      const defaults = [
        ['รีเซ็ตกุญแจ', 'reset_key', 'Key', defaultAccess, 'active'],
        ['รูปให้ของ', 'cargo_photo', 'Camera', defaultAccess, 'active'],
        ['สถานะบัญชี', 'accounting', 'ShieldCheck', defaultAccess, 'active'],
        ['เพิ่มร้านค้า', 'add_store', 'Plus', defaultAccess, 'active'],
        ['ติดตาม', 'followup', 'Truck', defaultAccess, 'active'],
        ['ฝากเงิน', 'deposit', 'Wallet', defaultAccess, 'active'],
        ['เอกสารคืนของ', 'return_docs', 'FileText', defaultAccess, 'active'],
        ['สินค้าควบคุม', 'controlled_items', 'PackageCheck', defaultAccess, 'active'],
        ['คืนรถ', 'car_return', 'RotateCcw', defaultAccess, 'active'],
        ['เบี้ยเลี้ยง', 'allowance', 'Coins', defaultAccess, 'active'],
      ];
      for (const item of defaults) {
        await query(
          'INSERT IGNORE INTO menu_car_release (menu_name, action_key, icon, access, status) VALUES (?, ?, ?, ?, ?)',
          item
        );
      }
      console.log('✅ Default operation menus seeded into menu_car_release.');
    }
  } catch (err) {
    console.error('Error initializing menu_car_release table:', err.message);
  }
}
initMenuCarReleaseTables();

// GET /api/master/operation-menus or /api/master/menu-car-release
router.get(['/operation-menus', '/menu-car-release'], authenticateToken, async (req, res) => {
  try {
    const menus = await query('SELECT * FROM menu_car_release ORDER BY id ASC');
    const formatted = (menus || []).map((m) => {
      let parsedAccess = {};
      if (typeof m.access === 'string') {
        try {
          parsedAccess = JSON.parse(m.access);
        } catch (e) {
          parsedAccess = {};
        }
      } else if (m.access && typeof m.access === 'object') {
        parsedAccess = m.access;
      }
      return {
        ...m,
        access: parsedAccess
      };
    });
    res.json({ success: true, menus: formatted, operationMenus: formatted });
  } catch (err) {
    console.error('GET /operation-menus error:', err);
    res.status(500).json({ success: false, message: err.message, menus: [], operationMenus: [] });
  }
});

// POST /api/master/operation-menus
router.post(['/operation-menus', '/menu-car-release'], authenticateToken, async (req, res) => {
  try {
    const { menu_name, action_key, icon, access, status } = req.body;

    if (!menu_name || !menu_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเมนู' });
    }

    const key = action_key && action_key.trim()
      ? action_key.trim().toLowerCase().replace(/\s+/g, '_')
      : `action_${Date.now()}`;

    const accessJson = typeof access === 'object' ? JSON.stringify(access) : (access || JSON.stringify({ "1": true, "2": true }));
    const menuStatus = status === 'inactive' || status === '0' || status === 0 ? 'inactive' : 'active';

    const result = await query(
      `INSERT INTO menu_car_release (menu_name, action_key, icon, access, status) VALUES (?, ?, ?, ?, ?)`,
      [menu_name.trim(), key, icon ? icon.trim() : 'FileText', accessJson, menuStatus]
    );

    res.json({
      success: true,
      message: 'เพิ่มเมนูการดำเนินงานสำเร็จ!',
      id: result.insertId
    });
  } catch (err) {
    console.error('POST /operation-menus error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสแอคชั่นนี้มีอยู่ในระบบแล้ว' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/operation-menus/:id
router.put(['/operation-menus/:id', '/menu-car-release/:id'], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_name, action_key, icon, access, status } = req.body;

    if (!menu_name || !menu_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อเมนู' });
    }

    const key = action_key && action_key.trim()
      ? action_key.trim().toLowerCase().replace(/\s+/g, '_')
      : `action_${Date.now()}`;

    const accessJson = typeof access === 'object' ? JSON.stringify(access) : (access || JSON.stringify({ "1": true, "2": true }));
    const menuStatus = status === 'inactive' || status === '0' || status === 0 ? 'inactive' : 'active';

    await query(
      `UPDATE menu_car_release 
       SET menu_name = ?, action_key = ?, icon = ?, access = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [menu_name.trim(), key, icon ? icon.trim() : 'FileText', accessJson, menuStatus, id]
    );

    res.json({ success: true, message: 'อัปเดตเมนูการดำเนินงานเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('PUT /operation-menus/:id error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'รหัสแอคชั่นนี้ซ้ำกับรายการอื่น' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/operation-menus/:id
router.delete(['/operation-menus/:id', '/menu-car-release/:id'], authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM menu_car_release WHERE id = ?', [id]);
    res.json({ success: true, message: 'ลบเมนูการดำเนินงานเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('DELETE /operation-menus/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================================================
// 13. PROBLEM TYPES (ตาราง: problem_type)
// =========================================================

(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS problem_type (
        problem_type_id INT AUTO_INCREMENT PRIMARY KEY,
        problem_type_name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const defaults = [
      { name: "ร้านปิด", desc: "ร้านค้าปิดทำการในเวลาที่ไปส่ง" },
      { name: "บิลผิด", desc: "เอกสารใบกำกับสินค้า/บิลไม่ถูกต้อง" },
      { name: "ของไม่ครบ / สินค้าเสียหาย", desc: "จำนวนสินค้าขาด หรือสินค้าชำรุดระหว่างขนส่ง" },
      { name: "ลูกค้าปฏิเสธการรับสินค้า", desc: "ลูกค้าไม่ยินยอมรับสินค้าตามออเดอร์" },
      { name: "ติดต่อลูกค้าไม่ได้", desc: "ไม่สามารถโทรติดต่อผู้รับสินค้าได้" },
      { name: "+ ระบุปัญหาอื่นๆ (พิมพ์เอง)", desc: "ปัญหานอกเหนือจากหมวดหมู่มาตรฐาน" },
    ];

    for (const d of defaults) {
      const exist = await query("SELECT problem_type_id FROM problem_type WHERE problem_type_name = ?", [d.name]);
      if (exist.length === 0) {
        await query("INSERT INTO problem_type (problem_type_name, description, status) VALUES (?, ?, 'active')", [d.name, d.desc]);
      }
    }
  } catch (err) {
    console.error("Error creating/seeding problem_type table:", err);
  }
})();

// GET /api/master/problem-types
router.get('/problem-types', authenticateToken, async (req, res) => {
  try {
    const problemTypes = await query('SELECT * FROM problem_type ORDER BY problem_type_id ASC');
    res.json({ success: true, problemTypes });
  } catch (err) {
    console.error('GET /problem-types error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/master/problem-types
router.post('/problem-types', authenticateToken, async (req, res) => {
  try {
    const { problem_type_name, description, status } = req.body;
    if (!problem_type_name || !problem_type_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อประเภทปัญหา' });
    }

    const typeStatus = status === 'inactive' || status === '0' || status === 0 ? 'inactive' : 'active';

    const result = await query(
      'INSERT INTO problem_type (problem_type_name, description, status) VALUES (?, ?, ?)',
      [problem_type_name.trim(), description ? description.trim() : null, typeStatus]
    );

    res.json({
      success: true,
      message: 'สร้างประเภทปัญหาใหม่สำเร็จ',
      problem_type_id: result.insertId
    });
  } catch (err) {
    console.error('POST /problem-types error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/master/problem-types/:id
router.put('/problem-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { problem_type_name, description, status } = req.body;

    if (!problem_type_name || !problem_type_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อประเภทปัญหา' });
    }

    const typeStatus = status === 'inactive' || status === '0' || status === 0 ? 'inactive' : 'active';

    await query(
      'UPDATE problem_type SET problem_type_name = ?, description = ?, status = ?, updated_at = NOW() WHERE problem_type_id = ?',
      [problem_type_name.trim(), description ? description.trim() : null, typeStatus, id]
    );

    res.json({ success: true, message: 'อัปเดตประเภทปัญหาสำเร็จ' });
  } catch (err) {
    console.error('PUT /problem-types/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/master/problem-types/:id
router.delete('/problem-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM problem_type WHERE problem_type_id = ?', [id]);
    res.json({ success: true, message: 'ลบประเภทปัญหาสำเร็จ' });
  } catch (err) {
    console.error('DELETE /problem-types/:id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


