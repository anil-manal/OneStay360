"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fetchTenantStay, fetchTenantProfile, TenantStayData, TenantProfileData } from "@/lib/data-service";
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
  Compass,
  Calendar,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface MaintenanceTicket {
  id: string;
  category: "Plumbing" | "Electrical" | "Wi-Fi" | "Cleaning";
  issue: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export default function TenantResidentHubPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stay, setStay] = useState<TenantStayData>({ status: "none" });
  const [profile, setProfile] = useState<TenantProfileData | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "food" | "tickets">("overview");
  const [rentPaid, setRentPaid] = useState(false);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket["category"]>("Plumbing");
  const [complaintText, setComplaintText] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");

  useEffect(() => {
    async function loadResidentData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [stayData, profileData] = await Promise.all([
          fetchTenantStay(user.uid, user.phoneNumber || undefined),
          fetchTenantProfile(user.uid, user.phoneNumber || undefined),
        ]);
        setStay(stayData);
        setProfile(profileData);
      } catch (err) {
        console.error("Error loading resident hub:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResidentData();
  }, [user]);

  const displayName = profile?.fullName || userProfile?.displayName || user?.displayName || user?.phoneNumber || "Resident";
  const passportId = profile?.tenantId ? `OS360-PASS-${profile.tenantId.toUpperCase()}` : `OS360-PASS-${user?.uid.slice(0, 8).toUpperCase() || "PENDING"}`;

  const handlePayRent = () => {
    alert("Simulating Instant Cashfree UPI Deep-Link Payment...");
    setTimeout(() => {
      setRentPaid(true);
    }, 1000);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const newTicket: MaintenanceTicket = {
      id: `TCK_${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      issue: complaintText.trim(),
      status: "open",
      createdAt: "Just now",
    };

    setTickets([newTicket, ...tickets]);
    setComplaintModalOpen(false);
    setComplaintText("");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "var(--teal-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Loading Resident Experience...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Days list for meal timetable
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Resident Greeting Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          borderRadius: "20px",
          padding: "28px 32px",
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
              background: profile?.kycVerified ? "rgba(13, 148, 136, 0.2)" : "rgba(245, 158, 11, 0.2)",
              border: profile?.kycVerified ? "1px solid rgba(13, 148, 136, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)",
              color: profile?.kycVerified ? "#5EEAD4" : "#FBBF24",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            <ShieldCheck size={13} /> {profile?.kycVerified ? `1-TIME KYC VERIFIED • PASS ID: ${passportId}` : "KYC PENDING COMPLETION"}
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            Welcome Home, {displayName}! 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0" }}>
            {stay.status === "active" ? (
              <>
                {stay.propertyName} ({stay.propertyCity || "Pune"}) &bull; <strong>Room {stay.roomNumber}</strong> (Bed {stay.bedNumber})
              </>
            ) : stay.status === "pending_approval" ? (
              <>
                Enrollment Application for <strong>{stay.propertyName}</strong> &bull; {stay.requestStatus}
              </>
            ) : (
              "No Active PG Stay Allocated &bull; Browse verified PGs to request a room"
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            href="/tenant/explore"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <Compass size={15} /> Explore &amp; Book PGs
          </Link>
          <Link
            href="/tenant/passport"
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
            <QrCode size={16} /> Digital Passport &amp; KYC
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #E2E8F0",
          marginBottom: "24px",
          gap: "16px",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "12px 18px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            fontWeight: 700,
            color: activeTab === "overview" ? "#0D9488" : "#64748B",
            borderBottom: activeTab === "overview" ? "3px solid #0D9488" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Home size={16} /> Stay Overview &amp; Rent
        </button>

        <button
          onClick={() => setActiveTab("food")}
          style={{
            padding: "12px 18px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            fontWeight: 700,
            color: activeTab === "food" ? "#0D9488" : "#64748B",
            borderBottom: activeTab === "food" ? "3px solid #0D9488" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Utensils size={16} /> Daily Meal Timetable
        </button>

        <button
          onClick={() => setActiveTab("tickets")}
          style={{
            padding: "12px 18px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
            fontWeight: 700,
            color: activeTab === "tickets" ? "#0D9488" : "#64748B",
            borderBottom: activeTab === "tickets" ? "3px solid #0D9488" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Wrench size={16} /> Maintenance Tickets ({tickets.filter((t) => t.status !== "resolved").length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & RENT */}
      {activeTab === "overview" && (
        <div>
          {stay.status === "active" ? (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#0D9488",
                      background: "#F0FDFA",
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    ACTIVE LEASE • ALLOCATED BED
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: "8px 0 2px 0" }}>
                    {stay.propertyName}
                  </h2>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>
                    {stay.propertyAddress || "Hinjawadi, Pune"} &bull; Check-in: {stay.checkInDate || "Active"}
                  </div>
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
                    <CheckCircle2 size={16} /> RENT SETTLED
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
                    <Clock size={16} /> DUE 5TH OF MONTH
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Allocated Room</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                      Room {stay.roomNumber}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Bed Number</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                      Bed {stay.bedNumber}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Monthly Base Rent</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0D9488", marginTop: "2px" }}>
                      ₹{stay.monthlyRent?.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Security Deposit</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                      ₹{stay.depositAmount?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {!rentPaid && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handlePayRent}
                    className="btnPrimary"
                    style={{
                      padding: "10px 24px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CreditCard size={16} /> Pay ₹{stay.monthlyRent?.toLocaleString("en-IN")} via Cashfree UPI
                  </button>
                </div>
              )}
            </div>
          ) : stay.status === "pending_approval" ? (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "28px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <Clock size={28} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Enrollment Request Under Review
              </h2>
              <p style={{ fontSize: "14px", color: "#64748B", margin: "8px 0 20px 0", maxWidth: "480px", marginInline: "auto" }}>
                Your request to join <strong>{stay.propertyName}</strong> ({stay.sharingType}-Sharing, ₹{stay.monthlyRent?.toLocaleString("en-IN")}/mo) has been sent to the property owner. You will receive an SMS and email notification upon approval.
              </p>
              <Link
                href="/tenant/explore"
                className="btnPrimary"
                style={{ display: "inline-flex", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
              >
                Browse Additional PGs
              </Link>
            </div>
          ) : (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "36px 24px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#F0FDFA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <Home size={30} color="var(--teal-primary)" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                No Active PG Stay Allocated
              </h2>
              <p style={{ fontSize: "14px", color: "#64748B", margin: "8px 0 24px 0", maxWidth: "500px", marginInline: "auto" }}>
                You do not have an active bed booking yet. Explore verified OneStay360 properties with 360° virtual tours, transparent pricing, and instant enrollment requests.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/tenant/explore"
                  className="btnPrimary"
                  style={{ padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Compass size={18} /> Explore Verified PGs &rarr;
                </Link>
                <Link
                  href="/tenant/passport"
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#475569",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <QrCode size={18} /> Complete 1-Time KYC
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FOOD MENU */}
      {activeTab === "food" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                {stay.propertyName ? `${stay.propertyName} Weekly Meal Timetable` : "Property Meal Timetable"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                {stay.foodPlan?.notes || "Daily home-style meals (Breakfast, Lunch, and Dinner) provided by property management."}
              </p>
            </div>
          </div>

          {/* Days bar */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid #E2E8F0", marginBottom: "20px" }}>
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: selectedDay === day ? "2px solid #0D9488" : "1px solid #CBD5E1",
                  background: selectedDay === day ? "#F0FDFA" : "#FFFFFF",
                  color: selectedDay === day ? "#0D9488" : "#475569",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meals for selected day */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "18px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#0D9488", textTransform: "uppercase" }}>Breakfast &bull; 07:30 AM - 10:00 AM</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", margin: "8px 0 0 0" }}>
                Fresh hot breakfast served with tea / coffee in the dining hall.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "18px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#2563EB", textTransform: "uppercase" }}>Lunch &bull; 12:30 PM - 02:30 PM</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", margin: "8px 0 0 0" }}>
                Complete Indian thali with dal, rice, rotis, sabzi, salad, and curd.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "18px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#7C3AED", textTransform: "uppercase" }}>Dinner &bull; 08:00 PM - 10:30 PM</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", margin: "8px 0 0 0" }}>
                Special evening spread with chapati, gravies, rice, and sweet dessert.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TICKETS */}
      {activeTab === "tickets" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Maintenance &amp; Service Requests
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                Direct SLA-tracked tickets sent to your on-site PG warden and property manager.
              </p>
            </div>
            <button
              onClick={() => setComplaintModalOpen(true)}
              className="btnPrimary"
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} /> Raise New Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
              <CheckCircle2 size={32} color="#10B981" style={{ margin: "0 auto 8px auto" }} />
              <strong style={{ fontSize: "15px", color: "#0F172A", display: "block" }}>No Active Maintenance Complaints</strong>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                All facilities in your property are operating smoothly. Raise a ticket if you notice any issues with Wi-Fi, plumbing, electricals, or cleaning.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tickets.map((t) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: "#EFF6FF", color: "#2563EB" }}>
                      {t.category}
                    </span>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0F172A", marginTop: "4px" }}>{t.issue}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>Ticket ID: {t.id} &bull; {t.createdAt}</div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", background: t.status === "resolved" ? "#DCFCE7" : "#FEF3C7", color: t.status === "resolved" ? "#166534" : "#92400E" }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raise Ticket Modal */}
      {complaintModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 100 }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0", color: "#0F172A" }}>Raise Maintenance Request</h3>
            <form onSubmit={handleSubmitComplaint} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", background: "#FFFFFF" }}
                >
                  <option value="Plumbing">Plumbing (Tap, Geyser, Drain)</option>
                  <option value="Electrical">Electrical (Lights, Socket, Fan)</option>
                  <option value="Wi-Fi">Wi-Fi &amp; Internet</option>
                  <option value="Cleaning">Housekeeping &amp; Cleaning</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>Describe the Issue</label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. Bathroom tap aerator needs cleaning in Room 101"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#64748B", fontWeight: 600, fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btnPrimary"
                  style={{ padding: "8px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
