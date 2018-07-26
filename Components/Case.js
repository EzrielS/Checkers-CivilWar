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

containsArray = (a, b) => a.some(x => arraysEqual(x, b))



var imagePionNoir  = require('../img/pionNoir.png');
var imagePionBlanc = require('../img/pionBlanc.png');


class Case extends React.Component {
	constructor(props) {
		super(props);
		props.callback_Constructor(this);
		
	}
	renderPion(coor){ 
		if ( containsArray(this.props.getter_Coords('blanc'), coor) ) {
			return(
				<Image source={imagePionBlanc} />
			);
		}
		if ( containsArray(this.props.getter_Coords('noir'), coor) ) {
			return(
				<Image source={imagePionNoir} />
			);
		}
	}
	render() {
		return(

			<TouchableOpacity
				style= {{flex:1 , backgroundColor: '#696969'}}
				onPress = {() => this.pressCase()} >

					{this.renderPion(this.props.coor)}
					<Text> {this.props.coor} </Text>

			</TouchableOpacity>
		);
	}
	pressCase(){
		this.props.press_Caller(this.props.coor);
		this.forceUpdate();
	}
}

export default Case;