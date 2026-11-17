import ExternalServices from "./ExternalServices.mjs";
import {
  getLocalStorage,
  setLocalStorage,
  getCartSubtotalCents,
  alertMessage,
} from "./utils.mjs";

export function calculateTotals(items) {
  const subtotal = getCartSubtotalCents(items);
  const tax = Math.round(subtotal * 0.06);
  const shipping = items.length ? 1000 + (items.length - 1) * 200 : 0;
  return {
    itemTotal: subtotal / 100,
    tax: tax / 100,
    shipping: shipping / 100,
    orderTotal: (subtotal + tax + shipping) / 100,
  };
}

export function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: 1,
  }));
}

export function isExpirationValid(value, today = new Date()) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  // Cards remain valid through the last day of their expiration month.
  return year * 12 + month >= today.getFullYear() * 12 + today.getMonth() + 1;
}

export function errorMessages(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(errorMessages);
  if (value && typeof value === "object") {
    return errorMessages(value.errors ?? value.message ?? Object.values(value));
  }
  return [];
}

export default class CheckoutProcess {
  constructor(key, outputSelector, services = new ExternalServices()) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.services = services;
    this.list = [];
    this.submitting = false;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
    const empty = this.list.length === 0;
    document.querySelector("#checkout-form").hidden = empty;
    document.querySelector(this.outputSelector).hidden = empty;
    document.querySelector("#checkout-empty").hidden = !empty;
  }

  calculateItemSubTotal() {
    this.itemTotal = getCartSubtotalCents(this.list) / 100;
    document.querySelector(`${this.outputSelector} #subtotal`).textContent =
      `$${this.itemTotal.toFixed(2)}`;
    document.querySelector(`${this.outputSelector} #item-count`).textContent =
      `${this.list.length} ${this.list.length === 1 ? "item" : "items"}`;
  }

  calculateOrderTotal() {
    Object.assign(this, calculateTotals(this.list));
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    for (const [id, value] of Object.entries({
      tax: this.tax,
      shipping: this.shipping,
      "order-total": this.orderTotal,
    })) {
      document.querySelector(`${this.outputSelector} #${id}`).textContent =
        `$${value.toFixed(2)}`;
    }
  }

  async checkout(form) {
    if (this.submitting) return;
    const expiration = form.elements.expiration;
    expiration.setCustomValidity(
      isExpirationValid(expiration.value)
        ? ""
        : "Enter a current or future expiration date in MM/YY format.",
    );
    if (!form.reportValidity()) return;

    // Read again in case the customer changed the cart in another tab.
    this.init();
    if (!this.list.length) return;
    this.calculateOrderTotal();
    const order = Object.fromEntries(
      Array.from(new FormData(form), ([key, value]) => [key, value.trim()]),
    );
    order.cardNumber = order.cardNumber.replace(/\s/g, "");
    order.state = order.state.toUpperCase();
    Object.assign(order, {
      orderDate: new Date().toISOString(),
      items: packageItems(this.list),
      orderTotal: this.orderTotal.toFixed(2),
      shipping: this.shipping,
      tax: this.tax.toFixed(2),
    });

    const button = form.elements.namedItem("checkoutSubmit");
    this.submitting = true;
    button.disabled = true;
    button.textContent = "Placing order…";
    form.setAttribute("aria-busy", "true");
    document.querySelectorAll(".alert").forEach((alert) => alert.remove());
    try {
      await this.services.checkout(order);
      setLocalStorage(this.key, []);
      form.reset();
      window.location.assign("/checkout/success.html");
    } catch (err) {
      const messages =
        err.name === "servicesError" ? errorMessages(err.message) : [];
      const feedback = messages.length
        ? messages
        : [
            "We couldn't submit your order. Check your connection and try again.",
          ];
      // Prepend in reverse so multiple server messages retain their order.
      feedback.reverse().forEach((message) => alertMessage(message));
    } finally {
      this.submitting = false;
      button.disabled = false;
      button.textContent = "Place Order";
      form.removeAttribute("aria-busy");
    }
  }
}
