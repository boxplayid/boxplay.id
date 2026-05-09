// Firebase & app logic
const DEFAULT_BRANCH_DATA = [
    {
        name: 'NUD HOUSE',
        address: 'Nikmati suasana gaming premium dengan kopi terbaik.',
        image: 'foto_cabang/nud.jpeg',
        code: 'ND',
        createdAt: Date.now()
    },
    {
        name: 'PALIO SPITI',
        address: 'Lokasi strategis untuk mabar seru bersama teman.',
        image: 'foto_cabang/palio_spiti.jpeg',
        code: 'PS',
        createdAt: Date.now()
    },
    {
        name: 'PIRZZY',
        address: 'Fasilitas gaming lengkap dengan menu kekinian.',
        image: 'foto_cabang/pirzy.jpeg',
        code: 'PZ',
        createdAt: Date.now()
    },
    {
        name: 'WAROENG RADEN',
        address: 'Tempat nongkrong asik dengan sentuhan tradisional.',
        image: 'foto_cabang/waroeng_raden.jpeg',
        code: 'RD',
        createdAt: Date.now()
    }
];

const APP_CONFIG = {
    admin: { username: 'admin', password: '12345' },
    branches: DEFAULT_BRANCH_DATA.map(branch => branch.name)
};

const firebaseConfig = {
    apiKey: 'AIzaSyDvMKKIFUD2Ys3MtdxDRiNFdx_OKckChpE',
    authDomain: 'idboxplay-7a27f.firebaseapp.com',
    databaseURL: 'https://idboxplay-7a27f-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'idboxplay-7a27f',
    storageBucket: 'idboxplay-7a27f.appspot.com',
    messagingSenderId: '553757223806',
    appId: '1:553757223806:web:629c586dc82fd8e5dca12f',
    measurementId: 'G-J6CMR1W449'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function ensureDefaultBranchData() {
    let branches = JSON.parse(localStorage.getItem('pb_branches')) || [];
    if (!Array.isArray(branches)) {
        branches = [];
    }

    const existingNames = branches.map(branch => branch.name);
    let updated = false;

    DEFAULT_BRANCH_DATA.forEach(defaultBranch => {
        if (!existingNames.includes(defaultBranch.name)) {
            branches.push(defaultBranch);
            updated = true;
        }
    });

    if (updated || branches.length === 0) {
        localStorage.setItem('pb_branches', JSON.stringify(branches));
    }

    return branches;
}

function getTodayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getQueueRefs() {
    const today = getTodayKey();
    const root = db.ref(`queue/${today}`);
    return {
        root,
        meta: root.child('meta'),
        items: root.child('items')
    };
}

function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return /^08\d{8,10}$/.test(digits);
}

function getDisplayPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return phone;
    return digits.replace(/(\d{4})(\d{4})(\d{0,4})/, (m, a, b, c) => c ? `${a}-${b}-${c}` : `${a}-${b}`);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3600);
}

function navigateTo(path) {
    window.location.href = path;
}

let heroSlideIndex = 0;

function loadHeroImage(slide, imagePath) {
    if (!imagePath) return;
    
    // Set background immediately so it shows as soon as possible
    slide.style.backgroundImage = `url('${imagePath}')`;
    
    const img = new Image();
    img.onload = () => {
        slide.classList.add('loaded');
    };
    img.onerror = () => {
        console.error(`Gagal memuat gambar: ${imagePath}`);
        slide.style.background = 'linear-gradient(45deg, #1a1d29, #2a2e3f)';
    };
    img.src = imagePath;
}

function setHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slides.length || !dots.length) return;

    heroSlideIndex = index % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === heroSlideIndex);
    });

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === heroSlideIndex);
    });
}

function initHeroSlider() {
    console.log("Memulai inisialisasi Hero Slider...");
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');

    if (!slides.length || !dots.length) {
        console.error("Elemen Hero Slider tidak ditemukan!", { slides: slides.length, dots: dots.length });
        return;
    }

    // Load images for all slides
    slides.forEach((slide, idx) => {
        const imagePath = slide.dataset.image;
        console.log(`Loading image for slide ${idx}: ${imagePath}`);
        if (imagePath) {
            loadHeroImage(slide, imagePath);
        }
    });

    // Set initial slide
    setHeroSlide(0);

    // Add click handlers to dots
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            console.log(`Dot ${idx} diklik`);
            setHeroSlide(idx);
        });
    });

    // Auto-play
    setInterval(() => {
        setHeroSlide((heroSlideIndex + 1) % slides.length);
    }, 6500);
}

let promoSliderIndex = 0;
let promoInterval;

function setPromoSlide(index) {
    const slides = document.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.promo-slider-dot');
    if (!slides.length || !dots.length) return;
    promoSliderIndex = index % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === promoSliderIndex));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === promoSliderIndex));
}

function initPromoSlider() {
    // Clear interval lama jika ada
    if (promoInterval) clearInterval(promoInterval);
    
    const dots = document.querySelectorAll('.promo-slider-dot');
    if (!dots.length) return;
    setPromoSlide(0);
    dots.forEach((dot, idx) => dot.addEventListener('click', () => setPromoSlide(idx)));
    promoInterval = setInterval(() => setPromoSlide((promoSliderIndex + 1) % dots.length), 5000);
}

function initPage() {
    const pageType = document.body.dataset.page;
    if (pageType === 'home') initHomePage();
    if (pageType === 'booking') initBookingPage();
    if (pageType === 'waiting') initWaitingPage();
    if (pageType === 'login') initLoginPage();
    if (pageType === 'dashboard' || pageType === 'admin') initDashboardPage();
    if (pageType === 'display') initDisplayPage();
    if (pageType === 'branch') initCabangPage();
    if (pageType === 'portfolio') initPortfolioPage();
    if (pageType === 'about') initAboutPage(); // Tambahkan ini
    
    // Compatibility with script.js initialization
    if (typeof initApp === 'function') initApp();
}

