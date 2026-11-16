/* Drapeaux dessinés en SVG (aucune image externe).
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
    no: { nom: "Norvège", t: "nordic", bg: "#BA0C2F", fg: "#00205B", border: "#fff" }
  };

  function svg(code, label) {
    var f = FLAGS[code];
    if (!f) return "";
    var w = f.t === "ch" ? 60 : 90, h = 60, s = "";
    if (f.t === "ch") {
      s = '<rect width="60" height="60" fill="#DA291C"/><path d="M25 12h10v13h13v10H35v13H25V35H12V25h13z" fill="#fff"/>';
    } else if (f.t === "co") {
      s = '<rect width="90" height="30" fill="#FCD116"/><rect y="30" width="90" height="15" fill="#003893"/><rect y="45" width="90" height="15" fill="#CE1126"/>';
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
