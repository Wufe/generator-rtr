declare let window: any;

<%- reduxLoggerImport %> // import * as Logger from 'redux-logger';
<%- reactRouterHistoryImport %> // import {history} from '.';
<%- reactRouterReduxSyncHistoryWithStoreImport %> // import {syncHistoryWithStore} from 'react-router-redux';
<%- reduxSagaImport %> // import {default as Saga} from 'redux-saga';
<%- rootSagaImport %> // import {root as rootSaga} from './sagas';

import {State} from './states';
import {applyMiddleware, createStore, compose, Store} from 'redux';
import {root as rootReducer} from './reducers';

<%= createSagaObject %> // const saga = Saga();

class StoreProvider{

	store: Store<State>;

	constructor( initialState?: State ){

		this.store = createStore(
			rootReducer,
			initialState,
			this.composeMiddlewares()
		);
		<%= runSaga %> //saga.run( rootSaga );
	}

	private composeMiddlewares(){
		return compose(
			applyMiddleware(
				<%= reduxSagaMiddlewareComposition %> // saga,
				...( this.getMiddlewares() )
			),
			window.devToolsExtension ? window.devToolsExtension() : ( f:any ) => f
		);
	}

	private getMiddlewares(): any[]{
		let middlewares: any[] = [ 
			<%= reduxSagaMiddlewareComposition %> // saga,
		 ];
		if( !( process.env.NODE_ENV == "prod" ) ){
			return [ ...middlewares,
				<%= reduxLoggerMiddlewareComposition %> // Logger({ collapsed: true }),
				<%= reduxImmutableStateInvariantMiddlewareComposition %> // ImmutableState(),
			];
		}
		return middlewares;
	}

	get(): Store<State>{
		return this.store;
	}
}

const storeProviderInstance: StoreProvider = new StoreProvider({app: {}});
const store = storeProviderInstance.get();
const dispatch = store.dispatch;

<%= reactRouterReduxSyncHistoryWithStoreInvoke %> // const history = syncHistoryWithStore( browserHistory, store );

export {
	dispatch,
	<%= reactRouterReduxSyncHistoryWithStoreExport %>
	store
};