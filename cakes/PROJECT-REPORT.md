# PROJECT REPORT

## Bakerz Bite — Premium Bakery & Café Website

**Project type:** Front-end eProject (static website)
**Domain:** Bakery & Café
**Brand motto:** *"Where Smiles Are Served Daily."*

---

## Table of Contents

1. Cover page
2. Project title
3. Introduction
4. Problem definition
5. Problem statement
6. Project objectives
7. Scope of the project
8. Functional requirements
9. Non-functional requirements
10. Hardware requirements
11. Software requirements
12. Technology stack
13. System design
14. Website architecture
15. Navigation flowchart
16. Product browsing flowchart
17. Shopping cart flowchart
18. Data Flow Diagram (DFD)
19. User interface design specifications
20. File and folder structure
21. Source code overview
22. Data storage approach
23. Test cases and results
24. Known limitations
25. Installation instructions
26. Future enhancements
27. Conclusion

---

## 1–2. Cover page / Project title

**Title:** Bakerz Bite — Premium Bakery & Café Website
**Subtitle:** A responsive, front-end-only bakery and café eProject
**Built with:** HTML5, CSS3, Vanilla JavaScript, jQuery, Bootstrap 5
**Deliverables:** 22 HTML pages, custom CSS, catalog data, JavaScript logic,
assets, README and documentation.

---

## 3. Introduction

Bakerz Bite is a fictional premium bakery and café. This project builds its public
website as a set of static web pages. Visitors can explore ten product categories,
search and filter a catalog of 337 sample baked goods, view product details in
modals, add items to a front-end shopping cart that persists across refreshes,
browse offers and a photo gallery, read FAQs, submit feedback with star ratings,
and find contact details, a sitemap and a live date/time ticker.

The website is intentionally **front-end only**: there is no server, no database
and no payment system. All dynamic behaviour uses JavaScript and browser
`localStorage`, which keeps the project simple, portable and easy to host.

---

## 4. Problem definition

Small bakeries and cafés often lack an attractive, organised online presence.
Customers cannot easily see the full range of products, compare prices, discover
offers or share feedback. A clear, responsive catalogue website gives the brand a
professional identity and helps visitors find what they want quickly on any device.

---

## 5. Problem statement

Design and build a single, consistent bakery website that:
- presents the brand and its products professionally,
- lets visitors browse, search, filter and sort a large catalog,
- shows product details, ingredients and allergen information,
- provides offers, gallery, FAQ, feedback and contact sections, and
- works on desktop, tablet and mobile **without** a backend.

---

## 6. Project objectives

- Present the bakery's products professionally.
- Help visitors discover products through categories, search and filters.
- Display product descriptions, photographs, ingredients and allergens.
- Promote special offers and seasonal deals (clearly labelled as samples).
- Showcase bakery photography in a filterable gallery.
- Allow customers to submit feedback and ratings (stored locally).
- Provide bakery contact details and business information with placeholders.
- Deliver an attractive, responsive user experience.
- Demonstrate front-end web-development skills as a complete eProject.

---

## 7. Scope of the project

**In scope**
- 22 static HTML pages sharing a common header/footer.
- 337 sample products in 12 categories.
- Search, category filter, price filter, feature/best/availability filters, sorting,
  pagination (Load More).
- Product detail modal, gallery lightbox, cart with persistence, checkout summary
  modal, offers, feedback + ratings, FAQ accordion, contact form validation,
  sitemap, a floating chat assistant and a date/time/location ticker.
- Full documentation and test cases.

**Out of scope**
- User accounts, authentication, real payments, order fulfilment or delivery.
- A backend, database or server-side processing.
- Publishing reviews or analytics globally.

---

## 8. Functional requirements

| ID | Requirement |
|---|---|
| FR1 | Global header with announcement bar, logo, motto, navbar and cart button |
| FR2 | Rotating promotional announcements (dismissible) |
| FR3 | Sticky, responsive navigation with active-link highlighting |
| FR4 | Home page: hero, 12 category cards, 8 featured products, 3 offers, 8 gallery previews, CTA |
| FR5 | Full Menu page with search, filters, sorting, Load More, empty state; each product card also has a Buy Now button opening the order form + receipt |
| FR6 | Twelve category pages with the same catalog tools (pre-filtered), including Buy Now |
| FR7 | Product detail modal populated from the clicked card |
| FR8 | Add to cart, update quantity, remove item, clear cart, item count, subtotal & total |
| FR9 | Cart persists in `localStorage`; empty-cart state |
| FR10 | Checkout summary modal (demonstration) |
| FR11 | Offers page (6 offers) and home preview (3); "Buy Now" opens an order form popup that generates a printable sample receipt |
| FR12 | Gallery with category filters and image-enlargement modal |
| FR13 | Feedback form with star rating, validation, storage and average rating on the Feedback page |
| FR14 | FAQ accordion (10 items) on the separate FAQ page |
| FR15 | Contact page with details/placeholders, map, WhatsApp/email/call links and validated form |
| FR16 | Visual sitemap with grouped links |
| FR17 | Floating chat assistant (bottom-right) with canned keyword-matched replies, quick-reply chips, typing indicator and Escape-to-close |
| FR18 | Bottom ticker with live date, time, location toggle and announcements |
| FR19 | Toast notifications |
| FR20 | Background video every page: hero video on the home page and a video background behind the top banner of all other pages |

