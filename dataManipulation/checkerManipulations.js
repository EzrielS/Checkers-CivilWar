
const BOARD_SIZE = 10 ;
const WHITE = 'blanc' ;
const BLACK = 'noir' ;


const PION = 0 ;
const DAME = 1 ;
var attack = 0 ;
var sizeAttackPion = 0 ;

// Affichage pour tests
function str(x) {console.log(JSON.stringify(x)) ; return x ;}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function deleteElementFromArray(L, el){
	nb = 0;
	for(let i of L){
		if(arraysEqual(el, i)){
			L.splice(nb, 1);
			return true;
		}
		nb ++;
	}
	return false;
}

// Il est important que attack soit une variable globale
var attack = 0 ;

// Fonction renvoyant, pour une position donnée, la liste des pions pouvant _légalement_ se déplacer
export function pionsBougeables(pW, pB, pl){
	return listNextPlay(pW, pB, pl).map((x)=>x[0]) ;
}

// Pour un pion donné, renvoie la liste de son/ses coups légaux *immédiats* possibles
export function casesPosables(pW, pB, pl, pion, isFirstMove){
	attack = 0 ;
	let res ;
	funcNext = isDame(pion, pW, pB) ? dameNextPlays : pionNextPlays ;
	let move = funcNext(pion, pW, pB, pl, isFirstMove)
	if(!move) return [] ;
	res = move[1] ; 				// move[0] = le pion qui bouge
	if(Array.isArray(res[0][0])) 	// Si on a affaire à une attaque, on map pour ne pas prendre la suite
		return res.map((x)=>x[0]) ;
	return res ;
}

function isDame(pion, pW, pB){
	return Boolean(pW[1].find((x)=>arraysEqual(x, pion)) || pB[1].find((x)=>arraysEqual(x, pion))) ;
}


/* *** Attention, ce code nécessite des fonctions présentes dans listNextPlay.js *** */

// Modifie et renvoie les positions des joueurs après un coup donné
// Ça modifie les positions physiquements, donc tu peux direct
// utiliser posW et posB : ils sont modifiés, je les return juste au cas où
export function doUpdate(posW, posB, player, coup)
{
	let ret = []; let pieceMange ;
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	if(deleteElementFromArray(myPos[0], coup[0])) // Si c'est un pion
		myPos[0].push(coup[1]) ;
	else if(deleteElementFromArray(myPos[1], coup[0]))
		myPos[1].push(coup[1]) ;
	else str("Erreur lors de la suppression de la pièce dans myPos") ;

	if(isAttack(coup) && (pieceMange = findOpPiece(coup, opPos))){
		if(!deletePiece(opPos, pieceMange))
			console.log("doUpdate : Erreur lors de la suppression de la pièce adverse : ", pieceMange) ;
		return pieceMange;
	}
	return null;
}

// Fonction transformant les pions arrivés au bout en dame 
// (renvoie true s'il y a eu tranformation)
export function pionsToDames(posW, posB){
	let t = false ;
	for(let pos of [posW, posB]) {
		let lastRange = (pos == posW ? 0 : 9) ; // La dernière rangée est à 0 ou 9 selon 
		for(let pion of pos[0])
			if(pion[0] == lastRange && (t = deletePiece(pos, pion)))
				pos[1].push(pion);
	}
	return t ;
}

// Si le déplacement est de seulement +1 ou -1 x, on a affaire à un coup simple
// A moins que ce ne soit une dame ?
function isAttack(coup){
	return Math.abs(coup[0][0]-coup[1][0]) > 1
}

// Cherche, en partant de la position présente et en se dirigeant vers la position finale,
// à trouver la pièce adverse qui a été mangé
function findOpPiece(coup, opPos){
	let x = (coup[1][0]-coup[0][0]) ;
	x /= Math.abs(x) ;
	let y = (coup[1][1]-coup[0][1]) ;
	y /= Math.abs(y) ;
	// x,y == 1 ou -1
	let tmpPos = coup[0] ;
	while(isInBoard(tmpPos = [tmpPos[0]+x, tmpPos[1]+y]))
		if(isTaken(tmpPos, opPos))
			return tmpPos ;
	return false ;
}



