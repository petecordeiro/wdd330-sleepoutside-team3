/* eslint-env es2021 */
import test from "node:test";
import assert from "node:assert/strict";
import { getDiscount } from "../js/ProductDetails.mjs";

test("discount is the difference in dollars and a rounded percentage", () => {
  assert.deepEqual(
    getDiscount({ SuggestedRetailPrice: 60, FinalPrice: 39.99 }),
    {
      amount: 20.01,
      percent: 33,
    },
  );
  assert.deepEqual(
    getDiscount({ SuggestedRetailPrice: 270, FinalPrice: 229.99 }),
    { amount: 40.01, percent: 15 },
  );
});

test("products that are not cheaper than the suggested price have no discount", () => {
  assert.equal(
    getDiscount({ SuggestedRetailPrice: 39.99, FinalPrice: 39.99 }),
    null,
  );
  assert.equal(
    getDiscount({ SuggestedRetailPrice: 30, FinalPrice: 39.99 }),
    null,
  );
  assert.equal(getDiscount({ FinalPrice: 39.99 }), null);
});
