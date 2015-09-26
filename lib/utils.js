export const set = (obj, key, value) => {
	obj[key] = value;
	return obj;
};

export const omit = (obj, toOmit) => {
	toOmit = [].concat(toOmit);
	return Object.keys(obj).reduce((newObj, k) =>
		toOmit.indexOf(k) === -1
			? set(newObj, k, obj[k])
			: newObj, 
		{});
};


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
