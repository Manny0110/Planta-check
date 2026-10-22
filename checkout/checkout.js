/* =========================================
   CONFIGURACION DE LA TIENDA
   Cambia aqui nombre, productos, precios y envios.
   ========================================= */

const STORE = {
  name: "Mi Tienda",
  currency: "USD",
  locale: "en-US",
  taxRate: 0.07,
  // Codigos de descuento: porcentaje (0.10 = 10 %)
  discounts: { BIENVENIDO10: 0.10 },
};

const PRODUCTS = [
  {
    id: "p1",
    name: "Producto 1",
    variant: "Tamaño grande",
    price: 39.99,
    compareAt: 59.99,
    qty: 1,
    image: "", // URL de la foto; vacio = imagen de muestra
    color: "#d9e7d0",
  },
  {
    id: "p2",
    name: "Producto 2",
    variant: "Paquete x2",
    price: 24.99,
    compareAt: null,
    qty: 1,
    image: "",
    color: "#f1e2cf",
  },
];

const SHIPPING_METHODS = [
  { id: "standard", name: "Envío estándar", eta: "5 a 8 días hábiles", price: 0 },
  { id: "express", name: "Envío exprés", eta: "2 a 3 días hábiles", price: 9.95 },
];


/* =========================================
   ESTADO Y UTILIDADES
   ========================================= */

const state = {
  shipping: null,
  discountCode: null,
};

const $ = (sel) => document.querySelector(sel);
const money = (n) =>
  new Intl.NumberFormat(STORE.locale, { style: "currency", currency: STORE.currency }).format(n);

function placeholderImage(product) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${product.color}"/>
    <path d="M18 44l10-12 8 9 6-7 6 10z" fill="rgba(0,0,0,.18)"/>
    <circle cx="42" cy="22" r="5" fill="rgba(0,0,0,.18)"/></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function totals() {
  const itemCount = PRODUCTS.reduce((s, p) => s + p.qty, 0);
  const subtotal = PRODUCTS.reduce((s, p) => s + p.price * p.qty, 0);
  const rate = state.discountCode ? STORE.discounts[state.discountCode] : 0;
  const discount = subtotal * rate;
  const shipping = state.shipping ? state.shipping.price : 0;
  const taxes = (subtotal - discount) * STORE.taxRate;
  return { itemCount, subtotal, discount, shipping, taxes, total: subtotal - discount + shipping + taxes };
}


/* =========================================
   RENDER
   ========================================= */

function renderProducts() {
  $("#product-list").innerHTML = PRODUCTS.map((p) => `
    <li class="product">
      <div class="thumb">
        <img src="${p.image || placeholderImage(p)}" alt="${p.name}" />
        <span class="qty-badge">${p.qty}</span>
      </div>
      <div class="product-info">
        <p class="product-name">${p.name}</p>
        <p class="product-variant">${p.variant}</p>
        <div class="stepper" data-id="${p.id}">
          <button type="button" data-step="-1" aria-label="Quitar uno">−</button>
          <span>${p.qty}</span>
          <button type="button" data-step="1" aria-label="Agregar uno">+</button>
        </div>
      </div>
      <div class="product-price">
        ${p.compareAt ? `<s>${money(p.compareAt * p.qty)}</s>` : ""}
        <span>${money(p.price * p.qty)}</span>
      </div>
    </li>`).join("");
}

function renderTotals() {
  const t = totals();
  $("#item-count").textContent = `${t.itemCount} ${t.itemCount === 1 ? "artículo" : "artículos"}`;
  $("#subtotal").textContent = money(t.subtotal);
  $("#taxes").textContent = money(t.taxes);
  $("#currency").textContent = STORE.currency;

  const shippingEl = $("#shipping");
  if (state.shipping) {
    shippingEl.textContent = state.shipping.price === 0 ? "GRATIS" : money(state.shipping.price);
    shippingEl.classList.remove("muted");
  } else {
    shippingEl.textContent = "Ingresa la dirección de envío";
    shippingEl.classList.add("muted");
  }

  $("#discount-row").hidden = !state.discountCode;
  if (state.discountCode) {
    $("#discount-tag").textContent = state.discountCode;
    $("#discount-amount").textContent = "−" + money(t.discount);
  }

  document.querySelectorAll("[data-total]").forEach((el) => (el.textContent = money(t.total)));
}

