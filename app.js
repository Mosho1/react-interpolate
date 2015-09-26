import reactInterpolate from './lib/index';
import React from 'react';

class Motion extends reactInterpolate.createClass('-(e - b)/2 * (cos(PI * t / d) - 1) + b', {
	startValue: 0,
	map: {
		d: '200 + 200 * (2 - v)',
		b: 'v'
	}
}) {}

class App extends React.Component {
	render() {
		const x = this.state ? this.state.x : null;
		return (
			<div>
				<button onClick={() => this.setState({x: !x})}>clicky</button>
				<Motion map={{e: x ? 2 : 0}}>
					{({v}) => {
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
