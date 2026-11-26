"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessProperties, PropertyData } from "@/lib/data-service";
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
  RefreshCw,
} from "lucide-react";

export default function BusinessDashboardPage() {
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";
  const businessName = userProfile?.businessName || "OneStay";

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchBusinessProperties(businessId);
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const totalBeds = properties.reduce((sum, p) => sum + p.totalBeds, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupiedBeds, 0);
  const occupancyPercent = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
  const totalMonthlyGmv = properties.reduce((sum, p) => sum + (p.monthlyGmv || 0), 0);
  const totalPendingMeters = properties.reduce((sum, p) => sum + (p.pendingMeterReadings || 0), 0);

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#059669",
                background: "#ECFDF5",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              LIVE OPERATING PULSE
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Active Chain: <strong>{businessName}</strong> ({businessId})
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", margin: 0 }}>
            Landlord Operations Pulse
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Real-time occupancy, rent realization, submeter units, and resident police verification compliance.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={loadData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              background: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Data
          </button>
          <Link
            href="/business/tenants"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#0F172A",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <Users size={16} /> Tenants & Check-in
          </Link>
          <Link
            href="/business/properties"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#059669",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(5,150,105,0.2)",
            }}
          >
            <Plus size={16} /> Add / Manage Properties
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Network Bed Occupancy
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {occupancyPercent}%
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            {totalOccupied} of {totalBeds} Beds Occupied
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Monthly Realized GMV
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#059669", marginTop: "6px" }}>
            ₹{totalMonthlyGmv.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            From active resident tariffs
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Available Vacant Beds
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#2563EB", marginTop: "6px" }}>
            {totalBeds - totalOccupied}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Ready for instant booking</div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Total PG Branches
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {properties.length}
          </div>
          <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "4px" }}>
            Registered in OneStay360
          </div>
        </div>
      </div>

      {/* Property Roster Section */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Live Properties in Your Chain
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
              Select a property branch to open its interactive Bed Matrix Console.
            </p>
          </div>
        </div>

        {loading && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#64748B" }}>
            Loading properties from Firestore...
          </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#64748B", fontSize: "14px" }}>No properties registered yet.</p>
            <Link
              href="/business/properties"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "8px 16px",
                background: "#059669",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              Add First Property
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "16px" }}>
          {filteredProperties.map((prop) => {
            const occ = prop.totalBeds > 0 ? Math.round((prop.occupiedBeds / prop.totalBeds) * 100) : 0;
            return (
              <div
                key={prop.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#059669",
                          background: "#ECFDF5",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {prop.id}
                      </span>
                      <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", margin: "6px 0 2px 0" }}>
                        {prop.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} color="#94A3B8" /> {prop.address}, {prop.city}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>
                        Occupancy: {prop.occupiedBeds} / {prop.totalBeds} Beds
                      </span>
                      <span style={{ fontWeight: 800, color: "#059669" }}>{occ}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${occ}%`,
                          height: "100%",
                          background: occ > 80 ? "#059669" : "#2563EB",
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #F1F5F9", paddingTop: "14px" }}>
                  <Link
                    href={`/business/property/${prop.id}`}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      background: "#059669",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "12px",
                      textDecoration: "none",
                    }}
                  >
                    <Bed size={14} /> Open Bed Matrix
                  </Link>
                  <Link
                    href={`/business/billing`}
                    style={{
                      padding: "8px 14px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Billing
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
