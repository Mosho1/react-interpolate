const isNode =
	typeof process === 'object' &&
	Object.prototype.toString.call(process) === '[object process]';

const passed = (...args) =>
		isNode
			? console.log('\x1b[32m%s\x1b[0m', ...args)
			: console.log(`%c ${args.join(' ')}`, 'color: #13E836');

const failed = (...args) =>
		isNode
			? console.log('\x1b[31m%s\x1b[0m', ...args)
			: console.log(`%c ${args.join(' ')}`, 'color: ##D81212');	