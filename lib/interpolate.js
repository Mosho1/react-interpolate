import Parser from './parser';
import raf from 'raf';
import {defaults} from './utils';
import Simplifier from './simplifier';

const simplifier = new Simplifier();

export default function interpolate(expressions, options, callback) {

	options = defaults(options, {
		timeVariable: 't'
	});

	const simplified = simplifier.simplify(expressions);

	let start, rafId;

	rafId = raf(function tick(timestamp) {
		if (!start) {
			start = timestamp;
		}

		const current = timestamp - start;

		simplified.constants[options.timeVariable] = current;
		const {constants: results} = simplifier(simplified.expressions, simplified.constants);
		callback(results);
		rafId = raf(tick);
	});

	return () => raf.cancel(rafId);
}
