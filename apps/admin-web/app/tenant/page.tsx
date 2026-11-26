"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
} from "lucide-react";

interface MaintenanceTicket {
  id: string;
  category: "Plumbing" | "Electrical" | "Wi-Fi" | "Cleaning";
  issue: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: "TCK_9021",
    category: "Wi-Fi",
    issue: "Router restart needed on 1st floor corridor",
    status: "resolved",
    createdAt: "Yesterday, 3:30 PM",
  },
  {
    id: "TCK_9034",
    category: "Plumbing",
    issue: "Bathroom tap aerator cleaning in Room 101",
    status: "in_progress",
    createdAt: "Today, 10:15 AM",
  },
];

const WEEKLY_MENU: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
  Monday: {
    breakfast: "Poha, Boiled Eggs / Banana, Tea / Coffee",
    lunch: "Dal Tadka, Steamed Rice, Roti, Seasonal Veg, Salad",
    dinner: "Paneer Butter Masala / Chicken Curry, Jeera Rice, Chapati",
  },
  Tuesday: {
    breakfast: "Idli Sambar, Medu Vada, Coconut Chutney",
    lunch: "Rajma Chawal, Phulka, Mix Veg, Curd",
    dinner: "Aloo Gobhi, Yellow Dal, Chapati, Kheer",
  },
  Wednesday: {
    breakfast: "Aloo Paratha, Butter, Curd, Pickle, Tea",
    lunch: "Chole Bhature / Rice, Boondi Raita, Salad",
    dinner: "Egg Curry / Malai Kofta, Pulao, Roti, Gulab Jamun",
  },
  Thursday: {
    breakfast: "Upma with Chutney, Sprouts, Banana, Coffee",
    lunch: "Kadhi Pakora, Steamed Rice, Bhindi Masala, Roti",
    dinner: "Mix Dal, Matar Mushroom, Phulka, Rice",
  },
  Friday: {
    breakfast: "Masala Dosa, Sambar, Red & White Chutneys",
    lunch: "Veg Biryani / Chicken Dum Biryani, Mirchi Ka Salan, Raita",
    dinner: "Dal Makhani, Butter Roti, Jeera Rice, Ice Cream",
  },
  Saturday: {
    breakfast: "Puri Bhaji, Halwa, Masala Chai",
    lunch: "Sambhar Rice, Beans Poriyal, Curd Rice, Papad",
    dinner: "Veg Pulao, Paneer Tikka Masala, Tandoori Roti",
  },
  Sunday: {
    breakfast: "Misal Pav / Cornflakes with Milk, Fruits",
    lunch: "Special Sunday Feast (Paneer Kadhai / Mutton Sukka), Rice, Naan",
    dinner: "Light Khichdi / Dal Fry, Phulka, Papad, Fruit Custard",
  },
};

