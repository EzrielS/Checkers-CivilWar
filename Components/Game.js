import React from 'react';
import {View, Text,  StyleSheet, Image, Dimensions} from 'react-native';
import {Button, Icon, Spinner} from 'native-base';
import {Header} from 'react-native-elements';
import Case from './Case.js';

import * as dm from '../dataManipulation/checkerManipulations.js';
import * as ia from '../dataManipulation/ia.js';

import {BLACK, WHITE, range, arraysEqual, containsArray, str} from '../commonImports.js';

const INGAME = 0;
const WON = 1;

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var imageH = require('../img/ttt.jpg');
var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

class Game extends React.Component {
	constructor(props) {		// on remarque qu'ici, les datas ne sont pas stockées dans state qui rerender l'app quand il est modifié 
		super(props);
		this.state = {gameState: INGAME};
		this.selected = null;
		this.cases = {} ;
		this.pionsBlancs = [];
		this.pionsNoirs = [];
		this.damesBlanches = [];
		this.damesNoires = [];
		this.currentPlayer = BLACK;	// on veut executer nextMove au début, qui switch les player
		this.otherPlayer = WHITE;
		this.possiblesMvmt = [];
		this.inRafle = false;
		this.locked = false;
		for(let i of range(5)){
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
		this.pionsBougeables = [];
		
	}
	componentDidMount(){
		this.nextMove();
	}
	nextMove(){			// Modifie les data pour le nouveau coup. Eventuellement, 
		let player = this.currentPlayer;
		this.currentPlayer = this.otherPlayer;
		this.otherPlayer = player;

		let tmp = dm.pionsBougeables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer);
		this.pionsBougeables = tmp;
		if(!tmp[0]){	// On ne peut plus jouer _ plus de pion ou bloqué _ la partie est terminé.
			this.setState({gameState: WON});
		}
		else{
			this.selected = null;
			this.possiblesMvmt = [];
			this.inRafle = false;
			this.locked = false;
		}
	}
	async doNextMove(){	// Encapsule nextMove, afin de gérer le cas où le prochain joueur est une IA. Async, car await est utilisé.
		this.nextMove();
		if(this.props.type == 'IA'){
			this.locked = true;
			let coup = ia.choisitCoupPos(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, 2);

			await this.doCoup(coup);	// On doit attendre que le coup soit fini d'être joué pour continuer.
			this.nextMove();
		}		
	}

	// Fonction générale, qui sera utile en multi à terme. Prends une liste de coordonnés comme : [[x1, y1], [x2, y2], [x3, y3] ...]
	// 		et effectue ce coup en mettant un petit sleep entre chaque mouvement.
	async doCoup(L){	
		this.selected = L.shift();
		this.cases[this.selected].forceUpdate();
		while(L[0]){
			await sleep(400);
			let aMangé = dm.doUpdate(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, [this.selected, L[0]]);
			if(aMangé)
				this.cases[aMangé].forceUpdate();
			this.flushAndUpdateSelected();
			this.selected = L.shift();
			this.cases[this.selected].forceUpdate();
		}
		dm.pionsToDames(this.piecesBlanches(), this.piecesNoires());
		this.flushAndUpdateSelected();
	}

	// Vide une liste de coord, et update chacun.
	flushAndUpdate(L){
		while(L[0]){
			this.cases[L.pop()].forceUpdate();
		}
	}

	// Reassigne selected à null PUIS update son ancienne valeur.
	flushAndUpdateSelected(){
		let ancienSelected = this.cases[this.selected];
		this.selected = null;
		ancienSelected.forceUpdate();
	}

	// Fonctions utilitaires autoDocumentées
	updateList(L){
		for(i of L){this.cases[i].forceUpdate();}
	}
	getPlayerPions(coul){return coul== WHITE ? this.pionsBlancs : this.pionsNoirs;}
	getPlayerDames(coul){return coul == WHITE ? this.damesBlanches : this.damesNoires;}
	setPlayerPions(coul, L){
		if (coul == WHITE){
			this.pionsBlancs = L;
		}else{
			this.pionsNoirs = L;
		}
	}
	piecesBlanches(){return [this.pionsBlancs, this.damesBlanches];}
	piecesNoires() {return [this.pionsNoirs, this.damesNoires];}

