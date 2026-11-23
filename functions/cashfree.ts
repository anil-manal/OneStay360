/**
 * ======================================================
 * CASHFREE PAYMENTS INTEGRATION MODULE
 * ======================================================
 *
 * Supports:
 * - Sandbox (Test Environment) & Production
 * - Order Session & Hosted Payment Link creation
 * - Instant HMAC Webhook verification
 * - Automated Enrollment & Bill settlement
 *
 * API Version: 2023-08-01
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as https from 'https';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export type CashfreeEnvironment = 'sandbox' | 'production';

export interface CashfreeCredentials {
  appId: string;
  secretKey: string;
  environment: CashfreeEnvironment;
}

/**
 * Resolve Cashfree API endpoint based on environment
 */
function getCashfreeHost(env: CashfreeEnvironment): string {
  return env === 'production' ? 'api.cashfree.com' : 'sandbox.cashfree.com';
}

/**
 * Look up OneStay360 platform Cashfree credentials.
 * Checked in order:
 * 1. Firestore 'system/cashfree_platform' (configured by Super Admin in web console)
 * 2. Process environment variables (CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV)
 * 3. Business-level override in 'businesses/{businessId}/settings/cashfree_private' (if any)
 */
async function getPlatformCashfreeCredentials(businessId?: string): Promise<CashfreeCredentials> {
  // 1. Try reading from Firestore system/cashfree_platform
  const platformSnap = await db.doc('system/cashfree_platform').get();
  if (platformSnap.exists) {
    const data = platformSnap.data() as any;
    const appId = (data?.appId || '').toString().trim();
    const secretKey = (data?.secretKey || '').toString().trim();
    const environment: CashfreeEnvironment = data?.environment === 'production' ? 'production' : 'sandbox';
    if (appId && secretKey) {
      return { appId, secretKey, environment };
    }
  }

  // 2. Check environment variables
  const platformAppId = (process.env.CASHFREE_APP_ID || '').trim();
  const platformSecret = (process.env.CASHFREE_SECRET_KEY || '').trim();
  const platformEnv = (process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox') as CashfreeEnvironment;

  if (platformAppId && platformSecret) {
    return { appId: platformAppId, secretKey: platformSecret, environment: platformEnv };
  }

  // 3. Fallback: check business-level override if provided
  if (businessId) {
    const secretSnap = await db.doc(`businesses/${businessId}/settings/cashfree_private`).get();
    if (secretSnap.exists) {
      const data = secretSnap.data() as any;
      const appId = (data?.appId || data?.app_id || '').toString().trim();
      const secretKey = (data?.secretKey || data?.secret_key || '').toString().trim();
      const environment: CashfreeEnvironment = data?.environment === 'production' ? 'production' : 'sandbox';
      if (appId && secretKey) {
        return { appId, secretKey, environment };
      }
    }
  }

  throw new functions.https.HttpsError(
    'failed-precondition',
    'OneStay360 platform Cashfree gateway is not yet configured. Please configure OneStay360 Cashfree credentials in the Super Admin Console.'
  );
}

/**
 * Make an HTTPS request to Cashfree REST API
 */
function cashfreeApiRequest(
  method: string,
  path: string,
  body: any,
  credentials: CashfreeCredentials
): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      'x-client-id': credentials.appId,
      'x-client-secret': credentials.secretKey,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    };

    if (postData) {
      headers['Content-Length'] = String(Buffer.byteLength(postData));
    }

    const options: https.RequestOptions = {
      hostname: getCashfreeHost(credentials.environment),
      path,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk: Buffer) => { rawData += chunk.toString(); });
      res.on('end', () => {
        try {
          const data = JSON.parse(rawData);
          if (res.statusCode && res.statusCode >= 400) {
            functions.logger.error('cashfree_api_error', {
              statusCode: res.statusCode,
              path,
              error: data,
            });
            reject(
              new functions.https.HttpsError(
                'internal',
                `Cashfree API Error: ${data?.message || JSON.stringify(data)}`
              )
            );
            return;
          }
          resolve(data);
        } catch (parseErr) {
          reject(new functions.https.HttpsError('internal', `Failed to parse Cashfree response: ${rawData}`));
        }
      });
    });

    req.on('error', (err) => {
      functions.logger.error('cashfree_request_error', { path, error: err.message });
      reject(new functions.https.HttpsError('internal', `Cashfree request failed: ${err.message}`));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Verify Cashfree Webhook Signature
 */
function verifyCashfreeWebhookSignature(
  signature: string,
  rawBody: string,
  timestamp: string,
  secretKey: string
): boolean {
  if (!signature || !timestamp || !secretKey) return false;
  try {
    const dataToSign = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// CALLABLE: Create Cashfree Payment Order / Session
// ─────────────────────────────────────────────────────────
export const createCashfreePaymentSession = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }

    const { businessId, tenantId, rentInvoiceId, enrollmentRequestId } = data || {};
    if (!businessId || (!rentInvoiceId && !enrollmentRequestId)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'businessId and either rentInvoiceId or enrollmentRequestId required'
      );
    }

    // Check if business explicitly disabled online collection
    const bizSettingsSnap = await db.doc(`businesses/${businessId}/settings/cashfree`).get();
    if (bizSettingsSnap.exists && bizSettingsSnap.data()?.enabled === false) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Online UPI collection is currently paused by this property.'
      );
    }

    const credentials = await getPlatformCashfreeCredentials(businessId);

    // ── 1. Enrollment Move-in Bill Flow ──
    if (enrollmentRequestId) {
      const enrollRef = db.doc(`enrollmentRequests/${enrollmentRequestId}`);
      const enrollSnap = await enrollRef.get();
      if (!enrollSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Enrollment request not found');
      }

      const enrollment = enrollSnap.data() as any;
      if (enrollment.status === 'confirmed' || enrollment.status === 'approved') {
        throw new functions.https.HttpsError('failed-precondition', 'Bill already paid');
      }

      // Check if active Cashfree session already exists
      if (enrollment.cashfreePaymentUrl && enrollment.cashfreePaymentSessionId) {
        return {
          paymentUrl: enrollment.cashfreePaymentUrl,
          paymentSessionId: enrollment.cashfreePaymentSessionId,
          orderId: enrollment.cashfreeOrderId,
          environment: credentials.environment,
          alreadyCreated: true,
        };
      }

      const billAmount = Number(enrollment.totalBillAmount || enrollment.totalFirstMonth || 0);
      if (billAmount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid bill amount');
      }

      const uniqueOrderId = `order_enroll_${enrollmentRequestId.substring(0, 10)}_${Date.now().toString().slice(-6)}`;
      const customerPhone = (enrollment.tenantPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10);

      const orderPayload = {
        order_id: uniqueOrderId,
        order_amount: billAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: tenantId || uid,
          customer_name: enrollment.tenantName || 'Tenant',
          customer_email: enrollment.tenantEmail || 'tenant@onestay360.com',
          customer_phone: customerPhone.length === 10 ? customerPhone : '9999999999',
        },
        order_meta: {
          return_url: `https://onestay360.in/payment/status?order_id=${uniqueOrderId}`,
          notify_url: 'https://us-central1-onestay360-1.cloudfunctions.net/cashfreePaymentWebhook',
          payment_methods: 'upi,cc,dc,nb',
        },
        order_note: `Move-in Bill - ${enrollment.propertyName || 'OneStay360 PG'}`,
        order_tags: {
          businessId,
          enrollmentRequestId,
          tenantId: tenantId || uid,
          type: 'enrollment',
        },
      };

      const cfResponse = await cashfreeApiRequest('POST', '/pg/orders', orderPayload, credentials);
      const paymentSessionId = cfResponse.payment_session_id;

      // Construct payment URL for hosted checkout
      const host = credentials.environment === 'production' ? 'payments.cashfree.com' : 'payments-test.cashfree.com';
      const paymentUrl = `https://${host}/order/#${paymentSessionId}`;

      // Save order metadata in Firestore enrollment doc
      await enrollRef.update({
        cashfreeOrderId: uniqueOrderId,
        cashfreePaymentSessionId: paymentSessionId,
        cashfreePaymentUrl: paymentUrl,
        cashfreeCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentProvider: 'cashfree',
        cashfreeEnvironment: credentials.environment,
      });

      return {
        paymentUrl,
        paymentSessionId,
        orderId: uniqueOrderId,
        environment: credentials.environment,
      };
    }

    // ── 2. Monthly Rent Invoice Flow ──
    if (rentInvoiceId) {
      const invoiceRef = db.doc(`rentInvoices/${rentInvoiceId}`);
      const invoiceSnap = await invoiceRef.get();
      if (!invoiceSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Rent invoice not found');
      }

      const invoice = invoiceSnap.data() as any;
      if (invoice.status === 'paid') {
        throw new functions.https.HttpsError('failed-precondition', 'Invoice already paid');
      }

      const billAmount = Number(invoice.totalAmount || invoice.amount || 0);
      const uniqueOrderId = `order_rent_${rentInvoiceId.substring(0, 10)}_${Date.now().toString().slice(-6)}`;
      const customerPhone = (invoice.tenantPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10);

      const orderPayload = {
        order_id: uniqueOrderId,
        order_amount: billAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: tenantId || uid,
          customer_name: invoice.tenantName || 'Tenant',
          customer_email: invoice.tenantEmail || 'tenant@onestay360.com',
          customer_phone: customerPhone.length === 10 ? customerPhone : '9999999999',
        },
        order_meta: {
          return_url: `https://onestay360.in/payment/status?order_id=${uniqueOrderId}`,
          notify_url: 'https://us-central1-onestay360-1.cloudfunctions.net/cashfreePaymentWebhook',
        },
        order_note: `Rent Invoice - ${invoice.monthYear || 'Monthly Rent'}`,
        order_tags: {
          businessId,
          rentInvoiceId,
          tenantId: tenantId || uid,
          type: 'monthly_rent',
        },
      };

      const cfResponse = await cashfreeApiRequest('POST', '/pg/orders', orderPayload, credentials);
      const paymentSessionId = cfResponse.payment_session_id;
      const host = credentials.environment === 'production' ? 'payments.cashfree.com' : 'payments-test.cashfree.com';
      const paymentUrl = `https://${host}/order/#${paymentSessionId}`;

      await invoiceRef.update({
        cashfreeOrderId: uniqueOrderId,
        cashfreePaymentSessionId: paymentSessionId,
        cashfreePaymentUrl: paymentUrl,
        paymentProvider: 'cashfree',
      });

      return {
        paymentUrl,
        paymentSessionId,
        orderId: uniqueOrderId,
        environment: credentials.environment,
      };
    }

    throw new functions.https.HttpsError('invalid-argument', 'Missing invoice or enrollment ID');
  });

