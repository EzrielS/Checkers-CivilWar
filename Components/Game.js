import React from 'react';
import {View, TouchableOpacity, Text,  StyleSheet, Image, Dimensions} from 'react-native';
import {Button, Icon} from 'native-base';
import {Header} from 'react-native-elements';
import Case from './Case.js';

Array.range = n => Array.from({length: n}, (value, key) => key)

containsArray = (a, b) => a.some(x => arraysEqual(x, b))

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


var imagePionNoir  = require('../img/pionNoir.png');
var imagePionBlanc = require('../img/pionBlanc.png');


class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {	pionsBlancs: [], 
						pionsNoirs: [],
						selected: null,
						currentPlayer: 'blanc',
						pions: ['pionsBlancs', 'pionsNoirs'],
					};
this.cases = {} ;
this.pionsBlancs = [];
this.pionsNoirs = [];
this.pions = ['pionsBlancs', 'pionsNoirs'];
		for(let i of Array.range(5)){
			i = 2*i;
			this.pionsNoirs.push([0, i]);
			this.pionsNoirs.push([1, i+1]);
			this.pionsNoirs.push([2, i]);
			this.pionsBlancs.push([7, i+1]);
			this.pionsBlancs.push([8, i]);
			this.pionsBlancs.push([9, i+1]);
		}
		this.selected = null;
console.log(this.pionsBlancs);
	}
	renderPion(coor){ 
		if ( containsArray(this.state.pionsBlancs, coor) ) {
			return(
				<Image source={imagePionBlanc} />
			);
		}
		if ( containsArray(this.state.pionsNoirs, coor) ) {
			return(
				<Image source={imagePionNoir} />
			);
		}
	}
	handle_Case_Constructor(tCase){
		this.cases[tCase.props.coor] = tCase;
	}
	return_Coords(coul){
		if(coul == 'blanc'){
			return this.pionsBlancs;
		}else{
			return this.pionsNoirs;
		}
	}
	renderDamier(){
		return( 

			<View style={styles.damier}>{
				Array.range(5).map((x)=>{return(
					<View style={{flexDirection: 'row', height: Dimensions.get('window').width/5}} key={x}>
						{
							Array.range(5).map((y)=>{
								return(
									<View 
										key={[x, y]} 
										style={{width: Dimensions.get('window').width/5, backgroundColor: '#778899'}}>
										<View style={{flexDirection: 'row', height: Dimensions.get('window').width/10}}>
											<Case
												callback_Constructor={(a)=>this.handle_Case_Constructor(a)}
												coor={[x*2, y*2]}
												getter_Coords={(a)=>this.return_Coords(a)}
												press_Caller={a => this.pressCase(a)} />
											<View style= {{flex: 1, backgroundColor: 'white'}} />
										</View>
						
										<View style={{flexDirection: 'row', height: Dimensions.get('window').width/10}}>
											<View style= {{flex: 1 , backgroundColor: 'white'}} />
												<Case
													callback_Constructor={(a)=>this.handle_Case_Constructor(a)}
													coor={[x*2+1, y*2+1]}
													getter_Coords={(a)=>this.return_Coords(a)} 
													press_Caller={a => this.pressCase(a)} />														
										</View>

									</View> ); 
							})
						}
					</View>
				);})}
			</View>
			);
	}
	getCurrentPlayerPions(){
		return this[this.pions[0]];
	}
	pressCase(coord){
		if(!this.selected){
			if (containsArray(this.getCurrentPlayerPions(), coord)){
				this.selected = coord;
				console.log('selected !!')
			}
		}
		else{
			var pionsColor = this[this.pions[0]];
			pionsColor.splice(pionsColor.findIndex(i => arraysEqual(this.selected, i)), 1);		
			pionsColor = pionsColor.concat([coord]);
			this[this.pions[0]] = pionsColor;
			this.pions = this.pions.reverse();
			this.cases[this.selected].forceUpdate(); 
			this.selected = null;
		}
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
											styles = {{alignSelf: 'flex-start', backgroundColor: 'red'}}
											>
											<Icon name="ios-arrow-back" />
										</Button>}/>

				{ this.renderDamier() }
				
			</View>
			);
	}
}

const styles = StyleSheet.create({
	form: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#D2691E',
	},
	container: {
		justifyContent: 'center',

	},
	damier: {
		width: Dimensions.get('window').width, 
		height: Dimensions.get('window').width,
	}
});

export default Game;