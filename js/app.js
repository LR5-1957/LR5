/* Moteur du site de quiz (réutilisable : la marque et le contenu sont dans js/config.js et data/). */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG;
  var app, toastEl, routes = {};

  /* ---------- Outils ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; })
      .replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"); // typographie française : pas de retour à la ligne avant « ? »
  }
  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  /* ---------- Progression (localStorage, rien ne sort de l'appareil) ---------- */
  function defaults() { return { etoiles: 0, stats: { bonnes: 0, repondues: 0, parfaits: 0, chrono: 0, jours: 0, buts: 0, penaltyParfait: 0, memory: 0 }, badges: {}, niveau: 1, jour: {} }; }
  var state = (function () {
    try { var s = JSON.parse(localStorage.getItem(CFG.stockage) || "null"); if (s) { var d = defaults(); Object.assign(d.stats, s.stats || {}); s.stats = d.stats; return Object.assign(d, s); } } catch (e) { /* stockage indisponible */ }
    return defaults();
  })();
  function save() { try { localStorage.setItem(CFG.stockage, JSON.stringify(state)); } catch (e) { /* mode privé : tant pis */ } updateStars(); }
  function addStars(n) { if (n > 0) { state.etoiles += n; save(); } }
  function bump(stat, n) { state.stats[stat] = (state.stats[stat] || 0) + (n == null ? 1 : n); }
  function setMax(stat, v) { if (v > (state.stats[stat] || 0)) state.stats[stat] = v; }
  function checkBadges() {
    var nouveaux = [];
    CFG.badges.forEach(function (b) { if (!state.badges[b.id] && (state.stats[b.stat] || 0) >= b.seuil) { state.badges[b.id] = today(); nouveaux.push(b); } });
    save();
    nouveaux.forEach(function (b, i) { setTimeout(function () { toast(b.ico + " Nouveau badge : " + b.nom + " !"); }, 400 + i * 2600); });
  }
  function recordAnswer(q, ok) {
    bump("repondues");
    if (ok) { bump("bonnes"); bump("u_" + q.u); }
  }
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove("show"); }, 2400); }
  function updateStars() { var s = document.getElementById("nb-etoiles"); if (s) s.textContent = state.etoiles; }

  /* ---------- Questions ---------- */
  var ALL = [];
  function buildPool() {
    CFG.univers.forEach(function (u) {
      (window.QUIZ_QUESTIONS[u.id] || []).forEach(function (q) { ALL.push(Object.assign({ u: u.id }, q)); });
    });
  }
  function universe(id) { return id === CFG.mix.id ? CFG.mix : CFG.univers.filter(function (u) { return u.id === id; })[0]; }
  function niveau(id) { return CFG.niveaux.filter(function (n) { return n.id === +id; })[0] || CFG.niveaux[0]; }
  var seenKey = CFG.stockage + ":vues";
  function seen() { try { return JSON.parse(sessionStorage.getItem(seenKey) || "[]"); } catch (e) { return []; } }
  function markSeen(ids) { try { sessionStorage.setItem(seenKey, JSON.stringify(seen().concat(ids))); } catch (e) { } }
  /* Tire n questions au hasard, sans répétition pendant la session (jusqu'à épuisement). */
  function draw(n, uid, niv) {
    var diffs = niveau(niv).difficultes;
    var pool = ALL.filter(function (q) { return (uid === CFG.mix.id || q.u === uid) && diffs.indexOf(q.difficulte) >= 0; });
    var vus = seen();
    var frais = pool.filter(function (q) { return vus.indexOf(q.id) < 0; });
    if (frais.length < n) { // on a tout vu : on recommence ce paquet
      var ids = pool.map(function (q) { return q.id; });
      try { sessionStorage.setItem(seenKey, JSON.stringify(vus.filter(function (id) { return ids.indexOf(id) < 0; }))); } catch (e) { }
      frais = pool;
    }
    var out = shuffle(frais).slice(0, n);
    markSeen(out.map(function (q) { return q.id; }));
    return out;
  }
  function dailyQuestion() {
    var h = hash(CFG.domaine + today());
    return { q: ALL[h % ALL.length], rnd: seeded(h) };
  }

  /* Affiche une question ; opts.onAnswer(ok) ; opts.quick = feedback court (chrono) */
  function renderQuestion(box, q, opts) {
    opts = opts || {};
    var order = shuffle([0, 1, 2, 3], opts.rnd);
    var u = universe(q.u);
    var flag = q.drapeau && window.QUIZ_FLAGS ? window.QUIZ_FLAGS.svg(q.drapeau, "Drapeau mystère") : "";
    box.innerHTML =
      '<div class="qhead"><span class="tag">' + u.emoji + " " + esc(q.theme) + '</span><span class="tag">' + esc(niveauLabel(q.difficulte)) + "</span></div>" +
      (flag ? flag.replace('class="flag"', 'class="flag flag-q"') : "") +
      '<h2 class="question" id="q-texte" tabindex="-1">' + esc(q.question) + "</h2>" +
      '<div class="answers" role="group" aria-labelledby="q-texte">' +
      order.map(function (i, k) { return '<button class="answer" data-i="' + i + '"><span class="k" aria-hidden="true">' + "ABCD"[k] + "</span><span>" + esc(q.choix[i]) + "</span></button>"; }).join("") +
      '</div><div class="fb" aria-live="polite"></div>';
    var done = false;
    box.querySelectorAll(".answer").forEach(function (b) {
      b.addEventListener("click", function () {
        if (done) return; done = true;
        var i = +b.dataset.i, ok = i === q.bonne_reponse;
        box.querySelectorAll(".answer").forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.i === q.bonne_reponse) x.classList.add("ok");
        });
        if (!ok) b.classList.add("ko");
        recordAnswer(q, ok);
        var fb = box.querySelector(".fb");
        if (opts.quick) {
          fb.innerHTML = '<p class="sr-only">' + (ok ? "Bonne réponse" : "Raté") + "</p>";
        } else {
          fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "ko") + '"><h3>' + (ok ? "Bravo ! ⭐" : "Raté ! La bonne réponse : " + esc(q.choix[q.bonne_reponse])) +
            '</h3><p class="savais"><b>Le savais-tu ?</b> ' + esc(q.savais_tu) + "</p>" +
            (opts.nextLabel ? '<button class="btn accent next">' + esc(opts.nextLabel) + " →</button>" : "") + "</div>";
          var nb = fb.querySelector(".next");
          if (nb) { nb.addEventListener("click", function () { opts.onNext && opts.onNext(ok); }); nb.focus(); }
        }
        opts.onAnswer && opts.onAnswer(ok);
      });
    });
    var h = box.querySelector("#q-texte"); if (h && opts.focus !== false) h.focus({ preventScroll: true });
  }
  function niveauLabel(d) { return ["", "Facile", "Moyen", "Difficile"][d] || ""; }

  /* ---------- Vues ---------- */
  function mascot(size, cls) { return '<img src="' + CFG.mascotte.image + '" alt="' + esc(CFG.mascotte.nom + ", " + CFG.mascotte.description) + '" width="' + size + '" class="' + (cls || "") + '">'; }

  routes[""] = function () {
    var dq = state.jour[today()];
    var bulle = CFG.mascotte.bulles[Math.floor(Math.random() * CFG.mascotte.bulles.length)];
    app.innerHTML =
      '<section class="hero">' + mascot(150) + "<div><h1 tabindex=\"-1\">Bienvenue dans " + esc(CFG.nom) + " !</h1>" +
      '<p class="bulle">' + esc(CFG.mascotte.nom) + " : « " + esc(bulle) + " »</p>" +
      '<p class="muted">Tu as <b>' + state.etoiles + " ⭐</b> et " + Object.keys(state.badges).length + "/" + CFG.badges.length + " badges.</p></div></section>" +
      '<a class="card daily" href="#/jour"><span class="emoji" aria-hidden="true">📅</span><div><h3 style="margin:0">Question du jour</h3><p style="margin:0">' +
      (dq ? (dq.ok ? "Réussie aujourd'hui ✅ Reviens demain !" : "Déjà jouée aujourd'hui. Reviens demain !") : "Une question spéciale chaque jour : +" + CFG.quiz.etoilesQuestionDuJour + " ⭐") + "</p></div></a>" +
      '<h2 class="section">Choisis ton univers</h2><div class="grid">' +
      CFG.univers.concat([CFG.mix]).map(function (u) {
        return '<a class="card univers u-' + u.id + '" href="#/univers/' + u.id + '"><span class="emoji" aria-hidden="true">' + u.emoji + "</span><h3>" + esc(u.nom) + "</h3><p>" + esc(u.description) + "</p></a>";
      }).join("") + "</div>" +
      '<h2 class="section">Mini-jeux</h2><div class="grid">' +
      '<a class="card" href="#/penalty"><span class="big" aria-hidden="true">🥅</span><h3>L\'épreuve des 11 mètres</h3><p>Réponds juste pour gagner le droit de tirer un penalty !</p></a>' +
      '<a class="card" href="#/memory"><span class="big" aria-hidden="true">🚩</span><h3>Memory des drapeaux</h3><p>Retrouve quel drapeau va avec quel pays.</p></a>' +
      '<a class="card" href="#/album"><span class="big" aria-hidden="true">🏅</span><h3>Mon album</h3><p>Tes étoiles, tes badges et tes records.</p></a>' +
      "</div>";
  };

  routes.univers = function (uid) {
    var u = universe(uid); if (!u) return go("");
    var cnt = ALL.filter(function (q) { return uid === CFG.mix.id || q.u === uid; }).length;
    app.innerHTML =
      '<div class="panel card univers u-' + u.id + '" style="cursor:default"><span class="emoji" aria-hidden="true">' + u.emoji + '</span><h1 tabindex="-1">' + esc(u.nom) + "</h1><p>" + esc(u.description) + " · " + cnt + " questions</p></div>" +
      '<h2 class="section">1. Ton niveau</h2><div class="choice-group" id="niv">' +
      CFG.niveaux.map(function (n) { return '<button class="btn blanc" data-n="' + n.id + '" aria-pressed="' + (state.niveau === n.id) + '">' + n.emoji + " " + esc(n.nom) + "</button>"; }).join("") +
      '</div><p class="muted" id="niv-desc"></p>' +
      '<h2 class="section">2. Ton jeu</h2><div class="grid">' +
      '<a class="card" id="go-rapide" href="#"><span class="big" aria-hidden="true">⚡</span><h3>Quiz rapide</h3><p>' + CFG.quiz.nbQuestions + " questions, à ton rythme.</p></a>" +
      '<a class="card" id="go-chrono" href="#"><span class="big" aria-hidden="true">⏱️</span><h3>Défi chrono</h3><p>' + CFG.quiz.chronoSecondes + " secondes : un maximum de bonnes réponses !</p></a></div>" +
      '<p><a class="btn blanc" href="#/">← Accueil</a></p>';
    function refresh() {
      app.querySelectorAll("#niv .btn").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.n === state.niveau)); });
      app.querySelector("#niv-desc").textContent = niveau(state.niveau).description;
      app.querySelector("#go-rapide").href = "#/quiz/" + uid + "/rapide/" + state.niveau;
      app.querySelector("#go-chrono").href = "#/quiz/" + uid + "/chrono/" + state.niveau;
    }
    app.querySelectorAll("#niv .btn").forEach(function (b) { b.addEventListener("click", function () { state.niveau = +b.dataset.n; save(); refresh(); }); });
    refresh();
  };

  routes.quiz = function (uid, mode, niv) {
    var u = universe(uid); if (!u) return go("");
    if (mode === "chrono") return chrono(u, niv);
    var qs = draw(CFG.quiz.nbQuestions, uid, niv), i = 0, score = 0;
    app.innerHTML = '<div class="panel"><div class="qhead"><span>' + u.emoji + " " + esc(u.nom) + " · " + esc(niveau(niv).nom) +
      '</span><span id="cpt"></span></div><div class="progress" aria-hidden="true"><i id="bar"></i></div><div id="qbox"></div></div>';
    function step() {
      app.querySelector("#cpt").textContent = "Question " + (i + 1) + "/" + qs.length + " · " + score + " ⭐";
      app.querySelector("#bar").style.width = (i / qs.length * 100) + "%";
      renderQuestion(app.querySelector("#qbox"), qs[i], {
        nextLabel: i + 1 < qs.length ? "Question suivante" : "Voir mon score",
        onAnswer: function (ok) { if (ok) { score++; addStars(CFG.quiz.etoilesParBonneReponse); } app.querySelector("#cpt").textContent = "Question " + (i + 1) + "/" + qs.length + " · " + score + " ⭐"; },
        onNext: function () { i++; if (i < qs.length) step(); else end(); }
      });
    }
    function end() {
      var parfait = score === qs.length, bonus = parfait ? CFG.quiz.bonusSansFaute : 0;
      if (parfait) { bump("parfaits"); addStars(bonus); }
      checkBadges();
      var msg = parfait ? "INCROYABLE, sans faute !" : score >= qs.length * 0.7 ? "Très fort !" : score >= qs.length * 0.4 ? "Bien joué, continue !" : "Chaque erreur t'apprend quelque chose !";
      app.innerHTML = '<div class="panel result">' + mascot(140) + '<h1 tabindex="-1">' + msg + '</h1><p class="big">' + score + "/" + qs.length + "</p><p>Tu gagnes <b>" + (score + bonus) + " ⭐</b>" + (bonus ? " (dont " + bonus + " de bonus sans faute)" : "") + ".</p>" +
        '<div class="row" style="justify-content:center"><a class="btn accent" href="#/quiz/' + uid + "/rapide/" + niv + '" id="again">🔁 Rejouer</a><a class="btn blanc" href="#/univers/' + uid + '">Changer de jeu</a><a class="btn blanc" href="#/">Accueil</a></div></div>';
      app.querySelector("#again").addEventListener("click", function (e) { e.preventDefault(); routes.quiz(uid, "rapide", niv); });
    }
    step();
  };

  function chrono(u, niv) {
    var total = CFG.quiz.chronoSecondes, left = total, score = 0, rates = [], fini = false, q, timer;
    var qs = draw(60, u.id, niv), i = 0;
    app.innerHTML = '<div class="panel"><div class="qhead"><span>⏱️ Défi chrono · ' + esc(u.nom) + '</span><span class="row"><span id="sc">0 ⭐</span><span class="timer" id="t" role="timer" aria-live="off">' + left + 's</span></span></div><div id="qbox"></div></div>';
    var tEl = app.querySelector("#t");
    timer = setInterval(function () {
      if (!document.body.contains(tEl)) return clearInterval(timer);
      left--; tEl.textContent = left + "s"; tEl.classList.toggle("urgent", left <= 10);
      if (left <= 0) end();
    }, 1000);
    function step() {
      if (fini) return;
      if (i >= qs.length) { qs = qs.concat(draw(30, u.id, niv)); }
      q = qs[i++];
      renderQuestion(app.querySelector("#qbox"), q, {
        quick: true,
        onAnswer: function (ok) {
          if (ok) { score++; addStars(CFG.quiz.etoilesParBonneReponse); } else rates.push(q);
          app.querySelector("#sc").textContent = score + " ⭐";
          setTimeout(step, ok ? 650 : 1300);
        }
      });
    }
    function end() {
      if (fini) return; fini = true; clearInterval(timer);
      var record = score > (state.stats.chrono || 0);
      setMax("chrono", score); checkBadges();
      app.innerHTML = '<div class="panel result">' + mascot(120) + '<h1 tabindex="-1">Temps écoulé !</h1><p class="big">' + score + " ⭐</p><p>" + (record ? "🏆 Nouveau record !" : "Ton record : " + state.stats.chrono + " bonnes réponses.") + "</p>" +
        (rates.length ? '<div class="recap"><h2>Les réponses à retenir</h2><ul>' + rates.map(function (r) { return "<li><b>" + esc(r.question) + "</b><br>→ " + esc(r.choix[r.bonne_reponse]) + ". <i>" + esc(r.savais_tu) + "</i></li>"; }).join("") + "</ul></div>" : "") +
        '<div class="row" style="justify-content:center"><button class="btn accent" id="again">🔁 Rejouer</button><a class="btn blanc" href="#/univers/' + u.id + '">Changer de jeu</a><a class="btn blanc" href="#/">Accueil</a></div></div>';
      app.querySelector("#again").addEventListener("click", function () { chrono(u, niv); });
      app.querySelector("h1").focus();
    }
    step();
  }

  routes.jour = function () {
    var d = dailyQuestion(), key = today(), deja = state.jour[key];
    var dateTxt = new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" });
    app.innerHTML = '<div class="panel"><h1 tabindex="-1">📅 Question du jour</h1><p class="muted">' + esc(dateTxt) + " · la même pour tous les copains !</p><div id='qbox'></div><p><a class='btn blanc' href='#/'>← Accueil</a></p></div>";
    var box = app.querySelector("#qbox");
    if (deja) {
      box.innerHTML = '<div class="feedback ' + (deja.ok ? "ok" : "ko") + '"><h3>' + (deja.ok ? "Tu as réussi la question du jour ! ✅" : "Tu as déjà joué aujourd'hui.") + "</h3><p><b>" + esc(d.q.question) + "</b><br>→ " + esc(d.q.choix[d.q.bonne_reponse]) +
        '</p><p class="savais"><b>Le savais-tu ?</b> ' + esc(d.q.savais_tu) + "</p><p>Reviens demain pour une nouvelle question.</p></div>";
      return;
    }
    renderQuestion(box, d.q, {
      rnd: d.rnd,
      onAnswer: function (ok) {
        state.jour = {}; state.jour[key] = { ok: ok }; // on ne garde que le jour courant
        if (ok) { bump("jours"); addStars(CFG.quiz.etoilesQuestionDuJour); toast("+" + CFG.quiz.etoilesQuestionDuJour + " ⭐ !"); }
        checkBadges();
      }
    });
  };

  routes.album = function () {
    var s = state.stats;
    app.innerHTML = '<h1 tabindex="-1">🏅 Mon album</h1><div class="stats">' +
      [["⭐", state.etoiles, "étoiles"], ["✅", s.bonnes, "bonnes réponses"], ["❓", s.repondues, "questions jouées"], ["⏱️", s.chrono, "record chrono"], ["🥅", s.buts, "buts marqués"], ["📅", s.jours, "questions du jour"]]
        .map(function (x) { return '<div class="stat"><span aria-hidden="true">' + x[0] + "</span><b>" + x[1] + "</b>" + x[2] + "</div>"; }).join("") +
      '</div><h2>Badges (' + Object.keys(state.badges).length + "/" + CFG.badges.length + ')</h2><div class="badges">' +
      CFG.badges.map(function (b) {
        var ok = !!state.badges[b.id];
        return '<div class="badge' + (ok ? "" : " locked") + '"><span class="ico" aria-hidden="true">' + b.ico + "</span><b>" + esc(b.nom) + "</b><small>" + esc(b.desc) + "</small><small>" + (ok ? "Gagné ✅" : "À gagner") + "</small></div>";
      }).join("") + "</div>" +
      '<h2 class="section">Par univers</h2><div class="stats">' + CFG.univers.map(function (u) { return '<div class="stat"><span aria-hidden="true">' + u.emoji + "</span><b>" + (s["u_" + u.id] || 0) + "</b>" + esc(u.nom) + "</div>"; }).join("") + "</div>" +
      '<p class="row"><a class="btn blanc" href="#/">← Accueil</a><button class="btn blanc" id="reset">Tout remettre à zéro</button></p>';
    app.querySelector("#reset").addEventListener("click", function () {
      if (confirm("Effacer toutes les étoiles et tous les badges de cet appareil ?")) { state = defaults(); save(); routes.album(); }
    });
  };

  /* ---------- Routeur (#/route/param) ---------- */
  function go(path) { location.hash = "#/" + path; }
  function route() {
    var parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    var name = parts.shift() || "";
    var fn = routes[name] || routes[""];
    window.scrollTo(0, 0);
    fn.apply(null, parts);
    var h = app.querySelector("h1"); if (h && !app.querySelector("#q-texte")) h.focus({ preventScroll: true });
    document.title = CFG.nom + " · " + CFG.slogan;
  }

  /* ---------- Démarrage ---------- */
  function applyBranding() {
    var root = document.documentElement.style;
    Object.keys(CFG.couleurs).forEach(function (k) { root.setProperty("--" + k, CFG.couleurs[k]); });
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc && CFG.couleurs.primaire) tc.content = CFG.couleurs.primaire;
    document.querySelectorAll("[data-cfg]").forEach(function (n) { var v = CFG[n.dataset.cfg]; if (v != null) n.textContent = v; });
    document.querySelectorAll("[data-mascotte]").forEach(function (n) { n.src = CFG.mascotte.image; n.alt = CFG.mascotte.nom; });
  }
  function loadData(cb) {
    window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || {};
    var files = CFG.univers.map(function (u) { return u.fichier; }), n = files.length;
    files.forEach(function (f) {
      var s = document.createElement("script"); s.src = f;
      s.onload = s.onerror = function () { if (--n === 0) cb(); };
      document.head.appendChild(s);
    });
  }
  window.APP = { cfg: CFG, state: function () { return state; }, save: save, addStars: addStars, bump: bump, setMax: setMax, checkBadges: checkBadges,
    draw: draw, renderQuestion: renderQuestion, routes: routes, esc: esc, shuffle: shuffle, mascot: mascot, toast: toast, go: go, all: function () { return ALL; } };

  document.addEventListener("DOMContentLoaded", function () {
    applyBranding();
    app = document.getElementById("app"); toastEl = document.getElementById("toast");
    updateStars();
    if (!app) return; // page statique (parents)
    Object.assign(routes, window.APP_ROUTES || {});
    loadData(function () { buildPool(); window.addEventListener("hashchange", route); route(); });
  });
})();
