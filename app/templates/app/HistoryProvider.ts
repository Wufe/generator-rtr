const createBrowserHistory = require('history/createBrowserHistory').default;
import * as ReactRouter from 'react-router';

class HistoryProvider{

	appHistory: History & any;

	constructor(){
		this.appHistory = createBrowserHistory({});
	}

	get(){
		return this.appHistory;
	}
}

const historyProviderInstance = new HistoryProvider();
const browserHistory = historyProviderInstance.get();

export {browserHistory};