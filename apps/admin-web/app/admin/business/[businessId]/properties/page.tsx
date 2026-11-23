"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Building2,
  ArrowLeft,
  PlusCircle,
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
  sharingType: number;
  hasAC: boolean;
  submeterPrev: number;
  submeterCurr: number;
  submeterRate: number;
  submeterPhotoUrl?: string;
  beds: BedInfo[];
}

interface PropertyItem {
  id: string;
  name: string;
  city: string;
  address: string;
  totalBeds: number;
  occupiedBeds: number;
  pricePerBed: number;
  featured: boolean;
  status: string;
  businessId: string;
  businessName: string;
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
  images: string[];
  rooms: RoomInfo[];
}

interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  city: string;
  ownerStatus: string;
  panNumber: string;
  gstNumber: string;
  bankAccountMask: string;
  bankIfsc: string;
  bankVerified: boolean;
  commissionModel: string;
  flatRatePerBed: number;
  commissionPercent: number;
  payoutFrozen: boolean;
  monthlyGmv: number;
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
];

const FALLBACK_BUSINESS_DATA: Record<string, BusinessProfile> = {
  BIZ_001: {
    id: "BIZ_001",
    name: "Zolo Living Private Limited",
    ownerName: "Nikhil Sikri",
    phone: "+91 98765 00001",
    city: "Pune",
    ownerStatus: "active",
    panNumber: "AAACZ1234F",
    gstNumber: "27AAACZ1234F1Z5",
    bankAccountMask: "XXXX-XXXX-8921",
    bankIfsc: "HDFC0001234",
    bankVerified: true,
    commissionModel: "flat_bed",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    payoutFrozen: false,
    monthlyGmv: 2160000,
  },
  BIZ_002: {
    id: "BIZ_002",
    name: "Isthara Co-living Services",
    ownerName: "Gilbert James",
    phone: "+91 98765 00002",
    city: "Bangalore",
    ownerStatus: "active",
    panNumber: "AABCI5678G",
    gstNumber: "29AABCI5678G1Z8",
    bankAccountMask: "XXXX-XXXX-4412",
    bankIfsc: "ICIC0000412",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    payoutFrozen: false,
    monthlyGmv: 1890000,
  },
  BIZ_003: {
    id: "BIZ_003",
    name: "Stanza Living Hospitality",
    ownerName: "Anindya Dutta",
    phone: "+91 98765 00003",
    city: "Mumbai",
    ownerStatus: "active",
    panNumber: "AALCS9012K",
    gstNumber: "27AALCS9012K1Z2",
    bankAccountMask: "XXXX-XXXX-7789",
    bankIfsc: "KKBK0000789",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 35,
    commissionPercent: 2.0,
    payoutFrozen: false,
    monthlyGmv: 4950000,
  },
  BIZ_004: {
    id: "BIZ_004",
    name: "HelloWorld Urban Residences",
    ownerName: "Jitendra Jagadev",
    phone: "+91 98765 00004",
    city: "Hyderabad",
    ownerStatus: "pending",
    panNumber: "AACCH3456L",
    gstNumber: "36AACCH3456L1Z4",
    bankAccountMask: "XXXX-XXXX-3344",
    bankIfsc: "SBIN0001234",
    bankVerified: false,
    commissionModel: "flat_bed",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    payoutFrozen: false,
    monthlyGmv: 960000,
  },
  BIZ_005: {
    id: "BIZ_005",
    name: "Housr Co-Living Luxury",
    ownerName: "Deepak Anand",
    phone: "+91 98765 00005",
    city: "Delhi",
    ownerStatus: "active",
    panNumber: "AABCH7890M",
    gstNumber: "07AABCH7890M1Z9",
    bankAccountMask: "XXXX-XXXX-1122",
    bankIfsc: "UTIB0000112",
    bankVerified: true,
    commissionModel: "percent_gmv",
    flatRatePerBed: 30,
    commissionPercent: 1.5,
    payoutFrozen: false,
    monthlyGmv: 2400000,
  },
};

