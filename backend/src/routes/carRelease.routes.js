const express = require('express');
const router = express.Router();
const { query, hasColumn } = require('../config/db');
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
      image_pda,
      accounting_status
    } = req.body;

    if (!car_id || !user_id) {
      return res.status(400).json({ success: false, message: 'car_id and user_id (driver) are required' });
    }

    // Generate unique release number in format TMS-2026726-0004
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dateStr = `${year}${month}${day}`;

    const countRows = await query(`SELECT COUNT(*) AS count FROM car_release WHERE DATE(created_at) = CURDATE()`);
    const seqNum = String((countRows[0]?.count || 0) + 1).padStart(4, '0');
    const releaseNo = `TMS-${dateStr}-${seqNum}`;
    const imgPath = `car_release/${releaseNo}`;

    const imgMileageUrl = saveBase64Image(image_mileage, imgPath);
    const imgFrontUrl = saveBase64Image(image_front, imgPath);
    const imgAround1Url = saveBase64Image(image_around_1, imgPath);
    const imgAround2Url = saveBase64Image(image_around_2, imgPath);
    const imgAround3Url = saveBase64Image(image_around_3, imgPath);
    const imgAround4Url = saveBase64Image(image_around_4, imgPath);
    const imgAround5Url = saveBase64Image(image_around_5, imgPath);
    const imgPdaUrl = saveBase64Image(image_pda, imgPath);

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
        accounting_status
      ]
    );

    const car_release_id = result.insertId;

    // Update Group Store status to 1
    await query(`UPDATE group_store SET status = 1 WHERE group_store_id = ?`, [group_store_id]);

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

