if (!console.group) {
	require('./console-group').install();
}

let passedAssertions = 0;
let failedAssertions = 0;

const isNode =
	typeof process === 'object' &&
	Object.prototype.toString.call(process) === '[object process]';

const summary = () => {
		isNode
			? 	(passedAssertions && console.log('\x1b[32m%s\x1b[0m',
					`${passedAssertions} Assertion(s) passed`)) ||
				(failedAssertions && console.log('\x1b[31m%s\x1b[0m',
					`${failedAssertions} Assertion(s) failed.`))
			: 	console.log(`%c ${args.join(' ')}`, 'color: #13E836');
		passedAssertions = 0;
		failedAssertions = 0;
};

const failed = (...args) => {
		failedAssertions++;
		console.group('\x1b[31m%s\x1b[0m', 'Assertion failed!');

		isNode
			? console.log(...args)
			: console.log(`%c ${args.join(' ')}`, 'color: ##D81212');
		console.groupEnd();
};

const doTest = (fn) => {
	try {
		fn();
	} catch(e) {
		console.log(e.stack || e);
		failedAssertions++;
	}
};

export const describe = (label, fn) => {
	console.group(label);
	doTest(fn);
	console.groupEnd(label);
};

export const it = (label, fn) => {
	console.group(label);
	doTest(fn);
	summary();
	console.groupEnd(label);
};

export const assert = v => v === true
	? passedAssertions++
	: failed('Assertion failed!');

export const assertEqual = (v1, v2) => {
	JSON.stringify(v1) === JSON.stringify(v2)
		? passedAssertions++
		: failed(`Expected: ${JSON.stringify(v2, null, 2)}\nSaw: ${JSON.stringify(v1, null, 2)}`)
};
