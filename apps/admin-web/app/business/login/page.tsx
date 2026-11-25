"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function BusinessLoginPage() {
  const router = useRouter();
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    sendPhoneOtp,
    confirmPhoneOtp,
    authError,
    setAuthError,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<"phone" | "google" | "email">("phone");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Phone OTP form
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  const getRedirectPath = () => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    return hostname.startsWith("partner.") || hostname.startsWith("business.") ? "/" : "/business";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, displayName || "PG Host", "business");
      } else {
        await loginWithEmail(email, password);
      }
      router.push(getRedirectPath());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle("business");
      router.push(getRedirectPath());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const result = await sendPhoneOtp(phone, "recaptcha-container");
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode) return;
    setLoading(true);
    setAuthError(null);
    try {
      await confirmPhoneOtp(confirmationResult, otpCode, "business");
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
        background: "#F8FAFC",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        padding: "20px",
      }}
    >
      <div id="recaptcha-container"></div>

      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          overflow: "hidden",
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            padding: "28px 24px",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(6px)",
              margin: "0 auto 12px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={26} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            OneStay360 Partner OS
          </h2>
          <p style={{ fontSize: "13px", color: "#D1FAE5", margin: "4px 0 0 0" }}>
            Landlord, Warden & Property Operating System
          </p>
        </div>

        <div style={{ padding: "28px 24px" }}>
          {authError && (
            <div
              style={{
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "#991B1B",
                marginBottom: "18px",
              }}
            >
              {authError}
            </div>
          )}

          {/* Auth Method Switcher */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => {
                setAuthMethod("phone");
                setAuthError(null);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                background: authMethod === "phone" ? "#FFFFFF" : "transparent",
                color: authMethod === "phone" ? "#0F172A" : "#64748B",
                boxShadow: authMethod === "phone" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
              }}
            >
              Phone OTP
            </button>
            <button
              onClick={() => {
                setAuthMethod("email");
                setAuthError(null);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "none",
                background: authMethod === "email" ? "#FFFFFF" : "transparent",
                color: authMethod === "email" ? "#0F172A" : "#64748B",
                boxShadow: authMethod === "email" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
              }}
            >
              Email & Password
            </button>
          </div>

          {/* Google 1-Click Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              color: "#334155",
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
            Continue with Google
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "18px 0",
              color: "#94A3B8",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span>Or continue with {authMethod === "phone" ? "Mobile" : "Email"}</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          {/* Phone Number OTP Flow */}
          {authMethod === "phone" && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Mobile Number (India +91)
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "#F1F5F9",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#475569",
                      }}
                    >
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
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
                      background: "#059669",
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
                    {loading ? "Sending OTP..." : "Get Verification Code"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div
                    style={{
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "12px",
                      color: "#065F46",
                      marginBottom: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>OTP sent to +91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#059669",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Change
                    </button>
                  </div>

                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Enter 6-Digit SMS OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: 800,
                      letterSpacing: "4px",
                      textAlign: "center",
                      outline: "none",
                      marginBottom: "18px",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#059669",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Email / Password Flow */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailSubmit}>
              {isSignUp && (
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Full Name / Host Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Oberoi"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="landlord@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "13px",
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
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {loading
                  ? "Processing..."
                  : isSignUp
                  ? "Create Landlord Account"
                  : "Sign In as Landlord"}
              </button>

              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#059669",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "New to OneStay360? Register PG Host Account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
