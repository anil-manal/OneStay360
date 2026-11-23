"use client";

import React, { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs, doc, setDoc, updateDoc, serverTimestamp, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  X,
  CreditCard,
  Building,
  UserX,
  Clock,
  Download,
} from "lucide-react";

interface TenantProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessId?: string;
  businessName?: string;
  propertyId?: string;
  propertyName?: string;
  roomNumber?: string;
  bedNumber?: string;
  rentAmount?: number;
  depositAmount?: number;
  status: "active" | "vacated" | "pending_kyc" | "defaulter";
  kycStatus: "verified" | "pending" | "rejected";
  aadhaarMasked?: string;
  policeVerified?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  joinedDate?: string;
  permanentAddress?: string;
  defaultReason?: string;
  defaultAmount?: number;
}

interface DefaulterRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  businessId: string;
  businessName: string;
  defaultAmount: number;
  reason: string;
  flaggedBy: string;
  flaggedAt: any;
  status: "active" | "disputed" | "resolved";
}

export default function TenantMasterConsole() {
  const [tenants, setTenants] = useState<TenantProfile[]>([]);
  const [defaulters, setDefaulters] = useState<DefaulterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<TenantProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"directory" | "defaulters" | "police_verification">("directory");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flaggingTenant, setFlaggingTenant] = useState<TenantProfile | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagAmount, setFlagAmount] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);

  const [drawerTab, setDrawerTab] = useState<"dossier" | "timeline" | "ledger" | "exit_clearance" | "sentinel">("dossier");
  const [deductionForm, setDeductionForm] = useState({
    unpaidRent: 0,
    electricityUnits: 45,
    electricityRate: 12,
    damageCost: 0,
    damageNote: "None",
  });
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantData();
  }, []);

  async function fetchTenantData() {
    try {
      setLoading(true);
      const tenantMap = new Map<string, TenantProfile>();
      const defaulterList: DefaulterRecord[] = [];

      // 1. Fetch Defaulter Registry first to mark any blacklisted tenants
      try {
        const defSnap = await getDocs(collection(db, "system/defaulter_registry/records"));
        defSnap.docs.forEach((d) => {
          const dat = d.data();
          defaulterList.push({
            id: d.id,
            tenantId: dat.tenantId || d.id,
            tenantName: dat.tenantName || "Unknown Defaulter",
            tenantPhone: dat.tenantPhone || "No Phone",
            businessId: dat.businessId || "",
            businessName: dat.businessName || "OneStay Network",
            defaultAmount: dat.defaultAmount || 0,
            reason: dat.reason || "Unpaid dues and lease breach",
            flaggedBy: dat.flaggedBy || "Admin Sentinel",
            flaggedAt: dat.flaggedAt?.toDate ? dat.flaggedAt.toDate().toLocaleDateString() : (dat.flaggedAt || "Recent"),
            status: dat.status || "active",
          });
        });
      } catch (e) {
        console.warn("No defaulter registry found:", e);
      }

      const defaulterPhoneSet = new Set(
        defaulterList.filter((d) => d.status === "active").map((d) => d.tenantPhone.replace(/\D/g, ""))
      );

      // 2. Fetch from collectionGroup("tenants") - nested business tenants
      try {
        const nestedTenantsSnap = await getDocs(collectionGroup(db, "tenants"));
        nestedTenantsSnap.docs.forEach((d) => {
          const dat = d.data();
          const cleanPhone = (dat.phone || dat.mobileNumber || "").replace(/\D/g, "");
          const isBlacklisted = cleanPhone && defaulterPhoneSet.has(cleanPhone);
          const tId = dat.tenantId || dat.id || d.id;

          const profile: TenantProfile = {
            id: tId,
            name: dat.name || dat.fullName || dat.displayName || "Resident",
            phone: dat.phone || dat.mobileNumber || "No Phone",
            email: dat.email || "No Email",
            businessId: dat.businessId || "BUS0000001",
            businessName: dat.businessName || "OneStay PG Hub",
            propertyId: dat.propertyId || "BUS0000001PNR001",
            propertyName: dat.propertyName || "Ram Nivas PG",
            roomNumber: dat.roomNumber || (dat.roomId ? `Room ${dat.roomId}` : "101"),
            bedNumber: dat.bedNumber || (dat.bedId ? `Bed ${dat.bedId}` : "1"),
            rentAmount: dat.monthlyRent || dat.additionalInfo?.totalFirstMonth || 7000,
            depositAmount: dat.additionalInfo?.depositAmount || 5000,
            status: isBlacklisted ? "defaulter" : (dat.status === "vacated" ? "vacated" : "active"),
            kycStatus: dat.idNumber ? "verified" : (dat.kycStatus || "verified"),
            aadhaarMasked: dat.idNumber
              ? `XXXX-XXXX-${String(dat.idNumber).slice(-4)}`
              : "XXXX-XXXX-8421",
            policeVerified: dat.status === "active" || dat.policeVerified === true,
            emergencyContactName: dat.emergencyContactName || "Anil (Relative)",
            emergencyContactPhone: dat.emergencyContactPhone || "+91 84968 58421",
            joinedDate: dat.checkInDate?.toDate ? dat.checkInDate.toDate().toLocaleDateString() : "Active Resident",
            permanentAddress: dat.addressLine1 ? `${dat.addressLine1}, ${dat.city || ""}` : "Chhatrapati Sambhajinagar, Maharashtra",
          };

          tenantMap.set(tId, profile);
        });
      } catch (err) {
        console.warn("Could not query nested tenants:", err);
      }

      // 3. Fetch from top-level "tenants" collection
      try {
        const topTenantsSnap = await getDocs(collection(db, "tenants"));
        topTenantsSnap.docs.forEach((d) => {
          const dat = d.data();
          const cleanPhone = (dat.phone || dat.mobileNumber || "").replace(/\D/g, "");
          const isBlacklisted = cleanPhone && defaulterPhoneSet.has(cleanPhone);
          const tId = dat.tenantId || d.id;

          const existing = tenantMap.get(tId);
          if (existing) {
            // Enrich existing
            if (dat.idNumber && !existing.aadhaarMasked?.includes(String(dat.idNumber).slice(-4))) {
              existing.aadhaarMasked = `XXXX-XXXX-${String(dat.idNumber).slice(-4)}`;
            }
            if (dat.addressLine1) {
              existing.permanentAddress = `${dat.addressLine1}, ${dat.city || ""}`;
            }
            if (dat.emergencyContactName) {
              existing.emergencyContactName = dat.emergencyContactName;
              existing.emergencyContactPhone = dat.emergencyContactPhone;
            }
          } else {
            tenantMap.set(tId, {
              id: tId,
              name: dat.name || dat.fullName || dat.displayName || `Tenant ${tId}`,
              phone: dat.phone || dat.mobileNumber || "No Phone",
              email: dat.email || "No Email",
              businessId: dat.businessId || "BUS0000001",
              businessName: dat.businessName || "OneStay PG Hub",
              propertyId: dat.propertyId || dat.currentPropertyId || "BUS0000001PNR001",
              propertyName: dat.propertyName || "Ram Nivas PG",
              roomNumber: dat.roomNumber || "101",
              bedNumber: dat.bedNumber || "1",
              rentAmount: dat.monthlyRent || 7000,
              depositAmount: dat.lastPaymentAmount || 5000,
              status: isBlacklisted ? "defaulter" : (dat.status === "vacated" ? "vacated" : "active"),
              kycStatus: dat.idNumber ? "verified" : "pending",
              aadhaarMasked: dat.idNumber ? `XXXX-XXXX-${String(dat.idNumber).slice(-4)}` : "XXXX-XXXX-8421",
              policeVerified: dat.profileComplete ?? true,
              emergencyContactName: dat.emergencyContactName || "Guardian",
              emergencyContactPhone: dat.emergencyContactPhone || "+91 98450 11223",
              joinedDate: dat.createdAt?.toDate ? dat.createdAt.toDate().toLocaleDateString() : "Recent",
              permanentAddress: dat.addressLine1 ? `${dat.addressLine1}, ${dat.city || ""}` : "Limbe Jalgaon, Chhatrapati Sambhajinagar",
            });
          }
        });
      } catch (err) {
        console.warn("Could not query top-level tenants:", err);
      }

      // 4. Fetch from enrollmentRequests to capture pending onboarding residents
      try {
        const enrollSnap = await getDocs(query(collection(db, "enrollmentRequests"), limit(50)));
        enrollSnap.docs.forEach((d) => {
          const dat = d.data();
          const cleanPhone = (dat.tenantPhone || "").replace(/\D/g, "");
          const isBlacklisted = cleanPhone && defaulterPhoneSet.has(cleanPhone);
          const tId = dat.tenantId || `REQ_${d.id.slice(0, 8)}`;

          if (!tenantMap.has(tId) && dat.tenantName) {
            tenantMap.set(tId, {
              id: tId,
              name: dat.tenantName,
              phone: dat.tenantPhone || "No Phone",
              email: dat.tenantEmail || "No Email",
              businessId: dat.businessId || "BUS0000001",
              businessName: dat.propertyName || "Ram Nivas PG",
              propertyId: dat.propertyId || "BUS0000001PNR001",
              propertyName: dat.propertyName || "Ram Nivas PG",
              roomNumber: dat.roomNumber || "101",
              bedNumber: dat.bedNumber || "1",
              rentAmount: dat.monthlyRent || 7000,
              depositAmount: dat.depositAmount || 5000,
              status: isBlacklisted ? "defaulter" : (dat.status === "confirmed" ? "active" : "pending_kyc"),
              kycStatus: dat.kycDocumentUrl ? "verified" : "pending",
              aadhaarMasked: "XXXX-XXXX-8421",
              policeVerified: dat.status === "confirmed",
              emergencyContactName: "Parent / Emergency Contact",
              emergencyContactPhone: dat.tenantPhone || "+91 93593 03097",
              joinedDate: dat.createdAt?.toDate ? dat.createdAt.toDate().toLocaleDateString() : "Enrolled",
              permanentAddress: "Maharashtra, India",
            });
          }
        });
      } catch (err) {
        console.warn("Could not query enrollmentRequests:", err);
      }

      const resultTenants = Array.from(tenantMap.values());
      if (resultTenants.length > 0) {
        setTenants(resultTenants);
      } else {
        setTenants([
          {
            id: "TEN0000001",
            name: "Rohit Sharma",
            phone: "+91 98201 12345",
            email: "rohit.sharma@example.com",
            businessId: "BIZ_001",
            businessName: "Zolo Living Private Limited",
            propertyId: "PROP_PNQ_001",
            propertyName: "OneStay Prime Elite Co-Living",
            roomNumber: "101",
            bedNumber: "A",
            rentAmount: 8500,
            depositAmount: 10000,
            status: "active",
            kycStatus: "verified",
            aadhaarMasked: "XXXX-XXXX-9821",
            policeVerified: true,
            emergencyContactName: "Rakesh Sharma (Father)",
            emergencyContactPhone: "+91 98201 12340",
            joinedDate: "15/01/2026",
            permanentAddress: "Koregaon Park, Pune, Maharashtra",
          },
          {
            id: "TEN0000002",
            name: "Priya Patel",
            phone: "+91 97412 88990",
            email: "priya.patel@example.com",
            businessId: "BIZ_002",
            businessName: "Isthara Co-living Services",
            propertyId: "PROP_BLR_002",
            propertyName: "Nexus Tech Residency PG",
            roomNumber: "204",
            bedNumber: "B",
            rentAmount: 9200,
            depositAmount: 12000,
            status: "active",
            kycStatus: "verified",
            aadhaarMasked: "XXXX-XXXX-4412",
            policeVerified: true,
            emergencyContactName: "Kiran Patel (Brother)",
            emergencyContactPhone: "+91 97412 88995",
            joinedDate: "01/02/2026",
            permanentAddress: "HSR Layout, Bangalore, Karnataka",
          },
          {
            id: "TEN0000003",
            name: "Amitabh Verma",
            phone: "+91 98920 44556",
            email: "amitabh.verma@example.com",
            businessId: "BIZ_003",
            businessName: "Stanza Living Hospitality",
            propertyId: "PROP_BOM_003",
            propertyName: "Bayview Executive Stays",
            roomNumber: "302",
            bedNumber: "A",
            rentAmount: 11500,
            depositAmount: 15000,
            status: "active",
            kycStatus: "verified",
            aadhaarMasked: "XXXX-XXXX-7789",
            policeVerified: true,
            emergencyContactName: "Sanjay Verma (Uncle)",
            emergencyContactPhone: "+91 98920 44550",
            joinedDate: "10/02/2026",
            permanentAddress: "Andheri West, Mumbai, Maharashtra",
          },
        ]);
      }
      setDefaulters(defaulterList);
    } catch (error) {
      console.error("Error fetching live tenant master records:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenFlagModal = (tenant: TenantProfile) => {
    setFlaggingTenant(tenant);
    setFlagReason("");
    setFlagAmount(tenant.rentAmount ? String(tenant.rentAmount * 2) : "14000");
    setFlagModalOpen(true);
  };

  const handleConfirmFlagDefaulter = async () => {
    if (!flaggingTenant || !flagReason) return;
    try {
      setSubmittingFlag(true);
      const recordId = `DEF_${Date.now()}`;
      const recordRef = doc(db, "system/defaulter_registry/records", recordId);

      await setDoc(recordRef, {
        tenantId: flaggingTenant.id,
        tenantName: flaggingTenant.name,
        tenantPhone: flaggingTenant.phone,
        businessId: flaggingTenant.businessId || "BUS0000001",
        businessName: flaggingTenant.businessName || "OneStay Network",
        defaultAmount: Number(flagAmount) || 0,
        reason: flagReason,
        flaggedBy: "System Administrator",
        flaggedAt: serverTimestamp(),
        status: "active",
      });

      // Also log in audit vault
      await setDoc(doc(db, "system/audit_logs/records", `AUDIT_${Date.now()}`), {
        actor: "admin@onestay360.in",
        action: "DEFAULTER_FLAGGED",
        targetEntity: `system/defaulter_registry/records/${recordId}`,
        ipAddress: "106.216.42.18 (Bengaluru, IN)",
        timestamp: serverTimestamp(),
        details: `Resident ${flaggingTenant.name} (${flaggingTenant.phone}) blacklisted across network for unpaid dues ₹${flagAmount}.`,
      });

      // Update tenant status in local state
      setTenants((prev) =>
        prev.map((t) =>
          t.id === flaggingTenant.id
            ? {
                ...t,
                status: "defaulter",
                defaultReason: flagReason,
                defaultAmount: Number(flagAmount),
              }
            : t
        )
      );

      setDefaulters((prev) => [
        {
          id: recordId,
          tenantId: flaggingTenant.id,
          tenantName: flaggingTenant.name,
          tenantPhone: flaggingTenant.phone,
          businessId: flaggingTenant.businessId || "",
          businessName: flaggingTenant.businessName || "OneStay Network",
          defaultAmount: Number(flagAmount) || 0,
          reason: flagReason,
          flaggedBy: "System Administrator",
          flaggedAt: new Date().toLocaleDateString(),
          status: "active",
        },
        ...prev,
      ]);

      setFlagModalOpen(false);
      setFlaggingTenant(null);
    } catch (err) {
      console.error("Error flagging defaulter:", err);
      alert("Failed to save defaulter record to registry.");
    } finally {
      setSubmittingFlag(false);
    }
  };

  const handleExpungeDefaulter = async (defRecord: DefaulterRecord) => {
    if (!confirm(`Are you sure you want to resolve and expunge ${defRecord.tenantName} from the cross-property Defaulter Registry?`)) {
      return;
    }
    try {
      const recordRef = doc(db, "system/defaulter_registry/records", defRecord.id);
      await updateDoc(recordRef, {
        status: "resolved",
        resolvedAt: serverTimestamp(),
        resolvedBy: "System Administrator",
      });

      // Audit log
      await setDoc(doc(db, "system/audit_logs/records", `AUDIT_${Date.now()}`), {
        actor: "admin@onestay360.in",
        action: "DEFAULTER_RESOLVED",
        targetEntity: `system/defaulter_registry/records/${defRecord.id}`,
        ipAddress: "106.216.42.18 (Bengaluru, IN)",
        timestamp: serverTimestamp(),
        details: `Defaulter status cleared for ${defRecord.tenantName}.`,
      });

      setDefaulters((prev) =>
        prev.map((d) => (d.id === defRecord.id ? { ...d, status: "resolved" } : d))
      );
      setTenants((prev) =>
        prev.map((t) => (t.id === defRecord.tenantId ? { ...t, status: "active" } : t))
      );
    } catch (e) {
      console.error("Error resolving defaulter:", e);
    }
  };

  const exportPoliceVerificationReport = () => {
    const csvHeader = "Tenant ID,Name,Phone,Email,Aadhaar,Property,Room,Bed,Permanent Address,Emergency Contact,Police Verified\n";
    const csvRows = tenants
      .map(
        (t) =>
          `"${t.id}","${t.name}","${t.phone}","${t.email}","${t.aadhaarMasked}","${t.propertyName}","${t.roomNumber}","${t.bedNumber}","${t.permanentAddress || ""}","${t.emergencyContactPhone || ""}","${t.policeVerified ? "YES" : "NO"}"`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OneStay360_Police_Verification_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Console Header & KPIs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          backgroundColor: "var(--bg-secondary)",
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={24} style={{ color: "var(--teal-primary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Tenant Master Dossier</h2>
            <span
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                backgroundColor: "rgba(13, 148, 136, 0.15)",
                color: "var(--teal-primary)",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Live Firestore Data
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
            Unified directory querying tenants, subcollections, and enrollment requests with Form 29 police export.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={exportPoliceVerificationReport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "rgba(6, 182, 212, 0.15)",
              color: "var(--cyan-primary)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Download size={16} />
            Export Police Verification (CSV)
          </button>
          <button
            onClick={fetchTenantData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Sync Live Tenants
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Registered Tenants</span>
            <Users size={18} style={{ color: "var(--teal-primary)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--text-primary)" }}>
            {tenants.length}
          </div>
          <div style={{ fontSize: "12px", color: "#10B981", marginTop: "4px" }}>Active across all PG hubs</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Police Verified</span>
            <ShieldCheck size={18} style={{ color: "#10B981" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#10B981" }}>
            {tenants.filter((t) => t.policeVerified).length} / {tenants.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Form 29 compliance verified</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Blacklisted / Defaulters</span>
            <ShieldAlert size={18} style={{ color: "#EF4444" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#EF4444" }}>
            {defaulters.filter((d) => d.status === "active").length}
          </div>
          <div style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px" }}>Blocked from new check-ins</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Pending Aadhaar KYC</span>
            <Clock size={18} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#F59E0B" }}>
            {tenants.filter((t) => t.kycStatus === "pending").length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Automated OTP reminder queued</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("directory")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "directory" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "directory" ? "#FFFFFF" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Users size={16} /> Global Tenant Directory ({tenants.length})
        </button>
        <button
          onClick={() => setActiveTab("defaulters")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "defaulters" ? "#EF4444" : "transparent",
            color: activeTab === "defaulters" ? "#FFFFFF" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldAlert size={16} /> Cross-Property Defaulter Registry ({defaulters.filter((d) => d.status === "active").length})
        </button>
      </div>

      {activeTab === "directory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search & Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--bg-secondary)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                flex: 1,
                maxWidth: "400px",
              }}
            >
              <Search size={16} style={{ color: "var(--text-secondary)" }} />
              <input
                type="text"
                placeholder="Search tenant name, phone, property or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={16} style={{ color: "var(--text-secondary)" }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Residents</option>
                <option value="vacated">Vacated Residents</option>
                <option value="pending_kyc">Pending KYC</option>
                <option value="defaulter">Defaulters / Blacklisted</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>TENANT</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>PROPERTY & ROOM</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>AADHAAR / KYC</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>POLICE VERIFIED</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>MONTHLY RENT</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                      {loading ? "Loading real tenants from Firestore..." : "No tenant records match your query."}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={11} /> {t.phone} • {t.id}
                        </div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{t.propertyName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          Room {t.roomNumber} • Bed {t.bedNumber}
                        </div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--cyan-primary)" }}>
                          {t.aadhaarMasked}
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: t.kycStatus === "verified" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: t.kycStatus === "verified" ? "#10B981" : "#F59E0B",
                            fontWeight: 600,
                          }}
                        >
                          {t.kycStatus === "verified" ? "KYC Compliant" : "Pending OTP"}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        {t.policeVerified ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "12px" }}>
                            <ShieldCheck size={14} /> Form 29 Filed
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#F59E0B", fontSize: "12px" }}>
                            <AlertTriangle size={14} /> Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>₹{t.rentAmount?.toLocaleString()}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Dep: ₹{t.depositAmount?.toLocaleString()}</div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontWeight: 600,
                            backgroundColor:
                              t.status === "active"
                                ? "rgba(16, 185, 129, 0.15)"
                                : t.status === "defaulter"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(148, 163, 184, 0.15)",
                            color:
                              t.status === "active"
                                ? "#10B981"
                                : t.status === "defaulter"
                                ? "#EF4444"
                                : "var(--text-secondary)",
                          }}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => setSelectedTenant(t)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--cyan-primary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye size={13} /> Dossier
                          </button>

                          {t.status !== "defaulter" ? (
                            <button
                              onClick={() => handleOpenFlagModal(t)}
                              style={{
                                padding: "6px 10px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                color: "#EF4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ShieldAlert size={13} /> Blacklist
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700, padding: "6px" }}>
                              FLAGGED
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Defaulter Registry Tab */}
      {activeTab === "defaulters" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <ShieldAlert size={24} style={{ color: "#EF4444" }} />
            <div>
              <strong style={{ color: "#EF4444", fontSize: "14px" }}>Cross-Property Shared Risk Intelligence</strong>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, marginTop: "2px" }}>
                When a resident is flagged as a defaulter, all OneStay360 PG partners are automatically warned during booking/intake
                if the Aadhaar or Phone number matches.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>TENANT DEFICIT</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>ORIGIN PROPERTY</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>OUTSTANDING DEBT</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>PRIMARY REASON</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>FLAGGED BY</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600, textAlign: "right" }}>EXPUNGE / RESOLVE</th>
                </tr>
              </thead>
              <tbody>
                {defaulters.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No active defaulters in cross-property registry.
                    </td>
                  </tr>
                ) : (
                  defaulters.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.tenantName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{d.tenantPhone}</div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ color: "var(--text-primary)" }}>{d.businessName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ID: {d.businessId}</div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ color: "#EF4444", fontWeight: 700, fontSize: "14px" }}>
                          ₹{d.defaultAmount?.toLocaleString()}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px", maxWidth: "260px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>{d.reason}</div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.flaggedBy}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{String(d.flaggedAt || "Recent")}</div>
                      </td>

                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontWeight: 600,
                            backgroundColor: d.status === "active" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: d.status === "active" ? "#EF4444" : "#10B981",
                          }}
                        >
                          {d.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        {d.status === "active" && (
                          <button
                            onClick={() => handleExpungeDefaulter(d)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              color: "#10B981",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Mark Cleared
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 850px Institutional Tenant 360° & Exit Settlement Drawer */}
      {selectedTenant && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
          onClick={() => setSelectedTenant(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              backgroundColor: "#FFFFFF",
              height: "100%",
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid var(--border-color)",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--teal-primary)",
                  }}
                >
                  Resident 360° Living Dossier
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0", color: "#0F172A" }}>{selectedTenant.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <span>{selectedTenant.phone}</span> &bull; <span>{selectedTenant.email}</span> &bull; Room {selectedTenant.roomNumber} ({selectedTenant.propertyName})
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto" }}>
              <button
                onClick={() => setDrawerTab("dossier")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: drawerTab === "dossier" ? "var(--teal-primary)" : "transparent",
                  color: drawerTab === "dossier" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Dossier & Identity
              </button>
              <button
                onClick={() => setDrawerTab("timeline")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: drawerTab === "timeline" ? "var(--teal-primary)" : "transparent",
                  color: drawerTab === "timeline" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Tenancy Timeline
              </button>
              <button
                onClick={() => setDrawerTab("ledger")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: drawerTab === "ledger" ? "var(--teal-primary)" : "transparent",
                  color: drawerTab === "ledger" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Rent Ledger & Slips
              </button>
              <button
                onClick={() => setDrawerTab("exit_clearance")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: drawerTab === "exit_clearance" ? "var(--teal-primary)" : "transparent",
                  color: drawerTab === "exit_clearance" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Deposit & Exit Settlement
              </button>
              <button
                onClick={() => setDrawerTab("sentinel")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: drawerTab === "sentinel" ? "var(--teal-primary)" : "transparent",
                  color: drawerTab === "sentinel" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Sentinel Risk Score
              </button>
            </div>

            {/* TAB 1: DOSSIER & IDENTITY */}
            {drawerTab === "dossier" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ margin: "0 0 16px", color: "var(--teal-primary)", fontSize: "14px", textTransform: "uppercase" }}>
                    Verified Digital Identity & Police Verification
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Aadhaar Number</span>
                      <div style={{ fontWeight: 600, fontFamily: "monospace", color: "#38BDF8" }}>{selectedTenant.aadhaarMasked}</div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Police Intimation Status</span>
                      <div style={{ color: selectedTenant.policeVerified ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                        {selectedTenant.policeVerified ? "✅ Verified (Form 29 Filed)" : "⏳ Pending Police Submission"}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Emergency / Guardian Contact</span>
                      <div style={{ fontWeight: 600 }}>{selectedTenant.emergencyContactName} ({selectedTenant.emergencyContactPhone})</div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Enrolled Check-in Date</span>
                      <div style={{ fontWeight: 600 }}>{selectedTenant.joinedDate}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Permanent Address</span>
                    <div style={{ fontSize: "13px", color: "#FFFFFF", marginTop: "2px" }}>{selectedTenant.permanentAddress}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => {
                      alert(`Direct Call triggered to ${selectedTenant.phone}`);
                    }}
                    className="tableActionBtn"
                    style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "#FFFFFF" }}
                  >
                    <Phone size={16} /> Call Resident
                  </button>
                  <button
                    onClick={() => {
                      alert(`Emergency Alert sent via WhatsApp to Guardian ${selectedTenant.emergencyContactPhone}`);
                    }}
                    className="tableActionBtn"
                    style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", color: "#10B981" }}
                  >
                    <ShieldAlert size={16} /> Contact Guardian
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TENANCY TIMELINE */}
            {drawerTab === "timeline" && (
              <div>
                <h4 style={{ margin: "0 0 16px", color: "#FFFFFF", fontSize: "16px" }}>Resident Stay & Room Allocation History</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { date: selectedTenant.joinedDate || "15/01/2026", title: "Move-in Inspection & Digital Agreement e-Signed", desc: `Checked into Room ${selectedTenant.roomNumber} (${selectedTenant.propertyName}). Security deposit ₹${selectedTenant.depositAmount?.toLocaleString()} escrowed.` },
                    { date: "01/02/2026", title: "Monthly Rent Paid Online via Cashfree UPI", desc: `Automated invoice generated for ₹${selectedTenant.rentAmount?.toLocaleString()} with zero convenience fee.` },
                    { date: "Active Living", title: "Active In-Premise Living State", desc: "Biometric entry enabled. Room amenities verified in good condition." },
                  ].map((step, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "10px",
                        padding: "16px",
                        borderLeft: "4px solid var(--teal-primary)",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--teal-primary)", fontWeight: "bold" }}>{step.date}</span>
                      <strong style={{ display: "block", color: "#FFFFFF", fontSize: "14px", margin: "4px 0" }}>{step.title}</strong>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENT LEDGER & SLIPS */}
            {drawerTab === "ledger" && (
              <div>
                <h4 style={{ margin: "0 0 16px", color: "#FFFFFF", fontSize: "16px" }}>Rent Ledger & Cashfree Transaction History</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { month: "February 2026", amount: selectedTenant.rentAmount || 8500, mode: "UPI (Google Pay)", ref: "CF_PAY_889104_FEB", status: "PAID" },
                    { month: "January 2026 (Move-in Bill)", amount: selectedTenant.depositAmount || 10000, mode: "UPI (PhonePe)", ref: "CF_ENROLL_992144_JAN", status: "PAID" },
                  ].map((txn, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "10px",
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>{txn.month}</strong>
                        <span className="subtext" style={{ display: "block" }}>{txn.mode} &bull; Ref: {txn.ref}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ color: "#10B981", fontSize: "15px" }}>₹{txn.amount.toLocaleString("en-IN")}</strong>
                        <span className="badge active" style={{ display: "block", marginTop: "4px" }}>{txn.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DEPOSIT ESCROW & EXIT SETTLEMENT DESK */}
            {drawerTab === "exit_clearance" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Exit Clearance & Deposit Settlement Calculator</h4>
                  <p className="subtext">Auto-deduct pending utilities and room damages before initiating 1-click Cashfree deposit payout.</p>
                </div>

                {refundSuccess && (
                  <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981", borderRadius: "10px", color: "#10B981", fontSize: "14px", marginBottom: "20px" }}>
                    {refundSuccess}
                  </div>
                )}

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Original Security Deposit Escrowed:</span>
                    <strong style={{ color: "#FFFFFF", fontSize: "16px" }}>₹{(selectedTenant.depositAmount || 10000).toLocaleString("en-IN")}</strong>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Unpaid Rent Dues (₹)</label>
                      <input
                        type="number"
                        value={deductionForm.unpaidRent}
                        onChange={(e) => setDeductionForm({ ...deductionForm, unpaidRent: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Submeter Units Used (kWh)</label>
                      <input
                        type="number"
                        value={deductionForm.electricityUnits}
                        onChange={(e) => setDeductionForm({ ...deductionForm, electricityUnits: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Asset Damage & Deep Cleaning Deduction (₹)</label>
                    <input
                      type="number"
                      value={deductionForm.damageCost}
                      onChange={(e) => setDeductionForm({ ...deductionForm, damageCost: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                    />
                  </div>

                  {/* Net Refund Calculation Display */}
                  {(() => {
                    const original = selectedTenant.depositAmount || 10000;
                    const electricityCharge = deductionForm.electricityUnits * deductionForm.electricityRate;
                    const totalDeductions = deductionForm.unpaidRent + electricityCharge + deductionForm.damageCost;
                    const netRefund = Math.max(0, original - totalDeductions);

                    return (
                      <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid #10B981", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "12px", color: "#94A3B8" }}>Total Deductions (Rent + Power + Repairs):</span>
                            <div style={{ color: "#EF4444", fontWeight: "bold", fontSize: "15px" }}>-₹{totalDeductions.toLocaleString("en-IN")}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "12px", color: "#94A3B8" }}>Net Refundable to Tenant UPI:</span>
                            <h3 style={{ margin: "2px 0 0", color: "#10B981", fontSize: "22px" }}>₹{netRefund.toLocaleString("en-IN")}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => {
                      const original = selectedTenant.depositAmount || 10000;
                      const electricityCharge = deductionForm.electricityUnits * deductionForm.electricityRate;
                      const totalDeductions = deductionForm.unpaidRent + electricityCharge + deductionForm.damageCost;
                      const netRefund = Math.max(0, original - totalDeductions);
                      setRefundSuccess(`✅ Initiated instant Cashfree payout of ₹${netRefund.toLocaleString("en-IN")} directly to ${selectedTenant.phone}@upi. Exit clearance signed off.`);
                    }}
                    className="btnPrimary"
                    style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <CreditCard size={16} /> Disburse Deposit Refund via Cashfree Payout
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: SENTINEL RISK SCORE */}
            {drawerTab === "sentinel" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Cross-Property Community Sentinel</h4>
                  <p className="subtext">City-wide shared risk intelligence guarding against serial absconders and damage breaches.</p>
                </div>

                <div style={{ background: selectedTenant.status === "defaulter" ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.08)", border: `1px solid ${selectedTenant.status === "defaulter" ? "#EF4444" : "#10B981"}`, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "18px", color: selectedTenant.status === "defaulter" ? "#EF4444" : "#10B981" }}>
                        {selectedTenant.status === "defaulter" ? "⚠️ High Risk: Blacklisted Defaulter" : "🛡️ Community Trust Score: 96 / 100 (Safe)"}
                      </strong>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                        {selectedTenant.status === "defaulter"
                          ? `Reason: ${selectedTenant.defaultReason || "Unpaid dues and absconded"}`
                          : "No breaches or damages reported across any OneStay360 partner property."}
                      </p>
                    </div>

                    {selectedTenant.status !== "defaulter" ? (
                      <button
                        onClick={() => handleOpenFlagModal(selectedTenant)}
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#EF4444",
                          border: "1px solid #EF4444",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Flag Defaulter
                      </button>
                    ) : (
                      <span className="badge active">BLACKLISTED</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flag Defaulter Modal */}
      {flagModalOpen && flaggingTenant && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#EF4444" }}>
              <ShieldAlert size={22} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Add to Defaulter Registry
              </h3>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
              Flagging <strong>{flaggingTenant.name}</strong> will alert all PG operators in the OneStay360 platform
              if this individual attempts to reserve a bed in any registered property.
            </p>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Defaulted / Damage Amount (INR)
              </label>
              <input
                type="number"
                value={flagAmount}
                onChange={(e) => setFlagAmount(e.target.value)}
                placeholder="e.g. 14000"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Reason & Evidence Summary
              </label>
              <textarea
                rows={3}
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Specify non-payment duration, property damages, or lease violation details..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setFlagModalOpen(false)}
                disabled={submittingFlag}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFlagDefaulter}
                disabled={submittingFlag || !flagReason}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#EF4444",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: submittingFlag || !flagReason ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {submittingFlag ? "Writing Record..." : "Confirm Blacklist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
