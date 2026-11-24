import {
  getLocalStorage,
  setLocalStorage,
  alertMessage,
  animateCart,
} from "./utils.mjs";

// Builds one swatch button per color.
// Returns an empty string when the product has only one color (nothing to pick).
function colorSwatchesTemplate(colors) {
  if (!colors || colors.length <= 1) {
    return "";
  }

  // map runs once per color: "color" is the current color object, "index" is its position.
  // The first swatch (index 0) starts selected.
  const swatches = colors.map(
    (
      color,
      index,
    ) => `<button type="button" class="color-swatch${index === 0 ? " selected" : ""}" data-index="${index}" title="${color.ColorName}" aria-pressed="${index === 0}">
      <img src="${color.ColorChipImageSrc}" alt="${color.ColorName}" />
    </button>`,
  );

  return `<div class="product__colors" role="group" aria-label="Choose a color">${swatches.join("")}</div>`;
}

export function getDiscount(product) {
  const suggestedCents = Math.round((product.SuggestedRetailPrice || 0) * 100);
  const finalCents = Math.round(product.FinalPrice * 100);

  if (finalCents >= suggestedCents) {
    return null;
  }

  const savingsCents = suggestedCents - finalCents;
  return {
    amount: savingsCents / 100,
    percent: Math.round((savingsCents / suggestedCents) * 100),
  };
}

function discountTemplate(product) {
  const discount = getDiscount(product);
  if (!discount) {
    return "";
  }

  return `<p class="product__discount">
      <span class="product__discount-flag">${discount.percent}% OFF</span>
      <span>You save $${discount.amount.toFixed(2)} (was <s>$${product.SuggestedRetailPrice.toFixed(2)}</s>)</span>
    </p>`;
}

function productDetailTemplate(product) {
  return `
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img class="divider" src="${product.Images.PrimaryLarge}" alt="${product.Name}" />
    <p class="product-card__price">$${product.FinalPrice.toFixed(2)}</p>
    ${discountTemplate(product)}
    <p class="product__color">${product.Colors?.[0]?.ColorName || ""}</p>
    ${colorSwatchesTemplate(product.Colors)}
    <div class="product__description">${product.DescriptionHtmlSimple}</div>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>`;
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    // the color the customer picked
    this.selectedColor = null;
  }

  async init() {
    const detailElement = document.querySelector(".product-detail");
    if (!this.productId) {
      detailElement.textContent = "Product not found.";
      return;
    }

    detailElement.textContent = "Loading product...";

    try {
      this.product = await this.dataSource.findProductById(this.productId);
      if (!this.product) {
        detailElement.textContent = "Product not found.";
        return;
      }

      // until the customer clicks a swatch, the chosen color is the first one
      this.selectedColor = this.product.Colors?.[0] || null;

      this.renderProductDetails();
      this.addColorListeners();
      document
        .getElementById("addToCart")
        .addEventListener("click", this.addProductToCart.bind(this));
    } catch {
      detailElement.textContent =
        "Unable to load this product. Please try again.";
    }
  }

  renderProductDetails() {
    document.title = `Sleep Outside | ${this.product.Name}`;
    document.querySelector(".product-detail").innerHTML = productDetailTemplate(
      this.product,
    );
  }

  // Listen for a click on every swatch. data-index tells which color was clicked.
  addColorListeners() {
    document.querySelectorAll(".color-swatch").forEach((button) => {
      button.addEventListener("click", () => {
        this.selectColor(Number(button.dataset.index));
      });
    });
  }

  // Save the chosen color and update the page: color name and selected swatch.
  selectColor(index) {
    this.selectedColor = this.product.Colors[index];
    document.querySelector(".product__color").textContent =
      this.selectedColor.ColorName;

    document.querySelectorAll(".color-swatch").forEach((button, i) => {
      const isSelected = i === index;
      button.classList.toggle("selected", isSelected);
      button.setAttribute("aria-pressed", isSelected);
    });
  }

  addProductToCart() {
    try {
      const cartItems = getLocalStorage("so-cart") || [];
      // Keep the chosen color with each unit in the cart.
      cartItems.push({ ...this.product, SelectedColor: this.selectedColor });
      setLocalStorage("so-cart", cartItems);
      animateCart();
      document.querySelector(".alert")?.remove();
      alertMessage(`${this.product.Name} added to your cart.`, false);
    } catch {
      alertMessage(
        "Unable to save this item to your cart. Please try again.",
        false,
      );
    }
  }
}
