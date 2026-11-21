// Server address from the .env file (VITE_SERVER_URL). Vite exposes it in import.meta.env.
const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  // All products of one category, e.g. "tents" or "sleeping-bags".
  // The API wraps the answer in { Result: [...] }, so we return data.Result.
  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  // One product, asked to the API directly by its id.
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }
}
