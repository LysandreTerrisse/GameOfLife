/* Si on représente les hexagones dans une matrice (justement comme dans liste_terrain), */
/* alors la distance entre les hexagones est la distance de Manhattan dans la matrice !  */
function distanceManhattan(pos1, pos2) {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1])
}

/* L'algorithme de décision de l'entité. */

/* 1 : Haut-gauche      */
/* 2 : Haut-droite      */
/* 3 : Droite           */
/* 4 : Bas-droite       */
/* 5 : Bas-gauche       */
/* 6 : Gauche           */
/* 7 : Rester sur place */

/* Renvoie le mouvement optimal pour aller vers la position, en admettant qu'il n'y ait pas d'obstacles. */
function allerVers(position, entite) {
    let est_en_haut  = (position[0] < entite.position[0]);
    let est_en_bas   = (position[0] > entite.position[0]);
    let est_a_gauche = (position[1] < entite.position[1]);
    let est_a_droite = (position[1] > entite.position[1]);
    
    if(est_a_gauche) {
        switch(true) {
            case(est_en_haut): return 1;
            case(est_en_bas ): return 5;
            default          : return 6;
        }
    } else if(est_a_droite) {
        switch(true) {
            case(est_en_haut): return 2;
            case(est_en_bas ): return 4;
            default          : return 3;
        }
    } else {
        switch(true) {
            case(est_en_haut): return 1;
            case(est_en_bas ): return 4;
            default          : return 7;
        }
    }
}

/* Si la perception est de X, on prend n tuiles au hasard de la carte, et on renvoie  */
/* la plus proche correspondant à la ressource et étant visible par l'entité. Si l'on */
/* ne trouve pas de telle ressource, on renvoie null.                                 */
function chercherAutour(entite, ressource, liste_terrain, n) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];

    let meilleure_position = null;
    let meilleure_distance = entite.perception;
    
    for(let i=0; i<n; i++) {
        let random_position = [randint(0, nb_lignes-1), randint(0, nb_colonnes-1)];
        let distance = distanceManhattan(random_position, entite.position);
        //Si la ressource correspond et est plus proche que la meilleure ressource, alors c'est elle la meilleure ressource
        if(getTypeTuile(liste_terrain, random_position) == ressource && distance <= entite.perception && meilleure_distance > distance) {
            meilleure_position = random_position;
            meilleure_distance = distance;
        }
    }

    return meilleure_position;
}


function choix(entite, liste_terrain) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];
    let pos_taniere = getPosTaniere(entite.tribu, nb_lignes, nb_colonnes)
    
    //Si l'entité a une satiété et une hydratation plus grande ou égale à 6 et qu'elle voit la tanière, alors elle essaie d'y aller
    if(entite.satiete >= 6 && entite.hydratation >= 6 && distanceManhattan(entite.position, pos_taniere) <= entite.perception) {
        return allerVers(pos_taniere, entite);
    //Sinon, si l'entité est dans une tanière et qu'elle n'est pas sur le point de mourir, alors elle reste
    } else if(pos_taniere[0] == entite.position[0] && pos_taniere[1] == entite.position[1] && entite.satiete >= 4 && entite.hydratation >= 4) {
        return 7;
    //Sinon
    } else {
        //Elle détermine quelles sont les ressources les plus prioritaires
        let priorite = entite.satiete < entite.hydratation ? ["P", "E"] : ["E", "P"];

        //Par ordre de priorité, elle cherche la ressource, et si elle la trouve, elle y va.
        for(let ressource of priorite) {
            let pos_ressource = chercherAutour(entite, ressource, liste_terrain, 20);
            if(pos_ressource !== null) {
                return allerVers(pos_ressource, entite);
            }
        }

        //Sinon, elle fait ce qu'elle veut
        return randint(1, 7);
    }
}
