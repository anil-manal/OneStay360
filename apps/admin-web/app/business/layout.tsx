"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";
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
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();

  // If on login page, render children directly without dashboard chrome
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const businessName = userProfile?.businessName || "OneStay";
  const businessId = userProfile?.businessId || "BUS0000001";
  const userRole = userProfile?.role || "HOST";
  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "PG Host";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { label: "Operations Pulse", href: "/business", icon: LayoutDashboard, exact: true },
    { label: "Properties & Inventory", href: "/business/properties", icon: Building2 },
    { label: "Billing & Submeters", href: "/business/billing", icon: Receipt },
    { label: "Staff & Wardens", href: "/business/staff", icon: Users2 },
  ];

  const handleLogout = async () => {
    await logout();
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isSubdomain = hostname.startsWith("partner.") || hostname.startsWith("business.");
    router.push(isSubdomain ? "/login" : "/business/login");
  };

  return (
    <AuthGuard requiredPortal="business">
      <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
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
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{businessName}</div>
                <div style={{ fontSize: "10px", color: "#64748B" }}>ID: {businessId}</div>
              </div>
              <span style={{ fontSize: "10px", background: "#ECFDF5", color: "#059669", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                {userRole}
              </span>
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
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    background: isActive ? "#ECFDF5" : "transparent",
                    color: isActive ? "#059669" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={18} color={isActive ? "#059669" : "#64748B"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer User Info & Logout */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #E2E8F0", background: "#F8FAFC" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "#059669",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {initials || "HO"}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>{displayName}</div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{user?.email || user?.phoneNumber || "Partner"}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={16} />
              </button>
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
              <strong style={{ fontSize: "14px", color: "#0F172A" }}>{businessName}</strong>
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

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </header>

          {/* Page Children Container */}
          <main style={{ padding: "32px", flex: 1 }}>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
