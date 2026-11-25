"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface LandlordProperty {
  id: string;
  name: string;
  city: string;
  address: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  monthlyGmv: number;
  pendingMeterReadings: number;
  pendingCheckIns: number;
  wardenName: string;
  wardenPhone: string;
  status: "active" | "full" | "maintenance";
}

const INITIAL_PROPERTIES: LandlordProperty[] = [
  {
    id: "PROP_AMD_032",
    name: "Zolo CyberPark Premier Residency",
    city: "Ahmedabad",
    address: "Plot 42, SG Highway, Bodakdev",
    totalRooms: 12,
    totalBeds: 36,
    occupiedBeds: 31,
    monthlyGmv: 279000,
    pendingMeterReadings: 2,
    pendingCheckIns: 1,
    wardenName: "Ramesh Patel",
    wardenPhone: "+91 98250 11223",
    status: "active",
  },
  {
    id: "PROP_PNQ_104",
    name: "Zolo TechZone Luxury Stays",
    city: "Pune",
    address: "Phase 1, Hinjewadi IT Park",
    totalRooms: 18,
    totalBeds: 54,
    occupiedBeds: 49,
    monthlyGmv: 441000,
    pendingMeterReadings: 0,
    pendingCheckIns: 2,
    wardenName: "Sanjay Deshmukh",
    wardenPhone: "+91 99220 33445",
    status: "active",
  },
  {
    id: "PROP_BLR_208",
    name: "Zolo Nexus Hive Co-Living",
    city: "Bangalore",
    address: "Green Glen Layout, Bellandur",
    totalRooms: 24,
    totalBeds: 72,
    occupiedBeds: 68,
    monthlyGmv: 680000,
    pendingMeterReadings: 3,
    pendingCheckIns: 0,
    wardenName: "Venkat Rao",
    wardenPhone: "+91 98450 55667",
    status: "active",
  },
  {
    id: "PROP_HYD_315",
    name: "Zolo Silicon Heights",
    city: "Hyderabad",
    address: "Financial District, Gachibowli",
    totalRooms: 26,
    totalBeds: 78,
    occupiedBeds: 63,
    monthlyGmv: 598500,
    pendingMeterReadings: 1,
    pendingCheckIns: 1,
    wardenName: "Kalyan Reddy",
    wardenPhone: "+91 98660 77889",
    status: "active",
  },
];

export default function BusinessPropertiesPage() {
  const [properties, setProperties] = useState<LandlordProperty[]>(INITIAL_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New property form state
  const [newPropName, setNewPropName] = useState("");
  const [newPropCity, setNewPropCity] = useState("Pune");
  const [newPropAddress, setNewPropAddress] = useState("");
  const [newPropRooms, setNewPropRooms] = useState("10");
  const [newPropBeds, setNewPropBeds] = useState("30");
  const [newWardenName, setNewWardenName] = useState("");
  const [newWardenPhone, setNewWardenPhone] = useState("");

  const totalBeds = properties.reduce((s, p) => s + p.totalBeds, 0);
  const totalOccupied = properties.reduce((s, p) => s + p.occupiedBeds, 0);
  const totalGmv = properties.reduce((s, p) => s + p.monthlyGmv, 0);
  const overallOccupancy = Math.round((totalOccupied / totalBeds) * 100);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || p.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    const newId = `PROP_${newPropCity.slice(0, 3).toUpperCase()}_${Math.floor(100 + Math.random() * 900)}`;
    const newProperty: LandlordProperty = {
      id: newId,
      name: newPropName,
      city: newPropCity,
      address: newPropAddress,
      totalRooms: parseInt(newPropRooms) || 10,
      totalBeds: parseInt(newPropBeds) || 30,
      occupiedBeds: 0,
      monthlyGmv: 0,
      pendingMeterReadings: 0,
      pendingCheckIns: 0,
      wardenName: newWardenName || "Unassigned",
      wardenPhone: newWardenPhone || "-",
      status: "active",
    };

    setProperties([newProperty, ...properties]);
    setIsAddModalOpen(false);
    setNewPropName("");
    setNewPropAddress("");
    setNewWardenName("");
    setNewWardenPhone("");
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
              PORTFOLIO MANAGEMENT
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>{properties.length} Active Branches</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", margin: 0 }}>
            Properties & Inventory
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Manage room bed layouts, pricing plans, submeter meters, and local resident directories.
          </p>
        </div>

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
            Total Properties
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            {properties.length}
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>Across 4 Major Metros</div>
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
            Portfolio Monthly GMV
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: "#0F172A", marginTop: "6px" }}>
            ₹{totalGmv.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "4px" }}>
            +4.2% from previous month
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
            Vacant Beds Available
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
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Pune">Pune</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>

        <div style={{ fontSize: "13px", color: "#64748B" }}>
          Showing <b>{filteredProperties.length}</b> properties
        </div>
      </div>

      {/* Property Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
        {filteredProperties.map((prop) => {
          const occPercent = Math.round((prop.occupiedBeds / prop.totalBeds) * 100);
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
                      <MapPin size={13} color="#94A3B8" /> {prop.address}, {prop.city}
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
                        background: occPercent > 85 ? "#059669" : occPercent > 60 ? "#2563EB" : "#F59E0B",
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
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Monthly GMV</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>
                      ₹{prop.monthlyGmv.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Total Rooms</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>{prop.totalRooms} Rooms</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>On-Site Warden</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>{prop.wardenName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>Pending Meters</div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: prop.pendingMeterReadings > 0 ? "#EA580C" : "#059669",
                      }}
                    >
                      {prop.pendingMeterReadings > 0 ? `${prop.pendingMeterReadings} Needs Log` : "Up to date"}
                    </div>
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
                  Register a new branch under your landlord partner account
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
                  placeholder="e.g. Zolo Silicon Elite Residency"
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
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Initial Bed Capacity
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
                  Street Address & Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Symbiosis Gate, Viman Nagar"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Warden Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Manoj Sharma"
                    value={newWardenName}
                    onChange={(e) => setNewWardenName(e.target.value)}
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
                    Warden Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={newWardenPhone}
                    onChange={(e) => setNewWardenPhone(e.target.value)}
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
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
