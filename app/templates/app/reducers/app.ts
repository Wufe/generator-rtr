import {IApp, app} from '../states';
import {PING, PING_SUCCEEDED, PING_FAILED} from '../constants';
import {Reducer} from 'redux';

const appReducer: ( state: IApp, action: any ) => IApp =
	function( state = app, action ){

		let {payload} = action;
		let {error} = action;

		switch( action.type ){
			case PING_SUCCEEDED:
				return Object.assign({}, state);
            case PING_FAILED:
                return Object.assign({}, state);
			default:
				return state;
		}
	};

export default appReducer;