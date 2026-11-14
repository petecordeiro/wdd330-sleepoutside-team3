import { getLocalStorage, setLocalStorage } from "./utils.mjs";


function colorSwatchesTemplate(colors) {
  // 1. Se colors não existir, ou tiver 1 cor ou menos, devolva "" (texto vazio).
  if (!colors || colors.length <= 1) {
    return "";
  }
  // 2. Use colors.map((color, index) => ...) para transformar cada cor no HTML abaixo.

  const swatches = colors.map(
    (color, index) => `<button type="button" class="color-swatch" data-index="${index}" title="${color.ColorName}">
      <img src="${color.ColorChipImageSrc}" alt="${color.ColorName}" />
    </button>`,
  );

  return `<div class="product__colors">${swatches.join("")}</div>`;
}
  // 3. Junte tudo com .join("") e devolva dentro de <div class="product__colors"> ... </div>


function productDetailTemplate(product) {
  return `
    <h3>${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>
    <img class="divider" src="${product.Images.PrimaryLarge}" alt="${product.Name}" />
    <p class="product-card__price">$${product.FinalPrice.toFixed(2)}</p>
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

      this.renderProductDetails();
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

  addProductToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
  }
}
