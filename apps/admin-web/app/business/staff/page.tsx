"use client";

import React, { useState } from "react";
import {
  Users2,
  Plus,
  Shield,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Clock,
  MoreVertical,
  KeyRound,
  UserCheck,
  Search,
  Filter,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "PROPERTY_MANAGER" | "WARDEN" | "ACCOUNTANT" | "MAINTENANCE";
  assignedProperty: string;
  propertyId: string;
  status: "active" | "inactive";
  canCheckIn: boolean;
  canCollectCash: boolean;
  canLogSubmeters: boolean;
  canEditPricing: boolean;
  joinedDate: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "STF_001",
    name: "Ramesh Patel",
    phone: "+91 98250 11223",
    email: "ramesh.p@zololiving.com",
    role: "WARDEN",
    assignedProperty: "Zolo CyberPark Premier",
    propertyId: "PROP_AMD_032",
    status: "active",
    canCheckIn: true,
    canCollectCash: true,
    canLogSubmeters: true,
    canEditPricing: false,
    joinedDate: "15 Jan 2025",
  },
  {
    id: "STF_002",
    name: "Sanjay Deshmukh",
    phone: "+91 99220 33445",
    email: "sanjay.d@zololiving.com",
    role: "WARDEN",
    assignedProperty: "Zolo TechZone Luxury",
    propertyId: "PROP_PNQ_104",
    status: "active",
    canCheckIn: true,
    canCollectCash: true,
    canLogSubmeters: true,
    canEditPricing: false,
    joinedDate: "10 Mar 2025",
  },
  {
    id: "STF_003",
    name: "Vikram Singhania",
    phone: "+91 98110 44556",
    email: "vikram.s@zololiving.com",
    role: "PROPERTY_MANAGER",
    assignedProperty: "All Bangalore Properties",
    propertyId: "ALL_BLR",
    status: "active",
    canCheckIn: true,
    canCollectCash: true,
    canLogSubmeters: true,
    canEditPricing: true,
    joinedDate: "01 Nov 2024",
  },
  {
    id: "STF_004",
    name: "Anjali Gupta",
    phone: "+91 98450 66778",
    email: "finance@zololiving.com",
    role: "ACCOUNTANT",
    assignedProperty: "All Properties (Headquarters)",
    propertyId: "ALL_CHAIN",
    status: "active",
    canCheckIn: false,
    canCollectCash: true,
    canLogSubmeters: false,
    canEditPricing: false,
    joinedDate: "20 Feb 2025",
  },
];

