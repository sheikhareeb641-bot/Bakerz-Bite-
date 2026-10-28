/* ============================================================
   Bakerz Bite - front-end logic (Vanilla JS + jQuery)
   ------------------------------------------------------------
   Works across all pages using <body data-page="...">.
   Exposes a small public API on window.BB for cart, catalog
   filtering, storage helpers and the product modal.
    No backend: cart and reviews use
    localStorage and are demonstrations only.
   ============================================================ */
(function () {
  "use strict";

  var PRODUCTS = window.BB_PRODUCTS || [];
  var CATEGORIES = window.BB_CATEGORIES || [];
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  /* ----------------------------- helpers ----------------------------- */
  function $(sel) { return window.jQuery ? window.jQuery(sel) : null; }
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmt(n) { return "PKR " + Number(n || 0).toLocaleString("en-US"); }
  function starStr(r) {
    var n = Math.max(0, Math.min(5, Math.round(r || 0)));
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }
  function page() { return (document.body && document.body.getAttribute("data-page")) || ""; }
  function pageKey() {
    var c = (document.body && document.body.getAttribute("data-category")) || "";
    return c;
  }

  /* ----------------------------- storage ----------------------------- */
  var storage = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    },
    remove: function (key) {
      try { window.localStorage.removeItem(key); } catch (e) {}
    }
  };

  /* ----------------------------- toast ----------------------------- */
  function toast(message, type) {
    var container = el("toastContainer");
    if (!container) return;
    var icon = type === "warn" ? "bi-exclamation-circle" : (type === "error" ? "bi-x-octagon" : "bi-check-circle");
    var wrap = document.createElement("div");
    wrap.className = "toast bb-toast align-items-center border-0";
    wrap.setAttribute("role", "alert");
    wrap.setAttribute("aria-live", "assertive");
    wrap.setAttribute("aria-atomic", "true");
    wrap.innerHTML = '<div class="d-flex"><div class="toast-body"><i class="bi ' + icon + '"></i> ' +
      esc(message) + '</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    container.appendChild(wrap);
    if (window.bootstrap && window.bootstrap.Toast) {
      var t = new window.bootstrap.Toast(wrap, { delay: 2600 });
      t.show();
      wrap.addEventListener("hidden.bs.toast", function () { wrap.remove(); });
    } else {
      setTimeout(function () { wrap.remove(); }, 2600);
    }
  }

  /* ============================================================
     CART
     ============================================================ */
  var cart = storage.get("bb_cart", []);
  if (!Array.isArray(cart)) cart = [];
  cart = cart.filter(function (l) { return l && byId[l.id]; });

  function persistCart() { storage.set("bb_cart", cart); }

  function cartTotals() {
    var subtotal = 0, items = 0;
    cart.forEach(function (l) {
      var p = byId[l.id];
      if (p) { subtotal += p.price * l.qty; items += l.qty; }
    });
    return { subtotal: subtotal, items: items, total: subtotal };
  }

  function updateCartBadge() {
    var badge = el("cartCountBadge");
    if (badge) badge.textContent = String(cartTotals().items);
  }

  function afterCartChange() {
    updateCartBadge();
    if (el("cartPageItems")) renderCartPage();
  }

  function addToCart(id, qty) {
    id = Number(id);
    qty = parseInt(qty, 10);
    if (!qty || qty < 1) qty = 1;
    var p = byId[id];
    if (!p) { toast("Product not found.", "error"); return; }
    if (!p.available) { toast(p.name + " is currently out of stock.", "warn"); return; }
    var line = null;
    for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { line = cart[i]; break; } }
    if (line) line.qty = Math.min(99, line.qty + qty);
    else cart.push({ id: id, qty: Math.min(99, qty) });
    persistCart();
    afterCartChange();
    toast(p.name + " added to cart.", "ok");
  }

  function updateQty(id, qty) {
    id = Number(id);
    qty = parseInt(qty, 10);
    if (isNaN(qty)) return;
    if (qty <= 0) { removeFromCart(id); return; }
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { cart[i].qty = Math.min(99, qty); }
    }
    persistCart();
    afterCartChange();
  }

  function removeFromCart(id) {
    id = Number(id);
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) { cart.splice(i, 1); break; }
    }
    persistCart();
    afterCartChange();
    toast("Item removed from cart.", "warn");
  }

  function clearCart() {
    cart.length = 0;
    persistCart();
    afterCartChange();
    toast("Cart cleared.", "warn");
  }

  /* ----------------------------- product card ----------------------------- */
  function productCardHTML(p) {
    var badges = "";
    if (p.featured) badges += '<span class="product-badge badge-featured">Featured</span>';
    if (p.bestseller) badges += '<span class="product-badge badge-bestseller" style="left:auto;right:12px;">Best Seller</span>';
    if (!p.available) badges += '<span class="product-badge badge-oos">Out of Stock</span>';
    return '' +
      '<div class="col-sm-6 col-lg-4">' +
      '<article class="product-card bb-card' + (p.available ? "" : " is-oos") + '" data-id="' + p.id + '">' +
      '<div class="product-media">' +
      '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" data-fallback="assets/images/placeholder.svg" />' +
      badges +
      '</div>' +
      '<div class="product-body">' +
      '<p class="product-cat">' + esc(p.category) + '</p>' +
      '<h3 class="product-name">' + esc(p.name) + '</h3>' +
      '<div class="product-rating"><span class="stars">' + starStr(p.rating) + '</span> ' + p.rating + ' <span>(' + p.reviews + ')</span></div>' +
      '<p class="product-desc">' + esc(p.description) + '</p>' +
      '<div class="product-foot">' +
      '<span class="product-price">' + fmt(p.price) + '</span>' +
      '<div class="product-actions">' +
      '<button type="button" class="btn bb-btn-outline product-details" data-id="' + p.id + '">View Details</button>' +
      '<button type="button" class="btn bb-btn-outline product-buy" data-id="' + p.id + '"' + (p.available ? "" : " disabled") + '><i class="bi bi-bag-check" aria-hidden="true"></i> Buy Now</button>' +
      '<button type="button" class="btn bb-btn-primary product-add" data-id="' + p.id + '"' + (p.available ? "" : " disabled") + '>Add to Cart</button>' +
      '</div></div></div></article></div>';
  }

  /* ============================================================
     CATALOG (menu + category pages)
     ============================================================ */
  var catalogState = {
    category: "all", search: "", min: null, max: null,
    featured: false, best: false, available: false, sort: "featured", shown: 0
  };

  function pageSize() { return page() === "menu" ? 12 : 100; }

  function filterCatalog() {
    var q = (catalogState.search || "").trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (catalogState.category !== "all" && p.cat !== catalogState.category) return false;
      if (q && (p.name + " " + p.description + " " + p.category).toLowerCase().indexOf(q) === -1) return false;
      if (catalogState.min != null && p.price < catalogState.min) return false;
      if (catalogState.max != null && p.price > catalogState.max) return false;
      if (catalogState.featured && !p.featured) return false;
      if (catalogState.best && !p.bestseller) return false;
      if (catalogState.available && !p.available) return false;
      return true;
    });

    var sort = catalogState.sort;
    list.sort(function (a, b) {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "rating-desc": return b.rating - a.rating || b.reviews - a.reviews;
        default:
          return (b.featured - a.featured) || (b.bestseller - a.bestseller) || (b.rating - a.rating);
      }
    });
    return list;
  }

  function renderCatalog() {
    var grid = el("catalogGrid");
    if (!grid) return;
    var list = filterCatalog();
    var size = pageSize();
    if (!catalogState.shown) catalogState.shown = size;
    var slice = list.slice(0, catalogState.shown);

    grid.innerHTML = slice.map(productCardHTML).join("");

    var count = el("catalogCount");
    if (count) {
      count.textContent = list.length
        ? "Showing " + slice.length + " of " + list.length + " products"
        : "No products match your filters";
    }
    var empty = el("catalogEmpty");
    if (empty) empty.classList.toggle("d-none", list.length > 0);
    var moreWrap = el("loadMoreWrap");
    if (moreWrap) moreWrap.classList.toggle("d-none", slice.length >= list.length);
  }

  function refreshCatalog() {
    catalogState.shown = pageSize();
    renderCatalog();
  }

  function populateCategoryFilter() {
    var sel = el("filterCategory");
    if (!sel) return;
    var html = '<option value="all">All Categories</option>';
    CATEGORIES.forEach(function (c) {
      html += '<option value="' + esc(c.key) + '">' + esc(c.label) + ' (' + c.count + ')</option>';
    });
    sel.innerHTML = html;
  }

  function readFilterInputs() {
    var s = el("searchInput"); if (s) catalogState.search = s.value;
    var c = el("filterCategory"); if (c) catalogState.category = c.value;
    var so = el("sortSelect"); if (so) catalogState.sort = so.value;
    var mn = el("minPrice"); if (mn) catalogState.min = mn.value === "" ? null : Number(mn.value);
    var mx = el("maxPrice"); if (mx) catalogState.max = mx.value === "" ? null : Number(mx.value);
    var f = el("filterFeatured"); if (f) catalogState.featured = f.checked;
    var b = el("filterBest"); if (b) catalogState.best = b.checked;
    var a = el("filterAvailable"); if (a) catalogState.available = a.checked;
  }

  function resetFilterInputs() {
    var ids = ["searchInput", "minPrice", "maxPrice"];
    ids.forEach(function (id) { var e = el(id); if (e) e.value = ""; });
    var c = el("filterCategory"); if (c) c.value = "all";
    var so = el("sortSelect"); if (so) so.value = "featured";
    ["filterFeatured", "filterBest", "filterAvailable"].forEach(function (id) { var e = el(id); if (e) e.checked = false; });
    catalogState.category = "all"; catalogState.search = ""; catalogState.sort = "featured";
    catalogState.min = null; catalogState.max = null;
    catalogState.featured = false; catalogState.best = false; catalogState.available = false;
    if (page() === "category" && pageKey()) {
      catalogState.category = pageKey();
      var cat = el("filterCategory"); if (cat) cat.value = pageKey();
    }
  }

  /* ============================================================
     PRODUCT MODAL
     ============================================================ */
  var currentModalId = null;

  function openProductModal(id) {
    id = Number(id);
    var p = byId[id];
    if (!p) return;
    var img = el("pmImage"); if (img) { img.src = p.image; img.alt = p.name; }
    var cat = el("pmCategory"); if (cat) cat.textContent = p.category;
    var name = el("pmName"); if (name) name.textContent = p.name;
    var rating = el("pmRating"); if (rating) rating.innerHTML = '<span class="stars">' + starStr(p.rating) + '</span> ' + p.rating + ' (' + p.reviews + ' reviews)';
    var price = el("pmPrice"); if (price) price.textContent = fmt(p.price);
    var desc = el("pmDesc"); if (desc) desc.textContent = p.description;
    var ing = el("pmIngredients"); if (ing) ing.textContent = p.ingredients;
    var al = el("pmAllergens"); if (al) al.textContent = p.allergens;
    var av = el("pmAvailability"); if (av) av.textContent = p.available ? "In stock - baked fresh daily" : "Currently unavailable";
    var badges = el("pmBadges");
    if (badges) {
      var b = "";
      if (p.featured) b += '<span class="badge-featured">Featured</span>';
      if (p.bestseller) b += '<span class="badge-bestseller" style="background:#B5615A;color:#fff;padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:600;">Best Seller</span>';
      if (!p.available) b += '<span class="badge-oos" style="background:#38211F;color:#fff;padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:600;">Out of Stock</span>';
      badges.innerHTML = b;
    }
    var qty = el("pmQty"); if (qty) qty.value = "1";
    var add = el("pmAddToCart"); if (add) add.disabled = !p.available;
    currentModalId = id;
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(el("productModal")).show();
    }
  }

  /* ============================================================
     HOME
     ============================================================ */
  function renderCategoryCards() {
    var wrap = el("categoryCards");
    if (!wrap) return;
    wrap.innerHTML = CATEGORIES.map(function (c) {
      return '' +
        '<div class="col-6 col-md-4 col-lg-3 col-xl-2 d-flex">' +
        '<a class="category-card" href="' + esc(c.href) + '">' +
        '<span class="category-media">' +
        '<img src="' + esc(c.image) + '" alt="' + esc(c.label) + '" loading="lazy" data-fallback="assets/images/placeholder.svg" />' +
        '<span class="category-icon"><i class="bi ' + esc(c.icon) + '" aria-hidden="true"></i></span>' +
        '</span>' +
        '<span class="category-name d-block">' + esc(c.label) + '</span>' +
        '<span class="category-count">' + c.count + ' items</span>' +
        '<span class="category-blurb d-block">' + esc(c.blurb) + '</span>' +
        '</a></div>';
    }).join("");
  }

  function renderFeatured() {
    var wrap = el("featuredGrid");
    if (!wrap) return;
    var seen = {};
    var featured = PRODUCTS.filter(function (p) { return p.featured; })
      .sort(function (a, b) { return b.rating - a.rating; })
      .filter(function (p) { if (seen[p.image]) return false; seen[p.image] = true; return true; })
      .slice(0, 8);
    wrap.innerHTML = featured.map(productCardHTML).join("");
  }

  /* ============================================================
     OFFERS
     ============================================================ */
  var OFFERS = [
    { id: 1, price: 3600, badge: "-20%", img: "assets/images/products/cakes/birthday-cake.jpg", title: "Birthday Cake Offer",
      desc: "Save 20% on every birthday celebration cake when you order a week in advance.",
      terms: ["One cake per order", "Standard flavours only", "Advance booking required"],
      dates: "Sample: 1 Jan - 31 Dec" },
    { id: 2, price: 25000, badge: "Custom", img: "assets/images/products/cakes/wedding-cake.jpg", title: "Wedding Cake Package",
      desc: "A tiered wedding cake plus 100 matching cupcakes as a complete package.",
      terms: ["Free tasting session", "Custom flavours", "Quote on request"],
      dates: "Sample: By appointment" },
    { id: 3, price: 1200, badge: "-25%", img: "assets/images/products/cookies/chocolate-chip-cookie.png", title: "Buy 3 Get 1 Free Cookies",
      desc: "Mix and match any four cookie boxes and pay for only three.",
      terms: ["Cheapest box is free", "Same-day collection", "While stocks last"],
      dates: "Sample: Mon - Fri" },
    { id: 4, price: 1800, badge: "-15%", img: "assets/images/products/cupcakes/cupcake.jpg", title: "Cupcake Bundle",
      desc: "Order a box of twelve cupcakes and enjoy 15% off the regular price.",
      terms: ["All flavours eligible", "24-hour notice", "Local collection"],
      dates: "Sample: 1 Jan - 30 Jun" },
    { id: 5, price: 900, badge: "-30%", img: "assets/images/products/desserts/chocolate-brownie.jpg", title: "Seasonal Dessert Special",
      desc: "End-of-day offer on selected desserts and slices, subject to availability.",
      terms: ["Selected items only", "In-stock items only", "Not with other offers"],
      dates: "Sample: Daily after 7 PM" },
    { id: 6, price: 1500, badge: "-10%", img: "assets/images/products/merchandise/mug.jpg", title: "Merchandise Bundle",
      desc: "Buy any two Bakerz Bite merchandise items and save 10% on the pair.",
      terms: ["Selected merchandise", "While stocks last", "In-store offer"],
      dates: "Sample: 1 Jan - 31 Dec" }
  ];
  var offersById = {};
  OFFERS.forEach(function (o) { offersById[o.id] = o; });
  var currentOfferId = null;

  function offerCardHTML(o) {
    return '' +
      '<div class="col-md-6 col-lg-4 d-flex">' +
      '<article class="offer-card bb-card">' +
      '<div class="offer-media"><img src="' + esc(o.img) + '" alt="' + esc(o.title) + '" loading="lazy" data-fallback="assets/images/placeholder.svg" /><span class="offer-discount">' + esc(o.badge) + '</span></div>' +
      '<div class="offer-body">' +
      '<h3>' + esc(o.title) + '</h3>' +
      '<p>' + esc(o.desc) + '</p>' +
      '<ul class="offer-terms">' + o.terms.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>' +
      '<div class="offer-meta"><span class="offer-dates">' + esc(o.dates) + '</span>' +
      '<button type="button" class="btn bb-btn-primary btn-sm offer-buy" data-offer="' + o.id + '"><i class="bi bi-bag-check" aria-hidden="true"></i> Buy Now</button></div>' +
      '</div></article></div>';
  }

  function renderOffers() {
    var preview = el("offersPreview");
    if (preview) preview.innerHTML = OFFERS.slice(0, 3).map(offerCardHTML).join("");
    var grid = el("offersGrid");
    if (grid) grid.innerHTML = OFFERS.map(offerCardHTML).join("");
  }

  /* ============================================================
     ORDER MODAL (information form + sample receipt)
     ============================================================ */
  var currentOrder = null;
  var currentOfferId = null;

  function offerToOrder(o) {
    if (!o) return null;
    return { id: o.id, title: o.title, badge: o.badge || "", img: o.img, price: o.price };
  }

  function productToOrder(p) {
    if (!p) return null;
    var catMap = { cakes: "Cake", pastries: "Pastry", cookies: "Cookie", pies: "Pie", desserts: "Dessert", cupcakes: "Cupcake", breads: "Bread", beverages: "Beverage", seasonal: "Seasonal", merchandise: "Merchandise" };
    return { id: p.id, title: p.name, badge: catMap[p.cat] || p.category || "", img: p.image, price: p.price };
  }

  function pad2(n) { n = String(n); return n.length < 2 ? "0" + n : n; }

  function orderQty() {
    var q = parseInt((el("odQty") || {}).value, 10);
    if (!q || q < 1) q = 1;
    if (q > 99) q = 99;
    return q;
  }

  function updateOrderTotal() {
    var o = currentOrder || null;
    var box = el("orderLiveTotal");
    if (box) box.textContent = fmt((o ? o.price : 0) * orderQty());
  }

  function openOrderModal(order) {
    if (!order) return;
    currentOrder = order;
    currentOfferId = order.id;

    var formWrap = el("orderFormWrap");
    var receiptWrap = el("orderReceiptWrap");
    if (formWrap) formWrap.classList.remove("d-none");
    if (receiptWrap) receiptWrap.classList.add("d-none");

    var head = el("orderModalTitle");
    if (head) head.innerHTML = '<i class="bi bi-bag-check" aria-hidden="true"></i> Place Order';
    var img = el("orderOfferImg");
    if (img) { img.src = order.img; img.alt = order.title; }
    var badge = el("orderOfferBadge");
    if (badge) badge.textContent = order.badge || "";
    var titleEl = el("orderOfferTitle2");
    if (titleEl) titleEl.textContent = order.title;
    var priceEl = el("orderOfferPrice");
    if (priceEl) priceEl.textContent = fmt(order.price) + " each (sample price)";

    var hidden = el("odOffer");
    if (hidden) hidden.value = String(order.id);
    var form = el("orderForm");
    if (form) form.reset();
    var q = el("odQty");
    if (q) q.value = "1";
    ["odName", "odPhone", "odEmail", "odAddress", "odQty"].forEach(function (id) { setError(id, ""); });
    updateOrderTotal();

    var modal = el("orderModal");
    if (window.bootstrap && window.bootstrap.Modal && modal) {
      window.bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  function openProductOrder(productId) {
    var p = byId[Number(productId)];
    if (!p) return;
    openOrderModal(productToOrder(p));
  }

  function openOfferOrder(offerId) {
    var o = offersById[Number(offerId)];
    openOrderModal(offerToOrder(o));
  }

  function buildReceipt(o, data) {
    var now = new Date();
    var orderNo = "BB-" + String(now.getFullYear()).slice(2) + pad2(now.getMonth() + 1) + pad2(now.getDate()) +
      "-" + String(Math.floor(1000 + Math.random() * 9000));
    var unit = o.price;
    var total = unit * data.qty;
    var box = el("orderReceipt");
    if (!box) return;
    box.innerHTML = '' +
      '<div class="receipt-head">' +
        '<img src="assets/logo/bakerz-bite-badge.png" alt="Bakerz Bite Bakery Badge" class="receipt-logo" />' +
        '<div class="receipt-head-right"><span class="receipt-tag">Order Receipt</span>' +
        '<span class="receipt-orderno">' + esc(orderNo) + '</span></div>' +
      '</div>' +
      '<hr class="receipt-rule" />' +
      '<p class="receipt-date">' + esc(now.toLocaleString()) + '</p>' +
      '<div class="receipt-section"><h4>Offer</h4>' +
        '<div class="receipt-row"><span>' + esc(o.title) + '</span><span class="receipt-badge">' + esc(o.badge) + '</span></div>' +
      '</div>' +
      '<div class="receipt-section"><h4>Order Summary</h4>' +
        '<div class="receipt-row"><span>' + esc(o.title) + ' <em>(sample)</em></span><span>' + data.qty + ' &times; ' + fmt(unit) + '</span></div>' +
        '<div class="receipt-row receipt-total"><span>Total</span><span>' + fmt(total) + '</span></div>' +
        '<div class="receipt-row"><span>Payment</span><span>' + esc(data.payment) + '</span></div>' +
      '</div>' +
      '<div class="receipt-section"><h4>Customer</h4>' +
        '<div class="receipt-kv"><span>Name</span><span>' + esc(data.name) + '</span></div>' +
        '<div class="receipt-kv"><span>Phone</span><span>' + esc(data.phone) + '</span></div>' +
        '<div class="receipt-kv"><span>Email</span><span>' + esc(data.email) + '</span></div>' +
        '<div class="receipt-kv"><span>Address</span><span>' + esc(data.address) + '</span></div>' +
      '</div>' +
      '<p class="receipt-note">Demonstration receipt generated in your browser. Sample prices - not a real purchase or payment.</p>';

    var formWrap = el("orderFormWrap");
    var receiptWrap = el("orderReceiptWrap");
    if (formWrap) formWrap.classList.add("d-none");
    if (receiptWrap) receiptWrap.classList.remove("d-none");
    toast("Order confirmed - your sample receipt is ready.", "ok");
  }

  function initOrderModal() {
    var form = el("orderForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var o = currentOrder || null;
        if (!o) return;
        var nameEl = el("odName"), phoneEl = el("odPhone"), emailEl = el("odEmail"), addrEl = el("odAddress");
        var data = {
          name: nameEl ? nameEl.value.trim() : "",
          phone: phoneEl ? phoneEl.value.trim() : "",
          email: emailEl ? emailEl.value.trim() : "",
          address: addrEl ? addrEl.value.trim() : "",
          qty: orderQty(),
          payment: el("odPayment") ? el("odPayment").value : "Cash on Delivery"
        };
        var ok = true;
        if (!data.name) { setError("odName", "Please enter your full name."); ok = false; } else setError("odName", "");
        if (!data.phone || !/^[0-9+\-\s()]{7,}$/.test(data.phone)) { setError("odPhone", "Please enter a valid phone number."); ok = false; } else setError("odPhone", "");
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setError("odEmail", "Please enter a valid email address."); ok = false; } else setError("odEmail", "");
        if (data.address.length < 5) { setError("odAddress", "Please enter your delivery address."); ok = false; } else setError("odAddress", "");
        if (!parseInt((el("odQty") || {}).value, 10) || parseInt(el("odQty").value, 10) < 1) { setError("odQty", "Enter a quantity of at least 1."); ok = false; } else setError("odQty", "");
        if (!ok) { toast("Please correct the highlighted fields.", "warn"); return; }
        buildReceipt(o, data);
      });
    }

    var minus = el("odQtyMinus");
    if (minus) minus.addEventListener("click", function () {
      var q = el("odQty"); if (q) q.value = String(Math.max(1, orderQty() - 1)); updateOrderTotal();
    });
    var plus = el("odQtyPlus");
    if (plus) plus.addEventListener("click", function () {
      var q = el("odQty"); if (q) q.value = String(Math.min(99, orderQty() + 1)); updateOrderTotal();
    });
    var qty = el("odQty");
    if (qty) qty.addEventListener("input", updateOrderTotal);

    var printBtn = el("orderPrintBtn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    var againBtn = el("orderNewBtn");
    if (againBtn) againBtn.addEventListener("click", function () { openOrderModal(currentOrder); });
  }

  /* ============================================================
     GALLERY
     ============================================================ */
  var GALLERY = [
    { img: "assets/images/products/cakes/wedding-cake.jpg", cap: "Classic Wedding Cake", tags: "wedding chocolate" },
    { img: "assets/images/products/cakes/black-forest-gateau.jpg", cap: "Three-Tier Wedding Cake", tags: "wedding" },
    { img: "assets/images/products/cakes/birthday-cake.jpg", cap: "Birthday Celebration Cake", tags: "birthday" },
    { img: "assets/images/products/cakes/angel-food-cake.jpg", cap: "Colourful Birthday Cake", tags: "birthday" },
    { img: "assets/images/products/cakes/chocolate-cake.jpg", cap: "Chocolate Layer Cake", tags: "chocolate" },
    { img: "assets/images/products/desserts/chocolate-brownie.jpg", cap: "Chocolate Brownie Stack", tags: "chocolate desserts" },
    { img: "assets/images/products/desserts/chocolate-truffle.jpg", cap: "Dark Chocolate Truffle", tags: "chocolate desserts" },
    { img: "assets/images/products/pastries/croissant.jpg", cap: "Butter Croissants", tags: "pastries" },
    { img: "assets/images/products/pastries/pain-au-chocolat.jpg", cap: "Pain au Chocolat", tags: "pastries chocolate" },
    { img: "assets/images/products/pastries/danish-pastry.jpg", cap: "Assorted Danishes", tags: "pastries" },
    { img: "assets/images/products/cookies/chocolate-chip-cookie.png", cap: "Chocolate Chip Cookies", tags: "cookies" },
    { img: "assets/images/products/cookies/macaron.jpg", cap: "French Macarons", tags: "cookies" },
    { img: "assets/images/products/cupcakes/cupcake.jpg", cap: "Buttercream Cupcakes", tags: "cupcakes" },
    { img: "assets/images/products/cupcakes/cupcake2.jpg", cap: "Sprinkle Cupcakes", tags: "cupcakes" },
    { img: "assets/images/products/pies/apple-pie.jpg", cap: "Golden Apple Pie", tags: "pies" },
    { img: "assets/images/products/pies/cherry-pie.jpg", cap: "Cherry Lattice Pie", tags: "pies" },
    { img: "assets/images/products/desserts/creme-brulee.jpg", cap: "Crème Brûlée", tags: "desserts" },
    { img: "assets/images/products/desserts/sticky-toffee-pudding.jpg", cap: "Sticky Toffee Pudding", tags: "desserts" },
    { img: "assets/images/site/01.jpg", cap: "Inside the Bakerz Bite cafe", tags: "cafe" },
    { img: "assets/images/site/03.jpg", cap: "Our pastry counter and display", tags: "cafe" }
  ];

  function galleryItemHTML(g) {
    return '' +
      '<figure class="gallery-item" data-tags="' + esc(g.tags) + '" role="button" tabindex="0" aria-label="View ' + esc(g.cap) + '">' +
      '<img src="' + esc(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy" data-fallback="assets/images/placeholder.svg" />' +
      '<figcaption class="gallery-caption">' + esc(g.cap) + '</figcaption>' +
      '</figure>';
  }

  function renderGallery() {
    var preview = el("galleryPreview");
    if (preview) preview.innerHTML = GALLERY.slice(0, 8).map(galleryItemHTML).join("");
    var grid = el("galleryGrid");
    if (grid) grid.innerHTML = GALLERY.map(galleryItemHTML).join("");
  }

  function openGalleryModal(g) {
    var img = el("galleryModalImg"); if (img) { img.src = g.img; img.alt = g.caption; }
    var txt = el("galleryModalText"); if (txt) txt.textContent = g.caption;
    var cap = el("galleryModalCaption"); if (cap) cap.textContent = g.caption;
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(el("galleryModal")).show();
    }
  }

  /* ============================================================
     FAQ
     ============================================================ */
  var FAQ = [
    { q: "How do I order a cake?", a: "Browse the Full Menu, open a product for details and add it to your cart. This is a front-end demonstration, so to place a real order please contact the bakery directly by phone or WhatsApp." },
    { q: "Can I request a custom cake design?", a: "Yes. Custom designs are arranged directly with the bakery. Share your theme, size, flavours and any reference images, and the team will confirm what is possible." },
    { q: "What ingredients do you use?", a: "Our bakes use real butter, fresh cream and unbleached flour as stated on our About page. Exact recipes and full ingredient lists are available on request in store." },
    { q: "Do your products contain allergens?", a: "Many products contain gluten, egg, dairy and may contain nuts. Each product lists indicative allergens, but please confirm directly with the bakery for serious allergies." },
    { q: "Which product categories do you offer?", a: "Cakes, pastries, cookies and macarons, pies, desserts, cupcakes, breads, beverages, seasonal specials and branded merchandise - ten categories in total." },
    { q: "Are there special offers?", a: "Yes. See the Offers page for demonstration promotions such as birthday cake savings, wedding packages, cupcake bundles and seasonal specials. Sample dates and terms are shown on each offer." },
    { q: "What are your opening hours?", a: "Sample hours are Mon-Sun, 9:00 AM - 11:00 PM. Please replace these placeholders with the bakery's real hours." },
    { q: "Do you offer pickup and delivery?", a: "Pickup and delivery policies are set by the bakery and are shown here as configurable examples only. Confirm the current policy before ordering." },
    { q: "Do you sell merchandise?", a: "Yes - branded mugs, bags, glasses and serving trays are available in the Merchandise section." },
    { q: "How can I give feedback or get support?", a: "Use the Feedback page to leave a rating and review (saved in your browser only), or contact the bakery through the Contact page." }
  ];

  function renderFaq() {
    var acc = el("faqAccordion");
    if (!acc) return;
    acc.innerHTML = FAQ.map(function (f, i) {
      return '' +
        '<div class="accordion-item">' +
        '<h2 class="accordion-header" id="faqHead' + i + '">' +
        '<button class="accordion-button' + (i === 0 ? "" : " collapsed") + '" type="button" data-bs-toggle="collapse" data-bs-target="#faqBody' + i + '" aria-expanded="' + (i === 0) + '" aria-controls="faqBody' + i + '">' + esc(f.q) + '</button></h2>' +
        '<div id="faqBody' + i + '" class="accordion-collapse collapse' + (i === 0 ? " show" : "") + '" aria-labelledby="faqHead' + i + '" data-bs-parent="#faqAccordion">' +
        '<div class="accordion-body">' + esc(f.a) + '</div></div></div>';
    }).join("");
  }

  /* ============================================================
     FEEDBACK & REVIEWS
     ============================================================ */
  var SEED_REVIEWS = [
    { name: "Ayesha K.", product: "Chocolate Fudge Cake", rating: 5, text: "Beautiful cake and so moist. The whole family loved it.", date: "2 weeks ago", demo: true },
    { name: "Usman R.", product: "Butter Croissant", rating: 5, text: "Flaky, buttery and fresh - just like a proper bakery.", date: "3 weeks ago", demo: true },
    { name: "Maryam S.", product: "Red Velvet Cake", rating: 4, text: "Lovely flavour and cream cheese frosting. Will order again.", date: "1 month ago", demo: true },
    { name: "Bilal A.", product: "Apple Pie", rating: 5, text: "Crisp pastry and a generous apple filling. Delicious.", date: "1 month ago", demo: true }
  ];

  function storedReviews() {
    var r = storage.get("bb_reviews", []);
    return Array.isArray(r) ? r : [];
  }

  function renderReviews() {
    var list = el("reviewsList");
    if (!list) return;
    var stored = storedReviews();
    var all = stored.concat(SEED_REVIEWS);
    list.innerHTML = all.map(function (r) {
      var initial = (r.name || "?").trim().charAt(0).toUpperCase();
      return '' +
        '<article class="review-card bb-card">' +
        '<div class="review-head">' +
        '<span class="review-avatar">' + esc(initial) + '</span>' +
        '<div><strong>' + esc(r.name) + '</strong><span class="review-product">' + esc(r.product || "") + '</span></div>' +
        '<span class="review-stars">' + starStr(r.rating) + '</span>' +
        '</div>' +
        '<p class="review-text">' + esc(r.text) + '</p>' +
        '<time class="review-time">' + esc(r.date || "Just now") + (r.demo ? " - demonstration review" : "") + '</time>' +
        '</article>';
    }).join("");

    var empty = el("reviewsEmpty");
    if (empty) empty.classList.toggle("d-none", all.length > 0);

    var sum = 0;
    all.forEach(function (r) { sum += Number(r.rating) || 0; });
    var avg = all.length ? sum / all.length : 0;
    var avgEl = el("ratingAverage"); if (avgEl) avgEl.textContent = avg.toFixed(1);
    var avgStars = el("ratingAverageStars"); if (avgStars) avgStars.textContent = starStr(avg);
    var cnt = el("ratingCount"); if (cnt) cnt.textContent = all.length + (all.length === 1 ? " review" : " reviews");
  }

  function populateFeedbackProducts() {
    var sel = el("fbProduct");
    if (!sel) return;
    var sorted = PRODUCTS.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    sel.innerHTML = '<option value="">Select a product...</option>' +
      sorted.map(function (p) { return '<option value="' + esc(p.name) + '">' + esc(p.name) + '</option>'; }).join("");
  }

  /* ============================================================
     CART PAGE
     ============================================================ */
  function cartLineHTML(l) {
    var p = byId[l.id];
    if (!p) return "";
    return '' +
      '<div class="cart-page-item" data-id="' + p.id + '">' +
      '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" data-fallback="assets/images/placeholder.svg" />' +
      '<div class="cart-item-info"><h4>' + esc(p.name) + '</h4><p class="cart-item-price">' + fmt(p.price) + ' each</p></div>' +
      '<div class="qty-selector" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button type="button" class="qty-btn cart-qty-minus" data-id="' + p.id + '" aria-label="Decrease quantity"><i class="bi bi-dash"></i></button>' +
      '<input type="number" class="cart-qty-input" data-id="' + p.id + '" value="' + l.qty + '" min="1" max="99" aria-label="Quantity" />' +
      '<button type="button" class="qty-btn cart-qty-plus" data-id="' + p.id + '" aria-label="Increase quantity"><i class="bi bi-plus"></i></button>' +
      '</div>' +
      '<span class="cart-line-total">' + fmt(p.price * l.qty) + '</span>' +
      '<button type="button" class="cart-remove cart-remove-btn" data-id="' + p.id + '" aria-label="Remove ' + esc(p.name) + '"><i class="bi bi-trash3"></i></button>' +
      '</div>';
  }

  function renderCartPage() {
    var itemsEl = el("cartPageItems");
    if (!itemsEl) return;
    var empty = el("cartPageEmpty");
    var content = el("cartPageContent");
    var totals = cartTotals();

    if (cart.length === 0) {
      if (empty) empty.classList.remove("d-none");
      if (content) content.classList.add("d-none");
      itemsEl.innerHTML = "";
    } else {
      if (empty) empty.classList.add("d-none");
      if (content) content.classList.remove("d-none");
      itemsEl.innerHTML = cart.map(cartLineHTML).join("");
    }
    var sub = el("cartSubtotal"); if (sub) sub.textContent = fmt(totals.subtotal);
    var it = el("cartItemTotal"); if (it) it.textContent = String(totals.items);
    var tot = el("cartTotal"); if (tot) tot.textContent = fmt(totals.total);
  }

  function openCheckout() {
    var body = el("checkoutBody");
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML = '<p class="mb-0">Your cart is empty.</p>';
    } else {
      var rows = cart.map(function (l) {
        var p = byId[l.id];
        return '<tr><td>' + esc(p.name) + '</td><td class="text-center">' + l.qty + '</td><td class="text-end">' + fmt(p.price * l.qty) + '</td></tr>';
      }).join("");
      var totals = cartTotals();
      body.innerHTML = '<div class="table-responsive"><table class="table align-middle mb-3"><thead><tr><th>Product</th><th class="text-center">Qty</th><th class="text-end">Total</th></tr></thead><tbody>' +
        rows + '</tbody><tfoot><tr><th colspan="2">Grand Total</th><th class="text-end">' + fmt(totals.total) + '</th></tr></tfoot></table></div>' +
        '<p class="mb-0 text-muted small">' + totals.items + ' item(s). This is a demonstration summary only.</p>';
    }
    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(el("checkoutModal")).show();
    }
  }

  /* ============================================================
     HEADER, NAV, TICKER, MISC CHROME
     ============================================================ */
  var ANNOUNCEMENTS = [
    "Freshly baked every morning - visit us today!",
    "New: seasonal dessert specials are now available.",
    "Order celebration cakes a week in advance and save 20%.",
    "Free tasting session with every wedding cake package."
  ];

  function initAnnouncements() {
    var text = el("announcementText");
    if (!text) return;
    var i = 0;
    setInterval(function () {
      i = (i + 1) % ANNOUNCEMENTS.length;
      text.innerHTML = '<i class="bi bi-megaphone-fill" aria-hidden="true"></i>' + esc(ANNOUNCEMENTS[i]);
    }, 5000);
    var close = el("announcementClose");
    if (close) close.addEventListener("click", function () {
      var bar = el("announcementBar");
      if (bar) bar.style.display = "none";
      try { window.sessionStorage.setItem("bb_announce_closed", "1"); } catch (e) {}
    });
    try { if (window.sessionStorage.getItem("bb_announce_closed") === "1") { var b = el("announcementBar"); if (b) b.style.display = "none"; } } catch (e) {}
  }

  function applyNavActive() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    var hash = window.location.hash || "";
    var links = document.querySelectorAll(".bb-navbar .nav-link");
    for (var i = 0; i < links.length; i++) links[i].classList.remove("active");
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute("href") || "";
      if (!href || href === "#") continue;
      var parts = href.split("#");
      var hrefPath = parts[0];
      var hrefHash = parts[1] ? "#" + parts[1] : "";
      if (hrefPath !== path) continue;
      if (!hrefHash || hrefHash === hash) links[j].classList.add("active");
      var dd = links[j].closest(".dropdown");
      if (dd) {
        var tog = dd.querySelector(".dropdown-toggle");
        if (tog) tog.classList.add("bb-cat-active");
      }
    }
    if (!hash && !document.querySelector(".bb-navbar a.nav-link.active")) {
      for (var k = 0; k < links.length; k++) {
        var hp = (links[k].getAttribute("href") || "").split("#")[0];
        if (hp === path) { links[k].classList.add("active"); break; }
      }
    }
  }

  function initNavActive() {
    applyNavActive();
    window.addEventListener("hashchange", applyNavActive);
    window.addEventListener("load", applyNavActive);
    setTimeout(applyNavActive, 400);
  }

  function initMobileNavClose() {
    if (!window.bootstrap) return;
    var nav = el("mainNav");
    if (!nav) return;
    nav.querySelectorAll("a.nav-link:not(.dropdown-toggle)").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth < 1200) {
          var inst = window.bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });
          inst.hide();
        }
      });
    });
  }

  function injectTimeline() {
    if (page() !== "about") return;
    var host = document.querySelector(".about-features");
    if (!host || document.querySelector(".timeline")) return;
    var sec = document.createElement("div");
    sec.className = "section-head text-center mt-5 is-visible";
    sec.innerHTML = '<h3 class="section-title h2">Our Journey</h3><p class="section-sub">A few milestones in the Bakerz Bite story.</p>';
    var tl = document.createElement("div");
    tl.className = "timeline";
    var items = [
      { year: "2019", title: "The First Oven", text: "Bakerz Bite began as a small neighbourhood bakery with a single oven and a big idea." },
      { year: "2021", title: "The Cafe Opens", text: "We added a cosy cafe space and handcrafted beverages to pair with our bakes." },
      { year: "2023", title: "Ten Categories", text: "Our menu grew to cakes, pastries, cookies, pies, desserts and more." },
      { year: "2026", title: "300+ Products", text: "Today we bake over three hundred products, still fresh every single morning." }
    ];
    tl.innerHTML = items.map(function (it) {
      return '<div class="timeline-item"><span class="timeline-year">' + it.year + '</span><h4>' + it.title + '</h4><p>' + it.text + '</p></div>';
    }).join("");
    host.parentNode.insertBefore(sec, host);
    host.parentNode.insertBefore(tl, host);
  }

  /* ----------------------------- animated warm bokeh background -----------------------------
     Builds soft, blurred, warm light circles (cream, champagne gold, peach, amber, dusty
     pink, muted brown) that slowly float, drift, pulse and fade behind all content.
     Lightweight: CSS handles the motion, JS only creates the elements once per page. */
  function initBokeh() {
    var host = el("bbBokeh");
    if (!host || host.childElementCount) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var small = window.matchMedia && window.matchMedia("(max-width: 767.98px)").matches;

    var palette = [
      [255, 243, 220], [255, 243, 220],   // cream
      [244, 214, 152], [244, 214, 152],   // champagne gold
      [233, 184, 114], [233, 184, 114],   // gold
      [255, 199, 158],                     // peach
      [230, 160, 80],                      // amber
      [229, 170, 164],                     // dusty pink
      [150, 110, 80]                       // muted brown
    ];

    var count = reduce ? 18 : (small ? 14 : 26);
    var frag = document.createDocumentFragment();

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
    function lighter(c, t) { return [Math.round(c[0] + (255 - c[0]) * t), Math.round(c[1] + (255 - c[1]) * t), Math.round(c[2] + (255 - c[2]) * t)]; }
    function fix(n, d) { return Number(n.toFixed(d === undefined ? 2 : d)); }

    for (var i = 0; i < count; i++) {
      var c = palette[Math.floor(Math.random() * palette.length)];
      var ring = Math.random() < 0.28;
      var depth = i < (small ? 3 : 5);            // a few large, very soft orbs add depth
      var core = lighter(c, ring ? 0.45 : 0.70);
      var size = depth ? Math.round(rnd(small ? 120 : 200, small ? 220 : 400))
                       : Math.round(rnd(small ? 34 : 46, small ? 150 : 240));
      var blur = depth ? Math.round(rnd(small ? 44 : 70, small ? 64 : 96))
                       : Math.round(rnd(small ? 12 : 18, small ? 34 : 60));
      var oLow = depth ? rnd(0.08, 0.16) : rnd(0.14, 0.34);
      var oHigh = Math.min(depth ? 0.26 : 0.62, oLow + rnd(0.08, 0.26));

      var orb = document.createElement("span");
      orb.className = "bb-orb" + (ring ? " bb-orb--ring" : "");
      orb.style.setProperty("--c-core", rgba(core, ring ? 0.62 : 0.56));
      orb.style.setProperty("--c-mid", rgba(c, ring ? 0.42 : 0.32));
      orb.style.setProperty("--c-soft", rgba(c, 0.10));
      orb.style.setProperty("--blur", blur + "px");
      orb.style.setProperty("--o1", fix(oLow));
      orb.style.setProperty("--o2", fix(oHigh));
      orb.style.setProperty("--dur", fix(rnd(22, 42), 1) + "s");
      orb.style.setProperty("--pulse", fix(rnd(7, 15), 1) + "s");
      orb.style.setProperty("--delay", "-" + fix(rnd(0, 30), 1) + "s");
      orb.style.setProperty("--pdelay", "-" + fix(rnd(0, 12), 1) + "s");
      orb.style.setProperty("--dx", fix(rnd(-70, 70), 0) + "px");
      orb.style.setProperty("--dy", fix(rnd(-70, 70), 0) + "px");
      orb.style.left = fix(rnd(-8, 104)) + "%";
      orb.style.top = fix(rnd(-8, 104)) + "%";
      orb.style.width = size + "px";
      orb.style.height = size + "px";
      frag.appendChild(orb);
    }
    host.appendChild(frag);
  }

  function initReveal() {
    document.documentElement.classList.add("bb-anim");
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach ? items.forEach(function (n) { n.classList.add("is-visible"); }) : Array.prototype.forEach.call(items, function (n) { n.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(items, function (n) { obs.observe(n); });
  }

  function initHeroCount() {
    var stats = document.querySelectorAll(".hero-stat strong");
    if (!stats.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call(stats, function (node) {
      var raw = node.textContent.trim();
      var m = raw.match(/^(\d+)(.*)$/);
      if (!m) return;
      var target = parseInt(m[1], 10);
      var suffix = m[2] || "";
      if (reduce || !target) { node.textContent = target + suffix; return; }
      var dur = 1300, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else node.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    });
  }

  function initImageFallback() {
    document.addEventListener("error", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") {
        var fb = t.getAttribute("data-fallback");
        if (fb && t.src.indexOf(fb) === -1) t.src = fb;
      }
    }, true);
  }

  function initFooterYear() {
    var node = el("footerYear");
    if (node) node.textContent = String(new Date().getFullYear());
  }

  function initScrollUI() {
    var header = el("siteHeader");
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle("scrolled", y > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initChatbot() {
    var wrap = el("bbChat");
    var toggle = el("bbChatToggle");
    var panel = el("bbChatPanel");
    var log = el("bbChatLog");
    var chipHost = el("bbChatChips");
    var form = el("bbChatForm");
    var input = el("bbChatInput");
    var closeBtn = el("bbChatClose");
    var badge = el("bbChatBadge");
    if (!wrap || !toggle || !panel || !log || !form || !input) return;

    var opened = false;
    var busy = false;

    var QUICK = [
      "What's on the menu?",
      "Any offers today?",
      "Do you deliver?",
      "Where are you located?",
      "When are you open?",
      "Allergen info"
    ];

    var RULES = [
      { k: ["hello", "hi", "hey", "namaste", "salam", "good morning", "good evening"],
        a: "Hello and welcome to Bakerz Bite!\nI am Zoe, a demo assistant - my replies are canned, not a real AI.\nAsk me about the menu, offers, delivery, allergens or opening hours." },
      { k: ["menu", "product", "item", "sell", "specialty", "what do you have", "range"],
        a: "Our menu has 337 sample products across 12 categories: cakes, pastries, cookies, pies, desserts, cupcakes, breads, beverages, seasonal specials, merchandise, donuts and savoury bakes.\nOpen the Full Menu page to browse, search and filter them." },
      { k: ["allergen", "allergy", "allergies", "ingredient", "gluten", "nut free", "nuts", "nut", "egg", "dairy", "vegan", "vegetarian", "lactose"],
        a: "Each product page lists its ingredients, allergens and a vegetarian flag.\nEverything here is illustrative - for real allergies, always confirm with the bakery before ordering." },
      { k: ["categor", "donut", "doughnut", "savoury", "savory", "cake", "pastr", "cookie", "beverage", "cupcake", "bread"],
        a: "Yes - cakes, pastries, cookies, pies, desserts, cupcakes, breads, beverages, seasonal, merchandise, donuts and savoury bakes.\nEach category page shows that category's products with photos." },
      { k: ["offer", "discount", "deal", "coupon", "promo", "sale", "cheap"],
        a: "Check the Offers page for current deals.\nNote: all prices, offers and dates on this site are placeholders for demonstration - nothing is actually sold here." },
      { k: ["deliver", "shipping", "ship", "home delivery", "order online", "dispatch"],
        a: "The cart and checkout pages demonstrate the ordering flow, including a delivery option and a printed-style receipt.\nNo real order is placed - this site has no backend." },
      { k: ["price", "cost", "how much", "rate", "expensive", "budget", "rupee", "inr"],
        a: "Prices shown are sample placeholders in Indian Rupees so the layout looks realistic.\nPlease do not treat them as real prices - nothing is for sale on this demo site." },
      { k: ["hour", "open", "close", "timing", "when are", "time"],
        a: "Our listed hours are 8:00 AM to 10:00 PM every day.\nAs with the rest of the site, these are placeholder details for the demonstration." },
      { k: ["where", "address", "location", "direction", "map", "reach", "find you", "area"],
        a: "The Contact page shows the bakery address, a map placeholder and directions.\nAll contact details are placeholders - this is a static demo site." },
      { k: ["contact", "phone", "call", "email", "number", "whatsapp", "support"],
        a: "You can reach us through the Contact page form, or by the phone and email listed there.\nThose details are placeholders - the form validates but does not actually send anything." },
      { k: ["feedback", "review", "rating", "complaint", "suggestion"],
        a: "We would love your thoughts! Use the Feedback page to leave a rating and comment.\nReviews are stored only in your own browser - they are not published anywhere." },
      { k: ["cart", "checkout", "pay", "payment", "cash", "card", "bill", "receipt"],
        a: "Add items to the cart from any product page, then open the cart to review quantities and try the checkout.\nPayment options and the receipt are demonstrations only - no money changes hands." },
      { k: ["custom", "birthday", "wedding", "anniversary", "photo cake", "order cake", "personalis"],
        a: "Custom celebration cakes are one of our specialities - birthdays, weddings and anniversaries.\nUse the Contact page to describe what you need; the form is a demonstration only." },
      { k: ["about", "story", "history", "who are you", "your name", "team", "bakery"],
        a: "Bakerz Bite is a fictional premium bakery and cafe built as a static website demonstration.\nThe About page tells the story, shows the team and our process." },
      { k: ["thank", "thanks", "thx", "appreciate", "jazak"],
        a: "You are very welcome! Anything else I can help with?" },
      { k: ["bye", "goodbye", "see you", "allah hafiz", "take care"],
        a: "Goodbye! Enjoy browsing Bakerz Bite - and remember, everything here is a demonstration." }
    ];

    var FALLBACK = "I am a simple demo bot, so I only know a few topics.\nTry asking about the menu, offers, delivery, prices, opening hours, allergens, feedback or the contact page.";

    function addMsg(text, cls) {
      var d = document.createElement("div");
      d.className = "bb-chat-msg " + cls;
      d.textContent = text;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }

    function replyTo(raw) {
      var msg = String(raw || "").toLowerCase();
      var best = null, bestScore = 0;
      for (var i = 0; i < RULES.length; i++) {
        var score = 0;
        for (var j = 0; j < RULES[i].k.length; j++) {
          if (msg.indexOf(RULES[i].k[j]) !== -1) score++;
        }
        if (score > bestScore) { bestScore = score; best = RULES[i]; }
      }
      return bestScore > 0 ? best.a : FALLBACK;
    }

    function send(text) {
      var t = String(text || "").trim();
      if (!t || busy) return;
      busy = true;
      addMsg(t, "user");
      input.value = "";
      var typing = document.createElement("div");
      typing.className = "bb-chat-msg bot bb-chat-typing";
      typing.setAttribute("aria-hidden", "true");
      typing.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      window.setTimeout(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        addMsg(replyTo(t), "bot");
        busy = false;
      }, 480);
    }

    function setOpen(next) {
      opened = next;
      wrap.classList.toggle("open", opened);
      panel.setAttribute("aria-hidden", opened ? "false" : "true");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.setAttribute("aria-label", opened ? "Close chat assistant" : "Open chat assistant");
      if (opened) {
        if (badge) badge.hidden = true;
        addMsg("Hi! I am Zoe, the Bakerz Bite demo assistant.\nAsk me a question, or tap a suggestion below.", "bot");
        addMsg("I only give canned replies - this site has no backend and no real AI.", "sys");
        window.setTimeout(function () { input.focus(); }, 180);
      }
    }

    if (chipHost) {
      QUICK.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "bb-chat-chip";
        b.textContent = q;
        b.addEventListener("click", function () { send(q); });
        chipHost.appendChild(b);
      });
    }

    toggle.addEventListener("click", function () { setOpen(!opened); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (opened && (e.key === "Escape" || e.key === "Esc")) setOpen(false);
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); });
  }

  function initTicker() {
    var track = el("tickerTrack");
    if (!track) return;
    var msgs = ANNOUNCEMENTS.concat(["Follow us on social media for daily specials.", "Custom cakes available for every occasion."]);
    var run =
      '<span><i class="bi bi-calendar-event"></i><b class="tk-date"></b></span>' +
      '<span><i class="bi bi-clock"></i><b class="tk-time"></b></span>' +
      msgs.map(function (m) { return '<span><i class="bi bi-megaphone"></i>' + esc(m) + '</span>'; }).join("");
    track.innerHTML = run + run;
    function update() {
      var d = new Date();
      var ds = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      var ts = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      var dates = track.querySelectorAll(".tk-date");
      var times = track.querySelectorAll(".tk-time");
      for (var i = 0; i < dates.length; i++) dates[i].textContent = ds;
      for (var j = 0; j < times.length; j++) times[j].textContent = ts;
    }
    update();
    setInterval(update, 1000);

    var geo = el("tickerGeoToggle");
    var loc = el("tickerLocation");
    if (geo) geo.addEventListener("click", function () {
      if (!loc) return;
      if (!navigator.geolocation) { loc.textContent = "Location unavailable"; return; }
      loc.textContent = "Requesting...";
      navigator.geolocation.getCurrentPosition(function (pos) {
        loc.textContent = "~" + pos.coords.latitude.toFixed(2) + ", " + pos.coords.longitude.toFixed(2);
      }, function () {
        loc.textContent = "Location unavailable";
      }, { timeout: 8000 });
    });
  }

  /* ============================================================
     FORM VALIDATION
     ============================================================ */
  function setError(id, message) {
    var field = el(id);
    var box = document.querySelector('[data-error-for="' + id + '"]');
    if (field) field.classList.toggle("is-invalid-custom", !!message);
    if (box) box.textContent = message || "";
  }

  function initFeedbackForm() {
    var form = el("feedbackForm");
    if (!form) return;
    var rating = 0;
    var stars = document.querySelectorAll("#starRatingInput .star");

    function paint(n) {
      Array.prototype.forEach.call(stars, function (s) {
        var v = Number(s.getAttribute("data-value"));
        s.classList.toggle("active", v <= n);
        s.setAttribute("aria-checked", v === n ? "true" : "false");
      });
    }
    Array.prototype.forEach.call(stars, function (s) {
      s.addEventListener("click", function () {
        rating = Number(s.getAttribute("data-value"));
        var hidden = el("fbRating"); if (hidden) hidden.value = rating;
        paint(rating);
        setError("fbRating", "");
      });
      s.addEventListener("keydown", function (ev) {
        if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); s.click(); }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = el("fbName").value.trim();
      var email = el("fbEmail").value.trim();
      var product = el("fbProduct").value;
      var message = el("fbMessage").value.trim();
      var r = Number(el("fbRating").value) || rating;
      var ok = true;

      if (!name) { setError("fbName", "Please enter your name."); ok = false; } else setError("fbName", "");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("fbEmail", "Please enter a valid email address."); ok = false; } else setError("fbEmail", "");
      if (!product) { setError("fbProduct", "Please choose the product you reviewed."); ok = false; } else setError("fbProduct", "");
      if (!r || r < 1) { setError("fbRating", "Please choose a star rating."); ok = false; } else setError("fbRating", "");
      if (message.length < 5) { setError("fbMessage", "Please write a little more feedback."); ok = false; } else setError("fbMessage", "");

      if (!ok) { toast("Please correct the highlighted fields.", "warn"); return; }

      var stored = storedReviews();
      stored.unshift({ name: name, email: email, product: product, rating: r, text: message, date: "Just now", demo: false });
      storage.set("bb_reviews", stored);
      renderReviews();
      form.reset();
      rating = 0; paint(0);
      var hidden = el("fbRating"); if (hidden) hidden.value = "0";
      toast("Thank you! Your feedback has been saved in this browser.", "ok");
    });
  }

  function initContactForm() {
    var form = el("contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = el("ctName").value.trim();
      var email = el("ctEmail").value.trim();
      var phone = el("ctPhone").value.trim();
      var subject = el("ctSubject").value.trim();
      var message = el("ctMessage").value.trim();
      var ok = true;

      if (!name) { setError("ctName", "Please enter your full name."); ok = false; } else setError("ctName", "");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("ctEmail", "Please enter a valid email address."); ok = false; } else setError("ctEmail", "");
      if (phone && !/^[0-9+\-\s()]{7,}$/.test(phone)) { setError("ctPhone", "Please enter a valid phone number."); ok = false; } else setError("ctPhone", "");
      if (!subject) { setError("ctSubject", "Please add a subject."); ok = false; } else setError("ctSubject", "");
      if (message.length < 10) { setError("ctMessage", "Please write at least 10 characters."); ok = false; } else setError("ctMessage", "");

      if (!ok) { toast("Please correct the highlighted fields.", "warn"); return; }
      form.reset();
      toast("Demonstration only - your message was not actually sent.", "ok");
    });
  }

  /* ============================================================
     EVENT BINDINGS (shared + delegated)
     ============================================================ */
  function bindEvents() {
    if (!window.jQuery) return;
    var $doc = window.jQuery(document);

    $doc.on("click", ".product-details", function () { openProductModal(this.getAttribute("data-id")); });
    $doc.on("click", ".product-add", function () { addToCart(this.getAttribute("data-id"), 1); });
    $doc.on("click", ".product-buy", function () { openProductOrder(this.getAttribute("data-id")); });
    $doc.on("click", ".product-card .product-media", function () {
      var card = this.closest(".product-card");
      if (card) openProductModal(card.getAttribute("data-id"));
    });

    $doc.on("click", ".offer-buy", function () { openOfferOrder(this.getAttribute("data-offer")); });

    $doc.on("click", ".cart-remove", function () { removeFromCart(this.getAttribute("data-id")); });
    $doc.on("click", ".cart-qty-minus", function () {
      var id = Number(this.getAttribute("data-id"));
      for (var i = 0; i < cart.length; i++) if (cart[i].id === id) updateQty(id, cart[i].qty - 1);
    });
    $doc.on("click", ".cart-qty-plus", function () {
      var id = Number(this.getAttribute("data-id"));
      for (var i = 0; i < cart.length; i++) if (cart[i].id === id) updateQty(id, cart[i].qty + 1);
    });
    $doc.on("change", ".cart-qty-input", function () { updateQty(this.getAttribute("data-id"), this.value); });

    $doc.on("click", "#clearCartBtn", function () { clearCart(); });
    $doc.on("click", "#checkoutBtn", function () { openCheckout(); });

    $doc.on("click", "#pmQtyMinus", function () {
      var q = el("pmQty"); if (q) q.value = Math.max(1, (parseInt(q.value, 10) || 1) - 1);
    });
    $doc.on("click", "#pmQtyPlus", function () {
      var q = el("pmQty"); if (q) q.value = Math.min(99, (parseInt(q.value, 10) || 1) + 1);
    });
    $doc.on("click", "#pmAddToCart", function () {
      if (currentModalId == null) return;
      var q = el("pmQty");
      var n = q ? Math.max(1, parseInt(q.value, 10) || 1) : 1;
      addToCart(currentModalId, n);
      if (window.bootstrap) { var m = window.bootstrap.Modal.getInstance(el("productModal")); if (m) m.hide(); }
    });

    // gallery
    $doc.on("click", ".gallery-item", function () {
      var img = this.querySelector("img");
      var cap = this.querySelector(".gallery-caption");
      openGalleryModal({ img: img ? img.getAttribute("src") : "", caption: cap ? cap.textContent : "" });
    });
    $doc.on("keydown", ".gallery-item", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); window.jQuery(this).trigger("click"); }
    });
    $doc.on("click", "#galleryFilters .bb-filter-btn", function () {
      var filter = this.getAttribute("data-gallery");
      window.jQuery("#galleryFilters .bb-filter-btn").removeClass("active");
      window.jQuery(this).addClass("active");
      window.jQuery("#galleryGrid .gallery-item").each(function () {
        var tags = (this.getAttribute("data-tags") || "").split(/\s+/);
        var show = filter === "all" || tags.indexOf(filter) !== -1;
        this.classList.toggle("is-hidden", !show);
      });
    });

    // catalog filters
    if (el("catalogGrid")) {
      $doc.on("input", "#searchInput", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("change", "#filterCategory", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("change", "#sortSelect", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("input", "#minPrice", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("input", "#maxPrice", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("change", "#filterFeatured", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("change", "#filterBest", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("change", "#filterAvailable", function () { readFilterInputs(); refreshCatalog(); });
      $doc.on("click", "#clearFilters, #emptyClearFilters", function () { resetFilterInputs(); refreshCatalog(); });
      $doc.on("click", "#loadMoreBtn", function () { catalogState.shown += pageSize(); renderCatalog(); });
    }
  }

  /* ============================================================
     INIT
     ============================================================ */
  function initPreloader() {
    var pre = el("bbPreloader");
    if (!pre) return;
    var started = Date.now();
    var hide = function () { pre.classList.add("bb-preloader-hide"); };
    var reveal = function () {
      var min = 750;
      var wait = Math.max(0, min - (Date.now() - started));
      window.setTimeout(hide, wait);
    };
    if (document.readyState === "complete") reveal();
    else window.addEventListener("load", reveal);
    window.setTimeout(hide, 5000);
  }

  function initHeroVideo() {
    var vids = document.querySelectorAll(".hero-video, .banner-video");
    if (!vids.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call(vids, function (v) {
      if (reduce) {
        try { v.pause(); v.removeAttribute("autoplay"); } catch (e) {}
        return;
      }
      var tryPlay = function () {
        var p = v.play();
        if (p && p.catch) { p.catch(function () {}); }
      };
      tryPlay();
      v.addEventListener("canplay", tryPlay, { once: true });
      v.addEventListener("loadeddata", tryPlay, { once: true });
    });
  }

  function initPageLoading() {
    var pre = el("bbPreloader");
    if (!pre) return;
    document.addEventListener("click", function (e) {
      var node = e.target;
      var a = node && node.closest ? node.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (href.charAt(0) === "#" || /^(mailto:|tel:|https?:\/\/|javascript:)/i.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      pre.classList.remove("bb-preloader-hide");
    }, true);
  }

  function initPage() {
    initPreloader();
    initPageLoading();
    initBokeh();
    initHeroVideo();
    initReveal();
    initHeroCount();
    initImageFallback();
    initAnnouncements();
    initNavActive();
    initMobileNavClose();
    initFooterYear();
    initScrollUI();
    initChatbot();
    initTicker();
    updateCartBadge();

    populateCategoryFilter();
    populateFeedbackProducts();

    renderCategoryCards();
    renderFeatured();
    renderOffers();
    renderGallery();
    renderFaq();
    renderReviews();
    renderCartPage();
    initFeedbackForm();
    initContactForm();
    initOrderModal();

    // catalog page setup
    if (el("catalogGrid")) {
      if (page() === "category") {
        catalogState.category = pageKey() || "all";
      }
      catalogState.shown = pageSize();
      renderCatalog();
    }

    injectTimeline();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }

  /* ----------------------------- public API ----------------------------- */
  window.BB = {
    products: PRODUCTS,
    categories: CATEGORIES,
    storage: storage,
    cart: cart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    clearCart: clearCart,
    cartTotals: cartTotals,
    cartCount: function () { return cartTotals().items; },
    catalogState: catalogState,
    filterCatalog: filterCatalog,
    openProductModal: openProductModal,
    fmt: fmt,
    renderCartPage: renderCartPage
  };
})();
