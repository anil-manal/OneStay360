"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Zap,
  Receipt,
  FileText,
  User,
  Home,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  QrCode,
  Download,
  Phone,
  Sparkles,
  Utensils,
  Wrench,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function TenantResidentHubPage() {
  const [rentPaid, setRentPaid] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const resident = {
    name: "Aarav Sharma",
    phone: "+91 98234 56789",
    email: "aarav.sharma@example.com",
    propertyName: "Zolo CyberPark Premier Residency",
    room: "Room 101",
    bed: "Bed B-1 (Window Side)",
    moveInDate: "01 Aug 2025",
    kycStatus: "VERIFIED",
    passportId: "OS360-PASS-89104",
    pendingRent: 8500,
    submeterUnits: 34,
    submeterRate: 9.5,
    submeterAmount: 323,
    totalDue: 8823,
    dueDate: "05 Nov 2026",
    wardenName: "Ramesh Patel",
    wardenPhone: "+91 98250 11223",
  };

  const handlePayRent = () => {
    alert("Redirecting to Cashfree UPI Gateway (Simulation)...");
    setTimeout(() => {
      setRentPaid(true);
    }, 1000);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;
    setComplaintSubmitted(true);
    setTimeout(() => {
      setComplaintSubmitted(false);
      setComplaintModalOpen(false);
      setComplaintText("");
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        paddingBottom: "80px",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#0D9488",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
                OneStay<span style={{ color: "#0D9488" }}>360</span>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>
                RESIDENT SELF-SERVICE PORTAL
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/passport"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#ECFDF5",
                color: "#059669",
                border: "1px solid #A7F3D0",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <ShieldCheck size={14} /> My Resident Passport
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "24px auto 0", padding: "0 20px" }}>
        {/* Resident Greeting Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "#FFFFFF",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
            boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(13, 148, 136, 0.2)",
                border: "1px solid rgba(13, 148, 136, 0.4)",
                color: "#5EEAD4",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              <ShieldCheck size={13} /> ONE-TIME KYC VERIFIED • PASS ID: {resident.passportId}
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              Welcome Home, {resident.name}! 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0" }}>
              {resident.propertyName} • {resident.room} ({resident.bed})
            </p>
          </div>

          <Link
            href="/passport"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#0D9488",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <QrCode size={16} /> Open Digital Passport & Police Form 29
          </Link>
        </div>

        {/* Current Month Rent Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#2563EB",
                  background: "#EFF6FF",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                CURRENT BILLING CYCLE • NOV 2026
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: "8px 0 2px 0" }}>
                Monthly Rent & Submeter Due
              </h2>
              <div style={{ fontSize: "13px", color: "#64748B" }}>Due Date: {resident.dueDate}</div>
            </div>

            {rentPaid ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#DCFCE7",
                  color: "#166534",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={16} /> PAID & SETTLED
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#FEF3C7",
                  color: "#92400E",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                <Clock size={16} /> PAYMENT PENDING
              </span>
            )}
          </div>

          <div
            style={{
              background: "#F8FAFC",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
              <span style={{ color: "#64748B" }}>Base Bed Rent:</span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>₹{resident.pendingRent.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
              <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={14} color="#F59E0B" /> Electricity Submeter ({resident.submeterUnits} units @ ₹{resident.submeterRate}/unit):
              </span>
              <span style={{ fontWeight: 700, color: "#0F172A" }}>₹{resident.submeterAmount}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "12px",
                borderTop: "1px dashed #CBD5E1",
                fontSize: "18px",
              }}
            >
              <span style={{ fontWeight: 800, color: "#0F172A" }}>Net Total Payable:</span>
              <span style={{ fontWeight: 900, color: rentPaid ? "#16A34A" : "#0D9488" }}>
                {rentPaid ? "₹0.00" : `₹${resident.totalDue.toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>

          {!rentPaid ? (
            <button
              onClick={handlePayRent}
              style={{
                width: "100%",
                padding: "14px",
                background: "#0D9488",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.2)",
              }}
            >
              <CreditCard size={18} /> Pay ₹{resident.totalDue.toLocaleString("en-IN")} via Cashfree UPI / Cards
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => alert("Downloading receipt REC-2026-11-001...")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Download size={14} /> Download Payment Receipt
              </button>
            </div>
          )}
        </div>

        {/* Resident Services Quick Actions Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Passport & KYC Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>
              Universal Resident Passport
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0", lineHeight: 1.4 }}>
              Your verified Aadhaar OKYC credentials, emergency contact, and automated State Police Form 29 PDF.
            </p>
            <Link
              href="/passport"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#059669",
                textDecoration: "none",
              }}
            >
              View My Passport <ChevronRight size={14} />
            </Link>
          </div>

          {/* Maintenance / Help Desk */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Wrench size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>
              Maintenance & Support
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0", lineHeight: 1.4 }}>
              Got an issue with Wi-Fi, plumbing, or AC? Raise a priority ticket to the property warden.
            </p>
            <button
              onClick={() => setComplaintModalOpen(true)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                fontSize: "13px",
                fontWeight: 700,
                color: "#D97706",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Raise Maintenance Ticket <ChevronRight size={14} />
            </button>
          </div>

          {/* Warden Contact Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#EEF2FF",
                color: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Phone size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0" }}>
              On-Site Warden
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0", lineHeight: 1.4 }}>
              {resident.wardenName} is on duty 24/7 for security, gate access, and emergencies.
            </p>
            <a
              href={`tel:${resident.wardenPhone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#4F46E5",
                textDecoration: "none",
              }}
            >
              Call {resident.wardenPhone} <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </main>

      {/* Raise Ticket Modal */}
      {complaintModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
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
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
              Raise Maintenance Ticket
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0" }}>
              Describe the issue in {resident.room}. The warden will attend within 2 hours.
            </p>

            <form onSubmit={handleSubmitComplaint}>
              <textarea
                required
                rows={4}
                placeholder="e.g. AC cooling is low / tap is leaking..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  marginBottom: "16px",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
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
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0D9488",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  {complaintSubmitted ? "Ticket Logged!" : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
