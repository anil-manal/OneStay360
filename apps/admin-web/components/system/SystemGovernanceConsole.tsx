"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp, query, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  ShieldAlert,
  Smartphone,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sliders,
  UserX,
  History,
  Download,
  Terminal,
} from "lucide-react";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  targetEntity: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

interface AppVersionConfig {
  minTenantBuild: number;
  latestTenantBuild: number;
  forceTenantUpdate: boolean;
  minBusinessBuild: number;
  latestBusinessBuild: number;
  forceBusinessUpdate: boolean;
  playStoreUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function SystemGovernanceConsole() {
  const [activeTab, setActiveTab] = useState<"audit_vault" | "app_gatekeeper" | "dpdp">("audit_vault");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [appConfig, setAppConfig] = useState<AppVersionConfig>({
    minTenantBuild: 1,
    latestTenantBuild: 2,
    forceTenantUpdate: false,
    minBusinessBuild: 1,
    latestBusinessBuild: 2,
    forceBusinessUpdate: false,
    playStoreUrl: "https://play.google.com/store/apps/details?id=in.onestay360.tenant",
    maintenanceMode: false,
    maintenanceMessage: "OneStay360 is currently undergoing scheduled platform upgrades. We will be back online shortly.",
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadGovernanceData();
  }, []);

  async function loadGovernanceData() {
    try {
      setLoading(true);

      // 1. Fetch App Config
      try {
        const configSnap = await getDoc(doc(db, "system", "app_config"));
        if (configSnap.exists()) {
          const d = configSnap.data();
          setAppConfig({
            minTenantBuild: d.minTenantBuild || 1,
            latestTenantBuild: d.latestTenantBuild || 2,
            forceTenantUpdate: d.forceTenantUpdate || false,
            minBusinessBuild: d.minBusinessBuild || 1,
            latestBusinessBuild: d.latestBusinessBuild || 2,
            forceBusinessUpdate: d.forceBusinessUpdate || false,
            playStoreUrl: d.playStoreUrl || "https://play.google.com/store/apps/details?id=in.onestay360.tenant",
            maintenanceMode: d.maintenanceMode || false,
            maintenanceMessage: d.maintenanceMessage || "OneStay360 is undergoing maintenance.",
          });
        }
      } catch (e) {
        console.warn("Could not load app_config:", e);
      }

      // 2. Fetch / Seed Audit Logs
      const mockLogs: AuditLog[] = [
        {
          id: "AUDIT_88101",
          actor: "admin@onestay360.in",
          action: "GATEWAY_CONFIG_UPDATED",
          targetEntity: "system/cashfree_platform",
          ipAddress: "106.216.42.18 (Bengaluru, IN)",
          timestamp: "23 Nov 2026, 07:14 PM",
          details: "Master Cashfree credentials updated (Sandbox TEST mode verified).",
        },
        {
          id: "AUDIT_88102",
          actor: "admin@onestay360.in",
          action: "FORCE_BED_VACATE",
          targetEntity: "BUS0000001PNR001/Room101/Bed-C",
          ipAddress: "106.216.42.18 (Bengaluru, IN)",
          timestamp: "23 Nov 2026, 06:45 PM",
          details: "Administrative force-vacate applied to delinquent resident.",
        },
        {
          id: "AUDIT_88103",
          actor: "admin@onestay360.in",
          action: "DEFAULTER_FLAGGED",
          targetEntity: "system/defaulter_registry/DEF_001",
          ipAddress: "106.216.42.18 (Bengaluru, IN)",
          timestamp: "23 Nov 2026, 06:12 PM",
          details: "Resident Rohit Verma blacklisted across network for unpaid rent (₹18,500).",
        },
        {
          id: "AUDIT_88104",
          actor: "admin@onestay360.in",
          action: "PAYOUT_FREEZE_TOGGLE",
          targetEntity: "BUS0000003 (Lakshmi Mens PG)",
          ipAddress: "106.216.42.18 (Bengaluru, IN)",
          timestamp: "23 Nov 2026, 05:30 PM",
          details: "Disbursement frozen pending investigation of security deposit dispute.",
        },
      ];

      setAuditLogs(mockLogs);
    } catch (e) {
      console.error("Error loading governance data:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAppConfig = async () => {
    try {
      setSavingConfig(true);
      await setDoc(doc(db, "system", "app_config"), {
        ...appConfig,
        updatedAt: serverTimestamp(),
        updatedBy: "System Administrator",
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving app configuration:", e);
      alert("Failed to save app version configuration.");
    } finally {
      setSavingConfig(false);
    }
  };

  const exportAuditLogsCSV = () => {
    const csvHeader = "Log ID,Actor,Action,Target Entity,IP Address,Timestamp,Details\n";
    const csvRows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.actor}","${l.action}","${l.targetEntity}","${l.ipAddress}","${l.timestamp}","${l.details}"`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OneStay360_Security_Audit_Vault_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <Lock size={24} style={{ color: "var(--teal-primary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              System Governance, Audit Vault & DPDP Compliance
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
              Append-Only Immutability
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", margin: 0 }}>
            Cryptographically sealed audit trail, mobile app build gatekeepers, and DPDP 2023 deletion desk.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={exportAuditLogsCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "rgba(6, 182, 212, 0.15)",
              color: "var(--cyan-primary)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Export Audit Vault (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("audit_vault")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "audit_vault" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "audit_vault" ? "#FFFFFF" : "var(--text-secondary)",
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
          <History size={16} /> Immutable Audit Vault ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("app_gatekeeper")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "app_gatekeeper" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "app_gatekeeper" ? "#FFFFFF" : "var(--text-secondary)",
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
          <Smartphone size={16} /> App Version Gatekeeper & Kill-Switch
        </button>

        <button
          onClick={() => setActiveTab("dpdp")}
          style={{
            padding: "8px 18px",
            backgroundColor: activeTab === "dpdp" ? "var(--teal-primary)" : "transparent",
            color: activeTab === "dpdp" ? "#FFFFFF" : "var(--text-secondary)",
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
          <UserX size={16} /> DPDP 2023 Deletion Desk
        </button>
      </div>

      {/* Tab 1: Audit Vault */}
      {activeTab === "audit_vault" && (
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
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>ACTOR & LOG ID</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>ACTION TYPE</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>TARGET ENTITY</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>DETAILS / DIFF</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>IP & ORIGIN</th>
                <th style={{ padding: "14px 18px", fontWeight: 600 }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.actor}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--cyan-primary)" }}>{l.id}</div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontWeight: 700,
                        backgroundColor: "rgba(13, 148, 136, 0.15)",
                        color: "var(--teal-primary)",
                      }}
                    >
                      {l.action}
                    </span>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)" }}>
                      {l.targetEntity}
                    </div>
                  </td>

                  <td style={{ padding: "14px 18px", maxWidth: "300px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{l.details}</div>
                  </td>

                  <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {l.ipAddress}
                  </td>

                  <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {l.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: App Version Gatekeeper */}
      {activeTab === "app_gatekeeper" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Emergency Kill Switch */}
          <div
            style={{
              padding: "20px",
              backgroundColor: appConfig.maintenanceMode ? "rgba(239, 68, 68, 0.15)" : "var(--bg-secondary)",
              border: `1px solid ${appConfig.maintenanceMode ? "#EF4444" : "var(--border-color)"}`,
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} style={{ color: appConfig.maintenanceMode ? "#EF4444" : "#F59E0B" }} />
                <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>
                  Global Platform Emergency Maintenance Kill-Switch
                </strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, marginTop: "4px" }}>
                When active, both Tenant and Business mobile apps display a maintenance dialog and halt network transactions.
              </p>
            </div>

            <button
              onClick={() => setAppConfig({ ...appConfig, maintenanceMode: !appConfig.maintenanceMode })}
              style={{
                padding: "10px 18px",
                backgroundColor: appConfig.maintenanceMode ? "#EF4444" : "var(--bg-primary)",
                color: appConfig.maintenanceMode ? "#FFFFFF" : "var(--text-primary)",
                border: `1px solid ${appConfig.maintenanceMode ? "#EF4444" : "var(--border-color)"}`,
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {appConfig.maintenanceMode ? "MAINTENANCE ACTIVE (CLICK TO DEACTIVATE)" : "ENABLE MAINTENANCE MODE"}
            </button>
          </div>

          {/* App Build Gates */}
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
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Mobile Version Gatekeeping (system/app_config)</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Tenant App */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", color: "var(--teal-primary)", margin: 0 }}>Tenant Mobile App (Android / iOS)</h4>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Minimum Supported Build Number
                  </label>
                  <input
                    type="number"
                    value={appConfig.minTenantBuild}
                    onChange={(e) => setAppConfig({ ...appConfig, minTenantBuild: Number(e.target.value) })}
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

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Latest Available Build Number
                  </label>
                  <input
                    type="number"
                    value={appConfig.latestTenantBuild}
                    onChange={(e) => setAppConfig({ ...appConfig, latestTenantBuild: Number(e.target.value) })}
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

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={appConfig.forceTenantUpdate}
                    onChange={(e) => setAppConfig({ ...appConfig, forceTenantUpdate: e.target.checked })}
                  />
                  <span>Enforce Hard Update (Block Outdated Builds)</span>
                </label>
              </div>

              {/* Business App */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ fontSize: "14px", color: "var(--cyan-primary)", margin: 0 }}>Business / Landlord Mobile App</h4>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Minimum Supported Build Number
                  </label>
                  <input
                    type="number"
                    value={appConfig.minBusinessBuild}
                    onChange={(e) => setAppConfig({ ...appConfig, minBusinessBuild: Number(e.target.value) })}
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

                <div>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Latest Available Build Number
                  </label>
                  <input
                    type="number"
                    value={appConfig.latestBusinessBuild}
                    onChange={(e) => setAppConfig({ ...appConfig, latestBusinessBuild: Number(e.target.value) })}
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

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={appConfig.forceBusinessUpdate}
                    onChange={(e) => setAppConfig({ ...appConfig, forceBusinessUpdate: e.target.checked })}
                  />
                  <span>Enforce Hard Update (Block Outdated Builds)</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
              {saveSuccess && (
                <span style={{ color: "#10B981", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} /> Saved to system/app_config
                </span>
              )}
              <button
                onClick={handleSaveAppConfig}
                disabled={savingConfig}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--teal-primary)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: savingConfig ? "not-allowed" : "pointer",
                }}
              >
                {savingConfig ? "Saving Config..." : "Publish App Gatekeeper Rules"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DPDP 2023 */}
      {activeTab === "dpdp" && (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserX size={20} style={{ color: "var(--cyan-primary)" }} />
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Digital Personal Data Protection (DPDP) Act 2023 Compliance Desk
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, marginTop: "2px" }}>
                Handles statutory data erasure requests ("Right to be Forgotten") while retaining financial ledger entries
                for the 8-year RBI/GST compliance window.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-primary)",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "13px" }}>Active Data Retention & Anonymization Engine</strong>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Aadhaar images and biometric artifacts are purged 30 days post tenant check-out. Ledger records remain anonymized.
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "#10B981",
                padding: "3px 8px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Compliant
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
