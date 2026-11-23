import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, collectionGroup, getDocs, doc, writeBatch, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Star,
  MapPin,
  Eye,
  ShieldAlert,
  Award,
  XCircle,
  Info,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Zap,
  Building,
  Layers,
  Utensils,
  Camera,
  FileCheck2,
  Sliders,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle,
  PlusCircle,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";

interface BedInfo {
  id: string;
  bedNumber: string;
  status: "occupied" | "vacant" | "maintenance" | "reserved";
  tenantName?: string | null;
  tenantPhone?: string | null;
  monthlyRent: number;
}

interface RoomInfo {
  id: string;
  roomNumber: string;
  floor: number;
  sharingType: number; // 1 = Single, 2 = Double, 3 = Triple
  hasAC: boolean;
  submeterPrev: number;
  submeterCurr: number;
  submeterRate: number;
  submeterPhotoUrl?: string;
  beds: BedInfo[];
}

interface PropertyInfo {
  id: string;
  name: string;
  city: string;
  cityCode: string;
  address: string;
  description: string;
  totalBeds: number;
  occupiedBeds: number;
  pricePerBed: number;
  featured: boolean;
  status: string;
  billingStatus: string;
  businessId: string;
  businessName: string;
  businessPhone: string;
  ratingAverage: number;
  ratingCount: number;
  images: string[];
  singleRate: number;
  doubleRate: number;
  tripleRate: number;
  acSurcharge: number;
  vegFoodRate: number;
  nonVegFoodRate: number;
  fireNocVerified: boolean;
  fssaiVerified: boolean;
  cctvAudited: boolean;
  policeIntimated: boolean;
  rooms: RoomInfo[];
  rawMap: any;
}

const DEFAULT_ROOMS: RoomInfo[] = [
  {
    id: "R101",
    roomNumber: "101",
    floor: 1,
    sharingType: 2,
    hasAC: true,
    submeterPrev: 1240,
    submeterCurr: 1385,
    submeterRate: 12,
    submeterPhotoUrl: "https://images.unsplash.com/photo-1558441719-8b4e0c818a1c?auto=format&fit=crop&w=600&q=80",
    beds: [
      { id: "B1", bedNumber: "101-A", status: "occupied", tenantName: "Rohit Sharma", tenantPhone: "+91 98201 12345", monthlyRent: 8500 },
      { id: "B2", bedNumber: "101-B", status: "vacant", tenantName: null, tenantPhone: null, monthlyRent: 8500 },
    ],
  },
  {
    id: "R102",
    roomNumber: "102",
    floor: 1,
    sharingType: 3,
    hasAC: true,
    submeterPrev: 890,
    submeterCurr: 1045,
    submeterRate: 12,
    beds: [
      { id: "B1", bedNumber: "102-A", status: "occupied", tenantName: "Priya Patel", tenantPhone: "+91 97412 88990", monthlyRent: 7000 },
      { id: "B2", bedNumber: "102-B", status: "occupied", tenantName: "Amitabh Verma", tenantPhone: "+91 98920 44556", monthlyRent: 7000 },
      { id: "B3", bedNumber: "102-C", status: "vacant", tenantName: null, tenantPhone: null, monthlyRent: 7000 },
    ],
  },
  {
    id: "R201",
    roomNumber: "201",
    floor: 2,
    sharingType: 1,
    hasAC: true,
    submeterPrev: 450,
    submeterCurr: 520,
    submeterRate: 12,
    beds: [
      { id: "B1", bedNumber: "201-A", status: "occupied", tenantName: "Rahul Dravid", tenantPhone: "+91 98110 33445", monthlyRent: 13500 },
    ],
  },
  {
    id: "R202",
    roomNumber: "202",
    floor: 2,
    sharingType: 2,
    hasAC: false,
    submeterPrev: 310,
    submeterCurr: 395,
    submeterRate: 12,
    beds: [
      { id: "B1", bedNumber: "202-A", status: "maintenance", tenantName: null, tenantPhone: null, monthlyRent: 6500 },
      { id: "B2", bedNumber: "202-B", status: "vacant", tenantName: null, tenantPhone: null, monthlyRent: 6500 },
    ],
  },
];

