/* Mini-jeu « Memory des drapeaux » (moteur partagé LR5/AR7) : associe chaque drapeau au nom de son pays.
 * Réglages dans js/config.js > memory : pairesDepart, pairesMax, drapeaux (liste de codes, facultatif).
 *
 * Mise en page : le plateau occupe exactement la hauteur visible (sans défilement). Le nombre de colonnes
 * est recalculé selon l'écran (portrait, paysage, rotation) pour avoir les plus grandes cartes possibles.
 * Le message (« Bien vu ! », « Pas la bonne paire… ») est AU-DESSUS du plateau, et la fin s'affiche par-dessus. */
(function () {
  "use strict";
  function start() {
    var A = window.APP, F = window.QUIZ_FLAGS, M = A.cfg.memory;
    var n = Math.min(M.pairesMax, M.pairesDepart + (A.state().stats.memory || 0)); // une paire de plus à chaque partie finie
    var liste = (M.drapeaux || Object.keys(F.list)).filter(function (c) { return F.list[c]; });
    n = Math.min(n, liste.length);
    var codes = A.shuffle(liste).slice(0, n);
    var cards = A.shuffle(codes.map(function (c) { return { c: c, t: "f" }; }).concat(codes.map(function (c) { return { c: c, t: "n" }; })));
    var open = [], found = 0, coups = 0, lock = false;
    var app = document.getElementById("app");
    app.innerHTML = '<div class="mem" id="mem">' +
      '<div class="jeu-bar"><h1 tabindex="-1" class="jeu-t">🚩 <span>Memory des drapeaux</span></h1>' +
      '<span class="tag" id="coups">0 coup</span><span class="tag" id="paires">0/' + n + " paires</span>" +
      '<a class="pill quitter" href="#/" aria-label="Quitter le jeu">✕ <span>Quitter</span></a></div>' +
      '<p id="mmsg" class="mmsg" aria-live="polite">Retourne deux cartes : un drapeau et le nom de son pays.</p>' +
      '<div class="mem-wrap" id="mwrap"><div class="memory" id="grid">' + cards.map(function (k, i) { return '<button type="button" class="mcard back" data-i="' + i + '" aria-label="Carte cachée ' + (i + 1) + '"></button>'; }).join("") + "</div>" +
      '<div id="fin" class="mem-fin" aria-live="polite" hidden></div></div></div>';
    var btns = app.querySelectorAll(".mcard"), msg = app.querySelector("#mmsg"), grid = app.querySelector("#grid"), wrap = app.querySelector("#mwrap");
    A.fige(true);

    /* Choisit le nombre de colonnes qui donne les plus grandes cartes (rapport 4/3) dans la place disponible. */
    function layout() {
      A.majEcran();
      var W = wrap.clientWidth, H = wrap.clientHeight, N = cards.length, gap = W < 500 ? 6 : 10, best = null;
      if (!W || !H) return;
      for (var c = 2; c <= N; c++) {
        var r = Math.ceil(N / c);
        var w = Math.min((W - gap * (c - 1)) / c, ((H - gap * (r - 1)) / r) * 4 / 3, 260);
        if (!best || w > best.w + 0.5) best = { c: c, w: w };
      }
      var w = Math.floor(best.w), h = Math.floor(w * 3 / 4);
      grid.style.gridTemplateColumns = "repeat(" + best.c + "," + w + "px)";
      grid.style.gridAutoRows = h + "px"; grid.style.gap = gap + "px";
      grid.style.fontSize = Math.max(10, Math.min(18, w / 7.5)) + "px";
    }
    A.onResize(layout); layout();

    function face(b, k) {
      b.classList.remove("back"); b.classList.add("face");
      b.innerHTML = k.t === "f" ? F.svg(k.c, "Drapeau : " + F.list[k.c].nom) : "<span>" + A.esc(F.list[k.c].nom) + "</span>";
      b.setAttribute("aria-label", k.t === "f" ? "Drapeau de " + F.list[k.c].nom : "Pays : " + F.list[k.c].nom);
    }
    function hide(b, i) { b.className = "mcard back"; b.innerHTML = ""; b.setAttribute("aria-label", "Carte cachée " + (i + 1)); }
    function say(t, cls) { msg.textContent = t; msg.className = "mmsg " + (cls || ""); }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.i;
        if (lock || b.classList.contains("face")) return;
        face(b, cards[i]); open.push(i);
        if (open.length < 2) { say("Et maintenant, trouve sa paire !"); return; }
        coups++; app.querySelector("#coups").textContent = coups + (coups > 1 ? " coups" : " coup");
        var a = open[0], c = open[1]; open = [];
        if (cards[a].c === cards[c].c && cards[a].t !== cards[c].t) {
          btns[a].classList.add("found"); btns[c].classList.add("found"); btns[a].disabled = btns[c].disabled = true;
          found++; app.querySelector("#paires").textContent = found + "/" + n + " paires";
          say("✓ Bien vu : " + F.list[cards[a].c].nom + " !", "ok");
          if (found === n) A.later(end, 500);
        } else {
          lock = true; say("✗ Pas la bonne paire… retiens bien où elles sont !", "ko");
          A.later(function () { hide(btns[a], a); hide(btns[c], c); lock = false; }, 1200);
        }
      });
    });
    function end() {
      var gain = 3 + (coups <= n + 4 ? 2 : 0);
      A.bump("memory"); A.addStars(gain); var nouveaux = A.checkBadges();
      var fin = app.querySelector("#fin");
      fin.innerHTML = '<div class="feedback ok"><h2 class="h3">✓ Bravo, toutes les paires en ' + coups + " coups ! +" + gain + " ⭐</h2>" +
        '<div class="row center"><button type="button" class="btn accent" id="again">🔁 Rejouer</button><a class="btn blanc" href="#/">Accueil</a></div>' + A.badgesHtml(nouveaux) + "</div>";
      fin.hidden = false; say("🏆 Partie terminée !", "ok");
      A.garde(600);
      app.querySelector("#again").addEventListener("click", function (e) { if (A.bloque(e)) return; A.newView(); start(); }); app.querySelector("#again").focus({ preventScroll: true });
    }
  }
  window.APP_ROUTES = window.APP_ROUTES || {};
  window.APP_ROUTES.memory = start;
})();
