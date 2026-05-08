// Firebase & app logic
const APP_CONFIG = {
    admin: { username: 'admin', password: '12345' },
    branches: ['NUD CAFE', 'PALIO SPITIO', 'PIRZY', 'WAROENG RADEN']
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

function setPromoSlide(index) {
    const slides = document.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.promo-slider-dot');
    if (!slides.length || !dots.length) return;
    promoSliderIndex = index % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === promoSliderIndex));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === promoSliderIndex));
}

function initPromoSlider() {
    const dots = document.querySelectorAll('.promo-slider-dot');
    if (!dots.length) return;
    setPromoSlide(0);
    dots.forEach((dot, idx) => dot.addEventListener('click', () => setPromoSlide(idx)));
    setInterval(() => setPromoSlide((promoSliderIndex + 1) % dots.length), 5500);
}

function initPage() {
    const pageType = document.body.dataset.page;
    if (pageType === 'home') initHomePage();
    if (pageType === 'booking') initBookingPage();
    if (pageType === 'waiting') initWaitingPage();
    if (pageType === 'login') initLoginPage();
    if (pageType === 'dashboard') initDashboardPage();
    if (pageType === 'display') initDisplayPage();
    if (pageType === 'cabang') initCabangPage(); // Tambahkan ini
    if (pageType === 'portfolio') initPortfolioPage(); // Tambahkan ini
    if (pageType === 'about') initAboutPage(); // Tambahkan ini
    
    // Compatibility with script.js initialization
    if (typeof initApp === 'function') initApp();
}

function initCabangPage() {
    const units = JSON.parse(localStorage.getItem('pb_units')) || [];
    
    renderBranchUnits(units, 'NUD CAFE', 'nud-units-grid');
    renderBranchUnits(units, 'PALIO SPITI', 'palio-units-grid');
    renderBranchUnits(units, 'PIRZY', 'pirzy-units-grid');
    renderBranchUnits(units, 'WAROENG RADEN', 'waroeng-units-grid');
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
        <div class="promo-slide ${idx === 0 ? 'active' : ''}" style="background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);">
            <div class="promo-content">
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
}

function initBookingPage() {
    const branchSelect = document.getElementById('booking-branch');
    const unitSelect = document.getElementById('booking-unit');
    const unitSelectionSection = document.getElementById('unit-selection-section');
    const branchSelectionSection = document.getElementById('branch-selection-section');
    const unitSelectionAltSection = document.getElementById('unit-selection-section-alt');

    // Check if specific unit was selected from home page
    const selectedUnitData = sessionStorage.getItem('pb_temp_data');

    if (selectedUnitData) {
        // Hide branch selection, show unit selection
        branchSelectionSection.style.display = 'none';
        unitSelectionAltSection.style.display = 'none';
        unitSelectionSection.style.display = 'block';

        // Parse unit data (format: "Unit 01 (NUD CAFE)")
        const unitMatch = selectedUnitData.match(/Unit (\d+) \((.+)\)/);
        if (unitMatch) {
            const unitNumber = parseInt(unitMatch[1]);
            const branchName = unitMatch[2];

            // Find the unit in our data
            const units = JSON.parse(localStorage.getItem('pb_units')) || [];
            const selectedUnit = units.find(u => u.id === unitNumber && u.branch === branchName);

            if (selectedUnit) {
                document.getElementById('selected-unit-label').textContent = `${selectedUnit.name} - ${selectedUnit.branch}`;

                // Store unit info for booking
                sessionStorage.setItem('pb_selected_unit', JSON.stringify(selectedUnit));
            }
        }
    } else {
        // Show branch and unit selection for general booking
        unitSelectionSection.style.display = 'none';
        branchSelectionSection.style.display = 'block';
        unitSelectionAltSection.style.display = 'block';

        // Populate branch select
        if (branchSelect) {
            branchSelect.innerHTML = APP_CONFIG.branches.map(branch => `<option value="${branch}">${branch}</option>`).join('');
        }

        // Populate unit select based on branch
        if (branchSelect && unitSelect) {
            branchSelect.addEventListener('change', function() {
                const selectedBranch = this.value;
                const units = JSON.parse(localStorage.getItem('pb_units')) || [];
                const branchUnits = units.filter(u => u.branch === selectedBranch && u.status === 'idle');

                unitSelect.innerHTML = branchUnits.map(unit =>
                    `<option value="${unit.id}">Unit ${unit.id} - ${unit.name}</option>`
                ).join('');
            });

            // Trigger change to populate units for first branch
            branchSelect.dispatchEvent(new Event('change'));
        }
    }

    const form = document.getElementById('booking-form');
    if (form) form.addEventListener('submit', (event) => {
        event.preventDefault();
        processBooking();
    });
}

