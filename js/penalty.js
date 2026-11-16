/* Mini-jeu « L'épreuve des 11 mètres » : une bonne réponse = un tir. */
(function () {
  "use strict";
  var KEEPER = '<svg viewBox="0 0 60 120" aria-hidden="true"><circle cx="30" cy="16" r="12" fill="#f1c27d"/><path d="M18 8 Q30 -2 42 8 L42 12 L18 12Z" fill="#333"/>' +
    '<rect x="14" y="30" width="32" height="44" rx="10" fill="#ff8a3d"/><text x="30" y="60" font-size="18" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">1</text>' +
    '<path d="M14 36 L0 6 M46 36 L60 6" stroke="#ff8a3d" stroke-width="9" stroke-linecap="round"/><circle cx="0" cy="6" r="7" fill="#2fb36d"/><circle cx="60" cy="6" r="7" fill="#2fb36d"/>' +
    '<rect x="16" y="72" width="28" height="16" fill="#1d2340"/><path d="M22 88 L20 116 M38 88 L40 116" stroke="#1d2340" stroke-width="9" stroke-linecap="round"/></svg>';
  var BALL = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#fff" stroke="#222" stroke-width="2"/><path d="M20 12 l7 5 -3 8 h-8 l-3 -8z" fill="#222"/><path d="M20 12V3 M27 17l8-3 M24 25l5 8 M16 25l-5 8 M13 17l-8-3" stroke="#222" stroke-width="2"/></svg>';
  var DIRS = [["left", "⬅️ À gauche"], ["center", "⬆️ Au milieu"], ["right", "➡️ À droite"]];

  function start() {
    var A = window.APP, C = A.cfg, nbTirs = C.penalty.tirs;
    var tir = 0, buts = 0, serie = 0, res = [];
    var qs = A.draw(nbTirs + 5, C.penalty.univers, A.state().niveau);
    var app = document.getElementById("app");
    app.innerHTML = '<h1 tabindex="-1">🥅 L\'épreuve des 11 mètres</h1><p class="muted">Réponds juste pour gagner le droit de tirer. Attention : plus tu marques d\'affilée, plus le gardien devient fort !</p>' +
      '<div class="pitch" id="pitch" aria-hidden="true"><div class="crowd"></div><div class="stripes"></div><div class="line"></div><div class="goal"></div><div class="spot"></div>' +
      '<div class="keeper" id="keeper">' + KEEPER + '</div><div class="ball" id="ball">' + BALL + '</div><div class="banner" id="banner"></div></div>' +
      '<div class="shots" id="shots" aria-label="Tirs"></div><div class="panel" id="pz" aria-live="polite"></div>';
    var pz = app.querySelector("#pz"), ball = app.querySelector("#ball"), keeper = app.querySelector("#keeper"), banner = app.querySelector("#banner");

    function shotsBar() {
      var h = "";
      for (var k = 0; k < nbTirs; k++) h += "<span>" + (res[k] === true ? "⚽" : res[k] === false ? "❌" : k === tir ? "👟" : "·") + "</span>";
      app.querySelector("#shots").innerHTML = h;
      app.querySelector("#shots").setAttribute("aria-label", "Tir " + Math.min(tir + 1, nbTirs) + " sur " + nbTirs + ", " + buts + " but(s)");
    }
    function reset() { ball.className = "ball"; keeper.className = "keeper"; banner.className = "banner"; }
    function show(txt) { banner.textContent = txt; banner.className = "banner show"; }

    function question() {
      reset(); shotsBar();
      A.renderQuestion(pz, qs[tir], {
        onAnswer: function (ok) {
          var fb = pz.querySelector(".fb");
          if (ok) {
            fb.innerHTML = '<div class="feedback ok"><h3>Bonne réponse ! À toi de tirer : choisis ton coin 👇</h3><p class="savais"><b>Le savais-tu ?</b> ' + A.esc(qs[tir].savais_tu) + "</p>" +
              '<div class="aim">' + DIRS.map(function (d) { return '<button class="btn jaune" data-d="' + d[0] + '">' + d[1] + "</button>"; }).join("") + "</div></div>";
            fb.querySelectorAll("[data-d]").forEach(function (b) { b.addEventListener("click", function () { shoot(b.dataset.d); }); });
            fb.querySelector("[data-d]").focus();
          } else {
            ball.className = "ball miss"; setTimeout(function () { show("Raté… 😬"); }, 450);
            fb.innerHTML = '<div class="feedback ko"><h3>Mauvaise réponse : ton tir passe au-dessus ! La bonne réponse : ' + A.esc(qs[tir].choix[qs[tir].bonne_reponse]) + '</h3><p class="savais"><b>Le savais-tu ?</b> ' + A.esc(qs[tir].savais_tu) + "</p>" +
              '<button class="btn jaune" id="nx">' + (tir + 1 < nbTirs ? "Tir suivant →" : "Résultat →") + "</button></div>";
            res[tir] = false; serie = 0; shotsBar();
            pz.querySelector("#nx").addEventListener("click", next); pz.querySelector("#nx").focus();
          }
        }
      });
    }
    function shoot(dir) {
      // Le gardien devine mieux quand la série de buts augmente (20 % de chances au départ, +12 % par but d'affilée, 65 % maximum).
      var p = Math.min(0.2 + 0.12 * serie, 0.65), autres = DIRS.map(function (d) { return d[0]; }).filter(function (d) { return d !== dir; });
      var kdir = Math.random() < p ? dir : autres[Math.floor(Math.random() * 2)];
      var but = kdir !== dir;
      ball.className = "ball shot-" + dir; keeper.className = "keeper " + kdir;
      pz.querySelectorAll("[data-d]").forEach(function (b) { b.disabled = true; });
      setTimeout(function () {
        show(but ? "BUUUT ! ⚽" : "Arrêté par le gardien ! 🧤");
        res[tir] = but;
        if (but) { buts++; serie++; } else serie = 0;
        shotsBar();
        var fb = pz.querySelector(".fb");
        fb.innerHTML = '<div class="feedback ' + (but ? "ok" : "ko") + '"><h3>' + (but ? "But ! Le gardien a plongé du mauvais côté." : "Le gardien a deviné ton coin !") + "</h3>" +
          '<button class="btn jaune" id="nx">' + (tir + 1 < nbTirs ? "Tir suivant →" : "Résultat →") + "</button></div>";
        pz.querySelector("#nx").addEventListener("click", next); pz.querySelector("#nx").focus();
      }, 600);
    }
    function next() { tir++; if (tir < nbTirs) question(); else end(); }
    function end() {
      reset(); shotsBar();
      var parfait = buts === nbTirs, gain = buts + (parfait ? 2 : 0);
      A.bump("buts", buts); if (parfait) A.bump("penaltyParfait");
      A.addStars(gain); A.checkBadges();
      show(buts + " / " + nbTirs);
      pz.innerHTML = '<div class="result"><h2>' + (parfait ? "Tireur d'élite : 5 sur 5 ! 🏆" : buts >= 3 ? "Belle séance !" : "Le gardien était en forme… revanche ?") + "</h2>" +
        "<p>Tu as marqué <b>" + buts + "</b> but(s) et gagné <b>" + gain + " ⭐</b>.</p>" +
        '<div class="row" style="justify-content:center"><button class="btn jaune" id="again">🔁 Nouvelle séance</button><a class="btn blanc" href="#/">Accueil</a></div></div>';
      pz.querySelector("#again").addEventListener("click", start); pz.querySelector("#again").focus();
    }
    question();
  }
  window.APP_ROUTES = window.APP_ROUTES || {};
  window.APP_ROUTES.penalty = start;
})();
