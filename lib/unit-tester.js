import {passed, failed} from './logger';

export const describe = (label, fn) => {
	console.group(label);
	try {
		fn();
	} catch(e) {
		console.error(e);
	}
	console.groupEnd(label);
};

export const it = describe;

export const assert = v => v === true
	? passed('assertion passed', 'color: "green"')
	: failed('Assertion failed!');