export default function BusinessStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite state
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<StaffMember["role"]>("WARDEN");
  const [inviteProp, setInviteProp] = useState("Zolo CyberPark Premier");
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [canCollectCash, setCanCollectCash] = useState(true);
  const [canLogSubmeters, setCanLogSubmeters] = useState(true);
  const [canEditPricing, setCanEditPricing] = useState(false);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.assignedProperty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !invitePhone) return;

    const newStaff: StaffMember = {
      id: `STF_${Math.floor(100 + Math.random() * 900)}`,
      name: inviteName,
      phone: invitePhone,
      email: inviteEmail || `${inviteName.toLowerCase().replace(/\s+/g, ".")}@zololiving.com`,
      role: inviteRole,
      assignedProperty: inviteProp,
      propertyId: "PROP_CUSTOM",
      status: "active",
      canCheckIn,
      canCollectCash,
      canLogSubmeters,
      canEditPricing,
      joinedDate: "Today",
    };

    setStaff([newStaff, ...staff]);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInvitePhone("");
    setInviteEmail("");
  };

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "PROPERTY_MANAGER":
        return { label: "Property Manager", bg: "#EEF2FF", text: "#4F46E5" };
      case "WARDEN":
        return { label: "On-Site Warden", bg: "#ECFDF5", text: "#059669" };
      case "ACCOUNTANT":
        return { label: "Accountant", bg: "#FEF3C7", text: "#D97706" };
      case "MAINTENANCE":
        return { label: "Maintenance", bg: "#F1F5F9", text: "#475569" };
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header */}
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
              TEAM & DELEGATION
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>RBAC Access Control</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", margin: 0 }}>
            Staff & Wardens
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Delegate day-to-day PG management, tenant check-in approvals, submeter logging, and cash collection.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
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
          <Plus size={16} /> Invite Staff Member
        </button>
      </div>

      {/* Aggregate Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
            Active Personnel
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {staff.filter((s) => s.status === "active").length}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px" }}>All 100% verified & active</div>
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
            On-Site Wardens
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#059669", marginTop: "6px" }}>
            {staff.filter((s) => s.role === "WARDEN").length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Managing daily bed allocation & meters
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
            Property Managers
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#2563EB", marginTop: "6px" }}>
            {staff.filter((s) => s.role === "PROPERTY_MANAGER").length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Full branch operational authority</div>
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
            Cash Recorders
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#D97706", marginTop: "6px" }}>
            {staff.filter((s) => s.canCollectCash).length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Authorized to accept cash receipts</div>
        </div>
      </div>

      {/* Filter and Search */}
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
        <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search staff by name, phone, property..."
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

        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "WARDEN", "PROPERTY_MANAGER", "ACCOUNTANT"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: roleFilter === r ? "1px solid #059669" : "1px solid #E2E8F0",
                background: roleFilter === r ? "#ECFDF5" : "#FFFFFF",
                color: roleFilter === r ? "#059669" : "#64748B",
                cursor: "pointer",
              }}
            >
              {r === "all" ? "All Roles" : r.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
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
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Staff Member</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Role</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Assigned Property</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Operational Permissions</th>
              <th style={{ padding: "14px 18px", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "14px 18px", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => {
              const roleBadge = getRoleBadge(member.role);
              return (
                <tr key={member.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 700, color: "#0F172A" }}>{member.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={11} color="#94A3B8" /> {member.phone}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: roleBadge.bg,
                        color: roleBadge.text,
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {roleBadge.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 600, color: "#334155" }}>{member.assignedProperty}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>Joined: {member.joinedDate}</div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {member.canCheckIn && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "#F1F5F9",
                            color: "#334155",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Check-in / Out
                        </span>
                      )}
                      {member.canLogSubmeters && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "#FEF3C7",
                            color: "#92400E",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Submeters
                        </span>
                      )}
                      {member.canCollectCash && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "#DCFCE7",
                            color: "#166534",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Cash Rec
                        </span>
                      )}
                      {member.canEditPricing && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "#EDE9FE",
                            color: "#5B21B6",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          Pricing Edit
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
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
                      <CheckCircle2 size={12} /> ACTIVE
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <button
                      onClick={() => alert(`Permissions modal opened for ${member.name}`)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      Edit Access
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
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
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                }}
              >
                <Users2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Invite Staff / Warden
                </h3>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  They will receive an SMS invitation with one-time login credentials
                </div>
              </div>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Shinde"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Role *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as StaffMember["role"])}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "13px",
                      outline: "none",
                      background: "#FFFFFF",
                    }}
                  >
                    <option value="WARDEN">On-Site Warden</option>
                    <option value="PROPERTY_MANAGER">Property Manager</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="MAINTENANCE">Maintenance Supervisor</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Assigned Property Branch *
                </label>
                <select
                  value={inviteProp}
                  onChange={(e) => setInviteProp(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Zolo CyberPark Premier">Zolo CyberPark Premier (Ahmedabad)</option>
                  <option value="Zolo TechZone Luxury">Zolo TechZone Luxury (Pune)</option>
                  <option value="Zolo Nexus Hive">Zolo Nexus Hive (Bangalore)</option>
                  <option value="Zolo Silicon Heights">Zolo Silicon Heights (Hyderabad)</option>
                </select>
              </div>

              {/* Permissions Checkboxes */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
                  Access Permissions
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <input
                      type="checkbox"
                      checked={canCheckIn}
                      onChange={(e) => setCanCheckIn(e.target.checked)}
                    />
                    Check-in / Check-out
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <input
                      type="checkbox"
                      checked={canLogSubmeters}
                      onChange={(e) => setCanLogSubmeters(e.target.checked)}
                    />
                    Submeter Logging
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <input
                      type="checkbox"
                      checked={canCollectCash}
                      onChange={(e) => setCanCollectCash(e.target.checked)}
                    />
                    Collect Cash Receipts
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
                    <input
                      type="checkbox"
                      checked={canEditPricing}
                      onChange={(e) => setCanEditPricing(e.target.checked)}
                    />
                    Edit Bed Rates
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
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
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
