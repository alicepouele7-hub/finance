// script.js

function showSection(sectionId) {
    document.getElementById('cours').classList.add('hidden');
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('simulateur').classList.add('hidden');
    document.getElementById(sectionId).classList.remove('hidden');
    // Force le redimensionnement du graphique quand on affiche l'onglet sur mobile
    if(sectionId === 'simulateur' && marketChart) marketChart.resize();
}

function openModal(modalId) { document.getElementById(modalId).style.display = "block"; }
function closeModal(modalId) { document.getElementById(modalId).style.display = "none"; }
window.onclick = function(e) { if (e.target.classList.contains('modal')) e.target.style.display = "none"; }

// --- QUIZ ---
const questions = [
    { q: "Qu'est-ce que l'inflation ?", opts: ["Une taxe de l'état", "La perte du pouvoir d'achat", "Le rendement d'une action"], ans: 1 },
    { q: "Pourquoi les intérêts sont 'composés' ?", opts: ["Ils sont fixés par l'état", "Ils génèrent de nouveaux intérêts", "Ils sont versés par mois"], ans: 1 },
    { q: "Différence Action / Obligation ?", opts: ["L'action est une dette", "L'action est une part (risque), l'obligation un prêt (sécurité)", "Aucune différence"], ans: 1 },
    { q: "Qu'est-ce qu'un ETF ?", opts: ["Un algorithme", "Une taxe", "Un panier d'actions pour diversifier"], ans: 2 },
    { q: "L'avantage du PEA en France ?", opts: ["Pas d'impôts sur la plus-value après 5 ans", "Rendement garanti", "Immobilier gratuit"], ans: 0 },
    { q: "Que signifie DCA ?", opts: ["Acheter au plus bas", "Investir la même somme régulièrement", "Vendre à 10% de gain"], ans: 1 },
    { q: "Avantage du DCA lors d'un krach ?", opts: ["L'État rembourse", "On achète plus de parts car le prix est bas", "Le compte est bloqué"], ans: 1 },
    { q: "Rôle de la BCE ?", opts: ["Gérer l'inflation via les taux", "Fixer le prix du gaz", "Vendre des actions"], ans: 0 },
    { q: "Si la BCE monte les taux :", opts: ["La bourse explose", "La bourse a tendance à baisser", "Rien ne se passe"], ans: 1 },
    { q: "Le PER c'est :", opts: ["Une taxe", "Prix de l'Action / Bénéfices", "Taux de faillite"], ans: 1 },
    { q: "Un dividende ?", opts: ["Une part des bénéfices reversée", "Frais bancaires", "Prix d'achat"], ans: 0 },
    { q: "Le FOMO ?", opts: ["Peur de perdre", "Peur de rater une opportunité (achat trop cher)", "Indice boursier"], ans: 1 },
    { q: "Si la bourse fait -30% (long terme) :", opts: ["Vendre par sécurité", "Continuer son DCA (les soldes)", "Emprunter pour jouer"], ans: 1 },
    { q: "Quand privilégier les obligations ?", opts: ["À 20 ans", "À 30 ans", "À l'approche de la retraite"], ans: 2 },
    { q: "Rendement d'un compte courant ?", opts: ["0%", "5%", "L'inflation"], ans: 0 }
];

let qIndex = 0, score = 0;

function loadQuestion() {
    document.getElementById('question-text').innerText = `Q${qIndex + 1}/${questions.length} : ${questions[qIndex].q}`;
    document.getElementById('quiz-progress').style.width = (qIndex / questions.length) * 100 + '%';
    const optsDiv = document.getElementById('options-container');
    optsDiv.innerHTML = '';
    questions[qIndex].opts.forEach((opt, idx) => {
        const b = document.createElement('button');
        // Boutons plus larges pour le tactile
        b.className = "w-full text-left p-4 sm:p-5 bg-gray-700 hover:bg-gray-600 rounded-lg transition border border-gray-600 hover:border-emerald-500 font-medium text-sm sm:text-base active:bg-gray-500";
        b.innerText = opt;
        b.onclick = () => checkAnswer(idx);
        optsDiv.appendChild(b);
    });
}

function checkAnswer(idx) {
    if (idx === questions[qIndex].ans) score++;
    qIndex++;
    qIndex < questions.length ? loadQuestion() : showResults();
}

function showResults() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    document.getElementById('score-text').innerText = `Score : ${score} / ${questions.length}`;
    
    let msg = document.getElementById('score-message');
    if (score >= 13) msg.innerHTML = "<span class='text-emerald-400'>Excellent ! Prêt à investir.</span>";
    else if (score >= 8) msg.innerHTML = "<span class='text-yellow-400'>Pas mal, relisez quelques modules.</span>";
    else msg.innerHTML = "<span class='text-red-400'>La bourse n'est pas un casino, retour à l'académie !</span>";
}

