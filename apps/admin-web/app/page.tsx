"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./landing.css";
import {
  Building2,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  UtensilsCrossed,
  Wrench,
  FileCheck2,
  Users,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ArrowRight,
  Download,
  Sparkles,
  Camera,
  Coins,
  QrCode,
  BellRing,
  ExternalLink,
  MessageSquare,
  Calculator,
  Bed,
  Check,
  Rotate3d,
} from "lucide-react";

export default function LightLandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("app.") || host.startsWith("tenant.") || host.startsWith("my.")) {
        router.replace("/tenant");
      } else if (host.startsWith("partner.") || host.startsWith("business.") || host.startsWith("landlord.")) {
        router.replace("/business");
      } else if (host.startsWith("admin.") || host.startsWith("admin-")) {
        router.replace("/admin");
      }
    }
  }, [router]);

  const [activePersona, setActivePersona] = useState<"owners" | "tenants">("owners");
  const [previewTab, setPreviewTab] = useState<"owner" | "tenant">("owner");
  const [monthlyRentVolume, setMonthlyRentVolume] = useState<number>(2000000); // 20 Lakhs
  const [selectedBed, setSelectedBed] = useState<{ room: string; bed: string; tenant: string; rent: string; status: string } | null>({
    room: "Room 102",
    bed: "Bed A",
    tenant: "Aditya Sharma",
    rent: "₹12,500/mo",
    status: "Occupied • Paid",
  });
  const [matrixFilter, setMatrixFilter] = useState<"all" | "vacant" | "occupied">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Meter calculation demo
  const [electricityUnits, setElectricityUnits] = useState<number>(180);
  const electricityRate = 9;
  const roommatesCount = 2;
  const totalElecBill = electricityUnits * electricityRate;
  const perTenantElec = Math.round(totalElecBill / roommatesCount);

  // Gateway calculations
  const gatewayLossRate = 0.0236; // 2% + 18% GST
  const standardGatewayLoss = Math.round(monthlyRentVolume * gatewayLossRate);
  const oneStayCost = 0; // 0% UPI direct settlement
  const monthlySaved = standardGatewayLoss - oneStayCost;
  const annualSaved = monthlySaved * 12;

  // Mock rooms for interactive matrix
  const roomsData = [
    { number: "101", type: "Double Sharing", beds: [{ id: "A", status: "occupied", tenant: "Kunal Deshmukh", rent: "₹11,000" }, { id: "B", status: "vacant", tenant: "Available", rent: "₹11,000" }] },
    { number: "102", type: "Triple Sharing", beds: [{ id: "A", status: "occupied", tenant: "Aditya Sharma", rent: "₹9,500" }, { id: "B", status: "occupied", tenant: "Rohan V.", rent: "₹9,500" }, { id: "C", status: "notice", tenant: "Vikram (Leaving 10 Dec)", rent: "₹9,500" }] },
    { number: "103", type: "Single Deluxe", beds: [{ id: "A", status: "occupied", tenant: "Dr. Sandeep Patel", rent: "₹18,000" }] },
    { number: "104", type: "Double Sharing", beds: [{ id: "A", status: "vacant", tenant: "Available", rent: "₹12,000" }, { id: "B", status: "vacant", tenant: "Available", rent: "₹12,000" }] },
    { number: "201", type: "Triple Sharing", beds: [{ id: "A", status: "occupied", tenant: "Ayush Goyal", rent: "₹9,000" }, { id: "B", status: "occupied", tenant: "Prashant K.", rent: "₹9,000" }, { id: "C", status: "vacant", tenant: "Available", rent: "₹9,000" }] },
    { number: "202", type: "Double Sharing", beds: [{ id: "A", status: "occupied", tenant: "Harshil Dave", rent: "₹11,500" }, { id: "B", status: "notice", tenant: "Mohit (Leaving 15 Dec)", rent: "₹11,500" }] },
    { number: "203", type: "Single Premium", beds: [{ id: "A", status: "occupied", tenant: "Aniket Joshi", rent: "₹19,500" }] },
    { number: "204", type: "Double Sharing", beds: [{ id: "A", status: "occupied", tenant: "Nitin Rathore", rent: "₹11,500" }, { id: "B", status: "vacant", tenant: "Available", rent: "₹11,500" }] },
  ];

  const faqs = [
    {
      q: "How does OneStay360 eliminate payment gateway charges compared to legacy PG software?",
      a: "Most platforms route rent payments through standard aggregators, costing PG owners or tenants 2.0% to 2.36% in transaction fees. On ₹20 Lakhs monthly collections, you lose nearly ₹50,000 every month! OneStay360 implements true Direct UPI Intent & Zero-Loss settlement rails where money lands directly in your bank account with ₹0 gateway commission.",
    },
    {
      q: "What makes the OneStay360 360° Virtual Tour different from regular photos?",
      a: "Traditional apps only let owners upload flat camera photos that often mislead tenants. OneStay360 embeds interactive 360° panoramic virtual walkthroughs. Prospective tenants can navigate room dimensions, inspect bathroom cleanliness, and view common areas on their phone, driving 3x faster bookings without requiring physical visits.",
    },
    {
      q: "How does the automated WhatsApp rent reminder flow work?",
      a: "The system automatically dispatches customized WhatsApp messages with secure 1-tap payment links on your chosen dates (e.g., 1st, 3rd, and 5th of every month). Tenants tap the link, pay exact rent via GPay/PhonePe with ₹0 fee, and our server webhook instantly updates your ledger and generates a digital receipt.",
    },
    {
      q: "Can I manage multiple PG branches with separate managers?",
      a: "Yes. OneStay360 Business supports multi-branch property groups. You can assign wardens, accountants, or cleaners specific roles with restricted access to their respective branch while seeing unified analytics from your owner dashboard.",
    },
    {
      q: "Are the digital rent receipts compliant with corporate HRA claims?",
      a: "Yes. Every generated receipt is legally stamped with your Landlord PAN, property address, tenant details, and unique transaction reference ID for 100% valid HRA tax exemptions.",
    },
  ];

  return (
    <div className="landingRoot">
      <div className="ambientGlowTop"></div>
      <div className="ambientGlowMid"></div>

      {/* ================= Sticky Light Navbar ================= */}
      <nav className="landingNav">
        <div className="landingContainer">
          <div className="navContent">
            <Link href="/" className="brandLogo">
              <div className="logoIconBox">
                <Building2 size={24} color="#FFFFFF" />
              </div>
              <div>
                <span className="logoText">OneStay<span style={{ color: "#0D9488" }}>360</span></span>
                <span className="logoBadge" style={{ marginLeft: "8px" }}>ENTERPRISE</span>
              </div>
            </Link>

            <ul className="navLinks">
              <li><a href="#features" className="navLink">Features</a></li>
              <li><a href="#matrix-demo" className="navLink">Smart Bed Matrix</a></li>
              <li><a href="#comparison" className="navLink">Why OneStay360</a></li>
              <li><a href="#savings-calculator" className="navLink">Zero-Loss Calculator</a></li>
              <li><a href="#downloads" className="navLink">Mobile Apps</a></li>
              <li><a href="#faq" className="navLink">FAQ</a></li>
            </ul>

            <div className="navActions">
              <Link href="/admin" className="btnSecondary">
                <ShieldCheck size={16} /> Admin Portal
              </Link>
              <a href="#downloads" className="btnPrimary">
                Get Started Free <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= Hero Section (Light & Crisp) ================= */}
      <header className="heroSection">
        <div className="landingContainer">
          <div className="pillBadge">
            <Sparkles size={14} color="#0D9488" />
            <span>India&apos;s #1 Smart Co-Living &amp; PG Operating System</span>
          </div>

          <h1 className="heroHeading">
            The Complete Operating System for <br />
            <span className="gradientText">Modern PGs, Hostels &amp; Co-Living</span>
          </h1>

          <p className="heroSubtext">
            Say goodbye to 2% gateway cuts, manual WhatsApp chasing, and chaotic spreadsheets. 
            Automate rent collection with <strong>0% fee direct UPI</strong>, manage live bed occupancy, and delight tenants with <strong>360° virtual tours</strong>.
          </p>

          <div className="heroCtaGroup">
            <a href="#downloads" className="btnPrimary" style={{ padding: "14px 28px", fontSize: "16px" }}>
              <Building2 size={20} /> Register Your PG Free
            </a>
            <a href="#savings-calculator" className="btnSecondary" style={{ padding: "14px 28px", fontSize: "16px" }}>
              <TrendingUp size={20} /> Calculate Annual Savings
            </a>
          </div>

          <div className="heroTrustBadges">
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>15,000+ Beds Active</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>0% Gateway Surcharge on UPI</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>Instant WhatsApp Reminders</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>Paperless Aadhaar e-KYC</span>
            </div>
          </div>

          {/* ================= Interactive App Showcase Window ================= */}
          <div className="showcaseWindow">
            <div className="showcaseBar">
              <div className="showcaseDots">
                <span className="showcaseDot dotRed"></span>
                <span className="showcaseDot dotYellow"></span>
                <span className="showcaseDot dotGreen"></span>
              </div>
              <div className="showcaseTabs">
                <button
                  className={`showcaseTabBtn ${previewTab === "owner" ? "showcaseTabBtnActive" : ""}`}
                  onClick={() => setPreviewTab("owner")}
                >
                  PG Owner OS
                </button>
                <button
                  className={`showcaseTabBtn ${previewTab === "tenant" ? "showcaseTabBtnActive" : ""}`}
                  onClick={() => setPreviewTab("tenant")}
                >
                  Tenant Companion App
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>live.onestay360.com</div>
            </div>

            <div className="showcaseGrid">
              {previewTab === "owner" ? (
                <>
                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0D9488" }}>OCCUPANCY &amp; RENT RECOVERY</span>
                      <span style={{ fontSize: "11px", background: "#E6FFFA", color: "#0D9488", padding: "3px 10px", borderRadius: "12px", fontWeight: 700 }}>
                        94% OCCUPIED
                      </span>
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: 800, color: "#0F172A", marginBottom: "4px" }}>₹24,80,000</div>
                    <p style={{ fontSize: "12.5px", color: "#64748B", marginBottom: "16px" }}>Collected This Month • 186/198 Beds Occupied</p>
                    <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#64748B" }}>On-Time Collection Rate</span>
                        <span style={{ color: "#059669", fontWeight: 700 }}>98.2%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#64748B" }}>Pending Dues</span>
                        <span style={{ color: "#D97706", fontWeight: 700 }}>₹42,000 (3 Tenants)</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <MessageSquare size={16} color="#059669" /> Send 1-Click WhatsApp Reminders
                    </button>
                  </div>

                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0284C7" }}>SAVED IN GATEWAY COMMISSIONS</span>
                      <span style={{ fontSize: "11px", background: "#E0F2FE", color: "#0284C7", padding: "3px 10px", borderRadius: "12px", fontWeight: 700 }}>
                        0% UPI CUT
                      </span>
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: 800, color: "#059669", marginBottom: "4px" }}>+₹58,528 Saved</div>
                    <p style={{ fontSize: "12.5px", color: "#64748B", marginBottom: "16px" }}>Extra profit kept this month vs. traditional 2.36% gateways</p>
                    <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#64748B", marginBottom: "4px" }}>
                        <span>Generic Gateways &amp; Other PG Apps (2.36%)</span>
                        <span style={{ color: "#EF4444", fontWeight: 600 }}>- ₹58,528.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#64748B" }}>
                        <span>OneStay360 Net Settled</span>
                        <span style={{ color: "#059669", fontWeight: 700 }}>100% Full Payout</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "11px", borderRadius: "8px", background: "linear-gradient(135deg, #0D9488, #0F766E)", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
                      View Bank Settlement Report
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0D9488" }}>TENANT RENT CHECKOUT</span>
                      <span style={{ fontSize: "11px", background: "#E6FFFA", color: "#0D9488", padding: "3px 10px", borderRadius: "12px", fontWeight: 700 }}>
                        0% FEE ON UPI
                      </span>
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: 800, color: "#0F172A", marginBottom: "4px" }}>₹12,000.00</div>
                    <p style={{ fontSize: "12.5px", color: "#64748B", marginBottom: "16px" }}>Room 304 - Sharing Deluxe • Due 5th Dec</p>
                    <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#64748B" }}>Base Rent</span>
                        <span style={{ fontWeight: 600 }}>₹11,000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#64748B" }}>Electricity (142 Units)</span>
                        <span style={{ fontWeight: 600 }}>₹1,000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#059669", fontWeight: 700 }}>
                        <span>UPI Convenience Fee</span>
                        <span>₹0.00 (FREE)</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "linear-gradient(135deg, #0D9488, #0284C7)", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
                      Pay via GPay / PhonePe (₹12,000)
                    </button>
                  </div>

                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0284C7" }}>DAILY MESS MENU &amp; ATTENDANCE</span>
                      <span style={{ fontSize: "11px", background: "#E0F2FE", color: "#0284C7", padding: "3px 10px", borderRadius: "12px", fontWeight: 700 }}>
                        DINNER READY
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <UtensilsCrossed size={20} color="#0D9488" />
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>Paneer Butter Masala, Roti, Dal Fry &amp; Jeera Rice</span>
                    </div>
                    <p style={{ fontSize: "12.5px", color: "#64748B", marginBottom: "16px" }}>Serving: 7:30 PM - 10:00 PM • Dining Hall A</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1, background: "#E6FFFA", border: "1px solid #99F6E4", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                        <span style={{ fontSize: "12.5px", color: "#0D9488", fontWeight: 700 }}>Attending Dinner ✅</span>
                      </div>
                      <div style={{ flex: 1, background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                        <span style={{ fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}>Skip Meal</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= Live Stats Strip ================= */}
      <section className="statsSection">
        <div className="landingContainer">
          <div className="statsGrid">
            <div>
              <div className="statNumber">15,000+</div>
              <div className="statLabel">Active Beds Managed</div>
            </div>
            <div>
              <div className="statNumber">₹45 Cr+</div>
              <div className="statLabel">Annual Rent Collected</div>
            </div>
            <div>
              <div className="statNumber">99.4%</div>
              <div className="statLabel">On-Time Rent Collection</div>
            </div>
            <div>
              <div className="statNumber">₹0</div>
              <div className="statLabel">Gateway Loss on UPI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Interactive Smart Bed Matrix Demo ================= */}
      <section className="interactiveMatrixSection" id="matrix-demo">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">Live Interactive Demo</span>
            <h2 className="sectionTitle">Smart Visual Bed &amp; Room Matrix</h2>
            <p className="sectionSubtitle">
              Say goodbye to messy paper registers. OneStay360 gives you a real-time, color-coded floor map of every bed, occupancy status, and upcoming vacancy. Click any bed to test!
            </p>
          </div>

          <div className="matrixCard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
              <div className="matrixLegend">
                <div className="legendItem">
                  <span className="legendIndicator indOccupied"></span>
                  <span>Occupied</span>
                </div>
                <div className="legendItem">
                  <span className="legendIndicator indVacant"></span>
                  <span>Vacant &amp; Ready</span>
                </div>
                <div className="legendItem">
                  <span className="legendIndicator indNotice"></span>
                  <span>Notice Period</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setMatrixFilter("all")}
                  style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, border: "1px solid #CBD5E1", background: matrixFilter === "all" ? "#0D9488" : "#FFF", color: matrixFilter === "all" ? "#FFF" : "#475569", cursor: "pointer" }}
                >
                  All Beds
                </button>
                <button
                  onClick={() => setMatrixFilter("vacant")}
                  style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, border: "1px solid #CBD5E1", background: matrixFilter === "vacant" ? "#0D9488" : "#FFF", color: matrixFilter === "vacant" ? "#FFF" : "#475569", cursor: "pointer" }}
                >
                  Vacant Only
                </button>
                <button
                  onClick={() => setMatrixFilter("occupied")}
                  style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, border: "1px solid #CBD5E1", background: matrixFilter === "occupied" ? "#0D9488" : "#FFF", color: matrixFilter === "occupied" ? "#FFF" : "#475569", cursor: "pointer" }}
                >
                  Occupied
                </button>
              </div>
            </div>

            <div className="roomsGrid">
              {roomsData.map((room) => {
                const filteredBeds = room.beds.filter((b) => {
                  if (matrixFilter === "vacant") return b.status === "vacant";
                  if (matrixFilter === "occupied") return b.status === "occupied" || b.status === "notice";
                  return true;
                });

                if (filteredBeds.length === 0) return null;

                return (
                  <div key={room.number} className="roomBox">
                    <div className="roomHeader">
                      <span className="roomName">Room {room.number}</span>
                      <span className="roomType">{room.type}</span>
                    </div>
                    <div className="bedsList">
                      {filteredBeds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`bedChip ${
                            bed.status === "vacant" ? "bedVacant" : bed.status === "notice" ? "bedNotice" : "bedOccupied"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setSelectedBed({
                              room: `Room ${room.number}`,
                              bed: `Bed ${bed.id}`,
                              tenant: bed.tenant,
                              rent: `${bed.rent}/mo`,
                              status: bed.status === "vacant" ? "Vacant & Available" : bed.status === "notice" ? "Notice Period" : "Occupied • Active",
                            })
                          }
                        >
                          Bed {bed.id}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedBed && (
              <div style={{ marginTop: "24px", padding: "16px 20px", background: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#0D9488", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    <Bed size={20} />
                  </div>
                  <div>
                    <strong style={{ color: "#0F172A", fontSize: "14px" }}>{selectedBed.room} • {selectedBed.bed}</strong>
                    <div style={{ fontSize: "12.5px", color: "#475569" }}>Tenant: <strong>{selectedBed.tenant}</strong> | Rent: {selectedBed.rent}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", background: "#FFFFFF", color: "#0D9488", border: "1px solid #99F6E4" }}>
                    {selectedBed.status}
                  </span>
                  <button style={{ padding: "6px 14px", borderRadius: "6px", background: "#0D9488", color: "#FFF", border: "none", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>
                    View Ledger
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= Modern Feature Matrix Comparison ================= */}
      <section className="comparisonSection" id="comparison">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">The Clear Difference</span>
            <h2 className="sectionTitle">Why Property Leaders Choose OneStay360</h2>
            <p className="sectionSubtitle">
              See how OneStay360 compares directly against traditional spreadsheets and generic PG software.
            </p>
          </div>

          <div className="landingComparisonWrapper">
            <table className="landingCompareTable">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Core Platform Capability</th>
                  <th style={{ width: "23%", color: "#64748B" }}>Manual / Spreadsheets</th>
                  <th style={{ width: "22%", color: "#64748B" }}>Other PG Apps &amp; Gateways</th>
                  <th className="thHighlight" style={{ width: "23%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>OneStay360 Pro</span>
                      <span style={{ fontSize: "10px", background: "#0D9488", color: "#FFF", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>VERIFIED</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>UPI Rent Collection Fee</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Fee charged on digital tenant rent payments</span>
                  </td>
                  <td>
                    <span className="badgeMuted">Manual Cash / NEFT</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> 1.95% - 2.36% Cut
                    </span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> 0% Direct Settlement
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Virtual Room Walkthroughs</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Experience before visiting the property</span>
                  </td>
                  <td>
                    <span className="badgeMuted">Physical visits only</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> Flat photos only
                    </span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> 360° Panoramic Tours
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Annual Gateway Loss (₹20L/mo Rent)</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Net margin deducted by payment platforms</span>
                  </td>
                  <td>
                    <span className="badgeMuted">High default risk</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> ~₹5,60,000 Lost / yr
                    </span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> ₹0 Loss (100% Net Profit)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Automated WhatsApp Invoicing</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Scheduled reminders with direct pay links</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> Manual call &amp; SMS
                    </span>
                  </td>
                  <td>
                    <span className="badgeMuted">Generic text reminder</span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> 1-Tap 0%-Fee Pay Link
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Sub-Meter Electricity Splitting</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Per-unit roommate consumption billing</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> Notebook &amp; arguments
                    </span>
                  </td>
                  <td>
                    <span className="badgeMuted">Basic manual total</span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> Auto Roommate Unit Split
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Corporate HRA Rent Receipts</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Official receipts for employee tax savings</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> Paper slips
                    </span>
                  </td>
                  <td>
                    <span className="badgeMuted">Simple PDF slip</span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> PAN-Stamped Instant PDF
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "#0F172A", display: "block" }}>Aadhaar e-KYC &amp; Police Verification</strong>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>Compliant tenant identity background check</span>
                  </td>
                  <td>
                    <span className="badgeCross">
                      <XCircle size={14} /> Paper photocopies
                    </span>
                  </td>
                  <td>
                    <span className="badgeMuted">Basic photo upload</span>
                  </td>
                  <td className="colHighlight">
                    <span className="badgeCheck">
                      <Check size={14} /> Instant e-KYC Packet
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= Interactive Savings Calculator ================= */}
      <section className="calculatorSection" id="savings-calculator">
        <div className="landingContainer">
          <div className="calculatorCard">
            <div className="calcGrid">
              <div>
                <span className="sectionTag">Fintech Edge</span>
                <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0F172A", marginBottom: "14px" }}>
                  Calculate What Generic Gateways Cost You
                </h2>
                <p style={{ fontSize: "15px", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
                  Standard payment gateways take <strong>2.0% + 18% GST (2.36%)</strong> on rental transactions. 
                  Move the slider to see how much money stays directly in your pocket with OneStay360.
                </p>

                <div className="sliderContainer">
                  <div className="sliderLabelRow">
                    <span style={{ fontSize: "14px", color: "#64748B", fontWeight: 600 }}>Your Monthly Rent Collection:</span>
                    <span className="sliderValueDisplay">₹{(monthlyRentVolume / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={5000000}
                    step={100000}
                    value={monthlyRentVolume}
                    onChange={(e) => setMonthlyRentVolume(Number(e.target.value))}
                    className="customSlider"
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94A3B8", marginTop: "8px", fontWeight: 600 }}>
                    <span>₹2 Lakhs / mo</span>
                    <span>₹25 Lakhs / mo</span>
                    <span>₹50 Lakhs / mo</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "#FEF2F2", padding: "16px", borderRadius: "12px", border: "1px solid #FECACA" }}>
                    <div style={{ fontSize: "12px", color: "#DC2626", fontWeight: 700 }}>Others Take Every Month</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>
                      - ₹{standardGatewayLoss.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div style={{ background: "#F0FDFA", padding: "16px", borderRadius: "12px", border: "1px solid #99F6E4" }}>
                    <div style={{ fontSize: "12px", color: "#0D9488", fontWeight: 700 }}>OneStay360 Fee</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#0D9488", marginTop: "4px" }}>
                      ₹0 Gateway Cut
                    </div>
                  </div>
                </div>
              </div>

              <div className="calcResultBox">
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#E6FFFA", textTransform: "uppercase", letterSpacing: "1px" }}>
                  YOUR ANNUAL PROFIT PRESERVED
                </span>
                <div className="calcAnnualSaved">
                  ₹{annualSaved.toLocaleString("en-IN")}
                </div>
                <p style={{ fontSize: "14px", color: "#E6FFFA", marginBottom: "24px", opacity: 0.9 }}>
                  Real money credited directly to your business bank account each year instead of disappearing into gateway fees.
                </p>
                <a href="#downloads" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px 20px", borderRadius: "10px", background: "#FFFFFF", color: "#0F766E", textDecoration: "none", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  Stop Gateway Losses Today <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WhatsApp Automated Reminders Showcase ================= */}
      <section className="whatsappSection">
        <div className="landingContainer">
          <div className="whatsappGrid">
            <div>
              <span className="sectionTag">Zero Awkward Calls</span>
              <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#0F172A", marginBottom: "16px" }}>
                Automated WhatsApp Reminders with 1-Tap UPI Payment
              </h2>
              <p style={{ fontSize: "16px", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
                Never spend your 1st of the month chasing tenants for rent. OneStay360 automatically crafts respectful, professional WhatsApp notices with individual room details and a secure 0%-fee UPI payment link.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Scheduled on 1st, 3rd, and due date automatically</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Exact rent + power unit bill itemized cleanly</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#334155" }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Instant receipt auto-delivered upon payment</span>
                </div>
              </div>
            </div>

            <div className="waChatBubble">
              <div className="waSender">
                <Building2 size={16} /> Om Sai Comforts Co-Living (via OneStay360)
              </div>
              <p style={{ fontSize: "14px", color: "#1E293B", lineHeight: 1.6, margin: "10px 0" }}>
                Dear <strong>Aditya Sharma</strong>,<br /><br />
                Your monthly stay bill for <strong>Room 102 (Bed A)</strong> is generated:
                <br />
                • Base Rent: <strong>₹11,500</strong><br />
                • Electricity Units (90 units): <strong>₹810</strong><br />
                • <strong>Total Payable: ₹12,310</strong><br /><br />
                Pay instantly via UPI (Google Pay / PhonePe) with <strong>₹0 extra fee</strong>:
                <br />
                👉 <span style={{ color: "#0284C7", textDecoration: "underline" }}>https://onestay360.com/pay/INV9823</span>
              </p>
              <div style={{ background: "#FFFFFF", borderRadius: "8px", padding: "10px", border: "1px solid #D1FAE5", marginTop: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "12.5px", fontWeight: 700 }}>
                  <Zap size={14} /> Instant Receipt will be generated automatically
                </div>
              </div>
              <div className="waTime">10:02 AM • Delivered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= App Download Section ================= */}
      <section className="downloadSection" id="downloads">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">Get Started in 60 Seconds</span>
            <h2 className="sectionTitle">Download the OneStay360 Mobile Apps</h2>
            <p className="sectionSubtitle">
              Available on Android, iOS, and Web. Choose the companion app designed specifically for you.
            </p>
          </div>

          <div className="downloadGrid">
            {/* Business App Card */}
            <div className="downloadCard downloadCardOwner">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
                    <Building2 size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "21px", fontWeight: 800, color: "#0F172A" }}>OneStay360 Business</h3>
                    <span style={{ fontSize: "12.5px", color: "#0284C7", fontWeight: 700 }}>For PG Owners, Hostels &amp; Co-Living Chains</span>
                  </div>
                </div>
                <p style={{ fontSize: "14.5px", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
                  Visual bed matrix, automated WhatsApp payment reminders, zero-loss rent settlements, electricity unit splitters, and staff permission controls.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#F8FAFC", padding: "16px", borderRadius: "14px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
                  <QrCode size={52} color="#0284C7" />
                  <div style={{ fontSize: "12.5px", color: "#64748B" }}>
                    <strong style={{ color: "#0F172A", display: "block", marginBottom: "2px" }}>Scan to Install Business App</strong>
                    Available for Android phones &amp; tablets
                  </div>
                </div>
                <a href="#" className="btnPrimary" style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)", borderColor: "#0284C7" }}>
                  <Download size={16} /> Download Business App Free
                </a>
              </div>
            </div>

            {/* Tenant App Card */}
            <div className="downloadCard downloadCardTenant">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#E6FFFA", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D9488" }}>
                    <Smartphone size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "21px", fontWeight: 800, color: "#0F172A" }}>OneStay360 Tenant</h3>
                    <span style={{ fontSize: "12.5px", color: "#0D9488", fontWeight: 700 }}>Living Experience &amp; Rent App</span>
                  </div>
                </div>
                <p style={{ fontSize: "14.5px", color: "#64748B", lineHeight: 1.6, marginBottom: "24px" }}>
                  Find verified PGs with 360° virtual tours, pay rent with 0% extra fee on UPI, check daily food menus, download HRA receipts, and raise maintenance tickets.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#F8FAFC", padding: "16px", borderRadius: "14px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
                  <QrCode size={52} color="#0D9488" />
                  <div style={{ fontSize: "12.5px", color: "#64748B" }}>
                    <strong style={{ color: "#0F172A", display: "block", marginBottom: "2px" }}>Scan to Install Tenant App</strong>
                    Instant access on Google Play &amp; App Store
                  </div>
                </div>
                <a href="#" className="btnPrimary" style={{ width: "100%", justifyContent: "center" }}>
                  <Download size={16} /> Download Tenant App
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ Accordion ================= */}
      <section className="faqSection" id="faq">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">Got Questions?</span>
            <h2 className="sectionTitle">Frequently Asked Questions</h2>
            <p className="sectionSubtitle">
              Everything you need to know about switching from older software, spreadsheets, or physical registers.
            </p>
          </div>

          <div className="faqList">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="faqItem"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <div className="faqQuestion">
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={20}
                      color="#64748B"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                      }}
                    />
                  </div>
                  {isOpen && <div className="faqAnswer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= Clean Modern Footer ================= */}
      <footer className="landingFooter">
        <div className="landingContainer">
          <div className="footerGrid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div className="logoIconBox" style={{ width: "36px", height: "36px" }}>
                  <Building2 size={20} color="#FFFFFF" />
                </div>
                <span className="logoText" style={{ fontSize: "19px", color: "#FFFFFF" }}>OneStay360</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#94A3B8", marginBottom: "20px", maxWidth: "320px" }}>
                India&apos;s smart co-living and PG management operating system. Zero brokerage, zero payment cuts, 100% digital living.
              </p>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                <div>Support: <a href="mailto:support@onestay360.com" style={{ color: "#2DD4BF", textDecoration: "none" }}>support@onestay360.com</a></div>
                <div style={{ marginTop: "4px" }}>Helpline: <span style={{ color: "#FFFFFF" }}>+91 9359303097</span></div>
              </div>
            </div>

            <div>
              <h4 className="footerColTitle">Features</h4>
              <ul className="footerLinks">
                <li><a href="#matrix-demo">Smart Bed Matrix</a></li>
                <li><a href="#comparison">Why OneStay360</a></li>
                <li><a href="#savings-calculator">0% UPI Settlements</a></li>
                <li><a href="#features">360° Virtual Tours</a></li>
                <li><a href="#downloads">WhatsApp Notices</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footerColTitle">For PG Owners</h4>
              <ul className="footerLinks">
                <li><a href="#savings-calculator">Zero-Loss Calculator</a></li>
                <li><a href="#downloads">Register PG Free</a></li>
                <li><a href="#matrix-demo">Occupancy Map</a></li>
                <li><a href="#faq">Switch from Legacy Apps</a></li>
                <li><a href="#downloads">Business App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footerColTitle">Administration</h4>
              <ul className="footerLinks">
                <li>
                  <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2DD4BF" }}>
                    SuperAdmin Console <ExternalLink size={14} />
                  </Link>
                </li>
                <li><a href="#faq">Help &amp; FAQ</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms &amp; Conditions</a></li>
                <li><a href="#">Security Safeguards</a></li>
              </ul>
            </div>
          </div>

          <div className="footerBottom">
            <div>© {new Date().getFullYear()} OneStay360 Technologies Pvt Ltd. All rights reserved.</div>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ color: "#64748B", textDecoration: "none" }}>Privacy</a>
              <a href="#" style={{ color: "#64748B", textDecoration: "none" }}>Terms</a>
              <a href="#" style={{ color: "#64748B", textDecoration: "none" }}>Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
