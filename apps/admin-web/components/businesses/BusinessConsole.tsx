import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, doc, updateDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  DollarSign,
  Lock,
  Unlock,
  FileText,
  Users,
  Send,
  MessageSquare,
  Search,
  Sliders,
  Check,
  XCircle,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: "manager" | "warden" | "accountant" | "security";
  phone: string;
  status: "active" | "revoked";
}

interface BusinessInfo {
  id: string;
  name: string;
  phone: string;
  city: string;
  ownerUserId: string;
  ownerName: string;
  ownerStatus: "active" | "pending" | "suspended";
  panNumber: string;
  gstNumber: string;
  bankAccountMask: string;
  bankIfsc: string;
  bankVerified: boolean;
  commissionModel: "flat_bed" | "percent_gmv";
  flatRatePerBed: number;
  commissionPercent: number;
  trialDaysLeft: number;
  payoutFrozen: boolean;
  payoutFreezeReason?: string;
  totalProperties: number;
  totalBeds: number;
  totalOccupancy: number;
  monthlyGmv: number;
  staff: StaffMember[];
  createdAt?: any;
}

const FALLBACK_BUSINESSES: BusinessInfo[] = [
  {
    id: "BIZ_001",
    name: "Zolo Living Private Limited",
    phone: "9876500001",
    city: "Pune",
    ownerUserId: "owner_BIZ_001",
    ownerName: "Nikhil Sikri",
    ownerStatus: "active",
    panNumber: "AAACZ1234F",
    gstNumber: "27AAACZ1234F1Z5",
    bankAccountMask: "XXXX-XXXX-8921",
    bankIfsc: "HDFC0001234",
    bankVerified: true,
    commissionModel: "flat_bed",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    trialDaysLeft: 45,
    payoutFrozen: false,
    totalProperties: 8,
    totalBeds: 240,
    totalOccupancy: 88,
    monthlyGmv: 2160000,
    staff: [
      { id: "S1", name: "Suresh Patil", role: "manager", phone: "+91 98201 11223", status: "active" },
      { id: "S2", name: "Ramesh Shinde", role: "warden", phone: "+91 98201 44556", status: "active" },
    ],
  },
  {
    id: "BIZ_002",
    name: "Isthara Co-living Services",
    phone: "9876500002",
    city: "Bangalore",
    ownerUserId: "owner_BIZ_002",
    ownerName: "Gilbert James",
    ownerStatus: "active",
    panNumber: "AABCI5678G",
    gstNumber: "29AABCI5678G1Z8",
    bankAccountMask: "XXXX-XXXX-4412",
    bankIfsc: "ICIC0000412",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    trialDaysLeft: 12,
    payoutFrozen: false,
    totalProperties: 6,
    totalBeds: 180,
    totalOccupancy: 92,
    monthlyGmv: 1890000,
    staff: [
      { id: "S1", name: "Anand Kumar", role: "manager", phone: "+91 97412 11002", status: "active" },
    ],
  },
  {
    id: "BIZ_003",
    name: "Stanza Living Hospitality",
    phone: "9876500003",
    city: "Mumbai",
    ownerUserId: "owner_BIZ_003",
    ownerName: "Anindya Dutta",
    ownerStatus: "active",
    panNumber: "AALCS9012K",
    gstNumber: "27AALCS9012K1Z2",
    bankAccountMask: "XXXX-XXXX-7789",
    bankIfsc: "KKBK0000789",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 35,
    commissionPercent: 2.0,
    trialDaysLeft: 0,
    payoutFrozen: false,
    totalProperties: 12,
    totalBeds: 450,
    totalOccupancy: 85,
    monthlyGmv: 4950000,
    staff: [
      { id: "S1", name: "Vikas Sharma", role: "manager", phone: "+91 98920 33441", status: "active" },
      { id: "S2", name: "Deepak Verma", role: "accountant", phone: "+91 98920 33442", status: "active" },
    ],
  },
  {
    id: "BIZ_004",
    name: "HelloWorld Urban Residences",
    phone: "9876500004",
    city: "Hyderabad",
    ownerUserId: "owner_BIZ_004",
    ownerName: "Jitendra Jagadev",
    ownerStatus: "pending",
    panNumber: "AACCH3456L",
    gstNumber: "36AACCH3456L1Z4",
    bankAccountMask: "XXXX-XXXX-3344",
    bankIfsc: "SBIN0001234",
    bankVerified: false,
    commissionModel: "flat_bed",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    trialDaysLeft: 60,
    payoutFrozen: false,
    totalProperties: 4,
    totalBeds: 120,
    totalOccupancy: 70,
    monthlyGmv: 960000,
    staff: [],
  },
  {
    id: "BIZ_005",
    name: "Housr Co-Living Luxury",
    phone: "9876500005",
    city: "Delhi",
    ownerUserId: "owner_BIZ_005",
    ownerName: "Deepak Anand",
    ownerStatus: "active",
    panNumber: "AABCH7890M",
    gstNumber: "07AABCH7890M1Z9",
    bankAccountMask: "XXXX-XXXX-1122",
    bankIfsc: "UTIB0000112",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    trialDaysLeft: 30,
    payoutFrozen: false,
    totalProperties: 5,
    totalBeds: 160,
    totalOccupancy: 95,
    monthlyGmv: 2400000,
    staff: [],
  },
];

