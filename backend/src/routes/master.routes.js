const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ---------------- Cars ----------------
router.get('/cars', authenticateToken, async (req, res) => {
  try {
    const cars = await query('SELECT * FROM car ORDER BY car_id DESC');
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/cars', authenticateToken, async (req, res) => {
  try {
    const { license_plate, brand, model, sub_model, year } = req.body;
    const result = await query(
      'INSERT INTO car (license_plate, brand, model, sub_model, year) VALUES (?, ?, ?, ?, ?)',
      [license_plate, brand, model, sub_model, year || null]
    );
    res.json({ success: true, message: 'Car added', car_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Stores ----------------
router.get('/stores', authenticateToken, async (req, res) => {
  try {
    const stores = await query('SELECT * FROM store ORDER BY store_id DESC');
    res.json({ success: true, stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/stores', authenticateToken, async (req, res) => {
  try {
    const { store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location } = req.body;
    const result = await query(
      `INSERT INTO store (store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time, store_location) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [store_name, store_address, telephone_number, fax_number, email, url, customer_delivery_time || null, store_location]
    );
    res.json({ success: true, message: 'Store added', store_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/stores/import (Excel/CSV upload)
router.post('/stores/import', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel or CSV file required' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let count = 0;
    for (const row of sheetData) {
      const store_name = row['ชื่อร้านค้า'] || row['store_name'] || row['Store Name'];
      if (!store_name) continue;

      const store_address = row['ที่อยู่'] || row['store_address'] || row['Address'] || '';
      const telephone_number = row['เบอร์โทรศัพท์'] || row['telephone_number'] || row['Phone'] || '';
      const store_location = row['พิกัด'] || row['lat_long'] || row['store_location'] || row['Location'] || '';

      await query(
        `INSERT INTO store (store_name, store_address, telephone_number, store_location) VALUES (?, ?, ?, ?)`,
        [store_name, store_address, String(telephone_number), store_location]
      );
      count++;
    }

    res.json({ success: true, message: `Successfully imported ${count} stores` });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Group Stores ----------------
router.get('/group-stores', authenticateToken, async (req, res) => {
  try {
    const groups = await query('SELECT * FROM group_store ORDER BY group_store_id ASC');
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/group-stores', authenticateToken, async (req, res) => {
  try {
    const { group_store_name, group_color } = req.body;
    const result = await query(
      'INSERT INTO group_store (group_store_name, group_color) VALUES (?, ?)',
      [group_store_name, group_color || '#3b82f6']
    );
    res.json({ success: true, message: 'Group store added', group_store_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Visit Types ----------------
router.get('/visit-types', authenticateToken, async (req, res) => {
  try {
    const visitTypes = await query('SELECT * FROM visit_type ORDER BY visit_type_id ASC');
    res.json({ success: true, visitTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Key Holders ----------------
router.get('/key-holders', authenticateToken, async (req, res) => {
  try {
    const keyHolders = await query('SELECT * FROM key_holder ORDER BY key_holder_id ASC');
    res.json({ success: true, keyHolders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Parking Locations ----------------
router.get('/parkings', authenticateToken, async (req, res) => {
  try {
    const parkings = await query('SELECT * FROM parking ORDER BY parking_id ASC');
    res.json({ success: true, parkings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Payments ----------------
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await query('SELECT * FROM payment ORDER BY payment_id ASC');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- Car Release Types ----------------
router.get('/car-release-types', authenticateToken, async (req, res) => {
  try {
    const releaseTypes = await query('SELECT * FROM car_release_type ORDER BY car_release_type_id ASC');
    res.json({ success: true, releaseTypes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
