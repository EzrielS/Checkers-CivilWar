
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
