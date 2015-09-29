import Simplifier from './simplifier';
import Parser from './parser';
import {omit, set, defaults, transform} from './utils';
import EventEmitter from 'tiny-emitter';
import raf from 'raf';

export default class Interpolator extends EventEmitter {
	constructor(options = {}) {
		super();
		this.setDefaults(options).init();
		const simplifier = new Simplifier();

		this.simplify = simplifier.simplify.bind(simplifier);
		this.cancel = this.cancel.bind(this);
		this.config = this.init;
	}

	init(props = {}, state) {
		this.cancel();

		if (props) {
			this.props = defaults(props, this.props || {}, this.defaults);
		}

		if (state) {
			this.state = state;
		}
	}

	setDefaults(options = {}) {
		this.defaults = defaults(options, {
			resultVariable: 'v',
			durationVariable: 'd',
			timeVariable: 't',
			endVariable: 'e',
			startTime: 0
		});

		return this;
	}

	cancel() {
		this.isRunning = false;
		raf.cancel(this.rafId);
	}

	handleResults(results, props = this.props) {

		const duration = props.duration || results[props.durationVariable];

		if (results[props.timeVariable] > duration) {
			this.cancel();
		}

		this.setState(results);
	}

	setState(state) {
		this.state = state;
		this.emit('stateChange', state);
		return this;
	}

	interpolate(expressions = {}, options = {}) {

		defaults(options, this.props);
		defaults(expressions, this.props.expressions);

		const state = transform(this.state, v => v.toString(), k => 'p_' + k);
		Object.assign(expressions, state);

		const simplified = this.simplify(expressions);

		const startTime = {[options.timeVariable]: options.startTime};
		Object.assign(expressions, startTime);

		let start;

		const tick = (timestamp) => {

			if (!start) {
				start = timestamp;
			}

			const current = timestamp - start;

			simplified.constants[options.timeVariable] = current;
			delete simplified.constants[options.resultVariable];

			const {constants: results} = this.simplify(simplified.expressions, simplified.constants);
			this.rafId = raf(tick);
			this.handleResults(results, options);
		};

		this.isRunning = true;
		this.rafId = raf(tick);

		return this.cancel;
	}
}
