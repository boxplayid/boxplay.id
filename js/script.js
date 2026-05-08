// --- DATA & CONFIG ---
const HOURLY_RATE = 15000;
const USE_FIREBASE = true;

const defaultUnits = [
    { id: 1, name: 'Unit 01', type: 'PS4', branch: 'NUD CAFE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 2, name: 'Unit 02', type: 'PS4', branch: 'NUD CAFE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 3, name: 'Unit 03', type: 'PS4', branch: 'NUD CAFE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 4, name: 'Unit 04', type: 'PS4', branch: 'NUD CAFE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 5, name: 'Unit 05', type: 'PS4', branch: 'NUD CAFE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 6, name: 'Unit 01', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 7, name: 'Unit 02', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 8, name: 'Unit 03', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 9, name: 'Unit 01', type: 'PS4', branch: 'PIRZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 10, name: 'Unit 02', type: 'PS4', branch: 'PIRZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 11, name: 'Unit 03', type: 'PS4', branch: 'PIRZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 12, name: 'Unit 01', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 13, name: 'Unit 02', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 14, name: 'Unit 03', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' }
];

let units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
let history = JSON.parse(localStorage.getItem('pb_history')) || [];
let promos = JSON.parse(localStorage.getItem('pb_promos')) || [
    { id: 1, tag: 'SPECIAL NUD', title: 'Main 3 Jam, Bayar 2 Jam!', desc: 'Nikmati promo khusus di NUD Cafe setiap hari Jumat.', icon: 'fab fa-playstation', color: 'promo-1' },
    { id: 2, tag: 'NUD SNACK', title: 'Gratis Kopi Susu', desc: 'Dapatkan Kopi Susu NUD gratis untuk booking minimal 3 jam.', icon: 'fas fa-coffee', color: 'promo-2' },
    { id: 3, tag: 'GAMER NIGHT', title: 'Diskon 10% Menu Cafe', desc: 'Tunjukkan sesi bermainmu dan dapatkan diskon untuk semua menu NUD Cafe.', icon: 'fas fa-utensils', color: 'promo-3' }
];
let cart = JSON.parse(localStorage.getItem('pb_cart')) || [];
let activeOrders = JSON.parse(localStorage.getItem('pb_active_orders')) || [];
let products = JSON.parse(localStorage.getItem('pb_products')) || [
    { id: 101, name: 'Espresso NUD', price: 18000, category: 'Coffee', image: 'foto_boxplay/foto1.jpg', stock: 8, icon: 'fas fa-coffee' },
    { id: 141, name: 'Chicken Burger', price: 45000, category: 'Food', image: 'foto_boxplay/foto1.jpg', stock: 5, icon: 'fas fa-hamburger' }
];

// --- HELPERS ---
function formatIDR(val) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function saveData() {
    localStorage.setItem('pb_units', JSON.stringify(units));
    localStorage.setItem('pb_history', JSON.stringify(history));
    localStorage.setItem('pb_promos', JSON.stringify(promos));
    localStorage.setItem('pb_products', JSON.stringify(products));
    localStorage.setItem('pb_cart', JSON.stringify(cart));
    localStorage.setItem('pb_active_orders', JSON.stringify(activeOrders));
    
    if (typeof db !== 'undefined') {
        db.ref('boxplay').set({ units, history, promos, products, activeOrders, updatedAt: Date.now() });
    }
}

// --- UI RENDERING ---
function renderHomeProducts() {
    const container = document.getElementById('home-product-grid');
    if (!container) return;

    container.innerHTML = units.map(unit => `
        <div class="product-card">
            <div class="product-img">
                <img src="${unit.image || 'foto_boxplay/unitps.jpg'}" alt="${unit.name}">
                <span class="product-status ${unit.status === 'active' ? 'status-used' : 'status-ready'}">
                    ${unit.status === 'active' ? 'Digunakan' : 'Ready'}
                </span>
                <i class="fab fa-playstation"></i>
            </div>
            <div class="product-info">
                <p class="product-cat">${unit.type} - ${unit.branch}</p>
                <h4 class="product-title">${unit.name}</h4>
                <div class="product-price">Rp 15.000 <span>/ Jam</span></div>
                <button class="btn btn-primary w-full" 
                    onclick="${unit.status === 'active' ? '' : `navigateToBooking('${unit.name} (${unit.branch})')`}" ${unit.status === 'active' ? 'disabled' : ''}>
                    ${unit.status === 'active' ? 'SEDANG BERMAIN' : 'BOOKING UNIT'}
                </button>
            </div>
        </div>
    `).join('');

    renderHomeMenu();
}

function navigateToBooking(data) {
    sessionStorage.setItem('pb_temp_data', data);
    window.location.href = 'booking.html';
}

function renderHomeMenu() {
    const container = document.getElementById('home-menu-grid');
    if (!container) return;

    container.innerHTML = products.map(p => {
        const isAvailable = p.stock > 0;
        const itemData = JSON.stringify({ id: p.id, name: p.name, price: p.price });
        return `
            <div class="product-card">
                <div class="product-img">
                    <img src="${p.image || 'foto_boxplay/foto4.jpg'}" alt="${p.name}">
                    <span class="product-status ${isAvailable ? 'status-ready' : 'status-sold'}">${isAvailable ? 'Ready' : 'Sold Out'}</span>
                </div>
                <div class="product-info">
                    <p class="product-cat">${p.category}</p>
                    <h4 class="product-title">${p.name}</h4>
                    <div class="product-price">${formatIDR(p.price)}</div>
                    <button class="btn btn-primary w-full" onclick='addToCart(${itemData}, event)' ${isAvailable ? '' : 'disabled'}>
                        <i class="fas fa-cart-plus"></i> ${isAvailable ? 'Tambah' : 'Habis'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// --- CART ---
function addToCart(item, event) {
    cart = JSON.parse(localStorage.getItem('pb_cart')) || [];
    const existing = cart.find(c => c.id === item.id);
    if (existing) existing.qty++;
    else cart.push({ ...item, qty: 1 });
    
    saveData();
    updateCartUI();
    
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = original, 1000);
    }
}

function updateCartUI() {
    const badges = document.querySelectorAll('.cart-badge');
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    
    cart = JSON.parse(localStorage.getItem('pb_cart')) || [];
    const totalQty = cart.reduce((acc, curr) => acc + curr.qty, 0);
    
    badges.forEach(b => {
        b.innerText = totalQty;
        b.style.display = totalQty > 0 ? 'inline-flex' : 'none';
    });

    if (container) {
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted);">Keranjang kosong</p>';
        } else {
            container.innerHTML = cart.map(item => `
                <div class="cart-item" style="padding:1rem 0; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:700;">${item.name}</div>
                        <div style="font-size:0.8rem; color:var(--accent);">${formatIDR(item.price)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <button onclick="updateCartQty(${item.id}, -1)" class="btn btn-secondary" style="padding:0.2rem 0.5rem;">-</button>
                        <span>${item.qty}</span>
                        <button onclick="updateCartQty(${item.id}, 1)" class="btn btn-secondary" style="padding:0.2rem 0.5rem;">+</button>
                    </div>
                </div>
            `).join('');
        }
    }

    if (totalEl) {
        const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
        totalEl.innerText = formatIDR(total);
    }
}

function updateCartQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
        saveData();
        updateCartUI();
    }
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.toggle('hidden');
    if (modal && !modal.classList.contains('hidden')) updateCartUI();
}

function goToCheckout() {
    if (cart.length === 0) return alert('Keranjang kosong!');
    window.location.href = 'checkout.html';
}

function renderCheckoutSummary() {
    const list = document.getElementById('checkout-items-list');
    const totalEl = document.getElementById('checkout-total-price');
    if (!list || !totalEl) return;

    cart = JSON.parse(localStorage.getItem('pb_cart')) || [];
    
    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem; color: var(--text-muted);">Keranjang kosong.</p>';
        totalEl.innerText = formatIDR(0);
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
            <div class="cart-item-info">
                <div style="font-weight: 700; color: #fff;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${item.qty} x ${formatIDR(item.price)}</div>
            </div>
            <div style="font-weight: 800; color: var(--primary);">${formatIDR(item.price * item.qty)}</div>
        </div>
    `).join('');

    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    totalEl.innerText = formatIDR(total);
}

function processCheckout() {
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const tableInput = document.getElementById('checkout-table');
    const methodInput = document.getElementById('checkout-method');

    if (!nameInput || !phoneInput || !tableInput || !methodInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const table = tableInput.value.trim();
    const method = methodInput.value;

    if (!name || !phone || !table) {
        alert('Harap lengkapi semua data!');
        return;
    }

    cart = JSON.parse(localStorage.getItem('pb_cart')) || [];
    if (cart.length === 0) return alert('Keranjang kosong!');

    const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const orderId = Date.now();
    
    const newOrder = {
        id: orderId,
        customer: name,
        phone: phone,
        table: table,
        method: method,
        items: [...cart],
        total: total,
        status: 'masuk',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    activeOrders = JSON.parse(localStorage.getItem('pb_active_orders')) || [];
    activeOrders.unshift(newOrder);
    cart = [];
    saveData();

    // WA Message
    let msg = `*PESANAN BARU - BOXPLAY*\n------------------\n*Nama:* ${name}\n*Meja:* ${table}\n*Total:* ${formatIDR(total)}\n------------------\n`;
    newOrder.items.forEach(i => msg += `- ${i.name} (x${i.qty})\n`);
    
    const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
    alert('Pesanan berhasil! Anda akan diarahkan ke WhatsApp.');
    window.location.href = waUrl;
}

// --- UI HELPERS ---
function saveCustomerInfo() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const type = document.getElementById('customer-type').value;

    if (!name || !phone) return alert('Lengkapi data Anda!');

    localStorage.setItem('pb_customer_data', JSON.stringify({ name, phone, type }));
    document.getElementById('customer-modal').classList.add('hidden');
    
    if (type === 'booking') window.location.href = 'booking.html';
}

function openAboutModal() {
    document.getElementById('about-modal').classList.remove('hidden');
}

function closeAboutModal() {
    document.getElementById('about-modal').classList.add('hidden');
}

// --- INITIALIZATION ---
function initApp() {
    const page = window.location.pathname.split("/").pop().toLowerCase();
    
    updateCartUI();
    
    if (page === 'beranda.html' || page === 'index.html' || page === '') {
        renderHomeProducts();
    } else if (page.includes('checkout')) {
        renderCheckoutSummary();
    }
    
    setInterval(() => {
        units.forEach(u => {
            if (u.status === 'active' && u.startTime) {
                u.elapsed = Math.floor((Date.now() - u.startTime) / 1000);
                const timerEl = document.querySelector(`.timer-${u.id}`);
                if (timerEl) timerEl.innerText = formatTime(u.elapsed);
            }
        });
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    // initApp is now called by app.js initPage
});
