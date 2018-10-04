
import {BLACK, WHITE, range, arraysEqual, containsArray, str, deleteElementFromArray, copyBoard} from '../commonImports.js';
import {listNextPlay, doUpdate, pionsToDames} from './checkerManipulations.js';

/* **** IA *****
On utilise un algorithme minimax, avec le fameux élagage alpha-beta, qui permet
de restreindre le temps de calcul en coupant les branches des branches qui se révéleront 
forcément plus grande (pour les noeuds min) ou plus petites (pour les noeuds max)
que celles qu'on a pu déjà calculer (c'est la fenêtre alpha-beta). On simplifie 
l'algorithme de la même manière qu'on simplifie minimax en negamax, 
c'est-à-dire en inversant à chaque récursion A et B plutôt que
de conditionner (si on est sur un noeud min :... sur un noeud max:...))
Un algorithme basé sur minimax aura toujours besoin de deux fonctions décisives : 
- une fonction enfants() renvoyant toutes les situations de jeu découlant de la situation courante 
- et une fonction d'évaluation de la valeur d'une situation.
C'est elles que l'on va commencer par programmer. 
*/






/* Puisqu'avec la représentation des données qu'on a choisi depuis le départ,
 on a séparé posW et posB, 
pour représenter une situation mieux vaux créer une
structure plutôt qu'un simple tableau : ce sera beaucoup plus simple à gérer... Je pense.*/
export function Situation(posW, posB, player){
  this.posW = copyBoard(posW) ;       // On copie pour ne pas modifier physiquement les tableaux
  this.posB = copyBoard(posB) ;
  this.player = player ;              // A qui le tour ?
  this.enfants = enfantsSituations ;  // Fonction de calcul des enfants
  this.valeur = valeurSituation ;     // Fonction d'évaluation de la valeur
}

// La valeur d'une situation est la différence entre le nombre de pions au joueur
// et ceux de l'adversaire, sachant que les dames ont une valeur de trois.
// Attention ! Alors que la variable Situation.player représente à qui le tour,
// la variable player de valeurSituation représente le joueur pour qui on évalue 
// la situation, que ce soit son tour ou pas...
function valeurSituation(situation, player){
  valW = situation.posW[0].length + (situation.posW[1].length * 3) ;
  valB = situation.posB[0].length + (situation.posB[1].length * 3) ;
  return (player == WHITE ? valW - valB : valB - valW) ;
}


// listNextPlay malgré son nom, renvoie un arbre de coups sous la forme :
// [[pion1 [[coup1]], [coup2]], [pion2...] ou
// [[pion1 [[attaque1 , [[suiteAttaque , listePionsBouffés], suiteAttaque2 ...]]], [pion2...]]
// C'est pourquoi, pour calculer plus facilement les situations enfants, il faut une fonction qui
// transforme l'arbre des coups en simple liste de coups, sous la forme :
// [[pion1 coup1] [pion1 coup2]...] etc
function listePlateCoups(s){
  let res = [] ;
  let tmpRes = [] ;
  let coup, pion ;
  let arbreCoups = listNextPlay(s.posW, s.posB, s.player) ;
  for(let pionCoup of arbreCoups){ 
    // pionC = [pion [[coup1], [coup2]] ou [pion [[attaque1, [[attaque2]]]]]
    // console.log("pionCoup = ", pionCoup) ;
    coup = pionCoup[1] ; // coup = [ [ [ 5, 2 ] ], [ [ 5, 0 ] ] ] ou [[attaque1, [[attaque2]]]]
    pion = pionCoup[0] ;
    for (let tmpRes of exploreCoup(coup))
      res.push([pion].concat(tmpRes)) ;
  }
  return res ;
}

// Cette fonction transforme un coup arbre en une liste plate, en multipliant le nombre de coups
function exploreCoup(coup, bag=[]){
  let res=[];
  //console.log("coup = ",coup) ;
      for(let c of coup){ 
        // c = [[4,7],[[[6,5],[[3,8],[5,6]]],[[2,5],[[3,8],[3,6]]]]] ou [ [ 5, 2 ] ]
        //console.log("c = ",c) ;
        if(!c[1]) // c = [ [ 5, 2 ] ]
          {res.push(myPush(bag, c[0])) ;}
        else if(!Array.isArray(c[1][0][0])) // c = [[4,7], [bouf1, bouf2]]
          {res.push(myPush(bag,c[0])) ; }
        else { // c = [[4,7], [coup1, coup2]]
          for(let tmpRes of exploreCoup(c[1],myPush(bag,c[0])))
            res.push(tmpRes) ; 
        }
      }
 return res ;
}

// Return le tablau 'pushé'
function myPush(a, b){
  let c = Array.from(a)
  c.push(b) ;
  return c ;
}


// Enfin, la fonction de calcul des situations enfants.
// Elle fonctionne en bouclant sur la liste de liste de coups
// renvoyé par listePlateCoups, et en doUpdatant la situation 
// au fur et à mesure des coups joués, 
// pour l'ajouter au tableau des situations enfants
function enfantsSituations(s){
  let res = [] ;
  let newSitu ;
  for(let coup of listePlateCoups(s)){
    newSitu = new Situation(s.posW, s.posB, inversePlayer(s.player)) ; //On note d'avance l'inver
    do {doUpdate(newSitu.posW, newSitu.posB, s.player, [coup[0], coup[1]]) ;} // on update
        while(coup.shift() && coup[1])   // et on décale
    pionsToDames(newSitu.posW, newSitu.posB) ;
    res.push(newSitu) ; // On store la situation résultante ici.
  }
  return res ;
}

