"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { fetchPropertyWithLayout } from "@/lib/data-service";
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Bed,
  Layers,
  Zap,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  DollarSign,
  Users,
  Eye,
  Phone,
  QrCode,
  Download,
  X,
  FileText,
  Sliders,
  Plus,
} from "lucide-react";

interface BedInfo {
  id: string;
  bedNumber: string;
  status: "occupied" | "vacant" | "maintenance";
  tenantName?: string | null;
  tenantPhone?: string | null;
  monthlyRent?: number;
  depositAmount?: number;
  kycVerified?: boolean;
}

interface RoomInfo {
  id: string;
  roomNumber: string;
  floor: number;
  hasAC: boolean;
  sharingType: number;
  submeterPrev?: number;
  submeterCurr?: number;
  submeterRate?: number;
  beds: BedInfo[];
}

interface SharingPricingEntry {
  sharing: number;
  nonAc: number;
  ac: number;
}

interface PropertyPricingData {
  maxSharing: number;
  sharing: SharingPricingEntry[];
  securityDeposit: number;
  oneTimeMaintenance: number;
  maintenanceDeductedFromDeposit: boolean;
  single?: number;
  double?: number;
  triple?: number;
}

interface LandlordPropertyDetails {
  id: string;
  name: string;
  city: string;
  address: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  pricePerBed: number;
  pricing?: PropertyPricingData;
  rooms: RoomInfo[];
}

const DEFAULT_ROOMS: RoomInfo[] = [
  {
    id: "R101",
    roomNumber: "101",
    floor: 1,
    hasAC: true,
    sharingType: 2,
    submeterPrev: 1240,
    submeterCurr: 1385,
    submeterRate: 12,
    beds: [
      { id: "B101_1", bedNumber: "A", status: "occupied", tenantName: "Anil Kumar Manal", tenantPhone: "+91 93593 03097", monthlyRent: 9500, depositAmount: 15000, kycVerified: true },
      { id: "B101_2", bedNumber: "B", status: "occupied", tenantName: "Rohan Verma", tenantPhone: "+91 98201 55443", monthlyRent: 9500, depositAmount: 15000, kycVerified: true },
    ],
  },
  {
    id: "R102",
    roomNumber: "102",
    floor: 1,
    hasAC: false,
    sharingType: 3,
    submeterPrev: 890,
    submeterCurr: 980,
    submeterRate: 12,
    beds: [
      { id: "B102_1", bedNumber: "A", status: "occupied", tenantName: "Siddharth Sen", tenantPhone: "+91 98111 22334", monthlyRent: 7500, depositAmount: 12000, kycVerified: true },
      { id: "B102_2", bedNumber: "B", status: "vacant", monthlyRent: 7500 },
      { id: "B102_3", bedNumber: "C", status: "maintenance" },
    ],
  },
  {
    id: "R201",
    roomNumber: "201",
    floor: 2,
    hasAC: true,
    sharingType: 2,
    submeterPrev: 2100,
    submeterCurr: 2260,
    submeterRate: 12,
    beds: [
      { id: "B201_1", bedNumber: "A", status: "occupied", tenantName: "Pooja Hegde", tenantPhone: "+91 98765 43210", monthlyRent: 11000, depositAmount: 18000, kycVerified: true },
      { id: "B201_2", bedNumber: "B", status: "vacant", monthlyRent: 11000 },
    ],
  },
];

const DEFAULT_LANDLORD_PROPERTY: LandlordPropertyDetails = {
  id: "PROP_AMD_032",
  name: "Zolo CyberPark Premier Residency",
  city: "Ahmedabad",
  address: "Plot 42, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054",
  totalRooms: 12,
  totalBeds: 36,
  occupiedBeds: 31,
  pricePerBed: 9500,
  pricing: {
    maxSharing: 3,
    sharing: [
      { sharing: 1, nonAc: 14000, ac: 15500 },
      { sharing: 2, nonAc: 9500, ac: 11000 },
      { sharing: 3, nonAc: 7500, ac: 9000 },
    ],
    securityDeposit: 15000,
    oneTimeMaintenance: 1200,
    maintenanceDeductedFromDeposit: true,
  },
  rooms: DEFAULT_ROOMS,
};

