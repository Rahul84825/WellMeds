import assert from "node:assert/strict";
import test from "node:test";
import { evaluatePrescriptionCartMatch, normalizeRxItems } from "../src/services/cartMatchingEngine.js";

const approvedPrescription = {
  status: "Approved",
  cartSnapshot: {
    items: [
      { productId: "64b000000000000000000001", name: "Rx Medicine", quantity: 2, requiresRx: true },
    ],
  },
};

test("server-validated order items retain Rx identity for prescription matching", () => {
  const orderItems = [
    {
      product: "64b000000000000000000001",
      name: "Rx Medicine",
      quantity: 2,
      requiresRx: true,
      isPrescriptionRequired: true,
    },
  ];

  const rxItems = normalizeRxItems(orderItems);
  assert.equal(rxItems.length, 1);
  assert.equal(rxItems[0].productId, "64b000000000000000000001");
  assert.equal(evaluatePrescriptionCartMatch(approvedPrescription, rxItems).isMatch, true);
});

test("non-Rx order items are excluded from prescription matching", () => {
  const orderItems = [
    { product: "64b000000000000000000002", name: "Wellness Item", quantity: 1, requiresRx: false },
  ];

  assert.deepEqual(normalizeRxItems(orderItems), []);
});

test("a pending document can be checked against a cart before pharmacist approval", () => {
  const pendingPrescription = { ...approvedPrescription, status: "Pending Review" };
  const rxItems = normalizeRxItems([
    { product: "64b000000000000000000001", name: "Rx Medicine", quantity: 2, requiresRx: true },
  ]);

  assert.equal(evaluatePrescriptionCartMatch(pendingPrescription, rxItems).isMatch, false);
  assert.equal(
    evaluatePrescriptionCartMatch(pendingPrescription, rxItems, { requireApproved: false }).isMatch,
    true
  );
});