// ─────────────────────────────────────────────────────────
// HTTP ON-REQUEST: Cashfree Webhook Handler
// ─────────────────────────────────────────────────────────
export const cashfreePaymentWebhook = functions
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const signature = req.headers['x-webhook-signature'] as string;
      const timestamp = req.headers['x-webhook-timestamp'] as string;
      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
      const payload = req.body;

      functions.logger.info('cashfree_webhook_received', {
        type: payload?.type,
        orderId: payload?.data?.order?.order_id,
      });

      const orderData = payload?.data?.order;
      const paymentData = payload?.data?.payment;
      const orderTags = orderData?.order_tags || {};
      const businessId = orderTags.businessId;

      if (!businessId) {
        functions.logger.warn('cashfree_webhook_missing_business_id', { payload });
        res.status(200).send('OK (ignored - no businessId tag)');
        return;
      }

      // Verify webhook signature if secret key is present
      // Check if business explicitly disabled online collection
    const bizSettingsSnap = await db.doc(`businesses/${businessId}/settings/cashfree`).get();
    if (bizSettingsSnap.exists && bizSettingsSnap.data()?.enabled === false) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Online UPI collection is currently paused by this property.'
      );
    }

    const credentials = await getPlatformCashfreeCredentials(businessId);
      if (signature && timestamp) {
        const isValid = verifyCashfreeWebhookSignature(signature, rawBody, timestamp, credentials.secretKey);
        if (!isValid) {
          functions.logger.error('cashfree_webhook_invalid_signature', { businessId });
          res.status(401).send('Invalid Signature');
          return;
        }
      }

      // Check if event is successful payment
      const paymentStatus = paymentData?.payment_status || orderData?.order_status;
      if (paymentStatus === 'SUCCESS' || payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
        const enrollmentRequestId = orderTags.enrollmentRequestId;
        const rentInvoiceId = orderTags.rentInvoiceId;

        // 1. Mark Enrollment as Confirmed
        if (enrollmentRequestId) {
          const enrollRef = db.doc(`enrollmentRequests/${enrollmentRequestId}`);
          const enrollSnap = await enrollRef.get();
          if (enrollSnap.exists && enrollSnap.data()?.status !== 'confirmed') {
            await enrollRef.update({
              status: 'confirmed',
              paymentStatus: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              cfPaymentId: paymentData?.cf_payment_id || null,
              paymentMethod: paymentData?.payment_group || 'UPI',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            functions.logger.info('enrollment_marked_confirmed_via_cashfree', { enrollmentRequestId });
          }
        }

        // 2. Mark Rent Invoice as Paid
        if (rentInvoiceId) {
          const invoiceRef = db.doc(`rentInvoices/${rentInvoiceId}`);
          const invoiceSnap = await invoiceRef.get();
          if (invoiceSnap.exists && invoiceSnap.data()?.status !== 'paid') {
            await invoiceRef.update({
              status: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              cfPaymentId: paymentData?.cf_payment_id || null,
              paymentMethod: paymentData?.payment_group || 'UPI',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            functions.logger.info('invoice_marked_paid_via_cashfree', { rentInvoiceId });
          }
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (err: any) {
      functions.logger.error('cashfree_webhook_processing_error', { error: err.message });
      res.status(500).send('Internal Server Error');
    }
  });

// ─────────────────────────────────────────────────────────
// CALLABLE: Save Master Platform Cashfree Settings (Super Admin)
// ─────────────────────────────────────────────────────────
export const savePlatformCashfreeSettings = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }

    const { appId, secretKey, environment } = data || {};
    if (!appId || !secretKey) {
      throw new functions.https.HttpsError('invalid-argument', 'appId and secretKey are required');
    }

    const env: CashfreeEnvironment = environment === 'production' ? 'production' : 'sandbox';

    // Verify credentials by testing connection with Cashfree Sandbox/Prod
    try {
      await cashfreeApiRequest('GET', '/pg/orders?limit=1', null, { appId, secretKey, environment: env });
    } catch (apiErr: any) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Failed to verify platform Cashfree credentials with Cashfree ${env}: ${apiErr.message}`
      );
    }

    // Save platform credentials in system/cashfree_platform
    await db.doc('system/cashfree_platform').set({
      appId,
      secretKey,
      environment: env,
      appIdHint: `${appId.slice(0, 6)}...${appId.slice(-4)}`,
      verified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: uid,
    });

    return { success: true, message: `Platform Cashfree (${env}) credentials verified and saved successfully` };
  });

// ─────────────────────────────────────────────────────────
// CALLABLE: Save Cashfree Settings for Business
// ─────────────────────────────────────────────────────────
export const saveCashfreeSettings = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Login required');
    }

    const { businessId, appId, secretKey, environment } = data || {};
    if (!businessId || !appId || !secretKey) {
      throw new functions.https.HttpsError('invalid-argument', 'businessId, appId, and secretKey are required');
    }

    const env: CashfreeEnvironment = environment === 'production' ? 'production' : 'sandbox';

    // Verify credentials by testing connection with Cashfree Sandbox/Prod
    try {
      await cashfreeApiRequest('GET', '/pg/orders?limit=1', null, { appId, secretKey, environment: env });
    } catch (apiErr: any) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Failed to verify Cashfree credentials with Cashfree ${env}: ${apiErr.message}`
      );
    }

    // Save private credentials
    await db.doc(`businesses/${businessId}/settings/cashfree_private`).set({
      appId,
      secretKey,
      environment: env,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Save public status
    await db.doc(`businesses/${businessId}/settings/cashfree`).set({
      enabled: true,
      environment: env,
      appIdHint: `${appId.slice(0, 6)}...${appId.slice(-4)}`,
      verified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, message: `Cashfree (${env}) credentials verified and saved successfully` };
  });
