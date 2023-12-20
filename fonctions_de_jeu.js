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

function genererEntites(nb_joueurs_max, nb_entites_par_joueur, liste_forces, liste_perceptions, liste_taux_reproduction, nb_sexes, nb_lignes, nb_colonnes) {
    let liste_entites = []
    for(let i=0; i<nb_joueurs_max; i++) {
        for(let j=0; j<nb_entites_par_joueur; j++) {
            liste_entites.push({
                tribu: i,
                position: getPosTaniere(i, nb_lignes, nb_colonnes),
                satiete: 5,
                hydratation: 5,
                abstinence: 0,
                sexe: randint(0, nb_sexes-1),
                force: liste_forces[i],
                perception: liste_perceptions[i],
                taux_reproduction: liste_taux_reproduction[i],
                nb_sexes: nb_sexes
            });
        }
    }
    
    return liste_entites;
}

function getTypeTuile(liste_terrain, position) {
    return liste_terrain[position[0]][position[1]];
}

function getNewStats(entite, liste_terrain) {
    //On change les stats selon le type de la tuile
    let typeTuile = getTypeTuile(liste_terrain, entite.position);
    
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
        } else {
            dessiner(liste_terrain, liste_entites, 10, 30);
        }
    }
}

function moyenne(a, b) {
    return Math.floor((a + b)/2);
}

function faireBebes(entite1, entite2, nb_sexes) {
    console.log("babybel")
    entite1.abstinence = 0;
    entite2.abstinence = 0;
    for(let k=0; k<entite1.taux_reproduction; k++) {
        liste_entites.push({
            tribu: entite1.tribu,
            position: entite1.position,
            satiete: 5,
            hydratation: 5,
            abstinence: 0,
            sexe: randint(0, nb_sexes-1),
            force: entite1.force,
            perception: entite1.perception,
            taux_reproduction: entite1.taux_reproduction
        });
    }
}

function tick(liste_entites, liste_terrain, nb_joueurs, nb_sexes) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];
    
    //On bouge toutes les entités
    bougerEntites(liste_entites, liste_terrain);

    //Pour chaque entité de la liste des entités (en partant par la fin)
    for(let i=liste_entites.length-1; i>=0; i--) {
        let entite = liste_entites[i];
        //On met à jour ses stats
        [entite.hydratation, entite.satiete, entite.abstinence] = getNewStats(entite, liste_terrain);
        //Si elle doit mourir
        if(entite.hydratation<=0 || entite.satiete<=0) {
            //On l'enlève de la liste des entités. C'est pour ça que l'on parcourt la liste à l'envers (si on enlève des éléments de la liste en la parcourant à l'endroit, il risque d'y avoir des problèmes).
            liste_entites.splice(i, 1)
        }
    }
    

    //On crée une liste d'entités classées selon leur tanières (si elles sont dans leur tanière)
    tanieres = Array(nb_joueurs)
    for(let i in tanieres) {tanieres[i] = [];}
    for(let entite of liste_entites) {
        if(getTypeTuile(liste_terrain, entite.position) <= 3) {
            tanieres[entite.tribu].push(entite);        
        }
    }
    
    //Pour chaque tanière
    for(let taniere of tanieres) {
        //Pour chaque paire d'entités
        for(let i=0; i<taniere.length; i++) {
            let entite1 = taniere[i];
            for(let j=i+1; j<taniere.length; j++) {
                let entite2 = taniere[j];
                //Si elles sont de sexe différent et qu'elles ont toutes les deux un taux d'abstinence supérieur ou égal à 5
                if(entite1.sexe != entite2.sexe && entite1.abstinence >= 5 && entite2.abstinence >= 5) {
                    //Elles font des bébés
                    faireBebes(entite1, entite2, nb_sexes);
                }
            }
        }
    }
}
