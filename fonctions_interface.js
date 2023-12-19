function enleverInputsCreationPartie() {
    document.getElementById("menu_creation_partie").style.display = "none";
}

function enleverInputsDeConnexion() {
    document.getElementById("menu_connexion").style.display = "none";
    console.log("test");
    document.getElementById("bouton_jouer"            ).type = "hidden"; // On enlève le bouton "Jouer" même s'il n'est pas dans le même <div>
}

function extraireDepuisInterface() {
    let nom_joueur    =        document.getElementById("champ_nom_joueur"   ).value ;
    let nb_iterations = Number(document.getElementById("champ_nb_iterations").value);
    let nb_joueurs    = Number(document.getElementById("champ_nb_joueurs"   ).value);
    let nb_lignes     = Number(document.getElementById("champ_nb_lignes"    ).value);
    let nb_colonnes   = Number(document.getElementById("champ_nb_colonnes"  ).value);
    return [nom_joueur, nb_iterations, nb_joueurs, nb_lignes, nb_colonnes];
}

//module.exports = {enleverInputsCreationPartie, enleverInputsDeConnexion};