function initCabangPage() {
    // Ensure default cabang data exists before rendering
    ensureDefaultBranchData();

    // Load branch data and render hero slider and units sections
    renderBranchHeroSlider();
    initBranchHeroSlider();
    
    // Listen for branch data changes
    if (typeof db !== 'undefined') {
        db.ref('boxplay/branchData').on('value', (snapshot) => {
            const branchData = snapshot.val();
            if (branchData) {
                localStorage.setItem('pb_branches', JSON.stringify(branchData));
                renderBranchHeroSlider();
                initBranchHeroSlider();
            }
        });
        
        // Listen for unit data changes
        db.ref('boxplay/units').on('value', (snapshot) => {
            const unitData = snapshot.val();
            if (unitData) {
                localStorage.setItem('pb_units', JSON.stringify(unitData));
                renderBranchHeroSlider(); // This will re-render units sections too
            }
        });
    }
    
    // Also listen for localStorage changes (fallback)
    window.addEventListener('storage', (e) => {
        if (e.key === 'pb_branches' || e.key === 'pb_units') {
            renderBranchHeroSlider();
            initBranchHeroSlider();
        }
    });
}

function renderBranchHeroSlider() {
    const slider = document.getElementById('branch-hero-slider');
    const dotsContainer = document.getElementById('branch-slider-dots');
    
    if (!slider || !dotsContainer) return;
    
    const branches = JSON.parse(localStorage.getItem('pb_branches')) || [
        { name: 'NUD HOUSE', image: 'foto_cabang/nud.jpeg', address: 'Nikmati suasana gaming premium dengan kopi terbaik.' },
        { name: 'PALIO SPITI', image: 'foto_cabang/palio_spiti.jpeg', address: 'Lokasi strategis untuk mabar seru bersama teman.' },
        { name: 'PIRZZY', image: 'foto_cabang/pirzy.jpeg', address: 'Fasilitas gaming lengkap dengan menu kekinian.' },
        { name: 'WAROENG RADEN', image: 'foto_cabang/waroeng_raden.jpeg', address: 'Tempat nongkrong asik dengan sentuhan tradisional.' }
    ];
    
    console.log('Branches data:', branches);
    
    // Render slides
    slider.innerHTML = branches.map((branch, idx) => `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-image="${branch.image}">
            <div class="slide-overlay">
                <h2>${branch.name}</h2>
                <p>${branch.address}</p>
            </div>
        </div>
    `).join('');
    
    // Render dots
    dotsContainer.innerHTML = branches.map((_, idx) => `
        <button class="slider-dot ${idx === 0 ? 'active' : ''}"></button>
    `).join('');
    
    // Render branch units sections
    renderBranchUnitsSections(branches);
}

function renderBranchUnitsSections(branches) {
    const container = document.getElementById('branch-units-container');
    if (!container) return;
    
    const units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
    
    container.innerHTML = branches.map(branch => {
        const branchUnits = units.filter(u => u.branch === branch.name);
        const containerId = branch.name.toLowerCase().replace(/\s+/g, '-') + '-units-grid';
        
        return `
            <section class="section" id="${containerId.replace('-units-grid', '-units')}">
                <div class="section-title">Unit ${branch.name}</div>
                <p class="section-subtitle">${branchUnits.length} Unit PlayStation 4 tersedia di ${branch.name}.</p>
                <div class="grid product-grid" id="${containerId}">
                    <!-- Units will be populated by JavaScript -->
                </div>
            </section>
        `;
    }).join('');
    
    // Render units for each branch
    branches.forEach(branch => {
        const containerId = branch.name.toLowerCase().replace(/\s+/g, '-') + '-units-grid';
        renderBranchUnits(units, branch.name, containerId);
    });
}

let branchSlideIndex = 0;

function setBranchSlide(index) {
    const slider = document.getElementById('branch-hero-slider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#branch-slider-dots .slider-dot');
    if (!slides.length || !dots.length) return;

    branchSlideIndex = index % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === branchSlideIndex);
    });

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === branchSlideIndex);
    });
}

function initBranchHeroSlider() {
    const slider = document.getElementById('branch-hero-slider');
    const dots = document.querySelectorAll('#branch-slider-dots .slider-dot');
    if (!slider || !dots.length) return;

    const slides = slider.querySelectorAll('.hero-slide');
    slides.forEach((slide) => {
        const imagePath = slide.dataset.image;
        if (imagePath) loadHeroImage(slide, imagePath);
    });

    setBranchSlide(0);
    dots.forEach((dot, idx) => dot.addEventListener('click', () => setBranchSlide(idx)));
    setInterval(() => setBranchSlide((branchSlideIndex + 1) % slides.length), 6000);
}

function initPortfolioPage() {
    console.log("Inisialisasi Halaman Portofolio...");
    const slider = document.getElementById('portfolio-page-slider');
    const dots = document.querySelectorAll('#portfolio-page-dots .slider-dot');
    
    if (!slider) {
        console.error("Slider portofolio tidak ditemukan!");
        return;
    }

    const slides = slider.querySelectorAll('.hero-slide');
    console.log(`Ditemukan ${slides.length} slide portofolio`);
    
    // Load images
    slides.forEach((slide, idx) => {
        const imagePath = slide.dataset.image;
        if (imagePath) {
            console.log(`Memuat gambar slide ${idx}: ${imagePath}`);
            loadHeroImage(slide, imagePath);
        }
    });

    let currentIndex = 0;

    function setSlide(index) {
        currentIndex = index % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle('active', idx === currentIndex));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
    }

    if (dots.length > 0) {
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                console.log(`Dot portofolio ${idx} diklik`);
                setSlide(idx);
            });
        });
    }

    // Set initial slide
    setSlide(0);

    setInterval(() => setSlide(currentIndex + 1), 6000);
}

function initAboutPage() {
    const slider = document.getElementById('team-slider');
    const dots = document.querySelectorAll('#team-slider-dots .slider-dot');
    if (!slider || !dots.length) return;

    const slides = slider.querySelectorAll('.hero-slide');
    
    // Load images
    slides.forEach((slide) => {
        const imagePath = slide.dataset.image;
        if (imagePath) loadHeroImage(slide, imagePath);
    });

    let currentIndex = 0;

    function setSlide(index) {
        currentIndex = index % slides.length;
        slides.forEach((slide, idx) => slide.classList.toggle('active', idx === currentIndex));
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => setSlide(idx));
    });

    // Set initial slide
    setSlide(0);

    setInterval(() => setSlide(currentIndex + 1), 6000);
}

