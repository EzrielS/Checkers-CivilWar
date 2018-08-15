import React from 'react';
import {View, TouchableOpacity, Text,  StyleSheet, Image} from 'react-native';
import {Button, Icon} from 'native-base';
import {Header} from 'react-native-elements';

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function str(x) {return JSON.stringify(x)}

containsArray = (a, b) => a.some(x => arraysEqual(x, b))


var imagePionNoir    = require('../img/pionNoir.png');
var imagePionBlanc   = require('../img/pionBlanc.png');
var imageDameNoire   = require('../img/dameNoire.png');
var imageDameBlanche = require('../img/dameBlanche.png');


class Case extends React.Component {
	constructor(props) {
		super(props);
		props.parent.handle_Case_Constructor(this);
	}
	renderPion(coor){ 
		if (  containsArray(this.props.parent.pionsBlancs, coor) ) {
			return(
				<Image source={imagePionBlanc} />
			);
		}
		if ( containsArray(this.props.parent.pionsNoirs, coor)  ) {
			return(
				<Image source={imagePionNoir} />
			);
		}
		if ( containsArray(this.props.parent.damesBlanches)){
			return(
				<Image source={imageDameBlanche} />
			);
		}
		if ( containsArray(this.props.parent.damesNoires)){
			return(
				<Image source={imageDameNoire} />
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

export default Case;