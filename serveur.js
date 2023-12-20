var express = require("express");
var app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);

server.listen(8888, () => {
    console.log("Serveur démarré");
});

var infos = {
    liste_joueurs: [],
    liste_forces: [],
    liste_perceptions: [],
    liste_taux_reproduction: [],
    nb_joueurs_max: 0,
    nb_entites_par_joueur: 0,
    nb_iterations_max: 0,
    nb_lignes: 0,
    nb_colonnes: 0,
    seed: Math.floor(Math.random()*1000000), //Un entier réellement aléatoire dans [0;999999]
    debut_partie: 0 //Va permettre aux joueurs de se synchroniser
}

var infos_privees = {
    identifiants_secrets: []
}

function borner(valeur, a, b) {
    return Math.min(Math.max(valeur, a), b)
}

io.on("connection", socket => {
    
    socket.on("obtenir_infos", () => { // Quand un utilisateur demande les infos
        socket.emit("infos", infos); //On lui renvoie les infos
        
    });
    
    socket.on("ajouter_joueur", (infos_client) => { // Quand un utilisateur veut jouer
        if(infos.liste_joueurs.length == 0) { // Si c'est le premier utilisateur à vouloir jouer
            infos.nb_joueurs_max        = borner(infos_client.nb_joueurs_max, 1, 4); // Alors il nous a aussi envoyé un nombre de joueurs max
            infos.nb_entites_par_joueur = borner(infos_client.nb_entites_par_joueur, 1, 200); // Et un nombre d'entités par joueur
            infos.nb_iterations_max     = Math.max(infos_client.nb_iterations_max, 10); // Et un nombre d'itérations maximal
            infos.nb_lignes             = borner(infos_client.nb_lignes, 3, 50); // Et un nombre de lignes
            infos.nb_colonnes           = borner(infos_client.nb_colonnes, 3, 50); // Et un nombre de colonnes
        }

        // S'il y a la place pour que l'utilisateur puisse jouer
        if(infos.liste_joueurs.length!=infos.nb_joueurs_max) {
            // Alors on l'ajoute à la liste des joueurs
            infos.liste_joueurs.push(infos_client.nom_joueur);
            //On stocke les trois statistiques qu'il a donné pour ses entités
            infos.liste_forces.push(borner(infos_client.force, 1, 5));
            infos.liste_perceptions.push(borner(infos_client.perception, 1, 5));
            infos.liste_taux_reproduction.push(borner(infos_client.taux_reproduction, 1, 5)); // À modifier : Il faudra tester que la somme des stats est plus petit ou égale à 9
            
            // On lui génère un identifiant secret dans [0;999999] que l'on stocke et lui renvoie
            let identifiant_secret = Math.floor(Math.random()*1000000)
            infos_privees.identifiants_secrets.push(identifiant_secret)
            socket.emit("identifiant_secret", identifiant_secret); 
            
            //Si c'est le dernier joueur à pouvoir entrer, la partie débute maintenant
            if(infos.liste_joueurs.length==infos.nb_joueurs_max) {
                infos.debut_partie = Date.now();
            }
            
            // On renvoie les infos à tout le monde
            io.emit("infos", infos);
        }
    });
});

app.get("/", function(request, response) {
    response.sendFile("client.html", {root: __dirname});
});

app.get("/fonctions_de_jeu.js", function(request, response) {
    response.sendFile("fonctions_de_jeu.js", {root: __dirname});
});

app.get("/fonctions_de_dessin.js", function(request, response) {
    response.sendFile("fonctions_de_dessin.js", {root: __dirname});
});

app.get("/fonctions_interface.js", function(request, response) {
    response.sendFile("fonctions_interface.js", {root: __dirname});
});

app.get("/fonctions_aleatoire.js", function(request, response) {
    response.sendFile("fonctions_aleatoire.js", {root: __dirname});
});