function renderBranchUnits(units, branchName, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const branchUnits = units.filter(u => u.branch === branchName);
    
    if (branchUnits.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--muted);">Tidak ada unit tersedia di cabang ini.</p>';
        return;
    }

    container.innerHTML = branchUnits.map(unit => `
        <div class="product-card">
            <div class="product-img">
                <img src="${unit.image || 'foto_boxplay/unitps.jpg'}" alt="${unit.name}">
                <span class="product-status ${unit.status === 'active' ? 'status-used' : 'status-ready'}">
                    ${unit.status === 'active' ? 'Digunakan' : 'Ready'}
                </span>
                <i class="fab fa-playstation"></i>
            </div>
            <div class="product-info">
                <p class="product-cat">${unit.type}</p>
                <h4 class="product-title">${unit.name}</h4>
                <div class="product-price">Rp 15.000 <span>/ Jam</span></div>
                <button class="btn btn-primary w-full" style="width: 100%"
                    onclick="${unit.status === 'active' ? '' : `navigateToBooking('${unit.name} (${unit.branch})')`}" ${unit.status === 'active' ? 'disabled' : ''}>
                    ${unit.status === 'active' ? 'SEDANG BERMAIN' : 'BOOKING UNIT'}
                </button>
            </div>
        </div>
    `).join('');
}

function initHomePage() {
    const bookButton = document.getElementById('cta-book');
    if (bookButton) bookButton.addEventListener('click', () => navigateTo('booking.html'));
    initHeroSlider();
    initPromoSlider();
    initPortfolioSlider(); // Tambahkan ini
    listenPromoUpdatesForHome();
}

let portfolioSlideIndex = 0;

function setPortfolioSlide(index) {
    const slider = document.getElementById('portfolio-slider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#portfolio-dots .slider-dot');
    if (!slides.length || !dots.length) return;

    portfolioSlideIndex = index % slides.length;

    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === portfolioSlideIndex);
    });

    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === portfolioSlideIndex);
    });
}

function initPortfolioSlider() {
    const slider = document.getElementById('portfolio-slider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#portfolio-dots .slider-dot');

    if (!slides.length || !dots.length) return;

    slides.forEach((slide) => {
        const imagePath = slide.dataset.image;
        if (imagePath) {
            loadHeroImage(slide, imagePath);
        }
    });

    setPortfolioSlide(0);

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => setPortfolioSlide(idx));
    });

    setInterval(() => {
        setPortfolioSlide((portfolioSlideIndex + 1) % slides.length);
    }, 7000);
}

function listenPromoUpdatesForHome() {
    db.ref('boxplay/promos').on('value', (snapshot) => {
        const promos = snapshot.val() || [];
        renderHomePromos(promos);
    });
}

function renderHomePromos(promos) {
    const slider = document.getElementById('promo-slider');
    const dotsContainer = document.getElementById('promo-slider-dots');
    if (!slider || !dotsContainer) return;

    const promoList = Array.isArray(promos) ? promos : Object.values(promos);
    const activePromos = promoList.filter(p => p.status === 'active');

    if (activePromos.length === 0) {
        slider.innerHTML = `
            <div class="promo-slide active" style="background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);">
                <div class="promo-content">
                    <h2>Belum Ada Promo</h2>
                    <p>Nantikan promo menarik dari kami segera!</p>
                </div>
            </div>`;
        dotsContainer.innerHTML = '';
        return;
    }

    slider.innerHTML = activePromos.map((promo, idx) => `
        <div class="promo-slide ${idx === 0 ? 'active' : ''} ${promo.color || 'promo-1'}" style="background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);">
            <div class="promo-content">
                <div class="promo-badge"><i class="${promo.icon || 'fas fa-tag'}"></i> ${promo.tag || 'SPECIAL'}</div>
                <h2>${promo.title}</h2>
                <p>${promo.desc || promo.description}</p>
                <button class="btn btn-primary" onclick="navigateTo('booking.html')">Pesan Sekarang</button>
            </div>
        </div>
    `).join('');

    dotsContainer.innerHTML = activePromos.map((_, idx) => `
        <button class="promo-slider-dot ${idx === 0 ? 'active' : ''}" aria-label="Promo ${idx + 1}"></button>
    `).join('');

    // Re-inisialisasi event listener untuk dots
    const dots = dotsContainer.querySelectorAll('.promo-slider-dot');
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => setPromoSlide(idx));
    });

    // Re-init slider interval dengan jumlah dots baru
    initPromoSlider();
}

function initBookingPage() {
    const branchSelect = document.getElementById('booking-branch');

    // Populate branch select
    if (branchSelect) {
        branchSelect.innerHTML = '<option value="" disabled selected>Pilih lokasi cabang</option>' + 
                                 APP_CONFIG.branches.map(branch => `<option value="${branch}">${branch}</option>`).join('');
    }

    const form = document.getElementById('booking-form');
    if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        processBooking();
    });
}

function initWaitingPage() {
    const latestBooking = JSON.parse(sessionStorage.getItem('latestBooking'));
    const displayNum = document.getElementById('waiting-number');
    const displayName = document.getElementById('display-name');
    const displayBranch = document.getElementById('display-branch');

    if (latestBooking) {
        if (displayNum) displayNum.textContent = String(latestBooking.number).padStart(2, '0');
        if (displayName) displayName.textContent = latestBooking.name;
        if (displayBranch) displayBranch.textContent = latestBooking.branch;
    } else {
        if (displayName) displayName.textContent = 'Nomor tidak ditemukan';
    }

    // Listener Realtime untuk Panggilan dan List Antrian
    listenWaitingRealtime();
}

