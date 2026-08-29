import assert from "node:assert/strict";
import test from "node:test";
import {
  PRICING_CONFIG,
  calculateDeliveryFee,
  resolvePackaging,
  resolvePackagingForItems,
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

test("TEST 1: Cart = ₹1,500, Regular packaging -> Delivery = ₹99, Packaging = ₹19, Total = ₹1,618", () => {
  const result = computePricing({ subtotal: 1500, packagingType: "regular" });
  assert.equal(result.subtotal, 1500);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 19);
  assert.equal(result.packagingFee, 19);
  assert.equal(result.total, 1618);
});

test("TEST 2: Cart = ₹2,000, Regular packaging -> Delivery = ₹99, Packaging = ₹19, Total = ₹2,118", () => {
  const result = computePricing({ subtotal: 2000, packagingType: "regular" });
  assert.equal(result.subtotal, 2000);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 19);
  assert.equal(result.packagingFee, 19);
  assert.equal(result.total, 2118);
});

test("TEST 3: Cart = ₹2,001, Regular packaging -> Delivery = FREE (₹0), Packaging = ₹19, Total = ₹2,020", () => {
  const result = computePricing({ subtotal: 2001, packagingType: "regular" });
  assert.equal(result.subtotal, 2001);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packaging.type, "regular");
  assert.equal(result.packaging.price, 19);
  assert.equal(result.packagingFee, 19);
  assert.equal(result.total, 2020);
});

test("TEST 4: Cart = ₹1,500, Cold packaging -> Delivery = ₹99, Packaging = ₹79, Total = ₹1,678", () => {
  const result = computePricing({ subtotal: 1500, packagingType: "cold" });
  assert.equal(result.subtotal, 1500);
  assert.equal(result.deliveryFee, 99);
  assert.equal(result.packaging.type, "cold");
  assert.equal(result.packaging.price, 79);
  assert.equal(result.packagingFee, 79);
  assert.equal(result.total, 1678);
});

test("TEST 5: Cart = ₹2,001, Cold packaging -> Delivery = FREE (₹0), Packaging = ₹79, Total = ₹2,080", () => {
  const result = computePricing({ subtotal: 2001, packagingType: "cold" });
  assert.equal(result.subtotal, 2001);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packaging.type, "cold");
  assert.equal(result.packaging.price, 79);
  assert.equal(result.packagingFee, 79);
  assert.equal(result.total, 2080);
});

test("TEST 6: Switch Regular -> Cold increases total by exactly ₹60 (₹79 - ₹19)", () => {
  const regular = computePricing({ subtotal: 1500, packagingType: "regular" });
  const cold = computePricing({ subtotal: 1500, packagingType: "cold" });
  assert.equal(cold.total - regular.total, 60);
});

test("TEST 7: Switch Cold -> Regular decreases total by exactly ₹60", () => {
  const cold = computePricing({ subtotal: 2500, packagingType: "cold" });
  const regular = computePricing({ subtotal: 2500, packagingType: "regular" });
  assert.equal(cold.total - regular.total, 60);
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
  assert.equal(manipulated1.price, 19);

  const manipulated2 = resolvePackaging(null);
  assert.equal(manipulated2.type, "regular");
  assert.equal(manipulated2.price, 19);

  const manipulated3 = resolvePackaging(1);
  assert.equal(manipulated3.type, "regular");
  assert.equal(manipulated3.price, 19);
});

test("TEST 12: Empty cart subtotal = 0 has ₹0 delivery and ₹0 packaging fee", () => {
  const result = computePricing({ subtotal: 0, packagingType: "regular" });
  assert.equal(result.subtotal, 0);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.packagingFee, 0);
  assert.equal(result.total, 0);
});

test("TEST 13: Normal products only -> auto ₹19 Regular Packaging", () => {
  const items = [
    { isColdChain: false, name: "Paracetamol 500mg" },
    { isColdChain: false, name: "Vitamin C 500mg" },
  ];
  const pkg = resolvePackagingForItems(items);
  assert.equal(pkg.type, "regular");
  assert.equal(pkg.price, 19);
});

test("TEST 14: 1 Cold Chain Product + 1 Normal Product -> Cold Chain has priority (₹79)", () => {
  const items = [
    { isColdChain: false, name: "Paracetamol 500mg" },
    { isColdChain: true, name: "Insulin Glargine 100IU/ml" },
  ];
  const pkg = resolvePackagingForItems(items);
  assert.equal(pkg.type, "cold");
  assert.equal(pkg.price, 79);
});

test("TEST 15: Up to 20 products with only 1 cold chain -> Cold Chain still has priority (₹79)", () => {
  const items = Array.from({ length: 19 }, (_, i) => ({
    isColdChain: false,
    name: `Normal Medicine ${i + 1}`,
  }));
  items.push({ isColdChain: true, name: "Cold Medicine" });

  const pkg = resolvePackagingForItems(items);
  assert.equal(pkg.type, "cold");
  assert.equal(pkg.price, 79);
});

test("TEST 16: 20 normal products without cold chain -> ₹19 Regular Packaging", () => {
  const items = Array.from({ length: 20 }, (_, i) => ({
    isColdChain: false,
    name: `Normal Medicine ${i + 1}`,
  }));

  const pkg = resolvePackagingForItems(items);
  assert.equal(pkg.type, "regular");
  assert.equal(pkg.price, 19);
});

