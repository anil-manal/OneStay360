"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessProperties } from "@/lib/data-service";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Receipt,
  Download,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  CreditCard,
  Banknote,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  residentName: string;
  residentPhone: string;
  propertyName: string;
  roomBed: string;
  month: string;
  baseRent: number;
  electricityUnits: number;
  electricityRate: number;
  electricityTotal: number;
  amenityFees: number;
  totalAmount: number;
  status: "paid" | "pending" | "overdue";
  paymentMethod?: "CASHFREE_UPI" | "CASH_OFFLINE" | "NEFT_RTGS";
  paymentRef?: string;
  paidAt?: string;
  dueDate: string;
}

export default function BusinessBillingPage() {
  const { userProfile } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("all");

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const invList: InvoiceItem[] = [];

        // 1. Fetch from enrollmentRequests where businessId matches and bill/rent was generated
        try {
          const enrSnap = await getDocs(collection(db, "enrollmentRequests"));
          enrSnap.forEach((d) => {
            const dat = d.data();
            if (dat.businessId === businessId && (dat.status === "confirmed" || dat.status === "completed" || dat.billSentAt)) {
              invList.push({
                id: d.id,
                invoiceNumber: `INV-${d.id.slice(0, 8).toUpperCase()}`,
                residentName: dat.tenantName || "Resident",
                residentPhone: dat.tenantPhone || "No Phone",
                propertyName: dat.propertyName || "Ram Nivas PG",
                roomBed: `Room ${dat.roomNumber || "101"} • Bed ${dat.bedNumber || "1"}`,
                month: "Active Lease Cycle",
                baseRent: dat.monthlyRent || 7000,
                electricityUnits: 0,
                electricityRate: 10,
                electricityTotal: 0,
                amenityFees: dat.maintenanceAmount || 0,
                totalAmount: dat.totalBillAmount || dat.totalFirstMonth || dat.monthlyRent || 7000,
                status: dat.status === "confirmed" ? "paid" : "pending",
                paymentMethod: dat.paymentMode === "upi_manual" ? "CASHFREE_UPI" : "CASH_OFFLINE",
                paymentRef: dat.transactionId || undefined,
                paidAt: dat.confirmedAt?.toDate ? dat.confirmedAt.toDate().toLocaleDateString() : undefined,
                dueDate: "5th of month",
              });
            }
          });
        } catch (e) {
          console.warn("Could not load enrollment bills:", e);
        }

        setInvoices(invList);
      } catch (err) {
        console.error("Error loading billing data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [businessId]);

  // Modals
  const [cashModalInvoice, setCashModalInvoice] = useState<InvoiceItem | null>(null);
  const [cashReceiptNote, setCashReceiptNote] = useState("");
  const [isCashSubmitting, setIsCashSubmitting] = useState(false);

  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);
  const [bulkDispatchDone, setBulkDispatchDone] = useState(false);

  // Financial aggregates
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalRealized = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.totalAmount, 0);
  const totalPending = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + i.totalAmount, 0);
  const onlineCollected = invoices
    .filter((i) => i.status === "paid" && i.paymentMethod === "CASHFREE_UPI")
    .reduce((s, i) => s + i.totalAmount, 0);
  const cashCollected = invoices
    .filter((i) => i.status === "paid" && i.paymentMethod === "CASH_OFFLINE")
    .reduce((s, i) => s + i.totalAmount, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.roomBed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesProp =
      selectedPropertyFilter === "all" || inv.propertyName.includes(selectedPropertyFilter);
    return matchesSearch && matchesStatus && matchesProp;
  });

  const handleRecordCash = () => {
    if (!cashModalInvoice) return;
    setIsCashSubmitting(true);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === cashModalInvoice.id
            ? {
                ...item,
                status: "paid",
                paymentMethod: "CASH_OFFLINE",
                paymentRef: cashReceiptNote || `CASH-${Date.now().toString().slice(-4)}`,
                paidAt: new Date().toISOString().replace("T", " ").slice(0, 16),
              }
            : item
        )
      );
      setIsCashSubmitting(false);
      setCashModalInvoice(null);
      setCashReceiptNote("");
    }, 600);
  };

  const handleCopyLink = (inv: InvoiceItem) => {
    const paymentLink = `https://onestay360.in/pay/${inv.id.toLowerCase()}`;
    navigator.clipboard.writeText(paymentLink);
    setLinkCopiedId(inv.id);
    setTimeout(() => setLinkCopiedId(null), 2500);
  };

  const handleBulkDispatch = () => {
    setBulkDispatchDone(true);
    setTimeout(() => setBulkDispatchDone(false), 4000);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
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
              FINANCIAL OPERATIONS
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Cycle: November 2026</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", margin: 0 }}>
            Billing & Submeter Ledger
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Automated Cashfree payment link dispatch, submeter electricity split calculator, and offline cash receipts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleBulkDispatch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(5,150,105,0.2)",
            }}
          >
            {bulkDispatchDone ? (
              <>
                <CheckCircle2 size={16} /> Dispatched to WhatsApp & SMS!
              </>
            ) : (
              <>
                <Send size={16} /> Bulk Send Payment Reminders
              </>
            )}
          </button>
        </div>
      </div>

      {/* Aggregate Financial Realization Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Total Invoiced (Nov)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            ₹{totalBilled.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            {invoices.length} Resident invoices generated
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
            Total Realized (Paid)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#059669", marginTop: "6px" }}>
            ₹{totalRealized.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            {Math.round((totalRealized / totalBilled) * 100)}% realization rate
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#EA580C", textTransform: "uppercase" }}>
            Pending & Overdue Arrears
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#EA580C", marginTop: "6px" }}>
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            {invoices.filter((i) => i.status !== "paid").length} invoices pending
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Collection Split
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                <CreditCard size={12} color="#2563EB" /> Online UPI
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
                ₹{onlineCollected.toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ width: "1px", background: "#E2E8F0" }} />
            <div>
              <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                <Banknote size={12} color="#16A34A" /> Direct Cash
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
                ₹{cashCollected.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "300px" }}>
          <div
            style={{
              position: "relative",
              flex: 1,
              maxWidth: "360px",
            }}
          >
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search resident, invoice #, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Property Selector */}
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              fontSize: "13px",
              background: "#FFFFFF",
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="all">All Properties</option>
            <option value="CyberPark">Zolo CyberPark Premier</option>
            <option value="TechZone">Zolo TechZone Luxury</option>
            <option value="Nexus">Zolo Nexus Hive</option>
            <option value="Silicon">Zolo Silicon Heights</option>
          </select>
        </div>

        {/* Status Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "paid", "pending", "overdue"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "capitalize",
                border: statusFilter === st ? "1px solid #059669" : "1px solid #E2E8F0",
                background: statusFilter === st ? "#ECFDF5" : "#FFFFFF",
                color: statusFilter === st ? "#059669" : "#64748B",
                cursor: "pointer",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Invoice #</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Resident & Room</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Base Rent</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Electricity Submeter</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Total Due</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "14px 18px", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A" }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>Due: {inv.dueDate}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A" }}>{inv.residentName}</div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>{inv.roomBed}</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{inv.propertyName}</div>
                </td>
                <td style={{ padding: "14px 18px", fontWeight: 600, color: "#334155" }}>
                  ₹{inv.baseRent.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0F172A", fontWeight: 700 }}>
                    <Zap size={13} color="#F59E0B" />
                    <span>₹{inv.electricityTotal}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>
                    {inv.electricityUnits} units @ ₹{inv.electricityRate}/unit
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 900, color: "#0F172A" }}>
                    ₹{inv.totalAmount.toLocaleString("en-IN")}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {inv.status === "paid" && (
                    <div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#16A34A",
                          background: "#DCFCE7",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        <CheckCircle2 size={12} /> PAID
                      </span>
                      <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px" }}>
                        {inv.paymentMethod === "CASHFREE_UPI" ? "Cashfree UPI" : "Cash Offline"}
                      </div>
                    </div>
                  )}
                  {inv.status === "pending" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#D97706",
                        background: "#FEF3C7",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      <Clock size={12} /> PENDING
                    </span>
                  )}
                  {inv.status === "overdue" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#DC2626",
                        background: "#FEE2E2",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      <AlertCircle size={12} /> OVERDUE
                    </span>
                  )}
                </td>
                <td style={{ padding: "14px 18px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    {inv.status !== "paid" && (
                      <>
                        <button
                          onClick={() => handleCopyLink(inv)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #CBD5E1",
                            background: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#334155",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {linkCopiedId === inv.id ? "Copied Link!" : "Copy Pay Link"}
                        </button>
                        <button
                          onClick={() => setCashModalInvoice(inv)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#059669",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Banknote size={13} /> Collect Cash
                        </button>
                      </>
                    )}
                    {inv.status === "paid" && (
                      <Link
                        href={`/business/billing/invoice/${inv.id}`}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E2E8F0",
                          background: "#F8FAFC",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#334155",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Printer size={13} /> View / Print Tax Invoice
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Cash Offline Modal */}
      {cashModalInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#16A34A",
                }}
              >
                <Banknote size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Record Offline Cash Payment
                </h3>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  Invoice: {cashModalInvoice.invoiceNumber} • {cashModalInvoice.residentName}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#64748B" }}>Room / Bed:</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>{cashModalInvoice.roomBed}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#64748B" }}>Base Rent:</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  ₹{cashModalInvoice.baseRent.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#64748B" }}>Submeter Electricity:</span>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>₹{cashModalInvoice.electricityTotal}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px dashed #CBD5E1",
                  fontSize: "15px",
                }}
              >
                <span style={{ fontWeight: 800, color: "#0F172A" }}>Total Cash Collected:</span>
                <span style={{ fontWeight: 900, color: "#059669" }}>
                  ₹{cashModalInvoice.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Physical Receipt # / Cash Memo Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. BOOK-3 / REC-4829 or Cash handed to warden"
                value={cashReceiptNote}
                onChange={(e) => setCashReceiptNote(e.target.value)}
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setCashModalInvoice(null)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRecordCash}
                disabled={isCashSubmitting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#059669",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isCashSubmitting ? "Recording..." : "Confirm Cash Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
