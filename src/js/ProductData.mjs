const baseURL = import.meta.env.VITE_SERVER_URL;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

async function getCategory(category) {
   const response = await fetch(`/json/${encodeURIComponent(category)}.json`);
  const data = await convertToJson(response);
  // some files are { Result: [...] }, others are a plain array
  return Array.isArray(data) ? data : data.Result;
}

export default class ProductData {
  async getData(category) {
    return getCategory(category);
  }

  async findProductById(id) {
    const categories = ["tents", "sleeping-bags", "backpacks", "hammocks"];
    for (const category of categories) {
      try {
        const list = await getCategory(category);
        const found = list.find((p) => p.Id === id);
        if (found) return found;
      } catch (err) {
        console.error(err); // skip a missing file and keep looking
      }
    }
    return undefined;
  }
}
