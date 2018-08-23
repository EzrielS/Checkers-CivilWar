import React from 'react';
import {View, TouchableOpacity, Text,  StyleSheet, Image, Dimensions} from 'react-native';
import {Button, Icon} from 'native-base';
import {Header} from 'react-native-elements';
import Case from './Case.js';
import * as dm from '../dataManipulation/checkerManipulations.js';
import 'react-native-console-time-polyfill';

// import * as ia from '../dataManipulation/ia.js';


function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var imageH = require('../img/ttt.jpg');
var windowWidth = Dimensions.get('window').width;


class Game extends React.Component {
	constructor(props) {
		super(props);
		this.selected = null;
		this.cases = {} ;
		this.pionsBlancs = [];
		this.pionsNoirs = [];
		this.damesBlanches = [];
		this.damesNoires = [];
		this.pions = ['noir', 'blanc'];
		this.possiblesCoups = [];	// coup = ensemble de mvmnt qui sont 'en une fois'
		this.possiblesMvmt = [];
		this.inRafle = false;
		this.locked = false;

		for(let i of Array.range(5)){
			i = 2*i;
			this.pionsNoirs.push([0, i+1]);
			this.pionsNoirs.push([1, i]);
			this.pionsNoirs.push([2, i+1]);
			this.pionsNoirs.push([3, i]);

			this.pionsBlancs.push([6, i+1]);
			this.pionsBlancs.push([7, i]);
			this.pionsBlancs.push([8, i+1]);
			this.pionsBlancs.push([9, i]);
		}

		this.infoGame = {};


		this.nextMove();
	}
	nextMove(){
		this.pions = this.pions.reverse();
		this.pionsBougeables = dm.pionsBougeables(this.piecesBlanches(), this.piecesNoires(), this.pions[0])
		this.selected = null;
		this.possiblesMvmt = [];
		this.inRafle = false;
		this.locked = false;
	}
	async doNextMove(){
		this.nextMove();
		console.log('Executing doNextMove');
		if(this.props.type == 'IA'){
			this.locked = true;
console.time("ia");
			let coup = dm.choisitCoupPos(this.piecesBlanches(), this.piecesNoires(), this.pions[0], 2);
console.timeEnd("ia");
			this.doCoup(coup);
		}
		else if(this.props.type == 'Solo'){}
		this.nextMove();
	}
	async pressCase(coord){ 
		if (this.locked){	// pas a un joueur à jouer
			return null;
		}
		if(!this.selected){
			if (containsArray(this.pionsBougeables, coord) ) {	// ce pion est bougeable
				this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.pions[0], coord, true);
				this.selected = coord;
				this.updateList(this.possiblesMvmt);
				this.cases[coord].forceUpdate();
			}
		}
		else{
			if( containsArray(this.possiblesMvmt, coord) ){ // on click sur une case ou on peux aller
				
				this.flushAndUpdate(this.possiblesMvmt);

				let aMangé = dm.doUpdate(this.piecesBlanches(), this.piecesNoires(), this.pions[0], [this.selected, coord]);
				this.flushAndUpdateSelected();
				this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.pions[0], coord, false);

				if(aMangé){	// on viens de faire une prise
					this.cases[aMangé].forceUpdate();
					this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.pions[0], coord, false);
					if(!this.possiblesMvmt[0]) { // dernier mvmnt possible
						this.cases[coord].forceUpdate();
						await sleep(0);
						this.doNextMove();
					}
					else{					// le mouvement continu
						this.selected = coord;
						this.inRafle = true;
						this.updateList(this.possiblesMvmt);
						dm.pionsToDames(this.piecesBlanches(), this.piecesNoires());
						this.cases[coord].forceUpdate();
					}
				}
				else{
					this.cases[coord].forceUpdate();
					dm.pionsToDames(this.piecesBlanches(), this.piecesNoires());
					await sleep(0);
					this.doNextMove()
				}
			}
			else{			// la case n'est pas jouable, on deselectionne la case si possible
				if(!this.inRafle){
					this.flushAndUpdateSelected();
					this.flushAndUpdate(this.possiblesMvmt);	
				}
			}
		}
	}
	doMvmt(M){
		
	}
	doCoup(L){
		this.selected = coup.shift();
		this.cases[this.selected].forceUpdate();
		while(coup[0]){
			await sleep(400);
			let aMangé = dm.doUpdate(this.piecesBlanches(), this.piecesNoires(), this.pions[0], [this.selected, coup[0]]);
			if(aMangé)
				this.cases[aMangé].forceUpdate();
			this.flushAndUpdateSelected();
			this.selected = coup.shift();
			this.cases[this.selected].forceUpdate();
		}
		this.flushAndUpdateSelected();
	}
	flushAndUpdate(L){
		while(L[0]){
			this.cases[L.pop()].forceUpdate();
		}
	}
	flushAndUpdateSelected(){
		let ancienSelected = this.cases[this.selected];
		this.selected = null;
		ancienSelected.forceUpdate();
	}
	updateList(L){
		for(i of L){this.cases[i].forceUpdate();}
	}
	getPlayerPions(coul){
		if(coul== 'blanc'){
			return this.pionsBlancs;
		}
		return this.pionsNoirs;
	}
	getPlayerDames(coul){
		if(coul == 'blanc'){
			return this.damesBlanches;
		}
		return this.damesNoires;
	}
	setPlayerPions(coul, L){
		if (coul == 'blanc'){
			this.pionsBlancs = L;
		}else{
			this.pionsNoirs = L;
		}

	}
	piecesBlanches(){
		return [this.pionsBlancs, this.damesBlanches];
	}
	piecesNoires(){
		return [this.pionsNoirs, this.damesNoires];
	}
	render() {
		return(
			<View>
			    <Header
	                statusBarProps={{ barStyle: 'light-content' }}
	                centerComponent={{ text: 'Nouveau Jeu', style: { color: '#fff' } }}
	                outerContainerStyles={{ backgroundColor: '#324C66' }}
	                leftComponent={	<Button 
										transparent
										onPress={()=>this.props.setter('Landing')}
										styles = {{alignSelf: 'flex-start', backgroundColor: 'red'}}>
											<Icon name="ios-arrow-back" />
									</Button>}/>
				<Image 
					source={imageH}
					style={{width: windowWidth}} />
				{ this.renderDamier() }
				
			</View>
			);
	}
	renderDamier(){
		return( 
			<View style={styles.damier}>{
				Array.range(5).map((x)=>{return(
					<View style={{flexDirection: 'row', height: Dimensions.get('window').width/5}} key={x}>
						{Array.range(5).map((y)=>{ return(
							<View 
								key={[x, y]} 
								style={{width: Dimensions.get('window').width/5}}>
								<View style={{flexDirection: 'row', height: Dimensions.get('window').width/10}}>
									<View style= {{flex: 1, backgroundColor: 'white'}} />
									<Case
										coor={[x*2, y*2+1]}
										parent={this} />
									
								</View>
				
								<View style={{flexDirection: 'row', height: Dimensions.get('window').width/10}}>
									<Case
										coor={[x*2+1, y*2]}
										parent={this} />
									<View style= {{flex: 1 , backgroundColor: 'white'}} />
								</View>
							</View> );
						})}
					</View>
				);})}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	damier: {
		width:  Dimensions.get('window').width,
		height: Dimensions.get('window').width,
	}
});

export default Game;


Array.range = n => Array.from({length: n}, (value, key) => key)

containsArray = (a, b) => a.some(x => arraysEqual(x, b))

function str(x) {return JSON.stringify(x)}

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

