# LR5.ch · La ligue des curieux

Site de quiz et de mini-jeux pour les **9-10 ans** (créé pour Lorenzo) : Football, Géographie, Étoiles & espace.
C'est un **site statique** : de simples fichiers HTML, CSS et JavaScript. Pas de base de données, pas de compte, pas d'étape de « build ».

## Ce qu'il y a dedans

- **3 univers et un « Grand mélange »** : 505 questions (152 foot, 183 géographie, 170 espace), toutes vérifiées.
- **3 niveaux** : Découverte, Explorateur, Expert.
- **Quiz rapide** (10 questions), **Défi chrono** (60 secondes), **Question du jour** (la même pour tout le monde, jamais deux fois la même avant d'avoir fait le tour) et **Revoir mes erreurs**.
- **Pas de question répétée** : le site se souvient (sur l'appareil) des questions déjà posées et fait le tour de toutes avant d'en reposer une. Les questions « sœurs » (qui se donnent la réponse) ne tombent jamais dans la même partie.
- **🔊 Écouter** : la question et les réponses sont lues à voix haute (voix de l'iPad, sans Internet).
- **Étoiles ⭐, rangs, tenues de la mascotte, badges bronze/argent/or et album**.
- **Mini-jeux** : l'épreuve des 11 mètres (viser + jauge de tir) et le Memory des drapeaux.
- **Espace parents** (`parents.html`) : statistiques par univers, **code de sauvegarde** pour garder ou déplacer la progression, copie automatique, conseil « écran d'accueil ».
- **Marche hors ligne** une fois ouvert (voiture, avion) et s'installe comme une app (icône sur l'écran d'accueil).

## Structure

```
index.html            page principale (navigation par #/...)
parents.html          espace parents          404.html   page « introuvable »
js/config.js          ★ LA CONFIGURATION du site (nom, mascotte, niveaux, badges, réglages des jeux)
js/app.js             moteur : quiz, chrono, question du jour, étoiles, badges, album, sauvegarde
js/penalty.js         mini-jeu des penalties          js/memory.js   memory des drapeaux
js/parents.js         partie dynamique de l'espace parents
js/flags.js           drapeaux dessinés en SVG (aucune image externe)
data/*.js             les questions (football, geographie, espace)
css/style.css         style commun        css/theme.css   couleurs du site
assets/               mascotte, favicon, icônes d'écran d'accueil, image d'aperçu (og.png)
sw.js                 mode hors ligne     manifest.webmanifest   installation sur l'écran d'accueil
tools/valider-questions.js   vérifie les questions (à lancer avant chaque mise en ligne)
vercel.json           en-têtes de sécurité          robots.txt
```

`js/app.js`, `penalty.js`, `memory.js`, `parents.js`, `flags.js`, `css/style.css` et `tools/` sont **identiques sur lr5.ch et ar7.ch**.
Ce qui est propre au site : `js/config.js`, `data/`, `assets/`, `css/theme.css` et les pages HTML.

## Réglages utiles (`js/config.js`)

| Clé | Rôle |
|---|---|
| `stockage` | nom de la sauvegarde sur l'appareil (**ne jamais changer**, sinon les étoiles repartent à zéro) |
| `quiz.nbQuestions`, `quiz.chronoSecondes`, `quiz.chronoAlerte` | longueur du quiz, durée du chrono, clignotement des 10 dernières secondes |
| `jour.difficultes` | niveaux possibles pour la question du jour |
| `lecture.vitesse` | vitesse de la voix « Écouter » (1 = normale) |
| `penalty.gardienDepart / gardienParBut / gardienMax` | difficulté du gardien ; `penalty.jauge` : jauge d'adresse |
| `memory.drapeaux`, `pairesDepart`, `pairesMax` | drapeaux du memory et nombre de paires |
| `rangs`, `tenues`, `badges` | récompenses |

## Ajouter ou corriger une question

1. Ouvre le fichier de l'univers, par exemple `data/espace.js`, et copie une ligne `{ "id": ..., ... },` avant `];`.
2. Champs :
   - `id` : identifiant **unique** (ex. `"esp-200"`) ; `theme` : petite étiquette ; `difficulte` : 1, 2 ou 3
   - `question`, `choix` (**exactement 4**), `bonne_reponse` : position de la bonne réponse **en comptant depuis 0**
   - `savais_tu` : l'anecdote. **Attention** : elle ne doit pas donner la réponse d'une autre question !
   - `drapeau` (facultatif) : code pays de `js/flags.js` (`"ch"`, `"fr"`…)
   - `groupe` (facultatif) : même valeur pour des questions qui se donnent la réponse ; elles ne tomberont jamais ensemble
   - `maj` (facultatif) : année de vérification d'un fait qui peut changer (record, actualité) ; le validateur rappellera de le revérifier
3. Vérifie avec Node.js : `node tools/valider-questions.js` (et `--details` pour voir les avertissements).
   Il contrôle les 4 choix, les doublons et quasi-doublons, les anecdotes qui « spoilent », les drapeaux jumeaux
   (Colombie/Équateur…), la typographie et qu'il y a assez de questions par niveau.

## Tester sur ton ordinateur

Dans le dossier : `python3 -m http.server 8000`, puis ouvre http://localhost:8000

## Mettre à jour le site (GitHub → Vercel)

Le site est relié à Vercel : **chaque fichier envoyé sur GitHub met le site à jour tout seul** (en 1 minute environ).
Sur la page du dépôt : **Add file → Upload files**, glisse **le contenu** du dossier (pas le dossier lui-même), puis **Commit changes**.
Les fichiers de même nom sont remplacés.

## Vie privée

Aucun traceur, aucune statistique, aucun cookie, aucune police ni script externe. La progression reste dans le navigateur de l'appareil
(`localStorage`). `vercel.json` ajoute une politique de sécurité stricte (CSP) qui interdit de charger quoi que ce soit hors du site.
Règle d'or : jamais de nom de famille, d'école ou de photo des enfants sur le site.