/*
Fonction recevant la liste des positions du joueur 1 et 2 
sous la forme de : [listePositionPions, listePositionDames]
et à qui le tour, joueur 1 (blanc) ou joueur 2 (noir),
et renvoie la liste des coups possibles sous la forme d'un arbre :
[[positionDeDépart [posSuivante [posSuivante2] [autrePosSuivante2]] [autrePosSuivante]]...], [pareil pr dam]
On part du principe que le joueur 1 représente les blancs, et "descende" donc vers le 
bas du plateau
*/

//l'idée va être de parcourir la liste des pièces du joueur qui nous intéresse 
//et dajouter au tableau résulya
// resTree = [coupsPions, coupsDames]
// coupsPions = [posDépart [coup1] [coup2]]
function listNextPlay(posW, posB, player) {
	var resTree = [] ;
	attack = 0 ;
	let myPos = (player == WHITE ? posW : posB) ;
	let opPos = (player == WHITE ? posB : posW) ;
	resTree.push(Array.from(myPos[0]).map((x) => pionNextPlays(x, posW, posB, player))) ; // Coups pions
	resTree.push(Array.from(myPos[1]).map((x) => dameNextPlays(x, posW, posB, player))) ; // Coups dames
	return onlyBestMoves(resTree[0], resTree[1]) ;
}

function onlyBestMoves(coupsPions, coupsDames){
	let res = [] ;
	let max = 0 ;
	for(let c of coupsPions.concat(coupsDames)){
		if((lg = longueurCoup(c)) > max)
			{max = lg; res = [c] ; }
		else if(lg == max)
			if(lg>0) res.push(c) ; // On a affaire à une attaque
			else { // Coup normal avec plusieurs coups possibles
				let posDepart = [c[0]] ; let listeCoups = [] ;
				for(let c2 of c[1])
					listeCoups.push([c2]) ;
				posDepart.push(listeCoups)
				res.push(posDepart) ;
			}
	}
	return res ;
}

function longueurCoup (coup, aux=0){
	if(!coup) return -1 ;
	if(!coup[1])	// C'est une attaque, et il n'y en a qu'une
		coup=coup[0] ;
	if (!Array.isArray(coup[1][0][0]))
		return aux ;
	return longueurCoup(coup[1], aux+1) ;
}

// Fonction qui, pour, un pion donné, renvoie la liste de ses coups possibles
// Sous la forme [posDepart [coup1 [coup1.1]] [coup2 [coup2.1] [coup2.2]]] ...
function pionNextPlays (posPion, posW, posB, player, isFirstMove = true) {
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	var nexts = lanceAttack(posPion, posW, posB, player) ;
	// Si on a une prise possible et qu'elle plus longue ou égale
	// à la plus longue, on note sa longueur et on la retourne de suite 
	// affichage test : console.log("attack = ", attack, "\nlgAtt = ", longueurAttack(nexts)) ;
	if(nexts[0] && attack <= (lgAtt = longueurAttack((nexts = findBestAttacks(nexts))))) {
		attack = lgAtt; 
		return [posPion, nexts] ; 
	}
	// Sinon, si on avait déjà une prise, ou qu'on est au milieu d'une attaque, pas la peine de continuer
	else if(attack || !isFirstMove) return null ;
	nexts = [] ;
 
	// Si le joueur est blanc, on descend [x+-1,y-1], sinon on monte (x+-1,y+1)
	var avance = (player == WHITE ? -1 : 1) ;
	var tmpNexts = [[posPion[0]+avance, posPion[1]+1], [posPion[0]+avance, posPion[1]-1]] ;
	for (let c of tmpNexts){
		// Si la case est libre, on l'ajoute directement
		if(isInBoard(c) && !(isTaken(c, myPos) || isTaken(c, opPos))) nexts.push(c) ;
	}
	if(nexts[0]) return [posPion, nexts] ;
	else return null ;
}

// Renvoie pour plusieurs chemins d'attaque possible, le(s) meilleur(s)
function findBestAttacks(attack){
	if(!Array.isArray(attack[0][0])) // On est arrivé à la liste des pions mangés
		return attack ;
	let lgMax = 0 ;
	let res = [] ;
	let tmp = [] ;
	for(let c of attack){
		if((max = maxLength(c)) > lgMax){
			lgMax = max ;
			tmp = [c] ;
		}
		else if(max == lgMax)
			tmp.push(c) ;

	}
	for(let c of tmp)
		res.push([c[0], findBestAttacks(c[1])]) ;
	return res ;
}

