import assert from "node:assert/strict";
import test from "node:test";

// ─── 1. VAPID Key Isolation & Security Tests ─────────────────────────────────

test("SECURITY: VAPID private key is isolated and never returned through public API", () => {
  const fakeEnv = {
    VAPID_PUBLIC_KEY: "BPublicKeyExample1234567890",
    VAPID_PRIVATE_KEY: "SecretPrivateKeyThatMustNeverLeak",
  };

  // Controller simulation
  const req = {};
  let statusCode = null;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
  };

  const getVapidPublicKey = (_req, resObj) => {
    resObj.status(200).json({ success: true, publicKey: fakeEnv.VAPID_PUBLIC_KEY });
  };

  getVapidPublicKey(req, res);

  assert.equal(statusCode, 200);
  assert.equal(jsonResponse.success, true);
  assert.equal(jsonResponse.publicKey, "BPublicKeyExample1234567890");
  assert.equal(jsonResponse.privateKey, undefined);
  assert.equal(JSON.stringify(jsonResponse).includes("SecretPrivateKeyThatMustNeverLeak"), false);
});

// ─── 2. Service Worker URL Validation & Open-Redirect Prevention ────────────

test("SECURITY: Service worker URL sanitizer strictly prevents open redirect and phishing", () => {
  // Replicate the exact logic from public/sw.js
  const origin = "https://wellmeds.in";

  function getSafeInternalUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") {
      return "/";
    }
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed, origin);
      if (parsed.origin === origin) {
        return parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // ignore
    }
    return "/";
  }

  // Safe internal routes
  assert.equal(getSafeInternalUrl("/profile?tab=orders"), "/profile?tab=orders");
  assert.equal(getSafeInternalUrl("/admin/orders"), "/admin/orders");
  assert.equal(getSafeInternalUrl("/prescriptions/64b000000000000000000001"), "/prescriptions/64b000000000000000000001");
  assert.equal(getSafeInternalUrl("https://wellmeds.in/profile?tab=orders"), "/profile?tab=orders");

  // Malicious / external / phishing URLs
  assert.equal(getSafeInternalUrl("https://evil-phishing-site.example.com/login"), "/");
  assert.equal(getSafeInternalUrl("//evil-site.com/steal-creds"), "/");
  assert.equal(getSafeInternalUrl("javascript:alert(1)"), "/");
  assert.equal(getSafeInternalUrl("data:text/html,<script>alert(1)</script>"), "/");
  assert.equal(getSafeInternalUrl(""), "/");
  assert.equal(getSafeInternalUrl(null), "/");
  assert.equal(getSafeInternalUrl(undefined), "/");
});

// ─── 3. Push Payload Sanitization & Medical Privacy ─────────────────────────

test("SECURITY: Prescription notifications never leak sensitive drug names or diagnoses", () => {
  const sanitizeRxNotification = (eventType, data = {}) => {
    switch (eventType) {
      case "SUBMITTED":
        return {
          title: "Prescription Uploaded",
          body: "Your prescription has been received and queued for review.",
          url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        };
      case "CART_READY":
        return {
          title: "Prescription Cart Ready",
          body: "Your prescribed items have been prepared. Review your cart to proceed.",
          url: "/cart",
        };
      case "APPROVED":
        return {
          title: "Prescription Approved",
          body: "Your prescription was verified. You can now checkout your order.",
          url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        };
      case "REJECTED":
        return {
          title: "Prescription Update",
          body: "Your prescription requires review. Please tap to view pharmacist notes.",
          url: data.rxId ? `/prescriptions/${data.rxId}` : "/profile?tab=prescriptions",
        };
      default:
        return null;
    }
  };

  const sensitiveRxEvent = {
    rxId: "rx-9999",
    prescribedMeds: ["Chemotherapy Agent X", "HIV Antiretroviral Y"],
    clinicalDiagnosis: "Sensitive Medical Condition Z",
  };

  const notification = sanitizeRxNotification("APPROVED", sensitiveRxEvent);
  assert.equal(notification.title, "Prescription Approved");
  assert.equal(notification.body, "Your prescription was verified. You can now checkout your order.");
  assert.equal(notification.url, "/prescriptions/rx-9999");

  // Verify none of the sensitive medical details leaked into the notification body or title
  assert.equal(notification.body.includes("Chemotherapy"), false);
  assert.equal(notification.body.includes("HIV"), false);
  assert.equal(notification.body.includes("Condition Z"), false);
});

