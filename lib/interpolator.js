import interpolate from './interpolate';
import Parser from './parser';
import {omit, set, defaults} from './utils';
import EventEmitter from 'tiny-emitter';

export default class Interpolator extends EventEmitter {

	constructor(props, options) {
		super();

		if (options) {
			this.setDefaults(options);
		}
		if (props) {
			this.setInitialState(props);
		}

		this.setState = this.setState.bind(this);
	}

	setInitialState(props) {

		props = this.setProps(props);

		const initialState = {
			[props.timeVariable]: props.startTime,
			[props.resultVariable]: props.startValue,
			...props.map
		};

		this.setExpression(props, initialState);

		// initial state with initial result of the evaluated expression
		this.state = set(initialState,
						props.resultVariable,
						this.expression.evaluate(initialState));
	}

	// reduces the variables in the expression to just time. should be able to take care of multiple
	// dependencies by recursing until there is no change
	simplifyExpression(expression = this.expression, variables) {
		const numVariables = expression.variables().length;

		variables = omit(variables, [this.props.timeVariable]);

		Object.keys(variables).forEach(k =>	expression = expression.substitute(k, variables[k]));

		const simplified = expression.simplify();

		return simplified.variables().length === numVariables
			? simplified
			: this.simplifyExpression(simplified, variables);
	}

	// optimisation: memoize this?
	// makes all the adjustments to the expression
	setExpression(props = this.props, state = this.state) {
		this.expression = Parser.parse(props.expression);
		this.expression = this.simplifyExpression(this.expression, Object.assign(state, props.map));

		return this.expression;
	}

	// happens each interpolation
	setState(state) {
		this.state = state;
		this.emit('stateChange', state);
	}

	setDefaults(options) {
		this.defaults = defaults(options, {
			resultVariable: 'v',
			durationVariable: 'd',
			timeVariable: 't',
			endVariable: 'e',
			startTime: 0,
		});
	}

	// some defaults
	setProps(props) {
		this.props = defaults(props, this.defaults);
		if (typeof props.map[props.durationVariable] === 'number' &&
			typeof props.duration === 'undefined') {
			this.props.duration = props.map[props.durationVariable];
		}

		this.props.endValue = props.endValue || props.map[props.endVariable];

		return this.props;
	}

	interpolate(props = this.props, state = this.state) {
		props = this.setProps(props);
		this.setExpression(props);

		// cancel previous interpolation
		if (this.cancel) {
			this.cancel();
		}
		// console.log(this.expression.toString(), props, state)
		this.cancel = interpolate(this.expression, props, state, this.setState);
	}
}
