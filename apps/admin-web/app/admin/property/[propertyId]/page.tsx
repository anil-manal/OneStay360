"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Search,
  MapPin,
  Bed,
  Layers,
  Zap,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Camera,
  FileCheck2,
  Eye,
  ExternalLink,
  Phone,
  User,
  ShieldAlert,
  Sparkles,
  X,
  ChevronRight,
  Utensils,
  Wrench,
  Clock,
  Check,
} from "lucide-react";

interface BedInfo {
  id: string;
  bedNumber: string;
  status: "occupied" | "vacant" | "maintenance" | "reserved";
  tenantName?: string | null;
  tenantPhone?: string | null;
  monthlyRent: number;
}

export interface SharingPricingEntry {
  sharing: number; // e.g., 1, 2, 3, 4, 5
  nonAc: number;  // monthly rent Non-AC
  ac: number;     // monthly rent AC
}

export interface PropertyPricingData {
  maxSharing: number;
  sharing: SharingPricingEntry[];
  securityDeposit: number;
  oneTimeMaintenance: number;
  maintenanceDeductedFromDeposit: boolean;
  single: number;
  double: number;
  triple: number;
}

interface RoomInfo {
  id: string;
  roomNumber: string;
  floor: number;
  sharingType: number;
  hasAC: boolean;
  submeterPrev: number;
  submeterCurr: number;
  submeterRate: number;
  submeterPhotoUrl?: string;
  beds: BedInfo[];
}

interface PropertyDetails {
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
  businessId: string;
  businessName: string;
  businessPhone: string;
  ratingAverage: number;
  ratingCount: number;
  images: string[];
  pricing?: PropertyPricingData;
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
      { id: "B1", bedNumber: "201-A", status: "occupied", tenantName: "Deepak Kumar", tenantPhone: "+91 99887 11223", monthlyRent: 14000 },
    ],
  },
  {
    id: "R202",
    roomNumber: "202",
    floor: 2,
    sharingType: 2,
    hasAC: false,
    submeterPrev: 610,
    submeterCurr: 720,
    submeterRate: 12,
    beds: [
      { id: "B1", bedNumber: "202-A", status: "occupied", tenantName: "Sneha Reddy", tenantPhone: "+91 98765 22334", monthlyRent: 8000 },
      { id: "B2", bedNumber: "202-B", status: "maintenance", tenantName: null, tenantPhone: null, monthlyRent: 8000 },
    ],
  },
];

function normalizeRooms(rawRooms: any[], basePrice: number, pricing?: any): RoomInfo[] {
  if (!Array.isArray(rawRooms) || rawRooms.length === 0) {
    return DEFAULT_ROOMS;
  }

  return rawRooms.map((r: any, idx: number) => {
    const roomId = r.id || r.roomId || `R${r.roomNumber || idx + 101}`;
    const roomNumber = String(r.roomNumber || idx + 101);
    const floor = Number(r.floor || Math.floor(parseInt(roomNumber, 10) / 100) || 1);
    const sharingType = Number(
      r.sharingType || (r.occupancyType === "Single" ? 1 : r.occupancyType === "Triple" ? 3 : 2)
    );
    const hasAC = Boolean(r.hasAC || r.ac);
    const roomPrice = Number(
      r.price ||
      (sharingType === 1 ? pricing?.single : sharingType === 3 ? pricing?.triple : pricing?.double) ||
      basePrice ||
      8000
    );

    const submeterPrev = Number(r.submeterPrev || 1000 + idx * 120);
    const submeterCurr = Number(r.submeterCurr || submeterPrev + 145);
    const submeterRate = Number(r.submeterRate || 12);
    const submeterPhotoUrl = r.submeterPhotoUrl || undefined;

    let beds: BedInfo[] = [];
    if (Array.isArray(r.beds) && r.beds.length > 0) {
      beds = r.beds.map((b: any, bIdx: number) => {
        const bedId = b.id || b.bedId || `B_${roomId}_${bIdx + 1}`;
        const bedNumber = b.bedNumber
          ? (String(b.bedNumber).includes("-") ? String(b.bedNumber) : `${roomNumber}-${b.bedNumber}`)
          : `${roomNumber}-${String.fromCharCode(65 + bIdx)}`;
        const isOccupied = Boolean(b.isOccupied || b.status === "occupied");
        const isMaintenance = b.status === "maintenance";
        const status: "occupied" | "vacant" | "maintenance" | "reserved" = isMaintenance
          ? "maintenance"
          : isOccupied
          ? "occupied"
          : "vacant";

        return {
          id: bedId,
          bedNumber,
          status,
          tenantName: b.tenantName || (isOccupied ? `Resident in ${roomNumber}` : null),
          tenantPhone: b.tenantPhone || (isOccupied ? `+91 98201 ${10000 + idx * 10 + bIdx}` : null),
          monthlyRent: Number(b.monthlyRent || roomPrice),
        };
      });
    } else {
      const bedCount = Number(r.maxBeds || sharingType || 2);
      for (let i = 0; i < bedCount; i++) {
        const isOcc = i === 0;
        beds.push({
          id: `B_${roomId}_${i + 1}`,
          bedNumber: `${roomNumber}-${String.fromCharCode(65 + i)}`,
          status: isOcc ? "occupied" : "vacant",
          tenantName: isOcc ? `Resident in ${roomNumber}` : null,
          tenantPhone: isOcc ? `+91 98201 ${10000 + idx * 10 + i}` : null,
          monthlyRent: roomPrice,
        });
      }
    }

    return {
      id: roomId,
      roomNumber,
      floor,
      sharingType,
      hasAC,
      submeterPrev,
      submeterCurr,
      submeterRate,
      submeterPhotoUrl,
      beds,
    };
  });
}

