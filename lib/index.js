import interpolate from './interpolate';
import Parser from './parser';
import React from 'react';
import assign from 'lodash.assign';
import defaults from 'lodash.defaults';

export default {
	createClass(expression, options) {
		return class extends React.Component {

			static propTypes = {
				children: React.PropTypes.func
			}

			static defaultProps = defaults(options, {
				variable: 'x',
				constants: {},
				scope: {},
				map: {}
			})

			constructor(props) {
				super(props);
				this.expression = Parser.parse(expression).simplify(props.constants);

				Object.keys(props.map).forEach(k => 
					this.expression = this.expression.substitute(k, props.map[k]));

				this.state = {value: this.expression.evaluate({x: 0, ...props.scope})};
			}

			interpolate(props = this.props) {
				if (this.cancel) {
					this.cancel();
				}
				this.cancel = interpolate(this.expression, props, value => this.setState({value}));
			}

			componentDidMount() {
				this.interpolate();
			}

			componentWillReceiveProps(props) {
				this.interpolate(props);
			}

			render() {
				return this.props.children(this.state);
			}
		}
	}
};

export const __hotReload = true;
