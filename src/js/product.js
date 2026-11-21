import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

const productId = getParam("product");
// findProductById asks the API for the product directly, so no category is needed
const dataSource = new ProductData();

const product = new ProductDetails(productId, dataSource);
product.init();
