"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchBusinessStaff, addBusinessStaffMember, fetchBusinessProperties, StaffMemberData, PropertyData } from "@/lib/data-service";
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

export default function BusinessStaffPage() {
  const { user, userProfile } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";
  const [staff, setStaff] = useState<StaffMemberData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Invite state
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("WARDEN");
  const [inviteProp, setInviteProp] = useState("");

  useEffect(() => {
    async function loadStaffData() {
      try {
        setLoading(true);
        const [staffList, propsList] = await Promise.all([
          fetchBusinessStaff(businessId),
          fetchBusinessProperties(businessId),
        ]);
        setStaff(staffList);
        setProperties(propsList);
        if (propsList.length > 0) {
          setInviteProp(propsList[0].name);
        }
      } catch (err) {
        console.error("Error loading business staff:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStaffData();
  }, [businessId]);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.assignedProperty || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !invitePhone.trim()) return;

    try {
      setSubmitting(true);
      const newStaffItem: Partial<StaffMemberData> = {
        name: inviteName.trim(),
        phone: invitePhone.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
        assignedProperty: inviteProp || properties[0]?.name || "Ram Nivas PG",
        propertyId: properties[0]?.id || "BUS0000001PNR001",
        status: "active",
      };

      const docId = await addBusinessStaffMember(businessId, newStaffItem);
      setStaff([
        {
          id: docId,
          name: newStaffItem.name!,
          phone: newStaffItem.phone!,
          email: newStaffItem.email || "No Email",
          role: newStaffItem.role!,
          assignedProperty: newStaffItem.assignedProperty,
          status: "active",
          canCheckIn: true,
          canCollectCash: newStaffItem.role === "OWNER" || newStaffItem.role === "MANAGER",
          canLogSubmeters: true,
          canEditPricing: newStaffItem.role === "OWNER",
          joinedDate: "Today",
        },
        ...staff,
      ]);

      setIsInviteModalOpen(false);
      setInviteName("");
      setInvitePhone("");
      setInviteEmail("");
    } catch (err: any) {
      alert("Failed to add staff member: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case "OWNER":
        return { label: "Business Owner", bg: "#FEF3C7", text: "#D97706" };
      case "MANAGER":
      case "PROPERTY_MANAGER":
        return { label: "Property Manager", bg: "#EEF2FF", text: "#4F46E5" };
      case "WARDEN":
        return { label: "On-Site Warden", bg: "#ECFDF5", text: "#059669" };
      case "ACCOUNTANT":
        return { label: "Accountant", bg: "#FEF3C7", text: "#D97706" };
      default:
        return { label: role, bg: "#F1F5F9", text: "#475569" };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "var(--teal-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Loading Staff &amp; Operational Team...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--teal-primary)",
                background: "rgba(13, 148, 136, 0.1)",
                padding: "2px 8px",
                borderRadius: "6px",
                textTransform: "uppercase",
              }}
            >
              Enterprise Governance
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Staff &amp; Wardens Directory
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Role-based operational access control for on-site wardens and property managers.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btnPrimary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          padding: "14px 18px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search staff by name, phone, or assigned property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              color: "#0F172A",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={16} color="#64748B" />
          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              fontSize: "13px",
              fontWeight: 600,
              background: "#FFFFFF",
            }}
          >
            <option value="all">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="MANAGER">Property Manager</option>
            <option value="WARDEN">Warden</option>
            <option value="ACCOUNTANT">Accountant</option>
          </select>
        </div>
      </div>

      {/* Staff Grid or Clean Empty State */}
      {filteredStaff.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              border: "1px dashed #CBD5E1",
            }}
          >
            <Users2 size={28} color="#94A3B8" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            No Staff Members Assigned Yet
          </h3>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "8px auto 20px auto", maxWidth: "460px" }}>
            Assign on-site wardens or property managers to Ram Nivas PG to delegate check-ins, record electricity submeter readings, and monitor resident requests.
          </p>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="btnPrimary"
            style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 700 }}
          >
            <Plus size={16} /> Add First Staff Member
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredStaff.map((member) => {
            const badge = getRoleBadge(member.role);
            return (
              <div
                key={member.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "#F1F5F9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "16px",
                          color: "#334155",
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                          {member.name}
                        </h3>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: badge.bg,
                            color: badge.text,
                            marginTop: "3px",
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: member.status === "active" ? "#DCFCE7" : "#F1F5F9",
                        color: member.status === "active" ? "#166534" : "#64748B",
                      }}
                    >
                      {member.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={14} color="#94A3B8" /> {member.phone}
                    </div>
                    {member.email && member.email !== "No Email" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Mail size={14} color="#94A3B8" /> {member.email}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building2 size={14} color="#94A3B8" /> {member.assignedProperty || "All Properties"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#64748B",
                  }}
                >
                  <span>Joined: {member.joinedDate || "Active"}</span>
                  <span style={{ fontWeight: 600, color: "var(--teal-primary)" }}>Active Permissions</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 100 }}>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 16px 0", color: "#0F172A" }}>Add Staff Member</h3>
            <form onSubmit={handleInviteSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Mobile Phone (+91) *</label>
                <input
                  type="text"
                  required
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Email ID (Optional)</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", background: "#FFFFFF" }}
                  >
                    <option value="WARDEN">On-Site Warden</option>
                    <option value="MANAGER">Property Manager</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Assigned Property</label>
                  <select
                    value={inviteProp}
                    onChange={(e) => setInviteProp(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", background: "#FFFFFF" }}
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    {properties.length === 0 && <option value="Ram Nivas PG">Ram Nivas PG</option>}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#64748B", fontWeight: 600, fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btnPrimary"
                  style={{ padding: "8px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}
                >
                  {submitting ? "Adding..." : "Confirm & Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