// Retourne toutes les attaques possibles sous la forme
// [Attack1, [[Attack1.1, [p1,p2]], [[Attack1.2, [p1,p1.2]]]
function lanceAttack(posPion, posW, posB, player, pionsMangés=[])
{
	// On initalise la taille de l'attaque à 0
	sizeAttackPion = 0 ;
	var nexts = [] ;
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	var tmpAttack = [[posPion[0]+1, posPion[1]+1]] ;	// Coin haut droit
	tmpAttack.push([posPion[0]-1, posPion[1]+1]) ; 		// Coin haut gauche
	tmpAttack.push([posPion[0]+1, posPion[1]-1]);		// Bas droit
	tmpAttack.push([posPion[0]-1, posPion[1]-1]);		// Bas gauche
	var afterJump = [] ;
	for (let c of tmpAttack){
		if(isTaken(c,opPos)) {
			afterJump = [(2*c[0])-posPion[0], (2*c[1])-posPion[1]] ; // Calcul de la position après saut
			if(isInBoard(afterJump) && !isTaken(afterJump,myPos) && !isTaken(afterJump,opPos)) 
				nexts.push(nextAttack(posPion, c, afterJump, posW, posB, player, Array.from(pionsMangés))) ;
		}
	}
	return nexts ;
}

// Fonction qui sert à créer la copie d'un jeu afin de ne pas le modifier physiquement
function copyBoard(a){
	let res = [[],[]] ;
	for (let p in a){ // Pions/Dames
		for (let c of a[p]){ // Cases 
			res[p].push(Array.from(c)) ;
		} 
	}
	return res ;
}

// Retourne tous les coups possibles après une attaque, ainsi que les pions qui seraient
// mangés dans la rafle, sous la forme :
// [Attack1, [Attack1.1, [[p1,p2]]] [Attack1.2, [[p1,p1.2]]]]
function nextAttack(posDepart, pionMangé, afterJump, posW, posB, player, pionsMangés=[])
{
	var res = [afterJump] ; // Première attaque
	let myPosNew = copyBoard((player == WHITE ? posW : posB));
	let opPosNew = copyBoard((player == WHITE ? posB : posW)) ;
	deletePiece(myPosNew, posDepart) ;
	if (!deletePiece(opPosNew, pionMangé)) {
			console.log("Erreur lors de la modification des positions après attaque") ;
			exit() ;
		}
	pionsMangés.push(pionMangé) ;
	var tmp = lanceAttack(afterJump, (player == WHITE ? myPosNew : opPosNew), 
		(player == WHITE ? opPosNew : myPosNew), player, Array.from(pionsMangés)) ;
	if(tmp[0]) res.push(tmp) ;
	else res.push(pionsMangés) ;
	return res;
}

function isInBoard(c) {
	return ( c[0] >= 0 && c[1] >= 0 && c[0] < BOARD_SIZE && c[1] < BOARD_SIZE ) ;
}

// Return Boolean true if pos c taken in pos List
function isTaken(c, pos) {
	if(pos[0] && pos[1])
		return Boolean(pos[0].find(function(e){return arraysEqual(e,c) ;})) || 
			Boolean(pos[1].find(function(e){return arraysEqual(e,c) ;}));
	return false ;
}

function deletePiece(pos, piece)
{
	return deleteElementFromArray(pos[0], piece) || deleteElementFromArray(pos[1], piece) ; 
}

// Retourne le nombre de prises de l'attaque par défaut lors d'une 'rafle'
// Une attaque est sous la forme [[[af], [[[af2], [[p1], [p2]]], [[af3], [p1], [p2]]]]]]
function longueurAttack(attack, aux=0)
{
	if(Array.isArray(attack[0][0]))
		if(attack[1])
			return longueurAttack(Array.from(attack[1]), aux + 1) ;
	return aux ;
}


// Renvoie la longueur maximum de plusieurs rafles possibles
function maxLength(attack)
{
	let res = 0 ;
	if(!Array.isArray(attack[0][0])) // On a affaire à la position de départ
		attack = attack[1] ;

	if(!Array.isArray(attack[0][0])) // On a affaire à la liste des pions mangés
		return attack.length ;
	
	for (let c of attack){
		if((lg = maxLength(c)) > res)
			res = lg ;
	}
	return res ;
}


