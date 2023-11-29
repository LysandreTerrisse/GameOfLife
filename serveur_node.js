var express = require("express");
var app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);

server.listen(8888, () => {
    console.log("Serveur démarré");
});

var liste_joueurs = [];
var liste_entites = [];
var identifiants_secrets = [];
var liste_terrain = [];

/* Vont être écrasés par le choix du premier joueur */
var nb_iterations_max = 0;
var nb_joueurs_max = 1;


/* Prend une liste, et la mélange en la modifiant. Trouvée sur https://stackoverflow.com/questions/2450954 */
function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;
    
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

/* Prend une liste l à une dimension, et renvoie une matrice de m lignes et n colonnes */
function reshape(l, m, n) {
    let matrice = []
    for(let i=0; i<m; i++) {
        matrice[i] = l.slice(i*n, (i+1)*n);
    }
    return matrice;
}

/* Prend le nombre de joueurs, le nombre d'entités par joueur, et la taille du damier, et commence la partie */
/* Pour avoir certains de ces paramètres, il faut attendre qu'un premier joueur les choisisse */
function genererTerrainEtEntites(nb_joueurs, nb_entites_par_joueur, taille_damier) {
    //On génère le terrain
    nb_cases_libres = taille_damier**2; //Il faudra enlever les tanières
    
    let nb_eau = Math.round(nb_cases_libres*0.15);
    let nb_prairie = Math.round(nb_cases_libres*0.35);
    let nb_rocher = nb_cases_libres - nb_eau - nb_prairie;

    liste_terrain = [].concat(
        Array(nb_eau).fill("E"),
        Array(nb_prairie).fill("P"),
        Array(nb_rocher).fill("R")
    );
    
    shuffle(liste_terrain);

    liste_terrain = reshape(liste_terrain, taille_damier, taille_damier) //On transforme liste_terrain en une matrice

    //On crée un tableau qui contient, pour chaque joueur, un tableau qui contient, pour chaque entité, un tuple ((posX, posY), hydratation, satiete, temps_abstinence)
    liste_entites = []
    for(let i=0; i<nb_joueurs; i++) {
        pos_taniere_x = i%2==0 ? taille_damier/2 : taille_damier-1
        pos_taniere_y = i%2!=0 ? taille_damier/2 : taille_damier-1
        
        for(let j=0; j<nb_entites_par_joueur; j++) {
            liste_entites[i][j] = ((pos_taniere_x, pos_taniere_y), 5, 5, 0); //Au début de la partie, toutes les entités ont un taux d'hydradation à 5, un taux de satiété à 5, et un temps d'abstinence de 0
        }
    }
}

io.on("connection", socket => {
    
    socket.on("obtenir_infos_pour_chargement_de_page", () => { // Quand un utilisateur demande les informations pour charger la page
        socket.emit("infos_pour_chargement_de_page", liste_joueurs, liste_terrain, liste_entites, nb_joueurs_max); //On lui renvoie la liste des joueurs, le terrain, les entités, et le nombre de joueurs max
    });
    


    socket.on("ajouter_joueur", (nom_joueur, nb_iterations_max_choisi, nb_joueurs_max_choisi) => { // Quand un utilisateur veut jouer
        if(liste_joueurs.length == 0) { // Si c'est le premier utilisateur à vouloir jouer
            nb_iterations_max = nb_iterations_choisi; // Alors il nous a aussi envoyé un nombre d'itérations
            nb_joueurs_max = nb_joueurs_max_choisi; // Et un nombre de joueurs maximal
            genererTerrainEtEntites(nb_joueurs_max, 50, 13)
        }

        if(liste_joueurs.length!=nb_joueurs_max) { // S'il y a la place pour que l'utilisateur puisse jouer
            io.emit("tous_les_joueurs_doivent_ajouter", nom_joueur); // Alors demande à tous les joueurs de l'ajouter à leur liste des joueurs (y compris lui)
            liste_joueurs.push(nom_joueur); // On l'ajoute aussi à la liste des joueurs du serveur
            let identifiant_secret = Math.random(); // On lui génère un identifiant secret (un flottant)
            socket.emit("identifiant_secret", identifiant_secret); // On lui envoie l'identifiant secret
            identifiants_secrets.push(identifiant_secret); // On stocke l'identifiant secret (sinon ce serait très con)
            
            if(liste_joueurs.length==nb_joueurs_max) {// Maintenant que l'on a ajouté un joueur, est-ce que l'on a atteint la limite maximale ?
                commencerPartie();                        // Si oui, on commence la partie
            }
        }
    });
});

app.get("/", function(request, response) {
    response.sendFile("client.html", {root: __dirname});
});


