"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Overview from "@/components/dashboard/Overview";
import BedMatrixConsole from "@/components/inventory/BedMatrixConsole";
import TenantMasterConsole from "@/components/tenants/TenantMasterConsole";
import BusinessConsole from "@/components/businesses/BusinessConsole";
import PropertyConsole from "@/components/properties/PropertyConsole";
import FintechConsole from "@/components/fintech/FintechConsole";
import OperationsConsole from "@/components/operations/OperationsConsole";
import CommunicationsConsole from "@/components/communications/CommunicationsConsole";
import DisputeConsole from "@/components/support/DisputeConsole";
import SystemGovernanceConsole from "@/components/system/SystemGovernanceConsole";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  // Sync tab state with local storage for session recovery
  useEffect(() => {
    const savedTab = localStorage.getItem("onestay360_admin_active_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
    setMounted(true);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("onestay360_admin_active_tab", tab);
  };

  if (!mounted) {
    return (
      <div className="fullscreenLoader">
        <div className="spinner"></div>
        <p>Initializing OneStay360 Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="adminWorkspace">
      <Sidebar currentTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="workspaceMain" id="top">
        <header className="workspaceHeader">
          <div className="headerLeft">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--teal-primary)", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back to Public Website
              </Link>
            </div>
            <h1>System Operations Control</h1>
            <p className="subtext">Central dashboard for Tenant App status, Landlord audits, and revenue ledgers.</p>
          </div>
          <div className="headerRight">
            <span className="liveIndicator">
              <span className="pulseCircle"></span>
              Live Operations
            </span>
          </div>
        </header>

        <section className="workspaceContent">
          {activeTab === "overview" && <Overview />}
          {activeTab === "bed-matrix" && <BedMatrixConsole />}
          {activeTab === "tenants" && <TenantMasterConsole />}
          {activeTab === "landlords" && <BusinessConsole />}
          {activeTab === "properties" && <PropertyConsole />}
          {activeTab === "fintech" && <FintechConsole />}
          {activeTab === "operations" && <OperationsConsole />}
          {activeTab === "communications" && <CommunicationsConsole />}
          {activeTab === "disputes" && <DisputeConsole />}
          {activeTab === "system" && <SystemGovernanceConsole />}
        </section>
      </main>
    </div>
  );
}
