import React from "react";
import {
  Gauge,
  Grid3X3,
  UsersRound,
  Building2,
  Users,
  CreditCard,
  Wrench,
  MessageSquareText,
  ShieldCheck,
  Scale,
  LockKeyhole,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Executive Pulse", icon: Gauge },
    { id: "bed-matrix", label: "Bed Matrix Master", icon: Grid3X3 },
    { id: "tenants", label: "Tenant Dossier", icon: Users },
    { id: "landlords", label: "PG Landlords", icon: UsersRound },
    { id: "properties", label: "Properties & Rooms", icon: Building2 },
    { id: "fintech", label: "Fintech & Gateway", icon: CreditCard },
    { id: "operations", label: "Operations & SLA", icon: Wrench },
    { id: "communications", label: "Communications Hub", icon: MessageSquareText },
    { id: "disputes", label: "Disputes Desk", icon: Scale },
    { id: "system", label: "System Governance", icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebarBrand">
        <div className="brandLogo">O</div>
        <div className="brandDetails">
          <strong>OneStay360</strong>
          <span>Admin Portal</span>
        </div>
      </div>
      <nav className="sidebarMenu" style={{ overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`sidebarMenuItem ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} className="menuIcon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebarFooter">
        <LockKeyhole size={14} />
        <span>Platform Cryptosecure</span>
      </div>
    </aside>
  );
}