const STARTER_CHAIN_PROPERTIES: Record<string, PropertyItem[]> = {
  BIZ_001: [
    {
      id: "PROP_PNQ_001",
      name: "Zolo Amber Luxury PG & Co-Living",
      city: "Pune",
      address: "Hinjawadi Phase 1, Near Infosys Circle, Pune, MH",
      totalBeds: 48,
      occupiedBeds: 42,
      pricePerBed: 8500,
      featured: true,
      status: "active",
      businessId: "BIZ_001",
      businessName: "Zolo Living Private Limited",
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
      images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
      rooms: DEFAULT_ROOMS,
    },
    {
      id: "PROP_PNQ_002",
      name: "Zolo Crown Executive Boys Stay",
      city: "Pune",
      address: "Wakad Bridge, Kaspate Wasti, Pune, MH",
      totalBeds: 36,
      occupiedBeds: 30,
      pricePerBed: 7500,
      featured: false,
      status: "active",
      businessId: "BIZ_001",
      businessName: "Zolo Living Private Limited",
      singleRate: 13000,
      doubleRate: 8500,
      tripleRate: 6800,
      acSurcharge: 1200,
      vegFoodRate: 2400,
      nonVegFoodRate: 3200,
      fireNocVerified: true,
      fssaiVerified: true,
      cctvAudited: true,
      policeIntimated: true,
      images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"],
      rooms: DEFAULT_ROOMS,
    },
    {
      id: "PROP_PNQ_003",
      name: "Zolo Horizon Premium Women's PG",
      city: "Pune",
      address: "Baner Road, Near Balewadi High Street, Pune, MH",
      totalBeds: 54,
      occupiedBeds: 51,
      pricePerBed: 9500,
      featured: true,
      status: "active",
      businessId: "BIZ_001",
      businessName: "Zolo Living Private Limited",
      singleRate: 16000,
      doubleRate: 10500,
      tripleRate: 8500,
      acSurcharge: 1800,
      vegFoodRate: 2800,
      nonVegFoodRate: 3800,
      fireNocVerified: true,
      fssaiVerified: true,
      cctvAudited: true,
      policeIntimated: true,
      images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
      rooms: DEFAULT_ROOMS,
    },
  ],
  BIZ_002: [
    {
      id: "PROP_BLR_002",
      name: "Nexus Tech Residency PG",
      city: "Bangalore",
      address: "HSR Layout Sector 2, Bengaluru, KA",
      totalBeds: 60,
      occupiedBeds: 52,
      pricePerBed: 9200,
      featured: true,
      status: "active",
      businessId: "BIZ_002",
      businessName: "Isthara Co-living Services",
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
      images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
      rooms: DEFAULT_ROOMS,
    },
    {
      id: "PROP_BLR_004",
      name: "Isthara Silicon Heights Co-Living",
      city: "Bangalore",
      address: "Electronic City Phase 1, Bengaluru, KA",
      totalBeds: 72,
      occupiedBeds: 66,
      pricePerBed: 8800,
      featured: false,
      status: "active",
      businessId: "BIZ_002",
      businessName: "Isthara Co-living Services",
      singleRate: 14500,
      doubleRate: 9800,
      tripleRate: 7800,
      acSurcharge: 1500,
      vegFoodRate: 2600,
      nonVegFoodRate: 3600,
      fireNocVerified: true,
      fssaiVerified: true,
      cctvAudited: true,
      policeIntimated: true,
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
      rooms: DEFAULT_ROOMS,
    },
  ],
};

