import interpolate from './interpolate';
import Parser from './parser';
import React from 'react';
import assign from 'lodash.assign';
import defaults from 'lodash.defaults';

const measure = fn => {
	const now = performance.now();
	fn();
	console.log('did shit in: ', performance.now() - now, 'ms')
}

export default {
	createClass(expression, options) {
		return class extends React.Component {

			static propTypes = {
				children: React.PropTypes.func
			}

			static defaultProps = defaults(options, {
				expression,
				variable: 't',
				constants: {},
				scope: {},
				map: {}
			})

			constructor(props) {
				super(props);
				this.setOptions(props);
				this.state = {value: this.expression.evaluate({[props.variable]: 0, ...props.scope})};
				this.tick = this.tick.bind(this);
			}

			// optimisation: memoize this?
			setOptions(props = this.props) {
					this.expression = Parser.parse(expression);

					Object.keys(props.map).forEach(k => 
						this.expression = this.expression.substitute(k, props.map[k]));

					this.expression = this.expression.simplify();
			}

			tick(value) {
				this.setState({value});
			}

			interpolate(props = this.props) {
				if (this.cancel) {
					this.cancel();
				}

				this.cancel = interpolate(this.expression, props, this.tick);
			}

			componentDidMount() {
				this.interpolate();
			}

			// use shallowEqual?
			componentWillReceiveProps(props) {
				this.setOptions(props);
				this.interpolate(props);
			}

			render() {
				return this.props.children(this.state);
			}
		}
	}
};

export const __hotReload = true;
