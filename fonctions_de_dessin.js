/* La plupart des fonctions de ce fichier ont été inspirées d'un */
/* fichier "clientHex.html" disponible sur le Moodle. Nous avons */
/* utilisé la ligne 146 à 188. Le fichier peut être retrouvé ici */
/* https://moodle.umontpellier.fr/mod/folder/view.php?id=751983  */



/* Prend un rayon, une ligne et colonne, et le rayon des tuiles  */
/* et génère un hexagone sérialisé correspondant. Par exemple,   */
/* si l'on veut faire une entité de rayon 10 à la ligne 0 et     */
/* colonne 1, et que les tuiles ont un rayon de 30, on fait      */
/* hexagoneSerialise(10, 30, [0, 1]). On obtient un hexagone     */
/* sérialisé (une chaine de caractères).                         */
function hexagoneSerialise(rayon, rayon_tuiles, position) {
    let [ligne, colonne] = position;
    let distance_tuiles = rayon_tuiles*Math.cos(Math.PI / 6); // Distance entre le centre d'une tuile et le centre de ses côtés
    
    let string = "";
    for (let i = 0; i < 6; i++) {
        // On crée l'hexagone autour de (0, 0), puis on le positionne, puis on arrondit, puis on le décale du bord
        // La raison pour laquelle nous avons échangé le cosinus est le sinus est car nous voulons pivoter l'hexagone d'un angle de 90 degrés.
        // En échangeant les deux, nous échangeons ainsi les axes de l'abscisse et de l'ordonnée, ce qui revient à faire une rotation de 90 degrés.
        let x = Math.sin(i * Math.PI / 3) * rayon; x += distance_tuiles * (1 + 2*colonne + ligne); x = Math.round(x*100)/100; x+=10;
        let y = Math.cos(i * Math.PI / 3) * rayon; y += rayon_tuiles*(1 + 1.5*ligne)             ; y = Math.round(y*100)/100; y+=10;
        
        // On sérialise l'hexagone. M correspond à moveTo, L correspond à lineTo, et Z correspond à closePath
        if(i == 0) string += "M" + x + "," + y + " L";
        else       string +=       x + "," + y + " ";
    }
    string += "Z"
    
    return string
}


/* Crée une toile. Il ne faut pas appeler cette fonction plusieurs fois. */
function dessinerPremiereFois(liste_terrain, liste_entites, rayon_entites, rayon_tuiles) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length]
    
    let distance_tuiles = rayon_tuiles*Math.cos(Math.PI / 6);
    let width = (nb_colonnes*2 + (nb_lignes-1))*distance_tuiles + 20;
    let height = (nb_lignes*1.5 + 0.5)*rayon_tuiles + 20;
    
    //On ajoute un svg au tablier. viewBox permet de faire du responsive.
    d3.select("#tablier").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);
    
    d3.select("svg").append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "pink");
    
    dessinerTout(liste_terrain, liste_entites, rayon_entites, rayon_tuiles);
}


/* Efface tout et redessine tout */
function dessinerTout(liste_terrain, liste_entites, rayon_entites, rayon_tuiles) {
    dessinerTerrain(liste_terrain, rayon_tuiles); // On redessine le terrain
    dessinerEntites(liste_entites, rayon_entites, rayon_tuiles) // On redessine les entités
}



function getCouleur(i) {
    switch(i) {
        case  0 : return "red"   ;
        case  1 : return "purple";
        case  2 : return "orange";
        case  3 : return "yellow";
        case "E": return "#06F"  ;
        case "P": return "#6B0"  ;
        case "R": return "#875"  ;
    }
}



/* Dessine uniquement le terrain (en effaçant) */
function dessinerTerrain(liste_terrain, rayon) {
    //On supprime les hexagones du terrain
    d3.selectAll(".tuile").remove();
    
    //On dessine les tuiles
    for (let i=0; i < liste_terrain.length; i++) {
        for (let j=0; j < liste_terrain[0].length; j++) {
            d3.select("svg")
            .append("path")
            .attr("d", hexagoneSerialise(rayon, rayon, [i, j]))
            .attr("stroke", "black")
            .attr("fill", getCouleur(liste_terrain[i][j]))
            .attr("id", "t" + i + "-" + j) // t pour "tuile"
            .attr("class", "tuile")
            .on("click", tuileCliquee); //Utiliser .on("click", (d) => { tuileCliquee(d); }); ne fonctionnait pas. Il faudra utiliser this à la place.
        }
    }
}

/* Dessine uniquement les entités (en effaçant préalablement). Si deux entités sont à la */
/* même position (possible seulement dans une tanière), on ne dessine qu'un hexagone.    */
function dessinerEntites(liste_entites, rayon, rayon_tuiles) {
    //On supprime les hexagones des entités
    d3.selectAll(".entite").remove();

    //On crée une liste contenant au plus une entité par position
    let liste_entites_disjointes = [];
    for(let entite1 of liste_entites) {
        let position_est_unique = liste_entites_disjointes.every((entite2) => { return entite1.position[0] != entite2.position[0] || entite1.position[1] != entite2.position[1]; });
        if(position_est_unique) {
            liste_entites_disjointes.push(entite1);
        }
    }
    
    //On dessine les entités de cette liste
    for(let i in liste_entites_disjointes) {
        d3.select("svg")
        .append("path")
        .attr("d", hexagoneSerialise(rayon, rayon_tuiles, liste_entites_disjointes[i].position))
        .attr("stroke", "white")
        .attr("fill", getCouleur(liste_entites_disjointes[i].tribu))
        .attr("id", "e" + i) // e pour "entité"
        .attr("class", "entite");
    }
}
