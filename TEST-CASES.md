# TEST CASES — Bakerz Bite Bakery & Café Website

This document lists the test cases for the Bakerz Bite website, with test ID,
description, steps, expected result, actual result and status.

> **Honesty note:** A test is marked **Pass** only when it was actually performed.
> Automated tests were run with **Node.js v24 + jsdom** against the files served
> over a local HTTP server, plus two static validators (page/ID/link validator and
> an image-reference checker). Tests that require a **real browser across multiple
> viewports/devices or different browser engines** are explicitly marked
> **Not performed (manual)** and were **not** marked as passed.

## Test environment

| Item | Value |
|---|---|
| Method | Automated (Node.js + jsdom, HTTP-served) and static validators |
| Server | Local static HTTP server |
| Assets | CDN enabled (jQuery, Bootstrap 5.3.3, Bootstrap Icons, Google Fonts) |
| Date | 2026 |

## Summary

| Result | Count |
|---|---|
| Pass (automated) | 30 |
| Not performed (manual / real browser) | 4 |
| Fail | 0 |
| **Total** | **34** |

---

| ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC01 | Navigation links | Load all 22 pages; check every local `href`/`src`; click nav links | Every internal link resolves to an existing page/file; no broken links | Validator: 22 pages, **0 broken local links** | Pass |
| TC02 | Responsive navbar | Resize to <1200px and open the hamburger; tap a link | Menu collapses/expands; menu closes after selecting an item | Verified by code inspection (Bootstrap collapse + auto-hide handler present); not rendered in a real browser | Not performed (manual) |
| TC03 | Active menu styling | Open each page; inspect the active nav link | Exactly one `.nav-link.active` matches the current page | Smoke: `navActive = 1` on every page (Home active on index, category link on category pages, etc.) | Pass |
| TC04 | Product category navigation | Open each category page | Correct category is pre-filtered and all its items shown | Cakes page = 50 cards; Merchandise page = 20 cards; Home shows 12 category cards linking to the pages | Pass |
| TC05 | Product search | Enter "chocolate" in the search box | Grid updates to matching products only; count updates | Menu/category: 7 matches; count text updates correctly | Pass |
| TC06 | Category filters | On Full Menu, choose a category | Grid shows only that category | Category filter has 11 options (All + 10); selecting a category filters the grid correctly | Pass |
| TC07 | Price filtering | Set Min 100 / Max 500 | Grid shows only products in range | 86 matching products returned | Pass |
| TC08 | Product sorting | Choose price low→high, high→low, A–Z | First/last items ordered correctly | `sortAsc`, `sortDesc`, `sortNameAsc` all `true` | Pass |
| TC09 | Product details modal | Click a card / "View Details" for id 1001 | Modal opens with that product's name, price, ingredients, allergens | Modal opened: name "Chocolate Fudge Cake", price "PKR 3,400", ingredients & allergens populated | Pass |
| TC10 | Shopping cart operations | addToCart(1001,2), addToCart(1002,1), updateQty(1001,5); remove a line; clear | 2 lines, subtotal PKR 19,400, 6 items, badge 6; remove → 1 line; clear → empty | Subtotal "PKR 19,400", items "6", badge "6"; after remove 1 line; after clear empty + badge 0 | Pass |
| TC11 | Cart persistence | Add items; read `bb_cart` from localStorage | Cart saved and reloadable | `bb_cart` length = 1 after adding; `BB.storage.get("bb_cart")` returns the line | Pass |
| TC12 | Feedback form validation | Submit with empty name/product/rating and short text; then submit valid | Errors appear on invalid fields; valid submit is stored and average updates | 3 errors on invalid submit; valid submit stored (cards 4→5, "5 reviews") | Pass |
| TC13 | Star ratings | Click stars; submit | Selected rating is captured and used | Clicking stars sets `#fbRating`; submit records the chosen value | Pass |
| TC14 | Gallery filters & image modal | Click "Pastries"; click an image | Only pastries shown; lightbox opens with caption | All = 20, Pastries = 3; one active filter button; modal caption populated | Pass |
| TC15 | Offers navigation | Open Offers page and home preview | 6 offers on page, 3 previewed; buttons lead to products | `#offersGrid` = 6, `#offersPreview` = 3, "View Products" links to `menu.html` | Pass |
| TC16 | Contact form validation | Submit with empty name, bad email, short message | Error messages shown on invalid fields | All four error messages displayed (`ctName`, `ctEmail`, `ctSubject`, `ctMessage`) | Pass |
| TC17 | FAQ accordion | Open the FAQ page (`faq.html`); click the 2nd question | 10 items; clicked item expands; previous closes | 10 items on the separate FAQ page; 2nd expands (`aria-expanded=true`) and the parent collapses others | Pass |
| TC18 | Sitemap links | Open Sitemap | Grouped links, all resolve | 19 sitemap links; validator confirms all resolve | Pass |
| TC19 | Chat assistant | Click the floating chat button; click a quick-reply chip; type a question; press Escape | Panel opens with a greeting; keyword-matched canned reply appears; Escape closes it | Panel opens, greeting + system notice shown, 6 chips; "offers" chip and typed "nut free cookies" return the correct canned replies, unknown input returns fallback; Escape closes; no console errors | Pass |
| TC20 | Date and time ticker | Load any page; observe the bottom bar | Ticker shows live date & time and updates without refresh | Ticker content length 1452; date/time spans present and updating (`09:11:14 PM`) | Pass |
| TC21 | Geolocation permission handling | Click the location button; deny permission | Shows a fallback when denied/unsupported | Default shows "Location unavailable"; request handled with success/denied/unsupported branches. Real permission dialog not exercised (browser-only) | Not performed (partial, manual) |
| TC22 | Browser compatibility | Open in Chrome, Edge, Firefox, Safari | Renders and functions in all four | Not performed (requires real browsers; standards-compliant code used) | Not performed (manual) |
| TC23 | Responsive layout | Test at 320/375/768/1024/1440 px | No overflow, no overlap, usable at all sizes | Not performed (requires real browser viewports); responsive CSS + Bootstrap grid implemented | Not performed (manual) |
| TC24 | Missing image handling | Force a broken image with a `data-fallback` | Broken image replaced by the placeholder | Broken image `src` replaced with `assets/images/placeholder.svg` | Pass |
| TC25 | Empty search & empty cart states | Search "zzzzqqq"; open cart with no items | Empty states shown; Clear restores grid | Empty search: 0 cards + "No products match your filters"; Clear → 12 cards. Empty cart: `cartPageEmpty` shown | Pass |
| TC26 | Page loading preloader | Load any page; watch before content appears | A branded loading animation shows, then fades out automatically | Preloader present on all 22 pages and auto-hidden after `load` (min ~0.75s, safety 5s); verified in UX smoke test | Pass |
| TC27 | Animated warm bokeh background | Load any page; observe the background | A warm, softly blurred background animates behind the content without hurting readability | 26 blurred glowing light circles (cream, champagne gold, peach, amber, dusty pink, muted brown) on desktop / 14 on mobile, generated by `initBokeh()`; each slowly floats (`bbOrbFloat`), pulses/fades (`bbOrbPulse`) and drifts; warm gradient base + soft-light depth overlay; fixed full-viewport layer (z-index 0) behind content (z-index 1); frozen under `prefers-reduced-motion` | Pass |
| TC28 | Categories dropdown menu | Click "Categories" in the navbar; open a category | A vertical drop-down lists all 12 categories and opens the chosen page | 12 dropdown items present on every page; toggle highlighted on category pages; `navActive` stays 1 | Pass |
| TC29 | Offer order popup + receipt | On the Offers page click "Buy Now" on any offer | A popup form opens on the same page; after valid details are entered a sample receipt is shown with a Print button | 6 Buy Now buttons; click sets offer id + banner + live total (`PKR 3,600`); qty + updates total (`PKR 7,200`); submit shows receipt with order no `BB-######-####`, name, total and "Cash on Delivery"; invalid/incomplete submit is blocked with field errors. Demo-only (no real order/payment) | Pass |
| TC30 | Product Buy Now (Full Menu) | On the Full Menu click "Buy Now" on a product card (keep Add to Cart) | Same order form popup opens prefilled with the product; receipt shows that product | 12 product cards each with View Details + **Buy Now** + Add to Cart; click sets product id + name + category badge + live total (e.g. `PKR 2,150`); submit shows receipt with that product name, customer name and total. Works on menu + all category pages (shared card). Demo-only | Pass |
| TC31 | Navbar fit (single line, no crushed logo) | Load any page; resize the window across 320-1920px, especially 1200-1399px | Badge logo stays crisp and undistorted; bakery name stays readable beside it; all 9 nav items stay on **one line** at 1200px+; no horizontal scrollbar | Badge logo stays square (1:1, 256×256 web version) at every width; expanded nav uses `flex-wrap: nowrap` with `white-space: nowrap` links and is tightened (logo 42px at ≥1400, 36px at 1200-1399; smaller link padding and brand-name font) so all 9 items fit on one row; headless-Chrome layout probe shows `rowCount=1`, uniform item heights, and `bodyOverflowX` false at 1200/1201/1205/1210/1250/1280/1300/1366/1399/1400/1440/1600/1920 | Pass |
| TC32 | Motion polish | Observe hero, buttons and product/offer/gallery grids | Subtle premium motion without hurting readability | Gold shimmer sweep on primary buttons, animated sheen on the hero accent word, staggered card entrance (`bbCardIn`) for product/offer/gallery grids, and count-up hero stats (337/12/100%). All disabled under `prefers-reduced-motion`. Verified in headless Chrome (`featAnim=bbCardIn`, `heroGoldAnim=bbSheen`) | Pass |
| TC33 | Feedback & FAQ dropdown + separate pages | Click the "Feedback & FAQ" navbar dropdown; open each item | Dropdown lists "Feedback" (`feedback.html`) and "FAQ" (`faq.html`); each opens its own page; toggle highlighted on both pages | Dropdown has both items on every page; `feedback.html` = form + reviews (no FAQ); `faq.html` = 10-item accordion (no form); toggle gets `.bb-cat-active` and exactly one item is `.active` on each page; nav fits 1200–1920px with no overflow (headless-Chrome probe) | Pass |
| TC34 | Background video on every page | Open the home page and any other page; observe the top hero/banner | Home shows the hero video; every other page shows a video background behind its top banner; text stays readable | Home = hero video (`1280x720`, plays). All other 19 pages = `<video class="banner-video">` behind the page-banner + a cream `.banner-overlay` + content at `z-index:2`. Headless-Chrome probe: every page's video plays (`currentTime` advances, `paused=false`, `readyState=4`, no errors), `object-fit:cover`; no horizontal overflow at 360/390/768/1024/1366px; under `prefers-reduced-motion` the video is hidden and the per-page banner image (correct document-relative path) is shown | Pass |