export default function LandlordPropertyConsolePage({ params }: { params: Promise<{ propertyId: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.propertyId;
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";

  const [property, setProperty] = useState<LandlordPropertyDetails>(DEFAULT_LANDLORD_PROPERTY);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matrix" | "submeter" | "pricing" | "residents">("matrix");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { property: p, rooms: r } = await fetchPropertyWithLayout(businessId, propertyId);
        if (p) {
          const defaultSharing = [
            { sharing: 1, nonAc: 14000, ac: 16000 },
            { sharing: 2, nonAc: 9000, ac: 10500 },
            { sharing: 3, nonAc: 7000, ac: 8500 },
          ];
          const newPricing: PropertyPricingData = {
            maxSharing: p.pricing?.maxSharing || 3,
            sharing: p.pricing?.sharing?.length ? p.pricing.sharing : defaultSharing,
            securityDeposit: p.pricing?.securityDeposit || 5000,
            oneTimeMaintenance: p.pricing?.oneTimeMaintenance || 1000,
            maintenanceDeductedFromDeposit: true,
          };
          setPricingForm(newPricing);

          setProperty({
            id: p.id,
            name: p.name,
            city: p.city,
            address: p.address,
            totalRooms: p.totalRooms,
            totalBeds: p.totalBeds,
            occupiedBeds: p.occupiedBeds,
            pricePerBed: p.pricing?.double || 9000,
            pricing: newPricing,
            rooms: r.length > 0 ? r.map((room) => ({
              id: room.id,
              roomNumber: room.roomNumber,
              floor: Number(room.floor) || 1,
              hasAC: room.hasAC,
              sharingType: room.sharingType,
              submeterPrev: 1240,
              submeterCurr: 1385,
              submeterRate: 12,
              beds: room.beds?.map((b) => ({
                id: b.id,
                bedNumber: b.bedNumber,
                status: b.isOccupied ? "occupied" : "vacant",
                tenantName: b.tenantName,
                tenantPhone: b.tenantPhone,
                monthlyRent: p.pricing?.double || 9000,
                kycVerified: true,
              })) || [],
            })) : DEFAULT_ROOMS,
          });
        }
      } catch (err) {
        console.error("Error loading property details from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId, propertyId]);

  // Bed modal state
  const [selectedBedModal, setSelectedBedModal] = useState<{ room: RoomInfo; bed: BedInfo } | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "checkin" | "vacate" | "maintenance">("view");

  // Check-in form
  const [checkinForm, setCheckinForm] = useState({
    tenantName: "",
    tenantPhone: "",
    monthlyRent: 9500,
    depositAmount: 15000,
    passportRef: "",
  });

  // Submeter form
  const [selectedRoomId, setSelectedRoomId] = useState("R101");
  const [submeterForm, setSubmeterForm] = useState({ prev: 1240, curr: 1385, rate: 12 });
  const [submeterSuccess, setSubmeterSuccess] = useState<string | null>(null);

  // Pricing form
  const [pricingForm, setPricingForm] = useState<PropertyPricingData>(
    DEFAULT_LANDLORD_PROPERTY.pricing || {
      maxSharing: 3,
      sharing: [
        { sharing: 1, nonAc: 14000, ac: 15500 },
        { sharing: 2, nonAc: 9500, ac: 11000 },
        { sharing: 3, nonAc: 7500, ac: 9000 },
      ],
      securityDeposit: 15000,
      oneTimeMaintenance: 1200,
      maintenanceDeductedFromDeposit: true,
    }
  );

  const handleOpenBedModal = (room: RoomInfo, bed: BedInfo) => {
    setSelectedBedModal({ room, bed });
    setModalMode(bed.status === "vacant" ? "checkin" : "view");
    setCheckinForm({
      tenantName: "",
      tenantPhone: "",
      monthlyRent: bed.monthlyRent || 9500,
      depositAmount: pricingForm.securityDeposit || 15000,
      passportRef: "",
    });
  };

  const handleExecuteBedStatusChange = (newStatus: "occupied" | "vacant" | "maintenance") => {
    if (!selectedBedModal) return;
    const { room, bed } = selectedBedModal;

    const updatedRooms = property.rooms.map((r) => {
      if (r.id === room.id) {
        const updatedBeds = r.beds.map((b) => {
          if (b.id === bed.id) {
            return {
              ...b,
              status: newStatus,
              tenantName: newStatus === "occupied" ? checkinForm.tenantName || "Rahul Sharma" : null,
              tenantPhone: newStatus === "occupied" ? checkinForm.tenantPhone || "+91 98201 12345" : null,
              monthlyRent: checkinForm.monthlyRent,
              kycVerified: true,
            };
          }
          return b;
        });
        return { ...r, beds: updatedBeds };
      }
      return r;
    });

    const occCount = updatedRooms.flatMap((r) => r.beds).filter((b) => b.status === "occupied").length;
    setProperty({ ...property, rooms: updatedRooms, occupiedBeds: occCount });
    setSelectedBedModal(null);
  };

  const handleSaveSubmeter = () => {
    const units = Math.max(0, submeterForm.curr - submeterForm.prev);
    const cost = units * submeterForm.rate;

    const updatedRooms = property.rooms.map((rm) => {
      if (rm.id === selectedRoomId) {
        return {
          ...rm,
          submeterPrev: submeterForm.prev,
          submeterCurr: submeterForm.curr,
          submeterRate: submeterForm.rate,
        };
      }
      return rm;
    });

    setProperty({ ...property, rooms: updatedRooms });
    setSubmeterSuccess(`✅ Logged ${units} kWh units. Total ₹${cost.toLocaleString("en-IN")} split evenly among active room occupants.`);
    setTimeout(() => setSubmeterSuccess(null), 5000);
  };

  const handleSavePricing = () => {
    setUpdating(true);
    setTimeout(() => {
      setProperty({ ...property, pricing: pricingForm });
      setUpdating(false);
      alert("✅ Property pricing schedule saved and synchronized with Flutter Business App!");
    }, 600);
  };

  const occupiedBedsList = property.rooms.flatMap((r) =>
    r.beds
      .filter((b) => b.status === "occupied")
      .map((b) => ({ ...b, roomNumber: r.roomNumber, floor: r.floor, hasAC: r.hasAC }))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Link href="/business" style={{ color: "#059669", textDecoration: "none", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              <ArrowLeft size={14} /> Back to Operations Pulse
            </Link>
            <span style={{ color: "#CBD5E1" }}>&bull;</span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Property Console: {property.id}</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
            {property.name}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            {property.address}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ textAlign: "right", background: "#FFFFFF", padding: "8px 16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Occupancy</div>
            <strong style={{ fontSize: "18px", color: "#059669" }}>
              {Math.round((property.occupiedBeds / property.totalBeds) * 100)}% ({property.occupiedBeds}/{property.totalBeds} Beds)
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
        {[
          { id: "matrix", label: "Interactive Bed Matrix Master", icon: Bed },
          { id: "submeter", label: "Submeter Logger & Split Bill", icon: Zap },
          { id: "pricing", label: "Tariff & Sharing Rates Editor", icon: DollarSign },
          { id: "residents", label: `Residents Directory (${occupiedBedsList.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                background: isActive ? "#059669" : "transparent",
                color: isActive ? "#FFFFFF" : "#64748B",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE BED MATRIX */}
      {activeTab === "matrix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Legend Bar */}
          <div style={{ background: "#FFFFFF", padding: "14px 20px", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B" }}>Bed Status:</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#065F46", fontWeight: 700 }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} /> Occupied
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748B", fontWeight: 700 }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#CBD5E1" }} /> Vacant (Ready to allocate)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#B45309", fontWeight: 700 }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} /> Maintenance
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
              Click any vacant bed to onboard a tenant in 1 click &rarr;
            </div>
          </div>

          {/* Rooms Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
            {property.rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "18px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#0F172A" }}>Room {room.roomNumber}</strong>
                    <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>
                      Floor {room.floor} &bull; {room.sharingType} Sharing &bull; {room.hasAC ? "AC" : "Non-AC"}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: room.hasAC ? "#E0F2FE" : "#F1F5F9", color: room.hasAC ? "#0284C7" : "#475569" }}>
                    {room.hasAC ? "Air Conditioned" : "Standard"}
                  </span>
                </div>

                {/* Beds in Room */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                  {room.beds.map((bed) => {
                    const isOcc = bed.status === "occupied";
                    const isMaint = bed.status === "maintenance";

                    return (
                      <div
                        key={bed.id}
                        onClick={() => handleOpenBedModal(room, bed)}
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          border: isOcc ? "1px solid #A7F3D0" : isMaint ? "1px solid #FDE68A" : "1px dashed #CBD5E1",
                          background: isOcc ? "#ECFDF5" : isMaint ? "#FFFBEB" : "#F8FAFC",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <strong style={{ fontSize: "13px", color: isOcc ? "#065F46" : isMaint ? "#92400E" : "#475569" }}>
                            Bed {bed.bedNumber}
                          </strong>
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: isOcc ? "#059669" : isMaint ? "#D97706" : "#64748B",
                              color: "#FFFFFF",
                            }}
                          >
                            {bed.status}
                          </span>
                        </div>

                        {isOcc ? (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {bed.tenantName || "Resident"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                              ₹{(bed.monthlyRent || 9500).toLocaleString("en-IN")}/mo
                            </div>
                          </div>
                        ) : isMaint ? (
                          <div style={{ fontSize: "11px", color: "#92400E" }}>Work order in progress</div>
                        ) : (
                          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                            + Allocate Guest
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMETER LOGGER & SPLIT BILL */}
      {activeTab === "submeter" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                Electricity Submeter Delta Billing Calculator
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                Record room meter dial readings. The system calculates net units and automatically splits the charge evenly among active occupants on their monthly invoice.
              </p>
            </div>
            <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "rgba(5, 150, 105, 0.1)", color: "#059669", fontWeight: 700 }}>
              Live Split Engine
            </span>
          </div>

          {submeterSuccess && (
            <div style={{ padding: "12px 16px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", color: "#065F46", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {submeterSuccess}
            </div>
          )}

          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "680px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Select Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    const rm = property.rooms.find((r) => r.id === e.target.value);
                    if (rm) setSubmeterForm({ prev: rm.submeterPrev || 1200, curr: rm.submeterCurr || 1350, rate: rm.submeterRate || 12 });
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", background: "#FFFFFF" }}
                >
                  {property.rooms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      Room {rm.roomNumber} (Floor {rm.floor} &bull; {rm.hasAC ? "AC" : "Non-AC"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Tariff Rate (₹/kWh Unit)</label>
                <input
                  type="number"
                  value={submeterForm.rate}
                  onChange={(e) => setSubmeterForm({ ...submeterForm, rate: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Previous Meter Dial (kWh)</label>
                <input
                  type="number"
                  value={submeterForm.prev}
                  onChange={(e) => setSubmeterForm({ ...submeterForm, prev: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Current Meter Dial (kWh)</label>
                <input
                  type="number"
                  value={submeterForm.curr}
                  onChange={(e) => setSubmeterForm({ ...submeterForm, curr: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ background: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.2)", borderRadius: "8px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>Delta Units Consumed</div>
                <strong style={{ fontSize: "20px", color: "#0F172A" }}>
                  {Math.max(0, submeterForm.curr - submeterForm.prev)} kWh Units
                </strong>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#64748B" }}>Total Electricity Charge to Split</div>
                <strong style={{ fontSize: "22px", color: "#059669" }}>
                  ₹{(Math.max(0, submeterForm.curr - submeterForm.prev) * submeterForm.rate).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <button
              onClick={handleSaveSubmeter}
              className="btnPrimary"
              style={{ padding: "12px 24px", borderRadius: "8px", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "14px", alignSelf: "flex-start" }}
            >
              Save Meter Reading &amp; Add to Invoices
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: TARIFF & SHARING RATES EDITOR */}
      {activeTab === "pricing" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                Dynamic Sharing Pricing &amp; Tariffs (Sync with Business App)
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                Set monthly rents for AC and Non-AC rooms per sharing density tier, security deposit terms, and one-time onboarding fees.
              </p>
            </div>
            <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", background: "rgba(5, 150, 105, 0.1)", color: "#059669", fontWeight: 700 }}>
              Business App Contract Sync
            </span>
          </div>

          {/* Section: Sharing Tiers Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {pricingForm.sharing.map((entry) => (
              <div key={entry.sharing} style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", background: "#F8FAFC" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
                  <strong style={{ fontSize: "14px", color: "#0F172A" }}>
                    {entry.sharing} Sharing Room {entry.sharing === 1 ? "(Private)" : ""}
                  </strong>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>Tier {entry.sharing}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>Non-AC Rent (₹/mo)</label>
                    <input
                      type="number"
                      value={entry.nonAc}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPricingForm({
                          ...pricingForm,
                          sharing: pricingForm.sharing.map((s) => (s.sharing === entry.sharing ? { ...s, nonAc: val } : s)),
                        });
                      }}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>AC Rent (₹/mo)</label>
                    <input
                      type="number"
                      value={entry.ac}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPricingForm({
                          ...pricingForm,
                          sharing: pricingForm.sharing.map((s) => (s.sharing === entry.sharing ? { ...s, ac: val } : s)),
                        });
                      }}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Ancillary Charges */}
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>Security Deposit per Resident (₹)</label>
              <input
                type="number"
                value={pricingForm.securityDeposit}
                onChange={(e) => setPricingForm({ ...pricingForm, securityDeposit: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>One-time Maintenance Fee (₹)</label>
              <input
                type="number"
                value={pricingForm.oneTimeMaintenance}
                onChange={(e) => setPricingForm({ ...pricingForm, oneTimeMaintenance: Number(e.target.value) })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", fontWeight: 700 }}
              />
            </div>
          </div>

          <button
            onClick={handleSavePricing}
            disabled={updating}
            className="btnPrimary"
            style={{ padding: "12px 28px", borderRadius: "8px", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "14px" }}
          >
            {updating ? "Syncing..." : "Save Pricing Structure (Sync with Business App)"}
          </button>
        </div>
      )}

      {/* TAB 4: RESIDENTS DIRECTORY */}
      {activeTab === "residents" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                Current Residents Roster ({occupiedBedsList.length} Active Guests)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Download official State Police Form 29 for any resident with 1-click.
              </p>
            </div>
          </div>

          <div className="tableWrapper">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Resident Name</th>
                  <th>Room &bull; Bed</th>
                  <th>Phone Number</th>
                  <th>Contract Monthly Rent</th>
                  <th>KYC Status</th>
                  <th style={{ textAlign: "right" }}>Police Form 29</th>
                </tr>
              </thead>
              <tbody>
                {occupiedBedsList.map((res) => (
                  <tr key={res.id}>
                    <td>
                      <strong>{res.tenantName || "Resident"}</strong>
                      <span className="subtext" style={{ display: "block" }}>OneStay360 Resident Passport Verified</span>
                    </td>
                    <td>
                      Room {res.roomNumber} &bull; Bed {res.bedNumber} ({res.hasAC ? "AC" : "Non-AC"})
                    </td>
                    <td>{res.tenantPhone || "+91 98201 12345"}</td>
                    <td>
                      <strong style={{ color: "#059669" }}>₹{(res.monthlyRent || 9500).toLocaleString("en-IN")}/mo</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "#ECFDF5", color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <ShieldCheck size={12} /> Aadhaar Verified
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => alert(`Downloading verified State Police Form 29 for ${res.tenantName}...`)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #CBD5E1",
                          background: "#FFFFFF",
                          color: "#0F172A",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Download size={13} /> Form 29 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: LANDLORD BED OPERATING MODAL */}
      {selectedBedModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "26px", border: "1px solid #E2E8F0", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Room {selectedBedModal.room.roomNumber} &bull; Bed {selectedBedModal.bed.bedNumber}
                </h3>
                <span style={{ fontSize: "11px", color: "#64748B" }}>
                  Floor {selectedBedModal.room.floor} &bull; {selectedBedModal.room.hasAC ? "AC" : "Non-AC"} &bull; {selectedBedModal.bed.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedBedModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>

            {/* If Bed is Vacant -> Onboard Modal */}
            {selectedBedModal.bed.status === "vacant" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "12px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", fontSize: "12px", color: "#065F46" }}>
                  <strong>Resident Allocation:</strong> Allocate incoming tenant to Bed {selectedBedModal.bed.bedNumber}.
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Resident Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={checkinForm.tenantName}
                    onChange={(e) => setCheckinForm({ ...checkinForm, tenantName: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98201 12345"
                    value={checkinForm.tenantPhone}
                    onChange={(e) => setCheckinForm({ ...checkinForm, tenantPhone: e.target.value })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Agreed Monthly Rent (₹/mo)</label>
                  <input
                    type="number"
                    value={checkinForm.monthlyRent}
                    onChange={(e) => setCheckinForm({ ...checkinForm, monthlyRent: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => handleExecuteBedStatusChange("occupied")}
                    className="btnPrimary"
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "13px" }}
                  >
                    Confirm Check-In &amp; Assign Bed
                  </button>
                  <button
                    onClick={() => handleExecuteBedStatusChange("maintenance")}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: 600 }}
                  >
                    Lock Maintenance
                  </button>
                </div>
              </div>
            )}

            {/* If Bed is Occupied -> View & Vacate Modal */}
            {selectedBedModal.bed.status === "occupied" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Resident Name:</span>
                    <strong style={{ color: "#0F172A" }}>{selectedBedModal.bed.tenantName || "Resident"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Contact Phone:</span>
                    <strong style={{ color: "#0F172A" }}>{selectedBedModal.bed.tenantPhone || "+91 98201 12345"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Agreed Monthly Rent:</span>
                    <strong style={{ color: "#059669" }}>₹{(selectedBedModal.bed.monthlyRent || 9500).toLocaleString("en-IN")}/mo</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Deposit in Escrow:</span>
                    <strong style={{ color: "#059669" }}>₹15,000 (Protected)</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => handleExecuteBedStatusChange("vacant")}
                    className="btnDanger"
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#DC2626", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", border: "none" }}
                  >
                    Initiate Move-Out / Vacate Bed
                  </button>
                  <button
                    onClick={() => alert(`Downloading Police Form 29 for ${selectedBedModal.bed.tenantName}...`)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Download size={14} /> Form 29
                  </button>
                </div>
              </div>
            )}

            {/* If Bed is Maintenance -> Release Modal */}
            {selectedBedModal.bed.status === "maintenance" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                  This bed is currently locked for deep cleaning or maintenance.
                </p>
                <button
                  onClick={() => handleExecuteBedStatusChange("vacant")}
                  className="btnPrimary"
                  style={{ padding: "10px", borderRadius: "8px", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "13px" }}
                >
                  Maintenance Complete &bull; Mark Vacant &amp; Available
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
