import {combineReducers, Reducer} from 'redux';
<%- routingMiddlewareImport %> // import {routerReducer as routing} from 'react-router-redux';
import {default as app} from './app';

const rootReducer: Reducer<any> = combineReducers({
	app,
	<%= routingMiddlewareCombine %>
});

export default rootReducer;