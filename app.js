import reactInterpolate from './lib/index';
import React from 'react';


class Spring extends reactInterpolate.createClass('(A + B * x) * E ^ (W * x)', {
	constants: {
		W: -3,
	},
	endValue: 0,
	percision: 0.01,
	duration: 10000,
	map: {x: 'x / 1000'}
}) {
	tick(value) {
		this.savedValue = value;
		return super.tick(value);
	}

	componentWillReceiveProps(props) {
		props.scope.A = this.savedValue;
		super.componentWillReceiveProps(props)
	}
};

class App extends React.Component {
	constructor() {
		super();
		this.parameters = {B: 10, A: 2};
	}
	render() {
		return (
			<div>
				<button onClick={() => this.forceUpdate()}>clicky</button>
				<Spring scope={this.parameters}>
					{({value}) => {
						return <div style={{width: 200, backgroundColor: 'red', height: 100 * value}} />;
					}}
				</Spring>
			</div>);
	}
}

React.render(<App/>, document.getElementById('app'));

export const __hotReload = true;
