// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  const data = JSON.parse(localStorage.getItem(key));
  return key === "so-cart" && !Array.isArray(data) ? [] : data;
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  if (key === "so-cart") updateCartCount();
}

function updateCartCount() {
  const badge = document.querySelector(".cart-count");
  if (!badge) return;

  const count = (getLocalStorage("so-cart") || []).length;
  badge.textContent = count;
  badge.hidden = count === 0;
  badge
    .closest("a")
    .setAttribute(
      "aria-label",
      `View shopping cart, ${count} ${count === 1 ? "item" : "items"}`,
    );
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

// get the product id from the query string
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get(param);
  return product;
}

export function renderListWithTemplate(
  template,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  const htmlStrings = list.map(template);
  // if clear is true we need to clear out the contents of the parent.
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load template: ${path}`);
  }
  return response.text();
}

export async function loadHeaderFooter() {
  await Promise.all(
    ["header", "footer"].map(async (section) => {
      const element = document.querySelector(`#main-${section}`);
      try {
        const template = await loadTemplate(`/partials/${section}.html`);
        renderWithTemplate(template, element);
        if (section === "header") updateCartCount();
      } catch {
        element.textContent = `Unable to load the ${section}. Please refresh the page.`;
      }
    }),
  );
}
