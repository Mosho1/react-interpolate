import reactInterpolate from './lib/index';
import React from 'react';

class Motion extends reactInterpolate.createClass({
	v: '-(e - b)/2 * (cos(PI * t / d) - 1) + b',
	d: '1000',
	b: 'p_v'
}, {
	startValue: 0
}) {}

class App extends React.Component {
	render() {
		const x = this.state ? this.state.x : null;
		return (
			<div>
				<button onClick={() => this.setState({x: !x})}>clicky</button>
				<Motion expressions={{e: x ? 2 : 0}}>
					{(state) => {
						const {v} = state;
						const r = parseInt(v / 2 * 255, 10);
						const g = parseInt((1 - v / 2) * 255, 10);
						const b = parseInt((1 - v / 2) / 2 * 255, 10);
						const backgroundColor = `rgb(${r}, ${b}, ${g})`;

						return <div style={{width: 200, backgroundColor, height: 100 * v}} />;
					}}
				</Motion>
			</div>);
	}
}

React.render(<App/>, document.getElementById('app'));

export const __hotReload = true;
