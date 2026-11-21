import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getParam } from "./utils.mjs";

// The category comes from the URL, e.g. product_listing/?category=backpacks
// Without one, show tents.
const category = getParam("category") || "tents";

// "sleeping-bags" -> "Sleeping Bags"
const categoryName = category
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

// Fix the title: "Top Products: Backpacks"
document.querySelector(".products h2").textContent =
  `Top Products: ${categoryName}`;
document.title = `Sleep Outside | ${categoryName}`;

// The data source no longer needs a category: it is sent to getData when needed.
const dataSource = new ProductData();
const listElement = document.querySelector(".product-list");
const myList = new ProductList(category, dataSource, listElement);
myList.init();