function startQuiz() {
    qIndex = 0; score = 0;
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('result-container').classList.add('hidden');
    loadQuestion();
}
startQuiz();

// --- SIMULATEUR ---
const initialCapital = 10000.00;
let cashBalance = initialCapital;

const assets = {
    etf: { name: "ETF World", price: 250, shares: 0, history: Array(40).fill(250), vol: 0.008, color: '#10b981' },
    bond: { name: "Obligations", price: 100, shares: 0, history: Array(40).fill(100), vol: 0.003, color: '#8b5cf6' },
    bank: { name: "Banque", price: 50, shares: 0, history: Array(40).fill(50), vol: 0.025, color: '#3b82f6' },
    tech: { name: "Tech", price: 150, shares: 0, history: Array(40).fill(150), vol: 0.05, color: '#f59e0b' }
};

const macroEvents = [
    { text: "Krach de la Tech !", effect: () => { assets.tech.price *= 0.80; assets.etf.price *= 0.95; assets.bond.price *= 1.02; } },
    { text: "La BCE baisse ses taux", effect: () => { assets.tech.price *= 1.08; assets.bank.price *= 1.04; assets.etf.price *= 1.03; assets.bond.price *= 1.01; } },
    { text: "Inflation record, taux en hausse", effect: () => { assets.tech.price *= 0.90; assets.bank.price *= 1.05; assets.bond.price *= 0.95; assets.etf.price *= 0.98; } },
    { text: "Croissance économique stable", effect: () => { assets.etf.price *= 1.02; assets.tech.price *= 1.03; } }
];

const ctx = document.getElementById('marketChart').getContext('2d');
let marketChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(40).fill(''),
        datasets: Object.values(assets).map(a => ({
            label: a.name, data: a.history, borderColor: a.color, borderWidth: 2, tension: 0.2, pointRadius: 0
        }))
    },
    options: {
        responsive: true, 
        maintainAspectRatio: false, // CRUCIAL pour le mobile (permet de contrôler la hauteur en CSS)
        animation: false,
        scales: { x: { display: false }, y: { grid: { color: '#374151' } } },
        plugins: { legend: { labels: { color: 'white', boxWidth: 12, font: { size: 10 } } } }, // Légende plus petite
        interaction: { mode: 'index', intersect: false }
    }
});

let tick = 0;
setInterval(() => {
    tick++;
    Object.values(assets).forEach(a => {
        const change = (Math.random() - 0.49) * a.vol; 
        a.price = a.price * (1 + change);
    });

    if (tick % 12 === 0) {
        const ev = macroEvents[Math.floor(Math.random() * macroEvents.length)];
        const el = document.getElementById('news-ticker');
        el.innerText = ev.text;
        el.parentElement.classList.remove('news-flash');
        void el.parentElement.offsetWidth;
        el.parentElement.classList.add('news-flash');
        ev.effect();
    }

    Object.values(assets).forEach((a, i) => {
        a.history.push(a.price);
        a.history.shift();
        marketChart.data.datasets[i].data = a.history;
    });
    marketChart.update();
    updateTradingPanel();
}, 1000);

function updateTradingPanel() {
    const key = document.getElementById('asset-selector').value;
    const a = assets[key];
    document.getElementById('cash-balance').innerText = cashBalance.toFixed(2) + " €";
    document.getElementById('selected-price').innerText = a.price.toFixed(2) + " €";
    document.getElementById('selected-shares').innerText = a.shares;

    let tot = cashBalance;
    Object.values(assets).forEach(ast => tot += (ast.shares * ast.price));
    document.getElementById('total-value').innerText = tot.toFixed(2) + " €";

    const pl = tot - initialCapital;
    const plEl = document.getElementById('profit-loss');
    plEl.innerText = (pl >= 0 ? "+" : "") + pl.toFixed(2) + " €";
    plEl.className = "text-sm sm:text-md font-bold " + (pl >= 0 ? "text-emerald-400" : "text-red-400");
}

function tradeAsset(action, qty) {
    const a = assets[document.getElementById('asset-selector').value];
    if (action === 'buy') {
        const cost = a.price * qty;
        if (cashBalance >= cost) { cashBalance -= cost; a.shares += qty; }
        else alert(`Fonds insuffisants.`);
    } else {
        if (a.shares >= qty) { cashBalance += (a.price * qty); a.shares -= qty; }
        else alert(`Pas assez d'actions.`);
    }
    updateTradingPanel();
}