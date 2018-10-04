export function range(n) {return Array.from({length: n}, (value, key) => key);}

export function containsArray(a, b) {return a.some(x => arraysEqual(x, b));}

export function str(x) {return JSON.stringify(x)}

export function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}


export function deleteElementFromArray(L, el){
	nb = 0;
	for(i in L){
		i = L[i];
		if(arraysEqual(el, i)){
			L.splice(nb, 1);
			return true;
		}
		nb ++;
	}
	return false;
}

export const WHITE = 0 ;
export const BLACK = 1 ;

// Fonction qui sert à créer la copie d'un jeu afin de ne pas le modifier physiquement
export function copyBoard(a){
	let res = [[],[]] ;
	for (let p in a){ // Pions/Dames
		for (let c of a[p]){ // Cases 
			res[p].push(Array.from(c)) ;
		} 
	}
	return res ;
}