const express = require('express');
const router = express.Router();
const { query, hasColumn } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { saveBase64Image } = require('../middleware/upload');

// Helper Haversine formula to calculate distance in meters between 2 lat,long points
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// POST /api/list-store/:id/check-in
router.post('/list-store/:id/check-in', authenticateToken, async (req, res) => {
  try {
    const list_id = req.params.id;
    const { image_check_in, signature, location } = req.body;

    const imgCheckInUrl = saveBase64Image(image_check_in);
    const signatureUrl = saveBase64Image(signature);
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await query(
      `INSERT INTO check_in (list_id, image_check_in, date_time_check_in, signature, location) 
       VALUES (?, ?, ?, ?, ?)`,
      [list_id, imgCheckInUrl, dateTime, signatureUrl, location || '']
    );

    // Update list_store status & start_service_time (เวลาเริ่มบริการ = เวลาเช็คอิน)
    try {
      await query(
        `UPDATE list_store SET status = 'in_progress', start_service_time = ? WHERE list_id = ?`,
        [dateTime, list_id]
      );
    } catch (eUp) {
      await query(`UPDATE list_store SET status = 'in_progress' WHERE list_id = ?`, [list_id]);
    }

    res.json({
      success: true,
      message: 'เช็คอินสำเร็จ',
      check_in_id: result.insertId
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/list-store/:id/check-out
router.post('/list-store/:id/check-out', authenticateToken, async (req, res) => {
  try {
    const list_id = req.params.id;
    const {
      payment_id,
      image_bill,
      cash = 0,
      transfer = 0,
      transfer_according = 0, // 1 = โอนตามทีหลัง (ค้างชำระ)
      visit_customer = 1,
      visit_type_id = 4, // default 4 = ส่งของ
      visit_note = '',
      current_location = '', // "lat,long"
      additional_images = [] // Array of base64/urls
    } = req.body;

    const targetVisitTypeId = visit_type_id || 4;

    // 1. Fetch target store location to calculate off_site flag
    const listRows = await query(
      `SELECT ls.*, s.store_location 
       FROM list_store ls 
       JOIN store s ON ls.store_id = s.store_id 
       WHERE ls.list_id = ?`,
      [list_id]
    );

    let isOffSite = 0;
    if (listRows.length > 0 && listRows[0].store_location && current_location) {
      const [sLat, sLon] = listRows[0].store_location.split(',').map(Number);
      const [cLat, cLon] = current_location.split(',').map(Number);

      if (sLat && sLon && cLat && cLon) {
        const dist = getDistanceMeters(sLat, sLon, cLat, cLon);
        let maxDistanceMeters = 300;
        try {
          const gpsCfg = await query("SELECT distance_meters FROM gps_distance WHERE distance_code = 'CHECKOUT_MAX' AND is_active = 1 LIMIT 1");
          if (gpsCfg && gpsCfg.length > 0 && gpsCfg[0].distance_meters !== undefined) {
            maxDistanceMeters = Number(gpsCfg[0].distance_meters);
          }
        } catch (e) {}

        if (dist > maxDistanceMeters) {
          isOffSite = 1; // off_site if distance exceeds maxDistanceMeters
        }
      }
    }

    const totalAmount = Number(cash) + Number(transfer);
    const imgBillUrl = saveBase64Image(image_bill);
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const result = await query(
      `INSERT INTO check_out 
       (list_id, payment_id, image_bill, date_time_check_out, cash, transfer, transfer_according, 
        off_site, paid, amount, visit_customer, visit_type_id, visit_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        list_id,
        payment_id || null,
        imgBillUrl,
        dateTime,
        cash,
        transfer,
        transfer_according ? 1 : 0,
        isOffSite,
        transfer_according ? 0 : 1, // paid = 0 if transfer_according is 1
        totalAmount,
        visit_customer ? 1 : 0,
        targetVisitTypeId,
        visit_note
      ]
    );

    const check_out_id = result.insertId;

    // Save additional check out images if provided
    if (Array.isArray(additional_images) && additional_images.length > 0) {
      for (const imgStr of additional_images) {
        const savedUrl = saveBase64Image(imgStr);
        if (savedUrl) {
          await query(
            `INSERT INTO check_out_image (check_out_id, image_check_out) VALUES (?, ?)`,
            [check_out_id, savedUrl]
          );
        }
      }
    }

    // Update list_store status to completed & end_service_time (เวลาสิ้นสุดบริการ = เวลาเช็คเอาท์)
    try {
      await query(
        `UPDATE list_store SET status = 'completed', end_service_time = ? ${isOffSite ? ', off_site = 1' : ''} WHERE list_id = ?`,
        [dateTime, list_id]
      );
    } catch (eUpEnd) {
      await query(`UPDATE list_store SET status = 'completed' ${isOffSite ? ', off_site = 1' : ''} WHERE list_id = ?`, [list_id]);
    }

    // Recalculate totals on car_release
    const releaseRow = listRows[0];
    if (releaseRow) {
      const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
      let targetCarReleaseId = hasCarReleaseId ? releaseRow.car_release_id : null;
      let filterCol = hasCarReleaseId && targetCarReleaseId ? 'ls.car_release_id' : 'ls.group_store_id';
      let filterVal = hasCarReleaseId && targetCarReleaseId ? targetCarReleaseId : releaseRow.group_store_id;

      if (!targetCarReleaseId && releaseRow.group_store_id) {
        const crs = await query(`SELECT car_release_id FROM car_release WHERE group_store_id = ? ORDER BY car_release_id DESC LIMIT 1`, [releaseRow.group_store_id]);
        if (crs.length > 0) targetCarReleaseId = crs[0].car_release_id;
      }

      if (targetCarReleaseId && filterVal) {
        const totals = await query(
          `SELECT COUNT(*) as total_bills, SUM(co.amount) as sum_amount 
           FROM check_out co 
           JOIN list_store ls ON co.list_id = ls.list_id 
           WHERE ${filterCol} = ? AND ls.bypass = 0`,
          [filterVal]
        );
        if (totals.length > 0) {
          await query(
            `UPDATE car_release SET total_number_of_bills = ?, total_amount = ? WHERE car_release_id = ?`,
            [totals[0].total_bills || 0, totals[0].sum_amount || 0, targetCarReleaseId]
          );
        }
      }
    }

    res.json({
      success: true,
      message: isOffSite ? 'เช็คเอาท์สำเร็จ (แจ้งเตือน: นอกสถานที่ > 300ม.)' : 'เช็คเอาท์สำเร็จ',
      check_out_id,
      off_site: isOffSite
    });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/list-store/:id/problem (แจ้งปัญหา)
router.post('/list-store/:id/problem', authenticateToken, async (req, res) => {
  try {
    const list_id = req.params.id;
    const {
      problem_name,
      normal_bill = 0,
      normal_bill_note = '',
      edit_bill = 0,
      edit_bill_note = '',
      product_swap = 0,
      product_swap_note = '',
      out_of_stock = 0,
      out_of_stock_note = '',
      overstock = 0,
      overstock_note = '',
      problem_images = []
    } = req.body;

    const result = await query(
      `INSERT INTO problem 
       (list_id, problem_name, normal_bill, normal_bill_note, edit_bill, edit_bill_note, 
        product_swap, product_swap_note, out_of_stock, out_of_stock_note, overstock, overstock_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        list_id,
        problem_name || 'บันทึกปัญหาเพิ่มเติม',
        normal_bill ? 1 : 0,
        normal_bill_note,
        edit_bill ? 1 : 0,
        edit_bill_note,
        product_swap ? 1 : 0,
        product_swap_note,
        out_of_stock ? 1 : 0,
        out_of_stock_note,
        overstock ? 1 : 0,
        overstock_note
      ]
    );

    const problem_id = result.insertId;

    if (Array.isArray(problem_images) && problem_images.length > 0) {
      for (const imgStr of problem_images) {
        const savedUrl = saveBase64Image(imgStr);
        if (savedUrl) {
          await query(
            `INSERT INTO problem_image (problem_id, problem_image) VALUES (?, ?)`,
            [problem_id, savedUrl]
          );
        }
      }
    }

    // Update list_store status to problem
    await query(`UPDATE list_store SET status = 'problem', end_service_time = ? WHERE list_id = ?`, [new Date().toISOString().slice(0, 19).replace('T', ' '), list_id]);

    res.json({
      success: true,
      message: 'บันทึกปัญหาเรียบร้อยแล้ว',
      problem_id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/list-store/:id/bypass (สลับสถานะ bypass)
router.patch('/list-store/:id/bypass', authenticateToken, async (req, res) => {
  try {
    const list_id = req.params.id;
    const { bypass } = req.body;

    await query(`UPDATE list_store SET bypass = ? WHERE list_id = ?`, [bypass ? 1 : 0, list_id]);

    res.json({ success: true, message: `Bypass updated to ${bypass ? 1 : 0}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
