"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp, setDoc, query, orderBy } from "firebase/firestore";
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

  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"P0" | "P1" | "P2">("P1");
  const [newCategory, setNewCategory] = useState<MaintenanceTicket["category"]>("ac_geyser");
  const [newRoom, setNewRoom] = useState("101");
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    loadOperationsData();
  }, []);

  async function loadOperationsData() {
    try {
      setLoading(true);

      // 1. Fetch real tickets from Firestore collection 'tickets'
      const loadedTickets: MaintenanceTicket[] = [];
      try {
        const ticketSnap = await getDocs(collection(db, "tickets"));
        ticketSnap.docs.forEach((d) => {
          const dat = d.data();
          const createdDate = dat.createdAt?.toDate ? dat.createdAt.toDate() : new Date();
          const hours = Number(dat.slaHours) || (dat.priority === "P0" ? 4 : dat.priority === "P1" ? 12 : 48);
          const deadline = new Date(createdDate.getTime() + hours * 3600000);

          loadedTickets.push({
            id: dat.id || d.id,
            propertyId: dat.propertyId || "BUS0000001PNR001",
            propertyName: dat.propertyName || "Ram Nivas PG",
            roomNumber: dat.roomNumber || "101",
            tenantName: dat.tenantName || "Anil Manal",
            tenantPhone: dat.tenantPhone || "+91 93593 03097",
            category: dat.category || "ac_geyser",
            priority: dat.priority || "P1",
            title: dat.title || "Facility Maintenance Request",
            description: dat.description || "Reported maintenance issue.",
            status: dat.status || "open",
            createdAt: createdDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            slaDeadline: deadline.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
            slaHours: hours,
            assignedVendor: dat.assignedVendor || "CoolZone Electricals & Plumbing",
            assignedVendorPhone: dat.assignedVendorPhone || "+91 98455 66778",
            escalatedViaWhatsApp: dat.escalatedViaWhatsApp ?? false,
          });
        });
      } catch (err) {
        console.warn("Could not query tickets collection:", err);
      }

      // 2. Fetch real appliances from Firestore collection 'appliances'
      const loadedAppliances: ApplianceAMC[] = [];
      try {
        const appSnap = await getDocs(collection(db, "appliances"));
        appSnap.docs.forEach((d) => {
          const dat = d.data();
          loadedAppliances.push({
            id: d.id,
            propertyName: dat.propertyName || "Ram Nivas PG",
            assetType: dat.assetType || "AC Unit",
            location: dat.location || "Ground Floor",
            serialNumber: dat.serialNumber || "SN-10029",
            amcVendor: dat.amcVendor || "Certified AMC Provider",
            amcPhone: dat.amcPhone || "+91 98451 22334",
            lastServiceDate: dat.lastServiceDate || "15 Oct 2026",
            nextServiceDueDate: dat.nextServiceDueDate || "15 Dec 2026",
            status: dat.status || "healthy",
          });
        });
      } catch (err) {
        console.warn("Could not query appliances collection:", err);
      }

      setTickets(loadedTickets);
      setAppliances(loadedAppliances);
    } catch (e) {
      console.error("Error loading live operations data:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleEscalateWhatsApp = async (tck: MaintenanceTicket) => {
    try {
      const ticketRef = doc(db, "tickets", tck.id);
      await updateDoc(ticketRef, {
        escalatedViaWhatsApp: true,
        status: "assigned",
        lastEscalatedAt: serverTimestamp(),
      });

      // Audit log
      await setDoc(doc(db, "system/audit_logs/records", `AUDIT_${Date.now()}`), {
        actor: "admin@onestay360.in",
        action: "TICKET_ESCALATED_WHATSAPP",
        targetEntity: `tickets/${tck.id}`,
        ipAddress: "106.216.42.18 (Bengaluru, IN)",
        timestamp: serverTimestamp(),
        details: `Ticket #${tck.id} escalated to vendor via WhatsApp.`,
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === tck.id ? { ...t, escalatedViaWhatsApp: true, status: "assigned" } : t))
      );

      const msg = `CRITICAL SLA ESCALATION: OneStay360 [${tck.priority}] Complaint #${tck.id} at ${tck.propertyName} (Room ${tck.roomNumber}). Issue: ${tck.title}. Immediate vendor intervention required.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (err) {
      console.error("Error escalating ticket:", err);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: MaintenanceTicket["status"]) => {
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.error("Error updating ticket status:", e);
    }
  };

  const handleCreateNewTicket = async () => {
    if (!newTitle) return;
    try {
      setCreatingTicket(true);
      const ticketId = `TCK_${Date.now().toString().slice(-6)}`;
      const newDoc = {
        id: ticketId,
        propertyId: "BUS0000001PNR001",
        propertyName: "Ram Nivas PG",
        roomNumber: newRoom,
        tenantName: "Anil Manal",
        tenantPhone: "+919359303097",
        category: newCategory,
        priority: newPriority,
        title: newTitle,
        description: newDesc,
        status: "open",
        createdAt: serverTimestamp(),
        slaHours: newPriority === "P0" ? 4 : newPriority === "P1" ? 12 : 48,
        assignedVendor: "CoolZone Electricals & Plumbing",
        assignedVendorPhone: "+91 98455 66778",
        escalatedViaWhatsApp: false,
      };

      await setDoc(doc(db, "tickets", ticketId), newDoc);

      setTickets((prev) => [
        {
          ...newDoc,
          createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
          slaDeadline: new Date(Date.now() + newDoc.slaHours * 3600000).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        } as any,
        ...prev,
      ]);

      setCreateTicketOpen(false);
      setNewTitle("");
      setNewDesc("");
    } catch (err) {
      console.error("Error creating ticket:", err);
      alert("Failed to write ticket to Firestore.");
    } finally {
      setCreatingTicket(false);
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
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Live Firestore Records
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
            Live complaint tickets, automated WhatsApp vendor escalation, and facility appliance AMC lifecycles.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setCreateTicketOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "var(--teal-primary)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Log Incident
          </button>
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
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Carpentry & general repairs</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Appliances in Registry</span>
            <AlertTriangle size={18} style={{ color: "#10B981" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "8px", color: "#10B981" }}>
            {appliances.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Tracked across properties</div>
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
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "var(--text-secondary)" }}>
                      {loading ? "Loading tickets from Firestore..." : "No maintenance tickets in queue."}
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
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
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Due: {t.slaDeadline}</div>
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
                  ))
                )}
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

      {/* Log Ticket Modal */}
      {createTicketOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              maxWidth: "480px",
              width: "100%",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Log New Incident</h3>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Issue Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Geyser tripping MCB breaker"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <option value="P0">P0 (Critical - 4h SLA)</option>
                  <option value="P1">P1 (High - 12h SLA)</option>
                  <option value="P2">P2 (General - 48h SLA)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Room Number
                </label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Description
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Details of complaint or required repair..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setCreateTicketOpen(false)}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTicket}
                disabled={creatingTicket || !newTitle}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--teal-primary)",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: creatingTicket || !newTitle ? "not-allowed" : "pointer",
                }}
              >
                {creatingTicket ? "Saving..." : "Save to Firestore"}
              </button>
            </div>
          </div>
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
