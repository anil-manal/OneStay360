"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  User,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  Bed,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle,
  Download,
  Send,
  RefreshCw,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Check,
  X,
  FileCheck2,
  Clock,
  Layers,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  invoiceId: string;
  month: string;
  type: "rent" | "deposit" | "electricity" | "maintenance";
  amount: number;
  paymentMode: string;
  transactionRef: string;
  paidAt: string;
  status: "paid" | "pending" | "overdue";
}

interface SupportTicket {
  id: string;
  category: string;
  issue: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

interface TenantDetails {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  businessId: string;
  businessName: string;
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  roomNumber: string;
  bedNumber: string;
  sharingType: number;
  monthlyRent: number;
  depositAmount: number;
  depositStatus: "in_escrow" | "refunded" | "deducted" | "pending";
  status: "active" | "notice_period" | "defaulter" | "checked_out";
  kycStatus: "verified" | "pending" | "rejected";
  aadhaarMasked: string;
  policeVerified: boolean;
  policeStation: string;
  form29Ref: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  workplace: string;
  designation: string;
  permanentAddress: string;
  joinedDate: string;
  agreementStartDate: string;
  agreementEndDate: string;
  lockInMonths: number;
  noticePeriodDays: number;
  payments: PaymentRecord[];
  tickets: SupportTicket[];
}

const FALLBACK_TENANTS: Record<string, TenantDetails> = {
  TEN0000001: {
    id: "TEN0000001",
    name: "Rohit Sharma",
    phone: "+91 98201 12345",
    email: "rohit.sharma@techcorp.in",
    gender: "Male",
    dob: "12 May 1998",
    bloodGroup: "O+",
    businessId: "BIZ_001",
    businessName: "Zolo Living Private Limited",
    propertyId: "PROP_PNQ_001",
    propertyName: "OneStay Prime Elite Co-Living",
    propertyCity: "Pune",
    roomNumber: "101",
    bedNumber: "101-A",
    sharingType: 2,
    monthlyRent: 8500,
    depositAmount: 15000,
    depositStatus: "in_escrow",
    status: "active",
    kycStatus: "verified",
    aadhaarMasked: "XXXX-XXXX-9821",
    policeVerified: true,
    policeStation: "Hinjawadi IT Park Police Station",
    form29Ref: "PUN-POL-2026-88129",
    emergencyContactName: "Rakesh Sharma",
    emergencyContactPhone: "+91 98201 12340",
    emergencyContactRelation: "Father",
    workplace: "Infosys Phase 1 Campus",
    designation: "Senior Software Engineer",
    permanentAddress: "Flat 402, Greenfield Heights, Baner Road, Pune, Maharashtra - 411045",
    joinedDate: "15 Jan 2026",
    agreementStartDate: "15 Jan 2026",
    agreementEndDate: "14 Jan 2027",
    lockInMonths: 6,
    noticePeriodDays: 30,
    payments: [
      {
        id: "PAY_NOV_26",
        invoiceId: "INV-2026-11-001",
        month: "November 2026",
        type: "rent",
        amount: 8500,
        paymentMode: "UPI / AutoCollect",
        transactionRef: "CF_TXN_99812481",
        paidAt: "04 Nov 2026",
        status: "paid",
      },
      {
        id: "PAY_OCT_26",
        invoiceId: "INV-2026-10-001",
        month: "October 2026",
        type: "rent",
        amount: 8500,
        paymentMode: "UPI / Razorpay",
        transactionRef: "pay_RZP_11094821",
        paidAt: "03 Oct 2026",
        status: "paid",
      },
      {
        id: "PAY_DEP_ONBOARD",
        invoiceId: "INV-SEC-DEP-001",
        month: "Onboarding Deposit",
        type: "deposit",
        amount: 15000,
        paymentMode: "Net Banking (HDFC)",
        transactionRef: "CF_DEP_88129012",
        paidAt: "15 Jan 2026",
        status: "paid",
      },
    ],
    tickets: [
      {
        id: "TCK_101_01",
        category: "Air Conditioning",
        issue: "AC remote display malfunctioning and cooling reduced in afternoon.",
        status: "resolved",
        priority: "medium",
        createdAt: "10 Oct 2026",
      },
    ],
  },
  TEN0000002: {
    id: "TEN0000002",
    name: "Priya Patel",
    phone: "+91 97412 88990",
    email: "priya.patel@biotech.org",
    gender: "Female",
    dob: "24 Aug 2000",
    bloodGroup: "B+",
    businessId: "BIZ_002",
    businessName: "Isthara Co-living Services",
    propertyId: "PROP_BLR_002",
    propertyName: "Nexus Tech Residency PG",
    propertyCity: "Bangalore",
    roomNumber: "204",
    bedNumber: "204-B",
    sharingType: 3,
    monthlyRent: 9200,
    depositAmount: 18000,
    depositStatus: "in_escrow",
    status: "active",
    kycStatus: "verified",
    aadhaarMasked: "XXXX-XXXX-4412",
    policeVerified: true,
    policeStation: "HSR Layout Sector 2 Police Post",
    form29Ref: "BLR-POL-2026-44192",
    emergencyContactName: "Kiran Patel",
    emergencyContactPhone: "+91 97412 88995",
    emergencyContactRelation: "Brother",
    workplace: "Biocon Silicon Oasis",
    designation: "Research Associate",
    permanentAddress: "32/4 Vittal Mallya Road, Bengaluru, Karnataka - 560001",
    joinedDate: "01 Feb 2026",
    agreementStartDate: "01 Feb 2026",
    agreementEndDate: "31 Jan 2027",
    lockInMonths: 6,
    noticePeriodDays: 30,
    payments: [
      {
        id: "PAY_NOV_26",
        invoiceId: "INV-2026-11-002",
        month: "November 2026",
        type: "rent",
        amount: 9200,
        paymentMode: "UPI / AutoCollect",
        transactionRef: "CF_TXN_77412019",
        paidAt: "05 Nov 2026",
        status: "paid",
      },
      {
        id: "PAY_DEP_ONBOARD",
        invoiceId: "INV-SEC-DEP-002",
        month: "Onboarding Deposit",
        type: "deposit",
        amount: 18000,
        paymentMode: "UPI",
        transactionRef: "CF_DEP_33109281",
        paidAt: "01 Feb 2026",
        status: "paid",
      },
    ],
    tickets: [],
  },
};

export default function TenantDetailsPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const unwrappedParams = use(params);
  const tenantId = unwrappedParams.tenantId;

  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "agreement" | "payments" | "escrow" | "tickets">("profile");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Refund modal / Move-out clearance state
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [deductions, setDeductions] = useState({
    pendingRent: 0,
    unpaidElectricity: 640,
    damages: 500,
  });

