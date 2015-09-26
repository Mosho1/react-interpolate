import Parser from './parser';
import raf from 'raf';
import {defaults} from './utils';

export default function interpolate(expression, options = {}, variables, callback) {

	options = defaults(options, {
		timeVariable: 't',
		resultVariable: 'v',
		precision: 0.01,
		duration: Infinity
	});

	if (typeof expression === 'string') {
		expression = Parser.parse(expression);
	}
	let start, rafId, checkEnded = typeof options.endValue !== 'undefined';

	rafId = raf(function tick(timestamp) {
		if (!start) {
			start = timestamp;
		}

		const current = timestamp - start;

		variables[options.timeVariable] = current;
		const interpolatedValue = expression.evaluate(variables);
		callback({...variables, [options.resultVariable]: interpolatedValue});

		if (!checkEnded && Math.abs(interpolatedValue - options.endValue) > options.precision) {
			checkEnded = true;
		}

		if (current < options.duration &&
			(!checkEnded || Math.abs(interpolatedValue - options.endValue) > options.precision)) {
			rafId = raf(tick);
		} else if (typeof options.endValue !== 'undefined') {
			callback({...variables, [options.resultVariable]: options.endValue});
		}
	});

	return () => raf.cancel(rafId);
}

export const __hotReload = true;