function renderShipping() {
  const ready = ["#address", "#city", "#zip"].every((id) => $(id).value.trim());
  $("#shipping-empty").hidden = ready;
  $("#shipping-options").hidden = !ready;

  if (!ready) {
    state.shipping = null;
  } else if (!state.shipping) {
    state.shipping = SHIPPING_METHODS[0];
  }

  $("#shipping-options").innerHTML = SHIPPING_METHODS.map((m) => `
    <label class="option">
      <input type="radio" name="shipping" value="${m.id}" ${state.shipping?.id === m.id ? "checked" : ""} />
      <span class="option-label">${m.name}<small>${m.eta}</small></span>
      <strong>${m.price === 0 ? "GRATIS" : money(m.price)}</strong>
    </label>`).join("");

  renderTotals();
}


/* =========================================
   EVENTOS
   ========================================= */

// Cantidades
$("#product-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-step]");
  if (!btn) return;
  const product = PRODUCTS.find((p) => p.id === btn.parentElement.dataset.id);
  product.qty = Math.max(1, product.qty + Number(btn.dataset.step));
  renderProducts();
  renderTotals();
});

// Direccion -> metodos de envio
["#address", "#city", "#zip"].forEach((id) => $(id).addEventListener("input", renderShipping));

$("#shipping-options").addEventListener("change", (e) => {
  state.shipping = SHIPPING_METHODS.find((m) => m.id === e.target.value);
  renderTotals();
});

// Metodo de pago
document.querySelectorAll('input[name="payment"]').forEach((radio) =>
  radio.addEventListener("change", () => {
    document.querySelectorAll(".option-body").forEach((body) => {
      body.hidden = body.dataset.for !== radio.value;
    });
    $("#pay-btn").textContent = radio.value === "paypal" ? "Pagar con PayPal" : "Pagar ahora";
  })
);

// Formato de tarjeta
$("#cc-number").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
});
$("#cc-exp").addEventListener("input", (e) => {
  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
  e.target.value = v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v;
});
$("#cc-cvc").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});

// Descuento
$("#discount").addEventListener("input", (e) => {
  $("#apply-btn").disabled = !e.target.value.trim();
});
$("#discount-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("#discount").value.trim().toUpperCase();
  const msg = $("#discount-msg");
  msg.hidden = false;
  if (STORE.discounts[code]) {
    state.discountCode = code;
    msg.textContent = `Código ${code} aplicado.`;
    msg.className = "discount-msg ok";
    $("#discount").value = "";
    $("#apply-btn").disabled = true;
  } else {
    msg.textContent = "Ingresa un código de descuento o tarjeta de regalo válido.";
    msg.className = "discount-msg error";
  }
  renderTotals();
});

// Resumen desplegable (movil)
$("#summary-toggle").addEventListener("click", () => {
  const open = document.body.classList.toggle("summary-open");
  $("#summary-toggle").setAttribute("aria-expanded", open);
  $("#summary-toggle-text").textContent = open ? "Ocultar resumen del pedido" : "Mostrar resumen del pedido";
});

// Enviar pedido
$("#checkout-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));

  const missing = [...form.querySelectorAll("[required]")].filter((el) => !el.value.trim() || !el.checkValidity());
  missing.forEach((el) => el.closest(".field").classList.add("invalid"));

  const error = $("#form-error");
  if (missing.length) {
    error.textContent = "Revisa los campos marcados para continuar.";
    error.hidden = false;
    missing[0].focus();
    return;
  }
  error.hidden = true;

  // Aqui se conectaria la pasarela de pago real.
  $("#thanks-text").textContent =
    `Te enviaremos la confirmación a ${$("#email").value}. Total pagado: ${money(totals().total)} ${STORE.currency}.`;
  $("#thanks").hidden = false;
});

$("#thanks-close").addEventListener("click", () => ($("#thanks").hidden = true));


/* =========================================
   INICIO
   ========================================= */

document.title = `Checkout | ${STORE.name}`;
$("#store-name").textContent = STORE.name;
renderProducts();
renderShipping();