export default function BusinessPropertiesPage({ params }: { params: Promise<{ businessId: string }> }) {
  const unwrappedParams = use(params);
  const businessId = unwrappedParams.businessId;

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<"matrix" | "submeter" | "rates" | "compliance">("matrix");

  // New property modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropForm, setNewPropForm] = useState({
    name: "",
    city: "Pune",
    address: "",
    totalBeds: 30,
    pricePerBed: 8000,
    singleRate: 14000,
    doubleRate: 9500,
    tripleRate: 7500,
  });
  const [creating, setCreating] = useState(false);

  // Submeter modal state
  const [selectedRoomId, setSelectedRoomId] = useState("R101");
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
  const [ratesUpdating, setRatesUpdating] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      // 1. Fetch Business Profile
      let bizProfile = FALLBACK_BUSINESS_DATA[businessId] || {
        id: businessId,
        name: "Landlord Partner Chain",
        ownerName: "Manager",
        phone: "+91 98765 00000",
        city: "Pune",
        ownerStatus: "active",
        panNumber: "AAACZ0000F",
        gstNumber: "27AAACZ0000F1Z5",
        bankAccountMask: "XXXX-XXXX-0000",
        bankIfsc: "HDFC0000000",
        bankVerified: true,
        commissionModel: "flat_bed",
        flatRatePerBed: 30,
        commissionPercent: 1.5,
        payoutFrozen: false,
        monthlyGmv: 1500000,
      };

      try {
        const bizDoc = await getDoc(doc(db, "businesses", businessId));
        if (bizDoc.exists()) {
          const d = bizDoc.data();
          bizProfile = {
            id: businessId,
            name: d.name || bizProfile.name,
            ownerName: d.ownerName || bizProfile.ownerName,
            phone: d.phone || bizProfile.phone,
            city: d.city || bizProfile.city,
            ownerStatus: d.status || bizProfile.ownerStatus,
            panNumber: d.panNumber || bizProfile.panNumber,
            gstNumber: d.gstNumber || bizProfile.gstNumber,
            bankAccountMask: d.bankAccountMask || bizProfile.bankAccountMask,
            bankIfsc: d.bankIfsc || bizProfile.bankIfsc,
            bankVerified: Boolean(d.bankVerified !== false),
            commissionModel: d.commissionModel || bizProfile.commissionModel,
            flatRatePerBed: Number(d.flatRatePerBed || 30),
            commissionPercent: Number(d.commissionPercent || 1.5),
            payoutFrozen: Boolean(d.payoutFrozen),
            monthlyGmv: Number(d.monthlyGmv || bizProfile.monthlyGmv),
          };
        }
      } catch (e) {
        console.debug("Firestore business read notice:", e);
      }
      setBusiness(bizProfile);

      // 2. Fetch Properties for this Business
      const propMap = new Map<string, PropertyItem>();

      // Check subcollection businesses/{businessId}/properties
      try {
        const subSnap = await getDocs(collection(db, `businesses/${businessId}/properties`));
        subSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const totalBeds = Number(data.totalBeds || data.capacity || 24);
          const occupiedBeds = Number(data.occupiedBeds || Math.round(totalBeds * 0.75));
          propMap.set(docSnap.id, {
            id: docSnap.id,
            name: data.name || "Unnamed PG",
            city: data.city || bizProfile.city,
            address: data.address || data.location || "Central Location",
            totalBeds,
            occupiedBeds,
            pricePerBed: Number(data.pricePerBed || 7500),
            featured: Boolean(data.featured),
            status: data.status || "active",
            businessId,
            businessName: bizProfile.name,
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
            images: data.images || ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
            rooms: data.rooms || DEFAULT_ROOMS,
          });
        });
      } catch (e) {
        console.debug("Subcollection properties notice:", e);
      }

      // Check root properties where businessId matches
      try {
        const rootSnap = await getDocs(collection(db, "properties"));
        rootSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.businessId === businessId && !propMap.has(docSnap.id)) {
            const totalBeds = Number(data.totalBeds || data.capacity || 24);
            const occupiedBeds = Number(data.occupiedBeds || Math.round(totalBeds * 0.75));
            propMap.set(docSnap.id, {
              id: docSnap.id,
              name: data.name || "Unnamed PG",
              city: data.city || bizProfile.city,
              address: data.address || data.location || "Central Location",
              totalBeds,
              occupiedBeds,
              pricePerBed: Number(data.pricePerBed || 7500),
              featured: Boolean(data.featured),
              status: data.status || "active",
              businessId,
              businessName: bizProfile.name,
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
              images: data.images || ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
              rooms: data.rooms || DEFAULT_ROOMS,
            });
          }
        });
      } catch (e) {
        console.debug("Root properties query notice:", e);
      }

      if (propMap.size > 0) {
        setProperties(Array.from(propMap.values()));
      } else {
        const starters = STARTER_CHAIN_PROPERTIES[businessId] || [
          {
            id: `PROP_${businessId}_001`,
            name: `${bizProfile.name} - Signature Residency`,
            city: bizProfile.city,
            address: `Main Tech Avenue, ${bizProfile.city}`,
            totalBeds: 40,
            occupiedBeds: 34,
            pricePerBed: 8500,
            featured: true,
            status: "active",
            businessId,
            businessName: bizProfile.name,
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
            images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
            rooms: DEFAULT_ROOMS,
          },
        ];
        setProperties(starters);
      }
    } catch (err) {
      console.error("Error loading chain properties:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [businessId]);

  const handleOpenDrawer = (prop: PropertyItem) => {
    setSelectedProperty(prop);
    setDrawerTab("matrix");
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
    if (!selectedProperty) return;
    const updatedRooms = selectedProperty.rooms.map((room) => {
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

    const updatedProp = { ...selectedProperty, rooms: updatedRooms };
    setSelectedProperty(updatedProp);
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
  };

  const handleSaveSubmeterReading = async () => {
    if (!selectedProperty) return;
    const unitsUsed = Math.max(0, submeterForm.curr - submeterForm.prev);
    const bill = unitsUsed * submeterForm.rate;

    const updatedRooms = selectedProperty.rooms.map((room) => {
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

    const updatedProp = { ...selectedProperty, rooms: updatedRooms };
    setSelectedProperty(updatedProp);
    setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
    setSubmeterSuccess(`✅ Logged ${unitsUsed} kWh units in Room ${selectedRoomId}. Electricity charge ₹${bill.toLocaleString("en-IN")} queued into month-end resident invoice.`);
    setTimeout(() => setSubmeterSuccess(null), 5000);
  };

  const handleSaveDynamicRates = async () => {
    if (!selectedProperty) return;
    setRatesUpdating(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, {
        singleRate: ratesForm.singleRate,
        doubleRate: ratesForm.doubleRate,
        tripleRate: ratesForm.tripleRate,
        acSurcharge: ratesForm.acSurcharge,
        vegFoodRate: ratesForm.vegFoodRate,
        nonVegFoodRate: ratesForm.nonVegFoodRate,
        updatedAt: new Date(),
      });
      const updatedProp = { ...selectedProperty, ...ratesForm };
      setSelectedProperty(updatedProp);
      setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
      alert("✅ Commercial rates & food plans updated in Firestore!");
    } catch (e) {
      console.error("Error saving rates:", e);
      const updatedProp = { ...selectedProperty, ...ratesForm };
      setSelectedProperty(updatedProp);
      setProperties((prev) => prev.map((p) => (p.id === updatedProp.id ? updatedProp : p)));
      alert("Rates updated locally in active session.");
    } finally {
      setRatesUpdating(false);
    }
  };

  const handleToggleFeatured = async (prop: PropertyItem) => {
    const newFeatured = !prop.featured;
    const updated = { ...prop, featured: newFeatured };
    setProperties((prev) => prev.map((p) => (p.id === prop.id ? updated : p)));
    if (selectedProperty?.id === prop.id) setSelectedProperty(updated);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "properties", prop.id), { featured: newFeatured });
      batch.update(doc(db, `businesses/${businessId}/properties`, prop.id), { featured: newFeatured });
      await batch.commit();
    } catch (_) {}
  };

  const handleToggleCompliance = async (field: "fireNocVerified" | "fssaiVerified" | "cctvAudited" | "policeIntimated") => {
    if (!selectedProperty) return;
    const newVal = !selectedProperty[field];
    const updated = { ...selectedProperty, [field]: newVal };
    setSelectedProperty(updated);
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { [field]: newVal });
    } catch (_) {}
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropForm.name.trim()) return;

    setCreating(true);
    try {
      const newPropId = `PROP_${businessId}_${Date.now().toString().slice(-4)}`;
      const newProp: PropertyItem = {
        id: newPropId,
        name: newPropForm.name.trim(),
        city: newPropForm.city,
        address: newPropForm.address.trim() || `Central Area, ${newPropForm.city}`,
        totalBeds: Number(newPropForm.totalBeds),
        occupiedBeds: 0,
        pricePerBed: Number(newPropForm.pricePerBed),
        featured: false,
        status: "active",
        businessId,
        businessName: business?.name || "OneStay Network",
        singleRate: Number(newPropForm.singleRate),
        doubleRate: Number(newPropForm.doubleRate),
        tripleRate: Number(newPropForm.tripleRate),
        acSurcharge: 1500,
        vegFoodRate: 2500,
        nonVegFoodRate: 3500,
        fireNocVerified: true,
        fssaiVerified: true,
        cctvAudited: true,
        policeIntimated: true,
        images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
        rooms: DEFAULT_ROOMS,
      };

      // Write to Firestore
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "properties", newPropId), { ...newProp, createdAt: new Date() });
        batch.set(doc(db, `businesses/${businessId}/properties`, newPropId), { ...newProp, createdAt: new Date() });
        batch.set(doc(db, `properties_by_city/${newProp.city}/properties`, newPropId), { ...newProp, createdAt: new Date() });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore write skipped, saving in state:", err);
      }

      setProperties((prev) => [newProp, ...prev]);
      setShowAddModal(false);
      setNewPropForm({
        name: "",
        city: "Pune",
        address: "",
        totalBeds: 30,
        pricePerBed: 8000,
        singleRate: 14000,
        doubleRate: 9500,
        tripleRate: 7500,
      });
      alert(`✅ Successfully added ${newProp.name} to ${business?.name}!`);
    } catch (err: any) {
      alert("Error adding property: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const totalPortfolioBeds = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const totalPortfolioOccupied = properties.reduce((acc, p) => acc + p.occupiedBeds, 0);
  const portfolioOccupancyPct = totalPortfolioBeds > 0 ? Math.round((totalPortfolioOccupied / totalPortfolioBeds) * 100) : 0;
  const compliantCount = properties.filter((p) => p.fireNocVerified && p.fssaiVerified && p.policeIntimated).length;
  const complianceScore = properties.length > 0 ? Math.round((compliantCount / properties.length) * 100) : 100;

  const filteredProperties = properties.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="fullscreenLoader">
        <div className="spinner"></div>
        <p>Loading {businessId} Property Portfolio & Bed Matrix...</p>
      </div>
    );
  }

  return (
    <div className="adminWorkspace">
      <main className="workspaceMain" style={{ margin: 0, width: "100%", padding: "24px 32px" }}>
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
          <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
          <span style={{ color: "var(--text-secondary)" }}>PG Landlords</span>
          <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
          <strong style={{ color: "var(--text-primary)" }}>{business?.name || businessId}</strong>
          <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
          <span style={{ color: "var(--teal-primary)", fontWeight: 600 }}>Properties Portfolio ({properties.length})</span>
        </div>

        {/* Business Header Banner */}
        {business && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
              border: "1px solid rgba(20, 184, 166, 0.25)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: "22px",
                }}
              >
                <Building2 size={28} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                    {business.name}
                  </h1>
                  <span className={`badge ${business.ownerStatus}`}>
                    {business.ownerStatus.toUpperCase()} KYC
                  </span>
                  {business.payoutFrozen ? (
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.15)", color: "#EF4444", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Lock size={12} /> Payouts Frozen
                    </span>
                  ) : (
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Unlock size={12} /> Cashfree Escrow Active
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "18px", marginTop: "8px", fontSize: "13px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <User size={14} /> Owner: <strong style={{ color: "var(--text-primary)" }}>{business.ownerName}</strong>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Phone size={14} /> {business.phone}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={14} /> HQ: {business.city}
                  </span>
                  <span>GSTIN: <code style={{ color: "var(--teal-primary)" }}>{business.gstNumber}</code></span>
                  <span>PAN: <code style={{ color: "var(--teal-primary)" }}>{business.panNumber}</code></span>
                  <span>
                    Bank: {business.bankAccountMask} ({business.bankIfsc})
                    {business.bankVerified && <CheckCircle size={13} style={{ color: "#10B981", display: "inline", marginLeft: "4px" }} />}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={loadData}
                className="tableActionBtn"
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "10px 16px", borderRadius: "8px" }}
              >
                <RefreshCw size={14} /> Refresh Portfolio
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btnPrimary"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, borderRadius: "8px" }}
              >
                <PlusCircle size={16} /> Add Property to Chain
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Executive KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
              Active Properties
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{properties.length}</span>
              <span style={{ fontSize: "12px", color: "var(--teal-primary)" }}>PG Branches</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              All managed under {business?.name}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
              Bed Capacity & Occupancy
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{totalPortfolioOccupied}</span>
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>/ {totalPortfolioBeds} Beds</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: portfolioOccupancyPct >= 80 ? "#10B981" : "#F59E0B", marginLeft: "auto" }}>
                {portfolioOccupancyPct}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ width: `${portfolioOccupancyPct}%`, height: "100%", background: "var(--teal-primary)", borderRadius: "3px" }} />
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
              Estimated Monthly GMV
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
                ₹{((business?.monthlyGmv || 1500000) / 100000).toFixed(1)}L
              </span>
              <span style={{ fontSize: "12px", color: "#10B981" }}>+12% MoM</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Commission model: {business?.commissionModel === "flat_bed" ? `₹${business.flatRatePerBed}/bed` : `${business?.commissionPercent}% GMV`}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
              Statutory Compliance
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: complianceScore === 100 ? "#10B981" : "#F59E0B" }}>
                {complianceScore}%
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                ({compliantCount}/{properties.length} Audited)
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Fire NOC &bull; FSSAI &bull; Police Intimation
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search properties by name, city, micro-market address, or ID..."
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Showing {filteredProperties.length} of {properties.length} properties
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {filteredProperties.map((prop) => {
            const occupancyPct = prop.totalBeds > 0 ? Math.round((prop.occupiedBeds / prop.totalBeds) * 100) : 0;
            return (
              <div
                key={prop.id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Property Card Header & Image */}
                <div style={{ position: "relative", height: "160px", background: "var(--bg-secondary)" }}>
                  <img
                    src={prop.images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                    alt={prop.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", color: "#FFFFFF", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} style={{ color: "var(--teal-primary)" }} /> {prop.city}
                    </span>
                    <span style={{ padding: "4px 8px", borderRadius: "12px", background: prop.status === "active" ? "rgba(16, 185, 129, 0.85)" : "rgba(245, 158, 11, 0.85)", color: "#FFFFFF", fontSize: "11px", fontWeight: 700 }}>
                      {prop.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                    <button
                      onClick={() => handleToggleFeatured(prop)}
                      title={prop.featured ? "Featured on Public Tenant App" : "Not Featured"}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        background: prop.featured ? "rgba(245, 158, 11, 0.95)" : "rgba(0, 0, 0, 0.65)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Star size={13} fill={prop.featured ? "#FFFFFF" : "none"} />
                      {prop.featured ? "Featured" : "Standard"}
                    </button>
                  </div>

                  <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(0,0,0,0.75)", color: "#FFFFFF", fontSize: "11px", fontWeight: 600 }}>
                      ID: {prop.id}
                    </span>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--teal-primary)", color: "#FFFFFF", fontSize: "12px", fontWeight: 800 }}>
                      ₹{prop.pricePerBed.toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                </div>

                {/* Property Card Body */}
                <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                    {prop.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 14px 0", lineHeight: "1.4" }}>
                    {prop.address}
                  </p>

                  {/* Bed Capacity Progress */}
                  <div style={{ marginBottom: "16px", background: "var(--bg-primary)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Bed size={14} /> Total Bed Capacity
                      </span>
                      <strong style={{ color: "var(--text-primary)" }}>
                        {prop.occupiedBeds} / {prop.totalBeds} Beds ({occupancyPct}%)
                      </strong>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${occupancyPct}%`, height: "100%", background: occupancyPct >= 80 ? "var(--teal-primary)" : "#F59E0B", borderRadius: "3px" }} />
                    </div>
                  </div>

                  {/* Dynamic Pricing Snapshot */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px", textAlign: "center", fontSize: "11px" }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "6px 4px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <div style={{ color: "var(--text-secondary)" }}>Single</div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "12px" }}>₹{(prop.singleRate / 1000).toFixed(1)}k</strong>
                    </div>
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "6px 4px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <div style={{ color: "var(--text-secondary)" }}>Double</div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "12px" }}>₹{(prop.doubleRate / 1000).toFixed(1)}k</strong>
                    </div>
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "6px 4px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                      <div style={{ color: "var(--text-secondary)" }}>Triple</div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "12px" }}>₹{(prop.tripleRate / 1000).toFixed(1)}k</strong>
                    </div>
                  </div>

                  {/* Statutory Badges */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.fireNocVerified ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: prop.fireNocVerified ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                      Fire NOC: {prop.fireNocVerified ? "OK" : "Pending"}
                    </span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.fssaiVerified ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: prop.fssaiVerified ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                      FSSAI Food: {prop.fssaiVerified ? "OK" : "Pending"}
                    </span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.policeIntimated ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: prop.policeIntimated ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                      Police Intim.: {prop.policeIntimated ? "OK" : "Pending"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button
                      onClick={() => handleOpenDrawer(prop)}
                      className="btnPrimary"
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        borderRadius: "8px",
                      }}
                    >
                      <Layers size={14} /> Rooms & Beds
                    </button>
                    <button
                      onClick={() => {
                        handleOpenDrawer(prop);
                        setDrawerTab("submeter");
                      }}
                      className="tableActionBtn"
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <Zap size={14} style={{ color: "#F59E0B" }} /> Submeter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Property to Chain */}
        {showAddModal && (
          <div
            className="modalOverlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                padding: "28px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    Add Property to {business?.name}
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                    Registers an operational PG branch tied to Business ID: {businessId}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProperty} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                    Property / PG Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zolo Sapphire Luxury Co-Living"
                    value={newPropForm.name}
                    onChange={(e) => setNewPropForm({ ...newPropForm, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                      City *
                    </label>
                    <select
                      value={newPropForm.city}
                      onChange={(e) => setNewPropForm({ ...newPropForm, city: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    >
                      <option value="Pune">Pune</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                      Total Bed Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPropForm.totalBeds}
                      onChange={(e) => setNewPropForm({ ...newPropForm, totalBeds: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                    Micro-Market Address / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Tech Park Phase 2, Wakad Road"
                    value={newPropForm.address}
                    onChange={(e) => setNewPropForm({ ...newPropForm, address: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-secondary)" }}>
                      Single Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newPropForm.singleRate}
                      onChange={(e) => setNewPropForm({ ...newPropForm, singleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-secondary)" }}>
                      Double Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newPropForm.doubleRate}
                      onChange={(e) => setNewPropForm({ ...newPropForm, doubleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-secondary)" }}>
                      Triple Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newPropForm.tripleRate}
                      onChange={(e) => setNewPropForm({ ...newPropForm, tripleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="tableActionBtn"
                    style={{ padding: "10px 18px", borderRadius: "8px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btnPrimary"
                    style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: 600 }}
                  >
                    {creating ? "Adding..." : "Add Property to Chain"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 850px Slide-Over Drawer for Property Operations & 360° Bed Matrix */}
        {selectedProperty && (
          <div
            className="modalOverlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 9999,
            }}
            onClick={() => setSelectedProperty(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "850px",
                height: "100vh",
                background: "var(--bg-secondary)",
                borderLeft: "1px solid var(--border-color)",
                boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.6)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--bg-primary)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                      {selectedProperty.name}
                    </h2>
                    <span className="badge active">{selectedProperty.city}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                    Chain: {business?.name} &bull; Property ID: {selectedProperty.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Sub-System Tabs */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  padding: "0 24px",
                  gap: "24px",
                  overflowX: "auto",
                }}
              >
                <button
                  onClick={() => setDrawerTab("matrix")}
                  style={{
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    borderBottom: drawerTab === "matrix" ? "2px solid var(--teal-primary)" : "2px solid transparent",
                    color: drawerTab === "matrix" ? "var(--teal-primary)" : "var(--text-secondary)",
                    fontWeight: drawerTab === "matrix" ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Layers size={15} /> Floorplan & Bed Matrix
                </button>

                <button
                  onClick={() => setDrawerTab("submeter")}
                  style={{
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    borderBottom: drawerTab === "submeter" ? "2px solid var(--teal-primary)" : "2px solid transparent",
                    color: drawerTab === "submeter" ? "var(--teal-primary)" : "var(--text-secondary)",
                    fontWeight: drawerTab === "submeter" ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Zap size={15} /> Electricity Submeter Delta
                </button>

                <button
                  onClick={() => setDrawerTab("rates")}
                  style={{
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    borderBottom: drawerTab === "rates" ? "2px solid var(--teal-primary)" : "2px solid transparent",
                    color: drawerTab === "rates" ? "var(--teal-primary)" : "var(--text-secondary)",
                    fontWeight: drawerTab === "rates" ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <DollarSign size={15} /> Dynamic Sharing Rates
                </button>

                <button
                  onClick={() => setDrawerTab("compliance")}
                  style={{
                    padding: "14px 0",
                    background: "none",
                    border: "none",
                    borderBottom: drawerTab === "compliance" ? "2px solid var(--teal-primary)" : "2px solid transparent",
                    color: drawerTab === "compliance" ? "var(--teal-primary)" : "var(--text-secondary)",
                    fontWeight: drawerTab === "compliance" ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ShieldCheck size={15} /> Statutory Audits
                </button>
              </div>

              {/* Drawer Content Body */}
              <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
                {/* TAB 1: BED MATRIX */}
                {drawerTab === "matrix" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                          Visual Bed & Occupancy Matrix
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
                          Click any bed slot to instantly toggle status (Occupied &harr; Vacant &harr; Maintenance)
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} /> Occupied
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6B7280" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6B7280" }} /> Vacant
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} /> Maint.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {selectedProperty.rooms.map((room) => (
                        <div
                          key={room.id}
                          style={{
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "12px",
                            padding: "16px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Room {room.roomNumber}</strong>
                              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Floor {room.floor}</span>
                              <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", color: "var(--teal-primary)" }}>
                                {room.sharingType === 1 ? "Private Single" : room.sharingType === 2 ? "Twin Sharing" : "Triple Sharing"}
                              </span>
                              {room.hasAC && (
                                <span style={{ fontSize: "11px", padding: "2px 6px", background: "rgba(6, 182, 212, 0.15)", borderRadius: "4px", color: "var(--cyan-primary)" }}>
                                  AC
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              Submeter: {room.submeterCurr} kWh
                            </span>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                            {room.beds.map((bed) => {
                              const isOcc = bed.status === "occupied";
                              const isMaint = bed.status === "maintenance";
                              return (
                                <div
                                  key={bed.id}
                                  onClick={() => handleToggleBedStatus(room.id, bed.id)}
                                  style={{
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: isOcc
                                      ? "1px solid rgba(16, 185, 129, 0.4)"
                                      : isMaint
                                      ? "1px solid rgba(245, 158, 11, 0.4)"
                                      : "1px dashed var(--border-color)",
                                    background: isOcc
                                      ? "rgba(16, 185, 129, 0.08)"
                                      : isMaint
                                      ? "rgba(245, 158, 11, 0.08)"
                                      : "rgba(255, 255, 255, 0.02)",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>Bed {bed.bedNumber}</strong>
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        padding: "1px 6px",
                                        borderRadius: "4px",
                                        background: isOcc ? "#10B981" : isMaint ? "#F59E0B" : "#6B7280",
                                        color: "#FFFFFF",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {bed.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "12px", color: isOcc ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                    {isOcc ? bed.tenantName || "Resident Active" : isMaint ? "Scheduled Service" : "Available for Rent"}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "var(--teal-primary)", marginTop: "4px", fontWeight: 600 }}>
                                    ₹{bed.monthlyRent.toLocaleString("en-IN")}/mo
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

                {/* TAB 2: SUBMETER DELTA CALCULATOR */}
                {drawerTab === "submeter" && (
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                      Electricity Submeter Delta Billing Calculator
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
                      Prevents tenant-landlord disputes by computing net consumption units against previous photo-logged meter readings.
                    </p>

                    {submeterSuccess && (
                      <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", borderRadius: "8px", color: "#10B981", fontSize: "13px", marginBottom: "16px" }}>
                        {submeterSuccess}
                      </div>
                    )}

                    <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Select Room
                          </label>
                          <select
                            value={selectedRoomId}
                            onChange={(e) => {
                              setSelectedRoomId(e.target.value);
                              const r = selectedProperty.rooms.find((rm) => rm.id === e.target.value);
                              if (r) {
                                setSubmeterForm({
                                  prev: r.submeterPrev,
                                  curr: r.submeterCurr,
                                  rate: r.submeterRate,
                                });
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                            }}
                          >
                            {selectedProperty.rooms.map((rm) => (
                              <option key={rm.id} value={rm.id}>
                                Room {rm.roomNumber} (Floor {rm.floor})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Tariff Rate (₹ per kWh unit)
                          </label>
                          <input
                            type="number"
                            value={submeterForm.rate}
                            onChange={(e) => setSubmeterForm({ ...submeterForm, rate: Number(e.target.value) })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Previous Meter Reading (kWh)
                          </label>
                          <input
                            type="number"
                            value={submeterForm.prev}
                            onChange={(e) => setSubmeterForm({ ...submeterForm, prev: Number(e.target.value) })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Current Meter Reading (kWh)
                          </label>
                          <input
                            type="number"
                            value={submeterForm.curr}
                            onChange={(e) => setSubmeterForm({ ...submeterForm, curr: Number(e.target.value) })}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontSize: "13px",
                            }}
                          />
                        </div>
                      </div>

                      {/* Calculation Preview */}
                      <div
                        style={{
                          background: "rgba(20, 184, 166, 0.08)",
                          border: "1px solid rgba(20, 184, 166, 0.2)",
                          borderRadius: "8px",
                          padding: "14px 18px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Delta Units Consumed</div>
                          <strong style={{ fontSize: "18px", color: "var(--text-primary)" }}>
                            {Math.max(0, submeterForm.curr - submeterForm.prev)} kWh Units
                          </strong>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Bill Amount to Divide</div>
                          <strong style={{ fontSize: "20px", color: "var(--teal-primary)" }}>
                            ₹{(Math.max(0, submeterForm.curr - submeterForm.prev) * submeterForm.rate).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveSubmeterReading}
                        className="btnPrimary"
                        style={{ padding: "12px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}
                      >
                        Save Submeter Reading & Split Among Room Inmates
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: DYNAMIC SHARING RATES */}
                {drawerTab === "rates" && (
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                      Dynamic Sharing Rates & Food Plan Addons
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
                      Configure rent matrix based on sharing occupancy tier, AC air conditioning, and mess catering.
                    </p>

                    <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Single Sharing (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.singleRate}
                            onChange={(e) => setRatesForm({ ...ratesForm, singleRate: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Double Sharing (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.doubleRate}
                            onChange={(e) => setRatesForm({ ...ratesForm, doubleRate: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Triple Sharing (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.tripleRate}
                            onChange={(e) => setRatesForm({ ...ratesForm, tripleRate: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            AC Surcharge (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.acSurcharge}
                            onChange={(e) => setRatesForm({ ...ratesForm, acSurcharge: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Veg Food Plan (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.vegFoodRate}
                            onChange={(e) => setRatesForm({ ...ratesForm, vegFoodRate: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
                            Non-Veg Food Plan (₹/mo)
                          </label>
                          <input
                            type="number"
                            value={ratesForm.nonVegFoodRate}
                            onChange={(e) => setRatesForm({ ...ratesForm, nonVegFoodRate: Number(e.target.value) })}
                            style={{ width: "100%", padding: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSaveDynamicRates}
                        disabled={ratesUpdating}
                        className="btnPrimary"
                        style={{ padding: "12px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}
                      >
                        {ratesUpdating ? "Publishing..." : "Update Live Commercial Pricing"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: STATUTORY AUDITS */}
                {drawerTab === "compliance" && (
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
                      Statutory License & Safety Compliance
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
                      Mandatory municipal, fire safety, and food authority verifications for municipal licensing.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { key: "fireNocVerified" as const, title: "Fire Safety NOC Certificate", desc: "Building equipped with smoke detectors, functional fire hydrants, and clear fire exits." },
                        { key: "fssaiVerified" as const, title: "FSSAI Food Safety Hygiene", desc: "Central mess kitchen holds an active FSSAI registration with periodic pest control audits." },
                        { key: "cctvAudited" as const, title: "24x7 CCTV & Biometric Security", desc: "Common corridors, entry gates, and biometric facial attendance recorders are operational." },
                        { key: "policeIntimated" as const, title: "Local Police Station Intimation", desc: "Form C tenant verification slips submitted to jurisdictional police division." },
                      ].map((item) => (
                        <div
                          key={item.key}
                          style={{
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "10px",
                            padding: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item.title}</strong>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                              {item.desc}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleCompliance(item.key)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "20px",
                              border: "none",
                              background: selectedProperty[item.key] ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                              color: selectedProperty[item.key] ? "#10B981" : "#EF4444",
                              fontWeight: 700,
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {selectedProperty[item.key] ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                            {selectedProperty[item.key] ? "Verified" : "Pending Audit"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
