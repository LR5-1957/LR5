/* Drapeaux dessinés en SVG (aucune image externe). Moteur partagé LR5/AR7.
 * Formes simplifiées, sans armoiries. Pour ajouter un drapeau : ajoute une entrée dans FLAGS. */
(function () {
  "use strict";
  var H = function (c) { return { t: "h", c: c }; };   // bandes horizontales (haut -> bas)
  var V = function (c) { return { t: "v", c: c }; };   // bandes verticales (gauche -> droite)
  var FLAGS = {
    ch: { nom: "Suisse", t: "ch" },
    fr: { nom: "France", d: V(["#0055A4", "#fff", "#EF4135"]) },
    it: { nom: "Italie", d: V(["#009246", "#fff", "#CE2B37"]) },
    be: { nom: "Belgique", d: V(["#111", "#FDDA24", "#EF3340"]) },
    ie: { nom: "Irlande", d: V(["#169B62", "#fff", "#FF883E"]) },
    ng: { nom: "Nigeria", d: V(["#008751", "#fff", "#008751"]) },
    de: { nom: "Allemagne", d: H(["#111", "#DD0000", "#FFCE00"]) },
    nl: { nom: "Pays-Bas", d: H(["#AE1C28", "#fff", "#21468B"]) },
    at: { nom: "Autriche", d: H(["#C8102E", "#fff", "#C8102E"]) },
    ru: { nom: "Russie", d: H(["#fff", "#0039A6", "#D52B1E"]) },
    hu: { nom: "Hongrie", d: H(["#CE2939", "#fff", "#477050"]) },
    pl: { nom: "Pologne", d: H(["#fff", "#DC143C"]) },
    ua: { nom: "Ukraine", d: H(["#0057B7", "#FFD700"]) },
    ee: { nom: "Estonie", d: H(["#0072CE", "#111", "#fff"]) },
    lt: { nom: "Lituanie", d: H(["#FDB913", "#006A44", "#C1272D"]) },
    co: { nom: "Colombie", t: "co" },
    jp: { nom: "Japon", t: "disc", bg: "#fff", fg: "#BC002D", cx: 50 },
    bd: { nom: "Bangladesh", t: "disc", bg: "#006A4E", fg: "#F42A41", cx: 45 },
    se: { nom: "Suède", t: "nordic", bg: "#006AA7", fg: "#FECC02" },
    dk: { nom: "Danemark", t: "nordic", bg: "#C8102E", fg: "#fff" },
    fi: { nom: "Finlande", t: "nordic", bg: "#fff", fg: "#002F6C" },
    no: { nom: "Norvège", t: "nordic", bg: "#BA0C2F", fg: "#00205B", border: "#fff" },
    is: { nom: "Islande", t: "nordic", bg: "#02529C", fg: "#DC1E35", border: "#fff" },
    es: { nom: "Espagne", t: "es" },
    cz: { nom: "Tchéquie", t: "cz" },
    gr: { nom: "Grèce", t: "gr" },
    tr: { nom: "Turquie", t: "tr" },
    gb: { nom: "Royaume-Uni", t: "gb" }
  };

  function svg(code, label) {
    var f = FLAGS[code];
    if (!f) return "";
    var w = f.t === "ch" ? 60 : 90, h = 60, s = "";
    if (f.t === "ch") {
      s = '<rect width="60" height="60" fill="#DA291C"/><path d="M25 12h10v13h13v10H35v13H25V35H12V25h13z" fill="#fff"/>';
    } else if (f.t === "co") {
      s = '<rect width="90" height="30" fill="#FCD116"/><rect y="30" width="90" height="15" fill="#003893"/><rect y="45" width="90" height="15" fill="#CE1126"/>';
    } else if (f.t === "es") {
      s = '<rect width="90" height="60" fill="#AA151B"/><rect y="15" width="90" height="30" fill="#F1BF00"/>';
    } else if (f.t === "cz") {
      s = '<rect width="90" height="30" fill="#fff"/><rect y="30" width="90" height="30" fill="#D7141A"/><path d="M0 0 L45 30 L0 60Z" fill="#11457E"/>';
    } else if (f.t === "gr") {
      for (var g = 0; g < 9; g++) s += '<rect y="' + (g * 60 / 9) + '" width="90" height="' + (60 / 9 + 0.3) + '" fill="' + (g % 2 ? "#fff" : "#0D5EAF") + '"/>';
      s += '<rect width="33.4" height="33.4" fill="#0D5EAF"/><rect x="13.35" width="6.7" height="33.4" fill="#fff"/><rect y="13.35" width="33.4" height="6.7" fill="#fff"/>';
    } else if (f.t === "tr") {
      s = '<rect width="90" height="60" fill="#E30A17"/><circle cx="33" cy="30" r="15" fill="#fff"/><circle cx="37" cy="30" r="12" fill="#E30A17"/><polygon points="44.5,30.0 49.6,28.2 49.7,22.9 52.9,27.1 58.1,25.6 55.0,30.0 58.1,34.4 52.9,32.9 49.7,37.1 49.6,31.8" fill="#fff"/>';
    } else if (f.t === "gb") {
      s = '<rect width="90" height="60" fill="#012169"/><path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/><path d="M0 0L90 60M90 0L0 60" stroke="#C8102E" stroke-width="4"/>' +
        '<path d="M45 0V60M0 30H90" stroke="#fff" stroke-width="18"/><path d="M45 0V60M0 30H90" stroke="#C8102E" stroke-width="10"/>';
    } else if (f.t === "disc") {
      s = '<rect width="90" height="60" fill="' + f.bg + '"/><circle cx="' + (f.cx * 0.9) + '" cy="30" r="18" fill="' + f.fg + '"/>';
    } else if (f.t === "nordic") {
      s = '<rect width="90" height="60" fill="' + f.bg + '"/>';
      if (f.border) s += '<rect x="24" width="16" height="60" fill="' + f.border + '"/><rect y="22" width="90" height="16" fill="' + f.border + '"/>';
      s += '<rect x="27" width="10" height="60" fill="' + f.fg + '"/><rect y="25" width="90" height="10" fill="' + f.fg + '"/>';
    } else {
      var n = f.d.c.length;
      f.d.c.forEach(function (c, i) {
        s += f.d.t === "h"
          ? '<rect y="' + (i * h / n) + '" width="90" height="' + (h / n + 0.5) + '" fill="' + c + '"/>'
          : '<rect x="' + (i * w / n) + '" width="' + (w / n + 0.5) + '" height="60" fill="' + c + '"/>';
      });
    }
    return '<svg class="flag" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + (label || "Drapeau") + '"><rect width="' + w + '" height="' + h + '" fill="#ddd"/>' + s +
      '<rect width="' + w + '" height="' + h + '" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/></svg>';
  }

  window.QUIZ_FLAGS = { list: FLAGS, svg: svg };
})();
