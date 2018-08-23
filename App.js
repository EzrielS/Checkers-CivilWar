import React from 'react';
import { StyleSheet, Text, View, StatusBar} from 'react-native';
import Landing from './Components/Landing.js';
import NewGame from './Components/NewGame.js';
import Game from './Components/Game.js'

class App extends React.Component {
	constructor(props) {
		super(props);
//		this.state = {page: 'Landing'};
		this.state = {page: 'Game', type: 'IA', diff: null};
//this.doNewGame('IA', 0);
	}
	componentWillMount() {
		this.loadFonts();
		StatusBar.setHidden(true);
	}
	setPage(page){
		this.setState({page: page});
	}
	doNewGame(type, diff=0) {
		this.setState( {page: 'Game', type: type, diff: diff} );
	}
	render() {
			if(this.state.page == 'Landing'){
				return (<Landing setter = {(a)=>this.setPage(a)} />);
			}
			if(this.state.page == 'NewGame'){
				return (<NewGame setter = {(a)=>this.setPage(a)} doNewGame={(a, b)=>this.doNewGame(a, b)} />);
			}
			if(this.state.page == 'Game'){
				return (<Game setter={(a)=>this.setPage(a)} type={this.state.type} diff={this.state.diff} />);
			}

		;
		
	}
	async loadFonts() {
		await Expo.Font.loadAsync({
			Roboto: require("native-base/Fonts/Roboto.ttf"),
			Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
			Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
		});
	}

}



export default App;