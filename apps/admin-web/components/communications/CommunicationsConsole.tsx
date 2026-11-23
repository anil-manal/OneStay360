"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCheck,
  Radio,
  FileText,
  AlertCircle,
  Users,
  Building,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "UTILITY" | "AUTHENTICATION" | "MARKETING";
  status: "APPROVED" | "PENDING";
  language: string;
  body: string;
  variables: string[];
}

export default function CommunicationsConsole() {
  const [activeTab, setActiveTab] = useState<"broadcast" | "templates" | "failover">("broadcast");
  const [targetAudience, setTargetAudience] = useState<string>("all_tenants");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("rent_invoice_reminder_v2");
  const [customNotice, setCustomNotice] = useState<string>("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const templates: WhatsAppTemplate[] = [
    {
      id: "tpl_01",
      name: "rent_invoice_reminder_v2",
      category: "UTILITY",
      status: "APPROVED",
      language: "en_IN",
      body: "Hello {{1}}, your monthly rent invoice of ₹{{2}} for {{3}} (Room {{4}}) is generated. Click the secure Cashfree link below to complete UPI payment with 0% gateway fees: {{5}}",
      variables: ["Tenant Name", "Amount", "PG Name", "Room No", "Payment URL"],
    },
    {
      id: "tpl_02",
      name: "welcome_tenant_onboarding",
      category: "UTILITY",
      status: "APPROVED",
      language: "en_IN",
      body: "Welcome to OneStay360, {{1}}! Your stay at {{2}} (Bed {{3}}) has been activated. Download the OneStay360 Tenant App to view bills and raise maintenance requests: https://onestay360.in/download",
      variables: ["Tenant Name", "PG Name", "Bed No"],
    },
    {
      id: "tpl_03",
      name: "maintenance_sla_escalation",
      category: "UTILITY",
      status: "APPROVED",
      language: "en_IN",
      body: "URGENT SLA NOTICE: Maintenance ticket #{{1}} at {{2}} has been escalated. Issue: {{3}}. Landlord and vendor have been alerted.",
      variables: ["Ticket ID", "PG Name", "Issue Summary"],
    },
    {
      id: "tpl_04",
      name: "emergency_facility_alert",
      category: "UTILITY",
      status: "APPROVED",
      language: "en_IN",
      body: "Notice for residents of {{1}}: {{2}}. We apologize for the inconvenience. OneStay360 Facility Desk.",
      variables: ["PG Name", "Notice Details"],
    },
  ];

  const handleSendBroadcast = async () => {
    setBroadcasting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setBroadcasting(false);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const currentTpl = templates.find((t) => t.name === selectedTemplate) || templates[0];

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
            <MessageSquare size={24} style={{ color: "var(--teal-primary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Meta WhatsApp Cloud API & Broadcast Engine
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
              Meta Tier-2 Verified
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
            Unified notification dispatcher: Meta WhatsApp Cloud API $\to$ DLT SMS $\to$ In-App Push fallbacks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("broadcast")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "broadcast" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "broadcast" ? "#FFFFFF" : "var(--text-secondary)",
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
          <Send size={16} /> Broadcast Dispatcher
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "templates" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "templates" ? "#FFFFFF" : "var(--text-secondary)",
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
          <FileText size={16} /> WhatsApp HSM Templates ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab("failover")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "failover" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "failover" ? "#FFFFFF" : "var(--text-secondary)",
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
          <Layers size={16} /> Multi-Channel Failover Monitor
        </button>
      </div>

      {/* Tab 1: Broadcast Dispatcher with Live WhatsApp Phone Simulator */}
      {activeTab === "broadcast" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          {/* Dispatch Controls */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Configure Broadcast Campaign</h3>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Target Recipient Cohort
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="all_tenants">All Active Tenants (Platform-Wide Network)</option>
                <option value="property_ram_nivas">Ram Nivas PG Residents Only</option>
                <option value="city_bangalore">Bengaluru Cluster Residents</option>
                <option value="rent_overdue">Tenants with Unpaid Rent Invoices</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Select Meta Approved Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {templates.map((tpl) => (
                  <option key={tpl.name} value={tpl.name}>
                    {tpl.name} ({tpl.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate === "emergency_facility_alert" && (
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Notice Text
                </label>
                <textarea
                  rows={3}
                  value={customNotice}
                  onChange={(e) => setCustomNotice(e.target.value)}
                  placeholder="e.g. Overhead water tank cleaning scheduled tomorrow 10:00 AM - 01:00 PM."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            )}

            <div
              style={{
                padding: "14px",
                backgroundColor: "var(--bg-primary)",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Channel:</strong> Meta Cloud API (WhatsApp WABA)
              </div>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Fallback:</strong> Jio DLT SMS gateway if WhatsApp undelivered within 300s
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
              {broadcastSent ? (
                <span style={{ color: "#10B981", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} /> Broadcast Dispatched Successfully!
                </span>
              ) : (
                <span />
              )}
              <button
                onClick={handleSendBroadcast}
                disabled={broadcasting}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--teal-primary)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: broadcasting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Send size={15} />
                {broadcasting ? "Transmitting..." : "Send Campaign Now"}
              </button>
            </div>
          </div>

          {/* Realistic Phone Simulator Preview */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>
              Live WhatsApp Simulation Preview
            </span>

            {/* Phone shell */}
            <div
              style={{
                width: "280px",
                height: "460px",
                backgroundColor: "#0B141A",
                borderRadius: "24px",
                border: "4px solid #334155",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* WhatsApp App Header */}
              <div
                style={{
                  backgroundColor: "#1F2C34",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderBottom: "1px solid #2A3942",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "var(--teal-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  O
                </div>
                <div>
                  <div style={{ color: "#E9EDEF", fontSize: "13px", fontWeight: 600 }}>OneStay360 Verified</div>
                  <div style={{ color: "#00A884", fontSize: "10px" }}>Official Business Account</div>
                </div>
              </div>

              {/* Chat Canvas */}
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  backgroundColor: "#0B141A",
                }}
              >
                {/* Message Bubble */}
                <div
                  style={{
                    backgroundColor: "#005C4B",
                    color: "#E9EDEF",
                    padding: "12px 14px",
                    borderRadius: "10px 10px 0 10px",
                    fontSize: "12px",
                    lineHeight: 1.45,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  {currentTpl.body
                    .replace("{{1}}", "Aakash")
                    .replace("{{2}}", customNotice || "8,500")
                    .replace("{{3}}", "Ram Nivas PG")
                    .replace("{{4}}", "101")
                    .replace("{{5}}", "https://payments-test.cashfree.com/links/xyz")}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "4px",
                      marginTop: "6px",
                      color: "#8696A0",
                      fontSize: "10px",
                    }}
                  >
                    <span>07:22 PM</span>
                    <CheckCheck size={13} style={{ color: "#53BDEB" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp HSM Templates */}
      {activeTab === "templates" && (
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
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>TEMPLATE NAME</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>META STATUS</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>BODY CONTENT</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>PARAMETERS</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--cyan-primary)" }}>{tpl.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Lang: {tpl.language}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>{tpl.category}</span>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: 600,
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        color: "#10B981",
                      }}
                    >
                      {tpl.status}
                    </span>
                  </td>

                  <td style={{ padding: "14px 18px", maxWidth: "340px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{tpl.body}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {tpl.variables.map((v, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            backgroundColor: "var(--bg-primary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Failover Pipeline */}
      {activeTab === "failover" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Multi-Channel Failover Telemetry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div style={{ backgroundColor: "var(--bg-primary)", padding: "20px", borderRadius: "10px", border: "1px solid #10B981" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontWeight: 700 }}>
                <CheckCircle2 size={18} /> Primary: Meta WhatsApp Cloud API
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                98.4% First-Attempt delivery rate. Free incoming service replies within 24h window.
              </p>
            </div>

            <div style={{ backgroundColor: "var(--bg-primary)", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--cyan-primary)", fontWeight: 700 }}>
                <Radio size={18} /> Failover 1: DLT Compliant SMS (Airtel)
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                Triggers automatically if WhatsApp status webhook reports undelivered after 5 minutes.
              </p>
            </div>

            <div style={{ backgroundColor: "var(--bg-primary)", padding: "20px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--teal-primary)", fontWeight: 700 }}>
                <Smartphone size={18} /> Fallback 2: FCM In-App Push
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                Delivered directly to installed OneStay360 Tenant & Business Android/iOS apps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
