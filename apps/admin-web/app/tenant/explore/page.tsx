"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAllExploreProperties,
  submitEnrollmentRequest,
  PropertyData,
} from "@/lib/data-service";
import {
  Search,
  MapPin,
  Filter,
  Bed,
  Wifi,
  Utensils,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
  Eye,
  Camera,
  Sparkles,
  Phone,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function TenantExplorePage() {
  const { user, userProfile } = useAuth();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedSharing, setSelectedSharing] = useState<number | "all">("all");

  // Selected PG Detail Modal
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);

  // Booking / Enrollment Request State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSharing, setBookingSharing] = useState(2);
  const [bookingAC, setBookingAC] = useState(true);
  const [bookingMoveInDate, setBookingMoveInDate] = useState("2026-12-01");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAllExploreProperties(selectedCity);
      setProperties(data);
      setLoading(false);
    }
    load();
  }, [selectedCity]);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender =
      selectedGender === "all" ||
      (p.rules?.genderAllowed && p.rules.genderAllowed.toLowerCase().includes(selectedGender.toLowerCase()));

    const matchesSharing =
      selectedSharing === "all" ||
      (selectedSharing === 1 && p.pricing?.single) ||
      (selectedSharing === 2 && p.pricing?.double) ||
      (selectedSharing === 3 && p.pricing?.triple);

    return matchesSearch && matchesGender && matchesSharing;
  });

  const handleOpenDetail = (prop: PropertyData) => {
    setSelectedProperty(prop);
    setBookingSharing(prop.pricing?.double ? 2 : 3);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !user) return;
    setIsSubmittingBooking(true);

    try {
      const reqId = await submitEnrollmentRequest({
        tenantUid: user.uid,
        tenantName: userProfile?.displayName || user.displayName || "Resident",
        tenantPhone: user.phoneNumber || "+91 93593 03097",
        tenantEmail: user.email || "resident@onestay360.in",
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        businessId: selectedProperty.businessId,
        sharingType: bookingSharing,
        needAC: bookingAC,
        expectedMoveInDate: bookingMoveInDate,
      });

      setBookingSuccessId(reqId);
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingSuccessId(null);
        setSelectedProperty(null);
      }, 3000);
    } catch (err: any) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Hero Search Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: "24px",
          padding: "36px 32px",
          color: "#FFFFFF",
          marginBottom: "32px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
        }}
      >
        <div style={{ maxWidth: "700px", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(13, 148, 136, 0.2)",
              border: "1px solid rgba(13, 148, 136, 0.4)",
              color: "#5EEAD4",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} /> 100% VERIFIED CO-LIVING &amp; PGS
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0, letterSpacing: "-0.8px", lineHeight: 1.2 }}>
            Find Your Ideal PG with 360° Tours &amp; Zero Brokerage
          </h1>
          <p style={{ fontSize: "15px", color: "#94A3B8", margin: "8px 0 0 0" }}>
            Explore verified accommodations with transparent tariffs, daily food menus, and instant online bed reservations.
          </p>
        </div>

        {/* Search Bar Controls */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ position: "relative", flex: 2, minWidth: "260px" }}>
            <Search
              size={18}
              color="#94A3B8"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by locality, PG name, or landmark (e.g. Hinjawadi, Bodakdev)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                color: "#0F172A",
                outline: "none",
              }}
            />
          </div>

          <div style={{ height: "30px", width: "1px", background: "#E2E8F0" }} />

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              background: "#F8FAFC",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">📍 All Cities</option>
            <option value="Pune">Pune</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", marginRight: "4px" }}>
            Gender:
          </span>
          {["all", "Co-ed", "Boys", "Girls"].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: selectedGender === g ? "1px solid #0D9488" : "1px solid #E2E8F0",
                background: selectedGender === g ? "#F0FDFA" : "#FFFFFF",
                color: selectedGender === g ? "#0D9488" : "#64748B",
                cursor: "pointer",
              }}
            >
              {g === "all" ? "All Genders" : g}
            </button>
          ))}

          <div style={{ width: "1px", height: "20px", background: "#CBD5E1", margin: "0 6px" }} />

          <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", marginRight: "4px" }}>
            Sharing:
          </span>
          {[
            { label: "All", val: "all" },
            { label: "1 (Private)", val: 1 },
            { label: "2 Sharing", val: 2 },
            { label: "3 Sharing", val: 3 },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setSelectedSharing(s.val as any)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: selectedSharing === s.val ? "1px solid #0D9488" : "1px solid #E2E8F0",
                background: selectedSharing === s.val ? "#F0FDFA" : "#FFFFFF",
                color: selectedSharing === s.val ? "#0D9488" : "#64748B",
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "13px", color: "#64748B" }}>
          Showing <b>{filteredProperties.length}</b> verified PG properties
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>Searching live properties in Firestore...</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredProperties.map((prop) => {
            const minPrice =
              prop.pricing?.triple || prop.pricing?.double || prop.pricing?.single || 7000;
            return (
              <div
                key={prop.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div>
                  {/* Property Cover Image & Badges */}
                  <div style={{ position: "relative", height: "200px", width: "100%", background: "#CBD5E1" }}>
                    <img
                      src={
                        prop.images?.[0] ||
                        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={prop.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          background: "rgba(15, 23, 42, 0.85)",
                          backdropFilter: "blur(4px)",
                          color: "#5EEAD4",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ShieldCheck size={12} /> VERIFIED
                      </span>
                      <span
                        style={{
                          background: "rgba(13, 148, 136, 0.9)",
                          backdropFilter: "blur(4px)",
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Camera size={12} /> 360° TOUR
                      </span>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(4px)",
                        color: "#FFFFFF",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      From ₹{minPrice.toLocaleString("en-IN")}/mo
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        {prop.name}
                      </h3>
                    </div>

                    <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", marginBottom: "14px" }}>
                      <MapPin size={13} color="#94A3B8" /> {prop.address}, {prop.city}
                    </div>

                    {/* Amenities Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "11px", background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Wifi size={11} color="#0D9488" /> High-speed Wi-Fi
                      </span>
                      <span style={{ fontSize: "11px", background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Utensils size={11} color="#D97706" /> 3 Meals Included
                      </span>
                      <span style={{ fontSize: "11px", background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Zap size={11} color="#2563EB" /> Power Backup
                      </span>
                    </div>

                    {/* Tariff Pills */}
                    <div
                      style={{
                        background: "#F8FAFC",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#64748B" }}>Double: </span>
                        <strong style={{ color: "#0F172A" }}>
                          ₹{prop.pricing?.double?.toLocaleString("en-IN") || "9,000"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748B" }}>Triple: </span>
                        <strong style={{ color: "#0F172A" }}>
                          ₹{prop.pricing?.triple?.toLocaleString("en-IN") || "7,000"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748B" }}>Deposit: </span>
                        <strong style={{ color: "#0D9488" }}>₹5,000</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleOpenDetail(prop)}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "10px",
                      background: "#0D9488",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(13, 148, 136, 0.2)",
                    }}
                  >
                    View Details &amp; Book Bed <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PG Detail & Enrollment Modal */}
      {selectedProperty && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(6px)",
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
              borderRadius: "20px",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                position: "relative",
                height: "240px",
                background: "#0F172A",
              }}
            >
              <img
                src={
                  selectedProperty.images?.[0] ||
                  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
                }
                alt={selectedProperty.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              />
              <button
                onClick={() => {
                  setSelectedProperty(null);
                  setIsBookingOpen(false);
                }}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "20px",
                  color: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    background: "#0D9488",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {selectedProperty.city}
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 900, margin: "6px 0 2px 0" }}>
                  {selectedProperty.name}
                </h2>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>{selectedProperty.address}</div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Tariff Comparison Table */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 12px 0" }}>
                  Monthly Rent &amp; Sharing Tariffs
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#F8FAFC",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700 }}>Single (Private)</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: "4px 0" }}>
                      ₹{selectedProperty.pricing?.single?.toLocaleString("en-IN") || "16,000"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748B" }}>per month</div>
                  </div>

                  <div
                    style={{
                      border: "2px solid #0D9488",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#F0FDFA",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#0D9488", fontWeight: 800 }}>Double Sharing ⭐</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#0D9488", margin: "4px 0" }}>
                      ₹{selectedProperty.pricing?.double?.toLocaleString("en-IN") || "9,000"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#0D9488" }}>per month (Most Popular)</div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#F8FAFC",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 700 }}>Triple Sharing</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: "4px 0" }}>
                      ₹{selectedProperty.pricing?.triple?.toLocaleString("en-IN") || "7,000"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748B" }}>per month</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
                  About this Property
                </h4>
                <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                  {selectedProperty.description ||
                    "Ram Nivas PG offers clean, well-maintained rooms in a safe and peaceful environment. Ideal for students and working professionals seeking hassle-free living. Facilities include regular housekeeping, reliable water and power supply, home-style food, and good connectivity to offices, colleges, and public transport."}
                </p>
              </div>

              {/* Booking Action Button / Form */}
              {!isBookingOpen ? (
                <div style={{ display: "flex", gap: "10px", borderTop: "1px solid #F1F5F9", paddingTop: "20px" }}>
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "10px",
                      background: "#0D9488",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "15px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.25)",
                    }}
                  >
                    <Bed size={18} /> Request Bed Reservation
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleEnrollSubmit}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: "14px",
                    padding: "20px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 12px 0" }}>
                    Select Your Stay Preferences
                  </h4>

                  {bookingSuccessId && (
                    <div
                      style={{
                        background: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        color: "#166534",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "16px",
                      }}
                    >
                      🎉 Reservation Request Dispatched! Reference: {bookingSuccessId}. The PG manager will confirm your bed.
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                        Sharing Density
                      </label>
                      <select
                        value={bookingSharing}
                        onChange={(e) => setBookingSharing(Number(e.target.value))}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                      >
                        <option value={1}>Single (Private Room)</option>
                        <option value={2}>2 Sharing Room</option>
                        <option value={3}>3 Sharing Room</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                        Expected Move-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingMoveInDate}
                        onChange={(e) => setBookingMoveInDate(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
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
                      disabled={isSubmittingBooking}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#0D9488",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {isSubmittingBooking ? "Submitting Request..." : "Confirm & Send to Host"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
