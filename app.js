import reactInterpolate from './lib/index';
import React from 'react';


// class Spring extends reactInterpolate.createClass('(A + B * x) * E ^ (W * x)', {
// 	endValue: 0,
// 	percision: 0.01,
// 	duration: 10000,
// 	map: {
// 		W: -3,
// 		x: 'x / 1000'
// 	}
// }) {
// 	tick(value) {
// 		this.savedValue = value;
// 		return super.tick(value);
// 	}

// 	componentWillReceiveProps(props) {
// 		props.scope.A = this.savedValue;
// 		super.componentWillReceiveProps(props)
// 	}
// };

class Motion extends reactInterpolate.createClass('-c/2 * (cos(PI * t / d) - 1) + b', {
	duration: 1000,
	endValue: 2,
	map: {
		c: 2,
		d: 1000,
		b: 0,
	}
}) {}

class App extends React.Component {
	render() {
		return (
			<div>
				<button onClick={() => this.forceUpdate()}>clicky</button>
				<Motion>
					{({value}) => {
						console.log(value)
						return <div style={{width: 200, backgroundColor: 'red', height: 100 * value}} />;
					}}
				</Motion>
			</div>);
	}
}

React.render(<App/>, document.getElementById('app'));

export const __hotReload = true;
