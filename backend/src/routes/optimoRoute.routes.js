const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getApiKey } = require('../utils/apiKeyHelper');

// =========================================================
// OptimoRoute API Proxy
// =========================================================


// GET /api/optimoroute/active-dates (ดึงวันที่ทั้งหมดที่มีออเดอร์/เส้นทาง)
router.get('/active-dates', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const rows = await query(`
      SELECT DISTINCT d FROM (
        SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM group_store WHERE date IS NOT NULL AND date != ''
        UNION
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d FROM group_store WHERE created_at IS NOT NULL
        UNION
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d FROM list_store WHERE created_at IS NOT NULL
      ) AS dates_union
      WHERE d IS NOT NULL AND d != '0000-00-00'
      ORDER BY d ASC
    `);
    const activeDates = rows.map(r => r.d).filter(Boolean);
    return res.json({ success: true, activeDates });
  } catch (err) {
    console.error("Fetch active route dates error:", err);
    return res.json({ success: true, activeDates: [] });
  }
});

// GET /api/optimoroute/routes?date=YYYY-MM-DD
// ดึงข้อมูลเส้นทางและจุดหยุดแวะโดยตรงจากฐานข้อมูลระบบ (group_store, list_store, store)
router.get('/routes', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10);

    // 1. ดึงข้อมูลจากฐานข้อมูลของระบบ (group_store + list_store + store) ตามวันที่ระบุ
    let rows = [];
    try {
      rows = await query(
        `SELECT 
          gs.group_store_id,
          gs.group_store_name,
          gs.group_color,
          gs.car_id,
          gs.load1,
          gs.date AS group_date,
          IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr2 WHERE cr2.group_store_id = gs.group_store_id) > 0, 1, 0) AS group_status,
          ls.list_id,
          ls.data_store_no,
          ls.store_id,
          ls.row_order,
          ls.sum_quantity,
          ls.lat_long,
          ls.store_name_result,
          ls.status,
          ls.created_at,
          ls.scheduled_time,
          ls.start_service_time,
          ls.end_service_time,
          ls.priority,
          ls.pod_image,
          ls.position_product_id,
          ls.position_production_order,
          pp.position_product_name,
          s.store_name,
          s.store_address,
          s.store_location,
          s.telephone_number,
          COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate,
          c.quantity AS vehicle_capacity
        FROM group_store gs
        LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
        LEFT JOIN store s ON ls.store_id = s.store_id
        LEFT JOIN position_product pp ON ls.position_product_id = pp.position_product_id
        LEFT JOIN car_release cr ON cr.group_store_id = gs.group_store_id
        LEFT JOIN car c ON (CAST(c.car_id AS CHAR) = CAST(gs.car_id AS CHAR) OR c.license_plate = gs.car_id OR cr.car_id = c.car_id)
        WHERE (
          (gs.date IS NOT NULL AND (gs.date = ? OR DATE_FORMAT(gs.date, '%Y-%m-%d') = ?))
          OR
          (gs.date IS NULL AND (DATE_FORMAT(gs.created_at, '%Y-%m-%d') = ? OR DATE_FORMAT(ls.created_at, '%Y-%m-%d') = ?))
        )
        ORDER BY gs.group_store_id ASC, ls.row_order ASC`,
        [targetDate, targetDate, targetDate, targetDate]
      );
    } catch (eJoin) {
      try {
        rows = await query(
          `SELECT 
            gs.group_store_id,
            gs.group_store_name,
            gs.group_color,
            gs.car_id,
            gs.load1,
            IF(gs.status = 1 OR (SELECT COUNT(*) FROM car_release cr2 WHERE cr2.group_store_id = gs.group_store_id) > 0, 1, 0) AS group_status,
            ls.list_id,
            ls.data_store_no,
            ls.store_id,
            ls.row_order,
            ls.sum_quantity,
            ls.lat_long,
            ls.store_name_result,
            ls.status,
            ls.created_at,
            ls.position_product_id,
            ls.position_production_order,
            pp.position_product_name,
            s.store_name,
            s.store_address,
            s.store_location,
            s.telephone_number,
            COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate,
            c.quantity AS vehicle_capacity
          FROM group_store gs
          LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
          LEFT JOIN store s ON ls.store_id = s.store_id
          LEFT JOIN position_product pp ON ls.position_product_id = pp.position_product_id
          LEFT JOIN car c ON (CAST(c.car_id AS CHAR) = CAST(gs.car_id AS CHAR) OR c.license_plate = gs.car_id)
          WHERE (
            (gs.date IS NOT NULL AND (gs.date = ? OR DATE_FORMAT(gs.date, '%Y-%m-%d') = ?))
            OR
            (gs.date IS NULL AND (DATE_FORMAT(gs.created_at, '%Y-%m-%d') = ? OR DATE_FORMAT(ls.created_at, '%Y-%m-%d') = ?))
          )
          ORDER BY gs.group_store_id ASC, ls.row_order ASC`,
          [targetDate, targetDate, targetDate, targetDate]
        );
      } catch (e2) {
        console.warn('Query routes fallback error:', e2.message);
      }
    }

    // หากไม่พบข้อมูลในวันที่ระบุ ให้ส่งคืน routes เปล่าสำหรับวันที่นั้น
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        date: targetDate,
        source: 'database',
        routes: []
      });
    }

    // 2. จัดกลุ่มข้อมูลตาม group_store
    const groupMap = new Map();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    const listIds = (rows || []).map((r) => r.list_id).filter(Boolean);
    let loadsMap = {};
    if (listIds.length > 0) {
      try {
        const loadRows = await query(
          `SELECT lsl.list_id, lsl.loading_type_id, lsl.quantity, lt.type_name, lt.unit_name, lt.type_code
           FROM list_store_load lsl
           JOIN loading_type lt ON lsl.loading_type_id = lt.loading_type_id
           WHERE lsl.list_id IN (${listIds.join(',')})`
        );
        (loadRows || []).forEach((l) => {
          if (!loadsMap[l.list_id]) loadsMap[l.list_id] = [];
          loadsMap[l.list_id].push(l);
        });
      } catch (eLoads) {
        console.warn('Fetch list_store_load for routes warning:', eLoads.message);
      }
    }

    rows.forEach((row) => {
      const gId = row.group_store_id;
      if (!groupMap.has(gId)) {
        const isReleased = Boolean(row.group_status === 1 || row.group_status === '1');
        groupMap.set(gId, {
          routeId: `ROUTE-${gId}`,
          groupStoreId: gId,
          groupStoreName: row.group_store_name || `Optimo Routes-${String(gId).padStart(3, '0')}`,
          driverName: row.group_store_name || `สายจัดส่ง ${gId}`,
          vehiclePlate: row.vehicle_plate || row.car_id || '-',
          car_id: row.car_id || '',
          load1: row.load1 || 0,
          vehicleCapacity: row.vehicle_capacity ? parseInt(row.vehicle_capacity, 10) : 0,
          color: row.group_color || colors[groupMap.size % colors.length],
          status: isReleased ? 1 : 0,
          is_released: isReleased,
          stops: []
        });
      }

      if (row.list_id || row.store_id) {
        const grp = groupMap.get(gId);
        let lat = 0;
        let lng = 0;
        const locStr = row.lat_long || row.store_location;
        if (locStr && typeof locStr === 'string' && locStr.includes(',')) {
          const parts = locStr.split(',');
          lat = parseFloat(parts[0]) || 0;
          lng = parseFloat(parts[1]) || 0;
        }

        grp.stops.push({
          stopId: row.list_id || grp.stops.length + 1,
          group_store_name: row.group_store_name,
          rowOrder: row.row_order || grp.stops.length + 1,
          row_order: row.row_order || grp.stops.length + 1,
          orderNo: row.data_store_no || row.store_id || '-',
          data_store_no: row.data_store_no || row.store_id || '-',
          locationNo: row.store_id,
          storeName: row.store_name_result || row.store_name || `ร้านค้า ${row.store_id}`,
          address: row.store_address || '',
          telephone_number: row.telephone_number || '',
          quantity: row.sum_quantity || 0,
          lat,
          lng,
          lat_long: locStr || (lat && lng ? `${lat},${lng}` : null),
          scheduled_time: row.scheduled_time || '',
          start_service_time: row.start_service_time || null,
          end_service_time: row.end_service_time || null,
          priority: row.priority || 'medium',
          pod_image: row.pod_image || null,
          position_product_id: row.position_product_id,
          position_production_order: row.position_production_order,
          position_product_name: row.position_product_name,
          loads: loadsMap[row.list_id] || [],
          arrivalTime: '',
          departureTime: '',
          status: row.status || 'pending',
          type: 'delivery'
        });
      }
    });

    const routes = Array.from(groupMap.values()).map(r => ({
      ...r,
      totalStops: r.stops.length
    }));

    res.json({
      success: true,
      date: targetDate,
      source: 'database',
      totalGroups: routes.length,
      routes
    });

  } catch (err) {
    console.error('OptimoRoute database fetch routes error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/optimoroute/preview
// ดึงข้อมูลจาก OptimoRoute API เพื่อพรีวิวก่อนบันทึกลงฐานข้อมูล
router.post('/preview', authenticateToken, async (req, res) => {
  try {
    const apiKey = await getApiKey('OPTIMOROUTE_API_KEY');
    const targetDate = req.body.date || new Date().toISOString().slice(0, 10);

    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'ยังไม่ได้ตั้งค่า OPTIMOROUTE_API_KEY ในระบบ หรือตั้งค่าเป็นปิดใช้งาน (Disabled)'
      });
    }

    let routeData = [];
    try {
      const apiUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${targetDate}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok || (data && data.success === false)) {
        return res.status(response.status || 400).json({
          success: false,
          message: `ไม่สามารถดึงข้อมูลจาก OptimoRoute API ได้: ${data?.message || data?.error || response.statusText || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'}`
        });
      }

      if (data && data.routes) {
        routeData = data.routes;
      }
    } catch (e) {
      console.error('Fetch OptimoRoute API error during preview:', e.message);
      return res.status(500).json({
        success: false,
        message: `เกิดข้อผิดพลาดในการเชื่อมต่อกับ OptimoRoute API: ${e.message}`
      });
    }

    if (!routeData || routeData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบเส้นทางจัดส่งใน OptimoRoute API สำหรับวันที่ ${targetDate}`
      });
    }

    const RANDOM_PALETTE = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
      '#6366f1', '#a855f7', '#059669', '#d97706', '#0284c7'
    ];

    let totalStopsCount = 0;
    const previewRoutes = routeData.map((r, rIdx) => {
      const routeNoStr = String(rIdx + 1).padStart(3, '0');
      const groupName = r.groupStoreName || r.group_store_name || `Optimo Routes-${routeNoStr}`;
      const randomColor = RANDOM_PALETTE[Math.floor(Math.random() * RANDOM_PALETTE.length)];
      const color = r.groupColor || r.group_color || r.color || randomColor;
      const rawStops = r.stops || r.manifest || [];

      const stops = rawStops.map((stop, sIdx) => {
        let lat = stop.lat || stop.latitude || stop.coordinates?.lat || stop.coordinates?.latitude || stop.location?.lat || stop.location?.latitude || stop.location_latitude || 0;
        let lng = stop.lng || stop.longitude || stop.lon || stop.coordinates?.lng || stop.coordinates?.longitude || stop.location?.lng || stop.location?.longitude || stop.location_longitude || 0;

        let storeLocation = null;
        if (lat && lng) {
          storeLocation = `${lat},${lng}`;
        } else if (stop.lat_long || stop.store_location || (typeof stop.location === 'string' && stop.location.includes(','))) {
          const locStr = String(stop.lat_long || stop.store_location || stop.location);
          if (locStr.includes(',')) storeLocation = locStr.replace(/\s+/g, '');
        }

        const targetStoreId = stop.locationNo || stop.orderNo || stop.stopId || `OR-${String(sIdx + 1).padStart(5, '0')}`;
        const orderNo = stop.orderNo || stop.order_no || stop.orderNumber || stop.data_store_no || stop.locationNo || `ORD-${String(sIdx + 1).padStart(5, '0')}`;
        const storeName = stop.storeName || stop.name || stop.locationName || `ร้านค้า ${targetStoreId}`;
        const quantity = stop.quantity || stop.sum_quantity || stop.numOrders || 0;

        return {
          rowOrder: sIdx + 1,
          locationNo: targetStoreId,
          orderNo,
          data_store_no: orderNo,
          storeName,
          address: stop.address || stop.location || '',
          quantity,
          lat,
          lng,
          lat_long: storeLocation
        };
      });

      totalStopsCount += stops.length;

      const vehicleVal = r.vehicleRegistration || '-';
      return {
        groupStoreName: groupName,
        groupColor: color,
        driverName: r.driverName || r.driver || `คนขับ ${rIdx + 1}`,
        vehiclePlate: vehicleVal,
        vehicleLabel: vehicleVal,
        load1: r.load1 || r.load_1 || r.capacity || r.load || 0,
        totalStops: stops.length,
        stops
      };
    });

    res.json({
      success: true,
      date: targetDate,
      source: 'api',
      totalGroups: previewRoutes.length,
      totalStops: totalStopsCount,
      routes: previewRoutes
    });

  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/optimoroute/import
// นำเข้าข้อมูลเส้นทางและจุดหยุดส่งสินค้าจาก OptimoRoute API ลงในฐานข้อมูล
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const apiKey = await getApiKey('OPTIMOROUTE_API_KEY');
    const targetDate = req.body.date || new Date().toISOString().slice(0, 10);

    let routeData = req.body.routes || [];

    // 1. ดึงข้อมูลจาก OptimoRoute API หากไม่มีการส่ง routes จาก preview
    if (!routeData || routeData.length === 0) {
      if (!apiKey || apiKey.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'ยังไม่ได้ตั้งค่า OPTIMOROUTE_API_KEY ในระบบ หรือตั้งค่าเป็นปิดใช้งาน (Disabled)'
        });
      }

      try {
        const apiUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${targetDate}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (response.ok && data.routes) {
          routeData = data.routes;
        } else {
          return res.status(response.status || 400).json({
            success: false,
            message: `ไม่สามารถดึงข้อมูลจาก OptimoRoute API ได้: ${data?.message || data?.error || response.statusText}`
          });
        }
      } catch (e) {
        console.error('Fetch OptimoRoute API error during import:', e.message);
        return res.status(500).json({
          success: false,
          message: `เกิดข้อผิดพลาดในการเชื่อมต่อกับ OptimoRoute API: ${e.message}`
        });
      }

      if (!routeData || routeData.length === 0) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบข้อมูลเส้นทาง OptimoRoute ที่จะนำเข้าในวันที่ ${targetDate}`
        });
      }
    }

    const RANDOM_PALETTE = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'
    ];

    let importedGroups = 0;
    let importedStores = 0;
    let importedListStores = 0;

    for (let rIdx = 0; rIdx < routeData.length; rIdx++) {
      const r = routeData[rIdx];

      // 1. ตรวจสอบ/สร้าง group_store (รูปแบบชื่อ Optimo Routes-001, Optimo Routes-002)
      let groupStoreId;
      const routeNoStr = String(rIdx + 1).padStart(3, '0');
      const groupName = r.groupStoreName || r.group_store_name || `Optimo Routes-${routeNoStr}`;
      const groupColor = r.groupColor || r.group_color || r.color || RANDOM_PALETTE[rIdx % RANDOM_PALETTE.length];
      const vehicleVal = r.vehicleLabel || r.vehiclePlate || r.car_id || r.car || r.vehicle || r.driverName || r.driver || '';
      const load1 = r.load1 || 0;

      const existingGroup = await query(
        `SELECT group_store_id FROM group_store WHERE group_store_name = ? AND (date = ? OR date IS NULL)`,
        [groupName, targetDate]
      );

      if (existingGroup.length > 0) {
        groupStoreId = existingGroup[0].group_store_id;
        try {
          await query(
            `UPDATE group_store SET group_color = ?, car_id = ?, date = ?, load1 = ? WHERE group_store_id = ?`,
            [groupColor, vehicleVal, targetDate, load1, groupStoreId]
          );
        } catch (eUp) {
          console.warn('Update group_store import warning:', eUp.message);
        }
      } else {
        let newGroup;
        try {
          newGroup = await query(
            `INSERT INTO group_store (group_store_name, group_color, car_id, date, load1) VALUES (?, ?, ?, ?, ?)`,
            [groupName, groupColor, vehicleVal, targetDate, load1]
          );
        } catch (eInsert) {
          try {
            newGroup = await query(
              `INSERT INTO group_store (group_store_name, group_color, car_id, load1) VALUES (?, ?, ?, ?)`,
              [groupName, groupColor, vehicleVal, load1]
            );
          } catch (eInsert2) {
            newGroup = await query(
              `INSERT INTO group_store (group_store_name, group_color, load1) VALUES (?, ?, ?)`,
              [groupName, groupColor, load1]
            );
          }
        }
        groupStoreId = newGroup.insertId;
        importedGroups++;
      }

      // 2. วนลูปสร้าง store & list_store
      const stops = r.stops || r.manifest || [];
      for (let sIdx = 0; sIdx < stops.length; sIdx++) {
        const stop = stops[sIdx];

        // สกัดพิกัด (lat, long) รองรับทุกรูปแบบของ OptimoRoute API / JSON Payload
        let lat = stop.lat || stop.latitude || stop.coordinates?.lat || stop.coordinates?.latitude || stop.location?.lat || stop.location?.latitude || stop.location_latitude || 0;
        let lng = stop.lng || stop.longitude || stop.lon || stop.coordinates?.lng || stop.coordinates?.longitude || stop.location?.lng || stop.location?.longitude || stop.location_longitude || 0;

        let storeLocation = null;
        if (lat && lng) {
          storeLocation = `${lat},${lng}`;
        } else if (stop.lat_long || stop.store_location || (typeof stop.location === 'string' && stop.location.includes(','))) {
          const locStr = String(stop.lat_long || stop.store_location || stop.location);
          if (locStr.includes(',')) {
            storeLocation = locStr.replace(/\s+/g, '');
          }
        }

        const targetStoreId = stop.locationNo || stop.orderNo || stop.stopId || `OR-${String(sIdx + 1).padStart(5, '0')}`;
        const orderNo = stop.orderNo || stop.order_no || stop.orderNumber || stop.data_store_no || stop.locationNo || `ORD-${String(sIdx + 1).padStart(5, '0')}`;
        const storeName = stop.storeName || stop.name || stop.locationName || `ร้านค้า ${targetStoreId}`;
        const quantity = stop.quantity || stop.sum_quantity || stop.numOrders || 0;

        // หาหรือสร้าง store ในตาราง store
        let storeId = targetStoreId;
        let existingStore = await query(
          `SELECT store_id, store_location FROM store WHERE store_id = ? OR store_name = ? LIMIT 1`,
          [targetStoreId, storeName]
        );

        if (existingStore.length > 0) {
          storeId = existingStore[0].store_id;
          if (!storeLocation && existingStore[0].store_location) {
            storeLocation = existingStore[0].store_location;
          }
        } else {
          try {
            await query(
              `INSERT INTO store (store_id, store_name, store_address, store_location) VALUES (?, ?, ?, ?)`,
              [targetStoreId, storeName, stop.address || '', storeLocation]
            );
            importedStores++;
          } catch (e) {
            console.warn('Store insert notice:', e.message);
          }
        }

        // บันทึกลง list_store (รวม sum_quantity และ data_store_no)
        const rowOrder = sIdx + 1;
        const existingList = await query(
          `SELECT list_id FROM list_store WHERE group_store_id = ? AND row_order = ? AND DATE(created_at) = ?`,
          [groupStoreId, rowOrder, targetDate]
        );

        if (existingList.length === 0) {
          try {
            await query(
              `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, created_by, created_at, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                storeId,
                groupStoreId,
                rowOrder,
                quantity,
                storeLocation,
                storeName,
                orderNo,
                req.user ? req.user.user_id : 1,
                `${targetDate} 00:00:00`,
                'in_progress'
              ]
            );
          } catch (eIns) {
            await query(
              `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, created_by, created_at, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                storeId,
                groupStoreId,
                rowOrder,
                quantity,
                storeLocation,
                storeName,
                req.user ? req.user.user_id : 1,
                `${targetDate} 00:00:00`,
                'in_progress'
              ]
            );
          }
          importedListStores++;
        } else {
          try {
            await query(
              `UPDATE list_store SET store_id = ?, sum_quantity = ?, lat_long = ?, store_name_result = ?, data_store_no = ? WHERE list_id = ?`,
              [storeId, quantity, storeLocation, storeName, orderNo, existingList[0].list_id]
            );
          } catch (eUpd) {
            await query(
              `UPDATE list_store SET store_id = ?, sum_quantity = ?, lat_long = ?, store_name_result = ? WHERE list_id = ?`,
              [storeId, quantity, storeLocation, storeName, existingList[0].list_id]
            );
          }
        }
      }
    }

    res.json({
      success: true,
      message: `นำเข้าข้อมูล OptimoRoute ประจำวันที่ ${targetDate} สำเร็จ`,
      stats: {
        importedGroups,
        importedStores,
        importedListStores
      }
    });

  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/optimoroute/stops
