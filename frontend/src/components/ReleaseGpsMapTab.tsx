import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
} from "lucide-react";
import api, { fetchGpsDeviceLogs, getImageUrl } from "../services/api";

interface ReleaseGpsMapTabProps {
  release: any;
  stores: any[];
}

const getDepotCoordFromEnv = (): { lat: number; lng: number } => {
  const envVal = import.meta.env.VITE_HOME;
  if (envVal && typeof envVal === "string" && envVal.includes(",")) {
    const parts = envVal.split(",");
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: 17.128338, lng: 102.965199 };
};

const DEPOT_COORD = getDepotCoordFromEnv();

// ─── Custom Numbered & Status Marker ───
function createStopMarker(number: number, isDepot: boolean, status?: string) {
  const size = isDepot ? 30 : 26;
  const isCompleted =
    status === "completed" || status === "success" || status === "delivered";
  const isProblem = status === "problem" || status === "failed";

  let pinColor = "#3b82f6"; // Blue default
  let symbolText = String(number);
  let circleFill = "#ffffff";
  let textColor = "#3b82f6";

  if (isDepot) {
    pinColor = "#1e293b";
    symbolText = "★";
    textColor = "#1e293b";
  } else if (isCompleted) {
    pinColor = "#16a34a";
    symbolText = "✓";
    textColor = "#ffffff";
    circleFill = "#16a34a";
  } else if (isProblem) {
    pinColor = "#dc2626";
    symbolText = "!";
    textColor = "#ffffff";
    circleFill = "#dc2626";
  }

  const svg = isDepot
    ? `<svg width="${size}" height="${size + 8}" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 37 C15 37 28 22 28 14 C28 6.82 22.18 1 15 1 C7.82 1 2 6.82 2 14 C2 22 15 37 15 37Z" fill="${pinColor}" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="14" r="8" fill="white"/>
        <text x="15" y="18" text-anchor="middle" font-size="11" font-weight="900" fill="${pinColor}" font-family="system-ui">★</text>
      </svg>`
    : `<svg width="${size}" height="${size + 6}" viewBox="0 0 26 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 31 C13 31 24 19 24 12 C24 5.92 19.08 1 13 1 C6.92 1 2 5.92 2 12 C2 19 13 31 13 31Z" fill="${pinColor}" stroke="white" stroke-width="1.5"/>
        <circle cx="13" cy="12" r="7" fill="${circleFill}"/>
        <text x="13" y="${isCompleted ? 15.5 : 16}" text-anchor="middle" font-size="${isCompleted || isProblem ? 11 : number >= 10 ? 9 : 11}" font-weight="900" fill="${textColor}" font-family="system-ui">${symbolText}</text>
      </svg>`;

  return L.divIcon({
    className: "custom-pin-marker",
    html: svg,
    iconSize: [size, size + (isDepot ? 8 : 6)],
    iconAnchor: [size / 2, size + (isDepot ? 8 : 6)],
    popupAnchor: [0, -(size + (isDepot ? 8 : 6)) + 4],
  });
}

// ─── Custom Vehicle Live GPS Marker ───
function createGpsVehicleMarker(plate: string, isMoving: boolean = true) {
  const statusColor = isMoving ? "#10b981" : "#f59e0b";
  const svg = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35)); cursor: pointer;">
      <div style="background: #0f172a; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; font-family: system-ui, sans-serif; white-space: nowrap; border: 1.5px solid ${statusColor}; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 6px ${statusColor}; animate: pulse;"></span>
        <span>${plate}</span>
      </div>
      <div style="width: 32px; height: 32px; background: #ffffff; border-radius: 50%; border: 3px solid ${statusColor}; display: flex; items-center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-gps-vehicle-marker",
    html: svg,
    iconSize: [120, 50],
    iconAnchor: [60, 44],
    popupAnchor: [0, -44],
  });
}

