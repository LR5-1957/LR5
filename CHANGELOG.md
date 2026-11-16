# Journal des changements · lr5.ch

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
