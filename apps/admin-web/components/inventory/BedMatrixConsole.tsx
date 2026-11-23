"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Grid3X3,
  Building2,
  Bed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Wrench,
  Search,
  RefreshCw,
  X,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface BedData {
  id: string;
  bedNumber: string;
  isOccupied?: boolean;
  occupied?: boolean;
  reserved?: boolean;
  isActive?: boolean;
  tenantName?: string | null;
  tenantId?: string | null;
  enrollmentRequestId?: string | null;
  reservedFor?: string | null;
  occupiedAt?: any;
}

interface RoomData {
  id: string;
  roomNumber: string;
  floor: string;
  sharingType: number | string;
  occupancyType?: string;
  hasAC?: boolean;
  status?: string;
  beds: BedData[];
}

interface PropertyOption {
  businessId: string;
  propertyId: string;
  name: string;
  city: string;
}

export default function BedMatrixConsole() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBed, setSelectedBed] = useState<{
    bed: BedData;
    room: RoomData;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // 1. Load properties across businesses
  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const propsList: PropertyOption[] = [];

        // Check businesses subcollection properties
        const bizSnap = await getDocs(collection(db, "businesses"));
        for (const bizDoc of bizSnap.docs) {
          const pSnap = await getDocs(collection(db, `businesses/${bizDoc.id}/properties`));
          pSnap.forEach((p) => {
            const data = p.data();
            propsList.push({
              businessId: bizDoc.id,
              propertyId: p.id,
              name: data.propertyName || data.name || p.id,
              city: data.city || "Pune",
            });
          });
        }

        // Also check top-level properties collection
        const topPropsSnap = await getDocs(collection(db, "properties"));
        topPropsSnap.forEach((p) => {
          const data = p.data();
          if (!propsList.some((item) => item.propertyId === p.id)) {
            propsList.push({
              businessId: data.businessId || "BUS0000001",
              propertyId: p.id,
              name: data.name || data.title || p.id,
              city: data.city || "Bangalore",
            });
          }
        });

        setProperties(propsList);
        if (propsList.length > 0) {
          // Default to Ram Nivas or first
          const defaultProp = propsList.find((p) => p.name.includes("Ram Nivas")) || propsList[0];
          setSelectedProperty(defaultProp);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  // 2. Load rooms and beds for selected property
  useEffect(() => {
    if (!selectedProperty) return;
    loadRoomsAndBeds(selectedProperty);
  }, [selectedProperty]);

  async function loadRoomsAndBeds(prop: PropertyOption) {
    try {
      setRefreshing(true);
      const roomsColRef = collection(db, `businesses/${prop.businessId}/properties/${prop.propertyId}/rooms`);
      const roomsSnap = await getDocs(roomsColRef);

      const loadedRooms: RoomData[] = [];

      for (const rDoc of roomsSnap.docs) {
        const rData = rDoc.data();
        const bedsColRef = collection(db, `businesses/${prop.businessId}/properties/${prop.propertyId}/rooms/${rDoc.id}/beds`);
        const bedsSnap = await getDocs(bedsColRef);

        const loadedBeds: BedData[] = bedsSnap.docs.map((b) => ({
          id: b.id,
          bedNumber: b.data().bedNumber || b.id,
          isOccupied: b.data().isOccupied === true || b.data().occupied === true,
          occupied: b.data().occupied === true || b.data().isOccupied === true,
          reserved: b.data().reserved === true,
          isActive: b.data().isActive !== false,
          tenantName: b.data().tenantName,
          tenantId: b.data().tenantId,
          enrollmentRequestId: b.data().enrollmentRequestId,
          reservedFor: b.data().reservedFor,
          occupiedAt: b.data().occupiedAt,
        }));

        loadedRooms.push({
          id: rDoc.id,
          roomNumber: rData.roomNumber || rDoc.id,
          floor: (rData.floor || "1").toString(),
          sharingType: rData.sharingType || 3,
          occupancyType: rData.occupancyType || "Triple",
          hasAC: rData.hasAC === true,
          status: rData.status || "active",
          beds: loadedBeds,
        });
      }

      // Sort rooms by floor then room number
      loadedRooms.sort((a, b) => {
        if (a.floor !== b.floor) return a.floor.localeCompare(b.floor);
        return a.roomNumber.localeCompare(b.roomNumber);
      });

      setRooms(loadedRooms);
    } catch (err) {
      console.error("Failed to load room inventory:", err);
    } finally {
      setRefreshing(false);
    }
  }

  // 3. Admin Bed Overrides (Force Vacate, Maintenance Lock, Mark Active)
  async function handleBedAction(action: "force_vacate" | "toggle_maintenance" | "make_available") {
    if (!selectedBed || !selectedProperty) return;
    setActionLoading(true);
    setActionSuccess(null);

    const { bed, room } = selectedBed;
    const bedRef = doc(
      db,
      `businesses/${selectedProperty.businessId}/properties/${selectedProperty.propertyId}/rooms/${room.id}/beds/${bed.id}`
    );

    try {
      if (action === "force_vacate") {
        await updateDoc(bedRef, {
          occupied: false,
          isOccupied: false,
          tenantName: null,
          tenantId: null,
          reserved: false,
          reservationType: null,
          enrollmentRequestId: null,
          updatedAt: serverTimestamp(),
        });
        setActionSuccess(`Bed ${bed.bedNumber} has been vacated and made available.`);
      } else if (action === "toggle_maintenance") {
        const nextState = bed.isActive !== false ? false : true;
        await updateDoc(bedRef, {
          isActive: nextState,
          status: nextState ? "active" : "maintenance",
          updatedAt: serverTimestamp(),
        });
        setActionSuccess(
          nextState
            ? `Bed ${bed.bedNumber} is restored to active status.`
            : `Bed ${bed.bedNumber} is now locked for maintenance.`
        );
      } else if (action === "make_available") {
        await updateDoc(bedRef, {
          occupied: false,
          isOccupied: false,
          reserved: false,
          isActive: true,
          updatedAt: serverTimestamp(),
        });
        setActionSuccess(`Bed ${bed.bedNumber} is now active and ready for booking.`);
      }

      // Reload
      await loadRoomsAndBeds(selectedProperty);
      setSelectedBed(null);
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  // Metrics
  const allBeds = rooms.flatMap((r) => r.beds);
  const totalBedsCount = allBeds.length;
  const occupiedCount = allBeds.filter((b) => b.isOccupied).length;
  const reservedCount = allBeds.filter((b) => !b.isOccupied && b.reserved).length;
  const maintenanceCount = allBeds.filter((b) => b.isActive === false).length;
  const vacantCount = allBeds.filter((b) => !b.isOccupied && !b.reserved && b.isActive !== false).length;
  const occupancyRate = totalBedsCount > 0 ? Math.round((occupiedCount / totalBedsCount) * 100) : 0;

  // Filtered rooms & beds
  const filteredRooms = rooms
    .map((room) => {
      const filteredBeds = room.beds.filter((b) => {
        // Status filter
        if (statusFilter === "occupied" && !b.isOccupied) return false;
        if (statusFilter === "vacant" && (b.isOccupied || b.reserved || b.isActive === false)) return false;
        if (statusFilter === "reserved" && (b.isOccupied || !b.reserved)) return false;
        if (statusFilter === "maintenance" && b.isActive !== false) return false;

        // Search query
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase();
          const matchRoom = room.roomNumber.toLowerCase().includes(q);
          const matchBed = b.bedNumber.toLowerCase().includes(q);
          const matchTenant = (b.tenantName || "").toLowerCase().includes(q);
          return matchRoom || matchBed || matchTenant;
        }

        return true;
      });

      return {
        ...room,
        beds: filteredBeds,
      };
    })
    .filter((r) => r.beds.length > 0);

  // Group by floor
  const floors = Array.from(new Set(filteredRooms.map((r) => r.floor))).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Controls Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "#FFFFFF",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#ECFDF5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Grid3X3 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
              Visual Bed Matrix Master
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748B" }}>
              Real-time room occupancy, live tenant allocation & emergency bed overrides.
            </p>
          </div>
        </div>

        {/* Property Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={16} color="#64748B" />
            <select
              value={selectedProperty?.propertyId || ""}
              onChange={(e) => {
                const found = properties.find((p) => p.propertyId === e.target.value);
                if (found) setSelectedProperty(found);
              }}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1E293B",
                background: "#F8FAFC",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => selectedProperty && loadRoomsAndBeds(selectedProperty)}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Syncing..." : "Sync Matrix"}
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>TOTAL BEDS</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
            {totalBedsCount}
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Capacity in Property</div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #A7F3D0",
            backgroundColor: "#ECFDF5",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#047857" }}>OCCUPIED</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#065F46", marginTop: "4px" }}>
            {occupiedCount}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>
            {occupancyRate}% Occupancy Rate
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #BAE6FD",
            backgroundColor: "#F0F9FF",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0284C7" }}>RESERVED</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0369A1", marginTop: "4px" }}>
            {reservedCount}
          </div>
          <div style={{ fontSize: "12px", color: "#0284C7", marginTop: "4px" }}>Paid move-in pending</div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #FED7AA",
            backgroundColor: "#FFF7ED",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#C2410C" }}>VACANT (READY)</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#9A3412", marginTop: "4px" }}>
            {vacantCount}
          </div>
          <div style={{ fontSize: "12px", color: "#EA580C", marginTop: "4px" }}>Available for booking</div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            padding: "18px 20px",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>MAINTENANCE</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#475569", marginTop: "4px" }}>
            {maintenanceCount}
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>Locked beds</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: "#FFFFFF",
          padding: "14px 20px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Beds (${totalBedsCount})` },
            { id: "occupied", label: `Occupied (${occupiedCount})` },
            { id: "vacant", label: `Vacant (${vacantCount})` },
            { id: "reserved", label: `Reserved (${reservedCount})` },
            { id: "maintenance", label: `Maintenance (${maintenanceCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: statusFilter === tab.id ? "1px solid #059669" : "1px solid #E2E8F0",
                background: statusFilter === tab.id ? "#ECFDF5" : "#FFFFFF",
                color: statusFilter === tab.id ? "#047857" : "#475569",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "11px" }} />
          <input
            type="text"
            placeholder="Search Room, Bed, or Tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Visual Bed Grid Organized by Floor */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
          Loading visual bed matrix...
        </div>
      ) : floors.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            color: "#64748B",
            border: "1px solid #E2E8F0",
          }}
        >
          No rooms match the selected filter.
        </div>
      ) : (
        floors.map((floor) => {
          const floorRooms = filteredRooms.filter((r) => r.floor === floor);
          return (
            <div key={floor} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <span>Floor {floor}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#94A3B8",
                    background: "#F1F5F9",
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {floorRooms.length} Rooms
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {floorRooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      border: "1px solid #E2E8F0",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                          Room {room.roomNumber}
                        </span>
                        {room.hasAC && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#0284C7",
                              background: "#E0F2FE",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            AC
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>
                        {room.occupancyType || `${room.sharingType} Sharing`}
                      </span>
                    </div>

                    {/* Bed Nodes in Room */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {room.beds.map((bed) => {
                        let bgColor = "#F8FAFC";
                        let borderColor = "#CBD5E1";
                        let textColor = "#475569";
                        let statusText = "Vacant";

                        if (bed.isActive === false) {
                          bgColor = "#F1F5F9";
                          borderColor = "#94A3B8";
                          textColor = "#64748B";
                          statusText = "Maintenance";
                        } else if (bed.isOccupied) {
                          bgColor = "#ECFDF5";
                          borderColor = "#10B981";
                          textColor = "#065F46";
                          statusText = bed.tenantName ? bed.tenantName.split(" ")[0] : "Occupied";
                        } else if (bed.reserved) {
                          bgColor = "#F0F9FF";
                          borderColor = "#38BDF8";
                          textColor = "#0369A1";
                          statusText = "Reserved";
                        }

                        return (
                          <button
                            key={bed.id}
                            onClick={() => setSelectedBed({ bed, room })}
                            style={{
                              padding: "10px 6px",
                              borderRadius: "8px",
                              border: `1.5px solid ${borderColor}`,
                              background: bgColor,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                              transition: "transform 0.1s ease",
                            }}
                            title={`Bed ${bed.bedNumber} - ${statusText}`}
                          >
                            <Bed size={18} color={textColor} />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: textColor }}>
                              Bed {bed.bedNumber}
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                color: textColor,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                              }}
                            >
                              {statusText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Bed Inspector Drawer / Modal */}
      {selectedBed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#FFFFFF",
              height: "100%",
              padding: "32px 28px",
              boxShadow: "-8px 0 24px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bed size={22} color="#0F172A" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
                    Room {selectedBed.room.roomNumber} - Bed {selectedBed.bed.bedNumber}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748B" }}>
                    Floor {selectedBed.room.floor} &bull; {selectedBed.room.occupancyType || "Sharing"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBed(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                }}
              >
                <X size={20} color="#64748B" />
              </button>
            </div>

            {actionSuccess && (
              <div
                style={{
                  margin: "20px 0 10px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {actionSuccess}
              </div>
            )}

            {/* Bed Status Overview */}
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                borderRadius: "12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748B", marginBottom: "8px" }}>
                CURRENT OCCUPANCY STATUS
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    backgroundColor: selectedBed.bed.isOccupied
                      ? "#ECFDF5"
                      : selectedBed.bed.reserved
                      ? "#F0F9FF"
                      : selectedBed.bed.isActive === false
                      ? "#F1F5F9"
                      : "#FFF7ED",
                    color: selectedBed.bed.isOccupied
                      ? "#065F46"
                      : selectedBed.bed.reserved
                      ? "#0369A1"
                      : selectedBed.bed.isActive === false
                      ? "#475569"
                      : "#9A3412",
                  }}
                >
                  {selectedBed.bed.isActive === false
                    ? "LOCKED / MAINTENANCE"
                    : selectedBed.bed.isOccupied
                    ? "OCCUPIED"
                    : selectedBed.bed.reserved
                    ? "RESERVED"
                    : "VACANT"}
                </span>
              </div>

              {selectedBed.bed.isOccupied && (
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#64748B" }}>Tenant Name:</span>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>
                      {selectedBed.bed.tenantName || "Registered Tenant"}
                    </span>
                  </div>
                  {selectedBed.bed.tenantId && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748B" }}>Tenant ID:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {selectedBed.bed.tenantId}
                      </span>
                    </div>
                  )}
                  {selectedBed.bed.enrollmentRequestId && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748B" }}>Enrollment Ref:</span>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#059669" }}>
                        {selectedBed.bed.enrollmentRequestId}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Override Actions */}
            <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Super-Admin Inventory Actions
              </div>

              {selectedBed.bed.isOccupied && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleBedAction("force_vacate")}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #FECDD3",
                    background: "#FFF1F2",
                    color: "#E11D48",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <AlertTriangle size={16} />
                  Force Vacate & Release Bed
                </button>
              )}

              <button
                disabled={actionLoading}
                onClick={() => handleBedAction("toggle_maintenance")}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  color: "#334155",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Wrench size={16} />
                {selectedBed.bed.isActive === false ? "Restore Bed to Active" : "Lock Bed for Maintenance"}
              </button>

              {!selectedBed.bed.isOccupied && (selectedBed.bed.reserved || selectedBed.bed.isActive === false) && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleBedAction("make_available")}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid #A7F3D0",
                    background: "#ECFDF5",
                    color: "#065F46",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle2 size={16} />
                  Mark Available for Immediate Booking
                </button>
              )}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94A3B8" }}>
                <ShieldCheck size={14} color="#059669" />
                All bed state overrides are logged to Platform Audit Vault
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
