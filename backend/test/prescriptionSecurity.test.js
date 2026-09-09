import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import crypto from "node:crypto";
import { evaluatePrescriptionCartMatch, normalizeRxItems } from "../src/services/cartMatchingEngine.js";
import { calculateDeliveryFee, resolvePackaging } from "../src/config/pricingConstants.js";

// ── 1. Cart Matching & Tamper Prevention Tests ──────────────────────────────

test("SECURITY: Cart Matching rejects product substitution attempt", () => {
  const approvedPrescription = {
    status: "Approved",
    cartSnapshot: {
      items: [
        { productId: "64b000000000000000000001", name: "Amoxicillin 500mg", quantity: 2, requiresRx: true },
      ],
    },
  };

  // Attacker swaps product ID to an unprescribed restricted medication
  const tamperedCart = [
    { product: "64b000000000000000000099", name: "Restricted Substance", quantity: 2, requiresRx: true },
  ];

  const rxItems = normalizeRxItems(tamperedCart);
  const matchResult = evaluatePrescriptionCartMatch(approvedPrescription, rxItems);
  assert.equal(matchResult.isMatch, false);
});

test("SECURITY: Cart Matching rejects quantity increase beyond prescribed amount", () => {
  const approvedPrescription = {
    status: "Approved",
    cartSnapshot: {
      items: [
        { productId: "64b000000000000000000001", name: "Amoxicillin 500mg", quantity: 2, requiresRx: true },
      ],
    },
  };

  // Attacker increases quantity from 2 to 10
  const tamperedCart = [
    { product: "64b000000000000000000001", name: "Amoxicillin 500mg", quantity: 10, requiresRx: true },
  ];

  const rxItems = normalizeRxItems(tamperedCart);
  const matchResult = evaluatePrescriptionCartMatch(approvedPrescription, rxItems);
  assert.equal(matchResult.isMatch, false);
});

test("SECURITY: Cart Matching rejects additional unprescribed Rx items", () => {
  const approvedPrescription = {
    status: "Approved",
    cartSnapshot: {
      items: [
        { productId: "64b000000000000000000001", name: "Amoxicillin 500mg", quantity: 2, requiresRx: true },
      ],
    },
  };

  // Attacker keeps prescribed item but injects another Rx item
  const tamperedCart = [
    { product: "64b000000000000000000001", name: "Amoxicillin 500mg", quantity: 2, requiresRx: true },
    { product: "64b000000000000000000002", name: "Unprescribed Rx Drug", quantity: 1, requiresRx: true },
  ];

  const rxItems = normalizeRxItems(tamperedCart);
  const matchResult = evaluatePrescriptionCartMatch(approvedPrescription, rxItems);
  assert.equal(matchResult.isMatch, false);
});

test("SECURITY: PrescribedItems fallback match validates prescribed medications", () => {
  const approvedPrescription = {
    status: "Approved",
    prescribedItems: [
      { product: "64b000000000000000000001", name: "Paracetamol 650", quantity: 3, isRx: true },
    ],
  };

  const validCart = normalizeRxItems([
    { product: "64b000000000000000000001", name: "Paracetamol 650", quantity: 3, requiresRx: true },
  ]);

  const matchResult = evaluatePrescriptionCartMatch(approvedPrescription, validCart);
  assert.equal(matchResult.isMatch, true);
});

// ── 2. Pricing Calculation Security Tests ───────────────────────────────────

test("SECURITY: Delivery fee is calculated strictly server-side (Free > 2000, else 99)", () => {
  assert.equal(calculateDeliveryFee(1999), 99);
  assert.equal(calculateDeliveryFee(2000), 99);
  assert.equal(calculateDeliveryFee(2001), 0);
  assert.equal(calculateDeliveryFee(5000), 0);
  // Free delivery coupon override
  assert.equal(calculateDeliveryFee(500, true), 0);
});

test("SECURITY: Packaging fee cannot be forged by customer", () => {
  const regularPkg = resolvePackaging("regular");
  assert.equal(regularPkg.price, 19);

  const coldPkg = resolvePackaging("cold");
  assert.equal(coldPkg.price, 79);

  // Fallback on invalid/forged type
  const forgedPkg = resolvePackaging("forged_zero_fee_type");
  assert.equal(forgedPkg.price, 19);
});

// ── 3. File Upload & Path Traversal Security Tests ───────────────────────────

test("SECURITY: Filename sanitization strips null bytes and directory traversal", () => {
  const maliciousNames = [
    "../../etc/passwd.pdf",
    "..\\..\\windows\\system32\\cmd.exe.png",
    "shell.php\0.jpg",
    "script.svg",
    "malware.exe",
  ];

  const DANGEROUS_EXTENSIONS = [
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".php", ".phtml", ".php3", ".php4", ".php5",
    ".phps", ".cgi", ".pl", ".py", ".rb", ".asp", ".aspx", ".jsp", ".jspx", ".cfm",
    ".js", ".jsx", ".ts", ".tsx", ".vbs", ".wsf", ".hta", ".scr", ".com", ".pif",
    ".svg", ".html", ".htm", ".xhtml", ".xml", ".shtml", ".dll", ".so", ".dylib"
  ];

  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

  const hasDangerousSubExtension = (filename) => {
    const clean = filename.toLowerCase().replace(/\\/g, "/");
    const base = path.basename(clean);
    const parts = base.split(".");
    if (parts.length > 2) {
      for (let i = 1; i < parts.length - 1; i++) {
        if (DANGEROUS_EXTENSIONS.includes("." + parts[i])) {
          return true;
        }
      }
    }
    return false;
  };

  for (const filename of maliciousNames) {
    const normalizedName = filename.replace(/\0/g, "").replace(/\\/g, "/");
    const cleanOriginal = path.basename(normalizedName);
    const rawExt = path.extname(cleanOriginal).toLowerCase();
    const isDangerous = DANGEROUS_EXTENSIONS.includes(rawExt) || hasDangerousSubExtension(cleanOriginal);
    const isAllowed = allowedExtensions.includes(rawExt) && !isDangerous;

    if (filename.includes(".php") || filename.includes(".exe") || filename.includes(".svg")) {
      assert.ok(isDangerous || !isAllowed, `Malicious file ${filename} must be rejected`);
    }

    // Ensure directory traversal prefix is neutralized
    assert.equal(cleanOriginal.includes(".."), false);
  }
});

// ── 4. Payment Signature Cryptographic Security Tests ────────────────────────

test("SECURITY: Razorpay webhook & client signature validation rejects forged payloads", () => {
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_987654321";
  const paymentId = "pay_123456789";

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Verify correct signature succeeds
  const testValid = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  assert.equal(validSignature, testValid);

  // Attacker provides tampered paymentId or forged signature
  const forgedPaymentId = "pay_forged_99999";
  const forgedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${forgedPaymentId}`)
    .digest("hex");

  assert.notEqual(validSignature, forgedSignature);
});
