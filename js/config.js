/* =====================================================================
 * CONFIGURATION DU SITE — tout ce qui change d'un site à l'autre est ICI.
 * Pour créer un site frère (ex. ar7.ch pour Alessandro, 7 ans) :
 * copie le dossier, modifie ce fichier, remplace assets/mascotte.svg,
 * et mets les questions adaptées dans data/.
 * ===================================================================== */
window.SITE_CONFIG = {
  nom: "LR5",
  domaine: "lr5.ch",
  slogan: "La ligue des curieux",
  public: "9-10 ans",
  langue: "fr",
  stockage: "lr5:v1",            // clé localStorage (unique par site !)

  mascotte: {
    nom: "Lino",                  // à faire choisir par Lorenzo :)
    image: "assets/mascotte.svg",
    description: "le jeune lynx des Alpes en maillot n°5",
    bulles: [
      "Salut ! Prêt à devenir le plus curieux de la ligue ?",
      "Chaque bonne réponse te rapporte une étoile ⭐",
      "Tu connais la capitale de l'Australie ? Viens vérifier !",
      "Un penalty, ça se mérite : réponds juste et tire !",
      "Ce soir, regarde le ciel : tu reconnaîtras peut-être Orion !"
    ]
  },

  couleurs: {                     // copiées dans les variables CSS (--primaire, --noir...) : palette rouge et noir
    primaire: "#c8102e",          // rouge : en-tête, boutons (texte blanc : contraste 5,9:1)
    "primaire-f": "#8f0a1f",      // rouge foncé : ombres, liens
    noir: "#111111",              // noir : boutons d'action, compteur d'étoiles
    or: "#ffd23f",                // or : étoiles et contour de focus
    rouge: "#b00d24", vert: "#1c7a47"
  },

  // Univers : un fichier de questions par univers dans data/ (même id).
  univers: [
    { id: "football",   nom: "Football",         emoji: "⚽", description: "Règles, légendes, clubs et Coupes du monde", fichier: "data/football.js" },
    { id: "geographie", nom: "Géographie",       emoji: "🌍", description: "Capitales, drapeaux, pays et monnaies",      fichier: "data/geographie.js" },
    { id: "espace",     nom: "Étoiles & espace", emoji: "🚀", description: "Planètes, constellations, Lune et astronautes", fichier: "data/espace.js" }
  ],
  mix: { id: "mix", nom: "Grand mélange", emoji: "🎲", description: "Un peu de tout, au hasard !" },

  // Niveaux calibrés pour 9-10 ans : quelles difficultés (1, 2, 3) on pioche.
  niveaux: [
    { id: 1, nom: "Découverte",  emoji: "🌱", description: "Facile pour un enfant de 9 ans",     difficultes: [1] },
    { id: 2, nom: "Explorateur", emoji: "🧭", description: "Il faut un peu réfléchir",            difficultes: [1, 2] },
    { id: 3, nom: "Expert",      emoji: "🏆", description: "Un vrai défi pour un curieux de 10 ans", difficultes: [2, 3] }
  ],

  quiz: { nbQuestions: 10, chronoSecondes: 60, etoilesParBonneReponse: 1, bonusSansFaute: 3, etoilesQuestionDuJour: 3 },
  penalty: { univers: "football", tirs: 5 },
  memory: { paires: 6 },

  // Badges : "stat" = compteur suivi par le site, "seuil" = valeur à atteindre.
  // Stats : bonnes, parfaits, chrono, jours, buts, penaltyParfait, memory, u_<id univers>
  badges: [
    { id: "premiere",  ico: "🐣", nom: "Premier pas",          desc: "1re bonne réponse",              stat: "bonnes", seuil: 1 },
    { id: "dix",       ico: "⭐", nom: "Petite étoile",        desc: "10 bonnes réponses",             stat: "bonnes", seuil: 10 },
    { id: "cinquante", ico: "🌟", nom: "Grande étoile",        desc: "50 bonnes réponses",             stat: "bonnes", seuil: 50 },
    { id: "cent",      ico: "💫", nom: "Supernova",            desc: "100 bonnes réponses",            stat: "bonnes", seuil: 100 },
    { id: "parfait",   ico: "🎯", nom: "Sans faute",           desc: "10/10 à un quiz rapide",         stat: "parfaits", seuil: 1 },
    { id: "chrono",    ico: "⏱️", nom: "Éclair",               desc: "8 bonnes réponses au défi chrono", stat: "chrono", seuil: 8 },
    { id: "jour3",     ico: "📅", nom: "Fidèle",               desc: "3 questions du jour réussies",   stat: "jours", seuil: 3 },
    { id: "foot",      ico: "⚽", nom: "Pro du ballon",        desc: "20 bonnes réponses en foot",     stat: "u_football", seuil: 20 },
    { id: "geo",       ico: "🧳", nom: "Globe-trotter",        desc: "20 bonnes réponses en géo",      stat: "u_geographie", seuil: 20 },
    { id: "espace",    ico: "👩‍🚀", nom: "Astronaute",          desc: "20 bonnes réponses dans l'espace", stat: "u_espace", seuil: 20 },
    { id: "but",       ico: "🥅", nom: "Buteur",               desc: "1er but aux 11 mètres",          stat: "buts", seuil: 1 },
    { id: "penalty5",  ico: "🦁", nom: "Tireur d'élite",       desc: "5 buts sur 5 aux 11 mètres",     stat: "penaltyParfait", seuil: 1 },
    { id: "memory",    ico: "🧠", nom: "Mémoire d'éléphant",   desc: "Finir un memory des drapeaux",   stat: "memory", seuil: 1 }
  ]
};
