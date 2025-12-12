// Shared cart logic used by all pages
let cart = [];

const CART_KEY = 'al_saloul_cart_v1';

// small helper to avoid HTML injection when inserting product names into innerHTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resolveImgSrc(src) {
  if (!src) return '';
  try {
    // resolve relative paths against the current page so stored relative URLs load correctly
    return new URL(src, location.href).href;
  } catch (e) {
    return src;
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // normalize stored items: resolve img to absolute URL but don't expose raw path
        cart = parsed.map(it => {
          const copy = Object.assign({}, it);
          if (copy && copy.img) {
            try { copy.img = resolveImgSrc(copy.img); } catch (e) { /* keep original */ }
          }
          return copy;
        });
      }
    }
  } catch (e) { cart = []; }
}

// log cart after loading for debugging
debugCart('after-load');

// debug helper to show cart contents in console (only when devtools open)
function debugCart(tag) {
  try {
    if (window && window.console && console.debug) {
      console.debug('[cart-debug]', tag, JSON.parse(JSON.stringify(cart)));
    }
  } catch (e) { /* ignore */ }
}

// addToCart can be called either as addToCart(this, name, price)
// or addToCart(name, price) for backward compatibility.
function addToCart(a, b, c) {
  let img = null;
  let name;
  let price;

  if (a && typeof a === 'object' && a.tagName) {
    // called with button element as first arg
    const btn = a;
    name = b;
    price = c;
    const card = btn.closest('.product-card');
    if (card) {
      const imgEl = card.querySelector('img');
      if (imgEl) {
        // store the raw src but also resolve to absolute URL before saving
        const raw = imgEl.getAttribute('src');
        img = raw;
        try { img = resolveImgSrc(raw); } catch (e) { /* keep raw */ }
      }
    }
  } else {
    // legacy: addToCart(name, price)
    name = a;
    price = b;
  }

  cart.push({ name, price: Number(price || 0), img });
  saveCart();
  debugCart('after-add');
  updateCart();

  // brief visual confirmation
  const panel = document.getElementById('cart-items');
  if (panel) {
    panel.style.display = 'block';
    setTimeout(() => {
      // keep it open if user manually opened it
      const style = window.getComputedStyle(panel);
      if (style.display !== 'block') panel.style.display = 'none';
      else panel.style.display = 'block';
    }, 900);
  }
}

function updateCart() {
  debugCart('update-start');
  const cartList = document.getElementById('cart-list');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  if (!cartList || !cartCount || !cartTotal) return;

  cartList.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="cart-empty">السلة فارغة</li>';
  } else {
    cart.forEach((item, index) => {
      total += Number(item.price || 0);
      const li = document.createElement('li');
      li.className = 'cart-item';

      let imgHtml = '';
      if (item.img) {
        const src = resolveImgSrc(item.img);
        const safeName = escapeHtml(item.name || '');
        // add an onerror fallback so broken/malformed paths show a placeholder image
        imgHtml = `<img src="${escapeHtml(src)}" alt="${safeName}" class="cart-item-img" onerror="this.onerror=null;this.src='images/logo-101.jpg'"/>`;
      }

      li.innerHTML = `
        <div class="cart-item-row">
          ${imgHtml}
          <div class="cart-item-meta">
            <div class="cart-item-name">${escapeHtml(item.name || '')}</div>
            <div class="cart-item-price">${escapeHtml(String(item.price || '0'))}\u00A0ريال</div>
          </div>
          <div class="cart-item-actions"><button onclick="removeItem(${index})">❌</button></div>
        </div>
      `;

      cartList.appendChild(li);
    });
  }

  cartCount.innerText = cart.length;
  cartTotal.innerText = 'الإجمالي: ' + total + '\u00A0ريال';
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

function toggleCart() {
  const cartSection = document.getElementById('cart-items');
  if (!cartSection) return;
  const style = window.getComputedStyle(cartSection);
  cartSection.style.display = style.display === 'none' ? 'block' : 'none';
}

function clearCart() {
  cart = [];
  saveCart();
  updateCart();
}

function checkout() {
  if (cart.length === 0) {
    alert('\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063a\u0629');
    return;
  }
  renderCheckoutForm();
}

function getStorePhone() {
  // try to read a phone number from the page (element with class 'pa' used in pages)
  try {
    const el = document.querySelector('.pa, .store-phone, #store-phone');
    if (!el) return '';
    const digits = el.textContent.replace(/[^0-9+]/g, '');
    return digits;
  } catch (e) { return ''; }
}

