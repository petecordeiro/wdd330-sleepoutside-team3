/* eslint-env es2021 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  packageItems,
  isExpirationValid,
  errorMessages,
} from "../js/CheckoutProcess.mjs";
import ExternalServices from "../js/ExternalServices.mjs";

const backpack = { Id: "20CXG", Name: "Backpack", FinalPrice: 39.99 };
const sleepingBag = { Id: "14GVF", Name: "Sleeping bag", FinalPrice: 229.99 };

test("empty carts have no subtotal, tax, shipping, or total", () => {
  assert.deepEqual(calculateTotals([]), {
    itemTotal: 0,
    tax: 0,
    shipping: 0,
    orderTotal: 0,
  });
});

test("one item costs $10 to ship and sales tax rounds to cents", () => {
  assert.deepEqual(calculateTotals([backpack]), {
    itemTotal: 39.99,
    tax: 2.4,
    shipping: 10,
    orderTotal: 52.39,
  });
});

test("multiple items use 6% tax and $2 shipping for each additional unit", () => {
  assert.deepEqual(calculateTotals([backpack, sleepingBag]), {
    itemTotal: 269.98,
    tax: 16.2,
    shipping: 12,
    orderTotal: 298.18,
  });
  assert.deepEqual(calculateTotals([backpack, backpack, backpack]), {
    itemTotal: 119.97,
    tax: 7.2,
    shipping: 14,
    orderTotal: 141.17,
  });
});

test("fractional prices do not introduce floating point totals", () => {
  assert.deepEqual(
    calculateTotals([{ FinalPrice: 0.1 }, { FinalPrice: 0.2 }]),
    {
      itemTotal: 0.3,
      tax: 0.02,
      shipping: 12,
      orderTotal: 12.32,
    },
  );
});

test("order items use the server keys and preserve repeated units", () => {
  const item = { ...backpack, SelectedColor: { ColorName: "Blue" } };
  assert.deepEqual(packageItems([item, item]), [
    { id: "20CXG", name: "Backpack", price: 39.99, quantity: 1 },
    { id: "20CXG", name: "Backpack", price: 39.99, quantity: 1 },
  ]);
  assert.equal(item.SelectedColor.ColorName, "Blue");
});

test("expiration accepts the current month and rejects past or malformed dates", () => {
  const today = new Date(2026, 10, 17);
  for (const value of ["11/26", "12/26", "01/27"]) {
    assert.equal(isExpirationValid(value, today), true, value);
  }
  for (const value of [
    "10/26",
    "12/25",
    "00/27",
    "13/27",
    "1/27",
    "01/2027",
    "",
  ]) {
    assert.equal(isExpirationValid(value, today), false, value);
  }
});

test("server validation messages are extracted from field errors and arrays", () => {
  assert.deepEqual(
    errorMessages({
      errors: {
        cardNumber: ["Invalid Card Number"],
        expiration: "Invalid expiration date",
      },
    }),
    ["Invalid Card Number", "Invalid expiration date"],
  );
  assert.deepEqual(errorMessages({ message: "Try again" }), ["Try again"]);
  assert.deepEqual(errorMessages(null), []);
});

test("checkout posts JSON to the configured backend and returns its response", async (t) => {
  const order = {
    fname: "Jane",
    items: packageItems([backpack]),
    orderTotal: "52.39",
  };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(String(url), "https://example.test/checkout");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), order);
    return new Response(JSON.stringify({ orderId: "test-order" }));
  });
  assert.deepEqual(
    await new ExternalServices("https://example.test").checkout(order),
    { orderId: "test-order" },
  );
});

test("non-OK responses preserve the full JSON error body", async (t) => {
  const errors = {
    message: {
      cardNumber: "Invalid Card Number",
      code: "Invalid security code",
    },
  };
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(JSON.stringify(errors), { status: 400 }),
  );
  await assert.rejects(
    new ExternalServices("https://example.test/").checkout({}),
    (err) => {
      assert.equal(err.name, "servicesError");
      assert.equal(err.status, 400);
      assert.deepEqual(err.message, errors);
      return true;
    },
  );
});

test("product listing and detail still unwrap Result after the service rename", async (t) => {
  const paths = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    paths.push(new URL(url).pathname);
    return new Response(JSON.stringify({ Result: backpack }));
  });
  const services = new ExternalServices("https://example.test/");
  assert.deepEqual(await services.getData("sleeping-bags"), backpack);
  assert.deepEqual(await services.findProductById("id/with space"), backpack);
  assert.deepEqual(paths, [
    "/products/search/sleeping-bags",
    "/product/id%2Fwith%20space",
  ]);
});

test("network failures and non-JSON responses reject instead of succeeding", async (t) => {
  const services = new ExternalServices("https://example.test/");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(services.checkout({}), /Failed to fetch/);
  fetchMock.mock.mockImplementation(
    async () => new Response("Service unavailable", { status: 503 }),
  );
  await assert.rejects(services.checkout({}), /unreadable response/);
});
