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
    nb_joueurs_max: 0,
    nb_iterations_max: 0,
    nb_lignes: 0,
    nb_colonnes: 0,
    graine_aleatoire: Math.random()
}

var infos_privees = {
    identifiants_secrets: []
}

io.on("connection", socket => {
    
    socket.on("obtenir_infos", () => { // Quand un utilisateur demande les infos
        socket.emit("infos", infos); //On lui renvoie les infos
    });
    
    socket.on("ajouter_joueur", (nom_joueur, nb_joueurs_max, nb_iterations_max, nb_lignes, nb_colonnes) => { // Quand un utilisateur veut jouer
        if(infos.liste_joueurs.length == 0) { // Si c'est le premier utilisateur à vouloir jouer
            infos.nb_joueurs_max = Math.max(Math.min(nb_joueurs_max, 4), 1); // Alors il nous a aussi envoyé un nombre de joueurs max
            infos.nb_iterations_max = Math.max(nb_iterations_max, 10); // Et un nombre d'itérations maximal
            infos.nb_lignes = Math.max(nb_lignes, 3); // Et un nombre de lignes
            infos.nb_colonnes = Math.max(nb_colonnes, 3); // Et un nombre de colonnes
        }

        if(infos.liste_joueurs.length!=infos.nb_joueurs_max) { // S'il y a la place pour que l'utilisateur puisse jouer
            infos.liste_joueurs.push(nom_joueur); // Alors on l'ajoute à la liste des joueurs
            io.emit("infos", infos); // On renvoie les infos à tout le monde
            
            let identifiant_secret = Math.random(); // On lui génère un identifiant secret (un flottant)
            infos_privees.identifiants_secrets.push(identifiant_secret) // On stocke cet identifiant secret (sinon ce serait très con)
            socket.emit("identifiant_secret", identifiant_secret); // On lui envoie l'identifiant secret
        }
    });
});

app.get("/", function(request, response) {
    response.sendFile("client.html", {root: __dirname});
});