function listenWaitingRealtime() {
    const refs = getQueueRefs();
    
    // 1. Listen untuk antrian yang sedang dipanggil (playing)
    refs.items.orderByChild('status').equalTo('playing').limitToLast(1).on('value', (snapshot) => {
        const callingNum = document.getElementById('active-calling-number');
        const callingName = document.getElementById('active-calling-name');
        const callingBranch = document.getElementById('active-calling-branch');
        const callingCard = document.querySelector('.calling-card');

        if (snapshot.exists()) {
            const data = Object.values(snapshot.val())[0];
            if (callingNum) callingNum.textContent = String(data.number).padStart(2, '0');
            if (callingName) callingName.textContent = data.name;
            if (callingBranch) callingBranch.textContent = data.branch;
            
            // Berikan efek pulsasi saat ada panggilan aktif
            if (callingCard) callingCard.classList.add('calling-active');
        } else {
            if (callingNum) callingNum.textContent = '--';
            if (callingName) callingName.textContent = 'Menunggu Panggilan...';
            if (callingBranch) callingBranch.textContent = 'SEMUA CABANG';
            if (callingCard) callingCard.classList.remove('calling-active');
        }
    });

    // 2. Listen untuk daftar antrian waiting
    refs.items.orderByChild('createdAt').on('value', (snapshot) => {
        const body = document.getElementById('waiting-list-table-body');
        if (!body) return;

        const allItems = snapshot.val() ? Object.values(snapshot.val()) : [];
        const waitingItems = allItems
            .filter(item => item.status === 'waiting')
            .sort((a, b) => a.number - b.number);

        if (waitingItems.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--muted);">Tidak ada antrian menunggu.</td></tr>';
            return;
        }

        body.innerHTML = waitingItems.map(item => `
            <tr>
                <td><strong>${String(item.number).padStart(2, '0')}</strong></td>
                <td>${item.name}</td>
                <td><span class="tag" style="font-size:0.7rem; padding:0.2rem 0.6rem;">${item.branch}</span></td>
                <td><span class="status-chip status-waiting">Menunggu</span></td>
            </tr>
        `).join('');
    });
}

function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    // Toggle Password Visibility
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLogin();
    });
}

function initDashboardPage() {
    const auth = sessionStorage.getItem('boxplay_admin');
    if (auth !== 'true') {
        navigateTo('login.html');
        return;
    }
    const displayLink = document.getElementById('display-link');
    if (displayLink) displayLink.addEventListener('click', () => navigateTo('pages/display.html'));
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
    
    listenQueueUpdates();
    listenPromoUpdates(); // Tambahkan listener promo
    listenCustomerUpdates(); // Tambahkan listener customer

    // Inisialisasi form promo
    const promoForm = document.getElementById('add-promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddPromo();
        });
    }

    // Inisialisasi form customer
    const customerForm = document.getElementById('add-customer-form');
    if (customerForm) {
        customerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddCustomer();
        });
    }
}

function listenPromoUpdates() {
    // Gunakan database Firebase untuk promo jika tersedia
    db.ref('boxplay/promos').on('value', (snapshot) => {
        const promos = snapshot.val() || [];
        renderPromoTable(promos);
    });
}

