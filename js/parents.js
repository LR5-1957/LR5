/* Espace parents (moteur partagé LR5/AR7) : statistiques, code de sauvegarde, restauration, installation.
 * Tout reste sur l'appareil : le « code de sauvegarde » est un simple texte à copier, rien n'est envoyé. */
(function () {
  "use strict";
  window.PARENTS_PAGE = function () {
    var A = window.APP, C = A.cfg, box = document.getElementById("parents-dyn");
    if (!box) return;
    function stats() {
      var s = A.state(), st = s.stats, all = A.all();
      var taux = st.repondues ? Math.round(st.bonnes / st.repondues * 100) + " %" : "–";
      return '<table><caption class="sr-only">Résumé de la progression</caption><tbody>' +
        "<tr><th scope=\"row\">Étoiles</th><td>" + s.etoiles + "</td></tr>" +
        "<tr><th scope=\"row\">Questions jouées</th><td>" + st.repondues + " (dont " + st.bonnes + " justes, " + taux + ")</td></tr>" +
        C.univers.map(function (u) { return "<tr><th scope=\"row\">" + u.emoji + " " + A.esc(u.nom) + "</th><td>" + (st["u_" + u.id] || 0) + " bonnes réponses</td></tr>"; }).join("") +
        "<tr><th scope=\"row\">Erreurs à revoir</th><td>" + s.erreurs.length + " (" + (st.corrigees || 0) + " déjà corrigées)</td></tr>" +
        "<tr><th scope=\"row\">Badges</th><td>" + Object.keys(s.badges).length + " / " + C.badges.length + "</td></tr>" +
        "<tr><th scope=\"row\">Questions disponibles</th><td>" + all.length + "</td></tr></tbody></table>";
    }
    function render() {
      box.innerHTML =
        '<h2 id="progression">La progression sur cet appareil</h2>' + stats() +
        '<h2 id="sauvegarde">💾 Sauvegarder ou déplacer la progression</h2>' +
        "<p>Les étoiles sont gardées dans le navigateur. Elles peuvent disparaître si on efface les données du navigateur, et, sur iPhone/iPad, si le site n’est pas ouvert pendant plusieurs semaines. " +
        "Pour ne rien perdre, copiez ce <b>code de sauvegarde</b> (dans une note ou un message à vous-même). Il sert aussi à passer d’une tablette à un téléphone.</p>" +
        '<label for="code-out"><b>Code de sauvegarde actuel</b></label><textarea id="code-out" readonly rows="4"></textarea>' +
        '<p class="row"><button type="button" class="btn" id="copier">📋 Copier le code</button><span id="copie-msg" class="muted" aria-live="polite"></span></p>' +
        '<label for="code-in"><b>Restaurer avec un code</b></label><textarea id="code-in" rows="4" placeholder="' + A.esc(C.nom) + '-…" autocomplete="off" spellcheck="false"></textarea>' +
        '<p class="row"><button type="button" class="btn blanc" id="verifier">Vérifier le code</button></p><div id="import-msg" aria-live="polite"></div><div id="gate"></div>' +
        '<h3>Annuler la dernière remise à zéro</h3><p>Avant chaque remise à zéro ou restauration, une copie automatique est gardée sur l’appareil.</p>' +
        '<p class="row"><button type="button" class="btn blanc" id="auto">↩️ Revenir à la copie automatique</button></p><div id="auto-msg" aria-live="polite"></div>' +
        '<h2 id="installer">📱 Mettre le site sur l’écran d’accueil</h2>' +
        "<ul><li><b>iPhone / iPad (Safari)</b> : bouton Partager <span aria-hidden=\"true\">⬆️</span> → « Sur l’écran d’accueil ». Le site s’ouvre alors comme une app, marche sans Internet, et Safari ne supprime plus les étoiles.</li>" +
        "<li><b>Android (Chrome)</b> : menu ⋮ → « Ajouter à l’écran d’accueil » ou « Installer l’application ».</li>" +
        "<li>Une fois ouvert une première fois, le site fonctionne aussi <b>sans connexion</b> (en voiture, en montagne…).</li></ul>" +
        '<p class="muted" id="persist"></p>';
      box.querySelector("#code-out").value = A.exportCode();
      box.querySelector("#copier").addEventListener("click", function () {
        var t = box.querySelector("#code-out"), msg = box.querySelector("#copie-msg");
        function ok() { msg.textContent = "✓ Code copié !"; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(ok, function () { t.select(); msg.textContent = "Sélectionnez le texte et copiez-le."; });
        else { t.select(); try { document.execCommand("copy"); ok(); } catch (e) { msg.textContent = "Sélectionnez le texte et copiez-le."; } }
      });
      box.querySelector("#verifier").addEventListener("click", function () {
        var code = box.querySelector("#code-in").value, msg = box.querySelector("#import-msg"), r = A.importCode(code, true);
        if (!r.ok) { msg.innerHTML = '<p class="quickfb ko">✗ ' + A.esc(r.err) + "</p>"; return; }
        msg.innerHTML = '<p class="quickfb ok">✓ Code valable' + (r.date ? " (sauvegardé le " + A.esc(r.date.split("-").reverse().join(".")) + ")" : "") + " : " + r.etat.etoiles + " étoiles, " + Object.keys(r.etat.badges).length + " badges.</p>";
        A.parentGate(box.querySelector("#gate"), function () {
          A.importCode(code, false); render(); box.querySelector("#import-msg").innerHTML = '<p class="quickfb ok">✓ Progression restaurée !</p>';
          box.querySelector("#import-msg").scrollIntoView({ block: "center" });
        }, "La progression actuelle (" + A.state().etoiles + " étoiles) sera remplacée par celle du code. Une copie automatique de la progression actuelle est gardée.", "Restaurer");
      });
      box.querySelector("#auto").addEventListener("click", function () {
        var msg = box.querySelector("#auto-msg");
        A.parentGate(msg, function () {
          var r = A.restoreAuto(); render();
          box.querySelector("#auto-msg").innerHTML = r ? '<p class="quickfb ok">✓ Copie automatique restaurée (' + r.etoiles + " étoiles).</p>" : '<p class="quickfb ko">Aucune copie automatique sur cet appareil.</p>';
        }, "On remplace la progression actuelle par la copie automatique (et la progression actuelle devient la nouvelle copie : on peut revenir en arrière).", "Restaurer");
      });
      var p = box.querySelector("#persist");
      if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(function (ok) {
        p.textContent = ok ? "✓ Le navigateur a accepté de garder les données de ce site durablement." : "ℹ️ Le navigateur peut effacer les données de ce site s’il manque de place : gardez un code de sauvegarde.";
      }, function () { });
      if (location.hash === "#sauvegarde") { var h = box.querySelector("#sauvegarde"); h.setAttribute("tabindex", "-1"); h.scrollIntoView(); h.focus({ preventScroll: true }); }
    }
    render();
  };
})();
