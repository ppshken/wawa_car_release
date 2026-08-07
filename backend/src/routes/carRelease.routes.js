const express = require('express');
const router = express.Router();
const { query, hasColumn } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { saveBase64Image } = require('../middleware/upload');
const { normalizeProductControllerImages } = require('../utils/productControllerHelper');
const { normalizeReturnDocuments } = require('../utils/returnDocumentHelper');

// Helper to determine user role permissions
async function getUserRoleInfo(reqUser) {
  if (!reqUser || !reqUser.user_id) {
    return { isDriver: false, isAdmin: false };
  }

  let level_user_id = reqUser.level_user_id;
  let access_id = reqUser.access_id;
  let level_user_name = reqUser.level_user_name || '';
  let access_name = reqUser.access_name || '';

  // Fetch missing role/access details from DB if needed
  if (access_id === undefined || !level_user_name) {
    try {
      const rows = await query(
        `SELECT u.level_user_id, l.level_user_name, l.access_id, a.access_name
         FROM user u
         LEFT JOIN level_user l ON u.level_user_id = l.level_user_id
         LEFT JOIN access a ON l.access_id = a.access_id
         WHERE u.user_id = ?`,
        [reqUser.user_id]
      );
      if (rows && rows.length > 0) {
        level_user_id = rows[0].level_user_id;
        access_id = rows[0].access_id;
        level_user_name = rows[0].level_user_name || '';
        access_name = rows[0].access_name || '';
      }
    } catch (err) {
      console.error('Error fetching user role info:', err);
    }
  }

  // System Administrator level 1 or Admin/Supervisor:
  // level_user_id = 1 (แอดมินระบบ / System Administrator level 1)
  // level_user_id = 2 (หัวหน้างานปล่อยรถ / Admin / Supervisor)
  // access_id = 1 (System Administrator), access_id = 2 (Supervisor / Manager)
  const isAdmin = (
    Number(level_user_id) === 1 ||
    Number(level_user_id) === 2 ||
    Number(access_id) === 1 ||
    Number(access_id) === 2 ||
    /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(level_user_name) ||
    /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(access_name)
  );

  // Driver:
  // level_user_id = 3 (พนักงานขับรถ / เซลส์)
  // access_id = 3 (Driver / Staff)
  const isDriver = !isAdmin && (
    Number(level_user_id) === 3 ||
    Number(access_id) === 3 ||
    /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(level_user_name) ||
    /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(access_name)
  );

  return { isDriver, isAdmin, level_user_id, access_id, level_user_name, access_name };
}

