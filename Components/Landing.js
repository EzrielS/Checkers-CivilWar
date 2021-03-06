import React from 'react';
import { StyleSheet, View, Font, Text, ImageBackground, Dimensions} from 'react-native';
import { Button } from 'native-base';


const imgBg = require('../img/fond.png');

class Landing extends React.Component {
	render() {
		return (
			<ImageBackground
				style={styles.imgBack}
				source={imgBg}>

			
				<View style={styles.form}>
				
				 	<Button style={styles.button} onPress = {()=>this.props.setter('NewGame')} >
						<Text style={styles.buttonText}>
							New Game
						</Text>
					</Button>

				</View>
			</ImageBackground>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#7FFFD4',
		alignItems: 'center',
		justifyContent: 'center',
	},
	form: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		fontSize: 24,
	},
	imgBack: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		alignItems: 'center',
		justifyContent: 'center',
	},
	button: {
		width: 300,
		alignItems: 'center',
		justifyContent: 'center',

	}

});


export default Landing;