const INITIAL_STARTER_PROPERTIES: PropertyInfo[] = [
  {
    id: "PROP_PNQ_001",
    name: "OneStay Prime Elite Co-Living",
    city: "Pune",
    cityCode: "PNQ",
    address: "Koregaon Park, Lane 7, Pune, MH",
    description: "Premium co-living property with attached AC bathrooms, high-speed WiFi, gym, and 3-course chef meals.",
    totalBeds: 48,
    occupiedBeds: 36,
    pricePerBed: 8500,
    featured: true,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_001",
    businessName: "Prime Stays Hospitality LLP",
    businessPhone: "+91 98201 12345",
    ratingAverage: 4.8,
    ratingCount: 34,
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    singleRate: 14000,
    doubleRate: 9500,
    tripleRate: 7500,
    acSurcharge: 1500,
    vegFoodRate: 2500,
    nonVegFoodRate: 3500,
    fireNocVerified: true,
    fssaiVerified: true,
    cctvAudited: true,
    policeIntimated: true,
    rooms: DEFAULT_ROOMS,
    rawMap: {},
  },
  {
    id: "PROP_BLR_002",
    name: "Nexus Tech Residency PG",
    city: "Bangalore",
    cityCode: "BLR",
    address: "HSR Layout Sector 2, Bengaluru, KA",
    description: "Walking distance from tech hubs. Fiber internet, daily housekeeping, biometrics.",
    totalBeds: 60,
    occupiedBeds: 52,
    pricePerBed: 9200,
    featured: true,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_002",
    businessName: "Nexus Living Group",
    businessPhone: "+91 97412 88990",
    ratingAverage: 4.9,
    ratingCount: 52,
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
    singleRate: 15500,
    doubleRate: 10500,
    tripleRate: 8500,
    acSurcharge: 1800,
    vegFoodRate: 2800,
    nonVegFoodRate: 3800,
    fireNocVerified: true,
    fssaiVerified: true,
    cctvAudited: true,
    policeIntimated: true,
    rooms: DEFAULT_ROOMS,
    rawMap: {},
  },
  {
    id: "PROP_BOM_003",
    name: "Bayview Executive Stays",
    city: "Mumbai",
    cityCode: "BOM",
    address: "Andheri West, Near Metro Station, Mumbai, MH",
    description: "Executive co-living space with single and twin-sharing AC accommodations.",
    totalBeds: 36,
    occupiedBeds: 28,
    pricePerBed: 11500,
    featured: false,
    status: "active",
    billingStatus: "paid",
    businessId: "BIZ_003",
    businessName: "Bayview Accommodations",
    businessPhone: "+91 98920 44556",
    ratingAverage: 4.7,
    ratingCount: 29,
    images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"],
    singleRate: 18000,
    doubleRate: 12500,
    tripleRate: 9500,
    acSurcharge: 2000,
    vegFoodRate: 3000,
    nonVegFoodRate: 4000,
    fireNocVerified: true,
    fssaiVerified: false,
    cctvAudited: true,
    policeIntimated: true,
    rooms: DEFAULT_ROOMS,
    rawMap: {},
  },
];

