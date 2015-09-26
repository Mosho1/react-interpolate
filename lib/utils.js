export const set = (obj, key, value) => {
	obj[key] = value;
	return obj;
};

export const pick = (obj, toPick, cond = true) => {

	if (typeof toPick !== 'function') {
		const toPickArray = [].concat(toPick);
		toPick = (val, k) => toPickArray.indexOf(k) !== -1;
	}

	return Object.keys(obj).reduce((newObj, k) =>
		toPick(obj[k], k) == cond
			? set(newObj, k, obj[k])
			: newObj,
		{});
};

export const omit = (obj, toOmit) => pick(obj, toOmit, false);

export const defaults = (target, ...sources) => {
	if (typeof sources[0] === 'undefined') {
		return target;
	}
	sources.forEach(src =>
		Object.keys(src).forEach(k => {
			if (!target.hasOwnProperty(k)) {
				target[k] = src[k];
				return;
			}

			if (typeof target[k] === 'object' &&
				typeof src[k] === 'object') {
				target[k] = defaults(target[k], src[k]);
			}
		}));

	return target;
};

export const mapValues = (obj, fn) => {
	const ret = {};
	for (let k in obj) {
		if (obj.hasOwnProperty(k)) {
			ret[k] = fn(obj[k], k);
		}
	}
	return ret;
};

export const partition = (obj, fn) => [pick(obj, fn), omit(obj, fn)];