// GET /api/car-release (ดึงรายการใบปล่อยรถทั้งหมด รองรับ Pagination & Filter ตามวันที่ & ค้นหา)
router.get('/car-release', authenticateToken, async (req, res) => {
  try {
    const { status, driver_id, date, page, limit, search } = req.query;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (driver_id) {
      whereClause += ` AND cr.user_id = ?`;
      params.push(driver_id);
    }
    if (date && date.trim()) {
      whereClause += ` AND DATE(cr.created_at) = ?`;
      params.push(date.trim());
    }
    if (search && search.trim()) {
      const p = `%${search.trim()}%`;
      whereClause += ` AND (cr.car_release_no LIKE ? OR c.license_plate LIKE ? OR u.name LIKE ? OR gs.group_store_name LIKE ?)`;
      params.push(p, p, p, p);
    }

    const baseSql = `
      FROM car_release cr
      LEFT JOIN car c ON cr.car_id = c.car_id
      LEFT JOIN user u ON cr.user_id = u.user_id
      LEFT JOIN car_release_type crt ON cr.car_release_type_id = crt.car_release_type_id
      LEFT JOIN group_store gs ON cr.group_store_id = gs.group_store_id
      LEFT JOIN accounting_status acc ON (cr.accounting_status = acc.status_id OR cr.accounting_status = acc.status_name OR cr.accounting_status = acc.status_code)
      ${whereClause}
    `;

    // Calculate count
    const countRes = await query(`SELECT COUNT(*) as total ${baseSql}`, params);
    const total = countRes[0]?.total || 0;

    let paginationObj = null;
    let dataSql = `
      SELECT cr.*, 
             c.license_plate, c.brand, c.model, c.sub_model, c.car_image,
             u.name as driver_name, u.phone_number_1 as driver_phone, u.user_image,
             crt.type as car_release_type_name,
             gs.group_store_name, gs.group_color,
             acc.status_name as accounting_status_name, acc.status_id as accounting_status_id,
             (SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id) as total_stores,
             (SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id AND ls.status = 'completed' OR ls.status = 'problem') as completed_stores,
             (SELECT COUNT(*) FROM car_return crt WHERE crt.car_release_id = cr.car_release_id) > 0 as is_returned
      ${baseSql}
      ORDER BY cr.car_release_id DESC
    `;

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * limitNum;
      dataSql += ` LIMIT ${limitNum} OFFSET ${offset}`;
      paginationObj = {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    const releases = await query(dataSql, params);

    // Fetch followers for each release
    for (const rel of releases) {
      const followers = await query(
        `SELECT follower_name FROM car_release_follower WHERE car_release_id = ?`,
        [rel.car_release_id]
      );
      rel.followers = followers;
      rel.follower_name = followers.length > 0 ? followers.map(f => f.follower_name).join(', ') : '-';
    }

    res.json({
      success: true,
      releases,
      total,
      pagination: paginationObj
    });
  } catch (err) {
    console.error('Fetch releases error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/car-release/:id (ดึงรายละเอียดใบปล่อยรถ)
router.get('/car-release/:id', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;

    const releases = await query(
      `SELECT cr.*, 
              c.license_plate, c.brand, c.model, c.sub_model, c.year, c.car_image,
              u.name as driver_name, u.phone_number_1 as driver_phone, u.user_image,
              crt.type as car_release_type_name,
              gs.group_store_name, gs.group_color,
              acc.status_name as accounting_status_name, acc.status_id as accounting_status_id
       FROM car_release cr
       LEFT JOIN car c ON cr.car_id = c.car_id
       LEFT JOIN user u ON cr.user_id = u.user_id
       LEFT JOIN car_release_type crt ON cr.car_release_type_id = crt.car_release_type_id
       LEFT JOIN group_store gs ON cr.group_store_id = gs.group_store_id
       LEFT JOIN accounting_status acc ON (cr.accounting_status = acc.status_id OR cr.accounting_status = acc.status_name OR cr.accounting_status = acc.status_code)
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
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const storeWhere = hasCarReleaseId
      ? `WHERE ls.group_store_id = (SELECT group_store_id FROM car_release WHERE car_release_id = ?) OR ls.car_release_id = ?`
      : `WHERE ls.group_store_id = (SELECT group_store_id FROM car_release WHERE car_release_id = ?)`;
    const storeParams = hasCarReleaseId ? [car_release_id, car_release_id] : [car_release_id];

    const stores = await query(
      `SELECT ls.*, 
              pp.position_product_name,
              s.store_name, s.store_address, s.telephone_number, s.customer_delivery_time, s.store_location,
              ci.check_in_id, ci.image_check_in, ci.date_time_check_in, ci.signature, ci.location as check_in_location,
              co.check_out_id, co.payment_id, co.image_bill, co.date_time_check_out, co.cash, co.transfer, 
              co.transfer_according, co.off_site as check_out_off_site, co.paid, co.amount, co.visit_customer, 
              co.visit_type_id, vt.visit_type_name, co.visit_note,
              p.payment_name,
              prob.problem_id, prob.problem_name, prob.normal_bill, prob.edit_bill, prob.product_swap, prob.out_of_stock, prob.overstock
       FROM list_store ls
       LEFT JOIN store s ON ls.store_id = s.store_id
       LEFT JOIN position_product pp ON ls.position_product_id = pp.position_product_id
       LEFT JOIN check_in ci ON ls.list_id = ci.list_id
       LEFT JOIN check_out co ON ls.list_id = co.list_id
       LEFT JOIN visit_type vt ON co.visit_type_id = vt.visit_type_id
       LEFT JOIN payment p ON co.payment_id = p.payment_id
       LEFT JOIN problem prob ON ls.list_id = prob.list_id
       ${storeWhere}
       ORDER BY ls.row_order ASC`,
      storeParams
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

// PUT /api/car-release/:id (แก้ไขข้อมูลใบปล่อยรถ)
router.put('/car-release/:id', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const {
      car_id,
      car_release_type_id,
      user_id,
      group_store_id,
      mileage,
      pda_device,
      description,
      accounting_status,
      followers = [],
      image_mileage,
      image_front,
      image_around_1,
      image_around_2,
      image_around_3,
      image_around_4,
      image_around_5,
      image_pda
    } = req.body;

    const imgMileageUrl = image_mileage ? saveBase64Image(image_mileage) : undefined;
    const imgFrontUrl = image_front ? saveBase64Image(image_front) : undefined;
    const imgAround1Url = image_around_1 ? saveBase64Image(image_around_1) : undefined;
    const imgAround2Url = image_around_2 ? saveBase64Image(image_around_2) : undefined;
    const imgAround3Url = image_around_3 ? saveBase64Image(image_around_3) : undefined;
    const imgAround4Url = image_around_4 ? saveBase64Image(image_around_4) : undefined;
    const imgAround5Url = image_around_5 ? saveBase64Image(image_around_5) : undefined;
    const imgPdaUrl = image_pda ? saveBase64Image(image_pda) : undefined;

    await query(
      `UPDATE car_release 
       SET car_id = COALESCE(?, car_id),
           car_release_type_id = COALESCE(?, car_release_type_id),
           user_id = COALESCE(?, user_id),
           group_store_id = COALESCE(?, group_store_id),
           mileage = COALESCE(?, mileage),
           pda_device = COALESCE(?, pda_device),
           description = COALESCE(?, description),
           accounting_status = COALESCE(?, accounting_status),
           image_mileage = COALESCE(?, image_mileage),
           image_front = COALESCE(?, image_front),
           image_around_1 = COALESCE(?, image_around_1),
           image_around_2 = COALESCE(?, image_around_2),
           image_around_3 = COALESCE(?, image_around_3),
           image_around_4 = COALESCE(?, image_around_4),
           image_around_5 = COALESCE(?, image_around_5),
           image_pda = COALESCE(?, image_pda)
       WHERE car_release_id = ?`,
      [
        car_id || null,
        car_release_type_id || null,
        user_id || null,
        group_store_id || null,
        mileage || 0,
        pda_device || '',
        description || '',
        accounting_status || 'รอการตรวจสอบ',
        imgMileageUrl || null,
        imgFrontUrl || null,
        imgAround1Url || null,
        imgAround2Url || null,
        imgAround3Url || null,
        imgAround4Url || null,
        imgAround5Url || null,
        imgPdaUrl || null,
        car_release_id
      ]
    );

    // Update Followers if provided
    if (Array.isArray(followers)) {
      await query(`DELETE FROM car_release_follower WHERE car_release_id = ?`, [car_release_id]);
      for (const followerName of followers) {
        if (followerName && String(followerName).trim()) {
          await query(
            `INSERT INTO car_release_follower (car_release_id, follower_name) VALUES (?, ?)`,
            [car_release_id, String(followerName).trim()]
          );
        }
      }
    }

    res.json({ success: true, message: 'อัปเดตข้อมูลใบปล่อยรถเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error updating car release:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/car-release/:id (ลบใบปล่อยรถ)
router.delete('/car-release/:id', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;

    // Delete related records in car_release_follower, car_return
    await query(`DELETE FROM car_release_follower WHERE car_release_id = ?`, [car_release_id]);
    await query(`DELETE FROM car_return WHERE car_release_id = ?`, [car_release_id]);

    // Unlink or clean list_store
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    if (hasCarReleaseId) {
      await query(`UPDATE list_store SET car_release_id = NULL WHERE car_release_id = ?`, [car_release_id]);
    }

    // Delete main car_release record
    await query(`DELETE FROM car_release WHERE car_release_id = ?`, [car_release_id]);

    res.json({ success: true, message: 'ลบข้อมูลใบปล่อยรถเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error deleting car release:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
