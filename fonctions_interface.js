function enleverMenuCreationPartie() {
    document.getElementById("menu_creation_partie").style.display = "none";
}

function enleverMenuConnexion() {
    document.getElementById("menu_connexion").style.display = "none";
    document.getElementById("bouton_jouer").style.display = "none"; // On enlève le bouton "Jouer" même s'il n'est pas dans le même <div>
}

function ajouterMenuPouvoirs() {
    document.getElementById("menu_pouvoirs").style.display = "block";
}

function enleverMenuPouvoirs() {
    document.getElementById("menu_pouvoirs").style.display = "none";
}

function ajouterMenuFinSuperintelligence() {
    document.getElementById("menu_fin_superintelligence").style.display = "block";
}

function enleverMenuPrincipal() {
    document.getElementById("menu_principal").style.display = "none";
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

function activerBouton(id_bouton, condition, fonction_serialisee) {
    document.getElementById(id_bouton).setAttribute("onclick", condition ? fonction_serialisee : "")
    document.getElementById(id_bouton).style.backgroundColor = (condition ? "#BBB" : "#555")
    document.getElementById(id_bouton).style.textShadow = (condition ? "#FFF 1px 0 2px" : "none");
}

/* S'exécute quand l'un des input de type range change */
function updateRanges() {
    //On extrait les informations de l'interface
    let [nom_joueur, force, perception, taux_reproduction, nb_joueurs, nb_entites_par_joueur, nb_iterations, nb_sexes, nb_lignes, nb_colonnes] = extraireDepuisInterface();
    
    //On calcule le nombre de points non répartis
    let nb_points_non_repartis = 9 - (force + perception + taux_reproduction);
    
    //On modifie l'affichage des points non répartis, et des points de chaque statistique
    document.getElementById("paragraphe_points_non_repartis"  ).innerHTML = nb_points_non_repartis;
    document.getElementById("paragraphe_force"                ).innerHTML = force;
    document.getElementById("paragraphe_perception"           ).innerHTML = perception;
    document.getElementById("paragraphe_taux_reproduction"    ).innerHTML = taux_reproduction;
    document.getElementById("paragraphe_nb_joueurs"           ).innerHTML = nb_joueurs;
    document.getElementById("paragraphe_nb_entites_par_joueur").innerHTML = nb_entites_par_joueur;
    document.getElementById("paragraphe_nb_iterations"        ).innerHTML = nb_iterations;
    document.getElementById("paragraphe_nb_sexes"             ).innerHTML = nb_sexes;
    document.getElementById("paragraphe_nb_lignes"            ).innerHTML = nb_lignes;
    document.getElementById("paragraphe_nb_colonnes"          ).innerHTML = nb_colonnes;
    
    //On active le bouton de connexion ssi le nombre de points répartis est positif ou nul
    activerBouton("bouton_jouer", (nb_points_non_repartis >= 0), "demanderJoindrePartie()");
    document.getElementById("paragraphe_points_non_repartis").style.color = ((nb_points_non_repartis >= 0) ? "#99F" : "#F00")
}
