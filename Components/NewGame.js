import React from 'react';
import { StyleSheet, View, Font, Text, Image, ImageBackground, Dimensions, Picker } from 'react-native';
import {Button, Icon} from 'native-base';
import {Header} from 'react-native-elements';

class NewGame extends React.Component {
	constructor(props) {
		super(props);
		this.state = {diffSel: 1, versus: 'IA'};
	}
	formVersus(vers){
		if (vers == 'IA'){
			return(
				<View>
					<Text> Difficulté: </Text>
					<View style={{height: 50, backgroundColor: 'orange'}}>
						<Picker
							mode="dropdown"
							iosIcon={<Icon name="ios-arrow-down-outline" />}
							placeholder="Difficulté"
							placeholderStyle={{ backgroundColor: "blue" }}
							placeholderIconColor="#007aff"
							selectedValue={this.state.diffSel}
							onValueChange={(a, i)=>this.setState({diffSel: a})}
							itemStyle={{height: 30}}
							style = {{width: 175, height: 30}}>
							<Picker.Item label="Facile" value='1' />
							<Picker.Item label="Moyen" value='2' />
							<Picker.Item label="Difficile" value='3' />
						</Picker>
					</View>
				</View> 

			)
		}
		else{
			return(
					<Text> Vous allez vous battre contre un humain de votre niveau ! </Text>
				)
		}
	}
	render() {
		return(
			<View style={styles.container}>
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
	            
	            <View style={styles.form}>
	            	<View>
		            	<Text> Versus: </Text>
						<Picker
							mode="dropdown"
							iosIcon={<Icon name="ios-arrow-down-outline" />}
							placeholder="Versus"
							placeholderStyle={{ backgroundColor: "blue" }}
							placeholderIconColor="#007aff"
							selectedValue={this.state.versus}
							onValueChange={(a, i)=>this.setState({versus: a})}
							style = {{width: 175}}>
							<Picker.Item label="IA" value='IA' />
							<Picker.Item label="Solo" value='Solo' />
							<Picker.Item label="Autre Joueur" value='Player' />
						</Picker>
					</View>	
					<View>
						{this.formVersus(this.state.versus)}
					</View>
					<View>
						<Button
							style= {{width: 50}}
							onPress = {()=>this.props.doNewGame(this.state.versus, this.state.diffSel)} >
							<Text> Go ! </Text>
						</Button>
					</View>
				</View>

			</View>
			)
	}
}

const styles = StyleSheet.create({
	header: {

	},
	form: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#D2691E',
		//height: 500,
	},
	container: {
	//	alignItems: 'center',
		justifyContent: 'center',

	}
});

export default NewGame;