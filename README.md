# Le jeu de la vie
Par Lysandre Terrisse et Emmanuel Sanchez

## Commandes
Pour lancer le site, commencez par taper la commande `npm install express socket.io`.
Ensuite, tapez `node serveur.js`. Finalement, allez sur `localhost:8888`.

## Problèmes techniques ?
Il se peut que, sur votre navigateur, le jeu devienne très lent (1fps) au bout de quelques secondes. Le problème vient du fait que, sur certains navigateurs (comme Edge), la fenêtre se met en mode "paresseux" au bout de quelques secondes d'inactivité. Ainsi, les fonctions comme `setTimeout` et `setInterval` se bloquent à un débit d'une itération par seconde. Pour corriger cela, vous pouvez utiliser un autre navigateur, comme Firefox, qui se met en mode paresseux seulement quand la page n'est pas visible.

## Comment fonctionne ce programme ?
Lorsque le serveur démarre, il choisit au hasard une graine de génération.
Ensuite, lorsqu'un utilisateur demande en premier à entrer dans la partie, le serveur récupère des informations importantes comme :
- Le nombre de joueurs
- Le nombre de lignes et de colonnes
- Le nombre d'itérations

Lorsque suffisamment d'utilisateurs entrent dans la partie, le serveur envoie ces informations à tout le monde.
Puis, grâce à la graine de génération, chaque utilisateur va, indépendemment du serveur, calculer de lui-même le déroulement du jeu. Par exemple, chaque utilisateur va générer une matrice correspondant au terrain (`liste_terrain`) et une liste d'entités (`liste_entites`).

Pour que tous les utilisateurs aient le même déroulement du jeu, il faut que le jeu soit **un automate cellulaire déterministe**. Autrement dit, à partir seulement de la graine de génération et de quelques autres paramètres, nous devrions être capable de déterminer le déroulement de la partie. C'est pour cela que, du côté du client, nous n'utilisons **jamais** la fonction `Math.random()`, et que nous préférons utiliser des fonctions de pseudo-aléatoire (qui se trouvent dans `fonctions_aleatoire.js`).

Lorsqu'un joueur essaie de faire une action, il envoie au serveur l'action qu'il veut faire, puis le serveur stockera cette action et fera un broadcast, puis les autres joueurs prendront en compte cette action lors du calcul du déroulement du jeu. Lorsqu'un utilisateur arrive en plein milieu de la partie, il demande au serveur les paramètres initiaux ainsi que la liste des actions effectuées. À partir de cela, il peut reconstruire très rapidement la partie pour rattraper son retard et suivre la partie en direct. Au début, nous avions eu peur que ce processus prendrait trop de temps, mais en réalité, un utilisateur peut rattraper une heure de retard en moins de deux secondes.

## Qualités de l'implémentation côté client
### Et si un utilisateur essaie de tricher ?
Si un joueur essaie de faire un mouvement illégal, les autres joueurs regarderont le mouvement qu'il a essayé de faire, réaliseront que ce mouvement est illégal, et l'ignoreront. Nous avons bien fait en sorte que chaque requête reçue de la part d'un autre utilisateur soit vérifiée. Même s'il est quasiment impossible de filtrer toutes les requêtes malveillantes (en pratique c'est possible, [comme dans cet article](https://arxiv.org/abs/1304.5087v4)), nous pensons que nos filtrages permettront d'empêcher la plupart des fausses requêtes.

### Et si un utilisateur essaie d'usurper l'identité d'un joueur ?

Lorsqu'un utilisateur entre dans la partie, le serveur lui envoie un identifiant secret généré purement aléatoirement. Ainsi, lorsqu'un utilisateur fait une action, il doit prouver son identité en envoyant, en plus de l'action, son identifiant secret.

### Et si le serveur crashait ?
Si le serveur crashe, les joueurs ne peuvent plus faire d'actions, mais peuvent toujours continuer de regarder la partie pour voir qui va gagner. Cela peut mieux se voir quand on quitte volontairement le serveur.

## Défauts de l'implémentation côté client

Le seul défaut que nous pouvons voir est dans le cas où un utilisateur fait une action, et que deux autres utilisateurs ne la reçoivent pas au même tick. Dans ce cas, un des utilisateurs considèrera le mouvement comme invalide (car il n'est pas arrivé à temps), mais l'autre utilisateur le considèrera valide. Ainsi, deux utilisateurs pourraient potentiellement se désynchroniser. Pour se resynchroniser, un utilisateur peut recharger la page, et ainsi tout recalculer.

Ce bug n'est arrivé que très rarement pour nous, mais nous pensons que, si le jeu était mis sur un serveur en ligne, il deviendrait très fréquent. Pour corriger cela, il faudrait remonter dans le calcul jusqu'à la désynchronisation, pour ensuite redescendre jusqu'au moment actuel. Même si cela semble largement faisable (il suffit de garder une trace du calcul de la minute précédente, comme en stockant une seule backup), la correction de ce bug semblait bien hors de portée de ce projet, et nous avons donc décidé de l'ignorer.

## Baby-boom

Puisque l'algorithme de décision de nos entités est efficace, en suivant les règles du jeu à la lettre, nos entités faisaient un "baby-boom". Ainsi, des dizaines de milliers d'entités apparaissaient en moins d'une cinquantaine d'itérations (donc en moins de cinq secondes). Nous avons donc décidé de limiter le nombre d'entités par joueur à 100. Cependant, il n'y avait plus aucun intérêt à essayer de générer un baby-boom. Nous avons donc implémenté un système de points.

## Points et pouvoirs

Lorsqu'une entité apparait, ou lorsqu'une entité est censée apparaître, le joueur de cette entité gagne un point. Avec suffisamment de points, les joueurs peuvent utiliser des pouvoirs. Cela permet de donner un intérêt à essayer de générer un baby-boom. Nous avons donc sept pouvoirs, que nous ne spoileront pas ici.

## Victoire

Un joueur gagne si, au moment de la fin de la partie, il a plus d'entités sur le terrain que les autres joueurs. Si plusieurs joueurs sont à égalité (comme dans le cas où toutes les entités meurent avant la fin de la partie), on départage les joueurs selon leurs points. S'ils sont encore en égalité, ils ont tous gagnés.

## Algorithme de décision et le facteur `intelligence`

Notre entité a un algorithme de décision assez simple :
- Si sa satiété et hydratation ne sont pas en dessous de 6, et que la tanière est visible par l'entité, alors l'entité se dirige vers sa tanière.
- Sinon, si sa satiété et son hydratation ne sont pas en dessous de 5, et qu'elle est dans la tanière, alors elle reste dans la tanière.
- Sinon, elle détermine quelle est la ressource qu'elle a actuellement le plus besoin, la cherche dans n cases aléatoires de la grille, et se dirige vers celle la plus proche dans son champ de vision.
- Si elle ne trouve pas la ressource prioritaire dans son champ de vision, elle fait la même chose pour la ressource non prioritaire.
- Si elle n'en trouve pas non plus, elle agit aléatoirement.

Nous pouvons ainsi contrôler l'efficacité des entités seulement en augmentant ou diminuant le nombre n. C'est pour cela que nous avons appelé ce nombre le facteur `intelligence`.

## Conclusion

Ce projet a été très amusant à faire. Nous avons réussi à implémenter toutes les fonctionnalités que l'on nous avait demandé, et nous avons ajouté d'autres fonctionnalité comme les pouvoirs, les points, le facteur intelligence, l'indépendance du client, et l'identification sécurisée. Finalement, nous avons réussi à avoir un rendu CSS qui nous satisfait grandement.



(Aucune IA n'a été utilisée pour ce projet)
