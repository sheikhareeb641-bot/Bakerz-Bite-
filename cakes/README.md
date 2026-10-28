# Bakerz Bite — Premium Bakery & Café Website

> **Where Smiles Are Served Daily.**

A complete, responsive, front-end bakery & café website built with **HTML5, CSS3,
Vanilla JavaScript, jQuery and Bootstrap 5** — no backend required.

---

## 1. What this project is

Bakerz Bite is an eProject-style demonstration website for a fictional bakery and
café. It showcases a large product catalog, category browsing, search/filter/sort,
product detail pop-ups, a front-end shopping cart, offers, a gallery, customer
feedback with star ratings, an About page, Contact page, a Feedback page, a separate
FAQ page, a visual sitemap, a demo chat assistant and a bottom date/time/location ticker.

It is a **multi-page** website (22 HTML pages) that shares one header, footer and
set of scripts. It uses a bright, warm **"Light Cream Bakery"** theme (soft cream
backgrounds with dark espresso-brown headings and gold/caramel accents, plus a
contrasting dark-espresso footer block). Each page opens with a branded
**loading preloader**, the whole site runs over a layer-**animated warm bokeh background**
(softly blurred, glowing light circles in cream, champagne gold, peach, amber, dusty pink and
muted brown that slowly float, drift, pulse and fade), and
the header has a **Categories dropdown** listing all 10 product categories, plus a
**Feedback & FAQ dropdown** (Feedback → `feedback.html`, FAQ → `faq.html`).

---

## 2. Required software

You do **not** need Node.js, PHP, Python or a database to run the website.

| Tool | Purpose | Required? |
|---|---|---|
| A modern web browser (Chrome, Edge, Firefox, Safari) | View the site | Yes |
| VS Code (or any editor) | Edit the code | Optional |
| A local static server | Best experience (recommended) | Optional |

The site works by opening `index.html` directly, **but** a local server is
recommended so that everything (fonts, images, `fetch`-free JSON, browser camera /
geolocation permissions) behaves exactly as in production.

---

## 3. Opening the project in VS Code

1. Open VS Code.
2. `File → Open Folder…` and select the project folder (the folder containing
   `index.html`).
3. Explore the structure in section 7 below.

---

## 4. Running the website with a local development server

Pick any one of these:

**Option A — VS Code Live Server (easiest)**
1. Install the **Live Server** extension.
2. Right-click `index.html` → **Open with Live Server**.
3. The browser opens at something like `http://127.0.0.1:5500/`.

**Option B — Python (if installed)**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000/`.

**Option C — Node.js (if installed)**
```bash
npx serve .
```

> **Why a server?** Browsers restrict some features (such as loading local data
> files and some permission APIs) when pages are opened with a `file://` URL. A
> local server avoids those restrictions and mirrors real hosting.

---

## 5. Accessing the website

- Home: `index.html`
- Full Menu: `menu.html`
- Category pages: `cakes.html`, `pastries.html`, `cookies.html`, `pies.html`,
  `desserts.html`, `cupcakes.html`, `breads.html`, `beverages.html`,
  `seasonal.html`, `merchandise.html`
- Offers: `offers.html` • Gallery: `gallery.html` • About: `about.html`
- Feedback: `feedback.html` • FAQ: `faq.html` • Contact: `contact.html`
- Sitemap: `sitemap.html` • Cart: `cart.html`

---

## 6. Updating content

### 6.1 Product data
All catalog data lives in **`js/products.js`** and is also exported to
**`data/products.json`** (a reference copy).

- `window.BB_CATEGORIES` — the 12 categories (key, label, icon, blurb, count).
- `window.BB_PRODUCTS` — 337 product objects with fields:
  `id, name, category, cat, price, description, ingredients, allergens,
  available, featured, bestseller, dietary, rating, reviews, image`.

To add or edit a product, edit the `BB_PRODUCTS` array. Keep the `cat` value equal
to a category `key` (e.g. `cakes`) and the `image` path pointing to a real file.

### 6.2 Replacing images and the logo
- **Logo:** the circular **Bakerz Bite Bakery Badge** (`assets/logo/bakerz-bite-badge.png`,
  1254×1254 source, shipped web-optimised at 256×256) used in the navbar, footer and order
  receipt. The navbar shows the bakery name beside the badge; the footer uses the badge alone.
  `assets/logo/bakerz-bite-favicon.svg` is the browser-tab `theme-color` favicon. Swap the
  badge file to re-brand; a square/round mark keeps the navbar balanced.
- **Product photos:** `assets/images/products/<category>/<slug>.jpg` — real,
  name-matched photos harvested from Wikimedia Commons (e.g.
  `products/cakes/red-velvet-cake.jpg`). The full list is in
  `assets/images/manifest.json` and `assets/images/CREDITS-products.json`.
- **Site / interior photos:** `assets/images/site/01.jpg … 11.jpg`
- **Team photos:** `assets/images/team/01.jpg … 04.jpg`
- **Fallback image:** `assets/images/placeholder.svg` (used when an image fails).

Keep filenames the same to avoid editing code, or update the paths in
`js/products.js` and `js/script.js` accordingly.

### 6.3 Changing business / contact details
Business details are **placeholders** and appear in:
- the footer (every page — generated in `gen.js`, or edit each HTML file),
- `contact.html` (address, phone, email, hours, WhatsApp, map embed).

Replace `[Placeholder] …`, `hello@example.com`, `+92 000 0000000` and the WhatsApp
number `920000000000` with the bakery's real details. Update the OpenStreetMap
embed URL in `contact.html` with the real location.

