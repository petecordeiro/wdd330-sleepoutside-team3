// Step 6: this module used to be ProductData. It now talks to the server for
// products AND for checkout, so the name ExternalServices describes it better.
const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

// builds the full server URL for a path, e.g. "checkout" -> "https://.../checkout"
function serverURL(path) {
  if (!baseURL) {
    throw new Error("VITE_SERVER_URL must be configured.");
  }
  const base = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
  return new URL(path, base);
}

async function getResult(path) {
  const response = await fetch(serverURL(path));
  const data = await convertToJson(response);
  return data.Result;
}

export default class ExternalServices {
  async getData(category) {
    return getResult(`products/search/${encodeURIComponent(category)}`);
  }

  async findProductById(id) {
    return getResult(`product/${encodeURIComponent(id)}`);
  }

  // Step 7: send the order to the server.
  // Sending data needs a POST request, so fetch gets a second argument with the options.
  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // the server only understands text, so the object is turned into a JSON string
      body: JSON.stringify(payload),
    };
    const response = await fetch(serverURL("checkout"), options);
    return convertToJson(response);
  }
}