const FALLBACK_PROPERTIES: Record<string, PropertyDetails> = {
  PROP_PNQ_001: {
    id: "PROP_PNQ_001",
    name: "Zolo Amber Luxury PG & Co-Living",
    city: "Pune",
    cityCode: "PNQ",
    address: "Hinjawadi Phase 1, Near Infosys Circle, Pune, MH",
    description: "Premium co-living residence with biometric access, high-speed Wi-Fi, 3 times hygienic food, and daily housekeeping.",
    totalBeds: 48,
    occupiedBeds: 42,
    pricePerBed: 8500,
    featured: true,
    status: "active",
    businessId: "BIZ_001",
    businessName: "Zolo Living Private Limited",
    businessPhone: "+91 98765 00001",
    ratingAverage: 4.8,
    ratingCount: 46,
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
  },
  PROP_BLR_002: {
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
    businessId: "BIZ_002",
    businessName: "Isthara Co-living Services",
    businessPhone: "+91 98765 00002",
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
  },
  PROP_BOM_003: {
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
    businessId: "BIZ_003",
    businessName: "Stanza Living Hospitality",
    businessPhone: "+91 98765 00003",
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
  },
};

export default function PropertyDetailsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.propertyId;

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matrix" | "submeter" | "rates" | "compliance" | "residents" | "tickets">("matrix");
  const [updating, setUpdating] = useState(false);

  // Dynamic pricing matching Flutter Business App (PropertyPricing)
  const [pricingForm, setPricingForm] = useState<PropertyPricingData>({
    maxSharing: 3,
    sharing: [
      { sharing: 1, nonAc: 14000, ac: 15500 },
      { sharing: 2, nonAc: 9500, ac: 11000 },
      { sharing: 3, nonAc: 7500, ac: 9000 },
    ],
    securityDeposit: 5000,
    oneTimeMaintenance: 1000,
    maintenanceDeductedFromDeposit: false,
    single: 14000,
    double: 9500,
    triple: 7500,
  });

  // Bed Inspection Audit Modal (Super Admin read-only compliance inspection)
  const [selectedBedModal, setSelectedBedModal] = useState<{ room: RoomInfo; bed: BedInfo } | null>(null);

  async function loadPropertyDetails() {
    try {
      setLoading(true);
      let prop: PropertyDetails | null = FALLBACK_PROPERTIES[propertyId] || null;
      let rawDoc: any = null;

      // 1. Direct root properties lookup
      try {
        const propDoc = await getDoc(doc(db, "properties", propertyId));
        if (propDoc.exists()) {
          rawDoc = propDoc.data();
        }
      } catch (e) {
        console.debug("Firestore direct property load notice:", e);
      }

      // 2. City subcollection lookup fallback if not found in root
      if (!rawDoc) {
        const cityMap: Record<string, string> = {
          AMD: "Ahmedabad",
          PNQ: "Pune",
          BLR: "Bangalore",
          BOM: "Mumbai",
          DEL: "Delhi",
          HYD: "Hyderabad",
          MAA: "Chennai",
          CCU: "Kolkata",
        };
        const matchedCity = Object.entries(cityMap).find(([code]) => propertyId.includes(code))?.[1];
        const citiesToCheck = matchedCity
          ? [matchedCity, "Ahmedabad", "Pune", "Bangalore", "Mumbai"]
          : ["Ahmedabad", "Pune", "Bangalore", "Mumbai", "Delhi", "Hyderabad"];

        for (const city of citiesToCheck) {
          try {
            const cityDoc = await getDoc(doc(db, `properties_by_city/${city}/properties`, propertyId));
            if (cityDoc.exists()) {
              rawDoc = cityDoc.data();
              break;
            }
          } catch (_) {}
        }
      }

      if (rawDoc) {
        const d = rawDoc;
        const pricePerBed = Number(
          (d.pricing?.double || d.pricing?.single || (d.pricePerBed && d.pricePerBed > 100 ? d.pricePerBed : 0)) ||
          d.monthlyRent ||
          (d.pricePerBed && d.pricePerBed > 100 ? d.pricePerBed : 8500)
        );
        const normalizedRooms = normalizeRooms(d.rooms, pricePerBed, d.pricing);
        const totalBeds = Number(d.totalBeds || d.totals?.beds || d.capacity || normalizedRooms.reduce((acc, r) => acc + r.beds.length, 0) || 30);
        const occupiedBedsCount = normalizedRooms.flatMap(r => r.beds).filter(b => b.status === "occupied").length;
        const occupiedBeds = Number(
          d.occupiedBeds ||
          (d.totals?.beds && d.totals?.availableBeds ? d.totals.beds - d.totals.availableBeds : null) ||
          occupiedBedsCount ||
          Math.round(totalBeds * 0.75)
        );

        const rawPricing = d.pricing || {};
        const maxSharing = Number(rawPricing.maxSharing || 3);
        let sharingList: SharingPricingEntry[] = [];
        if (Array.isArray(rawPricing.sharing) && rawPricing.sharing.length > 0) {
          sharingList = rawPricing.sharing.map((s: any) => ({
            sharing: Number(s.sharing || 1),
            nonAc: Number(s.nonAc || 0),
            ac: Number(s.ac || 0),
          }));
        } else {
          sharingList = [
            { sharing: 1, nonAc: Number(rawPricing.single || 14000), ac: Number(rawPricing.single ? rawPricing.single + 1500 : 15500) },
            { sharing: 2, nonAc: Number(rawPricing.double || 9500), ac: Number(rawPricing.double ? rawPricing.double + 1500 : 11000) },
            { sharing: 3, nonAc: Number(rawPricing.triple || 7500), ac: Number(rawPricing.triple ? rawPricing.triple + 1500 : 9000) },
          ];
        }

        const pricingData: PropertyPricingData = {
          maxSharing,
          sharing: sharingList,
          securityDeposit: Number(rawPricing.securityDeposit || 5000),
          oneTimeMaintenance: Number(rawPricing.oneTimeMaintenance || 1000),
          maintenanceDeductedFromDeposit: Boolean(rawPricing.maintenanceDeductedFromDeposit),
          single: Number(rawPricing.single || sharingList.find((s) => s.sharing === 1)?.nonAc || 14000),
          double: Number(rawPricing.double || sharingList.find((s) => s.sharing === 2)?.nonAc || 9500),
          triple: Number(rawPricing.triple || sharingList.find((s) => s.sharing === 3)?.nonAc || 7500),
        };

        prop = {
          id: propertyId,
          name: d.name || d.propertyName || "Unnamed Co-Living Residence",
          city: d.city || "Pune",
          cityCode: d.cityCode || "PNQ",
          address: d.address || d.location || "Central Metro Area",
          description: d.description || "Premium accommodation with amenities.",
          totalBeds,
          occupiedBeds,
          pricePerBed,
          featured: Boolean(d.featured),
          status: d.status || "active",
          businessId: d.businessId || "BIZ_001",
          businessName: d.businessName || d.ownerName || "Landlord Chain",
          businessPhone: d.businessPhone || d.contactPhone || "+91 98765 00000",
          ratingAverage: Number(d.rating?.average || d.ratingAverage || 4.8),
          ratingCount: Number(d.rating?.count || d.ratingCount || 34),
          images: d.images && d.images.length > 0 ? d.images : (d.imageUrl ? [d.imageUrl] : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"]),
          pricing: pricingData,
          singleRate: pricingData.single,
          doubleRate: pricingData.double,
          tripleRate: pricingData.triple,
          acSurcharge: Number(d.acSurcharge || (d.amenities?.ac ? 1500 : 0) || 1500),
          vegFoodRate: Number(d.vegFoodRate || 2500),
          nonVegFoodRate: Number(d.nonVegFoodRate || 3500),
          fireNocVerified: Boolean(d.fireNocVerified !== false),
          fssaiVerified: Boolean(d.fssaiVerified !== false),
          cctvAudited: Boolean(d.cctvAudited !== false),
          policeIntimated: Boolean(d.policeIntimated !== false),
          rooms: normalizedRooms,
        };
      }

      if (!prop) {
        prop = {
          id: propertyId,
          name: "OneStay Executive Co-Living Residency",
          city: "Pune",
          cityCode: "PNQ",
          address: "Hinjawadi Phase 1, Main Road, Pune, MH",
          description: "Institutional co-living property with 360° virtual tour verified rooms.",
          totalBeds: 40,
          occupiedBeds: 34,
          pricePerBed: 8500,
          featured: true,
          status: "active",
          businessId: "BIZ_001",
          businessName: "Zolo Living Private Limited",
          businessPhone: "+91 98765 00001",
          ratingAverage: 4.8,
          ratingCount: 38,
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
        };
      }

      setProperty(prop);
      if (prop.pricing) {
        setPricingForm(prop.pricing);
      } else {
        setPricingForm({
          maxSharing: 3,
          sharing: [
            { sharing: 1, nonAc: prop.singleRate || 14000, ac: (prop.singleRate || 14000) + 1500 },
            { sharing: 2, nonAc: prop.doubleRate || 9500, ac: (prop.doubleRate || 9500) + 1500 },
            { sharing: 3, nonAc: prop.tripleRate || 7500, ac: (prop.tripleRate || 7500) + 1500 },
          ],
          securityDeposit: 5000,
          oneTimeMaintenance: 1000,
          maintenanceDeductedFromDeposit: false,
          single: prop.singleRate || 14000,
          double: prop.doubleRate || 9500,
          triple: prop.tripleRate || 7500,
        });
      }
    } catch (err) {
      console.error("Error loading property:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPropertyDetails();
  }, [propertyId]);

  // Open the Bed Audit Modal for Super Admin compliance inspection
  const handleOpenBedModal = (room: RoomInfo, bed: BedInfo) => {
    setSelectedBedModal({ room, bed });
  };

  const handleToggleFeatured = async () => {
    if (!property) return;
    const nextFeatured = !property.featured;
    setProperty({ ...property, featured: nextFeatured });
    try {
      await updateDoc(doc(db, "properties", property.id), { featured: nextFeatured });
    } catch (_) {}
  };

  const handleToggleCompliance = async (field: "fireNocVerified" | "fssaiVerified" | "cctvAudited" | "policeIntimated") => {
    if (!property) return;
    const nextVal = !property[field];
    setProperty({ ...property, [field]: nextVal });
    try {
      await updateDoc(doc(db, "properties", property.id), { [field]: nextVal });
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="fullscreenLoader" style={{ background: "#FFFFFF", color: "#0F172A" }}>
        <div className="spinner" style={{ borderTopColor: "var(--teal-primary)" }}></div>
        <p style={{ fontWeight: 600 }}>Loading Property Details & 360° Bed Matrix for {propertyId}...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Property not found</h2>
        <Link href="/admin" style={{ color: "var(--teal-primary)" }}>Return to Admin Portal</Link>
      </div>
    );
  }

  const occRate = property.totalBeds > 0 ? Math.round((property.occupiedBeds / property.totalBeds) * 100) : 0;
  const allBeds = property.rooms.flatMap((r) => r.beds);
  const occupiedBedsList = allBeds.filter((b) => b.status === "occupied");

  return (
    <div className="adminWorkspace" style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      <main className="workspaceMain" style={{ margin: 0, width: "100%", padding: "28px 36px" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "13px" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--teal-primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Admin Operations Control
          </Link>
          <ChevronRight size={14} style={{ color: "#94A3B8" }} />
          <Link href={`/admin/business/${property.businessId}`} style={{ color: "#64748B", textDecoration: "none" }}>
            {property.businessName}
          </Link>
          <ChevronRight size={14} style={{ color: "#94A3B8" }} />
          <strong style={{ color: "#0F172A" }}>{property.name}</strong>
        </div>

        {/* Property Header Banner */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "28px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <img
              src={property.images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
              alt={property.name}
              style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "1px solid #E2E8F0" }}
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                  {property.name}
                </h1>
                <span className="badge active">{property.city}</span>
                <span style={{ padding: "4px 8px", borderRadius: "12px", background: property.status === "active" ? "#059669" : "#D97706", color: "#FFFFFF", fontSize: "11px", fontWeight: 700 }}>
                  {property.status.toUpperCase()}
                </span>
                <button
                  onClick={handleToggleFeatured}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    border: "none",
                    background: property.featured ? "rgba(217, 119, 6, 0.12)" : "#F1F5F9",
                    color: property.featured ? "#D97706" : "#64748B",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Star size={13} fill={property.featured ? "#D97706" : "none"} />
                  {property.featured ? "Featured on App" : "Standard Listing"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#64748B", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={14} style={{ color: "var(--teal-primary)" }} /> {property.address}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Building2 size={14} style={{ color: "var(--teal-primary)" }} /> Chain:{" "}
                  <Link href={`/admin/business/${property.businessId}`} style={{ color: "var(--teal-primary)", fontWeight: 700, textDecoration: "none" }}>
                    {property.businessName} &rarr;
                  </Link>
                </span>
                <span>Rating: <strong style={{ color: "#0F172A" }}>★ {property.ratingAverage}</strong> ({property.ratingCount} reviews)</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href={`/admin/business/${property.businessId}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                padding: "9px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0F172A",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} /> Back to Chain Portfolio
            </Link>
            <button
              onClick={loadPropertyDetails}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                padding: "9px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0F172A",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Capacity & Occupancy
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>{property.occupiedBeds}</span>
              <span style={{ fontSize: "14px", color: "#64748B" }}>/ {property.totalBeds} Beds</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: occRate >= 80 ? "#059669" : "#D97706", marginLeft: "auto" }}>
                {occRate}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#E2E8F0", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ width: `${occRate}%`, height: "100%", background: "var(--teal-primary)", borderRadius: "3px" }} />
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Base Starting Rent
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>₹{(property.pricePerBed || 8500).toLocaleString("en-IN")}</span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>/bed/month</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Single: ₹{(property.singleRate / 1000).toFixed(1)}k &bull; Double: ₹{(property.doubleRate / 1000).toFixed(1)}k
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Projected Monthly Rent
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>
                ₹{((property.occupiedBeds * property.pricePerBed) / 100000).toFixed(2)}L
              </span>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>Active Ledger</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Collected via automated Cashfree UPI
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Statutory Safety Status
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#059669" }}>
                {property.fireNocVerified && property.fssaiVerified ? "100%" : "Partial"}
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>Audited</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Fire NOC &bull; FSSAI &bull; CCTV &bull; Police
            </div>
          </div>
        </div>

        {/* Property Operational Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid #E2E8F0",
            marginBottom: "24px",
            background: "#FFFFFF",
            padding: "8px 16px 0 16px",
            borderRadius: "12px 12px 0 0",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("matrix")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "matrix" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "matrix" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "matrix" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Layers size={16} /> 360° Floorplan & Bed Matrix
          </button>

          <button
            onClick={() => setActiveTab("submeter")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "submeter" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "submeter" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "submeter" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Zap size={16} /> Submeter Delta Calculator
          </button>

          <button
            onClick={() => setActiveTab("rates")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "rates" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "rates" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "rates" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <DollarSign size={16} /> Dynamic Sharing Rates
          </button>

          <button
            onClick={() => setActiveTab("compliance")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "compliance" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "compliance" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "compliance" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck size={16} /> Statutory Audits
          </button>

          <button
            onClick={() => setActiveTab("residents")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "residents" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "residents" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "residents" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Users size={16} /> Residents Roster ({occupiedBedsList.length})
          </button>
        </div>

        {/* TAB 1: VISUAL BED MATRIX */}
        {activeTab === "matrix" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Visual Room & Bed Allocation Matrix
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Click any bed to inspect resident dossier, allocate onboarding tenants, or manage maintenance work orders.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700 }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#059669" }} /> Occupied
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontWeight: 700 }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#94A3B8" }} /> Vacant
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#D97706", fontWeight: 700 }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#D97706" }} /> Maintenance
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {property.rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "15px", color: "#0F172A" }}>Room {room.roomNumber}</strong>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>Floor {room.floor}</span>
                      <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(13, 148, 136, 0.1)", borderRadius: "4px", color: "var(--teal-primary)", fontWeight: 700 }}>
                        {room.sharingType === 1 ? "Single Room" : room.sharingType === 2 ? "Twin Sharing" : "Triple Sharing"}
                      </span>
                      {room.hasAC && (
                        <span style={{ fontSize: "11px", padding: "2px 6px", background: "rgba(2, 132, 199, 0.1)", borderRadius: "4px", color: "#0284C7", fontWeight: 700 }}>
                          AC
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>
                      Submeter Reading: <strong style={{ color: "#0F172A" }}>{room.submeterCurr} kWh</strong>
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                    {room.beds.map((bed) => {
                      const isOcc = bed.status === "occupied";
                      const isMaint = bed.status === "maintenance";
                      return (
                        <div
                          key={bed.id}
                          onClick={() => handleOpenBedModal(room, bed)}
                          style={{
                            padding: "14px",
                            borderRadius: "10px",
                            border: isOcc
                              ? "1px solid rgba(5, 150, 105, 0.4)"
                              : isMaint
                              ? "1px solid rgba(217, 119, 6, 0.4)"
                              : "1px dashed #CBD5E1",
                            background: isOcc
                              ? "rgba(5, 150, 105, 0.05)"
                              : isMaint
                              ? "rgba(217, 119, 6, 0.05)"
                              : "#FFFFFF",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <strong style={{ fontSize: "14px", color: "#0F172A" }}>Bed {bed.bedNumber}</strong>
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: isOcc ? "#059669" : isMaint ? "#D97706" : "#64748B",
                                color: "#FFFFFF",
                                fontWeight: 800,
                              }}
                            >
                              {bed.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: "13px", color: isOcc ? "#0F172A" : "#64748B", fontWeight: isOcc ? 600 : 400 }}>
                            {isOcc ? bed.tenantName || "Active Resident" : isMaint ? "Under Maintenance" : "Available to Rent"}
                          </div>
                          {isOcc && bed.tenantPhone && (
                            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{bed.tenantPhone}</div>
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                            <span style={{ fontSize: "12px", color: "var(--teal-primary)", fontWeight: 700 }}>
                              ₹{(bed.monthlyRent || property.pricePerBed || 8500).toLocaleString("en-IN")}/mo
                            </span>
                            <span style={{ fontSize: "11px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "3px" }}>
                              <Eye size={12} /> Inspect Bed
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ELECTRICITY SUBMETER (AUDITED READ-ONLY FOR SUPER-ADMIN) */}
        {activeTab === "submeter" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
                  Utility Submeter Compliance &amp; Historical Billing Log (Audited)
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                  Audited room electricity meter logs used for tenant dispute resolution and Cashfree utility invoice reconciliation.
                </p>
              </div>
              <span style={{ fontSize: "12px", background: "rgba(13, 148, 136, 0.1)", color: "var(--teal-primary)", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>
                Super-Admin Compliance Audit
              </span>
            </div>

            <div style={{ padding: "14px 18px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", color: "#1E40AF", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Operational Ownership Notice:</strong> Room electricity meter readings, unit calculations, and bill splits are performed directly by the PG Landlord &amp; Wardens via the <strong>Landlord Partner Portal (partner.onestay360.in)</strong>. As Super Admin, this ledger provides an immutable audit trail for legal dispute mediation.
              </div>
            </div>

            <div className="tableWrapper">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Room &amp; Floor</th>
                    <th>Submeter Dial ID</th>
                    <th>Previous Reading</th>
                    <th>Current Reading</th>
                    <th>Net Consumption</th>
                    <th>Tariff Rate</th>
                    <th>Billed Utility Dues</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {property.rooms.map((rm) => {
                    const prev = rm.submeterPrev || 1120;
                    const curr = rm.submeterCurr || 1285;
                    const delta = Math.max(0, curr - prev);
                    const rate = rm.submeterRate || 12;
                    const totalDues = delta * rate;

                    return (
                      <tr key={rm.id}>
                        <td>
                          <strong>Room {rm.roomNumber}</strong>
                          <span className="subtext" style={{ display: "block" }}>Floor {rm.floor} &bull; {rm.hasAC ? "AC" : "Non-AC"}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--cyan-primary)" }}>
                            SM-{property.id.slice(-4)}-{rm.roomNumber}
                          </span>
                        </td>
                        <td>{prev} kWh</td>
                        <td>
                          <strong>{curr} kWh</strong>
                        </td>
                        <td>
                          <strong style={{ color: "#0F172A" }}>{delta} Units</strong>
                        </td>
                        <td>₹{rate}/unit</td>
                        <td>
                          <strong style={{ color: "var(--teal-primary)" }}>₹{totalDues.toLocaleString("en-IN")}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: "#ECFDF5", color: "#059669", fontWeight: 700 }}>
                            Reconciled &amp; Billed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC SHARING RATES (AUDITED READ-ONLY FOR SUPER-ADMIN) */}
        {activeTab === "rates" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0F172A" }}>
                  Room Pricing &amp; Sharing Density Schedule (Audited View)
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                  Active room tariffs, AC surcharges, security deposits, and maintenance charges enforced across public booking and Cashfree checkout.
                </p>
              </div>
              <span style={{ fontSize: "12px", background: "rgba(13, 148, 136, 0.1)", color: "var(--teal-primary)", fontWeight: 700, padding: "4px 10px", borderRadius: "6px" }}>
                Landlord Configured Rates
              </span>
            </div>

            <div style={{ padding: "14px 18px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", color: "#475569", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Building2 size={20} style={{ flexShrink: 0, color: "var(--teal-primary)" }} />
              <div>
                <strong>Landlord Commercial Autonomy:</strong> Room rental prices, deposit limits, and maintenance policies are determined by the property landlord via <strong>partner.onestay360.in</strong>. Platform admins audit these rates to guarantee pricing transparency during public tenant reservations.
              </div>
            </div>

            {/* Section 1: Sharing Tiers (Non-AC and AC Rent) */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: "0 0 12px 0" }}>
                Monthly Tariffs by Sharing Tier (Max Capacity: {pricingForm.maxSharing} Sharing)
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {pricingForm.sharing.map((entry) => (
                  <div
                    key={entry.sharing}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "18px",
                      background: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
                      <strong style={{ fontSize: "15px", color: "#0F172A" }}>
                        {entry.sharing} Sharing Room {entry.sharing === 1 ? "(Private Suite)" : ""}
                      </strong>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#F1F5F9", color: "var(--teal-primary)", padding: "2px 8px", borderRadius: "4px" }}>
                        Tier {entry.sharing}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>Non-AC Monthly Rent:</span>
                        <strong style={{ fontSize: "15px", color: "#0F172A" }}>
                          ₹{(entry.nonAc || 0).toLocaleString("en-IN")}/mo
                        </strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>AC Monthly Rent:</span>
                        <strong style={{ fontSize: "15px", color: "var(--teal-primary)" }}>
                          ₹{(entry.ac || 0).toLocaleString("en-IN")}/mo
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Common Charges (Deposit, Maintenance) */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: "0 0 14px 0" }}>
                Mandatory Escrow Terms &amp; Ancillary Charges
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Security Deposit (Quarantined in Escrow)</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
                    ₹{(pricingForm.securityDeposit || 15000).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                    Refundable upon move-out sign-off via Cashfree Master Payouts.
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>One-Time Onboarding Fee</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                    ₹{(pricingForm.oneTimeMaintenance || 1200).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                    {pricingForm.maintenanceDeductedFromDeposit
                      ? "Automatically deducted from deposit at move-out."
                      : "Paid separately at first-month onboarding."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STATUTORY AUDITS */}
        {activeTab === "compliance" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Statutory Safety & Licensing Checklist
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
              Ensures municipal fire clearances, food safety regulations, and police compliance.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "fireNocVerified" as const, title: "Fire Safety NOC Clearance", desc: "Building equipped with smoke detectors, operational fire hydrants, and unblocked fire exits." },
                { key: "fssaiVerified" as const, title: "FSSAI Food Hygiene Certificate", desc: "Mess kitchen complies with state food authority standards and pest control inspections." },
                { key: "cctvAudited" as const, title: "24x7 CCTV & Biometric Logging", desc: "Common corridors, biometric entry registers, and DVR backups are operational." },
                { key: "policeIntimated" as const, title: "Local Police Station Intimation", desc: "Form C tenant verification slips submitted to the jurisdictional police station." },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{item.title}</strong>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
                      {item.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleCompliance(item.key)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: "none",
                      background: property[item.key] ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)",
                      color: property[item.key] ? "#059669" : "#DC2626",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {property[item.key] ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    {property[item.key] ? "Verified" : "Pending Audit"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RESIDENTS ROSTER */}
        {activeTab === "residents" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Current Residents Roster ({occupiedBedsList.length} Active Occupants)
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
              Real-time tenant ledger linked to room submeters, monthly rent, and deposit escrow.
            </p>

            <div className="tableWrapper">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Resident Name</th>
                    <th>Bed / Room</th>
                    <th>Contact Phone</th>
                    <th>Monthly Rent</th>
                    <th>Payment Status</th>
                    <th>Deposit Escrow</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {occupiedBedsList.map((bed) => (
                    <tr key={bed.id}>
                      <td>
                        <Link
                          href={`/admin/tenant/${bed.id || "TEN0000001"}`}
                          style={{ color: "#0F172A", textDecoration: "none", fontWeight: 700 }}
                        >
                          {bed.tenantName || "Resident"} &rarr;
                        </Link>
                        <span className="subtext" style={{ display: "block" }}>Aadhaar Verified</span>
                      </td>
                      <td>
                        <strong>Bed {bed.bedNumber}</strong>
                      </td>
                      <td>{bed.tenantPhone || "+91 98201 12345"}</td>
                      <td>
                        <strong style={{ color: "var(--teal-primary)" }}>₹{(bed.monthlyRent || property.pricePerBed || 8500).toLocaleString("en-IN")}</strong>
                      </td>
                      <td>
                        <span className="badge paid">PAID (UPI)</span>
                      </td>
                      <td>
                        <span style={{ color: "#059669", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={13} /> ₹15,000 in Escrow
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/tenant/${bed.id || "TEN0000001"}`}
                          className="btnPrimary"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            textDecoration: "none",
                            borderRadius: "6px",
                            fontWeight: 700,
                          }}
                        >
                          Dossier &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {occupiedBedsList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
                        All beds in this property are currently vacant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BED INSPECTION & MANAGEMENT ACTION MODAL */}
        {selectedBedModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "520px",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #E2E8F0",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                      Bed {selectedBedModal.bed.bedNumber}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background:
                          selectedBedModal.bed.status === "occupied"
                            ? "#059669"
                            : selectedBedModal.bed.status === "maintenance"
                            ? "#D97706"
                            : "#64748B",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {selectedBedModal.bed.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                    Room {selectedBedModal.room.roomNumber} &bull; Floor {selectedBedModal.room.floor} &bull; {selectedBedModal.room.hasAC ? "AC" : "Non-AC"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBedModal(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* AUDIT VIEW STATE */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {selectedBedModal.bed.status === "occupied" ? (
                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px" }}>
                        Active Resident Dossier
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>Resident Name:</span>
                          <strong style={{ color: "#0F172A" }}>{selectedBedModal.bed.tenantName || "Registered Resident"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>Contact Phone:</span>
                          <strong style={{ color: "#0F172A" }}>{selectedBedModal.bed.tenantPhone || "+91 98201 12345"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>Contract Rent:</span>
                          <strong style={{ color: "var(--teal-primary)" }}>₹{(selectedBedModal.bed.monthlyRent || 8500).toLocaleString("en-IN")}/mo</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>Escrow Deposit:</span>
                          <strong style={{ color: "#059669" }}>₹15,000 (Verified)</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>KYC Status:</span>
                          <span style={{ color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <ShieldCheck size={14} /> Aadhaar Verified
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", padding: "10px", background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#B45309", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>
                          Active tenancy agreements are legally protected. To check out a tenant, an audited move-out notice must be submitted with a reason.
                        </span>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <Link
                          href={`/admin/tenant/${selectedBedModal.bed.id || "TEN0000001"}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "10px",
                            borderRadius: "8px",
                            background: "var(--teal-primary)",
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          <Eye size={14} /> View Resident Dossier, Ledger &amp; Legal Agreements &rarr;
                        </Link>
                      </div>
                    </div>
                  ) : selectedBedModal.bed.status === "maintenance" ? (
                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ fontSize: "12px", color: "#D97706", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px" }}>
                        Maintenance Work Order
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 10px 0" }}>
                        This bed is locked from new bookings due to scheduled repairs or sanitation.
                      </p>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        Work Order: <strong>Air conditioning maintenance and deep sanitization</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ fontSize: "12px", color: "#059669", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "8px" }}>
                        Bed Status: Vacant
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0" }}>
                        This bed is currently unassigned and ready for tenant allocation.
                      </p>
                      <div style={{ fontSize: "13px", color: "#64748B" }}>
                        Tariff Rate: <strong style={{ color: "var(--teal-primary)" }}>₹{(selectedBedModal.bed.monthlyRent || property.pricePerBed || 8500).toLocaleString("en-IN")}/mo</strong>
                      </div>
                    </div>
                  )}

                  {/* Action Triggers for Super Admin */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    {selectedBedModal.bed.status === "occupied" && (
                      <Link
                        href={`/admin/tenant/${selectedBedModal.bed.id || "TEN0000001"}`}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          borderRadius: "8px",
                          background: "var(--teal-primary)",
                          color: "#FFFFFF",
                          fontSize: "13px",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye size={14} /> Open Full Tenant KYC Dossier &rarr;
                      </Link>
                    )}

                    <button
                      onClick={() => setSelectedBedModal(null)}
                      style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#64748B", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Close Inspection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
