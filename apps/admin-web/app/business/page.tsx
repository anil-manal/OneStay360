"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Bed,
  TrendingUp,
  Receipt,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Zap,
  MapPin,
  QrCode,
  ShieldCheck,
  Search,
} from "lucide-react";

interface LandlordPropertySummary {
  id: string;
  name: string;
  city: string;
  address: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  monthlyGmv: number;
  pendingMeterReadings: number;
  pendingCheckIns: number;
  complianceOk: boolean;
}

const DEFAULT_LANDLORD_PROPERTIES: LandlordPropertySummary[] = [
  {
    id: "PROP_AMD_032",
    name: "Zolo CyberPark Premier Residency",
    city: "Ahmedabad",
    address: "Plot 42, SG Highway, Bodakdev",
    totalRooms: 12,
    totalBeds: 36,
    occupiedBeds: 31,
    monthlyGmv: 279000,
    pendingMeterReadings: 2,
    pendingCheckIns: 1,
    complianceOk: true,
  },
  {
    id: "PROP_PNQ_104",
    name: "Zolo TechZone Luxury Stays",
    city: "Pune",
    address: "Phase 1, Hinjewadi IT Park",
    totalRooms: 18,
    totalBeds: 54,
    occupiedBeds: 49,
    monthlyGmv: 441000,
    pendingMeterReadings: 0,
    pendingCheckIns: 2,
    complianceOk: true,
  },
  {
    id: "PROP_BLR_208",
    name: "Zolo Nexus Hive Co-Living",
    city: "Bangalore",
    address: "Green Glen Layout, Bellandur",
    totalRooms: 24,
    totalBeds: 72,
    occupiedBeds: 68,
    monthlyGmv: 680000,
    pendingMeterReadings: 3,
    pendingCheckIns: 0,
    complianceOk: true,
  },
  {
    id: "PROP_HYD_315",
    name: "Zolo Silicon Heights",
    city: "Hyderabad",
    address: "Financial District, Gachibowli",
    totalRooms: 26,
    totalBeds: 78,
    occupiedBeds: 63,
    monthlyGmv: 598500,
    pendingMeterReadings: 1,
    pendingCheckIns: 1,
    complianceOk: true,
  },
];

export default function BusinessDashboardPage() {
  const [properties, setProperties] = useState<LandlordPropertySummary[]>(DEFAULT_LANDLORD_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState("");

  const totalBeds = properties.reduce((sum, p) => sum + p.totalBeds, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupiedBeds, 0);
  const occupancyPercent = Math.round((totalOccupied / totalBeds) * 100);
  const totalMonthlyGmv = properties.reduce((sum, p) => sum + p.monthlyGmv, 0);
  const totalPendingMeters = properties.reduce((sum, p) => sum + p.pendingMeterReadings, 0);

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner & Welcome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
              PG Chain Live Operations
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", margin: 0 }}>
            Landlord Operations Pulse
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
            Real-time occupancy, automated rent realizations, submeter utilities, and tenant onboarding across your properties.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/business/properties"
            className="btnPrimary"
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              background: "#059669",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={16} /> Add New Property
          </Link>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Occupancy Rate</span>
            <Bed size={18} color="#059669" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", marginTop: "8px" }}>
            {occupancyPercent}%
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            <strong>{totalOccupied}</strong> of {totalBeds} total beds filled
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Monthly Realization</span>
            <TrendingUp size={18} color="var(--teal-primary)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--teal-primary)", marginTop: "8px" }}>
            ₹{(totalMonthlyGmv / 100000).toFixed(1)} Lakhs
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            Auto-collected via Cashfree UPI &bull; T+1 Payout
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Submeter Readings Due</span>
            <Zap size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#D97706", marginTop: "8px" }}>
            {totalPendingMeters} Rooms
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Pending monthly electric unit log
          </div>
        </div>

        <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "14px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Active Properties</span>
            <Building2 size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#6366F1", marginTop: "8px" }}>
            {properties.length} Branches
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Operating across 4 Indian cities
          </div>
        </div>
      </div>

      {/* TODAY'S OPERATIONAL ACTIONS & ARRIVALS */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Left: Pending Actions Feed */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
              Immediate Operations Feed
            </h3>
            <span style={{ fontSize: "12px", color: "#64748B" }}>3 Actions Pending Today</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", color: "#0F172A" }}>New Resident Check-in: Rohan Verma</strong>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Room 102 &bull; Bed B1 &bull; Verified OneStay360 Passport Presented
                  </div>
                </div>
              </div>
              <Link
                href="/business/property/PROP_AMD_032"
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: "#059669",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Instant Check-in &rarr;
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                  <Zap size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", color: "#0F172A" }}>Log Submeter Units (Floor 2, SG Highway PG)</strong>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Rooms 201, 202, 203 require current meter dial readings
                  </div>
                </div>
              </div>
              <Link
                href="/business/property/PROP_AMD_032?tab=submeter"
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Log Readings &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Universal Passport QR Scanner Box */}
        <div style={{ background: "linear-gradient(135deg, #065F46 0%, #047857 100%)", borderRadius: "16px", padding: "24px", color: "#FFFFFF", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <QrCode size={20} />
              <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                1-Click Check-In
              </span>
            </div>
            <h4 style={{ fontSize: "18px", fontWeight: 900, margin: "0 0 8px 0" }}>
              Scan Tenant Resident Passport
            </h4>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>
              Incoming guests who already completed KYC on OneStay360 can be checked in instantly. No paperwork or manual Form 29 typing required.
            </p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <Link
              href="/business/property/PROP_AMD_032"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px",
                borderRadius: "8px",
                background: "#FFFFFF",
                color: "#065F46",
                fontWeight: 800,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              Open Bed Allocation Scanner &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* PROPERTIES PORTFOLIO TABLE */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
              Your Properties &amp; Branches ({properties.length})
            </h3>
            <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
              Click any property to open the Interactive Bed Matrix, adjust dynamic sharing prices, or record submeters.
            </p>
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
            <input
              type="text"
              placeholder="Search branch name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        <div className="tableWrapper">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Property Branch</th>
                <th>City &bull; Location</th>
                <th>Occupancy (Beds)</th>
                <th>Monthly Collection</th>
                <th>Pending Tasks</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => {
                const occRate = Math.round((p.occupiedBeds / p.totalBeds) * 100);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link
                        href={`/business/property/${p.id}`}
                        style={{ fontWeight: 800, color: "#0F172A", textDecoration: "none" }}
                        className="hoverUnderline"
                      >
                        {p.name} &rarr;
                      </Link>
                      <span className="subtext" style={{ display: "block" }}>
                        ID: {p.id} &bull; {p.totalRooms} Rooms
                      </span>
                    </td>

                    <td>
                      <strong>{p.city}</strong>
                      <span className="subtext" style={{ display: "block" }}>{p.address}</span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong>{occRate}%</strong>
                        <span style={{ fontSize: "12px", color: "#64748B" }}>
                          ({p.occupiedBeds}/{p.totalBeds} Beds)
                        </span>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: "#059669" }}>₹{p.monthlyGmv.toLocaleString("en-IN")}</strong>
                      <span className="subtext" style={{ display: "block" }}>Cashfree AutoCollect</span>
                    </td>

                    <td>
                      {p.pendingMeterReadings > 0 ? (
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "#FEF3C7", color: "#D97706", fontWeight: 700 }}>
                          {p.pendingMeterReadings} Meters Due
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "#ECFDF5", color: "#059669", fontWeight: 700 }}>
                          All Tasks Clear
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/business/property/${p.id}`}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          background: "#059669",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Manage Property &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