function FitMapBounds({
  bounds,
  resetToken = 0,
}: {
  bounds: L.LatLngBoundsExpression | null;
  resetToken?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map, resetToken]);
  return null;
}

function FocusStopOnMap({
  target,
  markerRefs,
}: {
  target: { id: string; lat: number; lng: number } | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 16, { duration: 0.7 });
    const popupTimer = window.setTimeout(
      () => markerRefs.current[target.id]?.openPopup(),
      750,
    );
    return () => window.clearTimeout(popupTimer);
  }, [map, markerRefs, target]);

  return null;
}

const formatServiceTime = (value?: string) => {
  if (!value) return "-";
  if (!value.includes("T") && !value.includes("-")) return value.slice(0, 5);
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
};

const getActualDuration = (start?: string, end?: string) => {
  if (!start || !end) return "-";
  const duration = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(duration) || duration < 0) return "-";
  const seconds = Math.round(duration / 1000);
  return seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

export const ReleaseGpsMapTab: React.FC<ReleaseGpsMapTabProps> = ({
  release,
  stores,
}) => {
  const [roadPolyline, setRoadPolyline] = useState<[number, number][]>([]);
  const [loadingRoad, setLoadingRoad] = useState<boolean>(false);
  const [flyTarget, setFlyTarget] = useState<{
    id: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [mapResetToken, setMapResetToken] = useState(0);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Parse valid coordinates from stores
  const validStops = useMemo(() => {
    if (!Array.isArray(stores)) return [];
    return stores
      .map((st, idx) => {
        let lat = 0;
        let lng = 0;
        if (st.lat_long && typeof st.lat_long === "string") {
          const parts = st.lat_long
            .split(",")
            .map((p: any) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            lat = parts[0];
            lng = parts[1];
          }
        }
        return {
          ...st,
          order: st.row_order || idx + 1,
          lat,
          lng,
        };
      })
      .filter((st) => st.lat !== 0 && st.lng !== 0);
  }, [stores]);

  // Compute Vehicle Current Position (Simulated or Last Checked-in Store)
  const vehiclePosition = useMemo(() => {
    const checkedInStops = validStops.filter(
      (s) => s.check_in_id || s.check_out_id,
    );
    if (checkedInStops.length > 0) {
      const last = checkedInStops[checkedInStops.length - 1];
      return {
        lat: last.lat + 0.0015,
        lng: last.lng + 0.0015,
        stopName: last.store_name_result || last.store_name,
      };
    }
    if (validStops.length > 0) {
      return {
        lat: validStops[0].lat - 0.002,
        lng: validStops[0].lng - 0.002,
        stopName: "กำลังออกเดินทาง",
      };
    }
    return {
      lat: DEPOT_COORD.lat,
      lng: DEPOT_COORD.lng,
      stopName: "คลังสินค้าบริษัท",
    };
  }, [validStops]);

  // OSRM Road Geometry Fetch
  useEffect(() => {
    if (validStops.length === 0) {
      setRoadPolyline([]);
      return;
    }

    let isMounted = true;
    setLoadingRoad(true);

    const waypoints = [
      { lat: DEPOT_COORD.lat, lng: DEPOT_COORD.lng },
      ...validStops,
      { lat: DEPOT_COORD.lat, lng: DEPOT_COORD.lng },
    ];

    const coordStr = waypoints.map((w) => `${w.lng},${w.lat}`).join(";");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
            const coords: [number, number][] =
              data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng],
              );
            setRoadPolyline(coords);
          } else {
            setRoadPolyline(waypoints.map((w) => [w.lat, w.lng]));
          }
        }
      })
      .catch((err) => {
        console.warn("OSRM Route fetch error:", err);
        if (isMounted) {
          setRoadPolyline(waypoints.map((w) => [w.lat, w.lng]));
        }
      })
      .finally(() => {
        if (isMounted) setLoadingRoad(false);
      });

      return () => {
        isMounted = false;
      };
    }, [validStops]);

  // GPS Device History Tracks Effect
  const [gpsHistoryCoords, setGpsHistoryCoords] = useState<[number, number][]>(
    [],
  );
  const [loadingGpsHistory, setLoadingGpsHistory] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadGpsHistory = async () => {
      try {
        setLoadingGpsHistory(true);
        // 1. Fetch devices to match license_plate or car_id
        const resDev = await api.get("/gps/devices");
        if (!isMounted) return;
        const devices = resDev.data?.devices || [];

        const targetPlate = (release?.license_plate || "")
          .toLowerCase()
          .trim();
        const targetCarId = String(release?.car_id || "")
          .toLowerCase()
          .trim();

        const matchedDevice = devices.find((d: any) => {
          const dName = (d.name || "").toLowerCase().trim();
          const dNum = (d.number || "").toLowerCase().trim();
          const dDetail = (d.detail || "").toLowerCase().trim();
          const dId = String(d.id || "").toLowerCase().trim();

          return (
            (targetPlate &&
              (dName.includes(targetPlate) ||
                targetPlate.includes(dName) ||
                dNum.includes(targetPlate) ||
                dDetail.includes(targetPlate))) ||
            (targetCarId && (dId === targetCarId || dName.includes(targetCarId)))
          );
        });

        const deviceIdToFetch = matchedDevice?.id || release?.car_id;
        if (deviceIdToFetch) {
          const rawDate =
            release?.release_date ||
            release?.created_at ||
            new Date().toISOString();
          const dateStr =
            typeof rawDate === "string"
              ? rawDate.slice(0, 10)
              : new Date().toISOString().slice(0, 10);
          const start = `${dateStr} 00:00:00`;
          const end = `${dateStr} 23:59:59`;

          const logRes = await fetchGpsDeviceLogs(
            deviceIdToFetch,
            start,
            end,
            0,
          );
          if (
            isMounted &&
            logRes &&
            logRes.success &&
            Array.isArray(logRes.logs)
          ) {
            const coords: [number, number][] = logRes.logs
              .filter((l) => l.latitude && l.longitude)
              .map((l) => [l.latitude, l.longitude] as [number, number]);
            setGpsHistoryCoords(coords);
          }
        }
      } catch (err) {
        console.warn(
          "Fetch GPS device history in ReleaseGpsMapTab warning:",
          err,
        );
      } finally {
        if (isMounted) setLoadingGpsHistory(false);
      }
    };

    if (release) {
      loadGpsHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [release]);

  const mapBounds = useMemo(() => {
    const points: [number, number][] = [[DEPOT_COORD.lat, DEPOT_COORD.lng]];
    validStops.forEach((s) => points.push([s.lat, s.lng]));
    if (points.length < 2) return null;
    return L.latLngBounds(points);
  }, [validStops]);

  const completedCount = validStops.filter(
    (s) =>
      s.status === "completed" ||
      s.status === "success" ||
      s.status === "delivered" ||
      (s.check_out_id !== undefined &&
        s.check_out_id !== null &&
        s.check_out_id !== 0 &&
        s.check_out_id !== "0") ||
      Boolean(s.date_time_check_out),
  ).length;

  const problemCount = validStops.filter(
    (s) =>
      s.status === "problem" ||
      s.status === "failed" ||
      (s.problem_id !== undefined &&
        s.problem_id !== null &&
        s.problem_id !== 0 &&
        s.problem_id !== "0"),
  ).length;

  const in_progressCount = Math.max(
    0,
    validStops.length - completedCount - problemCount,
  );

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Status Telemetry Header */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="text-center">
          <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
            {validStops.length}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-0.5">
            การจัดส่ง
          </div>
        </div>
        <div className="w-px h-6 sm:h-8 bg-slate-200" />
        <div className="text-center">
          <div className="text-base sm:text-lg font-extrabold text-amber-600 leading-none">
            {in_progressCount}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-0.5">
            รอดำเนินการ
          </div>
        </div>
        <div className="w-px h-6 sm:h-8 bg-slate-200" />
        <div className="text-center">
          <div className="text-base sm:text-lg font-extrabold text-emerald-600 leading-none">
            {completedCount}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-0.5">
            สำเร็จ
          </div>
        </div>
        <div className="w-px h-6 sm:h-8 bg-slate-200" />
        <div className="text-center">
          <div className="text-base sm:text-lg font-extrabold text-rose-600 leading-none">
            {problemCount}
          </div>
          <div className="text-[9px] text-slate-500 font-medium mt-0.5">
            ติดปัญหา
          </div>
        </div>
      </div>

      <div className="hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-semibold">
              ทะเบียน / คนขับ
            </div>
            <div className="font-bold text-xs truncate">
              {release?.license_plate || "-"} ({release?.driver_name || "-"})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">
              ส่งสำเร็จ / ทั้งหมด
            </div>
            <div className="font-bold text-xs font-mono text-emerald-400">
              {completedCount} / {validStops.length} ร้าน
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold">
              ติดปัญหา
            </div>
            <div className="font-bold text-xs font-mono text-rose-400">
              {problemCount} รายการ
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-semibold">
              ตำแหน่งรถล่าสุด
            </div>
            <div className="font-bold text-xs truncate text-amber-300">
              {vehiclePosition.stopName}
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet Map Box */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md h-[450px] bg-slate-100 z-0">
        <MapContainer
          center={[DEPOT_COORD.lat, DEPOT_COORD.lng]}
          zoom={11}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapBounds bounds={mapBounds} resetToken={mapResetToken} />
          <FocusStopOnMap target={flyTarget} markerRefs={markerRefs} />

          {/* Depot Marker */}
          <Marker
            position={[DEPOT_COORD.lat, DEPOT_COORD.lng]}
            icon={createStopMarker(0, true)}
          >
            <Popup>
              <div className="font-sans text-xs">
                <strong className="text-slate-900 block font-bold">
                  คลังสินค้าใหญ่ (Depot)
                </strong>
                <span className="text-slate-500 text-[10px]">
                  จุดเริ่มต้นปล่อยรถ
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Road Polyline */}
          {roadPolyline.length > 0 && (
            <Polyline
              positions={roadPolyline}
              pathOptions={{
                color: "#3b82f6",
                weight: 4,
                opacity: 0.8,
                dashArray: loadingRoad ? "8, 8" : undefined,
              }}
            />
          )}

          {/* GPS Historical Breadcrumb Track Polyline (เส้นประวัติการวิ่งจริงของรถ) */}
          {gpsHistoryCoords.length > 1 && (
            <Polyline
              positions={gpsHistoryCoords}
              pathOptions={{
                color: "#0000FF",
                weight: 4.5,
                opacity: 0.95,
                dashArray: "8, 6",
              }}
            >
              <Popup>
                <div className="font-sans text-xs">
                  <strong className="text-cyan-700 block font-bold">
                    🗺️ เส้นทางประวัติการเดินทางจริง GPS
                  </strong>
                  <span className="text-slate-700 text-[11px]">
                    ทะเบียน: {release?.license_plate || "-"}
                  </span>
                  <div className="text-slate-500 text-[10px] mt-1 font-mono">
                    พิกัดทั้งหมด: {gpsHistoryCoords.length} จุด
                  </div>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Store Waypoint Markers */}
          {validStops.map((st) => {
            const isCompleted =
              st.status === "completed" ||
              st.status === "success" ||
              st.status === "delivered" ||
              (st.check_out_id !== undefined &&
                st.check_out_id !== null &&
                st.check_out_id !== 0 &&
                st.check_out_id !== "0") ||
              Boolean(st.date_time_check_out);

            const isProblem =
              st.status === "problem" ||
              st.status === "failed" ||
              (st.problem_id !== undefined &&
                st.problem_id !== null &&
                st.problem_id !== 0 &&
                st.problem_id !== "0");

            const stopStatus = isProblem
              ? "problem"
              : isCompleted
                ? "completed"
                : st.check_in_id
                  ? "in_progress"
                  : "pending";

            return (
              <Marker
                key={st.list_id}
                ref={(marker) => {
                  if (marker) markerRefs.current[String(st.list_id)] = marker;
                }}
                position={[st.lat, st.lng]}
                icon={createStopMarker(st.order, false, stopStatus)}
              >
                <Popup>
                  <div className="font-sans text-xs space-y-1">
                    <div className="font-bold text-slate-900 border-b pb-1">
                      #{st.order} {st.store_name_result || st.store_name}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      รหัสร้าน: {st.store_id || "-"}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      บิล: {st.data_store_no || "-"}
                    </div>
                    <div className="text-[11px] font-bold text-blue-700">
                      จำนวนส่ง: {st.sum_quantity || 1} ลัง
                    </div>
                    <div className="text-[10px] font-bold mt-1">
                      สถานะ:{" "}
                      <span
                        className={
                          isProblem
                            ? "text-rose-600 font-bold"
                            : isCompleted
                              ? "text-emerald-600 font-extrabold"
                              : st.check_in_id
                                ? "text-blue-600 font-bold"
                                : "text-amber-600 font-bold"
                        }
                      >
                        {isProblem
                          ? "ติดปัญหา !"
                          : isCompleted
                            ? "ส่งสินค้าสำเร็จ ✓"
                            : st.check_in_id
                              ? "กำลังส่ง..."
                              : "รอส่ง"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Vehicle Live GPS Marker */}
          {vehiclePosition && (
            <Marker
              position={[vehiclePosition.lat, vehiclePosition.lng]}
              icon={createGpsVehicleMarker(
                release?.license_plate || "รถขนส่ง",
                true,
              )}
              zIndexOffset={2000}
            >
              <Popup>
                <div className="font-sans text-xs">
                  <strong className="text-slate-900 block font-bold">
                    พิกัดเรียลไทม์รถขนส่ง
                  </strong>
                  <div className="text-slate-600 text-[11px]">
                    คนขับ: {release?.driver_name || "-"}
                  </div>
                  <div className="text-slate-500 text-[10px] font-mono">
                    {vehiclePosition.lat.toFixed(5)},{" "}
                    {vehiclePosition.lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map Floating Control Overlay */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
          <button
            onClick={() => {
              if (mapBounds) {
                setFlyTarget(null);
                setMapResetToken((token) => token + 1);
              }
            }}
            className="bg-white/90 hover:bg-white text-slate-700 border border-slate-200/80 px-2.5 py-1.5 rounded-lg shadow-md font-semibold text-[11px] flex items-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
            <span>ปรับมุมมองทั้งหมด</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-slate-800">
            ตารางการจัดส่งในกรุ๊ป
          </span>
          <span className="text-[10px] text-slate-500">
            คลิกรายการเพื่อดูตำแหน่งบนแผนที่
          </span>
        </div>
        <div className="max-h-60 overflow-auto custom-scrollbar">
          <table className="w-full min-w-[1300px] text-[11px] whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-2.5 py-1.5 text-left w-28">สถานะ</th>
                <th className="px-2.5 py-1.5 text-left w-28">รหัสออเดอร์</th>
                <th className="px-2.5 py-1.5 text-right w-24">จำนวน (ลัง)</th>
                <th className="px-2.5 py-1.5 text-center w-24">จุดวาง</th>
                <th className="px-2.5 py-1.5 text-center w-24">
                  หลักฐานการส่ง
                </th>
                <th className="px-2.5 py-1.5 text-left w-24">
                  กำหนดเวลาไว้ที่
                </th>
                <th className="px-2.5 py-1.5 text-left w-36">เริ่มบริการ</th>
                <th className="px-2.5 py-1.5 text-left w-36">สิ้นสุดบริการ</th>
                <th className="px-2.5 py-1.5 text-left w-24">ระยะเวลาจริง</th>
                <th className="px-2.5 py-1.5 text-left w-20">ลำดับความสำคัญ</th>
                <th className="px-2.5 py-1.5 text-left min-w-[200px]">
                  ที่ตั้ง / ร้านค้า
                </th>
                <th className="px-2.5 py-1.5 text-left w-32">
                  สายรถ / ทะเบียน
                </th>
                <th className="px-2.5 py-1.5 text-right w-16">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validStops.map((st) => {
                const isCompleted =
                  st.check_out_id || st.status === "completed";
                const isProblem = st.problem_id || st.status === "problem";
                const isActive = flyTarget?.id === String(st.list_id);
                const statusLabel = isProblem
                  ? "ติดปัญหา"
                  : isCompleted
                    ? "สำเร็จ"
                    : st.check_in_id
                      ? "เดินทาง"
                      : "รอดำเนินการ";
                const statusClass = isProblem
                  ? "bg-rose-100 text-rose-700"
                  : isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : st.check_in_id
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700";
                const priority = String(st.priority || "medium").toLowerCase();
                const startTime =
                  st.start_service_time || st.date_time_check_in;
                const endTime = st.end_service_time || st.date_time_check_out;
                return (
                  <tr
                    key={`map-table-${st.list_id}`}
                    onClick={() =>
                      setFlyTarget({
                        id: String(st.list_id),
                        lat: st.lat,
                        lng: st.lng,
                      })
                    }
                    className={`cursor-pointer transition-colors hover:bg-blue-50 ${isActive ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""}`}
                  >
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center shadow-2xs">
                          {st.order}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-800">
                      {st.data_store_no || "-"}
                    </td>
                    <td className="px-2.5 py-1.5 text-right font-mono font-bold text-amber-800">
                      {st.sum_quantity ?? 1} ลัง
                    </td>
                    <td className="px-2.5 py-1.5 text-center">
                      {st.position_product_name || st.position_product_id ? (
                        <span className="inline-flex items-center bg-amber-100 text-amber-900 border border-amber-300 font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded">
                          {st.position_product_name || st.position_product_id}/
                          {st.position_production_order || 1}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 text-center">
                      {st.pod_image ? (
                        <a
                          href={getImageUrl(st.pod_image)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <img
                            src={getImageUrl(st.pod_image)}
                            alt="POD"
                            className="w-5 h-5 object-cover rounded border border-slate-300 hover:scale-110 transition-transform"
                          />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-700">
                      {st.scheduled_time?.slice(0, 5) || "-"}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-800">
                      {formatServiceTime(startTime)}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-800">
                      {formatServiceTime(endTime)}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-700">
                      {getActualDuration(startTime, endTime)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priority === "high" ? "bg-rose-100 text-rose-700 border-rose-200" : priority === "low" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                      >
                        {priority === "high"
                          ? "สูง"
                          : priority === "low"
                            ? "ต่ำ"
                            : "กลาง"}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <span className="font-semibold text-slate-900">
                        {st.store_name_result || st.store_name || "-"}
                      </span>
                      {st.store_address && (
                        <span className="text-[10px] text-slate-500 ml-1">
                          ({st.store_address})
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5">
                      <span className="font-medium text-slate-800">
                        {release?.driver_name || "-"}
                      </span>
                      {release?.license_plate && (
                        <span className="text-[10px] font-mono text-slate-500 ml-1">
                          [{release.license_plate}]
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 text-right">
                      <MapPin className="w-3.5 h-3.5 inline-block text-blue-600" />
                    </td>
                  </tr>
                );
              })}
              {validStops.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-6 text-center text-slate-400">
                    ไม่พบจุดจัดส่งที่มีพิกัด GPS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
