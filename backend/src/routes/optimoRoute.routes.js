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
          { stopId: 1, locationNo: 'OR-00001', storeName: 'ร้านค้า A - สุขุมวิท', address: '123 ถ.สุขุมวิท แขวงคลองเตย', lat: baseLat + 0.012, lng: baseLng + 0.025, arrivalTime: '08:15', departureTime: '08:35', status: 'completed', type: 'delivery', quantity: 65 },
          { stopId: 2, locationNo: 'OR-00002', storeName: 'ร้านค้า B - สีลม', address: '456 ถ.สีลม แขวงสุริยวงศ์', lat: baseLat - 0.008, lng: baseLng + 0.012, arrivalTime: '09:00', departureTime: '09:20', status: 'completed', type: 'delivery', quantity: 50 },
          { stopId: 3, locationNo: 'OR-00003', storeName: 'ร้านค้า C - ลาดพร้าว', address: '789 ถ.ลาดพร้าว แขวงจอมพล', lat: baseLat + 0.035, lng: baseLng + 0.008, arrivalTime: '10:00', departureTime: '10:25', status: 'in_progress', type: 'delivery', quantity: 70 },
          { stopId: 4, locationNo: 'OR-00004', storeName: 'ร้านค้า D - รัชดา', address: '101 ถ.รัชดาภิเษก แขวงดินแดง', lat: baseLat + 0.025, lng: baseLng - 0.005, arrivalTime: '11:00', departureTime: '11:15', status: 'planned', type: 'delivery', quantity: 60 },
          { stopId: 5, locationNo: 'OR-00005', storeName: 'ร้านค้า E - บางนา', address: '202 ถ.บางนาตราด แขวงบางนา', lat: baseLat - 0.015, lng: baseLng + 0.045, arrivalTime: '12:00', departureTime: '12:20', status: 'planned', type: 'delivery', quantity: 60 },
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
          { stopId: 1, locationNo: 'OR-00006', storeName: 'ร้านค้า F - พระราม 9', address: '111 ถ.พระราม 9 แขวงห้วยขวาง', lat: baseLat + 0.018, lng: baseLng + 0.018, arrivalTime: '08:30', departureTime: '08:50', status: 'completed', type: 'delivery', quantity: 55 },
          { stopId: 2, locationNo: 'OR-00007', storeName: 'ร้านค้า G - อ่อมน้อย', address: '222 ถ.เพชรเกษม อ.กระทุ่มแบน', lat: baseLat - 0.025, lng: baseLng - 0.035, arrivalTime: '09:45', departureTime: '10:05', status: 'completed', type: 'delivery', quantity: 60 },
          { stopId: 3, locationNo: 'OR-00008', storeName: 'ร้านค้า H - มหาชัย', address: '333 ถ.เอกชัย จ.สมุทรสาคร', lat: baseLat - 0.040, lng: baseLng - 0.020, arrivalTime: '10:45', departureTime: '11:05', status: 'in_progress', type: 'delivery', quantity: 61 },
          { stopId: 4, locationNo: 'OR-00009', storeName: 'ร้านค้า I - พุทธมณฑล', address: '444 ถ.พุทธมณฑลสาย 4 อ.พุทธมณฑล', lat: baseLat + 0.005, lng: baseLng - 0.048, arrivalTime: '11:45', departureTime: '12:05', status: 'planned', type: 'delivery', quantity: 60 },
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
          { stopId: 1, locationNo: 'OR-00010', storeName: 'ร้านค้า J - นนทบุรี', address: '555 ถ.รัตนาธิเบศร์ จ.นนทบุรี', lat: baseLat + 0.045, lng: baseLng - 0.010, arrivalTime: '09:00', departureTime: '09:25', status: 'completed', type: 'delivery', quantity: 45 },
          { stopId: 2, locationNo: 'OR-00011', storeName: 'ร้านค้า K - ปทุมธานี', address: '666 ถ.รังสิต-นครนายก จ.ปทุมธานี', lat: baseLat + 0.065, lng: baseLng + 0.015, arrivalTime: '10:15', departureTime: '10:40', status: 'planned', type: 'delivery', quantity: 50 },
          { stopId: 3, locationNo: 'OR-00012', storeName: 'ร้านค้า L - มีนบุรี', address: '777 ถ.สุวินทวงศ์ แขวงมีนบุรี', lat: baseLat + 0.020, lng: baseLng + 0.060, arrivalTime: '11:30', departureTime: '11:50', status: 'planned', type: 'delivery', quantity: 55 },
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
          gs.date AS group_date,
          ls.list_id,
          ls.store_id,
          ls.row_order,
          ls.sum_quantity,
          ls.lat_long,
          ls.store_name_result,
          ls.created_at,
          s.store_name,
          s.store_address,
          s.store_location,
          s.telephone_number,
          COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate
        FROM group_store gs
        LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
        LEFT JOIN store s ON ls.store_id = s.store_id
        LEFT JOIN car_release cr ON cr.group_store_id = gs.group_store_id
        LEFT JOIN car c ON (c.car_id = gs.car_id OR c.ID = gs.car_id OR c.license_plate = gs.car_id OR cr.car_id = c.car_id)
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
            ls.list_id,
            ls.store_id,
            ls.row_order,
            ls.sum_quantity,
            ls.lat_long,
            ls.store_name_result,
            ls.created_at,
            s.store_name,
            s.store_address,
            s.store_location,
            s.telephone_number,
            COALESCE(c.license_plate, gs.car_id, '-') AS vehicle_plate
          FROM group_store gs
          LEFT JOIN list_store ls ON ls.group_store_id = gs.group_store_id
          LEFT JOIN store s ON ls.store_id = s.store_id
          LEFT JOIN car c ON (c.car_id = gs.car_id OR c.license_plate = gs.car_id)
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
          orderNo: row.store_id,
          locationNo: row.store_id,
          storeName: row.store_name_result || row.store_name || `ร้านค้า ${row.store_id}`,
          address: row.store_address || '',
          quantity: row.sum_quantity || 0,
          lat,
          lng,
          lat_long: locStr || (lat && lng ? `${lat},${lng}` : null),
          arrivalTime: '',
          departureTime: '',
          status: 'planned',
          type: grp.stops.length === 0 ? 'depot' : 'delivery'
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

    let totalStopsCount = 0;
    const previewRoutes = routeData.map((r, rIdx) => {
      const routeNoStr = String(rIdx + 1).padStart(3, '0');
      const groupName = r.groupStoreName || r.group_store_name || `Optimo Routes-${routeNoStr}`;
      const color = r.color || r.group_color || '#3b82f6';
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
        const storeName = stop.storeName || stop.name || stop.locationName || `ร้านค้า ${targetStoreId}`;
        const quantity = stop.quantity || stop.sum_quantity || stop.numOrders || 0;

        return {
          rowOrder: sIdx + 1,
          locationNo: targetStoreId,
          storeName,
          address: stop.address || stop.location || '',
          quantity,
          lat,
          lng,
          lat_long: storeLocation
        };
      });

      totalStopsCount += stops.length;

      const vehicleVal = r.vehicleLabel || r.vehiclePlate || r.car_id || r.car || r.vehicle || '-';
      return {
        groupStoreName: groupName,
        groupColor: color,
        driverName: r.driverName || r.driver || `คนขับ ${rIdx + 1}`,
        vehiclePlate: vehicleVal,
        vehicleLabel: vehicleVal,
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

    let routeData = [];

    // 1. ดึงข้อมูลจาก OptimoRoute API หรือใช้ Mock Data
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

    let importedGroups = 0;
    let importedStores = 0;
    let importedListStores = 0;

    for (let rIdx = 0; rIdx < routeData.length; rIdx++) {
      const r = routeData[rIdx];

      // 1. ตรวจสอบ/สร้าง group_store (รูปแบบชื่อ Optimo Routes-001, Optimo Routes-002)
      let groupStoreId;
      const routeNoStr = String(rIdx + 1).padStart(3, '0');
      const groupName = r.groupStoreName || r.group_store_name || `Optimo Routes-${routeNoStr}`;
      const groupColor = r.color || r.group_color || '#3b82f6';
      const vehicleVal = r.vehicleLabel || r.vehiclePlate || r.car_id || r.car || r.vehicle || r.driverName || r.driver || '';

      const existingGroup = await query(
        `SELECT group_store_id FROM group_store WHERE group_store_name = ? AND (date = ? OR date IS NULL)`,
        [groupName, targetDate]
      );

      if (existingGroup.length > 0) {
        groupStoreId = existingGroup[0].group_store_id;
        try {
          await query(
            `UPDATE group_store SET car_id = ?, date = ? WHERE group_store_id = ?`,
            [vehicleVal, targetDate, groupStoreId]
          );
        } catch (eUp) {
          console.warn('Update group_store import warning:', eUp.message);
        }
      } else {
        let newGroup;
        try {
          newGroup = await query(
            `INSERT INTO group_store (group_store_name, group_color, car_id, date) VALUES (?, ?, ?, ?)`,
            [groupName, groupColor, vehicleVal, targetDate]
          );
        } catch (eInsert) {
          try {
            newGroup = await query(
              `INSERT INTO group_store (group_store_name, group_color, car_id) VALUES (?, ?, ?)`,
              [groupName, groupColor, vehicleVal]
            );
          } catch (eInsert2) {
            newGroup = await query(
              `INSERT INTO group_store (group_store_name, group_color) VALUES (?, ?)`,
              [groupName, groupColor]
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

        // บันทึกลง list_store (รวม sum_quantity)
        const rowOrder = sIdx + 1;
        const existingList = await query(
          `SELECT list_id FROM list_store WHERE group_store_id = ? AND row_order = ? AND DATE(created_at) = ?`,
          [groupStoreId, rowOrder, targetDate]
        );

        if (existingList.length === 0) {
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
          importedListStores++;
        } else {
          await query(
            `UPDATE list_store SET store_id = ?, sum_quantity = ?, lat_long = ?, store_name_result = ? WHERE list_id = ?`,
            [storeId, quantity, storeLocation, storeName, existingList[0].list_id]
          );
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
    const insertRes = await query(
      `INSERT INTO list_store (store_id, group_store_id, row_order, sum_quantity, lat_long, store_name_result, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [targetStoreId, group_store_id, rowOrderNum, quantityNum, lat_long || null, storeNameResult, `${targetDate} 08:00:00`]
    );

    res.json({
      success: true,
      message: 'เพิ่มรายการจุดจัดส่งเรียบร้อยแล้ว',
      list_id: insertRes.insertId,
      store_id: targetStoreId,
      group_store_id,
      row_order: rowOrderNum
    });
  } catch (err) {
    console.error('POST /stops error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
