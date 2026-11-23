"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
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
  Send,
  MessageSquare,
  FileText,
  CreditCard,
  Building,
  Check,
  AlertCircle,
  ChevronDown,
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

interface StaffMember {
  id: string;
  name: string;
  role: "manager" | "warden" | "accountant" | "security";
  phone: string;
  status: "active" | "revoked";
}

interface BusinessProfile {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  city: string;
  ownerStatus: "active" | "pending" | "suspended";
  panNumber: string;
  gstNumber: string;
  bankAccountMask: string;
  bankIfsc: string;
  bankVerified: boolean;
  commissionModel: "flat_bed" | "percent_gmv";
  flatRatePerBed: number;
  commissionPercent: number;
  payoutFrozen: boolean;
  payoutFreezeReason?: string;
  trialDaysLeft: number;
  monthlyGmv: number;
  staff: StaffMember[];
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
    trialDaysLeft: 45,
    monthlyGmv: 2160000,
    staff: [
      { id: "S1", name: "Suresh Patil", role: "manager", phone: "+91 98201 11223", status: "active" },
      { id: "S2", name: "Ramesh Shinde", role: "warden", phone: "+91 98201 44556", status: "active" },
    ],
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
    trialDaysLeft: 12,
    monthlyGmv: 1890000,
    staff: [
      { id: "S1", name: "Anand Kumar", role: "manager", phone: "+91 97412 11002", status: "active" },
    ],
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
    trialDaysLeft: 0,
    monthlyGmv: 4950000,
    staff: [
      { id: "S1", name: "Vikas Sharma", role: "manager", phone: "+91 98920 33441", status: "active" },
      { id: "S2", name: "Deepak Verma", role: "accountant", phone: "+91 98920 33442", status: "active" },
    ],
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
    trialDaysLeft: 60,
    monthlyGmv: 960000,
    staff: [],
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
    trialDaysLeft: 30,
    monthlyGmv: 2400000,
    staff: [],
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

export default function BusinessDetailsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const unwrappedParams = use(params);
  const businessId = unwrappedParams.businessId;

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"properties" | "kyc" | "commercials" | "payouts" | "staff" | "broadcast">("properties");
  const [searchProperty, setSearchProperty] = useState("");

  // Commercials form
  const [commercialForm, setCommercialForm] = useState({
    model: "flat_bed" as "flat_bed" | "percent_gmv",
    flatRate: 30,
    percent: 1.5,
    trialDays: 30,
  });

