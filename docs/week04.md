# Week 04 checkout checklist

Implementation branch: `pc--individual4`.

Assignment references:

- [Team activity: Checkout](https://byui-cse.github.io/wdd330-ww-course/week04/team.html)
- [Individual activity: Error Checking and Validation](https://byui-cse.github.io/wdd330-ww-course/week04/individual.html)
- Extra Trello activity: animate the backpack icon when an item is added.

## Team activity coverage

- Cart subtotal updates when an item is removed; nonempty carts have a checkout link.
- Checkout collects `fname`, `lname`, `street`, `city`, `state`, `zip`, `cardNumber`, `expiration`, and `code`. Shipping and billing use the same address.
- All fields are required. Empty carts cannot submit an order.
- `CheckoutProcess.mjs` displays the item count and subtotal on load, then tax, shipping, and total after a valid ZIP is entered.
- Tax is 6% of the subtotal. Shipping is $10 for the first unit and $2 for each additional unit. Calculations use integer cents before formatting dollars.
- `ProductData.mjs` was renamed to `ExternalServices.mjs`; product listing and detail use the renamed class.
- `packageItems` maps every cart entry to `{ id, name, price, quantity: 1 }`. Repeated entries remain separate units, preserving the existing cart model.
- Orders include the required form keys, ISO `orderDate`, `items`, `orderTotal`, `shipping`, and `tax`, and are sent as JSON in a POST to the configured API's `/checkout` endpoint.
- A pending state prevents duplicate submissions.

## Individual activity and stretch coverage

- API responses are parsed before checking `ok`; service errors preserve the full response body in `message` with `name: "servicesError"`.
- `CheckoutProcess.checkout` catches errors and displays server messages without discarding the cart or form values.
- Native form submission handles required fields and patterns, including Enter-key submission. Expiration also checks the current month/year.
- Card numbers accept spaces and are normalized before sending. ZIP and security-code fields preserve leading zeros. The course test card is accepted by client validation.
- Successful orders clear `so-cart`, reset the form, and navigate to `checkout/success.html`.
- The success page includes the shared header/footer and has a Vite build entry.
- `alertMessage(message, scroll = true)` inserts a compact orange, dismissible message at the top of `main`, announces it accessibly, and optionally scrolls to the top. Message content uses `textContent`.
- Product details confirm successful additions without scrolling. Card details are never saved to local storage.

## Extra activity: backpack animation

- A successful cart save triggers `scale(1.15)` and returns to normal: 125 ms out and 125 ms back.
- CSS transitions retarget smoothly when additions happen rapidly. Removing items, page loading, and clearing the cart do not trigger the pulse.
- Reduced-motion preferences use a brief opacity change instead of scaling. The count badge and text confirmation still update.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. Tests use Node's built-in test runner and require Node 20 or newer; no additional test dependency is needed. Lint includes `.mjs` files.

The automated tests cover empty/single/multiple/repeated-item totals, rounding, item packaging, expiration boundaries, server-message extraction, JSON POSTs, detailed API errors, product endpoint compatibility, and network/non-JSON failures.

Browser verification covers Chromium and WebKit, including:

- Live product listing/detail, selected-color preservation, count updates, repeated additions, scale settling, and reduced motion.
- Cart removal, subtotal changes, ZIP-triggered estimates, missing/whitespace input, and expired-card validation.
- Live rejection with an incorrect test card, followed by a successful course test order using Enter to submit.
- Success navigation, cleared cart/count badge, empty-cart and direct-empty-checkout views.
- Simulated network failure, multiple dismissible server errors, retained inputs/cart, and duplicate-submit protection.
- Layout overflow checks at 320, 390, 768, and 1100 pixels; no uncaught JavaScript errors.

For a manual course test, use card `1234123412341234`, security code `123`, and a future expiration in `MM/YY` format. A different 16-digit card exercises server rejection. Use test data only.

## Course workflow still requiring coordination

- The requested branch remains `pc--individual4`; the team instructions normally use a separate `initials--team4` branch.
- Coordinate team participation and the branch the team will retain.
- Compare with the instructor solutions only after the assignment's one-hour work period, and prepare the Canvas reflection.
- Review the changes, then commit/push and create the appropriate pull request. Merge after team review.
- Update the three Trello cards and complete the Canvas submissions.

This change does not update Trello, submit Canvas work, or merge a branch.