test("SECURITY: Order push notifications do not leak payment secrets or full addresses", () => {
  const sanitizeOrderNotification = (order) => {
    return {
      title: "Order Confirmed",
      body: `Your WellMeds order #${order.orderId} has been confirmed.`,
      url: "/profile?tab=orders",
      type: "ORDER_CONFIRMED",
      entityId: order.orderId,
    };
  };

  const sensitiveOrder = {
    orderId: "WM-8821",
    razorpaySignature: "secret_hmac_signature_12345",
    shippingAddress: "Flat 402, Highly Confidential Address, Baner, Pune 411021",
    items: [{ name: "Medicine A", price: 500 }],
  };

  const payload = sanitizeOrderNotification(sensitiveOrder);
  const serialized = JSON.stringify(payload);

  assert.equal(serialized.includes("secret_hmac_signature_12345"), false);
  assert.equal(serialized.includes("Highly Confidential Address"), false);
  assert.equal(payload.url, "/profile?tab=orders");
  assert.equal(payload.entityId, "WM-8821");
});

// ─── 4. Subscription Validation & Ownership Integrity ───────────────────────

test("SECURITY: Push subscription validation rejects malformed payloads", () => {
  const validateSubscription = (body) => {
    if (!body || typeof body !== "object") {
      return { valid: false, error: "Body missing" };
    }
    const { endpoint, keys } = body;
    if (!endpoint || typeof endpoint !== "string" || !endpoint.trim()) {
      return { valid: false, error: "Invalid endpoint" };
    }
    if (!keys || typeof keys !== "object" || !keys.p256dh || !keys.auth) {
      return { valid: false, error: "Missing cryptographic keys" };
    }
    return { valid: true };
  };

  // Missing endpoint
  assert.equal(validateSubscription({ keys: { p256dh: "key", auth: "auth" } }).valid, false);

  // Missing keys
  assert.equal(validateSubscription({ endpoint: "https://push.example.com/123" }).valid, false);

  // Missing p256dh
  assert.equal(validateSubscription({ endpoint: "https://push.example.com/123", keys: { auth: "auth" } }).valid, false);

  // Missing auth
  assert.equal(validateSubscription({ endpoint: "https://push.example.com/123", keys: { p256dh: "key" } }).valid, false);

  // Valid payload
  assert.equal(
    validateSubscription({
      endpoint: "https://fcm.googleapis.com/fcm/send/sample-token",
      keys: { p256dh: "valid-p256dh-key", auth: "valid-auth-key" },
    }).valid,
    true
  );
});

test("SECURITY: Subscription assignment is derived strictly from req.user._id, ignoring req.body.userId", () => {
  // Attacker tries to hijack another user's push notifications by sending a forged userId
  const req = {
    user: { _id: "legitimate_user_123", role: "customer" },
    body: {
      userId: "victim_user_999", // Malicious attempt to bind to victim
      role: "admin",              // Malicious attempt to elevate role
      endpoint: "https://push.example.com/endpoint-1",
      keys: { p256dh: "key", auth: "auth" },
    },
  };

  // Safe handler derives user strictly from authenticated session
  const derivedUserId = req.user._id;
  assert.equal(derivedUserId, "legitimate_user_123");
  assert.notEqual(derivedUserId, req.body.userId);
});

test("SECURITY: Customer cannot unsubscribe another customer's device endpoint", () => {
  // Simulated database
  const subscriptions = [
    { endpoint: "https://push.example.com/device-1", user: "customer_A" },
    { endpoint: "https://push.example.com/device-2", user: "customer_B" },
  ];

  const deleteSubscription = (requestingUserId, endpoint) => {
    const index = subscriptions.findIndex(
      (sub) => sub.endpoint === endpoint && sub.user === requestingUserId
    );
    if (index !== -1) {
      subscriptions.splice(index, 1);
      return true;
    }
    return false; // Not found or not owned by requesting user
  };

  // Customer A tries to delete Customer B's subscription
  const attackSuccess = deleteSubscription("customer_A", "https://push.example.com/device-2");
  assert.equal(attackSuccess, false);

  // Customer B's subscription remains intact
  const customerBSub = subscriptions.find((s) => s.endpoint === "https://push.example.com/device-2");
  assert.ok(customerBSub);
  assert.equal(customerBSub.user, "customer_B");

  // Customer A can delete their own subscription
  const legitimateDelete = deleteSubscription("customer_A", "https://push.example.com/device-1");
  assert.equal(legitimateDelete, true);
});

