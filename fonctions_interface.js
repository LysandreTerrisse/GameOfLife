function enleverInputsCreationPartie() {
    document.getElementById("menu_creation_partie").style.display = "none";
}

function enleverInputsDeConnexion() {
    document.getElementById("menu_connexion").style.display = "none";
    document.getElementById("bouton_jouer").type = "hidden"; // On enlève le bouton "Jouer" même s'il n'est pas dans le même <div>
}

function extraireDepuisInterface() {
    let nom_joueur            =        document.getElementById("champ_nom_joueur"           ).value ;
    let force                 = Number(document.getElementById("champ_force"                ).value);
    let perception            = Number(document.getElementById("champ_perception"           ).value);
    let taux_reproduction     = Number(document.getElementById("champ_taux_reproduction"    ).value);
    let nb_joueurs            = Number(document.getElementById("champ_nb_joueurs"           ).value);
    let nb_entites_par_joueur = Number(document.getElementById("champ_nb_entites_par_joueur").value);
    let nb_iterations         = Number(document.getElementById("champ_nb_iterations"        ).value);
    let nb_sexes              = Number(document.getElementById("champ_nb_sexes"             ).value);
    let nb_lignes             = Number(document.getElementById("champ_nb_lignes"            ).value);
    let nb_colonnes           = Number(document.getElementById("champ_nb_colonnes"          ).value);
    return [nom_joueur, force, perception, taux_reproduction, nb_joueurs, nb_entites_par_joueur, nb_iterations, nb_sexes, nb_lignes, nb_colonnes];
}

/* S'exécute quand l'un des input de type range change */
/* Affiche le bon nombre de points non répartis        */
function updateStats() {
    //On extrait les informations de l'interface
    let [nom_joueur, force, perception, taux_reproduction, nb_joueurs, nb_entites_par_joueur, nb_iterations, nb_lignes, nb_colonnes] = extraireDepuisInterface();
    //On modifie l'affichage des points non répartis, et des points de chaque statistique
    document.getElementById("paragraphe_points_non_repartis").innerHTML = (9 - (force + perception + taux_reproduction));
    document.getElementById("paragraphe_force").innerHTML = force;
    document.getElementById("paragraphe_perception").innerHTML = perception;
    document.getElementById("paragraphe_taux_reproduction").innerHTML = taux_reproduction;
    
}
