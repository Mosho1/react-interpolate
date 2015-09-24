import interpolate from './interpolate';
import Parser from './parser';
import React from 'react';
import defaults from 'lodash.defaults';
import get from 'lodash.get';

const measure = fn => {
	const now = performance.now();
	fn();
	console.log('did shit in: ', performance.now() - now, 'ms');
};

export default {
	createClass(expression, options) {
		return class extends React.Component {

			static propTypes = {
				children: React.PropTypes.func
			}

			static defaultProps = defaults(options, {
				expression,
				variable: 't',
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

					defaults(props.map, options.map);

					Object.keys(props.map).forEach(k => {
						const mapping = props.map[k];

						const mapped = typeof mapping === 'function'
							? mapping(get(this.state, 'value'))
							: mapping;

						this.expression = this.expression.substitute(k, mapped.toFixed(6));
					});

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