	async pressCase(coord){
		if (this.locked){	// pas a un joueur à jouer
			return null;
		}
		if(!this.selected){	// rien n'est sélectionné, on selectionne la case où on clique
			if (containsArray(this.pionsBougeables, coord) ) {	// ce pion est bougeable
				this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, coord, true);
				this.selected = coord;
				this.updateList(this.possiblesMvmt);	// on update les cases ou on peux aller, car elle sont colorées
				this.cases[coord].forceUpdate();
			}
		}
		else{				// on clique sur la prochaine case
			if( containsArray(this.possiblesMvmt, coord) ){ // on click sur une case ou on peux aller
				
				this.flushAndUpdate(this.possiblesMvmt);

				let aMangé = dm.doUpdate(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, [this.selected, coord]);
				this.flushAndUpdateSelected();
				this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, coord, false);

				if(aMangé){	// on viens de faire une prise
					this.cases[aMangé].forceUpdate();
					this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, coord, false);
					if(this.possiblesMvmt[0]) { // le mouvement continu
						this.selected = coord;
						this.inRafle = true;
						this.updateList(this.possiblesMvmt);
						this.cases[coord].forceUpdate();
						return 0;
					}
				}
				dm.pionsToDames(this.piecesBlanches(), this.piecesNoires());
				await this.cases[coord].forceUpdate();
				this.doNextMove()
			}
			else{			// la case n'est pas jouable, on deselectionne la case si possible (si on est pas dans une rafle)
				if(!this.inRafle){
					this.flushAndUpdateSelected();
					this.flushAndUpdate(this.possiblesMvmt);	
				}
			}
		}
	}

	render() {
		if(this.state.gameState == WON){
			return(
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flex: 1}}>
					<View>
						<Button 
							transparent
							onPress={()=>this.props.setter('Landing')}
							style = {{alignSelf: 'flex-start', backgroundColor: 'red'}}>
								<Icon name="ios-arrow-back" />
						</Button>
					</View>
					<View>
						<Text style={styles.text}> La partie a été gagné par : {this.currentPlayer == '1' ? 'BLANC' : 'NOIR'} ! </Text>
					</View>
				</View>
			);
		}
		return(
			<View>
			    <Header
	                statusBarProps={{ barStyle: 'light-content' }}
					centerComponent={this.title()}
	                outerContainerStyles={{ backgroundColor: '#324C66', height: 75 }}
	                leftComponent={	<Button 
										transparent
										onPress={()=>this.props.setter('Landing')}
										style = {{alignSelf: 'flex-start', }}>
											<Icon name="ios-arrow-back" />
									</Button>}/>
				
				<Image 
					source={imageH}
					style={{width: windowWidth, height: windowHeight-(75 + windowWidth), resizeMode: 'stretch' }} />
				{ this.renderDamier() }
				
			</View>
		);
	}
	renderDamier(){
		return( 
			<View 
				style={styles.damier}>
				{range(5).map((x)=>{return(
					<View style={{flexDirection: 'row', height: windowWidth/5}} key={x}>
						{range(5).map((y)=>{ return(
							<View 
								key={[x, y]} 
								style={{width: windowWidth/5}}>
								<View style={styles.deuxCases}>
									<View style= {styles.caseBlanche} />
									<Case
										coor={[x*2, y*2+1]}
										parent={this} />
									
								</View>
				
								<View style={styles.deuxCases}>
									<Case
										coor={[x*2+1, y*2]}
										parent={this} />
									<View style= {styles.caseBlanche} />
								</View>
							</View> );
						})}
					</View>
				);})}
			</View>
		);
	} 
	title() {
		return(
			<View
				style={{height:'100%', flexDirection: 'column', justifyContent: 'center'}}>
				<Text style={styles.text}> Aux armes ! </Text> 
			</View>

		);
	}
}


const styles = StyleSheet.create({
	damier: {
		width:  windowWidth,
		height: windowWidth,
	},
	text: {
		fontSize: 20,
	},
	deuxCases: {
		flexDirection: 'row',
		height: windowWidth/10,
	},
	caseBlanche: {
		flex: 1,
		backgroundColor: 'white',
	},
});

export default Game;
