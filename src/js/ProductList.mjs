import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  return `
    <li class="product-card">
      <a href="/product_pages/?product=${encodeURIComponent(product.Id)}">
        <img src="${product.Images.PrimaryMedium}" alt="${product.Name}">
        <h3 class="card__brand">${product.Brand.Name}</h3>
        <h2 class="card__name">${product.NameWithoutBrand}</h2>
        <p class="product-card__price">$${product.FinalPrice.toFixed(2)}</p>
      </a>
    </li>
    `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    try {
      const list = await this.dataSource.getData(this.category);
      this.renderList(list);
      this.products = await this.dataSource.getData(this.category);
      this.renderList(this.products);
    } catch {
      this.listElement.innerHTML = `<li class="product-list__message">Unable to load products. Please try again.</li>`;
    }
  }

  renderList(list) {
    renderListWithTemplate(
      productCardTemplate,
      this.listElement,
      list,
      "beforeend",
      true,
    );
    if (!list.length) {
      this.listElement.innerHTML = `<li class="product-list__message">No products available in this category.</li>`;
    }
  }

  sortProducts(sortType) {
    const sorted = [...this.products];
    switch (sortType) {
      case "name-asc":
        sorted.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.Name.localeCompare(a.Name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.FinalPrice - b.FinalPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.FinalPrice - a.FinalPrice);
        break;
      default:
        break;
    }
    this.renderList(sorted);
  }
}