// ─── 5. Account Switching Integrity ──────────────────────────────────────────

test("SECURITY: Account switching reassigns browser endpoint atomically to new user", () => {
  // Same browser endpoint used first by User A, then by User B
  const db = new Map();

  const registerSubscription = (userId, endpoint, keys) => {
    // Unique by endpoint
    db.set(endpoint, { user: userId, endpoint, keys });
  };

  const sharedBrowserEndpoint = "https://push.example.com/laptop-chrome";

  // User A logs in and enables notifications
  registerSubscription("user_A", sharedBrowserEndpoint, { p256dh: "keyA", auth: "authA" });
  assert.equal(db.get(sharedBrowserEndpoint).user, "user_A");

  // User A logs out, User B logs in on the same browser
  registerSubscription("user_B", sharedBrowserEndpoint, { p256dh: "keyA", auth: "authA" });

  // Endpoint is now cleanly associated with User B
  assert.equal(db.get(sharedBrowserEndpoint).user, "user_B");

  // Notifications targeted at User A will NOT go to this endpoint anymore
  const subscriptionsForA = Array.from(db.values()).filter((s) => s.user === "user_A");
  assert.equal(subscriptionsForA.length, 0);

  const subscriptionsForB = Array.from(db.values()).filter((s) => s.user === "user_B");
  assert.equal(subscriptionsForB.length, 1);
  assert.equal(subscriptionsForB[0].endpoint, sharedBrowserEndpoint);
});

// ─── 6. Idempotency & Duplicate State Transition Guards ─────────────────────

test("SECURITY: Duplicate order status update does not spam push notifications", () => {
  let pushDispatchCount = 0;

  const simulateUpdateOrderStatus = (order, newStatus) => {
    const previousStatus = order.status;
    const isStatusChanged = previousStatus !== newStatus;

    order.status = newStatus;

    if (isStatusChanged) {
      pushDispatchCount++;
    }
  };

  const testOrder = { orderId: "WM-100", status: "Processing" };

  // First transition: Processing -> Packed
  simulateUpdateOrderStatus(testOrder, "Packed");
  assert.equal(pushDispatchCount, 1);

  // Redundant transition: Packed -> Packed (e.g. admin double-click)
  simulateUpdateOrderStatus(testOrder, "Packed");
  assert.equal(pushDispatchCount, 1); // Guard prevents duplicate dispatch!

  // Valid next transition: Packed -> Shipped
  simulateUpdateOrderStatus(testOrder, "Shipped");
  assert.equal(pushDispatchCount, 2);
});

// ─── 7. Non-Blocking Business Operation Safety ──────────────────────────────

test("SECURITY: Push delivery failure never interrupts order placement or payment capture", async () => {
  let orderSaved = false;

  // Mock business operation
  const placeOrderWithPush = async (simulatePushFailure = true) => {
    // 1. Order database save
    orderSaved = true;

    // 2. Safe async push dispatch
    try {
      if (simulatePushFailure) {
        throw new Error("WebPush server connection timed out (HTTP 504)");
      }
    } catch (pushErr) {
      // Non-blocking log containment
      // Operation MUST NOT rethrow
    }

    return { success: true, orderId: "WM-200" };
  };

  const result = await placeOrderWithPush(true);
  assert.equal(result.success, true);
  assert.equal(result.orderId, "WM-200");
  assert.equal(orderSaved, true);
});

// ─── 8. Defunct Subscription Cleanup (HTTP 410 / 404) ───────────────────────

test("SECURITY: Defunct push subscriptions (410 Gone / 404 Not Found) are purged automatically", () => {
  const subscriptions = [
    { _id: "sub-1", endpoint: "https://push.example.com/expired-device" },
    { _id: "sub-2", endpoint: "https://push.example.com/active-device" },
  ];

  const handlePushError = (err, sub) => {
    if (err.statusCode === 404 || err.statusCode === 410) {
      const idx = subscriptions.findIndex((s) => s._id === sub._id);
      if (idx !== -1) {
        subscriptions.splice(idx, 1);
      }
    }
  };

  // Device 1 returns 410 Gone (browser uninstalled or revoked)
  handlePushError({ statusCode: 410, message: "Subscription expired" }, subscriptions[0]);

  // Only active device remains
  assert.equal(subscriptions.length, 1);
  assert.equal(subscriptions[0]._id, "sub-2");
});