function inversePlayer(player){
  return (player == WHITE ? BLACK : WHITE) ;
}

// Futur fonction d'ordonnencement des meilleurs coups en premier :
function orderMoves(s){
  return s ;
}

/* 
  **** Negamax avec élagage alpha-beta ****
Fonction mère : negamax avec élagage alpha-bêta
Rappelons le concept : negamax est un simplification de minimax, 
puisqu'au lieu de faire min/max/min/max, il inverse à chaque fois
la valeur de retour de l'évaluation puisque max(a, b) = -(min(-a, -b))
L'élagage alpha-beta consiste quant à lui, en gros, à créer une fenêtre
des valeurs min et max à l'intérieur de laquelle on peut sortir une valeur.
Ainsi, dès qu'en parcourant un noeud, on se rend compte que l'on va 
forcément sortir de cette fenêtre, on coupe la recherche, ce qui permet
d'économiser du temps de calcul.
Plus d'infos sur le très bon article wikipédia de negamax en anglais,
(sur lequel je me suis basé), ainsi que sur cette vidéo de profs de l'université 
de Sherbrooke :
https://en.wikipedia.org/wiki/Negamax
https://www.youtube.com/watch?v=KS2QkHe-hpE */

function negamax(s, depth, alpha=-1000, beta=1000) // s = noeud
{
  if(!depth || !(childNodes = enfantsSituations(s))[0]) // Depth = 0 ou fin du jeu
    return valeurSituation(s, s.player) ;

  childNodes = orderMoves(childNodes) ;
  value = -1000 ;
  for(let child of childNodes){
    //console.log("depth = ", depth, "\nchild.posW = ", child.posW,  "\nchild.posB = ", child.posB, 
    //  "\nplayer = ", child.player, "\n*****") ;
    value = Math.max(value, -negamax(child, depth - 1, -beta, -alpha) +
    							(valeurSituation(s, s.player)/(depth*5)/100)) ; // UP
							    /* ^ Cet ajout sert à faire en sorte que l'évalutation
							    d'une situation soit plus forte lorsqu'elle amène plus TÔT
							    à une situation avantageuse, ou réciproquement si elle 
							    amène à une situation désavantageuse dans plus longtemps.
							    Ceci permet à l'IA de ne pas jouer des coups où elle va se jetter 
							    devant des pions adverse sous prétexte que l'adversaire 
							    peut de toute façon bouffer un de ses pion dans 3 coups 
							    en jouant parfaitement. C'est un jeu plus 'humain' et plus logique
							    vu que le joueur adverse ne joue pas forcément parfaitement... */
    alpha = Math.max(alpha, value) ;
    if(alpha >= beta)
      break ;
  }
  return value ;
}

// On définit les niveaux de l'IA comme degré de profondeur
// du calcul des noeuds
const HASARD = 0 ;  // Choisit un coup au hasard
const NUL = 2 ;     // Calcul avec un seul coup de profondeur, etc...  
const FACILE = 3 ;
const NORMAL = 5 ;
const DIFFICILE = 7 ; // Il faudra tester la puissance nécessaire pour aller jusque là...
const EXTREME = 10 ; 

// Fonction qui construit la struct et l'envoie à la vraie fonction
// permettant de choisir un coup avec une certaine profondeur de calcul
export function choisitCoupPos(posW, posB, player, depth = NORMAL){
  return choisitCoup((new Situation(posW, posB, player)), depth) ;
}

// Fonction de choix du coup
function choisitCoup(s, depth = NORMAL){
  let res = [] ;
  let val = -100, i = 0 ;
  let tmpVal ;
  let childNodes = enfantsSituations(s) ;
  let coups = listePlateCoups(s) ;
  if(depth < 1) // Si on veut choisir un coup au hasard
    res = coups ;
  else {
    // Si on a plus de trois branches de départ, il faut aller moins profond
    if(childNodes.len > 3 && depth > 4) 
      depth-- ;
    for(let child of childNodes){
      // On évalue la valeur de la prochaine situation pour l'adversaire
      if(val < (tmpVal = -negamax(child, depth-1)))
        {val = tmpVal ; res = [coups[i]] ;}
      if(val == tmpVal)
        res.push(coups[i]) ;
      i++ ;
    }
  }
  if(res[0])
    return res[Math.floor(Math.random() * Math.floor(res.length))];
  else
    return null ;
}

/* Pseudo-code de l'algorithme :
function negamax(node, depth, α, β, color) is
    if depth = 0 or node is a terminal node then
        return color × the heuristic value of node
    childNodes := generateMoves(node)
    childNodes := orderMoves(childNodes)
    value := −∞
    foreach child in childNodes do
        value := max(value, −negamax(child, depth − 1, −β, −α, −color))
        α := max(α, value)
        if α ≥ β then
            break (* cut-off *)
    return value
        1
      3   4
     4 5 6 3 
*/
