const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { saveBase64Image } = require('../middleware/upload');

// POST /api/car-release (สร้างใบปล่อยรถ)
router.post('/car-release', authenticateToken, async (req, res) => {
  try {
    const {
      car_id,
      car_release_type_id,
      user_id, // driver
      group_store_id,
      mileage,
      pda_device,
      description,
      followers = [], // Array of string names
      stores = [], // Array of { store_id, sum_quantity, row_order, bypass }
      // Images (Base64 or URLs)
      image_mileage,
      image_front,
      image_around_1,
      image_around_2,
      image_around_3,
      image_around_4,
      image_around_5,
      image_pda
    } = req.body;

    if (!car_id || !user_id) {
      return res.status(400).json({ success: false, message: 'car_id and user_id (driver) are required' });
    }

    // Generate unique release number
    const releaseNo = 'CR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const imgMileageUrl = saveBase64Image(image_mileage);
    const imgFrontUrl = saveBase64Image(image_front);
    const imgAround1Url = saveBase64Image(image_around_1);
    const imgAround2Url = saveBase64Image(image_around_2);
    const imgAround3Url = saveBase64Image(image_around_3);
    const imgAround4Url = saveBase64Image(image_around_4);
    const imgAround5Url = saveBase64Image(image_around_5);
    const imgPdaUrl = saveBase64Image(image_pda);

    const result = await query(
      `INSERT INTO car_release 
       (car_release_no, car_id, car_release_type_id, user_id, group_store_id, mileage, 
        image_mileage, image_front, image_around_1, image_around_2, image_around_3, image_around_4, image_around_5, 
        image_pda, pda_device, description, accounting_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        releaseNo,
        car_id,
        car_release_type_id || null,
        user_id,
        group_store_id || null,
        mileage || 0,
        imgMileageUrl,
        imgFrontUrl,
        imgAround1Url,
        imgAround2Url,
        imgAround3Url,
        imgAround4Url,
        imgAround5Url,
        imgPdaUrl,
        pda_device || '',
        description || '',
        'รอการตรวจสอบ'
      ]
    );

    const car_release_id = result.insertId;

    // Insert Followers
    if (Array.isArray(followers) && followers.length > 0) {
      for (const followerName of followers) {
        if (followerName && followerName.trim()) {
          await query(
            `INSERT INTO car_release_follower (car_release_id, follower_name) VALUES (?, ?)`,
            [car_release_id, followerName.trim()]
          );
        }
      }
    }

    // Insert List Store
    if (Array.isArray(stores) && stores.length > 0) {
      for (let i = 0; i < stores.length; i++) {
        const item = stores[i];
        // Fetch store location snapshot
        const storeRows = await query(`SELECT store_name, store_location FROM store WHERE store_id = ?`, [item.store_id]);
        const storeName = storeRows.length > 0 ? storeRows[0].store_name : '';
        const storeLoc = storeRows.length > 0 ? storeRows[0].store_location : '';

        await query(
          `INSERT INTO list_store 
           (car_release_id, store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, bypass, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            car_release_id,
            item.store_id,
            group_store_id || null,
            item.row_order || (i + 1),
            item.sum_quantity || 0,
            storeLoc,
            storeName,
            item.bypass ? 1 : 0,
            req.user.user_id
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'สร้างใบปล่อยรถสำเร็จ',
      car_release_id,
      car_release_no: releaseNo
    });
  } catch (err) {
    console.error('Error creating car release:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/car-release (ดึงรายการใบปล่อยรถทั้งหมด)
router.get('/car-release', authenticateToken, async (req, res) => {
  try {
    const { status, driver_id, date } = req.query;
    let sql = `
      SELECT cr.*, 
             c.license_plate, c.brand, c.model,
             u.name as driver_name,
             crt.type as car_release_type_name,
             gs.group_store_name,
             (SELECT COUNT(*) FROM list_store ls WHERE ls.car_release_id = cr.car_release_id) as total_stores,
             (SELECT COUNT(*) FROM list_store ls JOIN check_out co ON ls.list_id = co.list_id WHERE ls.car_release_id = cr.car_release_id) as completed_stores,
             (SELECT COUNT(*) FROM car_return crt WHERE crt.car_release_id = cr.car_release_id) > 0 as is_returned
      FROM car_release cr
      LEFT JOIN car c ON cr.car_id = c.car_id
      LEFT JOIN user u ON cr.user_id = u.user_id
      LEFT JOIN car_release_type crt ON cr.car_release_type_id = crt.car_release_type_id
      LEFT JOIN group_store gs ON cr.group_store_id = gs.group_store_id
      WHERE 1=1
    `;

    const params = [];
    if (driver_id) {
      sql += ` AND cr.user_id = ?`;
      params.push(driver_id);
    }
    if (date) {
      sql += ` AND DATE(cr.created_at) = ?`;
      params.push(date);
    }

    sql += ` ORDER BY cr.car_release_id DESC`;

    const releases = await query(sql, params);
    res.json({ success: true, releases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/car-release/:id (ดึงรายละเอียดใบปล่อยรถ)
router.get('/car-release/:id', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;

    const releases = await query(
      `SELECT cr.*, 
              c.license_plate, c.brand, c.model, c.sub_model, c.year,
              u.name as driver_name, u.phone_number_1 as driver_phone,
              crt.type as car_release_type_name,
              gs.group_store_name, gs.group_color
       FROM car_release cr
       LEFT JOIN car c ON cr.car_id = c.car_id
       LEFT JOIN user u ON cr.user_id = u.user_id
       LEFT JOIN car_release_type crt ON cr.car_release_type_id = crt.car_release_type_id
       LEFT JOIN group_store gs ON cr.group_store_id = gs.group_store_id
       WHERE cr.car_release_id = ?`,
      [car_release_id]
    );

    if (releases.length === 0) {
      return res.status(404).json({ success: false, message: 'Car release record not found' });
    }

    const release = releases[0];

    // Fetch Followers
    const followers = await query(
      `SELECT * FROM car_release_follower WHERE car_release_id = ? ORDER BY follower_id ASC`,
      [car_release_id]
    );

    // Fetch List Stores + CheckIn + CheckOut + Problem
    const stores = await query(
      `SELECT ls.*, 
              s.store_name, s.store_address, s.telephone_number, s.customer_delivery_time, s.store_location,
              ci.check_in_id, ci.image_check_in, ci.date_time_check_in, ci.signature, ci.location as check_in_location,
              co.check_out_id, co.payment_id, co.image_bill, co.date_time_check_out, co.cash, co.transfer, 
              co.transfer_according, co.off_site as check_out_off_site, co.paid, co.amount, co.visit_customer, 
              co.visit_type_id, vt.visit_type_name, co.visit_note,
              p.payment_name,
              prob.problem_id, prob.problem_name, prob.normal_bill, prob.edit_bill, prob.product_swap, prob.out_of_stock, prob.overstock
       FROM list_store ls
       LEFT JOIN store s ON ls.store_id = s.store_id
       LEFT JOIN check_in ci ON ls.list_id = ci.list_id
       LEFT JOIN check_out co ON ls.list_id = co.list_id
       LEFT JOIN visit_type vt ON co.visit_type_id = vt.visit_type_id
       LEFT JOIN payment p ON co.payment_id = p.payment_id
       LEFT JOIN problem prob ON ls.list_id = prob.list_id
       WHERE ls.car_release_id = ?
       ORDER BY ls.row_order ASC`,
      [car_release_id]
    );

    // Fetch Car Return details if exists
    const returns = await query(
      `SELECT crt.*, kh.key_holder_name, pk.parking_name 
       FROM car_return crt
       LEFT JOIN key_holder kh ON crt.key_holder_id = kh.key_holder_id
       LEFT JOIN parking pk ON crt.parking_id = pk.parking_id
       WHERE crt.car_release_id = ?`,
      [car_release_id]
    );

    release.followers = followers;
    release.stores = stores;
    release.car_return = returns.length > 0 ? returns[0] : null;

    res.json({ success: true, release });
  } catch (err) {
    console.error('Fetch release detail error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/car-release/:id/return (บันทึกการคืนรถ)
router.post('/car-release/:id/return', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const {
      key_holder_id,
      parking_id,
      mileage,
      gas_bill,
      note,
      image_mileage,
      image_front,
      image_around_1,
      image_around_2,
      image_around_3,
      image_around_4,
      image_return,
      image_pda
    } = req.body;

    const imgMileageUrl = saveBase64Image(image_mileage);
    const imgFrontUrl = saveBase64Image(image_front);
    const imgAround1Url = saveBase64Image(image_around_1);
    const imgAround2Url = saveBase64Image(image_around_2);
    const imgAround3Url = saveBase64Image(image_around_3);
    const imgAround4Url = saveBase64Image(image_around_4);
    const imgReturnUrl = saveBase64Image(image_return);
    const imgPdaUrl = saveBase64Image(image_pda);

    const result = await query(
      `INSERT INTO car_return 
       (car_release_id, key_holder_id, parking_id, mileage, image_mileage, image_front, 
        image_around_1, image_around_2, image_around_3, image_around_4, image_return, image_pda, gas_bill, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car_release_id,
        key_holder_id || null,
        parking_id || null,
        mileage || 0,
        imgMileageUrl,
        imgFrontUrl,
        imgAround1Url,
        imgAround2Url,
        imgAround3Url,
        imgAround4Url,
        imgReturnUrl,
        imgPdaUrl,
        gas_bill || 0,
        note || ''
      ]
    );

    res.json({
      success: true,
      message: 'บันทึกใบคืนรถสำเร็จ',
      car_return_id: result.insertId
    });
  } catch (err) {
    console.error('Car return error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/car-release/:id/accounting (อัปเดตสถานะการตรวจสอบบัญชี)
router.patch('/car-release/:id/accounting', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const { accounting_status, accounting_note } = req.body;

    await query(
      `UPDATE car_release SET accounting_status = ?, accounting_note = ? WHERE car_release_id = ?`,
      [accounting_status, accounting_note || '', car_release_id]
    );

    res.json({ success: true, message: 'อัปเดตสถานะบัญชีเรียบร้อยแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
