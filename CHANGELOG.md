# Journal des changements · lr5.ch

## Version 5 · novembre 2026 : accessoires sur la mascotte et voix féminine

- **Accessoires bien portés par Lino** : la casquette et la couronne sont posées sur la tête, les lunettes sur les yeux, la fusée dans le dos (avec ses bretelles). Avant, l'accessoire était un petit dessin collé dans le coin, à côté de la mascotte. Ils sont maintenant dessinés dans le même cadre que Lino, donc ils restent à leur place à toutes les tailles : accueil, album, écran de score, téléphone, tablette, ordinateur, zoom, grand texte, rotation.
- **Plusieurs accessoires à la fois** : lunettes + casquette + fusée, par exemple (une seule chose sur la tête). Toucher à nouveau un accessoire l'enlève, « Sans rien » enlève tout. Un aperçu de Lino est affiché à côté des boutons. La tenue déjà choisie en v4 est gardée.
- **Voix française féminine** pour le bouton 🔊 : le site choisit la plus naturelle de l'appareil (Audrey, Aurélie, Marie ou Amélie sur iPhone/iPad/Mac, Denise sur Edge, « Google français » sur Chrome, la voix française d'Android), jamais une voix d'homme s'il existe une voix de femme. Lecture un peu plus posée, phrase par phrase. La voix utilisée s'affiche dans l'espace parents.
- Version du cache changée : les appareils prennent la nouvelle version tout seuls.

## Version 4 · novembre 2026 : contre-vérification complète

### Jeux
- **Penalty, téléphone tenu verticalement** : le terrain remplit maintenant l'écran (fini le grand vide au-dessus et en dessous du but). Le but garde ses proportions en haut, le ballon attend sur la pelouse devant, et le message du résultat ne cache plus rien.
- **Anti « double tap »** : un deuxième tap trop rapide d'un petit doigt ne valide plus par erreur l'écran suivant (réponse à la question suivante, visée ou tir partis tout seuls, résultat du tir sauté, « Rejouer » involontaire). Le clavier n'est pas concerné.
- **Défi chrono** : le temps est calculé sur l'horloge (plus de dérive), et il se met **en pause** si l'enfant quitte l'onglet ou l'appli (appel, autre appli), puis reprend au retour.
- **Quiz** : si on tourne l'appareil après avoir répondu, la réponse, l'explication et le bouton suivant se replacent tout seuls à l'écran.
- **Plus aucune question revue trop tôt en changeant de mode** : une question vue dans le « mélange », un univers ou le penalty compte comme vue partout ; on fait toujours le tour complet avant d'en revoir une (l'historique de la v3 est repris tel quel).

