/* Mini-jeu « L'épreuve des 11 mètres » (moteur partagé LR5/AR7).
 * Une bonne réponse = un tir. On choisit son coin (en touchant le but ou avec les boutons), puis on tire
 * au bon moment sur la jauge : dans la zone verte, le tir est « parfait » et le gardien a beaucoup moins
 * de chances de l'arrêter. Réglages dans js/config.js > penalty.
 *
 * Mise en page : pendant le tir, l'écran est « figé » (hauteur visible exacte, sans défilement) :
 * terrain + but + gardien + ballon + commandes + résultat sont TOUJOURS visibles ensemble,
 * en portrait (commandes sous le but) comme en paysage (commandes à côté du but), même si on tourne l'appareil. */
(function () {
  "use strict";
  var KEEPER = '<svg viewBox="0 0 60 120" aria-hidden="true"><circle cx="30" cy="16" r="12" fill="#f1c27d"/><path d="M18 8 Q30 -2 42 8 L42 12 L18 12Z" fill="#333"/>' +
    '<rect x="14" y="30" width="32" height="44" rx="10" fill="#ff8a3d"/><text x="30" y="60" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">1</text>' +
    '<path d="M14 36 L0 6 M46 36 L60 6" stroke="#ff8a3d" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="6" r="7" fill="#2fb36d"/><circle cx="60" cy="6" r="7" fill="#2fb36d"/>' +
    '<rect x="16" y="72" width="28" height="16" fill="#1d2340"/><path d="M22 88 L20 116 M38 88 L40 116" stroke="#1d2340" stroke-width="9" stroke-linecap="round"/></svg>';
  var BALL = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#222" stroke-width="2"/><path d="M20 12 l7 5 -3 8 h-8 l-3 -8z" fill="#222"/><path d="M20 12V3 M27 17l8-3 M24 25l5 8 M16 25l-5 8 M13 17l-8-3" stroke="#222" stroke-width="2"/></svg>';
  var DIRS = [["left", "⬅️", "À gauche"], ["center", "⬆️", "Au milieu"], ["right", "➡️", "À droite"]];
  var JAUGE_MS = 1100; // durée d’un aller de la jauge

  function start() {
    var A = window.APP, C = A.cfg, G = C.penalty, nbTirs = G.tirs;
    var tir = 0, buts = 0, serie = 0, res = [], partie = { ids: {}, groupes: {} }, q = null, phase = "question";
    var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var app = document.getElementById("app");
    app.innerHTML = '<div class="pen" id="pen">' +
      '<div class="jeu-bar"><h1 tabindex="-1" class="jeu-t">🥅 <span>L’épreuve des 11 mètres</span></h1><div class="shots" id="shots" role="img" aria-label="Tirs"></div>' +
      '<a class="pill quitter" href="#/" aria-label="Quitter le jeu">✕ <span>Quitter</span></a></div>' +
      '<p class="muted pen-intro" id="intro">Réponds juste pour gagner un tir au but ! ⚽</p>' +
      '<div class="panel" id="pq"></div>' +
      '<div class="pen-stage" id="stage" hidden>' +
        '<div class="pitch-wrap" id="pwrap"><div class="pitch" id="pitch">' +
          '<div class="crowd" aria-hidden="true"></div><div class="stripes" aria-hidden="true"></div><div class="line" aria-hidden="true"></div><div class="goal" aria-hidden="true"></div><div class="spot" aria-hidden="true"></div>' +
          '<div class="keeper" id="keeper" aria-hidden="true">' + KEEPER + '</div><div class="ball" id="ball" aria-hidden="true">' + BALL + "</div>" +
          '<div class="zones" id="zones">' + DIRS.map(function (d) { return '<button type="button" class="zone z-' + d[0] + '" data-d="' + d[0] + '" aria-label="Viser ' + d[2].toLowerCase() + '"><span aria-hidden="true">🎯</span></button>'; }).join("") + "</div>" +
          '<div class="banner" id="banner" aria-hidden="true"></div><div class="pen-res" id="pres" aria-live="polite"></div>' +
        "</div></div>" +
        '<div class="pen-ctrl" id="ctrl"></div>' +
      "</div></div>";
    var pen = app.querySelector("#pen"), pq = app.querySelector("#pq"), stage = app.querySelector("#stage"), ctrl = app.querySelector("#ctrl");
    var pitch = app.querySelector("#pitch"), pwrap = app.querySelector("#pwrap"), zones = app.querySelector("#zones");
    var ball = app.querySelector("#ball"), keeper = app.querySelector("#keeper"), banner = app.querySelector("#banner"), pres = app.querySelector("#pres");

    zones.querySelectorAll(".zone").forEach(function (b) { b.addEventListener("click", function () { if (phase === "viser") aim(b.dataset.d); }); });

    /* Le terrain prend la plus grande taille possible (rapport 16/10) dans la place restante. */
    function layout() {
      if (phase === "question" || phase === "fin") return;
      A.majEcran();
      pitch.style.width = pitch.style.height = ""; pwrap.style.flex = ""; pwrap.style.height = "";
      var w = pwrap.clientWidth, h = pwrap.clientHeight;
      if (!w || !h) return;
      // Rapport largeur/hauteur entre 1,15 (portrait : terrain plus haut) et 1,6 (paysage).
      var ratio = Math.max(1.15, Math.min(1.6, w / h));
      var pw = Math.min(w, h * ratio), ph = Math.min(h, pw / ratio);
      pitch.style.width = Math.floor(pw) + "px"; pitch.style.height = Math.floor(ph) + "px";
      pitch.style.fontSize = Math.max(11, Math.min(26, pw / 26)) + "px";
      // En colonne (portrait), le terrain et les commandes sont regroupés au milieu de l’écran.
      if (getComputedStyle(stage).flexDirection === "column") { pwrap.style.flex = "0 0 auto"; pwrap.style.height = Math.floor(ph) + "px"; }
    }
    A.onResize(layout);

    function shotsBar() {
      var h = "";
      for (var k = 0; k < nbTirs; k++) h += "<span>" + (res[k] === true ? "⚽" : res[k] === false ? "❌" : k === tir ? "👟" : "·") + "</span>";
      app.querySelector("#shots").innerHTML = h;
      app.querySelector("#shots").setAttribute("aria-label", "Tir " + Math.min(tir + 1, nbTirs) + " sur " + nbTirs + ", " + buts + " but" + (buts > 1 ? "s" : ""));
    }
    function zonesActives(on) { zones.querySelectorAll(".zone").forEach(function (z) { z.disabled = !on; }); }
    function reset() { zonesActives(false); ball.className = "ball"; keeper.className = "keeper"; banner.className = "banner"; banner.textContent = ""; pres.className = "pen-res"; pres.innerHTML = ""; zones.querySelectorAll(".zone").forEach(function (z) { z.classList.remove("cible"); }); }
    function nextLabel() { return tir + 1 < nbTirs ? "Tir suivant →" : "Résultat →"; }

    /* Phase 1 : la question (écran normal). */
    function question() {
      phase = "question"; A.fige(false); pen.classList.remove("tir"); stage.hidden = true; pq.hidden = false;
      app.querySelector("#intro").hidden = tir > 0;
      reset(); shotsBar();
      q = A.nextQuestion(G.univers, A.state().niveau, partie);
      if (!q) return end();
      A.renderQuestion(pq, q, {
        okNote: "",
        koNote: "Ton tir passe au-dessus du but ! ❌",
        nextLabel: function (ok) { return ok ? "⚽ À toi de tirer !" : nextLabel(); },
        onAnswer: function (ok) { if (!ok) { res[tir] = false; serie = 0; shotsBar(); } },
        onNext: function (ok) { if (ok) viser(); else next(); }
      });
      window.scrollTo(0, 0);
    }
    /* Phase 2 : écran de tir figé. */
    function ouvrirTerrain() {
      pen.classList.add("tir"); pq.hidden = true; app.querySelector("#intro").hidden = true; stage.hidden = false;
      A.fige(true); layout();
    }
    function viser() {
      phase = "viser"; reset(); ouvrirTerrain();
      pitch.classList.add("aiming"); zonesActives(true);
      ctrl.innerHTML = '<p class="ctrl-t">🎯 Touche un coin du but pour viser !</p><div class="aim">' +
        DIRS.map(function (d) { return '<button type="button" class="btn accent" data-d="' + d[0] + '"><span aria-hidden="true">' + d[1] + '</span> <span class="lbl-d">' + d[2] + "</span></button>"; }).join("") + "</div>";
      ctrl.querySelectorAll("[data-d]").forEach(function (b) { b.addEventListener("click", function () { aim(b.dataset.d); }); });
      ctrl.querySelector("[data-d]").focus({ preventScroll: true });
      layout();
    }
    function aim(dir) {
      if (phase !== "viser") return;
      pitch.classList.remove("aiming"); zonesActives(false);
      zones.querySelector(".z-" + dir).classList.add("cible");
      if (calme || G.jauge === false) return shoot(dir, false);
      phase = "jauge";
      ctrl.innerHTML = '<p class="ctrl-t">Appuie quand la flèche est dans le <b>vert</b> !</p>' +
        '<div class="jauge" aria-hidden="true"><div class="zone-v"></div><div class="curseur" id="curseur"></div></div>' +
        '<button type="button" class="btn accent tirer" id="tirer">⚽ Tirer !</button>';
      layout();
      var t0 = Date.now(), cur = ctrl.querySelector("#curseur");
      function pos() { var t = ((Date.now() - t0) / JAUGE_MS) % 2; return t < 1 ? t : 2 - t; }
      var anim = A.every(function () { cur.style.left = (pos() * 100) + "%"; }, 30);
      var btn = ctrl.querySelector("#tirer"); btn.focus({ preventScroll: true });
      btn.addEventListener("click", function () { if (phase !== "jauge") return; var x = pos(); A.stop(anim); cur.style.left = (x * 100) + "%"; shoot(dir, x > 0.36 && x < 0.64); });
    }
    function shoot(dir, parfait) {
      phase = "tir";
      // Le gardien devine mieux quand la série de buts augmente ; un tir parfait (zone verte) le rend beaucoup moins dangereux.
      var p = Math.min(G.gardienDepart + G.gardienParBut * serie, G.gardienMax);
      if (parfait) p = p * (G.bonusParfait != null ? G.bonusParfait : 0.4);
      var autres = DIRS.map(function (d) { return d[0]; }).filter(function (d) { return d !== dir; });
      var kdir = Math.random() < p ? dir : autres[Math.floor(Math.random() * 2)];
      var but = kdir !== dir;
      ball.className = "ball shot-" + dir; keeper.className = "keeper " + kdir;
      ctrl.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      A.later(function () {
        phase = "resultat";
        banner.textContent = but ? "BUUUT ! ⚽" : "Arrêté ! 🧤"; banner.className = "banner show " + (but ? "ok" : "ko");
        res[tir] = but;
        if (but) { buts++; serie++; } else serie = 0;
        shotsBar();
        pres.innerHTML = but ? "✓ " + (parfait ? "Tir parfait, en plein dans le vert !" : "Le gardien a plongé du mauvais côté.") : "✗ Le gardien a deviné ton coin !" + (parfait ? "" : " Astuce : tire dans le vert.");
        pres.className = "pen-res show " + (but ? "ok" : "ko");
        ctrl.innerHTML = '<p class="ctrl-t">' + (but ? "Bravo ! " : "Pas de chance… ") + buts + " but" + (buts > 1 ? "s" : "") + " sur " + (tir + 1) + " tir" + (tir ? "s" : "") + '.</p><button type="button" class="btn accent tirer" id="nx">' + nextLabel() + "</button>";
        ctrl.querySelector("#nx").addEventListener("click", next); ctrl.querySelector("#nx").focus({ preventScroll: true });
        layout();
      }, calme ? 50 : 650);
    }
    function next() { tir++; if (tir < nbTirs) question(); else end(); }
    function end() {
      phase = "fin"; A.fige(false); pen.classList.remove("tir"); stage.hidden = true; pq.hidden = false; app.querySelector("#intro").hidden = true;
      reset(); shotsBar();
      var parfait = buts === nbTirs, gain = buts + (parfait ? 2 : 0);
      A.bump("buts", buts); if (parfait) A.bump("penaltyParfait");
      A.addStars(gain); var nouveaux = A.checkBadges();
      pq.classList.remove("qz", "done", "compact", "has-flag");
      pq.innerHTML = '<div class="result"><h2>' + (parfait ? "Tireur d’élite : " + nbTirs + " sur " + nbTirs + " ! 🏆" : buts >= 3 ? "Belle séance !" : "Le gardien était en forme… revanche ?") + "</h2>" +
        "<p>Tu as marqué <b>" + buts + "</b> but" + (buts > 1 ? "s" : "") + " et gagné <b>" + gain + " ⭐</b>.</p>" +
        '<div class="row center"><button type="button" class="btn accent" id="again">🔁 Nouvelle séance</button><a class="btn blanc" href="#/">Accueil</a></div>' + A.badgesHtml(nouveaux) + "</div>";
      pq.querySelector("#again").addEventListener("click", function () { A.newView(); window.scrollTo(0, 0); start(); }); pq.querySelector("#again").focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    question();
  }
  window.APP_ROUTES = window.APP_ROUTES || {};
  window.APP_ROUTES.penalty = start;
})();
