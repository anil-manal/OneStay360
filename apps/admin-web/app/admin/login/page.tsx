"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getRedirectPath = () => {
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
    } catch (err) {
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
    } catch (err) {
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
        background: "#0F172A",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#1E293B",
          borderRadius: "20px",
          border: "1px solid #334155",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "32px 28px 24px", textAlign: "center" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(13, 148, 136, 0.15)",
              border: "1px solid rgba(13, 148, 136, 0.3)",
              margin: "0 auto 16px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2DD4BF",
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
            Super Admin Console
          </h2>
          <p style={{ fontSize: "13px", color: "#94A3B8", margin: "6px 0 0 0" }}>
            OneStay360 Master Governance & Network Control
          </p>
        </div>

        <div style={{ padding: "0 28px 32px" }}>
          {authError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#F87171",
                marginBottom: "18px",
              }}
            >
              {authError}
            </div>
          )}

          <button
            onClick={handleAdminGoogle}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0F172A",
              fontSize: "13px",
              fontWeight: 700,
              color: "#E2E8F0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
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
            Sign in with Authorized Google Workspace
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "18px 0",
              color: "#64748B",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#334155" }} />
            <span>Or Enter Credentials</span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }} />
          </div>

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "6px",
                }}
              >
                Administrator Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@onestay360.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0F172A",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#FFFFFF",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#94A3B8",
                  marginBottom: "6px",
                }}
              >
                Security Key / Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0F172A",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#FFFFFF",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#0D9488",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {loading ? "Authenticating..." : "Authorize Admin Session"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
