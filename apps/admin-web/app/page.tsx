"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ChevronDown,
  ArrowRight,
  Download,
  Sparkles,
  Camera,
  Coins,
  QrCode,
  BellRing,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [activePersona, setActivePersona] = useState<"tenants" | "owners">("tenants");
  const [previewTab, setPreviewTab] = useState<"tenant" | "owner">("tenant");
  const [monthlyRentVolume, setMonthlyRentVolume] = useState<number>(1500000); // 15 Lakhs default
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations for savings calculator
  const gatewayLossRate = 0.0236; // 2% + 18% GST
  const standardGatewayLoss = Math.round(monthlyRentVolume * gatewayLossRate);
  const oneStayCost = Math.round(monthlyRentVolume * 0.0002); // ~negligible direct routing
  const monthlySaved = standardGatewayLoss - oneStayCost;
  const annualSaved = monthlySaved * 12;

  const faqs = [
    {
      q: "How does OneStay360 ensure 0% payment charges on UPI for tenants?",
      a: "Unlike traditional e-commerce gateways that charge a 2% to 2.36% platform fee on UPI, OneStay360 routes UPI payments directly to the PG owner's verified bank account via NPCI UPI Intent. Tenants pay the exact base rent with ₹0 extra charges on Google Pay, PhonePe, or Paytm.",
    },
    {
      q: "How quickly do PG owners receive rent settlements?",
      a: "Settlements occur directly to the PG owner's registered bank account. Because funds are routed peer-to-merchant, there is zero platform holding time, and money is available in real time or T+1 depending on the chosen rail.",
    },
    {
      q: "Can I manage multiple properties or branches from one account?",
      a: "Yes! OneStay360 Business supports multi-property architecture. PG owners and hostel managers can switch between buildings, manage individual wardens or floor managers with role-based permissions, and view unified financial reports.",
    },
    {
      q: "Are tenant digital rent receipts eligible for HRA tax exemption?",
      a: "Absolutely. Every time a bill is settled, the Tenant App automatically generates an authentic digital rent receipt containing the property address, landlord PAN, tenant details, and unique transaction ID ready for corporate HRA claims.",
    },
    {
      q: "What is the 360° Room Tour feature?",
      a: "OneStay360 allows properties to upload interactive 360-degree panoramic room tours. Prospective tenants can explore bedrooms, washrooms, and common dining areas virtually from their phone before making a booking.",
    },
  ];

  return (
    <div className="landingRoot">
      <div className="ambientGlowTop"></div>
      <div className="ambientGlowMid"></div>

      {/* ================= Sticky Navbar ================= */}
      <nav className="landingNav">
        <div className="landingContainer">
          <div className="navContent">
            <Link href="/" className="brandLogo">
              <div className="logoIconBox">
                <Building2 size={24} color="#FFFFFF" />
              </div>
              <div>
                <span className="logoText">OneStay360</span>
                <span className="logoBadge" style={{ marginLeft: "8px" }}>PRO</span>
              </div>
            </Link>

            <ul className="navLinks">
              <li><a href="#features" className="navLink">Features</a></li>
              <li><a href="#dual-solution" className="navLink">For Tenants</a></li>
              <li><a href="#dual-solution" className="navLink">For PG Owners</a></li>
              <li><a href="#savings-calculator" className="navLink">Zero-Loss Calculator</a></li>
              <li><a href="#downloads" className="navLink">Get the App</a></li>
              <li><a href="#faq" className="navLink">FAQ</a></li>
            </ul>

            <div className="navActions">
              <Link href="/admin" className="btnSecondary">
                <ShieldCheck size={16} /> Admin Console
              </Link>
              <a href="#downloads" className="btnPrimary">
                Download App <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <header className="heroSection">
        <div className="landingContainer">
          <div className="pillBadge">
            <Sparkles size={14} />
            <span>India&apos;s Smartest Co-Living &amp; PG Operating System</span>
          </div>

          <h1 className="heroHeading">
            Live Smarter. Manage Effortlessly. <br />
            <span className="gradientText">Zero Brokerage. Zero Payment Loss.</span>
          </h1>

          <p className="heroSubtext">
            The all-in-one digital platform connecting discerning tenants with verified PGs and hostels. 
            Enjoy 360° virtual tours, instant 0%-fee UPI rent payments, and automated operations for modern co-living.
          </p>

          <div className="heroCtaGroup">
            <a href="#downloads" className="btnPrimary" style={{ padding: "14px 28px", fontSize: "16px" }}>
              <Smartphone size={20} /> Download Tenant App
            </a>
            <a href="#savings-calculator" className="btnSecondary" style={{ padding: "14px 28px", fontSize: "16px" }}>
              <TrendingUp size={20} /> Calculate Business Savings
            </a>
          </div>

          <div className="heroTrustBadges">
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>15,000+ Verified Beds</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>₹0 Gateway Loss on UPI</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>Direct Bank Settlements</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={18} className="trustIcon" />
              <span>Instant Digital Move-In</span>
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
                  className={`showcaseTabBtn ${previewTab === "tenant" ? "showcaseTabBtnActive" : ""}`}
                  onClick={() => setPreviewTab("tenant")}
                >
                  Tenant Experience
                </button>
                <button
                  className={`showcaseTabBtn ${previewTab === "owner" ? "showcaseTabBtnActive" : ""}`}
                  onClick={() => setPreviewTab("owner")}
                >
                  PG Owner Dashboard
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "#64748B" }}>onestay360.com/live</div>
            </div>

            <div className="showcaseGrid">
              {previewTab === "tenant" ? (
                <>
                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#2DD4BF" }}>MONTHLY BILL BREAKDOWN</span>
                      <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        0% EXTRA FEE
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", marginBottom: "6px" }}>₹12,000.00</div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>Room 304 - Sharing Deluxe • Due on 5th Dec</p>
                    <div style={{ background: "#1E293B", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#94A3B8" }}>Base Rent</span>
                        <span style={{ fontWeight: 600 }}>₹11,000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#94A3B8" }}>Electricity (142 Units)</span>
                        <span style={{ fontWeight: 600 }}>₹1,000</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#10B981", fontWeight: 600 }}>
                        <span>UPI Convenience Fee</span>
                        <span>₹0.00 (FREE)</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "linear-gradient(135deg, #0D9488, #06B6D4)", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
                      Pay via GPay / PhonePe (₹12,000)
                    </button>
                  </div>

                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#38BDF8" }}>TODAY&apos;S CHEF MENU &amp; ATTENDANCE</span>
                      <span style={{ fontSize: "11px", background: "rgba(56, 189, 248, 0.2)", color: "#38BDF8", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        DINNER READY
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <UtensilsCrossed size={20} color="#38BDF8" />
                      <span style={{ fontSize: "15px", fontWeight: 700 }}>Paneer Butter Masala, Roti, Dal Fry &amp; Jeera Rice</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>Serving: 7:30 PM - 10:00 PM • Dining Hall A</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1, background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                        <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>Attending Dinner ✅</span>
                      </div>
                      <div style={{ flex: 1, background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                        <span style={{ fontSize: "12px", color: "#94A3B8" }}>Skip Meal</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#10B981" }}>OCCUPANCY &amp; RENT RECOVERY</span>
                      <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.2)", color: "#10B981", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        94% OCCUPIED
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", marginBottom: "6px" }}>₹24,80,000</div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>Collected This Month • 186/198 Beds Occupied</p>
                    <div style={{ background: "#1E293B", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ color: "#94A3B8" }}>On-Time Collections</span>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>98.2%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#94A3B8" }}>Pending Due</span>
                        <span style={{ color: "#F59E0B", fontWeight: 700 }}>₹42,000 (3 Tenants)</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#334155", color: "#E2E8F0", border: "none", fontWeight: 600, cursor: "pointer" }}>
                      Send 1-Click WhatsApp Reminders
                    </button>
                  </div>

                  <div className="appPreviewCard">
                    <div className="cardHeaderTitle">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#A855F7" }}>GATEWAY LOSS SAVINGS</span>
                      <span style={{ fontSize: "11px", background: "rgba(168, 85, 247, 0.2)", color: "#C084FC", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        0% DEDUCTION
                      </span>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#10B981", marginBottom: "6px" }}>+₹58,528 Saved</div>
                    <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>Net profit preserved this month vs. traditional 2.36% gateways</p>
                    <div style={{ background: "#1E293B", borderRadius: "10px", padding: "12px", marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>
                        <span>Other Gateways Fee</span>
                        <span style={{ color: "#EF4444" }}>- ₹58,528.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94A3B8" }}>
                        <span>OneStay360 Net Settled</span>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>100% Full Payout</span>
                      </div>
                    </div>
                    <button style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "linear-gradient(135deg, #0D9488, #06B6D4)", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
                      View Bank Settlement Ledger
                    </button>
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
              <div className="statLabel">Verified Beds Under Management</div>
            </div>
            <div>
              <div className="statNumber">₹45 Cr+</div>
              <div className="statLabel">Annual Rent Processed</div>
            </div>
            <div>
              <div className="statNumber">99.4%</div>
              <div className="statLabel">On-Time Rent Collection Rate</div>
            </div>
            <div>
              <div className="statNumber">0%</div>
              <div className="statLabel">Hidden Gateway Surcharge on UPI</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Dual Persona Value Proposition ================= */}
      <section className="featuresSection" id="dual-solution">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">Engineered for Excellence</span>
            <h2 className="sectionTitle">A Tailored Experience for Both Sides</h2>
            <p className="sectionSubtitle">
              Whether you are a tenant looking for a comfortable home away from home, or a PG owner managing 300+ beds, 
              OneStay360 delivers seamless, automated operations.
            </p>
          </div>

          <div className="featureTabsNav">
            <button
              className={`featureTabItem ${activePersona === "tenants" ? "featureTabItemActive" : ""}`}
              onClick={() => setActivePersona("tenants")}
            >
              <Smartphone size={18} /> For Tenants &amp; Guests
            </button>
            <button
              className={`featureTabItem ${activePersona === "owners" ? "featureTabItemActive" : ""}`}
              onClick={() => setActivePersona("owners")}
            >
              <Building2 size={18} /> For PG Owners &amp; Landlords
            </button>
          </div>

          <div className="featureCardsGrid">
            {activePersona === "tenants" ? (
              <>
                <div className="featureCard">
                  <div className="featureIconBox">
                    <Camera size={26} />
                  </div>
                  <h3 className="featureCardTitle">360° Virtual Room Tours</h3>
                  <p className="featureCardDesc">
                    Explore high-definition 360-degree panoramic room views, washroom hygiene, and common spaces before visiting in person. Zero surprises.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <Coins size={26} />
                  </div>
                  <h3 className="featureCardTitle">0% Fee UPI Rent Payments</h3>
                  <p className="featureCardDesc">
                    Pay rent directly via Google Pay, PhonePe, or Paytm with zero gateway surcharge. No hidden platform markup on your hard-earned money.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <FileCheck2 size={26} />
                  </div>
                  <h3 className="featureCardTitle">Instant HRA Rent Receipts</h3>
                  <p className="featureCardDesc">
                    Download authentic, signed digital rent receipts with landlord PAN directly from the app for smooth corporate HRA tax exemption claims.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <UtensilsCrossed size={26} />
                  </div>
                  <h3 className="featureCardTitle">Daily Food Menu &amp; Attendance</h3>
                  <p className="featureCardDesc">
                    View daily breakfast, lunch, and dinner menus. Mark meal skips in advance so kitchens avoid food wastage and provide fresher meals.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <Wrench size={26} />
                  </div>
                  <h3 className="featureCardTitle">1-Tap Maintenance Tickets</h3>
                  <p className="featureCardDesc">
                    Wi-Fi down or plumbing issue? Raise a photo-verified maintenance request and track resolution progress in real time with timestamped status.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <ShieldCheck size={26} />
                  </div>
                  <h3 className="featureCardTitle">Digital KYC &amp; Instant Move-In</h3>
                  <p className="featureCardDesc">
                    Complete paperless Aadhaar/Govt ID verification and sign digital rental agreements in under 3 minutes directly from your smartphone.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="featureCard">
                  <div className="featureIconBox">
                    <TrendingUp size={26} />
                  </div>
                  <h3 className="featureCardTitle">Zero-Loss Direct Settlements</h3>
                  <p className="featureCardDesc">
                    Eliminate 2% to 2.36% gateway cuts. Direct bank routing ensures you receive 100% of your net rent money directly into your business account.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <BellRing size={26} />
                  </div>
                  <h3 className="featureCardTitle">Auto WhatsApp &amp; SMS Reminders</h3>
                  <p className="featureCardDesc">
                    Never chase tenants again. Gentle, automated payment reminders with secure 1-tap payment links are dispatched on scheduled billing dates.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <Building2 size={26} />
                  </div>
                  <h3 className="featureCardTitle">Real-Time Bed Matrix</h3>
                  <p className="featureCardDesc">
                    Visual grid of floors, rooms, and individual bed occupancy. Instantly know which beds are vacant, reserved, or upcoming for renewal.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <Zap size={26} />
                  </div>
                  <h3 className="featureCardTitle">Automated Sub-Meter Electricity</h3>
                  <p className="featureCardDesc">
                    Log initial and final unit readings or connect smart meters. The app automatically calculates per-tenant power shares and adds them to monthly rent.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <Users size={26} />
                  </div>
                  <h3 className="featureCardTitle">Multi-Property Staff Roles</h3>
                  <p className="featureCardDesc">
                    Assign role-based access for wardens, gate security, accountants, and cleaning staff with strict permission controls across all your branches.
                  </p>
                </div>

                <div className="featureCard">
                  <div className="featureIconBox">
                    <FileCheck2 size={26} />
                  </div>
                  <h3 className="featureCardTitle">Police Verification &amp; KYC Vault</h3>
                  <p className="featureCardDesc">
                    Compliant digital archive of tenant government IDs, emergency contacts, college/work proof, and downloadable police verification packets.
                  </p>
                </div>
              </>
            )}
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
                <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", marginBottom: "14px" }}>
                  How Much Are Payment Gateways Costing Your PG?
                </h2>
                <p style={{ fontSize: "15px", color: "#94A3B8", lineHeight: 1.6, marginBottom: "24px" }}>
                  Traditional gateways (Razorpay, PayU, Cashfree standard) charge <strong>2.0% + 18% GST (2.36%)</strong> on rental collections. 
                  Slide to see how much profit OneStay360 saves you every year.
                </p>

                <div className="sliderContainer">
                  <div className="sliderLabelRow">
                    <span style={{ fontSize: "14px", color: "#94A3B8" }}>Your Monthly Rent Collection:</span>
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B", marginTop: "8px" }}>
                    <span>₹2 Lakhs / mo</span>
                    <span>₹25 Lakhs / mo</span>
                    <span>₹50 Lakhs / mo</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "#0F172A", padding: "16px", borderRadius: "12px", border: "1px solid #334155" }}>
                    <div style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>Standard Gateway Cut (2.36%)</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#EF4444", marginTop: "4px" }}>
                      - ₹{standardGatewayLoss.toLocaleString("en-IN")}/mo
                    </div>
                  </div>
                  <div style={{ background: "#0F172A", padding: "16px", borderRadius: "12px", border: "1px solid #0D9488" }}>
                    <div style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>OneStay360 Smart Routing</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>
                      ₹0 Gateway Cut
                    </div>
                  </div>
                </div>
              </div>

              <div className="calcResultBox">
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: "1px" }}>
                  TOTAL ANNUAL PROFIT PRESERVED
                </span>
                <div className="calcAnnualSaved">
                  ₹{annualSaved.toLocaleString("en-IN")}
                </div>
                <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "20px" }}>
                  Direct into your bank account every year instead of vanishing into gateway commissions.
                </p>
                <a href="#downloads" className="btnPrimary" style={{ width: "100%", justifyContent: "center" }}>
                  Protect Your Revenue with OneStay360
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= App Download Section ================= */}
      <section className="downloadSection" id="downloads">
        <div className="landingContainer">
          <div className="sectionHeader">
            <span className="sectionTag">Get Started Today</span>
            <h2 className="sectionTitle">Available on Android &amp; iOS</h2>
            <p className="sectionSubtitle">
              Download the app designed specifically for your role. Quick setup, intuitive interfaces, and instant access.
            </p>
          </div>

          <div className="downloadGrid">
            {/* Tenant App Card */}
            <div className="downloadCard downloadCardTenant">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(13, 148, 136, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2DD4BF" }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>OneStay360 for Tenants</h3>
                    <span style={{ fontSize: "12px", color: "#2DD4BF", fontWeight: 600 }}>Living Experience App</span>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.6, marginBottom: "24px" }}>
                  Search verified PGs, take 360° virtual tours, pay rent with 0% extra fee on UPI, check meals, and raise instant maintenance requests.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#0F172A", padding: "16px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "16px" }}>
                  <QrCode size={48} color="#2DD4BF" />
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    <strong style={{ color: "#FFF", display: "block", marginBottom: "2px" }}>Scan to Install on Mobile</strong>
                    Point your camera to download directly from Play Store
                  </div>
                </div>
                <a href="#" className="btnPrimary" style={{ width: "100%", justifyContent: "center" }}>
                  <Download size={16} /> Download Tenant App (APK / Store)
                </a>
              </div>
            </div>

            {/* Business App Card */}
            <div className="downloadCard downloadCardOwner">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(6, 182, 212, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>OneStay360 Business</h3>
                    <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600 }}>PG &amp; Hostel Owner OS</span>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#94A3B8", lineHeight: 1.6, marginBottom: "24px" }}>
                  Manage bed inventory, automate WhatsApp payment reminders, track zero-loss rent settlements, and manage staff across all properties.
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#0F172A", padding: "16px", borderRadius: "12px", border: "1px solid #334155", marginBottom: "16px" }}>
                  <QrCode size={48} color="#38BDF8" />
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    <strong style={{ color: "#FFF", display: "block", marginBottom: "2px" }}>Scan for PG Management App</strong>
                    Available on Android &amp; Web Desktop
                  </div>
                </div>
                <a href="#" className="btnSecondary" style={{ width: "100%", justifyContent: "center", borderColor: "#06B6D4", color: "#38BDF8" }}>
                  <Building2 size={16} /> Register Your PG / Hostel
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
              Everything you need to know about the product, payments, and onboarding.
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
                      color="#94A3B8"
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

      {/* ================= Footer ================= */}
      <footer className="landingFooter">
        <div className="landingContainer">
          <div className="footerGrid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div className="logoIconBox" style={{ width: "36px", height: "36px" }}>
                  <Building2 size={20} color="#FFFFFF" />
                </div>
                <span className="logoText" style={{ fontSize: "18px" }}>OneStay360</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#64748B", marginBottom: "20px", maxWidth: "320px" }}>
                India&apos;s premier smart co-living and PG management operating system. Zero brokerage, zero payment cuts, 100% digital living.
              </p>
              <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                <div>Support: <a href="mailto:support@onestay360.com" style={{ color: "#2DD4BF", textDecoration: "none" }}>support@onestay360.com</a></div>
                <div style={{ marginTop: "4px" }}>Helpline: <span style={{ color: "#F8FAFC" }}>+91 9359303097</span></div>
              </div>
            </div>

            <div>
              <h4 className="footerColTitle">For Tenants</h4>
              <ul className="footerLinks">
                <li><a href="#dual-solution">Explore Verified PGs</a></li>
                <li><a href="#dual-solution">360° Virtual Tours</a></li>
                <li><a href="#dual-solution">0% Fee UPI Rent</a></li>
                <li><a href="#dual-solution">HRA Receipts</a></li>
                <li><a href="#downloads">Download App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footerColTitle">For PG Owners</h4>
              <ul className="footerLinks">
                <li><a href="#savings-calculator">Zero-Loss Collections</a></li>
                <li><a href="#dual-solution">Bed Inventory Matrix</a></li>
                <li><a href="#dual-solution">WhatsApp Reminders</a></li>
                <li><a href="#savings-calculator">Savings Calculator</a></li>
                <li><a href="#downloads">Register Property</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footerColTitle">Platform &amp; Administration</h4>
              <ul className="footerLinks">
                <li>
                  <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2DD4BF" }}>
                    SuperAdmin Console <ExternalLink size={14} />
                  </Link>
                </li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms &amp; Conditions</a></li>
                <li><a href="#">Security &amp; Compliance</a></li>
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