// เพิ่มจุดจัดส่งสินค้าใหม่ (list_store)
router.post('/stops', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const {
      group_store_id,
      store_id,
      data_store_no,
      orderNo,
      order_no,
      store_name,
      address,
      row_order,
      sum_quantity,
      lat_long,
      scheduled_time,
      scheduledTime,
      priority,
      status,
      date
    } = req.body;

    if (!group_store_id) {
      return res.status(400).json({ success: false, message: 'กรุณาเลือกสายจัดส่ง (group_store_id)' });
    }

    // หากไม่มี store_id ให้สร้างอัตโนมัติ
    let targetStoreId = store_id ? String(store_id).trim() : `ST-${Date.now().toString().slice(-6)}`;
    const storeNameResult = store_name || `ร้านค้า ${targetStoreId}`;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const quantityNum = sum_quantity ? parseInt(sum_quantity, 10) : 0;
    const rowOrderNum = row_order ? parseInt(row_order, 10) : 1;
    const targetOrderNo = data_store_no || orderNo || order_no || null;
    const targetStatus = status || 'in_progress';
    const targetScheduledTime = scheduled_time || scheduledTime || null;
    const targetPriority = priority || 'medium';
    const targetPosProdId = req.body.position_product_id ? parseInt(req.body.position_product_id, 10) : null;
    const targetPosProdOrder = req.body.position_production_order !== undefined && req.body.position_production_order !== '' && req.body.position_production_order !== null ? parseInt(req.body.position_production_order, 10) : null;

    // ถ้ามี store_name ให้ upsert ลงตาราง store ด้วย
    if (store_name) {
      try {
        await query(
          `INSERT INTO store (store_id, store_name, store_address, store_location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), store_address = VALUES(store_address), store_location = VALUES(store_location)`,
          [targetStoreId, storeNameResult, address || null, lat_long || null]
        );
      } catch (eStore) {
        console.warn('Upsert store warning:', eStore.message);
      }
    }

    const createdByVal = req.user ? (req.user.user_id || req.user.id || req.user.name || req.user.username || 1) : 1;

    // บันทึกลง list_store
    let insertRes;
    try {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, scheduled_time, priority, status, position_product_id, position_production_order, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, targetOrderNo, targetScheduledTime, targetPriority, targetStatus, targetPosProdId, targetPosProdOrder, createdByVal, `${targetDate} 08:00:00`]
      );
    } catch (eIns) {
      try {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, targetOrderNo, createdByVal, `${targetDate} 08:00:00`]
        );
      } catch (e2) {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, createdByVal, `${targetDate} 08:00:00`]
        );
      }
    }

    const { loads } = req.body;
    if (insertRes && insertRes.insertId && Array.isArray(loads) && loads.length > 0) {
      try {
        for (const l of loads) {
          if (l.loading_type_id && parseInt(l.quantity, 10) > 0) {
            await query(
              `INSERT INTO list_store_load (list_id, loading_type_id, quantity) VALUES (?, ?, ?)`,
              [insertRes.insertId, parseInt(l.loading_type_id, 10), parseInt(l.quantity, 10)]
            );
          }
        }
      } catch (eLoadIns) {
        console.warn('Insert list_store_load error in POST /stops:', eLoadIns.message);
      }
    }

    res.json({
      success: true,
      message: 'เพิ่มรายการจุดจัดส่งเรียบร้อยแล้ว',
      list_id: insertRes.insertId,
      store_id: targetStoreId,
      data_store_no: targetOrderNo,
      group_store_id,
      row_order: rowOrderNum
    });
  } catch (err) {
    console.error('POST /stops error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/optimoroute/stops/:listId
// แก้ไขข้อมูลจุดจัดส่ง (list_store)
router.put('/stops/:listId', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const { listId } = req.params;
    const {
      group_store_id,
      store_id,
      data_store_no,
      orderNo,
      store_name,
      address,
      row_order,
      sum_quantity,
      lat_long,
      scheduled_time,
      scheduledTime,
      status,
      position_product_id,
      position_production_order
    } = req.body;

    const rowOrderNum = row_order ? parseInt(row_order, 10) : 1;
    const quantityNum = sum_quantity !== undefined ? parseInt(sum_quantity, 10) : 1;
    const targetOrderNo = data_store_no || orderNo || null;
    const targetScheduledTime = scheduled_time !== undefined ? scheduled_time : (scheduledTime !== undefined ? scheduledTime : null);
    const targetPosProdId = position_product_id !== undefined ? (position_product_id ? parseInt(position_product_id, 10) : null) : null;
    const targetPosProdOrder = position_production_order !== undefined && position_production_order !== '' && position_production_order !== null ? parseInt(position_production_order, 10) : null;

    // ถ้ามี store_id & store_name ให้อัปเดตตาราง store ด้วย
    if (store_id && store_name) {
      try {
        await query(
          `INSERT INTO store (store_id, store_name, store_address, store_location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), store_address = VALUES(store_address), store_location = VALUES(store_location)`,
          [store_id, store_name, address || null, lat_long || null]
        );
      } catch (eStore) {
        console.warn('Update store warning:', eStore.message);
      }
    }

    const targetGroupId = (group_store_id !== undefined && group_store_id !== '' && group_store_id !== null) ? group_store_id : null;

    // อัปเดตข้อมูลใน list_store
    try {
      await query(
        `UPDATE list_store
         SET group_store_id = ?,
             store_id = COALESCE(?, store_id),
             row_order = ?,
             sum_quantity = ?,
             lat_long = ?,
             store_name_result = ?,
             data_store_no = ?,
             scheduled_time = COALESCE(?, scheduled_time),
             status = COALESCE(?, status),
             position_product_id = ?,
             position_production_order = ?
         WHERE list_id = ?`,
        [targetGroupId, store_id || null, rowOrderNum, quantityNum, lat_long || null, store_name || null, targetOrderNo, targetScheduledTime, status || null, targetPosProdId, targetPosProdOrder, listId]
      );
    } catch (eUp) {
      await query(
        `UPDATE list_store
         SET group_store_id = ?,
             store_id = COALESCE(?, store_id),
             row_order = ?,
             sum_quantity = ?,
             lat_long = ?,
             store_name_result = ?,
             status = COALESCE(?, status)
         WHERE list_id = ?`,
        [targetGroupId, store_id || null, rowOrderNum, quantityNum, lat_long || null, store_name || null, status || null, listId]
      );
    }

    const { loads } = req.body;
    if (Array.isArray(loads)) {
      try {
        await query(`DELETE FROM list_store_load WHERE list_id = ?`, [listId]);
        for (const l of loads) {
          if (l.loading_type_id && parseInt(l.quantity, 10) > 0) {
            await query(
              `INSERT INTO list_store_load (list_id, loading_type_id, quantity) VALUES (?, ?, ?)`,
              [listId, parseInt(l.loading_type_id, 10), parseInt(l.quantity, 10)]
            );
          }
        }
      } catch (eLoadUp) {
        console.warn('Update list_store_load error:', eLoadUp.message);
      }
    }

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลจุดจัดส่งเรียบร้อยแล้ว'
    });
  } catch (err) {
    console.error('PUT /stops/:listId error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/optimoroute/stops/:listId
// ลบข้อมูลจุดจัดส่ง (list_store)
router.delete('/stops/:listId', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const { listId } = req.params;

    await query(`DELETE FROM list_store WHERE list_id = ?`, [listId]);

    res.json({
      success: true,
      message: 'ลบรายการจุดจัดส่งเรียบร้อยแล้ว'
    });
  } catch (err) {
    console.error('DELETE /stops/:listId error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/optimoroute/gps/devices or /api/gps/devices
// ดึงข้อมูลพิกัด GPS รถปัจจุบันจาก API (https://api.gpsiam.app/devices)
router.get('/gps/devices', authenticateToken, async (req, res) => {
  const https = require('https');
  try {
    const token = await getApiKey('GPS_API_TOKEN');
    const options = {
      hostname: 'api.gpsiam.app',
      path: '/devices?address=1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'WawaCarRelease/1.0'
      }
    };

    const gpsReq = https.request(options, (gpsRes) => {
      let body = '';
      gpsRes.on('data', (chunk) => { body += chunk; });
      gpsRes.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && (parsed.ok !== false || parsed.devices)) {
            return res.json({
              success: true,
              devices: parsed.devices || [],
              pois: parsed.pois || [],
              timestamp: new Date().toISOString()
            });
          } else {
            return res.json({
              success: false,
              message: parsed.message || 'Failed to fetch GPS devices',
              devices: []
            });
          }
        } catch (eParse) {
          return res.status(500).json({ success: false, message: 'Invalid JSON from GPS provider', devices: [] });
        }
      });
    });

    gpsReq.on('error', (errReq) => {
      console.error('GPS API Request Error:', errReq.message);
      return res.status(500).json({ success: false, message: errReq.message, devices: [] });
    });

    gpsReq.end();
  } catch (err) {
    console.error('GET /gps/devices error:', err);
    res.status(500).json({ success: false, message: err.message, devices: [] });
  }
});

