import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

// the cart lives in localStorage under "so-cart"; the summary is inside #order-summary
const order = new CheckoutProcess("so-cart", "#order-summary");
order.init(); // shows the item subtotal as soon as the page loads

// Step 5: once the user fills in the zip code, show tax, shipping and order total.
// bind(order) makes "this" inside calculateOrderTotal point to the order object.
document
  .querySelector("#zip")
  .addEventListener("change", order.calculateOrderTotal.bind(order));

// Step 7: the browser only fires "submit" after every required field is valid.
document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stay on the page instead of the normal form submit
  order.checkout(event.target);
});
