// ——— Données panier ———
function getCart() {
    return JSON.parse(localStorage.getItem('panierJewels') || '[]');
}
function saveCart(cart) {
    localStorage.setItem('panierJewels', JSON.stringify(cart));
}

let promoDiscount = 0;
const PROMO_CODES = { 'JEWELS10': 10, 'LUXE15': 15, 'VIP20': 20 };

function formatPrice(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

function renderCart() {
    const cart = getCart();
    const itemsEl = document.getElementById('panierItems');
    const emptyEl = document.getElementById('panierEmpty');
    const countEl = document.getElementById('panierCount');
    const chkBtn = document.getElementById('checkoutBtn');

    itemsEl.innerHTML = '';
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = totalQty + ' article' + (totalQty > 1 ? 's' : '');

    if (cart.length === 0) {
        emptyEl.style.display = 'block';
        chkBtn.disabled = true;
        updateSummary(0);
        return;
    }

    emptyEl.style.display = 'none';
    chkBtn.disabled = false;

    cart.forEach((item, idx) => {
        const subtotal = item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'panier-item';
        div.innerHTML = `
            <img class="panier-item-img" src="${item.img || ''}" alt="${item.name}"
                onerror="this.style.background='#f0ece6'; this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\'><rect width=\\'90\\' height=\\'90\\' fill=\\'%23f0ece6\\'/></svg>'">
            <div class="panier-item-info">
                <p class="panier-item-name">${item.name}</p>
                <p class="panier-item-cat">${item.category || ''}</p>
                <p class="panier-item-price-unit">${formatPrice(item.price)} / unité</p>
            </div>
            <div class="panier-item-controls">
                <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            </div>
            <div class="panier-item-subtotal">${formatPrice(subtotal)}</div>
            <button class="delete-btn" onclick="removeItem(${idx})" title="Supprimer">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        itemsEl.appendChild(div);
    });

    const rawTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    updateSummary(rawTotal);
}

function updateSummary(rawTotal) {
    const discounted = rawTotal * (1 - promoDiscount / 100);
    const tva = discounted * 0.20;
    const total = discounted + tva;

    document.getElementById('subtotalDisplay').textContent = formatPrice(rawTotal);
    document.getElementById('tvaDisplay').textContent = formatPrice(tva);
    document.getElementById('totalDisplay').textContent = formatPrice(total);
    document.getElementById('livraisonDisplay').textContent = rawTotal >= 150 ? 'Offerte' : '9,90 €';
}

function changeQty(idx, delta) {
    const cart = getCart();
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(cart);
    renderCart();
}

function removeItem(idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
}

function applyPromo() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('promoMsg');
    if (PROMO_CODES[code]) {
        promoDiscount = PROMO_CODES[code];
        msgEl.style.color = '#27ae60';
        msgEl.textContent = `✓ Code appliqué : -${promoDiscount}% de réduction !`;
        renderCart();
    } else {
        msgEl.style.color = '#e74c3c';
        msgEl.textContent = 'Code promo invalide.';
    }
}

// ——— CHECKOUT ———
function openCheckout() {
    const cart = getCart();
    if (cart.length === 0) return;
    document.getElementById('checkoutOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    goStep(1, false);
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

let currentStep = 1;

function goStep(step, validate = true) {
    if (validate && step > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    // Hide all sections
    document.querySelectorAll('.checkout-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => { s.classList.remove('active'); s.classList.remove('done'); });

    if (step === 'success') {
        document.getElementById('checkout-step-success').classList.add('active');
        document.querySelectorAll('.step').forEach(s => s.classList.add('done'));
        return;
    }

    document.getElementById('checkout-step-' + step).classList.add('active');
    currentStep = step;

    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById('step-indicator-' + i);
        if (i < step) el.classList.add('done');
        else if (i === step) el.classList.add('active');
    }

    if (step === 3) buildRecap();
}

function buildRecap() {
    const cart = getCart();
    const rawTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discounted = rawTotal * (1 - promoDiscount / 100);
    const tva = discounted * 0.20;
    const total = discounted + tva;

    let html = '<p class="order-recap-title">Vos articles</p>';
    cart.forEach(item => {
        html += `<div class="recap-item"><span>${item.name} × ${item.qty}</span><span>${formatPrice(item.price * item.qty)}</span></div>`;
    });
    if (promoDiscount > 0) {
        html += `<div class="recap-item" style="color:#27ae60;"><span>Réduction (${promoDiscount}%)</span><span>-${formatPrice(rawTotal * promoDiscount / 100)}</span></div>`;
    }
    html += `<div class="recap-total"><span>Total TTC</span><span>${formatPrice(total)}</span></div>`;
    document.getElementById('orderRecap').innerHTML = html;
}

function validateStep(step) {
    let ok = true;

    const clearErr = id => { const el = document.getElementById(id); if (el) el.textContent = ''; };
    const setErr = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg; ok = false; };

    if (step === 1) {
        clearErr('err-prenom'); clearErr('err-nom'); clearErr('err-email');
        clearErr('err-tel'); clearErr('err-adresse'); clearErr('err-ville'); clearErr('err-code');

        const prenom = document.getElementById('chkPrenom').value.trim();
        if (!/^[A-Za-zÀ-ÿ\s\-]{2,30}$/.test(prenom)) setErr('err-prenom', 'Prénom invalide.');

        const nom = document.getElementById('chkNom').value.trim();
        if (!/^[A-Za-zÀ-ÿ\s\-]{2,30}$/.test(nom)) setErr('err-nom', 'Nom invalide.');

        const email = document.getElementById('chkEmail').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) setErr('err-email', 'Email invalide.');

        const tel = document.getElementById('chkTel').value.trim();
        if (!/^[\+\d\s\-\(\)]{7,20}$/.test(tel)) setErr('err-tel', 'Téléphone invalide.');

        const adresse = document.getElementById('chkAdresse').value.trim();
        if (adresse.length < 5) setErr('err-adresse', 'Adresse trop courte.');

        const ville = document.getElementById('chkVille').value.trim();
        if (!/^[A-Za-zÀ-ÿ\s\-]{2,50}$/.test(ville)) setErr('err-ville', 'Ville invalide.');

        const code = document.getElementById('chkCode').value.trim();
        if (!/^\d{4,10}$/.test(code)) setErr('err-code', 'Code postal invalide.');
    }

    if (step === 2) {
        clearErr('err-cardname'); clearErr('err-cardnum'); clearErr('err-expiry'); clearErr('err-cvv');

        const cardName = document.getElementById('chkCardName').value.trim();
        if (!/^[A-Za-zÀ-ÿ\s]{4,50}$/.test(cardName)) setErr('err-cardname', 'Nom sur la carte invalide.');

        const cardNum = document.getElementById('chkCardNum').value.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cardNum)) setErr('err-cardnum', 'Numéro de carte invalide (16 chiffres).');

        const expiry = document.getElementById('chkExpiry').value.trim();
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) setErr('err-expiry', 'Format MM/AA requis.');

        const cvv = document.getElementById('chkCvv').value.trim();
        if (!/^\d{3,4}$/.test(cvv)) setErr('err-cvv', 'CVV invalide (3-4 chiffres).');
    }

    return ok;
}

function confirmOrder() {
    // Generate order ref
    const ref = 'PJ-' + Date.now().toString(36).toUpperCase().slice(-6);
    document.getElementById('orderRef').textContent = 'Référence : ' + ref;

    const d = new Date();
    d.setDate(d.getDate() + 5);
    document.getElementById('deliveryDate').textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    goStep('success');
}

function clearCartAndClose() {
    localStorage.removeItem('panierJewels');
    closeCheckout();
}

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    const cardInput = document.getElementById('chkCardNum');
    if (cardInput) {
        cardInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').slice(0, 16);
            this.value = val.replace(/(.{4})/g, '$1 ').trim();
        });
    }

    const expiryInput = document.getElementById('chkExpiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
            this.value = val;
        });
    }

    renderCart();
});