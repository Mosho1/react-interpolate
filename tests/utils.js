import {describe, assertEqual, assertDifferent, assert, it} from '../lib/unit-tester';
import * as utils from '../lib/utils';

const stringifyObjectValues = obj => mapValues(obj, v => v.toString());

describe('Utility functions', () => {
	it('should set an object property', () => {

		const set = utils.set;
		assertEqual(set({}, ['a'], 1), {a: 1});
		assertEqual(set({a: {b: 2}}, ['a', 'b'], 1), {a: {b: 1}});
		assertEqual(set({a: {c: 2}}, ['a', 'b'], 1), {a: {b: 1, c: 2}});
		assertEqual(set({a: {c: 2}}, ['a', 'b'], 1), {a: {b: 1, c: 2}});
		assertEqual(set({a: {c: 2}}, ['a', 'b', 'c'], 1), {a: {b: {c: 1}, c: 2}});

		let obj = {a: 3};
		try {
			set(obj, ['a', 'b'], 1);
		} catch(e) {
			assert(e instanceof TypeError);
		} finally {
			assertEqual(obj, {a: 3});
		}

	});

	it('should get an object property', () => {
		const get = utils.get;
		assertEqual(get(), null);
		assertEqual(get({a: 1}), null);
		assertEqual(get({a: 1}, ['a']), 1);
		assertEqual(get({a: {b: 1}}, ['a']), {b: 1});
		assertEqual(get({a: {b: 1}}, ['a', 'b']), 1);
	});

	it('should pick object properties', () => {
		const pick = utils.pick;
		assertEqual(pick({a: 1}, ['a']), {a: 1});
		assertEqual(pick({a: 1, b: 2}, ['a']), {a: 1});
		assertEqual(pick({a: 1, b: {a: 1}}, ['a']), {a: 1});
	});

	it('should omit object properties', () => {
		const omit = utils.omit;
		assertEqual(omit({a: 1}, ['a']), {});
		assertEqual(omit({a: 1, b: 2}, ['a']), {b: 2});
		assertEqual(omit({a: 1, b: {a: 1}}, ['a']), {b: {a: 1}});
	});

	it('should be identity (noop)', () => {
		assertEqual(utils.identity(42), 42);
		assertEqual(utils.identity({a: 42}), {a: 42});
	});

	it('should transform objects', () => {
		const transform = utils.transform;
		assertEqual(transform({}), {});
		assertEqual(transform({a: 1, b: 2}, utils.identity), {a: 1, b: 2});
		assertEqual(transform({a: 1, b: 2}, undefined, utils.identity), {a: 1, b: 2});
		assertEqual(transform({a: 1, b: 2}, utils.identity, utils.identity), {a: 1, b: 2});
		assertDifferent(transform({a: 1, b: 2}, utils.identity, utils.identity), {a: 1, b: 2}, true);
		assertEqual(transform({a: 1, b: 2}, undefined, k => k + '_'), {a_: 1, b_: 2});
		assertEqual(transform({a: 1, b: 2}, v => v * 2), {a: 2, b: 4});
		assertEqual(transform({a: 1, b: 2}, v => v * 2, k => k + '_'), {a_: 2, b_: 4});
	});

	it('should map object values', () => {
		const mapValues = utils.mapValues;
		assertEqual(mapValues({}), {});
		assertEqual(mapValues({a: 1, b: 2}, utils.identity), {a: 1, b: 2});
		assertDifferent(mapValues({a: 1, b: 2}, utils.identity), {a: 1, b: 2}, true);
		assertEqual(mapValues({a: 1, b: 2}, v => v * 2), {a: 2, b: 4});
	});

	it('should map object keys', () => {
		const mapKeys = utils.mapKeys;
		assertEqual(mapKeys({}), {});
		assertEqual(mapKeys({a: 1, b: 2}, utils.identity), {a: 1, b: 2});
		assertDifferent(mapKeys({a: 1, b: 2}, utils.identity), {a: 1, b: 2}, true);
		assertEqual(mapKeys({a: 1, b: 2}, k => k + '_'), {a_: 1, b_: 2});
	});


});
