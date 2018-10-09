import React from 'react';
import {View, TouchableOpacity, Text,  StyleSheet, Image} from 'react-native';
import {Button, Icon} from 'native-base';
import {Header} from 'react-native-elements';

import {str, arraysEqual, containsArray} from '../commonImports.js';

var imagePionNoir    = require('../img/pionNoir.png');
var imagePionBlanc   = require('../img/pionBlanc.png');
var imageDameNoire   = require('../img/dameNoire.png');
var imageDameBlanche = require('../img/dameBlanche.png');

// Une case, c'est un rectangle qui possède :
//		1) une couleur (si elle est selectionné...)
//		2) eventuellement une image d'un pion ou d'une dame.
//
class Case extends React.Component {
	constructor(props) {
		super(props);
		this.props.parent.cases[this.props.coor] = this; 	// petit trick : on enregistre la nouvelle case dans un dico du parent (Game) 
				// qui associe coord et objet. Ainsi, on peut facilement mettre à jour une simple case par cases[coord].forceUpdate()
	}
	renderPion(coor){ 
		if (  containsArray(this.props.parent.pionsBlancs, coor) ) {
			return(
				<Image source={imagePionBlanc} style={styleImage}  />
			);
		}
		if ( containsArray(this.props.parent.pionsNoirs, coor)  ) {
			return(
				<Image source={imagePionNoir} style={styleImage} />
			);
		}
		if ( containsArray(this.props.parent.damesBlanches, coor)){
			return(
				<Image source={imageDameBlanche} style={styleImage} />
			);
		}
		if ( containsArray(this.props.parent.damesNoires, coor)){
			return(
				<Image source={imageDameNoire} style={styleImage} />
			);			
		}
	}
	getColor(){
		if (arraysEqual(this.props.coor, this.props.parent.selected)){
			return('red');
		}
		if (containsArray(this.props.parent.possiblesMvmt, this.props.coor)){
			return('blue');
		}
		if (containsArray(this.props.parent.pionsBougeables, this.props.coor)){
			return('grey');
		}
		return('#696969');
	}
	render() {

		return(

			<TouchableOpacity
				style= {{flex:1 , backgroundColor: this.getColor(), alignItems: 'center', justifyContent: 'center',}}
				onPress = {() => this.pressCase()} >

					{this.renderPion(this.props.coor)}

			</TouchableOpacity>
		);
	}
	pressCase(){
		this.props.parent.pressCase(this.props.coor);
		this.forceUpdate();
	}
}

const styleImage = {
	width: '100%',
	height: '100%'
};

export default Case;