### 6.4 Configuring offers
Offers are editable **JavaScript data** in `js/script.js` (the `OFFERS` array):
id, sample price, title, image, description, terms, sample validity dates and
discount label. The first three offers are shown on the home page.

### 6.5 Buy Now (order form + receipt)
Both the **offers** and the **catalog** cards (Full Menu and category pages) show a
"Buy Now" button next to "Add to Cart". "Buy Now" opens an on-page order form
popup (name, phone, email, address, quantity, Cash on Delivery) prefilled with the
selected offer or product; submitting valid details shows a printable sample
receipt. This is a front-end demonstration only — no order is placed or sent.
Offers use their `id`/`price`; catalog products use their catalog `price` from
`data/products.json`.

### 6.6 Gallery, reviews and FAQ data
Also in `js/script.js`:
- `GALLERY` — gallery items (image, caption, filter tags).
- `FAQ` — the 10 FAQ questions/answers.
- `SEED_REVIEWS` — the four demonstration testimonials.

### 6.7 Video content
- **Home hero video:** `assets/video/hero.mp4` (a real, royalty-free clip) plays
  muted and looping behind the home hero, with `assets/video/hero-poster.jpg` as
  its poster.
- **Video banner (every other page):** each of the other 19 pages uses the same
  clip as a **background video behind its top page-banner** (`<video
  class="banner-video">`, muted, looping, `object-fit: cover`), with a soft cream
  `banner-overlay` so the heading text stays readable. The per-page banner image
  is kept as the `poster` and as the fallback background.
- Under **`prefers-reduced-motion`** the moving video is hidden and the static
  per-page banner image is shown instead.
- To use your own clip, replace `assets/video/hero.mp4` (keep the filename) and
  optionally `hero-poster.jpg`. Keep H.264/MP4 for the widest browser support.

---

## 7. File and folder structure

```
cakes/
├── index.html … sitemap.html        # 22 HTML pages
├── css/
│   └── style.css                    # full custom design system
├── js/
│   ├── products.js                  # 337-product catalog data
│   └── script.js                    # all page logic + window.BB public API
├── data/
│   └── products.json                # catalog reference copy
├── assets/
│   ├── logo/bakerz-bite-badge.png       # brand badge (navbar + footer + receipt)
│   ├── logo/bakerz-bite-logo.svg        # legacy wordmark (unused, kept for reference)
│   ├── logo/bakerz-bite-favicon.svg     # browser tab favicon
│   └── images/
│       ├── placeholder.svg
│       ├── CREDITS.json / CREDITS.md
│       ├── products/<category>/*.jpg
│       ├── site/*.jpg
│       └── team/*.jpg
├── README.md
├── PROJECT-REPORT.md
└── TEST-CASES.md
```

---

## 8. How localStorage is used

The site is front-end only. It stores small demonstration data **in your browser**:

| Key | Contents |
|---|---|
| `bb_cart` | Cart line items `[{ id, qty }]` |
| `bb_reviews` | Reviews you submit on the Feedback page |

> These values are **browser- and device-specific**. They do not reach the bakery
> and are not public reviews. Clearing browser data resets them.

---

## 9. Which features need external services

Everything below works as a front-end demonstration and needs an external service
to become "real":

- **Placing/serving orders, payment, delivery** — needs a backend / order service.
- **Sending the contact form** — needs a form/email service.
- **A real chat / AI assistant** — needs an NLP backend or an LLM API; the built-in
  bot only matches keywords against canned replies.
- **Publishing reviews publicly** — needs a backend database.
- **Accurate geolocation** — depends on the browser permission and the device.

No message, order or payment is actually sent or processed anywhere.

---

## 10. Image credits

Bundled photos are real photographs sourced from Wikipedia / Wikimedia and are
attributed in **`assets/images/CREDITS.md`** (and `CREDITS.json`). The hero /
feature video (`assets/video/hero.mp4`) is a royalty-free stock clip used as a
demonstration placeholder. Review each source page before commercial use and
replace them with your own photography / footage for production.

---

## 11. Recording a demonstration video (suggested)

1. Open the site via a local server and start screen recording.
2. On the home page, show the hero and its background video, category cards,
   featured products and offers.
3. Use the Full Menu: demo **search**, **category filter**, **price range**,
   **sorting**, **Featured/Best/Available** toggles and **Clear All Filters**.
4. Open a **product detail pop-up**; change quantity; **Add to Cart**. Then click
   a card's **Buy Now** to open the order form and generate a sample receipt.
5. Go to the **Cart**: change quantities, remove a line, open the **Checkout
   Summary**, then **Clear Cart**.
6. Show **Offers**, the **Gallery** (filter + image modal), **About**, the
   **Feedback** page (submit a rating/review, show the average update) and the
   **FAQ** page (accordion).
7. Show **Contact** validation and the **Sitemap**.
8. Open the **chat assistant** (bottom-right) and the bottom **date/time/location ticker**.
9. Resize the window to demonstrate the **responsive** layout.

---

## 12. Optional hosting

Because it is fully static, it can be hosted for free on GitHub Pages, Netlify or
Vercel by uploading the whole folder. No server or database is required.

---

## 13. Honest limitations

- Prices, dates, addresses, phone numbers and policies are **sample/placeholder**
  values for a demonstration eProject.
- Data stored in `localStorage` is local to one browser.
- The chat assistant is a simple keyword matcher with canned replies, not a real AI.
- The contact form and checkout are demonstrations and do not transmit data.
- Full compatibility with obsolete browsers (e.g. Internet Explorer) is **not**
  promised, because Bootstrap 5 itself does not support them.
