// ——— Session utilisateur ———
function checkSession() {
    const user = JSON.parse(localStorage.getItem('jewelsUser') || 'null');
    const loginBtn = document.querySelector('.btn-login');
    if (!loginBtn) return;
    if (user) {
        const initials = (user.prenom ? user.prenom[0] : '') + (user.nom ? user.nom[0] : user.email[0]);
        loginBtn.outerHTML = `
            <div class="user-menu-wrap" id="userMenuWrap">
                <button class="user-avatar-btn" id="userAvatarBtn" onclick="toggleUserMenu()">
                    <span class="user-initials">${initials.toUpperCase()}</span>
                    <span class="user-name-short">${user.prenom || user.email.split('@')[0]}</span>
                    <i class="fas fa-chevron-down" style="font-size:1rem;color:#555;"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <span class="ud-name">${user.prenom ? user.prenom + ' ' + (user.nom || '') : user.email}</span>
                        <span class="ud-email">${user.email}</span>
                    </div>
                    <a href="html/panier.html" class="ud-item"><i class="fas fa-shopping-bag"></i> Mon panier</a>
                    <a href="#" class="ud-item"><i class="fas fa-box"></i> Mes commandes</a>
                    <div class="ud-divider"></div>
                    <button class="ud-item ud-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Déconnexion</button>
                </div>
            </div>`;
    }
}
function toggleUserMenu() {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.toggle('open');
}
function logout() {
    localStorage.removeItem('jewelsUser');
    location.reload();
}
document.addEventListener('click', function(e) {
    const wrap = document.getElementById('userMenuWrap');
    if (wrap && !wrap.contains(e.target)) {
        const dd = document.getElementById('userDropdown');
        if (dd) dd.classList.remove('open');
    }
});
checkSession();

// ——— Header scroll hide/show ———
let lastScroll = 0;
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
    let currentScroll = window.pageYOffset;
    header.style.top = currentScroll > lastScroll ? "-100px" : "0";
    lastScroll = currentScroll;
});

// ——— Scroll arrows ———
function scrollLeft(id) {
    document.getElementById(id).scrollBy({ left: -340, behavior: 'smooth' });
}
function scrollRight(id) {
    document.getElementById(id).scrollBy({ left: 340, behavior: 'smooth' });
}

// ——— Category tabs ———
const tabs = document.querySelectorAll('.tab-btn');
const blocks = document.querySelectorAll('.collection-block');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.category;
        blocks.forEach(block => {
            if (cat === 'all') {
                block.style.display = 'block';
            } else {
                const id = block.id;
                block.style.display = id.includes(cat) ? 'block' : 'none';
            }
        });
    });
});

// ——— Panier (localStorage) ———
function getCart() {
    return JSON.parse(localStorage.getItem('panierJewels') || '[]');
}
function saveCart(cart) {
    localStorage.setItem('panierJewels', JSON.stringify(cart));
}
function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;
    let badge = cartIcon.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(badge);
    }
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}
function showToast(msg) {
    const toast = document.getElementById('cartToast');
    document.getElementById('cartToastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

document.querySelectorAll('.card-buy').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.product-card');
        const name = card.querySelector('.card-name').textContent.trim();
        const priceText = card.querySelector('.card-price').textContent.trim();
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        const img = card.querySelector('img').src;
        const category = card.dataset.category;

        const cart = getCart();
        const existing = cart.find(i => i.name === name);
        if (existing) { existing.qty++; }
        else { cart.push({ name, price, img, category, qty: 1 }); }
        saveCart(cart);
        updateCartBadge();
        showToast(`"${name}" ajouté au panier !`);
    });
});

updateCartBadge();

// ——— Formulaire contact avec validation RegEx ———
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let valid = true;

        const name = document.getElementById('contactName').value.trim();
        const nameErr = document.getElementById('nameError');
        if (!/^[A-Za-zÀ-ÿ\s\-]{2,50}$/.test(name)) {
            nameErr.textContent = 'Veuillez entrer un nom valide (2-50 caractères).';
            valid = false;
         } else { nameErr.textContent = ''; }

        const email = document.getElementById('contactEmail').value.trim();
        const emailErr = document.getElementById('emailError');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            emailErr.textContent = 'Adresse email invalide.';
            valid = false;
        } else { emailErr.textContent = ''; }

        const phone = document.getElementById('contactPhone').value.trim();
        const phoneErr = document.getElementById('phoneError');
        if (phone && !/^[\+\d\s\-\(\)]{7,20}$/.test(phone)) {
            phoneErr.textContent = 'Numéro de téléphone invalide.';
            valid = false;
        } else { phoneErr.textContent = ''; }

        const msg = document.getElementById('contactMsg').value.trim();
        const msgErr = document.getElementById('msgError');
        if (msg.length < 10) {
            msgErr.textContent = 'Le message doit contenir au moins 10 caractères.';
            valid = false;
        } else { msgErr.textContent = ''; }

        if (valid) {
            contactForm.reset();
            const success = document.getElementById('contactSuccess');
            success.style.display = 'flex';
            setTimeout(() => success.style.display = 'none', 4000);
        }
    });
}

function openApercu(btn) {
    const card = btn.closest('.product-card');
    document.getElementById('apercuImg').src = card.querySelector('img').src;
    document.getElementById('apercuName').textContent = card.querySelector('.card-name').textContent;
    document.getElementById('apercuPrice').textContent = card.querySelector('.card-price').textContent;
    document.getElementById('apercuOverlay').classList.add('open');
}

function closeApercu(e) {
    if (!e || e.target === document.getElementById('apercuOverlay') || !e.target.closest)
        document.getElementById('apercuOverlay').classList.remove('open');
}