/* Ce fichier contient les fonctions qui sont utilisées à la fois par le client et le serveur */


/* Cette fonction prend une valeur, et la borne dans [a;b] */
function borner(valeur, a, b) {
    return min(max(valeur, a), b)
}


/* Cette fonction prend une entité et un terrain, et renvoie la position où l'entité choisit d'aller */
/* Cette fonction ne doit pas avoir d'aléatoire car, à partir du terrain et de l'entité, deux joueurs différents doivent calculer le même résultat */
function nouvellePosition(entite, liste_terrain) {
    
    
    // On récupère la position de l'entité
    let posX = entite[0][0];
    let posY = entite[0][1];

    // Cette opération doit être déterministe (n'inclut pas d'aléatoire)
    //Pour l'instant, l'entité va en haut à droite
    let choix = ["TOP-LEFT", "TOP-RIGHT", "LEFT", "RIGHT", "BOTTOM-LEFT", "BOTTOM-RIGHT", "STAND-STILL"][1];

    switch(choix) {
        case "TOP-LEFT": posY--; break;
        case "TOP-RIGHT": posX++; posY--; break;
        case "LEFT": posX--; break;
        case "RIGHT": posY++; break;
        case "BOTTOM-LEFT": posX--; posY++; break;
        case "BOTTOM-RIGHT": posY++;
    }

    //On borne la position pour qu'elle soit comprise dans le terrain.
    posX = borner(posX, 0, liste_terrain[0].length-1)
    posY = borner(posY, 0, liste_terrain.length-1)

    return (posX, posY)
}


/* Cette fonction va commencer un chronomètre et va, toutes les secondes, modifier la position des entités ou les faire disparaître */
function commencerPartie(liste_terrain, liste_entites, nb_joueurs, nb_iterations_max) {
    let tempsDebutPartie = Date.now()
    
    for(let iteration = 0; iteration<nb_iterations_max; iteration++) {
        for(let tribu of liste_entites) {
            for(let entite of tribu) { // Pour chaque entité
                let nouvelle_position = nouvellePosition(entite) // On calcule sa nouvelle position
                entite[0][0] = nouvelle_position[0]; // On change la position X actuelle
                entite[0][1] = nouvelle_position[1]; // On change la position Y actuelle

                type_de_tuile = liste_terrain[entite[0][1]][entite[0][0]]; // On regarde sur quel type de tuile est l'entité
                switch(type_de_tuile) {
                    case "E": entite[1] = borner(entite[1] + 3, 0, 10); break; // Si c'est de l'eau, l'hydratation augmente de 3
                    case "P": entite[2] = borner(entite[2] + 2, 0, 10); break; // Si c'est de la prairie, la satiété augmente de 2
                }
                
                //Dans tous les cas, on diminue l'hydratation et la satiété de 0.5, et on augmente le taux d'abstinence de 1
                entite[1] = borner(entite[1] - 0.5, 0, 10);
                entite[2] = borner(entite[2] - 0.5, 0, 10);
                entite[3] = borner(entite[3], 0, 5);

                if(entite[1]==0 || entite[2]==0) { // Si l'eau ou la nourriture est à 0
                    //L'entité meurt. On ne peut pas utiliser pop() car on est en train de parcourir la liste.
                }
            }
        }
    }
}