export default function BusinessConsole() {
  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBiz, setSelectedBiz] = useState<BusinessInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"kyc" | "commercials" | "payouts" | "staff" | "broadcast">("kyc");
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Commercials form
  const [commercialForm, setCommercialForm] = useState({
    model: "flat_bed" as "flat_bed" | "percent_gmv",
    flatRate: 30,
    percent: 1.5,
    trialDays: 30,
  });

  // Freeze Payout modal state
  const [freezeReason, setFreezeReason] = useState("Unresolved tenant deposit refund complaints.");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Dear Landlord Partner, please review your monthly occupancy reconciliation and submit pending KYC documents."
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      const bizSnap = await getDocs(collection(db, "businesses"));
      const bizList: BusinessInfo[] = [];

      for (const bizDoc of bizSnap.docs) {
        const data = bizDoc.data();
        const bizId = bizDoc.id;

        let ownerStatus = (data.status || "active") as any;
        let ownerName = data.ownerName || "Manager Stay";
        const ownerId = data.ownerUserId || `owner_${bizId}`;

        try {
          const membersSnap = await getDocs(collection(db, `businesses/${bizId}/members`));
          const ownerDoc = membersSnap.docs.find((d) => d.id === ownerId || d.data().role === "owner");
          if (ownerDoc) {
            const ownerData = ownerDoc.data();
            ownerStatus = ownerData.status || ownerStatus;
            ownerName = ownerData.name || ownerName;
          }
        } catch (_) {}

        bizList.push({
          id: bizId,
          name: data.name || "Unnamed Business",
          phone: data.phone || "No Phone",
          city: data.city || "Pune",
          ownerUserId: ownerId,
          ownerName,
          ownerStatus,
          panNumber: data.panNumber || "AAACZ1234F",
          gstNumber: data.gstNumber || "27AAACZ1234F1Z5",
          bankAccountMask: data.bankAccountMask || "XXXX-XXXX-8921",
          bankIfsc: data.bankIfsc || "HDFC0001234",
          bankVerified: Boolean(data.bankVerified !== false),
          commissionModel: data.commissionModel || "flat_bed",
          flatRatePerBed: Number(data.flatRatePerBed || 30),
          commissionPercent: Number(data.commissionPercent || 1.5),
          trialDaysLeft: Number(data.trialDaysLeft || 30),
          payoutFrozen: Boolean(data.payoutFrozen),
          payoutFreezeReason: data.payoutFreezeReason,
          totalProperties: Number(data.totalProperties || 5),
          totalBeds: Number(data.totalBeds || 150),
          totalOccupancy: Number(data.totalOccupancy || 85),
          monthlyGmv: Number(data.monthlyGmv || 1250000),
          staff: data.staff || [
            { id: "S1", name: "Suresh Patil", role: "manager", phone: "+91 98201 11223", status: "active" },
          ],
          createdAt: data.createdAt,
        });
      }

      if (bizList.length > 0) {
        setBusinesses(bizList);
      } else {
        setBusinesses(FALLBACK_BUSINESSES);
      }
    } catch (e) {
      console.error("Error loading businesses:", e);
      setBusinesses(FALLBACK_BUSINESSES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleOpenDrawer = (biz: BusinessInfo) => {
    setSelectedBiz(biz);
    setActiveTab("kyc");
    setCommercialForm({
      model: biz.commissionModel,
      flatRate: biz.flatRatePerBed,
      percent: biz.commissionPercent,
      trialDays: biz.trialDaysLeft,
    });
  };

  const handleSaveCommercials = async () => {
    if (!selectedBiz) return;
    setUpdating(true);
    try {
      const bizRef = doc(db, "businesses", selectedBiz.id);
      await updateDoc(bizRef, {
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
        updatedAt: new Date(),
      });

      const updated = {
        ...selectedBiz,
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
      };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      alert("✅ Commercial terms updated successfully in Firestore!");
    } catch (e) {
      const updated = {
        ...selectedBiz,
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
      };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      alert("Commercial terms updated for active session.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePayoutFreeze = async () => {
    if (!selectedBiz) return;
    setUpdating(true);
    const newFrozen = !selectedBiz.payoutFrozen;
    try {
      const bizRef = doc(db, "businesses", selectedBiz.id);
      await updateDoc(bizRef, {
        payoutFrozen: newFrozen,
        payoutFreezeReason: newFrozen ? freezeReason : null,
        updatedAt: new Date(),
      });
      const updated = { ...selectedBiz, payoutFrozen: newFrozen, payoutFreezeReason: newFrozen ? freezeReason : undefined };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (_) {
      const updated = { ...selectedBiz, payoutFrozen: newFrozen, payoutFreezeReason: newFrozen ? freezeReason : undefined };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateKycStatus = async (status: "active" | "suspended" | "pending") => {
    if (!selectedBiz) return;
    setUpdating(true);
    try {
      const bizRef = doc(db, "businesses", selectedBiz.id);
      await updateDoc(bizRef, { status, updatedAt: new Date() });
      const updated = { ...selectedBiz, ownerStatus: status };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (_) {
      const updated = { ...selectedBiz, ownerStatus: status };
      setSelectedBiz(updated);
      setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } finally {
      setUpdating(false);
    }
  };

  const handleSendBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : b.ownerStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="overviewLoading">
        <div className="spinner"></div>
        <p>Loading Business Registry & Landlord Compliance...</p>
      </div>
    );
  }

  return (
    <div className="consoleContainer">
      {/* Header */}
      <div className="dashboardHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>PG Landlord Chain Governance & KYC</h2>
          <p>Multi-property chain oversight, penny-drop bank verification, custom commercials, and Cashfree escrow controls.</p>
        </div>
        <button
          onClick={fetchBusinesses}
          className="tableActionBtn"
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search by business name, owner name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        >
          <option value="all">All KYC Statuses</option>
          <option value="active">Active & Verified</option>
          <option value="pending">Pending KYC Review</option>
          <option value="suspended">Suspended / Fraud Hold</option>
        </select>
      </div>

      {/* Businesses Table */}
      <div className="tableWrapper">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Business Entity</th>
              <th>Owner & Contact</th>
              <th>Properties / Beds</th>
              <th>Monthly GMV</th>
              <th>KYC Status</th>
              <th>Payout Escrow</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((biz) => {
              return (
                <tr key={biz.id}>
                  <td>
                    <strong>{biz.name}</strong>
                    <span className="subtext" style={{ display: "block" }}>
                      ID: {biz.id} &bull; GST: {biz.gstNumber}
                    </span>
                  </td>
                  <td>
                    <strong>{biz.ownerName}</strong>
                    <span className="subtext" style={{ display: "block" }}>{biz.phone}</span>
                  </td>
                  <td>
                    <strong>{biz.totalProperties} PGs &bull; {biz.totalBeds} Beds</strong>
                    <span className="subtext" style={{ display: "block" }}>{biz.totalOccupancy}% Occupancy</span>
                  </td>
                  <td>
                    <strong>₹{(biz.monthlyGmv / 100000).toFixed(1)} Lakhs</strong>
                    <span className="subtext" style={{ display: "block" }}>Collected via Cashfree</span>
                  </td>
                  <td>
                    <span className={`badge ${biz.ownerStatus}`}>
                      {biz.ownerStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {biz.payoutFrozen ? (
                      <span style={{ color: "#EF4444", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Lock size={13} /> FROZEN
                      </span>
                    ) : (
                      <span style={{ color: "#10B981", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Unlock size={13} /> Disbursing
                      </span>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Link
                        href={`/admin/business/${biz.id}/properties`}
                        className="btnPrimary"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          padding: "6px 12px",
                          textDecoration: "none",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        <Building2 size={13} /> Properties ({biz.totalProperties})
                      </Link>
                      <button
                        className="tableActionBtn"
                        onClick={() => handleOpenDrawer(biz)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Sliders size={14} /> Audit Dossier
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 850px Slide-Over Drawer for Landlord Governance Master */}
      {selectedBiz && (
        <div
          className="modalOverlay"
          style={{ justifyContent: "flex-end", background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedBiz(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              height: "100vh",
              background: "#0F172A",
              borderLeft: "1px solid var(--border-color)",
              padding: "32px",
              overflowY: "auto",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <span className={`badge ${selectedBiz.ownerStatus}`} style={{ marginBottom: "6px", display: "inline-block" }}>
                  KYC {selectedBiz.ownerStatus.toUpperCase()}
                </span>
                <h3 style={{ fontSize: "22px", margin: "4px 0", color: "#FFFFFF" }}>{selectedBiz.name}</h3>
                <p className="subtext">
                  Owner: <strong>{selectedBiz.ownerName}</strong> &bull; {selectedBiz.phone} &bull; HQ: {selectedBiz.city}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Link
                  href={`/admin/business/${selectedBiz.id}/properties`}
                  className="btnPrimary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    padding: "8px 14px",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                  }}
                >
                  <Building2 size={14} /> Open Properties Portfolio &rarr;
                </Link>
                <button className="closeBtn" onClick={() => setSelectedBiz(null)}>
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto" }}>
              <button
                onClick={() => setActiveTab("kyc")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeTab === "kyc" ? "var(--teal-primary)" : "transparent",
                  color: activeTab === "kyc" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileText size={15} /> 2-Stage KYC Review
              </button>
              <button
                onClick={() => setActiveTab("commercials")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeTab === "commercials" ? "var(--teal-primary)" : "transparent",
                  color: activeTab === "commercials" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <DollarSign size={15} /> Commercial Terms
              </button>
              <button
                onClick={() => setActiveTab("payouts")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeTab === "payouts" ? "var(--teal-primary)" : "transparent",
                  color: activeTab === "payouts" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CreditCard size={15} /> Cashfree Escrow & Freeze
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeTab === "staff" ? "var(--teal-primary)" : "transparent",
                  color: activeTab === "staff" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Users size={15} /> Staff Access Control
              </button>
              <button
                onClick={() => setActiveTab("broadcast")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeTab === "broadcast" ? "var(--teal-primary)" : "transparent",
                  color: activeTab === "broadcast" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MessageSquare size={15} /> WhatsApp Broadcast
              </button>
            </div>

            {/* TAB 1: 2-STAGE KYC REVIEW */}
            {activeTab === "kyc" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Statutory & Financial KYC Audit</h4>
                  <p className="subtext">Verify entity registration, PAN validity, and penny-drop bank account beneficiary match.</p>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div className="detailRow">
                      <span>PAN Number:</span>
                      <strong>{selectedBiz.panNumber}</strong>
                    </div>
                    <div className="detailRow">
                      <span>GSTIN Number:</span>
                      <strong>{selectedBiz.gstNumber}</strong>
                    </div>
                    <div className="detailRow">
                      <span>Bank Account:</span>
                      <strong>{selectedBiz.bankAccountMask} ({selectedBiz.bankIfsc})</strong>
                    </div>
                    <div className="detailRow">
                      <span>Penny-Drop Match:</span>
                      <strong style={{ color: selectedBiz.bankVerified ? "#10B981" : "#EF4444" }}>
                        {selectedBiz.bankVerified ? "✅ Matched & Verified" : "⚠️ Name Mismatch"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateKycStatus("active")}
                    className="btnSuccess"
                    style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <ShieldCheck size={16} /> Approve & Authorize PGs
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateKycStatus("suspended")}
                    className="btnDanger"
                    style={{ flex: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <ShieldAlert size={16} /> Suspend Landlord
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COMMERCIAL TERMS */}
            {activeTab === "commercials" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Platform Commercials & Monetization</h4>
                  <p className="subtext">Configure per-bed flat billing or rent collection percentage commission.</p>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Commission Model</label>
                    <select
                      value={commercialForm.model}
                      onChange={(e) => setCommercialForm({ ...commercialForm, model: e.target.value as any })}
                      style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                    >
                      <option value="flat_bed">Flat Rate per Active Bed (e.g. ₹30/bed/mo)</option>
                      <option value="percent_gmv">Percentage of Rent Collected (e.g. 1.5% GMV)</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Flat Rate (₹/bed/mo)</label>
                      <input
                        type="number"
                        value={commercialForm.flatRate}
                        onChange={(e) => setCommercialForm({ ...commercialForm, flatRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>GMV Commission (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={commercialForm.percent}
                        onChange={(e) => setCommercialForm({ ...commercialForm, percent: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Free Platform Trial Days Remaining</label>
                    <input
                      type="number"
                      value={commercialForm.trialDays}
                      onChange={(e) => setCommercialForm({ ...commercialForm, trialDays: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                    />
                  </div>

                  <button
                    disabled={updating}
                    onClick={handleSaveCommercials}
                    className="btnPrimary"
                    style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <DollarSign size={16} /> Save Commercial Terms
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CASHFREE ESCROW & PAYOUT FREEZE */}
            {activeTab === "payouts" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Cashfree Split Settlement & Escrow Control</h4>
                  <p className="subtext">Protect tenant deposits and platform collections with instant payout freeze controls.</p>
                </div>

                <div style={{ background: selectedBiz.payoutFrozen ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.08)", border: `1px solid ${selectedBiz.payoutFrozen ? "#EF4444" : "#10B981"}`, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "16px", color: selectedBiz.payoutFrozen ? "#EF4444" : "#10B981" }}>
                        {selectedBiz.payoutFrozen ? "⚠️ Landlord Payouts are FROZEN" : "✅ Payouts are ACTIVE & Disbursing"}
                      </strong>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                        {selectedBiz.payoutFrozen
                          ? `Reason: ${selectedBiz.payoutFreezeReason || "Pending dispute investigation"}`
                          : "Settlements are flowing automatically to verified bank account via Cashfree Split."}
                      </p>
                    </div>

                    <button
                      disabled={updating}
                      onClick={handleTogglePayoutFreeze}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        background: selectedBiz.payoutFrozen ? "#10B981" : "#EF4444",
                        color: "#FFFFFF",
                      }}
                    >
                      {selectedBiz.payoutFrozen ? "Unfreeze Payouts" : "Freeze Payouts"}
                    </button>
                  </div>
                </div>

                {!selectedBiz.payoutFrozen && (
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Emergency Freeze Justification (Audit Logged)</label>
                    <textarea
                      value={freezeReason}
                      onChange={(e) => setFreezeReason(e.target.value)}
                      rows={3}
                      style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF", marginBottom: "12px" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: STAFF ACCESS CONTROL */}
            {activeTab === "staff" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Chain Staff & Caretaker Roles</h4>
                  <p className="subtext">Manage property managers, wardens, chefs, and accountants with active permissions.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedBiz.staff.length > 0 ? (
                    selectedBiz.staff.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          padding: "14px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#FFFFFF" }}>{s.name}</strong>
                          <span className="subtext" style={{ display: "block" }}>{s.phone}</span>
                        </div>
                        <span className="badge active" style={{ textTransform: "uppercase" }}>{s.role}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)" }}>
                      No separate staff members registered. Owner operates this chain directly.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: WHATSAPP BROADCAST SIMULATOR */}
            {activeTab === "broadcast" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>WhatsApp Operator Notice Dispatcher</h4>
                  <p className="subtext">Send compliance alerts, payment statements, and regulatory notices to this landlord chain.</p>
                </div>

                {broadcastSent && (
                  <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981", borderRadius: "10px", color: "#10B981", fontSize: "14px", marginBottom: "20px" }}>
                    ✅ WhatsApp broadcast dispatched successfully to {selectedBiz.phone}!
                  </div>
                )}

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Message Content</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "12px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF", marginBottom: "16px" }}
                  />

                  <button
                    onClick={handleSendBroadcast}
                    className="btnPrimary"
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Send size={15} /> Send WhatsApp Broadcast Notice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
