# LR5.ch · La ligue des curieux

Site de quiz et de mini-jeux pour les **9-10 ans** (créé pour Lorenzo) : Football, Géographie, Étoiles & espace.
C'est un **site statique** : de simples fichiers HTML, CSS et JavaScript. Pas de base de données, pas de compte, pas d'étape de « build ».

## Ce qu'il y a dedans

- **3 univers et un « Grand mélange »** : 505 questions (152 foot, 183 géographie, 170 espace), toutes vérifiées.
- **3 niveaux** : Découverte, Explorateur, Expert.
- **Quiz rapide** (10 questions), **Défi chrono** (60 secondes), **Question du jour** (la même pour tout le monde, jamais deux fois la même avant d'avoir fait le tour) et **Revoir mes erreurs**.
- **Pas de question répétée** : le site se souvient (sur l'appareil) des questions déjà posées et fait le tour de toutes avant d'en reposer une. Les questions « sœurs » (qui se donnent la réponse) ne tombent jamais dans la même partie.
- **🔊 Écouter** : la question et les réponses sont lues à voix haute par une **voix française féminine**, choisie automatiquement parmi les voix de l'appareil (voir « Lecture à voix haute » plus bas).
- **Étoiles ⭐, rangs, tenues de la mascotte, badges bronze/argent/or et album**. Les accessoires (casquette, lunettes, couronne, fusée) se portent sur Lino, plusieurs à la fois.
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
| `lecture.vitesse`, `lecture.hauteur` | vitesse et hauteur de la voix « Écouter » (1 = normale) |
| `penalty.gardienDepart / gardienParBut / gardienMax` | difficulté du gardien ; `penalty.jauge` : jauge d'adresse |
| `memory.drapeaux`, `pairesDepart`, `pairesMax` | drapeaux du memory et nombre de paires |
| `rangs`, `tenues`, `badges` | récompenses ; chaque tenue a une `place` (tete, yeux, dos : une seule par place) et son dessin `svg` (devant la mascotte) / `svgDos` (derrière), dans le repère de `assets/mascotte.svg` (viewBox 0 0 200 220) |

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

## Lecture à voix haute

Le site utilise la synthèse vocale du navigateur (`speechSynthesis`) : aucun service externe, aucun fichier audio, rien à configurer.
Il choisit tout seul la **voix française féminine la plus naturelle** présente sur l'appareil :

| Appareil | Voix choisie |
|---|---|
| iPhone / iPad | Audrey, Aurélie ou Marie si elles sont téléchargées (Réglages › Accessibilité › Contenu énoncé › Voix › Français), sinon Amélie (accent québécois) plutôt que Thomas (voix d'homme) |
| Mac (Safari) | Aurélie / Audrey / Marie, sinon Amélie |
| Edge (Windows, Mac) | Microsoft Denise ou Eloise « Natural » (voix en ligne de Microsoft) |
| Chrome (ordinateur) | « Google français » (voix en ligne de Google), sinon Hortense / Julie (Windows) |
| Android | la voix française de l'appareil (féminine par défaut) |

Les voix d'homme et les voix « gadgets » ne sont prises qu'en dernier recours, le français de France passe avant celui de Suisse, de Belgique ou du Canada. Le texte est lu phrase par phrase (certains navigateurs coupent les longues lectures). La voix utilisée s'affiche dans l'espace parents.

**Pourquoi pas des fichiers audio enregistrés à l'avance ?** Il faudrait environ 3 000 fichiers (20 Mo) à refaire à chaque nouvelle question, impossibles à envoyer avec « Upload files » de GitHub (100 fichiers maximum à la fois), et les voix libres disponibles hors ligne sont moins naturelles que les voix Apple, Google et Microsoft.
