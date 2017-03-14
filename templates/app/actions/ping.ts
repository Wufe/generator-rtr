import {PING} from '../constants';

export
	const ping: () => any
		= () => {
			return {
				type: PING
				};
		};