function renderPromoTable(promos) {
    const body = document.getElementById('promo-table-body');
    if (!body) return;

    if (!promos || promos.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:2rem; text-align:center; color:var(--muted);">Belum ada promo.</td></tr>';
        return;
    }

    const promoList = Array.isArray(promos) ? promos : Object.values(promos);

    // Pastikan setiap promo punya ID dan simpan ke Firebase jika ada yang baru
    let hasNewIds = false;
    promoList.forEach((promo, idx) => {
        if (!promo.id) {
            promo.id = `promo-${Date.now()}-${idx}`;
            hasNewIds = true;
        }
    });

    // Jika ada ID baru, simpan ke Firebase
    if (hasNewIds && typeof db !== 'undefined') {
        db.ref('boxplay/promos').set(promoList);
    }

    body.innerHTML = promoList.map((promo, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${promo.title}</strong></td>
            <td>${promo.desc || promo.description}</td>
            <td>${promo.discount || 0}%</td>
            <td><span class="status-chip ${promo.status === 'active' ? 'status-playing' : 'status-done'}">${promo.status}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick='openEditPromoModal(${JSON.stringify(promo)})' style="padding: 0.5rem; color: var(--accent);">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="deletePromo('${promo.id}')" style="padding: 0.5rem; color: var(--danger);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openEditPromoModal(promo) {
    document.getElementById('promo-id-edit').value = promo.id;
    document.getElementById('promo-title').value = promo.title;
    document.getElementById('promo-description').value = promo.desc || promo.description;
    document.getElementById('promo-discount').value = promo.discount || 0;
    
    const modalTitle = document.getElementById('promo-modal-title');
    if (modalTitle) modalTitle.textContent = 'Update Promo';
    
    showModal('add-promo-modal');
}

// Reset modal title when adding new
window.showAddPromoModal = () => {
    const promoIdField = document.getElementById('promo-id-edit');
    const promoForm = document.getElementById('add-promo-form');
    const modalTitle = document.getElementById('promo-modal-title');

    if (promoIdField) promoIdField.value = '';
    if (promoForm) promoForm.reset();
    if (modalTitle) modalTitle.textContent = 'Tambah Promo Baru';

    showModal('add-promo-modal');
};

async function handleAddPromo() {
    const editId = document.getElementById('promo-id-edit').value;
    const title = document.getElementById('promo-title').value.trim();
    const desc = document.getElementById('promo-description').value.trim();
    const discount = document.getElementById('promo-discount').value;

    if (!title || !desc) {
        showToast('Harap isi judul dan deskripsi promo.', 'danger');
        return;
    }

    try {
        const snapshot = await db.ref('boxplay/promos').once('value');
        let currentPromos = snapshot.val() || [];
        if (!Array.isArray(currentPromos)) currentPromos = Object.values(currentPromos);
        
        // Pilih icon secara otomatis berdasarkan diskon atau judul
        let icon = 'fas fa-tag';
        if (discount >= 50) icon = 'fas fa-fire';
        else if (discount >= 20) icon = 'fas fa-star';
        else if (title.toLowerCase().includes('kopi') || title.toLowerCase().includes('cafe')) icon = 'fas fa-coffee';
        else if (title.toLowerCase().includes('game') || title.toLowerCase().includes('ps')) icon = 'fas fa-gamepad';

        if (editId) {
            // Update existing
            const index = currentPromos.findIndex(p => p.id === editId);
            if (index !== -1) {
                currentPromos[index] = {
                    ...currentPromos[index],
                    title,
                    desc,
                    discount: parseInt(discount),
                    status: 'active', // Default selalu aktif saat diupdate
                    tag: discount > 0 ? `${discount}% OFF` : 'SPECIAL',
                    icon: icon,
                    updatedAt: Date.now()
                };
            }
        } else {
            // Add new - cek maksimal 10 promo aktif (user mau banyak tapi kita batasi sedikit agar tidak overload)
            const activeCount = currentPromos.filter(p => p.status === 'active').length;
            if (activeCount >= 10) {
                showToast('Maksimal 10 promo aktif diperbolehkan.', 'danger');
                return;
            }
            
            const newPromo = {
                id: `promo-${Date.now()}`,
                tag: discount > 0 ? `${discount}% OFF` : 'SPECIAL',
                title: title,
                desc: desc,
                discount: parseInt(discount),
                status: 'active',
                icon: icon,
                color: `promo-${(currentPromos.length % 3) + 1}`,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            currentPromos.push(newPromo);
        }
        
        await db.ref('boxplay/promos').set(currentPromos);
        
        showToast(editId ? 'Promo berhasil diupdate!' : 'Promo berhasil ditambahkan!');
        closeModal('add-promo-modal');
        if (document.getElementById('add-promo-form')) document.getElementById('add-promo-form').reset();
    } catch (error) {
        console.error(error);
        showToast('Gagal memproses promo.', 'danger');
    }
}

async function deletePromo(promoId) {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;

    try {
        const snapshot = await db.ref('boxplay/promos').once('value');
        let currentPromos = snapshot.val() || [];
        if (!Array.isArray(currentPromos)) currentPromos = Object.values(currentPromos);
        
        const filteredPromos = currentPromos.filter(p => p.id !== promoId);
        
        await db.ref('boxplay/promos').set(filteredPromos);
        
        // Update tabel langsung untuk memastikan tampilan segera refresh
        renderPromoTable(filteredPromos);
        
        showToast('Promo berhasil dihapus.');
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus promo.', 'danger');
    }
}

async function clearAllPromos() {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA promo? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
        await db.ref('boxplay/promos').set([]);
        localStorage.removeItem('pb_promos');
        
        // Update tabel langsung
        renderPromoTable([]);
        
        showToast('Semua promo berhasil dihapus.');
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus semua promo.', 'danger');
    }
}

// --- CUSTOMER MANAGEMENT ---
function listenCustomerUpdates() {
    db.ref('boxplay/customers').on('value', (snapshot) => {
        const customers = snapshot.val() || [];
        renderCustomerTable(customers);
    });
}

function renderCustomerTable(customers) {
    const body = document.getElementById('customer-table-body');
    if (!body) return;

    const customerList = Array.isArray(customers) ? customers : Object.values(customers);

    if (customerList.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:2rem; text-align:center; color:var(--muted);">Belum ada data customer.</td></tr>';
        return;
    }

    body.innerHTML = customerList.map((customer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${customer.name}</strong></td>
            <td>${customer.email || '-'}</td>
            <td>${customer.phone}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick='openEditCustomerModal(${JSON.stringify(customer)})' style="padding: 0.5rem; color: var(--accent);">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="deleteCustomer('${customer.id}')" style="padding: 0.5rem; color: var(--danger);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleAddCustomer() {
    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();

    if (!name || !phone) {
        showToast('Nama dan No HP wajib diisi.', 'danger');
        return;
    }

    try {
        const snapshot = await db.ref('boxplay/customers').once('value');
        let currentCustomers = snapshot.val() || [];
        if (!Array.isArray(currentCustomers)) currentCustomers = Object.values(currentCustomers);
        
        const customerId = `cust-${Date.now()}`;
        const newCustomer = {
            id: customerId,
            name,
            email,
            phone,
            address,
            createdAt: Date.now()
        };
        
        currentCustomers.push(newCustomer);
        await db.ref('boxplay/customers').set(currentCustomers);
        
        showToast('Data customer berhasil disimpan!');
        closeModal('add-customer-modal');
        document.getElementById('add-customer-form').reset();
    } catch (error) {
        console.error(error);
        showToast('Gagal menyimpan data customer.', 'danger');
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('Apakah Anda yakin ingin menghapus data customer ini?')) return;

    try {
        const snapshot = await db.ref('boxplay/customers').once('value');
        let currentCustomers = snapshot.val() || [];
        if (!Array.isArray(currentCustomers)) currentCustomers = Object.values(currentCustomers);
        
        const filteredCustomers = currentCustomers.filter(c => c.id !== customerId);
        await db.ref('boxplay/customers').set(filteredCustomers);
        
        showToast('Data customer berhasil dihapus.');
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus data customer.', 'danger');
    }
}

function openEditCustomerModal(customer) {
    // Untuk saat ini kita hanya implementasi tambah dan hapus, 
    // jika ingin edit bisa ditambahkan form hidden ID seperti promo
    showToast('Fitur edit customer akan segera hadir.', 'info');
}

function initDisplayPage() {
    listenDisplayRealtime();
}

function listenDisplayRealtime() {
    const refs = getQueueRefs();

    // 1. Listen untuk antrian yang sedang dipanggil (panggilan utama)
    refs.items.orderByChild('status').equalTo('playing').limitToLast(1).on('value', (snapshot) => {
        const callingNum = document.getElementById('display-current-number');
        const callingName = document.getElementById('display-current-name');
        const callingBranch = document.getElementById('display-current-branch');
        const callingCard = document.querySelector('.calling-card');

        if (snapshot.exists()) {
            const data = Object.values(snapshot.val())[0];
            const prevNum = callingNum ? callingNum.textContent : '--';
            const newNum = String(data.number).padStart(2, '0');

            if (callingNum) callingNum.textContent = newNum;
            if (callingName) callingName.textContent = data.name;
            if (callingBranch) callingBranch.textContent = data.branch;

            // Trigger suara panggilan jika nomor berubah
            if (prevNum !== newNum && prevNum !== '--') {
                playCallSound(data.number);
            }

            if (callingCard) callingCard.classList.add('calling-active');
        } else {
            if (callingNum) callingNum.textContent = '--';
            if (callingName) callingName.textContent = 'Menunggu...';
            if (callingBranch) callingBranch.textContent = 'SEMUA CABANG';
            if (callingCard) callingCard.classList.remove('calling-active');
        }
    });

    // 2. Listen untuk daftar antrian waiting
    refs.items.orderByChild('createdAt').on('value', (snapshot) => {
        const body = document.getElementById('display-waiting-list');
        if (!body) return;

        const allItems = snapshot.val() ? Object.values(snapshot.val()) : [];
        const waitingItems = allItems
            .filter(item => item.status === 'waiting')
            .sort((a, b) => a.number - b.number)
            .slice(0, 8); // Ambil 8 antrian pertama saja agar tidak kepanjangan

        if (waitingItems.length === 0) {
            body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:2rem; color:var(--muted);">Tidak ada antrian menunggu.</td></tr>';
            return;
        }

        body.innerHTML = waitingItems.map(item => `
            <tr>
                <td style="font-size:1.5rem; font-weight:800; color:var(--accent);">${String(item.number).padStart(2, '0')}</td>
                <td style="font-weight:600;">${item.name}</td>
                <td><span class="tag" style="font-size:0.8rem;">${item.branch}</span></td>
            </tr>
        `).join('');
    });
}

function playCallSound(number) {
    // Implementasi TTS (Text to Speech) sederhana
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Nomor antrian ${number}, silakan menuju kasir.`;
        msg.lang = 'id-ID';
        msg.rate = 0.9;
        window.speechSynthesis.speak(msg);
    }
}

async function processBooking() {
    const nameInput = document.getElementById('booking-name');
    const phoneInput = document.getElementById('booking-phone');
    if (!nameInput || !phoneInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
        showToast('Nama wajib diisi.', 'danger');
        nameInput.focus();
        return;
    }
    if (!validatePhone(phone)) {
        showToast('Nomor HP harus format Indonesia (08xxxxxxxx).', 'danger');
        phoneInput.focus();
        return;
    }

    // General queue booking
    const branchInput = document.getElementById('booking-branch');
    const branch = branchInput ? branchInput.value : '';

    if (!branch) {
        showToast('Pilih cabang terlebih dahulu.', 'danger');
        if (branchInput) branchInput.focus();
        return;
    }

    try {
        const refs = getQueueRefs();
        const queueNumber = await reserveQueueNumber();

        const bookingId = `q-${Date.now()}`;
        const bookingData = {
            id: bookingId,
            name,
            phone: phone.replace(/\D/g, ''),
            branch,
            number: queueNumber,
            status: 'waiting',
            createdAt: Date.now()
        };

        await refs.items.child(bookingId).set(bookingData);
        sessionStorage.setItem('latestBooking', JSON.stringify(bookingData));

        showToast(`Nomor antrian berhasil dibuat: ${String(queueNumber).padStart(2, '0')}`);
        setTimeout(() => navigateTo('waiting.html'), 900);

    } catch (error) {
        console.error(error);
        showToast('Terjadi kesalahan saat membuat antrian. Coba lagi.', 'danger');
    }
}


function reserveQueueNumber() {
    const refs = getQueueRefs();
    return refs.meta.transaction((current) => {
        const today = getTodayKey();
        if (!current || current.date !== today) {
            return {
                date: today,
                lastNumber: 1,
                currentNumber: 0,
                updatedAt: Date.now()
            };
        }
        return {
            ...current,
            lastNumber: (current.lastNumber || 0) + 1,
            updatedAt: Date.now()
        };
    }).then((result) => {
        if (!result.committed || !result.snapshot.exists()) {
            throw new Error('Gagal mengamankan nomor antrian.');
        }
        return result.snapshot.val().lastNumber;
    });
}

function listenQueueUpdates() {
    const refs = getQueueRefs();
    refs.items.on('value', (snapshot) => {
        const items = snapshot.val() || {};
        renderQueueTable(items);
        renderQueueSummary(items);
    });
    refs.meta.on('value', (snapshot) => {
        const meta = snapshot.val() || {};
        const todayKey = document.getElementById('today-key');
        if (todayKey) {
            todayKey.textContent = meta.date || getTodayKey();
        }
        if (!meta.date) {
            refs.meta.set({ date: getTodayKey(), lastNumber: 0, currentNumber: 0, updatedAt: Date.now() });
        }
    });
}

function renderQueueSummary(items = {}) {
    const list = Object.values(items);
    const waiting = list.filter((item) => item.status === 'waiting').length;
    const playing = list.filter((item) => item.status === 'playing').length;
    const done = list.filter((item) => item.status === 'done').length;
    const waitingEl = document.getElementById('summary-waiting');
    const playingEl = document.getElementById('summary-playing');
    const doneEl = document.getElementById('summary-done');
    if (waitingEl) waitingEl.textContent = waiting;
    if (playingEl) playingEl.textContent = playing;
    if (doneEl) doneEl.textContent = done;
}

function renderQueueTable(items = {}) {
    const body = document.getElementById('queue-table-body');
    if (!body) return;
    const list = Object.values(items).sort((a, b) => a.number - b.number);
    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:2rem; text-align:center; color:var(--muted);">Belum ada antrian hari ini.</td></tr>';
        return;
    }
    body.innerHTML = list.map((item) => {
        const statusClass = item.status === 'waiting' ? 'status-waiting' : item.status === 'playing' ? 'status-playing' : 'status-done';
        const canCall = item.status === 'waiting';
        const canDone = item.status === 'playing';
        return `
            <tr>
                <td><strong>${String(item.number).padStart(2, '0')}</strong></td>
                <td>${item.name}</td>
                <td>${getDisplayPhone(item.phone)}</td>
                <td><span class="status-chip ${statusClass}">${item.status}</span></td>
                <td>${new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style="display:flex; gap:0.65rem; flex-wrap:wrap;">
                    <button class="btn btn-secondary" ${!canCall ? 'disabled' : ''} onclick="callQueue('${item.id}')">Panggil</button>
                    <button class="btn btn-secondary" ${!canDone ? 'disabled' : ''} onclick="completeQueue('${item.id}')">Selesai</button>
                </td>
            </tr>`;
    }).join('');
}

function callQueue(queueId) {
    const refs = getQueueRefs();
    refs.items.child(queueId).once('value').then((snapshot) => {
        const item = snapshot.val();
        if (!item || item.status !== 'waiting') {
            showToast('Antrian tidak dapat dipanggil.', 'danger');
            return;
        }
        refs.items.child(queueId).update({ status: 'playing', calledAt: Date.now() });
        refs.meta.update({ currentNumber: item.number, updatedAt: Date.now() });
        showToast(`Nomor ${String(item.number).padStart(2, '0')} dipanggil.`);
    });
}

function completeQueue(queueId) {
    const refs = getQueueRefs();
    refs.items.child(queueId).once('value').then((snapshot) => {
        const item = snapshot.val();
        if (!item || item.status !== 'playing') {
            showToast('Antrian tidak dapat diselesaikan.', 'danger');
            return;
        }
        refs.items.child(queueId).update({ status: 'done', doneAt: Date.now() });
        showToast(`Nomor ${String(item.number).padStart(2, '0')} selesai.`);
    });
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (username === APP_CONFIG.admin.username && password === APP_CONFIG.admin.password) {
        sessionStorage.setItem('boxplay_admin', 'true');
        navigateTo('admin.html');
    } else {
        showToast('Username atau password tidak benar.', 'danger');
    }
}

function logout() {
    sessionStorage.removeItem('boxplay_admin');
    navigateTo('login.html');
}

function toggleMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Close menu when clicking outside
        if (mobileMenu.classList.contains('active')) {
            document.addEventListener('click', closeMenuOnClickOutside);
        } else {
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }
}

function toggleDropdown(event) {
    event.preventDefault();
    const dropdown = event.currentTarget.closest('.dropdown');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu.active').forEach(m => {
        if (m !== menu) m.classList.remove('active');
    });
    
    menu.classList.toggle('active');
    
    // Close on click outside
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target)) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeDropdown);
        }
    };
    document.addEventListener('click', closeDropdown);
}

function closeMenuOnClickOutside(event) {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

function readImageFileInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return null;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(input.files[0]);
    });
}

function updateImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!preview) return;

    if (input && input.files && input.files[0]) {
        preview.src = URL.createObjectURL(input.files[0]);
        preview.hidden = false;
    } else {
        preview.hidden = true;
        preview.src = '';
    }
}

function clearImagePreview(previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    preview.hidden = true;
    preview.src = '';
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

window.showAddCustomerModal = () => showModal('add-customer-modal');
window.showAddPromoModal = window.showAddPromoModal; // Pastikan menggunakan fungsi yang sudah di-update
window.openEditPromoModal = openEditPromoModal; // Ekspos fungsi edit ke global
window.deletePromo = deletePromo;

// === UNIT & CABANG MANAGEMENT ===

window.showAddBranchModal = () => {
    const form = document.getElementById('add-branch-form');
    if (form) form.reset();
    clearImagePreview('branch-image-preview');
    showModal('add-branch-modal');
};

window.showAddUnitModal = () => {
    const form = document.getElementById('add-unit-form');
    if (form) form.reset();
    clearImagePreview('unit-image-preview');
    
    // Populate branch options
    const branchSelect = document.getElementById('unit-branch');
    if (branchSelect) {
        branchSelect.innerHTML = '<option value="">Pilih cabang...</option>' + 
            APP_CONFIG.branches.map(branch => `<option value="${branch}">${branch}</option>`).join('');
    }
    
    showModal('add-unit-modal');
};

async function handleAddBranch() {
    const name = document.getElementById('branch-name').value.trim();
    const address = document.getElementById('branch-address').value.trim();
    const image = await readImageFileInput('branch-image');
    const code = document.getElementById('branch-code').value.trim().toUpperCase();

    if (!name || !address || !image || !code) {
        showToast('Harap isi semua field.', 'danger');
        return;
    }

    if (code.length !== 2) {
        showToast('Kode unit harus 2 huruf.', 'danger');
        return;
    }

    try {
        // Add to APP_CONFIG.branches
        if (!APP_CONFIG.branches.includes(name)) {
            APP_CONFIG.branches.push(name);
        }

        // Save branch data to localStorage
        const branchData = {
            name,
            address,
            image,
            code,
            createdAt: Date.now()
        };

        let branches = JSON.parse(localStorage.getItem('pb_branches')) || [];
        branches.push(branchData);
        localStorage.setItem('pb_branches', JSON.stringify(branches));

        // Save to Firebase
        if (typeof db !== 'undefined') {
            await db.ref('boxplay/branches').set(APP_CONFIG.branches);
            await db.ref('boxplay/branchData').set(branches);
        }

        showToast('Cabang berhasil ditambahkan!');
        closeModal('add-branch-modal');
        
        // Refresh displays
        renderBranchesGrid();
        updateBranchOptions();
        
    } catch (error) {
        console.error(error);
        showToast('Gagal menambah cabang.', 'danger');
    }
}

async function handleAddUnit() {
    const branch = document.getElementById('unit-branch').value;
    const name = document.getElementById('unit-name').value.trim();
    const image = await readImageFileInput('unit-image') || 'foto_boxplay/unitps.jpg';

    if (!branch || !name) {
        showToast('Harap isi cabang dan nama unit.', 'danger');
        return;
    }

    try {
        // Get current units
        let units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
        
        // Generate new ID
        const maxId = Math.max(...units.map(u => u.id), 0);
        const newId = maxId + 1;

        const newUnit = {
            id: newId,
            name,
            type: 'PS4',
            branch,
            status: 'idle',
            customer: '',
            startTime: null,
            elapsed: 0,
            image
        };

        units.push(newUnit);
        localStorage.setItem('pb_units', JSON.stringify(units));

        // Save to Firebase
        if (typeof db !== 'undefined') {
            await db.ref('boxplay/units').set(units);
        }

        showToast('Unit berhasil ditambahkan!');
        closeModal('add-unit-modal');
        
        // Refresh displays
        renderUnitsTable();
        
    } catch (error) {
        console.error(error);
        showToast('Gagal menambah unit.', 'danger');
    }
}

function renderBranchesGrid() {
    const container = document.getElementById('branches-grid');
    if (!container) return;

    const branches = JSON.parse(localStorage.getItem('pb_branches')) || [];
    
    if (branches.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--muted);">Belum ada cabang. Tambah cabang pertama!</p>';
        return;
    }

    container.innerHTML = branches.map(branch => `
        <div class="card" style="padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; background: var(--bg-secondary);">
                    <img src="${branch.image}" alt="${branch.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='foto_boxplay/unitps.jpg'">
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: var(--text);">${branch.name}</h4>
                    <p style="margin: 0.5rem 0 0 0; color: var(--muted); font-size: 0.9rem;">Kode: ${branch.code}</p>
                </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${branch.address}</p>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" onclick="editBranch('${branch.name}')" style="flex: 1; padding: 0.5rem;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBranch('${branch.name}')" style="padding: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderUnitsTable() {
    const body = document.getElementById('units-table-body');
    if (!body) return;

    const units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
    
    body.innerHTML = units.map(unit => `
        <tr>
            <td>${unit.id}</td>
            <td><strong>${unit.name}</strong></td>
            <td><span class="tag">${unit.branch}</span></td>
            <td><span class="status-chip ${unit.status === 'active' ? 'status-playing' : 'status-waiting'}">${unit.status === 'active' ? 'Digunakan' : 'Ready'}</span></td>
            <td>
                <div style="width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
                    <img src="${unit.image || 'foto_boxplay/unitps.jpg'}" alt="${unit.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='foto_boxplay/unitps.jpg'">
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="editUnit(${unit.id})" style="padding: 0.5rem; color: var(--accent);">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="deleteUnit(${unit.id})" style="padding: 0.5rem; color: var(--danger);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function deleteBranch(branchName) {
    if (!confirm(`Apakah Anda yakin ingin menghapus cabang "${branchName}"? Semua unit di cabang ini juga akan dihapus.`)) return;

    try {
        // Remove from APP_CONFIG.branches
        APP_CONFIG.branches = APP_CONFIG.branches.filter(b => b !== branchName);

        // Remove from localStorage branches
        let branches = JSON.parse(localStorage.getItem('pb_branches')) || [];
        branches = branches.filter(b => b.name !== branchName);
        localStorage.setItem('pb_branches', JSON.stringify(branches));

        // Remove units from this branch
        let units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
        units = units.filter(u => u.branch !== branchName);
        localStorage.setItem('pb_units', JSON.stringify(units));

        // Save to Firebase
        if (typeof db !== 'undefined') {
            await db.ref('boxplay/branches').set(APP_CONFIG.branches);
            await db.ref('boxplay/branchData').set(branches);
            await db.ref('boxplay/units').set(units);
        }

        showToast('Cabang dan unit berhasil dihapus!');
        
        // Refresh displays
        renderBranchesGrid();
        renderUnitsTable();
        updateBranchOptions();
        
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus cabang.', 'danger');
    }
}

async function deleteUnit(unitId) {
    if (!confirm('Apakah Anda yakin ingin menghapus unit ini?')) return;

    try {
        let units = JSON.parse(localStorage.getItem('pb_units')) || defaultUnits;
        units = units.filter(u => u.id !== unitId);
        localStorage.setItem('pb_units', JSON.stringify(units));

        // Save to Firebase
        if (typeof db !== 'undefined') {
            await db.ref('boxplay/units').set(units);
        }

        showToast('Unit berhasil dihapus!');
        renderUnitsTable();
        
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus unit.', 'danger');
    }
}

function updateBranchOptions() {
    // Update any select elements that depend on branches
    const selects = document.querySelectorAll('select[id*="branch"]');
    selects.forEach(select => {
        if (select.id === 'unit-branch') {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Pilih cabang...</option>' + 
                APP_CONFIG.branches.map(branch => `<option value="${branch}" ${branch === currentValue ? 'selected' : ''}>${branch}</option>`).join('');
        }
    });
}

// Placeholder functions for edit (can be implemented later)
function editBranch(branchName) {
    showToast('Fitur edit cabang akan segera hadir!', 'info');
}

function editUnit(unitId) {
    showToast('Fitur edit unit akan segera hadir!', 'info');
}

// === INITIALIZATION ===
function initDashboardPage() {
    // Load initial data
    ensureDefaultBranchData();
    renderBranchesGrid();
    renderUnitsTable();
    
    // Setup form handlers
    const branchForm = document.getElementById('add-branch-form');
    if (branchForm) {
        branchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddBranch();
        });
        branchForm.addEventListener('reset', () => clearImagePreview('branch-image-preview'));
    }
    
    const unitForm = document.getElementById('add-unit-form');
    if (unitForm) {
        unitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddUnit();
        });
        unitForm.addEventListener('reset', () => clearImagePreview('unit-image-preview'));
    }

    const branchImageInput = document.getElementById('branch-image');
    if (branchImageInput) branchImageInput.addEventListener('change', () => updateImagePreview('branch-image', 'branch-image-preview'));

    const unitImageInput = document.getElementById('unit-image');
    if (unitImageInput) unitImageInput.addEventListener('change', () => updateImagePreview('unit-image', 'unit-image-preview'));
    
    // Load existing data from Firebase if available
    if (typeof db !== 'undefined') {
        db.ref('boxplay/branches').on('value', (snapshot) => {
            const branches = snapshot.val();
            if (branches && Array.isArray(branches)) {
                APP_CONFIG.branches = branches;
                updateBranchOptions();
            }
        });
        
        db.ref('boxplay/branchData').on('value', (snapshot) => {
            const branchData = snapshot.val();
            if (branchData) {
                localStorage.setItem('pb_branches', JSON.stringify(branchData));
                renderBranchesGrid();
            }
        });
        
        db.ref('boxplay/units').on('value', (snapshot) => {
            const units = snapshot.val();
            if (units) {
                localStorage.setItem('pb_units', JSON.stringify(units));
                renderUnitsTable();
            }
        });
    }
}
window.clearAllPromos = clearAllPromos;
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;

window.callQueue = callQueue;
window.completeQueue = completeQueue;
window.navigateTo = navigateTo;
window.toggleMenu = toggleMenu;

document.addEventListener('DOMContentLoaded', initPage);
