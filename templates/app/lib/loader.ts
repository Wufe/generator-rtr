import {ReactType} from 'react';
import {RouterState} from 'react-router';

declare let require: any;

export type ICallback = ( error: any, component?: ReactType | any ) => void;

export type IRequestHandler = ( nextState: RouterState, callback: ICallback ) => undefined;

let moduleRequest: ( module: any ) => void;

const loader: ( route: string ) => IRequestHandler = 
	function( route ){
		return function( nextState, callback ){
			switch( route ){
				case "home":
					moduleRequest = require( 'bundle-loader?name=index.route!../components/home' );
					break;
			}
			moduleRequest( ( module: any ) => {
				callback( null, module.default );
			});
			return undefined;
		};
	};

export {loader};