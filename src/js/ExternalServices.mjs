async function convertToJson(res) {
  let jsonResponse;
  try {
    jsonResponse = await res.json();
  } catch {
    throw new Error(
      "The server returned an unreadable response. Please try again.",
    );
  }
  if (!res.ok) {
    throw { name: "servicesError", message: jsonResponse, status: res.status };
  }
  return jsonResponse;
}

export default class ExternalServices {
  constructor(baseURL = import.meta.env?.VITE_SERVER_URL) {
    this.baseURL = baseURL;
  }

  async request(path, options) {
    if (!this.baseURL) {
      throw new Error("VITE_SERVER_URL must be configured.");
    }
    const serverURL = this.baseURL.endsWith("/")
      ? this.baseURL
      : `${this.baseURL}/`;
    const response = await fetch(new URL(path, serverURL), options);
    return convertToJson(response);
  }

  async getData(category) {
    const data = await this.request(
      `products/search/${encodeURIComponent(category)}`,
    );
    return data.Result;
  }

  async findProductById(id) {
    const data = await this.request(`product/${encodeURIComponent(id)}`);
    return data.Result;
  }

  async checkout(payload) {
    return this.request("checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
