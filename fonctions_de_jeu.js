/* Permute deux cases d'une matrice */
function permuter(matrice, pos1, pos2) {
    let [i1, j1] = pos1, [i2, j2] = pos2;
    [matrice[i1][j1], matrice[i2][j2]] = [matrice[i2][j2], matrice[i1][j1]];
}

/* Cette fonction prend une valeur, et la borne dans [a;b] */
function borner(valeur, a, b) {
    return Math.min(Math.max(valeur, a), b)
}

/* Renvoie le max entre la valeur et 0 */
function ReLU(valeur) {
    return Math.max(valeur, 0);
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

function genererEntites(infos) {
    let liste_entites = []
    for(let i=0; i<infos.nb_joueurs_max; i++) {
        for(let j=0; j<infos.nb_entites_par_joueur; j++) {
            liste_entites.push({
                tribu: i,
                position: getPosTaniere(i, infos.nb_lignes, infos.nb_colonnes),
                satiete: 5,
                hydratation: 5,
                abstinence: 0,
                sexe: randint(0, infos.nb_sexes-1),
                force: infos.liste_forces[i],
                perception: infos.liste_perceptions[i],
                taux_reproduction: infos.liste_taux_reproduction[i],
                intelligence: 50, //Nombre de cases évaluées en cherchant des ressources
                vient_de_bouger: false
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
    let hydratation = borner(entite.hydratation - (entite.vient_de_bouger ? 1 : 0.5) + (typeTuile=="E" ? 3 : 0), 0, 10);
    let satiete     = borner(entite.satiete     - (entite.vient_de_bouger ? 0.5 : 0.25) + (typeTuile=="P" ? 2 : 0), 0, 10);
    let abstinence  = borner(entite.abstinence + 1, 0, 5);
    
    return [hydratation, satiete, abstinence];
}


/* Boucle principale qui se répète à chaque seconde dès que l'on a suffisamment de joueurs. */
/* Cette boucle "rattrape son retard" en cas de lag. Elle commence à l'itération 1.         */
/* ATTENTION : Sur certains navigateurs (Edge), les setTimeout et setInterval deviennent    */
/* paresseux au bout de quelques secondes, et n'itèrent plus qu'une fois par seconde. Cela  */
/* n'arrive pas sur Firefox, qui devient paresseux seulement quand la page est cachée (ce   */
/* qui ne gène pas car la boucle rattrape un retard d'une heure en moins de deux secondes). */
function boucle(infos, iteration=1) {
    //On met à jour les boutons de pouvoir
    updateBoutonsDePouvoir(infos.liste_points);
    
    //On attend un certain temps avant de lancer le tick et de le dessiner
    //S'il y a du retard, on attend moins longtemps pour rattraper ce retard.
    let temps_a_attendre = (infos.debut_partie + (infos.temps_tick * iteration)) - Date.now();
    //Si on est en retard d'au moins un tick, on appelle setTimeout une fois sur 1000 pour éviter les erreurs de récursion.
    //(On appelle setTimeout le moins que possible car cela fait perdre au moins 4ms, même en donnant un nombre négatif)
    if(temps_a_attendre > 0 || (iteration % 1000 == 0)) {
        setTimeout(() => {
            tick(infos.liste_terrain, infos.liste_entites, infos.liste_points, infos.liste_actions, infos.liste_joueurs.length, infos.nb_sexes, iteration);
            dessinerEntites(infos.liste_entites, 10, 30);
            document.getElementById("paragraphe_liste_points").innerHTML = infos.liste_points.join(" ");
            if(iteration!=infos.nb_iterations_max && infos.liste_entites.length != 0) {
                boucle(infos, iteration + 1)
            } else {
                finPartie(infos.liste_entites, infos.liste_points, infos.liste_joueurs)
            }
        }, temps_a_attendre);
    } else {
        tick(infos.liste_terrain, infos.liste_entites, infos.liste_points, infos.liste_actions, infos.liste_joueurs.length, infos.nb_sexes, iteration);
        if(iteration!=infos.nb_iterations_max && infos.liste_entites.length != 0) {
            boucle(infos, iteration + 1)
        } else {
            dessinerEntites(infos.liste_entites, 10, 30);
            finPartie(infos.liste_entites, infos.liste_points, infos.liste_joueurs)
        }
    }
}

function moyenne(a, b) {
    return Math.floor((a + b)/2);
}

/* Fait des bébés. Quand on avait initialement programmé cette fonction, le nombre d'entités  */
/* augmentait exponentiellement, et pouvait dépasser les 100000 en moins d'une centaine       */
/* d'itérations, faisant crasher la page. Nous avons donc décidé que chaque joueur a au plus  */
/* 100 entités, mais que son point continue d'augmenter après cela.                           */
function faireBebes(entite1, entite2, nb_sexes, liste_entites, liste_points, tailles_tribus) {
    //On met l'abstinence des entités à 0
    entite1.abstinence = 0;
    entite2.abstinence = 0;
    
    //On calcule le nombre de bébés (je ne pensais pas que faire des bébés était aussi compliqué)
    let nb_bebes = ReLU(Math.min(entite1.taux_reproduction, 100 - tailles_tribus[entite1.tribu]));
    //let nb_bebes = entite1.taux_reproduction;
    
    //On rajoute ce nombre de bébés
    for(let i=0; i<nb_bebes; i++) {
        liste_entites.push({
            tribu: entite1.tribu,
            position: entite1.position,
            satiete: 5,
            hydratation: 5,
            abstinence: 0,
            sexe: randint(0, nb_sexes-1),
            force: entite1.force,
            perception: entite1.perception,
            taux_reproduction: entite1.taux_reproduction,
            intelligence: entite1.intelligence,
            vient_de_bouger: false
        });
    }
    
    //
    liste_points[entite1.tribu] += entite1.taux_reproduction;
}

/* Renvoie une liste contenant les tailles de chaque tribu */
function getTaillesTribus(liste_entites, nb_joueurs) {
    let tailles_tribus = Array(nb_joueurs).fill(0);
    for(let entite of liste_entites) {
        tailles_tribus[entite.tribu]++;
    }
    
    return tailles_tribus;
}

/* Renvoie une liste d'entités classées selon leur tanières */
function getListeTanieres(liste_entites, liste_terrain, nb_joueurs) {
    let liste_tanieres = Array(nb_joueurs);
    for(let i=0; i<nb_joueurs; i++) { liste_tanieres[i] = []; }
    for(let entite of liste_entites) {
        if(getTypeTuile(liste_terrain, entite.position) == entite.tribu) {
            liste_tanieres[entite.tribu].push(entite);        
        }
    }

    return liste_tanieres;
}

/* Renvoie une liste d'entités classées selon leur tribu */
function getListeTribus(liste_entites, nb_joueurs) {
    let liste_tribus = Array(nb_joueurs);
    for(let i=0; i<nb_joueurs; i++) { liste_tribus[i] = []; }
    for(let entite of liste_entites) {
        liste_tribus[entite.tribu].push(entite);
    }

    return liste_tribus;
}


function tick(liste_terrain, liste_entites, liste_points, liste_actions, nb_joueurs, nb_sexes, iteration) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length];
    
    /* Lorsqu'un utilisateur arrive en milieu de partie, ou prend du retard, le serveur lui enverra une liste d'actions */
    /* ainsi que l'itération (timetepp) à laquelle cette action a été faite. Cela va permettre à cet utilisateur de     */
    /* reconstruire la partie d'une manière déterministe. C'est pour cela que, du côté du client, nous utilisons        */
    /* seulement du pseudo-aléatoire. */
    
    //Tant qu'un joueur a fait une action à ce tick
    while(liste_actions.length > 0 && liste_actions[0][3] == iteration) {
        let action = liste_actions.shift();
        executerAction(action, liste_terrain, liste_entites, liste_points);
    }
    
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

    //On calcule les tailles de chaque tribu    
    let tailles_tribus = getTaillesTribus(liste_entites, nb_joueurs);
    //On calcule la liste des tanières
    let liste_tanieres = getListeTanieres(liste_entites, liste_terrain, nb_joueurs);
    
    
    //Pour chaque tanière
    for(let taniere of liste_tanieres) {
        //Pour chaque paire d'entités de cette tanière
        for(let i=0; i<taniere.length; i++) {
            let entite1 = taniere[i];
            for(let j=i+1; j<taniere.length; j++) {
                let entite2 = taniere[j];
                //Si elles sont de sexe différent et qu'elles ont toutes les deux un taux d'abstinence supérieur ou égal à 5
                if(entite1.sexe != entite2.sexe && entite1.abstinence >= 5 && entite2.abstinence >= 5) {
                    //Elles font des bébés
                    faireBebes(entite1, entite2, nb_sexes, liste_entites, liste_points, tailles_tribus);
                }
            }
        }
    }
}

/* Déclare le joueur gagnant selon le nombre d'entités restant à la fin de */
/* la partie. S'il y a égalité, on départage selon le nombre de points.    */
/* S'il y a encore égalité, on déclare tous ces joueurs gagnants.          */
function finPartie(liste_entites, liste_points, liste_joueurs) {
    //On enlève le menu des pouvoirs
    enleverMenuPouvoirs();
    
    //On détermine la taille maximale des tribus
    let tailles_tribus = getTaillesTribus(liste_entites, liste_joueurs.length);
    let taille_maximale = Math.max(...tailles_tribus);
    //On ne garde que les tribus de taille maximale
    let liste_numeros_gagnants = [...liste_joueurs.keys()];
    liste_numeros_gagnants = liste_numeros_gagnants.filter((numero) => tailles_tribus[numero] == taille_maximale);
    //On détermine le point maximal des tribus restantes
    let liste_points_gagnants = liste_numeros_gagnants.map((numero) => { return liste_points[numero]; });
    let point_maximal = Math.max(...liste_points_gagnants);
    //On ne garde que les tribus de point maximal
    liste_numeros_gagnants = liste_numeros_gagnants.filter((numero) => liste_points[numero] == point_maximal);
    //On fait correspondre les numéros gagnants avec les noms des joueurs
    liste_gagnants = liste_numeros_gagnants.map((numero) => { return liste_joueurs[numero]; })
    //On affiche la liste des gagnants
    document.getElementById("paragraphe_noms_gagnants").innerHTML = liste_gagnants.join(" et ") + (liste_gagnants.length == 1 ? " a " : " ont ") + "gagné !";
}
