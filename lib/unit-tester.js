import deepEqual from 'deep-equal';

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

const doTest = async (fn) => {
	try {
		await fn();
	} catch(e) {
		console.log(e.stack || e);
		failedAssertions++;
	}
};

export const describe = async (label, fn) => {
	console.group(label);
	await fn();
	console.groupEnd(label);
};

const postIt = label => {
	console.group(label);
	summary();
	console.groupEnd();
};

export const it = async (label, fn) => {
	await doTest(fn);
	postIt(label);
};


export const assert = v => v === true
	? passedAssertions++
	: failed('Assertion failed!');

export const assertEqual = (v1, v2, byRef) => {

	const isEqual = byRef ? v1 === v2 : deepEqual(v1, v2);

	isEqual
		? passedAssertions++
		: failed(`Expected: ${JSON.stringify(v2, null, 2)}\nSaw: ${JSON.stringify(v1, null, 2)}`);

	return isEqual;
};

export const assertDifferent = (v1, v2, byRef) => {

	const isEqual = byRef ? v1 === v2 : deepEqual(v1, v2);

	isEqual
		? failed(`Expected: ${JSON.stringify(v2, null, 2)}\nSaw: ${JSON.stringify(v1, null, 2)}`)
		: passedAssertions++;

	return isEqual;
};

export const spy = fn => {
	const spyFn = (...args) => {
		spyFn.calls++;
		spyFn.args = args;
		if (fn) {
			return fn(...args);
		}
	};
	spyFn.calls = 0;
	spyFn.reset = () => {
		spyFn.args = undefined;
		spyFn.calls = 0;
	};
	return spyFn;
};

export const dummy = spy;
