import {Home, Structure} from './components';
import {loader} from './lib';
import * as React from 'react';
import * as ReactRouter from 'react-router';
import {browserHistory, IndexRoute, Route, Router} from 'react-router';
import {history} from './StoreProvider';

export const PATH_INDEX = '/';
export const PATH_HOME = '/home';

export type Routing = {
	pathname?: string;
	search?: string;
	query?: { [key: string]: any; };
	state?: Object;
	action?: string;
	key?: string;
	hash?: string;
	basename?: string;
};

class RouteProvider{

	get(){
		return (
			<Router history={history}>
				<Structure>
					<Route path={PATH_INDEX} component={Home} />
					<Route path={PATH_HOME} component={Home} />
				</Structure>
			</Router>
		);
	}

	goto( route: string ){
		browserHistory.push( route );
	}

}

const routeProviderInstance: RouteProvider = new RouteProvider();
const routes: any = routeProviderInstance.get();
const goto: ( route: string ) => void = routeProviderInstance.goto;

export{
	goto,
	RouteProvider,
	routeProviderInstance,
	routes
}