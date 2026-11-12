import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const categories = {
  tents: "Tents",
  "sleeping-bags": "Sleeping Bags",
  backpacks: "Backpacks",
  hammocks: "Hammocks",
};
const category = getParam("category") || "tents";
const listElement = document.querySelector(".product-list");

if (Object.hasOwn(categories, category)) {
  const categoryName = categories[category];
  document.querySelector("#products-heading").textContent =
    `Top Products: ${categoryName}`;
  document.title = `Sleep Outside | ${categoryName}`;

  const productList = new ProductList(category, new ProductData(), listElement);
  productList.init();
} else {
  listElement.innerHTML = `<li class="product-list__message">Category not found. <a href="/index.html">Choose a category</a>.</li>`;
}