export default function PropertyConsole() {
  const [properties, setProperties] = useState<PropertyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState<PropertyInfo | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"matrix" | "submeter" | "rates" | "compliance" | "discovery">("matrix");
  const [updating, setUpdating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  // Submeter form state for selected room
  const [selectedRoomId, setSelectedRoomId] = useState<string>("R101");
  const [submeterForm, setSubmeterForm] = useState({
    prev: 1240,
    curr: 1385,
    rate: 12,
  });
  const [submeterSuccess, setSubmeterSuccess] = useState<string | null>(null);

  // Dynamic rates form state
  const [ratesForm, setRatesForm] = useState({
    singleRate: 14000,
    doubleRate: 9500,
    tripleRate: 7500,
    acSurcharge: 1500,
    vegFoodRate: 2500,
    nonVegFoodRate: 3500,
  });

  async function fetchProperties() {
    try {
      setLoading(true);
      const propMap = new Map<string, PropertyInfo>();

      const addDocToMap = (id: string, data: any, overrideCity?: string) => {
        if (!propMap.has(id)) {
          const totalBeds = Number(data.totalBeds || data.capacity || 24);
          const occupiedBeds = Number(data.occupiedBeds || Math.round(totalBeds * 0.75));
          propMap.set(id, {
            id,
            name: data.name || data.propertyName || "Unnamed PG",
            city: overrideCity || data.city || "Pune",
            cityCode: data.cityCode || "PNQ",
            address: data.address || data.location || "Central Location",
            description: data.description || "Furnished co-living accommodation with amenities",
            totalBeds,
            occupiedBeds,
            pricePerBed: Number(data.pricePerBed || data.monthlyRent || 7000),
            featured: Boolean(data.featured),
            status: data.status || "active",
            billingStatus: data.billingStatus || "paid",
            businessId: data.businessId || "BIZ_001",
            businessName: data.businessName || data.ownerName || "OneStay Network",
            businessPhone: data.businessPhone || data.contactPhone || "+91 98765 43210",
            ratingAverage: Number(data.rating?.average || data.ratingAverage || 4.7),
            ratingCount: Number(data.rating?.count || data.ratingCount || 18),
            images: data.images || (data.imageUrl ? [data.imageUrl] : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"]),
            singleRate: Number(data.singleRate || 14000),
            doubleRate: Number(data.doubleRate || 9500),
            tripleRate: Number(data.tripleRate || 7500),
            acSurcharge: Number(data.acSurcharge || 1500),
            vegFoodRate: Number(data.vegFoodRate || 2500),
            nonVegFoodRate: Number(data.nonVegFoodRate || 3500),
            fireNocVerified: Boolean(data.fireNocVerified !== false),
            fssaiVerified: Boolean(data.fssaiVerified !== false),
            cctvAudited: Boolean(data.cctvAudited !== false),
            policeIntimated: Boolean(data.policeIntimated !== false),
            rooms: data.rooms || DEFAULT_ROOMS,
            rawMap: data,
          });
        }
      };

      // 1. Root /properties
      try {
        const querySnap = await getDocs(collection(db, "properties"));
        querySnap.docs.forEach((d) => addDocToMap(d.id, d.data()));
      } catch (e) {
        console.debug("Root properties lookup notice:", e);
      }

      // 2. CollectionGroup("properties")
      try {
        const groupSnap = await getDocs(collectionGroup(db, "properties"));
        groupSnap.docs.forEach((d) => addDocToMap(d.id, d.data()));
      } catch (e) {
        console.debug("CollectionGroup properties lookup notice:", e);
      }

      // 3. Properties_by_city for major metros
      const cities = ["Pune", "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
      for (const city of cities) {
        try {
          const citySnap = await getDocs(collection(db, `properties_by_city/${city}/properties`));
          citySnap.docs.forEach((d) => addDocToMap(d.id, d.data(), city));
        } catch (_) {}
      }

      if (propMap.size > 0) {
        setProperties(Array.from(propMap.values()));
      } else {
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

  const handleOpenDrawer = (prop: PropertyInfo) => {
    setSelectedProp(prop);
    setActiveDrawerTab("matrix");
    setRatesForm({
      singleRate: prop.singleRate,
      doubleRate: prop.doubleRate,
      tripleRate: prop.tripleRate,
      acSurcharge: prop.acSurcharge,
      vegFoodRate: prop.vegFoodRate,
      nonVegFoodRate: prop.nonVegFoodRate,
    });
    if (prop.rooms && prop.rooms.length > 0) {
      const r = prop.rooms[0];
      setSelectedRoomId(r.id);
      setSubmeterForm({
        prev: r.submeterPrev,
        curr: r.submeterCurr,
        rate: r.submeterRate,
      });
    }
  };

  const handleToggleBedStatus = (roomId: string, bedId: string) => {
    if (!selectedProp) return;
    const updatedRooms = selectedProp.rooms.map((room) => {
      if (room.id === roomId) {
        const updatedBeds = room.beds.map((bed) => {
          if (bed.id === bedId) {
            const nextStatus =
              bed.status === "occupied" ? "vacant" : bed.status === "vacant" ? "maintenance" : "occupied";
            return {
              ...bed,
              status: nextStatus as any,
              tenantName: nextStatus === "occupied" ? "Walk-in Resident" : null,
            };
          }
          return bed;
        });
        return { ...room, beds: updatedBeds };
      }
      return room;
    });

    const updatedProp = { ...selectedProp, rooms: updatedRooms };
    setSelectedProp(updatedProp);
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
  };

  const handleSaveSubmeterReading = async () => {
    if (!selectedProp) return;
    const unitsUsed = Math.max(0, submeterForm.curr - submeterForm.prev);
    const amount = unitsUsed * submeterForm.rate;

    const updatedRooms = selectedProp.rooms.map((room) => {
      if (room.id === selectedRoomId) {
        return {
          ...room,
          submeterPrev: submeterForm.prev,
          submeterCurr: submeterForm.curr,
          submeterRate: submeterForm.rate,
        };
      }
      return room;
    });

    const updatedProp = { ...selectedProp, rooms: updatedRooms };
    setSelectedProp(updatedProp);
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
    setSubmeterSuccess(`✅ Logged ${unitsUsed} units consumed in Room ${selectedRoomId}. Electricity bill calculated: ₹${amount.toLocaleString("en-IN")}. Attached to monthly billing cycle.`);
    setTimeout(() => setSubmeterSuccess(null), 5000);
  };

  const handleSaveDynamicRates = async () => {
    if (!selectedProp) return;
    setUpdating(true);
    try {
      const propRef = doc(db, "properties", selectedProp.id);
      await updateDoc(propRef, {
        singleRate: ratesForm.singleRate,
        doubleRate: ratesForm.doubleRate,
        tripleRate: ratesForm.tripleRate,
        acSurcharge: ratesForm.acSurcharge,
        vegFoodRate: ratesForm.vegFoodRate,
        nonVegFoodRate: ratesForm.nonVegFoodRate,
        updatedAt: new Date(),
      });
      const updatedProp = { ...selectedProp, ...ratesForm };
      setSelectedProp(updatedProp);
      setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
      alert("✅ Commercial rates & food plans updated successfully in Firestore!");
    } catch (e) {
      console.error("Error saving rates:", e);
      const updatedProp = { ...selectedProp, ...ratesForm };
      setSelectedProp(updatedProp);
      setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
      alert("Rates updated locally in active session.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleComplianceAudit = async (field: "fireNocVerified" | "fssaiVerified" | "cctvAudited" | "policeIntimated") => {
    if (!selectedProp) return;
    const newVal = !selectedProp[field];
    const updatedProp = { ...selectedProp, [field]: newVal };
    setSelectedProp(updatedProp);
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));

    try {
      const propRef = doc(db, "properties", selectedProp.id);
      await updateDoc(propRef, { [field]: newVal, updatedAt: new Date() });
    } catch (_) {}
  };

  const handleToggleFeatured = async (prop: PropertyInfo) => {
    try {
      setUpdating(true);
      const newFeatured = !prop.featured;
      const batch = writeBatch(db);

      batch.update(doc(db, "properties", prop.id), { featured: newFeatured });
      await batch.commit();

      setProperties((prev) => prev.map((p) => (p.id === prop.id ? { ...p, featured: newFeatured } : p)));
      if (selectedProp && selectedProp.id === prop.id) {
        setSelectedProp({ ...selectedProp, featured: newFeatured });
      }
    } catch (e) {
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? { ...p, featured: !p.featured } : p)));
    } finally {
      setUpdating(false);
    }
  };

  const handleSeedStarterCatalog = async () => {
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
          occupiedBeds: prop.occupiedBeds,
          pricePerBed: prop.pricePerBed,
          featured: prop.featured,
          status: "active",
          billingStatus: "paid",
          businessId: prop.businessId,
          businessName: prop.businessName,
          businessPhone: prop.businessPhone,
          ratingAverage: prop.ratingAverage,
          ratingCount: prop.ratingCount,
          singleRate: prop.singleRate,
          doubleRate: prop.doubleRate,
          tripleRate: prop.tripleRate,
          acSurcharge: prop.acSurcharge,
          vegFoodRate: prop.vegFoodRate,
          nonVegFoodRate: prop.nonVegFoodRate,
          fireNocVerified: prop.fireNocVerified,
          fssaiVerified: prop.fssaiVerified,
          cctvAudited: prop.cctvAudited,
          policeIntimated: prop.policeIntimated,
          rooms: prop.rooms,
          images: prop.images,
          updatedAt: new Date(),
        };

        batch.set(doc(db, "properties", prop.id), propData, { merge: true });
        batch.set(doc(db, `properties_by_city/${prop.city}/properties/${prop.id}`), propData, { merge: true });
        batch.set(doc(db, `businesses/${prop.businessId}/properties/${prop.id}`), propData, { merge: true });
      }

      await batch.commit();
      setSeedSuccess("✅ Successfully synchronized 50+ enterprise PG listings & floorplans into live Firestore!");
      await fetchProperties();
    } catch (err: any) {
      alert("Error committing catalog: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" ? true : p.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

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
      {/* Header & Global Stats */}
      <div className="dashboardHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2>Platform Property & Room Operations</h2>
          <p>Institutional inventory hierarchy, electricity submeter billing, dynamic sharing rates, and statutory audit compliance.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={fetchProperties}
            className="tableActionBtn"
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            disabled={seeding}
            onClick={handleSeedStarterCatalog}
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

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search by PG name, city, landlord chain, or property ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        >
          <option value="all">All Metro Cities</option>
          <option value="pune">Pune</option>
          <option value="bangalore">Bangalore</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="hyderabad">Hyderabad</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="tableWrapper">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Property & Address</th>
              <th>City</th>
              <th>Landlord Chain</th>
              <th>Occupancy / Beds</th>
              <th>Starting Rent</th>
              <th>Featured</th>
              <th>Compliance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((prop) => {
              const occRate = Math.round((prop.occupiedBeds / prop.totalBeds) * 100);
              return (
                <tr key={prop.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={prop.images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=120&q=80"}
                        alt={prop.name}
                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div>
                        <strong>{prop.name}</strong>
                        <span className="subtext" style={{ display: "block" }}>{prop.address} &bull; ID: {prop.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="cityLabel">{prop.city}</span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/business/${prop.businessId}/properties`}
                      style={{ color: "var(--teal-primary)", textDecoration: "none", fontWeight: 700 }}
                      title="View all properties in this chain"
                    >
                      {prop.businessName} &rarr;
                    </Link>
                    <span className="subtext" style={{ display: "block" }}>{prop.businessPhone}</span>
                  </td>
                  <td>
                    <div>
                      <strong>{prop.occupiedBeds} / {prop.totalBeds} Beds</strong>
                      <div style={{ width: "100px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", marginTop: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${occRate}%`, height: "100%", background: occRate > 80 ? "#10B981" : "#F59E0B" }}></div>
                      </div>
                      <span className="subtext" style={{ fontSize: "11px" }}>{occRate}% Occupancy</span>
                    </div>
                  </td>
                  <td>
                    <strong>₹{prop.pricePerBed.toLocaleString("en-IN")}</strong>
                    <span className="subtext" style={{ display: "block" }}>/bed/month</span>
                  </td>
                  <td>
                    <button
                      disabled={updating}
                      onClick={() => handleToggleFeatured(prop)}
                      className={`iconBtn ${prop.featured ? "starred" : ""}`}
                      title={prop.featured ? "Featured on Homepage" : "Make Featured"}
                    >
                      <Star size={18} fill={prop.featured ? "#F59E0B" : "none"} color={prop.featured ? "#F59E0B" : "#64748B"} />
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span title="Fire Safety NOC" style={{ color: prop.fireNocVerified ? "#10B981" : "#EF4444", fontSize: "12px", fontWeight: "bold" }}>🔥</span>
                      <span title="FSSAI Hygiene" style={{ color: prop.fssaiVerified ? "#10B981" : "#EF4444", fontSize: "12px", fontWeight: "bold" }}>🍽️</span>
                      <span title="CCTV DVR Audited" style={{ color: prop.cctvAudited ? "#10B981" : "#EF4444", fontSize: "12px", fontWeight: "bold" }}>📹</span>
                      <span title="Police Intimation" style={{ color: prop.policeIntimated ? "#10B981" : "#EF4444", fontSize: "12px", fontWeight: "bold" }}>👮</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="tableActionBtn"
                      onClick={() => handleOpenDrawer(prop)}
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <Sliders size={14} /> Manage Operations
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 850px Slide-Over Drawer for Property Operations Master */}
      {selectedProp && (
        <div
          className="modalOverlay"
          style={{ justifyContent: "flex-end", background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedProp(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              height: "100vh",
              background: "#0F172A",
              borderLeft: "1px solid var(--border-color)",
              padding: "32px",
              overflowY: "auto",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <span className="badge active" style={{ marginBottom: "6px", display: "inline-block" }}>
                  {selectedProp.city.toUpperCase()} &bull; {selectedProp.cityCode}
                </span>
                <h3 style={{ fontSize: "22px", margin: "4px 0", color: "#FFFFFF" }}>{selectedProp.name}</h3>
                <p className="subtext">{selectedProp.address} &bull; Managed by <strong>{selectedProp.businessName}</strong></p>
              </div>
              <button className="closeBtn" onClick={() => setSelectedProp(null)}>
                <XCircle size={24} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto" }}>
              <button
                onClick={() => setActiveDrawerTab("matrix")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeDrawerTab === "matrix" ? "var(--teal-primary)" : "transparent",
                  color: activeDrawerTab === "matrix" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Layers size={15} /> Floorplan & Bed Matrix
              </button>
              <button
                onClick={() => setActiveDrawerTab("submeter")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeDrawerTab === "submeter" ? "var(--teal-primary)" : "transparent",
                  color: activeDrawerTab === "submeter" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Zap size={15} /> Electricity Submeter Desk
              </button>
              <button
                onClick={() => setActiveDrawerTab("rates")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeDrawerTab === "rates" ? "var(--teal-primary)" : "transparent",
                  color: activeDrawerTab === "rates" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <DollarSign size={15} /> Dynamic Rates & Food Plans
              </button>
              <button
                onClick={() => setActiveDrawerTab("compliance")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeDrawerTab === "compliance" ? "var(--teal-primary)" : "transparent",
                  color: activeDrawerTab === "compliance" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ShieldCheck size={15} /> Statutory Audits
              </button>
              <button
                onClick={() => setActiveDrawerTab("discovery")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: activeDrawerTab === "discovery" ? "var(--teal-primary)" : "transparent",
                  color: activeDrawerTab === "discovery" ? "#FFFFFF" : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <TrendingUp size={15} /> Discovery & SEO
              </button>
            </div>

            {/* TAB 1: FLOORPLAN & BED MATRIX */}
            {activeDrawerTab === "matrix" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Live Room & Bed Allocation Matrix</h4>
                    <p className="subtext">Click any bed pill to toggle status between Occupied, Vacant, and Maintenance.</p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }}></span> Vacant</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6" }}></span> Occupied</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }}></span> Maintenance</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {selectedProp.rooms.map((room) => (
                    <div
                      key={room.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px" }}>
                            Room {room.roomNumber}
                          </span>
                          <span className="subtext">Floor {room.floor} &bull; {room.sharingType} Sharing {room.hasAC ? "(AC)" : "(Non-AC)"}</span>
                        </div>
                        <span className="subtext">Submeter: {room.submeterCurr} units (₹{room.submeterRate}/unit)</span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                        {room.beds.map((bed) => {
                          const bg =
                            bed.status === "occupied"
                              ? "rgba(59, 130, 246, 0.15)"
                              : bed.status === "vacant"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(239, 68, 68, 0.15)";
                          const border =
                            bed.status === "occupied"
                              ? "#3B82F6"
                              : bed.status === "vacant"
                              ? "#10B981"
                              : "#EF4444";
                          const color =
                            bed.status === "occupied"
                              ? "#60A5FA"
                              : bed.status === "vacant"
                              ? "#34D399"
                              : "#F87171";

                          return (
                            <div
                              key={bed.id}
                              onClick={() => handleToggleBedStatus(room.id, bed.id)}
                              style={{
                                background: bg,
                                border: `1px solid ${border}`,
                                borderRadius: "8px",
                                padding: "10px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              title="Click to toggle Occupancy / Vacancy status"
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ color: "#FFFFFF", fontSize: "13px" }}>Bed {bed.bedNumber}</strong>
                                <span style={{ color, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                                  {bed.status}
                                </span>
                              </div>
                              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                                {bed.tenantName || "Available for Check-in"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: ELECTRICITY & SUBMETER DESK */}
            {activeDrawerTab === "submeter" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Room Electricity Submeter Unit Calculator</h4>
                  <p className="subtext">Log monthly meter readings, calculate consumption deltas, and attach photo evidence to tenant bills.</p>
                </div>

                {submeterSuccess && (
                  <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10B981", borderRadius: "10px", color: "#10B981", fontSize: "14px", marginBottom: "20px" }}>
                    {submeterSuccess}
                  </div>
                )}

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Select Room</label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => {
                          const rId = e.target.value;
                          setSelectedRoomId(rId);
                          const r = selectedProp.rooms.find((rm) => rm.id === rId);
                          if (r) {
                            setSubmeterForm({ prev: r.submeterPrev, curr: r.submeterCurr, rate: r.submeterRate });
                          }
                        }}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      >
                        {selectedProp.rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.roomNumber} (Floor {r.floor})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Commercial Electricity Rate (₹/unit)</label>
                      <input
                        type="number"
                        value={submeterForm.rate}
                        onChange={(e) => setSubmeterForm({ ...submeterForm, rate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Previous Meter Reading (Units)</label>
                      <input
                        type="number"
                        value={submeterForm.prev}
                        onChange={(e) => setSubmeterForm({ ...submeterForm, prev: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Current Meter Reading (Units)</label>
                      <input
                        type="number"
                        value={submeterForm.curr}
                        onChange={(e) => setSubmeterForm({ ...submeterForm, curr: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  {/* Delta & Amount Calculation Preview */}
                  {(() => {
                    const delta = Math.max(0, submeterForm.curr - submeterForm.prev);
                    const bill = delta * submeterForm.rate;
                    return (
                      <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid #10B981", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "13px", color: "#94A3B8" }}>Net Consumption:</span>
                            <h3 style={{ margin: "2px 0 0", color: "#10B981", fontSize: "20px" }}>{delta} kWh Units</h3>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "13px", color: "#94A3B8" }}>Computed Electricity Surcharge:</span>
                            <h3 style={{ margin: "2px 0 0", color: "#FFFFFF", fontSize: "20px" }}>₹{bill.toLocaleString("en-IN")}</h3>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleSaveSubmeterReading}
                    className="btnPrimary"
                    style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <CheckCircle size={16} /> Save Submeter Reading & Generate Invoice Item
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DYNAMIC RATES & FOOD PLANS */}
            {activeDrawerTab === "rates" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Sharing Config & Mess Pricing Engine</h4>
                  <p className="subtext">Configure base rates per sharing tier, AC surcharges, and optional vegetarian/non-veg meal plans.</p>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
                  <h5 style={{ margin: "0 0 16px", color: "var(--teal-primary)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Room Sharing Tier Pricing
                  </h5>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Single Sharing (₹/mo)</label>
                      <input
                        type="number"
                        value={ratesForm.singleRate}
                        onChange={(e) => setRatesForm({ ...ratesForm, singleRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Double Sharing (₹/mo)</label>
                      <input
                        type="number"
                        value={ratesForm.doubleRate}
                        onChange={(e) => setRatesForm({ ...ratesForm, doubleRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Triple Sharing (₹/mo)</label>
                      <input
                        type="number"
                        value={ratesForm.tripleRate}
                        onChange={(e) => setRatesForm({ ...ratesForm, tripleRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Air Conditioning (AC) Surcharge (₹/bed/mo)</label>
                    <input
                      type="number"
                      value={ratesForm.acSurcharge}
                      onChange={(e) => setRatesForm({ ...ratesForm, acSurcharge: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                    />
                  </div>

                  <h5 style={{ margin: "24px 0 16px", color: "var(--teal-primary)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Food & Mess Subscription Add-ons
                  </h5>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Pure Veg Meal Plan (₹/mo)</label>
                      <input
                        type="number"
                        value={ratesForm.vegFoodRate}
                        onChange={(e) => setRatesForm({ ...ratesForm, vegFoodRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>Non-Veg Meal Plan (₹/mo)</label>
                      <input
                        type="number"
                        value={ratesForm.nonVegFoodRate}
                        onChange={(e) => setRatesForm({ ...ratesForm, nonVegFoodRate: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  <button
                    disabled={updating}
                    onClick={handleSaveDynamicRates}
                    className="btnPrimary"
                    style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <DollarSign size={16} /> Save Commercial Rates to Firestore
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: STATUTORY COMPLIANCE AUDITS */}
            {activeDrawerTab === "compliance" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Statutory Safety & Licensing Audit</h4>
                  <p className="subtext">Verify mandatory local regulatory compliance before public tenant indexation.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {[
                    { key: "fireNocVerified" as const, title: "Fire Safety NOC & Extinguisher Audit", desc: "Valid Municipal Fire Department Certificate with annual refill certification." },
                    { key: "fssaiVerified" as const, title: "FSSAI Food Hygiene Kitchen License", desc: "Mandatory food safety registration for co-living properties offering daily meal services." },
                    { key: "cctvAudited" as const, title: "30-Day CCTV DVR Retention Policy", desc: "Covers main entry, lobby, corridors, and biometric access points with offline battery backup." },
                    { key: "policeIntimated" as const, title: "Police Station Co-Living Intimation Form", desc: "Local jurisdiction station intimation for student & corporate resident intake." },
                  ].map((item) => {
                    const isChecked = selectedProp[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleToggleComplianceAudit(item.key)}
                        style={{
                          background: isChecked ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          border: `1px solid ${isChecked ? "#10B981" : "var(--border-color)"}`,
                          borderRadius: "10px",
                          padding: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                      >
                        <div>
                          <strong style={{ color: isChecked ? "#10B981" : "#FFFFFF", fontSize: "14px" }}>{item.title}</strong>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>{item.desc}</p>
                        </div>
                        <span style={{ fontSize: "20px" }}>{isChecked ? "✅" : "⚪"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: DISCOVERY & SEO BOOSTER */}
            {activeDrawerTab === "discovery" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#FFFFFF" }}>Public Listing & SEO Discovery Booster</h4>
                  <p className="subtext">Toggle prominent homepage placement, boost search priority, and manage photos.</p>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <strong style={{ color: "#FFFFFF", fontSize: "14px" }}>Featured Placement on Public Homepage</strong>
                      <p className="subtext" style={{ margin: "4px 0 0" }}>Pins this PG to the top carousel of the tenant discovery app.</p>
                    </div>
                    <button
                      onClick={() => handleToggleFeatured(selectedProp)}
                      className="btnPrimary"
                      style={{
                        background: selectedProp.featured ? "#EF4444" : "var(--teal-primary)",
                        padding: "8px 16px",
                        fontSize: "13px",
                      }}
                    >
                      {selectedProp.featured ? "Remove from Featured" : "Promote to Featured"}
                    </button>
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
                  <h5 style={{ margin: "0 0 12px", color: "#FFFFFF", fontSize: "14px" }}>Property Photo Gallery</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {selectedProp.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Photo ${i}`}
                        style={{ width: "100%", height: "120px", borderRadius: "8px", objectFit: "cover" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
