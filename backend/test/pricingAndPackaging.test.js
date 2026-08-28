import assert from "node:assert/strict";
import test from "node:test";
import {
  PRICING_CONFIG,
  calculateDeliveryFee,
  resolvePackaging,
} from "../src/config/pricingConstants.js";

// Helper function to simulate backend pricing computation
const computePricing = ({ subtotal, packagingType = "regular", hasFreeDeliveryCoupon = false }) => {
  const deliveryFee = calculateDeliveryFee(subtotal, hasFreeDeliveryCoupon);
  const packaging = resolvePackaging(packagingType);
  const packagingFee = subtotal === 0 ? 0 : packaging.price;
  const total = subtotal + deliveryFee + packagingFee;

  return {
    subtotal,
    deliveryFee,
    packaging,
    packagingFee,
    total,
  };
};

test("TEST 1: Cart = ₹1,500, Regular packaging -> Delivery = ₹99, Packaging = ₹12, Total = ₹1,611", () => {
  const result = computePricing({ subtotal: 1500, packagingType: "regular" });
  assert.equal(result.subtotal, 1500);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 12);
  assert.equal(result.packagingFee, 12);
  assert.equal(result.total, 1611);
});

test("TEST 2: Cart = ₹2,000, Regular packaging -> Delivery = ₹99, Packaging = ₹12, Total = ₹2,111", () => {
  const result = computePricing({ subtotal: 2000, packagingType: "regular" });
  assert.equal(result.subtotal, 2000);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 12);
  assert.equal(result.packagingFee, 12);
  assert.equal(result.total, 2111);
});

test("TEST 3: Cart = ₹2,001, Regular packaging -> Delivery = FREE (₹0), Packaging = ₹12, Total = ₹2,013", () => {
  const result = computePricing({ subtotal: 2001, packagingType: "regular" });
  assert.equal(result.subtotal, 2001);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 12);
  assert.equal(result.packagingFee, 12);
  assert.equal(result.total, 2013);
});

test("TEST 4: Cart = ₹1,500, Cold packaging -> Delivery = ₹99, Packaging = ₹59, Total = ₹1,658", () => {
  const result = computePricing({ subtotal: 1500, packagingType: "cold" });
  assert.equal(result.subtotal, 1500);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "cold");
  assert.equal(result.packaging.price, 59);
  assert.equal(result.packagingFee, 59);
  assert.equal(result.total, 1658);
});

test("TEST 5: Cart = ₹2,001, Cold packaging -> Delivery = FREE (₹0), Packaging = ₹59, Total = ₹2,060", () => {
  const result = computePricing({ subtotal: 2001, packagingType: "cold" });
  assert.equal(result.subtotal, 2001);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packaging.type, "cold");
  assert.equal(result.packaging.price, 59);
  assert.equal(result.packagingFee, 59);
  assert.equal(result.total, 2060);
});

test("TEST 6: Switch Regular -> Cold increases total by exactly ₹47 (₹59 - ₹12)", () => {
  const regular = computePricing({ subtotal: 1500, packagingType: "regular" });
  const cold = computePricing({ subtotal: 1500, packagingType: "cold" });
  assert.equal(cold.total - regular.total, 47);
});

test("TEST 7: Switch Cold -> Regular decreases total by exactly ₹47", () => {
  const cold = computePricing({ subtotal: 2500, packagingType: "cold" });
  const regular = computePricing({ subtotal: 2500, packagingType: "regular" });
  assert.equal(cold.total - regular.total, 47);
});

test("TEST 8: Quantity increases so cart crosses ₹2000 -> Delivery changes from ₹99 to ₹0 (FREE)", () => {
  const before = computePricing({ subtotal: 1800, packagingType: "regular" });
  const after = computePricing({ subtotal: 2400, packagingType: "regular" });
  assert.equal(before.deliveryFee, 99);
  assert.equal(after.deliveryFee, 0);
});

test("TEST 9: Quantity decreases so cart falls back to <= ₹2000 -> Delivery changes from FREE to ₹99", () => {
  const before = computePricing({ subtotal: 2200, packagingType: "regular" });
  const after = computePricing({ subtotal: 1900, packagingType: "regular" });
  assert.equal(before.deliveryFee, 0);
  assert.equal(after.deliveryFee, 99);
});

test("TEST 10: Security check - Client manipulated delivery fee ignored, authoritative fee calculated", () => {
  // Client attempts to send deliveryFee = 0 for ₹1,500 cart
  const result = calculateDeliveryFee(1500, false);
  assert.equal(result, 99);
});

test("TEST 11: Security check - Client manipulated packaging values fallback safely to regular packaging", () => {
  const manipulated1 = resolvePackaging("custom_hacked_type");
  assert.equal(manipulated1.type, "regular");
  assert.equal(manipulated1.price, 12);

  const manipulated2 = resolvePackaging(null);
  assert.equal(manipulated2.type, "regular");
  assert.equal(manipulated2.price, 12);

  const manipulated3 = resolvePackaging(1);
  assert.equal(manipulated3.type, "regular");
  assert.equal(manipulated3.price, 12);
});

test("TEST 12: Empty cart subtotal = 0 has ₹0 delivery and ₹0 packaging fee", () => {
  const result = computePricing({ subtotal: 0, packagingType: "regular" });
  assert.equal(result.subtotal, 0);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packagingFee, 0);
  assert.equal(result.total, 0);
});

test("EDGE CASE: Free delivery coupon overrides threshold", () => {
  const result = computePricing({ subtotal: 500, packagingType: "regular", hasFreeDeliveryCoupon: true });
  assert.equal(result.subtotal, 500);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.total, 512); // 500 + 0 + 12
});
