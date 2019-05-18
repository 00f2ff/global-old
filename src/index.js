import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as util from './util.js';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './components/Game';
import * as serviceWorker from './serviceWorker';

// todo: define more of this elsewhere (figure out how to balance util and index defs)
const initialState = {
	network: util.populateNetwork(),
	utils: {
		dimensions: util.dimensions,
		resources: util.resources,
		locationSize: util.locationSize,
	},
}

// todo: use switch statements based on the action type to determine how state should be returned
// https://daveceddia.com/how-does-redux-work/
const reducer = (state = initialState, action) => {
	return state;
}

const store = createStore(reducer);

ReactDOM.render(
	<Provider store={store}><Game/></Provider>, 
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