// POST /api/car-release (สร้างใบปล่อยรถ)
router.post('/car-release', authenticateToken, async (req, res) => {
  try {
    const {
      car_id,
      car_release_type_id,
      user_id,
      group_store_id,
      mileage,
      pda_device,
      description,
      followers = [], 
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

    // เช็คกรุ๊ป และ คนขับ
    if (!car_id || !user_id) {
      return res.status(400).json({ success: false, message: 'จำเป็นต้องเลือก กรุ๊ปรถ และคนขับ' });
    }

    // เช็คเลขไมล์
    if(mileage <= 0) {
      return res.status(400).json({ success: false, message: 'จำเป็นต้องกรอกเลขไมล์' });
    }

    // เช็คอุปกรณ์
    if(pda_device === 0) {
      return res.status(400).json({ success: false, message: 'จำเป็นต้องเลือกอุปกรณ์ PDA' });
    }

    // เช็คภาพถ่าย
    if(!image_mileage || !image_front || !image_around_1 || !image_around_2 || !image_around_3 || !image_around_4 || !image_around_5 || !image_pda) {
      return res.status(400).json({ success: false, message: 'จำเป็นต้องกรอกรูปภาพทั้งหมด' });
    }


    // Check duplicate group_store_id on the same day
    if (group_store_id) {
      const existingGroup = await query(
        `SELECT car_release_id, car_release_no FROM car_release WHERE group_store_id = ? AND DATE(created_at) = CURDATE()`,
        [group_store_id]
      );
      if (existingGroup && existingGroup.length > 0) {
        return res.status(400).json({
          success: false,
          message: `กรุ๊ปรถนี้ได้ถูกสร้างใบปล่อยรถไปแล้วในวันนี้ (${existingGroup[0].car_release_no}) ไม่สามารถเลือกซ้ำวันเดียวกันได้`
        });
      }
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
    const imgPath = `car_release/${releaseNo}/release`;

    const imgMileageUrl = await saveBase64Image(image_mileage, imgPath);
    const imgFrontUrl = await saveBase64Image(image_front, imgPath);
    const imgAround1Url = await saveBase64Image(image_around_1, imgPath);
    const imgAround2Url = await saveBase64Image(image_around_2, imgPath);
    const imgAround3Url = await saveBase64Image(image_around_3, imgPath);
    const imgAround4Url = await saveBase64Image(image_around_4, imgPath);
    const imgAround5Url = await saveBase64Image(image_around_5, imgPath);
    const imgPdaUrl = await saveBase64Image(image_pda, imgPath);

    const createdByVal = req.user ? (req.user.user_id || req.user.id || req.user.name || req.user.username || 1) : 1;

    let result;
    try {
      result = await query(
        `INSERT INTO car_release 
         (car_release_no, car_id, car_release_type_id, user_id, group_store_id, mileage, 
          image_mileage, image_front, image_around_1, image_around_2, image_around_3, image_around_4, image_around_5, 
          image_pda, pda_device, description, accounting_status, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          pda_device ? parseInt(pda_device, 10) : null,
          description || '',
          accounting_status || null,
          createdByVal
        ]
      );
    } catch (eReleaseIns) {
      result = await query(
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
          pda_device ? parseInt(pda_device, 10) : null,
          description || '',
          accounting_status || null
        ]
      );
    }

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

// GET /api/car-release/active-dates (ดึงวันที่ทั้งหมดที่มีการปล่อยรถ)
router.get('/car-release/active-dates', authenticateToken, async (req, res) => {
  try {
    const roleInfo = await getUserRoleInfo(req.user);
    let whereClause = `WHERE created_at IS NOT NULL AND created_at != '0000-00-00 00:00:00'`;
    const params = [];

    // Driver: เห็นเฉพาะวันที่ ปล่อยรถ คนขับ = ตัวเอง
    if (roleInfo.isDriver) {
      whereClause += ` AND user_id = ?`;
      params.push(req.user.user_id);
    }

    const rows = await query(`
      SELECT DISTINCT DATE_FORMAT(created_at, '%Y-%m-%d') AS d 
      FROM car_release 
      ${whereClause}
      ORDER BY d ASC
    `, params);
    const activeDates = rows.map(r => r.d).filter(Boolean);
    return res.json({ success: true, activeDates });
  } catch (err) {
    console.error("Fetch active car release dates error:", err);
    return res.json({ success: true, activeDates: [] });
  }
});

// GET /api/car-release (ดึงรายการใบปล่อยรถทั้งหมด รองรับ Pagination & Filter ตามวันที่ & ค้นหา)
router.get('/car-release', authenticateToken, async (req, res) => {
  try {
    const { status, driver_id, date, page, limit, search } = req.query;
    const roleInfo = await getUserRoleInfo(req.user);

    let whereClause = ' WHERE 1=1';
    const params = [];

    // System Administrator / Admin: เห็นข้อมูลปล่อยรถทั้งหมด
    // Driver: เห็นเฉพาะ ปล่อยรถ คนขับ = ตัวเอง
    if (roleInfo.isDriver) {
      whereClause += ` AND cr.user_id = ?`;
      params.push(req.user.user_id);
    } else if (driver_id) {
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
      LEFT JOIN pda_device pd ON cr.pda_device = pd.pda_id
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
             pd.device_name as pda_device_name,
             (SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id) as total_stores,
             (SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id AND (ls.status = 'completed' OR ls.status = 'problem')) as completed_stores,
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
      try {
        const followers = await query(
          `SELECT crf.*, u.phone_number_1 as follower_phone
           FROM car_release_follower crf
           LEFT JOIN user u ON LOWER(TRIM(crf.follower_name)) = LOWER(TRIM(u.name))
           WHERE crf.car_release_id = ?`,
          [rel.car_release_id]
        );
        rel.followers = followers || [];
        rel.follower_name = followers && followers.length > 0 ? followers.map(f => f.follower_name).join(', ') : '-';
        rel.follower_phone = followers && followers.length > 0 ? (followers.map(f => f.follower_phone).filter(Boolean).join(', ') || '-') : '-';
      } catch (eFoll) {
        rel.followers = [];
        rel.follower_name = '-';
        rel.follower_phone = '-';
      }
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
    const roleInfo = await getUserRoleInfo(req.user);

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

    // Driver: เห็นเฉพาะ ปล่อยรถ คนขับ = ตัวเอง
    if (roleInfo.isDriver && String(release.user_id) !== String(req.user.user_id)) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลใบปล่อยรถนี้' });
    }

    // Fetch Followers
    try {
      const followers = await query(
        `SELECT crf.*, u.phone_number_1 as follower_phone
         FROM car_release_follower crf
         LEFT JOIN user u ON LOWER(TRIM(crf.follower_name)) = LOWER(TRIM(u.name))
         WHERE crf.car_release_id = ? 
         ORDER BY crf.follower_id ASC`,
        [car_release_id]
      );
      release.followers = followers || [];
      release.follower_name = followers && followers.length > 0 ? followers.map(f => f.follower_name).join(', ') : '-';
      release.follower_phone = followers && followers.length > 0 ? (followers.map(f => f.follower_phone).filter(Boolean).join(', ') || '-') : '-';
    } catch (eFoll) {
      release.followers = [];
      release.follower_name = '-';
      release.follower_phone = '-';
    }

    // Fetch List Stores + CheckIn + CheckOut + Problem
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const storeWhere = hasCarReleaseId
      ? `WHERE ls.group_store_id = (SELECT group_store_id FROM car_release WHERE car_release_id = ?) OR ls.car_release_id = ?`
      : `WHERE ls.group_store_id = (SELECT group_store_id FROM car_release WHERE car_release_id = ?)`;
    const storeParams = hasCarReleaseId ? [car_release_id, car_release_id] : [car_release_id];

    const stores = await query(
      `SELECT ls.*, 
              pp.position_product_name,
              s.store_name, s.store_name AS store_name_result, s.store_address, s.telephone_number, s.customer_delivery_time, s.store_location, s.store_location AS lat_long,
              ci.check_in_id, ci.image_check_in, ci.date_time_check_in, ci.signature, ci.location as check_in_location,
              co.check_out_id, co.payment_id, co.image_bill, co.date_time_check_out, co.cash, co.transfer, 
              co.transfer_according, co.off_site as check_out_off_site, co.paid, co.amount, co.visit_customer, 
              co.visit_type_id, vt.visit_type_name, co.visit_note,
              p.payment_name,
              gs.group_store_name,
              prob.problem_id, prob.problem_name, prob.normal_bill, prob.edit_bill, prob.product_swap, prob.out_of_stock, prob.overstock, prob.created_at
       FROM list_store ls
       LEFT JOIN store s ON ls.store_id = s.store_id
       LEFT JOIN position_product pp ON ls.position_product_id = pp.position_product_id
       LEFT JOIN check_in ci ON ls.list_id = ci.list_id
       LEFT JOIN check_out co ON ls.list_id = co.list_id
       LEFT JOIN visit_type vt ON co.visit_type_id = vt.visit_type_id
       LEFT JOIN payment p ON co.payment_id = p.payment_id
       LEFT JOIN problem prob ON ls.list_id = prob.list_id
       LEFT JOIN group_store gs ON ls.group_store_id = gs.group_store_id
       ${storeWhere}
       ORDER BY ls.row_order ASC`,
      storeParams
    );

    // Fetch additional checkout images & problem images for each store
    for (const st of stores) {
      if (st.check_out_id) {
        const coImgs = await query(
          `SELECT image_check_out FROM check_out_image WHERE check_out_id = ?`,
          [st.check_out_id]
        );
        st.checkout_images = coImgs.map(r => r.image_check_out).filter(Boolean);
      }
      if (st.problem_id) {
        const pImgs = await query(
          `SELECT problem_image FROM problem_image WHERE problem_id = ?`,
          [st.problem_id]
        );
        st.problem_images = pImgs.map(r => r.problem_image).filter(Boolean);
      }

      // Sync service time with check_in / check_out timestamps if null
      if (!st.start_service_time && st.date_time_check_in) {
        st.start_service_time = st.date_time_check_in;
      }
      if (!st.end_service_time && st.date_time_check_out) {
        st.end_service_time = st.date_time_check_out;
      }

      // Fetch list_store_load joined with loading_type
      try {
        const loads = await query(
          `SELECT lsl.loading_type_id, lsl.quantity, lt.type_code, lt.type_name, lt.type_name AS loading_type_name, lt.unit_name
           FROM list_store_load lsl
           LEFT JOIN loading_type lt ON lsl.loading_type_id = lt.loading_type_id
           WHERE lsl.list_id = ?`,
          [st.list_id]
        );
        st.loads = loads || [];

      } catch (eLoad) {
        st.loads = [];
      }
    }

    // Fetch Car Return details if exists
    const returns = await query(
      `SELECT crt.*, kh.key_holder_name, pk.parking_name 
       FROM car_return crt
       LEFT JOIN key_holder kh ON crt.key_holder_id = kh.key_holder_id
       LEFT JOIN parking pk ON crt.parking_id = pk.parking_id
       WHERE crt.car_release_id = ?`,
      [car_release_id]
    );

    let productControllerImages = [];
    try {
      productControllerImages = await query(
        `SELECT image_url FROM product_controller WHERE car_release_id = ? ORDER BY created_at ASC, id ASC`,
        [car_release_id]
      );
    } catch (err) {
      console.error('Fetch product controller images error:', err);
    }

    let returnDocuments = [];
    try {
      returnDocuments = await query(
        `SELECT file_url FROM return_documents WHERE car_release_id = ? ORDER BY created_at ASC, id ASC`,
        [car_release_id]
      );
    } catch (err) {
      console.error('Fetch return documents error:', err);
    }

    release.stores = stores;
    release.car_return = returns.length > 0 ? returns[0] : null;
    release.product_controller_images = (productControllerImages || []).map((row) => row.image_url).filter(Boolean);
    release.return_documents = (returnDocuments || []).map((row) => row.file_url).filter(Boolean);

    res.json({ success: true, release });
  } catch (err) {
    console.error('Fetch release detail error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/car-release/:id/product-controller (บันทึกภาพสินค้าควบคุม)
router.post('/car-release/:id/product-controller', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const { images = [], car_release_no } = req.body;
    const normalizedImages = normalizeProductControllerImages(images);

    if (!normalizedImages.length) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบรูปภาพสินค้าควบคุมอย่างน้อย 1 รูป' });
    }

    const savedImages = [];
    for (const image of normalizedImages) {
      const imageUrl = await saveBase64Image(image, `car_release/${car_release_no}/product_controller`);
      const result = await query(
        `INSERT INTO product_controller (car_release_id, image_url, created_at) VALUES (?, ?, NOW())`,
        [car_release_id, imageUrl]
      );
      savedImages.push({ id: result.insertId, image_url: imageUrl });
    }

    res.json({ success: true, message: 'บันทึกภาพสินค้าควบคุมสำเร็จ', images: savedImages });
  } catch (err) {
    console.error('Save product controller images error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/car-release/:id/return-documents (บันทึกเอกสารคืนของ)
router.post('/car-release/:id/return-documents', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const { documents = [], car_release_no } = req.body;
    const normalizedDocuments = normalizeReturnDocuments(documents);

    if (!normalizedDocuments.length) {
      return res.status(400).json({ success: false, message: 'กรุณาแนบเอกสารคืนของอย่างน้อย 1 ไฟล์' });
    }

    const savedDocuments = [];
    for (const document of normalizedDocuments) {
      const fileUrl = await saveBase64Image(document, `car_release/${car_release_no}/return_documents`);
      const result = await query(
        `INSERT INTO return_documents (car_release_id, file_url, created_at) VALUES (?, ?, NOW())`,
        [car_release_id, fileUrl]
      );
      savedDocuments.push({ id: result.insertId, file_url: fileUrl });
    }

    res.json({ success: true, message: 'บันทึกเอกสารคืนของสำเร็จ', documents: savedDocuments });
  } catch (err) {
    console.error('Save return documents error:', err);
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

    const imgMileageUrl = await saveBase64Image(image_mileage);
    const imgFrontUrl = await saveBase64Image(image_front);
    const imgAround1Url = await saveBase64Image(image_around_1);
    const imgAround2Url = await saveBase64Image(image_around_2);
    const imgAround3Url = await saveBase64Image(image_around_3);
    const imgAround4Url = await saveBase64Image(image_around_4);
    const imgReturnUrl = await saveBase64Image(image_return);
    const imgPdaUrl = await saveBase64Image(image_pda);

    // Check if return record already exists
    const existing = await query(
      `SELECT car_return_id FROM car_return WHERE car_release_id = ?`,
      [car_release_id]
    );

    let returnId;
    if (existing.length > 0) {
      returnId = existing[0].car_return_id;
      await query(
        `UPDATE car_return 
         SET key_holder_id = ?, parking_id = ?, mileage = ?, 
             image_mileage = COALESCE(?, image_mileage), 
             image_front = COALESCE(?, image_front), 
             image_around_1 = COALESCE(?, image_around_1), 
             image_around_2 = COALESCE(?, image_around_2), 
             image_around_3 = COALESCE(?, image_around_3), 
             image_around_4 = COALESCE(?, image_around_4), 
             image_return = COALESCE(?, image_return), 
             image_pda = COALESCE(?, image_pda), 
             gas_bill = ?, note = ?
         WHERE car_return_id = ?`,
        [
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
          note || '',
          returnId
        ]
      );
    } else {
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
      returnId = result.insertId;
    }

    res.json({
      success: true,
      message: 'บันทึกใบคืนรถสำเร็จ',
      car_return_id: returnId
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

    const imgMileageUrl = image_mileage ? await saveBase64Image(image_mileage) : undefined;
    const imgFrontUrl = image_front ? await saveBase64Image(image_front) : undefined;
    const imgAround1Url = image_around_1 ? await saveBase64Image(image_around_1) : undefined;
    const imgAround2Url = image_around_2 ? await saveBase64Image(image_around_2) : undefined;
    const imgAround3Url = image_around_3 ? await saveBase64Image(image_around_3) : undefined;
    const imgAround4Url = image_around_4 ? await saveBase64Image(image_around_4) : undefined;
    const imgAround5Url = image_around_5 ? await saveBase64Image(image_around_5) : undefined;
    const imgPdaUrl = image_pda ? await saveBase64Image(image_pda) : undefined;

    if (group_store_id) {
      const existingGroup = await query(
        `SELECT car_release_id, car_release_no FROM car_release 
         WHERE group_store_id = ? 
           AND car_release_id != ? 
           AND DATE(created_at) = (SELECT DATE(created_at) FROM car_release WHERE car_release_id = ?)`,
        [group_store_id, car_release_id, car_release_id]
      );
      if (existingGroup && existingGroup.length > 0) {
        return res.status(400).json({
          success: false,
          message: `กรุ๊ปรถนี้ได้ถูกสร้างใบปล่อยรถไปแล้วในวันนี้ (${existingGroup[0].car_release_no}) ไม่สามารถเลือกซ้ำวันเดียวกันได้`
        });
      }
    }

    await query(
      `UPDATE car_release 
       SET car_id = COALESCE(?, car_id),
           car_release_type_id = COALESCE(?, car_release_type_id),
           user_id = COALESCE(?, user_id),
           group_store_id = COALESCE(?, group_store_id),
           mileage = COALESCE(?, mileage),
           pda_device = COALESCE(?, pda_device),
           description = COALESCE(?, description),
           accounting_status = ?,
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
        accounting_status || null,
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
    const roleInfo = await getUserRoleInfo(req.user);

    // Fetch target car_release record
    const target = await query(`SELECT group_store_id, user_id FROM car_release WHERE car_release_id = ?`, [car_release_id]);
    if (target.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบปล่อยรถที่ต้องการลบ' });
    }

    if (roleInfo.isDriver && String(target[0].user_id) !== String(req.user.user_id)) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ลบข้อมูลใบปล่อยรถนี้' });
    }

    const group_store_id = target[0].group_store_id;

    // Delete related records in car_release_follower, car_return
    await query(`DELETE FROM car_release_follower WHERE car_release_id = ?`, [car_release_id]);
    await query(`DELETE FROM car_return WHERE car_release_id = ?`, [car_release_id]);

    // Delete main car_release record
    await query(`DELETE FROM car_release WHERE car_release_id = ?`, [car_release_id]);

    // Update group_store status to 0 (คืนสถานะเป็นยังไม่ปล่อยรถ)
    if (group_store_id) {
      await query(`UPDATE group_store SET status = 0 WHERE group_store_id = ?`, [group_store_id]);
    }

    res.json({ success: true, message: 'ลบข้อมูลใบปล่อยรถและอัปเดตสถานะกรุ๊ปรถเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error deleting car release:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auto-migration for product_controller table
(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS product_controller (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        car_release_id INT UNSIGNED NOT NULL,
        image_url VARCHAR(1000) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (car_release_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating product_controller table:', err);
  }
})();

// Auto-migration for return_documents table
(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS return_documents (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        car_release_id INT UNSIGNED NOT NULL,
        file_url VARCHAR(1000) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (car_release_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating return_documents table:', err);
  }
})();

// Auto-migration for car_release_chat table
(async () => {
  try {
    const { query } = require('../config/db');
    await query(`
      CREATE TABLE IF NOT EXISTS car_release_chat (
        chat_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        car_release_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        image_url VARCHAR(500) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (car_release_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('Error creating car_release_chat table:', err);
  }
})();

// GET /api/car-release/:id/chat (ดึงข้อความแชทของใบปล่อยรถ)
router.get('/car-release/:id/chat', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const messages = await query(
      `SELECT c.*, u.user_image as sender_avatar
       FROM car_release_chat c
       LEFT JOIN user u ON c.user_id = u.user_id
       WHERE c.car_release_id = ?
       ORDER BY c.chat_id ASC`,
      [car_release_id]
    );
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/car-release/:id/chat (ส่งข้อความแชท)
router.post('/car-release/:id/chat', authenticateToken, async (req, res) => {
  try {
    const car_release_id = req.params.id;
    const { message, image } = req.body;
    const userId = req.user?.user_id || req.user?.id || 0;
    const senderName = req.user?.name || req.user?.username || 'ผู้ใช้งาน';

    if ((!message || !message.trim()) && !image) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อความหรือแนบรูปภาพ' });
    }

    let imgUrl = null;
    if (image) {
      imgUrl = await saveBase64Image(image, `chat/${car_release_id}`);
    }

    const result = await query(
      `INSERT INTO car_release_chat (car_release_id, user_id, sender_name, message, image_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [car_release_id, userId, senderName, message ? message.trim() : '', imgUrl]
    );

    res.json({
      success: true,
      message: 'ส่งข้อความสำเร็จ',
      chat: {
        chat_id: result.insertId,
        car_release_id,
        user_id: userId,
        sender_name: senderName,
        message: message ? message.trim() : '',
        image_url: imgUrl,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Send chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

