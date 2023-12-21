/*
Voici le pseudo-code pour les collisions :

    Fonction bougerEntites(liste_entites, liste_terrain):
        pour chaque entite de trierParForceDecroissante(liste_entites):
            bouger(entite, liste_terrain)
        
    Fonction bouger(entite, liste_terrain, i=0):
        si mouvement(entite, i) est la position de la tanière de cette entité, ou si l'entité reste sur place:
            entite.position = mouvement(entite, i)
            
        sinon si mouvement(entite, i) est un mur ou une entité au moins aussi forte ou une tanière adverse:
            bouger(entite, i+1)
        sinon:
            si movement(entite, i) est une entité (qui est donc strictement plus faible)
                bouger(entite_plus_faible, 0)
            
            si mouvement(entite, i) n'est pas une entité (c'est donc libre)
                entite.position = mouvement(entite, i)

    Fonction mouvement(entite, i):
        si i=0: on renvoie la position que l'entité veut
        si i=1: on renvoie la position haut-gauche
        si i=2: on renvoie la position haut-droite
        si i=3: on renvoie la position droite
        si i=4: on renvoie la position bas-droite
        si i=5: on renvoie la position bas-gauche
        si i=6: on renvoie la position gauche
        si i=7: on renvoie la position entite.position

Les propriétés intéressantes sont :
    - Si on a deux entités qui veulent échanger leur place, soit "elles se bloquent et restent à la même place", soit "l'une d'elle se fait gerter et l'autre prend sa place".
    - Si on a trois entités A, B, et C, que A veut aller vers B, que B veut aller vers C, et que C veut aller vers A, alors soit aucune ne bouge, soit l'une d'elles se fait gerter et les deux autres avancent correctement.
    - L'algorithme se termine car on répète récursivement sur une autre entité strictement plus faible, ou on répète récursivement jusqu'à ce que i=7.
    - Si deux entités veulent aller à une même position, l'entité la plus forte passe en premier
    - Les entités ne peuvent accéder qu'à leurs tanières
*/



/* Prend une liste d'entités, et renvoie une matrice de même taille que le terrain */
/* contenant les entités aux bons emplacements. Cela permet de vérifier en temps   */
/* constant qu'une case est libre, ce qui sera utile plus tard.                    */
function getMatriceEntites(liste_entites, liste_terrain) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];

    //On crée une matrice ne contenant que des zéros
    let matrice_entites = [];
    for(let i=0; i<nb_lignes; i++) {
        matrice_entites[i] = Array(nb_colonnes).fill(0)
    }
    
    //On met les entités dedans (ce n'est pas grave pour la suite si les entités de la tanière s'écrasent)
    for(let entite of liste_entites) {
        matrice_entites[entite.position[0]][entite.position[1]] = entite;
    }
    
    return matrice_entites
}

/* Renvoie si la position est un mur. Ici, les seuls murs que n l'on a */
/* sont les limites du terrain (les tanières ne sont pas des murs).    */
function estUnMur(position, liste_terrain) {
    return (position[0] < 0) || (position[0] >= liste_terrain.length) || (position[1] < 0) || (position[1] >= liste_terrain[0].length);
}

/* Cette fonction est en temps constant grâce à la matrice des entités */
function estEntiteAuMoinsAussiForte(position, entite, matrice_entites) {
    return (matrice_entites[position[0]][position[1]] !== 0) && (matrice_entites[position[0]][position[1]].force >= entite.force);
}

function estTaniereAdverse(position, entite, liste_terrain) {
    return (getTypeTuile(liste_terrain, position) <= 3) && (getTypeTuile(liste_terrain, position) != entite.tribu);
}

function deplacer(entite, position, matrice_entites) {
    //On dit à la matrice que notre position actuelle est libre
    matrice_entites[entite.position[0]][entite.position[1]] = 0;
    //On déplace l'entité
    entite.position = position;
    //On dit à la matrice que notre nouvelle position n'est plus libre
    matrice_entites[position[0]][position[1]] = entite;
}






function bougerEntites(liste_entites, liste_terrain) {
    let matrice_entites = getMatriceEntites(liste_entites, liste_terrain);
    
    //Puisque les entités les plus fortes sont prioritaires, on trie la liste des entités par force décroissante.
    liste_entites.sort((entite1, entite2) => {return entite2.force - entite1.force;});
    
    for(let entite of liste_entites) {
        bouger(entite, liste_terrain, matrice_entites);
        
    }
}

function bouger(entite, liste_terrain, matrice_entites, i=0) {
    let mvmt = mouvement(entite, liste_terrain, i);
    
    //Si l'entité essaie d'aller à sa tanière ou de rester à sa place
    let pos_taniere = getPosTaniere(entite.tribu, liste_terrain.length, liste_terrain[0].length);
    if((mvmt[0] == pos_taniere[0] && mvmt[1] == pos_taniere[1]) || (mvmt[0] == entite.position[0] && mvmt[1] == entite.position[1])) {
        //L'entité se déplace
        deplacer(entite, mvmt, matrice_entites);
    
    //Sinon, si elle essaie d'aller dans un mur, dans une entité au moins aussi forte, ou dans une tanière adverse
    } else if(estUnMur(mvmt, liste_terrain) || estEntiteAuMoinsAussiForte(mvmt, entite, matrice_entites) || estTaniereAdverse(mvmt, entite, liste_terrain)) {
        //L'entité essaie un autre mouvement
        bouger(entite, liste_terrain, matrice_entites, i+1)
    
    //Sinon
    } else {
        //Si elle essaie d'aller dans une entité (qui est donc strictement plus faible grâce aux conditions précédentes)
        if(matrice_entites[mvmt[0]][mvmt[1]] !== 0) {
            //On essaie de déplacer l'autre entité
            bouger(matrice_entites[mvmt[0]][mvmt[1]], liste_terrain, matrice_entites)
        }

        //Si la place est libre (vérifié en temps constant grâce à la matrice des entités)
        if(matrice_entites[mvmt[0]][mvmt[1]] === 0) {
            //L'entité se déplace
            deplacer(entite, mvmt, matrice_entites);
        }
    }
}

function mouvement(entite, liste_terrain, k) {
    // On récupère la position de l'entité
    let [i, j] = entite.position;
    //Si k=0, l'entité fait un choix
    k = (k==0) ? choix(entite, liste_terrain) : k;

    switch(k) {
        case 1: return [i-1, j  ] //Haut-gauche
        case 2: return [i-1, j+1] //Haut-droite
        case 3: return [i  , j+1] //Droite
        case 4: return [i+1, j  ] //Bas-droite
        case 5: return [i+1, j-1] //Bas-gauche
        case 6: return [i  , j-1] //Gauche
        case 7: return [i  , j  ] //Rester sur place
    }
}

