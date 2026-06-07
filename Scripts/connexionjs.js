// Utilisateurs simulés
function getUsers() {
    return JSON.parse(localStorage.getItem('jewelsUsers') || '[]');
}
function saveUsers(u) {
    localStorage.setItem('jewelsUsers', JSON.stringify(u));
}
if (!localStorage.getItem('jewelsUsers')) {
    saveUsers([{ email: 'demo@jewels.fr', password: 'demo123', prenom: 'Sophie', nom: 'Martin' }]);
}

const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    password: /^.{6,}$/,
    name: /^[A-Za-zÀ-ÿ\s\-]{2,30}$/
};

function setErr(id, msg) { const e = document.getElementById(id); if(e) e.textContent = msg; }
function clearErr(id) { const e = document.getElementById(id); if(e) e.textContent = ''; }
function showMsg(id, text, type) {
const el = document.getElementById(id);
    el.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'exclamation-circle'}"></i> ${text}`;
    el.className = 'auth-msg ' + type;
    el.style.display = 'flex';
}

// Connexion
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let ok = true;
    const email = document.getElementById('login-email').value.trim();
    clearErr('login-email-err');
    if (!regex.email.test(email)) { setErr('login-email-err', 'Email invalide.'); ok = false; }
    const pw = document.getElementById('login-password').value;
    clearErr('login-pw-err');
    if (!regex.password.test(pw)) { setErr('login-pw-err', 'Min. 6 caractères.'); ok = false; }
    if (!ok) return;

    const user = getUsers().find(u => u.email === email && u.password === pw);
    if (user) {
        localStorage.setItem('jewelsUser', JSON.stringify({ email: user.email, prenom: user.prenom, nom: user.nom }));
        showMsg('loginMsg', `Bienvenue ${user.prenom || user.email} ! Redirection…`, 'success');
        setTimeout(() => window.location.replace('../index.html'), 1500);
    } else {
        showMsg('loginMsg', 'Email ou mot de passe incorrect.', 'error');
    }
});

// Inscription
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let ok = true;
    const prenom = document.getElementById('first-name').value.trim();
    clearErr('signup-prenom-err');
    if (!regex.name.test(prenom)) { setErr('signup-prenom-err', 'Prénom invalide.'); ok = false; }
    const nom = document.getElementById('last-name').value.trim();
    clearErr('signup-nom-err');
    if (!regex.name.test(nom)) { setErr('signup-nom-err', 'Nom invalide.'); ok = false; }
    const email = document.getElementById('signup-email').value.trim();
    clearErr('signup-email-err');
    if (!regex.email.test(email)) { setErr('signup-email-err', 'Email invalide.'); ok = false; }
    const pw = document.getElementById('signup-password').value;
    clearErr('signup-pw-err');
    if (!regex.password.test(pw)) { setErr('signup-pw-err', 'Min. 6 caractères.'); ok = false; }
    if (!document.getElementById('acceptTerms').checked) {
        showMsg('signupMsg', 'Veuillez accepter les Conditions Générales.', 'error'); return;
    }
    if (!ok) return;

    const users = getUsers();
    if (users.find(u => u.email === email)) { showMsg('signupMsg', 'Cet email est déjà utilisé.', 'error'); return; }

    users.push({ email, password: pw, prenom, nom });
    saveUsers(users);
    localStorage.setItem('jewelsUser', JSON.stringify({ email, prenom, nom }));
    showMsg('signupMsg', `Compte créé ! Bienvenue ${prenom} !`, 'success');
    setTimeout(() => window.location.replace('../index.html'), 1500);
});

// Bascule overlay (même logique qu'avant)
const signup  = document.querySelector(".signup-container");
const login   = document.querySelector(".login-container");
const svgEl   = document.querySelector(".switcher-overlay svg");
const overlay = document.querySelector(".switcher-overlay");

function toggleScreen() {
    document.body.classList.toggle("login-open");
    document.body.classList.toggle("signup-open");
    if (document.body.classList.contains("login-open")) {
        fadeIn(login); fadeOut(signup);
        if (svgEl) svgEl.style.animation = "bounceRight 0.15s";
    } else {
        fadeIn(signup); fadeOut(login);
        if (svgEl) svgEl.style.animation = "bounceLeft 0.15s";
    }
}

function fadeOut(el) {
    (el.style.opacity -= .1) < 0 ? el.style.display = "none" : requestAnimationFrame(() => fadeOut(el));
}
function fadeIn(el) {
    el.style.opacity = 1;
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.justifyContent = "center";
}

function sizeOverlay() {
    if (window.innerWidth > 680)
        overlay.style.height = Math.max(window.innerHeight, signup.scrollHeight, login.scrollHeight) + "px";
}

document.querySelectorAll(".switch").forEach(btn => btn.addEventListener("click", toggleScreen));
window.addEventListener("resize", sizeOverlay);
document.body.classList.add("login-open");
toggleScreen();
sizeOverlay();