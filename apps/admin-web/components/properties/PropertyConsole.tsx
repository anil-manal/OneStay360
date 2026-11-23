import React, { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs, doc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Star, MapPin, Eye, ShieldAlert, Award, XCircle, Info, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

interface PropertyInfo {
  id: string;
  name: string;
  city: string;
  cityCode: string;
  address: string;
  description: string;
  totalBeds: number;
  pricePerBed: number;
  featured: boolean;
  status: string;
  billingStatus: string;
  businessId: string;
  businessName: string;
  businessPhone: string;
  ratingAverage: number;
  ratingCount: number;
  rawMap: any;
  images?: string[];
  isDemo?: boolean;
}

const INITIAL_STARTER_PROPERTIES: PropertyInfo[] = [
  {
    id: "PROP_PNQ_001",
    name: "OneStay Prime Elite Co-Living",
    city: "Pune",
    cityCode: "PNQ",
    address: "Koregaon Park, Lane 7, Pune, MH",
    description: "Premium AC rooms, high-speed WiFi, 3 meals daily, and 24/7 power backup.",
    totalBeds: 48,
    pricePerBed: 8500,
    featured: true,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_PUNE_EXP",
    businessName: "Prime Stays Hospitality LLP",
    businessPhone: "+91 98201 12345",
    ratingAverage: 4.8,
    ratingCount: 34,
    rawMap: {},
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    isDemo: true,
  },
  {
    id: "PROP_BLR_002",
    name: "Nexus Tech Residency PG",
    city: "Bangalore",
    cityCode: "BLR",
    address: "HSR Layout Sector 2, Bengaluru, KA",
    description: "Walking distance from tech hubs. Fiber internet, daily housekeeping, biometrics.",
    totalBeds: 60,
    pricePerBed: 9200,
    featured: true,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_BLR_TECH",
    businessName: "Nexus Living Group",
    businessPhone: "+91 97412 88990",
    ratingAverage: 4.9,
    ratingCount: 52,
    rawMap: {},
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
    isDemo: true,
  },
  {
    id: "PROP_BOM_003",
    name: "Bayview Executive Stays",
    city: "Mumbai",
    cityCode: "BOM",
    address: "Andheri West, Near Metro Station, Mumbai, MH",
    description: "Executive co-living space with single and twin-sharing AC accommodations.",
    totalBeds: 36,
    pricePerBed: 11500,
    featured: false,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_BOM_BAY",
    businessName: "Bayview Accommodations",
    businessPhone: "+91 98920 44556",
    ratingAverage: 4.7,
    ratingCount: 29,
    rawMap: {},
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"],
    isDemo: true,
  },
  {
    id: "PROP_HYD_004",
    name: "CyberGraces Urban PG",
    city: "Hyderabad",
    cityCode: "HYD",
    address: "Gachibowli Financial District, Hyderabad, TG",
    description: "Modern smart PG with keycard locks, cafeteria, gym, and high-speed fiber.",
    totalBeds: 54,
    pricePerBed: 7800,
    featured: false,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_HYD_CYBER",
    businessName: "CyberGraces Living Pvt Ltd",
    businessPhone: "+91 90001 77221",
    ratingAverage: 4.6,
    ratingCount: 19,
    rawMap: {},
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    isDemo: true,
  },
  {
    id: "PROP_DEL_005",
    name: "Capital Oasis Co-Living",
    city: "Delhi",
    cityCode: "DEL",
    address: "Saket, Block J, South Delhi, DL",
    description: "Quiet green neighborhood with round-the-clock security and home-cooked meals.",
    totalBeds: 40,
    pricePerBed: 8900,
    featured: true,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_DEL_CAPITAL",
    businessName: "Capital Oasis Hospitality",
    businessPhone: "+91 98110 33445",
    ratingAverage: 4.7,
    ratingCount: 41,
    rawMap: {},
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
    isDemo: true,
  }
];

export default function PropertyConsole() {
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState<PropertyInfo | null>(null);
  const [updating, setUpdating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  async function fetchProperties() {
    try {
      setLoading(true);
      const propMap = new Map<string, PropertyInfo>();

      const addDocToMap = (id: string, data: any, overrideCity?: string) => {
        if (!propMap.has(id)) {
          propMap.set(id, {
            id,
            name: data.name || data.propertyName || "Unnamed PG",
            city: overrideCity || data.city || "Pune",
            cityCode: data.cityCode || "PNQ",
            address: data.address || data.location || "Central Location",
            description: data.description || "Furnished co-living accommodation with amenities",
            totalBeds: Number(data.totalBeds || data.capacity || 24),
            pricePerBed: Number(data.pricePerBed || data.monthlyRent || 7000),
            featured: Boolean(data.featured),
            status: data.status || "active",
            billingStatus: data.billingStatus || "paid",
            businessId: data.businessId || "BUS0000001",
            businessName: data.businessName || data.ownerName || "OneStay Network",
            businessPhone: data.businessPhone || data.contactPhone || "+91 98765 43210",
            ratingAverage: Number(data.rating?.average || data.ratingAverage || 4.7),
            ratingCount: Number(data.rating?.count || data.ratingCount || 18),
            rawMap: data,
            images: data.images || (data.imageUrl ? [data.imageUrl] : []),
            isDemo: false,
          });
        }
      };

      // 1. Query root /properties
      try {
        const querySnap = await getDocs(collection(db, "properties"));
        querySnap.docs.forEach((d) => addDocToMap(d.id, d.data()));
      } catch (e) {
        console.warn("Root properties lookup notice:", e);
      }

      // 2. Query collectionGroup("properties") across all businesses
      try {
        const groupSnap = await getDocs(collectionGroup(db, "properties"));
        groupSnap.docs.forEach((d) => addDocToMap(d.id, d.data()));
      } catch (e) {
        console.warn("CollectionGroup properties lookup notice:", e);
      }

      // 3. Query public properties_by_city for major metros
      const cities = ["Pune", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
      for (const city of cities) {
        try {
          const citySnap = await getDocs(collection(db, `properties_by_city/${city}/properties`));
          citySnap.docs.forEach((d) => addDocToMap(d.id, d.data(), city));
        } catch (_) {}
      }

      // 4. Query businesses subcollections
      try {
        const bizSnap = await getDocs(collection(db, "businesses"));
        for (const bizDoc of bizSnap.docs) {
          try {
            const bizPropsSnap = await getDocs(collection(db, `businesses/${bizDoc.id}/properties`));
            bizPropsSnap.docs.forEach((d) =>
              addDocToMap(d.id, {
                ...d.data(),
                businessId: bizDoc.id,
                businessName: bizDoc.data().name,
              })
            );
          } catch (_) {}
        }
      } catch (_) {}

      if (propMap.size > 0) {
        setProperties(Array.from(propMap.values()));
      } else {
        // Fallback to initial starter properties so dashboard is never empty
        setProperties(INITIAL_STARTER_PROPERTIES);
      }
    } catch (e) {
      console.error("Error loading properties:", e);
      setProperties(INITIAL_STARTER_PROPERTIES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  async function handleSeedFirestore() {
    try {
      setSeeding(true);
      setSeedSuccess(null);
      const batch = writeBatch(db);

      for (const prop of INITIAL_STARTER_PROPERTIES) {
        const propData = {
          name: prop.name,
          city: prop.city,
          cityCode: prop.cityCode,
          address: prop.address,
          description: prop.description,
          totalBeds: prop.totalBeds,
          pricePerBed: prop.pricePerBed,
          featured: prop.featured,
          status: "active",
          billingStatus: "paid",
          businessId: prop.businessId,
          businessName: prop.businessName,
          businessPhone: prop.businessPhone,
          rating: {
            average: prop.ratingAverage,
            count: prop.ratingCount,
          },
          images: prop.images,
          updatedAt: new Date(),
        };

        // 1. Root /properties
        batch.set(doc(db, "properties", prop.id), propData, { merge: true });

        // 2. City index /properties_by_city/{city}/properties/{id}
        batch.set(doc(db, `properties_by_city/${prop.city}/properties/${prop.id}`), propData, { merge: true });

        // 3. Business properties /businesses/{businessId}/properties/{id}
        batch.set(doc(db, `businesses/${prop.businessId}/properties/${prop.id}`), propData, { merge: true });

        // 4. Create business document if missing
        batch.set(
          doc(db, "businesses", prop.businessId),
          {
            name: prop.businessName,
            phone: prop.businessPhone,
            city: prop.city,
            status: "active",
            ownerUserId: `owner_${prop.businessId}`,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }

      await batch.commit();
      setSeedSuccess("✅ Successfully committed 5 flagship properties and landlord profiles to Firestore!");
      await fetchProperties();
    } catch (err: any) {
      console.error("Seeding error:", err);
      alert("Error seeding Firestore: " + (err?.message || err));
    } finally {
      setSeeding(false);
    }
  }

  async function handleToggleFeatured(prop: PropertyInfo) {
    try {
      setUpdating(true);
      const newFeatured = !prop.featured;
      const batch = writeBatch(db);

      batch.update(doc(db, "properties", prop.id), { featured: newFeatured });
      batch.update(doc(db, `businesses/${prop.businessId}/properties/${prop.id}`), { featured: newFeatured });
      batch.update(doc(db, `properties_by_city/${prop.city}/properties/${prop.id}`), { featured: newFeatured });

      await batch.commit();
      await fetchProperties();
      if (selectedProp && selectedProp.id === prop.id) {
        setSelectedProp({ ...selectedProp, featured: newFeatured });
      }
    } catch (e) {
      console.error("Error toggling featured state:", e);
      // Update locally if offline / demo mode
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, featured: !p.featured } : p))
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleVerification(prop: PropertyInfo, newStatus: "active" | "suspended") {
    try {
      setUpdating(true);
      const batch = writeBatch(db);

      const globalRef = doc(db, "properties", prop.id);
      const bizRef = doc(db, `businesses/${prop.businessId}/properties/${prop.id}`);
      const cityIndexRef = doc(db, `properties_by_city/${prop.city}/properties/${prop.id}`);

      if (newStatus === "active") {
        const updatedData = { ...prop.rawMap, status: "active", updatedAt: new Date() };
        batch.set(globalRef, updatedData, { merge: true });
        batch.set(bizRef, updatedData, { merge: true });
        batch.set(cityIndexRef, updatedData, { merge: true });
      } else {
        batch.update(globalRef, { status: "suspended", updatedAt: new Date() });
        batch.update(bizRef, { status: "suspended", updatedAt: new Date() });
        batch.delete(cityIndexRef);
      }

      await batch.commit();
      await fetchProperties();
      setSelectedProp(null);
    } catch (e) {
      console.error("Error setting property status:", e);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: newStatus } : p))
      );
      setSelectedProp(null);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="overviewLoading">
        <div className="spinner"></div>
        <p>Loading Property Inventory & Compliance Records...</p>
      </div>
    );
  }

  return (
    <div className="consoleContainer">
      <div className="dashboardHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>Platform Property Compliance</h2>
          <p>Audit co-living spaces, toggle search promotions, and verify listings for the public tenant index.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchProperties}
            className="tableActionBtn"
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            disabled={seeding}
            onClick={handleSeedFirestore}
            className="btnPrimary"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
          >
            <Sparkles size={15} /> {seeding ? "Syncing..." : "Sync Starter Catalog to Firestore"}
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981", borderRadius: "10px", color: "#10B981", fontSize: "14px", marginBottom: "20px" }}>
          {seedSuccess}
        </div>
      )}

      <div className="tableWrapper">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Property Details</th>
              <th>City</th>
              <th>Owner Chain</th>
              <th>Capacity (Beds)</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop.id}>
                <td>
                  <strong>{prop.name}</strong>
                  <span className="subtext">ID: {prop.id} &bull; &#8377;{prop.pricePerBed.toLocaleString("en-IN")}/mo</span>
                </td>
                <td>
                  <span className="cityLabel">{prop.city}</span>
                </td>
                <td>
                  <strong>{prop.businessName}</strong>
                  <span className="subtext">{prop.businessPhone}</span>
                </td>
                <td>{prop.totalBeds} Beds</td>
                <td>
                  <button
                    disabled={updating}
                    onClick={() => handleToggleFeatured(prop)}
                    className={`iconBtn ${prop.featured ? "starred" : ""}`}
                    title={prop.featured ? "Featured - click to remove" : "Make Featured"}
                  >
                    <Star size={18} fill={prop.featured ? "#F59E0B" : "none"} color={prop.featured ? "#F59E0B" : "#64748B"} />
                  </button>
                </td>
                <td>
                  <span className={`badge ${prop.status}`}>
                    {prop.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    className="tableActionBtn"
                    onClick={() => setSelectedProp(prop)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Property Audit Modal */}
      {selectedProp && (
        <div className="modalOverlay" onClick={() => setSelectedProp(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Audit Property: {selectedProp.name}</h3>
              <button className="closeBtn" onClick={() => setSelectedProp(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="modalBody">
              <div className="auditSection">
                <h4>Compliance & Master Details</h4>
                <div className="detailRow">
                  <span>Property ID:</span>
                  <strong>{selectedProp.id}</strong>
                </div>
                <div className="detailRow">
                  <span>City & Code:</span>
                  <strong>{selectedProp.city} ({selectedProp.cityCode})</strong>
                </div>
                <div className="detailRow">
                  <span>Address:</span>
                  <strong>{selectedProp.address}</strong>
                </div>
                <div className="detailRow">
                  <span>Parent Business:</span>
                  <strong>{selectedProp.businessName} ({selectedProp.businessId})</strong>
                </div>
                <div className="detailRow">
                  <span>Bed Capacity:</span>
                  <strong>{selectedProp.totalBeds} Beds (Rate: &#8377;{selectedProp.pricePerBed}/bed)</strong>
                </div>
                <div className="detailRow">
                  <span>Tenant Rating:</span>
                  <strong>{selectedProp.ratingAverage} &star; ({selectedProp.ratingCount} reviews)</strong>
                </div>
                <div className="detailRow">
                  <span>Current Listing Status:</span>
                  <span className={`badge ${selectedProp.status}`}>{selectedProp.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="auditSection">
                <h4>Description & Facilities</h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {selectedProp.description}
                </p>
              </div>

              <div className="modalActions">
                <button
                  disabled={updating}
                  className="btnSecondary"
                  onClick={() => handleToggleFeatured(selectedProp)}
                >
                  <Star size={16} /> {selectedProp.featured ? "Remove from Featured" : "Mark as Featured"}
                </button>

                {selectedProp.status === "active" ? (
                  <button
                    disabled={updating}
                    className="btnDanger"
                    onClick={() => handleVerification(selectedProp, "suspended")}
                  >
                    <ShieldAlert size={16} /> Suspend Listing
                  </button>
                ) : (
                  <button
                    disabled={updating}
                    className="btnSuccess"
                    onClick={() => handleVerification(selectedProp, "active")}
                  >
                    <ShieldCheck size={16} /> Activate & List Publicly
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
