import {takeEvery, takeLatest} from 'redux-saga';
import {put} from 'redux-saga/effects';
import {PING, PING_SUCCEEDED, PING_FAILED} from '../constants';

let watchPing: () => any
    = function* (){
        yield* takeEvery( PING, sendPing );
    };

let sendPing: () => any 
    = function* (){
        try{
            // attach your API here with a yield 
            // e.g.
            // const payload = yield API.DoIt();
            // yield put( Actions.DidIt( payload ) )
            yield put( pingSucceeded() ); 
        }catch( error ){
            yield put( pingFailed() );
        }
    };

let pingSucceeded: () => any
    = () => {
		return {
			type: PING_SUCCEEDED
		};
	};

let pingFailed: () => any 
    = () => {
		return {
			type: PING_FAILED
		};
	};

export {
    watchPing
};