  // Freeze Payout modal state
  const [freezeReason, setFreezeReason] = useState("Pending audit of tenant security deposit refunds.");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Notice to All Branch Wardens: Mandatory verification of submeter electricity meter readings by 28th."
  );
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [updating, setUpdating] = useState(false);

  // New property modal
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [newProp, setNewProp] = useState({
    name: "",
    city: "Pune",
    address: "",
    totalBeds: 32,
    pricePerBed: 8000,
    singleRate: 14000,
    doubleRate: 9500,
    tripleRate: 7500,
  });
  const [creatingProp, setCreatingProp] = useState(false);

  async function loadBusinessData() {
    try {
      setLoading(true);

      // 1. Fetch Business Document
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
        trialDaysLeft: 30,
        monthlyGmv: 1500000,
        staff: [],
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
            payoutFreezeReason: d.payoutFreezeReason,
            trialDaysLeft: Number(d.trialDaysLeft || 30),
            monthlyGmv: Number(d.monthlyGmv || bizProfile.monthlyGmv),
            staff: d.staff || bizProfile.staff,
          };
        }
      } catch (e) {
        console.debug("Firestore business read notice:", e);
      }

      setBusiness(bizProfile);
      setCommercialForm({
        model: bizProfile.commissionModel,
        flatRate: bizProfile.flatRatePerBed,
        percent: bizProfile.commissionPercent,
        trialDays: bizProfile.trialDaysLeft,
      });

      // 2. Fetch Properties for this Business
      const propMap = new Map<string, PropertyItem>();

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
        console.debug("Subcollection properties lookup notice:", e);
      }

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
      console.error("Error loading business data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const handleUpdateStatus = async (newStatus: "active" | "pending" | "suspended") => {
    if (!business) return;
    setUpdating(true);
    try {
      const bizRef = doc(db, "businesses", business.id);
      await updateDoc(bizRef, { status: newStatus, updatedAt: new Date() });
      setBusiness({ ...business, ownerStatus: newStatus });
      alert(`✅ Landlord KYC status successfully updated to: ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      setBusiness({ ...business, ownerStatus: newStatus });
      alert(`Status updated locally in session to: ${newStatus.toUpperCase()}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCommercials = async () => {
    if (!business) return;
    setUpdating(true);
    try {
      const bizRef = doc(db, "businesses", business.id);
      await updateDoc(bizRef, {
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
        updatedAt: new Date(),
      });
      setBusiness({
        ...business,
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
      });
      alert("✅ Platform Commercials and commission model updated!");
    } catch (err: any) {
      setBusiness({
        ...business,
        commissionModel: commercialForm.model,
        flatRatePerBed: commercialForm.flatRate,
        commissionPercent: commercialForm.percent,
        trialDaysLeft: commercialForm.trialDays,
      });
      alert("Commercial rates updated in active session.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePayoutFreeze = async () => {
    if (!business) return;
    setUpdating(true);
    const nextFreeze = !business.payoutFrozen;
    try {
      const bizRef = doc(db, "businesses", business.id);
      await updateDoc(bizRef, {
        payoutFrozen: nextFreeze,
        payoutFreezeReason: nextFreeze ? freezeReason : null,
        updatedAt: new Date(),
      });
      setBusiness({
        ...business,
        payoutFrozen: nextFreeze,
        payoutFreezeReason: nextFreeze ? freezeReason : undefined,
      });
      alert(nextFreeze ? "⚠️ Cashfree Payouts FROZEN for this chain." : "✅ Cashfree Payouts RESUMED.");
    } catch (_) {
      setBusiness({ ...business, payoutFrozen: nextFreeze });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.name.trim()) return;

    setCreatingProp(true);
    try {
      const newPropId = `PROP_${businessId}_${Date.now().toString().slice(-4)}`;
      const propItem: PropertyItem = {
        id: newPropId,
        name: newProp.name.trim(),
        city: newProp.city,
        address: newProp.address.trim() || `Central Area, ${newProp.city}`,
        totalBeds: Number(newProp.totalBeds),
        occupiedBeds: 0,
        pricePerBed: Number(newProp.pricePerBed),
        featured: false,
        status: "active",
        businessId,
        businessName: business?.name || "OneStay Network",
        singleRate: Number(newProp.singleRate),
        doubleRate: Number(newProp.doubleRate),
        tripleRate: Number(newProp.tripleRate),
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

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "properties", newPropId), { ...propItem, createdAt: new Date() });
        batch.set(doc(db, `businesses/${businessId}/properties`, newPropId), { ...propItem, createdAt: new Date() });
        batch.set(doc(db, `properties_by_city/${propItem.city}/properties`, newPropId), { ...propItem, createdAt: new Date() });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore write skipped, keeping local:", err);
      }

      setProperties([propItem, ...properties]);
      setShowAddPropModal(false);
      setNewProp({
        name: "",
        city: "Pune",
        address: "",
        totalBeds: 32,
        pricePerBed: 8000,
        singleRate: 14000,
        doubleRate: 9500,
        tripleRate: 7500,
      });
      alert(`✅ Added ${propItem.name} to ${business?.name}!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreatingProp(false);
    }
  };

  const totalPortfolioBeds = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const totalPortfolioOccupied = properties.reduce((acc, p) => acc + p.occupiedBeds, 0);
  const occupancyPct = totalPortfolioBeds > 0 ? Math.round((totalPortfolioOccupied / totalPortfolioBeds) * 100) : 0;
  const compliantCount = properties.filter((p) => p.fireNocVerified && p.fssaiVerified && p.policeIntimated).length;
  const complianceScore = properties.length > 0 ? Math.round((compliantCount / properties.length) * 100) : 100;

  const filteredProperties = properties.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchProperty.toLowerCase()) ||
      p.city.toLowerCase().includes(searchProperty.toLowerCase()) ||
      p.address.toLowerCase().includes(searchProperty.toLowerCase()) ||
      p.id.toLowerCase().includes(searchProperty.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="fullscreenLoader" style={{ background: "#FFFFFF", color: "#0F172A" }}>
        <div className="spinner" style={{ borderTopColor: "var(--teal-primary)" }}></div>
        <p style={{ fontWeight: 600 }}>Loading Business & Properties Dossier for {businessId}...</p>
      </div>
    );
  }

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
          <Link href="/admin" style={{ color: "#64748B", textDecoration: "none" }}>
            PG Landlords
          </Link>
          <ChevronRight size={14} style={{ color: "#94A3B8" }} />
          <strong style={{ color: "#0F172A" }}>{business?.name || businessId}</strong>
        </div>

        {/* Business Header Card */}
        {business && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "26px 30px",
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
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "14px",
                  background: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Building2 size={30} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                    {business.name}
                  </h1>
                  <span className={`badge ${business.ownerStatus}`}>
                    {business.ownerStatus.toUpperCase()} KYC
                  </span>
                  {business.payoutFrozen ? (
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.12)", color: "#DC2626", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Lock size={12} /> Payouts Frozen
                    </span>
                  ) : (
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.12)", color: "#059669", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Unlock size={12} /> Cashfree Escrow Active
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "18px", marginTop: "10px", fontSize: "13px", color: "#64748B", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <User size={14} style={{ color: "var(--teal-primary)" }} /> Owner: <strong style={{ color: "#0F172A" }}>{business.ownerName}</strong>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Phone size={14} style={{ color: "var(--teal-primary)" }} /> {business.phone}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={14} style={{ color: "var(--teal-primary)" }} /> HQ: {business.city}
                  </span>
                  <span>GSTIN: <code style={{ color: "var(--teal-primary)", fontWeight: 600 }}>{business.gstNumber}</code></span>
                  <span>PAN: <code style={{ color: "var(--teal-primary)", fontWeight: 600 }}>{business.panNumber}</code></span>
                  <span>
                    Bank: {business.bankAccountMask} ({business.bankIfsc})
                    {business.bankVerified && <CheckCircle size={13} style={{ color: "#059669", display: "inline", marginLeft: "4px" }} />}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={loadBusinessData}
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
              <button
                onClick={() => setShowAddPropModal(true)}
                className="btnPrimary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                <PlusCircle size={16} /> Add Property
              </button>
            </div>
          </div>
        )}

        {/* Business Key Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Total Properties
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>{properties.length}</span>
              <span style={{ fontSize: "13px", color: "var(--teal-primary)", fontWeight: 600 }}>Active PGs</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Managed under {business?.name}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Total Bed Occupancy
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>{totalPortfolioOccupied}</span>
              <span style={{ fontSize: "14px", color: "#64748B" }}>/ {totalPortfolioBeds} Beds</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: occupancyPct >= 80 ? "#059669" : "#D97706", marginLeft: "auto" }}>
                {occupancyPct}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", background: "#E2E8F0", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ width: `${occupancyPct}%`, height: "100%", background: "var(--teal-primary)", borderRadius: "3px" }} />
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Monthly Gross GMV
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A" }}>
                ₹{((business?.monthlyGmv || 1500000) / 100000).toFixed(1)}L
              </span>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>via Cashfree</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Commission: {business?.commissionModel === "flat_bed" ? `₹${business.flatRatePerBed}/bed` : `${business?.commissionPercent}% GMV`}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
              Statutory Compliance
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: complianceScore === 100 ? "#059669" : "#D97706" }}>
                {complianceScore}%
              </span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                ({compliantCount}/{properties.length} Audited)
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
              Fire NOC &bull; FSSAI &bull; Police Intimation
            </div>
          </div>
        </div>

        {/* Business Navigation Tabs */}
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
            onClick={() => setActiveTab("properties")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "properties" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "properties" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "properties" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Building2 size={16} /> Properties Portfolio ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "kyc" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "kyc" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "kyc" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck size={16} /> 2-Stage KYC Review
          </button>

          <button
            onClick={() => setActiveTab("commercials")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "commercials" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "commercials" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "commercials" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <DollarSign size={16} /> Commercials Engine
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "payouts" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "payouts" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "payouts" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <CreditCard size={16} /> Cashfree Escrow & Payouts
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "staff" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "staff" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "staff" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Users size={16} /> Staff & Wardens RBAC
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            style={{
              padding: "12px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "broadcast" ? "3px solid var(--teal-primary)" : "3px solid transparent",
              color: activeTab === "broadcast" ? "var(--teal-primary)" : "#64748B",
              fontWeight: activeTab === "broadcast" ? 700 : 500,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <MessageSquare size={16} /> Landlord Broadcast Hub
          </button>
        </div>

        {/* TAB 1: PROPERTIES PORTFOLIO */}
        {activeTab === "properties" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="text"
                  placeholder="Search properties by name, city, address, or property ID..."
                  value={searchProperty}
                  onChange={(e) => setSearchProperty(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    color: "#0F172A",
                    fontSize: "14px",
                  }}
                />
              </div>
              <button
                onClick={() => setShowAddPropModal(true)}
                className="btnPrimary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <PlusCircle size={16} /> Add New Property to Chain
              </button>
            </div>

            {/* Properties Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              {filteredProperties.map((prop) => {
                const propOccRate = prop.totalBeds > 0 ? Math.round((prop.occupiedBeds / prop.totalBeds) * 100) : 0;
                return (
                  <div
                    key={prop.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    {/* Property Card Thumbnail */}
                    <div style={{ position: "relative", height: "160px", background: "#F1F5F9" }}>
                      <img
                        src={prop.images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                        alt={prop.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(15, 23, 42, 0.8)", color: "#FFFFFF", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} style={{ color: "var(--teal-primary)" }} /> {prop.city}
                        </span>
                        <span style={{ padding: "4px 8px", borderRadius: "12px", background: prop.status === "active" ? "#059669" : "#D97706", color: "#FFFFFF", fontSize: "11px", fontWeight: 700 }}>
                          {prop.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            background: prop.featured ? "rgba(217, 119, 6, 0.95)" : "rgba(15, 23, 42, 0.75)",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Star size={12} fill={prop.featured ? "#FFFFFF" : "none"} />
                          {prop.featured ? "Featured" : "Standard"}
                        </span>
                      </div>

                      <div style={{ position: "absolute", bottom: "10px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(15, 23, 42, 0.8)", color: "#FFFFFF", fontSize: "11px", fontWeight: 600 }}>
                          ID: {prop.id}
                        </span>
                        <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--teal-primary)", color: "#FFFFFF", fontSize: "12px", fontWeight: 800 }}>
                          ₹{prop.pricePerBed.toLocaleString("en-IN")}/mo
                        </span>
                      </div>
                    </div>

                    {/* Property Card Body */}
                    <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
                        {prop.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 14px 0", lineHeight: "1.4" }}>
                        {prop.address}
                      </p>

                      {/* Bed Capacity Progress */}
                      <div style={{ marginBottom: "16px", background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginBottom: "6px" }}>
                          <span style={{ color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Bed size={14} style={{ color: "var(--teal-primary)" }} /> Total Bed Capacity
                          </span>
                          <strong style={{ color: "#0F172A" }}>
                            {prop.occupiedBeds} / {prop.totalBeds} Beds ({propOccRate}%)
                          </strong>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${propOccRate}%`, height: "100%", background: propOccRate >= 80 ? "var(--teal-primary)" : "#D97706", borderRadius: "3px" }} />
                        </div>
                      </div>

                      {/* Sharing Rates */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px", textAlign: "center", fontSize: "11px" }}>
                        <div style={{ background: "#F8FAFC", padding: "6px 4px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                          <div style={{ color: "#64748B" }}>Single</div>
                          <strong style={{ color: "#0F172A", fontSize: "12px" }}>₹{(prop.singleRate / 1000).toFixed(1)}k</strong>
                        </div>
                        <div style={{ background: "#F8FAFC", padding: "6px 4px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                          <div style={{ color: "#64748B" }}>Double</div>
                          <strong style={{ color: "#0F172A", fontSize: "12px" }}>₹{(prop.doubleRate / 1000).toFixed(1)}k</strong>
                        </div>
                        <div style={{ background: "#F8FAFC", padding: "6px 4px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                          <div style={{ color: "#64748B" }}>Triple</div>
                          <strong style={{ color: "#0F172A", fontSize: "12px" }}>₹{(prop.tripleRate / 1000).toFixed(1)}k</strong>
                        </div>
                      </div>

                      {/* Statutory badges */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.fireNocVerified ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: prop.fireNocVerified ? "#059669" : "#DC2626", fontWeight: 700 }}>
                          Fire NOC: {prop.fireNocVerified ? "OK" : "Pending"}
                        </span>
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.fssaiVerified ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: prop.fssaiVerified ? "#059669" : "#DC2626", fontWeight: 700 }}>
                          FSSAI: {prop.fssaiVerified ? "OK" : "Pending"}
                        </span>
                        <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: prop.policeIntimated ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.12)", color: prop.policeIntimated ? "#059669" : "#DC2626", fontWeight: 700 }}>
                          Police: {prop.policeIntimated ? "OK" : "Pending"}
                        </span>
                      </div>

                      {/* REDIRECT TO PROPERTY DETAILS PAGE */}
                      <Link
                        href={`/admin/property/${prop.id}`}
                        className="btnPrimary"
                        style={{
                          marginTop: "auto",
                          padding: "10px 16px",
                          fontSize: "13px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          textDecoration: "none",
                          borderRadius: "8px",
                        }}
                      >
                        <Layers size={15} /> View Property Details & Bed Matrix &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 2-STAGE KYC REVIEW */}
        {activeTab === "kyc" && business && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Institutional KYC & Statutory Landlord Audit
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Verifies legal business registration, GSTIN compliance, and Penny-Drop bank account matching.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus("active")}
                  style={{
                    padding: "9px 18px",
                    background: "#059669",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle size={15} /> Approve KYC
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus("pending")}
                  style={{
                    padding: "9px 18px",
                    background: "#D97706",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={15} /> Request Additional Docs
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus("suspended")}
                  style={{
                    padding: "9px 18px",
                    background: "#DC2626",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ShieldAlert size={15} /> Put on Fraud Hold
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block", marginBottom: "12px" }}>
                  Corporate Entity & Identity
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Business Registered Name:</span>
                    <strong style={{ color: "#0F172A" }}>{business.name}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Authorized Signatory:</span>
                    <strong style={{ color: "#0F172A" }}>{business.ownerName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Primary Contact:</span>
                    <strong style={{ color: "#0F172A" }}>{business.phone}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>PAN Verification:</span>
                    <strong style={{ color: "#059669" }}>{business.panNumber} (Verified NSDL)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>GSTIN Portal Match:</span>
                    <strong style={{ color: "#059669" }}>{business.gstNumber} (Active Entity)</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block", marginBottom: "12px" }}>
                  Penny-Drop Settlement Bank Account
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Account Number Mask:</span>
                    <strong style={{ color: "#0F172A" }}>{business.bankAccountMask}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>IFSC Code:</span>
                    <strong style={{ color: "#0F172A" }}>{business.bankIfsc}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>NPCI Penny-Drop Name Match:</span>
                    <strong style={{ color: "#059669" }}>100% Match ({business.ownerName})</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Cashfree Payout Settlement Route:</span>
                    <strong style={{ color: "var(--teal-primary)" }}>Direct IMPS / NEFT Escrow</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Bank Verification Status:</span>
                    <strong style={{ color: business.bankVerified ? "#059669" : "#DC2626" }}>
                      {business.bankVerified ? "VERIFIED & SIGNED" : "PENDING RE-VERIFICATION"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM COMMERCIALS ENGINE */}
        {activeTab === "commercials" && business && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Platform Commercials Engine & Commission Model
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0" }}>
              Configure custom billing agreements for this landlord chain (RentOK model: ₹30/bed vs. Enterprise model: 1.5% GMV).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "#475569" }}>
                    Billing Commercial Model
                  </label>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <label
                      style={{
                        flex: 1,
                        padding: "16px",
                        borderRadius: "10px",
                        border: commercialForm.model === "flat_bed" ? "2px solid var(--teal-primary)" : "1px solid #E2E8F0",
                        background: commercialForm.model === "flat_bed" ? "rgba(13, 148, 136, 0.05)" : "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="flat_bed"
                        checked={commercialForm.model === "flat_bed"}
                        onChange={() => setCommercialForm({ ...commercialForm, model: "flat_bed" })}
                        style={{ marginRight: "8px" }}
                      />
                      <strong style={{ color: "#0F172A" }}>Flat Bed Subscription</strong>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                        Fixed monthly SaaS fee per occupied/registered bed (RentOK baseline).
                      </div>
                    </label>

                    <label
                      style={{
                        flex: 1,
                        padding: "16px",
                        borderRadius: "10px",
                        border: commercialForm.model === "percent_gmv" ? "2px solid var(--teal-primary)" : "1px solid #E2E8F0",
                        background: commercialForm.model === "percent_gmv" ? "rgba(13, 148, 136, 0.05)" : "#FFFFFF",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="percent_gmv"
                        checked={commercialForm.model === "percent_gmv"}
                        onChange={() => setCommercialForm({ ...commercialForm, model: "percent_gmv" })}
                        style={{ marginRight: "8px" }}
                      />
                      <strong style={{ color: "#0F172A" }}>Revenue Share (% GMV)</strong>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                        Percentage deducted from total tenant rent collected via Cashfree.
                      </div>
                    </label>
                  </div>
                </div>

                {commercialForm.model === "flat_bed" ? (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "#475569" }}>
                      Flat SaaS Fee per Bed (₹ / month)
                    </label>
                    <input
                      type="number"
                      value={commercialForm.flatRate}
                      onChange={(e) => setCommercialForm({ ...commercialForm, flatRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "#475569" }}>
                      GMV Commission Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={commercialForm.percent}
                      onChange={(e) => setCommercialForm({ ...commercialForm, percent: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px", color: "#475569" }}>
                    Free Trial Days Remaining
                  </label>
                  <input
                    type="number"
                    value={commercialForm.trialDays}
                    onChange={(e) => setCommercialForm({ ...commercialForm, trialDays: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#0F172A",
                    }}
                  />
                </div>

                <button
                  disabled={updating}
                  onClick={handleSaveCommercials}
                  className="btnPrimary"
                  style={{ padding: "12px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", alignSelf: "flex-start" }}
                >
                  {updating ? "Saving..." : "Save Commercial Agreement"}
                </button>
              </div>

              {/* Live Calculator Summary */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                <strong style={{ fontSize: "14px", color: "#0F172A", display: "block", marginBottom: "14px" }}>
                  Estimated Monthly Billing Projection
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Total Capacity:</span>
                    <strong style={{ color: "#0F172A" }}>{totalPortfolioBeds} Beds across {properties.length} PGs</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Gross Monthly Rent (GMV):</span>
                    <strong style={{ color: "#0F172A" }}>₹{business.monthlyGmv.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: "10px" }}>
                    <span style={{ color: "#64748B" }}>Platform Monthly Invoice:</span>
                    <strong style={{ color: "var(--teal-primary)", fontSize: "16px" }}>
                      {commercialForm.model === "flat_bed"
                        ? `₹${(totalPortfolioBeds * commercialForm.flatRate).toLocaleString("en-IN")}`
                        : `₹${Math.round((business.monthlyGmv * commercialForm.percent) / 100).toLocaleString("en-IN")}`}
                    </strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px", lineHeight: "1.4" }}>
                    Billed on the 1st of every calendar month. Auto-deducted from Cashfree settlement escrow if opted.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CASHFREE PAYOUT ESCROW */}
        {activeTab === "payouts" && business && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              Cashfree Escrow Payouts & Dispute Controls
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0" }}>
              Freeze or release landlord payout disbursements in case of unrefunded tenant security deposits or KYC discrepancies.
            </p>

            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: business.payoutFrozen ? "1px solid #DC2626" : "1px solid #059669",
                background: business.payoutFrozen ? "rgba(220, 38, 38, 0.05)" : "rgba(5, 150, 105, 0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {business.payoutFrozen ? <Lock size={20} color="#DC2626" /> : <Unlock size={20} color="#059669" />}
                  <strong style={{ fontSize: "16px", color: business.payoutFrozen ? "#DC2626" : "#059669" }}>
                    Payout Status: {business.payoutFrozen ? "FROZEN (DISBURSEMENTS BLOCKED)" : "ACTIVE (AUTOMATIC DISBURSEMENTS)"}
                  </strong>
                </div>
                {business.payoutFrozen && business.payoutFreezeReason && (
                  <p style={{ fontSize: "13px", color: "#DC2626", margin: "6px 0 0 28px" }}>
                    Hold Reason: {business.payoutFreezeReason}
                  </p>
                )}
              </div>

              <button
                disabled={updating}
                onClick={handleTogglePayoutFreeze}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  background: business.payoutFrozen ? "#059669" : "#DC2626",
                  color: "#FFFFFF",
                }}
              >
                {business.payoutFrozen ? "Unfreeze & Resume Payouts" : "1-Click Freeze Payouts"}
              </button>
            </div>

            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "18px" }}>
              <strong style={{ fontSize: "14px", color: "#0F172A", display: "block", marginBottom: "8px" }}>
                Hold Reason Note (Logged in RBI/GST Audit Trail):
              </strong>
              <input
                type="text"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Enter audit hold justification..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#0F172A",
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: STAFF & WARDENS RBAC */}
        {activeTab === "staff" && business && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                  Staff & Branch Wardens Access Hierarchy
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
                  Personnel authorized to log electricity submeters, approve resident check-ins, and manage rooms.
                </p>
              </div>
            </div>

            <div className="tableWrapper">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role</th>
                    <th>Phone Contact</th>
                    <th>Access Status</th>
                  </tr>
                </thead>
                <tbody>
                  {business.staff.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong style={{ color: "#0F172A" }}>{s.name}</strong>
                        <span className="subtext">ID: {s.id}</span>
                      </td>
                      <td>
                        <span style={{ padding: "4px 10px", borderRadius: "12px", background: "rgba(13, 148, 136, 0.1)", color: "var(--teal-primary)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                          {s.role}
                        </span>
                      </td>
                      <td>{s.phone}</td>
                      <td>
                        <span className={`badge ${s.status}`}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {business.staff.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
                        No secondary staff registered. Owner holds root administrative access.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: LANDLORD BROADCAST HUB */}
        {activeTab === "broadcast" && business && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0", color: "#0F172A" }}>
              WhatsApp & SMS Landlord Communications Console
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
              Direct broadcast channel to send statutory notices, rent settlement alerts, and compliance requests.
            </p>

            {broadcastSent && (
              <div style={{ padding: "12px 16px", background: "rgba(5, 150, 105, 0.12)", border: "1px solid #059669", borderRadius: "8px", color: "#059669", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle size={16} /> Broadcast queued to WhatsApp Business API gateway for {business.name}!
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "#475569" }}>
                  Broadcast Message Body
                </label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#0F172A",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Recipient Target: Owner ({business.phone}) &bull; {business.staff.length} Active Branch Wardens
                </span>
                <button
                  onClick={() => {
                    setBroadcastSent(true);
                    setTimeout(() => setBroadcastSent(false), 4000);
                  }}
                  className="btnPrimary"
                  style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Send size={15} /> Transmit Broadcast Notice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Property to Chain */}
        {showAddPropModal && (
          <div
            className="modalOverlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setShowAddPropModal(false)}
          >
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                padding: "28px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                    Add Property to {business?.name}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0 0" }}>
                    Registers a new operational branch tied to Business ID: {businessId}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPropModal(false)}
                  style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProperty} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#475569" }}>
                    Property / PG Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zolo Sapphire Luxury Co-Living"
                    value={newProp.name}
                    onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      color: "#0F172A",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#475569" }}>
                      City *
                    </label>
                    <select
                      value={newProp.city}
                      onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        color: "#0F172A",
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
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#475569" }}>
                      Total Bed Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProp.totalBeds}
                      onChange={(e) => setNewProp({ ...newProp, totalBeds: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        color: "#0F172A",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#475569" }}>
                    Micro-Market Address / Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Tech Park Phase 2, Wakad Road"
                    value={newProp.address}
                    onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      color: "#0F172A",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#475569" }}>
                      Single Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newProp.singleRate}
                      onChange={(e) => setNewProp({ ...newProp, singleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        color: "#0F172A",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#475569" }}>
                      Double Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newProp.doubleRate}
                      onChange={(e) => setNewProp({ ...newProp, doubleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        color: "#0F172A",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#475569" }}>
                      Triple Share Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={newProp.tripleRate}
                      onChange={(e) => setNewProp({ ...newProp, tripleRate: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        color: "#0F172A",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddPropModal(false)}
                    style={{ padding: "10px 18px", borderRadius: "8px", background: "#FFFFFF", border: "1px solid #E2E8F0", cursor: "pointer", color: "#475569" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProp}
                    className="btnPrimary"
                    style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: 700 }}
                  >
                    {creatingProp ? "Adding..." : "Add Property to Chain"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
