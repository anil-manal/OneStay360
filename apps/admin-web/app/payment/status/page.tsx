"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("link_id") || searchParams.get("order_id") || "";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "#FFFFFF",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
        border: "1px solid #E2E8F0",
        padding: "40px 32px",
        textAlign: "center"
      }}>
        {/* Success Icon */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "#DCFCE7",
          color: "#16A34A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 0 0 8px #F0FDF4"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#0F172A",
          margin: "0 0 8px"
        }}>
          Payment Successful!
        </h1>

        <p style={{
          fontSize: "15px",
          color: "#64748B",
          lineHeight: "1.5",
          margin: "0 0 24px"
        }}>
          Your payment has been received and verified by <strong>OneStay360</strong>. Your booking reservation and invoice have been updated automatically.
        </p>

        {linkId && (
          <div style={{
            background: "#F8FAFC",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "28px",
            border: "1px solid #E2E8F0",
            fontSize: "13px",
            color: "#475569",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#94A3B8" }}>Reference ID:</span>
            <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#1E293B" }}>{linkId}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <a
            href="onestay360://payment/status"
            style={{
              display: "block",
              background: "#10B981",
              color: "#FFFFFF",
              padding: "14px 24px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
            }}
          >
            Return to OneStay360 App
          </a>

          <Link
            href="/"
            style={{
              display: "block",
              background: "#F1F5F9",
              color: "#334155",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "500",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            Back to Website Home
          </Link>
        </div>

        <div style={{ marginTop: "24px", fontSize: "12px", color: "#94A3B8" }}>
          Verified by Cashfree &bull; Zero Convenience Fee for Tenants
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading payment status...
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
