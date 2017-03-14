import {watchPing} from './ping';
import {fork} from 'redux-saga/effects';

let rootSaga: () => any 
= function* (){
	yield fork( watchPing );
};

export default rootSaga;