// =========================================================
// UNASSIGNED DELIVERIES & AUTO-ROUTING CALCULATION ENGINE
// =========================================================

// GET /api/optimoroute/unassigned?date=YYYY-MM-DD
// ดึงรายการจุดจัดส่งที่ยังไม่ได้จัดสาย (group_store_id IS NULL)
router.get('/unassigned', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10);

    const rows = await query(
      `SELECT 
        ls.list_id,
        ls.data_store_no,
        ls.store_id,
        ls.row_order,
        ls.sum_quantity,
        ls.lat_long,
        ls.store_name_result,
        ls.status,
        ls.priority,
        ls.position_product_id,
        ls.position_production_order,
        pp.position_product_name,
        ls.created_at,
        s.store_name,
        s.store_address,
        s.store_location,
        s.telephone_number
      FROM list_store ls
      LEFT JOIN store s ON ls.store_id = s.store_id
      LEFT JOIN position_product pp ON ls.position_product_id = pp.position_product_id
      WHERE (ls.group_store_id IS NULL OR ls.group_store_id = 0)
        AND (DATE_FORMAT(ls.created_at, '%Y-%m-%d') = ? OR ? IS NULL)
      ORDER BY ls.list_id DESC`,
      [targetDate, targetDate]
    );

    const listIds = (rows || []).map((r) => r.list_id).filter(Boolean);
    let loadsMap = {};
    if (listIds.length > 0) {
      try {
        const loadRows = await query(
          `SELECT lsl.list_id, lsl.loading_type_id, lsl.quantity, lt.type_name, lt.unit_name, lt.type_code
           FROM list_store_load lsl
           JOIN loading_type lt ON lsl.loading_type_id = lt.loading_type_id
           WHERE lsl.list_id IN (${listIds.join(',')})`
        );
        (loadRows || []).forEach((l) => {
          if (!loadsMap[l.list_id]) loadsMap[l.list_id] = [];
          loadsMap[l.list_id].push(l);
        });
      } catch (eLoads) {
        console.warn('Fetch list_store_load warning:', eLoads.message);
      }
    }

    const stops = (rows || []).map((row) => {
      let lat = 0;
      let lng = 0;
      const locStr = row.lat_long || row.store_location;
      if (locStr && typeof locStr === 'string' && locStr.includes(',')) {
        const parts = locStr.split(',');
        lat = parseFloat(parts[0]) || 0;
        lng = parseFloat(parts[1]) || 0;
      }

      return {
        list_id: row.list_id,
        stopId: row.list_id,
        orderNo: row.data_store_no || row.store_id || '-',
        data_store_no: row.data_store_no || row.store_id || '-',
        store_id: row.store_id,
        locationNo: row.store_id,
        storeName: row.store_name_result || row.store_name || `ร้านค้า ${row.store_id}`,
        store_name: row.store_name_result || row.store_name || `ร้านค้า ${row.store_id}`,
        address: row.store_address || '',
        quantity: row.sum_quantity || 0,
        sum_quantity: row.sum_quantity || 0,
        lat,
        lng,
        lat_long: locStr || (lat && lng ? `${lat},${lng}` : null),
        status: row.status || 'unassigned',
        priority: row.priority || 'medium',
        position_product_id: row.position_product_id,
        position_production_order: row.position_production_order,
        position_product_name: row.position_product_name,
        loads: loadsMap[row.list_id] || [],
        type: 'delivery',
        created_at: row.created_at
      };
    });

    res.json({
      success: true,
      stops
    });
  } catch (err) {
    console.error('GET /unassigned error:', err);
    res.status(500).json({ success: false, message: err.message, stops: [] });
  }
});

