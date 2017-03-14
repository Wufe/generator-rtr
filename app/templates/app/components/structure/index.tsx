import * as React from 'react';
<%-structureStyleImport %> // import './style.scss';
import {Component} from 'react';
import {connect} from 'react-redux';

class Structure extends Component<any, any>{

	constructor( props: any ){
		super( props );
	}

	render(){
		return (
			<div className="structure">
				{this.props.children}
			</div>
		);
	}
}

export default Structure;