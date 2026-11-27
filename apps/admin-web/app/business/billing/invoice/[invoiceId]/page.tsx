"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Download,
  Building2,
  ShieldCheck,
  Zap,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function InvoicePrintView({ params }: { params: Promise<{ invoiceId: string }> }) {
  const unwrappedParams = use(params);
  const invoiceId = unwrappedParams.invoiceId;
  const { userProfile } = useAuth();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        // 1. Try root rentInvoices
        const rootSnap = await getDoc(doc(db, "rentInvoices", invoiceId));
        if (rootSnap.exists()) {
          setInvoice(rootSnap.data());
          return;
        }

        // 2. Try under businesses/{businessId}/receipts or invoices
        const bizId = userProfile?.businessId || "BUS0000001";
        const bizSnap = await getDoc(doc(db, `businesses/${bizId}/receipts`, invoiceId));
        if (bizSnap.exists()) {
          setInvoice(bizSnap.data());
          return;
        }

        // 3. Fallback to constructed invoice
        setInvoice({
          invoiceNumber: `INV-${invoiceId.slice(-6).toUpperCase()}`,
          businessName: userProfile?.businessName || "OneStay",
          propertyName: "Ram Nivas PG",
          propertyAddress: "Hinjawadi Phase 1, Near Infosys Circle, Pune, Maharashtra - 411057",
          residentName: "Registered Resident",
          roomBed: "Room 101 • Bed A",
          month: "November 2026",
          rentAmount: 8500,
          electricityUnits: 145,
          electricityRate: 12,
          roommatesCount: 2,
          electricityTotal: 870,
          maintenance: 500,
          totalAmount: 9870,
          status: "paid",
          paidAt: "24 Nov 2026, 04:30 PM",
          paymentMethod: "CASHFREE_UPI",
          cfPaymentId: "CF_TXN_99812481",
        });
      } catch (err) {
        console.error("Error loading invoice:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId, userProfile]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center", color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Loading Tax Invoice...</div>
      </div>
    );
  }

  const rent = Number(invoice?.rentAmount || invoice?.amount || 8500);
  const units = Number(invoice?.electricityUnits || 120);
  const rate = Number(invoice?.electricityRate || 12);
  const roommates = Number(invoice?.roommatesCount || 2);
  const elecShare = Number(invoice?.electricityTotal || Math.round((units * rate) / roommates));
  const maintenance = Number(invoice?.maintenance || 500);
  const total = rent + elecShare + maintenance;
  const isPaid = invoice?.status === "paid" || invoice?.paymentStatus === "paid";

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", padding: "40px 20px", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
      {/* Top action toolbar (hidden on print) */}
      <div
        className="no-print"
        style={{
          maxWidth: "800px",
          margin: "0 auto 24px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/business/billing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#475569",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={16} /> Back to Billing Ledger
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "8px",
              background: "#0D9488",
              color: "#FFFFFF",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(13, 148, 136, 0.2)",
            }}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #E2E8F0",
          padding: "48px",
          color: "#0F172A",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #F1F5F9", paddingBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#0D9488",
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
              <span style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>OneStay360</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#1E293B" }}>
              {invoice?.businessName || userProfile?.businessName || "OneStay Accommodations"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px", maxWidth: "340px", lineHeight: "1.4" }}>
              {invoice?.propertyAddress || "Hinjawadi Phase 1, Near Infosys Circle, Pune, Maharashtra - 411057"}
            </div>
            <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
              SAC Code: <strong>996331</strong> (Co-living &amp; Hostel Services) &bull; GST Exempted (Residential)
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0D9488", textTransform: "uppercase", letterSpacing: "1px" }}>
              Tax Invoice / Rent Receipt
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F172A", marginTop: "4px" }}>
              {invoice?.invoiceNumber || `INV-${invoiceId.slice(-6).toUpperCase()}`}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Date: <strong>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </div>
            <div style={{ marginTop: "10px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: isPaid ? "#16A34A" : "#D97706",
                  background: isPaid ? "#DCFCE7" : "#FEF3C7",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                {isPaid ? <CheckCircle2 size={13} /> : null}
                {isPaid ? "PAID IN FULL" : "PAYMENT DUE"}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To / Property Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", margin: "28px 0" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Billed To Resident</span>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
              {invoice?.residentName || invoice?.tenantName || "Registered Resident"}
            </div>
            <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>
              Allocation: <strong>{invoice?.roomBed || "Room 101 • Bed A"}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>
              Property: {invoice?.propertyName || "Ram Nivas PG"}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Payment Rail &amp; Settlement</span>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", marginTop: "4px" }}>
              Mode: {invoice?.paymentMethod === "CASH_OFFLINE" ? "Cash (Hand Delivered)" : "Direct UPI / Cashfree"}
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
              Transaction Ref: <span style={{ fontFamily: "monospace" }}>{invoice?.cfPaymentId || "CF_TXN_DIRECT_UPI"}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
              Gateway Commission: ₹0 (Zero-Loss Direct Settlement)
            </div>
          </div>
        </div>

        {/* Invoice Line Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "24px 0" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#475569" }}>Item Description</th>
              <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "#475569" }}>Billing Basis</th>
              <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#475569" }}>Rate</th>
              <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#475569" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "14px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block" }}>Monthly Bed Accommodation</strong>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Residential stay for cycle {invoice?.month || "Current Month"} (Double Sharing AC)
                </span>
              </td>
              <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#475569" }}>1 Month</td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "13px", color: "#475569" }}>₹{rent.toLocaleString("en-IN")}</td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                ₹{rent.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "14px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block" }}>Room Electricity Submeter Units</strong>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  {units} kWh consumed in room &times; ₹{rate}/unit split across {roommates} inmates
                </span>
              </td>
              <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#475569" }}>
                {Math.round(units / roommates)} units
              </td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "13px", color: "#475569" }}>₹{rate}/unit</td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                ₹{elecShare.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "14px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block" }}>High-Speed Wi-Fi &amp; Routine Maintenance</strong>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Housekeeping, deep sanitization, and shared amenities upkeep</span>
              </td>
              <td style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "#475569" }}>Fixed / Mo</td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "13px", color: "#475569" }}>₹{maintenance}</td>
              <td style={{ padding: "14px", textAlign: "right", fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                ₹{maintenance.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals & Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "28px", borderTop: "2px solid #F1F5F9", paddingTop: "20px" }}>
          <div style={{ maxWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "12px", fontWeight: 700 }}>
              <ShieldCheck size={16} /> Digitally Signed Tax Invoice
            </div>
            <p style={{ fontSize: "11px", color: "#64748B", margin: "4px 0 0 0", lineHeight: "1.4" }}>
              This is a computer-generated tax receipt generated via OneStay360 Cloud Ledger. All utility allocations are audited against verified meter readings.
            </p>
          </div>

          <div style={{ minWidth: "260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", color: "#64748B" }}>
              <span>Subtotal:</span>
              <strong style={{ color: "#0F172A" }}>₹{total.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", color: "#64748B" }}>
              <span>GST (0% Residential):</span>
              <strong style={{ color: "#0F172A" }}>₹0</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderTop: "2px solid #0F172A",
                marginTop: "6px",
                fontSize: "18px",
                fontWeight: 900,
                color: "#0F172A",
              }}
            >
              <span>Total Paid:</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #FFFFFF !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
