#!/usr/bin/env node
/* Vérifie tous les fichiers de questions listés dans js/config.js.
 * Usage : node tools/valider-questions.js   (aucune installation nécessaire) */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} }; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
load("js/config.js"); load("js/flags.js");
const CFG = ctx.window.SITE_CONFIG, FLAGS = ctx.window.QUIZ_FLAGS.list;
const errors = [], ids = new Set(), texts = new Map();
let total = 0;
for (const u of CFG.univers) {
  load(u.fichier);
  const qs = (ctx.window.QUIZ_QUESTIONS || {})[u.id];
  if (!Array.isArray(qs)) { errors.push(`${u.fichier} : aucune liste QUIZ_QUESTIONS.${u.id}`); continue; }
  const par = { 1: 0, 2: 0, 3: 0 };
  qs.forEach((q, i) => {
    const w = `${u.fichier} #${i + 1} (${q.id || "sans id"})`;
    if (!q.id || typeof q.id !== "string") errors.push(`${w} : id manquant`);
    else if (ids.has(q.id)) errors.push(`${w} : id en double`); else ids.add(q.id);
    for (const k of ["theme", "question", "savais_tu"]) if (!q[k] || typeof q[k] !== "string" || !q[k].trim()) errors.push(`${w} : champ « ${k} » vide`);
    if (![1, 2, 3].includes(q.difficulte)) errors.push(`${w} : difficulte doit valoir 1, 2 ou 3`); else par[q.difficulte]++;
    if (!Array.isArray(q.choix) || q.choix.length !== 4) errors.push(`${w} : il faut exactement 4 choix`);
    else {
      if (new Set(q.choix.map(c => String(c).trim().toLowerCase())).size !== 4) errors.push(`${w} : deux choix identiques`);
      if (q.choix.some(c => !String(c).trim())) errors.push(`${w} : choix vide`);
    }
    if (!Number.isInteger(q.bonne_reponse) || q.bonne_reponse < 0 || q.bonne_reponse > 3) errors.push(`${w} : bonne_reponse doit valoir 0, 1, 2 ou 3`);
    if (q.drapeau && !FLAGS[q.drapeau]) errors.push(`${w} : drapeau « ${q.drapeau} » inconnu dans js/flags.js`);
    const key = q.question + "|" + (q.drapeau || "");
    if (texts.has(key)) errors.push(`${w} : même question que ${texts.get(key)}`); else texts.set(key, q.id);
  });
  for (const n of CFG.niveaux) {
    const c = qs.filter(q => n.difficultes.includes(q.difficulte)).length;
    if (c < CFG.quiz.nbQuestions) errors.push(`${u.id} : seulement ${c} questions pour le niveau ${n.nom}`);
  }
  total += qs.length;
  console.log(`✔ ${u.nom.padEnd(18)} ${String(qs.length).padStart(4)} questions  (facile ${par[1]}, moyen ${par[2]}, difficile ${par[3]})`);
}
console.log(`Total : ${total} questions`);
if (errors.length) { console.error(`\n✘ ${errors.length} problème(s) :\n - ` + errors.join("\n - ")); process.exit(1); }
console.log("Tout est valide ✅");