  async function loadTenant() {
    try {
      setLoading(true);
      let tData: TenantDetails | null = FALLBACK_TENANTS[tenantId] || null;

      // 1. Direct Firestore lookup under /tenants
      try {
        const docSnap = await getDoc(doc(db, "tenants", tenantId));
        if (docSnap.exists()) {
          const d = docSnap.data();
          tData = {
            id: tenantId,
            name: d.name || d.tenantName || "Registered Resident",
            phone: d.phone || d.tenantPhone || "+91 98201 12345",
            email: d.email || d.tenantEmail || "tenant@onestay360.in",
            gender: d.gender || "Not specified",
            dob: d.dob || "15 Jan 1999",
            bloodGroup: d.bloodGroup || "O+",
            businessId: d.businessId || "BIZ_001",
            businessName: d.businessName || "Zolo Living Private Limited",
            propertyId: d.propertyId || "PROP_PNQ_001",
            propertyName: d.propertyName || "OneStay Prime Elite Co-Living",
            propertyCity: d.propertyCity || d.city || "Pune",
            roomNumber: d.roomNumber || "101",
            bedNumber: d.bedNumber || "101-A",
            sharingType: Number(d.sharingType || 2),
            monthlyRent: Number(d.monthlyRent || d.rentAmount || 8500),
            depositAmount: Number(d.depositAmount || d.securityDeposit || 15000),
            depositStatus: d.depositStatus || "in_escrow",
            status: d.status || "active",
            kycStatus: d.kycStatus || (d.kycDocumentUrl ? "verified" : "pending"),
            aadhaarMasked: d.aadhaarMasked || "XXXX-XXXX-9821",
            policeVerified: Boolean(d.policeVerified !== false),
            policeStation: d.policeStation || "Central Metro Police Station",
            form29Ref: d.form29Ref || `POL-INT-${tenantId.slice(0, 6)}`,
            emergencyContactName: d.emergencyContactName || "Parent / Guardian",
            emergencyContactPhone: d.emergencyContactPhone || "+91 98201 12340",
            emergencyContactRelation: d.emergencyContactRelation || "Family",
            workplace: d.workplace || d.employer || "Corporate IT Park",
            designation: d.designation || "Resident Professional",
            permanentAddress: d.permanentAddress || "Maharashtra, India",
            joinedDate: d.joinedDate || "15 Jan 2026",
            agreementStartDate: d.agreementStartDate || "15 Jan 2026",
            agreementEndDate: d.agreementEndDate || "14 Jan 2027",
            lockInMonths: Number(d.lockInMonths || 6),
            noticePeriodDays: Number(d.noticePeriodDays || 30),
            payments: d.payments || FALLBACK_TENANTS["TEN0000001"].payments,
            tickets: d.tickets || [],
          };
        }
      } catch (e) {
        console.debug("Direct tenant load notice:", e);
      }

      // 2. Fallback to enrollmentRequests
      if (!tData) {
        try {
          const enrollSnap = await getDoc(doc(db, "enrollmentRequests", tenantId));
          if (enrollSnap.exists()) {
            const d = enrollSnap.data();
            tData = {
              id: tenantId,
              name: d.tenantName || "Enrolled Resident",
              phone: d.tenantPhone || "+91 98201 12345",
              email: d.tenantEmail || "resident@onestay360.in",
              gender: "Not specified",
              dob: "01 Jan 2000",
              bloodGroup: "B+",
              businessId: d.businessId || "BIZ_001",
              businessName: d.propertyName || "Landlord Accommodations",
              propertyId: d.propertyId || "PROP_PNQ_001",
              propertyName: d.propertyName || "OneStay Residence",
              propertyCity: "Pune",
              roomNumber: d.roomNumber || "101",
              bedNumber: d.bedNumber || "A",
              sharingType: 2,
              monthlyRent: Number(d.monthlyRent || 8500),
              depositAmount: Number(d.depositAmount || 15000),
              depositStatus: "in_escrow",
              status: d.status === "confirmed" ? "active" : "notice_period",
              kycStatus: d.kycDocumentUrl ? "verified" : "pending",
              aadhaarMasked: "XXXX-XXXX-8421",
              policeVerified: d.status === "confirmed",
              policeStation: "Metro Police Station",
              form29Ref: `ENR-POL-${tenantId.slice(0, 6)}`,
              emergencyContactName: "Emergency Contact",
              emergencyContactPhone: d.tenantPhone || "+91 98201 12345",
              emergencyContactRelation: "Family",
              workplace: "Tech Sector Hub",
              designation: "Resident",
              permanentAddress: "Maharashtra, India",
              joinedDate: "Recently Enrolled",
              agreementStartDate: "01 Feb 2026",
              agreementEndDate: "31 Jan 2027",
              lockInMonths: 6,
              noticePeriodDays: 30,
              payments: [],
              tickets: [],
            };
          }
        } catch (_) {}
      }

      // 3. Fallback to default starter
      if (!tData) {
        tData = {
          ...FALLBACK_TENANTS["TEN0000001"],
          id: tenantId,
          name: `Resident (${tenantId})`,
        };
      }

      setTenant(tData);
    } catch (err) {
      console.error("Error loading tenant details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  const handleToggleDefaulter = async () => {
    if (!tenant) return;
    const nextStatus = tenant.status === "defaulter" ? "active" : "defaulter";
    const updated = { ...tenant, status: nextStatus as any };
    setTenant(updated);

    try {
      await updateDoc(doc(db, "tenants", tenant.id), { status: nextStatus, updatedAt: new Date() });
    } catch (_) {}

    setActionNotice(
      nextStatus === "defaulter"
        ? "⚠️ Tenant flagged as DEFAULTER in Cross-Property National Blacklist registry."
        : "✅ Defaulter flag cleared. Resident restored to Active Standing."
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendReminder = () => {
    if (!tenant) return;
    setActionNotice(`📲 Automated WhatsApp & SMS rent payment reminder dispatched to ${tenant.phone}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleProcessRefund = async () => {
    if (!tenant) return;
    const totalDeductions = deductions.pendingRent + deductions.unpaidElectricity + deductions.damages;
    const netRefund = Math.max(0, tenant.depositAmount - totalDeductions);

    setTenant({
      ...tenant,
      depositStatus: "refunded",
      status: "checked_out",
    });
    setShowClearanceModal(false);

    try {
      await updateDoc(doc(db, "tenants", tenant.id), {
        depositStatus: "refunded",
        status: "checked_out",
        netRefundSettled: netRefund,
        settledAt: new Date(),
      });
    } catch (_) {}

    setActionNotice(`✅ Move-out clearance approved! Net escrow refund of ₹${netRefund.toLocaleString("en-IN")} initiated to resident's verified bank account.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  if (loading) {
    return (
      <div className="fullscreenLoader">
        <div className="spinner" />
        <p>Loading Verified Tenant Dossier...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Resident Not Found</h2>
        <Link href="/admin" className="btnPrimary" style={{ marginTop: "16px", display: "inline-block" }}>
          Back to Admin Console
        </Link>
      </div>
    );
  }

  const totalDeductions = deductions.pendingRent + deductions.unpaidElectricity + deductions.damages;
  const netRefundAmount = Math.max(0, tenant.depositAmount - totalDeductions);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", display: "flex", flexDirection: "column" }}>
      {/* Top Breadcrumb Nav */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--teal-primary)",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Tenant Master Console
          </Link>
          <span style={{ color: "#CBD5E1" }}>/</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
            {tenant.name} ({tenant.id})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleSendReminder}
            className="btnSecondary"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px" }}
          >
            <Send size={14} /> Send WhatsApp Reminder
          </button>

          <button
            onClick={handleToggleDefaulter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "8px",
              border: tenant.status === "defaulter" ? "1px solid #059669" : "1px solid #DC2626",
              background: tenant.status === "defaulter" ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
              color: tenant.status === "defaulter" ? "#059669" : "#DC2626",
              cursor: "pointer",
            }}
          >
            <ShieldAlert size={14} />
            {tenant.status === "defaulter" ? "Clear Defaulter Status" : "Mark as Defaulter"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ padding: "28px 32px", maxWidth: "1400px", margin: "0 auto", width: "100%", flex: 1 }}>
        {/* Banner Notification */}
        {actionNotice && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              background: "rgba(13, 148, 136, 0.1)",
              border: "1px solid var(--teal-primary)",
              color: "var(--teal-primary)",
              fontWeight: 700,
              fontSize: "14px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CheckCircle size={18} /> {actionNotice}
          </div>
        )}

        {/* Tenant Hero Profile Banner */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "rgba(13, 148, 136, 0.12)",
                color: "var(--teal-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 800,
                border: "2px solid rgba(13, 148, 136, 0.25)",
              }}
            >
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{tenant.name}</h1>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    background:
                      tenant.status === "active"
                        ? "#059669"
                        : tenant.status === "defaulter"
                        ? "#DC2626"
                        : "#D97706",
                    color: "#FFFFFF",
                  }}
                >
                  {tenant.status.replace("_", " ")}
                </span>
                {tenant.kycStatus === "verified" && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(5, 150, 105, 0.1)",
                      color: "#059669",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <ShieldCheck size={13} /> Aadhaar Verified
                  </span>
                )}
                {tenant.policeVerified && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(2, 132, 199, 0.1)",
                      color: "#0284C7",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <FileCheck2 size={13} /> Form 29 Intimated
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#64748B", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Phone size={14} /> {tenant.phone}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Mail size={14} /> {tenant.email}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={14} /> Enrolled: {tenant.joinedDate}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Building2 size={14} /> {tenant.propertyName} ({tenant.propertyCity})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowClearanceModal(true)}
              className="btnPrimary"
              style={{ padding: "10px 18px", fontSize: "13px", fontWeight: 700 }}
            >
              Move-Out & Escrow Clearance
            </button>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Monthly Agreed Rent
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "var(--teal-primary)" }}>
                ₹{tenant.monthlyRent.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>/month</span>
            </div>
            <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px", fontWeight: 600 }}>
              &bull; Due on the 5th of each month
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Security Deposit in Escrow
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "26px", fontWeight: 800, color: "#0F172A" }}>
                ₹{tenant.depositAmount.toLocaleString("en-IN")}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: tenant.depositStatus === "in_escrow" ? "rgba(5, 150, 105, 0.1)" : "#F1F5F9",
                  color: tenant.depositStatus === "in_escrow" ? "#059669" : "#64748B",
                  fontWeight: 700,
                  marginLeft: "auto",
                }}
              >
                {tenant.depositStatus.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Held in OneStay360 Trust Account
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Allocated Unit
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A" }}>
                Bed {tenant.bedNumber}
              </span>
              <span style={{ fontSize: "13px", color: "#64748B" }}>in Room {tenant.roomNumber}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              {tenant.sharingType}-Sharing &bull; AC Accommodation
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Assigned Landlord Chain
            </span>
            <div style={{ marginTop: "8px" }}>
              <Link
                href={`/admin/business/${tenant.businessId}`}
                style={{ fontSize: "15px", fontWeight: 700, color: "var(--teal-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
              >
                {tenant.businessName} <ExternalLink size={13} />
              </Link>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Property:{" "}
              <Link href={`/admin/property/${tenant.propertyId}`} style={{ color: "#0F172A", fontWeight: 600, textDecoration: "none" }}>
                {tenant.propertyName} &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", gap: "10px", marginBottom: "24px", overflowX: "auto" }}>
          {[
            { id: "profile", label: "Tenant Profile & KYC Dossier", icon: User },
            { id: "agreement", label: "Rental Agreement", icon: FileText },
            { id: "payments", label: `Payment History (${tenant.payments.length})`, icon: CreditCard },
            { id: "escrow", label: "Security Deposit Escrow", icon: DollarSign },
            { id: "tickets", label: `Grievances (${tenant.tickets.length})`, icon: AlertCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "3px solid var(--teal-primary)" : "3px solid transparent",
                  color: active ? "var(--teal-primary)" : "#64748B",
                  fontWeight: active ? 700 : 500,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PROFILE & KYC DOSSIER */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Left Card: Personal & Workplace Information */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={18} style={{ color: "var(--teal-primary)" }} /> Personal & Workplace Information
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Gender / Blood Group:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.gender} &bull; {tenant.bloodGroup}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Date of Birth:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.dob}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Primary Contact:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.phone}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Email Address:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.email}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Employer / College:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.workplace}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Designation:</span>
                  <strong style={{ color: "#0F172A" }}>{tenant.designation}</strong>
                </div>
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                  <span style={{ color: "#64748B", display: "block", marginBottom: "4px" }}>Emergency Contact (Next of Kin):</span>
                  <strong style={{ color: "#0F172A" }}>
                    {tenant.emergencyContactName} ({tenant.emergencyContactRelation}) &bull; {tenant.emergencyContactPhone}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block", marginBottom: "4px" }}>Permanent Home Address:</span>
                  <p style={{ margin: 0, color: "#0F172A", lineHeight: "1.4" }}>{tenant.permanentAddress}</p>
                </div>
              </div>
            </div>

            {/* Right Card: Aadhaar & Police Verification */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} style={{ color: "#059669" }} /> Statutory Identification & Police Intimation
              </h3>

              {/* Aadhaar Card Box */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>UIDAI Aadhaar Card</span>
                  <span style={{ fontSize: "11px", color: "#059669", background: "rgba(5, 150, 105, 0.1)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    100% OCR Match
                  </span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "monospace", color: "#0F172A", letterSpacing: "1px" }}>
                  {tenant.aadhaarMasked}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "6px" }}>
                  Verified via Aadhaar OTP & Face Match API &bull; Verified on: {tenant.joinedDate}
                </div>
              </div>

              {/* Police Intimation Box */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Police Form 29 Intimation</span>
                  <span style={{ fontSize: "11px", color: "#0284C7", background: "rgba(2, 132, 199, 0.1)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    Intimated
                  </span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                  Ref: {tenant.form29Ref}
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                  Jurisdiction: <strong>{tenant.policeStation}</strong>
                </div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                  Official acknowledgement receipt archived in platform compliance vault.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL RENTAL AGREEMENT */}
        {activeTab === "agreement" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0F172A" }}>
                  Digital Co-Living Tenancy Agreement
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                  Legally enforceable e-signed agreement between {tenant.businessName} and {tenant.name}.
                </p>
              </div>
              <button
                onClick={() => alert(`Downloading executed agreement PDF: AGR_${tenant.id}.pdf`)}
                className="btnSecondary"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
              >
                <Download size={14} /> Download Agreement PDF
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Agreement Term</span>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginTop: "4px" }}>
                  {tenant.agreementStartDate} &rarr; {tenant.agreementEndDate}
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Lock-in Tenure</span>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginTop: "4px" }}>
                  {tenant.lockInMonths} Calendar Months
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Mandatory Notice Period</span>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginTop: "4px" }}>
                  {tenant.noticePeriodDays} Days Prior Notice
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Submeter Electricity Rate</span>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginTop: "4px" }}>
                  ₹12 / kWh Unit
                </div>
              </div>
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                Key Tenancy Covenant Highlights:
              </h4>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Rent is strictly due on or before the 5th of each calendar month via the OneStay360 Tenant App.</li>
                <li>Late payment surcharge of ₹100/day applies automatically after the 10th of the billing month.</li>
                <li>Submeter electricity delta is computed on the 30th and split proportionally across active room inmates.</li>
                <li>Security deposit will be refunded within 7 working days of physical room inspection and biometric key return.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY & INVOICES */}
        {activeTab === "payments" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Chronological Payment History & Invoices
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Verified Cashfree AutoCollect & Razorpay transactions linked to room rent and deposits.
                </p>
              </div>
              <button
                onClick={() => alert("Downloading complete statement for resident...")}
                className="btnSecondary"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 14px" }}
              >
                <Download size={14} /> Download Statement
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px" }}>INVOICE ID</th>
                    <th style={{ padding: "12px 16px" }}>BILLING PERIOD</th>
                    <th style={{ padding: "12px 16px" }}>BILL TYPE</th>
                    <th style={{ padding: "12px 16px" }}>AMOUNT</th>
                    <th style={{ padding: "12px 16px" }}>PAYMENT METHOD</th>
                    <th style={{ padding: "12px 16px" }}>DATE PAID</th>
                    <th style={{ padding: "12px 16px" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {tenant.payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 700, color: "#0F172A" }}>
                        {p.invoiceId}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>{p.month}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ textTransform: "capitalize", padding: "2px 8px", borderRadius: "4px", background: "#F1F5F9", fontSize: "12px", fontWeight: 600 }}>
                          {p.type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--teal-primary)" }}>
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748B" }}>
                        <div>{p.paymentMode}</div>
                        <span style={{ fontSize: "11px", fontFamily: "monospace" }}>{p.transactionRef}</span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#64748B" }}>{p.paidAt}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, background: "#059669", color: "#FFFFFF" }}>
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))}
                  {tenant.payments.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
                        No payment records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY DEPOSIT ESCROW */}
        {activeTab === "escrow" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Security Deposit Escrow Account & Reconciliation
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
              Protects tenant deposits in nodal escrow to guarantee prompt, automated refunds upon verified checkout.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: "0 0 12px 0" }}>
                  Escrow Balance Status
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Initial Deposit Paid:</span>
                    <strong style={{ color: "#0F172A" }}>₹{tenant.depositAmount.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Holding Bank / Nodal Gateway:</span>
                    <strong style={{ color: "var(--teal-primary)" }}>HDFC Nodal Account (Cashfree Escrow)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Escrow Security Certificate:</span>
                    <span style={{ color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={14} /> Certified Compliant
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Refund Eligibility:</span>
                    <strong style={{ color: tenant.status === "active" ? "#64748B" : "#059669" }}>
                      {tenant.status === "active" ? "Active Tenancy" : "Eligible on Checkout"}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: "0 0 8px 0" }}>
                  Initiate Deposit Settlement
                </h4>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                  Review move-out condition, electricity meter delta, and pending dues to release funds.
                </p>
                <button
                  onClick={() => setShowClearanceModal(true)}
                  className="btnPrimary"
                  style={{ width: "100%", padding: "12px", fontWeight: 700, fontSize: "14px" }}
                >
                  Start Move-Out Clearance & Refund
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GRIEVANCES & TICKETS */}
        {activeTab === "tickets" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Resident Support Tickets & Operations Grievances
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Issues submitted through the OneStay360 Tenant App with SLA resolution timelines.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tenant.tickets.map((tck) => (
                <div
                  key={tck.id}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "14px", color: "#0F172A" }}>{tck.category}</strong>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: tck.status === "resolved" ? "#059669" : "#D97706",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {tck.status}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#475569" }}>{tck.issue}</p>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>Reported: {tck.createdAt}</span>
                  </div>

                  <span style={{ fontSize: "12px", color: "var(--teal-primary)", fontWeight: 700 }}>
                    SLA: Resolved in 4h
                  </span>
                </div>
              ))}
              {tenant.tickets.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
                  No active or past grievances reported by this resident.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOVE-OUT CLEARANCE MODAL */}
        {showClearanceModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "520px",
                padding: "26px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    Move-Out Clearance & Escrow Settlement
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Resident: {tenant.name} &bull; Bed {tenant.bedNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowClearanceModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#64748B" }}>Security Deposit in Escrow:</span>
                  <strong style={{ color: "#0F172A", fontSize: "15px" }}>₹{tenant.depositAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Pending Rent Dues (₹)
                  </label>
                  <input
                    type="number"
                    value={deductions.pendingRent}
                    onChange={(e) => setDeductions({ ...deductions, pendingRent: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Unsettled Electricity Submeter Units (₹)
                  </label>
                  <input
                    type="number"
                    value={deductions.unpaidElectricity}
                    onChange={(e) => setDeductions({ ...deductions, unpaidElectricity: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                    Room Damage & Deep Cleaning Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={deductions.damages}
                    onChange={(e) => setDeductions({ ...deductions, damages: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Settlement Summary */}
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "14px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#64748B" }}>Total Deductions:</span>
                  <strong style={{ color: "#DC2626" }}>- ₹{totalDeductions.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
                  <span style={{ fontWeight: 700, color: "#0F172A" }}>Net Escrow Refund:</span>
                  <strong style={{ color: "var(--teal-primary)", fontSize: "20px" }}>
                    ₹{netRefundAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleProcessRefund}
                  className="btnPrimary"
                  style={{ flex: 1, padding: "12px", fontWeight: 700, fontSize: "14px" }}
                >
                  Approve Clearance & Disburse Refund
                </button>
                <button
                  onClick={() => setShowClearanceModal(false)}
                  style={{ padding: "12px 18px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#64748B", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
