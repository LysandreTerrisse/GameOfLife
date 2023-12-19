// Technique trouvée sur 

var seed;

//Cette fonction vient du site https://svijaykoushik.github.io/blog/2019/10/04/three-awesome-ways-to-generate-random-number-in-javascript/
//Est basée sur xorshift. Elle renvoie un nombre dans l'intervalle [0;1[
function nextRandom(){
    seed ^= seed << 13;//On fait un XOR entre la clé et elle-même décalée de 13 bits vers la gauche
    seed ^= seed >> 17;//On fait un XOR entre la clé et elle-même décalée de 17 bits vers la droite
    seed ^= seed << 5 ;//On fait un XOR entre la clé et elle-même décalée de 5  bits vers la gauche

    return seed / 2**32 + 0.5;
}

//Génère un entier entre a et b inclus
function randint(a, b) {
    return a + Math.floor(nextRandom() * (b-a+1))
}

function setSeed(newseed) {
    seed = newseed;
}

function getSeed() {
    return seed;
}

function isSeedSet() {
    return (typeof seed !== "undefined");
}
