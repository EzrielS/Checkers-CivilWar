import React from 'react';
import { StyleSheet, View, Font, Text, Image, ImageBackground, Dimensions } from 'react-native';
import {Button, Icon, Picker} from 'native-base';
import {Header} from 'react-native-elements';

const imgBg = require('../img/fond3.png');

class NewGame extends React.Component {
	constructor(props) {
		super(props);
		this.state = {diffSel: 3, versus: 'IA'};
	}
	title() {
		return(
			<View
				style={{height:'100%', flexDirection: 'column', justifyContent: 'center'}}>
				<Text style={styles.text}> Nouveau Jeu </Text> 
			</View>

		);
	}
	render() {
		return(

			<View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'grey'}}>		

					<View style={{height: 75, width: '100%'}}>
						<Header
							statusBarProps={{ barStyle: 'light-content' }}
							centerComponent={this.title()}
							outerContainerStyles={{ backgroundColor: '#324C66' }}
							leftComponent={	<Button 
												transparent
												onPress={()=>this.props.setter('Landing')}
												style = {{alignSelf: 'flex-start', }}
												>
													<Icon name="ios-arrow-back" />
											</Button>} />
					</View>


					<ImageBackground source={imgBg} style={styles.imgBack}>
						<View style={styles.form}>
							<View style={styles.subform} >
								<View >
									<Text style={styles.text}> Versus: </Text>
								</View>
								<View style={{height: 50, backgroundColor: 'orange', width: "55%" }}>
									<Picker
										mode="dropdown"
										iosIcon={<Icon name="ios-arrow-down-outline" />}
										placeholder="Versus"
										placeholderIconColor="#007aff"
										selectedValue={this.state.versus}
										onValueChange={(a, i)=>this.setState({versus: a})}
										style = {{width: "100%"}}>
											<Picker.Item label="IA" value='IA' />
											<Picker.Item label="Solo" value='Solo' />
									</Picker>
								</View>
							</View>	

							{this.formVersus(this.state.versus)}

							<View style={{margin: 15,}} >
								<Button
									style= {{width: 50, backgroundColor: "#324C66"}}
									onPress = {()=>this.props.doNewGame(this.state.versus, this.state.diffSel)} >
									<Text style={styles.text}> Go ! </Text>
								</Button>
							</View>

						</View>
				
						<View style= {{height: 75}} />

					</ImageBackground>
			</View>

		)
	}
	formVersus(vers){			// renderise une partie du formulaire afin d'aléger le reste.
		if (vers == 'IA'){
			return(
				<View style={styles.subform}>
					<View >
						<Text style={styles.text}> Difficulté: </Text>
					</View>
					<View style={{height: 50,width: "55%",backgroundColor: 'orange'}}>
						<Picker
							mode="dropdown"
							iosIcon={<Icon name="ios-arrow-down-outline" />}
							placeholder="Difficulté"
							placeholderIconColor="#007aff"
							selectedValue={this.state.diffSel}
							onValueChange={(a, i)=>this.setState({diffSel: a})}
							style = {{width: "100%"}}>
								<Picker.Item label="Facile"    value={2} />
								<Picker.Item label="Moyen"     value={3} />
								<Picker.Item label="Difficile" value={4} />
						</Picker>
					</View>
				</View> 

			);
		}
		else{
			return(
				<Text style={styles.text}> 
					Battez vous avec un ami sur le même téléphone.
				</Text>
			);
		}
	}
}

const styles = StyleSheet.create({
	form: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(100, 100, 100, 0.7)',
		padding: 10,
		width: '85%',
		margin: 0,
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
		width: '85%',
		justifyContent: 'space-between',
		margin: 10,
	},
	imgBack: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default NewGame;