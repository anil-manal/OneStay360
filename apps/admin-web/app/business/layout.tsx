"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  Receipt,
  Users2,
  Phone,
  ShieldCheck,
  ChevronDown,
  Bell,
  LogOut,
  ExternalLink,
  Plus,
} from "lucide-react";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedBusiness, setSelectedBusiness] = useState({
    id: "BIZ_001",
    name: "Zolo Living Properties",
    tier: "Pro Host &bull; 8 PGs",
  });

  const navItems = [
    { label: "Operations Pulse", href: "/business", icon: LayoutDashboard, exact: true },
    { label: "Properties & Inventory", href: "/business/properties", icon: Building2 },
    { label: "Billing & Submeters", href: "/business/billing", icon: Receipt },
    { label: "Staff & Wardens", href: "/business/staff", icon: Users2 },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "var(--font-sans)" }}>
      {/* Landlord Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          zIndex: 50,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#059669",
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
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>OneStay360</div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", letterSpacing: "0.5px" }}>PARTNER WORKSPACE</span>
            </div>
          </div>

          {/* Chain Switcher Dropdown */}
          <div
            style={{
              background: "#F1F5F9",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{selectedBusiness.name}</div>
              <div style={{ fontSize: "10px", color: "#64748B" }}>ID: {selectedBusiness.id}</div>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: "20px 14px", display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#059669" : "#475569",
                  background: isActive ? "rgba(5, 150, 105, 0.08)" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={18} color={isActive ? "#059669" : "#64748B"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Links Footer */}
        <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            href="/tenant/passport"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "var(--teal-primary)",
              textDecoration: "none",
              fontWeight: 700,
              padding: "6px 8px",
              borderRadius: "6px",
              background: "rgba(13, 148, 136, 0.06)",
            }}
          >
            <ShieldCheck size={14} /> Resident Passport Test
          </Link>
          <div style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center" }}>
            partner.onestay360.in &bull; v2.1.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ marginLeft: "260px", flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top Navbar */}
        <header
          style={{
            height: "64px",
            background: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            padding: "0 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#64748B" }}>Active Business:</span>
            <strong style={{ fontSize: "14px", color: "#0F172A" }}>{selectedBusiness.name}</strong>
            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "#ECFDF5", color: "#059669", fontWeight: 700 }}>
              KYC Verified
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/business/property/PROP_AMD_032"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#059669",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Grid3X3 size={14} /> Open Interactive Bed Matrix
            </Link>

            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#0F172A",
                fontSize: "13px",
              }}
            >
              ZL
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main style={{ padding: "32px", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
