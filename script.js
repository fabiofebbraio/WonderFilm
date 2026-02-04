// ==========================================
// CONFIGURATION INITIALE
// ==========================================
const codeAdmin = "112233";
const codesVIP = ["WONDER2024", "FABIO2026", "THEO2026"];
let isPremium = localStorage.getItem('isPremiumWonder') === 'true';
let catalogue = JSON.parse(localStorage.getItem('wonderCatalogue')) || [];
let filmSelectionne = null;

// Au chargement, on lance l'affichage
document.addEventListener('DOMContentLoaded', () => {
    console.log("Système WonderFilm prêt.");
    verifierStatutPremium();
    chargerGrille('Tout'); // Force l'affichage au démarrage
});

// ==========================================
// NAVIGATION (HOME / PROFIL)
// ==========================================
function changerPage(page) {
    const home = document.getElementById('home-page');
    const profile = document.getElementById('profile-page');
    if(!home || !profile) return;

    if (page === 'home') {
        home.classList.remove('hidden');
        profile.classList.add('hidden');
    } else {
        home.classList.add('hidden');
        profile.classList.remove('hidden');
    }
}

// ==========================================
// FILTRAGE ET AFFICHAGE (LE CŒUR DU BUG)
// ==========================================
function filtrerCat(catSaisie) {
    console.log("Filtrage demandé :", catSaisie);
    
    // 1. On remet tous les boutons en style normal
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-red-600');
        btn.classList.add('bg-white/5');
    });

    // 2. On change le titre
    const titreCat = document.getElementById('cat-title');
    if(titreCat) titreCat.innerText = (catSaisie === 'Tout') ? 'Populaires' : catSaisie;

    // 3. ON RECHARGE LA GRILLE
    chargerGrille(catSaisie);
}

function chargerGrille(filtre) {
    const grid = document.getElementById('catalog-grid');
    if(!grid) return;
    
    grid.innerHTML = ""; // On vide tout pour éviter les bugs

    // Filtrage des films
    let listeFiltrée = (filtre === 'Tout') 
        ? catalogue 
        : catalogue.filter(f => f.cat === filtre);

    // SÉCURITÉ : Si la liste est vide, on affiche un message au lieu d'une page blanche
    if (listeFiltrée.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-zinc-700 py-10 text-center text-xs italic font-bold uppercase tracking-widest">Aucun film dans "${filtre}"</div>`;
        return;
    }

    // Affichage des cartes
    listeFiltrée.forEach(f => {
        const movieCard = document.createElement('div');
        movieCard.className = "movie-card bg-zinc-900 rounded-[30px] overflow-hidden border border-white/5 animate-pop cursor-pointer active:scale-95 transition-all";
        movieCard.innerHTML = `
            <div class="relative h-44">
                <img src="${f.img || 'https://placehold.co/400x600/000/fff?text=WONDERFILM'}" class="w-full h-full object-cover">
                <div class="absolute bottom-3 left-3 bg-red-600 text-[8px] font-black px-2 py-1 rounded italic uppercase">${f.cat}</div>
            </div>
            <div class="p-4 text-center">
                <h4 class="font-black text-[10px] truncate uppercase italic tracking-tighter">${f.titre}</h4>
                <p class="text-[8px] text-yellow-500 font-bold mt-1">⭐ ${f.note}/10</p>
            </div>
        `;
        movieCard.onclick = () => ouvrirLecteur(f);
        grid.appendChild(movieCard);
    });
}

// ==========================================
// LECTEUR VIDEO
// ==========================================
function ouvrirLecteur(f) {
    filmSelectionne = f;
    const modal = document.getElementById('modal-player');
    const frame = document.getElementById('video-frame');
    
    if(!modal || !frame) return;

    document.getElementById('player-title').innerText = f.titre;
    document.getElementById('player-note').innerText = "⭐ " + f.note + "/10";
    document.getElementById('player-date').innerText = f.date;
    document.getElementById('player-real').innerText = f.real;
    document.getElementById('player-desc').innerText = f.desc || "Film exclusif WonderFilm.";

    // Sécurité URL YouTube
    let urlPropre = f.url;
    if(urlPropre.includes("youtube.com/watch?v=")) {
        urlPropre = urlPropre.replace("watch?v=", "embed/");
    }

    frame.src = urlPropre;
    modal.classList.remove('hidden');
}

function voirBandeAnnonce() {
    if(filmSelectionne && filmSelectionne.trailer) {
        let ba = filmSelectionne.trailer;
        if(ba.includes("watch?v=")) ba = ba.replace("watch?v=", "embed/");
        document.getElementById('video-frame').src = ba + "?autoplay=1";
    } else {
        alert("Bande-annonce non disponible.");
    }
}

function voirFilmComplet() {
    if(filmSelectionne) {
        let url = filmSelectionne.url;
        if(url.includes("watch?v=")) url = url.replace("watch?v=", "embed/");
        document.getElementById('video-frame').src = url;
    }
}

// ==========================================
// ADMIN & PREMIUM
// ==========================================
function verifierPin() {
    const val = document.getElementById('pin-input').value;
    if (val === codeAdmin) {
        document.getElementById('modal-pin').classList.add('hidden');
        document.getElementById('modal-admin').classList.remove('hidden');
        actualiserAdminList();
    } else {
        alert("CODE INCORRECT");
    }
}

function publierFilm() {
    const titre = document.getElementById('add-titre').value;
    const url = document.getElementById('add-url').value;
    
    if(!titre || !url) return alert("Titre et Lien obligatoires !");

    const f = {
        id: Date.now(),
        titre: titre,
        img: document.getElementById('add-img').value,
        url: url,
        trailer: document.getElementById('add-trailer').value,
        cat: document.getElementById('add-cat').value,
        note: document.getElementById('add-note').value || "8.5",
        date: document.getElementById('add-date').value || "2024",
        real: document.getElementById('add-real').value || "Wonder Studio",
        desc: document.getElementById('add-desc').value
    };

    catalogue.push(f);
    localStorage.setItem('wonderCatalogue', JSON.stringify(catalogue));
    fermerModals();
    chargerGrille('Tout');
}

function supprimerFilm(id) {
    catalogue = catalogue.filter(f => f.id !== id);
    localStorage.setItem('wonderCatalogue', JSON.stringify(catalogue));
    actualiserAdminList();
    chargerGrille('Tout');
}

function actualiserAdminList() {
    const container = document.getElementById('admin-film-list');
    container.innerHTML = "";
    catalogue.forEach(f => {
        container.innerHTML += `<div class="flex justify-between bg-white/5 p-4 rounded-xl text-[10px] font-bold uppercase mb-2">
            <span>${f.titre}</span>
            <button onclick="supprimerFilm(${f.id})" class="text-red-600">Supprimer</button>
        </div>`;
    });
}

function verifierStatutPremium() {
    if (isPremium) {
        document.getElementById('badge-premium')?.classList.remove('hidden');
        const st = document.getElementById('status-text');
        if(st) st.innerText = "MEMBRE WONDER+ 👑";
        document.getElementById('premium-box')?.classList.add('hidden');
    }
}

function demanderCodeVIP() {
    let c = prompt("CODE VIP :");
    if(codesVIP.includes(c)) {
        localStorage.setItem('isPremiumWonder', 'true');
        isPremium = true;
        verifierStatutPremium();
        alert("WONDER+ ACTIVÉ !");
    }
}

function ouvrirPinAdmin() { document.getElementById('modal-pin').classList.remove('hidden'); }
function fermerModals() {
    document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
    document.getElementById('video-frame').src = "";
}
