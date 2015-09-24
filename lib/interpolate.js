import Parser from './parser';
import raf from 'raf';
import defaults from 'lodash.defaults';

export default function interpolate(expression, options = {}, callback) {

	options = defaults(options, {
		variable: 'x',
		percision: 0.01,
		duration: 10000
	});


	if (typeof expression === 'string') {
		expression = Parser.parse(expression);
	}

	let start, rafId, checkEnded = typeof options.endValue !== 'undefined';

	rafId = raf(function tick(timestamp) {

		if (!start) start = timestamp;

		const current = timestamp - start;

		const interpolatedValue = expression.evaluate({
			[options.variable]: current,
			...options.scope
		});

		callback(interpolatedValue);

		if (!checkEnded && Math.abs(interpolatedValue - options.endValue) > options.percision) {
			checkEnded = true;
		}

		if (current < options.duration && 
			(!checkEnded || Math.abs(interpolatedValue - options.endValue) > options.percision)) {
			rafId = raf(tick);
		} else if (typeof options.endValue !== 'undefined') {
			callback(options.endValue);
		}
	});

	return () => raf.cancel(rafId);
}

export const __hotReload = true;