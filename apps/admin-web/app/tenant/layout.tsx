"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Home,
  Compass,
  ShieldCheck,
  Receipt,
  LogOut,
  User,
  Building2,
  ChevronRight,
  Bell,
  Sparkles,
} from "lucide-react";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();

  // If on login page, render children directly without navbar
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const displayName =
    userProfile?.displayName || user?.displayName || user?.phoneNumber || user?.email?.split("@")[0] || "Resident";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { label: "My Stay", href: "/tenant", icon: Home, exact: true },
    { label: "Explore & Book PGs", href: "/tenant/explore", icon: Compass },
    { label: "Resident Passport & KYC", href: "/tenant/passport", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await logout();
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isSubdomain = hostname.startsWith("app.") || hostname.startsWith("my.") || hostname.startsWith("tenant.");
    router.push(isSubdomain ? "/login" : "/tenant/login");
  };

  return (
    <AuthGuard requiredPortal="tenant">
      <div
        style={{
          minHeight: "100vh",
          background: "#F8FAFC",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Floating Glassmorphic Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 24px",
              height: "68px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Brand Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              <Link href="/tenant" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "18px",
                    boxShadow: "0 2px 6px rgba(13, 148, 136, 0.25)",
                  }}
                >
                  O
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: "#0F172A", lineHeight: 1.1, letterSpacing: "-0.3px" }}>
                    OneStay<span style={{ color: "#0D9488" }}>360</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#0D9488", letterSpacing: "0.5px" }}>
                    RESIDENT EXPERIENCE
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                        background: isActive ? "#F0FDFA" : "transparent",
                        color: isActive ? "#0D9488" : "#475569",
                        border: isActive ? "1px solid #CCFBF1" : "1px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={16} color={isActive ? "#0D9488" : "#64748B"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right User Capsule */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#F1F5F9",
                  padding: "6px 14px 6px 8px",
                  borderRadius: "999px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#0D9488",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {initials || "R"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                    {displayName}
                  </span>
                  <span style={{ fontSize: "10px", color: "#64748B" }}>
                    Verified Resident
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "28px 20px" }}>{children}</div>
      </div>
    </AuthGuard>
  );
}
