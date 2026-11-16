# LR5.ch · La ligue des curieux

Site de quiz et de mini-jeux pour les **9-10 ans** (créé pour Lorenzo) : Football, Géographie, Étoiles & espace.
C'est un **site statique** : de simples fichiers HTML, CSS et JavaScript. Pas de base de données, pas de serveur, pas d'installation, pas d'étape de « build ».

## Ce qu'il y a dedans

- **3 univers et un « Grand mélange »** : 358 questions en tout (104 sur le foot, 129 en géographie, 125 sur l'espace)
- **3 niveaux** : Découverte (facile pour 9 ans), Explorateur (moyen), Expert (un vrai défi pour un curieux de 10 ans)
- **Quiz rapide** (10 questions), **Défi chrono** (60 secondes) et **Question du jour** (la même pour tout le monde, chaque jour)
- **« Le savais-tu ? »** après chaque réponse
- **Étoiles ⭐, badges et album**
- **Mini-jeux** : L'épreuve des 11 mètres (penalties) et le Memory des drapeaux
- **Espace parents** (`parents.html`) : il explique qu'il n'y a ni compte, ni collecte, ni pub, et que la progression reste sur l'appareil

Les questions et les réponses sont mélangées à chaque partie, et une question ne revient pas pendant la même session tant que le paquet n'est pas épuisé.

## Structure

```
index.html          page principale (toutes les pages du jeu, navigation par #/...)
parents.html        espace parents
js/config.js        ★ LA CONFIGURATION : nom, slogan, couleurs, mascotte, univers, niveaux, badges
js/app.js           moteur : quiz, chrono, question du jour, étoiles, badges, album
js/penalty.js       mini-jeu des penalties
js/memory.js        mini-jeu memory des drapeaux
js/flags.js         drapeaux dessinés en SVG (sans aucune image externe)
data/football.js    questions du foot
data/geographie.js  questions de géographie
data/espace.js      questions sur l'espace
css/style.css       style
assets/mascotte.svg mascotte (Lino le lynx, maillot n°5)
assets/favicon.svg  icône d'onglet
tools/valider-questions.js   vérifie les questions
vercel.json         en-têtes de sécurité (bloque tout script ou contenu externe)
```

## Ajouter ou corriger une question

1. Ouvre le fichier de l'univers, par exemple `data/espace.js`.
2. Copie une ligne `{ "id": ..., ... },` et colle-la à la fin de la liste, avant `];`.
3. Change :
   - `id` : un identifiant **unique**, par exemple `"esp-126"`
   - `theme` : la petite étiquette affichée, par exemple `"Planètes"`
   - `difficulte` : `1` (facile), `2` (moyen) ou `3` (difficile)
   - `question`, puis `choix` : **exactement 4** réponses
   - `bonne_reponse` : la position de la bonne réponse dans `choix`, **en comptant à partir de 0** (0 = la 1re, 1 = la 2e, 2 = la 3e, 3 = la 4e)
   - `savais_tu` : l'anecdote affichée après la réponse
   - `drapeau` (facultatif) : le code d'un pays de `js/flags.js` (`"ch"`, `"fr"`, `"jp"`…), pour afficher un drapeau
4. Vérifie avec Node.js (si tu l'as) : `node tools/valider-questions.js`. Il contrôle les 4 choix, la bonne réponse, les identifiants en double, etc.

Ce n'est pas grave si la bonne réponse est toujours la première de la liste : les réponses sont mélangées à l'affichage.
Écris seulement des faits stables et vérifiés. Évite les choses qui changent, comme l'équipe actuelle d'un joueur ou les derniers résultats.

## Ajouter un univers

1. Crée `data/animaux.js` sur le modèle des autres, avec `window.QUIZ_QUESTIONS.animaux = [ ... ];`.
2. Ajoute une ligne dans `univers` dans `js/config.js` : `{ id: "animaux", nom: "Animaux", emoji: "🦊", description: "...", fichier: "data/animaux.js" }`.
3. Ajoute une couleur de carte dans `css/style.css` : `.u-animaux{background:linear-gradient(135deg,#xxxxxx,#yyyyyy)}`.

## Créer le site frère (ar7.ch pour Alessandro)

Tout ce qui est propre au site est dans `js/config.js`, `assets/` et `data/`. Pour ar7.ch :
1. Copie tout le dossier dans un nouveau dépôt `ar7`.
2. Dans `js/config.js`, change `nom`, `domaine`, `slogan`, `public`, **`stockage`** (par exemple `"ar7:v1"`, pour que les deux sites ne mélangent pas leurs étoiles), `mascotte`, `couleurs` et les niveaux. Pour un enfant de 7 ans, on peut aussi baisser `quiz.nbQuestions` et monter `quiz.chronoSecondes`.
3. Remplace `assets/mascotte.svg` et adapte les questions dans `data/` (des phrases plus courtes et du vocabulaire simple pour 7 ans).

## Tester sur ton ordinateur

Double-clique sur `index.html`, le site marche même sans serveur. Ou, dans le dossier :
`python3 -m http.server 8000`, puis ouvre http://localhost:8000


## Vie privée

Il n'y a aucun traceur, aucune statistique, aucune police ni aucun script externe, et aucun cookie. La progression (étoiles, badges) est gardée dans le `localStorage` du navigateur, sur l'appareil seulement. `vercel.json` ajoute une politique de sécurité (CSP) qui interdit de charger quoi que ce soit hors du site.