function renderCheckoutForm() {
  const panel = document.getElementById('cart-items');
  if (!panel) return;

  const total = cart.reduce((s, i) => s + Number(i.price || 0), 0);
  const itemsHtml = cart.map((it, idx) => `
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;align-items:center;">
      <div style="text-align:right;flex:1">${it.name}</div>
      <div style="width:90px;text-align:left">${it.price}\u00A0\u0631\u064a\u0627\u0644</div>
    </div>
  `).join('');

  panel.innerHTML = `
    <h3>\u0635\u0641\u062d\u0629 \u0627\u0644\u062f\u0641\u0639</h3>
    <div id="checkout-summary" style="max-height:160px;overflow:auto;margin-bottom:8px;padding:6px;border-radius:6px;background:rgba(255,255,255,0.02)">
      ${itemsHtml}
      <div style="font-weight:bold;margin-top:8px;text-align:right">\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a: ${total}\u00A0\u0631\u064a\u0627\u0644</div>
    </div>
    <form id="checkout-form" class="contact-form" onsubmit="return false;">
      <input id="cust-name" type="text" placeholder="\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" />
      <input id="cust-phone" type="text" placeholder="\u0627\u0631\u0642\u0627\u0645 \u0627\u0644\u062c\u0648\u0627\u0644" />
      <input id="cust-address" type="text" placeholder="\u0627\u0644\u0639\u0646\u0648\u0627\u0646" />
      <textarea id="cust-note" placeholder="\u0645\u0644\u0627\u062d\u0638\u0629 (\u0627\u062e\u062a\u064a\u0627\u0631\u064a)"></textarea>
      <div style="display:flex;gap:8px;margin-top:6px;">
        <button type="button" id="wa-send" class="buy-btn" style="flex:1">\u0627\u0631\u0633\u0627\u0644 \u0628\u0639\u0631 \u0648\u0627\u062a\u0633\u0627\u0628</button>
        <button type="button" id="checkout-cancel" class="buy-btn" style="flex:1;background:#ccc;color:#222">\u0627\u0644\u063a\u0627\u0621</button>
      </div>
    </form>
  `;

  document.getElementById('checkout-cancel').addEventListener('click', () => {
    // restore the normal cart panel when user cancels checkout
    renderCartPanel();
  });
  document.getElementById('wa-send').addEventListener('click', sendWhatsAppOrder);
}

// restore the default cart panel markup and re-populate it
function renderCartPanel() {
  const panel = document.getElementById('cart-items');
  if (!panel) return;

  panel.innerHTML = `
    <h3 class="text-dark" font-color="#fff">سلة المشتريات</h3>
    <p id="cart-total" class="text-dark">الإجمالي: 0 ريال</p>
    <ul id="cart-list"></ul>
    <div style="display:flex;gap:8px;justify-content:space-between;margin-top:10px;">
      <button onclick="checkout()" class="buy-btn" style="flex:1">الدفع</button>
      <button onclick="clearCart()" class="buy-btn" style="flex:1">تفريغ</button>
    </div>
  `;

  // ensure panel visible and update contents
  panel.style.display = 'block';
  updateCart();
}

function sendWhatsAppOrder() {
  const name = (document.getElementById('cust-name') || {}).value || '';
  const phone = (document.getElementById('cust-phone') || {}).value || '';
  const address = (document.getElementById('cust-address') || {}).value || '';
  const note = (document.getElementById('cust-note') || {}).value || '';

  if (!name.trim() || !phone.trim()) {
    alert('\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0627\u0633\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u062c\u0648\u0627\u0644');
    return;
  }

  const total = cart.reduce((s, i) => s + Number(i.price || 0), 0);
  let msg = `طلب من الموقع\nالاسم: ${name}\nالجوال: ${phone}\nالعنوان: ${address}\n\nالمنتجات:\n`;
  cart.forEach((it, idx) => {
    msg += `${idx + 1}. ${it.name} - ${it.price} ريال\n`;
  });
  msg += `\nالاجمالي: ${total} ريال\nملاحظة: ${note}`;

  const storePhone = getStorePhone();
  let url;
  if (storePhone && storePhone.length > 3) {
    // use phone if available
    url = 'https://api.whatsapp.com/send?phone=' + encodeURIComponent(storePhone) + '&text=' + encodeURIComponent(msg);
  } else {
    url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
  }

  window.open(url, '_blank');

  // clear cart after starting the checkout
  clearCart();
  updateCart();
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCart();
});
