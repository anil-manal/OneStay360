"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { loginWithEmail, loginWithGoogle, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getRedirectPath = () => {
    if (returnUrl) {
      return decodeURIComponent(returnUrl);
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    return hostname.startsWith("admin.") ? "/" : "/admin";
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithEmail(email, password);
      router.push(getRedirectPath());
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle("admin");
      router.push(getRedirectPath());
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
          overflow: "hidden",
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            padding: "32px 28px",
            color: "#FFFFFF",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(6px)",
              margin: "0 auto 12px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <ShieldCheck size={26} color="#38BDF8" />
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.8px",
              background: "rgba(56, 189, 248, 0.2)",
              color: "#38BDF8",
              padding: "3px 10px",
              borderRadius: "999px",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            System Governance
          </span>
          <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            Super Admin Console
          </h2>
          <p style={{ fontSize: "13px", color: "#94A3B8", margin: "6px 0 0 0" }}>
            Network Control, Partner Audits & Financial Clearance
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: "32px 28px" }}>
          {authError && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#991B1B",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ShieldAlert size={16} />
              <span>{authError}</span>
            </div>
          )}

          {returnUrl && (
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#1E40AF",
                marginBottom: "20px",
              }}
            >
              Sign in to proceed to <strong>{decodeURIComponent(returnUrl)}</strong>
            </div>
          )}

          {/* Google 1-Click Sign-in */}
          <button
            type="button"
            onClick={handleAdminGoogle}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1E293B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google Workspace
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "20px 0",
              color: "#94A3B8",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span>Or Enter Credentials</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Administrator Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="email"
                  required
                  placeholder="admin@onestay360.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Security Key / Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  color="#94A3B8"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.2)",
              }}
            >
              {loading ? "Authenticating..." : "Authorize Admin Session"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Operator Access */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#F1F5F9",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginBottom: "6px" }}>
              Authorized Workspace Operator:
            </span>
            <button
              type="button"
              onClick={handleAdminGoogle}
              style={{
                border: "none",
                background: "transparent",
                color: "#0F172A",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Continue with Google (anilmanal992115@gmail.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F8FAFC",
            color: "#64748B",
            fontSize: "14px",
          }}
        >
          Loading Admin Security Interface...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
