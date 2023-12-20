//var {dessiner} = require("./fonctions_de_dessin")

/* Permute deux cases d'une matrice */
function permuter(matrice, pos1, pos2) {
    let [i1, j1] = pos1, [i2, j2] = pos2;
    [matrice[i1][j1], matrice[i2][j2]] = [matrice[i2][j2], matrice[i1][j1]];
}

/* Cette fonction prend une valeur, et la borne dans [a;b] */
function borner(valeur, a, b) {
    return Math.min(Math.max(valeur, a), b)
}

/* Renvoie la position [ligne, colonne] de la tanière */
function getPosTaniere(i, nb_lignes, nb_colonnes) {
    switch(i) {
        case 0: return [Math.floor(nb_lignes/2), 0                        ];
        case 1: return [0                      , Math.floor(nb_colonnes/2)];
        case 2: return [Math.floor(nb_lignes/2), nb_colonnes-1            ];
        case 3: return [nb_lignes-1            , Math.floor(nb_colonnes/2)];
    }
}

function genererTerrain(nb_joueurs_max, nb_lignes, nb_colonnes) {
    let nb_cases_libres = nb_lignes*nb_colonnes - nb_joueurs_max;
    
    let nb_eau = Math.round(nb_cases_libres*0.15);
    let nb_prairie = Math.round(nb_cases_libres*0.35);
    let nb_rocher = nb_cases_libres - nb_eau - nb_prairie;
    
    let taniere_a_placer = 0;
    
    let liste_terrain = []
    for(let i=0; i<nb_lignes; i++) { // Pour chaque ligne
        liste_terrain[i] = [];
        for(let j=0; j<nb_colonnes; j++) { // Pour chaque colonne
            let tuile = randint(0, nb_eau+nb_prairie+nb_rocher - 1) // On pioche une tuile au hasard
            switch(true) {
                case (tuile < nb_eau)                          : liste_terrain[i][j]="E"; nb_eau--    ; break; // Si c'est de l'eau
                case (tuile < nb_eau + nb_prairie)             : liste_terrain[i][j]="P"; nb_prairie--; break; // Si c'est de la prairie
                case (tuile < nb_eau + nb_prairie + nb_rocher) : liste_terrain[i][j]="R"; nb_rocher-- ; break; // Si c'est du rocher
                default: // Si nous n'avons plus de tuiles à piocher (il faut donc placer les tanières)  
                    liste_terrain[i][j] = taniere_a_placer; //On positionne la tanière à la ligne i et colonne j (ce qui n'est pas sa bonne position)
                    permuter(liste_terrain, getPosTaniere(taniere_a_placer, nb_lignes, nb_colonnes), [i, j]); //Puis on permute cette mauvaise position avec la bonne position
                    
                    taniere_a_placer++;
            }
        }
    }
    
    return liste_terrain;
}

function genererEntites(nb_joueurs_max, nb_entites_par_joueur, liste_forces, liste_perceptions, liste_taux_reproduction, nb_lignes, nb_colonnes) {
    let liste_entites = []
    for(let i=0; i<nb_joueurs_max; i++) {
        liste_entites[i] = [];
        for(let j=0; j<nb_entites_par_joueur; j++) {
            liste_entites[i][j] = {
                position: getPosTaniere(i, nb_lignes, nb_colonnes),
                satiete: 5,
                hydratation: 5,
                abstinence: 0,
                sexe: randint(0, 1),
                force: liste_forces[i],
                perception: liste_perceptions[i],
                taux_reproduction: liste_taux_reproduction[i]
            }
        }
    }
    
    return liste_entites;
}

/* Cette fonction prend une entité et un terrain, et renvoie la position où l'entité choisit d'aller */
function nouvellePosition(nb_lignes, nb_colonnes, entite) {
    // On récupère la position de l'entité
    let [i, j] = entite.position;

    // Cette opération doit être déterministe (n'inclut pas d'aléatoire)
    //Pour l'instant, l'entité va en haut à droite
    let choix = ["TOP-LEFT", "TOP-RIGHT", "LEFT", "RIGHT", "BOTTOM-LEFT", "BOTTOM-RIGHT", "STAND-STILL"][randint(0, 6)];

    switch(choix) {
        case "TOP-LEFT": i--; break;
        case "TOP-RIGHT": j++; i--; break;
        case "LEFT": j--; break;
        case "RIGHT": j++; break;
        case "BOTTOM-LEFT": j--; i++; break;
        case "BOTTOM-RIGHT": i++; break
    }

    //On borne la position pour qu'elle soit comprise dans le terrain.
    i = borner(i, 0, nb_lignes-1);
    j = borner(j, 0, nb_lignes-1);
    
    return [i, j]
}

