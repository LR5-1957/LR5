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
  // Lecture à voix haute (bouton 🔊) avec la voix de l'appareil. Mettre null pour l'enlever.
  lecture: { vitesse: 1 },

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
  // Accessoires de la mascotte, débloqués avec les étoiles.
  tenues: [
    { id: "casquette", ico: "🧢", nom: "Casquette", etoiles: 20 },
    { id: "lunettes",  ico: "🕶️", nom: "Lunettes de star", etoiles: 60 },
    { id: "couronne",  ico: "👑", nom: "Couronne", etoiles: 150 },
    { id: "fusee",     ico: "🚀", nom: "Fusée", etoiles: 300 }
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
