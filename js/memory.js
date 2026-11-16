/* Mini-jeu « Memory des drapeaux » : associe chaque drapeau au nom de son pays. */
(function () {
  "use strict";
  function start() {
    var A = window.APP, F = window.QUIZ_FLAGS, n = A.cfg.memory.paires;
    var codes = A.shuffle(Object.keys(F.list)).slice(0, n);
    var cards = A.shuffle(codes.map(function (c) { return { c: c, t: "f" }; }).concat(codes.map(function (c) { return { c: c, t: "n" }; })));
    var open = [], found = 0, coups = 0, lock = false;
    var app = document.getElementById("app");
    app.innerHTML = '<h1 tabindex="-1">🚩 Memory des drapeaux</h1><p class="muted">Retourne deux cartes : un drapeau et le nom de son pays. Trouve les ' + n + ' paires !</p>' +
      '<p class="row"><span class="tag" id="coups">0 coup</span><span class="tag" id="paires">0/' + n + ' paires</span></p>' +
      '<div class="memory" id="grid">' + cards.map(function (k, i) { return '<button class="mcard back" data-i="' + i + '" aria-label="Carte cachée ' + (i + 1) + '"></button>'; }).join("") + "</div>" +
      '<div id="fin" aria-live="polite"></div><p><a class="btn blanc" href="#/">← Accueil</a></p>';
    var btns = app.querySelectorAll(".mcard");
    function face(b, k) {
      b.classList.remove("back"); b.classList.add("face");
      b.innerHTML = k.t === "f" ? F.svg(k.c, "Drapeau : " + F.list[k.c].nom) : "<span>" + A.esc(F.list[k.c].nom) + "</span>";
      b.setAttribute("aria-label", k.t === "f" ? "Drapeau de " + F.list[k.c].nom : "Pays : " + F.list[k.c].nom);
    }
    function hide(b, i) { b.className = "mcard back"; b.innerHTML = ""; b.setAttribute("aria-label", "Carte cachée " + (i + 1)); }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.i;
        if (lock || b.classList.contains("face")) return;
        face(b, cards[i]); open.push(i);
        if (open.length < 2) return;
        coups++; app.querySelector("#coups").textContent = coups + (coups > 1 ? " coups" : " coup");
        var a = open[0], c = open[1]; open = [];
        if (cards[a].c === cards[c].c && cards[a].t !== cards[c].t) {
          btns[a].classList.add("found"); btns[c].classList.add("found"); btns[a].disabled = btns[c].disabled = true;
          found++; app.querySelector("#paires").textContent = found + "/" + n + " paires";
          if (found === n) end();
        } else {
          lock = true;
          setTimeout(function () { hide(btns[a], a); hide(btns[c], c); lock = false; }, 1100);
        }
      });
    });
    function end() {
      var gain = 3 + (coups <= n + 4 ? 2 : 0);
      A.bump("memory"); A.addStars(gain); A.checkBadges();
      app.querySelector("#fin").innerHTML = '<div class="feedback ok"><h3>Bravo, toutes les paires en ' + coups + " coups ! +" + gain + ' ⭐</h3><button class="btn jaune" id="again">🔁 Rejouer</button></div>';
      app.querySelector("#again").addEventListener("click", start); app.querySelector("#again").focus();
    }
  }
  window.APP_ROUTES = window.APP_ROUTES || {};
  window.APP_ROUTES.memory = start;
})();
