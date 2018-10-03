import React from 'react';
import {View, TouchableOpacity, Text,  StyleSheet, Image, Dimensions} from 'react-native';
import {Button, Icon, Spinner} from 'native-base';
import {Header} from 'react-native-elements';
import Case from './Case.js';
import * as dm from '../dataManipulation/checkerManipulations.js';
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


class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {gameState: INGAME}; 
		this.selected = null;
		this.cases = {} ;
		this.pionsBlancs = [];
		this.pionsNoirs = [];
		this.damesBlanches = [];
		this.damesNoires = [];
		this.currentPlayer = BLACK;
		this.otherPlayer = WHITE;
		this.possiblesMvmt = [];
		this.inRafle = false;
		this.locked = false;
		for(let i of range(5)){
			i = 2*i;
			this.pionsNoirs.push([0, i+1]);
//			this.pionsNoirs.push([1, i]);
//			this.pionsNoirs.push([2, i+1]);
//			this.pionsNoirs.push([3, i]);
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
	nextMove(){
		let player = this.currentPlayer;
		this.currentPlayer = this.otherPlayer;
		this.otherPlayer = player;

		let tmp = dm.pionsBougeables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer);
		this.pionsBougeables = tmp;
		if(!tmp[0]){
			this.setState({gameState: WON});
		}
		else{
			this.selected = null;
			this.possiblesMvmt = [];
			this.inRafle = false;
			this.locked = false;
		}
	}
	async doNextMove(){
		this.nextMove();
		if(this.props.type == 'IA'){
			this.locked = true;
			let coup = dm.choisitCoupPos(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, 2);

			await this.doCoup(coup);
			this.nextMove();
		}
		else if(this.props.type == 'Solo'){}
		
	}
	async pressCase(coord){ 
		if (this.locked){	// pas a un joueur à jouer
			return null;
		}
		if(!this.selected){
			if (containsArray(this.pionsBougeables, coord) ) {	// ce pion est bougeable
				this.possiblesMvmt = dm.casesPosables(this.piecesBlanches(), this.piecesNoires(), this.currentPlayer, coord, true);
				this.selected = coord;
				this.updateList(this.possiblesMvmt);
				this.cases[coord].forceUpdate();
			}
		}
		else{
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
				this.cases[coord].forceUpdate();
				await sleep(0);
				this.doNextMove()
			}
			else{			// la case n'est pas jouable, on deselectionne la case si possible
				if(!this.inRafle){
					this.flushAndUpdateSelected();
					this.flushAndUpdate(this.possiblesMvmt);	
				}
			}
		}
	}
	async doCoup(L){	// fonction générale, qui sera utile en multi à terme
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
		if(coul== WHITE){
			return this.pionsBlancs;
		}
		return this.pionsNoirs;
	}
	getPlayerDames(coul){
		if(coul == WHITE){
			return this.damesBlanches;
		}
		return this.damesNoires;
	}
	setPlayerPions(coul, L){
		if (coul == WHITE){
			this.pionsBlancs = L;
		}else{
			this.pionsNoirs = L;
		}
	}
	piecesBlanches(){return [this.pionsBlancs, this.damesBlanches];}
	piecesNoires() {return [this.pionsNoirs, this.damesNoires];}
	render() {
		if(this.state.gameState == WON){
			return(
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flex: 1}}>
					<View>
						<Button 
							transparent
							onPress={()=>this.props.setter('Landing')}
							styles = {{alignSelf: 'flex-start', backgroundColor: 'red'}}>
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
	getTransform(){
		if(this.inNetworkGame && this.mPlayer == BLACK){
			return {transform: [{ rotate: '180deg'}]};
		}
		return {};
	}
	renderDamier(){
		return( 
			<View 
				style={[styles.damier,this.getTransform()]}>
				{range(5).map((x)=>{return(
					<View style={{flexDirection: 'row', height: Dimensions.get('window').width/5}} key={x}>
						{range(5).map((y)=>{ return(
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
	},
	text: {
		fontSize: 20,
	}
});

export default Game;
