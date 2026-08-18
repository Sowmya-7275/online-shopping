// ===== Sowmya Lakshmi's Online Shopping - Main JS =====

// --- Cart Management (localStorage) ---
function getCart() {
  return JSON.parse(localStorage.getItem('sowmyaCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('sowmyaCart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
  });
}

function addToCart(id, name, price, image) {
  let cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  saveCart(cart);
  showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  if (typeof renderCart === 'function') renderCart();
}

function updateQty(id, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
  }
  saveCart(cart);
  if (typeof renderCart === 'function') renderCart();
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Slider ---
function initSlider() {
  const slides = document.querySelector('.slides');
  if (!slides) return;

  const slideCount = document.querySelectorAll('.slide').length;
  let current = 0;
  let autoTimer;

  function goTo(index) {
    current = (index + slideCount) % slideCount;
    slides.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  document.querySelector('.slider-arrow.next')?.addEventListener('click', () => {
    next();
    resetAuto();
  });
  document.querySelector('.slider-arrow.prev')?.addEventListener('click', () => {
    prev();
    resetAuto();
  });

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      resetAuto();
    });
  });

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();
}

// --- Mobile Menu ---
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
}

// --- Product Filter ---
function initFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- Contact Form ---
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value;
    showToast(`Thank you, ${name}! We'll get back to you soon.`);
    form.reset();
  });
}

// --- Cart Page Render ---
function renderCart() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="images/cart.jpg" alt="Empty Cart">
        <h2>Your cart is empty</h2>
        <p style="color:var(--text-light);margin:0.8rem 0 1.5rem;">Looks like you haven't added anything yet.</p>
        <a href="products.html" class="btn">Browse Products</a>
      </div>
    `;
    if (summary) summary.style.display = 'none';
    return;
  }

  if (summary) summary.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="price">₹${item.price.toLocaleString()}</div>
        <div class="qty-control" style="margin-top:0.6rem;">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
      <div style="font-weight:600;font-size:1.1rem;color:var(--primary);">
        ₹${(item.price * item.qty).toLocaleString()}
      </div>
    </div>
  `).join('');

  // Update summary
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 999 ? 0 : 49;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  showToast('Order placed successfully! Thank you for shopping with us.');
  localStorage.removeItem('sowmyaCart');
  updateCartCount();
  setTimeout(() => renderCart(), 1000);
}

// --- Init on load ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initSlider();
  initMobileMenu();
  initFilter();
  initContactForm();
  renderCart();
});
