import {
  getLocalStorage,
  setLocalStorage,
  alertMessage,
  removeAllAlerts,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

const TAX_RATE = 0.06; // 6% sales tax
const FIRST_ITEM_SHIPPING = 10; // $10 for the first item
const EXTRA_ITEM_SHIPPING = 2; // $2 for each additional item

// Takes a form element and returns an object where each key is the input "name".
// Example: <input name="fname" value="John"> becomes { fname: "John" }
function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};

  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

// Takes the products stored in the cart and returns them in the simpler form
// the server expects: { id, name, price, quantity }.
function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: 1,
  }));
}

export default class CheckoutProcess {
  // key: the localStorage key of the cart ("so-cart")
  // outputSelector: the element that holds the order summary ("#order-summary")
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  // Step 4: called when the page loads.
  // Adds up the price of every item in the cart and shows the subtotal.
  calculateItemSubTotal() {
    this.itemTotal = this.list.reduce((sum, item) => sum + item.FinalPrice, 0);

    const summary = document.querySelector(this.outputSelector);
    summary.querySelector("#num-items").innerText = this.list.length;
    summary.querySelector("#subtotal").innerText =
      `$${this.itemTotal.toFixed(2)}`;
  }

  // Step 5: called after the user fills in the zip code.
  // Tax is 6% of the subtotal. Shipping is $10 for the first item plus $2 for each extra item.
  calculateOrderTotal() {
    this.tax = this.itemTotal * TAX_RATE;
    this.shipping =
      this.list.length > 0
        ? FIRST_ITEM_SHIPPING + (this.list.length - 1) * EXTRA_ITEM_SHIPPING
        : 0;
    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const summary = document.querySelector(this.outputSelector);
    summary.querySelector("#tax").innerText = `$${this.tax.toFixed(2)}`;
    summary.querySelector("#shipping").innerText =
      `$${this.shipping.toFixed(2)}`;
    summary.querySelector("#orderTotal").innerText =
      `$${this.orderTotal.toFixed(2)}`;
  }

  // Step 7: called when the form is submitted.
  // Builds the order object with the exact keys the server expects and sends it.
  // W04 individual: on success empty the cart and go to the success page;
  // on error show the server's messages at the top of the page.
  async checkout(form) {
    // make sure the totals are up to date, even if the zip code was never changed
    this.calculateOrderTotal();

    const order = formDataToJSON(form);
    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal.toFixed(2);
    order.tax = this.tax.toFixed(2);
    order.shipping = this.shipping;
    order.items = packageItems(this.list);

    try {
      await services.checkout(order);
      // Happy path: these lines only run if the server accepted the order.
      // If convertToJson throws, JavaScript jumps straight to the catch below.
      setLocalStorage(this.key, []); // empty the cart
      location.assign("/checkout/success.html");
    } catch (err) {
      // Unhappy path: stay on the form so the user keeps what they typed.
      removeAllAlerts(); // remove the messages from the previous attempt
      if (err.name === "servicesError" && typeof err.message === "object") {
        // The server sends one message per field, e.g. { cardNumber: "Invalid Card Number" }.
        // Object.values gives just the messages: ["Invalid Card Number"]
        Object.values(err.message).forEach((message) => alertMessage(message));
      } else {
        alertMessage("We could not place your order. Please try again.");
      }
    }
  }
}
