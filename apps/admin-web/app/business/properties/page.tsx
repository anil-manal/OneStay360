"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  fetchBusinessProperties,
  createBusinessProperty,
  PropertyData,
} from "@/lib/data-service";
import {
  Building2,
  Bed,
  MapPin,
  TrendingUp,
  Plus,
  Search,
  ExternalLink,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function BusinessPropertiesPage() {
  const { userProfile, user } = useAuth();
  const businessId = userProfile?.businessId || "BUS0000001";
  const businessName = userProfile?.businessName || "OneStay";

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New property form state
  const [newPropName, setNewPropName] = useState("");
  const [newPropCity, setNewPropCity] = useState("Pune");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropRooms, setNewPropRooms] = useState("4");
  const [newPropBeds, setNewPropBeds] = useState("12");
  const [newSinglePrice, setNewSinglePrice] = useState("16000");
  const [newDoublePrice, setNewDoublePrice] = useState("9000");
  const [newTriplePrice, setNewTriplePrice] = useState("7000");
  const [newWardenName, setNewWardenName] = useState("Ramesh Patel");
  const [newWardenPhone, setNewWardenPhone] = useState("+91 93593 03097");

  const loadProperties = async () => {
    setLoading(true);
    const data = await fetchBusinessProperties(businessId);
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, [businessId]);

  const totalBeds = properties.reduce((s, p) => s + p.totalBeds, 0);
  const totalOccupied = properties.reduce((s, p) => s + p.occupiedBeds, 0);
  const totalGmv = properties.reduce((s, p) => s + (p.monthlyGmv || 0), 0);
  const overallOccupancy = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || p.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;
    setIsSubmitting(true);

    try {
      await createBusinessProperty(businessId, {
        name: newPropName,
        city: newPropCity,
        address: newPropAddress,
        totalRooms: parseInt(newPropRooms) || 4,
        totalBeds: parseInt(newPropBeds) || 12,
        occupiedBeds: 0,
        wardenName: newWardenName,
        wardenPhone: newWardenPhone,
        pricing: {
          single: parseInt(newSinglePrice) || 16000,
          double: parseInt(newDoublePrice) || 9000,
          triple: parseInt(newTriplePrice) || 7000,
          securityDeposit: 5000,
          oneTimeMaintenance: 1000,
        },
      });

      await loadProperties();
      setIsAddModalOpen(false);
      setNewPropName("");
      setNewPropAddress("");
    } catch (err) {
      console.error("Error creating property:", err);
      alert("Failed to save property to Firestore: " + (err as any).message);
    } finally {
      setIsSubmitting(false);
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
                color: "#059669",
                background: "#ECFDF5",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              LIVE FIRESTORE DATABASE
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Business ID: <strong>{businessId}</strong> ({businessName})
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", margin: 0 }}>
            Properties & Inventory
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Real-time synchronization with your OneStay360 mobile business application.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={loadProperties}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              background: "#FFFFFF",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            <Plus size={16} /> Add New Property
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
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
            Active Properties
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {properties.length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Under {businessName}
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
            Total Bed Capacity
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#059669", marginTop: "6px" }}>
            {totalOccupied} / {totalBeds}
          </div>
          <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
            {overallOccupancy}% Overall Occupancy
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
            Monthly Realized GMV
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            ₹{totalGmv.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "4px" }}>
            Live tariff revenue calculation
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
            Available Beds
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#2563EB", marginTop: "6px" }}>
            {totalBeds - totalOccupied} Beds
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Ready for instant allocation</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "300px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by name, address, ID..."
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

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
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
            <option value="all">All Cities</option>
            <option value="Pune">Pune</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "#64748B" }}>
          Showing <b>{filteredProperties.length}</b> live properties in Firestore
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Loading Properties from Database...</div>
          <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>Connecting to Firestore businesses/{businessId}/properties</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <Building2 size={48} color="#94A3B8" style={{ margin: "0 auto 16px auto" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
            No Properties Found
          </h3>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 20px 0" }}>
            Register your first PG property to start managing rooms, beds, and rent realization.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: "10px 20px",
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Add Property Now
          </button>
        </div>
      )}

      {/* Property Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
        {filteredProperties.map((prop) => {
          const occPercent = prop.totalBeds > 0 ? Math.round((prop.occupiedBeds / prop.totalBeds) * 100) : 0;
          return (
            <div
              key={prop.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#059669",
                        background: "#ECFDF5",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {prop.id}
                    </span>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: "6px 0 2px 0" }}>
                      {prop.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} color="#94A3B8" /> {prop.address}, {prop.city} {prop.pincode ? `(${prop.pincode})` : ""}
                    </div>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div style={{ marginTop: "18px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>
                      Occupancy: {prop.occupiedBeds} of {prop.totalBeds} Beds
                    </span>
                    <span style={{ fontWeight: 800, color: "#059669" }}>{occPercent}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${occPercent}%`,
                        height: "100%",
                        background: occPercent > 85 ? "#059669" : occPercent > 50 ? "#2563EB" : "#F59E0B",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>

                {/* Property Detail Badges */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    background: "#F8FAFC",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Tariff Plan</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>
                      Double: ₹{prop.pricing?.double?.toLocaleString("en-IN") || "9,000"}/mo
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Total Capacity</div>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>
                      {prop.totalRooms} Rooms • {prop.totalBeds} Beds
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Warden / Manager</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>{prop.wardenName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Contact Phone</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>{prop.wardenPhone}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
                <Link
                  href={`/business/property/${prop.id}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    background: "#059669",
                    color: "#FFFFFF",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  <Bed size={15} /> Bed Matrix & Ops
                </Link>
                <Link
                  href={`/business/billing`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#334155",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                    textDecoration: "none",
                  }}
                >
                  Billing
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Property Modal */}
      {isAddModalOpen && (
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
              maxWidth: "560px",
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
                <Building2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  Add New PG Property
                </h3>
                <div style={{ fontSize: "12px", color: "#64748B" }}>
                  Saves directly to Firestore under <strong>{businessId}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddProperty}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ram Nivas PG 2"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
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
                    City *
                  </label>
                  <select
                    value={newPropCity}
                    onChange={(e) => setNewPropCity(e.target.value)}
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
                    <option value="Pune">Pune</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Total Beds
                  </label>
                  <input
                    type="number"
                    value={newPropBeds}
                    onChange={(e) => setNewPropBeds(e.target.value)}
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
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Street Address & Locality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near IT Park Phase 1, Hinjawadi"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Single Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={newSinglePrice}
                    onChange={(e) => setNewSinglePrice(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Double Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={newDoublePrice}
                    onChange={(e) => setNewDoublePrice(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Triple Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={newTriplePrice}
                    onChange={(e) => setNewTriplePrice(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #CBD5E1", borderRadius: "6px", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  disabled={isSubmitting}
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
                  {isSubmitting ? "Creating in Firestore..." : "Create Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
