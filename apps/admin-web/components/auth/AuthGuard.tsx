"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User as UserIcon, Shield, Building2, ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPortal: "business" | "tenant" | "admin";
}

export default function AuthGuard({ children, requiredPortal }: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Determine destination login path
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const isSubdomain =
        hostname.startsWith("partner.") ||
        hostname.startsWith("business.") ||
        hostname.startsWith("app.") ||
        hostname.startsWith("admin.");

      let targetLogin = `/${requiredPortal}/login`;
      if (isSubdomain) {
        targetLogin = "/login";
      }

      router.push(targetLogin);
    }
  }, [user, loading, requiredPortal, router]);

  if (loading) {
    const themeColor =
      requiredPortal === "business"
        ? "#059669"
        : requiredPortal === "admin"
        ? "#0F172A"
        : "#0D9488";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#F8FAFC",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: `3px solid #E2E8F0`,
            borderTop: `3px solid ${themeColor}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "16px",
          }}
        />
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>
          Authenticating {requiredPortal.toUpperCase()} Session...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}

export function UserProfileHeaderPill() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName =
    userProfile?.displayName || user.displayName || user.email?.split("@")[0] || user.phoneNumber || "Verified User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#F1F5F9",
        padding: "6px 12px",
        borderRadius: "999px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#059669",
          color: "#FFFFFF",
          fontSize: "11px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {initials}
      </div>
      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
          {displayName}
        </span>
        <span style={{ fontSize: "10px", color: "#64748B" }}>
          {userProfile?.role || userProfile?.userType?.toUpperCase() || "AUTHENTICATED"}
        </span>
      </div>
      <button
        onClick={handleLogout}
        title="Sign Out"
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "4px",
          color: "#94A3B8",
          display: "flex",
          alignItems: "center",
        }}
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
