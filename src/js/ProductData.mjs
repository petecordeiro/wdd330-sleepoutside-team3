const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

async function getResult(path) {
  if (!baseURL) {
    throw new Error("VITE_SERVER_URL must be configured.");
  }
  const serverURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  const response = await fetch(new URL(path, serverURL));
  const data = await convertToJson(response);
  return data.Result;
}

export default class ProductData {
  async getData(category) {
    return getResult(`products/search/${encodeURIComponent(category)}`);
  }

  async findProductById(id) {
    return getResult(`product/${encodeURIComponent(id)}`);
  }
}
