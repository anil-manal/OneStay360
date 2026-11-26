"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchBusinessTenants,
  fetchBusinessProperties,
  LiveTenantRecord,
  PropertyData,
} from "@/lib/data-service";
import AddTenantModal from "@/components/tenants/AddTenantModal";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  Bed,
  FileText,
} from "lucide-react";

export default function BusinessTenantsPage() {
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";
  const businessName = userProfile?.businessName || "OneStay";

  const [tenants, setTenants] = useState<LiveTenantRecord[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, propsData] = await Promise.all([
        fetchBusinessTenants(businessId),
        fetchBusinessProperties(businessId),
      ]);
      setTenants(tenantsData);
      setProperties(propsData);
    } catch (err) {
      console.error("Error loading tenants page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;
  const totalMonthlyRent = tenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0);
  const kycVerifiedCount = tenants.filter((t) => t.idNumber && t.idNumber.length > 4).length;

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.roomNumber && t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProp =
      selectedPropertyFilter === "all" || t.propertyId === selectedPropertyFilter;
    const matchesStatus =
      selectedStatusFilter === "all" || t.status === selectedStatusFilter;
    return matchesSearch && matchesProp && matchesStatus;
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header */}
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
              RESIDENT MANAGEMENT
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Active Chain: <strong>{businessName}</strong> ({businessId})
            </span>
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.5px",
              margin: 0,
            }}
          >
            Tenants & Resident Directory
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Real-time resident rosters, bed assignments, KYC documentation, and lease management.
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
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(5,150,105,0.2)",
            }}
          >
            <Plus size={16} /> Add Tenant / Check-in
          </button>
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
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Active Residents
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {activeTenantsCount}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            Registered in Network
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Monthly Rent Run-rate
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#059669", marginTop: "6px" }}>
            ₹{totalMonthlyRent.toLocaleString()}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Committed Monthly Rent
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Police KYC Compliance
          </div>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {kycVerifiedCount} of {tenants.length || 1}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            Govt ID / Aadhaar on file
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by resident name, phone, room, or TEN-ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              fontSize: "13px",
              outline: "none",
              background: "#FFFFFF",
            }}
          />
        </div>

        <select
          value={selectedPropertyFilter}
          onChange={(e) => setSelectedPropertyFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1px solid #CBD5E1",
            borderRadius: "10px",
            fontSize: "13px",
            background: "#FFFFFF",
            color: "#334155",
            fontWeight: 600,
          }}
        >
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1px solid #CBD5E1",
            borderRadius: "10px",
            fontSize: "13px",
            background: "#FFFFFF",
            color: "#334155",
            fontWeight: 600,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="notice">Notice Period</option>
          <option value="vacated">Vacated</option>
        </select>
      </div>

      {/* Tenants Table */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
          Loading live tenants from Firestore...
        </div>
      ) : filteredTenants.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
          }}
        >
          <Users size={48} color="#94A3B8" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
            No Residents Found
          </h3>
          <p style={{ fontSize: "13px", color: "#64748B", maxWidth: "420px", margin: "0 auto 20px auto" }}>
            {searchQuery
              ? "No tenants matched your search criteria. Try a different query."
              : "No residents are enrolled in this property network yet. Click below to add a tenant with instant room & bed allocation."}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: "10px 20px",
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
            Add First Tenant
          </button>
        </div>
      ) : (
        <div style={{ background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Resident & ID</th>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Property & Bed</th>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Contact Info</th>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Move-in Date</th>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Monthly Rent</th>
                <th style={{ padding: "14px 18px", textAlign: "left", color: "#475569", fontWeight: 700 }}>KYC Status</th>
                <th style={{ padding: "14px 18px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t, idx) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: idx < filteredTenants.length - 1 ? "1px solid #F1F5F9" : "none",
                  }}
                >
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 800, color: "#0F172A" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>{t.tenantId}</div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: "#334155" }}>{t.propertyName || "PG Property"}</div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>
                      Room {t.roomNumber || t.roomId} • Bed {t.bedId}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ color: "#0F172A", fontWeight: 600 }}>{t.phone || "Not Provided"}</div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>{t.email || "No email"}</div>
                  </td>
                  <td style={{ padding: "14px 18px", color: "#475569" }}>
                    {typeof t.checkInDate === "string"
                      ? t.checkInDate
                      : t.checkInDate?.toDate
                      ? t.checkInDate.toDate().toLocaleDateString()
                      : "Active"}
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0F172A" }}>
                    ₹{t.monthlyRent.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {t.idNumber ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", background: "#ECFDF5", color: "#059669", fontSize: "11px", fontWeight: 700 }}>
                        <CheckCircle2 size={12} /> {t.idType || "Aadhaar"}: {t.idNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
                        Not Provided
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        background: t.status === "active" ? "#ECFDF5" : "#FEF3C7",
                        color: t.status === "active" ? "#059669" : "#D97706",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1:1 Complete Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        businessId={businessId}
        properties={properties}
      />
    </div>
  );
}
