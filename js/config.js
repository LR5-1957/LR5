/* =====================================================================
 * CONFIGURATION DU SITE LR5 — tout ce qui change d'un site à l'autre est ICI.
 * Les couleurs sont dans css/theme.css. Le moteur (js/app.js, penalty.js, memory.js,
 * flags.js, parents.js, css/style.css, sw.js) est IDENTIQUE sur LR5 et AR7.
 * ===================================================================== */
window.SITE_CONFIG = {
  nom: "LR5",
  domaine: "lr5.ch",
  slogan: "La ligue des curieux",
  public: "9-10 ans",
  langue: "fr",
  stockage: "lr5:v1",            // clé localStorage (unique par site, ne JAMAIS la changer : on perdrait les étoiles)

  mascotte: {
    nom: "Lino",
    image: "assets/mascotte.svg",
    description: "le jeune lynx des Alpes en maillot n°5",
    bulles: [
      "Salut ! Prêt à devenir le plus curieux de la ligue ?",
      "Chaque bonne réponse te rapporte une étoile ⭐",
      "Tu connais la capitale de l'Australie ? Viens vérifier !",
      "Un penalty, ça se mérite : réponds juste et tire !",
      "Ce soir, regarde le ciel : tu reconnaîtras peut-être Orion !",
      "Tu t'es trompé ? Va dans « Revoir mes erreurs » pour les corriger !"
    ]
  },

  univers: [
    { id: "football",   nom: "Football",         emoji: "⚽", description: "Règles, légendes, clubs et Coupes du monde", fichier: "data/football.js" },
    { id: "geographie", nom: "Géographie",       emoji: "🌍", description: "Capitales, drapeaux, pays et monnaies",      fichier: "data/geographie.js" },
    { id: "espace",     nom: "Étoiles & espace", emoji: "🚀", description: "Planètes, constellations, Lune et astronautes", fichier: "data/espace.js" }
  ],
  mix: { id: "mix", nom: "Grand mélange", emoji: "🎲", description: "Un peu de tout, au hasard !" },

  // Niveaux calibrés pour 9-10 ans : quelles difficultés (1, 2, 3) on pioche.
  niveaux: [
    { id: 1, nom: "Découverte",  emoji: "🌱", description: "Facile pour un enfant de 9 ans",          difficultes: [1] },
    { id: 2, nom: "Explorateur", emoji: "🧭", description: "Il faut un peu réfléchir",                 difficultes: [1, 2] },
    { id: 3, nom: "Expert",      emoji: "🏆", description: "Un vrai défi pour un curieux de 10 ans",   difficultes: [2, 3] }
  ],

  quiz: { nbQuestions: 10, chronoSecondes: 60, etoilesParBonneReponse: 1, bonusSansFaute: 3, etoilesQuestionDuJour: 3, chronoAlerte: true },
  texteRate: "Pas cette fois !",
  // Question du jour : la même pour tout le monde, facile ou moyenne, jamais deux fois avant d’avoir fait le tour.
  jour: { difficultes: [1, 2] },
  // Lecture à voix haute (bouton 🔊) : voix française féminine choisie automatiquement (voir README). vitesse et hauteur : 1 = normales. Mettre null pour l'enlever.
  lecture: { vitesse: 0.95, hauteur: 1.05 },

  // Épreuve des 11 mètres. Chance que le gardien devine le coin = depart + parBut × buts d'affilée (au maximum max).
  // Un tir « parfait » (flèche dans la zone verte) multiplie cette chance par bonusParfait.
  penalty: { univers: "football", tirs: 5, gardienDepart: 0.15, gardienParBut: 0.07, gardienMax: 0.4, bonusParfait: 0.4, jauge: true },
  // Memory : 6 paires au début, une de plus à chaque partie finie, jusqu'à 8.
  memory: { pairesDepart: 6, pairesMax: 8,
    drapeaux: ["ch", "fr", "it", "de", "jp", "se", "dk", "fi", "no", "gb", "es", "gr", "tr", "ua", "be", "nl", "pl", "at", "hu", "cz", "is", "ie"] },

  // Rangs selon le total d'étoiles (affichés sur l'accueil et dans l'album).
  rangs: [
    { etoiles: 0,   nom: "Recrue" },
    { etoiles: 25,  nom: "Espoir" },
    { etoiles: 75,  nom: "Titulaire" },
    { etoiles: 150, nom: "Capitaine" },
    { etoiles: 300, nom: "Légende" },
    { etoiles: 600, nom: "Ballon d'or de la curiosité" }
  ],
  // Accessoires de la mascotte, débloqués avec les étoiles. Plusieurs peuvent être portés en même temps, un seul par « place ».
  // svg = dessin posé DEVANT la mascotte, svgDos = dessin DERRIÈRE elle, dans le repère de assets/mascotte.svg (viewBox 0 0 200 220).
  tenues: [
    { id: "casquette", ico: "🧢", nom: "Casquette", etoiles: 20, place: "tete",
      svg: "<path d='M56 66 C56 10 144 10 144 66 Z' fill='#c8102e' stroke='#111' stroke-width='2.5'/><path d='M100 24 L100 66 M78 28 Q72 46 74 66 M122 28 Q128 46 126 66' stroke='#7d0a1d' stroke-width='2' fill='none'/><path d='M100 38 l3.5 7 7.7 1.1 -5.6 5.4 1.3 7.7 -6.9 -3.6 -6.9 3.6 1.3 -7.7 -5.6 -5.4 7.7 -1.1 z' fill='#fff'/><circle cx='100' cy='24' r='4.5' fill='#111'/><path d='M46 68 Q100 50 154 68 Q157 81 100 77 Q43 81 46 68 Z' fill='#111'/>" },
    { id: "lunettes",  ico: "🕶️", nom: "Lunettes de star", etoiles: 60, place: "yeux",
      svg: "<path d='M52 88 L33 83 M148 88 L167 83' stroke='#111' stroke-width='3.5' stroke-linecap='round'/><path d='M95 88 Q100 84 105 88' stroke='#111' stroke-width='3.5' fill='none'/><path d='M51 82 H96 V93 A17 17 0 0 1 79 110 H68 A17 17 0 0 1 51 93 Z M104 82 H149 V93 A17 17 0 0 1 132 110 H121 A17 17 0 0 1 104 93 Z' fill='#111' fill-opacity='.93' stroke='#000' stroke-width='2.5' stroke-linejoin='round'/><path d='M58 90 L68 85 M111 90 L121 85' stroke='#fff' stroke-width='3' stroke-linecap='round' opacity='.75'/>" },
    { id: "couronne",  ico: "👑", nom: "Couronne", etoiles: 150, place: "tete",
      svg: "<path d='M66 50 L61 18 L82 34 L100 11 L118 34 L139 18 L134 50 Z' fill='#ffd23f' stroke='#b8860b' stroke-width='2.5' stroke-linejoin='round'/><rect x='65' y='42' width='70' height='10' rx='3' fill='#f4b400' stroke='#b8860b' stroke-width='2'/><circle cx='61' cy='18' r='4' fill='#ffd23f' stroke='#b8860b' stroke-width='2'/><circle cx='100' cy='11' r='4.5' fill='#ffd23f' stroke='#b8860b' stroke-width='2'/><circle cx='139' cy='18' r='4' fill='#ffd23f' stroke='#b8860b' stroke-width='2'/><circle cx='83' cy='47' r='3.2' fill='#c8102e'/><circle cx='100' cy='47' r='3.6' fill='#1d5fd6'/><circle cx='117' cy='47' r='3.2' fill='#2e9e4f'/>" },
    { id: "fusee",     ico: "🚀", nom: "Fusée", etoiles: 300, place: "dos",
      svg: "<path d='M60 170 Q52 196 56 220 M140 170 Q148 196 144 220' stroke='#5b6475' stroke-width='7' fill='none' stroke-linecap='round'/>",
      svgDos: "<rect x='24' y='170' width='152' height='9' rx='4' fill='#5b6475'/><g><path d='M20 194 Q29 220 38 194 Z' fill='#ff9f1c'/><path d='M24 194 Q29 210 34 194 Z' fill='#ffd23f'/><path d='M18 176 L7 198 L18 192 Z M40 176 L51 198 L40 192 Z' fill='#c8102e'/><rect x='18' y='122' width='22' height='72' rx='8' fill='#eef1f6' stroke='#7d8699' stroke-width='2'/><path d='M18 128 Q29 96 40 128 Z' fill='#c8102e' stroke='#7d8699' stroke-width='2' stroke-linejoin='round'/><circle cx='29' cy='146' r='5.5' fill='#5bc0eb' stroke='#7d8699' stroke-width='2'/></g><g transform='matrix(-1 0 0 1 200 0)'><path d='M20 194 Q29 220 38 194 Z' fill='#ff9f1c'/><path d='M24 194 Q29 210 34 194 Z' fill='#ffd23f'/><path d='M18 176 L7 198 L18 192 Z M40 176 L51 198 L40 192 Z' fill='#c8102e'/><rect x='18' y='122' width='22' height='72' rx='8' fill='#eef1f6' stroke='#7d8699' stroke-width='2'/><path d='M18 128 Q29 96 40 128 Z' fill='#c8102e' stroke='#7d8699' stroke-width='2' stroke-linejoin='round'/><circle cx='29' cy='146' r='5.5' fill='#5bc0eb' stroke='#7d8699' stroke-width='2'/></g>" }
  ],

  // Badges : "stat" = compteur suivi par le site, "seuil" = valeur à atteindre.
  // Stats : bonnes, parfaits, chrono (record), jours, buts, penaltyParfait, memory, corrigees, u_<id univers>
  badges: [
    { id: "premiere",  ico: "🐣", nom: "Premier pas",          desc: "1re bonne réponse",                stat: "bonnes", seuil: 1 },
    { id: "dix",       ico: "⭐", nom: "Petite étoile",        desc: "10 bonnes réponses",               stat: "bonnes", seuil: 10 },
    { id: "cinquante", ico: "🌟", nom: "Grande étoile",        desc: "50 bonnes réponses",               stat: "bonnes", seuil: 50 },
    { id: "cent",      ico: "💫", nom: "Supernova",            desc: "100 bonnes réponses",              stat: "bonnes", seuil: 100 },
    { id: "deuxcentcinquante", ico: "🌌", nom: "Galaxie",      desc: "250 bonnes réponses",              stat: "bonnes", seuil: 250 },
    { id: "cinqcents", ico: "🏅", nom: "Encyclopédie vivante", desc: "500 bonnes réponses",              stat: "bonnes", seuil: 500 },
    { id: "parfait",   ico: "🎯", nom: "Sans faute",           desc: "10/10 à un quiz rapide",           stat: "parfaits", seuil: 1 },
    { id: "parfait5",  ico: "🏹", nom: "Archer du savoir",         desc: "5 quiz sans faute",            stat: "parfaits", seuil: 5 },
    { id: "chrono",    ico: "⏱️", nom: "Éclair",               desc: "8 bonnes réponses au défi chrono", stat: "chrono", seuil: 8 },
    { id: "chrono15",  ico: "⚡", nom: "Foudre",               desc: "15 bonnes réponses au défi chrono", stat: "chrono", seuil: 15 },
    { id: "jour3",     ico: "📅", nom: "Fidèle",               desc: "3 questions du jour réussies",     stat: "jours", seuil: 3 },
    { id: "jour10",    ico: "🗓️", nom: "Habitué",              desc: "10 questions du jour réussies",    stat: "jours", seuil: 10 },
    { id: "foot",      ico: "⚽", nom: "Pro du ballon",        desc: "20 bonnes réponses en foot",       stat: "u_football", seuil: 20 },
    { id: "geo",       ico: "🧳", nom: "Globe-trotter",        desc: "20 bonnes réponses en géo",        stat: "u_geographie", seuil: 20 },
    { id: "espace",    ico: "👩‍🚀", nom: "Astronaute",          desc: "20 bonnes réponses dans l'espace", stat: "u_espace", seuil: 20 },
    { id: "but",       ico: "🥅", nom: "Buteur",               desc: "1er but aux 11 mètres",            stat: "buts", seuil: 1 },
    { id: "buts25",    ico: "👟", nom: "Canonnier",            desc: "25 buts aux 11 mètres",            stat: "buts", seuil: 25 },
    { id: "penalty5",  ico: "🦁", nom: "Tireur d'élite",       desc: "5 buts sur 5 aux 11 mètres",       stat: "penaltyParfait", seuil: 1 },
    { id: "memory",    ico: "🧠", nom: "Mémoire d'éléphant",   desc: "Finir un memory des drapeaux",     stat: "memory", seuil: 1 },
    { id: "memory5",   ico: "🐘", nom: "Mémoire d'acier",      desc: "Finir 5 memorys",                  stat: "memory", seuil: 5 },
    { id: "corrige",   ico: "🔁", nom: "Jamais deux fois",     desc: "Corriger 10 erreurs",              stat: "corrigees", seuil: 10 }
  ]
};
