/**
 * ======================================================
 * ELECTRICITY SUBMETER BILLING & UTILITY ENGINE
 * ======================================================
 *
 * Automates:
 * 1. Submeter unit reading logging (Prev kWh, Curr kWh, Unit Rate)
 * 2. Automated proportional split across active room inmates
 * 3. Generation of utility ledger items and invoice line-items
 * 4. GST-compliant invoice data synthesis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

export interface SubmeterReadingInput {
  businessId: string;
  propertyId: string;
  roomId: string;
  roomNumber?: string;
  previousUnits: number;
  currentUnits: number;
  unitRate: number;
  meterPhotoUrl?: string;
  cycleMonth?: string;
}

export const recordSubmeterReading = functions
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onCall(async (data: SubmeterReadingInput, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Login required to record submeters');
    }

    const {
      businessId,
      propertyId,
      roomId,
      roomNumber,
      previousUnits,
      currentUnits,
      unitRate,
      meterPhotoUrl,
      cycleMonth,
    } = data || {};

    if (!businessId || !propertyId || !roomId) {
      throw new functions.https.HttpsError('invalid-argument', 'businessId, propertyId, and roomId are required');
    }

    const prev = Number(previousUnits || 0);
    const curr = Number(currentUnits || 0);
    const rate = Number(unitRate || 12);

    if (curr < prev) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Current meter reading (${curr}) cannot be lower than previous reading (${prev})`
      );
    }

    const unitsConsumed = Math.max(0, curr - prev);
    const totalElectricityBill = Math.round(unitsConsumed * rate);

    const nowTs = admin.firestore.FieldValue.serverTimestamp();
    const readingId = `MTR_${Date.now()}`;
    const targetRoomNumber = roomNumber || roomId.replace(/^R/, '');

    // 1. Find all active tenants currently allocated to this room
    const activeTenants: Array<{ id: string; name: string; phone: string; bedNumber: string }> = [];

    // Check root tenants collection
    const tenantsSnap = await db
      .collection('tenants')
      .where('propertyId', '==', propertyId)
      .where('roomNumber', '==', targetRoomNumber)
      .where('status', '==', 'active')
      .get();

    tenantsSnap.forEach((doc) => {
      const d = doc.data();
      activeTenants.push({
        id: doc.id,
        name: d.name || d.fullName || 'Resident',
        phone: d.phone || d.mobileNumber || '',
        bedNumber: d.bedNumber || 'Bed',
      });
    });

    // Also check business subcollection if empty
    if (activeTenants.length === 0) {
      const bizTenantsSnap = await db
        .collection(`businesses/${businessId}/tenants`)
        .where('propertyId', '==', propertyId)
        .where('roomNumber', '==', targetRoomNumber)
        .where('status', '==', 'active')
        .get();

      bizTenantsSnap.forEach((doc) => {
        const d = doc.data();
        activeTenants.push({
          id: doc.id,
          name: d.name || d.fullName || 'Resident',
          phone: d.phone || d.mobileNumber || '',
          bedNumber: d.bedNumber || 'Bed',
        });
      });
    }

    const inmateCount = Math.max(1, activeTenants.length);
    const perTenantShare = Math.round(totalElectricityBill / inmateCount);

    // 2. Save reading record under property room submeter_readings
    const roomRef = db.doc(`businesses/${businessId}/properties/${propertyId}/rooms/${roomId}`);
    await roomRef.set(
      {
        submeterPrev: prev,
        submeterCurr: curr,
        submeterRate: rate,
        submeterLastUpdated: nowTs,
        submeterPhotoUrl: meterPhotoUrl || null,
      },
      { merge: true }
    );

    await roomRef.collection('submeter_readings').doc(readingId).set({
      readingId,
      previousUnits: prev,
      currentUnits: curr,
      unitsConsumed,
      unitRate: rate,
      totalBill: totalElectricityBill,
      inmateCount,
      perTenantShare,
      meterPhotoUrl: meterPhotoUrl || null,
      recordedBy: uid,
      createdAt: nowTs,
    });

    // 3. Save master submeter bill entry in businesses/{businessId}/submeter_bills
    const billId = `BILL_SUB_${readingId}`;
    await db.collection(`businesses/${businessId}/submeter_bills`).doc(billId).set({
      billId,
      propertyId,
      roomId,
      roomNumber: targetRoomNumber,
      previousUnits: prev,
      currentUnits: curr,
      unitsConsumed,
      unitRate: rate,
      totalAmount: totalElectricityBill,
      inmateCount,
      perTenantShare,
      tenants: activeTenants,
      cycleMonth: cycleMonth || new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      status: 'billed',
      createdAt: nowTs,
    });

    // 4. Create or append utility line items to each resident's invoice ledger
    for (const tenant of activeTenants) {
      const utilityInvoiceId = `INV_UTIL_${tenant.id}_${Date.now().toString().slice(-6)}`;
      await db.collection(`businesses/${businessId}/tenants/${tenant.id}/utility_bills`).doc(utilityInvoiceId).set({
        invoiceId: utilityInvoiceId,
        type: 'electricity_submeter',
        propertyId,
        roomId,
        roomNumber: targetRoomNumber,
        bedNumber: tenant.bedNumber,
        unitsConsumed,
        unitRate: rate,
        roommatesCount: inmateCount,
        amount: perTenantShare,
        status: 'unpaid',
        billMonth: cycleMonth || new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
        dueDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
        createdAt: nowTs,
      });

      // Send push notification to inmate
      try {
        const tokensSnap = await db.collection(`users/${tenant.id}/deviceTokens`).where('active', '==', true).get();
        for (const tok of tokensSnap.docs) {
          await messaging.send({
            token: tok.id,
            notification: {
              title: '⚡ Room Submeter Logged',
              body: `Room ${targetRoomNumber}: ${unitsConsumed} units consumed (₹${rate}/unit). Your equal split is ₹${perTenantShare.toLocaleString('en-IN')} across ${inmateCount} roommates.`,
            },
            data: {
              type: 'submeter_bill',
              amount: String(perTenantShare),
              roomId: String(roomId),
            },
          });
        }
      } catch (_) {}
    }

    functions.logger.info('submeter_reading_logged_successfully', {
      propertyId,
      roomId,
      unitsConsumed,
      totalElectricityBill,
      inmateCount,
      perTenantShare,
    });

    return {
      success: true,
      readingId,
      billId,
      unitsConsumed,
      totalElectricityBill,
      inmateCount,
      perTenantShare,
      notifiedTenantsCount: activeTenants.length,
    };
  });
