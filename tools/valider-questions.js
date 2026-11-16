#!/usr/bin/env node
/* Vérifie tous les fichiers de questions listés dans js/config.js.
 * Usage : node tools/valider-questions.js        (aucune installation nécessaire)
 *         node tools/valider-questions.js --details   (montre aussi les avertissements)
 * Bloquant (✘) : champ manquant, id en double, choix identiques, drapeau inconnu, question en double ou presque,
 *   réponse « soufflée » par une autre question du même univers, drapeau jumeau dans les choix, typographie.
 * Les questions qui portent le même « groupe » ne tombent jamais dans la même partie : elles ont le droit de se répondre. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const details = process.argv.includes("--details");
const ctx = { window: {} }; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
load("js/config.js"); load("js/flags.js");
const CFG = ctx.window.SITE_CONFIG, FLAGS = ctx.window.QUIZ_FLAGS.list;
const errors = [], warns = [], ids = new Set(), texts = new Map(), all = [];
// Drapeaux qui se ressemblent trop pour un enfant : jamais l'un comme piège de l'autre.
const JUMEAUX = [["Indonésie", "Monaco", "Pologne"], ["Roumanie", "Tchad", "Andorre", "Moldavie"], ["Colombie", "Équateur", "Venezuela"],
  ["Autriche", "Lettonie"], ["Pays-Bas", "Luxembourg", "Paraguay"], ["Italie", "Mexique", "Irlande"], ["Irlande", "Côte d'Ivoire"],
  ["Russie", "Slovaquie", "Slovénie", "Serbie"], ["Norvège", "Islande"], ["Australie", "Nouvelle-Zélande"], ["Suède", "Finlande"],
  ["Hongrie", "Bulgarie", "Italie"], ["Japon", "Bangladesh", "Palaos"], ["Danemark", "Suisse"], ["Mali", "Guinée", "Sénégal", "Cameroun"]];
const MOTS_VIDES = new Set("le la les l un une des du de d et en à au aux est sont a ont qui que quoi quel quelle quels quelles qu ce cet cette ces se sa son ses sur par pour dans avec il elle ils on ne pas plus comment combien où pourquoi quand y-a-t-il t s n c j m faut fait peut plus très tout tous toute".split(" "));
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, " ");
const mots = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 2 && !MOTS_VIDES.has(w));
const motsSet = s => new Set(mots(s));
// mots trop généraux pour prouver qu'une question parle du même sujet qu'une autre
const GENERIQUES = new Set("systeme solaire planete planetes pays gagne gagnee coupe monde terre autour ballon but buts equipe joueur joueurs match football etoile etoiles lune soleil ville trouve premier premiere grand grande petit petite appelle appelait nom porte seule".split(" "));
// réponse trop banale pour parler de « fuite » (nombres, oui/non, mots courants)
const banal = a => { const n = norm(a).trim(); return n.length < 4 || /^\d/.test(n) || /^(vrai|faux|oui|non|rouge|bleu|vert|jaune|blanc|noir|orange|aucun|aucune)\b/.test(n); };

let total = 0;
for (const u of CFG.univers) {
  load(u.fichier);
  const qs = (ctx.window.QUIZ_QUESTIONS || {})[u.id];
  if (!Array.isArray(qs)) { errors.push(`${u.fichier} : aucune liste QUIZ_QUESTIONS.${u.id}`); continue; }
  const par = { 1: 0, 2: 0, 3: 0 };
  qs.forEach((q, i) => {
    const w = `${u.fichier} #${i + 1} (${q.id || "sans id"})`;
    q._w = w; q._u = u.id; all.push(q);
    if (!q.id || typeof q.id !== "string") errors.push(`${w} : id manquant`);
    else if (ids.has(q.id)) errors.push(`${w} : id en double`); else ids.add(q.id);
    for (const k of ["theme", "question", "savais_tu"]) if (!q[k] || typeof q[k] !== "string" || !q[k].trim()) errors.push(`${w} : champ « ${k} » vide`);
    if (![1, 2, 3].includes(q.difficulte)) errors.push(`${w} : difficulte doit valoir 1, 2 ou 3`); else par[q.difficulte]++;
    if (!Array.isArray(q.choix) || q.choix.length !== 4) errors.push(`${w} : il faut exactement 4 choix`);
    else {
      if (new Set(q.choix.map(c => norm(c).trim())).size !== 4) errors.push(`${w} : deux choix identiques`);
      if (q.choix.some(c => !String(c).trim())) errors.push(`${w} : choix vide`);
      if (q.choix.some(c => String(c).length > 70)) errors.push(`${w} : un choix dépasse 70 caractères (illisible sur téléphone)`);
    }
    if (!Number.isInteger(q.bonne_reponse) || q.bonne_reponse < 0 || q.bonne_reponse > 3) errors.push(`${w} : bonne_reponse doit valoir 0, 1, 2 ou 3`);
    if (q.drapeau && !FLAGS[q.drapeau]) errors.push(`${w} : drapeau « ${q.drapeau} » inconnu dans js/flags.js`);
    if (q.maj != null && !(Number.isInteger(q.maj) && q.maj >= 2020)) errors.push(`${w} : « maj » doit être une année (ex. 2026)`);
    if (q.maj && q.maj < new Date().getFullYear()) warns.push(`${w} : fait vérifié en ${q.maj}, à revérifier (record ou actualité qui a pu changer)`);
    if (q.groupe != null && (typeof q.groupe !== "string" || !q.groupe)) errors.push(`${w} : « groupe » doit être un texte`);
    if (q.question && q.question.length > 150) errors.push(`${w} : question trop longue (${q.question.length} > 150)`);
    if (q.savais_tu && q.savais_tu.length > 260) errors.push(`${w} : « Le savais-tu » trop long (${q.savais_tu.length} > 260)`);
    // Typographie
    for (const t of [q.question, q.savais_tu, ...(q.choix || [])].map(String)) {
      if (/  /.test(t)) errors.push(`${w} : double espace dans « ${t.slice(0, 40)}… »`);
      if (/ [,.]/.test(t)) errors.push(`${w} : espace avant une virgule ou un point dans « ${t.slice(0, 40)}… »`);
      if (/(^|[\s(«])(Le|le|La|la) [aeiouhéèêAEIOUÉ][a-zéèêàùîôç]/.test(t) && !/(^|[\s(«])(le|la) (h|onze\b|ouest\b|yaourt\b|une-deux\b|uns?\b)/i.test(t))
        warns.push(`${w} : élision oubliée ? « ${t.match(/(^|[\s(«])((Le|le|La|la) [aeiouhéèêAEIOUÉ]\S*)/)[2]} »`);
    }
    if (/\?$/.test(q.question) === false && !/[?:…]$|\.$/.test(q.question)) warns.push(`${w} : la question ne finit pas par « ? »`);
    // Drapeaux jumeaux
    if (q.drapeau && Array.isArray(q.choix)) {
      const bon = q.choix[q.bonne_reponse];
      JUMEAUX.forEach(g => { if (g.includes(bon)) q.choix.forEach(c => { if (c !== bon && g.includes(c)) errors.push(`${w} : « ${c} » a presque le même drapeau que « ${bon} »`); }); });
    }
    const key = norm(q.question) + "|" + (q.drapeau || "");
    if (texts.has(key)) errors.push(`${w} : même question que ${texts.get(key)}`); else texts.set(key, q.id);
  });
  for (const n of CFG.niveaux) {
    const c = qs.filter(q => n.difficultes.includes(q.difficulte)).length;
    if (c < 2 * CFG.quiz.nbQuestions) errors.push(`${u.id} : seulement ${c} questions pour le niveau ${n.nom} (il en faut au moins ${2 * CFG.quiz.nbQuestions})`);
  }
  total += qs.length;
  console.log(`✔ ${u.nom.padEnd(18)} ${String(qs.length).padStart(4)} questions  (facile ${par[1]}, moyen ${par[2]}, difficile ${par[3]})`);
}

// Presque-doublons et réponses soufflées (dans un même univers ou dans le « Grand mélange »)
const memeGroupe = (a, b) => a.groupe && a.groupe === b.groupe;
for (const a of all) {
  a._m = motsSet(a.question); a._bon = Array.isArray(a.choix) ? String(a.choix[a.bonne_reponse]) : "";
  a._sujet = new Set([...a._m, ...mots(a._bon)]);
}
for (let i = 0; i < all.length; i++) for (let j = 0; j < all.length; j++) {
  if (i === j) continue;
  const a = all[i], b = all[j];
  if (memeGroupe(a, b)) continue;
  // 1) presque-doublon : mêmes mots-clés et même bonne réponse
  if (i < j && norm(a._bon) === norm(b._bon) && !a.drapeau && !b.drapeau) {
    const inter = [...a._m].filter(x => b._m.has(x)).length, uni = new Set([...a._m, ...b._m]).size;
    if (uni && inter / uni >= 0.5) errors.push(`${a.id} ≈ ${b.id} : presque la même question (même réponse « ${a._bon} »). Supprime l'une ou mets-les dans le même « groupe ».`);
  }
  // 2) fuite : la réponse de A est écrite dans B (question, choix ou savais_tu) ET B parle du même sujet que A
  if (banal(a._bon) || a.drapeau) continue;
  const rep = norm(a._bon).trim();
  const re = new RegExp("(^|[^a-z0-9])" + rep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9]|$)");
  const texteB = norm(b.question + " " + b.savais_tu);
  if (!re.test(texteB)) continue;
  const motsQA = [...a._m].filter(x => !mots(a._bon).includes(x));
  const communs = motsQA.filter(x => motsSet(b.question + " " + b.savais_tu).has(x));
  const forts = communs.filter(x => !GENERIQUES.has(x));
  if (communs.length >= 2) {
    const msg = `${b.id} souffle la réponse de ${a.id} (« ${a._bon} » ; mots communs : ${communs.join(", ")}). Reformule ou mets-les dans le même « groupe ».`;
    if (forts.length >= 2 || (forts.length >= 1 && communs.length >= 4)) errors.push(msg); else warns.push(msg);
  }
}

// Configuration
if (CFG.memory && CFG.memory.drapeaux) CFG.memory.drapeaux.forEach(c => { if (!FLAGS[c]) errors.push(`config memory : drapeau « ${c} » inconnu`); });
if (CFG.memory && CFG.memory.drapeaux && CFG.memory.drapeaux.length < CFG.memory.pairesMax) errors.push("config memory : pas assez de drapeaux pour pairesMax");
if (CFG.jour) { const n = all.filter(q => CFG.jour.difficultes.includes(q.difficulte)).length; if (n < 60) errors.push(`question du jour : seulement ${n} questions éligibles`); }
(CFG.badges || []).forEach(b => { if (!b.id || !b.stat || !(b.seuil >= 1)) errors.push(`badge mal configuré : ${JSON.stringify(b)}`); });

console.log(`Total : ${total} questions`);
if (warns.length) console.log(details ? `\n⚠ ${warns.length} avertissement(s) (non bloquants) :\n - ` + warns.join("\n - ") : `⚠ ${warns.length} avertissement(s) non bloquant(s) — voir avec --details`);
if (errors.length) { console.error(`\n✘ ${errors.length} problème(s) :\n - ` + [...new Set(errors)].join("\n - ")); process.exit(1); }
console.log("Tout est valide ✅");