### Questions (505, toutes relues)
- La **question du jour** ne prend plus que des questions faciles ou moyennes (comme annoncé en v2).
- Anecdotes « Le savais-tu ? » qui donnaient la réponse d'une autre question, réécrites : Lune (années des missions Apollo), éclipses, Bételgeuse, Ganymède, Budapest (Danube), Zurich (Berne), Brésil (portugais), Mexique (espagnol).
- Nouvelles « questions sœurs » (jamais dans la même partie) : phases de la Lune / éclipses, Soleil / étoiles, cycle de la Lune, et 4 paires en football et géographie.
- Fait mis à jour : Saturne a **des centaines** de lunes connues (et plus seulement « des dizaines »).
- Faits récents revérifiés sur le web : Coupe du monde 2026 (Espagne 1-0 Argentine après prolongation), Ballon d'Or 2026 (Harry Kane), Artemis II (avril 2026, 406 771 km, Jeremy Hansen), 15 Ligues des champions du Real Madrid, 8 Ballons d'Or de Messi.
- Badge « 5 quiz sans faute » renommé **« Archer du savoir »** (il avait presque le même nom que le badge du penalty, « Tireur d'élite »).

### Affichage et accessibilité
- Très petits téléphones (iPhone SE 1re génération 320 px, Galaxy Fold plié 280 px) : plus de débordement sur le côté, question + 4 réponses visibles sans défiler.
- Le texte suit le réglage **« taille du texte » de l'appareil ou du navigateur** (avant, il était fixé en pixels) ; testé avec un texte agrandi de 50 % et un zoom à 200 %.
- Bouton « ✕ Quitter » du penalty et du memory : contraste corrigé (blanc sur gris clair, peu lisible).
- Plus de zoom involontaire au double tap sur les boutons (tablettes).
- Barre de progression de l'album : elle montre maintenant le chemin depuis le rang actuel jusqu'au suivant.

### Parents et technique
- Question pour adulte (remise à zéro, restauration) plus difficile pour un enfant : par exemple 17 × 8 au lieu de 7 × 8.
- Service worker : la nouvelle version télécharge toujours les fichiers en ligne (jamais une vieille copie du navigateur) ; version du cache changée, l'ancien cache est supprimé (testé depuis la v2 et la v3, puis hors ligne).
- En-tête de sécurité : suppression d'une directive obsolète (interest-cohort) qui provoquait un message d'erreur dans la console de Chrome.
- Tests automatiques étendus : 29 tailles d'écran + 4 rotations en pleine partie (dont 320×568, 412×915, 430×932, Galaxy Fold, iPad mini, iPad Pro 12,9", 2560×1080, 800×600, zoom 200 %, grand texte), Safari (WebKit) sur iPhone et iPad, jeu complet au clavier, axe-core (accessibilité), mise à jour hors ligne.

## Version 3 · novembre 2026 : tout se voit sur un seul écran

### Penalty (l'épreuve des 11 mètres)
- Pendant le tir, l'écran est « figé » : le but, le gardien, le ballon, les boutons, la jauge, le tir et le résultat sont **toujours visibles ensemble, sans faire défiler**.
- On vise en **touchant directement un coin du but** 🎯 (les boutons ⬅️ ⬆️ ➡️ restent juste en dessous).
- Téléphone tenu **verticalement** : boutons sous le but. Tenu **horizontalement** (et iPad en largeur, ordinateur) : boutons à côté du but.
- Le message « BUUUT ! » / « Arrêté ! » s'affiche **par-dessus le terrain**, le ballon reste visible jusqu'au résultat.
- La question est cachée pendant le tir ; « Le savais-tu ? » se lit avant, avec le bouton « ⚽ À toi de tirer ! ».
- On peut **tourner le téléphone en pleine partie** : tout se replace, rien n'est perdu.

### Partout ailleurs
- Quiz, chrono, question du jour, revoir mes erreurs : après une réponse, l'écran se place tout seul pour montrer ✓/✗, l'explication et le bouton suivant ; le bouton reste toujours atteignable.
- Petits téléphones : en-tête de question sur une ligne, réponses plus compactes, drapeau plus petit : les 4 réponses tiennent à l'écran.
- Téléphone couché : mise en page sur deux colonnes (question à gauche, explication à droite), en-tête masqué pendant le jeu (bouton ✕ Quitter toujours là).
- Memory : le plateau s'adapte à l'écran (nombre de colonnes recalculé, même après rotation), message au-dessus des cartes, fin de partie par-dessus le plateau.
- Écrans de score : le bouton « Rejouer » est en haut, avant les badges.
- Prise en compte de l'encoche et des bords arrondis des iPhone (zones de sécurité).
- Testé automatiquement sur 15 tailles d'écran (téléphones, iPad, ordinateurs) en portrait et en paysage, avec rotation en pleine partie.

## Version 2 · novembre 2026

### Questions
- **505 questions** (avant : 358) : 152 foot, 183 géographie, 170 espace. Nouveautés vérifiées : Coupe du monde 2026, Euro 2024, Euro féminin 2025 en Suisse, Ballon d'Or, Artemis II…
- Plus de question répétée : le site fait le tour de toutes les questions avant d'en reposer une, même d'une partie à l'autre, et au chrono.
- Les anecdotes « Le savais-tu ? » ne donnent plus la réponse d'une autre question (questions « sœurs » jamais dans la même partie).
- Drapeaux ambigus corrigés : Colombie (sans l'Équateur), Autriche (sans la Lettonie), Pays-Bas (sans le Luxembourg).
- Contenu corrigé (formulations, faits imprécis), « Kiev » remplacé par « Kyiv ».
- Question du jour mieux choisie : à la portée de l'enfant, et jamais la même avant d'avoir fait le tour.

### Jeu
- ✓ et ✗ sur les réponses (lisible aussi pour un enfant daltonien), message clair au chrono.
- 🔊 bouton « Écouter » : la question est lue à voix haute.
- Bouton « ✕ Quitter » pendant un quiz ; « Revoir mes erreurs » après chaque quiz.
- Nouveaux badges affichés sur l'écran de résultat (plus de bulles qui cachent la question suivante).
- Penalty : on choisit son coin et on tire avec une jauge ; le 5 sur 5 devient atteignable.
- Rangs, tenues pour la mascotte (🧢 🕶️ 👑 🚀) et badges bronze / argent / or.
- Correction : le chrono continuait de tourner après l'avoir quitté.

### Sauvegarde
- La progression ne peut plus être cassée par une donnée abîmée ; les étoiles de la version 1 sont gardées.
- Le navigateur est prié de garder les données (anti-effacement sur iPhone/iPad).
- Espace parents : **code de sauvegarde** (copier / recoller sur un autre appareil), copie automatique, remise à zéro protégée par une question pour adulte.

### Technique
- Fonctionne hors ligne, s'installe sur l'écran d'accueil (icônes), aperçu avec image quand on partage le lien.
- Page 404 avec la mascotte, `robots.txt`, en-têtes de sécurité renforcés (COOP, HSTS).
- Plus de saut de mise en page à l'ouverture ; accessibilité 100/100 (Lighthouse).
- Moteur identique sur lr5.ch et ar7.ch ; validateur de questions beaucoup plus complet.

## Version 1 · 2026
- Première version : 3 univers, quiz, chrono, question du jour, badges, penalties, memory.