function getTypeTuile(entite, liste_terrain) {
    return liste_terrain[entite.position[0]][entite.position[1]];
}

function getNewStats(entite, liste_terrain) {
    //On change les stats selon le type de la tuile
    let typeTuile = getTypeTuile(entite, liste_terrain);
    
    //Dans tous les cas, on diminue l'hydratation et la satiété de 0.5, et on augmente le taux d'abstinence de 1
    let hydratation = borner(entite.hydratation - 0.5 + (typeTuile=="E" ? 3 : 0), 0, 10);
    let satiete     = borner(entite.satiete     - 0.5 + (typeTuile=="P" ? 2 : 0), 0, 10);
    let abstinence  = borner(entite.abstinence + 1, 0, 5);
    
    return [hydratation, satiete, abstinence];
}


/* Boucle principale qui se répète à chaque seconde dès que l'on a suffisamment de joueurs. */
/* Cette boucle "rattrape son retard" en cas de lag. Elle commence à l'itération 1.         */
/* ATTENTION : Sur certains navigateurs (Edge), les setTimeout et setInterval deviennent    */
/* paresseux au bout de quelques secondes, et n'itèrent plus qu'une fois par seconde. Cela  */
/* n'arrive pas sur Firefox, qui devient paresseux seulement quand la page est cachée (ce   */
/* qui ne gène pas car la boucle rattrape un retard d'une heure en moins de deux secondes). */
function boucle(debut_partie, liste_entites, liste_terrain, nb_iterations_max, iteration=1) {
    //On attend un certain temps avant de lancer le tick et de le dessiner
    //S'il y a du retard, on attend moins longtemps pour rattraper ce retard.
    let temps_a_attendre = (debut_partie + (100 * iteration)) - Date.now(); 
    
    
    //Si on est en retard d'au moins un tick, on appelle setTimeout une fois sur 1000 pour éviter les erreurs de récursion.
    //(On appelle setTimeout le moins que possible car cela fait perdre au moins 4ms, même en donnant un nombre négatif)
    if(temps_a_attendre > 0 || (iteration % 1000 == 0)) {
        setTimeout(() => {
            tick(liste_entites, liste_terrain);
            dessiner(liste_terrain, liste_entites, 10, 30);
            if(iteration!=nb_iterations_max) {
                boucle(debut_partie, liste_entites, liste_terrain, nb_iterations_max, iteration + 1)
            }
        }, temps_a_attendre);
    } else {
        tick(liste_entites, liste_terrain);
        if(iteration!=nb_iterations_max) {
            boucle(debut_partie, liste_entites, liste_terrain, nb_iterations_max, iteration + 1)
        }
    }
}

function tick(liste_entites, liste_terrain) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];
    
    entites_a_supprimer = []
    //Pour chaque tribu
    for(let i in liste_entites) {
        let tribu = liste_entites[i];
        entites_a_supprimer[i] = []
        //Pour chaque entité
        for(let entite of tribu) {
            //On met à jour sa position
            entite.position = nouvellePosition(nb_lignes, nb_colonnes, entite);
            //On met à jour ses stats
            [entite.hydratation, entite.satiete, entite.abstinence] = getNewStats(entite, liste_terrain);
            //Si elle doit mourir
            if(entite.hydratation<=0 || entite.satiete<=0) {
                //On la stocke dans les entités à supprimer
                //entites_a_supprimer[i].push(entite)
            }
        }
    }
    
    // Pour toutes les entités à supprimer
    for(let i in entites_a_supprimer) {
        for(let entite in entites_a_supprimer[i]) {
            //On les supprime
            liste_entites[i].splice(liste_entites[i].indexOf(entite), 1);
        }
    }
}

console.log("test");
