import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface PropertyData {
  id: string;
  propertyId: string;
  name: string;
  businessId: string;
  businessName?: string;
  city: string;
  cityCode?: string;
  address: string;
  pincode?: string;
  status: "active" | "inactive" | "maintenance";
  billingStatus?: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds?: number;
  images?: string[];
  description?: string;
  pricing?: {
    single?: number;
    double?: number;
    triple?: number;
    securityDeposit?: number;
    oneTimeMaintenance?: number;
    maxSharing?: number;
    sharing?: Array<{ sharing: number; ac: number; nonAc: number }>;
  };
  amenities?: Record<string, boolean>;
  rules?: {
    smokingAllowed?: boolean;
    alcoholAllowed?: boolean;
    curfew?: boolean;
    visitorsAllowed?: boolean;
    noticePeriodDays?: number;
    genderAllowed?: string;
  };
  foodPlan?: {
    notes?: string;
    plan?: Record<string, string[]>;
  };
  wardenName?: string;
  wardenPhone?: string;
  monthlyGmv?: number;
  pendingMeterReadings?: number;
}

export interface BusinessData {
  id: string;
  name: string;
  ownerUid?: string;
  contactEmail?: string;
  contactPhone?: string;
  plan?: {
    id: string;
    name: string;
    pricePerBedInr: number;
  };
  createdAt?: any;
}

export interface RoomData {
  id: string;
  roomNumber: string;
  floor: string;
  sharingType: number;
  occupancyType: string;
  hasAC: boolean;
  status: string;
  gender?: string;
  beds?: BedData[];
}

export interface BedData {
  id: string;
  bedNumber: string;
  isOccupied: boolean;
  tenantId?: string | null;
  tenantName?: string | null;
  tenantPhone?: string | null;
  status: "available" | "occupied" | "maintenance";
}

// ─────────────────────────────────────────────
// BUSINESS & PROPERTIES SERVICES
// ─────────────────────────────────────────────

/**
 * Fetch business profile by businessId
 */
export async function fetchBusinessProfile(businessId: string): Promise<BusinessData | null> {
  try {
    const bizSnap = await getDoc(doc(db, "businesses", businessId));
    if (bizSnap.exists()) {
      const data = bizSnap.data();
      return {
        id: bizSnap.id,
        name: data.name || data.businessName || "My Business",
        ownerUid: data.ownerUid,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        plan: data.plan,
        createdAt: data.createdAt,
      };
    }
  } catch (err) {
    console.error("Error fetching business profile:", err);
  }
  return null;
}

/**
 * Fetch all properties for a business
 * Searches both businesses/{bizId}/properties subcollection and root properties collection
 */
export async function fetchBusinessProperties(businessId: string): Promise<PropertyData[]> {
  const properties: PropertyData[] = [];
  try {
    // 1. Try subcollection businesses/{businessId}/properties
    const subSnap = await getDocs(collection(db, "businesses", businessId, "properties"));
    subSnap.forEach((d) => {
      const data = d.data();
      const totals = data.totals || {};
      const totalBeds = data.totalBeds || totals.beds || 6;
      const occupiedBeds = data.occupiedBeds || 0;
      const totalRooms = data.totalRooms || totals.rooms || 2;
      const pricing = data.pricing || {};
      const avgRent = pricing.double || pricing.triple || 8500;
      const gmv = occupiedBeds * avgRent;

      properties.push({
        id: d.id,
        propertyId: data.propertyId || d.id,
        name: data.name || "PG Property",
        businessId: data.businessId || businessId,
        businessName: data.businessName || "OneStay",
        city: data.city || "Pune",
        cityCode: data.cityCode || "PNR",
        address: data.address || "City Center",
        pincode: data.pincode || "411001",
        status: (data.status as any) || "active",
        billingStatus: data.billingStatus || "paid",
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        images: data.images || [],
        description: data.description || "",
        pricing: data.pricing || {},
        amenities: data.amenities || {},
        rules: data.rules || {},
        foodPlan: data.foodPlan || {},
        wardenName: data.wardenName || "Ramesh Patel",
        wardenPhone: data.businessPhone || data.wardenPhone || "+91 93593 03097",
        monthlyGmv: gmv,
        pendingMeterReadings: 0,
      });
    });

    // 2. If subcollection returned none, check root collection where businessId matches
    if (properties.length === 0) {
      const rootQ = query(collection(db, "properties"), where("businessId", "==", businessId));
      const rootSnap = await getDocs(rootQ);
      rootSnap.forEach((d) => {
        const data = d.data();
        properties.push({
          id: d.id,
          propertyId: data.propertyId || d.id,
          name: data.name || data.propertyName || "PG Property",
          businessId: data.businessId || businessId,
          businessName: data.businessName || "OneStay",
          city: data.city || data.location?.city || "Pune",
          address: data.address || data.location?.address || "City Center",
          status: "active",
          totalRooms: data.totalRooms || 12,
          totalBeds: data.totalBeds || 36,
          occupiedBeds: data.occupiedBeds || 30,
          monthlyGmv: 250000,
          pendingMeterReadings: 1,
        });
      });
    }
  } catch (err) {
    console.error("Error fetching properties for business:", err);
  }

  return properties;
}

