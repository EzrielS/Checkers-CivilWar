import React from 'react';
import { StyleSheet, View, Font, Text, Image, ImageBackground, Dimensions } from 'react-native';
import {Button, Icon, Picker} from 'native-base';
import {Header} from 'react-native-elements';

class NewGame extends React.Component {
	constructor(props) {
		super(props);
		this.state = {diffSel: 1, versus: 'IA'};
	}
	formVersus(vers){
		if (vers == 'IA'){
			return(
				<View style={styles.subform}>
					<Text style={styles.text}> Difficulté: </Text>
					<View style={{height: 50, backgroundColor: 'orange'}}>
						<Picker
							mode="dropdown"
							iosIcon={<Icon name="ios-arrow-down-outline" />}
							placeholder="Difficulté"
							placeholderStyle={{ backgroundColor: "blue" }}
							placeholderIconColor="#007aff"
							selectedValue={this.state.diffSel}
							onValueChange={(a, i)=>this.setState({diffSel: a})}
							itemStyle={{height: 30, fontSize: 30,}}
							itemTextStyle={{ fontSize: 30, color: 'red' }}
							style = {{width: 175, height: 30}}>
								<Picker.Item label="Facile" value={2} />
								<Picker.Item label="Moyen" value={3} />
								<Picker.Item label="Difficile" value={4} />
						</Picker>
					</View>
				</View> 

			);
		}
		else{
			return(
					<Text style={styles.text}> 
						Vous allez vous battre contre un humain de votre niveau ! 
					</Text>
				);
		}
	}
	render() {
		return(

			<View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>		

					<View style={{height: 75, width: '100%'}}>
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
											</Button>} />
					</View>

						<View style={styles.form}>

							<View style={styles.subform} >
								<Text style={styles.text}> Versus: </Text>
								<View style={{height: 50, backgroundColor: 'orange'}}>
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
											<Picker.Item label="Autre Joueur" value='Reseau' />
									</Picker>
								</View>
							</View>	
							
							{this.formVersus(this.state.versus)}
							
							<View style={{margin: 15,}} >
								<Button
									style= {{width: 50}}
									onPress = {()=>this.props.doNewGame(this.state.versus, this.state.diffSel)} >
									<Text style={styles.text}> Go ! </Text>
								</Button>
							</View>

						</View>
			
					<View style= {{height: 75}}/>

			</View>

		)
	}
}

const styles = StyleSheet.create({
	form: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'green',
		padding: 30,
		width: '60%',
	},
	container: {
		justifyContent: 'center',

	},
	text: {
		fontSize: 20,
	},
	subform: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '50%',
		justifyContent: 'space-between',
		margin: 15,
		backgroundColor: 'red',
	}
});

export default NewGame;