// POST /api/optimoroute/unassigned
// สร้างรายการจัดส่งใหม่แบบยังไม่จัดสาย (group_store_id = NULL)
router.post('/unassigned', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const {
      store_id,
      data_store_no,
      orderNo,
      store_name,
      address,
      sum_quantity,
      lat_long,
      priority,
      date,
      position_product_id,
      position_production_order
    } = req.body;

    let targetStoreId = store_id ? String(store_id).trim() : `ST-${Date.now().toString().slice(-6)}`;
    const storeNameResult = store_name || `ร้านค้า ${targetStoreId}`;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const quantityNum = sum_quantity ? parseInt(sum_quantity, 10) : 1;
    const targetOrderNo = data_store_no || orderNo || `ORD-${Date.now().toString().slice(-6)}`;
    const targetPriority = priority || 'medium';
    const targetPosProdId = position_product_id ? parseInt(position_product_id, 10) : null;
    const targetPosProdOrder = position_production_order !== undefined && position_production_order !== '' && position_production_order !== null ? parseInt(position_production_order, 10) : 1;

    if (store_name) {
      try {
        await query(
          `INSERT INTO store (store_id, store_name, store_address, store_location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), store_address = VALUES(store_address), store_location = VALUES(store_location)`,
          [targetStoreId, storeNameResult, address || null, lat_long || null]
        );
      } catch (eStore) {
        console.warn('Upsert store warning:', eStore.message);
      }
    }

    const createdByVal = req.user ? (req.user.user_id || req.user.id || req.user.name || req.user.username || 1) : 1;

    let insertRes;
    try {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, priority, status, position_product_id, position_production_order, created_by, created_at)
         VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, 'unassigned', ?, ?, ?, ?)`,
        [targetStoreId, quantityNum, lat_long || null, storeNameResult, targetOrderNo, targetPriority, targetPosProdId, targetPosProdOrder, createdByVal, `${targetDate} 08:00:00`]
      );
    } catch (eIns) {
      try {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, status, created_by, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, ?, 'unassigned', ?, ?)`,
          [targetStoreId, quantityNum, lat_long || null, storeNameResult, targetOrderNo, createdByVal, `${targetDate} 08:00:00`]
        );
      } catch (e2) {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, status, created_by, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, 'unassigned', ?, ?)`,
          [targetStoreId, quantityNum, lat_long || null, storeNameResult, createdByVal, `${targetDate} 08:00:00`]
        );
      }
    }

    const newListId = insertRes ? insertRes.insertId : null;
    const { loads } = req.body;
    if (newListId && Array.isArray(loads) && loads.length > 0) {
      for (const l of loads) {
        if (l.loading_type_id && parseInt(l.quantity, 10) > 0) {
          try {
            await query(
              `INSERT INTO list_store_load (list_id, loading_type_id, quantity) VALUES (?, ?, ?)`,
              [newListId, parseInt(l.loading_type_id, 10), parseInt(l.quantity, 10)]
            );
          } catch (eLoadIns) {
            console.warn('Insert list_store_load error:', eLoadIns.message);
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'สร้างรายการจัดส่ง (ยังไม่จัดสาย) สำเร็จ',
      list_id: newListId
    });
  } catch (err) {
    console.error('POST /unassigned error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/optimoroute/unassigned/import
// นำเข้ารายการจัดส่งยังไม่จัดสายแบบทีละหลายรายการจาก Excel Preview Drawer
router.post('/unassigned/import', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const { stops, date } = req.body;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่พบรายการจัดส่งที่ต้องนำเข้า' });
    }

    let count = 0;
    for (const item of stops) {
      const storeId = item.store_id || item.locationNo || `ST-${Date.now().toString().slice(-6)}-${count}`;
      const storeName = item.store_name || item.storeName || `ร้านค้า ${storeId}`;
      const address = item.address || item.store_address || '';
      const orderNo = item.data_store_no || item.orderNo || `ORD-${Date.now().toString().slice(-6)}-${count}`;
      const quantity = parseInt(item.sum_quantity || item.quantity || 1, 10);
      const latLong = item.lat_long || (item.lat && item.lng ? `${item.lat},${item.lng}` : null);

      const posProdId = item.position_product_id ? parseInt(item.position_product_id, 10) : null;
      const posProdOrder = item.position_production_order ? parseInt(item.position_production_order, 10) : 1;

      try {
        await query(
          `INSERT INTO store (store_id, store_name, store_address, store_location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), store_address = VALUES(store_address), store_location = VALUES(store_location)`,
          [storeId, storeName, address || null, latLong || null]
        );
      } catch (eStore) {}

      const createdByVal = req.user ? (req.user.user_id || req.user.id || req.user.name || req.user.username || 1) : 1;

      let insertRes;
      try {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, status, position_product_id, position_production_order, created_by, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, ?, 'unassigned', ?, ?, ?, ?)`,
          [storeId, quantity, latLong || null, storeName, orderNo, posProdId, posProdOrder, createdByVal, `${targetDate} 08:00:00`]
        );
      } catch (eIns) {
        insertRes = await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, status, position_product_id, position_production_order, created_by, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, 'unassigned', ?, ?, ?, ?)`,
          [storeId, quantity, latLong || null, storeName, posProdId, posProdOrder, createdByVal, `${targetDate} 08:00:00`]
        );
      }

      const newListId = insertRes ? insertRes.insertId : null;

      // Insert cargo loading types into list_store_load
      let itemLoadsArray = [];
      if (Array.isArray(item.loads)) {
        itemLoadsArray = item.loads;
      } else if (item.loads && typeof item.loads === 'object') {
        itemLoadsArray = Object.entries(item.loads).map(([typeId, qty]) => ({
          loading_type_id: parseInt(typeId, 10),
          quantity: parseInt(String(qty), 10)
        }));
      }

      if (newListId && itemLoadsArray.length > 0) {
        for (const l of itemLoadsArray) {
          const lId = parseInt(l.loading_type_id, 10);
          const lQty = parseInt(l.quantity, 10);
          if (lId && lQty > 0) {
            try {
              await query(
                `INSERT INTO list_store_load (list_id, loading_type_id, quantity) VALUES (?, ?, ?)`,
                [newListId, lId, lQty]
              );
            } catch (eLoadIns) {
              console.warn('Insert list_store_load error in import:', eLoadIns.message);
            }
          }
        }
      }
      count++;
    }

    res.json({
      success: true,
      message: `นำเข้ารายการจัดส่งยังไม่จัดสายสำเร็จจำนวน ${count} รายการ`,
      count
    });
  } catch (err) {
    console.error('POST /unassigned/import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/optimoroute/delivery-settings
// ดึงข้อมูลการตั้งค่าการจัดส่งรวมของระบบจากฐานข้อมูล
router.get('/delivery-settings', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const rows = await query('SELECT * FROM delivery_settings ORDER BY id ASC LIMIT 1');
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        settings: {
          serviceTimePerStop: 10,
          priorityStrategy: 'fastest_time',
          depotStartTime: '08:00',
          bufferTimePerRoute: 15
        }
      });
    }

    const s = rows[0];
    res.json({
      success: true,
      settings: {
        serviceTimePerStop: parseInt(s.service_time_per_stop || 10, 10),
        priorityStrategy: s.priority_strategy || 'fastest_time',
        depotStartTime: s.depot_start_time || '08:00',
        bufferTimePerRoute: parseInt(s.buffer_time_per_route || 15, 10)
      }
    });
  } catch (err) {
    console.error('GET /delivery-settings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/optimoroute/delivery-settings
// บันทึกข้อมูลการตั้งค่าการจัดส่งลงฐานข้อมูล
router.post('/delivery-settings', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const { serviceTimePerStop, priorityStrategy, depotStartTime, bufferTimePerRoute } = req.body;

    const rows = await query('SELECT id FROM delivery_settings LIMIT 1');
    if (rows && rows.length > 0) {
      await query(
        `UPDATE delivery_settings
         SET service_time_per_stop = ?,
             priority_strategy = ?,
             depot_start_time = ?,
             buffer_time_per_route = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          parseInt(serviceTimePerStop || 10, 10),
          priorityStrategy || 'fastest_time',
          depotStartTime || '08:00',
          parseInt(bufferTimePerRoute || 15, 10),
          rows[0].id
        ]
      );
    } else {
      await query(
        `INSERT INTO delivery_settings (service_time_per_stop, priority_strategy, depot_start_time, buffer_time_per_route, updated_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [
          parseInt(serviceTimePerStop || 10, 10),
          priorityStrategy || 'fastest_time',
          depotStartTime || '08:00',
          parseInt(bufferTimePerRoute || 15, 10)
        ]
      );
    }

    res.json({
      success: true,
      message: 'บันทึกการตั้งค่าจัดส่งลงฐานข้อมูลเรียบร้อยแล้ว'
    });
  } catch (err) {
    console.error('POST /delivery-settings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/optimoroute/unassigned/clear
// ล้างข้อมูลรายการที่ยังไม่จัดสายทั้งหมดของวันที่ระบุ
router.delete('/unassigned/clear', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const targetDate = req.query.date || req.body.date || new Date().toISOString().slice(0, 10);

    const result = await query(
      `DELETE FROM list_store 
       WHERE (group_store_id IS NULL OR group_store_id = 0)
         AND DATE_FORMAT(created_at, '%Y-%m-%d') = ?`,
      [targetDate]
    );

    res.json({
      success: true,
      message: `ล้างรายการที่ยังไม่จัดสายของวันที่ ${targetDate} เรียบร้อยแล้ว (จำนวน ${result.affectedRows || 0} รายการ)`,
      affectedRows: result.affectedRows || 0
    });
  } catch (err) {
    console.error('DELETE /unassigned/clear error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UTILITY FUNCTIONS: Haversine, Clustering, 2-opt ───

/**
 * Haversine distance between two GPS coordinates (returns km)
 * ใช้แทน Math.hypot ที่คำนวณผิด — สูตรนี้คำนวณระยะบนพื้นผิวทรงกลมจริง
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  if (lat1 === lat2 && lng1 === lng2) return 0;
  if (Math.abs(lat1 - lat2) < 0.00002 && Math.abs(lng1 - lng2) < 0.00002) return 0;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate travel time in minutes based on distance
 * ความเร็วแยกตามระยะทาง: พิกัดเดียวกัน (0 นาที), ใกล้ (25 km/h), กลาง (40 km/h), ไกล (60 km/h)
 */
function estimateTravelMinutes(distKm) {
  if (distKm <= 0.001) return 0; // สถานที่/พิกัดเดียวกัน: 0 นาที
  if (distKm <= 0.5) return Math.max(1, Math.round((distKm / 25) * 60)); // ในเมืองระยะใกล้
  if (distKm <= 5) return Math.round((distKm / 25) * 60);    // ในเมือง: 25 km/h
  if (distKm <= 30) return Math.round((distKm / 40) * 60);   // ชานเมือง: 40 km/h
  return Math.round((distKm / 60) * 60);                     // ทางหลวง: 60 km/h
}

/**
 * Calculate total route distance (Haversine) including depot->first and last->depot
 */
function totalRouteDistance(stops, depot) {
  if (stops.length === 0) return 0;
  let total = haversineKm(depot.lat, depot.lng, stops[0].lat, stops[0].lng);
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineKm(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
  }
  total += haversineKm(stops[stops.length - 1].lat, stops[stops.length - 1].lng, depot.lat, depot.lng);
  return total;
}

/**
 * 2-opt Route Improvement — สลับลำดับจุดจัดส่งเพื่อลดระยะทางรวม
 * ลดเส้นทางตัดกัน (crossing routes) อย่างมีประสิทธิภาพ
 */
function twoOptImprove(stops, depot, maxIterations = 100) {
  if (stops.length < 3) return stops;

  let improved = [...stops];
  let bestDist = totalRouteDistance(improved, depot);
  let iteration = 0;
  let hasImproved = true;

  while (hasImproved && iteration < maxIterations) {
    hasImproved = false;
    iteration++;
    for (let i = 0; i < improved.length - 1; i++) {
      for (let j = i + 1; j < improved.length; j++) {
        // Reverse the segment between i and j
        const newRoute = [
          ...improved.slice(0, i),
          ...improved.slice(i, j + 1).reverse(),
          ...improved.slice(j + 1)
        ];
        const newDist = totalRouteDistance(newRoute, depot);
        if (newDist < bestDist - 0.01) { // 10m threshold
          improved = newRoute;
          bestDist = newDist;
          hasImproved = true;
        }
      }
    }
  }
  return improved;
}

/**
 * Simple K-means Geographic Clustering
 * จัดกลุ่มจุดจัดส่งตามพื้นที่ภูมิศาสตร์ เพื่อให้แต่ละรถรับผิดชอบพื้นที่เฉพาะ ไม่เส้นทางตัดกัน
 */
function kMeansCluster(items, k, maxIter = 50) {
  if (items.length <= k) {
    return items.map((item, idx) => ({ ...item, cluster: idx }));
  }

  // Initialize centroids: pick k items spread evenly
  const sortedByLat = [...items].sort((a, b) => a.lat - b.lat);
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.min(Math.floor((i / k) * items.length + items.length / (2 * k)), items.length - 1);
    centroids.push({ lat: sortedByLat[idx].lat, lng: sortedByLat[idx].lng });
  }

  let assignments = new Array(items.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // Assign each item to nearest centroid
    for (let i = 0; i < items.length; i++) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const dist = haversineKm(items[i].lat, items[i].lng, centroids[c].lat, centroids[c].lng);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed) break;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const members = items.filter((_, idx) => assignments[idx] === c);
      if (members.length > 0) {
        centroids[c] = {
          lat: members.reduce((s, m) => s + m.lat, 0) / members.length,
          lng: members.reduce((s, m) => s + m.lng, 0) / members.length
        };
      }
    }
  }

  return items.map((item, idx) => ({ ...item, cluster: assignments[idx] }));
}

/**
 * OSRM Travel Time Matrix — ดึงระยะเวลาเดินทางจริง (road network) จาก OSRM
 * Returns matrix[i][j] = travel time in seconds from point i to point j
 * Fallback: returns null if OSRM fails
 */
async function fetchOsrmTravelTimeMatrix(points) {
  try {
    if (points.length < 2 || points.length > 25) return null;

    const coordString = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/table/v1/driving/${coordString}?annotations=duration`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (data.code === 'Ok' && data.durations) {
      return data.durations; // matrix[i][j] = seconds
    }
    return null;
  } catch (err) {
    console.warn('OSRM Table API fallback:', err.message || err);
    return null;
  }
}