function initWaitingPage() {
    const booking = sessionStorage.getItem('latestBooking');
    if (!booking) {
        document.getElementById('waiting-content').innerHTML = '<p class="section-subtitle">Data antrian tidak ditemukan. Silakan kembali ke beranda dan buat antrian baru.</p>';
        return;
    }

    const latestBooking = JSON.parse(booking);

    // Check if this is a direct unit booking or queue booking
    if (latestBooking.unitId && latestBooking.status === 'active') {
        // Direct unit booking
        document.querySelector('#waiting-content h2').textContent = 'Unit Berhasil Dipesan!';
        document.querySelector('#waiting-content .section-subtitle').textContent = 'Unit PlayStation Anda sudah siap digunakan. Selamat bermain!';

        const numberDisplay = document.getElementById('waiting-number');
        const numberLabel = numberDisplay.previousElementSibling;

        // Change "Nomor Antrian" to "Unit Dipesan"
        numberLabel.textContent = 'Unit Dipesan';
        numberDisplay.textContent = latestBooking.unitName;
        numberDisplay.style.fontSize = '2.5rem'; // Smaller font for unit name

        document.getElementById('display-name').textContent = latestBooking.name;
        document.getElementById('display-phone').textContent = getDisplayPhone(latestBooking.phone);
        document.getElementById('display-branch').textContent = latestBooking.branch;

        // Add unit-specific info
        const infoDiv = document.querySelector('.page-card div[style*="display:grid"]');
        const unitInfo = document.createElement('div');
        unitInfo.innerHTML = `<strong>Status:</strong> <span style="color: var(--success);">Aktif - Siap Bermain</span>`;
        infoDiv.appendChild(unitInfo);

    } else {
        // Queue booking (existing logic)
        document.getElementById('waiting-number').textContent = String(latestBooking.number).padStart(2, '0');
        document.getElementById('display-name').textContent = latestBooking.name;
        document.getElementById('display-phone').textContent = getDisplayPhone(latestBooking.phone);
        document.getElementById('display-branch').textContent = latestBooking.branch;
    }
}