export default function TenantResidentHubPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "food" | "tickets">("overview");

  const [rentPaid, setRentPaid] = useState(false);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket["category"]>("Plumbing");
  const [complaintText, setComplaintText] = useState("");
  const [selectedDay, setSelectedDay] = useState("Wednesday");

  const displayName = userProfile?.displayName || user?.displayName || user?.phoneNumber || "Aarav Sharma";

  const resident = {
    name: displayName,
    phone: user?.phoneNumber || "+91 93593 03097",
    email: user?.email || "anilmanal992115@gmail.com",
    propertyName: "Ram Nivas PG",
    city: "Hinjawadi, Pune",
    room: "Room 101",
    bed: "Bed B-1 (Window Side)",
    moveInDate: "01 Jan 2026",
    kycStatus: "VERIFIED",
    passportId: "OS360-PASS-89104",
    pendingRent: 9000,
    submeterUnits: 34,
    submeterRate: 9.5,
    submeterAmount: 323,
    totalDue: 9323,
    dueDate: "05 Dec 2026",
    wardenName: "Ramesh Patel",
    wardenPhone: "+91 93593 03097",
  };

  const handlePayRent = () => {
    alert("Simulating Instant Cashfree UPI Deep-Link Payment...");
    setTimeout(() => {
      setRentPaid(true);
    }, 1000);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;

    const newTicket: MaintenanceTicket = {
      id: `TCK_${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      issue: complaintText,
      status: "open",
      createdAt: "Just now",
    };

    setTickets([newTicket, ...tickets]);
    setComplaintModalOpen(false);
    setComplaintText("");
  };

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
              background: "rgba(13, 148, 136, 0.2)",
              border: "1px solid rgba(13, 148, 136, 0.4)",
              color: "#5EEAD4",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            <ShieldCheck size={13} /> 1-TIME KYC VERIFIED • PASS ID: {resident.passportId}
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            Welcome Home, {resident.name}! 👋
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0" }}>
            {resident.propertyName} ({resident.city}) • <strong>{resident.room}</strong> ({resident.bed})
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
            <Compass size={15} /> Explore Other PGs
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
            <QrCode size={16} /> Digital Passport &amp; Form 29
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
                  BILLING REALIZATION • DEC 2026
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: "8px 0 2px 0" }}>
                  Monthly Rent &amp; Electricity Submeter
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
                  <CheckCircle2 size={16} /> PAID &amp; SETTLED
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
                <span style={{ color: "#64748B" }}>Base Double Bed Rent:</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>₹{resident.pendingRent.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
                <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={14} color="#F59E0B" /> Submeter Electricity ({resident.submeterUnits} kWh @ ₹{resident.submeterRate}/unit):
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
                <span style={{ fontWeight: 800, color: "#0F172A" }}>Net Total Due:</span>
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
                  onClick={() => alert("Downloading receipt REC-2026-12-001...")}
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
                  <Download size={14} /> Download Digital Rent Receipt
                </button>
              </div>
            )}
          </div>

          {/* Quick Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {/* Gate Pass Card */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#F0FDFA", color: "#0D9488", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Digital Gate Pass</h3>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>Scan for late-night entry</div>
                </div>
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: "10px", padding: "16px", textAlign: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>Pass ID: {resident.passportId}</div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#0F172A", letterSpacing: "2px" }}>ONE-STAY-GATE-ACCESS</div>
              </div>
              <button
                onClick={() => alert("Gate Pass refreshed for biometric / security scanner.")}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#FFFFFF", fontSize: "12px", fontWeight: 700, color: "#334155", cursor: "pointer" }}
              >
                Refresh Gate Pass Token
              </button>
            </div>

            {/* Warden Support Card */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>On-Site Warden</h3>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>Available on property 24/7</div>
                </div>
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{resident.wardenName}</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{resident.wardenPhone}</div>
              </div>
              <a
                href={`tel:${resident.wardenPhone}`}
                style={{ display: "block", textAlign: "center", width: "100%", padding: "8px", borderRadius: "6px", background: "#4F46E5", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
              >
                Call Warden
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEAL MENU */}
      {activeTab === "food" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Weekly 7-Day Meal Timetable
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                Nutritious home-cooked breakfast, lunch, and dinner included in your stay tariff.
              </p>
            </div>

            {/* Day Selector */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {Object.keys(WEEKLY_MENU).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: selectedDay === day ? "1px solid #0D9488" : "1px solid #E2E8F0",
                    background: selectedDay === day ? "#F0FDFA" : "#FFFFFF",
                    color: selectedDay === day ? "#0D9488" : "#64748B",
                    cursor: "pointer",
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", background: "#F8FAFC" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0D9488", textTransform: "uppercase", marginBottom: "6px" }}>
                🍳 Breakfast (7:30 AM - 10:00 AM)
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                {WEEKLY_MENU[selectedDay]?.breakfast}
              </div>
            </div>

            <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", background: "#F8FAFC" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#D97706", textTransform: "uppercase", marginBottom: "6px" }}>
                🍲 Lunch (12:30 PM - 2:30 PM)
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                {WEEKLY_MENU[selectedDay]?.lunch}
              </div>
            </div>

            <div style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", background: "#F8FAFC" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", marginBottom: "6px" }}>
                🍛 Dinner (8:00 PM - 10:30 PM)
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                {WEEKLY_MENU[selectedDay]?.dinner}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE TICKETS */}
      {activeTab === "tickets" && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                Maintenance &amp; Support Tickets
              </h3>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                Logged requests are assigned directly to the on-site property warden.
              </p>
            </div>
            <button
              onClick={() => setComplaintModalOpen(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#0D9488",
                color: "#FFFFFF",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Raise New Ticket
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: "#F1F5F9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                      {t.category}
                    </span>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{t.issue}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    ID: {t.id} • {t.createdAt}
                  </div>
                </div>

                <div>
                  {t.status === "resolved" ? (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", background: "#DCFCE7", padding: "4px 10px", borderRadius: "6px" }}>
                      Resolved
                    </span>
                  ) : t.status === "in_progress" ? (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "4px 10px", borderRadius: "6px" }}>
                      Warden Attending
                    </span>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#1E40AF", background: "#DBEAFE", padding: "4px 10px", borderRadius: "6px" }}>
                      Open
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              Logged for {resident.propertyName} ({resident.room}).
            </p>

            <form onSubmit={handleSubmitComplaint}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Issue Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                >
                  <option value="Plumbing">Plumbing (Tap / Flush / Leakage)</option>
                  <option value="Electrical">Electrical (Lights / AC / Sockets)</option>
                  <option value="Wi-Fi">Wi-Fi &amp; Internet</option>
                  <option value="Cleaning">Room &amp; Washroom Housekeeping</option>
                </select>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Describe the Issue
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Bathroom tap is leaking, needs washer replacement..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