// Retourne la liste des pions mangés après une rafle
function listePionsMangés(attack)
{
	if(Array.isArray(attack[0][0]))
		return listePionsMangés(Array.from(attack[0][1])) ;
	return attack[0].length ;

}

function dameNextPlays(posDame, posW, posB, player, isFirstMove = true){
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	var nexts = lanceAttackDame(posDame, posW, posB, player) ;

	// Si on a une prise possible et qu'elle plus longue ou égale
	// à la plus longue, on note sa longueur et on la retourne de suite 
	// affichage test : console.log("attack = ", attack, "\nlgAtt = ", longueurAttack(nexts)) ;
	if(nexts[0] && attack <= (lgAtt = longueurAttack((nexts = findBestAttacks(nexts))))) 
		{attack = lgAtt; return [posDame, nexts] ; }
	// Sinon, si on avait déjà une prise, ou qu'on est au milieu d'une attaque, pas la peine de continuer
	else if(attack || !isFirstMove) return null ;
	nexts = [] ;
 
	var tmpNexts = listeCasesDames(posDame, posW, posB, player) ;
	for (let c of tmpNexts[0]){
		// Si la case est libre, on l'ajoute directement
		if(isInBoard(c) && !(isTaken(c, myPos) || isTaken(c, opPos))) nexts.push(c) ;
	}
	if(nexts[0]) return [posDame, nexts] ;
	else return null ;
}

// Retourne toutes les attaques possibles d'une dame sous la forme
// [Attack1, [Attack1.1, [p1,p2]] [Attack1.2, [p1,p1.2]]]
function lanceAttackDame(posDame, posW, posB, player, pionsMangés=[])
{
	var nexts = [] ;
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	var deplacements = listeCasesDames(posDame, posW, posB, player) ;
	// On teste les attaques possibles
	for (let c of deplacements[1]){
		let afterJump = c[0] ;
		let pionMangé = c[1] ;
		let tmpPionsMangés = Array.from(pionsMangés) ;
		tmpPionsMangés.push(pionMangé) ;
		deletePiece((myPosNew = copyBoard(myPos)), posDame) ;
		if(!deletePiece((opPosNew = copyBoard(opPos)), pionMangé))
			console.log("lanceAttackDame : Erreur lors de la suppression de la pièce adverse") ;
		let tmpAttack = lanceAttackDame(afterJump, 
							(player == WHITE ? myPosNew : opPosNew), 
							(player == WHITE ? opPosNew : myPosNew),
							player, tmpPionsMangés) ;
		if(tmpAttack[0]) nexts.push([afterJump, tmpAttack]) ;
		else nexts.push([afterJump, tmpPionsMangés]) ;
	}
	return nexts ;
}

// Renvoie la liste de toutes les cases où une dame peut se déplacer 
// sous la forme : [[liste cases de déplacements normal], [[posAprèsSaut, pionMangeable1] [p,pionMang2..]]]
function listeCasesDames(posDame, posW, posB, player)
{
	var myPos = (player == WHITE ? posW : posB) ;
	var opPos = (player == WHITE ? posB : posW) ;
	var deplacementsNormaux = [] ;
	var sauteEtMange = [] ;
	for (let x of [-1,1])
	{	
		let plusMoinsX = x ;
		for(let y of [-1, 1]) {
			let plusMoinsY = y ;
			x = plusMoinsX ;
			while(isInBoard((tmpPos = [posDame[0]+x, posDame[1]+y])))
			{
				if(isTaken(tmpPos, myPos))
					break ;
				if(isTaken(tmpPos, opPos)){
					afterJump=[tmpPos[0],tmpPos[1]] ;
					while(isInBoard((afterJump = [afterJump[0]+plusMoinsX,afterJump[1]+plusMoinsY]))
						 && !isTaken(afterJump,myPos) && !isTaken(afterJump,opPos) ) {
					sauteEtMange.push([afterJump, tmpPos]) ;
					//console.log(afterJump) ;
					}
					break ;
				}
				deplacementsNormaux.push(tmpPos) ;
				y+=plusMoinsY ;
				x+=plusMoinsX ;
			}
		}
	}
	return [deplacementsNormaux, sauteEtMange] ;
}



//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////



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
    							valeurSituation(s, s.player)*depth/100) ; // UP
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
