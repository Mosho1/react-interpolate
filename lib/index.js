import Interpolator from './interpolator';
import React from 'react';

export default {
	createClass(expression, options) {

		if (typeof expression === 'string') {
			options.expression = expression;
		} else {
			options = expression;
		}

		return class extends React.Component {

			static propTypes = {
				children: React.PropTypes.func
			}

			constructor(props) {
				super(props);
				this.interpolator = new Interpolator(props, options);
				this.state = this.interpolator.state;
				this.interpolator.on('stateChange', ::this.setState);
			}

			// use shallowEqual?
			componentWillReceiveProps(props) {
				this.interpolator.interpolate(props);
			}

			render() {
				return this.props.children(this.state);
			}
		};
	}
};