function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
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

    // Inisialisasi form promo
    const promoForm = document.getElementById('add-promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddPromo();
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

    // Pastikan promos adalah array
    const promoList = Array.isArray(promos) ? promos : Object.values(promos);

    body.innerHTML = promoList.map((promo, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${promo.title}</strong></td>
            <td>${promo.desc || promo.description}</td>
            <td>${promo.discount || 0}%</td>
            <td><span class="status-chip ${promo.status === 'active' ? 'status-playing' : 'status-done'}">${promo.status}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="deletePromo('${promo.id || index}')" style="padding: 0.5rem; color: var(--danger);">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleAddPromo() {
    const title = document.getElementById('promo-title').value.trim();
    const desc = document.getElementById('promo-description').value.trim();
    const discount = document.getElementById('promo-discount').value;
    const status = document.getElementById('promo-status').value;

    if (!title || !desc) {
        showToast('Harap isi judul dan deskripsi promo.', 'danger');
        return;
    }

    const newPromo = {
        id: `promo-${Date.now()}`,
        tag: discount > 0 ? `${discount}% OFF` : 'SPECIAL',
        title: title,
        desc: desc,
        discount: parseInt(discount),
        status: status,
        icon: 'fas fa-tag',
        color: 'promo-1',
        createdAt: Date.now()
    };

    try {
        // Ambil data lama dari Firebase
        const snapshot = await db.ref('boxplay/promos').once('value');
        let currentPromos = snapshot.val() || [];
        if (!Array.isArray(currentPromos)) currentPromos = Object.values(currentPromos);
        
        currentPromos.push(newPromo);
        
        // Simpan kembali ke Firebase
        await db.ref('boxplay/promos').set(currentPromos);
        
        showToast('Promo berhasil ditambahkan!');
        closeModal('add-promo-modal');
        document.getElementById('add-promo-form').reset();
    } catch (error) {
        console.error(error);
        showToast('Gagal menambahkan promo.', 'danger');
    }
}

async function deletePromo(promoId) {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;

    try {
        const snapshot = await db.ref('boxplay/promos').once('value');
        let currentPromos = snapshot.val() || [];
        if (!Array.isArray(currentPromos)) currentPromos = Object.values(currentPromos);
        
        const filteredPromos = currentPromos.filter(p => (p.id || currentPromos.indexOf(p).toString()) !== promoId.toString());
        
        await db.ref('boxplay/promos').set(filteredPromos);
        showToast('Promo berhasil dihapus.');
    } catch (error) {
        console.error(error);
        showToast('Gagal menghapus promo.', 'danger');
    }
}

function initDisplayPage() {
    const currentText = document.getElementById('display-current-number');
    const currentStatus = document.getElementById('display-status');
    const currentNote = document.getElementById('display-note');
    const refs = getQueueRefs();
    refs.meta.on('value', (snapshot) => {
        const value = snapshot.val();
        if (!value || !value.currentNumber) {
            currentText.textContent = '--';
            currentStatus.textContent = 'Menunggu panggilan';
            currentNote.textContent = 'Silakan bersiap, nomor akan muncul otomatis.';
            return;
        }
        currentText.textContent = String(value.currentNumber).padStart(2, '0');
        currentStatus.textContent = 'Sedang dipanggil';
        currentNote.textContent = 'Mohon segera menuju kasir atau area layanan.';
    });
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

    // Check if specific unit booking
    const selectedUnitData = sessionStorage.getItem('pb_selected_unit');
    if (selectedUnitData) {
        // Unit-specific booking
        const selectedUnit = JSON.parse(selectedUnitData);

        try {
            // Check if unit is still available
            const units = JSON.parse(localStorage.getItem('pb_units')) || [];
            const currentUnit = units.find(u => u.id === selectedUnit.id);

            if (!currentUnit || currentUnit.status !== 'idle') {
                showToast('Unit sudah dipesan orang lain. Silakan pilih unit lain.', 'danger');
                return;
            }

            // Book the unit
            const bookingId = `booking-${Date.now()}`;
            const bookingData = {
                id: bookingId,
                unitId: selectedUnit.id,
                name,
                phone: phone.replace(/\D/g, ''),
                branch: selectedUnit.branch,
                unitName: selectedUnit.name,
                status: 'active',
                startTime: Date.now(),
                createdAt: Date.now()
            };

            // Update unit status
            currentUnit.status = 'active';
            currentUnit.customer = name;
            currentUnit.startTime = Date.now();
            currentUnit.elapsed = 0;

            // Save to localStorage
            localStorage.setItem('pb_units', JSON.stringify(units));

            // Save booking to active orders
            const activeOrders = JSON.parse(localStorage.getItem('pb_active_orders')) || [];
            activeOrders.push(bookingData);
            localStorage.setItem('pb_active_orders', JSON.stringify(activeOrders));

            // Store booking info for waiting page
            sessionStorage.setItem('latestBooking', JSON.stringify({
                ...bookingData,
                number: selectedUnit.id // Use unit ID as queue number
            }));

            showToast(`Unit ${selectedUnit.name} berhasil dipesan!`, 'success');
            setTimeout(() => navigateTo('waiting.html'), 900);

        } catch (error) {
            console.error('Unit booking error:', error);
            showToast('Terjadi kesalahan saat booking unit. Coba lagi.', 'danger');
        }
    } else {
        // General queue booking
        const branchInput = document.getElementById('booking-branch');
        const unitInput = document.getElementById('booking-unit');
        const branch = branchInput ? branchInput.value : '';
        const unitId = unitInput ? unitInput.value : '';

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
                unitId: unitId ? parseInt(unitId) : null,
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
        navigateTo('dashboard.html');
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

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

window.showAddCustomerModal = () => showModal('add-customer-modal');
window.showAddPromoModal = () => showModal('add-promo-modal');
window.deletePromo = deletePromo; // Ekspos fungsi delete ke global
window.closeModal = closeModal;
window.scrollToSection = scrollToSection;

window.callQueue = callQueue;
window.completeQueue = completeQueue;
window.navigateTo = navigateTo;
window.toggleMenu = toggleMenu;

document.addEventListener('DOMContentLoaded', initPage);