---

## 9. Non-functional requirements

- **Responsiveness:** mobile-first; works at ~320, 375, 768, 1024 and 1440 px.
- **Accessibility:** semantic HTML, labels, keyboard support, focus styles, ARIA,
  reduced-motion support, descriptive `alt` text.
- **Performance:** lazy-loaded images, pagination/Load More, lightweight JS.
- **Maintainability:** separated HTML/CSS/JS, single data file, commented code.
- **Compatibility:** modern Chrome, Edge, Firefox, Safari (standards-compliant).
- **Honesty:** all sample data labelled; no false claims of orders/payments/delivery.

---

## 10. Hardware requirements

- Any computer or mobile device capable of running a modern browser.
- Minimum ~200 MB free disk space for the project and browser.
- No special hardware. (Geolocation, if used, relies on the device's location service.)

---

## 11. Software requirements

- Windows / macOS / Linux.
- A modern web browser.
- Optional: VS Code + Live Server, Python, or Node.js for a local server.
- Internet connection for CDN assets (jQuery, Bootstrap, Bootstrap Icons, Google Fonts).

---

## 12. Technology stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 (custom design system) + Bootstrap 5.3.3 |
| Interactivity | Vanilla JavaScript (ES5-compatible) + jQuery 3.7.1 |
| Icons | Bootstrap Icons 1.11.3 |
| Fonts | Google Fonts — Playfair Display, Poppins |
| Data | JavaScript arrays (`js/products.js`) + `data/products.json` |
| Storage | Browser `localStorage` / `sessionStorage` |
| Images | Local JPG images in `assets/images/` |

No React/Vue/Angular/Tailwind, no PHP/Python/Java/Node runtime, no database.

---

## 13. System design

The system is a set of static HTML documents that share:
- one stylesheet (`css/style.css`),
- one data file (`js/products.js`),
- one behaviour file (`js/script.js`) that adapts to the current page using the
  `<body data-page="…">` attribute (and `data-category` on category pages).

The JavaScript exposes a small public object `window.BB` (cart, catalog filters,
storage helpers, modal opener) so behaviour is centralised and testable.

**Design tokens (warm "Light Cream Bakery" theme):** page background `#FBF4E8`,
secondary background `#F6EAD6`, panels/surface `#FFFFFF`, dark espresso "ink" for
headings/labels `#3A241A`, body text `#43301F`, muted text `#83705B`, golden accent
`#C8924A`, deep gold `#A9772F`, rose `#C77E68`, and dark espresso surfaces
(`--deep #2A1A12`) with light on-dark text `#FBF1E1` for the footer, ticker,
announcement bar and page banners.

---

## 14. Website architecture

```
Browser
  │
  ├── index.html ────────── Home (hero, categories, featured, offers, gallery, CTA)
  ├── menu.html ─────────── Full catalog (search/filter/sort/Load More)
  ├── <category>.html ×10 ─ Cakes, Pastries, Cookies, Pies, Desserts,
  │                         Cupcakes, Breads, Beverages, Seasonal, Merchandise
  ├── offers.html ───────── 6 offers
  ├── gallery.html ──────── 20 images + filters + lightbox
  ├── about.html ────────── Story, mission/vision, team, journey timeline
  ├── feedback.html ─────── Reviews + ratings (localStorage)
  ├── faq.html ──────────── 10-item FAQ accordion
  ├── contact.html ──────── Details, map, validated form
  ├── sitemap.html ──────── Grouped links
  └── cart.html ─────────── Cart, summary, checkout modal
         │
         ├── css/style.css        (presentation)
         ├── js/products.js       (data: BB_CATEGORIES, BB_PRODUCTS)
         ├── js/script.js         (logic: window.BB)
         └── assets/…             (logo, images, video)
```

---

## 15. Navigation flowchart

```
                 ┌───────────────┐
                 │    index      │
                 └───────┬───────┘
     ┌───────────┬───────┼────────┬───────────┬───────────┐
     ▼           ▼       ▼        ▼           ▼           ▼
  menu.html  category  offers  gallery     about      feedback / FAQ
             pages ×10                            / contact / sitemap
     │                                                     │
     ▼                                                     ▼
  Product Detail Modal                              Cart (cart.html)
                                                         │
                                                         ▼
                                                Checkout Summary Modal
```
Every page also links to the shared header (Home, **Categories dropdown**, Full Menu,
Offers, Gallery, About, **Feedback & FAQ dropdown**, Contact, Sitemap) and footer.

---

## 16. Product browsing flowchart

```
Start on Menu / Category page
        │
        ▼
Read filters: search, category, min/max price,
featured, best-seller, available
        │
        ▼
filterCatalog()  ──► no match? ──► show "No products" empty state (+ Clear)
        │ yes
        ▼
Sort results (featured / price / name / rating)
        │
        ▼
Render first N (menu = 12, category = all)
        │
        ├── More available? ──► "Load More" button ──► render next N
        ▼
Click a card ──► Product Detail Modal ──► Add to Cart
```

---

## 17. Shopping cart flowchart

```
Add to Cart (card or modal)
        │
        ▼
Product available? ── no ──► toast "Out of stock", stop
        │ yes
        ▼
Line exists? ── yes ──► qty = min(99, qty + n)
        │ no
        ▼
Push { id, qty }
        │
        ▼
Save to localStorage (bb_cart) ──► update badge & cart page
        │
        ├── Update qty (1–99) / remove line / Clear cart
        ▼
Checkout Summary Modal  ──► (demonstration only, no order placed)
```

---

## 18. Data Flow Diagram (DFD)

**Level 0 (context)**

```
   [ Visitor ] ── browse / search / filter ──►  [ Bakerz Bite Website ]
        ▲                                              │
        └──────── products, cart, reviews ◄────────────┘
```

**Level 1**

```
   Visitor ──filters──► [ Catalog Filter ] ──list──► [ Product Grid ]
      │                                                 │
      ├──add/update/remove──► [ Cart Module ] ──save──► ( localStorage: bb_cart )
      │                                                 │
      ├──submit rating ────► [ Feedback Module ] ─save─►( localStorage: bb_reviews )
      │                                                 │
       └──ask question ──────► [ Chat Assistant ] ──► canned reply (no storage)
                                     │
   Ticker: [Date/Time] + [Geolocation API] + [Announcements] ──► bottom bar
```

---

## 19. User interface design specifications

- **Typography:** Playfair Display for headings, Poppins for body.
- **Colour palette:** bright cream backgrounds, dark espresso-brown headings/body text,
  gold/caramel accents, rose and honey supporting tones, and a dark-espresso contrast block
  for the footer/ticker (see section 13).
- **Components:** rounded cards (`18px`), pill buttons, deep soft shadows, subtle
  borders, gradient accents.
- **Navigation:** light translucent blurred sticky navbar with the round bakery-badge logo
  and the bakery name beside it; the 10
  product categories live in a vertical **Categories dropdown** (Bootstrap), collapsing into
  the hamburger menu on smaller screens. Spacing auto-tightens between 1200-1399px so
  the brand is never squeezed and no horizontal overflow appears at any width.
- **Motion:** a branded **loading preloader** on every page, a **layered animated warm
  bokeh background** (softly blurred, glowing light circles in cream, champagne gold,
  peach, amber, dusty pink and muted brown that slowly float, drift, pulse and fade
  behind the content), reveal-on-scroll, a gold shimmer sweep on primary
  buttons, a sheen on the hero accent word, staggered card entrances and count-up
  hero stats — all disabled under `prefers-reduced-motion`.
- **Accessibility:** visible focus rings, ARIA roles on the star rating and modals,
  descriptive alt text, skip-to-content link.

---

## 20. File and folder structure

See **README.md § 7**. Summary: 22 HTML pages at the root, `css/style.css`,
`js/products.js` + `js/script.js`, `data/products.json`, and
`assets/logo/` + `assets/images/` (products, site, team, placeholder, credits).

---

## 21. Source code overview

| File | Responsibility |
|---|---|
| `js/products.js` | `window.BB_CATEGORIES` (12) and `window.BB_PRODUCTS` (337) |
| `js/script.js` | All logic; exposes `window.BB` (cart, `filterCatalog`, `openProductModal`, `storage`, `catalogState`) |
| `css/style.css` | Complete design system and responsive rules |
| 22 × `*.html` | Page structure; each sets `<body data-page="…">` |

**`window.BB` API (used by the site and automated tests):**
`BB.addToCart(id, qty)`, `BB.updateQty(id, qty)`, `BB.removeFromCart(id)`,
`BB.clearCart()`, `BB.cart`, `BB.cartTotals()`, `BB.filterCatalog()`,
`BB.catalogState`, `BB.openProductModal(id)`, `BB.storage.get/set`.

---

## 22. Data storage approach

- **Catalog:** plain JavaScript arrays (`js/products.js`). No database.
- **Cart / Reviews:** browser `localStorage` keys `bb_cart` and `bb_reviews`,
  plus a `sessionStorage` flag for announcement dismissal.
- **Chat assistant:** stateless - it keeps no history and stores nothing.
- All storage access is wrapped in `try/catch` so the site still works if storage
  is unavailable.
- Because storage is local, data is not shared between users or devices.

---

## 23. Test cases and results

See **`TEST-CASES.md`** for the full 34-case table. Automated verification was
performed with a Node.js + jsdom harness and static validators:

- **Page/ID validator** — 22 pages, 0 missing global IDs, 0 missing page IDs,
  0 duplicate IDs, 0 broken local links.
- **Image checker** — 227 distinct product images (real, name-matched Wikimedia
  photos), 0 missing; 0 missing HTML or script image references.
- **Page smoke test** — all expected counts matched (e.g. category cards 12,
  featured 8, offers 3/6, gallery 8/20, FAQ 10, sitemap 21, product options 338)
  with **no JavaScript runtime errors** on any page.
- **UX smoke test** — preloader present and auto-hidden on every page, animated
  background (4 blobs + 4 icons) on every page, Categories dropdown contains all 10
  categories, active nav highlight correct (toggle highlighted on category pages).
- **Cart smoke test** — add/merge/cap-at-99/out-of-stock-block, subtotal
  `PKR 19,400` for the scripted scenario, remove line, clear cart, badge updates:
  all correct.
- **Filter/sort checks** — category 50, search, price range, featured 30,
  best-seller 43, available 290, and price/name sort orders: all correct.
- **Forms** — feedback submit stored + average updated; invalid feedback/contact
  inputs produced the correct error messages.
- **Gallery / FAQ / Ticker** — filter to 3 items, lightbox caption, accordion
  toggle, ticker length > 50 with live date/time.
- **Video banners** — the home page has a hero background video and all 19 other
  pages have a background video behind their top banner (muted, looping, cover);
  a headless-Chrome probe confirmed each video advances its `currentTime` and
  plays (no console errors), the cream overlay keeps text readable, and no
  horizontal overflow appears at 360-1366px.

Tests requiring a real browser across viewports and browsers (responsive layout,
cross-browser rendering, geolocation permission UI) are listed as **manual / not
automated** in `TEST-CASES.md` and were not falsely marked as passed.

---

## 24. Known limitations

- Prices, dates, addresses and policies are **sample/placeholder** values.
- No backend: no real orders, payment, delivery or message sending.
- `localStorage` data is per-browser and per-device.
- The chat assistant is a simple keyword matcher with canned replies - it is not a
  real AI and has no natural-language understanding.
- Reviews submitted are local and not public.
- CDN assets (Bootstrap, jQuery, fonts, icons) require an internet connection.
- Obsolete browsers (e.g. Internet Explorer) are not supported by Bootstrap 5.

---

## 25. Installation instructions

See **README.md** sections 2–5. In short: open the folder in VS Code(optional),
serve it with Live Server / `python -m http.server` / `npx serve`, then open the
site in a browser. No build step or database is required.

---

## 26. Future enhancements

- Connect a backend (or headless CMS) for real orders, payments and delivery.
- User accounts and order history.
- Server-side reviews and a real visitor analytics dashboard.
- Multi-language support and currency switching.
- Product image galleries (multiple photos per product) and wishlists.
- Progressive Web App (PWA) support for offline browsing.

---

## 27. Conclusion

The Bakerz Bite website meets the objectives of the eProject: it delivers a
professional, responsive, well-structured bakery and café experience using only
HTML5, CSS3, JavaScript, jQuery and Bootstrap 5. It demonstrates a large catalog
with working search, filters, sorting, product modals, a persistent cart, offers
(with a Buy Now order popup that produces a printable demonstration receipt),
gallery, feedback, FAQ, contact, sitemap, a demo chat assistant and a live ticker —
all in clean, beginner-friendly code, with honest documentation of its
front-end-only limitations.
