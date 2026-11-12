import {
  getLocalStorage,
  setLocalStorage,
  renderListWithTemplate,
} from "./utils.mjs";

function cartItemTemplate(item) {
  const productUrl = `/product_pages/?product=${encodeURIComponent(item.Id)}`;
  const newItem = `<li class="cart-card divider">
  <button
    type="button"
    class="cart-card__remove"
    data-id="${item.Id}"
    aria-label="Remove item from cart"
    title="Remove item from cart"
  >
    <img src="/images/close.svg" alt="" width="32" height="32" />
  </button>
  <a href="${productUrl}" class="cart-card__image">
    <img
      src="${item.Images?.PrimaryMedium || item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="${productUrl}">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice.toFixed(2)}</p>
</li>`;

  return newItem;
}

export default class ShoppingCart {
  constructor(listElement) {
    this.listElement = listElement;
  }

  init() {
    this.renderCartContents();
    this.listElement.addEventListener("click", (event) => {
      const button = event.target.closest(".cart-card__remove");
      if (button) {
        this.removeItem(button.dataset.id);
      }
    });
  }

  renderCartContents() {
    const cartItems = getLocalStorage("so-cart") || [];
    renderListWithTemplate(
      cartItemTemplate,
      this.listElement,
      cartItems,
      "beforeend",
      true,
    );
    if (!cartItems.length) {
      this.listElement.innerHTML = `<li class="product-list__message">Your cart is empty. <a href="/index.html">Browse categories</a>.</li>`;
    }
  }

  removeItem(productId) {
    const cartItems = getLocalStorage("so-cart") || [];
    const index = cartItems.findIndex((item) => item.Id === productId);
    if (index === -1) return;

    cartItems.splice(index, 1);
    setLocalStorage("so-cart", cartItems);
    this.renderCartContents();
  }
}
