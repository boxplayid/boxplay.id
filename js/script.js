// --- DATA & CONFIG ---
const HOURLY_RATE = 15000;
const USE_FIREBASE = true;

const defaultUnits = [
    { id: 1, name: 'ND 1', type: 'PS4', branch: 'NUD HOUSE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 2, name: 'ND 2', type: 'PS4', branch: 'NUD HOUSE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 3, name: 'ND 3', type: 'PS4', branch: 'NUD HOUSE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 4, name: 'ND 4', type: 'PS4', branch: 'NUD HOUSE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 5, name: 'ND 5', type: 'PS4', branch: 'NUD HOUSE', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 6, name: 'PS 1', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 7, name: 'PS 2', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 8, name: 'PS 3', type: 'PS4', branch: 'PALIO SPITI', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 9, name: 'PZ 1', type: 'PS4', branch: 'PIRZZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 10, name: 'PZ 2', type: 'PS4', branch: 'PIRZZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 11, name: 'PZ 3', type: 'PS4', branch: 'PIRZZY', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 12, name: 'RD 1', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 13, name: 'RD 2', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' },
    { id: 14, name: 'RD 3', type: 'PS4', branch: 'WAROENG RADEN', status: 'idle', customer: '', startTime: null, elapsed: 0, image: 'foto_boxplay/unitps.jpg' }
];

let storedUnits = JSON.parse(localStorage.getItem('pb_units'));
let units = Array.isArray(storedUnits) && storedUnits.length === defaultUnits.length ? storedUnits : defaultUnits;
if (!storedUnits || storedUnits.length !== defaultUnits.length) {
    localStorage.setItem('pb_units', JSON.stringify(units));
}
let history = JSON.parse(localStorage.getItem('pb_history')) || [];
let promos = JSON.parse(localStorage.getItem('pb_promos')) || [];
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
// Cart functions removed as per request to remove from home view

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
// Modal functions removed as per request to remove from home view

// --- INITIALIZATION ---
function initApp() {
    const page = window.location.pathname.split("/").pop().toLowerCase();
    
    // updateCartUI() removed
    
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
