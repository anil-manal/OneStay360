"use client";

import React, { useState, useEffect } from "react";
import {
  PropertyData,
  createTenantWithStay,
  NewTenantInput,
  fetchPropertyRoomsAndBeds,
  fetchTenantProfile,
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
  QrCode,
  Sparkles,
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
  const [maintenanceDeductedFromDeposit, setMaintenanceDeductedFromDeposit] = useState<boolean>(true);
  const [paymentCycle, setPaymentCycle] = useState("Monthly");
  const [rentBillingType, setRentBillingType] = useState("Monthly");
  const [billingDay, setBillingDay] = useState<number>(1);
  const [foodAddon, setFoodAddon] = useState<boolean>(true);
  const [foodDeductionAmount, setFoodDeductionAmount] = useState<number>(0);
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

  // Tab 5: Bill & Proration Calculation
  const [paySecurityDepositNow, setPaySecurityDepositNow] = useState<boolean>(true);
  const [proratedMode, setProratedMode] = useState<"auto" | "daily" | "manual">("auto");
  const [customProratedRent, setCustomProratedRent] = useState<string>("");

  // QR / ID Autofill State (Mobile Parity)
  const [qrInput, setQrInput] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrLoadedSuccess, setQrLoadedSuccess] = useState<string | null>(null);

  const handleLoadTenantFromQrOrId = async (inputStr: string) => {
    let cleanId = inputStr.trim();
    if (cleanId.startsWith("onestay360:tenant:")) {
      cleanId = cleanId.replace("onestay360:tenant:", "");
    }
    if (!cleanId) return;

    try {
      setQrLoading(true);
      setQrLoadedSuccess(null);
      setErrorMsg(null);
      const data = await fetchTenantProfile(cleanId, cleanId);
      if (data) {
        if (data.fullName) setFullName(data.fullName);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.gender) setGender(data.gender as any);
        if (data.dateOfBirth) setDob(data.dateOfBirth);
        if (data.addressLine1) setAddress(data.addressLine1);
        if (data.idNumber) setIdNumber(data.idNumber);
        if (data.officeInstituteName) setOfficeInstituteName(data.officeInstituteName);
        if (data.officeInstituteId) setOfficeInstituteId(data.officeInstituteId);
        if (data.emergencyContactName) setEmergencyName(data.emergencyContactName);
        if (data.emergencyContactPhone) setEmergencyPhone(data.emergencyContactPhone);
        if (data.emergencyContactRelation) setRelationship(data.emergencyContactRelation);
        setQrLoadedSuccess(`Verified Resident Passport loaded for ${data.fullName || cleanId}!`);
      } else {
        setErrorMsg(`No verified profile found for ID: ${cleanId}. Enter details manually.`);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to load tenant: ${err.message}`);
    } finally {
      setQrLoading(false);
    }
  };

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
          if (prop?.pricing) {
            if (prop.pricing.securityDeposit) setSecurityDeposit(prop.pricing.securityDeposit);
            if (prop.pricing.oneTimeMaintenance) setMaintenanceFee(prop.pricing.oneTimeMaintenance);
            if (prop.pricing.maintenanceDeductedFromDeposit !== undefined) {
              setMaintenanceDeductedFromDeposit(prop.pricing.maintenanceDeductedFromDeposit);
            }
            if (prop.pricing.sharing) {
              const row = prop.pricing.sharing.find(
                (s) => s.sharing === firstRoom.sharingType
              );
              if (row) {
                setMonthlyRent(firstRoom.hasAC ? row.ac : row.nonAc);
              }
            } else if (prop.pricing.single && firstRoom.sharingType === 1) {
              setMonthlyRent(prop.pricing.single);
            } else if (prop.pricing.double && firstRoom.sharingType === 2) {
              setMonthlyRent(prop.pricing.double);
            } else if (prop.pricing.triple && firstRoom.sharingType === 3) {
              setMonthlyRent(prop.pricing.triple);
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
      } else if (prop?.pricing) {
        if (room.sharingType === 1 && prop.pricing.single) setMonthlyRent(prop.pricing.single);
        if (room.sharingType === 2 && prop.pricing.double) setMonthlyRent(prop.pricing.double);
        if (room.sharingType === 3 && prop.pricing.triple) setMonthlyRent(prop.pricing.triple);
      }
    }
  };

  // Calculation variables matching Flutter add_tenant_screen.dart
  const monthlyFoodDeduction = !foodAddon ? (foodDeductionAmount || 0) : 0;
  const adjustedMonthlyRent = Math.max(0, monthlyRent - monthlyFoodDeduction);

  // Helper for ordinal day formatting (1st, 2nd, 3rd, etc.)
  const formatOrdinal = (d: number) => {
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1: return `${d}st`;
      case 2: return `${d}nd`;
      case 3: return `${d}rd`;
      default: return `${d}th`;
    }
  };

  // Calculate Prorated Rent matching Flutter AddTenantScreen exactly
  const calculateAutoProratedRent = () => {
    if (!moveInDate || adjustedMonthlyRent <= 0) {
      return { amount: adjustedMonthlyRent, note: "Full month rent" };
    }
    const [y, m, d] = moveInDate.split("-").map(Number);
    const moveInDay = d || 1;
    const daysInMonth = new Date(y, m, 0).getDate();

    if (proratedMode === "daily") {
      const remainingDays = Math.max(1, daysInMonth - moveInDay + 1);
      const amt = Math.round((adjustedMonthlyRent / daysInMonth) * remainingDays);
      return {
        amount: amt,
        note: `Daily prorated: ${remainingDays} days remaining (${moveInDay}/${m}/${y} to month end)`,
      };
    }

    if (proratedMode === "manual" && customProratedRent !== "") {
      const amt = Math.max(0, parseFloat(customProratedRent) || 0);
      return {
        amount: amt,
        note: "Custom manually specified prorated rent",
      };
    }

    // Standard Flutter mobile app rule: 1st-15th = Full month, 16th-31st = Half month
    if (moveInDay >= 1 && moveInDay <= 15) {
      return {
        amount: adjustedMonthlyRent,
        note: `Full month rent (move-in date: ${moveInDay}/${m}/${y} - between 1st to 15th)`,
      };
    } else {
      return {
        amount: Math.round(adjustedMonthlyRent / 2),
        note: `Half month rent (move-in date: ${moveInDay}/${m}/${y} - between 16th to end of month)`,
      };
    }
  };

  const proratedResult = calculateAutoProratedRent();
  const effectiveProratedRent = proratedResult.amount;
  const proratedExplanation = proratedResult.note;

  // First month check-in payable:
  // If maintenance is deducted from deposit, it is NOT added to check-in bill!
  const totalDueAtMoveIn =
    effectiveProratedRent +
    (paySecurityDepositNow ? securityDeposit : 0) +
    (maintenanceDeductedFromDeposit ? 0 : maintenanceFee);

  const refundableDepositAtVacate = Math.max(
    0,
    securityDeposit - (maintenanceDeductedFromDeposit ? maintenanceFee : 0)
  );

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
        maintenanceDeductedFromDeposit,
        proratedRent: effectiveProratedRent,
        proratedExplanation,
        billingDay,
        billingDate: billingDay,
        rentBillingType,
        foodAddon,
        foodPreference,
        foodDeductionAmount: monthlyFoodDeduction,
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  2. Resident Personal Identity &amp; Contact
                </h3>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "4px" }}>
                  Mobile QR Parity
                </span>
              </div>

              {/* Fast QR / Tenant ID Quick-Fill Banner */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  <QrCode size={14} color="#0D9488" />
                  <span>Scan or Paste Resident Passport QR / ID</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Paste onestay360:tenant:... or tenant ID (e.g. TEN0000001)"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <button
                    type="button"
                    disabled={qrLoading || !qrInput.trim()}
                    onClick={() => handleLoadTenantFromQrOrId(qrInput)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      background: "#0D9488",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Sparkles size={12} /> {qrLoading ? "Loading..." : "Auto-Fill"}
                  </button>
                </div>

                {qrLoadedSuccess && (
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#16A34A", fontWeight: 700 }}>
                    {qrLoadedSuccess}
                  </div>
                )}
              </div>

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
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  3. Lease Dates, Monthly Rent & Commercial Terms
                </h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                  Configure personalized rent, deposit terms, billing cycle, and maintenance deduction policy.
                </p>
              </div>

              {/* Dates */}
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
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                    Move-in day ({moveInDate ? new Date(moveInDate).getDate() : 1}) governs first month proration calculation.
                  </div>
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

              {/* Financial Inputs: Rent, Deposit, Maintenance */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                      Monthly Rent (₹) *
                    </label>
                    <span style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>Customizable</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                      Security Deposit (₹) *
                    </label>
                    <span style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>Customizable</span>
                  </div>
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
                    One-time Maintenance (₹)
                  </label>
                  <input
                    type="number"
                    value={maintenanceFee}
                    onChange={(e) => setMaintenanceFee(parseInt(e.target.value) || 0)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Maintenance Deducted From Security Deposit Toggle (Exact Mobile Feature) */}
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: maintenanceDeductedFromDeposit ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                  background: maintenanceDeductedFromDeposit ? "#ECFDF5" : "#F8FAFC",
                  transition: "all 0.2s ease",
                }}
              >
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={maintenanceDeductedFromDeposit}
                    onChange={(e) => setMaintenanceDeductedFromDeposit(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "#059669", marginTop: "2px" }}
                  />
                  <div>
                    <strong style={{ fontSize: "13px", color: "#0F172A", display: "block" }}>
                      Deduct One-Time Maintenance (₹{maintenanceFee.toLocaleString()}) from Security Deposit Refund at Vacating
                    </strong>
                    <p style={{ fontSize: "12px", color: maintenanceDeductedFromDeposit ? "#065F46" : "#64748B", margin: "4px 0 0 0" }}>
                      {maintenanceDeductedFromDeposit ? (
                        <>
                          Full security deposit (₹{securityDeposit.toLocaleString()}) is collected. Maintenance (₹{maintenanceFee.toLocaleString()}) will NOT be added to the first month check-in invoice — it will be deducted from the security deposit refund when tenant vacates. (Refund at exit: ₹{refundableDepositAtVacate.toLocaleString()}).
                        </>
                      ) : (
                        <>
                          Maintenance (₹{maintenanceFee.toLocaleString()}) is charged upfront as a separate one-time fee on the first month check-in invoice. Security deposit remains 100% refundable.
                        </>
                      )}
                    </p>
                  </div>
                </label>
              </div>

              {/* Billing Cycle & Monthly Due Date Selector (Exact Mobile Feature) */}
              <div style={{ padding: "16px", border: "1px solid #E2E8F0", borderRadius: "10px", background: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Monthly Rent Billing Cycle & Due Date
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    Invoice Due: <strong>{formatOrdinal(billingDay)} of every month</strong>
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>
                      Payment Frequency
                    </label>
                    <select
                      value={paymentCycle}
                      onChange={(e) => setPaymentCycle(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "4px" }}>
                      Rent Billing Type
                    </label>
                    <select
                      value={rentBillingType}
                      onChange={(e) => setRentBillingType(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                    >
                      <option value="Monthly">Monthly Recurring</option>
                      <option value="Manual">Manual Collection</option>
                      <option value="Daily">Daily Billing</option>
                      <option value="Weekly">Weekly Billing</option>
                    </select>
                  </div>
                </div>

                {/* Day selector pills */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: "8px" }}>
                    Select Billing Day of Month:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[
                      { day: 1, label: "1st of Month (Standard)" },
                      { day: 5, label: "5th of Month" },
                      { day: 10, label: "10th of Month" },
                      { day: 15, label: "15th of Month" },
                      {
                        day: moveInDate ? new Date(moveInDate).getDate() : 1,
                        label: `Move-in Anniversary (${formatOrdinal(moveInDate ? new Date(moveInDate).getDate() : 1)})`,
                      },
                    ].map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBillingDay(opt.day)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: billingDay === opt.day ? "2px solid #059669" : "1px solid #CBD5E1",
                          background: billingDay === opt.day ? "#ECFDF5" : "#FFFFFF",
                          color: billingDay === opt.day ? "#059669" : "#334155",
                          fontSize: "12px",
                          fontWeight: billingDay === opt.day ? 700 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>or Day:</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={billingDay}
                        onChange={(e) => setBillingDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                        style={{ width: "60px", padding: "6px 8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px", textAlign: "center", fontWeight: 700 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Addon & Deduction (Matching Mobile) */}
              <div style={{ padding: "14px", border: "1px solid #E2E8F0", borderRadius: "10px", background: "#F8FAFC" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                  <input
                    type="checkbox"
                    checked={foodAddon}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFoodAddon(checked);
                      if (!checked && foodDeductionAmount === 0 && monthlyRent > 0) {
                        setFoodDeductionAmount(Math.round(monthlyRent * 0.1));
                      }
                    }}
                    style={{ width: "16px", height: "16px", accentColor: "#059669" }}
                  />
                  Food / Mess Subscription Included
                </label>

                {foodAddon ? (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Meal Preference:</span>
                    {["Both", "Veg", "Non-Veg"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFoodPreference(p)}
                        style={{
                          padding: "4px 12px",
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
                ) : (
                  <div style={{ marginTop: "12px", padding: "10px", background: "#FEF3C7", borderRadius: "8px", border: "1px solid #FDE68A" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
                          Food Excluded — Monthly Rent Deduction
                        </div>
                        <div style={{ fontSize: "11px", color: "#B45309" }}>
                          Deduction will be subtracted from monthly base rent before proration.
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#92400E" }}>Deduct ₹:</span>
                        <input
                          type="number"
                          value={foodDeductionAmount}
                          onChange={(e) => setFoodDeductionAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          style={{ width: "100px", padding: "6px 8px", border: "1px solid #F59E0B", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lock-in & Notice */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Lease Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #CBD5E1", borderRadius: "8px", fontSize: "13px" }}
                  />
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

          {/* TAB 5: Bill & Confirmation (1:1 Mobile Parity with Flutter _buildBillTab) */}
          {activeTab === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    5. First Month Commercials & Move-in Calculation
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Exact transparent breakdown matching OneStay360 mobile business application.
                  </p>
                </div>
                <div style={{ padding: "4px 10px", background: "#ECFDF5", color: "#059669", borderRadius: "6px", fontWeight: 700, fontSize: "12px" }}>
                  {currentProp?.name} • Room {selectedRoomNumber} • Bed {selectedBedNumber}
                </div>
              </div>

              {/* SECTION: First Month Charges & Proration Controls */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                    Prorated Rent for Current Month (₹)
                  </label>

                  {/* Mode switcher tabs */}
                  <div style={{ display: "flex", gap: "4px", background: "#F1F5F9", padding: "3px", borderRadius: "8px" }}>
                    {[
                      { mode: "auto", label: "Mobile Rule (1-15 / 16-31)" },
                      { mode: "daily", label: "Daily Prorated" },
                      { mode: "manual", label: "Manual Edit" },
                    ].map((tab) => (
                      <button
                        key={tab.mode}
                        type="button"
                        onClick={() => {
                          setProratedMode(tab.mode as any);
                          if (tab.mode === "manual" && !customProratedRent) {
                            setCustomProratedRent(effectiveProratedRent.toString());
                          }
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "11px",
                          fontWeight: proratedMode === tab.mode ? 700 : 500,
                          background: proratedMode === tab.mode ? "#FFFFFF" : "transparent",
                          color: proratedMode === tab.mode ? "#0F172A" : "#64748B",
                          cursor: "pointer",
                          boxShadow: proratedMode === tab.mode ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prorated Rent Input */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "#64748B", fontSize: "14px" }}>₹</span>
                    <input
                      type="number"
                      value={proratedMode === "manual" ? customProratedRent : effectiveProratedRent}
                      onChange={(e) => {
                        setProratedMode("manual");
                        setCustomProratedRent(e.target.value);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 28px",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#0F172A",
                        background: proratedMode === "manual" ? "#FFFBEB" : "#F8FAFC",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>
                    Move-in: <strong>{moveInDate}</strong>
                  </span>
                </div>

                {/* Explanation Banner */}
                <div style={{ padding: "10px 14px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", fontSize: "12px", color: "#1D4ED8", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>{proratedExplanation}</span>
                </div>

                {/* Food deduction explanation if applicable */}
                {!foodAddon && monthlyFoodDeduction > 0 && (
                  <div style={{ marginTop: "10px", padding: "10px 14px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", fontSize: "12px", color: "#065F46" }}>
                    <strong>Food Deduction Applied:</strong> Monthly Rent ₹{monthlyRent.toLocaleString()} - Food Deduction ₹{monthlyFoodDeduction.toLocaleString()} = Adjusted Monthly Rent ₹{adjustedMonthlyRent.toLocaleString()}.
                  </div>
                )}
              </div>

              {/* SECTION: Security Deposit & Maintenance Policy */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Security deposit option */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: paySecurityDepositNow ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                    background: paySecurityDepositNow ? "#F0FDF4" : "#F8FAFC",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={paySecurityDepositNow}
                      onChange={(e) => setPaySecurityDepositNow(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#059669", marginTop: "2px" }}
                    />
                    <div>
                      <strong style={{ fontSize: "13px", color: "#0F172A" }}>
                        Security Deposit: ₹{securityDeposit.toLocaleString()}
                      </strong>
                      <div style={{ fontSize: "12px", color: paySecurityDepositNow ? "#065F46" : "#64748B", marginTop: "2px" }}>
                        {paySecurityDepositNow ? "Collect at initial check-in (Pay Now)" : "Collect later — not added to first month bill"}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Maintenance status */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: maintenanceDeductedFromDeposit ? "1px solid #FED7AA" : "1px solid #E2E8F0",
                    background: maintenanceDeductedFromDeposit ? "#FFF7ED" : "#F8FAFC",
                  }}
                >
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={maintenanceDeductedFromDeposit}
                      onChange={(e) => setMaintenanceDeductedFromDeposit(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#EA580C", marginTop: "2px" }}
                    />
                    <div>
                      <strong style={{ fontSize: "13px", color: "#0F172A" }}>
                        Deduct Maintenance from Deposit
                      </strong>
                      <div style={{ fontSize: "12px", color: maintenanceDeductedFromDeposit ? "#9A3412" : "#64748B", marginTop: "2px" }}>
                        {maintenanceDeductedFromDeposit
                          ? `₹${maintenanceFee.toLocaleString()} will be deducted from refund at vacating (₹0 upfront)`
                          : `₹${maintenanceFee.toLocaleString()} charged upfront as one-time fee`}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION: Maintenance Deduction Note */}
              {maintenanceDeductedFromDeposit && maintenanceFee > 0 && (
                <div style={{ padding: "12px 16px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", fontSize: "12px", color: "#92400E" }}>
                  <strong>Vacating Refund Policy:</strong> Full security deposit (₹{securityDeposit.toLocaleString()}) is collected upfront. Maintenance fee (₹{maintenanceFee.toLocaleString()}) will be deducted from the security deposit refund when the tenant vacates. <strong>Net Refund at Move-out: ₹{refundableDepositAtVacate.toLocaleString()}</strong>.
                </div>
              )}

              {/* TOTAL FIRST MONTH CHARGE BANNER */}
              <div
                style={{
                  background: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  color: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.2)",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.9, fontWeight: 700 }}>
                    Total Due at Initial Check-in
                  </span>
                  <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "2px" }}>
                    Recurring monthly due date: <strong>{formatOrdinal(billingDay)} of every month</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-1px" }}>
                    ₹{totalDueAtMoveIn.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* COMPLETE ITEMISED BREAKDOWN CARD (Exact Mobile Parity) */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
                  <Receipt size={16} style={{ color: "#059669" }} />
                  <strong style={{ fontSize: "14px", color: "#0F172A" }}>First Month Commercial Breakdown</strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Base Monthly Rent:</span>
                    <strong style={{ color: "#0F172A" }}>₹{monthlyRent.toLocaleString()}</strong>
                  </div>

                  {!foodAddon && monthlyFoodDeduction > 0 && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#DC2626" }}>
                        <span>Less: Food Deduction (Monthly):</span>
                        <strong>- ₹{monthlyFoodDeduction.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                        <span>Adjusted Monthly Rent:</span>
                        <strong>₹{adjustedMonthlyRent.toLocaleString()}</strong>
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "#64748B" }}>Prorated Rent (Move-in Month):</span>
                      <div style={{ fontSize: "11px", color: "#059669", fontStyle: "italic" }}>
                        {proratedExplanation}
                      </div>
                    </div>
                    <strong style={{ color: "#059669", fontSize: "14px" }}>₹{effectiveProratedRent.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ color: "#64748B" }}>Security Deposit:</span>
                      {!paySecurityDepositNow && (
                        <span style={{ fontSize: "11px", color: "#EA580C", marginLeft: "6px" }}>(Pay later)</span>
                      )}
                    </div>
                    <strong style={{ color: "#0F172A" }}>
                      {paySecurityDepositNow ? `₹${securityDeposit.toLocaleString()}` : "₹0 (Pay later)"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ color: "#64748B" }}>One-time Maintenance Fee:</span>
                      {maintenanceDeductedFromDeposit ? (
                        <div style={{ fontSize: "11px", color: "#D97706", fontStyle: "italic" }}>
                          ₹{maintenanceFee.toLocaleString()} deducted from deposit refund when tenant vacates
                        </div>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Charged upfront</div>
                      )}
                    </div>
                    <strong style={{ color: "#0F172A" }}>
                      {maintenanceDeductedFromDeposit ? "₹0 (Deducted at exit)" : `₹${maintenanceFee.toLocaleString()}`}
                    </strong>
                  </div>

                  <div style={{ borderTop: "2px dashed #CBD5E1", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>Total Check-in Payable:</strong>
                    <strong style={{ fontSize: "18px", color: "#059669" }}>₹{totalDueAtMoveIn.toLocaleString("en-IN")}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B", paddingTop: "4px" }}>
                    <span>Refundable Deposit on Vacating:</span>
                    <strong style={{ color: "#0F172A" }}>₹{refundableDepositAtVacate.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>

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
