const express = require('express');
const router = express.Router();
const { query, hasColumn } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/dashboard
router.get('/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Total releases today
    const releasesToday = await query(`SELECT COUNT(*) as count FROM car_release WHERE DATE(created_at) = ?`, [today]);

    // 2. Financial Metrics
    const salesSummary = await query(`
      SELECT 
        SUM(co.cash) as total_cash,
        SUM(CASE WHEN co.transfer_according = 0 THEN co.transfer ELSE 0 END) as total_transfer_received,
        SUM(CASE WHEN co.transfer_according = 1 THEN co.transfer ELSE 0 END) as pending_transfer_amount,
        COUNT(CASE WHEN co.transfer_according = 1 THEN 1 END) as pending_transfer_count,
        SUM(co.amount) as grand_total_amount
      FROM check_out co
      JOIN list_store ls ON co.list_id = ls.list_id
      WHERE ls.bypass = 0
    `);

    // 3. Off-site checks count
    const offSiteSummary = await query(`
      SELECT COUNT(*) as off_site_count 
      FROM check_out 
      WHERE off_site = 1
    `);

    // 4. Problems count
    const problemSummary = await query(`SELECT COUNT(*) as problem_count FROM problem`);

    // 5. Daily sales chart (last 7 days)
    const dailyStats = await query(`
      SELECT 
        DATE(co.date_time_check_out) as date,
        SUM(co.cash) as cash,
        SUM(CASE WHEN co.transfer_according = 0 THEN co.transfer ELSE 0 END) as transfer,
        SUM(CASE WHEN co.transfer_according = 1 THEN co.transfer ELSE 0 END) as pending_transfer
      FROM check_out co
      JOIN list_store ls ON co.list_id = ls.list_id
      WHERE ls.bypass = 0 AND co.date_time_check_out >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(co.date_time_check_out)
      ORDER BY date ASC
    `);

    // 6. Recent Releases
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const storeCountSubquery = hasCarReleaseId
      ? `(SELECT COUNT(*) FROM list_store ls WHERE ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id)`
      : `(SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id)`;

    const recentReleases = await query(`
      SELECT cr.car_release_id, cr.car_release_no, cr.created_at, cr.accounting_status,
             c.license_plate, u.name as driver_name,
             ${storeCountSubquery} as store_count
      FROM car_release cr
      LEFT JOIN car c ON cr.car_id = c.car_id
      LEFT JOIN user u ON cr.user_id = u.user_id
      ORDER BY cr.car_release_id DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      summary: {
        total_releases_today: releasesToday[0].count || 0,
        total_cash: Number(salesSummary[0].total_cash || 0),
        total_transfer_received: Number(salesSummary[0].total_transfer_received || 0),
        pending_transfer_amount: Number(salesSummary[0].pending_transfer_amount || 0),
        pending_transfer_count: Number(salesSummary[0].pending_transfer_count || 0),
        grand_total_amount: Number(salesSummary[0].grand_total_amount || 0),
        off_site_count: offSiteSummary[0].off_site_count || 0,
        problem_count: problemSummary[0].problem_count || 0
      },
      dailyStats,
      recentReleases
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/pending-transfer (รายงานยอดโอนตามค้างชำระ)
router.get('/reports/pending-transfer', authenticateToken, async (req, res) => {
  try {
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const selectReleaseId = hasCarReleaseId ? `ls.car_release_id,` : `cr.car_release_id,`;
    const joinClause = hasCarReleaseId
      ? `JOIN car_release cr ON (ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id)`
      : `JOIN car_release cr ON ls.group_store_id = cr.group_store_id`;

    const list = await query(`
      SELECT co.*, ls.store_name_result, ${selectReleaseId}
             cr.car_release_no, cr.created_at as release_date,
             c.license_plate, u.name as driver_name,
             s.store_name, s.telephone_number
      FROM check_out co
      JOIN list_store ls ON co.list_id = ls.list_id
      ${joinClause}
      LEFT JOIN car c ON cr.car_id = c.car_id
      LEFT JOIN user u ON cr.user_id = u.user_id
      LEFT JOIN store s ON ls.store_id = s.store_id
      WHERE co.transfer_according = 1 AND ls.bypass = 0
      ORDER BY co.check_out_id DESC
    `);
    res.json({ success: true, pendingTransfers: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/off-site-checks (รายงานการเช็คเอาท์นอกสถานที่)
router.get('/reports/off-site-checks', authenticateToken, async (req, res) => {
  try {
    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const joinClause = hasCarReleaseId
      ? `JOIN car_release cr ON (ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id)`
      : `JOIN car_release cr ON ls.group_store_id = cr.group_store_id`;

    const list = await query(`
      SELECT co.*, ls.store_name_result, ls.lat_long as target_location,
             cr.car_release_no, u.name as driver_name,
             s.store_name, s.store_location
      FROM check_out co
      JOIN list_store ls ON co.list_id = ls.list_id
      ${joinClause}
      LEFT JOIN user u ON cr.user_id = u.user_id
      LEFT JOIN store s ON ls.store_id = s.store_id
      WHERE co.off_site = 1
      ORDER BY co.check_out_id DESC
    `);
    res.json({ success: true, offSiteChecks: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/audit-logs (ดึงประวัติการใช้งานและกิจกรรมในระบบ Audit Log)
router.get('/reports/audit-logs', authenticateToken, async (req, res) => {
  try {
    const { page, limit, search, action } = req.query;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (action && action.trim()) {
      whereClause += ` AND action = ?`;
      params.push(action.trim());
    }

    if (search && search.trim()) {
      const p = `%${search.trim()}%`;
      whereClause += ` AND (action LIKE ? OR user_name LIKE ? OR username LIKE ? OR target_type LIKE ? OR target_id LIKE ? OR details LIKE ?)`;
      params.push(p, p, p, p, p, p);
    }

    const countRes = await query(`SELECT COUNT(*) as total FROM audit_log${whereClause}`, params);
    const total = countRes[0]?.total || 0;

    let paginationObj = null;
    let dataSql = `SELECT * FROM audit_log${whereClause} ORDER BY log_id DESC`;

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 15);
      const offset = (pageNum - 1) * limitNum;
      dataSql += ` LIMIT ${limitNum} OFFSET ${offset}`;
      paginationObj = {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      };
    }

    const logs = await query(dataSql, params);

    res.json({
      success: true,
      logs,
      total,
      pagination: paginationObj
    });
  } catch (err) {
    console.error('Audit logs query error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

