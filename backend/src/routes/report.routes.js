const express = require('express');
const router = express.Router();
const { query, hasColumn } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Helper to determine user role permissions
async function getUserRoleInfo(reqUser) {
  if (!reqUser || !reqUser.user_id) {
    return { isDriver: false, isAdmin: false };
  }

  let level_user_id = reqUser.level_user_id;
  let access_id = reqUser.access_id;
  let level_user_name = reqUser.level_user_name || '';
  let access_name = reqUser.access_name || '';

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

  const isAdmin = (
    Number(level_user_id) === 1 ||
    Number(level_user_id) === 2 ||
    Number(access_id) === 1 ||
    Number(access_id) === 2 ||
    /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(level_user_name) ||
    /admin|administrator|แอดมิน|supervisor|manager|หัวหน้า/i.test(access_name)
  );

  const isDriver = !isAdmin && (
    Number(level_user_id) === 3 ||
    Number(access_id) === 3 ||
    /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(level_user_name) ||
    /driver|พนักงานขับรถ|คนขับ|staff|เซลส์/i.test(access_name)
  );

  return { isDriver, isAdmin, level_user_id, access_id, level_user_name, access_name };
}

// GET /api/reports/dashboard
router.get('/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const { range = 'today' } = req.query;
    const roleInfo = await getUserRoleInfo(req.user);

    // If logged-in user is a Driver, force filter to their own user_id
    const driverId = roleInfo.isDriver ? req.user.user_id : (req.query.driver_id || null);
    const driverCond = driverId ? ` AND cr.user_id = ${parseInt(driverId, 10)}` : '';

    let dateWhereClause = 'DATE(cr.created_at) = CURDATE()';
    let checkOutWhereClause = 'DATE(co.date_time_check_out) = CURDATE()';

    if (range === 'this_week') {
      dateWhereClause = 'cr.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      checkOutWhereClause = 'co.date_time_check_out >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'this_month') {
      dateWhereClause = 'cr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
      checkOutWhereClause = 'co.date_time_check_out >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    const hasPhoneCol = await hasColumn('user', 'phone_number_1');
    const phoneField = hasPhoneCol ? 'u.phone_number_1' : (await hasColumn('user', 'tel_number') ? 'u.tel_number' : "''");

    const hasCarCodeCol = await hasColumn('car', 'car_code');
    const carCodeField = hasCarCodeCol ? 'c.car_code' : "''";

    const hasCarReturnTable = await hasColumn('car_return', 'car_release_id');
    const isReturnedExpr = hasCarReturnTable
      ? `(SELECT COUNT(*) FROM car_return crt WHERE crt.car_release_id = cr.car_release_id) > 0`
      : `0`;

    const hasCarReleaseId = await hasColumn('list_store', 'car_release_id');
    const storeReleaseJoinCondition = hasCarReleaseId
      ? `(ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id)`
      : `ls.group_store_id = cr.group_store_id`;

    // 1. Total releases breakdown
    let totalReleases = 0;
    let runningReleases = 0;
    let returnedReleases = 0;
    try {
      const releasesStats = await query(`
        SELECT 
          COUNT(*) as total_releases,
          SUM(CASE WHEN ${isReturnedExpr} THEN 0 ELSE 1 END) as running_releases,
          SUM(CASE WHEN ${isReturnedExpr} THEN 1 ELSE 0 END) as returned_releases
        FROM car_release cr
        WHERE ${dateWhereClause} ${driverCond}
      `);
      totalReleases = Number(releasesStats[0]?.total_releases || 0);
      runningReleases = Number(releasesStats[0]?.running_releases || 0);
      returnedReleases = Number(releasesStats[0]?.returned_releases || 0);
    } catch (e) {
      console.warn('Dashboard releasesStats query warning:', e.message);
    }

    // 2. Financial Metrics
    let totalCash = 0;
    let totalTransferReceived = 0;
    let pendingTransferAmount = 0;
    let pendingTransferCount = 0;
    let grandTotalAmount = 0;
    try {
      const salesSummary = await query(`
        SELECT 
          SUM(co.cash) as total_cash,
          SUM(CASE WHEN co.transfer_according = 0 THEN co.transfer ELSE 0 END) as total_transfer_received,
          SUM(CASE WHEN co.transfer_according = 1 THEN co.transfer ELSE 0 END) as pending_transfer_amount,
          COUNT(CASE WHEN co.transfer_according = 1 THEN 1 END) as pending_transfer_count,
          SUM(co.amount) as grand_total_amount
        FROM check_out co
        JOIN list_store ls ON co.list_id = ls.list_id
        JOIN car_release cr ON ${storeReleaseJoinCondition}
        WHERE ls.bypass = 0 AND ${checkOutWhereClause} ${driverCond}
      `);
      totalCash = Number(salesSummary[0]?.total_cash || 0);
      totalTransferReceived = Number(salesSummary[0]?.total_transfer_received || 0);
      pendingTransferAmount = Number(salesSummary[0]?.pending_transfer_amount || 0);
      pendingTransferCount = Number(salesSummary[0]?.pending_transfer_count || 0);
      grandTotalAmount = Number(salesSummary[0]?.grand_total_amount || 0);
    } catch (e) {
      console.warn('Dashboard salesSummary query warning:', e.message);
    }

    // 3. Store targets vs completed (Filtered by dateRange of car_release)
    let targetStores = 0;
    let completedStores = 0;
    try {
      const storeStats = await query(`
        SELECT 
          COUNT(DISTINCT ls.list_id) as stores_target,
          COUNT(DISTINCT CASE 
            WHEN ls.status = 'completed' OR ls.status = 'problem' OR co.check_out_id IS NOT NULL OR prob.problem_id IS NOT NULL 
            THEN ls.list_id 
          END) as stores_completed
        FROM car_release cr
        JOIN list_store ls ON ${storeReleaseJoinCondition}
        LEFT JOIN check_out co ON ls.list_id = co.list_id
        LEFT JOIN problem prob ON ls.list_id = prob.list_id
        WHERE ${dateWhereClause} ${driverCond}
      `);
      targetStores = Number(storeStats[0]?.stores_target || 0);
      completedStores = Number(storeStats[0]?.stores_completed || 0);
    } catch (e) {
      console.warn('Dashboard storeStats query warning:', e.message);
    }

    // 4. Off-site checks count
    let offSiteCount = 0;
    try {
      const offSiteSummary = await query(`
        SELECT COUNT(*) as off_site_count 
        FROM check_out co
        JOIN list_store ls ON co.list_id = ls.list_id
        JOIN car_release cr ON ${storeReleaseJoinCondition}
        WHERE co.off_site = 1 AND ${checkOutWhereClause} ${driverCond}
      `);
      offSiteCount = Number(offSiteSummary[0]?.off_site_count || 0);
    } catch (e) {
      console.warn('Dashboard offSiteSummary query warning:', e.message);
    }

    // 5. Problems count
    let problemCount = 0;
    try {
      const problemSummary = await query(`
        SELECT COUNT(DISTINCT prob.problem_id) as problem_count 
        FROM problem prob
        JOIN list_store ls ON prob.list_id = ls.list_id
        JOIN car_release cr ON ${storeReleaseJoinCondition}
        WHERE ${dateWhereClause} ${driverCond}
      `);
      problemCount = Number(problemSummary[0]?.problem_count || 0);
    } catch (e) {
      console.warn('Dashboard problemSummary query warning:', e.message);
    }

    // 6. Daily sales chart (last 7 days)
    let dailyStats = [];
    try {
      const dailyRows = await query(`
        SELECT 
          DATE(co.date_time_check_out) as date,
          SUM(co.cash) as cash,
          SUM(CASE WHEN co.transfer_according = 0 THEN co.transfer ELSE 0 END) as transfer,
          SUM(CASE WHEN co.transfer_according = 1 THEN co.transfer ELSE 0 END) as pending_transfer
        FROM check_out co
        JOIN list_store ls ON co.list_id = ls.list_id
        JOIN car_release cr ON ${storeReleaseJoinCondition}
        WHERE ls.bypass = 0 AND co.date_time_check_out >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${driverCond}
        GROUP BY DATE(co.date_time_check_out)
        ORDER BY date ASC
      `);
      dailyStats = dailyRows.map(row => ({
        date: row.date ? new Date(row.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : '',
        cash: Number(row.cash || 0),
        transfer: Number(row.transfer || 0),
        pending_transfer: Number(row.pending_transfer || 0),
        total: Number((row.cash || 0) + (row.transfer || 0))
      }));
    } catch (e) {
      console.warn('Dashboard dailyStats query warning:', e.message);
    }

    // 7. Recent Releases / Operations (Top 10)
    let recentReleases = [];
    try {
      const storeCountSubquery = hasCarReleaseId
        ? `(SELECT COUNT(*) FROM list_store ls WHERE (ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id))`
        : `(SELECT COUNT(*) FROM list_store ls WHERE ls.group_store_id = cr.group_store_id)`;

      const storeDoneSubquery = hasCarReleaseId
        ? `(SELECT COUNT(DISTINCT ls.list_id) FROM list_store ls LEFT JOIN check_out co ON ls.list_id = co.list_id LEFT JOIN problem prob ON ls.list_id = prob.list_id WHERE (ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id) AND (ls.status = 'completed' OR ls.status = 'problem' OR co.check_out_id IS NOT NULL OR prob.problem_id IS NOT NULL))`
        : `(SELECT COUNT(DISTINCT ls.list_id) FROM list_store ls LEFT JOIN check_out co ON ls.list_id = co.list_id LEFT JOIN problem prob ON ls.list_id = prob.list_id WHERE ls.group_store_id = cr.group_store_id AND (ls.status = 'completed' OR ls.status = 'problem' OR co.check_out_id IS NOT NULL OR prob.problem_id IS NOT NULL))`;

      const storeAmountSubquery = hasCarReleaseId
        ? `(SELECT COALESCE(SUM(co.amount), 0) FROM check_out co JOIN list_store ls ON co.list_id = ls.list_id WHERE (ls.car_release_id = cr.car_release_id OR ls.group_store_id = cr.group_store_id))`
        : `(SELECT COALESCE(SUM(co.amount), 0) FROM check_out co JOIN list_store ls ON co.list_id = ls.list_id WHERE ls.group_store_id = cr.group_store_id)`;

      const rows = await query(`
        SELECT 
          cr.car_release_id, 
          cr.car_release_no, 
          cr.created_at, 
          cr.accounting_status,
          cr.mileage,
          c.license_plate, 
          c.brand,
          c.model,
          c.car_image,
          gs.group_store_name,
          gs.group_color,
          acc.status_name as accounting_status_name,
          ${carCodeField} as car_code,
          u.name as driver_name, 
          ${phoneField} as driver_phone,
          ${storeCountSubquery} as stores_total,
          ${storeDoneSubquery} as stores_done,
          ${storeAmountSubquery} as total_amount,
          ${isReturnedExpr} as is_returned
        FROM car_release cr
        LEFT JOIN car c ON cr.car_id = c.car_id
        LEFT JOIN user u ON cr.user_id = u.user_id
        LEFT JOIN group_store gs ON cr.group_store_id = gs.group_store_id
        LEFT JOIN accounting_status acc ON (cr.accounting_status = acc.status_id OR cr.accounting_status = acc.status_name OR cr.accounting_status = acc.status_code)
        WHERE 1=1 ${driverCond}
        ORDER BY cr.car_release_id DESC
        LIMIT 10
      `);

      recentReleases = rows.map(op => ({
        id: op.car_release_no || `RELEASE-${op.car_release_id}`,
        carReleaseId: op.car_release_id,
        carReleaseNo: op.car_release_no,
        licensePlate: op.license_plate || '-',
        carImg: op.car_image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=100&q=80',
        brandModel: `${op.brand || ''} ${op.model || ''}`.trim() || '-',
        groupStoreName: op.group_store_name || '-',
        groupColor: op.group_color || '#94a3b8',
        driver: op.driver_name || 'ไม่ระบุคนขับ',
        phone: op.driver_phone || '-',
        followerName: '-',
        storesDone: Number(op.stores_done || 0),
        storesTotal: Number(op.stores_total || 0),
        status: Boolean(op.is_returned) ? 'คืนรถแล้ว' : 'กำลังวิ่งงาน',
        accounting: op.accounting_status_name || op.accounting_status || 'รอตรวจ',
        mileage: Number(op.mileage || 0),
        amount: Number(op.total_amount || 0),
        isReturned: Boolean(op.is_returned),
        hasIssue: false
      }));
    } catch (e) {
      console.warn('Dashboard recentReleases query warning:', e.message);
    }

    // 8. Driver Leaderboard
    let driverLeaderboard = [];
    try {
      const driverRows = await query(`
        SELECT 
          u.user_id,
          u.name as driver_name,
          COUNT(DISTINCT co.list_id) as completed_stores,
          SUM(co.amount) as revenue
        FROM user u
        JOIN car_release cr ON u.user_id = cr.user_id
        JOIN list_store ls ON ${storeReleaseJoinCondition}
        JOIN check_out co ON ls.list_id = co.list_id
        WHERE ls.bypass = 0 ${driverCond}
        GROUP BY u.user_id, u.name
        ORDER BY revenue DESC
        LIMIT 5
      `);
      driverLeaderboard = driverRows.map(d => ({
        userId: d.user_id,
        name: d.driver_name || 'ไม่ระบุชื่อ',
        completedStores: Number(d.completed_stores || 0),
        revenue: Number(d.revenue || 0),
        active: true
      }));
    } catch (e) {
      console.warn('Dashboard driverLeaderboard query warning:', e.message);
    }

    const completionPercent = targetStores > 0 ? ((completedStores / targetStores) * 100).toFixed(1) : '0';

    res.json({
      success: true,
      isDriver: roleInfo.isDriver,
      isAdmin: roleInfo.isAdmin,
      summary: {
        total_releases: totalReleases,
        running_releases: runningReleases,
        returned_releases: returnedReleases,
        stores_target: targetStores,
        stores_completed: completedStores,
        stores_completion_percent: Number(completionPercent),
        total_cash: totalCash,
        total_transfer_received: totalTransferReceived,
        pending_transfer_amount: pendingTransferAmount,
        pending_transfer_count: pendingTransferCount,
        grand_total_amount: grandTotalAmount,
        off_site_count: offSiteCount,
        problem_count: problemCount
      },
      dailyStats,
      recentReleases,
      driverLeaderboard
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

