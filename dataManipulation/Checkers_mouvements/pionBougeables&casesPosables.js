// Il est important que attack soit une variable globale
var attack = 0 ;

// Fonction renvoyant, pour une position donnée, la liste des pions pouvant _légalement_ se déplacer
function pionBougeables(pW, pB, pl){
	return listNextPlay(pW, pB, pl).map((x)=>x[0]) ;
}

// Pour un pion donné, renvoie la liste de son/ses coups légaux *immédiats* possibles
function casesPosables(pW, pB, pl, pion, isFirstMove){
	attack = 0 ;
	let res ;
	funcNext = isDame(pion, pW, pB) ? dameNextPlays : pionNextPlays ;
	let move = funcNext(pion, pW, pB, pl, isFirstMove)
	if(!move) return null ;
	res = move[1] ; 				// move[0] = le pion qui bouge
	if(Array.isArray(res[0][0])) 	// Si on a affaire à une attaque, on map pour ne pas prendre la suite
		return res.map((x)=>x[0]) ;
	return res ;
}

function isDame(pion, pW, pB){
	return Boolean(pW[1].find((x)=>arraysEqual(x, pion)) || pB[1].find((x)=>arraysEqual(x, pion))) ;
}