"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldAlert,
  Building,
  RefreshCw,
  Zap,
  Flame,
  Droplets,
  Wind,
  Plus,
  Send,
  X,
} from "lucide-react";

interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  tenantName: string;
  tenantPhone: string;
  category: "power" | "water" | "ac_geyser" | "plumbing" | "carpentry" | "wifi";
  priority: "P0" | "P1" | "P2";
  title: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "resolved";
  createdAt: string;
  slaDeadline: string;
  slaHours: number;
  assignedVendor?: string;
  assignedVendorPhone?: string;
  escalatedViaWhatsApp?: boolean;
}

interface ApplianceAMC {
  id: string;
  propertyName: string;
  assetType: "AC Unit" | "RO Water Purifier" | "Geyser" | "Diesel Generator" | "Lift Elevator";
  location: string;
  serialNumber: string;
  amcVendor: string;
  amcPhone: string;
  lastServiceDate: string;
  nextServiceDueDate: string;
  status: "healthy" | "due_soon" | "overdue";
}

export default function OperationsConsole() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [appliances, setAppliances] = useState<ApplianceAMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tickets" | "appliances">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    loadOperationsData();
  }, []);

  async function loadOperationsData() {
    try {
      setLoading(true);

      // Seed / load tickets
      const mockTickets: MaintenanceTicket[] = [
        {
          id: "TCK_9901_P0",
          propertyId: "BUS0000001PNR001",
          propertyName: "Ram Nivas PG - Block A",
          roomNumber: "201",
          tenantName: "Kavya Patel",
          tenantPhone: "+91 97410 88992",
          category: "water",
          priority: "P0",
          title: "Complete overhead water supply cut",
          description: "No water flowing in 2nd floor bathrooms since morning 06:00 AM.",
          status: "open",
          createdAt: "23 Nov 2026, 06:15 PM",
          slaDeadline: "23 Nov 2026, 10:15 PM",
          slaHours: 4,
          assignedVendor: "Sri Vinayaka Plumbers",
          assignedVendorPhone: "+91 99880 11223",
          escalatedViaWhatsApp: false,
        },
        {
          id: "TCK_9902_P1",
          propertyId: "BUS0000001PNR001",
          propertyName: "Ram Nivas PG - Block A",
          roomNumber: "101",
          tenantName: "Aakash Sharma",
          tenantPhone: "+91 98450 11223",
          category: "ac_geyser",
          priority: "P1",
          title: "Daikin Inverter AC tripping MCB breaker",
          description: "AC running for 5 minutes then trips the main bedroom breaker switch.",
          status: "assigned",
          createdAt: "23 Nov 2026, 02:30 PM",
          slaDeadline: "24 Nov 2026, 02:30 AM",
          slaHours: 12,
          assignedVendor: "CoolZone Electricals",
          assignedVendorPhone: "+91 98455 66778",
          escalatedViaWhatsApp: true,
        },
        {
          id: "TCK_9903_P2",
          propertyId: "BUS0000002PNR002",
          propertyName: "Sri Sai Grand PG",
          roomNumber: "304",
          tenantName: "Pooja Hegde",
          tenantPhone: "+91 98765 00112",
          category: "carpentry",
          priority: "P2",
          title: "Wardrobe lock stuck and loose hinge",
          description: "Top hinge requires tightening and spare key duplication.",
          status: "in_progress",
          createdAt: "22 Nov 2026, 11:00 AM",
          slaDeadline: "24 Nov 2026, 11:00 AM",
          slaHours: 48,
          assignedVendor: "Universal Carpentry Works",
          assignedVendorPhone: "+91 94490 88776",
          escalatedViaWhatsApp: true,
        },
      ];

      const mockAppliances: ApplianceAMC[] = [
        {
          id: "AMC_01",
          propertyName: "Ram Nivas PG - Block A",
          assetType: "RO Water Purifier",
          location: "Dining Hall (Ground Floor)",
          serialNumber: "KENT-COMM-9942",
          amcVendor: "Kent RO Commercial Services",
          amcPhone: "+91 98451 22334",
          lastServiceDate: "15 Oct 2026",
          nextServiceDueDate: "15 Dec 2026",
          status: "healthy",
        },
        {
          id: "AMC_02",
          propertyName: "Ram Nivas PG - Block A",
          assetType: "AC Unit",
          location: "Room 101 (Triple)",
          serialNumber: "DKN-INV-15T-7721",
          amcVendor: "CoolZone Electricals",
          amcPhone: "+91 98455 66778",
          lastServiceDate: "10 Jun 2026",
          nextServiceDueDate: "25 Nov 2026",
          status: "due_soon",
        },
        {
          id: "AMC_03",
          propertyName: "Sri Sai Grand PG",
          assetType: "Diesel Generator",
          location: "Basement Utility Room",
          serialNumber: "KIRL-25KVA-0091",
          amcVendor: "Kirloskar Power Care",
          amcPhone: "+91 98800 44556",
          lastServiceDate: "01 May 2026",
          nextServiceDueDate: "01 Nov 2026",
          status: "overdue",
        },
        {
          id: "AMC_04",
          propertyName: "Ram Nivas PG - Block A",
          assetType: "Lift Elevator",
          location: "Central Shaft (G+4)",
          serialNumber: "OTIS-6P-8812",
          amcVendor: "Otis Elevator India",
          amcPhone: "+91 80 2345 6789",
          lastServiceDate: "05 Nov 2026",
          nextServiceDueDate: "05 Dec 2026",
          status: "healthy",
        },
      ];

      setTickets(mockTickets);
      setAppliances(mockAppliances);
    } catch (e) {
      console.error("Error loading operations data:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleEscalateWhatsApp = (tck: MaintenanceTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === tck.id ? { ...t, escalatedViaWhatsApp: true, status: "assigned" } : t))
    );
    const msg = `CRITICAL SLA ESCALATION: OneStay360 [${tck.priority}] Complaint #${tck.id} at ${tck.propertyName} (Room ${tck.roomNumber}). Issue: ${tck.title}. Immediate vendor intervention required.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleUpdateStatus = (ticketId: string, newStatus: MaintenanceTicket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterPriority === "all") return true;
    return t.priority === filterPriority;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          backgroundColor: "var(--bg-secondary)",
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wrench size={24} style={{ color: "var(--teal-primary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Operations, Maintenance & SLA Escalation Hub
            </h2>
            <span
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#EF4444",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Live SLA Timers
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
            P0/P1/P2 complaint triage, automated WhatsApp vendor escalation, and facility appliance AMC lifecycles.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={loadOperationsData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Sync Tickets
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Critical P0 (4h SLA)</span>
            <Flame size={18} style={{ color: "#EF4444" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#EF4444" }}>
            {tickets.filter((t) => t.priority === "P0" && t.status !== "resolved").length}
          </div>
          <div style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px" }}>Water/Power outages</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>High P1 (12h SLA)</span>
            <Zap size={18} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#F59E0B" }}>
            {tickets.filter((t) => t.priority === "P1" && t.status !== "resolved").length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>AC & Geyser malfunctions</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>General P2 (48h SLA)</span>
            <Clock size={18} style={{ color: "var(--teal-primary)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "var(--teal-primary)" }}>
            {tickets.filter((t) => t.priority === "P2" && t.status !== "resolved").length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Carpentry, painting & locks</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Appliances Due AMC</span>
            <AlertTriangle size={18} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#F59E0B" }}>
            {appliances.filter((a) => a.status === "due_soon" || a.status === "overdue").length}
          </div>
          <div style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px" }}>1 generator overdue</div>
        </div>
      </div>

      {/* View Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("tickets")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "tickets" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "tickets" ? "#FFFFFF" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Wrench size={16} /> Live Maintenance Queue ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab("appliances")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "appliances" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "appliances" ? "#FFFFFF" : "var(--text-secondary)",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Building size={16} /> Asset & Appliance AMC Registry ({appliances.length})
        </button>
      </div>

      {/* Tab 1: Tickets Table */}
      {activeTab === "tickets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "P0", "P1", "P2"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: filterPriority === p ? "var(--bg-secondary)" : "transparent",
                    color: filterPriority === p ? "var(--text-primary)" : "var(--text-secondary)",
                    border: `1px solid ${filterPriority === p ? "var(--teal-primary)" : "var(--border-color)"}`,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p === "all" ? "All Priorities" : `${p} Priority`}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderBottom: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>PRIORITY & TICKET</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>PROPERTY & ROOM</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>ISSUE TITLE</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>SLA TIMER</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>ASSIGNED VENDOR</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: "14px 18px", fontWeight: 600, textAlign: "right" }}>ESCALATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "11px",
                            backgroundColor:
                              t.priority === "P0"
                                ? "rgba(239, 68, 68, 0.2)"
                                : t.priority === "P1"
                                ? "rgba(245, 158, 11, 0.2)"
                                : "rgba(13, 148, 136, 0.2)",
                            color:
                              t.priority === "P0"
                                ? "#EF4444"
                                : t.priority === "P1"
                                ? "#F59E0B"
                                : "var(--teal-primary)",
                          }}
                        >
                          {t.priority}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.id}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{t.category.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.propertyName}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        Room {t.roomNumber} • {t.tenantName}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px", maxWidth: "260px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.description}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={13} style={{ color: t.priority === "P0" ? "#EF4444" : "#F59E0B" }} />
                        <span style={{ fontWeight: 700, fontSize: "12px", color: t.priority === "P0" ? "#EF4444" : "var(--text-primary)" }}>
                          {t.slaHours}h SLA
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Due: {t.slaDeadline.split(",")[1]}</div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {t.assignedVendor || "Unassigned"}
                      </div>
                      {t.assignedVendorPhone && (
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{t.assignedVendorPhone}</div>
                      )}
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          backgroundColor:
                            t.status === "resolved"
                              ? "rgba(16, 185, 129, 0.15)"
                              : t.status === "in_progress"
                              ? "rgba(6, 182, 212, 0.15)"
                              : t.status === "assigned"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                          color:
                            t.status === "resolved"
                              ? "#10B981"
                              : t.status === "in_progress"
                              ? "var(--cyan-primary)"
                              : t.status === "assigned"
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEscalateWhatsApp(t)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <MessageSquare size={13} />
                          {t.escalatedViaWhatsApp ? "Re-Escalate" : "WhatsApp"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Appliance AMC Registry */}
      {activeTab === "appliances" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderBottom: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>APPLIANCE & LOCATION</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>PROPERTY</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>SERIAL NUMBER</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>AMC VENDOR</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>NEXT SERVICE DUE</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>HEALTH STATUS</th>
              </tr>
            </thead>
            <tbody>
              {appliances.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.assetType}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{a.location}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ color: "var(--text-primary)" }}>{a.propertyName}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontFamily: "monospace", color: "var(--cyan-primary)" }}>{a.serialNumber}</span>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.amcVendor}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{a.amcPhone}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: a.status === "overdue" ? "#EF4444" : "var(--text-primary)" }}>
                      {a.nextServiceDueDate}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Last: {a.lastServiceDate}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: 600,
                        backgroundColor:
                          a.status === "healthy"
                            ? "rgba(16, 185, 129, 0.15)"
                            : a.status === "due_soon"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                        color:
                          a.status === "healthy"
                            ? "#10B981"
                            : a.status === "due_soon"
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {a.status === "healthy" ? "HEALTHY" : a.status === "due_soon" ? "DUE SOON" : "OVERDUE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--bg-secondary)",
              height: "100%",
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              borderLeft: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: selectedTicket.priority === "P0" ? "#EF4444" : "var(--teal-primary)",
                  }}
                >
                  {selectedTicket.priority} Priority Complaint
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0" }}>{selectedTicket.id}</h2>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Reported by {selectedTicket.tenantName} ({selectedTicket.tenantPhone})
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-primary)",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>{selectedTicket.title}</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {selectedTicket.description}
              </p>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Update Ticket Resolution Status
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["open", "assigned", "in_progress", "resolved"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: selectedTicket.status === st ? "var(--teal-primary)" : "var(--bg-primary)",
                      color: selectedTicket.status === st ? "#FFFFFF" : "var(--text-secondary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleEscalateWhatsApp(selectedTicket)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#10B981",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MessageSquare size={16} /> Escalate via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
