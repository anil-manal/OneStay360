"use client";

import React, { useState, useEffect } from "react";
import {
  CITIES_CONFIG,
  createCompleteProperty,
  NewPropertyInput,
} from "@/lib/data-service";
import {
  X,
  Building2,
  DollarSign,
  Sparkles,
  Shield,
  Utensils,
  BedDouble,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: string;
  businessName: string;
  businessPhone?: string;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  businessName,
  businessPhone,
}: AddPropertyModalProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [city, setCity] = useState("Pune");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [numberOfFloors, setNumberOfFloors] = useState("3");
  const [description, setDescription] = useState("");
  const [landmarks, setLandmarks] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Step 2: Dynamic Pricing
  const [maxSharing, setMaxSharing] = useState<number>(3);
  const [sharingRows, setSharingRows] = useState<
    Array<{ sharing: number; nonAc: number; ac: number }>
  >([
    { sharing: 1, nonAc: 15000, ac: 18000 },
    { sharing: 2, nonAc: 9000, ac: 11500 },
    { sharing: 3, nonAc: 7000, ac: 9000 },
  ]);
  const [securityDeposit, setSecurityDeposit] = useState<number>(5000);
  const [oneTimeMaintenance, setOneTimeMaintenance] = useState<number>(1000);
  const [maintenanceDeductedFromDeposit, setMaintenanceDeductedFromDeposit] =
    useState<boolean>(false);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30);

  // Step 3: Amenities
  const [selectAllAmenities, setSelectAllAmenities] = useState(false);
  const [amenities, setAmenities] = useState({
    wifi: true,
    ac: true,
    laundry: true,
    foodIncluded: true,
    parking: true,
    geyser: true,
    powerBackup: true,
    cctv: true,
    housekeeping: true,
  });

  // Step 4: Rules
  const [rules, setRules] = useState({
    genderAllowed: "Co-ed",
    curfew: true,
    visitorsAllowed: true,
    smokingAllowed: false,
    alcoholAllowed: false,
    noticePeriodDays: 30,
  });

  // Step 5: Food Plan
  const [weeklyMeals, setWeeklyMeals] = useState<Record<string, string[]>>({
    Monday: ["Breakfast", "Dinner"],
    Tuesday: ["Breakfast", "Dinner"],
    Wednesday: ["Breakfast", "Dinner"],
    Thursday: ["Breakfast", "Dinner"],
    Friday: ["Breakfast", "Dinner"],
    Saturday: ["Breakfast", "Lunch", "Dinner"],
    Sunday: ["Breakfast", "Lunch", "Dinner"],
  });
  const [foodNotes, setFoodNotes] = useState(
    "Mon-Fri: Breakfast & Dinner; Sat-Sun: Breakfast, Lunch & Dinner."
  );

  // Step 6: Rooms Builder
  const [rooms, setRooms] = useState<
    Array<{
      roomNumber: string;
      floor: string;
      sharingType: number;
      hasAC: boolean;
    }>
  >([
    { roomNumber: "101", floor: "1", sharingType: 2, hasAC: true },
    { roomNumber: "102", floor: "1", sharingType: 2, hasAC: false },
    { roomNumber: "103", floor: "1", sharingType: 3, hasAC: true },
    { roomNumber: "201", floor: "2", sharingType: 2, hasAC: true },
    { roomNumber: "202", floor: "2", sharingType: 3, hasAC: false },
  ]);

  // Sync sharing rows when maxSharing changes
  useEffect(() => {
    const current = [...sharingRows];
    if (maxSharing > current.length) {
      for (let s = current.length + 1; s <= maxSharing; s++) {
        current.push({
          sharing: s,
          nonAc: Math.max(4000, 10000 - s * 1000),
          ac: Math.max(5500, 12000 - s * 1000),
        });
      }
    } else if (maxSharing < current.length && maxSharing >= 1) {
      current.splice(maxSharing);
    }
    setSharingRows(current);
  }, [maxSharing]);

  if (!isOpen) return null;

  const toggleAmenity = (key: keyof typeof amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllAmenities = (checked: boolean) => {
    setSelectAllAmenities(checked);
    setAmenities({
      wifi: checked,
      ac: checked,
      laundry: checked,
      foodIncluded: checked,
      parking: checked,
      geyser: checked,
      powerBackup: checked,
      cctv: checked,
      housekeeping: checked,
    });
  };

  const toggleMeal = (day: string, meal: string) => {
    setWeeklyMeals((prev) => {
      const current = prev[day] || [];
      const exists = current.includes(meal);
      const next = exists ? current.filter((m) => m !== meal) : [...current, meal];
      return { ...prev, [day]: next };
    });
  };

  const applyPresetAllMeals = () => {
    const plan: Record<string, string[]> = {};
    for (const d of DAYS) {
      plan[d] = ["Breakfast", "Lunch", "Dinner"];
    }
    setWeeklyMeals(plan);
    setFoodNotes("All meals (Breakfast, Lunch, Dinner) provided daily.");
  };

  const applyPresetWeekdayBfDinner = () => {
    const plan: Record<string, string[]> = {};
    for (let i = 0; i < 5; i++) {
      plan[DAYS[i]] = ["Breakfast", "Dinner"];
    }
    plan["Saturday"] = ["Breakfast", "Lunch", "Dinner"];
    plan["Sunday"] = ["Breakfast", "Lunch", "Dinner"];
    setWeeklyMeals(plan);
    setFoodNotes("Mon-Fri: Breakfast & Dinner; Sat-Sun: Breakfast, Lunch & Dinner.");
  };

  const clearMeals = () => {
    const plan: Record<string, string[]> = {};
    for (const d of DAYS) plan[d] = [];
    setWeeklyMeals(plan);
    setFoodNotes("");
  };

  const addRoom = () => {
    const lastRoom = rooms[rooms.length - 1];
    const nextNum = lastRoom
      ? String(parseInt(lastRoom.roomNumber) + 1 || "104")
      : "101";
    setRooms([
      ...rooms,
      {
        roomNumber: nextNum,
        floor: lastRoom?.floor || "1",
        sharingType: maxSharing >= 2 ? 2 : 1,
        hasAC: true,
      },
    ]);
  };

  const removeRoom = (idx: number) => {
    setRooms(rooms.filter((_, i) => i !== idx));
  };

  const updateRoom = (idx: number, patch: Partial<(typeof rooms)[0]>) => {
    setRooms(
      rooms.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );
  };

  const totalCalculatedRooms = rooms.length;
  const totalCalculatedBeds = rooms.reduce((sum, r) => sum + (r.sharingType || 1), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Property Name is required");
      setActiveStep(1);
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Address is required");
      setActiveStep(1);
      return;
    }
    if (rooms.length === 0) {
      setErrorMsg("Please add at least one room");
      setActiveStep(6);
      return;
    }

    setIsSubmitting(true);
    try {
      const input: NewPropertyInput = {
        name: name.trim(),
        city,
        cityCode: CITIES_CONFIG[city] || "GEN",
        address: address.trim(),
        pincode: pincode.trim() || "411057",
        numberOfFloors: parseInt(numberOfFloors) || 1,
        description: description.trim(),
        landmarks: landmarks.trim(),
        googleMapsLink: googleMapsLink.trim(),
        pricing: {
          maxSharing,
          securityDeposit,
          oneTimeMaintenance,
          maintenanceDeductedFromDeposit,
          noticePeriodDays,
          sharing: sharingRows,
        },
        amenities,
        rules,
        foodPlan: amenities.foodIncluded
          ? {
              notes: foodNotes,
              plan: weeklyMeals,
            }
          : undefined,
        rooms,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
      };

      await createCompleteProperty(
        businessId,
        businessName,
        businessPhone || "",
        input
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create property:", err);
      setErrorMsg(err.message || "Failed to create property in Firestore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "Basic Info", icon: Building2 },
    { num: 2, title: "Pricing & Tariffs", icon: DollarSign },
    { num: 3, title: "Amenities", icon: Sparkles },
    { num: 4, title: "House Rules", icon: Shield },
    { num: 5, title: "Food Plan", icon: Utensils },
    { num: 6, title: "Room Inventory", icon: BedDouble },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "840px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F8FAFC",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#059669",
                  background: "#ECFDF5",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                1:1 APP PARITY
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                Target Chain: <strong>{businessName}</strong> ({businessId})
              </span>
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0F172A",
                margin: "4px 0 0 0",
              }}
            >
              Add New Property to Network
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#EDF2F7",
              color: "#64748B",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Tabs */}
        <div
          style={{
            display: "flex",
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            overflowX: "auto",
            padding: "0 12px",
          }}
        >
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(s.num)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 14px",
                  border: "none",
                  background: "transparent",
                  borderBottom: isActive ? "2px solid #059669" : "2px solid transparent",
                  color: isActive ? "#059669" : "#64748B",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={14} />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 24px",
              background: "#FEF2F2",
              color: "#991B1B",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Info size={16} /> {errorMsg}
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* STEP 1: Basic Information */}
          {activeStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                1. Property Profile & Geo Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Property Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ram Nivas PG & Luxury Stays"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    {Object.entries(CITIES_CONFIG).map(([cName, code]) => (
                      <option key={cName} value={cName}>
                        {cName} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Street Address & Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 42, Near Wipro Circle, Phase 1, Hinjawadi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 411057"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Number of Floors
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Landmarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Blue Ridge"
                    value={landmarks}
                    onChange={(e) => setLandmarks(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Google Maps URL
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Property Cover Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Description & Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your co-living space, community, and cleanliness standards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Tariffs */}
          {activeStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  2. Sharing Tiers & Security Deposit
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                    Max Sharing Capacity:
                  </label>
                  <select
                    value={maxSharing}
                    onChange={(e) => setMaxSharing(parseInt(e.target.value) || 1)}
                    style={{ padding: "6px 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Sharing
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Sharing Table */}
              <div style={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Sharing Tier</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Non-AC Rent (₹/mo)</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#475569", fontWeight: 700 }}>AC Rent (₹/mo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharingRows.map((row, idx) => (
                      <tr key={row.sharing} style={{ borderBottom: idx < sharingRows.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0F172A" }}>
                          {row.sharing === 1 ? "Single Room" : row.sharing === 2 ? "Double Sharing" : row.sharing === 3 ? "Triple Sharing" : `${row.sharing}-Sharing`}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="number"
                            value={row.nonAc}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setSharingRows(sharingRows.map((r) => (r.sharing === row.sharing ? { ...r, nonAc: val } : r)));
                            }}
                            style={{ width: "100%", maxWidth: "160px", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px" }}
                          />
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="number"
                            value={row.ac}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setSharingRows(sharingRows.map((r) => (r.sharing === row.sharing ? { ...r, ac: val } : r)));
                            }}
                            style={{ width: "100%", maxWidth: "160px", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Deposit & Maintenance */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    One-time Maintenance (₹)
                  </label>
                  <input
                    type="number"
                    value={oneTimeMaintenance}
                    onChange={(e) => setOneTimeMaintenance(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(parseInt(e.target.value) || 30)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={maintenanceDeductedFromDeposit}
                  onChange={(e) => setMaintenanceDeductedFromDeposit(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                Deduct one-time maintenance from security deposit automatically on move-out
              </label>
            </div>
          )}

          {/* STEP 3: Amenities */}
          {activeStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  3. Amenities Checklist
                </h3>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#059669" }}>
                  <input
                    type="checkbox"
                    checked={selectAllAmenities}
                    onChange={(e) => handleSelectAllAmenities(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  Select All Amenities
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { key: "wifi", label: "High-Speed Wi-Fi" },
                  { key: "ac", label: "Air Conditioning (AC)" },
                  { key: "laundry", label: "Laundry & Washing Machine" },
                  { key: "foodIncluded", label: "Food / Mess Service" },
                  { key: "parking", label: "Vehicle Parking" },
                  { key: "geyser", label: "Hot Water Geyser" },
                  { key: "powerBackup", label: "Power Backup / Inverter" },
                  { key: "cctv", label: "24x7 CCTV Surveillance" },
                  { key: "housekeeping", label: "Daily Housekeeping" },
                ].map((item) => {
                  const isChecked = (amenities as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      onClick={() => toggleAmenity(item.key as any)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: isChecked ? "2px solid #059669" : "1px solid #CBD5E1",
                        background: isChecked ? "#ECFDF5" : "#FFFFFF",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: isChecked ? "#065F46" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: House Rules */}
          {activeStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                4. House Rules & Guidelines
              </h3>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                  Gender Allowed *
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {["Co-ed", "Boys", "Girls"].map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setRules({ ...rules, genderAllowed: g })}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: rules.genderAllowed === g ? "2px solid #059669" : "1px solid #CBD5E1",
                        background: rules.genderAllowed === g ? "#ECFDF5" : "#FFFFFF",
                        color: rules.genderAllowed === g ? "#059669" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
                {[
                  { key: "curfew", label: "Night Curfew Enforced" },
                  { key: "visitorsAllowed", label: "Day Visitors Allowed" },
                  { key: "smokingAllowed", label: "Smoking Allowed" },
                  { key: "alcoholAllowed", label: "Alcohol Allowed" },
                ].map((r) => {
                  const val = (rules as any)[r.key];
                  return (
                    <label
                      key={r.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        background: "#F8FAFC",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setRules({ ...rules, [r.key]: e.target.checked })}
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span>{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Food Plan */}
          {activeStep === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  5. Weekly 7-Day Meal Timetable
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={applyPresetAllMeals}
                    style={{ padding: "6px 10px", border: "1px solid #CBD5E1", background: "#FFFFFF", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                  >
                    All Meals Daily
                  </button>
                  <button
                    type="button"
                    onClick={applyPresetWeekdayBfDinner}
                    style={{ padding: "6px 10px", border: "1px solid #CBD5E1", background: "#FFFFFF", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Weekday BF+Dinner
                  </button>
                  <button
                    type="button"
                    onClick={clearMeals}
                    style={{ padding: "6px 10px", border: "1px solid #CBD5E1", background: "#FFFFFF", borderRadius: "6px", fontSize: "11px", fontWeight: 600, color: "#DC2626", cursor: "pointer" }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {!amenities.foodIncluded && (
                <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: "8px", color: "#92400E", fontSize: "12px", fontWeight: 600 }}>
                  Food / Mess amenity is currently unchecked in Step 3. Meals configured here will be saved if Food is offered.
                </div>
              )}

              <div style={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#475569" }}>Day</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#475569" }}>Breakfast</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#475569" }}>Lunch</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#475569" }}>Dinner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, idx) => {
                      const meals = weeklyMeals[day] || [];
                      return (
                        <tr key={day} style={{ borderBottom: idx < DAYS.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0F172A" }}>{day}</td>
                          {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                            const isPresent = meals.includes(meal);
                            return (
                              <td key={meal} style={{ padding: "10px 14px", textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={isPresent}
                                  onChange={() => toggleMeal(day, meal)}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#059669" }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Food & Mess Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Veg kitchen, Sunday Non-veg special feast"
                  value={foodNotes}
                  onChange={(e) => setFoodNotes(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Room Inventory Builder */}
          {activeStep === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                    6. Room & Bed Inventory Matrix
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Rooms and beds will be created automatically in Firestore subcollections.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addRoom}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    background: "#059669",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Room
                </button>
              </div>

              {/* Total Counters Bar */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  padding: "12px 18px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#065F46",
                }}
              >
                <span>Total Rooms: {totalCalculatedRooms}</span>
                <span>•</span>
                <span>Total Beds Created: {totalCalculatedBeds}</span>
                <span>•</span>
                <span>Occupancy Status: 0% (All Available)</span>
              </div>

              {/* Rooms List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {rooms.map((room, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr 1.5fr 1fr auto",
                      gap: "10px",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#64748B" }}>Room No.</label>
                      <input
                        type="text"
                        value={room.roomNumber}
                        onChange={(e) => updateRoom(idx, { roomNumber: e.target.value })}
                        style={{ width: "100%", padding: "6px 8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#64748B" }}>Floor</label>
                      <input
                        type="text"
                        value={room.floor}
                        onChange={(e) => updateRoom(idx, { floor: e.target.value })}
                        style={{ width: "100%", padding: "6px 8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#64748B" }}>Sharing Type</label>
                      <select
                        value={room.sharingType}
                        onChange={(e) => updateRoom(idx, { sharingType: parseInt(e.target.value) || 1 })}
                        style={{ width: "100%", padding: "6px 8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <option key={s} value={s}>
                            {s === 1 ? "1 - Single" : s === 2 ? "2 - Double" : s === 3 ? "3 - Triple" : `${s} - Sharing`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#64748B" }}>AC Status</label>
                      <button
                        type="button"
                        onClick={() => updateRoom(idx, { hasAC: !room.hasAC })}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: room.hasAC ? "1px solid #059669" : "1px solid #CBD5E1",
                          background: room.hasAC ? "#ECFDF5" : "#F8FAFC",
                          color: room.hasAC ? "#059669" : "#64748B",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {room.hasAC ? "AC Room" : "Non-AC"}
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeRoom(idx)}
                        style={{
                          border: "none",
                          background: "#FEE2E2",
                          color: "#DC2626",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          marginTop: "12px",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep - 1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              {activeStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep + 1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Next Step <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.4)",
                  }}
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting ? "Generating ID & Saving..." : "Publish & Create Property"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
