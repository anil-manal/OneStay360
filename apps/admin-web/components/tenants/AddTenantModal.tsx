"use client";

import React, { useState, useEffect } from "react";
import {
  PropertyData,
  createTenantWithStay,
  NewTenantInput,
  fetchPropertyRoomsAndBeds,
  RoomData,
} from "@/lib/data-service";
import {
  X,
  Building2,
  User,
  FileText,
  ShieldCheck,
  Receipt,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Calendar,
  Phone,
  Mail,
  Home,
  Check,
} from "lucide-react";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: string;
  properties: PropertyData[];
  preselectedPropertyId?: string;
}

export default function AddTenantModal({
  isOpen,
  onClose,
  onSuccess,
  businessId,
  properties,
  preselectedPropertyId,
}: AddTenantModalProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab 1: Property & Allocation
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>("");
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>("");
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);

  // Tab 2: Tenant Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [tenantType, setTenantType] = useState("Bachelor");

  // Tab 3: Lease Terms
  const todayStr = new Date().toISOString().split("T")[0];
  const [moveInDate, setMoveInDate] = useState(todayStr);
  const [moveOutDate, setMoveOutDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState<number>(9000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(5000);
  const [maintenanceFee, setMaintenanceFee] = useState<number>(1000);
  const [paymentCycle, setPaymentCycle] = useState("Monthly");
  const [foodAddon, setFoodAddon] = useState<boolean>(true);
  const [foodPreference, setFoodPreference] = useState("Both");
  const [durationMonths, setDurationMonths] = useState("12");
  const [lockInPeriod, setLockInPeriod] = useState("3");
  const [noticePeriod, setNoticePeriod] = useState("30");

  // Tab 4: KYC & Emergency
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [motherTongue, setMotherTongue] = useState("");
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [officeInstituteName, setOfficeInstituteName] = useState("");
  const [officeInstituteId, setOfficeInstituteId] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [relationship, setRelationship] = useState("Father");

  // Tab 5: Bill
  const [paySecurityDepositNow, setPaySecurityDepositNow] = useState<boolean>(true);

  // Initialize selected property
  useEffect(() => {
    if (properties.length > 0) {
      const initial =
        preselectedPropertyId && properties.some((p) => p.id === preselectedPropertyId)
          ? preselectedPropertyId
          : properties[0].id;
      setSelectedPropertyId(initial);
    }
  }, [properties, preselectedPropertyId]);

  // Load rooms when property changes
  useEffect(() => {
    if (!selectedPropertyId || !businessId) return;
    setLoadingRooms(true);
    fetchPropertyRoomsAndBeds(businessId, selectedPropertyId)
      .then((res) => {
        setRooms(res);
        if (res.length > 0) {
          const firstFloor = res[0].floor || "1";
          setSelectedFloor(firstFloor);
          const firstRoom = res.find((r) => r.floor === firstFloor) || res[0];
          setSelectedRoomNumber(firstRoom.roomNumber);
          // Auto select first vacant bed
          const vacantBed = firstRoom.beds?.find((b) => !b.isOccupied);
          setSelectedBedNumber(vacantBed ? vacantBed.bedNumber : "1");

          // Auto-apply pricing from property if available
          const prop = properties.find((p) => p.id === selectedPropertyId);
          if (prop?.pricing?.sharing) {
            const row = prop.pricing.sharing.find(
              (s) => s.sharing === firstRoom.sharingType
            );
            if (row) {
              setMonthlyRent(firstRoom.hasAC ? row.ac : row.nonAc);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading rooms:", err))
      .finally(() => setLoadingRooms(false));
  }, [businessId, selectedPropertyId]);

  // When selected room changes, reset bed and update suggested rent
  const handleRoomSelect = (roomNum: string) => {
    setSelectedRoomNumber(roomNum);
    const room = rooms.find((r) => r.roomNumber === roomNum);
    if (room) {
      const vacantBed = room.beds?.find((b) => !b.isOccupied);
      setSelectedBedNumber(vacantBed ? vacantBed.bedNumber : "1");

      const prop = properties.find((p) => p.id === selectedPropertyId);
      if (prop?.pricing?.sharing) {
        const row = prop.pricing.sharing.find(
          (s) => s.sharing === room.sharingType
        );
        if (row) {
          setMonthlyRent(room.hasAC ? row.ac : row.nonAc);
        }
      }
    }
  };

  // Prorated Rent Calculation
  const calculateProratedRent = () => {
    if (!moveInDate) return monthlyRent;
    const date = new Date(moveInDate);
    const day = date.getDate();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (day <= 1) return monthlyRent;
    const remainingDays = daysInMonth - day + 1;
    return Math.round((monthlyRent / daysInMonth) * remainingDays);
  };

  const proratedRent = calculateProratedRent();
  const totalDueAtMoveIn =
    proratedRent +
    (paySecurityDepositNow ? securityDeposit : 0) +
    maintenanceFee;

  const currentProp = properties.find((p) => p.id === selectedPropertyId);
  const currentRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);
  const floors = Array.from(new Set(rooms.map((r) => r.floor || "1")));
  const roomsOnSelectedFloor = rooms.filter((r) => (r.floor || "1") === selectedFloor);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Resident Full Legal Name is required");
      setActiveTab(2);
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg("Valid 10-digit Phone Number is required");
      setActiveTab(2);
      return;
    }
    if (!selectedPropertyId) {
      setErrorMsg("Please select a property");
      setActiveTab(1);
      return;
    }
    if (!selectedRoomNumber) {
      setErrorMsg("Please select a room");
      setActiveTab(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const input: NewTenantInput = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim(),
        email: email.trim(),
        gender,
        dob,
        address: address.trim(),
        nationality,
        motherTongue: motherTongue.trim(),
        idType,
        idNumber: idNumber.trim(),
        officeInstituteName: officeInstituteName.trim(),
        officeInstituteId: officeInstituteId.trim(),
        emergencyName: emergencyName.trim(),
        emergencyPhone: emergencyPhone.trim(),
        relationship,
        propertyId: selectedPropertyId,
        propertyName: currentProp?.name || "OneStay PG",
        roomId: selectedRoomNumber,
        roomNumber: selectedRoomNumber,
        floor: selectedFloor || "1",
        bedIndex: parseInt(selectedBedNumber) - 1 || 0,
        bedNumber: selectedBedNumber || "1",
        moveInDate,
        moveOutDate: moveOutDate || undefined,
        monthlyRent,
        securityDeposit,
        maintenanceFee,
        proratedRent,
        foodAddon,
        foodPreference,
        paymentCycle,
        tenantType,
        paySecurityDepositNow,
      };

      await createTenantWithStay(businessId, input);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating tenant:", err);
      setErrorMsg(err.message || "Failed to create tenant record in Firestore");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { num: 1, title: "Property & Bed", icon: Home },
    { num: 2, title: "Tenant Info", icon: User },
    { num: 3, title: "Lease Terms", icon: FileText },
    { num: 4, title: "Personal & KYC", icon: ShieldCheck },
    { num: 5, title: "Bill & Confirm", icon: Receipt },
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
          maxHeight: "92vh",
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
                Chain: <strong>{currentProp?.businessName || "OneStay"}</strong> ({businessId})
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
              Add Tenant & Check-in Resident
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
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.num;
            return (
              <button
                key={t.num}
                type="button"
                onClick={() => setActiveTab(t.num)}
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
                <span>{t.title}</span>
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

        {/* Form Body */}
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
          {/* TAB 1: Property & Bed Assignment */}
          {activeTab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                1. Select Property, Room & Vacant Bed
              </h3>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Select Property *
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city}) — {p.occupiedBeds} of {p.totalBeds} Beds Occupied
                    </option>
                  ))}
                </select>
              </div>

              {loadingRooms ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
                  Loading rooms and live bed availability...
                </div>
              ) : rooms.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", background: "#FEF3C7", borderRadius: "8px", color: "#92400E", fontSize: "13px" }}>
                  No rooms configured for this property yet. Please configure rooms under Properties & Inventory.
                </div>
              ) : (
                <>
                  {/* Floor selector tabs */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                      Floor
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {floors.map((fl) => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => {
                            setSelectedFloor(fl);
                            const rOnFl = rooms.filter((r) => (r.floor || "1") === fl);
                            if (rOnFl.length > 0) handleRoomSelect(rOnFl[0].roomNumber);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: selectedFloor === fl ? "2px solid #059669" : "1px solid #CBD5E1",
                            background: selectedFloor === fl ? "#ECFDF5" : "#FFFFFF",
                            color: selectedFloor === fl ? "#059669" : "#475569",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Floor {fl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rooms Grid */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                      Select Room on Floor {selectedFloor}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                      {roomsOnSelectedFloor.map((rm) => {
                        const isSelected = selectedRoomNumber === rm.roomNumber;
                        const vacantCount = (rm.beds || []).filter((b) => !b.isOccupied).length;
                        return (
                          <div
                            key={rm.roomNumber}
                            onClick={() => handleRoomSelect(rm.roomNumber)}
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              border: isSelected ? "2px solid #059669" : "1px solid #CBD5E1",
                              background: isSelected ? "#F0FDF4" : "#FFFFFF",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "14px", color: "#0F172A" }}>Room {rm.roomNumber}</strong>
                              <span style={{ fontSize: "11px", color: rm.hasAC ? "#059669" : "#64748B", fontWeight: 700 }}>
                                {rm.hasAC ? "AC" : "Non-AC"}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                              {rm.sharingType}-Sharing
                            </div>
                            <div style={{ fontSize: "11px", color: vacantCount > 0 ? "#059669" : "#DC2626", fontWeight: 700, marginTop: "6px" }}>
                              {vacantCount > 0 ? `${vacantCount} Bed(s) Available` : "Full"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bed Selector */}
                  {currentRoom && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                        Select Bed in Room {selectedRoomNumber} *
                      </label>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {(currentRoom.beds || []).map((bed) => {
                          const isOccupied = bed.isOccupied;
                          const isSelected = selectedBedNumber === bed.bedNumber;
                          return (
                            <button
                              key={bed.bedNumber}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => setSelectedBedNumber(bed.bedNumber)}
                              style={{
                                padding: "10px 18px",
                                borderRadius: "8px",
                                border: isOccupied
                                  ? "1px solid #CBD5E1"
                                  : isSelected
                                  ? "2px solid #059669"
                                  : "1px solid #CBD5E1",
                                background: isOccupied
                                  ? "#F1F5F9"
                                  : isSelected
                                  ? "#ECFDF5"
                                  : "#FFFFFF",
                                color: isOccupied
                                  ? "#94A3B8"
                                  : isSelected
                                  ? "#059669"
                                  : "#0F172A",
                                fontWeight: 700,
                                fontSize: "13px",
                                cursor: isOccupied ? "not-allowed" : "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <span>Bed {bed.bedNumber}</span>
                              <span style={{ fontSize: "10px", fontWeight: 600 }}>
                                {isOccupied ? "Occupied" : "Vacant"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: Tenant Info & Identity */}
          {activeTab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                2. Resident Personal Identity & Contact
              </h3>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Alternate Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Optional backup number"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Tenant Type
                  </label>
                  <select
                    value={tenantType}
                    onChange={(e) => setTenantType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Student">Student</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                  Gender *
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: gender === g ? "2px solid #059669" : "1px solid #CBD5E1",
                        background: gender === g ? "#ECFDF5" : "#FFFFFF",
                        color: gender === g ? "#059669" : "#475569",
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
            </div>
          )}

          {/* TAB 3: Lease & Commercial Terms */}
          {activeTab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                3. Lease Dates, Monthly Rent & Deposit Terms
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Expected Move-out Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Maintenance Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Billing Cycle
                  </label>
                  <select
                    value={paymentCycle}
                    onChange={(e) => setPaymentCycle(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Lock-in Period (Months)
                  </label>
                  <input
                    type="number"
                    value={lockInPeriod}
                    onChange={(e) => setLockInPeriod(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Food Addon */}
              <div style={{ padding: "14px", border: "1px solid #E2E8F0", borderRadius: "10px", background: "#F8FAFC" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                  <input
                    type="checkbox"
                    checked={foodAddon}
                    onChange={(e) => setFoodAddon(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                  />
                  Food / Mess Subscription Included
                </label>
                {foodAddon && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    {["Both", "Veg", "Non-Veg"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFoodPreference(p)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          border: foodPreference === p ? "2px solid #059669" : "1px solid #CBD5E1",
                          background: foodPreference === p ? "#ECFDF5" : "#FFFFFF",
                          color: foodPreference === p ? "#059669" : "#475569",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Personal Details & Emergency (KYC) */}
          {activeTab === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                4. KYC Documents & Emergency Contact
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    ID Proof Type *
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    ID Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12-digit Aadhaar / PAN"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Mother Tongue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hindi, Marathi, Telugu"
                    value={motherTongue}
                    onChange={(e) => setMotherTongue(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Permanent Home Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Full permanent residential address as per Govt ID"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Company / University Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, TCS, COEP"
                    value={officeInstituteName}
                    onChange={(e) => setOfficeInstituteName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Employee / Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP102934"
                    value={officeInstituteId}
                    onChange={(e) => setOfficeInstituteId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="Parent / Guardian Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Friend">Friend</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Bill & Confirmation */}
          {activeTab === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                5. Commercial Calculation & Move-in Summary
              </h3>

              {/* Summary Card */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#0F172A" }}>{fullName || "Resident"}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      {currentProp?.name} • Room {selectedRoomNumber} • Bed {selectedBedNumber}
                    </div>
                  </div>
                  <span style={{ padding: "4px 10px", background: "#ECFDF5", color: "#059669", borderRadius: "6px", fontWeight: 700, fontSize: "12px" }}>
                    Ready for Check-in
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", borderTop: "1px solid #E2E8F0", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Monthly Base Rent:</span>
                    <strong style={{ color: "#0F172A" }}>₹{monthlyRent.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Move-in Date:</span>
                    <span>{moveInDate}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Prorated Rent for Current Month:</span>
                    <strong style={{ color: "#059669" }}>₹{proratedRent.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Security Deposit:</span>
                    <span>₹{securityDeposit.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>One-time Maintenance Fee:</span>
                    <span>₹{maintenanceFee.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "2px dashed #CBD5E1",
                  }}
                >
                  <strong style={{ fontSize: "15px", color: "#0F172A" }}>Total Payable at Check-in:</strong>
                  <strong style={{ fontSize: "20px", color: "#059669" }}>₹{totalDueAtMoveIn.toLocaleString()}</strong>
                </div>
              </div>

              {/* Pay Security Deposit Now Toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={paySecurityDepositNow}
                  onChange={(e) => setPaySecurityDepositNow(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                />
                Collect Security Deposit (₹{securityDeposit}) at initial check-in
              </label>

              <div style={{ padding: "12px 16px", background: "#EFF6FF", borderRadius: "10px", fontSize: "12px", color: "#1E40AF" }}>
                Upon confirmation, the selected bed will be marked occupied in Firestore, an active stay record will be registered under the resident, and a digital check-in confirmation will be generated.
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
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
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

              {activeTab < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
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
                  {isSubmitting ? "Allocating Bed & Saving..." : "Confirm & Complete Check-in"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
