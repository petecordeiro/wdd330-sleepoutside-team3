import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess, { isExpirationValid } from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", "#order-summary");
checkout.init();

const form = document.querySelector("#checkout-form");
const zip = form.elements.zip;
zip.addEventListener("input", () => {
  if (zip.validity.valid) {
    checkout.calculateOrderTotal();
  } else {
    for (const id of ["tax", "shipping", "order-total"]) {
      document.getElementById(id).textContent = "Enter ZIP";
    }
  }
});
zip.addEventListener("change", () => {
  if (zip.validity.valid) checkout.calculateOrderTotal();
});

const expiration = form.elements.expiration;
expiration.addEventListener("input", () => expiration.setCustomValidity(""));
expiration.addEventListener("blur", () => {
  expiration.setCustomValidity(
    expiration.value && !isExpirationValid(expiration.value)
      ? "Enter a current or future expiration date in MM/YY format."
      : "",
  );
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  checkout.checkout(form);
});