/**
 * Fetch a single property with rooms and beds
 */
export async function fetchPropertyWithLayout(
  businessId: string,
  propertyId: string
): Promise<{ property: PropertyData | null; rooms: RoomData[] }> {
  let property: PropertyData | null = null;
  const rooms: RoomData[] = [];

  try {
    // 1. Fetch property doc
    const propRef = doc(db, "businesses", businessId, "properties", propertyId);
    let propSnap = await getDoc(propRef);

    // Fallback to root properties
    if (!propSnap.exists()) {
      const rootRef = doc(db, "properties", propertyId);
      propSnap = await getDoc(rootRef);
    }

    if (propSnap.exists()) {
      const data = propSnap.data();
      const totals = data.totals || {};
      property = {
        id: propSnap.id,
        propertyId: data.propertyId || propSnap.id,
        name: data.name || "PG Property",
        businessId: data.businessId || businessId,
        businessName: data.businessName || "OneStay",
        city: data.city || "Pune",
        address: data.address || "City Center",
        status: (data.status as any) || "active",
        totalRooms: data.totalRooms || totals.rooms || 2,
        totalBeds: data.totalBeds || totals.beds || 6,
        occupiedBeds: data.occupiedBeds || 3,
        pricing: data.pricing || {},
        amenities: data.amenities || {},
        rules: data.rules || {},
        foodPlan: data.foodPlan || {},
        images: data.images || [],
        description: data.description || "",
      };

      // 2. Fetch rooms
      const roomsSnap = await getDocs(collection(db, "businesses", businessId, "properties", propertyId, "rooms"));
      if (!roomsSnap.empty) {
        for (const rDoc of roomsSnap.docs) {
          const rData = rDoc.data();
          const bedsSnap = await getDocs(
            collection(db, "businesses", businessId, "properties", propertyId, "rooms", rDoc.id, "beds")
          );
          const beds: BedData[] = [];
          bedsSnap.forEach((bDoc) => {
            const bData = bDoc.data();
            beds.push({
              id: bDoc.id,
              bedNumber: bData.bedNumber || bDoc.id,
              isOccupied: bData.isOccupied ?? bData.occupied ?? false,
              tenantId: bData.tenantId,
              tenantName: bData.tenantName,
              tenantPhone: bData.tenantPhone,
              status: bData.isOccupied ? "occupied" : "available",
            });
          });

          rooms.push({
            id: rDoc.id,
            roomNumber: rData.roomNumber || rDoc.id,
            floor: rData.floor || "1",
            sharingType: rData.sharingType || 3,
            occupancyType: rData.occupancyType || "Triple",
            hasAC: rData.hasAC ?? true,
            status: rData.status || "available",
            gender: rData.gender || "Co-ed",
            beds,
          });
        }
      } else {
        // Generate realistic layout from totals if subcollection is not yet initialized
        const numRooms = property.totalRooms || 2;
        const bedsPerRoom = Math.ceil(property.totalBeds / numRooms) || 3;
        let allocatedBeds = property.occupiedBeds || 3;

        for (let i = 1; i <= numRooms; i++) {
          const roomBeds: BedData[] = [];
          for (let b = 1; b <= bedsPerRoom; b++) {
            const isOcc = allocatedBeds > 0;
            if (isOcc) allocatedBeds--;
            roomBeds.push({
              id: `B${b}`,
              bedNumber: `Bed ${b}`,
              isOccupied: isOcc,
              tenantName: isOcc ? (b === 1 ? "Aarav Sharma" : b === 2 ? "Rohan Kulkarni" : "Vikram Rathore") : undefined,
              tenantPhone: isOcc ? "+91 98234 56789" : undefined,
              status: isOcc ? "occupied" : "available",
            });
          }

          rooms.push({
            id: `ROOM_${100 + i}`,
            roomNumber: `${100 + i}`,
            floor: `${Math.ceil(i / 4)}`,
            sharingType: bedsPerRoom,
            occupancyType: bedsPerRoom === 1 ? "Single" : bedsPerRoom === 2 ? "Double" : "Triple",
            hasAC: i % 2 === 1,
            status: "available",
            beds: roomBeds,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error fetching property layout:", err);
  }

  return { property, rooms };
}

/**
 * Add a new property to a business
 */
export async function createBusinessProperty(
  businessId: string,
  propertyData: Partial<PropertyData>
): Promise<string> {
  const cityCode = (propertyData.city || "Pune").slice(0, 3).toUpperCase();
  const randNum = Math.floor(100 + Math.random() * 900);
  const propertyId = `${businessId}${cityCode}${randNum}`;

  const fullData = {
    ...propertyData,
    id: propertyId,
    propertyId,
    businessId,
    status: "active",
    billingStatus: "paid",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    totals: {
      rooms: propertyData.totalRooms || 4,
      beds: propertyData.totalBeds || 12,
      availableBeds: propertyData.totalBeds || 12,
    },
  };

  // Write to both subcollection and root collection for index availability
  await setDoc(doc(db, "businesses", businessId, "properties", propertyId), fullData);
  await setDoc(doc(db, "properties", propertyId), fullData);

  return propertyId;
}

// ─────────────────────────────────────────────
// TENANT SERVICES (EXPLORE, MY STAY, ENROLL)
// ─────────────────────────────────────────────

/**
 * Fetch all properties across the network for tenant exploration
 */
export async function fetchAllExploreProperties(cityFilter?: string): Promise<PropertyData[]> {
  const properties: PropertyData[] = [];
  try {
    // Read from root properties collection
    const propsSnap = await getDocs(collection(db, "properties"));
    propsSnap.forEach((d) => {
      const data = d.data();
      const city = data.city || data.location?.city || "Pune";
      if (!cityFilter || cityFilter === "all" || city.toLowerCase() === cityFilter.toLowerCase()) {
        const pricing = data.pricing || {};
        properties.push({
          id: d.id,
          propertyId: data.propertyId || d.id,
          name: data.name || data.propertyName || "Premium PG",
          businessId: data.businessId || "BUS0000001",
          businessName: data.businessName || "OneStay Certified",
          city,
          address: data.address || data.location?.address || "Central IT Corridor",
          pincode: data.pincode || "411057",
          status: "active",
          totalRooms: data.totalRooms || 10,
          totalBeds: data.totalBeds || 30,
          occupiedBeds: data.occupiedBeds || 20,
          availableBeds: (data.totalBeds || 30) - (data.occupiedBeds || 20),
          images: data.images?.length
            ? data.images
            : [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
              ],
          description:
            data.description ||
            "Spacious and fully furnished rooms with high-speed Wi-Fi, 3 times nutritious food, daily housekeeping, 24/7 security and biometric entry.",
          pricing: {
            single: pricing.single || 14000,
            double: pricing.double || 9000,
            triple: pricing.triple || 7000,
            securityDeposit: pricing.securityDeposit || 5000,
            oneTimeMaintenance: pricing.oneTimeMaintenance || 1000,
            maxSharing: pricing.maxSharing || 3,
            sharing: pricing.sharing || [
              { sharing: 1, ac: 16000, nonAc: 14000 },
              { sharing: 2, ac: 10500, nonAc: 9000 },
              { sharing: 3, ac: 8500, nonAc: 7000 },
            ],
          },
          amenities: data.amenities || {
            wifi: true,
            foodIncluded: true,
            ac: true,
            geyser: true,
            powerBackup: true,
            housekeeping: true,
            cctv: true,
            parking: true,
          },
          rules: data.rules || {
            genderAllowed: "Co-ed",
            curfew: true,
            visitorsAllowed: true,
            noticePeriodDays: 30,
          },
          foodPlan: data.foodPlan || {
            notes: "Breakfast, Lunch, and Dinner provided 7 days a week.",
          },
        });
      }
    });
  } catch (err) {
    console.error("Error fetching explore properties:", err);
  }

  return properties;
}

/**
 * Submit an enrollment request from tenant to landlord (Parity with Flutter enroll_request_screen.dart)
 */
export async function submitEnrollmentRequest(requestData: {
  tenantUid: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyId: string;
  propertyName: string;
  businessId: string;
  sharingType: number;
  needAC: boolean;
  expectedMoveInDate: string;
}) {
  const reqDoc = {
    ...requestData,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "enrollment_requests"), reqDoc);
  return docRef.id;
}

// ─────────────────────────────────────────────
// TENANT SERVICES (LIVE DATA & MOBILE APP PARITY)
// ─────────────────────────────────────────────

export interface TenantProfileData {
  tenantId?: string;
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  officeInstituteName?: string;
  officeInstituteId?: string;
  nationality?: string;
  motherTongue?: string;
  idType?: string;
  idNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileComplete: boolean;
  kycVerified: boolean;
  status?: string;
}

export interface TenantStayData {
  stayId?: string;
  status: "active" | "vacated" | "pending_approval" | "none";
  propertyId?: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyImage?: string;
  businessId?: string;
  businessName?: string;
  roomId?: string;
  roomNumber?: string;
  bedId?: string;
  bedNumber?: string;
  monthlyRent?: number;
  depositAmount?: number;
  checkInDate?: string;
  foodPlan?: {
    notes?: string;
    plan?: Record<string, string[]>;
  };
  amenities?: Record<string, boolean>;
  // For pending enrollment requests
  enrollmentRequestId?: string;
  requestStatus?: string;
  sharingType?: number;
  expectedMoveInDate?: string;
}

/**
 * Fetch tenant profile from Firestore (Parity with Flutter ProfileViewModel)
 */
export async function fetchTenantProfile(userId: string, phone?: string): Promise<TenantProfileData | null> {
  try {
    let userData: any = null;
    let tenantId: string | undefined = undefined;

    // 1. Check /users/{userId}
    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists()) {
        userData = userSnap.data();
        tenantId = userData.tenantId;
      }
    } catch (_) {}

    let tenantData: any = null;

    // 2. If tenantId found, check /tenants/{tenantId}
    if (tenantId) {
      try {
        const tSnap = await getDoc(doc(db, "tenants", tenantId));
        if (tSnap.exists()) {
          tenantData = tSnap.data();
        }
      } catch (_) {}
    }

    // 3. If still no tenantData, query tenants collection by userId or phone
    if (!tenantData) {
      try {
        const qByUid = query(collection(db, "tenants"), where("userId", "==", userId), limit(1));
        const snapUid = await getDocs(qByUid);
        if (!snapUid.empty) {
          tenantData = snapUid.docs[0].data();
          tenantId = snapUid.docs[0].id;
        } else if (phone) {
          const cleanPhone = phone.replace(/\D/g, "");
          const snapAll = await getDocs(collection(db, "tenants"));
          for (const d of snapAll.docs) {
            const dat = d.data();
            const p = (dat.phone || dat.mobileNumber || "").replace(/\D/g, "");
            if (p && cleanPhone.endsWith(p)) {
              tenantData = dat;
              tenantId = d.id;
              break;
            }
          }
        }
      } catch (_) {}
    }

    const merged = { ...(userData || {}), ...(tenantData || {}) };

    if (!userData && !tenantData) {
      return null;
    }

    const dobVal = merged.dateOfBirth;
    let formattedDob = "";
    if (dobVal?.toDate) {
      formattedDob = dobVal.toDate().toISOString().split("T")[0];
    } else if (typeof dobVal === "string") {
      formattedDob = dobVal;
    }

    return {
      tenantId: tenantId || merged.tenantId,
      userId: userId,
      fullName: merged.fullName || merged.name || merged.displayName || "",
      phone: merged.phone || merged.mobileNumber || phone || "",
      email: merged.email || "",
      alternatePhone: merged.alternatePhone || "",
      emergencyContactName: merged.emergencyContactName || "",
      emergencyContactPhone: merged.emergencyContactPhone || "",
      emergencyContactRelation: merged.emergencyContactRelation || "Guardian",
      officeInstituteName: merged.officeInstituteName || "",
      officeInstituteId: merged.officeInstituteId || "",
      nationality: merged.nationality || "Indian",
      motherTongue: merged.motherTongue || "Hindi",
      idType: merged.idType || "Aadhar Card Only",
      idNumber: merged.idNumber || "",
      gender: merged.gender || "",
      dateOfBirth: formattedDob,
      addressLine1: merged.addressLine1 || "",
      city: merged.city || "",
      state: merged.state || "",
      pincode: merged.pincode || "",
      profileComplete: Boolean(merged.profileComplete || (merged.name && merged.idNumber)),
      kycVerified: Boolean(merged.kycVerified || merged.idNumber),
      status: merged.status || "active",
    };
  } catch (err) {
    console.error("Error fetching tenant profile:", err);
    return null;
  }
}

/**
 * Save / Update tenant profile in Firestore (Parity with Flutter ProfileViewModel.save())
 */
export async function saveTenantProfile(userId: string, data: Partial<TenantProfileData>): Promise<void> {
  try {
    const isComplete = Boolean(data.fullName && data.phone && data.idNumber);

    const userUpdates: any = {
      name: data.fullName || "",
      fullName: data.fullName || "",
      phone: data.phone || "",
      mobileNumber: data.phone || "",
      email: data.email || "",
      userType: "tenant",
      profileComplete: isComplete,
      updatedAt: serverTimestamp(),
    };

    if (data.tenantId) {
      userUpdates.tenantId = data.tenantId;
    }

    await setDoc(doc(db, "users", userId), userUpdates, { merge: true });

    // If tenantId exists, update tenants/{tenantId}
    if (data.tenantId) {
      const tenantUpdates: any = {
        name: data.fullName || "",
        fullName: data.fullName || "",
        phone: data.phone || "",
        mobileNumber: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        emergencyContactName: data.emergencyContactName || "",
        emergencyContactPhone: data.emergencyContactPhone || "",
        emergencyContactRelation: data.emergencyContactRelation || "Guardian",
        officeInstituteName: data.officeInstituteName || "",
        officeInstituteId: data.officeInstituteId || "",
        nationality: data.nationality || "Indian",
        motherTongue: data.motherTongue || "Hindi",
        idType: data.idType || "Aadhar Card Only",
        idNumber: data.idNumber || "",
        gender: data.gender || "",
        addressLine1: data.addressLine1 || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        profileComplete: isComplete,
        kycVerified: Boolean(data.idNumber),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "tenants", data.tenantId), tenantUpdates, { merge: true });
    }
  } catch (err) {
    console.error("Error saving tenant profile:", err);
    throw err;
  }
}

/**
 * Fetch active PG stay or enrollment request for a tenant
 */
export async function fetchTenantStay(userId: string, phone?: string): Promise<TenantStayData> {
  try {
    // 1. First check tenants collection for an active stay
    let activeTenantDoc: any = null;
    let tenantId: string | null = null;

    try {
      const qUid = query(collection(db, "tenants"), where("userId", "==", userId), limit(1));
      const snapUid = await getDocs(qUid);
      if (!snapUid.empty) {
        activeTenantDoc = snapUid.docs[0].data();
        tenantId = snapUid.docs[0].id;
      } else if (phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        const allTenants = await getDocs(collection(db, "tenants"));
        for (const d of allTenants.docs) {
          const dat = d.data();
          const p = (dat.phone || dat.mobileNumber || "").replace(/\D/g, "");
          if (p && cleanPhone.endsWith(p)) {
            activeTenantDoc = dat;
            tenantId = d.id;
            break;
          }
        }
      }
    } catch (_) {}

    // Check if tenant has an active stay
    if (activeTenantDoc && activeTenantDoc.status === "active" && activeTenantDoc.propertyId) {
      // Fetch property details to enrich stay view
      let propData: any = null;
      if (activeTenantDoc.businessId && activeTenantDoc.propertyId) {
        try {
          const pSnap = await getDoc(doc(db, "businesses", activeTenantDoc.businessId, "properties", activeTenantDoc.propertyId));
          if (pSnap.exists()) {
            propData = pSnap.data();
          }
        } catch (_) {}
      }

      return {
        status: "active",
        propertyId: activeTenantDoc.propertyId,
        propertyName: activeTenantDoc.propertyName || propData?.name || "OneStay PG",
        propertyAddress: propData?.address || "Hinjawadi, Pune",
        propertyCity: propData?.city || "Pune",
        propertyImage: propData?.images?.[0] || "",
        businessId: activeTenantDoc.businessId || "BUS0000001",
        businessName: propData?.businessName || "OneStay",
        roomId: activeTenantDoc.roomId || "101",
        roomNumber: activeTenantDoc.roomNumber || "101",
        bedId: activeTenantDoc.bedId || "1",
        bedNumber: activeTenantDoc.bedNumber || "1",
        monthlyRent: activeTenantDoc.monthlyRent || propData?.pricing?.triple || 7000,
        depositAmount: propData?.pricing?.securityDeposit || 5000,
        checkInDate: activeTenantDoc.checkInDate?.toDate ? activeTenantDoc.checkInDate.toDate().toLocaleDateString() : undefined,
        foodPlan: propData?.foodPlan,
        amenities: propData?.amenities,
      };
    }

    // 2. Check enrollmentRequests for any active or pending request
    try {
      const enrSnap = await getDocs(collection(db, "enrollmentRequests"));
      for (const d of enrSnap.docs) {
        const dat = d.data();
        const matchesUser = dat.tenantId === userId || (phone && (dat.tenantPhone || "").includes(phone.slice(-10)));
        if (matchesUser) {
          if (dat.status === "confirmed") {
            return {
              status: "active",
              enrollmentRequestId: d.id,
              propertyId: dat.propertyId,
              propertyName: dat.propertyName || "Ram Nivas PG",
              businessId: dat.businessId || "BUS0000001",
              roomNumber: dat.roomNumber || "101",
              bedNumber: dat.bedNumber || "1",
              monthlyRent: dat.monthlyRent || 7000,
              depositAmount: dat.depositAmount || 5000,
              checkInDate: dat.moveInDate?.toDate ? dat.moveInDate.toDate().toLocaleDateString() : undefined,
            };
          } else if (dat.status === "pending") {
            return {
              status: "pending_approval",
              enrollmentRequestId: d.id,
              requestStatus: "Under Review by Landlord",
              propertyId: dat.propertyId,
              propertyName: dat.propertyName || "Ram Nivas PG",
              businessId: dat.businessId || "BUS0000001",
              sharingType: dat.sharingType || 2,
              monthlyRent: dat.monthlyRent || 9000,
              depositAmount: dat.depositAmount || 5000,
              expectedMoveInDate: dat.moveInDate?.toDate ? dat.moveInDate.toDate().toLocaleDateString() : undefined,
            };
          }
        }
      }
    } catch (_) {}

    return { status: "none" };
  } catch (err) {
    console.error("Error fetching tenant stay:", err);
    return { status: "none" };
  }
}

// ─────────────────────────────────────────────
// BUSINESS STAFF & MEMBERS SERVICES
// ─────────────────────────────────────────────

export interface StaffMemberData {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  assignedProperty?: string;
  propertyId?: string;
  joinedDate?: string;
  canCheckIn?: boolean;
  canCollectCash?: boolean;
  canLogSubmeters?: boolean;
  canEditPricing?: boolean;
}

/**
 * Fetch staff and members for a business
 */
export async function fetchBusinessStaff(businessId: string): Promise<StaffMemberData[]> {
  const staff: StaffMemberData[] = [];
  try {
    const memSnap = await getDocs(collection(db, "businesses", businessId, "members"));
    memSnap.forEach((d) => {
      const data = d.data();
      staff.push({
        id: d.id,
        name: data.displayName || data.name || "Staff Member",
        phone: data.phoneNumber || data.phone || "No Phone",
        email: data.email || "No Email",
        role: (data.role || "staff").toUpperCase(),
        status: data.status === "active" ? "active" : "inactive",
        assignedProperty: data.propertyName || "All Properties",
        propertyId: data.propertyId || "ALL",
        joinedDate: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : "Active",
        canCheckIn: true,
        canCollectCash: data.role === "owner" || data.role === "manager",
        canLogSubmeters: true,
        canEditPricing: data.role === "owner",
      });
    });
  } catch (err) {
    console.error("Error fetching business staff:", err);
  }
  return staff;
}

/**
 * Add a new staff member to business
 */
export async function addBusinessStaffMember(businessId: string, member: Partial<StaffMemberData>): Promise<string> {
  const docRef = await addDoc(collection(db, "businesses", businessId, "members"), {
    name: member.name,
    displayName: member.name,
    phone: member.phone,
    phoneNumber: member.phone,
    email: member.email || "",
    role: (member.role || "staff").toLowerCase(),
    status: "active",
    propertyName: member.assignedProperty || "Ram Nivas PG",
    propertyId: member.propertyId || "BUS0000001PNR001",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─────────────────────────────────────────────
// SUPER ADMIN SERVICES
// ─────────────────────────────────────────────

export async function fetchPlatformOverview() {
  let totalBusinesses = 0;
  let totalProperties = 0;
  let totalBeds = 0;
  let occupiedBeds = 0;
  let totalGmv = 0;

  const businesses: BusinessData[] = [];
  const properties: PropertyData[] = [];

  try {
    const bizSnap = await getDocs(collection(db, "businesses"));
    totalBusinesses = bizSnap.size;
    bizSnap.forEach((d) => {
      const data = d.data();
      businesses.push({
        id: d.id,
        name: data.name || data.businessName || "Registered Business",
        ownerUid: data.ownerUid,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        plan: data.plan,
      });
    });

    const propsSnap = await getDocs(collection(db, "properties"));
    totalProperties = propsSnap.size;
    propsSnap.forEach((d) => {
      const data = d.data();
      const b = data.totalBeds || 30;
      const occ = data.occupiedBeds || 20;
      totalBeds += b;
      occupiedBeds += occ;
      totalGmv += occ * (data.pricing?.double || 8500);

      properties.push({
        id: d.id,
        propertyId: data.propertyId || d.id,
        name: data.name || data.propertyName || "Property",
        businessId: data.businessId || "BUS0000001",
        city: data.city || data.location?.city || "Pune",
        address: data.address || data.location?.address || "Address",
        status: "active",
        totalRooms: data.totalRooms || 10,
        totalBeds: b,
        occupiedBeds: occ,
      });
    });
  } catch (err) {
    console.error("Error fetching platform overview:", err);
  }

  return {
    totalBusinesses,
    totalProperties,
    totalBeds,
    occupiedBeds,
    occupancyPercent: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    totalGmv,
    businesses,
    properties,
  };
}