// POST /api/optimoroute/auto-route
// ระบบคำนวณจัดสายรถอัตโนมัติ (Haversine + K-means Clustering + 2-opt + OSRM Travel Time)
router.post('/auto-route', authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/db');
    const {
      date,
      strategy = 'shortest_distance',
      maxLoadPerVehicle = 100,
      maxStopsPerVehicle = 15,
      selectedVehicleIds = []
    } = req.body;

    const targetDate = date || new Date().toISOString().slice(0, 10);
    const DEPOT = { lat: 17.1266642, lng: 102.9635667, name: 'คลังสินค้าเริ่มต้น' };

    // 1. ดึงรายการจุดจัดส่งที่ยังไม่จัดสาย (group_store_id IS NULL)
    const unassignedRows = await query(
      `SELECT ls.list_id, ls.store_id, ls.data_store_no, ls.sum_quantity, ls.lat_long, ls.store_name_result, s.store_name, s.store_location
       FROM list_store ls
       LEFT JOIN store s ON ls.store_id = s.store_id
       WHERE (ls.group_store_id IS NULL OR ls.group_store_id = 0)
         AND (DATE_FORMAT(ls.created_at, '%Y-%m-%d') = ? OR ? IS NULL)`,
      [targetDate, targetDate]
    );

    if (!unassignedRows || unassignedRows.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่พบรายการรอจัดสายเพื่อคำนวณเส้นทาง' });
    }

    const items = unassignedRows.map((r) => {
      let lat = 13.7563;
      let lng = 100.5018;
      const locStr = r.lat_long || r.store_location;
      if (locStr && typeof locStr === 'string' && locStr.includes(',')) {
        const parts = locStr.split(',');
        lat = parseFloat(parts[0]) || lat;
        lng = parseFloat(parts[1]) || lng;
      }
      return {
        list_id: r.list_id,
        quantity: parseInt(r.sum_quantity || 1, 10),
        store_name: r.store_name_result || r.store_name || r.store_id,
        lat,
        lng,
        assigned: false
      };
    });

    const totalUnassignedQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    // 2. ตรวจสอบรถที่ถูกใช้งานไปแล้วในวันนี้ (ห้ามใช้ซ้ำวัน)
    const assignedRows = await query(
      `SELECT car_id FROM group_store WHERE (DATE_FORMAT(date, '%Y-%m-%d') = ? OR DATE_FORMAT(created_at, '%Y-%m-%d') = ?) AND car_id IS NOT NULL AND car_id != ''`,
      [targetDate, targetDate]
    );
    const alreadyAssignedCarIds = new Set((assignedRows || []).map((r) => String(r.car_id)));

    const availableVehicleIds = (selectedVehicleIds || []).filter(
      (id) => !alreadyAssignedCarIds.has(String(id))
    );

    if (availableVehicleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรถขนส่งสำหรับคำนวณจัดสาย (รถที่เลือกถูกนำไปจัดสายในวันนี้แล้ว)'
      });
    }

    let selectedVehicles = [];
    try {
      const placeholders = availableVehicleIds.map(() => '?').join(',');
      const cars = await query(
        `SELECT * FROM car WHERE car_id IN (${placeholders})`,
        availableVehicleIds
      );
      selectedVehicles = (cars || []).map((c) => ({
        car_id: c.car_id,
        license_plate: c.license_plate || c.car_id,
        capacity: parseInt(c.quantity || c.max_load || c.car_load || maxLoadPerVehicle || 100, 10)
      }));
    } catch (eCars) {
      selectedVehicles = availableVehicleIds.map((id) => ({
        car_id: id,
        license_plate: id,
        capacity: maxLoadPerVehicle || 100
      }));
    }

    const totalSelectedCapacity = selectedVehicles.reduce((sum, v) => sum + v.capacity, 0);

    // 3. แจ้งเตือนหากความจุรถไม่พอ
    if (totalUnassignedQuantity > totalSelectedCapacity) {
      return res.status(400).json({
        success: false,
        message: `รถที่เลือก รับได้ไม่พอ! (ต้องการบรรจุ ${totalUnassignedQuantity} ลัง แต่รถที่เลือกรองรับได้รวม ${totalSelectedCapacity} ลัง) กรุณาเลือกรถเพิ่มอีก`
      });
    }

    const effectivePriority = req.body.priorityStrategy || req.body.strategy || 'fastest_time';
    const bufferTimeMins = parseInt(req.body.bufferTimePerRoute || 0, 10);

    // จัดลำดับรถตาม strategy
    if (effectivePriority === 'max_load_first') {
      selectedVehicles.sort((a, b) => b.capacity - a.capacity);
    }

    // ─── Phase 2: Geographic Clustering (K-means) ───
    // จัดกลุ่มจุดจัดส่งตามพื้นที่ก่อนจัดลงรถ เพื่อลดเส้นทางตัดกัน
    const numVehicles = selectedVehicles.length;
    let clusteredItems;

    if (effectivePriority === 'order_fifo') {
      // FIFO ไม่ต้อง cluster — ใช้ลำดับเดิม
      clusteredItems = items.map((item, idx) => ({ ...item, cluster: Math.floor(idx / Math.ceil(items.length / numVehicles)) }));
    } else if (numVehicles >= 2 && items.length >= numVehicles * 2) {
      clusteredItems = kMeansCluster(items, numVehicles);
    } else {
      clusteredItems = items.map((item) => ({ ...item, cluster: 0 }));
    }

    // จัดกลุ่ม items ตาม cluster
    const clusterGroups = {};
    clusteredItems.forEach((item) => {
      if (!clusterGroups[item.cluster]) clusterGroups[item.cluster] = [];
      clusterGroups[item.cluster].push(item);
    });

    // จับคู่ cluster กับ vehicle (เรียงตาม cluster ID)
    const clusterKeys = Object.keys(clusterGroups).sort((a, b) => Number(a) - Number(b));

    // ถ้ามี cluster มากกว่ารถ ให้ merge cluster ที่มีน้อยที่สุดเข้ากัน
    while (clusterKeys.length > numVehicles && clusterKeys.length > 1) {
      // หา 2 cluster ที่ centroid ใกล้กันที่สุด แล้ว merge
      let minPairDist = Infinity;
      let mergeA = 0, mergeB = 1;
      for (let i = 0; i < clusterKeys.length; i++) {
        for (let j = i + 1; j < clusterKeys.length; j++) {
          const groupA = clusterGroups[clusterKeys[i]];
          const groupB = clusterGroups[clusterKeys[j]];
          const centA = { lat: groupA.reduce((s, m) => s + m.lat, 0) / groupA.length, lng: groupA.reduce((s, m) => s + m.lng, 0) / groupA.length };
          const centB = { lat: groupB.reduce((s, m) => s + m.lat, 0) / groupB.length, lng: groupB.reduce((s, m) => s + m.lng, 0) / groupB.length };
          const d = haversineKm(centA.lat, centA.lng, centB.lat, centB.lng);
          if (d < minPairDist) { minPairDist = d; mergeA = i; mergeB = j; }
        }
      }
      clusterGroups[clusterKeys[mergeA]].push(...clusterGroups[clusterKeys[mergeB]]);
      delete clusterGroups[clusterKeys[mergeB]];
      clusterKeys.splice(mergeB, 1);
    }

    // ─── Phase 3: OSRM Travel Time Matrix (Best-effort) ───
    // สร้าง travel time matrix จาก OSRM สำหรับทุกจุด (depot + items)
    let osrmMatrix = null;
    let osrmPointsMap = null; // map from list_id -> index in matrix
    try {
      const allPoints = [DEPOT, ...items];
      if (allPoints.length <= 25) {
        const matrix = await fetchOsrmTravelTimeMatrix(allPoints);
        if (matrix) {
          osrmMatrix = matrix;
          osrmPointsMap = new Map();
          osrmPointsMap.set('DEPOT', 0);
          items.forEach((item, idx) => osrmPointsMap.set(String(item.list_id), idx + 1));
        }
      }
    } catch (osrmErr) {
      console.warn('OSRM matrix fetch skipped:', osrmErr.message || osrmErr);
    }

    /**
     * Get travel time between two points (minutes)
     * ใช้ OSRM matrix ถ้ามี มิฉะนั้น fallback เป็น Haversine + speed estimate
     * (พิกัดเดียวกัน / สถานที่เดียวกัน = 0 นาที)
     */
    function getTravelMinutes(fromId, fromLat, fromLng, toId, toLat, toLng) {
      if (
        (fromId && fromId === toId) ||
        (fromLat === toLat && fromLng === toLng) ||
        (Math.abs(fromLat - toLat) < 0.00002 && Math.abs(fromLng - toLng) < 0.00002)
      ) {
        return 0;
      }

      if (osrmMatrix && osrmPointsMap) {
        const fromIdx = osrmPointsMap.get(fromId);
        const toIdx = osrmPointsMap.get(toId);
        if (fromIdx !== undefined && toIdx !== undefined) {
          const seconds = osrmMatrix[fromIdx][toIdx];
          if (seconds !== null && seconds !== undefined && seconds >= 0) {
            return Math.round(seconds / 60);
          }
        }
      }
      // Fallback: Haversine + speed estimate
      const distKm = haversineKm(fromLat, fromLng, toLat, toLng);
      return estimateTravelMinutes(distKm);
    }

    // ─── Phase 1+2: Build Routes with Nearest Neighbor + 2-opt + Clustering ───
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
    
    // Track vehicle route states
    const vehicleRouteStates = selectedVehicles.map((vehicle) => ({
      vehicle,
      vehicleCap: vehicle.capacity,
      routeStops: [],
      currentLoad: 0,
      currentPos: { lat: DEPOT.lat, lng: DEPOT.lng }
    }));

    const assignedItemIds = new Set();

    // Pass 1: Primary Cluster-based Allocation
    for (let vIdx = 0; vIdx < vehicleRouteStates.length; vIdx++) {
      const state = vehicleRouteStates[vIdx];
      let clusterItems = [];
      if (vIdx < clusterKeys.length) {
        clusterItems = clusterGroups[clusterKeys[vIdx]] || [];
      }

      let remainingClusterItems = clusterItems.filter((i) => !assignedItemIds.has(i.list_id));

      while (remainingClusterItems.length > 0) {
        let nearestIdx = -1;
        let minMetric = Infinity;

        if (effectivePriority === 'order_fifo') {
          for (let i = 0; i < remainingClusterItems.length; i++) {
            if (state.currentLoad + remainingClusterItems[i].quantity <= state.vehicleCap) {
              nearestIdx = i;
              break;
            }
          }
        } else {
          for (let i = 0; i < remainingClusterItems.length; i++) {
            const item = remainingClusterItems[i];
            if (state.currentLoad + item.quantity <= state.vehicleCap) {
              let metric;
              if (effectivePriority === 'fastest_time') {
                metric = getTravelMinutes(
                  state.routeStops.length === 0 ? 'DEPOT' : String(state.routeStops[state.routeStops.length - 1].list_id),
                  state.currentPos.lat, state.currentPos.lng,
                  String(item.list_id), item.lat, item.lng
                );
              } else {
                metric = haversineKm(state.currentPos.lat, state.currentPos.lng, item.lat, item.lng);
              }
              if (metric < minMetric) {
                minMetric = metric;
                nearestIdx = i;
              }
            }
          }
        }

        if (nearestIdx === -1) break;

        const pickedItem = remainingClusterItems[nearestIdx];
        state.routeStops.push(pickedItem);
        state.currentLoad += pickedItem.quantity;
        state.currentPos = { lat: pickedItem.lat, lng: pickedItem.lng };
        assignedItemIds.add(pickedItem.list_id);
        remainingClusterItems.splice(nearestIdx, 1);
      }
    }

    // Pass 2: Reallocate ALL leftover unassigned items to ANY vehicle with remaining capacity
    let leftoverItems = items.filter((i) => !assignedItemIds.has(i.list_id));

    if (leftoverItems.length > 0) {
      let progressMade = true;
      while (progressMade && leftoverItems.length > 0) {
        progressMade = false;

        for (const state of vehicleRouteStates) {
          if (state.currentLoad >= state.vehicleCap) continue;

          let bestIdx = -1;
          let minMetric = Infinity;

          for (let i = 0; i < leftoverItems.length; i++) {
            const item = leftoverItems[i];
            if (state.currentLoad + item.quantity <= state.vehicleCap) {
              const metric = haversineKm(state.currentPos.lat, state.currentPos.lng, item.lat, item.lng);
              if (metric < minMetric) {
                minMetric = metric;
                bestIdx = i;
              }
            }
          }

          if (bestIdx !== -1) {
            const pickedItem = leftoverItems[bestIdx];
            state.routeStops.push(pickedItem);
            state.currentLoad += pickedItem.quantity;
            state.currentPos = { lat: pickedItem.lat, lng: pickedItem.lng };
            assignedItemIds.add(pickedItem.list_id);
            leftoverItems.splice(bestIdx, 1);
            progressMade = true;
          }
        }
      }
    }

    // Pass 3: Safety Fallback for any remaining item if total capacity is sufficient
    if (leftoverItems.length > 0) {
      for (const item of leftoverItems) {
        const bestVehicleState = vehicleRouteStates.reduce((prev, curr) =>
          curr.vehicleCap - curr.currentLoad > prev.vehicleCap - prev.currentLoad ? curr : prev
        , vehicleRouteStates[0]);

        if (bestVehicleState) {
          bestVehicleState.routeStops.push(item);
          bestVehicleState.currentLoad += item.quantity;
          assignedItemIds.add(item.list_id);
        }
      }
    }

    const createdRoutes = [];

    for (let vIdx = 0; vIdx < vehicleRouteStates.length; vIdx++) {
      const state = vehicleRouteStates[vIdx];
      const vehicle = state.vehicle;
      const routeStops = state.routeStops;
      const currentLoad = state.currentLoad;

      if (routeStops.length === 0) continue;

      // ─── 2-opt Route Improvement ───
      // ไม่ทำ 2-opt สำหรับ FIFO mode (ต้องรักษาลำดับเดิม)
      let optimizedStops = routeStops;
      if (effectivePriority !== 'order_fifo' && routeStops.length >= 3) {
        optimizedStops = twoOptImprove(routeStops, DEPOT);
      }

      // ─── Save to DB ───
      const groupName = `Auto-Route${String(createdRoutes.length + 1).padStart(3, '0')}`;
      const groupColor = colors[createdRoutes.length % colors.length];

      const groupRes = await query(
        `INSERT INTO group_store (group_store_name, group_color, car_id, load1, date, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [groupName, groupColor, vehicle.car_id, currentLoad, targetDate]
      );
      const newGroupId = groupRes.insertId;

      // ─── Calculate ETAs (ใช้ OSRM duration หรือ Haversine + variable speed) ───
      let currentMinutes = 8 * 60; // default 08:00
      if (req.body.depotStartTime && typeof req.body.depotStartTime === 'string' && req.body.depotStartTime.includes(':')) {
        const parts = req.body.depotStartTime.split(':');
        currentMinutes = (parseInt(parts[0], 10) || 8) * 60 + (parseInt(parts[1], 10) || 0);
      }

      // เพิ่ม buffer time ก่อนออกเดินทาง (เวลาเตรียมตัวรถ)
      currentMinutes += bufferTimeMins;

      const serviceTimeMins = parseInt(req.body.serviceTimeMinutes || 10, 10);
      let prevId = 'DEPOT';
      let prevPos = { lat: DEPOT.lat, lng: DEPOT.lng };
      let totalDistKm = 0;

      for (let orderIndex = 0; orderIndex < optimizedStops.length; orderIndex++) {
        const item = optimizedStops[orderIndex];

        const travelMins = getTravelMinutes(prevId, prevPos.lat, prevPos.lng, String(item.list_id), item.lat, item.lng);
        const legDistKm = haversineKm(prevPos.lat, prevPos.lng, item.lat, item.lng);
        totalDistKm += legDistKm;

        currentMinutes += travelMins;

        const hh = String(Math.floor(currentMinutes / 60) % 24).padStart(2, '0');
        const mm = String(currentMinutes % 60).padStart(2, '0');
        const scheduledTimeStr = `${hh}:${mm}:00`;

        await query(
          `UPDATE list_store
           SET group_store_id = ?,
               row_order = ?,
               scheduled_time = ?,
               priority = COALESCE(priority, 'medium'),
               status = 'in_progress'
           WHERE list_id = ?`,
          [newGroupId, orderIndex + 1, scheduledTimeStr, item.list_id]
        );

        currentMinutes += serviceTimeMins;
        prevId = String(item.list_id);
        prevPos = { lat: item.lat, lng: item.lng };
      }

      // คำนวณเวลากลับ Depot
      const returnTravelMins = getTravelMinutes(prevId, prevPos.lat, prevPos.lng, 'DEPOT', DEPOT.lat, DEPOT.lng);
      const returnDistKm = haversineKm(prevPos.lat, prevPos.lng, DEPOT.lat, DEPOT.lng);
      totalDistKm += returnDistKm;
      const estReturnMinutes = currentMinutes + returnTravelMins;
      const returnHh = String(Math.floor(estReturnMinutes / 60) % 24).padStart(2, '0');
      const returnMm = String(estReturnMinutes % 60).padStart(2, '0');

      createdRoutes.push({
        group_store_id: newGroupId,
        group_store_name: groupName,
        vehiclePlate: vehicle.license_plate,
        stopsCount: optimizedStops.length,
        totalQuantity: currentLoad,
        totalDistanceKm: Math.round(totalDistKm * 10) / 10,
        estimatedReturnTime: `${returnHh}:${returnMm}`,
        usedOsrm: !!osrmMatrix
      });
    }

    const totalDist = createdRoutes.reduce((s, r) => s + (r.totalDistanceKm || 0), 0);
    const algorithmUsed = osrmMatrix ? 'K-means + Nearest Neighbor + 2-opt + OSRM' : 'K-means + Nearest Neighbor + 2-opt + Haversine';

    res.json({
      success: true,
      message: `คำนวณจัดสายรถสำเร็จ! สร้าง ${createdRoutes.length} สายจัดส่ง (ระยะทางรวม ~${Math.round(totalDist)} km) | Algorithm: ${algorithmUsed}`,
      createdRoutes,
      summary: {
        totalRoutes: createdRoutes.length,
        totalDistanceKm: Math.round(totalDist * 10) / 10,
        algorithm: algorithmUsed,
        strategy: effectivePriority,
        usedOsrm: !!osrmMatrix
      }
    });
  } catch (err) {
    console.error('POST /auto-route error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