---

## Static validation results

| Check | Result |
|---|---|
| Pages found | 22 |
| Missing global IDs | 0 |
| Missing page-required IDs | 0 |
| Pages without `data-page` | 0 |
| Duplicate IDs | 0 |
| Broken local links | 0 |
| Distinct product image paths | 227 |
| Missing product images | 0 |
| Missing HTML image refs | 0 |
| Missing script image refs | 0 |
| JS runtime errors (all pages) | 0 |

---

## Final testing checklist

- [x] All internal navigation links resolve
- [x] One active nav link on every page
- [x] Category pages pre-filter correctly (cakes 50, merchandise 20)
- [x] Search, category, price, feature/best/availability filters work together
- [x] Sorting (price asc/desc, name A–Z) works
- [x] Product detail modal populates from the clicked card
- [x] Cart add / merge / update / cap-at-99 / remove / clear
- [x] Cart persists in `localStorage`
- [x] Out-of-stock items cannot be added
- [x] Feedback validation, star rating, storage and average
- [x] Contact validation messages
- [x] Gallery filters + lightbox
- [x] FAQ accordion (separate FAQ page)
- [x] Feedback form + reviews (separate Feedback page)
- [x] Offers (6) + home preview (3)
- [x] Sitemap links (19)
- [x] Chat assistant opens, replies with canned answers and closes on Escape
- [x] Date/time/location ticker present and updating
- [x] Missing-image fallback works
- [x] Empty search and empty cart states
- [x] Branded loading preloader on every page (present + auto-hidden)
- [x] Animated warm bokeh background present on every page
- [x] Categories dropdown lists all 12 categories
- [x] Feedback & FAQ listed in a navbar dropdown linking to feedback.html and faq.html
- [x] Navbar stays on a single line at 1200px and wider (all 9 items)
- [x] Background video on every page (hero on home, video banner elsewhere; static fallback under reduced motion)
- [ ] **Manual:** cross-browser and multi-viewport responsive checks (TC02, TC21, TC22, TC23)

> The unchecked item(s) require a real browser/device and were intentionally left
> for manual verification rather than being reported as passed.
