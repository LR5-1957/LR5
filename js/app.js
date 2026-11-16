/* =====================================================================
 * MOTEUR DU SITE (identique sur LR5 et AR7).
 * Tout ce qui change d'un site à l'autre est dans js/config.js,
 * css/theme.css, data/ et assets/. Ne pas modifier ce fichier dans un
 * seul des deux sites : le copier tel quel dans l'autre.
 * JavaScript « à l'ancienne » (ES5) pour marcher aussi sur les vieux iPad.
 * ===================================================================== */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG;
  var VERSION_ETAT = 2;
  var app, toastEl, routes = {};

  /* ---------- Outils ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; })
      .replace(/&#39;/g, "\u2019")                                   // apostrophe typographique
      .replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"); // pas de retour à la ligne avant « ? »
  }
  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function isObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function num(x) { x = Number(x); return isFinite(x) && x > 0 ? Math.floor(x) : 0; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  /* ---------- Minuteurs liés à la page affichée ----------
   * Chaque changement de page annule tous les minuteurs de la page précédente :
   * plus aucun « fantôme » du défi chrono, du penalty ou du memory. */
  var timers = [];
  function later(fn, ms) { var id = setTimeout(function () { timers = timers.filter(function (t) { return t !== id; }); fn(); }, ms); timers.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function stop(id) { clearTimeout(id); clearInterval(id); timers = timers.filter(function (t) { return t !== id; }); }
  function newView() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; resizers = []; fige(false); hideToast(); speakStop(); }

  /* ---------- Écran : hauteur visible, en-tête, rotation ----------
   * Règle d’or : l’enfant ne doit jamais faire défiler la page pour voir le résultat de son geste
   * ni pour atteindre le bouton principal (téléphone, tablette, ordinateur, portrait comme paysage). */
  var resizers = [], rafResize = 0;
  function onResize(fn) { resizers.push(fn); }
  function topH() {
    var t = document.querySelector(".topbar"); if (!t) return 0;
    var cs = getComputedStyle(t); if (cs.display === "none" || (cs.position !== "sticky" && cs.position !== "fixed")) return 0;
    return Math.max(0, t.getBoundingClientRect().bottom);
  }
  function viewH() { return window.innerHeight || document.documentElement.clientHeight; }
  function majEcran() {
    var r = document.documentElement.style;
    r.setProperty("--top-h", Math.round(topH()) + "px");
    r.setProperty("--vh1", (viewH() / 100) + "px");
  }
  function surRotation() {
    if (rafResize) return;
    rafResize = requestAnimationFrame(function () { rafResize = 0; majEcran(); resizers.slice().forEach(function (f) { try { f(); } catch (e) { } }); });
  }
  window.addEventListener("resize", surRotation);
  window.addEventListener("orientationchange", function () { surRotation(); setTimeout(surRotation, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", surRotation);
  /* Écran de jeu « figé » (penalty, memory) : il occupe exactement la hauteur visible, sans défilement. */
  function fige(on) { document.documentElement.classList.toggle("fige", !!on); if (on) { window.scrollTo(0, 0); majEcran(); } }
  /* Remonte en haut de l’écran (et annule un défilement doux encore en cours). */
  function enHaut() { window.scrollTo({ top: 0, behavior: "instant" }); requestAnimationFrame(function () { window.scrollTo({ top: 0, behavior: "instant" }); }); }
  function douce() { return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  /* Après une réponse : fait défiler juste ce qu’il faut pour voir la réponse (✓/✗), l’explication et le bouton. */
  function montrer(box) {
    var fb = box.querySelector(".fb"); if (!fb || !fb.firstElementChild) return;
    function zone() {
      var els = [].slice.call(box.querySelectorAll(".answer.ok,.answer.ko"));
      var top = Math.min.apply(null, els.map(function (e) { return e.getBoundingClientRect().top; }));
      return { top: top, bottom: fb.getBoundingClientRect().bottom };
    }
    var haut = topH() + 8, bas = viewH() - 8, z = zone();
    if (z.bottom - z.top > bas - haut) { box.classList.add("compact"); z = zone(); } // on cache les autres réponses
    var d = 0;
    if (z.bottom > bas) d = z.bottom - bas;
    if (z.top - d < haut) d = z.top - haut;
    if (Math.abs(d) > 2) window.scrollBy({ top: d, behavior: douce() ? "smooth" : "auto" });
  }

  /* ---------- Progression (localStorage, rien ne sort de l'appareil) ---------- */
  function defaults() {
    return { v: VERSION_ETAT, etoiles: 0, stats: { bonnes: 0, repondues: 0, parfaits: 0, chrono: 0, jours: 0, buts: 0, penaltyParfait: 0, memory: 0, corrigees: 0 },
      badges: {}, niveau: 1, jour: {}, erreurs: [], tenue: "" };
  }
  /* Répare n'importe quelle donnée sauvegardée (ancienne version, abîmée, modifiée à la main). */
  function sanitize(s) {
    var d = defaults();
    if (!isObj(s)) return d;
    d.etoiles = num(s.etoiles);
    if (isObj(s.stats)) Object.keys(s.stats).forEach(function (k) { if (/^[A-Za-z0-9_]{1,40}$/.test(k)) d.stats[k] = num(s.stats[k]); });
    if (isObj(s.badges)) Object.keys(s.badges).forEach(function (k) { if (CFG.badges.some(function (b) { return b.id === k; })) d.badges[k] = String(s.badges[k]).slice(0, 10); });
    var n = Number(s.niveau); d.niveau = CFG.niveaux.some(function (x) { return x.id === n; }) ? n : 1;
    if (isObj(s.jour)) Object.keys(s.jour).filter(function (k) { return /^\d{4}-\d\d-\d\d$/.test(k) && isObj(s.jour[k]); }).sort().slice(-14).forEach(function (k) {
      var j = s.jour[k]; d.jour[k] = { ok: !!j.ok, id: typeof j.id === "string" ? j.id : "" }; // on garde les 14 derniers jours
    });
    if (Array.isArray(s.erreurs)) d.erreurs = s.erreurs.filter(function (x) { return typeof x === "string"; }).slice(-80);
    if (typeof s.tenue === "string" && (CFG.tenues || []).some(function (t) { return t.id === s.tenue; })) d.tenue = s.tenue;
    return d;
  }
  function loadState() {
    var raw = lsGet(CFG.stockage);
    if (raw == null) return defaults();
    try { return sanitize(JSON.parse(raw)); }
    catch (e) { lsSet(CFG.stockage + ":abime", raw); return defaults(); } // on garde la copie abîmée, on repart proprement
  }
  var state = loadState();
  function save() { lsSet(CFG.stockage, JSON.stringify(state)); updateStars(); }
  function addStars(n) { if (n > 0) { state.etoiles += n; save(); } }
  function bump(stat, n) { state.stats[stat] = (state.stats[stat] || 0) + (n == null ? 1 : n); }
  function setMax(stat, v) { if (v > (state.stats[stat] || 0)) state.stats[stat] = v; }
  /* Renvoie la liste des nouveaux badges (affichés sur l'écran de résultat, pas en bulle). */
  function checkBadges() {
    var nouveaux = [];
    CFG.badges.forEach(function (b) { if (!state.badges[b.id] && (state.stats[b.stat] || 0) >= b.seuil) { state.badges[b.id] = today(); nouveaux.push(b); } });
    save();
    return nouveaux;
  }
  function badgesHtml(list) {
    if (!list || !list.length) return "";
    return '<div class="nouveaux" role="status"><h2>' + (list.length > 1 ? "Nouveaux badges !" : "Nouveau badge !") + '</h2><div class="badges">' +
      list.map(function (b) { return '<div class="badge gagne"><span class="ico" aria-hidden="true">' + b.ico + "</span><b>" + esc(b.nom) + "</b><small>" + esc(b.desc) + "</small></div>"; }).join("") + "</div></div>";
  }
  function recordAnswer(q, ok) {
    bump("repondues");
    if (ok) { bump("bonnes"); bump("u_" + q.u); }
    else if (state.erreurs.indexOf(q.id) < 0) { state.erreurs.push(q.id); state.erreurs = state.erreurs.slice(-80); }
    save();
  }
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(hideToast, 2600); }
  function hideToast() { if (toastEl) toastEl.classList.remove("show"); }
  function updateStars() {
    var s = document.getElementById("nb-etoiles"); if (s) s.textContent = state.etoiles;
    var p = document.getElementById("pill-etoiles"); if (p) p.setAttribute("aria-label", "Mes étoiles : " + state.etoiles);
  }
  function rang() {
    var r = (CFG.rangs || [{ etoiles: 0, nom: "" }]).filter(function (x) { return state.etoiles >= x.etoiles; }).pop();
    var next = (CFG.rangs || []).filter(function (x) { return x.etoiles > state.etoiles; })[0];
    return { nom: r ? r.nom : "", next: next };
  }

  /* ---------- Questions ---------- */
  var ALL = [], BYID = {};
  function buildPool() {
    CFG.univers.forEach(function (u) {
      (window.QUIZ_QUESTIONS[u.id] || []).forEach(function (q) {
        if (!q || !q.id || !Array.isArray(q.choix) || q.choix.length !== 4) return;
        var x = Object.assign({ u: u.id }, q); ALL.push(x); BYID[x.id] = x;
      });
    });
  }
  function universe(id) { return id === CFG.mix.id ? CFG.mix : CFG.univers.filter(function (u) { return u.id === id; })[0]; }
  function niveau(id) { return CFG.niveaux.filter(function (n) { return n.id === +id; })[0] || CFG.niveaux[0]; }
  function poolFor(uid, niv) {
    var diffs = niveau(niv).difficultes;
    return ALL.filter(function (q) { return (uid === CFG.mix.id || q.u === uid) && diffs.indexOf(q.difficulte) >= 0; });
  }

  /* ---------- Historique persistant : on fait le tour de TOUTES les questions avant d'en revoir une ----------
   * Pour chaque univers × niveau, on garde un « paquet » mélangé. On tire dans le paquet ; quand il est vide,
   * on le remélange en mettant à la fin les questions vues le plus récemment. Gardé dans localStorage. */
  var histKey = CFG.stockage + ":historique";
  function loadHist() {
    var h; try { h = JSON.parse(lsGet(histKey) || "null"); } catch (e) { h = null; }
    if (!isObj(h)) h = {};
    var out = { decks: {}, recent: [] };
    if (isObj(h.decks)) Object.keys(h.decks).forEach(function (k) { if (Array.isArray(h.decks[k])) out.decks[k] = h.decks[k].filter(function (id) { return typeof id === "string"; }); });
    if (Array.isArray(h.recent)) out.recent = h.recent.filter(function (id) { return typeof id === "string"; }).slice(-120);
    return out;
  }
  var HIST = loadHist();
  function saveHist() { lsSet(histKey, JSON.stringify(HIST)); }
  function refill(pool) {
    var rec = HIST.recent, ids = shuffle(pool.map(function (q) { return q.id; }));
    var vieux = ids.filter(function (id) { return rec.indexOf(id) < 0; });
    var recents = ids.filter(function (id) { return rec.indexOf(id) >= 0; }).sort(function (a, b) { return rec.lastIndexOf(a) - rec.lastIndexOf(b); });
    return vieux.concat(recents); // les plus récentes à la toute fin du nouveau tour
  }
  /* Tire UNE question pas encore vue dans ce tour, en évitant les ids et « groupes » déjà présents dans la partie. */
  function nextQuestion(uid, niv, partie) {
    partie = partie || { ids: {}, groupes: {} };
    var pool = poolFor(uid, niv); if (!pool.length) return null;
    var key = uid + "/" + niveau(niv).id, ok = {};
    pool.forEach(function (q) { ok[q.id] = true; });
    var deck = (HIST.decks[key] || []).filter(function (id) { return ok[id]; });
    function libre(id) { var q = BYID[id]; return !partie.ids[id] && !(q.groupe && partie.groupes[q.groupe]); }
    for (var essai = 0; essai < 2; essai++) {
      if (!deck.length) deck = refill(pool);
      var idx = -1, recentCourt = HIST.recent.slice(-30);
      for (var i = 0; i < deck.length; i++) {
        if (!libre(deck[i])) continue;
        if (idx < 0) idx = i;
        if (recentCourt.indexOf(deck[i]) < 0) { idx = i; break; } // évite aussi ce qui vient d’être vu dans un autre univers/niveau
      }
      if (idx >= 0) {
        var q = BYID[deck.splice(idx, 1)[0]];
        HIST.decks[key] = deck; HIST.recent.push(q.id); HIST.recent = HIST.recent.slice(-120); saveHist();
        partie.ids[q.id] = true; if (q.groupe) partie.groupes[q.groupe] = true;
        return q;
      }
      // Tout ce qui reste dans ce tour est déjà dans la partie : on commence le tour suivant (sans perdre les restes).
      var reste = {}; deck.forEach(function (id) { reste[id] = true; });
      deck = deck.concat(refill(pool).filter(function (id) { return !reste[id]; }));
    }
    return null; // toute la réserve est déjà dans cette partie
  }
  function draw(n, uid, niv, partie) {
    partie = partie || { ids: {}, groupes: {} };
    var out = [];
    for (var k = 0; k < n; k++) { var q = nextQuestion(uid, niv, partie); if (!q) break; out.push(q); }
    return out;
  }

  /* ---------- Question du jour : même question pour tous, sans répétition avant d'avoir fait le tour ---------- */
  function dayNumber(d) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 864e5); }
  function dailyFor(date) {
    var diffs = (CFG.jour && CFG.jour.difficultes) || [1, 2, 3];
    var elig = ALL.filter(function (q) { return diffs.indexOf(q.difficulte) >= 0; }).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    // Un ordre mélangé fixe, parcouru jour après jour : une question ne revient qu'après avoir vu TOUTES les autres
    // (au moins elig.length jours plus tard, même d'un tour à l'autre).
    var n = elig.length, day = Math.max(0, dayNumber(date));
    return shuffle(elig, seeded(hash(CFG.domaine + ":jour")))[day % n];
  }
  function dailyQuestion() {
    var key = today(), deja = state.jour[key];
    var q = (deja && deja.id && BYID[deja.id]) || dailyFor(new Date());
    return { q: q, rnd: seeded(hash(CFG.domaine + key)) };
  }

  /* ---------- Lecture à voix haute (synthèse vocale de l'appareil, rien ne sort) ---------- */
  var canSpeak = !!(CFG.lecture && window.speechSynthesis && window.SpeechSynthesisUtterance);
  function speak(text) {
    if (!canSpeak) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = CFG.lecture.vitesse || 0.95;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^fr/i.test(x.lang); });
      var pref = v.filter(function (x) { return /fr-CH|fr-FR/i.test(x.lang); })[0] || v[0]; if (pref) u.voice = pref;
      speechSynthesis.speak(u);
    } catch (e) { /* pas de voix : tant pis */ }
  }
  function speakStop() { if (canSpeak) try { speechSynthesis.cancel(); } catch (e) { } }
  function speakBtn(label) { return canSpeak ? '<button class="pill lire" type="button" aria-label="' + esc(label || "Écouter") + '">🔊 <span>Écouter</span></button>' : ""; }

  /* ---------- Affichage d'une question ; opts.onAnswer(ok) ; opts.quick = feedback court (chrono) ---------- */
  function renderQuestion(box, q, opts) {
    opts = opts || {};
    var order = shuffle([0, 1, 2, 3], opts.rnd);
    var u = universe(q.u);
    var flag = q.drapeau && window.QUIZ_FLAGS ? window.QUIZ_FLAGS.svg(q.drapeau, "Drapeau mystère") : "";
    box.classList.add("qz"); box.classList.remove("done", "compact"); box.classList.toggle("has-flag", !!flag); box.setAttribute("data-q", q.id);
    box.innerHTML =
      '<div class="qhead"><span class="tag">' + u.emoji + " " + esc(q.theme) + '</span><span class="row tight">' + speakBtn("Écouter la question") + '<span class="tag">' + esc(niveauLabel(q.difficulte)) + "</span></span></div>" +
      (flag ? flag.replace('class="flag"', 'class="flag flag-q"') : "") +
      '<h2 class="question" id="q-texte" tabindex="-1">' + esc(q.question) + "</h2>" +
      '<div class="answers" role="group" aria-labelledby="q-texte">' +
      order.map(function (i, k) { return '<button type="button" class="answer" data-i="' + i + '"><span class="k" aria-hidden="true">' + "ABCD"[k] + '</span><span class="t">' + esc(q.choix[i]) + '</span><span class="sr-only etat"></span></button>'; }).join("") +
      '</div><div class="fb" aria-live="polite"></div>';
    var lire = box.querySelector(".qhead .lire");
    if (lire) lire.addEventListener("click", function () {
      speak(q.question + ". " + order.map(function (i, k) { return "ABCD"[k] + " : " + q.choix[i]; }).join(". "));
    });
    var done = false;
    box.querySelectorAll(".answer").forEach(function (b) {
      b.addEventListener("click", function () {
        if (done) return; done = true; speakStop();
        var i = +b.dataset.i, ok = i === q.bonne_reponse;
        box.querySelectorAll(".answer").forEach(function (x) {
          x.disabled = true;
          if (+x.dataset.i === q.bonne_reponse) { x.classList.add("ok"); x.querySelector(".k").textContent = "✓"; x.querySelector(".etat").textContent = " (bonne réponse)"; }
        });
        if (!ok) { b.classList.add("ko"); b.querySelector(".k").textContent = "✗"; b.querySelector(".etat").textContent = " (ta réponse)"; }
        recordAnswer(q, ok);
        box.classList.add("done");
        var fb = box.querySelector(".fb");
        var lab = typeof opts.nextLabel === "function" ? opts.nextLabel(ok) : opts.nextLabel;
        if (opts.quick) {
          fb.classList.add("quick");
          fb.innerHTML = '<p class="quickfb ' + (ok ? "ok" : "ko") + '">' + (ok ? "✓ Bravo !" : "✗ C’était : " + esc(q.choix[q.bonne_reponse])) + "</p>";
        } else if (!opts.noFeedback) {
          fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "ko") + '"><h3>' + (ok ? "✓ Bravo ! " + (opts.okNote || "⭐") : "✗ " + esc(CFG.texteRate || "Raté !") + " La bonne réponse : " + esc(q.choix[q.bonne_reponse]) + (opts.koNote ? " " + opts.koNote : "")) +
            '</h3><p class="savais"><b>Le savais-tu ?</b> ' + esc(q.savais_tu) + "</p>" +
            '<div class="row">' + (lab ? '<button type="button" class="btn accent next">' + esc(lab) + (/[→!]$/.test(lab) ? "" : " →") + "</button>" : "") + speakBtn("Écouter l’explication") + "</div></div>";
          var nb = fb.querySelector(".next");
          if (nb) { nb.addEventListener("click", function () { opts.onNext && opts.onNext(ok); }); nb.focus({ preventScroll: true }); }
          var l2 = fb.querySelector(".lire"); if (l2) l2.addEventListener("click", function () { speak((ok ? "Bravo ! " : "La bonne réponse : " + q.choix[q.bonne_reponse] + ". ") + "Le savais-tu ? " + q.savais_tu); });
        }
        opts.onAnswer && opts.onAnswer(ok);
        if (!opts.quick && box.isConnected && box.classList.contains("done")) montrer(box);
      });
    });
    var h = box.querySelector("#q-texte"); if (h && opts.focus !== false) h.focus({ preventScroll: true });
  }
  function niveauLabel(d) { return ["", "Facile", "Moyen", "Difficile"][d] || ""; }

  /* ---------- Vues ---------- */
  function tenueIco() { var t = (CFG.tenues || []).filter(function (x) { return x.id === state.tenue; })[0]; return t ? t.ico : ""; }
  function mascot(size, cls) {
    var t = tenueIco();
    return '<span class="mascotte ' + (cls || "") + '" style="width:' + size + 'px"><img src="' + CFG.mascotte.image + '" alt="' + esc(CFG.mascotte.nom + ", " + CFG.mascotte.description) + '" width="' + size + '" height="' + size + '">' +
      (t ? '<span class="tenue" aria-hidden="true">' + t + "</span>" : "") + "</span>";
  }

  routes[""] = function () {
    var dq = state.jour[today()], r = rang();
    var bulle = CFG.mascotte.bulles[Math.floor(Math.random() * CFG.mascotte.bulles.length)];
    var nbErr = ALL.length ? state.erreurs.filter(function (id) { return BYID[id]; }).length : state.erreurs.length;
    app.innerHTML =
      '<section class="hero">' + mascot(150) + "<div><h1 tabindex=\"-1\">Bienvenue dans " + esc(CFG.nom) + " !</h1>" +
      '<p class="bulle">' + esc(CFG.mascotte.nom) + " : « " + esc(bulle) + " »</p>" +
      '<p class="muted">Tu as <b>' + state.etoiles + " ⭐</b> et " + Object.keys(state.badges).length + "/" + CFG.badges.length + " badges." +
      (r.nom ? " Rang : <b>" + esc(r.nom) + "</b>" + (r.next ? " (prochain rang à " + r.next.etoiles + " ⭐)" : " 🏆") : "") + "</p></div></section>" +
      '<a class="card daily" href="#/jour"><span class="emoji" aria-hidden="true">📅</span><div><h2 class="h3">Question du jour</h2><p style="margin:0">' +
      (dq ? (dq.ok ? "Réussie aujourd’hui ✅ Reviens demain !" : "Déjà jouée aujourd’hui. Reviens demain !") : "Une question spéciale chaque jour : +" + CFG.quiz.etoilesQuestionDuJour + " ⭐") + "</p></div></a>" +
      '<h2 class="section">Choisis ton univers</h2><div class="grid g4">' +
      CFG.univers.concat([CFG.mix]).map(function (u) {
        return '<a class="card univers u-' + u.id + '" href="#/univers/' + u.id + '"><span class="emoji" aria-hidden="true">' + u.emoji + "</span><h3>" + esc(u.nom) + "</h3><p>" + esc(u.description) + "</p></a>";
      }).join("") + "</div>" +
      '<h2 class="section">Mini-jeux</h2><div class="grid g4">' +
      '<a class="card" href="#/penalty"><span class="big" aria-hidden="true">🥅</span><h3>L’épreuve des 11 mètres</h3><p>Réponds juste, vise, et tire au bon moment !</p></a>' +
      '<a class="card" href="#/memory"><span class="big" aria-hidden="true">🚩</span><h3>Memory des drapeaux</h3><p>Retrouve quel drapeau va avec quel pays.</p></a>' +
      '<a class="card" href="#/erreurs"><span class="big" aria-hidden="true">🔁</span><h3>Revoir mes erreurs</h3><p>' + (nbErr ? nbErr + " question" + (nbErr > 1 ? "s" : "") + " à retenter." : "Aucune erreur à revoir. Bravo !") + "</p></a>" +
      '<a class="card" href="#/album"><span class="big" aria-hidden="true">🏅</span><h3>Mon album</h3><p>Tes étoiles, tes badges, tes records et ta tenue.</p></a>' +
      "</div>";
  };

  routes.univers = function (uid) {
    var u = universe(uid); if (!u) return go("");
    var cnt = ALL.filter(function (q) { return uid === CFG.mix.id || q.u === uid; }).length;
    app.innerHTML =
      '<div class="panel card univers u-' + u.id + '" style="cursor:default"><span class="emoji" aria-hidden="true">' + u.emoji + '</span><h1 tabindex="-1">' + esc(u.nom) + "</h1><p>" + esc(u.description) + " · " + cnt + " questions</p></div>" +
      '<h2 class="section">1. Ton niveau</h2><div class="choice-group" id="niv">' +
      CFG.niveaux.map(function (n) { return '<button type="button" class="btn blanc" data-n="' + n.id + '" aria-pressed="' + (state.niveau === n.id) + '">' + n.emoji + " " + esc(n.nom) + "</button>"; }).join("") +
      '</div><p class="muted" id="niv-desc"></p>' +
      '<h2 class="section">2. Ton jeu</h2><div class="grid">' +
      '<a class="card" id="go-rapide" href="#"><span class="big" aria-hidden="true">⚡</span><h3>Quiz rapide</h3><p>' + CFG.quiz.nbQuestions + " questions, à ton rythme.</p></a>" +
      '<a class="card" id="go-chrono" href="#"><span class="big" aria-hidden="true">⏱️</span><h3>Défi chrono</h3><p>' + CFG.quiz.chronoSecondes + " secondes : un maximum de bonnes réponses !</p></a></div>" +
      '<p><a class="btn blanc" href="#/">← Accueil</a></p>';
    function refresh() {
      app.querySelectorAll("#niv .btn").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.n === state.niveau)); });
      app.querySelector("#niv-desc").textContent = niveau(state.niveau).description + " · " + poolFor(uid, state.niveau).length + " questions à ce niveau.";
      app.querySelector("#go-rapide").href = "#/quiz/" + uid + "/rapide/" + state.niveau;
      app.querySelector("#go-chrono").href = "#/quiz/" + uid + "/chrono/" + state.niveau;
    }
    app.querySelectorAll("#niv .btn").forEach(function (b) { b.addEventListener("click", function () { state.niveau = +b.dataset.n; save(); refresh(); }); });
    refresh();
  };

  /* Quiz « classique » : utilisé par le quiz rapide et par « Revoir mes erreurs ». */
  function playList(qs, titre, retour, rejouer, mode) {
    var i = 0, score = 0, rates = [];
    if (!qs.length) { app.innerHTML = '<div class="panel result">' + mascot(120) + '<h1 tabindex="-1">Rien à revoir !</h1><p>Tu n’as aucune erreur en attente. Bravo !</p><p><a class="btn accent" href="#/">Accueil</a></p></div>'; return; }
    app.innerHTML = '<div class="panel"><div class="qhead"><span>' + titre + '</span><span class="row tight"><span id="cpt"></span><a class="pill quitter" href="' + retour + '" aria-label="Quitter la partie">✕ <span>Quitter</span></a></span></div>' +
      '<div class="progress" aria-hidden="true"><i id="bar"></i></div><div id="qbox"></div></div>';
    function cpt() { app.querySelector("#cpt").textContent = "Question " + (i + 1) + "/" + qs.length + " · " + score + " ⭐"; }
    function step() {
      cpt(); app.querySelector("#bar").style.width = (i / qs.length * 100) + "%";
      renderQuestion(app.querySelector("#qbox"), qs[i], {
        nextLabel: i + 1 < qs.length ? "Question suivante" : "Voir mon score",
        onAnswer: function (ok) {
          if (ok) { score++; addStars(CFG.quiz.etoilesParBonneReponse); if (mode === "erreurs") { state.erreurs = state.erreurs.filter(function (id) { return id !== qs[i].id; }); bump("corrigees"); save(); } }
          else rates.push(qs[i]);
          cpt();
        },
        onNext: function () { i++; if (i < qs.length) { step(); window.scrollTo(0, 0); } else end(); }
      });
    }
    function end() {
      newView();
      var parfait = score === qs.length && mode !== "erreurs", bonus = parfait ? CFG.quiz.bonusSansFaute : 0;
      if (parfait) { bump("parfaits"); addStars(bonus); }
      var nouveaux = checkBadges();
      var msg = score === qs.length ? "INCROYABLE, sans faute !" : score >= qs.length * 0.7 ? "Très fort !" : score >= qs.length * 0.4 ? "Bien joué, continue !" : "Chaque erreur t’apprend quelque chose !";
      app.innerHTML = '<div class="panel result"><div class="res-tete">' + mascot(140, "res-m") + '<div><h1 tabindex="-1">' + msg + '</h1><p class="big">' + score + "/" + qs.length + "</p><p>Tu gagnes <b>" + (score + bonus) + " ⭐</b>" + (bonus ? " (dont " + bonus + " de bonus sans faute)" : "") + ".</p></div></div>" +
        '<div class="row center"><a class="btn accent" href="' + rejouer + '" id="again">🔁 Rejouer</a><a class="btn blanc" href="' + retour + '">Changer de jeu</a><a class="btn blanc" href="#/">Accueil</a></div>' +
        badgesHtml(nouveaux) +
        (rates.length ? '<div class="recap"><h2>À retenir</h2><ul>' + rates.map(function (r) { return "<li><b>" + esc(r.question) + "</b><br>→ " + esc(r.choix[r.bonne_reponse]) + "</li>"; }).join("") + "</ul><p class=\"muted\">Ces questions t’attendent dans « Revoir mes erreurs ».</p></div>" : "") +
        "</div>";
      app.querySelector("#again").addEventListener("click", function (e) { e.preventDefault(); newView(); window.scrollTo(0, 0); rejouerFn(); });
      enHaut(); app.querySelector("h1").focus({ preventScroll: true });
    }
    var rejouerFn = function () { route(); };
    step();
    return { setReplay: function (f) { rejouerFn = f; } };
  }

  routes.quiz = function (uid, mode, niv) {
    var u = universe(uid); if (!u) return go("");
    niv = niveau(niv).id;
    if (mode === "chrono") return chrono(u, niv);
    var qs = draw(CFG.quiz.nbQuestions, uid, niv);
    var p = playList(qs, u.emoji + ' <span class="qt-nom">' + esc(u.nom) + " · " + esc(niveau(niv).nom) + "</span>", "#/univers/" + uid, "#/quiz/" + uid + "/rapide/" + niv, "rapide");
    if (p) p.setReplay(function () { routes.quiz(uid, "rapide", niv); });
  };

  routes.erreurs = function () {
    var ids = state.erreurs.filter(function (id) { return BYID[id]; });
    var qs = shuffle(ids).slice(0, CFG.quiz.nbQuestions).map(function (id) { return BYID[id]; });
    var p = playList(qs, '🔁 <span class="qt-nom">Revoir mes erreurs</span>', "#/", "#/erreurs", "erreurs");
    if (p) p.setReplay(function () { routes.erreurs(); });
  };

  function chrono(u, niv) {
    var total = CFG.quiz.chronoSecondes, left = total, score = 0, rates = [], fini = false, q, partie = { ids: {}, groupes: {} };
    app.innerHTML = '<div class="panel"><div class="qhead"><span>⏱️ <span class="qt-nom">Défi chrono · ' + esc(u.nom) + '</span></span><span class="row tight"><span id="sc">0 ⭐</span><span class="timer" id="t" role="timer" aria-live="off">' + left + 's</span>' +
      '<a class="pill quitter" href="#/univers/' + u.id + '" aria-label="Quitter le défi">✕ <span>Quitter</span></a></span></div><div id="qbox"></div></div>';
    var tEl = app.querySelector("#t");
    every(function () {
      left--; tEl.textContent = left + "s";
      tEl.classList.toggle("urgent", left <= 10 && CFG.quiz.chronoAlerte !== false);
      if (left <= 0) end(false);
    }, 1000);
    function step() {
      if (fini) return;
      q = nextQuestion(u.id, niv, partie);           // une question à la fois, jamais deux fois la même dans la partie
      if (!q) return end(true);
      renderQuestion(app.querySelector("#qbox"), q, {
        quick: true,
        onAnswer: function (ok) {
          if (ok) { score++; addStars(CFG.quiz.etoilesParBonneReponse); } else rates.push(q);
          app.querySelector("#sc").textContent = score + " ⭐";
          later(step, ok ? 700 : 1800);
        }
      });
    }
    function end(tout) {
      if (fini) return; fini = true; newView();
      var record = score > (state.stats.chrono || 0);
      setMax("chrono", score); var nouveaux = checkBadges();
      app.innerHTML = '<div class="panel result"><div class="res-tete">' + mascot(120, "res-m") + '<div><h1 tabindex="-1">' + (tout ? "Tu as répondu à toutes les questions de ce niveau !" : "Temps écoulé !") + '</h1><p class="big">' + score + " ⭐</p><p>" + (record ? "🏆 Nouveau record !" : "Ton record : " + state.stats.chrono + " bonnes réponses.") + "</p></div></div>" +
        '<div class="row center"><button type="button" class="btn accent" id="again">🔁 Rejouer</button><a class="btn blanc" href="#/univers/' + u.id + '">Changer de jeu</a><a class="btn blanc" href="#/">Accueil</a></div>' +
        badgesHtml(nouveaux) +
        (rates.length ? '<div class="recap"><h2>Les réponses à retenir</h2><ul>' + rates.map(function (r) { return "<li><b>" + esc(r.question) + "</b><br>→ " + esc(r.choix[r.bonne_reponse]) + ". <i>" + esc(r.savais_tu) + "</i></li>"; }).join("") + "</ul></div>" : "") +
        "</div>";
      app.querySelector("#again").addEventListener("click", function () { newView(); window.scrollTo(0, 0); chrono(u, niv); });
      enHaut(); app.querySelector("h1").focus({ preventScroll: true });
    }
    step();
  }

  routes.jour = function () {
    var d = dailyQuestion(), key = today(), deja = state.jour[key];
    var dateTxt = new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" });
    app.innerHTML = '<div class="panel"><h1 tabindex="-1">📅 Question du jour</h1><p class="muted">' + esc(dateTxt) + " · la même pour tous les copains !</p><div id='qbox'></div><div id='jfin'></div><p><a class='btn blanc' href='#/'>← Accueil</a></p></div>";
    var box = app.querySelector("#qbox");
    if (deja) {
      box.innerHTML = '<div class="feedback ' + (deja.ok ? "ok" : "ko") + '"><h3>' + (deja.ok ? "✓ Tu as réussi la question du jour !" : "Tu as déjà joué aujourd’hui.") + "</h3><p><b>" + esc(d.q.question) + "</b><br>→ " + esc(d.q.choix[d.q.bonne_reponse]) +
        '</p><p class="savais"><b>Le savais-tu ?</b> ' + esc(d.q.savais_tu) + "</p><p>Reviens demain pour une nouvelle question.</p></div>";
      return;
    }
    renderQuestion(box, d.q, {
      rnd: d.rnd, okNote: "+" + CFG.quiz.etoilesQuestionDuJour + " ⭐ !", nextLabel: "🏠 Accueil", onNext: function () { go(""); },
      onAnswer: function (ok) {
        state.jour = {}; state.jour[key] = { ok: ok, id: d.q.id }; // on ne garde que le jour courant
        if (ok) { bump("jours"); addStars(CFG.quiz.etoilesQuestionDuJour); }
        var nouveaux = checkBadges();
        app.querySelector("#jfin").innerHTML = badgesHtml(nouveaux);
      }
    });
  };

  routes.album = function () {
    var s = state.stats, r = rang();
    app.innerHTML = '<h1 tabindex="-1">🏅 Mon album</h1>' +
      '<div class="panel rangbox">' + mascot(90) + '<div><h2 class="h3">' + (r.nom ? "Rang : " + esc(r.nom) : "Mon rang") + "</h2>" +
      (r.next ? '<p>Encore <b>' + (r.next.etoiles - state.etoiles) + " ⭐</b> pour devenir <b>" + esc(r.next.nom) + '</b>.</p><div class="progress" aria-hidden="true"><i style="width:' + Math.round(state.etoiles / r.next.etoiles * 100) + '%"></i></div>' : "<p>Tu as atteint le plus haut rang ! 🏆</p>") + "</div></div>" +
      '<div class="stats">' +
      [["⭐", state.etoiles, "étoiles"], ["✅", s.bonnes, "bonnes réponses"], ["❓", s.repondues, "questions jouées"], ["⏱️", s.chrono, "record chrono"], ["🥅", s.buts, "buts marqués"], ["📅", s.jours, "questions du jour"]]
        .map(function (x) { return '<div class="stat"><span aria-hidden="true">' + x[0] + "</span><b>" + x[1] + "</b>" + x[2] + "</div>"; }).join("") +
      "</div>" +
      ((CFG.tenues || []).length ? '<h2 class="section">La tenue de ' + esc(CFG.mascotte.nom) + '</h2><p class="muted">Gagne des étoiles pour débloquer des accessoires.</p><div class="choice-group" id="tenues">' +
        '<button type="button" class="btn blanc" data-t="" aria-pressed="' + (state.tenue === "") + '">🙂 Sans rien</button>' +
        CFG.tenues.map(function (t) { var ok = state.etoiles >= t.etoiles; return '<button type="button" class="btn blanc" data-t="' + t.id + '" aria-pressed="' + (state.tenue === t.id) + '"' + (ok ? "" : " disabled") + ">" + t.ico + " " + esc(t.nom) + (ok ? "" : " · " + t.etoiles + " ⭐") + "</button>"; }).join("") + "</div>" : "") +
      '<h2 class="section">Badges (' + Object.keys(state.badges).length + "/" + CFG.badges.length + ')</h2><div class="badges">' +
      CFG.badges.map(function (b) {
        var ok = !!state.badges[b.id];
        return '<div class="badge' + (ok ? "" : " locked") + '"><span class="ico" aria-hidden="true">' + b.ico + "</span><b>" + esc(b.nom) + "</b><small>" + esc(b.desc) + "</small><small>" + (ok ? "Gagné ✅" : "À gagner") + "</small></div>";
      }).join("") + "</div>" +
      '<h2 class="section">Par univers</h2><div class="stats">' + CFG.univers.map(function (u) { return '<div class="stat"><span aria-hidden="true">' + u.emoji + "</span><b>" + (s["u_" + u.id] || 0) + "</b>" + esc(u.nom) + "</div>"; }).join("") + "</div>" +
      '<p class="row"><a class="btn blanc" href="#/">← Accueil</a><a class="btn blanc" href="parents.html#sauvegarde">💾 Sauvegarder ma progression</a><button type="button" class="btn blanc" id="reset">Tout remettre à zéro</button></p><div id="resetbox"></div>';
    app.querySelectorAll("#tenues .btn").forEach(function (b) { b.addEventListener("click", function () { state.tenue = b.dataset.t; save(); routes.album(); }); });
    app.querySelector("#reset").addEventListener("click", function () { parentGate(app.querySelector("#resetbox"), function () { resetAll(); routes.album(); toast("Tout a été remis à zéro."); }); });
  };

  /* Petite question pour les adultes avant une action importante (remise à zéro, restauration). */
  function parentGate(box, onOk, texte, bouton) {
    var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    box.innerHTML = '<div class="panel gate" role="dialog" aria-labelledby="gate-t"><h2 id="gate-t" class="h3">Demande à un adulte 🔒</h2><p>' + (texte || 'Cela efface <b>toutes</b> les étoiles et tous les badges de cet appareil. Une sauvegarde automatique est faite avant (restaurable depuis l’Espace parents).') + '</p>' +
      '<label for="gate-r">Combien font ' + a + " × " + b + ' ?</label> <input id="gate-r" inputmode="numeric" autocomplete="off" size="4"> ' +
      '<div class="row"><button type="button" class="btn" id="gate-ok">' + esc(bouton || "Effacer") + '</button><button type="button" class="btn blanc" id="gate-no">Annuler</button></div><p id="gate-msg" class="muted" aria-live="polite"></p></div>';
    var inp = box.querySelector("#gate-r"); inp.focus();
    box.querySelector("#gate-no").addEventListener("click", function () { box.innerHTML = ""; });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") box.querySelector("#gate-ok").click(); });
    box.querySelector("#gate-ok").addEventListener("click", function () {
      if (parseInt(inp.value, 10) === a * b) { box.innerHTML = ""; onOk(); } else box.querySelector("#gate-msg").textContent = "Ce n’est pas la bonne réponse.";
    });
  }
  function resetAll() {
    lsSet(CFG.stockage + ":sauvegarde-auto", JSON.stringify({ date: new Date().toISOString(), etat: state }));
    state = defaults(); HIST = { decks: {}, recent: [] }; save(); saveHist();
  }

  /* ---------- Code de sauvegarde (aucun serveur : un simple texte à copier) ---------- */
  function exportCode() {
    var json = JSON.stringify({ s: CFG.nom, d: today(), e: state });
    var b64 = btoa(unescape(encodeURIComponent(json)));
    return CFG.nom + "-" + b64 + "-" + (hash(b64) % 9000 + 1000);
  }
  function importCode(code, dryRun) {
    code = String(code || "").replace(/\s+/g, "");
    var m = code.match(/^([A-Z0-9]+)-([A-Za-z0-9+/=]+)-(\d{4})$/);
    if (!m) return { err: "Ce code n’a pas le bon format." };
    if (m[1] !== CFG.nom) return { err: "Ce code vient d’un autre site (" + m[1] + ")." };
    if (hash(m[2]) % 9000 + 1000 !== +m[3]) return { err: "Ce code est incomplet ou mal recopié." };
    var data; try { data = JSON.parse(decodeURIComponent(escape(atob(m[2])))); } catch (e) { return { err: "Ce code est illisible." }; }
    var s = sanitize(data && data.e);
    if (!dryRun) { lsSet(CFG.stockage + ":sauvegarde-auto", JSON.stringify({ date: new Date().toISOString(), etat: state })); state = s; save(); }
    return { ok: true, etat: s, date: data.d };
  }
  function restoreAuto() {
    var b; try { b = JSON.parse(lsGet(CFG.stockage + ":sauvegarde-auto") || "null"); } catch (e) { b = null; }
    if (!b || !b.etat) return null;
    var cur = state; state = sanitize(b.etat); save();
    lsSet(CFG.stockage + ":sauvegarde-auto", JSON.stringify({ date: new Date().toISOString(), etat: cur }));
    return state;
  }

  /* ---------- Routeur (#/route/param) ---------- */
  function go(path) { location.hash = "#/" + path; }
  function route() {
    newView();
    var parts = location.hash.replace(/^#\/?/, "").split("/").map(function (p) { try { return decodeURIComponent(p); } catch (e) { return ""; } });
    var name = parts.shift() || "";
    var fn = Object.prototype.hasOwnProperty.call(routes, name) ? routes[name] : routes[""];
    document.body.classList.toggle("jeu", /^(quiz|jour|erreurs|penalty|memory)$/.test(name) && fn !== routes[""]);
    document.body.setAttribute("data-vue", fn === routes[""] ? "accueil" : name);
    window.scrollTo(0, 0); majEcran();
    try { fn.apply(null, parts); }
    catch (e) { app.innerHTML = '<div class="panel"><h1 tabindex="-1">Oups !</h1><p>Un petit souci est arrivé. On revient à l’accueil.</p><p><a class="btn" href="#/">Accueil</a></p></div>'; if (window.console) console.warn(e); }
    var h = app.querySelector("h1"); if (h && !app.querySelector("#q-texte")) h.focus({ preventScroll: true });
    document.title = CFG.nom + " · " + CFG.slogan;
  }

  /* ---------- Démarrage ---------- */
  function applyBranding() {
    document.querySelectorAll("[data-cfg]").forEach(function (n) { var v = CFG[n.dataset.cfg]; if (v != null) n.textContent = v; });
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
  function protect() {
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { }); } catch (e) { }
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost")) {
      window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { }); });
    }
  }
  window.APP = { cfg: CFG, state: function () { return state; }, save: save, addStars: addStars, bump: bump, setMax: setMax, checkBadges: checkBadges, badgesHtml: badgesHtml,
    draw: draw, nextQuestion: nextQuestion, renderQuestion: renderQuestion, routes: routes, esc: esc, shuffle: shuffle, mascot: mascot, toast: toast, go: go,
    all: function () { return ALL; }, byId: function (id) { return BYID[id]; }, later: later, every: every, stop: stop, newView: newView, speak: speak, canSpeak: function () { return canSpeak; },
    dailyFor: dailyFor, exportCode: exportCode, importCode: importCode, restoreAuto: restoreAuto, sanitize: sanitize, parentGate: parentGate, resetAll: resetAll,
    hist: function () { return HIST; }, loadData: loadData, buildPool: buildPool,
    onResize: onResize, topH: topH, viewH: viewH, fige: fige, majEcran: majEcran, montrer: montrer };

  protect();
  document.addEventListener("DOMContentLoaded", function () {
    applyBranding(); majEcran();
    app = document.getElementById("app"); toastEl = document.getElementById("toast");
    updateStars();
    if (!app) { if (window.PARENTS_PAGE) loadData(function () { buildPool(); window.PARENTS_PAGE(); }); return; } // page parents
    Object.assign(routes, window.APP_ROUTES || {});
    // L'accueil n'a pas besoin des questions : on l'affiche tout de suite, pendant que les questions se chargent.
    var accueil = !location.hash.replace(/^#\/?/, "");
    if (accueil) route();
    loadData(function () { buildPool(); window.addEventListener("hashchange", route); if (!accueil || location.hash.replace(/^#\/?/, "")) route(); });
  });
})();
