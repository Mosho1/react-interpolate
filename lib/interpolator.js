import Simplifier from './simplifier';
import Parser from './parser';
import {omit, set, defaults} from './utils';
import EventEmitter from 'tiny-emitter';

export default class Interpolator extends EventEmitter {
	constructor(options) {
		this.setDefaults(options);
	}

	init(props) {
		this.props = defaults(props, this.defaults);
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
	}

	interpolate(expressions = this.props.expressions, options = this.props) {

		const simplified = simplifier.simplify(expressions);

		let start, rafId;

		const tick = (timestamp) => {

			if (!start) {
				start = timestamp;
			}

			const current = timestamp - start;

			simplified.constants[options.timeVariable] = current;
			const {constants: results} = simplifier(simplified.expressions, simplified.constants);
			this.handleResults(results);
			rafId = raf(tick);
		};

		rafId = raf(tick);

		this.cancel = () => raf.cancel(rafId);

		return this.cancel;
	}
}
