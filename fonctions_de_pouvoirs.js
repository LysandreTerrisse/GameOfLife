var liste_selections = [];
var pouvoir = null;

function setPouvoir(x) {
    pouvoir = x;
}

/* Prend un hexagone D3.js correspondant à une tuile, et renvoie la position correspondante. */
/* Par exemple, si on lui passe la tuile de la deuxième ligne et troisième colonne, la       */
/* fonction renvoie [2, 3].                                                                  */
function extrairePosFromTuileD3(d) {
    let id = d.id.substring(1).split("-");
    return [Number(id[0]), Number(id[1])]
}

/* this correspond à l'hexagone */
function tuileCliquee() {
    let position = extrairePosFromTuileD3(this);
    let identifiant_secret = getIdentifiantSecret()
    if(pouvoir == 0) {
        socket.emit("envoyer_action", identifiant_secret, pouvoir, [position]);
        pouvoir = null;
    } if(pouvoir == 1) {
        liste_selections.push(position);
        if(liste_selections.length == 2) {
            socket.emit("envoyer_action", identifiant_secret, pouvoir, liste_selections);
            liste_selections = [];
            pouvoir = null;
        }
    }
}

/* Garantit que le pouvoir est valide (entre 0 et 6) et que la liste des positions a les   */
/* bonnes dimensions (deux chiffres par position, et 0, 1, ou 2 position selon le pouvoir) */
function verifierAction(action, nb_lignes, nb_colonnes) {
    let [numero_joueur, pouvoir, liste_positions, iteration] = action;
    //On vérifie que le pouvoir est entre 0 et 6
    if(pouvoir < 0 && pouvoir > 6) return false;
    
    //On ignore les listes de longueur plus grande que 2
    if(liste_positions.length > 2) return false;
    
    //On ignore les listes de position invalide
    for(let position of liste_positions) {
        if(position.length != 2 || position[0] < 0 || position[0] >= nb_lignes || position[1] < 0 || position[1] >= nb_colonnes) {
            return false;
        }
    }
    
    //On vérifie la taille de la liste des positions
    switch(pouvoir) {
        case 0 : return liste_positions.length == 1;
        case 1 : return liste_positions.length == 2;
        default: return liste_positions.length == 0;
    }
}

/* Garantit que l'utilisation de ce pouvoir est valide */
function executerAction(action, liste_terrain, liste_entites, liste_scores) {
    let [numero_utilisateur, pouvoir, liste_positions, iteration] = action;
    let score = liste_scores[numero_utilisateur];
    
    //On crée une liste contenant, pour chaque position de l'action, le  type de la tuile correspondant
    liste_types_tuiles = []
    for(let position of liste_positions) {
        liste_types_tuiles.push(getTypeTuile(liste_terrain, position));
    }
    
    switch(true) {
        case (pouvoir==0 && score >= 40 && liste_types_tuiles[0] == "P") : TotalEnergies(liste_positions, liste_terrain); break;
        case (pouvoir==1 && score >= 50 && liste_types_tuiles.includes("R") && (liste_types_tuiles.includes("E") || liste_types_tuiles.includes("P"))) : Abracadabra(liste_positions, liste_terrain); break;
    }
    dessinerTout(liste_terrain, liste_entites, 10, 30)
}

function TotalEnergies(liste_positions, liste_terrain) {
    console.log("Total Energies");
    let [i, j] = liste_positions[0];
    liste_terrain[i][j] = "R"
}

function Abracadabra(liste_positions, liste_terrain) {
    console.log("Abracadabra");
    permuter(liste_terrain, liste_positions[0], liste_positions[1]);
}

