const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// =========================================================
// OptimoRoute API Proxy
// =========================================================

// Mock data สำหรับทดสอบ UI ก่อนใส่ API Key จริง
function getMockRoutes(date) {
  // จุดศูนย์กลาง — กรุงเทพฯ
  const baseLat = 13.7563;
  const baseLng = 100.5018;

  return {
    success: true,
    date,
    source: 'mock',
    routes: [
      {
        routeId: 'ROUTE-001',
        groupStoreName: 'Optimo Routes-001',
        driverName: 'สมชาย ใจดี',
        vehiclePlate: 'กข-1234',
        color: '#3b82f6',
        totalStops: 5,
        stops: [
          { stopId: 1, locationNo: 'OR-00001', orderNo: 'ORD-20260724-001', data_store_no: 'ORD-20260724-001', storeName: 'ร้านค้า A - สุขุมวิท', address: '123 ถ.สุขุมวิท แขวงคลองเตย', lat: baseLat + 0.012, lng: baseLng + 0.025, arrivalTime: '08:15', departureTime: '08:35', status: 'completed', type: 'delivery', quantity: 65 },
          { stopId: 2, locationNo: 'OR-00002', orderNo: 'ORD-20260724-002', data_store_no: 'ORD-20260724-002', storeName: 'ร้านค้า B - สีลม', address: '456 ถ.สีลม แขวงสุริยวงศ์', lat: baseLat - 0.008, lng: baseLng + 0.012, arrivalTime: '09:00', departureTime: '09:20', status: 'completed', type: 'delivery', quantity: 50 },
          { stopId: 3, locationNo: 'OR-00003', orderNo: 'ORD-20260724-003', data_store_no: 'ORD-20260724-003', storeName: 'ร้านค้า C - ลาดพร้าว', address: '789 ถ.ลาดพร้าว แขวงจอมพล', lat: baseLat + 0.035, lng: baseLng + 0.008, arrivalTime: '10:00', departureTime: '10:25', status: 'in_progress', type: 'delivery', quantity: 70 },
          { stopId: 4, locationNo: 'OR-00004', orderNo: 'ORD-20260724-004', data_store_no: 'ORD-20260724-004', storeName: 'ร้านค้า D - รัชดา', address: '101 ถ.รัชดาภิเษก แขวงดินแดง', lat: baseLat + 0.025, lng: baseLng - 0.005, arrivalTime: '11:00', departureTime: '11:15', status: 'planned', type: 'delivery', quantity: 60 },
          { stopId: 5, locationNo: 'OR-00005', orderNo: 'ORD-20260724-005', data_store_no: 'ORD-20260724-005', storeName: 'ร้านค้า E - บางนา', address: '202 ถ.บางนาตราด แขวงบางนา', lat: baseLat - 0.015, lng: baseLng + 0.045, arrivalTime: '12:00', departureTime: '12:20', status: 'planned', type: 'delivery', quantity: 60 },
        ]
      },
      {
        routeId: 'ROUTE-002',
        groupStoreName: 'Optimo Routes-002',
        driverName: 'สมหญิง รักงาน',
        vehiclePlate: 'ขค-5678',
        color: '#10b981',
        totalStops: 4,
        stops: [
          { stopId: 1, locationNo: 'OR-00006', orderNo: 'ORD-20260724-006', data_store_no: 'ORD-20260724-006', storeName: 'ร้านค้า F - พระราม 9', address: '111 ถ.พระราม 9 แขวงห้วยขวาง', lat: baseLat + 0.018, lng: baseLng + 0.018, arrivalTime: '08:30', departureTime: '08:50', status: 'completed', type: 'delivery', quantity: 55 },
          { stopId: 2, locationNo: 'OR-00007', orderNo: 'ORD-20260724-007', data_store_no: 'ORD-20260724-007', storeName: 'ร้านค้า G - อ่อมน้อย', address: '222 ถ.เพชรเกษม อ.กระทุ่มแบน', lat: baseLat - 0.025, lng: baseLng - 0.035, arrivalTime: '09:45', departureTime: '10:05', status: 'completed', type: 'delivery', quantity: 60 },
          { stopId: 3, locationNo: 'OR-00008', orderNo: 'ORD-20260724-008', data_store_no: 'ORD-20260724-008', storeName: 'ร้านค้า H - มหาชัย', address: '333 ถ.เอกชัย จ.สมุทรสาคร', lat: baseLat - 0.040, lng: baseLng - 0.020, arrivalTime: '10:45', departureTime: '11:05', status: 'in_progress', type: 'delivery', quantity: 61 },
          { stopId: 4, locationNo: 'OR-00009', orderNo: 'ORD-20260724-009', data_store_no: 'ORD-20260724-009', storeName: 'ร้านค้า I - พุทธมณฑล', address: '444 ถ.พุทธมณฑลสาย 4 อ.พุทธมณฑล', lat: baseLat + 0.005, lng: baseLng - 0.048, arrivalTime: '11:45', departureTime: '12:05', status: 'planned', type: 'delivery', quantity: 60 },
        ]
      },
      {
        routeId: 'ROUTE-003',
        groupStoreName: 'Optimo Routes-003',
        driverName: 'วิชัย เก่งมาก',
        vehiclePlate: 'คง-9012',
        color: '#f59e0b',
        totalStops: 3,
        stops: [
          { stopId: 1, locationNo: 'OR-00010', orderNo: 'ORD-20260724-010', data_store_no: 'ORD-20260724-010', storeName: 'ร้านค้า J - นนทบุรี', address: '555 ถ.รัตนาธิเบศร์ จ.นนทบุรี', lat: baseLat + 0.045, lng: baseLng - 0.010, arrivalTime: '09:00', departureTime: '09:25', status: 'completed', type: 'delivery', quantity: 45 },
          { stopId: 2, locationNo: 'OR-00011', orderNo: 'ORD-20260724-011', data_store_no: 'ORD-20260724-011', storeName: 'ร้านค้า K - ปทุมธานี', address: '666 ถ.รังสิต-นครนายก จ.ปทุมธานี', lat: baseLat + 0.065, lng: baseLng + 0.015, arrivalTime: '10:15', departureTime: '10:40', status: 'planned', type: 'delivery', quantity: 50 },
          { stopId: 3, locationNo: 'OR-00012', orderNo: 'ORD-20260724-012', data_store_no: 'ORD-20260724-012', storeName: 'ร้านค้า L - มีนบุรี', address: '777 ถ.สุวินทวงศ์ แขวงมีนบุรี', lat: baseLat + 0.020, lng: baseLng + 0.060, arrivalTime: '11:30', departureTime: '11:50', status: 'planned', type: 'delivery', quantity: 55 },
        ]
      }
    ]
  };
}

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
          ls.list_id,
          ls.data_store_no,
          ls.store_id,
          ls.row_order,
          ls.sum_quantity,
          ls.lat_long,
          ls.store_name_result,
          ls.status,
          ls.created_at,
          s.store_name,
          s.store_address,
          s.store_location,
          s.telephone_number,
          COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate,
          c.quantity AS vehicle_capacity
        FROM group_store gs
        LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
        LEFT JOIN store s ON ls.store_id = s.store_id
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
            ls.list_id,
            ls.data_store_no,
            ls.store_id,
            ls.row_order,
            ls.sum_quantity,
            ls.lat_long,
            ls.store_name_result,
            ls.status,
            ls.created_at,
            s.store_name,
            s.store_address,
            s.store_location,
            s.telephone_number,
            COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate,
            c.quantity AS vehicle_capacity
          FROM group_store gs
          LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
          LEFT JOIN store s ON ls.store_id = s.store_id
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

    rows.forEach((row) => {
      const gId = row.group_store_id;
      if (!groupMap.has(gId)) {
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
          rowOrder: row.row_order || grp.stops.length + 1,
          row_order: row.row_order || grp.stops.length + 1,
          orderNo: row.data_store_no || row.store_id || '-',
          data_store_no: row.data_store_no || row.store_id || '-',
          locationNo: row.store_id,
          storeName: row.store_name_result || row.store_name || `ร้านค้า ${row.store_id}`,
          address: row.store_address || '',
          quantity: row.sum_quantity || 0,
          lat,
          lng,
          lat_long: locStr || (lat && lng ? `${lat},${lng}` : null),
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
    const apiKey = process.env.OPTIMOROUTE_API_KEY;
    const targetDate = req.body.date || new Date().toISOString().slice(0, 10);

    let routeData = [];
    let source = 'mock';

    // 1. ดึงข้อมูลจาก OptimoRoute API หรือใช้ Mock Data
    if (apiKey && apiKey.trim() !== '') {
      try {
        const apiUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${targetDate}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (response.ok && data.routes) {
          routeData = data.routes;
          source = 'api';
        }
      } catch (e) {
        console.warn('Fetch OptimoRoute API error during preview:', e.message);
      }
    }

    if (!routeData || routeData.length === 0) {
      routeData = getMockRoutes(targetDate).routes;
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
      source,
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
    const apiKey = process.env.OPTIMOROUTE_API_KEY;
    const targetDate = req.body.date || new Date().toISOString().slice(0, 10);

    let routeData = req.body.routes || [];

    // 1. ดึงข้อมูลจาก OptimoRoute API หรือใช้ Mock Data หากไม่มีการส่ง routes จาก preview
    if (!routeData || routeData.length === 0) {
      if (apiKey && apiKey.trim() !== '') {
        try {
          const apiUrl = `https://api.optimoroute.com/v1/get_routes?key=${apiKey}&date=${targetDate}`;
          const response = await fetch(apiUrl);
          const data = await response.json();
          if (response.ok && data.routes) {
            routeData = data.routes;
          }
        } catch (e) {
          console.warn('Fetch OptimoRoute API error during import:', e.message);
        }
      }

      if (!routeData || routeData.length === 0) {
        routeData = getMockRoutes(targetDate).routes;
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
              `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, created_by, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                storeId,
                groupStoreId,
                rowOrder,
                quantity,
                storeLocation,
                storeName,
                orderNo,
                req.user ? req.user.user_id : 1,
                `${targetDate} 00:00:00`
              ]
            );
          } catch (eIns) {
            await query(
              `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, created_by, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                storeId,
                groupStoreId,
                rowOrder,
                quantity,
                storeLocation,
                storeName,
                req.user ? req.user.user_id : 1,
                `${targetDate} 00:00:00`
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
      store_name,
      address,
      row_order,
      sum_quantity,
      lat_long,
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
    const targetOrderNo = data_store_no || orderNo || null;

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

    // บันทึกลง list_store
    let insertRes;
    try {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, targetOrderNo, `${targetDate} 08:00:00`]
      );
    } catch (eIns) {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, `${targetDate} 08:00:00`]
      );
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
      status
    } = req.body;

    const rowOrderNum = row_order ? parseInt(row_order, 10) : 1;
    const quantityNum = sum_quantity !== undefined ? parseInt(sum_quantity, 10) : 1;
    const targetOrderNo = data_store_no || orderNo || null;

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

    // อัปเดตข้อมูลใน list_store
    try {
      await query(
        `UPDATE list_store
         SET group_store_id = COALESCE(?, group_store_id),
             store_id = COALESCE(?, store_id),
             row_order = ?,
             sum_quantity = ?,
             lat_long = ?,
             store_name_result = ?,
             data_store_no = ?,
             status = COALESCE(?, status)
         WHERE list_id = ?`,
        [group_store_id || null, store_id || null, rowOrderNum, quantityNum, lat_long || null, store_name || null, targetOrderNo, status || null, listId]
      );
    } catch (eUp) {
      await query(
        `UPDATE list_store
         SET group_store_id = COALESCE(?, group_store_id),
             store_id = COALESCE(?, store_id),
             row_order = ?,
             sum_quantity = ?,
             lat_long = ?,
             store_name_result = ?,
             status = COALESCE(?, status)
         WHERE list_id = ?`,
        [group_store_id || null, store_id || null, rowOrderNum, quantityNum, lat_long || null, store_name || null, status || null, listId]
      );
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
    const token = process.env.GPS_API_TOKEN || '13dade62-5bd6-4082-b0ce-36757dec0d47';
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
        ls.created_at,
        s.store_name,
        s.store_address,
        s.store_location,
        s.telephone_number
      FROM list_store ls
      LEFT JOIN store s ON ls.store_id = s.store_id
      WHERE (ls.group_store_id IS NULL OR ls.group_store_id = 0)
        AND (DATE_FORMAT(ls.created_at, '%Y-%m-%d') = ? OR ? IS NULL)
      ORDER BY ls.list_id DESC`,
      [targetDate, targetDate]
    );

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
      date
    } = req.body;

    let targetStoreId = store_id ? String(store_id).trim() : `ST-${Date.now().toString().slice(-6)}`;
    const storeNameResult = store_name || `ร้านค้า ${targetStoreId}`;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const quantityNum = sum_quantity ? parseInt(sum_quantity, 10) : 1;
    const targetOrderNo = data_store_no || orderNo || `ORD-${Date.now().toString().slice(-6)}`;

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

    let insertRes;
    try {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, status, created_at)
         VALUES (?, NULL, NULL, ?, ?, ?, ?, 'unassigned', ?)`,
        [targetStoreId, quantityNum, lat_long || null, storeNameResult, targetOrderNo, `${targetDate} 08:00:00`]
      );
    } catch (eIns) {
      insertRes = await query(
        `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, status, created_at)
         VALUES (?, NULL, NULL, ?, ?, ?, 'unassigned', ?)`,
        [targetStoreId, quantityNum, lat_long || null, storeNameResult, `${targetDate} 08:00:00`]
      );
    }

    res.json({
      success: true,
      message: 'สร้างรายการจัดส่ง (ยังไม่จัดสาย) สำเร็จ',
      list_id: insertRes.insertId
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

      try {
        await query(
          `INSERT INTO store (store_id, store_name, store_address, store_location)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE store_name = VALUES(store_name), store_address = VALUES(store_address), store_location = VALUES(store_location)`,
          [storeId, storeName, address || null, latLong || null]
        );
      } catch (eStore) {}

      try {
        await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, data_store_no, status, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, ?, 'unassigned', ?)`,
          [storeId, quantity, latLong || null, storeName, orderNo, `${targetDate} 08:00:00`]
        );
      } catch (eIns) {
        await query(
          `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, status, created_at)
           VALUES (?, NULL, NULL, ?, ?, ?, 'unassigned', ?)`,
          [storeId, quantity, latLong || null, storeName, `${targetDate} 08:00:00`]
        );
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

// POST /api/optimoroute/auto-route
// ระบบคำนวณจัดสายรถอัตโนมัติ (เริ่มจากคลังสินค้า 17.1266642, 102.9635667 + ตรวจความจุรถ + ห้ามใช้ซ้ำวัน)
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

    // กรองเอารถที่ยังไม่ถูกใช้ในวันนี้
    const availableVehicleIds = (selectedVehicleIds || []).filter(
      (id) => !alreadyAssignedCarIds.has(String(id))
    );

    if (availableVehicleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาเลือกรถขนส่งสำหรับคำนวณจัดสาย (รถที่เลือกถูกนำไปจัดสายในวันนี้แล้ว)'
      });
    }

    // ดึงข้อมูลความจุ (quantity / max_load) ของรถแต่ละคันที่เลือกรวม
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

    // 3. แจ้งเตือนหากความจุของรถที่เลือกรับสินค้าทั้งหมดไม่พอ
    if (totalUnassignedQuantity > totalSelectedCapacity) {
      return res.status(400).json({
        success: false,
        message: `รถที่เลือก รับได้ไม่พอ! (ต้องการบรรจุ ${totalUnassignedQuantity} ลัง แต่รถที่เลือกรองรับได้รวม ${totalSelectedCapacity} ลัง) กรุณาเลือกรถเพิ่มอีก`
      });
    }

    // 4. คำนวณจัดสายโดยเริ่มจากคลังสินค้า (17.1266642, 102.9635667) -> จุดที่ 1 -> จุดที่ 2...
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
    const createdRoutes = [];

    let remainingItems = [...items];

    for (let vIdx = 0; vIdx < selectedVehicles.length; vIdx++) {
      if (remainingItems.length === 0) break;

      const vehicle = selectedVehicles[vIdx];
      const vehicleCap = vehicle.capacity;
      const routeStops = [];
      let currentLoad = 0;
      let currentPos = { lat: DEPOT.lat, lng: DEPOT.lng };

      while (remainingItems.length > 0 && routeStops.length < maxStopsPerVehicle) {
        // หาจุดที่ใกล้ที่สุดจากตำแหน่งปัจจุบัน (เริ่มจาก DEPOT)
        let nearestIdx = -1;
        let minDist = Infinity;

        for (let i = 0; i < remainingItems.length; i++) {
          const item = remainingItems[i];
          if (currentLoad + item.quantity <= vehicleCap) {
            const dist = Math.hypot(item.lat - currentPos.lat, item.lng - currentPos.lng);
            if (dist < minDist) {
              minDist = dist;
              nearestIdx = i;
            }
          }
        }

        // หากไม่มีจุดใดใส่ลงรถคันนี้ได้แล้ว ให้จบคันนี้
        if (nearestIdx === -1) break;

        const pickedItem = remainingItems[nearestIdx];
        routeStops.push(pickedItem);
        currentLoad += pickedItem.quantity;
        currentPos = { lat: pickedItem.lat, lng: pickedItem.lng };
        remainingItems.splice(nearestIdx, 1);
      }

      if (routeStops.length > 0) {
        const groupName = `Optimo AutoRoute-${String(createdRoutes.length + 1).padStart(3, '0')}`;
        const groupColor = colors[createdRoutes.length % colors.length];

        const groupRes = await query(
          `INSERT INTO group_store (group_store_name, group_color, car_id, load1, date, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [groupName, groupColor, vehicle.car_id, currentLoad, targetDate]
        );
        const newGroupId = groupRes.insertId;

        for (let orderIndex = 0; orderIndex < routeStops.length; orderIndex++) {
          const item = routeStops[orderIndex];
          await query(
            `UPDATE list_store
             SET group_store_id = ?,
                 row_order = ?,
                 status = 'planned'
             WHERE list_id = ?`,
            [newGroupId, orderIndex + 1, item.list_id]
          );
        }

        createdRoutes.push({
          group_store_id: newGroupId,
          group_store_name: groupName,
          vehiclePlate: vehicle.license_plate,
          stopsCount: routeStops.length,
          totalQuantity: currentLoad
        });
      }
    }

    res.json({
      success: true,
      message: `คำนวณจัดสายรถสำเร็จ! สร้าง ${createdRoutes.length} สายจัดส่ง (เริ่มต้นจากคลังสินค้า 17.1266642, 102.9635667)`,
      createdRoutes
    });
  } catch (err) {
    console.error('POST /auto-route error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
